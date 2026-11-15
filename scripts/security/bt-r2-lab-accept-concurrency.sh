#!/usr/bin/env bash
# Isolated PostgreSQL 17 CI only: token is single-use under simultaneous accept.
set -euo pipefail
container="${1:?Expected ephemeral PostgreSQL service container ID}"
first_log="$(mktemp)"
second_log="$(mktemp)"
trap 'rm -f "$first_log" "$second_log"' EXIT

# B is untouched by the preceding Basic reservation race in workshop A.
docker exec -i "$container" psql -X -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL' > /dev/null
BEGIN;
SET LOCAL ROLE service_role;
SELECT public.bt_r2_reserve_mechanic_invite(
 '55555555-5555-4555-8555-555555555555',
 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
 'newmech1@example.com',repeat('c',64),now()+interval '1 hour'
);
COMMIT;
SQL

(
docker exec -i "$container" psql -X -A -t -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL'
BEGIN;
SET LOCAL ROLE service_role;
SELECT CASE WHEN public.bt_r2_accept_mechanic_invite(
 '66666666-6666-4666-8666-666666666666',
 'newmech1@example.com',repeat('c',64)
) THEN 'FIRST_ACCEPTED' ELSE 'FIRST_REJECTED' END;
\echo R2_ACCEPT_LOCKED
SELECT pg_sleep(4);
COMMIT;
SQL
) > "$first_log" 2>&1 &
first_pid=$!

ready=0
for _ in $(seq 1 40); do
  if grep -q 'R2_ACCEPT_LOCKED' "$first_log"; then ready=1; break; fi
  if ! kill -0 "$first_pid" 2>/dev/null; then break; fi
  sleep 0.1
done
if [[ "$ready" != "1" ]]; then
  echo "FAIL: first acceptance never acquired workshop lock"
  cat "$first_log"
  wait "$first_pid" || true
  exit 1
fi

docker exec -i "$container" psql -X -A -t -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL' > "$second_log" 2>&1
BEGIN;
SET LOCAL ROLE service_role;
SELECT CASE WHEN public.bt_r2_accept_mechanic_invite(
 '66666666-6666-4666-8666-666666666666',
 'newmech1@example.com',repeat('c',64)
) THEN 'SECOND_ACCEPTED' ELSE 'SECOND_REJECTED' END;
COMMIT;
SQL
wait "$first_pid"
if ! grep -q '^FIRST_ACCEPTED$' "$first_log" || ! grep -q '^SECOND_REJECTED$' "$second_log"; then
  echo "FAIL: concurrent acceptance did not consume token exactly once"
  cat "$first_log"
  cat "$second_log"
  exit 1
fi
count="$(docker exec -i "$container" psql -X -A -t -U postgres -d bytetorque -c "
SELECT count(*) FROM public.workshop_memberships
WHERE workshop_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
AND user_id='66666666-6666-4666-8666-666666666666'
AND role='mechanic' AND status='active'")"
if [[ "$count" != "1" ]]; then
  echo "FAIL: expected 1 mechanic membership after dual acceptance, got $count"
  exit 1
fi
echo 'PASS: concurrent acceptance consumes single-use token exactly once'
