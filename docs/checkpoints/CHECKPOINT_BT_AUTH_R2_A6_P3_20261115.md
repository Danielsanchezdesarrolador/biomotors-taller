# ByteTorque — Checkpoint BT-AUTH-R2-A6-P3 · Snapshot HTTP cifrado

**Fecha:** 15/11/2026 (Chile). **Repo:** `Danielsanchezdesarrolador/biomotors-taller`. **Única rama:** `main`.

## Baseline y alcance

- Inicio: `7f1117cb0bedd794392b7c98acaa7f863e222331` (R2-A6-P2, CI SUCCESS).
- Implementación P3: [`f031e0d`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/f031e0dbd6013a22dc5811a6c1da71391190d0e2).
- Naturaleza: **seguridad de formato HTTP, candidato offline, SIN red real, SIN Resend activo y SIN despliegue**. No hay un frontend de invitaciones operativo ni una cuenta de proveedor configurada.

## Cambio principal

El sobre AES-256-GCM sube de V2 a **V3** y contiene, además del token y del contenido del correo, un `wireBody` con los bytes exactos del JSON que luego utilizará `POST /emails`. El body se serializa una sola vez durante el cifrado anterior a la futura RPC atómica de reserva+outbox; el trabajador **no reconstruye el JSON** durante reintentos.

`resendInviteWireV1.ts` fija el orden y campos `from`, `to` (un único destinatario), `subject`, `text` y `html`. Al descifrar y antes de transportar, se comprueba que `wireBody` coincide con los campos congelados. Una modificación de campos, orden o serializer falla cerrada; no se emite el correo con otra carga y la misma `Idempotency-Key`. Cambios futuros de protocolo deben crear un serializer versionado nuevo; el actual nunca se modifica silenciosamente mientras existan trabajos pendientes.

Las versiones 1 y 2 continúan como contexto histórico y utilidades de pruebas, pero el nuevo trabajador **rechaza V1/V2**. No hay mensajes productivos que migrar: el Supabase alojado continúa con 0 tablas `bt_private`. No se cambió SQL candidato, endpoints ni infraestructura hospedada.

## Archivos de implementación y pruebas

- `supabase/functions/_shared/resendInviteWireV1.ts` — serializer y comparación exacta.
- `supabase/functions/_shared/encryptedInviteEnvelope.ts` — cierre cifrado V3 con snapshot.
- `supabase/functions/_shared/inviteDeliveryAdapter.ts` — tipo de entrega inmutable extendido.
- `supabase/functions/_shared/resendInviteCandidate.ts` — solicitud HTTP utiliza **el snapshot**, no `JSON.stringify` de nuevo.
- `src/auth/resendInviteWireV1.test.ts` — contrato de bytes exactos, mutación, orden, destinatario único.
- `src/auth/resendInviteCandidate.test.ts` y `src/auth/immutableInviteResend.test.ts` — mocks, detección de drift de cuerpo/subject y reintentos idénticos.
- `.github/workflows/bt-auth-r2-edge-check.yml` — comprobación Deno del serializer nuevo.

## Evidencia de ejecución

- [Web/iOS PWA y Android #43671864663](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43671864663) — **SUCCESS**. 38 archivos y **355 pruebas Vitest PASS**, TypeScript, build PWA + validación de bundles y exportación de Android/Expo. No se construyó ni firmó APK.
- [Deno Edge #43671864675](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43671864675) — **SUCCESS**, solo typecheck (ninguna Edge Function desplegada).
- [PostgreSQL 17 #43671864670](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43671864670) — **SUCCESS**, candidatas en Docker efímero, reservas atómicas, acceso cruzado denegado, `SKIP LOCKED`, concurrencia, ciphertext purgado, ventana de idempotencia 23 h. Este bloque no modificó SQL; son verificaciones de regresión.

## Lecturas del hospedado

Lectura SELECT al proyecto `suxcqqnmcjoezfxltoms`: **2 talleres, 4 cuentas Auth, 4 membresías y 0 tablas privadas `bt_private`**. Consulta de funciones: únicamente `bt-owner-onboarding` ya existente; ninguna función de invitaciones desplegada. No se alteró el hospedado.

## Limitaciones y siguiente puerta

1. Las pruebas demuestran que el software conserva los **bytes preparados** de la carga HTTP y detecta cambios; **no garantizan entrega real, exactly-once universal ni idempotencia más allá de las 24 h de Resend**. Conservar corte SQL de 23 h y cerrar trabajos ambiguos.
2. El cifrado V3 todavía debe conectarse a un **creador backend operativo** que obtenga de DB el nombre y destino autorizados y de configuración segura el remitente. No aceptar remitente ni nombre del navegador.
3. Queda pendiente autenticación interna del worker, secreto limitado de Resend, proveedor/dominio, privacidad y logs, rate limit de red, rotación de clave, prueba de aceptación Auth y correos rebotados.
4. Revisar nuevos patrones de Supabase Edge Functions para autorización machine-to-machine; no desactivar `verify_jwt` sin implementar simultáneamente autenticación de secreto. Endpoint actual permanece 503.
5. El correo enviado durante una revocación concurrente puede llegar igual. El token revocado debe ser rechazado a nivel DB/Auth.

**Siguiente:** seguir el [runbook de preparación](../BT_AUTH_R2_A6_P3_RESEND_PREPARACION.md), solicitar autorización expresa para una prueba E2E con dirección propia/dominio verificado, luego R2-A6-6. No activar infraestructura real hasta superar la puerta de seguridad.
