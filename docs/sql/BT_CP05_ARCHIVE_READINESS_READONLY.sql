-- ByteTorque CP05 — READ ONLY archive readiness snapshot.
-- Safe in the currently hosted project; returns configuration metadata/counts
-- and never accesses PDF bytes, user names, private paths, tokens or customers.
-- Does NOT authorize deployment or prove recovery of backups.
WITH bucket AS (
  SELECT id, public, file_size_limit, allowed_mime_types
  FROM storage.buckets WHERE id='cp05-quote-documents'
), policy AS (
  SELECT policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname='storage' AND tablename='objects'
    AND policyname='bt_cp05_backend_only'
)
SELECT
  (SELECT count(*) FROM public.workshops) AS existing_workshops,
  (SELECT count(*) FROM public.quote_revisions) AS archived_revisions,
  (SELECT count(*) FROM bt_cp05_private.issue_requests WHERE state='pending')
    AS pending_issuance_requests,
  (SELECT count(*) FROM bucket) AS private_archive_bucket_count,
  coalesce((SELECT NOT public AND file_size_limit=20000000
    AND allowed_mime_types=ARRAY['application/pdf']::text[] FROM bucket),false)
    AS private_bucket_contract_ok,
  (SELECT count(*) FROM policy WHERE permissive='RESTRICTIVE'
     AND cmd='ALL' AND roles @> ARRAY['authenticated','anon']::name[]
     AND qual LIKE '%cp05-quote-documents%'
     AND with_check LIKE '%cp05-quote-documents%') AS backend_only_policy_count,
  (SELECT relrowsecurity FROM pg_class
    WHERE oid='storage.objects'::regclass) AS storage_rls_enabled,
  (SELECT count(*) FROM storage.objects WHERE bucket_id='cp05-quote-documents')
    AS archive_object_metadata_rows;
-- A zero archive bucket/policy count means NOT ACTIVATED.
-- All successful checks above are prerequisite-only, NOT release approval.
