-- CP05 CANDIDATE ONLY. No hosted execution, Storage, Edge, SMTP or secrets.
-- SECURITY DEFINER is confined to this private schema: atomic sequence/commands,
-- immutable archives and server-derived identity cannot be enforced by client writes.
BEGIN;
CREATE SCHEMA bt_cp05_private;
REVOKE ALL ON SCHEMA bt_cp05_private FROM PUBLIC,anon;
GRANT USAGE ON SCHEMA bt_cp05_private TO authenticated,service_role;
CREATE TABLE public.quotes (
 workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE RESTRICT,
 id uuid NOT NULL DEFAULT gen_random_uuid(), order_id uuid NOT NULL,vehicle_id uuid NOT NULL,customer_id uuid NOT NULL,
 number bigint NOT NULL CHECK(number BETWEEN 1 AND 1000000000000),version bigint NOT NULL DEFAULT 1 CHECK(version BETWEEN 1 AND 1000000000000),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','issued','voided')),
 price_basis text NOT NULL DEFAULT 'net' CHECK(price_basis='net'),valid_days integer NOT NULL DEFAULT 10 CHECK(valid_days BETWEEN 1 AND 365),
 terms text NOT NULL DEFAULT '' CHECK(char_length(terms)<=2000),comments text NOT NULL DEFAULT '' CHECK(char_length(comments)<=2000),
 issued_revision integer NOT NULL DEFAULT 0 CHECK(issued_revision>=0),issue_pending boolean NOT NULL DEFAULT false,
 void_reason text CHECK(void_reason IS NULL OR char_length(btrim(void_reason)) BETWEEN 3 AND 1000),
 created_by uuid NOT NULL REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(workshop_id,id),UNIQUE(workshop_id,number),UNIQUE(workshop_id,order_id),
 FOREIGN KEY(workshop_id,order_id,vehicle_id) REFERENCES public.work_orders(workshop_id,id,vehicle_id),
 FOREIGN KEY(workshop_id,vehicle_id) REFERENCES public.vehicles(workshop_id,id),
 FOREIGN KEY(workshop_id,customer_id) REFERENCES public.customers(workshop_id,id)
);
CREATE TABLE public.quote_items (
 workshop_id uuid NOT NULL,quote_id uuid NOT NULL,id uuid NOT NULL,position integer NOT NULL CHECK(position BETWEEN 0 AND 199),
 description text NOT NULL CHECK(char_length(btrim(description)) BETWEEN 1 AND 160),
 type text NOT NULL CHECK(type IN ('Repuesto','Insumo','Mano de obra','Servicio')),
 quantity100 integer NOT NULL CHECK(quantity100 BETWEEN 1 AND 1000000),unit_price bigint NOT NULL CHECK(unit_price BETWEEN 1 AND 100000000),
 line_net bigint GENERATED ALWAYS AS ((quantity100::bigint*unit_price+50)/100) STORED,
 PRIMARY KEY(workshop_id,quote_id,id),UNIQUE(workshop_id,quote_id,position),
 FOREIGN KEY(workshop_id,quote_id) REFERENCES public.quotes(workshop_id,id) ON DELETE RESTRICT
);
CREATE TABLE public.quote_revisions (
 workshop_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),quote_id uuid NOT NULL,revision integer NOT NULL CHECK(revision>0),
 payload jsonb NOT NULL,payload_sha256 text NOT NULL CHECK(payload_sha256~'^[a-f0-9]{64}$'),
 pdf_object_path text NOT NULL,pdf_sha256 text NOT NULL CHECK(pdf_sha256~'^[a-f0-9]{64}$'),pdf_size integer NOT NULL CHECK(pdf_size BETWEEN 1 AND 20000000),
 issued_by uuid NOT NULL REFERENCES auth.users(id),issued_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(workshop_id,id),UNIQUE(workshop_id,quote_id,revision),UNIQUE(pdf_object_path),
 FOREIGN KEY(workshop_id,quote_id) REFERENCES public.quotes(workshop_id,id)
);
CREATE TABLE public.quote_delivery_events (
 workshop_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),revision_id uuid NOT NULL,attempt integer NOT NULL CHECK(attempt>0),
 status text NOT NULL CHECK(status IN ('queued','sent','failed')),recipient text NOT NULL CHECK(char_length(recipient) BETWEEN 5 AND 254 AND recipient~'^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
 provider_id text CHECK(char_length(provider_id)<=200),error_code text CHECK(error_code~'^[A-Z0-9_]{1,80}$'),created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(workshop_id,id),UNIQUE(workshop_id,revision_id,attempt,status),
 FOREIGN KEY(workshop_id,revision_id) REFERENCES public.quote_revisions(workshop_id,id),
 CHECK((status='sent' AND provider_id IS NOT NULL AND error_code IS NULL) OR (status='queued' AND provider_id IS NULL AND error_code IS NULL) OR (status='failed' AND error_code IS NOT NULL))
);
CREATE TABLE public.quote_events (
 workshop_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),quote_id uuid NOT NULL,revision integer NOT NULL,
 kind text NOT NULL CHECK(kind IN ('revised','voided')),reason text NOT NULL CHECK(char_length(btrim(reason)) BETWEEN 3 AND 1000),
 actor_id uuid NOT NULL REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(workshop_id,id),FOREIGN KEY(workshop_id,quote_id) REFERENCES public.quotes(workshop_id,id)
);
CREATE TABLE bt_cp05_private.counters(workshop_id uuid PRIMARY KEY REFERENCES public.workshops(id),last_number bigint NOT NULL);
CREATE TABLE bt_cp05_private.commands(workshop_id uuid NOT NULL,request_id uuid NOT NULL,kind text NOT NULL,input_hash text NOT NULL,response jsonb NOT NULL,PRIMARY KEY(workshop_id,request_id));
CREATE TABLE bt_cp05_private.issue_requests (
 workshop_id uuid NOT NULL,request_id uuid NOT NULL,quote_id uuid NOT NULL,expected_version bigint NOT NULL,revision integer NOT NULL,
 actor_id uuid NOT NULL REFERENCES auth.users(id),payload jsonb NOT NULL,payload_sha256 text NOT NULL,
 state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','completed','cancelled')),revision_id uuid,
 PRIMARY KEY(workshop_id,request_id),FOREIGN KEY(workshop_id,quote_id) REFERENCES public.quotes(workshop_id,id)
);
CREATE UNIQUE INDEX cp05_one_pending_issue ON bt_cp05_private.issue_requests(workshop_id,quote_id) WHERE state='pending';
CREATE INDEX cp05_quotes_vehicle ON public.quotes(workshop_id,vehicle_id,created_at DESC);
CREATE INDEX cp05_revisions_quote ON public.quote_revisions(workshop_id,quote_id,revision DESC);
CREATE INDEX cp05_delivery_revision ON public.quote_delivery_events(workshop_id,revision_id,created_at);

CREATE FUNCTION bt_cp05_private.authorize(wid uuid,actor uuid,writing boolean) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
BEGIN
 IF actor IS NULL OR NOT EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id JOIN auth.users u ON u.id=m.user_id
  WHERE m.workshop_id=wid AND m.user_id=actor AND m.status='active' AND w.status='active' AND u.email_confirmed_at IS NOT NULL
   AND (NOT writing OR m.role IN ('owner','admin','reception'))) THEN RAISE EXCEPTION 'CP05_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
END $$;
CREATE FUNCTION bt_cp05_private.read_allowed(wid uuid) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 PERFORM bt_cp05_private.authorize(wid,auth.uid(),false); RETURN true;
EXCEPTION WHEN insufficient_privilege THEN RETURN false;
END $$;
CREATE FUNCTION public.bt_cp05_can_read(wid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_cp05_private.read_allowed(wid) $$;
CREATE FUNCTION bt_cp05_private.hash(data jsonb) RETURNS text LANGUAGE sql IMMUTABLE SET search_path=pg_catalog AS $$ SELECT encode(sha256(convert_to(data::text,'UTF8')),'hex') $$;
CREATE FUNCTION bt_cp05_private.immutable() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
BEGIN RAISE EXCEPTION 'CP05_IMMUTABLE_HISTORY' USING ERRCODE='42501'; END $$;
CREATE TRIGGER cp05_events_immutable BEFORE UPDATE OR DELETE ON public.quote_events FOR EACH ROW EXECUTE FUNCTION bt_cp05_private.immutable();
CREATE TRIGGER cp05_revision_immutable BEFORE UPDATE OR DELETE ON public.quote_revisions FOR EACH ROW EXECUTE FUNCTION bt_cp05_private.immutable();
CREATE TRIGGER cp05_delivery_immutable BEFORE UPDATE OR DELETE ON public.quote_delivery_events FOR EACH ROW EXECUTE FUNCTION bt_cp05_private.immutable();

CREATE FUNCTION bt_cp05_private.command(wid uuid,rid uuid,kind text,input jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
DECLARE old bt_cp05_private.commands;
BEGIN
 IF rid IS NULL THEN RAISE EXCEPTION 'CP05_REQUEST_REQUIRED' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(wid::text||rid::text,0));
 SELECT * INTO old FROM bt_cp05_private.commands c WHERE c.workshop_id=wid AND c.request_id=rid;
 IF FOUND THEN
  IF old.kind<>kind OR old.input_hash<>bt_cp05_private.hash(input) THEN RAISE EXCEPTION 'CP05_REQUEST_REUSED' USING ERRCODE='22023'; END IF;
  RETURN old.response;
 END IF;
 RETURN NULL;
END $$;
CREATE FUNCTION bt_cp05_private.open_quote(wid uuid,oid uuid,rid uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE o public.work_orders;v public.vehicles;q public.quotes;answer jsonb;input jsonb:=jsonb_build_object('order',oid);
BEGIN
 PERFORM bt_cp05_private.authorize(wid,auth.uid(),true);
 answer:=bt_cp05_private.command(wid,rid,'open',input); IF answer IS NOT NULL THEN RETURN answer; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(wid::text||oid::text,1));
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND order_id=oid;
 IF NOT FOUND THEN
  SELECT * INTO o FROM public.work_orders WHERE workshop_id=wid AND id=oid;
  SELECT * INTO v FROM public.vehicles WHERE workshop_id=wid AND id=o.vehicle_id AND archived_at IS NULL;
  IF o.id IS NULL OR v.id IS NULL OR NOT EXISTS(SELECT 1 FROM public.customers WHERE workshop_id=wid AND id=v.customer_id AND archived_at IS NULL) THEN RAISE EXCEPTION 'CP05_SOURCE_INVALID' USING ERRCODE='22023'; END IF;
  INSERT INTO bt_cp05_private.counters VALUES(wid,1) ON CONFLICT(workshop_id) DO UPDATE SET last_number=bt_cp05_private.counters.last_number+1 RETURNING last_number INTO q.number;
  INSERT INTO public.quotes(workshop_id,order_id,vehicle_id,customer_id,number,created_by) VALUES(wid,oid,v.id,v.customer_id,q.number,auth.uid()) RETURNING * INTO q;
 END IF;
 answer:=jsonb_build_object('id',q.id,'version',q.version);
 INSERT INTO bt_cp05_private.commands VALUES(wid,rid,'open',bt_cp05_private.hash(input),answer); RETURN answer;
END $$;
CREATE FUNCTION public.bt_cp05_open_quote(p_workshop_id uuid,p_order_id uuid,p_request_id uuid) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_cp05_private.open_quote(p_workshop_id,p_order_id,p_request_id) $$;

CREATE FUNCTION bt_cp05_private.save_quote(wid uuid,qid uuid,expected bigint,rid uuid,data jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE q public.quotes;answer jsonb;input jsonb:=jsonb_build_object('quote',qid,'expected',expected,'data',data);n integer;
BEGIN
 PERFORM bt_cp05_private.authorize(wid,auth.uid(),true);
 answer:=bt_cp05_private.command(wid,rid,'save',input); IF answer IS NOT NULL THEN RETURN answer; END IF;
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=qid FOR UPDATE;
 IF q.id IS NULL THEN RAISE EXCEPTION 'CP05_NOT_FOUND' USING ERRCODE='42501'; END IF;
 IF q.version<>expected THEN RAISE EXCEPTION 'CP05_CONFLICT' USING ERRCODE='40001'; END IF;
 IF q.status<>'draft' OR q.issue_pending THEN RAISE EXCEPTION 'CP05_NOT_EDITABLE' USING ERRCODE='55000'; END IF;
 IF data->>'price_basis' IS DISTINCT FROM 'net' OR jsonb_typeof(data->'items') IS DISTINCT FROM 'array' OR jsonb_array_length(data->'items')>200 OR
  (data->>'valid_days')::integer NOT BETWEEN 1 AND 365 OR jsonb_typeof(data->'terms') IS DISTINCT FROM 'string' OR jsonb_typeof(data->'comments') IS DISTINCT FROM 'string' THEN RAISE EXCEPTION 'CP05_INVALID' USING ERRCODE='22023'; END IF;
 IF jsonb_typeof(data->'valid_days') IS DISTINCT FROM 'number' OR (data->>'valid_days')::numeric<>trunc((data->>'valid_days')::numeric) OR EXISTS(
 SELECT 1 FROM jsonb_array_elements(data->'items') x WHERE jsonb_typeof(x->'quantity100') IS DISTINCT FROM 'number' OR jsonb_typeof(x->'unit_price') IS DISTINCT FROM 'number' OR
 (x->>'quantity100')::numeric<>trunc((x->>'quantity100')::numeric) OR (x->>'unit_price')::numeric<>trunc((x->>'unit_price')::numeric)
 ) THEN RAISE EXCEPTION 'CP05_INTEGER_REQUIRED' USING ERRCODE='22023'; END IF;
 n:=jsonb_array_length(data->'items');
 IF (SELECT count(DISTINCT (x->>'id')::uuid) FROM jsonb_array_elements(data->'items') x)<>n OR
  (SELECT count(DISTINCT (lower(regexp_replace(btrim(x->>'description'),'\s+',' ','g')),x->>'type')) FROM jsonb_array_elements(data->'items') x)<>n
 THEN RAISE EXCEPTION 'CP05_DUPLICATE_ITEM' USING ERRCODE='22023'; END IF;
 UPDATE public.quotes SET valid_days=(data->>'valid_days')::integer,terms=data->>'terms',comments=data->>'comments',version=version+1,updated_at=statement_timestamp() WHERE workshop_id=wid AND id=qid;
 DELETE FROM public.quote_items WHERE workshop_id=wid AND quote_id=qid;
 INSERT INTO public.quote_items(workshop_id,quote_id,id,position,description,type,quantity100,unit_price)
 SELECT wid,qid,(x->>'id')::uuid,(ord-1)::integer,btrim(x->>'description'),x->>'type',(x->>'quantity100')::integer,(x->>'unit_price')::bigint FROM jsonb_array_elements(data->'items') WITH ORDINALITY a(x,ord);
 answer:=jsonb_build_object('id',qid,'version',q.version+1);
 INSERT INTO bt_cp05_private.commands VALUES(wid,rid,'save',bt_cp05_private.hash(input),answer); RETURN answer;
END $$;
CREATE FUNCTION public.bt_cp05_save_quote(p_workshop_id uuid,p_quote_id uuid,p_expected_version bigint,p_request_id uuid,p_data jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_cp05_private.save_quote(p_workshop_id,p_quote_id,p_expected_version,p_request_id,p_data) $$;

CREATE FUNCTION bt_cp05_private.revise_quote(wid uuid,qid uuid,expected bigint,rid uuid,reason text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE q public.quotes;answer jsonb;input jsonb:=jsonb_build_object('quote',qid,'expected',expected,'reason',reason);
BEGIN
 PERFORM bt_cp05_private.authorize(wid,auth.uid(),true);
 answer:=bt_cp05_private.command(wid,rid,'revise',input); IF answer IS NOT NULL THEN RETURN answer; END IF;
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=qid FOR UPDATE;
 IF q.id IS NULL THEN RAISE EXCEPTION 'CP05_NOT_FOUND' USING ERRCODE='42501'; END IF;
 IF q.version<>expected THEN RAISE EXCEPTION 'CP05_CONFLICT' USING ERRCODE='40001'; END IF;
 IF q.status='draft' OR q.issue_pending THEN RAISE EXCEPTION 'CP05_NOT_ISSUED' USING ERRCODE='55000'; END IF;
 IF char_length(btrim(reason)) NOT BETWEEN 3 AND 1000 OR reason IS NULL THEN RAISE EXCEPTION 'CP05_REASON_REQUIRED' USING ERRCODE='22023'; END IF;
 UPDATE public.quotes SET status='draft',version=version+1,updated_at=statement_timestamp(),void_reason=NULL WHERE workshop_id=wid AND id=qid;
 INSERT INTO public.quote_events(workshop_id,quote_id,revision,kind,reason,actor_id) VALUES(wid,qid,q.issued_revision,'revised',reason,auth.uid());
 answer:=jsonb_build_object('id',qid,'version',q.version+1,'reason',reason,'actor',auth.uid(),'at',statement_timestamp());
 INSERT INTO bt_cp05_private.commands VALUES(wid,rid,'revise',bt_cp05_private.hash(input),answer); RETURN answer;
END $$;
CREATE FUNCTION public.bt_cp05_revise_quote(p_workshop_id uuid,p_quote_id uuid,p_expected_version bigint,p_request_id uuid,p_reason text) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_cp05_private.revise_quote(p_workshop_id,p_quote_id,p_expected_version,p_request_id,p_reason) $$;
CREATE FUNCTION bt_cp05_private.void_quote(wid uuid,qid uuid,expected bigint,rid uuid,reason text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE q public.quotes;answer jsonb;input jsonb:=jsonb_build_object('quote',qid,'expected',expected,'reason',reason);
BEGIN
 PERFORM bt_cp05_private.authorize(wid,auth.uid(),true);
 answer:=bt_cp05_private.command(wid,rid,'void',input); IF answer IS NOT NULL THEN RETURN answer; END IF;
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=qid FOR UPDATE;
 IF q.id IS NULL THEN RAISE EXCEPTION 'CP05_NOT_FOUND' USING ERRCODE='42501'; END IF;
 IF q.version<>expected THEN RAISE EXCEPTION 'CP05_CONFLICT' USING ERRCODE='40001'; END IF;
 IF q.status<>'issued' OR q.issue_pending THEN RAISE EXCEPTION 'CP05_NOT_ISSUED' USING ERRCODE='55000'; END IF;
 IF reason IS NULL OR char_length(btrim(reason)) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'CP05_REASON_REQUIRED' USING ERRCODE='22023'; END IF;
 UPDATE public.quotes SET status='voided',void_reason=reason,version=version+1,updated_at=statement_timestamp() WHERE workshop_id=wid AND id=qid;
 INSERT INTO public.quote_events(workshop_id,quote_id,revision,kind,reason,actor_id) VALUES(wid,qid,q.issued_revision,'voided',reason,auth.uid());
 answer:=jsonb_build_object('id',qid,'version',q.version+1,'reason',reason,'actor',auth.uid(),'at',statement_timestamp());
 INSERT INTO bt_cp05_private.commands VALUES(wid,rid,'void',bt_cp05_private.hash(input),answer); RETURN answer;
END $$;
CREATE FUNCTION public.bt_cp05_void_quote(p_workshop_id uuid,p_quote_id uuid,p_expected_version bigint,p_request_id uuid,p_reason text) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_cp05_private.void_quote(p_workshop_id,p_quote_id,p_expected_version,p_request_id,p_reason) $$;

-- Backend-only two-phase archive: reserve immutable content; archive privately;
-- finalize only after verified Storage receipt. No bucket/policy/endpoint created.
CREATE FUNCTION bt_cp05_private.prepare_issue(wid uuid,qid uuid,expected bigint,rid uuid,actor uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
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
END $$;
CREATE FUNCTION public.bt_cp05_prepare_issue(p_workshop_id uuid,p_quote_id uuid,p_expected_version bigint,p_request_id uuid,p_actor_id uuid) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_cp05_private.prepare_issue(p_workshop_id,p_quote_id,p_expected_version,p_request_id,p_actor_id) $$;
CREATE FUNCTION bt_cp05_private.finish_issue(wid uuid,rid uuid,actor uuid,path text,pdfhash text,bytes integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE req bt_cp05_private.issue_requests;q public.quotes;record public.quote_revisions;expected_path text;
BEGIN
 PERFORM bt_cp05_private.authorize(wid,actor,true);
 -- Quote first, then request: same lock order as prepare/cancel.
 SELECT * INTO req FROM bt_cp05_private.issue_requests WHERE workshop_id=wid AND request_id=rid;
 SELECT * INTO q FROM public.quotes WHERE workshop_id=wid AND id=req.quote_id FOR UPDATE;
 SELECT * INTO req FROM bt_cp05_private.issue_requests WHERE workshop_id=wid AND request_id=rid FOR UPDATE;
 IF req.request_id IS NULL OR req.actor_id<>actor OR req.state='cancelled' THEN RAISE EXCEPTION 'CP05_INVALID_ISSUE' USING ERRCODE='42501'; END IF;
 expected_path:=wid::text||'/quotes/'||q.id::text||'/r'||req.revision::text||'/'||req.payload_sha256||'.pdf';
 IF path IS DISTINCT FROM expected_path OR pdfhash IS NULL OR pdfhash!~'^[a-f0-9]{64}$' OR bytes IS NULL OR bytes NOT BETWEEN 1 AND 20000000 THEN RAISE EXCEPTION 'CP05_ARCHIVE_RECEIPT_REQUIRED' USING ERRCODE='22023'; END IF;
 IF req.state='completed' THEN
  SELECT * INTO record FROM public.quote_revisions WHERE workshop_id=wid AND id=req.revision_id;
  IF record.pdf_sha256<>pdfhash OR record.pdf_size<>bytes THEN RAISE EXCEPTION 'CP05_ARCHIVE_MISMATCH' USING ERRCODE='22023'; END IF;
  RETURN to_jsonb(record);
 END IF;
 IF q.version<>req.expected_version OR NOT q.issue_pending THEN RAISE EXCEPTION 'CP05_CONFLICT' USING ERRCODE='40001'; END IF;
 INSERT INTO public.quote_revisions(workshop_id,quote_id,revision,payload,payload_sha256,pdf_object_path,pdf_sha256,pdf_size,issued_by)
 VALUES(wid,q.id,req.revision,req.payload,req.payload_sha256,path,pdfhash,bytes,actor) RETURNING * INTO record;
 UPDATE public.quotes SET status='issued',issue_pending=false,issued_revision=req.revision,version=version+1,updated_at=statement_timestamp() WHERE workshop_id=wid AND id=q.id;
 UPDATE bt_cp05_private.issue_requests SET state='completed',revision_id=record.id WHERE workshop_id=wid AND request_id=rid;
 RETURN to_jsonb(record);
END $$;
CREATE FUNCTION public.bt_cp05_finish_issue(p_workshop_id uuid,p_request_id uuid,p_actor_id uuid,p_path text,p_pdf_sha256 text,p_pdf_size integer) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_cp05_private.finish_issue(p_workshop_id,p_request_id,p_actor_id,p_path,p_pdf_sha256,p_pdf_size) $$;
CREATE FUNCTION bt_cp05_private.cancel_issue(wid uuid,rid uuid,actor uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE req bt_cp05_private.issue_requests;
BEGIN
 PERFORM bt_cp05_private.authorize(wid,actor,true);
 SELECT * INTO req FROM bt_cp05_private.issue_requests WHERE workshop_id=wid AND request_id=rid;
 PERFORM 1 FROM public.quotes WHERE workshop_id=wid AND id=req.quote_id FOR UPDATE;
 SELECT * INTO req FROM bt_cp05_private.issue_requests WHERE workshop_id=wid AND request_id=rid FOR UPDATE;
 IF req.actor_id IS DISTINCT FROM actor OR req.state<>'pending' THEN RAISE EXCEPTION 'CP05_INVALID_ISSUE' USING ERRCODE='42501'; END IF;
 UPDATE bt_cp05_private.issue_requests SET state='cancelled' WHERE workshop_id=wid AND request_id=rid;
 UPDATE public.quotes SET issue_pending=false WHERE workshop_id=wid AND id=req.quote_id;
END $$;
CREATE FUNCTION public.bt_cp05_cancel_issue(p_workshop_id uuid,p_request_id uuid,p_actor_id uuid) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_cp05_private.cancel_issue(p_workshop_id,p_request_id,p_actor_id) $$;

-- Append-only delivery ledger. Only a trusted future worker can enqueue/ack.
-- No worker is deployed. The recipient must equal the immutable revision snapshot.
CREATE FUNCTION bt_cp05_private.delivery(wid uuid,revid uuid,attempt_no integer,next_status text,provider text,error text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE r public.quote_revisions;recipient text;answer public.quote_delivery_events;previous text;
BEGIN
 SELECT * INTO r FROM public.quote_revisions WHERE workshop_id=wid AND id=revid;
 IF r.id IS NULL THEN RAISE EXCEPTION 'CP05_NOT_FOUND' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(wid::text||revid::text,2));
 recipient:=r.payload->'customer'->>'email';
 IF recipient IS NULL THEN RAISE EXCEPTION 'CP05_RECIPIENT_REQUIRED' USING ERRCODE='22023'; END IF;
 SELECT * INTO answer FROM public.quote_delivery_events WHERE workshop_id=wid AND revision_id=revid AND attempt=attempt_no AND status=next_status;
 IF FOUND THEN
  IF answer.provider_id IS DISTINCT FROM provider OR answer.error_code IS DISTINCT FROM error THEN RAISE EXCEPTION 'CP05_DELIVERY_MISMATCH' USING ERRCODE='22023'; END IF; RETURN to_jsonb(answer);
 END IF;
 SELECT status INTO previous FROM public.quote_delivery_events WHERE workshop_id=wid AND revision_id=revid ORDER BY attempt DESC,(status<>'queued') DESC,created_at DESC,id DESC LIMIT 1;
 IF next_status='queued' THEN
  IF attempt_no<>coalesce((SELECT max(attempt)+1 FROM public.quote_delivery_events WHERE workshop_id=wid AND revision_id=revid),1) OR previous='sent' OR previous='queued' THEN RAISE EXCEPTION 'CP05_DELIVERY_ORDER' USING ERRCODE='55000'; END IF;
 ELSE
  IF next_status NOT IN ('sent','failed') OR NOT EXISTS(SELECT 1 FROM public.quote_delivery_events WHERE workshop_id=wid AND revision_id=revid AND attempt=attempt_no AND status='queued') OR EXISTS(SELECT 1 FROM public.quote_delivery_events WHERE workshop_id=wid AND revision_id=revid AND attempt=attempt_no AND status IN ('sent','failed')) THEN RAISE EXCEPTION 'CP05_DELIVERY_ORDER' USING ERRCODE='55000'; END IF;
 END IF;
 INSERT INTO public.quote_delivery_events(workshop_id,revision_id,attempt,status,recipient,provider_id,error_code) VALUES(wid,revid,attempt_no,next_status,recipient,provider,error) RETURNING * INTO answer;
 RETURN to_jsonb(answer);
END $$;
CREATE FUNCTION public.bt_cp05_record_delivery(p_workshop_id uuid,p_revision_id uuid,p_attempt integer,p_status text,p_provider_id text,p_error_code text) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=pg_catalog AS $$ SELECT bt_cp05_private.delivery(p_workshop_id,p_revision_id,p_attempt,p_status,p_provider_id,p_error_code) $$;

-- All persistent entities are isolated; no direct client mutation or DELETE.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['quotes','quote_items','quote_revisions','quote_delivery_events','quote_events'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated,service_role',t);
  EXECUTE format('GRANT SELECT ON public.%I TO authenticated,service_role',t);
  EXECUTE format('CREATE POLICY cp05_read ON public.%I FOR SELECT TO authenticated USING(public.bt_cp05_can_read(workshop_id))',t);
 END LOOP;
 FOREACH t IN ARRAY ARRAY['counters','commands','issue_requests'] LOOP
  EXECUTE format('ALTER TABLE bt_cp05_private.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE bt_cp05_private.%I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON bt_cp05_private.%I FROM PUBLIC,anon,authenticated,service_role',t);
 END LOOP;
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA bt_cp05_private FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION bt_cp05_private.read_allowed(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION bt_cp05_private.open_quote(uuid,uuid,uuid),bt_cp05_private.save_quote(uuid,uuid,bigint,uuid,jsonb),bt_cp05_private.revise_quote(uuid,uuid,bigint,uuid,text),bt_cp05_private.void_quote(uuid,uuid,bigint,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION bt_cp05_private.prepare_issue(uuid,uuid,bigint,uuid,uuid),bt_cp05_private.finish_issue(uuid,uuid,uuid,text,text,integer),bt_cp05_private.cancel_issue(uuid,uuid,uuid),bt_cp05_private.delivery(uuid,uuid,integer,text,text,text) TO service_role;
REVOKE ALL ON FUNCTION public.bt_cp05_can_read(uuid),public.bt_cp05_open_quote(uuid,uuid,uuid),public.bt_cp05_save_quote(uuid,uuid,bigint,uuid,jsonb),public.bt_cp05_revise_quote(uuid,uuid,bigint,uuid,text),public.bt_cp05_void_quote(uuid,uuid,bigint,uuid,text),public.bt_cp05_prepare_issue(uuid,uuid,bigint,uuid,uuid),public.bt_cp05_finish_issue(uuid,uuid,uuid,text,text,integer),public.bt_cp05_cancel_issue(uuid,uuid,uuid),public.bt_cp05_record_delivery(uuid,uuid,integer,text,text,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.bt_cp05_can_read(uuid),public.bt_cp05_open_quote(uuid,uuid,uuid),public.bt_cp05_save_quote(uuid,uuid,bigint,uuid,jsonb),public.bt_cp05_revise_quote(uuid,uuid,bigint,uuid,text),public.bt_cp05_void_quote(uuid,uuid,bigint,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bt_cp05_prepare_issue(uuid,uuid,bigint,uuid,uuid),public.bt_cp05_finish_issue(uuid,uuid,uuid,text,text,integer),public.bt_cp05_cancel_issue(uuid,uuid,uuid),public.bt_cp05_record_delivery(uuid,uuid,integer,text,text,text) TO service_role;
COMMIT;
