# CHECKPOINT 54 — BT-SEC07-R3-ROLE-CATALOG-CORRECTED-PASS

**Fecha:** 20/11/2026 (America/Santiago). **Repo:** `Danielsanchezdesarrolador/biomotors-taller`; **rama exclusiva:** `main`; **HEAD anterior:** `473a1d394d0d0ec24aecde6124f63f7338176310`.

## 1. Autorización, control de origen y método

Propietario respondió **«autorizo»** a una **única SEGUNDA consulta correctiva de inventario agregado de roles** para reparar INC-53, expresamente sin recuperar nombres de roles, contraseñas ni datos de clientes; sin exportación, cambios de permisos ni nuevos respaldos. Permiso para **UNA SELECT**, consumido en este bloque.

Antes de la consulta se leyeron `AGENTS.md`, `agent.md`, `roadmap.md`, CP53, contrato R3 y registro de incidentes; se verificó `main` HEAD. Se revisó la lista exacta `RESERVED_ROLES` en [Supabase CLI v3.0.0, pg-dump.env.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/pg-dump.env.ts):
`anon`, `authenticated`, `authenticator`, prefijo `cli_login_`, `dashboard_user`, `pgbouncer`, `postgres`, `service_role`, prefijo `supabase_`, `pgsodium_keyholder`, `pgsodium_keyiduser`, `pgsodium_keymaker`, `pgtle_admin`. Se diferencia además prefijo PostgreSQL **literal `pg_`**, no `LIKE 'pg_%'` que trataba `_` como comodín.

## 2. UNA SELECT real agregada — SQL sin escritura, nombres ni datos

Se invocó exactamente **una vez** la acción Supabase conectada `execute_sql` para `biomotors-taller`, contra el catálogo `pg_catalog.pg_roles`, y se retornaron únicamente cuatro valores agregados. Consulta reproducible, sin secretos ni identificadores privados:

```sql
WITH role_flags AS (
 SELECT
  (starts_with(rolname::text, 'pg_')
   OR rolname::text IN ('anon','authenticated','authenticator','dashboard_user',
    'pgbouncer','postgres','service_role','pgsodium_keyholder','pgsodium_keyiduser',
    'pgsodium_keymaker','pgtle_admin')
   OR starts_with(rolname::text, 'cli_login_')
   OR starts_with(rolname::text, 'supabase_')) AS es_reservado_correcto,
  (rolname::text LIKE 'pg_%'
   AND NOT starts_with(rolname::text, 'pg_')
   AND rolname::text NOT IN ('anon','authenticated','authenticator','dashboard_user',
    'pgbouncer','postgres','service_role','pgsodium_keyholder','pgsodium_keyiduser',
    'pgsodium_keymaker','pgtle_admin')
   AND NOT starts_with(rolname::text, 'cli_login_')
   AND NOT starts_with(rolname::text, 'supabase_')) AS falso_positivo_del_filtro_anterior
 FROM pg_catalog.pg_roles
)
SELECT
 COUNT(*)::integer AS roles_totales,
 COUNT(*) FILTER (WHERE es_reservado_correcto)::integer AS roles_sistema_o_reservados,
 COUNT(*) FILTER (WHERE NOT es_reservado_correcto)::integer AS roles_candidatos_personalizados,
 COUNT(*) FILTER (WHERE falso_positivo_del_filtro_anterior)::integer AS falsos_positivos_filtro_like_anterior
FROM role_flags;
```

**Resultado real:**

```text
BT_SEC07_R3_ROLE_CATALOG_CORRECTED_QUERY: PASS_SELECT_ONLY
BT_SEC07_R3_ROLE_CATALOG_TOTAL: 31
BT_SEC07_R3_ROLE_CATALOG_RESERVED: 31
BT_SEC07_R3_ROLE_CATALOG_CUSTOM_CANDIDATES: 0
BT_SEC07_R3_ROLE_CATALOG_PREVIOUS_FILTER_FALSE_POSITIVES: 0
BT_SEC07_R3_ROLE_NAMES_RETURNED: 0
BT_SEC07_R3_PG_DUMPALL: NOT_ATTEMPTED
BT_SEC07_R3_ROLE_BACKUP: NOT_CREATED
BT_SEC07_R3_OWNERS_ACL_RECOVERABILITY: NOT_PROVEN
```

**Precisión sobre formato:** los marcadores `BT_SEC07_*` son **resumen documental construido a partir** de la respuesta SQL; la respuesta original del conector contenía solo los campos `roles_totales=31`, `roles_sistema_o_reservados=31`, `roles_candidatos_personalizados=0`, `falsos_positivos_filtro_like_anterior=0`.

Reconciliación in situ de la misma respuesta: **31 = 31 reservados + 0 candidatos**; **0 falsos positivos** de `LIKE 'pg_%'`. El primer inventario CP53 tenía filtro demasiado amplio, pero **no cambió los números observados en este origen en este momento**. No se enviaron al chat nombres de roles ni detalles de pertenencia o contraseñas. No se ejecutaron funciones definidas por el usuario, no se consultaron tablas de clientes.

## 3. Resolución del incidente y alcance de cero roles propios

**INC-53 `BT-SEC07-R3-ROLE-INVENTORY-PG-WILDCARD-53`: CERRADO (corrección validada en origen).** Causa: `LIKE 'pg_%'` trataba `_` como wildcard, podía excluir `pgX` ajenos al prefijo reservado `pg_`. Solución: `starts_with(rolname::text,'pg_')` y métrica de falsos positivos en una única SELECT con resultado real cero. No fue fallo de PostgreSQL ni del usuario.

**Conclusión positiva acotada:** bajo la lista fija de roles de `supabase/cli@v3.0.0` y exclusión de roles internos `pg_`, **NO había candidatos adicionales personalizados entre los 31 roles visibles al momento de esta consulta**. **NO equivale** a certificar permisos y membresías, roles administrados de proveedor para recuperación fuera de Supabase, roles que se creen después, ni restauración integral. **No fabricar un `CREATE ROLE` ni forzar `pg_dumpall` para producir SQL no vacío**. El antiguo `roles.sql.gpg` descifra 0 bytes y el productor anterior salió con código no-cero: **no es un respaldo válido**, aunque el inventario de roles propios sea 0.

**No confundir R3 con roles inexistentes:** siguen existiendo 31 roles gestionados, propietarios de objetos, privilegios por objeto, `GRANT/REVOKE`, `ALTER DEFAULT PRIVILEGES`, ACL de esquemas, membresías, permisos de ejecución de funciones y políticas RLS; la restauración estructural R2 empleó `--no-owner --no-acl`. No hay evidencia nueva sobre su restauración.

## 4. Próxima fase sugerida — NO ejecutada ni autorizada

**Prioridad:** diagnóstico aislado de cobertura de **owners/ACL/default privileges** a partir del inventario/TOC cifrado de respaldo existente **sin descifrar el archivo histórico con llave privada sin nueva autorización**. Si cobertura no está presente, diseñar captura granular de metadatos/ACL con SELECT agregado read-only mediante nueva autorización o un export de esquema separado con permisos estrictos. **No ejecutar automáticamente** ni nuevas consultas `pg_roles` ni export `--role-only`; no seguir probando las suites 18/14/15 ya PASS.

SSL enforcement del proyecto está **OFF** por captura CP48; CP46 TLS PC→pooler `verify-full` PASS, backend reportó `SSL: NO` para sesión, `END_TO_END_TLS: NOT_CERTIFIED`. Cambio del interruptor implica reinicio DB, exige permiso distinto; no realizado.

## 5. Alcance de cambios / continuidad

Solo **documentación GitHub `main`** con `[skip render]` como checkpoint; no archivos de código productivo, no migrations, deploys, DB writes, modificaciones de roles/ACL, backups, GPG histórico, Docker, Render, SSL enforcement, Drive o GitHub Actions. Piloto `BT-PILOT-QA-04: A REPASAR`.

**Prompt para siguiente chat:** «Continuar ByteTorque SEC-07 `main`, leer AGENTS.md/agent.md/roadmap.md, CP54 y registro de incidentes. Usuario autorizó una sola SELECT correctiva sobre `pg_catalog.pg_roles`, EJECUTADA: **31 roles totales, 31 reservados, 0 candidatos personalizados, 0 falsos positivos filtro previo**, sin nombres ni SQL mutante. INC-53 wildcard LIKE 'pg_%' CERRADO con `starts_with(rolname,'pg_')`. Lista reservada CLI v3.0.0 cotejada. NO necesidad de inventar roles propios, pero antiguo roles.sql.gpg vacío y productor con error NO son respaldo; **owners, ACL/GRANT/default privileges/permissions y restauración integral siguen pendientes**. Nueva fase propuesta: inventario/TOC de respaldo existente bajo permiso separado, sin reabrir base ni GPG histórico automáticamente. SSL enforcement OFF, PC TLS verify-full PASS/backend SSL NO; no cambiar sin plan reinicio. No más SELECT con permiso consumido, no pg_dumpall, deploy, Drive; documentar próximos resultados, mantener piloto A REPASAR». 
