# ByteTorque — Checkpoint BT-AUTH-R2-A6-7 · Enlace y UX iPhone, sin activación

**Fecha:** 15/11/2026 · **Rama:** `main` única. **Base:** R2-A6-6 `c6b55e013a53434520c383ea6c503eaf629f4958`.

## Resultado

Preparado un ciclo de invitación más comprensible para iPhone y un módulo de continuidad de enlace solamente para pruebas. **La PWA publicada sigue descartando el token antes de montar React y jamás intenta aceptar una invitación.** No se modificaron los entrypoints Edge, Auth, SQL, Android nativo ni `supabase/config.toml`.

### Cambios

1. [`a69ec4a`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/a69ec4a290cb317e5efd35e496fa22854d839590): `src/auth/inviteHandoffCandidate.ts`, instancia **sin estado global** ni persistencia, completamente **NO IMPORTADA** por App/main/Edge. En un futuro flujo expresamente autorizado, el candidato puede leer solo el formato exacto de `#/auth/aceptar-invitacion?token=<64 hex>` o ruta profunda equivalente; el callback de `replaceState` debe limpiar la URL **antes** de retener el token. Rechaza query adicional, tokens falsos/mayúsculas, rutas confusas y URL que no pudo limpiar. Guarda el token exclusivamente en una variable de cierre por un máximo de **5 minutos**; lo entrega una sola vez, borra en expiración, nuevo enlace o limpieza manual. No verifica identidad ni concede permisos: el backend y PostgreSQL deben hacerlo en despliegue futuro.
2. `src/auth/inviteHandoffCandidate.test.ts` agrega **10 pruebas Vitest**: captura después de redacción, one-time, URL profunda, tokens falsos/duplicados, expiración, invalidación, falla `replaceState`, aislamiento de instancias/pestañas, reloj inválido, rutas ambiguas. No hay almacenamiento local, cookies, red ni consulta a Supabase.
3. [`a05492e`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/a05492e84d88e511082dd07bdb520fb76d9cc1d8): mejora la pantalla `InviteAcceptancePreview` manteniendo su bloqueo 503 conceptual y el texto `Invitaciones aún no disponibles`. Incluye orientación explícita para iPhone: Safari y PWA instalada **pueden** mantener sesiones distintas; si en el futuro se habilitan invitaciones, se debe usar el correo invitado y abrir el enlace en el navegador donde se inicie sesión. Sin formulario, botón de aceptación ni indicador falso de invitación válida. CSS responsive extendido y prueba de HTML accesible.
4. [`6a77140`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/6a77140d63f2d799305e01c79eb3100d14ad41e5): `scripts/verify-official-bundle.mjs` inspecciona el grafo real del bundle y **hace fallar el build** si el módulo candidato de token aparece accidentalmente en la PWA pública. Mantiene las protecciones existentes de datos falsos y claves.

### Seguridad

- `src/main.tsx` conserva `scrubInviteLocation(...history.replaceState)` síncrono antes del render; `App.tsx` conserva redacción al ingresar por `hashchange`/`popstate`, y vista de invitación informativa, sin token en React.
- **El candidato no está conectado** a `App`, `main`, `RealAccess`, `bt-mechanic-accept` ni la PWA. El token se **descarta**, no se guarda en memoria para una aceptación real.
- Sin cambiar roles, registro, habilitación de email o planes; no se crearon usuarios ni se enviaron invitaciones.
- Un futuro flujo deberá gestionar Auth confirmado/reanudación de sesión, destrucción en logout, cierre de pestaña y revocación, sin enviar el token a analytics/logs; repetir pruebas en Safari iPhone físico antes de activar.

### CI y verificación

- [Verificación web/PWA + Android #43716531589](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43716531589): **SUCCESS**, **398/398 Vitest PASS (42 archivos)**, TypeScript, build PWA, análisis del grafo que excluye el handoff, React Native/Expo compilado sin APK. [Ejecución previa sin guard extra #43716393597](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43716393597): **SUCCESS**.
- [UI pública #43716393594](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43716393594): **SUCCESS**, verificación de exclusión de fixtures y vista pública de la pantalla antes del guard final.
- Pruebas backend R2-A6-6 de PostgreSQL 17 efímero y CI Deno permanecen intactas de checkpoints anteriores. No se repitió integración SQL porque no cambió ningún módulo de servidor.

### Infraestructura alojada

Supabase `suxcqqnmcjoezfxltoms` solo se consultó en modo lectura: **2 talleres, 4 usuarios Auth, 4 membresías, 0 tablas `bt_private`**; la única función Edge activa sigue siendo `bt-owner-onboarding`. No se desplegaron RPC, claves, workers ni aceptaciones reales. Render puede desplegar automáticamente desde `main`, **pero la disponibilidad del commit en el servicio Render no fue verificada aquí**. Ninguna prueba física en iPhone realizada durante este bloque.

### Puerta siguiente

Preparar contratos de UX para sesión Auth real/reanudar la invitación sin persistencia ni elevar permisos, y pruebas de enlace + logout en Safari/iPhone; la **activación completa** exige aprobación específica de dominio/remitente Resend, migraciones Supabase alojadas, secretos solo backend, funciones Edge protegidas y prueba controlada de correo. No entregar un supuesto sistema operativo antes de eso.
