-- BT-WORKSHOP-COMMERCIAL-01: incremental CANDIDATE, never run against hosted data here.
BEGIN;
DO $$DECLARE signature text;BEGIN
 IF to_regnamespace('bt_commercial_private') IS NOT NULL THEN RAISE EXCEPTION 'COMMERCIAL_ALREADY_INSTALLED_OR_PARTIAL';END IF;
 FOREACH signature IN ARRAY ARRAY['bt_platform_private.pilot_operational_write_guard()','public.bt_plan04_operations_status(uuid)','public.bt_plan04_create_workshop(text,uuid)','bt_platform_private.configure_pilot(uuid,boolean,text)','public.bt_plan04_team(uuid)','bt_cp05_private.prepare_issue_before_agenda(uuid,uuid,bigint,uuid,uuid)'] LOOP
  IF to_regprocedure(signature) IS NULL THEN RAISE EXCEPTION 'COMMERCIAL_BASE_DEPENDENCY_MISSING: %',signature;END IF;
 END LOOP;
END $$;
CREATE SCHEMA bt_commercial_private;
REVOKE ALL ON SCHEMA bt_commercial_private FROM PUBLIC,anon,authenticated;
CREATE TABLE bt_commercial_private.previous_functions(signature text PRIMARY KEY,definition text NOT NULL);
INSERT INTO bt_commercial_private.previous_functions SELECT oid::regprocedure::text,pg_get_functiondef(oid) FROM pg_proc WHERE oid IN
 ('bt_platform_private.assert_pilot_write_license(uuid)'::regprocedure,'bt_platform_private.pilot_write_license_allows(uuid)'::regprocedure,'bt_platform_private.pilot_operational_write_guard()'::regprocedure,'public.bt_plan04_create_workshop(text,uuid)'::regprocedure,'public.bt_plan04_operations_status(uuid)'::regprocedure,'bt_platform_private.configure_pilot(uuid,boolean,text)'::regprocedure,'public.bt_plan04_team(uuid)'::regprocedure,'bt_cp05_private.prepare_issue_before_agenda(uuid,uuid,bigint,uuid,uuid)'::regprocedure);
CREATE TABLE bt_commercial_private.consumption (
 request_id uuid PRIMARY KEY,workshop_id uuid NOT NULL REFERENCES public.workshops(id),actor_id uuid NOT NULL REFERENCES auth.users(id),
 capability text NOT NULL CHECK(capability IN('quote','multipunto','email')),resource_id uuid NOT NULL,
 state text NOT NULL CHECK(state IN('reserved','confirmed','failed')),reserved_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '5 minutes',confirmed_at timestamptz,
 plan_at_reservation text NOT NULL,snapshot_hash text NOT NULL DEFAULT '',session_id text NOT NULL,document_bytes bytea CHECK(octet_length(document_bytes)<=20971520), CHECK((state='confirmed')=(confirmed_at IS NOT NULL))
);
CREATE INDEX commercial_consumption_window ON bt_commercial_private.consumption(workshop_id,capability,reserved_at);
ALTER TABLE bt_commercial_private.consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_commercial_private.consumption FORCE ROW LEVEL SECURITY;
ALTER TABLE bt_commercial_private.previous_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_commercial_private.previous_functions FORCE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA bt_commercial_private FROM PUBLIC,anon,authenticated,service_role;

CREATE FUNCTION bt_commercial_private.plan(w uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce((SELECT CASE WHEN state='active' AND (is_lifetime OR expires_at IS NULL OR expires_at>now()) THEN plan ELSE 'basic' END
 FROM bt_platform_private.subscriptions WHERE workshop_id=w),'basic');
$$;
CREATE FUNCTION bt_commercial_private.week_start(at_time timestamptz) RETURNS timestamptz LANGUAGE sql IMMUTABLE SET search_path='' AS $$
 SELECT date_trunc('week',at_time AT TIME ZONE 'America/Santiago') AT TIME ZONE 'America/Santiago';
$$;
CREATE FUNCTION bt_commercial_private.authorize(w uuid,manager_only boolean DEFAULT false) RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid:=bt_platform_private.actor(); BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN public.workshops t ON t.id=m.workshop_id
 WHERE m.workshop_id=w AND m.user_id=u AND m.status='active' AND t.status='active'
 AND (NOT manager_only OR m.role IN('owner','admin'))) THEN RAISE EXCEPTION 'COMMERCIAL_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
 RETURN u;
END $$;
CREATE FUNCTION bt_commercial_private.assert_capability(w uuid,cap text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF cap NOT IN('order','draft','inspection','quote','multipunto','email','self_registration') THEN RAISE EXCEPTION 'UNKNOWN_CAPABILITY' USING ERRCODE='22023';END IF;
 IF cap IN('inspection','multipunto','email','self_registration') AND bt_commercial_private.plan(w)='basic' THEN
 RAISE EXCEPTION 'PLAN_CAPABILITY_REQUIRED' USING ERRCODE='42501'; END IF;
END $$;
-- Generic order/draft writes are legitimate Basic operations; premium checks are capability-specific.
CREATE OR REPLACE FUNCTION bt_platform_private.pilot_write_license_allows(wid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.workshops WHERE id=wid AND status='active');
$$;
CREATE OR REPLACE FUNCTION bt_platform_private.assert_pilot_write_license(wid uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN PERFORM bt_commercial_private.assert_capability(wid,'order'); END $$;

CREATE FUNCTION public.bt_commercial_own_workshop() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid:=bt_platform_private.actor(); bound uuid; own jsonb; p jsonb:=public.bt_plan04_my_status(NULL);
BEGIN
 SELECT bound_workshop_id INTO bound FROM bt_platform_private.account_entitlements WHERE user_id=u;
 SELECT jsonb_build_object('id',w.id,'name',w.name,'status',w.status) INTO own FROM public.workshops w
 JOIN public.workshop_memberships m ON m.workshop_id=w.id AND m.user_id=u AND m.role='owner' AND m.status='active'
 WHERE (bound IS NULL OR w.id=bound) ORDER BY w.created_at LIMIT 1;
 RETURN jsonb_build_object('personalPlan',p,'workshop',own,'bound',bound IS NOT NULL,'blockedByOwnership',EXISTS(SELECT 1 FROM public.workshop_memberships WHERE user_id=u AND role='owner'),
 'canCreate',bound IS NULL AND own IS NULL AND NOT EXISTS(SELECT 1 FROM public.workshop_memberships WHERE user_id=u AND role='owner') AND p->>'effectivePlan' IN('plus','full'));
END $$;
CREATE FUNCTION public.bt_commercial_status(p_workshop_id uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid:=bt_commercial_private.authorize(p_workshop_id); p text:=bt_commercial_private.plan(p_workshop_id); counters jsonb; start_at timestamptz;
BEGIN
 start_at:=bt_commercial_private.week_start(now());
 SELECT jsonb_object_agg(c,jsonb_build_object('used',(SELECT count(*) FROM bt_commercial_private.consumption x
 WHERE x.workshop_id=p_workshop_id AND x.capability=c AND x.state='confirmed' AND
 CASE WHEN p='basic' THEN x.confirmed_at>now()-interval '48 hours' ELSE x.confirmed_at>=start_at END),
 'reserved',(SELECT count(*) FROM bt_commercial_private.consumption x WHERE x.workshop_id=p_workshop_id AND x.capability=c AND x.state='reserved' AND x.expires_at>now()),
 'limit',CASE WHEN p='full' THEN NULL WHEN p='plus' THEN 10 WHEN c='quote' THEN 1 ELSE 0 END)) INTO counters FROM unnest(ARRAY['quote','multipunto','email']) c;
 RETURN jsonb_build_object('workshopId',p_workshop_id,'plan',p,'periodStart',start_at,'periodEnd',(date_trunc('week',now() AT TIME ZONE 'America/Santiago')+interval '7 days') AT TIME ZONE 'America/Santiago','usage',counters,
 'inspectionEnabled',p<>'basic','selfRegistrationEligible',p<>'basic','emailServiceEnabled',false,'logoUploadEnabled',false,
 'customers',(SELECT count(*) FROM public.customers WHERE workshop_id=p_workshop_id),'customerLimit',CASE WHEN p='basic' THEN 5 ELSE NULL END,
 'mechanicCapacity',bt_platform_private.seats(p_workshop_id),'ownedWorkshops',(SELECT count(*) FROM public.workshop_memberships WHERE user_id=u AND role='owner' AND status='active'),'ownWorkshopLimit',1);
END $$;
CREATE FUNCTION public.bt_commercial_reserve(p_workshop_id uuid,p_capability text,p_resource_id uuid,p_request_id uuid,p_snapshot_hash text DEFAULT '') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid:=bt_commercial_private.authorize(p_workshop_id); p text; n integer; lim integer; prior bt_commercial_private.consumption%ROWTYPE;
BEGIN
 IF p_capability NOT IN('quote','multipunto','email') OR p_request_id IS NULL OR p_resource_id IS NULL THEN RAISE EXCEPTION 'INVALID_CONSUMPTION' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('bt_workshop:'||p_workshop_id::text,0));
 -- UUIDs are global: serialize reused identities even when callers target different tenants.
 PERFORM pg_advisory_xact_lock(hashtextextended('bt_commercial_request:'||p_request_id::text,0));
 UPDATE bt_commercial_private.consumption SET document_bytes=NULL WHERE workshop_id=p_workshop_id AND expires_at<=now() AND document_bytes IS NOT NULL;
 IF p_capability='multipunto' AND p_snapshot_hash !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'SNAPSHOT_REQUIRED' USING ERRCODE='22023';END IF;
 p:=bt_commercial_private.plan(p_workshop_id);PERFORM bt_commercial_private.assert_capability(p_workshop_id,p_capability);
 IF p_capability='quote' AND NOT EXISTS(SELECT 1 FROM public.quote_revisions WHERE workshop_id=p_workshop_id AND id=p_resource_id) OR
 p_capability='multipunto' AND NOT EXISTS(SELECT 1 FROM public.work_orders WHERE workshop_id=p_workshop_id AND id=p_resource_id) OR
 p_capability='email' AND NOT EXISTS(SELECT 1 FROM public.quote_revisions WHERE workshop_id=p_workshop_id AND id=p_resource_id) THEN RAISE EXCEPTION 'RESOURCE_SCOPE_DENIED' USING ERRCODE='42501'; END IF;
 SELECT * INTO prior FROM bt_commercial_private.consumption WHERE request_id=p_request_id;
 IF FOUND THEN
  IF prior.workshop_id<>p_workshop_id OR prior.actor_id<>u OR prior.capability<>p_capability OR prior.resource_id<>p_resource_id OR prior.snapshot_hash<>p_snapshot_hash THEN RAISE EXCEPTION 'CONSUMPTION_CONFLICT' USING ERRCODE='23505';END IF;
  IF prior.state='confirmed' THEN
   IF prior.plan_at_reservation<>p OR prior.expires_at<=now() THEN RAISE EXCEPTION 'CONSUMPTION_REPLAY_EXPIRED' USING ERRCODE='42501';END IF;
   RETURN to_jsonb(prior)-'document_bytes'-'session_id';END IF;
  IF prior.state='reserved' AND prior.expires_at>now() THEN RETURN to_jsonb(prior)-'document_bytes'-'session_id';END IF;
 END IF;
 lim:=CASE WHEN p='full' THEN 500 WHEN p='plus' THEN 10 WHEN p_capability='quote' THEN 1 ELSE 0 END;
 SELECT count(*) INTO n FROM bt_commercial_private.consumption x WHERE workshop_id=p_workshop_id AND capability=p_capability AND
 (state='confirmed' AND CASE WHEN p='basic' THEN confirmed_at>now()-interval '48 hours' WHEN p='full' THEN confirmed_at>now()-interval '1 hour' ELSE confirmed_at>=bt_commercial_private.week_start(now()) END
 OR state='reserved' AND expires_at>now());
 IF n>=lim THEN RAISE EXCEPTION 'COMMERCIAL_QUOTA_EXHAUSTED' USING ERRCODE='P0001'; END IF;
 INSERT INTO bt_commercial_private.consumption(request_id,workshop_id,actor_id,capability,resource_id,state,plan_at_reservation,snapshot_hash,session_id)
 VALUES(p_request_id,p_workshop_id,u,p_capability,p_resource_id,'reserved',p,p_snapshot_hash,auth.jwt()->>'session_id')
 ON CONFLICT(request_id) DO UPDATE SET state='reserved',reserved_at=now(),expires_at=now()+interval '5 minutes',confirmed_at=NULL,plan_at_reservation=p,snapshot_hash=p_snapshot_hash,session_id=auth.jwt()->>'session_id',document_bytes=NULL
 RETURNING * INTO prior;
 RETURN to_jsonb(prior)-'document_bytes'-'session_id';
END $$;
CREATE FUNCTION public.bt_commercial_finish(p_request_id uuid,p_actor_id uuid,p_success boolean,p_bytes bytea DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r bt_commercial_private.consumption%ROWTYPE; BEGIN
 IF current_setting('role',true)<>'service_role' THEN RAISE EXCEPTION 'TRUSTED_DELIVERY_REQUIRED' USING ERRCODE='42501';END IF;
 SELECT * INTO r FROM bt_commercial_private.consumption WHERE request_id=p_request_id;
 IF r.request_id IS NULL OR r.actor_id<>p_actor_id THEN RAISE EXCEPTION 'CONSUMPTION_DENIED' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('bt_workshop:'||r.workshop_id::text,0));
 SELECT * INTO r FROM bt_commercial_private.consumption WHERE request_id=p_request_id FOR UPDATE;
 PERFORM bt_commercial_private.assert_capability(r.workshop_id,r.capability);
 IF NOT EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN auth.users u ON u.id=m.user_id JOIN auth.sessions a ON a.user_id=u.id AND a.id::text=r.session_id JOIN public.workshops w ON w.id=m.workshop_id WHERE m.workshop_id=r.workshop_id AND m.user_id=p_actor_id AND m.status='active' AND w.status='active' AND u.email_confirmed_at IS NOT NULL AND (u.banned_until IS NULL OR u.banned_until<=now()) AND (a.not_after IS NULL OR a.not_after>now())) THEN RAISE EXCEPTION 'MEMBERSHIP_REVOKED' USING ERRCODE='42501';END IF;
 IF bt_commercial_private.plan(r.workshop_id)<>r.plan_at_reservation THEN RAISE EXCEPTION 'PLAN_CHANGED_RETRY' USING ERRCODE='42501';END IF;
 IF r.state='confirmed' AND r.expires_at>now() THEN RETURN to_jsonb(r)-'document_bytes'-'session_id';END IF;
 IF r.state<>'reserved' OR r.expires_at<=now() THEN RAISE EXCEPTION 'RESERVATION_EXPIRED' USING ERRCODE='42501';END IF;
 IF p_success THEN
  IF r.capability<>'email' AND (p_bytes IS NULL OR substring(p_bytes FROM 1 FOR 5)<>decode('255044462d','hex')) THEN RAISE EXCEPTION 'VERIFIED_PDF_REQUIRED' USING ERRCODE='22023';END IF;
  -- A downgrade between reserve and delivery must not reuse the former generous quota.
  IF bt_commercial_private.plan(r.workshop_id)<>r.plan_at_reservation THEN RAISE EXCEPTION 'PLAN_CHANGED_RETRY' USING ERRCODE='42501';END IF;
  UPDATE bt_commercial_private.consumption SET state='confirmed',confirmed_at=now(),document_bytes=p_bytes WHERE request_id=p_request_id RETURNING * INTO r;
 ELSE UPDATE bt_commercial_private.consumption SET state='failed' WHERE request_id=p_request_id RETURNING * INTO r;END IF;
 RETURN to_jsonb(r)-'document_bytes'-'session_id';
END $$;
CREATE FUNCTION public.bt_commercial_cached(p_request_id uuid,p_actor_id uuid) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r bt_commercial_private.consumption%ROWTYPE;BEGIN
 IF current_setting('role',true)<>'service_role' THEN RAISE EXCEPTION 'TRUSTED_DELIVERY_REQUIRED' USING ERRCODE='42501';END IF;
 SELECT * INTO r FROM bt_commercial_private.consumption WHERE request_id=p_request_id;
 IF r.actor_id IS DISTINCT FROM p_actor_id OR r.state<>'confirmed' OR r.expires_at<=now() OR r.document_bytes IS NULL OR bt_commercial_private.plan(r.workshop_id)<>r.plan_at_reservation THEN RAISE EXCEPTION 'CACHED_DOCUMENT_DENIED' USING ERRCODE='42501';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN auth.users u ON u.id=m.user_id JOIN auth.sessions a ON a.user_id=u.id AND a.id::text=r.session_id JOIN public.workshops w ON w.id=m.workshop_id WHERE m.workshop_id=r.workshop_id AND m.user_id=p_actor_id AND m.status='active' AND w.status='active' AND u.email_confirmed_at IS NOT NULL AND (u.banned_until IS NULL OR u.banned_until<=now()) AND (a.not_after IS NULL OR a.not_after>now())) THEN RAISE EXCEPTION 'CACHED_AUTHORITY_REVOKED' USING ERRCODE='42501';END IF;
 RETURN encode(r.document_bytes,'hex');
END $$;
REVOKE ALL ON FUNCTION public.bt_commercial_cached(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_commercial_cached(uuid,uuid) TO service_role;

-- Enforce five persisted customer records; archiving never resets the limit. Existing edits/restores remain allowed, serialized with plan/team changes.
CREATE FUNCTION bt_commercial_private.customer_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('bt_workshop:'||NEW.workshop_id::text,0));
 IF TG_OP='INSERT' AND bt_commercial_private.plan(NEW.workshop_id)='basic' AND
 (SELECT count(*) FROM public.customers WHERE workshop_id=NEW.workshop_id)>=5 THEN RAISE EXCEPTION 'BASIC_CUSTOMER_LIMIT' USING ERRCODE='23514';END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER bt_commercial_customer_limit BEFORE INSERT OR UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION bt_commercial_private.customer_guard();
-- Direct clean Storage reads/signing must not bypass the trusted metered document endpoint.
CREATE POLICY bt_commercial_quote_egress ON storage.objects AS RESTRICTIVE FOR SELECT TO authenticated,anon
 USING(bucket_id NOT IN('cp05-quote-documents','bt-closing-documents'));

CREATE OR REPLACE FUNCTION public.bt_plan04_create_workshop(p_name text,p_request_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid:=bt_platform_private.actor(); e bt_platform_private.account_entitlements%ROWTYPE;
 prior bt_platform_private.workshop_creation_requests%ROWTYPE; w uuid; payload jsonb;
BEGIN
 IF p_request_id IS NULL OR p_name IS NULL OR length(btrim(p_name)) NOT BETWEEN 2 AND 120 THEN
  RAISE EXCEPTION 'Invalid workshop name or request' USING ERRCODE='22023'; END IF;
 payload:=pg_catalog.jsonb_build_object('name',btrim(p_name));
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('bt_account:'||u::text,0));
 SELECT * INTO e FROM bt_platform_private.account_entitlements WHERE user_id=u FOR UPDATE;
 IF e.user_id IS NULL OR e.plan NOT IN('plus','full') OR e.state<>'active'
  OR (NOT e.is_lifetime AND e.expires_at IS NOT NULL AND e.expires_at<=now()) THEN
  RAISE EXCEPTION 'Active Plus or Full required' USING ERRCODE='42501'; END IF;
 SELECT * INTO prior FROM bt_platform_private.workshop_creation_requests WHERE request_id=p_request_id;
 IF FOUND THEN
  IF prior.user_id<>u OR prior.payload<>payload OR prior.workshop_id IS DISTINCT FROM e.bound_workshop_id THEN
   RAISE EXCEPTION 'Request conflict' USING ERRCODE='23505'; END IF;
  RETURN pg_catalog.jsonb_build_object('workshopId',prior.workshop_id);
 END IF;
 IF e.bound_workshop_id IS NOT NULL OR EXISTS(SELECT 1 FROM public.workshop_memberships WHERE user_id=u AND role='owner') THEN RAISE EXCEPTION 'License already bound' USING ERRCODE='23505'; END IF;
 INSERT INTO public.workshops(name) VALUES(btrim(p_name)) RETURNING id INTO w;
 INSERT INTO public.profiles(user_id,display_name)
 SELECT u,CASE WHEN length(split_part(email,'@',1))>=2 THEN left(split_part(email,'@',1),120) ELSE 'Titular' END FROM auth.users WHERE id=u
 ON CONFLICT(user_id) DO NOTHING;
 INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES(w,u,'owner');
 INSERT INTO bt_platform_private.workshop_profiles(workshop_id,commercial_name) VALUES(w,btrim(p_name));
 UPDATE bt_platform_private.account_entitlements SET bound_workshop_id=w,updated_at=now() WHERE user_id=u;
 PERFORM bt_platform_private.sync_entitlement(u,p_request_id,u,'Workshop created by license holder');
 INSERT INTO bt_platform_private.workshop_creation_requests VALUES(p_request_id,u,w,payload);
 PERFORM bt_platform_private.configure_pilot(w,true,'Commercial policy: authenticated eligible owner created this workshop');
 RETURN pg_catalog.jsonb_build_object('workshopId',w);
END $$;
CREATE OR REPLACE FUNCTION bt_platform_private.pilot_operational_write_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE wid uuid; oid uuid; state text; delivered boolean; role_name text;
BEGIN
 wid:=NEW.workshop_id;
 -- Serialize with subscription changes; the entitlement/subscription predicate is rechecked below.
 PERFORM 1 FROM bt_platform_private.subscriptions WHERE workshop_id=wid FOR SHARE;
 PERFORM bt_platform_private.assert_pilot_write_license(wid);
 IF TG_TABLE_NAME='inspection_findings' THEN
  PERFORM bt_commercial_private.assert_capability(wid,'inspection');
  oid:=NEW.order_id;
  SELECT status INTO state FROM public.work_orders WHERE workshop_id=wid AND id=oid FOR UPDATE;
  IF state IS NULL THEN RAISE EXCEPTION 'ORDER_REQUIRED' USING ERRCODE='42501'; END IF;
  SELECT EXISTS(SELECT 1 FROM public.bt_flow_visit_deliveries WHERE workshop_id=wid AND order_id=oid) INTO delivered;
  IF state IN('ready','closed') OR delivered THEN
   SELECT role INTO role_name FROM public.workshop_memberships WHERE workshop_id=wid AND user_id=auth.uid() AND status='active';
   -- A manager may record legitimate resolution follow-up, never rewrite original diagnosis.
   IF TG_OP='INSERT' THEN RAISE EXCEPTION 'FINAL_INSPECTION_READ_ONLY' USING ERRCODE='42501'; END IF;
   IF role_name IS NULL OR role_name NOT IN('owner','admin') OR
     NEW.category IS DISTINCT FROM OLD.category OR NEW.result IS DISTINCT FROM OLD.result OR
     NEW.note IS DISTINCT FROM OLD.note OR NEW.order_id IS DISTINCT FROM OLD.order_id OR
     NEW.vehicle_id IS DISTINCT FROM OLD.vehicle_id OR NEW.recorded_by IS DISTINCT FROM OLD.recorded_by OR
     NEW.resolution IS NOT DISTINCT FROM OLD.resolution THEN
    RAISE EXCEPTION 'FINAL_INSPECTION_READ_ONLY' USING ERRCODE='42501'; END IF;
  END IF;
 ELSE
  IF TG_OP='UPDATE' AND EXISTS(SELECT 1 FROM public.bt_flow_visit_deliveries WHERE workshop_id=wid AND order_id=NEW.id)
   AND (NEW.status IS DISTINCT FROM OLD.status AND NEW.status<>'closed' OR NEW.complaint IS DISTINCT FROM OLD.complaint OR NEW.intake_odometer IS DISTINCT FROM OLD.intake_odometer) THEN
   RAISE EXCEPTION 'DELIVERED_ORDER_IMMUTABLE' USING ERRCODE='42501'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE FUNCTION bt_commercial_private.assert_quote_issue(w uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('bt_workshop:'||w::text,0));
 IF bt_commercial_private.plan(w)='basic' AND EXISTS(SELECT 1 FROM bt_commercial_private.consumption WHERE workshop_id=w AND capability='quote' AND (state='confirmed' AND confirmed_at>now()-interval '48 hours' OR state='reserved' AND expires_at>now())) THEN
 RAISE EXCEPTION 'BASIC_FINAL_ACCESS_UNAVAILABLE_KEEP_DRAFT' USING ERRCODE='P0001';END IF;
END $$;

CREATE OR REPLACE FUNCTION bt_cp05_private.prepare_issue_before_agenda(wid uuid, qid uuid, expected bigint, rid uuid, actor uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE q public.quotes;req bt_cp05_private.issue_requests;snapshot jsonb;lines jsonb;net bigint;rev integer;
BEGIN
 PERFORM bt_commercial_private.assert_quote_issue(wid);
 PERFORM bt_cp05_private.authorize(wid,actor,true);
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=qid FOR UPDATE;
 IF q.id IS NULL THEN RAISE EXCEPTION 'CP05_NOT_FOUND' USING ERRCODE='42501'; END IF;
 SELECT * INTO req FROM bt_cp05_private.issue_requests WHERE workshop_id=wid AND request_id=rid;
 IF FOUND THEN
  IF req.quote_id<>qid OR req.expected_version<>expected OR req.actor_id<>actor OR req.state='cancelled' THEN RAISE EXCEPTION 'CP05_REQUEST_REUSED' USING ERRCODE='22023'; END IF;
  RETURN jsonb_build_object('request_id',rid,'revision',req.revision,'payload',req.payload,'payload_sha256',req.payload_sha256);
 END IF;
 IF q.version<>expected THEN RAISE EXCEPTION 'CP05_CONFLICT' USING ERRCODE='40001'; END IF;
 IF q.status<>'draft' OR q.issue_pending THEN RAISE EXCEPTION 'CP05_NOT_READY' USING ERRCODE='55000'; END IF;
 SELECT jsonb_agg(to_jsonb(i) ORDER BY i.position),sum(i.line_net) INTO lines,net FROM public.quote_items i WHERE workshop_id=wid AND quote_id=qid;
 IF lines IS NULL THEN RAISE EXCEPTION 'CP05_ITEMS_REQUIRED' USING ERRCODE='22023'; END IF;
 rev:=q.issued_revision+1;
 SELECT jsonb_build_object('quote',to_jsonb(q)||jsonb_build_object('status','issued','revision',rev),'workshop',jsonb_build_object('id',w.id,'name',coalesce(p.commercial_name,w.name),'contactEmail',coalesce(p.contact_email,''),'phone',coalesce(p.phone,''),'address',coalesce(p.address,'')),
 'customer',jsonb_build_object('id',c.id,'full_name',c.full_name,'email',c.email,'mobile_e164',c.mobile_e164),
 'vehicle',jsonb_build_object('id',v.id,'plate',v.plate,'make',v.make,'model',v.model,'model_year',v.model_year),
 'order',jsonb_build_object('id',o.id,'complaint',o.complaint,'opened_at',o.opened_at,'intake_odometer',o.intake_odometer),
 'items',lines,'totals',jsonb_build_object('subtotal',net,'tax',(net*19+50)/100,'total',net+(net*19+50)/100),
 'document_date',statement_timestamp(),'notice','Cotización no tributaria. No acredita ejecución ni aceptación del cliente.') INTO snapshot
 FROM public.workshops w LEFT JOIN bt_platform_private.workshop_profiles p ON p.workshop_id=w.id JOIN public.work_orders o ON o.workshop_id=w.id AND o.id=q.order_id
 JOIN public.vehicles v ON v.workshop_id=w.id AND v.id=q.vehicle_id
 JOIN public.customers c ON c.workshop_id=w.id AND c.id=q.customer_id
 WHERE w.id=wid AND v.customer_id=c.id;
 IF snapshot IS NULL THEN RAISE EXCEPTION 'CP05_SOURCE_INVALID' USING ERRCODE='22023'; END IF;
 INSERT INTO bt_cp05_private.issue_requests(workshop_id,request_id,quote_id,expected_version,revision,actor_id,payload,payload_sha256) VALUES(wid,rid,qid,expected,rev,actor,snapshot,bt_cp05_private.hash(snapshot));
 UPDATE public.quotes SET issue_pending=true WHERE workshop_id=wid AND id=qid;
 RETURN jsonb_build_object('request_id',rid,'revision',rev,'payload',snapshot,'payload_sha256',bt_cp05_private.hash(snapshot));
END $function$
;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA bt_commercial_private FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.bt_commercial_own_workshop(),public.bt_commercial_status(uuid),public.bt_commercial_reserve(uuid,text,uuid,uuid,text),public.bt_commercial_finish(uuid,uuid,boolean,bytea) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_commercial_own_workshop(),public.bt_commercial_status(uuid),public.bt_commercial_reserve(uuid,text,uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bt_commercial_finish(uuid,uuid,boolean,bytea) TO service_role;
CREATE OR REPLACE FUNCTION public.bt_plan04_operations_status(p_workshop_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid:=bt_platform_private.actor(); flow_ok boolean; archive_ok boolean; read_ok boolean;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
   WHERE m.user_id=u AND m.workshop_id=p_workshop_id AND m.status='active' AND w.status='active') THEN
  RAISE EXCEPTION 'Workshop not authorized' USING ERRCODE='42501'; END IF;
 -- Agenda has its own gate: disabling scheduling must not disable physical intake.
 SELECT enabled INTO flow_ok FROM bt_flow_live_private.rollout WHERE workshop_id=p_workshop_id;
 SELECT archive_enabled,archive_read_enabled INTO archive_ok,read_ok FROM bt_com_private.rollout WHERE workshop_id=p_workshop_id;
 RETURN pg_catalog.jsonb_build_object('workshopId',p_workshop_id,
  'operationsEnabled',coalesce(flow_ok AND archive_ok AND read_ok AND bt_platform_private.pilot_write_license_allows(p_workshop_id),false),
  'documentsEnabled',coalesce(read_ok,false),'inspectionEnabled',bt_commercial_private.plan(p_workshop_id)<>'basic');
END $$;

CREATE OR REPLACE FUNCTION bt_platform_private.configure_pilot(wid uuid, enabled boolean, reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF wid IS NULL OR enabled IS NULL OR reason IS NULL OR length(btrim(reason)) NOT BETWEEN 12 AND 240 THEN
  RAISE EXCEPTION 'Explicit workshop, state and approval reason required' USING ERRCODE='22023'; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('bt_workshop:'||wid::text,0));
 IF NOT EXISTS(SELECT 1 FROM public.workshops WHERE id=wid AND status='active') THEN
  RAISE EXCEPTION 'Active workshop required' USING ERRCODE='42501'; END IF;
 IF enabled AND NOT EXISTS(SELECT 1 FROM public.workshop_memberships m WHERE m.workshop_id=wid AND m.role='owner' AND m.status='active') THEN
  RAISE EXCEPTION 'Active owner required for operational rollout' USING ERRCODE='42501';END IF;
 INSERT INTO bt_flow_live_private.rollout(workshop_id,enabled,enabled_at,approval_note)
 VALUES(wid,enabled,CASE WHEN enabled THEN now() END,btrim(reason))
 ON CONFLICT(workshop_id) DO UPDATE SET enabled=excluded.enabled,enabled_at=excluded.enabled_at,approval_note=excluded.approval_note;
 INSERT INTO bt_agenda_private.rollout(workshop_id,enabled,timezone) VALUES(wid,enabled,'America/Santiago')
 ON CONFLICT(workshop_id) DO UPDATE SET enabled=excluded.enabled;
 -- Preserve read access to issued historical originals when writes are disabled.
 INSERT INTO bt_com_private.rollout(workshop_id,archive_enabled,archive_read_enabled)
 VALUES(wid,enabled,enabled) ON CONFLICT(workshop_id) DO UPDATE SET archive_enabled=excluded.archive_enabled,archive_read_enabled=bt_com_private.rollout.archive_read_enabled OR excluded.archive_enabled;
END $$;

CREATE OR REPLACE FUNCTION public.bt_plan04_team(p_workshop_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE active_count integer; pending_count integer; capacity integer; members jsonb; invites jsonb;
BEGIN
 PERFORM bt_platform_private.manager(p_workshop_id);
 SELECT count(*) INTO active_count FROM public.workshop_memberships WHERE workshop_id=p_workshop_id AND role='mechanic' AND status='active';
 SELECT count(*) INTO pending_count FROM bt_platform_private.mechanic_invites WHERE workshop_id=p_workshop_id AND state='pending' AND expires_at>now();
 capacity:=bt_platform_private.seats(p_workshop_id);
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',m.id,'name',coalesce(p.display_name,'Mecánico'),'status',m.status,'email',(SELECT email FROM auth.users WHERE id=m.user_id)) ORDER BY m.created_at),'[]'::jsonb)
 INTO members FROM public.workshop_memberships m LEFT JOIN public.profiles p ON p.user_id=m.user_id WHERE m.workshop_id=p_workshop_id AND m.role='mechanic';
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'email',email,'expiresAt',expires_at) ORDER BY created_at),'[]'::jsonb)
 INTO invites FROM bt_platform_private.mechanic_invites WHERE workshop_id=p_workshop_id AND state='pending' AND expires_at>now();
 RETURN jsonb_build_object('workshopId',p_workshop_id,'active',active_count,'pending',pending_count,'capacity',capacity,
 'overCapacity',active_count+pending_count>capacity,'members',members,'invites',invites,'emailDeliveryEnabled',false);
END $$;
-- Transactional postflight: do not commit a partially exposed commercial contract.
DO $$DECLARE signature text;BEGIN
 IF (SELECT count(*) FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='bt_commercial_private' AND c.relname IN('consumption','previous_functions') AND c.relrowsecurity AND c.relforcerowsecurity)<>2 THEN RAISE EXCEPTION 'COMMERCIAL_RLS_POSTFLIGHT_FAILED';END IF;
 FOREACH signature IN ARRAY ARRAY['public.bt_commercial_own_workshop()','public.bt_commercial_status(uuid)','public.bt_commercial_reserve(uuid,text,uuid,uuid,text)'] LOOP
  IF has_function_privilege('anon',signature,'EXECUTE') OR NOT has_function_privilege('authenticated',signature,'EXECUTE') THEN RAISE EXCEPTION 'COMMERCIAL_CALLER_ACL_POSTFLIGHT_FAILED: %',signature;END IF;
 END LOOP;
 FOREACH signature IN ARRAY ARRAY['public.bt_commercial_finish(uuid,uuid,boolean,bytea)','public.bt_commercial_cached(uuid,uuid)'] LOOP
  IF has_function_privilege('anon',signature,'EXECUTE') OR has_function_privilege('authenticated',signature,'EXECUTE') OR NOT has_function_privilege('service_role',signature,'EXECUTE') THEN RAISE EXCEPTION 'COMMERCIAL_TRUSTED_ACL_POSTFLIGHT_FAILED: %',signature;END IF;
 END LOOP;
 IF has_schema_privilege('authenticated','bt_commercial_private','USAGE') OR has_table_privilege('authenticated','bt_commercial_private.consumption','SELECT') THEN RAISE EXCEPTION 'COMMERCIAL_LEDGER_EXPOSURE';END IF;
END $$;
COMMIT;
