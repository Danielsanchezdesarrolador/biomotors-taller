-- CANDIDATE ONLY. Prerequisites: installed PLAN04A; reviewed 04B/04C;
-- LIVE FLOW-FIX-01, Agenda, FLOW-LIVE-02 and Final Archive. No activation on install.
BEGIN;
CREATE FUNCTION public.bt_plan04_operations_status(p_workshop_id uuid) RETURNS jsonb
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
  'operationsEnabled',coalesce(flow_ok AND archive_ok AND read_ok,false),
  'documentsEnabled',coalesce(read_ok,false));
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_operations_status(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_operations_status(uuid) TO authenticated;

-- Database-owner-only activation tool, NEVER callable through user or service APIs.
-- Invoke only after separate approval, Edge rollout and synthetic acceptance.
-- Creation/license grant does NOT automatically enroll any workshop, including BIOMOTORS.
CREATE FUNCTION bt_platform_private.configure_pilot(wid uuid, enabled boolean, reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF wid IS NULL OR enabled IS NULL OR reason IS NULL OR length(btrim(reason)) NOT BETWEEN 12 AND 240 THEN
  RAISE EXCEPTION 'Explicit workshop, state and approval reason required' USING ERRCODE='22023'; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('bt_workshop:'||wid::text,0));
 IF NOT EXISTS(SELECT 1 FROM public.workshops WHERE id=wid AND status='active') THEN
  RAISE EXCEPTION 'Active workshop required' USING ERRCODE='42501'; END IF;
 IF enabled AND NOT EXISTS(SELECT 1 FROM bt_platform_private.account_entitlements e
  JOIN bt_platform_private.subscriptions s ON s.workshop_id=e.bound_workshop_id
  JOIN public.workshop_memberships m ON m.workshop_id=s.workshop_id AND m.user_id=e.user_id
  WHERE e.bound_workshop_id=wid AND e.plan='full' AND e.state='active' AND e.is_lifetime AND e.expires_at IS NULL
  AND e.source='manual' AND s.plan='full' AND s.state='active' AND s.is_lifetime AND s.expires_at IS NULL
  AND s.source='manual' AND m.role='owner' AND m.status='active') THEN
  RAISE EXCEPTION 'Creator-granted bound permanent Full required' USING ERRCODE='42501'; END IF;
 INSERT INTO bt_flow_live_private.rollout(workshop_id,enabled,enabled_at,approval_note)
 VALUES(wid,enabled,CASE WHEN enabled THEN now() END,btrim(reason))
 ON CONFLICT(workshop_id) DO UPDATE SET enabled=excluded.enabled,enabled_at=excluded.enabled_at,approval_note=excluded.approval_note;
 INSERT INTO bt_agenda_private.rollout(workshop_id,enabled,timezone) VALUES(wid,enabled,'America/Santiago')
 ON CONFLICT(workshop_id) DO UPDATE SET enabled=excluded.enabled;
 -- Preserve read access to issued historical originals when writes are disabled.
 INSERT INTO bt_com_private.rollout(workshop_id,archive_enabled,archive_read_enabled)
 VALUES(wid,enabled,enabled) ON CONFLICT(workshop_id) DO UPDATE SET archive_enabled=excluded.archive_enabled,archive_read_enabled=bt_com_private.rollout.archive_read_enabled OR excluded.archive_enabled;
END $$;
REVOKE ALL ON FUNCTION bt_platform_private.configure_pilot(uuid,boolean,text) FROM PUBLIC,anon,authenticated,service_role;
COMMIT;
