-- CANDIDATE ONLY. No hosted execution. Incremental after LIVE PLAN04BC + revocation delta.
BEGIN;
DO $guard$ BEGIN
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='public.bt_plan04_manage_mechanic(uuid,text,text,uuid,uuid)'::regprocedure) IS DISTINCT FROM '143ce5bd72391746862711117ecf4cd3' THEN
 RAISE EXCEPTION 'PILOT_FIX_BASE_DRIFT: manage_mechanic' USING ERRCODE='55000'; END IF;
 IF to_regprocedure('bt_platform_private.assert_pilot_write_license(uuid)') IS NULL OR to_regclass('public.bt_flow_visit_deliveries') IS NULL THEN
 RAISE EXCEPTION 'PILOT_FIX_DEPENDENCY_MISSING' USING ERRCODE='55000'; END IF;
END $guard$;

-- Core CP03 customers/vehicles remain legitimate Basic operations. No CP03 policy/grant changes.
-- Existing helper distinguishes managed pilots from pre-existing legacy workshops.
CREATE FUNCTION bt_platform_private.pilot_operational_write_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE wid uuid; oid uuid; state text; delivered boolean; role_name text;
BEGIN
 wid:=NEW.workshop_id;
 -- Serialize with subscription changes; the entitlement/subscription predicate is rechecked below.
 PERFORM 1 FROM bt_platform_private.subscriptions WHERE workshop_id=wid FOR SHARE;
 PERFORM bt_platform_private.assert_pilot_write_license(wid);
 IF TG_TABLE_NAME='inspection_findings' THEN
  oid:=NEW.order_id;
  SELECT status INTO state FROM public.work_orders WHERE workshop_id=wid AND id=oid FOR UPDATE;
  IF state IS NULL THEN RAISE EXCEPTION 'ORDER_REQUIRED' USING ERRCODE='42501'; END IF;
  SELECT EXISTS(SELECT 1 FROM public.bt_flow_visit_deliveries WHERE workshop_id=wid AND order_id=oid) INTO delivered;
  IF state IN('ready','closed') OR delivered THEN
   SELECT role INTO role_name FROM public.workshop_memberships WHERE workshop_id=wid AND user_id=auth.uid() AND status='active';
   -- A manager may record legitimate resolution follow-up, never rewrite original diagnosis.
   IF TG_OP='INSERT' THEN RAISE EXCEPTION 'FINAL_INSPECTION_READ_ONLY' USING ERRCODE='42501'; END IF;
   IF role_name IS NULL OR role_name NOT IN('owner','admin') OR
     NEW.category IS DISTINCT FROM OLD.category OR NEW.result IS DISTINCT FROM OLD.result OR
     NEW.note IS DISTINCT FROM OLD.note OR NEW.order_id IS DISTINCT FROM OLD.order_id OR
     NEW.vehicle_id IS DISTINCT FROM OLD.vehicle_id OR NEW.recorded_by IS DISTINCT FROM OLD.recorded_by OR
     NEW.resolution IS NOT DISTINCT FROM OLD.resolution THEN
    RAISE EXCEPTION 'FINAL_INSPECTION_READ_ONLY' USING ERRCODE='42501'; END IF;
  END IF;
 ELSE
  IF TG_OP='UPDATE' AND EXISTS(SELECT 1 FROM public.bt_flow_visit_deliveries WHERE workshop_id=wid AND order_id=NEW.id)
   AND (NEW.status IS DISTINCT FROM OLD.status AND NEW.status<>'closed' OR NEW.complaint IS DISTINCT FROM OLD.complaint OR NEW.intake_odometer IS DISTINCT FROM OLD.intake_odometer) THEN
   RAISE EXCEPTION 'DELIVERED_ORDER_IMMUTABLE' USING ERRCODE='42501'; END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION bt_platform_private.pilot_operational_write_guard() FROM PUBLIC,anon,authenticated,service_role;
CREATE TRIGGER bt_pilot_operational_write BEFORE INSERT OR UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION bt_platform_private.pilot_operational_write_guard();
CREATE TRIGGER bt_pilot_operational_write BEFORE INSERT OR UPDATE ON public.inspection_findings FOR EACH ROW EXECUTE FUNCTION bt_platform_private.pilot_operational_write_guard();

CREATE OR REPLACE FUNCTION public.bt_plan04_manage_mechanic(p_workshop_id uuid,p_action text,p_email text,p_target_id uuid,p_request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_actor uuid:=bt_platform_private.manager(p_workshop_id); prior bt_platform_private.team_events%ROWTYPE;
 invite bt_platform_private.mechanic_invites%ROWTYPE; token text; iid uuid; reserved integer; payload jsonb; result jsonb; address text;
BEGIN
 IF p_request_id IS NULL OR p_action IS NULL OR p_action NOT IN('invite','rotate','revoke','disable','reactivate') THEN RAISE EXCEPTION 'Invalid team action' USING ERRCODE='22023'; END IF;
 address:=lower(btrim(coalesce(p_email,'')));
 payload:=jsonb_build_array(p_action,address,p_target_id);
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('bt_workshop:'||p_workshop_id::text,0));
 SELECT * INTO prior FROM bt_platform_private.team_events WHERE request_id=p_request_id;
 IF FOUND THEN
  IF prior.actor<>v_actor OR prior.workshop_id<>p_workshop_id OR prior.payload<>payload THEN RAISE EXCEPTION 'Request conflict' USING ERRCODE='23505'; END IF;
  RETURN prior.result; -- Never store/recover the plaintext token on retries.
 END IF;
 IF p_action='reactivate' THEN
  IF NOT EXISTS(SELECT 1 FROM public.workshop_memberships WHERE id=p_target_id AND workshop_id=p_workshop_id AND role='mechanic' AND status='disabled') THEN
   RAISE EXCEPTION 'Disabled mechanic required' USING ERRCODE='42501'; END IF;
  SELECT (SELECT count(*) FROM public.workshop_memberships WHERE workshop_id=p_workshop_id AND role='mechanic' AND status='active')
   +(SELECT count(*) FROM bt_platform_private.mechanic_invites WHERE workshop_id=p_workshop_id AND state='pending' AND expires_at>now()) INTO reserved;
  IF reserved>=bt_platform_private.seats(p_workshop_id) THEN RAISE EXCEPTION 'No confirmed seat available' USING ERRCODE='23514'; END IF;
  UPDATE public.workshop_memberships SET status='active' WHERE id=p_target_id AND workshop_id=p_workshop_id AND role='mechanic' AND status='disabled';
  iid:=p_target_id;
 ELSIF p_action='disable' THEN
  UPDATE public.workshop_memberships SET status='disabled' WHERE id=p_target_id AND workshop_id=p_workshop_id AND role='mechanic';
  IF NOT FOUND THEN RAISE EXCEPTION 'Mechanic not found' USING ERRCODE='42501'; END IF;
  iid:=p_target_id;
 ELSE
  IF p_action IN('rotate','revoke') THEN
   SELECT * INTO invite FROM bt_platform_private.mechanic_invites WHERE id=p_target_id AND workshop_id=p_workshop_id FOR UPDATE;
   IF invite.id IS NULL OR invite.state<>'pending' THEN RAISE EXCEPTION 'Pending invitation required' USING ERRCODE='42501'; END IF;
   iid:=invite.id; address:=invite.email;
  END IF;
  IF p_action='revoke' THEN UPDATE bt_platform_private.mechanic_invites SET state='revoked' WHERE id=iid;
  ELSE
   IF length(address) NOT BETWEEN 5 AND 254 OR address !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Invalid email' USING ERRCODE='22023'; END IF;
   IF EXISTS(SELECT 1 FROM public.workshop_memberships m JOIN auth.users u ON u.id=m.user_id
     WHERE m.workshop_id=p_workshop_id AND m.status='active' AND lower(u.email)=address) THEN RAISE EXCEPTION 'Already a member' USING ERRCODE='23505'; END IF;
   IF p_action='invite' AND EXISTS(SELECT 1 FROM bt_platform_private.mechanic_invites WHERE workshop_id=p_workshop_id
     AND email=address AND state='pending' AND expires_at>now()) THEN RAISE EXCEPTION 'Invitation already reserved' USING ERRCODE='23505'; END IF;
   SELECT (SELECT count(*) FROM public.workshop_memberships WHERE workshop_id=p_workshop_id AND role='mechanic' AND status='active')
    +(SELECT count(*) FROM bt_platform_private.mechanic_invites WHERE workshop_id=p_workshop_id AND state='pending' AND expires_at>now()
      AND (iid IS NULL OR id<>iid)) INTO reserved;
   IF reserved>=bt_platform_private.seats(p_workshop_id) THEN RAISE EXCEPTION 'No confirmed seat available' USING ERRCODE='23514'; END IF;
   -- Bound request rate without creating user accounts or sending email.
   IF (SELECT count(*) FROM bt_platform_private.team_events WHERE actor=v_actor AND workshop_id=p_workshop_id AND recorded_at>now()-interval '1 hour'
       AND team_events.payload->>0 IN('invite','rotate'))>=20 THEN RAISE EXCEPTION 'Invite rate limit' USING ERRCODE='54000'; END IF;
   token:=encode(extensions.gen_random_bytes(32),'hex');
   IF p_action='invite' THEN
    INSERT INTO bt_platform_private.mechanic_invites(workshop_id,email,token_hash,expires_at,created_by)
    VALUES(p_workshop_id,address,extensions.digest(decode(token,'hex'),'sha256'),now()+interval '48 hours',v_actor) RETURNING id INTO iid;
   ELSE UPDATE bt_platform_private.mechanic_invites SET token_hash=extensions.digest(decode(token,'hex'),'sha256'),expires_at=now()+interval '48 hours' WHERE id=iid;
   END IF;
  END IF;
 END IF;
 result:=jsonb_build_object('id',iid,'action',p_action);
 INSERT INTO bt_platform_private.team_events VALUES(p_request_id,v_actor,p_workshop_id,payload,result,now());
 RETURN result||jsonb_build_object('token',token); -- Ephemeral, never in audit or storage.
END $$;

-- Confirmed recipient may recover pending invitations after registration on any device.
-- No plaintext token is returned, persisted by the browser, or included in audit.
CREATE FUNCTION public.bt_plan04_pending_invitations() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=bt_platform_private.actor(); result jsonb;
BEGIN
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',i.id,'workshopName',w.name) ORDER BY i.created_at),'[]'::jsonb) INTO result
 FROM bt_platform_private.mechanic_invites i JOIN public.workshops w ON w.id=i.workshop_id
 JOIN auth.users u ON u.id=actor AND lower(u.email)=i.email
 WHERE i.state='pending' AND i.expires_at>now() AND w.status='active';
 RETURN result;
END $$;
CREATE FUNCTION public.bt_plan04_accept_pending(p_invitation_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=bt_platform_private.actor(); invitation bt_platform_private.mechanic_invites%ROWTYPE; token text;
BEGIN
 SELECT * INTO invitation FROM bt_platform_private.mechanic_invites WHERE id=p_invitation_id;
 IF invitation.id IS NULL THEN RAISE EXCEPTION 'Invitation denied' USING ERRCODE='42501'; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('bt_workshop:'||invitation.workshop_id::text,0));
 SELECT * INTO invitation FROM bt_platform_private.mechanic_invites WHERE id=p_invitation_id FOR UPDATE;
 IF invitation.state<>'pending' OR invitation.expires_at<=now() OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=actor AND lower(email)=invitation.email) THEN
 RAISE EXCEPTION 'Invitation denied' USING ERRCODE='42501'; END IF;
 token:=encode(extensions.gen_random_bytes(32),'hex');
 UPDATE bt_platform_private.mechanic_invites SET token_hash=extensions.digest(decode(token,'hex'),'sha256') WHERE id=invitation.id;
 -- Existing acceptance rechecks confirmed Auth, active workshop, capacity, role, uniqueness and audit.
 RETURN public.bt_plan04_accept_mechanic(token);
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_pending_invitations(),public.bt_plan04_accept_pending(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_pending_invitations(),public.bt_plan04_accept_pending(uuid) TO authenticated;
COMMIT;
