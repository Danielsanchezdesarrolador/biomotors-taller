# BT-FLOW-UX-01 — Guided Overlay Workspace

Fecha 24/11/2026. Estado: diseño funcional aprobado por el titular; implementación local pendiente. Base funcional de investigación: e603c439bbba3619e1a28aeb8dc7277945a611c3. Producción permanece en 82c220111bad4e41f236041bf17983104155c250. Autorización de empezar desarrollo no equivale a publicar o desplegar. Mantener main único y Auto-Deploy OFF.

## Objetivo y contrato visual

Inicio, tarjeta Nuevo ingreso de vehículo: habilitar solo sesión privada verificada, taller activo y rol permitido. Abrir dialog modal grande centrado, fondo Inicio visible con overlay semitransparente y blur moderado; header fijo título/identidad/etapa, progreso de ocho pasos, contenido scrollable, footer Volver / Guardar y salir / Guardar y continuar. R2 navy/azul/blanco, responsive; en móvil aprovechar viewport y teclado. Modal semántico, foco atrapado y restaurado, Escape/cierre seguro, impedir acciones del fondo; no ocultar errores ni perder borradores. No simular guardado. Los cinco paneles existentes conservan gestión/consulta independientes.

## Recorrido real

1. Cliente y vehículo: buscar ficha autorizada, seleccionar o crear cliente/vehículo mediante cp03PilotRepository. Confirmar relación; no duplicar por reintento.
2. Recepción: crear o recuperar una OT mediante cp04Repository, asociada al vehículo seleccionado; confirmar motivo/kilometraje. Si existe orden abierta, ofrecer continuar, no crear otra.
3. Inspección multipunto: reutilizar 34 X, autoguardado y notas existentes; bloquear avance mientras guardados pendientes/error o diagnóstico provisional; respetar estados permitidos. No inferir inspección realizada.
4. Cotización: reutilizar QuotePanel/editor y CP05 para la OT exacta, partidas, IVA, condiciones y vigencia; guardar y emitir revisión con confirmación explícita. Proteger idempotencia y reconciliar lecturas ante respuestas ambiguas. No marcar emitida si servidor no confirma.
5. Aprobación: LIVE-02 sobre revisión emitida vigente; medio, nota >=12, declaración explícita; no firma verificada ni consentimiento inferido.
6. Ejecución: WorkExecutionDraft + LIVE-02; todas las partidas decididas, ninguna marcada realizada por defecto, explicación si pendientes, totales servidor, confirmación humana.
7. Entrega: respetar transición CP04 a lista y checklist LIVE-02, modalidad/nota/declaración; no confundir con pago ni firma. Si corresponde cerrar OT, confirmación separada de acción irreversible y solo transición soportada; no saltar guardas.
8. Expediente: finalArchiveRepository sobre revisión y delivery exactos; confirmar archivar, recuperar originales desde servidor con verificación SHA, no generar sustitutos ni volver a crear ante respuesta ambigua. Correo siempre OFF. Solo owner/admin para archivo; roles sin permiso ven estado y quién debe continuar, no se amplían privilegios.

## Arquitectura verificada

- src/App.tsx OfficialWorkspaceView renderPanel y navegación privada; src/official/OfficialPanels.tsx tarjeta actualmente UnavailableAction. Conectar CTA solo al contexto autenticado; mantener preview público sin nuevas acciones. Nuevo componente privado cargado con gates existentes CP03/04/05/06, documentos, FLOW y EXP; considerar guardas del grafo en vite.config.ts y scripts/verify-official-bundle.mjs sin abrir allowlist genérica. No añadir flag alojado sin autorización. Respetar alcance QA del servidor: no habilitar escrituras nuevas en otros talleres, gates existentes y rol por operación; si no hay evidencia de habilitación de taller para flujo completo, mantener CTA cerrado o hacer lectura autorizada de capacidad existente, no asumir que flag global autoriza.
- CP03: src/clientes/cp03PilotRepository.ts (search, recentCustomers, vehiclesForCustomer, getCustomer/getVehicle, createCustomer/createVehicle), Cp03PilotDirectoryView y contratos reales.
- CP04: src/ordenes/cp04Repository.ts (recentOrders, getOrder, createOrder, findingsForOrder, setStatus), Cp04OrdersView, Cp04MultipuntoChecklist, cp04Autosave. Reutilizar mismo contrato y guardas.
- CP05: src/cp05/Cp05PrivatePanel.tsx, QuotePanel.tsx, repository.ts (forOrder, load, command, documents), documentClient, temporaryDraft, quoteSelection; extraer UI reutilizable o modo guiado sin duplicar escrituras ni usar DOM automation.
- LIVE: src/entrega/FlowLive02Panel.tsx, flowLiveCandidate.ts (approval/execution/handover/history), WorkExecutionDraft. Proyección de etapas desde history y revisión real, no desde clicks.
- EXP: src/expedientes/repository.ts (list, documents, bytes, archive), FinalArchivePanel y contratos. Restringir a la revisión de la OT y confirmar manifest. No ampliar roles.
- src/flow/ReceptionWizard.tsx y FlowHome.tsx son DEMO con demoClients/demoVehicles/flowSession. Solo referencia de UX; nunca importar en privado ni usar fixtures en producción.

## Reanudación y continuidad

Inicio muestra trabajos en curso autorizados usando consultas existentes. Seleccionar OT por identificador confirmado; derivar avance desde cliente/vehículo, OT, inspección confirmada, revisión emitida, historial LIVE-02 y manifiesto EXP. No guardar etapa como autoridad en navegador; los borradores no confirmados mantienen mecanismo existente separado por usuario/taller, TTL y limpieza. Si se cierra antes de crear OT, no prometer expediente persistente: recuperar fichas guardadas y borrador permitido. Releer en sesión nueva, bloquear sesión revocada o contexto cambiado, no reutilizar repositorios dispuestos. Evitar duplicar órdenes, cotizaciones o informes por retries; ante respuesta ambigua consultar registro autorizado antes de repetir. Mostrar explícitamente qué quedó guardado. No introducir tabla o migración solo para un stepper; si un requisito no puede realizarse con contratos actuales, informar bloqueo real antes de tocar backend.

## Incidente real y corrección concreta

COT-000004 R1 emitida, neto 183000, IVA 34770, total 217770. Supabase consulta read-only: 4 OT, 2 revisiones, 0 aprobaciones/reportes/entregas. Logs HTTP GET historial 200, sin POST bt_flow_record_quote_approval observado en ventana 23:30Z–00:10Z. executionPreview.ts compara JSON.stringify(totals(quotedNet)) con JSON.stringify(p.totals). Orden observado del JSONB: tax,total,subtotal; orden calculado: subtotal,tax,total. Reproducción JS exacta: comparación serializada false; comparación de tres campos true. Causa candidata fuerte y reproducible; no declarar remediación hasta test real. Cambiar solo a comparación explícita de tres campos conservando Number.isSafeInteger, integridad de partidas y tenant/revisión. Para mantener rechazo de campos extra si el contrato lo exige, validar claves esperadas sin depender del orden. En executionPreview.test.tsx añadir caso con JSON parse/string orden tax,total,subtotal (mismos importes fixture) y caso negativo de tax/total alterado; revisar flowLiveCandidate.test.ts para aprobación con JSONB realista. No tocar snapshot ni hash de documentos. Revisar alcance de imports backend empaquetado; si cambio afecta Edge, no publicar ni desplegar sin aprobación. Registrar incidente y solución candidata en Toolkit posteriormente con prueba real; no certificar solución antes.

## Aceptación y economía de cuota

Una entrega funcional integrada local, no push, no deploy, no SQL/Edge/Storage/flags/correos/secretos ni datos reales. Usar fixtures existentes, tests de etapa/reanudación/aislamiento/roles y error JSONB, una compilación privada con flags pertinentes y validación visual desktop/móvil del overlay. No volver a ejecutar suites históricas de SEC07, backup, migraciones, CI ya aprobada ni repetir pruebas sin causa. Mantener gate público OFF y comprobar que el grafo público no incorpora módulos DEMO/privados. Registrar resultados y bloqueo, si lo hubiera. Después aprobación visual/publicación y QA humana consolidada desde mismo taller ficticio; no declarar aceptación del piloto ni incorporación de Ignacio sin recorrido real, aislamiento y persistencia. Codex solo ejecución local; investigación/documentación ya realizadas por director.


## Entrega local de implementación — BT-FLOW-UX-01 (24/11/2026, Chile)

Base sincronizada por fast-forward a `64616a4d9729a6ebfd6cac1012162a833f628a0b`.
Referencias ZIP inspeccionadas (cliente/vehículo escritorio, ejecución móvil y
capturas implementadas); no se incorporan imágenes ni datos ilustrativos al sistema.

### Implementado

- CTA privado en Inicio y overlay nativo modal: foco atrapado/restaurado, Escape
  protegido, fondo inerte/desenfocado, cabecera/progreso/footer fijos, scroll interno,
  animación 250 ms y reduced-motion. Los cinco paneles siguen independientes.
- Ocho etapas compuestas con CP03, checklist/autosave CP04, QuotePanel CP05,
  LIVE-02 por sección y archivo EXP sobre la revisión y OT exactas. No nuevos
  repositorios, backend ni tablas. Cliente/vehículo se verifican de nuevo al avanzar.
- Recepción consulta órdenes abiertas antes de insertar. Una respuesta ambigua
  bloquea la repetición en la instancia; se muestran registros para conciliación.
- Progreso/reanudación proyectados desde OT, hallazgos confirmados, revisión emitida,
  approval/execution/handover y manifiesto original; no hay paso persistido en localStorage.
- Borradores CP03/CP05 mantienen sus mecanismos existentes por usuario/taller.
  Cambios/operaciones pendientes bloquean salida y avance; el formulario conserva
  sus propias acciones de guardado explícito. Footer verifica servidor, no simula guardar.
- Modo cotización guiado fija OT, filtra cotizaciones y separa las etapas LIVE.
  Entrega permite transición existente a lista, con confirmación; no cierra OT sola.
- EXP consulta metadatos de revisión exacta aunque quede fuera de la primera página
  del catálogo. Nunca regenera originales. Éxito final solo tras manifiesto confirmado.
- Reutiliza gates existentes y limita entrada al taller QA aprobado
  `c943ad51-6d90-447b-8aa7-68866f69a4bc`, activo, owner/admin; no concede
  escrituras a otros talleres ni amplía roles. Sesión/taller revocados invalidan bindings.
- executionPreview compara subtotal/tax/total y exactamente tres claves. La regresión
  acepta JSONB reordenado y rechaza alteración de IVA/total o claves adicionales.

### Validación realizada y alcance real

- 18/18 pruebas focalizadas: proyección, alcance piloto/rol y suite del componente
  afectado con regresión JSONB. Sin SEC07, SQL ni suites históricas ajenas.
- TypeScript y builds privado ON/público OFF satisfactorios; exclusión del grafo
  privado y fixtures del build público comprobada. Callback/binding documental
  exacto posterior revisado con typecheck y escenas focalizadas.
- Chromium 1366/768/390: selección, recepción, vuelta a Inicio, reanudación de OT,
  bloqueo por ausencia de inspección y ausencia de segunda inserción al reanudar.
- Escenas 4–8 en Chromium 1366/390: recuperación de etapas desde evidencia sintética,
  editores reales y expediente completo. Son puertos de prueba en loopback; **no
  equivalen a ejecutar todas las escrituras en Supabase ni a aceptación humana**.
- Capturas y logs fuera de Git en `/workspace/work/flow-ux/`; fixture solo en harness.
  No mocks en producción; datos ficticios no se convierten en registros productivos.

### Límites comprobables y siguiente autorización

- La API CP04 existente `createOrder` inserta sin request_id idempotente. La nueva
  interfaz bloquea retries ambiguos en su instancia y concilia órdenes abiertas,
  pero no puede garantizar atomicidad frente a dos sesiones simultáneas o cierre
  del navegador durante una respuesta incierta. Resolver esa garantía requiere
  contrato backend autorizado; no se cambió SQL ni se debilitó una guarda.
- Reanudación desde Inicio cubre el listado reciente existente (40 órdenes), no
  búsqueda histórica ilimitada. Antes de tener OT solo se promete ficha confirmada
  y borrador temporal autorizado; las notas LIVE no confirmadas no se declaran guardadas.
- Falta recorrido humano alojado de ocho etapas con escrituras, nueva sesión,
  red incierta real y confirmación visual del propietario. No se certifica al piloto
  ni a Ignacio. Safari/Android físicos y lector de pantalla pendientes.
- El cambio executionPreview participa en dependencias documentales; cualquier
  futuro paquete Edge actualizado requiere revisión/autorización separada.
- **NO PUSH, NO DEPLOY, NO SQL/Storage/Edge/secrets/flags, correos ni datos reales.**
  Auto-Deploy permanece OFF; no se consultó ni modificó producción.

### Ampliación focalizada del propietario: trabajos simultáneos

Entradas conectadas a Inicio, ficha de vehículo (CP03) y detalle de OT (CP04),
sin sustituir cotizaciones ni historial existentes. Cada instancia se enlaza al
vehicle_id/order_id confirmado; Guardar y salir relee servidor y cierra sin exigir
que toda la etapa esté terminada. Inicio permite comenzar otro trabajo y recuperar
las visitas pendientes. No hay un único flujo global persistido ni se atribuye
una etapa de la visita A a la B.

`verify-guided-multivisit.cjs`: PASS con dos vehículos/OT ficticios independientes,
Guardar/salir, segundo ingreso, dos pendientes, reanudación A y entrada directa
desde OT. Exactamente dos inserciones en el puerto de prueba. No es una prueba
de concurrencia transaccional multiusuario ni de Supabase alojado.

Preparación externa exclusivamente contractual (`ReviewedExternalIntake`): una
futura solicitud debe revisarse/reconciliarse por administrador autorizado y
materializar IDs de cliente/vehículo existentes antes de abrir el recorrido. El
review_id, actor, taller y vínculo deberán comprobarse en servidor; un booleano
`reviewed` enviado por navegador no autoriza nada. No se agregó endpoint, formulario
público, registro automático, tabla, flag ni funcionalidad de registro externo.

### Archivos exactos del candidato local

- `AGENTS.md`
- `agent.md`
- `docs/checkpoints/CHECKPOINT_BT_FLOW_UX_01_20261124.md`
- `roadmap.md`
- `scripts/verify-guided-browser.cjs`
- `scripts/verify-guided-multivisit.cjs`
- `scripts/verify-guided-scenes.cjs`
- `scripts/verify-official-bundle.mjs`
- `src/App.tsx`
- `src/clientes/Cp03PrivatePanel.tsx`
- `src/clientes/cp03PilotDirectoryView.tsx`
- `src/cp05/QuotePanel.tsx`
- `src/entrega/FlowLive02Panel.tsx`
- `src/entrega/WorkExecutionDraft.tsx`
- `src/entrega/executionPreview.test.tsx`
- `src/entrega/executionPreview.ts`
- `src/expedientes/FinalArchivePanel.tsx`
- `src/guided/GuidedWorkspace.tsx`
- `src/guided/guided.css`
- `src/guided/progress.test.ts`
- `src/guided/progress.ts`
- `src/official/OfficialPanels.tsx`
- `src/ordenes/Cp04OrdersView.tsx`
- `src/ordenes/Cp04PrivatePanel.tsx`
- `tests/harness/GuidedFixture.tsx`
- `tests/harness/main.tsx`
- `vite.config.ts`
