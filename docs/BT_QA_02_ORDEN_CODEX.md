# BYTETORQUE 1.0 — ORDEN OFICIAL PARA CODEX: BT-QA-02

**Fecha:** 13/11/2026 · **Estado:** autorizado por el Director para implementación DEMO, NO ejecutado en el momento de redactar esta orden.  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Única rama permitida:** `main`.  
**Render actual:** https://biomotors-taller-demo.onrender.com  
**Base conocida:** `21f08aaf4150488e72389094a58d75dfeeeba7a3` — **comprobar HEAD real antes de tocar código**.

## Misión

Implementar, con Codex, **solo las correcciones UX/editoriales verificadas durante BT-QA-01**, manteniendo idéntico el flujo de siete hitos de recepción → OT → multipunto → propuesta → cotización/aceptación → ejecución/informe → entrega. La mejora central y prioritaria es que, en móvil, pulsar «Revisar cotización» permita ver **todos los ítems y sus valores de un vistazo**, sin tarjetas inmensas por ítem. El Director completó la prueba manual A–E en Android, generó informe de trabajo imprimible y confirmó la entrega DEMO. Preservar esa funcionalidad, referencias por visita/revisión, autorizaciones y cifras.

### Fuentes obligatorias

1. `AGENTS.md`, `README.md`, `roadmap.md` y último checkpoint en `docs/checkpoints/`.
2. `docs/qa/BT_QA_01_MATRIZ_20261113.md`, hallazgos **H001–H006** y riesgo **R005**.
3. `docs/BT_FLOW_01_FLUJO_TRABAJO_INTELIGENTE.md` y checkpoints A/B/C/D/E.
4. `docs/SISTEMA_VISUAL_OFICIAL_R2.md`.
5. `docs/BT_COM_01_CORREO_CONSOLIDADO_ENTREGA.md` **solo como dependencia futura, no desarrollar en QA-02**.
6. Inspeccionar el código actual, no confiar en rutas supuestas. Se han verificado en main: `src/flow/FlowHome.tsx`, `FlowCasePanel.tsx`, `FlowDeliveryPanel.tsx`, `FlowProposalPanel.tsx`, `src/informes/multipunto/InformeMultipuntoPanel.tsx`, `src/informes/trabajos/WorkItemsEditor.tsx`, `WorkDocumentPanel.tsx` y `trabajos.css`.

No iniciar si existen cambios concurrentes en los mismos archivos sin comprobarlos. No crear otra rama, studio ni Render.

## Alcance por hallazgo

### H004 — P1, vista compacta de cotización en móvil (PRIMERO)

**Problema reproducido por el Director:** al pulsar «Revisar cotización», las partidas aparecen como tarjetas verticales demasiado grandes, una por una, y cuesta leer el presupuesto completo.

**Comportamiento exigido:**
- Cuando la navegación guiada abra la cotización en móvil (375/390 px), mostrar **al comienzo** un resumen compacto, legible y escaneable de todas las partidas, con **descripción, tipo, cantidad, precio unitario y total CLP**. Preferir renglones/dos líneas por ítem cuando el ancho lo requiera, sin scroll horizontal y sin reducir texto a un tamaño ilegible.
- Inmediatamente junto a ese resumen, mostrar subtotal neto, IVA 19 % y total IVA incluido. Los importes vienen **del motor `workTotals`** y de cada ítem existente, no de cálculos paralelos, ni valores inventados. Moneda `es-CL`.
- Mantener opción clara «Ver detalle / Editar ítems» que despliegue el editor completo, para modificar cantidades y precios, añadir o eliminar partidas. No perder funcionalidad de edición, validación o accesibilidad.
- Debe permitir leer 4, 8 y 12 partidas sin que la vista predeterminada obligue a desplazarse por tarjetas gigantes. Los nombres largos deben envolver de forma natural; valores no cortados. Controles táctiles mínimo 44px, tipografía legible y etiquetas accesibles.
- Mantener el editor y tabla de escritorio R2; **no** cambiar globalmente el modo de informe de trabajo (`mode:work`), los checkboxes `performed`, el documento impreso ni el flujo de aprobación por versión. Si se reutiliza `WorkItemsTable`, aplicar opción contextual de vista compacta sin hacer que el editor avanzado deje de funcionar.
- Las cotizaciones con cero partidas deben ofrecer estado vacío claro y un camino para agregarlas. Verificar lista larga y actualización de totales después de editar. No usar solo color para indicar tipo.

### H003 — P2, eliminar plantillas solo del paso guiado

- Quitar el botón «Cargar plantilla» de **Diagnóstico, trabajos y repuestos** del expediente guiado. Eliminar los estados, importaciones y diálogo de plantilla que queden sin uso **en `FlowProposalPanel`**.
- Conservar «Agregar otro ítem», edición y eliminación de partidas. Mantener las plantillas del **editor avanzado de cotizaciones** si hoy están aprobadas y funcionan. `WorkItemsTable` puede aceptar `onTemplate?` opcional.
- No sustituir la acción por otra opción compleja ni generar automáticamente reparaciones o costos.

### H005 — P2, jerarquía de opciones de visita

- Conservar la etiqueta/estado de visita siempre visible.
- Mover «Registrar espera DEMO» y «Cancelar visita DEMO» bajo un control discreto y accesible **«Opciones de visita»**, claramente perteneciente al expediente completo y **no a la cotización**.
- Mantener la exigencia de confirmaciones, nota/causa y bloqueos actuales; no cancelar accidentalmente. Si hay pausas activas, mostrar su advertencia y «Resolver pausa» de forma visible incluso con opciones colapsadas.
- Accesibilidad del menú: estado abierto/cerrado, foco, teclado, controles táctiles ≥44px, cierre sin pérdida de estado. No crear sexto panel.

### H002 — P2, botón de multipunto ambiguo

- En `InformeMultipuntoPanel`, renombrar «Finalizar y enviar» → **«Finalizar inspección DEMO»** y título/CTA del modal de confirmación a «Confirmar finalización DEMO» según contexto.
- Quitar iconografía de avión de papel/envío en esos controles, manteniendo un icono de finalización coherente.
- Mensaje claro: **«No se enviará correo ni documento»**. Preservar validaciones del multipunto, estados sin revisar, observaciones, guardado, `finalized` y vista previa A4.
- No habilitar correo ni PDF directo.

### H001 / H006 — P2/P3, textos visibles

- En `FlowHome`, corregir la frase antigua que anuncia BT-FLOW-01D/E como pendientes. Informar que el flujo A–E está disponible **solo en DEMO**, que la memoria se pierde al recargar y no hay envío real.
- En `FlowCasePanel`, reemplazar `en_curso` visible por **«En curso»**; otros estados internos deben traducirse solo en presentación («Pendiente», «Completado», «Bloqueado») sin cambiar valores de dominio ni CSS de selección.
- Revisar ortografía/consistencia de textos afectados, sin emprender otro rediseño editorial global.

### R005 — P2 de investigación, posible hoja en blanco en impresión

- La captura del Director muestra una vista Android de impresión con indicador **1/2**, aparentemente con segunda página vacía. **Es riesgo por reproducir, no fallo confirmado.**
- Reproducir con cuatro partidas, condiciones y comentarios de muestra en impresión A4 (Chromium y, si hay dispositivo/control disponible, Android). Comparar PDF resultante, número de páginas y contenido real.
- **Solo si se confirma hoja enteramente vacía**, corregir estilos `@media print`, tamaño de página, break/overflow y márgenes de la hoja responsable; no forzar una sola página si el contenido legítimo requiere más de una.
- Proteger impresión multipunto y documento de trabajo: solo trabajos marcados realizados deben aparecer y sumar en informe, cotización no equivale a informe. Mantener A4 profesional, tipografía y logo/tokens oficiales. Documentar si no se pudo reproducir.

## Fuera de alcance (separar estrictamente BT-COM-01)

- **NO** implementar correo único de cierre, adjuntos PDF, mensaje de aprobación previo, proveedores transaccionales, enlaces públicos, firma, aceptación real, facturación ni comprobante de entrega legal.
- **NO** modificar Supabase, Auth/RLS, onboarding, BT-CP02-D, claves, planes, pagos, migraciones o usuarios A/B.
- **NO** activar persistencia real; mantener DEMO solo en memoria de pestaña y datos ficticios. No copiar datos personales de capturas QA como fixtures.
- **NO** modificar backend, apps/android, servicios Render ni crear ramas; mantener los cinco paneles y R2.
- **NO** retocar internamente motores de cotización/IVA/inspección/ejecución/entrega salvo corrección mínima justificada y cubierta por regresión. Aceptación de cotización siempre `quoteId + revision`; editar invalida; `performed:false` hasta marca humana.

## Ejecución incremental recomendada

1. **QA02-A — H004**: resumen móvil compacto y controles de edición conservados; Vitest y capturas 375/390/768/1440/1650. Verificar tabla de escritorio y funcionamiento del informe.
2. **QA02-B — H003 + H005**: retirar plantilla del flujo guiado, agrupar opciones de visita, preservar confirmaciones y pausas activas; pruebas de accesibilidad e interacción.
3. **QA02-C — H001 + H002 + H006 + R005**: textos, finalización del multipunto, reproducción/posible corrección de impresión A4; regresiones de toda la ruta.
4. **QA02-D — QA y cierre**: compilar TypeScript, Vitest (mínimo las 101 pruebas preexistentes, más nuevas), build/PWA; E2E de nuevo ingreso → OT → multipunto → propuesta → cotización → respuesta por revisión → informe/realizados → entrega, más cancelaciones, rechazos, edición de revisión, espera/resolución, recarga; tamaños 1650/1440/768/390/375. Confirmar 0 envíos a servidores, 0 almacenamiento persistente y conservación de 5 paneles.
5. Publicar al **Render existente** solo tras PASS. Comprobar URL/JS/CSS o estado del despliegue; si no verificable, decirlo sin afirmar publicación. Generar capturas reales **antes/después** del resumen de cotización, opciones de visita, multipunto y PDF investigado.
6. Actualizar `roadmap.md`, `docs/qa/BT_QA_01_MATRIZ_20261113.md` con la resolución de cada H001–H006 y R005 (confirmado/no reproducido), y escribir `docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md` con commits, archivos, resultados por tamaño, limitaciones y pendientes.
7. Trabajar exclusivamente sobre `main`, commits pequeños. Devolver al Director enlaces verificables, capturas y resultados. **Detenerse tras BT-QA-02** para que el Director revise visualmente; no iniciar BT-COM-01 ni backend automáticamente.

## Criterios de aceptación finales

- En móvil, el primer vistazo de cotización muestra 4+ partidas y sus precios sin tarjetas de gran altura y con totales visibles.
- Cambiar un precio/cantidad actualiza cálculos CLP sin modificar otra visita; conserva regla de invalidación de aceptación.
- Registro de espera/cancelación detrás de «Opciones de visita» sin bloquear resolución de pausas.
- Plantillas ausentes del flujo guiado y presentes en editor avanzado cuando corresponda.
- «Finalizar inspección DEMO» no implica ni realiza envío.
- No aparecen `en_curso` ni referencias a etapas A–E pendientes en el texto visible.
- Impresión sin hojas verdaderamente vacías por fallo de estilos, cuando se reproduzca; contenido legítimo multipágina permitido.
- TypeScript, tests, PWA, E2E y regresión de los cinco paneles aprobados; trabajo DEMO preservado, cero backend.
- Informe y aceptación por revisión preservados, y checkpoint final completo.

**Orden final a Codex:** ejecutar todas las correcciones dentro de este alcance y detenerse al terminar; solicitar intervención del Director únicamente por conflicto concurrente, bloqueo de seguridad o decisiones no cubiertas.
