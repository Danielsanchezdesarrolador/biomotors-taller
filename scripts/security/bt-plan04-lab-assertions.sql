-- Synthetic local PostgreSQL ONLY. Never execute this fixture against Supabase.
INSERT INTO auth.users(id,email)
 SELECT ('00000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'plan04-'||n||'@invalid.test' FROM generate_series(1,12)n;
INSERT INTO auth.sessions(id,user_id) SELECT id,id FROM auth.users;
INSERT INTO public.workshops(id,name) VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Existing synthetic QA A'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Existing synthetic QA B');
INSERT INTO public.profiles(user_id,display_name) VALUES('00000000-0000-4000-8000-000000000009','Existing QA owner A'),('00000000-0000-4000-8000-000000000010','Existing QA owner B');
INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','00000000-0000-4000-8000-000000000009','owner'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','00000000-0000-4000-8000-000000000010','owner');
INSERT INTO bt_platform_private.creators(user_id) VALUES('00000000-0000-4000-8000-000000000001');
CREATE TEMP TABLE lab_state(name text PRIMARY KEY,id uuid);
CREATE TEMP TABLE lab_tokens(name text PRIMARY KEY,token text);
GRANT SELECT,INSERT,UPDATE ON lab_state,lab_tokens TO authenticated;
CREATE FUNCTION public.lab_identity(n integer,aal text DEFAULT 'aal1') RETURNS void LANGUAGE plpgsql AS $$
DECLARE u text:='00000000-0000-4000-8000-'||lpad(n::text,12,'0');
BEGIN PERFORM set_config('request.jwt.claim.sub',u,false);
 PERFORM set_config('request.jwt.claims',json_build_object('aal',aal,'session_id',u)::text,false); END $$;
SET ROLE authenticated;
SELECT public.lab_identity(2);
DO $$ BEGIN
 IF public.bt_plan04_my_status(NULL)->>'effectivePlan'<>'basic' THEN RAISE EXCEPTION 'BASIC_PERSONAL'; END IF;
 BEGIN PERFORM public.bt_plan04_create_workshop('Forbidden',gen_random_uuid()); RAISE EXCEPTION 'BASIC_CREATED_WORKSHOP'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM public.bt_creator04_manage_account(auth.uid(),'full','lifetime',NULL,'self grant',gen_random_uuid()); RAISE EXCEPTION 'SELF_PLAN'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM * FROM bt_platform_private.account_entitlements; RAISE EXCEPTION 'PRIVATE_TABLE_ACCESS'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT public.lab_identity(1);
DO $$ BEGIN
 BEGIN PERFORM public.bt_creator04_manage_account('00000000-0000-4000-8000-000000000002','full','lifetime',NULL,'synthetic full','10000000-0000-4000-8000-000000000002'); RAISE EXCEPTION 'MFA_BYPASS'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT public.lab_identity(1,'aal2');
SELECT public.bt_creator04_manage_account('00000000-0000-4000-8000-000000000002','full','lifetime',NULL,'synthetic full','10000000-0000-4000-8000-000000000002');
SELECT public.bt_creator04_manage_account('00000000-0000-4000-8000-000000000003','plus','grant_days',30,'synthetic plus','10000000-0000-4000-8000-000000000003');
DO $$ BEGIN
 BEGIN PERFORM public.bt_creator04_manage_account('00000000-0000-4000-8000-000000000002','plus','lifetime',NULL,'synthetic full','10000000-0000-4000-8000-000000000002'); RAISE EXCEPTION 'IDEMPOTENCY_PAYLOAD_BYPASS'; EXCEPTION WHEN unique_violation THEN NULL; END;
END $$;
SELECT public.lab_identity(2);
INSERT INTO lab_state VALUES('full',(public.bt_plan04_create_workshop('Synthetic Full','20000000-0000-4000-8000-000000000002')->>'workshopId')::uuid);
DO $$ BEGIN
 IF (public.bt_plan04_create_workshop('Synthetic Full','20000000-0000-4000-8000-000000000002')->>'workshopId')::uuid<>(SELECT id FROM lab_state WHERE name='full') THEN RAISE EXCEPTION 'CREATE_REPLAY'; END IF;
 BEGIN PERFORM public.bt_plan04_create_workshop('Second license use',gen_random_uuid()); RAISE EXCEPTION 'DUPLICATE_WORKSHOP'; EXCEPTION WHEN unique_violation THEN NULL; END;
 IF public.bt_plan04_my_status((SELECT id FROM lab_state WHERE name='full'))->>'effectivePlan'<>'full' THEN RAISE EXCEPTION 'WORKSHOP_PLAN_NOT_SYNCED'; END IF;
END $$;
SELECT public.bt_plan04_update_profile((SELECT id FROM lab_state WHERE name='full'),'Synthetic commercial name','owner@invalid.test','123','Synthetic address');
INSERT INTO lab_tokens VALUES('four',public.bt_plan04_manage_mechanic((SELECT id FROM lab_state WHERE name='full'),'invite','plan04-4@invalid.test',NULL,'30000000-0000-4000-8000-000000000004')->>'token');
INSERT INTO lab_tokens VALUES('five',public.bt_plan04_manage_mechanic((SELECT id FROM lab_state WHERE name='full'),'invite','plan04-5@invalid.test',NULL,'30000000-0000-4000-8000-000000000005')->>'token');
DO $$ BEGIN
 IF public.bt_plan04_manage_mechanic((SELECT id FROM lab_state WHERE name='full'),'invite','plan04-4@invalid.test',NULL,'30000000-0000-4000-8000-000000000004') ? 'token' THEN RAISE EXCEPTION 'TOKEN_PERSISTED'; END IF;
 IF public.bt_plan04_team((SELECT id FROM lab_state WHERE name='full'))->>'pending'<>'2' THEN RAISE EXCEPTION 'PENDING_RESERVATIONS'; END IF;
END $$;
INSERT INTO lab_tokens VALUES('old-four',(SELECT token FROM lab_tokens WHERE name='four'));
UPDATE lab_tokens SET token=(public.bt_plan04_manage_mechanic((SELECT id FROM lab_state WHERE name='full'),'rotate',NULL,
 (SELECT (i->>'id')::uuid FROM jsonb_array_elements(public.bt_plan04_team((SELECT id FROM lab_state WHERE name='full'))->'invites') i WHERE i->>'email'='plan04-4@invalid.test'),gen_random_uuid())->>'token') WHERE name='four';
SELECT public.lab_identity(4);
DO $$ BEGIN
 BEGIN PERFORM public.bt_plan04_accept_mechanic((SELECT token FROM lab_tokens WHERE name='old-four')); RAISE EXCEPTION 'ROTATED_TOKEN_USABLE'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT public.lab_identity(2);
INSERT INTO lab_tokens VALUES('expired',public.bt_plan04_manage_mechanic((SELECT id FROM lab_state WHERE name='full'),'invite','plan04-7@invalid.test',NULL,gen_random_uuid())->>'token');
RESET ROLE;
UPDATE bt_platform_private.mechanic_invites SET expires_at=now()-interval '1 minute' WHERE email='plan04-7@invalid.test';
SET ROLE authenticated;
SELECT public.lab_identity(7);
DO $$ BEGIN
 BEGIN PERFORM public.bt_plan04_accept_mechanic((SELECT token FROM lab_tokens WHERE name='expired')); RAISE EXCEPTION 'EXPIRED_INVITE_ACCEPTED'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT public.lab_identity(6);
DO $$ BEGIN
 BEGIN PERFORM public.bt_plan04_accept_mechanic((SELECT token FROM lab_tokens WHERE name='four')); RAISE EXCEPTION 'FOREIGN_EMAIL_ACCEPT'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM public.bt_plan04_team((SELECT id FROM lab_state WHERE name='full')); RAISE EXCEPTION 'FOREIGN_TEAM'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT public.lab_identity(4);
SELECT public.bt_plan04_accept_mechanic((SELECT token FROM lab_tokens WHERE name='four'));
DO $$ BEGIN
 IF public.bt_plan04_my_status(NULL)->>'effectivePlan'<>'basic' OR public.bt_plan04_my_status((SELECT id FROM lab_state WHERE name='full'))->>'effectivePlan'<>'full' THEN RAISE EXCEPTION 'MECHANIC_PAID_PERSONALLY'; END IF;
 BEGIN PERFORM public.bt_plan04_accept_mechanic((SELECT token FROM lab_tokens WHERE name='four')); RAISE EXCEPTION 'TOKEN_REPLAY'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM public.bt_plan04_manage_mechanic((SELECT id FROM lab_state WHERE name='full'),'invite','foreign@invalid.test',NULL,gen_random_uuid()); RAISE EXCEPTION 'MECHANIC_ADMIN'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT public.lab_identity(5);
SELECT public.bt_plan04_accept_mechanic((SELECT token FROM lab_tokens WHERE name='five'));
SELECT public.lab_identity(2);
DO $$ BEGIN
 IF public.bt_plan04_team((SELECT id FROM lab_state WHERE name='full'))->>'active'<>'2' OR public.bt_plan04_team((SELECT id FROM lab_state WHERE name='full'))->>'capacity'<>'8' THEN RAISE EXCEPTION 'TWO_OF_EIGHT_FAILED'; END IF;
 BEGIN PERFORM public.bt_plan04_manage_mechanic((SELECT id FROM lab_state WHERE name='full'),'disable',NULL,(SELECT id FROM public.workshop_memberships WHERE role='owner'),gen_random_uuid()); RAISE EXCEPTION 'DISABLED_OWNER'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT public.lab_identity(3);
INSERT INTO lab_state VALUES('plus',(public.bt_plan04_create_workshop('Synthetic Plus','20000000-0000-4000-8000-000000000003')->>'workshopId')::uuid);
SELECT public.bt_plan04_manage_mechanic((SELECT id FROM lab_state WHERE name='plus'),'invite','quota-'||n||'@invalid.test',NULL,gen_random_uuid()) FROM generate_series(1,4)n;
DO $$ BEGIN
 BEGIN PERFORM public.bt_plan04_manage_mechanic((SELECT id FROM lab_state WHERE name='plus'),'invite','fifth@invalid.test',NULL,gen_random_uuid()); RAISE EXCEPTION 'PLUS_FIFTH_FREE'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN PERFORM public.bt_plan04_profile((SELECT id FROM lab_state WHERE name='full')); RAISE EXCEPTION 'CROSS_WORKSHOP_PROFILE'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT public.lab_identity(1,'aal2');
SELECT public.bt_creator_manage_subscription((SELECT id FROM lab_state WHERE name='full'),'plus','grant_days',30,'bound workshop update',gen_random_uuid());
SELECT public.lab_identity(2);
DO $$ BEGIN
 IF public.bt_plan04_my_status(NULL)->>'effectivePlan'<>'plus' OR public.bt_plan04_my_status((SELECT id FROM lab_state WHERE name='full'))->>'effectivePlan'<>'plus' THEN RAISE EXCEPTION 'LEGACY_DESYNC'; END IF;
END $$;
SELECT public.lab_identity(1,'aal2');
SELECT public.bt_creator04_manage_account('00000000-0000-4000-8000-000000000002','plus','revoke',NULL,'synthetic revoke',gen_random_uuid());
DO $$ BEGIN
 IF (SELECT count(*) FROM public.workshops)<>0 THEN RAISE EXCEPTION 'CREATOR_GAINS_WORKSHOP_ACCESS'; END IF;
END $$;
SELECT public.lab_identity(2);
DO $$ BEGIN
 IF public.bt_plan04_team((SELECT id FROM lab_state WHERE name='full'))->>'active'<>'2' OR NOT (public.bt_plan04_team((SELECT id FROM lab_state WHERE name='full'))->>'overCapacity')::boolean THEN RAISE EXCEPTION 'DOWNGRADE_LOST_MEMBERS'; END IF;
 BEGIN PERFORM public.bt_plan04_manage_mechanic((SELECT id FROM lab_state WHERE name='full'),'invite','blocked@invalid.test',NULL,gen_random_uuid()); RAISE EXCEPTION 'REVOKED_INVITE'; EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
RESET ROLE;
DELETE FROM auth.sessions WHERE user_id='00000000-0000-4000-8000-000000000006';
SET ROLE authenticated;
SELECT public.lab_identity(6);
DO $$ BEGIN
 BEGIN PERFORM public.bt_plan04_my_status(NULL); RAISE EXCEPTION 'REVOKED_SESSION'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM bt_platform_private.team_events WHERE result ? 'token') THEN RAISE EXCEPTION 'AUDIT_TOKEN_LEAK'; END IF;
 IF (SELECT count(*) FROM public.workshops)<>4 OR NOT EXISTS(SELECT 1 FROM public.workshops WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' AND name='Existing synthetic QA A') THEN RAISE EXCEPTION 'EXISTING_QA_CHANGED'; END IF;
END $$;
SELECT 'PLAN04_ACCOUNTS_BINDING_MFA_SYNC_TEAM_RLS_PASS';
