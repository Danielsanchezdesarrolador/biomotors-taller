-- CANDIDATE ONLY. PostgreSQL 17 local lab. Requires CP03/04/05, LIVE-02, REG-01, EXP-01.
-- No hosted application, rollout activation, destructive data changes or email.
BEGIN;
CREATE SCHEMA bt_agenda_private;
REVOKE ALL ON SCHEMA bt_agenda_private FROM PUBLIC,anon;
GRANT USAGE ON SCHEMA bt_agenda_private TO authenticated,service_role;
CREATE TABLE bt_agenda_private.rollout(workshop_id uuid PRIMARY KEY REFERENCES public.workshops(id),enabled boolean NOT NULL DEFAULT false,timezone text NOT NULL DEFAULT 'America/Santiago');
ALTER TABLE public.work_orders ADD COLUMN intake_phase text NOT NULL DEFAULT 'received' CHECK(intake_phase IN ('planned','received'));
ALTER TABLE public.work_orders ADD COLUMN intake_received_at timestamptz;
CREATE TABLE bt_agenda_private.appointments(
 workshop_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),order_id uuid NOT NULL,vehicle_id uuid NOT NULL,customer_id uuid NOT NULL,quote_id uuid NOT NULL,revision_id uuid NOT NULL,
 starts_at timestamptz NOT NULL,duration_minutes integer NOT NULL CHECK(duration_minutes BETWEEN 15 AND 480),timezone text NOT NULL,
 status text NOT NULL CHECK(status IN ('pending','scheduled','received','cancelled')),notes text NOT NULL DEFAULT '' CHECK(char_length(notes)<=2000),version bigint NOT NULL DEFAULT 1,
 created_by uuid NOT NULL REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT statement_timestamp(),updated_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 PRIMARY KEY(workshop_id,id),FOREIGN KEY(workshop_id,order_id,vehicle_id) REFERENCES public.work_orders(workshop_id,id,vehicle_id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,customer_id) REFERENCES public.customers(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,quote_id) REFERENCES public.quotes(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,revision_id) REFERENCES public.quote_revisions(workshop_id,id) ON DELETE RESTRICT
);
CREATE UNIQUE INDEX bt_agenda_one_visit ON bt_agenda_private.appointments(workshop_id,order_id) WHERE status<>'cancelled';
CREATE INDEX bt_agenda_by_date ON bt_agenda_private.appointments(workshop_id,starts_at,id);
CREATE INDEX bt_agenda_order_fk ON bt_agenda_private.appointments(workshop_id,order_id,vehicle_id);
CREATE INDEX bt_agenda_customer_fk ON bt_agenda_private.appointments(workshop_id,customer_id);
CREATE INDEX bt_agenda_quote_fk ON bt_agenda_private.appointments(workshop_id,quote_id);
CREATE INDEX bt_agenda_revision_fk ON bt_agenda_private.appointments(workshop_id,revision_id);
CREATE TABLE bt_agenda_private.commands(workshop_id uuid NOT NULL,request_id uuid NOT NULL,actor_id uuid NOT NULL,kind text NOT NULL,input jsonb NOT NULL,response jsonb NOT NULL,PRIMARY KEY(workshop_id,request_id));
CREATE TABLE bt_agenda_private.events(workshop_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),request_id uuid NOT NULL,actor_id uuid NOT NULL,kind text NOT NULL,entity_id uuid NOT NULL,before_data jsonb,after_data jsonb,created_at timestamptz NOT NULL DEFAULT statement_timestamp(),PRIMARY KEY(workshop_id,id),UNIQUE(workshop_id,request_id));
CREATE TABLE public.bt_agenda_receipts(
 workshop_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),order_id uuid NOT NULL,vehicle_id uuid NOT NULL,customer_id uuid NOT NULL,quote_id uuid NOT NULL,revision_id uuid NOT NULL,request_id uuid NOT NULL,
 received_at timestamptz NOT NULL DEFAULT statement_timestamp(),odometer integer NOT NULL CHECK(odometer BETWEEN 0 AND 3000000),complaint text NOT NULL CHECK(char_length(btrim(complaint)) BETWEEN 3 AND 2000),recorded_by uuid NOT NULL REFERENCES auth.users(id),
 PRIMARY KEY(workshop_id,id),UNIQUE(workshop_id,order_id),UNIQUE(workshop_id,request_id),
 FOREIGN KEY(workshop_id,order_id,vehicle_id) REFERENCES public.work_orders(workshop_id,id,vehicle_id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,quote_id) REFERENCES public.quotes(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,revision_id) REFERENCES public.quote_revisions(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,customer_id) REFERENCES public.customers(workshop_id,id) ON DELETE RESTRICT
);
CREATE INDEX bt_agenda_receipt_customer_fk ON public.bt_agenda_receipts(workshop_id,customer_id);
CREATE INDEX bt_agenda_receipt_quote_fk ON public.bt_agenda_receipts(workshop_id,quote_id);
CREATE INDEX bt_agenda_receipt_revision_fk ON public.bt_agenda_receipts(workshop_id,revision_id);
ALTER TABLE bt_agenda_private.rollout ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_agenda_private.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_agenda_private.commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_agenda_private.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bt_agenda_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bt_agenda_receipts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.bt_agenda_receipts FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.bt_agenda_receipts TO authenticated,service_role;
CREATE POLICY bt_agenda_receipts_read ON public.bt_agenda_receipts FOR SELECT TO authenticated USING(public.bt_cp05_can_read(workshop_id));
CREATE TRIGGER bt_agenda_receipts_immutable BEFORE UPDATE OR DELETE ON public.bt_agenda_receipts FOR EACH ROW EXECUTE FUNCTION bt_cp05_private.immutable();
CREATE TRIGGER bt_agenda_events_immutable BEFORE UPDATE OR DELETE ON bt_agenda_private.events FOR EACH ROW EXECUTE FUNCTION bt_cp05_private.immutable();
CREATE TRIGGER bt_agenda_commands_immutable BEFORE UPDATE OR DELETE ON bt_agenda_private.commands FOR EACH ROW EXECUTE FUNCTION bt_cp05_private.immutable();
CREATE FUNCTION bt_agenda_private.authorize(wid uuid) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE zone text;
BEGIN
 PERFORM bt_cp05_private.authorize(wid,auth.uid(),true);
 SELECT timezone INTO zone FROM bt_agenda_private.rollout WHERE workshop_id=wid AND enabled;
 IF zone IS NULL THEN RAISE EXCEPTION 'AGENDA_DISABLED' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_timezone_names WHERE name=zone) THEN RAISE EXCEPTION 'AGENDA_TIMEZONE_INVALID' USING ERRCODE='22023'; END IF;
 RETURN zone;
END $$;
CREATE FUNCTION bt_agenda_private.guard_order() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF OLD.intake_phase='received' AND (NEW.intake_phase<>OLD.intake_phase OR NEW.intake_received_at IS DISTINCT FROM OLD.intake_received_at) THEN RAISE EXCEPTION 'AGENDA_RECEIPT_IMMUTABLE' USING ERRCODE='42501'; END IF;
  IF OLD.intake_phase='planned' THEN
   IF NEW.cancelled_at IS NOT NULL AND NEW.status='closed' AND NEW.intake_phase=OLD.intake_phase AND NEW.intake_received_at IS NOT DISTINCT FROM OLD.intake_received_at AND NEW.complaint=OLD.complaint AND NEW.intake_odometer IS NOT DISTINCT FROM OLD.intake_odometer THEN RETURN NEW; END IF;
   IF NEW.intake_phase='received' THEN
    IF NOT EXISTS(SELECT 1 FROM public.bt_agenda_receipts r WHERE r.workshop_id=NEW.workshop_id AND r.order_id=NEW.id AND r.received_at=NEW.intake_received_at AND r.odometer=NEW.intake_odometer AND r.complaint=NEW.complaint) THEN RAISE EXCEPTION 'AGENDA_RECEIPT_REQUIRED' USING ERRCODE='42501'; END IF;
   ELSIF NEW.status<>OLD.status OR NEW.complaint<>OLD.complaint OR NEW.intake_odometer IS DISTINCT FROM OLD.intake_odometer OR NEW.intake_received_at IS DISTINCT FROM OLD.intake_received_at THEN RAISE EXCEPTION 'AGENDA_NOT_RECEIVED' USING ERRCODE='55000'; END IF;
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER bt_agenda_order_guard BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION bt_agenda_private.guard_order();
CREATE FUNCTION bt_agenda_private.guard_physical() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM public.work_orders WHERE workshop_id=NEW.workshop_id AND id=NEW.order_id AND intake_phase='planned') THEN RAISE EXCEPTION 'AGENDA_NOT_RECEIVED' USING ERRCODE='55000'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER bt_agenda_findings_guard BEFORE INSERT OR UPDATE ON public.inspection_findings FOR EACH ROW EXECUTE FUNCTION bt_agenda_private.guard_physical();
CREATE TRIGGER bt_agenda_execution_guard BEFORE INSERT ON public.bt_flow_execution_reports FOR EACH ROW EXECUTE FUNCTION bt_agenda_private.guard_physical();
CREATE TRIGGER bt_agenda_delivery_guard BEFORE INSERT ON public.bt_flow_visit_deliveries FOR EACH ROW EXECUTE FUNCTION bt_agenda_private.guard_physical();
CREATE FUNCTION bt_agenda_private.command(wid uuid,request uuid,kind text,data jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
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
  IF char_length(btrim(coalesce(data->>'service',''))) NOT BETWEEN 3 AND 2000 THEN RAISE EXCEPTION 'AGENDA_SERVICE_REQUIRED' USING ERRCODE='22023'; END IF;
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
    IF char_length(btrim(coalesce(data->>'reason',''))) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'AGENDA_REASON_REQUIRED' USING ERRCODE='22023'; END IF;
    UPDATE bt_agenda_private.appointments SET status='cancelled',version=version+1,updated_at=statement_timestamp() WHERE workshop_id=wid AND id=a.id RETURNING * INTO a;
   ELSIF kind='receive' THEN
    IF a.status<>'scheduled' OR o.intake_phase<>'planned' OR data->'confirmed' IS DISTINCT FROM 'true'::jsonb OR (data->>'odometer')::integer NOT BETWEEN 0 AND 3000000 OR data->>'odometer' IS NULL OR char_length(btrim(coalesce(data->>'complaint',''))) NOT BETWEEN 3 AND 2000 THEN RAISE EXCEPTION 'AGENDA_RECEIPT_INVALID' USING ERRCODE='22023'; END IF;
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
END $$;
CREATE FUNCTION bt_agenda_private.catalog(wid uuid,first_day date,last_day date) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE zone text;result jsonb;today date;
BEGIN
 zone:=bt_agenda_private.authorize(wid);today:=(statement_timestamp() AT TIME ZONE zone)::date;
 IF first_day IS NULL OR last_day IS NULL OR last_day<first_day OR last_day-first_day>42 THEN RAISE EXCEPTION 'AGENDA_RANGE_INVALID' USING ERRCODE='22023'; END IF;
 WITH entries AS(SELECT a.*,c.full_name AS customer_name,c.email,c.mobile_e164,v.plate,v.make,v.model,v.model_year,q.number AS quote_number,q.status AS quote_status,q.issued_revision,r.revision AS revision_number,r.payload->'order'->>'complaint' AS service,r.payload->'totals'->>'total' AS quote_total,
 EXISTS(SELECT 1 FROM public.bt_flow_quote_approvals ap WHERE ap.workshop_id=wid AND ap.revision_id=a.revision_id) AS approved,
 (a.revision_id IS DISTINCT FROM current_r.id OR q.status<>'issued' OR q.issue_pending) AS revision_changed
 FROM bt_agenda_private.appointments a JOIN public.customers c ON c.workshop_id=wid AND c.id=a.customer_id JOIN public.vehicles v ON v.workshop_id=wid AND v.id=a.vehicle_id JOIN public.quotes q ON q.workshop_id=wid AND q.id=a.quote_id JOIN public.quote_revisions r ON r.workshop_id=wid AND r.id=a.revision_id LEFT JOIN public.quote_revisions current_r ON current_r.workshop_id=wid AND current_r.quote_id=q.id AND current_r.revision=q.issued_revision WHERE a.workshop_id=wid)
 SELECT jsonb_build_object('timezone',zone,'today',today,'entries',coalesce((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.starts_at,e.id) FROM entries e WHERE e.starts_at>=first_day::timestamp AT TIME ZONE zone AND e.starts_at<(last_day+1)::timestamp AT TIME ZONE zone),'[]'::jsonb),
 'stats',jsonb_build_object('today',(SELECT count(*) FROM entries WHERE (starts_at AT TIME ZONE zone)::date=today AND status<>'cancelled'),'pending',(SELECT count(*) FROM entries WHERE status='pending' AND starts_at>=today::timestamp AT TIME ZONE zone AND starts_at<(today+30)::timestamp AT TIME ZONE zone),'received',(SELECT count(*) FROM public.bt_agenda_receipts WHERE workshop_id=wid AND (received_at AT TIME ZONE zone)::date=today),'upcoming',(SELECT count(*) FROM entries WHERE status IN ('pending','scheduled') AND starts_at>=statement_timestamp() AND starts_at<statement_timestamp()+interval '30 days')),
 'upcoming',coalesce((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.starts_at,e.id) FROM (SELECT * FROM entries WHERE status IN ('pending','scheduled') AND starts_at>=statement_timestamp() ORDER BY starts_at,id LIMIT 10)e),'[]'::jsonb),
 'requests',coalesce((SELECT jsonb_agg(jsonb_build_object('order_id',o.id,'vehicle_id',v.id,'customer_id',c.id,'customer_name',c.full_name,'plate',v.plate,'make',v.make,'model',v.model,'service',o.complaint,'quote_id',q.id,'quote_number',q.number,'quote_status',q.status,'revision_id',r.id,'revision_number',r.revision,'quote_total',r.payload->'totals'->>'total','approved',EXISTS(SELECT 1 FROM public.bt_flow_quote_approvals WHERE workshop_id=wid AND revision_id=r.id),'scheduled',EXISTS(SELECT 1 FROM bt_agenda_private.appointments ap WHERE ap.workshop_id=wid AND ap.order_id=o.id AND ap.status<>'cancelled')) ORDER BY o.opened_at DESC) FROM public.work_orders o JOIN public.vehicles v ON v.workshop_id=wid AND v.id=o.vehicle_id JOIN public.customers c ON c.workshop_id=wid AND c.id=v.customer_id JOIN public.quotes q ON q.workshop_id=wid AND q.order_id=o.id LEFT JOIN public.quote_revisions r ON r.workshop_id=wid AND r.quote_id=q.id AND r.revision=q.issued_revision WHERE o.workshop_id=wid AND o.intake_phase='planned' AND o.cancelled_at IS NULL AND o.status<>'closed' AND c.archived_at IS NULL AND v.archived_at IS NULL),'[]'::jsonb)) INTO result;
 RETURN result;
END $$;
CREATE FUNCTION public.bt_agenda_command(p_workshop_id uuid,p_request_id uuid,p_kind text,p_input jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_agenda_private.command(p_workshop_id,p_request_id,p_kind,p_input) $$;
CREATE FUNCTION public.bt_agenda_catalog(p_workshop_id uuid,p_first_day date,p_last_day date) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_agenda_private.catalog(p_workshop_id,p_first_day,p_last_day) $$;
REVOKE ALL ON ALL TABLES IN SCHEMA bt_agenda_private FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA bt_agenda_private FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION bt_agenda_private.command(uuid,uuid,text,jsonb),bt_agenda_private.catalog(uuid,date,date) TO authenticated;
REVOKE ALL ON FUNCTION public.bt_agenda_command(uuid,uuid,text,jsonb),public.bt_agenda_catalog(uuid,date,date) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.bt_agenda_command(uuid,uuid,text,jsonb),public.bt_agenda_catalog(uuid,date,date) TO authenticated;

-- Future issue snapshots distinguish request time from physical intake. Existing payloads remain immutable.
ALTER FUNCTION bt_cp05_private.prepare_issue(uuid,uuid,bigint,uuid,uuid) RENAME TO prepare_issue_before_agenda;
REVOKE ALL ON FUNCTION bt_cp05_private.prepare_issue_before_agenda(uuid,uuid,bigint,uuid,uuid) FROM PUBLIC,anon,authenticated,service_role;
CREATE FUNCTION bt_cp05_private.prepare_issue(wid uuid,qid uuid,expected bigint,rid uuid,actor uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE answer jsonb;snap jsonb;phase text;received public.bt_agenda_receipts;
BEGIN
 answer:=bt_cp05_private.prepare_issue_before_agenda(wid,qid,expected,rid,actor);
 SELECT o.intake_phase INTO phase FROM public.work_orders o JOIN public.quotes q ON q.workshop_id=o.workshop_id AND q.order_id=o.id WHERE q.workshop_id=wid AND q.id=qid;
 SELECT r.* INTO received FROM public.bt_agenda_receipts r JOIN public.quotes q ON q.workshop_id=r.workshop_id AND q.order_id=r.order_id WHERE q.workshop_id=wid AND q.id=qid;
 IF phase='planned' OR received.id IS NOT NULL THEN
  snap:=answer->'payload';
  -- A retry retains the already reserved snapshot, even if physical reception occurred meanwhile.
  IF NOT(snap->'order' ? 'intake_phase') THEN
   snap:=jsonb_set(snap,'{order,intake_phase}',to_jsonb(phase));
   IF received.id IS NOT NULL THEN snap:=jsonb_set(snap,'{order,opened_at}',to_jsonb(received.received_at)); END IF;
   UPDATE bt_cp05_private.issue_requests SET payload=snap,payload_sha256=bt_cp05_private.hash(snap) WHERE workshop_id=wid AND request_id=rid;
   answer:=answer||jsonb_build_object('payload',snap,'payload_sha256',bt_cp05_private.hash(snap));
  END IF;
 END IF;
 RETURN answer;
END $$;
REVOKE ALL ON FUNCTION bt_cp05_private.prepare_issue(uuid,uuid,bigint,uuid,uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION bt_cp05_private.prepare_issue(uuid,uuid,bigint,uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.bt_cp05_prepare_issue(p_workshop_id uuid,p_quote_id uuid,p_expected_version bigint,p_request_id uuid,p_actor_id uuid) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_cp05_private.prepare_issue(p_workshop_id,p_quote_id,p_expected_version,p_request_id,p_actor_id) $$;

-- Completed originals still short-circuit to their existing immutable manifest.
ALTER FUNCTION bt_com_private.archive_source(uuid,uuid,uuid,uuid,uuid) RENAME TO archive_source_before_agenda;
REVOKE ALL ON FUNCTION bt_com_private.archive_source_before_agenda(uuid,uuid,uuid,uuid,uuid) FROM PUBLIC,anon,authenticated,service_role;
CREATE FUNCTION bt_com_private.archive_source(wid uuid,oid uuid,rid uuid,did uuid,actor uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE answer jsonb;receipt public.bt_agenda_receipts;
BEGIN
 answer:=bt_com_private.archive_source_before_agenda(wid,oid,rid,did,actor);
 IF answer ? 'completed' THEN RETURN answer; END IF;
 IF answer->'revision'->'payload'->'order'->>'intake_phase'='planned' THEN
  SELECT * INTO receipt FROM public.bt_agenda_receipts WHERE workshop_id=wid AND order_id=oid AND revision_id=rid;
  IF receipt.id IS NULL THEN RAISE EXCEPTION 'AGENDA_RECEIPT_REQUIRED' USING ERRCODE='55000'; END IF;
  answer:=jsonb_set(answer,'{evidence,receipts}',jsonb_build_array(to_jsonb(receipt)));
 END IF;
 RETURN answer;
END $$;
REVOKE ALL ON FUNCTION bt_com_private.archive_source(uuid,uuid,uuid,uuid,uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION bt_com_private.archive_source(uuid,uuid,uuid,uuid,uuid) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.bt_final_archive_source(p_workshop_id uuid,p_order_id uuid,p_revision_id uuid,p_delivery_id uuid) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_com_private.archive_source(p_workshop_id,p_order_id,p_revision_id,p_delivery_id,auth.uid()) $$;
COMMIT;
