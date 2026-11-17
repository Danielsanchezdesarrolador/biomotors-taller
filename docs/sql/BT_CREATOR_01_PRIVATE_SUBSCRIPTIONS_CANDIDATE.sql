-- BT-CREATOR-01 · aditiva. NO pagos, no suscripciones por evento financiero.
-- El usuario creador se asigna de forma controlada DESPUÉS en privado; nunca por metadata ni por signup.
CREATE SCHEMA IF NOT EXISTS bt_platform_private;
REVOKE ALL ON SCHEMA bt_platform_private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS bt_platform_private.creators (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bt_platform_private.subscriptions (
  workshop_id uuid PRIMARY KEY REFERENCES public.workshops(id) ON DELETE RESTRICT,
  plan text NOT NULL CHECK (plan IN ('basic','plus','full')),
  state text NOT NULL CHECK (state IN ('active','revoked')),
  source text NOT NULL CHECK (source IN ('manual','billing','trial')),
  is_lifetime boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bt_subscription_lifetime_no_expiry CHECK (NOT is_lifetime OR expires_at IS NULL)
);
CREATE TABLE IF NOT EXISTS bt_platform_private.subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL UNIQUE,
  workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE RESTRICT,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  mode text NOT NULL,
  reason text NOT NULL,
  previous_state jsonb,
  next_state jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bt_subscription_events_workshop_recent
  ON bt_platform_private.subscription_events(workshop_id, recorded_at DESC);

ALTER TABLE bt_platform_private.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.creators FORCE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.subscription_events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA bt_platform_private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA bt_platform_private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.bt_creator_is_creator()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM bt_platform_private.creators c
    JOIN auth.users u ON u.id=c.user_id
    WHERE c.user_id=(SELECT auth.uid())
      AND u.email_confirmed_at IS NOT NULL
      AND u.banned_until IS NULL
  );
$fn$;
REVOKE ALL ON FUNCTION public.bt_creator_is_creator() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bt_creator_is_creator() TO authenticated;

CREATE OR REPLACE FUNCTION public.bt_creator_overview()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE v_workshops jsonb; v_events jsonb;
BEGIN
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

CREATE OR REPLACE FUNCTION public.bt_creator_manage_subscription(
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
  v_existing jsonb;
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
  IF p_mode NOT IN ('basic','grant_days','extend_days','lifetime','revoke') OR
     p_plan NOT IN ('basic','plus','full') THEN
    RAISE EXCEPTION 'Plan o modo inválido' USING ERRCODE='22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.workshops WHERE id=p_workshop_id) THEN
    RAISE EXCEPTION 'Taller no encontrado' USING ERRCODE='22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('bt_creator:' || p_workshop_id::text, 0)
  );
  SELECT e.next_state INTO v_existing FROM bt_platform_private.subscription_events e
  WHERE e.request_id=p_request_id AND e.actor_id=v_actor;
  IF FOUND THEN RETURN v_existing; END IF;
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
        v_expiry:=pg_catalog.greatest(now(),v_old.expires_at)
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
    (request_id,workshop_id,actor_id,mode,reason,previous_state,next_state)
  VALUES (p_request_id,p_workshop_id,v_actor,p_mode,btrim(p_reason),
    CASE WHEN v_old.workshop_id IS NULL THEN NULL ELSE pg_catalog.to_jsonb(v_old) END, v_new);
  RETURN v_new;
END;
$fn$;
REVOKE ALL ON FUNCTION public.bt_creator_manage_subscription(uuid,text,text,integer,text,uuid)
 FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bt_creator_manage_subscription(uuid,text,text,integer,text,uuid)
 TO authenticated;
