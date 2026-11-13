# CHECKPOINT BT-FLOW-01C-R1 — Aprobación visual y refinamientos móviles

**Fecha:** 13/11/2026 (America/Santiago)  
**Repositorio:** Danielsanchezdesarrolador/biomotors-taller · **Rama:** main · **Render existente:** https://biomotors-taller-demo.onrender.com  
**Base:** `814d84d` (CI de 01B/C verificado; checkpoint anterior).  
**Aprobación del Director:** BT-FLOW-01B/C **aprobado visualmente**, incluidos los tres refinamientos UX indicados previamente. Autoriza continuar el desarrollo guiado; Safari físico sigue pendiente.

## Cambio funcional acotado

Commit `07ae7f5`:
- `src/flow/FlowHome.tsx`: Inicio en móvil muestra hasta cuatro tarjetas inicialmente. Botón «Ver todos los trabajos (N)» / «Mostrar menos trabajos» con `aria-expanded` y `aria-controls`. En escritorio se mantienen todos. Con filtro de búsqueda activo se muestran todos los resultados encontrados, sin ocultarlos.
- `src/flow/FlowCasePanel.tsx`: referencia visible de visita de ocho caracteres, ID completo conservado en `title`, metadatos internos, navegación, callbacks y relaciones intactos. En móvil la navegación muestra «Desliza los hitos para ver las 7 etapas».
- `src/flow/flow.css`: ocultación solo en móvil, botón de expansión táctil, navegación horizontal con scroll-snap y margen de foco seguro para CTA sobre menú inferior. **Sin modificar estilos globales R2 ni la safe area existente.**
- `scripts/verify-flow-ui.cjs`: comprueba cuatro tarjetas visibles / ocho tras expandir / cuatro tras contraer a 390 y 375 px; ocho en escritorio/tablet; verifica la referencia corta y la indicación de siete hitos.

## Pruebas verificadas

- [CI principal 43528004145](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43528004145): **SUCCESS**. Web: TypeScript, 76/76 Vitest (13 archivos), build Vite y PWA PASS. Android React Native/Expo sin APK: SUCCESS.
- [Recorrido BT-FLOW 43528004301](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43528004301): **SUCCESS**, Chromium en 1650/1440/768/390/375, recorrido de recepción/OT/multipunto/cotización y nuevos controles móviles, sin errores reportados por el workflow.
- Los resultados de GitHub CI no constituyen prueba física Safari iPhone ni verificación administrativa de despliegue Render. Render no fue comprobado desde una consola administrativa en esta intervención; no declarar LIVE por el commit de refinamiento hasta revisar su publicación.
- Se conservan las cinco secciones R2, los módulos de registro, BT-INS-01 y BT-COT-01. Sin cambios en Supabase, Auth/RLS, BT-CP02-D, onboarding, credenciales, pagos, correos, firmas ni Android nativo.

## Siguiente etapa: BT-FLOW-01D

Contrato preparado en `docs/BT_FLOW_01D_CONTRATO_IMPLEMENTACION.md`. Comprende:
- Propuesta con diagnóstico, ítems y precios expresamente confirmados por el mecánico.
- Cotización BT-COT-01 con revisión y cálculo vigentes.
- Respuesta del cliente **DEMO** vinculada exactamente a `quoteId` + `revision`; aceptar, rechazar o pedir cambios con confirmación humana. Ningún envío real.
- Al modificar la cotización, la respuesta anterior deja de autorizar, con aviso claro.
- Precarga explícita y sin duplicados del informe de trabajo desde la cotización aceptada DEMO, con todas las partidas `performed:false`.
- No cierre, entrega, respaldo persistente, facturación, firma ni aprobación contractual; eso es fase 01E o backend autorizada aparte.

**Decisión de metodología:** BT-FLOW-01D requiere adaptación de varios módulos y pruebas complejas. Preparar una orden a Codex acotada a 01D, que consulte el nuevo HEAD y preserve C-R1. No empezar BT-FLOW-01E.

## Orden de continuidad

1. Consultar main y comprobar la ausencia de modificaciones concurrentes.
2. Leer AGENTS, README, roadmap, este checkpoint, el contrato 01D, checkpoint C/B y COT-01.
3. Implementar 01D con commits pequeños y verificaciones; no duplicar el motor del multipunto, cotización ni modelos.
4. Diferenciar pruebas, publicación, revisión visual y Safari físico. Detenerse tras 01D para la aprobación del Director antes de 01E.
