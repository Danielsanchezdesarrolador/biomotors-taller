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

## BT-SEC-BACKUP-RECOVERY-ERR07-V2 · Respuesta al fallo `HISTORICAL_MANIFEST_MISSING` y versión corregida

**Evidencia real del propietario (Windows, 19/11/2026):**

```text
ZIP_INTEGRIDAD_OK
Ran 35 tests in 1.042s
OK
QA_OFFLINE_OK
INICIANDO_RESPALDO_AUTORIZADO
BT_SEC07_STOP: HISTORICAL_MANIFEST_MISSING
BLOQUE_EXIT_CODE: 2
```

**Alcance real:** el proceso v1 ejecutó `find_ca`, `tools_needed`, `find_tool('docker')` y la comprobación de archivo `old_fingerprint(root)`; el fallo se produce ANTES de `docker_image`, `getpass`, `check_db`, toda conexión PostgreSQL, exportación nueva, cifrado, creación de staging o restauración. **NO se creó nuevo backup ni se contactó Supabase.** La comprobación CA/herramientas antes del fallo sí puede haber leído archivos locales no secretos o sus metadatos. El ciphertext antiguo no fue modificado.

**Causa raíz demostrada (nuestro paquete, no el fallo original `pg_dumpall`):** `old_fingerprint` exigía `manifest.json` dentro del backup histórico; `bytetorque_respaldo_local.py` original construye y guarda ese manifiesto únicamente *después* de exportar y cifrar roles, operación que había fallado y dejó `roles.sql.gpg` inútil. Diseñamos un prerrequisito incompatible con el estado anterior. No asumir que este error significa que faltan claves ni que está dañado el `database.dump.gpg` válido. **SEC-07 original sigue con causa no determinada**.

**Solución preparada:** nuevo paquete `BT_SEC07_RESPALDO_ACTUAL_CORREGIDO_20261119.zip`, **25.466 bytes**, SHA256 `9ee61398d67cd7e811f211c70a449878009b36271fce61082479a09db7a6042d`, **entregado solo en conversación, no en repo público**. La función corregida `old_fingerprint(root,gpg)` exige existencia del ciphertext histórico de base, lee solamente su encabezado OpenPGP público (PKESK) con `gpg --list-packets` en `GNUPGHOME` efímero sin claves privadas, identifica un único ID de destinatario, lo asocia a la subclave de cifrado del `--list-secret-keys --with-colons` del perfil local y obtiene la huella de la clave primaria existente. Bloquea destinatario oculto/ambiguo, ausencia de clave, ausencia del ciphertext, discrepancia de huella y manifiesto de proyecto inválido. Si existe manifiesto histórico, lo coteja; **su ausencia es aceptada y NO equivale a daño**. No descifra `database.dump.gpg` antiguo, no imprime IDs de clave ni SQL y no genera nuevos secretos.

**QA v2 en el contenedor del asistente:** `python -B -m unittest -q test_BT_SEC07_offline.py test_bt_sec07_orchestration_offline.py`: **43 tests PASS**, repetido tras descomprimir el nuevo ZIP y verificar `ZipFile.testzip() == None`; AST correcto. **Prueba de integración GPG real con clave y backup COMPLETAMENTE SINTÉTICOS (no pertenecen al usuario):** recipient subkey ↔ primary fingerprint PASS; manifiesto presente y coincidente PASS; ciphertext adulterado rechazado PASS. Son comprobaciones de código y GPG sintético, NO certifican la clave GPG real del PC ni restauración actual.

**Autorización y próxima operación:** el permiso del propietario para el bloque completo de nuevo respaldo cifrado y recuperación aislada sigue vigente; el primer intento se detuvo antes de uso remoto, por lo que se preparó corrección del prerrequisito sin ampliar alcance. Antes de contacto con Supabase, ejecutar **una sola instrucción PowerShell autocontenida** para verificar el nuevo ZIP por SHA256, descomprimirlo en directorio distinto del v1, ejecutar las **43 pruebas offline**, luego invocar el orquestador v2 una vez. No permitir reintentos ciegos. Mantener `BT-PILOT-QA-04: A REPASAR` hasta recuperabilidad efectiva; roles catálogo NO equivale a SQL de roles, ni cubre configuración Auth, Storage object bytes, Edge Functions/secrets o Drive.

**Cambios a GitHub:** solo documentación `AGENTS.md`, `roadmap.md`, `agent.md` y este checkpoint; no se añadieron los scripts ni copias cifradas al repo, no hubo deploy Render ni cambios Supabase/Drive. Este registro no afirma éxito de la ejecución Windows v2.

## BT-SEC-BACKUP-RECOVERY-ERR08-GPG · Parada v2 por reconocimiento del destinatario GPG, diagnóstico sin red preparado

**Evidencia auténtica aportada por el propietario (Windows, 19/11/2026):**

```text
OK
QA_OFFLINE_OK
INICIANDO_RESPALDO_AUTORIZADO_V2
BT_SEC07_STOP: HISTORICAL_RECIPIENT_KEY_NOT_UNIQUELY_PRESENT
BLOQUE_EXIT_CODE: 2
```

**Análisis exacto del código v2:** en `old_fingerprint(root,gpg)`, el mensaje solo se emite tras (a) encontrar `database.dump.gpg` histórico con longitud mínima, (b) reconocer **un único** key ID PKESK público en `gpg --list-packets`, (c) finalizar `gpg --list-secret-keys --with-colons --fingerprint --fingerprint` con código 0, y (d) no construir exactamente una huella primaria con `_secret_primary_matching`. **El código no distingue si el listado privado realmente carece de la clave, si se usó otro homedir durante la restauración vieja, o si el parser falla con esa variante GPG. No afirmar pérdida de clave ni corrupción del backup antiguo.**

**Alcance del fallo:** `main()` invoca `old_fingerprint` ANTES de `docker_image`, `getpass`, `check_db`, `snapshot_catalog`, `pg_dump`, creación del nuevo directorio cifrado, y `isolated_restore`. Por tanto v2 se detuvo sin nueva conexión a Supabase, sin nuevo backup, sin restauración, sin modificación de originales/producción. El `roles.sql.gpg` antiguo sigue inválido y SEC-07 original `pg_dumpall` no identificado.

**Investigación y nuevo artefacto preparado:** se releyó la fuente v2 original del ZIP, más tests; se construyó el **diagnóstico offline autónomo** `BT_SEC07_GPG_DIAGNOSTICO_OFFLINE_20261119.py`, 9.584 bytes, SHA256 `b6d1d14a30b6402aba5406974cfa049163dcb7098d7fb33e651fc9c6c95ec508`. Este script busca *solo el archivo histórico conocido*, analiza encabezado OpenPGP con `--list-packets` en homedir vacío, e inspecciona metadatos del anillo actual `--list-secret-keys` y `--list-keys`, comparando un parser independiente contra el algoritmo v2; solo muestra **categorías predefinidas**, sin nombres, IDs, huellas, rutas privadas, contenido, contraseñas ni stderr. **No ejecuta `--decrypt`, `--export-secret-keys`, comandos SQL ni red.**

**Evidencia de QA del script:** 14/14 comprobaciones sintéticas internas PASS; `py_compile` PASS. Integración real GPG con clave/subclave y ciphertext completamente sintéticos en GNUPGHOME temporal: `KEY_IDENTIFIED_RECHECK_V2_RUNTIME`, `PUBLIC MATCH`, `SECRET MATCH`, comprobación de no fuga PASS. En contenedor asistente no existe el backup real del usuario, y el script correctamente devuelve `STOP_NO_DATA`; **no se ha probado todavía en PC Windows**.

**Condición para siguiente intento:** propietario descarga script de esta conversación, valida su SHA-256 y lo ejecuta **una vez en Windows**. Solo devuelve líneas `BT_SEC07_*` y `DIAG_EXIT_CODE`, sin imprimir datos privados. Si detecta `V2_PARSER_DEFECT_CANDIDATE`, revisar y corregir v2 en nuevo paquete con tests; si `NO_SECRET_MATCH_IN_ACTIVE_KEYRING_PUBLIC_ONLY` o `NO_SECRET_KEYS_IN_ACTIVE_KEYRING`, conciliar custodia/homedir mediante plan autorizado, **no crear/importar claves a ciegas**; si `KEY_IDENTIFIED_RECHECK_V2_RUNTIME`, investigar diferencia de ejecución. **No volver a ejecutar orquestador v1/v2, ni Supabase, ni respaldo antiguo hasta clasificar.**

**Estado:** solo documentación actualizada en `AGENTS.md`, `agent.md`, `roadmap.md` y checkpoint. Scripts GPG/backup privados quedan fuera del GitHub público; no se cambió Render, Supabase, Auth, Drive, OAuth ni repositorio visibilidad. `BT-PILOT-QA-04: A REPASAR`.
