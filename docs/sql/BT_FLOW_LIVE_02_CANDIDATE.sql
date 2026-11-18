-- BT-FLOW-LIVE-02: CANDIDATE ONLY. NOT APPLIED TO HOSTED SUPABASE.
-- Run only in isolated PostgreSQL 17 lab after CP03/CP04/CP05 candidate SQL.
-- All three histories are operator attestations, NOT verified signatures,
-- acceptance via link, tax documents, payment or physical handover proof.
-- Separate request IDs and never accept a browser supplied actor or CLP total.
BEGIN;
CREATE SCHEMA bt_flow_live_private;
REVOKE ALL ON SCHEMA bt_flow_live_private FROM PUBLIC,anon,authenticated,service_role;
GRANT USAGE ON SCHEMA bt_flow_live_private TO authenticated;

CREATE TABLE public.bt_flow_quote_approvals (
 workshop_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(),
 request_id uuid NOT NULL, order_id uuid NOT NULL, quote_id uuid NOT NULL,
 revision_id uuid NOT NULL, method text NOT NULL
 CHECK(method IN ('in_person','phone','written','other')),
 note text NOT NULL CHECK(char_length(btrim(note)) BETWEEN 12 AND 1000),
 recorded_by uuid NOT NULL REFERENCES auth.users(id),
 recorded_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 evidence_status text NOT NULL DEFAULT 'operator_attested'
 CHECK(evidence_status='operator_attested'),
 PRIMARY KEY(workshop_id,id),
 UNIQUE(workshop_id,request_id),
 UNIQUE(workshop_id,quote_id,revision_id),
 FOREIGN KEY(workshop_id,order_id) REFERENCES public.work_orders(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,quote_id) REFERENCES public.quotes(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,revision_id) REFERENCES public.quote_revisions(workshop_id,id) ON DELETE RESTRICT
);
CREATE TABLE public.bt_flow_execution_reports (
 workshop_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(),
 request_id uuid NOT NULL, order_id uuid NOT NULL, vehicle_id uuid NOT NULL,
 quote_id uuid NOT NULL, revision_id uuid NOT NULL, approval_id uuid NOT NULL,
 decisions jsonb NOT NULL CHECK(jsonb_typeof(decisions)='object'),
 pending_note text NOT NULL CHECK(char_length(pending_note)<=2000),
 quoted_net bigint NOT NULL CHECK(quoted_net>=0),
 quoted_tax bigint NOT NULL CHECK(quoted_tax>=0),
 quoted_total bigint NOT NULL CHECK(quoted_total>=0),
 performed_net bigint NOT NULL CHECK(performed_net>=0),
 performed_tax bigint NOT NULL CHECK(performed_tax>=0),
 performed_total bigint NOT NULL CHECK(performed_total>=0),
 reviewed_by uuid NOT NULL REFERENCES auth.users(id),
 recorded_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 evidence_status text NOT NULL DEFAULT 'operator_attested'
 CHECK(evidence_status='operator_attested'),
 PRIMARY KEY(workshop_id,id),
 UNIQUE(workshop_id,request_id),
 UNIQUE(workshop_id,quote_id,revision_id),
 FOREIGN KEY(workshop_id,order_id,vehicle_id)
 REFERENCES public.work_orders(workshop_id,id,vehicle_id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,quote_id) REFERENCES public.quotes(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,revision_id) REFERENCES public.quote_revisions(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,approval_id)
 REFERENCES public.bt_flow_quote_approvals(workshop_id,id) ON DELETE RESTRICT,
 CHECK(quoted_total=quoted_net+quoted_tax),
 CHECK(performed_total=performed_net+performed_tax),
 CHECK(performed_total<=quoted_total)
);
CREATE TABLE public.bt_flow_visit_deliveries (
 workshop_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(),
 request_id uuid NOT NULL, order_id uuid NOT NULL, vehicle_id uuid NOT NULL,
 report_id uuid NOT NULL, quote_id uuid NOT NULL, revision_id uuid NOT NULL,
 checklist jsonb NOT NULL CHECK(jsonb_typeof(checklist)='object'),
 handover_method text NOT NULL CHECK(handover_method IN ('in_person','authorized_pickup','other')),
 handover_note text NOT NULL CHECK(char_length(btrim(handover_note)) BETWEEN 12 AND 1000),
 recorded_by uuid NOT NULL REFERENCES auth.users(id),
 recorded_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 evidence_status text NOT NULL DEFAULT 'operator_attested'
 CHECK(evidence_status='operator_attested'),
 PRIMARY KEY(workshop_id,id),
 UNIQUE(workshop_id,request_id),
 UNIQUE(workshop_id,order_id),
 FOREIGN KEY(workshop_id,order_id,vehicle_id)
 REFERENCES public.work_orders(workshop_id,id,vehicle_id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,report_id)
 REFERENCES public.bt_flow_execution_reports(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,quote_id) REFERENCES public.quotes(workshop_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(workshop_id,revision_id)
 REFERENCES public.quote_revisions(workshop_id,id) ON DELETE RESTRICT
);
CREATE INDEX bt_flow_reports_vehicle ON public.bt_flow_execution_reports(workshop_id,vehicle_id,recorded_at DESC);
CREATE INDEX bt_flow_deliveries_vehicle ON public.bt_flow_visit_deliveries(workshop_id,vehicle_id,recorded_at DESC);

CREATE FUNCTION bt_flow_live_private.authorize(wid uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF wid IS NULL OR auth.uid() IS NULL OR NOT EXISTS (
  SELECT 1 FROM public.workshop_memberships m
  JOIN public.workshops w ON w.id=m.workshop_id
  JOIN auth.users u ON u.id=m.user_id
  WHERE m.workshop_id=wid AND m.user_id=auth.uid() AND m.status='active'
    AND m.role IN ('owner','admin','reception')
    AND w.status='active' AND u.email_confirmed_at IS NOT NULL
 ) THEN RAISE EXCEPTION 'BT_FLOW_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
END $$;
CREATE FUNCTION bt_flow_live_private.assert_revision(wid uuid,qid uuid,revid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE q public.quotes; r public.quote_revisions;
BEGIN
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=qid FOR UPDATE;
 SELECT * INTO r FROM public.quote_revisions WHERE workshop_id=wid AND id=revid AND quote_id=qid;
 IF q.id IS NULL OR r.id IS NULL OR q.status<>'issued' OR q.issue_pending OR
    q.issued_revision IS DISTINCT FROM r.revision OR
    (r.payload->'quote'->>'id') IS DISTINCT FROM q.id::text OR
    (r.payload->'quote'->>'workshop_id') IS DISTINCT FROM wid::text OR
    (r.payload->'quote'->>'revision')::integer IS DISTINCT FROM r.revision OR
    (r.payload->'quote'->>'status') IS DISTINCT FROM 'issued' OR
    (r.payload->'workshop'->>'id') IS DISTINCT FROM wid::text OR
    (r.payload->'order'->>'id') IS DISTINCT FROM q.order_id::text OR
    (r.payload->'vehicle'->>'id') IS DISTINCT FROM q.vehicle_id::text OR
    (r.payload->'customer'->>'id') IS DISTINCT FROM q.customer_id::text OR
    jsonb_typeof(r.payload->'items') IS DISTINCT FROM 'array'
 THEN RAISE EXCEPTION 'BT_FLOW_REVISION_NOT_CURRENT' USING ERRCODE='55000'; END IF;
END $$;

CREATE FUNCTION bt_flow_live_private.approval(
 wid uuid,qid uuid,revid uuid,rid uuid,answer_method text,answer_note text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE found public.bt_flow_quote_approvals; q public.quotes;
BEGIN
 PERFORM bt_flow_live_private.authorize(wid);
 IF rid IS NULL OR answer_method NOT IN ('in_person','phone','written','other') OR
    answer_note IS NULL OR char_length(btrim(answer_note)) NOT BETWEEN 12 AND 1000
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
END $$;

CREATE FUNCTION bt_flow_live_private.execution(
 wid uuid,qid uuid,revid uuid,rid uuid,marks jsonb,note text,reviewed boolean
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
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
    AND char_length(btrim(note))<8
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
END $$;

CREATE FUNCTION bt_flow_live_private.delivery(
 wid uuid,reportid uuid,rid uuid,checks jsonb,method text,note text,confirmed boolean
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
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
   note IS NULL OR char_length(btrim(note)) NOT BETWEEN 12 AND 1000
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
END $$;

-- Exposed API contains only thin invoker wrappers; privileged functions stay
-- in an unexposed private schema and always derive auth.uid() server side.
CREATE FUNCTION public.bt_flow_record_quote_approval(
 p_workshop_id uuid,p_quote_id uuid,p_revision_id uuid,p_request_id uuid,p_method text,p_note text
) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$
 SELECT bt_flow_live_private.approval(p_workshop_id,p_quote_id,p_revision_id,p_request_id,p_method,p_note) $$;
CREATE FUNCTION public.bt_flow_record_execution(
 p_workshop_id uuid,p_quote_id uuid,p_revision_id uuid,p_request_id uuid,
 p_decisions jsonb,p_pending_note text,p_operator_reviewed boolean
) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$
 SELECT bt_flow_live_private.execution(p_workshop_id,p_quote_id,p_revision_id,
 p_request_id,p_decisions,p_pending_note,p_operator_reviewed) $$;
CREATE FUNCTION public.bt_flow_record_handover(
 p_workshop_id uuid,p_report_id uuid,p_request_id uuid,p_checklist jsonb,
 p_handover_method text,p_handover_note text,p_operator_confirmed boolean
) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$
 SELECT bt_flow_live_private.delivery(p_workshop_id,p_report_id,p_request_id,
 p_checklist,p_handover_method,p_handover_note,p_operator_confirmed) $$;

CREATE FUNCTION bt_flow_live_private.immutable() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
BEGIN RAISE EXCEPTION 'BT_FLOW_IMMUTABLE_HISTORY' USING ERRCODE='42501'; END $$;
CREATE TRIGGER bt_flow_approval_immutable BEFORE UPDATE OR DELETE
 ON public.bt_flow_quote_approvals FOR EACH ROW
 EXECUTE FUNCTION bt_flow_live_private.immutable();
CREATE TRIGGER bt_flow_execution_immutable BEFORE UPDATE OR DELETE
 ON public.bt_flow_execution_reports FOR EACH ROW
 EXECUTE FUNCTION bt_flow_live_private.immutable();
CREATE TRIGGER bt_flow_handover_immutable BEFORE UPDATE OR DELETE
 ON public.bt_flow_visit_deliveries FOR EACH ROW
 EXECUTE FUNCTION bt_flow_live_private.immutable();

-- Default-deny public writes, RLS FORCE for every exposed row. CP05's existing
-- reader policy revalidates JWT actor, active membership and workshop status.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY[
  'bt_flow_quote_approvals','bt_flow_execution_reports','bt_flow_visit_deliveries'
 ] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated,service_role',t);
  EXECUTE format('GRANT SELECT ON public.%I TO authenticated,service_role',t);
  EXECUTE format(
   'CREATE POLICY bt_flow_read ON public.%I FOR SELECT TO authenticated USING(public.bt_cp05_can_read(workshop_id))',t
  );
 END LOOP;
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA bt_flow_live_private
 FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION
 bt_flow_live_private.approval(uuid,uuid,uuid,uuid,text,text),
 bt_flow_live_private.execution(uuid,uuid,uuid,uuid,jsonb,text,boolean),
 bt_flow_live_private.delivery(uuid,uuid,uuid,jsonb,text,text,boolean)
 TO authenticated;
REVOKE ALL ON FUNCTION
 public.bt_flow_record_quote_approval(uuid,uuid,uuid,uuid,text,text),
 public.bt_flow_record_execution(uuid,uuid,uuid,uuid,jsonb,text,boolean),
 public.bt_flow_record_handover(uuid,uuid,uuid,jsonb,text,text,boolean)
 FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION
 public.bt_flow_record_quote_approval(uuid,uuid,uuid,uuid,text,text),
 public.bt_flow_record_execution(uuid,uuid,uuid,uuid,jsonb,text,boolean),
 public.bt_flow_record_handover(uuid,uuid,uuid,jsonb,text,text,boolean)
 TO authenticated;
COMMIT;
