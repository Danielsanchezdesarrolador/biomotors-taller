#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
lab="bt-cp05-storage-$$"
docker_cmd=(docker --host=unix:///var/run/docker.sock)
trap '"${docker_cmd[@]}" rm -f "$lab" >/dev/null 2>&1 || true' EXIT
"${docker_cmd[@]}" run --rm -d --network none --name "$lab" -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17 >/dev/null
for attempt in {1..45}; do
 if "${docker_cmd[@]}" logs "$lab" 2>&1 | grep -Fq 'PostgreSQL init process complete' && "${docker_cmd[@]}" exec "$lab" pg_isready -U postgres >/dev/null 2>&1; then break; fi
 sleep 1
done
psql_lab(){ "${docker_cmd[@]}" exec -i "$lab" psql -X -v ON_ERROR_STOP=1 -U postgres "$@"; }
psql_lab < scripts/security/bt-cp03-lab-bootstrap.sql >/dev/null
psql_lab <<'SQL'
CREATE SCHEMA storage;
CREATE TABLE storage.buckets(id text PRIMARY KEY,public boolean,file_size_limit bigint,allowed_mime_types text[]);
CREATE TABLE storage.objects(id integer PRIMARY KEY,bucket_id text REFERENCES storage.buckets(id),name text);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA storage TO anon,authenticated,service_role;
GRANT ALL ON storage.objects TO anon,authenticated,service_role;
CREATE POLICY broad_legacy_policy ON storage.objects FOR ALL TO anon,authenticated USING(true) WITH CHECK(true);
INSERT INTO storage.buckets VALUES('cp05-quote-documents',false,20000000,ARRAY['application/pdf']),('other',true,10,ARRAY['image/png']);
INSERT INTO storage.objects VALUES(1,'cp05-quote-documents','synthetic.pdf'),(2,'other','existing.png');
SQL
psql_lab < docs/sql/BT_CP05_STORAGE_POLICY_CANDIDATE.sql
psql_lab <<'SQL'
SET ROLE authenticated;
DO $$ BEGIN
 IF (SELECT count(*) FROM storage.objects)<>1 OR EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='cp05-quote-documents') THEN RAISE EXCEPTION 'CP05_STORAGE_EXPOSED'; END IF;
 BEGIN INSERT INTO storage.objects VALUES(3,'cp05-quote-documents','tampered.pdf'); RAISE EXCEPTION 'CP05_UPLOAD_ALLOWED'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 UPDATE storage.objects SET name='tampered' WHERE id=1;
 DELETE FROM storage.objects WHERE id=1;
END $$;
SET ROLE anon;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='cp05-quote-documents') THEN RAISE EXCEPTION 'CP05_ANON_STORAGE_READ'; END IF; END $$;
SET ROLE service_role;
DO $$ BEGIN IF (SELECT count(*) FROM storage.objects WHERE id=1 AND name='synthetic.pdf')<>1 THEN RAISE EXCEPTION 'CP05_HISTORY_BYTES_CHANGED'; END IF; END $$;
RESET ROLE;
SELECT 'CP05_STORAGE_LOCAL_RESTRICTIVE_POLICY_PASS';
SQL
