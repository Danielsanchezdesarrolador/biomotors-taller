# ByteTorque — BT-BACKUP-GHA-02

Preparado desde `main`, base `477ef6e1eb54cf9a7783631c8f8eaf45e195f490`.
Estado actualizado por BT-BACKUP-GHA-03: **adaptación de código; no se ejecutaron exportaciones/restauraciones ni se modificaron secretos en esta tarea**.
Todo futuro commit de esta entrega debe incluir **`[skip render]`**.

## Alcance y componentes reutilizados

`.github/workflows/bt-encrypted-backup.yml` es exclusivamente `workflow_dispatch`,
en `ubuntu-latest`, con `contents: read`, concurrencia sin cancelación y 20 minutos
máximos. Exige repositorio privado, repositorio exacto, ref `main` y confirmación
explícita de exportación real. Usa los clientes oficiales PostgreSQL 17 en
`postgres:17-bookworm`; no inicia un servicio PostgreSQL. Antes de ejecutar,
confirmar versión/extensiones del servidor; no bajar la validación TLS para
resolver incompatibilidades. El tag de imagen y paquetes apt reciben actualizaciones;
no se afirma reproducibilidad binaria de las dependencias.

`github_actions_export.py` es una capa de preparación y control de logs. Construye
el servicio libpq con host fijo `aws-0-sa-east-1.pooler.supabase.com`, puerto 5432,
base `postgres`, usuario `postgres.suxcqqnmcjoezfxltoms`, `sslmode=verify-full` y
CA explícita; luego llama a **`run_with_bindings.py export` → `cloud_backup.py`**.
BT-BACKUP-GHA-03 adapta únicamente el destino Drive compartido. El cifrado, TLS, puente de bindings y restaurador aislado conservan sus controles.
**`run_with_bindings.py verify` → `verify_cloud_restore.py`** se reutiliza después,
exclusivamente fuera de GitHub y del runner de exportación.

El exportador existente verifica TLS autenticado con una consulta de estado SSL,
usa sesiones read-only, transmite `pg_dump` y roles sin contraseñas de roles por
pipe a GPG y verifica identidad/permisos privados. Las nuevas transferencias se
vinculan por ID mediante la API de Drive, sin sobrescribir objetos existentes.
Descarga cada archivo para comparar SHA-256. Ningún dump en claro se escribe
en disco. Las credenciales se materializan temporalmente fuera del checkout en
archivos 0600/directorios 0700 y se eliminan al finalizar; el runner es efímero.
Los posibles stderr de herramientas quedan privados y se descartan, nunca se
publican ni se suben como evidencia. Solo se imprime un recibo con campos permitidos;
las excepciones y respuestas de proveedor no aparecen en logs. No habilitar debug,
`set -x`, cachés o subidas de logs/artefactos en la ejecución con credenciales.

## Cinco secretos exactos, no modificados por GHA-03

El Environment previsto es **`bytetorque-backup-export`**, en Settings →
Environments, restringido a la rama `main`; agregar aprobación requerida si el plan
privado de GitHub la admite. Guardar allí estos cinco Environment Secrets, sin
copias a repository/organization secrets, frontend, archivos versionados ni chat:

| Nombre | Contenido / validación requerida |
|---|---|
| `BT_BACKUP_PGPASS_CONTENT` | Una sola entrada libpq del host fijo, puerto 5432, base `postgres` y usuario `postgres.suxcqqnmcjoezfxltoms`, con su contraseña existente. No URI, comodines, clave publicable ni `service_role`. Escapar `:` y `\` en la contraseña según pgpass. No cambiar la contraseña ni crear roles. |
| `BT_BACKUP_DRIVE_CONFIG_CONTENT` | Configuración rclone OAuth, una única sección `[bytetorque_backup]`, `type=drive`, **sin `root_folder_id`** (o vacío), `scope=drive.file`. No se admite `drive` ni se amplía el alcance OAuth. `token` es el JSON OAuth existente con `access_token` y `refresh_token`; incluir `client_id`/`client_secret` si se usó cliente propio. No service account, rutas de archivos externos, endpoints personalizados ni otras secciones. |
| `BT_BACKUP_RECIPIENT_CONTENT` | Clave **pública** OpenPGP ASCII-armored del custodio; una sola clave primaria con capacidad de cifrado vigente, sin material privado. |
| `BT_BACKUP_RECIPIENT_FINGERPRINT` | Huella completa de esa clave primaria (40 o 64 hex), comprobada por el custodio desde su gestor seguro; no key ID corto. No es confidencial, se guarda como Secret para mantener una única interfaz de configuración. |
| `BT_BACKUP_PG_CA_PEM` | Cadena de CA PEM oficial/de confianza correspondiente al certificado presentado por el Session pooler. Sin clave privada. Confirmar que valida ese hostname concreto: una CA para conexión directa no se presume válida para el pooler. Si falla, detenerse; nunca `require`, `disable`, `-k` ni `verify-ca` como sustitutos de `verify-full`. |

`BT_BACKUP_PGSERVICE_CONTENT` se genera en memoria; **no es un secreto adicional**.
No se necesita token API Supabase ni clave administrativa del API. La clave privada
GPG, passphrase y copia de recuperación permanecen **fuera de GitHub y del runner
de exportación**. La ruta y el ID fijan el destino de este flujo; no se configura
`root_folder_id`. No modificar ni ampliar el consentimiento OAuth para sortear errores. Usar identidad Drive dedicada/aislada cuando
corresponda y revisar permisos individuales/heredados de la carpeta.

## Destino y recibos

Único destino permitido: **`bytetorque_backup:Respaldos ByteTorque`**, ID
**`1JRAJr08EP9Ql04a7VniBcS4f4rZkNVEd`**, aportado por el propietario mediante
`rclone lsjson --dirs-only bytetorque_backup:`. Sustituye el ID antiguo.
El código verifica listado único, resolución de esa ruta, nombre/tipo/propiedad,
permisos individuales privados completos y relación padre-hijo. Grupos, acceso
público o de dominio, metadata ausente y errores 403/404 detienen el flujo.
Consultar el [checkpoint GHA-03](checkpoints/CHECKPOINT_BT_BACKUP_GHA_03_20261116.md).
Solo una futura ejecución autorizada crea un directorio único `bytetorque-FECHA-UUID` con:

- `database.dump.gpg`: base PostgreSQL completa, incluidos datos Auth y metadatos Storage.
- `roles.sql.gpg`: roles sin sus contraseñas.
- `manifest.json`: comprobante con nombres, tamaños y SHA-256 del ciphertext,
  proyecto, ID y exclusiones; no contiene filas ni credenciales.
- Después de la restauración externa autorizada: `restore-receipt.json`, con
  resultado de integridad, RLS/FK/grants y conteos agregados, sin registros personales.

No se suben archivos de configuración, claves, logs, dumps sin cifrar ni artefactos
de GitHub. Los manifiestos y recibos son comprobantes sin cifrar, permitidos por
el alcance solicitado. No son una copia del contenido de los clientes.
Un fallo puede dejar ciphertext parcial en Drive: sin recibo satisfactorio no debe
considerarse respaldo completo ni borrarse evidencia automáticamente.

## Secuencia mínima, después de autorizaciones separadas

1. Mantener la publicación de código aprobada únicamente en `main` con
   mensaje **`[skip render]`**. Publicar código no autoriza ejecutar respaldos. Los cambios disparan
   `ci.yml`; el nuevo script bajo `scripts/**` también coincide con
   `bt-oficial-01.yml`. Ninguno ejecuta el respaldo, cuyo único evento es manual.
   El marcador de Render no omite GitHub Actions. No alterar CI ni despliegues aquí.
2. Autorizar configuración del Environment y sus cinco secretos mediante la UI
   segura. Confirmar versión PostgreSQL compatible, campos oficiales Connect,
   vigencia/huella GPG y recuperación de su clave privada fuera de GitHub.
   Revisar carpeta restringida y el alcance OAuth real; el código también rechaza
   permisos públicos, de dominio o grupo, y falla si no puede verificarlos antes de subir. No cambiar Supabase/Auth/RLS.
3. Autorizar la **exportación real**, seleccionar el workflow en Actions, rama
   `main`, marcar `confirm_database_export=true` y ejecutar manualmente una vez.
   Un recibo exitoso debe tener `encrypted_external_readback_verified=true`,
   **`restoration_verified=false` y `full_project_backup=false`**. Guardar el ID
   y revisar en Drive el manifiesto y los dos ciphertext; los logs GHA por sí solos
   no prueban recuperación. No reintentar automáticamente ante fallos.
4. Autorizar ensayo de recuperación real en **otro entorno controlado fuera de
   GitHub**, con Docker aislado, imagen PostgreSQL/Supabase compatible con versión
   y extensiones, herramientas existentes y acceso privado a Drive. Montar keyring
   del custodio mediante `BT_RESTORE_GNUPGHOME` fuera del checkout (0700), y si
   corresponde `BT_RESTORE_GPG_PASSPHRASE_FILE` (0600). Proveer únicamente allí
   `BT_BACKUP_DRIVE_CONFIG_CONTENT` mediante almacenamiento seguro. Ejecutar:

   ```sh
   python3 -B scripts/backup/run_with_bindings.py verify \
     --drive-remote bytetorque_backup \
     --drive-folder-id 1JRAJr08EP9Ql04a7VniBcS4f4rZkNVEd \
     --backup-id ID_DEL_RECIBO \
     --image IMAGEN_COMPATIBLE_APROBADA
   ```

   Los identificadores anteriores son marcadores públicos, nunca credenciales.
   El verificador descarga desde Drive, verifica SHA-256, descifra por pipe,
   restaura en un contenedor nuevo `--network none`, sin puertos y con PostgreSQL
   en tmpfs, comprueba RLS/FK/grants/conteos y destruye el contenedor. Sube y relee
   `restore-receipt.json`. Revisar que `isolated_restore_verified=true` y
   `encrypted_external_source_verified=true`; ante fallo no declarar recuperación.
   El propio recibo conserva `full_project_backup=false`. El verificador admite
   `postgres:17[.N]` o `supabase/postgres:VERSION_NUMERICA`; comprobar disponibilidad
   y compatibilidad, no inventar tags. PostgreSQL estándar no prueba todas las
   extensiones/roles administrados del proyecto real. No restaurar sobre Supabase.
5. Antes de declarar suficiencia, completar inventario real y recuperación de:
   objetos Storage (bytes, buckets, cantidades, políticas y hashes, o evidencia
   de cero objetos); configuración Auth/proveedores/URLs/plantillas y credenciales
   recuperables (los usuarios Auth sí están en el dump); Edge desplegadas,
   código/versiones/configuración; secretos/certificados y dependencias externas
   desde su fuente segura. No presumir exportables valores de secretos existentes.
   La cobertura faltante requiere mecanismos y permisos separados; este workflow
   no la implementa. Conservar inventario/evidencia sin PII y restauración externa,
   y obtener aprobación de suficiencia/rollback del Director. **No activa CP05/CP06**.

## Validación de esta preparación

Validar YAML, sintaxis de Python/shell y guardas; ejecutar solo pruebas offline
de configuración/rechazo y sanitización. No ejecutar los scripts de exportación,
restauración ni el ensayo sintético. No consultar datos alojados ni Drive, configurar
secretos o repetir pruebas de la aplicación. La conectividad TCP exitosa informada
por el Director no equivale a autenticación/TLS, exportación o restauración comprobadas.

Resultado histórico de GHA-02, antes de esta adaptación: **actionlint v1.7.7 PASS**, YAML y guardas PASS,
compilación sintáctica Python PASS y `sh -n` PASS. **12 pruebas offline de seguridad
PASS**, sin red, credenciales reales, cifrado de datos, dump ni restauración. Se
comprobó byte a byte que los componentes existentes de respaldo/restauración no
cambiaron. No se ejecutó ningún workflow ni la suite de la aplicación.


## Comprobaciones pendientes de GHA-03

Las pruebas offline no acreditan los permisos reales actuales ni un respaldo
recuperable. No ejecutar el workflow hasta una autorización separada. El preflight
real deberá poder leer el ID aprobado y todas sus páginas de permisos con el
OAuth `drive.file` actual. Si la API no permite leerlos, mantener bloqueado, sin
usar el ID anterior, configurar `root_folder_id`, ampliar OAuth ni ignorar errores.
Las transferencias por ID utilizan carga reanudable en bloques de 8 MiB sin retry
automático ni sobrescritura; descargan ciphertext para SHA-256. Una respuesta
ambigua deja el intento sin éxito; pueden quedar objetos parciales, sin borrado
automático. La restauración exige `drive_folder_id` en el manifiesto y valida el
contenedor de archivos antes de descifrar. Los respaldos antiguos sin esta identidad
no se aceptan automáticamente. El recibo y manifiesto mantienen cobertura parcial.
