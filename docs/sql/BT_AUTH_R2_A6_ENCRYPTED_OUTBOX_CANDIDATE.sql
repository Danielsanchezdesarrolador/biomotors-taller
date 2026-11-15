-- ByteTorque R2-A6: CANDIDATE ONLY. NOT APPLIED TO HOSTED SUPABASE.
-- Apply to an isolated PostgreSQL lab AFTER R2-A + R2-A2 invitation candidates.
-- A token's plaintext is never persisted. The trusted Edge runtime encrypts
-- the delivery envelope with AES-256-GCM using a key kept OUTSIDE Postgres.
-- The original invite token is ONLY inside the encrypted envelope until send.
-- DO NOT turn on worker/SMTP/public Auth without a separate authorization gate.

CREATE TABLE bt_private.workshop_invitation_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL UNIQUE
    REFERENCES bt_private.workshop_mechanic_invitations(id) ON DELETE RESTRICT,
  workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE RESTRICT,
  ciphertext bytea,
  nonce bytea,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','processing','retry','sent','failed','cancelled')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  leased_until timestamptz,
  lease_id uuid,
  provider_message_id text CHECK (length(provider_message_id) <= 200),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  last_attempt_at timestamptz,
  CHECK (
    ((status IN ('queued','processing','retry')) AND
     ciphertext IS NOT NULL AND octet_length(ciphertext) BETWEEN 32 AND 8192 AND
     nonce IS NOT NULL AND octet_length(nonce) = 12)
    OR
    ((status IN ('sent','failed','cancelled')) AND ciphertext IS NULL AND nonce IS NULL)
  ),
  CHECK (
    (status='processing' AND leased_until IS NOT NULL AND lease_id IS NOT NULL)
    OR
    (status <> 'processing' AND leased_until IS NULL AND lease_id IS NULL)
  )
);
CREATE UNIQUE INDEX bt_outbox_nonce_unique
 ON bt_private.workshop_invitation_outbox(nonce) WHERE nonce IS NOT NULL;
CREATE INDEX bt_outbox_due
 ON bt_private.workshop_invitation_outbox(next_attempt_at, id)
 WHERE status IN ('queued','retry','processing');
ALTER TABLE bt_private.workshop_invitation_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON bt_private.workshop_invitation_outbox
  FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON bt_private.workshop_invitation_outbox TO service_role;

-- Single database transaction: reserve workshop seat + enqueue ciphertext.
-- If queue INSERT fails (including a duplicate nonce), reservation rolls back.
-- The two inputs token_hash and encrypted envelope are checked against each
-- other only by the trusted Edge caller before this RPC; backend MUST verify
-- that the envelope plaintext token hashes to p_token_sha256_hex, and matches
-- workshop/email/expiry. The database cannot decrypt this envelope.
CREATE FUNCTION public.bt_r2_reserve_and_queue_mechanic_invite(
  p_actor_user_id uuid,
  p_workshop_id uuid,
  p_email text,
  p_token_sha256_hex text,
  p_expires_at timestamptz,
  p_ciphertext_hex text,
  p_nonce_hex text
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE
  v_invitation_id uuid;
BEGIN
  IF p_ciphertext_hex IS NULL OR
     length(p_ciphertext_hex) NOT BETWEEN 64 AND 16384 OR
     p_ciphertext_hex !~ '^[0-9a-f]+$' OR
     p_nonce_hex IS NULL OR p_nonce_hex !~ '^[0-9a-f]{24}$'
  THEN RAISE EXCEPTION 'Invalid encrypted envelope' USING errcode='22023';
  END IF;
  v_invitation_id := public.bt_r2_reserve_mechanic_invite(
    p_actor_user_id,p_workshop_id,p_email,p_token_sha256_hex,p_expires_at
  );
  INSERT INTO bt_private.workshop_invitation_outbox(
    invitation_id,workshop_id,ciphertext,nonce
  ) VALUES (
    v_invitation_id,p_workshop_id,
    pg_catalog.decode(p_ciphertext_hex,'hex'),pg_catalog.decode(p_nonce_hex,'hex')
  );
  RETURN v_invitation_id;
END;
$$;
REVOKE ALL ON FUNCTION public.bt_r2_reserve_and_queue_mechanic_invite(
  uuid,uuid,text,text,timestamptz,text,text
) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_r2_reserve_and_queue_mechanic_invite(
  uuid,uuid,text,text,timestamptz,text,text
) TO service_role;

-- Workers claim only pending nonexpired invitations, in concurrent-safe order.
-- Each claim grants a unique lease; a stale worker may not complete a new lease.
-- "attempts" increments before transport; provider-level idempotency is
-- still mandatory because a successful send can precede a worker crash.
CREATE FUNCTION public.bt_r2_claim_invitation_email()
RETURNS TABLE (
  outbox_id uuid,
  invitation_id uuid,
  workshop_id uuid,
  ciphertext_hex text,
  nonce_hex text,
  lease_id uuid,
  attempt_number integer,
  recipient_email text,
  expires_at timestamptz
)
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  RETURN QUERY
  WITH candidate AS (
    SELECT o.id
      FROM bt_private.workshop_invitation_outbox o
      JOIN bt_private.workshop_mechanic_invitations i ON i.id=o.invitation_id
     WHERE o.attempts < 5 AND o.next_attempt_at <= v_now
       AND (o.status IN ('queued','retry')
            OR (o.status='processing' AND o.leased_until < v_now))
       AND i.status='pending' AND i.expires_at > v_now + interval '2 minutes'
     ORDER BY o.next_attempt_at, o.id
     FOR UPDATE OF o SKIP LOCKED LIMIT 1
  ), acquired AS (
    UPDATE bt_private.workshop_invitation_outbox o
       SET status='processing', attempts=o.attempts+1,
           lease_id=pg_catalog.gen_random_uuid(),
           leased_until=v_now+interval '2 minutes',
           last_attempt_at=v_now
      FROM candidate c WHERE o.id=c.id
    RETURNING o.id, o.invitation_id, o.workshop_id, o.ciphertext, o.nonce,
              o.lease_id, o.attempts
  )
  SELECT a.id, a.invitation_id, a.workshop_id,
         pg_catalog.encode(a.ciphertext,'hex'),pg_catalog.encode(a.nonce,'hex'),
         a.lease_id, a.attempts, i.invited_email, i.expires_at
    FROM acquired a
    JOIN bt_private.workshop_mechanic_invitations i ON i.id=a.invitation_id;
END;
$$;
REVOKE ALL ON FUNCTION public.bt_r2_claim_invitation_email()
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_r2_claim_invitation_email()
 TO service_role;

-- Mark provider ACCEPTED (not recipient delivered). Erase encrypted envelope.
-- A provider-idempotency key derived from outbox_id must accompany each
-- HTTP attempt; otherwise retries may duplicate messages after a crash.
CREATE FUNCTION public.bt_r2_mark_invitation_email_sent(
  p_outbox_id uuid,p_lease_id uuid,p_provider_message_id text
) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_outbox_id IS NULL OR p_lease_id IS NULL OR
     p_provider_message_id IS NULL OR
     length(btrim(p_provider_message_id)) NOT BETWEEN 1 AND 200
  THEN RETURN false; END IF;
  UPDATE bt_private.workshop_invitation_outbox
     SET status='sent',sent_at=pg_catalog.clock_timestamp(),
         provider_message_id=p_provider_message_id,
         ciphertext=NULL,nonce=NULL,
         lease_id=NULL,leased_until=NULL
   WHERE id=p_outbox_id AND lease_id=p_lease_id
     AND status='processing' AND leased_until > pg_catalog.clock_timestamp()
   RETURNING id INTO v_id;
  RETURN v_id IS NOT NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.bt_r2_mark_invitation_email_sent(uuid,uuid,text)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_r2_mark_invitation_email_sent(uuid,uuid,text)
 TO service_role;

-- Failure path: after five attempts or expired invitation, remove ciphertext
-- and revoke unfulfilled invitation so the seat cannot remain reserved.
-- Always acquire workshop row lock BEFORE outbox update, consistent with
-- other quota-changing RPCs.
CREATE FUNCTION public.bt_r2_fail_or_retry_invitation_email(
  p_outbox_id uuid,p_lease_id uuid
) RETURNS text
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE
  v_workshop_id uuid;
  v_invitation_id uuid;
  v_attempts integer;
  v_expires_at timestamptz;
  v_next_status text;
  v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_outbox_id IS NULL OR p_lease_id IS NULL THEN RETURN 'ignored'; END IF;
  SELECT o.workshop_id INTO v_workshop_id
    FROM bt_private.workshop_invitation_outbox o WHERE o.id=p_outbox_id;
  IF NOT FOUND THEN RETURN 'ignored'; END IF;
  PERFORM 1 FROM public.workshops WHERE id=v_workshop_id FOR UPDATE;
  SELECT o.invitation_id,o.attempts,i.expires_at
    INTO v_invitation_id,v_attempts,v_expires_at
    FROM bt_private.workshop_invitation_outbox o
    JOIN bt_private.workshop_mechanic_invitations i ON i.id=o.invitation_id
   WHERE o.id=p_outbox_id AND o.lease_id=p_lease_id
     AND o.status='processing' AND o.leased_until > v_now FOR UPDATE OF o;
  IF NOT FOUND THEN RETURN 'ignored'; END IF;
  v_next_status := CASE WHEN v_attempts>=5 OR v_expires_at<=v_now+interval '5 minutes'
    THEN 'failed' ELSE 'retry' END;
  UPDATE bt_private.workshop_invitation_outbox
     SET status=v_next_status,
         next_attempt_at=v_now + (interval '2 minutes' * power(2,least(v_attempts-1,4))),
         ciphertext=CASE WHEN v_next_status='retry' THEN ciphertext ELSE NULL END,
         nonce=CASE WHEN v_next_status='retry' THEN nonce ELSE NULL END,
         lease_id=NULL,leased_until=NULL
   WHERE id=p_outbox_id;
  IF v_next_status='failed' THEN
    UPDATE bt_private.workshop_mechanic_invitations
       SET status='revoked',revoked_at=v_now
     WHERE id=v_invitation_id AND status='pending';
  END IF;
  RETURN v_next_status;
END;
$$;
REVOKE ALL ON FUNCTION public.bt_r2_fail_or_retry_invitation_email(uuid,uuid)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_r2_fail_or_retry_invitation_email(uuid,uuid)
 TO service_role;

-- TODO BEFORE HOSTED DEPLOY:
-- 1. Harden nonce/envelope validation in Edge, add authenticated context
--    (workshop, recipient, expiry) and verify digest matches plaintext.
-- 2. Integrate provider with idempotency; sending can happen but ack can fail.
-- 3. Clean cancelled, expired and revoked outbox rows and encrypted payload.
-- 4. Coordinate owner revocation with outbox cancellation, and ensure
--    all membership/plan changes acquire the workshop lock.
-- 5. Protect worker route with dedicated server credentials, WAF and quotas.
-- 6. Make audit events for delivery state without storing secrets/PII.
-- 7. Simulate provider errors, recovery and crash-after-send in tests.
