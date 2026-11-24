-- Disposable lab only. No real PDF, Storage object, user or external system.
INSERT INTO bt_records_private.rollout VALUES('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
INSERT INTO public.customers(workshop_id,id,full_name,created_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000002','Cliente ficticio sin dependencias','11111111-1111-4111-8111-111111111111');
INSERT INTO public.vehicles(workshop_id,id,customer_id,plate,make,model,created_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000012','aaaaaaaa-aaaa-4aaa-8aaa-000000000001','CC1234','Toyota','Ficticio','11111111-1111-4111-8111-111111111111');
INSERT INTO public.work_orders(workshop_id,id,vehicle_id,complaint,opened_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000022','aaaaaaaa-aaaa-4aaa-8aaa-000000000012','Orden ficticia sin actividad','11111111-1111-4111-8111-111111111111');
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
SELECT public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000021',gen_random_uuid())->>'id' AS issued_id \gset
SELECT public.bt_cp05_open_quote('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-000000000022',gen_random_uuid())->>'id' AS draft_id \gset
RESET ROLE;
UPDATE public.quotes SET status='issued',issued_revision=1 WHERE id=:'issued_id';
INSERT INTO public.quote_revisions(workshop_id,quote_id,revision,payload,payload_sha256,pdf_object_path,pdf_sha256,pdf_size,issued_by) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',:'issued_id',1,'{"synthetic":true}',repeat('a',64),'synthetic-only/browser.pdf',repeat('b',64),123,'11111111-1111-4111-8111-111111111111');
