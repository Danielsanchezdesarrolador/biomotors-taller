> **INC-44 / CORRECCIÓN POSTERIOR (20/11/2026):** El V1 de este checkpoint se ejecutó en Windows y devolvió `SESSION_TLS_NOT_CONFIRMED` **DESPUÉS** de completar consulta SQL PG17/read-only, porque usaba `pg_stat_ssl.ssl` del backend de pooler como evidencia del tramo PC->pooler. El resultado backend era FALSE; esto **no valida ni refuta TLS del PC al pooler**. V1 OBSOLETO, no repetir. V2 privada con `psql \\conninfo` en mismo proceso, 35/35 tests sintéticos PASS, **WINDOWS V2 NO AUTORIZADO AÚN**. [Checkpoint 44](CHECKPOINT_BT_SEC07_R3_READONLY_TLS_BACKEND_FALSE_FIX_PREP_20261120.md).

# CHECKPOINT — BT-SEC07-R3-READONLY-CONNECTION-PREP-43 · primera conexión real de diagnóstico, permiso acotado y procedimiento preparado

**Fecha:** 20/11/2026 (Chile) · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama única:** `main` · **HEAD de referencia antes del commit:** `8443149a61d573ffdd4bc1fec097a3e5705ce97a`. **Consentimiento recibido:** «autorizo» a realizar una primera comprobación controlada de conexión a Supabase **solo lectura**, sin generar archivos de respaldo ni modificar datos; autorización previa de CP42 solo cubría inventario local y quedó cerrada.

## 1. Fronteras de la nueva autorización y continuidad

**Sí permitido ahora:** en el PC del propietario, elegir **el script original** `bytetorque_respaldo_local.py` (solo lectura estática con AST, **sin ejecutarlo**); identificar la URL/host/usuario de pooler de sesión ya usados por el propietario **en memoria**; validar CA **público** local bajo `BT-Secrets`; solicitar la contraseña en la terminal local de forma oculta; iniciar **una** conexión `psql.exe` con SSL `verify-full`, tiempos de espera y transacción SQL `BEGIN TRANSACTION READ ONLY`; ejecutar exclusivamente una consulta SELECT constante para verificar identidad de base/rol, versión mayor y TLS. El secreto se entrega a `psql` mediante el entorno efímero del proceso hijo `PGPASSWORD`, **nunca en argv ni archivo .pgpass**. El proceso puede generar registros/estadísticas normales de conexión de PostgreSQL; no solicita escrituras SQL ni operaciones API.

**No autorizado:** exportar roles, ejecutar `pg_dumpall` o `pg_dump`, SQL de escritura, alteraciones/GRANT/DDL/migraciones, generar/restaurar backups, usar GPG histórico, cambiar secrets/ACL persistentes, desplegar Render, cambiar visibilidad GitHub o Drive. **No utilizar `supabase db dump --remote=<ref>`**: CLI puede crear login-role temporal en ciertos modos. Para esta primera verificación se elige **psql directo**, que no llama a la API Supabase de provisión de login-role.

La documentación previa [CP42](CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_WINDOWS_PASS_20261120.md) confirmó cuatro binarios cliente PG17 en ruta estándar, Node/NPX y **exactamente un** archivo candidato `.pem/.crt/.cer` en `BT-Secrets` sin validar; autenticación/TLS de origen seguían SIN PROBAR. R2 backup principal GPG+pg_restore estructura aislada PASS, llave secreta en GPG aislado histórico, no repetir. Viejo `roles.sql.gpg` SQL 0, causa `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` original desconocida. Suite mock 18/18, GPG efímero 14/14, integrado 15/15, lector metadata V2 y R2 ya PASS; **no repetirlos**. Piloto `BT-PILOT-QA-04 A REPASAR`; Drive excluido.

## 2. Estudio del exportador original y diseño de conexión de solo lectura

Se recuperó vía Files el texto del archivo previo del propietario `bytetorque_respaldo_local.py` (no su copia ejecutable en PC). Se comprobó que define estáticamente `HOST`, `PORT`, `DB`, `PROJECT` y `USER='postgres.'+PROJECT`; el origen histórico usa el **pooler de sesión, puerto 5432**, `PGSSLMODE='verify-full'`, `PGSSLROOTCERT`, `PGOPTIONS=default_transaction_read_only=on`. **No se extrajo ni publicó en GitHub el project-ref, hostname efectivo adicional, contraseña ni ruta privada.** La herramienta no importa/ejecuta el exportador: usa `ast.parse` para aceptar solamente las asignaciones conocidas y falla cerrado si host/puerto/DB/formato de proyecto/user no concuerdan.

Se revisó código oficial Supabase CLI v3.0.0, [db-config.layer.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/db-config.layer.ts) y [target/remote-value.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/target/remote-value.ts): modos linked/ref pueden provisionar login-role temporal; `DbUrl` no requiere esa capa. Aquí se evita por completo CLI, usando `psql` del cliente PG17 y un SELECT explícito.

**Certificado:** el script exige exactamente un candidato no-symlink bajo `%USERPROFILE%\BT-Secrets` (raíz o 1 subdirectorio), extensión `.crt/.cer/.pem`, archivo de hasta 1 MB, marca PEM CERTIFICATE y ninguna marca PRIVATE KEY, y carga exitosa con `ssl.create_default_context(cafile=...)`. **Esto no prueba cadena/hostname por sí solo:** la conexión `PGSSLMODE=verify-full` obliga al cliente PostgreSQL a comprobarlos durante el handshake. **Pueden existir CA válidos fuera de este árbol; si ausencia/multiplicidad, STOP sin buscar en todo el PC**.

**Credencial:** `getpass` pide clave localmente. `PGPASSWORD` solo en dict del subproceso (no en entorno persistente del shell ni línea de comandos). **Limitación:** el secreto subsiste transitoriamente en RAM de Python y psql, no promete borrado forense ni resiste administrador/malware del equipo. Sin `.pgpass` en disco para este control. Nunca enviar valor ni captura a chat.

**Transacción/consulta fija:** `psql.exe --no-psqlrc --no-password --tuples-only --no-align --set=ON_ERROR_STOP=1 --command` con `BEGIN TRANSACTION READ ONLY; SELECT current_database(),current_user,current_setting('transaction_read_only'),current_setting('server_version_num'),pg_stat_ssl de backend propio; COMMIT;`. Solo SELECT de metadatos agregados del servidor actual, sin enumeración de roles, clientes ni tablas. `PGOPTIONS` establece además `default_transaction_read_only=on`, statement_timeout y lock_timeout. `PGCONNECT_TIMEOUT=8`; timeout total 35 s; stderr del proceso queda suprimido, stdout SQL se analiza en RAM y **no se imprime**. El rol SQL del backend puede ser `postgres` aunque el login externo del pooler use `postgres.<project>`: el parser acepta ambos con DB=postgres, mayor PG17, read_only ON y pg_stat_ssl true.

**La identidad de proyecto NO se comprueba independientemente** contra Dashboard/API: el preflight únicamente observa consistencia con el script original local y certificado/hostname, no prueba que sea el tenant de producción que el titular espera. No hacer `SELECT` de datos privados.

## 3. Artefacto privado y resultados offline auténticos

**ZIP (solo en canal ChatGPT, NO en GitHub):** `BT_SEC07_R3_READONLY_CONN_20261120.zip`, SHA-256 `ea7a7d53208b63481c8cb69462ed152ee4fb0c69b08af8528cac59947c5f7f35`, tamaño **8903 bytes**.

Contenido: `README.md`, `bt_sec07_readonly_connection.py`, `test_bt_sec07_readonly_connection.py`. Código Python standard-library, sin `supabase`, `psycopg` ni dependencias externas. **24/24 pruebas nuevas offline PASS** antes de empaquetar y **24/24 PASS tras extraer ZIP en un directorio temporal**. Casos: lectura AST sin ejecutar código ajeno, host/puerto/proyecto/user no autorizados, configuración dinámica, archivo fuente incorrecto, alcance de carpetas CA, symlinks, certificado no público/erróneo, filtro PG* preexistente, ausencia de contraseña en argv, SQL no mutante, respuesta positiva simulada, backend-user de pooler, RC no cero, TLS no, transacción no read-only, identidad inesperada, versión de servidor, respuesta malformada, timeout y cierre fallido. **Todas las respuestas psql de laboratorio son simuladas; NO conexión real desde entorno asistente.**

**Limitación de archivo fuente:** se inspeccionó su texto a través de Files pero la copia raw-byte no estuvo accesible para materialización; la prueba AST sobre fuente exacta del PC se realizará cuando el propietario lo seleccione. No se incluyó el archivo del propietario, su project-ref o su password en el ZIP. Si el archivo está ausente/renombrado/con otros campos, el script falla con un marcador seguro, en lugar de adivinar.

## 4. Único bloque autorizado para Windows

Descargar ZIP a Descargas. Verificar SHA antes de extraer. La ejecución abre selector GUI para elegir **`bytetorque_respaldo_local.py` ORIGINAL** — NO correr el script original, NO elegir ZIP/candidato nuevo. Extraer únicamente el nuevo lector de conexión en TEMP. CA se detecta automáticamente en `BT-Secrets`, se valida sin revelar su ruta. Si están listos, la consola pedirá la contraseña PostgreSQL; **escribirla solo allí, no compartirla con ChatGPT**. Enviar luego exclusivamente líneas `BT_SEC07_*`, sin pantallazos que muestren campos.

```powershell
& {
    $zip = Join-Path $env:USERPROFILE 'Downloads\BT_SEC07_R3_READONLY_CONN_20261120.zip'
    $expected = 'ea7a7d53208b63481c8cb69462ed152ee4fb0c69b08af8528cac59947c5f7f35'
    if (-not (Test-Path -LiteralPath $zip -PathType Leaf)) {
        Write-Host 'BT_SEC07_RO_ZIP: NOT_FOUND'; return
    }
    if ((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash -ine $expected) {
        Write-Host 'BT_SEC07_RO_ZIP: HASH_MISMATCH'; return
    }
    Write-Host 'BT_SEC07_RO_ZIP: VERIFIED'
    $py = Get-Command py.exe -ErrorAction SilentlyContinue
    $python = Get-Command python.exe -ErrorAction SilentlyContinue
    if (-not $py -and -not $python) {
        Write-Host 'BT_SEC07_RO_PYTHON: NOT_FOUND'; return
    }
    $temp = Join-Path $env:TEMP ('BT_SEC07_RO_' + [guid]::NewGuid().ToString('N'))
    $entered = $false
    try {
        Expand-Archive -LiteralPath $zip -DestinationPath $temp -ErrorAction Stop
        Push-Location $temp
        $entered = $true
        if ($py) {
            & $py.Source -3 -B .\bt_sec07_readonly_connection.py
        } else {
            & $python.Source -B .\bt_sec07_readonly_connection.py
        }
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'BT_SEC07_RO_WINDOWS: STOP'
        } else {
            Write-Host 'BT_SEC07_RO_WINDOWS: PASS_CONNECTION_READ_ONLY'
        }
    } catch {
        Write-Host 'BT_SEC07_RO_WINDOWS: STOP_LAUNCHER'
    } finally {
        if ($entered) { Pop-Location }
        if (Test-Path -LiteralPath $temp -PathType Container) {
            Remove-Item -LiteralPath $temp -Force -Recurse -ErrorAction SilentlyContinue
        }
    }
}
```

**Posible éxito auténtico:** `BT_SEC07_RO_ZIP: VERIFIED`, `BT_SEC07_PG17_PSQL: PRESENT`, `BT_SEC07_SOURCE_CONFIG: SAFE_STATIC_MATCH`, `BT_SEC07_CA: PUBLIC_PEM_LOADABLE_NO_TLS_YET`, `BT_SEC07_SSL_POLICY: VERIFY_FULL_AND_READ_ONLY_ENFORCED`, `BT_SEC07_TARGET: ORIGINAL_SOURCE_POOLER_5432`, `BT_SEC07_REMOTE: CONNECTED_TLS_VERIFY_FULL`, `BT_SEC07_SESSION_TLS: CONFIRMED`, `BT_SEC07_TRANSACTION_READ_ONLY: ON`, `BT_SEC07_SERVER_MAJOR: 17`, `BT_SEC07_SERVER_IDENTITY: CONSISTENT_WITH_LOCAL_SOURCE_NOT_INDEPENDENTLY_ATTESTED`, `BT_SEC07_QUERY: STATIC_SELECT_ONLY`, `BT_SEC07_ROLES_BACKUP: NOT_ATTEMPTED`, `BT_SEC07_GPG_HISTORICAL: NOT_ACCESSED`, `BT_SEC07_PRECHECK: PASS_SINGLE_READONLY_CONNECTION`, `BT_SEC07_RO_WINDOWS: PASS_CONNECTION_READ_ONLY`.

**Al detenerse:** `BT_SEC07_PRECHECK_STOP: <categoria sanitizada>` más `BT_SEC07_RO_WINDOWS: STOP`. No repetir a ciegas ni divulgar errores brutos de psql (podrían mostrar host/usuario). **No se ha ejecutado ni probado Windows todavía**, por lo que no atribuir PASS de conexión real antes de resultado propietario.

## 5. Próximo paso y traspaso

Tras recibir resultados, documentar el resultado exacto en nuevo checkpoint `main` con `AGENTS/agent/roadmap` e informe de incidentes, preservar autorización. Si PASS, ese permiso se agota: **NO iniciar `supabase db dump` ni `pg_dumpall` con roles reales sin nueva autorización expresa**, tampoco GPG histórico o restore. Si STOP, clasificar con código sanitario y realizar corrección focalizada, no otra batería de labs. GPG histórico ya identificó secreta coincidente; no reconstruir.

> Prompt para migrar de chat: «Continúa ByteTorque SEC-07 desde `main`, verifica HEAD y lee `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_CONNECTION_PREP_20261120.md` e informe. Propietario autorizó primera conexión **solo lectura** a Supabase, sin dump/migraciones/cambios. Preparado ZIP privado `BT_SEC07_R3_READONLY_CONN_20261120.zip` SHA256 `ea7a7d53208b63481c8cb69462ed152ee4fb0c69b08af8528cac59947c5f7f35`, 8903B, parser AST de script original y CA público, contraseña local `getpass` transmitida como `PGPASSWORD` solo al psql hijo, `verify-full`, `PGOPTIONS default_transaction_read_only` y `BEGIN TRANSACTION READ ONLY` + SELECT fijo sin datos de clientes. 24/24 tests nuevos OFFLINE PASS y 24 PASS ZIP extraído, **Windows real PENDIENTE**. Usuario deberá seleccionar en GUI el `bytetorque_respaldo_local.py` original y escribir contraseña solo en PC; compartir `BT_SEC07_*`. Si falla STOP, no repetir ciegamente ni mostrar stderr. NO usar Supabase CLI linked/ref que podría crear rol temporal, NO ejecutar original, ni backups/roles/grants/GPG/restore sin otra autorización. Suites 18/14/15 y R2 cerradas, GPG aislado histórico secreta verificada, roles.sql.gpg antiguo SQL0. Piloto A REPASAR, Drive fuera. Cerrar con checkpoint + incidentes.»
