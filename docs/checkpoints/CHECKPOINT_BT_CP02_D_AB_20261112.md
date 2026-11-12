# BT-CP02-D — Preparación A/B y preauditoría SQL

**Fecha:** 12/11/2026 · Supabase: `biomotors-taller` (`suxcqqnmcjoezfxltoms`).  
**Estado:** 22 verificaciones estructurales **PASS**; 25 pruebas auténticas A/B preparadas y pendientes.

## Comprobado desde Supabase
- Tres tablas con RLS, roles anónimos sin lectura y roles autenticados sin escritura administrativa.
- Perfil actualizable solo en `display_name`, no en `user_id`.
- El alta de propietarios exclusivamente `service_role`; el helper RLS no expuesto al público; event trigger activo.
- **22/22 PASS** en consultas `SELECT` de PostgreSQL.
- No se han creado cuentas ni talleres con esta ejecución.

## Bloqueo de prueba JWT
- Herramientas Supabase conectadas sin Auth Admin createUser/signIn.
- Sin conectividad HTTP desde el entorno contenedor a Supabase.
- No se simularon tests A/B como si fueran pruebas reales y no se insertó manualmente en `auth.users`.

## Entregables
- `scripts/security/bt-cp02-ab.mjs`: dos usuarios auténticos y dos talleres con pruebas de aislamiento, autoelevación, pérdida de acceso y limpieza.
- `docs/BT_CP02_D_AB_RUNBOOK.md`: preparación y medidas de seguridad.

**Próximo paso:** ejecución desde entorno operador autorizado, revisión de resultados, confirmación de limpieza y posterior cierre de BT-CP02-D. El onboarding público permanece desactivado.
