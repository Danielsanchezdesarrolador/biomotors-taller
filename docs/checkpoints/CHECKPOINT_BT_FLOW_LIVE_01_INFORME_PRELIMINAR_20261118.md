# ByteTorque — Checkpoint BT-FLOW-LIVE-01 · Informe técnico preliminar por revisión CP05

**Fecha:** 18/11/2026 · **Única rama:** `main` · **Proyecto:** `Danielsanchezdesarrolador/biomotors-taller`.  
**Base:** `9ba64bd6edfc9cb07ed280cc75ef36d3be181810` (CP06 integrado).  
**Último commit de código de esta etapa probado por CI:** `f7c057b2ee2c1c5b719d85630fa01d5764150569`.  
**CI real:** [Verificación ByteTorque #44332804176](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44332804176) **SUCCESS** Web/iOS PWA y Android React Native/Expo. **663/663 Vitest, 76/76 archivos; 14/14 casos nuevos.**

## Prioridad y alcance

El titular decidió volver al cierre funcional del flujo del taller de Ignacio **CP03 → CP04 → CP05 → CP06 → ejecución → entrega**, sin abrir nuevas auditorías generales. **BT-PILOT-QA-04 se conserva como «A REPASAR»** al cierre con seguridad. La integración real persistente de trabajos ejecutados y entrega todavía no existe: `src/flow/flowClosure.ts` y `FlowDeliveryPanel.tsx` son solamente DEMO en memoria, sin Supabase.

Esta etapa implementa **un borrador interno de informe técnico** generado desde el **snapshot histórico emitido CP05**, no desde el editor de cotización actual ni desde datos DEMO. Permite al operador marcar explícitamente cada línea como `performed` o `not_performed`, ingresar explicación de pendientes, confirmar revisión de los valores y descargar PDF A4 preliminar. Si no existe una revisión emitida, este nuevo bloque no aparece en el editor privado. **No se presenta como trabajo ejecutado confirmado, aprobación del cliente ni entrega.**

## Archivos y función

- `src/entrega/executionPreview.ts`: contrato/función pura. Compara identificadores de taller, cliente, OT, vehículo, cotización y número de revisión del snapshot contra la cotización actualmente emitida. Rechaza partidas repetidas, alteración de importes, ids desconocidos y tota­les inconsistentes. Todas las partidas comienzan `unreviewed`; ninguna se deduce realizada de la cotización. Cálculo neto/IVA 19 %/total a partir de `line_net` congelado para los ítems marcados `performed`. Separa cotizado/seleccionado y diferencia. Bloquea la exportación sin revisión de todas las partidas, explicación válida de pendientes o confirmación del operador.
- `src/entrega/WorkExecutionDraft.tsx`: selector táctil de realizado/no realizado para revisión privada CP05, recuentos y montos claramente diferenciados. Cambios locales efímeros, sin almacenamiento del navegador ni escritura a Supabase. Descarga del informe solo al cumplir requisitos; estados de ocupación y errores, sin falsos mensajes de éxito. `src/entrega/execution.css` conserva colores/tarjetas R2 y disposición responsive.
- `src/entrega/executionPdf.ts`: PDF A4 de borrador, logo ByteTorque, datos históricos de taller/cliente/vehículo/OT/revisión, listado de partidas revisadas, comparación financiera, explicación de no realizados y avisos repetidos **BORRADOR INTERNO · SIN GUARDAR**, sin firma ni documento tributario. Pagina hasta 200 líneas; utiliza recursos oficiales PDF ya existentes y `downloadPdf` de CP05; no sube ni emite archivo.
- `src/cp05/QuotePanel.tsx`: incorpora acceso a «Preparar informe técnico preliminar (sin guardar)» únicamente para rol con escritura y **última revisión realmente emitida**, cuando la cotización actualmente está `issued`. No introduce datos DEMO ni simula aceptación.
- `src/entrega/executionPreview.test.tsx`: 14 casos de no marcar trabajo automáticamente, revisar estados, cálculo CLP/IVA, 0 trabajos, nota requerida, confirmación humana, aislamiento de identidades/snapshot, líneas manipuladas, revocación de estado emitido, PDF auténtico A4, texto borrador y 200 líneas paginadas con datos sintéticos. No se generaron documentos con datos reales.
- `vite.config.ts` y `scripts/verify-official-bundle.mjs`: los nuevos módulos `src/entrega/` están permitidos **solo cuando `VITE_BT_CP05_PRIVATE_ENABLED=true`**. Las pruebas de empaquetado con flags OFF, BUILD público y otros paquetes privados se preservan. No se habilitó el flag en Render.
- `roadmap.md`: anota avance, barrera de seguridad y siguiente fase.

## Verificación y correcciones

GitHub Actions Web/PWA y Android en la ejecución **#44332804176** resultaron **SUCCESS**. Web: **663/663 Vitest** en **76 archivos**, nuevos 14/14, TypeScript y builds Web/PWA y módulos privados incluido CP05/CP06. Android: TypeScript/Metro/contratos candidatos, **sin generar APK**. El PDF fue probado estructuralmente con `pdf-lib` (encabezado PDF, formato A4, paginación); **NO hay inspección visual física del archivo en navegador o iPhone aún**, ni se ha generado/adjuntado PDF de Ignacio.

La primera corrida falló por una prueba que requería aviso literal `SIN GUARDAR`; se corrigió. Una corrida siguiente pasó tests pero rechazó el nuevo módulo en la lista de permisos de bundling privado; se actualizó el allowlist condicionado a CP05 y se repitió CI hasta SUCCESS. Las corridas fallidas no se presentan como éxito.

## Estado alojado — no modificado

- Ninguna migración SQL/Storage/Edge, cambio Auth/RLS/taller/rol, cliente real, archivo privado ni correo. No se alteraron cotizaciones/OT almacenadas ni el proyecto Supabase.
- No hubo deploy intencional a Render, ni cambio en `https://bytetorque.cl`; todos los commits de código marcados `[skip render]`. No se afirma que la nueva función esté disponible ya en el sitio.
- CP05 sólo tiene borradores de cotización privados alojados y PDF R3 de borrador; **emisión archivada/descarga histórica y proveedor correo siguen OFF**. La nueva revisión técnica requiere precisamente la primera revisión CP05 realmente emitida, por lo que su uso en servidor alojado sigue bloqueado.
- `BT-PILOT-QA-04: A REPASAR` al final, junto con prueba integral de seguridad y aislamiento. Sin clientes personales reales, facturas, cobros ni autorización de entrega; pruebas técnicas offline no sustituyen seguridad real.

## Próximo bloque funcional

**BT-FLOW-LIVE-02 — Registro persistente de trabajos realizados y constancia de entrega, candidato.** Reutilizar CP03/CP04/CP05/CP06; modelar eventos explícitos con `workshop_id`, `order_id`, `quote_id + revision`, partida e importe realizado, aprobado por operador, notas de pendientes, estados de cierre/entrega y trazabilidad. Diseñar contrato aditivo SQL/RLS y tests sintéticos de talleres A/B, rechazo/versión revocada, importes cotizados vs trabajos y bloqueo de entregas sin evidencia. Preparar código y UX sin instalar SQL ni activar Storage/correos/Edge reales hasta respaldo integral restaurable y autorización específica. No reutilizar las autorizaciones DEMO ni afirmar trabajos realizados por una X o una cotización.

Después: integrar PDF técnico y constancia de entrega con un solo paquete de documentación final, revisión por cliente y correo consolidado BT-COM-01 solamente tras permisos y pruebas. Conservar una sola `main`, diseño R2 y checkpoint tras tarea sustantiva.
