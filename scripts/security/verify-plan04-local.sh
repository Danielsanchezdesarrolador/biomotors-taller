#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
lab="bt-plan04-$$"
docker_cmd=(docker --host=unix:///var/run/docker.sock)
trap '"${docker_cmd[@]}" rm -f "$lab" >/dev/null 2>&1 || true' EXIT
"${docker_cmd[@]}" run --rm -d --network none --name "$lab" -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17 >/dev/null
ready=false
for attempt in {1..45}; do
 if "${docker_cmd[@]}" logs "$lab" 2>&1 | grep -Fq 'PostgreSQL init process complete' &&
    "${docker_cmd[@]}" exec "$lab" psql -X -At -U postgres -c 'SELECT 1' >/dev/null 2>&1; then ready=true; break; fi
 sleep 1
done
[[ "$ready" == true ]] || { echo 'PLAN04_LOCAL_POSTGRES_NOT_READY'; exit 1; }
psql_lab(){ "${docker_cmd[@]}" exec -i "$lab" psql -X -v ON_ERROR_STOP=1 -U postgres "$@"; }
for file in scripts/security/bt-cp03-lab-bootstrap.sql docs/sql/applied/20261112144646_bt_cp02_c_core_tenants_rls.sql; do psql_lab < "$file" >/dev/null; done
psql_lab <<'SQL' >/dev/null
ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz DEFAULT now(), ADD COLUMN banned_until timestamptz,
 ADD COLUMN raw_user_meta_data jsonb DEFAULT '{}', ADD COLUMN created_at timestamptz DEFAULT now();
CREATE TABLE auth.sessions(id uuid PRIMARY KEY,user_id uuid REFERENCES auth.users(id),not_after timestamptz);
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
-- Storage policy lab only. No object service, network, bucket or file is created on Supabase.
CREATE SCHEMA storage;
CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text,metadata jsonb);
CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT string_to_array(name,'/') $$;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects FORCE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA storage TO anon,authenticated;
GRANT ALL ON storage.objects TO anon,authenticated;
CREATE POLICY lab_existing_broad_storage_policy ON storage.objects FOR ALL TO anon,authenticated USING(true) WITH CHECK(true);
SQL
for file in docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql docs/sql/BT_CP04_ORDERS_INSPECTIONS_CANDIDATE.sql docs/sql/BT_CP05_QUOTES_CANDIDATE.sql docs/sql/BT_CREATOR_01_PRIVATE_SUBSCRIPTIONS_CANDIDATE.sql docs/sql/BT_PLAN_04A_PERSONAL_ENTITLEMENTS_CANDIDATE.sql docs/sql/BT_PLAN_04B_WORKSHOPS_CANDIDATE.sql docs/sql/BT_PLAN_04C_MECHANICS_CANDIDATE.sql docs/sql/BT_PLAN_04D_BILLING_CANDIDATE.sql docs/sql/BT_PLAN_04B_BRANDING_STORAGE_CANDIDATE.sql docs/sql/BT_PLAN_04_CP05_BRANDING_CANDIDATE.sql; do psql_lab < "$file" >/dev/null; done
psql_lab < scripts/security/bt-plan04-lab-assertions.sql >/dev/null
# Three reserved Plus seats: exactly one of two concurrent requests may take the fourth.
psql_lab -c "UPDATE bt_platform_private.mechanic_invites SET state='revoked' WHERE id=(SELECT id FROM bt_platform_private.mechanic_invites WHERE email='quota-1@invalid.test');" >/dev/null
invite(){ psql_lab -c "SET ROLE authenticated; SELECT public.lab_identity(3); SELECT public.bt_plan04_manage_mechanic((SELECT bound_workshop_id FROM public.lab_bound_workshop(3)),'invite','race-$1@invalid.test',NULL,gen_random_uuid());" >/dev/null 2>&1; }
# Test-only helper exposes only a synthetic fixture ID. Not part of candidate SQL.
psql_lab <<'SQL' >/dev/null
CREATE FUNCTION public.lab_bound_workshop(n integer) RETURNS TABLE(bound_workshop_id uuid) LANGUAGE sql SECURITY DEFINER AS $$
 SELECT bound_workshop_id FROM bt_platform_private.account_entitlements WHERE user_id=('00000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
SQL
set +e
invite first & first=$!
invite second & second=$!
wait "$first"; a=$?
wait "$second"; b=$?
set -e
[[ "$a" == 0 && "$b" != 0 || "$a" != 0 && "$b" == 0 ]] || { echo 'PLAN04_CONCURRENT_SEATS_FAILED'; exit 1; }
psql_lab -c "DO \$\$ BEGIN IF (SELECT count(*) FROM bt_platform_private.mechanic_invites WHERE workshop_id=(SELECT bound_workshop_id FROM public.lab_bound_workshop(3)) AND state='pending' AND expires_at>now())<>4 THEN RAISE EXCEPTION 'SEAT_COUNT'; END IF; END \$\$;" >/dev/null
echo 'PLAN04_LOCAL_RLS_MFA_SYNC_INVITES_CONCURRENCY_PASS'
psql_lab < scripts/security/bt-plan04-billing-branding-assertions.sql >/dev/null
echo 'PLAN04_LOCAL_BILLING_AND_BRANDING_PASS'

# Two simultaneous creations under one personal grant must yield exactly one workshop.
psql_lab <<'SQL' >/dev/null
SET ROLE authenticated;
SELECT public.lab_identity(1,'aal2');
SELECT public.bt_creator04_manage_account('00000000-0000-4000-8000-000000000008','full','lifetime',NULL,'synthetic creation race',gen_random_uuid());
SQL
create_workshop(){ psql_lab -c "SET ROLE authenticated; SELECT public.lab_identity(8); SELECT public.bt_plan04_create_workshop('Synthetic race',gen_random_uuid());" >/dev/null 2>&1; }
set +e
create_workshop & first=$!
create_workshop & second=$!
wait "$first"; a=$?
wait "$second"; b=$?
set -e
[[ "$a" == 0 && "$b" != 0 || "$a" != 0 && "$b" == 0 ]] || { echo 'PLAN04_CONCURRENT_CREATION_FAILED'; exit 1; }
psql_lab -c "DO \$\$ BEGIN IF (SELECT count(*) FROM public.workshops WHERE name='Synthetic race')<>1 THEN RAISE EXCEPTION 'DUPLICATE_WORKSHOP'; END IF; END \$\$;" >/dev/null
echo 'PLAN04_LOCAL_CONCURRENT_SINGLE_LICENSE_CREATION_PASS'
