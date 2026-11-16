# ByteTorque — BT-BACKUP-GHA-03 · Ruta Drive e identidad fijada

Fecha: 16/11/2026. Base `main`: `254a473968d6197d8218d790ed1d038f367af5f8`.
Publicación de código autorizada exclusivamente en `main` con **`[skip render]`**.
No se autoriza ni ejecuta respaldo, restauración, acceso a datos o cambio de secretos.

## Identidad aprobada y auditoría

El propietario aportó el ID **`1JRAJr08EP9Ql04a7VniBcS4f4rZkNVEd`**, obtenido con
`rclone lsjson --dirs-only bytetorque_backup:`. Confirmó creación mediante rclone y
una prueba propia de escritura/lectura/eliminación. Ruta funcional:
**`bytetorque_backup:Respaldos ByteTorque`**, OAuth **`drive.file`**, sin
`root_folder_id`. El ID previo queda fuera del destino aceptado por el código.
Estas son evidencias del propietario; el agente no repitió operaciones reales.

La auditoría identificó que quitar solo `root_folder_id` habría enviado exportación
y restauración a la raíz del remoto. También se revisaron el puente de secretos,
el restaurador aislado y las comprobaciones de manifiesto/recibo.

## Implementación

- `drive_destination.py` concentra la configuración y validación de destino. Acepta
  exclusivamente el remoto aprobado, `drive.file` y `root_folder_id` ausente/vacío;
  rechaza otras secciones, endpoints personalizados y variantes de alcance.
- Resuelve el listado de carpetas raíz con rclone y exige una sola coincidencia de
  nombre/ruta, tipo directorio e ID exacto. Resuelve además la ruta funcional con
  `lsjson --stat` y vuelve a cotejar el ID. No crea rutas faltantes ni usa el modo
  `root_folder_id`. Elimina overrides `RCLONE_*` del subproceso; el token refrescado
  solo permanece en el binding temporal protegido.
- Antes de aceptar el destino, consulta la API oficial por ID y comprueba nombre,
  tipo carpeta (no shortcut), no papelera y propiedad del usuario OAuth. Enumera
  todas las páginas de permisos; exige propietario y permisos de personas
  individuales, sin `anyone`, `domain`, grupos ni tipos desconocidos. La presencia
  de grupos queda deliberadamente bloqueada: su membresía no está verificada.
- Las transferencias posteriores usan IDs validados y padres explícitos, evitando
  volver a elegir un destino por nombre. Se comprueban identidad, permisos y
  relaciones padre-hijo antes y después de operaciones. Nombres duplicados,
  destinos alternativos, rutas arbitrarias o metadata incompleta fallan cerrados.
- La API Drive envía el ciphertext mediante carga reanudable de 8 MiB, sin guardar
  datos de base en claro. Solo acepta sesiones HTTPS del host y ruta oficiales,
  no sigue redirects con OAuth y exige acuses exactos de los bloques. No hay retry
  automático, actualización/sobrescritura ni eliminación de archivos. El intento
  no se confirma hasta descargar y cotejar SHA-256 de cada objeto.
- Exportación y restauración usan la misma validación. El manifiesto incorpora
  `drive_folder_id`; la restauración rechaza identidad distinta o ausente antes de
  invocar el restaurador existente. Recibo de restauración ligado al mismo ID.
- Se conservan `sslmode=verify-full`, CA y hostname; sesiones de exportación
  read-only; cifrado por pipe GPG y custodia externa de la clave privada; permisos
  temporales 0600/0700; errores sin tokens/respuestas de proveedor en logs.
- No cambian el workflow exclusivamente manual, los cinco nombres de secretos,
  los flags CP05/CP06, Supabase, SQL/RLS/Auth, Google OAuth ni las páginas legales.

## Validación y límites

Se ejecutan únicamente las suites offline `test_github_actions_export.py` y
`test_drive_destination.py`, con OAuth no funcional en memoria y HTTP/rclone/
restauración simulados. La suite sintética de PostgreSQL NO se ejecuta. También se
comprueba sintaxis Python/YAML y que el workflow siga siendo manual.

Casos: configuración sin raíz; ID solicitado y resuelto incorrectos; duplicados;
shortcut; papelera; propiedad ausente; permisos públicos/de dominio/grupo;
permisos en segunda página e incompletos; padre alterado; restauración sin carpeta;
sesión HTTP a host no autorizado; envío por bloques y sus acuses; sobrescritura
rechazada; lectura por ID; SHA-256 alterado; manifiesto de otra carpeta; rechazo de
claves privadas, falta de secretos, sanitización de errores y del recibo.

**Pendiente, sin afirmar PASS real:** acceso API a metadata/permisos con el OAuth
actual, comportamiento de carga/lectura reales, TLS PostgreSQL autenticado,
exportación cifrada externa, recuperación de clave y restauración real aislada,
compatibilidad de versión/extensiones e inventario completo Storage/Auth/Edge.
Si 403/404 o un campo faltante impiden probar identidad/privacidad, el código
bloquea el intento. No se amplía scope, no se activa root_folder_id ni se acepta un
destino alternativo. Si los permisos cambian o hay un acuse ambiguo, no se emite
éxito; podrían quedar ciphertext/objetos parciales para revisión manual autorizada.

Este checkpoint no prueba un respaldo suficiente ni una restauración. Se conserva
`restoration_verified=false` y `full_project_backup=false` tras una mera exportación.
La restauración se mantiene fuera del runner GitHub y no restaura sobre Supabase.

Resultado final local: **35/35 pruebas offline PASS** (23 de destino Drive y 12
de bindings/sanitización); sintaxis de todos los Python PASS; actionlint v1.7.7
PASS; workflow manual/permisos y helpers de cifrado/bindings/restauración aislada
comprobados sin alterar sus controles. No se ejecutó la suite general de la app.
No se ejecutaron workflows manuales ni comandos reales de Drive/PostgreSQL/Docker.
