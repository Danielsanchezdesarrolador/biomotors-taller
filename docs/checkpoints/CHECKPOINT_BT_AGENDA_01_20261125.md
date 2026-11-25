## 25/11/2026 — BT-AGENDA-01 SQL instalado OFF

El propietario autorizó expresamente continuar sin respaldo nuevo hasta la tarde. Excepción puntual: último conjunto DB+Storage verificado no incluye cuatro PDF posteriores; no se declara respaldo vigente ni recuperación completa. Actualizar conjunto cifrado esta tarde, incluyendo nuevos registros y objetos, sin repetir restauración SEC07. Migración registrada `20261125154009_bt_agenda_01_intake_and_scheduling_off`, desde candidato aprobado de `de599d539050225cb693f7af42830d89f67ca3ff` (DDL original, transacción del migrador, límites de espera). Postflight: 5 tablas RLS, recepción pública FORCE, 7 triggers, anónimo sin RPC, authenticated sin DML directo de recepción/fase, funciones anteriores inaccesibles a roles expuestos. 0 rollout, 0 planificadas, 0 recepciones; 4 OT, 4 cotizaciones, 1 manifiesto y 5 objetos PDF conservan sus conteos. Advisor INFO sin políticas de tablas privadas es intencional (acceso por RPC autorizadas), no se amplían permisos. Correo OFF. No se ha validado QA alojada.

**Siguiente inmediato:** ejecutar workflow manual [Agenda Edge](.github/workflows/bt-agenda-01-edge-manual.yml), confirmación `DESPLEGAR_AGENDA_EDGE_SQL_OFF_INSTALADO`, luego verificar versiones/JWT, desplegar frontend compatible OFF y habilitar solo taller QA. No se ejecutó workflow aún; no alterar secretos, datos históricos ni R2. Auto-Deploy OFF. Sin Codex.

---

## 25/11/2026 — Activación BT-AGENDA-01 autorizada, preflight SQL PASS; pendiente respaldo vigente

CI 5/5 SUCCESS en `de599d539050225cb693f7af42830d89f67ca3ff`, código visual aprobado. Propietario autoriza activación alojada secuencial exclusivamente QA. Lectura de PostgreSQL 17.11 confirma firmas CP05/EXP y dependencias, columnas y permisos esperados, Agenda ausente, cero emisiones pendientes, rollouts LIVE/REG/EXP exclusivamente QA y correo OFF. Hay tres objetos CP05 y dos de cierre; respaldo documentado 24/11 incluía un PDF, no cubre los cinco actuales. Antes de instalar SQL confirmar conjunto actualizado DB + Storage con el procedimiento existente; no repetir restauración SEC07 ni suites aprobadas. No se ha aplicado SQL ni desplegado.

Workflow preparado `.github/workflows/bt-agenda-01-edge-manual.yml`: manual, **no ejecutar antes de instalar y verificar migración con rollout OFF**. Checkout SHA fijo aprobado, hashes de fuentes y lockfile, npm ci, doble build de ambos paquetes y verificación de recursos/JWT, deploy secuencial CP05 y EXP sin tocar secretos. Confirmación DESPLEGAR_AGENDA_EDGE_SQL_OFF_INSTALADO. Conector GitHub sin dispatch; propietario lo ejecutará cuando se confirme SQL OFF. Posteriormente Render compatible OFF y activación exclusiva QA. Sin cambios funcionales, flags, Storage ni infraestructura alojada. R2 pausado.

---

## Publicación autorizada — 25/11/2026, Chile

Aprobación visual expresa del propietario para `30d03fe6fc96e0c80fd68ae2ad5212289715d284`.
Remoto verificado en `1161688e3c4ced40f5c9355140bd9faa9cfc52ba`, ancestro directo:
publicación por avance rápido, sin sobrescribir cambios. Se conserva íntegro el código
aprobado y se actualizan únicamente los cuatro documentos de continuidad. Resultados
previos ratificados: **29 pruebas focalizadas, 35 comprobaciones SQL/integración y
18 comprobaciones de navegador PASS**, sin repetir pruebas locales.
Agenda permanece OFF y ninguna activación alojada se ejecuta por esta publicación.
CI: consultar las ejecuciones del SHA final publicado; pendientes hasta su conclusión.
Las restricciones históricas NO PUSH que siguen abajo describen la entrega local
anterior y quedan sustituidas exclusivamente por esta autorización de publicación.

### Secuencia y flags de futura activación (requiere autorización independiente)

1. Confirmar respaldo actualizado y recuperación SEC07, incluyendo objetos Storage.
2. Aplicar únicamente `docs/sql/BT_AGENDA_01_CANDIDATE.sql`; requiere CP03/04/05,
   recuperación de emisión CP05, LIVE-02, REG-01 y EXP-01 existentes. No repetirlos.
   Mantener `bt_agenda_private.rollout.enabled=false` (sin filas ON).
3. Alinear y desplegar explícitamente **bt-cp05-documents** y **bt-final-archive**
   desde el código aprobado, utilizando sus empaquetadores oficiales y JWT activado.
   Mantener `BT_CP05_EMAIL_ENABLED=false`; no cambiar buckets ni políticas.
   La emisión requiere el gate previo `BT_CP05_ARCHIVE_ENABLED` autorizado; no se
   habilita aquí ni se presume autorización de cambiarlo. Los gates de lectura/escritura
   EXP deben conservar su configuración autorizada hasta la activación QA específica.
4. Desplegar frontend compatible con `VITE_BT_AGENDA_ENABLED=false`, conservando
   `VITE_BT_CP05_EMAIL_ENABLED=false` y Auto-Deploy OFF. Requiere gates privados
   Auth R1, CP03, CP04, CP05, CP06, CP05_DOCUMENTS, FLOW_LIVE_02, FINAL_ARCHIVE y
   RECORDS (`VITE_BT_*_ENABLED` según los nombres exactos de `vite.config.ts`).
5. Solo con autorización QA: configurar taller/zona IANA en rollout, activar su
   `enabled=true` y construir/desplegar frontend con `VITE_BT_AGENDA_ENABLED=true`.
   Validar el recorrido ficticio alojado antes del uso real. R2 sigue pausado.

Sin deploy, SQL alojado, modificaciones de servicios/variables/secretos, correos ni
regeneración de documentos históricos en esta etapa.

---

# BT-AGENDA-01 — Agenda y cotización anticipada (25/11/2026, Chile)

## Alcance y autorización

Base confirmada por propietario/director: `1161688e3c4ced40f5c9355140bd9faa9cfc52ba`, rama única `main`. BT-AGENDA-01 se crea en esta entrega, sin buscar un supuesto checkpoint anterior. Implementación y validación exclusivamente locales. NO PUSH, DEPLOY, SQL alojado, infraestructura, secretos, cambios de datos reales ni correos. Auto-Deploy OFF; R2 eliminación de aprobación PAUSADO. No se presume aprobación visual de esta entrega.

## Implementación

- Cotización anticipada desde Agenda, seleccionando cliente y vehículo CP03 existentes (búsqueda explícita, últimos 25 clientes y vehículos del cliente). El alta/edición del directorio sigue en CP03. El servicio prepara transaccionalmente una OT `intake_phase=planned` y abre/recupera la misma cotización con `bt_cp05_private.open_quote`. No se duplica el editor CP05 ni se inventa una recepción física. Partidas, IVA, condiciones, borradores, emisión y revisiones siguen en CP05.
- Aprobación expresa de la revisión emitida mediante el formulario existente LIVE-02, método, nota y confirmación humana. Es una declaración del operador, no firma ni aceptación electrónica del cliente. La aprobación continúa siendo obligatoria: R2 permanece pausado.
- Reserva pendiente (admite presupuesto emitido aún sin aprobación), confirmación (exige aprobación), reagendamiento con control de versión y cancelación con motivo. Cancelar la cita conserva OT, cotización y documentos; no declara reparación ni anula silenciosamente el presupuesto.
- Calendario semanal/diario, días navegables, selector de fecha, Hoy, cuatro indicadores reales, próximos diez servicios y detalle. Escritorio y móvil reutilizan AppShell/R2, hero existente, iconos vectoriales, azul corporativo, tarjetas, estados y modal accesible. En móvil: tres indicadores, tarjetas cronológicas, botón Agendar y navegación Inicio/Agenda/Clientes/Más; Más abre el menú existente. Citas simultáneas se apilan y siguen siendo independientes; no se inventa un límite de capacidad.
- Recepción con kilometraje, motivo y confirmación humana. Una transacción registra evidencia inmutable y cambia la misma OT de planificada a recibida. No modifica `opened_at` histórico de la solicitud: `intake_received_at` conserva la recepción real. Reintentos recuperan la misma OT. Las solicitudes planificadas no aparecen como vehículos recibidos en los selectores/listados operativos CP04; CP06 las identifica como solicitudes anticipadas.
- Tras recibir, se retoma la etapa real del recorrido existente: inspección CP04, revisión/cotización CP05, aprobación, ejecución, entrega y expediente final. El recorrido guiado conserva su gate aprobado owner/admin+taller piloto; recepción y otros ámbitos continúan en Órdenes CP04, sin ampliar permisos del piloto. No se autoriza por esto el rollout de otros talleres.
- El snapshot futuro de una cotización anticipada incorpora `order.intake_phase=planned`. La cotización original permanece inmutable. Historial y archivo final exigen la recepción inmutable de la misma revisión/taller/OT/cliente/vehículo para usar fecha, kilometraje y motivo físicos. No se cambian diseño PDF, hashes ni originales emitidos. Revisiones posteriores a la recepción incluyen datos físicos al emitirse.
- Se mantiene el ingreso tradicional por diagnóstico. No hay registro público, cobro ni envío automático. Se reutiliza la autenticación y el SDK de la sesión; no existe un segundo cliente en producción.

## Persistencia y seguridad candidatas

Archivo: `docs/sql/BT_AGENDA_01_CANDIDATE.sql`, transacción única no aplicada a Supabase. Requiere los esquemas CP03/04/05, recuperación de emisión, LIVE-02, REG-01 y EXP-01 ya existentes; no vuelve a instalarlos en producción.

- Añade `work_orders.intake_phase` (default `received`, compatible con registros previos) e `intake_received_at` nullable. No inventa fechas de recepción para registros antiguos.
- Esquema privado `bt_agenda_private`: `rollout` (OFF sin filas de activación), `appointments`, `commands`, `events`; tablas con RLS y sin acceso directo de clientes. Índices de rango, unicidad por OT activa y claves foráneas. `public.bt_agenda_receipts`: lectura RLS por taller, escritura exclusivamente interna, append-only, índices y FK RESTRICT. Sin cascadas destructivas.
- RPC públicas SECURITY INVOKER `bt_agenda_catalog` y `bt_agenda_command`; implementaciones privadas SECURITY DEFINER con `search_path=pg_catalog`, autorización fresca de usuario confirmado/membresía activa/taller activo/rol owner-admin-reception y rollout explícito. Anónimo y mecánico sin operaciones de Agenda. Receipts se leen bajo los permisos históricos CP05; no amplían permisos de documentos ni acceso del mecánico a cotizaciones.
- Comandos con campos permitidos, actor obtenido de JWT, request_id ligado a actor/tipo/input, bloqueo transaccional del taller, control de versión, revisión emitida y aprobación vigente. Protección contra doble recepción y repetición concurrente de preparación. Horario IANA del taller, fecha local validada y rechazo de horas inexistentes por DST; citas entre ahora (tolerancia de cinco minutos) y dos años, duración 15–480 min. No reserva capacidad ficticia. En horario ambiguo de otoño PostgreSQL elige la interpretación estándar; la UI muestra la hora local y la duración, sin permitir elegir offset en esta entrega.
- Guardas impiden inspección, cambios físicos o ejecución/entrega en OT planificadas. REG sigue siendo autoridad para archivar/restaurar/cancelar; documentos y recepciones quedan protegidos por dependencias RESTRICT.
- Envuelve la preparación CP05 y la fuente EXP manteniendo sus firmas, autorización y privilegios; revoca las funciones anteriores renombradas. Los manifiestos completados siguen devolviendo originales sin regenerarlos.
- UI: `VITE_BT_AGENDA_ENABLED=false` por defecto. Build exige gates privados de Auth, CP03/04/05/06, documentos, LIVE, REG y EXP; módulos Agenda no entran en el build público/OFF. No polling. Refresco al volver al panel/foco; guardas de sesión y generación descartan respuestas obsoletas. Errores normalizados, sin mensajes SQL, credenciales ni datos internos del transporte. No datos de cliente ni secretos nuevos en localStorage; CP05 conserva su mecanismo existente de borradores y selección.

## Activación futura (NO ejecutada)

1. Revisar y aprobar candidato SQL/código/diseño y comprobar respaldo y recuperación SEC07 vigentes, incluidos objetos privados de Storage; PostgreSQL solo no contiene los PDF. La recepción nueva debe incluirse con el resto de tablas en el respaldo. No se hizo respaldo ni se cambió su procedimiento en esta entrega.
2. Con autorización específica, aplicar **solo** el SQL nuevo mediante el procedimiento aprobado, con rollout Agenda sin activar. No repetir migraciones antiguas. Verificar precondiciones/firmas contra la instancia real antes de aplicar; no se presume equivalencia absoluta del laboratorio.
3. Publicar código y CI únicamente con otra autorización. Preparar/alinear el paquete oficial `bt-cp05-documents` (nuevo marcador de snapshot) y `bt-final-archive` (recepción inmutable en fuente/cálculo del expediente) desde el mismo código. Los dos paquetes reutilizan motores y recursos existentes. El paquete final se construyó offline; su despliegue requiere autorización independiente. Mantener JWT y correo OFF; no modificar buckets ni permisos existentes para habilitar Agenda.
4. Desplegar frontend compatible con las columnas nuevas, todavía con Agenda OFF. Desplegar Edge compatible antes de permitir cotizaciones anticipadas; un backend antiguo no debe emitir o archivar una solicitud con la semántica anterior. Auto-Deploy sigue OFF.
5. Autorizar un taller QA concreto y su zona IANA en `bt_agenda_private.rollout`, activar gate del frontend y efectuar QA humana ficticia alojada antes de habilitar uso real. La recepción utiliza los gates previos de documentos y LIVE, sin activarlos silenciosamente.

### Reversión

Desactivar primero el rollout privado de Agenda bloquea sus comandos. No borrar citas, recepciones, ledgers, columnas ni guardas. Mantener una versión compatible de CP04/CP05/EXP que distinga solicitudes y recepción mientras existan filas planificadas. Desactivar simplemente el flag y volver a un frontend/Edge anterior puede mostrar una solicitud como recibida o usar la fecha errónea: **no es una reversión segura**. Atender las visitas ya recibidas mediante la versión compatible, conservar sus originales y revisar manualmente solicitudes abiertas antes de cualquier reversión estructural. No se proporciona un DROP destructivo ni se ejecutó rollback productivo.

## Límites conservados y pendientes

- Una única OT abierta por vehículo, restricción CP04 existente: si hay otro servicio activo se devuelve conflicto y se debe recuperar/cerrar/cancelar mediante los mecanismos autorizados. Sí admite múltiples vehículos/visitas simultáneos. Esta entrega hace idempotente la preparación anticipada; no declara resuelta la idempotencia concurrente del ingreso tradicional CP04.
- No se activó Agenda ni se comprobaron servicios alojados. Laboratorio Postgres 17 sin red; transporte PostgREST/Storage local de prueba, no una instancia Supabase alojada ni validación de navegador físico. Faltan aceptación visual del propietario, QA humana alojada y autorizaciones indicadas.
- No se añaden solicitudes externas públicas, pago, mensajería, selección de mecánico/capacidad, borrado automático ni reglas nuevas de suscripción.
- El catálogo limita la ventana a 42 días, próximos diez servicios y métricas de 30 días. Las solicitudes abiertas se consultan en el mismo taller; no hay polling ni nuevas suscripciones Realtime. Paginación adicional del catálogo para una escala mayor queda fuera del piloto actual.

## Validación y evidencias

- TypeScript y builds público/OFF y privado/Agenda ON: PASS, incluidos límites del grafo público, exclusión de fixtures, PWA e identidad de marca existentes. Prueba negativa: Agenda ON sin precondiciones privadas rechaza el build antes de emitir archivos.
- 29 pruebas focalizadas PASS en cinco archivos (Agenda, adaptación de expediente, evidencia histórica, repositorio CP04 y sección persistida). No se ejecutaron SEC07, auditorías generales ni las suites cerradas completas de CP04/CP05.
- 35 grupos PostgreSQL 17/integración PASS: instalación OFF, roles y talleres, campos falsificados, borradores/emisión CP05 con PDF real ficticio, aprobación de revisión vigente, reservas simultáneas, control de versión, cancelación, DST, bloqueo físico anterior a recepción, idempotencia, aislamiento, REG, expediente, integridad/readback de tres originales y repetición sin render/upsert. Dos procesos/sesiones PostgreSQL simultáneos recuperaron una sola OT y cotización. Se utilizaron diez vehículos ficticios; ocho presupuestos emitidos más borradores preparados.
- 18 comprobaciones de navegador PASS a 1440/1366/768/390: semanal, diaria, detalle sin UUID, reserva simultánea, reagendar y recargar, aprobación LIVE-02, confirmar cita, recibir y abrir inspección real, persistir recepción, abrir borrador CP05, crear solicitud anticipada desde el formulario, guardar una partida y recuperarla al volver, ajustes móviles/modales, cancelar y recargar, loading, vacío y error sin revelar detalle del transporte. Se completaron los pasos ya aprobados y los pendientes de forma focalizada; `browser-results.json` identifica diez comprobaciones previas y las continuaciones. No se presume una prueba de la infraestructura Supabase alojada a partir del transporte local.
- Paquetes oficiales CP05 y archivo final construidos offline en `/tmp/bt-agenda-evidence/`, con controles de recursos y JWT del empaquetador existente; sin deploy ni modificación de sus assets.
- `git diff --check`: PASS. Sin cambios en workflows, Render, SQL alojado, Storage, Edge desplegado, secretos, pagos o correo. Los interruptores nuevos siguen OFF; no se ejecutó CI remota ni push. Evidencias locales fuera del repositorio: `/workspace/evidence/bt-agenda-01/`. No se incorporan `artifacts/` preexistentes ni datos reales.


### Reproducción local

`npx vitest run src/agenda/agenda.test.ts src/entrega/finalPackage.test.ts src/historial/flowEvidence.test.ts src/ordenes/cp04Repository.test.ts src/official/privateScreen.test.ts`

`bash scripts/security/verify-agenda-local.sh` instala únicamente DDL previo y el candidato nuevo en un contenedor PostgreSQL 17 con `--network none`, sin puertos, contraseña sintética y eliminación al terminar. No ejecuta suites antiguas ni usa credenciales reales.

Para navegador, iniciar ese script con `BT_AGENDA_BROWSER=true`; mantiene un puente solo loopback `127.0.0.1:4179` sobre las RPC SQL reales. Iniciar `npm run dev:harness -- --port 47131` con los gates privados requeridos por `vite.config.ts`, `VITE_BT_AGENDA_ENABLED=true` y el ID del taller ficticio piloto de los fixtures. El SDK del harness usa solo loopback y no persiste sesión. Ejecutar `node scripts/verify-agenda-browser.cjs` con Playwright/Chromium disponibles. El adaptador HTTP/Storage es local de pruebas, no una implementación de producción. No abrir este harness a interfaces públicas; no introducir credenciales ni registros reales. Detener los procesos al finalizar.

`npm run build` valida el build público; para privado se habilitan solo en el proceso local los gates citados, sin escribir `.env` ni variables alojadas. `node scripts/package-cp05-edge.mjs <directorio-temporal-nuevo>` y `node scripts/package-final-archive.mjs <directorio-temporal-nuevo>` preparan paquetes, nunca despliegan.

### Evidencias visuales

Directorio local: `/workspace/evidence/bt-agenda-01/`, con `SHA256.json`.
Capturas: semanal/escritorio, diaria, detalle, nueva cita, aprobación, recepción,
inspección del recorrido, editor CP05, nueva cotización, 1366/768/390, modales,
viewport móvil, cancelación, loading, vacío y error. Datos inequívocamente ficticios.
El logo/hero y AppShell provienen del proyecto existente; se adaptan los mockups a
estados y datos reales. La grilla expande las horas con servicios simultáneos en
lugar de superponer tarjetas; el diario/móvil ofrece la lista cronológica. Aprobación
visual del propietario y QA en dispositivos físicos pendientes.

### Lista exacta de archivos de esta entrega

- `.env.example`
- `AGENTS.md`
- `agent.md`
- `roadmap.md`
- `scripts/verify-official-bundle.mjs`
- `src/App.tsx`
- `src/cp05/FlowLive02Loader.tsx`
- `src/cp05/QuotePanel.tsx`
- `src/cp05/contracts.ts`
- `src/entrega/finalPackage.ts`
- `src/guided/GuidedWorkspace.tsx`
- `src/historial/VehicleHistory.tsx`
- `src/historial/contracts.ts`
- `src/historial/flowEvidence.ts`
- `src/historial/repository.ts`
- `src/layout/AppShell.tsx`
- `src/official/OfficialPanels.tsx`
- `src/official/privateScreen.ts`
- `src/official/useWorkspaceNavigation.ts`
- `src/ordenes/cp04Contracts.ts`
- `src/ordenes/cp04Repository.ts`
- `src/styles.css`
- `tests/harness/WorkflowApp.tsx`
- `tests/harness/main.tsx`
- `vite.config.ts`
- `docs/checkpoints/CHECKPOINT_BT_AGENDA_01_20261125.md`
- `docs/sql/BT_AGENDA_01_CANDIDATE.sql`
- `scripts/build-agenda-lab.mjs`
- `scripts/security/verify-agenda-local.sh`
- `scripts/verify-agenda-browser.cjs`
- `src/agenda/AgendaPanel.tsx`
- `src/agenda/AgendaPrivatePanel.tsx`
- `src/agenda/agenda.css`
- `src/agenda/agenda.test.ts`
- `src/agenda/contracts.ts`
- `src/agenda/repository.ts`
- `tests/agendaLab.ts`
- `tests/harness/AgendaFixture.tsx`
