## REGLA PERMANENTE — SEC-07: TLS DE CLIENTE NO SE DETERMINA CON `pg_stat_ssl` DE BACKEND POOLER (20/11/2026; INC-44)

**Windows real V1:** `RO_ZIP: VERIFIED`, script original SAFE_STATIC_MATCH, CA PUBLIC_PEM_LOADABLE, `SSL_POLICY: VERIFY_FULL_AND_READ_ONLY_ENFORCED`, destino pooler5432, contraseña local, `PRECHECK_STOP: SESSION_TLS_NOT_CONFIRMED`, `ROLES_BACKUP: NOT_ATTEMPTED`. Fuente ZIP exacta confirma que el SELECT PostgreSQL **se ejecutó**, psql exit 0, database/role congruentes, `transaction_read_only=on`, versión PG17; **`pg_stat_ssl` del backend fue NO**. **No concluir que el cliente no usó TLS**: pooler tiene dos tramos (PC->pooler, pooler->DB), y `pg_stat_ssl` refleja el último. **Tampoco declarar upstream TLS seguro**; revisar SSL enforcement de Supabase por separado antes de cambiar nada (activar podría reiniciar DB). INC-44 fallo del criterio V1 CONFIRMADO, NO fallo demostrado del backup/clave/password. ZIP V1 OBSOLETO. V2 privado `BT_SEC07_R3_READONLY_CONN_V2_20261120.zip` SHA256 `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b`, 10542 B: `psql --command SQL --command \\conninfo` en UN proceso, TLS cliente `verify-full`, `PGGSSENCMODE=disable`, stderr/stdout ocultos, backend SSL reportado aparte, nunca `END_TO_END_TLS` certificado. **35/35 tests nuevos+regresión PASS offline y 35 tras ZIP**, Windows V2 NO ejecutado. **La primera conexión consentida ya ocurrió; solicitar NUEVA autorización expresa antes de un segundo acceso.** Prohibido roles dump, GPG histórico, restore, TLS enforcement cambios sin permiso propio. [Checkpoint 44](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_TLS_BACKEND_FALSE_FIX_PREP_20261120.md).

---

## REGLA PERMANENTE — SEC-07: PRIMER CONTACTO AL ORIGEN SIN INVOCAR EXPORTADOR (20/11/2026; CP43)

Usuario autorizó **una** conexión real de verificación estrictamente **read-only**, SIN generar backups ni modificar DB. Para evitar creación de roles temporales de la CLI v3.0.0 en modo linked/ref, usar cliente `psql` PG17 directo sobre el pooler de sesión previamente documentado, con CA público `verify-full` y contraseña solicitada ocultamente **solo en PC** (entorno efímero `PGPASSWORD` de proceso hijo, sin .pgpass ni argumentos secretos). El lector propuesto **nunca ejecuta** `bytetorque_respaldo_local.py`; solo `ast.parse` de constantes estáticas, bloquea otro host/puerto/db/user. SQL fijo `BEGIN TRANSACTION READ ONLY; SELECT` metadata, `PGOPTIONS=default_transaction_read_only=on` y controles de SSL/versión, sin impresión de resultados confidenciales. Se preparó ZIP privado `BT_SEC07_R3_READONLY_CONN_20261120.zip` SHA `ea7a7d53208b63481c8cb69462ed152ee4fb0c69b08af8528cac59947c5f7f35`, **24/24 tests offline PASS**; Windows REAL todavía **NO** ejecutado. **No confundir test local PASS con conexión real.** Ante STOP no imprimir stderr ni alterar rutas, passwords, roles o certificados. La autorización no permite `pg_dumpall`, GPG histórico, nuevas copias, restore ni DDL. [CP43](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_CONNECTION_PREP_20261120.md).

---

## REGLA PERMANENTE — SEC-07: PREFLIGHT WINDOWS OFFLINE ≠ SERVIDOR/CERTIFICADO VALIDADO (20/11/2026, CP42)

Los indicadores Windows del propietario `PG17_CLIENTS: ALL_PRESENT`, `NODE/NPX: FOUND`, `SYNTHETIC_DB_URL_NO_PASSWORD: PASS` y `TLS_CERT_LIKE_FILES: ONE_UNVALIDATED_CANDIDATE` **solo cierran el inventario local**. No prueban la identidad del destino remoto, el uso efectivo de TLS `verify-full`, el contenido del archivo CA, permisos `PGPASSFILE`, ni capacidad de exportar roles. Conservar `SESSION_POOLER_5432: HISTORICAL_POLICY_ONLY_NOT_CHECKED`, `TLS_VERIFY_FULL: REQUIRED_FOR_FUTURE_NOT_TESTED`, `TEMP_PGPASS_STRATEGY: DESIGNED_NOT_CREATED`, `CLI_V3_REMOTE_DB_URL: SOURCE_REVIEWED_NOT_EXECUTED`, `SUPABASE_REMOTE: NOT_CONNECTED`, `ROLES_BACKUP: NOT_ATTEMPTED`. **No ejecutar conexión remota con la autorización actual, ni introducir credenciales/URL en chat**. Próximo grupo seguro: validación local offline del candidato CA y contrato de identidad del servidor/credenciales sin publicarlas; requiere permiso distinto al avanzar a remoto. [Checkpoint 42](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_WINDOWS_PASS_20261120.md).

---

## REGLA PERMANENTE — SEC-07: PREFLIGHT LOCAL DE CONEXIÓN Y DUMP REMOTO SIN CREAR LOGIN-ROLE (20/11/2026; BT-SEC07-R3-CONN-OFFLINE-PREP-41)

El usuario autorizó **exclusivamente preparación y comprobación LOCAL del método de conexión**: sin conectarse a Supabase, generar respaldos, descifrar ni exportar roles. Verificación fuente oficial Supabase CLI v3.0.0 confirma `--remote=<postgresql://...>` selecciona ruta `DbUrl` distinta del modo `linked/ref` que puede crear roles temporales sin contraseña. **URL sin password en argv**; secreto protegido por método efímero evaluado aparte, TLS `verify-full` con CA autorizado, stdout binario de roles a GPG solo tras autorización y validación; `--remote=service=...` no es valor admitido. No copiar host/ref/contraseña ni TLS paths en chat. Se preparó ZIP `BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_20261120.zip` SHA256 `37ef628d973b65a999e5be4b516ccc28c34aa311ef7600396173b0ad90e87edc` de **inspección de metadatos locales**: PG17 binarios en ruta estándar, Node/NPX, recuento de ficheros `.crt/.pem/.cer` en solo `BT-Secrets` (máximo un nivel, sin leer contenidos), y URL ficticia sin contraseña; ninguna red, archivo secreto ni backup. **18/18 pruebas nuevas PASS en asistente y tras extraer ZIP**, Windows pendiente. No repetir suites históricas 18/14/15 ni restauración R2, no crear config real hasta permiso nuevo. [Checkpoint 41](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_PREP_20261120.md).

---

## REGLA PERMANENTE — SEC-07: DIFERENCIAR HOME GPG PREDETERMINADO DE HOME AISLADO HISTÓRICO (20/11/2026; BT-SEC07-R3-RECIPIENT-V2-WINDOWS-PASS-40)

**La V2 de metadatos OpenPGP funcionó sobre el respaldo real en Windows:** `RECIPIENT_COUNT: 1`, `PUBLIC_MATCH: ALL_VISIBLE_MATCH`, `SECRET_MATCH: NO_VISIBLE_MATCH` (en home predeterminado), `RECOVERABILITY: NOT_PROVEN`, `COMPLETE_NO_DB_NO_DECRYPT_NO_WRITE`, ZIP SHA VERIFIED y exit 0. **Ya hay evidencia previa verificada en SEC-07 sobre la custodia privada:** checkpoint `docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md` registra diagnóstico Windows `GPG_HOME_MODE: CUSTOM`, `SECRET_KEY_RECORDS: FOUND`, `SECRET_RECIPIENT: MATCH` en `GNUPGHOME` histórico AISLADO. R2 sobre respaldo actual posteriormente mostró `PARITY_GPG_PROCESS: OK` y restore exitoso `SNAPSHOT_STRUCTURE_ONLY`. **No declarar perdida la clave, ni repetir la búsqueda que ya terminó**, ni generar otra clave/reexportar DB por defecto. Metadata V2 no valida por sí sola descifrado, pero las pruebas anteriores documentadas sí acreditan recuperación estructural limitada; NO roles/ACL/Auth/Storage/Edge. INC-39 parser V1 longitudes parciales **CERRADO operativamente**. Próxima prioridad SEC-07 son roles reales/restauración permisos, con autorizaciones específicas nuevas para remoto y uso GPG. [Checkpoint 40](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_V2_WINDOWS_PASS_HISTORICAL_KEYRING_20261120.md).

---

## REGLA PERMANENTE — SEC-07: OPENPGP LONGITUDES PARCIALES Y LIMITACIONES DEL LAB (20/11/2026; BT-SEC07-R3-RECIPIENT-PARTIAL-FIX-PREP-39)

**Incidente real de lector, NO del backup:** usuario confirmó ZIP v1 SHA OK, archivo principal seleccionado, `RECIPIENT_STOP_CLASS: PARTIAL_PACKET_UNSUPPORTED` y `META_WINDOWS: STOP`. Fuente RFC9580 valida longitudes parciales en paquetes de datos cifrados; parser v1 carecía de ese caso y sus 13/13 tests no lo cubrían. **No afirmar corrupción o pérdida de keyring**. Se preparó ZIP privado `BT_SEC07_R3_RECIPIENT_METADATA_V2_20261120.zip` SHA256 `eed81875dfca9f70929983a82b3490c62ff15f170d2a89ea410967033eb82842`, añade solo soporte de **cabecera** de tag 9/18/20 con longitud parcial tras PKESK, fallando cerrado en PKESK parcial/sin destinatario/truncado; no recorre ni autentica cuerpo ni descifra. **19/19 pruebas y GPG streaming real efímero PASS en entorno asistente, Windows V2 aún PENDIENTE**. No copiar V1 ni reabrir 18/14/15 tests antiguos. Coincidencia Key ID 64bits **no es prueba de recuperabilidad**. [Checkpoint 39 + PS + traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_PARTIAL_PACKET_FIX_PREP_20261120.md).

---

## REGLA PERMANENTE — SEC-07: COMPARACIÓN PKESK METADATOS ≠ RECUPERACIÓN (20/11/2026; BT-SEC07-R3-RECIPIENT-META-PREP-38)

Propietario autorizó **solo comparar metadatos de destinatario de UN respaldo cifrado existente con llaves GPG locales**, sin descifrar ni modificar archivos, sin conexión a DB. Se preparó parser PRIVADO Python estándar para leer exclusivamente cabecera PKESK OpenPGP v3 (tag1) y comparar identificadores de 64 bits contra claves públicas/subclaves y privadas/subclaves listadas con GPG, **sin imprimir rutas/UID/key IDs/fingerprints/SQL**. No usar `gpg --list-packets` indiscriminadamente ni asumir que descifrar es parte de este permiso. **Coincidencia por Key ID no es prueba criptográfica de recuperación**, tampoco que esa pública corresponda al backup; si destinatario oculto u otro formato, resultado indeterminado/no soportado. En el GPG home actual se observaron 1 pública y 0 privadas: no concluir pérdida global. ZIP privado, solo chat/PC, nuevas pruebas parser 13/13 PASS más GPG efímero real PASS en asistente; **Windows aún PENDIENTE**. [Checkpoint 38 + comando + traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_METADATA_PREP_20261120.md).

---

## REGLA PERMANENTE — SEC-07: 0 CLAVES SECRETAS LISTADAS NO ES PÉRDIDA DEFINITIVA, NO CIFRAR A CIEGAS (20/11/2026; BT-SEC07-R3-GPG-INVENTORY-PASS-37)

En PowerShell 5 del propietario se ejecutaron **sin error** listados GPG del homedir resuelto con `gpgconf`: `GPG_HOME: PRESENT`, `PUBLIC_KEYS_COUNT: 1`, `SECRET_KEYS_COUNT: 0`, `GPG_DIAG: PASS_NO_DB_ACCESS_NO_SECRETS_PRINTED`. Acredita **solo el almacén seleccionado**, no todos los homedirs ni presencia del secreto histórico en otro equipo/medio. **No usar la clave pública para una nueva copia de datos reales sin acreditar un mecanismo de descifrado/recuperación accesible**; no inferir pérdida definitiva de clave. El anterior error de listado INC-36 quedó resuelto operativamente con nueva instrumentación, pero NO se demostró su causa exacta (hipótesis stderr/PowerShell 5.1). El incidente `$HOME` INC-35 está cerrado. Autorización de usuario se limitó a inventario local ya finalizado: nueva autorización para consultar metadatos del ciphertext histórico, usar claves reales, DB remota, dump o restore. [Checkpoint 37](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_INVENTORY_PASS_ZERO_SECRET_20261120.md).

---

## REGLA PERMANENTE — SEC-07: VARIABLES AUTOMÁTICAS POWERSHELL Y EVIDENCIA DE INVENTARIO (20/11/2026; BT-SEC07-LOCAL-INV-HOME-RO-35)

**INC real del script de inventario local:** el bloque anterior asignó `$home = $null`; PowerShell trata `$home` como la variable automática **`$HOME` de solo lectura** (identificadores insensibles a mayúsculas), por lo que la comprobación abortó inmediatamente después de `GPG_COMMAND: FOUND`, antes de listar claves. **No es error probado de GPG ni de Supabase.** No volver a ejecutar ni copiar el script de checkpoint 34; usar la corrección de [checkpoint 35](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_LOCAL_INVENTORY_HOME_COLLISION_INC_20261120.md) que usa `$gpgHomePath`, consulta opcional `gpgconf` y muestra solo estados/conteos. `PG* NOT_SET` y archivos defaults `ABSENT` solamente describen esa sesión/rutas, **NO** pérdida de credenciales ni incapacidad de recuperar snapshot. Ninguna exportación, descifrado, conexión DB o modificación de backup está autorizada. Mantener script con marcador de etapa y falla cerrada sin publicar excepciones, secretos, rutas o fingerprint.

---

## REGLA PERMANENTE — SEC-07: SALIDA `RESET ALL` NO CERTIFICA ROLES Y CUIDADO CON PROVISIÓN AUTOMÁTICA (20/11/2026; BT-SEC07-R3-COMBINED-WINDOWS-PASS-33)

Según **fuente oficial etiquetada Supabase CLI v3.0.0**, `db dump --role-only` ejecuta `pg_dumpall --roles-only --no-role-passwords`, filtra roles reservados y añade `RESET ALL;`: archivo SQL no vacío, exit 0 y GPG verificado **no son suficientes** para afirmar que se recuperaron roles propios del proyecto. Comparar con inventario agregado esperado y valorar por separado propietarios, GRANT/REVOKE/ACL y privilegios por defecto; recordar que las contraseñas de roles no se exportan. En ruta linked/project-ref sin contraseña, el resolvedor de credenciales puede llamar a `createLoginRole({read_only:false})` en la plataforma; no declarar exportación remota de solo lectura sin comprobar y aprobar el método de conexión. El camino `--remote=<db-url>` sin contraseña en argv con `PGPASSFILE` es **alternativa candidata, NO validada en ByteTorque**. Sin nueva autorización específica, NO usar keyring histórico, conectarse a Supabase, exportar ni restaurar. Mantener todas las suites Windows 18/14/15 PASS sin repetir. [Checkpoint 33](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_COMBINED_WINDOWS_PASS_AND_REAL_EXPORT_GATE_20261120.md) y [contrato R3](docs/BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md).

---

## REGLA PERMANENTE — SEC-07: SALIDA BINARIA DE CLI V3 Y NO SQL LEGIBLE EN DISCO (20/11/2026; BT-SEC07-R3-GPG-WINDOWS-PASS-31)

El source **oficial etiquetado v3.0.0** (`apps/cli/src/commands/db/dump/dump.command.ts` / `dump.handler.ts`) muestra que `db dump --role-only` transmite SQL por stdout si no se usa `--file`; esa opción crea/trunca archivo SQL plano (modo 0644) y no debe proponerse para roles reales del proyecto sin plan explícito de custodia. **No usar redirección/pipeline textual de PowerShell** para cifrado. Preferir wrapper binario probado con exit y contenido válido del productor ANTES de validar el ciphertext final; un reintento por pooler puede dejar salida parcial en stdout. `--role-only` utiliza `pg_dumpall`: la CLI disponible **no demuestra** resuelto el fallo histórico de este productor. Antes de usar `--remote`, inspeccionar identidad del destino y método de credenciales: ciertos flujos enlazados pueden crear/alterar credenciales de un login role temporal según issue oficial (no se ha observado en ByteTorque). No exponer secrets por argv/logs/chat. GPG con clave temporal Windows 14/14 PASS NO prueba recuperación de roles reales. [Checkpoint y traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_WINDOWS_PASS_ROLE_EXPORT_GATE_20261120.md).

---

## SEC-07 — CIERRE VALIDADO DE QA WINDOWS Y SIGUIENTE LABORATORIO GPG EFÍMERO (20/11/2026; BT-SEC07-R3-WINDOWS-QA-PASS-30)

Propietario confirmó `BT_SEC07_ZIP: VERIFIED`, `Ran 18 tests in 4.768s`, `OK`, `BT_SEC07_WINDOWS_QA: PASS`. Se cierran **únicamente** tests sintéticos Windows del paquete R3 anterior. Preparado paquete GPG **real pero exclusivamente sintético y con GNUPGHOME/clave efímeros**, SHA256 `051cbe04f6b7b900310bcab615b7b240ff8ff8b22abfe445b555e537ae4d078e`: 14/14 QA en asistente y tras extraer; en Windows **PENDIENTE**, sin aprobación para usar keyring original ni conectar producción. Ver [checkpoint completo y prompt de traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_WINDOWS_PASS_GPG_EPHEMERAL_PREP_20261120.md). Nunca confundir este laboratorio de GPG con roles/ACL recuperados. Google Drive fuera; `BT-PILOT-QA-04 A REPASAR`.

---

## REGLA PERMANENTE — SEC-07: CHECKPOINT TRANSFERIBLE EN CADA AVANCE (20/11/2026; BT-SEC07-ROLES-CLI-FLAGS-PASS-29)

Por instrucción explícita reiterada del propietario, **al finalizar cada bloque de trabajo, incluso una comprobación local recibida por chat**, dejar un checkpoint breve pero autosuficiente en `docs/checkpoints/` y actualizar la portada de `roadmap.md` y `agent.md` (y el informe de incidentes si hubo errores). Incluir HEAD/commit, resultado **real vs sintético**, autorizaciones, operaciones prohibidas/no realizadas, evidencia sanitizada, artefactos candidatos privados y hash, límites, error/solución si aplica, siguiente paso exacto y un párrafo listo para retomar en otro chat sin repetir pruebas. Los candidatos ZIP que contengan material no público se entregan solo al propietario, **no al repositorio público**. Esta regla refuerza las obligaciones ya existentes y NO autoriza exportaciones remotas, despliegues, GPG real ni uso de secretos. [Checkpoint SEC-07](docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_CLI_FLAGS_AND_SYNTHETIC_LAB_20261120.md). 

---

## REGLA PERMANENTE — SEC-07: PARIDAD ESTRUCTURAL DEL SNAPSHOT PASÓ; SIGUIENTE ROLES/PERMISOS (20/11/2026; BT-SEC07-PARITY-STRUCTURE-PASS-25)

El propietario ejecutó SEC07 Paridad V2 con 40/40 QA y autorización, y obtuvo `SQL_PREFLIGHT: PASSED_BEFORE_GPG_RESTORE`, GPG/pg_restore PASS, 20 tablas (12 public, 8 bt_*), 21 políticas RLS, 35 funciones, cuatro extensiones instaladas, conteos 33 filas públicas y 4 privadas del **snapshot** y limpieza/manifest intactos. **NO repetir RESTORE por rutina**: cierre R2 **solo estructura/alcance**, no paridad con origen actual. El incidente V1 por `physical_tables` mal definido quedó **validado como RESUELTO EN PC**; todas las nuevas consultas de catálogo deben ejecutar preflight SQL PostgreSQL real antes de descifrar/restaurar. **No confundir RLS instalada con aislamiento probado ni `--no-owner --no-acl` con recuperación de roles/grants.** Prioridad R3: diseñar exportación recuperable de roles y privilegios filtrados con método oficial Supabase, comprobación de `supabase --version` y `supabase db dump --help` (CLI v3 breaking 04/11/2026), test sintético de no vacío y cifrado streaming, y solo después exportación real autorizada por separado. No reutilizar `roles.sql.gpg` antiguo con cero bytes. Registro final: [checkpoint estructural](docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_STRUCTURE_PASS_20261120.md), [informe errores/soluciones](docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md). Backup/manifiesto y keyring permanecen inalterados, Google Drive fuera del roadmap. `BT-PILOT-QA-04: A REPASAR`.

---

## REGLA PERMANENTE — SEC-07: PREFLIGHT DE SQL REAL ANTES DE RESTORE DE AUDITORÍA (20/11/2026; BT-SEC07-PARITY-SQL-INC-24)

**Incidente real**: el respaldo actual completó `GPG_PROCESS=OK` y `PG_RESTORE_PROCESS=OK`, pero la herramienta de paridad V1 se detuvo en `PARITY_QUERY_FAILED` porque el primer SQL (`CATALOG_METRICS`) utilizaba `physical_tables` sin declarar ese alias. Las 32 pruebas anteriores reemplazaban la respuesta de SQL con mocks; **una suite sintética verde no certifica la consulta real**. Reparación preparada: declaración `c.relkind` y `physical_tables`, 40/40 QA sintética, y **preflight ejecutado en PostgreSQL 17 temporal ANTES de transmitir GPG/pg_restore**, con falla cerrada por etapa y limpieza verificable. No reiterar restores por errores de sintaxis/alias de consultas: **probar SQL de catálogo en un DB nuevo vacío primero**. Mantener los materiales V1 como evidencia sin reescribirlos. Operaciones en Docker del usuario requieren autorización nueva y confirmación de la imagen local fija, sin red, sin puertos ni escritura a Supabase; proteger GPG, snapshot y manifest. [Causa/pruebas/plan](docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_SQL_INC_20261120.md). Drive excluido; `BT-PILOT-QA-04 A REPASAR`.

---

## REGLA PERMANENTE — SEC-07: NO CONFUNDIR ÉXITO DE RESTORE CON PARIDAD, ROLES O AUTORIZACIÓN PILOTO (20/11/2026; BT-SEC07-PARITY-PREP-23)

Tras ejecutar `pg_restore` del ciphertext actual en Docker Supabase PG17 sin errores, **NO** declarar recuperación íntegra solo por `pg_restore=0` o 12 tablas públicas: faltan validación de filas, FK/índices, RLS/funciones y comparación contra origen. Los ensayos locales `--no-owner --no-acl` **NO prueban** roles, propietarios, grants o acceso de usuario real. Los scripts de paridad deben comprobar autoridad de lectura (SUPERUSER/BYPASSRLS), contar cada tabla con `ONLY` para evitar duplicación en herencia, publicar solo agregados sanitizados y no nombres ni contenidos, evitar conexión al origen y preservar el manifiesto `restoration_verified=false`. Toda nueva restauración aislada requiere autorización específica, un solo contenedor efímero, limpieza verificable y diagnóstico de error sin bucles. **Registro preventivo e instrucciones:** [checkpoint SEC-07 paridad](docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_PREP_20261120.md). El ZIP candidato no se publica en repo, solo se entrega al propietario en chat. Drive excluido. Piloto Ignacio sigue A REPASAR.

---

## REGLA PERMANENTE — DESTINO GOOGLE DRIVE RETIRADO POR DECISIÓN DEL PROPIETARIO (20/11/2026; BT-SEC-OPERATING-STANDARD-20NOV-01)

**Google Drive NO forma parte del roadmap activo de seguridad, cifrado ni respaldos de ByteTorque.** No sugerirlo, no corregir su OAuth ni ejecutar workflows manuales históricos de exportación/provisión/diagnóstico Drive. Conservar incidentes SEC-10…SEC-14 y documentos previos como **evidencia histórica**, expresamente superada por esta decisión; no borrar logs/checkpoints ni confundirlos con pendientes vigentes. Mantener los scripts/workflows legados sin ejecutar hasta una limpieza de código con revisión de dependencias, CI y autorización específica del titular. **No se retiró el cifrado GPG/OpenPGP ni la obligación de una copia independiente fuera del PC.** No activar destino externo alternativo sin autorización. Prácticas y roadmap vigentes en [estándar operativo de seguridad](docs/BT_SEGURIDAD_ESTANDAR_OPERATIVO_20261120.md) y [checkpoint de decisión](docs/checkpoints/CHECKPOINT_BT_SEC_ESTANDAR_Y_SIN_DRIVE_20261120.md). El primer bloque de recuperación sigue siendo inventariar extensiones offline del respaldo cifrado ya creado, sin exportar otra vez. **BT-PILOT-QA-04 A REPASAR**.

---

## REGLA PERMANENTE — EXTENSIONES DE SUPABASE EN RESTORE AISLADO (19/11/2026)

Ante `pg_restore` fallido con categoría de stderr `EXTENSION_UNAVAILABLE` en contenedor PostgreSQL **vanilla**, tratarlo como **incompatibilidad del entorno de recuperación** hasta corroborar la extensión concreta, NO como corrupción del respaldo cifrado ni fallo del GPG cuando este último terminó con éxito. No instalar extensiones en producción, omitirlas con `--use-list` sin comprender dependencias ni forzar un `pg_restore` aparente PASS. Primero analizar **offline** el índice `pg_restore --list` del snapshot cifrado validado y las extensiones disponibles en la imagen local; emitir metadatos saneados, nunca SQL de clientes. Si faltan extensiones, evaluar Supabase PostgreSQL 17 compatible y su versión exacta antes de un nuevo restore aislado; conservar snapshot original, evitar otra exportación remota y advertir que verificar .control NO prueba carga de extensión ni compatibilidad de Auth/Storage/roles. Guía Supabase: https://supabase.com/docs/guides/self-hosting/restore-from-platform ; pg_restore: https://www.postgresql.org/docs/17/app-pgrestore.html . [Checkpoint SEC-07](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md).

---

## REGLA PERMANENTE — RECONCILIACIÓN DE DESTINATARIO GPG ANTES DE NUEVOS BACKUPS (19/11/2026)

Un error `HISTORICAL_RECIPIENT_KEY_NOT_UNIQUELY_PRESENT` **solo acredita que el identificador público del destinatario no se vinculó de manera única con una huella primaria en el listado privado GPG consultado**. NO significa por sí solo pérdida de la clave, fallo de Supabase, o corrupción del ciphertext histórico. Antes de cualquier nueva exportación, comprobar de manera **offline y sin revelar huellas, IDs, correos o material de clave** el encabezado OpenPGP, claves públicas y privadas en el anillo activo, y si el parser del candidato reconoce subclaves. Si falta la clave privada en el anillo activo, no generarla, importarla, buscarla en otros perfiles ni alterar GNUPGHOME sin consentimiento y un plan de custodia; la clave anterior no debe ser reemplazada automáticamente. No usar `--decrypt`, `--export-secret-keys`, logs crudos ni `pg_dumpall` para depurar esta asociación. Detenerse si la correspondencia es ambigua. Documentar comprobación local y condición de reintento en [checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md).

---

## REGLA PERMANENTE — RESPALDOS HISTÓRICOS PARCIALES Y PRERREQUISITOS (19/11/2026)

Si una exportación anterior falló antes de finalizar roles/manifiesto, **NO exigir un `manifest.json` histórico como condición de un nuevo respaldo**, ni dar por inexistente el ciphertext anterior. Inspeccionar qué etapa escribe cada artefacto: en el exportador local original el manifiesto se escribe **después de** exportar roles, que fallaron. Todo reemplazo de esa dependencia debe validar *sin revelar ni descifrar datos* la identidad criptográfica de la clave/cifrado que el propietario ya conserva, con bloqueo si hay ambigüedad o incongruencia; nunca seleccionar una clave arbitrariamente, generar otra automáticamente o sobrescribir el respaldo antiguo. Los ZIP candidatos deben probar también el estado real de respaldos parciales **sin manifiesto** antes de instruir una ejecución remota. Este incidente se documenta en [checkpoint SEC-07 backup](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). El alcance de restauración y los secretos de la plataforma siguen sujetos a autorización separada.

---

## REGLA DE TRABAJO — DIAGNÓSTICOS COMPLETOS Y BLOQUES GRANDES (19/11/2026)

En el chat exclusivo de seguridad, por decisión expresa del propietario, agrupar la revisión en **bloques cerrados**: consultar primero documentación y evidencia histórica; investigar causas y alternativas oficiales; inspeccionar código completo disponible; proponer/realizar correcciones solo en copias candidatas y probar casos sintéticos sin red; solicitar al propietario **una sola acción agrupada** cuando sea indispensable acceder a su PC. Ante errores, hacer diagnóstico razonado y documentar causas comprobadas frente a hipótesis **antes de volver a ejecutar**; no serializar una docena de inspecciones triviales ni repetir probes que perdieron su evidencia. Mantener consentimiento explícito para nuevas conexiones/exportaciones, modificaciones de producción, migraciones, backups, restauraciones y cambios de secretos. Nunca subir código local con credenciales, .env, .pgpass, keyring ni copias GPG a un repositorio o chat. El cambio metodológico NO rebaja las puertas de seguridad.

---

## REGLA PERMANENTE — BITÁCORA DE ERRORES, CAUSAS Y SOLUCIONES (19/11/2026)

**ANTES de diagnosticar o intentar de nuevo un fallo de ByteTorque**, leer [auditoría histórica y libro SEC-01…SEC-17](docs/BT_SEGURIDAD_AUDITORIA_RETROSPECTIVA_20261119.md), el `roadmap.md`, `agent.md` y último checkpoint. **Nunca concluir "herramienta desinstalada" de "NO ENCONTRADO EN PATH", ni "backup inexistente" de "backup cloud bloqueado", ni "restauración pendiente" de ausencia de prueba total cuando existe una restauración SQL parcial validada.** PostgreSQL 17 **ya fue instalado** en Windows el 17/11/2026 y se habilitó entonces `C:\Program Files\PostgreSQL\17\bin` en el `PATH` de aquella sesión; en una sesión nueva se debe comprobar primero la ruta absoluta. Docker 29.9.3 está presente según el propietario.

**AL ENCONTRAR CADA ERROR Y AL CERRAR CADA TAREA** dejar en `roadmap.md`, `agent.md` y checkpoint correspondiente un registro con: `INC-ID`, fecha, componente, error textual sanitizado, commit/versión/ejecución exacta, **causa comprobada vs hipótesis**, solución aplicada (o pendiente), prueba de resultado auténtica (y qué NO prueba), archivos/servicios afectados, riesgo, autorizaciones, próximo paso y condición concreta para reintentar. **No suprimir ni reinterpretar logs anteriores; anexar correcciones fechadas**. Si el estado es incierto, indicar `CAUSA NO DETERMINADA` y prohibir reintentos destructivos o duplicados hasta reconciliar.

**Hallazgo crítico verificado:** el cifrado GPG SQL antiguo **sí se creó** y su restauración aislada de siete tablas **sí funcionó**, pero el archivo `roles.sql.gpg` contiene **exactamente 0 bytes descifrados** y no sirve de copia de roles. Además, ese backup tiene fecha **17/11 14:41 UTC**, anterior a migraciones alojadas CP05 (15:48), Creador (17:07) y PLAN-04A (18:41). **No protege todo el estado actual de la plataforma**; requerirá respaldo nuevo *con nombre diferente* y recuperación validada de ese nuevo snapshot, **solo con aprobación específica**. No repetir el test viejo como si no se hubiera realizado.

**Drive:** no hay exportación/restauración cloud verificada. Aunque el checkpoint inicial de provisión decía «no ejecutado», **sí se ejecutó posteriormente** el workflow [44094695940](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44094695940) y falló `DRIVE_FOLDER_INACCESSIBLE`. No volver a disparar `mkdir` ni cambiar OAuth/destino antes de reconciliar ese intento. El respaldo de GitHub es manual y tiene confirmación extraordinaria cuando el repo está público; esto **no** equivale a backups automáticos activos.

**Aplicar también a Codex/Work/Astra:** solo atribuir a un agente una operación efectivamente verificable y no prometer trabajo en segundo plano. No copiar contraseñas, tokens, SQL restaurado, respaldos privados ni claves al repositorio ni a chats. El registro de incidentes es adicional —no reemplaza— las reglas de leer `AGENTS.md`/`agent.md`/`roadmap.md`/checkpoint antes de trabajar y documentar al finalizar.

---

## ACTUALIZACIÓN DE SEGURIDAD — ROLES GPG CONFIRMADOS VACÍOS (19/11/2026)

**Resultado verificado en el PC del propietario:** descifrado GPG binario de `roles.sql.gpg` (ciphertext de 151 bytes) con `ROLES_DESCIFRADO_EXIT: 0` y `ROLES_BYTES_DESCIFRADOS: 0`. El archivo **descifra, pero su contenido es exactamente 0 bytes**, así que **NO es un respaldo válido de roles**. Preservarlo como evidencia, sin sobrescribirlo. El anterior diagnóstico TLS fue `POSTGRES_TLS_OK`, seguido de `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` al ejecutar `pg_dumpall --roles-only --no-role-passwords`; **la causa de ese error NO está identificada**. Primero comprobar las versiones de `pg_dumpall` y `psql` sin conectar, luego depurar exclusivamente ese productor con códigos de diagnóstico seguros. No recrear clave GPG ni respaldar/restaurar nuevamente la base SQL ya comprobada. Para nueva copia cifrada de roles, exigir autorización específica y nombre nuevo, sin alterar los originales. Ver [checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md).

---

## REGLA OBLIGATORIA PARA TODOS LOS CHATS Y AGENTES DE BYTETORQUE — LEER ANTES, DOCUMENTAR DESPUÉS (19/11/2026)

**Aplica a CUALQUIER chat, agente, ChatGPT, Codex o colaborador que dé instrucciones o ejecute tareas sobre este repositorio, incluidas preguntas de continuidad, comandos de PowerShell, prompts para otros agentes, QA, seguridad, diseño, despliegues y migraciones.** Es una regla de proyecto, no una afirmación sobre comportamientos de otros chats que no accedan a estos archivos.

**ANTES de dar una instrucción accionable o modificar algo:**
1. Leer desde la rama `main` ACTUAL, por este orden: `AGENTS.md` (este archivo), `agent.md`, `roadmap.md` (incluir las prioridades iniciales y el bloque pertinente) y **último checkpoint relevante** de `docs/checkpoints/`. Para seguridad/respaldos, leer también el checkpoint `CHECKPOINT_BT_SEC_BACKUP_CONTINUIDAD_20261119.md` y los antecedentes asociados.
2. Confirmar HEAD de `main`, estado ejecutado frente a candidato, evidencia de pruebas, flags, despliegue real y las tareas pendientes. Consultar contexto anterior cuando se trate de pasos que el propietario recuerda haber hecho. **No suponer ausencia de trabajo porque falte un archivo en la conversación actual** ni pedir repetir una tarea ya realizada.
3. Comparar lo solicitado con lo realizado y dar **el próximo paso exacto pendiente**, conservando trabajo previo y sin reconstrucciones ni operaciones sensibles no autorizadas. Si no se puede leer la documentación o hay conflicto entre fuentes, **informarlo y pedir evidencia** antes de indicar acciones que puedan duplicar, sobrescribir o alterar datos. No inventar resultados de ejecuciones.

**AL FINALIZAR CUALQUIER TRABAJO DEL PROYECTO (código, documentación, QA, seguridad, diseño, scripts, migraciones preparadas, operaciones autorizadas):**
1. **Actualizar `roadmap.md`** con fecha, etapa, estado real (diseñado/candidato/probado/publicado/operativo), tareas terminadas, bloqueos y próxima tarea prioritaria. No cambiar un pendiente por «hecho» sin evidencia.
2. **Crear o actualizar un checkpoint específico en `docs/checkpoints/`**: objetivo, punto de partida/commit, archivos modificados, decisiones/autorizaciones, comandos/acciones realmente ejecutados, resultados y enlaces de pruebas, límites de la validación, efectos en Render/Supabase/Storage/Drive, flags, riesgos, **lo que FALTA** y próxima instrucción para otro chat. Si el intento quedó bloqueado, registrarlo como **BLOQUEADO** y qué acción lo desbloquea; no declarar éxito.
3. **Actualizar `agent.md`** con enlace al último checkpoint y estado de continuidad en pocas líneas; si aparece una regla permanente nueva, actualizar también `AGENTS.md`. Registrar un commit en `main` (normalmente `[skip render]` si solo cambian documentos/candidatos sin publicación autorizada).
4. **La respuesta final al propietario** debe decir qué se hizo, qué no se hizo, commit, pruebas verificadas, si hubo publicación o cambios alojados, pendientes y próximo paso. No finalizar una tarea dejando un reporte solo en el chat o únicamente en un fichero local. No crear checkpoints nuevos para una mera consulta sin trabajo realizado.

**Jerarquía:** instrucciones y consentimiento explícito más recientes del propietario > evidencia verificable del estado real > reglas vigentes en `AGENTS.md` > referencias de `agent.md`/`roadmap.md` > checkpoints históricos. No resolver contradicciones silenciosamente: explicar la diferencia y corregir las tres fuentes. Proteger `main`, secretos y datos del taller. Estas reglas no autorizan ejecutar un despliegue, exportación, restauración ni escritura alojada por sí mismas.

---

## PRIORIDAD ABSOLUTA — NO REPETIR CIFRADO DE RESPALDO LOCAL (19/11/2026)

**Antes de sugerir crear claves GPG, exportar de nuevo toda la base o comenzar desde cero, LEER esta sección, `roadmap.md` y los checkpoints de respaldo.** El propietario confirmó y el historial de trabajo del 17/11/2026 dejó evidencia de que **YA se generó y descifró un respaldo cifrado local en Windows**. No confundir el estado del respaldo manual del PC con el workflow automático de GitHub/Google Drive, que quedó bloqueado por autorización OAuth de la carpeta.

**Hechos históricos del procedimiento local (evidencia conversacional del propietario; los archivos privados no se guardan en GitHub):**
- Se configuró GPG/OpenPGP con material de clave pública y clave privada bajo custodia local. Se informó `CIFRADO Y DESCIFRADO OK`, seguido de `BASE_DESCIFRADO_OK`, `ARCHIVO_POSTGRES_OK` y `CATALOGO_OK`. **No pedir generar claves nuevas ni repetir cifrado sin identificar antes el estado de la copia existente.**
- Copia cifrada en `BT-Backups/bytetorque-local-20261117T144118Z-8c1f8a323a924d44a6b8e853e6faa756/` (ruta base local por confirmar, no suponer letra de unidad); archivos reportados `database.dump.gpg` (**89.091 bytes**) y `roles.sql.gpg` (**151 bytes**). Tamaños reportados NO sustituyen SHA-256, lectura íntegra ni manifiesto.
- **Se ejecutó correctamente una restauración de la base SQL en un entorno Docker aislado**; su comprobación funcional/documentada cubrió siete tablas: reportes `BT_DATOS: RLS_ACTIVA=7 POLITICAS=16`, `BT_REGISTROS: TABLAS=7 FILAS=25`, `BT_PARIDAD: SIETE_TABLAS_COINCIDEN`. Esto acredita las comprobaciones específicas indicadas, **no** una recuperación integral de todo Supabase ni todos los roles/extensiones/objetos Storage.
- **Problema sin cerrar:** `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` en diagnóstico separado; el archivo `roles.sql.gpg` de 151 bytes **NO se declara respaldo de roles correcto/recuperable** sin inspección y prueba. No interpretar el fallo anterior de salida `NUL` como corrupción de `database.dump.gpg`: posteriormente `BASE_DESCIFRADO_OK` y `CATALOGO_OK` se observaron.

**Siguiente paso correcto en el PC:** localizar y conservar sin sobrescribir la carpeta cifrada existente, verificar nombres, tamaño e integridad SHA-256 de los ciphertext y que el keyring/clave privada aún pueda descifrar; **después** diagnosticar/exportar roles de manera controlada y completar recuperación integral aislada con una copia identificada. La última prueba de siete tablas **no reemplaza** la verificación del proyecto completo (Auth, roles, políticas, Storage bytes/configuraciones/Edge/secretos externos). No instalar migraciones productivas CP05/LIVE-02 ni activar módulos/comunicaciones hasta superar las puertas restantes y obtener autorizaciones explícitas.

**Flujo aparte y todavía PENDIENTE:** exportación cifrada automática a Drive `BT-BACKUP-GHA` no tiene recibo exitoso ni restore externo demostrado: OAuth `drive.file` no podía acceder a carpeta existente. La preparación de carpeta alternativa `BT-DRIVE-PROVISION` fue código OFF, sin ejecución autorizada; no afirmar que hubo subida real a Drive. No ampliar OAuth, cambiar secretos, regenerar claves o disparar workflows de respaldo por deducción.

**Protocolo de próximos agentes/chats:** informar primero "el cifrado local ya se hizo; la restauración SQL aislada se ejecutó correctamente y se verificó la paridad de siete tablas; faltan roles y cobertura integral de Supabase". No recomendar repetir instalación ni preparar cifrado como si fuera cero. Separar claramente **(A) copia local cifrada**, **(B) ensayo de recuperación parcial**, **(C) respaldo automático Drive bloqueado** y **(D) restauración integral pendiente**. Evitar publicar hashes sensibles de archivos, contraseñas, claves privadas, dumps, emails de propietarios o capturas de secretos. Esta decisión **prevalece** sobre textos antiguos que digan genéricamente "no existe respaldo": esos textos se refieren a ausencia de *respaldo integral recuperable y verificado* o a falta de exportación cloud, no a inexistencia de la copia local.

---
## Decisión permanente CP05 · PDF R3 + checkpoints (17/11/2026)

- PDF oficial predeterminado: el diseño visual ByteTorque de la captura aportada por el Director, con encabezado, cotización/revisión/fecha/vigencia, cliente/vehículo, tabla, costos, condiciones, observaciones, marca y espacio de conformidad. Usar datos reales de snapshot, jamás datos de QA incrustados ni teléfonos/QR ficticios. PDF de borrador no es revisión emitida ni aceptación.
- Plus y Full vigentes: pueden seleccionar **papelería PDF propia A4 privada** de una página, con espacio reservado para campos dinámicos. Básico usa la oficial. El control de acceso se valida en SQL/Storage, no por frontend; `VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED` apagado mientras su migración siga sin instalar. No autorizar por accidente a mecánicos de otros talleres.
- **Cada tarea terminada debe dejar un checkpoint en `docs/checkpoints/`** con commit, pruebas comprobadas, despliegue/flags, migraciones aplicadas o candidatas y próximo paso para mudanza de chat. Ver `docs/BT_CP05_PDF_DEFAULT_AND_CUSTOM_TEMPLATES.md`.

# ByteTorque — AGENTS.md

**Versión documental:** BT-UI-02-R2-OFICIAL / 2026-11-11  
**Producto y marca comercial oficial:** **ByteTorque** (proyecto técnico `biomotors-taller`, independiente de BIOMOTORS Academia). BIOMOTORS es el taller piloto, no la marca visible del SaaS.  
**Identidad gráfica vigente:** BT-BRAND-01 aprobada por el Director el 14/11/2026; originales definitivos en `assets/brand/originals/`, contrato y hashes en `assets/brand/README.md` y `assets/brand/manifest.json`. Usar estos archivos, sin reinterpretar ni dibujar sustitutos.

**Estado:** Inicio **BT-UI-02-R2 aprobado visualmente como sistema premium OFICIAL** por el Director el 11/11/2026; Android Expo BT-UI-01 preservado; sin backend ni APK real. Próximo panel: Órdenes de trabajo BT-UI-03.


## Excepción temporal de visibilidad — autorización expresa 17/11/2026

Al comprobar GitHub `visibility: public` y acceso anónimo, el propietario autorizó
expresamente que `Danielsanchezdesarrolador/biomotors-taller` permanezca **público
temporalmente** y continuar commits/push a main. No cambiar la visibilidad ni
bloquear otra vez solo por esta condición mientras siga vigente su autorización.
El propietario decidirá cuándo volverlo privado. Nunca publicar contraseñas,
claves privadas, tokens, credenciales o datos sensibles de usuarios/clientes.
Las demás restricciones de Supabase, migraciones, cobros y usuarios reales siguen.

## Regla permanente — dominio web oficial (17/11/2026)

- **Dirección canónica definitiva elegida por el Director:** `https://bytetorque.cl` (raíz, sin `www`). Todos los nuevos enlaces dirigidos a clientes, manuales, textos de marca y futuras comunicaciones deben priorizar esta dirección; `www.bytetorque.cl` será alias con redirección a la raíz una vez configurado.
- `https://biomotors-taller-demo.onrender.com` es **solo la dirección técnica del mismo servicio** `srv-dbqe4quc6qcc73f275jg`, no el dominio comercial ni un segundo sitio. **No crear otro Render** para realizar el cambio; mantener `main`.
- **Historial real confirmado:** el 16/11/2026 se configuraron en NIC Chile los nameservers de Cloudflare `hugh.ns.cloudflare.com` y `margaret.ns.cloudflare.com`; CNAME `@` y `www` a `biomotors-taller-demo.onrender.com` en modo **DNS only**; Render mostró ambos dominios **Verified**, certificados HTTPS **Issued** y la aplicación cargó en `https://bytetorque.cl` (incluidas rutas de acceso y registro). Supabase Auth ya tenía **Site URL** `https://bytetorque.cl` y redirección de confirmación `https://bytetorque.cl/#/auth/confirmacion`. **No reconfigurar DNS/Custom Domains/Auth desde cero**. El 17/11/2026 el Director mostró `ERR_CONNECTION_CLOSED`: diagnosticar como **regresión de conectividad posterior a configuración previamente funcional**, no como puesta en marcha pendiente. La disponibilidad de hoy sigue sin verificarse; conservar acceso técnico de contingencia.
- **Diagnóstico de la regresión:** primero comparar acceso desde red Wi-Fi y datos móviles, consultar estado Custom Domains/certificados en Render y DNS Cloudflare, y contrastar con URL técnica; verificar configuración existente antes de cambiarla. Supabase Auth ya se configuró para el dominio el 16/11: **no cambiar Site URL, Redirect URLs ni flujos de correo sin un diagnóstico y autorización concretos**. Evitar cortes de sesión y enlaces rotos.
- El dominio debe mantenerse registrado y renovarse a tiempo: la decisión de usarlo indefinidamente no garantiza su disponibilidad si vence el registro o falla DNS.

## Regla permanente — BT-PLAN-04 personas, talleres y extras (17/11/2026)

**BT-PLAN-04 · decisión vigente 17/11/2026:** Cualquier persona confirmada empieza con **Básico personal gratuito, sin creación de taller nuevo**. Puede recibir/comprar Plus o Full **antes** de registrar su propio taller. **Plus USD 5/mes incluye 4 mecánicos; Full USD 15/mes incluye 8; cada mecánico adicional cuesta USD 2/mes al titular del plan**, nunca al trabajador. Propietarios/administradores no ocupan cupos. Ignacio recibirá Full permanente sin cobro, creará Biomotors e invitará a sus 2 mecánicos (2/8). Esta decisión **reemplaza los cupos BT-PLAN-03 (Básico 2, Plus 8, Full 8)**; preserva talleres QA existentes, datos e historiales. 04A está instalado; 04B/04C y la preparación de 04D están implementados como código/SQL candidato probado localmente, todavía sin instalar ni activar. Los cobros reales permanecen desactivados. Ver `docs/BT_PLAN_04_IMPLEMENTACION_20261117.md`. Ver `docs/BT_PLAN_04_CUENTAS_TALLERES_Y_EXTRAS.md`.

- El panel Creador debe buscar y conceder Plus/Full a personas verificadas por UUID con MFA/AAL2 y auditoría, antes de que creen su taller. El encabezado debe reflejar únicamente el plan realmente validado en servidor de la cuenta/taller seleccionado. Sin autoasignación de creador, sin talleres ajenos, ni pagos activos. El mecánico invitado conserva una cuenta personal gratuita pero usa las funciones autorizadas del plan del taller.

## Regla permanente — cuenta Creador y suscripciones (17/11/2026)

- **Plataforma de dos niveles:** cuentas corrientes con correo verificado administrarán exclusivamente su taller y mecánicos; la cuenta **Creador**, exclusiva del titular del software, tiene panel propio para conceder, extender o revocar suscripciones sin ser dueño de talleres ajenos.
- **Planes vigentes:** Básico personal gratis sin taller nuevo; Plus USD 5/mes con 4 mecánicos incluidos; Full USD 15/mes con 8 mecánicos incluidos; cada mecánico adicional USD 2/mes pagados por titular, nunca trabajador. El Creador concede derechos personales Plus/Full con MFA y auditoría; la compra/trial y su aplicación automática están pendientes.
- **Ignacio:** después de registrar/verificar su cuenta, el Creador le concederá **Full permanente sin cobro** antes de que cree su **propio taller Biomotors**. No confundir con talleres QA A/B; Ignacio no recibe permisos globales, código ni acceso a otros talleres.
- **Seguridad del Creador:** permiso privado en bt_platform_private.creators, asociado al UUID de Auth y jamás a user_metadata o selector visual. RPC bt_creator_is_creator, bt_creator_overview y bt_creator_manage_subscription validan el acceso en servidor. Toda modificación manual requiere JWT aal2 (TOTP MFA), idempotencia y auditoría. No exponer historiales/clientes ajenos al panel global.
- **Estado BT-CREATOR-01:** esquema privado aditivo instalado y rol del Director vinculado; su cuenta es además admin SOLO en Taller ByteTorque de Pruebas. Panel de React src/creator/CreatorConsole.tsx bajo VITE_BT_CREATOR_PRIVATE_ENABLED=true. Sin pagos reales. La sincronización con límites/beneficios, el alta autónoma y la gestión de mecánicos tienen candidatos 04B/04C sin instalar. El flag `VITE_BT_PLAN04_WORKSHOPS_ENABLED` permanece apagado hasta autorización SQL, pruebas alojadas y respaldo recuperable. Ver docs/BT_CREATOR_01_ESTADO_Y_PLAN.md.
- **Prioridades:** la infraestructura del Creador se prepara ahora por nueva instrucción, pero CP05/CP06 y el piloto de Ignacio siguen antes de activar pagos, suscripciones públicas o comercialización.

## 1. Misión y fuentes de verdad

Crear ByteTorque, una aplicación de gestión para talleres mecánicos con enfoque **SaaS multiempresa (multitenant)**. El primer taller piloto será el de Ignacio; el producto debe servir posteriormente a múltiples talleres suscritos, con aislamiento estricto de datos. Conservar todos los requerimientos de la nota de voz del 11/11/2026: inspección multipunto, presupuesto formal, correos al cliente, fichas de clientes y vehículos, historial técnico y observaciones pendientes.

**Prioridades inamovibles:** **primero funcionamiento integral y piloto real aprobado por Ignacio** (decisión del Director, 15/11/2026); continuidad sin reconstrucciones innecesarias; seguridad y privacidad; facilidad de uso en iPhone y Android; costos iniciales contenidos; claridad para usuarios no técnicos. La arquitectura multitenant sigue desde el inicio para aislar datos, pero la incorporación de terceros, cobros, suscripciones y escalamiento (CP07–CP09) **no se implementarán hasta terminar y aprobar el piloto de Ignacio**. Priorizar los flujos persistentes CP03–CP06 después de cerrar solo las puertas de Auth necesarias. Consultar definición de terminado y bloqueos en `roadmap.md`.

## 2. Responsables acordados

- **Responsable técnico / desarrollo (usuario):** diseño del producto, implementación, código, GitHub, Supabase, despliegues, seguridad, pruebas, actualizaciones y mantenimiento técnico.
- **Responsable comercial (Ignacio):** usar el piloto como taller de referencia, contactar talleres, presentar el producto, captar clientes, recoger retroalimentación comercial y coordinar oportunidades de venta.
- **Decisiones conjuntas pendientes:** titularidad jurídica de software/marca, reparto de ingresos o utilidades, facturación, soporte al cliente, presupuesto de operación, política comercial y eventual estructura societaria. **No presumir porcentajes, cesiones ni asociaciones legales automáticas.**

## 3. Metodología de trabajo — usar la herramienta adecuada y ahorrar cuota

**Decisión confirmada por el responsable técnico el 11/11/2026.** Aplicable a todas las etapas:

1. **ChatGPT de este proyecto:** analizar, proponer, programar, actualizar archivos, verificar y documentar directamente siempre que tenga herramientas y permisos. Priorizar la ejecución real y evitar delegación innecesaria.
2. **ChatGPT en modo Alto:** usarlo cuando el trabajo exija razonamiento adicional o revisión profunda y el usuario así lo elija.
3. **Codex:** reservarlo para tareas grandes, refactorizaciones extensas, exploración de muchas rutas o problemas que no puedan resolverse fiablemente de forma directa; cada encargo debe estar acotado, con criterios de aceptación y referencia a checkpoint.
4. **Usuario:** intervenir exclusivamente en decisiones, revisión visual, permisos, configuraciones que requieran acceso personal y pruebas físicas (por ejemplo, iPhone de Ignacio).
5. **Cero trabajo repetido:** no rehacer lo que ya esté en main; leer el estado antes de cada cambio. No crear ramas paralelas, studios adicionales, ni gastos de cuota sin beneficio claro.
6. **Evidencias primero:** diferenciar archivos creados, build verificado, CI aprobado, web publicada y aplicación probada en dispositivo real; no confundir estas fases.
7. **Aprobar primero actividades sensibles:** sin cobros reales, correos externos, cambios irreversibles, secretos ni incorporación de datos personales hasta que el usuario lo autorice.

## 3B. Entregas funcionales completas — decisión del Director (15/11/2026)

Para CP03–CP06 usar el [método de entregas del piloto](docs/BT_PILOTO_IGNACIO_METODO_ENTREGAS.md): **definir una función utilizables por Ignacio → integrar código existente → una ronda final de pruebas de función y seguridad → validar con autorización en backend real/iPhone → checkpoint y siguiente función**. Evitar subetapas de validación redundantes si no corrigen un fallo o desbloquean la operación. No sustituir pruebas reales por mocks ni saltarse RLS, seguridad o autorizaciones. **Sin permiso para migraciones, proveedores o datos personales, no desplegar** y no declarar capacidad completa.

## 4. Reglas operativas del agente / Codex

1. Antes de modificar, leer `README.md`, `AGENTS.md`, `roadmap.md` y el último checkpoint.
2. No mezclar ni reutilizar tablas, proyectos, secretos o despliegues de **BIOMOTORS Academia**.
3. El backend previsto es el proyecto Supabase independiente `biomotors-taller`, cuya existencia se ha comunicado; verificar identidad/estado antes de conectarlo. Nunca colocar credenciales en repositorio ni mensajes.
4. Repositorio previsto: `Danielsanchezdesarrolador/biomotors-taller`. **Creado y verificado el 11/11/2026 durante BT-CP01.** Trabajar exclusivamente sobre `main`; no crear ramas, forks, otros sitios o entornos sin autorización.
5. Preferir incrementos pequeños, verificables, reversibles, con commits identificables, pruebas y reporte de cambios.
6. No activar cobros reales, envíos masivos de correo, migraciones destructivas ni datos de clientes reales sin autorización explícita y controles probados.
7. Toda tabla con datos de taller debe tener `workshop_id`/`tenant_id`, claves foráneas coherentes y **RLS comprobado con pruebas de acceso cruzado**. No depender de ocultar registros en frontend.
8. Claves administrativas o de servicio exclusivamente en backend seguro; jamás en la PWA, APK Android ni archivos públicos.
9. Preservar trazabilidad: qué pidió Ignacio, qué fue decidido, qué es hipótesis, qué está implementado y qué continúa pendiente.
10. **CORRECCIÓN DEFINITIVA 11/11/2026:** Android = APK NATIVA React Native + Expo + TypeScript, como Punto Fénix; NO PWA ni WebView. iPhone/iOS = SOLO PWA desde Safari agregada a pantalla de inicio; NO app nativa iOS, Apple Developer ni App Store. Web PC = acceso vía navegador al mismo frontend de iOS PWA.
11. **Autorizada** la demo web en Render solo para navegador/iOS PWA; Android se implementará como cliente NATIVO en `apps/android/` en este repo.
12. Backend único Supabase `biomotors-taller` compartido por PWA iOS/web y APK Android, aislado por taller (RLS). Nunca incluir `service_role` en clientes.
13. No decir APK lista hasta generar, firmar e instalar un APK auténtico en un dispositivo Android; iconos y manifiesto PWA no sirven como prueba de APK.

## 4. Alcance funcional mínimo del piloto

- Identificación del taller y usuario autenticado.
- Registro de clientes y vehículos, incluyendo placa/patente y datos pertinentes.
- **Hoja de inspección multipunto** editable, con resultado, fecha, responsable y observaciones técnicas.
- **Presupuestos/cotizaciones** vinculados a clientes, vehículos y revisiones, exportables a PDF; números, ítems, precios y estados.
- Envío transaccional al correo del cliente de los documentos de revisión y presupuesto con registro de fecha y resultado de entrega.
- Historial cronológico por vehículo: diagnósticos, servicios, trabajos realizados, ítems pendientes y presupuestos.
- Observaciones de problemas no reparados que permanezcan visibles en visitas posteriores.
- Respaldo, exportación y políticas de retención; no depender de conversaciones de WhatsApp.

La hoja multipunto y el formato del presupuesto **deben contrastarse con las plantillas reales facilitadas por Ignacio** antes de considerarse versiones definitivas.

## 5. Diseño multiempresa desde la primera migración

Entidades sugeridas: `workshops`, `profiles`, `workshop_memberships`, `customers`, `vehicles`, `inspections`, `inspection_items`, `estimates`, `estimate_items`, `service_records`, `vehicle_observations`, `email_deliveries`, `subscriptions` y `audit_events`.

- Los datos de cada taller tienen propietario lógico único (`workshop_id`) y permisos derivados de membresías activas.
- Un mismo cliente o vehículo puede existir en distintos talleres sin fusionar historiales ni exponer información ajena.
- Roles previstos por taller: propietario y colaborador; roles adicionales se introducen según necesidades verificadas.
- Gestión administrativa de la plataforma separada y auditada; evitar accesos indiscriminados a datos privados.
- Probar operaciones directas sobre API/DB: lectura, escritura, modificación, eliminación y exportación, tanto autorizadas como denegadas.

## 6. Modelo de negocio — decisión estratégica

- **Meta:** comercializar ByteTorque a otros talleres mediante pago recurrente.
- **Planes comerciales aprobados para diseño (11/11/2026):** Básico **gratis sin publicidad durante lanzamiento**; Plus **USD 5/mes por taller**; Full **USD 15/mes por taller**. Prueba Full **3 días (72 h) con método de pago**. El propietario puede **desactivar renovación automática desde Configuración**, incluso inmediatamente al activar; si el servidor/proveedor confirma antes del vencimiento, no se intenta cobrar y conserva Full hasta fin de prueba, luego Básico sin perder datos. Más detalles: docs/PLANES_COMERCIALES_BT_PLAN_01.md. Sin cobros reales todavía.
- **Adquisición:** Ignacio lidera contacto, demostraciones y venta; el usuario lidera evolución del producto.
- **Etapas:** taller piloto -> otros talleres piloto -> validar cobro y soporte -> lanzar suscripción -> ampliar cartera.
- **Indicadores:** talleres activos, usuarios por taller, presupuestos generados, correos enviados, retención, gastos por taller, incidentes y tasa de conversión.

## 7. Seguridad, legalidad y experiencia

- Cumplimiento aplicable de privacidad, protección de datos personales, consentimiento/información y derechos de acceso/exportación; revisar normativa chilena vigente antes del lanzamiento.
- Definir responsable de tratamiento, políticas de conservación, respaldo/restauración, borrado y recuperación de cuentas.
- Presupuestos PDF no equivalen automáticamente a facturas o documentos tributarios electrónicos.
- Correos transaccionales con dominio verificado, autorización, límites de envío, manejo de errores y bitácora; sin hacer marketing no solicitado.
- Diseño móvil sencillo: botones grandes, formularios breves, estados claros, guardado fiable y accesibilidad.

## 8. Definición de terminado por funcionalidad

Cada entrega debe incluir: requerimiento, diseño de permisos, migración reversible si aplica, prueba unitaria/integración, prueba de RLS multitenant, prueba móvil Safari cuando corresponda, evidencia de ejecución, actualización de roadmap y checkpoint con riesgos/pedientes.

**Próxima etapa:** completar BT-CP01 verificando CI/build, publicación demo y conexión segura del proyecto Supabase independiente. La interfaz actual es demostrativa; no guarda información.
## Corrección de arquitectura oficial

La descripción anterior «PWA para Android e iOS» fue revocada por el usuario. Fuente vigente: `docs/ARQUITECTURA_PLATAFORMAS.md` y checkpoint BT-CP01-PLATAFORMAS. Conservar historia anterior, una rama `main` y el repositorio independiente de BIOMOTORS Academia.

## Identidad visual y nomenclatura — decisión 11/11/2026

- **Nombre visible de la aplicación:** `ByteTorque`, escrito exactamente así, sin espacio.
- **Marca de presentación:** ByteTorque. No usar «BIOMOTORS TALLER» en títulos, menús, onboarding, emails de la aplicación, iconos nombrados ni entregables nuevos.
- **Taller piloto:** BIOMOTORS, propiedad de Ignacio; mostrar BIOMOTORS solo como nombre del taller activo cuando corresponda, y no simular propietarios ni clientes reales.
- **Identificadores técnicos heredados:** conservar `biomotors-taller` en GitHub, Supabase y URL de Render, salvo autorización separada de migración, para evitar romper las integraciones.
- **Director de Arte:** adaptar los cinco paneles y el flujo de registro de clientes a ByteTorque; los mockups antiguos de BIOMOTORS TALLER son referentes de diseño, no marca final. Logo e iconos de marca quedan pendientes de aprobación.
- **Control comercial:** disponibilidad registral, dominios y posible marca registrada todavía no verificados; no afirmar exclusividad.

## BT-UI-01 — Inicio visual dual (aprobación 11/11/2026)

- Los dos clientes usan los mockups del usuario como referencia visual, con identidad visible **ByteTorque**, estética azul marino, blanco, azul intenso, indicadores y tarjetas.
- Web / iOS Safari PWA: frontend React/Vite en raíz; Android **nativa**: React Native + Expo en `apps/android/`.
- Cinco destinos: Inicio, Órdenes de trabajo, Clientes y vehículos, Informes y cotizaciones, Configuración. No añadir secciones extras al menú principal sin nueva decisión.
- Mostrar claramente modo DEMO cuando se utilicen datos inventados (cifras, vehículos, órdenes). Ningún botón de crear debe fingir persistencia, emisión o envío; navegar a módulo o advertir que está pendiente.
- Cada entrega de UI debe comprobar TypeScript y pruebas en CI, y verificar estado de Render; APK real solo cuando se haya generado/firmado y probado en dispositivo.
- Icono y logotipo definitivos aún pendientes del Director de Arte, no introducir símbolos o activos comerciales ajenos como logo final.

## Decisión BT-UI-02 — desarrollar y aprobar desde Render antes de APK Android

1. **Render web = plataforma principal de desarrollo y revisión**, trabajando solo en `main`, con despliegue automático de cambios aprobados a la demo de ByteTorque. Mantener **un solo sitio** y los mismos identificadores de infraestructura.
2. **APROBADO** el 11/11/2026: el Inicio **BT-UI-02-R2** define la identidad visual **OFICIAL** para los cinco paneles. Mantener `src/premium.css` y `src/styles.css` y reproducir idéntica calidad en las demás pantallas, sin modificar el Inicio aprobado. Contrato oficial en `docs/SISTEMA_VISUAL_OFICIAL_R2.md`.
3. **Android debe seguir siendo nativo** React Native + Expo. El cliente de `apps/android/` queda preservado temporalmente en BT-UI-01; su estética se actualizará **después** de consolidar flujos web y antes de crear APK. No usar WebView/PWA como atajo ni afirmar que compartir React DOM equivale a compartir interfaces nativas.
4. Diseñar contratos de datos, validaciones y lógica reutilizables en la medida de lo posible para evitar duplicar errores; para ambos clientes, un único Supabase con Auth y RLS multitenant. No habilitar datos personales, correos, pagos ni cuenta real sin seguridad y aprobación.
5. **No construir ni firmar APK ahora.** Al cierre del trabajo web, portar las pantallas aprobadas, verificar compilación nativa, generar APK firmado, probar en Android real y documentar resultados.
6. No confundir **código creado**, **GitHub CI PASS**, **Render LIVE**, **aprobación visual** ni **APK física probada**. Registrar evidencia individual para cada estado.

## Orden vinculante — Sistema visual OFICIAL R2

El Director aprobó expresamente BT-UI-02-R2. Todo diseño nuevo (incluido BT-UI-03 Órdenes de trabajo) debe basarse en `docs/SISTEMA_VISUAL_OFICIAL_R2.md` y no alterar ni sustituir la identidad ni el Inicio existente. No se permite introducir paletas, menús, topbars, estilos de tarjeta, tipografías o iconos discordantes. La identidad premium debe mantenerse en escritorio, Safari/iPhone PWA y finalmente Android nativo. La fidelidad visual debe comprobarse con capturas lado a lado. No confundir la aprobación visual del Inicio con autorización de backend real o APK.

## Requisito nuevo del Director — formulario de registro mediante enlace (11/11/2026)

Al abrir un enlace individual, el cliente completará sus datos personales **y también los de su vehículo** (marca, modelo, año, kilometraje; patente opcional) y el **motivo breve de la visita o el trabajo solicitado**. El envío definitivo deberá crear una solicitud pendiente de revisión vinculada al taller, no finalizar una OT automáticamente. Ignacio podrá convertirla en orden reutilizando los datos, sin transcribirlos. Enlaces seguros, datos mínimos, consentimientos, permisos/RLS y controles antiabuso obligatorios al implementar backend. Contrato: `docs/BT_REGISTRO_CLIENTE_VEHICULO_VISITA.md`.

**Separación de alcance:** mientras Codex implementa BT-UI-05 Informes y cotizaciones, registrar este requerimiento solo en documentación; **no alterar en paralelo formularios React, componentes R2, Supabase, Render ni Android**.

## Obligación BT-PLAN-01 — prueba Full y control de renovación

Básico gratis sin anuncios en lanzamiento; Plus USD 5/mes; Full USD 15/mes por taller. Trial Full 72 horas con método de pago, USD 0 inicial y consentimiento explícito al futuro cargo. Mostrar cancelación de renovación en Configuración desde primer minuto; cancelada a tiempo y confirmada en pasarela implica **cero intento de cobro**. Acceso Full hasta vencer y paso a Básico sin borrar historial. No almacenar tarjetas ni habilitar suscripciones sin aprobación, backend multitenant, idempotencia y prueba de no-cobro. Cuotas y publicidad posterior no aprobadas.

## Puerta BT-CP02-D — onboarding controlado (12/11/2026)

La función `bootstrap_workshop_owner` es SECURITY INVOKER y ejecutable únicamente por `service_role`. El endpoint Supabase Edge `bt-owner-onboarding` usa `verify_jwt=true`, comprueba el correo verificado por Auth y **permanece desactivado por defecto mediante `BYTETORQUE_ONBOARDING_ENABLED`**. No abrirlo ni conectar login público hasta aprobar pruebas A/B y límites de abuso. Checkpoint: `docs/checkpoints/CHECKPOINT_BT_CP02_D_20261112.md`.

## BT-PLAN-02 — Regla de plantillas de informe por plan (13/11/2026)

**Básico** usa exclusivamente **plantillas de informe oficiales predeterminadas**; no admite subir archivos propios. **Plus y Full** podrán subir y administrar **sus formatos propios de informes**, por taller, cuando la infraestructura real esté aprobada. Durante la prueba Full de 72 horas aplica el permiso temporal de Full; tras bajada a Básico, conservar consulta/exportación histórica y bloquear nuevas operaciones con formatos premium sin borrar archivos. Importar un PDF/Word/Excel **no lo hace editable o interactivo automáticamente**: requiere mapeo y validación explícita. Control en backend por suscripción, RLS y Storage privado por taller, no en estado React. Especificación: `docs/PLANES_COMERCIALES_BT_PLAN_01.md`. **BT-INS-01 de Codex no cambia por esta anotación**; no tocar UI, Supabase ni almacenamiento en paralelo.

## Regla permanente — evolución gradual de planes BT-PLAN-IDEAS-01 (13/11/2026)

El Director irá proponiendo nuevas funciones de **Básico, Plus y Full** a lo largo del desarrollo. Cada idea debe agregarse al **registro maestro `docs/REGISTRO_IDEAS_PLANES.md`**, con ID consecutivo `BT-IDEA-NNN`, fecha, descripción, plan, estado de aprobación, estado técnico y dependencia/coste si aplica. No borrar ni reemplazar decisiones históricas sin referencia de cambio. **Aprobada para diseño ≠ implementada o vendible**; propuestas no confirmadas van como **Por evaluar**. En la revisión final previa al lanzamiento recuperar y revisar todas las ideas registradas y obtener aprobación de matriz final del Director. La simple anotación NO autoriza ejecución de código, gastos, cobros, cambios de Supabase, publicidad posterior al lanzamiento ni intervención en BT-INS-01 mientras Codex trabaja.

## Instrucción vigente de transición — BT-OFICIAL-01 (14/11/2026)

El Director aprobó BT-QA-02 y solicitó iniciar la versión oficial ByteTorque, **sin nombres DEMO ni registros ficticios visibles en el sitio**. Leer `docs/BT_OFICIAL_01_TRANSICION_PRODUCTO.md` antes de modificar. Este es un **cambio de presentación/preparación** y no habilita aún clientes reales, identidades verificadas ni guardado permanente.

La UI pública debe iniciar vacía y sin cifras inventadas. Mantener los fixtures exclusivamente para tests aislados, sin activación pública ni inclusión en el bundle oficial. Sin backend aprobado, las acciones que aparenten ingresar/guardar información real deben quedar deshabilitadas con mensaje veraz, no solo perder la palabra «DEMO». Conservar cinco paneles R2, flujo A–E y lógica de revisiones/documentos para su reconexión posterior. Mantener `main`/Render existente hasta decisión separada. Pruebas BT-CP02-D y credenciales reservadas al otro chat; no tocar Supabase/Auth/RLS/onboarding/planes/correo/pagos en 01A. Ver roadmap y checkpoint QA-02.


## Decisión vinculante de cupos BT-PLAN-03 (14/11/2026)

**Regla histórica sustituida por BT-PLAN-04 (17/11/2026)**: previamente se aprobaron **Básico hasta 2**, **Plus hasta 8**, **Full hasta 8**, con acceso a mecánicos gestionado desde `Configuración → Usuarios y permisos`. El administrador del taller puede invitar/desactivar únicamente **mecánicos de su taller**; no concederse ni conceder roles administrativos, modificar dueño, manejar cuentas de otros talleres o alterar planes. Propietario/administrador no ocupan cupos de mecánico; los límites de otros roles no están fijados. En la prueba Full vigente se aplica el cupo Full. Los cupos deberán validarse desde backend con conteo seguro y reservas para invitaciones pendientes, no por React. No habilitar invitaciones ni Auth real hasta BT-CP02-D aprobado en su chat reservado; BT-AUTH-01A solo UI sin efectos reales. Ver `docs/PLANES_COMERCIALES_BT_PLAN_01.md`, `docs/REGISTRO_IDEAS_PLANES.md`, `docs/BT_AUTH_01_LOGIN_ROLES_CORREO.md` y `docs/MATRIZ_ROLES_Y_PERMISOS.md`.


## Identidad gráfica definitiva — BT-BRAND-01 (14/11/2026)

El Director aprobó `bytetorque_icono_oficial_original.png` y `bytetorque_logo_horizontal_oficial_original.png`, conservados sin modificar en `assets/brand/originals/`. Esta aprobación sustituye las referencias anteriores a logos provisionales/pendientes; no equivale a registro legal de marca. **Nunca rediseñar, recolorear, deformar ni sustituir estos recursos por llaves, iniciales o dibujos procedurales.** Mantener los iconos funcionales de herramientas y navegación.

Usar `src/brand/BrandLogo.tsx`: horizontal original para superficies claras y `surface="dark"` con derivado de texto claro para fondos navy; sin tarjetas, fondos, padding, bordes ni sombras detrás del logo. Icono en espacios pequeños. La identidad comercial del taller y sus logos son independientes; los documentos llevan únicamente atribución discreta «Software ByteTorque», sin asignar BIOMOTORS a talleres nuevos. El generador Node publica derivados oficiales versionados y valida los hashes de todos los originales/derivados; nunca restaurar el generador provisional. Regeneración excepcional con `scripts/prepare-brand-assets.py`, sin sobrescribir originales, y nueva aprobación para cambiar el arte.

Preservar PWA `id`, `start_url`, `scope`, entrada R1 y seguridad. Maskable/adaptativo deben conservar el arte dentro de la zona segura, sin cortes. Los recursos Expo están preparados; no afirmar APK creada, app instalada ni paridad funcional Android. Sin cambios de Auth/RLS, backend, planes, datos o correos por integrar la marca. [Checkpoint BT-BRAND-01](docs/checkpoints/CHECKPOINT_BT_BRAND_01_20261114.md).


## BT-BRAND-02 — integración transparente (14/11/2026)

Por orden del Director, retirar el soporte blanco de BT-BRAND-01 en encabezados oscuros. Usar `BrandLogo surface="dark"` sobre navy, `surface="light"` para el original en superficies claras. No aplicar filtros CSS de inversión ni recolorear el símbolo. El derivado solo aclara los píxeles de texto «Byte» y «Gestión de Talleres»; el alfa y símbolo del PNG original se mantienen idénticos. Fuente y comprobaciones: `assets/brand/dark-variant.json`, `scripts/verify-dark-brand.py`. No modificar los originales, iconos PWA/favicon/adaptativos, identidad del taller ni A4 por este ajuste. Logo sin contenedores decorativos y sin desborde en tablet/móvil. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_BRAND_02_20261114.md). Pendiente aprobación visual del resultado por el Director; no habilita Auth/backend.


## BT-AUTH-01B-R1 — integración autorizada, activación apagada (14/11/2026)

La orden vigente [BT-AUTH-01B-R1](docs/BT_AUTH_01B_R1_ORDEN_IMPLEMENTACION.md), posterior al cierre A/B, autoriza exclusivamente login por contraseña, recuperación/validación de sesiones, logout y lecturas RLS de membresías/talleres con Supabase JS. Flag `VITE_BT_AUTH_R1_ENABLED` apagado por defecto; solo URL del proyecto `suxcqqnmcjoezfxltoms` y clave publishable. `getUser`, correo confirmado y membresía activa son obligatorios; no confiar en selector, metadata, URL ni permisos guardados. Owner/admin ven paneles vacíos; mechanic solo espacio técnico vacío; reception restringido. Rutas públicas de revisión explícitamente DEMO sin autoridad privada.

No modificar SQL/RLS, Edge, onboarding, registro, correo, invitaciones, pagos ni Android. No activar Auth al público ni iniciar R2 sin revisión del Director. Pruebas automatizadas R1 con mocks no sustituyen pruebas con cuentas reales. Configuración y pendientes: [guía Render](docs/BT_AUTH_01B_R1_CONFIGURACION_RENDER.md).
