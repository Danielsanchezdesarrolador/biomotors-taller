> **GOBERNANZA PERMANENTE PARA TODOS LOS CHATS/AGENTES (19/11/2026) — ANTES DE DAR INSTRUCCIONES, LEER; AL TERMINAR, DOCUMENTAR.** Para **cada** solicitud sobre ByteTorque, ChatGPT/Codex/agentes deben leer desde el `main` vigente **`AGENTS.md` → `agent.md` → `roadmap.md` → último checkpoint pertinente de `docs/checkpoints/`**, confirmar HEAD, trabajo efectuado, pruebas, flags, autorización y pendientes **antes** de proporcionar comandos, prompts, recomendaciones operativas o ejecutar cambios. Si falta acceso, declararlo; no reiniciar tareas a ciegas. **Al finalizar cualquier tarea o intento bloqueado:** actualizar roadmap (hecho/estado real/falta), crear/actualizar checkpoint (fecha, commit, archivos, pruebas, resultados, efectos en servicios, próximos pasos) y actualizar `agent.md` con enlace/estado; actualizar `AGENTS.md` si existe nueva regla permanente. Entregar al propietario el commit y diferencia exacta entre probado y operativo. **Esta norma no autoriza migraciones, copias nuevas, despliegues ni operaciones alojadas.** [Regla canónica](AGENTS.md) · [Entrada agentes](agent.md) · [Checkpoint de la regla](docs/checkpoints/CHECKPOINT_BT_SEC_AGENT_RESTORE_20261119.md).

> **SEGURIDAD / BACKUP · CORRECCIÓN DE CONTINUIDAD PRIORITARIA (19/11/2026) — YA EXISTE CIFRADO LOCAL. NO REPETIR DESDE CERO.** El 17/11/2026 se trabajó en el PC Windows del propietario con GPG/OpenPGP; se reportó el respaldo cifrado en `BT-Backups/bytetorque-local-20261117T144118Z-8c1f8a323a924d44a6b8e853e6faa756/`: `database.dump.gpg` (**89.091 bytes**) y `roles.sql.gpg` (**151 bytes**). Se verificó descifrado del primero (`CIFRADO Y DESCIFRADO OK`, `BASE_DESCIFRADO_OK`, `ARCHIVO_POSTGRES_OK`, `CATALOGO_OK`). **Sí se ejecutó exitosamente una restauración de la base SQL en un entorno Docker aislado, y se comprobó funcionalmente la paridad de 7 tablas** (esa validación es parcial respecto de todo Supabase), con `BT_DATOS: RLS_ACTIVA=7 POLITICAS=16`, `BT_REGISTROS: TABLAS=7 FILAS=25` y `BT_PARIDAD: SIETE_TABLAS_COINCIDEN`. Evidencia de la sesión del Director, **sin clave privada ni bytes de respaldo subidos al repositorio**. **PENDIENTE:** `ROLES_ORIGEN_FALLA_NO_CLASIFICADA`; no considerar válido el respaldo de roles de 151 bytes hasta comprobarlo; falta verificar recuperación integral de Auth/roles/extensiones/Storage/Edge/configuración y su correspondencia con una copia identificada. **DIFERENTE:** el proceso automático GitHub → Drive permanece bloqueado por acceso OAuth `drive.file`, sin recibo cloud verificado; no confundirlo con inexistencia del respaldo GPG local. **SIGUIENTE ACCIÓN:** localizar y preservar los archivos y keyring existentes, contrastar SHA-256/descifrado, **reutilizar la restauración SQL ya ejecutada** y su verificación de 7 tablas, resolver roles y comprobar únicamente la recuperación integral aún no acreditada; **NO** crear de nuevo claves, exportar de nuevo ni cifrar de nuevo de manera automática. Antes de activar CP05/LIVE-02, exigir respaldo integral recuperable y autorización específica. Regla permanente y lectura obligatoria: [AGENTS.md](AGENTS.md) y [agent.md](agent.md). **BT-PILOT-QA-04: A REPASAR.**

> **BT-COM-01D · INTERFAZ R2 DE REVISIÓN DOCUMENTAL CP06 (18/11/2026) — CÓDIGO APROBADO, VISTA OFF.** Componente responsive `src/historial/ClosingReviewPanel.tsx` integrado en el historial, cargado dinámicamente solo con `VITE_BT_COM_01D_PREVIEW_ENABLED=true` **más** gates privados CP06, CP05 documentos, FLOW-LIVE-02 y rol dueño/admin/recepción. Presenta cotización histórica emitida, informe de ejecución declarada, constancia de entrega declarada, CLP histórico, archivos PDF y destinatario **histórico NO VERIFICADO**. Checkboxes de revisión únicamente locales, que se reinician al cambiar revisión/contacto o recargar; «Registrar revisión» y «Enviar correo» permanecen **disabled**. Descargas pasan por callbacks CP05/CP06 preexistentes sujetos a autenticación/rollout; si faltan declaraciones no fabrica documentos. CSS R2 adaptable; pruebas visuales sintéticas para 360/390/430/768/1366/1440/1920, conexión HTTP solo a harness local y sin email/Storage. **CI [44432369991](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44432369991) SUCCESS**: 82/82 archivos Vitest, TypeScript, Web/PWA pública + privada con flag ON solo en CI, Android Expo y PostgreSQL 17 aislado; [QA visual 44432370000](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44432370000) **SUCCESS**: `BT_COM_01D_R2_CLOSING_UI_SEVEN_SIZES_NO_MAIL_PASS`, capturas en artefacto `14486323719`. Sin SQL alojado, Auth/RLS, pagos, correos, Render ni cambios en datos reales. Detalles: [BT-COM-01D](docs/BT_COM_01D_R2_CLOSING_REVIEW_CANDIDATE.md). Próxima puerta crítica: respaldos integrales restaurables y autorización específica para activaciones seguras. **BT-PILOT-QA-04: A REPASAR**.

> **BT-COM-01C · REGISTRO TRANSACCIONAL PRIVADO Y ESTADOS DE CORREO (18/11/2026) — CÓDIGO CANDIDATO APROBADO; CORREO OFF.** Sobre BT-COM-01B se prepararon `docs/sql/BT_COM_01C_REVIEW_LEDGER_CANDIDATE.sql` (esquema privado, gate por taller OFF, manifiestos/documentos, revisiones `operator_reviewed_not_sent`, y eventos del proveedor reservados sin escritura/worker); `server/com/closingDeliveryStateCandidate.ts` (proyección de estados de correo segura, sin enviar, leer ni afirmar pago); y pruebas sintéticas SQL/TypeScript, ejecutadas en PostgreSQL 17 aislado dentro del laboratorio existente. La función privada de registro de revisión exige `service_role`, cuenta confirmada, taller/rol autorizado, cotización vigente, entrega relacionada, destinatario y hashes exactos; reintentos idénticos son estables y cambios conflictivos se rechazan, con historial append-only. **CI [44424124792](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44424124792) SUCCESS: 717/717 Vitest (82 archivos), Web/PWA/Android y `BT_COM_01C_LOCAL_FRESH_CONNECTION_NO_MAIL_PASS`; QA de interfaz [44424124729](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44424124729) **SUCCESS**.** Sin SQL instalado, ni Storage, proveedor, correo, Render, Auth/RLS alojado o clientes reales. Documentación: [BT-COM-01C](docs/BT_COM_01C_REVIEW_LEDGER_CANDIDATE.md). Próximo: consolidar activaciones tras backup/restauración verificados y autorización específica; **BT-PILOT-QA-04: A REPASAR**.

> **BT-COM-01B · REVISIÓN DE DESTINATARIO Y CORREO TRIPLE CANDIDATO (18/11/2026) — CÓDIGO APROBADO, ENVÍO OFF.** Sobre `BT-COM-01A` se añadió `server/com/closingMailReviewCandidate.ts` con validación de autenticación, taller/rol/entrega/revisión, destinatario de fuente servidor, referencias de los tres PDF privados SHA-256 y vista previa `text/plain`. La confirmación humana verifica dirección y adjuntos exactos mediante huella de vista previa, detecta cambios/revocaciones, exige confirmaciones explícitas y prepara un registro idempotente **`operator_reviewed_not_sent`**; NO envía correo ni conecta proveedor/bucket/SQL. Pruebas sintéticas `src/entrega/closingMailReviewCandidate.test.ts`: aislamiento A/B y roles, destinatario inválido, cambio de documento/dirección, reintentos y ausencia de envío. **CI [44420380822](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44420380822) SUCCESS: 707/707 Vitest (81 archivos), Web/PWA/Android Expo, PostgreSQL 17 aislado; [QA de interfaz pública 44420380820](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44420380820) SUCCESS**. No Render nuevo, SQL, Auth/RLS ni correos; el servicio oficial permanece en pulido visual `d8d6ed99`. [Contrato y activaciones pendientes](docs/BT_COM_01B_MAIL_REVIEW_CANDIDATE.md). Próximo: preparar flujo transaccional/registro SQL candidato solo en código; para operar se requiere respaldo recuperable y autorización de instalaciones específicas. **BT-PILOT-QA-04: A REPASAR**.

> **BT-COM-01A · CANDIDATO DE ARCHIVO DOCUMENTAL PRIVADO (18/11/2026) — CÓDIGO PROBADO, ALOJADO OFF.** Nuevo contrato en `server/com/closingArchiveCandidate.ts` para reconstruir desde revisión CP05 y declaraciones históricas BT-FLOW-LIVE-02 un **manifiesto inmutable de cotización original + informe + constancia**; no regenerar ni sobrescribir el PDF histórico CP05. Recalcula vínculos desde historial seguro, valida SHA-256/tamaño/ruta de cotización, PDF de informe/entrega, aislamiento por taller/revisión/entrega, rol/usuario/estado, confirma read-back privado, revalida antes de registrar, acepta solo reintentos idénticos y rechaza bytes contradictorios. El bucket `bt-closing-documents` es **nombre propuesto, no creado**; los puertos SQL/Storage/Edge/Email no están conectados. **CI [44415765085](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44415765085) SUCCESS: 694/694 Vitest (80 archivos), Web/PWA/Android Expo y PostgreSQL 17 aislado**. Sin cambio alojado en SQL/Auth/RLS/Storage, sin correo, sin suscripciones/pagos, sin datos auténticos. [Diseño, límites y siguientes puertas](docs/BT_COM_01A_ARCHIVE_CANDIDATE.md). **BT-PILOT-QA-04: A REPASAR**.

> **BT-UI-POLISH-01 · DESPLIEGUE AUTORIZADO A RENDER (18/11/2026) — LIVE.** Con autorización explícita del propietario se efectuó un único despliegue manual del servicio **existente** `biomotors-taller-demo` (`srv-dbqe4quc6qcc73f275jg`) al commit `d8d6ed99`. Render confirmó **LIVE** en `dep-dbv2lhk9v7es738g7bug`; el dominio canónico sigue siendo `https://bytetorque.cl`. Sin cambiar variables de entorno ni crear sitios adicionales. Los commits posteriores de BT-COM-01A usan `[skip render]` y **no están desplegados**. La revisión visual física por el Director, Safari iPhone y Android siguen pendientes.

> **BT-UI-POLISH-01 · PULIDO PREMIUM RESPONSIVE (18/11/2026) — CÓDIGO Y QA VISUAL APROBADOS.** Partiendo de `f544c1c5` con los flujos CP06/BT-FLOW-LIVE-02 preservados, se compactaron **(1) acciones y estados vacíos de CP05**, priorizando guardar frente a recargar/descargar y agrupando emisión/correo sin tocar sus bloqueos, **(2) perfil/planes reales de cabecera**, con nombre largo hasta dos o más líneas sin desbordar, rol y chip Básico neutro / Plus azul-corona / Full dorado-diamante (solo a partir de `PlanStatus.effectivePlan` del servidor), y **(3) filas de inspección y pendientes CP04**, manteniendo estados, histórico de órdenes anteriores y la acción «Marcar resuelto». No cambia ninguna función, importe, dato, permiso, subscripción, SQL ni backend. Sin despliegue Render: commits `[skip render]`. CI Web/PWA + Android `44394545056` **SUCCESS**, **684/684** Vitest, PostgreSQL 17 aislado, builds privados y públicos + Android Expo PASS sobre código `84cc2585`; QA visual focalizado con capturas Chromium y datos sintéticos (360, 390, 430, 768, 1366, 1440 y 1920 px) en [GitHub Actions 44394544962](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44394544962) **SUCCESS**. Capturas automatizadas en el artefacto del workflow, sin capturas «antes» automatizadas (referencia visual: tres imágenes aportadas por el Director). Sin prueba física Safari/Android y sin instalación/activación alojada. **BT-PILOT-QA-04: A REPASAR** junto con seguridad final; no abrir ronda general de auditoría por este pulido.

> **BT-CP06-LIVE-02 · HISTORIAL + COPIAS PDF CANDIDATOS (18/11/2026).** El checkpoint `f544c1c5` preparó consultas históricas de las tres declaraciones `operator_attested` por revisión CP05 y taller, y dos copias A4 informativas (informe de trabajos declarados y constancia de entrega), sin firma, correo ni original archivado de estos dos documentos. Continuidad del informe preliminar y del PDF CP05 histórico; funcionalidades nuevas con interruptor privado OFF. Los CI del código `2a23d8db` concluyeron **SUCCESS** (Web/PWA, Android y visual). Pendientes SQL LIVE-02, respaldo integral, autorizaciones Storage/Edge, pruebas físicas, archivo PDF final en servidor y paquete de correo único BT-COM-01 apagado. Checkpoint: `docs/checkpoints/CHECKPOINT_BT_CP06_LIVE_02_HISTORIAL_DOCUMENTOS_20261118.md`.

> **BT-FLOW-LIVE-02 · CANDIDATO VALIDADO EN CÓDIGO/SQL (18/11/2026)** — Integrada la preparación del flujo **revisión de cotización aprobada (declaración del operador) → trabajos realizados (declaración/importe calculado por servidor) → constancia de entrega (declaración del operador)**. Nueva migración aditiva candidata `docs/sql/BT_FLOW_LIVE_02_CANDIDATE.sql`: tres tablas históricas append-only con RLS+FORCE, acceso de lectura sólo a miembros del taller; escritura por RPC privada con actor verificado, revisión CP05 emitida vigente, coincidencia de OT/vehículo/taller, cupo de marca por partida, cálculo neto/IVA CLP y checklist. **NUEVA PUERTA:** `bt_flow_live_private.rollout` está **OFF para todos los talleres**, sin acceso directo de operadores, incluso después de instalar SQL; se requiere aprobación de habilitar expresamente un taller además del flag privado de Render `VITE_BT_FLOW_LIVE_02_ENABLED`, también **OFF**. Interfaz de tres etapas desde CP05 preparada para registro y recuperación tras relogin, sin mostrar constancia como firma, aprobación verificada del cliente, pago ni correo enviado. **CI [44341022910](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44341022910) SUCCESS** sobre código `85a8c7ae`: **673/673 Vitest**, PostgreSQL 17 offline con `BT_FLOW_LIVE_02_LOCAL_FRESH_CONNECTION_PASS`, A/B y revocación, builds público/privado y Android Expo PASS. **No se instaló SQL en Supabase, no se desplegó a Render ni se activaron emails/Storage/Edge.** Próximo trabajo de código: conectar la lectura histórica de declaraciones al historial CP06 y preparar informe/constancia documental final; antes de activar requiere respaldo integral recuperable, permiso explícito de migración, gate de taller, CP05 emisión/archivo operativo y QA físico. **BT-PILOT-QA-04: A REPASAR** al final junto con seguridad integral. Checkpoint: `docs/checkpoints/CHECKPOINT_BT_FLOW_LIVE_02_PERSISTENCIA_ENTREGA_20261118.md`.

> **BT-FLOW-LIVE-01 · INFORME TÉCNICO PRELIMINAR (18/11/2026)** — se implementó en el panel privado CP05 un flujo de **revisión explícita de trabajos marcados realizados/no realizados** a partir de la revisión histórica emitida, separando total cotizado de total seleccionado como ejecutado (neto, IVA, total), exigiendo revisión de todas las partidas, nota de pendientes y confirmación del operador antes de exportar PDF A4 ByteTorque. El resultado es **BORRADOR INTERNO SIN GUARDAR**: no afirma aceptación del cliente, trabajos ejecutados acreditados ni entrega. Se validan taller, OT, vehículo, cliente, cotización, revisión y coherencia de importes del snapshot antes de exportar. **CI [44332804176](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44332804176) SUCCESS:** 663/663 Vitest, 14 nuevos de informe, Web/PWA/Android y builds privados. Se permitió el código `src/entrega/` solo cuando CP05 privado está habilitado, preservando el build público OFF. **Sin activación alojada nueva, sin SQL, Storage, correo, registros de reparaciones, Render ni APK.** Faltan persistencia segura de ejecución/entrega y comprobación física; preparar estos contratos en el roadmap funcional, dejando **BT-PILOT-QA-04: A REPASAR** para la auditoría final. Checkpoint: `docs/checkpoints/CHECKPOINT_BT_FLOW_LIVE_01_INFORME_PRELIMINAR_20261118.md`.

> **DECISIÓN 18/11/2026 — VOLVER AL ROADMAP CP05, SIN NUEVAS RONDAS QA GENERALES.** El propietario solicita finalizar **CP05 (cotizaciones, emisión PDF R3, archivo privado y recuperación CP06)** en el código existente, con pruebas focalizadas por cambio. **BT-PILOT-QA-04: A REPASAR** al final, junto con las comprobaciones integrales de seguridad y piloto; no tratarlo como próximo bloque obligatorio ni ejecutar ahora otra auditoría general. Mantener `main`, estética R2 y los servicios no autorizados desactivados. El aplazamiento de la auditoría no equivale a aprobación para utilizar datos auténticos o instalar migraciones/buckets/Edge/correos sin respaldo y permiso específicos.

> **BT-ANDROID-01 R2 · 18/11/2026:** Android nativo ahora tiene cinco pantallas visuales: Inicio + Órdenes, Clientes/vehículos, Informes/cotizaciones y Configuración. Las cuatro últimas incluyen listados, filtros y detalles con datos ficticios, navegación nativa y bloqueos explícitos de operaciones reales. Commits `45b6260` y `fb5d725`. **GitHub CI `44310171641`: SUCCESS** en TypeScript/Expo/export Android y Web/PWA; **no APK**, no Auth/Supabase nativo, no activación alojada. Próximo candidato BT-ANDROID-02: preparar integración mediante contratos/estados con tests sintéticos; después respaldos/seguridad verificados y autorización para operación real. Checkpoint: `docs/checkpoints/CHECKPOINT_BT_ANDROID_01_R2_CINCO_PANELES_20261118.md`.

> **CP06 recuperación de PDF histórico · 18/11/2026:** código candidato en `b28c150` y ajuste de fixture `932a81c`. Historial ofrece descarga de revisión archivada solo cuando el servidor CP05 esté expresamente habilitado; verifica taller, vehículo, revisión y checksum, sin exponer rutas de Storage. Backend real/bucket/SQL/backup siguen pendientes y OFF. Checkpoint `docs/checkpoints/CHECKPOINT_BT_CP06_PDF_HISTORICO_20261118.md`; CI `44307885401` y visual `44307885443` a confirmar.

> **CP05 archivo privado · 18/11/2026:** terminado el refuerzo de **código candidato de archivado inmutable** en `a120f4f` + correcciones `537071f` y `d70fad0` (validación PDF, rutas UUID, SHA-256, recuperación con tamaño e idempotencia). Verificación general Web/PWA/Android `44306035391` **SUCCESS**. Supabase no cambió: 2 talleres, 0 revisiones archivadas, 0 emisiones pendientes, bucket CP05 ausente, política de Storage ausente, RLS activa. Render permanece en el despliegue anterior; **emisión, archivo y correos siguen OFF**. Plan de autorización: `docs/BT_CP05_ARCHIVE_ACTIVATION_PLAN.md`; checkpoint: `docs/checkpoints/CHECKPOINT_BT_CP05_PRIVATE_ARCHIVE_20261118.md`. Priorización: respaldo recuperable integral, luego solicitud específica de autorización para Storage/SQL/Edge.

> **CP05 R3 · QA por PDF descargado (18/11/2026):** el Director confirmó el nuevo diseño y una partida adicional `Balatas` de $50.000; los dos PDF reales adjuntos demuestran 3→4 partidas, total CLP $107.411→$166.911 (A4, 1 página), sin emisión. Duplicación del aviso tributario detectada y corregida con test en `858f76e`. CI `44304533505` y visual `44304533600` deben consultarse; Render `dep-dbupkl2vcj2c7393dt7g` sin conclusión en el momento de registrar. Documento de continuidad: `docs/checkpoints/CHECKPOINT_BT_CP05_R3_DOCUMENTOS_REALES_QA_20261118.md`. Plantillas propias Plus/Full, archivo privado y correos siguen OFF/sin migración autorizada.

> **CP05 R3 · Validación A4 18/11/2026:** el commit `107b9fd` ajustó los espacios del PDF oficial para tres partidas QA en una sola hoja A4 y corrigió la omisión accidental de datos de contacto en el pie. GitHub Web/PWA/Android `44302886190` SUCCESS; Render `dep-dbupfqe1egvs73b4l7h0` LIVE. El usuario debe verificar la descarga del PDF R3 real; el PDF adjunto anteriormente es el formato antiguo. Plus/Full hojas propias: SQL NO instalado y flag OFF. Checkpoint: `docs/checkpoints/CHECKPOINT_BT_CP05_R3_A4_QA_20261118.md`.

> **CP05 PDF R3 · decisión y avance 17/11/2026.** Plantilla oficial predeterminada reconstruida según referencia visual del Director en `src/cp05/pdf.ts`: A4 con cabecera azul marino/azul ByteTorque, datos cliente/vehículo, tabla, totales, condiciones/observaciones y pie, todo dinámico y paginado. **Plus/Full** podrán subir papelería PDF propia A4 mediante flujo de configuración protegido, pero su SQL y bucket privado son **candidatos NO INSTALADOS**, y el flag `VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED` sigue OFF. Ninguna emisión/archivo/correo real fue activado. Checkpoint: `docs/checkpoints/CHECKPOINT_BT_CP05_PDF_R3_TEMPLATES_20261117.md`. La descarga física del nuevo diseño y las pruebas de seguridad de plantilla premium siguen pendientes. **Regla: checkpoint después de cada tarea concluida.**

> **Cierre de código issue #1 · 17/11/2026:** código publicado hasta `a38ca18`, 621 tests locales PASS; GitHub Verificación [44162550183](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44162550183) SUCCESS Web/PWA y Android; CI visual [44161863355](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44161863355) SUCCESS (frontend e0b5b94 sin cambios posteriores). [Checkpoint consolidado](docs/checkpoints/CHECKPOINT_BT_PLAN_04_IMPLEMENTACION_20261117.md). Nuevos candidatos sin instalar, gate apagado y Render 04A preservado por `[skip render]`. Siguiente operación bloqueada: autorización específica de SQL alojado, precondición de respaldo recuperable, QA real y activación; no se creó Ignacio ni se concedió Full real.

> **17/11/2026 · Implementación issue #1, BT-PLAN-04B/C/D:** alta personal y de taller, sincronización de licencia, invitación/aceptación/desactivación de mecánicos, cupos 4/8 con reservas, perfil/logo privado y marca en nuevas revisiones CP05 implementados en código. Preparación de facturación por eventos firmados y ledger privado, apagada. SQL candidato probado en PostgreSQL 17 local sin red; **no instalado en Supabase**. Nuevo flag `VITE_BT_PLAN04_WORKSHOPS_ENABLED=false`; no se alteraron variables Render, datos, Auth ni RLS alojado. CP04/CP05/CP06 existentes reutilizados, sin habilitar servicios externos. Ignacio no tiene cuenta ni concesión creada por este trabajo. Checkpoint y matriz de aceptación: [BT-PLAN-04 implementación](docs/BT_PLAN_04_IMPLEMENTACION_20261117.md). **Excepción expresa del propietario:** autoriza visibilidad pública temporal, commits y push a main; no publicar secretos ni datos personales. No se cambia la visibilidad desde este trabajo. Las entradas siguientes son historial, no estado actual de implementación.

> **ACTUALIZACIÓN 17/11/2026 · BT-PLAN-04A INSTALADO Y ACTIVADO:** el Director autorizó la migración aditiva al proyecto Supabase `biomotors-taller`. Versión de migración registrada `20261117184100`, nombre `bt_plan04a_personal_entitlements_creator_mfa`. La instalación finalizó `success:true`. Se comprobaron 2 tablas privadas con RLS + FORCE sin permisos directos de `anon`/`authenticated`, 3 RPC con `anon` denegado, `search_path` vacío y comprobaciones internas de membresía, Creador y MFA/AAL2. Pruebas SQL de lectura con JWT simulado: cuenta válida ve Básico personal/taller propio, otro taller denegado, no-Creador no puede listar/modificar planes, Creador con AAL1 no puede conceder; llamadas sin sesión confirmada rechazan con 42501. Los registros persistentes se mantienen: 2 talleres, 5 membresías, 5 usuarios, 1 Creador, **cero derechos personales y cero eventos**; no hubo concesiones ni pagos. `VITE_BT_PLAN04_PRIVATE_ENABLED=true` activado en Render en el servicio existente mediante merge de variables, despliegue `dep-dbua0ru1egvs73fulchg` **LIVE** sobre `d83907f`. La prueba UI real desde navegador del Director y MFA real **sigue pendiente**. 04B (creación de taller), 04C (invitación/cupos), cobros por extras y 04D siguen sin implementar. Advertencias Supabase: funciones SECURITY DEFINER visibles a `authenticated` de forma intencional y protegidas dentro de RPC, tablas privadas sin políticas por denegación explícita; detección de contraseñas filtradas continúa desactivada (previo, sin cambiar). No utilizar datos reales sin completar respaldos.

> **BT-PLAN-04A / 17-11-2026 — BASE DE CÓDIGO LISTA, SQL NO INSTALADO.** Candidato SQL aditivo `docs/sql/BT_PLAN_04A_PERSONAL_ENTITLEMENTS_CANDIDATE.sql` (derechos personales, auditoría, búsqueda creador con MFA, lectura de plan por identidad/miembro de taller); componentes protegidos `src/creator/PersonalAccounts.tsx`, `src/plans/planStatus.ts` y cabecera web/móvil, bajo `VITE_BT_PLAN04_PRIVATE_ENABLED=true`. El nuevo flag **no se activó**; panel antiguo sigue funcionando. GitHub CI verificación #44147631778 **SUCCESS (Web/iOS PWA y Android)**; Render despliegue `dep-dbu9o2ajnfac73bu0i0g` **LIVE**, commit `97e942f`. La base Supabase alojada mantiene 2 talleres, 0 suscripciones de taller; las nuevas tablas/RPC 04A se comprobaron AUSENTES. **No se hizo ninguna concesión a Ignacio ni se habilitaron pagos, talleres nuevos, envíos o datos reales.** Antes de activar 04A se requiere aprobación específica de instalar SQL aditivo en Supabase, validar permisos/RLS, plan Básico/no-membership, aislamiento y MFA en sesión real; recién después activar el flag privado. Respaldo integral sigue pendiente, no confiar datos reales al piloto todavía.

> **BT-PLAN-04 — actualización de producto 17/11/2026:** **BT-PLAN-04 · decisión vigente 17/11/2026:** Cualquier persona confirmada empieza con **Básico personal gratuito, sin creación de taller nuevo**. Puede recibir/comprar Plus o Full **antes** de registrar su propio taller. **Plus USD 5/mes incluye 4 mecánicos; Full USD 15/mes incluye 8; cada mecánico adicional cuesta USD 2/mes al titular del plan**, nunca al trabajador. Propietarios/administradores no ocupan cupos. Ignacio recibirá Full permanente sin cobro, creará Biomotors e invitará a sus 2 mecánicos (2/8). Esta decisión **reemplaza los cupos BT-PLAN-03 (Básico 2, Plus 8, Full 8)**; preserva talleres QA existentes, datos e historiales. No están implementados todavía derechos personales, alta autónoma, cobros de extras o límites aplicados en backend. Ver `docs/BT_PLAN_04_CUENTAS_TALLERES_Y_EXTRAS.md`. **Siguiente bloque:** derechos personales seguros + búsqueda de personas confirmadas desde Panel del creador + etiqueta de plan en cabecera; luego alta autónoma de taller, invitaciones con cupos y finalmente pagos/add-ons. Migraciones alojadas y cobros requieren autorizaciones específicas. Mantener CP05/CP06 y piloto Ignacio como prioridad.

> **BT-AUTH-CORREO-02 / 17-11-2026 — confirmación real y separación de membresía:** diagnóstico de solo lectura alojado: una cuenta recientemente creada por el Director está confirmada en `auth.users`, pero presenta **0 membresías** y no dispone de `public.profiles` (el nombre visible se obtiene de metadatos Auth). El estado `Sin taller autorizado` es correcto mientras no se asigne explícitamente taller y rol. El primer enlace de confirmación mostró indebidamente la plantilla visual `verify` de revisión, con la etiqueta `DEMO` y `Dirección pendiente de verificación`; se separó el estado **confirmación real** de la pantalla previa DEMO, se añadió un botón navegable de acceso y se aclaró el mensaje de no membresía. No declarar «correo confirmado» por visitar un enlace: la verificación real la realiza `getUser()` al iniciar sesión. **No asignar roles, no modificar tablas ni usuarios sin autorización expresa para la cuenta, taller y rol concretos.** Talleres existentes: `Taller ByteTorque de Pruebas` y `Taller ByteTorque B de Pruebas`; elegir explícitamente cuál corresponde antes de autorizar una membresía. Las pantallas visuales de revisión bajo rutas demostrativas se conservan separadas. 

> **BT-AUTH-PERFIL-01 / 17-11-2026 — NUEVO FORMULARIO PUBLICADO; QA REAL PENDIENTE:** el registro Supabase Auth ahora solicita **Nombre completo y Fecha de nacimiento** además de email/contraseña/confirmación. Los datos se validan en la UI y se envían con `auth.signUp(options.data)` como `full_name`/`date_of_birth` (metadatos privados de Auth, no roles ni permisos). El nombre aparece al iniciar sesión en la cuenta visible del header (y en la pantalla `Sin taller autorizado` cuando no hay membresía), priorizando `profiles.display_name` propio por RLS para usuarios anteriores; la fecha no aparece en la interfaz ni se usa para autorización o verificación de mayoría de edad. Sin SQL, migraciones, Storage ni correos adicionales. Cambios: `c0a8ab0` y corrección CI `4badc19`; [GitHub CI 44127295618](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44127295618) **SUCCESS** Web/PWA/Android; Render `dep-dbu8443bc2fs739qhl70` LIVE. La política de privacidad sigue siendo un **borrador pendiente de aprobación jurídica**; se actualizó para informar la recolección. **Al 17/11/2026, Supabase Auth rechazó un intento de registro con HTTP 422 `signup_disabled`**; el Director debe confirmar `Allow new users to sign up` y mantener `Confirm email` antes del ensayo con correo propio. No se asegura correo entregado, cuenta creada o panel operando hasta QA de navegación real. La compra futura de USB/disco externo para segunda copia cifrada sigue pendiente por decisión expresa.

> **BT-DOMINIO-OFICIAL / 17-11-2026 — REGLA PERMANENTE:** por instrucción expresa del Director, `https://bytetorque.cl` es el dominio canónico de ByteTorque para todos los nuevos enlaces al producto; `www` deberá redirigir al dominio raíz. El servicio Render `biomotors-taller-demo` continúa como hosting técnico y acceso de contingencia, **no** como dirección comercial ni como segundo sitio. **Instalación ya completada y probada el 16/11/2026**: NIC Chile configurado con Cloudflare (`hugh.ns.cloudflare.com`, `margaret.ns.cloudflare.com`); Cloudflare CNAME raíz `@` y `www` hacia `biomotors-taller-demo.onrender.com` (DNS only); Render reportó `Verified` para ambos hosts y certificados HTTPS `Issued`; `https://bytetorque.cl` abrió correctamente las rutas de acceso y registro; Supabase Auth ya tenía Site URL `https://bytetorque.cl` y confirmación `https://bytetorque.cl/#/auth/confirmacion`. **Regresión observada el 17/11/2026**: Chrome presentó `ERR_CONNECTION_CLOSED` tras haber funcionado el día anterior. Diagnosticar conectividad de dominio/TLS y red **sin reinstalar ni volver a crear la configuración existente**; confirmar disponibilidad actual antes de otros cambios. Conservar URL técnica de contingencia y configuración de Auth. No activar otros servicios ni alterar CP05 por esta decisión. Reglas durables en `AGENTS.md` y `README.md`.

> **CP05 privado Render LIVE / 17-11-2026 — primera persistencia QA aprobada:** con autorización expresa del Director se actualizó en el servicio existente `biomotors-taller-demo` (`srv-dbqe4quc6qcc73f275jg`) únicamente `VITE_BT_CP05_PRIVATE_ENABLED=true`, manteniendo `VITE_BT_CP05_DOCUMENTS_ENABLED=false` y `VITE_BT_CP05_EMAIL_ENABLED=false`. Render confirmó `dep-dbu7i8bm8hqs73ebns60` **LIVE** (commit desplegado `649a626`); no hubo segundo sitio ni backend/Storage/Edge/correos/pagos. En Supabase alojado, se realizó prueba transaccional con `ROLLBACK` satisfactoria y luego se guardó **una sola cotización totalmente ficticia** de la orden del vehículo de prueba `QA1234`, con 3 partidas, estado `draft`, versión 2 y subtotal neto **CLP 90.261**; consulta posterior independiente confirmó 1 cotización + 3 ítems + mismo subtotal, 0 revisiones emitidas y 0 entregas. Las cuentas existentes de producción no se modificaron; 1 OT y 12 hallazgos preexistentes preservados. Controles alojados por `SET LOCAL ROLE authenticated` y contexto QA sintético en transacciones revertidas: **RLS de taller ajeno negó lectura, Mecánico negó escritura**. Son **pruebas SQL con identidad emulada**, no equivalen a autenticación real desde navegador/iPhone. **Siguiente comprobación humana obligatoria:** acceder a la aplicación privada con cuenta autorizada, abrir `Informes y cotizaciones`, recuperar cotización QA1234, editar/guardar, recargar y cerrar/reabrir sesión; no usar datos de clientes reales. El respaldo cifrado sigue en copia única local; pendiente USB/disco externo anunciado por el Director. 

> **CP05 SQL alojado / 17-11-2026 — INSTALADO Y VERIFICADO, UI Y DOCUMENTOS OFF:** autorización específica del Director recibida y migración aditiva `20261117154854_bt_cp05_quotes_private_rls_pilot` aplicada satisfactoriamente **solo** a Supabase `biomotors-taller` (`suxcqqnmcjoezfxltoms`), partiendo del candidato `docs/sql/BT_CP05_QUOTES_CANDIDATE.sql` (sin los delimitadores `BEGIN/COMMIT` para que el sistema de migraciones gestione su transacción). Comprobación alojada de solo lectura: **5 tablas públicas nuevas y 3 privadas**, las 5 públicas con **RLS ENABLE + FORCE y 5 políticas de lectura**, `anon` sin SELECT ni ejecución de RPC de creación, `authenticated` sin INSERT/DELETE directos y sin acceso a RPC backend `bt_cp05_issue_status`, `service_role` con permiso de recuperación; 0 cotizaciones/partidas/revisiones/eventos. **Se preservaron exactamente los 25 registros previos**: 2 talleres, 4 membresías, 4 perfiles, 1 cliente, 1 vehículo, 1 OT y 12 hallazgos. **No** se habilitó `VITE_BT_CP05_PRIVATE_ENABLED` en Render, ni se creó Storage/bucket/Edge/correo/secretos, ni se hicieron transacciones de QA alojadas ni se introdujeron clientes reales. **Siguiente puerta:** autorización separada para activar solo CP05 privado en el Render existente y probar una cotización completamente sintética desde la cuenta autorizada, con persistencia tras nueva sesión/RLS A-B, sin emisión archivada ni correo; posteriormente autorización específica de Storage y Edge. El respaldo local cifrado sigue siendo único e incompleto respecto de roles/configuración externa; no ocultar esa limitación ni iniciar datos reales sin evaluar el riesgo.

> **Inicio oficial CP05 / 17-11-2026 (decisión del Director):** se da por **cerrada la ronda actual de trabajo de seguridad**, con los riesgos residuales del respaldo único local expresamente reconocidos arriba; este cierre administrativo **no equivale a certificación completa de seguridad ni a autorización de datos reales**. Prioridad operativa: completar CP05 (cotizaciones persistentes, partidas, emisión, PDF privado recuperable), enlazar CP06 (historial) y cerrar QA del recorrido CP03→CP04→CP05→CP06 para que Ignacio use ByteTorque de punta a punta. Conservar los cinco paneles R2, 34 X/autoguardado, PWA iPhone y rama única `main`. **Primer incremento CP05:** proteger el identificador de solicitud al cancelar una emisión pendiente: conservarlo ante fallo o respuesta ambigua, eliminarlo solo tras confirmación; regresión automatizada agregada en `src/cp05/pilotDocuments.test.ts` (resultado CI pendiente). **Siguiente puerta:** verificar CI y preparar aprobación específica de instalación de SQL CP05 aditivo, posteriormente Storage y Edge por separado, manteniendo correos OFF; no cambiar Supabase alojado sin permiso concreto. No repetir auditorías generales ni trabajo de respaldo a menos que surja una incidencia nueva.

> **Continuidad BT-BACKUP-LOCAL / 17-11-2026 (decisión del responsable):** se conserva **un único respaldo cifrado local** en el computador Windows; por ahora NO se crea copia USB, Drive ni otro destino. La exportación `database.dump.gpg` fue descifrada correctamente con GPG, reconocida por `pg_restore` y restaurada con éxito en un PostgreSQL 17.11 de Supabase aislado, con `--no-owner` y `--no-privileges`. En el laboratorio se comprobaron 7 tablas públicas, 25 filas, RLS en 7 tablas y 16 políticas; los conteos por tabla coincidieron con consultas de solo lectura al origen. **Limitaciones pendientes:** exportación de roles fallida (`pg_dumpall`), propietarios/GRANTs no comprobados, otros componentes de Supabase (Auth/Storage/configuración/Edge) no validados integralmente, y **punto único de fallo** al existir solo una copia local. Esta evidencia acredita recuperación SQL de datos públicos de prueba, no protección completa de producción. Por decisión expresa se pausa el trabajo adicional de respaldos y se retoma el desarrollo del piloto de Ignacio. **No autoriza** por sí sola a ingresar datos reales, instalar migraciones en Supabase alojado, activar servicios externos ni hacer cambios destructivos; esas puertas conservan aprobación separada.

> **Auditoría de respaldo 17/11/2026:** causa reproducida en el generador `pg_service.conf` (espacios incompatibles con libpq), corregida y cubierta con prueba de biblioteca real sin conexión. 52 pruebas offline PASS. Autenticación, exportación cifrada a Drive y recuperación real siguen pendientes; no habilita datos de Ignacio. [Informe y siguiente paso](docs/checkpoints/CHECKPOINT_BT_BACKUP_AUDIT_20261117.md).

# ByteTorque — ROADMAP OFICIAL

- **BT-LEGAL-01 (16/11/2026):** borradores públicos de privacidad y términos en `/privacidad` y `/terminos`, con enlaces en acceso/registro, sin cambiar Auth ni activar funciones. Revisión jurídica, identidad/contacto y políticas definitivas pendientes. [Checkpoint y validaciones](docs/checkpoints/CHECKPOINT_BT_LEGAL_01_20261116.md).

**Edición:** v1.8 — Identidad premium R2 OFICIAL + BT-UI-03 Órdenes  
**Fecha:** 2026-11-11  
**Checkpoint de continuidad:** BT-UI-02-R2-APROBACION-20261111  
**Proyecto distinto de:** BIOMOTORS Academia.

## Marca comercial y denominaciones — decisión 11/11/2026

- [x] **Marca oficial del producto SaaS:** **ByteTorque**.
- [x] Distinguir la marca **ByteTorque** de **BIOMOTORS**, primer taller piloto de Ignacio.
- [x] Mantener identificadores técnicos existentes `biomotors-taller` (repositorio, proyecto Supabase y Render), sin renombrar servicios hasta planificar migración.
- [x] Actualizar nombre visible en web/PWA (título, encabezados, manifest).
- [ ] Desarrollar identidad visual/logotipo definitivo **ByteTorque**, basada en los cinco mockups aprobados (sidebar azul marino, blanco, acento azul).
- [x] Crear estructura Android nativa React Native/Expo e Inicio BT-UI-01 (sin APK firmada).
- [ ] Adaptar el sistema visual premium definitivo al Android nativo tras aprobar la experiencia web.
- [ ] Verificar disponibilidad de dominio y eventuales derechos de marca antes del lanzamiento comercial.
- [ ] Revisar y aprobar nomenclatura de PDFs, plantillas, correos y formularios de registro público cuando se implementen.

**Las referencias históricas a los nombres anteriores en checkpoints se conservan para trazabilidad. La marca vigente es exclusivamente ByteTorque.**

## Visión

Crear el sistema más simple y confiable posible para registrar el trabajo diario de un taller mecánico, desde la inspección del vehículo hasta el presupuesto y el historial de reparaciones, y convertirlo en una **plataforma de suscripción mensual para otros talleres**.

### Organización de trabajo

- **Usuario:** líder de desarrollo y operación técnica.
- **Ignacio:** líder comercial y primer usuario piloto.
- Precio objetivo por validar: **US$5 por taller/mes**. No equivale aún a tarifa aprobada para cobro real ni define porcentajes de utilidad.

### Decisión de producto — primero operación completa del taller de Ignacio (15/11/2026)

**PRIORIDAD ABSOLUTA:** terminar, conectar, probar y estabilizar ByteTorque para que **Ignacio pueda usarlo de principio a fin en su taller real**, antes de implementar funciones destinadas a otros talleres. El SaaS multitenant continúa como requisito de arquitectura y aislamiento (no rehacerlo), pero **la captación, onboarding comercial de terceros, suscripciones, cobros y escalamiento (CP07–CP09) quedan POSPUESTOS** hasta la aprobación expresa del piloto completo por el Director e Ignacio.

**Definición verificable de «funciona al 100 % en el taller piloto»:**

- [ ] Ignacio accede desde su **iPhone Safari/PWA** (y escritorio si lo usa), con sesión, roles y permisos reales. Validar dispositivos físicos y manejo de pérdida de red sin exponer registros.
- [ ] Crear, buscar, modificar y reconocer **clientes y vehículos** mediante datos persistentes; evitar duplicados y recuperar vehículos que vuelven.
- [ ] Realizar una **recepción, inspección multipunto, orden de trabajo y cierre** de visita, con fecha, responsable, resultados y observaciones pendientes.
- [ ] Crear **cotizaciones y documentos PDF** correctos; enviar revisión/presupuesto al correo del cliente con consentimiento, proveedor autorizado, historial de entrega y manejo de errores.
- [ ] Consultar **historial completo por vehículo** luego de cerrar y volver a abrir la aplicación, sin pérdida de datos; respaldos y recuperación probados.
- [ ] Confirmar aislamiento del taller por **backend y RLS**, cuentas de trabajo con privilegios mínimos, seguridad de datos y flujo sin credenciales de servicio en clientes.
- [ ] Ejecutar el recorrido real completo en el taller con datos autorizados y registrar **conformidad de Ignacio**. Corregir defectos que impidan operar antes de declarar completado el piloto.
- [ ] Si algún trabajador de Ignacio usa Android, comprobar la **APK nativa firmada** en su dispositivo antes de dar por terminada esa experiencia. No confundir builds Expo con APK instalada; la paridad Android también será obligatoria antes de ofrecer ByteTorque como producto multiplataforma a terceros.

**Método de ejecución obligatorio (15/11/2026):** trabajar por **entrega funcional completa**, con un criterio visible para Ignacio, implementación integrada, pruebas consolidadas, autorización separada de cambios alojados y un único cierre/checkpoint por capacidad; no multiplicar validaciones y subetapas sin un defecto real. Consultar [Método de entregas funcionales del piloto](docs/BT_PILOTO_IGNACIO_METODO_ENTREGAS.md). Esto **no elimina** pruebas de seguridad, RLS, persistencia ni autorizaciones.

**Orden prioritario:** resolver las puertas mínimas de seguridad/identidad necesarias para operar → **CP03 clientes/vehículos reales** → **CP04 inspección/OT y pendientes** → **CP05 cotizaciones, PDF, correo** → **CP06 historial, respaldos, QA iPhone/Android necesario y piloto de Ignacio** → aprobación expresa → **CP07–CP09 comercialización y expansión**.

Las funcionalidades para administrar otros talleres, las páginas de precios, los pagos y las integraciones comerciales no deben desplazar tareas P0 del piloto. Se pueden conservar diseños, tablas y controles de aislamiento ya construidos, sin activarlos comercialmente. «100 %» significa **todas las necesidades acordadas del taller operativas y verificadas**, no ausencia absoluta de todo bug posible. No ingresar datos reales, cambiar secretos, desplegar SQL/Edge ni enviar correos sin superar los controles y autorizaciones correspondientes.

## Distribución OFICIAL — corregida el 11/11/2026

**Android será una aplicación nativa React Native + Expo + TypeScript, distribuida inicialmente mediante APK firmada e instalable directamente, como PUNTO FÉNIX. NO será PWA ni un sitio web en WebView.**

**Únicamente iPhone/iOS utilizará PWA**, accesible desde Safari y agregable a pantalla de inicio. Sin aplicación iOS nativa, Apple Developer, TestFlight ni App Store en esta etapa.

**La versión web de escritorio seguirá disponible por navegador** y utilizará el mismo frontend React + Vite que la PWA de iOS.

| Plataforma | Producto | Tecnología y entrega |
| --- | --- | --- |
| Android | APK nativa | React Native + Expo, archivo APK para instalación directa |
| iPhone/iOS | PWA Safari | React + TypeScript + Vite; Safari → Agregar a pantalla de inicio |
| Computador | Web | Mismo frontend web que la PWA iOS, mediante HTTPS |

### Arquitectura conjunta

- Conservar frontend web/iOS PWA existente en la raíz del repositorio y su demo en Render.
- Conservar la aplicación Android nativa ya creada en `apps/android/` dentro del mismo repositorio privado, trabajando solo sobre `main`.
- Utilizar un ÚNICO backend Supabase `biomotors-taller`, con Auth, tablas, Storage y RLS por `workshop_id`; misma información autorizada en ambos clientes.
- Los componentes React DOM NO se compartirán directamente con React Native; compartir tipos, validaciones y acceso a API cuando sea viable.
- Generar una APK real de prueba usando firma y perfil EAS `android.buildType: "apk"` o un método nativo equivalente; verificar en teléfono Android real.
- La PWA iOS debe probarse desde Safari en iPhone real; no dar por verificada la instalación solo por un manifiesto web.
- Google Play Store y desarrollo iOS nativo quedan para decisiones futuras, sin gastos ni publicaciones autorizados por ahora.
- Mantener sin activar clientes reales, pagos, correos externos o migraciones irreversibles hasta asegurar permisos y recibir autorización.

### Secuencia inmediata

1. Preservar la demo web/iOS publicada en Render.
2. Completar y aprobar cada pantalla primero en la web publicada en Render, compartida con Safari iPhone PWA.
3. Preparar un backend común Supabase seguro por taller, validando la experiencia web y los contratos de API.
4. Una vez aprobadas las funciones y el diseño web, adaptar y verificar el cliente Android nativo React Native/Expo existente.
5. Como última etapa antes del piloto Android, generar una APK firmada, instalarla y probarla en teléfono Android real.
## Requerimientos de Ignacio — conservados

| Código | Capacidad | Prioridad |
|---|---|---|
| BT-R01 | Ficha de revisión/inspección multipunto | P0 |
| BT-R02 | Presupuesto o cotización formal | P0 |
| BT-R03 | Enviar revisión y presupuesto al correo del cliente | P0 |
| BT-R04 | Ficha de cliente y vehículo | P0 |
| BT-R05 | Historial de mantenciones, reparaciones y diagnósticos | P0 |
| BT-R06 | Observaciones sobre fallas no reparadas | P0 |
| BT-R07 | Recuperación de antecedentes en futuras visitas | P0 |
| BT-R08 | Persistencia y respaldo sin depender de memoria o WhatsApp | P0 |
| BT-R09 | Interfaz simple y utilizable en iPhone | P0 |
| BT-R10 | Cuentas separadas y datos aislados por taller (SaaS) | P0 arquitectónico |
| BT-R11 | Alta y gestión de suscripción por taller | P1 comercial |
| BT-R12 | Métricas, seguimiento comercial y soporte | P1 comercial |

## Fases y criterios de aceptación

### BT-CP00 — Definición y planificación — DOCUMENTAL

- [x] Registrar la necesidad principal a partir del audio de Ignacio.
- [x] Definir aplicación independiente de BIOMOTORS Academia.
- [x] Confirmar Android APK nativa + iOS PWA Safari + web; la decisión anterior PWA para Android queda revocada (11/11/2026).
- [x] Registrar que existe un proyecto Supabase independiente denominado `biomotors-taller` según información del usuario (sin afirmar conexión funcional).
- [x] Incorporar meta SaaS multiempresa y roles comercial/técnico.
- [x] Fijar US$5/taller/mes como **precio de referencia, aún no validado**.
- [ ] Recibir o verificar las hojas originales de inspección multipunto y presupuesto para modelarlas exactamente.

### BT-CP01 — Repositorio, fundamentos y entorno — EN DESARROLLO

- [x] Crear y verificar el repositorio privado `Danielsanchezdesarrolador/biomotors-taller` (11/11/2026).
- [x] Instalar este kit documental, con checkpoint BT-CP01 (11/11/2026).
- [x] Incorporar React + TypeScript + Vite, pantalla principal adaptable, navegación y manifiesto web (interfaz demostrativa en `main`, 11/11/2026).
- [ ] Instalar y probar la PWA SOLO en Safari de iPhone; revisar iconos, navegación, tamaños y actualización.
- [x] Crear estructura Android React Native + Expo SDK 57 en `apps/android/`, con Inicio nativo y perfil APK EAS `preview` (11/11/2026). **Firma y APK real pendientes**.
- [ ] Generar primera APK firmada de prueba y verificarla en Android real.
- [ ] Verificar acceso web por URL en escritorio y compatibilidad mínima de navegadores.
- [x] Publicar la demo inicial por Render Static Site, independiente, HTTPS, sin datos reales: https://biomotors-taller-demo.onrender.com — primer deploy `live` confirmado 11/11/2026.
- [x] Generar iconos PNG y manifiesto WEB/iOS PWA, verificar build + Render `live` (deploy `dep-dbqe6ihsrm7s738dnptg`, CI `43106669748` PASS); esto NO constituye una APK Android.
- [ ] Probar PWA Safari con Ignacio en iPhone y APK nativa con un usuario Android; ambas pruebas físicas pendientes.
- [ ] Configurar variables de entorno con secretos exclusivamente fuera de Git.
- [ ] Conectar el proyecto Supabase independiente con la menor cantidad de permisos necesaria.
- [x] Incorporar estructura de pruebas y CI GitHub Actions; ejecuciones verificadas en GitHub el 11/11/2026.
- [x] Confirmar que TypeScript, 3 tests y build aprueban en GitHub Actions: run #43105084982 y run #43105329020, ambas PASS (11/11/2026).

**Salida:** repositorio accesible, aplicación base demostrable, variables seguras y build/test pasando.

### BT-UI-01 — Panel Inicio en web/iOS PWA y Android APK nativa — IMPLEMENTACIÓN DE INTERFAZ

**Referencia visual aprobada:** capturas de diseño escritorio + móviles entregadas por el usuario el 11/11/2026.

- [x] **Web / iOS PWA:** implementar Inicio en React + TypeScript con barra lateral azul marino, cabecera, saludo, 4 métricas, gráfico circular de estado, órdenes recientes, actividad y accesos rápidos.
- [x] **Web / móvil:** tarjetas 2×2, navegación inferior de 5 secciones, búsqueda de órdenes ficticias, filtrado por estados y avisos claros de modo demostración.
- [x] **Android Nativo:** crear UI React Native + Expo desde cero dentro de `apps/android/`, sin WebView; encabezado oscuro, 4 métricas, estados de órdenes, búsqueda, actividad, órdenes y accesos rápidos.
- [x] **Android:** menú y navegación inferior hacia las cinco secciones: Inicio, Órdenes de trabajo, Clientes y vehículos, Informes y cotizaciones, Configuración. Las otras cuatro mantienen pantallas informativas preparatorias.
- [x] Mantener el producto denominado **ByteTorque**, mostrando BIOMOTORS solo como eventual taller piloto, nunca como marca de SaaS.
- [x] Usar únicamente **datos ficticios DEMO** y funciones sin persistencia ni envío de correos.
- [x] Confirmar CI web (7 tests PASS, TypeScript y build PWA), Expo Android (TypeScript, compatibilidad de versiones, bundle Metro y configuración): GitHub Actions #43113368311 PASS (11/11/2026).
- [ ] Verificar visualmente web de escritorio, Safari iPhone y Android real.
- [ ] Generar **APK firmada instalable**, validar permisos/identificador y prueba real en dispositivo.
- [ ] Sustituir datos de muestra por agregados de Supabase cuando existan autenticación segura, tenant y RLS.

**Frontera:** Inicio implementado visualmente, no operación de taller habilitada; sin backend ni APK real en esta fase.

### BT-UI-02 — Inicio PREMIUM en Render, identidad visual OFICIAL — APROBADO

**Referencia:** nuevo mockup premium de ByteTorque compartido por el usuario el 11/11/2026. Esta etapa no convierte automáticamente el sitio en una app nativa.

- [x] Implementar en la web un rediseño del **Inicio** con sidebar azul marino por capas, búsqueda con atajo real Ctrl/Cmd+K, cabecera automotriz vectorial tenue, tarjetas KPI horizontales con detalles, gráfico de dona, listas, etiquetas de estados, actividad y accesos rápidos.
- [x] Mantener **datos ficticios DEMO**, cinco destinos y sin falsas confirmaciones de guardado, emails o cobros.
- [x] Implementar diseño candidato **reversible** en `src/premium.css`, importado después del CSS BT-UI-01 original.
- [x] Conservar cliente Android React Native + Expo BT-UI-01 sin reconstrucciones ni publicar APK en esta etapa.
- [x] Establecer flujo **WEB primero**: revisión en el mismo Render, luego ampliar los paneles web y al final portar la experiencia aprobada a React Native/Expo y compilar APK.
- [x] Confirmar CI del rediseño premium: GitHub Actions **#43115723650 SUCCESS** (web/iOS y Android code); Render deploy **`dep-dbqf4l2jnfac73bf3sb0` LIVE** sobre commit `39b00cfa`.
- [x] **Aprobación visual expresa del Director el 11/11/2026**: R2 queda como identidad premium oficial para los cinco paneles. La prueba física Safari iPhone continúa pendiente.
- [ ] Completar las otras cuatro pantallas con el estilo premium aprobado, considerando acceso público de registro de clientes, seguridad, accesibilidad y responsive.
- [ ] Adaptar las pantallas premium a Android **nativo**, generar APK firmado y realizar QA real (etapa final, aún no realizada).

**Regla:** ningún trabajo web implica que Android esté finalizado; usar `apps/android/` como proyecto nativo existente, con backend único Supabase y sin WebView.

### BT-CP02 — Identidad, talleres y aislamiento — AUDITORÍA DOCUMENTAL INICIADA

**Auditoría de solo lectura del 11/11/2026:** [Plan de arquitectura y seguridad](docs/BT_CP02_ARQUITECTURA_AUTH_RLS.md) · [Checkpoint de auditoría](docs/checkpoints/CHECKPOINT_BT_CP02_AUDITORIA_20261111.md).

- [x] Inspeccionar frontend web y diseño de configuración: actualmente datos DEMO, `supabase-js` no instalado, guardas locales que no representan seguridad real.
- [x] Revisar documentación Supabase vigente y diseñar esquema preliminar de `workshops`, membresías, roles, Auth, RLS y pruebas de acceso cruzado.
- [x] Resolver conexión con Supabase correcta: se confirmó el proyecto **`biomotors-taller`**, ID `suxcqqnmcjoezfxltoms`, `ACTIVE_HEALTHY` (São Paulo); sin tocar Punto Fénix.
- [x] **BT-CP02-B inventario de solo lectura completado**: 0 tablas propias en `public`; 0 usuarios Auth; 0 migraciones del proyecto; 0 buckets/archivos en Storage; 0 Edge Functions. Advisors de salud y rendimiento: sin alertas.
- [x] **Dos advertencias de seguridad del mismo origen**: función `public.rls_auto_enable()`, `SECURITY DEFINER` invocable por `anon` y `authenticated`; está asociada al event trigger `ensure_rls`. Revisión y corrección de privilegios pendiente **antes de migraciones**, sin ejecutar SQL de escritura en esta auditoría.
- [x] Confirmar commit visual de Órdenes `3258858` en la historia de `main` y en el archivo actual; Render está `LIVE` sobre commit documental descendiente sin revertir los dos archivos corregidos.
- [x] **BT-CP02-C borrador listo:** SQL candidato, tablas `workshops`, `profiles`, `workshop_memberships`, permisos mínimos, políticas RLS y revisión del helper `rls_auto_enable` (sin modificar Supabase).
- [x] Preparar controles de catálogo y matriz de 16 casos para verificar usuarios/talleres A/B y evitar autoelevación.
- [ ] **Aprobar explícitamente la candidata** [SQL](docs/sql/BT_CP02_C_SCHEMA_CANDIDATE.sql) y [checkpoint](docs/checkpoints/CHECKPOINT_BT_CP02_C_BORRADOR_20261111.md) antes de aplicar migraciones. No se ha probado aún en PostgreSQL.
- [x] **Autorización y aplicación efectiva de BT-CP02-C, 12/11/2026:** Supabase registró las migraciones `20261112144646_bt_cp02_c_core_tenants_rls` y `20261112145011_bt_cp02_c_backend_service_grants`; tres tablas creadas, cuatro políticas RLS, permisos mínimos; Security Advisor **0 avisos**.
- [x] **Verificación SQL posterior:** sin datos ni usuarios, `ensure_rls` activo, `rls_auto_enable()` no ejecutable por `anon`/`authenticated`, `service_role` con grants administrables, navegador sin permisos de escritura para talleres o membresías.
- [x] **BT-CP02-D — AISLAMIENTO A/B APROBADO (14/11/2026):** 25/25 pruebas con dos usuarios reales de Supabase Auth de ensayo, dos talleres sintéticos y JWT independientes PASS, según ejecución en PowerShell supervisada por el Director. Incluye lectura cruzada denegada, prohibición de autoelevación y desactivación efectiva de membresía. Ver [checkpoint de cierre](docs/checkpoints/CHECKPOINT_BT_CP02_D_AB_PASS_20261114.md).
- [x] **BT-CP02-D backend (12/11/2026):** migración `20261112150019_bt_cp02_d_atomic_owner_onboarding` aplicada; Edge Function `bt-owner-onboarding` desplegada con JWT obligatorio, **desactivada por defecto** y con permisos solo de backend. 0 avisos de seguridad.
- [x] Código y checkpoint versionados: [BT-CP02-D](docs/checkpoints/CHECKPOINT_BT_CP02_D_20261112.md).
- [x] **Prevalidación estructural: 22/22 PASS** en PostgreSQL (RLS, GRANT, permisos públicos y funciones de alta).
- [x] **Suite A/B preparada**: 25 verificaciones con dos usuarios de Supabase Auth, JWT independientes, talleres ficticios y limpieza al terminar, `scripts/security/bt-cp02-ab.mjs`, con control de ejecución explícito. Validación de sintaxis incluida en CI, **sin ejecutar operaciones remotas desde CI**.
- [ ] **Ejecutar suite A/B con credenciales protegidas en equipo del operador**, porque el conector no ofrece Auth Admin y el contenedor no tiene acceso de red. No crear usuarios Auth con SQL. Ver `docs/BT_CP02_D_AB_RUNBOOK.md`.
- [ ] Confirmar resultados auténticos, ausencia de fixtures remanentes y 0 hallazgos en asesor Security antes de abrir registro público.
- [ ] Completar Auth web/PWA, rate limiting, verificación de emails y controles antiabuso, antes de abrir el registro. No introducir clientes reales hasta superar aislamiento.
- [ ] Aprobar propuesta de esquema y matriz de permisos antes de migraciones.


- [ ] Autenticación y recuperación de cuenta.
- [ ] Crear un taller y asociarle usuario(s) mediante membresías.
- [ ] Esquema multiempresa con `workshop_id`, relaciones y RLS por taller.
- [ ] Pruebas de acceso cruzado (un taller no puede ver ni modificar registros de otro).
- [ ] Alta de segundo taller ficticio para validar independencia.

**Salida:** dos talleres de pruebas usan el mismo producto sin compartir información, incluso al consultar API/DB directamente.

### BT-CP03 — Gestión operativa de clientes y vehículos — OPERATIVO EN ESCRITORIO (QA FICTICIO)

**Estado vigente al 15/11/2026: operación real en navegador de escritorio comprobada con datos exclusivamente ficticios.** El Director confirmó que pudo ingresar, crear un cliente, asociar el vehículo, cerrar sesión, reingresar, buscar y editar. Inspección SQL en Supabase alojado confirmó cliente `Cliente Prueba ByteTorque` y vehículo `QA1234`, marca `MarcaDemo`, modelo `ModeloDemo`, año `2020`, **kilometraje almacenado 123456** (no 12346), con `updated_at` posterior al alta. Esto demuestra persistencia hospedada, no solamente simulación. **Pendientes para cerrar aceptación integral CP03:** QA físico en Safari iPhone de Ignacio, contraste de permisos del taller cruzado en entorno alojado y aprobación por Ignacio. Tratamiento de clientes auténticos NO autorizado. No repetir QA de escritorio ya completado.

- [x] **BT-CP03-P1 (15/11/2026, solo candidato):** preparar `public.customers` y `public.vehicles` con `workshop_id`, clave foránea compuesta cliente–vehículo, patente normalizada única por taller, archivado no destructivo y validaciones de contacto chileno, año y kilometraje. Sin RUT obligatorio, sin contactos reales.
- [x] **PostgreSQL 17 efímero:** aplicar el CP02 vigente y el SQL candidato CP03 a contenedor temporal; pruebas de RLS entre talleres, lectura mecánico, creación recepción, fallos de patente duplicada y FK cruzada, sesión desactivada y validación de móvil. [CI #43727156893](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43727156893) **SUCCESS**.
- [x] Revisión de seguridad, respaldo restaurado en PostgreSQL local y autorización explícita de CP03 antes de instalar el SQL alojado; **autorización de datos reales permanece separada**.
- [x] **BT-CP03-P2 (15/11/2026, candidato no público):** contratos de `CustomerRecord`, `VehicleRecord`, validaciones y repositorio Supabase JS en `src/clientes/cp03PilotContracts.ts` y `cp03PilotRepository.ts`: búsqueda por nombre/correo/teléfono/patente, recuperaciones por ID, vehículos asociados, creación/edición con `updated_at` para detectar conflicto. Cada operación verifica `auth.getUser()`, correo confirmado, membresía y taller activos del contexto R1; SQL RLS sigue siendo la autoridad. No se importa desde la app pública.
- [x] **Vitest simulado y protección de bundle:** escenarios de permisos, usuarios inválidos, contactos, UUID, consulta multitenant, rol mecánico solo lectura, creación por recepción, duplicados/errores, edición condicional y reanudación por ID. 45 archivos / **460/460 pruebas PASS** en [CI principal #43728820248](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43728820248); la verificación oficial de build impide incorporar accidentalmente el candidato CP03 al paquete público.
- [x] **BT-CP03-P3 (15/11/2026, interfaz candidata NO pública):** `Cp03PilotDirectoryView.tsx` y estilos `cp03PilotDirectory.css` preparan fichas recientes y búsqueda por nombre/correo/móvil/patente, selección de cliente/vehículo, asociación de vehículos, altas y ediciones con validación, bloqueo de doble envío y mensajes de error/conflicto; no usan registros DEMO. La nueva consulta `recentCustomers()` mantiene filtros de taller y límite 25; el panel exige un repositorio inyectado desde Auth, no activa Supabase por sí mismo.
- [x] **CI CP03-P3:** pruebas de interfaz SSR, consulta reciente y exclusión del bundle oficial; [#43730500005](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43730500005) **SUCCESS, 46 archivos, 465/465 Vitest**, TypeScript, build PWA y bundle Expo Android (sin APK). El guard `verify-official-bundle.mjs` impide incorporar también la vista candidata al frontend público. El resultado NO acredita pruebas móviles físicas ni persistencia remota.
- [x] **CP03 — último avance integrado de ingeniería (15/11/2026, NO operativo):** `cp03PilotAccessBinding.ts` invalida repositorios al cerrar sesión, cambiar de taller/rol, revalidar Auth o perder conexión. Búsqueda de teléfono chileno admite `9XXXXXXXX`, `56 9XXXXXXXX` y `+56 9XXXXXXXX`. La política RLS SQL candidata exige taller activo además de membresía activa; deniega acceso del taller suspendido en PostgreSQL. [Laboratorio CP03 #43732118545](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43732118545) **SUCCESS**; [CI web/Android #43732118518](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43732118518) **SUCCESS, 483/483 Vitest**. Sin publicación CP03, SQL alojado, APK ni datos reales.
- [x] **Autorización específica CP03 recibida (15/11/2026):** el Director autorizó exclusivamente aplicar las tablas `customers` y `vehicles` al Supabase del taller **después de verificar respaldos**; no autorizó captura personal, Auth adicional, correos ni apertura pública.

- [x] **Instalación hospedada CP03 completada (15/11/2026):** tras respaldos manuales y restauración local verificada de Auth (4), talleres (2), perfiles (4), membresías (4), integridad y RLS, se aplicó **solo** `bt_cp03_customers_vehicles_tenant_rls`, versión `20261115205812`, al proyecto `suxcqqnmcjoezfxltoms`. Las dos tablas nuevas están **vacías**, con RLS FORCE, seis políticas, FK compuesta, sin lectura anónima ni DELETE a `authenticated`. CP02 intacto. [SQL candidato original](docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql).
- [x] **Integración privada preparada en código, NO activada públicamente:** el panel de Clientes existente puede cargar el directorio real P3 mediante el mismo cliente SDK de Auth R1 y el binding de sesión P4, con `VITE_BT_CP03_PRIVATE_ENABLED` apagado por defecto. Sin nuevo SDK, credenciales, DEMO, Render Environment ni datos reales. La activación de acceso a las fichas y QA remoto aún requiere aprobación independiente.
- [x] **Respaldo y permiso de migración:** se resolvió la puerta inicial de SQL con exportación `public` + datos y esquema Auth, prueba de recuperación en PostgreSQL 17 aislado y 7-Zip comprobado; no habilita por sí mismo el tratamiento real de clientes.

- [x] **Activación privada aprobada y desplegada (15/11/2026):** en el servicio Render existente `biomotors-taller-demo` sobre `main`, se configuraron `VITE_BT_AUTH_R1_ENABLED=true` y `VITE_BT_CP03_PRIVATE_ENABLED=true`, sin reemplazar otras variables y sin nuevas cuentas, invitados, correos ni datos personales reales. Render confirmó **`live`** en el deploy `dep-dbt22apsrm7s73a0e09g` del commit `a67a43b`. La conexión real se habilita solo tras sesión y rol owner/admin; RLS FORCE y los datos nuevos en cero filas se confirmaron tras publicar. El acceso y persistencia desde navegador real siguen pendientes de prueba, y por tanto CP03 **aún no está cerrado**.
- [x] **CP03 escritorio / persistencia hospedada (15/11/2026):** Director confirmó ejecución de cliente ficticio → vehículo ficticio → logout → login → búsqueda `QA1234` → edición → recarga. Consulta directa PostgreSQL alojada verificó registro y actualización, con odómetro observado **123456**. Sin ingreso de datos personales reales.
- [ ] **Aceptación integral CP03:** comprobar Safari físico del iPhone de Ignacio y autorización/aislamiento entre talleres en alojado, con aprobación final de Ignacio antes de utilizar clientes reales. La casilla P3 NO sustituye políticas y trazabilidad legal de consentimiento.
- [ ] Integrar la fuente PostgreSQL en formularios y búsqueda web/PWA oficial con Auth, roles y consentimiento aprobados; no mostrar un guardado verdadero hasta que exista. Mantener Android nativo separado.
- [ ] Completar la prueba funcional real de crear, editar, buscar por patente/nombre, distinguir retornos y conservar fichas tras recarga. Confirmar con Ignacio los campos definitivos y manejo de duplicados de clientes.
- [x] **UX navegación privada:** recordar sección seleccionada sin persistir fichas ni credenciales en localStorage; reiniciar al cerrar sesión o cambiar taller.
- [x] **UX CP03 — borradores temporales:** al volver de WhatsApp o revalidar sesión, se recupera el formulario no guardado desde sessionStorage por pestaña, con separación estricta por usuario/taller, caducidad de 8 horas, recuperación de ediciones tras consultar ficha real y comprobación del `updated_at` original. No se guarda consentimiento ni credenciales. El borrador se elimina al guardar, descartar o cerrar sesión. En este piloto solo datos ficticios; no confundir borrador local con persistencia Supabase ni aprobar privacidad de datos reales por esta corrección.

[Checkpoint BT-CP03-P1](docs/checkpoints/CHECKPOINT_BT_CP03_P1_20261115.md) · [SQL candidato](docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql) · [Laboratorio CP03](.github/workflows/bt-cp03-postgres-lab.yml).

- [ ] Clientes, vehículos y búsqueda rápida por patente/nombre.
- [ ] Identificación de retornos de vehículos y navegación por historial.
- [ ] Datos de contacto y validaciones útiles para Chile.
- [ ] Resguardos frente a duplicados, edición y errores humanos.

**Salida:** Ignacio puede registrar un cliente y reconocerlo cuando regresa con su vehículo.

### BT-CP04 — Recepción, inspección multipunto, órdenes y observaciones — PILOTO PRIVADO PUBLICADO / QA HUMANO PENDIENTE

**Activación privada CP04 autorizada y realizada (15/11/2026):** se reutilizó el diseño oficial y el directorio CP03, sin generar un segundo sitio ni una DEMO nueva. En `suxcqqnmcjoezfxltoms` se instaló exactamente la migración aditiva `20261115222534_bt_cp04_orders_inspections_tenant_rls`. Antes y después: 2 talleres, 4 usuarios Auth, 4 perfiles, 4 membresías, **1 cliente y 1 vehículo**; 0 relaciones huérfanas. Nuevas tablas `work_orders` y `inspection_findings`: 0 filas, RLS habilitada y FORCE en ambas, 6 políticas, 6 FK, 0 privilegios anon, 0 DELETE authenticated. El Security Advisor mantiene un WARN preexistente sobre contraseñas filtradas, sin modificar Auth. La prueba de sesión autorizada insertó orden ficticia + hallazgo pendiente + cierre en una transacción con `ROLLBACK`: 0 filas persistentes después. Render `biomotors-taller-demo`, servicio `srv-dbqe4quc6qcc73f275jg`, flags `VITE_BT_AUTH_R1_ENABLED=true`, `VITE_BT_CP03_PRIVATE_ENABLED=true`, `VITE_BT_CP04_PRIVATE_ENABLED=true`; deploy `dep-dbt33vvf3r2c73bpoqh0` **LIVE** desde `0b08b16`. CI: [web 511/511 + Android bundle PASS](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43768797984) y [RLS PostgreSQL 17 PASS](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43768798076). **NO significa QA físico ni autorización de fichas reales**. Componentes:
- [x] **Modelo SQL aplicado exclusivamente al proyecto autorizado:** `docs/sql/BT_CP04_ORDERS_INSPECTIONS_CANDIDATE.sql`: órdenes por vehículo, recepción, kilometraje, estado y cierre; puntos de revisión multipunto, diagnóstico original, fecha y observaciones pendientes que acompañan al vehículo entre visitas. FK compuesta por taller, una orden abierta por vehículo, no DELETE de usuarios y RLS FORCE por membresía/taller activos. Las órdenes cerradas no pueden reabrirse; el diagnóstico de una visita cerrada no se altera, solo se puede marcar resuelto el problema pendiente con sello de servidor.
- [x] **Laboratorio PostgreSQL 17 aislado:** `.github/workflows/bt-cp04-postgres-lab.yml` aplica CP02, CP03 y CP04 **solo en contenedor efímero** y comprueba aislamiento A/B, roles owner/recepción/mecánico, duplicados, cierre, problemas pendientes, revocación de membresía y suspensión del taller. [Historial del laboratorio](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/workflows/bt-cp04-postgres-lab.yml).
- [x] **Repositorio y formularios enlazados a Auth R1:** `src/ordenes/cp04Contracts.ts`, `cp04Repository.ts`, `Cp04OrdersView.tsx`, `Cp04PrivatePanel.tsx`, `cp04Draft.ts`; usa el mismo Supabase client de CP03 y comprueba `auth.getUser`, membresía y taller en cada operación. Buscar vehículo por patente, registrar ingreso, consultar órdenes, inspección (correcto/atención/no revisado), marcar observación resuelta, cambiar estado y cerrar conservando historial. Borradores en `sessionStorage` por usuario/taller y máximo 8 h; nunca equivalen a guardado.
- [x] **Integración privada encendida exclusivamente en Render con autorización:** la ruta de órdenes exige Auth R1 y contexto de taller verificado, y su repositorio reutiliza el SDK Supabase de CP03. La configuración por defecto del repositorio permanece OFF para despliegues nuevos no autorizados. La compilación privada fue verificada en CI antes de activar el flag real.
- [x] **Puerta alojada CP04 completada:** autorización expresa del Director recibida, SQL instalado sin tocar CP02/CP03, RLS/verificaciones aprobadas, flag privado activado en Render y publicación `live`. Alcance limitado a usuarios autorizados y fichas completamente ficticias; sin clientes reales, invitaciones, correos, pagos ni comercialización.
- [x] **Recuperación de la hoja multipunto original con X (16/11/2026):** se extrajo el formato oficial de componentes de `src/informes/multipunto/multipuntoData.ts` hacia `multipuntoTemplate.ts` (sin fixtures), compartiendo el selector `MultipuntoTable` con la interfaz autenticada. Una orden CP04 ahora ofrece el botón «Abrir inspección multipunto con X» y guardado individual en Supabase mediante el repositorio R1/RLS existente. Marca verde OK, amarilla atención y roja cambio inmediato (se persiste como `attention` con prioridad explícita en la nota porque el esquema CP04 no incluye `immediate`). No se modifica SQL ni las observaciones anteriores; una nueva revisión conserva historial. El estado en curso se conserva en la misma pestaña al pasar a WhatsApp. Pruebas de UI/datos, builds web y Android integradas al CI.
- [x] **Corrección CP04-X-01 — marcado continuo y autoguardado (15/11/2026):** sin depender del entorno Codex, se implementó directamente en `main` cola por componente (hasta 3 escrituras simultáneas) para las **34 X**; cada componente tiene estado Guardando/Guardado/Error y reintento controlado, sin botón de guardado manual ni navegación repetida. Marcas verdes OK sin observación, amarillas/rojas con descripción inline y nota provisional visible cuando todavía no existe detalle técnico, editable con UPDATE optimista del mismo hallazgo (sin duplicar al editar). Cambio inmediato se identifica como prioridad explícita, acorde a SQL existente. Borradores de sesión separados por usuario/taller/orden y revalidación ante respuestas de red ambiguas. El cierre en la interfaz se bloquea con X pendientes o detalles técnicos provisionales. Se conserva R1/RLS y la hoja DEMO anterior independiente. **No se alteró SQL, permisos ni fichas existentes en Supabase.** [CI TypeScript, Vitest 524 PASS, PWA y bundle Android](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43785200093); Render actualizó `main` a `c222a68`, `live`. **Pendiente:** aceptación táctil desde Android/iPhone y lectura real de diez marcas tras recargar; los tests sintéticos no equivalen a prueba física. La prevención de duplicados tras pérdida de confirmación se basa en reconciliación con servidor; exactitud absoluta requeriría idempotencia del lado de la base de datos, fuera de esta entrega.
- [ ] **Cierre operativo CP04 / acción del Director:** en la web autenticada, entrar a Órdenes → buscar `QA1234` → crear orden ficticia → guardar hallazgo de inspección como «Requiere atención» con nota → cerrar → crear una segunda orden del mismo vehículo → comprobar que el hallazgo siga pendiente → marcarlo resuelto → salir y volver a iniciar sesión. Confirmar persistencia en Supabase y probar Safari físico de Ignacio antes de aceptación final. No ingresar información real. Los 511 test automatizados, RLS y deploy `live` no sustituyen esa comprobación.

### CP04 — Rediseño oficial de Órdenes de trabajo (15/11/2026)

- [x] Integrar la referencia del Director en la pantalla privada existente: encabezado/imagen oficial, aviso de sesión compacto, barra de autoguardado, indicadores 2×2 móvil y tarjetas de órdenes con patente, estado, fecha y kilometraje; iconos genéricos, sin fotografías ni registros inventados publicados.
- [x] Indicadores derivados de los registros autorizados cargados y alcance visible de **hasta 40 órdenes recientes**. Carga/vacío/error diferenciados, sin presentar errores como cero órdenes. Nueva recepción enfoca el formulario real; Actualizar conserva borradores e inspección montada.
- [x] Preservar CP03/CP04, R1/RLS, cinco estados, confirmación de recepción/cierre, 34 X, notas/diagnóstico/pendientes y cola de autoguardado. Corregir repositorio invalidado en StrictMode, impedir acciones sobre el detalle anterior durante apertura y recuperar posición tras WhatsApp/revalidación sin recrear borradores eliminados al salir.
- [x] TypeScript, **525/525 Vitest**, build web/PWA y privado, cinco anchos de navegador; 34 marcas, error/reintento, posición, recepción, cierre y revocación comprobados con **HTTP simulado**; regresiones públicas de cinco paneles y siete pantallas PASS.
- [x] **Publicado en el Render existente y verificado**, código `f987f8f` (`61d058f` integración principal): HTTP 200, CSS CP04 idéntico al build y módulo actualizado; recorrido del frontend publicado en cinco anchos PASS con HTTP interceptado. [Único informe con capturas antes/después y evidencia](docs/screenshots/CP04_REDISENO_20261115/README.md).
- [ ] Resultado CI remoto por confirmar: API de Actions devuelve Forbidden, también con consulta escalada; no equivale a fallo del CI ni a PASS comprobado. El workflow existente repite la regresión sobre build privado de producción.
- [x] Aprobación visual del rediseño otorgada por el Director el 16/11/2026 (informe Codex y commit `4243863`). Se conserva como **pendiente** la prueba física y la persistencia real de las 34 X en Android/iPhone. Sin SQL nuevo, secretos/Auth/RLS ni escrituras alojadas del agente. No abrir checkpoints adicionales.

### BT-CP04 — Inspección multipunto y observaciones — REFERENCIA HISTÓRICA

- [ ] Digitalizar la hoja real de revisión multipunto.
- [ ] Guardar fecha, técnico, resultados, problemas y recomendaciones.
- [ ] Marcar observaciones no reparadas, mantenerlas visibles y darles seguimiento.
- [ ] Guardar historial inalterado de inspecciones anteriores o versiones auditables.

**Salida:** inspección completa y observaciones recuperables un año después.

### BT-CP05 — Cotizaciones, PDF R3, archivo y correo — CÓDIGO CANDIDATO CERRADO / ACTIVACIÓN PARCIAL

**Estado actualizado 18/11/2026 — prevalece sobre la preparación histórica siguiente.** CP05 ya tiene **cotizaciones privadas y partidas persistentes en Supabase con registros exclusivamente ficticios**, PDF R3 borrador descargado y validado manualmente, y código candidato del worker `bt-cp05-documents` para emitir snapshot/revisión inmutables, archivar PDF privado, verificar SHA/tamaño, descargar revisión histórica y registrar intento de correo. El paquete Edge se genera/valida offline en GitHub Actions; **NO se ha desplegado ni activado** y la emisión/archivo/descarga privada continúan bloqueados. El código ahora rechaza un recibo de finalización con revisión, taller, cotización, versión o tamaño distintos de lo archivado. [CI 44326581500](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44326581500): **SUCCESS** Web/PWA + Android, **647/647** Vitest, compilaciones candidatas y paquete Edge offline.  
**Criterio de cierre:** código candidato de CP05 listo para la fase de activación final, **NO CP05 operativo de extremo a extremo** hasta respaldo restaurable, autorización individual de bucket/políticas Storage y Edge, flags adecuados, prueba real A/B, restauración de PDF en navegador físico y aceptación de Ignacio. Correo transaccional de cotización sigue **OFF**; el **correo único de cierre con cotización + informe + entrega** sigue siendo requisito separado **BT-COM-01**, no está implementado ni debe presentarse como enviado. La seguridad final y **BT-PILOT-QA-04: A REPASAR** se revisarán juntos; ninguna de estas tareas impide seguir desarrollando otros módulos candidatos sin tocar infraestructura alojada.



- [x] Contrato de entrega funcional única consolidado el 16/11/2026 en [BT_CP05_ENTREGA_FUNCIONAL.md](docs/BT_CP05_ENTREGA_FUNCIONAL.md). El editor de partidas y el motor de cálculo existentes fueron reutilizados sin importar fixtures; el candidato no equivale a persistencia alojada. SQL y Storage alojados, envío externo y activación privada **no autorizados**. CP05 no está certificado como operativo.

- [x] Preparación técnica integrada en `main`: acceso desde OT CP04 y vehículo CP03, mismo SDK Auth, edición neta/IVA, guardado RPC candidato con concurrencia e idempotencia, historial inmutable y PDF A4 descargable de borrador.
- [x] SQL aditivo/RLS candidato probado en PostgreSQL 17 efímero sin red, incluyendo A/B, roles, persistencia entre conexiones, numeración concurrente, snapshots, anulación y trazabilidad de proveedor sintético. Ninguna migración alojada aplicada.
- [x] Emisión/archivo privados y correo preparados como puertos backend, bloqueados. `VITE_BT_CP05_PRIVATE_ENABLED=false` por defecto; no cambia flags de Render ni secretos.
- [x] Validación consolidada: 552 pruebas, TypeScript, builds público/CP04/CP05/PWA, cinco tamaños y regresión CP04, bundle Android nativo. [Informe único CP05](docs/checkpoints/CHECKPOINT_BT_CP05_20261116.md).
- [ ] Autorizar por separado SQL alojado tras respaldo recuperable, validar persistencia real con nueva sesión, aprobar Storage privado/backend y probar archivo/restauración antes de emitir. Correo requiere autorización independiente.
- [ ] Digitalizar la hoja real de presupuesto, relacionándola con inspecciones y vehículos.
- [ ] Ítems, mano de obra, valores, totales, vigencia y estados.
- [ ] Generar PDF legible e identificable con datos del taller.
- [ ] Enviar revisión y cotización al cliente mediante correo transaccional autorizado.
- [ ] Registrar intentos, errores, fecha y estado de envío.

**Salida:** Ignacio genera documentos y los envía desde la aplicación con trazabilidad, sin confundir cotización con documento tributario.

### Preparación final del piloto — código listo para revisión, servicios pendientes (16/11/2026)

- [x] CP05: puente UI/HTTP autenticado, emisión → readback/hash → finalización, recuperación/cancelación de reservas, descarga privada y envío transaccional con adjunto y trazabilidad; todo candidato/OFF. Se niega envío de revisiones anuladas/reemplazadas.
- [x] CP06 consultó cotizaciones habilitadas en HTTP sintético; se conserva el bloqueo de tablas CP05 cuando OFF y no cambian 34 X/autoguardado.
- [x] QA02: carrera de foco de `verify-qa02-ui.cjs:218` reproducida y corregida puntualmente, sin repetir auditorías completas.
- [x] Exportador cifrado a Drive privado y restaurador offline preparados, con ensayo PostgreSQL/GPG sintético verificado. **No hay respaldo real ni subida a Drive**: faltan conexiones, secretos protegidos, ruta TLS y custodia de claves externas.
- [x] Validación local: 584 tests, TypeScript, builds/PWA, SQL y Storage candidatos en PostgreSQL efímero, navegador 390 y foco 1440/375. CI remoto no verificable por proxy. [Informe único con pasos de navegador y activaciones](docs/BT_PILOTO_PREPARACION_FINAL_20261116.md).
- [ ] Cumplir respaldo real actualizado/recuperable y autorizaciones separadas antes de SQL CP05, Storage, Edge, correos o flags. No iniciar CP07–CP09.

### BT-CP06 — Historial confiable por vehículo — CÓDIGO INTEGRADO, ACTIVACIÓN/QA FÍSICO PENDIENTES

**Actualización 18/11/2026 — estado vigente sobre las entradas históricas posteriores.** El historial privado ya está preparado con conexión de solo lectura a las fichas CP03, órdenes/inspecciones CP04 y cotizaciones/revisiones CP05 habilitadas; mantiene paginación por `opened_at/id`, hallazgos y pendientes sin confundir el cierre de OT con trabajo realizado, enlaces de vuelta a OT/cotización y descarga candidata de PDF histórico protegida por CP05. Se añadió paginación keyset para la búsqueda de todas las cotizaciones vinculadas a la página de visitas (sin límite fijo `20`), y la navegación conserva las páginas del historial cargadas y recupera la posición al regresar de la OT o cotización. La SQL vigente de CP05 limita una cotización por OT; la nueva paginación también endurece futuras ampliaciones/importaciones. **[CI 44329359449](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44329359449) SUCCESS:** Web/iOS PWA y Android, **649/649 Vitest**, 19 pruebas de historial y candidato privado compilado. **No hubo cambios en Supabase ni Render; flag CP06 y archivo privado CP05 no se activaron.** Falta prueba física y recuperación alojada posterior al respaldo/Storage/Edge autorizado. **BT-PILOT-QA-04 continúa A REPASAR al cierre del roadmap**, no bloquea nuevas mejoras de código.



**Decisión de ejecución del Director (16/11/2026):** desarrollar los módulos pendientes desde Codex en la nube y ChatGPT antes de la etapa final de respaldo consolidado, instalación controlada y piloto real. No bloquear cada módulo candidato por un respaldo individual, pero **no modificar Supabase alojado, datos reales, Auth, roles ni desplegar SQL/Storage/Edge/correos** sin respaldo recuperable y autorización aplicable. No declarar CP05 ni CP06 operativos. El respaldo del final no sustituye la protección periódica cuando haya clientes reales.

**Situación vinculante:** CP05 está preparado en `main` y su laboratorio PostgreSQL remoto aprobado en ejecución `43872238209`; las tablas CP05 siguen ausentes de Supabase y el flag privado está OFF. CP03/CP04 ya están alojados. Integrar la vista histórica CP06 inicialmente sobre CP03/CP04 sin depender de tablas CP05 inexistentes, y añadir la capa de cotizaciones únicamente si su flag y contrato están habilitados y la migración ha sido verificada. Entrega de código: `docs/BT_CP06_ENTREGA_CODIGO_HISTORIAL_20261116.md`. No duplicar bitácoras/snapshots ni alterar las 34 X/autoguardado CP04.

- [x] Código candidato CP06: «Ver historial» en la ficha, paginación por fecha/ID sin límite de 40, visitas/hallazgos/pendientes y retorno desde OT/cotización usando módulos existentes.
- [x] Integración CP05 opcional con snapshots/revisiones/eventos; cero consultas CP05 cuando OFF y aviso independiente ante SQL no disponible.
- [x] Código de lectura con revalidación de usuario/correo, rol, membresía y taller, filtros tenant/vehículo y abortado de respuestas obsoletas; pruebas SDK/HTTP sintéticas A/B y cuatro roles. RLS alojada no modificada ni revalidada por CP06.
- [x] Ronda consolidada local: TypeScript, 569 Vitest, builds/PWA público y privados, Chromium 1440/390/375. Sin SQL nuevo ni cambios Android/Auth/multipunto. CI remoto no verificable por proxy `Forbidden`. [Checkpoint único CP06](docs/checkpoints/CHECKPOINT_BT_CP06_20261116.md).
- [ ] **Puerta final consolidada:** respaldo recuperable verificado, migraciones autorizadas, revisión de datos reales, correo/Storage con autorización separada, pruebas de iPhone/Android y conformidad de Ignacio.

**No realizar activación alojada ni dar por finalizada CP06 sin la puerta final y las pruebas físicas.**



- [ ] Historial cronológico unificado por vehículo.
- [ ] Exportación, restauración probada, permisos y políticas de conservación.
- [ ] Pruebas de estabilidad en iPhone PWA Safari, APK Android nativa y web escritorio.
- [ ] Uso real controlado en el taller de Ignacio, con autorización y garantías de datos.
- [ ] Corregir hallazgos del taller piloto antes de vender.

**Salida:** el taller piloto puede usar el sistema en tareas reales de forma segura y encontrar antecedentes históricos rápidamente.

### BT-CP07 — Validación comercial con talleres externos — PENDIENTE

- [ ] Ignacio recluta un grupo piloto reducido de talleres (referencia: 3–5, sujeto a disponibilidad).
- [ ] Onboarding independiente para cada taller, sin intervención manual sobre datos privados.
- [ ] Medir uso, disposición a pagar, volumen de correos y almacenamiento.
- [ ] Estimar costos unitarios reales: base de datos, hosting, envío de emails, soporte, impuestos y cobros.
- [ ] Acordar legalmente propiedad, responsabilidades, facturación y distribución de ingresos.

**Salida:** evidencia de interés comercial y costos antes de habilitar cobros reales.

### BT-CP08 — Suscripciones y comercialización — PENDIENTE

- [ ] Elegir pasarela y moneda/cobro local tras revisar comisiones y normativa.
- [x] **Decisión comercial BT-PLAN-01:** Básico gratis y sin publicidad en lanzamiento; Plus USD 5/mes; Full USD 15/mes por taller; prueba Full 3 días con método de pago y renovación desactivable para evitar cobros involuntarios.
- [ ] Validar impuestos, moneda real de cobro, pasarela, rentabilidad y límites por plan antes de habilitar pagos.
- [ ] Implementar alta, pago, renovación, cancelación y suspensión con seguridad e idempotencia.
- [ ] Asegurar que una suspensión comercial no borre datos de clientes ni historiales.
- [ ] **Propuestas 16/11/2026 por revisar antes de CP07–CP09:** registro abierto para personas naturales, independientes y talleres, Básico 5 clientes y 0 mecánicos (revisaría decisión previa de 2), Plus/Full con colaboradores, política de inactividad sin borrados prematuros; detalles y conflictos en `docs/REGISTRO_IDEAS_PLANES.md` BT-IDEA-013–017. Solo documentación, sin nueva autorización técnica.
- [ ] Lanzamiento comercial progresivo y seguimiento de retención/incidencias.

**Salida:** cobranza recurrente funcional y auditable para talleres que acepten las condiciones.

### BT-CP09 — Escalamiento y mejoras — PENDIENTE

- [ ] Optimización de costos, rendimiento y soporte.
- [ ] Nuevas funciones priorizadas por demanda real, sin comprometer simplicidad.
- [ ] Planes adicionales solo si la economía unitaria lo justifica.
- [ ] Evaluación de expansión fuera de Chile, con requisitos de cada jurisdicción.

## Riesgos obligatorios

1. **Economía unitaria:** Plus USD 5 puede no cubrir correos, almacenamiento, comisiones e impuestos; validar costos, límites y condiciones.
2. **Aislamiento de datos:** un fallo de permisos entre talleres sería crítico.
3. **Formalización comercial:** sin acuerdo escrito podrían existir conflictos sobre código, marca o clientes.
4. **Adopción:** priorizar rapidez y facilidad en móviles; no saturar con campos.
5. **Continuidad:** probar recuperación y respaldo; no basarse únicamente en mensajes de WhatsApp.
6. **Plantillas de Ignacio:** no inventar contenido definitivo de hojas aún no recibidas o verificadas.

## Reglas de actualización del roadmap

- Cada checkpoint cambia estado solo con evidencia de implementación y pruebas; distinguir `documentado`, `en desarrollo`, `verificado` y `publicado`.
- No declarar tareas completadas por estar descritas en un plan.
- Mantener decisiones originales de Ignacio y cambios aprobados por el usuario.
- Registrar cambios relevantes en un nuevo checkpoint y conservar la historia.
### BT-UI-02-R2 — Fidelidad premium del Inicio

- [x] Calibrar proporciones, tipografía, sidebar, tarjetas, dona, listas y accesos contra el mockup del Director.
- [x] Integrar imagen automotriz original realista en WebP, con degradados y fecha dinámica de Chile.
- [x] Validar TypeScript, 11 tests, build PWA y navegador a 1650/1440/375/390/430 px; capturas antes/después.
- [x] Conservar Android nativo, CSS anterior y datos DEMO sin backend.
- [x] Confirmar R2 servido en el Render existente: hashes JS/CSS del build y SHA-256 de imagen coincidentes con commit `c139ec6`.
- [x] **Verificación externa posterior** con conectores GitHub y Render: CI de implementación `#43119179234` SUCCESS y documentación `#43119309468` SUCCESS; Render `dep-dbqfhbl9el5s73er8ucg` LIVE, commit `eb82d27`.
- [x] **Aprobación visual expresa del Director** el 11/11/2026: identidad R2 oficial. Las capturas locales de Codex continúan documentadas como evidencia técnica, no como prueba física iPhone.
- [ ] **Prueba física iPhone Safari/PWA**, y Android nativo/APK en la fase final.

Evidencia y limitaciones: [checkpoint BT-UI-02-R2](docs/checkpoints/CHECKPOINT_BT_UI_02_R2_20261111.md).

### BT-UI-02-R2-APROBACIÓN — Sistema visual oficial y homogeneidad de los cinco paneles

- [x] Director confirma **R2 como referencia premium definitiva** del Inicio (11/11/2026).
- [x] Registrar un estándar único en `docs/SISTEMA_VISUAL_OFICIAL_R2.md` con colores, componentes, comportamiento responsive y regla de no modificar Inicio aprobado.
- [x] Mantener las cinco secciones y metodología web Render primero, iPhone PWA, Android APK nativa al final.
- [x] Preparar brief maestro BT-UI-03 para **Órdenes de trabajo** en `docs/briefs/BT_UI_03_ORDENES_TRABAJO_DIRECCION_ARTE.md`.
- [ ] Diseñar e implementar lista, detalle y creación DEMO de Órdenes de trabajo con visual R2 homogéneo; requerirá aprobación específica antes de siguiente panel.
- [ ] Repetir esta homogeneización en Clientes y vehículos, Informes y cotizaciones y Configuración, sin alterar Inicio R2.
- [ ] Verificación física iPhone Safari/iOS PWA; APK Android nativa y prueba en dispositivo en fase final.

**Fuente de continuidad:** [checkpoint BT-UI-02-R2-APROBACIÓN](docs/checkpoints/CHECKPOINT_BT_UI_02_R2_APROBACION_20261111.md).

### BT-UI-03 — Detalle de orden premium implementado para revisión

- [x] Reutilizar listado y creación DEMO existentes; implementar detalle según mockup con shell R2 intacto.
- [x] Integrar ficha OT-1002, cliente/vehículo, diagnóstico, ocho inspecciones editables, ítems CLP/IVA, pendientes y progreso derivados de estado.
- [x] Acciones DEMO: continuar revisión, informe local, impresión, confirmación de finalización, agregar ítems y avisos de futuras fichas.
- [x] TypeScript, 18 tests, build PWA y navegador 1650/1440/768/390/375 px. Inicio R2 sin diferencias de píxeles a 1650 px.
- [ ] Aprobación visual del Director para OT; prueba Safari en iPhone físico y conexión segura con persistencia en etapa futura.

Evidencia: [checkpoint BT-UI-03](docs/checkpoints/CHECKPOINT_BT_UI_03_20261111.md). No avanzar al panel Clientes y vehículos.
- [x] Publicación del detalle BT-UI-03 comprobada en el Render existente: HTML y bundles coinciden con el build de `9e3b08b`, según Codex.
- [x] **Auditoría remota independiente posterior:** GitHub Actions `#43124464047` sobre `ab51152` **SUCCESS** (web/PWA: 18/18 tests PASS, TypeScript/build/PWA PASS; Android Expo: CI PASS, sin APK). Render deployment `dep-dbqg4m0ae00c738bff40` sobre `ab51152` **LIVE**.
- [ ] **Fidelidad visual independiente:** las capturas locales `/workspace/visual-ui03/detail-1650.png` y `detail-390.png` no están adjuntas ni accesibles desde el chat; el Director aún no aprueba visualmente BT-UI-03.

### BT-UI-04 — Clientes y vehículos, DEMO premium para revisión

- [x] Implementar tres columnas, hero R2, KPI ilustrativos, filtros y selección de cinco clientes sintéticos.
- [x] Ficha rápida/ampliada, vehículos asociados, historial y pendientes filtrados por vehículo; navegación con órdenes DEMO compartidas y retorno a la ficha.
- [x] Nuevo cliente temporal y flujo de registro por enlace estrictamente DEMO, con validaciones y privacidad; sin URL pública, RUT, correo ni persistencia real.
- [x] TypeScript, 24 tests unitarios, build/PWA e interacción en 1650/1440/768/390/375 px; Inicio y detalle OT-1002 sin diferencias de píxeles a 1650 px.
- [x] Guardar capturas de escritorio y móvil en el repositorio para revisión independiente.
- [ ] Aprobación visual del Director y prueba física Safari/iPhone; conexión segura con Supabase en una etapa posterior.

[Checkpoint BT-UI-04](docs/checkpoints/CHECKPOINT_BT_UI_04_20261111.md) · [Contrato de datos y registro DEMO](docs/BT_UI_04_DATOS_Y_REGISTRO_DEMO.md). No avanzar a Informes y cotizaciones.
- [x] Publicación BT-UI-04 verificada en el Render existente: HTML raíz y bundles JS/CSS coinciden byte a byte con el build de `9bf7d3b`. Actions remoto y estado administrativo LIVE no consultables desde este entorno.

- [x] **Auditoría independiente BT-UI-04 (ChatGPT, 11/11/2026):** GitHub Actions `#43130663129` sobre `1280e5e` **SUCCESS** (24/24 tests web PASS, 6 archivos, TypeScript/build/PWA PASS; Android Expo CI PASS, sin APK). Render `dep-dbqgs9psrm7s738hgih0` sobre `1280e5e` **LIVE**.
- [x] **Capturas realmente accesibles desde GitHub**: `docs/screenshots/BT_UI_04_1650.png` y `BT_UI_04_390.png`; revisión visual independiente favorable de estructura R2 en escritorio y móvil, sin desbordamiento horizontal visible. No equivale a aprobación del Director ni a prueba física Safari.
- [ ] Recibir visto bueno visual del Director para BT-UI-04 antes de diseñar o implementar BT-UI-05.

### BT-REQ-REG-VEH-01 — Registro mediante enlace: cliente + vehículo + motivo de visita — APROBADO PARA DISEÑO

**Decisión del Director (11/11/2026):** cuando el taller comparta el enlace individual de registro, **el cliente debe completar sus datos personales y también registrar el automóvil que llevará al taller y describir brevemente el motivo de la visita o los trabajos que solicita**.

- [x] Incorporar a la especificación del formulario público DEMO y de su futuro contrato seguro.
- [x] **Sección 1 — Datos personales**: nombre, email, teléfono, dirección y comuna, respetando política de minimización y privacidad; no solicitar RUT obligatorio.
- [x] **Sección 2 — Vehículo**: marca, **modelo**, **año**, **kilometraje actual** y patente opcional para identificación (si el taller lo necesita). La marca permite distinguir modelos con nombre similar.
- [x] **Sección 3 — Motivo de la visita**: campo breve de texto libre: «¿Qué problema tiene tu vehículo o qué trabajo quieres realizar?»; admitir solicitudes de mantención, diagnóstico o cambio de piezas. Limitar extensión (p. ej. 500 caracteres), sin exigir jerga mecánica.
- [x] Vista previa final para el cliente antes de enviar, indicando que el taller revisará los datos y no se está generando una orden formal automáticamente.
- [ ] En modo real, crear una **solicitud de ingreso pendiente de revisión**, asociada al **taller del enlace, cliente y vehículo**. Ignacio confirmará los antecedentes y podrá convertirla en OT reutilizando el motivo escrito, sin transcribirlo nuevamente.
- [ ] Si el cliente ya tiene vehículo registrado, permitir seleccionarlo o actualizar kilometraje mediante flujo autorizado, evitando duplicados; no basar autorización en una patente escrita.
- [ ] Aplicar reglas de validación, enlaces temporales de un solo uso, verificación de email, permisos por taller, protección antiabuso y RLS. No hacer pública la base ni registrar información sin consentimiento/aviso legal.
- [ ] Ajustar experiencia móvil para formulario corto de tres pasos, alineado con identidad premium R2.
- [ ] **No implementar durante BT-UI-05**: Codex trabaja en Informes y cotizaciones. Este requisito se desarrollará en una etapa específica del registro, luego de su aprobación y con autorización; Android nativo se adaptará al final.

**Definición formal:** [Especificación de registro de cliente, vehículo y visita](docs/BT_REGISTRO_CLIENTE_VEHICULO_VISITA.md).

### BT-UI-05 — Informes y cotizaciones, DEMO premium para revisión

- [x] Composición del mockup con R2 intacto: KPI ficticios, documentos, historial por vehículo, acciones, vista previa y envío DEMO.
- [x] Flujos de informe y cotización con selección de OT, datos compartidos, revisión en memoria, secciones editables, ítems y CLP/IVA reutilizando cálculos de OT.
- [x] Ampliación e impresión de documento HTML, estados históricos ficticios y confirmación/reintento solo simulados; sin correo real ni PDF adjunto inexistente.
- [x] TypeScript, 31 tests, build/PWA, navegador y regresiones en 1650/1440/768/390/375 px; Inicio, OT-1002 y Clientes sin diferencias de píxeles a 1650 px.
- [x] Capturas principales versionadas y contrato de documentos/envío futuro documentado.
- [ ] Aprobación visual del Director, Safari físico, PDF directo y backend seguro con correo transaccional en etapas futuras.

[Checkpoint BT-UI-05](docs/checkpoints/CHECKPOINT_BT_UI_05_20261111.md) · [Documentos y envío DEMO](docs/BT_UI_05_DOCUMENTOS_DEMO.md). No avanzar a Configuración.
- [x] Publicación de BT-UI-05 comprobada en el Render existente: HTML raíz y bundles JS/CSS coinciden byte a byte con el build de `60bc392`. Actions remoto y estado administrativo LIVE no consultables desde este entorno.

- [x] **Auditoría remota independiente BT-UI-05 (ChatGPT, 11/11/2026):** GitHub Actions [#43135258201](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43135258201) **SUCCESS** sobre `ed40c33`; Web/iOS PWA y Android Expo ambos PASS; log web confirma **31/31 tests PASS en 7 archivos**, compilación Vite y PWA assets PASS. Render `dep-dbqheiqjnfac73bhukbg`, commit `ed40c33`, estado **LIVE**.
- [x] Capturas `docs/screenshots/BT_UI_05_1650.png` y `BT_UI_05_390.png` **examinadas directamente desde GitHub**: identidad R2 preservada en el panel Informes; responsive sin desbordamiento horizontal aparente. Evaluación cualitativa favorable, sin reejecutar pixel-diff de pantallas anteriores.
- [ ] **Visto bueno visual explícito del Director para BT-UI-05**; no avanzar a Configuración antes de su autorización. Safari iPhone físico, PDF real y backend seguro siguen pendientes.

### BT-PLAN-01 — Básico, Plus, Full y prueba Full de 3 días — APROBADO PARA DISEÑO

- [x] Básico **gratis sin publicidad durante el lanzamiento**; publicidad posterior no autorizada automáticamente.
- [x] Plus **USD 5/mes** y Full **USD 15/mes** por taller.
- [x] Prueba Full **3 días / 72 horas con método de pago**, sin primer cobro durante trial; mostrar consentimiento explícito y fecha/hora exacta del primer posible cargo.
- [x] Propietario puede **desactivar renovación automática de inmediato** desde Configuración; cancelación confirmada antes del fin evita cobro al vencer, Full sigue hasta la expiración y luego Básico sin pérdida de datos.
- [x] Especificación oficial en docs/PLANES_COMERCIALES_BT_PLAN_01.md y checkpoint docs/checkpoints/CHECKPOINT_BT_PLAN_01_20261111.md.
- [ ] Concretar límites por plan, pasarela, tasas/IVA y cláusulas de contratación.
- [ ] Construir panel de suscripción, consentimiento, cancelación y backend de cobros seguro **solo tras nueva autorización**.

**Estado: decisión comercial, no hay pagos reales.**

### BT-UI-06 — Configuración premium DEMO y preparación multitenant

- [x] Quinta sección con nueve tarjetas, cuatro KPI ficticios, estado del sistema y acciones rápidas; identidad R2 preservada.
- [x] Formularios temporales de taller, marca/logo, usuarios y roles, plantillas reutilizadas de Informes, correo sin proveedor, registro completo DEMO, preferencias, seguridad y suscripción informativa.
- [x] Catálogo BT-PLAN-01 incorporado como información; sin prueba, renovación, cobros, correo o respaldos operativos.
- [x] Contrato multitenant y matriz de permisos futuros, sin migraciones ni RLS ejecutadas.
- [x] TypeScript, 40 tests, build/PWA, interacciones y regresiones en 1650/1440/768/390/375 px; capturas versionadas.
- [ ] Aprobación visual del Director y prueba física Safari/iPhone.
- [ ] Backend seguro, Auth/RLS, proveedor de correo, respaldos y facturación solo con autorización posterior.

[Checkpoint BT-UI-06](docs/checkpoints/CHECKPOINT_BT_UI_06_20261111.md) · [Arquitectura multitenant](docs/ARQUITECTURA_MULTITENANT_CONFIGURACION.md) · [Matriz de roles](docs/MATRIZ_ROLES_Y_PERMISOS.md).
- [x] Publicación BT-UI-06 comprobada en el Render existente: HTML y bundles JS/CSS coinciden byte a byte con el build de `7a040e0`. Actions remoto y estado administrativo LIVE sin acceso desde este entorno.
- [x] **Auditoría externa de ChatGPT 11/11/2026:** GitHub Actions `#43141082423` **SUCCESS** en `04f7bf4` (web 40/40 tests PASS en 8 archivos, TypeScript, build/PWA; job Android Expo PASS, sin APK). Render `dep-dbqi6a2vcj2c73evr1dg`, commit `04f7bf4`, estado administrativo **LIVE**.
- [x] Capturas `docs/screenshots/BT_UI_06_1650.png` y `BT_UI_06_390.png` abiertas y examinadas desde GitHub; continuidad premium R2 adecuada, nueve tarjetas y panel derecho en escritorio, apilado móvil sin scroll horizontal visible. Comparación **cualitativa**; no se realizó pixel-diff independiente.
- [ ] **Aprobación visual expresa del Director** para declarar BT-UI-06 oficialmente aceptada; después definir próxima fase segura sin activar pagos/servicios ni modificar pantallas sin autorización.

### BT-PLAN-02 — Plantillas de informes propias por plan — APROBADO PARA ROADMAP (13/11/2026)

- [x] **Básico gratuito:** crear informes solo con formatos predeterminados ByteTorque; **no puede subir nuevos informes/plantillas propias**.
- [x] **Plus USD 5/mes y Full USD 15/mes:** podrán subir, administrar y reutilizar archivos de formatos propios de informe, privados por taller.
- [x] Durante prueba **Full de 3 días**, la capacidad estará habilitada mientras el plan efectivo sea Full; al finalizar sin renovación se aplican límites del plan al que descienda, sin borrar documentos ni plantillas históricas.
- [ ] Diseñar `Configuración → Plantillas → Mis formatos` y selector de plantilla en «Nuevo informe», usando identidad premium R2; estimar tipos de archivo, cuotas y almacenamiento por taller.
- [ ] Implementar subida/visualización segura, versiones, aislamiento multitenant y control de acceso según suscripción validada; **no habilitar en DEMO actual ni tocar Supabase sin nueva autorización**.
- [ ] Permitir conversión **interactiva** del formato propio solo después de mapear, validar y aprobar sus campos; no prometer que un PDF/Word/Excel se convierte automáticamente.
- [ ] Probar downgrade a Básico conservando lectura/exportación de formatos propios existentes y documentos históricos, aunque ya no pueda usarlos para nuevos informes.

Contrato comercial: [BT-PLAN-01](docs/PLANES_COMERCIALES_BT_PLAN_01.md), § BT-PLAN-02. **Solo documentación: BT-INS-01 sigue en desarrollo por Codex, sin cambiar su alcance.**

### BT-PLAN-IDEAS-01 — Registro continuo de ideas de Básico, Plus y Full (13/11/2026)

**Decisión del Director:** se añadirán gradualmente nuevas funciones a los planes según surjan ideas. Todas deberán **guardarse con trazabilidad** para una revisión comercial integral antes del lanzamiento, sin olvidarlas ni implementarlas automáticamente.

- [x] Crear un [registro maestro evolutivo](docs/REGISTRO_IDEAS_PLANES.md) con identificadores `BT-IDEA-001` en adelante, fecha, plan, decisión, estado y referencias.
- [x] Cargar decisiones actuales: Básico gratuito sin anuncios en lanzamiento, Plus USD 5, Full USD 15, prueba Full 72 h cancelable, registro por enlace, envío de informes PDF y subida de formatos propios en Plus/Full.
- [x] Separar decisiones aprobadas de **propuestas por evaluar**, como límites de uso, métricas/roles avanzados y publicidad posterior al lanzamiento.
- [ ] Con cada idea futura, asignar nuevo ID y conservar historial (nunca borrar sin rastro); enlazar cambios de estado a checkpoint.
- [ ] **Revisión final obligatoria antes de lanzar los planes:** confirmar prestaciones realmente implementadas, límites, costes, rentabilidad, impuestos, condiciones comerciales y aprobación expresa del Director.
- [ ] No agregar funciones al código, activar pagos, alterar Supabase ni modificar el trabajo de Codex BT-INS-01 a partir de este registro sin autorización específica.

**Fuente viva:** [docs/REGISTRO_IDEAS_PLANES.md](docs/REGISTRO_IDEAS_PLANES.md).

### BT-INS-01 — Informe multipunto interactivo DEMO

- [x] Página interior de Informes con 34 componentes / cinco categorías; X única verde, amarilla o roja, limpieza y pendientes explícitos; teclado y controles móviles.
- [x] Datos compartidos OT/cliente/vehículo y branding del taller; adaptador conservador solo para nivel de aceite, sin alterar los ocho controles de la OT.
- [x] Observaciones, fotos temporales validadas, borradores en memoria y cierre DEMO explícito con pendientes, sin correo ni persistencia real.
- [x] Misma hoja en editor/vista previa, impresión A4 con colores y X; PDF de navegador verificado, descarga PDF directa pendiente.
- [x] TypeScript, 48 tests, build/PWA y cinco recorridos de navegador (nuevo y cuatro existentes), en 1650/1440/768/390/375 px; capturas versionadas.
- [ ] Aprobación visual/terminológica de Ignacio, Safari físico, PDF directo y persistencia segura posterior. Auth, onboarding cerrado, RLS, pagos y Android preservados.

[Checkpoint BT-INS-01](docs/checkpoints/CHECKPOINT_BT_INS_01_20261113.md).

- [x] BT-INS-01 publicado en el Render existente: HTML y bundles JS/CSS del build final `e59e899` verificados byte a byte. Cierre 34/34 sin pendientes también PASS; Actions remoto y estado administrativo LIVE sin consulta desde este entorno.


### BT-REG-02 — Registro DEMO de cliente, vehículo y motivo de visita (13/11/2026)

**Estado funcional:** integrado en main como simulación local; **no es un enlace público ni habilita solicitudes reales**. El registro manual BT-UI-04 permanece independiente.

- [x] Reutilizar Clientes y vehículos como punto de entrada; mantener los cinco paneles premium R2, menú y BT-INS-01.
- [x] Formulario de **tres pasos** para nombre, email, teléfono, dirección/comuna opcionales; marca, modelo, año, kilometraje y patente opcional; síntoma/trabajo solicitado hasta 500 caracteres.
- [x] Validar individualmente, mostrar errores accesibles, volver sin perder datos, editar desde el resumen y simular confirmación expresa sin envío.
- [x] Separar clientReportedReason del diagnóstico profesional. Sin orden creada ni cambio en modelos de OT.
- [x] Bandeja de **solicitudes ficticias pendientes de revisión**, dos ejemplos iniciales y nuevas solicitudes únicamente en memoria del panel; al recargar desaparecen las agregadas.
- [x] Explicar planes: Básico manual, Plus USD 5/mes y Full USD 15/mes con función futura, prueba Full de tres días solo cuando exista facturación real; **no hay permisos ni compras implementados**.
- [x] Pruebas unitarias de validación y modelo DEMO; TypeScript y build/PWA mediante CI.
- [x] Revisión de navegador Chromium a 1650/390 px: prueba E2E PASS, captura y revisión del formulario, resumen y bandeja. Artefacto visual del commit 91866d9, run 43508132240. No equivale a Safari físico.
- [ ] Verificar estado de despliegue y contenido efectivo en Render actual; aprobación visual del Director.
- [ ] Probar Safari físico del iPhone; futura adaptación React Native Android nativo sin WebView.
- [ ] **Fase real separada, NO autorizada:** tokens de invitación seguros, consentimientos definitivos, procesamiento backend protegido, cuota/rate limit, RLS multitenant y pruebas A/B con credenciales autorizadas; recepción persistente, correo verificado, deduplicación de vehículo, conversión a OT con confirmación del taller y gestión comercial desde servidor.

Referencias: [BT-REQ-REG-VEH-01](docs/BT_REGISTRO_CLIENTE_VEHICULO_VISITA.md), [BT-UI-04](docs/BT_UI_04_DATOS_Y_REGISTRO_DEMO.md), [BT-IDEA-005](docs/REGISTRO_IDEAS_PLANES.md), [checkpoint BT-REG-02](docs/checkpoints/CHECKPOINT_BT_REG_02_20261113.md). Implementación en src/clientes/RegistroVisitaDemo.tsx, validaciones en src/clientes/registroVisitaData.ts, recepción dentro de ClientesPanel.tsx.

**BT-REG-02 cierre de verificaciones (13/11/2026):** commit 91866d9, GitHub Actions principal 43508132071 SUCCESS (57/57 Vitest, TS/build/PWA, Android Expo); E2E/capturas 43508132240 SUCCESS (1650/390 px, sin escrituras ni persistencia). Pendientes solo revisión visual del Director, confirmación administrativa Render y Safari físico; backend real excluido.

### BT-COT-01 — Cotizaciones e informes de trabajo premium R2 DEMO

- [x] Editor interior integrado desde Nueva cotización, Nuevo informe y acciones del diálogo Generar informe de OT; flujos clásicos y multipunto preservados.
- [x] Ítems editables, confirmación de eliminación/plantilla, validaciones y protección de duplicados; CLP neto/IVA 19 %/total con el cálculo compartido de la OT.
- [x] Cotización propuesta separada de informe: solo trabajos marcados Realizado se imprimen y suman. Antecedente multipunto opcional de la misma OT, sin alterar controles ni pendientes.
- [x] Condiciones/comentarios, borrador temporal, estados y aprobación/finalización simuladas; cambios invalidan aprobaciones. Sin firma, correo ni aceptación legal reales.
- [x] Vista previa e impresión A4; PDF de navegador de una y dos páginas comprobado. Descarga directa pendiente; compartir exclusivamente local/simulado.
- [x] TypeScript, 66 tests, build/PWA, nuevo recorrido en 1650/1440/768/390/375 y regresiones anteriores PASS; capturas versionadas y CI de navegador añadido.
- [x] Confirmación remota de Actions: ejecución `43516223991` SUCCESS, 66/66 Vitest, build/PWA y verificaciones Android PASS. (Codex no pudo consultar Actions en su entorno; se verificó posteriormente con acceso GitHub). 
- [ ] Aprobación visual del Director y prueba Safari físico. Backend, envío/firma, PDF directo y plantillas privadas requieren fases posteriores.

[Checkpoint BT-COT-01](docs/checkpoints/CHECKPOINT_BT_COT_01_20261113.md).

- [x] BT-COT-01 publicado en el Render existente: HTML, JS y CSS del frontend `7c1683f` verificados byte a byte. Compatibilidad del navegador de CI ajustada en `25f1633`; Actions remoto pendiente de consulta autorizada (Forbidden desde este entorno).


### BT-FLOW-01 — Flujo de Trabajo Inteligente y expediente único por visita — NUEVA PRIORIDAD

**Decisión del Director (13/11/2026):** conservar íntegramente los cinco paneles R2 y simplificar el trabajo diario con un recorrido guiado y contextual que enlace **cliente/vehículo → recepción → OT → inspección multipunto → trabajos valorados → cotización → respuesta/aprobación → realización → informe final → entrega**. Los menús laterales continúan disponibles para consulta libre y navegación directa. El operador no debe copiar antecedentes entre pantallas ni buscar manualmente qué hacer a continuación.

**Estado actual:** BT-QA-02 aprobado por el Director; BT-OFICIAL-01A presenta la interfaz pública vacía. A–E sigue preservado en pruebas privadas; los datos reales requieren una etapa de backend aún no autorizada. Base técnica revisada: `e9e2001` (BT-COT-01). Ver [plan maestro BT-FLOW-01](docs/BT_FLOW_01_FLUJO_TRABAJO_INTELIGENTE.md).

- [x] Revisar el cierre BT-COT-01 y confirmar CI remoto: [GitHub Actions 43516223991](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43516223991) **SUCCESS**, 66/66 Vitest, TypeScript, Vite/PWA y Android Expo PASS. El frontend publicado fue verificado por Codex; aprobación visual y Safari físico pendientes.
- [x] Establecer plan documental y reglas de seguridad: único expediente por visita, próximos pasos, posibilidad de retorno y selección de cliente/vehículo existente, sin diagnóstico ni precio inferidos.
- [x] **BT-FLOW-01A — Arquitectura y UX:** mockups y contratos documentados en `88ea19e`, aprobados expresamente como referencia en la orden BT-FLOW-01B/C. Implementación homologada con R2; aprobación final de la nueva interfaz C pendiente del Director.
- [x] **BT-FLOW-01B — Recepción y expediente DEMO:** integrado en `645e2e3`, entidades compartidas en memoria, visitas recurrentes, solicitud confirmada y OT idempotente con vínculos por ID. TypeScript, 74 pruebas y build/PWA comprobados antes de C.
- [x] **BT-FLOW-01C — Inicio y Continuar trabajo:** integrado en `9c12f97`, recepción, expediente y retorno a recursos por ID. Validación final: 76 pruebas, TypeScript/build/PWA y recorridos responsive PASS; aprobación visual y Safari físico pendientes.
- [x] **BT-FLOW-01D — Multipunto, trabajos y cotización (DEMO implementada):** reutilizar BT-INS-01 y BT-COT-01; preparar documentos desde ítems expresamente definidos y valorizados por el mecánico, nunca por deducción del motivo. Respetar aprobación de versión, `performed`, revisiones y pendientes técnicos. Nada se envía ni se aprueba realmente en DEMO.
- [x] **BT-FLOW-01E — Entrega DEMO y QA:** estados de espera/repuestos, negativa, trabajo adicional, cancelación, revisión final y entrega con checklist; cierre vinculado a revisión vigente y trabajos realizados; pruebas unitarias, TypeScript/build/PWA y E2E en cinco tamaños ejecutadas sobre la implementación de E. Revisión visual integral del Director y Safari físico aún pendientes.
- [ ] **Solo fase futura autorizada:** backend seguro multitenant, RLS A/B, historial persistente, enlaces/correos, firma y facturación/planes. Mantener BT-CP02-D reservado a otro chat y sin cambios en Supabase/Auth, secretos, migraciones, pagos ni Android en esta etapa.

**Puerta de arranque:** completar la aprobación visual de BT-COT-01 y validar el diseño de BT-FLOW-01A antes de programar cambios en los módulos aprobados. No se crea sexta sección de navegación ni se modifica código por esta actualización de roadmap.

[Checkpoint de planificación BT-FLOW-01](docs/checkpoints/CHECKPOINT_BT_FLOW_01_PLAN_20261113.md).

**Evidencia BT-FLOW-01A:** revisión de main `c4ccd5f`, CI remoto previo SUCCESS; dos mockups conceptuales entregados en la conversación (no Render ni capturas de la app), especificación técnica y checkpoint en GitHub. No se modificaron archivos React, Supabase, seguridad, los cinco paneles o BT-COT-01. El avance es documental y requiere visto bueno.

[Checkpoint BT-FLOW-01A](docs/checkpoints/CHECKPOINT_BT_FLOW_01A_20261113.md).

### BT-FLOW-01B — Infraestructura DEMO comprobada (13/11/2026)

- [x] Entidades actuales compartidas en memoria; solicitudes estructuradas, nuevas OT e IDs estables disponibles al navegar y en selectores de documentos.
- [x] Expediente por visita, recurrencia de vehículo, recepción original, confirmación/idempotencia de OT y solicitud; vínculos verificados por ID, nunca por patente como autorización.
- [x] TypeScript, 74/74 Vitest, build/PWA PASS antes de iniciar la interfaz C. Motores de inspección y documentos preservados; D/E pendientes.

[Checkpoint BT-FLOW-01B](docs/checkpoints/CHECKPOINT_BT_FLOW_01B_20261113.md).

### BT-FLOW-01C — Inicio, recepción y navegación guiada DEMO (13/11/2026)

- [x] Referencias visuales 01A aprobadas expresamente para esta implementación; Inicio R2 con KPI conservados, Nuevo ingreso, Continuar trabajos y progreso contextual, sin sexto menú.
- [x] Recepción de cliente/vehículo existente o nuevo y solicitud BT-REG-02, confirmación de visita y OT idempotente; borradores independientes conservados al navegar.
- [x] Expediente de siete hitos / nueve estados internos y retorno desde módulos a los mismos IDs de OT, multipunto y documentos. Abrir módulos no completa etapas.
- [x] TypeScript, 76 pruebas Vitest, build/PWA; recorrido nuevo y seis regresiones en 1650/1440/768/390/375 PASS; BT-REG-02 a 1650/390 PASS y capturas versionadas.
- [x] CI remoto confirmado independientemente el 13/11/2026: [GitHub Actions 43525591408](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43525591408) SUCCESS (76/76 Vitest, TypeScript/build/PWA y Android Expo); workflows de BT-FLOW-01/BT-COT-01/BT-REG-02 también PASS en `9c12f97`.
- [x] **Aprobación visual BT-FLOW-01B/C:** el Director aprobó expresamente el 13/11/2026 y autorizó continuar con los tres refinamientos móviles propuestos.
- [ ] Safari físico pendiente. 01D/E siguen por implementar: propuesta/versión/respuesta, ejecución autorizada, excepciones y entrega.

[Checkpoint BT-FLOW-01C](docs/checkpoints/CHECKPOINT_BT_FLOW_01C_20261113.md).

- [x] Publicación BT-FLOW-01B/C comprobada en el Render existente: HTML, JS y CSS de `9c12f97` coinciden byte a byte con el build validado. Actions remoto sin confirmación (Forbidden); revisión del Director pendiente, sin iniciar 01D/E.

### BT-FLOW-01C-R1 — Refinamientos móviles aprobados (13/11/2026)

- [x] Inicio móvil: mostrar solo los primeros **4 trabajos** de forma inicial; «Ver todos los trabajos» expande la lista y «Mostrar menos» la contrae. Escritorio conserva todas las filas. Las búsquedas no deben esconder coincidencias.
- [x] Expediente móvil: mostrar referencia corta de visita, conservar identificador completo en el atributo title y los vínculos internos.
- [x] Hitos móviles: indicación textual de desplazamiento lateral, scroll-snap y márgenes de foco seguros; se preserva el padding safe-area global del menú inferior, sin tocar R2 global.
- [x] Nuevas aserciones E2E en scripts/verify-flow-ui.cjs. Commit funcional `07ae7f5`; [CI principal](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43528004145) SUCCESS (TypeScript/build/PWA/Android) y [E2E cinco tamaños](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43528004301) SUCCESS.
- [ ] Validación en Safari físico iPhone; el CI Chromium no sustituye prueba en dispositivo.

### BT-FLOW-01D — Coordinación de propuestas y cotizaciones por revisión

**Implementada exclusivamente en DEMO** sobre BT-FLOW-01B/C y C-R1, reutilizando los modelos y editores BT-COT-01 y el motor BT-INS-01. Pendiente revisión visual del Director. [Contrato BT-FLOW-01D](docs/BT_FLOW_01D_CONTRATO_IMPLEMENTACION.md).

- [x] Especificar máquina de estados y respuesta **por quoteId + revision**, con aceptación/rechazo/cambios DEMO, caducidad al editar y separación de aprobación simulada frente a aceptación real.
- [x] Implementar preparación de trabajos/repuestos expresamente definidos por el mecánico y cotización a partir de datos verificados, sin inferir precios ni diagnóstico.
- [x] Registrar respuesta DEMO a la revisión vigente y rechazar autorizaciones obsoletas, cruzadas o duplicadas; conservar evidencia temporal y avisos al usuario.
- [x] Precargar informe de trabajo con ítems de cotización vigente **performed: false**, solo tras confirmación humana; sin declarar trabajos realizados ni entrega.
- [x] Verificar rechazo, solicitud de cambios, nueva revisión, doble pulsación, otra visita/OT, IVA, impresión únicamente realizados y ruta manual clásica.
- [x] TypeScript, Vitest, build/PWA, E2E cinco tamaños, regresiones BT-FLOW-01/BT-COT-01/BT-INS-01/BT-REG-02, capturas y checkpoint 01D; revisión visual posterior del Director. Sin Supabase/Auth/RLS, BT-CP02-D, correos, pagos, firmas o Android nativo.

[Checkpoint de aprobación y refinamientos C-R1](docs/checkpoints/CHECKPOINT_BT_FLOW_01C_R1_20261113.md).


**Cierre técnico BT-FLOW-01D:** 91/91 Vitest y TypeScript/build/PWA PASS; propuesta explícita sobre documento canónico, respuesta por revisión, caducidad sin borrar historial y precarga confirmada/idempotente con todos los trabajos sin realizar. Nueva aceptación de otra revisión conserva los informes anteriores. E2E y regresiones en cinco tamaños; BT-REG-02 escritorio/móvil. Cero escrituras de red y cero uso de almacenamiento de datos persistente en los recorridos. [Checkpoint D](docs/checkpoints/CHECKPOINT_BT_FLOW_01D_20261113.md).

- [x] **CI remoto verificado posteriormente desde ChatGPT:** [Actions 43534790714](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43534790714) SUCCESS sobre `ea96945`: TypeScript, **91/91 Vitest (14 archivos)**, Vite/PWA y Android Expo; [BT-FLOW 43534467132](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43534467132) y [BT-COT-01 43534467458](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43534467458) también SUCCESS sobre el commit funcional.
- [ ] Revisión y aprobación visual del Director y prueba física Safari/iPhone. Las capturas de Chromium no equivalen a aprobación ni prueba de dispositivo real.
- [x] **BT-FLOW-01E implementada solo en DEMO**, tras autorización del Director: pausas y motivos, resolución con confirmación, cancelación, entrega condicionada, pendientes multipunto y trabajos no ejecutados explícitos, registro temporal auditable por ID y caducidad si cambian documentos. No hay entrega física, correo ni persistencia.

- [x] Publicación D comprobada en el Render existente: HTML/JS/CSS idénticos al build de `d7ae7c1`; recorrido completo publicado en 1650/390 PASS y capturas reales versionadas. Sin nuevo Render ni rama.


### BT-FLOW-01E — Cierre guiado de visita y excepciones (13/11/2026)

**Estado:** código integrado exclusivamente DEMO; revisión visual y funcional global de las etapas A–E solicitada **al final del desarrollo**, sin nuevas aprobaciones intermedias. [Contrato y decisiones de la etapa E](docs/BT_FLOW_01E_CIERRE_Y_ENTREGA_DEMO.md).

- [x] Pausar visita por repuestos, cliente que no autoriza, revisión técnica, vehículo pendiente, trabajo adicional u otro motivo. Exigir nota y confirmación; resolver con nota y segunda confirmación. Historial temporal de espera.
- [x] Cancelar visita DEMO con motivo y confirmación, sin borrar orden ni documentos, sin presentar cancelación como entrega.
- [x] Entrega con puertas verificables: misma OT, inspección finalizada, propuesta y cotización revisadas, aceptación DEMO vigente por versión, informe Finalizado DEMO con al menos un `performed:true`, ausencia de pausas y cancelación.
- [x] Checklist y dos confirmaciones; identificar repuestos/trabajos sin ejecutar, observaciones técnicas y componentes multipunto sin revisar; exigir explicación expresa al entregar.
- [x] Registro temporal de cierre referenciado por `visitId`, cotización/revisión, respuesta, informe/revisión, totales y fecha; cierre idempotente, y marcado desactualizado cuando cambian antecedentes. No se fabrican diagnósticos ni autorizaciones.
- [x] Diez nuevas pruebas de dominio E, TypeScript, build/PWA y regresiones anteriores: [CI web completo de 101 pruebas](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43537500957) SUCCESS en `b46e074`. [Recorrido E 5 tamaños](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43537784904) SUCCESS en `2cf78d6` antes del último refinamiento de pendientes multipunto.
- [x] **CI/E2E final de `73091cf` verificados:** [GitHub Actions 43538255482](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43538255482) SUCCESS con 101/101 Vitest, TypeScript/build/PWA/Android Expo; [flujo de navegador 43538255549](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43538255549) SUCCESS en 1650/1440/768/390/375, incluidos pausa, solución, entrega, cierre desactualizado y cancelación. Capturas del artefacto 14090382860 disponibles para revisión final.
- [ ] Revisar aplicación completa con el Director y realizar prueba física Safari iPhone; la barra inferior fija y el flujo de cierre deben verificarse en dispositivo.
- [ ] **Backend real, fuera de alcance:** persistencia multitenant, RLS A/B, consentimiento legal/firmas, correo transaccional, pagos, facturación, control de roles y paridad Android. Requieren autorización y auditoría separadas; mantener BT-CP02-D reservado a su chat.

[Checkpoint de cierre BT-FLOW-01E](docs/checkpoints/CHECKPOINT_BT_FLOW_01E_20261113.md).

### BT-QA-01 — Auditoría integral guiada del Director (inicio 13/11/2026)

**Estado: EN EJECUCIÓN; no es aprobación final del producto.** Se auditó la línea base de `main` `4b82f8e`: CI remoto [43538846463](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43538846463) SUCCESS, 101 pruebas funcionales de la entrega E previamente verificadas, [E2E cinco tamaños 43538255549](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43538255549) SUCCESS. Ningún commit de aplicación/modificación R2 autorizado por el inicio de auditoría.

- [x] Leer guía final A–E, checkpoint 01E, HEAD/CI actual y componentes de Inicio/recepción/expediente.
- [x] Abrir matriz de casos Q01–Q16 y hallazgos clasificados en [BT-QA-01](docs/qa/BT_QA_01_MATRIZ_20261113.md).
- [x] Detectar el primer hallazgo editorial verificable: el texto del Inicio `Flujo BT-FLOW-01D/E pendiente` sigue desactualizado (H001). No corregir hasta priorizar.
- [ ] Verificar que Render esté sirviendo la revisión E (no pudo confirmarse desde el acceso actual).
- [ ] Director: probar Inicio y registrar cliente/vehículo ficticio nuevo en navegador/teléfono. Continuar con OT y multipunto solo después del primer bloque.
- [ ] Director: completar pruebas de cotización, respuesta, ejecución, pausa y entrega; reportar fricciones UI y errores con capturas.
- [ ] Safari físico en iPhone: foco, teclado, safe-area, barra inferior, scroll horizontal de hitos; el Chromium CI no lo sustituye.
- [ ] Consolidar matriz de hallazgos priorizados; después preparar BT-QA-02 de corrección (sin alterar backend protegido ni BT-CP02-D).

**Regla:** no introducir clientes reales, envíos, pagos ni persistencia durante el QA. El Director revisa todo el proceso A–E, sin hacer cambios de pantallas durante la recopilación de evidencias.

**BT-QA-01 — Primera observación del Director (13/11/2026):** completó una recepción desde móvil y llegó al expediente sin dificultad; la captura muestra Recepción completada, OT aún sin crear, cinco menús y siete hitos. Q01/Q02 parcialmente verificados; Q04 (creación OT), Safari físico y comprobación de SHA Render siguen pendientes. **Reconfirmado alcance del registro del cliente por enlace individual:** invitación segura del taller → formulario del cliente → solicitud pendiente → revisión humana y conversión a OT; simulación BT-REG-02 ya disponible, función pública real diferida a backend seguro para Plus/Full/trial Full habilitado. Ver [matriz BT-QA-01](docs/qa/BT_QA_01_MATRIZ_20261113.md). No modificar interfaz ni activar envío de enlaces por este recordatorio.

**BT-QA-01 — Recorrido A–E del Director completado en Android (13/11/2026):** capturas verifican precarga de informe desde cotización aceptada DEMO, cuatro ítems inicialmente no realizados, impresión A4 con los cuatro trabajos finalmente ejecutados y entrega 7/7 completada. Camino principal satisfactorio; QA-01 sigue abierto por excepciones, revisión PDF hoja adicional, Safari físico y correcciones UX. **Nuevo requisito prioritario BT-COM-01:** al cerrar visita, preparar **un único correo consolidado** con cotización aprobada, informe técnico/realizado y constancia de entrega; solicitud previa de autorización de cotización debe poder hacerse por un canal seguro aparte antes de reparar. Diseño en [BT-COM-01](docs/BT_COM_01_CORREO_CONSOLIDADO_ENTREGA.md). Aún no implementado; no activar correo, Supabase ni pagos por esta actualización.

### BT-QA-02 — Correcciones de usabilidad verificadas con el Director

**Estado: APROBADA VISUALMENTE por el Director, 14/11/2026.** Base real comprobada antes de modificar: `main` en `1a4c6ff`. [Orden oficial BT-QA-02](docs/BT_QA_02_ORDEN_CODEX.md) · [Matriz de hallazgos BT-QA-01](docs/qa/BT_QA_01_MATRIZ_20261113.md).

- [x] **H004 P1:** primera vista de cotización **compacta en móvil**, con lista de ítems, cantidad, precio unitario, total, subtotal/IVA/total y acceso a edición completa; escritorio y modo informe intactos.
- [x] **H003 P2:** retirar «Cargar plantilla» del flujo guiado de propuesta, preservando plantillas del editor avanzado y añadir/editar/eliminar ítems.
- [x] **H005 P2:** colocar pausa y cancelación bajo «Opciones de visita», preservando estado visible, alertas, resolución y confirmaciones.
- [x] **H002 P2:** cambiar «Finalizar y enviar» en multipunto por «Finalizar inspección DEMO» sin enviar correo/PDF; actualizar modal e icono.
- [x] **H001/H006 P2–P3:** eliminar aviso desactualizado BT-FLOW-01D/E pendiente y sustituir estados técnicos visibles como `en_curso` por lenguaje natural.
- [x] **R005 P2:** investigar posible segunda página en blanco al imprimir A4 en Android; corregir estilos solo si se reproduce y no recortar contenido legítimo.
- [x] TypeScript, **103/103 Vitest**, build/PWA, regresiones A–E y cinco paneles, E2E 1650/1440/768/390/375, capturas antes/después y checkpoint. Actions remoto verificado posteriormente desde ChatGPT: [CI final 43547511794](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43547511794) SUCCESS sobre `9495e05` (103/103 Vitest, 16 archivos, build/PWA y Android Expo); [BT-FLOW-01 43546894985](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43546894985) y [BT-COT-01 43546894989](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43546894989) SUCCESS sobre implementación.
- [x] Director aprueba BT-QA-02 y autoriza BT-OFICIAL-01A (14/11/2026); backend y BT-COM-01 no autorizados.

**Fuera de alcance:** [BT-COM-01](docs/BT_COM_01_CORREO_CONSOLIDADO_ENTREGA.md) sigue reservado para posterior fase segura (correo consolidado y adjuntos PDF reales). No envíos, backend, Supabase/Auth/RLS, BT-CP02-D, pagos, firma ni Android nativo. No crear ramas ni otro Render.


**Resultado BT-QA-02:** H001–H006 corregidos; resumen móvil de 4/8/12 partidas y estado vacío, edición completa, revisión/aceptación e informe preservados, espera/cancelación agrupadas con confirmaciones y foco. R005 investigado: cuatro trabajos producen 1 página A4, contenido largo 2 páginas no vacías en Chromium y emulación Android a 390/375; estilos print intactos al no reproducirse el defecto. Quedan prueba en dispositivos físicos y aprobación visual. [Checkpoint QA-02](docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md).

- [x] BT-QA-02 publicada en el Render existente: frontend `2529494`, HTML/JS/CSS comparados byte a byte y recorrido completo publicado 1650/390 PASS. Sin nuevo servicio ni rama; sin BT-COM-01/backend.

### BT-OFICIAL-01 — Transición del frontend DEMO a ByteTorque oficial (aprobación 14/11/2026)

**Autorización del Director:** iniciar la preparación de la versión oficial y retirar de **las pantallas públicas** nombres, clientes, vehículos, OT, usuarios y estadísticas ficticias. **No** significa activar operaciones con datos reales sin persistencia y seguridad. [Especificación y puertas de lanzamiento](docs/BT_OFICIAL_01_TRANSICION_PRODUCTO.md).

- [x] Auditoría inicial de código: fixtures `demoWorkOrders`, `demoClients`, `demoVehicles`, métricas del Inicio fijas, configuración/miembros y talleres ficticios; `flowSession` de memoria temporal. La interfaz actual NO es todavía apta para operar con clientes reales.
- [x] **01A — Codex, frontend oficial limpio:** conservar R2/cinco paneles; quitar información de muestra de ejecución pública; estados vacíos útiles para todas las secciones; cero estadísticas inventadas.
- [x] Separar fixtures para pruebas automáticas no expuestos por URL/flag pública; preservar las 103 pruebas y el flujo E2E dentro de un harness controlado.
- [x] Eliminar `DEMO` como branding público sin ocultar limitaciones: mientras no exista backend autorizado, mostrar «Acceso seguro y guardado permanente en preparación» y bloquear entradas que pudieran confundirse con registros reales.
- [x] TypeScript, Vitest, build/PWA, cinco tamaños, regresiones, capturas antes/después y checkpoint `BT-OFICIAL-01A`; no publicar una apariencia de producción que permita perder datos reales.
- [x] Publicación controlada y verificación de HTML/JS/CSS/manifiesto en el Render existente. Revisión visual del Director pendiente. La URL `biomotors-taller-demo.onrender.com` no se considera dominio comercial oficial; su cambio requiere decisión separada.
- [x] **01B — puerta de validación Auth/RLS A/B superada (14/11/2026)** con 25/25 pruebas reales y limpieza comprobada.
- [ ] **01B — implementación pendiente:** conectar backend seguro, registros, historial y respaldos en entregas incrementales, sin datos reales antes de autorización.
- [ ] **01C:** correo consolidado BT-COM-01, solicitud previa de aprobación, enlace seguro de cliente, PDF versionado y piloto BIOMOTORS, tras puertas de seguridad.

**No autorizado en 01A:** Supabase/Auth/RLS/migraciones, BT-CP02-D, `bt-owner-onboarding`, claves, pagos, firma, correos reales ni Android nativo. No crear otras ramas, Render o estudios.


**Resultado BT-OFICIAL-01A:** interfaz pública sin registros precargados, cifras inventadas, perfil de muestra ni operaciones que reciban datos personales; cinco paneles R2 y estado honesto sin configuración. Fixtures extraídos e inyectados solo en Vitest/harness loopback. **111/111 pruebas**, TypeScript, build/PWA, grafo público limpio, cinco paneles en 1650/1440/768/390/375 y regresiones privadas A–E/REG/INS/COT/configuración PASS. Publicación y capturas reales: [checkpoint 01A](docs/checkpoints/CHECKPOINT_BT_OFICIAL_01A_20261114.md). [Inventario](docs/BT_OFICIAL_01A_INVENTARIO_20261114.md).

- [ ] Revisión visual del Director de 01A y pruebas físicas Safari/iPhone. No equivale a habilitar datos reales.
- [ ] 01B / BT-CP02-D siguen reservados; no se inició Auth/RLS, persistencia, correo, cobros ni piloto real.


**Auditoría independiente 14/11/2026:** [CI final 43553527817](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43553527817) y [UI pública 43553527881](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43553527881), ambos **SUCCESS** en `874b39a`. Revisión preliminar de Inicio/Clientes/Configuración móvil y escritorio sin hallazgos bloqueantes; aprobación del Director y Safari físico pendientes. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_OFICIAL_01A_20261114.md).

### BT-AUTH-01 — Acceso con correo verificado y dos entradas por rol (14/11/2026)

**Solicitud del Director:** antes de activar la base operativa, incorporar inicio de sesión con verificación de correo, accesos visuales **«Administrador del taller»** y **«Mecánico»**. El administrador gestiona las operaciones autorizadas del taller; el mecánico ve sus OT asignadas, multipunto, observaciones y trabajos técnicos, sin información financiera, gestión completa de clientes ni configuración administrativa. El rol **no lo elige** el usuario; lo verifica el servidor por membresía activa. [Contrato BT-AUTH-01](docs/BT_AUTH_01_LOGIN_ROLES_CORREO.md).

- [x] Revisar arquitectura Auth/RLS, matriz de roles, checkpoint CP02-D, runbook A/B y estado oficial BT-OFICIAL-01A; verificar documentación actual de Supabase.
- [x] Diseñar dos entradas R2 y credenciales compartidas, correo verificado, recuperación, estados pendientes/desactivados, invitación exclusiva del mecánico y matriz de permisos por acción.
- [x] **BT-AUTH-01A — implementación visual:** siete pantallas R2, dos entradas, revisión explícita sin sesión, cinco paneles vacíos y vista técnica de mecánico; cuenta ficticia solo en harness privado. **125/125 pruebas (111 preservadas + 14 nuevas)**, TypeScript/build/PWA y cinco tamaños. [Checkpoint y evidencia](docs/checkpoints/CHECKPOINT_BT_AUTH_01A_20261114.md).
- [x] Publicar BT-AUTH-01A en el Render existente: frontend `0fc21ad`, archivos comparados byte a byte y recorrido publicado de siete pantallas a 1650/390 PASS. Rutas hash `/#/acceso`, sin cambios de infraestructura ni Auth.
- [ ] Aprobar visualmente BT-AUTH-01A por el Director y probar Safari/iPhone y Android físicos; verificar CI remoto de esta entrega. No equivale a Auth real.
- [x] **Puerta BT-CP02-D completada en el chat reservado (14/11/2026):** 25/25 PASS, comprobación remota de limpieza (0 usuarios, talleres, perfiles, membresías y sesiones), RLS activo y asesor de seguridad con 0 alertas. No equivale a habilitar el registro público ni a permisos de módulos futuros.
- [ ] **BT-AUTH-01B:** tras A/B aprobado, habilitar Auth correo verificado, sesiones, recuperación, invitación/revocación de mecánicos, autorización RLS, permisos por OT y taller. No habilitar alta libre de administrador ni claves de servicio en cliente.
- [ ] **BT-AUTH-01C:** módulos operativos por rol, panel de mecánico simplificado y gestión de personal autorizada. Probar acceso cruzado entre talleres, OT no asignada, URL forzada, sesiones inválidas y Safari iPhone. Android React Native posteriormente.

**No autorizado todavía:** registro público real, habilitar `BYTETORQUE_ONBOARDING_ENABLED`, tocar Supabase/Auth/RLS, crear mecánicos reales, enviar correos, conectar datos personales ni activar pagos. Mantener BT-COM-01 separado: correos Auth de verificación del personal no son el correo consolidado al cliente.


### BT-PLAN-03 / BT-IDEA-013 — Cupos de mecánicos por plan (14/11/2026)

**Decisión comercial expresa del Director para `Configuración → Usuarios y permisos`:** el Administrador del taller puede invitar/desactivar mecánicos de su propio taller, con cuotas **Básico 2**, **Plus 8**, **Full 8** por taller. El propietario y los administradores no consumen cupos de mecánico; otros límites de cuentas no han sido fijados. En prueba Full autorizada se aplica temporalmente 8. [Contrato comercial](docs/PLANES_COMERCIALES_BT_PLAN_01.md) · [idea registrada BT-IDEA-013](docs/REGISTRO_IDEAS_PLANES.md) · [especificación Auth](docs/BT_AUTH_01_LOGIN_ROLES_CORREO.md).

- [x] Registrar cupos en BT-PLAN-03, matriz de roles y BT-AUTH-01 como **Aprobada para diseño**.
- [x] **BT-AUTH-01A, solo presentación:** Usuarios y permisos muestra listado vacío, invitaciones pendientes 0, plan Sin configurar y referencias Mecánicos 0/2, 0/8 y 0/8; Invitar mecánico deshabilitado. Ningún plan activo ni invitación real.
- [ ] Conectar contador al plan/membresías autorizados del servidor cuando se apruebe la fase real; las referencias visuales no aplican cupos ni conceden acceso.
- [ ] Backend debe comprobar cupos activos y reservas de invitación vigentes en operación atómica; impedir invitaciones excedentes y acceso a talleres ajenos, sin habilitar Auth ni RLS en la fase visual BT-AUTH-01A.
- [ ] Antes de activar cambios reales de plan, acordar tratamiento de exceso de mecánicos al bajar a Básico **sin borrar historias ni desactivar usuarios silenciosamente**.
- [ ] Pruebas del límite Básico 2→3 y Plus/Full 8→9, concurrencia, revocación de invitación, email confirmado y bloqueo de autoelevación. BT-CP02-D sigue en el otro chat.


**BT-AUTH-01A — Verificación CI remota posterior (14/11/2026):** [workflow 43603192218](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43603192218) **SUCCESS** para `45e5200` (125/125 Vitest en 18 archivos, PWA y Android Expo); [interfaz pública 43602975602](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43602975602) y regresiones asociadas SUCCESS. Capturas de acceso, registro, mecánico y Usuarios y permisos revisadas preliminarmente sin hallazgos bloqueantes; aprobación del Director y Safari/iPhone físicos pendientes. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_AUTH_01A_20261114.md).


### BT-AUTH-01A-R1 — Entrada inicial (14/11/2026)

- [x] Abrir `/` muestra acceso desde el primer render y reemplaza la URL por `/#/acceso`, compatible con Render Static Site y sin entrada extra de historial.
- [x] `Ver interfaz pública sin sesión` abre `/#/revision/publica`; revisión explícita de cinco paneles, recarga y regreso al acceso.
- [x] Preservar siete pantallas, Administrador/Mecánico, enlaces directos y harness privado; sin Auth ni permisos reales.
- [x] 135/135 pruebas (125 preservadas + 10 nuevas), TypeScript/build/PWA y recorridos de acceso/paneles en cinco tamaños. Inicio del manifiesto `/` y service worker verificados.
- [x] Publicación R1 en el Render existente: frontend `6ab5de0`, HTML/JS/CSS/recursos comparados byte a byte y entrada por raíz/recarga/historial/enlaces/previsualización verificados en Render 1650/390.
- [ ] Revisión del Director y apertura desde PWA instalada física: instalación automatizada no disponible en este Chromium (`kWebAppDisabled`). [Checkpoint R1](docs/checkpoints/CHECKPOINT_BT_AUTH_01A_20261114.md#bt-auth-01a-r1--entrada-inicial-y-previsualización-explícita-14112026).


### BT-BRAND-01 — Identidad gráfica definitiva (14/11/2026)

- [x] Director aprueba los dos PNG oficiales. Originales RGBA intactos, transparencia comprobada y hashes del ZIP versionados en `assets/brand/originals/` y catálogo de procedencia.
- [x] Reemplazar marca provisional de siete pantallas, cinco paneles/navegación y área técnica; horizontal con soporte claro y dimensiones responsive, iconos funcionales conservados.
- [x] Mantener identidad comercial del taller en cotizaciones, informe y multipunto; atribución discreta «Software ByteTorque», logo del taller configurable y BIOMOTORS sin asignación automática.
- [x] PWA/favicon/Apple Touch/maskable oficiales; generador Node por copia de derivados versionados con hashes. Alias SVG histórico contiene el PNG oficial, sin redibujarlo. Conservar `id`, `start_url`, scope y entrada R1; versión de URL/iconos y revisión SW, sin caché de datos.
- [x] Recursos Expo (icono, adaptativo, splash y header) preparados, TypeScript/configuración/bundle Android verificados; sin APK ni adaptación funcional.
- [x] 141/141 pruebas (135 preservadas + 6 de marca), TypeScript/build/PWA, acceso/paneles/marca en cinco tamaños, regresiones A–E/INS/COT/Informes y A4 sin páginas en blanco. [Checkpoint y capturas](docs/checkpoints/CHECKPOINT_BT_BRAND_01_20261114.md).
- [x] Publicar en el Render existente: frontend `9b87866`, HTML/JS/CSS/recursos y alias histórico comparados con el build; siete pantallas, cinco paneles y marca verificados en Render 1650/390.
- [ ] Revisión visual del Director y prueba física de iconos PWA/Safari/iPhone/Android. Algunos navegadores pueden requerir quitar y volver a añadir el acceso para actualizar el icono; no cambia la identidad de la aplicación.

No se inició Auth real, Supabase/RLS, backend, planes/pagos/correo ni adaptación funcional Android.


**BT-BRAND-01 — CI remoto verificado posteriormente (14/11/2026):** [workflow 43615950760](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43615950760) **SUCCESS** en `1430cea`, 141/141 Vitest (20 archivos), PWA/recursos de marca y Android Expo PASS sin APK. [Verificación de interfaz oficial 43615950713](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43615950713) SUCCESS. Capturas de login/iconos/A4 revisadas preliminarmente; aprobación del Director e instalación física pendientes. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_BRAND_01_20261114.md).


### BT-BRAND-02 — integración transparente en navy (14/11/2026)

- [x] Recuperar íntegro el trabajo local interrumpido; base/remoto `1b3978e`, sin descartar cambios ni reconstruir componentes.
- [x] Variante derivada de texto claro «Byte»/«Gestión de Talleres», símbolo y alfa intactos. Originales, iconos PWA/favicon/adaptativos y recursos anteriores protegidos por hashes.
- [x] `BrandLogo surface="dark" | "light"`; navy sin soporte blanco, padding, borde ni sombra. Acceso/navegación comparten variante oscura, original disponible sobre claro.
- [x] Corregir ancho de marca en tablet 768; validar menú/cierre, ocho entradas de acceso y sidebar en 1650/1440/768/390/375. Navegación y formularios R2 preservados.
- [x] 146/146 Vitest, TypeScript, build/PWA y generador/recursos protegidos PASS; seis PDFs A4 sin páginas en blanco. Encabezado nativo gráfico actualizado, iconos/configuración sin cambios; bundle Expo verificado sin APK.
- [x] Publicación en el Render existente: frontend `89c6355`, recursos comparados con el build y recorrido publicado 1650/390 PASS; capturas reales antes/después.
- [x] **Revisión visual del Director APROBADA el 14/11/2026** para BT-BRAND-02 (logo transparente sobre azul marino en acceso y menú). [Checkpoint y capturas](docs/checkpoints/CHECKPOINT_BT_BRAND_02_20261114.md).
- [ ] Prueba física pendiente de iconos instalados/PWA en Android y Safari iPhone; no equivale a aprobación técnica de autenticación.

No se inició BT-AUTH-01B, BT-CP02-D ni backend.


**BT-BRAND-02 — Auditoría de CI independiente (14/11/2026):** [general 43630722991](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43630722991) **SUCCESS** sobre `ee9fe83`, 146/146 Vitest/21 archivos, PWA y Expo; [UI pública 43630723011](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43630723011) SUCCESS. Visual preliminar login/sidebar/superficies oscuro/claro: cumple referencia sin placa blanca. **Pendiente investigar** fallo independiente de [BT-FLOW-01 43630084997](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43630084997) sobre `89c6355`, assert Escape de «Opciones de visita» (`scripts/verify-qa02-ui.cjs:220`); no reproducido en último HEAD. Aprobación visual Director y dispositivos físicos pendientes. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_BRAND_02_20261114.md).


**BT-BRAND-02 — Decisión final del Director (14/11/2026): APROBADO visualmente.** Identidad cerrada sin más cambios de marca solicitados. Queda pendiente repetir el caso Escape en «Opciones de visita» del workflow BT-FLOW-01, así como la comprobación física PWA; BT-CP02-D continúa reservado a su chat, y BT-AUTH-01B no está autorizado todavía.

### BT-AUTH-01B-R1 — Login y sesiones reales (orden de implementación, 14/11/2026)

- [x] **BT-CP02-D** aprobado: 25/25 pruebas reales entre dos talleres, limpieza confirmada y RLS estructural activo.
- [x] Auditar el acceso visual actual y redactar [orden técnica BT-AUTH-01B-R1](docs/BT_AUTH_01B_R1_ORDEN_IMPLEMENTACION.md) y [checkpoint de inicio](docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_INICIO_20261114.md).
- [x] **Codex R1:** añadir Supabase JS con `VITE_SUPABASE_URL`, publishable key y flag apagado por defecto; implementar login, recuperar sesión y logout sin habilitar signup público.
- [x] **Autorización:** validar email confirmado, membership `active` y taller real por RLS; separar roles `owner/admin/mechanic/reception` sin confiar en selector UI.
- [x] **Regresión:** conservar rutas de revisión DEMO, los cinco paneles premium R2, diseño/marca, IOS PWA y Android sin cambios; impedir flash privado y acciones sin backend.
- [ ] **Validar:** pruebas unitarias, build, CI, capturas de cinco tamaños; después prueba controlada con cuentas Auth ficticias y aprobación explícita antes de activar en Render.
- [ ] R2 posterior: recuperación de contraseña/correos transaccionales tras configurar SMTP seguro; invitaciones y cuotas por taller en etapas separadas.


### BT-AUTH-01B-R1 — implementación con activación apagada (14/11/2026)

- [x] Base actualizada a `aa3a64d`; sin cambios concurrentes. Supabase JS 2.119.0 y lockfile, login por contraseña, identidad verificada, correo confirmado, lecturas RLS de membresías y talleres activos. Sin cambios de Supabase/SQL/Edge/onboarding ni Android.
- [x] Flag apagado por defecto; carga diferida del SDK evita incluso su sonda temporal de Storage. Publicación no activa Auth. Validación de variables públicas, rechazo de secret/legacy keys sin exponer valores.
- [x] Restauración y eventos de sesión; revalidación al foco/visibilidad/reconexión; bloqueo inmediato del contexto durante verificación, offline/revocación/logout; protección frente a respuestas tardías. Logout local del SDK con aviso si no se confirma revocación en servidor.
- [x] Taller múltiple con selección explícita y nueva validación. Owner/admin: cinco paneles vacíos. Mechanic: espacio técnico vacío. Reception: restringido. Selector/metadata/URL nunca conceden permisos.
- [x] Revisión DEMO separada y read-only; siete pantallas premium y marca conservadas. Registro, recuperación, enlaces seguros, correo y operaciones de negocio deshabilitados.
- [x] TypeScript, **186/186 Vitest** (146 anteriores +40), build/PWA/brand; pruebas de navegador con SDK real y HTTP **simulado**, cinco anchos (1650/1440/768/390/375), negativas de sesión/membresía/roles y build de claves prohibidas.
- [x] Regresiones locales de paneles, acceso, marca, BT-REG-02, flujo B/C/D, QA-02, cotización y A4. Carrera ya documentada del test Enter/Escape resuelta esperando el atributo antes de comprobarlo, sin cambios funcionales del flujo.
- [ ] **Activación pública y E2E Auth/RLS real pendientes**: cuentas controladas del Director, revisión de sesiones/refresh/revocación real y Safari/iPhone/PWA físico. El PASS A/B anterior no sustituye esta validación.
- [x] Render existente publicado y verificado: frontend `d8ec46c`, seis archivos idénticos al build, login apagado y cero tráfico externo/Storage en cinco anchos; siete pantallas/navegación publicadas PASS.
- [ ] CI remoto por confirmar; consulta de Actions denegada desde esta sesión. Estado y evidencias de Render en el [checkpoint R1](docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_20261114.md).

[Variables y procedimiento de Render](docs/BT_AUTH_01B_R1_CONFIGURACION_RENDER.md). No se inicia R2, recuperación/correo, invitaciones ni backend operativo.

### BT-AUTH-01B-R1 — Validación real local y API RLS (14/11/2026)

- [x] **8 pruebas manuales de interfaz con Supabase real** reportadas por el Director: propietario, F5, logout, error de contraseña, falta de membresía, revocación, restauración y dos talleres simultáneos.
- [x] **API RLS real: 14/14 pruebas autenticadas PASS + 1/1 anónima PASS en dos ejecuciones**. La anónima devolvió `HTTP 401`; no se califica como 15/15 en la corrida inicial. Ver [anexo al checkpoint R1](docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_20261114.md) y [procedimiento](docs/BT_AUTH_01B_R1_PRUEBA_RLS_REAL.md).
- [x] Supabase verificado: 2 usuarios y 2 talleres ficticios, 2 membresías `owner/active`, 2 perfiles, sin cambios en esquema/RLS. Advertencia vigente: protección contra contraseñas filtradas desactivada.
- [x] GitHub Actions: al menos un workflow `SUCCESS` para el commit de corrección `a2f7a3a`; otro estaba en curso al consultar.
- [ ] **R1 pendiente de validación ampliada**: refresh real, pérdida de red/recuperación, logout sin red, roles mecánico/recepción, Safari/PWA física, decisión de limpieza de fixtures y aprobación formal de posible activación Render.
- [ ] **Mantener apagado en Render** el flag de login real y cerrado el registro público hasta autorización posterior. No iniciar R2/correo/invitaciones ni persistencia operativa.

### BT-AUTH-01B-R1 — Renovación de token y conectividad (14/11/2026)

- [x] Pruebas con Chrome reportadas: pérdida de red bloquea el panel; reconexión permite revalidación sin F5; recarga de sesión conservada.
- [x] **Renovación explícita `refreshSession()` — 9/9 PASS reales** sobre cuenta ficticia A con nuevo JWT, rotación de refresh token y validación RLS posterior; script cerró sesión aislada. Evidencia añadida a [checkpoint R1](docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_20261114.md).
- [x] Dos workflows GitHub Actions del commit `1286f0b` completados con `SUCCESS`.
- [ ] Renovación automática en navegador, logout sin conexión, permisos de roles adicionales y Safari/PWA física; **no habilitar Render ni registros públicos** todavía.

- [x] **R1: cierre local en modo Offline comprobado por el Director (14/11/2026):** desapareció panel privado; request `logout?scope=local` falló por ausencia de red. Estado de «Sesión cerrada» se interpreta solo como local; revocación remota NO confirmada. Evidencia en [checkpoint R1](docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_20261114.md).
- [x] **R1: cierre local tras reconexión + F5 PASS (Director, 14/11/2026):** tras restaurar red se mantuvo login sin panel privado; revocación remota no comprobada. Recurso de logo en Offline pendiente de revisar en PWA.

### BT-AUTH-01B-R1 — Prueba real de rol Mecánico (14/11/2026)

- [x] Usuario Auth ficticio confirmado, perfil y membresía `mechanic/active` del Taller A, comprobados por SQL; propietarios A/B sin cambios.
- [x] **Control real de rol en UI: PASS reportado por el Director**. Aunque seleccionó «Administrador» en el formulario, la aplicación mostró el espacio técnico restringido y no el panel administrativo.
- [x] **F5 real del mecánico PASS**, reportado por el Director: rol y espacio técnico restringido conservados.
- [x] **11/11 comprobaciones API RLS reales del mecánico PASS**, confirmadas por salida de PowerShell aportada por el Director: taller A, denegación Taller B por UUID, membresía propia y perfiles ajenos protegidos. [Runbook](docs/BT_AUTH_01B_R1_MECHANIC_RLS_RUNBOOK.md); [checkpoint](docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_20261114.md).
- [ ] No declarar completo el sistema de permisos operativos ni activar acceso público por superar una prueba de rol.

- [ ] **R1 — Roles siguientes:** pruebas controladas `reception` y `admin` con cuentas ficticias, sin privilegios por selector de UI. La segregación de datos operativos futuros sigue fuera del alcance de esta suite de solo lectura.

### BT-AUTH-01B-R1 — Recepción, preparación real (14/11/2026)

- [x] Usuario de prueba confirmado y miembro `reception/active` exclusivamente en Taller A. SQL confirmó que los tres miembros anteriores siguen con sus roles intactos.
- [x] **Login de recepción PASS reportado por el Director**: seleccionó «Administrador» pero recibió estado `restricted` sin panel administrativo. Membresía `reception/active` y pertenencia al Taller A confirmadas por SQL.
- [x] **F5 con recepción PASS reportado por el Director**: se conservó el estado restringido y permaneció bloqueado el panel administrativo.
- [x] **13/13 comprobaciones API RLS reales para recepción PASS**, ejecutadas en PowerShell y confirmadas por captura del Director. Consultas aisladas de Taller A/B, membresías y perfiles; sesión de script cerrada. [Runbook](docs/BT_AUTH_01B_R1_RECEPTION_RLS_RUNBOOK.md) y [checkpoint](docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_20261114.md).
- [x] **Logout de recepción + F5 PASS**, confirmado por el Director: al cerrar sesión, continuó en login y no se restauró panel privado.
- [ ] Continuar con el rol **admin** de pruebas y validaciones pendientes de R1. Mantener acceso público apagado.
- [ ] Definir permisos operativos de recepción en fase posterior y probarlos mediante API RLS cuando exista backend de negocio. Mantener Render/Auth público sin cambios.

### R1 acelerado — administrador B y multi-taller en una sesión (14/11/2026)

- [x] Fixture reversible: recepción A y admin B en una cuenta ficticia, sin tocar propietarios. [Runbook](docs/BT_AUTH_01B_R1_FAST_AB_RUNBOOK.md).
- [ ] Ronda Chrome: selector A/B, B admin, F5, cambio a A restringido, logout.
- [ ] Ronda PowerShell: **12 comprobaciones API RLS y refresh forzado**, script `scripts/security/bt-auth-r1-fast-ab.mjs`.
- [ ] Verificación de renovación automática real en navegador, Safari/iPhone/PWA físico, auditoría y reversión estricta del fixture antes de cierre de R1.
- [ ] Mantener login público y registro cerrados, sin modificar planes/pagos ni operaciones reales.


### BT-AUTH-R2 — Inicio tras cierre R1 (14/11/2026)

- [x] **R1 aceptado por el Director:** administrador secundario y selector A/B validados visualmente; API RLS `12/12 PASS`, PWA instalada y validada en iPhone, sesión cerrada; renovación reportada funcional por el Director. [Checkpoint de cierre](docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md). La captura de renovación automática no quedó registrada como traza E2E, pero el Director ordenó cerrar y avanzar, por lo que no se repetirá la prueba.
- [x] **Limpieza real Supabase:** eliminada y verificada exclusivamente la membresía temporal `admin` en Taller B. Permanecen dos propietarios, un mecánico, una recepción, cuatro usuarios Auth y dos talleres ficticios; RLS intacta. No reejecutar script A/B con fixture anterior.
- [x] **R2 — base de reglas:** `src/auth/mechanicInvitationPolicy.ts` y tests de cupos mecánicos por taller, pendiente revisar resultado de CI. Básico 2, Plus 8, Full 8; actor owner/admin del mismo taller; sin elevación; mecánicos activos más invitaciones vigentes. No se aplica en servidor todavía.
- [ ] **R2-A — invitaciones backend:** diseño y revisión de migración reversible, permisos, cupos atómicos y concurrencia, tokens hasheados y expiración, revocación y auditoría; pruebas de API/RLS antes de habilitar cualquier invitación o correo.
- [ ] **R2-B — recuperación segura de contraseña:** configuración SMTP verificada, redirecciones web/iOS PWA y recuperación sin enumeración de usuarios. La pantalla existente sigue desactivada hasta aprobación y pruebas.
- [ ] **R2-C — interfaz personal:** conectar `Configuración → Usuarios y permisos` únicamente tras backend seguro. Sin cuentas reales, suscripciones ni registro público por superar R1.

**Continuidad:** [Checkpoint inicial BT-AUTH-R2](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_INICIO_20261114.md). Mantener Render con Auth público OFF, una sola rama `main` y ningún cambio al servicio de BIOMOTORS Academia.


### BT-AUTH-R2-A — Preparación del backend de invitaciones de mecánicos (14/11/2026)

- [x] Auditoría de esquema Supabase: solo `workshops`, `profiles` y `workshop_memberships`, con RLS; sin tabla de invitaciones ni suscripción operativa.
- [x] Candidata SQL `docs/sql/BT_AUTH_R2_A_INVITATIONS_CANDIDATE.sql`: esquema privado, grants restringidos, entitlements backend, tokens hasheados, auditoría, rol autorizado owner/admin, cupos 2/8/8 y serialización por taller. **NO APLICADA**.
- [x] Validador estricto de solicitud de invitación y tests en `src/auth/mechanicInviteRequest.test.ts`: no acepta elección de rol/plan/actor en cliente.
- [x] Código del endpoint `bt-mechanic-invites` incorporado pero fail-closed: **siempre deniega invitaciones (503)**, incluso si se altera el flag, hasta implementar correo, aceptación segura y pruebas. `verify_jwt=true` declarado. **NO DESPLEGADO**.
- [ ] Realizar revisión del SQL, migración en ensayo mediante CLI y prueba real RLS/concurrencia antes de tocar base operativa.
- [ ] Implementar correo transaccional aprobado, enlaces con expiración y aceptación atómica; después conectar UI Usuarios y permisos.
- [ ] Verificar CI de todos los commits y ejecución real de tests. Un PASS de CI no equivale a seguridad de escritura en Supabase.

[Checkpoint detallado BT-AUTH-R2-A](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A_20261114.md). Mantener una sola rama `main`, mismo Render y seguridad pública sin cambios.


### BT-AUTH-R2-A2 — Aceptación y revocación de invitaciones, preparación (14/11/2026)

- [x] R2-A: CI de `aa64e82` confirmado SUCCESS; tres tablas existentes de Supabase y cuatro membresías intactas.
- [x] Alineada regla de estados de membresía `active|disabled` con el esquema real.
- [x] Tokens de 32 bytes criptográficamente aleatorios, digest SHA-256 y contrato de aceptación únicamente por token; pruebas unitarias de formato y hashing.
- [x] Candidato SQL separado de aceptación única y revocación con bloqueo por taller, rol `mechanic`, email confirmado desde Auth vía backend, cupos por plan y auditoría. **SIN APLICAR**.
- [x] Endpoint `bt-mechanic-accept` preparado **fail-closed 503**; flag y `verify_jwt=true` declarados, sin deploy ni servicio operativo.
- [x] Parser de revocación solo con taller/ID de invitación; pruebas para rechazar elevación de rol y parámetros extra.
- [x] Tests estáticos de contratos de seguridad, sin sustituir pruebas de BD/RLS reales.
- [ ] **R2-A3:** laboratorio aislado PostgreSQL/Supabase; probar concurrencia, revocación, tokens caducados/reutilizados, descenso de plan, permisos denegados y acceso cruzado A/B. Revisar SQL y convertir en migración solo tras aprobación.
- [ ] **R2-A4:** servidor con verificación Auth, correo confirmado y rate limits; integración SMTP, entrega y aceptación real, antes de conectar la interfaz y habilitar la función.

[Checkpoint BT-AUTH-R2-A2](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A2_20261114.md). No tocar las cuentas ficticias existentes ni abrir Auth en Render. Mantener `main`.


### BT-AUTH-R2-A3 — Laboratorio PostgreSQL 17 aislado (14/11/2026)

- [x] Crear laboratorio efímero en GitHub Actions, con talleres/identidades sintéticos y propuestas SQL originales R2-A/R2-A2 (sin tocar Supabase hospedado).
- [x] **Primera prueba SQL real PASS**: [workflow 43663351089](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43663351089): grants/RLS, BOLA, roles, cupos Básico/Plus/Full, aceptación única, email, caducidad, revocación, downgrade y carrera de reservas para el último cupo.
- [x] **Doble aceptación concurrente PASS:** [workflow 43663461102](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43663461102), contenedor PostgreSQL 17 con todos los pasos SUCCESS; una sola membresía creada, segundo intento rechazado. También aprobadas carrera de reserva, cuotas y aislamiento.
- [x] Estado Supabase real consultado sin escritura: 2 talleres, 4 membresías, 4 usuarios Auth, 0 tablas privadas de invitación nuevas.
- [ ] **R2-A4:** revisión de resultados completos, integración de identidad confirmada con Supabase Auth, protección de abuso y entrega de invitaciones con SMTP autorizado; no migrar ni desplegar funciones sin puerta de aprobación.
- [ ] Confirmar configuración previa a lanzamiento: protección de contraseñas filtradas y estrategia definitiva de planes/cupo atómico por taller.

[Checkpoint BT-AUTH-R2-A3](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A3_20261114.md). Mantener R1 cerrado, Render con registro/Auth público apagado y sin invitar usuarios reales.


### BT-AUTH-R2-A4 — Preflight Auth y email seguro, sin envío (14/11/2026)

- [x] R2-A3 PostgreSQL 17 aislado con doble reserva/aceptación concurrente y roles/cupos PASS. [Evidencia R2-A3](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A3_20261114.md).
- [x] Código backend `verifyInviteActor`: `/auth/v1/user` (GET) fijado al proyecto Supabase autorizado, JWT del usuario y publishable/anon key, correo confirmado y no anónimo; estado 401/403/503 genérico. **No resuelve autorización por taller**, que sigue en candidatas SQL.
- [x] Tres endpoints de invitar/aceptar/revocar incorporan el preflight después de validar payload, **antes de 503 incondicional**. Flags OFF y ningún despliegue/SMTP/RPC conectado.
- [x] Plantilla de email texto/HTML y enlace fragmento con token de un solo uso, escape de HTML y expiración hasta 48h. **No se envía y la ruta de aceptación en la UI todavía no existe**.
- [x] **CI R2-A4 confirmado:** [GitHub 43664201657](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43664201657) SUCCESS — 31 archivos, **280 pruebas Vitest PASS**, TypeScript, build web/PWA y Android Expo. Pruebas HTTP simuladas de Auth, correo/HTML, vencimiento y guardas de endpoint.
- [x] **Deno Edge typecheck:** [GitHub 43664289778](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43664289778) SUCCESS para los tres endpoints; sin deploy, correo ni RPC real.
- [ ] **R2-A5:** test E2E de handlers, rate limits/outbox de correo, SMTP autorizado, UI de aceptación Safari PWA e integración por etapas con SQL con autorización expresa para cualquier cambio en Supabase real.
- [ ] Antes de publicar: habilitar protección de contraseñas filtradas, revisar SMTP y seguridad de datos, decidir fuente confiable del plan y manejo del descenso de 8 a 2 mecánicos.

[Checkpoint R2-A4](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A4_20261114.md). Sin cambios a los dos talleres, cuatro membresías, Render Auth OFF ni Android.


### BT-AUTH-R2-A5 — Pantalla de invitación y límites de frecuencia (14/11/2026)

- [x] Vista responsive `InviteAcceptancePreview` con estado honesto (aún no operativo), identidad ByteTorque y regreso al login mecánico, sin forma de alta ni privilegios.
- [x] Sanitización del enlace `/#/auth/aceptar-invitacion?token=...` inmediatamente antes de montar React y después de `hashchange`: se **descarta** token sin memoria/Storage ni operaciones.
- [x] Unit tests de sanitización, rutas y vista sin token. CI inicial [43664695428](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43664695428) SUCCESS.
- [x] **Chromium visual PASS** en 375/390/768/1440: URL limpia, sin desbordes/escrituras ni retención. Paso «Cinco paneles y acceso visual en cinco tamaños» del [workflow 43664873758](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43664873758) concluido SUCCESS, aunque la ejecución completa incluía una prueba histórica de R1 posterior aún en curso.
- [x] Propuesta SQL privada con límites de intentos: invitar 5/hora por actor/taller; aceptar 10/15 min por actor; revocar 10/hora por actor/taller. No aplicada a Supabase; falta integrar en API y añadir rate limit IP/WAF.
- [x] SQL rate limit corregido y probado en PostgreSQL 17 aislado [43664903467](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43664903467) SUCCESS, incluyendo permisos y cuotas.
- [x] **Cupo antiabuso concurrente aprobado:** [workflow 43664975994](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43664975994) SUCCESS — quinta solicitud admitida y sexta simultánea rechazada, verificado sobre PostgreSQL 17 real de ensayo.
- [ ] **R2-A6:** diseño de outbox, límite de envíos, SMTP y aceptación verdadera con token de un solo uso. Migración y despliegue solo tras revisión y autorización expresa; sin datos reales ni registro público.

[Checkpoint BT-AUTH-R2-A5](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A5_20261114.md). R1/R2-A4 anteriores conservados. Única rama `main`, Supabase alojado sin cambios.


### BT-AUTH-R2-A6 — Outbox cifrado y entrega segura (14/11/2026)

- [x] **A6-1: reserva + outbox atómicos** en SQL candidato, privado y con RLS. Se crea invitación y cola cifrada en una sola transacción (cualquier fallo de cola revierte la reserva).
- [x] **A6-2: AES-256-GCM / nonce** en módulo compartido, AAD vinculado al taller, verificación del email y digest SHA-256 del token; pruebas de alteración y separación entre talleres. Se guarda sobre cifrado, nunca token original en texto claro.
- [x] **A6-3: leases de worker**, acuse único, cinco reintentos máximos, limpieza de material cifrado tras aceptación del proveedor y revocación tras fallo terminal, en SQL candidato.
- [x] **PostgreSQL 17 real aislado PASS:** [GitHub Actions 43665924248](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43665924248): RLS/grants, reversión de cola, ack idempotente, reintentos, agotamiento y control de cupos anteriores.
- [x] **Criptografía web validada:** [GitHub Actions 43666030049](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43666030049), web/PWA SUCCESS con pruebas del sobre cifrado y rechazo de tampering.
- [x] **A6-4: adaptador abstracto de correo** preparado: solo inyección de proveedor autorizado, idempotency key estable por outbox y errores genéricos; sin SMTP/HTTP real ni configuración secreta.
- [x] **CI ampliado PASS:** [web/iOS + Android #43666289991](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43666289991) SUCCESS, **34 archivos / 300 pruebas Vitest PASS**, TypeScript/build/PWA; [Deno Edge #43666289997](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43666289997) SUCCESS en endpoints y módulos compartidos. Esto acredita pruebas y preparación, no envío real.
- [ ] **A6-5: integración real pendiente:** worker seguro, SMTP/proveedor aprobado, domain sender, reintentos ante outage, idempotencia soportada por proveedor, cancelación de outbox y políticas de retención.
- [ ] **A6-6: aceptación real pendiente:** UI Safari PWA token temporal en memoria, Auth email confirmado, permisos por taller/RLS en servidor y pruebas end-to-end. No activar envíos ni registro público.
- [x] **Encargo Codex preparado**, aún NO ejecutado: [worker seguro R2-A6, solo código/pruebas](docs/CODEX_BT_AUTH_R2_A6_WORKER_HANDOFF.md), usando el checkpoint actual. No habilitar envíos, SMTP ni migraciones reales sin nueva autorización.

[Checkpoint BT-AUTH-R2-A6](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_20261114.md). Supabase alojado y Render público sin cambios; única rama `main`, independientemente de BIOMOTORS Academia.


### BT-AUTH-R2-A6-WORKER — Orquestador de entrega y recuperación (14/11/2026)

- [x] **Coordinador simulado** `invitationEmailWorker.ts`: claim → taller validado → lease vigente → descifrado/verificación → proveedor mock → ack/retry; errores genéricos, no se registra token/PII. Si proveedor acepta y ack falla, resulta `ack-unknown`, no se marca fallido.
- [x] Pruebas Vitest para acceso cruzado, taller suspendido, token alterado, lease revocado, fallo temporal/permanente, doble intento, proveedor idempotente simulado y error en ack. **Es simulación, no proveedor real**.
- [x] **Endpoint interno fail-closed** `bt-invite-worker`: siempre 503, sin credenciales, sin conexiones y sin deploy; `verify_jwt=true` preparado hasta revisar autorización machine-to-machine.
- [x] **SQL candidato de recuperación** `BT_AUTH_R2_A6_WORKER_RECOVERY_CANDIDATE.sql`: FK compuesta para evitar cola de otro taller, revocación+cierre de outbox, limpieza de expirados, error terminal, validación de lease. Todo privado `SECURITY INVOKER`, solo `service_role`. **NO aplicado a Supabase real**.
- [x] **Prueba real PostgreSQL 17 + dos trabajadores PASS:** [GitHub Actions 43667670454](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43667670454) SUCCESS, `FOR UPDATE SKIP LOCKED` permite un solo claim, el segundo trabajador lo omite, lease conservado; FK multitenant y limpieza PASS.
- [x] **CI general PASS** sobre implementación del worker: [GitHub Actions 43667670460](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43667670460), web/iOS PWA y Android React Native/Expo SUCCESS; typecheck Deno del worker [43667597419](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43667597419) SUCCESS.
- [x] **Reejecución SQL PASS tras ajustar lease a `VOLATILE`:** [GitHub Actions 43667825968](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43667825968) PostgreSQL 17 efímero SUCCESS; sin cambios en Supabase real. El CI de commits posteriores de documentación se consulta por separado.
- [ ] **Siguiente puerta antes de usarlo:** proveedor SMTP/API autorizado con idempotencia garantizada, dominio remitente verificado, credenciales fuera del código, worker real protegido, expiración/cancelación bajo carreras y QA E2E. NO habilitar emails, migraciones hospedadas, cron ni aceptación pública sin nueva autorización.

[Checkpoint BT-AUTH-R2-A6-WORKER](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_WORKER_20261114.md). El código está preparado en `main` sin necesidad de ejecutar Codex en este bloque; respetar `AGENTS.md`. Supabase/Render reales sin nuevos permisos.


### BT-AUTH-R2-A6-P — Candidato Resend y límite de idempotencia (14/11/2026)

- [x] Comparar proveedores por capacidad de idempotencia; **Resend** es candidato técnico porque `POST /emails` acepta `Idempotency-Key` con retención **24 h**, distinguendo conflicto 409 concurrente y 409 cuerpo incompatible. No se ha contratado ni activado.
- [x] `supabase/functions/_shared/resendInviteCandidate.ts`: contrato HTTP de envío con remitente/único destinatario y `bt-r2-invite:<outbox-id>` estable; validación de encabezados, clasificación de errores, **sin fetch ni API real**.
- [x] `src/auth/resendInviteCandidate.test.ts`: tests de Idempotency-Key, encabezados, errores temporales/definitivos, 409 y respuestas sanitizadas.
- [x] **Cupo de reintentos seguro:** `first_attempt_at` registrado desde el primer lease, no reiniciado; `bt_r2_claim_invitation_email` bloquea reintentos pasadas **23 h**. Reconciliación revoca invitación antigua y destruye ciphertext si caducó esa ventana.
- [x] **PostgreSQL 17 aislado PASS:** [workflow 43668340193](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43668340193), incluye `PASS: provider 24h key protected by 23h claim cutoff and cleanup`.
- [x] **Web/PWA y Android PASS:** [workflow 43668343805](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43668343805); 36 archivos Vitest PASS. **Deno PASS:** [workflow 43668285621](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43668285621).
- [x] **R2-A6-P2 (15/11/2026, candidato y simulaciones):** sobre cifrado AES-GCM v2 con remitente, destinatario, asunto, texto, HTML y token congelados al crear invitación. Worker solo consume v2 y no vuelve a renderizar. Remitente debe coincidir con backend autorizado. Transporte Resend HTTP inyectado SIN red: 200, 409, 429, 5xx, red caída, timeout, respuesta tardía, revocación y ack ambiguo. **351/351 Vitest, TypeScript, PWA, Android Expo PASS** [CI #43670726953](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43670726953); **PostgreSQL 17 y concurrencia PASS** [#43670726963](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43670726963); **Deno check PASS** [#43670504426](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43670504426). SQL candidato sin aplicar al proyecto real.
- [ ] **Puerta del Director:** seleccionar/configurar cuenta Resend, dominio remitente verificado, límites y secreto backend; autorizar envío SOLO de prueba a dirección propia en entorno aislado. **No instalar SQL ni habilitar emails, Auth público o worker en Supabase real antes de la aprobación.**

[Checkpoint BT-AUTH-R2-A6-P](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_PROVIDER_20261114.md). Permanecen 2 talleres, 4 cuentas Auth, 4 membresías y 0 tablas de outbox en Supabase real; código únicamente en `main`.

[Checkpoint R2-A6-P2](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_P2_20261115.md). **Siguiente puerta:** cuenta/remitente Resend verificados y pruebas E2E aisladas con aprobación expresa del Director; después R2-A6-6 aceptación real. No desplegar, enviar ni abrir acceso público aún.

### BT-AUTH-R2-A6-P3 — Snapshot HTTP exacto y puerta de Resend (15/11/2026)

- [x] **Cuerpo HTTP congelado en sobre cifrado V3:** al crear la invitación, `sealImmutableInviteEnvelope` genera el JSON exacto de Resend y lo cifra junto al token/contexto. El worker descifra el mismo `wireBody` sin volver a serializarlo; comprobación estricta de identidad entre campos y snapshot. Los sobres legacy V1/V2 no se transmiten (fallo cerrado), y el límite existente de ciphertext 8192 bytes se valida antes de reservar.
- [x] **Serializer fijo `resendInviteWireV1.ts` + pruebas de bytes:** orden y nombres de las cinco propiedades congelados; si un despliegue altera la serialización, el snapshot antiguo se rechaza en vez de enviar un body distinto con la misma key. Contrato de Resend con remitente de backend; cero solicitudes reales.
- [x] **CI verificado:** [Web/PWA y Android #43671864663](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43671864663) **SUCCESS** con 38 archivos / 355 Vitest, TypeScript web, build PWA, typecheck y export Expo Android; [Deno #43671864675](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43671864675) **SUCCESS**; [PostgreSQL 17 #43671864670](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43671864670) **SUCCESS** (RLS, concurrencia, SKIP LOCKED y ventana 23 h). Todo candidato, ninguna migración en Supabase alojado.
- [ ] **Puerta de activación sigue cerrada:** verificar dominio/remitente con proveedor, autorizar cuenta/secret backend y una prueba controlada, terminar autorización service-to-service, probar aceptación real R2-A6-6 y revisar E2E de revocación, rebotes y duplicados. Sin activar registro público ni correos externos ni funciones de invitación.

[Checkpoint BT-AUTH-R2-A6-P3](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_P3_20261115.md) · [Runbook de preparación](docs/BT_AUTH_R2_A6_P3_RESEND_PREPARACION.md).

### BT-AUTH-R2-A6-P4 — Creador cifrado y reserva atómica inyectada (15/11/2026)

- [x] **Creador backend candidato:** `invitationIssueCandidate.ts` enlaza actor Auth previamente verificado, consulta de taller confiable, token criptográfico, sobre V3 y la única RPC candidata de reserva + cola atómica. La reserva real NO se realiza; dependencias completamente inyectadas y simuladas. Nada de roles, planes, tokens, remitentes o nombres del taller desde UI.
- [x] **Sin secretos ni reintentos inseguros:** confirma integridad del sobre antes del RPC, no retorna token/PII; si falla la respuesta de DB tras posible commit devuelve `unknown` para reconciliación, sin reintentar automáticamente. Permisos/cupos/rate limit siguen bajo autoridad SQL. Se documentó y corrigió fallo de UUID del primer CI.
- [x] **CI de implementación PASS:** [web/PWA + Android #43672523385](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43672523385) con 39 archivos y **365/365 Vitest**, TypeScript y builds; [PostgreSQL 17 aislado #43672523397](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43672523397) concurrencia/RLS/outbox SUCCESS; [Deno #43672523398](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43672523398) SUCCESS.
- [ ] **Próximas puertas:** prueba integrada backend+DB real solo en laboratorio aislado, autorización de servicio máquina-a-máquina, dominio/remitente/cuenta Resend y primera prueba E2E aprobada expresamente. R2-A6-6 aceptación real pendiente; endpoints, envíos, migraciones y pagos públicos siguen desactivados.

[Checkpoint R2-A6-P4](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_P4_20261115.md). Mantener única rama `main`, sin datos de clientes y con Supabase hospedado sin cambios.

### BT-AUTH-R2-A6-P5 — Integración real en PostgreSQL aislado (15/11/2026)

- [x] **Regresión de expiración V3 reparada:** comparar el instante `timestamptz` de PostgreSQL, no la cadena literal ISO, para evitar rechazo incorrecto de una invitación válida. Cambios de fecha real siguen bloqueados.
- [x] **Primer laboratorio integral PostgreSQL 17:** `scripts/security/bt-r2-lab-creator-worker-e2e.ts` enlaza creador P4 + sobre AES-GCM V3 + SQL de reserva/cola reales + claim/lease/ACK reales + HTTP Resend **mock**, todo con datos sintéticos y SIN red externa. Taller ajeno rechazado, ciphertext borrado tras ACK, sin doble claim ni datos cruzados. Se ejecuta por `deno check` y `deno run` con permisos limitados a Docker.
- [x] **Evidencia CI:** [PostgreSQL #43708017370](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43708017370) **SUCCESS** para el flujo integral y regresiones de RLS/concurrencia; [web/PWA y Android #43708017350](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43708017350) **SUCCESS**, 39 archivos, **365/365 Vitest**, TypeScript/build/Expo. Se corrigió fallo intermedio de lectura de booleanos de PSQL (`true` vs `t`), documentado en checkpoint.
- [ ] **Siguiente puerta:** implementar y validar autenticación servicio a servicio (según documentación vigente de Supabase) sin habilitar todavía worker. Requiere aprobación explícita antes de tocar `supabase/config.toml`, crear secretos, desplegar y enviar correo; R2-A6-6 aceptación real y Resend siguen pendientes.

[Checkpoint R2-A6-P5](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_P5_20261115.md) · [Puerta de seguridad M2M](docs/BT_AUTH_R2_A6_P5_SERVICE_AUTH_GATE.md). Supabase alojado sin cambios (2 talleres, 4 usuarios Auth, 4 membresías, 0 tablas privadas). Única rama `main`.

### BT-AUTH-R2-A6-P6 — Autenticación M2M con SDK real, inactiva (15/11/2026)

- [x] **Candidato de autenticación con clave nominativa:** `bt-invite-worker/serviceAuthCandidate.ts` compila con `npm:@supabase/server@1.9.2` y `auth:'secret:bytetorque-worker'`. No es entrypoint ni despliegue, no recibe base de datos ni secretos reales y, incluso con clave válida, responde **503**.
- [x] **Política interna estricta:** `serviceAuthPolicy.ts` exige POST sin cuerpo, Origin ni Authorization; deniega otros métodos, payload de tenant/outbox y navegador, nunca sustituye autenticación de SDK. `src/auth/workerServiceAuthPolicy.test.ts` agrega 16 pruebas sobre el cierre.
- [x] **SDK real probado offline:** 4/4 Deno con claves sintéticas, sin permiso de red; aceptó solo clave nombrada del worker y llegó al 503, rechazó default/otras claves/publicable/JWT, payload y browser Origin. [Edge CI #43713431842](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43713431842) SUCCESS; además `deno check` del SDK fijado y de todos los endpoints.
- [x] **Interruptor preventivo CI:** `bt-r2-worker-fail-closed.mjs` comprueba `verify_jwt=true`, entrypoint original 503 y ausencia de despliegue implícito del candidato. Corrigidos ajustes de instalación npm Deno y falso positivo del primer checker. [CI web/iOS y Android #43713431820](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43713431820) SUCCESS, 40 archivos / **381/381 Vitest**, builds y verificaciones.
- [ ] **Puerta del Director sigue CERRADA:** autorizar clave Supabase nominativa y wrapper obligatorio; cambiar `verify_jwt=false` únicamente en un despliegue futuro protegido y probado; conectar RPCs reales, Resend verificado y envío a email propio bajo aprobaciones distintas. R2-A6-6 aceptación real sigue pendiente.

[Checkpoint R2-A6-P6](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_P6_20261115.md) · [Runbook de activación P6](docs/BT_AUTH_R2_A6_P6_ACTIVATION_GATE.md). Solo `main`; Supabase hospedado no modificado.

### BT-AUTH-R2-A6-6 — Aceptación de invitación, backend integrado SOLO en laboratorio (15/11/2026)

- [x] **Coordinador sin privilegios del navegador:** `mechanicInviteAcceptCandidate.ts`, request `{token}` únicamente, identidad usuario/correo confirmado procedente del backend, SHA-256 de token 32 bytes, y una única RPC service-only inyectada. Estados genéricos `accepted/denied/unknown` sin exponer secretos ni reintentar DB ambiguo.
- [x] **Pruebas completas de aceptación:** 7 nuevas Vitest; el laboratorio P5 se amplió hasta usar `verifyInviteActor` con Auth HTTP localmente simulado y la **RPC real PostgreSQL 17**: usuario verificado correcto aceptado, correo distinto denegado, hash de token incorrecto denegado, replay denegado, una membresía mecánico y un evento auditado. Las pruebas SQL anteriores mantienen vencimiento, revocación, cuotas y concurrencia.
- [x] **CI PASS:** [Web/PWA y Android #43714925123](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43714925123) **388/388 tests (41 archivos)**, TypeScript y bundles; [PostgreSQL 17 efímero #43714833785](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43714833785) **SUCCESS**; [Deno #43714833814](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43714833814) **SUCCESS**. Corregidos dos fallos intermedios de fixture/patrón UUID, documentados.
- [ ] **Activación y UX aún NO AUTORIZADAS:** endpoint `bt-mechanic-accept/index.ts` y worker siguen 503; no se desplegó ni envió correo, no hay invitación real ni pantalla de aceptación funcional PWA/Android. Próximo bloque: preparar UX segura del enlace y pruebas de reanudación de sesión sin persistir token ni abrir el backend; luego autorización explícita para SQL/secret/Resend/ensayo real.

[Checkpoint R2-A6-6](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_6_OFFLINE_20261115.md). Supabase alojado intacto (2 talleres, 4 usuarios, 4 membresías, 0 tablas privadas). Solo rama `main`.


### BT-AUTH-R2-A6-7 — UX de enlace iPhone y handoff solamente en laboratorio (15/11/2026)

- [x] **Pantalla iPhone más clara:** `InviteAcceptancePreview` orienta sobre el mismo correo y la posible separación de sesiones Safari/PWA, conserva el aviso de invitaciones no disponibles y no ofrece botones de activación ni formularios. CSS responsive y prueba de render.
- [x] **Candidato de continuidad solo en memoria, NO conectado:** `inviteHandoffCandidate.ts` con redacción antes de almacenar, token hexadecimal único, caducidad 5 minutos, lectura única y descarte en error/nueva navegación. **10 pruebas nuevas** con rutas, duplicados, expiración, errores y aislamiento de pestañas. La PWA pública **sigue descartando todos los tokens**.
- [x] **Guardia contra publicación accidental:** `verify-official-bundle.mjs` hace fallar el build si la utilidad de handoff candidata entra en el bundle público. [CI #43716531589](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43716531589) **SUCCESS, 42 archivos / 398/398 pruebas**, PWA y Android Expo aprobados; APK y Safari físico no probados.
- [ ] **Continuación:** preparar integración futura de Auth confirmado/continuación del enlace y pruebas móviles; no habilitar aceptación pública, correo Resend, RPC SQL hospedada, workers, secretos ni registro sin aprobación expresa.

[Checkpoint R2-A6-7](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_7_INVITE_UX_OFFLINE_20261115.md). Única rama `main`, Supabase alojado sin cambios.


### BT-AUTH-R2-A6-8 — Continuidad Auth y descarte de invitaciones (15/11/2026)

- [x] **Candidato aislado y sin permisos:** `src/auth/inviteSessionCandidate.ts` combina el handoff A6-7 (URL limpiada, secreto en memoria máximo 5 min) con `getUser()` inyectado para distinguir cuenta confirmada de membresía todavía inexistente. **No concede permisos ni se conecta a la app pública.**
- [x] **Seguridad de cambios de sesión:** el token se elimina ante logout, correo no confirmado, identidad cambiada, desconexión/error, abandono de la ruta o vencimiento; durante refresh se obliga a comprobar de nuevo la misma identidad y una carrera async no puede reactivar ni entregar token. Estado público de la prueba no contiene token/correo/JWT/ID.
- [x] **Exclusión del frontend público:** el comprobador `verify-official-bundle.mjs` rechaza si se incluye accidentalmente `inviteHandoffCandidate` o `inviteSessionCandidate`. La PWA actual **sigue descartando todos los tokens** antes de renderizar.
- [x] **Pruebas y CI finales:** [#43721109326](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43721109326) **SUCCESS** Web/iOS PWA + Android Expo, TypeScript, build PWA, 43 archivos y **422/422 Vitest**. Se corrigieron fallo inicial de `undefined` Auth y casting TS, más regresión de token refresh concurrente. Postgres y servicio hospedado no se tocaron.
- [ ] **Siguiente puerta:** preparar integración de futuro navegador/PWA (pagehide, logout, sesión Auth validada) y ensayo Safari físico solo cuando tenga sentido; **sin activar** Edge, correos, registros, secretos, SQL hospedado ni aceptación de invitaciones sin aprobación expresa.

[Checkpoint R2-A6-8](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_8_SESSION_OFFLINE_20261115.md). Única rama `main`, Supabase alojado sin cambios.


### BT-AUTH-R2-A6-9 — Navegación Safari/PWA en laboratorio, sin activar (15/11/2026)

- [x] **Enlaces sin secretos en query HTTP:** el handoff candidato rechaza token en pathname/search aunque se limpie la URL; conserva solo el formato del email en fragmento #, que no viaja en la solicitud HTTP inicial. Se actualizó la prueba de la ruta profunda.
- [x] **Ciclo de vida seguro, módulo no publicado:** inviteBrowserLifecycleCandidate.ts maneja en tests hashchange/popstate, pagehide, beforeunload, offline, visibilitychange hidden, BFCache y eventos Auth inyectados; conserva brevemente solo entre pantalla de invitación limpia e inicio de sesión. 19 pruebas nuevas; salida/cambio de app/logout limpia. Tres módulos candidatos protegidos contra publicación accidental en el bundle.
- [x] **CI web/Android PASS:** [#43723432561](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43723432561), 44 archivos / **441/441 Vitest**, TypeScript, build PWA, exclusión de candidatos y export Expo Android sin APK.
- [x] **Navegador real automatizado (Chromium, NO Safari):** [UI pública #43723432536](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43723432536) **SUCCESS**; 375/390/768/1440, táctil móvil simulado, reload, back, forward, token redaccionado, cero Storage/IndexedDB/HTTP Auth o email operacionales desde enlace canónico. No se declaran ensayos físicos.
- [ ] **Puertas pendientes:** verificar Safari en iPhone y contenedor PWA instalado según [guía QA](docs/BT_AUTH_R2_A6_9_SAFARI_QA.md); antes de habilitar aceptación real, autorizar expresamente SQL/RLS privados, secretos y Edge service-only, dominio y envío Resend de prueba y plan de rollback. **Sin cambios alojados ni activación pública.**

[Checkpoint R2-A6-9](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_9_BROWSER_OFFLINE_20261115.md). Solo main; Supabase hospedado: 2 talleres, 4 Auth, 4 membresías, 0 tablas privadas.


### BT-AUTH-R2-A6-10 — WebKit de CI y preparación de activación controlada (15/11/2026)

- [x] Desde R2-A6-9 se corrigió el caso de página **ya oculta** al conectar el ciclo de vida de invitaciones, además de `pageshow` con visibilidad oculta; dos nuevas pruebas sintéticas de regresión, módulos aún aislados.
- [x] Se añadió prueba pública con **Playwright WebKit Linux** además de Chromium, en 375/390/768/1440 px: limpieza de URL, navegación y ausencia de escrituras, requests de aceptación y fugas. **No equivale a Safari iPhone físico.**
- [x] CI principal [#43724776112](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43724776112) **SUCCESS**, 44 archivos / **443/443 Vitest**, PWA, TypeScript, bundle e integración Android Expo sin APK; CI de interfaz/WebKit [#43724776108](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43724776108) **SUCCESS**.
- [x] Se revisó el contrato futuro token hash → memoria 5 min → Auth confirmado → recheck → backend service-only → SQL única, y se documentó la matriz de riesgos, rollback y aprobaciones separadas. `bt-mechanic-invites`, `bt-mechanic-accept` y worker permanecen 503.
- [ ] **Bloqueo real:** validar Safari físico e instalación de PWA con enlace sintético, sin confundir el resultado Linux/Chromium con iOS. Revisar especialmente BFCache, cambio de aplicación, navegación y separación Safari/PWA.
- [ ] **Activación NO autorizada:** solicitar por separado permiso explícito para SQL/RLS, secreto nominativo y despliegue Edge, Resend verificado y correo de prueba propio, luego piloto limitado y monitoreo; pagos fuera de alcance. No instalar ni habilitar nada por un «continúa».

[Checkpoint R2-A6-10](docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_10_20261115.md) · [Matriz y puertas de activación](docs/BT_AUTH_R2_A6_10_SAFARI_GATE.md) · [Guía iPhone](docs/BT_AUTH_R2_A6_9_SAFARI_QA.md). **La siguiente acción depende de evidencia física y autorizaciones concretas, no de otra etapa artificial.**
