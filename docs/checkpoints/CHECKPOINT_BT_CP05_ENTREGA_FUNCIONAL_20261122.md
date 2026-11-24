# CP05 — entrega funcional coherente de cotizaciones (22/11/2026)

## Adenda de correo CP05 / BT-COM-01 · 23/11/2026

Propietario aprobó visualmente BT-COM-01 y autorizó su **despliegue manual de código en Render** junto con publicación de CP05 correo en `main` y la CI existente. Se agrega revisión humana para el correo de una revisión emitida con revalidación backend de contacto CP03, en vez de envío directo. No se habilitan Resend, SMTP, flags reales, SQL, Storage, Edge ni otros talleres. S4 integral y prueba de recepción real con email propio del propietario permanecen pendientes. La versión de producción debe confirmarse tras deploy real; no deducirla de este texto.

**Estado:** código local en `main`, sin push, despliegue ni cambios productivos.
**Base:** `f6937a1d4e03d14f9d66036ac56b2b78c1a4ee43`, comprobada y actualizada por
fast-forward. Se preservaron el PDF multipunto, S4I y `artifacts/` no versionados.
Este es el único checkpoint nuevo de esta entrega. El commit local de cierre
contiene este documento y los archivos enumerados; no existe CI nuevo remoto.

## Autorización y alcance

El titular pidió completar CP05 reutilizando `src/cp05/`, `server/cp05/` y SQL
existente. Autoriza preparación y validación local; **S4 integral pendiente impide
activar emisión, SQL, Storage y Edge alojados**. Correo permanece OFF. Sin ramas
nuevas, push/deploy, suscripciones/pagos, datos reales ni trabajo sobre CP04.

## Qué ya existía y qué se completó

| Capacidad | Base existente reutilizada | Aporte de esta entrega |
| --- | --- | --- |
| OT/cliente/vehículo | Repositorio autorizado y relación derivada de registros CP03/CP04 | Comprueba también OT exacta, revisión/taller/cliente/vehículo del snapshot y pertenencia de eventos |
| Borradores | RPC open/save, numeración por taller, UUID idempotente, versión optimista; SQL CP05 aplicado históricamente 17/11 | Una escritura confirmada no vuelve a presentarse como fallida si se rompe la lectura posterior; conciliación mediante GET, sin segundo RPC |
| Recuperación | Borrador en PostgreSQL + cambios locales por pestaña/usuario/taller, TTL 8h, limpieza al cerrar sesión | Conserva indicio de versión confirmada en la misma estructura temporal; distingue cambios locales de cambios ya guardados al recuperar |
| Partidas/IVA | Repuestos/insumos/servicios/mano de obra; cantidades ×100, precios netos enteros CLP, redondeo por línea e IVA 19 % | Se preserva algoritmo y validación cliente/SQL, con pruebas de concordancia; no se inventa otra base tributaria |
| Emisión | Reserva de snapshot, archivo privado, lectura de comprobación/hash, confirmación SQL, historial inmutable | Recuperación explícita de una emisión ya completada, por actor/cotización/versión, verificando sus bytes originales; no vuelve a renderizar ni sobrescribir |
| PDF | Plantilla oficial R3 vectorial y logo ByteTorque, borrador claro, render determinista | Sin rediseño; recursos cargados solo cuando hay que renderizar, por lo que un PDF ya emitido se recupera aunque el renderizador/recursos actuales fallen |
| Archivo/historial | Backend candidato de Storage privado append-only, SHA-256, descarga autorizada, snapshots/revisiones/eventos | Vista de contenido congelado: partidas, importes, condiciones, observaciones y vigencia de cada revisión, sin ediciones habilitadas |
| Escritorio/móvil | Diseño R2 y editor existentes | Casos nuevos de fallo tras guardar, conciliación y consulta de historial probados en Chromium 390/1366 |
| Correo | Código candidato y gates existentes | No activado, proveedor real no contactado; tests heredados utilizan únicamente dobles sintéticos |

No se reconstruyeron cotizaciones ni se alteró CP04, el cálculo compartido de
importes, las migraciones ya aplicadas o los documentos de inspección.

## Persistencia: qué se puede afirmar

- La creación/edición/recuperación de borradores **ya tenía persistencia Supabase**
  en SQL CP05 y una prueba alojada histórica con QA1234, según los checkpoints
  previos. No se repitió esa operación ni se consultaron datos reales hoy.
- Esta entrega demuestra persistencia **en PostgreSQL 17 local real**, con nueva
  conexión después del guardado, concurrencia de numeración, RPC idempotentes,
  snapshots inmutables y permisos. No depende de sessionStorage para el guardado.
- El recorrido React/SDK utiliza **HTTP sintético**, incluido logout/login. Los
  cambios temporales de pestaña son solo recuperación auxiliar, nunca autoridad
  ni una confirmación de guardado en servidor.
- PDF de borrador es descargable localmente. Emisión/archivo/descarga histórica
  alojados **NO se declaran operativos**: faltan S4, bucket/políticas, función,
  nuevo SQL de recuperación y autorizaciones. Los tests de Storage usan memoria
  sintética; el laboratorio SQL utiliza recibos sintéticos explícitos.

## Implementación de conciliación

`QuoteReadPending` contiene solo ID y versión devueltos por un RPC confirmado.
Si falla la lectura, el editor conserva sus datos y pausa escritura/emisión;
«Recuperar operación confirmada» ejecuta una lectura autorizada. El indicio de
versión no concede acceso. Pérdida de membresía, sesión o repositorio descartado
permanece `denied` y retira contenido; nunca se degrada a permiso temporal.

Cuando el bundle ya se recuperó y solo falla el listado, la UI conserva el bundle
confirmado y diferencia el error de listado del guardado. La idempotencia existente
sigue protegiendo respuestas RPC ambiguas: no se generan IDs nuevos por un simple
reintento. En producción una respuesta RPC perdida aún exige conciliación, no
asumir éxito ni afirmar que nunca se podrá perder una respuesta.

## SQL y Edge preparados, no instalados

`docs/sql/BT_CP05_COMPLETED_ISSUE_RECOVERY_CANDIDATE.sql` es aditivo sobre CP05:
función privada de lectura, wrapper público SECURITY INVOKER y ejecución
exclusiva `service_role`; usa el autorizador existente con actor confirmado y
membresía de escritura. Clave de consulta: taller/cotización/versión/actor.
Índice único parcial para solicitudes completadas; no reescribe historia ni
modifica estados/recibos. Si hay datos previos incompatibles, no forzar el índice.

El backend verifica primero visibilidad de la cotización bajo RLS, consulta una
emisión completada, recupera el PDF por ruta canónica y valida SHA/tamaño antes
de responder. Si no existe, conserva el flujo previo de reserva/render/archivo/
finalización. El SQL de recuperación debe aprobarse/instalarse **antes** del nuevo
backend; si falta, este falla cerrado. No hay compatibilidad silenciosa que omita
esta comprobación. Reservas pendientes con bytes en conflicto siguen bloqueadas;
no se adoptan ni sobrescriben archivos desconocidos.

Se ensambló y verificó el paquete offline en
`/tmp/bytetorque-cp05-functional-candidate`: JWT obligatorio, recursos/versiones
fijados y licencia. Es artefacto revisable, no un despliegue; runtime Deno alojado
no certificado. Se conservan las políticas Storage candidatas y los gates OFF.

## Verificación consolidada y evidencia

- **66/66 pruebas CP05 PASS, 6 archivos**. Incluyen los nuevos casos de lectura
  fallida tras RPC, retirada de autorización, recuperación de emisión completada
  sin renderizador, archivo ausente/corrupto, limpieza/ámbito de borradores y las
  pruebas pertinentes existentes de IVA, PDF, inmutabilidad, mecánico y permisos.
- PostgreSQL local aislado sin red: `CP05_LOCAL_RLS_HISTORY_PASS`,
  `CP05_ANON_EMAIL_WORKSHOP_RECEPTION_PASS`,
  `CP05_COMPLETED_ORIGINAL_SNAPSHOT_RECOVERY_PASS`,
  `CP05_FRESH_CONNECTION_PERSISTENCE_PASS`, `CP05_CONCURRENT_NUMBERS_PASS`.
  Bootstrap CP03/CP04 solo como dependencia de esquema; no pruebas multipunto.
- TypeScript y builds público/CP05 privado con documentos candidatos: **PASS**,
  incluidos grafo público, exclusión de fixtures e identidad PWA/marca. Flags
  solo para procesos locales, correo false; no .env/flags alojados modificados.
- Paquete Edge offline y verificador: **PASS**, sin red ni despliegue.
- Navegador: 390 completó conciliación sin otro RPC, PDF real, recarga, logout/
  login y recuperación del borrador. 1366 comprueba listado fallido después de
  guardar y consulta histórica inmutable. **390 y 1366 PASS**, sin overflow ni errores JS; ambos consultan el historial
  congelado sin alterar condiciones actuales. Se repitieron solo casos afectados
  después de corregir fixtures, no la batería consolidada completa.
- No se repitió la suite general, auditorías S4I ni las 47 pruebas multipunto.

Evidencia sintética: `/workspace/work/cp05-functional/` (`unit.txt`, `postgres.txt`,
`edge.txt`, `build-public.txt`, `build-private.txt`, logs de navegador y capturas).
PDF de borrador creado desde React: `browser-mobile-history-final/cotizacion-browser.pdf`.
Artefactos temporales, sin clientes reales, secretos ni información de producción.

## Incidentes comprobados y soluciones

- **CP05-FUNC-01 (código base):** lectura después de RPC o listado fallido impedían
  instalar el resultado confirmado y mostraban «No se confirmó el guardado».
  Causa comprobada en repository.command/QuotePanel.action. Solución:
  `QuoteReadPending`, indicio de versión, pausa de edición, GET de conciliación;
  instalar el bundle antes de actualizar listado. Tests unitarios y móvil PASS.
- **CP05-FUNC-02 (código base):** reintentar una emisión completada volvía a
  renderizar. Aunque PDF es determinista para iguales recursos, un recurso/
  renderizador cambiado podía fallar o entrar en conflicto con el archivo
  original. Solución SQL/Edge aditiva de recuperación completada y assets lazy;
  test conserva bytes, rechaza archivo faltante y no contacta proveedor. PASS.
- **CP05-TEST-01:** primer recorrido nuevo agotó 30 s esperando conciliación.
  Fixture emitía un único HTTP 503 y el SDK lo reintentó hasta recibir 200.
  Causa confirmada en postgrest-js: RETRYABLE_STATUS_CODES=[520,503]. Cambiado
  solo el fallo sintético a HTTP 400 con código no clasificado; no cambian
  reintentos productivos ni umbrales. Caso 390 pasó sin RPC adicional.
- **CP05-TEST-02:** aserción inicial del historial esperaba cero botones; el
  WorkItemsTable reutilizado muestra siete botones deshabilitados para tres
  partidas. Se comprueba cero botones habilitados, manteniendo readOnly y
  permisos servidor. No se modifica el componente compartido ni CP04.
- **CP05-TEST-03:** typecheck inicial detectó tipos demasiado estrechos de errores
  y del mock RPC en nuevas pruebas. Se corrigió el doble sintético, no la SDK;
  TypeScript y compilaciones consolidadas posteriores PASS.
- **CP05-TEST-04:** el selector exacto global de «Condiciones» no resolvió tras
  recuperar el textarea con contenido. DOM capturado: status draft, dos textareas,
  sin alertas y condiciones vigentes intactas. Se selecciona el textarea del
  fieldset CP05 y se conserva la comparación exacta del valor. Escritorio y móvil
  PASS, con captura del historial, sin modificar el control compartido.

## Archivos exactos de esta entrega

1. `src/cp05/contracts.ts`
2. `src/cp05/repository.ts`
3. `src/cp05/repository.test.ts`
4. `src/cp05/temporaryDraft.ts`
5. `src/cp05/temporaryDraft.test.ts` (nuevo)
6. `src/cp05/QuotePanel.tsx`
7. `src/cp05/cp05.css`
8. `src/cp05/documentClient.ts`
9. `src/cp05/pilotDocuments.test.ts`
10. `server/cp05/issuanceCandidate.ts`
11. `server/cp05/supabasePortsCandidate.ts`
12. `server/cp05/documentHandlerCandidate.ts`
13. `docs/sql/BT_CP05_COMPLETED_ISSUE_RECOVERY_CANDIDATE.sql` (nuevo)
14. `scripts/security/verify-cp05-local.sh`
15. `scripts/security/bt-cp05-completed-assertions.sql` (nuevo)
16. `scripts/verify-cp05-browser.cjs`
17. `docs/BT_CP05_ENTREGA_FUNCIONAL.md`
18. `docs/checkpoints/CHECKPOINT_BT_CP05_ENTREGA_FUNCIONAL_20261122.md` (único checkpoint nuevo)
19. `agent.md`
20. `roadmap.md`

## Puertas siguientes y autorización necesaria

1. Revisar/autorizar la publicación del commit local en main; sin push ni deploy
   en esta entrega. Mantener Render OFF, sin cambiar su configuración.
2. **Completar S4 integral y obtener autorización específica** para instalar
   únicamente el nuevo SQL CP05 de recuperación y los prerrequisitos que realmente
   falten. No reaplicar la migración CP05 histórica ni migraciones PLAN04 por
   deducción; no tocar Auth/RLS alojados fuera del cambio aprobado.
3. Autorizar bucket privado `cp05-quote-documents`, MIME PDF, 20 MB, políticas
   backend-only candidatas; revisar acceso público/directo antes de habilitar.
4. Autorizar despliegue/configuración de `bt-cp05-documents` y secretos solo en
   backend. Archive true únicamente tras validaciones; **email false**, sin
   requerir credenciales de correo para emitir/descargar. No pedir valores al chat.
5. Autorizar actualización del frontend y gate de documentos después de verificar
   backend. QA alojada controlada A/B, mecánico/revocación, guardado/relogin,
   emisión/reintento, descarga íntegra e historia tras cambiar el borrador;
   Safari/iPhone físico y aceptación operativa de Ignacio pendientes.

No se modificaron Supabase, SQL/Storage/Edge alojados, Render, secretos, datos,
Auth, políticas, correo, pagos, CP04 ni CP06. No cuentas/concesiones para Ignacio,
respaldo, exportación ni restauración realizados. No se certifica piloto con
clientes reales ni recuperación integral por aprobar un laboratorio CP05.


## Adenda única — QA aprobada y rediseño compacto (23/11/2026)

### Aprobación funcional del propietario

**CP05 APROBADO EN QA** por el titular: emisión real de una **cotización ficticia**
en bytetorque.cl, `COT-000001`, Taller ByteTorque de Pruebas, vehículo `QA1234`,
revisión 1, total histórico **$107.411 CLP**. Mensaje confirmado por él: «Revisión
emitida y archivo privado verificado»; emitida/inmutable, historial visible y botón
«Descargar PDF emitido» disponible. Se registra avance del proyecto, sin editar
estados ni consultar datos productivos. **No** se atribuye descarga efectiva,
restauración S4 integral, recepción de correo ni habilitación de clientes reales.
Correo externo OFF y restricción al taller QA permanecen. Las secciones anteriores
«no activado» describen el estado histórico del 22/11; esta adenda actualiza
únicamente el avance QA evidenciado, sin declarar despliegue del rediseño.

### Implementación local, fuente y alcance

Base main/origin/main `ec5a665be5741466a3e9f351b31a1de029b24500`, fast-forward sin
sobrescribir trabajo previo. Se conservan .github manuales, backend QA, JWT,
allowlist, CORS, RLS, archivos y motor PDF. **No push/deploy autorizado**.

- Cabecera compacta sticky en flujo normal con número, cliente/vehículo,
  estado confirmado, revisión/versión, total CLP y acciones según estado.
  Se retira el output flotante; el total pasa a la cabecera y no tapa controles.
- Guardar/recargar/PDF/emitir siguen usando los handlers y bloqueos existentes.
  Emitida: acceso superior inmediato al PDF de la revisión confirmada, historial
  y nueva revisión (solo roles habilitados). Reserva pendiente/operación sin
  lectura conciliada mantienen sus bloqueos y confirmaciones originales.
- Pestañas accesibles Trabajos y repuestos / Condiciones / Historial: roles
  tablist/tab/tabpanel, relación ARIA, foco roving, flechas/Home/End. Paneles
  ocultos permanecen montados para conservar formularios y cambios sin enviar;
  no cambian URL, documento ni permisos, ni agregan consultas al navegar.
- Listado y cabecera utilizan el mismo bundle confirmado: `workspaceQuotes`
  sustituye la fila seleccionada obsoleta sin modificar datos. No inventa estado
  emitido por pulsar el botón: espera lectura autorizada/confirmación existente.
- Historial: selector compacto y un único detalle de snapshot en el área principal,
  lateral en anchos amplios. Partidas/importes/condiciones/observaciones congeladas,
  PDF autenticado e integridad visibles; eventos/envíos en disclosures compactos.
  Iconos editar/eliminar/agregar se ocultan solo en CP05 de lectura, sin modificar
  el componente compartido ni su lógica de autorización.
- Contenido con altura acotada y scroll interno, controles en cabecera y navegación
  responsive; origen/cambio de OT colapsado en celular al tener una cotización.
  Colores, tipografía, superficies y radios mantienen R2. Comunicaciones permanecen
  desactivadas y separadas de las acciones esenciales; no se cambian flags.

### Archivos del rediseño

1. `src/cp05/QuotePanel.tsx`
2. `src/cp05/cp05.css`
3. `src/cp05/QuoteHistory.tsx` (presentación nueva; reutiliza tabla/modelo)
4. `src/cp05/workspacePresentation.ts` (reconciliación visual pura)
5. `src/cp05/workspacePresentation.test.ts`
6. `scripts/verify-cp05-browser.cjs` (recorridos afectados actualizados)
7. `tests/harness/cp05BrowserFixture.cjs` (HTTP sintético CP05 reutilizado)
8. `AGENTS.md`
9. `agent.md`
10. `roadmap.md`
11. Este checkpoint existente; no se crea otro.

### Validación consolidada

Resultados en `/workspace/work/cp05-compact/`; solo datos sintéticos, nunca nuevas
emisiones alojadas ni pruebas CP04/S4. Las pruebas de navegador emplean SDK/React
reales y respuestas HTTP/Edge interceptadas. En modalidad QA, el fixture usa el
renderer R3 existente para producir PDF desde un snapshot sintético; la descarga
se compara byte por byte. No es nueva QA productiva ni ensayo de Storage alojado.

- Pruebas focalizadas de presentación, repositorio/guardia QA, selección y borrador:
  **15/15 PASS en 4 archivos**.
- TypeScript + builds público/privado: PASS, con verificadores de grafo, PWA,
  exclusión de fixtures y marca. Flags solo para procesos locales de compilación;
  no se modifica .env, configuración Render ni valores alojados.
- **6 recorridos Chromium PASS**: OFF 390/1366 y QA simulado 360/390/768/1366.
  Teléfonos a 780 px de alto. Pestañas preservan formulario incompleto y condiciones,
  navegación por teclado, subtotal $90.261 + IVA $17.150 = $107.411 CLP,
  guardado confirmado y reconciliación sin duplicar RPC, PDF de borrador real,
  emisión/descarga HTTP simuladas con bytes idénticos al PDF R3 generado, estado
  R1/Emitida consistente, acciones de lectura sin editar/eliminar, correo bloqueado,
  nuevo borrador sin alterar snapshot y selección local entre dos revisiones.
  Sin errores JS ni desborde horizontal. Scroll interno y externo comprobados:
  área de contenido debajo del dock y botón de cambio de origen sin obstrucción.
  Capturas móviles/escritorio inspeccionadas; el PDF emitido es visible arriba.
- Correcciones tras fallos: especificidad CSS móvil antigua imponía `display:flex`
  al contenedor de editar/eliminar; selector de lectura CP05 más específico lo
  oculta. Scroll externo podía pasar el cambio de origen bajo el dock: layout
  anclado debajo de altura observada, con altura interna que reserva navegación
  móvil. No se modifica el editor compartido ni la autorización.
- Ajustes de fixture: lectura fallida usa HTTP 400 no reintentable para verificar
  reconciliación explícita; al simular una revisión externa con cambios locales,
  el test acepta el diálogo original de descarte antes de recargar. No se suprime
  la confirmación en producto. Guardar conserva la pestaña; crear/nueva revisión
  vuelve a Trabajos. Una invocación local de build con flags incompletos fue
  rechazada por la guarda vigente; repetida con los nombres `_PRIVATE_ENABLED`
  correctos, sin cambiar configuración ni código de la guarda.

Reproducción focalizada: `npm test -- src/cp05/workspacePresentation.test.ts
src/cp05/repository.test.ts src/cp05/quoteSelection.test.ts
src/cp05/temporaryDraft.test.ts`. Navegador: `node scripts/verify-cp05-browser.cjs`
con `CP04_BASE_URL` apuntando al harness loopback (se reutiliza su shell, sin
probar CP04), `CP05_WIDTHS=390,1366` para OFF y `CP05_QA_DOCUMENTS=true`,
`CP05_WIDTHS=360,390,768,1366` para el harness con documentos y taller sintético
habilitados. `OUTPUT_DIR` debe apuntar fuera del repositorio. Estos flags de prueba
no habilitan funciones en producción.

### Causas comprobadas y límites

- **CP05-UX-01:** el crecimiento vertical se debía al render simultáneo del editor,
  condiciones, acciones, todos los detalles históricos y trazabilidad. Se separa
  presentación en pestañas persistentes y se acota el área de trabajo; sin tocar
  emisión, modelos o persistencia.
- **CP05-UX-02:** `documentAction` actualizaba bundle, pero no la lista independiente
  de cotizaciones. Una fila anterior podía seguir R0/Borrador mientras la cabecera
  ya recibía R1/Emitida. Solución visual pura desde el bundle confirmado, probada
  con lista obsoleta y refresco ausente; no se escriben estados por frontend.
- QA anterior queda aprobada en su alcance. No se promete continuidad ante cierre
  forzado/recarga completa más allá de borradores existentes. WebKit/Safari físicos
  y aprobación visual del propietario del nuevo diseño siguen pendientes.

No se modificaron Supabase, SQL, Storage, Edge, secretos, Render, emisión, correo,
pagos, CP03/CP04/CP06, documentos PDF ni seguridad S4/S4I. No se repitieron sus
pruebas/auditorías. Entrega en un único commit local de `main` con asunto:
`feat(cp05): compact quote workspace and record owner QA approval [skip render]`.
Base `ec5a665be5741466a3e9f351b31a1de029b24500`; el SHA final se identifica mediante
`git log -1` y se entrega al titular. Publicación y despliegue posteriores requieren
autorización; esta entrega no incluye push ni deploy. Se conserva `artifacts/`
preexistente sin incorporarlo al commit.


## Adenda única — reparación focalizada del selector CP05 (24/11/2026)

### Continuidad y autorización

El titular confirma CP04 aprobado funcional y visualmente en producción; CP04 y
SEC07 permanecen cerrados. Autoriza repositorio público temporal hasta renovar
minutos GitHub Actions, sustituyendo la restricción privada. Se publican primero
solo los cuatro documentos CP04 pendientes (`f2b528e` + aceptación del titular)
en `3f5d962086a678cf7b7a1495f76fea64512e7bdf`, por avance rápido sobre remoto
`bf2d0ef...`. No se toca Render: LIVE sigue en `bf2d0ef...`, Auto-Deploy OFF.

La implementación funcional CP05 parte de ese main publicado y está autorizada
**únicamente de forma local**. Ningún código de esta adenda se publica o despliega
sin aprobación posterior. No se crean ramas, tablas, migraciones ni checkpoints.

### Causa comprobada

`useWorkspaceNavigation` conserva hasta cinco paneles montados y cambia `hidden`/
`inert` al navegar. `QuotePanel` cargaba órdenes junto a la lista de cotizaciones
solo en el efecto `[repository]`. La instancia del repositorio se conserva al ir
a CP04 y regresar, así que el selector quedaba con la instantánea inicial y no
incluía una OT recién creada. El ingreso directo desde una OT cambiaba la key del
contexto y ocultaba el problema al montar otro panel.

No se trataba de una pérdida del registro alojado ni requería rehacer módulos,
añadir tablas, cambiar RLS o ejecutar una migración.

### Corrección y alcance exacto

- `src/App.tsx`: pasa `isActive={navigation.screen === 'informes'}` al panel CP05
  conservado. Se usa la pantalla activa real, no la variable de cada vista montada.
  No cambia keys, historial del navegador, foco ni conservación de módulos.
- `src/cp05/Cp05PrivatePanel.tsx`: propaga ese dato por el binding autenticado hasta
  `QuotePanel`. El binding conserva sus dependencias y su ciclo de dispose; no se
  reemplaza el repositorio para provocar una recarga artificial. Valor por defecto
  true mantiene los consumidores que no usan navegación conservada.
- `src/cp05/QuotePanel.tsx`: separa la lectura de órdenes del inicio de cotización.
  Al entrar/reingresar, o reintentar, consulta `repository.orders()` existente,
  conserva el filtro de vehículo y actualiza únicamente las opciones del selector.
  No toca bundle, borrador, partidas, condiciones, edición incompleta o ID elegido.
- Carga, error y reintento del selector no bloquean guardar/editar el borrador.
  Durante lectura fallida o pendiente no se puede crear desde un listado no
  actualizado. Una respuesta anterior no se aplica después de ocultar/salir del
  panel, cambiar binding/filtro o iniciar otra lectura. Sin polling ni listeners
  globales de focus ni consultas en cada render.
- Si la OT elegida ya no aparece entre las 40 recientes, una opción contextual
  conserva su ID y explica que está fuera del listado. No se elige automáticamente
  la primera OT ni se modifica el vínculo de la cotización. Sigue siendo el backend
  existente quien valida crear/recuperar y la elegibilidad real de la fuente.
- Una denegación del port CP04 se traduce a la denegación CP05 existente, limpia
  datos/borrador local según su comportamiento previo y también la OT seleccionada.
  El mensaje no promete conservar el borrador cuando se revocó el acceso.
- `src/official/useWorkspaceNavigation.ts` revisado y **sin cambios**: se aprovecha
  su estado actual. Repositorios, SQL, Auth/RLS, emisión, PDF, permisos por taller,
  planes, CP04, SEC07, Edge, Storage, variables y correos sin cambios.

### Validación consolidada y evidencia

- **21/21 pruebas PASS**, seis archivos existentes: repository, quoteSelection,
  temporaryDraft, workspacePresentation, privateScreen, privateScreenRendering.
  Alcance: guardas por identidad/taller/rol, recuperación y selección, proyección
  confirmada y navegación privada. No se repiten auditorías CP04/SEC07.
- **Build público y privado PASS**, TypeScript, exclusión de fixtures, grafo de
  módulos y marca/PWA. El build privado final incluye la limpieza de OT denegada.
  Configuración solo por variables del proceso de compilación, sin escribir .env
  ni modificar variables alojadas. Sin cambios de diseño CSS o assets.
- **2/2 recorridos de navegador PASS**, anchos 390 y 1366. Script nuevo focalizado
  `scripts/verify-cp05-order-selector.cjs`, reutilizando `cp05BrowserFixture` y
  `cp04BrowserFixture` con React/SDK reales y HTTP completamente simulado.
- Cada ancho abre primero el selector general, crea dos vehículos ficticios
  QS8001/QS8002 y dos OT nuevas mediante la recepción existente, y verifica que
  ambas aparecen al volver sin recarga del documento. No se realizan inspecciones
  ni auditorías CP04: solo se usa recepción para preparar las fuentes sintéticas.
- Mismo nodo del selector y de formularios; partida de 2 × $15.000 y total $35.700,
  texto de partida sin confirmar, condiciones y OT seleccionada permanecen al
  cambiar de sección. No se vuelven a leer cotización/historial ni se emiten RPC
  de cotización por entrar al módulo.
- Lectura fallida: selector/crear bloqueados, edición/guardar disponibles; reintento
  recupera opciones sin tocar el borrador. Respuesta antigua suspendida y nueva
  lectura completada: liberar la antigua no oculta la OT más reciente.
- Guardado/recuperación explícitos conservan la relación cotización/OT/vehículo;
  condiciones se recuperan de la respuesta persistida sintética. La prueba no
  acredita una escritura nueva en PostgreSQL alojado.
- Revocación sintética: la lectura guardada se deniega, desaparecen datos de la
  cotización, opciones y selección previa; no hay RPC de escritura posterior.
- Sin errores JS ni desborde horizontal. Capturas escritorio/móvil inspeccionadas
  en `/workspace/work/cp05-selector/selector-{390,1366}.png`.
- Incidentes corregidos en esta validación: búsqueda exacta de label que incluía
  texto de sus opciones → selector del control existente; opción contextual de OT
  retenida tras acceso denegado → limpieza explícita de `orderId` en esa rama.
  No se deshabilitaron comprobaciones para obtener PASS.

Comandos focalizados:
`npm test -- src/cp05/repository.test.ts src/cp05/quoteSelection.test.ts
src/cp05/temporaryDraft.test.ts src/cp05/workspacePresentation.test.ts
src/official/privateScreen.test.ts src/official/privateScreenRendering.test.tsx`.

Harness loopback 5240 con Auth R1/CP03_PRIVATE/CP04_PRIVATE/CP05_PRIVATE true;
`CP04_BASE_URL=http://127.0.0.1:5240 CP05_WIDTHS=390,1366
OUTPUT_DIR=/workspace/work/cp05-selector node scripts/verify-cp05-order-selector.cjs`.
No credenciales reales, exportaciones, restauraciones o llamadas autenticadas
al proyecto alojado. Logs/capturas y `artifacts/` preexistente no se versionan.

### Entrega local y siguiente permiso

Ocho archivos de esta entrega: `src/App.tsx`, `src/cp05/Cp05PrivatePanel.tsx`,
`src/cp05/QuotePanel.tsx`, `scripts/verify-cp05-order-selector.cjs`, `AGENTS.md`,
`agent.md`, `roadmap.md` y este checkpoint existente. Un único commit local:
`fix(cp05): refresh authorized order selector on workspace return [skip render]`.
El SHA final se entrega al titular y se obtiene con `git log -1`.

Pendiente aprobación para publicar la corrección funcional y, separadamente,
para desplegarla. No hay CI nueva de la corrección porque no fue publicada.
La publicación de documentación CP04 es anterior y no contiene este código.
CP04/SEC07 siguen cerrados, Auto-Deploy OFF; no ampliar el alcance por inferencia.
