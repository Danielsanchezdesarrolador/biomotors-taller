# ByteTorque — BT-UI-03 — Detalle premium de orden de trabajo

Fecha: 11/11/2026, Chile. Base inspeccionada y actualizada: `f2c0f3b` en main. Referencia: mockup del Director para OT-1002; identidad R2 oficial.

## Implementación

Se reutilizaron el listado, los filtros, los estados de interfaz y el flujo de creación DEMO ya existentes. El detalle anterior con pestañas se sustituyó por la composición solicitada, sin modificar `src/App.tsx`, `src/styles.css`, `src/premium.css` ni el shell aprobado.

- `src/ordenes/OrdenDetalle.tsx`: componentes de ficha general, cliente/vehículo, diagnóstico, inspección, tabla de ítems, observaciones, progreso, formularios y diálogos nativos accesibles.
- `src/ordenes/detalle.css`: extensión encapsulada para tres columnas superiores y dos inferiores; adaptación tablet/móvil, botones táctiles, impresión y diálogos. Sin nueva biblioteca.
- `src/ordenes/detalleData.ts` y pruebas: cantidades, CLP, IVA redondeado al peso y contador de revisión.
- `OrdenesPanel.tsx`: conexión al nuevo detalle, preservando listado y creación existentes.
- `ordenesData.ts` y pruebas: ejemplo OT-1002 actualizado con síntomas, kilometraje y observaciones del brief. Nombres ficticios, email reservado `example.com`, teléfono ficticio y patentes DEMO en el modelo. La ficha presenta KZV-482 dentro del entorno ficticio.
- `scripts/verify-orders-ui.cjs`: validación automatizada del navegador en cinco tamaños. Requiere Playwright del runtime y el servidor dev en puerto 5173; no añade dependencias al proyecto.

## Comparación visual

Se revisaron capturas contra la referencia: misma estructura 3+2, franja horizontal de información, cuatro acciones, diagnósticos azul/violeta, tabla CLP, advertencias ámbar y progreso horizontal. Se conservan identidad, topbar, cuenta ficticia y sidebar R2. En móvil se apilan tarjetas, la tabla pasa a ítems legibles y el progreso usa dos columnas.

Diferencias deliberadas: rótulos DEMO, contacto ficticio en example.com, controles de selección operables y contador inicial **6 de 8**, pues la referencia contiene seis revisiones completadas (cuatro correctas y dos con atención), no cinco. La cronología indica fases simuladas sin inventar una bitácora real.

Capturas de escritorio/móvil: `/workspace/visual-ui03/detail-1650.png`, `detail-1440.png`, `detail-768.png`, `detail-390.png`, `detail-375.png`. Inicio: `inicio-1650.png`, comparado con la captura R2 anterior `visual-r2/after-1650.png`: ambas 1650 × 981, **sin diferencias de píxeles**. Capturas locales, no prueba física Safari.

## Interacciones y verificación

- Volver: listado existente. Continuar: enfoca inspección editable.
- Inspección: ocho categorías, estados accesibles, contador calculado. Cantidad de ítems revisados cambia al seleccionar.
- Agregar ítem: diálogo con campos obligatorios, cantidad positiva y precio no negativo; recalcula subtotal, IVA y total. Referencia: $130.150 + $24.729 = **$154.879**, mano de obra 1,5 × $24.900 = $37.350.
- Generar informe: vista previa DEMO local con revisión, pendientes y total actualizado, sin emails.
- Imprimir: impresión del navegador con estilos de ficha y advertencia DEMO. La prueba automatizada verifica la invocación, no una impresora física.
- Finalizar: diálogo de confirmación, cancelación y cambio temporal; las observaciones permanecen. Selector de estado actualiza el progreso y también solicita confirmación si se elige finalizar.
- Cliente/vehículo: aviso explícito de función futura, sin avanzar al siguiente panel.
- Ítems e inspección se pierden al cerrar la ficha; estados viven en memoria del módulo y se reinician al recargar. No se usa localStorage ni Supabase.

TypeScript PASS; **18/18 pruebas en 5 archivos PASS**; build Vite y recursos PWA PASS. Script de navegador PASS en 1650/1440/768/390/375 px: navegación, ausencia de desbordamiento y errores JS, edición, totales, informe, impresión invocada, cancelación/finalización, progreso y reinicio. Se corrigieron una extensión del fondo fuera del viewport y una superposición de texto/botón en móvil antes de la última validación.

## Publicación y pendientes

Push a main y comprobación del contenido servido por el Render existente se registran en el informe de entrega. GitHub Actions remoto no consultable desde el entorno: API devuelve Forbidden; no declarar CI aprobado sin evidencia. El contenido servido y el estado administrativo LIVE de Render son evidencias distintas.

Pendientes: aprobación visual del Director para este panel; prueba física Safari/iPhone; persistencia de ficha, inspección, ítems y observaciones por orden y vehículo, historial durable, permisos/RLS, generación documental definitiva y entrega de correos. Todos requieren etapa posterior de backend seguro. Android, Supabase y otros paneles sin cambios; sin APK ni pagos.

## Resultado de integración y publicación

Implementación `776c2de`, ajuste de legibilidad a 1440 px `9e3b08b`, ambos enviados a origin/main. Tras el ajuste se repitieron build y verificaciones de navegador/capturas en los cinco tamaños: PASS. El flujo de nueva orden existente también se ejercitó hasta abrir OT-DEMO-009 sin costos inventados: PASS. Se generó una ficha de impresión DEMO A4 de dos páginas en `/workspace/visual-ui03/ficha-demo.pdf`.

Render existente confirmado sirviendo el build final: HTML público raíz e index.html apuntan a `/assets/index-QkOATr-D.js` y `/assets/index-CKa2_0MK.css`; ambos archivos descargados por HTTPS coinciden **byte a byte** con los artefactos locales validados. Navegación para revisión: Órdenes de trabajo → OT-1002. Esto verifica el contenido desplegado; no implica haber consultado el estado administrativo literal LIVE. Sin acceso a API GitHub/Render para verificar Actions o el estado interno del deploy. Capturas visuales de la ejecución local del código publicado.

## Verificación independiente posterior desde ChatGPT

**Fecha:** 11/11/2026 Chile. La sección previa conserva el informe técnico original de Codex; esta verificación resuelve la limitación de acceso a GitHub Actions y Render.

- **Commit remoto:** `ab51152b3573debf9382efbd4247ce12f7e071f6` en `main`.
- **GitHub Actions:** run `43124464047` finalizó **SUCCESS**. Jobs `Web / iOS PWA` y `Android React Native / Expo (sin generar APK)`: ambos SUCCESS.
- **Log CI Web:** **5 archivos de prueba, 18/18 tests PASS**, build Vite PASS, `PWA assets: PASS`. TypeScript web PASS.
- **Render:** servicio `biomotors-taller-demo`, despliegue `dep-dbqg4m0ae00c738bff40` del mismo commit `ab51152`, estado administrativo **LIVE**.
- El reporte del agente indica prueba del navegador en cinco anchos y cero diferencia de píxeles para Inicio R2. **No se verificó independientemente esa comparación visual** porque las imágenes permanecen en rutas locales de Codex y no están adjuntas a esta conversación.
- **Sin aprobación visual aún** para OT. No avanzar automáticamente a Clientes y vehículos; el Inicio R2 es identidad oficial ya aprobada.
- **Sin APK Android, sin persistencia Supabase y sin correos reales.** La prueba en Safari iPhone físico continúa pendiente.
