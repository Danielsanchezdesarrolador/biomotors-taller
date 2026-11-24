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
