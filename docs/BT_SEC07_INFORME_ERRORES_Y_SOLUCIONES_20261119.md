# INFORME CONSOLIDADO — ByteTorque | Seguridad, respaldos y recuperación
**Cierre:** jueves 19 de noviembre de 2026 · **Reanudación sugerida:** viernes 20 de noviembre de 2026
**Identificador:** BT-SEC07-CIERRE-19NOV-17 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama autorizada:** `main`
**Clasificación:** documento técnico sin credenciales ni datos de clientes. **No certifica recuperación integral.**

## 1. Resumen ejecutivo

- **HITO ALCANZADO:** el propietario ejecutó un respaldo nuevo del PostgreSQL actual en su PC usando exportación binaria, cifrado OpenPGP por pipe y carpeta nueva única. El programa confirmó `BT_SEC07_NEW_ENCRYPTED_SNAPSHOT: OK_NEW_UNIQUE_DIRECTORY`, hashes/manifiesto y TLS de solo lectura. Los metadatos de roles se cifraron por separado (`OK_METADATA_ONLY`), pero **NO son SQL de roles restaurable**.
- **HITO PENDIENTE:** la restauración aislada de ese nuevo snapshot **falló**. Diagnóstico sobre la MISMA copia determinó `GPG_PROCESS: OK`, `DECRYPTED_STREAM: NONZERO`, `PG_RESTORE_PROCESS: FAILED` y `PG_RESTORE_ERROR_CLASS: EXTENSION_UNAVAILABLE`. La causa inmediata se clasifica como extensión no disponible en la imagen PostgreSQL 17 genérica del ensayo; **no sabemos aún cuál ni si es el único problema**.
- **ESTADO DE SEGURIDAD:** el snapshot actual se preservó sin modificación; no subirlo a GitHub/chat. Su manifiesto permanece `RESTORE_NOT_VALIDATED` / `restoration_verified=false`. El respaldo viejo del 17/11 se restauró parcialmente (7 tablas, 25 registros, 16 políticas RLS), pero es anterior a migraciones de esa tarde y no sustituye al nuevo.
- **CONDICIÓN PARA EL PILOTO:** `BT-PILOT-QA-04: A REPASAR`. Aún no certificar protección completa de datos reales.
- **PUNTO EXACTO DE PAUSA:** el ZIP `BT_SEC07_EXTENSION_INVENTORY_20261119.zip` fue entregado, probado 16/16 offline por el asistente y está **pendiente de ejecución en Windows**. No se recibió su salida `BT_SEC07_*` / `DIAG_EXIT_CODE`.
- **PRODUCCIÓN:** ninguna tabla, RLS, Auth, Storage, secreto o configuración Supabase/Render/Drive fue cambiada en el bloque de cierre. La conexión utilizada para el respaldo fue de solo lectura y TLS verificado.

## 2. Línea de tiempo de errores, causas, soluciones y estado

| Incidente | Evidencia/causa confirmada | Acción o solución realizada | Estado al cierre |
|---|---|---|---|
| PostgreSQL no aparecía en PATH | `pg_dumpall.exe` y `psql.exe` no se resolvían en una nueva sesión; no implica desinstalación | Se reconoció que PostgreSQL 17 ya está instalado, y el exportador puede localizar binarios en `Program Files\PostgreSQL\17\bin` | Resuelto en flujo local |
| Fallos iniciales de `.pgpass` y huellas GPG | Requisitos locales de formato/validación | Correcciones históricas de validadores de huella y escaping de contraseña; sin publicación de secretos | Resuelto históricamente |
| Archivo service libpq mal formateado (flujo cloud) | `ConfigParser.write` insertaba espacios en delimitadores, libpq rechazó service file | Usar `space_around_delimiters=False` en generador cloud, documentado el 17/11 | Resuelto históricamente, independiente de SEC-07 |
| `NUL.part / File exists` durante comprobación antigua | Conflicto de archivo/dispositivo reservado en Windows; no prueba corrupción del GPG | Se cambió método de comprobación; base histórica pasó descifrado y se restauró parcialmente | Resuelto |
| `roles.sql.gpg` antiguo de 151 bytes | GPG descifra correctamente a **0 bytes**: respaldo de roles inválido | Preservar original y bloquear declaración de copia completa | Abierto; no se sabe qué originó stderr 75 B de `pg_dumpall` |
| Diagnóstico de roles `pg_dumpall` exit 1 | Dos ejecuciones previas; TLS OK; stderr 75 B sin clase conocida en la última, descartado | Se detuvieron intentos repetidos; no atribuir a puerto, pooler ni permisos sin evidencia | Causa raíz abierta |
| Exportador local aceptaba ciphertext GPG no vacío | Un GPG válido puede cifrar 0 bytes de SQL, dejando archivo no útil; directorio parcial quedaba al fallar roles | Candidatos privados con conteo binario del productor, rechazo de vacío, limpieza y staging; 20/20 QA Windows sintética PASS | Parche candidato probado, no reemplazo automático del original |
| PowerShell `else` aislado | Dos pegados separados dejaron `else` fuera de la instrucción `if` | Bloques autocontenidos `& { ... }`; 20/20 PASS en PC | Resuelto |
| `HISTORICAL_MANIFEST_MISSING` (v1) | Error de diseño del candidato: el manifiesto viejo solo se escribía tras exportar roles; esa etapa había fallado | v2 identifica destinatario OpenPGP del ciphertext viejo y coteja clave existente | Resuelto en v2 |
| `HISTORICAL_RECIPIENT_KEY_NOT_UNIQUELY_PRESENT` (v2) | El anillo GPG predeterminado tenía la clave pública coincidente pero **0 claves privadas** | Revisión offline del anillo histórico `%LOCALAPPDATA%\ByteTorque-GPG-Prueba\gnupg-aislado`: `SECRET_RECIPIENT: MATCH`, `V2_MATCHER: MATCH`, exit 0; usar `GNUPGHOME` solo temporalmente | Resuelto para identificación; no fue prueba de passphrase |
| `DOCKER_PG17_IMAGE_NOT_FOUND_NO_AUTO_PULL` | Error combinado: Docker Engine aún no estaba operativo, no evidencia concluyente de imagen ausente | Diagnóstico separado del daemon; no descargar automáticamente ni reinstalar PostgreSQL | Clasificado |
| `DOCKER_ENGINE_NOT_READY` | Motor Docker Desktop no respondía; Docker CLI/contexto local existían | Inicio/acceso a Docker Desktop, posteriormente `DOCKER_ENGINE: RUNNING`, `DOCKER_LINUX: OK`, `PG17_IMAGE: PRESENT` | Resuelto en sesión |
| Nuevo snapshot cifrado actual | `POSTGRES_READONLY_TLS: OK`, `ROLES_CATALOG: OK_METADATA_ONLY`, `NEW_ENCRYPTED_SNAPSHOT: OK_NEW_UNIQUE_DIRECTORY` | Captura cifrada en carpeta local única con hashes y manifiesto; preservar | **Copia creada; recuperabilidad no certificada** |
| `RESTORE_FULL_FAILED_IN_ISOLATION` | El restaurador v2 descartaba stderr de GPG y `pg_restore`; causa inicialmente desconocida | Diagnóstico único del MISMO snapshot con errores categorizados, sin SQL claro en disco ni producción | Causa inmediata aclarada |
| `EXTENSION_UNAVAILABLE` | GPG OK, bytes descifrados >0, Docker PG17 OK, `pg_restore` falló con patrón de extensión no disponible | No saltar extensiones a ciegas; inventario TOC + controles .control de imagen PostgreSQL preparado y QA offline 16/16 PASS | **Primer pendiente del 20/11** |
| Google Drive `DRIVE_FOLDER_INACCESSIBLE` | Owner coincide, carpeta privada no fue accesible para app OAuth con scope `drive.file` en workflow antiguo | Investigación documentada; evitar bucles de reintentos y no relajar scope automáticamente | Abierto, independiente |
| Recuperación completa Supabase | Roles SQL, configuraciones Auth, blobs Storage, Edge Functions, secretos externos y compatibilidad de extensiones no verificados | Mantener gates y separar componentes; no abrir piloto real | Abierto |

## 3. Evidencias validadas: no confundir categorías

**Comprobado en Windows por salida del propietario**
1. Pruebas sintéticas del primer parche local: `Ran 20 tests ... OK`, exit 0.
2. Exportador/orquestador: suite offline 35 PASS; paquete v2 QA offline OK, paradas previas antes de conectar a Supabase.
3. GPG: 14/14 autopruebas; anillo GPG predeterminado sin clave privada y anillo histórico aislado con privada que **coincide** con destinatario.
4. Docker: motor Linux operativo e imagen PG17 funcional durante ensayo posterior.
5. Nueva captura: `POSTGRES_READONLY_TLS: OK`, `NEW_ENCRYPTED_SNAPSHOT: OK_NEW_UNIQUE_DIRECTORY`, `BLOQUE_EXIT_CODE: 3`, `BACKUP_ROLES_SQL: NOT_INCLUDED`.
6. Diagnóstico del MISMO respaldo: `CIPHERTEXT_HASHES: OK`, `RECIPIENT: MATCHED_HISTORICAL_CIPHERTEXT`, `GPG_PROCESS: OK`, `PG_RESTORE_PROCESS: FAILED`, `PG_RESTORE_ERROR_CLASS: EXTENSION_UNAVAILABLE`, `BACKUP_MANIFEST: UNCHANGED`, `DIAG_EXIT_CODE: 3`.

**Solo preparado y probado por el asistente, aún no ejecutado con datos reales en Windows**
- `BT_SEC07_EXTENSION_INVENTORY_20261119.zip`, SHA256 `7e3a0a2a16d5d92ec5a2155ff041ab63db5bf4e54aa6d635b834e76c280536f9`; inventario de extensiones del índice de `database.dump.gpg` vs archivos .control de la imagen Docker. 16/16 pruebas sintéticas PASS + GPG real sintético. **No hay resultado del inventario aún**.

**Pendiente / no demostrado**
- Extensión específica ausente, otros posibles errores posteriores, paridad de datos/RLS/Auth del snapshot actual, restaurabilidad completa, roles SQL restaurables, Storage object bytes, proveedor/Auth, Edge, secretos, copia fuera del PC y recuperación Drive.
- Causa del `pg_dumpall` antiguo exit 1/stderr 75 B.
- Huella o ID exacto de la copia nueva: el nombre fue generado automáticamente y **no fue comunicado por el propietario**. No inventar rutas/IDs ni publicarlos.

## 4. Próximo bloque seguro — viernes 20/11/2026

**Primer paso único, SIN nueva exportación ni acceso remoto:**
1. Releer `AGENTS.md`, `agent.md`, `roadmap.md`, este informe y checkpoint final de jornada desde `main` actual.
2. Pedir/evaluar únicamente la salida del **inventario offline** preparado `BT_SEC07_EXTENSION_INVENTORY_20261119.zip`; es la próxima tarea pendiente, no se ha ejecutado en el PC. El comando ya fue entregado el 19/11. Verificar SHA256 de ZIP, destino nuevo, QA 16/16 y salida sanitizada `BT_SEC07_*` / `DIAG_EXIT_CODE`.
3. Comparar extensiones requeridas del TOC con .control en la imagen PostgreSQL 17. **No asumir que .control garantiza operatividad**.
4. Si faltan extensiones, estudiar compatibilidad/versiones de imagen PostgreSQL de Supabase para Docker **aislado**, planificar un solo nuevo ensayo de restore del snapshot existente con test de filas, objetos, RLS y roles. No descargar/ejecutar imágenes ni restaurar otra vez sin la puerta de autorización pertinente.
5. Tras recuperar una copia, afrontar exportación restaurable de roles (con CLI Supabase y filtros oficiales, si aplica), cobertura Auth/Storage/Edge, segunda copia cifrada independiente y Drive OAuth por separado.

**Reglas operativas:** bloques grandes, no micropruebas repetidas; mantener `main`; preservar copias, keyring y manifiestos; no pegar secretos, datos de clientes, SQL ni logs crudos; no publicar código privado ni archivos .gpg; no repetir `pg_dump`, `pg_dumpall`, ni cambiar permisos de producción sin razón/documentación y autorización explícita. Una restauración aislada no autoriza escribir datos en Supabase.

## 5. Rutas y referencias de continuidad

- Documento rector histórico: [Auditoría retrospectiva 19/11](BT_SEGURIDAD_AUDITORIA_RETROSPECTIVA_20261119.md).
- Ejecución y resultados detalle: [Checkpoint respaldo y recuperación](checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md).
- Cierre/reanudación: [Checkpoint de jornada](checkpoints/CHECKPOINT_BT_SEC07_CIERRE_JORNADA_20261119.md).
- Protocolo principal: [AGENTS.md](../AGENTS.md), [agent.md](../agent.md), [roadmap.md](../roadmap.md).
- Referencia externa utilizada previamente: [Supabase — Restore from Platform](https://supabase.com/docs/guides/self-hosting/restore-from-platform) y [PostgreSQL 17 — pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html).

**Estado final:** `BT-SEC-07: ABIERTO` · `BT-PILOT-QA-04: A REPASAR` · **Backup actual cifrado: CREADO, no recuperado/validado íntegramente**.

## BT-SEC07-DOCKER-MANUAL-START-18 · Rectificación de la solución Docker tras el cierre

**Nueva precisión aportada directamente por el propietario (19/11):** «Docker funcionó cuando abrí el programa». La secuencia ya no queda solo como «motor recuperado»: la acción concreta fue **abrir manualmente Docker Desktop**, tras lo cual los controles mostraron `DOCKER_ENGINE: RUNNING` y `DOCKER_LINUX: OK`. La explicación operativa es que **el motor no estaba accesible antes de abrir Docker Desktop**; no hay evidencia para atribuir la parada a una instalación defectuosa, ausencia de imagen o fallo permanente del backend WSL.

**Solución que debe reutilizarse:** abrir Docker Desktop y comprobar que el daemon Linux responda antes de buscar o descargar imágenes. **No reinstalar Docker/PostgreSQL, resetear datos, eliminar imágenes, cambiar contexto ni ejecutar `docker system prune`** como primera reacción. Esta corrección no afecta a la existencia del nuevo respaldo cifrado ni al bloqueo actual de recuperación `EXTENSION_UNAVAILABLE`.

## BT-SEC-OPERATING-STANDARD-20NOV-01 · Adenda de decisión de 20/11: supersede tareas Drive históricas

**No interpretar filas anteriores «Drive OAuth pendiente» como trabajo activo**: el titular decidió EXCLUIR Google Drive del proyecto de respaldos y cifrado. Las filas de 19/11 quedan registradas porque ocurrieron, pero no se resolverán ni se usará Google Drive para almacenamiento. Los workflows Drive manuales permanecen como legado que no debe ejecutarse; retiro de código condicionado a revisión. El cifrado GPG se mantiene; aún se necesita segunda copia fuera del PC en destino no elegido. Ver [estándar operativo](BT_SEGURIDAD_ESTANDAR_OPERATIVO_20261120.md) y [checkpoint](checkpoints/CHECKPOINT_BT_SEC_ESTANDAR_Y_SIN_DRIVE_20261120.md). Recuperación sigue NO CERTIFICADA.

## BT-SEC07-PARITY-PREP-23 · Adenda 20/11: prevención de errores y próxima puerta de verificación

**Sucesos reales posteriores al informe 19/11**: (1) primer inventario `DOCKER_LINUX_NOT_READY` porque Docker Desktop no estaba iniciado; solución abrir Docker Desktop, no reinstalar. (2) lectura del TOC con `pg_restore --list` Windows V1 se detuvo con `ARCHIVE_TOC_NOT_READABLE`; no se identificó causa interna de ese fallo; solución funcional y comprobada fue lectura TOC con `pg_restore --list` desde Docker Linux V2, 19/19 QA y 4 extensiones identificadas. (3) PostgreSQL genérico PG17 carecía del archivo de control de una de esas extensiones; imagen `supabase/postgres:17.12.0.002` descargada con autorización contiene controles de las cuatro, 15/15 QA. (4) nueva restauración desde el **mismo** respaldo cifrado dentro de ese Docker aislado terminó con `GPG_PROCESS: OK` y `PG_RESTORE_PROCESS: OK`, 12 tablas públicas detectadas, cleanup verificado; 25/25 QA, backup y manifest intactos. Referencias [TOC V2](checkpoints/CHECKPOINT_BT_SEC07_ARCHIVE_TOC_V2_20261120.md), [imagen](checkpoints/CHECKPOINT_BT_SEC07_SUPABASE_IMAGE_MATCH_AND_LAB_PREP_20261120.md), [restore exitoso](checkpoints/CHECKPOINT_BT_SEC07_RESTORE_ISOLATED_SUCCESS_20261120.md).

**Limitación y prevención:** el script de restore del 20/11 no compara registros ni datos, solo presencia de tablas, y omite propietarios y ACL con `--no-owner --no-acl`. No modificar el backup/manifiesto ni declarar recuperabilidad de toda la plataforma. Se preparó **`BT_SEC07_PARITY_LAB_20261120.zip`** (SHA256 `795b7d2f38b43bd817f4c63e11770a8f4f8c8ccf33c791afa1d9583847c31cf8`, **32/32 tests sintéticos PASS**, NO ejecutado aún en PC) para un único futuro restore aislado con autorización nueva. Comprueba conteos, 12 tablas públicas, >=8 privadas según auditoría, RLS/FORCE, restricciones, índices y cuatro extensiones instaladas; valida BYPASSRLS para evitar filas filtradas, usa `COUNT(*) FROM ONLY` para evitar herencia duplicada. No demuestra paridad de producción ni restaura Auth/Storage/Edge/roles. [Checkpoint detallado](checkpoints/CHECKPOINT_BT_SEC07_PARITY_PREP_20261120.md).

**Regla de repetición:** no más `pg_dump` para resolver errores de prueba de restore; no repetir un ensayo idéntico sin objetivo adicional; cada nuevo error debe tener código sanitizado, causa demostrada vs hipótesis, reparación, prueba de cierre y versionado. Google Drive fuera del roadmap activo; no reactivar sus workflows.

## BT-SEC07-PARITY-SQL-INC-24 · Incidente 20/11 de validación SQL — solución candidata y prevención permanente

**Resultado PowerShell real:** tras restauración exitosa del mismo snapshot GPG (`PARITY_GPG_PROCESS: OK`, `PARITY_PG_RESTORE_PROCESS: OK`, error NONE), el primer SQL de paridad falló con `BT_SEC07_STOP: PARITY_QUERY_FAILED` y exit 2; cleanup verificado y backup/manifiesto sin cambios. El análisis del ZIP V1 exacto confirmó el fallo: `physical_tables` se usaba en `SELECT concat_ws` pero nunca se definió en el CTE `stat`. No es un fallo de GPG ni del restore.

**Solución candidata verificada en tests:** script V2 aislado, nuevo ZIP SHA `0d315b637730500ebfaf7f058c98cde3c1abfa28dc115c70a1e569608f26d667`, 40/40 tests PASS, 40/40 con Python -O, guardia sobre 13 aliases SQL y `c.relkind`; **ejecución real de consultas fijas sobre DB temporal ANTES del restore**. El error V1 no volvería a consumir una restauración: el preflight se detendría al fallar el SQL. El paquete V2 aún **no se ejecutó en el Windows del propietario** y no debe declararse solucionado operacionalmente hasta ese comprobante.

**Prevención:** añadir por cada herramienta SQL pruebas negativas de definiciones de columnas/alias, validación por PostgreSQL real en laboratorio vacío antes del replay de datos, estatus de etapa fijo en vez de `PARITY_QUERY_FAILED` genérico, cero SQL/logs con datos en chat y prohibición de repetir la exportación. [Checkpoint](checkpoints/CHECKPOINT_BT_SEC07_PARITY_SQL_INC_20261120.md). Respaldos originales, clave, Supabase, Render y Google Drive no tocados; Drive continúa excluido.
