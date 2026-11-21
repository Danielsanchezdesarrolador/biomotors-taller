# CHECKPOINT — BT-SEC07-PARITY-SQL-INC-24 · Primera consulta de paridad SQL falló; causa de código y corrección V2

**Fecha de trabajo:** 20/11/2026 · **Rama autorizada:** `main` · **Origen:** ejecución real PowerShell del propietario y revisión del ZIP original, verificado por SHA256. **Diagnóstico confirmado a nivel de código; V2 aún NO ejecutada contra Docker/backup real**.

## 1. Evidencia de la ejecución

```text
BT_SEC07_PARITY_PACKAGE: VERIFIED
Ran 32 tests ... OK
BT_SEC07_PARITY_TESTS: OK
Usuario escribió AUTORIZO para UN ensayo Docker aislado.
BT_SEC07_PARITY_SNAPSHOT: HASH_VERIFIED_NO_CHANGES
BT_SEC07_PARITY_PINNED_IMAGE: VERIFIED_NO_DOWNLOAD
BT_SEC07_PARITY_EXTENSION_PREFLIGHT: CONTROL_FILES_MATCH
BT_SEC07_PARITY_CONTAINER: STARTED_OFFLINE_NO_PORTS
BT_SEC07_PARITY_DATABASE_ENGINE: READY
BT_SEC07_PARITY_DATABASE: NEW_TEMPLATE0_CREATED
BT_SEC07_PARITY_GPG_PROCESS: OK
BT_SEC07_PARITY_PG_RESTORE_PROCESS: OK
BT_SEC07_PARITY_RESTORE_ERROR_CLASS: NONE
BT_SEC07_PARITY_RESTORE: REPLAY_COMPLETE_IN_ISOLATION
BT_SEC07_PARITY_CLEANUP: VERIFIED_REMOVED
BT_SEC07_PARITY_BACKUP_AND_MANIFEST: UNCHANGED_AFTER_LAB
BT_SEC07_STOP: PARITY_QUERY_FAILED
BT_SEC07_PARITY_CERTIFICATION: NOT_CERTIFIED
DIAG_EXIT_CODE: 2
BT_SEC07_GPG_CONFIGURATION: RESTORED
```

**Hecho:** GPG y pg_restore completaron la restauración cifrada del snapshot actual en una DB temporal, con Docker sin red ni puertos. El primer paso de auditoría de métricas se detuvo; no hubo validación de RLS/filas/index/funciones. La eliminación del contenedor fue comprobada, backup/manifiesto intactos y variable GPG restaurada. **No se requiere nuevo dump ni hay prueba de corrupción**.

## 2. Causa confirmada en código exacto V1 (no deducida por suposición sobre producción)

Se inspeccionó el **ZIP original real** `BT_SEC07_PARITY_LAB_20261120.zip` SHA256 `795b7d2f38b43bd817f4c63e11770a8f4f8c8ccf33c791afa1d9583847c31cf8`, cuyo programa `BT_SEC07_Parity_Lab.py` tiene SHA256 `eede945c49ff8cf514832a03ea689fe36c117c789541002c5a4800f1518ab6d3`.

En la cadena `CATALOG_METRICS`, el `SELECT concat_ws('|', physical_tables, ...)` final **referenciaba `physical_tables` sin que el CTE `stat` la definiera**. Es un error de SQL de la herramienta de auditoría, ajeno al archivo cifrado. La secuencia de V1 muestra que `run_parity` llama como primera consulta posterior al restore a `parse_metrics(run_local(... CATALOG_METRICS))`; `run_local` descartaba stderr de PostgreSQL y devolvía una etiqueta genérica. La causa de esa primera consulta fallida **está identificada por análisis de fuente y secuencia**, aunque el stderr real quedó suprimido.

**Por qué 32/32 tests no la detectaron:** las pruebas de integración sintética sustituyeron `run_local` por valores numéricos prefabricados; comprobaban el parser y la secuencia, pero **no la correspondencia de alias SQL ni la ejecución SQL real**. Es un defecto de cobertura de pruebas, no un falso reporte de restauración.

Fuentes [PostgreSQL 17 pg_class](https://www.postgresql.org/docs/17/catalog-pg-class.html) (relkind `r` tabla ordinaria, `p` particionada), [Consultas SQL](https://www.postgresql.org/docs/17/sql-select.html).

## 3. Corrección candidata V2 preparada, auditada estáticamente y sintéticamente

**Archivo nuevo solo en conversación, NO se publica código privado en GitHub:** `BT_SEC07_PARITY_LAB_V2_20261120.zip`; tamaño **12.692 bytes**, SHA256 **`0d315b637730500ebfaf7f058c98cde3c1abfa28dc115c70a1e569608f26d667`**. Contiene `BT_SEC07_Parity_Lab_V2.py` (SHA256 `c21be8a1f15b8ee2817d1a1fcb0555a03990946f13fac0598761958aa6c54d99`), `test_BT_SEC07_Parity_Lab_V2.py` y LEEME. **40/40 tests sintéticos PASS**, incluidas regresiones que reproducen omisión del alias, renombre y ausencia de relkind; **40/40 también bajo Python -O**, ZIP integridad OK y pruebas PASS tras extracción limpia.

- Se añade `c.relkind` al CTE `scope`; se define explícitamente `(SELECT count(*) FROM scope WHERE relkind='r') AS physical_tables` en `stat`.
- Validación estática de los 13 nombres de salida/alias antes de cargar código del laboratorio.
- Se abre una nueva base efímera PostgreSQL local, pero **ANTES de descifrar/restaurar el backup** se ejecutan en ella consultas reales `CATALOG_METRICS`, lista de tablas, autoridad BYPASSRLS y catálogo de extensiones. Si alguna falla, la V2 **detiene la ejecución antes de pg_restore**, limpia su contenedor y emite una etiqueta sanitizada por etapa.
- Una vez aprobada la consulta en PostgreSQL real, puede efectuar un único restore del mismo snapshot **solo con autorización nueva y explícita** `BT_SEC07_ALLOW_PARITY_LAB=AUTORIZO`.
- Conserva el script del restaurador base SHA-pinned `9a5ff6167552814ba84bd1ea31242a9b11eb77e58f5a5e4edd3c20f80be7cdb0` y el inventario V2; preserva el ZIP y script V1 para auditoría. No necesita descargas Docker ni credenciales de Supabase alojado.
- **No cuenta como validación real en Windows aún.** El preflight requiere una instancia PostgreSQL de Docker local y no se ejecutó en el entorno del asistente.
- La nueva consulta solo informa agregados y metadatos: no compara contra los datos actuales en producción, no reinstala propietarios/ACL/roles (restore con `--no-owner --no-acl`), no valida acceso A/B real ni Auth/Storage/Edge/Render.
- Backup y manifest mantienen estado sin modificar. No declarar `FULL_PROJECT_RECOVERY` ni alterar `restoration_verified=false`.

## 4. Prevención obligatoria

1. No repetir un `pg_restore` exitoso antes de asegurar mediante **ejecución SQL de preflight** que todas las consultas estáticas de la fase posterior funcionan.
2. No aceptar tests que simulan solamente respuestas de SQL como prueba suficiente de que el SQL está correctamente definido.
3. En cada nueva incidencia: **etapa etiquetada, error sanitizado, código fuente/SHA exacto, causa probada vs hipótesis, pruebas de regresión que fallaban antes y pasan después, recursos/secretos intactos y criterio de reintento**.
4. Si el preflight de V2 se detiene, NO repetir el restore; analizar etiqueta y reparar consulta específica primero.
5. Google Drive sigue fuera del roadmap; no reactivar workflow legado. Mantener `BT-PILOT-QA-04 A REPASAR`.

## 5. Única próxima operación propuesta

El propietario descarga la V2, verifica el hash, extrae en nueva carpeta `$HOME\BT-SEC07-PARITY-LAB-V2` sin tocar V1, ejecuta 40 tests, revisa el nuevo preflight. Autoriza por separado **un** ensayo temporal local y envía solo etiquetas `BT_SEC07_*` y `DIAG_EXIT_CODE`. **Si no autoriza, no ejecutar nada**. No generar nuevos dumps, no conectarse a Supabase/Render, no instalar extensiones, no eliminar otros contenedores. Restauración lógica sí comprobada; paridad aún NO CERTIFICADA.

**Alcance de este commit:** solo `AGENTS.md`, `agent.md`, `roadmap.md`, informe y checkpoints; sin nuevas operaciones en Docker de usuario, sin modificar backups ni producción. `[skip render]`.

## BT-SEC07-PARITY-STRUCTURE-PASS-25 · Ejecución REAL V2 y cierre del defecto `physical_tables`

No volver a describir V2 como «aún no ejecutada». El propietario la ejecutó con permiso independiente: 40/40 tests, `PARITY_SQL_PREFLIGHT: PASSED_BEFORE_GPG_RESTORE`, GPG/pg_restore OK y 20 tablas con 37 filas agregadas; 21 políticas RLS, 35 funciones, 4 extensiones, limpieza correcta, exit 0. **Error V1 por columna omitida: RESUELTO OPERATIVAMENTE**; confirmar preflight de consultas en PostgreSQL real antes de futuros restores. La recuperación se ha verificado **solo estructuralmente**, `SOURCE_ROW_PARITY/ORIGINAL_OWNERS_AND_ACL` siguen NOT_VERIFIED. [Checkpoint definitivo de resultados](CHECKPOINT_BT_SEC07_PARITY_STRUCTURE_PASS_20261120.md). No repetir este laboratorio sin hipótesis nueva.
