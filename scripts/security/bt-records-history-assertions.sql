-- Separate synthetic transaction: emitted revisions, pending exports and future FKs.
BEGIN;
CREATE FUNCTION pg_temp.assert_true(ok boolean,label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'ASSERT_FAILED: %',label; END IF; RAISE NOTICE 'PASS %',label; END $$;
CREATE FUNCTION pg_temp.expect_error(command text,expected text,label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE actual text; BEGIN BEGIN EXECUTE command; EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS actual=RETURNED_SQLSTATE; END;
IF actual IS DISTINCT FROM expected THEN RAISE EXCEPTION 'ASSERT_FAILED % expected % got %',label,expected,actual; END IF; RAISE NOTICE 'PASS %',label; END $$;
INSERT INTO bt_records_private.rollout VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
SELECT public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000021',gen_random_uuid())->>'id' AS qid \gset
RESET ROLE;
UPDATE public.quotes SET status='issued',issued_revision=1 WHERE id=:'qid';
INSERT INTO public.quote_revisions(workshop_id,id,quote_id,revision,payload,payload_sha256,pdf_object_path,pdf_sha256,pdf_size,issued_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','dddddddd-dddd-4ddd-8ddd-000000000001',:'qid',1,'{"synthetic":true}',repeat('a',64),'synthetic-only/no-upload.pdf',repeat('b',64),123,'11111111-1111-4111-8111-111111111111');
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
SELECT pg_temp.expect_error(format('SELECT public.bt_cp05_void_quote(%L,%L,1,gen_random_uuid(),%L)','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',:'qid','Synthetic void'),'42501','legacy void RPC cannot bypass owner/admin restriction');
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
SELECT pg_temp.assert_true(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','quotes',:'qid')->'actions'='["void"]','issued quote void only');
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','quotes',:'qid','void','1',gen_random_uuid(),'Synthetic void preserves PDF');
SELECT pg_temp.assert_true((SELECT status='voided' FROM public.quotes WHERE id=:'qid') AND (SELECT count(*) FROM public.quote_revisions WHERE quote_id=:'qid')=1 AND (SELECT count(*) FROM public.quote_events WHERE quote_id=:'qid')=1,'void retains revision, document path and history');
SELECT pg_temp.assert_true(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','quotes',:'qid')->'actions'='[]','voided quote never deletable');
RESET ROLE;
-- A revised draft keeps its historical issue, so it cannot be deleted.
UPDATE public.quotes SET status='draft',version=3 WHERE id=:'qid';
SET ROLE authenticated;
SELECT pg_temp.assert_true(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','quotes',:'qid')->'actions'='[]','revised issued draft protected');
RESET ROLE;
UPDATE public.quotes SET issue_pending=true WHERE id=:'qid';
SET ROLE authenticated;
SELECT pg_temp.assert_true(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001')->'actions'='[]','pending issuance blocks archive parent');
SELECT pg_temp.assert_true(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','work_orders','aaaaaaaa-aaaa-4aaa-8aaa-000000000021')->'actions'='[]','pending issuance blocks cancellation');
RESET ROLE;
-- Simulate an optional/private future module using ON DELETE CASCADE: it must block deletion.
CREATE SCHEMA records_synthetic_future;
CREATE TABLE records_synthetic_future.history(workshop_id uuid,id uuid,customer_id uuid,
 FOREIGN KEY(workshop_id,customer_id) REFERENCES public.customers(workshop_id,id) ON DELETE CASCADE);
INSERT INTO public.customers(workshop_id,id,full_name,created_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000003','Future synthetic dependency','11111111-1111-4111-8111-111111111111');
INSERT INTO records_synthetic_future.history VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',gen_random_uuid(),'aaaaaaaa-aaaa-4aaa-8aaa-000000000003');
SET ROLE authenticated;
SELECT pg_temp.assert_true(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000003')->'actions'='["archive"]','unknown private cascade FK is a dependency');
SELECT pg_temp.expect_error($q$SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000003','delete',(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000003')->>'token'),gen_random_uuid(),'Blocked future cascade')$q$,'23503','no cascading history loss');
RESET ROLE;
SELECT pg_temp.assert_true((SELECT count(*) FROM records_synthetic_future.history)=1,'private history unchanged');
UPDATE public.workshop_memberships SET status='disabled' WHERE user_id='11111111-1111-4111-8111-111111111111';
SET ROLE authenticated;
SELECT pg_temp.expect_error($q$SELECT public.bt_records_audit('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000003')$q$,'42501','revoked membership blocks audit');
RESET ROLE;
SET ROLE anon;
SELECT pg_temp.expect_error($q$SELECT public.bt_records_list('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers',false,'',null)$q$,'42501','anonymous RPC denied');
RESET ROLE;
ROLLBACK;
SELECT 'BT_RECORDS_HISTORY_ASSERTIONS_PASS';
