# CHECKPOINT — BT-OFICIAL-01A — 14/11/2026

## Resultado y autorización

**Interfaz pública de preparación, publicada y verificada. No habilita operación con datos reales.** El Director aprobó BT-QA-02 y autorizó 01A: retirar datos ficticios de la cara pública, conservar R2/cinco paneles y preservar los motores y sus pruebas. Acceso seguro, guardado permanente y toda creación/edición siguen deshabilitados con aviso visible.

Base real consultada antes de modificar: **`3f0af07aef091dd9e181c5eccdeb984953edea06`**, `main`. Se leyeron AGENTS, README, roadmap, contrato de transición, checkpoint QA-02 y documentos de arquitectura Auth/RLS, configuración multitenant, R2 y BT-COM-01. Un solo agente activo; sin modificaciones concurrentes observadas. Remote main revalidado antes de integrar, sin force push, ramas ni nuevos servicios.

No se modificaron Supabase, Auth/RLS, BT-CP02-D, onboarding, credenciales, correo, firma, pagos/suscripciones operativos ni Android nativo. **01B y BT-CP02-D no iniciados.**

## Interfaz entregada

- **Inicio:** cuatro indicadores calculados sobre el estado vacío, sin actividades, vehículos ni trabajos inventados; ingreso deshabilitado, continuar trabajos vacío y siete etapas informativas del expediente.
- **Clientes y vehículos:** directorio, vehículos, historial y observaciones vacíos, sin nombres, contactos ni patentes precargadas. Nuevo cliente deshabilitado.
- **Órdenes:** sin OT de ejemplo, estados vacíos y creación deshabilitada.
- **Informes:** sin documentos ni envíos de muestra; nueva cotización/informe deshabilitados, vista previa sin documento ficticio. Multipunto, cálculo de IVA, revisiones, realizados e impresión A4 se conservan en los módulos originales y se verifican en el harness.
- **Configuración:** nueve áreas sin configurar/disponibles aún, cero usuarios habilitados, sin perfil de taller de muestra, respaldos activos, porcentaje de capacidad o suscripción aparente. Servicios «No habilitado», «No configurado» o «Sin datos».
- **Identidad:** ByteTorque, sin cuenta ficticia ni taller predeterminado; BIOMOTORS no se asigna como identidad genérica. Manifiesto PWA corregido desde el nombre antiguo TallerFlow a ByteTorque, colores navy/azul R2 en SVG/PNG generados. Sin cambio de la URL Render ni del cliente Android.

El hero automotriz decorativo R2 se conserva: no representa un vehículo registrado del taller. Sidebar, topbar, cinco destinos, tarjetas, tipografía, paleta y safe-area existentes se mantienen mediante **AppShell compartido**.

Todas las páginas muestran: **«Estamos preparando el acceso seguro y el guardado permanente. Por ahora no ingreses datos de clientes ni vehículos reales».** Botones inactivos sin manejadores de creación, con explicación/aria-describedby; no hay formularios ni campos personales habilitados. El buscador público también está inactivo; navegación y lectura de vacíos disponibles.

## Frontera pública / pruebas

[Inventario ruta → fuente → cambio → riesgo y operaciones bloqueadas](../BT_OFICIAL_01A_INVENTARIO_20261114.md).

- Registros y perfiles extraídos a `tests/fixtures/records.ts`; métricas históricas a `tests/fixtures/dashboard.ts`. Funciones y validaciones de dominio continúan en `src/`.
- La fuente por defecto `src/data/emptyTestRecords.ts` no contiene registros y no fabrica un taller de muestra. `officialWorkspace` es vacío e inmutable, sin actor, tenant, API ni repositorio de escritura.
- Inyección explícita **solo en infraestructura de pruebas**: `vitest.config.ts` y `vite.harness.config.ts` resuelven `#test-records` al módulo de fixtures. Sin query params, roles React, localStorage o bandera manipulable que active ejemplos en público.
- `tests/harness/WorkflowApp.tsx` conserva el flujo A–E y pantallas operativas, reutilizando AppShell y motores actuales. Servidor ligado a **127.0.0.1:5177**, solo para QA controlado y datos ficticios; no es otro studio ni servicio Render.
- La entrada pública importa únicamente AppShell y adaptadores de estados vacíos. El build inspecciona el grafo, rechaza módulos privados y comprueba que no se empaqueten IDs, contactos o branding de prueba. Inventario final: nueve módulos de aplicación/estilos, ninguno de fixtures ni sesiones de negocio.
- Las carpetas tests/docs/scripts responden **403** en el servidor Vite público. La salida compilada no incluye esas carpetas. Rutas/flags de prueba no activan formularios ni registros en la web publicada.
- Service worker existente revisado: no tiene fetch/cache de datos o fixtures. No se incorporó almacenamiento privado ni hubo datos reales que migrar/borrar.

La separación de presentación **no acredita seguridad multitenant ni RLS real**. Esos controles continúan reservados para otra autorización.

## Commits

1. **`7f1ba6f`** — frontera pública/fixtures, AppShell común, cinco paneles vacíos, identidad PWA y preservación de modelos/harness. Es un cambio atómico de la entrada y fuentes para evitar publicar estados intermedios con simulaciones disfrazadas de operación.
2. **`d4ebbe0`** — recorrido público en cinco tamaños, exclusión de fixtures/branding y workflow de CI separado de las regresiones privadas.
3. **`24f38bd`** — comprobar rutas mediante fetch del navegador; evita depender de la resolución DNS del cliente HTTP de Node al probar Render desde este entorno.
4. Commit documental posterior — inventario, roadmap, README, capturas/resultados y este checkpoint; identificable en `git log` de main.

## Pruebas ejecutadas

| Comprobación | Resultado |
|---|---|
| TypeScript | PASS, incluye harness/configuraciones/fixtures |
| Vitest | **111/111 PASS en 17 archivos**: 103 anteriores conservadas + 8 verificaciones públicas |
| Build Vite/PWA | PASS; manifiesto, iconos y auditoría de bundle PASS |
| Público: 1650/1440/768/390/375 | **PASS los cinco paneles en los cinco tamaños**, sin overflow ni formularios/campos personales habilitados |
| Exclusión de datos / rutas | Sin nombres, OT-1001…1008, patentes, contactos, perfiles o DEMO en presentación; sin fixture payload en JS; flags/URLs de test no activan ejemplos |
| Red/almacenamiento público | 0 requests distintos de GET/HEAD; 0 Storage.setItem/IndexedDB.open, localStorage/sessionStorage vacíos, 0 errores de página |
| Harness: flujo B/C | PASS en cinco tamaños: recepción, recurrencia, solicitudes, ID/OT idempotente, borrador, navegación y recarga |
| Harness: flujo D/E | PASS en cinco tamaños: respuesta por revisión, rechazo/cambios, caducidad, precarga sin duplicar, realizados/pendientes, pausas, cancelación y entrega |
| Harness: QA-02 | PASS en cinco tamaños: ingreso nuevo a entrega, cotización compacta 4/8/12/vacía, edición, foco y pendientes |
| Harness: BT-INS-01 / BT-COT-01 | PASS en cinco tamaños: controles, validaciones, borradores, revisión, IVA, performed y vista previa/impresión |
| Harness: cinco paneles | Órdenes/Clientes/Informes/Configuración PASS en cinco tamaños; Inicio incluido en los flujos completos |
| Harness: BT-REG-02 | PASS en 1650/390 |
| PDF A4 | Cuatro trabajos: 1 página; contenido largo: 2 páginas con texto; ningún folio vacío (Chromium/emulación Android) |

Durante el cambio de configuración/formato, la recarga de Vite interrumpió dos recorridos privados; se repitieron QA-02 y Clientes sobre el árbol estable y finalizaron PASS. No se redujeron validaciones ni se eliminaron casos. Los tests históricos de App/dashboard solo cambian su import al harness/fixture correspondiente.

Build público: **242,63 kB JS / 75,64 kB gzip**, 59,79 kB CSS / 13,19 kB gzip; no incluye editores ni registros de prueba. Son módulos preservados para reconexión posterior, no eliminados.

## Archivos principales

- Público: `src/App.tsx`, `src/layout/AppShell.tsx`, `src/official/{OfficialPanels.tsx,officialWorkspace.ts,official.css,official.test.tsx}`.
- Fuente vacía: `src/data/emptyTestRecords.ts`; solo inicialización de datos en `clientesData`, `registroVisitaData`, `ordenesData`, `detalleData`, `documentosData`, `settingsData`. Motores/validadores y reglas operativas conservados.
- Pruebas: `tests/fixtures/*`, `tests/harness/*`, import de `src/App.test.tsx` y `src/demo/dashboard.test.ts`, `vitest.config.ts`, `vite.harness.config.ts`, `tsconfig.json`.
- Entrega: `vite.config.ts`, `package.json`, `scripts/verify-official-bundle.mjs`, `verify-official-ui.cjs`, puertos de regresión y workflows bt-flow/bt-cot/bt-reg/bt-oficial.
- PWA: `public/manifest.webmanifest`, `public/icon.svg`, `scripts/generate-pwa-icons.mjs`. Los tres PNG generados que ya estaban sin seguimiento quedaron excluidos de commits; prebuild los genera.
- Documentación: inventario, README, roadmap, checkpoint, capturas y evidencias de esta etapa. Capturas históricas BT-INS generadas por las regresiones fueron restauradas, sin sobrescribirlas.

## Capturas reales antes/después

Antes: harness local del flujo previamente aprobado, con datos ficticios explícitos. Después: Render a 1650/390; 375 del mismo build público local.

| Panel | Escritorio publicado | Móvil publicado | Antes móvil |
|---|---|---|---|
| Inicio | [1650](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_1_1650.png) | [390](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_1_390.png) | [Antes](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_ANTES_1_390.png) |
| Órdenes | [1650](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_2_1650.png) | [390](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_2_390.png) | [Antes](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_ANTES_2_390.png) |
| Clientes y vehículos | [1650](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_3_1650.png) | [390](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_3_390.png) | [Antes](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_ANTES_3_390.png) |
| Informes | [1650](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_4_1650.png) | [390](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_4_390.png) | [Antes](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_ANTES_4_390.png) |
| Configuración | [1650](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_5_1650.png) | [390](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_5_390.png) | [Antes](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_ANTES_5_390.png) |

También están versionados los cinco «antes» de escritorio y [Inicio 375](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_1_375.png) / [Configuración 375](../screenshots/BT_OFICIAL_01A/BT_OFICIAL_01A_5_375.png).

[Evidencia pública local](../qa/BT_OFICIAL_01A_EVIDENCIA/publico-cinco-tamanos.json) · [Render](../qa/BT_OFICIAL_01A_EVIDENCIA/publico-render.json) · [Grafo de módulos](../qa/BT_OFICIAL_01A_EVIDENCIA/public-modules.json).

## Publicación comprobada

Mismo [Render existente](https://biomotors-taller-demo.onrender.com), sin otro dominio o servicio. HTML, JS, CSS y manifiesto comparados **byte a byte** con dist aprobado:

- JS `index-MyD8FwyC.js`: SHA-256 `e2b4678128eb15c77d2d5f247ea532a9502a57466e0de7b803fd4d2295caf5a2`.
- CSS `index-D2pbOLBz.css`: SHA-256 `5aa5b06e91c75714b873a720751a2058a823e6ff4be17a7130c48b6199990d81`.
- Recorrido público en Render **1650/390 PASS**, incluidos cinco paneles, ausencia de entradas, vacíos, navegación/recarga y flags/rutas sin fixtures.
- Chromium remoto usa `ignoreHTTPSErrors` solo en el contexto de prueba por la CA del proxy del entorno. Comparación curl/Python conserva validación TLS; no se cambia aplicación/despliegue. El primer cliente HTTP Node no resolvió el dominio del proxy; el recorrido definitivo usa la red del navegador y pasa.
- Actions remoto **no confirmado desde este entorno**: `gh run list` devuelve Forbidden. No se atribuye SUCCESS remoto a las pruebas locales. Workflows públicos/privados quedan actualizados para CI.

Publicación realizada mediante el procedimiento de QA expresamente autorizado en la orden actual del Director. Se advirtió que Render dejaría de ofrecer la demostración operativa; esa capacidad se preserva solo en el harness privado. El commit documental posterior no cambia los bundles.

## Funcionalidades deshabilitadas y punto de parada

Altas/edición de clientes y vehículos, recepción, OT, inspecciones, propuestas, respuestas, ejecución, documentos/impresión de clientes y entrega; configuración de perfil/logo/usuarios/permisos/preferencias, enlaces, correo, respaldos y planes. Solo navegación y lectura del estado de preparación disponibles.

Pendientes: **revisión visual del Director y pruebas físicas Safari/iPhone**. El dominio con `-demo` sigue siendo el existente, no un dominio comercial propio. Esta interfaz no equivale a SaaS operativo ni certificación de seguridad real.

**Detenerse al completar 01A. No iniciar BT-OFICIAL-01B, BT-CP02-D, BT-COM-01 ni backend.**
