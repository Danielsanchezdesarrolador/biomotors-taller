# BT-COT-01 — Cotizaciones e informes de trabajo premium R2

Fecha: 13/11/2026 (America/Santiago). Rama única `main`, base comprobada `a4615b1`; mismo repositorio y Render. DEMO para aprobación visual; no valida un servicio real ni condiciones legales definitivas.

## Implementación y acceso

- **Informes y cotizaciones → Nueva cotización → Crear cotización premium**, eligiendo una OT ficticia.
- **Informes y cotizaciones → Nuevo informe → Crear informe de trabajo**, eligiendo una OT ficticia. El multipunto y el informe general previo permanecen disponibles en ese diálogo.
- **OT → Generar informe → Crear cotización / Nuevo informe de trabajo**. La acción Crear inspección multipunto conserva su ruta. No se cambia el diseño principal de las OT.
- Los flujos clásicos de informe/cotización continúan funcionando. La nueva página interior conserva topbar, sidebar y cinco destinos oficiales, sin reproducir el menú adicional del mockup.

El editor incorpora encabezado, cinco indicadores reales, identidad del taller/cliente/vehículo, fecha editable, tabla a la izquierda, totales a la derecha y tres tarjetas inferiores de condiciones, comentarios y aprobación/cierre. En móvil, los ítems se convierten en tarjetas con controles táctiles; la hoja de impresión siempre conserva una tabla.

## Datos y cálculo

Se reutilizan `createDocument`, `documentContext`, las fichas DEMO y `orderSession`. No se copian los contactos reales ni los números inconsistentes de la imagen. Cliente, teléfono/email sintéticos, vehículo, patente, ingreso, kilometraje, motivo y diagnóstico provienen de la misma OT. La identidad comercial del taller se copia de Configuración DEMO al crear el documento, sin alterar Configuración ni documentos históricos.

Ítems de repuesto, insumo y mano de obra; se conserva además **Servicio** para no reclasificar silenciosamente el rectificado de discos de la OT existente. Agregar/editar en formulario, subtotal de línea inmediato, eliminación con confirmación, numeración automática, plantilla de frenos o mantención predeterminada y reemplazo confirmado. No se presentan manejadores de arrastre ni reordenación ficticia.

Cantidades finitas mayores que cero y hasta 10.000; precio entero CLP entre cero y 100.000.000. Se rechazan entradas vacías, no finitas, negativas o duplicados normalizados de descripción/tipo; para aumentar unidades se edita la cantidad. El cálculo reutiliza `calculateTotals`: redondea cada línea al peso, suma el neto y redondea el IVA del 19 %. Insumo conserva su tipo en el documento; el adaptador de cálculo solo ajusta el discriminante de tipo para reutilizar la función numérica anterior. Sin descuentos ni otros impuestos.

Ejemplo OT-1002: neto $130.150, IVA $24.729, total **$154.879 CLP** en indicador, resumen, vista previa y hoja A4.

## Separación entre propuesta y ejecución

- `quote`: todos los ítems son **propuestos**; no acredita ejecución.
- `work`: cada ítem comienza `performed: false`, incluso al cargar una plantilla. **Solo los ítems marcados Realizado por el operador DEMO se imprimen y suman**; los demás permanecen en el editor como no incluidos. Sin selección expresa, total $0 y finalización bloqueada.
- El motivo del cliente es un antecedente original de solo lectura; diagnóstico editable, propuesta/ítems, realización explícita, comentarios y recomendaciones se mantienen separados.
- Una referencia opcional permite seleccionar una inspección multipunto temporal de **la misma OT, cliente, vehículo y taller**. Se toma una copia de referencia de estados/observaciones, muestra pendientes y cita los contadores sin transformar Sin revisar en OK ni acreditar reparaciones. No se añade otro motor ni controles de inspección, ni se modifica BT-INS-01.

## Estados, borradores y aprobación

Borrador → Pendiente de revisión → Aprobado DEMO (cotización) o Finalizado DEMO (informe de trabajo). La validación exige ítems, fecha, vigencia/condiciones válidas y, en informes, al menos un trabajo marcado Realizado. Hay confirmación explícita de simulación sin consentimiento legal, contrato, firma electrónica ni autorización de trabajos reales. Nombre, fecha y monto de la simulación se derivan del documento; no hay firmas precargadas.

Cada cambio de contenido incrementa la revisión e **invalida la aprobación/finalización simulada anterior**, regresando a Borrador. No se pueden aprobar dos veces los mismos datos. El área para firma futura está vacía e identificada como no capturada.

Borradores en memoria de esta página: se recuperan desde el diálogo Nueva cotización/Nuevo informe; recargar o cerrar la pestaña los descarta. Sin localStorage, sessionStorage, IndexedDB, servidor ni respaldo permanente. Guardar borrador y descartar informan su alcance. No se ofrecen garantías legales ficticias: las condiciones iniciales son ejemplos editables, vigencia 1–365 días, textos comerciales hasta 2.000 caracteres y comentarios técnicos hasta 500 con contador.

## Impresión y compartir

**Descarga PDF directa pendiente.** La acción ofrecida es «Imprimir / Guardar como PDF», con vista previa HTML profesional y `window.print`; no es una captura de pantalla ni descarga un archivo falso. A4 mediante página CSS nombrada y márgenes de 12 mm, identidad comercial del taller, datos relacionados, tabla completa de ítems incluidos, totales, condiciones, textos técnicos, estado de aprobación y ByteTorque como software.

Las filas evitan cortes y la cabecera de tabla se repite. La muestra de tres ítems con aprobación DEMO ocupa **una página A4**; la prueba de 35 ítems ocupa **dos páginas**, con el último ítem completo y encabezados repetidos, comprobados en el PDF real generado por Chromium para la prueba. Se conserva la impresión del multipunto, con nombre de página CSS independiente.

Compartir ofrece **copiar un resumen local sin contactos** (identificador DEMO, estado y total) o simular preparación de envío. Clipboard confirmado por la API del navegador; si no está disponible se explica y permite seleccionar el texto manualmente. No hay correos, enlaces públicos, mensajería externa ni constancias falsas de entrega.

## Archivos

- `src/informes/trabajos/trabajosData.ts`: modelo tipado, adaptadores, cálculos, validación, plantillas, referencias y transiciones DEMO.
- `trabajosSession.ts`: copia independiente de borradores en memoria.
- `WorkDocumentPanel.tsx`: editor interior, metadatos, formularios, confirmaciones y acciones.
- `WorkItemsEditor.tsx`: tabla/tarjetas, formulario de ítem, errores y cálculos de línea.
- `WorkDocumentPreview.tsx`: hoja compartida de vista previa/impresión y aprobación simulada.
- `WorkDocumentLauncher.tsx`: selección de OT y recuperación de borradores.
- `trabajos.css`: estilos aislados R2, responsive e impresión A4 nombrada.
- `trabajosData.test.ts`: nueve pruebas nuevas de datos/reglas.
- `src/informes/InformesPanel.tsx`, `src/App.tsx`, `src/ordenes/OrdenesPanel.tsx`, `src/ordenes/OrdenDetalle.tsx`: integración mínima mediante parámetros y acciones en diálogos; sin rediseñar los paneles.
- `scripts/verify-cotizaciones-ui.cjs`: recorrido funcional y evidencias en cinco anchos.
- `.github/workflows/bt-cot-01.yml`: CI de navegador, capturas y PDFs de prueba como artefacto, sin servicios reales.
- `scripts/verify-clients-ui.cjs`: únicamente selectores de etiquetas corregidos para tolerar el texto de errores de validación. El fallo exacto se reprodujo contra `a4615b1`; no se cambió el formulario BT-REG-02 ni se debilitó ninguna validación.
- `docs/screenshots/BT_COT_01_*`: cotización, informe de trabajo, cabecera móvil, A4 y reporte JSON de los cinco tamaños.

## Validación ejecutada

- TypeScript PASS; **66/66 Vitest en 11 archivos** (57 existentes y nueve nuevos); Vite build y verificación PWA PASS.
- `verify-cotizaciones-ui.cjs`: **1650 / 1440 / 768 / 390 / 375 PASS**: OT y propiedad, agregar/editar/eliminar con cancelación, errores numéricos, duplicados, subtotal/IVA/total, condiciones/comentarios, revisión/aprobación explícita/invalidez por edición, borrador y reinicio, plantillas, clipboard y compartir simulado, PDF/impresión, dos modalidades y solo trabajos expresamente realizados, vacío/OT distinta, entrada desde OT. Cero errores de página, escrituras de red y entradas de almacenamiento web; sin overflow horizontal.
- Regresiones `verify-orders-ui.cjs`, `verify-reports-ui.cjs`, `verify-settings-ui.cjs`, `verify-multipunto-ui.cjs`: PASS en los mismos cinco anchos. `verify-clients-ui.cjs` PASS en cinco anchos tras corregir sus selectores anteriores. BT-REG-02 E2E PASS a 1650/390 con Chromium del entorno (adaptador de lanzamiento local, sin alterar el script ni producto BT-REG-02); sin red/escrituras ni almacenamiento.
- Comparación contra copia de `a4615b1`: Inicio, Órdenes, Informes y Configuración sin diferencias de píxeles a 1650/390; Clientes móvil idéntico. Clientes escritorio: 189 píxeles de suavizado de texto en la tarjeta inferior de la sidebar, x43–234/y813–915; contenido del panel sin cambios.
- Capturas de escritorio, móvil y A4 inspeccionadas directamente; sin datos reales ni firmas falsas. Capturas anteriores del multipunto restauradas después del recorrido de regresión para no introducir cambios ajenos.

## Límites pendientes

Aprobación visual del Director y Safari físico; PDF directo; almacenamiento multitenant seguro y permisos; plantillas propias Plus/Full; envío real, destinatario verificado y evidencia de entrega; aceptación remota, identidad y firma; condiciones comerciales definitivas por taller. Ninguna de estas funciones se declara operativa.

Supabase, Auth/RLS, onboarding cerrado `bt-owner-onboarding`, BT-CP02-D y pruebas A/B, pagos, suscripciones, Android y código BT-INS-01/BT-REG-02 permanecen sin cambios. No se creó infraestructura ni otra rama.

CI remoto: el push a `main` ejecuta el workflow principal y el nuevo recorrido de navegador. La consulta `gh run list` desde este entorno devuelve **Forbidden**; no confundir pruebas locales PASS con confirmación de GitHub Actions remoto. Publicación Render y SHA se registrarán tras comprobar los archivos servidos.
