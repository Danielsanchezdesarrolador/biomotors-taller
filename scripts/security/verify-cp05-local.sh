#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
lab="bt-cp05-verify-$$"
docker_cmd=(docker --host=unix:///var/run/docker.sock)
trap '"${docker_cmd[@]}" rm -f "$lab" >/dev/null 2>&1 || true' EXIT
"${docker_cmd[@]}" run --rm -d --network none --name "$lab" -e POSTGRES_PASSWORD=synthetic-local-only -e POSTGRES_DB=bytetorque postgres:17 >/dev/null
# The official postgres:17 image starts a temporary bootstrap server before
# stopping it and launching the final server. pg_isready alone can report
# success against that transient instance, then the first psql gets terminated.
# Wait for bootstrap completion AND verify a real query against the final one.
lab_ready=false
for attempt in {1..45}; do
 if "${docker_cmd[@]}" logs "$lab" 2>&1 | grep -Fq 'PostgreSQL init process complete' &&
    "${docker_cmd[@]}" exec "$lab" pg_isready -U postgres -d bytetorque >/dev/null 2>&1 &&
    [[ "$("${docker_cmd[@]}" exec "$lab" psql -X -A -t -v ON_ERROR_STOP=1 -U postgres -d bytetorque -c 'SELECT 1' 2>/dev/null)" == "1" ]]; then
   lab_ready=true
   break
 fi
 sleep 1
done
if [[ "$lab_ready" != true ]]; then
 echo 'CP05_POSTGRES_NOT_READY: PostgreSQL final server did not initialize in time' >&2
 "${docker_cmd[@]}" logs "$lab" >&2 || true
 exit 1
fi
psql_lab(){ "${docker_cmd[@]}" exec -i "$lab" psql -X -v ON_ERROR_STOP=1 -U postgres -d bytetorque "$@"; }
for file in scripts/security/bt-cp03-lab-bootstrap.sql docs/sql/applied/20261112144646_bt_cp02_c_core_tenants_rls.sql docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql docs/sql/BT_CP04_ORDERS_INSPECTIONS_CANDIDATE.sql; do psql_lab < "$file" >/dev/null; done
psql_lab -c 'ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz DEFAULT now();' >/dev/null
for file in docs/sql/BT_CP05_QUOTES_CANDIDATE.sql docs/sql/BT_CP05_COMPLETED_ISSUE_RECOVERY_CANDIDATE.sql scripts/security/bt-cp05-lab-fixtures.sql scripts/security/bt-cp05-lab-assertions.sql scripts/security/bt-cp05-completed-assertions.sql; do psql_lab < "$file"; done
# Separate connections = fresh session and subsequent durable read, never sessionStorage.
psql_lab <<'SQL'
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
DO $$ BEGIN IF (SELECT count(*) FROM public.quote_items)<>3 OR (SELECT count(*) FROM public.quote_revisions)<>1 THEN RAISE EXCEPTION 'DURABLE_RELOAD_FAILED'; END IF; END $$;
SELECT 'CP05_FRESH_CONNECTION_PERSISTENCE_PASS';
SQL
psql_lab <<'SQL'
INSERT INTO public.work_orders(workshop_id,id,vehicle_id,complaint,status,closed_at,opened_by)
SELECT 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',('aaaaaaaa-aaaa-4aaa-8aaa-0000000000'||n)::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-000000000011','Synthetic concurrency','closed',now(),'11111111-1111-4111-8111-111111111111' FROM generate_series(22,23) n;
SQL
open_concurrent(){
 psql_lab -c "SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false); SELECT public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-0000000000$1',gen_random_uuid());" >/dev/null
}
open_concurrent 22 & first=$!
open_concurrent 23 & second=$!
wait "$first"
wait "$second"
psql_lab -c "DO \$\$ BEGIN IF (SELECT count(DISTINCT number) FROM public.quotes)<>3 THEN RAISE EXCEPTION 'CONCURRENT_NUMBER_COLLISION'; END IF; END \$\$;"
echo 'CP05_CONCURRENT_NUMBERS_PASS'
