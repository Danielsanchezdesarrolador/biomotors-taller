# CHECKPOINT 73 — BT-SEC07-R3-GPG-METADATA-DIAG-AUTHORIZED

**Fecha:** 21/11/2026 Chile · **rama:** main · **HEAD previo:** `c64d2e919df3202f93cd4f36a8d90941930e2ad8`.

## Permiso del titular
Tras CP72 y STOP_GPG_DECRYPTION_FAILED, titular contestó «AUTORIZO» a **diagnóstico GPG local solo metadatos, SIN descifrar el respaldo ni mostrar claves o contraseñas**. No autoriza repetir GPG decrypt ni el inspector fallido, importar/generar/exportar claves, restaurar, conectar SQL/Supabase, nuevos backups, SSL ni desplegar.

## Ejecutable entregado COMPLETO en chat — NO .ps1 obligatorio
PowerShell inline autocontenido, sin ZIP nuevo ni descarga, con GUI OpenFileDialog para seleccionar exclusivamente `manifest.json` del backup 19/11. Lee y parsea JSON local, comprueba project_ref conocido y `database.dump.gpg` en inventario y declara scope, **sin abrir ni leer ciphertexts .gpg**. Toma opcionalmente el campo `recipient_fingerprint` (40 o 64 caracteres hex, sin imprimirlo); si no existe emite `NOT_DECLARED`, sin inventar procedencia. Invoca localmente `gpg.exe --batch --no-tty --no-auto-check-trustdb --with-colons --fingerprint --fingerprint --list-secret-keys`, ocultando stderr y salida cruda de stdout; recolecta de registros `sec` y `ssb` el fingerprint de registros `fpr` siguientes y compara en memoria. Imprime solo marcadores `BT_SEC07_GPG_DIAG_*`, sin rutas, identificadores, UID, hashes, SQL, secretos, texto del manifest o lista de keys.

## Interpretación y límites
- `EXACT_FINGERPRINT_LISTED`: una huella mencionada por el manifest aparece en el listado secreto local; **NO** garantiza que exista material criptográfico privado utilizable en tarjeta/tokens, que el agente desbloquee el secreto, ni que el cifrado real usara esa clave.
- `NO_EXACT_MATCH_IN_LIST`: no hay coincidencia exacta con el campo manifest en este keyring; **NO** demuestra ausencia total de clave correcta para ciphertext real (subclaves, diferente keyring, manifest de otra versión o metadatos incompletos).
- `NONE_LISTED`: el comando no devolvió registros sec/ssb; ausencia en keyring consultado, NO en todos los posibles almacenamientos.
- `RECIPIENT: NOT_DECLARED`: manifest no aporta huella comparativa, no deducir método o causa de fallo.
- Este diagnóstico no inspecciona ni interpreta `PKESK` OpenPGP real; no puede distinguir `BAD_PASSPHRASE`, cancelación de Pinentry o error de integridad. Futura inspección de metadatos de paquete OpenPGP y errores sanitizados requiere herramienta/permisos y revisión separados. GPG puede actualizar locks/metadata de su propio homedir; no se prometen cero escrituras SO.
- No se ha ejecutado en el Windows del titular todavía; es código entregado, pendiente evidencia. Si STOP, diagnosticar antes de repetir.

## Estado y continuidad
CP67 PASS consistencia ciphertext↔manifest local, declaración PARTIAL_BACKUP. CP71 STOP descifrado, TOC real no certificado. CP72 causa desconocida. CP73 diagnóstico solo metadatos pendiente del titular, entregar solo BT_SEC07_*; no comentar secretes. Regla permanente CP66: PowerShell siempre **dentro del chat**.

Solo docs GitHub `main`, `[skip render]`, ningún cambio de aplicación, backup, GPG, SQL ni SSL por el asistente.