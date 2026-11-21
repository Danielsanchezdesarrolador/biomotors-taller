# CHECKPOINT — BT-SEC07-PARITY-PREP-23 | Auditoría de integridad y seguridad de respaldo restaurado
**Fecha:** 20/11/2026 · **Rama:** `main` · **Estado:** preparado y probado sintéticamente, NO ejecutado aún sobre Docker/backup real del propietario.

## 1. Último hito REAL (no repetir por rutina)
La salida Windows del propietario del paquete `BT_SEC07_SUPABASE_ISOLATED_RESTORE_20261120.zip` confirmó `LAB_GPG_PROCESS: OK`, `LAB_PG_RESTORE_PROCESS: OK`, `LAB_PUBLIC_TABLE_COUNT: 12`, `LAB_CONTAINER_CLEANUP: VERIFIED_REMOVED` y ciphertext/manifiesto sin cambios. Se restauró una BD temporal desde el backup actual cifrado en Supabase PostgreSQL 17 local sin red, **no** se validó igualdad de filas, ACL, propietarios, Auth/Storage/Edge o acceso A/B. [Checkpoint de ejecución exitosa](CHECKPOINT_BT_SEC07_RESTORE_ISOLATED_SUCCESS_20261120.md).

## 2. Nuevo paquete privado preparado
- **Archivo:** `BT_SEC07_PARITY_LAB_20261120.zip` (solo entregado en esta conversación, NO en GitHub).
- **SHA256 ZIP:** `795b7d2f38b43bd817f4c63e11770a8f4f8c8ccf33c791afa1d9583847c31cf8`.
- **Tamaño ZIP:** 12.338 bytes.
- **SHA256 del programa:** `eede945c49ff8cf514832a03ea689fe36c117c789541002c5a4800f1518ab6d3`.
- Contenido: `BT_SEC07_Parity_Lab.py`, `test_BT_SEC07_Parity_Lab.py`, `LEEME_BT_SEC07_PARITY.md`.
- **QA asistente:** 32/32 pruebas sintéticas PASS (también 32/32 al descomprimir a carpeta nueva); integridad ZIP/testzip PASS. Docker real del usuario y snapshot real NO fueron accedidos desde el entorno del asistente.
- Conserva y **verifica el SHA** del programa base **ya usado con éxito** `$HOME\BT-SEC07-SUPABASE-ISOLATED-RESTORE\BT_SEC07_Supabase_Isolated_Restore.py` = `9a5ff6167552814ba84bd1ea31242a9b11eb77e58f5a5e4edd3c20f80be7cdb0`; también reutiliza su inventario V2 SHA-fijado.
- Requiere `BT_SEC07_ALLOW_PARITY_LAB=AUTORIZO` como autorización **nueva e independiente**. Solo debe establecerse temporalmente en PowerShell con restauración `finally`.

## 3. Qué comprobaría, y qué jamás certifica

A partir del mismo backup GPG, en **UN** nuevo contenedor Docker local y desconectado, usando exactamente el procedimiento base de restore que ya pasó, verifica:
1. PostgreSQL imagen `supabase/postgres:17.12.0.002` digest conocido, GPG/TOC y 4 extensiones (comparadas primero por control y **después** por catálogo `pg_extension` de la base restaurada).
2. 12 tablas públicas observadas previamente; al menos 8 tablas en esquemas privados `bt_*` según auditoría del snapshot; tablas con RLS y FORCE RLS privado, cantidad de políticas, funciones y secuencias en el alcance.
3. Restricciones no validadas e índices no válidos, sin publicar nombres u otros metadatos privados.
4. Lectura `COUNT(*)` de tablas físicas bajo `public`/`bt_*`, con `ONLY` para evitar doble conteo de herencia y comprobar antes que el usuario local tiene `SUPERUSER/BYPASSRLS`. Solo se emiten conteos **agregados por clase**, sin filas, RUT, SQL, nombres ni correos.
5. Ausencia de contenedor temporal restante; comprobación posterior de SHA256 inmutables de `database.dump.gpg` y `manifest.json` incluso cuando el ensayo genera error.

**Importante: jamás afirmar**:
- que esos conteos coincidan con el estado actual alojado en Supabase (requiere una comparación diferente y autorización);
- que propietarios, GRANT, privilegios y roles reales se hayan recuperado, ya que el restore base usa `--no-owner --no-acl` y roles NOLOGIN placeholders;
- que catálogos RLS sustituyan pruebas negativas de acceso real entre talleres, mecánico/admin/creador;
- que se recuperaron OAuth, autenticación de proveedores, Storage **bytes**, Edge Functions/secretos, Render y otros servicios;
- que un código 0 del laboratorio equivalga a recuperación integral;
- que haya que modificar `restoration_verified=false` del manifiesto.

**Sin autorización todavía:** paquete listo y QA sintética PASS. NO se ha realizado la segunda restauración local. El propietario puede autorizarla explícitamente cuando ejecute el bloque PowerShell del chat.

## 4. Matriz de errores, soluciones y prevención para no repetir jornadas fallidas

| Incidente / evidencia | Causa o alcance demostrado | Solución / control para evitar recurrencia | Estado |
|---|---|---|---|
| `DOCKER_LINUX_NOT_READY` | Docker Desktop no había sido iniciado | Abrir Docker Desktop y validar Engine Linux antes de paquetes que usan Docker; nunca reinstalar por este error aislado | Resuelto |
| `ARCHIVE_TOC_NOT_READABLE` V1 | Lector `pg_restore --list` Windows terminó no cero por razón no clasificada | Inventario V2 traslada lectura binaria a PostgreSQL 17 **Docker Linux**, evitando ese flujo; no declarar corrupción por error genérico | Solución práctica validada, causa histórica concreta no demostrada |
| `EXTENSION_UNAVAILABLE` en `postgres:17` | Faltaba uno de cuatro archivos de control de extensiones | Usar imagen Supabase PG17 digest fijado, comparar TOC y catálogo antes de restaurar; no eliminar extensiones del dump | Resuelto en ensayo |
| `pg_restore=OK` pero solo 12 tablas contadas | El script anterior solo medía presencia de tablas, no paridad de datos/seguridad | Nuevo ensayo focalizado de catálogos/RLS/índices/restricciones y conteos agregados con FAIL cerrado; no repetir solo el mismo test | Nuevo control preparado |
| `pg_restore --no-owner --no-acl` | Propietarios y GRANT no se recrearon deliberadamente | Marcar ACL/grants como NO VERIFICADOS; plan oficial de roles/schema/data separado antes de certificar recuperación total | Abierto |
| Histórico `roles.sql.gpg` descifra 0 bytes | Cifrado válido de salida SQL vacía | Nunca tratar GPG exit 0 como backup válido sin comprobar bytes y SQL recuperable; conservar archivo defectuoso sin sobrescribir | Abierto |
| GNUPGHOME por defecto sin privada | Anillo equivocado | Usar almacén histórico aislado y restaurar variables de proceso en `finally` | Resuelto |
| Google Drive OAuth | Flujo incompatible con decisión vigente | **Fuera del roadmap**; workflows legados no ejecutar, limpieza futura autorizada separada | Excluido |

Cada futuro fallo debe constar en el registro con: salida `BT_SEC07_*` limpia, componente, hipótesis vs causa probada, fuente/versión y SHA, intentos previos, corrección, nueva prueba, recursos que no se tocaron y criterio para no repetir.

## 5. Próxima operación en PC

Descargar ZIP a Descargas; comprobar SHA256 `795b7d2f38b43bd817f4c63e11770a8f4f8c8ccf33c791afa1d9583847c31cf8`, extraer a **nueva carpeta** `$HOME\BT-SEC07-PARITY-LAB-V1`; ejecutar 32 tests con `python -B -m unittest -q test_BT_SEC07_Parity_Lab.py`; si aprueba, pedir autorización `AUTORIZO`; seleccionar GNUPGHOME histórico solo durante ejecución, ejecutar `python -B BT_SEC07_Parity_Lab.py`, restaurar variables y recoger exclusivamente etiquetas `BT_SEC07_*`/`DIAG_EXIT_CODE`. **Si falla, NO repetir ensayo por reflejo ni borrar volúmenes/contenedores genéricamente**.

**Estado de salida actual:** R1 y restore lógico R2 de alcance anterior PASS; R2 paridad estructural PENDIENTE de PC; R3 roles/Auth/Storage/Edge y R4 matriz seguridad multitenant PENDIENTES; R5 segunda copia externa no-Drive PENDIENTE; `BT-PILOT-QA-04 A REPASAR`.

No cambia Supabase/Render, roles SQL de producción, GPG, Docker ni respaldos existentes. Este checkpoint es solo documental, se publica con `[skip render]`.

## BT-SEC07-PARITY-SQL-INC-24 · El laboratorio V1 se ejecutó y falló después de restore — estado corregido

**Dejar de describir como «no ejecutado» el paquete V1**. El propietario lo ejecutó con nueva autorización; GPG/pg_restore OK, contenedor limpio, backup intacto; primer SQL métricas falló `STOP: PARITY_QUERY_FAILED`. Causa de código verificada: `physical_tables` referenciado pero no definido. V2 preparada con 40/40 QA y preflight SQL antes de restauración, **Windows real pendiente**. [Incidente/solución/código](CHECKPOINT_BT_SEC07_PARITY_SQL_INC_20261120.md). La paridad sigue NO CERTIFICADA.
