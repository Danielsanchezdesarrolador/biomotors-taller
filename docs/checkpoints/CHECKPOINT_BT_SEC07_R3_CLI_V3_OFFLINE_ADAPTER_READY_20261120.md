# CHECKPOINT — BT-SEC07-R3-CLI-V3-OFFLINE-ADAPTER-READY-52

**Fecha:** 20/11/2026 (Chile). **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`, rama exclusiva `main`, **HEAD de partida:** `67d713752d0471b5c06bb21cced368f1ea330c14`.

## 1. Autorización y ejecución REAL de esta fase

El propietario respondió **«autorizo»** a **preparar** R3 para la futura exportación cifrada de roles PostgreSQL reales, **sin ejecutarla todavía contra Supabase**. No autoriza conexión nueva a Supabase, ejecución de `pg_dumpall`/CLI real, inventario de `pg_roles`, uso GPG histórico, exportación, restauración, modificación de SSL enforcement, despliegue, cambios de roles/ACL ni manipulación de backups existentes. En esta fase se leyeron `AGENTS.md`, `agent.md`, `roadmap.md`, CP51 y documentos R3 históricos; se verificó el HEAD de `main`.

Se contrastaron:
- `docs/BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md` y [CP33](CHECKPOINT_BT_SEC07_R3_COMBINED_WINDOWS_PASS_AND_REAL_EXPORT_GATE_20261120.md): suite previa 18/18 mock, 14/14 GPG efímero, 15/15 integrado en Windows **ya aprobadas; NO repetir**. `roles.sql.gpg` viejo SQL 0 bytes y productor `pg_dumpall exit 1` **sin causa original clasificada**.
- Código fuente **Supabase CLI v3.0.0** en tag oficial [pg-dump.scripts.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/pg-dump.scripts.ts), [dump.handler.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/commands/db/dump/dump.handler.ts), [db-config.layer.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/db-config.layer.ts) y [remote-value.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/target/remote-value.ts). En CLI v3 `--role-only` usa `pg_dumpall --roles-only --role postgres --quote-all-identifier --no-role-passwords --no-comments`, filtro de reservados, y añade `RESET ALL;`. Una salida no vacía no garantiza roles propios. `--file` genera SQL claro con modo 0644; stdout binario tiene peligro de fragmentos ante retry. `linked/ref` sin password puede crear login role `read_only:false`; preferir **DbUrl explícito sin password en argv** con `verify-full` y credenciales libpq protegidas, pero eso **no ha sido ejecutado** sobre roles reales.
- [PostgreSQL 17 pg_dumpall](https://www.postgresql.org/docs/17/app-pg-dumpall.html): `--no-role-passwords` omite contraseñas y hace lectura en `pg_roles`; un dump de roles no acredita permisos de objetos, default privileges, almacenamiento ni RLS.
- [Supabase changelog](https://supabase.com/changelog.md) verificado al 20/11/2026: CLI v3 desde 04/11/2026 local por defecto; `--remote` explícito obligatorio. No se ejecutó CLI real ni se publicó nada.

## 2. Entregable privado y alcance técnico

ZIP **`BT_SEC07_R3_CLI_V3_OFFLINE_ADAPTER_20261120.zip`**, tamaño **5513 bytes**, SHA-256 **`a30de4ba1f619de2654da206e9804cb753fac386c7ad2ac3ef85b8e49cc51596`**; archivo creado y verificado en entorno de trabajo del asistente, disponible únicamente en la conversación. **NO se subió código ejecutable a GitHub**, solo documentación. Contiene:
- `bt_sec07_r3_cli_v3_offline.py`: analizador de **bytes fabricados** en memoria que clasifica señales de `CREATE ROLE`, `ALTER ROLE`, `GRANT`, `RESET ALL;` y ajustes usuales de pg_dumpall. Recibe **código de salida del productor simulado** y opcionalmente **número agregado esperado de roles personalizados**. No conserva ni muestra SQL, nombres, huellas o URLs; solo diagnóstico y conteos.
- `test_bt_sec07_r3_cli_v3_offline.py`: **27 pruebas unitarias NUEVAS** que cubren particularidades de salida CLI v3: `RESET ALL` aislado, comentarios de roles reservados, UTF-8, identificador entrecomillado, roles cero legítimos, inventario desconocido, error de productor con SQL parcial, salida vacía/nula/gigante, mismatch/duplicados, acceso meta `\\restrict`, SQL ajeno, GRANT sobre tablas no esperado y errores de parseo.
- `README.md`: límites, prohibición de usar SQL real, controles y puertas de autorización.

**Resultado comprobado:** 27/27 unit tests offline PASS antes de empaquetar; **27/27 PASS tras descomprimir ZIP** a carpeta aislada; prueba `offline_smoke` emite solo:
```text
BT_SEC07_R3_ADAPTER_MODE: OFFLINE_FIXTURES_ONLY
BT_SEC07_R3_CLI_V3_SHAPE: PASS_SYNTHETIC_ONLY
BT_SEC07_R3_SOURCE_DB: NOT_CONNECTED
BT_SEC07_R3_REAL_ROLE_EXPORT: NOT_ATTEMPTED
BT_SEC07_R3_GPG_HISTORICAL: NOT_ACCESSED
BT_SEC07_R3_ROLES_RESTORE: NOT_ATTEMPTED
BT_SEC07_R3_OFFLINE_GATE: PASS_NOT_PRODUCTION_READY
```

**Seguridad del artefacto:** NO importa módulos de red, `subprocess` ni GPG; no ejecuta SQL ni lee archivos/credenciales; la función principal solo procesa bytes ya entregados por fixtures. **No es un ejecutor remoto ni un parser SQL completo**. Puede rechazar sintaxis real legítima desconocida: eso constituye STOP SEGURO y requiere revisar el formato bajo nueva autorización en entorno aislado, no «arreglarlo» admitiendo cualquier SQL. Su objetivo es preparar **guardias de forma** para un futuro wrapper privado; NO produce, cifra ni valida un respaldo real. No copiar SQL real al chat ni utilizar datos del propietario para completar tests.

## 3. Estado de los riesgos y límites

**R3 verdadero: sigue pendiente.** No hay evidencia de restaurabilidad real de roles/owners/ACL, no se ha constatado número de roles propios no reservados y el error original `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` permanece **ABIERTO**. Un productor exitoso puede dar `RESET ALL;` solo y **no** prueba backup roles. Si el origen tiene cero roles propios, el marcador de laboratorio `ZERO_CUSTOM_ROLES_REQUIRES_SEPARATE_ACL_BACKUP` clasifica ausencia legítima por inventario confirmado, sin certificar owners ni ACL.

**Separar obligaciones:**
1. Roles y membresías/atributos del clúster, sin contraseñas; la CLI filtra reservados.
2. Owners, GRANT/REVOKE de objetos, default privileges, ACL de esquemas y TOC del snapshot; R2 restauró con `--no-owner --no-acl` y NO los acreditó.
3. Pruebas negativas de RLS entre talleres/usuarios y permisos de funciones.
4. Auth/Storage object bytes/Edge source+secrets y settings externos.
5. Copia cifrada fuera del PC y restore aislado autorizado; Google Drive actualmente excluido.

**SSL actual:** CP48 evidencia visual de `Enforce SSL on incoming connections = OFF`. CP46 verificó **PC→pooler TLS verify-full PASS** y reportó `DB_BACKEND_SSL: REPORTED_NO` en una sesión; `END_TO_END_TLS: NOT_CERTIFIED`. El titular no ha autorizado cambiar SSL, cuyo cambio reinicia PostgreSQL. **No inferir que exportar roles en este estado es equivalente a cifrado end-to-end**; futura autorización remota deberá ponderar o remediar ese riesgo. No autorizar automáticamente un dump tras el QA sintético.

**Infra disponible:** CP42 PG17 `psql/pg_dumpall/pg_dump/pg_restore` presentes y Node/NPX disponibles; CP46 identidad/TLS de cliente de lectura PASS **solo para conexión de diagnóstico**. No reutilizar permisos de conexión pasados para una exportación o inventario nuevo. Repo GitHub privado, rama `main` sola, sin deploy; piloto `BT-PILOT-QA-04: A REPASAR`.

## 4. Siguiente etapa recomendada (NO ejecutar sin otro permiso)

**Paso 1 — nuevo consentimiento SOLO de lectura:** elaborar y, **si el usuario autoriza expresamente**, efectuar **UN inventario agregado** de roles no reservados y de cobertura potencial de propietarios/ACL (sin SQL ni nombres/atributos sensibles en la salida) para saber si se espera al menos un `CREATE ROLE` no reservado; esto es un SELECT nuevo contra origen, no incluido en el consentimiento presente.

**Paso 2 — diseño wrapper remoto separado:** resolver credenciales fuera de argv e historial, identidad del destino, CA y TLS, `PGGSSENCMODE=disable`, crear entorno temporal privado, fijar CLI v3, forzar `--remote=<postgresql URL sin password>` (no linked/ref ni `--file`). No ejecutar hasta nueva aprobación. El futuro wrapper debe **capturar stdout bytes acotados y stderr clasificado**, clasificar exit primero, rechazar SQL solo `RESET ALL` cuando inventario propio >0, cifrar en destino nuevo único con GPG aprobado, verificar GPG exit/readback/hash/manifiesto y realizar restore aislado con autorización propia. Si usuario dispone de cero roles personalizados, documentar el hecho en vez de fabricar roles.

**Paso 3 — permisos de objetos**: TOC de snapshot previo bajo permiso específico y/o extracción de esquema con ACL (separada), prueba restauración en sandbox, no ejecutar `GRANT` en producción.

**No hacer ahora:** `pg_dumpall`, `supabase db dump`, `psql`, `execute_sql`, Edge Functions, GPG histórico, Docker real, Auth/RLS, backup ni SSL enforcement, despliegues Render o acciones GitHub. No repetir 18/14/15, R2 restore ni comparadores V2 anteriores.

## 5. Continuidad / prompt

> Continuar ByteTorque SEC-07 desde `main`. Antes de avanzar leer `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CLI_V3_OFFLINE_ADAPTER_READY_20261120.md` y el informe incidentes. Usuario autorizó PREPARAR R3 export cifrado de roles reales, **SIN EJECUTAR** contra Supabase. Entregable ZIP privado `BT_SEC07_R3_CLI_V3_OFFLINE_ADAPTER_20261120.zip` SHA256 `a30de4ba1f619de2654da206e9804cb753fac386c7ad2ac3ef85b8e49cc51596`, 5513B, analizador offline sin subprocess/network/GPG con **27/27 nuevas pruebas PASS y 27/27 tras ZIP**, selftest OFFLINE_FIXTURES_ONLY, DB NOT_CONNECTED/REAL_ROLE_EXPORT NOT_ATTEMPTED. **NO es backup ni wrapper remoto todavía**. Fuente CLI v3.0.0: roles-only `pg_dumpall --no-role-passwords`, filtrado reservado, `RESET ALL` engañoso y peligro linked/ref de login-role temporal; `--remote=<DB_URL_SIN_PASSWORD>` solo propuesta. Inventario real de roles personalizados aún DESCONOCIDO, error pg_dumpall anterior causa NO clasificada, roles.sql.gpg viejo 0 SQL, owners/ACL no probados. CP46 TLS PC→pooler PASS, backend SSL NO, CP48 enforce SSL OFF UI, end-to-end no certificado. Cualquier SELECT de inventario, nueva exportación/clave GPG/restore/activar SSL exige permiso NUEVO. En próxima etapa considerar obtener **recuento agregado SIN nombres** de roles no reservados y evaluar cobertura ACL, luego crear wrapper remoto con gates y recuperación independiente. No Drive; piloto A REPASAR; no modificar apps/DB. Registrar checkpoint y solución real en main [skip render].
