-- Narrow temporary release barrier. Candidate only; execute after current backup and no-editor window confirmed.
BEGIN;
DO $$ BEGIN
  IF to_regnamespace('bt_commercial_private') IS NOT NULL THEN RAISE EXCEPTION 'UNEXPECTED_COMMERCIAL_SCHEMA'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('public.bt_plan04_operations_status(uuid)') AND proacl::text='{postgres=X/postgres,authenticated=X/postgres}' AND pg_get_userbyid(proowner)='postgres' AND md5(prosrc)='153f1c9edaa91d7c017c3eede48c76f9') THEN RAISE EXCEPTION 'BASE_GATE_MISMATCH_1'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('public.bt_final_archive_document(uuid,uuid)') AND proacl::text='{postgres=X/postgres,authenticated=X/postgres}' AND pg_get_userbyid(proowner)='postgres' AND md5(prosrc)='88657aa2eb78583064159955f1224989') THEN RAISE EXCEPTION 'BASE_GATE_MISMATCH_2'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('public.bt_final_archive_source(uuid,uuid,uuid,uuid)') AND proacl::text='{postgres=X/postgres,authenticated=X/postgres}' AND pg_get_userbyid(proowner)='postgres' AND md5(prosrc)='af4cae87090cb50e29ccd86d7b278ed0') THEN RAISE EXCEPTION 'BASE_GATE_MISMATCH_3'; END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.bt_plan04_operations_status(uuid), public.bt_final_archive_document(uuid,uuid), public.bt_final_archive_source(uuid,uuid,uuid,uuid) FROM authenticated;
DO $$ DECLARE s text; BEGIN
  FOREACH s IN ARRAY ARRAY['public.bt_plan04_operations_status(uuid)','public.bt_final_archive_document(uuid,uuid)','public.bt_final_archive_source(uuid,uuid,uuid,uuid)'] LOOP
    IF has_function_privilege('authenticated',s,'EXECUTE') OR has_function_privilege('anon',s,'EXECUTE') OR has_function_privilege('service_role',s,'EXECUTE') THEN RAISE EXCEPTION 'GATE_NOT_CLOSED: %',s; END IF;
  END LOOP;
END $$;
COMMIT;
