-- CANDIDATE ROLLBACK: restores pre-fix behavior including known revocation defect.
-- Do not use as routine fallback: stop premium writes and obtain owner authorization first.
BEGIN;
DROP TRIGGER bt_pilot_operational_write ON public.work_orders;
DROP TRIGGER bt_pilot_operational_write ON public.inspection_findings;
DROP FUNCTION bt_platform_private.pilot_operational_write_guard();
DROP FUNCTION public.bt_plan04_pending_invitations();
DROP FUNCTION public.bt_plan04_accept_pending(uuid);
CREATE OR REPLACE FUNCTION public.bt_plan04_manage_mechanic(p_workshop_id uuid,p_action text,p_email text,p_target_id uuid,p_request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_actor uuid:=bt_platform_private.manager(p_workshop_id); prior bt_platform_private.team_events%ROWTYPE;
 invite bt_platform_private.mechanic_invites%ROWTYPE; token text; iid uuid; reserved integer; payload jsonb; result jsonb; address text;
BEGIN
 IF p_request_id IS NULL OR p_action IS NULL OR p_action NOT IN('invite','rotate','revoke','disable') THEN RAISE EXCEPTION 'Invalid team action' USING ERRCODE='22023'; END IF;
 address:=lower(btrim(coalesce(p_email,'')));
 payload:=jsonb_build_array(p_action,address,p_target_id);
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('bt_workshop:'||p_workshop_id::text,0));
 SELECT * INTO prior FROM bt_platform_private.team_events WHERE request_id=p_request_id;
 IF FOUND THEN
  IF prior.actor<>v_actor OR prior.workshop_id<>p_workshop_id OR prior.payload<>payload THEN RAISE EXCEPTION 'Request conflict' USING ERRCODE='23505'; END IF;
  RETURN prior.result; -- Never store/recover the plaintext token on retries.
 END IF;
 IF p_action='disable' THEN
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
COMMIT;
