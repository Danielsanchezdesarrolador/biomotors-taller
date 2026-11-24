## SEC07 S3-R2 — identificadas 6 funciones SECURITY DEFINER en public (sesión 23–24/11/2026)

El propietario entregó CSV real del SQL Editor `biomotors-taller` con las seis funciones de `public` ejecutables por `authenticated`: `bt_creator_is_creator`, `bt_creator_overview`, `bt_creator_manage_subscription`, `bt_creator04_accounts`, `bt_creator04_manage_account` y `bt_plan04_my_status`. **6/6 tienen acceso al esquema, ACL no nula y `anon_puede_ejecutar=false`.** Firma y flags compatibles con [BT_CREATOR_01](docs/sql/BT_CREATOR_01_PRIVATE_SUBSCRIPTIONS_CANDIDATE.sql) y [BT_PLAN_04A](docs/sql/BT_PLAN_04A_PERSONAL_ENTITLEMENTS_CANDIDATE.sql): función de creador basada en `auth.uid()`, comprobaciones de creador para RPC administrativas, MFA `aal2` para 2 funciones que modifican planes y membresía activa por taller en `my_status`. **Códigos CANDIDATE**, no se verificó que los cuerpos SQL remotos coincidan exactamente ni se hizo prueba de llamadas con identidades. **Inventario R2 PASS**; NO afirmar seguridad integral ni ejecutar revocaciones a ciegas. Priorizar recuperación cifrada y real de roles/owners/ACL/default privileges y cobertura externa S3, con nueva autorización para cualquier exportación conectada a producción. Checkpoint: [S3-R2](docs/checkpoints/CHECKPOINT_BT_SEC07_S3_R2_6_FUNCIONES_INVENTARIADAS_20261124.md). Solo docs `main`, `[skip render]`; sin deploy, SQL mutativo, lectura de datos ni secretos.

---

# ByteTorque SEC07 — S3-R1 Inventario SQL REAL, METADATA PASS

**Fecha evidencia:** 23/11/2026, Chile. **Lugar:** SQL Editor del proyecto Supabase `biomotors-taller`, `main` Production, por acción del propietario. **Rama GitHub:** `main`. **Alcance:** lectura agregada del catálogo; sin cambios intencionales de DB, SQL mutativo, backups nuevos, Render, Docker o GPG.

## Resultado real comunicado

```json
{
  "marker": "BT_SEC07_S3_R1_INVENTORY",
  "result": "CATALOG_METADATA_ONLY_NO_CHANGES",
  "tables_found": 12,
  "tables_expected": 12,
  "tables_rls_forced": 9,
  "anon_select_tables": 0,
  "tables_rls_enabled": 12,
  "default_acl_entries": 6,
  "tables_explicit_acl": 12,
  "distinct_table_owners": 1,
  "standard_roles_present": 3,
  "public_roles_privileged": 0,
  "security_definer_functions": 18,
  "authenticated_delete_tables": 0,
  "authenticated_select_tables": 12,
  "security_definer_public_anon_executable": 0,
  "security_definer_public_authenticated_executable": 6
}
```

## Interpretación

- **PASS de presencia/estado:** 12 de 12 tablas objetivo presentes, 12 con RLS habilitada, 9 con FORCE RLS, 0 SELECT directo para `anon`, 0 DELETE directo para `authenticated`, 0 roles públicos con SUPERUSER o BYPASSRLS, 3 roles estándar presentes.
- **RLS sigue siendo la frontera de filas:** 12 tablas con SELECT efectivo por `authenticated` no significa acceso libre a datos de todos los talleres. El resultado no ejecutó consultas como usuarios A/B ni roles de aplicación.
- **ACL/owners reales en fuente:** 12 tablas con ACL explícitas, 6 registros de default ACL, 1 owner distinto entre esas 12 tablas. Son métricas, no una exportación/restauración verificable de permisos.
- **Funciones privilegiadas:** 18 `SECURITY DEFINER` dentro de los esquemas buscados (public y bt_*); 0 funciones SECURITY DEFINER de `public` ejecutables por `anon`; **6 de `public` ejecutables por `authenticated`**. Esto es una superficie que amerita evaluación de identidades, firmas y autorizaciones, no un hallazgo de explotación ni justificación para REVOKE sin estudio. El conteo de 6 NO identifica funciones.
- **Precisión de la lectura:** `has_table_privilege`/`has_function_privilege` informan privilegios efectivos del rol solicitado; no simulan políticas RLS ni prueban que se pueda invocar una función si faltase USAGE en esquema. El marcador `CATALOG_METADATA_ONLY_NO_CHANGES` se generó de forma estática en la consulta, acompañada de una transacción declarada READ ONLY. Sin verificación independiente de logs de producción.

## Límites aún abiertos y prioridad

- **S3 global PENDIENTE:** no existe copia recuperable nueva de roles globales, membresías, owners, permisos GRANT/REVOKE y default ACL; no habilitar cambios productivos hasta tener proceso seguro.
- **S4 global PENDIENTE:** R8 restauración técnica PASS y R9 verificación RLS `workshops` limitada PASS, no paridad temporal ni aislamiento completo por operaciones/roles.
- **S3 externos PENDIENTES:** Auth operativo, Storage bytes (histórico vacío), funciones Edge activas/config y Render env/secrets privados.
- **Siguiente paso:** identificar solo las **seis funciones** `SECURITY DEFINER` en `public` ejecutables por `authenticated` usando consulta READ ONLY de catálogo y contrastarlas contra código `main` con comprobaciones de permisos/membresía. Si no se identifican brechas, no inventar reparaciones. Después diseñar export/restore de ACL sin rehacer todo el backup.
- **Prohibido:** repetir R8/R9, usar `pg_dumpall` anterior que produjo cero bytes, leer filas de clientes, imprimir secretos, ejecutar GRANT/REVOKE/ALTER o desplegar por este checkpoint.

## Documentación relacionada

- [Consulta SQL S3-R1](../sql/BT_SEC07_S3_R1_INVENTARIO_CATALOGO_READONLY.sql)
- [Matriz de cobertura S3](../BT_SEC07_S3_MATRIZ_COBERTURA_20261123.md)
- [Checkpoint S4C-R9](CHECKPOINT_BT_SEC07_S4C_R9_VALIDACION_LIMITADA_PASS_20261123.md)
- [Runbook R8](../recovery/BT_SEC07_S4B_R8_SOLUCION_Y_PREVENCION_20261123.md)

**Estado:** S3-R1 **PASS solo inventario**, S3 y S4 recuperación integral **no cerradas**. Commit documentativo `[skip render]`.
