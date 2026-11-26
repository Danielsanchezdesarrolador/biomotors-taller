-- Delta only over candidate 5dff5465e46b2903ddabaef4505cefb1c6be0131.
-- NOT APPLIED TO HOSTED SUPABASE. Install after the four reviewed 04BC migrations.
-- Rollouts remain unchanged on license revocation; authorized historical reads remain available.
BEGIN;
DO $guard$ BEGIN
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='bt_cp05_private.authorize(uuid,uuid,boolean)'::regprocedure) IS DISTINCT FROM '639131a123a91114c9b263adc29b56a9' THEN
  RAISE EXCEPTION 'PLAN04BC_REVOCATION_BASE_DRIFT: bt_cp05_private.authorize(uuid,uuid,boolean)' USING ERRCODE='55000';
 END IF;
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='bt_flow_live_private.authorize(uuid)'::regprocedure) IS DISTINCT FROM '409051f0e733bff3adb9513fb7a64df0' THEN
  RAISE EXCEPTION 'PLAN04BC_REVOCATION_BASE_DRIFT: bt_flow_live_private.authorize(uuid)' USING ERRCODE='55000';
 END IF;
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='bt_com_private.archive_authorize(uuid,uuid,boolean)'::regprocedure) IS DISTINCT FROM '52fa5d61a7e2efdcd75a97242abcf20a' THEN
  RAISE EXCEPTION 'PLAN04BC_REVOCATION_BASE_DRIFT: bt_com_private.archive_authorize(uuid,uuid,boolean)' USING ERRCODE='55000';
 END IF;
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='public.bt_plan04_operations_status(uuid)'::regprocedure) IS DISTINCT FROM 'bd937ae16bb23794814d8092e0c1da37' THEN
  RAISE EXCEPTION 'PLAN04BC_REVOCATION_BASE_DRIFT: public.bt_plan04_operations_status(uuid)' USING ERRCODE='55000';
 END IF;
END $guard$;

-- Existing QA/legacy workshops have no PLAN04 creation/binding and retain their contract.
-- A PLAN04-created/bound workshop with a FLOW rollout is a managed pilot even
-- when the entitlement is revoked/missing or a rollout is temporarily OFF.
CREATE FUNCTION bt_platform_private.pilot_write_license_allows(wid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT NOT (
  EXISTS(SELECT 1 FROM bt_flow_live_private.rollout WHERE workshop_id=wid)
  AND (EXISTS(SELECT 1 FROM bt_platform_private.workshop_creation_requests WHERE workshop_id=wid)
   OR EXISTS(SELECT 1 FROM bt_platform_private.account_entitlements WHERE bound_workshop_id=wid))
 ) OR EXISTS (
  SELECT 1 FROM bt_platform_private.account_entitlements e
  JOIN bt_platform_private.subscriptions s ON s.workshop_id=e.bound_workshop_id
  JOIN public.workshop_memberships m ON m.workshop_id=s.workshop_id AND m.user_id=e.user_id
  WHERE e.bound_workshop_id=wid AND e.plan='full' AND e.state='active'
   AND e.source='manual' AND e.is_lifetime AND e.expires_at IS NULL
   AND s.plan='full' AND s.state='active' AND s.source='manual'
   AND s.is_lifetime AND s.expires_at IS NULL AND m.role='owner' AND m.status='active'
 );
$$;
REVOKE ALL ON FUNCTION bt_platform_private.pilot_write_license_allows(uuid) FROM PUBLIC,anon,authenticated,service_role;
CREATE FUNCTION bt_platform_private.assert_pilot_write_license(wid uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT bt_platform_private.pilot_write_license_allows(wid) THEN
  RAISE EXCEPTION 'PILOT_PREMIUM_LICENSE_REQUIRED' USING ERRCODE='42501';
 END IF;
END $$;
REVOKE ALL ON FUNCTION bt_platform_private.assert_pilot_write_license(uuid) FROM PUBLIC,anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION bt_cp05_private.authorize(wid uuid,actor uuid,writing boolean) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog AS $$
BEGIN
 IF actor IS NULL OR NOT EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id JOIN auth.users u ON u.id=m.user_id
  WHERE m.workshop_id=wid AND m.user_id=actor AND m.status='active' AND w.status='active' AND u.email_confirmed_at IS NOT NULL
   AND (NOT writing OR m.role IN ('owner','admin','reception'))) THEN RAISE EXCEPTION 'CP05_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
 IF writing THEN PERFORM bt_platform_private.assert_pilot_write_license(wid); END IF;
END $$;

CREATE OR REPLACE FUNCTION bt_flow_live_private.authorize(wid uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF wid IS NULL OR auth.uid() IS NULL OR NOT EXISTS (
  SELECT 1 FROM bt_flow_live_private.rollout gate
  WHERE gate.workshop_id=wid AND gate.enabled IS TRUE
 ) OR NOT EXISTS (
  SELECT 1 FROM public.workshop_memberships m
  JOIN public.workshops w ON w.id=m.workshop_id
  JOIN auth.users u ON u.id=m.user_id
  WHERE m.workshop_id=wid AND m.user_id=auth.uid() AND m.status='active'
    AND m.role IN ('owner','admin','reception')
    AND w.status='active' AND u.email_confirmed_at IS NOT NULL
 ) THEN RAISE EXCEPTION 'BT_FLOW_ACCESS_DENIED' USING ERRCODE='42501'; END IF;
 PERFORM bt_platform_private.assert_pilot_write_license(wid);
END $$;

CREATE OR REPLACE FUNCTION bt_com_private.archive_authorize(wid uuid,actor uuid,writing boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF current_setting('role',true)<>'service_role' AND actor IS DISTINCT FROM auth.uid() THEN
 RAISE EXCEPTION 'ARCHIVE_ACTOR_INVALID' USING ERRCODE='42501'; END IF;
 IF actor IS NULL OR NOT EXISTS(SELECT 1 FROM auth.users u
 JOIN public.workshop_memberships m ON m.user_id=u.id JOIN public.workshops w ON w.id=m.workshop_id
 WHERE u.id=actor AND u.email_confirmed_at IS NOT NULL AND m.workshop_id=wid
 AND m.status='active' AND m.role IN ('owner','admin') AND w.status='active') THEN
 RAISE EXCEPTION 'ARCHIVE_DENIED' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM bt_com_private.rollout WHERE workshop_id=wid AND archive_read_enabled
 AND (NOT writing OR archive_enabled)) THEN RAISE EXCEPTION 'ARCHIVE_DISABLED' USING ERRCODE='55000'; END IF;
 IF writing THEN PERFORM bt_platform_private.assert_pilot_write_license(wid); END IF;
END $$;

CREATE OR REPLACE FUNCTION public.bt_plan04_operations_status(p_workshop_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE u uuid:=bt_platform_private.actor(); flow_ok boolean; archive_ok boolean; read_ok boolean;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN public.workshops w ON w.id=m.workshop_id
   WHERE m.user_id=u AND m.workshop_id=p_workshop_id AND m.status='active' AND w.status='active') THEN
  RAISE EXCEPTION 'Workshop not authorized' USING ERRCODE='42501'; END IF;
 -- Agenda has its own gate: disabling scheduling must not disable physical intake.
 SELECT enabled INTO flow_ok FROM bt_flow_live_private.rollout WHERE workshop_id=p_workshop_id;
 SELECT archive_enabled,archive_read_enabled INTO archive_ok,read_ok FROM bt_com_private.rollout WHERE workshop_id=p_workshop_id;
 RETURN pg_catalog.jsonb_build_object('workshopId',p_workshop_id,
  'operationsEnabled',coalesce(flow_ok AND archive_ok AND read_ok AND bt_platform_private.pilot_write_license_allows(p_workshop_id),false),
  'documentsEnabled',coalesce(read_ok,false));
END $$;
COMMIT;
