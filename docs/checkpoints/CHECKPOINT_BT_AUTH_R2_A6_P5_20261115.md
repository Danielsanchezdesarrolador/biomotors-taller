# ByteTorque — Checkpoint BT-AUTH-R2-A6-P5

**Fecha:** 15/11/2026, Chile. **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`, única rama `main`.

## Objetivo y resultado
Unir el creador **P4 real** con **PostgreSQL 17 real pero aislado**, usar las RPC candidatas existentes de invitación/outbox, reclamar la cola con el worker real de TypeScript y responder desde el adaptador Resend **solo con HTTP simulado**. Resultado: **PASS**. No se conectó Supabase hospedado, no se enviaron mensajes ni se desplegaron funciones.

## Commits y fallos corregidos
- Base: `d0db8adfd15505fbb8d238a217a9fc77db034164` (P4 completado).
- [`647ce34`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/647ce34a2ec21cf1d0ec08242edc70f51cebfca3): la expiración del sobre cifrado V3 se valida comparando el mismo instante vía `Date.parse`, no el texto original ISO; el valor `timestamptz` de PostgreSQL puede expresar la misma fecha con `+00:00`. Prueba adicional conserva rechazo de instantes distintos. El sobre no cambia su formato.
- [`c6aa451`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/c6aa451377514d021c88b0a4d723c742205dc7da): laboratorio Deno que inyecta SQL REAL en `issueMechanicInvitationCandidate`, descifra ciphertext recuperado de DB y ejecuta `processOneInvitationEmail` con lease/ACK reales y proveedor HTTP mock. Primer laboratorio FAIL en un detalle del adaptador: los booleanos `::text` retornan `true`/`false`, no `t`/`f` (el worker abortó sin envío).
- [`ee49fcd`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/ee49fcda2a137c9cd16164a09d31ac35fe4a414b): corrección de booleans, comprobación `deno check` del laboratorio antes de ejecutarlo y retirada de código muerto. Reejecución PASS.

## Flujo real de la prueba
1. Arranca un contenedor limpio `postgres:17`, ejecuta las migraciones **candidatas**, fixtures sintéticos y pruebas SQL previas; NO se toca Supabase hospedado.
2. El creador P4 recibe `VerifiedInviteActor` **simulado por el harness** y obtiene el taller desde PostgreSQL aislado. **Todavía no prueba una sesión JWT/usuario Auth real**.
3. Genera un token criptográfico, cifra un sobre V3 y llama exactamente una vez a la RPC existente `public.bt_r2_reserve_and_queue_mechanic_invite`; PostgreSQL reserva y encola atómicamente.
4. Recupera el ciphertext y nonce reales de `bt_private.workshop_invitation_outbox`; valida digest y descifrado contra los datos del taller/destinatario y el `timestamptz` devuelto.
5. Un usuario con membresía solo en otro taller intenta reservar en el taller A: la RPC rechaza permisos y verifica que no se creó invitación cruzada.
6. `public.bt_r2_claim_invitation_email` concede lease. `public.bt_r2_invitation_email_lease_valid` responde verdadero; el worker ejecuta el adaptador Resend **inyectado y sin red**, cuyo mock comprueba body JSON congelado/idempotencia y contesta 200 sintético.
7. Se llama la RPC real `public.bt_r2_mark_invitation_email_sent`: un solo ACK, `status='sent'`, ciphertext/nonce borrados, intento único, sin cola reclamable restante para esa invitación.
8. La prueba no imprime secreto, token ni ciphertext en salida propia. Advertencia: PostgreSQL del laboratorio puede incluir *parámetros de sentencias fallidas* en sus logs; solo se usan datos ficticios y claves sintéticas. Antes de producción, controlar logs de errores y retención.

## Evidencia
- [PostgreSQL aislado y Deno integral #43708017370](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43708017370) **SUCCESS**; log `PASS: P5 local PostgreSQL 17 integration, V3 ciphertext DB round-trip, owner reservation, cross-tenant rejection, real lease and ACK, immutable HTTP mocked once, ciphertext purged; NO EXTERNAL SEND`.
- [CI principal #43708017350](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43708017350) **SUCCESS**: TypeScript web, **39 archivos / 365 pruebas Vitest PASS**, build PWA y verificaciones de marca y exclusión de fixtures; Android React Native/Expo PASS. No APK.
- [Corrección aislada del timestamp: Deno #43707683480](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43707683480) **SUCCESS**. Los archivos de Edge no desplegados siguen sin modificaciones en P5.
- Fallo intermedio del laboratorio [#43707856897](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43707856897) documentado y corregido. No se oculta ni considera PASS.

## Seguridad hospedada (solo lectura)
Proyecto Supabase `suxcqqnmcjoezfxltoms`: **2 talleres, 4 usuarios Auth, 4 membresías y 0 tablas `bt_private`**; Edge alojada únicamente `bt-owner-onboarding`. Ninguna migración, cuenta, secreto, permiso, worker o correo real activado. El frontend de Render puede desplegarse desde `main` por su configuración anterior, pero no se modificaron pantallas ni flags de publicación.

## Limitaciones y puerta siguiente
- El laboratorio prueba **módulos de aplicación reales con PostgreSQL real en contenedor**, pero la identidad Auth es un fixture y las llamadas a la RPC las ejecuta el proceso local con rol de servicio de laboratorio; no demuestra autenticación service-to-service de Supabase hospedado.
- El proveedor recibe solo un mock 200. No prueba Resend real, entrega en bandeja, 409, rebotes, WAF o conectividad real (estos escenarios siguen bajo pruebas unitarias/simuladas).
- Pendiente implementar **autenticación del worker** de extremo a extremo: secreto de servicio con nombre y alcance restringido, `withSupabase({auth:'secret:<nombre>'})` y comprobación de origen con política `verify_jwt` coherente. **Hoy no cambiar `supabase/config.toml` ni endpoints**; la desactivación del JWT de la plataforma solo podría acompañarse en el mismo despliegue de un wrapper probado y autorizado.
- Luego: dominio y cuenta Resend remitente verificados, autorización de un envío E2E controlado a un buzón propio, migraciones autorizadas, aceptación real R2-A6-6 con token único y correo Auth confirmado. Mantener registros/pagos públicos y invitaciones inactivas.

[Puerta M2M y prueba controlada](../BT_AUTH_R2_A6_P5_SERVICE_AUTH_GATE.md).
