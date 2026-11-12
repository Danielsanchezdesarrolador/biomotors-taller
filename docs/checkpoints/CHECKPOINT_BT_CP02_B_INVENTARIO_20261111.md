# CHECKPOINT BT-CP02-B — Inventario de Supabase ByteTorque

**Fecha:** 11/11/2026 — conexión corregida por el Director y auditoría remota completada.  
**Estado:** INVENTARIO SOLO LECTURA COMPLETO. NO migraciones, cambios de permisos ni nuevas tablas.  
**Proyecto verificado:** `biomotors-taller`, referencia `suxcqqnmcjoezfxltoms`; región São Paulo `sa-east-1`; PostgreSQL 17; `ACTIVE_HEALTHY`.

## Evidencia observada

| Recurso | Resultado |
|---|---|
| `public` | **0 tablas propias** |
| `auth.users` | **0 usuarios** |
| Migraciones del proyecto | **0** |
| `storage.buckets`, `storage.objects` | **0 buckets, 0 archivos** |
| Edge Functions | **0** |
| Advisor Health | Sin hallazgos |
| Advisor Performance | Sin hallazgos |
| Advisor Security | **2 advertencias** de un mismo origen |

Las tablas internas de `auth` y `storage` están presentes como infraestructura Supabase. Se hicieron consultas SQL estrictamente SELECT sobre funciones/disparadores. No se modificó ningún proyecto.

## Hallazgo de seguridad — revisar antes de CP02-C

Supabase Security Advisor identifica `public.rls_auto_enable()` como función `SECURITY DEFINER` ejecutable tanto por `anon` como por `authenticated`, heredando permiso general de ejecución (`proacl` NULL). Dos avisos sobre el mismo objeto:
- `anon_security_definer_function_executable`: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- `authenticated_security_definer_function_executable`: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

La inspección SELECT de `pg_proc` confirma que retorna `event_trigger`, usa `search_path` restringido a `pg_catalog` y ejecuta `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` tras `CREATE TABLE` en `public`. La inspección `pg_event_trigger` confirmó el disparador `ensure_rls` activo, evento `ddl_command_end`. **No concluimos que haya una explotación activa**; el hallazgo requiere verificar y restringir privilegios públicos innecesarios en una migración controlada.

**Propuesta de tratamiento:** revisar revocación de `EXECUTE` para `PUBLIC`, `anon` y `authenticated` o movimiento a esquema interno, manteniendo el evento legítimo funcionando; nunca modificar la definición o eliminar el disparador sin pruebas de un entorno seguro. La medida exacta se aprobará antes de aplicarla. Dejar lints 0 como condición previa a abrir acceso a datos reales.

**Importante:** RLS activado automáticamente **no crea políticas de acceso seguras** ni separa talleres por sí mismo. Todas las tablas futuras necesitan permisos/grants, FK con `workshop_id`, políticas RLS y pruebas entre A/B.

## GitHub y Render — corrección visual cerrada

El commit `3258858fe48516a68f607e8623430c01050fb18b` existe y está en la historia de `main` como padre del checkpoint `f4e8d71`. `src/ordenes/OrdenesPanel.tsx` en `main` coincide con la versión corregida de ese commit. Render publicó `3258858` y después `f4e8d71` (solo documentación), con último despliegue `LIVE`. La corrección del hero no se perdió.

## Siguiente etapa propuesta — BT-CP02-C, SIN AUTORIZACIÓN DE ESCRITURA TODAVÍA

1. Proponer esquema de `workshops`, `profiles`, `workshop_memberships` y ajustes de seguridad del disparador RLS; confirmar roles Propietario, Administrador, Mecánico y Recepción.
2. Preparar migración revisable y batería de pruebas SQL con dos talleres y usuarios exclusivamente ficticios.
3. Solicitar autorización expresa del Director **antes de ejecutar DDL**.
4. Verificar creación de tablas, RLS, permisos y ausencia de lectura/escritura cruzada. Solo entonces integrar login real y, posteriormente, datos reales.

## Invariantes

No tocamos Supabase de Punto Fénix, Render, las cinco pantallas premium, Android, correos, pagos o Storage. El proyecto ByteTorque sigue sin usuarios reales ni datos de talleres.
