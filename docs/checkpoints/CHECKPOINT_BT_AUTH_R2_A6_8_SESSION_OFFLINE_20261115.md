# ByteTorque — Checkpoint R2-A6-8 · Continuidad de invitaciones y sesión (SIN ACTIVAR)

**Fecha:** 15/11/2026, Chile. **Proyecto:** `Danielsanchezdesarrolador/biomotors-taller`. **Única rama:** `main`. **Base:** R2-A6-7, commit `ebb2e84ae8603597a20ec6b7bc07436f66509915`.

## Misión y resultado

Preparar sin activar la coordinación entre un enlace de invitación temporal (A6-7) y cambios de sesión Auth: usuario aún sin cuenta/membresía, correo no confirmado, cierre o reemplazo de sesión, refresh asíncrono, vencimiento, cambio de página o contexto Safari/PWA. **El flujo real no se ha conectado a la app pública.** No se crean cuentas, roles ni datos de taller.

## Implementación

- `src/auth/inviteSessionCandidate.ts`: coordinador **solo en memoria y solo en laboratorio**, sin importar en `src/main.tsx`, `src/App.tsx`, `RealAccess`, endpoints de Supabase ni Android. Recibe un gateway inyectado con `getUser()` (en un futuro autenticación del usuario), reusa `createMemoryOnlyInviteHandoff` para limpiar URL **antes** de guardar el token y mantener su vida máxima de cinco minutos. No usa `localStorage`, `sessionStorage`, IndexedDB, cookies, networking, logs, telemetría ni secreto de servicio.
- La identidad Auth **confirmada** y un UUID válido permiten preparar la continuación aunque el usuario aún no tenga membresía. Esto es solo estado de UX, **no autoriza ningún rol, taller ni operación**; la RPC SQL del backend será quien cree la membresía. No se permite identidad derivada de user_metadata o de datos de la URL.
- Estados seguros de solo presentación: `empty`, `awaiting-login`, `checking`, `ready`, `expired`, `discarded`, `consumed`. `snapshot()` solo entrega una etiqueta, nunca token, JWT, correo, ID usuario o digest.
- Sin sesión, el token puede mantenerse hasta que el usuario inicie sesión **dentro de la ventana de cinco minutos**, pero un usuario sin correo confirmado, una cuenta distinta, un logout, un Auth inválido/offline o el abandono de la pantalla cancela el token; requiere reabrir el enlace. `SIGNED_IN` posterior a una identidad verificada cancela por precaución, mientras `TOKEN_REFRESHED` obliga a un nuevo `getUser()` y a comprobar que sigue siendo el mismo usuario.
- `consumeAfterRecheck()` pide **una segunda verificación** de sesión inmediatamente antes de soltar el token una única vez a un eventual consumidor backend autorizado. Se evita el doble consumo y se ignoran respuestas asíncronas antiguas si ocurre logout, reemplazo de cuenta o recarga. Aún **no existe ese consumidor real**, por diseño.
- `scripts/verify-official-bundle.mjs` impide incluir **ambos** candidatos de token (`inviteHandoffCandidate` y `inviteSessionCandidate`) en el bundle público. La PWA vigente mantiene su comportamiento previo: `src/main.tsx` ejecuta `scrubInviteLocation` antes del render y descarta cualquier token de invitación.
- `src/auth/inviteSessionCandidate.test.ts`: **24 casos nuevos** centrados en inicio de sesión después de abrir enlace, confirmado/sin membresía, cambio de usuario, logout, vencimiento, eventos de Supabase, concurrencia y retrocesos por red/identidad inválida. Las pruebas no invocan Supabase alojado ni envían correo.

## Incidencias de CI corregidas

1. [`373dee5`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/373dee53d7154d16ff32e947aef8a5febdc1b829): primera versión de candidato y tests. Una respuesta `undefined` de gateway en la prueba de carrera provocaba `TypeError` en el guard de identidad. `CI #43720704683` falló, no ocultado.
2. [`1bd23d6`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/1bd23d6fdce91ab50db55960e845121f17fb601b): protección de exclusión del paquete público. La misma prueba aún fallaba.
3. [`1159205`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/1159205fc4900df2cfc0fe4c8f9f61d737d63857): corregido el guard para negar también objetos malformados/arrays/`null`/`undefined` en vez de lanzar excepción. Test adicional para estos casos. TypeScript del fixture debía tratar respuestas malformadas como `unknown`, no `Identity`.
4. [`4549d8d`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/4549d8d5d61004c2f7a2c57222f83c74ed4a7ef3): corrección de typecheck del fixture; [CI #43720918574](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43720918574) SUCCESS con 421 pruebas.
5. [`52ef503`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/52ef503d1eecb84ad9b003e4d589f5a032bf8b33): carrera adicional `TOKEN_REFRESHED` durante segunda verificación: cancelar operación antigua y **soltar el candado in-flight** para permitir una nueva verificación y un único consumo, sin reutilizar el resultado obsoleto. Prueba de regresión añadida.

## Evidencia final

- [CI web/iOS PWA y Android #43721109326](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43721109326): **SUCCESS**, **43 archivos / 422/422 tests Vitest**, TypeScript, build PWA, verificación del grafo público sin el candidato, typecheck y export Expo Android sin APK.
- [CI anterior #43720918574](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43720918574): SUCCESS antes de la última prueba de refresh. Los errores previos de TypeError y casting se corrigieron y no se presentan como PASS.
- **No se volvió a ejecutar PostgreSQL 17**: este bloque no cambia backend, tablas ni RPC, y conserva la evidencia SQL R2-A6-6 [#43714833785](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43714833785).
- Ningún inicio/cierre de sesión real por navegador ni ensayo físico iPhone se declara probado; el gateway de las pruebas es sintético.

## Supabase alojado — evidencia solo lectura

Proyecto independiente `suxcqqnmcjoezfxltoms`: **2 talleres, 4 usuarios Auth, 4 membresías y 0 tablas del esquema `bt_private`**. Única Edge activa `bt-owner-onboarding`. No se aplicaron migraciones, crearon claves, desplegaron funciones ni enviaron correos. `bt-invite-worker` y `bt-mechanic-accept` siguen con el bloqueo existente (503 en código), fuera de hospedado. Sin modificación Android nativo.

## Próxima puerta

1. Mantener A6-8 fuera del bundle público hasta autorización. No permitir un cambio de flag para saltarse backend.
2. Preparar una **integración futura** de estados del navegador/PWA Safari y Auth real con auditoría: sesión confirmada, ruta del enlace, fallback cuando hay distinta instalación, logout y limpieza por navegación/pagehide. Sin token en almacenamiento, portapapeles automático, métricas o URLs posteriores.
3. Si se decide activar aceptación real: autorización explícita de migraciones SQL, controles antiabuso, secreto backend, funciones Edge protegidas, proveedor/remitente Resend verificado y una prueba limitada a cuenta propia; revisión independiente de expiración, RLS, token único y rollback. Solo después probar iPhone físico y Android nativo.

**Importante:** el coordinador offline representa una simulación de UX y no sustituye la autenticación del servicio ni el permiso PostgreSQL. **No se ha habilitado la aceptación pública de invitaciones.**
