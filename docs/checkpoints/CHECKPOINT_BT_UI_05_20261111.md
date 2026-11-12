# ByteTorque — BT-UI-05 — Informes y cotizaciones

Fecha: 11/11/2026, Chile. Base inicial: `f3a7858` de main; integrada posteriormente la documentación concurrente `39c6bd8` conservando ambas secciones del roadmap. Identidad visual R2; cuarto panel autorizado por la orden del Director.

## Implementación y archivos

- `src/informes/InformesPanel.tsx`: hero y KPI R2, composición izquierda/derecha del mockup, selección, filtros, diálogos y confirmación DEMO.
- `DocumentViews.tsx`: documentos recientes/completos, estados, historial por vehículo, eventos ficticios, destinatario y etapas de envío.
- `DocumentoPreview.tsx`: hoja técnica o cotización HTML, ampliación e impresión.
- `DocumentoEditorDemo.tsx`: flujo de selección de OT → edición → vista previa; secciones configurables e ítems de cotización editables, IVA opcional y vigencia.
- `documentosData.ts` / pruebas: documentos y eventos tipados, validación de asociaciones, destinatarios, simulación sin envíos y reutilización de cálculos CLP de OT.
- `reportSession.ts`: conservación de documentos/eventos únicamente en memoria de página.
- `informes.css`: estilos encapsulados para escritorio, tablet, móvil e impresión; `premium.css` y `styles.css` intactos.
- `src/ordenes/orderSession.ts` y conexión mínima en `OrdenDetalle.tsx`: revisión disponible en memoria para preparar documentos sin duplicar la inspección ni inventar ítems. Datos desaparecen al recargar. Sin cambios visuales del detalle.
- `src/App.tsx`: conexión de la cuarta sección y búsqueda global, sin reconstruir shell ni los otros paneles.
- `scripts/verify-reports-ui.cjs`: pruebas de interacción reproducibles en cinco tamaños; `verify-orders-ui.cjs` actualiza la expectativa de conservación temporal de la revisión entre fichas.

Contrato y límites: [Documentos y envíos DEMO](../BT_UI_05_DOCUMENTOS_DEMO.md).

## Fidelidad visual y evidencia

Se reproduce la distribución de referencia: documentos e historial a la izquierda; tres acciones arriba a la derecha; hoja y envío debajo. Se conservan sidebar, topbar, fotografía R2, tipografía del sistema, tokens, tarjetas, badges, formas decorativas y fecha de Chile. Se revisaron capturas 1650/1440/768/390/375 px sin desbordamiento horizontal. En móvil, documentos usan tarjetas y la composición se apila.

Diferencias necesarias: las identidades corresponden a datos compartidos reales de la demo; «Vista previa DEMO» es HTML y no un PDF inexistente; destinatarios sin verificar en example.com, indicadores ficticios y etapas históricas etiquetadas. Un envío actual simulado nunca se presenta como correo realmente enviado. La descarga directa PDF queda pendiente; impresión y ampliación funcionan.

Capturas versionadas para revisión independiente:

- [Escritorio, 1650 px](../screenshots/BT_UI_05_1650.png).
- [Móvil, 390 px](../screenshots/BT_UI_05_390.png).

Otras capturas en `/workspace/visual-ui05/`. Comparación a 1650 px con las evidencias anteriores: **Inicio, OT-1002 y Clientes sin diferencias de píxeles**. Para Clientes se tomó una captura fresca con dos frames de estabilización; una captura inmediata después de otra pantalla presentó diferencias de composición de texto en el pie de sidebar que desaparecieron al estabilizar. No se modificó el diseño de Clientes.

## Pruebas ejecutadas

- TypeScript PASS; **31 tests unitarios en 7 archivos PASS**; build Vite y `PWA assets: PASS`.
- Pruebas de relaciones documento/cliente/vehículo/OT, filtros, tipos, IVA opcional y totales, eventos históricos, validación de destinatarios sintéticos, prevención de duplicación de simulaciones, copias de revisiones y conservación de documentos históricos: PASS.
- Navegador en 1650/1440/768/390/375 px: selección/preview/destinatario, filtros de estado y vehículo, ampliación/impresión invocada, informe editable/secciones, cotización con agregar/editar/eliminar ítems, IVA/totales, confirmación/cancelación/reintento, recuperación de revisión OT y reinicio por recarga: PASS.
- En esos recorridos: **cero solicitudes de escritura de red**, cero localStorage/sessionStorage y sin errores JavaScript. Comprobación móvil adicional de búsqueda global y cantidades fuera de rango: PASS.
- Regresiones de Órdenes y Clientes: sus scripts de navegador PASS en los cinco tamaños. Inicio preservado por comparación visual y tests existentes.
- Impresión: PDF A4 generado por Chromium como artefacto de QA en `/workspace/visual-ui05/impresion-documento-demo.pdf`; texto extraído confirma solo el documento seleccionado, sin los controles de la aplicación. No se presenta ese artefacto como adjunto ni como función de descarga de la app.

GitHub Actions remoto no consultable: API devuelve Forbidden. No declarar CI remoto aprobado. Publicación en Render se verifica por el contenido servido tras el push; no se confunde con acceso al estado administrativo literal LIVE.

## Pendientes y alcance

Aprobación visual del Director, Safari/iPhone físico y descarga PDF directa. Para producción: Auth/RLS por taller, persistencia y versionado, archivo privado, destinatario verificado, PDF definitivo, proveedor transaccional, reintentos e idempotencia, auditoría y evidencia real de entrega. Nada de ello se activa en esta etapa. Android, Supabase, credenciales y pagos intactos. No avanzar a Configuración.
