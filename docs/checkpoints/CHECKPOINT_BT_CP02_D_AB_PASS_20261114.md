# CHECKPOINT BT-CP02-D — Aislamiento real entre talleres A/B aprobado

**Fecha:** 14 de noviembre de 2026  
**Proyecto:** ByteTorque · `biomotors-taller` · Supabase `suxcqqnmcjoezfxltoms`  
**Estado:** **25/25 pruebas A/B aprobadas + limpieza verificada**. Cierre de la puerta de seguridad del núcleo multitenant, no certificación completa del producto.

## Evidencia de ejecución

- El Director ejecutó desde PowerShell Windows el script `scripts/security/bt-cp02-ab.mjs` desde su repositorio clonado.
- Se emplearon claves actuales **Publishable y Secret** configuradas exclusivamente como variables de entorno locales, sin publicarlas.
- La captura de resultados aportada por el Director en el chat muestra consecutivamente **PASS 1 al PASS 25**, con `RESULTADO: 25 pruebas A/B PASS. Limpieza pendiente...` y `Limpieza solicitada. Verificar conteos en Supabase.`.
- Las pruebas incluyeron: usuarios Auth de ensayo independientes, ausencia de lectura sin membresía, creación e idempotencia de talleres, lectura exclusiva A/B por JWT, rechazo de consultas cruzadas por UUID, protección de membresías/perfiles, restricción de escritura y autoelevación de roles, edición de nombre propio, acceso anónimo bloqueado, desactivación de membresía y continuidad del segundo taller.
- Las consultas de usuario fueron efectuadas con JWT auténticos individuales; la clave privilegiada se usó para preparar/desactivar/eliminar fixtures y **no** para simular acceso autenticado RLS.

## Auditoría de limpieza independiente posterior

Consulta `SELECT` a Supabase, después de la captura:

| Recurso | Total |
|---|---:|
| `auth.users` | 0 |
| `auth.sessions` | 0 |
| `public.workshops` | 0 |
| `public.profiles` | 0 |
| `public.workshop_memberships` | 0 |

- `public.workshops`: RLS = true.
- `public.profiles`: RLS = true.
- `public.workshop_memberships`: RLS = true.
- Supabase Security Advisor: **0 lints**.
- No se detectaron fixtures remanentes. No se modificaron componentes de UI, Android, Render ni las bases de datos de otros proyectos.

## Alcance y limitaciones

El resultado **valida las 25 pruebas definidas para el modelo inicial de talleres, perfiles y membresías**. No verifica aún las tablas de clientes, vehículos, OT, archivos PDF, Storage, invitaciones, cupos, renovación de tokens, revocación de sesiones ni el flujo Edge `bt-owner-onboarding` de extremo a extremo.

La Edge Function sigue desplegada y con `verify_jwt=true`; **no** se habilitó `BYTETORQUE_ONBOARDING_ENABLED` ni el alta libre pública. Las pantallas de acceso son presentación visual sin Auth real conectado.

**Nota de seguridad:** eliminar un usuario de Auth no invalida necesariamente tokens de acceso ya emitidos hasta su expiración. Este test demuestra revocación efectiva de visibilidad del taller al desactivar membresía (consultas posteriores con el mismo JWT), pero no una política integral de revocación de todas las sesiones. Debe probarse antes de producción.

## Siguiente fase autorizable

**BT-AUTH-01B:** conectar inicio de sesión real con verificación de correo, recuperación, sesiones, onboarding auditado, invitación/revocación de mecánicos, permisos por rol y por taller y límites comerciales 2/8/8, de forma incremental, con nuevas pruebas negativas. Mantener registro público desactivado hasta superar validación específica y aprobación del Director. Evitar datos personales reales y claves privilegiadas en clientes.

## Archivos de referencia

- `scripts/security/bt-cp02-ab.mjs`
- `docs/BT_CP02_D_AB_RUNBOOK.md`
- `docs/BT_AUTH_01_LOGIN_ROLES_CORREO.md`
- `roadmap.md`
