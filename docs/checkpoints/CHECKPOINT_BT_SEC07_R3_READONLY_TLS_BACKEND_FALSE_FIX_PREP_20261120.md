# CHECKPOINT — BT-SEC07-R3-READONLY-TLS-BACKEND-FALSE-FIX-PREP-44 · sesión SQL confirmada, falso bloqueo TLS del lector V1, V2 preparado

**Fecha:** 20/11/2026 (America/Santiago) · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama exclusiva:** `main` · **HEAD al investigar:** `4dd3035ef85cef1a1ce30b263493365c520702f9`. **Alcance realizado:** investigación de la salida real del propietario; auditoría del código exacto del ZIP V1; documentación y **corrección solo en ZIP candidato offline V2**, sin ejecutar una segunda conexión remota. **Consentimiento anterior permitía una primera conexión única y ya se consumió.** No interpretar como autorización permanente para reconectar.

## 1. Evidencia Windows original (única conexión hecha por el propietario)

```text
BT_SEC07_RO_ZIP: VERIFIED
BT_SEC07_PG17_PSQL: PRESENT
BT_SEC07_SOURCE_CONFIG: SAFE_STATIC_MATCH
BT_SEC07_CA: PUBLIC_PEM_LOADABLE_NO_TLS_YET
BT_SEC07_SSL_POLICY: VERIFY_FULL_AND_READ_ONLY_ENFORCED
BT_SEC07_TARGET: ORIGINAL_SOURCE_POOLER_5432
Contrasena PostgreSQL, solo en tu PC (oculta):
BT_SEC07_PRECHECK_STOP: SESSION_TLS_NOT_CONFIRMED
BT_SEC07_ROLES_BACKUP: NOT_ATTEMPTED
BT_SEC07_RO_WINDOWS: STOP
```

**Hechos confirmables por flujo fuente EXACTO** (`BT_SEC07_R3_READONLY_CONN_20261120.zip`, SHA256 `ea7a7d53208b63481c8cb69462ed152ee4fb0c69b08af8528cac59947c5f7f35`, re-verificado al investigar): `check_psql_result` solo puede producir `SESSION_TLS_NOT_CONFIRMED` después de recibir `psql` returncode **0**, una fila de payload correctamente estructurada, `current_database=postgres`, `current_user` congruente, `transaction_read_only=on`, `server_version_num` PG17, y verificación de `pg_stat_ssl` resultando `no`. Por tanto la sesión llegó a ejecutar el SELECT fijo de metadatos y COMMIT en una transacción READ ONLY; la autentificación y el acceso a servidor funcionaron **para esta consulta**. El código real pasó `PGSSLMODE=verify-full` y CA a libpq; no imprimió salida SQL ni stderr. **No se imprimió ni compartió contraseña, host, ref, CA, filas ni datos de clientes.** El resultado NO permite afirmar que el tramo cliente estuviera cifrado (cabe GSSAPI como preferencia de libpq cuando disponible) sin verificar desde ese cliente; tampoco demuestra que estuviera sin cifrar.

## 2. INC-44 — causa concreta verificada vs alcance desconocido

**ID:** `BT-SEC07-SSL-ATTESTATION-WRONG-LEG-44`. **Estado:** código V1 causa CONFIRMADA, reemplazo V2 probado sintéticamente; **WINDOWS V2 PENDIENTE**. **Raíz del falso bloqueo de la herramienta:** V1 exigía `pg_stat_ssl.ssl = true` filtrado por `pg_backend_pid()` para aprobar SSL de la conexión PC -> pooler. Esa vista describe la conexión **que llega al backend PostgreSQL**. Al usar Supavisor compartido de sesión hay **dos tramos**: PC -> pooler y pooler -> PostgreSQL. V1 no distingue ambos y rechaza la primera aunque el segundo devuelva `ssl=false`. La condición inesperada no es un fallo probado del respaldo, clave, contraseña ni certificado. **Dato de seguridad real:** PostgreSQL observó `ssl=false` en el backend de esa sesión. Esto puede indicar upstream pooler -> DB sin TLS y debe evaluarse con la política SSL enforcement; no debe suprimirse ni etiquetarse como «todo seguro».

Fuentes consultadas:
- [PostgreSQL 17, `pg_stat_ssl`](https://www.postgresql.org/docs/17/monitoring-stats.html): vista de conexiones al backend PostgreSQL.
- [Supabase, SSL enforcement](https://supabase.com/docs/guides/platform/ssl-enforcement): el pooler compartido tiene **ambos tramos** y la política de enforcement afecta ambos; **cambiarla produce reinicio de base**: NO cambiar sin consentimiento específico.
- [PostgreSQL 17, `sslmode=verify-full` y `gssencmode`](https://www.postgresql.org/docs/17/libpq-connect.html): `verify-full` comprueba CA y nombre del host para SSL, pero libpq puede preferir GSSAPI si está disponible; V2 usa `PGGSSENCMODE=disable` para exigir comprobación TLS del cliente.
- [PostgreSQL `psql` `\\conninfo`](https://www.postgresql.org/docs/17/app-psql.html): cliente informa sobre **su propia conexión**.

## 3. Corrección V2 preparada, sin conexión Windows nueva

**ZIP privado (solo chat, NO GitHub):** `BT_SEC07_R3_READONLY_CONN_V2_20261120.zip` SHA-256 `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b`, tamaño **10542 bytes**. Contiene README, `bt_sec07_readonly_connection.py`, `test_bt_sec07_readonly_connection.py`. El ZIP V1 queda **OBSOLETO** para TLS bajo Supavisor y NO debe volver a ejecutarse.

**Diferencias mínimas:**
1. Mantener el selector del archivo original `bytetorque_respaldo_local.py` **sin ejecutarlo**, config AST estática, CA local único, autenticación por `getpass`/entorno del hijo psql sin .pgpass/argv, `PGSSLMODE=verify-full`, transacción SQL `READ ONLY` y mismo SELECT metadata; no se conecta con CLI ni crea roles.
2. En **el mismo proceso psql y misma conexión**, ejecutar además un segundo `--command` con la orden interna `\\conninfo`; `stdout` se mantiene oculto en RAM (incluye host/usuario) y se convierte en marcador booleano. La comprobación exige línea de cliente `SSL connection (protocol: TLSv1.2 o TLSv1.3, cipher: ...)`, y además `PGGSSENCMODE=disable` y locale C. En ausencia de línea SSL / TLS 1.1 / respuesta inesperada, `STOP: CLIENT_TLS_NOT_CONFIRMED`, no declarar PASS.
3. `pg_stat_ssl` `yes/no` deja de ser puerta de validación cliente, se preserva como **telemetría aparte**: `BT_SEC07_DB_BACKEND_SSL: REPORTED_YES/REPORTED_NO`; en cualquier caso `BT_SEC07_END_TO_END_TLS: NOT_CERTIFIED`. Si DB backend dice NO, **no afirmar cifrado del tramo pooler -> DB**. La opción SSL enforcement de Supabase se deberá consultar por separado bajo otro permiso; NO activarla ahora ni disparar reinicios.
4. La conexión continúa haciendo solamente SQL SELECT de metadatos dentro de BEGIN READ ONLY, sin acceso a tablas de clientes, SQL de roles, dump, GPG o alteraciones. El secreto temporal existe en memoria del proceso psql/Python: no garantiza borrado forense. Se capturan stderr y stdout sin mostrarlos; solo marcadores `BT_SEC07_*`.

**QA real ejecutada por asistente, entorno sintético, sin Supabase real:**
- **35/35 unit tests PASS** con salida psql simulada; 24 regresiones previas adaptadas más 11 casos nuevos de separación PC/pooler, TLSv1.2/1.3, rechazo sin TLS, ausencia de divulgación del `\\conninfo`, códigos de fallo y único proceso psql con dos comandos.
- **ZIP V2 extraído en un TEMP distinto: 35/35 PASS**.
- Reproducción exacta con `pg_stat_ssl=no`: V1 `SESSION_TLS_NOT_CONFIRMED` (STOP); V2 con cliente TLS simulado devuelve PASS de lectura, conserva backend `no` como categoría independiente.
- **No se ejecutó V2 en Windows, no se efectuó nueva conexión real, no se tocó DB/backup original**.

## 4. Siguiente acción condicionada — consentimiento nuevo antes del segundo acceso

El consentimiento anterior para «primera conexión» fue aplicado por el propietario con el V1. **No mandar a ejecutar V2 directamente como continuación automática**. Solicitar primero permiso explícito para **UN segundo intento de conexión read-only**, mismos límites, ahora con medición de TLS CLIENTE distinta y sin `pg_dumpall`. Si se autoriza, el paquete con SHA ya preparado puede ser descargado y ejecutado con **un solo bloque PowerShell**; el propietario selecciona el script original, escribe password solo localmente y comparte exclusivamente los marcadores `BT_SEC07_*`. Código del bloque preparado, pero todavía **NO AUTORIZADO PARA EJECUTAR**:

```powershell
& {
    $zip = Join-Path $env:USERPROFILE 'Downloads\BT_SEC07_R3_READONLY_CONN_V2_20261120.zip'
    $expected = 'baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b'
    if (-not (Test-Path -LiteralPath $zip -PathType Leaf)) {
        Write-Host 'BT_SEC07_RO_V2_ZIP: NOT_FOUND'; return
    }
    if ((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash -ine $expected) {
        Write-Host 'BT_SEC07_RO_V2_ZIP: HASH_MISMATCH'; return
    }
    Write-Host 'BT_SEC07_RO_V2_ZIP: VERIFIED'
    $py = Get-Command py.exe -ErrorAction SilentlyContinue
    $python = Get-Command python.exe -ErrorAction SilentlyContinue
    if (-not $py -and -not $python) {
        Write-Host 'BT_SEC07_RO_V2_PYTHON: NOT_FOUND'; return
    }
    $tmp = Join-Path $env:TEMP ('BT_SEC07_RO_TLS_V2_' + [guid]::NewGuid().ToString('N'))
    $entered = $false
    try {
        Expand-Archive -LiteralPath $zip -DestinationPath $tmp -ErrorAction Stop
        Push-Location $tmp
        $entered = $true
        if ($py) {
            & $py.Source -3 -B .\bt_sec07_readonly_connection.py
        } else {
            & $python.Source -B .\bt_sec07_readonly_connection.py
        }
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'BT_SEC07_RO_V2_WINDOWS: STOP'
        } else {
            Write-Host 'BT_SEC07_RO_V2_WINDOWS: PASS_CLIENT_TLS_ONLY'
        }
    }
    catch {
        Write-Host 'BT_SEC07_RO_V2_WINDOWS: STOP_LAUNCHER'
    }
    finally {
        if ($entered) { Pop-Location }
        if (Test-Path -LiteralPath $tmp -PathType Container) {
            Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}
```

**Si resultado PASS:** `BT_SEC07_CLIENT_POOLER_TLS: CONFIRMED_BY_LIBPQ`, `BT_SEC07_DB_BACKEND_SSL: REPORTED_NO` (si sigue NO), `BT_SEC07_END_TO_END_TLS: NOT_CERTIFIED`, `BT_SEC07_TRANSACTION_READ_ONLY: ON`, `BT_SEC07_PRECHECK: PASS_SINGLE_READONLY_CONNECTION`. Cierre de conexión PC/cliente, no seguridad integral de dos tramos, no roles/ACL ni backup. **Si STOP:** no reintentar, registrar nueva categoría y revisar código. Si TLS del backend sigue FALSE, valorar auditoría de política SSL enforcement mediante Dashboard o Management API **solo lectura con nueva autorización**; **nunca cambiar configuración automáticamente**, dado que puede reiniciar el motor de BD.

## 5. Continuidad, pendientes y prompt de mudanza

No repetir suites Windows históricas 18/14/15, GPG metadata V2 ni R2 restore estructural PASS. Keyring privado histórico aislado ya coincidió con destinatario del backup; anillo GPG default sin secreta no demuestra pérdida. `roles.sql.gpg` histórico SQL 0, productor `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` sigue abierto. Exportación real roles, owners/grants/ACL sigue PENDIENTE y requiere autorización distinta después de verificar seguridad del origen. `BT-PILOT-QA-04 A REPASAR`; Drive fuera. GitHub solo documentos `main` con `[skip render]`, no ejecutar workflows/deploy.

> «Continúa ByteTorque SEC-07 desde main. Leer AGENTS.md, agent.md, roadmap.md, checkpoint `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_TLS_BACKEND_FALSE_FIX_PREP_20261120.md` y registro de incidentes. Windows **sí** ejecutó una conexión real read-only: V1 ZIP Verified, script original AST OK, CA público cargable, psql PG17, SQL ejecutado + identidad/rol/PG17/transaction_read_only ON, pero `SESSION_TLS_NOT_CONFIRMED` porque consulta `pg_stat_ssl.ssl` del **backend de pooler**, resultó NO, sin certificar SSL de cliente. INC-44: causa del falso bloqueo V1 confirmada en código; upstream SSL del backend observó FALSE y es riesgo a revisar, no negar. ZIP V2 privado `BT_SEC07_R3_READONLY_CONN_V2_20261120.zip` SHA256 `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b`, 10542B, añade `\\conninfo` cliente mismo proceso, `PGGSSENCMODE=disable`, no publica salida, reporta client TLS separado de backend. **35/35 tests offline PASS antes y después de ZIP**, comparación V1 STOP/V2 PASS sintética. **V2 NO AUTORIZADO PARA SEGUNDO ACCESO AÚN**; pedir nuevo AUTORIZO antes de ejecutar un único psql read-only; no dump, GPG, DB writes/SSL enforcement changes ni crear roles. R2 estructura PASS, GPG histórico privado match, role SQL histórico 0, roles/ACL pendientes, piloto A REPASAR, Drive excluido. Documentar cada resultado en main [skip render].»
