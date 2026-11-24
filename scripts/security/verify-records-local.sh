#!/usr/bin/env bash
# Consolidated BT-REG-01 only. No hosted credentials, migrations or real records.
set -euo pipefail
cd "$(dirname "$0")/../.."
lab="bt-records-verify-$$"
evidence="${BT_RECORDS_EVIDENCE_DIR:-/tmp/bt-records-evidence}"
mkdir -p "$evidence"
bridge_pid=''; vite_pid=''
cleanup(){
 [[ -z "$bridge_pid" ]] || kill "$bridge_pid" 2>/dev/null || true
 [[ -z "$vite_pid" ]] || kill "$vite_pid" 2>/dev/null || true
 docker rm -f "$lab" >/dev/null 2>&1 || true
}
trap cleanup EXIT
docker image inspect postgres:17 >/dev/null 2>&1 || { echo 'Offline prerequisite: preload postgres:17 before running this isolated lab.' >&2; exit 1; }
docker run --rm -d --network none --name "$lab" -e POSTGRES_PASSWORD=synthetic-local-only -e POSTGRES_DB=bytetorque postgres:17 >/dev/null
ready=false
for attempt in {1..45}; do
 if docker logs "$lab" 2>&1 | grep -Fq 'PostgreSQL init process complete' &&
 docker exec "$lab" psql -X -qAt -U postgres -d bytetorque -c 'SELECT 1' >/dev/null 2>&1; then ready=true;break;fi
 sleep 1
done
[[ "$ready" == true ]] || { echo 'Local PostgreSQL did not initialize' >&2;exit 1; }
psql_lab(){ docker exec -i "$lab" psql -X -v ON_ERROR_STOP=1 -U postgres -d bytetorque "$@"; }
for file in scripts/security/bt-cp03-lab-bootstrap.sql docs/sql/applied/20261112144646_bt_cp02_c_core_tenants_rls.sql docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql docs/sql/BT_CP04_ORDERS_INSPECTIONS_CANDIDATE.sql; do psql_lab < "$file" >/dev/null;done
psql_lab -c 'ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz DEFAULT now();' >/dev/null
for file in docs/sql/BT_CP05_QUOTES_CANDIDATE.sql docs/sql/BT_CP05_COMPLETED_ISSUE_RECOVERY_CANDIDATE.sql docs/sql/BT_FLOW_LIVE_02_CANDIDATE.sql docs/sql/BT_COM_01C_REVIEW_LEDGER_CANDIDATE.sql scripts/security/bt-cp05-lab-fixtures.sql docs/sql/BT_RECORDS_ADMINISTRATION_CANDIDATE.sql; do psql_lab < "$file" >/dev/null;done
psql_lab < scripts/security/bt-records-assertions.sql > "$evidence/postgres-core.log" 2>&1
psql_lab < scripts/security/bt-records-history-assertions.sql > "$evidence/postgres-history.log" 2>&1
bash scripts/security/bt-records-concurrency.sh "$lab"
psql_lab < scripts/security/bt-records-browser-fixtures.sql > "$evidence/browser-fixtures.log" 2>&1
node scripts/security/records-lab-bridge.mjs "$lab" > "$evidence/bridge.log" 2>&1 & bridge_pid=$!
node node_modules/vite/bin/vite.js --config vite.harness.config.ts --port 47114 --strictPort > "$evidence/vite.log" 2>&1 & vite_pid=$!
for attempt in {1..30};do
 if curl --silent --fail http://127.0.0.1:47114/records-qa >/dev/null && grep -q 'BRIDGE_READY' "$evidence/bridge.log";then break;fi
 kill -0 "$bridge_pid" "$vite_pid" 2>/dev/null || { echo 'Loopback test ports unavailable; see evidence logs.' >&2;exit 1; }
 sleep 1
done
BT_RECORDS_EVIDENCE_DIR="$evidence" node scripts/verify-records-browser.cjs
psql_lab <<'SQL' > "$evidence/postgres-browser-persistence.log" 2>&1
DO $$ BEGIN
 IF (SELECT count(*) FROM public.quote_revisions)<>1 OR (SELECT count(*) FROM public.inspection_findings)<>1 OR
 (SELECT count(*) FROM public.vehicles)<>3 OR
 (SELECT status FROM public.quotes WHERE number=1)<>'voided' OR
 EXISTS(SELECT 1 FROM public.quotes WHERE number=2) OR
 EXISTS(SELECT 1 FROM public.work_orders WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000021' AND cancelled_at IS NULL) OR
 EXISTS(SELECT 1 FROM public.customers WHERE id='bbbbbbbb-bbbb-4bbb-8bbb-000000000001' AND archived_at IS NOT NULL) THEN
 RAISE EXCEPTION 'BROWSER_PERSISTENCE_OR_HISTORY_FAILED';END IF;
END $$;
SELECT 'BT_RECORDS_BROWSER_DURABLE_HISTORY_PASS';
SQL
printf 'BT_RECORDS_LOCAL_PASS; evidence: %s\n' "$evidence"
