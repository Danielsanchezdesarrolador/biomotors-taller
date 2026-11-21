# CHECKPOINT — BT-SEC07-R3-WINDOWS-QA-PASS-30 · Windows 18/18 PASS y GPG efímero real candidato

**Fecha:** 20/11/2026 · **Repo:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main` · **HEAD al inicio:** `051d9eb0e2e0ded35252072dec4e4540d2fb990b` · **alcance:** sólo documentación GitHub + QA sintética en PC reportada por propietario + GPG efímero sintético realmente probado en entorno del asistente. **Sin acceso a Supabase alojado, DB, claves de proyecto ni respaldos.**

## 1. Evidencia en Windows recibida y cerrada (no repetir)

El propietario ejecutó la prueba SEC-07 R3 del ZIP `BT_SEC07_R3_SYNTHETIC_LAB_20261120.zip`, hash del ZIP validado:
```text
BT_SEC07_ZIP: VERIFIED
Ran 18 tests in 4.768s
OK
BT_SEC07_WINDOWS_QA: PASS
```
Se enumeraron 18 casos `test_binary_payload_invalid_utf8`, `test_comments_only`, `test_corrupt_ciphertext_cleans_file`, `test_decrypt_nonzero_cleans_file`, `test_duplicate_destination_preserved`, `test_encrypt_empty`, `test_encrypt_nonzero`, `test_isolation_sentinel_unchanged`, `test_no_sql_stdout`, `test_partial_sql_with_nonzero`, `test_producer_nonzero`, `test_producer_oversize`, `test_reject_custom_output_path`, `test_unicode_binary_pipe`, `test_unrelated_sql`, `test_valid_sql_end_to_end_mock`, `test_whitespace_only`, `test_zero_byte_producer`, todos `ok`. Clasificación: **QA sintético Windows con simulador de cifrado; 18/18 PASS**. No equivale a GPG real, productor remoto ni restauración de roles/ACL.

## 2. Avance independiente: laboratorio GPG real SOLO con claves efímeras y SQL inventado

**Artefacto privado descargable en conversación, NO en repo:** `BT_SEC07_R3_GPG_EPHEMERAL_20261120.zip`

**SHA-256:** `051cbe04f6b7b900310bcab615b7b240ff8ff8b22abfe445b555e537ae4d078e` · **3 archivos:** `bt_sec07_gpg_ephemeral.py`, `test_bt_sec07_gpg_ephemeral.py`, `README.md`.

Implementación de prueba en Python: invoca ejecutable GnuPG en subproceso binario sin shell, crea `GNUPGHOME` totalmente nuevo por laboratorio bajo temporal, genera clave RSA temporal sin passphrase **sólo para ensayo** (GnuPG `--generate-key` batch), utiliza `--homedir` explícito para TODO acceso GPG; cifra entrada fija ficticia `CREATE ROLE bt_sec07_ephemeral NOLOGIN;` hacia ciphertext GPG binario (SQL claro únicamente en memoria), crea archivo temporal nuevo con modo exclusivo, comprueba SHA-256 y descifra con la misma clave efímera, coteja bytes. Maneja ausencia de destinatario, archivos preexistentes, corrupción, contenido incorrecto y limpieza acotada exclusivamente al temporal recién creado. No acepta SQL real ni comandos arbitrarios por línea de comandos. Al salir solicita cerrar sólo agente GPG de ese homedir y elimina dicho temporal. La clave test sin passphrase **NUNCA debe usarse con datos reales**. Borrado de temporales en SSD NO garantiza borrado criptográfico.

**Resultados realmente ejecutados en entorno del asistente (Linux + GnuPG 2.4.7):**
- `python -m unittest discover -v`: **14 tests, OK**, tiempo aproximado 15.590 segundos.
- `python bt_sec07_gpg_ephemeral.py`: `GPG_LAB_MODE: SYNTHETIC_ONLY_NO_DB`, `GPG_REAL: PASS_EPHEMERAL_KEY`, `GPG_HOME: TEMPORARY_AND_REMOVED`, `REAL_ROLES_BACKUP: NOT_ATTEMPTED`.
- ZIP generado con tres archivos fuente de test, extraído en nuevo `TemporaryDirectory`, suite tras extracción **14/14 PASS**, autoselfcheck tras extracción PASS; SHA registrado, 6173 bytes.
- **No ejecutado en Windows aún**. Test de ausencia de comandos de DB es revisión de fuente, no auditoría de red del sistema. Esta evidencia NO prueba acceso al keyring histórico ni recuperación de roles/owners/grants. No mezclar la clave test con GPG del propietario.

**Documentación oficial revisada:** Supabase changelog 04/11/2026 confirma CLI v3 local por defecto https://supabase.com/changelog/supabase-cli-v3 y GnuPG documenta generación batch y `%no-protection` sólo para pruebas https://www.gnupg.org/documentation/manuals/gnupg/Unattended-GPG-key-generation.html .

## 3. Próxima acción segura en Windows — solo con consentimiento para ejecutar laboratorio efímero

1. Descargar ZIP en Descargas; antes de extraer verificar `Get-FileHash -Algorithm SHA256` == `051cbe04f6b7b900310bcab615b7b240ff8ff8b22abfe445b555e537ae4d078e`.
2. Extraer a carpeta **nueva** bajo `$env:TEMP` completamente ajena a `BT-Backups` y checkout GitHub, sin secretos ni GPG histórico.
3. Revisar `README.md`; confirmar `gpg --version` (sin listar claves ni compartir datos de usuario).
4. Ejecutar desde carpeta extraída `py -3 -m unittest discover -v` o `python -m unittest discover -v`. Esperado `Ran 14 tests ... OK`. Después `py -3 .\\bt_sec07_gpg_ephemeral.py` o Python equivalente. Marcadores `BT_SEC07_GPG_LAB_MODE: SYNTHETIC_ONLY_NO_DB`, `BT_SEC07_GPG_REAL: PASS_EPHEMERAL_KEY`, `BT_SEC07_GPG_HOME: TEMPORARY_AND_REMOVED`, `BT_SEC07_REAL_ROLES_BACKUP: NOT_ATTEMPTED`.
5. Compartir solo estos estados/códigos sin datos sensibles; ante fallo STOP y documentar `INC-ID`/causa probada frente a hipótesis, sin reintentos ciegos.

**No ejecutar aquí:** `supabase db dump`, `pg_dumpall`, acceso remoto, Docker restore, cifrado usando clave real, lectura del GNUPGHOME antiguo, cambios DB/Auth/RLS/Render, destino Drive, ni ninguna mutación de backup/manifiesto.

## 4. Diagnóstico y continuidad

**INC heredado sin raíz demostrada:** `ROLES_ORIGEN_FALLA_NO_CLASIFICADA`; antiguo `roles.sql.gpg` descifra a 0 bytes, por tanto no válido. Protocolo antierror mantiene rechazo de SQL vacío, error de productor, readback/cifrado, no sobreescritura y nunca interpretación de `GPG exit=0` como exportación SQL restaurable. **No hay incidente nuevo de PC:** Windows dio 18/18 PASS. Sin nuevas operaciones sobre Supabase ni backups.

**Hitos NO acreditados:** roles SQL reales exportados y reimportados; owners/ACL/default grants; paridad contra origen actual; Auth/Storage/Edge/secrets; pruebas RLS negativas por taller; segundo respaldo cifrado fuera del PC (Google Drive excluido expresamente). `BT-PILOT-QA-04: A REPASAR`. Repositorio visto público históricamente, visibilidad sin modificar.

**Cierre de bloque:** editar `AGENTS.md` sólo si surge nueva regla; ya existe regla permanente de checkpoint tras CADA avance; actualizar `roadmap.md`, `agent.md`, e informe histórico al concluir, con commit `[skip render]` exclusivamente documental; no ejecutar CI ni desplegar.

## 5. Prompt de traspaso listo para nuevo chat

> Continúa la seguridad de ByteTorque exclusivamente en `main`. Lee por orden `AGENTS.md`, `agent.md`, `roadmap.md`, este checkpoint `CHECKPOINT_BT_SEC07_R3_WINDOWS_PASS_GPG_EPHEMERAL_PREP_20261120.md` y el informe `docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md`. La CLI Supabase 3.0.0 y sus 4 flags ya están validados en Windows; paquete anterior sintético pasó **18/18 Windows PASS con hash correcto**: NO repetirlos. Nuevo candidato ZIP con GPG real y claves temporales aisladas hash `051cbe04f6b7b900310bcab615b7b240ff8ff8b22abfe445b555e537ae4d078e`: **14/14 PASS en entorno asistente y tras extracción, Windows PENDIENTE**. No tocar keyring original ni el snapshot, SQL real ni producción, sin nueva autorización. El próximo paso es validar ese ZIP y ejecutar solo laboratorio efímero en PC, luego reportar categorías saneadas. Nunca certificar roles/grants/Auth ni piloto con solo pruebas sintéticas. Drive excluido. Documentar siempre errores/soluciones y dejar nuevo checkpoint, agent.md y roadmap.md por commit `[skip render]`.
