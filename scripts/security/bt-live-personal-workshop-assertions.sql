-- Synthetic fixtures only. No schema/production change.
INSERT INTO auth.users(id,email) SELECT ('00000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'live-personal-'||n||'@invalid.test' FROM generate_series(1,3)n;
INSERT INTO auth.sessions(id,user_id) SELECT id,id FROM auth.users;
INSERT INTO public.profiles(user_id,display_name) SELECT id,'Synthetic account' FROM auth.users;
INSERT INTO bt_platform_private.creators(user_id) VALUES('00000000-0000-4000-8000-000000000001');
INSERT INTO public.workshops(id,name) VALUES('00000000-0000-4000-8000-000000000011','Synthetic existing Basic');
INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES('00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000002','admin'),('00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000003','owner');
INSERT INTO bt_platform_private.subscriptions(workshop_id,plan,state,source,is_lifetime) VALUES('00000000-0000-4000-8000-000000000011','basic','active','manual',false);
INSERT INTO public.customers(workshop_id,full_name,created_by) VALUES('00000000-0000-4000-8000-000000000011','Synthetic existing customer','00000000-0000-4000-8000-000000000002');
CREATE TEMP TABLE old_state AS SELECT jsonb_build_object('workshop',(SELECT to_jsonb(w) FROM public.workshops w),'subscription',(SELECT to_jsonb(s) FROM bt_platform_private.subscriptions s),'members',(SELECT jsonb_agg(to_jsonb(m) ORDER BY id) FROM public.workshop_memberships m),'customers',(SELECT jsonb_agg(to_jsonb(c) ORDER BY id) FROM public.customers c)) AS snapshot;
CREATE TEMP TABLE created(id uuid);GRANT SELECT,INSERT ON created TO authenticated;
CREATE FUNCTION public.live_identity(n integer,aal text DEFAULT 'aal1') RETURNS void LANGUAGE plpgsql AS $$DECLARE u text:='00000000-0000-4000-8000-'||lpad(n::text,12,'0');BEGIN PERFORM set_config('request.jwt.claim.sub',u,false);PERFORM set_config('request.jwt.claims',json_build_object('aal',aal,'session_id',u)::text,false);END $$;
SET ROLE authenticated;
SELECT public.live_identity(1,'aal2');
SELECT public.bt_creator04_manage_account('00000000-0000-4000-8000-000000000002','full','lifetime',NULL,'Synthetic eligible admin',gen_random_uuid());
SELECT public.live_identity(2);
DO $$BEGIN
 IF public.bt_plan04_my_status(NULL)->>'effectivePlan'<>'full' OR NOT(public.bt_plan04_my_status(NULL)->>'isLifetime')::boolean THEN RAISE EXCEPTION 'PERSONAL_FULL_MISSING';END IF;
 IF public.bt_plan04_my_status('00000000-0000-4000-8000-000000000011')->>'effectivePlan'<>'basic' THEN RAISE EXCEPTION 'OLD_WORKSHOP_CONFUSED_WITH_PERSONAL';END IF;
END $$;
SELECT 'PASS separate server personal Full and existing workshop Basic';
INSERT INTO created SELECT (public.bt_plan04_create_workshop('Synthetic own Full','00000000-0000-4000-8000-000000000099')->>'workshopId')::uuid;
DO $$DECLARE w uuid:=(SELECT id FROM created);BEGIN
 IF public.bt_plan04_my_status(w)->>'effectivePlan'<>'full' OR NOT(public.bt_plan04_my_status(w)->>'isLifetime')::boolean THEN RAISE EXCEPTION 'OWN_WORKSHOP_NOT_FULL';END IF;
 IF (SELECT count(*) FROM public.workshop_memberships WHERE user_id=auth.uid() AND status='active')<>2 THEN RAISE EXCEPTION 'MEMBERSHIPS_LOST';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.workshop_memberships WHERE workshop_id=w AND user_id=auth.uid() AND role='owner') THEN RAISE EXCEPTION 'OWNER_NOT_AUTH';END IF;
 IF (SELECT count(*) FROM public.customers WHERE workshop_id=w)<>0 THEN RAISE EXCEPTION 'CUSTOMERS_COPIED';END IF;
 IF (public.bt_plan04_create_workshop('Synthetic own Full','00000000-0000-4000-8000-000000000099')->>'workshopId')::uuid<>w THEN RAISE EXCEPTION 'RETRY_DUPLICATED';END IF;
END $$;
SELECT 'PASS admin creates own permanent Full; both memberships retained; Auth owner; no copied records; idempotent retry';
SELECT public.live_identity(3);
DO $$BEGIN
 IF EXISTS(SELECT 1 FROM public.workshops WHERE id=(SELECT id FROM created)) THEN RAISE EXCEPTION 'FOREIGN_WORKSHOP_LEAK';END IF;
 BEGIN PERFORM public.bt_plan04_create_workshop('Ineligible Basic',gen_random_uuid());RAISE EXCEPTION 'BASIC_CREATED';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
END $$;
SELECT 'PASS foreign workshop isolation and Basic creation denial enforced by server';
RESET ROLE;
DO $$DECLARE current_state jsonb;BEGIN
 SELECT jsonb_build_object('workshop',(SELECT to_jsonb(w) FROM public.workshops w WHERE id='00000000-0000-4000-8000-000000000011'),'subscription',(SELECT to_jsonb(s) FROM bt_platform_private.subscriptions s WHERE workshop_id='00000000-0000-4000-8000-000000000011'),'members',(SELECT jsonb_agg(to_jsonb(m) ORDER BY id) FROM public.workshop_memberships m WHERE workshop_id='00000000-0000-4000-8000-000000000011'),'customers',(SELECT jsonb_agg(to_jsonb(c) ORDER BY id) FROM public.customers c WHERE workshop_id='00000000-0000-4000-8000-000000000011')) INTO current_state;
 IF current_state<>(SELECT snapshot FROM old_state) THEN RAISE EXCEPTION 'OLD_WORKSHOP_MUTATED';END IF;
 IF (SELECT bound_workshop_id FROM bt_platform_private.account_entitlements WHERE user_id='00000000-0000-4000-8000-000000000002')<>(SELECT id FROM created) THEN RAISE EXCEPTION 'LICENSE_NOT_BOUND';END IF;
END $$;
SELECT 'PASS old Basic workshop/members/customer/subscription byte-equivalent; personal license bound only to new workshop';
SELECT 'LIVE_PERSONAL_WORKSHOP_REGRESSION_PASS';
