# Encargo acotado para Codex — ByteTorque R2-A6 · Worker seguro de invitaciones (SIN deploy)

**Rama:** exclusivamente `main` en `Danielsanchezdesarrolador/biomotors-taller`.  
**Estado base:** [checkpoint R2-A6](checkpoints/CHECKPOINT_BT_AUTH_R2_A6_20261114.md).  
**Nivel de autorización:** solo código, tests, CI y documentación. **NO ejecutar migraciones en Supabase hospedado, NO desplegar Edge Functions, NO enviar emails, NO cambiar flags de Render ni crear cuentas reales.**

## Lectura obligatoria antes de editar

1. `AGENTS.md`, `README.md`, `roadmap.md`.
2. `docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_20261114.md`.
3. Candidatos SQL `docs/sql/BT_AUTH_R2_A_INVITATIONS_CANDIDATE.sql`, `BT_AUTH_R2_A2_ACCEPT_REVOKE_CANDIDATE.sql`, `BT_AUTH_R2_A5_RATE_LIMIT_CANDIDATE.sql`, `BT_AUTH_R2_A6_ENCRYPTED_OUTBOX_CANDIDATE.sql`.
4. `supabase/functions/_shared/encryptedInviteEnvelope.ts`, `inviteDeliveryAdapter.ts`, `verifiedInviteActor.ts`, `mechanicInviteEmail.ts`, `mechanicInviteToken.ts`.
5. Los tres endpoints existentes `bt-mechanic-invites`, `bt-mechanic-accept`, `bt-mechanic-revoke` **siempre cerrados 503**; preservar ese invariante.

## Misión técnica siguiente

Completar en código el diseño del **worker de invitaciones** con simulación integral en entorno aislado, pero sin proveedor real:

1. Diseñar handler interno separado del navegador, con autenticación machine-to-machine o secreto de función (sin exponer `service_role`), bandera OFF y devolución 503 si no hay autorización de despliegue. No asumir que CORS protege un endpoint.
2. Modelo `claim → decrypt → compare context → render → provider(mock) → ack/retry`: no loggear JWT, email, texto con token, ciphertext, iv, claves ni respuesta sensible del proveedor. Validar que la consulta de `workshopName` procede de DB y coincide con `workshop_id`.
3. Añadir pruebas de fallo entre `provider.accepted` y `ack`, doble ejecución/lease caducado, error transitorio vs permanente, token expirado, revocación previa al claim y dos workers que compiten por el mismo trabajo (PostgreSQL 17 efímero); añadir controles para que el payload cifrado se borre tras sent/failed/cancelled.
4. Documentar y comprobar idempotency key real del proveedor **antes de elegirlo**. No prometer exactly-once a nivel SMTP si el proveedor no garantiza idempotencia. El éxito HTTP del proveedor no es prueba de lectura/entrega al destinatario.
5. Proponer, sin aplicar, SQL de cancelación/reconciliación con bloqueo de taller consistente; revisar manejo de fallos permanentes, reintentos, recuperación y retención. No dejar tokens de invitación utilizables después de revocación.
6. Si un proveedor real requiere costes, dominio remitente verificado, credenciales o configuración, **NO activarlo** y registrar la decisión pendiente para el Director.
7. Verificar TypeScript, Vitest, Deno check, laboratorio Postgres, PWA oficial y Android existentes. Mantener 300 pruebas o más, sin regresiones, y aportar links a CI.
8. Actualizar `roadmap.md` y un checkpoint R2-A6-worker con diferencias entre propuestas, pruebas reales y funciones operativas, con SHA final de `main`.

## Reglas estrictas

- No ramas paralelas, PRs o forks; trabajar solo en `main` según `AGENTS.md`, y no reescribir historial.
- Sin secretos en commits, respuestas, screenshots, PWA o APK. No usar producción como laboratorio.
- Nunca tomar `user_metadata`, `workshop_id`, `role`, `plan`, usuario o email confirmado del navegador como fuente de autoridad.
- No implementar envío de correos a clientes; esta etapa solo invitaciones internas de mecánicos.
- No activar UI de aceptación real hasta implementar token efímero y validación de rol en servidor.
- ByteTorque es marca visible; BIOMOTORS es solo el taller piloto.
- Respetar una sola PWA web/iPhone y Android React Native/Expo nativo separado.

## Entrega

Commits trazables en `main`, suite PASS comprobada y checkpoint. Si falla una puerta de seguridad o el proveedor no ofrece idempotencia, **dejar bloqueado**, documentar impedimento y no improvisar bypass.
