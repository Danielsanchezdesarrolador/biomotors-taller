# CHECKPOINT — BT-SEC07-R3-READONLY-TLS-CLIENT-V2-AUTHORIZED-45

**Fecha:** 20/11/2026 · **Repo:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main` · **HEAD anterior:** `cbbb87019f39d22561a75b2f0df178da527c4ef7`.

## Nueva autorización real y límites

El propietario respondió explícitamente **«autorizo»** a **un único segundo intento de conexión read-only** a Supabase, propuesto al cierre del checkpoint 44: diagnosticar TLS PC → pooler por `psql \\conninfo` desde el mismo proceso, separándolo del bit `pg_stat_ssl` pooler → PostgreSQL. Permiso no incluye crear respaldos, dumps de roles, SQL de escritura, cambios en la política SSL enforcement, migraciones, restore, modificación de usuarios/roles, GPG histórico ni conexión adicional ante un STOP. El primer intento ya ocurrió y falló por criterio incorrecto del verificador V1; causa documentada en CP44.

**ZIP V2 ya preparado previamente, verificado en el entorno del asistente en este turno:** `BT_SEC07_R3_READONLY_CONN_V2_20261120.zip`, SHA-256 `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b`. Contiene README, script `bt_sec07_readonly_connection.py` y sus pruebas; código exacto inspeccionado en el ZIP antes de reautorizar ejecución. **No subir el ZIP al repo**. El código:
- pide elegir en PC el `bytetorque_respaldo_local.py` original solo para AST sin ejecutarlo;
- valida destino pooler sesión 5432 contra constantes permitidas, CA PEM público y cliente PG17;
- pide contraseña `getpass` local y la transmite solo en `PGPASSWORD` del subproceso; no la imprime ni crea .pgpass;
- usa `PGSSLMODE=verify-full`, `PGGSSENCMODE=disable`, lectura y SELECT fijo en `BEGIN TRANSACTION READ ONLY`;
- ejecuta SQL metadata y `\\conninfo` en **el mismo proceso psql** (2 comandos, una conexión), captura stdout/stderr sin revelar host, credenciales ni filas SQL;
- reporta `BT_SEC07_CLIENT_POOLER_TLS: CONFIRMED_BY_LIBPQ` solo al validar marcador TLSv1.2/TLSv1.3, y `BT_SEC07_DB_BACKEND_SSL: REPORTED_NO/YES` por separado. Siempre `BT_SEC07_END_TO_END_TLS: NOT_CERTIFIED`.
- bajo falla detiene sin reintentar, código sanitizado.

**QA de preparación anterior CP44:** 35/35 sintéticos PASS y 35/35 tras extraer ZIP. En este turno se volvió a comprobar la **integridad SHA y el contenido** del ZIP original; **no se ejecutó conexión Supabase ni revalidó suite**. Antes de un resultado real de Windows, NO declarar client TLS PASS; el bit backend reportado anteriormente fue SSL false, sigue sin remediar ni auditar política oficial.

## Acción única entregada al propietario

Descargar exactamente ZIP V2 a Descargas y ejecutar el bloque PowerShell SHA-256 documentado en CP44 para usar `bt_sec07_readonly_connection.py` desde TEMP; seleccionar script original y escribir contraseña **solo en PC**. No publicar archivo original, project ref, CA, stdout/stderr no filtrados, contraseñas. Compartir exclusivamente `BT_SEC07_*`; si STOP **no repetir**. Registrar resultado Windows en checkpoint nuevo, incluyendo si `DB_BACKEND_SSL: REPORTED_NO`, sin interpretar PASS de cliente como TLS entre pooler y PostgreSQL.

**Estado de este checkpoint:** SEGUNDO INTENTO AUTORIZADO / **AÚN NO EJECUTADO EN WINDOWS**. R2 estructura snapshot PASS previo, roles SQL antiguo 0 bytes, roles/ACL/owners pendientes, Drive excluido, piloto `BT-PILOT-QA-04 A REPASAR`; no repetir suites de laboratorios anteriores.

## Traspaso

> Continuar ByteTorque SEC-07 en `main` y leer AGENTS.md, agent.md, roadmap.md, CP44 y CP45. El propietario autorizó **un solo segundo intento** de `psql` read-only tras falso STOP V1. ZIP V2 `BT_SEC07_R3_READONLY_CONN_V2_20261120.zip` SHA `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b` verificado, suite 35/35 offline de CP44 PASS; Windows V2 pendiente. Usuario debe ejecutar el bloque SHA + selector original + password local y mandar solo `BT_SEC07_*`. No más conexión sin autorización; no dump/GPG/restore/SSL enforcement. Diferenciar TLS PC-pooler de backend SSL y no certificar end-to-end. Documentar resultado y cierre de incidente en nuevo checkpoint [skip render].
