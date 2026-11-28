-- BT-MULTIPUNTO-FINAL-01B-DELTA-01: OFFLINE candidate; no hosted application authorized.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
DO $preflight$
DECLARE signature text;expected text;actual text;
BEGIN
 IF to_regnamespace('bt_multipunto_private') IS NULL OR to_regclass('bt_multipunto_private.read_limits') IS NOT NULL THEN RAISE EXCEPTION 'MP_DELTA_BASE_REQUIRED_OR_ALREADY_APPLIED';END IF;
 IF NOT EXISTS(SELECT 1 FROM bt_multipunto_private.control WHERE NOT read_enabled AND NOT write_enabled AND NOT recovery_ready) THEN RAISE EXCEPTION 'MP_DELTA_REQUIRES_OWN_GATES_OFF';END IF;
 FOR signature,expected IN SELECT * FROM (VALUES
 ('bt_multipunto_private.capture(uuid,uuid)','2f1484bbe0e68bb04d75ca853cf0ecb7')
, ('bt_multipunto_private.charge_check(uuid,uuid)','aa6c890633b761993f8fe968fe886652')
, ('public.bt_mp_info(uuid,uuid)','72082bc45aead3f5f90ca0662bf9151a')
, ('public.bt_mp_prepare(uuid,uuid,uuid,text,text,text,integer,boolean,uuid)','f4622278fe818bef029cb61e9ff13147')
, ('public.bt_mp_complete(uuid,uuid)','d0d39ba90700f3e0eec0b21de6b2852a')
, ('public.bt_mp_read(uuid,uuid,uuid,uuid)','9bea0d2f9cd62e6651ba9ee389eba2e1')
, ('public.bt_commercial_finish(uuid,uuid,boolean,bytea)','3560903688e9768a315e5c08dbb8be02')
, ('public.bt_mp_status(uuid,uuid)','5916fc0aaad82d87ba51fc53b8c49612')
 ) x(signature,source_hash) LOOP
 SELECT md5(prosrc) INTO actual FROM pg_proc WHERE oid=signature::regprocedure;
 IF actual IS DISTINCT FROM expected THEN RAISE EXCEPTION 'MP_DELTA_SOURCE_DRIFT: %',signature;END IF;
 END LOOP;
END $preflight$;
CREATE FUNCTION bt_multipunto_private.capture(w uuid,o uuid,p_policy_id text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
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

 IF p_policy_id='MP-V2-2' THEN
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
CREATE OR REPLACE FUNCTION bt_multipunto_private.capture(w uuid,o uuid) RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$SELECT bt_multipunto_private.capture(w,o,'MP-V2-2')$$;
CREATE FUNCTION bt_multipunto_private.charge_check_at(w uuid,credit uuid,t timestamptz) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p text;n bigint;BEGIN
 SELECT coalesce(CASE WHEN state='active' AND(is_lifetime OR expires_at IS NULL OR expires_at>t) THEN plan ELSE 'basic' END,'basic') INTO p FROM bt_platform_private.subscriptions WHERE workshop_id=w;
 IF p IS NULL OR p='basic' THEN RAISE EXCEPTION 'MP_PLAN_REQUIRED' USING ERRCODE='42501';END IF;
 SELECT count(*) INTO n FROM bt_commercial_private.consumption c WHERE c.workshop_id=w AND c.capability='multipunto' AND c.request_id IS DISTINCT FROM credit AND
 (c.state='reserved' AND c.expires_at>t OR c.state='confirmed' AND c.confirmed_at>=CASE WHEN p='plus' THEN bt_commercial_private.week_start(t) ELSE t-interval '1 hour' END);
 IF n>=(CASE WHEN p='plus' THEN 10 ELSE 500 END) THEN RAISE EXCEPTION USING MESSAGE=CASE WHEN p='plus' THEN 'MP_QUOTA_EXHAUSTED' ELSE 'MP_ANTIABUSE_LIMIT' END,ERRCODE='P0001';END IF;
END$$;
CREATE OR REPLACE FUNCTION bt_multipunto_private.charge_check(w uuid,credit uuid DEFAULT NULL) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$SELECT bt_multipunto_private.charge_check_at(w,credit,clock_timestamp())$$;
CREATE OR REPLACE FUNCTION public.bt_mp_info(p_workshop_id uuid,p_order_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a jsonb;s jsonb;problem text;docs jsonb;eligible jsonb;BEGIN
 a:=bt_multipunto_private.authorize(p_workshop_id);
 IF NOT EXISTS(SELECT 1 FROM public.work_orders WHERE workshop_id=p_workshop_id AND id=p_order_id) THEN RAISE EXCEPTION 'MP_RESOURCE_DENIED' USING ERRCODE='42501';END IF;
 BEGIN s:=bt_multipunto_private.capture(p_workshop_id,p_order_id);EXCEPTION WHEN SQLSTATE '55000' THEN GET STACKED DIAGNOSTICS problem=MESSAGE_TEXT;END;
 SELECT coalesce(jsonb_agg(to_jsonb(d)-'path'-'bucket' ORDER BY d.revision DESC),'[]') INTO docs FROM bt_multipunto_private.documents d WHERE d.workshop_id=p_workshop_id AND d.order_id=p_order_id;
 SELECT jsonb_build_object('id',c.request_id,'expiresAt',c.expires_at,'snapshotHash',x.snapshot_hash) INTO eligible
 FROM bt_commercial_private.consumption c JOIN bt_multipunto_private.credits b ON b.credit_id=c.request_id JOIN bt_multipunto_private.snapshots x ON x.id=b.snapshot_id AND x.workshop_id=c.workshop_id
 WHERE c.workshop_id=p_workshop_id AND c.resource_id=p_order_id AND c.actor_id=(a->>'actor')::uuid AND c.session_id=a->>'session'
 AND c.state='confirmed' AND c.capability='multipunto' AND c.expires_at>clock_timestamp() AND b.authority=a AND x.snapshot_hash=s->>'snapshotHash' AND a->>'plan'<>'basic'
 ORDER BY c.confirmed_at DESC,c.request_id LIMIT 1;
 RETURN jsonb_build_object('version',2,'workshopId',p_workshop_id,'orderId',p_order_id,'plan',a->>'plan','canIssue',a->>'role' IN('owner','admin') AND a->>'plan'<>'basic',
 'nextRevision',(SELECT coalesce(max(revision),0)+1 FROM bt_multipunto_private.jobs WHERE workshop_id=p_workshop_id AND order_id=p_order_id),'orderStatus',s->'payload'->'order'->>'status','sourceHash',s->>'sourceHash','snapshotHash',s->>'snapshotHash','items',s->'payload'->'items','sourceProblem',problem,'eligibleCredit',eligible,'originals',docs,'usage',(public.bt_commercial_status(p_workshop_id))->'usage'->'multipunto');
END$$;
CREATE OR REPLACE FUNCTION public.bt_mp_prepare(p_workshop_id uuid,p_order_id uuid,p_request_id uuid,p_kind text,p_source_hash text,p_snapshot_hash text,p_max_additional_units integer,p_partial_ack boolean,p_credit_id uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a jsonb;s jsonb;snap bt_multipunto_private.snapshots;j bt_multipunto_private.jobs;c bt_commercial_private.consumption;binding bt_multipunto_private.credits;existing bt_multipunto_private.documents;cid uuid;rev bigint;counted integer;expiry timestamptz;decision_at timestamptz;BEGIN
 IF p_kind NOT IN('draft','final') OR p_request_id IS NULL OR p_max_additional_units IS NULL OR p_max_additional_units NOT IN(0,1) OR p_partial_ack IS NULL OR p_source_hash !~ '^[a-f0-9]{64}$' OR p_snapshot_hash !~ '^[a-f0-9]{64}$' OR p_source_hash IS NULL OR p_snapshot_hash IS NULL THEN RAISE EXCEPTION 'MP_INVALID_REQUEST' USING ERRCODE='22023';END IF;
 a:=bt_multipunto_private.authorize(p_workshop_id,true,p_kind='final',true);
 PERFORM bt_multipunto_private.lock_scope(p_workshop_id,p_order_id);
 PERFORM pg_advisory_xact_lock(hashtextextended('bt_mp_request:'||p_request_id::text,0));
 a:=bt_multipunto_private.authorize(p_workshop_id,true,p_kind='final',true);
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_request_id;
 IF FOUND THEN
  IF j.workshop_id<>p_workshop_id OR j.order_id<>p_order_id OR j.actor_id<>(a->>'actor')::uuid OR j.kind<>p_kind OR j.requested_credit_id IS DISTINCT FROM p_credit_id OR j.max_additional_units<>p_max_additional_units OR j.partial_ack<>p_partial_ack OR NOT EXISTS(SELECT 1 FROM bt_multipunto_private.snapshots x WHERE x.id=j.snapshot_id AND x.snapshot_hash=p_snapshot_hash AND x.source_hash=p_source_hash) THEN RAISE EXCEPTION 'MP_IDEMPOTENCY_CONFLICT' USING ERRCODE='23505';END IF;
  IF j.state NOT IN('ISSUED','DRAFT_CONFIRMED') AND (j.authority<>a OR j.lease_until<=clock_timestamp()) THEN RAISE EXCEPTION 'MP_RENEW_REQUIRED' USING ERRCODE='42501';END IF;
  RETURN to_jsonb(j)-'authority'-'session_id';
 END IF;
 s:=bt_multipunto_private.capture(p_workshop_id,p_order_id);
 IF s->>'sourceHash'<>p_source_hash OR s->>'snapshotHash'<>p_snapshot_hash THEN RAISE EXCEPTION 'MP_SOURCE_CHANGED' USING ERRCODE='40001';END IF;
 IF (s->'payload'->'order'->>'cancelled_at') IS NOT NULL OR (s->'payload'->'vehicle'->>'archived_at') IS NOT NULL OR (s->'payload'->'customer'->>'archived_at') IS NOT NULL THEN RAISE EXCEPTION 'MP_SOURCE_ARCHIVED' USING ERRCODE='55000';END IF;
 SELECT count(*) INTO counted FROM jsonb_array_elements(s->'payload'->'items') x WHERE x->>'state'<>'unreviewed';
 IF p_kind='final' AND(counted=0 OR counted<34 AND NOT p_partial_ack) THEN RAISE EXCEPTION 'MP_PARTIAL_CONFIRMATION_REQUIRED' USING ERRCODE='22023';END IF;
 INSERT INTO bt_multipunto_private.snapshots(workshop_id,order_id,source_hash,snapshot_hash,policy_id,canonical,payload) VALUES(p_workshop_id,p_order_id,s->>'sourceHash',s->>'snapshotHash',s->'payload'->>'policyId',s->>'canonical',s->'payload') ON CONFLICT(workshop_id,order_id,snapshot_hash) DO NOTHING;
 SELECT * INTO snap FROM bt_multipunto_private.snapshots WHERE workshop_id=p_workshop_id AND order_id=p_order_id AND snapshot_hash=p_snapshot_hash;
 IF p_kind='final' THEN SELECT * INTO existing FROM bt_multipunto_private.documents WHERE workshop_id=p_workshop_id AND order_id=p_order_id AND snapshot_id=snap.id;
  IF FOUND THEN RETURN jsonb_build_object('state','ISSUED','documentId',existing.id,'revision',existing.revision,'additionalUnits',0);END IF;END IF;
 -- Expired attempts keep their artifacts/audit; a new explicit attempt never revives a worker.
 UPDATE bt_multipunto_private.jobs SET state='EXPIRED' WHERE workshop_id=p_workshop_id AND order_id=p_order_id AND state IN('PREPARED','RENDERING','STAGED','ARCHIVE_VERIFIED') AND lease_until<=clock_timestamp();
 IF EXISTS(SELECT 1 FROM bt_multipunto_private.jobs WHERE workshop_id=p_workshop_id AND order_id=p_order_id AND snapshot_id=snap.id AND kind=p_kind AND state IN('PREPARED','RENDERING','STAGED','ARCHIVE_VERIFIED')) THEN RETURN jsonb_build_object('state','IN_PROGRESS','additionalUnits',0);END IF;
 IF p_credit_id IS NOT NULL THEN
  SELECT * INTO c FROM bt_commercial_private.consumption WHERE request_id=p_credit_id FOR UPDATE;
  SELECT * INTO binding FROM bt_multipunto_private.credits WHERE credit_id=p_credit_id;
  IF c.request_id IS NULL OR binding.credit_id IS NULL OR c.workshop_id<>p_workshop_id OR c.actor_id<>(a->>'actor')::uuid OR c.session_id<>a->>'session' OR c.resource_id<>p_order_id OR c.capability<>'multipunto' OR c.state<>'confirmed' OR c.expires_at<=clock_timestamp() OR binding.authority<>a OR binding.snapshot_id<>snap.id OR p_kind='final' AND binding.final_document_id IS NOT NULL THEN RAISE EXCEPTION 'MP_RENEW_REQUIRED' USING ERRCODE='42501';END IF;
  IF p_kind='draft' THEN
   SELECT * INTO j FROM bt_multipunto_private.jobs WHERE workshop_id=p_workshop_id AND order_id=p_order_id AND credit_id=c.request_id AND snapshot_id=snap.id AND kind='draft' AND state='DRAFT_CONFIRMED' AND authority=a ORDER BY revision LIMIT 1;
   IF FOUND THEN RETURN (to_jsonb(j)-'authority'-'session_id')||jsonb_build_object('additionalUnits',0);END IF;
  END IF;
  cid:=c.request_id;expiry:=c.expires_at;
 ELSE
  IF p_max_additional_units<>1 THEN RAISE EXCEPTION 'MP_CONSENT_REQUIRED' USING ERRCODE='22023';END IF;
  decision_at:=clock_timestamp();PERFORM bt_multipunto_private.charge_check_at(p_workshop_id,NULL,decision_at);
  cid:=gen_random_uuid();expiry:=decision_at+interval '5 minutes';
  INSERT INTO bt_commercial_private.consumption(request_id,workshop_id,actor_id,capability,resource_id,state,reserved_at,expires_at,plan_at_reservation,snapshot_hash,session_id)
  VALUES(cid,p_workshop_id,(a->>'actor')::uuid,'multipunto',p_order_id,'reserved',decision_at,expiry,a->>'plan',p_snapshot_hash,a->>'session');
  INSERT INTO bt_multipunto_private.credits(credit_id,workshop_id,snapshot_id,authority) VALUES(cid,p_workshop_id,snap.id,a);
 END IF;
 SELECT coalesce(max(revision),0)+1 INTO rev FROM bt_multipunto_private.jobs WHERE workshop_id=p_workshop_id AND order_id=p_order_id;
 INSERT INTO bt_multipunto_private.jobs(id,workshop_id,order_id,snapshot_id,actor_id,session_id,authority,kind,credit_id,requested_credit_id,max_additional_units,partial_ack,lease_until,revision,state)
 VALUES(p_request_id,p_workshop_id,p_order_id,snap.id,(a->>'actor')::uuid,(a->>'session')::uuid,a,p_kind,cid,p_credit_id,p_max_additional_units,p_partial_ack,expiry,rev,'PREPARED') RETURNING * INTO j;
 INSERT INTO bt_multipunto_private.events(workshop_id,job_id,actor_id,action) VALUES(p_workshop_id,j.id,j.actor_id,'PREPARED');
 RETURN (to_jsonb(j)-'authority'-'session_id')||jsonb_build_object('additionalUnits',CASE WHEN p_credit_id IS NULL THEN 1 ELSE 0 END);
END$$;
CREATE OR REPLACE FUNCTION public.bt_mp_complete(p_workshop_id uuid,p_job_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE j bt_multipunto_private.jobs;a jsonb;source jsonb;s bt_multipunto_private.snapshots;artifact bt_multipunto_private.artifacts;c bt_commercial_private.consumption;d bt_multipunto_private.documents;t timestamptz;BEGIN
 a:=bt_multipunto_private.authorize(p_workshop_id,true,false,true);
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_job_id;
 IF j.id IS NULL OR j.workshop_id<>p_workshop_id OR j.actor_id<>(a->>'actor')::uuid THEN RAISE EXCEPTION 'MP_RESOURCE_DENIED' USING ERRCODE='42501';END IF;
 PERFORM bt_multipunto_private.lock_scope(j.workshop_id,j.order_id);
 a:=bt_multipunto_private.authorize(p_workshop_id,true,j.kind='final',true);
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_job_id FOR UPDATE;
 IF j.state='ISSUED' THEN SELECT * INTO d FROM bt_multipunto_private.documents WHERE id=j.document_id;RETURN jsonb_build_object('state','ISSUED','jobId',j.id,'document',to_jsonb(d)-'path'-'bucket');END IF;
 IF j.state='DRAFT_CONFIRMED' THEN RETURN jsonb_build_object('state',j.state,'jobId',j.id,'creditId',j.credit_id);END IF;
 IF j.authority<>a THEN UPDATE bt_multipunto_private.jobs SET state='DENIED' WHERE id=j.id;RETURN jsonb_build_object('state','DENIED','error','MP_RENEW_REQUIRED');END IF;
 IF j.lease_until<=clock_timestamp() THEN UPDATE bt_multipunto_private.jobs SET state='EXPIRED' WHERE id=j.id;RETURN jsonb_build_object('state','EXPIRED','error','MP_RENEW_REQUIRED');END IF;
 SELECT * INTO s FROM bt_multipunto_private.snapshots WHERE id=j.snapshot_id;
 source:=bt_multipunto_private.capture(j.workshop_id,j.order_id,s.policy_id);
 IF source->>'snapshotHash'<>s.snapshot_hash OR source->>'sourceHash'<>s.source_hash THEN UPDATE bt_multipunto_private.jobs SET state='SOURCE_CHANGED' WHERE id=j.id;RETURN jsonb_build_object('state','SOURCE_CHANGED','error','MP_SOURCE_CHANGED');END IF;
 SELECT * INTO artifact FROM bt_multipunto_private.artifacts WHERE job_id=j.id AND generation=j.generation;
 IF artifact.job_id IS NULL OR j.kind='final' AND (j.state<>'ARCHIVE_VERIFIED' OR artifact.verified_at IS NULL) THEN RAISE EXCEPTION 'MP_ARCHIVE_NOT_VERIFIED' USING ERRCODE='55000';END IF;
 SELECT * INTO c FROM bt_commercial_private.consumption WHERE request_id=j.credit_id FOR UPDATE;
 -- All potentially blocking business, job and credit locks precede this decision.
 IF bt_multipunto_private.authorize(p_workshop_id,true,j.kind='final',true)<>a THEN RAISE EXCEPTION 'MP_RENEW_REQUIRED' USING ERRCODE='42501';END IF;
 t:=clock_timestamp();
 IF c.expires_at<=t OR j.lease_until<=t OR c.state NOT IN('reserved','confirmed') OR c.actor_id<>j.actor_id OR c.session_id<>j.session_id::text OR c.snapshot_hash<>s.snapshot_hash OR c.plan_at_reservation<>a->>'plan' THEN RAISE EXCEPTION 'MP_RENEW_REQUIRED' USING ERRCODE='42501';END IF;
 IF c.state='reserved' THEN PERFORM bt_multipunto_private.charge_check_at(j.workshop_id,c.request_id,t);END IF;
 IF j.kind='final' THEN
  SELECT * INTO d FROM bt_multipunto_private.documents WHERE workshop_id=j.workshop_id AND order_id=j.order_id AND snapshot_id=j.snapshot_id;
  IF d.id IS NOT NULL THEN
   IF c.state='reserved' THEN UPDATE bt_commercial_private.consumption SET state='failed' WHERE request_id=c.request_id;END IF;
  ELSE
   INSERT INTO bt_multipunto_private.documents(id,workshop_id,order_id,snapshot_id,revision,credit_id,issuer,pdf_hash,byte_length,bucket,path,document_date,confirmed_at)
   VALUES(j.document_id,j.workshop_id,j.order_id,j.snapshot_id,j.revision,j.credit_id,j.actor_id,artifact.pdf_hash,artifact.byte_length,'bt-inspection-documents',artifact.path,j.created_at,t) RETURNING * INTO d;
   UPDATE bt_multipunto_private.credits SET final_document_id=d.id WHERE credit_id=c.request_id;
   IF c.state='reserved' THEN UPDATE bt_commercial_private.consumption SET state='confirmed',confirmed_at=t,document_bytes=NULL WHERE request_id=c.request_id;END IF;
  END IF;
  UPDATE bt_multipunto_private.jobs SET state='ISSUED',document_id=d.id WHERE id=j.id;
 ELSE
  -- Only marked draft bytes can enter the legacy draft-cache column; final bytes never do.
  IF c.state='reserved' THEN UPDATE bt_commercial_private.consumption SET state='confirmed',confirmed_at=t,document_bytes=artifact.pdf_bytes WHERE request_id=c.request_id;END IF;
  UPDATE bt_multipunto_private.jobs SET state='DRAFT_CONFIRMED' WHERE id=j.id;
 END IF;
 INSERT INTO bt_multipunto_private.events(workshop_id,job_id,actor_id,action) VALUES(j.workshop_id,j.id,j.actor_id,CASE WHEN j.kind='final' THEN 'ISSUED' ELSE 'DRAFT_CONFIRMED' END);
 RETURN jsonb_build_object('state',CASE WHEN j.kind='final' THEN 'ISSUED' ELSE 'DRAFT_CONFIRMED' END,'jobId',j.id,'creditId',j.credit_id,'document',CASE WHEN d.id IS NOT NULL THEN to_jsonb(d)-'path'-'bucket' ELSE NULL END);
END$$;
-- Technical verification throttle, NOT a commercial ledger or historical-read charge.
CREATE TABLE bt_multipunto_private.read_limits(workshop_id uuid NOT NULL REFERENCES public.workshops(id),actor_id uuid NOT NULL REFERENCES auth.users(id),window_start timestamptz NOT NULL,used integer NOT NULL CHECK(used>0),PRIMARY KEY(workshop_id,actor_id));
ALTER TABLE bt_multipunto_private.read_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_multipunto_private.read_limits FORCE ROW LEVEL SECURITY;
REVOKE ALL ON bt_multipunto_private.read_limits FROM PUBLIC,anon,authenticated,service_role;
CREATE FUNCTION bt_multipunto_private.read_guard(w uuid,u uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE t timestamptz:=clock_timestamp();n integer;BEGIN
 INSERT INTO bt_multipunto_private.read_limits(workshop_id,actor_id,window_start,used) VALUES(w,u,t,1)
 ON CONFLICT(workshop_id,actor_id) DO UPDATE SET window_start=CASE WHEN bt_multipunto_private.read_limits.window_start<=t-interval '1 minute' THEN t ELSE bt_multipunto_private.read_limits.window_start END,
 used=CASE WHEN bt_multipunto_private.read_limits.window_start<=t-interval '1 minute' THEN 1 ELSE bt_multipunto_private.read_limits.used+1 END RETURNING used INTO n;
 IF n>120 THEN RAISE EXCEPTION 'MP_READ_RATE_LIMIT' USING ERRCODE='P0001';END IF;
END$$;
CREATE OR REPLACE FUNCTION public.bt_mp_read(p_workshop_id uuid,p_order_id uuid,p_document_id uuid DEFAULT NULL,p_job_id uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a jsonb;d bt_multipunto_private.documents;j bt_multipunto_private.jobs;artifact bt_multipunto_private.artifacts;c bt_commercial_private.consumption;BEGIN
 a:=bt_multipunto_private.authorize(p_workshop_id,false,false,true);
 IF (p_document_id IS NULL)=(p_job_id IS NULL) THEN RAISE EXCEPTION 'MP_INVALID_REQUEST' USING ERRCODE='22023';END IF;
 IF p_document_id IS NOT NULL THEN
  SELECT * INTO d FROM bt_multipunto_private.documents WHERE id=p_document_id AND workshop_id=p_workshop_id AND order_id=p_order_id;
  IF d.id IS NULL THEN RAISE EXCEPTION 'MP_ORIGINAL_MISSING' USING ERRCODE='P0002';END IF;
  PERFORM bt_multipunto_private.read_guard(p_workshop_id,(a->>'actor')::uuid);
  RETURN jsonb_build_object('kind','final','document',to_jsonb(d));
 END IF;
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_job_id AND workshop_id=p_workshop_id AND order_id=p_order_id AND kind='draft' AND state='DRAFT_CONFIRMED' AND actor_id=(a->>'actor')::uuid;
 IF j.id IS NULL OR j.authority IS DISTINCT FROM a THEN RAISE EXCEPTION 'MP_RENEW_REQUIRED' USING ERRCODE='42501';END IF;
 SELECT * INTO c FROM bt_commercial_private.consumption WHERE request_id=j.credit_id;
 IF c.state<>'confirmed' OR c.expires_at<=clock_timestamp() THEN RAISE EXCEPTION 'MP_RENEW_REQUIRED' USING ERRCODE='42501';END IF;
 SELECT * INTO artifact FROM bt_multipunto_private.artifacts WHERE job_id=j.id AND generation=j.generation;
 PERFORM bt_multipunto_private.read_guard(p_workshop_id,(a->>'actor')::uuid);
 RETURN jsonb_build_object('kind','draft','bytes',encode(artifact.pdf_bytes,'hex'),'hash',artifact.pdf_hash,'size',artifact.byte_length);
END$$;
REVOKE ALL ON FUNCTION bt_multipunto_private.capture(uuid,uuid,text),bt_multipunto_private.charge_check_at(uuid,uuid,timestamptz),bt_multipunto_private.read_guard(uuid,uuid) FROM PUBLIC,anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION public.bt_commercial_finish(p_request_id uuid, p_actor_id uuid, p_success boolean, p_bytes bytea DEFAULT NULL::bytea)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE r bt_commercial_private.consumption%ROWTYPE; decision_at timestamptz; BEGIN IF EXISTS(SELECT 1 FROM bt_multipunto_private.credits WHERE credit_id=p_request_id) THEN RAISE EXCEPTION 'MP_V2_ENDPOINT_REQUIRED' USING ERRCODE='42501';END IF;
 IF current_setting('role',true)<>'service_role' THEN RAISE EXCEPTION 'TRUSTED_DELIVERY_REQUIRED' USING ERRCODE='42501';END IF;
 SELECT * INTO r FROM bt_commercial_private.consumption WHERE request_id=p_request_id;
 IF r.request_id IS NULL OR r.actor_id<>p_actor_id THEN RAISE EXCEPTION 'CONSUMPTION_DENIED' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('bt_workshop:'||r.workshop_id::text,0));
 SELECT * INTO r FROM bt_commercial_private.consumption WHERE request_id=p_request_id FOR UPDATE;
 PERFORM bt_commercial_private.assert_capability(r.workshop_id,r.capability);
 IF NOT EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN auth.users u ON u.id=m.user_id JOIN auth.sessions a ON a.user_id=u.id AND a.id::text=r.session_id JOIN public.workshops w ON w.id=m.workshop_id WHERE m.workshop_id=r.workshop_id AND m.user_id=p_actor_id AND m.status='active' AND w.status='active' AND u.email_confirmed_at IS NOT NULL AND (u.banned_until IS NULL OR u.banned_until<=now()) AND (a.not_after IS NULL OR a.not_after>now())) THEN RAISE EXCEPTION 'MEMBERSHIP_REVOKED' USING ERRCODE='42501';END IF;
 IF bt_commercial_private.plan(r.workshop_id)<>r.plan_at_reservation THEN RAISE EXCEPTION 'PLAN_CHANGED_RETRY' USING ERRCODE='42501';END IF;
 IF r.state='confirmed' AND r.expires_at>now() THEN RETURN to_jsonb(r)-'document_bytes'-'session_id';END IF;
 IF r.state<>'reserved' OR r.expires_at<=now() THEN RAISE EXCEPTION 'RESERVATION_EXPIRED' USING ERRCODE='42501';END IF;
 IF p_success THEN
  IF r.capability<>'email' AND (p_bytes IS NULL OR substring(p_bytes FROM 1 FOR 5)<>decode('255044462d','hex')) THEN RAISE EXCEPTION 'VERIFIED_PDF_REQUIRED' USING ERRCODE='22023';END IF;
  -- A downgrade between reserve and delivery must not reuse the former generous quota.
  IF bt_commercial_private.plan(r.workshop_id)<>r.plan_at_reservation THEN RAISE EXCEPTION 'PLAN_CHANGED_RETRY' USING ERRCODE='42501';END IF;
  -- Multipunto V1 shares the same ledger/lock and must obey D02 at confirmation.
  IF r.capability='multipunto' THEN
   decision_at:=clock_timestamp();
   IF r.expires_at<=decision_at THEN RAISE EXCEPTION 'RESERVATION_EXPIRED' USING ERRCODE='42501';END IF;
   PERFORM bt_multipunto_private.charge_check_at(r.workshop_id,r.request_id,decision_at);
  END IF;
  UPDATE bt_commercial_private.consumption SET state='confirmed',confirmed_at=CASE WHEN r.capability='multipunto' THEN decision_at ELSE now() END,document_bytes=p_bytes WHERE request_id=p_request_id RETURNING * INTO r;
 ELSE UPDATE bt_commercial_private.consumption SET state='failed' WHERE request_id=p_request_id RETURNING * INTO r;END IF;
 RETURN to_jsonb(r)-'document_bytes'-'session_id';
END $function$
;
CREATE OR REPLACE FUNCTION public.bt_mp_status(p_workshop_id uuid,p_job_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a jsonb;j bt_multipunto_private.jobs;BEGIN
 a:=bt_multipunto_private.authorize(p_workshop_id);
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_job_id AND workshop_id=p_workshop_id AND actor_id=(a->>'actor')::uuid;
 IF j.id IS NULL THEN RETURN jsonb_build_object('id',p_job_id,'workshop_id',p_workshop_id,'state','NOT_PREPARED');END IF;
 IF j.state IN('PREPARED','RENDERING','STAGED','ARCHIVE_VERIFIED') AND j.lease_until<=clock_timestamp() THEN j.state:='EXPIRED';END IF;
 RETURN to_jsonb(j)-'authority'-'session_id';
END$$;
-- Existing public function ACL/owners are preserved by CREATE OR REPLACE. No GATE4 changes.
COMMIT;
