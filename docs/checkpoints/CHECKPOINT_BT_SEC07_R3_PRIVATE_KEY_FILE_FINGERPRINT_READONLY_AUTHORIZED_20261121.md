# CHECKPOINT 75 — BT-SEC07-R3-PRIVATE-KEY-FILE-FINGERPRINT-READONLY-AUTHORIZED

**Fecha:** 21/11/2026 Chile · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **única rama:** `main` · **HEAD previo:** `c46ce3f6f02c5548e812ec0b54d7ff2a3cdc49f3`.

## Consentimiento
Usuario confirmó que tiene localizada su clave privada original y respondió «autorizo» a una **comparación local únicamente de huella** entre el archivo de clave original y el campo `recipient_fingerprint` de `manifest.json`. No autoriza importar claves privadas, descifrar el backup, cambiar archivos, exportar claves, ejecutar SQL/restore/SSL, ni conectar servicios. El ejecutor de PowerShell fue entregado COMPLETO en el chat, sin necesidad de descargar `.ps1` (regla CP66).

## Procedimiento local entregado (pendiente ejecución por dueño)
- Selector Windows manual de `manifest.json` del backup parcial 19/11; parsea en RAM, comprueba `project_ref` y declaración de `database.dump.gpg`, exige `recipient_fingerprint` de 40 o 64 hex sin mostrarlo.
- Segundo selector manual del **archivo de clave privada original**, nombre/extensión opcional `.asc`, `.gpg`, `.pgp`, `.key` o cualquier otra. Rechaza carpeta, enlace/reparse point y tamaños fuera de 40B–10MB.
- GnuPG existente se invoca con `--no-options --homedir <TEMP_UNICO> --no-autostart --batch --no-tty --with-colons --fingerprint --with-subkey-fingerprint --show-keys -- <archivo>`, **SIN `--import` ni `--decrypt`**. `--show-keys` es comando de GnuPG para mostrar claves contenidas en archivo sin incorporar en un almacén. La salida bruta de GPG/identificadores/UID se almacena solo en memoria local de PowerShell, nunca se imprime ni sube; stderr se suprime; solo marcadores `BT_SEC07_KEYCHECK_*` sanitizados.
- Analiza `sec/ssb/pub/sub/fpr` para distinguir registros de claves secretas versus públicas y comparar huella principal o subclave. Salidas `PRIMARY_FINGERPRINT_MATCH`, `SUBKEY_FINGERPRINT_MATCH`, `NO_FINGERPRINT_MATCH`, `SECRET_KEY_RECORDS_PRESENT` o `NO_SECRET_KEY_RECORDS`, siempre `IMPORT: NOT_ATTEMPTED`, `DECRYPTION: NOT_ATTEMPTED`.
- Utiliza GNUPGHOME aislado en TEMP, posible creación de cachés/locks temporales por el programa, elimina directorio al finalizar. El archivo original se lee, no se modifica intencionalmente. No puede prometer cero rastros del SO; ruta de clave puede ser visible transitoriamente en lista de procesos local.
- Se confirmó offline en entorno del asistente, **sólo con clave ficticia** y GnuPG 2.4.7, que `--show-keys --with-colons --fingerprint --with-subkey-fingerprint` da `sec`, `ssb` y respectivos `fpr` en un export privado, sin importar material al GNUPGHOME aislado. **El PowerShell entregado no ha sido ejecutado ni certificado en el Windows del titular**; no afirmar PASS prematuro.

## Interpretación prudente
Una huella coincidente demuestra que el bloque de clave leído anuncia el fingerprint del destinatario declarado; **no** prueba que el archivo contenga material privado completo, que se desbloquee, ni que PKESK del backup real corresponda a esa clave (manifest no tiene autenticidad independiente). Una huella de subclave puede diferir de la huella de clave principal. Si falla o no coincide, **no importar ni intentar de nuevo decrypt** hasta diagnóstico. El CP74 constató cero claves secretas listadas en el GNUPGHOME normal de Windows, no pérdida global; este procedimiento verifica un archivo externo sin alterar dicho GNUPGHOME.

## Próximo paso
El propietario ejecuta PowerShell inline una vez, selecciona manifest y archivo privado local, devuelve **sólo marcadores `BT_SEC07_KEYCHECK_*`**. Tras analizar resultado, necesitará consentimiento nuevo para **importación segura en GNUPGHOME aislado** y otra operación de descifrado real, sin conexión DB ni restore, si procede. No almacenar secreto en GitHub/chat, ni publicar rutas/contraseñas; impedir exportaciones de plaintext.

Solo docs en `main` con `[skip render]`, sin deploy ni cambios en producción.