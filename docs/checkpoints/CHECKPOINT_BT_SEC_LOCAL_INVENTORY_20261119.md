# CHECKPOINT — BT-SEC-LOCAL-INVENTORY-01 · Verificación no invasiva del respaldo en PC
**Fecha:** 19/11/2026 · **Rama:** `main` · **Estado:** inventario comprobado con salida de PowerShell aportada por el propietario; diagnóstico del contenido de roles PENDIENTE.

## Evidencia aportada
- `Test-Path` confirmó que existe `$HOME\BT-Backups\bytetorque-local-20261117T144118Z-8c1f8a323a924d44a6b8e853e6faa756`.
- `database.dump.gpg`: **PRESENTE**, 89.091 bytes.
- `roles.sql.gpg`: **PRESENTE**, 151 bytes.
- Directorio aislado GPG `$env:LOCALAPPDATA\ByteTorque-GPG-Prueba\gnupg-aislado`: **EXISTE**.
- Solo son pruebas de existencia/tamaño. No se calcularon hashes ahora, no se descifró ningún archivo en esta comprobación, no se comprobó la clave privada de la carpeta GPG, ni se examinó el SQL de roles.

## Estado previo NO REINICIAR
El 17/11 ya se hizo cifrado/descifrado del dump y se ejecutó restauración SQL aislada con paridad de siete tablas: `BT_DATOS: RLS_ACTIVA=7 POLITICAS=16`, `BT_REGISTROS: TABLAS=7 FILAS=25`, `BT_PARIDAD: SIETE_TABLAS_COINCIDEN`. Es prueba funcional del SQL incluido en esas siete tablas; NO acredita totalidad de Auth, roles, Storage, Edge, secretos o configuraciones. Roles había terminado `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` y el ciphertext de 151 bytes no se puede declarar válido solo por existir. Backup automático Drive continúa bloqueado por OAuth `drive.file` como trabajo separado.

## Próximo paso concreto (lectura local)
Desde PowerShell, comprobar **solo** si `roles.sql.gpg` puede descifrarse y medir la cantidad de líneas/caracteres, SIN imprimir texto SQL, contraseña, claves privadas ni crear archivo plano. Si resulta vacío/error, investigar exclusivamente causa de `pg_dumpall --roles-only --no-role-passwords` y formato de roles antes de realizar nueva exportación de ese componente; no sobrescribir ciphertext original. No rehacer GPG ni restauración de siete tablas.

## Seguridad de esta etapa
Sin cambios en Supabase, Render, Auth, RLS, Storage, Drive, clientes o datos. No se disparó ningún backup ni migración ni ejecución remota. Commits documentales `[skip render]`. **BT-PILOT-QA-04: A REPASAR**.


## Seguimiento del diagnóstico GPG (19/11/2026) — comprobación recibida del propietario

El propietario ejecutó el comando previsto de **descifrado de roles a la salida estándar, con salida canalizada únicamente a `Measure-Object -Line -Character`**, sin guardar SQL en claro ni mostrar su contenido.

**Salida observada:**
- `ROLES_DESCIFRADO_EXIT: 0`
- `ROLES_LINEAS: 0`
- `ROLES_CARACTERES: 0`

**Interpretación acotada:** GPG terminó sin error y PowerShell no detectó ninguna línea ni carácter del texto descifrado. Esto hace **muy probable** que el contenido cifrado esté vacío, aunque 151 bytes de ciphertext existan. **Todavía no existe una medición de bytes del texto descifrado**; un conteo de caracteres/líneas no la sustituye. No se ha demostrado que la causa sea exactamente `pg_dumpall` (pudo ser un fallo del productor, redirección, pipeline o entrada vacía).

**Próximo paso focalizado:** medir la salida de `gpg --decrypt` a nivel binario **en memoria y sin imprimir/guardar contenido**, con código de salida independiente, para confirmar si realmente son cero bytes. Si es cero, conservar el `roles.sql.gpg` original intacto como evidencia, diagnosticar solamente el exportador de roles y protegerse contra encrypt de stdin vacío. No volver a extraer/cifrar la base completa, ni repetir el restore SQL de 7 tablas; no inferir que el respaldo de roles está sano por EXIT 0.

**Impacto:** este control no autoriza migraciones, accesos alojados, cambios de permisos, exportación nueva ni corrección automática; los componentes pendientes de recuperación integral continúan pendientes.


## BT-SEC-ROLES-GPG-03 — Resultado binario definitivo (19/11/2026)

**Evidencia nueva del propietario en PowerShell:** proceso GPG ejecutado sobre el archivo ORIGINAL `roles.sql.gpg`, con lectura de `StandardOutput.BaseStream` directamente como bytes en memoria, sin revelar SQL ni escribir un dump en claro:

- `ROLES_DESCIFRADO_EXIT: 0`
- `ROLES_BYTES_DESCIFRADOS: 0`

**Conclusión verificada:** el `roles.sql.gpg` de 151 bytes es un ciphertext GPG descifrable **cuyo contenido descifrado está vacío (0 bytes)**. **NO es un respaldo útil de roles.** Mantenerlo sin sobreescribir, borrarlo ni interpretarlo como recuperación válida. Esto supera la anterior medición de 0 líneas/caracteres: ahora está comprobado a nivel binario.

**Diagnóstico histórico previo:** la herramienta local `ByteTorque_Diagnostico_Roles.py` ejecutaba `pg_dumpall --roles-only --no-role-passwords` con stdout descartado y stderr clasificado en códigos seguros, después de una lectura TLS exitosa. Informó `DIAG_ROLES: POSTGRES_TLS_OK` y `DIAG_ROLES: ROLES_ORIGEN_FALLA_NO_CLASIFICADA`. Ese código demuestra **fallo no clasificado del productor** en tal ejecución, pero no prueba aún la causa concreta (permisos, versión, pooler u otra). No inventar una causa.

**Pendientes inmediatos:** sin volver a descifrar ni restaurar las siete tablas, consultar de modo **local y solo lectura** versiones/rutas de `pg_dumpall` y `psql`, y ubicar el programa `bytetorque_respaldo_local.py` ya existente para preparar un diagnóstico de roles que capture **solo código de salida y categorías saneadas**, nunca SQL crudo, cadena de conexión, contraseñas ni stderr íntegro. Si se requiere corregir el productor, usar cambio acotado y una copia cifrada NUEVA de roles con nombre distinto SOLO tras autorización, conservando `database.dump.gpg` y `roles.sql.gpg` anteriores.

**Límites:** no se exportaron roles, no se creó GPG nuevo, no se alteraron permisos ni datos alojados, ni se ejecutó Docker, GitHub Actions, Drive o Render. La restauración SQL aislada de 7 tablas permanece válida en su alcance.


## BT-SEC-ROLES-PGTOOLS-04 — Diagnóstico de ejecutables en PATH (19/11/2026)

**Nueva salida de PowerShell proporcionada por el propietario:**
- `pg_dumpall.exe: NO ENCONTRADO EN PATH`
- `psql.exe: NO ENCONTRADO EN PATH`

**Interpretación estricta:** ninguno de los dos ejecutables se resuelve mediante `Get-Command` en la sesión PowerShell actual. **NO prueba que los clientes PostgreSQL estén desinstalados ni que hayan desaparecido las versiones con que se trabajó el 17/11**: podrían estar en `Program Files\PostgreSQL\<version>\bin`, en una ubicación no incluida en el PATH, en un entorno temporal o en el contenedor Docker aislado. **No instalar, actualizar, editar el PATH ni repetir dump/restore como respuesta automática.**

**Próxima instrucción local:** inspeccionar exclusivamente carpetas habituales de `Program Files\PostgreSQL`, consultar la existencia/versiones de ambos ejecutables por **ruta absoluta**, y mostrar el estado de `docker` sin conexión a Supabase. No buscar toda la unidad, ejecutar `pg_dumpall` contra producción ni mostrar SQL/secretos. Si no aparecen, localizar el programa Python local `bytetorque_respaldo_local.py` y consultar su método `tools_needed()`/ubicación de sus herramientas antes de instalar software.

**Estado restante:** `roles.sql.gpg` se descifró a 0 bytes, sigue **inválido** como respaldo de roles. Se conserva sin sobrescribir. La restauración SQL aislada ya realizada y el cifrado de `database.dump.gpg` siguen sin repetirse. Drive automático sigue pendiente por OAuth, por separado. No hubo operaciones sobre Supabase, Render, Drive o archivos locales al crear esta nota.
