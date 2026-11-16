-- CANDIDATE ONLY: separate Director approval required. Does NOT create a bucket.
-- Private PDFs are served only by the verified backend, never direct client uploads/URLs.
BEGIN;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM storage.buckets WHERE id='cp05-quote-documents' AND public=false AND file_size_limit=20000000 AND allowed_mime_types=ARRAY['application/pdf']::text[]) THEN
  RAISE EXCEPTION 'CP05_APPROVED_PRIVATE_BUCKET_REQUIRED';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='storage.objects'::regclass AND relrowsecurity) THEN RAISE EXCEPTION 'CP05_STORAGE_RLS_REQUIRED'; END IF;
END $$;
-- RESTRICTIVE is deliberate: a broad preexisting permissive policy cannot expose CP05.
-- For every other bucket the predicate is true, preserving its existing policies.
CREATE POLICY bt_cp05_backend_only ON storage.objects AS RESTRICTIVE FOR ALL TO anon,authenticated
 USING(bucket_id<>'cp05-quote-documents') WITH CHECK(bucket_id<>'cp05-quote-documents');
COMMIT;
