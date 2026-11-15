#!/usr/bin/env bash
# Synthetic PostgreSQL-only rate limiter race: two attempts compete for slot 5/5.
set -euo pipefail
container="${1:?expected ephemeral postgres service container}"
one="$(mktemp)"
two="$(mktemp)"
trap 'rm -f "$one" "$two"' EXIT

docker exec -i "$container" psql -X -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL' >/dev/null
BEGIN;
SET LOCAL ROLE service_role;
SELECT public.bt_r2_take_mechanic_invite_rate_slot(
 '11111111-1111-4111-8111-111111111111','invite',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
) FROM generate_series(1,4);
COMMIT;
SQL

(
docker exec -i "$container" psql -X -A -t -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL'
BEGIN;
SET LOCAL ROLE service_role;
SELECT CASE WHEN public.bt_r2_take_mechanic_invite_rate_slot(
 '11111111-1111-4111-8111-111111111111','invite',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
) THEN 'FIRST_ALLOWED' ELSE 'FIRST_DENIED' END;
\echo RATE_FIRST_HOLDS_TRANSACTION
SELECT pg_sleep(4);
COMMIT;
SQL
) > "$one" 2>&1 &
first_pid=$!

ready=0
for _ in $(seq 1 40); do
  if grep -q 'RATE_FIRST_HOLDS_TRANSACTION' "$one"; then ready=1; break; fi
  if ! kill -0 "$first_pid" 2>/dev/null; then break; fi
  sleep 0.1
done
if [[ "$ready" != "1" ]]; then
  echo "FAIL: first rate-limit contender did not reach lock"
  cat "$one"
  wait "$first_pid" || true
  exit 1
fi

docker exec -i "$container" psql -X -A -t -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL' > "$two" 2>&1
BEGIN;
SET LOCAL ROLE service_role;
SELECT CASE WHEN public.bt_r2_take_mechanic_invite_rate_slot(
 '11111111-1111-4111-8111-111111111111','invite',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
) THEN 'SECOND_ALLOWED' ELSE 'SECOND_DENIED' END;
COMMIT;
SQL
wait "$first_pid"
if ! grep -q '^FIRST_ALLOWED$' "$one" || ! grep -q '^SECOND_DENIED$' "$two"; then
  echo "FAIL: 5th/6th concurrency results were not serialized"
  cat "$one"
  cat "$two"
  exit 1
fi

count="$(docker exec -i "$container" psql -X -A -t -U postgres -d bytetorque -c "
SELECT attempts FROM bt_private.mechanic_invite_attempts
WHERE actor_user_id='11111111-1111-4111-8111-111111111111'
AND action='invite' AND scope='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'")"
if [[ "$count" != "5" ]]; then
  echo "FAIL: expected 5 accepted operations, got $count"
  exit 1
fi
echo 'PASS: rate limiter atomic under simultaneous requests (5 allowed, 6th denied)'
