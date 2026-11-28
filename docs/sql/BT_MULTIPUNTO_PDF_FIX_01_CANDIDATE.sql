-- BT-MULTIPUNTO-PDF-FIX-01: OFFLINE CANDIDATE ONLY. Apply policy registry first.
-- No grants, quota/credit writes, RLS, GATE4, bucket or historic artifact changes.
BEGIN;
DO $$BEGIN
 IF current_setting('bt_multipunto_pdf.external_barrier',true) IS DISTINCT FROM 'verified' THEN RAISE EXCEPTION 'MP_PDF_REQUIRES_VERIFIED_EXTERNAL_BARRIER';END IF;
 PERFORM id FROM bt_multipunto_private.control FOR UPDATE;
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='bt_multipunto_private.capture(uuid,uuid)'::regprocedure)<>'9e480f9a14e4ec0fd690b7cafa1e9f61'
 OR (SELECT md5(prosrc) FROM pg_proc WHERE oid='bt_multipunto_private.capture(uuid,uuid,text)'::regprocedure)<>'22681caa629eb30a0b04465b19e823b1' THEN RAISE EXCEPTION 'MP_PDF_BASE_MISMATCH';END IF;
 IF NOT EXISTS(SELECT 1 FROM bt_multipunto_private.policy WHERE id='MP-V2-3' AND definition->>'renderer'='BT-MP-FINAL-2' AND sha256=bt_multipunto_private.hash(definition::text)) THEN RAISE EXCEPTION 'MP_POLICY_NOT_INSTALLED';END IF;
END$$;
CREATE OR REPLACE FUNCTION bt_multipunto_private.capture(w uuid,o uuid,p_policy_id text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE payload jsonb;source jsonb;rows jsonb;additional jsonb;policy_record bt_multipunto_private.policy;profile jsonb;BEGIN
 SELECT * INTO policy_record FROM bt_multipunto_private.policy WHERE id=p_policy_id;
 IF policy_record.id IS NULL THEN RAISE EXCEPTION 'MP_POLICY_NOT_INSTALLED' USING ERRCODE='55000';END IF;
 SELECT to_jsonb(p) INTO profile FROM bt_platform_private.workshop_profiles p WHERE workshop_id=w;
 SELECT jsonb_build_object('order',to_jsonb(t),'vehicle',to_jsonb(v),'customer',to_jsonb(c),'workshop',to_jsonb(k),'profile',profile,
 'history',coalesce((SELECT jsonb_agg(to_jsonb(f) ORDER BY f.created_at,f.id) FROM public.inspection_findings f WHERE f.workshop_id=w AND f.order_id=o),'[]'))
 INTO source FROM public.work_orders t JOIN public.vehicles v ON v.id=t.vehicle_id AND v.workshop_id=w JOIN public.customers c ON c.id=v.customer_id AND c.workshop_id=w JOIN public.workshops k ON k.id=w WHERE t.workshop_id=w AND t.id=o;
 IF source IS NULL THEN RAISE EXCEPTION 'MP_RESOURCE_DENIED' USING ERRCODE='42501';END IF;
 WITH latest AS (SELECT DISTINCT ON(f.category) f.* FROM public.inspection_findings f WHERE f.workshop_id=w AND f.order_id=o ORDER BY f.category,f.created_at DESC,f.id DESC)
 SELECT jsonb_agg(jsonb_build_object('id',i.id,'name',i.label,'category',i.category,'state',CASE WHEN f.result='ok' THEN 'ok' WHEN f.result='attention' AND f.note LIKE 'PRIORIDAD INMEDIATA: %' THEN 'immediate' WHEN f.result='attention' THEN 'attention' ELSE 'unreviewed' END,
 'note',coalesce(f.note,''),'resolution',f.resolution,'findingId',f.id) ORDER BY i.ordinal) INTO rows FROM bt_multipunto_private.items i LEFT JOIN latest f ON f.category='Multipunto · '||i.label;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(rows) x WHERE x->>'state' IN('attention','immediate') AND (btrim(x->>'note')='' OR x->>'note' LIKE '%Detalle técnico pendiente de completar%')) THEN RAISE EXCEPTION 'MP_PERSISTENCE_PENDING' USING ERRCODE='55000';END IF;
 SELECT coalesce(jsonb_agg(to_jsonb(f) ORDER BY f.created_at,f.id),'[]') INTO additional FROM public.inspection_findings f WHERE f.workshop_id=w AND f.order_id=o AND f.category NOT LIKE 'Multipunto · %';
 payload:=jsonb_build_object('schema','MP-SNAPSHOT-1/PG17','scope',jsonb_build_object('workshopId',w,'orderId',o),'order',source->'order','vehicle',source->'vehicle','customer',source->'customer','workshop',source->'workshop','profile',profile,
 'items',rows,'additional',additional,'historyDigest',bt_multipunto_private.hash((source->'history')::text),'historyCount',jsonb_array_length(source->'history'),'policy',policy_record.definition,'policyId',policy_record.id,'policyHash',policy_record.sha256);

 IF p_policy_id IN('MP-V2-2','MP-V2-3') THEN
  payload:=payload||jsonb_build_object('schema','MP-SNAPSHOT-2/PG17','sourceHash',bt_multipunto_private.hash(source::text),
   'order',jsonb_build_object('id',o,'workshop_id',w,'vehicle_id',source->'order'->'vehicle_id','opened_at',source->'order'->'opened_at','intake_odometer',source->'order'->'intake_odometer','status',source->'order'->'status','cancelled_at',source->'order'->'cancelled_at'),
   'vehicle',jsonb_build_object('id',source->'vehicle'->'id','workshop_id',w,'customer_id',source->'vehicle'->'customer_id','plate',source->'vehicle'->'plate','make',source->'vehicle'->'make','model',source->'vehicle'->'model','model_year',source->'vehicle'->'model_year','archived_at',source->'vehicle'->'archived_at'),
   'customer',jsonb_build_object('id',source->'customer'->'id','full_name',source->'customer'->'full_name','archived_at',source->'customer'->'archived_at'),
   'workshop',jsonb_build_object('id',w,'name',source->'workshop'->'name'),
   'profile',CASE WHEN profile IS NULL THEN NULL ELSE jsonb_build_object('commercial_name',profile->'commercial_name','address',profile->'address','phone',profile->'phone','contact_email',profile->'contact_email') END,
   'additional',coalesce((SELECT jsonb_agg(jsonb_build_object('category',x->'category','note',x->'note','resolution',x->'resolution') ORDER BY ordinal) FROM jsonb_array_elements(additional) WITH ORDINALITY r(x,ordinal)),'[]'::jsonb));
 END IF;
 IF octet_length(payload::text)>1048576 THEN RAISE EXCEPTION 'MP_SOURCE_TOO_LARGE' USING ERRCODE='54000';END IF;
 RETURN jsonb_build_object('sourceHash',bt_multipunto_private.hash(source::text),'snapshotHash',bt_multipunto_private.hash(payload::text),'canonical',payload::text,'payload',payload);
END$$;
CREATE OR REPLACE FUNCTION bt_multipunto_private.capture(w uuid,o uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a jsonb;previous record;candidate jsonb;BEGIN
 a:=bt_multipunto_private.authorize(w);
 -- Version selection is not authority. Unchanged prepare/complete revalidate
 -- consent, scope, snapshot, session, lease and the single commercial ledger.
 -- Preserve a live paid credit (or recoverable reservation) across installation.
 FOR previous IN
  SELECT x.policy_id,x.snapshot_hash,x.source_hash
  FROM bt_commercial_private.consumption c
  JOIN bt_multipunto_private.credits b ON b.credit_id=c.request_id
  JOIN bt_multipunto_private.snapshots x ON x.id=b.snapshot_id AND x.workshop_id=w AND x.order_id=o
  WHERE c.workshop_id=w AND c.resource_id=o AND c.capability='multipunto'
   AND c.actor_id=(a->>'actor')::uuid AND c.session_id=a->>'session'
   AND c.state IN('reserved','confirmed') AND c.expires_at>clock_timestamp()
   AND b.authority=a AND a->>'plan'<>'basic'
  ORDER BY c.confirmed_at DESC NULLS LAST,c.reserved_at DESC,c.request_id
 LOOP
  candidate:=bt_multipunto_private.capture(w,o,previous.policy_id);
  IF candidate->>'snapshotHash'=previous.snapshot_hash AND candidate->>'sourceHash'=previous.source_hash THEN RETURN candidate;END IF;
 END LOOP;
 RETURN bt_multipunto_private.capture(w,o,'MP-V2-3');
END$$;
COMMIT;
