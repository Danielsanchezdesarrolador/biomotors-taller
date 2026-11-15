-- CP04 synthetic acceptance assertions in PostgreSQL 17 ephemeral lab only.
-- Run after CP02 + CP03 migrations; uses no hosted credentials.
INSERT INTO auth.users(id,email) VALUES
 ('11111111-1111-4111-8111-111111111111','owner-a@test.local'),
 ('33333333-3333-4333-8333-333333333333','mechanic-a@test.local'),
 ('44444444-4444-4444-8444-444444444444','reception-a@test.local'),
 ('55555555-5555-4555-8555-555555555555','owner-b@test.local');
INSERT INTO public.workshops(id,name) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Test A'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Test B');
INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','owner'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','33333333-3333-4333-8333-333333333333','mechanic'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','44444444-4444-4444-8444-444444444444','reception'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','55555555-5555-4555-8555-555555555555','owner');
INSERT INTO public.customers(workshop_id,id,full_name,created_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','Test customer A','11111111-1111-4111-8111-111111111111'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-4bbb-8bbb-000000000001','Test customer B','55555555-5555-4555-8555-555555555555');
INSERT INTO public.vehicles(workshop_id,id,customer_id,plate,make,model,created_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000011','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','AA1234','Kia','Rio','11111111-1111-4111-8111-111111111111'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-4bbb-8bbb-000000000011','bbbbbbbb-bbbb-4bbb-8bbb-000000000001','BB1234','Kia','Rio','55555555-5555-4555-8555-555555555555');


-- Seed stable identifiers as the database owner; authenticated clients
-- MUST NOT have INSERT grants for server generated ID or audit columns.
INSERT INTO public.work_orders(workshop_id,id,vehicle_id,complaint,intake_odometer,opened_by)
VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000021',
'aaaaaaaa-aaaa-4aaa-8aaa-000000000011','Ruido al frenar',123000,
'11111111-1111-4111-8111-111111111111');
INSERT INTO public.inspection_findings(workshop_id,id,order_id,vehicle_id,category,result,note,resolution,recorded_by)
VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000031',
'aaaaaaaa-aaaa-4aaa-8aaa-000000000021','aaaaaaaa-aaaa-4aaa-8aaa-000000000011',
'Frenos','attention','Pastillas desgastadas','pending',
'11111111-1111-4111-8111-111111111111');
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
DO $$ BEGIN
  IF (SELECT count(*) FROM public.work_orders)<>1 OR
     (SELECT count(*) FROM public.inspection_findings)<>1 THEN
    RAISE EXCEPTION 'CP04_OWNER_A_CANNOT_READ_OWN_ORDER';
  END IF;
  BEGIN
    INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint)
    VALUES('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      'bbbbbbbb-bbbb-4bbb-8bbb-000000000011','Bypass tenant');
    RAISE EXCEPTION 'CP04_CROSS_TENANT_ORDER_INSERT_ALLOWED';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note,resolution)
    VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'aaaaaaaa-aaaa-4aaa-8aaa-000000000021',
      'bbbbbbbb-bbbb-4bbb-8bbb-000000000011','Frenos','attention','Cross tenant','pending');
    RAISE EXCEPTION 'CP04_CROSS_TENANT_FINDING_ALLOWED';
  EXCEPTION WHEN foreign_key_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint)
    VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'aaaaaaaa-aaaa-4aaa-8aaa-000000000011','Duplicated open work order');
    RAISE EXCEPTION 'CP04_DUPLICATE_OPEN_ORDER';
  EXCEPTION WHEN unique_violation THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
DO $$ BEGIN
  IF (SELECT count(*) FROM public.work_orders)<>1 THEN
    RAISE EXCEPTION 'CP04_MECHANIC_CANNOT_SEE_OWN_ORDER';
  END IF;
  BEGIN
    INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint)
    VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-4aaa-8aaa-000000000011','Mechanic attempt');
    RAISE EXCEPTION 'CP04_MECHANIC_CREATED_ORDER';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
INSERT INTO public.inspection_findings(workshop_id,order_id,vehicle_id,category,result,note,resolution)
VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000021',
'aaaaaaaa-aaaa-4aaa-8aaa-000000000011','Luces','ok',NULL,'not_applicable');
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
UPDATE public.work_orders SET status='closed'
WHERE workshop_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' AND id='aaaaaaaa-aaaa-4aaa-8aaa-000000000021';
DO $$ BEGIN
  IF (SELECT closed_at IS NULL FROM public.work_orders WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000021') THEN
    RAISE EXCEPTION 'CP04_CLOSED_AT_MISSING';
  END IF;
  BEGIN
    UPDATE public.inspection_findings SET note='Change after close'
    WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000031';
    RAISE EXCEPTION 'CP04_MODIFIED_CLOSED_DIAGNOSIS';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
-- Outstanding problem remains discoverable on the next visit; recording
-- its resolution never overwrites the original inspection/complaint.
UPDATE public.inspection_findings SET resolution='resolved'
WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000031';
DO $$ BEGIN
  IF (SELECT resolved_at IS NULL FROM public.inspection_findings
      WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000031') THEN
    RAISE EXCEPTION 'CP04_RESOLVED_AT_MISSING';
  END IF;
  UPDATE public.work_orders SET status='received'
    WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000021';
  IF (SELECT status FROM public.work_orders WHERE id='aaaaaaaa-aaaa-4aaa-8aaa-000000000021')<>'closed' THEN
    RAISE EXCEPTION 'CP04_REOPENED_CLOSED_ORDER';
  END IF;
  -- Original vehicle can be received again after the previous order is closed.
  INSERT INTO public.work_orders(workshop_id,vehicle_id,complaint)
  VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-4aaa-8aaa-000000000011','Nueva visita');
END $$;
SELECT set_config('request.jwt.claim.sub','55555555-5555-4555-8555-555555555555',false);
DO $$ BEGIN
  IF (SELECT count(*) FROM public.work_orders)<>0 OR
     (SELECT count(*) FROM public.inspection_findings)<>0 THEN
    RAISE EXCEPTION 'CP04_TENANT_B_DATA_LEAK';
  END IF;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.role_table_grants
   WHERE grantee='authenticated' AND privilege_type='DELETE'
     AND table_name IN ('work_orders','inspection_findings')) THEN
   RAISE EXCEPTION 'CP04_DELETE_PERMISSION_GRANTED';
 END IF;
 IF (SELECT count(*) FROM pg_class WHERE oid IN
      ('public.work_orders'::regclass,'public.inspection_findings'::regclass)
      AND relrowsecurity AND relforcerowsecurity)<>2 THEN
   RAISE EXCEPTION 'CP04_RLS_NOT_FORCED';
 END IF;
END $$;
SELECT 'CP04 PostgreSQL 17 synthetic tenant isolation and history PASS' AS result;
