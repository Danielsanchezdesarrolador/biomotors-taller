# ByteTorque — R2-A6-10 · Safari, WebKit y puerta de activación de invitaciones

**Fecha:** 15/11/2026. **Estado:** preparación técnica y pruebas automatizadas APROBADAS; validación física de Safari/iPhone PENDIENTE; activación pública NO AUTORIZADA.

## Alcance realmente verificado

- `main` partió de `a16e8a35678002c69886f137f86d4752a3419f6e` y recibió la corrección incremental `521f83d8453be9f55e07a259a7454bd872932b1f`.
- El adaptador aislado `inviteBrowserLifecycleCandidate.ts` ahora invalida el token durante `attach()` si el documento **ya está oculto**, incluso cuando Safari no emite un `visibilitychange` posterior; también revalida visibilidad en `pageshow` no persistido. `pageshow.persisted` continúa invalidando por BFCache. Dos tests sintéticos nuevos cubren esas carreras.
- `scripts/verify-r2-invite-ui.cjs` permite ejecutar el mismo contrato de navegación con Chromium y con WebKit. El CI web público usa **WebKit en Linux** (Playwright) a 375, 390, 768 y 1440 px: limpieza del fragmento, reload, back/forward, regreso al login, ausencia de Storage/IndexedDB, de POST/HTTP Auth/Resend y de formulario de aceptación. El token usado es **ficticio**.
- `bt-oficial-01.yml` instala WebKit y conserva Chromium, capturas y un artefacto propio `artifacts/bt-r2-a10-webkit/`. La suite WebKit **NO equivale** a Safari de un iPhone real ni comprueba instalación de PWA en iOS.
- [CI principal #43724776112](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43724776112): SUCCESS; **44 archivos y 443/443 Vitest**, TypeScript, build PWA, controles de bundle y Android Expo (sin APK).
- [CI interfaz/Chromium/WebKit #43724776108](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43724776108): SUCCESS; paso WebKit específico SUCCESS, además de regresiones existentes.
- NO se ejecutó una prueba física de Safari, ni una aceptación real, ni una nueva migración PostgreSQL, ni un envío Resend, ni un despliegue Edge.

## Contrato futuro revisado — no conectado

1. **Enlace:** únicamente `/#/auth/aceptar-invitacion?token=<64 hex minúsculas>`. El secreto está en el fragmento `#`, nunca en `?token=` de la solicitud HTTP. Rechazar y limpiar enlaces profundos o query HTTP. La página pública actual descarta todos los tokens.
2. **Handoff de laboratorio:** `inviteHandoffCandidate.ts` limpia la URL antes de conservar el secreto, mantiene memoria de pestaña por un máximo de cinco minutos y solo permite consumo único. `inviteBrowserLifecycleCandidate.ts` lo elimina al salir, pasar a segundo plano, desconectarse, desmontar o cambiar de sesión. No usa Storage ni comparte tokens entre Safari y una PWA instalada.
3. **Identidad Auth:** `inviteSessionCandidate.ts` consulta `getUser()` verificado, exige cuenta confirmada, rechaza cambio de principal/errores y repite la verificación antes de entregar token. Esta comprobación del navegador es UX, **no concede membresía**.
4. **Servidor futuro:** el endpoint deberá verificar otra vez identidad y correo confirmado con Auth. `mechanicInviteAcceptCandidate.ts` recibe exclusivamente `{token}` y entrega a RPC service-only **SHA-256 de los 32 bytes** más identidad verificada por backend. SQL debe decidir correo destinatario, expiración, revocación, uso único, cupos, aislamiento, membresía y auditoría; respuesta `unknown` no se reintenta a ciegas.
5. **Estado real actual:** `bt-mechanic-invites` y `bt-mechanic-accept` terminan en 503 incluso si su flag se habilita; `bt-invite-worker` responde 503 incondicional. `supabase/config.toml` conserva `verify_jwt=true`. Las comprobaciones de R2-A6-9 registraban 2 talleres, 4 usuarios Auth, 4 membresías, 0 tablas privadas; **no se han vuelto a consultar estos conteos en este bloque**.

## Matriz de riesgos y puertas

| Riesgo / requisito | Evidencia disponible | Estado |
|---|---|---|
| Reaparición de secreto por history, hash, recarga | Chromium y WebKit Linux, enlaces sintéticos | Automática PASS; iPhone pendiente |
| Página oculta al montar/restaurar | 2 Vitest nuevos y eventos `pageshow` sintéticos | Laboratorio PASS; Safari real pendiente |
| BFCache de Safari iOS, app switching, PWA en inicio | `pagehide`, `visibilitychange` y `pageshow.persisted` simulados | **Bloqueo: prueba física** |
| Safari y PWA con contenedores de sesión distintos | Arquitectura memory-only, ninguna transferencia garantizada | Decidir recorrido de aceptación real solo tras ensayos iPhone |
| Query HTTP puede filtrarse a servidor/proxy/log | Rechazo de `?token` externo; test loopback únicamente | Mitigación en código; no usar enlaces reales así |
| Usuario no confirmado, logout, cuenta cambiada, refresh concurrente | Vitest del coordinador Auth, no conectado | Laboratorio PASS; backend real pendiente |
| Token vencido/revocado/reutilizado/correo ajeno/cupo/tenant | RPC con PostgreSQL 17 aislado de R2-A6-6 | Laboratorio PASS; SQL alojado NO aplicado |
| Envíos duplicados, revocación frente a worker, ACK incierto | P5/P6 en PostgreSQL aislado y Resend HTTP mock | Sin proveedor externo ni worker real |
| Control de privilegios, secretos, RLS multiempresa | Código candidato, pruebas SQL anteriores y guardia 503 | Revisión de desplegable y ensayo autorizado pendientes |
| Fugas de candidato al bundle público | `verify-official-bundle.mjs` en CI | PASS |

## Autorizaciones independientes que debe decidir el Director

**A. SQL y RLS:** autorizar expresamente migraciones privadas candidatas y RPC service-only en Supabase `suxcqqnmcjoezfxltoms`, previa revisión de permisos, idempotencia, seguridad y plan de reversión. No aplicar automáticamente ni eliminar datos preexistentes.

**B. Edge y secreto:** autorizar por separado la clave nominativa backend del worker, su almacenamiento/rotación y el despliegue controlado con `@supabase/server` autenticando realmente. `verify_jwt=false` solo podrá estudiarse para worker con el wrapper protector obligatorio; NO modificarlo de forma aislada.

**C. Resend:** autorizar cuenta, dominio/remitente verificados, secreto privado, cuota y **un único envío de prueba a una dirección propia aprobada**. Un test HTTP simulado no da permiso para correo real.

**D. Piloto limitado:** después de A–C y resultados reales de Safari, autorizar por separado un conjunto mínimo de invitaciones a cuentas de prueba, monitorizar auditoría, denegaciones, reintentos y rollback. **No abrir a clientes públicos por defecto.**

**E. Cobros/trial:** fuera de alcance; sin pagos ni renovaciones reales.

**Rollback:** conservar flags desactivados y endpoints 503 hasta aprobación; si falla un ensayo, detener worker/envíos, volver a 503, revocar invitaciones pendientes y evaluar datos/colas con auditoría antes de revertir SQL. Nunca eliminar tablas con registros potenciales sin revisión separada.

## Prueba física pendiente y siguiente acción

Ejecutar en un **iPhone real** la guía [BT_AUTH_R2_A6_9_SAFARI_QA.md](BT_AUTH_R2_A6_9_SAFARI_QA.md), con el enlace ficticio y sin datos personales: Safari normal, PWA instalada si existe, reload, back/forward, segundo plano, cierre/reapertura y orientación. Registrar versión iOS, resultado por paso y capturas sin tokens reales. El contrato experimental de memoria no es observable en el sitio público, que permanece informativo.

**Siguiente puerta real:** validar Safari físico, evaluar resultados y solicitar aprobaciones A–D individualmente; mientras tanto pueden continuar otras tareas no sensibles del roadmap sin desbloquear invitaciones.
