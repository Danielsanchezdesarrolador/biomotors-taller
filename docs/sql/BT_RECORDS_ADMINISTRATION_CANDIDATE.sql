-- BT-REG-01 CANDIDATE ONLY — local synthetic validation; NOT applied to hosted Supabase.
-- Requires CP03, CP04, CP05; optional downstream FKs are discovered from pg_constraint.
-- Installation does NOT enable the feature: private per-workshop rollout defaults OFF.
BEGIN;
CREATE SCHEMA bt_records_private;
REVOKE ALL ON SCHEMA bt_records_private FROM PUBLIC,anon,authenticated,service_role;
GRANT USAGE ON SCHEMA bt_records_private TO authenticated;
CREATE TABLE bt_records_private.rollout (
 workshop_id uuid PRIMARY KEY REFERENCES public.workshops(id) ON DELETE RESTRICT,
 enabled boolean NOT NULL DEFAULT false
);
-- Deliberately no resource FK: deleting an eligible empty record must preserve its audit.
CREATE TABLE bt_records_private.events (
 sequence bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE RESTRICT,
 resource text NOT NULL CHECK(resource IN ('customers','vehicles','work_orders','quotes')),
 resource_id uuid NOT NULL, action text NOT NULL,
 actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 request_id uuid, input jsonb, result jsonb, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(workshop_id,request_id)
);
CREATE INDEX bt_records_resource_events ON bt_records_private.events(workshop_id,resource,resource_id,sequence DESC);
ALTER TABLE bt_records_private.rollout ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_records_private.rollout FORCE ROW LEVEL SECURITY;
ALTER TABLE bt_records_private.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_records_private.events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA bt_records_private FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA bt_records_private FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER bt_records_events_immutable BEFORE UPDATE OR DELETE ON bt_records_private.events
 FOR EACH ROW EXECUTE FUNCTION bt_cp05_private.immutable();
ALTER TABLE public.work_orders ADD COLUMN cancelled_at timestamptz,
 ADD COLUMN cancel_reason text CHECK(cancel_reason IS NULL OR char_length(btrim(cancel_reason)) BETWEEN 3 AND 500),
 ADD CONSTRAINT bt_records_cancel_state CHECK((cancelled_at IS NULL AND cancel_reason IS NULL) OR
 (cancelled_at IS NOT NULL AND cancel_reason IS NOT NULL AND status='closed'));

-- Extend only the immutable closed-row guard for owner/admin cancellation metadata.
-- These two columns have no authenticated UPDATE grant; every ordinary closed edit stays forbidden.
CREATE OR REPLACE FUNCTION public.bt_cp04_order_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
BEGIN
 IF OLD.status='closed' THEN
  IF OLD.cancelled_at IS NULL AND NEW.cancelled_at IS NOT NULL AND NEW.status='closed'
    AND (to_jsonb(NEW)-ARRAY['cancelled_at','cancel_reason','updated_at'])=
        (to_jsonb(OLD)-ARRAY['cancelled_at','cancel_reason','updated_at']) THEN RETURN NEW; END IF;
  RAISE EXCEPTION 'ORDER_IS_CLOSED' USING ERRCODE='23514';
 END IF;
 IF NEW.vehicle_id<>OLD.vehicle_id OR NEW.opened_by<>OLD.opened_by OR NEW.opened_at<>OLD.opened_at OR
 NEW.workshop_id<>OLD.workshop_id OR NEW.id<>OLD.id THEN RAISE EXCEPTION 'ORDER_KEYS_IMMUTABLE' USING ERRCODE='23514'; END IF;
 IF NEW.status='closed' THEN NEW.closed_at:=statement_timestamp(); ELSE NEW.closed_at:=NULL; END IF;
 RETURN NEW;
END $$;

-- Reception keeps normal edits, but may not bypass the new audited archive command.
REVOKE UPDATE(archived_at) ON public.customers,public.vehicles FROM authenticated;

CREATE FUNCTION bt_records_private.authorize(wid uuid, management boolean DEFAULT true)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM auth.users u JOIN public.workshop_memberships m ON m.user_id=u.id
 JOIN public.workshops w ON w.id=m.workshop_id WHERE u.id=auth.uid() AND u.email_confirmed_at IS NOT NULL
 AND m.workshop_id=wid AND m.status='active' AND w.status='active'
 AND (NOT management OR m.role IN ('owner','admin'))) THEN
 RAISE EXCEPTION 'RECORDS_DENIED' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM bt_records_private.rollout WHERE workshop_id=wid AND enabled) THEN
 RAISE EXCEPTION 'RECORDS_DISABLED' USING ERRCODE='55000'; END IF;
END $$;

-- All FK edges, including private/optional modules and future CASCADE edges, count.
-- Never execute a cascading delete: unknown dependencies fail closed.
CREATE FUNCTION bt_records_private.dependencies(wid uuid, resource text, rid uuid)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE fk record; predicate text; hits bigint; total bigint:=0;
BEGIN
 IF resource NOT IN ('customers','vehicles','work_orders','quotes','quote_items') THEN RAISE EXCEPTION 'RECORDS_INVALID' USING ERRCODE='22023'; END IF;
 FOR fk IN SELECT c.oid,c.conrelid,c.conkey,c.confkey,n.nspname,t.relname
 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace
 WHERE c.contype='f' AND c.confrelid=('public.'||resource)::regclass LOOP
  -- Mutable draft line items are explicitly removed, never immutable history.
  IF resource='quotes' AND fk.conrelid='public.quote_items'::regclass THEN
   -- An editable line is removable only if nothing references that line either.
   FOR hits IN SELECT bt_records_private.dependencies(wid,'quote_items',i.id)
    FROM public.quote_items i WHERE i.workshop_id=wid AND i.quote_id=rid LOOP total:=total+hits; END LOOP;
   CONTINUE;
  END IF;
  SELECT string_agg(format('child.%I = parent.%I',a.attname,b.attname),' AND ' ORDER BY k.ord)
  INTO predicate FROM unnest(fk.conkey,fk.confkey) WITH ORDINALITY k(childkey,parentkey,ord)
  JOIN pg_attribute a ON a.attrelid=fk.conrelid AND a.attnum=k.childkey
  JOIN pg_attribute b ON b.attrelid=('public.'||resource)::regclass AND b.attnum=k.parentkey;
  EXECUTE format('SELECT count(*) FROM %I.%I child JOIN public.%I parent ON %s WHERE parent.workshop_id=$1 AND parent.id=$2',
    fk.nspname,fk.relname,resource,predicate) INTO hits USING wid,rid;
  total:=total+hits;
 END LOOP;
 RETURN total;
END $$;

CREATE FUNCTION bt_records_private.inspect_record(wid uuid, resource text, rid uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE data jsonb; deps bigint; actions text[]:=ARRAY[]::text[]; inherited boolean:=false; items bigint:=0; token text;
BEGIN
 PERFORM bt_records_private.authorize(wid);
 IF resource NOT IN ('customers','vehicles','work_orders','quotes') THEN RAISE EXCEPTION 'RECORDS_INVALID' USING ERRCODE='22023'; END IF;
 EXECUTE format('SELECT to_jsonb(t) FROM public.%I t WHERE workshop_id=$1 AND id=$2 FOR UPDATE',resource) INTO data USING wid,rid;
 IF data IS NULL THEN RAISE EXCEPTION 'RECORDS_NOT_FOUND' USING ERRCODE='42501'; END IF;
 token:=CASE WHEN resource='quotes' THEN data->>'version' ELSE data->>'updated_at' END;
 deps:=bt_records_private.dependencies(wid,resource,rid);
 IF resource IN ('customers','vehicles') THEN
  IF resource='vehicles' THEN SELECT c.archived_at IS NOT NULL INTO inherited FROM public.customers c
    WHERE c.workshop_id=wid AND c.id=(data->>'customer_id')::uuid FOR KEY SHARE; END IF;
  IF data->>'archived_at' IS NOT NULL THEN
   IF NOT inherited THEN actions:=ARRAY['restore']; END IF;
  ELSE
   actions:=ARRAY['archive'];
   IF deps=0 THEN actions:=ARRAY['delete']; END IF;
  END IF;
 ELSIF resource='work_orders' THEN
  IF data->>'cancelled_at' IS NULL THEN
   IF deps=0 AND data->>'status'='received' AND (data->>'updated_at')::timestamptz=(data->>'opened_at')::timestamptz AND NOT EXISTS(SELECT 1 FROM bt_records_private.events
    WHERE workshop_id=wid AND resource_id=rid AND bt_records_private.events.resource='work_orders' AND action='activity') THEN
    actions:=ARRAY['delete'];
   ELSE actions:=ARRAY['cancel']; END IF;
  END IF;
 ELSE
  SELECT count(*) INTO items FROM public.quote_items WHERE workshop_id=wid AND quote_id=rid;
  IF NOT (data->>'issue_pending')::boolean THEN
   IF data->>'status'='draft' AND (data->>'issued_revision')::integer=0 AND deps=0 THEN actions:=ARRAY['delete'];
   ELSIF data->>'status'='issued' THEN actions:=ARRAY['void']; END IF;
  END IF;
 END IF;
 IF EXISTS(SELECT 1 FROM public.quotes q WHERE q.workshop_id=wid AND q.issue_pending AND
  ((resource='customers' AND q.customer_id=rid) OR (resource='vehicles' AND q.vehicle_id=rid) OR
   (resource='work_orders' AND q.order_id=rid) OR (resource='quotes' AND q.id=rid))) THEN actions:=ARRAY[]::text[]; END IF;
 RETURN jsonb_build_object('id',rid,'resource',resource,'token',token,'dependencies',deps,'draft_items',items,
  'actions',to_jsonb(actions),'inherited_archive',inherited);
EXCEPTION WHEN OTHERS THEN
 RAISE EXCEPTION 'RECORDS_OPERATION_FAILED' USING ERRCODE=SQLSTATE;
END $$;

CREATE FUNCTION bt_records_private.execute_record(wid uuid, resource text, rid uuid, action text, token text, request uuid, reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE preview jsonb; answer jsonb; old bt_records_private.events;
 input jsonb:=jsonb_build_object('resource',resource,'id',rid,'action',action,'token',token,'reason',reason);
BEGIN
 PERFORM bt_records_private.authorize(wid);
 IF request IS NULL OR token IS NULL OR reason IS NULL OR char_length(btrim(reason)) NOT BETWEEN 3 AND 500 THEN
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
END $$;

CREATE FUNCTION bt_records_private.list_records(wid uuid, resource text, archived boolean, query text, after_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE answer jsonb;
BEGIN
 PERFORM bt_records_private.authorize(wid);
 IF query IS NULL OR char_length(query)>80 THEN RAISE EXCEPTION 'RECORDS_INVALID' USING ERRCODE='22023'; END IF;
 IF resource='customers' THEN
  SELECT coalesce(jsonb_agg(x),'[]') INTO answer FROM (SELECT id,full_name AS label,
   CASE WHEN archived_at IS NULL THEN 'active' ELSE 'archived' END AS state,updated_at::text AS token
   FROM public.customers WHERE workshop_id=wid AND (archived_at IS NOT NULL)=archived AND (after_id IS NULL OR id>after_id)
   AND (query='' OR position(lower(query) in lower(full_name))>0) ORDER BY id LIMIT 51) x;
 ELSIF resource='vehicles' THEN
  SELECT coalesce(jsonb_agg(x),'[]') INTO answer FROM (SELECT v.id,concat_ws(' · ',v.plate,v.make,v.model) AS label,
   CASE WHEN v.archived_at IS NOT NULL THEN 'archived' WHEN c.archived_at IS NOT NULL THEN 'parent_archived' ELSE 'active' END AS state,v.updated_at::text AS token
   FROM public.vehicles v JOIN public.customers c ON c.workshop_id=v.workshop_id AND c.id=v.customer_id
   WHERE v.workshop_id=wid AND ((v.archived_at IS NOT NULL OR c.archived_at IS NOT NULL)=archived)
   AND (after_id IS NULL OR v.id>after_id) AND (query='' OR position(lower(query) in lower(concat_ws(' ',v.plate,v.make,v.model)))>0) ORDER BY v.id LIMIT 51) x;
 ELSIF resource='work_orders' THEN
  SELECT coalesce(jsonb_agg(x),'[]') INTO answer FROM (SELECT id,complaint AS label,
   CASE WHEN cancelled_at IS NOT NULL THEN 'cancelled' ELSE status END AS state,updated_at::text AS token
   FROM public.work_orders WHERE workshop_id=wid AND (cancelled_at IS NOT NULL)=archived AND (after_id IS NULL OR id>after_id)
   AND (query='' OR position(lower(query) in lower(complaint))>0) ORDER BY id LIMIT 51) x;
 ELSIF resource='quotes' THEN
  SELECT coalesce(jsonb_agg(x),'[]') INTO answer FROM (SELECT id,'Cotización '||number AS label,status AS state,version::text AS token
   FROM public.quotes WHERE workshop_id=wid AND (status='voided')=archived AND (after_id IS NULL OR id>after_id)
   AND (query='' OR position(lower(query) in lower('Cotización '||number))>0) ORDER BY id LIMIT 51) x;
 ELSE RAISE EXCEPTION 'RECORDS_INVALID' USING ERRCODE='22023'; END IF;
 RETURN answer;
EXCEPTION WHEN OTHERS THEN
 RAISE EXCEPTION 'RECORDS_OPERATION_FAILED' USING ERRCODE=SQLSTATE;
END $$;

CREATE FUNCTION bt_records_private.audit_records(wid uuid, resource text, rid uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 PERFORM bt_records_private.authorize(wid);
 RETURN (SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT sequence,resource_id,action,actor_id,created_at,
  input->>'reason' AS reason FROM bt_records_private.events WHERE workshop_id=wid AND bt_records_private.events.resource=audit_records.resource
  AND (rid IS NULL OR resource_id=rid) ORDER BY sequence DESC LIMIT 50) x);
EXCEPTION WHEN OTHERS THEN
 RAISE EXCEPTION 'RECORDS_OPERATION_FAILED' USING ERRCODE=SQLSTATE;
END $$;

-- Source guards protect direct Data API / old RPC calls, not only selectors.
CREATE FUNCTION bt_records_private.source_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE cid uuid; vid uuid; oid uuid;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM bt_records_private.rollout WHERE workshop_id=NEW.workshop_id AND enabled) THEN RETURN NEW; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.workshop_id::text,704));
 IF TG_TABLE_NAME='vehicles' THEN
  -- Restoring/editing an archived vehicle is handled by the manager; forbid
  -- reparenting or creating an active vehicle under an archived customer.
  cid:=NEW.customer_id;
 ELSIF TG_TABLE_NAME='work_orders' THEN
  IF TG_OP='UPDATE' AND NEW.cancelled_at IS NOT NULL THEN RETURN NEW; END IF;
  vid:=NEW.vehicle_id;
 ELSIF TG_TABLE_NAME='quotes' THEN
  IF TG_OP='UPDATE' AND OLD.status='voided' AND NEW.status<>'voided' THEN PERFORM bt_records_private.authorize(NEW.workshop_id); END IF;
  IF TG_OP='UPDATE' AND NEW.status='voided' THEN
   PERFORM bt_records_private.authorize(NEW.workshop_id); RETURN NEW;
  END IF;
  oid:=NEW.order_id; vid:=NEW.vehicle_id;
 ELSE oid:=(to_jsonb(NEW)->>'order_id')::uuid; vid:=(to_jsonb(NEW)->>'vehicle_id')::uuid;
 END IF;
 IF oid IS NOT NULL THEN
  SELECT vehicle_id INTO vid FROM public.work_orders WHERE workshop_id=NEW.workshop_id AND id=oid AND cancelled_at IS NULL FOR KEY SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'RECORDS_SOURCE_INACTIVE' USING ERRCODE='23514'; END IF;
 END IF;
 IF vid IS NOT NULL THEN
  SELECT customer_id INTO cid FROM public.vehicles WHERE workshop_id=NEW.workshop_id AND id=vid AND archived_at IS NULL FOR KEY SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'RECORDS_SOURCE_INACTIVE' USING ERRCODE='23514'; END IF;
 END IF;
 IF cid IS NOT NULL THEN
  PERFORM 1 FROM public.customers WHERE workshop_id=NEW.workshop_id AND id=cid AND archived_at IS NULL FOR KEY SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'RECORDS_SOURCE_INACTIVE' USING ERRCODE='23514'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER bt_records_vehicle_source BEFORE INSERT OR UPDATE OF customer_id ON public.vehicles
 FOR EACH ROW EXECUTE FUNCTION bt_records_private.source_guard();
CREATE TRIGGER bt_records_order_source BEFORE INSERT OR UPDATE ON public.work_orders
 FOR EACH ROW EXECUTE FUNCTION bt_records_private.source_guard();
CREATE TRIGGER bt_records_quote_source BEFORE INSERT OR UPDATE ON public.quotes
 FOR EACH ROW EXECUTE FUNCTION bt_records_private.source_guard();
CREATE TRIGGER bt_records_finding_source BEFORE INSERT ON public.inspection_findings
 FOR EACH ROW EXECUTE FUNCTION bt_records_private.source_guard();
-- Existing downstream operational modules also reject new work on inactive visits.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['bt_flow_quote_approvals','bt_flow_execution_reports','bt_flow_visit_deliveries'] LOOP
  IF to_regclass('public.'||t) IS NOT NULL THEN EXECUTE format('CREATE TRIGGER bt_records_source BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION bt_records_private.source_guard()',t); END IF;
 END LOOP;
END $$;
CREATE FUNCTION bt_records_private.order_activity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF NEW.status IS DISTINCT FROM OLD.status OR NEW.complaint IS DISTINCT FROM OLD.complaint OR NEW.intake_odometer IS DISTINCT FROM OLD.intake_odometer THEN
 INSERT INTO bt_records_private.events(workshop_id,resource,resource_id,action,actor_id)
 VALUES(NEW.workshop_id,'work_orders',NEW.id,'activity',coalesce(auth.uid(),NEW.opened_by)); END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER bt_records_order_activity AFTER UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION bt_records_private.order_activity();

CREATE FUNCTION bt_records_private.quote_activity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 INSERT INTO bt_records_private.events(workshop_id,resource,resource_id,action,actor_id)
 VALUES(NEW.workshop_id,'work_orders',NEW.order_id,'activity',NEW.created_by);
 RETURN NEW;
END $$;
CREATE TRIGGER bt_records_quote_activity AFTER INSERT ON public.quotes FOR EACH ROW EXECUTE FUNCTION bt_records_private.quote_activity();

-- Public wrappers are invokers; only fixed, audited private entrypoints executable.
CREATE FUNCTION public.bt_records_list(p_workshop_id uuid,p_resource text,p_archived boolean,p_query text,p_after_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_records_private.list_records(p_workshop_id,p_resource,p_archived,p_query,p_after_id) $$;
CREATE FUNCTION public.bt_records_inspect(p_workshop_id uuid,p_resource text,p_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_records_private.inspect_record(p_workshop_id,p_resource,p_id) $$;
CREATE FUNCTION public.bt_records_execute(p_workshop_id uuid,p_resource text,p_id uuid,p_action text,p_token text,p_request_id uuid,p_reason text)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_records_private.execute_record(p_workshop_id,p_resource,p_id,p_action,p_token,p_request_id,p_reason) $$;
CREATE FUNCTION public.bt_records_audit(p_workshop_id uuid,p_resource text,p_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_records_private.audit_records(p_workshop_id,p_resource,p_id) $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA bt_records_private FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION bt_records_private.list_records(uuid,text,boolean,text,uuid),bt_records_private.inspect_record(uuid,text,uuid),
 bt_records_private.execute_record(uuid,text,uuid,text,text,uuid,text),bt_records_private.audit_records(uuid,text,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.bt_records_list(uuid,text,boolean,text,uuid),public.bt_records_inspect(uuid,text,uuid),
 public.bt_records_execute(uuid,text,uuid,text,text,uuid,text),public.bt_records_audit(uuid,text,uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.bt_records_list(uuid,text,boolean,text,uuid),public.bt_records_inspect(uuid,text,uuid),
 public.bt_records_execute(uuid,text,uuid,text,text,uuid,text),public.bt_records_audit(uuid,text,uuid) TO authenticated;
COMMIT;
