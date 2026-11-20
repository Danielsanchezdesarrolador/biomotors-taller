# ByteTorque — CHECKPOINT BT-PILOT-QA-04B: F01–F06 en navegador

**Fecha:** 20/11/2026 · **Única rama:** `main`. **Estado actual:** implementación candidata, QA visual pendiente de nueva ejecución tras corrección de selector. **No desplegada en Render ni conectada a datos reales.**

## Continuidad y alcance
Se leyeron `AGENTS.md`, `agent.md`, `roadmap.md`, el plan preactivación y checkpoint QA04A. Antes del desarrollo `main` apuntaba a `4da446c7` (cambio documental de seguridad); no se alteró trabajo de SEC-07. El propietario autorizó continuar la parte funcional sin afectar seguridad. No se realizaron nuevas exportaciones/restauraciones, cambios de GPG, SQL, RLS, Auth/Storage/Edge alojados, emails, pagos, APK u OTA.

## Código
- `tests/harness/cp04BrowserFixture.cjs`: amplía HTTP ficticio local de CP03/CP04. Simula fallo de GET después de POST/PATCH confirmado y POST rechazado; soporta clientes/vehículos sintéticos. Sigue sin realizar solicitudes reales a Supabase.
- `scripts/verify-pilot-qa04b.cjs`: seis casos F01–F06 en Chromium 390 y 1366px, usando la interfaz real y respuestas interceptadas. Comprueba ID conservado, borrador cerrado, confirmación, ausencia de duplicados y errores visibles. Salida de capturas/JSON en artifacts solo durante ejecución.
- `.github/workflows/bt-oficial-01.yml`: incluye paso Playwright QA04B reutilizando preview CP04 con variables privadas de CI y llave de prueba; no publica frontend.
- Commits `7a7f9808` (laboratorio inicial), `4502b1a1` (expresiones regex) y `fb6ce866` (selector exacto en formulario F02), todos `[skip render]`.

## Matriz de observación (no confundir con PASS alojado)
| Caso | Error simulado | Aserción |
|---|---|---|
| F01 | Cliente confirmado, falla GET vehículos | no se reabre alta; POST único y búsqueda sin POST |
| F02 | Vehículo confirmado, falla GET vinculados | vehículo seleccionado, formulario cerrado, POST único |
| F03 | OT confirmada, fallan lista y detalle | identidad/confirmación preservadas, refresco sin segundo POST |
| F04 | Hallazgo confirmado, falla GET hallazgos | se muestra hallazgo, no se duplica al recargar |
| F05 | Resolución confirmada, falla GET hallazgos | pendiente se elimina, PATCH único |
| F06 | POST de OT rechazado antes de acuse | sin falso éxito ni nueva fila en el simulador; borrador retenido |

## Evidencia e incidente
- CI general del commit `4502b1a1`: [44755442840](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44755442840) **SUCCESS** (Web/PWA + Android). No certifica pruebas de navegador.
- QA visual anterior: [44755442664](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44755442664) **FAIL** en F02 después de **F01 390 PASS**, tras pasar CP04 redesign. **Incidente QA04B-INC-01:** selector Playwright `getByLabel('Patente')` coincidía con el campo de búsqueda por nombre/teléfono/correo/patente y el campo de patente del editor. Causa comprobada: ambigüedad de selector, **no error de guardado funcional**. Solución: `p.locator('.cp03-editor').getByLabel('Patente', { exact: true })`, commit `fb6ce866`. Nueva prueba [44756351689](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44756351689): **PENDIENTE DE RESULTADO** al redactar.
- Se documentan solo ejecuciones auténticas: **NO** se acreditan todavía los 12 casos de navegador. R05–R08 (10+ pasos existentes dentro de los 55) siguen SIN_EJECUTAR en la planilla oficial.

## Puertas pendientes
1. Verificar QA visual F01–F06, corregir únicamente defectos demostrados e inscribir resultado efectivo.
2. Ejecutar R05–R08 completos DEMO sin reescribir matrices, además de QA físico R09/R10 según requisitos.
3. SEC-07 sigue separado: nuevo snapshot cifrado existe pero restauración integral requiere resolver `EXTENSION_UNAVAILABLE`; **piloto Ignacio permanece BLOQUEADO** hasta aprobación y validaciones reales diferenciadas.
