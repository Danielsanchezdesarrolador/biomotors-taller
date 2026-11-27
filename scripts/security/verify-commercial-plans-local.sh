#!/usr/bin/env bash
# Focused commercial candidate only; reuses installed schema fixtures without historical assertions.
set -euo pipefail
cd "$(dirname "$0")/../.."
lab="bt-commercial-plans-$$"
evidence="${BT_PLAN04BC_EVIDENCE_DIR:-/tmp/bt-plans-evidence}"
mkdir -p "$evidence"
: > "$evidence/schema.log"
docker image inspect postgres:17 >/dev/null
trap 'docker rm -f "$lab" >/dev/null 2>&1 || true' EXIT
docker run --rm -d --network none --name "$lab" -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=bytetorque postgres:17 >/dev/null
ready=false
for attempt in {1..45};do
 if docker logs "$lab" 2>&1 | grep -q 'PostgreSQL init process complete' && docker exec "$lab" psql -X -At -U postgres -d bytetorque -c 'SELECT 1' >/dev/null 2>&1;then ready=true;break;fi
 sleep 1
done
[[ "$ready" == true ]] || { echo 'PLAN04BC_LOCAL_POSTGRES_NOT_READY';exit 1; }
psql_lab(){ docker exec -i "$lab" psql -X -v ON_ERROR_STOP=1 -U postgres -d bytetorque "$@"; }
# Reuse schema setup, NOT historical assertions or audit suites.
for file in scripts/security/bt-cp03-lab-bootstrap.sql docs/sql/applied/20261112144646_bt_cp02_c_core_tenants_rls.sql docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql docs/sql/BT_CP04_ORDERS_INSPECTIONS_CANDIDATE.sql;do psql_lab < "$file" >> "$evidence/schema.log" 2>&1;done
psql_lab <<'SQL' >> "$evidence/schema.log" 2>&1
ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz DEFAULT now(), ADD COLUMN banned_until timestamptz,
 ADD COLUMN raw_user_meta_data jsonb DEFAULT '{}',ADD COLUMN created_at timestamptz DEFAULT now();
CREATE TABLE auth.sessions(id uuid PRIMARY KEY,user_id uuid REFERENCES auth.users(id),not_after timestamptz);
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
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
for file in docs/sql/BT_CP05_QUOTES_CANDIDATE.sql docs/sql/BT_CP05_COMPLETED_ISSUE_RECOVERY_CANDIDATE.sql docs/sql/BT_FLOW_LIVE_02_CANDIDATE.sql docs/sql/BT_COM_01C_REVIEW_LEDGER_CANDIDATE.sql docs/sql/BT_RECORDS_ADMINISTRATION_CANDIDATE.sql docs/sql/BT_FINAL_ARCHIVE_CANDIDATE.sql docs/sql/BT_AGENDA_01_CANDIDATE.sql docs/sql/BT_CREATOR_01_PRIVATE_SUBSCRIPTIONS_CANDIDATE.sql docs/sql/BT_PLAN_04A_PERSONAL_ENTITLEMENTS_CANDIDATE.sql;do psql_lab < "$file" >> "$evidence/schema.log" 2>&1;done
# Restore the recorded installed definitions before applying the already LIVE text fix.
python - <<'PY' | psql_lab >> "$evidence/schema.log" 2>&1
import json
m=json.load(open('tests/fixtures/flowFixInstalled.json'))
for f in m['functions']:print(f['definition']+';')
for c in m['constraints']:
 t='"'+c['schema']+'"."'+c['table_name']+'"';n='"'+c['name']+'"'
 print('ALTER TABLE '+t+' DROP CONSTRAINT '+n+';ALTER TABLE '+t+' ADD CONSTRAINT '+n+' '+c['definition']+';')
PY
for file in docs/sql/BT_FLOW_FIX_01_CANDIDATE.sql docs/sql/BT_PLAN_04B_WORKSHOPS_CANDIDATE.sql docs/sql/BT_PLAN_04C_MECHANICS_CANDIDATE.sql docs/sql/BT_PLAN_04BC_PILOT_CANDIDATE.sql docs/sql/BT_PLAN_04_CP05_BRANDING_CANDIDATE.sql;do psql_lab < "$file" >> "$evidence/schema.log" 2>&1;done
for file in docs/sql/BT_PLAN_04BC_REVOCATION_DELTA_CANDIDATE.sql docs/sql/BT_PILOT_FIX_01_CANDIDATE.sql docs/sql/BT_WORKSHOP_COMMERCIAL_01_CANDIDATE.sql docs/sql/BT_COMMERCIAL_PLANS_01_CANDIDATE.sql;do psql_lab < "$file" >> "$evidence/schema.log" 2>&1;done
node --input-type=module - "$evidence/plans-entry.mjs" <<'JS'
import {build} from 'rolldown'
await build({input:'tests/commercialPlansLab.ts',platform:'node',output:{file:process.argv[2],format:'es'}})
JS
BT_COMMERCIAL_PLANS_LAB="$lab" BT_COMMERCIAL_PLANS_EVIDENCE="$evidence" node "$evidence/plans-entry.mjs" | tee "$evidence/plans-server.log"
