# ByteTorque — BT-AUTH-R2-A6 · Outbox de invitaciones cifrado (primera implementación)

**Fecha:** 14/11/2026 (Chile)  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · única rama `main`.  
**Estado de producto:** **núcleo de outbox y preparación de envío creados; SIN SMTP, sin envío real, sin cambios al proyecto alojado de Supabase ni al Render público**.

## Continuidad
- R1 cerrado por aprobación del Director; base R2-A5 con UI móvil de invitaciones en preparación, preflight Auth, tokens CSPRNG, cupos, rate limit y pruebas PostgreSQL 17.
- Primer taller piloto de Ignacio, BIOMOTORS; marca del producto ByteTorque y SaaS multiempresa.
- Se mantiene la decisión de no desplegar funciones reales, no incorporar datos personales y no usar cuentas reales sin autorización explícita.

## A6-1: reserva e incorporación a outbox en una sola transacción

`docs/sql/BT_AUTH_R2_A6_ENCRYPTED_OUTBOX_CANDIDATE.sql` (**NO APLICAR AL SUPABASE HOSPEDADO**):

- Tabla privada `bt_private.workshop_invitation_outbox`, accesible únicamente al backend `service_role`, RLS habilitada. Cada registro se vincula por FK única con una invitación y su taller.
- El token original **no** se persiste en claro: se guarda un sobre cifrado AES-256-GCM (`ciphertext` + nonce de 12 bytes único), para envío posterior.
- `bt_r2_reserve_and_queue_mechanic_invite`: invoca la comprobación previa de actor/rol/cupo/tenant y reserva invitación **dentro de la misma transacción SQL** que encola el contenido cifrado. Un fallo de la cola revierte la invitación, evitando cupos fantasma.
- `bt_r2_claim_invitation_email`: selección FIFO de trabajos válidos mediante `FOR UPDATE SKIP LOCKED` y lease con UUID; no se reclama un trabajo caducado, cancelado, enviado o sin intentos.
- `bt_r2_mark_invitation_email_sent`: confirma **aceptación por el proveedor**, no entrega final al buzón, y borra ciphertext/nonce tras la respuesta válida. No permite confirmar dos veces ni con un lease incorrecto.
- `bt_r2_fail_or_retry_invitation_email`: hasta cinco intentos con backoff; un fallo terminal revoca la invitación pendiente y borra material cifrado. La actualización toma primero lock del taller para conservar la disciplina multitenant.
- Todos los RPC son `SECURITY INVOKER` y revocan `EXECUTE` de `PUBLIC/anon/authenticated`; permisos solo a `service_role` confiable.

## A6-2: validación criptográfica y preparación de proveedor

- `supabase/functions/_shared/encryptedInviteEnvelope.ts`: empaqueta con AES-GCM y AAD vinculado al `workshopId`, verifica correo del destinatario, token SHA-256 y fecha de expiración antes de construir un email. La llave AES de 32 bytes deberá configurarse exclusivamente como secreto del futuro worker, **nunca en repositorio, SQL, UI ni JWT**.
- `src/auth/encryptedInviteEnvelope.test.ts`: pruebas locales de sellado/apertura, nonce aleatorio, token ausente en ciphertext, claves equivocadas, contexto de otro taller, destinatario falso, tampering y expiración.
- `supabase/functions/_shared/inviteDeliveryAdapter.ts`: contrato puro para proveedor, idempotencia estable basada en el UUID del outbox, composición del correo ya existente e interpretación de respuesta `accepted/retry/permanent-failure`; **no contiene proveedor, red ni credenciales**.
- `src/auth/inviteDeliveryAdapter.test.ts`: proveedor simulado, verificación previa al envío, idempotencia de reintentos, rechazo de taller/email modificados, fallo de proveedor con mensajes genéricos.
- `.github/workflows/bt-auth-r2-edge-check.yml`: `deno check` extendido a ambos módulos compartidos, además de los endpoints cerrados.

## Evidencias y límites

- **PostgreSQL 17 temporal:** [GitHub Actions 43665924248](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43665924248) **SUCCESS**. Aserciones del outbox confirmaron grants/RLS, reversión de reserva ante nonce duplicado, leasing y acuse único, borrado de ciphertext, reintentos y revocación terminal. El resto del laboratorio anterior (cuotas, rate limits, carrera de reservas/aceptaciones) conservó PASS.
- **Criptografía web:** [GitHub Actions 43666030049](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43666030049) Web / iOS PWA **SUCCESS**, tras corregir los casos de cifrado/tampering. El adaptador posterior requiere CI final aparte; consultar resultado antes de declarar aprobado.
- **Deno Edge:** los tres endpoints cerrados ya tenían check independiente PASS; el check ampliado del adaptador/envelope se verificará en la ejecución CI nueva.
- **Base real Supabase:** la revisión SQL de solo lectura antes de esta fase confirmó 2 talleres, 4 usuarios y 4 membresías; **0 tablas privadas nuevas**, sin invitaciones ni RPC A6 instaladas.
- **No hay entrega de correo ni aceptación funcional:** la ruta frontend de invitaciones actual **descarta el token por seguridad** y solo muestra vista en preparación. No generar enlaces reales. Aún no existe trabajador Edge ni proveedor SMTP. El adaptador puro no es un envío.

## Puertas de seguridad que faltan para cerrar R2-A6 completamente

1. **Proveedor transaccional y sender con idempotencia verificable**: seleccionar servicio aprobado, dominio remitente, claves en gestor de secretos, política de consumo/entrega, límites de destinatarios e IP, manejo de `429/5xx` y clasificación de errores permanentes. Si el proveedor no respeta un idempotency key entre reintentos, un worker puede duplicar correos después de un crash.
2. **Operación de worker**: proteger endpoint de trabajo con credencial interna distinta a JWT del navegador, fetch de taller confiable, ejecución de `claim → decrypt → provider → ack/retry`; programación segura y observabilidad sin PII/token. No desplegar o activar cron por ahora.
3. **Reconciliación/revocación**: cancelar outbox y eliminar ciphertext de invitaciones revocadas/vencidas; limpieza para trabajos atascados, cambio de llave y recuperación por outage. Los estados `permanent-failure` del adaptador aún no se conectan a RPC terminal.
4. **Pruebas E2E**: worker con proveedor simulado, caídas entre aceptación externa y acuse, carrera de 2 workers por un job, denegación cruzada real de RPC y límites por IP/WAF.
5. **Aceptación funcional**: conectar token efímero en memoria en web/PWA Safari y Android nativo, llamada Auth verificada y RPC de aceptación atómica. La pantalla actual de solo vista no acepta nada.
6. **Aprobación**: revisar e instalar las migraciones únicamente en ensayo controlado primero; solicitar autorización explícita antes de cambiar el Supabase alojado, activar envíos o habilitar Auth/registro público.
7. Antes de lanzamiento, atender advertencia Supabase sobre protección de contraseñas filtradas desactivada.

## Codex

Conforme a `AGENTS.md`, se priorizó implementación directa con herramientas GitHub para este bloque acotado. **El próximo trabajo amplio sí es buen candidato a Codex**: explorar todos los handlers y construir el worker/provider de forma limitada, usando este checkpoint como fuente de verdad, manteniendo `main` y sin desplegar ni tocar el Supabase alojado.

**Resultado:** R2-A6 núcleo implementado en código y pruebas reales de PostgreSQL; integración operativa de envío/aceptación **pendiente y bloqueada**.
