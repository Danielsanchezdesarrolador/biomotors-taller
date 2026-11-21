# CHECKPOINT — BT-SEC07-R3-CONNECTION-OFFLINE-WINDOWS-PASS-42 · Herramientas locales presentes, aún sin conexión a origen

**Fecha:** viernes 20/11/2026, Chile · **Repo:** `Danielsanchezdesarrolador/biomotors-taller` · **rama autorizada:** `main` · **HEAD de partida:** `0e3fc48f2e6cdb88d8af90fd47487bc006a803ab`. **Alcance original autorizado:** preparar y comprobar localmente el método de conexión, **sin conectar a Supabase ni generar respaldos**. El propietario ejecutó el preflight del [checkpoint 41](CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_PREP_20261120.md) en Windows y compartió exclusivamente indicadores sanitizados.

## 1. Evidencia REAL recibida desde PC Windows

```text
BT_SEC07_CONN_ZIP: VERIFIED
BT_SEC07_PG17_CLIENTS: ALL_PRESENT
BT_SEC07_PG17_PSQL: PRESENT
BT_SEC07_PG17_PGDUMPALL: PRESENT
BT_SEC07_PG17_PGDUMP: PRESENT
BT_SEC07_PG17_PGRESTORE: PRESENT
BT_SEC07_NODE_COMMAND: FOUND
BT_SEC07_NPX_COMMAND: FOUND
BT_SEC07_TLS_CERT_LIKE_FILES: ONE_UNVALIDATED_CANDIDATE
BT_SEC07_SYNTHETIC_DB_URL_NO_PASSWORD: PASS
BT_SEC07_SESSION_POOLER_5432: HISTORICAL_POLICY_ONLY_NOT_CHECKED
BT_SEC07_TLS_VERIFY_FULL: REQUIRED_FOR_FUTURE_NOT_TESTED
BT_SEC07_TEMP_PGPASS_STRATEGY: DESIGNED_NOT_CREATED
BT_SEC07_CLI_V3_REMOTE_DB_URL: SOURCE_REVIEWED_NOT_EXECUTED
BT_SEC07_SUPABASE_REMOTE: NOT_CONNECTED
BT_SEC07_GPG_HISTORICAL_KEYRING: NOT_ACCESSED
BT_SEC07_ROLES_BACKUP: NOT_ATTEMPTED
BT_SEC07_PREFLIGHT: COMPLETE_LOCAL_METADATA_ONLY
BT_SEC07_CONN_WINDOWS: PASS_OFFLINE_ONLY
```

**Resultado:** `BT-SEC07-R3-CONNECTION-OFFLINE-WINDOWS: PASS` **solo para disponibilidad de componentes y diseño sintético**. Comprobado en rutas locales: binarios `psql.exe`, `pg_dumpall.exe`, `pg_dump.exe` y `pg_restore.exe` de PG17; Node/NPX; **un archivo con extensión parecida a CA en `BT-Secrets`**. `SYNTHETIC_DB_URL_NO_PASSWORD: PASS` ensayó **URL ficticia**, NO datos reales ni aceptación por Supabase. `PG17_CLIENTS: ALL_PRESENT` significa existencia en ruta estándar, no versión efectiva ejecutada en este bloque ni conectividad.

## 2. Controles explícitamente NO verificados

1. **Candidato TLS no validado**: `ONE_UNVALIDATED_CANDIDATE` no prueba que sea certificado CA, que sea un certificado válido, vigente, autorizado para ese endpoint ni que hostname y cadena TLS coincidan. `TLS_VERIFY_FULL` figura REQUIRED pero **NOT_TESTED**.
2. **Destino de base real:** `SESSION_POOLER_5432: HISTORICAL_POLICY_ONLY_NOT_CHECKED` es documentación histórica, no comprobación de proyecto, identidad de servidor ni aceptación de conexión actual.
3. **Secreto/PGPASSFILE:** `TEMP_PGPASS_STRATEGY: DESIGNED_NOT_CREATED`. No se creó archivo de credenciales, no se verificó asociación host/puerto/db/user, permisos ACL ni capacidad de autenticación. No pedir que se pegue contraseña ni cadena de conexión en chat.
4. **CLI v3:** `CLI_V3_REMOTE_DB_URL: SOURCE_REVIEWED_NOT_EXECUTED`. Su código etiquetado v3.0.0 confirma que `--remote=<postgresql://...>` usa ruta `DbUrl` separada de linked/ref, pero aún no se ejecutó sobre destino real; evitar `--remote=<ref>` sin contraseña por potencial provisión de rol temporal no deseada.
5. **Ningún backup:** `SUPABASE_REMOTE: NOT_CONNECTED`, `ROLES_BACKUP: NOT_ATTEMPTED`, `GPG_HISTORICAL_KEYRING: NOT_ACCESSED`. No certificar roles, grants, ACL, propietarios, restorability ni aislamiento A/B con este resultado.

## 3. Auditoría de continuidad y causa histórica

- ZIP del checkpoint 41 `BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_20261120.zip`, SHA-256 `37ef628d973b65a999e5be4b516ccc28c34aa311ef7600396173b0ad90e87edc`, Windows `CONN_ZIP: VERIFIED`. Nuevos tests offline 18/18 PASS en asistente y tras extraer; PC ejecutó únicamente preflight con resultados anteriores, **no suite de tests**.
- Etapas cerradas Windows: laboratorio productor sintético 18/18 PASS, GPG real efímero 14/14 PASS, combinado 15/15 PASS, comparación cabecera OpenPGP V2 backup principal PASS. **No repetir**.
- R2 snapshot principal ya logró `PARITY_GPG_PROCESS: OK` / `PARITY_PG_RESTORE_PROCESS: OK`, pero solo certificación `SNAPSHOT_STRUCTURE_ONLY`, no roles/owners/ACL/Auth/Storage. El `GNUPGHOME` histórico aislado ya tuvo llave privada coincidente; no crear nueva ni confundir anillo default sin secreta.
- Incidente histórico `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` (pg_dumpall exit 1, causa exacta **desconocida**); `roles.sql.gpg` antiguo descifra 0 bytes. No declarar solucionado por presencia `PGDUMPALL: PRESENT`.
- `BT-PILOT-QA-04: A REPASAR`. Google Drive fuera; no activar workflow histórico.

## 4. Siguiente bloque recomendado — puertas de autorización claras

**Objetivo de la siguiente fase:** validar localmente sin divulgación el certificado CA (parseo público, no leer material de claves privadas), vínculo de host de sesión/port 5432 con el proyecto esperado y contrato de `PGPASSFILE` de permisos temporales, sin publicar ningún URL secreto. Antes de **cualquier** conexión al origen, comprobar qué comando concreto se lanzará, que no seleccionará `linked/ref`, que TLS `verify-full` estará activo y que no modifica la base o crea roles. Un paso preflight adicional en PC **offline** cabe dentro de la autorización de preparación, pero NO se ha ejecutado. Evitar largas suites repetidas o recrear ficheros persistentes.

**Puerta posterior, aún NO autorizada:** conexión de verificación de identidad/TLS únicamente con sesión y rol de lectura, sin exportar datos SQL ni GPG todavía. Requerir aprobación explícita separada para ese acceso. Requerir también consentimiento específico para exportación cifrada de roles reales, uso criptográfico de keyring histórico y/o restauración de permisos. No ampliar el permiso actual por inferencia.

## 5. Cambios efectuados y no efectuados

**Hecho:** lectura GitHub `AGENTS.md`, `agent.md`, `roadmap.md`, contrato R3, informe histórico y checkpoint 41; recibida evidencia Windows; documentación `main` con `[skip render]`. **No hecho:** conexión a Supabase, dump/SQL, cifrado, desencriptación, GPG home, creación de secretos/PGPASSFILE, cambios de credenciales, backups/manifests, roles/owners/ACL, Docker, Render, deploy, GitHub visibilidad o Drive. **Nuevo incidente:** ninguno; el marcador `ONE_UNVALIDATED_CANDIDATE` es incertidumbre normal, no falla.

## 6. Prompt de continuidad a otro chat

> Continua seguridad ByteTorque SEC-07 desde `main`. Lee `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_WINDOWS_PASS_20261120.md` y `docs/BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md`; verificar HEAD. Usuario autorizó SOLO preparar y comprobar método local, sin conectarse a Supabase ni generar respaldos. Resultado real Windows: `CONN_ZIP: VERIFIED`, `PG17_CLIENTS: ALL_PRESENT` (psql/pg_dumpall/pg_dump/pg_restore), `NODE_COMMAND: FOUND`, `NPX_COMMAND: FOUND`, `TLS_CERT_LIKE_FILES: ONE_UNVALIDATED_CANDIDATE`, `SYNTHETIC_DB_URL_NO_PASSWORD: PASS`, `TLS_VERIFY_FULL: REQUIRED_FOR_FUTURE_NOT_TESTED`, `TEMP_PGPASS_STRATEGY: DESIGNED_NOT_CREATED`, `CLI_V3_REMOTE_DB_URL: SOURCE_REVIEWED_NOT_EXECUTED`, `SUPABASE_REMOTE: NOT_CONNECTED`, `GPG_HISTORICAL_KEYRING: NOT_ACCESSED`, `ROLES_BACKUP: NOT_ATTEMPTED`, `CONN_WINDOWS: PASS_OFFLINE_ONLY`. **Disponibilidad local PASS, conexión no certificada.** Fuente CLI 3.0.0 favorece `--remote=<postgresql URL sin password>` con libpq/PGPASSFILE, no `--remote=<ref>` si puede crear rol temporal. Siguiente avanzar agrupado: cert CA sintáctico, hostname/puerto de destino, esquema de secreto efímero/ACL, todo offline y resultados sanitizados; **no ejecutar conexión sin nueva autorización explícita**. No repetir tests 18/14/15, R2 restore ni comparador de GPG; el keyring aislado histórico tiene privada coincidente, default 0 secretas. Incidente roles SQL histórico vacío y error productor desconocido, roles/owners/ACL pendientes, piloto A REPASAR, Drive excluido. Registrar siempre nuevo checkpoint agent/roadmap e incidentes en `main`.
