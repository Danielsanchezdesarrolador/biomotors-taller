# CHECKPOINT — BT-SEC07-PARITY-STRUCTURE-PASS-25 · Restauración y paridad estructural del snapshot actual: PASS en laboratorio

**Fecha:** 20/11/2026 · **Rama única:** `main` · **Origen:** salida PowerShell real proporcionada por el propietario. Sin acceso de este chat al backup ni datos del usuario.

## Evidencia de ejecución REAL — Paridad V2 corregida

```text
BT_SEC07_V2_PACKAGE: VERIFIED
Ran 40 tests ... OK
BT_SEC07_V2_TESTS: OK
Usuario autorizó expresamente: AUTORIZO
BT_SEC07_PARITY_SNAPSHOT: HASH_VERIFIED_NO_CHANGES
BT_SEC07_PARITY_PINNED_IMAGE: VERIFIED_NO_DOWNLOAD
BT_SEC07_PARITY_EXTENSION_PREFLIGHT: CONTROL_FILES_MATCH
BT_SEC07_PARITY_CONTAINER: STARTED_OFFLINE_NO_PORTS
BT_SEC07_PARITY_DATABASE_ENGINE: READY
BT_SEC07_PARITY_DATABASE: NEW_TEMPLATE0_CREATED
BT_SEC07_PARITY_SQL_PREFLIGHT: PASSED_BEFORE_GPG_RESTORE
BT_SEC07_PARITY_GPG_PROCESS: OK
BT_SEC07_PARITY_PG_RESTORE_PROCESS: OK
BT_SEC07_PARITY_RESTORE_ERROR_CLASS: NONE
BT_SEC07_PARITY_RESTORE: REPLAY_COMPLETE_IN_ISOLATION
BT_SEC07_PARITY_PUBLIC_TABLES: 12
BT_SEC07_PARITY_PRIVATE_TABLES: 8
BT_SEC07_PARITY_PUBLIC_RLS_ENABLED: 12
BT_SEC07_PARITY_PRIVATE_RLS_ENABLED: 8
BT_SEC07_PARITY_PRIVATE_FORCE_RLS: 8
BT_SEC07_PARITY_RLS_POLICIES: 21
BT_SEC07_PARITY_UNVALIDATED_CONSTRAINTS: 0
BT_SEC07_PARITY_INVALID_INDEXES: 0
BT_SEC07_PARITY_FUNCTIONS_IN_SCOPE: 35
BT_SEC07_PARITY_SEQUENCES_IN_SCOPE: 0
BT_SEC07_PARITY_REQUIRED_EXTENSIONS_INSTALLED: 4
BT_SEC07_PARITY_REQUIRED_EXTENSIONS_MISSING: 0
BT_SEC07_PARITY_ROW_COUNT_AUTHORITY: PRIVILEGED_LAB_ONLY
BT_SEC07_PARITY_TABLES_ROW_COUNTED: 20
BT_SEC07_PARITY_TABLES_WITH_ROWS: 12
BT_SEC07_PARITY_PUBLIC_ROWS_TOTAL: 33
BT_SEC07_PARITY_PRIVATE_ROWS_TOTAL: 4
BT_SEC07_PARITY_CATALOG_SAFETY: PASS_ISOLATED
BT_SEC07_PARITY_SOURCE_ROW_PARITY: NOT_VERIFIED_NO_SOURCE_CONNECTION
BT_SEC07_PARITY_ORIGINAL_OWNERS_AND_ACL: NOT_VERIFIED_NO_OWNER_NO_ACL
BT_SEC07_PARITY_FULL_PLATFORM_RECOVERY: NOT_CERTIFIED
BT_SEC07_PARITY_CLEANUP: VERIFIED_REMOVED
BT_SEC07_PARITY_BACKUP_AND_MANIFEST: UNCHANGED_AFTER_LAB
BT_SEC07_PARITY_CERTIFICATION: SNAPSHOT_STRUCTURE_ONLY
DIAG_EXIT_CODE: 0
BT_SEC07_GPG_CONFIGURATION: RESTORED
```

## Aprobaciones y límites — no confundir

**Aprobado en el alcance declarado:** preflight ejecutado sobre PostgreSQL real **antes de GPG/restore**, descifrado y `pg_restore` exitosos, 12 tablas públicas + 8 privadas, 21 políticas RLS, RLS activado en las 20, FORCE en las 8 privadas, 35 funciones en alcance, 4 extensiones instaladas, 0 índices inválidos, 0 restricciones pendientes de validar. Un usuario privilegiado de laboratorio contó 37 filas agregadas (33 públicas / 4 privadas) en las 20 tablas; 12 tenían al menos una fila. Se verificaron limpieza del contenedor y hashes del snapshot/manifiesto sin cambios. Estado `SNAPSHOT_STRUCTURE_ONLY`.

**No aprobado y aún obligatorio antes del piloto con datos reales:**
- `SOURCE_ROW_PARITY: NOT_VERIFIED_NO_SOURCE_CONNECTION`: los 37 registros contados son los que contiene el SNAPSHOT restaurado, **no equivalen a una comparación con Supabase alojado actual** y no demuestran que el respaldo sea reciente si producción cambió.
- El restaurador utiliza `--no-owner --no-acl`. No recrea ni prueba propietarios originales, GRANT/REVOKE, roles PostgreSQL auténticos, contraseñas, membresías, permisos SQL ni capacidad de autenticar/autorizar usuarios reales.
- RLS habilitada y políticas presentes **no demuestra** que taller A no acceda a taller B, que rol mecánico/administrador/creador quede restringido ni que funciones `SECURITY DEFINER` sean seguras. Requiere pruebas de autorización negativas y revocación.
- La cifra 37 es filas agregadas únicamente de tablas `public` y `bt_*` del alcance del script, **no total de todos los esquemas** como `auth` ni `storage`.
- No se certificaron Auth externo, Storage bytes, Edge Functions, SMTP/OAuth, secrets de Render, continuidad de sesión ni segundo backup cifrado fuera del PC.
- **No modificar** `manifest.json`, `restoration_verified=false` ni archivos GPG para fingir recuperación integral. Emitir recibo documental separado; mantener `BT-PILOT-QA-04: A REPASAR`.

## Incidente anterior resuelto — confirmación de no regresión

**Incidente:** `BT_SEC07_STOP: PARITY_QUERY_FAILED` en V1 (32/32 tests sintéticos verdes) después de `pg_restore=OK`. Causa del código: `CATALOG_METRICS` usaba `physical_tables` sin declararlo en CTE `stat`; se simulaban respuestas SQL y no se validaba consulta real.

**Corrección V2:** añadir `c.relkind` y definición de `physical_tables`; pruebas de regresión 40/40 PASS; ejecutar consultas de catálogo dentro de PostgreSQL 17 efímero **ANTES** de transmitir/restaurar archivo GPG. **Prueba real de solución:** salida Windows `PARITY_SQL_PREFLIGHT: PASSED_BEFORE_GPG_RESTORE` + `PARITY_CATALOG_SAFETY: PASS_ISOLATED` + `DIAG_EXIT_CODE: 0`. Solución ahora **VALIDADA EN PC**, sin inferir que futuros SQL distintos estén automáticamente validados. Mantener V1 y error histórico como evidencia; no eliminar scripts viejos automáticamente.

## Próxima etapa concreta — R3 roles / propietarios / ACL, primero análisis seguro

1. Revisar con herramientas **solo lectura** el código y contrato del respaldo actual `roles.catalog.json.gpg` (METADATOS, NO SQL), scripts locales y documentación histórica, sin exponer GPG/SQL/secretos ni ejecutar `pg_dumpall` antiguo que falló.
2. Comparar la estrategia contra la [guía Supabase actualizada 18/11/2026](https://supabase.com/docs/guides/self-hosting/restore-from-platform): `supabase db dump` separado roles/schema/data con filtros de roles/esquemas administrados. La CLI 3 cambió semántica local/remota el 4/11/2026, por lo que verificar `supabase --version` y `supabase db dump --help` antes de cualquier comando real. El documento es referencia, NO autoriza ejecutar conexión/exportación/volcar SQL a disco.
3. Diseñar y probar **en sintético** un productor de roles SQL con verificación de bytes no vacíos, cifrado GPG como streaming y un ensayo de restauración de roles/grants sin modificar origen ni snapshot anterior. Exportación remota nueva **requiere autorización específica** porque implica conectarse a Supabase y generar nuevo artefacto. No reutilizar un `roles.sql.gpg` antiguo vacío.
4. Acordar un paso de validación de privilegios reales y RLS por taller/rol sin publicar datos identificables; completar cobertura externa Auth, Storage, Edge, SMTP y segundo destino cifrado NO Drive.

## Disciplina operativa y controles

- **No** repetir el laboratorio R2 porque ya dio PASS en estructura; siguiente ensayo deberá aportar evidencia distinta (roles/permisos o comparación con origen) y contar con autorización separada.
- Verificar `main` antes de cada cambio, preservar todos los incidentes y sus soluciones en `AGENTS.md`, `agent.md`, `roadmap.md` y `docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md`.
- No imprimir nombres/clientes/correos/RUT/SQL/huellas de claves, rutas privadas, strings de conexión ni stderr bruto.
- **Google Drive excluido** del roadmap; conservar el cifrado GPG, sin destino externo nuevo aprobado.
- Compromiso de recuperación integral y seguridad `BT-PILOT-QA-04` permanece PENDIENTE.

**Este checkpoint es exclusivamente documental**. Sin ejecución de Docker/GPG/Supabase/Render por el asistente, sin migraciones, sin nuevos dumps ni cambios a producción. `[skip render]`.
