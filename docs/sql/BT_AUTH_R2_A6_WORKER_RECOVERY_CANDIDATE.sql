-- ByteTorque R2-A6-WORKER: recovery / cancel candidate.
-- DO NOT apply to hosted Supabase. For synthetic PostgreSQL 17 test only.
-- Requires A, A2, A5 and A6 SQL already applied in the EPHEMERAL lab.
-- These are backend-only SECURITY INVOKER RPCs with no public grants.

-- Prevent cross-workshop mismatch between outbox.workshop_id and invitation.
-- Keep single existing FK (invitation_id) and add tenant-composite FK.
ALTER TABLE bt_private.workshop_mechanic_invitations
  ADD CONSTRAINT bt_invite_id_workshop_unique UNIQUE (id,workshop_id);
ALTER TABLE bt_private.workshop_invitation_outbox
  ADD CONSTRAINT bt_outbox_same_workshop_fk
  FOREIGN KEY (invitation_id,workshop_id)
  REFERENCES bt_private.workshop_mechanic_invitations(id,workshop_id);

-- Revoke and cancel queued/in-flight delivery atomically.
-- If already marked sent, preserve provider receipt; the invitation is still
-- revoked (link no longer usable). An external send already in flight cannot
-- be recalled. The worker must verify its lease immediately before transport.
CREATE FUNCTION public.bt_r2_revoke_and_cancel_mechanic_invite(
  p_actor_user_id uuid, p_workshop_id uuid, p_invitation_id uuid
) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_actor_user_id IS NULL OR p_workshop_id IS NULL OR p_invitation_id IS NULL
  THEN RETURN false; END IF;
  PERFORM 1 FROM public.workshops w
   WHERE w.id=p_workshop_id AND w.status='active' FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  -- Existing revoke RPC checks owner/admin active in the same workshop.
  IF NOT public.bt_r2_revoke_mechanic_invite(
       p_actor_user_id,p_workshop_id,p_invitation_id)
  THEN RETURN false; END IF;

  UPDATE bt_private.workshop_invitation_outbox
     SET status='cancelled',ciphertext=NULL,nonce=NULL,
         lease_id=NULL,leased_until=NULL,next_attempt_at=v_now
   WHERE invitation_id=p_invitation_id
     AND workshop_id=p_workshop_id
     AND status IN ('queued','retry','processing');
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.bt_r2_revoke_and_cancel_mechanic_invite(uuid,uuid,uuid)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_r2_revoke_and_cancel_mechanic_invite(uuid,uuid,uuid)
 TO service_role;

-- Reconcile expired/revoked invitations. A narrow workshop-scoped internal
-- sweep is chosen to preserve global lock order (workshops before outbox).
-- Caller should batch workshops with a trusted scheduler, NOT from browser.
CREATE FUNCTION public.bt_r2_reconcile_invitation_outbox(
  p_workshop_id uuid
) RETURNS integer
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_count integer := 0;
BEGIN
  IF p_workshop_id IS NULL THEN RETURN 0; END IF;
  PERFORM 1 FROM public.workshops w WHERE w.id=p_workshop_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 0; END IF;

  UPDATE bt_private.workshop_invitation_outbox o
     SET status='cancelled',ciphertext=NULL,nonce=NULL,
         lease_id=NULL,leased_until=NULL,next_attempt_at=v_now
    FROM bt_private.workshop_mechanic_invitations i
   WHERE i.id=o.invitation_id
     AND o.workshop_id=p_workshop_id AND i.workshop_id=p_workshop_id
     AND o.status IN ('queued','retry','processing')
     AND (i.status<>'pending' OR i.expires_at<=v_now);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  UPDATE bt_private.workshop_mechanic_invitations i
     SET status='expired'
   WHERE i.workshop_id=p_workshop_id AND i.status='pending'
     AND i.expires_at<=v_now;
  RETURN v_count;
END;
$$;
REVOKE ALL ON FUNCTION public.bt_r2_reconcile_invitation_outbox(uuid)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_r2_reconcile_invitation_outbox(uuid)
 TO service_role;

-- The provider says "undeliverable", or refuses permanently. This is NOT
-- the same as a timeout or unknown provider result; DO NOT call terminal
-- failure after provider may have accepted a message.
CREATE FUNCTION public.bt_r2_mark_invitation_email_terminal_failed(
  p_outbox_id uuid,p_lease_id uuid
) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $$
DECLARE
  v_workshop_id uuid;
  v_invitation_id uuid;
  v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_outbox_id IS NULL OR p_lease_id IS NULL THEN RETURN false; END IF;
  SELECT o.workshop_id INTO v_workshop_id
    FROM bt_private.workshop_invitation_outbox o WHERE o.id=p_outbox_id;
  IF NOT FOUND THEN RETURN false; END IF;
  PERFORM 1 FROM public.workshops WHERE id=v_workshop_id FOR UPDATE;
  SELECT o.invitation_id INTO v_invitation_id
    FROM bt_private.workshop_invitation_outbox o
   WHERE o.id=p_outbox_id AND o.workshop_id=v_workshop_id
     AND o.status='processing' AND o.lease_id=p_lease_id
     AND o.leased_until>v_now FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  UPDATE bt_private.workshop_invitation_outbox
     SET status='failed',ciphertext=NULL,nonce=NULL,
         lease_id=NULL,leased_until=NULL
   WHERE id=p_outbox_id;
  UPDATE bt_private.workshop_mechanic_invitations
     SET status='revoked',revoked_at=v_now
   WHERE id=v_invitation_id AND status='pending';
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.bt_r2_mark_invitation_email_terminal_failed(uuid,uuid)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_r2_mark_invitation_email_terminal_failed(uuid,uuid)
 TO service_role;

-- Future trusted worker must call a lease-status check under authenticated
-- service-only role immediately before provider I/O. It cannot eliminate
-- a revocation that races against an already in-flight external request.
CREATE FUNCTION public.bt_r2_invitation_email_lease_valid(
  p_outbox_id uuid,p_lease_id uuid
) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM bt_private.workshop_invitation_outbox o
    JOIN bt_private.workshop_mechanic_invitations i
      ON i.id=o.invitation_id AND i.workshop_id=o.workshop_id
    JOIN public.workshops w ON w.id=o.workshop_id
    WHERE o.id=p_outbox_id AND o.lease_id=p_lease_id
      AND o.status='processing'
      AND o.leased_until>pg_catalog.clock_timestamp()+interval '15 seconds'
      AND i.status='pending' AND i.expires_at>pg_catalog.clock_timestamp()+interval '3 minutes'
      AND w.status='active'
  );
$$;
REVOKE ALL ON FUNCTION public.bt_r2_invitation_email_lease_valid(uuid,uuid)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bt_r2_invitation_email_lease_valid(uuid,uuid)
 TO service_role;

-- Remaining hardening before ANY release:
-- * New owner/admin entry points must use revoke_and_cancel, NOT old revoke.
-- * Race external provider acceptance vs revocation cannot be made atomic;
--   define product semantics and show provider accepted vs delivered.
-- * Confirm provider supports stable idempotency key during crash recovery.
-- * Access to service role cannot be inferred from CORS or a client JWT.
-- * No SMTP credentials, cron schedules, webhooks or secrets in source code.
