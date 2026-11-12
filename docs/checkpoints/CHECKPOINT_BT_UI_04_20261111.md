# ByteTorque — BT-UI-04 — Clientes y vehículos

Fecha: 11/11/2026 (Chile). Base `091c988` de main; identidad R2 oficial. Solicitud: panel según mockup con relaciones coherentes y registro mediante enlace exclusivamente DEMO.

## Entrega y archivos

- `src/clientes/ClientesPanel.tsx`: hero R2 con fecha America/Santiago, KPI, búsqueda local/global, filtros, selección y diálogos.
- `ClientViews.tsx`: tabla y ficha rápida, vehículos, historial, pendientes y ficha ampliada modular.
- `RegistroClienteDemo.tsx`: formulario con errores accesibles, contacto sintético y simulación de enlace público sin URL activa.
- `clientesData.ts` / `clientesData.test.ts`: relaciones compartidas, filtros, historial, contactos sin RUT, email no verificado y validaciones.
- `clientes.css`: estilos encapsulados; tres columnas en escritorio, reorganización tablet/móvil y controles táctiles. No se alteran `styles.css` ni `premium.css`.
- `src/App.tsx`: conecta el tercer panel, búsqueda global y apertura dirigida de órdenes/fichas.
- `src/ordenes/OrdenesPanel.tsx`, `OrdenDetalle.tsx`, `ordenesData.ts`: conexión bidireccional sin cambiar el aspecto del detalle; nombres ficticios compartidos y elección correcta de vehículo en creación de OT.
- `scripts/verify-clients-ui.cjs`: pruebas de interacción de navegador reproducibles. Requiere Playwright del runtime, Chromium y servidor dev en puerto 5173.

Modelo, límites de memoria y requisitos futuros: [datos y registro DEMO](../BT_UI_04_DATOS_Y_REGISTRO_DEMO.md).

## Comparación visual y capturas persistentes

La composición respeta la referencia: hero, cuatro KPI, listado ancho a la izquierda, ficha rápida central, pendientes a la derecha e historial inferior completo. Se calibraron alturas, separaciones, tablas, badges, superficies y tipografía usando el R2 existente. Se revisaron capturas de 1650/1440/768/390/375 px; sin desbordamiento horizontal. En móvil, clientes e historial usan tarjetas y los vehículos son seleccionables.

Capturas versionadas para revisión independiente:

- [Escritorio, 1650 px](../screenshots/BT_UI_04_1650.png).
- [Móvil, 390 px](../screenshots/BT_UI_04_390.png).

Las otras capturas están en `/workspace/visual-ui04/`. Inicio y OT-1002 se compararon con las capturas anteriores de UI-03 a 1650 px: tamaños iguales y **sin diferencias de píxeles** en ambos. No se reemplazaron sidebar, topbar ni detalles aprobados.

Diferencias deliberadas respecto al mockup: contactos e identificadores sintéticos sin RUT, María conserva su Hyundai de OT-1002 y Camila usa Toyota/Suzuki; los pendientes e historiales corresponden al vehículo seleccionado, no a otros clientes. Las cinco filas no se presentan como 1.284 registros reales; los KPI son ilustrativos.

## Evidencia funcional

- TypeScript PASS; **24 pruebas unitarias en 6 archivos PASS**; build Vite y verificación PWA PASS.
- Navegador en 1650/1440/768/390/375 px: búsqueda local/global, estado, selección de cliente, cambio de vehículo, historial/observaciones correspondientes, orden asociada y retorno a cliente, ficha ampliada, formulario inválido/válido, simulación del enlace y cliente temporal sin vehículos: PASS.
- En todos esos recorridos: sin errores JavaScript, sin solicitudes de escritura de red y sin localStorage/sessionStorage. Reinicio por recarga verificado.
- Regresión de OT: script `verify-orders-ui.cjs` PASS en los cinco tamaños (inspección, ítems, totales, informe, impresión, confirmación, progreso y reinicio). Creación con Camila y su segundo vehículo Suzuki: PASS.
- Se corrigió una etiqueta accesible de formulario que incluía el mensaje de error al validar; ahora sus nombres permanecen estables y los errores se asocian por aria-describedby.

Capturas locales de Chromium, no prueba física Safari/iPhone. GitHub Actions remoto no consultable: API GitHub devuelve Forbidden. No afirmar CI remoto aprobado. El contenido servido por Render se comprueba tras el push y se distingue del estado administrativo literal LIVE.

## Pendientes

Aprobación visual del Director para Clientes y vehículos; Safari/iPhone físico. Backend seguro, RLS por taller, historial durable, clientes/vehículos reales, invitaciones individuales con expiración, antiabuso, verificación del email, PDFs y entrega transaccional quedan para etapas autorizadas posteriores. Nuevos clientes e ítems son temporales; no se simula guardado real. Android y Supabase intactos; sin APK ni credenciales nuevas. No avanzar a Informes y cotizaciones.

## Evidencia posterior al push

Implementación `9bf7d3b` enviada a origin/main. El Render existente sirve HTML público que referencia `/assets/index-CcBhUxMb.js` y `/assets/index-MkcZwIXh.css`; ambos bundles descargados por HTTPS coinciden **byte a byte** con el build local validado. Panel disponible en Clientes y vehículos, con navegación a órdenes y retorno a su ficha. Esto confirma el contenido publicado; el estado administrativo literal LIVE y Actions remoto no se consultaron por las limitaciones de acceso descritas. No se creó otro servicio ni se alteró la configuración cloud publicada.

## Auditoría independiente de GitHub y Render — 11/11/2026

Este complemento registra verificaciones posteriores mediante los conectores GitHub y Render a las que el agente Codex no pudo acceder. Las afirmaciones previas de su informe se conservan como antecedente.

- **GitHub main:** `1280e5e8e8a47638fa568d38e293339438da988a`.
- **Actions remoto `#43130663129`: SUCCESS**. Job Web/iOS PWA SUCCESS: TypeScript, 24/24 tests PASS (6 archivos), build Vite y validación PWA PASS. Job Android Expo SUCCESS: TypeScript, compatibilidad, export del bundle Android y verificación del perfil APK; **sin generar APK**.
- **Render:** `dep-dbqgs9psrm7s738hgih0`, correspondiente exactamente a `1280e5e`, estado administrativo `LIVE`.
- **Capturas:** ambas imágenes versionadas en `docs/screenshots/BT_UI_04_1650.png` y `BT_UI_04_390.png` se pudieron abrir efectivamente mediante GitHub. La auditoría visual independiente considera favorable la correspondencia con el sistema premium R2: sidebar y topbar desktop, hero, tarjetas KPI, columnas listados/ficha/observaciones e historial, y reformulación responsive a tarjetas en teléfono. No se observan desbordamientos horizontales en estas capturas.
- **Limitaciones de esta auditoría:** la comparación visual es cualitativa, no una certificación de pixel-diff con el mockup original. La igualdad pixel a pixel de Inicio y OT-1002 es evidencia reportada por Codex, no reejecutada aquí. **Aprobación visual del Director pendiente**, igual que pruebas físicas en Safari iPhone.
- **Alcance:** solo documentación y auditoría; interfaces, Android React Native/Expo, Supabase y despliegue funcional intactos. Sin datos personales reales, correos reales ni persistencia.
