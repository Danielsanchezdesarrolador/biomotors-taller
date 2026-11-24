-- READ ONLY: run against the isolated database restored from the chosen SEC07 backup,
-- never treat a live inventory from another instant as evidence of that dump.
-- psql variables: workshop_id (UUID), recovery_set_id (opaque owner-selected ID).
SELECT to_regclass('bt_com_private.closing_manifests') IS NOT NULL AS bt_has_closing \gset
\if :bt_has_closing
WITH documents AS (
 SELECT jsonb_build_object('bucket','cp05-quote-documents','path',r.pdf_object_path,
  'sha256',r.pdf_sha256,'byteLength',r.pdf_size) AS doc
 FROM public.quote_revisions r WHERE r.workshop_id=:'workshop_id'::uuid
 UNION
 SELECT jsonb_build_object('bucket',d->>'bucket','path',d->>'path','sha256',d->>'sha256','byteLength',d->'byteLength')
 FROM bt_com_private.closing_manifests m CROSS JOIN LATERAL jsonb_array_elements(m.documents) d
 WHERE m.workshop_id=:'workshop_id'::uuid
)
SELECT jsonb_build_object('version',1,'workshopId',:'workshop_id','recoverySetId',:'recovery_set_id',
 'documents',coalesce(jsonb_agg(doc ORDER BY doc->>'bucket',doc->>'path'),'[]'::jsonb)) FROM documents;

\else
SELECT jsonb_build_object('version',1,'workshopId',:'workshop_id','recoverySetId',:'recovery_set_id',
 'documents',coalesce(jsonb_agg(jsonb_build_object('bucket','cp05-quote-documents','path',r.pdf_object_path,
 'sha256',r.pdf_sha256,'byteLength',r.pdf_size) ORDER BY r.pdf_object_path),'[]'::jsonb))
 FROM public.quote_revisions r WHERE r.workshop_id=:'workshop_id'::uuid;
\endif
