## SEC07 cierre A — contrato v04 extraído; listo para ensayo de permisos (23–24/11/2026)

Evidencia del propietario: `BT_SEC07_CONTRACT_GPG: PASS`, `SCHEMA:EXTRACTED`, `ACL:EXTRACTED`, `RESULT:REVIEW_INPUT_READY`, `DATA_RESTORE:NOT_EXECUTED`, `ROLE_CREATION:NOT_EXECUTED`, `PRODUCTION:NOT_TOUCHED`. Manifiesto revisado: 318 entradas candidatas, 281 de aplicación y 37 dependencias administradas auth/storage (26 ROW SECURITY + 11 triggers de storage), no selección de políticas/triggers propios de ByteTorque en estos dos esquemas en el manifiesto. 20 tablas (12 públicas y 8 privadas), 35 entradas FUNCTION (incluida rls_auto_enable de plataforma), 21 políticas públicas, 76 ACL (incluyen permisos por columna), 6 DEFAULT ACL públicos. Funciones y tablas seleccionadas de owner postgres. **35 funciones de v04 no equivalen a las 37 del inventario productivo posterior; no certificar paridad temporal.** ACL de aplicación extraídas sin roles desconocidos señalados por el resumen; aparecen grants amplios en defaults futuros, no confundir con ACL efectiva de tablas. Ausencia de LOCAL_REVIEW en la salida no constituye parser SQL exhaustivo.

No restaurar datos reales ni roles representativos. Selección explícita de 281 entradas revisadas por IDs de este archive, respetando orden original de TOC; recuperar propietarios/ACL de aplicación, dependencias Auth necesarias usando roles reales de bootstrap, no grants de conveniencia en tablas de aplicación. Probar en una sola sesión con datos ficticios positivos/negativos A/B, mecánico, RPC, MFA y privilegios efectivos. Si se requiere volver a abrir v04 para pg_restore -L (el archivo descifrado de extracción se eliminó), hacerlo dentro del mismo recinto temporal, sin repetir inventario. Bloque A sigue PENDIENTE; B/C siguen según dictamen. [Checkpoint](checkpoints/CHECKPOINT_BT_SEC07_CIERRE_A_CONTRATO_V04_EXTRAIDO_20261124.md). No producción ni deploy, solo docs main.

---

## SEC07 — cierre acotado al piloto: dictamen Astra adoptado (23/11/2026)

El propietario aportó el dictamen Astra posterior a S3-R4 y solicitó continuar hacia el cierre de seguridad. **S3-R5 de roles representativos DESCARTADO, NO EJECUTAR.** R4 falló MISSING_ROLE sin identidad del rol: no se conoce si corresponde a un objeto administrado o propio. Conservar S0/S1 local/S2-R11/R8/R9/S3-R1/R2/R3 en sus alcances acreditados. No repetirlos ni reexportar la base por ese fallo.

**Tres entregas de cierre, sin requisitos nuevos innecesarios:** A) contrato real de owners/ACL/default ACL, roles y dependencias propios de la aplicación extraído de v04, revisión por objeto/firma (incluidas personalizaciones activas auth/storage y defaults globales relevantes), aplicación en lab con roles reales sin grants de conveniencia y comprobación sintética de operaciones permitidas/denegadas por taller, admin/mecánico y RPC sensibles/MFA; B) ficha privada de recuperación de Auth/Render, accesos, secretos por reposición y dependencias Edge/Storage que se usen efectivamente; C) recorrido funcional autorizado del piloto y registro del respaldo periódico manual cada dos días y antes de cambios de datos. No exigir paridad total de roles reservados, prueba de pérdida total del proveedor, USB/Drive/automatización o cambio TLS enforcement como condición adicional de este cierre. Riesgo PC-only aceptado y explícito. No desplegar ni modificar producción por este dictamen.

**Próxima acción concreta:** extraer en el recinto Docker aislado el SQL de esquema del mismo v04 y metadatos por entrada TOC para revisar el contrato. No certificar por conteos, no seleccionar automáticamente mediante heurísticas SQL, no aplicar aún ni cargar filas. Selección definitiva y pruebas deberán utilizar el contenido archivado y dependencias revisadas. [Dictamen y criterios](recovery/BT_SEC07_CIERRE_PILOTO_DICTAMEN_ASTRA_20261123.md). SEC07 **PENDIENTE DE APROBACIÓN PARA PILOTO**; no confundir con DR integral.

---

## SEC07-S3-R4 — RESTORE_EXIT 1 / MISSING_ROLE; reconciliación de roles globales (23/11/2026, Chile)

**Evidencia real del propietario (PowerShell 5.1):**
```text
BT_SEC07_S3_R4: START
BT_SEC07_S3_R4_LAB: READY
BT_SEC07_S3_R4_RESTORE_EXIT: 1
BT_SEC07_S3_R4_FIRST_ERROR: MISSING_ROLE
BT_SEC07_S3_R4_RESULT: SCHEMA_ACL_NOT_COMPLETE
```

R4 arrancó el bootstrap oficial del mismo lab Supabase PG17 y ejecutó `pg_restore --schema-only --exit-on-error --single-transaction` sin omitir owners/ACL. La clasificación detectó una referencia a un rol inexistente. No se conoce la identidad del rol exacto: el clasificador descartó ese dato junto al stderr crudo al destruir el contenedor. **No atribuir el fallo a un nombre concreto ni a corrupción de v04.** No certificó el exit GPG de esta ejecución porque el wrapper sale al primer error de restore; los PASS previos R3/R8/R9 conservan su alcance. R4 no toca producción ni altera backup.

**Corrección fundamentada de diseño:** PostgreSQL `pg_dump` de una base guarda definiciones/owners/ACL de objetos, pero no crea roles globales del clúster (https://www.postgresql.org/docs/17/app-pgdump.html; https://www.postgresql.org/docs/17/app-pg-dumpall.html, y guía https://supabase.com/docs/guides/self-hosting/restore-from-platform). A diferencia de S4B-R6, el bootstrap oficial ya funciona; sus roles no garantizan coincidencia con los de Supabase administrado. El inventario real anterior identificó 15 roles no-`pg_*`, sin roles de negocio personalizados identificados: anon, authenticated, authenticator, cli_login_postgres, dashboard_user, postgres, service_role, supabase_admin, supabase_auth_admin, supabase_etl_admin, supabase_privileged_role, supabase_read_only_user, supabase_realtime_admin, supabase_replication_admin y supabase_storage_admin. Roles globales y sus 25 membresías no son equivalentes a las ACL de objetos.

**R5 propuesto, NO ejecutado:** conservar la imagen y arranque R8 probados; antes de descifrar, comparar roles del laboratorio con inventario fuente conocido. Exigir presencia de roles centrales y anon/authenticated sin SUPERUSER/BYPASSRLS/LOGIN. Solo si falta un rol de infraestructura **ya identificado en el inventario real y en la allowlist fija** (cli_login_postgres, dashboard_user, supabase_etl_admin, supabase_privileged_role, supabase_read_only_user, supabase_replication_admin), crear su representación local restringida **NOLOGIN NOSUPERUSER NOCREATEROLE NOCREATEDB NOREPLICATION NOBYPASSRLS NOINHERIT**, sin contraseñas ni memberships. No cambiar atributos de roles existentes ni crear roles desconocidos. Mostrar únicamente nombres permitidos y conteo, y reportar claramente que son placeholders de identidad, no recuperación de atributos/membresías administradas. Ejecutar una sola restauración schema-only de v04 con owners/ACL, sin cargar filas, comprobar métricas de S3-R1 y roles efectivos, indicar coincidencia o discrepancia sin atribuirla automáticamente a diferencia temporal. Si reaparece MISSING_ROLE, extraer del primer ERROR solo el nombre si pertenece al inventario permitido, no SQL ni logs; de otro modo NOT_IN_INVENTORY_OR_UNPARSED, STOP. No volver a intentar automáticamente. Cualquier PASS con placeholders es **reproducción de ACL de esquema en laboratorio con roles representativos, NO paridad de roles globales ni recuperación funcional de Supabase**.

**Estado:** S3-R4 no completado. S3-R3 inventario ACL PASS y S4B/S4C conservados. S3 global y S4 integral abiertas. No repetir etapas aprobadas, no exportar de nuevo producción por este error, no usar Codex, no despliegue, `main` docs-only `[skip render]`. La próxima ejecución debe aportar evidencia nueva de reconciliación de dependencias antes de restaurar, no una repetición de R4.
 
---

## SEC07-S3-R3 — índice ACL del respaldo v04: PRESENTE (23–24/11/2026)

**Evidencia literal real desde PowerShell 5.1, aportada por el propietario:**
```text
BT_SEC07_S3_R3: START
BT_SEC07_S3_R3_LAB: READY
BT_SEC07_S3_R3_GPG: PASS
BT_SEC07_S3_R3_TOC: READ_PASS
BT_SEC07_S3_R3_TOC_OBJECTS: 889
BT_SEC07_S3_R3_TOC_ACL_ITEMS: 213
BT_SEC07_S3_R3_TOC_DEFAULT_ACL_ITEMS: 24
BT_SEC07_S3_R3_TOC_OWNER_POSTGRES: 360
BT_SEC07_S3_R3_RESULT: ACL_ITEMS_PRESENT
```

**Diagnóstico:** el backup cifrado **v04 S2-R11** descifró correctamente mediante el `GNUPGHOME` S1A y `pg_restore --list` de PostgreSQL 17 pudo leer 889 entradas del índice. Los 213 `ACL` y 24 `DEFAULT ACL` corresponden a **entradas de todo el archive, incluidas superficies administradas**, NO equivalen a 213 GRANT individuales ni a los seis default ACL actuales medidos solo en esquemas de aplicación. 360 líneas del índice terminaron con token de propietario `postgres`: **la cuenta no demuestra restauración de owner de cada objeto**. Este conteo identifica cobertura potencial de ACL/owner preservada en el archivo; no confirma exactitud frente a producción ni que pueda aplicarse.

**Corrección de interpretación del error R8/R9:** se usaron expresamente `pg_restore --no-owner --no-acl`, opciones que **omiten aplicar** owners y permisos, y que no implican que el archive los haya perdido. Documentación PostgreSQL 17 `pg_restore`: https://www.postgresql.org/docs/17/app-pgrestore.html. **No exportar más roles/ACL remotamente todavía** ni regenerar v04. Solo se examinó TOC en contenedor Docker offline sin red, no se modificó producción ni claves.

**Próximo avance S3-R4 pendiente:** un ensayo único **schema-only** con el **mismo** respaldo v04 en laboratorio Supabase PostgreSQL 17 nuevo aislado, usando bootstrap oficial y `pg_restore --schema-only --single-transaction --exit-on-error` **sin** `--no-owner` ni `--no-acl`. Comprobar owners y privilegios efectivos (12 tablas de aplicación, funciones y default ACL) contra conteos S3-R1 y S3-R3 sanitizados, evitando restaurar datos y roles globales de producción. Si falta rol/objeto, **STOP** con categoría sanitizada; no reintentos ciegos ni creación de superusuarios arbitrarios. Éxito de aplicación en laboratorio ≠ cobertura total de recuperación externa (Auth, Storage bytes, Edge, Render). El laboratorio debe usar `--network none --rm`, tmpfs PGDATA/`/tmp`/socket, capa escribible temporal para clave `pgsodium` como R8 (NO `--read-only` al arrancar servidor). `--schema-only` no ejecutará una carga de filas del dump. S3 global y S4 integral siguen abiertas hasta salida comprobada.

**Estado:** S3-R3 `ACL_ITEMS_PRESENT` **PASS de inventario del archive**; no declarar todavía S3-R4 ni restauración de ACL aprobadas. Registrar [checkpoint S3-R3](docs/checkpoints/CHECKPOINT_BT_SEC07_S3_R3_ACL_ARCHIVO_V04_PRESENTES_20261124.md), `main`, solo docs `[skip render]`, sin Codex, Render o SQL remoto.

---

## SEC07 S3-R3 — roles/owners reales leídos y preflight ACL del v04 preparado (23–24/11/2026)

**Investigación exclusiva de lectura realizada mediante Supabase conectada sobre `biomotors-taller` en PRODUCCIÓN, PG17, y contrastada con el catálogo GitHub:**
- `BEGIN TRANSACTION READ ONLY` inventario global: **31 roles**, de ellos 16 `pg_*`, 8 `supabase_*`, 0 `bt_*`, **25 membresías entre roles**, 9 LOGIN distintos de los `pg_*`. No se consultaron contraseñas, secretos ni filas de usuarios/clientes.
- Las 15 denominaciones no-`pg_*` corresponden a `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`, `postgres`, `service_role` y 8 roles `supabase_*`. **No aparece un rol personalizado ByteTorque identificado**, pero no se certifica que todos los roles gestionados sean transferibles sin configuración Supabase. `cli_login_postgres` es el rol temporal usado por CLI para conexión passwordless según documentación actual.
- Propietarios de objetos de aplicación `public` y `bt_*`: **20 relaciones de tipo tabla/objetos relacionados** y **37 funciones** propiedad de `postgres`; **2 esquemas privados** propiedad de `postgres` y esquema `public` propiedad de `pg_database_owner`. Inventario amplio de estos esquemas: 20 objetos con ACL explícita, 6 registros de default ACL. Este dato es **actual** en producción y no prueba que el snapshot v04 tenga idénticos ACL/owners en su fecha de captura.
- Dado el resultado y los errores históricos de `pg_dumpall --roles-only` de **0 bytes**, **NO se ejecutó ninguna exportación nueva de roles ni se creó contenido SQL claro**. Se identificó camino potencialmente más breve: comprobar **en modo offline** si el v04 custom `PGDMP` ya contiene elementos `ACL`, `DEFAULT ACL` y metadatos owner, normalmente disponibles en un archive custom. `pg_restore --no-owner --no-acl` de R8/R9 **omite la aplicación** de dichos privilegios; **no demuestra que el archivo original carezca de ellos**.

**Próxima acción única, nueva y necesaria, pendiente en PC:** script completo `BT_SEC07_S3_R3` entregado en el chat (23–24/11/2026): seleccionar archivo `*_nobom_v04.dump.gpg` y `GNUPGHOME` ya validado, descifrar GPG→Docker local offline por bytes sin persistir dump en claro; ejecutar `pg_restore --list` sobre el mismo archive y contar **solo número de objetos TOC, entradas ACL, DEFAULT ACL y entradas cuyo owner es postgres**, sin imprimir nombres/SQL ni restaurar. Contenedor usa `--network none --read-only --rm --pull=never --log-driver none --tmpfs /tmp` porque ahora solo corre `pg_restore` **cliente** sin entrypoint de Supabase/pgsodium ni inicialización PGDATA (diferente de R7). Consume por completo stdin para no cortar GPG; deja TOC solo en tmpfs y se autodestruye. **No es una repetición de validación TOC S2-R11:** verifica cobertura de permisos no inventariada antes. No marca S3 PASS hasta obtener salida real. Si archive contiene ACL y DEFAULT ACL, investigar restauración de permisos sin una nueva exportación remota; si faltan, preparar un único procedimiento de captura cifrada autorizado, conservando respaldo v04.

**Fuentes técnicas:** documentación PostgreSQL `pg_restore --list` y opciones `--no-owner/--no-acl`, Supabase CLI v3 local-default/remote explícito, y discusión oficial sobre `cli_login_postgres`. La exposición de roles con nombres conocidos NO acredita recuperación de secretos ni roles/políticas de usuarios Auth. No escribir producción, no repetir R8/R9, no descargar datos desde producción; uso de `main` y commit documental `[skip render]`.

---

## SEC07 S3-R1 — inventario REAL de permisos SQL solo lectura (23/11/2026, Chile)

**Evidencia entregada por el propietario desde SQL Editor Supabase del proyecto `biomotors-taller`, entorno `main` (PRODUCTION):**
```json
{
  "marker": "BT_SEC07_S3_R1_INVENTORY",
  "result": "CATALOG_METADATA_ONLY_NO_CHANGES",
  "tables_found": 12,
  "tables_expected": 12,
  "tables_rls_forced": 9,
  "anon_select_tables": 0,
  "tables_rls_enabled": 12,
  "default_acl_entries": 6,
  "tables_explicit_acl": 12,
  "distinct_table_owners": 1,
  "standard_roles_present": 3,
  "public_roles_privileged": 0,
  "security_definer_functions": 18,
  "authenticated_delete_tables": 0,
  "authenticated_select_tables": 12,
  "security_definer_public_anon_executable": 0,
  "security_definer_public_authenticated_executable": 6
}
```

**Interpretación técnica y límites:** el script `docs/sql/BT_SEC07_S3_R1_INVENTARIO_CATALOGO_READONLY.sql` se diseñó con `BEGIN TRANSACTION READ ONLY`; el propietario comunicó un resultado de catálogo con `CATALOG_METADATA_ONLY_NO_CHANGES` (etiqueta generada, no auditoría independiente de SQL de la plataforma). Están presentes las 12 tablas objetivo; RLS habilitada 12/12 y FORCE 9/12 (no exigir FORCE a las otras 3 sin estudiar sus reglas); 0/12 con SELECT efectivo para `anon`; `authenticated` tiene SELECT en 12/12 y DELETE en 0/12; `anon/authenticated` sin SUPERUSER/BYPASSRLS, existen los tres roles estándar. Doce objetos tienen ACL explícitas, seis entradas de privilegios predeterminados y un único owner de las 12 tablas. **La existencia de 18 funciones SECURITY DEFINER (según alcance público + bt_ del SQL) y 6 funciones SECURITY DEFINER de `public` con `EXECUTE` efectivo para `authenticated`, 0 para `anon`, exige revisión dirigida pero NO demuestra vulnerabilidad.** La consulta solo cuenta funciones; NO proporciona identidades, cuerpos ni efectividad de controles internos. El conteo de 18 NO equivale a 18 funciones expuestas públicamente.

**Estado de etapa:** S3-R1 inventario agregado **PASS (evidencia reportada), sin cambios intencionales**; S3 global todavía **NO CERRADA**. Inventario NO constituye archivo recuperable de roles, GRANT/REVOKE/default privileges, owners ni prueba de RLS por todas las tablas/roles. S4C-R9 continúa CHECK_PASS_LIMITED. No alterar permisos ni revocar funciones sobre la sola base del conteo; impedir impactos a la app piloto.

**Siguiente paso de valor, una sola lectura dirigida:** obtener únicamente las identidades de esas seis funciones `SECURITY DEFINER` de `public` ejecutables por `authenticated`, más si el EXECUTE proviene de ACL explícita o valores predeterminados, sin bodies/secrets/data; comparar con las definiciones reales de `main` y evaluar existencia de `auth.uid()`, validación de membresía y taller, `search_path` seguro y privilegios mínimos. Script preparado para el chat: SQL metadata-only `BEGIN TRANSACTION READ ONLY`, no `GRANT/REVOKE/ALTER`. Identificar luego si hay brechas reales y avanzar respaldo de roles/ACL sin repetir restauración R8/R9.

**Registro histórico:** resultado no equivale a certificado RLS de lectura/grants restaurados; no cambiar producción o Render. Mantener `main` y commits documentales `[skip render]`; sin secretos, RUT, nombres de clientes o dumps en GitHub.

---

# SEC07 S3 — Matriz de cobertura y siguiente lectura acotada (23/11/2026)

**Proyecto:** ByteTorque · **Rama:** `main`. **Estado:** plan y SQL de catálogo **PREPARADOS, NO EJECUTADOS**. Sin nueva conexión Supabase ni modificación alguna de la infraestructura. No confundir evidencias históricas con estado actual.

## Avances nuevos del mismo respaldo v04

- S2-R11: cifrado y TOC restaurable, PASS.
- S4B-R8: `pg_restore` completado en Supabase PG17 aislado, PASS.
- S4C-R9: 12 tablas con RLS, relaciones básicas sin huérfanos y separación SELECT sobre `public.workshops` A permitida / B denegada para actor no miembro, PASS **LIMITADO**. Se usaron `--no-owner --no-acl` y GRANTs de laboratorio; **no** se restauraron los grants y owners originales. No repetir R8/R9.

## Cobertura S3 y fuentes internas examinadas

| Superficie | Evidencia anterior (no actualizada por esta investigación) | Bloqueo concreto |
| --- | --- | --- |
| Roles PG globales, membresías y atributos | Contrato export CLI 3.0.0 [`docs/BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md`](BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md); etapa de diseño/sintético PASS, exportación real NO ejecutada | Los objetos globales no son recuperados por el restore del v04 con `--no-owner --no-acl`; exportación real por origen autorizada separadamente. `roles.sql.gpg` viejo descifraba 0 bytes, no reutilizar |
| Owners, GRANT/REVOKE, default privileges | Esquemas y políticas en `docs/sql/applied/`, restore v04 R8/R9 sin owner/ACL | Los GRANT añadidos a mano en laboratorio no son prueba de los privilegios fuente. Faltan inventario actual solo catálogo, estrategia export/recuperación y negative QA |
| RLS taller/rol y funciones privilegiadas | S4C-R9 validó solo SELECT en workshops. CP05 SQL incluye `SECURITY DEFINER`; RLS otras tablas no ejercitada en R9 | Verificar permisos por operaciones y roles reales, no solo banderas RLS/presencia de políticas |
| Auth | Tablas `auth` en base restaurada; la estructura de Auth no equivale a servicios configurados | Falta prueba de recuperación de servicio, ajustes, SMTP/OAuth/sesiones, sin exponer secretos |
| Storage bytes | `docs/recovery/SEC07_S4H_INTEGRACION_SEGURA.md` registró inventario vacío al 22/11 | Confirmar vigencia antes de piloto; si hay objetos, SQL no recupera sus bytes |
| Edge Functions | [CP51](checkpoints/CHECKPOINT_BT_SEC07_EDGE_FUNCTIONS_DEPLOYED_READONLY_AUDIT_20261120.md): una función desplegada `bt-owner-onboarding` v2, cuatro candidatas locales NO desplegadas | Recuperar código y configuración permitida; valores de secretos y entorno siguen fuera del repo/dump. No desplegar funciones candidatas |
| Render | [CP50](checkpoints/CHECKPOINT_BT_SEC07_RENDER_RUNTIME_READONLY_AUDIT_20261120.md): ByteTorque Render static_site, sin PostgreSQL Render en workspace inventariado | Configuración de entorno/secretos y procedimiento de reconfiguración no certificados |
| Custodia fuera del PC | Decisión explícita de PC-only | Riesgo residual pérdida total/ransomware del PC; el usuario revocó USB, no bloquear SEC07 por hardware externo |

**Documentación oficial comprobada 23/11/2026:** Supabase [restauración de un proyecto](https://supabase.com/docs/guides/self-hosting/restore-from-platform) separa roles/esquema/datos y excluye objetos Storage y despliegues Edge; [database backups](https://supabase.com/docs/guides/platform/backups) excluye bytes de Storage. CLI v3 (4/11/2026) remoto debe especificarse, no asumir destino ni regenerar objetos en producción automáticamente.

## S3-R1 siguiente acción única con resultado nuevo

Preparado `docs/sql/BT_SEC07_S3_R1_INVENTARIO_CATALOGO_READONLY.sql` para ejecución **manual y voluntaria** del propietario exclusivamente en SQL Editor del proyecto Supabase correcto. Envuelto en `BEGIN TRANSACTION READ ONLY`, consulta solo `pg_catalog` (no lee registros de clientes), produce una sola celda JSON de métricas agregadas sobre 12 tablas, grant efectivos anon/authenticated, owners distintos, default ACL, SECURITY DEFINER y roles base. No modifica nada. No ejecutado, no inspección remota desde este chat.

**Interpretación conservadora:**
- `tables_explicit_acl=0` no significa ausencia de privilegios: `relacl NULL` puede significar valores por defecto. Usar `has_table_privilege` para permisos efectivos.
- La presencia de SECURITY DEFINER ejecutable es **hallazgo a revisar**, no vulnerabilidad automática.
- `standard_roles_present=3` no acredita los roles personalizados o su respaldo; `public_roles_privileged>0` sería hallazgo importante.
- Un SELECT actual en producción sin snapshot sincronizado NO demuestra paridad temporal de datos con el v04, ni exporta los roles. Inventario solo marca necesidades del mecanismo de copia de permisos.

**Siguiente tras resultado:** diseñar una sola captura real de roles/grants y evidencia protegida, con consentimiento específico, cifrado sin SQL claro deliberado en disco, restauración con roles correctos en un laboratorio y negativas RLS selectivas restantes. No repetir R8/R9 ni tests sintéticos históricos para simular progreso; no deploy/changes de producción.

## S3-R2 — 6 RPC del esquema public identificadas (23–24/11/2026)

El CSV aportado por el propietario muestra seis funciones `SECURITY DEFINER` ejecutables por `authenticated` (cinco de administración del creador y una de estado del plan), todas con `anon` sin permiso de ejecución, acceso a esquema y ACL explícita. Sus nombres y firmas coinciden con diseños SQL versionados `BT_CREATOR_01_PRIVATE_SUBSCRIPTIONS_CANDIDATE.sql` y `BT_PLAN_04A_PERSONAL_ENTITLEMENTS_CANDIDATE.sql`: controlador de creador `auth.uid()`, guardas `aal2` para cambios de planes, comprobación de membresía en lectura de plan de taller. **No se ha leído el cuerpo SQL de producción ni ejecutado pruebas de autenticación; los archivos `CANDIDATE` no certifican identidad del runtime.** Inventario S3-R2 PASS con cobertura limitada, S3 general aún no cerrado. [Checkpoint](checkpoints/CHECKPOINT_BT_SEC07_S3_R2_6_FUNCIONES_INVENTARIADAS_20261124.md).
