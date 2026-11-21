> **CORRECCIÓN POSTERIOR (INC-39): el V1 que documenta este checkpoint obtuvo `PARTIAL_PACKET_UNSUPPORTED` en Windows al leer metadatos del backup principal; NO reutilizarlo. Ese STOP refleja una limitación confirmada del parser de longitudes parciales OpenPGP y NO demuestra corrupción. V2 preparada y documentada en [checkpoint 39](CHECKPOINT_BT_SEC07_R3_RECIPIENT_PARTIAL_PACKET_FIX_PREP_20261120.md), Windows V2 pendiente. Conservar este checkpoint histórico sin copiar su comando V1.**

# CHECKPOINT — BT-SEC07-R3-RECIPIENT-METADATA-PREP-38 · inspección del destinatario OpenPGP SIN descifrar

**Fecha:** viernes 20/11/2026 (America/Santiago) · **Repo:** `Danielsanchezdesarrolador/biomotors-taller` · **única rama:** `main` · **HEAD previo:** `9317ebc5d0e861d1dc8b51e365322140d4e495ec`. **Alcance autorizado por propietario:** «autorizo» a verificar **solo metadatos** del destinatario del respaldo cifrado existente y compararlos con las claves GPG disponibles; **sin descifrar ni modificar respaldos, sin exportar claves, sin acceder a Supabase ni generar copia de base de datos**. No se ha ejecutado ese procedimiento contra el PC ni contra archivos reales del titular; la ejecución está PENDIENTE del propietario.

## 1. Estado previo confirmado (no reabrir)

- Windows PowerShell 5: `GPG_HOME: PRESENT`, `GPG_PUBLIC_KEYS_COUNT: 1`, `GPG_SECRET_KEYS_COUNT: 0`, `GPG_DIAG: PASS_NO_DB_ACCESS_NO_SECRETS_PRINTED` (checkpoint 37).
- Error del primer script inventario `$home` contra `$HOME`: incidente 35 corregido; fallo subsiguiente de listado: incidente 36 superado operativamente, causa exacta no probada. Ninguna avería de keyring identificada.
- CLI Supabase 3.0.0 flags PASS, laboratorios de transporte 18/18, GPG real efímero 14/14 e integrado 15/15 PASS Windows; **no repetir**.
- El antiguo `roles.sql.gpg` (151 bytes de cifrado) contiene **cero bytes SQL descifrados**; **no es respaldo de roles**, preservar. Respaldo principal PostgreSQL cifrado logró restauración estructural aislada R2 en Docker Supabase PG17, pero NO acredita rol/ACL completo. `BT-PILOT-QA-04 A REPASAR`; Drive excluido.

## 2. Herramienta privada preparada, sin datos reales

**ZIP:** `BT_SEC07_R3_RECIPIENT_METADATA_20261120.zip` (solo entregable mediante chat y PC, no publicar en GitHub; el paquete contiene solo scripts de laboratorio sin credenciales ni datos de clientes).

**SHA-256 exacto:** `3095885292baeca30a1785723143d1e99785baf735b793fee7e03196d69cbc8c`. **Tamaño:** 3995 bytes. **Contenido:** `bt_sec07_recipient_metadata.py`, `test_bt_sec07_recipient_metadata.py`, `README.md`.

**Diseño:**
1. El propietario elige **un único ciphertext .gpg/.pgp ya existente**, idealmente el backup principal previamente restaurado, mediante diálogo local Windows (alternativamente `Read-Host` en su propia consola). Sin búsqueda recursiva de carpetas, sin rutas/identificadores visibles en chat.
2. El programa estándar Python abre el archivo SOLO para lectura binaria y **examina únicamente las cabeceras de paquetes PKESK OpenPGP v3 (tag 1)**; salta por offset la carga cifrada y detiene al encontrar paquete de datos cifrados (tag 9/18/20). Admite hasta 32 destinatarios y detecta Key ID oculto sin intentar adivinar. No analiza ciphertext completo, no verifica hash ni integridad del respaldo.
3. Ejecuta `gpgconf --list-dirs homedir`, `gpg --homedir ... --batch --no-auto-check-trustdb --with-colons --list-keys` y `--list-secret-keys`; stdout/stderr quedan **capturados en RAM**, se comparan únicamente IDs de 64 bits con subclaves públicas/secretas también, **nunca se imprimen claves, IDs, huellas, correos, rutas, UIDs o ciphertext**. No se invocan `gpg --decrypt`, `--encrypt`, `--import`, `--export` ni claves privadas para operaciones. El listado de GPG podría consultar agente/metadatos internos; no atribuir a ello garantía forense de no escritura.
4. Si versión PKESK no v3, ciphertext simétrico, destinatario anónimo, paquete malformado o archivo no compatible, devuelve `STOP` o `INDETERMINATE`; **no equivale a corrupción demostrada**.
5. Compara ID visible por igualdad, NO valida identidad completa de huella (64 bits y coincidencia de subclaves) ni disponibilidad de descifrado, propiedad del backup, SQL de roles, grants o RLS. Aun `ALL_VISIBLE_MATCH` con pública **NO acredita recuperación**.

**Evidencia de laboratorio que sí se ejecutó en el entorno del asistente:**
- Nueva suite exclusiva del parser/metadata, datos de paquetes inventados: **13/13 PASS**.
- Caso GPG real y clave efímera bajo `TemporaryDirectory`, archivo inventado: **PASS** al extraer ID PKESK y compararlo con pública y secreta del home efímero, sin revelar identificador. **No se usaron claves ni respaldos del propietario**.
- ZIP extraído en otro temporal, `unittest discover -v` sobre sus contenidos: **13/13 PASS**.
- SHA de ZIP recalculado: `3095885292baeca30a1785723143d1e99785baf735b793fee7e03196d69cbc8c`. ZIP original guardado solo en canal de chat, NO repositorio.

## 3. Acción única solicitada al propietario

Descargar ZIP a Descargas, verificar SHA-256 antes de extraer. Ejecutar el siguiente bloque **solo si desea realizar la comprobación local autorizada**; seleccionar **solo un respaldo principal .gpg/.pgp que anteriormente pudo restaurarse**; no elegir el antiguo `roles.sql.gpg` vacío para inferir recuperabilidad de datos principales. No ejecutar suite QA de 13 tests en Windows salvo fallo nuevo, y no reabrir suites 18/14/15 anteriores.

```powershell
& {
    $zip = Join-Path $env:USERPROFILE 'Downloads\BT_SEC07_R3_RECIPIENT_METADATA_20261120.zip'
    $sha = '3095885292baeca30a1785723143d1e99785baf735b793fee7e03196d69cbc8c'
    if (-not (Test-Path -LiteralPath $zip -PathType Leaf)) {
        Write-Host 'BT_SEC07_META_ZIP: NOT_FOUND'
        return
    }
    if ((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash -ine $sha) {
        Write-Host 'BT_SEC07_META_ZIP: HASH_MISMATCH'
        return
    }
    Write-Host 'BT_SEC07_META_ZIP: VERIFIED'

    $py = Get-Command py.exe -ErrorAction SilentlyContinue
    $python = Get-Command python.exe -ErrorAction SilentlyContinue
    if (-not $py -and -not $python) {
        Write-Host 'BT_SEC07_META_PYTHON: NOT_FOUND'
        return
    }

    $dest = Join-Path $env:TEMP ('BT_SEC07_META_' + [guid]::NewGuid().ToString('N'))
    try { Expand-Archive -LiteralPath $zip -DestinationPath $dest -ErrorAction Stop }
    catch {
        Write-Host 'BT_SEC07_META_ZIP: EXTRACTION_FAILED'
        return
    }

    $chosen = $null
    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
        $picker = New-Object System.Windows.Forms.OpenFileDialog
        $picker.Title = 'Selecciona el respaldo cifrado GPG validado (solo lectura)'
        $picker.Filter = 'Archivo GPG (*.gpg;*.pgp)|*.gpg;*.pgp'
        $picker.CheckFileExists = $true
        $picker.Multiselect = $false
        $picker.RestoreDirectory = $true
        if ($picker.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
            Write-Host 'BT_SEC07_META_SELECTION: CANCELLED'
            return
        }
        $chosen = $picker.FileName
    }
    catch {
        Write-Host 'BT_SEC07_META_PICKER: UNAVAILABLE'
        $chosen = Read-Host 'Ruta completa del archivo GPG en este PC (no la pegues en chat)'
    }
    if ([string]::IsNullOrWhiteSpace($chosen) -or -not (Test-Path -LiteralPath $chosen -PathType Leaf)) {
        Write-Host 'BT_SEC07_META_SELECTION: NOT_FOUND'
        return
    }
    Write-Host 'BT_SEC07_META_SELECTION: ACCEPTED_NO_PATH_PRINTED'

    Push-Location $dest
    try {
        if ($py) {
            & $py.Source -3 .\bt_sec07_recipient_metadata.py $chosen
        } else {
            & $python.Source .\bt_sec07_recipient_metadata.py $chosen
        }
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'BT_SEC07_META_WINDOWS: STOP'
        } else {
            Write-Host 'BT_SEC07_META_WINDOWS: PASS_HEADER_CHECK_ONLY'
        }
    }
    finally { Pop-Location }
}
```

**Salida a compartir:** exclusivamente líneas `BT_SEC07_*`; jamás ruta del archivo, manifest, clave, IDs, SQL, tokens, contraseña ni GPG `--list-packets` abierto.

**Interpretación esperada:** `BT_SEC07_META_ZIP: VERIFIED`; si formato abierto y PKESK v3, estados `RECIPIENT_COUNT`, `PUBLIC_MATCH`, `SECRET_MATCH`, `RECOVERABILITY: NOT_PROVEN` y `CHECK: COMPLETE_NO_DB_NO_DECRYPT_NO_WRITE`; marcador Windows `PASS_HEADER_CHECK_ONLY`. `PUBLIC_MATCH=ALL_VISIBLE_MATCH` significa solo coincidencia de Key ID de metadatos, no validación de clave privada. `SECRET_MATCH=NO_VISIBLE_MATCH` concuerda con el inventario 0 secretas en home elegido, NO pérdida definitiva en otro medio. Ante STOP, no modificar archivos ni repetir ciegamente; clasificar la razón sanitizada y actualizar checkpoint.

## 4. Alcance NO realizado y próximas puertas

**NO realizado** por el asistente: acceso al PC, abrir el backup real, conectar a Supabase, exportar roles, usar GPG real original para cifrar/descifrar, exportar/importar claves, modificar respaldos, manifests, GPG home, Render, DB/Auth/RLS/Storage, Docker restore, segunda copia fuera del PC, GitHub Actions/deploy ni Google Drive. GitHub recibe exclusivamente documentación `[skip render]`.

**Próximo tras salida Windows:** actualizar checkpoint en `main`, clasificar metadata pública/privada coincidente/ausente/indeterminada; **antes de cifrar más datos reales a ese destinatario**, acordar una custodia efectiva de clave privada y una prueba de recuperación bajo nueva autorización. Conexión a origen Supabase y exportación de roles requieren consentimiento separado. Evitar reenviar file/key metadata identificable.

## 5. Prompt transferible a nuevo chat

> Continuar ByteTorque SEC-07 desde `main`. Leer `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_METADATA_PREP_20261120.md` e informe de incidentes; verificar HEAD. Usuario AUTORIZÓ solo comparación LOCAL de metadatos PKESK del backup cifrado existente contra keyring, SIN decrypt/modificaciones/DB ni exportación. GPG home Windows contiene 1 pública, 0 privadas (solo ese home); 18/14/15 suites Windows PASS, no repetir; R2 snapshot estructura PASS; roles.sql.gpg antiguo descifra 0 bytes. Preparado ZIP privado `BT_SEC07_R3_RECIPIENT_METADATA_20261120.zip` SHA256 `3095885292baeca30a1785723143d1e99785baf735b793fee7e03196d69cbc8c`, parser OpenPGP **header-only**, suite sintética nueva 13/13 PASS y prueba real con GPG de clave efímera PASS; zip extraído y tests 13/13 PASS. **Aún no ejecutado en Windows ni examinado backup del propietario**. Siguiente: usuario descarga ZIP, ejecuta SOLO script PS preflight SHA + picker local y comparte únicamente `BT_SEC07_*`. Coincidencia 64-bit ID ≠ certeza de recuperación, y 0 privadas en home ≠ pérdida definitiva; usar claves originales para decrypt, dump roles real, restore o Supabase requiere AUTORIZO nuevo. No Drive, no producción, piloto A REPASAR. Documentar evidencia, errores/soluciones y checkpoint nuevo en cada etapa.
