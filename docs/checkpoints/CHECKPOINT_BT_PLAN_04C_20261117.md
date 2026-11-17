# BT-PLAN-04C — cuenta personal, taller y equipo

17/11/2026. Continúa `8ec3237` en main, issue #1.

- Inicio de cuenta confirmada sin membresía y Creador global independiente de rol owner.
- Alta de taller con licencia Plus/Full validada en servidor, sin reutilizar QA.
- Gestión de mecánicos propios: invitación por correo confirmado, reserva de cupo,
  enlace confidencial de un uso, expiración, rotación, revocación y desactivación.
- Capacidad Plus 4/Full 8 + extras confirmadas por backend. Sin elevación de roles,
  sin pagos del trabajador ni borrados al cambiar plan.
- Reutilización del handoff en memoria ya existente y del área técnica CP04;
  eliminación de tokens de URL antes de React/SDK, sin persistencia en navegador.
- Perfil/logo y facturación se completan en el siguiente checkpoint consolidado.

Gate adicional `VITE_BT_PLAN04_WORKSHOPS_ENABLED=false`. No activar sin instalar
SQL autorizado y comprobar cuentas reales aisladas. 04A sigue reutilizado.

Verificación en la ronda consolidada: TypeScript y builds público/privado pasan;
SQL local sintético verifica RLS, MFA, sesión revocada, repetición, rotación,
expiración, 2/8 mecánicos, downgrade y carreras por la última plaza/taller único.
HTTP/browser con SDK simulado no equivale a QA alojado. No se creó Ignacio ni se
concedió suscripción real. No se enviaron invitaciones por correo.

Publicación bloqueada por visibilidad pública detectada en GitHub: no hacer push
hasta confirmar repositorio privado. Estado final y reproducción en
`docs/BT_PLAN_04_IMPLEMENTACION_20261117.md`.
