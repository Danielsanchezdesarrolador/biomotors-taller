#!/usr/bin/env bash
# Focused LIVE-FIX-01 only. Real existing SQL, isolated synthetic PostgreSQL17.
set -euo pipefail
cd "$(dirname "$0")/../.."
lab="bt-live-personal-$$"
trap 'docker rm -f "$lab" >/dev/null 2>&1 || true' EXIT
docker image inspect postgres:17 >/dev/null
docker run --rm -d --network none --name "$lab" -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17 >/dev/null
ready=false
for attempt in {1..45};do
 if docker logs "$lab" 2>&1 | grep -q 'PostgreSQL init process complete' && docker exec "$lab" psql -X -At -U postgres -c 'SELECT 1' >/dev/null 2>&1;then ready=true;break;fi
 sleep 1
done
[[ "$ready" == true ]] || { echo 'PERSONAL_WORKSHOP_POSTGRES_NOT_READY';exit 1; }
psql_lab(){ docker exec -i "$lab" psql -X -v ON_ERROR_STOP=1 -U postgres "$@"; }
for file in scripts/security/bt-cp03-lab-bootstrap.sql docs/sql/applied/20261112144646_bt_cp02_c_core_tenants_rls.sql docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql;do psql_lab < "$file" >/dev/null;done
psql_lab <<'SQL' >/dev/null
ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz DEFAULT now(),ADD COLUMN banned_until timestamptz,ADD COLUMN created_at timestamptz DEFAULT now();
CREATE TABLE auth.sessions(id uuid PRIMARY KEY,user_id uuid REFERENCES auth.users(id),not_after timestamptz);
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
SQL
for file in docs/sql/BT_CREATOR_01_PRIVATE_SUBSCRIPTIONS_CANDIDATE.sql docs/sql/BT_PLAN_04A_PERSONAL_ENTITLEMENTS_CANDIDATE.sql docs/sql/BT_PLAN_04B_WORKSHOPS_CANDIDATE.sql;do psql_lab < "$file" >/dev/null;done
psql_lab < scripts/security/bt-live-personal-workshop-assertions.sql
