-- R2-A6 WORKER: synthetic PostgreSQL 17 only. All writes ROLLBACK.
\set ON_ERROR_STOP on
DO $$
BEGIN
 IF has_function_privilege('authenticated',
   'public.bt_r2_revoke_and_cancel_mechanic_invite(uuid,uuid,uuid)','EXECUTE')
  OR has_function_privilege('anon',
   'public.bt_r2_reconcile_invitation_outbox(uuid)','EXECUTE')
  OR has_function_privilege('authenticated',
   'public.bt_r2_mark_invitation_email_terminal_failed(uuid,uuid)','EXECUTE')
  OR has_function_privilege('anon',
   'public.bt_r2_invitation_email_lease_valid(uuid,uuid)','EXECUTE')
 THEN RAISE EXCEPTION 'FAIL privileged worker RPC exposed'; END IF;
END $$;
\echo PASS: worker RPCs inaccessible to anon/authenticated

-- Cross-tenant composite FK protects outbox even if a service caller passes
-- a wrong workshop id, and the original invitation remains unchanged.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
  a uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  b uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  owner_a uuid := '11111111-1111-4111-8111-111111111111';
  invited uuid;
BEGIN
 invited := public.bt_r2_reserve_mechanic_invite(
   owner_a,a,'newmech1@example.com',repeat('a',64),now()+interval '1 hour');
 BEGIN
   INSERT INTO bt_private.workshop_invitation_outbox
    (invitation_id,workshop_id,ciphertext,nonce)
   VALUES(invited,b,pg_catalog.decode(repeat('b',128),'hex'),pg_catalog.decode(repeat('1',24),'hex'));
   RAISE EXCEPTION 'FAIL cross-tenant outbox accepted';
 EXCEPTION WHEN foreign_key_violation THEN NULL; END;
 IF (SELECT count(*) FROM bt_private.workshop_invitation_outbox WHERE invitation_id=invited)<>0
 THEN RAISE EXCEPTION 'FAIL mismatched outbox persisted'; END IF;
END $$;
ROLLBACK;
\echo PASS: composite foreign key denies wrong-tenant outbox

-- Admin/owner revokes + deletes encrypted payload while lease active.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
 a uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 b uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 owner_a uuid := '11111111-1111-4111-8111-111111111111';
 owner_b uuid := '55555555-5555-4555-8555-555555555555';
 invitation uuid;
 j record;
BEGIN
 invitation := public.bt_r2_reserve_and_queue_mechanic_invite(
   owner_a,a,'newmech1@example.com',repeat('a',64),
   now()+interval '1 hour',repeat('c',128),repeat('1',24));
 SELECT * INTO j FROM public.bt_r2_claim_invitation_email();
 IF j.invitation_id<>invitation OR j.token_sha256_hex<>repeat('a',64)
 THEN RAISE EXCEPTION 'FAIL claim lacks verified digest'; END IF;
 IF NOT public.bt_r2_invitation_email_lease_valid(j.outbox_id,j.lease_id)
 THEN RAISE EXCEPTION 'FAIL fresh lease invalid'; END IF;
 IF public.bt_r2_revoke_and_cancel_mechanic_invite(owner_b,a,invitation)
 THEN RAISE EXCEPTION 'FAIL cross-tenant owner revoked'; END IF;
 IF NOT public.bt_r2_revoke_and_cancel_mechanic_invite(owner_a,a,invitation)
 THEN RAISE EXCEPTION 'FAIL owner could not cancel'; END IF;
 IF public.bt_r2_invitation_email_lease_valid(j.outbox_id,j.lease_id)
 THEN RAISE EXCEPTION 'FAIL revoked lease remained valid'; END IF;
 IF public.bt_r2_mark_invitation_email_sent(j.outbox_id,j.lease_id,'provider-accepted')
 THEN RAISE EXCEPTION 'FAIL revoked lease ack succeeded'; END IF;
 IF (SELECT count(*) FROM bt_private.workshop_invitation_outbox
      WHERE id=j.outbox_id AND status='cancelled' AND
      ciphertext IS NULL AND nonce IS NULL AND lease_id IS NULL) <> 1
 THEN RAISE EXCEPTION 'FAIL cancelled outbox kept token'; END IF;
 IF (SELECT count(*) FROM bt_private.workshop_mechanic_invitations
      WHERE id=invitation AND status='revoked')<>1
 THEN RAISE EXCEPTION 'FAIL invitation not revoked'; END IF;
END $$;
ROLLBACK;
\echo PASS: same-workshop cancellation erases in-flight encrypted token

-- Expired invitation reconciles to cancelled and revokes lease.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
 a uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 owner_a uuid := '11111111-1111-4111-8111-111111111111';
 invitation uuid;
 outbox_id uuid;
BEGIN
 invitation := public.bt_r2_reserve_and_queue_mechanic_invite(
   owner_a,a,'newmech1@example.com',repeat('a',64),
   now()+interval '1 hour',repeat('c',128),repeat('1',24));
 SELECT id INTO outbox_id FROM bt_private.workshop_invitation_outbox WHERE invitation_id=invitation;
 UPDATE bt_private.workshop_mechanic_invitations
    SET created_at=now()-interval '2 days',expires_at=now()-interval '1 day'
  WHERE id=invitation;
 IF public.bt_r2_reconcile_invitation_outbox(a)<>1
 THEN RAISE EXCEPTION 'FAIL expired outbox not reconciled'; END IF;
 IF (SELECT count(*) FROM bt_private.workshop_invitation_outbox
     WHERE id=outbox_id AND status='cancelled'
       AND ciphertext IS NULL AND nonce IS NULL)<>1
 THEN RAISE EXCEPTION 'FAIL expired ciphertext retained'; END IF;
 IF (SELECT count(*) FROM bt_private.workshop_mechanic_invitations
     WHERE id=invitation AND status='expired')<>1
 THEN RAISE EXCEPTION 'FAIL invitation not expired'; END IF;
 IF public.bt_r2_reconcile_invitation_outbox(a)<>0
 THEN RAISE EXCEPTION 'FAIL repeated reconciliation changes rows'; END IF;
END $$;
ROLLBACK;
\echo PASS: expiration cleanup erases material, idempotent reconciliation

-- Provider permanent failure: terminate without five repeated attempts.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
 a uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 owner_a uuid := '11111111-1111-4111-8111-111111111111';
 invitation uuid;
 j record;
BEGIN
 invitation := public.bt_r2_reserve_and_queue_mechanic_invite(
   owner_a,a,'newmech1@example.com',repeat('a',64),
   now()+interval '1 hour',repeat('c',128),repeat('1',24));
 SELECT * INTO j FROM public.bt_r2_claim_invitation_email();
 IF public.bt_r2_mark_invitation_email_terminal_failed(j.outbox_id,gen_random_uuid())
 THEN RAISE EXCEPTION 'FAIL wrong lease terminated'; END IF;
 IF NOT public.bt_r2_mark_invitation_email_terminal_failed(j.outbox_id,j.lease_id)
 THEN RAISE EXCEPTION 'FAIL permanent rejection not completed'; END IF;
 IF public.bt_r2_mark_invitation_email_terminal_failed(j.outbox_id,j.lease_id)
 THEN RAISE EXCEPTION 'FAIL terminal failed twice'; END IF;
 IF (SELECT count(*) FROM bt_private.workshop_invitation_outbox
    WHERE id=j.outbox_id AND status='failed'
      AND ciphertext IS NULL AND nonce IS NULL AND attempts=1)<>1
 THEN RAISE EXCEPTION 'FAIL terminal state or ciphertext'; END IF;
 IF (SELECT count(*) FROM bt_private.workshop_mechanic_invitations
     WHERE id=invitation AND status='revoked')<>1
 THEN RAISE EXCEPTION 'FAIL terminal invite not revoked'; END IF;
END $$;
ROLLBACK;
\echo PASS: terminal failure revokes invite and erases encrypted token


-- Resend remembers an idempotency key only 24h; ByteTorque blocks claims
-- at 23h since first attempt, and reconciles remaining ambiguous invites.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
 w uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 owner_a uuid := '11111111-1111-4111-8111-111111111111';
 invitation uuid;
 j record;
 old_first timestamptz;
BEGIN
 invitation := public.bt_r2_reserve_and_queue_mechanic_invite(
   owner_a,w,'newmech1@example.com',repeat('a',64),
   now()+interval '47 hours',repeat('c',128),repeat('8',24));
 SELECT * INTO j FROM public.bt_r2_claim_invitation_email();
 IF j.invitation_id<>invitation THEN RAISE EXCEPTION 'FAIL first claim missing'; END IF;
 SELECT first_attempt_at INTO old_first FROM bt_private.workshop_invitation_outbox
 WHERE id=j.outbox_id;
 IF old_first IS NULL THEN RAISE EXCEPTION 'FAIL first_attempt_at not captured'; END IF;

 -- Emulate an interrupted worker from over 23h ago (provider result unknown).
 UPDATE bt_private.workshop_invitation_outbox SET
   status='retry',attempts=1,lease_id=NULL,leased_until=NULL,
   first_attempt_at=now()-interval '23 hours 2 minutes',
   next_attempt_at=now()-interval '1 minute'
 WHERE id=j.outbox_id;

 SELECT * INTO j FROM public.bt_r2_claim_invitation_email();
 IF j.outbox_id IS NOT NULL
 THEN RAISE EXCEPTION 'FAIL stale idempotency key reclaimed'; END IF;

 IF public.bt_r2_reconcile_invitation_outbox(w)<>1
 THEN RAISE EXCEPTION 'FAIL stale idempotency row not reconciled'; END IF;

 IF (SELECT count(*) FROM bt_private.workshop_invitation_outbox
     WHERE invitation_id=invitation AND status='cancelled'
       AND ciphertext IS NULL AND nonce IS NULL) <> 1
 THEN RAISE EXCEPTION 'FAIL stale ciphertext not erased'; END IF;

 IF (SELECT count(*) FROM bt_private.workshop_mechanic_invitations
     WHERE id=invitation AND status='revoked') <> 1
 THEN RAISE EXCEPTION 'FAIL stale ambiguous invite still active'; END IF;
END $$;
ROLLBACK;
\echo PASS: provider 24h key protected by 23h claim cutoff and cleanup
