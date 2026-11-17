-- BT-PLAN-04A candidate ONLY. Do not run on hosted Supabase without explicit authorization.
-- Additive: the existing workshop subscriptions, memberships and all CP03-CP05 records stay untouched.
CREATE SCHEMA IF NOT EXISTS bt_platform_private;
REVOKE ALL ON SCHEMA bt_platform_private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS bt_platform_private.account_entitlements (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan text NOT NULL CHECK (plan IN ('basic','plus','full')),
  state text NOT NULL CHECK (state IN ('active','revoked')),
  source text NOT NULL CHECK (source IN ('manual','billing','trial')),
  is_lifetime boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  bound_workshop_id uuid UNIQUE REFERENCES public.workshops(id) ON DELETE RESTRICT,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bt_account_lifetime_no_expiry CHECK (NOT is_lifetime OR expires_at IS NULL),
  CONSTRAINT bt_account_basic_not_lifetime CHECK (plan <> 'basic' OR NOT is_lifetime)
);
CREATE TABLE IF NOT EXISTS bt_platform_private.account_entitlement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  mode text NOT NULL,
  reason text NOT NULL,
  previous_state jsonb,
  next_state jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bt_account_events_recent
  ON bt_platform_private.account_entitlement_events(user_id, recorded_at DESC);

ALTER TABLE bt_platform_private.account_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.account_entitlements FORCE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.account_entitlement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.account_entitlement_events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA bt_platform_private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA bt_platform_private FROM PUBLIC, anon, authenticated;

-- Self-only plan lookup. A workshop plan is only returned after verifying the caller's active membership.
-- No user-supplied ID can impersonate another account or obtain another workshop's plan.
CREATE OR REPLACE FUNCTION public.bt_plan04_my_status(p_workshop_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE
  v_uid uuid := auth.uid();
  v_personal bt_platform_private.account_entitlements%ROWTYPE;
  v_workshop bt_platform_private.subscriptions%ROWTYPE;
  v_personal_plan text := 'basic';
  v_scope text := 'personal';
  v_plan text := 'basic';
  v_lifetime boolean := false;
  v_expiry timestamptz := NULL;
BEGIN
  IF v_uid IS NULL OR NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id=v_uid AND u.email_confirmed_at IS NOT NULL
  ) THEN RAISE EXCEPTION 'Confirmed session required' USING ERRCODE='42501'; END IF;

  SELECT * INTO v_personal FROM bt_platform_private.account_entitlements WHERE user_id=v_uid;
  IF v_personal.user_id IS NOT NULL AND v_personal.state='active'
     AND (v_personal.is_lifetime OR v_personal.expires_at IS NULL OR v_personal.expires_at>now()) THEN
    v_personal_plan := v_personal.plan;
  END IF;
  v_plan := v_personal_plan;
  v_lifetime := coalesce(v_personal.is_lifetime,false) AND v_personal_plan<>'basic';
  IF v_personal_plan<>'basic' AND NOT v_lifetime THEN v_expiry := v_personal.expires_at; END IF;

  IF p_workshop_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
      WHERE m.user_id=v_uid AND m.workshop_id=p_workshop_id
        AND m.status='active' AND w.status='active'
    ) THEN RAISE EXCEPTION 'Workshop not authorized' USING ERRCODE='42501'; END IF;
    v_scope := 'workshop';
    v_plan := 'basic';
    v_lifetime := false;
    v_expiry := NULL;
    SELECT * INTO v_workshop FROM bt_platform_private.subscriptions WHERE workshop_id=p_workshop_id;
    IF v_workshop.workshop_id IS NOT NULL AND v_workshop.state='active'
       AND (v_workshop.is_lifetime OR v_workshop.expires_at IS NULL OR v_workshop.expires_at>now()) THEN
      v_plan := v_workshop.plan;
      v_lifetime := v_workshop.is_lifetime;
      v_expiry := v_workshop.expires_at;
    END IF;
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'scope',v_scope,'effectivePlan',v_plan,'personalPlan',v_personal_plan,
    'isLifetime',v_lifetime,'expiresAt',v_expiry,'workshopId',p_workshop_id
  );
END;
$fn$;
REVOKE ALL ON FUNCTION public.bt_plan04_my_status(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_my_status(uuid) TO authenticated;

-- Search of VERIFIED users is reserved to Creator, not to workshop owners.
-- Only minimum account display fields are returned; never DOB, passwords, customer or vehicle records.
CREATE OR REPLACE FUNCTION public.bt_creator04_accounts(p_query text DEFAULT '', p_limit integer DEFAULT 25)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE
  v_query text := lower(btrim(coalesce(p_query,'')));
  v_accounts jsonb;
BEGIN
  IF NOT public.bt_creator_is_creator() THEN
    RAISE EXCEPTION 'Creator only' USING ERRCODE='42501';
  END IF;
  IF length(v_query)>120 OR p_limit IS NULL OR p_limit<1 OR p_limit>50 THEN
    RAISE EXCEPTION 'Invalid search' USING ERRCODE='22023';
  END IF;
  SELECT coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'userId', a.id, 'email', a.email, 'displayName', a.display_name,
    'personalPlan', a.effective_plan, 'isLifetime', a.is_lifetime,
    'expiresAt', a.expires_at, 'workshopCount', a.owner_count
  ) ORDER BY a.created_at DESC), '[]'::jsonb) INTO v_accounts
  FROM (
    SELECT u.id, u.email, u.created_at,
      coalesce(NULLIF(p.display_name,''),nullif(u.raw_user_meta_data->>'full_name',''), 'Cuenta sin nombre') AS display_name,
      CASE WHEN e.state='active' AND (e.is_lifetime OR e.expires_at IS NULL OR e.expires_at>now())
        THEN e.plan ELSE 'basic' END AS effective_plan,
      CASE WHEN e.state='active' AND (e.is_lifetime OR e.expires_at IS NULL OR e.expires_at>now())
        THEN e.is_lifetime ELSE false END AS is_lifetime,
      CASE WHEN e.state='active' AND (e.is_lifetime OR e.expires_at IS NULL OR e.expires_at>now())
        THEN e.expires_at ELSE NULL END AS expires_at,
      (SELECT count(*) FROM public.workshop_memberships m
       WHERE m.user_id=u.id AND m.role='owner' AND m.status='active') AS owner_count
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id=u.id
    LEFT JOIN bt_platform_private.account_entitlements e ON e.user_id=u.id
    WHERE u.email_confirmed_at IS NOT NULL
      AND (v_query='' OR position(v_query in lower(coalesce(u.email,'')))>0
        OR position(v_query in lower(coalesce(p.display_name,'')))>0
        OR position(v_query in lower(coalesce(u.raw_user_meta_data->>'full_name','')))>0)
    ORDER BY u.created_at DESC LIMIT p_limit
  ) a;
  RETURN v_accounts;
END;
$fn$;
REVOKE ALL ON FUNCTION public.bt_creator04_accounts(text,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bt_creator04_accounts(text,integer) TO authenticated;

-- Idempotent, audited Creator-only personal entitlements. No workshop membership is changed here.
CREATE OR REPLACE FUNCTION public.bt_creator04_manage_account(
  p_user_id uuid, p_plan text, p_mode text, p_days integer, p_reason text, p_request_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE
  v_actor uuid := auth.uid();
  v_old bt_platform_private.account_entitlements%ROWTYPE;
  v_plan text;
  v_state text;
  v_lifetime boolean;
  v_expiry timestamptz;
  v_new jsonb;
  v_existing record;
BEGIN
  IF v_actor IS NULL OR NOT public.bt_creator_is_creator() THEN
    RAISE EXCEPTION 'Creator only' USING ERRCODE='42501'; END IF;
  IF coalesce(auth.jwt()->>'aal','') <> 'aal2' THEN
    RAISE EXCEPTION 'MFA_REQUIRED' USING ERRCODE='42501'; END IF;
  IF p_user_id IS NULL OR p_request_id IS NULL OR p_reason IS NULL
     OR length(btrim(p_reason)) NOT BETWEEN 5 AND 240 THEN
    RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  IF p_mode IS NULL OR p_mode NOT IN ('basic','revoke','grant_days','extend_days','lifetime')
     OR p_plan IS NULL OR p_plan NOT IN ('basic','plus','full') THEN
    RAISE EXCEPTION 'Invalid plan' USING ERRCODE='22023'; END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users u
                 WHERE u.id=p_user_id AND u.email_confirmed_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Verified account not found' USING ERRCODE='22023'; END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('bt_account:' || p_user_id::text,0));
  SELECT e.actor_id, e.user_id, e.next_state INTO v_existing
  FROM bt_platform_private.account_entitlement_events e WHERE e.request_id=p_request_id;
  IF FOUND THEN
    IF v_existing.actor_id<>v_actor OR v_existing.user_id<>p_user_id THEN
      RAISE EXCEPTION 'Request id reused' USING ERRCODE='23505'; END IF;
    RETURN v_existing.next_state;
  END IF;
  SELECT * INTO v_old FROM bt_platform_private.account_entitlements
    WHERE user_id=p_user_id FOR UPDATE;
  IF v_old.bound_workshop_id IS NOT NULL THEN
    RAISE EXCEPTION 'Bound subscriptions require workshop synchronization (04B)' USING ERRCODE='42501';
  END IF;

  IF p_mode='basic' THEN
    IF p_plan<>'basic' THEN RAISE EXCEPTION 'Basic plan required' USING ERRCODE='22023'; END IF;
    v_plan:='basic'; v_state:='active'; v_lifetime:=false; v_expiry:=NULL;
  ELSIF p_mode='revoke' THEN
    IF v_old.user_id IS NULL OR v_old.state<>'active' OR v_old.plan='basic' THEN
      RAISE EXCEPTION 'No active plan to revoke' USING ERRCODE='22023'; END IF;
    v_plan:=v_old.plan;v_state:='revoked';v_lifetime:=false;v_expiry:=now();
  ELSE
    IF p_plan NOT IN ('plus','full') THEN
      RAISE EXCEPTION 'Plus or Full required' USING ERRCODE='22023'; END IF;
    v_plan:=p_plan;v_state:='active';
    IF p_mode='lifetime' THEN v_lifetime:=true;v_expiry:=NULL;
    ELSE
      IF p_days IS NULL OR p_days NOT BETWEEN 1 AND 3650 THEN
        RAISE EXCEPTION 'Days must be between 1 and 3650' USING ERRCODE='22023'; END IF;
      v_lifetime:=false;
      IF p_mode='extend_days' THEN
        IF v_old.user_id IS NULL OR v_old.state<>'active' OR v_old.plan<>p_plan
           OR v_old.is_lifetime OR v_old.expires_at IS NULL THEN
          RAISE EXCEPTION 'Only same active temporary plan may extend' USING ERRCODE='22023'; END IF;
        v_expiry:=pg_catalog.greatest(now(),v_old.expires_at)+pg_catalog.make_interval(days=>p_days);
      ELSE v_expiry:=now()+pg_catalog.make_interval(days=>p_days);
      END IF;
    END IF;
  END IF;

  INSERT INTO bt_platform_private.account_entitlements AS e
    (user_id,plan,state,source,is_lifetime,expires_at,updated_by,updated_at)
  VALUES (p_user_id,v_plan,v_state,'manual',v_lifetime,v_expiry,v_actor,now())
  ON CONFLICT (user_id) DO UPDATE SET
    plan=excluded.plan,state=excluded.state,source=excluded.source,
    is_lifetime=excluded.is_lifetime,expires_at=excluded.expires_at,
    updated_by=excluded.updated_by,updated_at=now()
  RETURNING pg_catalog.to_jsonb(e.*) INTO v_new;

  INSERT INTO bt_platform_private.account_entitlement_events
    (request_id,user_id,actor_id,mode,reason,previous_state,next_state)
  VALUES (p_request_id,p_user_id,v_actor,p_mode,btrim(p_reason),
    CASE WHEN v_old.user_id IS NULL THEN NULL ELSE pg_catalog.to_jsonb(v_old) END,v_new);
  RETURN v_new;
END;
$fn$;
REVOKE ALL ON FUNCTION public.bt_creator04_manage_account(uuid,text,text,integer,text,uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bt_creator04_manage_account(uuid,text,text,integer,text,uuid)
  TO authenticated;

-- IMPORTANT 04B: workshop creation/binding is NOT implemented by this migration.
-- IMPORTANT: no payment source writes, no real billing, no automatic enforcement/extra seats yet.
