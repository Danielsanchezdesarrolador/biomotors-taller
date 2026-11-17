-- Synthetic local state only; enabling this control is FORBIDDEN on hosted DB without approval.
INSERT INTO bt_platform_private.billing_customers(provider,customer_id,user_id,subscription_id)
VALUES('offline','synthetic_customer','00000000-0000-4000-8000-000000000003','synthetic_subscription');
SET ROLE service_role;
SELECT set_config('request.jwt.claims','{"role":"service_role"}',false);
DO $$ BEGIN
 BEGIN PERFORM public.bt_plan04_apply_billing('offline','evt_one','synthetic_customer','synthetic_subscription',1,'renewed','plus',1,now()+interval '30 days',700); RAISE EXCEPTION 'BILLING_DEFAULT_ON'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
UPDATE bt_platform_private.billing_control SET enabled=true,provider='offline',max_extra_seats=2;
SET ROLE service_role;
SELECT set_config('request.jwt.claims','{"role":"service_role"}',false);
DO $$ DECLARE r jsonb; BEGIN
 r:=public.bt_plan04_apply_billing('offline','evt_manual','synthetic_customer','synthetic_subscription',1,'renewed','full',0,'2035-01-01',1500);
 IF r->>'state'<>'manual_grant_protected' THEN RAISE EXCEPTION 'MANUAL_GRANT_LOST'; END IF;
END $$;
RESET ROLE;
-- Paid extras coexist with a manual free base and can be removed without revoking it.
SET ROLE service_role;
SELECT set_config('request.jwt.claims','{"role":"service_role"}',false);
SELECT public.bt_plan04_apply_billing('offline','evt_manual_extra','synthetic_customer','synthetic_subscription',2,'renewed','plus',1,'2035-01-01',200);
RESET ROLE;
DO $$ BEGIN
 IF bt_platform_private.seats((SELECT bound_workshop_id FROM public.lab_bound_workshop(3)))<>5 THEN RAISE EXCEPTION 'MANUAL_EXTRA_MISSING'; END IF;
 IF (SELECT source FROM bt_platform_private.account_entitlements WHERE user_id='00000000-0000-4000-8000-000000000003')<>'manual' THEN RAISE EXCEPTION 'MANUAL_BASE_REPLACED'; END IF;
END $$;
SET ROLE service_role;
SELECT set_config('request.jwt.claims','{"role":"service_role"}',false);
SELECT public.bt_plan04_apply_billing('offline','evt_manual_zero','synthetic_customer','synthetic_subscription',3,'renewed','plus',0,'2035-01-01',0);
RESET ROLE;
DO $$ BEGIN
 IF bt_platform_private.seats((SELECT bound_workshop_id FROM public.lab_bound_workshop(3)))<>4 THEN RAISE EXCEPTION 'EXTRAS_NOT_REMOVED'; END IF;
 IF (SELECT state FROM bt_platform_private.account_entitlements WHERE user_id='00000000-0000-4000-8000-000000000003')<>'active' THEN RAISE EXCEPTION 'MANUAL_BASE_REVOKED'; END IF;
END $$;
-- Keep following ordering fixture independent of these additional signed events.
UPDATE bt_platform_private.billing_customers SET last_version=1 WHERE customer_id='synthetic_customer';
-- Fixture simulates a future provider-bound subscription, never a hosted user.
UPDATE bt_platform_private.account_entitlements SET source='billing' WHERE user_id='00000000-0000-4000-8000-000000000003';
SET ROLE service_role;
SELECT set_config('request.jwt.claims','{"role":"service_role"}',false);
SELECT public.bt_plan04_apply_billing('offline','evt_one','synthetic_customer','synthetic_subscription',2,'renewed','plus',1,'2035-01-01',700);
SELECT public.bt_plan04_apply_billing('offline','evt_one','synthetic_customer','synthetic_subscription',2,'renewed','plus',1,'2035-01-01',700);
DO $$ BEGIN
 BEGIN PERFORM public.bt_plan04_apply_billing('offline','evt_bad','synthetic_customer','synthetic_subscription',1,'renewed','plus',1,'2035-01-01',700); RAISE EXCEPTION 'OUT_OF_ORDER'; EXCEPTION WHEN unique_violation THEN NULL; END;
 BEGIN PERFORM public.bt_plan04_apply_billing('offline','evt_mismatch','synthetic_customer','synthetic_subscription',3,'renewed','plus',1,'2035-01-01',500); RAISE EXCEPTION 'EXTRAS_UNPAID'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $$;
SELECT public.bt_plan04_apply_billing('offline','evt_failed','synthetic_customer','synthetic_subscription',3,'payment_failed','plus',1,'2035-01-01',700);
SELECT public.bt_plan04_apply_billing('offline','evt_cancel','synthetic_customer','synthetic_subscription',4,'canceled','plus',1,'2035-01-01',700);
RESET ROLE;
DO $$ BEGIN
 IF (SELECT count(*) FROM bt_platform_private.billing_events WHERE event_id='evt_one')<>1 THEN RAISE EXCEPTION 'DUPLICATE_BILLING_EVENT'; END IF;
 IF (SELECT state FROM bt_platform_private.account_entitlements WHERE user_id='00000000-0000-4000-8000-000000000003')<>'active' THEN RAISE EXCEPTION 'PAID_PERIOD_LOST'; END IF;
 IF bt_platform_private.seats((SELECT bound_workshop_id FROM bt_platform_private.account_entitlements WHERE user_id='00000000-0000-4000-8000-000000000003'))<>5 THEN RAISE EXCEPTION 'CONFIRMED_EXTRA_NOT_APPLIED'; END IF;
END $$;
SET ROLE service_role;
SELECT set_config('request.jwt.claims','{"role":"service_role"}',false);
SELECT public.bt_plan04_apply_billing('offline','evt_refund','synthetic_customer','synthetic_subscription',5,'refunded','plus',1,'2035-01-01',700);
RESET ROLE;
DO $$ BEGIN
 IF (SELECT state FROM bt_platform_private.account_entitlements WHERE user_id='00000000-0000-4000-8000-000000000003')<>'revoked' OR bt_platform_private.seats((SELECT bound_workshop_id FROM public.lab_bound_workshop(3)))<>0 THEN RAISE EXCEPTION 'REFUND_ACCESS_ACTIVE'; END IF;
END $$;
SET ROLE service_role;
SELECT set_config('request.jwt.claims','{"role":"service_role"}',false);
SELECT public.bt_plan04_apply_billing('offline','evt_reconcile','synthetic_customer','synthetic_subscription',6,'reconciled','plus',1,'2035-01-01',700);
RESET ROLE;
DO $$ BEGIN
 IF bt_platform_private.seats((SELECT bound_workshop_id FROM public.lab_bound_workshop(3)))<>5 THEN RAISE EXCEPTION 'RECONCILE_FAILED'; END IF;
END $$;
SET ROLE service_role;
SELECT set_config('request.jwt.claims','{"role":"service_role"}',false);
SELECT public.bt_plan04_apply_billing('offline','evt_expire','synthetic_customer','synthetic_subscription',7,'expired','plus',1,'2035-01-01',700);
RESET ROLE;
DO $$ BEGIN
 IF bt_platform_private.seats((SELECT bound_workshop_id FROM public.lab_bound_workshop(3)))<>0 THEN RAISE EXCEPTION 'EXPIRY_ACCESS_ACTIVE'; END IF;
 IF (SELECT count(*) FROM bt_platform_private.mechanic_invites WHERE workshop_id=(SELECT bound_workshop_id FROM public.lab_bound_workshop(3)) AND state='pending')<>4 THEN RAISE EXCEPTION 'BILLING_DELETED_HISTORY'; END IF;
END $$;
SET ROLE authenticated;
SELECT public.lab_identity(2);
INSERT INTO storage.objects(bucket_id,name,metadata)
SELECT 'bt-workshop-branding',id::text||'/00000000-0000-4000-8000-000000000099.png','{"mimetype":"image/png","size":100}' FROM public.workshops WHERE name='Synthetic commercial name';
DO $$ DECLARE w uuid; p text; BEGIN
 SELECT id INTO w FROM public.workshops WHERE name='Synthetic commercial name'; p:=w::text||'/00000000-0000-4000-8000-000000000099.png';
 PERFORM public.bt_plan04_set_logo(w,p);
 UPDATE storage.objects SET metadata='{"changed":true}' WHERE bucket_id='bt-workshop-branding';
 IF FOUND THEN RAISE EXCEPTION 'LOGO_OVERWRITE_ALLOWED'; END IF;
 DELETE FROM storage.objects WHERE bucket_id='bt-workshop-branding';
 IF FOUND THEN RAISE EXCEPTION 'LOGO_DELETE_ALLOWED'; END IF;
END $$;
SELECT public.lab_identity(3);
DO $$ BEGIN
 IF (SELECT count(*) FROM storage.objects WHERE bucket_id='bt-workshop-branding')<>0 THEN RAISE EXCEPTION 'FOREIGN_LOGO_VISIBLE'; END IF;
END $$;
RESET ROLE;
SET ROLE anon;
DO $$ BEGIN
 IF (SELECT count(*) FROM storage.objects WHERE bucket_id='bt-workshop-branding')<>0 THEN RAISE EXCEPTION 'PUBLIC_LOGO_VISIBLE'; END IF;
END $$;
RESET ROLE;
UPDATE bt_platform_private.billing_control SET enabled=false;
SELECT 'PLAN04_BILLING_OFF_SIGNATURE_BOUNDARY_IDEMPOTENCY_EXTRAS_PRIVATE_BRANDING_PASS';
