# BT-COMMERCIAL-HARDENING-01 — candidato para revisión independiente

27/11/2026, America/Santiago. Base exacta: `d9977e046372bf98a1640f975ec1ce90c24c9309`. Main es la única rama utilizada. Se preservó el candidato local anterior 04314f63 en una referencia local antes de avanzar el checkout limpio al HEAD oficial indicado. No hay push oficial.

Estado: **TARGETED_HARDENING_REVIEW_PENDING**. Se prepara candidato, no aceptación comercial integral, autorización de despliegue ni cambio de estado productivo. ACCEPTANCE-10 observado sigue teniendo su alcance previo; el hallazgo histórico no se convierte retrospectivamente en un bypass demostrado del servidor.

## Continuidad y diagnóstico

Leídos AGENTS.md, agent.md, roadmap.md y CHECKPOINT_BT_COMMERCIAL_ACCEPTANCE_10_11_20261127.md. Se reutilizan las 44 comprobaciones comerciales, ocho SQL DELTA y CI histórica del checkpoint como evidencia previa de contratos/guardas; no se repiten ni se presentan como pruebas nuevas.

1. Cp04MultipuntoPdfPreview conservaba bytes en cached.current y omitía loadDocument al repetir vista previa o descargar. Una acción iniciada con UI/plan todavía anterior podía usar esos bytes legítimamente entregados sin nueva consulta de autoridad.
2. commercialDocumentRequest rotaba silenciosamente el UUID a los cuatro minutos, antes del lease SQL de cinco minutos. Una nueva acción podía pasar a ser una operación nueva y consumir otro cupo sin decisión explícita.
3. Las vistas previas del expediente final tenían Blob URLs y validación por generación de consulta, pero no una invalidación común ante cambio de plan. Varias rutas descartaban cambios de registro/contexto, pero faltaba una frontera documental común contra respuestas anteriores a un cambio de autoridad (incluido Full → Básico → Full).
4. Los endpoints saneaban todos los errores de lease/cambio de plan en errores genéricos. El cliente no podía distinguir una operación que ya no estaba vigente para pedir renovación explícita sin inferir permisos desde el reloj local.

## Solución

### Cada acción consulta el servidor

Se elimina el caché de bytes multipunto. Cada acción nueva de vista previa, reapertura o descarga ejecuta loadIdentity y loadDocument del repositorio CP04. Auth/membresía/taller, RPC de consumo y entrega oficial siguen siendo del servidor. Dos acciones usan el mismo UUID para el mismo usuario/taller/OT/snapshot: preview y descarga no duplican consumo dentro de la autorización vigente. Se usa un lock inmediato de UI y generación local para impedir dos acciones superpuestas y descartar respuestas viejas. Cambios de OT/hallazgos invalidan la vista, no el borrador ni el autoguardado.

Cotizaciones CP05, expediente final e historial ya obtenían bytes por servidor en cada acción; se conservan esas llamadas y verificación de identidad, tamaño, hash y scope. Se añaden cercas contra respuestas anteriores al cambio de autoridad, también tras leer Blob, verificar SHA y generar un ZIP. No hay fallback a bytes previos ante denegación.

Los informes preliminares locales de ejecución no son PDF oficiales ni cotizaciones. Para su acción de descarga se exige ahora una lectura autorizada antes y después de renderizar, mediante el contrato existente del caller; no se concede permiso por datos precargados. Solo son lecturas: no se registra trabajo, entrega o email. Las rutas de informe/entrega históricos y ZIP mantienen sus contratos y controles existentes.

### Invalidación documental, sin remontar formularios

Nuevo módulo puro auth/documentAccess.ts mantiene una generación de invalidación, cercas de acción y un inventario de Blob URLs. RealAccess lo conecta a los eventos del AuthController y al estado confirmado de plan/capacidades del taller. Cambios de plan, fallo de lectura del plan, sesión, rol o taller invalidan URLs y respuestas pendientes. La generación es monotónica: volver a Full no hace válida una respuesta iniciada antes de pasar por Básico.

Las vistas multipunto y archivo se suscriben a esta generación: retiran el iframe y revocan URL al conocer un cambio; no reinician formularios, X, decisiones o borradores de negocio. También se gestionan URLs de descarga PDF y ZIP. La verificación de respuesta/generación ocurre inmediatamente antes de crear una nueva URL o iniciar descarga. Un iframe o una respuesta antigua no se reinstalan después de otro contexto. Revocar una URL no garantiza borrar bytes que el navegador ya recibió.

El módulo no concede permisos ni sustituye SQL; su ausencia/fallo no convierte una respuesta denegada en bytes. Las acciones del repositorio siguen validando en servidor. El rol y el taller no se deducen de localStorage.

### Operación comercial estable y expiración explícita

Se conserva solo metadata de reintento (UUID/fecha, scoped por actor/taller/recurso o snapshot), nunca PDF ni credenciales. Se mantiene el formato de clave anterior de cotizaciones para conservar una autorización ya existente; CP05 y expediente final comparten esa identidad. Hay fallback de metadata en memoria si sessionStorage no está disponible, no fallback de documentos.

**El reloj del cliente no decide la vigencia ni rota UUID.** Incluso tras adelantar/atrasar el reloj, una acción vuelve a presentar el mismo UUID al servidor. Únicamente SQL determina si esa autorización sigue vigente. Esto evita cortar anticipadamente una operación válida o crear cupos nuevos por reloj, recarga o cambio de vista.

Los errores conocidos CONSUMPTION_REPLAY_EXPIRED, RESERVATION_EXPIRED y PLAN_CHANGED_RETRY se traducen a HTTP 409 con código saneado DOCUMENT_OPERATION_NOT_CURRENT en los tres handlers. No se devuelven mensajes SQL ni datos internos. Los errores de autenticación, permisos, cuota y recursos conservan su denegación genérica; no se atribuyen falsamente a expiración.

El cliente muestra que la operación expiró o su autorización dejó de estar vigente y ofrece **Iniciar nueva operación documental**, con confirmación de que puede consumir cupo y que el servidor comprobará de nuevo plan/permiso. No llama al endpoint al confirmar ni repite automáticamente la descarga: la siguiente acción expresa del usuario solicita el documento con UUID nuevo. Cancelar conserva la identidad anterior. Renovar invalida respuestas pendientes de la identidad anterior. El cambio Full → Básico → Full dentro del lease conserva la identidad Full original y un consumo; una autorización creada bajo otro plan debe recibir la respuesta real del servidor, no se fuerza su reutilización ni se cambia SQL.

El visor multipunto y la vista de cotización del expediente se cierran por inactividad a los cinco minutos con un mensaje para volver a solicitar el documento. Ese temporizador solo retira la vista local: no declara expirado el lease, no concede permiso ni genera una operación nueva. Una nueva acción vuelve a validar el UUID con servidor. No se requiere sincronizar el reloj del navegador con PostgreSQL.

### Guardas y compatibilidad

Sin cambios en SQL, RLS, ACL, buckets, Storage, límites, precios, suscripciones, sesiones productivas, familias/colores/X, PDF A4, archivos originales, correo o registro. No se implementan bloques B/C (ampliación/zoom del visor, demo Básico, nuevas explicaciones comerciales, etc.). El aviso de renovación forma parte de la expiración requerida, no una nueva fase comercial.

El empaquetado offline de los tres handlers se reutiliza porque se amplía su código de error HTTP, sin variar rutas ni permisos. Se incluyen paquetes actualizados y manifiesto de archivos. El cliente viejo sigue recibiendo una denegación para esas operaciones; el cliente nuevo no debe inferir expiración desde un error genérico. No se instala ni despliega ningún paquete.

Build público: el helper puro de invalidación se coloca en Auth, sin datos ni SDK. El estado de operaciones y el aviso de renovación solo se permiten por nombre exacto con CP04 privado habilitado; se añade comprobación explícita de que ambos quedan fuera del grafo público. No se permiten tests, fixtures o generadores oficiales limpios en el navegador. No se relajan las guardas de datos públicos.

## Pruebas efectivamente ejecutadas

Solo datos sintéticos, componentes/repositorios reales e interceptación HTTP local. No cuentas, talleres o acciones alojadas. No suites históricas completas, SQL de producción, auditorías o respaldos.

- **20 casos unitarios/HTTP distintos PASS**: once de identidad/metadata/reloj, URLs/generación ABA, nueva consulta CP05/archivo por acción, expiración indicada por servidor, aislamiento, renovación explícita y respuestas tardías; cinco del contrato HTTP de vigencia (los tres endpoints, snapshot multipunto cambiado y cambio durante finish); cuatro existentes directamente afectados del límite historial → descarga. Filtros y logs indican las ejecuciones; no se suman repeticiones del mismo caso.
- **14 escenarios Chromium PASS**, ensamblados sin repetir por rutina: once iniciales de multipunto, dos adicionales del archivo y un caso añadido de cambio de ruta/remontaje con la misma OT. El caso inicial basado en reloj local se reemplazó y revalidó solo por **local-clock-preserves-operation**, porque la autoridad debe ser del servidor. El caso descartado no se cuenta como evidencia final.
- Multipunto: Full y Plus preview → descarga con dos peticiones de documento, mismo UUID y un consumo en ledger sintético; downgrade con visor abierto retira iframe y revoca URL; downgrade aún no notificado a UI llega al endpoint y se deniega sin descarga; recuperación Full conserva UUID/consumo; revocación de sesión, cambio de rol, cambio de taller con respuesta retenida, expiración real del servidor con renovación explícita y concurrencia de acciones con un solo request.
- Archivo final real: vista previa y descarga vuelven a obtener bytes por endpoint, mismo UUID y un consumo; downgrade con visor abierto elimina iframe/revoca Blob y la siguiente acción se deniega, sin fallback.
- Los contadores de estas pruebas de UI pertenecen al simulador: se verifica el tráfico/UUID y comportamiento actual de componentes/repositorios, no una nueva ejecución SQL alojada o E2E de producción. El contrato persistente real de idempotencia/plan/lease se conserva y reutiliza de las pruebas SQL aprobadas. No se etiqueta ese historial como una prueba nueva.
- TypeScript, builds público/privado y guardas de grafo: PASS. Empaquetado offline de tres servicios: PASS y hashes de fuentes/archivos comprobados. Sintaxis Node/Python y whitespace del delta: PASS. Aviso existente de chunk executionPdf/fontkit grande conservado; no es un error nuevo ni se abre optimización de bundles.
- No WebKit local, instalación o descarga. WebKit/CI oficial, runtime Edge nativo, dispositivos físicos y aceptación del titular permanecen pendientes. No se autoriza despliegue ni aceptación integral por estos resultados.

Reproducción focalizada: `npx vitest run src/documents/hardening.test.ts src/documents/expiryHttp.test.ts src/historial/archiveDownload.test.ts`; navegador `NODE_PATH=<Playwright ya instalado> python3 scripts/verify-commercial-hardening.py` (14 casos; BT_HARDENING_CASES permite retomar casos concretos, no omitirlos como PASS). El runner sirve únicamente loopback, propaga fallo del proceso, rechaza casos ausentes y no instala dependencias/navegadores. `node scripts/package-commercial-handlers.mjs <nuevo directorio /tmp>` empaqueta, nunca despliega. No es necesario repetir SQL histórico para este delta.

## Errores y decisiones durante el bloque

1. Caché local y rotación a cuatro minutos: se retiran ambas decisiones de autorización del cliente. Se conserva metadata y se devuelve cada acción al servidor.
2. La identidad multipunto se comparte por actor/taller/OT entre rutas; un cambio de forma del objeto UI no genera otro consumo. La huella/snapshot real sigue validándose en SQL; su conflicto exige nueva operación explícita.
3. Una primera propuesta local de expiración a cinco minutos podía cortar antes una autorización aún válida por latencia o desfase. Se corrigió antes de entregar: reloj solo informativo, UUID estable; código 409 del servidor y confirmación explícita para nueva operación. La prueba de reloj demuestra ausencia de nuevo cupo automático.
4. El guard del build público rechazó el nuevo helper fuera de la allowlist. Se ubicó la invalidación pura en Auth y se incorporaron solo los dos módulos privados exactos bajo el gate CP04, añadiendo su exclusión pública. No se desactivó el guard.
5. Primer fixture carecía de plate_key exigido por TypeScript; se completó el dato sintético, sin debilitar tipos productivos. Hubo conflicto de nombre con documentOperation de emisión CP05: alias explícito del helper de autorización, sin cambiar el contrato de emisión.
6. Chromium solicita assets internos de su visor PDF (chrome://resources y su extensión nativa): se separaron de las peticiones HTTP de negocio por protocolo/host exactos. Todo HTTP externo y endpoint/RPC desconocido sigue rechazado; no se añadió una excepción de red real.
7. Se añadió la recuperación Full después de notificar Básico a la UI y se verificó solo ese caso: mismo UUID, dos peticiones autorizadas y un consumo, sin reutilizar URL anterior. Tras ampliar las pruebas del archivo, se ejecutaron solo esos dos casos. Tras corregir la semántica del reloj, se ejecutó solo su caso de navegador. Se conserva diagnóstico inicial identificado aparte de resultados finales; no se cuentan estados anteriores descartados como PASS del candidato.

## Riesgos residuales y límite de garantía

- No es posible revocar archivos, bytes, impresiones o copias obtenidos legítimamente antes de un cambio. Un lector nativo/externo puede conservar datos ya recibidos. La app elimina su iframe y URL al conocer el nuevo contexto; no promete borrado forense de memoria, control de capturas o archivos guardados.
- Los cambios de plan de otro dispositivo se conocen mediante la reconsulta existente (cada cinco segundos y foco/online). Mientras llega esa notificación, el visor anterior puede contener lo entregado legítimamente; **las nuevas acciones de la app ya consultan servidor**, sin esperar ese polling. No se promete notificación remota instantánea ni una transacción distribuida navegador/servidor.
- Una petición puede confirmar su consumo antes de un cambio de contexto o una pérdida de transporte y luego ser descartada por el cliente. No se modifica esa semántica del servidor ni se devuelve cuota automáticamente: la misma identidad conserva reintento según lease vigente; al no estar vigente, se solicita otra operación solo con confirmación. No equivale a prueba de guardado físico.
- Cambios de snapshot son validados por SQL con el mismo UUID. Si deja de corresponder, el servidor devuelve el código saneado y se pide confirmación explícita antes de otra operación; no se cambia UUID automáticamente por formas distintas del objeto UI o por navegar entre módulos. Una referencia que el servidor considere obsoleta se deniega, nunca se regenera una autorización silenciosamente.
- Metadata de reintento permanece scoped por actor/taller/recurso; no es una credencial ni un caché de PDF. Si la sesión original queda revocada, SQL puede rechazar su caché aunque el usuario vuelva a iniciar sesión: no se relaja esa guarda ni se cobra otra operación automáticamente.
- Nueva respuesta saneada de los tres handlers y frontend deben revisarse/integrarse como un candidato coherente. No requiere nueva migración. Paquetes/orden de activación previa no constituyen autorización en este bloque; instalación, prueba nativa Edge, CI y cambio de producción corresponden a Dirección Técnica tras revisión independiente.

## Entrega privada

DTK-ERR-056, carpeta nueva `bytetorque-review/main/BT-COMMERCIAL-HARDENING-01`. Base d9977e0, SHA/árbol completo candidato e inventario por ruta en CANDIDATO.json. Diff incremental binario full-index, snapshots de archivos, diagnóstico, pruebas, capturas sintéticas, paquetes y MANIFEST.sha256. Se verifica reconstrucción exacta del árbol con índice temporal, comparación remota byte a byte y conservación de todas las raíces de revisión previas. El SHA de transferencia es el commit que contiene la carpeta y se comunica tras push verificado, distinto del candidato local.

Sin push al oficial, Supabase/SQL alojado, Render/Edge desplegadas, secretos o flags; correo/pagos/logos/registro OFF; Auto-Deploy no se modifica, OFF conforme a continuidad (sin nueva lectura alojada). SQL/roles/RLS/Storage intactos. Sin nueva rama, bloques B/C, SEC07 ni autorización de aceptación comercial integral.

## Aclaración de revisión — DELTA-01, 27/11/2026

La expresión renovación explícita no significa que una operación confirmada vencida pueda extenderse conservando UUID. El SQL aprobado rechaza ese UUID y conserva su consumo. Solo una reserva vencida no confirmada/failed puede recuperarlo sin consumo previo. Reingreso con sesión original revocada requiere verificar la autoridad actual y, si procede, ofrecer nueva autorización explícita; no migrar bytes ni sesión del recibo anterior. Las 34 pruebas reportadas arriba son evidencia histórica, no repetida ni una validación de estos dos casos SQL. Véase el [checkpoint DELTA-01](CHECKPOINT_BT_COMMERCIAL_HARDENING_01_DELTA_01_20261127.md) para las 12 regresiones nuevas, semántica, límites y cambio puntual sin SQL.
