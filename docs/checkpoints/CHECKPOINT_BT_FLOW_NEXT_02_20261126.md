# BT-FLOW-NEXT-02 — Centro de operaciones multiatención

Fecha: 26/11/2026 Chile. Base `32869dbb581025b01e4738bc0b6901d12ab928e3`, rama main.

## Implementación

Inicio privado incorpora centro de operaciones con nombre del taller autenticado, fecha,
Nueva atención, cuatro indicadores, tabla compacta y tarjetas móviles. Sin comparaciones
semanales ni datos de los mockups. AppShell, marcas y tokens R2 existentes conservados.
Consulta completa por tenant mediante páginas ordenadas de 200, sin recentOrders(40).
Pantalla paginada a 25; búsqueda cliente/patente/vehículo/referencia OT, filtro etapa,
orden por fecha y actualización explícita. No polling ni segunda base de atenciones.

Reutiliza inspectionEvidence, budgetMatches, confirmedStage, lector CP06 de declaraciones
inmutables y finalArchiveRepository.documents. Avance = fracción de siete hitos confirmados,
no porcentaje de reparación. Una solicitud anticipada no tiene fecha ni días en taller.
OT cerradas/canceladas y expedientes confirmados no se muestran como activos; historial
original continúa disponible en Clientes y vehículos. Fallos de lectura bloquean retoma
y no se presentan como cero operaciones confirmadas.

App integra onResume con showGuided({orderId}), Nueva atención con showGuided({}), y
Guardar y salir vuelve a Inicio. Conserva las comprobaciones de cambios pendientes,
identidad notificada, generaciones y reutilización de instancia del FIX-ID. No se
modifican el motor de recorrido ni guardas de inspección, revisión, alcance, aprobación,
ejecución, entrega o archivo. No abre editores concurrentes de una OT. Gate del piloto
owner/admin+taller aprobado conservado; no se amplía el rollout a otros talleres.

## Datos y límites

El contrato actual no ofrece correlativo numérico OT. Se muestra referencia OT con sufijo
del ID persistido; se amplía si hay colisión en el conjunto leído. El ID completo sigue
siendo la identidad interna. No se inventan OT-05482 ni porcentajes del mockup.

El catálogo usa lectura masiva de tablas autorizadas existentes y validación CP06; para
expedientes con entrega consulta el manifiesto privado. Sin índices o RPC nuevos porque
SQL está prohibido. Para talleres con grandes históricos habrá que medir transferencia
y valorar una proyección backend aprobada: esta entrega no certifica rendimiento en
miles de revisiones alojadas. No hay fotografía atómica entre consultas; retomar vuelve
a consultar mediante las guardas existentes. Un fallo parcial no permite retomar datos
incompletos. Las cifras no son comparativas semanales. Tiempo se expresa en días completos.

## Validación local focalizada

- TypeScript y builds público/privado, límites del bundle y marca existentes.
- Cinco pruebas nuevas: tres OT independientes con etapas 2/3/4 desde evidencias;
  relectura; 205 OT sin límite reciente y exclusión de cerradas; solicitud planificada
  sin tiempo de taller; rechazo al cambiar identidad; rechazo a fila de otro tenant;
  fracción de hitos confirmados.
- Chromium 1440/375/390: 28 visitas sintéticas leídas con el repositorio real sobre
  transporte SDK de prueba; selección de identidades diferentes, búsqueda, filtro,
  vacío, recarga del fixture y ausencia de overflow horizontal. Capturas sintéticas.
- No se ejecutaron suites históricas, migraciones, credenciales reales ni operaciones
  productivas. No se reinstaló Playwright ni se modificó package-lock.json.

La prueba del navegador observa el callback de selección; no certifica por sí sola el
recorrido completo posterior en el App autenticado. La creación real de tres visitas,
cerrar sesión/iniciar y guardar en etapas distintas con backend alojado sigue siendo QA
humana pendiente, no un PASS implícito del fixture. La exclusión por manifiesto final
reutiliza su contrato; esta entrega no repite la auditoría documental. Aprobación visual
por el propietario pendiente. La tarea no autoriza activación ni integración oficial.

## Transferencia

DTK-ERR-056 consultado en development-toolkit. Destino privado verificado mediante
conector GitHub (visibility private y permisos push): bytetorque-review, carpeta nueva
BT-FLOW-NEXT-02. Transferir fuentes con rutas originales, diff binario completo contra
base, manifiesto SHA-256 y capturas sanitizadas. Excluir artifacts preexistentes, secretos,
.env, dependencias y respaldos. Conservar entregas previas. Verificar lectura remota y
hashes tras push de revisión; no confundir SHA del candidato con SHA de transferencia.

NO publicación oficial, deploy, SQL, Supabase, Storage, Edge ni variables. Correo OFF,
Auto-Deploy OFF, aprobación obligatoria y R2 eliminación de aprobación pausado.


## Corrección focalizada previa a integración — 26/11/2026 Chile

Base del delta: candidato local `539de905e90e4ff17d797498301e6b501d047d5e`;
transferencia original `808ddccfa6c9d676e1117c94beb88aa6eb22f2d8` preservada.

1. OperationsCenter devuelve el Inicio original suministrado por App cuando canOpen
   o la fase de autoridad excluyen el contexto; no consulta el catálogo ni presenta
   un panel denegado para esos usuarios/talleres.
2. Reutiliza el patrón controller.subscribe + dispose de GuidedWorkspace, con clave
   que además incluye rol y versión de autoridad. La notificación vacía las filas,
   dispone/aborta el repositorio anterior y cambia la generación. Ningún resultado,
   error o adquisición de SDK de la generación anterior puede restaurar datos. Una
   autoridad nueva elegible obtiene un binding nuevo; la no elegible recibe Inicio.
   También se observa la invalidación mientras el panel está montado pero inactivo.
   useSyncExternalStore mantiene la vista sincronizada; el render comprueba la clave
   antes de mostrar filas, sin esperar a la limpieza del efecto.
3. Se restaura la acción Retomar atención activa en Inicio, independiente del catálogo
   y de la existencia de una OT persistida. Solo vuelve visible la instancia existente:
   no crea ni remonta el recorrido, no modifica su identidad y no descarta borradores.

Validación real del delta: 11 casos en operationsCorrection.test.tsx (Inicio original
para mecánico/recepción/taller ajeno/anónimo; invalidación por logout/usuario/rol/taller/
autoridad; resultados/errores/SDK tardíos; panel inactivo), PASS. Dos escenarios de
Chromium sobre App/SDK reales con HTTP totalmente sintético, PASS: Inicio original de
un taller no habilitado; Nueva atención, selección de ficha, texto en recepción sin
crear OT, cerrar a Inicio y recuperar el mismo nodo y texto de borrador, sin incremento
del número de órdenes. TypeScript y git diff --check PASS. No suites históricas ni
nuevos builds completos; el alcance de esta validación no certifica backend alojado.

Solo tres archivos de producción cambiados: src/App.tsx,
src/guided/OperationsCenter.tsx y src/guided/operations.ts. No cambios en
GuidedWorkspace, progress, continuity, estilos R2, SQL, Edge ni contratos de negocio.
Pruebas nuevas y cuatro documentos de continuidad incluidos en el delta.

Transferencia separada en bytetorque-review/BT-FLOW-NEXT-02/delta-20261126,
con fuentes afectadas, diff binario contra el candidato anterior, informe y manifiesto
SHA-256. La entrega original, sus capturas y su manifiesto no se sobrescriben.
NO PUSH oficial, integración, deploy, respaldo ni modificaciones alojadas. Los pendientes
de QA integral y aprobación del candidato original siguen vigentes fuera de estos ajustes.

## Integración oficial autorizada — 26/11/2026

Base oficial 32869dbb581025b01e4738bc0b6901d12ab928e3. Revisión privada original 808ddccfa6c9d676e1117c94beb88aa6eb22f2d8 y delta bf183225ae8ba7ae13a67caab1fa55bf5e1e1db0; los tres ajustes fueron revisados por Dirección Técnica. Se publica el conjunto de 13 archivos funcionales, configuración y pruebas idénticos por blob Git al candidato compuesto, y cuatro documentos con notas de integración. Capturas, manifiestos, diffs y reportes de transferencia permanecen en revisión privada. No se ejecutan suites locales adicionales. La aceptación visual y QA autenticada alojada de tres visitas permanecen pendientes; no confundir las pruebas sintéticas reportadas con aceptación de producción. Se mantiene el piloto de un editor por OT, con restricciones de inspección persistida, aprobación y cotejo vigentes. No se cambia SQL, Edge, variables, correo, permisos ni infraestructura. Auto-Deploy OFF verificado. No se solicita deploy en esta operación. El siguiente paso es confirmar CI del commit oficial y solicitar autorización de despliegue. Respaldo consolidado previo sujeto a vigencia; no repetir por rutina. El repositorio oficial permanece público por autorización anterior del propietario; las evidencias privadas no se copian.
