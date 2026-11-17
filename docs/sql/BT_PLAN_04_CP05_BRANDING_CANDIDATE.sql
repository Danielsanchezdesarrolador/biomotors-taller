-- CANDIDATE after PLAN04B + CP05 installed. Preserves existing archived revisions.
BEGIN;
CREATE OR REPLACE FUNCTION bt_cp05_private.prepare_issue(wid uuid,qid uuid,expected bigint,rid uuid,actor uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
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
 IF q.status<>'draft' OR q.issue_pending OR char_length(btrim(q.terms))<3 THEN RAISE EXCEPTION 'CP05_NOT_READY' USING ERRCODE='55000'; END IF;
 SELECT jsonb_agg(to_jsonb(i) ORDER BY i.position),sum(i.line_net) INTO lines,net FROM public.quote_items i WHERE workshop_id=wid AND quote_id=qid;
 IF lines IS NULL THEN RAISE EXCEPTION 'CP05_ITEMS_REQUIRED' USING ERRCODE='22023'; END IF;
 rev:=q.issued_revision+1;
 SELECT jsonb_build_object('quote',to_jsonb(q)||jsonb_build_object('status','issued','revision',rev),'workshop',jsonb_build_object('id',w.id,'name',w.name,'logoPath',p.logo_path,'contactEmail',p.contact_email,'phone',p.phone,'address',p.address),
 'customer',jsonb_build_object('id',c.id,'full_name',c.full_name,'email',c.email,'mobile_e164',c.mobile_e164),
 'vehicle',jsonb_build_object('id',v.id,'plate',v.plate,'make',v.make,'model',v.model,'model_year',v.model_year),
 'order',jsonb_build_object('id',o.id,'complaint',o.complaint,'opened_at',o.opened_at,'intake_odometer',o.intake_odometer),
 'items',lines,'totals',jsonb_build_object('subtotal',net,'tax',(net*19+50)/100,'total',net+(net*19+50)/100),
 'document_date',statement_timestamp(),'notice','Cotización no tributaria. No acredita ejecución ni aceptación del cliente.') INTO snapshot
 FROM public.workshops w LEFT JOIN bt_platform_private.workshop_profiles p ON p.workshop_id=w.id JOIN public.work_orders o ON o.workshop_id=w.id AND o.id=q.order_id
 JOIN public.vehicles v ON v.workshop_id=w.id AND v.id=q.vehicle_id
 JOIN public.customers c ON c.workshop_id=w.id AND c.id=q.customer_id
 WHERE w.id=wid AND v.customer_id=c.id;
 IF snapshot IS NULL THEN RAISE EXCEPTION 'CP05_SOURCE_INVALID' USING ERRCODE='22023'; END IF;
 INSERT INTO bt_cp05_private.issue_requests(workshop_id,request_id,quote_id,expected_version,revision,actor_id,payload,payload_sha256) VALUES(wid,rid,qid,expected,rev,actor,snapshot,bt_cp05_private.hash(snapshot));
 UPDATE public.quotes SET issue_pending=true WHERE workshop_id=wid AND id=qid;
 RETURN jsonb_build_object('request_id',rid,'revision',rev,'payload',snapshot,'payload_sha256',bt_cp05_private.hash(snapshot));
END $$;

COMMIT;
