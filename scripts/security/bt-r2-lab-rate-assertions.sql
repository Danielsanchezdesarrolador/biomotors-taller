-- Real Postgres 17 rate-limit tests, synthetic identities, transaction rollback.
\set ON_ERROR_STOP on
DO $$
BEGIN
  IF has_table_privilege('anon','bt_private.mechanic_invite_attempts','SELECT')
     OR has_table_privilege('authenticated','bt_private.mechanic_invite_attempts','SELECT')
     OR has_function_privilege('anon','public.bt_r2_take_mechanic_invite_rate_slot(uuid,text,uuid)','EXECUTE')
     OR has_function_privilege('authenticated','public.bt_r2_take_mechanic_invite_rate_slot(uuid,text,uuid)','EXECUTE')
     OR NOT (SELECT relrowsecurity FROM pg_class WHERE oid='bt_private.mechanic_invite_attempts'::regclass)
  THEN RAISE EXCEPTION 'FAIL: throttle table or function publicly exposed'; END IF;
END $$;
\echo PASS: throttle private grants and RLS
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
  actor uuid := '11111111-1111-4111-8111-111111111111';
  a uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  b uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  other_actor uuid := '55555555-5555-4555-8555-555555555555';
  i integer;
BEGIN
  FOR i IN 1..5 LOOP
    IF NOT public.bt_r2_take_mechanic_invite_rate_slot(actor,'invite',a) THEN
      RAISE EXCEPTION 'FAIL: invitation request % should be allowed',i; END IF;
  END LOOP;
  IF public.bt_r2_take_mechanic_invite_rate_slot(actor,'invite',a) THEN
    RAISE EXCEPTION 'FAIL: 6th invitation request was allowed'; END IF;
  IF NOT public.bt_r2_take_mechanic_invite_rate_slot(actor,'invite',b) THEN
    RAISE EXCEPTION 'FAIL: separate workshop must have own budget'; END IF;
  IF NOT public.bt_r2_take_mechanic_invite_rate_slot(other_actor,'invite',a) THEN
    RAISE EXCEPTION 'FAIL: separate actor must have own budget'; END IF;
  FOR i IN 1..10 LOOP
    IF NOT public.bt_r2_take_mechanic_invite_rate_slot(actor,'accept') THEN
      RAISE EXCEPTION 'FAIL: acceptance attempt % should be allowed',i; END IF;
  END LOOP;
  IF public.bt_r2_take_mechanic_invite_rate_slot(actor,'accept') THEN
    RAISE EXCEPTION 'FAIL: 11th acceptance attempt was allowed'; END IF;
  FOR i IN 1..10 LOOP
    IF NOT public.bt_r2_take_mechanic_invite_rate_slot(actor,'revoke',a) THEN
      RAISE EXCEPTION 'FAIL: revoke attempt % should be allowed',i; END IF;
  END LOOP;
  IF public.bt_r2_take_mechanic_invite_rate_slot(actor,'revoke',a) THEN
    RAISE EXCEPTION 'FAIL: 11th revoke attempt allowed'; END IF;
  IF public.bt_r2_take_mechanic_invite_rate_slot(actor,'accept',a)
    OR public.bt_r2_take_mechanic_invite_rate_slot(actor,'invite',NULL)
    OR public.bt_r2_take_mechanic_invite_rate_slot(actor,'owner',a)
    OR public.bt_r2_take_mechanic_invite_rate_slot(NULL,'accept')
  THEN RAISE EXCEPTION 'FAIL: invalid scope/actor/action accepted'; END IF;
  IF (SELECT attempts FROM bt_private.mechanic_invite_attempts
      WHERE actor_user_id=actor AND action='invite' AND scope=a::text) <> 5
  THEN RAISE EXCEPTION 'FAIL: rejected attempts changed cap'; END IF;
END $$;
ROLLBACK;
\echo PASS: 5/h invite, 10/15m accept, 10/h revoke, per-actor/workshop separation
