# BT-INS-PDF-02 — diseño oficial multipunto, una hoja A4

22/11/2026 (America/Santiago). **Implementado y probado localmente, sin push ni despliegue.**
Base actualizada por fast-forward: `0bb0ea59d78d1619471ce514c1521631f8abe06c`,
única rama `main`. Se conservaron SEC07 S4H y el trabajo previo, incluidos
`artifacts/` preexistentes no versionados. El commit local de este cierre contiene
este documento, las fuentes y pruebas indicadas abajo; no hay CI remoto nuevo.

## Alcance y autorización

Orden del titular: sustituir únicamente el formato documental CP04 por la imagen
aportada, **exactamente una página A4 vertical**, datos dinámicos, 34 componentes,
tres colores y estados guardados. No reconstruir inspección ni tocar CP05.
Solo trabajo local; push, deploy y operaciones productivas NO autorizados.

El PDF multipágina BT-INS-PDF-01 se conserva en el historial como antecedente;
la decisión actual lo sustituye por un **resumen visual de una hoja**. Las notas
íntegras continúan en el expediente y el modelo; no se envían a otra página ni
se borran. El pie y la interfaz lo explican expresamente.

## Implementación y archivos

- `src/ordenes/cp04InspectionPdf.ts`: página fija 595.28 × 841.89 pt; banner navy,
  logo oficial claro/oscuro, título, identificación, vehículo, leyenda, tres
  grupos de dos columnas, frenos/neumáticos alineados y pie institucional.
  Texto vectorial seleccionable, fuente DejaVu incrustada, bordes redondeados,
  degradados y geometría azul. No captura de pantalla ni imagen externa.
- Logos PNG oficiales ya existentes en `apps/android/assets/brand/` se reutilizan
  sin modificarlos ni cambiar código Android. Son los derivados de marca
  transparentes existentes; no hay rediseño, filtro ni recurso comercial nuevo.
- `cp04Contracts.ts` y `cp04Repository.ts`: lectura mínima `pdfIdentity` bajo
  guardas existentes getUser/membresía/taller, RLS y filtros explícitos. Lee
  cliente asociado y año, valida IDs, ámbito y vigencia del repositorio. No
  cambios a SQL, políticas ni roles; no acceso real durante esta tarea.
- `Cp04OrdersView.tsx`: conecta esa lectura al control existente de PDF.
- `Cp04MultipuntoPdfPreview.tsx`: vista previa/descarga del **mismo Uint8Array**
  mientras el snapshot siga vigente. Invalida bytes/URL al cambiar contexto,
  hallazgos o bloqueos y descarta generación asíncrona obsoleta. Mantiene los
  bloqueos por cola autosave, error y observación provisional. No archiva,
  emite, firma ni envía correo.
- Pruebas: `cp04InspectionPdf.test.ts`, `cp04Repository.test.ts`,
  `Cp04OrdersView.test.tsx`; scripts nuevos `verify-cp04-pdf.cjs` y
  `verify-cp04-pdf-layout.py`. Actualización de AGENTS/agent/roadmap/checkpoint.

Los IDs y categorías de los 34 ítems se mantienen: solo cambia la etiqueta
impresa de algunos nombres, con equivalencia explícita por ID. La prioridad
inmediata sigue siendo attention + prefijo existente; no se interpreta un
pendiente resuelto como diagnóstico OK. Sin evaluar/not_checked = tres
casillas sin X. El PDF no certifica reparaciones ni seguridad de circulación.

## Datos reales disponibles y límites

- Propietario: nombre del **cliente asociado al vehículo**, leído de customers;
  no constituye verificación jurídica de propiedad. Año: vehicles.model_year.
- Marca/modelo/patente: vehículo de la OT autorizada. Kilometraje: lectura de
  ingreso de la OT, sin sustituirla por un kilometraje posterior del vehículo.
- Fecha de visita: opened_at de la OT en America/Santiago.
- **Técnico asignado, combustible y horas propias de inicio/término de inspección
  no existen en el contrato persistido actual: muestran «—».** No se usan
  opened_by, recorded_by, usuario conectado ni closed_at como sustitutos.
  Incorporar esos campos en el futuro requiere otra tarea/autorización.
- Los datos de identificación se ajustan de tamaño con límites legibles. Si
  una cadena extraordinariamente larga no cabe, se bloquea la generación con
  error seguro y visible; no se trunca, no se imprime fuera del papel ni se
  añade una segunda página. Está probado ese rechazo.
- Sin fotografía de automóvil externa: banner y detalles geométricos propios,
  con los recursos oficiales existentes. El texto falso de «envío automático»
  de la referencia se sustituye por «Borrador no enviado».
- Validación Chromium Linux en 1366/390, no Safari/iPhone físico ni una sesión
  real productiva. Renderizado y extracción PDF con Poppler; no PDF/A ni PDF
  etiquetado para lectores de pantalla. El texto sí es seleccionable.

## Verificación consolidada

1. **47 pruebas pertinentes PASS, 9 archivos**: modelo PDF, IDs/ámbito, prioridad,
   una hoja con todas las notas largas, inspección sin evaluar, rechazo de dato
   excesivo, repositorio, contratos, guardas, checklist, autosave y borradores.
2. **TypeScript PASS; build público y CP04 privado PASS**, incluidos verificadores
   de marca/PWA/grafo público. Sin cambiar env ni flags alojados; los valores
   utilizados solo afectaron procesos locales de pruebas.
3. `verify-cp04-pdf.cjs`: **1366 y 390 PASS**, SDK real con HTTP interceptado.
   PDF generado por botón existente; vista previa y descarga **byte-idénticas**,
   cero escrituras REST; revocación retira el PDF/workspace.
4. Poppler `pdfinfo`: **Pages 1; A4 595.28 × 841.89 pt; rotación 0**.
   `verify-cp04-pdf-layout.py` compara 34 rótulos y coordenadas exactas de cada X
   contra el estado esperado; comprueba títulos, pie y texto dentro del papel.
   PASS en ambos PDFs UI, muestra completa y muestra sin evaluar (cero X).
5. `verify-cp04-redesign.cjs` existente: **11 resultados PASS**, siete tamaños
   (360/390/430/768/1366/1440/1920), detalle y estados; autoguardado, error/reintento,
   retorno, borrador, actualización y revocación. Todos sintéticos.
6. Inspección visual del PDF rasterizado: títulos, columnas y pie visibles;
   nombre largo ajustado dentro de su celda. No se ha obtenido aún aprobación
   visual del propietario. Sintaxis JS, comprobador Python y diff check PASS.

No se repitió la suite general de aplicación ni auditorías históricas de seguridad.

### Reproducción local

```sh
BT_MULTIPUNTO_PDF_OUTPUT=/tmp/bt-pdf npm test -- src/ordenes/cp04InspectionPdf.test.ts
VITE_BT_AUTH_R1_ENABLED=true VITE_BT_CP03_PRIVATE_ENABLED=true VITE_BT_CP04_PRIVATE_ENABLED=true npm run dev:harness -- --port 5210 --strictPort
# En otra terminal, mientras funciona el harness:
CP04_BASE_URL=http://127.0.0.1:5210 OUTPUT_DIR=/tmp/bt-pdf/browser node scripts/verify-cp04-pdf.cjs
python3 scripts/verify-cp04-pdf-layout.py /tmp/bt-pdf/browser/multipunto-390.pdf /tmp/bt-pdf/browser/states.json
```

Evidencia de esta sesión: `/workspace/work/multipunto-a4/`, PDF real UI en
`browser/multipunto-390.pdf` y `browser/multipunto-1366.pdf`, muestras de modelo
`multipunto-sintetico.pdf`/`sin-evaluar.pdf`, JSON esperados, preview.png y
`tests-final.txt`. Logs complementarios `/tmp/bt-pdf-*.txt`. Son datos ficticios;
no contienen información de clientes ni credenciales. Las evidencias de workspace
son temporales; las pruebas versionadas permiten regenerarlas.

## Incidentes y resolución (prototipo local sobre 0bb0ea5)

- **PDF02-INC-01:** primer render local con HelveticaBold sin incrustar mostró
  espaciado anómalo y advertencias de Fontconfig. Causa: dependencia de fuente
  de sustitución del renderizador. Corregido: toda la tipografía usa la misma
  DejaVu incrustada, resaltado por trazo, sin duplicar texto ni usar fuentes del
  sistema del lector. Nuevo render y extracción seleccionable PASS.
- **PDF02-INC-02:** nombre ficticio largo invadía la zona del icono del técnico.
  Causa comprobada: ancho de ajuste 205 pt excedía la celda de propietario.
  Corregido a 168 pt y mínimo explícito; revisión visual y prueba de rechazo
  de exceso PASS. No se ocultan caracteres con puntos suspensivos.
- **PDF02-INC-03:** comprobador inicial falló `general/reversa`. El PDF estaba
  correcto; el test usaba 273.64 pt de avance de columna, correspondiente a
  tarjetas inferiores, en vez de 263.64 pt de la tabla ancha. Corregido solo el
  comprobador, manteniendo verificación de cada X/rótulo. Ambos UI PDFs PASS.
- **PDF02-INC-04:** TypeScript inicial: propiedad pdfIdentity ausente en mock SSR
  y categories sin usar tras sustituir la paginación. Se añadió el mock sin
  ejecución SSR y se retiró el import sobrante. TypeScript/builds finales PASS.
- Documentación Supabase por HTTP bloqueada CONNECT403; documentación oficial
  de filtros consultada mediante search_docs. No se cambió versión del SDK ni
  se probaron consultas contra el proyecto alojado.

## Estado final y siguiente paso

Código/commit **solo locales**, sin push, ramas adicionales, deploy, CI nuevo,
cambios de Supabase/Auth/RLS/SQL/datos, infraestructura, secretos, respaldos,
correos, pagos, Storage/Edge ni CP05. SEC07 S4H y sus pendientes se conservaron.
La adenda UX anterior documenta LIVE histórico 7da13a3; no se consultó ni alteró
Render en esta tarea y no se infiere estado alojado actual a partir del checkout.

Próximo: propietario revisa muestra sintética y aprueba visualmente el formato.
Publicación y despliegue requieren autorización expresa separada y el procedimiento
vigente de pausa/verificación de autoDeploy; `[skip render]` es defensa adicional,
no autorización. Si hay una observación visual, corregir solo el formato y repetir
las verificaciones afectadas, sin volver a auditar respaldos ni producción.


## Adenda CP04 — corrección de diagnóstico vigente y compactación (24/11/2026)

### Alcance y continuidad

Orden del propietario del 24/11: implementación y validación exclusivamente local.
Base main `169ddddbe8821fda87d49cecb3754b857dce8d56`, obtenida por fast-forward del
remoto; se conservan CP05, SEC07 y el resto del proyecto. `artifacts/` preexistente
no se incorpora. No se crean ramas ni checkpoints nuevos. Esta adenda no reabre
la aprobación A4 ni SEC07: el piloto inicial tiene el cierre declarado por el
propietario en la documentación más reciente; no revocarlo usando notas antiguas.

### Causas comprobadas

1. `Cp04OrdersView` renderizaba `findings.map()` completo como diagnóstico actual:
   una atención anterior seguía apareciendo junto a un OK confirmado posterior.
2. La inserción de autoguardado pasaba `entry.note.trim() || CP04_PROVISIONAL_NOTE`
   también a `multipuntoFinding(...,'ok',...)`. Se guardaba una nota provisional
   en un estado que no la requería. No se corrigen registros alojados individuales.
3. `latestForMultipuntoItem` recorría el array al revés; pendientes elegía fecha/ID
   y otras rutas solo ordenaban milisegundos. Respuestas desordenadas, empates o
   microsegundos podían proyectar resultados distintos. Actualizar una nota no
   debe convertir un diagnóstico viejo en el más nuevo.
4. `findingsForOrder` tenía límite 100 ascendente, por lo que una corrección después
   de 100 eventos podía desaparecer tras recargar. Se reutiliza la paginación
   keyset protegida de pendientes: 200 por página, fecha/ID, error cerrado ante
   filas de otro alcance, duplicados de paginación o límite de seguridad superado.

### Corrección general y comportamiento

- Comparador único por creación con precisión de microsegundos y desempate UUID;
  comparación de actualización de nota conserva también esa precisión.
- Proyección vigente por taller/vehículo/OT/categoría; el selector multipunto
  requiere una OT inequívoca y rechaza tomar marcas de visitas mezcladas. La cola
  filtra su alcance autenticado y conserva su concurrencia, reintentos y recuperación.
- OK nuevo se guarda sin nota provisional; los OK heredados con ese texto se
  presentan sin él, sin borrarlos o resolverlos en la base. Se mantiene detalle
  técnico explícito que no sea el marcador provisional.
- Limpiar X persiste `not_checked`: checklist, resumen y modelo PDF muestran
  Sin revisar. No certifica reparación. Los pendientes del vehículo ignoran ese
  estado como prueba de resolución y conservan el último antecedente evaluado,
  incluidas visitas previas. OK confirmado lo sustituye en la proyección pendiente;
  el registro anterior conserva `resolution=pending` y `resolved_at=null`.
- El bloqueo de PDF por nota provisional usa diagnósticos vigentes de la visita;
  una nota provisional histórica ya sustituida no bloquea el documento actual.
- Cuatro paneles montados: Resumen / Inspección multipunto / Observaciones
  pendientes / Historial de diagnósticos. Roles ARIA, navegación por teclado,
  formularios y cola conservados al navegar; pestaña y posición interna bajo
  las mismas guardas de usuario/taller/TTL, sin recrear borradores tras logout.
- Resumen con 34 componentes en cinco grupos e indicadores confirmados; diagnósticos
  adicionales por categoría se conservan. Historial distingue datos anteriores
  del diagnóstico vigente. No se altera la numeración ni la vida de las OT.
- Cabecera y acciones de PDF/estado/cotización en espacio compacto R2, área de
  trabajo con scroll interno, listado acotado y recepción más densa. Las casillas
  mantienen altura táctil mínima de 44 px; notas técnicas solo donde corresponden.
  Todo el espacio se ancla como unidad para evitar que dos elementos sticky
  independientes se superpongan al final del contenedor.
- PDF: únicamente se unifica la proyección del modelo. Desde `const W=595.28...`
  en adelante el renderer oficial, fuentes, logotipos y dimensiones no cambian.
- CP05/selector, CP06, Auth, RLS, SQL, Edge, Storage, correo, pagos, secretos,
  respaldos y Render no se modifican. No hay nuevas capacidades para mecánicos:
  autoridad de inspección y bloqueos de recepción/estado se conservan.

### Validación consolidada

- 53/53 pruebas focalizadas en seis archivos CP04: contratos, multipunto,
  autoguardado, repositorio, borrador y modelo/PDF A4. Incluye 251 eventos,
  microsegundos/offset, permutaciones, aislamiento y permisos de mecánico.
- Compilación pública y privada CP04: PASS, TypeScript, frontera de módulos,
  exclusión de fixtures y marca/PWA. Solo flags del proceso local, sin .env.
- Navegador responsive **3/3 PASS (390, 768 y 1366 px)**. En cada ancho:
  dos vehículos ficticios diferentes, dos OT nuevas por vehículo (primera visita
  y visita posterior), Atención → OK, Inmediato → OK, OK → Atención,
  Atención → Sin revisar, seis marcas rápidas independientes y navegación antes
  del debounce. Recarga conserva las seis X y el historial, sin diagnósticos
  vigentes duplicados ni escritura al alternar pestañas. Los OK no tienen nota
  provisional ni se resuelven automáticamente las atenciones históricas.
  Visita nueva sin X conserva el pendiente anterior; PDF real generado localmente,
  exactamente una A4, y modelo coherente con cada transición. Sin errores JS,
  desbordes ni superposición geométrica de acciones/campos.
- Cierre visual adicional **3/3 PASS**: pestaña y scroll interno restaurados tras
  recarga; flechas de teclado, texto Sin revisar · Guardado, capturas finales de
  las cuatro pestañas por ancho. Escritorio organiza categorías en dos columnas,
  sin reutilizar el span completo de la hoja imprimible. PNG sintéticos en
  `/workspace/work/cp04-current/final/`; revisión visual de móvil y escritorio
  realizada. La restricción del portal mecánico sin flags de talleres se mantiene;
  la inspección autorizada y denegación de creación/cierre se prueban en el port
  de repositorio, sin habilitar flags para ampliar el acceso.
- Prueba focalizada `scripts/verify-cp04-current-diagnosis.cjs` reutiliza
  `tests/harness/cp04BrowserFixture.cjs`; React y SDK reales, HTTP interceptado.
  No demuestra RLS alojada ni persistencia PostgreSQL real.
- Los selectores de dos scripts existentes se adaptan al panel ahora visible;
  no se repiten sus escenarios ajenos. Se comprueba su sintaxis.
- Incidentes locales: fixture antiguo usaba el mismo ID/fecha para dos registros
  contradictorios; se corrigió a eventos únicos. La prueba de paginación tenía
  recursión del mock, corregida conservando su implementación original. La prueba
  de rol esperaba CP04 sin el flag del portal mecánico; se ajustó a la ruta técnica
  restringida existente y se probó la autoridad de inspección en el repositorio.
  La comprobación geométrica detectó solapamiento de sticky hermanos; solución
  aplicada al contenedor completo, sin quitar la comprobación.
- Documentación pública Supabase changelog/order: proxy CONNECT 403; no se cambia
  API ni versión del SDK. Se reutilizan select/order/or existentes y se validan
  consultas offline. No se consulta el proyecto alojado.

### Reproducción y cierre

`npm test -- src/ordenes/cp04Contracts.test.ts src/ordenes/cp04Multipunto.test.ts
src/ordenes/cp04Autosave.test.ts src/ordenes/cp04Repository.test.ts
src/ordenes/cp04Draft.test.ts src/ordenes/cp04InspectionPdf.test.ts`.

Harness loopback puerto 5230 con Auth R1, CP03_PRIVATE y CP04_PRIVATE true:
`CP04_BASE_URL=http://127.0.0.1:5230 CP04_WIDTHS=390,768,1366
OUTPUT_DIR=/workspace/work/cp04-current node scripts/verify-cp04-current-diagnosis.cjs`.
Todos los datos del fixture son ficticios; los vehículos y órdenes nuevos solo
existen en memoria de la prueba. Capturas y PDF sintéticos fuera del repositorio
en `/workspace/work/cp04-current/`. No se ejecutan auditorías SEC07 ni respaldos.

Un único commit local de cierre (SHA identificado mediante `git log -1` y entregado al titular):
`fix(cp04): reconcile current diagnoses and compact order workspace [skip render]`.
Publicación y despliegue requieren autorización posterior. Pendiente revisión
visual del titular y dispositivos físicos Safari/iPhone; no declarar QA productiva.


### Archivos incluidos en esta adenda

- `src/ordenes/Cp04OrdersView.tsx`, `Cp04MultipuntoChecklist.tsx`, `cp04.css`.
- `src/ordenes/cp04Contracts.ts`, `cp04Multipunto.ts`, `cp04Autosave.ts`,
  `cp04Repository.ts`, `cp04Draft.ts`, `cp04InspectionPdf.ts` (solo proyección).
- Sus seis pruebas: `cp04Contracts.test.ts`, `cp04Multipunto.test.ts`,
  `cp04Autosave.test.ts`, `cp04Repository.test.ts`, `cp04Draft.test.ts`,
  `cp04InspectionPdf.test.ts`.
- `scripts/verify-cp04-current-diagnosis.cjs` (recorrido focalizado nuevo),
  `scripts/verify-cp04-redesign.cjs`, `scripts/verify-pilot-qa04b.cjs` (solo
  selectores de pestaña/formulario afectados; no se ejecuta su suite general).
- `AGENTS.md`, `agent.md`, `roadmap.md` y este checkpoint existente.

No se incluyen capturas antiguas de fallo, logs, dumps ni el directorio preexistente
`artifacts/` en el commit. Toda evidencia visual entregada es sintética y local.


### Aprobación visual y autorización de publicación — 24/11/2026

El titular aprueba visualmente la corrección y compactación entregadas en
`c1020011b4b98859f6aea067f07d9787ba267713`, autoriza publicarlas en `main` y
que se ejecute la CI existente. Fuente: autorización expresa en esta conversación;
no es una prueba adicional efectuada por el agente. Queda satisfecho el pendiente
de aprobación visual mencionado arriba. Safari/iPhone físicos y disponibilidad
productiva de esta versión no se declaran verificados.

Se registra la aprobación en un commit exclusivamente documental, conservando
el commit funcional íntegro. Base remota comprobada antes de publicar:
`169ddddbe8821fda87d49cecb3754b857dce8d56`. Push normal, sin ramas adicionales
ni pruebas locales repetidas. Los workflows existentes se disparan por el push;
no disparar respaldos ni workflows manuales de infraestructura.

**Render: NO desplegar ni cambiar Auto-Deploy.** ChatGPT gestionará el despliegue
separadamente tras confirmar CI. Sin cambios en Supabase, Edge, secretos, datos,
SQL, Storage ni el selector CP05. No se crean nuevos checkpoints.
