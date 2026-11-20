# CHECKPOINT — BT-SEC07-RESTORE-ISOLATED-PASS-22 · Restauración PostgreSQL aislada del snapshot actual aprobada

**Fecha:** 20/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama única:** `main`
**Hito real:** `pg_restore` del backup GPG actual en PostgreSQL 17 de imagen Supabase terminó con éxito y 12 tablas públicas verificadas. **No implica recuperación integral certificada ni permiso para producción.**

## Evidencia EXACTA aportada por el propietario desde PowerShell (sin secretos)

```text
BT_SEC07_LAB_PACKAGE: VERIFIED
Ran 25 tests in 0.232s
OK
BT_SEC07_LAB_TESTS: OK
Usuario escribió AUTORIZO para UNA restauración local aislada.
BT_SEC07_EXISTING_BACKUP: HASHES_VERIFIED_NO_CHANGES
BT_SEC07_SUPABASE_IMAGE: LOCAL_PINNED_DIGEST_OK
BT_SEC07_EXTENSIONS: REQUIRED_4_AVAILABLE_CONTROL_FILES
BT_SEC07_LAB_CONTAINER: STARTED_OFFLINE_NO_PORTS
BT_SEC07_LAB_SUPABASE_POSTGRES: READY
BT_SEC07_LAB_PLACEHOLDER_ROLES: PREPARED
BT_SEC07_LAB_DATABASE: EPHEMERAL_TEMPLATE0_CREATED
BT_SEC07_LAB_GPG_PROCESS: OK
BT_SEC07_LAB_PG_RESTORE_PROCESS: OK
BT_SEC07_LAB_ERROR_CLASS: NONE
BT_SEC07_LAB_STREAM: NONZERO
BT_SEC07_LAB_PUBLIC_TABLE_COUNT: 12
BT_SEC07_LAB_RESTORE: SCHEMA_LOADED_ISOLATED_SCOPE_ONLY
BT_SEC07_LAB_CONTAINER_CLEANUP: VERIFIED_REMOVED
BT_SEC07_BACKUP_AND_MANIFEST: UNCHANGED_VERIFIED_POST_RESTORE
BT_SEC07_FULL_PROJECT_RECOVERY: NOT_CERTIFIED
DIAG_EXIT_CODE: 0
BT_SEC07_GPG_CONFIGURATION: RESTORED
```

## Qué se ha demostrado — y solo eso

1. **Respaldo actual** (no el antiguo de 17/11): ciphertext GPG y manifest preservados con SHA256; clave histórica utilizada sin revelar SQL.
2. **Ensayo autorizado**: se inició una única instancia Docker sin red, sin puertos y con datos efímeros; imagen local de `supabase/postgres:17.12.0.002` cuya huella digest había sido verificada.
3. **Operación SQL**: el proceso GPG terminó con `exit 0`, `pg_restore` terminó con `exit 0` y `--exit-on-error --single-transaction`; transferencia no vacía y sin error clasificado. Se detectaron 12 tablas de relación común/particionada en el esquema `public`.
4. **Limpieza**: el contenedor del laboratorio fue eliminado y la eliminación verificada. El snapshot y manifest quedaron sin cambios. Ningún servicio alojado de Supabase/Render recibió escrituras del ensayo.
5. Este resultado **resuelve el bloqueo de carga del archivo GPG en un PostgreSQL compatible para el alcance ensayado**. Los `.control` de las cuatro extensiones habían coincidido en la imagen Supabase; el resultado `pg_restore=OK` demuestra que el script no encontró un error SQL fatal en este laboratorio.

## Qué NO se ha demostrado: controles pendientes y límites críticos

- El script real `BT_SEC07_Supabase_Isolated_Restore.py`, inspeccionado localmente, solo consulta `SELECT count(*) ... FROM pg_class ... public ... relkind IN ('r','p')` y verifica que sea >0; **NO compara hashes/filas/registros por tabla, datos, claves foráneas, secuencias ni los demás esquemas**. El número 12 es cantidad de tablas públicas, **NO cantidad de registros**.
- `pg_restore` usó deliberadamente `--no-owner --no-acl` (omite propietarios/permisos); los roles placeholders temporales `NOLOGIN` **no son los roles reales ni garantizan acceso funcional**.
- No se compararon políticas RLS, `FORCE RLS`, grants, `SECURITY DEFINER`, dependencias por esquema, `auth.users` ni paridad del catálogo completo entre origen y restauración. Tampoco se probó un login como cliente real.
- No se recuperaron archivos objeto de Storage, secretos, servicios SMTP/OAuth Auth externos, Edge Functions ni configuración Render/GitHub. `roles.catalog.json.gpg` es solo metadata de roles; no existe exportación SQL de roles certificada.
- La imagen Docker de Supabase no sustituye una instancia completa self-hosted configurada; un éxito de restauración lógico no certifica funcionamiento de todos los productos Supabase.
- El código de este laboratorio se conserva **privado en el ZIP entregado en chat**, no en GitHub. 25/25 pruebas offline + ensayo real del usuario. No subir respaldo cifrado, claves, manifest con IDs, TOC ni logs raw a GitHub.

## Siguiente bloque propuesto, SIN repetir el actual por reflejo

**BT-SEC07-PARITY-PLAN-23:** diseñar y probar un solo paquete de auditoría de paridad **solo en laboratorio local**, reutilizando el ZIP y snapshot existente, con **un nuevo restore único SOLO cuando el propietario lo autorice**; recoger conteos sin PII por las tablas/esquemas del alcance, comprobar presencia de RLS/políticas, funciones y extensiones, validar consistencia estructural y limitaciones de grants/roles por el uso de `--no-acl`; no conectarse a Supabase para comparar datos reales sin autorización diferenciada. La comparación contra estado actual requiere un origen autorizado/captura de catálogo separada; los totales de snapshot no prueban igualdad con producción al 20/11 si la base cambió desde la exportación. Un informe seguro solo publicará clases PASS/FAIL y agregados aprobados, no nombres de clientes, correos ni contenido de tablas.

**En paralelo documental, no ejecutar operaciones:** preparar estrategia oficial `supabase db dump` separando roles/schema/data, cobertura Auth/Storage/Edge, custodia de clave y segunda copia cifrada externa NO Drive; auditoría de RLS para talleres A/B y RPC creador. El manifiesto histórico permanece `RESTORE_NOT_VALIDATED` y `restoration_verified=false`; **NO alterarlo ni declararlo validado total**.

**Estado de roadmap:** R1 inventario extensiones CERRADO; R2 restauración base lógica en laboratorio **PASS en alcance**, R2 paridad NO VERIFICADA; R3 roles/servicios externos PENDIENTE; R4 control de acceso PENDIENTE; R5 segunda copia NO Drive PENDIENTE; `BT-PILOT-QA-04: A REPASAR`.

## Continuidad y referencias

- [Evidencia previa de imagen y diseño del ensayo](CHECKPOINT_BT_SEC07_SUPABASE_IMAGE_MATCH_AND_LAB_PREP_20261120.md).
- [Estándar operativo vigente](../BT_SEGURIDAD_ESTANDAR_OPERATIVO_20261120.md).
- [AGENTS.md](../../AGENTS.md), [agent.md](../../agent.md), [roadmap.md](../../roadmap.md).
- Solo documentación, sin cambios a Render, Supabase, PostgreSQL alojado, Docker del usuario, GPG, archivos GPG o claves por este commit. `[skip render]`.
