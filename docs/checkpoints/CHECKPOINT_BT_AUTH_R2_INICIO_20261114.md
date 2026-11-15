# ByteTorque — BT-AUTH-R2 · Inicio de reglas de invitación y recuperación

**Fecha:** 14/11/2026 (Chile).  
**Estado:** desarrollo inicial; reglas de dominio programadas y tests versionados, **sin activación real**.  
**Rama:** exclusivamente `main` del repositorio `Danielsanchezdesarrolador/biomotors-taller`.

## Puerta anterior

- El Director confirmó doble rol A/B en Chrome, pruebas API 12/12 PASS, PWA física iPhone y funcionamiento de la renovación de sesión.
- Ratificación de cierre R1: [checkpoint de cierre controlado](CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md).
- La única membresía temporal `admin` de Taller B quedó eliminada; cuatro membresías legítimas de prueba siguen intactas. Sin cuentas o datos operativos reales.

## Primer bloque implementado — reglas puras de cupos mecánicos

Se incorporaron en `src/auth/mechanicInvitationPolicy.ts` los contratos y la función determinista `evaluateMechanicSeat`, junto a `src/auth/mechanicInvitationPolicy.test.ts` con casos positivos y negativos.

Reglas de negocio tomadas de BT-PLAN-03 y de la matriz oficial:

- `basic` = 2 mecánicos; `plus` = 8; `full` = 8, siempre **por taller**.
- Solo actores con rol `owner`/`admin`, **activos y del taller objetivo**, pueden solicitar invitaciones de `mechanic`; nunca propietario, administrador ni recepción.
- Contabilizar mecánicos activos + invitaciones pendientes no vencidas; ignorar miembros de otros talleres y no contar dueños ni administradores.
- Invitación pendiente con expiración ilegible se mantiene como ocupada hasta revisión, sin liberar cupo silenciosamente.
- Los tests cubren 2→3, 8→9, pendientes, expiración, revocación, aislamiento de taller, prohibición de autoelevación y actor desactivado.

**Límite fundamental:** es una regla reutilizable, **NO** una barrera de seguridad por sí sola. No crea invitaciones, no envía mensajes y no escribe tablas. La autoridad de autorización y el conteo deberán estar en una única transacción backend con bloqueo/serialización por taller, protección contra concurrencia, identidad obtenida de Auth y permisos verificados en base de datos; RLS y constraints adicionales serán imprescindibles.

## Orden de trabajo siguiente

1. **BT-AUTH-R2-A (realizar después de validar este bloque):** diseñar tabla y API backend de invitaciones con token aleatorio hasheado, expiración/revocación, cuota atómica por plan y registro auditable, sin publicar endpoint ni abrir correos. Revisar datos y permisos antes de cualquier migración.
2. **BT-AUTH-R2-B:** flujo de recuperación de contraseña seguro con enlaces permitidos y rate limits, sin exponer existencia de cuentas; requiere configurar y aprobar SMTP, redirecciones web/PWA y nueva puerta de activación. La presentación actual es inactiva.
3. **BT-AUTH-R2-C:** conectar pantalla `Configuración → Usuarios y permisos` al backend cuando la política y las pruebas RLS de operaciones de escritura estén aprobadas; preservar estados vacíos y la identidad visual R2.
4. Verificar en GitHub Actions, documentar resultado y mantener `VITE_BT_AUTH_R1_ENABLED=false` en el Render público hasta autorización expresa.

## Invariantes

No crear ramas, sitios nuevos, talleres reales, usuarios adicionales, pagos, correo transaccional, invitaciones reales ni datos de clientes. No modificar la autorización de propietarios, no alterar el SaaS BIOMOTORS Academia ni Android nativo; mantener el frontend web/PWA oficial y los cinco paneles premium. Los usuarios de prueba heredados siguen acotados a ensayos internos.

**Evidencia de implementación:** commits `8764923` (política pura) y `2f2f38d` (tests); estado del CI a verificar de forma independiente.
