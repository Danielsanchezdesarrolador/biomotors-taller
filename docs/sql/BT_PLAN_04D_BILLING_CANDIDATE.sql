-- CANDIDATE ONLY after 04B/04C. Provider, approval, pricing policy and live billing remain OFF.
BEGIN;
CREATE TABLE bt_platform_private.billing_control (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton), enabled boolean NOT NULL DEFAULT false,
 provider text, max_extra_seats integer CHECK(max_extra_seats>=0)
);
INSERT INTO bt_platform_private.billing_control(singleton) VALUES(true);
CREATE TABLE bt_platform_private.billing_customers (
 provider text NOT NULL, customer_id text NOT NULL, user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
 subscription_id text NOT NULL, last_version bigint NOT NULL DEFAULT 0, PRIMARY KEY(provider,customer_id), UNIQUE(provider,subscription_id)
);
CREATE TABLE bt_platform_private.billing_events (
 provider text NOT NULL, event_id text NOT NULL, user_id uuid NOT NULL REFERENCES auth.users(id),
 payload jsonb NOT NULL, receipt jsonb NOT NULL, recorded_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(provider,event_id)
);
ALTER TABLE bt_platform_private.billing_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.billing_control FORCE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.billing_customers FORCE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.billing_events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON bt_platform_private.billing_control,bt_platform_private.billing_customers,bt_platform_private.billing_events FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.bt_plan04_apply_billing(p_provider text,p_event_id text,p_customer text,p_subscription text,
 p_version bigint,p_kind text,p_plan text,p_extras integer,p_period_end timestamptz,p_subtotal integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE control bt_platform_private.billing_control%ROWTYPE; customer bt_platform_private.billing_customers%ROWTYPE;
 entitlement bt_platform_private.account_entitlements%ROWTYPE; prior bt_platform_private.billing_events%ROWTYPE;
 payload jsonb; receipt jsonb; expected integer; new_state text:='active'; expiry timestamptz; req uuid:=gen_random_uuid();
BEGIN
 IF coalesce(auth.jwt()->>'role','')<>'service_role' THEN RAISE EXCEPTION 'Verified backend required' USING ERRCODE='42501'; END IF;
 SELECT * INTO control FROM bt_platform_private.billing_control WHERE singleton;
 IF NOT coalesce(control.enabled,false) OR control.provider IS DISTINCT FROM p_provider THEN RAISE EXCEPTION 'Billing disabled' USING ERRCODE='42501'; END IF;
 IF p_event_id IS NULL OR p_event_id !~ '^[a-zA-Z0-9_-]{1,120}$' OR p_customer IS NULL OR p_subscription IS NULL OR
  p_version IS NULL OR p_version<1 OR p_kind IS NULL OR p_kind NOT IN('activated','renewed','payment_failed','expired','canceled','refunded','reconciled') OR
  p_plan IS NULL OR p_plan NOT IN('plus','full') OR p_extras IS NULL OR p_extras<0 OR p_period_end IS NULL OR p_subtotal IS NULL OR p_subtotal<0 THEN
  RAISE EXCEPTION 'Invalid normalized billing event' USING ERRCODE='22023'; END IF;
 SELECT * INTO customer FROM bt_platform_private.billing_customers WHERE provider=p_provider AND customer_id=p_customer FOR UPDATE;
 IF customer.user_id IS NULL OR customer.subscription_id<>p_subscription THEN RAISE EXCEPTION 'Unknown billing mapping' USING ERRCODE='42501'; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('bt_account:'||customer.user_id::text,0));
 payload:=jsonb_build_array(p_customer,p_subscription,p_version,p_kind,p_plan,p_extras,p_period_end,p_subtotal);
 SELECT * INTO prior FROM bt_platform_private.billing_events WHERE provider=p_provider AND event_id=p_event_id;
 IF FOUND THEN
  IF prior.user_id<>customer.user_id OR prior.payload<>payload THEN RAISE EXCEPTION 'Event conflict' USING ERRCODE='23505'; END IF;
  RETURN prior.receipt;
 END IF;
 IF p_version<=customer.last_version THEN RAISE EXCEPTION 'Out of order; reconcile provider state' USING ERRCODE='23505'; END IF;
 SELECT * INTO entitlement FROM bt_platform_private.account_entitlements WHERE user_id=customer.user_id FOR UPDATE;
 IF entitlement.source='manual' AND entitlement.state='active' AND
  (entitlement.is_lifetime OR entitlement.expires_at IS NULL OR entitlement.expires_at>now()) THEN
  -- An extra-seat purchase may coexist with a free permanent/manual base grant.
  -- It never changes or extends the manual base entitlement.
  IF p_extras>0 OR p_kind IN('expired','refunded') OR EXISTS(
    SELECT 1 FROM bt_platform_private.mechanic_extras WHERE workshop_id=entitlement.bound_workshop_id AND provider_reference=p_subscription) THEN
   IF entitlement.bound_workshop_id IS NULL OR NOT EXISTS(SELECT 1 FROM public.workshop_memberships
     WHERE workshop_id=entitlement.bound_workshop_id AND user_id=customer.user_id AND role='owner' AND status='active') THEN
    RAISE EXCEPTION 'Bound license holder required for extras' USING ERRCODE='42501'; END IF;
   IF p_kind IN('activated','renewed','reconciled') THEN
    IF control.max_extra_seats IS NULL OR p_extras>control.max_extra_seats OR p_period_end<=now()
      OR p_plan<>entitlement.plan OR p_subtotal<>p_extras*200 THEN RAISE EXCEPTION 'Manual extra subtotal or policy mismatch' USING ERRCODE='22023'; END IF;
    INSERT INTO bt_platform_private.mechanic_extras(workshop_id,seats,expires_at,provider_reference)
    VALUES(entitlement.bound_workshop_id,p_extras,p_period_end,p_subscription)
    ON CONFLICT(workshop_id) DO UPDATE SET seats=excluded.seats,expires_at=excluded.expires_at,provider_reference=excluded.provider_reference;
   ELSIF p_kind IN('expired','refunded') THEN
    UPDATE bt_platform_private.mechanic_extras SET seats=0,expires_at=now() WHERE workshop_id=entitlement.bound_workshop_id AND provider_reference=p_subscription;
   END IF;
  END IF;
  receipt:=jsonb_build_object('state','manual_grant_protected');
 ELSIF p_kind IN('payment_failed','canceled') THEN
  receipt:=jsonb_build_object('state',p_kind,'accessUntil',entitlement.expires_at);
 ELSE
  IF p_extras>0 AND (control.max_extra_seats IS NULL OR p_extras>control.max_extra_seats OR entitlement.bound_workshop_id IS NULL) THEN
   RAISE EXCEPTION 'Extra seat policy or bound workshop required' USING ERRCODE='22023'; END IF;
  IF p_kind IN('expired','refunded') THEN new_state:='revoked'; expiry:=now();
  ELSE
   IF p_period_end<=now() THEN RAISE EXCEPTION 'Active paid period required' USING ERRCODE='22023'; END IF;
   expected:=(CASE p_plan WHEN 'plus' THEN 500 ELSE 1500 END)+200*p_extras;
   IF p_subtotal<>expected THEN RAISE EXCEPTION 'Subtotal mismatch; reconcile provider' USING ERRCODE='22023'; END IF;
   expiry:=p_period_end;
  END IF;
  IF entitlement.bound_workshop_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.workshop_memberships
   WHERE workshop_id=entitlement.bound_workshop_id AND user_id=customer.user_id AND role='owner' AND status='active') THEN
   RAISE EXCEPTION 'License holder mapping invalid' USING ERRCODE='42501'; END IF;
  INSERT INTO bt_platform_private.account_entitlements(user_id,plan,state,source,is_lifetime,expires_at)
  VALUES(customer.user_id,p_plan,new_state,'billing',false,expiry)
  ON CONFLICT(user_id) DO UPDATE SET plan=excluded.plan,state=excluded.state,source='billing',is_lifetime=false,expires_at=expiry,updated_at=now();
  PERFORM bt_platform_private.sync_entitlement(customer.user_id,req,customer.user_id,'Verified normalized billing event');
  IF entitlement.bound_workshop_id IS NOT NULL THEN
   INSERT INTO bt_platform_private.mechanic_extras(workshop_id,seats,expires_at,provider_reference)
   VALUES(entitlement.bound_workshop_id,CASE WHEN new_state='active' THEN p_extras ELSE 0 END,expiry,p_subscription)
   ON CONFLICT(workshop_id) DO UPDATE SET seats=excluded.seats,expires_at=excluded.expires_at,provider_reference=excluded.provider_reference;
  END IF;
  receipt:=jsonb_build_object('state','applied','subtotalCents',p_subtotal,'currency','USD','payer','license_holder');
 END IF;
 INSERT INTO bt_platform_private.billing_events VALUES(p_provider,p_event_id,customer.user_id,payload,receipt,now());
 UPDATE bt_platform_private.billing_customers SET last_version=p_version WHERE provider=p_provider AND customer_id=p_customer;
 RETURN receipt;
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_apply_billing(text,text,text,text,bigint,text,text,integer,timestamptz,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_plan04_apply_billing(text,text,text,text,bigint,text,text,integer,timestamptz,integer) TO service_role;
COMMIT;
