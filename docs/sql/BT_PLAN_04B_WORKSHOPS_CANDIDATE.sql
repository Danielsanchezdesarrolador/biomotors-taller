-- CANDIDATE ONLY. Requires installed Creator-01 and PLAN-04A. No hosted execution authorized.
BEGIN;
ALTER TABLE bt_platform_private.subscription_events ADD COLUMN request_payload jsonb;
ALTER TABLE bt_platform_private.account_entitlement_events ADD COLUMN request_payload jsonb;
CREATE TABLE bt_platform_private.workshop_creation_requests (
 request_id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth.users(id),
 workshop_id uuid NOT NULL UNIQUE REFERENCES public.workshops(id), payload jsonb NOT NULL
);
CREATE TABLE bt_platform_private.workshop_profiles (
 workshop_id uuid PRIMARY KEY REFERENCES public.workshops(id),
 commercial_name text NOT NULL CHECK(length(btrim(commercial_name)) BETWEEN 2 AND 120),
 contact_email text NOT NULL DEFAULT '' CHECK(length(contact_email)<=254),
 phone text NOT NULL DEFAULT '' CHECK(length(phone)<=30),
 address text NOT NULL DEFAULT '' CHECK(length(address)<=240),
 logo_path text, updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE bt_platform_private.workshop_creation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.workshop_creation_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.workshop_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.workshop_profiles FORCE ROW LEVEL SECURITY;
REVOKE ALL ON bt_platform_private.workshop_creation_requests, bt_platform_private.workshop_profiles FROM PUBLIC,anon,authenticated;

-- Confirmed identity and an existing, non-expired Auth session, never user metadata.
CREATE FUNCTION bt_platform_private.actor() RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid:=auth.uid(); sid text:=auth.jwt()->>'session_id';
BEGIN
 IF u IS NULL OR sid IS NULL OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=u
   AND email_confirmed_at IS NOT NULL AND (banned_until IS NULL OR banned_until<=now()))
   OR NOT EXISTS(SELECT 1 FROM auth.sessions WHERE id::text=sid AND user_id=u
     AND (not_after IS NULL OR not_after>now())) THEN
   RAISE EXCEPTION 'Confirmed live session required' USING ERRCODE='42501'; END IF;
 RETURN u;
END $$;
REVOKE ALL ON FUNCTION bt_platform_private.actor() FROM PUBLIC,anon,authenticated;

CREATE FUNCTION bt_platform_private.manager(w uuid) RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid:=bt_platform_private.actor();
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN public.workshops s ON s.id=m.workshop_id
   WHERE m.workshop_id=w AND m.user_id=u AND m.status='active' AND m.role IN('owner','admin') AND s.status='active') THEN
   RAISE EXCEPTION 'Workshop manager required' USING ERRCODE='42501'; END IF;
 RETURN u;
END $$;
REVOKE ALL ON FUNCTION bt_platform_private.manager(uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION bt_platform_private.sync_entitlement(u uuid, req uuid, actor uuid, reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE e bt_platform_private.account_entitlements%ROWTYPE; old jsonb; next jsonb;
BEGIN
 SELECT * INTO e FROM bt_platform_private.account_entitlements WHERE user_id=u;
 IF e.bound_workshop_id IS NULL THEN RETURN; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('bt_workshop:'||e.bound_workshop_id::text,0));
 SELECT pg_catalog.to_jsonb(s) INTO old FROM bt_platform_private.subscriptions s WHERE workshop_id=e.bound_workshop_id FOR UPDATE;
 INSERT INTO bt_platform_private.subscriptions AS s(workshop_id,plan,state,source,is_lifetime,expires_at,updated_by)
 VALUES(e.bound_workshop_id,e.plan,e.state,e.source,e.is_lifetime,e.expires_at,actor)
 ON CONFLICT(workshop_id) DO UPDATE SET plan=excluded.plan,state=excluded.state,source=excluded.source,
 is_lifetime=excluded.is_lifetime,expires_at=excluded.expires_at,updated_by=actor,updated_at=now()
 RETURNING pg_catalog.to_jsonb(s) INTO next;
 INSERT INTO bt_platform_private.subscription_events(request_id,workshop_id,actor_id,mode,reason,previous_state,next_state)
 VALUES(req,e.bound_workshop_id,actor,'account_sync',reason,old,next);
END $$;
REVOKE ALL ON FUNCTION bt_platform_private.sync_entitlement(uuid,uuid,uuid,text) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.bt_plan04_create_workshop(p_name text,p_request_id uuid) RETURNS jsonb
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
 IF e.bound_workshop_id IS NOT NULL THEN RAISE EXCEPTION 'License already bound' USING ERRCODE='23505'; END IF;
 INSERT INTO public.workshops(name) VALUES(btrim(p_name)) RETURNING id INTO w;
 INSERT INTO public.profiles(user_id,display_name)
 SELECT u,CASE WHEN length(split_part(email,'@',1))>=2 THEN left(split_part(email,'@',1),120) ELSE 'Titular' END FROM auth.users WHERE id=u
 ON CONFLICT(user_id) DO NOTHING;
 INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES(w,u,'owner');
 INSERT INTO bt_platform_private.workshop_profiles(workshop_id,commercial_name) VALUES(w,btrim(p_name));
 UPDATE bt_platform_private.account_entitlements SET bound_workshop_id=w,updated_at=now() WHERE user_id=u;
 PERFORM bt_platform_private.sync_entitlement(u,p_request_id,u,'Workshop created by license holder');
 INSERT INTO bt_platform_private.workshop_creation_requests VALUES(p_request_id,u,w,payload);
 RETURN pg_catalog.jsonb_build_object('workshopId',w);
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_create_workshop(text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_create_workshop(text,uuid) TO authenticated;

CREATE FUNCTION public.bt_plan04_profile(p_workshop_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid:=bt_platform_private.actor(); result jsonb;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
  WHERE m.workshop_id=p_workshop_id AND m.user_id=u AND m.status='active' AND w.status='active') THEN
  RAISE EXCEPTION 'Workshop not authorized' USING ERRCODE='42501'; END IF;
 SELECT pg_catalog.jsonb_build_object('workshopId',w.id,'name',coalesce(p.commercial_name,w.name),
  'email',coalesce(p.contact_email,''),'phone',coalesce(p.phone,''),'address',coalesce(p.address,''),'logoPath',p.logo_path)
 INTO result FROM public.workshops w LEFT JOIN bt_platform_private.workshop_profiles p ON p.workshop_id=w.id WHERE w.id=p_workshop_id;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_profile(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_profile(uuid) TO authenticated;

CREATE FUNCTION public.bt_plan04_update_profile(p_workshop_id uuid,p_name text,p_email text,p_phone text,p_address text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 PERFORM bt_platform_private.manager(p_workshop_id);
 IF p_name IS NULL OR length(btrim(p_name)) NOT BETWEEN 2 AND 120 OR p_email IS NULL OR length(p_email)>254
  OR p_phone IS NULL OR length(p_phone)>30 OR p_address IS NULL OR length(p_address)>240
  OR (p_email<>'' AND p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') THEN
  RAISE EXCEPTION 'Invalid commercial profile' USING ERRCODE='22023'; END IF;
 INSERT INTO bt_platform_private.workshop_profiles(workshop_id,commercial_name,contact_email,phone,address)
 VALUES(p_workshop_id,btrim(p_name),btrim(p_email),btrim(p_phone),btrim(p_address))
 ON CONFLICT(workshop_id) DO UPDATE SET commercial_name=excluded.commercial_name,contact_email=excluded.contact_email,
 phone=excluded.phone,address=excluded.address,updated_at=now();
 UPDATE public.workshops SET name=btrim(p_name) WHERE id=p_workshop_id;
 RETURN public.bt_plan04_profile(p_workshop_id);
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_update_profile(uuid,text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_update_profile(uuid,text,text,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.bt_creator04_manage_account(
  p_user_id uuid, p_plan text, p_mode text, p_days integer, p_reason text, p_request_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE
  v_actor uuid := bt_platform_private.actor();
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
  SELECT e.actor_id, e.user_id, e.next_state, e.request_payload INTO v_existing
  FROM bt_platform_private.account_entitlement_events e WHERE e.request_id=p_request_id;
  IF FOUND THEN
    IF v_existing.actor_id<>v_actor OR v_existing.user_id<>p_user_id OR v_existing.request_payload IS DISTINCT FROM pg_catalog.jsonb_build_array(p_user_id,p_plan,p_mode,p_days,btrim(p_reason)) THEN
      RAISE EXCEPTION 'Request id reused' USING ERRCODE='23505'; END IF;
    RETURN v_existing.next_state;
  END IF;
  SELECT * INTO v_old FROM bt_platform_private.account_entitlements
    WHERE user_id=p_user_id FOR UPDATE;


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
        v_expiry:=GREATEST(now(),v_old.expires_at)+pg_catalog.make_interval(days=>p_days);
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
    (request_id,user_id,actor_id,mode,reason,previous_state,next_state,request_payload)
  VALUES (p_request_id,p_user_id,v_actor,p_mode,btrim(p_reason),
    CASE WHEN v_old.user_id IS NULL THEN NULL ELSE pg_catalog.to_jsonb(v_old) END,v_new,pg_catalog.jsonb_build_array(p_user_id,p_plan,p_mode,p_days,btrim(p_reason)));
  PERFORM bt_platform_private.sync_entitlement(p_user_id,p_request_id,v_actor,btrim(p_reason));
  RETURN v_new;
END;
$fn$;
REVOKE ALL ON FUNCTION public.bt_creator04_manage_account(uuid,text,text,integer,text,uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bt_creator04_manage_account(uuid,text,text,integer,text,uuid)
  TO authenticated;


CREATE OR REPLACE FUNCTION public.bt_plan04_my_status(p_workshop_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE
  v_uid uuid := bt_platform_private.actor();
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


CREATE OR REPLACE FUNCTION bt_platform_private.manage_legacy_subscription(
  p_workshop_id uuid, p_plan text, p_mode text, p_days integer,
  p_reason text, p_request_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE
  v_actor uuid;
  v_old bt_platform_private.subscriptions%ROWTYPE;
  v_plan text;
  v_state text;
  v_expiry timestamptz;
  v_lifetime boolean;
  v_new jsonb;
  v_existing record;
BEGIN
  v_actor := auth.uid();
  IF NOT public.bt_creator_is_creator() OR v_actor IS NULL THEN
    RAISE EXCEPTION 'Acceso reservado al creador' USING ERRCODE='42501';
  END IF;
  -- Impide cambios de planes con una sesión robada que solo tiene contraseña.
  IF coalesce(auth.jwt()->>'aal','') <> 'aal2' THEN
    RAISE EXCEPTION 'MFA_REQUIRED' USING ERRCODE='42501';
  END IF;
  IF p_request_id IS NULL OR p_workshop_id IS NULL OR
     p_reason IS NULL OR length(btrim(p_reason)) < 5 OR length(btrim(p_reason)) > 240 THEN
    RAISE EXCEPTION 'Solicitud inválida' USING ERRCODE='22023';
  END IF;
  IF p_mode IS NULL OR p_plan IS NULL OR
     p_mode NOT IN ('basic','grant_days','extend_days','lifetime','revoke') OR
     p_plan NOT IN ('basic','plus','full') THEN
    RAISE EXCEPTION 'Plan o modo inválido' USING ERRCODE='22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.workshops WHERE id=p_workshop_id) THEN
    RAISE EXCEPTION 'Taller no encontrado' USING ERRCODE='22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('bt_creator:' || p_workshop_id::text, 0)
  );
  SELECT e.next_state,e.workshop_id,e.actor_id,e.request_payload INTO v_existing FROM bt_platform_private.subscription_events e
  WHERE e.request_id=p_request_id;
  IF FOUND THEN
    IF v_existing.workshop_id<>p_workshop_id OR v_existing.actor_id<>v_actor OR
      v_existing.request_payload IS DISTINCT FROM pg_catalog.jsonb_build_array(p_workshop_id,p_plan,p_mode,p_days,btrim(p_reason)) THEN
      RAISE EXCEPTION 'Request id reused' USING ERRCODE='23505'; END IF;
    RETURN v_existing.next_state;
  END IF;
  IF EXISTS(SELECT 1 FROM bt_platform_private.subscription_events e
            WHERE e.request_id=p_request_id) THEN
    RAISE EXCEPTION 'ID de operación ya utilizado' USING ERRCODE='23505';
  END IF;

  SELECT * INTO v_old
  FROM bt_platform_private.subscriptions WHERE workshop_id=p_workshop_id FOR UPDATE;
  IF p_mode='basic' THEN
    IF p_plan<>'basic' THEN RAISE EXCEPTION 'El modo Básico requiere plan basic' USING ERRCODE='22023'; END IF;
    v_plan:='basic'; v_state:='active'; v_lifetime:=false; v_expiry:=NULL;
  ELSIF p_mode='revoke' THEN
    IF v_old.workshop_id IS NULL OR v_old.state<>'active' OR v_old.plan='basic' THEN
      RAISE EXCEPTION 'No hay plan pagado manual activo para revocar' USING ERRCODE='22023';
    END IF;
    v_plan:=v_old.plan; v_state:='revoked'; v_lifetime:=false; v_expiry:=now();
  ELSE
    IF p_plan NOT IN ('plus','full') THEN
      RAISE EXCEPTION 'El beneficio requiere Plus o Full' USING ERRCODE='22023';
    END IF;
    v_plan:=p_plan; v_state:='active';
    IF p_mode='lifetime' THEN
      v_lifetime:=true; v_expiry:=NULL;
    ELSE
      IF p_days IS NULL OR p_days NOT BETWEEN 1 AND 3650 THEN
        RAISE EXCEPTION 'Duración válida: 1 a 3650 días' USING ERRCODE='22023';
      END IF;
      v_lifetime:=false;
      IF p_mode='extend_days' THEN
        IF v_old.workshop_id IS NULL OR v_old.state<>'active' OR
           v_old.plan<>p_plan OR v_old.is_lifetime OR v_old.expires_at IS NULL THEN
          RAISE EXCEPTION 'Solo se puede extender un plan temporal del mismo tipo' USING ERRCODE='22023';
        END IF;
        v_expiry:=GREATEST(now(),v_old.expires_at)
          + pg_catalog.make_interval(days=>p_days);
      ELSE
        v_expiry:=now()+pg_catalog.make_interval(days=>p_days);
      END IF;
    END IF;
  END IF;

  INSERT INTO bt_platform_private.subscriptions AS s
    (workshop_id,plan,state,source,is_lifetime,expires_at,updated_by,updated_at)
  VALUES (p_workshop_id,v_plan,v_state,'manual',v_lifetime,v_expiry,v_actor,now())
  ON CONFLICT (workshop_id) DO UPDATE SET
    plan=excluded.plan, state=excluded.state, source=excluded.source,
    is_lifetime=excluded.is_lifetime, expires_at=excluded.expires_at,
    updated_by=excluded.updated_by, updated_at=now()
  RETURNING pg_catalog.to_jsonb(s.*) INTO v_new;

  INSERT INTO bt_platform_private.subscription_events
    (request_id,workshop_id,actor_id,mode,reason,previous_state,next_state,request_payload)
  VALUES (p_request_id,p_workshop_id,v_actor,p_mode,btrim(p_reason),
    CASE WHEN v_old.workshop_id IS NULL THEN NULL ELSE pg_catalog.to_jsonb(v_old) END, v_new,pg_catalog.jsonb_build_array(p_workshop_id,p_plan,p_mode,p_days,btrim(p_reason)));
  RETURN v_new;
END;
$fn$;

REVOKE ALL ON FUNCTION bt_platform_private.manage_legacy_subscription(uuid,text,text,integer,text,uuid) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.bt_creator_manage_subscription(p_workshop_id uuid,p_plan text,p_mode text,p_days integer,p_reason text,p_request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid;
BEGIN
 PERFORM bt_platform_private.actor();
 IF NOT public.bt_creator_is_creator() OR coalesce(auth.jwt()->>'aal','')<>'aal2' THEN
  RAISE EXCEPTION 'Creator MFA required' USING ERRCODE='42501'; END IF;
 SELECT user_id INTO u FROM bt_platform_private.account_entitlements WHERE bound_workshop_id=p_workshop_id;
 IF u IS NOT NULL THEN RETURN public.bt_creator04_manage_account(u,p_plan,p_mode,p_days,p_reason,p_request_id); END IF;
 RETURN bt_platform_private.manage_legacy_subscription(p_workshop_id,p_plan,p_mode,p_days,p_reason,p_request_id);
END $$;
REVOKE ALL ON FUNCTION public.bt_creator_manage_subscription(uuid,text,text,integer,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_creator_manage_subscription(uuid,text,text,integer,text,uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.bt_creator04_accounts(p_query text DEFAULT '', p_limit integer DEFAULT 25)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE
  v_query text := lower(btrim(coalesce(p_query,'')));
  v_accounts jsonb;
BEGIN
  PERFORM bt_platform_private.actor();
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


CREATE OR REPLACE FUNCTION public.bt_creator_overview()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE v_workshops jsonb; v_events jsonb;
BEGIN
 PERFORM bt_platform_private.actor();
  IF NOT public.bt_creator_is_creator() THEN
    RAISE EXCEPTION 'Acceso reservado al creador' USING ERRCODE='42501';
  END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', w.id,
      'name', w.name,
      'workshopStatus', w.status,
      'ownerEmail', (SELECT u.email FROM public.workshop_memberships m JOIN auth.users u ON u.id=m.user_id
                     WHERE m.workshop_id=w.id AND m.role='owner' AND m.status='active'
                     ORDER BY m.created_at ASC LIMIT 1),
      'plan', coalesce(s.plan,'basic'),
      'effectivePlan', CASE
          WHEN s.state='active' AND (s.is_lifetime OR s.expires_at IS NULL OR s.expires_at>now()) THEN s.plan
          ELSE 'basic' END,
      'state', coalesce(s.state,'active'),
      'source', coalesce(s.source,'default'),
      'expiresAt', s.expires_at,
      'isLifetime', coalesce(s.is_lifetime,false),
      'mechanics', (SELECT count(*) FROM public.workshop_memberships m WHERE m.workshop_id=w.id
                     AND m.role='mechanic' AND m.status='active')
    ) ORDER BY w.created_at DESC), '[]'::jsonb)
  INTO v_workshops
  FROM (SELECT * FROM public.workshops ORDER BY created_at DESC LIMIT 100) w
  LEFT JOIN bt_platform_private.subscriptions s ON s.workshop_id=w.id;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', e.id, 'workshopId', e.workshop_id, 'mode', e.mode,
      'reason', e.reason, 'recordedAt', e.recorded_at
    ) ORDER BY e.recorded_at DESC), '[]'::jsonb)
  INTO v_events
  FROM (SELECT * FROM bt_platform_private.subscription_events ORDER BY recorded_at DESC LIMIT 20) e;
  RETURN jsonb_build_object('workshops',v_workshops,'recentEvents',v_events,
      'billingEnabled',false,'manualPlanEnforcementEnabled',false);
END;
$fn$;
REVOKE ALL ON FUNCTION public.bt_creator_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bt_creator_overview() TO authenticated;


COMMIT;
