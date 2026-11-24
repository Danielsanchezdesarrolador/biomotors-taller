## SEC07-S3-R4 — RESTORE_EXIT 1 / MISSING_ROLE; reconciliación de roles globales (23/11/2026, Chile)

**Evidencia real del propietario (PowerShell 5.1):**
```text
BT_SEC07_S3_R4: START
BT_SEC07_S3_R4_LAB: READY
BT_SEC07_S3_R4_RESTORE_EXIT: 1
BT_SEC07_S3_R4_FIRST_ERROR: MISSING_ROLE
BT_SEC07_S3_R4_RESULT: SCHEMA_ACL_NOT_COMPLETE
```

R4 arrancó el bootstrap oficial del mismo lab Supabase PG17 y ejecutó `pg_restore --schema-only --exit-on-error --single-transaction` sin omitir owners/ACL. La clasificación detectó una referencia a un rol inexistente. No se conoce la identidad del rol exacto: el clasificador descartó ese dato junto al stderr crudo al destruir el contenedor. **No atribuir el fallo a un nombre concreto ni a corrupción de v04.** No certificó el exit GPG de esta ejecución porque el wrapper sale al primer error de restore; los PASS previos R3/R8/R9 conservan su alcance. R4 no toca producción ni altera backup.

**Corrección fundamentada de diseño:** PostgreSQL `pg_dump` de una base guarda definiciones/owners/ACL de objetos, pero no crea roles globales del clúster (https://www.postgresql.org/docs/17/app-pgdump.html; https://www.postgresql.org/docs/17/app-pg-dumpall.html, y guía https://supabase.com/docs/guides/self-hosting/restore-from-platform). A diferencia de S4B-R6, el bootstrap oficial ya funciona; sus roles no garantizan coincidencia con los de Supabase administrado. El inventario real anterior identificó 15 roles no-`pg_*`, sin roles de negocio personalizados identificados: anon, authenticated, authenticator, cli_login_postgres, dashboard_user, postgres, service_role, supabase_admin, supabase_auth_admin, supabase_etl_admin, supabase_privileged_role, supabase_read_only_user, supabase_realtime_admin, supabase_replication_admin y supabase_storage_admin. Roles globales y sus 25 membresías no son equivalentes a las ACL de objetos.

**R5 propuesto, NO ejecutado:** conservar la imagen y arranque R8 probados; antes de descifrar, comparar roles del laboratorio con inventario fuente conocido. Exigir presencia de roles centrales y anon/authenticated sin SUPERUSER/BYPASSRLS/LOGIN. Solo si falta un rol de infraestructura **ya identificado en el inventario real y en la allowlist fija** (cli_login_postgres, dashboard_user, supabase_etl_admin, supabase_privileged_role, supabase_read_only_user, supabase_replication_admin), crear su representación local restringida **NOLOGIN NOSUPERUSER NOCREATEROLE NOCREATEDB NOREPLICATION NOBYPASSRLS NOINHERIT**, sin contraseñas ni memberships. No cambiar atributos de roles existentes ni crear roles desconocidos. Mostrar únicamente nombres permitidos y conteo, y reportar claramente que son placeholders de identidad, no recuperación de atributos/membresías administradas. Ejecutar una sola restauración schema-only de v04 con owners/ACL, sin cargar filas, comprobar métricas de S3-R1 y roles efectivos, indicar coincidencia o discrepancia sin atribuirla automáticamente a diferencia temporal. Si reaparece MISSING_ROLE, extraer del primer ERROR solo el nombre si pertenece al inventario permitido, no SQL ni logs; de otro modo NOT_IN_INVENTORY_OR_UNPARSED, STOP. No volver a intentar automáticamente. Cualquier PASS con placeholders es **reproducción de ACL de esquema en laboratorio con roles representativos, NO paridad de roles globales ni recuperación funcional de Supabase**.

**Estado:** S3-R4 no completado. S3-R3 inventario ACL PASS y S4B/S4C conservados. S3 global y S4 integral abiertas. No repetir etapas aprobadas, no exportar de nuevo producción por este error, no usar Codex, no despliegue, `main` docs-only `[skip render]`. La próxima ejecución debe aportar evidencia nueva de reconciliación de dependencias antes de restaurar, no una repetición de R4.
 
---

# ByteTorque — SEC07 S3-R3: ACL y default ACL presentes en archive v04

**Fecha de evidencia:** sesión 23–24/11/2026, PC propietario Windows PowerShell 5.1. **Rama GitHub:** `main`. **Tipo:** documentación sanitizada `[skip render]`. **Producción:** no conectada en esta prueba.

## Salida íntegra del procedimiento

```text
BT_SEC07_S3_R3: START
BT_SEC07_S3_R3_LAB: READY
BT_SEC07_S3_R3_GPG: PASS
BT_SEC07_S3_R3_TOC: READ_PASS
BT_SEC07_S3_R3_TOC_OBJECTS: 889
BT_SEC07_S3_R3_TOC_ACL_ITEMS: 213
BT_SEC07_S3_R3_TOC_DEFAULT_ACL_ITEMS: 24
BT_SEC07_S3_R3_TOC_OWNER_POSTGRES: 360
BT_SEC07_S3_R3_RESULT: ACL_ITEMS_PRESENT
```

## Resultado nuevo acreditado

El fichero `*_nobom_v04.dump.gpg` S2-R11, con la clave S1A seleccionada, pudo descifrarse y leerse mediante `pg_restore --list` en el contenedor cliente local sin red. El índice contiene **889 elementos, 213 entradas clasificadas ACL, 24 DEFAULT ACL** y **360 elementos cuyo último token era `postgres`**. Estas cifras son del **archive íntegro**, no conteos de los objetos ByteTorque estrictamente ni cotejo directo con la instancia PostgreSQL 17.11 productiva. La cantidad de entradas en el TOC no equivale a cantidad de GRANTs por objeto ni a número de propietarios reproducibles.

**Aprendizaje operacional:** `--no-acl --no-owner` omitió aplicar privilegios y propietarios durante las restauraciones R8/R9. La evidencia R3 apunta a que el archive conserva información necesaria; **no se justifica reexportar roles/ACL de producción antes de intentar usar ese mismo contenido.** Los roles globales del clúster no se deducen del TOC y son capa aparte.

## Relación con datos de producción ya leídos

Inventario agregado S3-R1: 12 tablas públicas con ACL explícita, 6 default ACL en ámbito de aplicación, 1 owner para las 12 tablas. Investigaciones S3-R3 preflight conectado en transacción READ ONLY: 31 roles PostgreSQL totales (16 `pg_*`, 0 `bt_*`), 25 membresías, y en esquemas `public/bt_*` 20 tablas y 37 funciones con owner `postgres`; esquema `public` es de `pg_database_owner` y dos privados de `postgres`. No se encontraron roles personalizados identificados; eso NO equivale a que todo el clúster sea portable sin dependencias Supabase.

## Siguiente paso y límites

**S3-R4 propuesto — NO EJECUTADO:** laboratorio nuevo desechable con entrypoint Supabase completo, `bt_s4` desde `template0`, descifrado binario GPG, `pg_restore --schema-only --exit-on-error --single-transaction` **sin los flags omisores `--no-owner` o `--no-acl`**, comprobar que owners/GRANT/DEFAULT ACL relevantes se puedan aplicar; comparar métricas sanitizadas con snapshot fuente. Evitar cargar filas/datos (ya acreditados en R8 y R9). Si bootstrap o permisos fallan, clasificar primer error sanitizado y STOP; no emitir SQL, nombres privados ni introducir roles arbitrarios. Shell y compatibilidad Windows se deben verificar antes de una ejecución autorizada.

**No se puede declarar aún:** propietarios/ACL restaurados, paridad de grants con producción actual, recuperación Auth/Storage físico/Edge/Render, DR frente a pérdida total del PC. No repetir TOC/S2, ni R8/R9.

**Referencia oficial:** https://www.postgresql.org/docs/17/app-pgrestore.html.
