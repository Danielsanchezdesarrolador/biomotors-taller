# CHECKPOINT — BT-SEC07-R3-RECIPIENT-PARTIAL-FIX-PREP-39 · longitud parcial OpenPGP y lectura solo cabecera

**Fecha:** 20/11/2026 (America/Santiago) · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama exclusiva:** `main` · **HEAD antes de cambio:** `16bc64ba64fa7e3ec5d4a0da5e52362e2c8c4b6d`. **Alcance autorizado:** lectura SOLO de metadatos de un archivo GPG seleccionado por propietario; sin descifrar, modificar respaldos ni conexión a Supabase. No se ejecutó operación contra equipo o respaldo real desde el asistente.

## 1. Evidencia REAL del equipo Windows

El usuario seleccionó el respaldo principal OpenPGP en la carpeta de backup ByteTorque en el selector GUI del ZIP v1 y obtuvo exactamente:
```text
BT_SEC07_META_ZIP: VERIFIED
BT_SEC07_META_SELECTION: ACCEPTED_NO_PATH_PRINTED
BT_SEC07_RECIPIENT_STOP_CLASS: PARTIAL_PACKET_UNSUPPORTED
BT_SEC07_RECIPIENT_CHECK: STOP_NO_DB_NO_DECRYPT
BT_SEC07_META_WINDOWS: STOP
```

La verificación SHA-256 del V1 PASÓ y el selector aceptó el archivo; el parser detuvo deliberadamente la inspección. **Este STOP NO prueba corrupción del respaldo, ni pérdida de clave, ni falla de PostgreSQL/GPG.** No se mostró ninguna coincidencia con llaves, por tanto la relación de destinatario continúa SIN determinar.

## 2. Nuevo incidente / causa comprobada en código, vs hecho real no inspeccionado

**INC-ID:** `BT-SEC07-RECIPIENT-PARTIAL-UNSUPPORTED-39`. **Componente:** parser local `bt_sec07_recipient_metadata.py` v1, no backup/DB. **Causa verificada del STOP:** `header(f)` rechazaba **sin distinguir el tipo de paquete** todo byte de longitud OpenPGP en rango 224-254 con `StopCheck('PARTIAL_PACKET_UNSUPPORTED')`; eso omite el formato «Partial Body Length» autorizado para datos cifrados por RFC 9580. [Estándar RFC 9580](https://www.rfc-editor.org/rfc/rfc9580.html), sección de formato de longitudes de paquetes. Como no abrimos el backup real, **no se comprobó directamente** si el encabezado real que disparó el STOP era el primer paquete de datos cifrados (tags 9/18/20), aunque es frecuente con GPG transmitiendo streams grandes. La lectura V2 validará esta hipótesis localmente. **Riesgo:** original v1 tenía suite 13/13 PASS pero carecía de un caso de longitud parcial; tests no representan todos los formatos de origen real.

## 3. Cambio realizado fuera del repositorio y QA auténtico

ZIP **privado** `BT_SEC07_R3_RECIPIENT_METADATA_V2_20261120.zip`, SHA-256 EXACTO `eed81875dfca9f70929983a82b3490c62ff15f170d2a89ea410967033eb82842`. **Archivos:** `README.md`, `bt_sec07_recipient_metadata.py`, `test_bt_sec07_recipient_metadata.py`. Solo salida por chat; **no subir scripts ni datos sensibles a GitHub**.

Corrección acotada:
- `header(f)` devuelve `(tag,size,partial)`; reconoce byte 224..254 como longitud parcial inicial `1 << (n & 31)`.
- **Solo acepta longitud parcial en la primera cabecera de un paquete cifrado de tipo 9/18/20, después de encontrar PKESK** (destinatario visible u oculto). Valida que la primera porción declarada quepa en el archivo y que haya destinatario. No interpreta el cuerpo cifrado, no recorre chunks subsecuentes, no autentica el ciphertext y no descifra.
- Sigue rechazando PKESK parcial, archivo malformado, paquete parcial truncado, cuerpo de tamaño reclamado excesivo, datos sin destinatario y versión PKESK no soportada.
- No cambia comparación de identificadores de solo 64 bits, listado GPG metadatos, límites de 32 destinatarios, ausencia de secretos impresos ni salida `RECOVERABILITY: NOT_PROVEN`.

**Pruebas realizadas en entorno del asistente, todos archivos inventados:**
1. **19/19 pruebas unitarias PASS**, incluidos los 13 escenarios base y **seis nuevos escenarios** de longitud parcial, errores y múltiples destinatarios.
2. Integración con **GPG 2.4.7 REAL, clave RSA efímera y 1.250.000 bytes sintéticos aleatorios por stdin**: GPG produjo efectivamente un paquete cifrado de tag 18 con cuerpo de longitud parcial; v2 analizó encabezados y reportó 1 destinatario, `PUBLIC_MATCH=ALL_VISIBLE_MATCH`, `SECRET_MATCH=ALL_VISIBLE_MATCH`, `RECOVERABILITY=NOT_PROVEN`, exit 0. Este test **no usó keyring histórico ni backup del propietario**.
3. ZIP v2 extraído en otro directorio temporal: **19/19 PASS** tras extraer. SHA recalculado al empaquetar.
4. **WINDOWS REAL CON BACKUP BYTETORQUE: PENDIENTE**. No afirmar ya resuelto el caso real hasta recibir salida del propietario.

## 4. ÚNICA acción local siguiente (NO repetir suites anteriores)

Descargar el ZIP v2 a Descargas; verificar su SHA, extraer en carpeta única bajo TEMP, elegir el **mismo respaldo principal OpenPGP** que ayer se seleccionó en GUI (no `roles.sql.gpg`/catálogo de roles), ejecutar el lector v2 y mostrar exclusivamente `BT_SEC07_*`. No repetir ZIP v1, QA 18/14/15 ni Docker restore. La herramienta solo abre el archivo original en `rb`, extrae temporalmente código y elimina esa carpeta temporal. No cambia el backup.

```powershell
& {
    $zip = Join-Path $env:USERPROFILE 'Downloads\BT_SEC07_R3_RECIPIENT_METADATA_V2_20261120.zip'
    $expected = 'eed81875dfca9f70929983a82b3490c62ff15f170d2a89ea410967033eb82842'

    if (-not (Test-Path -LiteralPath $zip -PathType Leaf)) {
        Write-Host 'BT_SEC07_META_V2_ZIP: NOT_FOUND'; return
    }
    if ((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash -ine $expected) {
        Write-Host 'BT_SEC07_META_V2_ZIP: HASH_MISMATCH'; return
    }
    Write-Host 'BT_SEC07_META_V2_ZIP: VERIFIED'

    $py = Get-Command py.exe -ErrorAction SilentlyContinue
    $python = Get-Command python.exe -ErrorAction SilentlyContinue
    if (-not $py -and -not $python) {
        Write-Host 'BT_SEC07_META_V2_PYTHON: NOT_FOUND'; return
    }

    $tempDir = Join-Path $env:TEMP ('BT_SEC07_META_V2_' + [guid]::NewGuid().ToString('N'))
    try {
        Expand-Archive -LiteralPath $zip -DestinationPath $tempDir -ErrorAction Stop
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
        $picker = New-Object System.Windows.Forms.OpenFileDialog
        $picker.Title = 'Respaldo principal cifrado de ByteTorque (solo lectura)'
        $picker.Filter = 'Archivo OpenPGP (*.gpg;*.pgp)|*.gpg;*.pgp'
        $picker.CheckFileExists = $true
        $picker.Multiselect = $false
        $picker.RestoreDirectory = $true

        if ($picker.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
            Write-Host 'BT_SEC07_META_V2_SELECTION: CANCELLED'; return
        }
        Write-Host 'BT_SEC07_META_V2_SELECTION: ACCEPTED_NO_PATH_PRINTED'

        $reader = Join-Path $tempDir 'bt_sec07_recipient_metadata.py'
        if ($py) {
            & $py.Source -3 $reader $picker.FileName
        } else {
            & $python.Source $reader $picker.FileName
        }

        if ($LASTEXITCODE -ne 0) {
            Write-Host 'BT_SEC07_META_V2_WINDOWS: STOP'
        } else {
            Write-Host 'BT_SEC07_META_V2_WINDOWS: PASS_HEADER_CHECK_ONLY'
        }
    }
    catch {
        Write-Host 'BT_SEC07_META_V2_WINDOWS: STOP_LOCAL_LAUNCHER'
    }
    finally {
        if (Test-Path -LiteralPath $tempDir -PathType Container) {
            Remove-Item -LiteralPath $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}
```

**Si V2 completa:** los únicos resultados interpretabIes son coincidencias de ID visible con pública o secreta GPG en el homedir actual, **NO recuperabilidad probada**. Previo resultado de este home: **1 pública y 0 secretas** (checkpoint 37). Si V2 detiene con otro `STOP_CLASS`: registrar esa clase, investigar protocolo sin intentar descifrar ni modificar archivo, y evitar reintentos a ciegas.

## 5. Estado e impacto

- Anterior suite mock 18/18 Windows PASS, GPG real efímero 14/14 Windows PASS e integrado 15/15 Windows PASS, cierre permanente, **NO repetir**. R2 estructura de snapshot recuperada PASS en laboratorio PG17 local; no equivale a restore integral roles/ACL/owners.
- Viejo `roles.sql.gpg` SQL descifrado 0 bytes, inválido; roles reales/owners/grants/ACL siguen PENDIENTES. Cliente/piloto `BT-PILOT-QA-04 A REPASAR`.
- No conectado Supabase ni usado GPG histórico para cifrar/descifrar; no tocados keyring, backup, manifest, Docker, Render, Auth/Storage, GitHub visibilidad ni Drive (excluido). Solo documentación `main` con `[skip render]`.
- Se necesita consentimiento nuevo e independiente para descifrado real, acceso a Supabase, exportación de roles o restauración.

## 6. Prompt de continuidad a nuevo chat

«Continuar ByteTorque SEC-07 en `main`. Antes de actuar leer `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_PARTIAL_PACKET_FIX_PREP_20261120.md` e informe de incidentes; verificar HEAD. Usuario autorizó SOLO lectura local de metadatos de destinatario OpenPGP sin descifrar. V1 ZIP SHA PASS, respaldo principal seleccionado, parser STOP `PARTIAL_PACKET_UNSUPPORTED`; causa del STOP confirmada en código v1 (no soportaba longitudes parciales OpenPGP RFC9580), **NO** evidencia de backup corrupto. V2 ZIP privado `BT_SEC07_R3_RECIPIENT_METADATA_V2_20261120.zip` SHA `eed81875dfca9f70929983a82b3490c62ff15f170d2a89ea410967033eb82842`, reconoce únicamente cabecera parcial de paquete cifrado tag9/18/20 después de PKESK, no toca cuerpo, 19/19 tests + GPG real efímero con ciphertext streaming PARTIAL PASS en entorno asistente y 19/19 tras descomprimir. **PENDIENTE Windows V2**; proporcionar un solo bloque PS preflight SHA+GUI y recibir `BT_SEC07_*`. GPG home Windows 1 clave pública/0 privadas, no prueba pérdida global ni recuperabilidad; no cifrar nuevos datos reales hasta acreditar recuperación. Suites 18/14/15 Windows PASS, no repetir, R2 snapshot solo estructura PASS, roles.sql.gpg SQL0, R3 roles/owners/ACL pendientes; Google Drive fuera; piloto A REPASAR. Documentar resultado y causas/soluciones/checkpoint en `main`, no Supabase/DB real sin permiso».
