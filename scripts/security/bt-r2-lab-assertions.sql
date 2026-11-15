-- R2-A3: real PostgreSQL assertions in an EPHEMERAL isolated container.
-- Synthetic identities only. Each behavioral scenario rolls back.
\set ON_ERROR_STOP on

-- Test role grants, exposed functions and RLS before switching role.
DO $$
BEGIN
  IF has_schema_privilege('anon','bt_private','USAGE') OR
     has_schema_privilege('authenticated','bt_private','USAGE') OR
     has_table_privilege('anon','bt_private.workshop_mechanic_invitations','SELECT') OR
     has_table_privilege('authenticated','bt_private.workshop_mechanic_invitations','SELECT') OR
     has_function_privilege('anon','public.bt_r2_reserve_mechanic_invite(uuid,uuid,text,text,timestamptz)','EXECUTE') OR
     has_function_privilege('authenticated','public.bt_r2_accept_mechanic_invite(uuid,text,text)','EXECUTE') OR
     has_function_privilege('authenticated','public.bt_r2_revoke_mechanic_invite(uuid,uuid,uuid)','EXECUTE')
  THEN RAISE EXCEPTION 'FAIL public privileges must stay revoked'; END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='bt_private.workshop_mechanic_invitations'::regclass)
  THEN RAISE EXCEPTION 'FAIL private RLS required'; END IF;
END $$;
\echo PASS: denied anon/authenticated grants, private RLS and RPC permissions

-- Test owner/admin BOLA, genuine limits, acceptance one time & wrong email.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
  w uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  o uuid := '11111111-1111-4111-8111-111111111111';
  b uuid := '55555555-5555-4555-8555-555555555555';
  m uuid := '33333333-3333-4333-8333-333333333333';
  r uuid := '44444444-4444-4444-8444-444444444444';
  n uuid := '66666666-6666-4666-8666-666666666666';
  invitation uuid;
BEGIN
  BEGIN
    PERFORM public.bt_r2_reserve_mechanic_invite(b,w,'bad@example.com',repeat('b',64),now()+interval '1 hour');
    RAISE EXCEPTION 'FAIL other workshop owner elevated';
  EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;
  BEGIN
    PERFORM public.bt_r2_reserve_mechanic_invite(r,w,'bad@example.com',repeat('b',64),now()+interval '1 hour');
    RAISE EXCEPTION 'FAIL receptionist elevated';
  EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;
  BEGIN
    PERFORM public.bt_r2_reserve_mechanic_invite(m,w,'bad@example.com',repeat('b',64),now()+interval '1 hour');
    RAISE EXCEPTION 'FAIL mechanic elevated';
  EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;
  invitation := public.bt_r2_reserve_mechanic_invite(o,w,'newmech1@example.com',repeat('a',64),now()+interval '1 hour');
  IF invitation IS NULL THEN RAISE EXCEPTION 'FAIL reservation missing'; END IF;
  IF public.bt_r2_accept_mechanic_invite(n,'wrong@example.com',repeat('a',64)) THEN
    RAISE EXCEPTION 'FAIL wrong email accepted'; END IF;
  IF public.bt_r2_accept_mechanic_invite(n,'newmech1@example.com',repeat('b',64)) THEN
    RAISE EXCEPTION 'FAIL wrong token accepted'; END IF;
  IF NOT public.bt_r2_accept_mechanic_invite(n,'newmech1@example.com',repeat('a',64)) THEN
    RAISE EXCEPTION 'FAIL verified mechanic not accepted'; END IF;
  IF public.bt_r2_accept_mechanic_invite(n,'newmech1@example.com',repeat('a',64)) THEN
    RAISE EXCEPTION 'FAIL reused token accepted'; END IF;
  IF (SELECT count(*) FROM public.workshop_memberships WHERE workshop_id=w AND role='mechanic' AND status='active') <> 2 THEN
    RAISE EXCEPTION 'FAIL expected two mechanics'; END IF;
  IF (SELECT count(*) FROM bt_private.workshop_invitation_audit WHERE invitation_id=invitation) <> 2 THEN
    RAISE EXCEPTION 'FAIL missing creation/acceptance audit'; END IF;
  BEGIN
    PERFORM public.bt_r2_reserve_mechanic_invite(o,w,'newmech2@example.com',repeat('c',64),now()+interval '1 hour');
    RAISE EXCEPTION 'FAIL basic allowed third mechanic';
  EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
END $$;
ROLLBACK;
\echo PASS: other-tenant/role denied, basic cap, verified acceptance, replay, audit

-- Test owner-admin revocation, expired token, and revoked token.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
  w uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  o uuid := '11111111-1111-4111-8111-111111111111';
  b uuid := '55555555-5555-4555-8555-555555555555';
  a uuid := '22222222-2222-4222-8222-222222222222';
  n uuid := '66666666-6666-4666-8666-666666666666';
  invitation uuid;
BEGIN
  invitation := public.bt_r2_reserve_mechanic_invite(a,w,'newmech1@example.com',repeat('d',64),now()+interval '1 hour');
  IF public.bt_r2_revoke_mechanic_invite(b,w,invitation) THEN
    RAISE EXCEPTION 'FAIL other-tenant revocation'; END IF;
  IF NOT public.bt_r2_revoke_mechanic_invite(a,w,invitation) THEN
    RAISE EXCEPTION 'FAIL admin could not revoke'; END IF;
  IF public.bt_r2_revoke_mechanic_invite(a,w,invitation) THEN
    RAISE EXCEPTION 'FAIL duplicate revocation'; END IF;
  IF public.bt_r2_accept_mechanic_invite(n,'newmech1@example.com',repeat('d',64)) THEN
    RAISE EXCEPTION 'FAIL revoked token accepted'; END IF;
  invitation := public.bt_r2_reserve_mechanic_invite(o,w,'newmech1@example.com',repeat('e',64),now()+interval '1 hour');
  UPDATE bt_private.workshop_mechanic_invitations
     SET created_at=now()-interval '2 days',expires_at=now()-interval '1 day'
   WHERE id=invitation;
  IF public.bt_r2_accept_mechanic_invite(n,'newmech1@example.com',repeat('e',64)) THEN
    RAISE EXCEPTION 'FAIL expired token accepted'; END IF;
END $$;
ROLLBACK;
\echo PASS: revoke and expiry controls

-- Plus and Full each fill their own synthetic workshop; never the ninth seat.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
  w uuid;
  o uuid;
  plan text;
  i int;
  count_to int;
  prefix text;
BEGIN
  FOREACH plan IN ARRAY ARRAY['plus','full'] LOOP
    w := CASE WHEN plan='plus'
      THEN 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid
      ELSE 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid END;
    o := CASE WHEN plan='plus'
      THEN '11111111-1111-4111-8111-111111111111'::uuid
      ELSE '55555555-5555-4555-8555-555555555555'::uuid END;
    count_to := CASE WHEN plan='plus' THEN 7 ELSE 8 END;
    prefix := CASE WHEN plan='plus' THEN 'f' ELSE 'd' END;
    INSERT INTO bt_private.workshop_mechanic_entitlements(workshop_id,plan)
    VALUES (w,plan);
    FOR i IN 1..count_to LOOP
      PERFORM public.bt_r2_reserve_mechanic_invite(o,w,
        'slot'||i||'@example.com',
        repeat(prefix,63)||i::text,now()+interval '1 hour');
    END LOOP;
    IF (SELECT count(*) FROM bt_private.workshop_mechanic_invitations
        WHERE workshop_id=w AND status='pending') <> count_to THEN
      RAISE EXCEPTION 'FAIL expected % reservations, plan %',count_to,plan; END IF;
    BEGIN
      PERFORM public.bt_r2_reserve_mechanic_invite(o,w,'slot9@example.com',
        repeat('e',63)||CASE WHEN plan='plus' THEN '1' ELSE '2' END,
        now()+interval '1 hour');
      RAISE EXCEPTION 'FAIL nine occupied slots allowed, plan %',plan;
    EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
  END LOOP;
END $$;
ROLLBACK;
\echo PASS: Plus/Full 8/8 occupied; 9th denied

-- Downgrade blocks acceptance above the Basic quota; history not erased.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
  w uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  o uuid := '11111111-1111-4111-8111-111111111111';
  n uuid := '66666666-6666-4666-8666-666666666666';
  i int;
BEGIN
  INSERT INTO bt_private.workshop_mechanic_entitlements(workshop_id,plan) VALUES (w,'full');
  PERFORM public.bt_r2_reserve_mechanic_invite(o,w,'newmech1@example.com',repeat('1',64),now()+interval '1 hour');
  FOR i IN 2..7 LOOP
    PERFORM public.bt_r2_reserve_mechanic_invite(o,w,'slot'||i||'@example.com',
      repeat('f',63)||i::text,now()+interval '1 hour');
  END LOOP;
  UPDATE bt_private.workshop_mechanic_entitlements SET plan='basic' WHERE workshop_id=w;
  IF public.bt_r2_accept_mechanic_invite(n,'newmech1@example.com',repeat('1',64)) THEN
    RAISE EXCEPTION 'FAIL downgrade accepted over-capacity token'; END IF;
  IF (SELECT count(*) FROM public.workshop_memberships WHERE workshop_id=w AND role='mechanic') <> 1 THEN
    RAISE EXCEPTION 'FAIL downgrade removed or inserted memberships'; END IF;
END $$;
ROLLBACK;
\echo PASS: downgrade does not delete history or grant over-quota seats
