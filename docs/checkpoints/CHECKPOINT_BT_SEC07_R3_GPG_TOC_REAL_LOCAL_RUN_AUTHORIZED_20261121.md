# CHECKPOINT 71 — BT-SEC07-R3-GPG-TOC-REAL-LOCAL-RUN-AUTHORIZED

**Fecha:** 21/11/2026 (Chile) · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama:** `main` · **HEAD previo:** `a2a25f0303b704dcbcfda791629e24ebf581e925`.

## Permiso explícito
Tras CP70, el titular contestó **«AUTORIZO»** a la autorización específica de una inspección local **una sola vez** del respaldo cifrado del 19/11, mediante GPG y `pg_restore --list`, con acceso local a keyring/agent histórico. **No autoriza** restaurar, exportar nuevos backups, cambiar datos ni roles/ACL, conectar a Supabase, alterar SSL/Render ni subir contenido a chats. La ejecución la efectuará voluntariamente en PowerShell de su PC, no el asistente.

## Paquete utilizado y verificación
ZIP privado `BT_SEC07_R3_GPG_TOC_READER_PREP_V1_20261121.zip`, **11554 bytes**, SHA256 `dd6e5b7851039eefbc5d01c3245899fa9f13e689f402b645829984bebbc24a58`. Releído y SHA recalculado en contenedor de esta conversación, ZIP listado y `testzip` correcto, runner después de extraer: **37/37 pruebas sintéticas PASS**. Las mismas pruebas en Windows propietario ya pasaron según CP70. Se inspeccionaron fuentes `bt_sec07_manifest_readonly.py` y `bt_sec07_real_gpg_toc_inspector.py`, README. Ni el asistente ni su herramienta abrieron el backup real ni keyring.

## Bloque PowerShell INLINE entregado al usuario
En cumplimiento CP66, se entregó **todo el ejecutor PowerShell en el chat**, no `.ps1` obligatorio. Descarga el ZIP a Descargas, valida SHA256 exacta, expande a TEMP con nombre aleatorio, entra en TEMP, ejecuta vía Python `bt_sec07_real_gpg_toc_inspector.py` **sin argumentos**, imprime resultado categórico y limpia el subdirectorio temporal en `finally` sin tocar el backup. No se reiteran las pruebas sintéticas que ya pasaron en Windows. La invocación espera elección manual de `manifest.json` del respaldo del 19/11 en UI o prompt fallback.

## Comportamiento exacto e interpretaciones
- Previa a GPG, el inspector V4 coteja proyecto, backup_id, lista, tamaño y SHA de ciphertext con el manifiesto **PARTIAL_BACKUP_DECLARED**; no cambia el manifest.
- Busca GnuPG >=2.2 y `pg_restore` versión mayor **17**; si faltan o no cumplen devuelve STOP; la comprobación de versión puede ejecutarse sin acceso a claves.
- Canaliza GPG `--batch --no-tty --status-fd 2 --output - --decrypt` desde el descriptor leído de `database.dump.gpg` hacia `pg_restore --list -` sin archivo plaintext escrito intencionalmente. `pg_restore --list` funciona con stdin sin `-j` según documentación PostgreSQL 17, y sin `--dbname`/SQL ejecución. No conecta a servidores.
- Se comprueban códigos de salida, estados `DECRYPTION_OKAY` y `END_DECRYPTION`, `GOODMDC` o `GOODAEAD`, contadores y límites, y no se imprimen TOC ni stderr/rutas/SQL. GPG agent/Pinentry puede desbloquear claves y crear caché, y Windows puede almacenar transitorios; no prometer cero rastros absolutos. En modo batch podría detenerse si se requiere una frase de paso no disponible; no pedir ingresarla ni mostrarla en consola/chat.
- Un resultado `PASS_TOC_ONLY_NOT_RESTORE` significa que se pudo descifrar y listar el TOC local **solamente**; no prueba recuperación, datos, owners/ACL, RLS, roles SQL, Auth/Storage ni una copia completa. Nunca calificar como certificado integral.

## Estado
**No se recibió todavía salida real de este nuevo comando en Windows**; pendiente que usuario pegue solo marcadores `BT_SEC07_*` y detenga operación ante STOP sin repetir. Los tres hitos siguen: (1) GPG/TOC real, (2) restauración aislada y cobertura, (3) nuevos backups verificables y automatización. SSL enforcement independiente pendiente; no GPG/SQL ni DB ni producción modificados por asistente.

Este checkpoint actualiza solo documentación GitHub `main` `[skip render]`.