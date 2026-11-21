# CHECKPOINT — BT-SEC07-ROLES-CLI-FLAGS-PASS-29 · Contrato local CLI PASS y laboratorio binario sintético preparado

**Fecha:** 20/11/2026 (America/Santiago). **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`; **rama única:** `main`. **Base documental:** commit `5131e32fd5333034aef7ef99009c87d767d203e2`. **Tipo:** validación local declarada por el propietario + laboratorio sintético en entorno del asistente + documentación únicamente. **No producción.**

## 1. Evidencia real recibida del propietario — control CLI v3

La ejecución del bloque `npx.cmd --yes supabase@3.0.0 db dump --help` en PowerShell Windows produjo exactamente:

```text
BT_SEC07_CLI_FLAG_FILE: True
BT_SEC07_CLI_FLAG_ROLE_ONLY: True
BT_SEC07_CLI_FLAG_REMOTE: True
BT_SEC07_CLI_FLAG_DATA_ONLY: True
BT_SEC07_ROLE_EXPORT_PREFLIGHT: COMPLETE_NO_DB_ACCESS
```

**Conclusión limitada:** compatibilidad de las cuatro opciones de ayuda **CONFIRMADA en PC**. Cerrar únicamente la puerta de herramientas/flags `R3 PREFLIGHT CLI = PASS`. No repetir la comprobación en condiciones iguales. El comando pidió `--help`, sin dump, login, link ni acceso a DB; no hubo SQL producido ni remoto autorizado. `--remote` debe elegirse explícitamente en CLI v3; el antiguo `--db-url` deprecado/oculto **no es fallo**. Documentación oficial al día: https://supabase.com/changelog/supabase-cli-v3 y https://supabase.com/docs/guides/local-development/cli/migrating-to-v3 .

## 2. Laboratorio sintético aislado en el entorno del asistente

**Candidato privado entregable SOLO en chat/PC, no subir al repositorio:** `BT_SEC07_R3_SYNTHETIC_LAB_20261120.zip`.

**SHA-256 del ZIP:** `48634f2c5118a2af2b6c4449f68d71f19c72942454b5bcb9ec38d875b04e627a`.

**Contenido (tres archivos, SIN credenciales ni datos de usuario):** `bt_sec07_roles_lab.py`, `test_bt_sec07_roles_lab.py` y `README.md`.

**Resultado REAL en entorno del asistente:** `Ran 18 tests ... OK`, primero en carpeta de desarrollo y nuevamente tras extraer el ZIP en carpeta temporal; `BT_SEC07_LAB_SELFTEST: PASS`, `BT_SEC07_LAB_MODE: SYNTHETIC_NO_DB_NO_NETWORK` y `BT_SEC07_LAB_CIPHER: MOCK_NOT_GPG`; hash igual tras prueba. Probados casos controlados de productor 0 bytes, solo comentarios, texto no relacionado con roles, salida parcial seguida de exit distinto de 0, oversize, UTF-8 incorrecto, cifrador simulado fallido/vacío, lectura posterior fallida/corrupta, destino preexistente, salida fuera de ruta fija, subprocess binario Unicode, ausencia de SQL en stdout y conservación de un fichero de evidencia artificial. El trabajo no conecta a Supabase, ni invoca CLI, GPG real, Docker ni consulta datos reales.

**Límite fundamental:** el formato `.mock` **no está cifrado**, solo representa un protocolo de transporte binario y prueba de hash/lectura. El criterio sintético `CREATE/ALTER ROLE` no equivale a interpretar el SQL real de Supabase ni a demostrar owners/grants/ACL. Un resultado verde aquí **NO autoriza un dump remoto** ni acredita restauración. El ZIP se deja como archivo privado descargable desde la conversación; **para migrar a otro chat, conservarlo en PC y adjuntarlo cuando haya que reutilizarlo**, o regenerarlo con este contrato. No se incorpora su contenido a GitHub conforme a reglas de paquetes candidatos privados.

## 3. Procedimiento para validación Windows SIN riesgo remoto

1. Descargar el ZIP en carpeta nueva **fuera del repositorio y fuera de BT-Backups**.
2. Validar el hash SHA256 local del ZIP antes de extraerlo: `Get-FileHash -Algorithm SHA256 .\BT_SEC07_R3_SYNTHETIC_LAB_20261120.zip`. Comparar con `48634f2c5118a2af2b6c4449f68d71f19c72942454b5bcb9ec38d875b04e627a`.
3. Extraer en otra carpeta nueva, abrir PowerShell en ella y ejecutar `py -3 -m unittest discover -v` (o `python -m unittest discover -v`). Esperado `Ran 18 tests ... OK`; opcional `py -3 .\bt_sec07_roles_lab.py`, debe devolver tres marcadores `BT_SEC07_LAB_*`.
4. Si falla, **no repetir ni intentar exportar**: enviar solo resultado de tests/códigos sanitizados, nunca material sensible. El laboratorio no conoce rutas privadas ni admite comandos arbitrarios ni credenciales.
5. El test no debe tocar backup histórico `roles.sql.gpg`, nuevo snapshot, keyring ni manifiesto; tampoco modifica el repositorio ni Supabase.

## 4. Registro de incidencia, reparación y prevención

**Incidente histórico:** `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` de `pg_dumpall --roles-only` sigue con **CAUSA RAÍZ NO DETERMINADA**; no repetirlo ni atribuirlo sin evidencia. Defecto probado antiguo: `roles.sql.gpg` de 151 bytes descifraba 0 bytes SQL; GPG exit 0 no es prueba de contenido útil. El preflight `--file`, `--role-only`, `--remote`, `--data-only` es PASS, pero **no corrige todavía exportación real**. En el candidato de laboratorio, los fallos de productor/salida/cifrado simulado activan bloqueo y limpieza de artefactos falsos; pruebas de falla PASS **solo sintéticas**. Ningún incidente nuevo detectado por el usuario en esta etapa.

## 5. Puertas siguientes y condiciones

**Próximo paso exacto:** ejecutar y compartir resultados sanitizados de las 18 pruebas del ZIP en Windows. Después, diseñar *otro* wrapper de exportación real con selección inequívoca del proyecto, autenticación y custodia segura de secretos, análisis de salida real `--role-only`, control de stderr sin fuga, cifrado GPG **real** con bytes SQL no vacíos y readback, sin archivos SQL persistentes y con prueba de restauración aislada. La ejecución remota y cualquier ensayo GPG con keyring real requieren autorización específica y nueva evidencia; `--file` existe, pero su uso directo puede dejar SQL claro en disco. Separar **roles SQL** de **propietarios, grants, default privileges, RLS, Auth/Storage/Edge**: una copia de roles no certifica sistema completo. `BT-PILOT-QA-04: A REPASAR`.

**Operaciones NO realizadas en esta intervención:** conexión Supabase, dump real, restauración Docker, operación GPG sobre claves reales, SQL real, cambios Render/Auth/Storage, despliegue, activación de trabajos Drive, cambios de visibilidad o copia del backup a terceros. Repo observado PUBLIC en etapa previa; sin cambios; no poner secretos ni archivos privados en GitHub. Google Drive excluido definitivamente del plan activo.

## 6. Protocolo obligatorio de mudanza de chat

En la próxima conversación, instruir: «Continúa SEC-07 desde `main`; lee por orden `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_CLI_FLAGS_AND_SYNTHETIC_LAB_20261120.md` y el informe de incidentes. Confirma HEAD y no repitas control CLI v3: los cuatro flags ya dieron True. El ZIP candidato sintético pasó 18/18 en entorno del asistente; Windows está pendiente. No conectar a Supabase, exportar, cifrar reales, restaurar ni alterar producción sin autorización separada. Google Drive fuera. Al terminar actualizar roadmap, agent y checkpoint con pruebas y siguiente paso». 

**Cambio en GitHub:** solo docs con `[skip render]`; pruebas 18/18 del ZIP privado son externas al CI de GitHub. Los ficheros de seguridad/manifest permanecen intactos.
