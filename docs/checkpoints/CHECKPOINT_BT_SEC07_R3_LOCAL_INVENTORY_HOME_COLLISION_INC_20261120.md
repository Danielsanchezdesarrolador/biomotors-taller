# CHECKPOINT — BT-SEC07-R3-LOCAL-INVENTORY-INC-35 · Colisión PowerShell $HOME y corrección acotada

**Fecha:** 20/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama exclusiva:** `main` · **HEAD base:** `a45a1ee41298971e2d1742e105b3acfbac147af4`. **Trabajo:** diagnóstico de salida real del propietario, revisión de código PowerShell y documentación externa del comportamiento de variables automáticas de PowerShell, preparación de corrección acotada sin ejecutar en Windows. **Ninguna operación Supabase, PostgreSQL, backup, GPG real ni claves realizada por el asistente**.

## 1. Evidencia real recibida en Windows

El inventario anterior, autorizado únicamente para inspección local y sin acceso a DB, produjo:
```text
BT_SEC07_ENV_PGHOST: NOT_SET
BT_SEC07_ENV_PGPORT: NOT_SET
BT_SEC07_ENV_PGDATABASE: NOT_SET
BT_SEC07_ENV_PGUSER: NOT_SET
BT_SEC07_ENV_PGSERVICE: NOT_SET
BT_SEC07_ENV_PGSERVICEFILE: NOT_SET
BT_SEC07_ENV_PGPASSFILE: NOT_SET
BT_SEC07_ENV_PGPASSWORD: NOT_SET
BT_SEC07_ENV_PGSSLMODE: NOT_SET
BT_SEC07_ENV_PGSSLROOTCERT: NOT_SET
BT_SEC07_ENV_SUPABASE_DB_PASSWORD: NOT_SET
BT_SEC07_ENV_SUPABASE_ACCESS_TOKEN: NOT_SET
BT_SEC07_ENV_GNUPGHOME: NOT_SET
BT_SEC07_TLS_ENV_VERIFY_FULL: NO_OR_UNSET
BT_SEC07_DEFAULT_PGPASS_FILE: ABSENT
BT_SEC07_DEFAULT_PGSERVICE_FILE: ABSENT
BT_SEC07_CUSTOM_PGPASS_FILE: ABSENT
BT_SEC07_CUSTOM_PGSERVICE_FILE: ABSENT
BT_SEC07_CUSTOM_PGSSLROOTCERT_FILE: ABSENT
BT_SEC07_GPG_COMMAND: FOUND
BT_SEC07_LOCAL_INVENTORY: FAILED_NO_DB_ACCESS
```

Estos `NOT_SET` son valores de **entorno del proceso actual**, no un hallazgo de que el ordenador carezca de credenciales o que el respaldo previo ya no sea recuperable. Las rutas `ABSENT` son solo las rutas predeterminadas o variables del proceso revisadas; archivos privados previos de una sesión distinta u otra configuración NO fueron descartados. `TLS_ENV_VERIFY_FULL: NO_OR_UNSET` **no comprueba** TLS real de una conexión, que no ocurrió. El inventario nunca llegó a mostrar `GPG_HOME` ni conteos; GPG binario sí estaba disponible.

## 2. Incidente real y causa comprobada en código

**ID:** `BT-SEC07-LOCAL-INV-HOME-RO-35`; **componente:** inventario PowerShell del asistente, no servicio GnuPG/PostgreSQL. El script de checkpoint 34 contenía `$home = $null` inmediatamente después de `BT_SEC07_GPG_COMMAND: FOUND`. En PowerShell los nombres de variables ignoran mayúsculas y minúsculas, así que `$home` es la variable automática **`$HOME` de solo lectura**. Asignar `$null` lanza error y el bloque `catch` anterior capturó sin detallar, imprimiendo `FAILED_NO_DB_ACCESS`. **Causa demostrable por inspección de código y semántica documentada**; el propietario no aportó el texto interno de excepción (que fue deliberadamente ocultado). No inferir corrupción de keyring ni permiso GPG insuficiente. Referencia: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_automatic_variables?view=powershell-5.1

**Solución propuesta:** reemplazar variable `$home` por `$gpgHomePath`, consultar solamente el GPG homedir efectivo con `gpgconf --list-dirs homedir` (sin publicar ruta), contemplar fallback a `%APPDATA%\gnupg`, validar que existe **antes** de invocar `gpg --list-keys`, contar claves `pub/sec` con salida filtrada en memoria; ninguna exportación de claves o acceso DB. `--no-auto-check-trustdb` minimiza operaciones automáticas de trustdb; GnuPG puede consultar agente/metadatos internos, no hacer pasar el listado por auditoría forense de no escritura.

## 3. Bloque correctivo ÚNICO en Windows — NO repetición del inventario PG

El inventario `PG*` anterior se conserva como evidencia, **no repetir**. El siguiente comando inspecciona SOLO GPG y muestra únicamente `GPG_HOME_SOURCE` categórico, `GPG_HOME`, `GPG_PUBLIC_KEYS_COUNT`, `GPG_SECRET_KEYS_COUNT` y marcador final; ningún valor secreto, ruta, fingerprint, key ID o nombre. **No intenta crear un GNUPGHOME si falta**. `gpgconf` se usa para evitar suponer que todas las instalaciones Windows emplean APPDATA (existen configuraciones en el Registro o portables).

```powershell
& {
    $ErrorActionPreference = 'Stop'
    try {
        $gpgCommand = Get-Command gpg.exe -ErrorAction Stop
        $gpgHomePath = $null
        $homeSource = 'UNRESOLVED'

        $configuredGpgHome = [Environment]::GetEnvironmentVariable('GNUPGHOME', 'Process')
        if (-not [string]::IsNullOrWhiteSpace($configuredGpgHome)) {
            $gpgHomePath = $configuredGpgHome
            $homeSource = 'ENV'
        }
        else {
            $gpgConfCommand = Get-Command gpgconf.exe -ErrorAction SilentlyContinue
            if ($gpgConfCommand) {
                $rawHome = @(& $gpgConfCommand.Source --list-dirs homedir 2>$null)
                if ($LASTEXITCODE -eq 0 -and $rawHome.Count -eq 1) {
                    $candidate = [Uri]::UnescapeDataString(([string]$rawHome[0]).Trim())
                    if ([IO.Path]::IsPathRooted($candidate)) {
                        $gpgHomePath = $candidate
                        $homeSource = 'GPGCONF'
                    }
                }
            }
            if ([string]::IsNullOrWhiteSpace($gpgHomePath) -and
                -not [string]::IsNullOrWhiteSpace($env:APPDATA)) {
                $gpgHomePath = Join-Path $env:APPDATA 'gnupg'
                $homeSource = 'APPDATA_FALLBACK'
            }
        }

        Write-Host ('BT_SEC07_GPG_HOME_SOURCE: ' + $homeSource)

        if ([string]::IsNullOrWhiteSpace($gpgHomePath) -or
            -not (Test-Path -LiteralPath $gpgHomePath -PathType Container)) {
            Write-Host 'BT_SEC07_GPG_HOME: NOT_FOUND'
            Write-Host 'BT_SEC07_GPG_KEY_COUNTS: NOT_CHECKED'
            Write-Host 'BT_SEC07_GPG_INVENTORY: STOP_HOME_UNRESOLVED_NO_DB_ACCESS'
            return
        }

        Write-Host 'BT_SEC07_GPG_HOME: PRESENT'

        $publicEntries = @(
            & $gpgCommand.Source --homedir $gpgHomePath --batch --no-auto-check-trustdb --with-colons --list-keys 2>$null
        )
        $publicExit = $LASTEXITCODE

        $secretEntries = @(
            & $gpgCommand.Source --homedir $gpgHomePath --batch --no-auto-check-trustdb --with-colons --list-secret-keys 2>$null
        )
        $secretExit = $LASTEXITCODE

        if ($publicExit -ne 0 -or $secretExit -ne 0) {
            Write-Host 'BT_SEC07_GPG_KEY_COUNTS: ERROR'
            Write-Host 'BT_SEC07_GPG_INVENTORY: FAILED_NO_DB_ACCESS'
            return
        }

        $publicCount = @($publicEntries | Where-Object { $_ -match '^pub:' }).Count
        $secretCount = @($secretEntries | Where-Object { $_ -match '^sec:' }).Count
        Write-Host ('BT_SEC07_GPG_PUBLIC_KEYS_COUNT: ' + $publicCount)
        Write-Host ('BT_SEC07_GPG_SECRET_KEYS_COUNT: ' + $secretCount)
        Write-Host 'BT_SEC07_GPG_INVENTORY: COMPLETE_NO_DB_ACCESS_NO_SECRET_VALUES_PRINTED'
    }
    catch {
        Write-Host 'BT_SEC07_GPG_INVENTORY: FAILED_NO_DB_ACCESS'
    }
}
```

**Estado:** script preparado/documentado, **PENDIENTE de ejecución Windows**. Resultado esperado cuando el almacén existe y es legible: `BT_SEC07_GPG_INVENTORY: COMPLETE_NO_DB_ACCESS_NO_SECRET_VALUES_PRINTED`; si es `NOT_FOUND`, `ERROR` o `FAILED`, STOP y diagnosticar sin repetir ni divulgar identificadores. `PUBLIC_KEYS_COUNT` y `SECRET_KEYS_COUNT` no prueban por sí mismos que la clave privada correcta para el snapshot esté disponible; se requerirá comparación local sin exponer huellas, mediante autorización específica posterior.

## 4. Impacto, límites y siguiente paso

- **Modificación real:** únicamente documentación `main`, commit `[skip render]`; checkpoint 34 queda marcado como SUPERADO para que futuros chats no copien su script defectuoso. Ninguna alteración de respaldos, manifiestos, keyrings, origen Supabase, Docker, Render, GH Actions, roles ni conexiones.
- **Incidentes anteriores:** `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` de `pg_dumpall` sigue abierto; `roles.sql.gpg` antiguo descifra 0 bytes. No reexportar ni declarar esto resuelto por detección de GPG.
- **Progreso:** mock 18/18, GPG real efímero 14/14, integrado 15/15, todos PASS en PC y cerrados; CLI 3.0.0 flags PASS. R2 snapshot paridad solo estructural PASS. R3 roles/owners/grants/ACL y configuración efectiva real **PENDIENTES**; `BT-PILOT-QA-04 A REPASAR`. Google Drive fuera.
- **Siguiente paso:** recibir marcadores `BT_SEC07_GPG_*` del bloque corregido; documentar resultado y separar autorización para keyring histórico/DB remoto/dump/restore. No hacer comandos de conexión todavía.

## 5. Prompt de mudanza de chat

> Continúa ByteTorque SEC-07 desde `main`; lee `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_LOCAL_INVENTORY_HOME_COLLISION_INC_20261120.md`, `docs/BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md` y el informe de incidentes. Confirma HEAD. Usuario autorizó únicamente inventario local sin secretos ni DB. Primer PowerShell inventarió `PG*=NOT_SET`, config defaults `ABSENT`, `GPG_COMMAND: FOUND`, luego falló por **colisión `$home` con automática read-only `$HOME`** en script del asistente. Se prepara bloque correctivo SOLO GPG usando `$gpgHomePath` + homedir resuelto con `gpgconf`, seguro y sin imprimir rutas. **Windows pendiente**; pedir marcadores. No repetir QA 18/14/15, no reinstalar, no exportar roles/descifrar ni conectar a Supabase sin nuevas autorizaciones. Viejo roles.sql.gpg 0 bytes, R2 snapshot estructura PASS, roles/ACL pendientes, Drive fuera, piloto A REPASAR. Cerrar cada paso con checkpoint y commit documental.
