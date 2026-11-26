-- CANDIDATE ONLY. Installed catalog read-only snapshot 2026-11-26. No hosted execution.
-- Preserve function OIDs/signatures/ACL/search_path/security; no policies, roles, flags or data changes.
BEGIN;
SET LOCAL lock_timeout='5s';
DO $preflight$ BEGIN
IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='bt_agenda_private' AND p.proname='command' AND pg_get_function_identity_arguments(p.oid)='wid uuid, request uuid, kind text, data jsonb' AND md5(p.prosrc)='9cf426a8c63d2272961fe54f4fdf6cfe') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_FUNCTION_DRIFT: bt_agenda_private.command'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='bt_cp05_private' AND p.proname='prepare_issue_before_agenda' AND pg_get_function_identity_arguments(p.oid)='wid uuid, qid uuid, expected bigint, rid uuid, actor uuid' AND md5(p.prosrc)='8a37e5e095b9750029a003da9ebd6df3') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_FUNCTION_DRIFT: bt_cp05_private.prepare_issue_before_agenda'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='bt_cp05_private' AND p.proname='revise_quote' AND pg_get_function_identity_arguments(p.oid)='wid uuid, qid uuid, expected bigint, rid uuid, reason text' AND md5(p.prosrc)='abec5527e29f22c86410c1985e36ecc9') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_FUNCTION_DRIFT: bt_cp05_private.revise_quote'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='bt_cp05_private' AND p.proname='void_quote' AND pg_get_function_identity_arguments(p.oid)='wid uuid, qid uuid, expected bigint, rid uuid, reason text' AND md5(p.prosrc)='90c0a57fad9358d5396cfab33aa92917') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_FUNCTION_DRIFT: bt_cp05_private.void_quote'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='bt_flow_live_private' AND p.proname='approval' AND pg_get_function_identity_arguments(p.oid)='wid uuid, qid uuid, revid uuid, rid uuid, answer_method text, answer_note text' AND md5(p.prosrc)='a75427096ebbb3d75f607bbcc5c2b7ac') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_FUNCTION_DRIFT: bt_flow_live_private.approval'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='bt_flow_live_private' AND p.proname='delivery' AND pg_get_function_identity_arguments(p.oid)='wid uuid, reportid uuid, rid uuid, checks jsonb, method text, note text, confirmed boolean' AND md5(p.prosrc)='06271eda5f918447c7f314d7931e9ec1') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_FUNCTION_DRIFT: bt_flow_live_private.delivery'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='bt_flow_live_private' AND p.proname='execution' AND pg_get_function_identity_arguments(p.oid)='wid uuid, qid uuid, revid uuid, rid uuid, marks jsonb, note text, reviewed boolean' AND md5(p.prosrc)='27567a790f9512b9bcabab12ccc94a3e') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_FUNCTION_DRIFT: bt_flow_live_private.execution'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='bt_records_private' AND p.proname='execute_record' AND pg_get_function_identity_arguments(p.oid)='wid uuid, resource text, rid uuid, action text, token text, request uuid, reason text' AND md5(p.prosrc)='426844a86ada867e710f4ec8eb18904c') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_FUNCTION_DRIFT: bt_records_private.execute_record'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND t.relname='bt_agenda_receipts' AND c.conname='bt_agenda_receipts_complaint_check' AND pg_get_constraintdef(c.oid)='CHECK (((char_length(btrim(complaint)) >= 3) AND (char_length(btrim(complaint)) <= 2000)))') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_CONSTRAINT_DRIFT: bt_agenda_receipts_complaint_check'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND t.relname='bt_flow_quote_approvals' AND c.conname='bt_flow_quote_approvals_note_check' AND pg_get_constraintdef(c.oid)='CHECK (((char_length(btrim(note)) >= 12) AND (char_length(btrim(note)) <= 1000)))') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_CONSTRAINT_DRIFT: bt_flow_quote_approvals_note_check'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND t.relname='bt_flow_visit_deliveries' AND c.conname='bt_flow_visit_deliveries_handover_note_check' AND pg_get_constraintdef(c.oid)='CHECK (((char_length(btrim(handover_note)) >= 12) AND (char_length(btrim(handover_note)) <= 1000)))') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_CONSTRAINT_DRIFT: bt_flow_visit_deliveries_handover_note_check'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND t.relname='inspection_findings' AND c.conname='cp04_finding_resolution' AND pg_get_constraintdef(c.oid)='CHECK ((((result = ''attention''::text) AND (resolution = ANY (ARRAY[''pending''::text, ''resolved''::text])) AND (note IS NOT NULL) AND (char_length(btrim(note)) >= 3)) OR ((result = ANY (ARRAY[''ok''::text, ''not_checked''::text])) AND (resolution = ''not_applicable''::text))))') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_CONSTRAINT_DRIFT: cp04_finding_resolution'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND t.relname='quote_events' AND c.conname='quote_events_reason_check' AND pg_get_constraintdef(c.oid)='CHECK (((char_length(btrim(reason)) >= 3) AND (char_length(btrim(reason)) <= 1000)))') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_CONSTRAINT_DRIFT: quote_events_reason_check'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND t.relname='quotes' AND c.conname='quotes_void_reason_check' AND pg_get_constraintdef(c.oid)='CHECK (((void_reason IS NULL) OR ((char_length(btrim(void_reason)) >= 3) AND (char_length(btrim(void_reason)) <= 1000))))') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_CONSTRAINT_DRIFT: quotes_void_reason_check'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND t.relname='work_orders' AND c.conname='work_orders_cancel_reason_check' AND pg_get_constraintdef(c.oid)='CHECK (((cancel_reason IS NULL) OR ((char_length(btrim(cancel_reason)) >= 3) AND (char_length(btrim(cancel_reason)) <= 500))))') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_CONSTRAINT_DRIFT: work_orders_cancel_reason_check'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND t.relname='work_orders' AND c.conname='work_orders_complaint_check' AND pg_get_constraintdef(c.oid)='CHECK (((char_length(btrim(complaint)) >= 3) AND (char_length(btrim(complaint)) <= 2000)))') THEN RAISE EXCEPTION 'BT_FLOW_FIX_01_CONSTRAINT_DRIFT: work_orders_complaint_check'; END IF;
END $preflight$;
CREATE OR REPLACE FUNCTION bt_agenda_private.command(wid uuid, request uuid, kind text, data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE zone text;oldcmd bt_agenda_private.commands;o public.work_orders;v public.vehicles;c public.customers;q public.quotes;r public.quote_revisions;a bt_agenda_private.appointments;previous jsonb;answer jsonb;rid uuid;moment timestamptz;local_time timestamp;receipt public.bt_agenda_receipts;keys text[];
BEGIN
 zone:=bt_agenda_private.authorize(wid);
 IF request IS NULL OR data IS NULL OR jsonb_typeof(data)<>'object' OR kind IS NULL OR kind NOT IN ('prepare','schedule','confirm','reschedule','cancel','receive') THEN RAISE EXCEPTION 'AGENDA_INVALID' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('agenda:'||wid::text,17));
 SELECT * INTO oldcmd FROM bt_agenda_private.commands WHERE workshop_id=wid AND request_id=request;
 IF FOUND THEN
  IF oldcmd.actor_id<>auth.uid() OR oldcmd.kind<>kind OR oldcmd.input<>data THEN RAISE EXCEPTION 'AGENDA_REQUEST_REUSED' USING ERRCODE='22023'; END IF;
  RETURN oldcmd.response;
 END IF;
 keys:=CASE kind WHEN 'prepare' THEN ARRAY['vehicle_id','service'] WHEN 'schedule' THEN ARRAY['quote_id','revision_id','local_start','duration_minutes','notes','tentative'] WHEN 'confirm' THEN ARRAY['id','version'] WHEN 'reschedule' THEN ARRAY['id','version','local_start','duration_minutes','notes'] WHEN 'cancel' THEN ARRAY['id','version','reason'] ELSE ARRAY['id','version','odometer','complaint','confirmed'] END;
 IF EXISTS(SELECT 1 FROM jsonb_object_keys(data) k WHERE NOT k=ANY(keys)) THEN RAISE EXCEPTION 'AGENDA_UNKNOWN_FIELD' USING ERRCODE='22023'; END IF;
 IF kind='prepare' THEN
  IF char_length(btrim(coalesce(data->>'service',''))) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'AGENDA_SERVICE_REQUIRED' USING ERRCODE='22023'; END IF;
  SELECT * INTO v FROM public.vehicles WHERE workshop_id=wid AND id=(data->>'vehicle_id')::uuid AND archived_at IS NULL;
  SELECT * INTO c FROM public.customers WHERE workshop_id=wid AND id=v.customer_id AND archived_at IS NULL;
  IF v.id IS NULL OR c.id IS NULL THEN RAISE EXCEPTION 'AGENDA_SOURCE_DENIED' USING ERRCODE='42501'; END IF;
  SELECT * INTO o FROM public.work_orders WHERE workshop_id=wid AND vehicle_id=v.id AND status<>'closed';
  IF o.id IS NOT NULL AND (o.intake_phase<>'planned' OR o.cancelled_at IS NOT NULL OR o.complaint<>btrim(data->>'service')) THEN RAISE EXCEPTION 'AGENDA_VEHICLE_BUSY' USING ERRCODE='40001'; END IF;
  IF o.id IS NULL THEN INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint,intake_phase) VALUES(wid,v.id,btrim(data->>'service'),'planned') RETURNING * INTO o; END IF;
  answer:=bt_cp05_private.open_quote(wid,o.id,request);
  answer:=answer||jsonb_build_object('order_id',o.id,'vehicle_id',v.id,'intake_phase','planned');rid:=o.id;
 ELSE
  IF kind='schedule' THEN SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=(data->>'quote_id')::uuid FOR UPDATE;
  ELSE
   SELECT * INTO a FROM bt_agenda_private.appointments WHERE workshop_id=wid AND id=(data->>'id')::uuid FOR UPDATE;
   IF a.id IS NULL THEN RAISE EXCEPTION 'AGENDA_NOT_FOUND' USING ERRCODE='42501'; END IF;
   previous:=to_jsonb(a);
   IF kind='receive' AND a.status='received' THEN
    SELECT * INTO receipt FROM public.bt_agenda_receipts WHERE workshop_id=wid AND order_id=a.order_id;
    IF data->'confirmed' IS DISTINCT FROM 'true'::jsonb OR receipt.odometer IS DISTINCT FROM (data->>'odometer')::integer OR receipt.complaint IS DISTINCT FROM btrim(data->>'complaint') THEN RAISE EXCEPTION 'AGENDA_RECEIPT_CONFLICT' USING ERRCODE='40001'; END IF;
    answer:=jsonb_build_object('order_id',a.order_id,'appointment',to_jsonb(a));
   ELSE
    IF a.version IS DISTINCT FROM (data->>'version')::bigint OR a.status IN ('received','cancelled') THEN RAISE EXCEPTION 'AGENDA_CONFLICT' USING ERRCODE='40001'; END IF;
   END IF;
   SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=a.quote_id FOR UPDATE;
  END IF;
  IF answer IS NULL THEN
   IF q.id IS NULL THEN RAISE EXCEPTION 'AGENDA_SOURCE_DENIED' USING ERRCODE='42501'; END IF;
   SELECT * INTO o FROM public.work_orders WHERE workshop_id=wid AND id=q.order_id FOR UPDATE;
   IF o.id IS NULL OR (kind<>'cancel' AND (o.status='closed' OR o.cancelled_at IS NOT NULL)) THEN RAISE EXCEPTION 'AGENDA_ORDER_CLOSED' USING ERRCODE='55000'; END IF;
   IF kind<>'cancel' THEN
    SELECT * INTO v FROM public.vehicles WHERE workshop_id=wid AND id=q.vehicle_id AND archived_at IS NULL;
    SELECT * INTO c FROM public.customers WHERE workshop_id=wid AND id=q.customer_id AND archived_at IS NULL;
    SELECT * INTO r FROM public.quote_revisions WHERE workshop_id=wid AND quote_id=q.id AND revision=q.issued_revision;
    IF v.id IS NULL OR c.id IS NULL OR v.customer_id<>c.id OR q.status<>'issued' OR q.issue_pending OR r.id IS NULL OR r.id IS DISTINCT FROM (CASE WHEN kind='schedule' THEN (data->>'revision_id')::uuid ELSE a.revision_id END) THEN RAISE EXCEPTION 'AGENDA_REVISION_CHANGED' USING ERRCODE='40001'; END IF;
    IF (kind IN ('receive','confirm') OR kind='schedule' AND coalesce((data->>'tentative')::boolean,false)=false) AND NOT EXISTS(SELECT 1 FROM public.bt_flow_quote_approvals WHERE workshop_id=wid AND revision_id=r.id AND quote_id=q.id) THEN RAISE EXCEPTION 'AGENDA_APPROVAL_REQUIRED' USING ERRCODE='55000'; END IF;
   END IF;
   IF kind IN ('schedule','reschedule') THEN
    IF (data->>'local_start')!~'^\d{4}-\d\d-\d\dT\d\d:\d\d$' OR data->>'local_start' IS NULL THEN RAISE EXCEPTION 'AGENDA_DATE_INVALID' USING ERRCODE='22023'; END IF;
    local_time:=(data->>'local_start')::timestamp;moment:=local_time AT TIME ZONE zone;
    IF moment AT TIME ZONE zone<>local_time OR moment<statement_timestamp()-interval '5 minutes' OR moment>statement_timestamp()+interval '2 years' OR char_length(coalesce(data->>'notes',''))>2000 OR (data->>'duration_minutes')::integer NOT BETWEEN 15 AND 480 OR data->>'duration_minutes' IS NULL THEN RAISE EXCEPTION 'AGENDA_DATE_INVALID' USING ERRCODE='22023'; END IF;
   END IF;
   IF kind='schedule' THEN
    IF o.intake_phase<>'planned' THEN RAISE EXCEPTION 'AGENDA_ALREADY_RECEIVED' USING ERRCODE='55000'; END IF;
    INSERT INTO bt_agenda_private.appointments(workshop_id,order_id,vehicle_id,customer_id,quote_id,revision_id,starts_at,duration_minutes,timezone,status,notes,created_by)
    VALUES(wid,o.id,v.id,c.id,q.id,r.id,moment,(data->>'duration_minutes')::integer,zone,CASE WHEN coalesce((data->>'tentative')::boolean,false) THEN 'pending' ELSE 'scheduled' END,coalesce(data->>'notes',''),auth.uid()) RETURNING * INTO a;
   ELSIF kind='reschedule' THEN UPDATE bt_agenda_private.appointments SET starts_at=moment,timezone=zone,duration_minutes=(data->>'duration_minutes')::integer,notes=coalesce(data->>'notes',''),version=version+1,updated_at=statement_timestamp() WHERE workshop_id=wid AND id=a.id RETURNING * INTO a;
   ELSIF kind='confirm' THEN UPDATE bt_agenda_private.appointments SET status='scheduled',version=version+1,updated_at=statement_timestamp() WHERE workshop_id=wid AND id=a.id RETURNING * INTO a;
   ELSIF kind='cancel' THEN
    IF char_length(btrim(coalesce(data->>'reason',''))) NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'AGENDA_REASON_REQUIRED' USING ERRCODE='22023'; END IF;
    UPDATE bt_agenda_private.appointments SET status='cancelled',version=version+1,updated_at=statement_timestamp() WHERE workshop_id=wid AND id=a.id RETURNING * INTO a;
   ELSIF kind='receive' THEN
    IF a.status<>'scheduled' OR o.intake_phase<>'planned' OR data->'confirmed' IS DISTINCT FROM 'true'::jsonb OR (data->>'odometer')::integer NOT BETWEEN 0 AND 3000000 OR data->>'odometer' IS NULL OR char_length(btrim(coalesce(data->>'complaint',''))) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'AGENDA_RECEIPT_INVALID' USING ERRCODE='22023'; END IF;
    INSERT INTO public.bt_agenda_receipts(workshop_id,order_id,vehicle_id,customer_id,quote_id,revision_id,request_id,odometer,complaint,recorded_by) VALUES(wid,o.id,v.id,c.id,q.id,r.id,request,(data->>'odometer')::integer,btrim(data->>'complaint'),auth.uid()) RETURNING * INTO receipt;
    UPDATE public.work_orders SET intake_phase='received',intake_received_at=receipt.received_at,intake_odometer=receipt.odometer,complaint=receipt.complaint WHERE workshop_id=wid AND id=o.id;
    UPDATE bt_agenda_private.appointments SET status='received',version=version+1,updated_at=statement_timestamp() WHERE workshop_id=wid AND id=a.id RETURNING * INTO a;
   END IF;
   answer:=jsonb_build_object('appointment',to_jsonb(a),'order_id',o.id);rid:=a.id;
  END IF;
 END IF;
 INSERT INTO bt_agenda_private.commands VALUES(wid,request,auth.uid(),kind,data,answer);
 INSERT INTO bt_agenda_private.events(workshop_id,request_id,actor_id,kind,entity_id,before_data,after_data) VALUES(wid,request,auth.uid(),kind,coalesce(rid,a.id),previous,jsonb_build_object('input',data,'result',answer));
 RETURN answer;
END $function$
;

CREATE OR REPLACE FUNCTION bt_cp05_private.prepare_issue_before_agenda(wid uuid, qid uuid, expected bigint, rid uuid, actor uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE q public.quotes;req bt_cp05_private.issue_requests;snapshot jsonb;lines jsonb;net bigint;rev integer;
BEGIN
 PERFORM bt_cp05_private.authorize(wid,actor,true);
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=qid FOR UPDATE;
 IF q.id IS NULL THEN RAISE EXCEPTION 'CP05_NOT_FOUND' USING ERRCODE='42501'; END IF;
 SELECT * INTO req FROM bt_cp05_private.issue_requests WHERE workshop_id=wid AND request_id=rid;
 IF FOUND THEN
  IF req.quote_id<>qid OR req.expected_version<>expected OR req.actor_id<>actor OR req.state='cancelled' THEN RAISE EXCEPTION 'CP05_REQUEST_REUSED' USING ERRCODE='22023'; END IF;
  RETURN jsonb_build_object('request_id',rid,'revision',req.revision,'payload',req.payload,'payload_sha256',req.payload_sha256);
 END IF;
 IF q.version<>expected THEN RAISE EXCEPTION 'CP05_CONFLICT' USING ERRCODE='40001'; END IF;
 IF q.status<>'draft' OR q.issue_pending THEN RAISE EXCEPTION 'CP05_NOT_READY' USING ERRCODE='55000'; END IF;
 SELECT jsonb_agg(to_jsonb(i) ORDER BY i.position),sum(i.line_net) INTO lines,net FROM public.quote_items i WHERE workshop_id=wid AND quote_id=qid;
 IF lines IS NULL THEN RAISE EXCEPTION 'CP05_ITEMS_REQUIRED' USING ERRCODE='22023'; END IF;
 rev:=q.issued_revision+1;
 SELECT jsonb_build_object('quote',to_jsonb(q)||jsonb_build_object('status','issued','revision',rev),'workshop',jsonb_build_object('id',w.id,'name',w.name),
 'customer',jsonb_build_object('id',c.id,'full_name',c.full_name,'email',c.email,'mobile_e164',c.mobile_e164),
 'vehicle',jsonb_build_object('id',v.id,'plate',v.plate,'make',v.make,'model',v.model,'model_year',v.model_year),
 'order',jsonb_build_object('id',o.id,'complaint',o.complaint,'opened_at',o.opened_at,'intake_odometer',o.intake_odometer),
 'items',lines,'totals',jsonb_build_object('subtotal',net,'tax',(net*19+50)/100,'total',net+(net*19+50)/100),
 'document_date',statement_timestamp(),'notice','Cotización no tributaria. No acredita ejecución ni aceptación del cliente.') INTO snapshot
 FROM public.workshops w JOIN public.work_orders o ON o.workshop_id=w.id AND o.id=q.order_id
 JOIN public.vehicles v ON v.workshop_id=w.id AND v.id=q.vehicle_id
 JOIN public.customers c ON c.workshop_id=w.id AND c.id=q.customer_id
 WHERE w.id=wid AND v.customer_id=c.id;
 IF snapshot IS NULL THEN RAISE EXCEPTION 'CP05_SOURCE_INVALID' USING ERRCODE='22023'; END IF;
 INSERT INTO bt_cp05_private.issue_requests(workshop_id,request_id,quote_id,expected_version,revision,actor_id,payload,payload_sha256) VALUES(wid,rid,qid,expected,rev,actor,snapshot,bt_cp05_private.hash(snapshot));
 UPDATE public.quotes SET issue_pending=true WHERE workshop_id=wid AND id=qid;
 RETURN jsonb_build_object('request_id',rid,'revision',rev,'payload',snapshot,'payload_sha256',bt_cp05_private.hash(snapshot));
END $function$
;

CREATE OR REPLACE FUNCTION bt_cp05_private.revise_quote(wid uuid, qid uuid, expected bigint, rid uuid, reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE q public.quotes;answer jsonb;input jsonb:=jsonb_build_object('quote',qid,'expected',expected,'reason',reason);
BEGIN
 PERFORM bt_cp05_private.authorize(wid,auth.uid(),true);
 answer:=bt_cp05_private.command(wid,rid,'revise',input); IF answer IS NOT NULL THEN RETURN answer; END IF;
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=qid FOR UPDATE;
 IF q.id IS NULL THEN RAISE EXCEPTION 'CP05_NOT_FOUND' USING ERRCODE='42501'; END IF;
 IF q.version<>expected THEN RAISE EXCEPTION 'CP05_CONFLICT' USING ERRCODE='40001'; END IF;
 IF q.status='draft' OR q.issue_pending THEN RAISE EXCEPTION 'CP05_NOT_ISSUED' USING ERRCODE='55000'; END IF;
 IF char_length(btrim(reason)) NOT BETWEEN 1 AND 1000 OR reason IS NULL THEN RAISE EXCEPTION 'CP05_REASON_REQUIRED' USING ERRCODE='22023'; END IF;
 UPDATE public.quotes SET status='draft',version=version+1,updated_at=statement_timestamp(),void_reason=NULL WHERE workshop_id=wid AND id=qid;
 INSERT INTO public.quote_events(workshop_id,quote_id,revision,kind,reason,actor_id) VALUES(wid,qid,q.issued_revision,'revised',reason,auth.uid());
 answer:=jsonb_build_object('id',qid,'version',q.version+1,'reason',reason,'actor',auth.uid(),'at',statement_timestamp());
 INSERT INTO bt_cp05_private.commands VALUES(wid,rid,'revise',bt_cp05_private.hash(input),answer); RETURN answer;
END $function$
;

CREATE OR REPLACE FUNCTION bt_cp05_private.void_quote(wid uuid, qid uuid, expected bigint, rid uuid, reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE q public.quotes;answer jsonb;input jsonb:=jsonb_build_object('quote',qid,'expected',expected,'reason',reason);
BEGIN
 PERFORM bt_cp05_private.authorize(wid,auth.uid(),true);
 answer:=bt_cp05_private.command(wid,rid,'void',input); IF answer IS NOT NULL THEN RETURN answer; END IF;
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=qid FOR UPDATE;
 IF q.id IS NULL THEN RAISE EXCEPTION 'CP05_NOT_FOUND' USING ERRCODE='42501'; END IF;
 IF q.version<>expected THEN RAISE EXCEPTION 'CP05_CONFLICT' USING ERRCODE='40001'; END IF;
 IF q.status<>'issued' OR q.issue_pending THEN RAISE EXCEPTION 'CP05_NOT_ISSUED' USING ERRCODE='55000'; END IF;
 IF reason IS NULL OR char_length(btrim(reason)) NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'CP05_REASON_REQUIRED' USING ERRCODE='22023'; END IF;
 UPDATE public.quotes SET status='voided',void_reason=reason,version=version+1,updated_at=statement_timestamp() WHERE workshop_id=wid AND id=qid;
 INSERT INTO public.quote_events(workshop_id,quote_id,revision,kind,reason,actor_id) VALUES(wid,qid,q.issued_revision,'voided',reason,auth.uid());
 answer:=jsonb_build_object('id',qid,'version',q.version+1,'reason',reason,'actor',auth.uid(),'at',statement_timestamp());
 INSERT INTO bt_cp05_private.commands VALUES(wid,rid,'void',bt_cp05_private.hash(input),answer); RETURN answer;
END $function$
;

CREATE OR REPLACE FUNCTION bt_flow_live_private.approval(wid uuid, qid uuid, revid uuid, rid uuid, answer_method text, answer_note text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE found public.bt_flow_quote_approvals; q public.quotes;
BEGIN
 PERFORM bt_flow_live_private.authorize(wid);
 IF rid IS NULL OR answer_method NOT IN ('in_person','phone','written','other') OR
    answer_note IS NULL OR char_length(btrim(answer_note))>1000
 THEN RAISE EXCEPTION 'BT_FLOW_APPROVAL_INPUT' USING ERRCODE='22023'; END IF;
 PERFORM bt_flow_live_private.assert_revision(wid,qid,revid);
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=qid;
 SELECT * INTO found FROM public.bt_flow_quote_approvals
 WHERE workshop_id=wid AND request_id=rid;
 IF found.id IS NOT NULL THEN
  IF found.quote_id IS DISTINCT FROM qid OR found.revision_id IS DISTINCT FROM revid OR
     found.method IS DISTINCT FROM answer_method OR found.note IS DISTINCT FROM btrim(answer_note)
  THEN RAISE EXCEPTION 'BT_FLOW_REUSED_REQUEST' USING ERRCODE='22023'; END IF;
  RETURN to_jsonb(found);
 END IF;
 IF EXISTS(SELECT 1 FROM public.bt_flow_quote_approvals
   WHERE workshop_id=wid AND quote_id=qid AND revision_id=revid)
 THEN RAISE EXCEPTION 'BT_FLOW_APPROVAL_ALREADY_RECORDED' USING ERRCODE='23505'; END IF;
 INSERT INTO public.bt_flow_quote_approvals(
  workshop_id,request_id,order_id,quote_id,revision_id,method,note,recorded_by
 ) VALUES (wid,rid,q.order_id,qid,revid,answer_method,btrim(answer_note),auth.uid())
 RETURNING * INTO found;
 RETURN to_jsonb(found);
END $function$
;

CREATE OR REPLACE FUNCTION bt_flow_live_private.delivery(wid uuid, reportid uuid, rid uuid, checks jsonb, method text, note text, confirmed boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE report public.bt_flow_execution_reports; q public.quotes;
 order_row public.work_orders; found public.bt_flow_visit_deliveries;
BEGIN
 PERFORM bt_flow_live_private.authorize(wid);
 IF rid IS NULL OR confirmed IS DISTINCT FROM true OR
   jsonb_typeof(checks) IS DISTINCT FROM 'object' OR
   checks->'vehicleChecked' IS DISTINCT FROM 'true'::jsonb OR
   checks->'workChecked' IS DISTINCT FROM 'true'::jsonb OR
   checks->'documentsChecked' IS DISTINCT FROM 'true'::jsonb OR
   checks->'pendingExplained' IS DISTINCT FROM 'true'::jsonb OR
   method NOT IN ('in_person','authorized_pickup','other') OR
   note IS NULL OR char_length(btrim(note))>1000
 THEN RAISE EXCEPTION 'BT_FLOW_DELIVERY_INPUT' USING ERRCODE='22023'; END IF;
 SELECT * INTO report FROM public.bt_flow_execution_reports
 WHERE workshop_id=wid AND id=reportid;
 IF report.id IS NULL THEN RAISE EXCEPTION 'BT_FLOW_REPORT_REQUIRED' USING ERRCODE='55000'; END IF;
 PERFORM bt_flow_live_private.assert_revision(wid,report.quote_id,report.revision_id);
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=report.quote_id;
 SELECT * INTO order_row FROM public.work_orders
 WHERE workshop_id=wid AND id=report.order_id AND vehicle_id=report.vehicle_id FOR UPDATE;
 IF order_row.id IS NULL OR order_row.status<>'ready' OR
    q.order_id<>report.order_id OR q.vehicle_id<>report.vehicle_id
 THEN RAISE EXCEPTION 'BT_FLOW_ORDER_NOT_READY' USING ERRCODE='55000'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.bt_flow_quote_approvals
  WHERE workshop_id=wid AND id=report.approval_id AND quote_id=report.quote_id
  AND revision_id=report.revision_id)
 THEN RAISE EXCEPTION 'BT_FLOW_APPROVAL_REQUIRED' USING ERRCODE='55000'; END IF;
 SELECT * INTO found FROM public.bt_flow_visit_deliveries
 WHERE workshop_id=wid AND request_id=rid;
 IF found.id IS NOT NULL THEN
  IF found.report_id IS DISTINCT FROM reportid OR
     found.checklist IS DISTINCT FROM checks OR
     found.handover_method IS DISTINCT FROM method OR
     found.handover_note IS DISTINCT FROM btrim(note)
  THEN RAISE EXCEPTION 'BT_FLOW_REUSED_REQUEST' USING ERRCODE='22023'; END IF;
  RETURN to_jsonb(found);
 END IF;
 IF EXISTS(SELECT 1 FROM public.bt_flow_visit_deliveries
  WHERE workshop_id=wid AND order_id=report.order_id)
 THEN RAISE EXCEPTION 'BT_FLOW_DELIVERY_ALREADY_RECORDED' USING ERRCODE='23505'; END IF;
 INSERT INTO public.bt_flow_visit_deliveries(
  workshop_id,request_id,order_id,vehicle_id,report_id,quote_id,revision_id,
  checklist,handover_method,handover_note,recorded_by
 ) VALUES(wid,rid,report.order_id,report.vehicle_id,reportid,
  report.quote_id,report.revision_id,checks,method,btrim(note),auth.uid())
 RETURNING * INTO found;
 RETURN to_jsonb(found);
END $function$
;

CREATE OR REPLACE FUNCTION bt_flow_live_private.execution(wid uuid, qid uuid, revid uuid, rid uuid, marks jsonb, note text, reviewed boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE q public.quotes;r public.quote_revisions;a public.bt_flow_quote_approvals;
 found public.bt_flow_execution_reports;
 items jsonb;total_net bigint;total_tax bigint;total_gross bigint;
 executed_net bigint;executed_tax bigint;executed_gross bigint;lines_count integer;
BEGIN
 PERFORM bt_flow_live_private.authorize(wid);
 IF rid IS NULL OR reviewed IS DISTINCT FROM true OR
    jsonb_typeof(marks) IS DISTINCT FROM 'object' OR note IS NULL OR
    char_length(btrim(note))>2000 THEN
  RAISE EXCEPTION 'BT_FLOW_EXECUTION_INPUT' USING ERRCODE='22023';
 END IF;
 PERFORM bt_flow_live_private.assert_revision(wid,qid,revid);
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=qid;
 SELECT * INTO r FROM public.quote_revisions WHERE workshop_id=wid AND id=revid AND quote_id=qid;
 SELECT * INTO a FROM public.bt_flow_quote_approvals
  WHERE workshop_id=wid AND quote_id=qid AND revision_id=revid;
 IF a.id IS NULL THEN RAISE EXCEPTION 'BT_FLOW_APPROVAL_REQUIRED' USING ERRCODE='55000'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.work_orders WHERE workshop_id=wid AND id=q.order_id
 AND vehicle_id=q.vehicle_id AND status IN ('in_service','ready'))
 THEN RAISE EXCEPTION 'BT_FLOW_ORDER_NOT_READY' USING ERRCODE='55000'; END IF;
 SELECT * INTO found FROM public.bt_flow_execution_reports
 WHERE workshop_id=wid AND request_id=rid;
 IF found.id IS NOT NULL THEN
  IF found.quote_id IS DISTINCT FROM qid OR found.revision_id IS DISTINCT FROM revid OR
     found.decisions IS DISTINCT FROM marks OR found.pending_note IS DISTINCT FROM btrim(note)
  THEN RAISE EXCEPTION 'BT_FLOW_REUSED_REQUEST' USING ERRCODE='22023'; END IF;
  RETURN to_jsonb(found);
 END IF;
 items:=r.payload->'items';
 SELECT count(*),coalesce(sum((x->>'line_net')::bigint),0)
 INTO lines_count,total_net FROM jsonb_array_elements(items) s(x);
 IF lines_count NOT BETWEEN 1 AND 200 OR
    (SELECT count(DISTINCT x->>'id') FROM jsonb_array_elements(items) s(x))<>lines_count OR
    (SELECT count(*) FROM jsonb_each(marks))<>lines_count OR
    EXISTS (SELECT 1 FROM jsonb_array_elements(items) s(x)
     WHERE NOT marks ? (x->>'id') OR
       (marks->>(x->>'id')) NOT IN ('performed','not_performed') OR
       (x->>'workshop_id') IS DISTINCT FROM wid::text OR
       (x->>'quote_id') IS DISTINCT FROM qid::text OR
       (x->>'quantity100')::bigint*(x->>'unit_price')::bigint<0 OR
       (x->>'line_net')::bigint IS DISTINCT FROM
         ((x->>'quantity100')::bigint*(x->>'unit_price')::bigint+50)/100)
 THEN RAISE EXCEPTION 'BT_FLOW_ITEMS_INVALID' USING ERRCODE='22023'; END IF;
 IF EXISTS (SELECT 1 FROM jsonb_each(marks) m(k,v)
  WHERE jsonb_typeof(v)<>'string' OR v#>>'{}' NOT IN ('performed','not_performed') OR
  NOT EXISTS (SELECT 1 FROM jsonb_array_elements(items) s(x) WHERE x->>'id'=m.k))
 THEN RAISE EXCEPTION 'BT_FLOW_DECISIONS_INVALID' USING ERRCODE='22023'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_each_text(marks) m(k,v) WHERE v='not_performed')
    AND char_length(btrim(note))<1
 THEN RAISE EXCEPTION 'BT_FLOW_PENDING_EXPLANATION_REQUIRED' USING ERRCODE='22023'; END IF;
 total_tax:=(total_net*19+50)/100;
 total_gross:=total_net+total_tax;
 IF total_net IS DISTINCT FROM (r.payload->'totals'->>'subtotal')::bigint OR
    total_tax IS DISTINCT FROM (r.payload->'totals'->>'tax')::bigint OR
    total_gross IS DISTINCT FROM (r.payload->'totals'->>'total')::bigint
 THEN RAISE EXCEPTION 'BT_FLOW_TOTAL_MISMATCH' USING ERRCODE='22023'; END IF;
 SELECT coalesce(sum((x->>'line_net')::bigint),0) INTO executed_net
 FROM jsonb_array_elements(items) s(x) WHERE marks->>(x->>'id')='performed';
 executed_tax:=(executed_net*19+50)/100;executed_gross:=executed_net+executed_tax;
 IF EXISTS(SELECT 1 FROM public.bt_flow_execution_reports WHERE workshop_id=wid
   AND quote_id=qid AND revision_id=revid)
 THEN RAISE EXCEPTION 'BT_FLOW_EXECUTION_ALREADY_RECORDED' USING ERRCODE='23505'; END IF;
 INSERT INTO public.bt_flow_execution_reports(
  workshop_id,request_id,order_id,vehicle_id,quote_id,revision_id,approval_id,
  decisions,pending_note,quoted_net,quoted_tax,quoted_total,
  performed_net,performed_tax,performed_total,reviewed_by
 ) VALUES(
  wid,rid,q.order_id,q.vehicle_id,qid,revid,a.id,
  marks,btrim(note),total_net,total_tax,total_gross,
  executed_net,executed_tax,executed_gross,auth.uid()
 ) RETURNING * INTO found;
 RETURN to_jsonb(found);
END $function$
;

CREATE OR REPLACE FUNCTION bt_records_private.execute_record(wid uuid, resource text, rid uuid, action text, token text, request uuid, reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE preview jsonb; answer jsonb; old bt_records_private.events;
 input jsonb:=jsonb_build_object('resource',resource,'id',rid,'action',action,'token',token,'reason',reason);
BEGIN
 PERFORM bt_records_private.authorize(wid);
 IF request IS NULL OR token IS NULL OR reason IS NULL OR char_length(btrim(reason)) NOT BETWEEN 1 AND 500 THEN
 RAISE EXCEPTION 'RECORDS_INVALID' USING ERRCODE='22023'; END IF;
 -- Serializes retries, archive/restore and source creation in this workshop.
 PERFORM pg_advisory_xact_lock(hashtextextended(wid::text,704));
 SELECT * INTO old FROM bt_records_private.events WHERE workshop_id=wid AND request_id=request;
 IF FOUND THEN
  IF old.actor_id<>auth.uid() OR old.input IS DISTINCT FROM input THEN RAISE EXCEPTION 'RECORDS_REQUEST_REUSED' USING ERRCODE='22023'; END IF;
  RETURN old.result;
 END IF;
 preview:=bt_records_private.inspect_record(wid,resource,rid);
 IF preview->>'token' IS DISTINCT FROM token THEN RAISE EXCEPTION 'RECORDS_CONFLICT' USING ERRCODE='40001'; END IF;
 IF NOT (preview->'actions' ? action) THEN RAISE EXCEPTION 'RECORDS_DEPENDENCIES' USING ERRCODE='23503'; END IF;
 IF action='delete' THEN
  IF resource='quotes' THEN
   INSERT INTO bt_records_private.events(workshop_id,resource,resource_id,action,actor_id)
    SELECT wid,'work_orders',order_id,'activity',auth.uid() FROM public.quotes WHERE workshop_id=wid AND id=rid;
   DELETE FROM public.quote_items WHERE workshop_id=wid AND quote_id=rid;
  END IF;
  EXECUTE format('DELETE FROM public.%I WHERE workshop_id=$1 AND id=$2',resource) USING wid,rid;
 ELSIF action IN ('archive','restore') AND resource IN ('customers','vehicles') THEN
  EXECUTE format('UPDATE public.%I SET archived_at=$3 WHERE workshop_id=$1 AND id=$2',resource)
   USING wid,rid,CASE WHEN action='archive' THEN statement_timestamp() ELSE NULL::timestamptz END;
 ELSIF action='cancel' AND resource='work_orders' THEN
  UPDATE public.work_orders SET status='closed',cancelled_at=statement_timestamp(),cancel_reason=btrim(reason)
   WHERE workshop_id=wid AND id=rid;
 ELSIF action='void' AND resource='quotes' THEN
  PERFORM bt_cp05_private.void_quote(wid,rid,token::bigint,request,btrim(reason));
 ELSE RAISE EXCEPTION 'RECORDS_INVALID' USING ERRCODE='22023'; END IF;
 answer:=jsonb_build_object('id',rid,'resource',resource,'action',action,'request_id',request);
 INSERT INTO bt_records_private.events(workshop_id,resource,resource_id,action,actor_id,request_id,input,result)
 VALUES(wid,resource,rid,action,auth.uid(),request,input,answer);
 RETURN answer;
EXCEPTION WHEN OTHERS THEN
 RAISE EXCEPTION 'RECORDS_OPERATION_FAILED' USING ERRCODE=SQLSTATE;
END $function$
;
ALTER TABLE "public"."bt_agenda_receipts" DROP CONSTRAINT "bt_agenda_receipts_complaint_check";
ALTER TABLE "public"."bt_agenda_receipts" ADD CONSTRAINT "bt_agenda_receipts_complaint_check" CHECK (((char_length(btrim(complaint)) >= 1) AND (char_length(btrim(complaint)) <= 2000)));
ALTER TABLE "public"."bt_flow_quote_approvals" DROP CONSTRAINT "bt_flow_quote_approvals_note_check";
ALTER TABLE "public"."bt_flow_quote_approvals" ADD CONSTRAINT "bt_flow_quote_approvals_note_check" CHECK ((char_length(btrim(note)) <= 1000));
ALTER TABLE "public"."bt_flow_visit_deliveries" DROP CONSTRAINT "bt_flow_visit_deliveries_handover_note_check";
ALTER TABLE "public"."bt_flow_visit_deliveries" ADD CONSTRAINT "bt_flow_visit_deliveries_handover_note_check" CHECK ((char_length(btrim(handover_note)) <= 1000));
ALTER TABLE "public"."inspection_findings" DROP CONSTRAINT "cp04_finding_resolution";
ALTER TABLE "public"."inspection_findings" ADD CONSTRAINT "cp04_finding_resolution" CHECK ((((result = 'attention'::text) AND (resolution = ANY (ARRAY['pending'::text, 'resolved'::text])) AND (note IS NOT NULL) AND (char_length(btrim(note)) >= 1)) OR ((result = ANY (ARRAY['ok'::text, 'not_checked'::text])) AND (resolution = 'not_applicable'::text))));
ALTER TABLE "public"."quote_events" DROP CONSTRAINT "quote_events_reason_check";
ALTER TABLE "public"."quote_events" ADD CONSTRAINT "quote_events_reason_check" CHECK (((char_length(btrim(reason)) >= 1) AND (char_length(btrim(reason)) <= 1000)));
ALTER TABLE "public"."quotes" DROP CONSTRAINT "quotes_void_reason_check";
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_void_reason_check" CHECK (((void_reason IS NULL) OR ((char_length(btrim(void_reason)) >= 1) AND (char_length(btrim(void_reason)) <= 1000))));
ALTER TABLE "public"."work_orders" DROP CONSTRAINT "work_orders_cancel_reason_check";
ALTER TABLE "public"."work_orders" ADD CONSTRAINT "work_orders_cancel_reason_check" CHECK (((cancel_reason IS NULL) OR ((char_length(btrim(cancel_reason)) >= 1) AND (char_length(btrim(cancel_reason)) <= 500))));
ALTER TABLE "public"."work_orders" DROP CONSTRAINT "work_orders_complaint_check";
ALTER TABLE "public"."work_orders" ADD CONSTRAINT "work_orders_complaint_check" CHECK (((char_length(btrim(complaint)) >= 1) AND (char_length(btrim(complaint)) <= 2000)));
COMMIT;
