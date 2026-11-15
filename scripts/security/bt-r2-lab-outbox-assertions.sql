-- R2-A6: ACTUAL PostgreSQL 17 assertions against synthetic fixtures ONLY.
\set ON_ERROR_STOP on
DO $$
BEGIN
 IF has_table_privilege('anon','bt_private.workshop_invitation_outbox','SELECT')
  OR has_table_privilege('authenticated','bt_private.workshop_invitation_outbox','SELECT')
  OR has_function_privilege('authenticated',
    'public.bt_r2_claim_invitation_email()','EXECUTE')
  OR has_function_privilege('anon',
    'public.bt_r2_reserve_and_queue_mechanic_invite(uuid,uuid,text,text,timestamptz,text,text)','EXECUTE')
  OR NOT (SELECT relrowsecurity FROM pg_catalog.pg_class
           WHERE oid='bt_private.workshop_invitation_outbox'::regclass)
 THEN RAISE EXCEPTION 'FAIL: outbox grants/RLS exposed'; END IF;
END $$;
\echo PASS: encrypted outbox private RLS/grants

-- Every scenario is ROLLBACK: no mutation leaks into subsequent tests.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
 a uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 owner_a uuid := '11111111-1111-4111-8111-111111111111';
 other_owner uuid := '55555555-5555-4555-8555-555555555555';
 one uuid;
 job record;
BEGIN
  -- Plus permits two reservations so the second reaches the UNIQUE nonce
  -- constraint, rather than failing early at the Basic mechanic seat cap.
  INSERT INTO bt_private.workshop_mechanic_entitlements(workshop_id,plan)
    VALUES (a,'plus');
  BEGIN
    PERFORM public.bt_r2_reserve_and_queue_mechanic_invite(
      other_owner,a,'newmech1@example.com',repeat('a',64),
      now()+interval '1 hour',repeat('c',128),repeat('1',24));
    RAISE EXCEPTION 'FAIL cross-tenant managed to queue';
  EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;

  one := public.bt_r2_reserve_and_queue_mechanic_invite(
    owner_a,a,'newmech1@example.com',repeat('a',64),
    now()+interval '1 hour',repeat('c',128),repeat('1',24));
  IF one IS NULL THEN RAISE EXCEPTION 'FAIL missing reservation'; END IF;
  IF (SELECT count(*) FROM bt_private.workshop_invitation_outbox
      WHERE invitation_id=one AND workshop_id=a AND status='queued')<>1
  THEN RAISE EXCEPTION 'FAIL no atomic queue'; END IF;
  -- Duplicate nonce forces rollback of second invitation and audit.
  BEGIN
    PERFORM public.bt_r2_reserve_and_queue_mechanic_invite(
      owner_a,a,'newmech2@example.com',repeat('b',64),
      now()+interval '1 hour',repeat('d',128),repeat('1',24));
    RAISE EXCEPTION 'FAIL duplicate nonce accepted';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  IF (SELECT count(*) FROM bt_private.workshop_mechanic_invitations
       WHERE workshop_id=a AND status='pending')<>1
  THEN RAISE EXCEPTION 'FAIL orphan invitation after outbox collision'; END IF;

  SELECT * INTO job FROM public.bt_r2_claim_invitation_email();
  IF job.outbox_id IS NULL OR job.invitation_id<>one OR
    job.workshop_id<>a OR job.nonce_hex<>repeat('1',24) OR
    job.ciphertext_hex<>repeat('c',128) OR
    job.attempt_number<>1 OR job.recipient_email<>'newmech1@example.com'
  THEN RAISE EXCEPTION 'FAIL lease claim invalid'; END IF;
  IF public.bt_r2_mark_invitation_email_sent(job.outbox_id,gen_random_uuid(),'accepted') THEN
    RAISE EXCEPTION 'FAIL wrong lease acknowledged'; END IF;
  IF NOT public.bt_r2_mark_invitation_email_sent(job.outbox_id,job.lease_id,'provider-test-id') THEN
    RAISE EXCEPTION 'FAIL valid lease cannot acknowledge'; END IF;
  IF public.bt_r2_mark_invitation_email_sent(job.outbox_id,job.lease_id,'provider-test-id') THEN
    RAISE EXCEPTION 'FAIL duplicate acknowledgment'; END IF;
  IF (SELECT count(*) FROM bt_private.workshop_invitation_outbox
       WHERE invitation_id=one AND status='sent' AND
       ciphertext IS NULL AND nonce IS NULL AND attempts=1 AND
       provider_message_id='provider-test-id')<>1
  THEN RAISE EXCEPTION 'FAIL encrypted body retained after provider acceptance'; END IF;
  SELECT * INTO job FROM public.bt_r2_claim_invitation_email();
  IF job.outbox_id IS NOT NULL THEN RAISE EXCEPTION 'FAIL claimed already sent'; END IF;
END $$;
ROLLBACK;
\echo PASS: atomic reservation+encrypted queue, cross-tenant denied, nonce uniqueness, one-time ack, ciphertext erased

BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
 a uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 owner_a uuid := '11111111-1111-4111-8111-111111111111';
 one uuid;
 job record;
 outcome text;
 attempt integer;
BEGIN
 one := public.bt_r2_reserve_and_queue_mechanic_invite(
   owner_a,a,'newmech1@example.com',repeat('a',64),
   now()+interval '1 hour',repeat('c',128),repeat('1',24));
 FOR attempt IN 1..5 LOOP
   SELECT * INTO job FROM public.bt_r2_claim_invitation_email();
   IF job.invitation_id<>one OR job.attempt_number<>attempt
   THEN RAISE EXCEPTION 'FAIL wrong delivery attempt %',attempt; END IF;
   IF public.bt_r2_fail_or_retry_invitation_email(
       job.outbox_id,gen_random_uuid()) <> 'ignored'
   THEN RAISE EXCEPTION 'FAIL wrong lease allowed failure'; END IF;
   outcome := public.bt_r2_fail_or_retry_invitation_email(job.outbox_id,job.lease_id);
   IF outcome <> (CASE WHEN attempt=5 THEN 'failed' ELSE 'retry' END)
   THEN RAISE EXCEPTION 'FAIL expected retry/failure at %, got %',attempt,outcome; END IF;
   IF attempt<5 THEN
     UPDATE bt_private.workshop_invitation_outbox
       SET next_attempt_at=now()-interval '1 second'
      WHERE id=job.outbox_id;
   END IF;
 END LOOP;
 IF (SELECT count(*) FROM bt_private.workshop_invitation_outbox
      WHERE invitation_id=one AND status='failed' AND
      ciphertext IS NULL AND nonce IS NULL AND attempts=5)<>1
 THEN RAISE EXCEPTION 'FAIL failed outbox retained secret'; END IF;
 IF (SELECT count(*) FROM bt_private.workshop_mechanic_invitations
      WHERE id=one AND status='revoked')<>1
 THEN RAISE EXCEPTION 'FAIL exhausted invite remains pending'; END IF;
 SELECT * INTO job FROM public.bt_r2_claim_invitation_email();
 IF job.outbox_id IS NOT NULL THEN RAISE EXCEPTION 'FAIL exhausted outbox reclaimable'; END IF;
END $$;
ROLLBACK;
\echo PASS: bounded retries, lease ownership, exhausted invites revoked, ciphertext erased
