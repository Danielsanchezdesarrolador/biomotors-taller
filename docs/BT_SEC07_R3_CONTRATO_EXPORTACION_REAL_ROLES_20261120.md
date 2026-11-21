# BT-SEC07 R3 — Contrato de exportación cifrada de roles reales (DISEÑO, no ejecutado)

**Fecha:** 20/11/2026 · **Versión objetivo:** Supabase CLI `3.0.0`, fijada por `npx` · **Estado:** contrato de ingeniería; no software desplegado ni acceso remoto autorizado. **Referencia principal:** [Checkpoint PASS-33](checkpoints/CHECKPOINT_BT_SEC07_R3_COMBINED_WINDOWS_PASS_AND_REAL_EXPORT_GATE_20261120.md).

## Alcance que se debe recuperar

**Diferenciar cuatro superficies**:
1. `roles` del clúster: sólo roles personalizados que CLI permite exportar y sus membresías/atributos admitidos. `pg_dumpall --no-role-passwords` **no** incorpora sus contraseñas; los roles reservados se filtran.
2. Owners y `GRANT/REVOKE` explícitos de objetos, `ALTER DEFAULT PRIVILEGES` y permisos de esquemas: **NO certificados** en R2 por `--no-owner --no-acl`. Reconciliar con TOC del snapshot y/o un dump de esquema autorizado.
3. Políticas RLS y aislamiento real de talleres: políticas existentes no prueban negativas por rol/taller, ni `SECURITY DEFINER`. Requiere QA separado.
4. Auth/Storage bytes/Edge/secrets/configuración externa: no recuperados por la prueba de roles.

## Hallazgos de la versión exacta y su implicación

| Evidencia comprobada en fuente CLI v3.0.0 | Consecuencia de diseño |
|---|---|
| `dumpRoleScript` llama `pg_dumpall --roles-only --no-role-passwords --no-comments` | El dump no protege contraseñas de roles; sigue siendo posible error del productor subyacente. |
| El script filtra roles reservados, concatena `RESET ALL;` | SQL con bytes >0 y exit=0 **NO basta**; establecer inventario esperado de roles no reservados. |
| `--file` crea y trunca SQL claro, permisos modo 0644 | No usar `-f` para roles reales del titular por defecto. |
| El stdout emite bytes; un retry con fallback puede dejar fragmentos | Puente binario que solo publique al verificar producer exit, contenido esperado y readback. |
| `db-config.layer.ts`: linked/ref sin contraseña puede llamar `createLoginRole({read_only:false})` | No usar ruta vinculada sin revisar previamente side effects/credenciales. |
| `DbUrl` / `--remote=<url>` evita la capa API asociada al login-role, según fuente | Candidato preferido, aún sin prueba operativa ByteTorque. `PGPASSFILE`/service TLS autorizado para no poner password en argv. |

**Fuentes etiquetadas `v3.0.0`:** [pg-dump.scripts.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/pg-dump.scripts.ts), [pg-dump.env.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/pg-dump.env.ts), [db-config.layer.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/db-config.layer.ts), [db-config.parse.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/db-config.parse.ts), [dump.handler.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/commands/db/dump/dump.handler.ts), [resolve-target.ts](https://github.com/supabase/cli/blob/v3.0.0/apps/cli/src/command-internal/target/resolve-target.ts). **No ejecutadas en este análisis.**

## Contrato del futuro wrapper privado (sujeto a implementación y QA)

- Fijar versión CLI `3.0.0`; trabajar fuera de repo y fuera de `BT-Backups`. No `supabase link`/`login` ni `db reset`/`push`.
- Antes de invocar remoto, identificar de forma inequívoca host/ref/DB con TLS `verify-full` cuando haya cadena CA disponible; preflight no publica parámetros. Evitar fallbacks que cambien de destino sin revisión.
- Preferir argumento `--remote=<DB_URL_SIN_PASSWORD>` y el secreto únicamente en configuración libpq/PGPASSFILE autorizada. No incluir password por URL, flag `--password`, historial de PowerShell o telemetría. **PENDIENTE de verificar modo exacto y disponibilidad de credenciales sin mostrarlas**.
- Sin `--file`, sin `shell=True` ni `|` de PowerShell. Python recibe `stdout` binario de `npx.cmd` y transmite a GPG sin guardar SQL claro en disco. Restringir memoria, stderr, tiempo, stdout tamaño y manejo de suspensión/cancelación. Un buffer Python no garantiza eliminación forense.
- **Fallo cerrado** para producer exit !=0 incluso si imprimió SQL parcial, salida vacía, solo `RESET ALL` cuando inventario positivo de roles esperado, error/empty GPG, corrupción/hash discrepante, colisión y desconexión. No publicar el candidato como respaldo válido hasta hash + readback cifrado y evaluación contra el inventario. No imprimir SQL/roles/identidades.
- Si el catálogo real revela **cero** roles personalizados, documentar «sin roles personalizados esperados» en vez de inventar contenido; la recuperación de owners/ACL puede seguir obligatoria.
- Preservar ciphertext anterior, keyring, manifest, snapshot, y respetar destino GPG aprobado. No sobreescribir ni crear otra copia completa PostgreSQL como consecuencia automática de un fallo de roles.
- **Pruebas requeridas antes de conectar:** mocks realistas de `pg_dumpall` v3: reservado filtrado, `RESET ALL;` aislado, role SQL válido, error con salida parcial, UTF-8, multiples intentos y colisión; contrato de parseo conservador; GPG real solo con clave temporal. **No repetir** labs de 18/14/15 ya cerrados; cubrir únicamente las nuevas diferencias de CLI.

## Puertas y progreso

| Puerta | Estado |
|---|---|
| CLI flags Windows | PASS |
| Laboratorio binario MOCK 18/18 Windows | PASS |
| GPG REAL clave efímera 14/14 Windows | PASS |
| Integración sintética productor→GPG real 15/15 Windows | PASS |
| Adaptador CLI v3 real (contra salida simulada) | DISEÑO, NO IMPLEMENTADO |
| Reconciliación credenciales/configuración histórica sin exponer secretos | PENDIENTE / AUTORIZACIÓN |
| Acceso remoto y exportación de roles reales | NO AUTORIZADO / NO EJECUTADO |
| Recuperación owners/ACL y pruebas negativas RLS | PENDIENTE |
| Auth/Storage/Edge + copia externa cifrada no Drive | PENDIENTE |

## Reglas de incidentes y continuidad

No hay nuevos errores reportados en el laboratorio combinado. El antiguo `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` de `pg_dumpall` permanece con causa no determinada; no repetirlo sin instrumento mejorado para clasificar el fallo sin imprimir stderr original. Al encontrar errores nuevos, registrar `INC-ID`, salida sanitizada, causa vs hipótesis, corrección, prueba real, riesgo, componentes no tocados y condición de reintento. [Informe histórico](BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md).

**Próxima acción implementable sin autorización remota:** producir/validar el wrapper privado offline (solo simulación CLI v3, clave GPG temporal) y someterlo a QA aislado sin exponer a GitHub, **luego** obtener consentimiento específico de propietario para preflight de credenciales/keyring y origen remoto. No prometer restore ni declarar backup de roles completo antes de verificaciones.

## Hallazgo posterior de TLS en pooler (INC-44, 20/11/2026)

**El cliente pooler de ByteTorque consiguió ejecutar un SELECT en transacción read_only PG17**, pero el primer diagnóstico devolvió `SESSION_TLS_NOT_CONFIRMED` porque usó `pg_stat_ssl.ssl=false` del **backend PostgreSQL detrás del pooler** como prueba del tramo PC->pooler. **Ese criterio es inválido**: diferenciar dos segmentos TLS. V2 del verificador (privado, no producción) utilizará `psql \\conninfo` de libpq en mismo proceso con `PGSSLMODE=verify-full` y `PGGSSENCMODE=disable`; conservará el `pg_stat_ssl` del backend como telemetría separada `DB_BACKEND_SSL=REPORTED_NO/YES` y siempre `END_TO_END_TLS=NOT_CERTIFIED`. La política de SSL enforcement Supabase puede influir ambos tramos, y **activar/configurarla puede reiniciar la base**; requerir autorización específica antes de escribir. No inferir seguridad end-to-end solo por PASS de cliente. [Checkpoint y evidencia 44](checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_TLS_BACKEND_FALSE_FIX_PREP_20261120.md). La primera conexión consentida ya ocurrió, **otro intento requiere nueva autorización expresa**; roles/ACL siguen pendientes.

## Evidencia de conectividad TLS real (CP46, 20/11/2026)

**Sesión de diagnóstico psql read-only del propietario: PASS** para tramo **PC→pooler** con `PGSSLMODE=verify-full` y `\\conninfo` directo del cliente, versión PG17 y SELECT metadata en transacción READ ONLY. `DB_BACKEND_SSL: REPORTED_NO` en `pg_stat_ssl` de PostgreSQL; `END_TO_END_TLS: NOT_CERTIFIED`. La fuente Supabase oficial indica que SSL enforcement del pooler compartido afecta ambos tramos y que **cambiarlo reinicia la base**. **No se ha leído aún el estado de configuración SSL enforcement del proyecto**, no inferir que esté off solo de un backend. Antes de exportación de roles reales, priorizar auditoría de ese estado con autorización SOLO lectura. Exportación de roles y permisos todavía no autorizada; prohibido actualizar SSL enforcement o ejecutar dump con estos permisos. [CP46](checkpoints/CHECKPOINT_BT_SEC07_R3_CLIENT_TLS_V2_WINDOWS_PASS_BACKEND_SSL_PENDING_20261120.md).

## CP52 — Adaptador específico de salida CLI v3 PREPARADO, NO PRODUCCIÓN (20/11/2026)

Aprobado por propietario **solo PREPARAR** el siguiente R3: ZIP privado `BT_SEC07_R3_CLI_V3_OFFLINE_ADAPTER_20261120.zip` SHA256 `a30de4ba1f619de2654da206e9804cb753fac386c7ad2ac3ef85b8e49cc51596`, 5513 bytes, `bt_sec07_r3_cli_v3_offline.py` y 27 tests nuevos. **27/27 offline PASS y 27/27 tras extraer ZIP PASS**. Analiza **solamente fixtures sintéticos**, sin invocar `pg_dumpall`/Supabase CLI real, sin network, subprocess, GPG, importación de backup ni SQL real. Distingue salida parcial/error con exit !=0, `RESET ALL` aislado con roles esperados, conteo inventario cero/positivo/desconocido, comentarios reservados, UTF8/identificadores, no rol y SQL ajeno. Un **PASS_SHAPE_ONLY_NOT_RECOVERABLE** no prueba backup ni restauración; no es parser SQL y podría rechazar SQL legítimo multilinea. Causa `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` original sigue sin comprobarse. **Inventario origen aún no ejecutado ni autorizado**; posteriormente requerirá SELECT agregado sin nombres, wrapper remoto seguro, llave GPG histórica autorizada y prueba restauración aislada de roles/owners/ACL. Estado CP46 TLS cliente PASS/backend NO y CP48 SSL enforcement OFF implica riesgo upstream no certificado; ninguna configuración cambió. [Checkpoint 52](checkpoints/CHECKPOINT_BT_SEC07_R3_CLI_V3_OFFLINE_ADAPTER_READY_20261120.md).

## CP53 — Resultado agregado inicial y necesidad de revalidar el filtro
El proyecto real devolvió 31 roles visibles, 31 clasificados reservados y 0 candidatos en UNA SELECT autorizada, sin nombres. INC-53: el filtro LIKE 'pg_%' incluye otros prefijos pgX por wildcard _. Cero candidatos es PROVISIONAL. Falta autorizar otra SELECT agregada con prefijo literal starts_with y falsos positivos. No interpretar SQL antiguo vacío como respaldo, ni omitir owners/ACL. [CP53](checkpoints/CHECKPOINT_BT_SEC07_R3_ROLE_CATALOG_AGGREGATE_PROVISIONAL_20261120.md).
