> **ACTUALIZACIÓN POSTERIOR CP57 (20/11/2026):** V1 falló en Windows ANTES del selector: `48 tests`, `15 fails`, `5 errors`, `2 skipped`; `MANIFEST_TESTS: STOP`. Falso STOP causado por comparación `Path.lstat` vs `os.fstat` Windows. **No se abrió ningún respaldo real.** V1 obsoleto. V2 ZIP privado `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V2_20261120.zip` SHA256 `950651ceed451e4156847e3af8b02cdb888f3856a479467e3905cb6ddcab92fe`, **53/53 synthetic tests PASS en Linux con Windows simulado**, ejecución real Windows pendiente. [CP57](CHECKPOINT_BT_SEC07_R3_MANIFEST_WINDOWS_V2_REGRESSION_FIX_20261120.md).

# CHECKPOINT 56 — BT-SEC07-R3-MANIFEST-READONLY-PREP

**Fecha:** 20/11/2026 (America/Santiago) · **Repo:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main` · **HEAD de inicio:** `42508b412738f8d7099d977d97d45acd3a212ab6`.

## 1. Alcance expresamente autorizado

El propietario respondió «autorizo» a **PREPARAR una comprobación LOCAL DE SOLO LECTURA de identidad, SHA-256 y manifiesto del respaldo cifrado EXISTENTE**, preservando los archivos originales. No autorizó conexión a Supabase ni descarga/subida de respaldo, modificación de ciphertext o manifiesto, GPG/desencriptación, uso de clave histórica, `pg_restore`, TOC real, SQL remoto, creación de nuevas copias, cambios de roles/ACL, SSL enforcement o despliegue.

Se leyeron `AGENTS.md`, `agent.md`, `roadmap.md`, checkpoint 55, checkpoint de paridad, contrato R3, informe histórico, y se verificó `main`. Se recuperó el **código fuente original** `bytetorque_respaldo_local.py` de la biblioteca privada del propietario, **NO su respaldo real**: `verify_manifest` coteja `project_ref`, `files` como lista de `{name,bytes,sha256}`, y su productor genera además `backup_id`, `created_utc`, `restoration_verified`, `full_project_backup`. El exportador original nombra `database.dump.gpg` y `roles.sql.gpg`; el respaldo actual posterior documenta `roles.catalog.json.gpg` como metadatos, **no roles SQL**. La herramienta soporta solo esos nombres aprobados y falla cerrada ante variantes no documentadas.

## 2. Entregable privado y verificaciones

**ZIP privado `BT_SEC07_R3_MANIFEST_READONLY_20261120.zip`**, **8751 bytes**, SHA-256 **`d052e3fdc05e8896bbf1f6b8c6bf48c27b2fffb5b7d51432f8077927278ac4a8`**. Creado y verificado en el entorno del asistente, **NO se sube ejecutable a GitHub**, solo documentación. Contiene:
- `bt_sec07_manifest_readonly.py`: verificador read-only, no recibe argumentos/rutas en el CLI, solicita selección manual mediante Tkinter del `manifest.json` existente; si no hay GUI, pide ruta local escrita solo en el PC. NO busca/copias/escanea automáticamente. Abre exclusivamente ese archivo y los `.gpg` que enumera el `files` en la **misma carpeta**; exige respaldo principal `database.dump.gpg`, compara `backup_id` con carpeta, `project_ref` contra el referente del exportador original, tamaño y SHA-256 por lectura en bloques, preservando originales. No sigue symlinks; rechaza path traversal, duplicados/JSON corrupto, entradas imprevistas, tamaños incorrectos y cambio del archivo durante la lectura. Ningún `subprocess`, socket, peticiones HTTP, GPG, PostgreSQL, restore, export, copia ni escritura en ejecución principal. No muestra nombres privados, contenidos, rutas o hashes enteros; solo marcadores `BT_SEC07_*`.
- `test_bt_sec07_manifest_readonly.py`: **48 nuevas pruebas sintéticas** con directorios efímeros en TEMP, datos inventados, limpieza al finalizar; rutas válidas y negativas, whitelist de nombres, tamaños, hashes, proyecto/backup_id, duplicados, symlinks, manifest JSON y guardias de contenido. No usa respaldo real.
- `README.md`: límites, procedimiento y advertencias.

**Evidencia QA:** **48/48 PASS** en laboratorio del asistente antes de comprimir; **48/48 PASS** tras extraer ZIP en directorio nuevo y ejecutar la misma suite. ZIP `testzip` PASS, hash calculado del ZIP exacto. No se ejecutaron las pruebas en Windows del propietario en esta fase ni se seleccionó un `manifest.json` real.

**Clasificación segura de éxito** si se ejecuta en Windows sobre una copia original:
```text
BT_SEC07_MANIFEST_PROJECT: MATCHED_LOCAL_EXPORTER_REFERENCE
BT_SEC07_MANIFEST_BACKUP_ID: MATCHES_FOLDER
BT_SEC07_MANIFEST_CIPHERTEXT_SIZES: MATCH
BT_SEC07_MANIFEST_CIPHERTEXT_SHA256: MATCH_MANIFEST_ONLY
BT_SEC07_MANIFEST_INDEPENDENT_AUTHENTICITY: NOT_CERTIFIED
BT_SEC07_MANIFEST_FULL_RECOVERABILITY: NOT_CERTIFIED
BT_SEC07_MANIFEST_AUDIT: PASS_LOCAL_CONSISTENCY_ONLY
```
**Ningún PASS de respaldo real se ha observado todavía.** Ante `STOP_*`, no repetir ni modificar archivos: solicitar únicamente indicadores sanitizados.

## 3. Limitaciones importantes

- La coincidencia SHA-256 con el mismo manifiesto NO prueba autenticidad independiente: ambos archivos podrían haber sido sustituidos o el manifiesto no tener huella externa de referencia. El programa no imprime el hash (evita huellas privadas en la conversación).
- No valida criptografía OpenPGP, posibilidad de desencriptar, clave/custodia, integridad PostgreSQL lógica, TOC real, GRANT/owner/ACL ni restauración.
- El manifiesto histórico puede **no existir**, porque el exportador original lo escribía al final después de `pg_dumpall` que falló. Un `MANIFEST_MISSING` o `STOP` es un diagnóstico, no prueba de respaldo corrupto.
- El respaldo actual puede diferir del exportador original; cuando no se puede reconocer el esquema de `files`, se reporta `STOP_MANIFEST_FILES_UNSUPPORTED` y **NO se reinterpreta libremente ni corrige el manifiesto**.
- **El nombre `roles.catalog.json.gpg` denota metadatos de roles, no SQL restaurable**; incluso un `roles.sql.gpg` con SHA correcto puede contener SQL vacío. El antiguo ciphertext `roles.sql.gpg` sigue inválido (SQL descifrado 0 bytes y productor con error).
- El código no escribe en archivos reales; el sistema operativo puede cambiar metadatos de *último acceso* al leer. El lanzador extrae únicamente el ZIP de la herramienta a carpeta `%TEMP%` temporal y la elimina después, no toca carpetas de respaldo.
- No se asegura fecha actual del respaldo ni paridad con base de datos actual. Se preserva estado `BT-PILOT-QA-04 A REPASAR`.
- El verificador solo accede a archivos elegidos **por el usuario en su PC**; no pedir subida del `manifest.json` al chat, rutas completas, huellas individuales, secretos ni archivos `.gpg`.

## 4. Lanzamiento preparado, aún no ejecutado en Windows

El bloque PowerShell previsto (entregado en conversación) comprobará SHA-256 exacto del ZIP en `$env:USERPROFILE\Downloads`, extraerá solo herramientas a una carpeta nueva de `$env:TEMP`, correrá 48 pruebas con Python `-B` sobre fixtures temporales y, si pasan, abrirá selector de `manifest.json` para una comprobación local de solo lectura. Limpieza de TEMP en `finally`. **No usar `manifest.json` del backup histórico faltante ni crear/cambiar archivos originales.** La decisión de ejecutarlo en su PC pertenece al propietario; no se llevó a cabo en esta fase.

## 5. Continuidad y próximos controles

CP54: `pg_catalog.pg_roles` mostró **31 roles reservados y cero personalizados adicionales**, INC-53 cerrado. R2: estructura restaurada, **owners y ACL omitidos**; la inspección TOC de CP55 solo se probó con material sintético. CP46: TLS del cliente al pooler `verify-full` PASS, backend SSL reportó NO; CP48 enforcement OFF en UI, end-to-end NO certificado. No repetir R2, GPG, SQL ni conectar a Supabase con esta autorización.

**Próxima puerta:** recibir exclusivamente marcadores del verificador Windows y clasificar si el respaldo actual guarda SHA/cifrado consistente. Solo **luego**, con autorización distinta, diseñar lectura TOC real, uso GPG histórico y auditoría ACL/owners/restore aislado. Google Drive excluido. `main` privado.

**Prompt de continuidad:** «Retomar ByteTorque SEC-07 solo desde main; leer AGENTS.md, agent.md, roadmap.md, CP56 `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_READONLY_PREP_20261120.md` y registro de incidentes, verificar HEAD. Usuario autorizó **preparar** auditoría local read-only hash/manifest del respaldo existente, no usar backup real por el asistente. ZIP privado `BT_SEC07_R3_MANIFEST_READONLY_20261120.zip` SHA-256 `d052e3fdc05e8896bbf1f6b8c6bf48c27b2fffb5b7d51432f8077927278ac4a8`, tamaño 8751B, 48/48 sintéticos PASS antes y después de extraer. Script usa selector de `manifest.json`, `project_ref` vinculado al exportador original, `backup_id` carpeta, `files` lista {name,bytes,sha256}, solo lee .gpg aprobados y compara SHA; no GPG/red/subprocess/escritura, no log de rutas/hash. PASS solo consistencia interna, no autenticidad independiente ni restore. En Windows aún no probado. Solicitar solo salida BT_SEC07_*, STOP sin reintento. R3 owners/ACL/TOC real pendientes, rol SQL histórico vacío, SSL enforce OFF y end-to-end pendiente, piloto A REPASAR. Documentar hallazgos y nuevas autorizaciones antes de usar GPG o producción». 
