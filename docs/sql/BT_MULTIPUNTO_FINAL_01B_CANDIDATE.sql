-- BT-MULTIPUNTO-FINAL-01B: isolated candidate only; install requires independent approval.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
DO $$BEGIN
 IF to_regnamespace('bt_multipunto_private') IS NOT NULL THEN RAISE EXCEPTION 'MP_ALREADY_INSTALLED';END IF;
 IF to_regprocedure('public.bt_commercial_reserve(uuid,text,uuid,uuid,text)') IS NULL THEN RAISE EXCEPTION 'MP_COMMERCIAL_BASE_REQUIRED';END IF;
END$$;
CREATE SCHEMA bt_multipunto_private;
REVOKE ALL ON SCHEMA bt_multipunto_private FROM PUBLIC,anon,authenticated,service_role;
CREATE TABLE bt_multipunto_private.control(id boolean PRIMARY KEY DEFAULT true CHECK(id),read_enabled boolean NOT NULL DEFAULT false,write_enabled boolean NOT NULL DEFAULT false,recovery_ready boolean NOT NULL DEFAULT false,epoch bigint NOT NULL DEFAULT 1);
INSERT INTO bt_multipunto_private.control DEFAULT VALUES;
CREATE TABLE bt_multipunto_private.epochs(workshop_id uuid PRIMARY KEY REFERENCES public.workshops(id),version bigint NOT NULL DEFAULT 1);
CREATE TABLE bt_multipunto_private.items(id text PRIMARY KEY,ordinal integer NOT NULL UNIQUE,category text NOT NULL,label text NOT NULL UNIQUE);
INSERT INTO bt_multipunto_private.items VALUES('general/neblina',0,'general','Luces de neblina');
INSERT INTO bt_multipunto_private.items VALUES('general/bajas',1,'general','Luces bajas');
INSERT INTO bt_multipunto_private.items VALUES('general/intermitentes',2,'general','Luces intermitentes');
INSERT INTO bt_multipunto_private.items VALUES('general/altas',3,'general','Luces altas');
INSERT INTO bt_multipunto_private.items VALUES('general/freno-luces',4,'general','Luces de freno');
INSERT INTO bt_multipunto_private.items VALUES('general/reversa',5,'general','Luz de marcha atrás');
INSERT INTO bt_multipunto_private.items VALUES('general/posicion',6,'general','Luces de posición');
INSERT INTO bt_multipunto_private.items VALUES('general/bocina',7,'general','Bocina');
INSERT INTO bt_multipunto_private.items VALUES('general/herramientas',8,'general','Kit de herramientas');
INSERT INTO bt_multipunto_private.items VALUES('general/extintor',9,'general','Extintor');
INSERT INTO bt_multipunto_private.items VALUES('capo/liquido-frenos',10,'capo','Líquido de frenos');
INSERT INTO bt_multipunto_private.items VALUES('capo/aceite-motor',11,'capo','Nivel de aceite de motor');
INSERT INTO bt_multipunto_private.items VALUES('capo/aceite-transmision',12,'capo','Aceite de transmisión');
INSERT INTO bt_multipunto_private.items VALUES('capo/liquido-direccion',13,'capo','Líquido de dirección');
INSERT INTO bt_multipunto_private.items VALUES('capo/refrigerante',14,'capo','Líquido refrigerante');
INSERT INTO bt_multipunto_private.items VALUES('capo/accesorios',15,'capo','Correas de accesorios');
INSERT INTO bt_multipunto_private.items VALUES('capo/distribucion',16,'capo','Distribución');
INSERT INTO bt_multipunto_private.items VALUES('capo/embrague',17,'capo','Funcionamiento del embrague');
INSERT INTO bt_multipunto_private.items VALUES('bajo/bandejas',18,'bajo','Bandejas');
INSERT INTO bt_multipunto_private.items VALUES('bajo/bieletas',19,'bajo','Bieletas');
INSERT INTO bt_multipunto_private.items VALUES('bajo/axiales',20,'bajo','Axiales y terminales');
INSERT INTO bt_multipunto_private.items VALUES('bajo/amortiguadores',21,'bajo','Amortiguadores');
INSERT INTO bt_multipunto_private.items VALUES('bajo/fuga-aceite',22,'bajo','Fugas de aceite');
INSERT INTO bt_multipunto_private.items VALUES('bajo/fuga-refrigerante',23,'bajo','Fugas de refrigerante');
INSERT INTO bt_multipunto_private.items VALUES('bajo/homocineticas',24,'bajo','Homocinéticas');
INSERT INTO bt_multipunto_private.items VALUES('bajo/cremallera',25,'bajo','Cremallera de dirección');
INSERT INTO bt_multipunto_private.items VALUES('frenos/discos',26,'frenos','Discos de freno');
INSERT INTO bt_multipunto_private.items VALUES('frenos/tambores',27,'frenos','Tambores');
INSERT INTO bt_multipunto_private.items VALUES('frenos/estacionamiento',28,'frenos','Freno de estacionamiento');
INSERT INTO bt_multipunto_private.items VALUES('frenos/pastillas',29,'frenos','Pastillas de freno');
INSERT INTO bt_multipunto_private.items VALUES('neumaticos/delanteras',30,'neumaticos','Ruedas delanteras');
INSERT INTO bt_multipunto_private.items VALUES('neumaticos/traseras',31,'neumaticos','Ruedas traseras');
INSERT INTO bt_multipunto_private.items VALUES('neumaticos/repuesto',32,'neumaticos','Rueda de repuesto');
INSERT INTO bt_multipunto_private.items VALUES('neumaticos/presion',33,'neumaticos','Presión de neumáticos');
CREATE TABLE bt_multipunto_private.policy(id text PRIMARY KEY,definition jsonb NOT NULL,sha256 text NOT NULL CHECK(sha256~'^[a-f0-9]{64}$'));
CREATE TABLE bt_multipunto_private.snapshots(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workshop_id uuid NOT NULL REFERENCES public.workshops(id),order_id uuid NOT NULL,
 source_hash text NOT NULL CHECK(source_hash~'^[a-f0-9]{64}$'),snapshot_hash text NOT NULL CHECK(snapshot_hash~'^[a-f0-9]{64}$'),
 policy_id text NOT NULL REFERENCES bt_multipunto_private.policy(id),canonical text NOT NULL CHECK(octet_length(canonical)<=1048576),payload jsonb NOT NULL,captured_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(workshop_id,id),UNIQUE(workshop_id,order_id,snapshot_hash),FOREIGN KEY(workshop_id,order_id) REFERENCES public.work_orders(workshop_id,id));
CREATE TABLE bt_multipunto_private.credits(
 credit_id uuid PRIMARY KEY REFERENCES bt_commercial_private.consumption(request_id),workshop_id uuid NOT NULL,snapshot_id uuid NOT NULL,
 authority jsonb NOT NULL,final_document_id uuid,FOREIGN KEY(workshop_id,snapshot_id) REFERENCES bt_multipunto_private.snapshots(workshop_id,id));
CREATE TABLE bt_multipunto_private.jobs(
 id uuid PRIMARY KEY,workshop_id uuid NOT NULL,order_id uuid NOT NULL,snapshot_id uuid NOT NULL,
 actor_id uuid NOT NULL REFERENCES auth.users(id),session_id uuid NOT NULL,authority jsonb NOT NULL,
 kind text NOT NULL CHECK(kind IN('draft','final')),credit_id uuid NOT NULL REFERENCES bt_multipunto_private.credits(credit_id),requested_credit_id uuid,max_additional_units integer NOT NULL CHECK(max_additional_units IN(0,1)),
 partial_ack boolean NOT NULL,generation bigint NOT NULL DEFAULT 1,lease_until timestamptz NOT NULL,revision bigint NOT NULL,
 state text NOT NULL CHECK(state IN('PREPARED','RENDERING','STAGED','ARCHIVE_VERIFIED','ISSUED','DRAFT_CONFIRMED','FAILED','EXPIRED','DENIED','SOURCE_CHANGED')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),document_id uuid NOT NULL DEFAULT gen_random_uuid(),
 UNIQUE(workshop_id,id),UNIQUE(workshop_id,order_id,revision),FOREIGN KEY(workshop_id,snapshot_id) REFERENCES bt_multipunto_private.snapshots(workshop_id,id));
ALTER TABLE bt_multipunto_private.jobs ADD FOREIGN KEY(workshop_id,order_id) REFERENCES public.work_orders(workshop_id,id);
CREATE UNIQUE INDEX mp_single_active ON bt_multipunto_private.jobs(workshop_id,order_id,snapshot_id,kind) WHERE state IN('PREPARED','RENDERING','STAGED','ARCHIVE_VERIFIED');
CREATE TABLE bt_multipunto_private.artifacts(
 job_id uuid NOT NULL,generation bigint NOT NULL,workshop_id uuid NOT NULL,pdf_bytes bytea NOT NULL CHECK(octet_length(pdf_bytes) BETWEEN 12 AND 20000000),
 pdf_hash text NOT NULL CHECK(pdf_hash~'^[a-f0-9]{64}$'),byte_length integer NOT NULL CHECK(byte_length BETWEEN 12 AND 20000000),path text,verified_at timestamptz,
 PRIMARY KEY(job_id,generation),FOREIGN KEY(workshop_id,job_id) REFERENCES bt_multipunto_private.jobs(workshop_id,id));
CREATE TABLE bt_multipunto_private.documents(
 id uuid PRIMARY KEY,workshop_id uuid NOT NULL,order_id uuid NOT NULL,snapshot_id uuid NOT NULL,
 revision bigint NOT NULL,credit_id uuid NOT NULL REFERENCES bt_multipunto_private.credits(credit_id),issuer uuid NOT NULL REFERENCES auth.users(id),
 pdf_hash text NOT NULL CHECK(pdf_hash~'^[a-f0-9]{64}$'),byte_length integer NOT NULL CHECK(byte_length BETWEEN 12 AND 20000000),bucket text NOT NULL CHECK(bucket='bt-inspection-documents'),path text NOT NULL UNIQUE,
 document_date timestamptz NOT NULL,confirmed_at timestamptz NOT NULL,UNIQUE(workshop_id,id),UNIQUE(workshop_id,order_id,revision),UNIQUE(workshop_id,order_id,snapshot_id),
 FOREIGN KEY(workshop_id,snapshot_id) REFERENCES bt_multipunto_private.snapshots(workshop_id,id));
ALTER TABLE bt_multipunto_private.documents ADD FOREIGN KEY(workshop_id,order_id) REFERENCES public.work_orders(workshop_id,id);
ALTER TABLE bt_multipunto_private.credits ADD CONSTRAINT mp_credit_document_fk FOREIGN KEY(workshop_id,final_document_id) REFERENCES bt_multipunto_private.documents(workshop_id,id);
CREATE TABLE bt_multipunto_private.events(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,workshop_id uuid NOT NULL,job_id uuid,actor_id uuid,action text NOT NULL,at timestamptz NOT NULL DEFAULT clock_timestamp());
CREATE FUNCTION bt_multipunto_private.hash(value text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path='' AS $$SELECT encode(extensions.digest(convert_to(value,'UTF8'),'sha256'),'hex')$$;
CREATE FUNCTION bt_multipunto_private.bump() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE w uuid;BEGIN
 IF TG_TABLE_NAME='control' THEN NEW.epoch:=OLD.epoch+1;RETURN NEW;END IF;
 IF TG_TABLE_NAME='workshops' THEN w:=coalesce(NEW.id,OLD.id);ELSE w:=coalesce(NEW.workshop_id,OLD.workshop_id);END IF;
 INSERT INTO bt_multipunto_private.epochs(workshop_id) VALUES(w) ON CONFLICT(workshop_id) DO UPDATE SET version=bt_multipunto_private.epochs.version+1;
 RETURN coalesce(NEW,OLD);
END$$;
CREATE TRIGGER mp_control_epoch BEFORE UPDATE ON bt_multipunto_private.control FOR EACH ROW EXECUTE FUNCTION bt_multipunto_private.bump();
CREATE TRIGGER mp_subscription_epoch AFTER INSERT OR UPDATE OR DELETE ON bt_platform_private.subscriptions FOR EACH ROW EXECUTE FUNCTION bt_multipunto_private.bump();
CREATE TRIGGER mp_membership_epoch AFTER INSERT OR UPDATE OR DELETE ON public.workshop_memberships FOR EACH ROW EXECUTE FUNCTION bt_multipunto_private.bump();
CREATE TRIGGER mp_workshop_epoch AFTER UPDATE ON public.workshops FOR EACH ROW EXECUTE FUNCTION bt_multipunto_private.bump();
CREATE TRIGGER mp_flow_epoch AFTER INSERT OR UPDATE OR DELETE ON bt_flow_live_private.rollout FOR EACH ROW EXECUTE FUNCTION bt_multipunto_private.bump();
CREATE TRIGGER mp_archive_epoch AFTER INSERT OR UPDATE OR DELETE ON bt_com_private.rollout FOR EACH ROW EXECUTE FUNCTION bt_multipunto_private.bump();
CREATE FUNCTION bt_multipunto_private.authorize(w uuid,writing boolean DEFAULT false,issuing boolean DEFAULT false,premium boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid;sid uuid;role_name text;plan_name text;ops jsonb;commercial jsonb;c bt_multipunto_private.control;sig text;v bigint;BEGIN
 IF current_setting('role',true)<>'authenticated' THEN RAISE EXCEPTION 'MP_SESSION_INVALID' USING ERRCODE='42501';END IF;
 FOREACH sig IN ARRAY ARRAY['public.bt_plan04_operations_status(uuid)','public.bt_final_archive_document(uuid,uuid)','public.bt_final_archive_source(uuid,uuid,uuid,uuid)','public.bt_commercial_status(uuid)'] LOOP
  IF NOT has_function_privilege('authenticated',sig,'EXECUTE') THEN RAISE EXCEPTION 'MP_GATE_CLOSED' USING ERRCODE='55000';END IF;
 END LOOP;
 SELECT * INTO c FROM bt_multipunto_private.control WHERE id;
 IF NOT c.read_enabled OR writing AND (NOT c.write_enabled OR NOT c.recovery_ready) THEN RAISE EXCEPTION 'MP_DISABLED' USING ERRCODE='55000';END IF;
 u:=auth.uid();sid:=(auth.jwt()->>'session_id')::uuid;
 IF sid IS NULL OR NOT EXISTS(SELECT 1 FROM auth.sessions s JOIN auth.users a ON a.id=s.user_id WHERE s.id=sid AND s.user_id=u AND (s.not_after IS NULL OR s.not_after>clock_timestamp()) AND a.email_confirmed_at IS NOT NULL AND (a.banned_until IS NULL OR a.banned_until<=clock_timestamp())) THEN RAISE EXCEPTION 'MP_SESSION_INVALID' USING ERRCODE='42501';END IF;
 IF coalesce((auth.jwt()->>'exp')::numeric,0)<=extract(epoch FROM clock_timestamp()) THEN RAISE EXCEPTION 'MP_SESSION_INVALID' USING ERRCODE='42501';END IF;
 PERFORM bt_platform_private.actor();
 SELECT m.role INTO role_name FROM public.workshop_memberships m JOIN public.workshops t ON t.id=m.workshop_id WHERE m.workshop_id=w AND m.user_id=u AND m.status='active' AND t.status='active';
 IF role_name IS NULL OR role_name NOT IN('owner','admin','reception','mechanic') OR issuing AND role_name NOT IN('owner','admin') THEN RAISE EXCEPTION 'MP_PERMISSION_DENIED' USING ERRCODE='42501';END IF;
 commercial:=public.bt_commercial_status(w);ops:=public.bt_plan04_operations_status(w);

 SELECT coalesce(CASE WHEN state='active' AND (is_lifetime OR expires_at IS NULL OR expires_at>clock_timestamp()) THEN plan ELSE 'basic' END,'basic') INTO plan_name FROM bt_platform_private.subscriptions WHERE workshop_id=w;
 plan_name:=coalesce(plan_name,'basic');IF premium AND plan_name='basic' THEN RAISE EXCEPTION 'MP_PLAN_REQUIRED' USING ERRCODE='42501';END IF;
 IF premium AND coalesce((ops->>'documentsEnabled')::boolean,false)=false OR writing AND coalesce((ops->>'operationsEnabled')::boolean,false)=false THEN RAISE EXCEPTION 'MP_OPERATION_DISABLED' USING ERRCODE='55000';END IF;
 SELECT version INTO v FROM bt_multipunto_private.epochs WHERE workshop_id=w;
 RETURN jsonb_build_object('actor',u,'session',sid,'plan',plan_name,'role',role_name,'epoch',coalesce(v,0),'moduleEpoch',c.epoch);
END$$;
CREATE FUNCTION bt_multipunto_private.lock_scope(w uuid,o uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('bt_workshop:'||w::text,0));
 PERFORM 1 FROM bt_platform_private.subscriptions WHERE workshop_id=w FOR SHARE;
 PERFORM 1 FROM public.workshop_memberships WHERE workshop_id=w ORDER BY id FOR SHARE;
 PERFORM 1 FROM public.workshops WHERE id=w FOR SHARE;
 PERFORM 1 FROM bt_multipunto_private.epochs WHERE workshop_id=w FOR SHARE;
 PERFORM 1 FROM bt_multipunto_private.control WHERE id FOR SHARE;
 PERFORM 1 FROM public.work_orders WHERE workshop_id=w AND id=o FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'MP_RESOURCE_DENIED' USING ERRCODE='42501';END IF;
 PERFORM 1 FROM public.vehicles v JOIN public.work_orders t ON t.vehicle_id=v.id WHERE t.workshop_id=w AND t.id=o FOR SHARE OF v;
 PERFORM 1 FROM public.customers c JOIN public.vehicles v ON v.customer_id=c.id JOIN public.work_orders t ON t.vehicle_id=v.id WHERE t.workshop_id=w AND t.id=o FOR SHARE OF c;
 PERFORM 1 FROM bt_platform_private.workshop_profiles WHERE workshop_id=w FOR SHARE;
END$$;
CREATE FUNCTION bt_multipunto_private.capture(w uuid,o uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE payload jsonb;source jsonb;rows jsonb;additional jsonb;policy_record bt_multipunto_private.policy;profile jsonb;BEGIN
 SELECT * INTO policy_record FROM bt_multipunto_private.policy WHERE id='MP-V2-1';
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
 IF octet_length(payload::text)>1048576 THEN RAISE EXCEPTION 'MP_SOURCE_TOO_LARGE' USING ERRCODE='54000';END IF;
 RETURN jsonb_build_object('sourceHash',bt_multipunto_private.hash(source::text),'snapshotHash',bt_multipunto_private.hash(payload::text),'canonical',payload::text,'payload',payload);
END$$;
CREATE FUNCTION bt_multipunto_private.charge_check(w uuid,credit uuid DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p text;n bigint;t timestamptz:=clock_timestamp();BEGIN
 SELECT coalesce(CASE WHEN state='active' AND(is_lifetime OR expires_at IS NULL OR expires_at>t) THEN plan ELSE 'basic' END,'basic') INTO p FROM bt_platform_private.subscriptions WHERE workshop_id=w;
 IF p IS NULL OR p='basic' THEN RAISE EXCEPTION 'MP_PLAN_REQUIRED' USING ERRCODE='42501';END IF;
 SELECT count(*) INTO n FROM bt_commercial_private.consumption c WHERE c.workshop_id=w AND c.capability='multipunto' AND c.request_id IS DISTINCT FROM credit AND
 (c.state='reserved' AND c.expires_at>t OR c.state='confirmed' AND c.confirmed_at>=CASE WHEN p='plus' THEN bt_commercial_private.week_start(t) ELSE t-interval '1 hour' END);
 IF n>=(CASE WHEN p='plus' THEN 10 ELSE 500 END) THEN RAISE EXCEPTION USING MESSAGE=CASE WHEN p='plus' THEN 'MP_QUOTA_EXHAUSTED' ELSE 'MP_ANTIABUSE_LIMIT' END,ERRCODE='P0001';END IF;
END$$;
CREATE FUNCTION public.bt_mp_info(p_workshop_id uuid,p_order_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a jsonb;s jsonb;problem text;docs jsonb;BEGIN
 a:=bt_multipunto_private.authorize(p_workshop_id);
 IF NOT EXISTS(SELECT 1 FROM public.work_orders WHERE workshop_id=p_workshop_id AND id=p_order_id) THEN RAISE EXCEPTION 'MP_RESOURCE_DENIED' USING ERRCODE='42501';END IF;
 BEGIN s:=bt_multipunto_private.capture(p_workshop_id,p_order_id);EXCEPTION WHEN SQLSTATE '55000' THEN GET STACKED DIAGNOSTICS problem=MESSAGE_TEXT;END;
 SELECT coalesce(jsonb_agg(to_jsonb(d)-'path'-'bucket' ORDER BY d.revision DESC),'[]') INTO docs FROM bt_multipunto_private.documents d WHERE d.workshop_id=p_workshop_id AND d.order_id=p_order_id;
 RETURN jsonb_build_object('version',2,'workshopId',p_workshop_id,'orderId',p_order_id,'plan',a->>'plan','canIssue',a->>'role' IN('owner','admin') AND a->>'plan'<>'basic',
 'nextRevision',(SELECT coalesce(max(revision),0)+1 FROM bt_multipunto_private.jobs WHERE workshop_id=p_workshop_id AND order_id=p_order_id),'orderStatus',s->'payload'->'order'->>'status','sourceHash',s->>'sourceHash','snapshotHash',s->>'snapshotHash','items',s->'payload'->'items','sourceProblem',problem,'originals',docs,'usage',(public.bt_commercial_status(p_workshop_id))->'usage'->'multipunto');
END$$;
CREATE FUNCTION public.bt_mp_prepare(p_workshop_id uuid,p_order_id uuid,p_request_id uuid,p_kind text,p_source_hash text,p_snapshot_hash text,p_max_additional_units integer,p_partial_ack boolean,p_credit_id uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a jsonb;s jsonb;snap bt_multipunto_private.snapshots;j bt_multipunto_private.jobs;c bt_commercial_private.consumption;binding bt_multipunto_private.credits;existing bt_multipunto_private.documents;cid uuid;rev bigint;counted integer;expiry timestamptz;BEGIN
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
  cid:=c.request_id;expiry:=c.expires_at;
 ELSE
  IF p_max_additional_units<>1 THEN RAISE EXCEPTION 'MP_CONSENT_REQUIRED' USING ERRCODE='22023';END IF;
  PERFORM bt_multipunto_private.charge_check(p_workshop_id);
  cid:=gen_random_uuid();expiry:=clock_timestamp()+interval '5 minutes';
  INSERT INTO bt_commercial_private.consumption(request_id,workshop_id,actor_id,capability,resource_id,state,reserved_at,expires_at,plan_at_reservation,snapshot_hash,session_id)
  VALUES(cid,p_workshop_id,(a->>'actor')::uuid,'multipunto',p_order_id,'reserved',clock_timestamp(),expiry,a->>'plan',p_snapshot_hash,a->>'session');
  INSERT INTO bt_multipunto_private.credits(credit_id,workshop_id,snapshot_id,authority) VALUES(cid,p_workshop_id,snap.id,a);
 END IF;
 SELECT coalesce(max(revision),0)+1 INTO rev FROM bt_multipunto_private.jobs WHERE workshop_id=p_workshop_id AND order_id=p_order_id;
 INSERT INTO bt_multipunto_private.jobs(id,workshop_id,order_id,snapshot_id,actor_id,session_id,authority,kind,credit_id,requested_credit_id,max_additional_units,partial_ack,lease_until,revision,state)
 VALUES(p_request_id,p_workshop_id,p_order_id,snap.id,(a->>'actor')::uuid,(a->>'session')::uuid,a,p_kind,cid,p_credit_id,p_max_additional_units,p_partial_ack,expiry,rev,'PREPARED') RETURNING * INTO j;
 INSERT INTO bt_multipunto_private.events(workshop_id,job_id,actor_id,action) VALUES(p_workshop_id,j.id,j.actor_id,'PREPARED');
 RETURN (to_jsonb(j)-'authority'-'session_id')||jsonb_build_object('additionalUnits',CASE WHEN p_credit_id IS NULL THEN 1 ELSE 0 END);
END$$;
CREATE FUNCTION public.bt_mp_worker(p_job_id uuid,p_generation bigint,p_action text,p_bytes bytea DEFAULT NULL,p_hash text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE j bt_multipunto_private.jobs;a bt_multipunto_private.artifacts;s bt_multipunto_private.snapshots;BEGIN
 IF current_setting('role',true)<>'service_role' THEN RAISE EXCEPTION 'MP_TRUSTED_REQUIRED' USING ERRCODE='42501';END IF;
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_job_id FOR UPDATE;
 IF j.id IS NULL OR j.generation<>p_generation OR j.lease_until<=clock_timestamp() OR j.state NOT IN('PREPARED','RENDERING','STAGED','ARCHIVE_VERIFIED') THEN RAISE EXCEPTION 'MP_WORKER_FENCED' USING ERRCODE='42501';END IF;
 IF p_action NOT IN('claim','stage','verified','failed') THEN RAISE EXCEPTION 'MP_INVALID_WORKER_ACTION' USING ERRCODE='22023';END IF;
 IF p_action='claim' AND j.state='PREPARED' THEN UPDATE bt_multipunto_private.jobs SET state='RENDERING' WHERE id=j.id RETURNING * INTO j;END IF;
 IF p_action='stage' THEN
  IF p_bytes IS NULL OR octet_length(p_bytes) NOT BETWEEN 12 AND 20000000 OR substring(p_bytes FROM 1 FOR 5)<>decode('255044462d','hex') OR position(convert_to('%%EOF','UTF8') IN substring(p_bytes FROM greatest(1,octet_length(p_bytes)-2048)))=0 THEN RAISE EXCEPTION 'MP_INVALID_PDF' USING ERRCODE='22023';END IF;
  IF p_hash IS NULL OR p_hash<>encode(extensions.digest(p_bytes,'sha256'),'hex') THEN RAISE EXCEPTION 'MP_INTEGRITY_ERROR' USING ERRCODE='22023';END IF;
  INSERT INTO bt_multipunto_private.artifacts(job_id,generation,workshop_id,pdf_bytes,pdf_hash,byte_length,path) VALUES(j.id,j.generation,j.workshop_id,p_bytes,p_hash,octet_length(p_bytes),
   CASE WHEN j.kind='final' THEN j.workshop_id||'/inspections/'||j.order_id||'/r'||j.revision||'/'||j.document_id||'/'||p_hash||'.pdf' ELSE NULL END) ON CONFLICT(job_id,generation) DO NOTHING;
  UPDATE bt_multipunto_private.jobs SET state=CASE WHEN state='ARCHIVE_VERIFIED' THEN state ELSE 'STAGED' END WHERE id=j.id RETURNING * INTO j;
 END IF;
 SELECT * INTO a FROM bt_multipunto_private.artifacts WHERE job_id=j.id AND generation=j.generation;
 IF p_action='verified' THEN
  IF j.kind<>'final' OR a.job_id IS NULL OR p_hash IS DISTINCT FROM a.pdf_hash OR j.state NOT IN('STAGED','ARCHIVE_VERIFIED') THEN RAISE EXCEPTION 'MP_INTEGRITY_ERROR' USING ERRCODE='22023';END IF;
  UPDATE bt_multipunto_private.artifacts SET verified_at=clock_timestamp() WHERE job_id=j.id AND generation=j.generation;
  UPDATE bt_multipunto_private.jobs SET state='ARCHIVE_VERIFIED' WHERE id=j.id RETURNING * INTO j;
 END IF;
 IF p_action='failed' THEN INSERT INTO bt_multipunto_private.events(workshop_id,job_id,actor_id,action) VALUES(j.workshop_id,j.id,j.actor_id,'RETRYABLE_FAILURE');END IF;
 SELECT * INTO s FROM bt_multipunto_private.snapshots WHERE id=j.snapshot_id;
 RETURN jsonb_build_object('job',to_jsonb(j)-'authority'-'session_id','snapshot',s.payload,'snapshotHash',s.snapshot_hash,'canonical',s.canonical,'artifact',CASE WHEN a.job_id IS NOT NULL THEN jsonb_build_object('hash',a.pdf_hash,'size',a.byte_length,'path',a.path,'bytes',encode(a.pdf_bytes,'hex')) ELSE NULL END);
END$$;
CREATE FUNCTION public.bt_mp_complete(p_workshop_id uuid,p_job_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE j bt_multipunto_private.jobs;a jsonb;source jsonb;s bt_multipunto_private.snapshots;artifact bt_multipunto_private.artifacts;c bt_commercial_private.consumption;d bt_multipunto_private.documents;t timestamptz;BEGIN
 a:=bt_multipunto_private.authorize(p_workshop_id,true,false,true);
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_job_id;
 IF j.id IS NULL OR j.workshop_id<>p_workshop_id OR j.actor_id<>(a->>'actor')::uuid THEN RAISE EXCEPTION 'MP_RESOURCE_DENIED' USING ERRCODE='42501';END IF;
 PERFORM bt_multipunto_private.lock_scope(j.workshop_id,j.order_id);
 a:=bt_multipunto_private.authorize(p_workshop_id,true,j.kind='final',true);
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_job_id FOR UPDATE;
 IF j.state='ISSUED' THEN SELECT * INTO d FROM bt_multipunto_private.documents WHERE id=j.document_id;RETURN jsonb_build_object('state','ISSUED','document',to_jsonb(d)-'path'-'bucket');END IF;
 IF j.state='DRAFT_CONFIRMED' THEN RETURN jsonb_build_object('state',j.state,'creditId',j.credit_id);END IF;
 IF j.authority<>a THEN UPDATE bt_multipunto_private.jobs SET state='DENIED' WHERE id=j.id;RETURN jsonb_build_object('state','DENIED','error','MP_RENEW_REQUIRED');END IF;
 IF j.lease_until<=clock_timestamp() THEN UPDATE bt_multipunto_private.jobs SET state='EXPIRED' WHERE id=j.id;RETURN jsonb_build_object('state','EXPIRED','error','MP_RENEW_REQUIRED');END IF;
 SELECT * INTO s FROM bt_multipunto_private.snapshots WHERE id=j.snapshot_id;
 source:=bt_multipunto_private.capture(j.workshop_id,j.order_id);
 IF source->>'snapshotHash'<>s.snapshot_hash OR source->>'sourceHash'<>s.source_hash THEN UPDATE bt_multipunto_private.jobs SET state='SOURCE_CHANGED' WHERE id=j.id;RETURN jsonb_build_object('state','SOURCE_CHANGED','error','MP_SOURCE_CHANGED');END IF;
 SELECT * INTO artifact FROM bt_multipunto_private.artifacts WHERE job_id=j.id AND generation=j.generation;
 IF artifact.job_id IS NULL OR j.kind='final' AND (j.state<>'ARCHIVE_VERIFIED' OR artifact.verified_at IS NULL) THEN RAISE EXCEPTION 'MP_ARCHIVE_NOT_VERIFIED' USING ERRCODE='55000';END IF;
 SELECT * INTO c FROM bt_commercial_private.consumption WHERE request_id=j.credit_id FOR UPDATE;
 t:=clock_timestamp();
 IF c.expires_at<=t OR j.lease_until<=t OR c.state NOT IN('reserved','confirmed') OR c.actor_id<>j.actor_id OR c.session_id<>j.session_id::text OR c.snapshot_hash<>s.snapshot_hash OR c.plan_at_reservation<>a->>'plan' THEN RAISE EXCEPTION 'MP_RENEW_REQUIRED' USING ERRCODE='42501';END IF;
 IF c.state='reserved' THEN PERFORM bt_multipunto_private.charge_check(j.workshop_id,c.request_id);END IF;
 -- Last protected authorization point uses real time after all waits.
 IF bt_multipunto_private.authorize(p_workshop_id,true,j.kind='final',true)<>a THEN RAISE EXCEPTION 'MP_RENEW_REQUIRED' USING ERRCODE='42501';END IF;
 IF c.expires_at<=clock_timestamp() THEN RAISE EXCEPTION 'MP_RENEW_REQUIRED' USING ERRCODE='42501';END IF;
 IF j.kind='final' THEN
  SELECT * INTO d FROM bt_multipunto_private.documents WHERE workshop_id=j.workshop_id AND order_id=j.order_id AND snapshot_id=j.snapshot_id;
  IF d.id IS NOT NULL THEN
   IF c.state='reserved' THEN UPDATE bt_commercial_private.consumption SET state='failed' WHERE request_id=c.request_id;END IF;
  ELSE
   INSERT INTO bt_multipunto_private.documents(id,workshop_id,order_id,snapshot_id,revision,credit_id,issuer,pdf_hash,byte_length,bucket,path,document_date,confirmed_at)
   VALUES(j.document_id,j.workshop_id,j.order_id,j.snapshot_id,j.revision,j.credit_id,j.actor_id,artifact.pdf_hash,artifact.byte_length,'bt-inspection-documents',artifact.path,j.created_at,clock_timestamp()) RETURNING * INTO d;
   UPDATE bt_multipunto_private.credits SET final_document_id=d.id WHERE credit_id=c.request_id;
   IF c.state='reserved' THEN UPDATE bt_commercial_private.consumption SET state='confirmed',confirmed_at=clock_timestamp(),document_bytes=NULL WHERE request_id=c.request_id;END IF;
  END IF;
  UPDATE bt_multipunto_private.jobs SET state='ISSUED',document_id=d.id WHERE id=j.id;
 ELSE
  -- Only marked draft bytes can enter the legacy draft-cache column; final bytes never do.
  IF c.state='reserved' THEN UPDATE bt_commercial_private.consumption SET state='confirmed',confirmed_at=clock_timestamp(),document_bytes=artifact.pdf_bytes WHERE request_id=c.request_id;END IF;
  UPDATE bt_multipunto_private.jobs SET state='DRAFT_CONFIRMED' WHERE id=j.id;
 END IF;
 INSERT INTO bt_multipunto_private.events(workshop_id,job_id,actor_id,action) VALUES(j.workshop_id,j.id,j.actor_id,CASE WHEN j.kind='final' THEN 'ISSUED' ELSE 'DRAFT_CONFIRMED' END);
 RETURN jsonb_build_object('state',CASE WHEN j.kind='final' THEN 'ISSUED' ELSE 'DRAFT_CONFIRMED' END,'creditId',j.credit_id,'document',CASE WHEN d.id IS NOT NULL THEN to_jsonb(d)-'path'-'bucket' ELSE NULL END);
END$$;
CREATE FUNCTION public.bt_mp_status(p_workshop_id uuid,p_job_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a jsonb;j bt_multipunto_private.jobs;BEGIN
 a:=bt_multipunto_private.authorize(p_workshop_id);
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_job_id AND workshop_id=p_workshop_id AND actor_id=(a->>'actor')::uuid;
 IF j.id IS NULL THEN RAISE EXCEPTION 'MP_RESOURCE_DENIED' USING ERRCODE='42501';END IF;
 RETURN to_jsonb(j)-'authority'-'session_id';
END$$;
CREATE FUNCTION public.bt_mp_read(p_workshop_id uuid,p_order_id uuid,p_document_id uuid DEFAULT NULL,p_job_id uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a jsonb;d bt_multipunto_private.documents;j bt_multipunto_private.jobs;artifact bt_multipunto_private.artifacts;c bt_commercial_private.consumption;BEGIN
 a:=bt_multipunto_private.authorize(p_workshop_id,false,false,true);
 IF (p_document_id IS NULL)=(p_job_id IS NULL) THEN RAISE EXCEPTION 'MP_INVALID_REQUEST' USING ERRCODE='22023';END IF;
 IF p_document_id IS NOT NULL THEN
  SELECT * INTO d FROM bt_multipunto_private.documents WHERE id=p_document_id AND workshop_id=p_workshop_id AND order_id=p_order_id;
  IF d.id IS NULL THEN RAISE EXCEPTION 'MP_ORIGINAL_MISSING' USING ERRCODE='P0002';END IF;
  RETURN jsonb_build_object('kind','final','document',to_jsonb(d));
 END IF;
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_job_id AND workshop_id=p_workshop_id AND order_id=p_order_id AND kind='draft' AND state='DRAFT_CONFIRMED' AND actor_id=(a->>'actor')::uuid;
 IF j.id IS NULL OR j.authority IS DISTINCT FROM a THEN RAISE EXCEPTION 'MP_RENEW_REQUIRED' USING ERRCODE='42501';END IF;
 SELECT * INTO c FROM bt_commercial_private.consumption WHERE request_id=j.credit_id;
 IF c.state<>'confirmed' OR c.expires_at<=clock_timestamp() THEN RAISE EXCEPTION 'MP_RENEW_REQUIRED' USING ERRCODE='42501';END IF;
 SELECT * INTO artifact FROM bt_multipunto_private.artifacts WHERE job_id=j.id AND generation=j.generation;
 RETURN jsonb_build_object('kind','draft','bytes',encode(artifact.pdf_bytes,'hex'),'hash',artifact.pdf_hash,'size',artifact.byte_length);
END$$;
CREATE FUNCTION public.bt_mp_renew(p_workshop_id uuid,p_job_id uuid,p_max_additional_units integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE j bt_multipunto_private.jobs;a jsonb;c bt_commercial_private.consumption;s bt_multipunto_private.snapshots;source jsonb;t timestamptz;BEGIN
 IF p_max_additional_units IS DISTINCT FROM 1 THEN RAISE EXCEPTION 'MP_CONSENT_REQUIRED' USING ERRCODE='22023';END IF;
 a:=bt_multipunto_private.authorize(p_workshop_id,true,false,true);
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_job_id AND workshop_id=p_workshop_id AND actor_id=(a->>'actor')::uuid;
 IF j.id IS NULL THEN RAISE EXCEPTION 'MP_RESOURCE_DENIED' USING ERRCODE='42501';END IF;
 PERFORM bt_multipunto_private.lock_scope(j.workshop_id,j.order_id);
 a:=bt_multipunto_private.authorize(p_workshop_id,true,j.kind='final',true);
 SELECT * INTO j FROM bt_multipunto_private.jobs WHERE id=p_job_id FOR UPDATE;
 SELECT * INTO c FROM bt_commercial_private.consumption WHERE request_id=j.credit_id FOR UPDATE;
 IF c.state='confirmed' OR j.state IN('ISSUED','DRAFT_CONFIRMED') THEN RAISE EXCEPTION 'MP_CONFIRMED_OPERATION_NOT_RENEWABLE' USING ERRCODE='42501';END IF;
 IF j.lease_until>clock_timestamp() AND j.authority=a THEN RAISE EXCEPTION 'MP_LEASE_STILL_VALID' USING ERRCODE='22023';END IF;
 SELECT * INTO s FROM bt_multipunto_private.snapshots WHERE id=j.snapshot_id;source:=bt_multipunto_private.capture(j.workshop_id,j.order_id);
 IF source->>'snapshotHash'<>s.snapshot_hash OR source->>'sourceHash'<>s.source_hash THEN RAISE EXCEPTION 'MP_SOURCE_CHANGED' USING ERRCODE='40001';END IF;
 PERFORM bt_multipunto_private.charge_check(j.workshop_id,c.request_id);t:=clock_timestamp();
 UPDATE bt_commercial_private.consumption SET state='reserved',reserved_at=t,expires_at=t+interval '5 minutes',confirmed_at=NULL,document_bytes=NULL,session_id=a->>'session',plan_at_reservation=a->>'plan' WHERE request_id=c.request_id;
 UPDATE bt_multipunto_private.credits SET authority=a WHERE credit_id=c.request_id;
 UPDATE bt_multipunto_private.jobs SET state='PREPARED',session_id=(a->>'session')::uuid,authority=a,generation=generation+1,lease_until=t+interval '5 minutes',created_at=t,document_id=gen_random_uuid() WHERE id=j.id RETURNING * INTO j;
 INSERT INTO bt_multipunto_private.events(workshop_id,job_id,actor_id,action) VALUES(j.workshop_id,j.id,j.actor_id,'EXPLICIT_UNCONSUMED_RENEWAL');
 RETURN to_jsonb(j)-'authority'-'session_id';
END$$;
REVOKE ALL ON FUNCTION public.bt_mp_renew(uuid,uuid,integer) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.bt_mp_renew(uuid,uuid,integer) TO authenticated;

-- V1 keeps its existing behavior for V1 IDs. It must not renew, finish or read V2 credits.
-- Preserve existing ownership/ACL and refuse source drift rather than replacing unknown code.
DO $compat$
DECLARE sig text;expected text;definition text;body text;guard text;
BEGIN
 FOR sig,expected IN SELECT * FROM (VALUES
 ('public.bt_commercial_reserve(uuid,text,uuid,uuid,text)','2b3386a0be11961a72d6c648af921c10'),
 ('public.bt_commercial_finish(uuid,uuid,boolean,bytea)','46c51b64e9a32457d20a949ba5ffe5f1'),
 ('public.bt_commercial_cached(uuid,uuid)','0df80dda8962a4e15757d1781fc719a8')) x(signature,source_hash) LOOP
  SELECT pg_get_functiondef(p.oid),p.prosrc INTO definition,body FROM pg_proc p WHERE p.oid=sig::regprocedure;
  IF md5(body)<>expected THEN RAISE EXCEPTION 'MP_V1_SOURCE_DRIFT: %',sig;END IF;
  guard:='BEGIN IF EXISTS(SELECT 1 FROM bt_multipunto_private.credits WHERE credit_id=p_request_id) THEN RAISE EXCEPTION ''MP_V2_ENDPOINT_REQUIRED'' USING ERRCODE=''42501'';END IF; ';
  definition:=replace(definition,body,regexp_replace(body,'\mBEGIN\M',guard));
  EXECUTE definition;
 END LOOP;
END $compat$;

-- Retain all data on rollback. These controls are privileged, not a client capability.
CREATE FUNCTION bt_multipunto_private.immutable() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$BEGIN RAISE EXCEPTION 'MP_IMMUTABLE' USING ERRCODE='42501';END$$;
CREATE TRIGGER mp_document_immutable BEFORE UPDATE OR DELETE ON bt_multipunto_private.documents FOR EACH ROW EXECUTE FUNCTION bt_multipunto_private.immutable();
CREATE TRIGGER mp_snapshot_immutable BEFORE UPDATE OR DELETE ON bt_multipunto_private.snapshots FOR EACH ROW EXECUTE FUNCTION bt_multipunto_private.immutable();
CREATE TRIGGER mp_policy_immutable BEFORE UPDATE OR DELETE ON bt_multipunto_private.policy FOR EACH ROW EXECUTE FUNCTION bt_multipunto_private.immutable();
CREATE TRIGGER mp_events_immutable BEFORE UPDATE OR DELETE ON bt_multipunto_private.events FOR EACH ROW EXECUTE FUNCTION bt_multipunto_private.immutable();
DO $$DECLARE t text;BEGIN
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='bt_multipunto_private' LOOP
  EXECUTE format('ALTER TABLE bt_multipunto_private.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE bt_multipunto_private.%I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON bt_multipunto_private.%I FROM PUBLIC,anon,authenticated,service_role',t);
 END LOOP;
END$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA bt_multipunto_private FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.bt_mp_info(uuid,uuid),public.bt_mp_prepare(uuid,uuid,uuid,text,text,text,integer,boolean,uuid),public.bt_mp_complete(uuid,uuid),public.bt_mp_status(uuid,uuid),public.bt_mp_read(uuid,uuid,uuid,uuid),public.bt_mp_worker(uuid,bigint,text,bytea,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.bt_mp_info(uuid,uuid),public.bt_mp_prepare(uuid,uuid,uuid,text,text,text,integer,boolean,uuid),public.bt_mp_complete(uuid,uuid),public.bt_mp_status(uuid,uuid),public.bt_mp_read(uuid,uuid,uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bt_mp_worker(uuid,bigint,text,bytea,text) TO service_role;
-- Bucket configuration belongs to a separately approved installation. The restrictive
-- policy also denies authenticated reads/signing even if another policy is permissive.
CREATE POLICY mp_no_client_storage ON storage.objects AS RESTRICTIVE FOR ALL TO anon,authenticated USING(bucket_id<>'bt-inspection-documents') WITH CHECK(bucket_id<>'bt-inspection-documents');
COMMIT;
