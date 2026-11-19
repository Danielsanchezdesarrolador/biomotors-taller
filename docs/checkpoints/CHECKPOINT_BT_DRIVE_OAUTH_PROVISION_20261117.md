# ByteTorque — solución de autorización drive.file preparada

17/11/2026. Base main: 89f5b22f645cf7c6e3f3c8b88800eeab4a17641d.
**Estado: código preparado y probado offline; creación real NO autorizada ni ejecutada. Destino actual intacto.**

## Evidencia e interpretación

Se leyó el run [44092168517](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44092168517): checkout 89f5b22, DRIVE_OWNER_MATCHED y DRIVE_FOLDER_INACCESSIBLE. No se repitió la prueba ni se consultó PostgreSQL.

La identidad OAuth coincide. El flujo directo recibe HTTP 404, compatible con falta de visibilidad por archivo bajo drive.file. La carpeta existe según la evidencia previa del propietario/conector. No se puede concluir que cambiar contraseña, usuario o scope general sea necesario. El clasificador existente usa la misma etiqueta 404 para metadata del ID y de root; el log no identifica cuál de esas lecturas originó el 404. No presentar esta limitación como prueba adicional que no existe. La alternativa preparada comprueba root ANTES de cualquier mkdir y no escribe si falla.

## Opción 1 — conservar la carpeta existente

Google Picker permite al usuario seleccionar archivos/carpetas para la aplicación bajo drive.file. Requiere Picker configurado con token OAuth, API key y appId (número de proyecto Cloud) coherentes; client ID y app ID deben corresponder al mismo proyecto. No basta abrir la carpeta en el navegador, escribir su ID, cambiar root_folder_id, compartirla con otro usuario ni usar Picker de una app diferente.

Es técnicamente viable SI el propietario controla el proyecto OAuth utilizado por rclone y puede habilitar/configurar Picker para él. No se dispone de evidencia de ese control, de API key de Picker ni de una integración para ese proyecto; GitHub no permite leer secretos y no se intenta extraerlos. Si se usa el cliente compartido de rclone, no podemos configurar arbitrariamente su proyecto. No se afirma que esta opción sea universalmente imposible. Bajo las restricciones actuales, no hay una vía ya configurada que permita implementarla sin intervención/configuración adicional. No se añadieron credenciales, no se amplió scope ni se regeneró el OAuth.

## Opción 2 — alternativa mínima preparada, pendiente de autorización

Crear UNA carpeta nueva mediante `rclone mkdir` usando exactamente el config OAuth existente y drive.file. Nombre determinista: `Respaldos ByteTorque OAuth - <ID de ejecución>`, generado por el workflow (no seleccionado por coincidencia con nombres existentes).

Script `scripts/backup/provision_drive_folder.py` y workflow manual `bt-provision-drive-folder.yml`. La publicación NO lo ejecuta. Confirmación apagada por defecto; restringido a propietario/triggering actor, main y primera tentativa. No hay trigger push/schedule ni reintentos de aplicación; rclone usa retries=1 y low-level-retries=1. Contents:read impide al workflow cambiar main o activar el destino por sí mismo.

Secuencia controlada:

1. Validar autorización y configuración drive.file existente; archivo temporal 0600, fuera del checkout. Cargar únicamente los dos secretos Drive ya existentes.
2. Renovación normal del token con rclone; verificar cuenta esperada y root propia no eliminada. Ninguna escritura si falla.
3. Comprobar que el nombre exacto no existe en root. Si existe, detener: no adoptar homónimo ni reutilizarlo.
4. Ejecutar una sola orden mkdir. No subir SQL, backups ni archivos de prueba.
5. Obtener exactamente un ID para ese nombre nuevo y raíz; exigir ID válido, nombre exacto, MIME carpeta, ownedByMe, no papelera, parents=root. Exigir una única ACL user/owner, sin compartición, páginas adicionales ni accesos públicos. Comprobar carpeta vacía y volver a leer metadata para detectar movimiento.
6. Emitir recibo mínimo con candidate_id y candidate_name, verificación true, destination_activated=false, backup_exported=false y restoration_verified=false. Nunca imprimir tokens, correos ni errores crudos.

Si mkdir falla, expira o se interrumpe, el estado puede ser ambiguo: NO repetir ni borrar. El nombre generado se imprime antes de la operación para reconciliarlo en solo lectura. Una carpeta creada pero no verificada se conserva sin activación; no se cambian permisos para forzar el éxito. No hay rollback destructivo automático.

Se extrajeron las operaciones HTTPS de metadata existentes a `DriveAPI`; `PrivateDrive` conserva las mismas validaciones del destino aprobado. No se alteró FOLDER_ID ni FOLDER_NAME. La nueva carpeta requiere un nombre nuevo; cualquier activación futura debe fijar AMBOS, únicamente con autorización y recibo verificado.

## Pruebas

64 pruebas locales relevantes PASS: 12 creación controlada, 28 destino, 8 clasificación/identidad, 16 frontera de exportación. No usan credenciales, red real ni mkdir real. No se repitieron pruebas de conexión PostgreSQL.

Cobertura: todos los guards, intento de rerun, scope ampliado, cuenta incorrecta, root incorrecta, nombre preexistente, timeout/error ambiguo sin reintento, ubicación/shortcut, permisos compartidos, paginación incompleta, carpeta no vacía, recibo sin activación/exportación y ausencia de datos sensibles. `git diff --check` PASS. CI incorpora la nueva suite; el workflow manual ejecuta suites offline antes de secretos.

## Única autorización propuesta

«Autorizo crear una sola carpeta vacía mediante rclone con el OAuth drive.file actual; verificar cuenta, propiedad, raíz, privacidad e ID; y, únicamente si todas las verificaciones pasan, fijar ese ID y nombre como nuevo destino de ByteTorque. No autorizo exportar ni restaurar todavía.»

Tras esa autorización, una sola ejecución de **BT-DRIVE-PROVISION** en main con `confirm_create_empty_folder=true`. No ejecutar BT-DRIVE-DIAG otra vez como paso previo: la operación incluye sus controles necesarios. Leer el recibo; si es válido, actualizar destino y tests/documentación en main con [skip render], usando exactamente el ID y nombre recibidos. Si no pasa, no activar y resolver el fallo concreto sin repetir mkdir. La carpeta anterior permanece intacta. Exportación y recuperación aislada quedan sujetas a autorización posterior; clave GPG privada nunca entra al repo/Actions.

## Fuentes primarias consultadas

- https://developers.google.com/workspace/drive/picker/guides/web-picker
- https://developers.google.com/workspace/drive/picker/reference/picker.pickerbuilder.setappid
- https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- https://rclone.org/drive/#drivefile
- https://rclone.org/commands/rclone_mkdir/


## ACTUALIZACIÓN HISTÓRICA VERIFICADA EL 19/11/2026 — HUBO UNA EJECUCIÓN POSTERIOR

Este checkpoint se escribió **antes** de que el propietario disparara la provisión. Para evitar que futuros chats interpreten «creación no ejecutada» como estado vigente:

- [GitHub Actions **44094695940**](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44094695940), commit `1f054d22`, **SÍ EJECUTÓ** el workflow `BT-DRIVE-PROVISION` (17/11/2026 13:38 UTC). **Resultado FAILURE**, código sanitizado `DRIVE_PROVISION_NOT_COMPLETE: DRIVE_FOLDER_INACCESSIBLE`.
- No existe recibo positivo `owner_root_private_verified=true` ni `destination_activated=true`. No quedó demostrada ni autorizada la nueva carpeta como destino de backups; ninguna exportación/restauración cloud resultó de este run.
- El nombre determinista de la operación se forma a partir del ID del run. Antes de intentar `mkdir` de nuevo, **reconciliar en solo lectura** si existe una carpeta creada/parcial de aquella ejecución. Con el error por sí solo no afirmar que no se creó ningún objeto.
- **NO ejecutar nuevamente la provisión ni cambiar OAuth/scope/destino sin diagnóstico específico y permiso explícito.** El bloqueo por acceso/visibilidad Drive `drive.file` sigue pendiente.
- Véase [auditoría retrospectiva con libro de incidentes](../BT_SEGURIDAD_AUDITORIA_RETROSPECTIVA_20261119.md) y su checkpoint final. La evidencia histórica original de «todavía no ejecutado» se conserva arriba como correcta para el momento en que fue redactada.
