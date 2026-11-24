-- BT-EXP-01 CANDIDATE ONLY. Local synthetic validation, never hosted execution.
-- Prerequisites: CP03/04/05, FLOW-LIVE-02 and COM-01C candidate schemas.
BEGIN;
ALTER TABLE bt_com_private.rollout ADD COLUMN archive_enabled boolean NOT NULL DEFAULT false,
 ADD COLUMN archive_read_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE bt_com_private.closing_manifests ADD COLUMN archive_manifest jsonb;
-- No backfill: an old manifest without verified bytes is not silently promoted.
CREATE FUNCTION bt_com_private.archive_authorize(wid uuid,actor uuid,writing boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF current_setting('role',true)<>'service_role' AND actor IS DISTINCT FROM auth.uid() THEN
 RAISE EXCEPTION 'ARCHIVE_ACTOR_INVALID' USING ERRCODE='42501'; END IF;
 IF actor IS NULL OR NOT EXISTS(SELECT 1 FROM auth.users u
 JOIN public.workshop_memberships m ON m.user_id=u.id JOIN public.workshops w ON w.id=m.workshop_id
 WHERE u.id=actor AND u.email_confirmed_at IS NOT NULL AND m.workshop_id=wid
 AND m.status='active' AND m.role IN ('owner','admin') AND w.status='active') THEN
 RAISE EXCEPTION 'ARCHIVE_DENIED' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM bt_com_private.rollout WHERE workshop_id=wid AND archive_read_enabled
 AND (NOT writing OR archive_enabled)) THEN RAISE EXCEPTION 'ARCHIVE_DISABLED' USING ERRCODE='55000'; END IF;
END $$;

CREATE FUNCTION bt_com_private.archive_document(wid uuid,rid uuid,actor uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE q public.quotes; r public.quote_revisions; m bt_com_private.closing_manifests;
BEGIN
 PERFORM bt_com_private.archive_authorize(wid,actor,false);
 SELECT * INTO r FROM public.quote_revisions WHERE workshop_id=wid AND id=rid;
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=r.quote_id;
 IF r.id IS NULL OR q.id IS NULL OR r.payload->'quote'->>'id' IS DISTINCT FROM q.id::text OR
 r.payload->'quote'->>'workshop_id' IS DISTINCT FROM wid::text OR
 r.payload->'vehicle'->>'id' IS DISTINCT FROM q.vehicle_id::text OR
 r.payload->'customer'->>'id' IS DISTINCT FROM q.customer_id::text OR
 r.payload->'order'->>'id' IS DISTINCT FROM q.order_id::text THEN
 RAISE EXCEPTION 'ARCHIVE_SOURCE_INVALID' USING ERRCODE='42501'; END IF;
 SELECT * INTO m FROM bt_com_private.closing_manifests WHERE workshop_id=wid AND revision_id=rid;
 RETURN jsonb_build_object('workshopId',wid,'revisionId',rid,'quoteId',q.id,'orderId',q.order_id,
 'vehicleId',q.vehicle_id,'customerId',q.customer_id,'revision',r.revision,'issuedAt',r.issued_at,
 'customerName',r.payload->'customer'->>'full_name','plate',r.payload->'vehicle'->>'plate',
 'total',r.payload->'totals'->'total','complete',m.archive_manifest IS NOT NULL,
 'manifest',m.archive_manifest,
 'documents',coalesce(m.archive_manifest->'documents',jsonb_build_array(jsonb_build_object(
 'kind','quote','fileName','cotizacion-'||q.number||'-r'||r.revision||'.pdf',
 'bucket','cp05-quote-documents','path',r.pdf_object_path,'sha256',r.pdf_sha256,
 'byteLength',r.pdf_size,'contentType','application/pdf'))));
END $$;

CREATE FUNCTION bt_com_private.archive_catalog(wid uuid,query text,vid uuid,after_time timestamptz,after_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE answer jsonb;
BEGIN
 PERFORM bt_com_private.archive_authorize(wid,auth.uid(),false);
 IF query IS NULL OR char_length(query)>80 OR ((after_time IS NULL)<>(after_id IS NULL)) THEN
 RAISE EXCEPTION 'ARCHIVE_INVALID' USING ERRCODE='22023'; END IF;
 SELECT coalesce(jsonb_agg(x),'[]') INTO answer FROM (
 SELECT r.id AS "revisionId",q.id AS "quoteId",q.order_id AS "orderId",q.customer_id AS "customerId",q.vehicle_id AS "vehicleId",
 wid AS "workshopId",r.revision,q.number,r.issued_at AS "issuedAt",q.status AS "quoteStatus",
 r.payload->'customer'->>'full_name' AS "customerName",r.payload->'vehicle'->>'plate' AS plate,
 r.payload->'vehicle'->>'make' AS make,r.payload->'vehicle'->>'model' AS model,
 r.payload->'totals'->'total' AS total,c.archived_at IS NOT NULL AS "customerArchived",
 v.archived_at IS NOT NULL AS "vehicleArchived",to_jsonb(o)->>'cancelled_at' IS NOT NULL AS "orderCancelled",
 m.archive_manifest IS NOT NULL AS complete,h.id AS "deliveryId",
 m.id IS NULL AND h.id IS NOT NULL AND q.status='issued' AND NOT q.issue_pending AND q.issued_revision=r.revision
 AND EXISTS(SELECT 1 FROM bt_com_private.rollout g WHERE g.workshop_id=wid AND g.archive_enabled) AS "canArchive"
 FROM public.quote_revisions r JOIN public.quotes q ON q.workshop_id=r.workshop_id AND q.id=r.quote_id
 JOIN public.vehicles v ON v.workshop_id=q.workshop_id AND v.id=q.vehicle_id
 JOIN public.customers c ON c.workshop_id=q.workshop_id AND c.id=q.customer_id
 JOIN public.work_orders o ON o.workshop_id=q.workshop_id AND o.id=q.order_id
 LEFT JOIN bt_com_private.closing_manifests m ON m.workshop_id=r.workshop_id AND m.revision_id=r.id
 LEFT JOIN public.bt_flow_visit_deliveries h ON h.workshop_id=r.workshop_id AND h.revision_id=r.id
 WHERE r.workshop_id=wid AND (vid IS NULL OR q.vehicle_id=vid)
 AND (after_time IS NULL OR (r.issued_at,r.id)<(after_time,after_id))
 AND (query='' OR position(lower(query) IN lower(concat_ws(' ',r.payload->'customer'->>'full_name',
 r.payload->'vehicle'->>'plate',r.payload->'vehicle'->>'make',r.payload->'vehicle'->>'model',q.number::text)))>0)
 ORDER BY r.issued_at DESC,r.id DESC LIMIT 31) x;
 RETURN answer;
EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'ARCHIVE_REQUEST_FAILED' USING ERRCODE=SQLSTATE;
END $$;

CREATE FUNCTION bt_com_private.archive_source(wid uuid,oid uuid,rid uuid,did uuid,actor uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE q public.quotes;r public.quote_revisions;h public.bt_flow_visit_deliveries;
 e public.bt_flow_execution_reports;a public.bt_flow_quote_approvals;m bt_com_private.closing_manifests;
BEGIN
 PERFORM bt_com_private.archive_authorize(wid,actor,true);
 SELECT * INTO r FROM public.quote_revisions WHERE workshop_id=wid AND id=rid;
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=r.quote_id AND order_id=oid FOR SHARE;
 SELECT * INTO m FROM bt_com_private.closing_manifests WHERE workshop_id=wid AND revision_id=rid AND delivery_id=did AND order_id=oid;
 IF m.id IS NOT NULL THEN
  IF m.archive_manifest IS NULL THEN RAISE EXCEPTION 'ARCHIVE_LEGACY_UNVERIFIED' USING ERRCODE='55000'; END IF;
  RETURN jsonb_build_object('completed',m.archive_manifest);
 END IF;
 SELECT * INTO h FROM public.bt_flow_visit_deliveries WHERE workshop_id=wid AND id=did AND order_id=oid AND revision_id=rid AND quote_id=q.id;
 SELECT * INTO e FROM public.bt_flow_execution_reports WHERE workshop_id=wid AND id=h.report_id AND revision_id=rid AND quote_id=q.id;
 SELECT * INTO a FROM public.bt_flow_quote_approvals WHERE workshop_id=wid AND id=e.approval_id AND revision_id=rid AND quote_id=q.id;
 IF q.id IS NULL OR h.id IS NULL OR e.id IS NULL OR a.id IS NULL OR q.status<>'issued' OR q.issue_pending OR q.issued_revision<>r.revision
 THEN RAISE EXCEPTION 'ARCHIVE_INCOMPLETE_SOURCE' USING ERRCODE='55000'; END IF;
 PERFORM bt_com_private.archive_document(wid,rid,actor);
 RETURN jsonb_build_object('quote',to_jsonb(q),'revision',to_jsonb(r),
 'evidence',jsonb_build_object('status','ready','approvals',jsonb_build_array(to_jsonb(a)),
 'executions',jsonb_build_array(to_jsonb(e)),'deliveries',jsonb_build_array(to_jsonb(h))),
 'quoteArchive',jsonb_build_object('path',r.pdf_object_path,'sha256',r.pdf_sha256,'byteLength',r.pdf_size),
 'currentIssuedRevision',true,'confirmedDelivery',true,'workshopActive',true,
 'actorRole',(SELECT role FROM public.workshop_memberships WHERE workshop_id=wid AND user_id=actor AND status='active'));
END $$;

CREATE FUNCTION bt_com_private.archive_commit(wid uuid,oid uuid,rid uuid,did uuid,request uuid,actor uuid,data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE src jsonb;d jsonb;k text;expected text; n integer:=0;m bt_com_private.closing_manifests;r public.quote_revisions;q public.quotes;
BEGIN
 PERFORM bt_com_private.archive_authorize(wid,actor,true);
 IF request IS NULL THEN RAISE EXCEPTION 'ARCHIVE_INVALID' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(wid::text||rid::text||did::text,808));
 SELECT * INTO m FROM bt_com_private.closing_manifests WHERE workshop_id=wid AND request_id=request;
 IF m.id IS NOT NULL AND (m.order_id<>oid OR m.revision_id<>rid OR m.delivery_id<>did) THEN
 RAISE EXCEPTION 'ARCHIVE_REQUEST_REUSED' USING ERRCODE='22023'; END IF;
 src:=bt_com_private.archive_source(wid,oid,rid,did,actor);
 IF src ? 'completed' THEN
  IF src->'completed' IS DISTINCT FROM data THEN RAISE EXCEPTION 'ARCHIVE_CONFLICT' USING ERRCODE='40001'; END IF;
  RETURN src->'completed';
 END IF;
 SELECT * INTO r FROM public.quote_revisions WHERE workshop_id=wid AND id=rid;
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=r.quote_id;
 IF data->>'workshopId' IS DISTINCT FROM wid::text OR data->>'orderId' IS DISTINCT FROM oid::text OR
 data->>'revisionId' IS DISTINCT FROM rid::text OR data->>'deliveryId' IS DISTINCT FROM did::text OR
 data->>'actorId' IS DISTINCT FROM actor::text OR data->>'quoteId' IS DISTINCT FROM q.id::text OR
 data->>'reportId' IS DISTINCT FROM src->'evidence'->'executions'->0->>'id' OR
 data->>'approvalId' IS DISTINCT FROM src->'evidence'->'approvals'->0->>'id' OR
 data->>'sourceBundleId' IS DISTINCT FROM rid::text||':'||(data->>'reportId')||':'||did::text OR
 data->>'sourcePayloadSha256' IS DISTINCT FROM r.payload_sha256 OR
 data->>'state' IS DISTINCT FROM 'prepared_not_sent' OR data->>'version' IS DISTINCT FROM '1' OR
 data->>'revisionNumber' IS DISTINCT FROM r.revision::text OR
 jsonb_typeof(data->'documents') IS DISTINCT FROM 'array' OR jsonb_array_length(data->'documents')<>3
 THEN RAISE EXCEPTION 'ARCHIVE_CONTEXT_INVALID' USING ERRCODE='22023'; END IF;
 FOR d IN SELECT value FROM jsonb_array_elements(data->'documents') LOOP
  n:=n+1;k:=(ARRAY['quote','report','handover'])[n];
  IF d->>'kind' IS DISTINCT FROM k OR d->>'sha256' IS NULL OR (d->>'sha256')!~'^[a-f0-9]{64}$' OR
   d->>'fileName' IS NULL OR (d->>'fileName')!~'^[A-Za-z0-9_-]{1,115}[.]pdf$' OR
   d->>'contentType' IS DISTINCT FROM 'application/pdf' OR
   (d->>'byteLength')::bigint NOT BETWEEN 12 AND 20000000 THEN RAISE EXCEPTION 'ARCHIVE_DOCUMENT_INVALID' USING ERRCODE='22023'; END IF;
  IF k='quote' THEN
   expected:=r.pdf_object_path;
   IF d->>'bucket' IS DISTINCT FROM 'cp05-quote-documents' OR d->>'sha256' IS DISTINCT FROM r.pdf_sha256 OR
    (d->>'byteLength')::integer<>r.pdf_size THEN RAISE EXCEPTION 'ARCHIVE_QUOTE_INVALID' USING ERRCODE='22023'; END IF;
  ELSE
   expected:=wid::text||'/closings/'||oid::text||'/'||rid::text||'/'||did::text||'/'||k||'/'||(d->>'sha256')||'.pdf';
   IF d->>'bucket' IS DISTINCT FROM 'bt-closing-documents' THEN RAISE EXCEPTION 'ARCHIVE_BUCKET_INVALID' USING ERRCODE='22023'; END IF;
  END IF;
  IF d->>'path' IS DISTINCT FROM expected OR NOT EXISTS(SELECT 1 FROM storage.objects ob
   WHERE ob.bucket_id=d->>'bucket' AND ob.name=expected AND (ob.metadata->>'size')::bigint=(d->>'byteLength')::bigint
   AND ob.metadata->>'mimetype'='application/pdf') THEN RAISE EXCEPTION 'ARCHIVE_OBJECT_UNVERIFIED' USING ERRCODE='22023'; END IF;
 END LOOP;
 INSERT INTO bt_com_private.closing_manifests(workshop_id,request_id,order_id,quote_id,revision_id,approval_id,report_id,delivery_id,
 actor_id,revision_number,payload_sha256,documents,archive_manifest)
 VALUES(wid,request,oid,q.id,rid,(data->>'approvalId')::uuid,(data->>'reportId')::uuid,did,actor,r.revision,r.payload_sha256,data->'documents',data);
 RETURN data;
EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'ARCHIVE_COMMIT_FAILED' USING ERRCODE=SQLSTATE;
END $$;

-- Private PDF storage; no public object URLs, no client DML or upsert policy.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 VALUES('bt-closing-documents','bt-closing-documents',false,20000000,ARRAY['application/pdf']);
CREATE POLICY bt_final_archive_backend_only ON storage.objects AS RESTRICTIVE FOR ALL TO anon,authenticated
 USING(bucket_id<>'bt-closing-documents') WITH CHECK(bucket_id<>'bt-closing-documents');

CREATE FUNCTION public.bt_final_archive_catalog(p_workshop_id uuid,p_query text,p_vehicle_id uuid,p_after_time timestamptz,p_after_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_com_private.archive_catalog(p_workshop_id,p_query,p_vehicle_id,p_after_time,p_after_id) $$;
CREATE FUNCTION public.bt_final_archive_document(p_workshop_id uuid,p_revision_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_com_private.archive_document(p_workshop_id,p_revision_id,auth.uid()) $$;
CREATE FUNCTION public.bt_final_archive_source(p_workshop_id uuid,p_order_id uuid,p_revision_id uuid,p_delivery_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_com_private.archive_source(p_workshop_id,p_order_id,p_revision_id,p_delivery_id,auth.uid()) $$;
CREATE FUNCTION public.bt_final_archive_commit(p_workshop_id uuid,p_order_id uuid,p_revision_id uuid,p_delivery_id uuid,p_request_id uuid,p_actor_id uuid,p_manifest jsonb)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_com_private.archive_commit(p_workshop_id,p_order_id,p_revision_id,p_delivery_id,p_request_id,p_actor_id,p_manifest) $$;
REVOKE ALL ON FUNCTION bt_com_private.archive_authorize(uuid,uuid,boolean),bt_com_private.archive_document(uuid,uuid,uuid),
 bt_com_private.archive_catalog(uuid,text,uuid,timestamptz,uuid),bt_com_private.archive_source(uuid,uuid,uuid,uuid,uuid),bt_com_private.archive_commit(uuid,uuid,uuid,uuid,uuid,uuid,jsonb)
 FROM PUBLIC,anon,authenticated,service_role;
GRANT USAGE ON SCHEMA bt_com_private TO authenticated;
GRANT EXECUTE ON FUNCTION bt_com_private.archive_document(uuid,uuid,uuid),bt_com_private.archive_catalog(uuid,text,uuid,timestamptz,uuid),
 bt_com_private.archive_source(uuid,uuid,uuid,uuid,uuid) TO authenticated;
-- Actor-bearing internal entrypoints bind actor to auth.uid for user calls (see guard below).
GRANT EXECUTE ON FUNCTION bt_com_private.archive_commit(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) TO service_role;
REVOKE ALL ON FUNCTION public.bt_final_archive_catalog(uuid,text,uuid,timestamptz,uuid),public.bt_final_archive_document(uuid,uuid),
 public.bt_final_archive_source(uuid,uuid,uuid,uuid),public.bt_final_archive_commit(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.bt_final_archive_catalog(uuid,text,uuid,timestamptz,uuid),public.bt_final_archive_document(uuid,uuid),public.bt_final_archive_source(uuid,uuid,uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bt_final_archive_commit(uuid,uuid,uuid,uuid,uuid,uuid,jsonb) TO service_role;
COMMIT;
