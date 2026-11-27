-- Run only after coordinated SQL and all three ready versions independently verified, drain completed.
-- A SQL condition cannot attest hosted Edge rollout or invalidate already-issued signed URLs.
BEGIN;
DO $$ DECLARE s text; BEGIN
  IF to_regnamespace('bt_commercial_private') IS NULL OR to_regprocedure('public.bt_commercial_reserve(uuid,text,uuid,uuid,text)') IS NULL OR to_regprocedure('public.bt_commercial_finish(uuid,uuid,boolean,bytea)') IS NULL OR to_regprocedure('public.bt_commercial_cached(uuid,uuid)') IS NULL THEN RAISE EXCEPTION 'COMMERCIAL_MIGRATION_REQUIRED'; END IF;
  FOREACH s IN ARRAY ARRAY['public.bt_plan04_operations_status(uuid)','public.bt_final_archive_document(uuid,uuid)','public.bt_final_archive_source(uuid,uuid,uuid,uuid)'] LOOP
    IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure(s) AND proacl::text='{postgres=X/postgres}' AND pg_get_userbyid(proowner)='postgres') OR has_function_privilege('authenticated',s,'EXECUTE') OR has_function_privilege('anon',s,'EXECUTE') OR has_function_privilege('service_role',s,'EXECUTE') THEN RAISE EXCEPTION 'GATE_STATE_MISMATCH: %',s; END IF;
  END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION public.bt_plan04_operations_status(uuid), public.bt_final_archive_document(uuid,uuid), public.bt_final_archive_source(uuid,uuid,uuid,uuid) TO authenticated;
DO $$ DECLARE s text; BEGIN
  FOREACH s IN ARRAY ARRAY['public.bt_plan04_operations_status(uuid)','public.bt_final_archive_document(uuid,uuid)','public.bt_final_archive_source(uuid,uuid,uuid,uuid)'] LOOP
    IF NOT has_function_privilege('authenticated',s,'EXECUTE') OR has_function_privilege('anon',s,'EXECUTE') OR has_function_privilege('service_role',s,'EXECUTE') THEN RAISE EXCEPTION 'GATE_RESTORE_MISMATCH: %',s; END IF;
  END LOOP;
END $$;
COMMIT;
