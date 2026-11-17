-- BT-CP05-TPL-01 · CANDIDATE ONLY. Do not apply to hosted Supabase without
-- explicit authorization and full backup/recovery validation.
-- Depends on installed BT-PLAN-04B and its workshop_profiles/manager helper.
-- Custom PDF stationery is NOT a way to issue invoices, alter prices or roles.
BEGIN;

ALTER TABLE bt_platform_private.workshop_profiles
  ADD COLUMN quote_template_path text;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('bt-workshop-quote-templates','bt-workshop-quote-templates',
  false,4194304,ARRAY['application/pdf']);

CREATE FUNCTION public.bt_plan04_can_use_pdf_template(p_workshop_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE p record;
BEGIN
  PERFORM bt_platform_private.manager(p_workshop_id);
  SELECT plan,state,is_lifetime,expires_at INTO p
  FROM bt_platform_private.subscriptions WHERE workshop_id=p_workshop_id;
  RETURN p.plan IN ('plus','full') AND p.state='active' AND
    (p.is_lifetime OR p.expires_at IS NULL OR p.expires_at > now());
EXCEPTION WHEN insufficient_privilege THEN RETURN false;
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_can_use_pdf_template(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_can_use_pdf_template(uuid) TO authenticated;

CREATE FUNCTION public.bt_plan04_pdf_template_status(p_workshop_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE current_plan text:='basic'; allowed boolean; path text;
BEGIN
  PERFORM bt_platform_private.manager(p_workshop_id);
  allowed:=public.bt_plan04_can_use_pdf_template(p_workshop_id);
  IF allowed THEN
    SELECT s.plan INTO current_plan FROM bt_platform_private.subscriptions s
    WHERE s.workshop_id=p_workshop_id;
    SELECT p.quote_template_path INTO path FROM bt_platform_private.workshop_profiles p
    WHERE p.workshop_id=p_workshop_id;
  END IF;
  RETURN jsonb_build_object('workshopId',p_workshop_id,'eligible',allowed,
      'plan',current_plan,'templatePath',CASE WHEN allowed THEN path ELSE NULL END);
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_pdf_template_status(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_pdf_template_status(uuid) TO authenticated;

CREATE POLICY bt_cp05_template_insert ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (bucket_id='bt-workshop-quote-templates' AND
   name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.pdf$' AND
   public.bt_plan04_can_use_pdf_template((storage.foldername(name))[1]::uuid));
CREATE POLICY bt_cp05_template_read ON storage.objects FOR SELECT TO authenticated
 USING (bucket_id='bt-workshop-quote-templates' AND
   public.bt_plan04_can_use_pdf_template((storage.foldername(name))[1]::uuid));
-- Restrictive clauses withstand broad permissive policies in other buckets.
CREATE POLICY bt_cp05_template_scope ON storage.objects AS RESTRICTIVE FOR ALL TO authenticated
 USING (bucket_id<>'bt-workshop-quote-templates' OR
   public.bt_plan04_can_use_pdf_template((storage.foldername(name))[1]::uuid))
 WITH CHECK (bucket_id<>'bt-workshop-quote-templates' OR
   public.bt_plan04_can_use_pdf_template((storage.foldername(name))[1]::uuid));
CREATE POLICY bt_cp05_template_no_update ON storage.objects AS RESTRICTIVE
 FOR UPDATE TO anon,authenticated
 USING (bucket_id<>'bt-workshop-quote-templates')
 WITH CHECK (bucket_id<>'bt-workshop-quote-templates');
CREATE POLICY bt_cp05_template_no_delete ON storage.objects AS RESTRICTIVE
 FOR DELETE TO anon,authenticated
 USING (bucket_id<>'bt-workshop-quote-templates');
CREATE POLICY bt_cp05_template_anon_guard ON storage.objects AS RESTRICTIVE
 FOR ALL TO anon
 USING (bucket_id<>'bt-workshop-quote-templates')
 WITH CHECK (bucket_id<>'bt-workshop-quote-templates');

CREATE FUNCTION public.bt_plan04_set_pdf_template(
  p_workshop_id uuid,p_path text
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' AS $$
DECLARE object_size bigint; mime text;
BEGIN
  PERFORM bt_platform_private.manager(p_workshop_id);
  IF p_path IS NOT NULL THEN
    IF NOT public.bt_plan04_can_use_pdf_template(p_workshop_id)
      THEN RAISE EXCEPTION 'PLUS_OR_FULL_REQUIRED' USING ERRCODE='42501'; END IF;
    IF p_path !~ ('^'||p_workshop_id::text||'/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$')
      THEN RAISE EXCEPTION 'INVALID_TEMPLATE_PATH' USING ERRCODE='22023'; END IF;
    SELECT (o.metadata->>'size')::bigint,o.metadata->>'mimetype'
    INTO object_size,mime FROM storage.objects o
    WHERE o.bucket_id='bt-workshop-quote-templates' AND o.name=p_path;
    IF object_size IS NULL OR object_size<8 OR object_size>4194304
      OR mime<>'application/pdf' THEN
      RAISE EXCEPTION 'TEMPLATE_NOT_CONFIRMED' USING ERRCODE='22023'; END IF;
  END IF;
  UPDATE bt_platform_private.workshop_profiles p
  SET quote_template_path=p_path,updated_at=now()
  WHERE p.workshop_id=p_workshop_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'WORKSHOP_PROFILE_REQUIRED' USING ERRCODE='22023'; END IF;
  RETURN jsonb_build_object('workshopId',p_workshop_id,
       'templatePath',p_path,'usesDefault',p_path IS NULL);
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_set_pdf_template(uuid,text)
FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_set_pdf_template(uuid,text) TO authenticated;

COMMIT;

-- NOT INCLUDED: arbitrary field mapping, archived revision mutation, external
-- delivery, data updates, automatic billing or public downloads.
-- Server-side issuer must re-verify Plus/Full and template path on each issue;
-- never use a browser-supplied path as authority. Uploaded A4 stationery must
-- reserve the dynamic content area; preview is mandatory before issuing.
