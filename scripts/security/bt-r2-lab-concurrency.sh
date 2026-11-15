#!/usr/bin/env bash
# Runs only in isolated postgres:17 GitHub Actions service container.
# The two synthetic transactions compete for the last Basic mechanic seat.
set -euo pipefail
container="${1:?Expected ephemeral GitHub Actions PostgreSQL container ID}"
first_log="$(mktemp)"
second_log="$(mktemp)"
trap 'rm -f "$first_log" "$second_log"' EXIT

(
  docker exec -i "$container" psql -X -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL'
BEGIN;
SET LOCAL ROLE service_role;
SELECT public.bt_r2_reserve_mechanic_invite(
 '11111111-1111-4111-8111-111111111111',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 'race1@example.com',repeat('a',64),now()+interval '1 hour'
);
\echo R2_RACE_RESERVED
SELECT pg_sleep(4);
COMMIT;
SQL
) >"$first_log" 2>&1 &
first_pid="$!"

# Only start the second writer once the first writer holds the workshop lock.
ready=0
for _ in $(seq 1 40); do
  if grep -q 'R2_RACE_RESERVED' "$first_log"; then ready=1; break; fi
  if ! kill -0 "$first_pid" 2>/dev/null; then break; fi
  sleep 0.1
done
if [[ "$ready" != "1" ]]; then
  echo "FAIL: first transaction did not reach the reservation lock"
  cat "$first_log"
  wait "$first_pid" || true
  exit 1
fi

set +e
docker exec -i "$container" psql -X -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL' >"$second_log" 2>&1
BEGIN;
SET LOCAL ROLE service_role;
SELECT public.bt_r2_reserve_mechanic_invite(
 '11111111-1111-4111-8111-111111111111',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 'race2@example.com',repeat('b',64),now()+interval '1 hour'
);
COMMIT;
SQL
second_code=$?
set -e
wait "$first_pid"

if [[ "$second_code" -eq 0 ]] || ! grep -q 'Mechanic seat limit reached' "$second_log"; then
  echo "FAIL: second writer was not rejected by the Basic quota"
  cat "$second_log"
  exit 1
fi
active="$(docker exec -i "$container" psql -X -A -t -U postgres -d bytetorque -c "
SELECT count(*) FROM bt_private.workshop_mechanic_invitations
WHERE workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
AND status='pending' AND expires_at > now()")"
if [[ "$active" != "1" ]]; then
  echo "FAIL: concurrency created $active reservations instead of one"
  exit 1
fi
echo 'PASS: PostgreSQL concurrency serializes reservations (only 1 of 2)'
