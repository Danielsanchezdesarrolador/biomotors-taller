# BT-ORDERS-UX-01 — candidato de renovación de Órdenes

27/11/2026, America/Santiago. **Preparado para revisión independiente; WebKit y aprobación visual humana pendientes.** Base oficial comprobada: `7616d09ad4a2d4dbadc0dcfe35dbf5be095a09a6`. El SHA y árbol del candidato, SHA de transferencia, inventario, diff binario y manifiesto se identifican en la entrega privada `BT-ORDERS-UX-01`. No aceptación oficial, CI remota ejecutada ni autorización de despliegue.

## Diagnóstico y continuidad

Se leyeron AGENTS.md, agent.md, roadmap.md, SISTEMA_VISUAL_OFICIAL_R2.md, BT_COMMERCIAL_DOCUMENTS_UX_01.md y su checkpoint LIVE_QA_C_ACCEPTED_PASS; también CP05_ENTREGA_FUNCIONAL, FLOW_UX_01 y EXP_01_ARCHIVO_PRIVADO. Se consultaron las fichas del Development Toolkit ERR-015, ERR-029, ERR-056 y ERR-062 y sus actualizaciones sobre fases HTTP y StrictMode. No se escribieron fichas duplicadas ni se publicó en el toolkit.

C_ACCEPTED_PASS 9/9 permanece como antecedente de aceptación humana, no como pruebas productivas repetidas en este trabajo. Full permanente, buckets privados, consumos, GATE4 abierto, versiones Edge y Render aprobados son antecedentes del cierre C: no se volvieron a consultar inventarios alojados ni se modificaron. SEC07 sigue cerrado; Auto-Deploy OFF se conserva como instrucción vigente, sin invocar Render.

La ruta real es App → Cp04PrivatePanel → VerifiedOrderScreen → Cp04OrdersView. El repositorio se crea en cada vida del binding verificado; Auth y contexto siguen siendo su única autoridad. La presentación compartida del multipunto usa Cp04AutosaveQueue, selección por UUID, registros confirmados, cola por usuario/taller/OT/vehículo y los controles existentes de MultipuntoTable. El callback onQuote abre CP05; onGuided conserva la identidad de visita en App/GuidedWorkspace. Los documentos siguen usando Cp04MultipuntoPdfPreview → repositorio → servicio comercial y PdfViewer, con renovación explícita, revalidación, UUID y revocación de URLs existentes.

Antes: hero alto, indicadores, listado y recepción completa, detalle inferior, pestañas con max-height/overflow y dos desplazamientos. A1650 el detalle comenzaba a1163px. Los formularios/pestañas ya permanecían montados; no era necesario reconstruirlos ni cambiar su persistencia.

## Arquitectura y cambios

- Un grid integra listado contextual y detalle. Desde1051px hay columna compacta de órdenes; en tablet/móvil el botón «Cambiar de orden» muestra el listado y seleccionar vuelve al detalle. No se duplican formularios, componentes ni callbacks.
- Recepción es un panel desplegable único, `hidden` al cerrarse, con foco inicial en patente, Escape y retorno al disparador. Se conserva el nodo y sus valores; abrir/cerrar no guarda una OT. La creación, validaciones, reconciliación tras escritura y búsquedas no cambian. Seleccionar una OT sigue aplicando el contrato anterior sobre patente/vehículo; el texto y kilometraje de recepción conservan sus estados existentes.
- Indicadores y ayuda de guardado permanecen en un resumen nativo accesible. Se colapsa al seleccionar una OT y muestra el conteo reciente, sin presentarlo como total histórico. Las cifras/loading/error siguen derivadas de la misma consulta.
- Cabecera compacta con patente, marca/modelo, estado, motivo, fecha y km existentes. La acción primaria sigue siendo «Continuar recorrido guiado» cuando el caller la ofrece. Cotización/multipunto quedan directos; documentos y transiciones/cierre usan grupos desplegables con todos sus botones, `disabled`, permisos, callbacks y confirmación originales. Escape cierra el grupo y devuelve foco; no interfiere con un diálogo PDF abierto.
- Pestañas semánticas y IDs estables; flechas/Home/End calculan posiciones sobre la lista de claves, sin usar índices como identidad. Se conservan paneles y controles montados, así como la clave por OT del checklist. Cambiar de pestaña no reconstruye colas ni solicita datos/documentos.
- Se elimina el scroll interno de los diagnósticos. Solo el listado contextual puede desplazarse independientemente cuando no cabe. La barra de contexto puede ser sticky en escritorio alto; no se fija en móvil/notebook bajo ni con menús/explicación comercial expandidos, para dejar espacio útil. El desplazamiento principal y el formato del borrador anterior siguen vigentes.
- Multipunto mantiene los34 ítems, familias, colores, X, limpiar, estados, notas, prioridades, resolución e historial originales. Se añaden texto de estado explícito, progreso revisado/sin revisar, advertencia de que progreso no equivale a confirmación y los estados veraces de cola. Los controles tienen al menos44px; las notas móviles usan16px. No se cambia MultipuntoTable ni el PDF.
- `workspacePresentation` es opt-in exclusivo de Cp04OrdersView. Los demás callers del checklist, incluido el recorrido guiado, conservan la presentación previa. No se cambian sus props ni sus módulos. La prueba real del recorrido detectó y permitió corregir una fuga inicial antes de cerrar el candidato.
- El CSS nuevo está limitado a `.cp04-orders-workspace`; conserva R2 navy/azul, contraste, bordes suaves y superficies blancas. No se modifican Home, App, sidebar, topbar, logo, assets o estilos globales.

Solo cambian tres archivos de producto: Cp04OrdersView.tsx, Cp04MultipuntoChecklist.tsx y ordersWorkspace.css. El inventario privado detalla también ejecutores, fixtures, workflow, documentación y checkpoint.

## Contratos conservados y límites de borradores

Sin cambios en server/, SQL, Supabase, Auth, permisos, RLS, Storage, planes, contratos/repositorio CP04, autosave, cp04Draft, CP05, archivo final, generadores PDF, PdfViewer, GuidedWorkspace ni App. La entrega compara sus árboles/blobs con la base. No cambia 0/2/4, precios5/15, Básico5clientes/1cotización48h/sin multipunto, Plus10documentos semanales, Full y antiabuso, propietario fuera del cupo, ni ZIP Plus/Full. No se ejecutó de nuevo el laboratorio SQL aprobado.

Los borradores existentes son temporales y de una pestaña, ligados al scope verificado. Cerrar recepción, cambiar pestañas o volver desde otra sección conserva nodos y texto. **El borrador de recepción existente tiene un único envelope y se limpia al cambiar usuario/taller**; no promete recuperación entre talleres. Se conserva ese aislamiento, sin introducir cachés privadas adicionales. Los borradores de X mantienen su cola y contrato anteriores. La validación no convierte un borrador en un registro confirmado.

No se permite fallback local documental, renovación silenciosa, caché de bytes ni consumo nuevo por zoom. Revocar autoridad retira el visor y URLs según las cercas existentes. No se promete revocar archivos descargados legítimamente antes del cambio. Se conserva el fix StrictMode de C que ignora únicamente el close obsoleto de un diálogo ya reabierto.

## Comparación medida

Mismo App real y fixture HTTP sintético, height950, scroll inicial0; coordenadas absolutas del documento. La fila de acciones compara cotización/multipunto; el recorrido guiado se comprueba aparte con callbacks reales y su fixture actual. Capturas completas antes/después y geometría JSON en la entrega.

| Anchura | Detalle antes → después | Acciones antes → después | Pestañas antes → después |
|---|---:|---:|---:|
|1650|1163 →387|1272 →514|1354 →658|
|1440|1184 →387|1293 →514|1423 →658|
|1366|1184 →387|1293 →514|1423 →658|
|1024|1686 →387|1795 →512|1925 →656|
|768|1696 →439|1805 →564|1983 →760|
|390|1714 →364|1860 →485|2027 →697|
|375|1730 →364|1876 →485|2043 →697|

A1650 el detalle sube776px y las acciones758px; la fila de acciones de44px pasa de requerir366px de desplazamiento a caber en la primera pantalla. En1366×650: detalle351, acciones479 y pestañas623, sin scroll interno de diagnóstico. También se valida844×390 horizontal, sin fijar cabecera ni recortar controles. En tablet/móvil seleccionar una orden lleva su contexto al inicio; no se fuerza la vista de escritorio reducida.

El alto total puede aumentar en anchuras intermedias: el contenido antes recortado en un panel ahora participa del documento. Eso no se presenta como reducción de la longitud completa ni se oculta información para mejorar una métrica. La mejora medida es acceso inicial/contexto y eliminación del doble desplazamiento.

## Validación ejecutada y matriz

Resultados locales, datos sintéticos y HTTP interceptado; no equivalen a RLS/JWT alojados, Safari físico ni QA del titular. Las iteraciones fallidas se conservan como diagnóstico, no se suman a PASS. Un mismo escenario repetido tras corregir un fallo no cuenta como caso nuevo.

- **30 unitarias afectadas PASS**:29 contratos existentes de UI/cola/borrador/repositorio y una nueva de frontera de presentación,34 componentes/102 radios y cero lecturas/escrituras al renderizar. Las29 no se repitieron tras añadir la regresión; esta se ejecutó aparte.
- **10 escenarios nuevos Chromium PASS**:responsive9 tamaños/orientación, recepción, inspección, PDF Full, PDF Plus, revocación sesión, carga/error/vacío, navegación, roles/scope/callbacks y reanudación guiada/frontera de presentación. Matriz ORD01–26 cubierta con los alcances siguientes.
- **5 escenarios C existentes directamente afectados PASS**:visor inspección1366/390, StrictMode, ZIP Full y ZIP Plus móvil. UUID estable, un consumo, bytes iguales; zoom sin solicitudes, foco y denegaciones conservados.
- **12 registros de regresión histórica seleccionados PASS**:CP04 rediseño1366 y4estados error/vacío/loading/revocación; F03–F06 de piloto en390; CP05 compacto1366; persistencia1366; diagnóstico vigente CP04 con dos visitas en1366. Los logs desglosan transiciones, confirmaciones, fallos de lectura y escrituras únicas. No son suites generales ni pruebas de servidor alojado.
- TypeScript, builds público/privado y sus fronteras, sintaxis CommonJS/Python y YAML/matriz CI PASS. Build final posterior al opt-in de presentación; checks de versión/flags diferidos en logs. No reinstalación ni modificación del lockfile.
- **WebKit BLOCKED_ENVIRONMENT**:ejecutable no instalado;0 intentos de descarga, sin alternativas ni cambios de red. Workflow focalizado preparado para Chromium/WebKit en GitHub Actions; **CI no ejecutada**. Dispositivos físicos, PWA instalada y aceptación visual humana pendientes.

| ID | Cobertura y evidencia |
|---|---|
|ORD-01|Seleccionar A/B/A, identidad y X por OT, fixture SDK real.|
|ORD-02|Abrir/cerrar recepción, mismo nodo/texto, foco/Escape.|
|ORD-03|Crear con km120.000 y recuperar OT confirmada tras recarga.|
|ORD-04|Borrador en pestaña y navegación sin remontaje; fallos de cola recuperables.|
|ORD-05|Cuatro pestañas/teclado, notas/inputs montados, sin solicitudes por pestañas.|
|ORD-06|Callback UUID/taller exactos y reanudación real de visita en recorrido sintético actual.|
|ORD-07|34 componentes presentes; no se alteran plantilla o familias.|
|ORD-08|Estados/nota; regresión histórica atención/OK/inmediato/limpiar, dos visitas.|
|ORD-09|Error/reintento/autoguardado, confirmaciones únicas y escritura en OT/taller correctos.|
|ORD-10|Histórico distinto del vigente, sin borrar diagnósticos anteriores.|
|ORD-11|ready/closed sin radios editables, contratos previos intactos.|
|ORD-12|Callback cotización y ejecutor real CP05 de borrador/recuperación.|
|ORD-13|Visor amplio, cierre/Escape/foco, desktop/móvil.|
|ORD-14|Zoom sin HTTP; preview/descarga mismo UUID/hash y un consumo sintético.|
|ORD-15|ZIP Full y Plus móvil, tres originales y ledger del fixture C, sin tocar SQL.|
|ORD-16|Básico tras revalidación deshabilita documentos y conserva promoción informativa.|
|ORD-17|Downgrade y sesión revocada retiran visor; persistencia comprueba cambios de rol/usuario.|
|ORD-18|Dos talleres: callback/scope exactos, borrador no cruza tenant; contratos de repositorio.|
|ORD-19|owner/admin/reception/mecánico habilitado/no habilitado en componente real; no concede acceso nuevo en App.|
|ORD-20|1650,1440,1366,1024,768,390,375; notebook1366×650 y844×390.|
|ORD-21|Semántica tablist/tabpanel, flechas/Home/End, foco/Escape,44px; no certificación WCAG integral.|
|ORD-22|Diagnóstico overflow visible, solo listado puede desplazar; medición comparativa.|
|ORD-23|Cierre de visor/recepción conserva selección y devuelve foco al disparador.|
|ORD-24|App/harness StrictMode, cola y modal C sin duplicaciones de escrituras/consumos.|
|ORD-25|Loading, error, reintentar y vacío; fallo posterior a escritura no repite creación.|
|ORD-26|Volver a Inicio/Órdenes conserva nodos/contexto; módulos globales idénticos por hash.|

## Diagnósticos y soluciones de la validación

1. En notebook bajo las pestañas seguían debajo del primer viewport. Se colapsaron indicadores al seleccionar y se midió de nuevo el responsive tras ese cambio; no se redujeron los controles ni se ocultaron acciones operativas.
2. Editar una nota vuelve a encolar su guardado. La prueba inicial intentaba reintentar antes de terminar ese envío fallido. Se esperó el error confirmado de la última edición y se conservaron aserciones de número de registros y ausencia de escrituras por pestaña; no se añadieron sleeps ni tolerancias.
3. Los summaries incluyen espacio junto al icono. El selector exacto anterior fallaba; se acotó al grupo semántico y se admitió solo whitespace final. Los ejecutores históricos abren el control real, sin force clicks. El listado contextual puede estar oculto mientras el detalle está activo: se espera `aria-busy=false` y presencia de registros; para seleccionar se abre «Cambiar de orden».
4. El fixture HTTP histórico omitía inspectionEnabled. Se agregó únicamente el booleano opcional a la RPC exacta ya validada; no se introdujo un mock genérico permisivo. Para Básico se revalidan capabilities explícitas. Las capturas Básico de base se corrigieron contra un checkout limpio de7616, sin modificar el candidato ni consultar servicios reales.
5. La prueba inicialmente esperaba recuperar un borrador entre talleres, contradiciendo readCp04Draft. Se verificó su implementación/unitarias y se conservó limpieza por scope; no se creó una caché multitenant.
6. El primer intento de la regresión guiada reutilizaba selectores históricos de dialog/acciones que ya no describen el workspace actual. Se consultó el código vigente y se probó la reanudación de una visita confirmada, con sus acciones semánticas actuales y cero escrituras. Esa prueba detectó la fuga del indicador nuevo: opt-in exclusivo y regresión unitaria/browser la cierran sin tocar GuidedWorkspace.
7. El generador sintético de evidencia C exige salida /tmp. El primer arranque a /workspace fue rechazado antes de las pruebas; se respetó su restricción y se copiaron únicamente resultados/capturas relevantes, sin alterar el generador.

Estas son incidencias de presentación/validación documentadas, no nuevos hallazgos de seguridad comercial. No se intentó resolver backend, atomicidad, licencias o el futuro multipunto definitivo.

## Integración, recuperación y riesgos

Dirección Técnica debe revisar el delta y aprobar su integración. La carpeta privada contiene snapshots con rutas originales, diff `--binary --full-index`, base/candidato/árbol, huellas SHA-256 y reconstrucción exacta del árbol desde la base. Verificar MANIFEST.sha256, revisar el inventario y aplicar el diff **con `--check` primero** sobre la base exacta en main; si main avanzó, reconciliar los cambios ajenos antes de integrar. El candidato no autoriza push oficial, migraciones ni despliegue.

No hay paquetes Edge, SQL, Storage nuevos ni orden de activación de infraestructura. La única integración funcional sería frontend/test/docs después de revisión y CI. Mantener servicios/flags diferidos apagados y Auto-Deploy OFF. Reversión futura autorizada: revertir el commit integrado o aplicar el delta inverso con revisión de conflictos; no requiere rollback de datos y no borrar expedientes/documentos. No ejecutar esa reversión durante esta entrega.

Riesgo residual **MEDIO** por cambio transversal de interacción/scroll y WebKit pendiente. Los roles de la sonda de componente prueban presentación/callbacks, no nuevas concesiones de acceso; la ruta real y el repositorio siguen verificando autoridad. Los ledgers browser son sintéticos, no validación nueva del servidor comercial. Sticky depende del viewport y se desactiva en escenarios limitados; zoom del navegador, teclado móvil físico y lectores de pantalla requieren QA humana adicional. No se certifica WCAG integral ni hardware. PDFs/históricos no cambian. No se prometen archivos descargados revocables ni borradores entre tenants.

Siguiente paso: revisión independiente de esta entrega; luego CI oficial y aprobación visual humana. No iniciar BT-MULTIPUNTO-FINAL-01, correo, registro público, envío de informes, BT-MOBILE-02A–D, Android nativo, optimización iPhone/PWA física, piloto Ignacio, Agenda/Flow nuevos, DevOps o R3 por este candidato. Se conserva el orden futuro de roadmap.
