# CHECKPOINT — BT-SEC07-R3-COMBINED-WINDOWS-PASS-33 · Integración 15/15 PASS y puerta controlada para roles reales

**Fecha:** viernes 20/11/2026 (Chile) · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main` · **HEAD antes de documentar:** `d2938676e5a45d08bac232027a581af457a11ff2`. **Trabajo efectivamente realizado en esta intervención:** recepción/validación de resultados Windows, lectura de `AGENTS.md`, `agent.md`, `roadmap.md`, checkpoints 31/32 e historial de incidentes; revisión solo lectura de la fuente de Supabase CLI v3.0.0 y escritura de documentación GitHub. Sin conexión a producción.

## 1. Resultado real proporcionado por propietario (PC Windows)

Paquete privado `BT_SEC07_R3_COMBINED_BRIDGE_20261120.zip`, SHA-256 previamente registrado `e4fda9667879998aa5214d8bb6357b618b67e14e9bcf7ee484a706578526f44c`:

```text
BT_SEC07_COMBINED_ZIP: VERIFIED
Ran 15 tests in 10.588s
OK
BT_SEC07_COMBINED_WINDOWS_QA: PASS
BT_SEC07_COMBINED_MODE: SYNTHETIC_PRODUCER_REAL_GPG
BT_SEC07_COMBINED_RESULT: PASS
BT_SEC07_KEYRING: EPHEMERAL_REMOVED
BT_SEC07_SUPABASE_REMOTE: NOT_CONNECTED
BT_SEC07_REAL_ROLES_BACKUP: NOT_ATTEMPTED
BT_SEC07_COMBINED_SELFTEST: PASS
```

Los tests `test_01` a `test_15`, enumerados en la transcripción del propietario, devolvieron todos `ok`: productor sintético binario→GPG efímero, Unicode, rechazo de SQL vacío/solo comentarios/ajeno, exit !=0 con SQL parcial, tamaño excesivo, destinatario ausente, corrupción del ciphertext, destino existente, ausencia de SQL persistente/log, limpieza, rechazo de fixture extra, salida de autocontrol sanitizada y no usar `GNUPGHOME` original.

**Cierre:** `BT-SEC07-R3-COMBINED-WINDOWS-QA: PASS`. NO repetir: laboratorio mock 18/18, laboratorio GPG real efímero 14/14 y este integrado 15/15 ya aprobados por el propietario en Windows. Son pruebas con datos inventados, no con Supabase real.

## 2. Investigación adicional de la CLI v3.0.0 oficial — lecturas SIN ejecución

Archivos exactos verificados en la tag `v3.0.0` del repositorio `supabase/cli`:
- https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/pg-dump.scripts.ts
- https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/pg-dump.env.ts
- https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/db-config.layer.ts
- https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/db-config.parse.ts
- https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/target/resolve-target.ts
- https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/commands/db/dump/dump.handler.ts

**Hallazgo relevante A — no basta SQL no vacío:** el script `--role-only` usa `pg_dumpall --roles-only --role postgres --quote-all-identifier --no-role-passwords --no-comments`, filtra roles reservados y añade `RESET ALL;`. Por tanto **`exit=0` y bytes>0 pueden coexistir con ningún rol propio útil exportado**. Antes de certificar roles recuperables, comparar con inventario esperado de roles no reservados (agregados, sin nombres privados) y comprobar tipos de sentencias esperadas. Si el inventario legítimo da 0 roles personalizados, no interpretar automáticamente como fallo de la CLI: documentar ese alcance; GRANT/ACL/owners siguen aparte. El dump NO incluye contraseñas de roles.

**Hallazgo relevante B — evitar cambio alojado inadvertido:** en `db-config.layer.ts`, el camino de project-ref/linked SIN contraseña puede ejecutar `POST /v1/projects/{ref}/cli/login-role` con `read_only:false` para crear rol temporal. Eso **no ocurrió aquí** (no se conectó). El código comenta que rutas `--local`/`db-url` no construyen esa capa y que la selección `--remote=<db-url>` toma el objetivo `DbUrl`. No realizar llamada remota de project-ref sin comprobar credenciales/modo. En principio preferir URL explícita **sin contraseña en argv**, con `PGPASSFILE`/service existente aprobado y TLS; el parser v3.0.0 busca contraseña con precedencia cadena/servicio/PGPASSWORD/.pgpass. Esta es **una estrategia por validar** en un wrapper y luego en un acceso autorizado, NO una conexión probada de ByteTorque.

**Hallazgo C — preservar confidencialidad:** `--file` escribe SQL claro (modo 0644, con truncamientos); stdout binario de un reintento puede incluir fragmentos de intento fallido. Windows PowerShell textual no conserva bytes fielmente. El puente final debe mantener salida en flujo binario/subprocesos controlados sin shell, verificar ambos exits y no publicar un ciphertext si el origen falló, proteger hash/readback y no mostrar SQL/logs o secretos.

**Hallazgo D — roles ≠ ACL:** restauración R2 `--no-owner --no-acl` omitió propietarios y permisos originales. Revisar, mediante inventario offline autorizado del TOC de la copia cifrada existente, si el archivo conserva las entradas ACL; si no, preparar captura específica de grants con procedimiento separado. No repetir restore R2 ni suponer paridad actual.

## 3. Incidentes, soluciones y pruebas: estado sincero

- **INC histórico:** `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` en `pg_dumpall`: causa original **NO DETERMINADA**; `roles.sql.gpg` antiguo descifró 0 bytes y permanece inválido como respaldo de roles. La CLI v3 usa `pg_dumpall` por debajo; su presencia no demuestra corregida la raíz.
- **Incidentes nuevos Windows:** ninguno; 15/15, hash ZIP PASS y selftest PASS.
- **Riesgos preventivos nuevos sin incidente:** `RESET ALL` puede dar contenido sin roles útiles; linked/remote por ref sin password puede crear rol temporal `read_only:false`. **Solución aún NO implementada:** contrato y puertas en [runbook R3](../BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md).
- **No alterados:** `database.dump.gpg` / roles viejo / nueva copia y manifest, GPG histórico, PostgreSQL, Render, GitHub visibilidad, Supabase Auth/RLS/Storage/Edge, Google Drive o claves. Solo documentación `main` con `[skip render]`. CI no ejecutado por este cambio documental, sin despliegue.
- **Estado SEC-07:** R2 `SNAPSHOT_STRUCTURE_ONLY PASS`; R3 CLI flags PASS + mock18/18 PASS + GPG real efímero14/14 PASS + integrado15/15 PASS; **roles verdaderos/owners/grants/ACL PENDIENTES**. También faltan comparación origen actual, seguridad negativa A/B, servicios externos y copia independiente fuera del PC (Drive excluido). `BT-PILOT-QA-04: A REPASAR`.

## 4. Próximo trabajo sin red y autorizaciones

**Paso siguiente:** implementar un candidato de wrapper (privado, NO en repo) que invoque en tests a un adaptador simulado con el mismo contrato de stdout binario que `supabase@3.0.0 db dump --role-only`. Exigir selector remoto explícito, sin contraseña por línea de comandos, no usar `-f`, cap de bytes, fallo cerrado si productor retorna !=0, SQL solo memoria, destino no existente, GPG cifrado + hash/readback, guardia de `RESET ALL` sin roles, stderr saneado, hash y limpieza de parciales. No confundir eso con exportación REAL.

**Gates separados con consentimiento concreto del propietario:** (1) uso/inspección GPG del keyring histórico; (2) conexión y exportación del origen Supabase, después de establecer identidad exacta, TLS y método de credenciales sin escritura; (3) prueba de restauración aislada de roles/grants; (4) segunda copia independiente fuera del PC. Nunca solicitar que se pegue contraseña, tokens, fingerprint, URLs completas ni SQL de clientes en chat.

## 5. Prompt de traspaso a otro chat

> Continúa ByteTorque SEC-07 desde `main` y verifica HEAD. Lee `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_COMBINED_WINDOWS_PASS_AND_REAL_EXPORT_GATE_20261120.md`, `docs/BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md` y el informe de incidentes. MOCK 18/18, GPG efímero REAL 14/14 e integrado 15/15, todos PASS en Windows; NO repetirlos. El último ZIP tuvo hash PASS y `BT_SEC07_COMBINED_SELFTEST: PASS`; `SUPABASE_REMOTE: NOT_CONNECTED`, `REAL_ROLES_BACKUP: NOT_ATTEMPTED`. Fuente oficial etiquetada CLI v3.0.0: `pg_dumpall --no-role-passwords`, SQL puede contener solo `RESET ALL;`; ref/linked sin contraseña puede crear login-role `read_only:false`; considerar `--remote=<db-url>` sin contraseña en argv y libpq/.pgpass verificado. Siguiente trabajo: wrapper privado offline de stdout→GPG + guardias sin acceder a origen/keyring real. Requiere autorización independiente para exportación remota, GPG histórico y restores. Preservar copias/manifiestos; Drive excluido; piloto A REPASAR. Al finalizar guardar checkpoint, actualizar agent/roadmap/incidentes y registrar commit en `main`.
