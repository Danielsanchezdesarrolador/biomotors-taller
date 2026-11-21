# CHECKPOINT 76 — BT-SEC07-R3-KEY-FILE-FORMAT-STOP-PUBLIC-ASC-FOUND

**Fecha:** 21/11/2026 Chile · **Rama exclusiva:** `main` · **HEAD previo:** `7031125e3393f6553da1b7ae36af4d2afd112140`.

## Evidencia nueva y corrección de interpretación
Titular ejecutó el procedimiento de CP75 y reportó:
```text
BT_SEC07_KEYCHECK_MODE: OFFLINE_NO_IMPORT
BT_SEC07_KEYCHECK_MANIFEST: RECOGNIZED
BT_SEC07_KEYCHECK_RECIPIENT: AVAILABLE
BT_SEC07_KEYCHECK: STOP_KEY_FORMAT_OR_READ
```
El usuario aclaró después que el archivo que denomina **clave privada tiene extensión `.pgp`**, y que también encontró **clave pública en archivo `.asc`**.
El STOP significa que el comando GPG `--show-keys` devolvió no-cero al examinar el archivo elegido o que falló lectura en ese punto; no se dispone de causa/diagnóstico GPG bruto. **No prueba** clave secreta corrupta, ausencia de clave, error de contraseña ni invalidez criptográfica del backup. Extensión `.pgp` tampoco demuestra que el archivo contenga paquetes de clave privada OpenPGP; puede ser contenedor cifrado o formato diferente. **No renombrar, convertir, subir ni importar ambos archivos**.

## Nuevo paso de mínimo riesgo entregado en chat
Se propone y entrega completo PowerShell para elegir el `manifest.json` original del respaldo 19/11 y **solo el archivo de clave pública `.asc`**; usa GPG `--show-keys --with-colons --fingerprint --with-subkey-fingerprint` con GNUPGHOME temporal para extraer en memoria huellas `pub/sub`, compararlas con el `recipient_fingerprint` declarado y emitir únicamente marcadores sanitizados `BT_SEC07_PUBCHECK_*` de coincidencia principal/subclave o falta de coincidencia. No examinar archivo privado `.pgp` todavía, no descifrar ni importar claves. Se requiere que no se compartan fingerprints, material, rutas ni textos de claves en el chat.
Este paso está dentro de la autorización anterior de **comprobación de huella sin importación/descifrado** (CP75), pero requiere una elección manual nueva y no afecta respaldo cifrado. Aún no hay resultado Windows del nuevo bloque, no inferir PASS.

## Requisitos de seguridad y continuidad
- **PowerShell completo dentro del chat** siempre (CP66), no `.ps1` como requisito.
- Si el archivo `.asc` coincide, se habrá identificado una clave pública según manifiesto, NO la disponibilidad/desbloqueo de clave privada ni la coincidencia independiente con OpenPGP PKESK del ciphertext.
- Si el `.asc` no coincide o GPG no puede leerlo: detenerse y examinar tipos/formato de archivo sin imprimir contenido secreto ni cambiar extensiones.
- No repetir GPG/TOC real CP71 hasta disponer de prueba de la clave secreta real y consentimiento separado. CP67 SHA ciphertext/manifiesto PASS pero backup PARTIAL, no restaurabilidad; CP72 GPG descifrado STOP, CP74 keyring Windows consultado NONE_LISTED.
- Esta operación sólo cambia docs en GitHub `main` con `[skip render]`. No cambio de app/SSL/DB ni acceso al backup original por asistente.