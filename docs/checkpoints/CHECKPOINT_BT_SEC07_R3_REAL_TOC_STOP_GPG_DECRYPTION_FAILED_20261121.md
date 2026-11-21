# CHECKPOINT 72 — BT-SEC07-R3-REAL-TOC-STOP-GPG-DECRYPTION-FAILED

**Fecha:** 21/11/2026 Chile · **Rama exclusiva:** `main` · **HEAD inicial:** `1862991dd45f69994fba1655334c67f6fb865470`.

## Salida REAL de Windows reportada por el propietario (una ejecución autorizada CP71)

```text
BT_SEC07_REAL_TOC_PACKAGE: VERIFIED
BT_SEC07_REAL_TOC_MODE: OFFLINE_READONLY_PROPOSED
BT_SEC07_REAL_TOC_BACKUP_SELECTED: NO
BT_SEC07_REAL_TOC_BACKUP_SELECTED: YES
BT_SEC07_REAL_TOC_MANIFEST_SCOPE: PARTIAL_BACKUP_DECLARED
BT_SEC07_REAL_TOC_CIPHERTEXT: SHA_MATCH_LOCAL_MANIFEST
BT_SEC07_REAL_TOC_TOOLS: GPG_AND_PG17_PRESENT
BT_SEC07_REAL_TOC_KEYRING: WILL_BE_ACCESSED_LOCALLY
BT_SEC07_REAL_TOC: STOP_GPG_DECRYPTION_FAILED
BT_SEC07_REAL_TOC_WINDOWS: STOP
```

El usuario añadió «TENIA CERRADO DOCKER LO ABRI RECIEN». **No reintentar automáticamente tras abrir Docker**. Inspector Python y GPG/PG17 detectados se ejecutan en Windows local, no en Docker, y el fallo ocurrió en la fase de descifrado, antes de certificar TOC.

## Diagnóstico fundamentado en el código exacto (ZIP SHA256 dd6e5b7851039eefbc5d01c3245899fa9f13e689f402b645829984bebbc24a58)
En `bt_sec07_real_gpg_toc_inspector.py`, líneas 260-264, GPG se invoca por `subprocess.Popen` con opciones `--batch --no-tty --status-fd 2 --output - --decrypt` y descriptor de entrada del dump. En líneas 201-202, `STOP_GPG_DECRYPTION_FAILED` se emite cuando `gpg.returncode != 0`; se comprueba antes de analizar `pg.returncode`, estados de integridad o recuento TOC. El código **no imprime stderr real de GPG ni tokens ni causa específica** por privacidad. Por tanto, la causa concreta **NO SE CONOCE**.

Posibles causas: clave privada que corresponda al destinatario no presente en el keyring GPG de Windows; clave bloqueada o Pinentry/agent no usable en modo `--batch --no-tty`; contraseña errónea/cancelada; otros fallos del cifrado/entrada. **No afirmar cuál fue**. No confundir existencia de GPG con existencia de clave privada. No crear clave nueva ni importar secretos sin autorización.

El antiguo exportador `bytetorque_respaldo_local.py` revisado desde la biblioteca del titular usaba **cifrado OpenPGP por clave pública verificada e importada en keyring temporal** y anotaba `recipient_fingerprint` en el manifest. No obstante, el respaldo reciente del 19/11 tiene `roles.catalog.json.gpg` y puede haber sido generado por otro exportador: no extrapolar método o destinatario exactos sin inspección controlada del manifest/paquetes. El script exportador antiguo no es prueba suficiente del contenido del archivo real.

## Qué SÍ está certificado y qué NO
- Sigue válido CP67: manifest y archivos ciphertext del backup parcial concuerdan en tamaño/SHA-256, identidad local y backup_id. Copia original intacta según operación de solo lectura.
- GPG/PG17 presentes y con versiones compatibles: SI. **Descifrado del archivo real: FALLÓ**. **TOC auténtico: NO CERTIFICADO**; no se validó un restore.
- La cadena literal `KEYRING: WILL_BE_ACCESSED_LOCALLY` anuncia uso potencial del keyring, **no certifica** presencia de la clave privada, entrada correcta de contraseña o autorización agent.
- No conexión a Supabase, no restauración, cambios SSL, SQL, keys ni Docker por asistente.

## Próximo paso de menor riesgo
Detener esta ejecución única; no repetir el mismo script ni tratar de activar Docker como solución. Preparar bajo autorización separada un diagnóstico local de **metadatos únicamente**: comprobar correspondencia del destinatario de OpenPGP con el inventario de claves privadas disponibles, distinguir `NO_SECKEY`, `BAD_PASSPHRASE`, cancelación Pinentry y otros errores mediante **marcadores sanitizados**, sin imprimir identificadores, fingerprints completos, rutas, SQL, stderr, passphrases o contenidos. Diferenciar acceso a keyring (requiere permiso nuevo) de lectura del ciphertext (permiso específico adicional); no descifrar durante primer diagnóstico, y no introducir claves en comando/archivo.
Si no existe la clave privada correcta, se necesitará recuperación segura de la clave original desde el medio autorizado, no generar una nueva y fingir compatibilidad. Una ejecución de inspector corregido requerirá un consentimiento nuevo; no habilitar `--pinentry-mode loopback` y manipulación de contraseñas sin diseño revisado.

## Continuidad
Regla CP66 permanente: **PowerShell completo en el chat**, nunca sólo `.ps1`. Registrar incidentes y solución definitiva en docs. Roles/owners/ACL/RLS y restore aislado permanecen pendientes; SSL enforcement independiente CP46/48.

Esta operación sólo crea documentación y encabezados en GitHub `main` `[skip render]`, sin desplegar.