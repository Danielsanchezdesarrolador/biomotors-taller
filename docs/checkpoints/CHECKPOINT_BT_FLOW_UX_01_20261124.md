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

## BT-FLOW-UX-01 — aprobación visual y publicación autorizada (24/11/2026, Chile)

El propietario aprueba visualmente `45a806e5c71133c1365b1fba626edb677f1ea371`
y autoriza publicarlo en main con las CI correspondientes. No se modifica código
ni se repiten pruebas locales. Sigue pendiente la idempotencia concurrente CP04:
createOrder no tiene request_id transaccional; la consulta previa y el bloqueo
local no garantizan ausencia de duplicados entre sesiones simultáneas.
Pendientes QA alojada y autorización de cualquier adaptación backend.
**NO DEPLOY; Auto-Deploy OFF. Sin cambios en Supabase, SQL, Edge, Storage,
variables, datos ni correo.** Esta autorización levanta solo el NO PUSH de esta entrega.

---

Base remota comprobada: `64616a4d9729a6ebfd6cac1012162a833f628a0b`;
publicación normal por avance rápido con el commit funcional original conservado.
CI: consultar por el SHA de publicación; no se declaran resultados antes de observarlos.


## R1 — QA humana alojada y corrección de experiencia (24/11/2026 Chile)

Render LIVE 3e3fef594a13c8e90fc8851c45bf1b3ba1bd410e, deploy dep-dc3363u7bikc73bttehg, 5/5 CI PASS. Propietario reporta cuatro defectos con capturas: scroll horizontal y vertical del modal, verde sobre etapa activa al volver, exceso de información y error genérico al intentar avanzar en aprobación. No se aprueba recorrido humano todavía.

### Diagnóstico del director (sin Codex)
- guided.css usa selectores descendientes genéricos .guided-dialog header/nav/footer/button que afectan componentes anidados, .guided-content overflow:auto, nav min-width:75px y overflow:auto; capturas evidencian desbordamiento y uso de panel CP03 completo con banner. El selector final [data-confirmed=true] b sobrescribe el azul activo. Corregir layout y alcance de selectores, no solo bajar font-size.
- GuidedWorkspace.tsx next() llama read(id) y verifica e.approval en paso 4; si falso lanza Error('unconfirmed') y run() produce exactamente el mensaje observado. El botón inferior no invoca la escritura del formulario. FlowLive02Panel mantiene una segunda acción Registrar declaración de aprobación más abajo, tras encabezados/avisos/consulta, y oculta formulario en overflow. El mismo patrón afecta otros pasos. No confundir falta de prerequisito con escritura fallida.
- Lectura SQL 01:04Z aproximada: COT-000004 issued R1, issue_pending=false, 0 aprobaciones/ejecuciones/entregas. Logs edge 01:00–01:10Z: GET historial 200, no POST de aprobación observado. Por ello la prueba mostrada no demuestra fallo de RPC ni confirma éxito real de corrección JSONB. No modificar datos ni SQL. Un primer intento de consulta usó nombre de tabla incorrecto bt_cp05_quotes (42P01); se verificó repositorio y consultó public.quotes correctamente en transacción read only.

### Encargo R1 (una entrega local integrada)
1. Modo guiado compacto propio para las ocho etapas: encabezado breve, barra 8 pasos visible en escritorio, resumen cliente/vehículo/OT humana (sin UUID largo), formulario central con columnas y pie permanente. Sin banners/headers/avisos duplicados ni panel completo de gestión. En 1366x768 y 1280x720 la ventana y sus acciones no tienen scroll horizontal/vertical; para 34 componentes, listas largas y móvil usar subgrupos/paginación y contenido adaptable accesible, sin reducir letra ilegiblemente ni recortar/ocultar campos requeridos. No cambiar paneles independientes. Selectores del shell limitados a hijos directos o clases dedicadas. En móvil 390 y tablet 768, todas las acciones accesibles, sin overflow horizontal, navegación interna razonable si necesaria. Conservar transiciones 200–350 ms y reduced-motion.
2. Estado visual activo azul incluso si confirmado; completado no activo verde con check, pendiente gris. No borrar evidencia al volver. Recepción previa muestra motivo/km confirmados en vez de campos vacíos deshabilitados. El selector de vehículo no debe permitir mezclar la OT anterior si se elige otro vehículo; reanudar explícitamente o reiniciar contexto con confirmación y guardas pendientes.
3. Aprobación compacta con propósito claro: registrar autorización real del presupuesto antes de ejecutar, cotización/revisión/total, medio, nota con ejemplo y declaración humana obligatoria. Mostrar solo lo necesario; aviso breve de que no es firma digital, detalles secundarios desplegables. Consulta automática del historial y opción discreta de actualizar. No eliminar validaciones, no simular aprobación ni marcar check por defecto.
4. CTA inferior debe orquestar la acción pertinente de cada paso por interfaz/callback explícito, reutilizando validaciones y métodos existentes (no DOM automation, no escrituras directas). En aprobación, guardar y continuar solo tras formulario válido, confirmación humana, RPC existente con requestId estable y relectura positiva; si ya registrada avanzar sin reescribir. En cotización preservar emisión/revisión explícita, en ejecución/entrega preservar confirmaciones, en archivo acción irreversible explícita. Guardar y salir no significa completar etapa; guardar lo permitido o explicar campos pendientes; distinguir falta de requisito (mensaje accionable), operación ambigua (conciliar lectura), denegación y fallo real. No reintentar RPC a ciegas. Deshabilitar avance solo cuando proceda y mostrar razón junto a CTA. Si no hay respuesta confirmada no avanzar. Conservar aislamiento y límites QA.
5. Pruebas focalizadas: aprobar con datos válidos llama una sola RPC, avance después de relectura, requisito faltante no genérico, respuesta ambigua no duplicada, aprobación ya registrada sin escritura, vuelta activa azul, recepción confirmada y selección cruzada protegida, layout 1366x768/1280x720/768/390 sin overflow de shell y formularios accesibles. Reutilizar harness y mock ports; TypeScript/build público y privado una vez según alcance; prueba humana posterior sobre COT-000004 y continuidad hasta EXP. No repetir SEC07, backups ni CI aprobada. Sin nuevas tablas, permisos, flags, correo o infra. NO PUSH funcional ni deploy. Registrar resultados aquí, no abrir microetapas.

## R1 — entrega local de corrección integrada (24/11/2026, Chile)

Base `d17ece4e731db1209eb587981513f88a5dfb22d4`, sincronizada por fast-forward.
Diagnóstico del director utilizado sin repetir investigación alojada. Estado:
candidato local para aprobación del propietario; QA humana productiva todavía pendiente.

### Correcciones implementadas

- Shell con selectores directos de cabecera/nav/footer: ya no cambian los headers
  y controles de módulos anidados. Modo guiado específico para las ocho etapas,
  sin los banners, acciones de gestión y UUID repetidos de los paneles independientes.
- Cliente/vehículo compactos, edición reutilizada y listas paginadas. Guardar desde
  el footer utiliza las mismas validaciones y operaciones del formulario. La selección
  se limpia al cambiar de ficha y se verifica contra servidor antes de crear OT.
- Recepción existente recupera motivo y kilometraje confirmados. Volver al primer
  paso de una OT existente muestra su cliente/vehículo vinculados y no permite
  seleccionar otro vehículo sobre esa OT. Otro ingreso requiere otra visita.
- Multipunto mantiene cola/autoguardado; muestra un sistema y página a la vez,
  con página más corta cuando hay observaciones técnicas. Cotización conserva
  editor, IVA, condiciones e historial; paginación por altura y emisión explícita.
- Aprobación breve: propósito, COT/revisión/total/estado, medio sin selección
  predeterminada en guiado, nota ejemplificada y confirmación humana obligatoria.
  Historial consultado automáticamente, actualización discreta y aviso de no firma.
- Callback explícito `registerSave` entre footer y formularios CP03/CP05/LIVE/EXP.
  Footer valida, llama operaciones existentes, espera y relee antes de avanzar.
  No automatiza DOM ni introduce un repositorio paralelo. La emisión y el archivo
  conservan confirmación explícita; los checks de operador nunca se marcan solos.
- LIVE concilia historial antes de escribir, conserva requestId estable, verifica
  el registro después de la respuesta y distingue validación, denegación, conflicto,
  desconexión y respuesta no confirmada. Una operación existente no se vuelve a escribir.
- Ejecución y entrega compactas reutilizan declaraciones y validaciones existentes.
  Guardar/salir no equivale a completar etapa. EXP abre la revisión exacta y conserva
  los tres originales; confirma manifiesto antes de mostrar éxito o repetir creación.
- Activo azul tiene prioridad sobre confirmado; otros confirmados verdes con check,
  pendientes grises. Retroceder no borra evidencia. Feedback y transiciones 250 ms,
  reduced-motion; footer permanece accesible, safe areas y visualViewport para teclado.
- Controles táctiles guiados de 44 px. Registro público, correo y roles no ampliados.

### Validación consolidada: resultados reales

- TypeScript y builds privado ON/público OFF PASS, con comprobación de exclusión
  de módulos privados/fixtures y guardas existentes de bundle.
- Vitest focalizado: **4 PASS, 14 SKIP** (proyección/alcance QA y regresión JSONB).
  No se relanzan suites históricas ajenas al cambio.
- Chromium: ocho etapas en **1366×768, 1280×720, 1920×1080, 360×800, 390×844,
  430×932, 768×1024 y 800×430**. Sin overflow horizontal de shell/contenido;
  en escritorios sin overflow vertical del shell, main ni área central con los
  fixtures probados. Móvil permite scroll interno necesario, con footer visible.
- Regresión funcional de aprobación: campos faltantes muestran mensajes concretos
  y cero RPC; formulario válido escribe una sola vez y avanza tras relectura.
  Volver conserva activo azul; aprobación ya existente avanza sin otra escritura.
- Respuesta perdida después del commit: siguiente intento concilia lectura y
  avanza sin otra RPC. Denegación y respuesta sin registro persistido no avanzan.
- Recepción guardada restaurada, selección cruzada bloqueada y dos visitas
  independientes reanudadas con exactamente dos inserciones en el fixture.
- EXP: footer confirma archivo una vez y un manifiesto existente no repite creación.
- Observaciones técnicas extensas/paginadas: comprobación focalizada en 1280×720
  y 390×844; campo accesible, cambio de página y escritorio sin desborde.
- Capturas de ocho etapas en 1366 y 390, revisadas en escritorio/móvil; validación
  de altura mínima de botones móviles. Evidencia y logs en `/workspace/work/flow-r1/`.

Durante la validación se corrigieron únicamente incidencias del cambio: cascada
heredada en toolbar/tablas, densidad en altura 720 y carrera entre apertura automática
de EXP y finalización de su consulta. La apertura ahora espera el fin de loading;
no se retiran guardas de generación/vida. Retests focalizados de esos casos PASS.

Comandos reproducibles: `node scripts/verify-guided-r1.cjs` y
`node scripts/verify-guided-multivisit.cjs` con el harness local ya disponible;
`BT_R1_FUNCTIONAL_ONLY`, `BT_R1_CAPTURE_ONLY` y `BT_R1_TOUCH_ONLY` limitan
subconjuntos para repetir solo lo afectado. No ejecutan servicios alojados.

### Límites y autorización pendiente

Pruebas con puertos/cliente ficticios en loopback: no certifican el recorrido
productivo COT-000004 ni descargas/Storage reales. Falta aprobación visual R1,
publicación autorizada/CI y QA humana alojada por el propietario. No se probaron
iPhone/Android físicos ni lectores de pantalla; las dimensiones son emulaciones
Chromium. Teclado se adapta mediante visualViewport, pendiente prueba física.

Idempotencia concurrente CP04 sigue pendiente: la consulta previa y el bloqueo
local no garantizan atomicidad entre sesiones. No se modifica ese backend.
Las listas/detalles largos se paginan o se consultan por páginas o scroll interno en móvil; no se
promete que un volumen arbitrario de datos o un comprobante SHA expandido quepa
en una pantalla. Se preservan borradores temporales existentes y progreso confirmado.

**SOLO LOCAL: NO PUSH/DEPLOY, NO SQL, Supabase, RLS, Storage, Edge, variables,
secretos, correos ni datos productivos. Auto-Deploy OFF. JSONB, aislamiento y QA
owner/admin conservados. SEC07 y auditorías anteriores no se reabren.**

### Archivos exactos de R1

- `AGENTS.md`
- `agent.md`
- `docs/checkpoints/CHECKPOINT_BT_FLOW_UX_01_20261124.md`
- `roadmap.md`
- `scripts/verify-guided-multivisit.cjs`
- `scripts/verify-guided-r1.cjs`
- `src/clientes/cp03PilotDirectoryView.tsx`
- `src/cp05/QuotePanel.tsx`
- `src/entrega/FlowLive02Panel.tsx`
- `src/entrega/WorkExecutionDraft.tsx`
- `src/expedientes/FinalArchivePanel.tsx`
- `src/guided/GuidedWorkspace.tsx`
- `src/guided/guided.css`
- `src/informes/multipunto/MultipuntoTable.tsx`
- `src/informes/trabajos/WorkItemsEditor.tsx`
- `src/ordenes/Cp04MultipuntoChecklist.tsx`
- `tests/harness/GuidedFixture.tsx`
