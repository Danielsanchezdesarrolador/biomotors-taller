# CHECKPOINT — BT-SEC07-R3-GPG-WINDOWS-PASS-31 · GPG real efímero validado y puerta de exportación de roles diseñada

**Fecha:** 20/11/2026 · **Repo:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main` · **HEAD leído antes del cambio:** `5a096d47935cee46b12bac0eb2e00c64cda55b3c`. **Estado:** resultado de prueba local proporcionado por propietario + auditoría SOLO LECTURA de documentación/código oficial de Supabase CLI v3.0.0 + documentación en GitHub. **Sin contacto a la base Supabase alojada.**

## 1. Evidencia del PC Windows (cierre de laboratorio GPG efímero)

El propietario ejecutó el ZIP previamente entregado `BT_SEC07_R3_GPG_EPHEMERAL_20261120.zip`, con SHA-256 esperado `051cbe04f6b7b900310bcab615b7b240ff8ff8b22abfe445b555e537ae4d078e`, reportando:
```text
BT_SEC07_GPG_ZIP: VERIFIED
Ran 14 tests in 7.402s
OK
BT_SEC07_GPG_WINDOWS_QA: PASS
BT_SEC07_GPG_LAB_MODE: SYNTHETIC_ONLY_NO_DB
BT_SEC07_GPG_REAL: PASS_EPHEMERAL_KEY
BT_SEC07_GPG_HOME: TEMPORARY_AND_REMOVED
BT_SEC07_REAL_ROLES_BACKUP: NOT_ATTEMPTED
BT_SEC07_GPG_SELFTEST: PASS
```
Los catorce casos `test_01` a `test_14` presentados por el propietario dieron `ok`: GPG roundtrip real de clave efímera, SQL de prueba en memoria, no sobrescritura, destinatario inexistente, corrupción/hash, vacío/solo comentarios/SQL ajeno, separación de GNUPGHOME, ausencia de SQL en logs, sentinela preservado, limpieza, payload estricto y prohibición de invocación a red/Supabase dentro del laboratorio. **No repetir por rutina**. El resultado de limpieza lo afirma el laboratorio ejecutado; no implica eliminación forense en SSD.

**Calificación exacta:** `R3_GPG_EPHEMERAL_WINDOWS: PASS`. Esto prueba que **GPG real puede cifrar y descifrar datos FICTICIOS con clave TEMPORAL en ese PC**. No prueba cifrado con clave histórica, exportación de roles reales, integridad de grants/owners, autenticación, recuperabilidad integral, ni acceso remoto. El ZIP y su clave temporal NO son respaldo de ByteTorque; no incorporarlos al repositorio.

## 2. Auditoría nueva del código fuente EXACTO Supabase CLI v3.0.0 (solo lectura)

Se comprobó la tag `v3.0.0` en repositorio `supabase/cli` y se leyeron (NO se ejecutaron) los archivos:
- https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/commands/db/dump/dump.command.ts
- https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/commands/db/dump/dump.handler.ts
- https://supabase.com/docs/guides/local-development/cli/migrating-to-v3
- https://supabase.com/docs/reference/cli/supabase-db-dump

**Hallazgo 1 — stdout binario:** en `dump.command.ts` el SQL se transmite por stdout salvo `--file`; `dump.handler.ts` usa `onStdout` sobre chunks. Por ello **proponer capturar stdout con `subprocess.Popen(..., stdout=PIPE)` en Python**, no tubería textual/redirección de PowerShell, y enviar bytes a GPG mediante puente controlado. No se ha ejecutado `supabase db dump` verdadero todavía: comportamiento de red/cipher pendiente de validación real.

**Hallazgo 2 — peligro de `--file`:** `dump.handler.ts` crea/trunca salida `--file` con `mode 0o644` antes de emitir los bytes y re-trunca en reintento, lo que sería SQL legible en disco. **Prohibir `-f roles.sql` en flujo real de ByteTorque** hasta acordar almacenamiento temporal realmente protegido; preferir stdout binario y cifrado inmediato. La disponibilidad de flag FILE=True era un preflight, **NO autorización para usarlo**.

**Hallazgo 3 — fail-closed del productor:** código v3.0.0 advierte que un reintento por fallback de pooler puede dejar bytes parciales de primer intento en stdout porque el pipe no es reversible. Wrapper debe rechazar cualquier salida si el productor termina con exit != 0, evitar un ciphertext final publicable sin validación estructural y verificar hash/readback con alcance limitado. No basta con SQL > 0 o GPG exit=0. `--role-only` utiliza `pg_dumpall` bajo el capó, así que **no atribuir al cambio de CLI una solución confirmada** al antiguo error `ROLES_ORIGEN_FALLA_NO_CLASIFICADA`.

**Hallazgo 4 — selección remota/posibles efectos:** CLI v3 usa local por defecto, `--remote=<ref|branch|url>` apunta al remoto. Un issue oficial de CLI, https://github.com/supabase/cli/issues/5091 , documenta que algunos modos con token/linked pueden intentar provisionar credenciales o roles efímeros mediante Management API; **no está demostrado que suceda en ByteTorque con CLI 3.0.0**. Elegir previamente autenticación/destino que no requiera mutaciones remotas antes de llamar a cualquier comando, y no describir toda invocación como 'sin efectos de escritura' sin verificar su modo. No colocar URL con contraseña en parámetros, chat, repositorio, stdout ni logs.

**Hallazgo 5 — alcance de privilegios:** `--role-only` se anuncia como exportación de roles del clúster filtrados por Supabase; no valida por sí solo todos los owners, GRANT/REVOKE ni privilegios por defecto. [Guía de restauración Supabase](https://supabase.com/docs/guides/self-hosting/restore-from-platform) separa roles/schema/data y configuración externa. La restauración anterior usó `--no-owner --no-acl`: falta prueba de equivalencia de permisos y RLS por rol/taller.

## 3. Estado de SEC-07, incidentes y correcciones

- R1 inventario/backup cifrado existente: hecho con límites anotados; no repetir snapshot.
- R2 restauración/paridad estructural del snapshot vigente: `SNAPSHOT_STRUCTURE_ONLY PASS`, sin cotejo de filas frente a origen actual y sin ACL originales.
- R3: CLI v3.0.0 flags `FILE/ROLE_ONLY/REMOTE/DATA_ONLY=True` en Windows PASS; laboratorio MOCK 18/18 Windows PASS; laboratorio GPG real con clave efímera 14/14 Windows PASS. **Roles SQL reales, owners, ACL, grants: ABIERTOS**.
- R4 seguridad real multitenant y roles, Auth/Storage/Edge/configuración, R5 copia externa cifrada (no Google Drive) siguen pendientes. `BT-PILOT-QA-04: A REPASAR`.
- **INC histórico:** `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` causa raíz NO DETERMINADA; antiguo `roles.sql.gpg` descifra 0 bytes, conservar. **Nuevo incidente en esta jornada: NINGUNO**, las 14 pruebas pasaron.
- **Nuevo riesgo preventivo identificado (NO incidente de ejecución):** `--file` genera SQL legible con permisividad relativa 0644; stdout de un reintento puede mezclar salida parcial; auth remoto puede tener efectos secundarios según modo. Resolución propuesta: puente binario fail-closed y plan de credenciales/identidad remota, con pruebas previas y autorización; todavía no validado ejecutando producción.

## 4. Siguiente bloque EXACTO y consentimiento

**Próximo trabajo permitido sin conexión a producción:** preparar candidato privado versionado de puente **Supabase CLI 3.0.0 stdout → validador binario → GPG con destino nuevo**, probado contra un productor simulado; no usar la clave original ni SQL real en estas pruebas. Contrato: no `--file`, sin shell, flujo binario con subprocess Python, captura limitada de stderr saneado, exit de ambos productores, SQL completo no vacío en contenido sintético, cifrado escrito a ruta nueva exclusiva, hash y readback, borrado controlado de parciales, no publicación del archivo hasta verificación. Revisar si el comando real agrega metadatos o comentarios diferentes antes de definir un parser excesivamente restrictivo.

**Autorizaciones nuevas y separadas** antes de: (a) inspeccionar/usar keyring original GPG; (b) conectarse a Supabase y exportar roles reales; (c) cualquier restauración en Docker. La conexión remota no está autorizada por haber ejecutado tests efímeros.

**Documentación realizada:** actualización de `agent.md`, `roadmap.md`, este checkpoint y adenda del informe; nueva regla conservadora en `AGENTS.md` sobre stdout/--file/remoto. **No realizado:** SQL real, Supabase remoto, CLI dump real, Docker, keyring real, modificación del backup/manifiesto, Render, despliegue, Google Drive, cambio de visibilidad. Solo docs `[skip render]`.

## 5. Prompt de continuidad listo para próximo chat

«Continúa ByteTorque SEC-07 desde `main`. Lee por orden `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_WINDOWS_PASS_ROLE_EXPORT_GATE_20261120.md` y el informe de errores. Confirma HEAD real. Supabase CLI v3.0.0 flags PASS, laboratorio binario MOCK 18/18 Windows PASS y laboratorio GPG REAL EFÍMERO 14/14 Windows PASS (hash ZIP verificado); **NO repetir**. Auditoría solo lectura de fuente EXACTA `v3.0.0` identificó stdout binario, `--file` legible/truncado 0644, riesgo de reintento parcial, productor subyacente `pg_dumpall` y posibles efectos del login-role. Siguiente: diseño/QA offline de puente de productor real a GPG, sin producción ni llaves originales sin AUTORIZO específico. Respaldos existentes y Google Drive excluido; `BT-PILOT-QA-04: A REPASAR`. Al terminar documenta commit, incidentes, checkpoint y próximo paso».
