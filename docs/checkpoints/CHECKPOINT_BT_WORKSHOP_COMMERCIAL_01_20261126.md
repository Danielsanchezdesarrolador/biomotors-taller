# BT-WORKSHOP-COMMERCIAL-01 — candidato consolidado

Fecha de entrega: 26/11/2026, America/Santiago. Base oficial exacta: `c3cb91db1d33edb98fbe62776f9fbabbcbc09307`, rama main. El SHA local, árbol completo, inventario por archivo y huella del delta quedan en CANDIDATO.json de la entrega privada; el SHA de transferencia es el commit que contiene esa carpeta, distinto del candidato. No se incorporan cambios al repositorio oficial.

Estado: implementación candidata y validación focalizada local; pendiente revisión independiente, integración/CI oficial, autorización e instalación coordinada. No se declara LIVE ni aceptación humana. SEC07 cerrado; correo, pagos, logos, registro público y Auto-Deploy no activados. Sin SQL alojado, cambios de Supabase/Render/Edge, secretos, respaldos históricos ni nueva APK.

## Resultado funcional

Se consolidan BT-PILOT-FIX-02, BT-ART-WORKSHOP-01, BT-PLAN-LIMITS-01 y BT-PLAN-ENFORCEMENT-01.

Mi taller es una sección privada owner/admin antes de Configuración. Tiene identidad comercial, equipo, plan/consumos y documentos/identidad en cuatro pestañas React. Reutiliza RPC, gestión de invitaciones, reactivación, perfil y plantillas existentes. Mantiene identidad R2, Plus azul y Full dorado; cifras de capacidades y consumo confirmadas por servidor, sin estimaciones de producción. Logo personalizado continúa bloqueado y las capacidades no activadas se identifican como pendientes. Mecánicos conservan su espacio de trabajo sin gestión administrativa. Configuración vuelve a contener información real de cuenta, sesión y ajustes disponibles, sin ConfiguracionPanel DEMO.

Navegación por identificador semántico, independiente de Agenda ON/OFF, accesible desde Más en móvil. Se conserva el montaje de formularios visitados, historial atrás/adelante, pantalla/taller al recargar y revalidación de autorización. El menú público conserva su distribución anterior; Mi taller nunca se añade al público. Actualizar las métricas, cambiar de pestaña o gestionar equipo no descarta el borrador de perfil. El nombre de cabecera solo cambia después de confirmación real. Un cambio de usuario, rol o taller invalida el contexto anterior; un cambio de capacidad dentro del mismo contexto actualiza el recorrido sin perder sus formularios.

La cuenta personal consulta `bt_commercial_own_workshop()`, self-only con actor confirmado. Distingue licencia personal, taller invitado, titularidad propia y vinculación real. Plus/Full elegible puede crear uno; vinculado entra al existente y no recibe otro formulario. Básico sin taller muestra comparación informativa sin cobros; Básico vinculado conserva su taller. Una consulta fallida bloquea creación y ofrece reintento. Se conserva la guarda `License already bound`, idempotencia y lock por cuenta del contrato anterior. Se añade protección frente a titularidad previa incompatible, incluso desactivada, sin destruirla. Talleres heredados y membresías invitadas no se migran ni eliminan.

La creación verificada de un taller nuevo Plus/Full inicializa atómicamente su rollout operativo. Solo afecta al ID recién creado por esa transacción; instalar el candidato no habilita talleres existentes en masa. El helper privado configure_pilot conserva sus ACL, exige propietario activo y razón explícita; no es invocable por clientes ni por service_role.

## Matriz y autorización

| Capacidad del taller | Básico | Plus | Full |
| --- | --- | --- | --- |
| Clientes persistidos | 5 | sin límite comercial | sin límite comercial |
| Borradores de cotización | crear/editar | crear/editar | crear/editar |
| Acceso final/descarga lógica de cotización | 1 / 48 horas móviles | 10 / semana | sin límite comercial |
| Crear/editar/exportar multipunto | bloqueado | habilitado, 10 exportaciones / semana | habilitado, sin límite comercial |
| Correo comercial | bloqueado | 10 / semana, servicio OFF | sin límite comercial, servicio OFF |
| Registro autónomo por enlace | bloqueado | elegibilidad preparada; servicio OFF | elegibilidad preparada; servicio OFF |
| Mecánicos incluidos | 0 | 4 | 8 |
| Nuevo taller propio | bloqueado | 1 por cuenta | 1 por cuenta |

Plus US$5 y Full US$15 mensuales son información comercial, sin contratación, renovación ni cobros. Cupos adicionales US$2 solo tras confirmación del servidor; ninguna compra se implementa. Invitados no requieren una licencia personal de pago. Datos y miembros existentes sobre el nuevo límite se conservan; no se crean nuevas invitaciones/reactivaciones sobre cupo. Los cinco clientes incluyen archivados: archivar no reinicia el límite ni borra historial; se permiten correcciones de registros existentes.

La capacidad efectiva sale de la suscripción del taller, no del plan personal ni del navegador. La evolución de assert_pilot_write_license habilita órdenes y borradores legítimos Básico; la inspección tiene una guarda específica, además de Auth, rol, RLS y aislamiento existentes. No equivale a una excepción premium global. La revocación no exige apagar el taller: corta capacidades premium mientras conserva operaciones Básico e históricos. No cambia cierre, entrega, seguimiento de hallazgos, marcas X, familias, colores o los 34 componentes multipunto.

El recorrido Básico omite la inspección como requisito, sin marcarla falsamente realizada ni insertar hallazgos vacíos. La prueba PostgreSQL completa recepción, cotización, emisión, aprobación, ejecución, entrega y archivo de tres documentos con cero hallazgos inventados. El porcentaje de progreso usa seis hitos aplicables frente a siete para planes con inspección.

## Cuotas persistentes y documentos

Nueva tabla privada con RLS FORCE y sin acceso directo para anon/authenticated/service_role. Las RPC de lectura/reserva exigen sesión confirmada, taller activo y membresía autorizada. Las RPC de confirmación/caché solo admiten service_role, que además se comprueba dentro del cuerpo. Preflight comprueba dependencias y rechaza instalación previa/parcial; postflight transaccional comprueba RLS, ACL y no exposición de ledger.

1. **Reserva:** UUID de operación ligado a actor/taller/capacidad/recurso; multipunto añade huella del estado confirmado. Lock compartido por taller con licencias/equipo serializa el último cupo; lock adicional por UUID global evita colisiones concurrentes entre talleres. Reservas vigentes cuentan contra el límite durante cinco minutos. Se comprueba recurso perteneciente al taller antes de reservar. No hay reloj ni contador autoritativo en el cliente.
2. **Confirmación:** el servidor lee/renderiza y verifica bytes PDF, revalida usuario y confirma mediante cliente privilegiado antes de devolver bytes. SQL vuelve a verificar plan, membresía, sesión original viva y lease. El cliente no puede confirmar ni resetear consumo. Fallos de preparación liberan la reserva; si la confirmación no se acredita, no salen bytes.
3. **Reintento:** la misma operación confirmada, mismo plan/recurso/actor y lease, recupera bytes idénticos de caché privada; no renderiza ni cobra otra vez. La caché de bytes no se devuelve en RPC pública y dura como acceso cinco minutos. Cambiar snapshot/actor/taller o intentar aprovechar una concesión revocada se rechaza. Después del plazo, un acceso nuevo requiere cupo nuevo; Básico espera su ventana.
4. **Ventanas:** Básico cuenta confirmaciones de las últimas 48 horas. Plus reinicia lunes 00:00 America/Santiago con DST, tres contadores independientes y sin acumulación. Consumos previos siguen contando tras cerrar sesión, renovar o cambiar plan. Full no tiene límite comercial; se conserva un tope antiabuso de 500 operaciones por capacidad/hora más validaciones de identidad y tamaño. Las métricas Full muestran consumo semanal y límite comercial nulo.
5. **Correo preparado:** solo ACK concreto del proveedor confirma consumo de email; rechazo definitivo libera reserva. Respuesta ambigua conserva estado pendiente para conciliación y evita envío ciego duplicado. Emails de Auth no entran en este ledger. Resend/proveedor permanecen OFF; no se reclama prueba de email real.

“Descarga exitosa” significa una autorización lógica cuyo servidor verificó los bytes y confirmó su entrega, no una prueba de guardado físico en disco. Una caída de transporte tras commit puede exigir recuperar esa misma operación dentro del lease; no se simula una transacción distribuida con el navegador. Dos peticiones concurrentes de la misma identidad pueden recibir los mismos bytes, nunca dos consumos ni dos revisiones autorizadas distintas. No se promete impedir copias, screenshots, impresión de bytes ya obtenidos lícitamente ni eliminar archivos locales o URLs firmadas emitidas antes de esta activación. No hay reconocimiento del navegador con autoridad para reducir contadores.

Los generadores limpios de cotizaciones y multipunto salen del grafo de navegador (verificación de bundle). El nuevo adaptador `bt-commercial-documents` genera borradores con marca grande diagonal integrada en cada página: BORRADOR / NO VÁLIDO COMO COTIZACIÓN / DOCUMENTO NO EMITIDO. Ignora intentos del cliente de pedir final o quitar watermark. Obtiene fuente e identidad por RLS del servidor; multipunto oficial se obtiene por la misma autorización de cuotas. Los endpoints existentes de archivo CP05 y expediente final miden todas las salidas de cotización; su lectura interna para verificación/adjunto no consume una descarga comercial ni constituye respuesta al navegador. Emisión Básico agotada deja nuevas cotizaciones en borrador.

Una política restrictiva de Storage cierra lectura/firma directa autenticada de los dos buckets de archivos finales. Los PDF históricos no se reescriben: datos y originales quedan intactos, con salidas futuras sujetas a autorización y cuotas. Informe/entrega históricos conservan su acceso autorizado. Revocación no convierte la lectura de datos multipunto anteriores en escritura ni autoriza nuevas exportaciones Básico.

El caché PDF vive en PostgreSQL bytea privado (máximo 20 MiB), sin bucket nuevo. Se elimina el contenido expirado al reservar de nuevo en el taller, manteniendo metadata del ledger. No hay purga programada instalada: la retención física de bytes puede superar cinco minutos si no hay nuevas reservas; el acceso permanece denegado al expirar. Debe dimensionarse esta retención en la revisión operativa. El respaldo PostgreSQL incluye las nuevas tablas al usar su alcance habitual; no se repitió ni se certificó un nuevo respaldo aquí. Logos/bucket nuevo siguen pendientes de inclusión segura en recuperación S5B.

## Validación efectiva local

Solo datos sintéticos y servicios HTTP interceptados, sin tráfico alojado de negocio. No suites históricas completas, auditorías o respaldos.

- PostgreSQL 17 Docker `--network none`, sin puertos: **44 PASS**. Incluye creación única/concurrencia Plus/Full, Básico vinculado, membresía/rol, revocación manteniendo rollout, persistencia de uso, 48h, lunes/DST, 10/11 por capacidad Plus, independientes/compartidas, aislamiento, reserva/fallo/reintento, Storage directo bloqueado, cliente sexto/archivo, recorrido Básico completo sin inspección, SHA histórico y rollback con congelación previa.
- Unitarias focalizadas: **25 PASS en cuatro archivos** (commercial, operationsCorrection, client, privateScreen); compatibilidad afectada de documentos: **23 PASS** adicionales en pilotDocuments. Total **48 casos distintos**, no suite general.
- Chromium React/SDK real con red sintética: ocho estados correspondientes a mockups, más Agenda OFF escritorio/móvil (**10 escenarios**), y propiedad **4 escenarios** (Plus, Full, mecánico Básico y lectura fallida con reintento). Incluyen continuidad de borrador, perfil confirmado, configuración separada, prohibición de duplicar taller y conservación de membresía anterior. El refinamiento del texto comparativo Plus se valida de nuevo solo en su estado afectado.
- Compatibilidad documental afectada CP05: **390 y 1440 PASS**, endpoint explícito de borrador watermarked; ninguna emisión/descarga final/correo cuando servicio OFF. Persistencia UX móvil **390 PASS**, SHA PDF idéntico al reabrir, consultas CP05 exactamente dos GET scoped, ninguna lectura de negocio en reapertura y ninguna escritura comercial involuntaria.
- TypeScript, builds público y privado (Agenda ON/OFF), grafo sin fixtures privados ni generadores limpios en navegador, empaquetado Edge offline, sintaxis y diff whitespace: PASS. Aviso previo de chunk grande de executionPdf/fontkit conservado, no error.
- **WebKit BLOCKED_ENVIRONMENT**: ejecutable no disponible. Cero descargas/reintentos/cambios de política en este bloque. Se entrega workflow manual `bt-workshop-commercial-focused.yml` con Chromium/WebKit × Agenda ON/OFF, runner reproducible y artefactos. No se dispara. La CI oficial y Safari físico quedan pendientes; no se reportan PASS.

Ocho PNG de referencia inspeccionados antes de implementar y ocho capturas finales inspeccionadas. Se reproducen estructura, tipografía del producto, sidebar, cards, cuatro pestañas, badges y responsive mediante componentes reales; no se usan mockups como fondo. Diferencias explícitas: sesión real verificada visible, logos pendientes, datos sintéticos y contadores reales del fixture, no datos ilustrativos del arte. Comparación visual manual local, sin afirmar igualdad pixel a pixel ni aceptación del titular. Capturas full-page pueden mostrar controles fixed dentro de la imagen larga; la prueba verifica ausencia de overflow y navegación accesible.

## Errores encontrados y soluciones

- Fixtures antiguos desconocían la RPC/endpoint de capacidades y la generación antes local. Se añadieron interceptores exactos por método, taller, recurso y acción; desconocidos siguen fallando. Se separan consultas y descarga autorizada de escrituras de negocio, conservando trazas y comprobaciones.
- Índices del menú y click sobre sidebar móvil fuera de pantalla: navegación por data-screen, apertura de Más y espera del cierre real, sin sleeps para ocultar fallos. Selector de popup acotado para evitar coincidencias ambiguas.
- Build privado inicial sin Records incumplía preflight de Agenda: se corrigió configuración sintética de prueba, no se relajó el guard de Vite.
- Validación inicial de ArrayBuffer de denegación insuficiente y dependencia auxiliar Python: reemplazadas por estado/contenido negativo y extracción real del texto PDF con pdf-lib ya presente. No se añadieron dependencias.
- Colisión simultánea del mismo UUID entre talleres: se serializa la identidad global antes de consultar/reutilizar el ledger; regresión concurrente verifica un único ganador y sus IDs intactos.
- Reintento de PDF podía regenerar bytes: caché privada de bytes confirmados y huella de snapshot; reserva pública excluye bytes y session_id.
- Se detectó posible evasión del límite de clientes por archivo: se cuentan todos los persistidos, incluidos archivados; nueva regresión específica.
- Reversión a funciones antiguas podía reabrir salida sin cuota: rollback funcional cerrado, retiene ledger y restricciones, exige congelación de egress. No se ejecuta automáticamente previous_functions.
- El recorrido guiado requería conectar también su vista PDF al nuevo port del servidor: se conecta el mismo loader tipado que CP04 y se bloquea exportación Básico; no se restaura generación local.
- Comparación de planes en taller Plus no debe mostrar una licencia Básico ficticia: variante informativa sin badge Básico y escenario focalizado actualizado.

Los fallos iniciales y los resultados finales se distinguen en evidencias. No se cambió lógica de Auth/RLS para obtener verde ni se eliminaron aserciones históricas. Las suites históricas no ejecutadas quedan a cargo de CI oficial tras revisión; no se hereda su PASS a este candidato.

## Orden de activación candidato (no ejecutado)

1. Revisar diff íntegro, SHA/árbol y MANIFEST; integrar solo tras autorización en main. Ejecutar workflow focalizado y CI oficial sobre ese SHA, especialmente WebKit y consumidores históricos. Ningún workflow nuevo despliega.
2. En ventana autorizada, inventariar todos los endpoints que pueden devolver PDF final (CP05, archivo final, vistas, Storage y antiguos clientes), flags, ACL y cuerpos instalados. Comparar contra base/revisión aprobada; si hay divergencia, detener solo instalación. Confirmar recuperación vigente con PostgreSQL y los buckets ya existentes, sin crear bucket/logo.
3. **Congelar primero el egress comercial limpio anterior** y emisiones concurrentes del servicio afectado. Un handler antiguo service_role puede saltar RLS: no es seguro aplicar solo SQL/frontend dejando Edge viejo activo. Tratar URLs firmadas previas como acceso ya concedido hasta su expiración; no prometer revocación retroactiva.
4. Instalar SQL candidato íntegro en una transacción; preflight/postflight incluidos. Conservar conteos/hashes e históricos, revisar dependencias/ACL/Storage. No hay DML masivo de talleres/clientes/documentos; nuevas filas solo ledger a demanda y rollout de talleres recién creados.
5. Empaquetar/adaptar los handlers existentes CP05 y archivo final con sus nuevos ports e instalar el nuevo adaptador comercial con JWT verificado. Se adjunta paquete offline de nuevo endpoint, fuentes y hashes de assets oficiales, imports Deno npm fijados y licencia de fuente. **El paquete nuevo solo no actualiza los endpoints antiguos**: recompilar sus paquetes oficiales desde los ports modificados y revisar que ninguna salida quede sin medición. Mantener correo y logos OFF; conservar referencias de secretos existentes, nunca copiarlos a la entrega.
6. Activar frontend correspondiente únicamente cuando contratos nuevos respondan correctamente, manteniendo guards de sesión/taller. QA sintética y humana autorizada, comprobar un acceso/draft/reintento por plan y aislamiento antes de levantar congelación. No incorporar clientes reales de Ignacio en este bloque.

La elegibilidad de autorregistro y contrato futuro de email están preparados; su servicio real no forma parte de la activación de esta entrega. Plantilla privada y logos mantienen flags actuales; el borrador restringido servido nuevo usa plantilla oficial con datos comerciales confirmados. La extensión de borradores a plantillas privadas actualmente OFF requiere revisión al habilitar esa capacidad; la emisión histórica y su branding anterior no se alteran.

## Reversión segura candidata

Congelar egress y volver la UI a una versión compatible autorizada. El rollback exige la atestación explícita `SET bt_commercial.egress_frozen='on'` en la misma sesión, después de congelación real del servidor. Esa variable es una puerta operativa, no congela endpoints por sí sola. Revoca RPC nuevas de acceso, reserva, confirmación y caché; conserva tablas, ledger, bytes/históricos, vínculo propio, guardas de clientes/premium/cierre y política Storage. No borrar consumos, no restaurar endpoints antiguos sin medición ni conceder permisos amplios. Reparación hacia delante revisada para reactivar. La prueba de reversión aislada preserva filas y deniega el acceso, no acredita congelación de infraestructura productiva.

## Fuentes consultadas y transferencia

AGENTS.md, agent.md, roadmap.md y checkpoints BT_PILOT_FIX_01, BT_PILOT_FIX_02_WORKSHOP_NAV y BT_PLAN_LIMITS_01_ROADMAP del 26/11/2026, en la base oficial indicada. Se reutilizan candidatos 04A/04B/04C, 04BC, revocación, PILOTFIX01, CP03/CP04/CP05, branding, FLOW-FIX-01, Agenda, archivo final y fixtures oficiales; se leen como contratos, no como nuevas autorizaciones de producción. Índice de development-toolkit y fichas DTK-ERR-015, 018, 029, 056 y 062, consulta de solo lectura. Requerimiento pegado por el usuario es la instrucción del bloque; los ocho PNG del ZIP son únicamente referencias visuales. No se siguen instrucciones implícitas de adjuntos como autorización adicional.

Entrega privada exclusiva `bytetorque-review/main/BT-WORKSHOP-COMMERCIAL-01`, procedimiento DTK-ERR-056: permisos/privacidad comprobados, archivos individuales, diff binario full-index completo, snapshots por ruta, identificación del árbol, manifiesto SHA-256 y comparación remota byte a byte. Conservar todas las carpetas anteriores y refs locales previas. Candidato local y transferencia distintos; sus hashes y resultado de integridad quedan en metadatos de la entrega y en la respuesta final, evitando autorreferencia imposible dentro del mismo commit. Sin .env, node_modules, credenciales, datos personales o logs productivos.
