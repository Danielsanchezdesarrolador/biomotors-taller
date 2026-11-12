-- ByteTorque BT-CP02-C: COMPROBACIONES SQL SOLO LECTURA.
-- Ejecutar únicamente DESPUÉS de autorizar y aplicar la candidata.
-- No crea ni modifica filas. Validar filas y políticas efectivas.
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public'
  AND c.relname IN ('workshops','profiles','workshop_memberships')
  AND c.relkind='r'
ORDER BY c.relname;

SELECT
  tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('workshops','profiles','workshop_memberships')
ORDER BY tablename,policyname;

SELECT
  'workshops' AS table_name,
  has_table_privilege('anon','public.workshops','SELECT') AS anon_can_select,
  has_table_privilege('authenticated','public.workshops','SELECT') AS authenticated_can_select,
  has_table_privilege('authenticated','public.workshops','INSERT') AS client_can_insert,
  has_table_privilege('authenticated','public.workshops','UPDATE') AS client_can_update
UNION ALL
SELECT
  'profiles',
  has_table_privilege('anon','public.profiles','SELECT'),
  has_table_privilege('authenticated','public.profiles','SELECT'),
  has_table_privilege('authenticated','public.profiles','INSERT'),
  has_table_privilege('authenticated','public.profiles','UPDATE')
UNION ALL
SELECT
  'workshop_memberships',
  has_table_privilege('anon','public.workshop_memberships','SELECT'),
  has_table_privilege('authenticated','public.workshop_memberships','SELECT'),
  has_table_privilege('authenticated','public.workshop_memberships','INSERT'),
  has_table_privilege('authenticated','public.workshop_memberships','UPDATE');

-- El UPDATE del perfil es únicamente para display_name.
SELECT
  has_column_privilege(
    'authenticated','public.profiles','display_name','UPDATE'
  ) AS display_name_editable,
  has_column_privilege(
    'authenticated','public.profiles','user_id','UPDATE'
  ) AS user_id_editable;

-- Debe conservarse ensure_rls (O) pero no ser invocable por clientes.
SELECT
  p.proname, p.prosecdef,
  has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
  has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname='rls_auto_enable';

SELECT
  evtname, evtevent, evtenabled
FROM pg_event_trigger
WHERE evtname='ensure_rls';

-- Fuera de estas verificaciones: ejecutar advisor Security y suite real
-- con Auth users A/B (ver doc BT_CP02_C_MATRIZ_PRUEBAS.md).
