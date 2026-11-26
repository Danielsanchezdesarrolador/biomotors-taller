# BT-FLOW-NEXT-01 — candidato local para revisión

Fecha 25/11/2026, Chile. Base `5e9b6195ddc7a5905d68c76a1553055daa2422f2`. Rama local main.

## Implementación

El recorrido se abre como espacio de trabajo dentro del shell Premium R2. El control de avance presenta cliente, vehículo, OT, estado, etapas confirmadas y pendientes y Continuar atención. La lista permite retomar otras OT con lectura de servidor. Cada módulo conserva su propia instancia por OT y etapa.

La hoja completa existente de 34 componentes se presenta fuera del diálogo superpuesto. Para finalizar se requieren las casillas y las observaciones guardadas. El editor completo de cotización conserva partidas, importes, IVA, condiciones, revisiones y documentos.

Las acciones principales utilizan los guardados existentes y consultan los registros antes de cambiar de etapa. Las confirmaciones de aprobación, ejecución y entrega conservan sus guardas. Cerrar atención sale del espacio una vez confirmado el expediente, usando los contratos existentes.

La proyección central considera solicitudes anticipadas. Prioriza emisión y aprobación antes de remitir a Agenda para registrar la recepción física. Después de recibir utiliza la misma OT y cotización. Una inspección posterior a la emisión requiere nueva revisión y autorización. El cambio de resolución de un hallazgo resuelto utiliza la fecha de creación para evitar invalidar por sí solo una aprobación previa.

## Archivos

- `src/App.tsx` integra el espacio de trabajo y el regreso a Agenda.
- `src/guided/GuidedWorkspace.tsx`, `progress.ts` y `guided.css` implementan continuidad y presentación.
- `src/guided/progress.test.ts` cubre revisión vigente, atención anticipada e independencia de OT.
- `tests/harness/GuidedFixture.tsx` aporta una inspección sintética completa.
- `scripts/verify-flow-next-browser.cjs` comprueba el nuevo flujo visual.

## Validación

- Vitest, 93 archivos y 832 pruebas PASS.
- Build público y build con todos los gates privados de este flujo, TypeScript y verificaciones PWA/bundle PASS. El build privado advierte sobre tamaño de chunks.
- Chromium a 1366 y 390 px, aprobación obligatoria, navegación tras confirmación, control de avance, inspección completa con cotización existente y rechazo de guardado conservando campos y confirmación de archivo sin duplicación PASS.
- La proyección de reanudación y atención anticipada fue comprobada con fixtures y pruebas unitarias. La validación alojada de la OT QA y la restauración de una sesión autenticada real quedan pendientes de la revisión del candidato.

Para repetir el navegador, iniciar `npm run dev:harness -- --port 47130 --strictPort` en loopback y ejecutar `node scripts/verify-flow-next-browser.cjs` con Playwright disponible. Los scripts históricos del diálogo usan selectores de la presentación anterior.

## Evidencia visual

[Control de avance escritorio](https://github.com/Danielsanchezdesarrolador/bytetorque-review/blob/3d9fd504eb1ce7a1724c42f460b1f212f0e4e80a/BT-FLOW-NEXT-01/candidato/docs/screenshots/bt-flow-next-01/avance-1366.png)

[Control de avance móvil](https://github.com/Danielsanchezdesarrolador/bytetorque-review/blob/3d9fd504eb1ce7a1724c42f460b1f212f0e4e80a/BT-FLOW-NEXT-01/candidato/docs/screenshots/bt-flow-next-01/avance-390.png)

[Inspección completa escritorio](https://github.com/Danielsanchezdesarrolador/bytetorque-review/blob/3d9fd504eb1ce7a1724c42f460b1f212f0e4e80a/BT-FLOW-NEXT-01/candidato/docs/screenshots/bt-flow-next-01/inspeccion-1366.png)

[Inspección completa móvil](https://github.com/Danielsanchezdesarrolador/bytetorque-review/blob/3d9fd504eb1ce7a1724c42f460b1f212f0e4e80a/BT-FLOW-NEXT-01/candidato/docs/screenshots/bt-flow-next-01/inspeccion-390.png)

[Ejecución móvil](https://github.com/Danielsanchezdesarrolador/bytetorque-review/blob/3d9fd504eb1ce7a1724c42f460b1f212f0e4e80a/BT-FLOW-NEXT-01/candidato/docs/screenshots/bt-flow-next-01/ejecucion-390.png)

## Alcance y pendientes

La recepción de Agenda continúa sujeta a la aprobación exigida por su backend, incluyendo reservas pendientes. La detección de cambios técnicos usa marcas temporales de hallazgos persistidos. Una edición de nota anterior a una resolución posterior no tiene una marca temporal independiente en el contrato actual y requiere revisión humana del presupuesto.

Los registros históricos con inspecciones parciales pueden aparecer como inspección pendiente bajo el nuevo requisito de 34 componentes. Revisar este comportamiento en la OT QA antes de publicar. La evidencia de navegador cubre aprobación y apertura de inspección con registros existentes. El circuito de emisión documental, ejecución, entrega y archivo completo conserva sus pruebas de componentes existentes y requiere aceptación integral posterior con servicios QA.

Publicación y despliegue pendientes de autorización. El propietario autoriza diferir el respaldo cifrado DB + Storage hasta finalizar este bloque. La vigencia del respaldo queda pendiente de actualización antes de otra intervención alojada que la requiera y antes del piloto real. Agenda QA activa según informe del propietario. Correo externo OFF, FLOW-UX-01-R2 pausado y Auto-Deploy OFF según las restricciones recibidas.


> Nota de integración 26/11/2026: documento histórico. El dictamen, restricciones vigentes y aceptación pendiente constan en [checkpoint de integración](CHECKPOINT_BT_FLOW_NEXT_01_INTEGRACION_20261126.md). Las capturas y logs de revisión se conservan en el repositorio privado, no se publican con el código.
