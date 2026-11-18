-- BT-COM-01C · CANDIDATE ONLY. DO NOT APPLY TO HOSTED SUPABASE.
-- PostgreSQL 17 isolated lab after CP05 and BT-FLOW-LIVE-02 candidate migrations.
-- This schema DOES NOT SEND MAIL, create a queue, install Storage or call a provider.
-- A separate backup, restoration test and explicit authorization are required
-- before ANY production migration. No end-user SQL permissions are granted.
BEGIN;
CREATE SCHEMA bt_com_private;
REVOKE ALL ON SCHEMA bt_com_private FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA bt_com_private TO service_role;

-- Both gates are OFF. A future migration/authorization is necessary for
-- provider delivery; this version has NO function that queues/sends anything.
CREATE TABLE bt_com_private.rollout (
 workshop_id uuid PRIMARY KEY REFERENCES public.workshops(id) ON DELETE RESTRICT,
 review_enabled boolean NOT NULL DEFAULT false,
 delivery_enabled boolean NOT NULL DEFAULT false CHECK (delivery_enabled IS FALSE),
 approved_at timestamptz,
 approval_note text NOT NULL DEFAULT ''
);
CREATE TABLE bt_com_private.closing_manifests (
 workshop_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(),
 request_id uuid NOT NULL, order_id uuid NOT NULL, quote_id uuid NOT NULL,
 revision_id uuid NOT NULL, approval_id uuid NOT NULL,
 report_id uuid NOT NULL, delivery_id uuid NOT NULL,
 actor_id uuid NOT NULL REFERENCES auth.users(id),
 revision_number integer NOT NULL CHECK (revision_number > 0),
 payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[a-f0-9]{64}$'),
 documents jsonb NOT NULL CHECK (
  jsonb_typeof(documents) = 'array' AND jsonb_array_length(documents) = 3
 ),
 manifest_status text NOT NULL DEFAULT 'prepared_not_sent'
 CHECK (manifest_status = 'prepared_not_sent'),
 created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 PRIMARY KEY (workshop_id,id),
 UNIQUE (workshop_id,request_id),
 UNIQUE (workshop_id,revision_id,delivery_id),
 FOREIGN KEY (workshop_id,order_id) REFERENCES public.work_orders(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY (workshop_id,quote_id) REFERENCES public.quotes(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY (workshop_id,revision_id) REFERENCES public.quote_revisions(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY (workshop_id,approval_id) REFERENCES public.bt_flow_quote_approvals(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY (workshop_id,report_id) REFERENCES public.bt_flow_execution_reports(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY (workshop_id,delivery_id) REFERENCES public.bt_flow_visit_deliveries(workshop_id,id) ON DELETE RESTRICT
);
-- Future trusted archive adapter (COM-01A) must insert verified manifest
-- atomically with the same identity and fingerprint. THIS candidate deliberately
-- exposes no manifest-creation RPC or public upload. In the isolated lab a
-- postgres owner inserts synthetic fixtures directly.
CREATE TABLE bt_com_private.mail_reviews (
 workshop_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(),
 request_id uuid NOT NULL,
 manifest_id uuid NOT NULL,
 reviewer_id uuid NOT NULL REFERENCES auth.users(id),
 recipient text NOT NULL CHECK (
  char_length(recipient) BETWEEN 5 AND 254 AND
  recipient = lower(btrim(recipient)) AND
  recipient ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
 ),
 review_fingerprint text NOT NULL CHECK (review_fingerprint ~ '^[a-f0-9]{64}$'),
 document_hashes jsonb NOT NULL CHECK (
  jsonb_typeof(document_hashes)='array' AND jsonb_array_length(document_hashes)=3
 ),
 review_state text NOT NULL DEFAULT 'operator_reviewed_not_sent'
 CHECK (review_state='operator_reviewed_not_sent'),
 reviewed_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 PRIMARY KEY (workshop_id,id),
 UNIQUE (workshop_id,request_id),
 FOREIGN KEY (workshop_id,manifest_id)
 REFERENCES bt_com_private.closing_manifests(workshop_id,id) ON DELETE RESTRICT
);
CREATE INDEX bt_com_mail_reviews_manifest
 ON bt_com_private.mail_reviews(workshop_id,manifest_id,reviewed_at DESC);

-- Reserved append-only provider-event shape ONLY. NO grants, RPC or worker.
-- provider_accepted is a PROVIDER acknowledgment, not inbox delivery/read.
-- ack_uncertain must NEVER be displayed as sent, nor blindly retried.
CREATE TABLE bt_com_private.mail_provider_events (
 workshop_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(),
 review_id uuid NOT NULL,
 attempt integer NOT NULL CHECK (attempt BETWEEN 1 AND 10),
 event_state text NOT NULL CHECK (event_state IN (
   'queued_not_sent','provider_accepted','provider_rejected',
   'ack_uncertain','bounced'
 )),
 provider_message_id text CHECK (char_length(provider_message_id) BETWEEN 1 AND 200),
 error_code text CHECK (error_code ~ '^[A-Z0-9_]{1,80}$'),
 recorded_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 PRIMARY KEY (workshop_id,id),
 UNIQUE (workshop_id,review_id,attempt,event_state),
 FOREIGN KEY (workshop_id,review_id) REFERENCES bt_com_private.mail_reviews(workshop_id,id) ON DELETE RESTRICT,
 CHECK (
  (event_state='queued_not_sent' AND provider_message_id IS NULL AND error_code IS NULL)
  OR (event_state='provider_accepted' AND provider_message_id IS NOT NULL AND error_code IS NULL)
  OR (event_state IN ('provider_rejected','ack_uncertain','bounced') AND error_code IS NOT NULL)
 )
);
CREATE INDEX bt_com_mail_events_review
 ON bt_com_private.mail_provider_events(workshop_id,review_id,attempt,recorded_at DESC);

-- Even privileged SQL callers cannot UPDATE/DELETE history accidentally.
CREATE FUNCTION bt_com_private.immutable_history() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
BEGIN
 RAISE EXCEPTION 'BT_COM_HISTORY_IMMUTABLE' USING ERRCODE='42501';
END $$;
CREATE TRIGGER bt_com_manifest_immutable BEFORE UPDATE OR DELETE
 ON bt_com_private.closing_manifests FOR EACH ROW
 EXECUTE FUNCTION bt_com_private.immutable_history();
CREATE TRIGGER bt_com_review_immutable BEFORE UPDATE OR DELETE
 ON bt_com_private.mail_reviews FOR EACH ROW
 EXECUTE FUNCTION bt_com_private.immutable_history();
CREATE TRIGGER bt_com_mail_event_immutable BEFORE UPDATE OR DELETE
 ON bt_com_private.mail_provider_events FOR EACH ROW
 EXECUTE FUNCTION bt_com_private.immutable_history();

DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['rollout','closing_manifests','mail_reviews','mail_provider_events']
 LOOP
  EXECUTE format('ALTER TABLE bt_com_private.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE bt_com_private.%I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON bt_com_private.%I FROM PUBLIC,anon,authenticated,service_role',t);
 END LOOP;
END $$;

-- Private service_role-only transaction. Future Edge must authenticate the
-- operator and independently check PDF bytes, recipient, explicit checkboxes
-- and the B-stage preview fingerprint BEFORE calling this function. Database
-- checks current tenant/member/revision/delivery/recipient/hashes again.
-- The fingerprint is NOT a signature, bearer credential or proof of consent.
CREATE FUNCTION bt_com_private.record_review(
 p_workshop_id uuid, p_request_id uuid, p_manifest_id uuid,
 p_actor_id uuid, p_recipient text, p_fingerprint text, p_hashes jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE m bt_com_private.closing_manifests;
 q public.quotes; rev public.quote_revisions; d public.bt_flow_visit_deliveries;
 customer_email text; expected_hashes jsonb; prior bt_com_private.mail_reviews;
 answer bt_com_private.mail_reviews;
BEGIN
 IF p_workshop_id IS NULL OR p_request_id IS NULL OR p_manifest_id IS NULL OR
    p_actor_id IS NULL OR p_recipient IS NULL OR p_fingerprint !~ '^[a-f0-9]{64}$' OR
    jsonb_typeof(p_hashes) IS DISTINCT FROM 'array' OR
    jsonb_array_length(p_hashes) IS DISTINCT FROM 3
 THEN RAISE EXCEPTION 'BT_COM_REVIEW_INPUT' USING ERRCODE='22023'; END IF;
 -- Gate is installed OFF even if a trusted service calls with valid credentials.
 IF NOT EXISTS (SELECT 1 FROM bt_com_private.rollout gate
  WHERE gate.workshop_id=p_workshop_id AND gate.review_enabled IS TRUE)
 THEN RAISE EXCEPTION 'BT_COM_REVIEW_DISABLED' USING ERRCODE='42501'; END IF;

 IF NOT EXISTS (
  SELECT 1 FROM public.workshop_memberships mem
  JOIN public.workshops w ON w.id=mem.workshop_id
  JOIN auth.users u ON u.id=mem.user_id
  WHERE mem.workshop_id=p_workshop_id AND mem.user_id=p_actor_id
    AND mem.status='active' AND mem.role IN ('owner','admin','reception')
    AND w.status='active' AND u.email_confirmed_at IS NOT NULL
 ) THEN RAISE EXCEPTION 'BT_COM_ACCESS_DENIED' USING ERRCODE='42501'; END IF;

 -- Exclusive per workshop/review key prevents two requests racing to mutate
 -- one recorded review. Unique constraint is final arbiter across sessions.
 PERFORM pg_advisory_xact_lock(
  hashtextextended(p_workshop_id::text||':'||p_request_id::text,7)
 );
 SELECT * INTO m FROM bt_com_private.closing_manifests
  WHERE workshop_id=p_workshop_id AND id=p_manifest_id FOR SHARE;
 SELECT * INTO q FROM public.quotes
  WHERE workshop_id=p_workshop_id AND id=m.quote_id FOR SHARE;
 SELECT * INTO rev FROM public.quote_revisions
  WHERE workshop_id=p_workshop_id AND id=m.revision_id;
 SELECT * INTO d FROM public.bt_flow_visit_deliveries
  WHERE workshop_id=p_workshop_id AND id=m.delivery_id;
 IF m.id IS NULL OR q.id IS NULL OR rev.id IS NULL OR d.id IS NULL OR
    m.manifest_status<>'prepared_not_sent' OR
    m.order_id<>q.order_id OR m.quote_id<>rev.quote_id OR
    m.revision_number<>rev.revision OR m.payload_sha256<>rev.payload_sha256 OR
    m.approval_id IS DISTINCT FROM (
      SELECT report.approval_id FROM public.bt_flow_execution_reports report
      WHERE report.workshop_id=p_workshop_id AND report.id=m.report_id
    ) OR
    d.report_id<>m.report_id OR d.revision_id<>m.revision_id OR
    d.order_id<>m.order_id OR d.quote_id<>m.quote_id OR
    q.status<>'issued' OR q.issue_pending IS TRUE OR
    q.issued_revision<>rev.revision
 THEN RAISE EXCEPTION 'BT_COM_REVIEW_STALE' USING ERRCODE='55000'; END IF;
 -- Do not permit a caller to substitute a recipient that isn't stored on
 -- the actual customer row for THIS immutable quote.
 SELECT c.email INTO customer_email FROM public.customers c
  WHERE c.workshop_id=p_workshop_id AND c.id=q.customer_id;
 IF customer_email IS NULL OR customer_email IS DISTINCT FROM p_recipient
 THEN RAISE EXCEPTION 'BT_COM_RECIPIENT_CHANGED' USING ERRCODE='22023'; END IF;
 IF jsonb_typeof(m.documents) IS DISTINCT FROM 'array' OR
    jsonb_array_length(m.documents)<>3 OR
    m.documents->0->>'kind'<>'quote' OR
    m.documents->1->>'kind'<>'report' OR
    m.documents->2->>'kind'<>'handover' OR
    m.documents->0->>'sha256'<>rev.pdf_sha256 OR
    m.documents->0->>'path'<>rev.pdf_object_path
 THEN RAISE EXCEPTION 'BT_COM_DOCUMENTS_INVALID' USING ERRCODE='22023'; END IF;
 expected_hashes:=jsonb_build_array(m.documents->0->>'sha256',
                                   m.documents->1->>'sha256',
                                   m.documents->2->>'sha256');
 IF p_hashes IS DISTINCT FROM expected_hashes OR
    EXISTS (SELECT 1 FROM jsonb_array_elements_text(expected_hashes) x(hash)
     WHERE x.hash !~ '^[a-f0-9]{64}$')
 THEN RAISE EXCEPTION 'BT_COM_HASH_MISMATCH' USING ERRCODE='22023'; END IF;

 INSERT INTO bt_com_private.mail_reviews
 (workshop_id,request_id,manifest_id,reviewer_id,recipient,review_fingerprint,document_hashes)
 VALUES (p_workshop_id,p_request_id,p_manifest_id,p_actor_id,p_recipient,p_fingerprint,p_hashes)
 ON CONFLICT (workshop_id,request_id) DO NOTHING
 RETURNING * INTO answer;
 IF answer.id IS NOT NULL THEN RETURN to_jsonb(answer); END IF;

 SELECT * INTO prior FROM bt_com_private.mail_reviews
  WHERE workshop_id=p_workshop_id AND request_id=p_request_id;
 IF prior.id IS NULL OR prior.manifest_id IS DISTINCT FROM p_manifest_id OR
    prior.reviewer_id IS DISTINCT FROM p_actor_id OR
    prior.recipient IS DISTINCT FROM p_recipient OR
    prior.review_fingerprint IS DISTINCT FROM p_fingerprint OR
    prior.document_hashes IS DISTINCT FROM p_hashes
 THEN RAISE EXCEPTION 'BT_COM_REVIEW_CONFLICT' USING ERRCODE='23505'; END IF;
 RETURN to_jsonb(prior);
END $$;

-- The ONLY executable operation this candidate grants is recording a
-- server-verified operator review. No queue/send/ack function exists.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA bt_com_private
 FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION bt_com_private.record_review(
 uuid,uuid,uuid,uuid,text,text,jsonb
) TO service_role;

COMMIT;
