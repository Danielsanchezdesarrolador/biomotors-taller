# BT-CP02-C — Matriz de pruebas de aislamiento (versión para aprobación)

**No ejecutada.** Solo aplicar en ambiente de pruebas controlado y **después** de autorizar la migración y el procedimiento de usuarios Auth. No crear usuarios Auth mediante INSERT manual en `auth.users`.

## Preparación de fixtures

1. Crear **dos usuarios Auth de pruebas** con mecanismos oficiales de Supabase y correos sintéticos bajo `example.com` (sin correos externos reales).
2. Una operación administrativa controlada crea **Taller A** y **Taller B** y concede `owner` activo a cada usuario en su taller; conservar UUID reales de prueba solo en entorno aislado.
3. Opcionalmente crear un tercer usuario `mechanic` de A y un usuario sin membresía.
4. Las pruebas deben enviarse como solicitudes auténticas con JWT de cada usuario, o mediante `SET LOCAL ROLE authenticated` y claims verificables en un entorno desechable. **No usar service_role para demostrar aislamiento**, porque lo omite.

| Caso | Identidad / acción | Resultado obligatorio |
|---|---|---|
| R01 | Anónimo lee workshops, profiles, memberships | Sin datos / error de permiso |
| R02 | Dueño A consulta workshops | Solo A |
| R03 | Dueño A solicita workshop B por UUID | Ningún registro |
| R04 | Dueño A consulta su membership | Solo membresía A |
| R05 | Dueño A consulta membership B | Ningún registro |
| R06 | Dueño A consulta profile B | Ningún registro |
| R07 | Dueño A actualiza su `display_name` | Permitido |
| R08 | Dueño A intenta cambiar `profiles.user_id` | Rechazado por GRANT de columna |
| R09 | Dueño A intenta INSERT workshop, INSERT membership owner en B o UPDATE role propio | Rechazado |
| R10 | Usuario sin membresía consulta workshop A/B | Ningún registro |
| R11 | Miembro A desactivado intenta consultar A | Ningún registro |
| R12 | Usuario miembro legítimo de A y B cambia de contexto | Solo miembros/talleres autorizados |
| R13 | Miembro B intenta modificar datos A | Rechazado |
| R14 | Validar `ensure_rls` activo y helper sin EXECUTE para anon/authenticated | Correcto |
| R15 | `supabase db advisors` seguridad tras aplicar | Sin alertas críticas ni 0028/0029 |
| R16 | Volver a ejecutar tests con JWT de Auth anónimo si se permite ese modo | Sin acceso a datos ajenos |

**Importante:** R02–R12 miden acceso; futuras pruebas de `clients`, `vehicles` y OT con FK multitenant se escribirán cuando esas tablas existan. El diseño de cliente por enlace tampoco está en esta migración.

## Puertas de aceptación

- Las tres tablas tienen RLS activado.
- No hay inserción de talleres/membresías desde el cliente.
- No se pueden leer otras membresías ni perfiles, incluso adivinando UUID.
- No se confunden permisos del rol PostgreSQL `authenticated` con los roles comerciales del taller.
- No hay recursión de políticas ni consultas que filtren información entre tenants.
- No se otorgan funciones `SECURITY DEFINER` públicas al frontend.
- `ensure_rls` se mantiene funcionando y se limpian las alertas 0028/0029.
- Antes de login público debe existir un **onboarding privilegiado, transaccional y auditado** para la primera membresía `owner`, y procedimientos de invitación/revocación.

## Cómo se validará

Guardar resultados de `docs/sql/BT_CP02_C_CHECKS_AFTER.sql`, `get_advisors(security)`, prueba de JWT A/B, logs y CI. No declarar **RLS PASS** solo porque compile SQL o porque las tablas aparezcan en Supabase.

No usar aún personas ni vehículos reales. Cualquier cambio de DDL/DML a Supabase requiere aprobación nueva.
