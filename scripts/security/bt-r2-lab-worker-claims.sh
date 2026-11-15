#!/usr/bin/env bash
# Synthetic PostgreSQL 17 service-container ONLY; never live Supabase.
# Two workers race to claim one queued outbox row; SKIP LOCKED denies double claim.
set -euo pipefail
container="${1:?expected ephemeral PostgreSQL container ID}"
first_log="$(mktemp)"
second_log="$(mktemp)"
trap 'rm -f "$first_log" "$second_log"' EXIT

# Workshop B: untouched by previous Basic workshop-A reservation race.
docker exec -i "$container" psql -X -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL' >/dev/null
BEGIN;
SET LOCAL ROLE service_role;
SELECT public.bt_r2_reserve_and_queue_mechanic_invite(
 '55555555-5555-4555-8555-555555555555',
 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
 'newmech2@example.com',
 repeat('e',64),now()+interval '1 hour',
 repeat('c',128),repeat('f',24)
);
COMMIT;
SQL

(
  docker exec -i "$container" psql -X -A -t -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL'
BEGIN;
SET LOCAL ROLE service_role;
SELECT CASE WHEN EXISTS(SELECT 1 FROM public.bt_r2_claim_invitation_email())
  THEN 'FIRST_CLAIMED' ELSE 'FIRST_NONE' END;
\echo WORKER_FIRST_LOCK_HELD
SELECT pg_sleep(4);
COMMIT;
SQL
) >"$first_log" 2>&1 &
first_pid="$!"

ready=0
for _ in $(seq 1 40); do
  if grep -q 'WORKER_FIRST_LOCK_HELD' "$first_log"; then ready=1; break; fi
  if ! kill -0 "$first_pid" 2>/dev/null; then break; fi
  sleep 0.1
done
if [[ "$ready" != "1" ]]; then
  echo "FAIL: worker 1 did not acquire job lock"
  cat "$first_log"
  wait "$first_pid" || true
  exit 1
fi
docker exec -i "$container" psql -X -A -t -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL' >"$second_log" 2>&1
BEGIN;
SET LOCAL ROLE service_role;
SELECT CASE WHEN EXISTS(SELECT 1 FROM public.bt_r2_claim_invitation_email())
  THEN 'SECOND_CLAIMED' ELSE 'SECOND_SKIPPED' END;
COMMIT;
SQL
wait "$first_pid"
if ! grep -q '^FIRST_CLAIMED$' "$first_log" ||
   ! grep -q '^SECOND_SKIPPED$' "$second_log"; then
  echo "FAIL: workers simultaneously claimed same job"
  cat "$first_log"
  cat "$second_log"
  exit 1
fi
# The first job is committed as processing and should NOT be re-claimable.
after="$(docker exec -i "$container" psql -X -A -t -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL'
BEGIN;
SET LOCAL ROLE service_role;
SELECT CASE WHEN EXISTS(SELECT 1 FROM public.bt_r2_claim_invitation_email())
  THEN 'RECLAIMED' ELSE 'LEASE_HELD' END;
ROLLBACK;
SQL
)"
if [[ "$after" != *'LEASE_HELD'* ]]; then
  echo 'FAIL: active lease was reclaimed'
  exit 1
fi
echo 'PASS: SKIP LOCKED single claim, second worker skipped, active lease preserved'
