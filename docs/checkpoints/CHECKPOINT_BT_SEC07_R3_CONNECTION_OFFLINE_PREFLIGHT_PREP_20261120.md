# CHECKPOINT — BT-SEC07-R3-CONN-OFFLINE-PREP-41 · Contrato de conexión no mutante + preflight local sin red

**Fecha:** 20/11/2026 (Chile) · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main` · **HEAD anterior:** `e4ce76ed1534e2d004e93d6e91e3ce15bf8f3a4d`. **Autorización textual vigente del propietario:** «autorizo» para **preparar y comprobar localmente el método de conexión, SIN conectar a Supabase ni generar nuevos respaldos**. No se ha autorizado exportar roles reales, descifrar claves históricas nuevamente, consultar DB, restaurar, ni modificar configuración persistente.

## 1. Continuidad comprobada (sin repetir tareas)

Se releyeron `AGENTS.md`, `agent.md`, `roadmap.md`, checkpoint 40, el contrato R3 de exportación, el checkpoint de respaldo del 19/11 y el informe de errores. V2 de metadatos del respaldo real: ZIP SHA PASS, 1 destinatario público visible, coincidencia de clave pública, no privada en home **predeterminado**. Documentación previa identificó **home GPG aislado** con privada coincidente y restauración R2 del mismo snapshot `SNAPSHOT_STRUCTURE_ONLY PASS`. No es pérdida definitiva de llave ni se justifica repetir R2. Histórico `roles.sql.gpg` SQL descifrado 0 bytes; roles/owners/ACL reales siguen PENDIENTES y `BT-PILOT-QA-04 A REPASAR`. MOCK 18/18, GPG efímero 14/14 e integrado 15/15 PASS Windows; no repetir.

**Histórico del PC:** clientes PG17 comprobados mediante ruta absoluta, no necesariamente en PATH; uso de pooler de sesión 5432 y TLS `verify-full` en exportador previo; CA privado situado bajo carpeta `BT-Secrets` en el procedimiento histórico. En nueva sesión `PGHOST/PGPASSFILE/PGPASSWORD/PGSSLMODE` no estaban configuradas y rutas libpq predeterminadas ausentes, lo que no demuestra que se hayan perdido las credenciales previas: el exportador anterior usa variables/`.pgpass` temporales.

## 2. Revisión oficial fuente etiquetada Supabase CLI v3.0.0 — SOLO LECTURA, sin ejecutar CLI

Se consultaron directamente archivos oficiales:
- [target/remote-value.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/target/remote-value.ts): `--remote=<postgresql://...>` reconocido como `DbUrl`, distinto de `Ref`/`Linked`. *Keyword DSN* tipo `host=... user=...` se rechaza como valor de `--remote`; no proponer `--remote=service=...`.
- [db-config.layer.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/db-config.layer.ts): modo `db-url` no inicializa la capa API de login-role temporal que puede afectar al modo `linked/ref` sin contraseña. **No se ha probado contra ByteTorque alojado.**
- [pgpass.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/pgpass.ts) y [db-config.parse.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/db-config.parse.ts): si falta password en URL, CLI puede consultar `PGPASSWORD` o `PGPASSFILE` (con precedencia definida) y soporta `sslmode` desde URL/service/env. **No poner password en `--remote` ni `--password` o historial PowerShell**.
- [db dump command](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/commands/db/dump/dump.command.ts): `--role-only` y `--remote` disponibles; sin `--file` se prioriza stdout binario. No usar PowerShell `> roles.sql`. Descifrado, ACL, rol real y SQL de permisos no forman parte de este preflight.

**Contrato propuesto para futuro con aprobación independiente:** preparar URL PostgreSQL real con **destino previamente verificado e inequívoco** (histórico pooler sesión 5432, sin asumir identidad definitiva), **sin contraseña ni tokens** en argumentos; TLS `verify-full` con CA aprobado (aplicar `PGSSLMODE`/`PGSSLROOTCERT` en entorno acotado si CLI los propaga), credencial por `PGPASSFILE` temporal de ACL restringida o alternativa de secreto solo en memoria, bajo revisión separada. Procesar stdout productor en bytes, clasificar exit y contenido real antes de publicar ciphertext, GPG histórico con custodia aprobada, limpieza de temporales y NO sobrescribir backup. **No se creó ningún archivo con secretos.** Nada de `supabase link`, `login`, `db dump`, `pg_dumpall`, `psql`, `db push` ni API.

## 3. ZIP privado de comprobación de requisitos (SIN lectura de secretos)

`BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_20261120.zip` (**solo canal conversación, NO subir al repo**). SHA256 `37ef628d973b65a999e5be4b516ccc28c34aa311ef7600396173b0ad90e87edc`, tamaño `4973` bytes. Contiene `README.md`, `bt_sec07_connection_preflight.py`, `test_bt_sec07_connection_preflight.py`.

El script estándar Python **no importa red ni invoca comandos externos, no abre ni lee contenido de archivos, no escribe**. Únicamente:
1. Test de **existencia** de `psql.exe`, `pg_dumpall.exe`, `pg_dump.exe` y `pg_restore.exe` en `%ProgramFiles%\PostgreSQL\17\bin`. Resultado ausente solo significa «no está en ruta estándar», NO que PG esté desinstalado.
2. Presencia de `node.exe`/`npx.cmd` mediante `shutil.which`, no ejecuta Node/CLI.
3. **Cuenta** archivos con extensión `.crt/.cer/.pem` solo en `%USERPROFILE%\BT-Secrets` y **un** nivel de subdirectorios; ignora symlinks, no lee archivos y **nunca imprime nombres/rutas**. `ONE_UNVALIDATED_CANDIDATE` no prueba certificado CA, `NONE` no prueba que un CA no esté en otro lugar.
4. Comprueba un string URL PostgreSQL totalmente **ficticio** sin password y puerto 5432; no deriva host/ref reales ni secrets. Imprime `TEMP_PGPASS_STRATEGY: DESIGNED_NOT_CREATED`, `TLS_VERIFY_FULL: REQUIRED_FOR_FUTURE_NOT_TESTED`, `CLI_V3_REMOTE_DB_URL: SOURCE_REVIEWED_NOT_EXECUTED`, `SUPABASE_REMOTE: NOT_CONNECTED`, `ROLES_BACKUP: NOT_ATTEMPTED`.

**Validaciones realizadas por asistente con entradas SINTÉTICAS:** 18/18 tests nuevos PASS, incluyendo ausencia/total/parcial de clientes, recuento/alcance de posibles certificados, links no seguidos, URL sin contraseña, ausencia de ejecución remota y sanitización de salida. **18/18 PASS nuevamente tras descomprimir ZIP en TEMP**. Son **pruebas nuevas de preflight, no repetición** de las 18/14/15 suites previas. ZIP SHA recalculado. **Resultado del PC Windows: PENDIENTE**.

## 4. Única acción Windows autorizada (bloque PowerShell)

Descargar ZIP a Descargas; confirmar hash antes de extraer. Ejecutar **solo** script preflight contra metadatos ya autorizados, no suites antiguas ni tests nuevos en Windows por rutina. Envío al chat exclusivamente líneas `BT_SEC07_*`.

```powershell
& {
    $zip = Join-Path $env:USERPROFILE 'Downloads\BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_20261120.zip'
    $expected = '37ef628d973b65a999e5be4b516ccc28c34aa311ef7600396173b0ad90e87edc'
    if (-not (Test-Path -LiteralPath $zip -PathType Leaf)) {
        Write-Host 'BT_SEC07_CONN_ZIP: NOT_FOUND'; return
    }
    if ((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash -ine $expected) {
        Write-Host 'BT_SEC07_CONN_ZIP: HASH_MISMATCH'; return
    }
    Write-Host 'BT_SEC07_CONN_ZIP: VERIFIED'
    $py = Get-Command py.exe -ErrorAction SilentlyContinue
    $python = Get-Command python.exe -ErrorAction SilentlyContinue
    if (-not $py -and -not $python) {
        Write-Host 'BT_SEC07_CONN_PYTHON: NOT_FOUND'; return
    }
    $temp = Join-Path $env:TEMP ('BT_SEC07_CONN_' + [guid]::NewGuid().ToString('N'))
    $entered = $false
    try {
        Expand-Archive -LiteralPath $zip -DestinationPath $temp -ErrorAction Stop
        Push-Location $temp
        $entered = $true
        if ($py) {
            & $py.Source -3 -B .\bt_sec07_connection_preflight.py
        } else {
            & $python.Source -B .\bt_sec07_connection_preflight.py
        }
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'BT_SEC07_CONN_WINDOWS: STOP'
        } else {
            Write-Host 'BT_SEC07_CONN_WINDOWS: PASS_OFFLINE_ONLY'
        }
    }
    catch { Write-Host 'BT_SEC07_CONN_WINDOWS: STOP_LAUNCHER' }
    finally {
        if ($entered) { Pop-Location }
        if (Test-Path -LiteralPath $temp -PathType Container) {
            Remove-Item -LiteralPath $temp -Force -Recurse -ErrorAction SilentlyContinue
        }
    }
}
```

**Resultado deseado del proceso offline:** `BT_SEC07_CONN_ZIP: VERIFIED`, `BT_SEC07_PREFLIGHT: COMPLETE_LOCAL_METADATA_ONLY`, `BT_SEC07_CONN_WINDOWS: PASS_OFFLINE_ONLY`. Si falta un componente o aparecen varios candidatos TLS, no implica problema: se identifica el próximo requisito o incertidumbre. El resultado **NUNCA** justifica afirmar conexión/ACL/autenticación/certificación de roles.

## 5. Riesgos, impacto, pendientes y prompt de traspaso

**Sin incidentes nuevos** en laboratorio sintético de preparación. La causa histórica `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` permanece sin clasificación. Se respetó política de main y checkpoint. No se tocó GPG histórico, backup/manifest, SQL, GPG de roles, proyectos Supabase, Auth/RLS/Storage/Edge, Render, Actions/deploy, Drive ni visibilidad del repo. Los scripts privados viven solo en ZIP descargable de chat, GitHub recibe únicamente Markdown `[skip render]`.

**Siguiente paso:** recibir marcadores del preflight Windows; registrar su resultado exacto y, si hay dependencias disponibles, preparar la configuración de **autenticación real** sin publicar secretos para ejecución remota solo bajo nueva autorización específica. No crear claves ni backups ni cambiar endpoint por impulso.

> Prompt de migración: «ByteTorque SEC-07. Desde `main` leer `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_PREP_20261120.md` e informe incidentes. El propietario AUTORIZÓ únicamente preparar/comprobar el método local de conexión sin conectar Supabase ni backup. Fuente oficial v3.0.0 revisada: `--remote=<postgresql://...>` se resuelve a `DbUrl` sin crear login-role del modo linked; `PGPASSFILE` puede suministrar contraseña fuera de argv, TLS `verify-full` pendiente de preflight real. ZIP privado `BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_20261120.zip` SHA `37ef628d973b65a999e5be4b516ccc28c34aa311ef7600396173b0ad90e87edc`, 18 nuevas pruebas offline PASS y tras extraer PASS; **Windows PENDIENTE**. Un bloque PowerShell valida SHA, extrae en TEMP y ejecuta solo diagnóstico local; usuario comparte `BT_SEC07_*`. Ninguna clave/base/rol tocado. GPG histórico aislado ya tenía privada coincidente, R2 snapshot estructural PASS, no repetir 18/14/15 labs ni metadata. R3 roles/ACL siguen PENDIENTES, falla pg_dumpall histórica sin causa, piloto A REPASAR, Google Drive excluido. Registrar resultado y checkpoint/agent/roadmap en main; exigir nueva autorización para remoto, exportación, usar keyring y restore».
