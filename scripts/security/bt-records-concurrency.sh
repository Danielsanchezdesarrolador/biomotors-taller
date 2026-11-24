#!/usr/bin/env bash
set -euo pipefail
lab="${1:?Disposable lab required}"
[[ "$lab" =~ ^bt-records-verify-[0-9]+$ ]] || exit 2
psql_lab(){ docker exec -i "$lab" psql -X -qAt -v ON_ERROR_STOP=1 -U postgres -d bytetorque "$@"; }
psql_lab <<'SQL' >/dev/null
INSERT INTO bt_records_private.rollout VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
INSERT INTO public.customers(workshop_id,id,full_name,created_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000004','Concurrent synthetic record','11111111-1111-4111-8111-111111111111');
SQL
# Two connections, same idempotent deletion. Exactly one immutable event.
execute_with_token(){ docker exec -i -e "PGOPTIONS=$PGOPTIONS" "$lab" psql -X -qAt -v ON_ERROR_STOP=1 -U postgres -d bytetorque <<'SQL' >/dev/null
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
SELECT public.bt_records_execute('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','customers','aaaaaaaa-aaaa-4aaa-8aaa-000000000004','delete',
 current_setting('bt.records_test_token'),'eeeeeeee-eeee-4eee-8eee-000000000004','Concurrent synthetic deletion');
SQL
}
# Timestamp JSON form is the actual optimistic token expected by inspect_record.
token="$(psql_lab -c "SELECT to_jsonb(updated_at)#>>'{}' FROM public.customers WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000004'")"
export PGOPTIONS="-c bt.records_test_token=$token"
execute_with_token & first=$!
execute_with_token & second=$!
wait "$first"; wait "$second"
unset PGOPTIONS
psql_lab <<'SQL' >/dev/null
DO $$ BEGIN
 IF (SELECT count(*) FROM bt_records_private.events WHERE request_id='eeeeeeee-eeee-4eee-8eee-000000000004')<>1 OR
 EXISTS(SELECT 1 FROM public.customers WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000004') THEN RAISE EXCEPTION 'CONCURRENT_DELETE_FAILED'; END IF;
END $$;
-- Restore installation defaults for the independent browser fixtures.
DELETE FROM bt_records_private.rollout;
SQL
echo 'BT_RECORDS_CONCURRENT_IDEMPOTENCY_PASS'
