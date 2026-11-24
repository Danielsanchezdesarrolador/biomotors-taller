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
