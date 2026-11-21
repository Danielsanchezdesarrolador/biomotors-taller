# CHECKPOINT 69 — BT-SEC07-R3-REAL-GPG-TOC-READER-PREP-V1

**Fecha:** 21/11/2026 Chile · **Rama exclusiva:** main · **HEAD inicial:** `83b89c6c02ba4feaf7c144d82529376c62c77ff4`.

## Continuidad y alcance
El propietario pidió «PERFECTO CONTINUEMOS» tras el CP68, donde ya se habían preparado respuestas sintéticas GPG/TOC (59/59 PASS). Se continuó preparando el **inspector técnico para Hito 1**, sin acceder a la keyring real, no descifrar `database.dump.gpg`, no conectarse a Supabase ni ejecutar restauración. Para preservar la regla de autorizaciones, **la ejecución real del inspector sobre archivos y llaves históricas sigue pendiente de consentimiento específico**. El script PowerShell entregado al usuario **solo ejecuta el test sintético**, no el inspector real.

## Herramienta privada generada y verificada
- ZIP `BT_SEC07_R3_GPG_TOC_READER_PREP_V1_20261121.zip`, tamaño **11554 bytes**, SHA256 `dd6e5b7851039eefbc5d01c3245899fa9f13e689f402b645829984bebbc24a58`.
- Contiene: `README.md`, `bt_sec07_manifest_readonly.py` (fuente exacta V4 de comprobación de cifrados), `bt_sec07_real_gpg_toc_inspector.py`, `test_bt_sec07_real_toc_offline.py`, `run_bt_sec07_offline_tests.py`.
- Test runner: **37/37 pruebas sintéticas PASS** antes de ZIP y **37/37 PASS tras extracción en directorio aislado**. `zipfile.testzip()` PASS. Ensayos con procesos Python falsos, **NO GPG/pg_restore reales**, y cobertura de fallos BADMDC, NO_SECKEY, estados ausentes/incorrectos, falta de GOODMDC/GOODAEAD, archivo vacío, TOC inválido, timeout, fallas de versiones, subprocess fail, longitud de línea y preservación de fichero. Inspección estática flags: solo GPG descifrado hacia stdout y `pg_restore --list -`; sin argumentos de conexión DB.
- Fuente/ZIP fueron entregados como descargables del chat, **no se publica el código de inspección** en el repositorio. Solo documentación `main`, con `[skip render]`.

## Diseño de la futura inspección REAL — SIN EJECUTAR
1. El usuario seleccionará manualmente el `manifest.json` del respaldo de 19/11. Se revalidará a través del código del V4 que `project_ref`, `backup_id`, tamaños y SHA de ciphertext enumerados coinciden; el manifiesto permanece **PARTIAL_BACKUP_DECLARED**.
2. Se detectan los clientes GnuPG (>=2.2) y `pg_restore` PostgreSQL **17**, sin solicitar credenciales SQL.
3. Python abre lectura de `database.dump.gpg` y pasa descriptor al GPG; GPG descifra a stdout y Python transmite flujo **binario** al `pg_restore --list -`, sin escribir intencionadamente un archivo plaintext. Se drena GPG hasta completar para no aceptar verificación truncada aun si PG leyó TOC antes de EOF. Se exige salida 0 de ambos procesos, estados `DECRYPTION_OKAY`, `END_DECRYPTION` y prueba de detección de modificación `GOODMDC` o `GOODAEAD`, rechazando errores; se cuentan líneas TOC, ocultando nombres/rutas/stderr completo.
4. El diseño **puede acceder al keyring y agente GPG** al ejecutarse de verdad; Pinentry/caché pueden interactuar con la sesión y el sistema operativo puede paginar memoria. No es posible garantizar ausencia absoluta de rastros/transitorios del SO. No modifica explícitamente archivos de backup, no crea archivos plaintext, no importa/exporta claves, no usa SQL de escritura ni DB/SSL, no restaura.
5. Salida satisfactoria futura se denominará únicamente `PASS_TOC_ONLY_NOT_RESTORE`: no acredita consistencia lógica de tabla, roles, owners, ACL/grants, RLS, partes de Supabase excluidas, ni recoverability. `roles.catalog.json.gpg` permanece metadato, no roles SQL.

## PowerShell ofrecido en chat, estrictamente sintético
Conforme CP66, se entregó en esta conversación **el bloque completo inline** que verifica SHA del ZIP, extrae a TEMP, corre `run_bt_sec07_offline_tests.py`, limpia TEMP y deja explícito que no accede al backup real ni keyring. No exige descargar `.ps1` y no invoca `bt_sec07_real_gpg_toc_inspector.py`. Windows real aún PENDIENTE.

## Siguiente puerta y otros riesgos
- Usuario enviará solo `BT_SEC07_*` del test offline Windows. Si STOP, no repetir a ciegas.
- **Nuevo permiso específico** para ejecutar inspector real GPG/TOC sobre respaldo cifrado del 19/11 con acceso al keyring histórico (local solamente), sin datos/credenciales compartidos. Antes de permitirlo, revisar resultado Windows del nuevo paquete y advertencia sobre GPG agent; después publicar bloque exacto PowerShell inline. No autorizar por herencia la restauración aislada.
- Hitos posteriores: restauración en DB aislada; owners/ACL/RLS/roles/completitud; nuevos backups y automatización; SSL enforcement OFF visual y tramo backend no certificado, permiso independiente (CP46/48).
- No repetir V4 (CP67 PASS); no repetir CP55/68 sintéticos. Esta operación no efectuó cambios productivos.