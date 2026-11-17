# ByteTorque — auditoría de Drive, 17/11/2026

Base: main `573d6b87bb0e6cfcb7e689b7b7c9fb76252bf502`. Estado: BLOQUEADO en acceso Drive; no respaldo ni recuperación verificados. Esta entrega corrige la observabilidad y prepara una comprobación discriminante; no afirma resolver una autorización OAuth que todavía no se puede identificar.

## Evidencia revisada

| Run | Resultado leído de GitHub |
| --- | --- |
| 44084850284 | WITH_STARTUP_OPTIONS: OK / WITHOUT_STARTUP_OPTIONS: OK |
| 44085704801 | BACKUP_NOT_COMPLETE: DRIVE_ACCESS_CHECK |
| 44087053869 | BACKUP_NOT_COMPLETE: DRIVE_ACCESS_CHECK |
| 44087756245 | DRIVE_READONLY_DIAG: DRIVE_ROOT_LIST_FAILED; checkout 573d6b8; rclone 1.60.1+dfsg-4ubuntu3.2; 26+16 tests offline OK |

No se repitieron esos workflows ni se ejecutaron exportaciones/restauraciones. Supabase no se consultó ni modificó: el bloqueo actual está antes del dump y el usuario aportó la autenticación ya confirmada, ratificada en los logs.

## Defecto comprobado e incertidumbre exacta

`DRIVE_ROOT_LIST` abarca cuatro operaciones distintas: lanzar rclone, obtener exit code exitoso, interpretar JSON y encontrar una única carpeta con nombre/path/ID esperados. Tanto un proceso rechazado como un `[]` válido terminaban en el mismo código. `stderr=DEVNULL` descartó el motivo original; no es recuperable desde esos logs.

Por tanto, NO está demostrado que rclone falló, que el token expiró o que la cuenta sea incorrecta. Está demostrado que no se completó toda la validación de esa etapa. Cambiar el ID no podía discriminar un rechazo OAuth anterior al listado.

La documentación oficial de Google limita drive.file a archivos creados/autorizados para la aplicación; rclone advierte que archivos creados desde la interfaz web no son visibles con ese alcance. Abrir la carpeta con otra conexión de Drive demuestra acceso de esa conexión, no acceso del cliente OAuth guardado en GitHub. El texto `scope=drive.file` de rclone tampoco demuestra por sí solo los scopes realmente otorgados al token.

El filtro del programa exige además que la carpeta esté en la raíz con nombre exacto. Una carpeta visible por ID pero anidada, o un nombre duplicado, puede bloquearlo sin que OAuth esté roto. Se conserva el control actual; no se elimina para forzar un verde.

## Corrección implementada

1. `drive_errors.py`: ejecución de rclone con stderr capturado solo en memoria; clasificador de etiquetas fijas. Distingue ejecutable ausente, timeout, lanzamiento, invalid_grant, invalid_client, scopes, API deshabilitada, cuota, TLS, red, configuración y error no clasificado. No imprime comandos, cuerpos, tokens ni mensajes.
2. JSON inválido y estructura incorrecta se distinguen de lista válida. Ausencia, ambigüedad, ID y path incorrectos tienen códigos diferentes.
3. Si la carpeta no aparece en la raíz, se hace GET del ID aprobado para distinguir inaccesibilidad HTTP de un defecto de ubicación/listado. No crea carpetas, no cambia IDs y no permite continuar exportando tras ese fallo.
4. Con el secreto `BT_BACKUP_DRIVE_EXPECTED_OWNER` (requerido por el diagnóstico, opcional para la clase compartida), consulta `about.get(fields=user(emailAddress))` usando el token tras la renovación de rclone. Compara en memoria con el correo principal esperado, sin normalizar alias arbitrarios. Emite solo `DRIVE_OWNER_MATCHED` o `DRIVE_OWNER_MISMATCH`; el correo nunca se imprime. about.get admite drive.file según Google.
5. Errores HTTP distinguen 401, 403 y 404; razones JSON reconocidas distinguen scope/API/cuota. Un 404 significa inaccesible para ese token, NO prueba que la carpeta no existe. Un 403 sin reason específico NO se etiqueta automáticamente como scope insuficiente.
6. Los códigos se conservan también a través del exportador. Los procesos rclone no heredan bindings BT_BACKUP/BT_RESTORE ni overrides RCLONE.
7. Tests incorporados a CI y a ambos workflows manuales antes de cargar secretos. Permanecen owner-only, main, environment bytetorque-backup-export, confirmaciones explícitas, TLS, GPG, privacidad y readback. Repositorio temporalmente público preservado.

## Procedimiento único del propietario

No volver a cambiar los cinco secretos existentes ni ejecutar exportación ahora.

1. En GitHub → Settings → Environments → **bytetorque-backup-export** → Add environment secret, crear **BT_BACKUP_DRIVE_EXPECTED_OWNER**. Valor: únicamente el correo principal de Google de la cuenta propietaria de la carpeta actual. No contraseña, token ni archivo JSON. No enviarlo por chat ni ponerlo como variable pública.
2. En Actions → **BT-DRIVE-DIAG** → Run workflow, seleccionar **main actualizado** y activar `confirm_readonly_drive_probe`. Ejecutar UNA vez. No usar Re-run del run antiguo: conservaría código anterior.
3. Compartir únicamente el enlace del run. Revisaremos sus códigos fijos. No compartir logs OAuth sin sanitizar ni capturas del contenido de secretos.

Esta intervención es necesaria para cotejar la cuenta: ni el repositorio ni los registros disponibles contienen una identidad esperada verificable, y GitHub no permite recuperar el valor de secretos. El nuevo dato no concede acceso ni amplía scopes. El test sigue siendo solo lectura de Drive y permite la renovación normal de OAuth en el archivo temporal, sin modificar el secreto persistido.

## Decisión según evidencia, sin reintentos ciegos

| Evidencia nueva | Conclusión sustentada | Corrección mínima siguiente |
| --- | --- | --- |
| OAUTH_GRANT_REJECTED | Google rechazó refresh grant; no demuestra simple expiración | Reautorizar el mismo cliente y cuenta con drive.file; revisar revocación/estado de app. No cambiar todos los secretos |
| OAUTH_CLIENT_REJECTED | Cliente OAuth rechazado | Verificar que client_id/client_secret pertenecen al cliente que emitió el refresh token; reautorizar pareja coherente |
| OWNER_MISMATCH | Token pertenece a otra cuenta respecto del correo esperado | Seleccionar la cuenta propietaria al reautorizar el mismo cliente; conservar carpeta y scope |
| OWNER_MATCHED + FOLDER_INACCESSIBLE | Cuenta coincide pero GET del ID no es accesible | Confirmar existencia actual con propietario; investigar autorización por archivo para ESA app. drive.file es hipótesis prioritaria, no certeza de un 404 aislado |
| SCOPE_INSUFFICIENT | Proveedor informa scopes insuficientes | Revisar grant real y autorización por archivo. No sustituir drive.file por drive automáticamente |
| FOLDER_NOT_LISTED | GET por ID funcionó, pero carpeta no coincidió con listado raíz | Revisar ubicación/nombre y lógica; no regenerar OAuth |
| NAME_AMBIGUOUS / ID_MISMATCH | Listado no identifica de forma única el destino aprobado | Resolver discrepancia demostrada; no seleccionar otra carpeta por coincidencia de nombre |
| RCLONE_* / API_DISABLED / TLS / NETWORK | Error de herramienta/configuración/API/transporte identificado | Corregir esa causa concreta antes de tocar permisos o datos |
| OK con OWNER_MATCHED | Cuenta, destino y privacidad pasaron | Solicitar autorización expresa para una exportación cifrada con readback |

Si se confirma falta de autorización por archivo, la solución que conserva el ID es seleccionar esa carpeta con Google Picker para el MISMO proyecto OAuth del token. Requiere configuración legítima de esa app; Picker de otra app no sirve. Como alternativa, con permiso separado, crear carpeta desde la misma app drive.file y fijar su ID después de verificar dueño/privacidad. No se implementó ninguna de esas escrituras ni se amplió scope. Reautorizar drive.file por sí solo no autoriza mágicamente todas las carpetas existentes.

La documentación actual de rclone anuncia retiro de su cliente OAuth compartido durante 2026. No se conoce si el secreto utiliza dicho cliente ni si interviene en este fallo; no convertir ese aviso en causa comprobada. Si el código identifica cliente rechazado, revisar ese punto antes de reautorizar.

## Validación y límites

63 tests locales PASS: Drive 26, errores/identidad/redacción 8, frontera GHA 16, preflight PostgreSQL 6, config/libpq 4, diagnóstico PostgreSQL 3. Se prueban lista vacía, fallos de proceso, HTTP, cuenta distinta, cuenta coincidente pero carpeta invisible, visibilidad por ID sin bypass, ausencia de fugas, permisos privados, destino fijo y SHA-256 readback. `git diff --check` PASS.

Son pruebas sintéticas sin credenciales, exportación o restauración. No prueban vigencia del OAuth real. No se ha generado copia nueva ni cargado archivos Drive. La auditoría no está cerrada operativamente.

Después de acceso confirmado: autorizar una exportación real y verificar ciphertext descargado del mismo ID contra SHA-256. Después, autorizar recuperación de ese backup exacto en entorno aislado, con clave GPG privada fuera del repo/Actions, verificar restauración SQL, RLS/FK y datos esperados. No habilitar clientes reales de Ignacio hasta demostrar esa recuperación y revisar cobertura (bytes Storage y configuración/secretos de proveedor siguen fuera del dump).

## Fuentes oficiales

- https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- https://developers.google.com/workspace/drive/api/guides/handle-errors
- https://developers.google.com/workspace/drive/api/reference/rest/v3/about/get
- https://rclone.org/drive/#drivefile
- Código rclone v1.60.1, lib/oauthutil/oauthutil.go: el refresh usa el cliente de la configuración o el predeterminado. No es válido combinar credenciales de aplicaciones distintas.
