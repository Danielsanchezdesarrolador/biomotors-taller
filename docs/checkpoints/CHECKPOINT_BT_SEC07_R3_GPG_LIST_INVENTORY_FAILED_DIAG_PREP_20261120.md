# CHECKPOINT — BT-SEC07-R3-GPG-LIST-INC-36 · GPG homedir reconocido; listado fallido sin diagnóstico de causa

**Fecha:** 20/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main` · **HEAD base:** `7273e4ab9a77862a6fea5dff092b3e1053ec7b5a`. **Tipo:** evidencia del propietario + diagnóstico de script y corrección de instrumentación PREPARADA; no ejecución Windows de corrección, no trabajo de producción.

## 1. Evidencia REAL del nuevo intento local

El usuario ejecutó el bloque corregido del checkpoint 35 y comunicó:
```text
BT_SEC07_GPG_HOME_SOURCE: GPGCONF
BT_SEC07_GPG_HOME: PRESENT
BT_SEC07_GPG_INVENTORY: FAILED_NO_DB_ACCESS
```

**Hechos:** el programa `gpgconf` resolvió una ubicación de GPG y la carpeta existe; el script alcanzó el bloque de enumeración de llaves, pero salió por `catch` genérico. **No se emitieron conteos ni diagnóstico de retorno GPG**. No se puede saber aún si falló `--list-keys`, `--list-secret-keys`, un error de PowerShell al interpretar stderr, o permisos/corrupción del almacén. Es improcedente afirmar que las claves están perdidas o que el DB falló.

## 2. Incidente, causa vs hipótesis

**INC-ID:** `BT-SEC07-GPG-LIST-UNCLASSIFIED-36`. **Estado:** ABIERTO / causa raíz NO CLASIFICADA. La instrumentación del script previo utiliza `$ErrorActionPreference='Stop'` alrededor de comandos nativos que redirigen stderr con `2>$null` y un `catch` que elimina la excepción original. **Causa CONFIRMADA de la incertidumbre diagnóstica:** error sin etapa registrada ni excepción categorizada. **Hipótesis técnica plausible, NO probada:** Windows PowerShell 5.1 puede convertir registros stderr de ejecutables externos en errores del shell; con ErrorActionPreference Stop puede abortar antes de capturar `$LASTEXITCODE`. Otras posibilidades no descartadas: problemas de permisos de GPG home, error real de `gpg --list-keys` o `--list-secret-keys`, o diferencias de PowerShell 7. A diferencia de INC-35, aquí la colisión `$HOME` ya está corregida.

**Solución propuesta y acotada:** un diagnóstico **SOLO GPG**, sin repetir PG ni los 18/14/15 tests, que indica versión MAYOR de PowerShell, éxito de `gpgconf`, home presente, conteo de claves, códigos de salida de cada listado por separado, y ante excepción solo `FAIL_PHASE` y `FAIL_CLASS`, jamás el mensaje original. Usa `$ErrorActionPreference='Continue'` restringido al bloque de script y captura stdout/stderr de GPG sin revelar datos. No escribe archivos ni realiza redirecciones de SQL, no importa/exporta/descifra claves ni conecta a DB. Este bloque solo se ejecutará en PC del propietario, no lo ha ejecutado el asistente.

## 3. Bloque PowerShell listo para ejecutar en PC

El equipo de origen ejecutará únicamente la inspección ya autorizada; no mostrar logs de GPG, nombres, rutas, UID, huellas o identificadores. La salida segura comienza `BT_SEC07_`.

```powershell
& {
    $ErrorActionPreference = 'Continue'
    $phase = 'START'
    try {
        Write-Host ('BT_SEC07_PS_MAJOR: ' + $PSVersionTable.PSVersion.Major)
        $phase = 'GPG_COMMAND'
        $gpgProgram = (Get-Command gpg.exe -ErrorAction Stop).Source
        $gpgConfProgram = (Get-Command gpgconf.exe -ErrorAction Stop).Source

        $phase = 'GPGCONF_HOME'
        $resolvedHomes = @(& $gpgConfProgram --list-dirs homedir 2>$null)
        $gpgConfExit = $LASTEXITCODE
        if ($gpgConfExit -ne 0 -or $resolvedHomes.Count -ne 1) {
            Write-Host 'BT_SEC07_GPGCONF_HOME: FAILED'
            Write-Host 'BT_SEC07_GPG_DIAG: STOP_NO_DB_ACCESS'
            return
        }

        $gpgHomePath = [Uri]::UnescapeDataString(([string]$resolvedHomes[0]).Trim())
        if (-not (Test-Path -LiteralPath $gpgHomePath -PathType Container)) {
            Write-Host 'BT_SEC07_GPG_HOME: NOT_FOUND'
            Write-Host 'BT_SEC07_GPG_DIAG: STOP_NO_DB_ACCESS'
            return
        }
        Write-Host 'BT_SEC07_GPG_HOME: PRESENT'

        $phase = 'PUBLIC_LIST'
        $publicLines = @(& $gpgProgram --homedir $gpgHomePath --batch --no-auto-check-trustdb --with-colons --list-keys 2>$null)
        $publicExit = $LASTEXITCODE
        if ($publicExit -ne 0) {
            Write-Host ('BT_SEC07_GPG_PUBLIC_LIST_EXIT: ' + $publicExit)
            Write-Host 'BT_SEC07_GPG_DIAG: STOP_NO_DB_ACCESS'
            return
        }
        Write-Host ('BT_SEC07_GPG_PUBLIC_KEYS_COUNT: ' + @($publicLines | Where-Object { $_ -match '^pub:' }).Count)

        $phase = 'SECRET_LIST'
        $secretLines = @(& $gpgProgram --homedir $gpgHomePath --batch --no-auto-check-trustdb --with-colons --list-secret-keys 2>$null)
        $secretExit = $LASTEXITCODE
        if ($secretExit -ne 0) {
            Write-Host ('BT_SEC07_GPG_SECRET_LIST_EXIT: ' + $secretExit)
            Write-Host 'BT_SEC07_GPG_DIAG: STOP_NO_DB_ACCESS'
            return
        }
        Write-Host ('BT_SEC07_GPG_SECRET_KEYS_COUNT: ' + @($secretLines | Where-Object { $_ -match '^sec:' }).Count)
        Write-Host 'BT_SEC07_GPG_DIAG: PASS_NO_DB_ACCESS_NO_SECRETS_PRINTED'
    }
    catch {
        Write-Host ('BT_SEC07_GPG_FAIL_PHASE: ' + $phase)
        Write-Host ('BT_SEC07_GPG_FAIL_CLASS: ' + $_.Exception.GetType().Name)
        Write-Host 'BT_SEC07_GPG_DIAG: FAILED_NO_DB_ACCESS'
    }
}
```

**Interpretación de resultados:**
- `BT_SEC07_GPG_DIAG: PASS_NO_DB_ACCESS_NO_SECRETS_PRINTED`: enumeración metadata completada; aún no prueba coincidencia de clave de backup ni desencriptación.
- `BT_SEC07_GPG_PUBLIC_LIST_EXIT: <no-cero>`: fallo de listado público real, sin decidir causa por código solo.
- `BT_SEC07_GPG_SECRET_LIST_EXIT: <no-cero>`: listado público funcionó, secreto falló.
- `BT_SEC07_GPG_FAIL_PHASE` + `FAIL_CLASS`: excepción del shell o runtime en una etapa concreta; distinguir de exit no-cero.
- `GPG_HOME: NOT_FOUND`: el almacén actualmente resuelto no se encontró; no inventar otro ni generar claves automáticamente.

**No ejecutar** `gpg --list-keys` sin filtros visibles en chat; no subir capturas de claves, no contactar a Supabase, no restaurar ni generar respaldos.

## 4. Estado anterior y gates

18/18 MOCK Windows PASS; 14/14 GPG real con clave temporal PASS; 15/15 integración sintética GPG real PASS; CLI 3.0.0 flags PASS. **No repetir**. Primer inventario PG en esta sesión: variables `NOT_SET`, archivos default `ABSENT`; no demuestra pérdida de credenciales históricas. La copia de roles histórica `roles.sql.gpg` descifra 0 bytes y permanece inválida; R2 paridad estructura de snapshot PASS, owners/ACL/RLS real por taller no certificados; `BT-PILOT-QA-04 A REPASAR`. Google Drive excluido. No se alteraron respaldo, keyring, manifests, Supabase, Render, Docker, ni visibilidad GitHub; solo documentos `[skip render]`.

**Permiso vigente:** usuario autorizó SOLO inventario local de la configuración libpq y claves GPG existentes, sin secretos, nuevas copias ni conexión Supabase. Una autorización posterior nueva sigue siendo obligatoria para cualquier uso criptográfico de keyring histórico, dump de roles reales o restauración.

## 5. Traspaso a nuevo chat

«Continúa ByteTorque SEC-07 desde `main`. Leer primero `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_LIST_INVENTORY_FAILED_DIAG_PREP_20261120.md`, y informe de incidentes. El usuario autorizó solo inspección local. Resultados: GPG_HOME_SOURCE GPGCONF, GPG_HOME PRESENT y GPG_INVENTORY FAILED_NO_DB_ACCESS. No sabemos si fue un fallo de GPG o PowerShell: INC-36 sin raíz determinada, script anterior con catch genérico. Dejado bloque local que informa PS_MAJOR, fase y clase de excepción, o exit code de gpg y únicamente conteos, sin stderr identificable ni secrets. **Esperar resultado Windows de este bloque**; no repetir controles de PG ni los tests 18/14/15 (PASS). Roles.sql.gpg histórico SQL 0 bytes, R2 snapshot estructura PASS, R3 roles/ACL pendientes, Google Drive fuera, piloto A REPASAR. Cada avance queda en checkpoint + docs main [skip render] y no conectar a Supabase sin autorización aparte».
