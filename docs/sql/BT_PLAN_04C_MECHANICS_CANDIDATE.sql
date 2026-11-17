-- CANDIDATE ONLY after 04B. No email delivery, billing or hosted execution.
BEGIN;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE TABLE bt_platform_private.mechanic_extras (
 workshop_id uuid PRIMARY KEY REFERENCES public.workshops(id), seats integer NOT NULL CHECK(seats>=0),
 expires_at timestamptz NOT NULL, provider_reference text NOT NULL
);
CREATE TABLE bt_platform_private.mechanic_invites (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workshop_id uuid NOT NULL REFERENCES public.workshops(id),
 email text NOT NULL, token_hash bytea NOT NULL UNIQUE, state text NOT NULL DEFAULT 'pending' CHECK(state IN('pending','accepted','revoked')),
 expires_at timestamptz NOT NULL, created_by uuid NOT NULL REFERENCES auth.users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bt_plan04_live_invites ON bt_platform_private.mechanic_invites(workshop_id,expires_at) WHERE state='pending';
CREATE TABLE bt_platform_private.team_events (
 request_id uuid PRIMARY KEY, actor uuid NOT NULL REFERENCES auth.users(id), workshop_id uuid NOT NULL REFERENCES public.workshops(id),
 payload jsonb NOT NULL, result jsonb NOT NULL, recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE bt_platform_private.mechanic_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.mechanic_extras FORCE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.mechanic_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.mechanic_invites FORCE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.team_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bt_platform_private.team_events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON bt_platform_private.mechanic_extras,bt_platform_private.mechanic_invites,bt_platform_private.team_events FROM PUBLIC,anon,authenticated;

CREATE FUNCTION bt_platform_private.seats(w uuid) RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce((SELECT CASE WHEN s.state='active' AND (s.is_lifetime OR s.expires_at IS NULL OR s.expires_at>now())
  THEN CASE s.plan WHEN 'plus' THEN 4 WHEN 'full' THEN 8 ELSE 0 END ELSE 0 END
  FROM bt_platform_private.subscriptions s WHERE s.workshop_id=w),0)
 + coalesce((SELECT e.seats FROM bt_platform_private.mechanic_extras e WHERE e.workshop_id=w AND e.expires_at>now()
   AND EXISTS(SELECT 1 FROM bt_platform_private.subscriptions s WHERE s.workshop_id=w AND s.plan IN('plus','full')
   AND s.state='active' AND (s.is_lifetime OR s.expires_at IS NULL OR s.expires_at>now()))),0);
$$;
REVOKE ALL ON FUNCTION bt_platform_private.seats(uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.bt_plan04_team(p_workshop_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE active_count integer; pending_count integer; capacity integer; members jsonb; invites jsonb;
BEGIN
 PERFORM bt_platform_private.manager(p_workshop_id);
 SELECT count(*) INTO active_count FROM public.workshop_memberships WHERE workshop_id=p_workshop_id AND role='mechanic' AND status='active';
 SELECT count(*) INTO pending_count FROM bt_platform_private.mechanic_invites WHERE workshop_id=p_workshop_id AND state='pending' AND expires_at>now();
 capacity:=bt_platform_private.seats(p_workshop_id);
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',m.id,'name',coalesce(p.display_name,'Mecánico'),'status',m.status) ORDER BY m.created_at),'[]'::jsonb)
 INTO members FROM public.workshop_memberships m LEFT JOIN public.profiles p ON p.user_id=m.user_id WHERE m.workshop_id=p_workshop_id AND m.role='mechanic';
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'email',email,'expiresAt',expires_at) ORDER BY created_at),'[]'::jsonb)
 INTO invites FROM bt_platform_private.mechanic_invites WHERE workshop_id=p_workshop_id AND state='pending' AND expires_at>now();
 RETURN jsonb_build_object('workshopId',p_workshop_id,'active',active_count,'pending',pending_count,'capacity',capacity,
 'overCapacity',active_count+pending_count>capacity,'members',members,'invites',invites,'emailDeliveryEnabled',false);
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_team(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_team(uuid) TO authenticated;

CREATE FUNCTION public.bt_plan04_manage_mechanic(p_workshop_id uuid,p_action text,p_email text,p_target_id uuid,p_request_id uuid)
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
REVOKE ALL ON FUNCTION public.bt_plan04_manage_mechanic(uuid,text,text,uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_manage_mechanic(uuid,text,text,uuid,uuid) TO authenticated;

CREATE FUNCTION public.bt_plan04_accept_mechanic(p_token text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=bt_platform_private.actor(); invite bt_platform_private.mechanic_invites%ROWTYPE; reserved integer; existing public.workshop_memberships%ROWTYPE;
BEGIN
 IF p_token IS NULL OR p_token !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Invalid invitation' USING ERRCODE='42501'; END IF;
 SELECT * INTO invite FROM bt_platform_private.mechanic_invites WHERE token_hash=extensions.digest(decode(p_token,'hex'),'sha256');
 IF invite.id IS NULL THEN RAISE EXCEPTION 'Invalid invitation' USING ERRCODE='42501'; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('bt_workshop:'||invite.workshop_id::text,0));
 SELECT * INTO invite FROM bt_platform_private.mechanic_invites WHERE id=invite.id FOR UPDATE;
 IF invite.state<>'pending' OR invite.expires_at<=now() OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=actor AND lower(email)=invite.email)
   OR NOT EXISTS(SELECT 1 FROM public.workshops WHERE id=invite.workshop_id AND status='active') THEN RAISE EXCEPTION 'Invalid invitation' USING ERRCODE='42501'; END IF;
 SELECT * INTO existing FROM public.workshop_memberships WHERE workshop_id=invite.workshop_id AND user_id=actor FOR UPDATE;
 IF existing.id IS NOT NULL AND (existing.role<>'mechanic' OR existing.status='active') THEN RAISE EXCEPTION 'Membership conflict' USING ERRCODE='23505'; END IF;
 SELECT (SELECT count(*) FROM public.workshop_memberships WHERE workshop_id=invite.workshop_id AND role='mechanic' AND status='active')
 +(SELECT count(*) FROM bt_platform_private.mechanic_invites WHERE workshop_id=invite.workshop_id AND state='pending' AND expires_at>now()) INTO reserved;
 IF reserved>bt_platform_private.seats(invite.workshop_id) OR bt_platform_private.seats(invite.workshop_id)=0 THEN RAISE EXCEPTION 'Seat no longer available' USING ERRCODE='23514'; END IF;
 INSERT INTO public.profiles(user_id,display_name) SELECT actor,CASE WHEN length(split_part(email,'@',1))>=2 THEN left(split_part(email,'@',1),120) ELSE 'Mecánico' END FROM auth.users WHERE id=actor ON CONFLICT(user_id) DO NOTHING;
 INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES(invite.workshop_id,actor,'mechanic')
 ON CONFLICT(workshop_id,user_id) DO UPDATE SET status='active';
 UPDATE bt_platform_private.mechanic_invites SET state='accepted' WHERE id=invite.id;
 INSERT INTO bt_platform_private.team_events VALUES(gen_random_uuid(),actor,invite.workshop_id,jsonb_build_array('accept',invite.id),jsonb_build_object('accepted',true),now());
 RETURN jsonb_build_object('workshopId',invite.workshop_id);
END $$;
REVOKE ALL ON FUNCTION public.bt_plan04_accept_mechanic(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bt_plan04_accept_mechanic(text) TO authenticated;
COMMIT;
