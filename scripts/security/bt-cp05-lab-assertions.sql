-- Synthetic local PostgreSQL only. Never invoke against hosted Supabase.
CREATE FUNCTION public.lab_expect(command text, expected text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 BEGIN EXECUTE command; EXCEPTION WHEN OTHERS THEN
  IF SQLSTATE=expected THEN RETURN; END IF; RAISE;
 END;
 RAISE EXCEPTION 'Expected denial %, command %',expected,command;
END $$;
CREATE TABLE public.lab_results(name text PRIMARY KEY,value jsonb);
GRANT SELECT,INSERT,UPDATE ON public.lab_results TO authenticated,service_role;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
INSERT INTO public.lab_results VALUES('open', public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000021','10000000-0000-4000-8000-000000000001'));
DO $$ DECLARE a jsonb;b jsonb; BEGIN
 SELECT value INTO a FROM public.lab_results WHERE name='open';
 b:=public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000021','10000000-0000-4000-8000-000000000001');
 IF a<>b OR (SELECT count(*) FROM public.quotes)<>1 THEN RAISE EXCEPTION 'DUPLICATE_OPEN'; END IF;
END $$;
SELECT public.lab_expect('DELETE FROM public.quotes','42501');
SELECT public.lab_expect($q$SELECT public.bt_cp05_issue_status('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',gen_random_uuid(),'11111111-1111-4111-8111-111111111111')$q$,'42501');
SELECT public.lab_expect('UPDATE public.quotes SET updated_at=now()','42501');
SELECT public.lab_expect('INSERT INTO public.quote_items DEFAULT VALUES','42501');
SELECT public.lab_expect($q$SELECT public.bt_cp05_open_quote('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-000000000021',gen_random_uuid())$q$,'42501');
DO $$ DECLARE data jsonb; qid uuid; a jsonb; BEGIN
 SELECT (value->>'id')::uuid INTO qid FROM public.lab_results WHERE name='open';
 data:='{"price_basis":"net","valid_days":10,"terms":"Validez y repuestos sujetos a disponibilidad","comments":"Revisión profesional","items":[{"id":"20000000-0000-4000-8000-000000000001","description":"Repuesto","type":"Repuesto","quantity100":100,"unit_price":52900},{"id":"20000000-0000-4000-8000-000000000002","description":"Mano de obra","type":"Mano de obra","quantity100":150,"unit_price":24900},{"id":"20000000-0000-4000-8000-000000000003","description":"Insumo","type":"Insumo","quantity100":105,"unit_price":10}]}'::jsonb;
 a:=public.bt_cp05_save_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,1,'10000000-0000-4000-8000-000000000002',data);
 IF a<>public.bt_cp05_save_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,1,'10000000-0000-4000-8000-000000000002',data) THEN RAISE EXCEPTION 'RETRY_DUPLICATE'; END IF;
 IF (SELECT sum(line_net) FROM public.quote_items)<>90261 OR (SELECT count(*) FROM public.quote_items)<>3 THEN RAISE EXCEPTION 'LINE_ROUNDING'; END IF;
 PERFORM public.lab_expect(format('SELECT public.bt_cp05_save_quote(%L,%L,1,gen_random_uuid(),%L)','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,data),'40001');
 PERFORM public.lab_expect(format('SELECT public.bt_cp05_save_quote(%L,%L,2,gen_random_uuid(),%L)','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,jsonb_set(data,'{items,0,unit_price}','0')),'23514');
 PERFORM public.lab_expect(format('SELECT public.bt_cp05_save_quote(%L,%L,2,gen_random_uuid(),%L)','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,jsonb_set(data,'{items,0,quantity100}','1.5')),'22023');
END $$;
-- New actor, same tenant: read only, including RPC denial.
SELECT set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.quotes)<>1 THEN RAISE EXCEPTION 'MECHANIC_READ'; END IF;
 PERFORM public.lab_expect($q$SELECT public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000021',gen_random_uuid())$q$,'42501');
 PERFORM public.lab_expect($q$SELECT public.bt_cp05_prepare_issue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',gen_random_uuid(),2,gen_random_uuid(),'11111111-1111-4111-8111-111111111111')$q$,'42501');
END $$;
SELECT set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',false);
DO $$ BEGIN IF EXISTS(SELECT 1 FROM public.quotes) OR EXISTS(SELECT 1 FROM public.quote_items) THEN RAISE EXCEPTION 'CROSS_TENANT_READ'; END IF; END $$;
RESET ROLE;
-- Simulated backend receipt ONLY tests SQL state machine; not an archived PDF claim.
SET ROLE service_role;
INSERT INTO public.lab_results SELECT 'reserve',public.bt_cp05_prepare_issue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(value->>'id')::uuid,2,'10000000-0000-4000-8000-000000000003','11111111-1111-4111-8111-111111111111') FROM public.lab_results WHERE name='open';
DO $$ DECLARE r jsonb;path text; issued jsonb; BEGIN
 SELECT value INTO r FROM public.lab_results WHERE name='reserve';
 IF (public.bt_cp05_issue_status('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(r->'payload'->'quote'->>'id')::uuid,'11111111-1111-4111-8111-111111111111')->>'request_id') IS DISTINCT FROM '10000000-0000-4000-8000-000000000003' THEN RAISE EXCEPTION 'PENDING_RECOVERY_MISSING'; END IF;
 IF (r->'payload'->'totals'->>'total')::bigint<>107411 THEN RAISE EXCEPTION 'TOTAL_ROUNDING'; END IF;
 path:='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/quotes/'||(r->'payload'->'quote'->>'id')||'/r1/'||(r->>'payload_sha256')||'.pdf';
 issued:=public.bt_cp05_finish_issue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','10000000-0000-4000-8000-000000000003','11111111-1111-4111-8111-111111111111',path,repeat('a',64),1234);
 IF issued<>public.bt_cp05_finish_issue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','10000000-0000-4000-8000-000000000003','11111111-1111-4111-8111-111111111111',path,repeat('a',64),1234) THEN RAISE EXCEPTION 'ISSUE_RETRY'; END IF;
 INSERT INTO public.lab_results VALUES('issued',issued);
 PERFORM public.bt_cp05_record_delivery('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(issued->>'id')::uuid,1,'queued',NULL,NULL);
 PERFORM public.bt_cp05_record_delivery('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(issued->>'id')::uuid,1,'failed',NULL,'SYNTHETIC_REJECTION');
 PERFORM public.bt_cp05_record_delivery('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(issued->>'id')::uuid,2,'queued',NULL,NULL);
 PERFORM public.bt_cp05_record_delivery('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',(issued->>'id')::uuid,2,'sent','SYNTHETIC_ACK',NULL);
 PERFORM public.lab_expect(format('SELECT public.bt_cp05_record_delivery(%L,%L,3,%L,NULL,NULL)','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',issued->>'id','queued'),'55000');
END $$;
RESET ROLE;
SELECT public.lab_expect('UPDATE public.quote_revisions SET pdf_size=5678','42501');
SELECT public.lab_expect('DELETE FROM public.quote_revisions','42501');
SELECT public.lab_expect('DELETE FROM public.quote_delivery_events','42501');
UPDATE public.customers SET full_name='Changed after issue';
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
UPDATE public.work_orders SET status='closed' WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000021';
DO $$ DECLARE q public.quotes;BEGIN
 SELECT * INTO q FROM public.quotes;
 IF (SELECT payload->'customer'->>'full_name' FROM public.quote_revisions)<>'Test customer A' THEN RAISE EXCEPTION 'HISTORICAL_SNAPSHOT_CHANGED'; END IF;
 PERFORM public.bt_cp05_void_quote(q.workshop_id,q.id,q.version,gen_random_uuid(),'Corrección solicitada');
 SELECT * INTO q FROM public.quotes;
 PERFORM public.bt_cp05_revise_quote(q.workshop_id,q.id,q.version,gen_random_uuid(),'Nuevo borrador solicitado');
 IF (SELECT count(*) FROM public.quote_revisions)<>1 OR (SELECT count(*) FROM public.quote_events)<>2 THEN RAISE EXCEPTION 'HISTORY_LOST'; END IF;
END $$;
RESET ROLE;
UPDATE public.workshop_memberships SET status='disabled' WHERE user_id='11111111-1111-4111-8111-111111111111';
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
DO $$ BEGIN IF EXISTS(SELECT 1 FROM public.quotes) THEN RAISE EXCEPTION 'REVOKED_READ'; END IF; END $$;
RESET ROLE;
UPDATE public.workshop_memberships SET status='active' WHERE user_id='11111111-1111-4111-8111-111111111111';
SELECT 'CP05_LOCAL_RLS_HISTORY_PASS';
-- Disabled workshop and unverified email revoke visibility and all RPC writes.
UPDATE public.workshops SET status='suspended' WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
SET ROLE authenticated;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM public.quotes) THEN RAISE EXCEPTION 'SUSPENDED_WORKSHOP_READ'; END IF; END $$;
RESET ROLE;
UPDATE public.workshops SET status='active' WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
UPDATE auth.users SET email_confirmed_at=NULL WHERE id='11111111-1111-4111-8111-111111111111';
SET ROLE authenticated;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM public.quotes) THEN RAISE EXCEPTION 'UNCONFIRMED_READ'; END IF; END $$;
SELECT public.lab_expect($q$SELECT public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000021',gen_random_uuid())$q$,'42501');
RESET ROLE;
UPDATE auth.users SET email_confirmed_at=now() WHERE id='11111111-1111-4111-8111-111111111111';
SET ROLE anon;
SELECT public.lab_expect('SELECT * FROM public.quotes','42501');
SELECT public.lab_expect($q$SELECT public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000021',gen_random_uuid())$q$,'42501');
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',false);
SELECT public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000021',gen_random_uuid());
RESET ROLE;
SELECT 'CP05_ANON_EMAIL_WORKSHOP_RECEPTION_PASS';
