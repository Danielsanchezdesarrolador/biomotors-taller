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

## BT-SEC07-GPG-CUSTODIA-09 · Diagnóstico real de custodia GPG Windows (19/11/2026)

**Evidencia aportada por el propietario, salida sanitizada completa:**

```text
DIAG_INTEGRIDAD_OK
BT_SEC07_GPG_DIAG_MODE: OFFLINE_READ_ONLY
BT_SEC07_SELFTEST: 14_OF_14_OK
BT_SEC07_GPG_BINARY: FOUND
BT_SEC07_GPG_HOME_MODE: DEFAULT
BT_SEC07_HISTORICAL_FILE: FOUND
BT_SEC07_PACKET_VISIBLE_RECIPIENTS: ONE
BT_SEC07_SECRET_LIST_COMMAND: OK
BT_SEC07_PUBLIC_LIST_COMMAND: OK
BT_SEC07_SECRET_KEY_RECORDS: NONE
BT_SEC07_SECRET_FORMAT: OK
BT_SEC07_PUBLIC_RECIPIENT: MATCH
BT_SEC07_SECRET_RECIPIENT: NOT_FOUND
BT_SEC07_V2_MATCHER: NOT_FOUND
BT_SEC07_FINAL: NO_SECRET_MATCH_IN_ACTIVE_KEYRING_PUBLIC_ONLY
DIAG_EXIT_CODE: 2
```

**Causa inmediata confirmada por la ejecución real:** el archivo cifrado histórico expone un único destinatario público; `gpg --list-keys` de homedir por defecto lo reconoce; `gpg --list-secret-keys` finalizó OK **sin entradas `sec/ssb`**. V2 no pudo vincular ese destinatario a una huella primaria privada porque **no existen claves privadas enumerables en el almacén GPG activo**, no por incongruencia de un parser de subclave. La herramienta nunca mostró huellas, direcciones ni contenido. Este hallazgo **no demuestra que la clave esté perdida, ni dónde fue utilizada anteriormente**, ni reemplaza la validación de accesibilidad/desbloqueo/descifrado.

**Conciliación histórica:** existen evidencias previas de descifrado/restauración de `database.dump.gpg` histórico en Docker aislado, con 7 tablas/25 filas/16 políticas. Por tanto existió algún mecanismo de descifrado operativo entonces, pero este diagnóstico NO identifica GNUPGHOME/ubicación actual. No afirmar que el almacén predeterminado actual sea el mismo que entonces. La falla original de `pg_dumpall` (exit 1, stderr 75 B) sigue pendiente y es distinta de esta falla de custodia.

**Acción en el proyecto:** actualizar documentación sin escribir datos; NO repetir orquestador v1/v2, emitir claves nuevas, importar material privado o recorrer perfiles/rutas privadas sin consentimiento. No solicitar que se compartan claves, passphrases o exportaciones privadas. **Próximo bloque propuesto bajo autorización nueva y acotada:** inventariar almacenes GPG candidatos conocidos y copias de custodia mediante metadatos sin exponer nombres, cotejar clave destinataria histórica por su key ID solamente en memoria, verificar disponibilidad del material privado en el almacén autorizado y diseñar restauración aislada. Cualquier descifrado real del respaldo, importación, nueva exportación alojada o recuperación se registra y autoriza por separado si excede el alcance vigente. No asumir que una clave pública basta para recuperar un backup.

**Estado:** paquete offline PASS, diagnóstico GPG real concluyente para el almacén actual; **ningún nuevo respaldo o restore ejecutado**, no conexión Supabase/Render/Drive, no despliegue. `BT-PILOT-QA-04: A REPASAR`.

## BT-SEC07-GPG-HISTORICAL-ISOLATED-10 · Reconexión con evidencia de custodia histórica, antes del próximo intento

**Documento revisado:** `docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md`, sección «Evidencia aportada»: el propietario comprobó mediante `Test-Path` la existencia de **`$env:LOCALAPPDATA\ByteTorque-GPG-Prueba\gnupg-aislado`** en 19/11. El mismo checkpoint advierte expresamente que **NO** comprobó la clave privada en esa carpeta. Es un hallazgo antiguo reencontrado, no descubrimiento nuevo de llave presente.

**Interpretación:** el diagnóstico GPG que concluyó `SECRET_KEY_RECORDS: NONE` informó `GPG_HOME_MODE: DEFAULT`, por tanto solo enumera claves privadas del almacén predeterminado de la sesión actual. Ese resultado no excluye que exista material de recuperación en el **almacén aislado histórico conocido**. GPG en Windows puede usar GNUPGHOME alternativo; esto debe inspeccionarse sin modificar configuración persistente.

**Operación siguiente preparada, NO ejecutada aún:** una única llamada al diagnóstico offline SHA-verificado `BT_SEC07_GPG_DIAGNOSTICO_OFFLINE_20261119.py` configurando `GNUPGHOME` a **la ruta histórica exacta y existente solamente en el proceso actual** y restaurando el valor anterior en `finally`. No recorrer otras carpetas, no crear ningún homedir ausente, no usar `--decrypt`, `--import`, `--export-secret-keys`, SQL, red, backups ni GPG nuevos. Solo imprimir las etiquetas ya predefinidas. **No se sabe si tendrá `SECRET_KEY_RECORDS: FOUND` hasta ejecutar en PC**.

**Estado:** GPG predeterminado sin clave privada, clave pública asociada al backup histórico; nuevo backup y restore aún NO realizados. Si anillo histórico contiene privada coincidente, revisar custodia y prueba de recuperabilidad antes de usarlo; si no, detenerse e investigar alternativas de custodia con autorización separada. `BT-PILOT-QA-04: A REPASAR`.

## BT-SEC07-GPG-ISOLATED-MATCH-11 · Diagnóstico exitoso en GNUPGHOME histórico y ejecución de v2 habilitada

**Evidencia autentica aportada por el propietario, 19/11/2026:**

```text
ALMACEN_HISTORICO: ENCONTRADO
DIAGNOSTICO: INTEGRIDAD_OK
BT_SEC07_GPG_DIAG_MODE: OFFLINE_READ_ONLY
BT_SEC07_SELFTEST: 14_OF_14_OK
BT_SEC07_GPG_BINARY: FOUND
BT_SEC07_GPG_HOME_MODE: CUSTOM
BT_SEC07_HISTORICAL_FILE: FOUND
BT_SEC07_PACKET_VISIBLE_RECIPIENTS: ONE
BT_SEC07_SECRET_LIST_COMMAND: OK
BT_SEC07_PUBLIC_LIST_COMMAND: OK
BT_SEC07_SECRET_KEY_RECORDS: FOUND
BT_SEC07_SECRET_FORMAT: OK
BT_SEC07_PUBLIC_RECIPIENT: MATCH
BT_SEC07_SECRET_RECIPIENT: MATCH
BT_SEC07_V2_MATCHER: MATCH
BT_SEC07_FINAL: KEY_IDENTIFIED_RECHECK_V2_RUNTIME
DIAG_EXIT_CODE: 0
CONFIGURACION_GPG_ORIGINAL: RESTAURADA
```

**Causa inmediata del bloqueo v2, verificada:** el flujo v2 consultaba el GNUPGHOME por defecto y éste carece de entradas privadas; la clave privada coincidente reside en el directorio aislado histórico documentado previamente, que fue probado por el propietario. El algoritmo de mapeo del destinatario v2 también reportó MATCH en el almacén aislado: **el código no necesita nuevo parche para ese chequeo**. Esta operación solo lee metadatos GPG, no descifra el archivo real ni confirma la passphrase/material desbloqueable, y no accedió a Supabase. No afirmar recuperación integral.

**Auditoría del flujo antes de reusar:** se inspeccionó el script `bt_sec07_backup_restore.py` dentro del ZIP v2 previamente entregado. `old_fingerprint`, `ensure_gpg` y `isolated_restore/decrypt_to_command` emplean GPG sin `--homedir` para acceso al anillo privado, por lo que respetan `GNUPGHOME` heredado del proceso; el homedir nuevo `gpg-public` es solamente para cifrar con la clave pública. `PGSSLMODE=verify-full`, `default_transaction_read_only=on`, pooler sesión 5432 y directorio nuevo único permanecen. Los datos de roles del catálogo son metadatos, no roles SQL; restore local podrá fallar por extensiones o roles de Supabase. No se ejecutó aquí el backup.

**Próxima operación autorizada:** el permiso previo cubre una nueva exportación cifrada de solo lectura y una restauración aislada local. No repetir QA 43/43 ni descargar/reinstalar software. Verificar SHA256 de ZIP original v2 `9ee61398d67cd7e811f211c70a449878009b36271fce61082479a09db7a6042d`, del orquestador `0cd6fb1c77ad1d07deb28a72fe4e877c70c4ec424cd93c7ef326e23155a93001` y módulo de cifrado `74c7276e914e46f360b80c4c49eb8c6351ced1a802a88269abca791ac0ff953e` comprobados en el ZIP local del asistente, y que `GNUPGHOME` histórico exista. Ejecutar v2 **una vez** asignando `GNUPGHOME` durante el subproceso Python, guardando/restaurando el valor previo incluso ante error (`try/finally`). Solicitar contraseña PostgreSQL solamente en terminal. Si falla, reportar solo etiquetas `BT_SEC07_*` y `BLOQUE_EXIT_CODE`, **no repetir**. Contenido GPG privado nunca se sube a repo/chat.

**Estado actual:** `SEC-07` productor pg_dumpall exit 1/75B aún sin causa; copia de roles SQL inutilizable; respaldo actual y restore aún NO ejecutados; OAuth Drive bloqueado; `BT-PILOT-QA-04: A REPASAR`. Documentación únicamente, sin SQL/Render/Auth/Drive/GPG writes por parte del asistente.

## BT-SEC07-DOCKER-PG17-12 · Parada pre-remota por requisito imagen Docker PG17 (19/11/2026)

**Evidencia recibida del propietario, Windows:**

```text
BT_SEC07_PREFLIGHT: HASHES_OK
BT_SEC07_PREFLIGHT: HISTORICAL_KEYRING_SELECTED
BT_SEC07_RECIPIENT: MATCHED_HISTORICAL_CIPHERTEXT
BT_SEC07_STOP: DOCKER_PG17_IMAGE_NOT_FOUND_NO_AUTO_PULL
BLOQUE_EXIT_CODE: 2
BT_SEC07_GPG_CONFIGURATION: RESTORED
```

**Causa inmediata confirmada:** El orquestador `bt_sec07_backup_restore.py` v2 ejecutó `docker_image` antes de solicitar contraseña PostgreSQL. Esta función examina solamente las etiquetas `postgres:17`, `postgres:17-bookworm`, `postgres:17.12-bookworm`, y, cuando encuentra alguna, ejecuta un contenedor efímero `postgres --version` sin red para exigir versión mayor 17. Si ninguna pasa, genera la etiqueta observada. **No se distingue con la evidencia actual** si las etiquetas no están descargadas, el daemon Docker Desktop no está listo, se utiliza otro Docker context, o si falló el test del contenedor. La salida es un gate funcional; no evidencia ausencia total de imágenes en el PC.

**Alcance del intento:** El destinatario GPG se reconoció satisfactoriamente en el anillo aislado histórico; el bloque terminó antes de `getpass`, `base.check_db`, consultas de roles, `pg_dump`, archivo actual, cifrado, `isolated_restore` o lectura de filas Supabase. La variable de proceso `GNUPGHOME` anterior se restituyó. **No se generó ni restauró backup nuevo; antiguos siguen intactos según el flujo.** Causa original de `pg_dumpall` exit 1/stderr 75B permanece desconocida.

**Verificación documental externa:** Docker Hub imagen oficial PostgreSQL en https://hub.docker.com/_/postgres incluye etiqueta `17.12-bookworm` y `17-bookworm`; Docker documenta `docker image inspect`, `docker image pull` y `docker version` en https://docs.docker.com/reference/cli/docker/image/inspect/ , https://docs.docker.com/reference/cli/docker/image/pull/ y https://docs.docker.com/reference/cli/docker/version/ . La descarga de imagen es local a Docker, no instala PostgreSQL en Windows ni modifica Supabase.

**Siguiente procedimiento propuesto — una sola intervención agrupada:** (1) verificar hashes anteriores ZIP/script/módulo y GNUPGHOME histórico; (2) evaluar disponibilidad real de Docker Engine y las tres etiquetas usando contenedores `--rm --network none`; (3) si ninguna está disponible pero daemon está sano, permitir descarga local **expresa y visible** desde Docker Hub de `postgres:17.12-bookworm` y validar versión 17 sin puertos; (4) **solo si** requisitos positivos, ejecutar **una vez** el orquestador v2 con almacén GPG histórico durante proceso y restaurar la variable incluso si falla. El paquete v2 ya pasó 43/43 QA offline Windows; no repetir salvo cambio de código. No descargar imágenes cuando Docker Engine falla o existe imagen compatible usable. Si el propietario decide no descargar, terminar sin backup ni restore. No automatizar instalación de Docker, no crear/restaurar BD en producción, no cambiar permisos. Si falla una etapa, detenerse y reportar solo etiquetas seguras; no reintentar a ciegas.

**Efectos de esta entrada:** solo `roadmap.md`, `agent.md` y checkpoint en rama única main, `[skip render]`; ninguna operación de Docker o Supabase ejecutada por el asistente. **SEC-07 abierto y BT-PILOT-QA-04: A REPASAR.**

## BT-SEC07-DOCKER-ENGINE-13 · Evidencia de parada en Docker Engine y plan sin reintentos destructivos

**Salida exacta (únicas etiquetas compartidas), 19/11/2026:**

```text
BT_SEC07_PREFLIGHT: FILES_AND_GPG_OK
BT_SEC07_STOP: DOCKER_ENGINE_NOT_READY
```

**Alcance demostrado:** PowerShell verificó hashes del ZIP/programas y existencia de GNUPGHOME histórico; `docker` CLI fue encontrado; no se rechazó `DOCKER_HOST` remoto ni contexto remoto; la consulta `docker version --format '{{.Server.Version}}'` no obtuvo estado utilizable. Puede indicar daemon detenido, fallo de inicialización o backend WSL/Hyper-V, entre otras posibilidades. **No prueba que la imagen PG17 falte ni que Docker Desktop esté desinstalado**. El bloque se detuvo antes de `docker image inspect`, `docker pull`, contraseña, conectar Supabase, crear backup nuevo o restaurar. La clave GPG ya había coincidido en pruebas previas, pero no se volvió a consultar con Docker en este resultado. No hay evidencia de cambios alojados.

**Verificación de guía de fabricante:** [Docker Desktop CLI](https://docs.docker.com/desktop/features/desktop-cli/) documenta `start` y `status`. [Docker Desktop Windows](https://docs.docker.com/desktop/setup/install/windows-install/) advierte que puede no iniciarse automáticamente. [Docker WSL troubleshoot](https://docs.docker.com/desktop/troubleshoot-and-support/troubleshoot/topics) para diferenciar arranque de problemas del backend. No es apropiado forzar `wsl --unregister docker-desktop`, `docker desktop factory reset`, reinstalación, `docker system prune` ni cambiar contexto de otros entornos sin evidencia/permiso.

**Siguiente operación planeada:** un comando PowerShell autocontenido que verifica Docker CLI y contexto local, consulta el daemon; si el daemon no está listo y Docker Desktop CLI está disponible, invoca **solo** `docker desktop start --detach` y observa hasta un límite corto el arranque, sin reiniciar servicios/contendedores; verifica Engine Linux y lista disponibilidad de imágenes PG17 entre tres tags permitidos sin descargar, crear contenedores ni hacer backup. Si no arranca, enumera solo códigos sanitizados de Docker Desktop presente/estado, WSL presente/respuesta y estado de servicio, sin mostrar logs crudos ni nombres de distros. Un nuevo paso de imagen/backup se condiciona a resultado confirmado; autorización anterior de exportación no invalida la precaución ante Engine inestable. No se ejecutó todavía esta operación en el PC.

**Modificaciones documentales solamente:** roadmap, agent y checkpoint; producción Supabase/Render/Drive, GPG y respaldo histórico intactos. **BT-PILOT-QA-04: A REPASAR**.

## BT-SEC07-DOCKER-ENGINE-RECOVERED-14 · Prueba real de Docker Desktop/Engine recuperado (19/11/2026)

**Resultado recibido del propietario:**

```text
BT_SEC07_DOCKER_CONTEXT: LOCAL
BT_SEC07_DOCKER_ENGINE: RUNNING
BT_SEC07_DOCKER_LINUX: OK
BT_SEC07_PG17_IMAGE: PRESENT
BT_SEC07_DOCKER_DIAGNOSTIC: COMPLETE
```

**Cierre limitado de incidente:** Docker CLI apunta a contexto local y el daemon respondió; el modo actual es Linux; alguna de las tres etiquetas `postgres:17`, `postgres:17-bookworm`, `postgres:17.12-bookworm` pasó `docker image inspect`. El bloqueo del daemon anterior se considera **resuelto en esta sesión**. El comando empleado **no ejecutó** la imagen PostgreSQL 17: antes del backup hay que comprobar que `postgres --version` dentro de un contenedor sin red informe 17, que su salida y código sean válidos, y que Docker siga en contexto local. `PRESENT` no prueba restorable.

**Bloque consecutivo permitido:** reutilizar ZIP v2 SHA256 `9ee61398d67cd7e811f211c70a449878009b36271fce61082479a09db7a6042d`, script SHA256 `0cd6fb1c77ad1d07deb28a72fe4e877c70c4ec424cd93c7ef326e23155a93001`, módulo SHA256 `74c7276e914e46f360b80c4c49eb8c6351ced1a802a88269abca791ac0ff953e`, anillo GPG aislado histórico confirmado, Docker Linux local y una etiqueta Postgres 17 verificada mediante `docker run --rm --network none --pull=never ... postgres --version`, **sin pull**, y ejecutar UNA VEZ `python -B bt_sec07_backup_restore.py` con GNUPGHOME solo en proceso. No repetir QA 43/43 ni crear zip v3. Uso de PostgreSQL remoto read-only, snapshot cifrado con id nuevo y restore Docker sin red estaba autorizado expresamente por el propietario. Si algo falla, detenerse, compartir únicamente categorías `BT_SEC07_*` y `BLOQUE_EXIT_CODE` y no repetir ciegamente. No proporcionar contraseña ni material sensible en el chat.

**Estado real:** aún no hay evidencia de que se haya creado un respaldo actual ni ejecutado restore de este. Los roles SQL y recuperación completa de Supabase continúan no verificados; respaldo histórico conservado; `BT-PILOT-QA-04: A REPASAR`.

## BT-SEC07-SNAPSHOT-CREATED-RESTORE-FAIL-15 · Evidencia de nuevo respaldo cifrado y ensayo de restauración FALLIDO

**Salida real proporcionada por el propietario, 19/11/2026:**

```text
BT_SEC07_PREFLIGHT: READY
BT_SEC07_BACKUP: AUTHORIZED_START
BT_SEC07_RECIPIENT: MATCHED_HISTORICAL_CIPHERTEXT
BT_SEC07_LOCAL_PREFLIGHT: OK
Clave PostgreSQL (solo aquí; no enviar al chat): [contraseña NO compartida]
BT_SEC07_POSTGRES_READONLY_TLS: OK
BT_SEC07_ROLES_CATALOG: OK_METADATA_ONLY
BT_SEC07_NEW_ENCRYPTED_SNAPSHOT: OK_NEW_UNIQUE_DIRECTORY
BT_SEC07_RESTORE: RESTORE_FULL_FAILED_IN_ISOLATION
BT_SEC07_BACKUP_ROLES_SQL: NOT_INCLUDED
BT_SEC07_FULL_PROJECT_RECOVERY: NOT_CERTIFIED
BLOQUE_EXIT_CODE: 3
BT_SEC07_GPG_CONFIGURATION: RESTORED
```

**Interpretación calibrada:** `NEW_ENCRYPTED_SNAPSHOT` solo se imprime después de `pg_dump --format=custom` → GPG por pipe, exigencia de cabecera `PGDMP` y bytes no vacíos en el productor, confirmación de códigos de salida, validación SHA de ciphertext y promoción a **ruta local nueva única** con manifest. Por tanto **un nuevo archivo cifrado de estado actual fue creado** y hay metadatos de roles cifrados; conservarlo, no confundir con el `database.dump.gpg` del 17/11. Un SHA correcto no demuestra por sí mismo descifrado ni recuperación. El restore aislado de PostgreSQL 17 **FALLÓ**, y `restoration_verified=false`, `status=RESTORE_NOT_VALIDATED`; el manifest solo contiene un código agregado del fallo. No contiene `roles.sql` restaurables, contraseñas de roles, Storage object bytes, Auth provider settings ni Edge Functions/secretos. **No lanzar piloto real ni certificar recuperación.**

**Investigación del código exacto v2 revisado localmente:** `isolated_restore` `lineas 286-326` creó un contenedor PostgreSQL 17 Docker con `--network none`, BD en tmpfs, sin puertos; comprobó `pg_isready`, creó placeholders NOLOGIN dentro del contenedor y ejecutó `decrypt_to_command`. Esa función `lineas 211-250` envía stdout GPG a `docker exec pg_restore --exit-on-error --no-owner --no-acl` por pipe, **pero descarta stderr de ambos procesos** y devuelve `(gpg_rc, restore_rc, bytes)`; la condición `if gc or rc or received <=5` reduce todos a `RESTORE_FULL_FAILED_IN_ISOLATION`. Dado el código, llegar a esa etiqueta implica que `create_test_roles` no detuvo el flujo, pero NO identifica qué proceso falló. Posibles problemas de roles administrados/extension/Supabase son hipótesis, no hechos confirmados.

**Corrección de observabilidad, sin nuevo dump:** archivo privado del chat `BT_SEC07_RESTORE_DIAGNOSTICO_20261119.zip` (9.013 bytes, SHA256 `e0c951ed5ecbc47c0b7c58f84db537b5c3f1d2788f024963bae746c741b511d7`), contiene programa `BT_SEC07_Restore_Diagnostico_Offline.py`, 19 pruebas y LEEME. El script exige SHA de los dos fuentes v2 existentes; identifica **exactamente una** carpeta `bytetorque-current-sec07-...` con `status=RESTORE_NOT_VALIDATED`, `restore_result=RESTORE_FULL_FAILED_IN_ISOLATION`, validación del project_ref/backup_id/estructura y hashes/tamaños de todos los ciphertexts. Se bloquea si son cero/múltiples. Exige GNUPGHOME histórico aislado, coteja destinatario del ciphertext antiguo con el manifest nuevo, Docker local Linux y PG17. **Solo entonces** reutiliza `isolated_restore` del v2 para un ensayo Docker ephemeral `--network none` y sustituye temporalmente el pipe GPG→pg_restore para clasificar hasta 512KiB de stderr del destino **en memoria** por categorías predefinidas (sin presentar raw, SQL, nombres, rutas ni contraseñas), distinguir códigos GPG/PG y transferencia no vacía. **Nunca se escribe SQL claro en disco ni se modifican backups/manifests, no se accede a Supabase ni se genera nuevo respaldo.** El contenedor temporal se elimina en finally; si falta engine/imagen, stop local. 19/19 pruebas offline sintéticas PASS, repetidas tras ZIP extraído, sintaxis correcta; **no se probó contra el snapshot real ni Docker en el asistente**. La salida se limita a `BT_SEC07_*`.

**Puerta de autorización:** el propietario había autorizado ensayo de restauración aislada y recuperación del backup actual. Esta es **una única repetición focalizada en un contenedor local** con razón nueva (recuperar categoría de falla antes descartada), sin repetir exportación ni conectar PostgreSQL; la ejecución efectiva en Windows requiere que el propietario ejecute personalmente el bloque PowerShell descargado, verifique SHA y lea LEEME; compartir solo etiquetas sanitizadas. Si se considera nueva operación de restauración, esa acción del propietario expresa conformidad, sin inferir acceso permanente. **No ejecutar más reintentos sin evidencia nueva.**

**Ningún cambio en Supabase/Render/Auth/Drive, app, SQL productivo, secretos ni backups históricos.** Docs/commit únicamente, código privado del chat no se incorpora a GitHub. `BT-PILOT-QA-04: A REPASAR`; original `pg_dumpall` roles exit 1/stderr 75B sin raíz comprobada y Google Drive OAuth todavía bloqueado.

## BT-SEC07-EXTENSION-RESTORE-16 · Resultado diagnóstico de restore: EXTENSION_UNAVAILABLE y comparación offline preparada

**Evidencia real del propietario en Windows (19/11/2026):**

```text
OK
BT_SEC07_DIAG_TESTS: OK
BT_SEC07_ISOLATED_DIAG: STARTING
BT_SEC07_DIAG_MODE: EXISTING_CIPHERTEXT_OFFLINE_ISOLATED_ONLY
BT_SEC07_SNAPSHOT: ONE_MATCHING_FAILED_RESTORE
BT_SEC07_CIPHERTEXT_HASHES: OK
BT_SEC07_RECIPIENT: MATCHED_HISTORICAL_CIPHERTEXT
BT_SEC07_DOCKER_PG17: LOCAL_LINUX_IMAGE_VERIFIED
BT_SEC07_RESTORE: RESTORE_FULL_FAILED_IN_ISOLATION
BT_SEC07_GPG_PROCESS: OK
BT_SEC07_PG_RESTORE_PROCESS: FAILED
BT_SEC07_DECRYPTED_STREAM: NONZERO
BT_SEC07_PG_RESTORE_ERROR_CLASS: EXTENSION_UNAVAILABLE
BT_SEC07_BACKUP_MANIFEST: UNCHANGED
BT_SEC07_FINAL: RECOVERY_NOT_CERTIFIED
DIAG_EXIT_CODE: 3
BT_SEC07_GPG_CONFIGURATION: RESTORED
```

**Interpretación rigurosa:** el descifrado GPG funcionó y el flujo a `pg_restore` fue no vacío. Docker PG17 funcionó y el comando de restauración terminó fallando. El clasificador en `BT_SEC07_Restore_Diagnostico_Offline.py` devuelve `EXTENSION_UNAVAILABLE` si encuentra `could not open extension control file` o un patrón `extension ... is not available` dentro de stderr limitado. Es evidencia concreta de **una incompatibilidad de extensión en destino**, no certificado de que ese sea el único bloqueo ni certeza de cuál nombre. No reproducir SQL ni stderr crudo ni inferir corrupción del cifrado. El manifiesto existente conservó `RESTORE_NOT_VALIDATED` y `restoration_verified=false`; el snapshot nuevo sigue creado pero no recuperado.

**Cotejo de documentación oficial (sin conexiones al proyecto):** [Supabase: Restore a Platform Project to Self-Hosted](https://supabase.com/docs/guides/self-hosting/restore-from-platform), troubleshooting «Extension not available», exige verificar `pg_available_extensions` en el destino y versión; [PostgreSQL 17 pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html) documenta `--list` de tabla de contenidos de archivo custom sin ejecutar SQL. Los dumps raw de Supabase incluyen objetos/roles administrados y difieren de la CLI filtrada; la imagen `postgres:17` estándar no es prueba suficiente de compatibilidad de extensiones Supabase. No usar `--use-list` para saltarse errores como validación total.

**Artefacto técnico preparado (ZIP solo en la conversación, NO en GitHub):** `BT_SEC07_EXTENSION_INVENTORY_20261119.zip` **7.677 bytes**, SHA256 `7e3a0a2a16d5d92ec5a2155ff041ab63db5bf4e54aa6d635b834e76c280536f9`. Contiene `BT_SEC07_Extension_Inventory_Offline.py`, `test_BT_SEC07_Extension_Inventory_Offline.py` y `LEEME_SEC07_EXTENSIONES.md`. Programa verifica que el almacén GPG histórico esté seleccionado; encuentra **exactamente una** carpeta de snapshot `RESTORE_NOT_VALIDATED` y `RESTORE_FULL_FAILED_IN_ISOLATION` y comprueba todas las referencias del manifiesto con tamaños y SHA; verifica contexto Docker local/Linux y ejecutable `pg_restore` local; descifra `database.dump.gpg` por bloques solo hacia `pg_restore --list` sin base de datos y sin archivo SQL plano; construye el conjunto de extensiones del TOC en memoria; enumera los archivos de control `.control` ya presentes en una imagen PG17 **local** usando `docker run --rm --network none --pull=never --entrypoint sh` (sin iniciar servidor y sin montar respaldos); compara las dos listas, emite solo conteos y nombres de extensiones públicas allowlisted, redaccion de los demás. No añade ni elimina extensiones, no exporta nuevo dump ni ejecuta restore. **.control presente no equivale a extensión funcional ni garantiza que cargue con preload/roles/ABI**.

**Pruebas en contenedor del asistente:** 16/16 unittest offline PASS; prueba de integración GPG **real con clave y ciphertext totalmente sintéticos** alimentando un lector TOC simulado (no PostgreSQL real) PASS; ZIP `testzip()=OK`, extracción limpia y repetición **16/16 PASS**. No se ejecutó con respaldo real en Windows ni Docker del propietario. Próximo: usuario verifica SHA ZIP, extrae a carpeta NUEVA, corre QA y un solo inventario local; comparte líneas `BT_SEC07_*` y `DIAG_EXIT_CODE` únicamente. Si faltan extensiones compatibles, planificar entorno aislado PostgreSQL17 Supabase con versiones comprobadas, no instalar/modificar extensión en producción. Si no faltan .control, el primer error de carga podría deberse a otras dependencias: se requiere diagnóstico distinto, nunca declararlo resuelto.

**Efectos:** solo registro en `roadmap.md`, `agent.md`, `AGENTS.md` y este checkpoint; paquete privado fuera de GitHub, producción Supabase/Render/Auth/RLS/Drive sin cambios, respaldos nuevos y antiguos intactos. **BT-PILOT-QA-04: A REPASAR; SEC-07 roles original sigue sin causa**.
