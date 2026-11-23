-- LOCAL SYNTHETIC DATABASE ONLY. Existing CP05 suite established R1 snapshot.
SET ROLE service_role;
DO $$ DECLARE qid uuid; prior jsonb; recovered jsonb; BEGIN
 SELECT (value->>'id')::uuid INTO qid FROM public.lab_results WHERE name='open';
 SELECT value INTO prior FROM public.lab_results WHERE name='issued';
 recovered:=public.bt_cp05_completed_issue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,2,'11111111-1111-4111-8111-111111111111');
 IF recovered->'completed' IS DISTINCT FROM prior THEN RAISE EXCEPTION 'COMPLETED_RECOVERY_CHANGED'; END IF;
 IF recovered->'payload'->'customer'->>'full_name'<>'Test customer A' THEN RAISE EXCEPTION 'FROZEN_CUSTOMER_CHANGED'; END IF;
 IF public.bt_cp05_completed_issue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,999,'11111111-1111-4111-8111-111111111111') IS NOT NULL THEN RAISE EXCEPTION 'WRONG_VERSION_RECOVERED'; END IF;
 PERFORM public.lab_expect(format('SELECT public.bt_cp05_completed_issue(%L,%L,2,%L)','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,'33333333-3333-4333-8333-333333333333'),'42501');
 PERFORM public.lab_expect(format('SELECT public.bt_cp05_completed_issue(%L,%L,2,%L)','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',qid,'11111111-1111-4111-8111-111111111111'),'42501');
 IF (SELECT count(*) FROM public.quote_revisions)<>1 THEN RAISE EXCEPTION 'RECOVERY_DUPLICATED_REVISION'; END IF;
END $$;
RESET ROLE;
SET ROLE authenticated;
SELECT public.lab_expect($q$SELECT public.bt_cp05_completed_issue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',gen_random_uuid(),2,'11111111-1111-4111-8111-111111111111')$q$,'42501');
RESET ROLE;
SET ROLE anon;
SELECT public.lab_expect($q$SELECT public.bt_cp05_completed_issue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',gen_random_uuid(),2,'11111111-1111-4111-8111-111111111111')$q$,'42501');
RESET ROLE;
SELECT 'CP05_COMPLETED_ORIGINAL_SNAPSHOT_RECOVERY_PASS';
