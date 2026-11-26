# BT-PLAN-04BC-LIVE-FIX-01 — checkpoint de candidato

Fecha: 26/11/2026, America/Santiago. Estado: corrección local validada, entrega exclusiva privada DTK-ERR-056; pendiente revisión e integración por Dirección Técnica. Base oficial: `dab762c0a9bb183a236599822f544485dbcfce31`, rama local main. El SHA completo del candidato, árbol Git, inventario y huella incremental se registran en CANDIDATO.json de la entrega para evitar autorreferencias en este documento.

## Causa y solución

RealAccess reservaba PersonalHome a no-membership y consultaba un único estado de plan usando el taller seleccionado. Una membresía administrativa en un taller Básico ocultaba la cuenta personal aunque Auth tuviera una licencia Full permanente elegible. El contrato existente del servidor ya distingue licencia personal de suscripción del taller y permite crear un taller propio sin destruir otras membresías: no requiere cambios SQL.

RealAccess consulta bt_plan04_my_status con p_workshop_id:null para la cuenta y con el UUID autorizado para el taller. Comprueba scope y workshopId de cada respuesta, descarta respuestas obsoletas y vincula el estado a principal/taller. Errores o respuestas de otro ámbito no elevan el plan. El menú incluye Mi cuenta personal y muestra ambos estados con etiquetas explícitas. PersonalHome reutiliza WorkshopHome y sus RPC; la elegibilidad se consulta al servidor y bt_plan04_create_workshop conserva la autoridad final, titular Auth, idempotencia y vinculación única. No se envía un titular ni un plan elegidos por el cliente.

La cuenta personal se monta junto al espacio actual, ocultando/inertizando la vista inactiva sin desmontar formularios al entrar y volver. Se elimina la key basada en JSON del plan de WorkshopHome: una actualización de licencia no borra el nombre en edición. El callback de creación limpia el contexto/borradores operativos del taller anterior, selecciona el nuevo mediante el controlador existente y exige confirmación de su identidad antes de cerrar. Conserva la identidad idempotente de la solicitud si la creación tuvo éxito pero la selección no pudo confirmarse. El cambio normal entre talleres continúa usando el selector autenticado existente; las membresías no se eliminan ni se copian expedientes. La comprobación de servidor y los límites por taller permanecen vigentes.

## Indicadores y actualización de servidor

PlanBadge es una presentación compartida: Básico neutro, Plus azul con distintivo y Full dorado con corona. Se utiliza en topbar/menú de usuario, cuenta personal, cuentas y talleres del creador, y espacio de mecánico. Se conserva la identidad R2. El menú personal antes oculto por el CSS móvil queda accesible mediante avatar compacto únicamente en la sesión privada PLAN04; no se amplía la interfaz pública.

PersonalAccounts y CreatorConsole anuncian invalidación solo después del éxito de la RPC. El mensaje no transporta planes, usuarios ni permisos: los observadores reconsultan su propio ámbito al servidor. La lista personal vuelve a consultar sus datos y el resumen de talleres del creador se refresca en segundo plano conservando la selección/formulario. RealAccess escucha la invalidación en la misma sesión y otras pestañas. Mantiene además reconsulta visible cada cinco segundos y al volver a foco, visibilidad u online para cambios desde otros dispositivos. No se requiere pulsar un refresco extra en el flujo de concesión, extensión, cambio o revocación.

Límite explícito: cambios realizados desde otro dispositivo se reflejan por sondeo visible de hasta cinco segundos, más latencia de red; no se implementa una suscripción realtime del servidor. La pestaña oculta se actualiza al volver. Un badge nunca sustituye la autorización de las RPC.

PlanBadge/CSS se permiten de forma exacta como presentación pública en las guardas de Vite y del verificador de bundle. planChanges permanece excluido cuando PLAN04 está OFF. No se relajan las exclusiones generales de módulos privados.

## Validación efectiva focalizada

- PostgreSQL 17 aislado, contenedor sin red ni puertos publicados: scripts/security/verify-live-personal-workshop-local.sh, resultado LIVE_PERSONAL_WORKSHOP_REGRESSION_PASS. Usa únicamente definiciones aprobadas como prerrequisito y nuevas aserciones focalizadas; no ejecuta las suites históricas. Creador sintético AAL2 concede Full permanente a administrador de taller Básico; null devuelve Full personal, UUID antiguo devuelve Básico; crea taller propio Full, titular Auth y dos membresías activas. Reintento idempotente, exclusión RLS de tercero y rechazo de cuenta Básica. Taller anterior, suscripción, membresías y cliente comparados exactamente sin cambios. La licencia queda vinculada únicamente al nuevo taller.
- Vitest: PersonalHome.test.tsx, planStatus.test.ts, workshops/client.test.ts; 9 pruebas PASS, tres archivos. No se repiten 122 unitarias, 51 SQL ni 25 de revocación.
- Nuevo ejecutor scripts/verify-live-personal-workshop.cjs: Chromium 1440 y 390, ambos PASS. APIs exclusivamente sintéticas interceptadas, endpoints inesperados fallan y no existe tráfico productivo. Cuenta Full en taller Básico, acceso personal y retorno con el mismo nodo/formulario y valor de borrador; creación y selección Full sin modificar el Básico; cambio autorizado al anterior y separación de badges; Plus azul y Full/corona dorada comprobados por DOM y color computado. Mutaciones sintéticas lifetime/grant_days/extend_days/revoke confirmadas y reconsultadas sin refresco manual; cambio externo detectado por sondeo; respuesta personal de scope incorrecto falla cerrada. Sin errores JS ni desbordamiento horizontal en vistas comprobadas. Resultados estructurados y ocho capturas de datos ficticios incluidos.
- npm run typecheck PASS. Builds Vite público y privado PASS y verify-official-bundle.mjs PASS para ambos. Flags privados de fixture para Auth/Creator/PLAN04/talleres/CP03/CP04; no activación alojada.
- Sintaxis shell/Node, diff --check, ausencia de cambios en SQL aprobado, Supabase/server, controlador Auth y dependencias; reconstrucción del árbol exacto por diff binario y manifiesto SHA-256 forman parte del cierre de integridad.
- WebKit BLOCKED_ENVIRONMENT: no instalado, restricción de descarga conocida. No se hicieron nuevos intentos, búsquedas alternativas ni cambios de red; pendiente CI oficial. No se declara CI remota ni aceptación real de producción PASS.

Los logs conservan los intentos iniciales: guarda de bundle que necesitaba permitir exactamente el componente de presentación, selectores/sincronización y JWT sintético del fixture corregidos, y menú móvil oculto detectado tras PASS de escritorio. La corrección móvil y su estilo fueron validados en la ejecución final de ambos anchos. No se presentan aquellos intentos como PASS ni se repiten pruebas ya aprobadas sin cambios relacionados. failure.png de un intento intermedio no forma parte de las ocho capturas finales.

## Archivos y alcance

Código: RealAccess, PersonalHome, WorkshopHome, App/AppShell, CreatorConsole, PersonalAccounts, MechanicWorkspace; componentes PlanBadge, planBadge.css y planChanges. Guardas de build: vite.config.ts y verify-official-bundle.mjs. Pruebas: ejecutor browser y dos archivos security del laboratorio focalizado. Documentación: este checkpoint y AGENTS.md, agent.md, roadmap.md. Inventario exacto y hashes en CANDIDATO.json; snapshots conservan rutas originales bajo files/ y delta.patch es incremental binario contra la base oficial.

Los archivos SQL bajo scripts/security son aserciones sintéticas, no migraciones. docs/sql, Supabase, RLS, permisos, Edge, Render, cuentas/licencias reales, Storage y producción no se modifican. No se reconstruye el sistema de licencias, no se repiten respaldos ni auditorías, SEC07 sigue cerrado. Correo, pagos, logos y Auto-Deploy no se activan. Sin push a biomotors-taller ni ramas adicionales.

## Transferencia y revisión

Únicamente nueva carpeta bytetorque-review/main/BT-PLAN-04BC-LIVE-FIX-01. Comprobar privacidad y permiso push efectivos; commit/push solo en repositorio privado. Incluir diff, snapshots, identificación del candidato completo, logs, resultados, capturas y MANIFEST.sha256. Verificar reconstrucción del árbol Git mediante índice descartable, hashes y bytes remotos tras publicar, y árboles previos de revisión intactos. No incluir .env, credenciales, secretos, node_modules ni datos personales reales.

Orden propuesto tras revisión: integrar delta autorizado, CI oficial incluidos motores disponibles y WebKit pendiente, después despliegue frontend solo bajo autorización independiente. No hay migración ni activación SQL nueva. La aceptación alojada con cuentas reales queda a Dirección Técnica y titular; este bloque usa exclusivamente datos sintéticos.

## Documentación y contratos consultados

AGENTS.md, agent.md y roadmap.md; CHECKPOINT_BT_PLAN_04BC_LIVE_20261126.md y antecedentes PLAN04BC/04A/04B/04C y revocación; contratos existentes bt_plan04_my_status y bt_plan04_create_workshop y fixtures oficiales de laboratorio; RealAccess/PersonalHome/WorkshopHome, controlador de selección Auth y borradores privados; CreatorConsole/PersonalAccounts y parsers de plan; docs/design/referencias-r2/README.md y catálogo visual/brand oficial R2; guardas de grafo público y verificador de bundle; procedimiento DTK-ERR-056 y entregas privadas anteriores como formato de transferencia. No se consultaron ni modificaron secretos productivos.
