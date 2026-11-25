#!/usr/bin/env bash
# NEW final-archive validation only. Prerequisite DDL, not previous audit suites.
set -euo pipefail
cd "$(dirname "$0")/../.."
lab="bt-agenda-$$"
evidence="${BT_AGENDA_EVIDENCE_DIR:-/tmp/bt-agenda-evidence}"
mkdir -p "$evidence"
docker image inspect postgres:17 >/dev/null
trap 'docker rm -f "$lab" >/dev/null 2>&1 || true' EXIT
docker run --rm -d --network none --name "$lab" -e POSTGRES_PASSWORD=synthetic-local-only -e POSTGRES_DB=bytetorque postgres:17 >/dev/null
for attempt in {1..45};do
 if docker logs "$lab" 2>&1 | grep -q 'PostgreSQL init process complete' && docker exec "$lab" psql -X -At -U postgres -d bytetorque -c 'SELECT 1' >/dev/null 2>&1;then break;fi
 sleep 1
done
psql_lab(){ docker exec -i "$lab" psql -X -v ON_ERROR_STOP=1 -U postgres -d bytetorque "$@"; }
for file in scripts/security/bt-cp03-lab-bootstrap.sql docs/sql/applied/20261112144646_bt_cp02_c_core_tenants_rls.sql docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql docs/sql/BT_CP04_ORDERS_INSPECTIONS_CANDIDATE.sql;do psql_lab < "$file" >/dev/null;done
psql_lab -c 'ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz DEFAULT now();' >/dev/null
for file in docs/sql/BT_CP05_QUOTES_CANDIDATE.sql docs/sql/BT_CP05_COMPLETED_ISSUE_RECOVERY_CANDIDATE.sql docs/sql/BT_FLOW_LIVE_02_CANDIDATE.sql docs/sql/BT_COM_01C_REVIEW_LEDGER_CANDIDATE.sql docs/sql/BT_RECORDS_ADMINISTRATION_CANDIDATE.sql;do psql_lab < "$file" >/dev/null;done
psql_lab <<'SQL' >/dev/null
CREATE SCHEMA storage;
CREATE TABLE storage.buckets(id text PRIMARY KEY,name text NOT NULL,public boolean NOT NULL DEFAULT false,file_size_limit bigint,allowed_mime_types text[]);
CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text REFERENCES storage.buckets(id),name text,metadata jsonb,UNIQUE(bucket_id,name));
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA storage TO authenticated,anon,service_role;
GRANT ALL ON storage.objects,storage.buckets TO service_role;
GRANT SELECT,INSERT,UPDATE,DELETE ON storage.objects TO authenticated,anon;
CREATE POLICY synthetic_permissive ON storage.objects FOR ALL TO anon,authenticated USING(true) WITH CHECK(true);
INSERT INTO storage.buckets VALUES('cp05-quote-documents','cp05-quote-documents',false,20000000,ARRAY['application/pdf']);
SQL
psql_lab < docs/sql/BT_FINAL_ARCHIVE_CANDIDATE.sql > "$evidence/schema.log" 2>&1
psql_lab < docs/sql/BT_AGENDA_01_CANDIDATE.sql > "$evidence/agenda-schema.log" 2>&1
node scripts/build-agenda-lab.mjs "$evidence/lab-entry.mjs"
BT_AGENDA_LAB="$lab" BT_AGENDA_EVIDENCE_DIR="$evidence" node "$evidence/lab-entry.mjs"
