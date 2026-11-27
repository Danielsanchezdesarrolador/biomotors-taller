-- GATE4: run only after INSTALL_GATE4, all three ready versions and compatible frontend independently verified; external release gate and drain PASS.
-- A SQL condition cannot attest hosted Edge rollout or invalidate already-issued signed URLs.
BEGIN;
DO $$ DECLARE s text; BEGIN
  IF to_regnamespace('bt_commercial_private') IS NULL OR to_regprocedure('public.bt_commercial_status(uuid)') IS NULL OR to_regprocedure('public.bt_commercial_reserve(uuid,text,uuid,uuid,text)') IS NULL OR to_regprocedure('public.bt_commercial_finish(uuid,uuid,boolean,bytea)') IS NULL OR to_regprocedure('public.bt_commercial_cached(uuid,uuid)') IS NULL THEN RAISE EXCEPTION 'COMMERCIAL_MIGRATION_REQUIRED'; END IF;
  FOREACH s IN ARRAY ARRAY['public.bt_plan04_operations_status(uuid)','public.bt_final_archive_document(uuid,uuid)','public.bt_final_archive_source(uuid,uuid,uuid,uuid)','public.bt_commercial_status(uuid)'] LOOP
    IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure(s) AND proacl::text='{postgres=X/postgres}' AND pg_get_userbyid(proowner)='postgres') OR has_function_privilege('authenticated',s,'EXECUTE') OR has_function_privilege('anon',s,'EXECUTE') OR has_function_privilege('service_role',s,'EXECUTE') THEN RAISE EXCEPTION 'GATE_STATE_MISMATCH: %',s; END IF;
  END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION public.bt_plan04_operations_status(uuid), public.bt_final_archive_document(uuid,uuid), public.bt_final_archive_source(uuid,uuid,uuid,uuid), public.bt_commercial_status(uuid) TO authenticated;
DO $$ DECLARE s text; BEGIN
  FOREACH s IN ARRAY ARRAY['public.bt_plan04_operations_status(uuid)','public.bt_final_archive_document(uuid,uuid)','public.bt_final_archive_source(uuid,uuid,uuid,uuid)','public.bt_commercial_status(uuid)'] LOOP
    IF NOT has_function_privilege('authenticated',s,'EXECUTE') OR has_function_privilege('anon',s,'EXECUTE') OR has_function_privilege('service_role',s,'EXECUTE') THEN RAISE EXCEPTION 'GATE_RESTORE_MISMATCH: %',s; END IF;
  END LOOP;
END $$;
COMMIT;
