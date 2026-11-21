# CHECKPOINT 78 — BT-SEC07-R3-PRIVATE-FILE-ARMORED-MESSAGE-NOT-KEY

**Fecha:** 21/11/2026 Chile · **rama exclusiva:** `main` · **HEAD previo:** `bed3f02598afa2ef9ff7461d6b0b514e12cc424e`.

## Nueva salida de Windows reportada por el propietario

```text
BT_SEC07_PRIVATE_META_MODE: HEADER_ONLY_READONLY
BT_SEC07_PRIVATE_META_FILE: SELECTED
BT_SEC07_PRIVATE_META_EXTENSION: OTHER_OR_HIDDEN_EXTENSION
BT_SEC07_PRIVATE_META_HEADER: ASCII_ENCRYPTED_MESSAGE
BT_SEC07_PRIVATE_META_GPG: NOT_CALLED
BT_SEC07_PRIVATE_META_IMPORT: NOT_ATTEMPTED
BT_SEC07_PRIVATE_META_DECRYPTION: NOT_ATTEMPTED
BT_SEC07_PRIVATE_META_RESULT: COMPLETE
```

## Conclusión delimitada
- El archivo seleccionado por usuario como presunta clave privada **NO tiene como extensión final literal** `.pgp`, `.asc` ni `.gpg` según `[IO.Path]::GetExtension`; el valor exacto no se mostró. Puede existir extensión adicional/oculta o haberse escogido archivo diferente. No inferir extensión específica.
- Sus primeros bytes se reconocieron como encabezado ASCII armor `-----BEGIN PGP MESSAGE-----` (`ASCII_ENCRYPTED_MESSAGE`) y **NO** como encabezado de exportación usual `-----BEGIN PGP PRIVATE KEY BLOCK-----`. Esto explica por qué el anterior `gpg --show-keys` no pudo tratarlo como clave OpenPGP exportada: aparentemente se eligió **un mensaje cifrado**, no una clave privada directamente importable. La clasificación por encabezado no certifica el contenido del contenedor ni descarta que su interior, tras descifrado autorizado, pueda albergar una clave. No descifrar por inferencia.
- El PowerShell solo leyó **160 bytes**, no llamó GPG, no importó, no descifró ni modificó deliberadamente archivos.
- Resultado de CP76/77 prevalece: archivo de clave pública `.asc` identificado con `PUBCHECK_MATCH: PRIMARY_MATCH` respecto a huella declarada en manifest. **Esto tampoco demuestra** disponibilidad de la correspondiente clave privada.
- CP74 mostró `SECRET_KEYS: NONE_LISTED` en almacén GPG consultado; CP72 inspección GPG real `STOP_GPG_DECRYPTION_FAILED`; CP67 verificador V4 confirmó coincidencia manifiesto/hash de ciphertext del backup **parcial**, restauración no certificada. No atribuir falla a Docker.

## Próximo paso recomendado, sin ejecutar
- Buscar el archivo que realmente contenga un **bloque de clave privada OpenPGP exportada** (`BEGIN PGP PRIVATE KEY BLOCK` o paquetes de clave secreta binarios) o ubicar el gestor (Kleopatra/GPG) donde esté el secreto. **No cambiar nombre/extensión, abrir/contenido en chat, importar claves, descifrar mensajes ni usar contraseñas**.
- Es posible que el archivo observado sea un **contenedor de clave privada cifrado con otra clave** o un simple mensaje cifrado; determinarlo requeriría un procedimiento nuevo cuidadosamente autorizado, no forma parte de la clasificación actual.
- Si se autoriza un futuro chequeo local de formatos/inventario de archivos, entregar PowerShell íntegro en el chat (regla CP66), sin imprimir rutas ni nombres ni contenidos ni buscar indiscriminadamente archivos privados. Detenerse ante STOP.
- No repetir inspección GPG→TOC real hasta identificar y validar material secreto correspondiente de modo controlado.

## Control del cambio
Solo esta evidencia y continuidad documentadas en `main` con `[skip render]`; no cambios de aplicación, producción, backup, PostgreSQL, GPG, SSL ni claves.
