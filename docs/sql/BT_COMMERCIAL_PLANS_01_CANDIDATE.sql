-- CANDIDATE ONLY: B01 included seats 0/2/4; extras and validity unchanged. No data edits, new grants, GATE4 changes or hosted execution.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
-- Preflight: exact installed contract, dependencies, security/ACL and retained data.
DO $pre$
BEGIN
 IF to_regprocedure('bt_platform_private.seats(uuid)') IS NULL OR
    to_regprocedure('public.bt_plan04_manage_mechanic(uuid,text,text,uuid,uuid)') IS NULL OR
    to_regprocedure('public.bt_plan04_accept_mechanic(text)') IS NULL OR
    to_regprocedure('public.bt_plan04_team(uuid)') IS NULL THEN RAISE EXCEPTION 'PLANS_DEPENDENCY_MISSING';END IF;
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='bt_platform_private.seats(uuid)'::regprocedure)<>'42c0fc7b566269191c73fb34f4b5cacf' THEN RAISE EXCEPTION 'PLANS_SEATS_CONTRACT_DRIFT';END IF;
 IF (SELECT NOT prosecdef OR provolatile<>'s' OR proconfig IS DISTINCT FROM ARRAY['search_path=""'] FROM pg_proc WHERE oid='bt_platform_private.seats(uuid)'::regprocedure) THEN RAISE EXCEPTION 'PLANS_SECURITY_DRIFT';END IF;
 IF has_function_privilege('anon','bt_platform_private.seats(uuid)','EXECUTE') OR has_function_privilege('authenticated','bt_platform_private.seats(uuid)','EXECUTE') THEN RAISE EXCEPTION 'PLANS_PRIVATE_ACL_DRIFT';END IF;
END $pre$;
CREATE TEMP TABLE bt_plans_before ON COMMIT DROP AS
 SELECT (SELECT count(*) FROM public.workshop_memberships) AS members,
 (SELECT count(*) FROM bt_platform_private.mechanic_invites) AS invites,
 (SELECT proacl FROM pg_proc WHERE oid='bt_platform_private.seats(uuid)'::regprocedure) AS acl,
 (SELECT proowner FROM pg_proc WHERE oid='bt_platform_private.seats(uuid)'::regprocedure) AS owner;
CREATE OR REPLACE FUNCTION bt_platform_private.seats(w uuid) RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce((SELECT CASE WHEN s.state='active' AND (s.is_lifetime OR s.expires_at IS NULL OR s.expires_at>now())
  THEN CASE s.plan WHEN 'plus' THEN 2 WHEN 'full' THEN 4 ELSE 0 END ELSE 0 END
  FROM bt_platform_private.subscriptions s WHERE s.workshop_id=w),0)
 + coalesce((SELECT e.seats FROM bt_platform_private.mechanic_extras e WHERE e.workshop_id=w AND e.expires_at>now()
   AND EXISTS(SELECT 1 FROM bt_platform_private.subscriptions s WHERE s.workshop_id=w AND s.plan IN('plus','full')
   AND s.state='active' AND (s.is_lifetime OR s.expires_at IS NULL OR s.expires_at>now()))),0);
$$;
DO $post$
BEGIN
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='bt_platform_private.seats(uuid)'::regprocedure)<>'8e431729bf340f1dda00e946a5b32ecb' THEN RAISE EXCEPTION 'PLANS_POSTFLIGHT_BODY';END IF;
 IF EXISTS(SELECT 1 FROM bt_plans_before b JOIN pg_proc p ON p.oid='bt_platform_private.seats(uuid)'::regprocedure WHERE p.proacl IS DISTINCT FROM b.acl OR p.proowner<>b.owner) THEN RAISE EXCEPTION 'PLANS_POSTFLIGHT_ACL';END IF;
 IF (SELECT count(*) FROM public.workshop_memberships)<>(SELECT members FROM bt_plans_before) OR (SELECT count(*) FROM bt_platform_private.mechanic_invites)<>(SELECT invites FROM bt_plans_before) THEN RAISE EXCEPTION 'PLANS_POSTFLIGHT_DATA';END IF;
END $post$;
COMMIT;
