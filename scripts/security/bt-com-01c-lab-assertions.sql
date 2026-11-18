-- BT-COM-01C · PostgreSQL 17 isolated, fake UUIDs and PDFs ONLY.
-- Runs after BT-FLOW-LIVE-02 lab assertions. No hosted access or provider.
CREATE FUNCTION public.com01c_expect(cmd text, expected text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
 BEGIN EXECUTE cmd;
 EXCEPTION WHEN OTHERS THEN
  IF SQLSTATE=expected THEN RETURN; END IF;
  RAISE EXCEPTION 'COM01C unexpected SQLSTATE % on %, expected %',SQLSTATE,cmd,expected;
 END;
 RAISE EXCEPTION 'COM01C expected SQLSTATE % not thrown on %',expected,cmd;
END $$;

-- Data comes from FLOW-LIVE-02 synthetic rows. The preceding lab intentionally
-- left the quote in draft after a revision, demonstrating stale review refusal.
INSERT INTO bt_com_private.closing_manifests (
 workshop_id,id,request_id,order_id,quote_id,revision_id,
 approval_id,report_id,delivery_id,actor_id,revision_number,
 payload_sha256,documents
)
SELECT q.workshop_id,'eeeeeeee-0000-4000-8000-000000000003'::uuid,
 'eeeeeeee-0000-4000-8000-000000000001'::uuid, q.order_id,q.id,r.id,a.id,x.id,d.id,
 '11111111-1111-4111-8111-111111111111'::uuid,r.revision,
 r.payload_sha256,
 jsonb_build_array(
  jsonb_build_object('kind','quote','fileName','01_Cotizacion_QA.pdf',
   'bucket','cp05-quote-documents','path',r.pdf_object_path,
   'sha256',r.pdf_sha256,'byteLength',r.pdf_size,'contentType','application/pdf'),
  jsonb_build_object('kind','report','fileName','02_Informe_QA.pdf',
   'bucket','bt-closing-documents',
   'path',q.workshop_id::text||'/closings/'||q.order_id::text||'/'||
     r.id::text||'/'||d.id::text||'/report/'||repeat('c',64)||'.pdf',
   'sha256',repeat('c',64),'byteLength',2345,'contentType','application/pdf'),
  jsonb_build_object('kind','handover','fileName','03_Entrega_QA.pdf',
   'bucket','bt-closing-documents',
   'path',q.workshop_id::text||'/closings/'||q.order_id::text||'/'||
     r.id::text||'/'||d.id::text||'/handover/'||repeat('d',64)||'.pdf',
   'sha256',repeat('d',64),'byteLength',3456,'contentType','application/pdf')
 )
FROM public.quotes q
JOIN public.quote_revisions r ON r.workshop_id=q.workshop_id AND r.quote_id=q.id
JOIN public.bt_flow_quote_approvals a
 ON a.workshop_id=q.workshop_id AND a.revision_id=r.id
JOIN public.bt_flow_execution_reports x
 ON x.workshop_id=q.workshop_id AND x.approval_id=a.id
JOIN public.bt_flow_visit_deliveries d
 ON d.workshop_id=q.workshop_id AND d.report_id=x.id
WHERE q.workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

-- Nobody can query/alter the private tables from the browser, or forge a
-- review by executing a private function with an authenticated JWT.
SET ROLE anon;
SELECT public.com01c_expect('SELECT * FROM bt_com_private.mail_reviews','42501');
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
SELECT public.com01c_expect('SELECT * FROM bt_com_private.closing_manifests','42501');
SELECT public.com01c_expect('INSERT INTO bt_com_private.mail_provider_events DEFAULT VALUES','42501');
SELECT public.com01c_expect(
 $cmd$SELECT bt_com_private.record_review(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','eeeeeeee-0000-4000-8000-000000000002',
 (SELECT id FROM bt_com_private.closing_manifests),
 '11111111-1111-4111-8111-111111111111','synthetic@invalid.test',
 repeat('e',64),jsonb_build_array(repeat('a',64),repeat('c',64),repeat('d',64)))$cmd$,'42501');
RESET ROLE;

-- Gate OFF rejects a legitimate service worker, before a review row is made.
SET ROLE service_role;
SELECT public.com01c_expect(
 $cmd$SELECT bt_com_private.record_review(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','eeeeeeee-0000-4000-8000-000000000002',
 'eeeeeeee-0000-4000-8000-000000000003',
 '11111111-1111-4111-8111-111111111111','synthetic@invalid.test',
 repeat('e',64),jsonb_build_array(repeat('a',64),repeat('c',64),repeat('d',64)))$cmd$,'42501');
SELECT public.com01c_expect('SELECT * FROM bt_com_private.mail_reviews','42501');
SELECT public.com01c_expect('INSERT INTO bt_com_private.mail_provider_events DEFAULT VALUES','42501');
RESET ROLE;

-- No row exists yet: installing candidate SQL alone is not activation.
INSERT INTO bt_com_private.rollout(workshop_id,review_enabled,approval_note)
VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true,'LAB ONLY: never authorize hosted mail');
DO $$
BEGIN
 IF EXISTS(SELECT 1 FROM bt_com_private.rollout WHERE delivery_enabled)
 THEN RAISE EXCEPTION 'COM01C_SEND_GATE_MUST_REMAIN_OFF'; END IF;
END $$;

-- The source quote is currently draft (changed after delivery); stale review
-- cannot be committed even with the private review gate ON.
SET ROLE service_role;
SELECT public.com01c_expect(
 $cmd$SELECT bt_com_private.record_review(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 'eeeeeeee-0000-4000-8000-000000000002',
 'eeeeeeee-0000-4000-8000-000000000003',
 '11111111-1111-4111-8111-111111111111','synthetic@invalid.test',
 repeat('e',64),jsonb_build_array(repeat('a',64),repeat('c',64),repeat('d',64)))$cmd$,
 '55000');
RESET ROLE;

-- Owner-only ephemeral repair of a synthetic fixture, never a production
-- process: make original archived revision current again for positive test.
UPDATE public.quotes
 SET status='issued',issue_pending=false,
     issued_revision=(SELECT revision FROM public.quote_revisions
       WHERE workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' LIMIT 1)
 WHERE workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

-- Private function gets a manifest ID from trusted server input; authenticated
-- actor is checked in SQL, not derived from a browser-submitted name.
SET ROLE service_role;
DO $$
DECLARE wid uuid:='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 req uuid:='eeeeeeee-0000-4000-8000-000000000002';
 mid uuid; hashes jsonb; first_answer jsonb; repeat_answer jsonb;
BEGIN
 -- In this block the service_role has no SELECT permission on private tables;
 -- the lab passes a stable fixture ID seeded above by the trusted owner.
 mid:='eeeeeeee-0000-4000-8000-000000000003'::uuid;
 hashes:=jsonb_build_array(repeat('a',64),repeat('c',64),repeat('d',64));
 first_answer:=bt_com_private.record_review(wid,req,mid,
 '11111111-1111-4111-8111-111111111111','synthetic@invalid.test',repeat('e',64),hashes);
 repeat_answer:=bt_com_private.record_review(wid,req,mid,
 '11111111-1111-4111-8111-111111111111','synthetic@invalid.test',repeat('e',64),hashes);
 IF first_answer IS DISTINCT FROM repeat_answer OR
    first_answer->>'review_state' IS DISTINCT FROM 'operator_reviewed_not_sent'
 THEN RAISE EXCEPTION 'COM01C_REVIEW_NOT_IDEMPOTENT'; END IF;
END $$;
SELECT public.com01c_expect(
 $cmd$SELECT bt_com_private.record_review(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 'eeeeeeee-0000-4000-8000-000000000002',
 'eeeeeeee-0000-4000-8000-000000000003',
 '11111111-1111-4111-8111-111111111111','synthetic@invalid.test',
 repeat('f',64),jsonb_build_array(repeat('a',64),repeat('c',64),repeat('d',64)))$cmd$,
 '23505');
SELECT public.com01c_expect(
 $cmd$SELECT bt_com_private.record_review(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 'eeeeeeee-0000-4000-8000-000000000004',
 'eeeeeeee-0000-4000-8000-000000000003',
 '11111111-1111-4111-8111-111111111111','other@invalid.test',
 repeat('e',64),jsonb_build_array(repeat('a',64),repeat('c',64),repeat('d',64)))$cmd$,
 '22023');
SELECT public.com01c_expect(
 $cmd$SELECT bt_com_private.record_review(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 'eeeeeeee-0000-4000-8000-000000000004',
 'eeeeeeee-0000-4000-8000-000000000003',
 '33333333-3333-4333-8333-333333333333','synthetic@invalid.test',
 repeat('e',64),jsonb_build_array(repeat('a',64),repeat('c',64),repeat('d',64)))$cmd$,
 '42501');
SELECT public.com01c_expect(
 $cmd$SELECT bt_com_private.record_review(
 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
 'eeeeeeee-0000-4000-8000-000000000005',
 'eeeeeeee-0000-4000-8000-000000000003',
 '55555555-5555-4555-8555-555555555555','synthetic@invalid.test',
 repeat('e',64),jsonb_build_array(repeat('a',64),repeat('c',64),repeat('d',64)))$cmd$,
 '42501');
SELECT public.com01c_expect(
 $cmd$SELECT bt_com_private.record_review(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 'eeeeeeee-0000-4000-8000-000000000006',
 'eeeeeeee-0000-4000-8000-000000000003',
 '11111111-1111-4111-8111-111111111111','synthetic@invalid.test',
 repeat('e',64),jsonb_build_array(repeat('b',64),repeat('c',64),repeat('d',64)))$cmd$,
 '22023');
RESET ROLE;

-- Revocation prevents recording even when a preview was already prepared.
UPDATE public.workshop_memberships SET status='disabled'
 WHERE workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
 AND user_id='11111111-1111-4111-8111-111111111111';
SET ROLE service_role;
SELECT public.com01c_expect(
 $cmd$SELECT bt_com_private.record_review(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 'eeeeeeee-0000-4000-8000-000000000007',
 'eeeeeeee-0000-4000-8000-000000000003',
 '11111111-1111-4111-8111-111111111111','synthetic@invalid.test',
 repeat('e',64),jsonb_build_array(repeat('a',64),repeat('c',64),repeat('d',64)))$cmd$,
 '42501');
RESET ROLE;
UPDATE public.workshop_memberships SET status='active'
 WHERE workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
 AND user_id='11111111-1111-4111-8111-111111111111';

-- Force append-only and correct accounting: no provider events were generated.
DO $$ BEGIN
 IF (SELECT count(*) FROM bt_com_private.mail_reviews)<>1 OR
    (SELECT count(*) FROM bt_com_private.mail_provider_events)<>0 OR
    (SELECT count(*) FROM bt_com_private.rollout WHERE delivery_enabled)<>0
 THEN RAISE EXCEPTION 'COM01C_NO_MAIL_GUARANTEE'; END IF;
 PERFORM public.com01c_expect(
  'UPDATE bt_com_private.mail_reviews SET recipient=recipient','42501');
 PERFORM public.com01c_expect(
  'DELETE FROM bt_com_private.closing_manifests','42501');
 -- An UPDATE against an EMPTY table never invokes a row-level trigger.
 -- Verify that an enabled immutable trigger exists without fabricating a
 -- provider event simply to exercise it.
 IF NOT EXISTS (
  SELECT 1 FROM pg_trigger
  WHERE tgrelid='bt_com_private.mail_provider_events'::regclass
    AND tgname='bt_com_mail_event_immutable' AND NOT tgisinternal
    AND tgenabled='O'
 ) THEN RAISE EXCEPTION 'COM01C_PROVIDER_EVENT_TRIGGER_MISSING'; END IF;
END $$;
SELECT 'BT_COM_01C_LOCAL_IMMUTABLE_REVIEW_NO_MAIL_PASS';
