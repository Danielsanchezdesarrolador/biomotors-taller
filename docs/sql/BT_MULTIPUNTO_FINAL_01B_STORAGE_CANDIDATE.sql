-- OFFLINE CANDIDATE ONLY. Separate authorization and verified S5B recovery are required.
-- Private bucket; no client policies or signed URLs. Do not set recovery_ready here.
BEGIN;
DO $$BEGIN
 IF NOT EXISTS(SELECT 1 FROM bt_multipunto_private.control WHERE NOT read_enabled AND NOT write_enabled AND NOT recovery_ready) THEN RAISE EXCEPTION 'MP_INSTALL_REQUIRES_GATES_OFF';END IF;
 IF EXISTS(SELECT 1 FROM storage.buckets WHERE id='bt-inspection-documents') THEN RAISE EXCEPTION 'MP_BUCKET_ALREADY_EXISTS_VERIFY_MANUALLY';END IF;
END$$;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('bt-inspection-documents','bt-inspection-documents',false,20000000,ARRAY['application/pdf']);
COMMIT;
