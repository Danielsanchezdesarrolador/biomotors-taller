-- All values synthetic. Run ONLY in the disposable PostgreSQL lab.
BEGIN;
CREATE FUNCTION pg_temp.assert_true(ok boolean,label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'ASSERT_FAILED: %',label; END IF; RAISE NOTICE 'PASS %',label; END $$;
CREATE FUNCTION pg_temp.expect_error(command text,expected text,label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE actual text;
BEGIN
 BEGIN EXECUTE command; EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS actual=RETURNED_SQLSTATE; END;
 IF actual IS DISTINCT FROM expected THEN RAISE EXCEPTION 'ASSERT_FAILED % expected % got %',label,expected,actual; END IF;
 RAISE NOTICE 'PASS %',label;
END $$;
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES('22222222-2222-4222-8222-222222222222','admin-a@invalid.test',now());
INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','admin');
INSERT INTO public.customers(workshop_id,id,full_name,created_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000002','Empty synthetic customer','11111111-1111-4111-8111-111111111111');
INSERT INTO public.vehicles(workshop_id,id,customer_id,make,model,created_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000012','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','Synthetic','Second','11111111-1111-4111-8111-111111111111'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000013','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','Synthetic','Empty','11111111-1111-4111-8111-111111111111');
INSERT INTO public.work_orders(workshop_id,id,vehicle_id,complaint,opened_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000022','aaaaaaaa-aaaa-4aaa-8aaa-000000000012','Second synthetic order','11111111-1111-4111-8111-111111111111');
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
SELECT pg_temp.expect_error($q$SELECT public.bt_records_list('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers',false,'',null)$q$,'55000','rollout defaults OFF');
RESET ROLE;
INSERT INTO bt_records_private.rollout VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
SET ROLE authenticated;
SELECT pg_temp.expect_error($q$DELETE FROM public.customers WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000002'$q$,'42501','no direct delete');
SELECT pg_temp.expect_error($q$UPDATE public.customers SET archived_at=now()$q$,'42501','no direct archive bypass');
SELECT pg_temp.expect_error($q$SELECT public.bt_records_list('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','customers',false,'',null)$q$,'42501','cross tenant list denied');
SELECT pg_temp.expect_error($q$SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','bbbbbbbb-bbbb-4bbb-8bbb-000000000001')$q$,'42501','cross tenant id denied');
SELECT pg_temp.expect_error($q$SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','auth.users','aaaaaaaa-aaaa-4aaa-8aaa-000000000001')$q$,'22023','resource allowlist');
SELECT pg_temp.expect_error($q$SELECT bt_records_private.dependencies('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001')$q$,'42501','private helpers not exposed');
SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000002')->>'token' AS empty_token \gset
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000002','delete',:'empty_token','eeeeeeee-eeee-4eee-8eee-000000000001','Synthetic empty record');
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000002','delete',:'empty_token','eeeeeeee-eeee-4eee-8eee-000000000001','Synthetic empty record');
SELECT pg_temp.assert_true(NOT EXISTS(SELECT 1 FROM public.customers WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000002'),'empty customer deleted and retry idempotent');
SELECT pg_temp.assert_true(jsonb_array_length(public.bt_records_audit('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000002'))=1,'audit survives deletion, no duplicate retry event');
SELECT pg_temp.expect_error($q$SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000002','delete','different','eeeeeeee-eeee-4eee-8eee-000000000001','Changed input')$q$,'22023','request cannot change input');
SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001')->>'token' AS owner_token \gset
SELECT pg_temp.assert_true(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001')->'actions'='["archive"]','history customer archive only');
SELECT pg_temp.expect_error($q$SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','archive','stale',gen_random_uuid(),'Synthetic reason')$q$,'40001','optimistic concurrency');
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','archive',:'owner_token',gen_random_uuid(),'Synthetic archive');
SELECT pg_temp.assert_true((SELECT count(*) FROM public.vehicles v JOIN public.customers c USING(workshop_id) WHERE c.id=v.customer_id AND v.archived_at IS NULL AND c.archived_at IS NULL)=0,'archived parent excludes child selectors');
SELECT pg_temp.assert_true(jsonb_array_length(public.bt_records_list('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','vehicles',true,'',null))=3,'inherited archive listed for recovery');
SELECT pg_temp.expect_error($q$INSERT INTO public.vehicles(workshop_id,customer_id,make,model) VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','Test','Blocked')$q$,'23514','cannot create child of archived customer');
SELECT pg_temp.expect_error($q$INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint) VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000013','Blocked intake')$q$,'23514','cannot create order under archived parent');
SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001')->>'token' AS owner_token \gset
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','restore',:'owner_token',gen_random_uuid(),'Synthetic restore');
SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','vehicles','aaaaaaaa-aaaa-4aaa-8aaa-000000000013')->>'token' AS vehicle_token \gset
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','vehicles','aaaaaaaa-aaaa-4aaa-8aaa-000000000013','delete',:'vehicle_token',gen_random_uuid(),'Empty synthetic vehicle');
SELECT pg_temp.assert_true(NOT EXISTS(SELECT 1 FROM public.vehicles WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000013'),'empty vehicle deleted');
SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','vehicles','aaaaaaaa-aaaa-4aaa-8aaa-000000000011')->>'token' AS vehicle_token \gset
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','vehicles','aaaaaaaa-aaaa-4aaa-8aaa-000000000011','archive',:'vehicle_token',gen_random_uuid(),'Vehicle history retained');
SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001')->>'token' AS owner_token \gset
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','archive',:'owner_token',gen_random_uuid(),'Parent archived again');
SELECT pg_temp.assert_true(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','vehicles','aaaaaaaa-aaaa-4aaa-8aaa-000000000011')->'actions'='[]','cannot restore child before parent');
SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001')->>'token' AS owner_token \gset
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','restore',:'owner_token',gen_random_uuid(),'Restore parent only');
SELECT pg_temp.assert_true((SELECT archived_at IS NOT NULL FROM public.vehicles WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000011'),'parent restore preserves individually archived children');
SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','vehicles','aaaaaaaa-aaaa-4aaa-8aaa-000000000011')->>'token' AS vehicle_token \gset
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','vehicles','aaaaaaaa-aaaa-4aaa-8aaa-000000000011','restore',:'vehicle_token',gen_random_uuid(),'Restore original vehicle');
-- A draft's mutable lines are its own content; revisions/requests/events/downstream edges block deletion.
SELECT public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000022',gen_random_uuid())->>'id' AS draft_id \gset
SELECT public.bt_cp05_save_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',:'draft_id',1,gen_random_uuid(),'{"price_basis":"net","valid_days":10,"terms":"","comments":"","items":[{"id":"dddddddd-dddd-4ddd-8ddd-000000000001","description":"Synthetic part","type":"Repuesto","quantity100":100,"unit_price":5000}]}');
SAVEPOINT synthetic_line_dependency;
RESET ROLE;
CREATE SCHEMA records_line_fixture;
CREATE TABLE records_line_fixture.line_history(workshop_id uuid,quote_id uuid,item_id uuid,
 FOREIGN KEY(workshop_id,quote_id,item_id) REFERENCES public.quote_items(workshop_id,quote_id,id) ON DELETE CASCADE);
INSERT INTO records_line_fixture.line_history VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',:'draft_id','dddddddd-dddd-4ddd-8ddd-000000000001');
SET ROLE authenticated;
SELECT pg_temp.assert_true(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','quotes',:'draft_id')->'actions'='[]','line dependency blocks removal of its draft');
ROLLBACK TO SAVEPOINT synthetic_line_dependency;
SELECT pg_temp.assert_true(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','quotes',:'draft_id')->'actions'='["delete"]','unissued draft with editable lines eligible');
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','quotes',:'draft_id','delete','2',gen_random_uuid(),'Delete unissued synthetic draft');
SELECT pg_temp.assert_true(NOT EXISTS(SELECT 1 FROM public.quote_items WHERE quote_id=:'draft_id'),'explicit draft line removal, no cascade');
-- A deleted draft remains activity of its original OT, not a pristine visit.
SELECT pg_temp.assert_true(public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','work_orders','aaaaaaaa-aaaa-4aaa-8aaa-000000000022')->'actions'='["cancel"]','removed draft does not erase order activity');
RESET ROLE;
INSERT INTO public.work_orders(workshop_id,id,vehicle_id,complaint,opened_by,status,closed_at) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000023','aaaaaaaa-aaaa-4aaa-8aaa-000000000012','Pristine synthetic order','11111111-1111-4111-8111-111111111111','closed',now());
SET ROLE authenticated;
SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','work_orders','aaaaaaaa-aaaa-4aaa-8aaa-000000000023')->>'token' AS closed_token \gset
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','work_orders','aaaaaaaa-aaaa-4aaa-8aaa-000000000023','cancel',:'closed_token',gen_random_uuid(),'Cancel historical closed order');
SELECT pg_temp.assert_true((SELECT status='closed' AND cancelled_at IS NOT NULL FROM public.work_orders WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000023'),'closed order cancellation metadata only');
-- OT with findings is cancelled, never deleted. A pristine second OT can be deleted.
SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','work_orders','aaaaaaaa-aaaa-4aaa-8aaa-000000000021')->>'token' AS order_token \gset
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','work_orders','aaaaaaaa-aaaa-4aaa-8aaa-000000000021','cancel',:'order_token',gen_random_uuid(),'Synthetic cancellation');
SELECT pg_temp.assert_true((SELECT status='closed' AND cancelled_at IS NOT NULL FROM public.work_orders WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000021') AND EXISTS(SELECT 1 FROM public.inspection_findings WHERE order_id='aaaaaaaa-aaaa-4aaa-8aaa-000000000021'),'cancel retains findings and closes operations');
SELECT pg_temp.expect_error($q$SELECT public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000021',gen_random_uuid())$q$,'23514','old RPC cannot create quote for cancelled order');
RESET ROLE;
INSERT INTO public.work_orders(workshop_id,id,vehicle_id,complaint,opened_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000024','aaaaaaaa-aaaa-4aaa-8aaa-000000000011','Pristine new synthetic order','11111111-1111-4111-8111-111111111111');
SET ROLE authenticated;
SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','work_orders','aaaaaaaa-aaaa-4aaa-8aaa-000000000024')->>'token' AS order_token \gset
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','work_orders','aaaaaaaa-aaaa-4aaa-8aaa-000000000024','delete',:'order_token',gen_random_uuid(),'Pristine synthetic order');
SELECT pg_temp.assert_true(NOT EXISTS(SELECT 1 FROM public.work_orders WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000024'),'pristine order deleted');
-- Role revocation is checked server-side for every command, including idempotent retry.
SELECT set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
SELECT pg_temp.expect_error($q$SELECT public.bt_records_list('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers',false,'',null)$q$,'42501','mechanic denied');
SELECT set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
SELECT pg_temp.expect_error($q$SELECT public.bt_records_inspect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','vehicles','aaaaaaaa-aaaa-4aaa-8aaa-000000000011')$q$,'42501','reception denied');
SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
SELECT pg_temp.assert_true(jsonb_array_length(public.bt_records_list('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers',false,'',null))=1,'authorized admin allowed');
RESET ROLE;
SELECT pg_temp.expect_error($q$DELETE FROM bt_records_private.events$q$,'42501','audit immutable even owner');
ROLLBACK;
SELECT 'BT_RECORDS_CORE_ASSERTIONS_PASS';
