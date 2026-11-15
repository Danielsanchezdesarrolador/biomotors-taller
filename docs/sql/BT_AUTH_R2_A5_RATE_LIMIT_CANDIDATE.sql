-- BT-AUTH-R2-A5: server-side invitation throttling candidate.
-- NOT APPLIED to hosted Supabase. Must run only after R2-A private schema exists.
-- Call only from trusted Edge backend AFTER verifying /auth/v1/user.
-- This does not replace provider/WAF IP throttles or spam/email abuse controls.
-- A request cannot choose its actor, plan, rate limit or throttle scope.
CREATE TABLE bt_private.mechanic_invite_attempts (
  actor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('invite','accept','revoke')),
  scope text NOT NULL CHECK (scope = 'global' OR
    scope ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'),
  window_started_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 1 CHECK (attempts BETWEEN 1 AND 10),
  PRIMARY KEY(actor_user_id,action,scope,window_started_at)
);
ALTER TABLE bt_private.mechanic_invite_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE bt_private.mechanic_invite_attempts FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE bt_private.mechanic_invite_attempts TO service_role;

-- Atomic, per-actor rate limit; suitable for concurrent Edge requests.
-- Invite: 5 per hour for each workshop. Revoke: 10/hour/workshop.
-- Accept: 10 attempts per 15 minutes across all workshops (unknown until token matched).
-- The RPC makes no changes to memberships/invitations and never logs secrets.
CREATE FUNCTION public.bt_r2_take_mechanic_invite_rate_slot(
  p_actor_user_id uuid,
  p_action text,
  p_workshop_id uuid DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_limit integer;
  v_window_seconds integer;
  v_scope text;
  v_bucket timestamptz;
  v_attempts integer;
BEGIN
  IF p_actor_user_id IS NULL
     OR p_action IS NULL
     OR p_action NOT IN ('invite','accept','revoke')
     OR (p_action = 'accept' AND p_workshop_id IS NOT NULL)
     OR (p_action IN ('invite','revoke') AND p_workshop_id IS NULL)
  THEN RETURN false; END IF;
  v_limit := CASE p_action WHEN 'invite' THEN 5 ELSE 10 END;
  v_window_seconds := CASE p_action WHEN 'accept' THEN 900 ELSE 3600 END;
  v_scope := CASE p_action WHEN 'accept' THEN 'global' ELSE p_workshop_id::text END;
  v_bucket := pg_catalog.to_timestamp(
    pg_catalog.floor(pg_catalog.extract(epoch FROM pg_catalog.transaction_timestamp())
      / v_window_seconds) * v_window_seconds
  );
  INSERT INTO bt_private.mechanic_invite_attempts
    (actor_user_id,action,scope,window_started_at,attempts)
  VALUES (p_actor_user_id,p_action,v_scope,v_bucket,1)
  ON CONFLICT (actor_user_id,action,scope,window_started_at)
  DO UPDATE SET attempts = bt_private.mechanic_invite_attempts.attempts + 1
    WHERE bt_private.mechanic_invite_attempts.attempts < v_limit
  RETURNING attempts INTO v_attempts;
  RETURN v_attempts IS NOT NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.bt_r2_take_mechanic_invite_rate_slot(uuid,text,uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bt_r2_take_mechanic_invite_rate_slot(uuid,text,uuid)
  TO service_role;
COMMENT ON FUNCTION public.bt_r2_take_mechanic_invite_rate_slot(uuid,text,uuid)
  IS 'ByteTorque R2-A5 candidate; atomic request rate limiting, backend-only; not deployed.';

-- Retention plan, not enabled: purge buckets older than 7 days with a
-- scheduled backend job, without actor emails/IP/token in database logs.
-- IP/device throttles and SMTP send quotas must be provided separately.
