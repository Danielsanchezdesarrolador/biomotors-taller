# CHECKPOINT — BT-SEC-BACKUP-RECOVERY-PREP-07 · Preparación autorizada del nuevo respaldo cifrado y restauración aislada

**Fecha:** 19/11/2026. **Rama:** `main`. **Punto de partida:** `7d9618fd4b54401f6d045923e69e33a737d01a9c`. **Estado:** *paquete preparado y QA offline aprobada; ejecución real en Windows pendiente*. **Autorización del propietario:** «autorizo» el bloque completo de nueva exportación cifrada de la base **actual** y restauración aislada, en modo solo lectura de producción, conservando todos los originales, sin cambios en secretos, sin Drive.

## 1. Historia reconciliada

- El ZIP precedente BT-SEC-07 pasó 20/20 pruebas offline en el PC (SHA verificado, exit 0), pero **no estaba activado**. La causa de `pg_dumpall --roles-only --no-role-passwords` exit 1/stderr 75 bytes no fue clasificada; el ciphertext histórico `roles.sql.gpg` de 151 B descifra a 0 B. **No repetir ese productor sin nueva hipótesis**.
- El backup SQL histórico `database.dump.gpg` restauró 7 tablas/25 filas/16 políticas en Docker aislado, pero antecede migraciones CP05, Creator, PLAN-04A. No cubre estado actual.
- El script original `bytetorque_respaldo_local.py` usa pooler de sesión de Supabase `5432`; TLS verify-full y postgres 17 ya instalados localmente. No hay indicación de que 5432 sea problema.

## 2. Nuevo paquete privado y verificación

- Entregado únicamente como archivo descargable en esta conversación **sin versionar código local/backup en GitHub público**: `BT_SEC07_RESPALDO_ACTUAL_20261119.zip`, **22.810 bytes**, SHA256 `0fd76eaa482777a8b920dbdfe32ef3900024ae0ce4c654f88e8f431784610e5a`.
- Contenido: `bt_sec07_backup_restore.py` (nuevo), `bytetorque_respaldo_local_SEC07_CANDIDATO.py`, `ByteTorque_Diagnostico_Roles_SEC07_CANDIDATO.py`, `test_BT_SEC07_offline.py`, `test_bt_sec07_orchestration_offline.py`, `LEEME_BLOQUE_RESPALDO.md`. No se incluyen contraseñas, .pgpass, archivo GPG de datos ni clave privada.
- QA: `python -B -m unittest -q test_BT_SEC07_offline.py test_bt_sec07_orchestration_offline.py`: **35/35 OK en contenedor del asistente**, verificado nuevamente tras extraer el ZIP. ZIP `testzip()` OK. **No son pruebas Windows del nuevo paquete ni usan conexión real**.

## 3. Flujo que ejecutarà el propietario (una sola operación con controles)

1. Verificar SHA256 ZIP exacto y descomprimir en carpeta nueva `BT-SEC07-BACKUP-RUN`; ejecutar 35 pruebas offline **antes** del acceso remoto. No sobrescribir carpeta ni programa original.
2. Sin pedir material secreto al chat: localizar CA único en `~/BT-Secrets`, comprobar GPG y huella pública existente del manifiesto histórico, clave privada presente, Docker+imagen PostgreSQL 17 preinstalada, clientes PG; no descarga imágenes, no instala paquetes, no toca cuentas.
3. Pedir contraseña PostgreSQL solo dentro del terminal; `.pgpass` temporal y `PGOPTIONS=-c default_transaction_read_only=on`. `psql SELECT 1` y versión; TLS `verify-full`. No SQL de escritura a producción.
4. En vez de una tercera ejecución de `pg_dumpall`, extraer mediante SELECT de `pg_roles/pg_auth_members` **metadatos NO sensibles pero cifrados**, sin hashes de contraseña, a `roles.catalog.json.gpg`. Eso NO equivale a SQL de roles; puede fallar y se registra como tal sin invalidar un posterior respaldo de base válido.
5. Exportar `pg_dump --format=custom` entero por pipe binario directo a GPG, comprobar origen no vacío, cabecera `PGDMP`, códigos y SHA256. Solo publicar ruta única `~/BT-Backups/bytetorque-current-sec07-FECHA-UUID` con manifiesto si integridad ciphertext completa; directorios temporales nuevos se limpian ante fallo. No sobrescribe el backup 17/11 ni conserva dump sin cifrar.
6. Crear *únicamente* un contenedor local Docker PostgreSQL 17, `--network none`, sin `-p`, `--tmpfs /var/lib/postgresql/data:...size=2g`, `--rm`; roles NOLOGIN de prueba solo dentro del contenedor. Desencriptar `database.dump.gpg` por pipe a `docker exec -i ... pg_restore --exit-on-error --no-owner --no-acl`, sin archivo SQL temporal. Comprobar salida y que hay tablas en public. Destruir contenedor al terminar.
7. Actualizar únicamente manifiesto privado local con restore result (etiquetas fijas) y estado real. `full_project_backup=false`, exclusiones Storage object bytes, Edge, proveedor Auth, secretos, roles SQL completos. El programa devuelve **3 deliberadamente tras crear un backup**, porque el proyecto integral sigue no certificado; no confundir con error de cifrado. Si falla Docker restore, se conserva backup cifrado nuevo, pero *no se marca recuperable*.

## 4. Riesgos, limitaciones, evidencias ausentes

- **Todavía no se ha ejecutado el paquete en el computador del propietario**; no hay evidencia de nueva exportación, GPG real, Docker real ni restore. No afirmar lo contrario.
- GPG puede requerir pinentry/desbloqueo local. Si falta certificado CA o GPG privado/imagen Docker, el script se detiene **antes** de conectar. No instalar Docker/Postgres/CLI ni cambiar PATH/OAuth de manera automática.
- La base Supabase tiene objetos/extensiones/roles administrados que PostgreSQL vanilla podría no poder restaurar; una falla del test Docker se registrará sin revelar stderr y sin modificar producción. No extrapolar un test simple de tablas a recuperación total.
- Los roles catalogados son *metadatos*: no son el `supabase db dump --role-only` oficial ni roles restaurables con sus privilegios reales. La creación de roles NOLOGIN es solo un auxiliar de laboratorio; preserva cero credenciales de roles. El problema SEC-07 de pg_dumpall sigue sin raíz demostrada.
- La guía oficial [Supabase restore from platform](https://supabase.com/docs/guides/self-hosting/restore-from-platform) distingue roles, esquema, datos y otros servicios, y documenta filtros especiales. El archivo PG custom entero puede incluir objetos internos que fallen en Postgres genérico. Esa diferencia es una posible incompatibilidad de restauración, **no causa probada** del error previo.
- No hay ni backup de Drive ni readback externo. Protección de datos del piloto sigue pendiente de recuperación de snapshot actual en entorno compatible y cobertura de Auth/roles/RLS. `BT-PILOT-QA-04: A REPASAR`.

## 5. Seguridad y efecto de esta entrega

- Este commit modifica **solo** `roadmap.md`, `agent.md` y el presente checkpoint. Código candidato/ZIP privado queda **solo en conversación** y PC cuando se descargue.
- Sin cambios Supabase SQL, RLS, Auth, Render, secretos, OAuth, GitHub workflows, Drive, ni backups anteriores. No se ejecutó ninguna llamada de exportación en el entorno del asistente.
- **Próxima acción concreta:** el propietario ejecuta un **único bloque PowerShell autocontenido `& {...}`** que verifica ZIP SHA, descomprime a carpeta nueva, corre las 35 pruebas offline y **solo si todas pasan** lanza `python -B bt_sec07_backup_restore.py`. Entrega únicamente etiquetas `BT_SEC07_*` y `BLOQUE_EXIT_CODE`; si falla no repetir a ciegas. Luego registrar resultados en roadmap/agent/checkpoint y decidir siguiente control pendiente.
