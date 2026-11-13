# BT-INS-01 — Informe técnico multipunto interactivo

Fecha: 13/11/2026. Base: `1def712`, rama `main`, mismo Render. Implementación DEMO para aprobación visual del Director; no constituye aprobación del formato técnico definitivo por Ignacio.

## Entrega

- Página interior de Informes y cotizaciones, sin modificar los cinco paneles, sidebar, topbar, hero ni identidad R2. Acceso por **Nuevo informe → Crear inspección multipunto**, eligiendo una OT DEMO; también desde **OT → Generar informe → Crear inspección multipunto**. El informe general y las cotizaciones anteriores conservan sus recorridos.
- Cinco categorías, 34 componentes, catálogo configurable con ID, categoría, orden, nombre, estado y observación individual. Tabla oliva/dorada compacta con dos grupos por sección y frenos/neumáticos lado a lado en escritorio. Editor móvil con tres controles de al menos 44 × 44 px y acción de limpiar; vista previa e impresión siempre tabulares.
- Una X por fila: `unreviewed`, `ok`, `attention`, `immediate`; radios nativos accesibles por teclado, etiquetas de resultados, contadores derivados y limpieza explícita. Ninguna conversión automática de pendientes a OK ni conclusión automática de seguridad para circular.
- Datos relacionados de OT, cliente y vehículo reutilizados y validados mediante `documentContext`; copia independiente del informe. Marca/modelo/año se separan de la descripción DEMO existente; combustible y horas se completan explícitamente. Fechas de visita conservadas, sin inventar horas.
- Cabecera con identidad comercial copiada de Configuración DEMO (nombre, logo opcional, dirección, teléfono, correo y pie del taller); ByteTorque figura como software. No se altera Configuración ni los documentos anteriores.
- Motivo del cliente, observaciones generales del técnico (3.000 caracteres) y resultados separados. Observación opcional por componente (500 caracteres), incluida en la hoja.
- Fotografías exclusivamente locales: JPG/PNG/WebP, máximo seis de 5 MB, decodificación comprobada, miniatura, ampliación, asociación opcional y eliminación. URLs temporales liberadas al quitar/descartar y por el navegador al cerrar/recargar; se conservan al navegar para poder retomar el borrador. Sin imágenes ficticias precargadas como evidencia.
- Borradores y fotos conservados en memoria de la página; accesibles de nuevo desde Nuevo informe → Borradores multipunto. Aviso explícito de pérdida al recargar/cerrar; sin localStorage, sessionStorage, IndexedDB ni servidor. Guardar no representa respaldo permanente.
- Finalización DEMO exige datos técnicos y horas coherentes. Con pendientes, muestra el número y requiere aceptación explícita para cerrarlos como Sin revisar. No envía correo ni marca Correo enviado; permite reabrir la edición.

## Adaptador y fidelidad técnica

La OT conserva exactamente su inspección resumida de ocho ítems y tres estados. El adaptador comparte **solo el nivel de aceite de motor**: `correcto → ok`, `atencion → attention`, `no-revisado → unreviewed`. Los grupos frenos, neumáticos, luces, fluidos, suspensión y correas no certifican componentes individuales y quedan Sin revisar; no hay correspondencia automática al rojo. OT-1002 comienza con 1/34 revisados, no 6/34.

La fila de aceite se identifica explícitamente como **Nivel de aceite de motor** para delimitar esa equivalencia y evitar interpretar el control de nivel como una evaluación de toda la condición del aceite. Se utiliza **Bieletas** según la lectura del mockup y la transcripción. Ignacio debe confirmar estos términos y si desea separar nivel/condición del aceite antes de fijar una plantilla técnica definitiva. No se han inventado diagnósticos ni equivalencias adicionales.

## PDF e impresión

Editor y vista previa comparten `InformeMultipuntoPreview` / `MultipuntoTable`: mismas selecciones, X y posiciones. Impresión A4 mediante página CSS nombrada, márgenes de 10 mm, fondos con `print-color-adjust: exact`, sin navegación, botones ni diálogos; filas sin saltos internos. Las notas extensas pueden continuar a otras páginas.

**Descarga/generación directa de PDF: pendiente.** Se mantiene la alternativa veraz de imprimir / guardar como PDF del navegador, sin biblioteca adicional. Chromium generó durante la validación un PDF auténtico de una página A4 con cinco selecciones de prueba y pendientes visibles; no es una función de descarga directa de la aplicación. Su imagen está versionada como evidencia A4. Las fotos no se incrustan en esa hoja y se indica expresamente su número y carácter temporal.

## Evidencia

- `npm run typecheck`, `npm test`: **48/48** pruebas en nueve archivos; ocho pruebas nuevas de catálogo, exclusividad/limpieza/independencia, contadores, adaptador conservador, relaciones, validación/cierre y memoria/fotos.
- `npm run build`: TypeScript + Vite + verificación PWA PASS.
- `node scripts/verify-multipunto-ui.cjs`: **PASS en 1650/1440/768/390/375 px**, incluye cambio verde/amarillo/rojo/limpieza, teclado, persistencia de observaciones al cambiar categoría, contadores, selección táctil, fotos válidas/corruptas/SVG, ampliación/asociación/eliminación/liberación, borrador/retorno, vista previa, impresión y color, cierre con pendientes, reapertura, descarte, integración OT y reinicio al recargar. Cero escrituras de red y almacenamiento web en esos recorridos.
- Scripts existentes `verify-orders-ui.cjs`, `verify-clients-ui.cjs`, `verify-reports-ui.cjs`, `verify-settings-ui.cjs`: **PASS en los mismos cinco tamaños**.
- Comparación de capturas contra copia de `main` anterior (`1def712`) en 1650/390: Inicio, Órdenes, Informes y Configuración sin diferencias de píxeles; Clientes móvil idéntico, Clientes escritorio solo 189 píxeles de suavizado en texto de la tarjeta inferior de la sidebar (x43–234/y813–915), contenido del módulo intacto. No se modificó su código ni CSS.
- Capturas inspeccionadas: `docs/screenshots/BT_INS_01_1650.png`, `BT_INS_01_390.png`, `BT_INS_01_390_CONTROLES.png`, `BT_INS_01_A4.png`. Fotos usadas por pruebas identificadas como fixture y retiradas antes de las capturas.

## Límites y próximos pasos

Pendientes: aprobación visual y terminología de Ignacio, prueba física Safari/iPhone, PDF directo, incorporación opcional de fotos al PDF y persistencia futura con permisos multitenant. Datos/IDs de taller, cliente, vehículo, orden e informe ya están relacionados; técnico es el dato ficticio asignado por la OT, sin cuenta Auth real.

Sin cambios en Supabase, Auth, onboarding BT-CP02-D desactivado, RLS, suscripciones, pagos, correo real ni Android. No se ejecutaron migraciones ni las pruebas de Auth A/B que requieren credenciales. Se preservan los avances ajenos de seguridad presentes en `main`.

## Publicación comprobada

Código principal: `b75bcfb`; corrección final de la leyenda de inspección totalmente revisada: `e59e899`. Ambos publicados mediante `main` y el autodespliegue del Render existente, sin crear infraestructura. Se conservaron las decisiones documentales BT-PLAN-02 / BT-PLAN-IDEAS-01 recibidas durante el trabajo.

El HTML de https://biomotors-taller-demo.onrender.com apunta al build final y los dos bundles coinciden **byte a byte** con `dist`:

- `/assets/index-D6qqfpE6.js`: SHA-256 `651b59dca8b5c6d6234150a426b5febf188dcb38366f141aa453368ac8051e71`.
- `/assets/index-DdHIPBEk.css`: SHA-256 `a55249088838795c17dd0b2f6c561167f947dc960d3c950894c9174eb87eea6e`.

La leyenda distingue ahora una inspección revisada de una incompleta antes de finalizar. TypeScript, 48 tests y build/PWA se repitieron tras esa corrección. Se añadió y ejecutó la comprobación de los **34/34 ítems revisados y cierre sin pendientes** en navegador a 1650 px, además del recorrido previo completo en los cinco tamaños. Su resultado fue PASS.

Esta evidencia acredita el contenido servido por Render y la prueba de navegador local del mismo frontend; **no se ha consultado el estado administrativo LIVE ni el resultado de GitHub Actions remoto**. Safari físico y aprobación visual del Director continúan pendientes.
