# CHECKPOINT BT-CP02-C — Migraciones aplicadas y verificadas

**Fecha efectiva:** 12 de noviembre de 2026 (Chile).  
**Estado:** **base de seguridad instalada y verificada estructuralmente**, SIN pruebas de identidad real entre dos talleres.  
**Proyecto exacto:** `biomotors-taller` — Supabase ref `suxcqqnmcjoezfxltoms`.  
**Autorización:** Director confirmó expresamente «autorizo» antes de aplicar la primera migración.

## Migraciones aplicadas realmente

| Versión Supabase | Nombre | Resultado |
|---|---|---|
| `20261112144646` | `bt_cp02_c_core_tenants_rls` | SUCCESS |
| `20261112145011` | `bt_cp02_c_backend_service_grants` | SUCCESS |

La primera migración creó `public.workshops`, `public.profiles` y `public.workshop_memberships`, sus restricciones e índice, revocó EXECUTE público a `rls_auto_enable()`, activó RLS explícitamente y creó 4 políticas:
- `memberships_read_self`: lectura únicamente de membresía propia.
- `profiles_read_self`: lectura del propio perfil.
- `profiles_update_self`: actualización del propio perfil, con UPDATE limitado a columna `display_name`.
- `workshops_read_member`: lectura de talleres con membresía activa.

La segunda migración fue necesaria porque se detectó con SELECT de `has_table_privilege` que el rol `service_role` aún no tenía los GRANT requeridos. Se concedió SELECT/INSERT/UPDATE/DELETE exclusivamente a `service_role` en las tres tablas. No se incrementaron permisos de `anon` o `authenticated`.

### Verificación posterior efectuada

- Tres tablas `public` existentes; **RLS = TRUE** en las tres.
- Cuatro políticas creadas en `pg_policies`, con expresiones acotadas a `auth.uid()`.
- Las tres tablas contienen **0 registros**. `auth.users` contiene **0 usuarios**.
- `anon` no posee SELECT/INSERT/UPDATE/DELETE sobre ninguna de las tres tablas.
- `authenticated` posee SELECT sobre las tres y únicamente UPDATE de la columna `profiles.display_name`; no puede insertar o borrar talleres/membresías ni editar rol/taller.
- `service_role` tiene los cuatro permisos SQL sobre las tres tablas para el futuro backend controlado. **No almacenar ni publicar su clave en frontend.**
- Disparador de evento `ensure_rls` permanece activo.
- `public.rls_auto_enable()`: EXECUTE por `anon` = false, por `authenticated` = false.
- **Supabase Security Advisor = 0 lints** tras ambas migraciones.

## Pendientes sin declarar PASS

La **matriz de 16 escenarios A/B NO se ha ejecutado todavía**: no existen usuarios Auth reales de prueba ni talleres. Las consultas de catálogo y grants prueban configuración, **no sustituyen intentos reales mediante JWT diferentes**. Tampoco se ha probado aún el disparador con una tabla nueva desechable.

Fase siguiente:
1. Diseñar y revisar onboarding privilegiado y transaccional de taller y primer propietario, sin posibilidad de que el usuario elija libremente su rol.
2. Crear **dos usuarios Auth de prueba** mediante API oficial, no INSERT manual en `auth.users`, y dos talleres ficticios con sus memberships.
3. Ejecutar la matriz A/B con sesiones/JWT diferenciadas y pruebas de permisos negativos. Guardar evidencia verificable. No habilitar clientes reales hasta pasar.
4. Integrar login/PWA web después de esas verificaciones.
5. Preparar versión SQL del control en GitHub y conciliar historial remoto; no ejecutar migraciones duplicadas.

## Continuidad

- Inicio, Órdenes, Clientes, Informes y Configuración R2 sin cambios.
- Android y Render sin modificaciones funcionales.
- No correos reales, pagos, almacenamiento de documentos ni información personal real.
- Proyecto Punto Fénix sin cambios.

## Archivos

- Candidata original previa: `docs/sql/BT_CP02_C_SCHEMA_CANDIDATE.sql` (histórico).
- Scripts exactamente aplicados, con versiones otorgadas por Supabase: `docs/sql/applied/20261112144646_bt_cp02_c_core_tenants_rls.sql` y `docs/sql/applied/20261112145011_bt_cp02_c_backend_service_grants.sql`.
- Matriz de pruebas pendiente: `docs/BT_CP02_C_MATRIZ_PRUEBAS.md`.
