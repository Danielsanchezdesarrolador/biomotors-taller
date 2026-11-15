-- Synthetic CP03 real-PostgreSQL assertions. ON_ERROR_STOP enforced by CI.
INSERT INTO auth.users(id,email) VALUES
 ('11111111-1111-4111-8111-111111111111','owner-a@example.test'),
 ('22222222-2222-4222-8222-222222222222','admin-a@example.test'),
 ('33333333-3333-4333-8333-333333333333','mechanic-a@example.test'),
 ('44444444-4444-4444-8444-444444444444','reception-a@example.test'),
 ('55555555-5555-4555-8555-555555555555','owner-b@example.test');
INSERT INTO public.workshops(id,name) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Synthetic A'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Synthetic B');
INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','owner'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','admin'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','33333333-3333-4333-8333-333333333333','mechanic'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','44444444-4444-4444-8444-444444444444','reception'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','55555555-5555-4555-8555-555555555555','owner');
INSERT INTO public.customers(workshop_id,id,full_name,created_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','Cliente Test A','11111111-1111-4111-8111-111111111111'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-4bbb-8bbb-000000000001','Cliente Test B','55555555-5555-4555-8555-555555555555');
INSERT INTO public.vehicles(workshop_id,id,customer_id,plate,make,model,created_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000011','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','AB-1234','Kia','Rio','11111111-1111-4111-8111-111111111111'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-4bbb-8bbb-000000000011','bbbbbbbb-bbbb-4bbb-8bbb-000000000001','AB1234','Kia','Rio','55555555-5555-4555-8555-555555555555');

-- Composite FK denies attaching a customer of workshop A to workshop B.
DO $$ BEGIN
 BEGIN
  INSERT INTO public.vehicles(workshop_id,customer_id,plate,make,model,created_by)
  VALUES('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
         'aaaaaaaa-aaaa-4aaa-8aaa-000000000001','CD1234','Hyundai','i10',
         '55555555-5555-4555-8555-555555555555');
  RAISE EXCEPTION 'CROSS_TENANT_FK_BYPASS';
 EXCEPTION WHEN foreign_key_violation THEN NULL;
 END;
END $$;

-- Same plate, different formatting within one workshop is NOT a second vehicle.
DO $$ BEGIN
 BEGIN
  INSERT INTO public.vehicles(workshop_id,customer_id,plate,make,model,created_by)
  VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
         'aaaaaaaa-aaaa-4aaa-8aaa-000000000001','ab1234','Kia','Rio',
         '11111111-1111-4111-8111-111111111111');
  RAISE EXCEPTION 'DUPLICATE_PLATE_WAS_ALLOWED';
 EXCEPTION WHEN unique_violation THEN NULL;
 END;
END $$;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.role_table_grants
            WHERE grantee='authenticated' AND privilege_type='DELETE'
              AND table_name IN ('customers','vehicles')) THEN
   RAISE EXCEPTION 'DELETE GRANTED TO AUTHENTICATED';
 END IF;
END $$;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.customers) <> 1
    OR (SELECT count(*) FROM public.vehicles) <> 1 THEN
   RAISE EXCEPTION 'RLS LEAK FOR OWNER A';
 END IF;
END $$;
INSERT INTO public.customers(workshop_id,full_name,email)
VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Nuevo Cliente','new@example.test');
INSERT INTO public.vehicles(workshop_id,customer_id,plate,make,model)
VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'aaaaaaaa-aaaa-4aaa-8aaa-000000000001',NULL,'Suzuki','Swift');
DO $$ BEGIN
 IF (SELECT count(*) FROM public.customers) <> 2 THEN
   RAISE EXCEPTION 'OWNER CANNOT ADD A CUSTOMER';
 END IF;
 -- No column grant for workshop_id, id or created_by on UPDATE.
 BEGIN
  UPDATE public.customers SET workshop_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  RAISE EXCEPTION 'TENANT_KEY_MUTABLE';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 -- No ability to write a foreign tenant, even by guessing its UUID.
 BEGIN
  INSERT INTO public.customers(workshop_id,full_name)
  VALUES('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Unauthorized');
  RAISE EXCEPTION 'CROSS_TENANT_INSERT_ALLOWED';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;

-- Mechanic can see only own workshop; cannot create/edit customer.
SELECT set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.vehicles) <> 2 THEN
   RAISE EXCEPTION 'MECHANIC MISSING SAME_TENANT READ';
 END IF;
 BEGIN
  INSERT INTO public.customers(workshop_id,full_name)
  VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Mechanic Should Fail');
  RAISE EXCEPTION 'MECHANIC_CREATED_CUSTOMER';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;

-- Reception can add customers; must not see B.
SELECT set_config('request.jwt.claim.sub','44444444-4444-4444-4444-444444444444',false);
SELECT current_user, auth.uid() AS uid,
 (SELECT count(*) FROM public.workshop_memberships) AS memberships_visible,
 (SELECT count(*) FROM public.workshops) AS workshops_visible,
 (SELECT count(*) FROM public.workshop_memberships m
   JOIN public.workshops w ON w.id = m.workshop_id
   WHERE m.workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
     AND m.user_id=auth.uid() AND m.status='active'
     AND m.role IN ('owner','admin','reception') AND w.status='active') AS allowed_write;
INSERT INTO public.customers(workshop_id,full_name)
VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Recepcion Test');
DO $$ BEGIN
 IF (SELECT count(*) FROM public.customers) <> 3 THEN
   RAISE EXCEPTION 'RECEPTION WRITE FAILED';
 END IF;
END $$;

-- B can only see B, but the same plate can exist in both tenants.
SELECT set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.customers) <> 1
    OR (SELECT count(*) FROM public.vehicles) <> 1 THEN
   RAISE EXCEPTION 'RLS LEAK FOR OWNER B';
 END IF;
END $$;
RESET ROLE;

-- Disabling a membership removes reads and writes immediately.
UPDATE public.workshop_memberships SET status='disabled'
WHERE user_id='33333333-3333-4333-8333-333333333333';
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.customers) <> 0
    OR (SELECT count(*) FROM public.vehicles) <> 0 THEN
   RAISE EXCEPTION 'DISABLED MEMBER CAN STILL READ';
 END IF;
END $$;
RESET ROLE;
SELECT 'PASS: CP03 customer/vehicle RLS, cross-FK, plate dedup, roles and disabled membership' AS result;
