# ByteTorque — validación directa del destino aprobado

Fecha: 17/11/2026. Base: main 8d25e02acc40c96b465d362b8ff88699e943582d.

## Evidencia comprobada

Run [44090498121](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44090498121) ejecutó esa base: DRIVE_OWNER_MATCHED y después DRIVE_FOLDER_ID_MISMATCH. El cliente pudo listar y la cuenta coincidió; no repetir hipótesis de contraseña PostgreSQL ni regenerar OAuth por este resultado.

El código buscaba por nombre/path en la raíz y abortaba al encontrar un ID diferente ANTES de consultar el ID aprobado. No hay evidencia en ese run de que el GET del destino aprobado falle: nunca ocurrió. Tampoco se conserva el ID alternativo en logs; no se intenta publicarlo.

Lecturas de metadata mediante la conexión Drive disponible: la carpeta aprobada 1FPD-Bnfbf8m0vxnYCOtT0yald7mCi9pT existe como carpeta con nombre Respaldos ByteTorque; su parent coincide exactamente con el ID devuelto para root. Los permisos observados son dos entradas individuales user (owner y writer), sin anyone/domain/group. No significa owner-only; conserva la política existente de usuarios individuales privados. La búsqueda exacta de carpetas no eliminadas encontró una sola coincidencia sin siguiente página. El adaptador de metadata no expuso ownedByMe en su respuesta normalizada; esa propiedad se exige con la API real en el runner y no se da por comprobada por este conector.

Estas lecturas usan una aplicación OAuth distinta a rclone. No demuestran visibilidad del ID aprobado con drive.file en GitHub ni descartan otras carpetas visibles únicamente para ese token, accesos directos o representaciones de IDs de rclone. No es legítimo concluir que hay dos carpetas reales, ni que drive.file es la causa, a partir de un ID alternativo no observado.

## Causa de bloqueo identificada y corrección

El selector por nombre tenía autoridad innecesaria sobre un destino ya fijado por ID. Esa condición es incorrecta para decidir si el destino aprobado es válido: los nombres no son identificadores únicos y los listados dependen de la visibilidad del token.

Se retiene un único rclone lsjson para renovación normal de OAuth, con errores controlados y formato JSON comprobado. Sus nombres/IDs nunca seleccionan un destino. Se elimina lsjson --stat por nombre. A continuación:

1. Se conserva cotejo de cuenta cuando el diagnóstico suministra el sexto secreto.
2. GET files/ID_APROBADO exige ID exacto, nombre esperado, MIME carpeta real (no shortcut), trashed=false y ownedByMe=true.
3. GET files/root con la MISMA credencial exige raíz válida, tipo carpeta, propiedad y no eliminada. parents del destino debe ser exactamente [root.id]. No se fija el ID raíz de otra conexión ni se acepta ubicación anidada sin autorización.
4. Se conservan todas las páginas de permisos y el rechazo de anyone/domain/group, permisos incompletos o sin propietario.
5. Las escrituras futuras siguen exclusivamente por IDs y parents validados. check_root vuelve a comprobar ubicación/propiedad/privacidad antes de operaciones posteriores; mover la carpeta durante una operación bloquea la continuación.

No se acepta el ID alternativo, no se cambia FOLDER_ID, no se crea/mueve/renombra nada. Si el destino aprobado devuelve 404 se mantiene DRIVE_FOLDER_INACCESSIBLE, sin fallback por nombre; habrá que resolver autorización por archivo para esa app. Si no puede verificarse la raíz, se bloquea, sin quitar el control. Los códigos nuevos son DRIVE_ROOT_LOCATION_UNVERIFIED y DRIVE_FOLDER_LOCATION_MISMATCH.

## Pruebas

65 pruebas locales sin credenciales PASS: Drive 28, errores/identidad 8, frontera exportación 16, preflight PostgreSQL 6, config/libpq 4, diagnóstico PostgreSQL 3. git diff --check PASS.

Regresiones cubiertas: homónimos/ID alternativo/listado vacío/shortcuts no redirigen; ID aprobado inaccesible nunca cae a otra carpeta; metadata con ID distinto, propietario falso o MIME incorrecto se rechaza; root ausente/inválida/no propia/eliminada se rechaza; parents ausentes, múltiples o anidados se rechazan; mover carpeta bloquea creación posterior. Se conservan los tests de privacidad, paginación, uploads por ID, no sobrescritura e integridad SHA-256.

No se modificó ningún workflow: el existente ya ejecuta estas suites antes de secretos. No hubo nuevos diagnósticos reales, exportaciones, restauraciones, cambios OAuth, secretos, Supabase o visibilidad del repositorio.

## Único procedimiento de validación

En Actions → BT-DRIVE-DIAG → Run workflow, elegir main actualizado y activar confirm_readonly_drive_probe. UNA ejecución nueva, no Re-run de 44090498121. Los seis secretos existentes permanecen intactos.

- OK: la misma credencial validó directamente el destino, propiedad, ubicación y privacidad. No equivale a respaldo.
- DRIVE_FOLDER_INACCESSIBLE: ese token no puede leer el ID aprobado; detener, no cambiar ID ni ampliar scopes automáticamente.
- DRIVE_FOLDER_LOCATION_MISMATCH / DRIVE_ROOT_LOCATION_UNVERIFIED: detener y revisar ubicación/visibilidad de root; no aceptar otra carpeta.
- Otros errores: usar el código fijo y la etapa; no repetir ejecuciones sin cambio justificado.

Compartir solo enlace del run. Después de OK, exportación cifrada y recuperación aislada requieren autorización expresa separada. No declarar respaldo operativo ni habilitar datos reales por pruebas offline o diagnóstico verde.

Fuentes: [Google: folders/root/parents](https://developers.google.com/workspace/drive/api/guides/folder), [Files resource](https://developers.google.com/workspace/drive/api/reference/rest/v3/files), [scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth).
