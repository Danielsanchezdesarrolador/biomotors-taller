# CHECKPOINT 77 — BT-SEC07-R3-PUBLIC-ASC-PRIMARY-MATCH-PRIVATE-PGP-HEADER-PENDING

**Fecha:** 21/11/2026 Chile · **Rama exclusiva:** `main` · **HEAD previo:** `51043b57d5197c9e2cf67a35bb26ab4867d808e3`.

## Resultado nuevo del propietario
```text
BT_SEC07_PUBCHECK_MODE: PUBLIC_KEY_ONLY
BT_SEC07_PUBCHECK_MANIFEST: RECOGNIZED
BT_SEC07_PUBCHECK_FILE: PUBLIC_KEY_RECOGNIZED
BT_SEC07_PUBCHECK_MATCH: PRIMARY_MATCH
BT_SEC07_PUBCHECK_PRIVATE_PGP: NOT_ACCESSED
BT_SEC07_PUBCHECK_IMPORT: NOT_ATTEMPTED
BT_SEC07_PUBCHECK_DECRYPTION: NOT_ATTEMPTED
BT_SEC07_PUBCHECK_RESULT: COMPLETE
```

Propietario aclaró que para encontrar el supuesto archivo de clave privada tuvo que elegir **«Todos los archivos»** en selector previo; la clave se identifica como `.pgp`, mientras que el archivo público `.asc` pasó cotejo. El filtro previo CP75 incluía explícitamente `*.asc;*.gpg;*.pgp;*.key`, por tanto si la extensión final real del archivo es `.pgp` se debería haber mostrado: posible extensión extra/oculta, confusión de tipo Explorer u otro archivo/ubicación. **No inferir causa ni cambiar nombres/extensiones.**

## Resultado positivo con límite
El archivo público `.asc` se reconoce como llave pública OpenPGP, y su huella principal coincide exactamente con `recipient_fingerprint` del `manifest.json` según el programa CP76. Esto corrobora una **identidad declarada pública**, no una autenticidad independiente del manifiesto/ciphertext. No prueba que el `.pgp` sea secreto OpenPGP, que su clave privada sea desbloqueable, ni que el ciphertext use esa clave en PKESK. CP74 GPG keyring default no lista claves privadas, CP75 archivo supuesto privado `STOP_KEY_FORMAT_OR_READ`, CP72 GPG decrypt real STOP.

## Nuevo procedimiento bajo permiso de diagnóstico de formato (sin importación)
Se entregó íntegro en el chat un bloque PowerShell para examinar **solo los primeros 160 bytes** del archivo señalado como privado, seleccionándolo con filtro `Todos los archivos (*.*)|*.*`. No se solicita manifest, porque ya pasó comparación pública, ni se llama GPG. Se determina únicamente la **extensión efectiva** (`PGP`, `ASC`, `GPG` u `OTHER_OR_HIDDEN_EXTENSION`) y el **tipo de encabezado** en términos genéricos, sin imprimir byte alguno, ruta, nombre, huella ni contenido de clave.
Si el comienzo contiene armor `-----BEGIN PGP PRIVATE KEY BLOCK-----`, marca `ASCII_PRIVATE_KEY_ARMOR`; si encabezado `PUBLIC KEY` o `MESSAGE`, marca el tipo. Si primer octeto tiene bit 7 PGP, interpreta tag antiguo/nuevo y emite candidatos de paquete `SECRET_KEY` tag5, `SECRET_SUBKEY` tag7, `PUBLIC_KEY` tag6, `PUBLIC_SUBKEY` tag14, `ENCRYPTED_MESSAGE` tags1/3/9/18/20, u `OTHER_OPENPGP_PACKET_CANDIDATE`; si no, `UNRECOGNIZED_OR_OTHER_CONTAINER`. Detecta UTF16 BOM como formato textual no estándar. **Es heurística de encabezado, no parser criptográfico ni prueba de validez de clave.**
El bloque abre el archivo de forma FileAccess.Read / FileShare.Read, rechaza enlaces y carpetas, límites 16B–10MB, captura excepciones sin mostrar mensajes privados, dispone stream/diálogo, no crea archivos, no importa, descifra, llama GPG, SQL, Docker ni Supabase. Toda salida se limita a `BT_SEC07_PRIVATE_META_*`.

## Próxima puerta
Esperar al propietario enviar resultado `BT_SEC07_PRIVATE_META_*`. Según el encabezado evaluar lectura más específica (por ejemplo GPG packet listing sanitizado) **con autorización separada para nuevas inspecciones**, sin publicar secretos. No repetir CP71 y no importar clave por fuerza. Hitos posteriores GPG/TOC real, restauración aislada, cobertura roles/ACL/owners/RLS y nuevos respaldos aún sin certificar.

Regla permanente CP66: ejecutores PowerShell siempre completos **directamente en el chat**. Este checkpoint solo documentación en `main`, `[skip render]`, sin despliegue ni cambio de respaldo.