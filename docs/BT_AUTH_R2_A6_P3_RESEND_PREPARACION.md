# ByteTorque — Preparación Resend y primera prueba E2E (SIN ACTIVAR)

**Fase:** BT-AUTH-R2-A6-P3. **Este documento no concede autorización de despliegue ni de envío.** El código del worker sigue inactivo; los endpoints responden 503.

## Puertas a superar antes de cualquier HTTP real

1. **Aprobación expresa del responsable técnico:** registrar autorización de una prueba aislada, nombre de la cuenta, correo de prueba propio, volumen exacto y ventana. No usar datos de clientes ni talleres reales. Sin autorización, no configurar secretos ni enviar.
2. **Remitente:** crear/verificar en la cuenta de Resend un dominio permitido con registros DNS y estatus verificado. Elegir un remitente estable por versión de mensaje. Nunca tomar `from` del navegador ni cambiarlo para mensajes pendientes.
3. **Cuenta/API:** revisar costos y límites antes de activar. La clave Resend debe tener el mínimo alcance necesario, permanecer solo en secret manager del entorno backend autorizado y rotarse si se expone. Nunca escribirla en GitHub, logs, capturas, PWA, Expo o variables `VITE_*`.
4. **Autenticación worker:** revisar el patrón vigente de Supabase para invocaciones internas con `auth: 'secret'` u otro control explícito. No confundir CORS con autenticación. El `verify_jwt=true` y la respuesta 503 actuales no deben modificarse hasta tener una implementación, pruebas y aprobación conjunta. Nunca usar una `service_role` en clientes.
5. **Reserva segura:** el futuro creador debe validar identidad de usuario, correo confirmado, rol y taller contra Supabase; después crear sobre cifrado V3 antes de ejecutar la RPC que reserva cupo y crea outbox en la misma transacción. El remitente y nombre del taller deben venir de fuentes de backend verificadas; el ciphertext no es un sustituto de la autorización.
6. **Idempotencia exacta:** mantener la serialización `resendInviteWireV1` sin cambios mientras haya tareas pendientes. Resend conserva la key por **24 horas**; el límite de 23 h es una defensa conservadora, no garantía de entrega. Reconciliar invitaciones ambiguas y evitar reintentos después de la ventana.
7. **Reintentos/salida segura:** simular errores 429, 5xx, timeout y cierre tras HTTP 2xx y antes del ack; comprobar que no cambia `wireBody` ni key, que los `409 invalid_idempotent_request` detienen el envío y que los `409 concurrent_idempotent_requests` no generan segundo envío.
8. **Revocación:** cancelar outbox antes del transporte y volver a comprobar lease inmediatamente antes de enviar. Si la revocación coincide con una solicitud externa en vuelo, bloquear siempre la aceptación del token revocado, aunque el correo llegue al destinatario.
9. **Aceptación real (R2-A6-6):** terminar formulario Auth sin persistir token en localStorage, validar email confirmado, token de uso único y pertenencia a taller desde DB, iPhone PWA/Android, expiraciones, rate-limits, auditoría, rebotes y errores.
10. **Salida y registros:** solo metadatos mínimos (estado, ids internos y timestamp sin token); ni body, ni destinatario ni cabeceras Authorization en logs. Definir retención, tratamiento de rebotes y eliminación de ciphertext al completar/cancelar.

## Verificación alcanzada hoy

- GitHub `main` implementa **snapshot HTTP cifrado V3**. CI web, Android Expo, Deno y PostgreSQL 17 en entorno efímero aprobados.
- Supabase hospedado solo lectura: 2 talleres, 4 usuarios Auth, 4 membresías, 0 tablas `bt_private`. Única función Edge preexistente: `bt-owner-onboarding`.
- No existe aún cuenta/dominio Resend validado en este proyecto, secretos configurados ni servicio de envío real. No se autorizó ni hizo ninguna prueba real.

## Referencias oficiales (consultadas 15/11/2026)

- [Resend — Idempotency Keys](https://resend.com/docs/dashboard/emails/idempotency-keys): 24 horas de retención para misma key.
- [Resend — Send Email](https://resend.com/docs/api-reference/emails/send-email): contrato `POST /emails`.
- [Supabase — Securing Edge Functions](https://supabase.com/docs/guides/functions/auth): separar JWT de usuario y autenticación secreta de servicio.
- [Supabase — Environment variables](https://supabase.com/docs/guides/functions/secrets): secretos solo servidor, prefijos reservados.

**Puerta cerrada:** no modificar `supabase/config.toml`, RLS hospedado, backend real, flags de Render, pagos ni claves hasta autorización del Director.
