#!/usr/bin/env bash
# PostgreSQL 17 isolated/offline integration. NO Supabase credentials or hosted writes.
set -euo pipefail
cd "$(dirname "$0")/../.."
lab="bt-flow-02-$$"
docker_cmd=(docker --host=unix:///var/run/docker.sock)
trap '"${docker_cmd[@]}" rm -f "$lab" >/dev/null 2>&1 || true' EXIT
"${docker_cmd[@]}" run --rm -d --network none --name "$lab" \
  -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17 >/dev/null
ready=false
for attempt in {1..45}; do
  if "${docker_cmd[@]}" logs "$lab" 2>&1 | grep -Fq 'PostgreSQL init process complete' &&
     "${docker_cmd[@]}" exec "$lab" psql -X -At -U postgres -c 'SELECT 1' >/dev/null 2>&1; then
    ready=true; break
  fi
  sleep 1
done
[[ "$ready" == true ]] || { echo 'BT_FLOW_02_POSTGRES_NOT_READY'; exit 1; }
psql_lab(){ "${docker_cmd[@]}" exec -i "$lab" psql -X -v ON_ERROR_STOP=1 -U postgres "$@"; }
for file in \
  scripts/security/bt-cp03-lab-bootstrap.sql \
  docs/sql/applied/20261112144646_bt_cp02_c_core_tenants_rls.sql \
  docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql \
  docs/sql/BT_CP04_ORDERS_INSPECTIONS_CANDIDATE.sql; do
  psql_lab < "$file" >/dev/null
done
psql_lab -c 'ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz DEFAULT now();' >/dev/null
for file in \
  docs/sql/BT_CP05_QUOTES_CANDIDATE.sql \
  docs/sql/BT_FLOW_LIVE_02_CANDIDATE.sql \
  scripts/security/bt-cp05-lab-fixtures.sql \
  scripts/security/bt-flow-live-02-lab-assertions.sql; do
  psql_lab < "$file" >/dev/null
done
# Fresh connection after final process exit checks persisted storage, not session memory.
psql_lab <<'SQL'
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.bt_flow_quote_approvals)<>1 OR
    (SELECT count(*) FROM public.bt_flow_execution_reports)<>1 OR
    (SELECT count(*) FROM public.bt_flow_visit_deliveries)<>1 THEN
  RAISE EXCEPTION 'FLOW_02_FRESH_CONNECTION_PERSISTENCE_FAILED';
 END IF;
END $$;
SELECT 'BT_FLOW_LIVE_02_LOCAL_FRESH_CONNECTION_PASS';
SQL
