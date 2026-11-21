# CHECKPOINT 74 — BT-SEC07-R3-GPG-METADATA-NO-SECRET-KEYS-LISTED

**Fecha:** 21/11/2026 Chile · **rama autorizada:** `main` · **HEAD al inicio:** `3becc0ad41b54df55e2e5c84209b06d645ccb36e`.

## Evidencia Windows real del propietario
```text
BT_SEC07_GPG_DIAG_MODE: METADATA_ONLY
BT_SEC07_GPG_DIAG_MANIFEST: RECOGNIZED
BT_SEC07_GPG_DIAG_SCOPE: PARTIAL_BACKUP_DECLARED
BT_SEC07_GPG_DIAG_RECIPIENT: DECLARED
BT_SEC07_GPG_DIAG_GPG: FOUND
BT_SEC07_GPG_DIAG_SECRET_KEYS: NONE_LISTED
BT_SEC07_GPG_DIAG_RECIPIENT_MATCH: NO_EXACT_MATCH_IN_LIST
BT_SEC07_GPG_DIAG_DECRYPTION: NOT_ATTEMPTED
BT_SEC07_GPG_DIAG_PASSPHRASE: NOT_REQUESTED
BT_SEC07_GPG_DIAG_RESULT: METADATA_CHECK_COMPLETE
```

## Conclusión limitada
- El manifest del respaldo parcial declara `recipient_fingerprint` y GPG se encuentra instalado en Windows. El comando de inventario `gpg --batch --no-tty --no-auto-check-trustdb --with-colons --fingerprint --fingerprint --list-secret-keys` retornó sin listar ninguna clave secreta `sec`/`ssb` en el **almacén consultado**. Por ello no hubo coincidencia con el fingerprint declarado.
- Esta es una explicación **plausible y prioritaria** del STOP GPG `STOP_GPG_DECRYPTION_FAILED` de CP72. No asegura que la clave privada no exista en ninguna ubicación/dispositivo, que sea definitivamente la única causa, ni que el archivo esté corrupto.
- No se intentó descifrar, no se solicitó frase de paso, no se abrió ni leyó el ciphertext; sólo se leyó manifiesto y metadatos de keyring. No se ve la huella en salida compartida; no atribuir identidad criptográfica de backup sin contrastar PKESK de ciphertext bajo permiso nuevo.
- La clave pública usada para crear una copia cifrada **no sirve para descifrarla** sin el material secreto correspondiente. Generar nueva clave no recuperará el backup anterior.

## Siguiente control propuesto
1. Identificar de manera segura dónde se generó, guardó o exportó la clave privada original (otro Windows/Gpg4win, otro GNUPGHOME, USB, almacenamiento cifrado, hardware token o copia offline). No publicar clave, passphrase, rutas personales ni archivos .asc en chat/GitHub.
2. Diseñar diagnóstico **solo inventario de ubicaciones** sin leer contenidos ni modificar keyrings, previa autorización si se requiere ejecutar nuevas herramientas. Alternativamente explorar manualmente Kleopatra u origen de clave.
3. Si la clave aparece, cotejar fingerprint localmente en contexto aislado; evaluar importación local segura con permiso separado, después un único descifrado GPG y TOC con permiso expreso; no reintentar hasta entonces.
4. Si la clave no se encuentra, marcar backup cifrado del 19/11 como **recuperabilidad en riesgo por material secreto no disponible**; planear nueva generación con esquema de custodia y pruebas controladas, no fingir restaurabilidad.

## Estado de proyecto
CP67: integridad de ciphertext cotejada con su manifiesto **PASS_LOCAL_CIPHERTEXT_CONSISTENCY_ONLY / PARTIAL_BACKUP_DECLARED**. CP72: descifrado real **STOP**; TOC/restore no certificados. CP74: **NO_SECRET_KEYS_LISTED en keyring GPG consultado**. Owners/ACL/RLS/roles SQL y backup integral, restauración aislada, automatización y SSL pendientes. Regla CP66: cualquier PowerShell futuro se entrega **íntegro EN EL CHAT**.

Solo documentación GitHub `main` con `[skip render]`, sin despliegue, GPG real, restauración, SQL ni SSL.