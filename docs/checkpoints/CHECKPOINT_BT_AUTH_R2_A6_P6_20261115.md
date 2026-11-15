# ByteTorque — Checkpoint BT-AUTH-R2-A6-P6 · Autenticación M2M con SDK real, SIN ACTIVAR

**Fecha:** 15/11/2026, Chile. **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`. **Única rama:** `main`.  
**Estado:** **laboratorio M2M aprobado con SDK real, candidato no desplegable**. Sin invitaciones ni correos externos.

## Baseline y alcance

- Base: `3daa4eac4a73d78abe84d168e0581e90f4d564a2` (R2-A6-P5, SQL PostgreSQL 17 integrado y proveedor mock PASS).
- Objetivo: demostrar la validación por **clave Supabase secreta nombrada** de un trabajador interno antes de activar la infraestructura. No crear ni revelar secretos reales, no cambiar `supabase/config.toml`, no desplegar Edge, no tocar SQL alojado.
- Documentación consultada: [Supabase — Securing Edge Functions](https://supabase.com/docs/guides/functions/auth), [Authorization headers](https://supabase.com/docs/guides/functions/auth-headers), [Supabase changelog](https://supabase.com/changelog.md), [@supabase/server v1.9.2](https://github.com/supabase/server/releases/tag/server-v1.9.2). En noviembre 2026 CLI v3 es local por defecto y tiene incompatibilidades respecto a v2; no se ejecutó actualización CLI.

## Implementación verificable

1. `supabase/functions/bt-invite-worker/serviceAuthPolicy.ts`: política posterior a la autenticación; exige POST sin cuerpo, sin Origin ni Authorization. Rechaza invocaciones con payload, ids de taller o outbox, preflight, JWT del navegador y acceso web; responde 405/403/413. **NO autentica claves por sí sola** y no debe convertirse en endpoint independiente.
2. `supabase/functions/bt-invite-worker/serviceAuthCandidate.ts`: **candidato sin `Deno.serve` ni exportación de entrypoint**. Usa realmente `withSupabase` de `npm:@supabase/server@1.9.2`, fijado con `auth:'secret:bytetorque-worker'`. El SDK autentica el valor de `apikey` contra la clave nominativa exacta; el resultado autorizado pasa por la política y **siempre responde 503**. No consulta `ctx.supabaseAdmin` ni usa DB, SMTP, provider, claves reales o worker.
3. `src/auth/workerServiceAuthPolicy.test.ts`: 16 pruebas nuevas en Vitest sobre método, ausencia de contenido, Origin, Authorization, CORS, encabezados sin caché y fallos seguros. Mantiene inaccesible el worker aunque el formato de solicitud sea válido.
4. `scripts/security/bt-r2-service-auth-offline.test.ts`: prueba **real** de `@supabase/server@1.9.2` bajo Deno, con URL ficticia, diccionario de tres claves sintéticas y permisos `--allow-env` **sin `--allow-net`**. Cuatro tests PASS: (a) clave nombrada correcta llega a 503, (b) sin clave, wrong/default u origen publicable denegados 401/403, (c) JWT del usuario no autentica servicio, (d) incluso con clave de servicio válida se rechazan payload y origen de navegador.
5. `scripts/security/bt-r2-worker-fail-closed.mjs`: verificador estático de protección: `supabase/config.toml` debe conservar `verify_jwt=true` y `bt-invite-worker/index.ts` debe seguir 503, sin dependencias de DB/red ni importar el candidato. Rechaza `Deno.serve`, `export default` o `auth:'none'` ejecutables en el candidato.
6. `.github/workflows/bt-auth-r2-edge-check.yml`: `deno check --node-modules-dir=auto` del SDK oficial fijado, pruebas Deno M2M reales con claves sintéticas y guardia de bloqueo, gatillos ante cambio de config, ruta de candidato y verificador. **Solo CI offline**.

## Incidencias detectadas y resueltas

- [`4a61449`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/4a614494aa20a5ddbf0e2763faf016b7ed945d4b): políticas y tests. En el primer CI Deno, la dependencia npm no se resolvió por el modo `node_modules` del repositorio; **no** era falla de autenticación.
- [`da69151`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/da69151997f6e153498975da5a679e080882976c): activar resolución Deno `--node-modules-dir=auto` únicamente en CI del candidato; PASS.
- [`5050f31`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/5050f31e2429a88fe7586ee730692456a68ae88e): cuatro pruebas con el SDK real y credenciales sintéticas; PASS [Deno #43713098165](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43713098165).
- [`433a2a8`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/433a2a870a8ef9cbe8a9ec699d2fe6c09dbb4508): guardia estática en CI; el primer intento consideró un comentario de seguridad como código y falló.
- [`ec3112c`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/ec3112c8fcc59dfca054d01a4d7fec94639cc2c7): corrección de la guardia para filtrar comentarios, sin alterar código operativo. **CI Deno #43713431842 SUCCESS**, incluidos 4/4 tests reales y verificador de bloqueo. El fallo intermedio queda documentado, no se presenta como PASS.

## Evidencia final

- [CI principal web/iOS PWA + Android #43713431820](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43713431820): **SUCCESS**. TypeScript web, **40 archivos / 381/381 tests Vitest PASS**, PWA build, protección de assets y verificación de Android/Expo; no se creó APK.
- [CI Edge Deno M2M #43713431842](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43713431842): **SUCCESS**. `deno check` para import real del SDK pinneado, **4/4 pruebas Deno sin acceso a red** y guardia fail-closed del worker y configuración.
- PostgreSQL 17 real (solo Docker) y cierre R2-A6-P5 anterior permanecen verificados: [#43708017370](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43708017370). No se ha desplegado ningún código P6 ni ejecutado nuevo SQL en hospedado.

## Comprobación alojada, solo lectura

Proyecto `suxcqqnmcjoezfxltoms`: **2 talleres, 4 usuarios Auth, 4 membresías y 0 tablas `bt_private`**. Edge activa únicamente `bt-owner-onboarding` preexistente. Ningún secreto nuevo, ningún permiso/migración/correo/worker creado o activado. En repo: el entrypoint `bt-invite-worker/index.ts` sigue 503 y `verify_jwt=true`.

## Límites honestos y siguiente puerta

Este bloque **demuestra la autenticación con la librería Supabase real contra claves sintéticas en aislamiento**, no contra una cuenta, clave o gateway alojado real. La política de request NO sustituye al SDK autenticador; el candidato no es la entrada de Edge y carece de acceso a DB y transporte.

La activación del worker requerirá autorización explícita para: crear clave Supabase **nombrada** `bytetorque-worker` y gestionar su rotación; construir el entrypoint productivo usando `withSupabase` con comprobación de clave; coordinar en la misma revisión `verify_jwt=false` **solo para esa función**, porque la clave `sb_secret_` se envía en `apikey`; conectar RPCs con service_role únicamente en backend seguro; definir kill switch, cuotas, logs seguros y pruebas E2E contra proyecto autorizado. No habilitar Resend ni SQL hospedado antes de autorización aparte.

**Siguiente fase de funcionalidad:** `R2-A6-6` aceptación verdadera: email confirmado, token único, revocación, rate limit, RLS y pruebas físicas Safari iPhone + cliente Android. Ver [runbook P6](../BT_AUTH_R2_A6_P6_ACTIVATION_GATE.md).
