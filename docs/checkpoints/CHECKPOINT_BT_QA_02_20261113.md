# CHECKPOINT — BT-QA-02 — 13/11/2026

## Base, autorización y alcance

Orden del Director y `docs/BT_QA_02_ORDEN_CODEX.md` ejecutadas exclusivamente en DEMO. HEAD real de `main` consultado y actualizado antes de modificar: **`1a4c6ff3a6f094fc68c1c485f224f2d6a4361045`**. Se leyeron AGENTS, README, roadmap, matriz QA-01, orden QA-02, plan A–E, checkpoints A/B/C/D/E, R2 y BT-COM-01 como dependencia futura. Sin otros agentes activos ni cambios concurrentes observados; `origin/main` revalidado antes de integrar. Los tres iconos PWA generados ya estaban sin seguimiento y quedaron excluidos.

**No se reconstruyó el producto ni se inició BT-COM-01.** Sin cambios en Supabase, Auth/RLS, BT-CP02-D, onboarding, credenciales, planes/suscripciones, pagos, correos, firma ni Android nativo. Solo `main` y el Render existente.

## Correcciones entregadas

| Orden / hallazgo | Resultado |
|---|---|
| QA02-A / H004 | Cotización abierta desde expediente en móvil muestra primero todas las partidas compactas: descripción, tipo, cantidad, unitario y total CLP. Neto, IVA y total provienen de `workTotals`; cada importe de línea también utiliza el motor existente. «Ver detalle / Editar ítems» expande el editor canónico. 4/8/12 partidas, descripción larga, edición de cantidad y estado vacío comprobados. |
| QA02-B / H003 | Plantillas retiradas exclusivamente de propuesta guiada: botón, importaciones, estado y diálogo eliminados. Agregar/editar/eliminar permanecen; editor avanzado conserva sus plantillas con callback opcional de la tabla compartida. |
| QA02-C / H005 | «Opciones de visita» agrupa espera/cancelación. Estado, advertencia de pausa y «Resolver pausa» visibles con opciones cerradas. `aria-expanded`, `aria-controls`, teclado Enter/Escape, retorno de foco y controles de al menos 44px; motivos y confirmaciones existentes intactos. |
| QA02-D / H002 | «Finalizar inspección DEMO», icono de finalización, diálogo y CTA «Confirmar finalización DEMO», mensaje «No se enviará correo ni documento». Sin cambios al motor/validaciones del multipunto. |
| QA02-D / H001, H006 | Inicio anuncia A–E disponible solo en DEMO, memoria temporal y sin envíos. Estados internos traducidos únicamente en presentación. Corregido también el aviso antiguo «BT-FLOW-01E permanece bloqueado» en ejecución. |
| QA02-E / R005 | **No reproducido en las muestras automatizadas.** Cuatro trabajos con condiciones/comentarios: una página A4. Contenido técnico largo: dos páginas, ambas con texto. Se conservaron los estilos de impresión originales; no se forzó contenido legítimo a una sola página. |

La vista compacta es contextual a cotizaciones del expediente y `@media screen` móvil; el editor/tabla de escritorio y el modo informe siguen disponibles. Su apertura/expansión no cambia IDs, revisión, aprobación ni partidas. Los cinco paneles premium R2, registro, expedientes conectados, aceptación exacta por `quoteId + revision`, finalización del informe y entrega A–E se preservan.

## Commits controlados en main

1. **`aed3c05`** — resumen compacto contextual, acceso a editor completo y dos pruebas de renderizado/cálculo sin mutación; TypeScript y 103 Vitest PASS, navegador de 4/8/12 partidas a 1650/390/375 comprobado.
2. **`a472130`** — retirar plantilla guiada y agrupar opciones de visita; TypeScript/103 pruebas y recorrido nuevo ingreso → entrega a 390 PASS.
3. **`08cc9a7`** — textos de multipunto, estados y aviso desactualizado; adaptar selectores de regresión a nuevos nombres y apertura del editor compacto.
4. **`2529494`** — recorrido QA completo, investigación A4 reproducible, CI de navegador/PDF y retorno de foco tras confirmar espera/resolución.
5. Commit documental posterior — README/roadmap, resolución de matriz QA, capturas, PDF/resultados y este checkpoint; identificable mediante `git log` en main.

## Archivos de aplicación

- `src/App.tsx`: marca contextual en la navegación guiada a cotización.
- `src/informes/trabajos/trabajosData.ts`: opción de presentación en `WorkRequest`; sin cambio de cálculo o modelo de documentos.
- `src/informes/trabajos/WorkQuoteSummary.tsx`, `WorkQuoteSummary.test.tsx`: lectura compacta del mismo documento y dos pruebas adicionales.
- `src/informes/trabajos/WorkDocumentPanel.tsx`, `trabajos.css`: expansión contextual del editor, foco y CSS móvil; raíz de impresión y documento profesional preservados.
- `src/informes/trabajos/WorkItemsEditor.tsx`: `onTemplate` opcional.
- `src/flow/FlowProposalPanel.tsx`: eliminar plantilla guiada y residuos.
- `src/flow/FlowDeliveryPanel.tsx`, `flow.css`: opciones de visita, foco y accesibilidad; dominio de pausas/cierre sin cambios.
- `src/flow/FlowHome.tsx`, `FlowCasePanel.tsx`, `FlowQuotePanels.tsx`: textos/estados de presentación.
- `src/informes/multipunto/InformeMultipuntoPanel.tsx`: icono y textos de finalización exclusivamente DEMO.

Verificación: `scripts/verify-qa02-ui.cjs`, `verify-qa02-print.cjs`, `analyze-qa02-pdfs.py`; ajustes de selectores en `verify-flow-ui.cjs`, `verify-flow-d-ui.cjs`, `verify-multipunto-ui.cjs`; `.github/workflows/bt-flow-01.yml` conserva comprobaciones previas y agrega QA-02/PDF. Poppler solo es una dependencia del análisis de pruebas, no de la aplicación.

## Pruebas ejecutadas

| Comprobación | Resultado |
|---|---|
| Base antes de cambios | 101/101 Vitest PASS |
| `npm run typecheck` | PASS |
| `npm test` final | **103/103 PASS, 16 archivos**; 101 originales preservadas |
| `npm run build` y verificación PWA | PASS |
| QA-02 1650 / 1440 / 768 / 390 / 375 | **PASS en los cinco tamaños** |
| Regresión BT-FLOW-01B/C mismos cinco tamaños | PASS: recepción, recurrencia, solicitudes, OT idempotente, contexto/IDs, borradores/recarga, refinamientos móviles C-R1 |
| Regresión BT-FLOW-01D/E mismos cinco tamaños | PASS: rechazo/cambios, aprobación por revisión, caducidad, precarga sin duplicación, realizados, espera/resolución, entrega, cierre desactualizado y cancelación |
| BT-INS-01 mismos cinco tamaños | PASS: 34 controles, teclado, pendientes, borradores/fotos, finalización e impresión |
| BT-COT-01 mismos cinco tamaños | PASS: cálculos, edición, plantillas avanzadas, invalidación, modo informe, realizados e impresión |
| Órdenes / Clientes / Informes / Configuración, mismos cinco tamaños | PASS; Inicio validado también por los recorridos de flujo |
| BT-REG-02 1650 / 390 | PASS: formulario, solicitudes y descarte al recargar |
| QA-02 foco/estado vacío, prueba adicional 390 | PASS: regresar foco a Opciones, eliminar partidas, mostrar $0 y agregar otra; edición posterior a entrega deja cierre desactualizado |
| Instrumentación de recorrido QA | Cero requests distintos de GET/HEAD; cero `Storage.setItem`/`indexedDB.open`; localStorage/sessionStorage vacíos y cero errores de página |

El recorrido QA nuevo registra cliente/vehículo ficticios, recibe visita, confirma OT, finaliza multipunto reconociendo pendientes, define cuatro partidas, revisa la misma cotización con 4/8/12, edita cantidad/condiciones, reconfirma propuesta y registra aceptación de su revisión exacta. Precarga 12 ítems sin realizar; marca expresamente solo 4, imprime/suma esos 4 (**$13.090 CLP**) y deja 8 pendientes. Registra espera, verifica bloqueo, resuelve y entrega DEMO con explicación de pendientes/checklist/confirmación. Retorno por cinco paneles y recarga comprobados.

El build emite aviso de tamaño del chunk principal **500,60 kB minificado / 140,33 kB gzip**; compilación y PWA pasan. No se cambió la estrategia de bundles, ajena al ajuste UX aprobado.

## Impresión R005 y límites de la investigación

`scripts/verify-qa02-print.cjs` genera seis PDF del editor clásico con cuatro trabajos realizados: muestras cortas y contenido largo a 1650, 390 y 375. Los dos tamaños móviles usan emulación Android/Chromium con tacto y user-agent móvil; **no un Android físico**. `python3 scripts/analyze-qa02-pdfs.py` comprueba papel A4, conteo y texto por cada página:

- Muestras cortas: **1 página**, 2039 caracteres; ningún folio vacío.
- Muestras largas: **2 páginas**, 4525 y 3980 caracteres; contenido legítimo conservado, ningún folio vacío.
- Antes del cambio, los tres PDF equivalentes de cuatro partidas también tenían una sola página A4. Se generaron imágenes reales antes/después desde los PDF.
- El recorrido guiado, además, imprime únicamente 4 de 12 partidas realizadas; las 8 pendientes quedan excluidas de tabla y cobro.

Por tanto, R005 se registra como **investigado/no reproducido en estas muestras**, no como un defecto físico de Android corregido. Queda verificar el visor/servicio de impresión del teléfono del Director y Safari físico. No se modificó ningún `@media print` ni `@page`.

[Resultados A4 por archivo y página](../qa/BT_QA_02_EVIDENCIA/results.json) · [PDF cuatro trabajos](../qa/BT_QA_02_EVIDENCIA/BT_QA_02_A4_4_390.pdf) · [PDF largo legítimo](../qa/BT_QA_02_EVIDENCIA/BT_QA_02_A4_LARGO_390.pdf).

## Capturas y resultados

Capturas reales de escritorio y móvil versionadas en `docs/screenshots/BT_QA_02/`: antes/después de cotización, opciones y multipunto; lista de 4/8/12, vacío, pausa y entrega. Los datos son ficticios; no se copiaron datos ni capturas personales del Director. Antes y después usan muestras de cuatro partidas diferentes para comprobar composición, no una comparación de precios entre documentos.

- [Antes — cotización 390](../screenshots/BT_QA_02/BT_QA_02_ANTES_COTIZACION_390.png).
- [Después — compacta 390](../screenshots/BT_QA_02/BT_QA_02_COTIZACION_4_390.png), [375](../screenshots/BT_QA_02/BT_QA_02_COTIZACION_4_375.png), [escritorio 1650](../screenshots/BT_QA_02/BT_QA_02_COTIZACION_4_1650.png).
- [Doce partidas 390](../screenshots/BT_QA_02/BT_QA_02_COTIZACION_12_390.png), [pausa visible](../screenshots/BT_QA_02/BT_QA_02_PAUSA_390.png), [entrega](../screenshots/BT_QA_02/BT_QA_02_ENTREGA_390.png).
- [Recorrido cinco tamaños](../qa/BT_QA_02_EVIDENCIA/recorrido-cinco-tamanos.json), [vacío/foco 390](../qa/BT_QA_02_EVIDENCIA/cotizacion-vacia-y-foco-390.json).

## Publicación y CI

Código enviado a `main` y [Render existente](https://biomotors-taller-demo.onrender.com). **HTML/JS/CSS servidos coinciden byte a byte con el build aprobado de `2529494`**:

- `index-Dmg14rzm.js`: SHA-256 `79f86129323cbfa78358f47e08fc8e15570b0f75742f432e356437fa5ff69cf9`.
- `index-COfYdRSc.css`: SHA-256 `5c15207fc7d698df39113dcb4c2e8d03d2b40675ceab66a1a7e002530027f4ea`.

Recorrido completo **sobre la URL publicada a 1650 y 390 px: PASS**, incluidos resumen 4/8/12, estado vacío a 390, editor, espera/resolución, entrega y cero escrituras/almacenamiento/errores. [Resultados Render](../qa/BT_QA_02_EVIDENCIA/recorrido-render.json). Las capturas después de escritorio/390 corresponden al sitio publicado; 375 corresponde al recorrido local del mismo build.

El contexto de prueba Chromium remoto usó `ignoreHTTPSErrors` por la CA del proxy del entorno, sin cambiar aplicación o despliegue; `curl`/Python mantuvieron validación TLS en la comparación de bytes. No sustituye Safari o Android físicos. El commit documental no modifica los bundles.

Actions remoto **no confirmado**: `gh run list` devuelve Forbidden desde este entorno. Los PASS anteriores son ejecuciones locales comprobadas, sin atribuirles estado SUCCESS remoto. El workflow actualizado incluye los nuevos recorridos y análisis PDF para ejecución en GitHub.

## Punto de parada

BT-QA-02 completada técnicamente para revisión visual del Director. Safari/iPhone y visor Android físicos pendientes. **No iniciar BT-COM-01 ni backend**; no hay correo consolidado, adjuntos operativos, identidad/aceptación real o persistencia nueva.
