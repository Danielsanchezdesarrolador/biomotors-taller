# ByteTorque — R2-A6-W · Worker seguro de invitaciones (etapa aislada)

**Fecha de trabajo:** 14/11/2026 (Chile).  
**Repositorio/rama:** `Danielsanchezdesarrolador/biomotors-taller` / `main`.  
**Naturaleza de la entrega:** código, SQL CANDIDATO y pruebas en contenedor PostgreSQL y mocks. **NO despliegue de worker, NO envío real, NO SMTP, NO cambios en Supabase alojado y NO permisos públicos nuevos.**

## Baseline y decisiones

- [R2-A6 previo](CHECKPOINT_BT_AUTH_R2_A6_20261114.md) confirmado con 300 Vitest PASS, Deno y PostgreSQL.
- `docs/CODEX_BT_AUTH_R2_A6_WORKER_HANDOFF.md` es el encargo técnico. El trabajo se implementó **directamente con GitHub**, sin afirmar ejecución de Codex.
- Compatible con ByteTorque multiempresa; `main` único. No cambiar PWA iOS/desktop, Android Expo nativo ni Render.
- La interfaz de invitación sigue en modo preparación, descarta los enlaces; los tres endpoints de invitar/aceptar/revocar continúan 503.

## Cambios ejecutados

### Coordinador simulado

- `supabase/functions/_shared/invitationEmailWorker.ts`: estado aislado `claim → getWorkshop → leaseIsCurrent → decrypt/verify → provider(mock) → ack/fail`. Dependencias inyectables, sin SQL/conexión de servicio, SMTP, secrets ni cron incrustados.
- Verifica identificadores, taller y estado activo, nombre de taller obtenido del backend, lease vigente; rechaza mismatches antes de llamar proveedor.
- Diferencia respuesta aceptada del proveedor (`provider-accepted`) de una entrega efectiva (NO demostrada). Si el proveedor acepta pero falla la confirmación SQL, devuelve `ack-unknown` y **no marca el envío como fallido**, para preservar reintento idempotente al expirar lease.
- `src/auth/invitationEmailWorker.test.ts`: proveedor ficticio; tests de éxito, cola vacía, taller ajeno/suspendido, lease revocado, error temporal/definitivo, error de ack, respuesta defectuosa, fallas de consulta y repetición de key entre reintentos.
- `bt_r2_claim_invitation_email()` en la candidata SQL A6 devuelve ahora `token_sha256_hex` junto con correo, expiración y ciphertext, para que el backend verifique que la envoltura cifrada coincide con invitación.

### SQL de recuperación, cancelación y prueba de dos workers

- `docs/sql/BT_AUTH_R2_A6_WORKER_RECOVERY_CANDIDATE.sql`: SQL **NO APLICADO** con FK compuesta `(invitation_id,workshop_id)` para evitar asociar cola de un taller a invitación ajena.
- RPC de servicio `bt_r2_revoke_and_cancel_mechanic_invite`: permisos owner/admin del mismo taller; revocación + cancelación + eliminación de ciphertext y lease en una transacción, respetando lock de taller.
- RPC `bt_r2_reconcile_invitation_outbox`: cancelación y limpieza segura por taller de invitaciones vencidas/revocadas, sin alterar estados `sent` ni ciphertext ya purgado.
- RPC `bt_r2_mark_invitation_email_terminal_failed`: fallo definitivo confirmado por proveedor, revoca invitación y elimina material cifrado sin agotar cinco intentos; requiere lease correcto.
- RPC `bt_r2_invitation_email_lease_valid`: revisión previa al transporte, comprobando token pendiente, taller activo, lease actual y margen de vigencia.
- Todos los RPC son `SECURITY INVOKER`, con revocación `PUBLIC/anon/authenticated` y solo ejecución `service_role`.
- `scripts/security/bt-r2-lab-worker-assertions.sql` prueba en PostgreSQL real ficticio: grants, FK multiempresa, revocación durante lease, limpieza de expirados, fallos terminales y rechazo de leases erróneos.
- `scripts/security/bt-r2-lab-worker-claims.sh`: carrera con dos sesiones para el mismo outbox; `FOR UPDATE SKIP LOCKED` debe permitir un único claim, y el lease vigente no debe volver a reclamarse.
- `.github/workflows/bt-auth-r2-postgres-lab.yml`: aplica candidatas SOLO a postgres:17 efímero y ejecuta los nuevos tests; sin credenciales del proyecto Supabase alojado.

### Endpoint todavía inoperativo

- `supabase/functions/bt-invite-worker/index.ts`: endpoint interno que **responde siempre 503**, no consulta DB ni proveedor ni lee secretos.
- `supabase/config.toml`: `verify_jwt=true` para el endpoint, sin deploy. Antes de pasar a uso machine-to-machine se deberá decidir el esquema de autenticación interna y revisar la política JWT/secret de Supabase.
- `.github/workflows/bt-auth-r2-edge-check.yml`: `deno check` del coordinador y el endpoint.

## Evidencia de tests y garantías limitadas

- Pruebas PostgreSQL de reconciliación: [GitHub Actions 43667514092](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43667514092) **SUCCESS** (candidatas SQL sobre contenedor temporal, incluida limpieza/cancelación).
- TypeScript/React/Android [GitHub Actions 43667597401](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43667597401) **SUCCESS** tras ajustar tipos de mocks.
- Deno [GitHub Actions 43667597419](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43667597419) **SUCCESS**.
- **Concurrencia dos workers PASS:** [GitHub Actions 43667670454](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43667670454), PostgreSQL 17 SUCCESS; log exacto: `PASS: SKIP LOCKED single claim, second worker skipped, active lease preserved`. También se confirmó `PASS: composite foreign key denies wrong-tenant outbox` y fallo terminal que borra ciphertext.
- **CI PWA/Android PASS:** [GitHub Actions 43667670460](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43667670460), ambos trabajos SUCCESS; 35 archivos Vitest aprobados.
- `bt_r2_invitation_email_lease_valid` declara ahora `VOLATILE` por usar `clock_timestamp()`; ejecutar nuevamente el laboratorio de PostgreSQL tras esa corrección antes de certificar el HEAD de SQL.
- Los commits documentales posteriores tienen su propio CI. No equiparar la prueba aislada con entregas reales.
- Estas pruebas acreditan PostgreSQL efímero y mocks, **NO entrega o idempotencia real de ningún proveedor SMTP/API**, ni un sistema accesible para Ignacio.

## Riesgos / puertas pendientes ANTES DE ACTIVAR

1. Elegir proveedor de correos con **idempotencia confirmada en su API**, identidad remitente/dominio verificado, límites/rate limiting e integración E2E. Sin soporte de idempotencia, una caída entre provider accept y ack puede duplicar emails.
2. Crear backend de servicio real con secretos gestionados, verificación machine-to-machine, client service_role solo server, transport HTTPS, cron/WAF y pruebas de autorización. El endpoint actual sigue inhabilitado.
3. Coordinar toda revocación para que use `revoke_and_cancel`, no la RPC antigua de revocación; sincronizar recibo del proveedor, notificaciones de rebote, bajas de plan, rotación/recuperación de clave y retención de outbox.
4. Un envío externo en vuelo puede competir con una revocación. El doble chequeo de lease **reduce** la ventana pero no hace atómica la operación de red; documentar esa limitación.
5. Completar aceptación segura con token efímero en memoria, email confirmado Auth y vista Safari iPhone + Android nativo; mantener bloqueo público hasta pruebas y permiso.
6. Antes de migraciones reales, usar el flujo de migraciones soportado por CLI y revisar RLS/permissions con auditoría. Sin scripts destructivos ni usuarios reales de prueba.
7. Protección contra contraseñas filtradas Supabase pendiente antes de lanzamiento público.

**Estado:** R2-A6 worker **implementado como candidato y probado en entorno aislado**, no disponible para uso real.
