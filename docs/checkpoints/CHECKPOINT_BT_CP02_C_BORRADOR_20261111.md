# CHECKPOINT BT-CP02-C — Candidata de estructura y RLS

**Fecha:** 11/11/2026  
**Estado:** esquema preliminar y controles preparados para revisión; **SIN EJECUCIÓN REMOTA**.  
**Proyecto destino:** `biomotors-taller` (`suxcqqnmcjoezfxltoms`).

## Archivos preparados

- `docs/sql/BT_CP02_C_SCHEMA_CANDIDATE.sql`: candidata de primera migración con las tablas `workshops`, `profiles`, `workshop_memberships`, restricciones, índices, RLS y GRANT explícitos.
- `docs/sql/BT_CP02_C_CHECKS_AFTER.sql`: consultas de catálogo de **solo lectura** para verificar las tablas/policies y los permisos tras una aplicación futura.
- `docs/BT_CP02_C_MATRIZ_PRUEBAS.md`: 16 casos de acceso normal, acceso cruzado, autoelevación y disparador RLS.
- `roadmap.md`: etapa en revisión.

## Hallazgos y decisiones

1. Supabase Postgres 17, 0 tablas `public`, 0 usuarios Auth, 0 migraciones y 0 archivos/buckets: inventario anterior confirmado.
2. `public.rls_auto_enable()` es una función `SECURITY DEFINER` con EXECUTE heredado para `anon` y `authenticated`; el disparador `ensure_rls` está activo.
3. La candidata incluye **REVOKE de EXECUTE**, conserva función y disparador y habilita RLS explícito para todas las tablas. **No se ha probado** que el REVOKE limpie las alertas, ni se ha alterado producción.
4. Membresías son de lectura propia únicamente; el cliente **no puede autoproclamarse propietario**. Alta de taller y primeras membresías se implementarán después por backend server-side transaccional.
5. `profiles` admite ver y editar solo su `display_name`; el `user_id` no es editable. `workshops` es de lectura para membresías activas.
6. Hay una política no recursiva: `workshops` consulta `workshop_memberships`; la política de esa tabla únicamente coteja `user_id` con `auth.uid()`.
7. **Importante:** el esquema todavía NO permite a un usuario crear su taller directamente. Esto es intencionado; habilitar la creación sin verificación sería un riesgo de escalamiento de permisos.

## Estado de verificación

- SQL preparado y revisado **estáticamente**, no ejecutado: ninguna prueba funcional de SQL/RLS ha sido marcada PASS.
- El CLI Supabase **no está instalado en el entorno de preparación**, por lo que se conserva como **candidata en `docs/sql/`** sin inventar un timestamp de migración. Al autorizar el despliegue, se deberá usar CLI `supabase migration new` y copiar el SQL revisado.
- No hay Auth real, ni paneles conectados, ni correos/pagos activos. No se modificaron los cinco paneles aprobados ni Android.

## Próximo paso

Revisión/aceptación del esquema y de la revocación de permisos. Después, con **autorización explícita del Director**, generar la migración oficial, aplicarla al proyecto correcto bajo plan controlado, ejecutar las consultas `CHECKS_AFTER`, Security Advisor y las pruebas A/B en un entorno controlado. No colocar datos personales reales hasta pasar los tests.

## Referencias

- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/api/securing-your-api
- https://supabase.com/changelog/supabase-cli-v3
