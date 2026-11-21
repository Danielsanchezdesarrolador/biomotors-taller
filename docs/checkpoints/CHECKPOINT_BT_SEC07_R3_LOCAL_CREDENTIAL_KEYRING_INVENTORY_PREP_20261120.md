# CHECKPOINT — BT-SEC07-R3-LOCAL-INVENTORY-PREP-34 | Configuración de conexión y claves existentes: consentimiento delimitado

**Fecha:** 20/11/2026 · **Repo:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main` · **HEAD leído al preparar:** `b9ae5a3b481bc27ee7a55561c209c3c6ad503b07`. **Naturaleza:** autorización del propietario + preparación de un preflight local, **todavía NO ejecutado en Windows**. No autoriza copia, exportación, descifrado, conexión a origen o mutación.

## 1. Consentimiento expresamente recibido

El propietario respondió `autorizo` a la pregunta: «¿autorizas que revisemos localmente la configuración de conexión y las claves GPG existentes, sin mostrar secretos, generar respaldos ni conectarnos todavía a Supabase?». Por tanto, el alcance es **sólo lectura/inventario local** de la configuración PostgreSQL/libpq y del listado de claves públicas y privadas existentes **sin exportarlas ni utilizarlas para cifrar/descifrar/firmar**. El asistente **no tiene acceso directo al PC Windows**: debe facilitar un único bloque que el usuario ejecute y recoger sólo marcadores sanitizados. Nada de consultas API/SQL a Supabase, pg_dumpall, backups, migraciones, Render, keyring export, clonación de GPG home o Google Drive.

## 2. Continuidad leída y pasos cerrados (NO repetir)

Se revisaron `AGENTS.md`, `agent.md`, `roadmap.md`, checkpoint R3 combinado 33, contrato de roles reales y el informe histórico. Laboratorio transporte mock 18/18 PASS Windows; GPG con clave efímera 14/14 PASS Windows; productor simulado→GPG efímero 15/15 PASS Windows; CLI v3.0.0 flags `FILE, ROLE_ONLY, REMOTE, DATA_ONLY` PASS. **Ninguno de estos tests contiene roles reales**. `--role-only` usa `pg_dumpall --no-role-passwords`; aun con exit=0 puede producir solo `RESET ALL;` tras filtrar reservados. En ciertas rutas de project-ref/linked sin contraseña, CLI puede crear un login role remoto `read_only:false`; NO invocar ese método antes de revisar credenciales y consentimiento. R2 snapshot estructural PASS; viejo `roles.sql.gpg` SQL 0 bytes; roles/owners/ACL siguen pendientes, piloto `BT-PILOT-QA-04 A REPASAR`, Drive excluido.

## 3. Script PowerShell propuesto para ejecutar UNA SOLA VEZ en el equipo del propietario

- Inspección de **presencia**, no contenido ni valores, de variables `PG*`, `SUPABASE_DB_PASSWORD`, `SUPABASE_ACCESS_TOKEN`, `GNUPGHOME`.
- Comprueba sólo **existencia** de `%APPDATA%\postgresql\pgpass.conf`, `pg_service.conf` y rutas configuradas con variables de archivo sin exponer rutas.
- Para GPG, si el almacén existe: invoca **solo listados de metadatos** de claves públicas y secretas, con `--with-colons`; capta todos los detalles en RAM y muestra **únicamente cantidades**. No imprime nombre, UID, correo, fingerprint, key-id, rutas o contenido. La utilidad puede consultar su agente local o gestionar metadatos internos; **no importa, genera, elimina, cifra ni descifra claves**. Nunca pegar salida original de `gpg --list-keys` en chat.
- `PGSSLMODE=verify-full` ambiental se marca como indicador, **NO demuestra el TLS efectivo** si URL/servicio lo sobreescribe.
- `PRESENT` en `pgpass.conf` no garantiza usuario/host ni permisos válidos; `GPG_SECRET_KEYS_COUNT>0` no prueba que se posea la clave del backup; `SUPABASE_ACCESS_TOKEN=SET` no autoriza tocar la API.
- PowerShell usa `$env:APPDATA` para GPG home por defecto; si GPG está instalado con configuración de home no estándar sin `GNUPGHOME`, podría mostrar `NOT_FOUND` falsamente. Reconciliar sin mostrar rutas completas.
- Nunca incluir contraseñas, URL de conexión, huellas, claves GPG privadas, SQL ni archivos ZIP en repositorio/chat. La salida solo con indicadores.

```powershell
& {
    $ErrorActionPreference = "Stop"
    function Show-Status([string]$name, [string]$state) {
        Write-Host ("BT_SEC07_{0}: {1}" -f $name, $state)
    }
    function Has-Value([string]$value) {
        return (-not [string]::IsNullOrWhiteSpace($value))
    }
    function Check-File([string]$name, [string]$path) {
        $exists = $false
        if (Has-Value $path) {
            try { $exists = Test-Path -LiteralPath $path -PathType Leaf -ErrorAction Stop }
            catch { $exists = $false }
        }
        Show-Status $name $(if ($exists) { "PRESENT" } else { "ABSENT" })
    }
    try {
        foreach ($name in @("PGHOST","PGPORT","PGDATABASE","PGUSER","PGSERVICE","PGSERVICEFILE","PGPASSFILE","PGPASSWORD","PGSSLMODE","PGSSLROOTCERT","SUPABASE_DB_PASSWORD","SUPABASE_ACCESS_TOKEN","GNUPGHOME")) {
            $value = [Environment]::GetEnvironmentVariable($name, "Process")
            Show-Status ("ENV_" + $name) $(if (Has-Value $value) { "SET" } else { "NOT_SET" })
        }
        $mode = [Environment]::GetEnvironmentVariable("PGSSLMODE", "Process")
        Show-Status "TLS_ENV_VERIFY_FULL" $(if ($mode -ieq "verify-full") { "YES" } else { "NO_OR_UNSET" })
        $appdata = [Environment]::GetEnvironmentVariable("APPDATA", "Process")
        if (Has-Value $appdata) {
            Check-File "DEFAULT_PGPASS_FILE" (Join-Path $appdata "postgresql\pgpass.conf")
            Check-File "DEFAULT_PGSERVICE_FILE" (Join-Path $appdata "postgresql\pg_service.conf")
        } else {
            Show-Status "DEFAULT_PGPASS_FILE" "UNRESOLVED"
            Show-Status "DEFAULT_PGSERVICE_FILE" "UNRESOLVED"
        }
        Check-File "CUSTOM_PGPASS_FILE" $env:PGPASSFILE
        Check-File "CUSTOM_PGSERVICE_FILE" $env:PGSERVICEFILE
        Check-File "CUSTOM_PGSSLROOTCERT_FILE" $env:PGSSLROOTCERT
        $gpg = Get-Command gpg.exe -ErrorAction SilentlyContinue
        if (-not $gpg) {
            Show-Status "GPG_COMMAND" "NOT_FOUND"
            Show-Status "GPG_KEY_COUNTS" "NOT_CHECKED"
        } else {
            Show-Status "GPG_COMMAND" "FOUND"
            $home = $null
            if (Has-Value $env:GNUPGHOME) { $home = $env:GNUPGHOME }
            elseif (Has-Value $appdata) { $home = Join-Path $appdata "gnupg" }
            $homeFound = $false
            if (Has-Value $home) {
                try { $homeFound = Test-Path -LiteralPath $home -PathType Container -ErrorAction Stop }
                catch { $homeFound = $false }
            }
            Show-Status "GPG_HOME" $(if ($homeFound) { "PRESENT" } else { "NOT_FOUND" })
            if ($homeFound) {
                $pub = @(& $gpg.Source --homedir $home --batch --no-auto-check-trustdb --with-colons --list-keys 2>$null)
                $pubOk = ($LASTEXITCODE -eq 0)
                $sec = @(& $gpg.Source --homedir $home --batch --no-auto-check-trustdb --with-colons --list-secret-keys 2>$null)
                $secOk = ($LASTEXITCODE -eq 0)
                if ($pubOk) {
                    Show-Status "GPG_PUBLIC_KEYS_COUNT" ([string]@($pub | Where-Object { $_ -match "^pub:" }).Count)
                } else { Show-Status "GPG_PUBLIC_KEYS_COUNT" "ERROR" }
                if ($secOk) {
                    Show-Status "GPG_SECRET_KEYS_COUNT" ([string]@($sec | Where-Object { $_ -match "^sec:" }).Count)
                } else { Show-Status "GPG_SECRET_KEYS_COUNT" "ERROR" }
            } else { Show-Status "GPG_KEY_COUNTS" "NOT_CHECKED" }
        }
        Show-Status "LOCAL_INVENTORY" "COMPLETE_NO_DB_ACCESS_NO_SECRET_VALUES_PRINTED"
    } catch {
        Show-Status "LOCAL_INVENTORY" "FAILED_NO_DB_ACCESS"
    }
}
```

**Criterio esperado:** `BT_SEC07_LOCAL_INVENTORY: COMPLETE_NO_DB_ACCESS_NO_SECRET_VALUES_PRINTED` más estados de presencia/ausencia/conteos. Ante `FAILED_NO_DB_ACCESS` o `GPG_*_COUNT: ERROR`, **STOP**, no repetir ni usar keyring, revisar el paso que falló de manera sanitizada en siguiente chat. `NOT_SET`/ `ABSENT` no es automáticamente error: puede existir otra configuración fuera del inventario.

## 4. Próximos pasos y puertas separadas

1. **Usuario ejecuta bloque y comparte solo marcadores `BT_SEC07_*`**. No paste manual de comandos con credenciales ni listados GPG completos.
2. Registrar resultado real en otro checkpoint; derivar exactamente la vía de autenticación local que funcione sin crear roles temporales y el método seguro de seleccionar el destinatario GPG, **sin mostrar información privada**.
3. Implementar/adaptar wrapper offline contra CLI simulada; después autorización **independiente** para consultar Supabase, **independiente** para usar el keyring histórico, e **independiente** para restore aislado. `--remote=<DB URL SIN PASSWORD>` con libpq `.pgpass` y TLS es solo candidato.
4. Cuando el origen sea autorizado, el exportador deberá fallar cerrado ante productor exit !=0, 0 bytes, sólo `RESET ALL` salvo inventario legitimado, GPG/hash/readback fallidos; no publicar SQL claro, no sobrescribir respaldo viejo ni reexportar DB completa por rutina.

**Operaciones realmente efectuadas en este chat:** leer documentación GitHub y preparar instrucciones; commit documental `[skip render]` en `main`. **No ejecutado:** script de Windows, acceso a GPG original, Supabase remoto, API, DB, backups, Docker, Render, despliegue, cambio de repo o Google Drive. **Incidentes nuevos:** ninguno.

## 5. Prompt de mudanza

«Continúa ByteTorque SEC-07 en `Danielsanchezdesarrolador/biomotors-taller`, única rama `main`. Lee `AGENTS.md`, `agent.md`, `roadmap.md`, checkpoint `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_LOCAL_CREDENTIAL_KEYRING_INVENTORY_PREP_20261120.md` y contrato `docs/BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md`. Verifica HEAD. Usuario **AUTORIZÓ únicamente inventario local** de entorno PostgreSQL/libpq y listado de claves GPG, sin mostrar secretos, backup, descifrado ni conexión a Supabase. Se dejó bloque PowerShell con estados sanitizados; **esperar su salida Windows**. Tests 18/14/15 todos PASS, no repetir. No se han exportado roles reales, owners/ACL siguen abiertos, viejo roles.sql.gpg SQL 0 bytes y R2 snapshot estructura PASS; Google Drive fuera, piloto A REPASAR. Actualizar checkpoint/agent/roadmap tras resultado; separar autorizaciones de GPG real/exportación remota/restore y no publicar secretos».
