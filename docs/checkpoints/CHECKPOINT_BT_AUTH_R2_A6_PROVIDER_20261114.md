# ByteTorque — BT-AUTH-R2-A6-P · Proveedor idempotente (Resend candidato)

**Fecha de continuidad:** 14/11/2026, Chile.
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main`.
**Estado:** integración de contrato y seguridad **implementada en código y ensayos aislados**. **SIN API real, SIN SMTP, SIN nueva cuenta/dominio, SIN enviar correos, SIN modificar Supabase alojado**.

## Contexto y decisión

Tras los tests PostgreSQL de R2-A6 Worker, se investigaron opciones de proveedores transaccionales:
- [Resend — Idempotency Keys](https://resend.com/docs/dashboard/emails/idempotency-keys): `POST /emails` admite `Idempotency-Key`; el proveedor recuerda esa clave **24 horas**. Repetir el mismo cuerpo con la misma clave dentro de la ventana retorna la misma respuesta sin nuevo envío.
- [Resend — posibles respuestas](https://resend.com/docs/dashboard/emails/idempotency-keys): `409 concurrent_idempotent_requests` indica un intento simultáneo y puede reintentarse; `409 invalid_idempotent_request` significa clave ya asociada a otro cuerpo: **no reintentar sin cambiar el payload y revisar la causa**.
- [Resend — enviar correo](https://resend.com/docs/api-reference/emails/send-email): HTTPS `POST https://api.resend.com/emails` con `Authorization: Bearer ...`, un remitente verificado y `to`, `subject`, `text`, `html`.
- Postmark no ofrecía claves de idempotencia en su API al verificar sus documentos, por lo que **Resend queda como candidato técnico**, sujeto a contratación/configuración y aprobación explícita, no como integración operativa.

## Cambios implementados en `main`

### Adaptador puro Resend (sin fetch)

- `supabase/functions/_shared/resendInviteCandidate.ts`: genera el contrato HTTP canónico `POST /emails` con un destinatario, remitente validado, `Authorization` servidor y `Idempotency-Key: bt-r2-invite:<outbox UUID>`. No crea conexiones de red y no contiene credenciales.
- Solo acepta estructura y campos preparados; rechaza headers malformados, cambios de clave, CRLF en asunto o remitente, destinatarios múltiples y ausencia de cuerpo.
- `classifyResendReply(status, body)` interpreta aceptación con ID verificable, 409 concurrente (reintento), 409 payload distinto (fallo definitivo), 429/408/5xx (reintento) y otros 4xx permanentes, sin mostrar datos internos.
- `src/auth/resendInviteCandidate.test.ts`: pruebas offline de construcción HTTP, JSON con campos permitidos, clave estable, sanitización, respuestas temporales, definitivas y ambiguas.
- `.github/workflows/bt-auth-r2-edge-check.yml`: `deno check` extendido al adaptador puro.

### Protección SQL de la ventana de 24 horas

- `docs/sql/BT_AUTH_R2_A6_ENCRYPTED_OUTBOX_CANDIDATE.sql`: nuevo `first_attempt_at` inicializado en el primer claim y mantenido en reintentos. `bt_r2_claim_invitation_email()` bloquea un claim cuando pasó **23 h** desde el primer intento; margen de seguridad antes de que Resend olvide la clave a las 24 h.
- `docs/sql/BT_AUTH_R2_A6_WORKER_RECOVERY_CANDIDATE.sql`: la reconciliación de taller cancela, borra ciphertext y revoca invitaciones de envíos ambiguos cuando han pasado 23 h; evita una reemisión duplicada al día siguiente, a costa de invalidar la invitación antigua que el destinatario quizá recibió. La experiencia deberá permitir solicitar otra invitación.
- `scripts/security/bt-r2-lab-worker-assertions.sql`: escenario aislado PostgreSQL 17 con primer claim, envejecimiento simulado a 23 h 2 min, intento adicional denegado, reconciliación de cola cifrada y comprobación de revocación.
- Todas las candidatas SQL continúan **NO APLICADAS al Supabase hospedado**; no existen tablas privadas ni RPC R2 operativas allí.

## Evidencia de CI real

- [PostgreSQL 17 temporal #43668340193](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43668340193) — **SUCCESS**. El log del job contiene `PASS: provider 24h key protected by 23h claim cutoff and cleanup`, además de pruebas previas de SKIP LOCKED y aislamiento.
- [Web/iOS PWA y Android #43668343805](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43668343805) — **SUCCESS**, 36 archivos de tests aprobados y builds verificados. Una primera prueba de mayúsculas no alteraba el idempotency key porque su UUID era numérico; corregida y reejecutada PASS.
- [Deno Edge #43668285621](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43668285621) — **SUCCESS**: tipado del adaptador puro sin desplegar.
- Consulta remota **solo lectura** posterior: 2 talleres, 4 membresías, 4 usuarios Auth y **0 tablas del esquema privado `bt_private`**.

## Límites / decisiones pendientes

1. **Proveedor seleccionado para evaluación, no activado.** Debe existir cuenta de Resend aprobada, dominio remitente verificado, remitente final, secret server-side y límites de volumen revisados. No colocar API keys en GitHub, PWA, Android o variables `VITE_`.
2. **Inmutabilidad de mensaje:** Resend exige el **mismo cuerpo** al reutilizar una clave. Si cambia el nombre del taller o el remitente entre reintentos puede devolver `409 invalid_idempotent_request`. Antes de habilitar worker, congelar el cuerpo/identidad del remitente al encolar, o implementar verificación de huella de cuerpo persistente y detener reintentos incompatibles.
3. **Proveedor 24 h:** incluso con clave estable no garantiza idempotencia indefinida. Margen SQL 23 h aprobado, pero el futuro trabajador debe confirmar la hora efectiva, errores de red y la cancelación de mensajes ambiguos.
4. **Despliegue:** no desplegar worker, SMTP, SQL ni cron, no abrir formulario público ni registro. Las funciones actuales de invitar/aceptar/revocar continúan 503 y la pantalla del iPhone aún descarta el token.
5. **Seguridad pendiente:** validar aprobación de remitente y dominio, verificación Auth, rebotes, logs sin secretos, protección contra enumeración/IP y contraseñas filtradas Supabase.
6. **E2E real:** tras autorización del Director, probar primero en un proyecto de ensayo, con correo de prueba, eventos de recepción, caída entre HTTP 200 del proveedor y DB ack, y revocación concurrente.

## Siguiente paso recomendado

**BT-AUTH-R2-A6-P2**: fijar contenido inmutable del correo por invitación y preparar un transport de prueba con respuestas HTTP simuladas, luego la configuración de cuenta/dominio Resend y autorización para primera prueba real aislada. No habilitar producción ni alterar el proyecto Supabase antes de la puerta de seguridad.

**Criterio de cierre aquí:** adaptador y ventana temporal de reintentos preparados y probados, **no** servicio de envío operativo.
