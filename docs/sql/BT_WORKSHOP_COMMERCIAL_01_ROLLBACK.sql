-- CANDIDATE functional rollback, never destroy quota history or restore an unmetered handler.
-- FIRST freeze commercial document endpoints at server and revert UI under separate authorization.
BEGIN;
DO $$BEGIN IF current_setting('bt_commercial.egress_frozen',true) IS DISTINCT FROM 'on' THEN
 RAISE EXCEPTION 'ROLLBACK_REQUIRES_CONFIRMED_SERVER_EGRESS_FREEZE';END IF;END $$;
REVOKE EXECUTE ON FUNCTION public.bt_commercial_reserve(uuid,text,uuid,uuid,text),public.bt_commercial_own_workshop(),public.bt_commercial_status(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.bt_commercial_finish(uuid,uuid,boolean,bytea),public.bt_commercial_cached(uuid,uuid) FROM service_role;
-- Keep capability/customer/close guards, Storage egress policy, ownership invariant, and ledger.
-- Retained previous_functions is provenance for reviewed forward repair, NOT automatically executed.
COMMIT;
