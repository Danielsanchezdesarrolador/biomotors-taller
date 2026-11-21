# CHECKPOINT — BT-SEC07-R3-CLIENT-TLS-V2-WINDOWS-PASS-46 · TLS cliente PASS; tramo backend SSL=NO; end-to-end pendiente

**Fecha:** 20/11/2026 (America/Santiago) · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama exclusiva:** `main` · **HEAD observado antes de los cambios:** `3feff4eb4937b37de8304a3f7fac598a5fdcaf43`. **Fuente de evidencia:** líneas sanitizadas que el propietario copió de Windows después de ejecutar el único segundo intento autorizado en [CP45](CHECKPOINT_BT_SEC07_R3_READONLY_TLS_CLIENT_V2_AUTHORIZED_20261120.md). **Ninguna conexión nueva fue ejecutada por el asistente en esta etapa.**

## 1. Salida REAL de Windows

```text
BT_SEC07_RO_V2_ZIP: VERIFIED
BT_SEC07_PG17_PSQL: PRESENT
BT_SEC07_SOURCE_CONFIG: SAFE_STATIC_MATCH
BT_SEC07_CA: PUBLIC_PEM_LOADABLE_NO_TLS_YET
BT_SEC07_SSL_POLICY: VERIFY_FULL_AND_READ_ONLY_ENFORCED
BT_SEC07_TARGET: ORIGINAL_SOURCE_POOLER_5432
BT_SEC07_REMOTE: CONNECTED_CLIENT_TLS_VERIFY_FULL
BT_SEC07_DB_BACKEND_SSL: REPORTED_NO
BT_SEC07_END_TO_END_TLS: NOT_CERTIFIED
BT_SEC07_CLIENT_POOLER_TLS: CONFIRMED_BY_LIBPQ
BT_SEC07_TRANSACTION_READ_ONLY: ON
BT_SEC07_SERVER_MAJOR: 17
BT_SEC07_SERVER_IDENTITY: CONSISTENT_WITH_LOCAL_SOURCE_NOT_INDEPENDENTLY_ATTESTED
BT_SEC07_QUERY: STATIC_SELECT_ONLY
BT_SEC07_ROLES_BACKUP: NOT_ATTEMPTED
BT_SEC07_GPG_HISTORICAL: NOT_ACCESSED
BT_SEC07_PRECHECK: PASS_SINGLE_READONLY_CONNECTION
BT_SEC07_RO_V2_WINDOWS: PASS_CLIENT_TLS_ONLY
```

El asistente **no vio la contraseña**; esta se solicitó únicamente en la consola local. No se compartieron hosts sensibles, CA, identificadores del proyecto, SQL ni datos de clientes. ZIP V2 SHA-256 ya documentado: `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b`, verificado en Windows en esta ejecución.

## 2. Conclusiones que sí están demostradas y límites

| Control | Conclusión |
|---|---|
| Herramienta V2 Windows | **PASS** `RO_V2_WINDOWS: PASS_CLIENT_TLS_ONLY` |
| Cliente PG17 | Presente (validado en preflight) |
| Configuración estática de origen | `SAFE_STATIC_MATCH` respecto de archivo original seleccionado; **identidad del proyecto no atestiguada independientemente** |
| Certificado CA local | PEM público cargable; la comprobación del cliente al establecer conexión usó `verify-full` |
| TLS PC → pooler | **CONFIRMED_BY_LIBPQ**; `PGSSLMODE=verify-full`, `PGGSSENCMODE=disable`, `\\conninfo` en mismo `psql` |
| Usuario/DB/servidor | Autenticación exitosa; DB y usuario congruentes con código fuente local, versión PG17 |
| Consulta al origen | **Solo SELECT fijo de metadatos en transacción READ ONLY**, `TRANSACTION_READ_ONLY: ON` |
| TLS del backend PostgreSQL visto en `pg_stat_ssl` | **`REPORTED_NO`**. No declarar ese tramo cifrado |
| TLS de extremo a extremo | **`NOT_CERTIFIED`**: TLS cliente PASS no basta |
| Roles reales, grants, owners/ACL, GPG/backup | **NO INTENTADOS** |
| Migraciones/cambios de configuración SSL/enforcement | **NO AUTORIZADOS NI REALIZADOS** |

**Cuidado técnico:** `SSL_POLICY: VERIFY_FULL_AND_READ_ONLY_ENFORCED` indica controles del cliente y de la transacción, **no prueba que Supabase tenga activo «Enforce SSL on incoming connections»** para todos sus accesos. La sesión concreta estuvo en modo read-only, **no** se probó un rol SQL permanentemente sin permiso de escritura ni se verificó el estado de todos los clientes. `REPORTED_NO` es una observación real del backend de **esa conexión** a través del pooler; no demuestra por sí sola cuál es la causa ni que toda comunicación interna de Supabase sea en texto plano.

## 3. INC-44 corregido: causa vs resultados

**`BT-SEC07-SSL-ATTESTATION-WRONG-LEG-44` — CERRADO OPERATIVAMENTE.** V1 había interpretado `pg_stat_ssl` del backend PostgreSQL como comprobación directa del TLS entre PC y pooler y produjo `SESSION_TLS_NOT_CONFIRMED`. V2 separó ambas señales. Resultado real Windows PASS en tramo PC→pooler; se dejó **sin ocultar** `DB_BACKEND_SSL: REPORTED_NO`. Este incidente era del criterio del lector V1, NO una prueba de fallo de contraseña ni corrupción de backup. V1 **obsoleto**, no repetir; V2 también queda cerrada y no debe repetirse por rutina.

**Nuevo hallazgo abierto:** `BT-SEC07-SSL-UPSTREAM-OBSERVATION-46` — estado de política SSL enforcement del proyecto **NO VERIFICADO** y conexión interna de backend reportada sin SSL; requiere *evaluación* antes de certificar protección de todo el tránsito. No tratar la política como ya apagada o activada; no deducirla del reporte único de backend.

**Verificación pública de contexto (no consulta al proyecto):**
- Documentación oficial Supabase SSL enforcement, [`https://supabase.com/docs/guides/platform/ssl-enforcement`](https://supabase.com/docs/guides/platform/ssl-enforcement), actualizada 16/11/2026: para shared pooler la política cubre **cliente → pooler** y **pooler → PostgreSQL**; activar o cambiar enforcement reinicia DB y puede provocar indisponibilidad temporal.
- PostgreSQL 17 [`pg_stat_ssl`](https://www.postgresql.org/docs/17/monitoring-stats.html): devuelve `ssl` para la conexión observada por el backend. No sustituye `\\conninfo` del cliente si hay pooler intermedio.

## 4. Riesgos, alcance y siguiente decisión

**No hacer más conexiones a Supabase con el permiso CP45:** se consumió el único segundo intento autorizado. **Siguiente puerta propuesta — autorización separada, SOLO LECTURA:** comprobar el **estado actual SSL enforcement del proyecto específico** mediante dashboard (el propietario podría revisarlo manualmente) o consulta GET mediante interfaz oficial compatible, **sin ninguna mutación** ni material secreto compartido por chat. La verificación del estado del proyecto permitiría valorar el `REPORTED_NO` sin activar ni desactivar nada. Si fuera necesario cambiar la política, preparar análisis de impacto sobre pooler, clientes y posible reinicio, y exigir **autorización explícita para ese cambio** después de coordinar ventana.

**R3 roles/owners/ACL:** todavía PENDIENTE y debe esperar a revisión del tramo TLS interno y permisos, o una decisión documentada de riesgo. No ejecutar `pg_dumpall` ni `supabase db dump --role-only` ni GPG histórico sin permiso independiente. Antiguo `roles.sql.gpg` descifra a SQL de 0 bytes (no recuperable), causa `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` sin diagnosticar. R2 backup actual estructural PASS con GPG histórico aislado; **no significa** recovery integral. `BT-PILOT-QA-04 A REPASAR`; Google Drive excluido.

## 5. Estado GitHub

Solo actualización documental en `main`, commit `[skip render]`. No cambiaron repositorio funcional, scripts de backup/rol ni secretos, credenciales, SQL, backups/manifiestos, Supabase, Auth/RLS, Storage, Docker, Render, workflows o Drive. No ejecutar suites históricas 18/14/15 ni repetir diagnóstico TLS ya aprobado.

## 6. Handover para nuevo chat

> Continua ByteTorque SEC-07 desde `main`. Lee `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CLIENT_TLS_V2_WINDOWS_PASS_BACKEND_SSL_PENDING_20261120.md`, `docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md`, verifica HEAD. Usuario ejecutó V2 de diagnóstico TLS en Windows tras autorización de un solo segundo intento: `RO_V2_ZIP: VERIFIED`, `REMOTE: CONNECTED_CLIENT_TLS_VERIFY_FULL`, `CLIENT_POOLER_TLS: CONFIRMED_BY_LIBPQ`, `TRANSACTION_READ_ONLY: ON`, `SERVER_MAJOR: 17`, `QUERY: STATIC_SELECT_ONLY`, `PRECHECK: PASS_SINGLE_READONLY_CONNECTION`, `RO_V2_WINDOWS: PASS_CLIENT_TLS_ONLY`. También `DB_BACKEND_SSL: REPORTED_NO`, `END_TO_END_TLS: NOT_CERTIFIED` — **no confundir TLS cliente PASS con todo el tránsito protegido**, ni concluir automáticamente que la política global está desactivada. INC-44 lector V1 cerrado; hallazgo SSL backend-46 abierto. Documentación oficial Supabase: SSL enforcement controla ambos tramos del pooler compartido, cambios pueden reiniciar DB. **No hacer otras conexiones ni cambiar enforcement sin nueva autorización.** Próximo paso es comprobar estado SSL enforcement **solo lectura con autorización específica** o revisión manual guiada. Export roles/ACL reales sin hacer, GPG histórico con clave coincidente, R2 estructura PASS; viejo roles.sql.gpg 0 bytes, productor error sin causa; no repetir labs 18/14/15/V1/V2/R2, piloto A REPASAR, Drive excluido. Documentar avance en main [skip render].
