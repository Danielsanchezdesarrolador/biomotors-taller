# BT-FLOW-01C — Inicio premium, recepción y continuidad del expediente

13/11/2026 (America/Santiago). Rama única `main`, mismo Render y repositorio. Referencias visuales: dos mockups aprobados expresamente en la orden BT-FLOW-01B/C; autorización aplicable sobre las restricciones históricas de Inicio. BT-FLOW-01D/E no autorizados para comenzar en esta entrega.

## Secuencia comprobada

Base inicial real `88ea19e`, sin otros agentes activos en este chat. Primero se implementó y comprobó la integración B (74 pruebas, TypeScript/build/PWA), registrada en **`645e2e3`** con su checkpoint. Después se integró la interfaz C sobre esos vínculos. No se reconstruyeron los módulos ni se creó un sexto destino.

## Resultado visual y funcional

- Inicio: «¿Qué vamos a hacer hoy?», mismos cuatro KPI ilustrativos R2, tarjeta principal Nuevo ingreso de vehículo, lista Continuar trabajos y progreso contextual de siete hitos. Asset automotriz oficial reutilizado; sidebar navy, topbar y cinco destinos móviles preservados, sin nuevas marcas/contactos/imágenes de los mockups.
- La lista proviene de expedientes reales de la memoria DEMO (ocho OT iniciales existentes y visitas nuevas), con vehículo, ID, siguiente actividad y Continuar. Sus hitos no se calculan a partir de los KPI ficticios ni de porcentajes de navegación.
- Recepción corta de tres pantallas: cliente/vehículo, motivo/fecha/km y revisión. El expediente presenta los siete hitos del proceso; los tres pasos son solo la recepción, no se presentan como porcentaje de todo el trabajo.
- Primera decisión: cliente registrado o nuevo DEMO; búsqueda y selección por IDs de ficha/vehículo, alta de otro vehículo para cliente existente y revisión de solicitudes BT-REG-02. Se reutilizan los modelos y validadores existentes; no se solicitan RUT ni se presume propiedad por patente.
- Contacto y datos estructurados de solicitudes nuevas precargados. Las dos muestras históricas sin contacto no reciben emails/teléfonos inventados: se pide completarlos con datos sintéticos o seleccionar una ficha. La confirmación de revisión se solicita de nuevo, sin reutilizar el consentimiento inicial del formulario como autorización de una relación.
- Borradores de recepción independientes para ingreso manual y cada solicitud; revisar otra solicitud no borra la recepción manual en curso. Guardar y salir, avanzar/volver, scroll y foco al encabezado; navegación libre con datos conservados en memoria.
- Confirmar recepción crea una visita con motivo original, fecha y kilometraje, **sin OT automática**. El expediente ofrece Crear orden de trabajo y una confirmación adicional. El índice reutiliza la OT ante llamadas repetidas; los antecedentes pasan sin reescribirlos.
- Un cliente puede tener varios vehículos y un vehículo múltiples visitas. Se conservan IDs, motivo y km de cada ingreso anterior, sin fusionar fichas ni alterar su OT histórica.
- Expediente: identidad de cliente/vehículo/patente/km/OT, actividad verificable, siete hitos con estados en texto y una acción principal por hito. Los nueve estados internos diferencian recepción, orden, inspección, propuesta, cotización, respuesta, ejecución, informe y entrega.
- Inicio/expediente coordinan los módulos existentes: OT de la visita, mismo multipunto por ID y mismos borradores premium de cotización/informe. Volver al expediente desde los cinco paneles recupera el caso seleccionado; los campos y controles previamente editados siguen disponibles.
- La lista de solicitudes indica «Recepción vinculada · DEMO» y abre su expediente si ya fue revisada; no ofrece una conversión duplicada. Clientes y selectores de Órdenes/Informes reconocen las fichas y OT nuevas compartidas en B.

## Evidencia y límites de las etapas

Recepción confirmada y OT existente son evidencia de sus dos hitos. Abrir o guardar un borrador de multipunto no completa la inspección; solo su finalización explícita en BT-INS-01 determina esa evidencia, conservando revisiones y pendientes originales. Nunca se transforman controles Sin revisar en OK.

Propuesta, respuesta/versiones, ejecución coordinada y cierre no se declaran automatizados: la interfaz muestra módulos disponibles, sus recursos/estados reales y lo que falta de 01D/E. Una aprobación DEMO de BT-COT-01 conserva sus reglas y revisión; no equivale a trabajos realizados, entrega o autorización legal. El índice consulta la revisión vigente del documento sin copiar otro estado de aprobación.

**Entrega/cierre guiado bloqueado y etiquetado como pendiente de 01E**. La visita no se cierra por abrir/imprimir/finalizar un documento. No hay correo, enlace público, firma, pago, diagnóstico, repuesto, precio o trabajo realizado inferido.

## Pruebas ejecutadas

- TypeScript PASS, **76/76 Vitest en 13 archivos**, Vite build y verificación PWA PASS. 66 pruebas anteriores preservadas; ocho pruebas de integridad B y dos de continuidad de borradores/precarga C. Las aserciones del Inicio antiguo se actualizaron al diseño autorizado, manteniendo cuatro KPI, cinco destinos y advertencias DEMO.
- `scripts/verify-flow-ui.cjs`: **PASS en 1650, 1440, 768, 390 y 375 px**: cliente y vehículo nuevos, guardado/salida y navegación, recepción sin OT, confirmación de OT, vínculo en su panel, reanudación exacta del mismo multipunto/observaciones y cotización/ítems, visita recurrente sin duplicar fichas, dos OT visibles en historial, solicitud BT-REG-02 precargada y convertida con confirmación, reapertura sin duplicación, entrega bloqueada y reinicio de datos al recargar. En 1650 se comprueba además revisar una solicitud distinta sin perder el borrador manual.
- Cero errores de página, escrituras de red y entradas en localStorage/sessionStorage en esos recorridos; cinco destinos siempre presentes y sin overflow horizontal global. En móvil, los siete hitos tienen desplazamiento propio y contenido de un solo hito visible; formularios apilados, campos de 16 px y acciones táctiles.
- Regresiones **PASS en los cinco mismos tamaños**: `verify-orders-ui.cjs`, `verify-clients-ui.cjs`, `verify-reports-ui.cjs`, `verify-settings-ui.cjs`, `verify-multipunto-ui.cjs`, `verify-cotizaciones-ui.cjs`.
- `verify-registro-ui.cjs` PASS a 1650/390 con Chromium del entorno y adaptador local de lanzamiento; sus aserciones originales no se modificaron. Solicitudes: 3 tras completar, 2 tras recargar; sin red/almacenamiento.
- Capturas **reales inspeccionadas**: `docs/screenshots/BT_FLOW_01_INICIO_1650.png`, `INICIO_390.png`, `INGRESO_1650.png`, `INGRESO_390.png`, `EXPEDIENTE_1650.png`, `EXPEDIENTE_390.png` (todas con prefijo `BT_FLOW_01_`) y `BT_FLOW_01_RESULTADOS.json`.
- Se restauraron las capturas anteriores del multipunto regeneradas por sus regresiones. No se incorporan modificaciones visuales ajenas.

## Archivos C

`src/flow/FlowHome.tsx`, `ReceptionWizard.tsx`, `FlowCasePanel.tsx`, `receptionDraft.ts`, su prueba y `flow.css`; coordinación de `App.tsx`, actualización de `App.test.tsx`, entrada por ID de inspección en `InformesPanel.tsx`, acciones de solicitudes vinculadas en `ClientesPanel.tsx`, aclaraciones de duración de memoria en formularios existentes. Ajuste de lectura de revisión en `flowSession.ts`. Script y workflow `.github/workflows/bt-flow-01.yml` de recorrido visual/funcional y artefactos.

No se modificaron los motores de inspección, cálculo, precios, aprobación, firma ni impresión de BT-INS-01/BT-COT-01. Los adaptadores de B resuelven identidades y notifican cambios de caché, y la barra contextual nueva se oculta al imprimir. R2 global `styles.css`/`premium.css` intactos.

## Pendientes BT-FLOW-01D/E y backend

- 01D: definición/coordinación de propuesta y diagnósticos editables, partidas valorizadas, revisiones de cotización, aceptación/rechazo/cambios ligados a la versión, autorización y manejo de trabajo adicional/repuestos. Sin copiar manualmente entidades ya resueltas; no inferir decisiones mecánicas.
- 01E: ejecución e informe coordinados, correcciones/excepciones, repuestos pendientes/pausas, cancelación de visita, checklist final, confirmación de entrega/cierre y QA integral de ese proceso.
- Aprobación visual/funcional del Director y Safari físico pendientes; Chromium no certifica iPhone real.
- Solo memoria de pestaña. Historial persistente, Auth/RLS, tenant real, destinatarios/correo, enlaces públicos, firmas y planes requieren backend seguro y otra autorización. Supabase, onboarding desactivado, BT-CP02-D y A/B, pagos y Android nativo sin cambios ni ejecuciones.

## Publicación

Incrementos en `main`: B [`645e2e3`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/645e2e3), C [`9c12f97`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/9c12f97). Sin ramas ni infraestructura nuevas.

**Contenido publicado verificado por HTTP:** https://biomotors-taller-demo.onrender.com apunta al build C y ambos bundles descargados coinciden byte a byte con `dist`:

- `/assets/index-DdTU3fxN.js`: SHA-256 `6088db594d533824da7aff4525cf1c5a9c21125c4ffc8b328b00bb8b0141da96`.
- `/assets/index-BBxbq_oD.css`: SHA-256 `9ece95a0452ab54d761dbec2ea9ca8b5ce7322c56d11f75f930ab40e51af6939`.

Se distingue la comprobación del contenido servido de un estado administrativo LIVE, no consultado. Capturas y recorridos corresponden al navegador local del mismo frontend validado, no a Safari físico.

Los pushes activan el workflow principal y el nuevo recorrido. Tras publicar, `gh run list` volvió a devolver **Forbidden**; no se atribuye CI remoto PASS. Los resultados locales 76/76, build/PWA y recorridos de navegador sí están ejecutados. Revisión remota: [Actions](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions).

Al cierre, detenerse para revisión del Director; no comenzar 01D.


## Verificación independiente posterior — 13/11/2026

GitHub Actions remoto se pudo consultar desde ChatGPT, pese al `Forbidden` del entorno Codex. [CI final 43525591408](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43525591408) sobre `4eaf123`: **SUCCESS** (Web/iOS PWA: **76/76 Vitest en 13 archivos**, TypeScript, Vite build y verificación PWA; Android React Native/Expo: SUCCESS, sin APK). Además [recorrido BT-FLOW-01 43525267992](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43525267992) SUCCESS, y regresiones BT-COT-01 y BT-REG-02 SUCCESS.

Se descargó el artefacto GitHub `BT-FLOW-01-Recepcion-Expediente-Capturas` (ID 14084054421): seis capturas de Chromium y reporte de pruebas. Revisión visual preliminar: identidad R2 y cinco paneles preservados, recepción y expediente legibles en escritorio/móvil. **Observaciones UX para el Director, no errores de CI**: en móvil los ocho expedientes DEMO alargan mucho Inicio y llevan la tarjeta de expediente muy abajo; evaluar mostrar 3–4 primero y «Ver todas». Validar en Safari físico que la navegación inferior no oculte el CTA y el scroll horizontal de los siete hitos sea claro. La vista móvil muestra IDs extensos de visita que podrían relegarse a detalles técnicos. Ninguna observación representa aprobación visual ni autoriza cambios de código.

BT-FLOW-01D/E continúan pendientes de autorización y diseño detallado. No se alteran Supabase, Auth/RLS, BT-CP02-D ni Android por esta nota.
