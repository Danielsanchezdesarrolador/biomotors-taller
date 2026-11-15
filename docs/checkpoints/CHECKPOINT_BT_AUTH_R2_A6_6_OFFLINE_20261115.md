# ByteTorque — Checkpoint BT-AUTH-R2-A6-6 (Aceptación segura de invitación, candidato OFFLINE)

**Fecha:** 15/11/2026, Chile. **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`, rama única `main`.  
**Tipo de cierre:** código + laboratorio PostgreSQL 17 real, **NO endpoint real ni acceso público habilitado**.

## Estado anterior
- Se continuó desde R2-A6-P6, commit `e7010edb952188dfc7624740a04b8c442382a8f1`, sin rehacer módulos P1–P6.
- El creador P4/P5 ya sellaba sobres V3 y había integrado reserva/outbox/worker con SQL de prueba. La Auth de los participantes se simulaba y faltaba enlazar la aceptación del token con la RPC SQL existente.
- Las tablas SQL `bt_private`, la RPC `public.bt_r2_accept_mechanic_invite`, controles de vencimiento, revocación, cuotas y concurrencia ya eran candidatos probados en PostgreSQL aislado.

## Qué se implementó
1. **`supabase/functions/_shared/mechanicInviteAcceptCandidate.ts`**: coordinador de aceptación **exclusivamente de servidor**. Admite body con **solo** `{token}` hexadecimal de 64 caracteres; recibe la identidad `VerifiedInviteActor` que un futuro endpoint debe obtener previamente de `verifyInviteActor` / Auth `getUser` con correo confirmado.
2. Rechaza payload con `role`, `plan`, `workshop_id`, `email`, `user_id` u otros privilegios. Verifica UUID de 5 segmentos en minúscula y correo confirmado válido normalizado. Calcula SHA-256 sobre los 32 **bytes originales** del token.
3. Entrega a **una sola RPC inyectada** el usuario verificado, correo verificado y SHA-256 hexadecimal. La RPC SQL `public.bt_r2_accept_mechanic_invite` permanece autoridad única para tenant, rol mecánico, caducidad, revocación, cupos, lock del taller, membresía única, auditoría y prohibición de replay; el coordinador **no ejecuta SQL ni red por sí mismo**.
4. Devuelve exclusivamente `accepted`, `denied` o `unknown` (conexión caída tras posible commit, **sin reintento automático**). No expone token, JWT, SHA, correo, detalles SQL ni identidad en resultados.
5. **`src/auth/mechanicInviteAcceptCandidate.test.ts`**: siete pruebas Vitest de contrato, bytes/digest, ataques por payload, tokens malformados, identidades inválidas y respuesta SQL falsa/ambigua. Se mantienen todas las suites anteriores.
6. **`scripts/security/bt-r2-lab-creator-worker-e2e.ts`**: se extendió el laboratorio integral real P5. Tras reservar invitación, cifrar y enviar exclusivamente al proveedor mock, extrae el token de la carta de **prueba** descifrada (nunca del navegador, red o correo real). Valida `verifyInviteActor` real con `fetch` inyectado que responde como Auth sin tráfico externo; deniega correo no confirmado. Luego llama a `bt_r2_accept_mechanic_invite` **real de PostgreSQL 17** a través del coordinador: email equivocado rechazado, digest falso rechazado, email correcto aceptado, replay denegado, exactamente una membresía mechanic y un evento `invite_accepted`. Las pruebas SQL anteriores cubren además revocación, vencimiento, cupo y concurrencia.
7. `.github/workflows/bt-auth-r2-edge-check.yml` valida TypeScript Deno del nuevo coordinador. Los workflows mantienen Web/PWA, Expo Android, Deno y PostgreSQL efímero.

## Incidencias corregidas en el mismo bloque
- [`aff095a9`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/aff095a9ec110564753b1217855841dbd4b0206a) creó el módulo. El primer CI falló por un patrón UUID de seis segmentos (rechazo seguro); en pruebas positivas no llegó a SQL.
- [`bcf0a6c2`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/bcf0a6c20945b2908311f13efff80400380c358c) extendió laboratorio integrado; identificó el mismo error de UUID mediante la prueba real. **Fallos intermedios documentados** en [CI #43714759563](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43714759563) y [PostgreSQL #43714759433](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43714759433).
- [`5933e1b5`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/5933e1b53ee3b3d800ca85922c3359c9c2e67bba) corrigió formato UUID de 5 segmentos. PostgreSQL integrado pasó, pero un fixture `actor.userId.toUpperCase()` compuesto solamente por dígitos no introducía mayúsculas y causó un falso fallo de prueba.
- [`e759d209`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/e759d209bbab61ea11d22bee0f1f8ac8f43a9cba) corrigió el fixture con un caracter A mayúsculo verdadero y dejó la batería **388/388 PASS**.

## Evidencia verificada
- [CI principal #43714925123](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43714925123) — **SUCCESS**: **41 archivos, 388/388 tests Vitest**, TypeScript, PWA/build, Android React Native/Expo y protección de assets. **No APK generado**.
- [PostgreSQL real aislado #43714833785](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43714833785) — **SUCCESS** con R2-A6-6 end-to-end SQL, email erróneo/replay, audit y membresía; no correos ni tráfico externo. Una revisión anterior había fallado por UUID, no por permisos SQL.
- [Deno Edge #43714833814](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43714833814) — **SUCCESS**, solo tipo, SDK de servicio P6 con claves sintéticas y guardia fail-closed. **Sin deploy**.

## Verificación hospedada (solo lectura)
Proyecto Supabase `suxcqqnmcjoezfxltoms`: **2 talleres, 4 usuarios Auth, 4 membresías y 0 tablas `bt_private`**. La única Edge Function activa sigue siendo `bt-owner-onboarding`. No se instalaron tablas, permisos, cuentas, secretos, funciones, emails ni cambios de frontend/Android reales.
El endpoint `bt-mechanic-accept/index.ts` sigue devolviendo 503 incondicional **incluso si el flag se activa**. El worker también permanece 503; se conserva `verify_jwt=true`.

## Pendientes y siguiente puerta
- **No confundir**: `verifyInviteActor` consulta un endpoint Auth simulado con inyección en el laboratorio; ninguna cuenta real ha sido validada para aceptar invitaciones. La RPC sí corrió contra Postgres 17 real efímero. El correo electrónico también fue mock.
- Una integración productiva requerirá **aprobación explícita** de migraciones alojadas, secretos/backend, cuenta y remitente Resend, envío individual controlado y despliegue de aceptación; preservar rate limit por actor/IP, revocación, token de uso único, protección de CSRF/CORS y privacidad de logs.
- Aún **no existe pantalla funcional de aceptación** en iPhone PWA ni en Android nativo. Antes de activarla: implementar autenticación y UX de enlace (token nunca registrado en analytics/logs/almacenamiento permanente), recuperar sesión Auth, comprobación de email confirmado, final de flujo y pruebas reales iPhone.
- La futura conexión del endpoint debe verificar JWT/Auth `getUser` en servidor, invocar la RPC service-only y retornar un mensaje genérico de token incorrecto/expirado/revocado evitando enumeración.

**Cierre:** `BT-AUTH-R2-A6-6` **aceptación backend probada en laboratorio**. **Activación pública pendiente**.
