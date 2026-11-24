-- ByteTorque SEC07 S3-R1 — catálogo de privilegios, SOLO LECTURA.
-- Ejecutar manualmente ÚNICAMENTE en SQL Editor del proyecto Supabase biomotors-taller.
-- No modifica roles, políticas, datos ni configuración. No devuelve filas de clientes ni secretos.
BEGIN TRANSACTION READ ONLY;

WITH expected_table(name) AS (
    VALUES
      ('workshops'), ('profiles'), ('workshop_memberships'),
      ('customers'), ('vehicles'), ('work_orders'),
      ('inspection_findings'), ('quotes'), ('quote_items'),
      ('quote_revisions'), ('quote_events'), ('quote_delivery_events')
),
tables AS (
    SELECT e.name, c.oid, c.relowner, c.relacl, 
           c.relrowsecurity, c.relforcerowsecurity
    FROM expected_table e
    LEFT JOIN pg_catalog.pg_class c
      ON c.relname = e.name
     AND c.relnamespace = 'public'::pg_catalog.regnamespace
     AND c.relkind IN ('r', 'p')
),
table_metrics AS (
    SELECT
        count(oid) AS tables_found,
        count(*) FILTER (WHERE oid IS NOT NULL AND relrowsecurity) AS tables_rls_enabled,
        count(*) FILTER (WHERE oid IS NOT NULL AND relforcerowsecurity) AS tables_rls_forced,
        count(*) FILTER (WHERE oid IS NOT NULL AND relacl IS NOT NULL) AS tables_explicit_acl,
        count(*) FILTER (WHERE oid IS NOT NULL AND pg_catalog.has_table_privilege('anon', oid, 'SELECT')) AS anon_select_tables,
        count(*) FILTER (WHERE oid IS NOT NULL AND pg_catalog.has_table_privilege('authenticated', oid, 'SELECT')) AS authenticated_select_tables,
        count(*) FILTER (WHERE oid IS NOT NULL AND pg_catalog.has_table_privilege('authenticated', oid, 'DELETE')) AS authenticated_delete_tables,
        count(DISTINCT relowner) AS distinct_table_owners
    FROM tables
),
function_metrics AS (
    SELECT
        count(*) FILTER (WHERE p.prosecdef) AS security_definer_total,
        count(*) FILTER (
            WHERE p.prosecdef AND n.nspname = 'public'
              AND pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
        ) AS security_definer_public_anon_executable,
        count(*) FILTER (
            WHERE p.prosecdef AND n.nspname = 'public'
              AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
        ) AS security_definer_public_authenticated_executable
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' OR left(n.nspname::text, 3) = 'bt_'
),
acl_metrics AS (
    SELECT count(*) AS default_acl_entries
    FROM pg_catalog.pg_default_acl d
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
    WHERE d.defaclnamespace = 0
       OR n.nspname = 'public'
       OR left(n.nspname::text, 3) = 'bt_'
),
role_metrics AS (
    SELECT
        count(*) FILTER (
            WHERE rolname IN ('anon', 'authenticated', 'service_role')
        ) AS standard_roles_present,
        count(*) FILTER (
            WHERE rolname IN ('anon', 'authenticated')
              AND (rolsuper OR rolbypassrls)
        ) AS public_roles_privileged
    FROM pg_catalog.pg_roles
)
SELECT jsonb_pretty(jsonb_build_object(
    'marker', 'BT_SEC07_S3_R1_INVENTORY',
    'tables_expected', 12,
    'tables_found', t.tables_found,
    'tables_rls_enabled', t.tables_rls_enabled,
    'tables_rls_forced', t.tables_rls_forced,
    'tables_explicit_acl', t.tables_explicit_acl,
    'anon_select_tables', t.anon_select_tables,
    'authenticated_select_tables', t.authenticated_select_tables,
    'authenticated_delete_tables', t.authenticated_delete_tables,
    'distinct_table_owners', t.distinct_table_owners,
    'default_acl_entries', a.default_acl_entries,
    'security_definer_functions', f.security_definer_total,
    'security_definer_public_anon_executable', f.security_definer_public_anon_executable,
    'security_definer_public_authenticated_executable', f.security_definer_public_authenticated_executable,
    'standard_roles_present', r.standard_roles_present,
    'public_roles_privileged', r.public_roles_privileged,
    'result', 'CATALOG_METADATA_ONLY_NO_CHANGES'
)) AS bt_sec07_s3_r1_result
FROM table_metrics t
CROSS JOIN function_metrics f
CROSS JOIN acl_metrics a
CROSS JOIN role_metrics r;

COMMIT;
