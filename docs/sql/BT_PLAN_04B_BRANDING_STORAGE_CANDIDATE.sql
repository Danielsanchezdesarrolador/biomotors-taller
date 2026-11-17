-- Separate Storage approval required. Private bucket; no public URLs or existing buckets altered.
BEGIN;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('bt-workshop-branding','bt-workshop-branding',false,2097152,ARRAY['image/png','image/jpeg']);
CREATE FUNCTION public.bt_plan04_can_brand(p_workshop_id uuid) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
BEGIN PERFORM bt_platform_private.manager(p_workshop_id); RETURN true;
EXCEPTION WHEN insufficient_privilege THEN RETURN false; END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_can_brand(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_can_brand(uuid) TO authenticated;
CREATE FUNCTION public.bt_plan04_can_read_brand(p_workshop_id uuid) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid:=bt_platform_private.actor();
BEGIN RETURN EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
 WHERE m.workshop_id=p_workshop_id AND m.user_id=u AND m.status='active' AND w.status='active');
EXCEPTION WHEN insufficient_privilege THEN RETURN false; END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_can_read_brand(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_can_read_brand(uuid) TO authenticated;
CREATE POLICY bt_plan04_logo_insert ON storage.objects FOR INSERT TO authenticated
 WITH CHECK(bucket_id='bt-workshop-branding' AND public.bt_plan04_can_brand((storage.foldername(name))[1]::uuid));
CREATE POLICY bt_plan04_logo_read ON storage.objects FOR SELECT TO authenticated
 USING(bucket_id='bt-workshop-branding' AND public.bt_plan04_can_read_brand((storage.foldername(name))[1]::uuid));
-- Restrictive guards also withstand a pre-existing broad permissive Storage policy.
CREATE POLICY bt_plan04_logo_scope_guard ON storage.objects AS RESTRICTIVE FOR ALL TO authenticated
 USING(bucket_id<>'bt-workshop-branding' OR (auth.uid() IS NOT NULL AND public.bt_plan04_can_read_brand((storage.foldername(name))[1]::uuid)))
 WITH CHECK(bucket_id<>'bt-workshop-branding' OR (auth.uid() IS NOT NULL AND public.bt_plan04_can_brand((storage.foldername(name))[1]::uuid)));
CREATE POLICY bt_plan04_logo_no_update ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon,authenticated
 USING(bucket_id<>'bt-workshop-branding') WITH CHECK(bucket_id<>'bt-workshop-branding');
CREATE POLICY bt_plan04_logo_no_delete ON storage.objects AS RESTRICTIVE FOR DELETE TO anon,authenticated
 USING(bucket_id<>'bt-workshop-branding');
CREATE POLICY bt_plan04_logo_anon_guard ON storage.objects AS RESTRICTIVE FOR ALL TO anon
 USING(bucket_id<>'bt-workshop-branding') WITH CHECK(bucket_id<>'bt-workshop-branding');
-- No upsert, UPDATE, DELETE or public policy. Only new random object names.
CREATE FUNCTION public.bt_plan04_set_logo(p_workshop_id uuid,p_path text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 PERFORM bt_platform_private.manager(p_workshop_id);
 IF p_path IS NULL OR p_path !~ ('^'||p_workshop_id::text||'/[a-f0-9-]{36}\.png$') OR NOT EXISTS(
  SELECT 1 FROM storage.objects WHERE bucket_id='bt-workshop-branding' AND name=p_path
    AND metadata->>'mimetype'='image/png' AND (metadata->>'size')::bigint BETWEEN 1 AND 2097152) THEN
  RAISE EXCEPTION 'Verified private PNG object required' USING ERRCODE='22023'; END IF;
 UPDATE bt_platform_private.workshop_profiles SET logo_path=p_path,updated_at=now() WHERE workshop_id=p_workshop_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Save workshop profile first' USING ERRCODE='22023'; END IF;
 RETURN public.bt_plan04_profile(p_workshop_id);
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_set_logo(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_set_logo(uuid,text) TO authenticated;
COMMIT;
