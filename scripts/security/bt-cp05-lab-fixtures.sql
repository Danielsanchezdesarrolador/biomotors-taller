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

UPDATE public.customers SET email='synthetic@invalid.test';
