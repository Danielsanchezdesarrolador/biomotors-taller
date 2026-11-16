-- Run ONLY in a fresh offline restore container; contains no customer rows in output.
DO $$ DECLARE name text; rel record; BEGIN
 FOREACH name IN ARRAY ARRAY['workshops','profiles','workshop_memberships','customers','vehicles','work_orders','inspection_findings','quotes','quote_items','quote_revisions','quote_events','quote_delivery_events'] LOOP
  IF to_regclass('public.'||name) IS NOT NULL THEN
   SELECT relrowsecurity,relforcerowsecurity INTO rel FROM pg_class WHERE oid=to_regclass('public.'||name);
   IF NOT rel.relrowsecurity OR (name NOT IN ('workshops','profiles','workshop_memberships') AND NOT rel.relforcerowsecurity) THEN RAISE EXCEPTION 'RESTORE_RLS_NOT_FORCED'; END IF;
   IF has_table_privilege('anon','public.'||name,'SELECT') OR has_table_privilege('authenticated','public.'||name,'DELETE') THEN RAISE EXCEPTION 'RESTORE_UNSAFE_GRANTS'; END IF;
  END IF;
 END LOOP;
 IF EXISTS(SELECT 1 FROM public.vehicles v LEFT JOIN public.customers c ON (c.workshop_id,c.id)=(v.workshop_id,v.customer_id) WHERE c.id IS NULL) THEN RAISE EXCEPTION 'RESTORE_ORPHAN_VEHICLE'; END IF;
 IF EXISTS(SELECT 1 FROM public.work_orders o LEFT JOIN public.vehicles v ON (v.workshop_id,v.id)=(o.workshop_id,o.vehicle_id) WHERE v.id IS NULL) THEN RAISE EXCEPTION 'RESTORE_ORPHAN_ORDER'; END IF;
 IF EXISTS(SELECT 1 FROM public.inspection_findings f LEFT JOIN public.work_orders o ON (o.workshop_id,o.id,o.vehicle_id)=(f.workshop_id,f.order_id,f.vehicle_id) WHERE o.id IS NULL) THEN RAISE EXCEPTION 'RESTORE_ORPHAN_FINDING'; END IF;
 IF EXISTS(SELECT 1 FROM public.workshop_memberships m LEFT JOIN auth.users u ON u.id=m.user_id LEFT JOIN public.workshops w ON w.id=m.workshop_id WHERE u.id IS NULL OR w.id IS NULL) THEN RAISE EXCEPTION 'RESTORE_ORPHAN_MEMBERSHIP'; END IF;
END $$;
SELECT json_build_object('auth_users',(SELECT count(*) FROM auth.users),'customers',(SELECT count(*) FROM public.customers),'vehicles',(SELECT count(*) FROM public.vehicles),'orders',(SELECT count(*) FROM public.work_orders),'findings',(SELECT count(*) FROM public.inspection_findings),'rls_fk_grants_verified',true);
