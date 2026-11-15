# ByteTorque — Puerta de autenticación servicio a servicio (R2-A6-P5)

**Estado:** propuesta de seguridad, **no implementada ni desplegada**. No autoriza acceso externo, SMTP, Resend, cron, cambios en credenciales, migraciones ni alteraciones de permisos. El worker `bt-invite-worker` actual permanece 503 y `verify_jwt=true`.

## Contexto verificado en documentación oficial de Supabase (15/11/2026)

- Las Edge Functions orientadas a **usuarios** conservan `verify_jwt=true` y requieren un JWT de usuario. No otorgar al cliente web/Android la credencial `service_role`.
- Las llamadas **solo de servidor** pueden autenticarse mediante `withSupabase({auth:'secret:<nombre>'})` de `@supabase/server`; la clave viene en `apikey`. Según documentación actual, este patrón requiere `verify_jwt=false` **solo para la función específica**, dado que la plataforma dejaría la validación de la clave al wrapper. Esa combinación será revisada y probada **antes** de considerarse segura; jamás usar `auth:'none'` para este trabajador.
- `auth:'secret'` admite la clave secreta `default`; `auth:'secret:bytetorque-worker'` sería una opción con clave **nombrada** y segregada, por crear solo tras autorización, sin revelar ni reutilizar la clave administrativa general.
- `ctx.supabaseAdmin` omite RLS: el proceso debe llamarse exclusivamente tras autenticación del servicio, usar solamente RPCs privadas previstas y validar estado/lease del trabajo, sin permitir al solicitante escoger taller, destinatario, usuario o sentencia SQL.
- La actualización de Supabase CLI v3 del 04/11/2026 cambia comportamiento local/hospedado; pin de CLI y paquete `@supabase/server` con versión revisada antes de publicar. No se efectuó upgrade.

## Lista de puertas de implementación futura

1. Aprobación explícita del responsable técnico para modificar configuración, añadir claves y desplegar en Supabase real. Elegir una invocación interna concreta autorizada; no aceptar peticiones del navegador.
2. Crear **clave secreta nominativa**, privilegios y rotación/documentación backend; jamás en `VITE_*`, Expo, Render frontend, repositorio o logs. Solo el invocador programado y Edge worker tienen acceso.
3. Implementar handler aislado con wrapper `withSupabase`, import/version lock revisados y verificación explícita de método HTTP, carga vacía, tipo de invocación, permisos y límite de **un claim por solicitud**. El proceso jamás acepta `outbox_id` ni `workshop_id` desde un body público.
4. Hacer un cambio **atómico y revisado**: `verify_jwt=false` únicamente en `bt-invite-worker` y wrapper `auth:'secret:bytetorque-worker'` probado. Rechazar sin clave, con clave errónea, con publishable key, JWT de usuario o cualquier otra clave secreta. Si falla el wrapper, no procesar ninguna cola. Ningún flag habilita por sí solo el envío.
5. Reutilizar el `processOneInvitationEmail` probado en P5, verificar `bt_r2_invitation_email_lease_valid` antes del transporte y `bt_r2_mark_invitation_email_sent` tras provider 2xx. No expandir permisos SQL de anon/authenticated.
6. Pruebas de integración aisladas para revocación entre lease/send, ack ambiguo, reintento con el mismo `wireBody` y `Idempotency-Key`, cinco intentos y corte 23 h, tokens expirados y DB caído. Resend externo solo con aprobación separada.
7. Auditar respuestas 401/403/503 y logs **sin tokens, correos ni cuerpos cifrados**; establecer expiración/rotación de secretos, rate limits por invocador, cron y alertas. Mantener un interruptor de emergencia en backend.
8. Validar el servidor con pruebas negativas y revisión independiente antes de habilitar la primera prueba de correo. No confundir respuesta 200 del proveedor con entrega al destinatario.

## Evidencia disponible y pendiente

- P5 probado contra `postgres:17` efímero, `issueMechanicInvitationCandidate`, SQL RPC real, lease real, worker TypeScript y proveedor mock: [GitHub Actions 43708017370](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43708017370).
- Aún **no** hay cuenta Resend confirmada, dominio verificado, secreto de servicio creado o invocación autenticada de worker contra la plataforma real.
- `bt-mechanic-invites`, `bt-mechanic-accept`, `bt-mechanic-revoke` y `bt-invite-worker` no están desplegados. Continúan bloqueados hasta autorización.

## Documentación oficial consultada

- [Supabase — Securing Edge Functions](https://supabase.com/docs/guides/functions/auth).
- [Supabase — Authorization headers](https://supabase.com/docs/guides/functions/auth-headers).
- [Supabase — Changelog (CLI v3 / cambios noviembre 2026)](https://supabase.com/changelog.md).

**Decisión pendiente del Director:** aprobar cambios reales de autenticación, secretos, dominio y un ensayo de correo limitado. Este documento no constituye esa aprobación.
