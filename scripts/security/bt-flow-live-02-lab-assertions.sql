-- BT-FLOW-LIVE-02 · PostgreSQL 17 local /synthetic/ tests ONLY.
-- Test operator attestations; never describe them as signatures or physical proof.
CREATE TABLE public.flow_lab_state(k text PRIMARY KEY,value jsonb NOT NULL);
GRANT SELECT,INSERT,UPDATE ON public.flow_lab_state TO authenticated,service_role;
CREATE FUNCTION public.flow_expect(cmd text,expected text) RETURNS void
 LANGUAGE plpgsql AS $$
BEGIN
 BEGIN EXECUTE cmd;
 EXCEPTION WHEN OTHERS THEN
  IF SQLSTATE=expected THEN RETURN; END IF;
  RAISE EXCEPTION 'Unexpected state % on %; expected %',SQLSTATE,cmd,expected;
 END;
 RAISE EXCEPTION 'Expected % denial: %',expected,cmd;
END $$;
-- Independent server-side activation is DENY by default, even for an active
-- owner with a legitimate JWT. No browser controls this private gate.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
SELECT public.flow_expect($call$SELECT public.bt_flow_record_quote_approval(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',gen_random_uuid(),gen_random_uuid(),
 gen_random_uuid(),'in_person','Autorización simulada sin habilitar')$call$,'42501');
SELECT public.flow_expect('SELECT * FROM bt_flow_live_private.rollout','42501');
RESET ROLE;
-- TEST/LAB ONLY: emulate a later explicit server-authorized workshop rollout.
INSERT INTO bt_flow_live_private.rollout(workshop_id,enabled,enabled_at,approval_note)
 VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true,statement_timestamp(),
 'LAB ONLY -- never enables hosted workshop data');
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
INSERT INTO public.flow_lab_state VALUES('quote',
 public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 'aaaaaaaa-aaaa-4aaa-8aaa-000000000021','10000000-0000-4000-8000-000000000081'));
DO $$
DECLARE qid uuid;result jsonb;
BEGIN
 SELECT (value->>'id')::uuid INTO qid FROM public.flow_lab_state WHERE k='quote';
 result:=public.bt_cp05_save_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 qid,1,'10000000-0000-4000-8000-000000000082',
 '{"price_basis":"net","valid_days":10,"terms":"Validez y repuestos sujetos a disponibilidad",
 "comments":"Revisión profesional sintética","items":[
 {"id":"20000000-0000-4000-8000-000000000001","description":"Pastillas de freno","type":"Repuesto","quantity100":100,"unit_price":52900},
 {"id":"20000000-0000-4000-8000-000000000002","description":"Mano de obra","type":"Mano de obra","quantity100":150,"unit_price":24900},
 {"id":"20000000-0000-4000-8000-000000000003","description":"Insumo","type":"Insumo","quantity100":105,"unit_price":10}
 ]}'::jsonb);
 IF (result->>'version')::integer<>2 THEN RAISE EXCEPTION 'CP05_PERSISTED_QUOTE_NOT_READY'; END IF;
 PERFORM public.flow_expect(
  format('SELECT public.bt_flow_record_quote_approval(%L,%L,gen_random_uuid(),gen_random_uuid(),%L,%L)',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,'in_person','Aprobación sintética sin firma'),
 '55000');
END $$;
RESET ROLE;
SET ROLE service_role;
INSERT INTO public.flow_lab_state SELECT 'reserve',
 public.bt_cp05_prepare_issue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 (value->>'id')::uuid,2,'10000000-0000-4000-8000-000000000083',
 '11111111-1111-4111-8111-111111111111')
 FROM public.flow_lab_state WHERE k='quote';
DO $$ DECLARE req jsonb;result jsonb;path text; BEGIN
 SELECT value INTO req FROM public.flow_lab_state WHERE k='reserve';
 path:='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/quotes/'||
 (req->'payload'->'quote'->>'id')||'/r1/'||(req->>'payload_sha256')||'.pdf';
 result:=public.bt_cp05_finish_issue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 '10000000-0000-4000-8000-000000000083','11111111-1111-4111-8111-111111111111',
 path,repeat('a',64),1234);
 INSERT INTO public.flow_lab_state VALUES('issued',result);
END $$;
RESET ROLE;

-- Before approved revision evidence: no execution or delivery.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
SELECT public.flow_expect(
 $call$SELECT public.bt_flow_record_execution(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='quote'),
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='issued'),
 gen_random_uuid(),'{"20000000-0000-4000-8000-000000000001":"performed"}',
 'Trabajo pendiente',true)$call$,
 '55000');
SELECT public.flow_expect(
 'INSERT INTO public.bt_flow_execution_reports DEFAULT VALUES','42501');
SELECT public.flow_expect(
 'DELETE FROM public.bt_flow_quote_approvals','42501');
SELECT public.flow_expect(
 'INSERT INTO public.bt_flow_visit_deliveries DEFAULT VALUES','42501');
DO $$ DECLARE qid uuid;revid uuid;result jsonb;repeat_result jsonb; BEGIN
 SELECT (value->>'id')::uuid INTO qid FROM public.flow_lab_state WHERE k='quote';
 SELECT (value->>'id')::uuid INTO revid FROM public.flow_lab_state WHERE k='issued';
 result:=public.bt_flow_record_quote_approval(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,revid,
  '10000000-0000-4000-8000-000000000084','in_person',
  'Aprobación verbal declarada por el operador QA; no firma');
 repeat_result:=public.bt_flow_record_quote_approval(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,revid,
  '10000000-0000-4000-8000-000000000084','in_person',
  'Aprobación verbal declarada por el operador QA; no firma');
 IF result<>repeat_result THEN RAISE EXCEPTION 'APPROVAL_IDEMPOTENCY'; END IF;
 INSERT INTO public.flow_lab_state VALUES('approval',result);
 PERFORM public.flow_expect(format(
  'SELECT public.bt_flow_record_quote_approval(%L,%L,%L,%L,%L,%L)',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,revid,
  '10000000-0000-4000-8000-000000000084','other','Otro texto sintético 123'), '22023');
 PERFORM public.flow_expect(format(
  'SELECT public.bt_flow_record_quote_approval(%L,%L,%L,gen_random_uuid(),%L,%L)',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,revid,
  'other','Otro texto sintético 123'), '23505');
END $$;
SELECT public.flow_expect(
 $call$SELECT public.bt_flow_record_execution(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='quote'),
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='issued'),
 gen_random_uuid(),'{"20000000-0000-4000-8000-000000000001":"performed"}',
 'Trabajo pendiente',true)$call$,'55000');
-- Existing work order must explicitly transition to service, not be treated
-- as performed merely because the multipoint inspection found an issue.
UPDATE public.work_orders SET status='inspecting'
 WHERE workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
 AND id='aaaaaaaa-aaaa-4aaa-8aaa-000000000021';
UPDATE public.work_orders SET status='in_service'
 WHERE workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
 AND id='aaaaaaaa-aaaa-4aaa-8aaa-000000000021';
SELECT public.flow_expect(
 $call$SELECT public.bt_flow_record_execution(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='quote'),
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='issued'),
 gen_random_uuid(),'{"20000000-0000-4000-8000-000000000001":"performed"}',
 'Trabajo pendiente',true)$call$,'22023');
SELECT public.flow_expect(
 $call$SELECT public.bt_flow_record_execution(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='quote'),
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='issued'),
 gen_random_uuid(),'{"20000000-0000-4000-8000-000000000001":"performed",
 "20000000-0000-4000-8000-000000000002":"performed",
 "20000000-0000-4000-8000-000000000003":"performed"}',
 'Trabajo pendiente',false)$call$,'22023');
DO $$
DECLARE qid uuid;revid uuid;res jsonb;res2 jsonb; mark jsonb; BEGIN
 SELECT (value->>'id')::uuid INTO qid FROM public.flow_lab_state WHERE k='quote';
 SELECT (value->>'id')::uuid INTO revid FROM public.flow_lab_state WHERE k='issued';
 mark:='{"20000000-0000-4000-8000-000000000001":"performed",
 "20000000-0000-4000-8000-000000000002":"not_performed",
 "20000000-0000-4000-8000-000000000003":"performed"}'::jsonb;
 res:=public.bt_flow_record_execution(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,revid,
  '10000000-0000-4000-8000-000000000085',mark,
  'Mano de obra pendiente de autorización en la visita siguiente.',true);
 res2:=public.bt_flow_record_execution(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,revid,
  '10000000-0000-4000-8000-000000000085',mark,
  'Mano de obra pendiente de autorización en la visita siguiente.',true);
 IF res<>res2 THEN RAISE EXCEPTION 'EXECUTION_IDEMPOTENCY'; END IF;
 IF (res->>'quoted_total')::bigint<>107411 OR
    (res->>'performed_net')::bigint<>52911 OR
    (res->>'performed_tax')::bigint<>10053 OR
    (res->>'performed_total')::bigint<>62964
 THEN RAISE EXCEPTION 'DERIVED_SERVER_TOTAL_INCORRECT %',res; END IF;
 INSERT INTO public.flow_lab_state VALUES('report',res);
 PERFORM public.flow_expect(format('SELECT public.bt_flow_record_execution(%L,%L,%L,%L,%L,%L,true)',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,revid,
   '10000000-0000-4000-8000-000000000085',mark,
   'Reutilizo ID con datos distintos'), '22023');
 PERFORM public.flow_expect(format('SELECT public.bt_flow_record_execution(%L,%L,%L,gen_random_uuid(),%L,%L,true)',
   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',qid,revid,
   mark,'Rechazo duplicados con otro request'), '23505');
END $$;
-- Handover still blocked: no ready status and no operator checklist evidence.
SELECT public.flow_expect(
 $call$SELECT public.bt_flow_record_handover(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='report'),
 gen_random_uuid(),
 '{"vehicleChecked":true,"workChecked":true,"documentsChecked":true,"pendingExplained":true}',
 'in_person','Entrega sin estado listo',true)$call$,'55000');
UPDATE public.work_orders SET status='ready'
 WHERE workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
 AND id='aaaaaaaa-aaaa-4aaa-8aaa-000000000021';
SELECT public.flow_expect(
 $call$SELECT public.bt_flow_record_handover(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='report'),
 gen_random_uuid(),
 '{"vehicleChecked":true,"workChecked":false,"documentsChecked":true,"pendingExplained":true}',
 'in_person','El operador no revisó los trabajos',true)$call$,'22023');
DO $$ DECLARE reportid uuid;res jsonb;checklist jsonb; BEGIN
 SELECT (value->>'id')::uuid INTO reportid FROM public.flow_lab_state WHERE k='report';
 checklist:='{"vehicleChecked":true,"workChecked":true,"documentsChecked":true,"pendingExplained":true}'::jsonb;
 res:=public.bt_flow_record_handover(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',reportid,
  '10000000-0000-4000-8000-000000000086',checklist,'in_person',
  'Entrega al cliente declarada por operador QA, sin firma ni prueba física',true);
 IF res<>public.bt_flow_record_handover(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',reportid,
  '10000000-0000-4000-8000-000000000086',checklist,'in_person',
  'Entrega al cliente declarada por operador QA, sin firma ni prueba física',true)
 THEN RAISE EXCEPTION 'HANDOVER_IDEMPOTENCY'; END IF;
 INSERT INTO public.flow_lab_state VALUES('handover',res);
 PERFORM public.flow_expect(format('SELECT public.bt_flow_record_handover(%L,%L,gen_random_uuid(),%L,%L,%L,true)',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',reportid,checklist,
  'other','Otra entrega sintética sin firma'), '23505');
END $$;
-- Read own workshop; even mechanic may audit read-only without an insert grant.
SELECT count(*) FROM public.bt_flow_quote_approvals;
SELECT count(*) FROM public.bt_flow_execution_reports;
SELECT count(*) FROM public.bt_flow_visit_deliveries;
SELECT public.flow_expect('UPDATE public.bt_flow_execution_reports SET performed_net=0','42501');
SELECT set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
DO $$ BEGIN IF (SELECT count(*) FROM public.bt_flow_execution_reports)<>1 THEN
 RAISE EXCEPTION 'MECHANIC_READ_ONLY_LOST'; END IF; END $$;
SELECT public.flow_expect(
 $call$SELECT public.bt_flow_record_handover(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='report'),
 gen_random_uuid(),
 '{"vehicleChecked":true,"workChecked":true,"documentsChecked":true,"pendingExplained":true}',
 'other','El mecánico no tiene permisos de declaración',true)$call$,'42501');
SELECT set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',false);
DO $$ BEGIN IF EXISTS(SELECT 1 FROM public.bt_flow_execution_reports) OR
 EXISTS(SELECT 1 FROM public.bt_flow_visit_deliveries) OR
 EXISTS(SELECT 1 FROM public.bt_flow_quote_approvals) THEN
 RAISE EXCEPTION 'CROSS_TENANT_FLOW_READ'; END IF; END $$;
SELECT public.flow_expect(
 $call$SELECT public.bt_flow_record_handover(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='report'),
 gen_random_uuid(),
 '{"vehicleChecked":true,"workChecked":true,"documentsChecked":true,"pendingExplained":true}',
 'other','Taller cruzado sin permiso de operación',true)$call$,'42501');
RESET ROLE;
UPDATE public.workshop_memberships SET status='disabled'
 WHERE user_id='11111111-1111-4111-8111-111111111111';
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
DO $$ BEGIN IF EXISTS(SELECT 1 FROM public.bt_flow_execution_reports) OR
 EXISTS(SELECT 1 FROM public.bt_flow_visit_deliveries) THEN RAISE EXCEPTION 'REVOKED_READ'; END IF; END $$;
SELECT public.flow_expect(
 $call$SELECT public.bt_flow_record_quote_approval(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='quote'),
 (SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='issued'),
 gen_random_uuid(),'other','Revocado no puede aprobar revisión')$call$,'42501');
RESET ROLE;
UPDATE public.workshop_memberships SET status='active'
 WHERE user_id='11111111-1111-4111-8111-111111111111';
-- Invalidation: after reopening quote revision, do not claim old handover
-- as valid approval for new work, while immutable records stay queryable.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
DO $$ DECLARE q public.quotes;BEGIN
 SELECT * INTO q FROM public.quotes WHERE workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 PERFORM public.bt_cp05_revise_quote(q.workshop_id,q.id,q.version,gen_random_uuid(),
 'Cliente solicita cambio de partida tras entrega');
 PERFORM public.flow_expect(format('SELECT public.bt_flow_record_execution(%L,%L,%L,gen_random_uuid(),%L,%L,true)',
  q.workshop_id,q.id,(SELECT (value->>'id')::uuid FROM public.flow_lab_state WHERE k='issued'),
  '{"20000000-0000-4000-8000-000000000001":"performed",
   "20000000-0000-4000-8000-000000000002":"not_performed",
   "20000000-0000-4000-8000-000000000003":"performed"}'::jsonb,
  'No se puede usar revisión anterior'), '55000');
 IF (SELECT count(*) FROM public.bt_flow_visit_deliveries)<>1 THEN
 RAISE EXCEPTION 'HISTORIC_HANDOVER_LOST'; END IF;
END $$;
RESET ROLE;
SELECT 'BT_FLOW_LIVE_02_LOCAL_RLS_ATTESTATIONS_PASS';
