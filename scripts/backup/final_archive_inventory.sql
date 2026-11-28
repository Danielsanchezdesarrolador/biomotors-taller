SELECT to_regclass('bt_multipunto_private.documents') IS NOT NULL AS bt_has_multipunto \gset
\if :bt_has_multipunto
-- V2 requires one transaction-consistent restored database, including private staging bytea.
WITH documents AS (
 SELECT jsonb_build_object('bucket','cp05-quote-documents','path',r.pdf_object_path,'sha256',r.pdf_sha256,'byteLength',r.pdf_size) doc FROM public.quote_revisions r WHERE r.workshop_id=:'workshop_id'::uuid
 UNION
 SELECT jsonb_build_object('bucket',d->>'bucket','path',d->>'path','sha256',d->>'sha256','byteLength',d->'byteLength') FROM bt_com_private.closing_manifests m CROSS JOIN LATERAL jsonb_array_elements(m.documents) d WHERE m.workshop_id=:'workshop_id'::uuid
 UNION
 SELECT jsonb_build_object('bucket',bucket,'path',path,'sha256',pdf_hash,'byteLength',byte_length,'state','published','orderId',order_id,'documentId',id,'revision',revision) FROM bt_multipunto_private.documents WHERE workshop_id=:'workshop_id'::uuid
 UNION
 SELECT jsonb_build_object('bucket','bt-inspection-documents','path',a.path,'sha256',a.pdf_hash,'byteLength',a.byte_length,'state','staged','orderId',j.order_id,'documentId',split_part(a.path,'/',5)::uuid,'revision',j.revision)
 FROM bt_multipunto_private.artifacts a JOIN bt_multipunto_private.jobs j ON j.id=a.job_id AND j.workshop_id=a.workshop_id
 WHERE a.workshop_id=:'workshop_id'::uuid AND a.path IS NOT NULL
 AND EXISTS(SELECT 1 FROM storage.objects o WHERE o.bucket_id='bt-inspection-documents' AND o.name=a.path)
 AND NOT EXISTS(SELECT 1 FROM bt_multipunto_private.documents d WHERE d.path=a.path)
)
SELECT jsonb_build_object('version',2,'workshopId',:'workshop_id','recoverySetId',:'recovery_set_id','documents',coalesce(jsonb_agg(doc ORDER BY doc->>'bucket',doc->>'path'),'[]'::jsonb)) FROM documents;
\else
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

\endif
