# BT-PLAN-MECHANIC-LIMITS-01 — PLANNED

27/11/2026 UTC. El titular solicita dejar para un cambio posterior los cupos incluidos de mecánicos: Plus 2 (antes 4), Full 4 (antes 8). Básico conserva 0. No ejecutar durante la aceptación comercial vigente.

| Plan | Cupos incluidos actuales | Cupos incluidos objetivo |
|---|---:|---:|
| Básico | 0 | 0 |
| Plus | 4 | 2 |
| Full | 8 | 4 |

El propietario/administrador no cuenta como un cupo de mecánico, conforme al modelo de cupos existente. No cambiar precios (Plus US$5/mes, Full US$15/mes), límites documentales, límites de clientes, talleres ni condiciones de extras por esta solicitud. Cualquier tratamiento comercial de cupos adicionales debe respetar el contrato vigente o contar con decisión separada; pagos siguen fuera de alcance.

## Alcance de futura implementación
- Inventariar y alinear fuentes autoritativas SQL/RPC, asignación de planes, invitaciones activas y pendientes, reactivación de mecánicos, guards de concurrencia, permisos, estados y contadores UI, comparativa de planes y textos comerciales; evitar que sea solo una modificación visual.
- Revisar política explícita para talleres existentes con más miembros o invitaciones que el nuevo límite. No eliminar cuentas, perder información ni desactivar mecánicos automáticamente por esta anotación. Definir transición y autorización antes de ejecutar.
- Validar límites en servidor, cupos disponibles, invitaciones simultáneas, cambios de plan y persistencia de datos; probar 2/2 Plus y 4/4 Full y denegaciones del siguiente cupo incluido, conforme a contrato de extras si aplica.
- Mantener la aceptación en curso bajo contrato desplegado 4/8. Implementar después del cierre de BT-WORKSHOP-COMMERCIAL-01 y antes de incorporación de Ignacio; coordinar con BT-MULTIPUNTO-FINAL-01 sin activar correo, registro público, logo o pagos. Requiere candidato, pruebas focalizadas, revisión y autorización para cambios productivos.

Estado: PLANNED / NOT_IMPLEMENTED. Auto-Deploy OFF verificado. Solo documentación. No SQL, Edge, Render, flags, datos, licencias ni Codex modificados.
