## 26/11/2026 — S5B integrado: cierre operacional

Según informe de Seguridad y aceptación del titular, se corrigió el fallo recurrente de validación local y se instaló el respaldo semanal integrado PostgreSQL + Storage mediante el acceso directo existente. 18/18 pruebas sintéticas y nueva ejecución real PASS reportadas; restauración técnica y 11 PDF verificados. Development Toolkit v1.1.4, commit b3386e1be44028359f1822d888a618ac77289582, documentación de cierre comprobada. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S5B_INTEGRADO_20261126.md).

SEC07 permanece cerrado en su alcance aprobado. No repetir respaldo/restauración para documentar. Los cambios del ejecutor son locales, no incorporados al repositorio oficial. No equivale a DR integral ni paridad de seguridad; apertura visual del último conjunto automático no certificada. El respaldo previo recuperado sí tiene apertura 11/11 reportada. Pendiente BT-FLOW-FIX-01: ventana sin editores y autorizaciones específicas para Edge, SQL y frontend en ese orden. CI del código 2585e1fb7f8499bf5d95537ba28c9fb5f2b47e71: 5/5 PASS. No activar producción por esta anotación.

---

## 26/11/2026 — BT-FLOW-FIX-01 integración autorizada

Candidato 8a5b573f99aae7e145398060c49f9b06d03a1dba, transferencia privada 27f0a3f1c6f57a400066726a9d46f6ddffb3bbf6, base oficial f3f512f89b05fece5adb19bafbfc4bf2770e6153. Dirección Técnica revisó las tres correcciones y el propietario autorizó su publicación en main. CI pendiente. Los 26 archivos no documentales deben coincidir por blob con el candidato; cuatro documentos incluyen notas de integración. Evidencias privadas no publicadas. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_FLOW_FIX_01_20261126.md).

No aplicar SQL, Edge ni desplegar frontend sin autorización específica. Orden: verificar vigencia del respaldo y ventana sin editores, cotejar definiciones instaladas, desplegar Edge compatible, aplicar migración incremental transaccional, desplegar frontend y recargar sesiones. La reversión propuesta no cubre automáticamente todos los posibles registros incompatibles con mínimos previos (por ejemplo condiciones vacías o explicación breve de pendientes). No ejecutar rollback automático después de habilitar textos breves; conservar lectores compatibles y corregir hacia adelante. Sin reabrir SEC07 ni repetir suites históricas por rutina. Auto-Deploy OFF y correo OFF. QA humana focalizada pendiente. Anotaciones anteriores históricas.

---

## 26/11/2026 — BT-FLOW-FIX-01 candidato para revisión privada

PDF multipunto original recuperado en inspección guiada; mínimos arbitrarios eliminados de textos operativos sin debilitar máximos/confirmaciones; cierre conserva pantalla con los tres originales privados y correspondencia estricta de OT/revisión. Migración incremental de ocho funciones y ocho CHECKs basada en metadatos instalados, con guard de deriva y rollback condicionado; no aplicada. Validación local: 6 unitarias, 21 SQL aisladas, 6 escenarios de navegador, TypeScript, builds público/privado y empaquetadores oficiales PASS. [Detalle y orden de activación](docs/checkpoints/CHECKPOINT_BT_FLOW_FIX_01_20261126.md).

Solo transferencia privada por DTK-ERR-056. NO PUSH oficial, DEPLOY ni cambios alojados. Auto-Deploy/correo OFF, R2 pausado, históricos intactos. Pendientes revisión humana y autorización independiente de SQL, Edge y frontend; sesiones antiguas deben recargarse antes de admitir textos breves. Las entradas anteriores conservan carácter histórico.

---

## 26/11/2026 — BT-FLOW-NEXT-02 integración autorizada

Centro de operaciones multiatención: candidato original 539de905e90e4ff17d797498301e6b501d047d5e, corregido bb8385801d5340515092dac54d6c70a337f21de4, revisión privada bf183225ae8ba7ae13a67caab1fa55bf5e1e1db0. Dirección Técnica acepta los tres ajustes de acceso al Inicio, invalidación de autoridad y recuperación del borrador sin OT. El propietario autoriza publicación en main; CI pendiente. Despliegue requiere autorización específica. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_FLOW_NEXT_02_20261126.md).

Conservar el alcance de piloto QA: no habilitar otros talleres ni edición concurrente de la misma OT. Aceptación visual y recorrido autenticado de tres atenciones pendientes. No certificar QA alojada con fixtures; no reabrir SEC07 ni repetir respaldo por rutina; vigencia del conjunto consolidado sujeta a cambios de datos. Auto-Deploy OFF confirmado; correo OFF y restricciones de aprobación/cotejo conservadas. No publicar capturas, manifiestos ni paquetes privados. Siguiente: CI, autorización de despliegue y aceptación humana. Las anotaciones anteriores conservan su carácter histórico.

---

## BT-FLOW-NEXT-02 — corrección focalizada previa a integración (26/11/2026 Chile)

Delta sobre candidato `539de905e90e4ff17d797498301e6b501d047d5e`: Inicio original
para contextos excluidos por canOpen; suscripción/invalidez inmediata de OperationsCenter
por sesión/rol/taller/autoridad, con descarte de respuestas tardías; recuperación del
borrador montado desde Inicio aun sin OT. FIX-ID, contratos y estilos R2 intactos.
Validación limitada a estos tres ajustes: once pruebas focalizadas, dos escenarios de
navegador sintético y TypeScript. Sin suites históricas, respaldos ni deploy.
[Delta y evidencia](docs/checkpoints/CHECKPOINT_BT_FLOW_NEXT_02_20261126.md).
Transferencia solo a revisión privada, sin integración ni push oficial.

---

## BT-FLOW-NEXT-02 — candidato local para revisión privada (26/11/2026 Chile)

Centro de operaciones en Inicio autenticado sobre base `32869dbb581025b01e4738bc0b6901d12ab928e3`.
Lecturas paginadas por taller, evidencias compartidas del recorrido, búsqueda/filtros,
retoma por identidad y alta independiente reutilizando FIX-ID. No nuevo SQL/Edge,
infraestructura ni navegación global. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_FLOW_NEXT_02_20261126.md).
Transferencia autorizada solo a `bytetorque-review/BT-FLOW-NEXT-02` mediante DTK-ERR-056;
NO PUSH oficial/DEPLOY ni cambios alojados. Correo OFF, Auto-Deploy OFF, R2 de eliminación
aprobación pausado. Mantener un editor por OT; QA humana y aceptación visual pendientes.

---

## 26/11/2026 — BT-FLOW-NEXT-01 integración aprobada, pendiente de CI y deploy

El propietario autoriza integrar el candidato definitivo y mantener el repositorio oficial público temporalmente. No autoriza despliegue ni cambios alojados. Business comunicó PASS definitivo B05 e integridad del candidato; respaldo consolidado cifrado DB + Storage 6/6 PDF restaurados/verificados y abiertos por el titular, con alcance acotado, sin paridad de seguridad ni DR integral. El requisito de respaldo previo queda satisfecho sujeto a vigencia. No repetir SEC07, exportaciones ni suites locales por rutina. Auto-Deploy OFF confirmado en Render antes de integrar; correo OFF y FLOW-UX-01-R2 pausado se mantienen como restricciones. [Checkpoint de integración](docs/checkpoints/CHECKPOINT_BT_FLOW_NEXT_01_INTEGRACION_20261126.md). Las entradas anteriores son historia, no autorizaciones vigentes.

Piloto controlado: un editor por OT, sin modificaciones concurrentes de una misma atención ni rutas alternativas que omitan el cotejo económico; aprobación vigente obligatoria y evidencia de inspección persistida válida; excluir visitas completamente vacías. No inventar hallazgos. Atomicidad hallazgo-partida no certificada. QA alojada, aceptación visual del propietario y piloto Ignacio siguen pendientes. Las 33 capturas de evidencia y los paquetes/logs privados permanecen en revisión privada; no transferir datos personales ni secretos. Priorizar reutilización de Toolkit y ejecutores aprobados. No subir respaldos ni credenciales.

**Siguiente:** comprobar CI de la integración, pedir autorización específica de despliegue Render y luego aceptación humana alojada. No activar módulos adicionales.

---

## 25/11/2026 — BT-FLOW-NEXT-01-R1-FIX-ID

Corrección puntual autorizada de B05 sobre la huella visual `59e5a2c0325b34a5d15b676b1ca10a84dac3df9373ee18b2e3404a5a0fbc761d`. La identidad efectiva de la OT se comunica desde la lectura confirmada al contexto de navegación. Retomar conserva la instancia y sus borradores; una nueva entrada usa una identidad de instancia independiente cuando las guardas lo permiten. Se protegen los cambios internos de atención y se ignoran las notificaciones de instancias obsoletas. [Checkpoint FIX-ID](docs/checkpoints/CHECKPOINT_BT_FLOW_NEXT_01_R1_FIX_ID_20261125.md).

Validación focalizada de las secuencias solicitadas, aislamiento de escrituras, respuestas tardías, TypeScript y compilaciones pertinentes. Las aceptaciones previas B01–B04 para el piloto y R2 técnico comunicadas por Dirección Técnica se conservan en su alcance. Las restricciones productivas y la evaluación pendiente de atomicidad siguen vigentes.

## 25/11/2026 — BT-FLOW-NEXT-01-R1, corrección local tras NO-GO

B01–B05 corregidos sobre el candidato existente. La cotización usa un puerto limitado a la OT activa, las inspecciones parciales conservan sus resultados originales, el alcance requiere cotejo explícito y las escrituras dependientes consultan precondiciones vigentes. La navegación mantiene el recorrido y sus borradores montados. Validación final focalizada de 80 pruebas, Chromium 1366/390 y builds público/privado con TypeScript. Candidato para revisión independiente, sujeto al alcance y límites del [checkpoint R1](docs/checkpoints/CHECKPOINT_BT_FLOW_NEXT_01_R1_20261125.md).

El cotejo de alcance es una confirmación operativa en memoria por conjunto de evidencias, adicional a la aprobación persistida. La asociación económica entre hallazgos y partidas y la atomicidad de esa asociación no existen en los contratos actuales. Respaldo diferido y restricciones productivas vigentes. La carpeta original de revisión BT-FLOW-NEXT-01 se conserva.

## 25/11/2026 — BT-FLOW-NEXT-01 candidato local

Implementación autorizada de continuidad con control de avance, espacios completos de inspección y cotización, navegación tras lectura confirmada y reanudación por OT. Aprobación obligatoria vinculada a revisión vigente y contratos de Agenda conservados. Validación local consolidada y evidencia en [checkpoint BT-FLOW-NEXT-01](docs/checkpoints/CHECKPOINT_BT_FLOW_NEXT_01_20261125.md).

El propietario difiere el respaldo cifrado DB + Storage hasta finalizar este bloque funcional. El último conjunto permanece preservado y su vigencia está pendiente de actualización antes de otra intervención alojada que la requiera y del piloto real. Candidato local pendiente de revisión y autorización de publicación.

## 25/11/2026 — BT-AGENDA-01 SQL instalado OFF

El propietario autorizó expresamente continuar sin respaldo nuevo hasta la tarde. Excepción puntual: último conjunto DB+Storage verificado no incluye cuatro PDF posteriores; no se declara respaldo vigente ni recuperación completa. Actualizar conjunto cifrado esta tarde, incluyendo nuevos registros y objetos, sin repetir restauración SEC07. Migración registrada `20261125154009_bt_agenda_01_intake_and_scheduling_off`, desde candidato aprobado de `de599d539050225cb693f7af42830d89f67ca3ff` (DDL original, transacción del migrador, límites de espera). Postflight: 5 tablas RLS, recepción pública FORCE, 7 triggers, anónimo sin RPC, authenticated sin DML directo de recepción/fase, funciones anteriores inaccesibles a roles expuestos. 0 rollout, 0 planificadas, 0 recepciones; 4 OT, 4 cotizaciones, 1 manifiesto y 5 objetos PDF conservan sus conteos. Advisor INFO sin políticas de tablas privadas es intencional (acceso por RPC autorizadas), no se amplían permisos. Correo OFF. No se ha validado QA alojada.

**Siguiente inmediato:** ejecutar workflow manual [Agenda Edge](.github/workflows/bt-agenda-01-edge-manual.yml), confirmación `DESPLEGAR_AGENDA_EDGE_SQL_OFF_INSTALADO`, luego verificar versiones/JWT, desplegar frontend compatible OFF y habilitar solo taller QA. No se ejecutó workflow aún; no alterar secretos, datos históricos ni R2. Auto-Deploy OFF. Sin Codex.

---

## 25/11/2026 — Activación BT-AGENDA-01 autorizada, preflight SQL PASS; pendiente respaldo vigente

CI 5/5 SUCCESS en `de599d539050225cb693f7af42830d89f67ca3ff`, código visual aprobado. Propietario autoriza activación alojada secuencial exclusivamente QA. Lectura de PostgreSQL 17.11 confirma firmas CP05/EXP y dependencias, columnas y permisos esperados, Agenda ausente, cero emisiones pendientes, rollouts LIVE/REG/EXP exclusivamente QA y correo OFF. Hay tres objetos CP05 y dos de cierre; respaldo documentado 24/11 incluía un PDF, no cubre los cinco actuales. Antes de instalar SQL confirmar conjunto actualizado DB + Storage con el procedimiento existente; no repetir restauración SEC07 ni suites aprobadas. No se ha aplicado SQL ni desplegado.

Workflow preparado `.github/workflows/bt-agenda-01-edge-manual.yml`: manual, **no ejecutar antes de instalar y verificar migración con rollout OFF**. Checkout SHA fijo aprobado, hashes de fuentes y lockfile, npm ci, doble build de ambos paquetes y verificación de recursos/JWT, deploy secuencial CP05 y EXP sin tocar secretos. Confirmación DESPLEGAR_AGENDA_EDGE_SQL_OFF_INSTALADO. Conector GitHub sin dispatch; propietario lo ejecutará cuando se confirme SQL OFF. Posteriormente Render compatible OFF y activación exclusiva QA. Sin cambios funcionales, flags, Storage ni infraestructura alojada. R2 pausado.

---

## BT-AGENDA-01 — aprobación visual y publicación autorizada (25/11/2026, Chile)

El propietario aprueba visualmente `30d03fe6fc96e0c80fd68ae2ad5212289715d284`
y autoriza su publicación en main y las CI existentes. Implementación íntegra;
solo se actualiza documentación. Se conservan los resultados aprobados: 29 pruebas
focalizadas, 35 comprobaciones SQL/integración y 18 de navegador, sin repetirlas.
Agenda OFF (`VITE_BT_AGENDA_ENABLED=false`, rollout privado sin activar).
Orden futuro: respaldo/recuperación aprobados → SQL candidato nuevo → Edge CP05 y
archivo final compatibles, JWT verificado → frontend compatible OFF → autorización
expresa de rollout QA y flag de Agenda → QA humana alojada. Detalles y flags en
[checkpoint](docs/checkpoints/CHECKPOINT_BT_AGENDA_01_20261125.md).
Esta autorización levanta solo NO PUSH. NO DEPLOY/SQL alojado ni cambios de Supabase,
Render, Storage, secretos o variables. Correos OFF, R2 PAUSADO, originales intactos.
Auto-Deploy OFF. CI se informa por SHA; no se presume éxito mientras esté pendiente.

---

## BT-AGENDA-01 — candidato local integrado (25/11/2026, Chile)

Base confirmada `1161688e3c4ced40f5c9355140bd9faa9cfc52ba`, main único.
Entrega nueva: cotización anticipada CP05 sobre solicitud OT planificada, aprobación
LIVE-02 vigente, Agenda real con persistencia/RLS candidata, reagendamiento/cancelación,
recepción inmutable sobre la misma OT y continuidad CP04 → ejecución/entrega/expediente.
Diseño escritorio/móvil con AppShell R2 e indicadores desde servidor. Se conserva el
ingreso tradicional y la aprobación obligatoria; no se regeneran originales históricos.
[Checkpoint, validación, archivos y activación](docs/checkpoints/CHECKPOINT_BT_AGENDA_01_20261125.md).
`VITE_BT_AGENDA_ENABLED=false`; rollout SQL sin activar. Migración candidata nueva,
no aplicada. No ampliar el gate owner/admin+taller piloto del recorrido existente;
los demás ámbitos autorizados continúan en CP04 tras recibir. Una OT abierta por
vehículo se conserva; la idempotencia tradicional CP04 no se declara resuelta.
Pendientes aceptación visual, publicación/CI y autorización independiente de SQL,
alineación Edge y frontend, rollout QA y validación humana alojada. Reversión debe
conservar compatibilidad con solicitudes/recepciones, no volver a generadores antiguos.
SOLO LOCAL. NO PUSH/DEPLOY/SQL alojado/infraestructura/secretos/correos ni datos reales.
Auto-Deploy OFF. R2 PAUSADO. SEC07 y auditorías cerradas no se reabren.

---

## BT-PDF-UX-01-R1 — despliegue autorizado, CI 5/5 SUCCESS (25/11/2026 Chile)

Código aprobado y CI verificada en b00c0df1cdd5cf3410a1d1edc85bb0ecdbedb0a2. Edge bt-final-archive v4 ACTIVE verify_jwt=true antes del despliegue. Nuevo workflow manual [PDF UX-01](.github/workflows/bt-pdf-ux-01-manual.yml), confirmación DESPLEGAR_PDF_UX_01, checkout SHA aprobado fijo, npm ci, doble empaquetado reproducible, comprobación de hashes de recursos, manifiesto y JWT. El hash JS anterior pertenece a v4 y no se reutiliza; se registra la nueva huella generada por ambos builds del commit autorizado, sin afirmar una huella preexistente independiente. No hay modificación de secretos, SQL, flags, permisos, Storage ni archivos históricos; solo deploy de bt-final-archive cuando el propietario ejecute el workflow. Conector sin dispatch; pendiente ejecución humana, verificación versión/JWT, Render para alinear generador/assets del cliente y QA alojada de nuevos PDF. Auto-Deploy OFF. Correo OFF. R2 pausado. No repetir SEC07.

---

## BT-PDF-UX-01-R1 — aprobación visual y publicación autorizada (25/11/2026 Chile)

El propietario aprueba visualmente `cc3d0be758ceab3293523c8a9a78ee86e36e7aad`
y autoriza publicar en main el diseño íntegro existente y permitir CI. Se levanta
únicamente el NO PUSH de esta entrega; sin código adicional ni repetición de pruebas
locales aprobadas. Originales históricos intactos y R2 PAUSADO. Auto-Deploy OFF.
NO DEPLOY, NO SQL, NO desplegar Edge Functions ni modificar Supabase, Storage,
Render, variables o datos alojados. La activación alojada requiere otra autorización.

---

## BT-PDF-UX-01 — revisión vectorial local, pendiente de aprobación (25/11/2026 Chile)

Primera apariencia rechazada por el director. Corregidos curvas, iconos SVG,
tarjetas, jerarquía, datos en columnas, negrita embebida, badges, totales y referencia
OT corta. [Detalle y validación focalizada](docs/checkpoints/CHECKPOINT_BT_PDF_UX_01_20261125.md).
Nuevos PDF para revisión; no se presume aprobación. SOLO LOCAL, NO PUSH/DEPLOY
ni SQL o infraestructura. Originales históricos intactos. R2 sigue pausado.

---

## BT-PDF-UX-01 — candidato visual local (25/11/2026 Chile)

Informe y constancia premium A4 con texto real, logo oficial y lenguaje legible.
Generador compartido con archivo definitivo y recursos Edge candidatos adaptados;
originales/hashes históricos intactos. [Entrega y validación](docs/checkpoints/CHECKPOINT_BT_PDF_UX_01_20261125.md).
Pendiente aprobación visual y autorización de publicación/QA alojada. R2 PAUSADO.
NO PUSH/DEPLOY/SQL ni cambios de infraestructura, variables, datos o correos.

---

## 25/11/2026 — QA humana recorrido R1 y expediente: PASS funcional en una visita

Corrección de estados OT LIVE en `d82e86b0defb55793ce0ecccaf163fc03da913c7`, deploy `dep-dc3cvdu7bikc73crf12g`, CI 5/5 SUCCESS. Propietario confirma «todo funciono» y entrega los tres PDF descargados de COT-000002 R1. Consulta read-only confirma cotización issued, OT ready, una aprobación, una ejecución, una entrega y manifiesto prepared_not_sent de tres documentos. SHA-256 y longitud de cada PDF adjuntado coinciden exactamente con el manifiesto alojado: cotización 75.801 bytes, informe 71.638, entrega 71.919. No se confirma aún recuperación tras nueva sesión, QA física móvil ni piloto Ignacio; OT permanece ready, no cerrada automáticamente. No correo enviado. R2 eliminación aprobación sigue PAUSADO.

**Próximo:** propietario solicitará al director de arte mockups del informe de ejecución y constancia de entrega, tomando cotización como referencia; esperar aprobación visual antes de implementar. Mejorar jerarquía, marca, idioma comprensible y paginación (una página cuando contenido lo permita; no truncar); conservar trazabilidad, importes, pendientes, alcance de declaración, ausencia de firma/pago y originales históricos intactos. Cambiar solo generación futura, nunca reemplazar archivos archivados ni hashes existentes. Cuarto PDF multipunto sigue propuesta, no aprobado. Después validación de nueva sesión y diseño/implementación del correo consolidado con autorización separada. No repetir SEC07 ni pruebas cerradas. Main único, Auto-Deploy OFF; sin cambios funcionales ni infraestructura en este cierre.

---

## BT-FLOW-UX-01-R1 — estados OT, publicación autorizada (25/11/2026 Chile)

El propietario autoriza publicar en main `bce30ff6c82840f3be427798fa4999d29849416f`
y permitir la CI correspondiente, conservando íntegra la corrección existente.
No se modifica código adicional ni se repiten pruebas locales aprobadas.
Esta autorización levanta exclusivamente el NO PUSH de esta entrega.
R2 permanece PAUSADO; NO DEPLOY, NO SQL ni cambios de infraestructura.
Auto-Deploy OFF. QA humana alojada e idempotencia concurrente CP04 pendientes.

---

## BT-FLOW-UX-01-R1 — estados OT, candidato local (25/11/2026 Chile)

Integradas transiciones explícitas CP04 con updated_at fresco y relectura, sin
reabrir OT cerradas/canceladas ni retroceder ready. Ejecución solo tras formulario
válido, aprobación vigente y declaración humana; entrega conserva confirmación.
[Validación y alcance](docs/checkpoints/CHECKPOINT_BT_FLOW_UX_01_20261124.md).
R2 PAUSADO. NO PUSH/DEPLOY, SQL ni infraestructura alojada. Auto-Deploy OFF.
Idempotencia concurrente de creación CP04 no modificada. QA alojada pendiente.

---

## BT-FLOW-UX-01-R1 — corrección de estados OT (25/11/2026 Chile)

Propietario autoriza implementar de inmediato la integración de estados OT en las ocho etapas existentes. R2 (eliminar aprobación) sigue PAUSADO. R1 LIVE f19b19977ba1c3e16b4866368588cf8906fb5a82, CI 5/5. Incidente COT-000002 R1: guardado/emisión y aprobación confirmados; ejecución rechazada por BT_FLOW_ORDER_NOT_READY porque OT está inspecting, no se guardó informe ni entrega. [Diagnóstico y entrega focalizada](docs/checkpoints/CHECKPOINT_BT_FLOW_UX_01_20261124.md). Implementación local autorizada; NO PUSH funcional ni deploy hasta autorización específica. No SQL, Edge, Storage, flags, correos ni modificación directa de registros reales. Reutilizar CP04 setStatus y validación por servidor; no debilitar guardas.

---

## BT-FLOW-UX-01-R2 — PAUSADO por decisión del propietario (25/11/2026 Chile)

El propietario decide conservar por ahora la aprobación del cliente. R2 queda diferido, no autorizado para ejecución; no ocultar etapa, no enviar encargo a Codex, no aplicar migraciones ni cambios de código, Edge, Render, flags o datos. R1 mantiene sus ocho etapas y requisitos vigentes. La propuesta R2 se conserva como referencia futura, no como tarea activa. Retomar exclusivamente con nueva autorización del propietario.

---

## BT-FLOW-UX-01-R2 — recorrido de siete etapas, sin aprobación obligatoria (25/11/2026 Chile)

Tras realizar el recorrido R1, el propietario solicita eliminar la etapa Aprobación del cliente por fricción operativa. Cotización emitida → Ejecución, sin crear declaraciones ficticias. Diseño autorizado; implementación local y cambios de contratos pendientes. El director verificó dependencias SQL, transporte, historial y archivo final; no basta ocultar UI. [R2 y alcance](docs/checkpoints/CHECKPOINT_BT_FLOW_UX_01_20261124.md). Preservar documentos originales, aprobaciones históricas, aislamiento y confirmaciones de ejecución/entrega. Una entrega integrada local; NO PUSH funcional, NO DEPLOY, NO SQL/Edge/Storage/flags alojados ni correo hasta aprobación específica. Main único; economía de cuota.

---

## BT-FLOW-UX-01-R1 — aprobación visual y publicación autorizada (24/11/2026 Chile)

El propietario aprueba visualmente `1c23de9bf6041b226db33c6f9986eb99d1a49bd6`
y autoriza publicar los cambios existentes en main y permitir las CI correspondientes.
No se modifican funcionalidades ni se repiten las pruebas locales aprobadas.
Esta autorización levanta únicamente el NO PUSH de R1; siguen pendientes QA humana
alojada e idempotencia concurrente CP04. Auto-Deploy OFF. **NO DEPLOY, NO SQL,
NO cambios en Supabase, Storage, Edge Functions ni variables.**

---

## BT-FLOW-UX-01-R1 — candidato local corregido (24/11/2026 Chile)

Ocho etapas compactas, footer conectado al guardado real y relectura, aprobación
accionable, indicador activo azul prioritario y recepción/vínculos recuperados.
[Entrega R1, archivos, validación y límites](docs/checkpoints/CHECKPOINT_BT_FLOW_UX_01_20261124.md).
Pruebas locales proporcionales; pendiente aceptación visual R1 y QA humana alojada.
La idempotencia concurrente CP04 continúa pendiente, sin cambios de backend.
NO PUSH/DEPLOY ni SQL, Supabase, Storage, Edge, flags, secretos, correo o datos reales.
Auto-Deploy OFF; conservar main, roles/QA y corrección JSONB. No repetir auditorías.

---


## BT-FLOW-UX-01-R1 — correcciones de QA humana alojada (24/11/2026 Chile)

SHA frontend LIVE `3e3fef594a13c8e90fc8851c45bf1b3ba1bd410e`, deploy `dep-dc3363u7bikc73bttehg`, CI 5/5 SUCCESS. Propietario detecta overflow horizontal/vertical, exceso de contenido, etapa activa anterior verde y mensaje genérico en aprobación. QA funcional NO aceptada aún. Diagnóstico y alcance R1 en [checkpoint](docs/checkpoints/CHECKPOINT_BT_FLOW_UX_01_20261124.md). Implementación local única, sin push funcional/deploy/SQL/Edge/Storage/flags/correo hasta autorización específica. No repetir investigación ni pruebas cerradas; cero Codex para dirección técnica.

---

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

## BT-FLOW-UX-01 — candidato local implementado (24/11/2026)

Recorrido privado superpuesto de ocho etapas reutilizando CP03/04/05, LIVE-02 y EXP.
Corrección JSONB, proyección desde servidor, bloqueos de cambios pendientes y validación
local consolidada. Limitado al taller QA autorizado, owner/admin, con gates existentes.
[Resultados, archivos y límites](docs/checkpoints/CHECKPOINT_BT_FLOW_UX_01_20261124.md).
Pendiente QA humana alojada y garantía backend de idempotencia de creación OT entre
sesiones; no se presume resuelta por una consulta previa. NO PUSH/DEPLOY ni cambios
en SQL, Storage, Edge, flags, secretos o datos reales. No reabrir SEC07 ni auditorías.

---

## BT-FLOW-UX-01 — nuevo estándar UX aprobado; implementación local (24/11/2026)

El propietario autoriza comenzar el recorrido guiado superpuesto desde Inicio → Nuevo ingreso de vehículo, manteniendo el fondo visible, R2, ocho pasos, guardado confirmado por etapa y reanudación desde servidor. Prioridad antes de Ignacio y QA final. [Especificación y corrección focalizada](docs/checkpoints/CHECKPOINT_BT_FLOW_UX_01_20261124.md). Reutilizar repositorios privados CP03/04/05, LIVE-02 y EXP-01; el asistente src/flow es DEMO y no se conecta al flujo real. Incidente COT-000004: ejecución bloqueada antes de RPC por comparación JSON.stringify sensible al orden de claves JSONB; corregir comparación explícita de subtotal/tax/total, mantener validación estricta y prueba regresiva. Una entrega funcional, una validación local consolidada; sin push funcional ni deploy hasta aprobación, sin SQL/Edge/Storage/gates/correo, sin repetir SEC07. Director realizó investigación y diseño sin Codex; Codex solo implementación local. No declarar recorrido completo hasta prueba humana.

---

## BT-EXP-01 — activación integral QA completada; recorrido humano pendiente (24/11/2026)

[Workflow WRITE 45510853216](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45510853216) SUCCESS en `09aa961f24c7aa2c435b486bbe4dddf8fd6c0b33`; log confirma bundle aprobado SHA256 idéntico, READ=true WRITE=true solicitados y deploy exclusivo bt-final-archive. Edge v4 ACTIVE verify_jwt=true. SQL read-only posterior: FLOW/REG ON y COM archive_read_enabled/archive_enabled true solo Taller ByteTorque de Pruebas; review/delivery false, cero objetos/manifiestos EXP. Lectura real PDF previamente confirmada por titular. Frontend ya LIVE en SHA 82c220111bad4e41f236041bf17983104155c250, no nuevo Render. **Próximo: recorrido QA ficticio completo, recepción → multipunto → emisión CP05 → declaración aprobación → ejecución → entrega → archivar → recuperar tres PDF tras nueva sesión.** Verificar aislamiento y persistencia, registrar aceptación antes de incorporar Ignacio. No repetir SEC07, SQL, CI ni activación; no correo externo ni datos reales; cero Codex. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md).

---

## BT-EXP-01 — lectura PDF real aprobada por titular, SQL escritura QA ON (24/11/2026)

El titular confirma «pude abrir el pdf correctamente» tras prueba de lectura alojada en frontend LIVE; evidencia humana de visualización, no se confirma descarga independiente ni QA A/B completa. Autorización integral vigente. Transacción protegida verificó taller QA y gates previos; actualizó exclusivamente archive_enabled=true para Taller ByteTorque de Pruebas c943ad51-6d90-447b-8aa7-68866f69a4bc. Resultado: qa_read_write_on=1, other_workshops_on=0, mail_or_review_on=0. Edge v3 todavía READ ON/WRITE OFF hasta ejecutar [workflow manual escritura QA](.github/workflows/bt-exp01-qa-write-manual.yml) con ACTIVAR_EXP01_ESCRITURA_QA. Derivado del workflow READ aprobado, exige mismo hash JS, JWT y recursos, cambia solo gates propios READ/WRITE a true; no modifica correo ni CP05. Frontend ya LIVE; no redeploy Render. **Siguiente: verificar workflow y Edge, luego recorrido QA ficticio integral y recuperación de los tres PDF.** No repetir aprobaciones ni usar datos reales de Ignacio. Cero Codex. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md).

---

## BT-EXP-01 — QA lectura desplegada, LIVE-02/REG/CP06/EXP frontend LIVE (24/11/2026)

Autorización integral QA vigente. [Workflow READ 45499185022](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45499185022) SUCCESS, JS SHA256 idéntico al aprobado, Edge v3 ACTIVE verify_jwt=true, READ=true WRITE=false solicitados exitosamente. SQL solo taller QA: FLOW/REG/EXP lectura ON, archivo escritura/review/correo OFF, sin objetos/manifiestos nuevos. Render intento dep-dc30pmijnfac73aul010 rechazado por guarda CP06 ausente/OFF; se agregó únicamente dependencia VITE_BT_CP06_PRIVATE_ENABLED=true al merge autorizado sin quitar guardas, preservando COM preview/correo OFF. [Deploy corregido LIVE](https://dashboard.render.com/static/srv-dbqe4quc6qcc73f275jg/deploys/dep-dc30q1etlv9c73908s00) SHA `82c220111bad4e41f236041bf17983104155c250`, chunks FinalArchiveLoader, RecordsLoader, FlowLive02Panel y verificadores postbuild PASS. **Siguiente: propietario prueba en Clientes y vehículos → Expedientes anteriores · documentos originales → cotización existente → visualizar/descargar. Confirmar PDF real; luego habilitar escritura solo QA dentro de autorización ya otorgada, correo OFF.** UI flags globales, gates SQL por taller; otro taller puede ver entrada pero debe recibir denegación, aislamiento JWT aún por probar. No repetir SEC07 ni CI; cero Codex. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md).

---

## BT-EXP-01 — activación QA autorizada, SQL lectura ON y escritura OFF (24/11/2026)

Propietario autorizó integralmente LIVE-02/REG-01/EXP-01 gates SQL, Edge READ y WRITE en secuencia y frontend, exclusivamente Taller ByteTorque de Pruebas, correo OFF. Confirmado taller activo c943ad51-6d90-447b-8aa7-68866f69a4bc (2 managers elegibles, 3 OT, 1 revisión), taller B excluido. Transacción guardada insertó solo una fila por rollout FLOW, REG, COM; postflight independiente: FLOW/REG ON, archive_read_enabled true, archive_enabled/review_enabled/delivery_enabled false, 0 objetos/manifiestos EXP. **Siguiente: ejecutar workflow manual [lectura QA](.github/workflows/bt-exp01-qa-read-manual.yml) con ACTIVAR_EXP01_LECTURA_QA**, que exige el mismo hash JS aprobado, READ true WRITE false y redeploy solo bt-final-archive. Luego comprobar log y Edge JWT y habilitar frontend LIVE/REG/EXP (COM preview y correo OFF); validar lectura PDF existente con JWT real antes de escritura. Autorización integral ya otorgada; no volver a solicitarla para estas fases. No tocar otros talleres ni CP05. Cero Codex. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md).

---

## BT-EXP-01 — frontend Render LIVE, módulos nuevos OFF solicitados (24/11/2026)

Propietario autorizó deploy manual con módulos nuevos y correo OFF y confirmó My Workspace. Render recibió actualización merge de cinco flags VITE (FLOW_LIVE_02, RECORDS_PRIVATE, FINAL_ARCHIVE, COM_01D_PREVIEW, CP05_EMAIL) a false sin reemplazar demás variables; la actualización inició un único deploy, no se duplicó. Deploy `dep-dc30j63m8hqs73aivgag` LIVE en `89ad25e3a6b81873b8ff3353aa44384c333a726d`, TypeScript/Vite y tres verificadores postbuild PASS, Auto-Deploy sigue OFF según consulta del servicio durante build. No hay lectura independiente de valores efectivos de variables desde conector. Sin cambios SQL/Edge/datos ni Codex. **Siguiente: preparar activación gradual solo taller QA autorizado, validar JWT real, persistencia, recuperación de originales y aislamiento, con correo OFF; solicitar autorización específica de activación.** No repetir SEC07, migraciones ni CI aprobada. [Evidencia](docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md).

---

## BT-EXP-01 — Edge alojada v1 ACTIVE, gates OFF (24/11/2026)

[Workflow manual 45494935988](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45494935988) y [CI general 45494618400](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45494618400) SUCCESS en `c3accc6810624373edb397bd7914f0453f4aa66d`, comprobados directamente. Log confirma paquete verificado, solicitud de gates READ/WRITE false exitosa antes de deploy y solo bt-final-archive desplegada. Supabase confirma v1 ACTIVE, verify_jwt=true; SQL read-only confirma 0 rollouts FLOW/REG/COM, 0 manifiestos/objetos nuevos y correo OFF. Render verificado LIVE `a92e5c87bf351eeb55ea4754187cf4452cfe0ba8`, Auto-Deploy OFF. **Siguiente: autorización específica para deploy manual frontend con módulos nuevos OFF, preservando CP05 y correo OFF; luego QA por taller autorizado.** Sin Codex ni reinstalaciones. [Evidencia y límites](docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md).

---

## BT-EXP-01 — despliegue Edge manual autorizado, pendiente de ejecución (24/11/2026)

El propietario autorizó publicar y desplegar únicamente bt-final-archive con JWT y READ/WRITE OFF. Se prepara [workflow manual](.github/workflows/bt-exp01-edge-manual.yml) sobre el empaquetador original, con Docker y CLI v2, verificación de manifest, hashes, recursos y configuración. Sin ejecución automática, sin Codex, sin modificación de CP05, SQL, Render, correo ni datos. El conector GitHub no permite iniciar workflow_dispatch; el titular debe ejecutarlo desde main con `DESPLEGAR_EXP01_APAGADO`. No declarar despliegue ni gates Edge configurados hasta verificar resultado alojado. SQL/bucket EXP-01 ya instalados OFF; no reinstalar. Después verificar versión/JWT y solicitar autorización independiente para deploy frontend OFF.

---

## BT-EXP-01 — SQL, bucket y política instalados, gates OFF (24/11/2026)

Autorización específica del propietario ejecutada: migración `20261124213926_bt_final_archive_private_off` registrada. Bucket privado `bt-closing-documents` (PDF, 20.000.000 bytes) y política restrictiva ALL para anon/authenticated instalados; CP05 intacto. Postflight: 9/9 funciones con grants previstos, 4 tablas COM RLS+FORCE sin acceso directo API, manifiesto inmutable, 4/4 RPC denegadas con gates OFF en contexto SQL simulado de owner/service_role. Rollouts FLOW/REG/COM vacíos, correo OFF y conteos de negocio/Storage conservados. Sin nuevos documentos, Edge, flags, deploy ni Codex. **Próximo: preparar paquete existente de `bt-final-archive`, JWT y gates Edge READ/WRITE OFF; solicitar autorización específica antes de desplegar/configurar.** CP05 Edge v4 ACTIVE verify_jwt=true confirmado en lectura previa. No reinstalar SQL ni repetir SEC07. Mantener main, Auto-Deploy OFF, QA ficticia antes de Ignacio. [Evidencia y límites](docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md).

---

## BT-COM-01C — SQL instalado, OFF; continuidad EXP-01 (24/11/2026)

Migración `20261124213414_bt_com_01c_private_review_ledger_off` aplicada por autorización específica. 4 tablas privadas vacías RLS+FORCE, 3 triggers inmutables, servicio review denegado con gate OFF, CHECK impide correo ON; FLOW y REG OFF. Sin nuevo bucket, Edge, flags, datos de negocio ni deploy. **Próximo: revisar BT-EXP-01 SQL/bucket/política y pedir autorización específica.** Respaldo S5B+Storage recuperado y PDF abierto, no repetir; no equivale a S4 integral. Reutilizar ejecutores locales correctos y consultar registro de incidentes, no improvisar. [COM-01C](docs/BT_COM_01C_REVIEW_LEDGER_CANDIDATE.md) · [Continuidad y errores de sesión](docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md).

---

## BT-REG-01 — SQL instalado, rollout OFF (24/11/2026)

Autorización específica ejecutada: migración `20261124213211_bt_records_administration_off`. Postflight: 2 tablas privadas RLS+FORCE, 7 guardas de fuentes incluidas 3 LIVE-02, 2 triggers de actividad, 4/4 RPC denegadas con rollout OFF en contexto SQL simulado de owner; conteos existentes conservados. La instalación revoca archivo directo CP03 y registra actividad futura aun OFF. Rollouts REG y FLOW vacíos. Sin despliegue, Edge, Storage, flags, correo ni operaciones de negocio. **Siguiente: revisar COM-01C y solicitar autorización específica de SQL; después BT-EXP-01.** No repetir respaldo/pruebas aprobadas por rutina ni reinstalar migraciones. QA con JWT real y recuperación integral pendientes. [Evidencia y límites](docs/checkpoints/CHECKPOINT_BT_REG_01_ADMINISTRACION_20261124.md).

---

## BT-FLOW-LIVE-02 — migración instalada, OFF (24/11/2026)

Autorización específica del propietario ejecutada: `20261124213015_bt_flow_live_02_operator_attestations_off` registrada. Postflight 3/3 historiales RLS+FORCE e inmutables, sin DML directo; rollout vacío y 3/3 RPC denegadas 42501 en contexto SQL simulado de owner, no prueba JWT real. Sin despliegue, Edge, flags, correo ni escrituras de negocio. Respaldo previo S5B+Storage aprobado en alcance acordado, no S4 integral ni paridad completa. **Siguiente: revisar y solicitar autorización SQL BT-REG-01; LIVE-02 ya existe para sus guardas opcionales.** No reinstalar CP05/LIVE-02 ni repetir pruebas; COM-01C/BT-EXP-01 pendientes. [Evidencia y límites](docs/checkpoints/CHECKPOINT_BT_FLOW_LIVE_02_PERSISTENCIA_ENTREGA_20261118.md).

---

## Respaldo previo a integración — PASS de alcance acordado (24/11/2026)

El propietario confirmó «PDF correcto» tras abrir localmente el original recuperado del sidecar cifrado. Con los resultados previos S5B (integridad, contenido restaurado, fuente intacta, limpieza) y Storage (inventario del mismo dump, único PDF CP05, bytes/hash y recibo verificados), se cierra el requisito de respaldo previo para el alcance documentado, sin declarar paridad completa de seguridad ni DR integral. No repetir el respaldo ni sus verificaciones por rutina; si cambian los datos antes de la migración, evaluar vigencia del conjunto. Custodia privada; no publicar datos, rutas ni secretos.

Próximo paso: inventario puntual de prerrequisitos alojados en solo lectura y propuesta exacta de migraciones/Edge/flags. Solicitar autorización específica antes de cada cambio productivo; no habilitar correo ni tocar datos reales. SEC07 conserva su cierre inicial; BT-REG-01 y BT-EXP-01 siguen candidatos pendientes de activación. Auto-Deploy OFF, main único. [Evidencia consolidada](docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md).

---

## BT-EXP-01 — cierre de publicación y CI informada por el propietario (24/11/2026)

**Candidato publicado, validado localmente y CI SUCCESS según confirmación del propietario; NO operativo en producción.** Aprobación visual otorgada para `d8101c90b408815629c1e78030d540f01f9741f6`; integración funcional `7ebcdf4ddefe509da7c4143a101c03cfe644769f`; publicación documental previa `9b34c4d6357d2dce385be6c7e87b8d34268f8c02`. Captura de Actions del propietario mostró las cinco ejecuciones de ese SHA: Verificación ByteTorque #642 y BT-REG-02 #43 SUCCESS; BT-COT-01 #39, BT-FLOW-01 #62 y BT-OFICIAL-01A #362 en curso. El propietario confirmó posteriormente «TODO VERDE». Se registra la confirmación sin atribuir una consulta independiente de los resultados finales: el conector no enumera las ejecuciones push y no se dispone de sus IDs. No relanzar suites aprobadas por esta confirmación ni declarar CI específica del archivo que no figure en evidencia.

**Pendiente productivo:** BT-REG-01 y BT-EXP-01 siguen desactivados. Desde PC personal del propietario, respaldo SEC07 actualizado/verificado y cobertura de objetos privados de Storage mediante conjunto DB+sidecar conforme al checkpoint; revisar prerrequisitos LIVE-02/COM-01C y secuencia de BT-REG-01 antes de autorizar SQL/bucket/Edge por separado, despliegue OFF y posterior activación gradual con QA ficticia alojada y aceptación. No asumir que el respaldo de PostgreSQL cubre bytes de Storage. Validación sintética previa no certifica recuperación real ni iPhone físico. SEC07 y CP04 cerrados en su alcance; selector CP05 aprobado. Render conserva el último LIVE observado `a92e5c87bf351eeb55ea4754187cf4452cfe0ba8` y Auto-Deploy OFF. Sin autorización para SQL, Storage, Edge, flags, respaldos reales, correo, datos ni despliegue. Repo público temporal autorizado; trabajar solo en main. Mantener reglas de cuota y no iniciar una nueva entrega sin aprobación.

[Checkpoint y condiciones de activación BT-EXP-01](docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md).

---

## Metodología vigente — optimización de cuota (24/11/2026)

El propietario aprueba el reparto ChatGPT director / Codex ejecutor y la consulta focalizada de documentación y Development Toolkit. Regla canónica al inicio de [AGENTS.md](AGENTS.md). Aproximadamente 60 % de cuota consumida en la entrega de expediente final, según el propietario; causa por operación no medida. No repetir investigación o pruebas aprobadas, escalar bloqueos tras un intento focalizado, consolidar entregas y mantener íntegros los controles de seguridad. La aprobación del expediente final es local; no constituye publicación, activación ni prueba completada. BT-REG-01 sigue candidato sin activación. Consultar primero estado actual y archivos pertinentes, no el historial completo por defecto.
## BT-EXP-01 — archivo privado del expediente final, implementación local (24/11/2026)

El propietario aprueba implementar/validar esta entrega. Se reutilizan CP05, CP06
y BT-COM; consulta de originales y revisiones, archivo backend, SHA-256, manifest
inmutable y recuperación de Storage además de PostgreSQL. Toolkit privado consultado
solo en lectura. Detalle y evidencia en el [checkpoint BT-EXP-01](docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md).

**SOLO LOCAL: NO PUSH funcional, NO deploy, NO SQL/buckets/flags/secrets alojados,
NO correo ni backups reales.** Nuevos gates de lectura/creación apagados por defecto.
BT-REG-01 permanece candidato verificado pendiente; SEC07 y CP04 cerrados y selector
CP05 aceptado. Mantener main único, Auto-Deploy OFF y repo público temporal autorizado.
La autorización presente sustituye únicamente el pendiente de aprobación de la propuesta
inferior; no habilita publicación ni infraestructura. Validación consolidada solo nueva.

---

## BT-REG-01 — publicación cerrada; activación aplazada (24/11/2026)

Candidato `9484ed797fb7d6d95d54ff7c288e70bfdc8252a7`: CI general `45416339689`,
oficial `45416339355`, flujo `45416339541` y registro `45416339491` **SUCCESS**.
No se relanzaron. BT-COT-01 no se activó para ese SHA; SUCCESS en `1873057`,
run `45415057212`. Raíz `.cp03-pilot` duplicada corregida; SQL íntegro y sin aplicar.

Propietario sin acceso a su PC personal de respaldos: **NO SQL, NO deploy,
NO flags ni cambios de datos/permisos/variables productivas; NO nuevos respaldos**.
Tras respaldo SEC07 actualizado/verificado desde su PC, solicitar autorizaciones
específicas de SQL, deploy OFF y activación, QA ficticia y aceptación. Mantener
las guardas de reversión. SEC07/piloto y CP04 siguen cerrados; selector CP05 aceptado.
LIVE previo `a92e5c87bf351eeb55ea4754187cf4452cfe0ba8`, Auto-Deploy OFF y repo público temporal.

Solo cierre documental; no nueva versión funcional ni CI por filtros Markdown.
Propuesta local siguiente en roadmap: archivo recuperable del expediente final.
**No iniciar nueva implementación hasta presentar la propuesta y recibir aprobación.**
[Checkpoint y CI](docs/checkpoints/CHECKPOINT_BT_REG_01_ADMINISTRACION_20261124.md)
· [Guía productiva](docs/BT_REG_01_PREPARACION_PRODUCTIVA_20261124.md).

---

## BT-REG-01 — preparación productiva y publicación autorizada (24/11/2026)

El propietario aprueba la entrega local `bf0bf781b219505daec60c5cc288fc23c87a1896`
y sus validaciones. Autoriza publicar candidato/documentación en `main` y ejecutar
las CI existentes, con funcionalidad desactivada. Esta orden levanta únicamente
el NO PUSH de la entrega inferior; **NO SQL, NO DEPLOY, NO activación**.
Auto-Deploy OFF y repositorio público temporal. Sin ramas nuevas ni auditorías repetidas.

Antes de autorizar/aplicar SQL, el propietario realizará un respaldo actualizado
por SEC07 aprobado. No asumirlo realizado ni sustituir las condiciones de recuperación
vigentes por esta aprobación del código. No ejecutar backup, migraciones ni secretos.

[Guía de migración, compatibilidad, secuencia y reversión](docs/BT_REG_01_PREPARACION_PRODUCTIVA_20261124.md).
El SQL candidato permanece íntegro y sin aplicar. Su instalación sí revoca archivo
directo y registra actividad aun con rollout OFF; tras activación, la contención
conserva guardas y ledger, según la guía. La CI se confirma por el SHA publicado.

---

## BT-REG-01 — administración de registros, entrega local (24/11/2026)

El propietario confirma la **aceptación funcional del selector CP05 en producción**
(SHA funcional `a92e5c87bf351eeb55ea4754187cf4452cfe0ba8`). No se repite su QA.
CP04 y SEC07 siguen cerrados en su alcance aprobado.

La nueva orden sustituye la planificación inferior de «no implementar todavía»:
se implementa administración de clientes, vehículos, OT y cotizaciones únicamente
en `main`, con validación local sintética. Reutiliza archivo CP03 y anulación CP05;
RPC transaccionales validan propietario/admin, taller, versión y dependencias,
con auditoría inmutable. El SQL permanece **candidato, NO aplicado**; interruptor
privado por taller y `VITE_BT_RECORDS_PRIVATE_ENABLED` apagados por defecto.

**NO PUSH, NO DEPLOY, NO SQL/Storage/Edge ni datos productivos.** No cambiar
Auto-Deploy OFF ni visibilidad pública temporal autorizada. No activar correos,
pagos, respaldos ni otras funcionalidades. Esta orden no autoriza una activación
alojada. Antes de activarla se requieren las autorizaciones y condiciones de
seguridad vigentes, incluida la recuperación integral S4 pendiente; no se reabre SEC07.

Validación: 22 pruebas focalizadas, 43 comprobaciones PostgreSQL, concurrencia,
navegador 1366/768/390 y builds público/privado PASS. Solo datos ficticios locales.

Entrega y evidencia: [checkpoint BT-REG-01](docs/checkpoints/CHECKPOINT_BT_REG_01_ADMINISTRACION_20261124.md).
Aceptación CP05 registrada también en su checkpoint existente.

---

## Selector CP05 aprobado, publicado y LIVE — 24/11/2026

El propietario aprobó la implementación y autorizó publicación, CI existentes y
deploy manual. Commit funcional **a92e5c87bf351eeb55ea4754187cf4452cfe0ba8**
publicado mediante fast-forward. Las cuatro CI disparadas terminaron **SUCCESS**:
general 45403074603, oficial 45403074446, cotizaciones 45403074653 y flujo 45403074490.
No fueron necesarias correcciones adicionales ni nuevas pruebas locales.

Render `biomotors-taller-demo`: deploy `dep-dc2p4f3m8hqs7386htgg`, **LIVE** desde
2026-11-24T13:34:11.467183Z (10:34:11 Chile), SHA **a92e5c87bf351eeb55ea4754187cf4452cfe0ba8**.
Auto-Deploy **OFF** confirmado antes y después. HTTPS onrender HTTP 200 y bundle
CP05 vigente comprobado en lectura; no se afirma una nueva QA autenticada con
registros productivos. El commit documental posterior no cambia el código LIVE.

Repositorio público temporal por autorización expresa del propietario; no cambiar
su visibilidad. CP04 y SEC07 siguen cerrados. No se modificaron Supabase, RLS,
Edge, variables, migraciones, datos, respaldos ni nuevas funciones de negocio.

La administración de registros inicialmente planificada fue autorizada después
para implementación y validación local por la orden BT-REG-01 que encabeza este
documento. Continúa prohibida su publicación o activación sin aprobación específica.
Esta orden de deploy queda ejecutada para esta versión y no autoriza otros deploys.
Detalle en el [checkpoint CP05 existente](docs/checkpoints/CHECKPOINT_BT_CP05_ENTREGA_FUNCIONAL_20261122.md).
Las notas inferiores de «solo local» corresponden a la preparación ya superada.

---

## CP05 — selector de órdenes actualizado al regresar, solo local (24/11/2026)

CP04 aceptado funcional y visualmente en producción por el propietario; CP04 y
SEC07 permanecen cerrados. Cierre documental y autorización temporal de repositorio
público publicados en `3f5d962086a678cf7b7a1495f76fea64512e7bdf` (incluye el cierre
pendiente `f2b528e`). La excepción pública sustituye la restricción privada anterior.

Corrección focalizada local CP05: el panel conservado recibe si su sección está
activa y vuelve a consultar únicamente las órdenes al entrar. No recarga la
cotización ni sustituye borrador, partidas, condiciones, formulario o selección.
Carga/error/reintento del selector independientes; respuestas de visitas anteriores
se ignoran. Denegación de acceso limpia también la OT seleccionada.

Validación consolidada: 21/21 pruebas focalizadas, builds público/privado y dos
recorridos HTTP sintéticos (390/1366) PASS, con dos vehículos/OT nuevas por ancho,
conservación del borrador, guardado/lectura, error/reintento y carreras de lectura.
No se modifica `useWorkspaceNavigation`, repositorios, SQL, Auth, RLS ni CP04.
**Código CP05 sin push ni deploy** hasta aprobación posterior. Auto-Deploy OFF.
Continuidad en el [checkpoint CP05 existente](docs/checkpoints/CHECKPOINT_BT_CP05_ENTREGA_FUNCIONAL_20261122.md).

---

## CP04 aceptado en producción; repositorio público temporal autorizado — 24/11/2026

El propietario confirma la aprobación **funcional y visual de CP04 en producción**.
CP04 y SEC07 quedan cerrados en su alcance aprobado. Se autoriza publicar la
documentación pendiente del cierre LIVE; no se repiten pruebas ni auditorías.

El repositorio puede permanecer **público temporalmente hasta la renovación de
los minutos de GitHub Actions**, por decisión expresa del propietario. Esta orden
sustituye la restricción anterior de privado y levanta el bloqueo documental;
no intentar cambiar su visibilidad ni afirmar que sea privado.

Auto-Deploy **OFF**. Inicio del selector CP05 autorizado solo para implementación
y validación local; su código no se publica ni se despliega sin aprobación posterior.
Las adendas inferiores de privacidad pendiente y «No comenzar CP05» son históricas
y quedan sustituidas únicamente por esta autorización expresa.

---

## CP04 cerrado y desplegado LIVE — 24/11/2026

Aprobación visual del propietario conservada. `main` actualizado por fast-forward
al fix de test `bf2d0efc5ff16531db81f017fc4a7ad540bc7c8e`. Las CI general y oficial
terminaron SUCCESS antes del despliegue manual autorizado.

Render `biomotors-taller-demo` (`srv-dbqe4quc6qcc73f275jg`): deploy
`dep-dc2ofvui0phs73beuu80` **LIVE** a las 09:50:39 Chile (12:50:39 UTC),
SHA **bf2d0efc5ff16531db81f017fc4a7ad540bc7c8e**. Auto-Deploy **OFF**
antes y después. HTTPS onrender HTTP 200 y bundle CP04 vigente confirmado,
sin autenticación ni cambios de registros. `bytetorque.cl` bloqueado por proxy
CONNECT 403 en este entorno: no implica error HTTP de la aplicación.

Incidente CI anterior: `verify-cp05-browser.cjs` buscaba «Enviar correo ·
desactivado», mientras el control vigente dice «Enviar cotización · desactivado».
El propietario corrigió dos referencias en `bf2d0ef`; no se modificó lógica CP05.
CI: general [45395781431](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45395781431)
y oficial [45395781565](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45395781565) SUCCESS.

**Privacidad pendiente:** GitHub sigue devolviendo `visibility=public`, pese al
requisito actual de privado. Intento autorizado de cambiarla con CLI bloqueado
por API/proxy 403; navegador sin sesión GitHub. No afirmar que sea privado ni
publicar esta adenda mientras siga ese bloqueo. Documentación de cierre local;
no se cambia visibilidad por mecanismos alternativos ni se solicitan secretos.

SEC07 sigue cerrado para el piloto en su alcance aprobado. No se tocaron Supabase,
RLS, Edge, SQL, variables, datos ni respaldos. No comenzar CP05/selector todavía.
El presente permiso de deploy ya se ejecutó; no autoriza futuros despliegues.
Detalle en el [checkpoint CP04 existente](docs/checkpoints/CHECKPOINT_BT_INS_PDF_02_DISENO_OFICIAL_A4_20261122.md).

---

## CP04 — aprobación visual y publicación autorizadas (24/11/2026)

El propietario aprueba visualmente la corrección general y compactación CP04
implementadas en `c1020011b4b98859f6aea067f07d9787ba267713`, y autoriza publicar
en `main` y ejecutar la CI existente. Evidencia: autorización expresa en el chat.
No sustituye pruebas en Safari/iPhone físicos ni una nueva QA productiva.
**NO desplegar Render** ni cambiar Auto-Deploy, Supabase, Edge, secretos o datos.
El despliegue será gestionado separadamente por ChatGPT tras revisar la CI.
Esta aprobación actualiza el pendiente visual de la adenda CP04 inferior.

---

## CP04 — diagnóstico vigente y espacio compacto (24/11/2026)

Implementación local sobre main `169ddddbe8821fda87d49cecb3754b857dce8d56`,
actualizado por avance rápido conservando el trabajo CP05 publicado. Sin push,
despliegue, migraciones ni operaciones productivas. El selector CP05 se conserva
para su reparación separada; no modificar sus archivos ni hacer activaciones.

Se corrige la proyección histórica del resumen, la nota provisional insertada
sobre OK y la selección dependiente del orden del array. Un diagnóstico vigente
por taller/vehículo/OT/componente; pendientes del vehículo conservan antecedentes
al limpiar una X, sin declarar reparación. Cuatro pestañas persistentes, estados
compactos y cinco categorías R2. Formato oficial A4 preservado. Validación local:
53/53 pruebas, builds público/privado, tres recorridos responsive con dos vehículos
y nuevas visitas en cada ancho, más cierre visual/posición en los tres anchos PASS.

Continuidad y resultados en el [checkpoint CP04 existente](docs/checkpoints/CHECKPOINT_BT_INS_PDF_02_DISENO_OFICIAL_A4_20261122.md).

---

## SEC07 cerrado para piloto inicial — PASS_PILOTO_INICIAL

**23/11/2026 (Chile).** A `BLOCK_A_PASS_V04`, B `BLOCK_B_PASS_INFRASTRUCTURE` y C `BLOCK_C_PASS_PILOT_FLOW`. El titular ejecutó el recorrido con datos ficticios: acceso, cliente y vehículo, recepción y orden, cotización normal en borrador y persistencia verificada tras recargar. Ver [checkpoint de cierre C](docs/checkpoints/CHECKPOINT_BT_SEC07_CIERRE_C_PASS_PILOTO.md).

**Hallazgo funcional:** el selector general de Cotizaciones no mostró la orden recién creada. Abrirla desde **Órdenes de trabajo → Preparar / consultar cotización** permitió completar el recorrido. La actualización del selector queda pendiente como mejora del producto.

El piloto inicial usa cuentas gestionadas y excluye onboarding público, emisión, archivo PDF privado y correo externo. Mantener respaldos cifrados manuales cada dos días y antes de cambios de datos. No repetir A ni B. Retomar el desarrollo funcional con este alcance.

---

## SEC07 cierre B — BLOCK_B_PASS_INFRASTRUCTURE

**Estado al 23/11/2026 (Chile): A y B aprobados en su alcance. C en curso.** El titular confirmó acceso administrativo a las cinco plataformas, ajustes de Auth registrados, 12 variables de Render inventariadas (nueve flags confirmados en `true`), ausencia de reglas personalizadas Redirects/Rewrites y custodia privada de la ficha de recuperación. El detalle privado y los valores de configuración quedan fuera del repositorio. La documentación refleja la evidencia del titular. No se cambió la configuración alojada.

**Alcance del piloto inicial:** cuenta ya gestionada y cotización normal. El onboarding público no forma parte del piloto. Archivo documental CP05 y envío externo fuera del recorrido inicial. El único PDF observado en Storage pertenece al taller QA. Ver [checkpoint del bloque B](docs/checkpoints/CHECKPOINT_BT_SEC07_CIERRE_B_PASS_INFRAESTRUCTURA.md).

**Bloque C:** cargó la entrada pública canónica de ByteTorque y se mostró la pantalla de inicio de sesión. Falta el recorrido autenticado y la evidencia de persistencia del taller piloto. Cubre login, cliente/vehículo, orden de trabajo, borrador de cotización, recarga e historial. Las escrituras alojadas requieren autorización específica. Conservar la pauta de respaldo manual local cada dos días y antes de cambios de datos. No reabrir A ni B. SEC07 permanece pendiente de C.

---

## SEC07 cierre A — BLOCK_A_PASS_V04 (evidencia del propietario)

**Bloque A aprobado sobre v04**: ATTACHED_R8, BOOTSTRAP READY, GPG PASS, CONTRACT MATCH, QA PASS, CLEANUP PASS, STATUS BLOCK_A_PASS_V04, PRODUCTION NOT_TOUCHED. Según informe recibido: propietarios/ACL de 281 entradas de aplicación y dependencias Auth recuperados; 20 tablas, 35 funciones de propietario postgres, 21 políticas RLS y 6 DEFAULT ACL; positivos admin A/B, aislamiento lectura/escritura A→B y comprobación de B intacto, mecánico restringido, dos mutaciones de planes rechazadas para no creador incluso AAL2 y creador AAL1; creador AAL2 autorizado con eventos, denegados sin eventos. Fixtures sintéticos revertidos, sin roles ficticios/grants añadidos ni datos reales recargados.

**Errores/soluciones:** S3-R4 MISSING_ROLE (rol exacto desconocido) → selección propia y Auth, S3-R5 descartado; primer CLOSE_A salida silenciosa tras bootstrap (causa exacta desconocida) → eliminar ALTER ROLE redundante, template0 separado, marcadores; BOOTSTRAP_WAIT desacoplado → runner adjunto R8 con espera interna y SELECT 1 por socket. Imagen supabase/postgres:17.6.1.136, aislamiento sin red/puertos, tmpfs, GPG binario, pg_restore --schema-only --use-list. El script final completo no fue aportado, solo informe y marcadores. Ver [checkpoint único de cierre A](docs/checkpoints/CHECKPOINT_BT_SEC07_CIERRE_A_PASS_V04.md).

**No repetir A ni R8/R9 ni inventarios aprobados.** Quedan únicamente B (infraestructura activa y ficha privada) y C (recorrido funcional autorizado Ignacio, persistencia y respaldo periódico manual). MFA SQL sintético no certifica desafío Auth real; 35 funciones v04 no equivalen necesariamente a las 37 posteriores. SEC07 sigue pendiente de aprobación para piloto hasta B/C. Riesgo PC-only conservado. No modificar producción, desplegar ni ampliar alcance.

---

## SEC07 cierre A — contrato v04 extraído; listo para ensayo de permisos (23–24/11/2026)

Evidencia del propietario: `BT_SEC07_CONTRACT_GPG: PASS`, `SCHEMA:EXTRACTED`, `ACL:EXTRACTED`, `RESULT:REVIEW_INPUT_READY`, `DATA_RESTORE:NOT_EXECUTED`, `ROLE_CREATION:NOT_EXECUTED`, `PRODUCTION:NOT_TOUCHED`. Manifiesto revisado: 318 entradas candidatas, 281 de aplicación y 37 dependencias administradas auth/storage (26 ROW SECURITY + 11 triggers de storage), no selección de políticas/triggers propios de ByteTorque en estos dos esquemas en el manifiesto. 20 tablas (12 públicas y 8 privadas), 35 entradas FUNCTION (incluida rls_auto_enable de plataforma), 21 políticas públicas, 76 ACL (incluyen permisos por columna), 6 DEFAULT ACL públicos. Funciones y tablas seleccionadas de owner postgres. **35 funciones de v04 no equivalen a las 37 del inventario productivo posterior; no certificar paridad temporal.** ACL de aplicación extraídas sin roles desconocidos señalados por el resumen; aparecen grants amplios en defaults futuros, no confundir con ACL efectiva de tablas. Ausencia de LOCAL_REVIEW en la salida no constituye parser SQL exhaustivo.

No restaurar datos reales ni roles representativos. Selección explícita de 281 entradas revisadas por IDs de este archive, respetando orden original de TOC; recuperar propietarios/ACL de aplicación, dependencias Auth necesarias usando roles reales de bootstrap, no grants de conveniencia en tablas de aplicación. Probar en una sola sesión con datos ficticios positivos/negativos A/B, mecánico, RPC, MFA y privilegios efectivos. Si se requiere volver a abrir v04 para pg_restore -L (el archivo descifrado de extracción se eliminó), hacerlo dentro del mismo recinto temporal, sin repetir inventario. Bloque A sigue PENDIENTE; B/C siguen según dictamen. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_CIERRE_A_CONTRATO_V04_EXTRAIDO_20261124.md). No producción ni deploy, solo docs main.

---

## SEC07 — cierre acotado al piloto: dictamen Astra adoptado (23/11/2026)

El propietario aportó el dictamen Astra posterior a S3-R4 y solicitó continuar hacia el cierre de seguridad. **S3-R5 de roles representativos DESCARTADO, NO EJECUTAR.** R4 falló MISSING_ROLE sin identidad del rol: no se conoce si corresponde a un objeto administrado o propio. Conservar S0/S1 local/S2-R11/R8/R9/S3-R1/R2/R3 en sus alcances acreditados. No repetirlos ni reexportar la base por ese fallo.

**Tres entregas de cierre, sin requisitos nuevos innecesarios:** A) contrato real de owners/ACL/default ACL, roles y dependencias propios de la aplicación extraído de v04, revisión por objeto/firma (incluidas personalizaciones activas auth/storage y defaults globales relevantes), aplicación en lab con roles reales sin grants de conveniencia y comprobación sintética de operaciones permitidas/denegadas por taller, admin/mecánico y RPC sensibles/MFA; B) ficha privada de recuperación de Auth/Render, accesos, secretos por reposición y dependencias Edge/Storage que se usen efectivamente; C) recorrido funcional autorizado del piloto y registro del respaldo periódico manual cada dos días y antes de cambios de datos. No exigir paridad total de roles reservados, prueba de pérdida total del proveedor, USB/Drive/automatización o cambio TLS enforcement como condición adicional de este cierre. Riesgo PC-only aceptado y explícito. No desplegar ni modificar producción por este dictamen.

**Próxima acción concreta:** extraer en el recinto Docker aislado el SQL de esquema del mismo v04 y metadatos por entrada TOC para revisar el contrato. No certificar por conteos, no seleccionar automáticamente mediante heurísticas SQL, no aplicar aún ni cargar filas. Selección definitiva y pruebas deberán utilizar el contenido archivado y dependencias revisadas. [Dictamen y criterios](docs/recovery/BT_SEC07_CIERRE_PILOTO_DICTAMEN_ASTRA_20261123.md). SEC07 **PENDIENTE DE APROBACIÓN PARA PILOTO**; no confundir con DR integral.

---

## SEC07-S3-R4 — RESTORE_EXIT 1 / MISSING_ROLE; reconciliación de roles globales (23/11/2026, Chile)

**Evidencia real del propietario (PowerShell 5.1):**
```text
BT_SEC07_S3_R4: START
BT_SEC07_S3_R4_LAB: READY
BT_SEC07_S3_R4_RESTORE_EXIT: 1
BT_SEC07_S3_R4_FIRST_ERROR: MISSING_ROLE
BT_SEC07_S3_R4_RESULT: SCHEMA_ACL_NOT_COMPLETE
```

R4 arrancó el bootstrap oficial del mismo lab Supabase PG17 y ejecutó `pg_restore --schema-only --exit-on-error --single-transaction` sin omitir owners/ACL. La clasificación detectó una referencia a un rol inexistente. No se conoce la identidad del rol exacto: el clasificador descartó ese dato junto al stderr crudo al destruir el contenedor. **No atribuir el fallo a un nombre concreto ni a corrupción de v04.** No certificó el exit GPG de esta ejecución porque el wrapper sale al primer error de restore; los PASS previos R3/R8/R9 conservan su alcance. R4 no toca producción ni altera backup.

**Corrección fundamentada de diseño:** PostgreSQL `pg_dump` de una base guarda definiciones/owners/ACL de objetos, pero no crea roles globales del clúster (https://www.postgresql.org/docs/17/app-pgdump.html; https://www.postgresql.org/docs/17/app-pg-dumpall.html, y guía https://supabase.com/docs/guides/self-hosting/restore-from-platform). A diferencia de S4B-R6, el bootstrap oficial ya funciona; sus roles no garantizan coincidencia con los de Supabase administrado. El inventario real anterior identificó 15 roles no-`pg_*`, sin roles de negocio personalizados identificados: anon, authenticated, authenticator, cli_login_postgres, dashboard_user, postgres, service_role, supabase_admin, supabase_auth_admin, supabase_etl_admin, supabase_privileged_role, supabase_read_only_user, supabase_realtime_admin, supabase_replication_admin y supabase_storage_admin. Roles globales y sus 25 membresías no son equivalentes a las ACL de objetos.

**R5 propuesto, NO ejecutado:** conservar la imagen y arranque R8 probados; antes de descifrar, comparar roles del laboratorio con inventario fuente conocido. Exigir presencia de roles centrales y anon/authenticated sin SUPERUSER/BYPASSRLS/LOGIN. Solo si falta un rol de infraestructura **ya identificado en el inventario real y en la allowlist fija** (cli_login_postgres, dashboard_user, supabase_etl_admin, supabase_privileged_role, supabase_read_only_user, supabase_replication_admin), crear su representación local restringida **NOLOGIN NOSUPERUSER NOCREATEROLE NOCREATEDB NOREPLICATION NOBYPASSRLS NOINHERIT**, sin contraseñas ni memberships. No cambiar atributos de roles existentes ni crear roles desconocidos. Mostrar únicamente nombres permitidos y conteo, y reportar claramente que son placeholders de identidad, no recuperación de atributos/membresías administradas. Ejecutar una sola restauración schema-only de v04 con owners/ACL, sin cargar filas, comprobar métricas de S3-R1 y roles efectivos, indicar coincidencia o discrepancia sin atribuirla automáticamente a diferencia temporal. Si reaparece MISSING_ROLE, extraer del primer ERROR solo el nombre si pertenece al inventario permitido, no SQL ni logs; de otro modo NOT_IN_INVENTORY_OR_UNPARSED, STOP. No volver a intentar automáticamente. Cualquier PASS con placeholders es **reproducción de ACL de esquema en laboratorio con roles representativos, NO paridad de roles globales ni recuperación funcional de Supabase**.

**Estado:** S3-R4 no completado. S3-R3 inventario ACL PASS y S4B/S4C conservados. S3 global y S4 integral abiertas. No repetir etapas aprobadas, no exportar de nuevo producción por este error, no usar Codex, no despliegue, `main` docs-only `[skip render]`. La próxima ejecución debe aportar evidencia nueva de reconciliación de dependencias antes de restaurar, no una repetición de R4.
 
---

## SEC07-S3-R3 — índice ACL del respaldo v04: PRESENTE (23–24/11/2026)

**Evidencia literal real desde PowerShell 5.1, aportada por el propietario:**
```text
BT_SEC07_S3_R3: START
BT_SEC07_S3_R3_LAB: READY
BT_SEC07_S3_R3_GPG: PASS
BT_SEC07_S3_R3_TOC: READ_PASS
BT_SEC07_S3_R3_TOC_OBJECTS: 889
BT_SEC07_S3_R3_TOC_ACL_ITEMS: 213
BT_SEC07_S3_R3_TOC_DEFAULT_ACL_ITEMS: 24
BT_SEC07_S3_R3_TOC_OWNER_POSTGRES: 360
BT_SEC07_S3_R3_RESULT: ACL_ITEMS_PRESENT
```

**Diagnóstico:** el backup cifrado **v04 S2-R11** descifró correctamente mediante el `GNUPGHOME` S1A y `pg_restore --list` de PostgreSQL 17 pudo leer 889 entradas del índice. Los 213 `ACL` y 24 `DEFAULT ACL` corresponden a **entradas de todo el archive, incluidas superficies administradas**, NO equivalen a 213 GRANT individuales ni a los seis default ACL actuales medidos solo en esquemas de aplicación. 360 líneas del índice terminaron con token de propietario `postgres`: **la cuenta no demuestra restauración de owner de cada objeto**. Este conteo identifica cobertura potencial de ACL/owner preservada en el archivo; no confirma exactitud frente a producción ni que pueda aplicarse.

**Corrección de interpretación del error R8/R9:** se usaron expresamente `pg_restore --no-owner --no-acl`, opciones que **omiten aplicar** owners y permisos, y que no implican que el archive los haya perdido. Documentación PostgreSQL 17 `pg_restore`: https://www.postgresql.org/docs/17/app-pgrestore.html. **No exportar más roles/ACL remotamente todavía** ni regenerar v04. Solo se examinó TOC en contenedor Docker offline sin red, no se modificó producción ni claves.

**Próximo avance S3-R4 pendiente:** un ensayo único **schema-only** con el **mismo** respaldo v04 en laboratorio Supabase PostgreSQL 17 nuevo aislado, usando bootstrap oficial y `pg_restore --schema-only --single-transaction --exit-on-error` **sin** `--no-owner` ni `--no-acl`. Comprobar owners y privilegios efectivos (12 tablas de aplicación, funciones y default ACL) contra conteos S3-R1 y S3-R3 sanitizados, evitando restaurar datos y roles globales de producción. Si falta rol/objeto, **STOP** con categoría sanitizada; no reintentos ciegos ni creación de superusuarios arbitrarios. Éxito de aplicación en laboratorio ≠ cobertura total de recuperación externa (Auth, Storage bytes, Edge, Render). El laboratorio debe usar `--network none --rm`, tmpfs PGDATA/`/tmp`/socket, capa escribible temporal para clave `pgsodium` como R8 (NO `--read-only` al arrancar servidor). `--schema-only` no ejecutará una carga de filas del dump. S3 global y S4 integral siguen abiertas hasta salida comprobada.

**Estado:** S3-R3 `ACL_ITEMS_PRESENT` **PASS de inventario del archive**; no declarar todavía S3-R4 ni restauración de ACL aprobadas. Registrar [checkpoint S3-R3](docs/checkpoints/CHECKPOINT_BT_SEC07_S3_R3_ACL_ARCHIVO_V04_PRESENTES_20261124.md), `main`, solo docs `[skip render]`, sin Codex, Render o SQL remoto.

---

## SEC07 S3-R3 — roles/owners reales leídos y preflight ACL del v04 preparado (23–24/11/2026)

**Investigación exclusiva de lectura realizada mediante Supabase conectada sobre `biomotors-taller` en PRODUCCIÓN, PG17, y contrastada con el catálogo GitHub:**
- `BEGIN TRANSACTION READ ONLY` inventario global: **31 roles**, de ellos 16 `pg_*`, 8 `supabase_*`, 0 `bt_*`, **25 membresías entre roles**, 9 LOGIN distintos de los `pg_*`. No se consultaron contraseñas, secretos ni filas de usuarios/clientes.
- Las 15 denominaciones no-`pg_*` corresponden a `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`, `postgres`, `service_role` y 8 roles `supabase_*`. **No aparece un rol personalizado ByteTorque identificado**, pero no se certifica que todos los roles gestionados sean transferibles sin configuración Supabase. `cli_login_postgres` es el rol temporal usado por CLI para conexión passwordless según documentación actual.
- Propietarios de objetos de aplicación `public` y `bt_*`: **20 relaciones de tipo tabla/objetos relacionados** y **37 funciones** propiedad de `postgres`; **2 esquemas privados** propiedad de `postgres` y esquema `public` propiedad de `pg_database_owner`. Inventario amplio de estos esquemas: 20 objetos con ACL explícita, 6 registros de default ACL. Este dato es **actual** en producción y no prueba que el snapshot v04 tenga idénticos ACL/owners en su fecha de captura.
- Dado el resultado y los errores históricos de `pg_dumpall --roles-only` de **0 bytes**, **NO se ejecutó ninguna exportación nueva de roles ni se creó contenido SQL claro**. Se identificó camino potencialmente más breve: comprobar **en modo offline** si el v04 custom `PGDMP` ya contiene elementos `ACL`, `DEFAULT ACL` y metadatos owner, normalmente disponibles en un archive custom. `pg_restore --no-owner --no-acl` de R8/R9 **omite la aplicación** de dichos privilegios; **no demuestra que el archivo original carezca de ellos**.

**Próxima acción única, nueva y necesaria, pendiente en PC:** script completo `BT_SEC07_S3_R3` entregado en el chat (23–24/11/2026): seleccionar archivo `*_nobom_v04.dump.gpg` y `GNUPGHOME` ya validado, descifrar GPG→Docker local offline por bytes sin persistir dump en claro; ejecutar `pg_restore --list` sobre el mismo archive y contar **solo número de objetos TOC, entradas ACL, DEFAULT ACL y entradas cuyo owner es postgres**, sin imprimir nombres/SQL ni restaurar. Contenedor usa `--network none --read-only --rm --pull=never --log-driver none --tmpfs /tmp` porque ahora solo corre `pg_restore` **cliente** sin entrypoint de Supabase/pgsodium ni inicialización PGDATA (diferente de R7). Consume por completo stdin para no cortar GPG; deja TOC solo en tmpfs y se autodestruye. **No es una repetición de validación TOC S2-R11:** verifica cobertura de permisos no inventariada antes. No marca S3 PASS hasta obtener salida real. Si archive contiene ACL y DEFAULT ACL, investigar restauración de permisos sin una nueva exportación remota; si faltan, preparar un único procedimiento de captura cifrada autorizado, conservando respaldo v04.

**Fuentes técnicas:** documentación PostgreSQL `pg_restore --list` y opciones `--no-owner/--no-acl`, Supabase CLI v3 local-default/remote explícito, y discusión oficial sobre `cli_login_postgres`. La exposición de roles con nombres conocidos NO acredita recuperación de secretos ni roles/políticas de usuarios Auth. No escribir producción, no repetir R8/R9, no descargar datos desde producción; uso de `main` y commit documental `[skip render]`.

---

## SEC07 S3-R2 — identificadas 6 funciones SECURITY DEFINER en public (sesión 23–24/11/2026)

El propietario entregó CSV real del SQL Editor `biomotors-taller` con las seis funciones de `public` ejecutables por `authenticated`: `bt_creator_is_creator`, `bt_creator_overview`, `bt_creator_manage_subscription`, `bt_creator04_accounts`, `bt_creator04_manage_account` y `bt_plan04_my_status`. **6/6 tienen acceso al esquema, ACL no nula y `anon_puede_ejecutar=false`.** Firma y flags compatibles con [BT_CREATOR_01](docs/sql/BT_CREATOR_01_PRIVATE_SUBSCRIPTIONS_CANDIDATE.sql) y [BT_PLAN_04A](docs/sql/BT_PLAN_04A_PERSONAL_ENTITLEMENTS_CANDIDATE.sql): función de creador basada en `auth.uid()`, comprobaciones de creador para RPC administrativas, MFA `aal2` para 2 funciones que modifican planes y membresía activa por taller en `my_status`. **Códigos CANDIDATE**, no se verificó que los cuerpos SQL remotos coincidan exactamente ni se hizo prueba de llamadas con identidades. **Inventario R2 PASS**; NO afirmar seguridad integral ni ejecutar revocaciones a ciegas. Priorizar recuperación cifrada y real de roles/owners/ACL/default privileges y cobertura externa S3, con nueva autorización para cualquier exportación conectada a producción. Checkpoint: [S3-R2](docs/checkpoints/CHECKPOINT_BT_SEC07_S3_R2_6_FUNCIONES_INVENTARIADAS_20261124.md). Solo docs `main`, `[skip render]`; sin deploy, SQL mutativo, lectura de datos ni secretos.

---

## SEC07 S3-R1 — inventario REAL de permisos SQL solo lectura (23/11/2026, Chile)

**Evidencia entregada por el propietario desde SQL Editor Supabase del proyecto `biomotors-taller`, entorno `main` (PRODUCTION):**
```json
{
  "marker": "BT_SEC07_S3_R1_INVENTORY",
  "result": "CATALOG_METADATA_ONLY_NO_CHANGES",
  "tables_found": 12,
  "tables_expected": 12,
  "tables_rls_forced": 9,
  "anon_select_tables": 0,
  "tables_rls_enabled": 12,
  "default_acl_entries": 6,
  "tables_explicit_acl": 12,
  "distinct_table_owners": 1,
  "standard_roles_present": 3,
  "public_roles_privileged": 0,
  "security_definer_functions": 18,
  "authenticated_delete_tables": 0,
  "authenticated_select_tables": 12,
  "security_definer_public_anon_executable": 0,
  "security_definer_public_authenticated_executable": 6
}
```

**Interpretación técnica y límites:** el script `docs/sql/BT_SEC07_S3_R1_INVENTARIO_CATALOGO_READONLY.sql` se diseñó con `BEGIN TRANSACTION READ ONLY`; el propietario comunicó un resultado de catálogo con `CATALOG_METADATA_ONLY_NO_CHANGES` (etiqueta generada, no auditoría independiente de SQL de la plataforma). Están presentes las 12 tablas objetivo; RLS habilitada 12/12 y FORCE 9/12 (no exigir FORCE a las otras 3 sin estudiar sus reglas); 0/12 con SELECT efectivo para `anon`; `authenticated` tiene SELECT en 12/12 y DELETE en 0/12; `anon/authenticated` sin SUPERUSER/BYPASSRLS, existen los tres roles estándar. Doce objetos tienen ACL explícitas, seis entradas de privilegios predeterminados y un único owner de las 12 tablas. **La existencia de 18 funciones SECURITY DEFINER (según alcance público + bt_ del SQL) y 6 funciones SECURITY DEFINER de `public` con `EXECUTE` efectivo para `authenticated`, 0 para `anon`, exige revisión dirigida pero NO demuestra vulnerabilidad.** La consulta solo cuenta funciones; NO proporciona identidades, cuerpos ni efectividad de controles internos. El conteo de 18 NO equivale a 18 funciones expuestas públicamente.

**Estado de etapa:** S3-R1 inventario agregado **PASS (evidencia reportada), sin cambios intencionales**; S3 global todavía **NO CERRADA**. Inventario NO constituye archivo recuperable de roles, GRANT/REVOKE/default privileges, owners ni prueba de RLS por todas las tablas/roles. S4C-R9 continúa CHECK_PASS_LIMITED. No alterar permisos ni revocar funciones sobre la sola base del conteo; impedir impactos a la app piloto.

**Siguiente paso de valor, una sola lectura dirigida:** obtener únicamente las identidades de esas seis funciones `SECURITY DEFINER` de `public` ejecutables por `authenticated`, más si el EXECUTE proviene de ACL explícita o valores predeterminados, sin bodies/secrets/data; comparar con las definiciones reales de `main` y evaluar existencia de `auth.uid()`, validación de membresía y taller, `search_path` seguro y privilegios mínimos. Script preparado para el chat: SQL metadata-only `BEGIN TRANSACTION READ ONLY`, no `GRANT/REVOKE/ALTER`. Identificar luego si hay brechas reales y avanzar respaldo de roles/ACL sin repetir restauración R8/R9.

**Registro histórico:** resultado no equivale a certificado RLS de lectura/grants restaurados; no cambiar producción o Render. Mantener `main` y commits documentales `[skip render]`; sin secretos, RUT, nombres de clientes o dumps en GitHub.

---

## SEC07 S3-R1 — inventario de permisos preparado, NO ejecutado (23/11/2026)

Avance desde S4C-R9 `CHECK_PASS_LIMITED`: se consolidó matriz de cobertura **S3** de permisos/owners/roles, Auth, Storage, Edge y Render, usando evidencias históricas CP50/51 y reglas actuales Supabase. Se preparó una sola consulta `BEGIN TRANSACTION READ ONLY` **solo catálogo agregado** para ejecución voluntaria del propietario en SQL Editor: [`docs/sql/BT_SEC07_S3_R1_INVENTARIO_CATALOGO_READONLY.sql`](docs/sql/BT_SEC07_S3_R1_INVENTARIO_CATALOGO_READONLY.sql). Matriz y alcance: [`docs/BT_SEC07_S3_MATRIZ_COBERTURA_20261123.md`](docs/BT_SEC07_S3_MATRIZ_COBERTURA_20261123.md). **No consultado remoto, sin resultados ni PASS S3 aún.** No reejecutar R8/R9 ni exponer secretos o clientes. GitHub `main` docs-only `[skip render]`.

---

## SEC07-S4C-R9 — comprobación complementaria PASS limitada (23/11/2026)

**Evidencia Windows PowerShell 5.1 aportada por el propietario, posterior al R8:**
```text
BT_SEC07_S4C_R9: START
BT_SEC07_S4C_R9_LAB: READY
BT_SEC07_S4C_R9_RESTORE_EXIT: 0
BT_SEC07_S4C_R9_GPG: PASS
BT_SEC07_S4C_R9_STRUCTURE: PASS
BT_SEC07_S4C_R9_RLS: WORKSHOPS_AB_PASS_LAB_GRANT
BT_SEC07_S4C_R9_ACL: NOT_CERTIFIED_NO_ACL_RESTORE
BT_SEC07_S4C_R9_RESULT: CHECK_PASS_LIMITED
```

**Resultado:** segunda ejecución real del v04 cifrado en laboratorio local Supabase PostgreSQL 17 aislado, reutilizando la arquitectura R8 ya validada; descifrado GPG y `pg_restore` código 0. El script S4C-R9 de esta conversación ejecutó **dentro del mismo laboratorio restaurado, antes de destruir el contenedor**: existencia de 12 tablas de aplicación definidas en `public`, RLS habilitada para cada una, existencia de `auth.users`, al menos dos talleres en `public.workshops` y una membresía, presencia **global** de al menos una FK y un índice en `public`, y ausencia de relaciones huérfanas detectadas para vehicles→customers, work_orders→vehicles, inspection_findings→work_orders y memberships→auth.users/workshops. `STRUCTURE:PASS` **NO** certifica todas las FK/índices por tabla ni un cotejo de conteos/filas contra producción.

**Alcance exacto del PASS RLS:** en el laboratorio se otorgó explícitamente y solo para la prueba `GRANT USAGE ON SCHEMA public` y `GRANT SELECT` a `authenticated` sobre workshops y memberships, porque el restore se hizo con `--no-acl`. Se seleccionó una membresía activa de un usuario Auth con correo confirmado en taller A activo y otro taller B activo sin membresía activa para ese usuario. Con `SET LOCAL ROLE authenticated` y `request.jwt.claim.sub` temporal se verificó que la policy de `public.workshops` **permitió ver A e impidió ver B**. **No** certifica todas las tablas, operaciones de escritura, revocación, roles admin/mecánico, owners/ACL originales ni seguridad RLS funcional global. El laboratorio no requiere acceso a producción para esta comprobación.

**Estado actualizado:** S2-R11 estructural PASS; S4B-R8 restauración técnica PASS; S4C-R9 estructura y RLS lectura workshops A/B **CHECK_PASS_LIMITED**. **S4 integral permanece ABIERTA**: falta comparación de datos/filas esperados, controles completos de permisos, grants/owner, RLS de tablas restantes, matrices A/B en operaciones relevantes y cobertura S3 (Auth operativo, Storage binario, Edge, Render, secretos). No convertir `NOT_CERTIFIED_NO_ACL_RESTORE` en error de backup ni declararlo PASS. El laboratorio R9 fue efímero `--rm` y no persiste. Ningún cambio a Supabase/Render/producción. No reejecutar R8 ni R9 como verificación rutinaria; el siguiente trabajo debe concentrarse en la **brecha verificable** y consolidar lo faltante, sin añadir una sucesión de reintentos.

**Referencia:** [checkpoint S4C-R9](docs/checkpoints/CHECKPOINT_BT_SEC07_S4C_R9_VALIDACION_LIMITADA_PASS_20261123.md), [runbook R8](docs/recovery/BT_SEC07_S4B_R8_SOLUCION_Y_PREVENCION_20261123.md). Documentación sanitizada, solo rama `main`, `[skip render]`.

---

## SEC07 — Runbook permanente tras S4B-R8 PASS (23/11/2026)

**Solución y prevención documentadas:** [`docs/recovery/BT_SEC07_S4B_R8_SOLUCION_Y_PREVENCION_20261123.md`](docs/recovery/BT_SEC07_S4B_R8_SOLUCION_Y_PREVENCION_20261123.md). Describe toda la secuencia real desde claves/GPG y R2-R7, causa demostrada vs hipótesis, corrección operativa R8, guardas para PostgreSQL/Supabase/Docker/PowerShell y estado posterior. **R8 RESTORE_PASS**, no significa **S4 global PASS**; S4C con controles de datos y A/B pendiente. **No repetir R8 rutinariamente ni reexportar S2-R11.**

---

## SEC07-S4B-R8 — RESTORE_PASS real en laboratorio aislado (23/11/2026)

**Evidencia recibida del propietario desde Windows PowerShell 5.1:**
```text
BT_SEC07_S4B_R8: START
BT_SEC07_S4B_R8_LAB: READY
BT_SEC07_S4B_R8_RESTORE_EXIT: 0
BT_SEC07_S4B_R8_GPG: PASS
BT_SEC07_S4B_R8_CATALOG: CHECK_PASS
BT_SEC07_S4B_R8_RESTORE: PASS
BT_SEC07_S4B_R8_RESULT: RESTORE_PASS
```

**Resultado verificado por el procedimiento y reportado por el propietario:** se ejecutó en su PC el R8 de PowerShell 5.1, usando el archivo cifrado existente S2-R11 v04 (`*_nobom_v04.dump.gpg`), `GNUPGHOME` seleccionado, GnuPG y Docker local con imagen fijada `supabase/postgres:17.6.1.136`. El entrypoint/migraciones oficiales completaron el bootstrap y la comprobación de roles estándar antes de emitir `LAB:READY`. Se creó `bt_s4` desde `template0` y `pg_restore` terminó con exit code 0, con `--exit-on-error --single-transaction --no-owner --no-acl`. GPG terminó con exit code 0 y estado `DECRYPTION_OKAY`; el stream binario hacia Docker no registró error y Docker terminó exit 0. Consulta sintética del catálogo confirmó **al menos una tabla no perteneciente a los esquemas de sistema** en la base restaurada. **S4B RESTAURACIÓN TÉCNICA PASS; primera restauración completa del archive v04 confirmada en laboratorio.** Esta evidencia procede de etiquetas compartidas, no de inspección remota del PC.

**Corrección aplicada y aprendizaje R7→R8:** R7 quedó en `BOOTSTRAP_FAILED` sin log persistente; conflicto comprobado de diseño entre `docker run --read-only` y necesidad de escritura de clave temporal `pgsodium` en `/etc/postgresql-custom/pgsodium_root.key`, cuya causalidad histórica exacta no se pudo demostrar. R8 retiró **solo** `--read-only`, preservó entrypoint, migraciones, imagen fijada, `--network none --rm --pull=never --log-driver none`, ausencia de puertos/bind mounts y `tmpfs` para PGDATA, `/tmp` y socket. R8 pasó con esta configuración; es evidencia de solución operativa, no prueba forense de la única causa de R7. La capa escribible efímera puede producir huellas temporales en disco host; no afirmar cero huella ni seguridad ante pérdida del PC. No se conectó ni modificó producción durante este procedimiento.

**Alcance que NO certifica R8:** la consulta de catálogo solo comprobó existencia de tabla(s), NO cantidades de filas, integridad semántica/datos esperados, FK/índices, owners, ACL/GRANT, políticas RLS efectivas, funciones SECURITY DEFINER, aislamiento entre talleres A/B con roles no privilegiados, ni componentes Supabase fuera del dump (Auth operativo, archivos Storage, Edge Functions, configuración/secretos, Render). `--no-owner --no-acl` impide considerar restaurados los propietarios y privilegios originales. **S4 restauración técnica PASS; S4 recuperación integral/seguridad NO CERRADA; S3 servicios/permisos PENDIENTE.** S2-R11 sigue PASS y no se repite ni reexporta.

**Siguiente acción útil, una sola ronda consolidada:** definir y ejecutar validación focalizada de datos/estructura esperados y permisos/RLS negativos de talleres A/B, con evidencia sanitizada y sin filas ni secretos; distinguir cobertura externa S3. Mantener solo `main`, cambios documentales `[skip render]`, sin Codex, producción, Render, SQL remoto, ramas ni nuevas auditorías S2. Guardar este hito en checkpoint único `docs/checkpoints/CHECKPOINT_BT_SEC07_S4B_R8_RESTAURACION_TECNICA_PASS_20261123.md`.

---

## SEC07-S4B-R7 — BOOTSTRAP_FAILED; conflicto de escritura pgsodium en rootfs RO (23/11/2026)

**Evidencia aportada por propietario:**
```text
BT_SEC07_S4B_R7: START
BT_SEC07_S4B_R7_LAB: BOOTSTRAP_FAILED
```
**Confirmado:** R7 llegó a ejecutar una inicialización de laboratorio, pero **no emitió LAB:READY ni inició GPG ni pg_restore**. Los registros del contenedor quedaron en tmpfs y fueron eliminados por --rm; la causa exacta histórica no puede reconstruirse desde esos dos marcadores. S2-R11, GPG aislado, backup v04 y pruebas previas siguen sin necesidad de repetición.

**Defecto comprobado estáticamente del diseño R7 y causa probable de BOOTSTRAP_FAILED:** invocó `docker run --read-only` mientras el mecanismo de arranque oficial del tag `supabase/postgres:17.6.1.136` migra extensiones y utiliza `/usr/lib/postgresql/bin/pgsodium_getkey.sh`, que crea `/etc/postgresql-custom/pgsodium_root.key` si no existe. Ruta dentro del rootfs no montada como escritura temporal en R7. Docker Compose oficial utiliza `db-config:/etc/postgresql-custom` escribible; el script del tag se encuentra en `https://github.com/supabase/postgres/blob/17.6.1.136/ansible/files/pgsodium_getkey_urandom.sh.j2`; Compose `https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml`. **Este conflicto es real; su relación causal exacta con la salida Windows R7 permanece probable, no demostrada**, porque stderr fue ocultado.

**Corrección propuesta R8 (NO ejecutada en PC):** conservar la imagen Supabase PG17 fijada, entrypoint y migraciones propios, `--network none --log-driver none --rm -i --pull=never`, PGDATA `/var/lib/postgresql/data`, `/tmp` y socket `/var/run/postgresql` en tmpfs; **quitar solo `--read-only`** para que Supabase pueda escribir el archivo de clave aleatoria de laboratorio y conservar los archivos de configuración de imagen. Se evita montar tmpfs encima de `/etc/postgresql-custom` porque ocultaría configuraciones originales. La capa overlay temporal de Docker puede escribirse en el almacenamiento del PC con el archivo generado de la clave del LAB, y se elimina al destruir contenedor; **no afirmar ausencia absoluta de huella en disco**, aunque el respaldo en claro fluye por pipe y los datos de PG y logs permanecen en tmpfs. La clave efímera NO es la clave de Supabase producción. Clasificar error bootstrap mediante categorías fijas del log en tmpfs, sin mostrar SQL, rutas ni contraseñas, antes de cualquier GPG. Restaurar una sola vez v04 si boot READY en bt_s4 desde template0, evaluar GPG+exit restore; no alterar S2/R6 ni producción. Shell R8 se comprobó con `sh -n` y transporte FD3 usando bytes de prueba incluido NUL en laboratorio Linux **sin Docker real ni backup**. R8 no es PASS; STOP ante fallo.

**Estado:** S4 FULL RESTORE PENDIENTE. `--no-owner --no-acl` no certifica owners/ACL/RLS A/B. Auth, Storage, Edge, Render, secretos/S3 externos pendientes. Esta investigación y error quedan respaldados para evitar repetición; no Codex, no deploy.

---

## SEC07 S4B-R6 — informe Astra recibido; bootstrap oficial Supabase propuesto para R7 (23/11/2026)

**Investigación independiente entregada por el propietario:** informe "ByteTorque S4B-R6 — Dictamen para el chat principal" (revisión de PostgreSQL 17, imagen Supabase fijada, migrador y RLS). **Causa de R6 con alta confianza, no demostrada forénsicamente:** el script invocó `initdb` directamente, eludiendo las migraciones oficializadas que crean roles globales Supabase. R6 registró `LAB:READY`, `RESTORE_EXIT:1`, `MISSING_ROLE` pero nunca reveló el nombre. `authenticated` es candidato respaldado por políticas `CREATE POLICY ... TO authenticated` del código aplicado de ByteTorque, NO identidad del primer rol confirmada. `--no-owner --no-acl` no omite referencias a roles en políticas.

**Corrección de la investigación previa:** `docker/volumes/db/roles.sql` del Compose modifica contraseñas de roles ya existentes mediante ALTER USER; **no crea** el conjunto de roles. El mecanismo correcto de arranque del tag `supabase/postgres:17.6.1.136` es `docker-entrypoint.sh` (Dockerfile-17), el cual ejecuta los archivos de `/docker-entrypoint-initdb.d` incluyendo `migrate.sh` del tag: base inicial `postgres` bajo `supabase_admin`, creación de `anon/authenticated/service_role` e internos, ejecución de migraciones y fin de bootstrap. La restauración debe ir a una base **distinta y vacía** `bt_s4` creada desde `template0` para evitar conflictos con esquemas que ya crea Supabase en `postgres`.

**Investigación comprobada con fuentes fijadas:** `https://github.com/supabase/postgres/blob/17.6.1.136/Dockerfile-17`; `https://github.com/supabase/postgres/blob/17.6.1.136/migrations/db/migrate.sh`; `https://github.com/docker-library/postgres/blob/6edb0a8c4def40c371514b34aef9037ec82d9110/17/alpine3.23/docker-entrypoint.sh`; `https://www.postgresql.org/docs/17/app-pgrestore.html`. El entrypoint imprime `PostgreSQL init process complete; ready for start up.` **solo después** de procesar init scripts; R7 usa esa marca en log protegido tmpfs más consulta local que exige roles estándar y `authenticated` sin superuser/BYPASSRLS antes de iniciar GPG. Preservar config de imagen `/etc/postgresql-custom`: no montar tmpfs sobre ella.

**Propuesta única R7 (no ejecutada):** una ejecución PowerShell 5.1 local con imagen ya descargada, Docker `--rm -i --pull=never --network none --read-only --log-driver none`; `tmpfs` PGDATA, /tmp y socket /var/run/postgresql; contraseña efímera aleatoria solo de laboratorio, sin exponerla en chat; ejecutar entrypoint oficial dentro del contenedor, stdout/stderr de bootstrap exclusivamente a /tmp tmpfs; comprobar fin de migraciones y roles (sin mostrar nombres privados ni logs). Crear `bt_s4 TEMPLATE template0`, anunciar READY, enviar ciphertext v04 a GPG con `--homedir` S1A y su salida binaria por Docker stdin/FD3 a `pg_restore` sin `-` final, `--no-owner --no-acl --exit-on-error --single-transaction`; registrar exit code, clasificar fallo solo con constantes, comprobar catálogo sintético tras éxito, detener y limpiar contenedor. **No se ejecutó Docker en el PC del usuario; no afirmar R7 PASS**. En laboratorio Linux local se comprobó `sh -n` del script interno y un ensayo ficticio de FD3 con bytes NUL, no la restauración real ni la ejecución del entrypoint Supabase.

**Riesgos/pendientes:** los roles personalizados pueden seguir faltando; el bootstrap oficial puede requerir recursos/configuración adicional; si falla registrar primera clase sin nuevos ciclos de pruebas generales. El éxito con `--no-owner --no-acl` no verifica owners, GRANT, RLS A/B ni datos por taller, funciones SECURITY DEFINER, Auth operativo, binarios Storage, Edge/Render/config/secrets externos; estos quedan pendientes y requieren comprobación separada. **S4 PENDIENTE**. Todo sin producción, Render, ramas nuevas, Codex ni nuevos backups. Traspaso completo de R6 está en conversación, no pedir al propietario repetirlo. Regla permanente de errores/soluciones/documentación activa.

---

## SEC07 S4B-R6 — imagen Supabase PG17 READY; primera dependencia MISSING_ROLE (23/11/2026)

**Resultado real reportado desde Windows PowerShell 5.1 (no contiene datos sensibles):**
```text
BT_SEC07_S4B_R6_IMAGE: READY
BT_SEC07_S4B_R6_LAB: READY
BT_SEC07_S4B_R6_RESTORE_EXIT: 1
BT_SEC07_S4B_R6_FIRST_ERROR: MISSING_ROLE
BT_SEC07_S4B_R6_RESULT: RESTORE_NOT_COMPLETE
```
**Hechos:** la imagen local `supabase/postgres:17.6.1.136` quedó disponible, `initdb`/cluster temporal y `createdb` pasaron, `pg_restore` inició y salió con código 1. El clasificador encontró texto compatible con un rol no existente. **No sabemos qué rol ni en qué instrucción del archive**, ni debemos inventarlo o dar por lograda la restauración. No se toca producción ni se repite S2-R11 (GPG, SHA, PGDMP y TOC previamente PASS).

**Investigación focalizada y evidencia externa:** la imagen Supabase no equivale a ejecutar su despliegue oficial de inicialización: el `docker-compose.yml` oficial fija `supabase/postgres:17.6.1.136` e incorpora explícitamente `./volumes/db/roles.sql:/docker-entrypoint-initdb.d/init-scripts/99-roles.sql`. La documentación oficial CONFIG.md describe migraciones/roles semilla del entorno self-hosted. El script R6 usa `initdb` directo y **no aplica esos roles**, lo que explica razonablemente `MISSING_ROLE` aun teniendo la imagen con extensiones. Referencias: `https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml` y `https://github.com/supabase/supabase/blob/master/docker/CONFIG.md`, `https://supabase.com/docs/guides/database/postgres/roles`, `https://www.postgresql.org/docs/17/app-pgrestore.html`. Es **hipótesis fuerte**, no rol identificado. `--no-owner --no-acl` omite propietarios/privilegios pero no elimina referencias a roles dentro de políticas RLS, definiciones de objetos o SQL de funciones.

**Decisión del propietario:** solicitar de nuevo revisión independiente de Astra; **no emitir nuevas variantes R7 ni ejecuciones diagnósticas hasta recibirla**. Alcance Astra: decidir mecanismo reproducible mínimo de precarga de roles y configuraciones a partir de fuentes oficiales fijadas, dentro del contenedor aislado y con datos ficticios o ningún dato persistente; no crear roles indiscriminadamente ni conceder `SUPERUSER`/`BYPASSRLS` a roles de aplicación; determinar si hay forma de reconocer solo nombres de roles públicos estándar y mantener secretos/identificadores de usuario ocultos. Entregar **una sola solución consolidada**, no una cadena de pruebas, y sus criterios de PASS/STOP. R6 `MISSING_ROLE` no es evidencia de que falten roles en producción. **S4 RESTORE NO PASS; S3 servicios externos, ACL y RLS sin certificar.**

Continuar registro en los cuatro documentos obligatorios; un único checkpoint al cierre verificado. Solo `main`, docs-only `[skip render]`, sin deploy ni llamadas a producción.
---

## SEC07-S4B-R5 — RESTORE_EXIT 1, clasificación MISSING_EXTENSION (23/11/2026)

**Evidencia Windows del propietario:**
```text
BT_SEC07_S4B_R5: START
BT_SEC07_S4B_R5_LAB: READY
BT_SEC07_S4B_R5_RESTORE_EXIT: 1
BT_SEC07_S4B_R5_FIRST_ERROR: MISSING_EXTENSION
BT_SEC07_S4B_R5_RESULT: RESTORE_NOT_COMPLETE
```
**Hechos:** el laboratorio PG17 Alpine aislado inicializó y `pg_restore` se ejecutó pero terminó con código 1. El clasificador R5 encontró un patrón compatible con extensión ausente en el comienzo de stderr; **esto es categoría diagnóstica, no identifica el nombre exacto de la extensión ni demuestra la causa completa**. No existe registro del stderr crudo porque el contenedor se destruyó; no afirmar S4 PASS o daño del v04. S2-R11 GPG/SHA/TOC y GPG aislado PASS continúan; no repetir.

**Investigación posterior (fuentes oficiales):** Supabase guía `https://supabase.com/docs/guides/self-hosting/restore-from-platform` requiere habilitar extensiones de origen que falten. Registro oficial de versiones `https://github.com/supabase/supabase/blob/master/docker/versions.md` fija la imagen PG17 de autoalojamiento `supabase/postgres:17.6.1.136` desde 2026-06-17. La imagen de Supabase trae más extensiones y configuración que `postgres:17-alpine`; por tanto, se propone **cambiar solo la imagen de destino del laboratorio** en un siguiente intento de restauración consolidada, sin alterar backup ni producción. El Dockerfile PG17 actual de Supabase (`https://github.com/supabase/postgres/blob/develop/Dockerfile-17`) contiene `su-exec` mientras Docker Postgres oficial usa `gosu`; no asumir que una imagen es idéntica a la otra: elegir el ejecutor disponible en el contenedor. Fijar tag verificado y verificar su presencia/descarga sin conexiones de red **dentro** del laboratorio. La imagen fijada de Supabase puede diferir del servidor managed original en extensiones/versiones/roles; no garantizar que R6 pase.

**Propuesta operativa:** respetando la orden de evitar pruebas inconducentes, ofrecer una sola ejecución R6 con imagen Supabase PG17 fijada, PGDATA y /tmp en tmpfs, contenedor sin red/puertos ni bind mounts, GPG local streaming usando GNUPGHOME correcto, script shell transportado como Base64 por argumento y stdin por FD3, `pg_restore` **sin argumento '-'**, y salida de primer error sanitizada. No repetir GPG/PGDMP/TOC, no instalar extensiones aleatorias. Verificar códigos GPG + restore + Docker y un chequeo del catálogo si restaura. STOP ante cualquier falla nueva, sin reruns automáticos. El nombre de la extensión no es conocido y no debe inventarse.

**Límites:** `--no-owner --no-acl` no certifica propietarios/ACL/RLS/talleres A-B; el éxito de restauración PostgreSQL no implica recuperación integral de Auth/Storage/Edge/Render/secrets; tmpfs puede usar swap. S4 sigue PENDIENTE, no publicar datos/contraseñas ni modificar Supabase/Render.

---

## SEC07 S4B-R4 — dictamen técnico independiente Sol; R5 corregido y aún no ejecutado (2026-11-23)

**Fuente:** informe técnico externo entregado por el propietario, contrastado con documentación oficial PostgreSQL 17 (`https://www.postgresql.org/docs/17/app-pgrestore.html`) y su fuente en `REL_17_STABLE/src/bin/pg_dump/pg_restore.c`. El chat principal conserva el bloque R4 original completo (no hace falta pedírselo al usuario).
**Defectos comprobados por revisión estática del R4:**
1. R4 invocó `gosu postgres pg_restore ... --no-acl - <&3`; en PostgreSQL 17 el argumento posicional final `-` se interpreta como nombre de archivo, mientras que **omitir** el argumento de archivo activa lectura desde stdin. Probable causa del `RESTORE_TOOL_OR_STREAM_ERROR` de R4, **alta confianza pero no recuperado el stderr original**.
2. R4 buscaba solamente `grep -m1 -E 'ERROR:|FATAL:'`; no clasificaba `pg_restore: error:` en minúsculas. Etiqueta `RESTORE_TOOL_OR_STREAM_ERROR` es un fallo del clasificador y NO demuestra pérdida del respaldo ni dependencia Supabase.

**Corrección R5 consolidada (propuesta, no comprobada en Windows):** conservar imagen local `postgres:17-alpine`, aislamiento (`--network none --read-only --rm --tmpfs /var/lib/postgresql/data --tmpfs /tmp`), `gosu`, Base64 del script shell preservando líneas, FD3 binario, `GNUPGHOME` S1A explícito, GPG BaseStream y stderr concurrentes; **eliminar el último argumento `-`** en `pg_restore`, agregar `--single-transaction --no-password` manteniendo `--no-owner --no-acl`, registrar exit code y clasificar diagnósticos cliente/servidor en minúsculas sin imprimir SQL, nombres o rutas. Si `pg_restore` sale 0, consultar solo conteo de tablas de usuario a nivel catálogo (sin nombres ni filas), emitir `CATALOG:CHECK_PASS` al éxito de la consulta y destruir el contenedor; esto NO prueba conteos de filas ni RLS.

**Comprobaciones locales (no en PC usuario):** `/bin/sh -n` PASS sobre texto Linux extraído del R5 y prueba sintética POSIX de `exec 3<&0; printf BASE64 | base64 -d | /bin/sh` con bytes incluidos NUL, preservados en salida; revisión estática comprobó ausencia del `-` posicional y presencia de clasificación y marcadores R5. **No contamos con PowerShell 5.1 ni Docker del titular en este entorno:** la ejecución de R5 y restauración PostgreSQL siguen PENDIENTES; no inferir PASS de S4.
**Límites:** `--no-owner --no-acl` no valida owners/GRANT/ACL ni tenant A/B; futura comprobación con identidades sin BYPASSRLS, Auth/Storage/Edge/Render/secrets externos siguen S3 abiertos; tmpfs no excluye por sí solo swap físico. No repetir S2-R11 ni pruebas aisladas de GPG.

**Decisión operacional:** propietario pidió no realizar más pruebas sin sentido. Presentar una sola ejecución integral R5, después de la revisión del informe y su aprobación, con salida reducida a `BT_SEC07_S4B_R5_*` y STOP ante el primer fallo. No crear nueva rama, no push de aplicación, no desplegar Render ni conectar producción. El R5 completo para uso PC se entrega como archivo `ByteTorque_S4B_R5.ps1` en el chat principal, no se suben backups/secretos.

---

## SEC07 — S4B-R4 laboratorio READY, restore no completado: escalar revisión a Astra (23/11/2026)

**Evidencia nueva del propietario (Windows):** `BT_SEC07_S4B_R4: START`, `BT_SEC07_S4B_R4_LAB: READY`, `BT_SEC07_S4B_R4_FIRST_ERROR: RESTORE_TOOL_OR_STREAM_ERROR`, `BT_SEC07_S4B_R4_RESULT: RESTORE_NOT_COMPLETE`. El laboratorio PG17 aislado arrancó; **`pg_restore` falló, pero el script ocultó su diagnóstico real al buscar solo `ERROR:|FATAL:`**. La etiqueta no demuestra defecto de backup ni de Supabase, y puede deberse a mensajes `pg_restore: error:` en minúsculas o falla de stdin/FD3. GPG aislado PASS, S2-R11 PASS estructural; no volver a probar claves/TOC. R4 ya terminó y el log tmpfs no persiste.

**Decisión explícita del propietario:** `No mas pruebas si sentido, ocupemos astra para que lo solucione.` Suspender ejecuciones iterativas y pedir revisión de causa y UNA corrección consolidada a Astra; no pueden invocarse modelos externos automáticamente desde este chat. Traspaso técnico: `docs/recovery/BT_SEC07_S4B_R4_ASTRA_HANDOFF_20261123.md`. No afirmar S4 PASS; no tocar producción, Render, Supabase ni backup v04. El siguiente intento solo tras revisión técnica razonada y aprobación del propietario; documentación continuada en cuatro archivos.

---

## SEC07 S4B-R3 — DOCKER_START_FAILED por defecto en empaquetado del script (23/11/2026)

**Salida real informada por propietario:** `BT_SEC07_S4B_R3: START`, `BT_SEC07_S4B_R3_STOP: DOCKER_START_FAILED`. No hay marcador `LAB:READY`; **no se confirmó** que `initdb` se invocara ni que empezara `pg_restore`.

**Defecto determinado mediante revisión estática del script R3 entregado:** `$linux = ($linux -replace '[\r\n]+', ' ').Trim()` convirtió líneas de código shell en espacios aunque varias carecían de `;` al final. Ejemplo `set -u\ngrep -q ...` pasó a `set -u grep -q ...`; sentencias `if/case` también quedaron concatenadas inválidamente. Esto puede explicar que Docker no emitiera marcador; **sin stderr del intento no puede asegurarse que sea la única causa**. El script R3 no debe reejecutarse.

**Corrección R4 propuesta (pendiente en PC):** preservar script POSIX completo en UTF-8 usando Base64 en la línea de comandos del contenedor, sin sustituir saltos de línea; decodificar dentro con `base64 -d | /bin/sh`. Duplicar entrada binaria Docker a descriptor `3` con `exec 3<&0`, y pasar `<&3` a `pg_restore` para que el script y el dump utilicen streams diferentes sin escribir payload en disco. Se comprobó en laboratorio Linux local la sintaxis `sh -n` del texto corregido y la conservación de fd3 en una prueba ficticia; **NO se comprobó Docker/Windows ni restore de v04**. Corregir `su-exec` por `gosu`, presente en Dockerfile oficial postgres 17 alpine; iniciar PGDATA y /tmp en tmpfs, network none, read-only, sin puertos; no tocar Supabase ni S2. Clasificar fase de laboratorio antes de invocar GPG y primer `ERROR/FATAL` solo por categoría. No imprimir SQL, secretos ni logs completos.

**Estado:** GPG aislado `PASS`; S4 restauración `PENDIENTE`. Si R4 devuelve clase PostgreSQL real, atender esa causa y no sumar otro ciclo de diagnóstico genérico. Sin despliegue; documentar validación posterior como hecho separado, en un checkpoint final único.

---

## SEC07-S4B — causa raíz INIT_FAILED: `su-exec` ausente (23/11/2026)

**Evidencia Windows del propietario:** `BT_SEC07_S4B_INIT_DIAG: START`, `BT_SEC07_S4B_INIT_DIAG: INITDB_FAILED`, `<PATH>: su-exec: not found`, `BT_SEC07_S4B_INIT_DIAG: COMPLETED`.

**Causa demostrada para `INIT_FAILED`:** el script S4B-R2 intentaba ejecutar `su-exec postgres initdb` pero la imagen oficial `postgres:17-alpine` no dispone del ejecutable `su-exec`. Así, `initdb` **nunca se llegó a invocar**; no es fallo PostgreSQL del backup, de credenciales GPG, de Docker tmpfs ni de dependencias de Supabase. El Dockerfile oficial `docker-library/postgres/17/alpine3.23/Dockerfile` utiliza e instala `gosu` para bajar privilegios. Fuente: https://github.com/docker-library/postgres/blob/master/17/alpine3.23/Dockerfile

**Corrección localizada:** sustituir las **cuatro** invocaciones `su-exec postgres` por `gosu postgres` en el script de laboratorio (initdb, pg_ctl, createdb y pg_restore); preservar flags de Docker `--network none`, `--read-only`, `--tmpfs` PGDATA + /tmp, `--pull=never`, GNUPGHOME correcto, respaldo v04 inalterado y salida sanitizada. Se trata de una corrección basada en código fuente oficial y mensaje observado, **no de prueba de restauración completa**. No repetir diagnóstico initdb separado, GPG aislado ni comprobaciones S2; realizar la siguiente restauración S4B con este ajuste y clasificar primer ERROR real de `pg_restore` o siguiente falla.

**Estado:** CAUSA de `INIT_FAILED` identificada; **fix R3 propuesto, aplicación en PC y `pg_restore` pendientes**. Al recibir salida Windows documentar error real/solución verificada. Sin producción/Render/Edge ni Codex. Mantener un solo checkpoint final consolidado.

---

## SEC07-S4B-R2 — initdb bloqueado en laboratorio temporal (23/11/2026)

**Evidencia real comunicada desde PowerShell:** `BT_SEC07_S4B_R2: START`, `BT_SEC07_S4B_R2_LAB: INIT_FAILED`, `BT_SEC07_S4B_R2_RESULT: LAB_BLOCKED`. Este marcador proviene del fallo de `su-exec postgres initdb` en Docker `postgres:17-alpine` con datos y /tmp configurados en tmpfs, sin red. **No se llegó a crear el clúster PostgreSQL ni a ejecutar `pg_restore`; por tanto no es fallo de dependencias Supabase ni evidencia de corrupción v04.** GPG ya había dado PASS en prueba aislada con GNUPGHOME explícito.

**Causa específica:** aún desconocida; el script anterior redirigía stderr de `initdb` a `/tmp/bt_init.log` y solo devolvía `INIT_FAILED`. Al ser contenedor `--rm`, ese archivo efímero ya no existe. El fallo puede deberse a permisos/capacidad, opciones o entorno de initdb, pero estas son hipótesis, no conclusiones.

**Siguiente corrección diagnóstica mínima:** ejecutar solo `initdb` en un contenedor nuevo sin GPG ni respaldo, con las **mismas opciones Docker de R2**, y mostrar exclusivamente hasta 3 líneas de error/hint del initdb de clúster vacío, con rutas sanitizadas, o un marcador fijo; no hacer otra restauración hasta tener la causa. Posteriormente cambiar solo el requisito que falle y ejecutar una restauración completa, no series de pruebas repetidas. No revelar secretos/SQL/datos, no cambios Supabase/Render, no deploy, backup v04 y S2-R11 intactos. S4 sigue `NO PASS`.

Fuentes de referencia: PostgreSQL 17 `https://www.postgresql.org/docs/17/app-initdb.html`; Docker `https://docs.docker.com/engine/storage/tmpfs/`.

---

## SEC07 S4B — clave de v04 descifra correctamente; corregir diagnóstico Docker/GPG (23/11/2026)

**Resultado nuevo real en PowerShell 5.1:** `BT_SEC07_S4B_ISOLATED: START`, `BT_SEC07_S4B_ISOLATED: GPG_PASS`, `BT_SEC07_S4B_ISOLATED: COMPLETED`, utilizando explícitamente el `GNUPGHOME` de custodia S1A y pasando la salida binaria del respaldo v04 a `Stream.Null`, sin guardar plaintext. **GPG DESCIFRADO PASS para esta operación**, no equivale a restauración PG.

**Causa corregida parcial:** `NO_SECKEY` inicial provino de consultar un almacén GPG distinto del almacén S1A, inferencia apoyada por correspondencia de key-id en dos almacenes S1A, y la operación correcta con `GNUPGHOME` explícito. **Origen exacto del falso `GPG_DECRYPTION_FAILED` tras seleccionar almacén todavía no demostrado:** el script S4B comprobaba primero exit GPG aunque Docker/pg_restore puede cerrar el pipe en un error anterior y causar salida no-cero de GPG. No asumir aún que fallo sea de dependencias Supabase.

**Ajuste técnico autorizado por continuidad de S4:** reusar v04, `GNUPGHOME` actual, motor Docker Linux; **sustituir, no repetir sin corrección,** el script S4B por uno que capture y priorice marcadores `LAB` y `FIRST_ERROR` de Docker/pg_restore antes de culpar a GPG, drenando GPG stdout ante cierre de pipe, stderr concurrentes y señal GPG `DECRYPTION_OKAY` solo para confirmación de restauración completa. Laboratorio sin red, PGDATA y /tmp tmpfs. Emitir solo etiquetas sanitizadas. Si etapa devuelve fallo, no repetir a ciegas. No S2-R11, generación de respaldo ni cambios Supabase/Render. **S4 FULL RESTORE PENDIENTE** y S3 externas pendientes.

**Fuentes de referencia:** PostgreSQL 17 pg_restore (`https://www.postgresql.org/docs/17/app-pgrestore.html`), Docker tmpfs (`https://docs.docker.com/engine/storage/tmpfs/`), GnuPG status (`https://github.com/gpg/gnupg/blob/master/doc/DETAILS`). Documentación es análisis/preparación; la siguiente ejecución de restauración aún no ocurrió.

---

## SEC07 S4B — fallo reiterado tras seleccionar GNUPGHOME (23/11/2026)

**Reporte del propietario:** tras `BT_SEC07_S4B_GPG_HOME: SELECTED_FOR_SESSION` y repetir el bloque S4B, "me dijo lo mismo de nuevo". Se interpreta provisionalmente como reiteración del marcador anterior `GPG_DECRYPTION_FAILED`, pero el usuario **todavía no compartió el marcador literal del nuevo intento**. **No declarar** fallo permanente de clave, respaldo ni restauración por esa referencia ambigua. No reejecutar S4B completo.

**Defecto adicional identificado en el script anterior:** comprobar el exit code GPG antes que el resultado `pg_restore` puede enmascarar una terminación anticipada de Docker/restore y un pipe interrumpido como `GPG_DECRYPTION_FAILED`. Los dos keyrings que coinciden por ID no prueban desbloqueo. Error y su hipótesis siguen abiertos.

**Corrección diagnóstica pendiente de ejecución:** una única prueba aislada GPG explícitamente con `$env:GNUPGHOME` ya seleccionado, `--status-fd 2`, datos binarios descifrados a `System.IO.Stream.Null`, consumo concurrente stderr, sin Docker y sin escritura en archivos, que produzca solo códigos `DECRYPTION_OKAY`, `NO_SECKEY`, `BAD_PASSPHRASE` u otra categoría. Es diagnóstico de la falla **nuevo contexto GNUPGHOME**, no repetir S2-R11 completo. Si GPG da PASS, reparar clasificador/tubería del script restaurador en vez de investigar claves otra vez; si falla, resolver causa GPG según estado. No publicar secretos ni mensajes crudos. Sin cambios productivos; S4 pendiente.

---

## SEC07 S4B — correspondencia de claves v04 en dos almacenes (23/11/2026)

**Evidencia PowerShell 5.1 del propietario:** `BT_SEC07_S4B_MATCH: START`, `BT_SEC07_S4B_KEY_MATCH: MULTIPLE_MATCH`, `BT_SEC07_S4B_MATCH: COMPLETED`. El diagnóstico leyó únicamente metadatos públicos del paquete destinatario y registros de claves privadas/subclaves, no descifró el v04. Dado que se hallaron dos almacenes `GNUPGHOME` y ambos tenían registro `sec`, `MULTIPLE_MATCH` indica correspondencia de identificador de destinatario en **ambos**. Esto no prueba que las claves estén desbloqueables ni que el restore funcione.

**Causa probable reforzada, aún no comprobada:** los S4B previos invocaron GPG sin `--homedir` o `GNUPGHOME`, lo que hizo consultar el keyring predeterminado (`NO_SECKEY`); la custodia S1A sí tiene ambos keyrings pertinentes. **Próximo paso mínimo propuesto:** seleccionar el primero de los dos keyrings coincidentes configurando `GNUPGHOME` solo para la sesión PowerShell actual y ejecutar una vez el S4B ya preparado, sin modificar script ni backup. GnuPG documenta que `GNUPGHOME` establece el almacén cuando no se pasa `--homedir`. Si fallo, no repetir ciegamente: clasificar según marcadores y actualizar causa/solución verificada. No revelar rutas de custodia ni identificadores en salida; no producción, no deploy, no Codex. S2-R11 sigue PASS estructural, S4 pendiente.

---

## S4B — custodia GPG localizada: 2/2 almacenes con clave privada (23/11/2026)

**Evidencia Windows comunicada:** `BT_SEC07_S4B_KEYRING: START`, `BT_SEC07_S4B_KEYRINGS_FOUND: 2`, `BT_SEC07_S4B_KEYRINGS_WITH_SECRET: 2`, `BT_SEC07_S4B_NEXT: VERIFY_KEY_MATCH`, `BT_SEC07_S4B_KEYRING: COMPLETED`. **Hecho confirmado:** la custodia local S1A contiene dos almacenes `GNUPGHOME` que exponen registros `sec` de clave privada. **No confirmado:** que cualquiera corresponda a la subclave destinataria del ciphertext v04, que esté desbloqueable o que `pg_restore` funcione. Por tanto no crear ni importar claves ni repetir S2. Hipótesis reforzada (no demostrada) de que el script S4B consultó el almacén GPG predeterminado, distinto de los dos hallados.

**Acción mínima propuesta, todavía no ejecutada:** comparar solo metadatos `keyid` de los paquetes públicos destinatarios del v04 (`gpg --list-only --list-packets`, sin descifrar) con ID de las claves secretas/subclaves de cifrado en los dos almacenes (`gpg --with-colons --list-secret-keys --homedir`). Procesar datos únicamente en memoria, no mostrarlos ni guardar archivos. Reportar solo clase y recuento de coincidencia; si existen destinatarios ocultos/IDs cero o parser no reconoce formato, marcar `INCONCLUSIVE`, nunca inventar MATCH. Confirmación definitiva de descifrado/restore sigue separada.

**Estado:** S4 NO PASS; se espera resultado del cotejo. No modificar Supabase, Render, respaldos, claves ni S2; no usar Codex. Continuar documentación de error, causa y corrección verificada tras próximos marcadores.

---

## S4B — GPG NO_SECKEY y custodia S1A (23/11/2026)

**Evidencia nueva del PC:** `BT_SEC07_S4B_DIAG: START`, `BT_SEC07_S4B_GPG: SECRET_KEY_UNAVAILABLE`, `BT_SEC07_S4B_DIAG: COMPLETED`. El diagnóstico de GnuPG devolvió `NO_SECKEY` (clave secreta no disponible para el destinatario en el almacén consultado). **No demuestra** que la clave se haya perdido, que el respaldo v04 esté corrupto o que PostgreSQL haya fallado; no se llegó a restaurar.

**Revisión de evidencia ya documentada:** S1A registró `BT_SEC07_S1_IMPORTACION: PASS`, `BT_SEC07_S1_CANARY_RECUPERACION: PASS` y una custodia local `%LOCALAPPDATA%\\ByteTorque-Custodia-Criptografica-v1`, con almacén GPG aislado. Los procedimientos S4B anteriores invocaron `gpg.exe` sin `--homedir` ni `GNUPGHOME`, pudiendo usar el almacén predeterminado. Esta **discordancia de almacén es hipótesis probable, no causa todavía comprobada**.

**Corrección siguiente, acotada:** inspeccionar **solo metadatos locales de almacenes GPG existentes** bajo la custodia S1A (directorios `private-keys-v1.d` y registro `sec`), sin descifrar v04, crear llaves, importar secretos, copiar respaldos ni tocar producción. No imprimir rutas, identificadores ni huellas. Si se halla un almacén con clave privada, se debe confirmar después que la clave corresponde al destinatario del v04 y ejecutar el S4B usando explícitamente ese `--homedir`; si no aparece, revisar exportación privada protegida S1A con procedimiento autorizado. No repetir S2-R11; S4 permanece PENDIENTE. Registro de hecho, hipótesis, solución propuesta y verificación pendiente conforme a regla permanente.

---

## S4B — incidencia nueva de ejecución local (23/11/2026)

**Evidencia reportada por el propietario en PowerShell 5.1 (NO PASS):**
1. Primer intento: `BT_SEC07_S4B_INICIO: START` seguido de error Docker al acceder a `npipe:////./pipe/dockerDesktopLinuxEngine`: no existe la canalización / daemon Linux no disponible en esa ejecución. No se inició restauración; **no es fallo del backup**.
2. Intento posterior: `BT_SEC07_S4B_INICIO: START`, `BT_SEC07_S4B_STOP: GPG_DECRYPTION_FAILED`. La prueba original oculta el motivo detallado y **no demuestra corrupción de v04, falta de clave, contraseña incorrecta ni dependencia de Supabase**. No se obtuvo el primer error de `pg_restore`.
**Diagnóstico pendiente y solución propuesta no verificada:** no reejecutar el S4B completo; comprobar motor Linux Docker y aislar UNA operación GPG sobre el mismo v04, enviando salida binaria directamente a `Stream.Null`, clasificando solo `--status-fd 2`/exit code sin imprimir stderr, claves, rutas o datos. Si GPG funciona, revisar exclusivamente tubería/preparación de Docker; si no, resolver causa concreta de GPG. No repetir GPG/SHA/PGDMP/TOC estructurales S2-R11 de rutina ni generar otro respaldo. **S4 sigue PENDIENTE**.
**Regla de documentación:** conservar error y resultado exactos, separar hipótesis/solución/validación, y actualizar los mismos archivos con la causa comprobada cuando se obtenga. Solo documentación en `main`, `[skip render]`, sin deploy ni escritura Supabase.

---

## Regla permanente SEC07 — investigación, errores y soluciones verificadas (23/11/2026)

**Orden del propietario:** toda investigación técnica relevante, error real, causa, corrección y resultado debe quedar respaldada en `AGENTS.md`, `agent.md`, `roadmap.md` y, para seguridad, en `docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md`. Anotar **fecha, etapa, evidencia verificable, distinción entre hechos e hipótesis, corrección propuesta/aplicada, verificación real, estado y próxima acción**; sin volcar SQL, stderr sin sanitizar, nombres privados, datos de clientes, rutas locales, secretos o respaldos. Las investigaciones externas se revisan críticamente antes de incorporarlas. No convertir recomendaciones en PASS; dejar un solo checkpoint consolidado para el trabajo terminado, no una secuencia de micro-checkpoints. No repetir pruebas aprobadas ni usar Codex/Work sin necesidad concreta. Actualizar documentación tras cada error/corrección comprobada, sin alterar retrospectivamente el sentido de checkpoints anteriores.

**S4B — investigación independiente incorporada, ejecución PC aún PENDIENTE.** S2-R11 v04 (GPG, SHA-256, PGDMP offset 0 y TOC PG17) permanece **PASS estructural** y NO se repetirá ni se generará otro backup. S4A quedó `ISOLATED_RESTORE_NOT_COMPLETE`; el marcador `SUPABASE_DEPENDENCY_OR_ROLE_MISSING` agrupaba causas y **no identifica** dependencia concreta. Hipótesis: la imagen genérica `postgres:17-alpine` puede carecer de extensiones/roles/configuración Supabase; elegir alternativa compatible `supabase/postgres` PG17 **solo después de clasificar el primer ERROR/FATAL real**. El bloque S4B anterior fue sustituido por un candidato corregido: PGDATA `/var/lib/postgresql/data` y `/tmp` explícitos en `tmpfs`, red Docker `none`, sin bind mounts ni puertos; PowerShell 5.1 transmite bytes binarios por `BaseStream` sin BOM, lee ambos stderr concurrentemente y distingue códigos de GPG y Docker; error primero clasificado sin mostrar contenido. **Este nuevo script NO ha sido ejecutado ni aprobado en el PC**; no afirmar que toda ejecución Docker evite cualquier escritura del host ni que el backup sea restaurable hasta prueba completa. `--no-owner --no-acl` permite diagnóstico, NO certifica owner/ACL/GRANT/RLS. Restauración final: transacción única cuando sea compatible, nunca trabajos paralelos sobre stdin; verificar tablas/conteos agregados, integridad, permisos y aislamiento A/B. Diferenciar alcance PG de recuperación externa Auth, Storage, Edge, Render y secretos. Seguir el checkpoint S4A y detenerse ante error nuevo concreto antes de cambios. **No Supabase productivo, no Render, no despliegues, no claves ni respaldos en chat/GitHub; solo PC personal y `main`.**

Referencia: `docs/checkpoints/CHECKPOINT_BT_SEC07_S4A_RESTORE_DEPENDENCIA_PENDIENTE_20261121.md` y `docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R11_BACKUP_CIFRADO_VALIDADO_20261121.md`.

---

## Publicación Render de BT-COM-01 y CP05 correo — 23/11/2026

**Autorización del propietario recibida y ejecución confirmada.**
Servicio estático Render existente `srv-dbqe4quc6qcc73f275jg` (`bytetorque.cl`), Auto-Deploy OFF.
Deploy manual por API **`dep-dc288ot6e07s73b23qo0`** terminado **LIVE**
el 23/11/2026 18:22:50 UTC, código exacto **`871b4835c94b1cb738046d96f45b28db753d70cf`**.
Despliegue anterior `dep-dc26hok9v7es73ch95u0` (`e0fee642`) quedó `deactivated`.
La CI principal del código [45237203282](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45237203282)
**SUCCESS**, incluidas pruebas TypeScript/Vitest Web/PWA, Android y compilación candidata
BT-COM-01D con variables solo en CI. La CI visual [45237203385](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45237203385)
estaba todavía ejecutándose al documentar; aprobación visual BT-COM-01 previa por propietario.

**Alcance:** se publicó el código BT-COM-01 ZIP y la interfaz candidata de
revisión de correo CP05; **no se cambiaron flags ni servicios de Supabase,
SQL, Storage, Edge ni proveedor de correos**. No se activó LIVE-02 ni el
correo real. Por ello BT-COM-01 no es aún utilizable por taller en Render:
requiere gate privado / S4 integral restaurado y aprobación independiente.
El piloto CP05 lo ejecutará el propietario con datos y destinatario de prueba;
CP06 viene después. Esta nota de cierre documental no cambia el código desplegado.

---

## CP05 correo revisado / BT-COM-01 Render autorizado · 23/11/2026

El propietario **aprobó visualmente BT-COM-01**, CI general y visual de `5a837409` SUCCESS. Autoriza publicar esta integración CP05 en `main` y desplegar manualmente el código BT-COM-01 en el **servicio Render existente**, Auto-Deploy OFF. **No implica activar** variables de correo, migraciones SQL, Storage, funciones alojadas LIVE-02, envío externo, clientes reales ni configuraciones Supabase. Verificar SHA LIVE en Render antes de declarar despliegue completado.

Para el correo CP05 de cotización anterior al trabajo, se reutiliza `server/cp05`, Resend candidato y `quote_delivery_events`. El usuario operador confirma destinatario, revisión exacta y declaración de autorización de contacto; el servidor relee la revisión, archivo PDF, sesión, rol/taller y **dirección actual CP03** antes de pasar al proveedor. Nunca inferir consentimiento externo, recepción, firma o pago de esa declaración. El correo consolidado final de BT-COM-01 es **otra capacidad**, no activada.

Correo sigue OFF. **Antes de activar:** recuperación integral S4 verificada, permiso independiente para proveedor, remitente verificado y secretos solo del servidor, piloto inicial del propietario con correo propio y datos ficticios. Luego cierre de CP05 y CP06; no repetir otras auditorías o crear ramas.
---

## BT-COM-01 — ajuste focalizado de CI para ZIP privado (23/11/2026)

El commit `0f4af648` incluyó `src/entrega/closingZip.ts`.
En CI `45231658760`: TypeScript, Vitest, PWA, Android y builds previos
pasaron; falló únicamente el build privado BT-COM-01D porque el guardia
`official-public-boundary` no reconocía el módulo nuevo en su allowlist.
La corrección permite `closingZip.ts` **solo con** COM-01D preview, LIVE-02,
CP05 documentos y CP06 privado habilitados simultáneamente.
`verify-official-bundle.mjs` impide incluir ese módulo en compilaciones OFF.
No se relajan permisos SQL/servidor ni se altera lógica del ZIP.
La nueva CI debe confirmar el resultado; no anunciar PASS antes de verlo.

---

## BT-COM-01 — desarrollo de paquete documental (23/11/2026)

Partiendo de `main` posterior a LIVE-02 `1efdceb`, se publica con autorización
una acción de ZIP local con cotización CP05 original validada y las dos copias
históricas generadas desde LIVE-02. Se revalidan sesión/taller al comienzo y
antes de descargar; nada se envía ni archiva. Se añade un lector de bytes
al helper de archivo CP06 sin cambiar su validación. Sin cambiar backend,
Render, Auth ni datos. CI del candidato aún no ejecutada.
CP05 QA aprobada != CP05 integral del piloto terminada. Consultar
`docs/checkpoints/CHECKPOINT_BT_COM_01_PAQUETE_LOCAL_20261123.md`.

## BT-FLOW-LIVE-02 — entrega de código autorizada (23/11/2026)

Propietario: aprobación visual de CP05 confirmada y **autorización puntual**
para publicar código+documentación LIVE-02 sólo a `main`, con CI habitual.
Base e0fee642f41516968023c52a14fc2583f2bb0636. No hay autorización para Render/Supabase/flags/
migración/rollout ni ejecución con clientes reales. Recuperación S4 integral pendiente.
Se reutilizó el SQL, interfaz, RPC e historial existentes; se añadió lectura
visible de partidas/notas persistidas en CP05 y validación de respuestas RLS/RPC.
Escrituras remotas de LIVE-02 siguen OFF. Consultar roadmap y checkpoint LIVE-02;
el resultado de CI se reportará tras su ejecución y no debe inferirse aquí.

---

## CP05 — APROBADO EN QA por el propietario (23/11/2026)

El titular confirma emisión ficticia en `https://bytetorque.cl`: **COT-000001**,
**Taller ByteTorque de Pruebas**, vehículo **QA1234**, revisión **1**, total
histórico **$107.411 CLP**, mensaje «Revisión emitida y archivo privado verificado»,
estado **emitida e inmutable**, historial visible y botón «Descargar PDF emitido»
disponible. **APROBADO EN QA** para esa emisión y registro de revisión.
Fuente: evidencia funcional declarada por el propietario, no una ejecución nueva
de este agente. No acredita descarga efectiva del PDF, S4 integral ni permiso
para clientes reales. Correo externo OFF y backend limitado al taller QA se
conservan. No modificar estados manualmente en Supabase para registrar aprobación.

Rediseño compacto implementado y validado localmente sobre `ec5a665`: cabecera y
acciones sticky, pestañas persistentes, estado coherente y detalle histórico.
15/15 pruebas focalizadas, builds público/privado y seis recorridos Chromium PASS
(OFF: 390/1366; QA simulado: 360/390/768/1366). Sin operaciones alojadas nuevas.
Un único commit local `feat(cp05): compact quote workspace and record owner QA approval [skip render]`.
No publicar ni desplegar sin autorización posterior; aprobación visual nueva y
Safari/iPhone físicos pendientes.
Continuidad en el [checkpoint CP05 existente](docs/checkpoints/CHECKPOINT_BT_CP05_ENTREGA_FUNCIONAL_20261122.md).

---

## CP05 — entrega funcional local consolidada (22/11/2026)

Sobre main `f6937a1`, sin tocar CP04/CP06. Se reutilizan editor, RPC de borrador,
IVA, PDF R3 y archivo candidato; se completan conciliación GET tras escritura
confirmada, recuperación de emisión completada sin volver a renderizar y detalle
histórico. 66/66 pruebas CP05, PostgreSQL local, paquete Edge offline y builds
PASS; navegador 390/1366 e historial congelado PASS. Incidentes CP05-FUNC-01/02 y TEST-01…04, archivos exactos y resultados de
navegador en [checkpoint único](docs/checkpoints/CHECKPOINT_BT_CP05_ENTREGA_FUNCIONAL_20261122.md).
Código/SQL solo locales, sin push/deploy. S4 integral pendiente: no activar SQL,
Storage, Edge, emisión ni correo reales. Revisión/publicación requieren permiso.
No reabrir S4I ni repetir multipunto para continuar este bloque.

## Continuidad consolidada - main publicado, despliegue pendiente (22/11/2026)

GitHub main verificado en efc87801caefe1e501805e46d5733f72507f43d0: el multipunto oficial YA ESTA IMPLEMENTADO y PUBLICADO en codigo.47/47 pruebas y A4 unica corresponden a la evidencia del entorno desarrollador y al checkpoint BT-INS-PDF-02; no se repitieron ni modificaron aqui. Despliegue efectivo de esta revision NO verificado; no confundir publicacion con disponibilidad productiva. Las notas inferiores que dicen sin push son historicas.

S4I integrado anteriormente en0bb0ea59d78d:11 archivos,CI general/oficial SUCCESS,sin deploy. Auth/CORS se conservan. S4 integral PARCIAL;respaldo manual operativo cada2dias;automatizacion R6 cancelada. Mantener Render OFF hasta autorizacion especifica; After CI Checks Pass es propuesta futura,no permiso para desplegar.

No reimplementar,investigar o probar el multipunto. Siguiente publicacion propuesta SOLO documental,tras revision y autorizacion de staging/commit/push;sin ramas nuevas,SQL,flags,Storage,Edge,correo o cambios productivos. Nunca copiar carpetas o documentos privados completos desde ZIP sobre main.

---

## BT-INS-PDF-02 — formato oficial CP04 A4 único (22/11/2026)

Implementado y validado **localmente** sobre `0bb0ea5`, única main; sin push/deploy.
34 componentes, estados guardados y tres colores; notas completas en expediente.
47 pruebas pertinentes PASS, TypeScript/builds público/privado PASS; UI PDF
1366/390 byte-idéntico entre preview/descarga, geometría A4/34 X verificadas;
regresión CP04/autosave 11 resultados PASS. PDF02-INC-01…04 resueltos en
[checkpoint](docs/checkpoints/CHECKPOINT_BT_INS_PDF_02_DISENO_OFICIAL_A4_20261122.md).
Técnico/combustible/horas no persistidos muestran «—»; nombres extremos que no
caben bloquean PDF sin truncar. Falta aprobación visual, publicación y deploy
expresos. No tocar S4H, backups, Supabase ni CP05 para continuar este formato.

## SEC07 S4H - continuidad y publicacion controlada (22/11/2026)

S4 integral PARCIAL. Respaldo manual PostgreSQL OPERATIVO; uso por el titular cada 2 dias, sin programacion automatica ni borrado. No reactivar S5C-R6 ni repetir pruebas de respaldo aprobadas.

Preparacion local S4H: guarda de autoridad para clientes pendientes tras logout/cambio de taller y CORS exacto para dominios canonicos. 24 casos nuevos PASS mediante adaptador Node sin red; Deno no disponible y runtime Edge pendiente. Esto no revoca access JWT copiados ni acredita cambios remotos. Mantener identidad confirmada, membresias activas, permisos y RLS.

Leer [procedimiento S4H](docs/recovery/SEC07_S4H_INTEGRACION_SEGURA.md). Historicos inferiores conservados; sus instrucciones de automatizacion/exportacion no reactivan autorizaciones. Solo main, nunca push/deploy/migraciones automaticos. Render On Commit requiere pausa autorizada y verificada antes de publicar; skip render es defensa adicional. No publicar material privado ni copiar el ZIP completo.

---

## BT-SEC07-S4A-SUPABASE-DEPENDENCY-CLASS-NOT-SPECIFIC-20261121

R11 v04 archivada cifrada y manifest SHA PASS; R4A S4A inició restore contenedor PostgreSQL17 sin red en tmpfs, GPG integrity + header PASS, `RESTORE_CLASS SUPABASE_DEPENDENCY_OR_ROLE_MISSING` y STOP. Esta clase es broad grep (role/extension/function/type/relation); fallo real específico aún desconocido. S4 restaura NO PASS. No remediar a ciegas, no repetir export, no modificar producción. S4B clasificar primera línea ERROR del stderr pg_restore dentro del contenedor y solo emitir códigos, jamás SQL/descripciones/nombres ni datos. S2 sigue cerrado estructural. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S4A_RESTORE_DEPENDENCIA_PENDIENTE_20261121.md).

## BT-SEC07-S2-R11-CLOSED-STRUCTURAL-20261121

S2 **PASS_BACKUP_AND_TOC** evidenciado Windows: v04 cifrada PGDMP offset0, GPG integridad PASS, PostgreSQL17 Linux TOC PASS, SHA256 PASS y manifest creado, v03 intacto, sin nueva conexión a prod. S2 cerrado para respaldo estructural en PC; S4 RESTORE real PENDIENTE. Siguiente usar solo v04 final + hash manifest, restaurar en contenedor PG17 aislado sin red/volúmenes persistentes e informar dependencias faltantes sin exponer datos. BOM UTF8 + compatibilidad .NET PS5.1 corregidos, mantener UTF8 sin BOM antes de arrancar proceso. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R11_BACKUP_CIFRADO_VALIDADO_20261121.md).

## BT-SEC07-LOG-OUTPUT-NOT-COMMANDS-20261121

Incidente de uso Windows: usuario ejecutó textos `BT_SEC07_S2_R10_...: PASS` como comandos, provocando `CommandNotFoundException`. No implica fallo técnico S2; R10 PASS y R11 pendiente. Siempre distinguir 'CÓDIGO para ejecutar' y 'RESULTADO esperado, NO pegar'. Instrucción mínima Ctrl+C si línea activa y copiar exclusivamente el bloque completo PowerShell de R11 `& { ... }`. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

## BT-SEC07-S2-R10-WINDOWS-NO-BOM-FIX-TOC-PASS-20261121

Resultado real `PASS_TOC_NO_NEW_FILE`: v03 existente GPG íntegro, payload 3-byte UTF8 BOM + PGDMP, omitido BOM, Linux Docker pg_restore --list PASS; SHA fuente intacto, sin producción. Propiedad StandardInputEncoding .NET Framework unavailable confirmada, uso `Console.InputEncoding=UTF8Encoding(false)` antes de iniciar proceso y restaurar funcionó. No hay v04 partial de R9. R11 debe generar v04 CIFRADO NUEVO sin BOM mediante stream binario no-BOM, validar PGDMP offset 0 y TOC Docker y registrar SHA/manifiesto antes de cerrar S2. Nunca repetir pg_dump ni pedir USB. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R10_LINUX_TOC_PASS_20261121.md); main docs [skip render].

## BT-SEC07-S2R9-STANDARDINPUTENCODING-DOTNET-FRAMEWORK-INCOMPATIBLE-20261121

R9 abortó `CREATE_CLEAN_CIPHER / LOCAL_ERROR_UNCLASSIFIED` tras validar Docker local y key. R9 contenía `ProcessStartInfo.StandardInputEncoding`, propiedad NO disponible en .NET Framework (Windows PowerShell 5.1); causa MUY PROBABLE, aún pendiente confirmación en PC. Evitar R9/repetir. No introducir nuevas dependencias ni reutilizar copias históricas; preservar v02/v03 y posible v04. Próxima vía compatible: `Console.InputEncoding= new UTF8Encoding(false)` durante Process.Start para controlar preámbulo StdIn, restaurar enseguida; probar lectura TOC con bytes PGDMP offset0 en Docker antes de crear derivado, sin producción. Ver [registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

## BT-SEC07-R8-BOM-CONFIRMADO-STANDARDINPUT-ENCODING-20261121

R8 identificó UTF8_BOM EF BB BF antes de PGDMP en v02 y v03 a offset 3, ambas GPG PASS. R6 retiró 3 bytes pero R8 derivado los contiene otra vez. Causa inmediata: prefijo BOM; origen técnico probable: `.NET StreamWriter Process.StandardInput` y input encoding por defecto en PS5.1. Reparación planeada no verificada: `ProcessStartInfo.StandardInputEncoding = new UTF8Encoding(false)` para GPG stdin y Docker stdin; eliminar sólo el BOM conocido, generar v04 nuevo y exigir PGDMP offset0, GPG+Docker Linux pg_restore TOC+SHA. Conservar v02/v03 intactos, no DB/pg_dump. R8 entrada completa anotada en [registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

## BT-SEC07-R7-NEW-CLEAN-HEADER-INVALID-20261121

R7 Docker ni siquiera recibió archivo: abortó en MAGIC_CHECK antes de pipe con `CLEAN_ARCHIVE_MAGIC_INVALID` de derived `_clean_v03`, archivos preservados, producción no conectada. S2 aún no certificada. R5/R6 muestran prefijo de 3 bytes en original; nuevo derivado podría repetirlo durante descifrado, pero causa NO corroborada. Comparar ambas firmas/offsets y clasificación segura local con GPG decryption complete, sin nuevo ciphertext, sin datos visibles. Actualizar registro al comprobar el origen. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

## BT-SEC07-S2R6-THREE-BYTE-PREFIX-TOC-STILL-FAILS (21/11/2026)

R6: prefix 3, PGDMP found, source decrypt GPG PASS, derived encrypt PASS, derived GPG readback PASS; `pg_restore --list` NONZERO, error class OTHER. El error de cabecera R4 se explica por prefijo de 3 bytes, pero retirar prefijo NO arregló todo. Preservar original `_v02...partial` y nuevo derivado `_clean_v03...partial` sin re-ejecutar R6, no usar producción. Próxima acción: clasificar error real `pg_restore` desde derivado v03 en un único chequeo local, sin salida con datos. Ver [registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

## BT-SEC07-S2R5-RECOVERABLE-MAGIC-WITH-PREFIX-20261121

R5 Windows confirma GPG exit0/integrity, contenido descifrado con firma PGDMP **desplazada dentro primeros 96 bytes**. pg_restore antes devolvía NONZERO; prefijo explica rechazo header, origen exacto del prefijo pendiente. No descartar `.partial`, no nuevo pg_dump ni DB. Corregir sólo archivo derivado cifrado LOCAL eliminando preámbulo antes de PGDMP; verificar TOC/cipher/custodia/manifest antes de certificar; si falla, preservar. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

## BT-SEC07-S2-R4-NOT-PGDMP-20261121

R4 read-only: `PARTIAL FOUND_UNIQUE`, `ARCHIVE_MAGIC NOT_PGDMP`; STOP, producción no conectada y archivos preservados. Evitar reintentar `pg_restore` sobre misma copia: necesita cabecera PGDMP. R3 GPG exit0, TOC exit nonzero. Causa pendiente, NO afirmar contenido/dump recuperable. Una clasificación local segura de stdout descifrado (longitud, tipo de cabecera, status GPG) sin exponer bytes para aislar origen. No nuevos backups ni reexport hasta corregir. Ver [incidentes](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

## BT-SEC07-S2R3-RESTORE-NONZERO-20261121

Desde archivo cifrado S2-R2 existente: GPG exit0, pg_restore --list exit nonzero. No promueve archivo, no manifiesto nuevo, no toca prod. No asumir corrupción o pipe; consulta oficial PostgreSQL17 confirma stdin válido para pg_restore sin --jobs. Próxima lectura puntual cabecera `PGDMP` y clasificación sanitizada de stderr/estado pg_restore para causa comprobada. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). No repetir dump.

## BT-SEC07-S2R2-TOC-PIPE-STOP-20261121

Windows S2-R2 confirmó pg17/verify-full/transaction READ ONLY + `ENCRYPTED_DUMP PASS` pero `ARCHIVE_TOC_READBACK_FAILED`. HAY archivo `.partial` candidato, sin manifiesto ni certificación. No repetir S2/db/dump ni usar archivos antiguos. Reanudar localmente desde `.partial`; separar pg_restore --list exit/TOC y GPG decrypt exit/status, drenar stdout completo incluso tras cierre temprano de pipe (posible causa no confirmada). Resolver y registrar en AGENTS, agent, roadmap, incidentes sólo con Windows PASS. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

## BT-SEC07-INCIDENT-LOG-PERMANENT-20261121

Nueva regla explícita usuario: tras encontrar soluciones, documentar siempre en roadmap/agent/AGENTS y registro operativo con error, causa CONFIRMADA vs hipótesis, arreglo, prueba/verificación, prevención. S2 preflight `IDENTIDAD_O_SOLO_LECTURA_INCORRECTA` sigue abierto: psql conectó/terminó exit0 pero CASE mezcló 3 condiciones, `PGOPTIONS` read-only quizá no aplicado por pooler; solución propuesta transacción explícita READ ONLY y verificación por columnas. `pg_dump` S2 NO iniciado, no hay copia real. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). No exigir USB, sin cambios prod.

## BT-SEC07-USER-DECISION-PC-ONLY-BACKUP-20261121

Titular eliminó copias en dos USB: **NO EXIGIR USB ni detener S2**. Custodia sólo PC, S1A GPG y canary PASS_LOCAL_ONLY. Riesgo residual pérdida/compromiso de PC no cubierto, no afirmar resiliencia 3-2-1. S2 primer dump PG17 prod nuevo con TLS verify-full, read-only, stdin/stdout binarios a GPG y manifiesto local; S3 cobertura Auth/Storage/roles, S4 restore real aislado, S5 retención/automatización PC solamente. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S1B_PC_SOLO_DECISION_S2_REAL_20261121.md); main docs [skip render].

## BT-SEC07-S1A-LOCAL-RECOVERY-PASS-20261121

Clave nueva: cert Ed25519, cifrado Curve25519; export privado GPG protegida S2K, canary ficticio desde GNUPGHOME vacío PASS_LOCAL_ONLY comunicado por dueño. NO hay custodia externa ni recovery sin caché y S1 no cerrado globalmente. Incident $home alias $HOME protegida en PowerShell resuelto usando $gpgHome. Ver [S1A checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S1A_RECUPERACION_CRIPTOGRAFICA_LOCAL_PASS_20261121.md). Prioridad: copia real a dos USB físicos distintos, SHA/readback, recovery desde medios; contraseña aparte. Ningún secret/DB/backup/identificador privado en repo público. Main docs [skip render].

## BT-SEC07-S0-WINDOWS-PASS-S1-PENDIENTE (21/11/2026)

S0 en PC Windows informó PASS de preflight, 8/8 carpetas, ACL/owner, NotContentIndexed, 3 documentos; sin secretos, sin producción, sin modificar legados. Refiere a [checkpoint S0](docs/checkpoints/CHECKPOINT_BT_SEC07_S0_ESTRUCTURA_ACL_WINDOWS_PASS_20261121.md). S1: clave GPG nueva/custodia FUERA de árbol de respaldos, canary cifrado+importación en GNUPGHOME vacío+descifrado, y dos medios físicos externos independientes por verificar. No confundir canary local con recuperación ante pérdida de PC. No usar secretos ni fuentes de producción en S1. Repo en metadatos figura public; no subir contenido sensible. Main y docs [skip render].

## BT-SEC07-SECURITY-REAL-FRESH-START-CP79

Usuario pidió explícitamente **REINICIO ORGANIZADO de infraestructura seguridad/backup, no código app**, con llaves nuevas, carpetas nuevas, backups nuevos, custodia externa, restores y documentación completa; **sin reutilizar legados** y **sin borrar** legados. Inicio por S0 PowerShell completo inline, luego S1 GPG nuevo y recovery canary, S2 pg_dump real, S3 cobertura roles/ACL/RLS + Supabase/Render servicios, S4 restore aislado, S5 segunda copia 3-2-1/automatización, S6 seguridad app/Auth/RPC/TLS. Contrato [base SEC07](docs/BT_SEC07_NUEVA_BASE_SEGURIDAD_REAL_20261121.md), [CP79](docs/checkpoints/CHECKPOINT_BT_SEC07_REINICIO_SEGURIDAD_REAL_ORGANIZADO_20261121.md). Leer AGENTS/agent/roadmap + HEAD antes de tocar repo, main única rama, docs [skip render]. **Nunca secretos en GitHub/chat** y PowerShell SIEMPRE íntegro en el chat. Auditoría read-only hoy: Supabase PG17.11 ACTIVE_HEALTHY, 6 SECURITY DEFINER RPC, 8 private no-policy RLS, Auth leaked password prevention OFF; no concluye vulnerabilidad sin QA. No producción modificada, security not certified.

## BT-SEC07-R3-PRIVATE-FILE-ARMORED-MESSAGE-NOT-KEY-78

Windows metadata header: `EXTENSION OTHER_OR_HIDDEN_EXTENSION`, `HEADER ASCII_ENCRYPTED_MESSAGE` para supuesto privado. 160B permiten observar armor PGP MESSAGE, no clave OpenPGP exportada; **no se descifró** ni importó. No asumir contenido interno ni clave perdida; archivo no termina efectivamente en .pgp/.asc/.gpg. Pública .asc PRIMARY_MATCH manifest, privada no validada, GPG real falla por ahora. Próxima: ubicar archivo verdadero de clave privada o proceso de encapsulado con permiso aparte; evitar renombrar/descifrar. [CP78](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_PRIVATE_FILE_IS_ARMORED_MESSAGE_NOT_KEY_20261121.md).

## BT-SEC07-R3-PUBLIC-ASC-PRIMARY-MATCH-PRIVATE-PGP-HEADER-PENDING-77

CP76 PUBCHECK Windows del propietario PASS: `.asc` pública reconocida y PRIMARY_MATCH con manifest; `.pgp` privado NO accedido. El supuesto privado necesitó «Todos los archivos» aunque CP75 filtro incluía *.pgp; verificar extensión real sin exponer nombre. Bloque PowerShell INLINE entregado para leer 160 bytes de encabezado del archivo identificado como privado y clasificar ARMOR/BINARY_PGP_CANDIDATE/OTHER, sin GPG ni import/decrypt. Pendiente salida; no certificar recuperación. [CP77](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_PUBLIC_ASC_PRIMARY_MATCH_PRIVATE_PGP_HEADER_PENDING_20261121.md).

## BT-SEC07-R3-KEY-FILE-FORMAT-STOP-PUBLIC-ASC-FOUND-76

Propietario CP75 `STOP_KEY_FORMAT_OR_READ` con archivo privado `.pgp`; encontró clave pública `.asc`. Causa del STOP desconocida, puede no ser paquete secret-key OpenPGP directamente; no renombrar ni importar. Próximo paso: examinar solo public `.asc` con GPG show-keys y comparar huella con manifest, PowerShell INLINE y salida `BT_SEC07_PUBCHECK_*` sin UID, huellas ni rutas. No decrypt ni GPG/TOC real. [CP76](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_KEY_FILE_FORMAT_STOP_PUBLIC_ASC_FOUND_20261121.md).

## BT-SEC07-R3-PRIVATE-KEY-FILE-FINGERPRINT-READONLY-AUTHORIZED-75

Permitido SOLO leer metadatos de archivo de clave privada original + manifest para cotejar fingerprints, sin `--import`/`--decrypt`. PowerShell íntegro en chat: OpenFileDialog doble, GNUPGHOME aislado en TEMP con GPG `--show-keys --with-colons`, salida sanitizada MATCH primary/subkey y secreto record list, cleanup TEMP. Test GPG sintético Linux ok, **Windows real pendiente**. Match no certifica clave desbloqueada ni paquete real; permisos separados para importación/descifrado posteriores. CP74 keyring normal NONE_LISTED. [CP75](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_PRIVATE_KEY_FILE_FINGERPRINT_READONLY_AUTHORIZED_20261121.md).

## BT-SEC07-R3-GPG-METADATA-NO-SECRET-KEYS-LISTED-74

Windows CP73 terminó: manifest recipient DECLARED, GPG FOUND, `SECRET_KEYS NONE_LISTED` y `RECIPIENT_MATCH NO_EXACT_MATCH_IN_LIST`, `DECRYPTION NOT_ATTEMPTED`, `PASSPHRASE NOT_REQUESTED`. Conclusión estricta: no hay claves privadas **listadas en keyring local consultado**, no que estén perdidas en absoluto. Posible causa de CP72 GPG STOP. Localizar clave privada original de forma segura, no compartir/importar ni repetir decrypt sin permiso; no crear clave nueva para descifrar copia antigua. CP67 solo consistencia cifrada parcial. PowerShell siempre inline CP66. [CP74](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_METADATA_NO_SECRET_KEYS_LISTED_20261121.md).

## BT-SEC07-R3-GPG-METADATA-DIAG-AUTHORIZED-73

Permiso nuevo: inspección SOLO manifest y lista metadatos claves privadas GPG locales, sin ciphertext/decrypt. PowerShell completo entregado directo en chat (CP66), sin ZIP; imprime solo marcadores. Compara `recipient_fingerprint` opcional de manifest con `fpr` de `sec/ssb` de `gpg --list-secret-keys --with-colons`; sin imprimir UID, fingerprint ni ruta. MATCH ≠ descifrado posible, NO_MATCH ≠ clave definitivamente ausente; no diagnostica BAD_PASSPHRASE/Pinentry. Aún sin salida Windows, CP71 real decrypt STOP. [CP73](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_METADATA_DIAG_AUTHORIZED_20261121.md).

## BT-SEC07-R3-REAL-TOC-STOP-GPG-DECRYPTION-FAILED-72

Win real CP71: manifest PARCIAL + SHA ciphertext MATCH + GPG/PG17 PRESENT; `STOP_GPG_DECRYPTION_FAILED`, no TOC ni restore certificado. Docker luego abierto es irrelevante salvo diseño con contenedor (el inspector usa ejecutables nativos). Fuente ZIP exacta: `gpg --batch --no-tty --status-fd 2 --output - --decrypt` y cualquier exit!=0 devuelve STOP sin causa, stderr se oculta. Puede faltar clave privada, fallar agent/Pinentry, etc; no inferir corrupción ni identificar causa. Antigua herramienta encrypt public-key con fingerprint, 19/11 puede ser exportador distinto. Nueva autorización para diagnóstico de metadatos de destinatario vs secret keys y estado GPG seguro, sin nuevo decrypt. PowerShell siempre íntegro en chat. [CP72](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_REAL_TOC_STOP_GPG_DECRYPTION_FAILED_20261121.md).

## BT-SEC07-R3-GPG-TOC-REAL-LOCAL-RUN-AUTHORIZED-71

Usuario autorizó inspección local UNA VEZ del backup 19/11: GPG real con keyring/agent + PG17 `pg_restore --list` por pipes, no conexión ni restore; PowerShell completo entregado directamente en chat. ZIP SHA `dd6e5b7851039eefbc5d01c3245899fa9f13e689f402b645829984bebbc24a58`, 37/37 sintéticos Windows CP70 y extracción revalidada. Todavía NO tenemos salida GPG/TOC real Windows; si STOP no reintentar sin diagnóstico. Un PASS sería TOC solamente, no roles/ACL/restore, manifest sigue parcial. [CP71](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_TOC_REAL_LOCAL_RUN_AUTHORIZED_20261121.md).

## BT-SEC07-R3-GPG-TOC-PREP-V1-WINDOWS-SYNTHETIC-PASS-70

Windows propietario verificó ZIP y aprobó **37/37 tests sintéticos**, GPG real NO llamado, pg_restore real NO llamado, keyring y backup real NO accedidos. `REAL_TOC_WINDOWS: NOT_CERTIFIED` esperado para pruebas ficticias. No repetir. CP67 SHA internos de copia parcial sí PASS. Puerta siguiente requiere autorización expresa para descifrado LOCAL read-only de `database.dump.gpg` con keyring histórico y pg_restore --list sin DB/restore; después permiso distinto para restore aislado. Regla PowerShell íntegro en chat. [CP70](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_TOC_PREP_V1_WINDOWS_SYNTHETIC_PASS_20261121.md).

## BT-SEC07-R3-REAL-GPG-TOC-READER-PREP-V1-69

Preparado inspector GPG→TOC en ZIP **PRIVADO**, 11554 bytes SHA256 `dd6e5b7851039eefbc5d01c3245899fa9f13e689f402b645829984bebbc24a58`; 37/37 tests ficticios PASS antes/después ZIP. Bloque PowerShell INLINE recibido por propietario solo para validar paquete y fixtures; no se ejecuta inspector real todavía. Futuro GPG→pg_restore --list mediante pipes binarios, con estado de cifrado e indicadores de MDC, sin archivo plaintext escrito deliberadamente y sin salida de metadatos privados. Exige permiso nuevo para leer keyring y ciphertext, GPG agent puede mantener caché. Restores/ACL/roles/SSL pendientes. [CP69](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_REAL_GPG_TOC_READER_PREP_V1_20261121.md).

## BT-SEC07-R3-GPG-TOC-SYNTHETIC-HANDOFF-68

Autorizada y entregada preparación exclusivamente sintética (no backups reales): ZIP `BT_SEC07_R3_GPG_TOC_SYNTHETIC_GATE_20261121.zip` SHA256 `1c6dfc5111202d2c2f6d97c913a433acbf60ef1a4766dcd3a8d3fc3a59015adb`, 6475B, **59/59 tests nuevos PASS antes y después extracción**. Simula clasificador de señales GPG y TOC inventado, no usa GPG ni pg_restore y no acepta rutas de usuario. CP55 TOC 40 sintéticos ya hecho, evitar duplicación. Próximos hitos con permisos distintos: GPG/TOC real aislado; recuperación DB aislada con roles/owners/ACL/RLS y componentes excluidos; nueva generación y automatización de backups. CP67 cifra/manifest parcial PASS pero no recuperabilidad. PowerShell íntegro en chat CP66. [CP68](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_TOC_SYNTHETIC_HANDOFF_20261121.md).

## BT-SEC07-R3-MANIFEST-V4-WINDOWS-CIPHERTEXT-PASS-67

V4 ejecutada en Windows por propietario sobre respaldo local 19/11: 69/69 tests PASS, selector YES, `PARTIAL_BACKUP_DECLARED`, proyecto/backup_id MATCH, tamaños MATCH, SHA MATCH_MANIFEST_ONLY, `PASS_LOCAL_CIPHERTEXT_CONSISTENCY_ONLY` y `PASS_CIPHERTEXT_ONLY_NOT_RESTORE`. Cierra verificación de consistencia local, **no** certifica autenticidad externa, GPG, SQL dump recuperable, roles/owners/ACL ni restore. Próximas puertas independientes: referencia externa de hash, GPG aislado/TOC read-only y restauración aislada con permiso nuevo; SSL enforcement pendiente sin tocar. PowerShell siempre completo en chat. [CP67](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_V4_WINDOWS_CIPHERTEXT_PASS_20261121.md).

## BT-SEC07-POWERSHELL-INLINE-RULE-V4-AUTHORIZED-66

Regla del titular: siempre entregar el ejecutor PowerShell íntegro EN EL CHAT; archivo .ps1 opcional. Autorizada ejecución local V4 de solo lectura, bloque ya entregado con comprobación ZIP V4 SHA 9fea99fb10eab18e6ba2ee78b51ad78e54b82f407f8fe7d45d284bc237fbdd0f y preflight 69 pruebas. Pendiente salida real Windows; no GPG/SQL/restore/SSL. [CP66](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_POWERSHELL_INLINE_RULE_V4_AUTHORIZED_20261121.md).

## BT-SEC07-R3-MANIFEST-PARTIAL-V4-OFFLINE-READY-65

Con autorización para PREPARAR (no ejecutar backup real), reconstruido V4 sobre V3: `full_project_backup=false` explícito ahora reporta `PARTIAL_BACKUP_DECLARED` pero permite verificar tamaño/SHA cifrado; flags inválidos/missing STOP. ZIP V4 SHA `9fea99fb10eab18e6ba2ee78b51ad78e54b82f407f8fe7d45d284bc237fbdd0f`, 8720B; ejecutor PowerShell SHA `a69899bb3adb9c514d8eef0b9325ca3ed80bc53a0dd49db83933fe1c8148985e`, 2361B. 69/69 sintéticos PASS antes y después ZIP. Windows V4, manifiesto real SHA aún pendientes. Fallos preparatorios de mocks sys.argv y falso positivo gpg textual corregidos. No GPG/SQL/restore/SSL. [CP65](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_PARTIAL_V4_OFFLINE_READY_20261121.md).

## BT-SEC07-R3-WINDOWS-V3-INCOMPLETE-DECLARATION-STOP-64

Windows propietario: `PACKAGE_V3 VERIFIED`, `PASS_53_OF_53_SYNTHETIC`, `MANIFEST_AUDIT STOP_INCOMPLETE_BACKUP_DECLARED`, `MANIFEST_WINDOWS_V3 STOP`. Fuente V3 ZIP SHA verificado: `full_project_backup` debe ser exactamente true o se detiene **antes de comparar hashes/tamaños de .gpg**. Dos `BACKUP_SELECTED:NO` son marcadores al inicio, no evidencia de selección fallida. No editar manifiesto ni afirmar cifrado inválido. Proponer versión verificador de **consistencia parcial** que informe bandera incompleta sin convertirla en PASS global, bajo nuevo permiso. Sin GPG/SQL/restore/SSL. [CP64](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_WINDOWS_V3_INCOMPLETE_DECLARATION_STOP_20261121.md).

## BT-SEC07-R3-WINDOWS-V3-LAUNCHER-DELIVERED-63

Entregados al dueño ZIP V3 7334B SHA `07316406274f1b2662e5a5978fb039b6751ab35cd58acb6227b466667308b484` y lanzador `BT_SEC07_EJECUTAR_V3.ps1` 2195B SHA `f10991a2600cb0ba6f1214ab3525a0c22e5b61af646700f3c8c7598179e6771c`. Hallazgo más reciente 19/11 con manifest y database+roles catalog ciphertexts; todavía **sin resultado Windows V3**. Ejecutar solo PowerShell con ZIP hash validado y 53 tests, luego seleccionar manifest, recibir `BT_SEC07_*`. Sin GPG/SQL/SSL/restore ni certificar roles SQL. [CP63](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_WINDOWS_V3_LAUNCHER_DELIVERED_20261121.md).

## BT-SEC07-R3-GPG-SIZES-PARTIAL-62

Capturas Windows: carpeta con 2 archivos total 89.242 bytes, de los cuales un `.gpg` tiene tamaño lógico 151 bytes y 0 bytes en disco (nombre recortado/no identificado). No certificar que el pequeño sea `roles.sql.gpg`; si ambos pertenecen a carpeta, otro ~89.091 bytes. Falta `manifest.json`. Pedir solo identificación del archivo de 151B y tamaño separado de ambos; no descifrar, generar manifest, repetir V3/SQL/restore. [CP62](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_SIZES_PARTIAL_20261121.md).

## BT-SEC07-R3-GPG-EXTENSIONS-CONFIRMED-SIZES-PENDING-61

Propietario mostró extensiones en Explorer: `database.dump.gpg` y `roles.sql.gpg` fechados 17/11/2026 11:42, sin `manifest.json` visible. No se conoce tamaño ni integridad/cifrado verdadero de contenido. Próximo: Propiedades > Tamaño de cada archivo, lectura visual de metadatos; no ejecutar V3 de nuevo ni generar manifest ni GPG/SQL/restore. [CP61](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_EXTENSION_CONFIRMED_SIZES_PENDING_20261121.md).

## BT-SEC07-R3-MANIFEST-NOT-VISIBLE-WINDOWS-60

Capturas Windows del titular: selector V3 muestra cero archivos JSON; filtro sin opción `Todos los archivos`; Explorador en carpeta `bytetorque-local-20261117T1441...` solo muestra `database.dump` y `roles.sql` (17/11 11:42), sin `manifest.json` visible. **No se confirmaron extensiones completas, tamaño, hashes, naturaleza del contenido ni integridad**. Cancelar selector, verificar visualmente extensiones/tamaños con Ver→Mostrar→Extensiones de nombre de archivo y Detalles. No manifest manual, no GPG/SQL/restore ni reintento sin diagnóstico. [CP60](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_NOT_VISIBLE_WINDOWS_20261121.md).

## BT-SEC07-R3-MANIFEST-WINDOWS-V3-PACKAGE-59

Entregado paquete ZIP privado nuevo **V3** al propietario al no recuperarse bytes V2 original: `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V3_20261121.zip` SHA256 `07316406274f1b2662e5a5978fb039b6751ab35cd58acb6227b466667308b484`, 7334B. 53/53 tests sintéticos Linux PASS antes/después ZIP, compatibilidad Windows simulada NO certificada. El verificador coteja localmente manifest/ciphertext sin descifrar ni SQL/SSL/PG/red. Próximo: propietario valida hash V3 en Downloads, ejecuta runner sintético y solo con PASS selecciona manifest. STOP sin reintento. [CP59](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_WINDOWS_V3_PACKAGE_20261121.md).

## BT-SEC07-R3-CHAT-CONTINUITY-V2-WINDOWS-PENDING-58

Verificados `AGENTS.md`, `agent.md`, `roadmap.md`, CP57 y HEAD `1be3b7f` en GitHub. **Sin nuevo Windows real/backup inspeccionado**; ZIP V2 original sólo documentado, SHA `950651ceed451e4156847e3af8b02cdb888f3856a479467e3905cb6ddcab92fe`, 53/53 pruebas sintéticas offline anteriores. Próximo: propietario verifica hash en Descargas y usa bloque PowerShell CP57; con tests PASS se permite selector de `manifest.json`, read-only; ante STOP no reintentar. Github informó repositorio público, no modificado. Sin SQL/GPG/restore/SSL/deploy. [CP58](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CHAT_CONTINUITY_V2_WINDOWS_PENDING_20261120.md).

## BT-SEC07-R3-MANIFEST-WINDOWS-V2-REGRESSION-FIX-57

Usuario reportó V1 `BT_SEC07_PACKAGE: VERIFIED`, tests `48` fallidos `15 fails/5 errors/2 skipped`, `MANIFEST_TESTS: STOP` y **NO SELECTOR**. Preflight se detuvo ANTES de abrir backup real. INC-57: comparación cruzada demasiado estricta `Path.lstat()` contra `os.fstat()` en Windows. V2 ZIP privado `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V2_20261120.zip` SHA256 `950651ceed451e4156847e3af8b02cdb888f3856a479467e3905cb6ddcab92fe`, 10777 B, 53/53 nuevos tests completos PASS antes y después de extracción, incluye fstat Windows simulado y runner sanitizado. **Windows real de V2 pendiente**, no atribuir PASS al backup. V1 obsoleto. Sin GPG, PostgreSQL, escritura o acceso real. [CP57](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_WINDOWS_V2_REGRESSION_FIX_20261120.md). R3 ACL/owners pendientes, TLS enforcement OFF.
## BT-SEC07-R3-MANIFEST-READONLY-PREP-56 · herramienta no mutante preparada (20/11/2026)

Autorizado preparar verificación local solo lectura para backup existente (no abrir/descifrar fuente en asistente). Validado esquema real de `bytetorque_respaldo_local.py`: manifest `files` lista nombre/tamaño/SHA, backup_id, project_ref. ZIP `BT_SEC07_R3_MANIFEST_READONLY_20261120.zip` SHA `d052e3fdc05e8896bbf1f6b8c6bf48c27b2fffb5b7d51432f8077927278ac4a8` 8751 B, 48/48 tests sintéticos PASS antes y después de extraer; CLI Python sin red/GPG/SQL/subprocess, solo elige manualmente `manifest.json`, calcula huellas de ciphertexts reconocidos y compara sin imprimir rutas/hash/secretos ni escribir backups. PASS significa SOLO consistencia con ese manifiesto, no autenticidad independiente ni posibilidad restore. README detalla formato/STOP, roles.catalog es metadatos y old roles.sql.gpg SQL0 inválido. No pruebas con Windows/backup original todavía. Próxima acción usuario ejecuta bloque SHA + ZIP read-only y comparte solo BT_SEC07_*; si STOP no repetir. [CP56](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_READONLY_PREP_20261120.md). Preservar main privado, R3 owners/ACL y TLS backend pendientes.

## BT-SEC07-R3-TOC-OFFLINE-AUDITOR-READY-55 · 40/40 PASS sin respaldo real (20/11/2026)

Consentimiento solo preparación offline sintética, NUNCA descifrado GPG/lectura snapshot ni acceso remoto. ZIP `BT_SEC07_R3_TOC_OFFLINE_AUDIT_20261120.zip` SHA256 `fa0c7606fb80523d9de455719693947284c123de482e71d05ac89465ad859566`, 7074 bytes, biblioteca Python pura para shape de listados TOC, sin lectura de archivos, ni subprocess, red, GPG o PG; autoprueba no acepta rutas. 40/40 tests nuevos PASS antes y después de ZIP; smoke `BT_SEC07_TOC_GATE: PASS_OFFLINE_ONLY`. Hallazgos incidentes sintéticos 55A (version header `1.16-0`) y 55B (fixture comment inactivo) corregidos, suites repetidas y PASS. ACL y DEFAULT ACL son señales NO prueba de GRANT; owner no certificado sin restore completo. Siguiente paso: permiso explícito independiente para verificar hash/manifiesto de snapshot real y usar keyring histórico; luego PG restore --list y posteriormente prueba restauración aislada con otro permiso. [CP55](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_TOC_OFFLINE_AUDITOR_READY_20261120.md). CP54 0 roles propios, R2 estructura solo, SSL enforcement OFF/no end-to-end.

## BT-SEC07-R3-ROLE-CATALOG-CORRECTED-PASS-54 · inventario definitivo para criterio actual (20/11/2026)

UNA SELECT SQL correctiva autorizada y ejecutada: 31 roles visibles, **31 reservados, 0 candidatos adicionales, 0 falsos positivos** del filtro `LIKE 'pg_%'`. Usó `starts_with(rolname::text,'pg_')`, lista oficial de CLI 3.0.0, sin devolver nombres/secretos/clientes. INC-53 CERRADO y CP53 anterior PROVISIONAL reemplazado por CP54. Sin `pg_dumpall`, GPG, backups, SQL mutante ni SSL. El cero es solo del catálogo bajo ese criterio y fecha; **no acredita owners, grants, ACL, membresías ni restauración integral**. Antiguo roles.sql.gpg SQL0 + pg_dumpall exit1 sigue inválido. Próxima puerta: inspeccionar offline inventario/TOC del snapshot ya existente (no descifrar ni conectar sin permiso), y diseñar validación/captura de ACL. [CP54](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_ROLE_CATALOG_CORRECTED_WINDOWSLESS_PASS_20261120.md).

## BT-SEC07-R3-ROLE-CATALOG-AGGREGATE-PROVISIONAL-53
UNA SELECT SQL autorizada, pg_roles 31 total / 31 filtrados / 0 candidatos; filtro LIKE 'pg_%' demasiado amplio por wildcard _, INC-53 abierto, resultado CERO PROVISIONAL. Necesaria nueva aprobación para SELECT corregida starts_with rolname pg_ y contador de falsos positivos, sin nombres. Sin dump, GPG, restore ni cambios; roles.sql.gpg viejo SQL0 sigue inválido, owners y ACL por certificar. [CP53](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_ROLE_CATALOG_AGGREGATE_PROVISIONAL_20261120.md).
## BT-SEC07-R3-CLI-V3-OFFLINE-ADAPTER-READY-52 · preparación autorizada sin producción (20/11/2026)

AUTORIZACIÓN: preparar export cifrado de roles reales sin ejecutarlo contra Supabase. Se revisó contrato CLI v3 y checkpts, `main` HEAD, docs PG17: `pg_dumpall --roles-only --no-role-passwords`, CLI filtra roles reservados y puede emitir solo `RESET ALL;`; no fiarse de bytes/exit solos ni usar linked/ref por rol temporal. ZIP privado `BT_SEC07_R3_CLI_V3_OFFLINE_ADAPTER_20261120.zip` SHA256 `a30de4ba1f619de2654da206e9804cb753fac386c7ad2ac3ef85b8e49cc51596`, **5513B**, adaptador **solo fixtures offline** sin SQL real/subprocess/network/keyring, 27/27 tests nuevos PASS antes y después de extraer. Clasifica errores, inventario esperado 0/positivo/desconocido, SQL parcial, duplicados, UTF8, GRANT/RESET y contenido ajeno; nunca certifica restore. R3 remoto aún NO IMPLEMENTADO ni autorizado; roles.sql.gpg histórico SQL0 y causa pg_dumpall exit1 desconocida, owners/ACL/privilegios separados. CP46 cliente TLS PASS, backend SSL NO; CP48 enforce SSL OFF UI; export remoto exige consentimiento propio. Próxima propuesta: **SELECT agregado solo lectura del número de roles personalizados y cobertura ACL**, SIN nombres/SQL y solo tras nuevo permiso. [CP52](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CLI_V3_OFFLINE_ADAPTER_READY_20261120.md). No Drive, piloto A REPASAR, sin deploy.

## BT-SEC07-EDGE-FUNCTIONS-DEPLOYED-READONLY-AUDIT-51 · auditoría real no mutante (20/11/2026)

Con autorización expresa para auditoría read-only Supabase se verificó `biomotors-taller` ACTIVE_HEALTHY, `list_edge_functions`: solo `bt-owner-onboarding` ACTIVA v2, `verify_jwt=true`. `get_edge_function` devolvió un `index.ts` que **coincide EXACTAMENTE** con contenido `main`. Emplea `SUPABASE_URL`+HTTPS `fetch` a `/auth/v1/user` y RPC `/rest/v1/rpc/bootstrap_workshop_owner`, no driver/conexión PG directa. Contiene bandera de habilitación y service-role en env, **valores runtime NO consultados**. Otros 4 entrypoints de funciones están en repo pero **NO desplegados** en el proyecto, como indican comentarios en `supabase/config.toml`. Sin invocaciones, secrets, SQL, datos clientes, cambios ni despliegues. Edge Function activa compatible EN DISEÑO con enforcement SSL del servidor, no validación real post cambio ni del upstream SSL. [CP51](./docs/checkpoints/CHECKPOINT_BT_SEC07_EDGE_FUNCTIONS_DEPLOYED_READONLY_AUDIT_20261120.md). Falta clientes externos y R3 roles/ACL; ON reinicia DB, permiso no otorgado.

## BT-SEC07-RENDER-RUNTIME-READONLY-AUDIT-50 · Render My Workspace verificado (20/11/2026)

Usuario CONFIRMÓ workspace `My Workspace` para inventario read-only; Render `list_services` enumeró 18, uno solo ByteTorque: `biomotors-taller-demo` es **static_site**, repo `biomotors-taller` main, autoDeploy=yes, `npm install --no-audit --no-fund && npm run build` publica `dist`, último despliegue LIVE. Render `list_postgres_instances` reportó 0 Postgres en workspace. Esto **cierra topología Render**: no servicio backend PostgreSQL de ByteTorque allí; frontend `supabase-js` vía HTTPS; no certificar Edge Functions externas u otros DB clients. Conector **no tiene get_env**: variables no auditadas, no se vieron secretos. Solo metadatos, sin modificar Render/GitHub productivo/Supabase. SSL enforcement OFF UI, backend SSL NO, PC→pooler TLS verify-full PASS; roles reales/owners/ACL siguen sin backup. Siguiente clientes externos y plan de mantenimiento, autorización nueva antes de ON/reinicio. [CP50](./docs/checkpoints/CHECKPOINT_BT_SEC07_RENDER_RUNTIME_READONLY_AUDIT_20261120.md).

## BT-SEC07-SSL-COMPATIBILITY-STATIC-AUDIT-49 · auditoría código SSL (20/11/2026)

Se leyó main, AGENTS/agent/roadmap/CP48 e incidentes. Auditoría estática de frontend y Edge Function entries: `supabase-js` HTTPS / `SUPABASE_URL/fetch`, sin conexión PG directa observada en archivos revisados. Backups `postgres_config.py`, `cloud_backup.py` requieren TLS verify-full y pooler 5432; cliente PC→pooler ya PASS CP46. Workflows `bt-encrypted-backup` y `bt-readonly-pooler-diagnostic` son **solo manuales**, no lanzarlos. **Render runtime/otras integraciones PENDIENTES** por falta de workspace Render seleccionado (no inferir). SSL enforcement OFF UI CP48, backend ssl REPORTED_NO, end-to-end no certificado. Plan bloques: A inventario runtime/clientes; B protección roles/owners/ACL; C compatibilidad + ventana y rollback; D activación ON solo bajo autorización explícita, seguida de QA controlado. Ni producción ni workflows cambiados. [CP49](./docs/checkpoints/CHECKPOINT_BT_SEC07_SSL_COMPATIBILITY_STATIC_AUDIT_20261120.md).

## BT-SEC07-SSL-ENFORCEMENT-OFF-UI-OBSERVED-48 (20/11/2026)

Captura aportada por propietario en Dashboard Supabase: **Enforce SSL on incoming connections = OFF** (interruptor gris blanco a izquierda). Solo evidencia **VISUAL** `SSL_ENFORCEMENT_UI: OBSERVED_OFF`, no API GET; CP47 estaba UNKNOWN por limitación conector, ahora observado por el propietario. CP46: PC→pooler TLS verify-full CONFIRMED_BY_LIBPQ; backend `pg_stat_ssl: REPORTED_NO`, end-to-end NOT_CERTIFIED. OFF significa no exigir SSL a Postgres en el ajuste, no que toda sesión sea sin cifrar. **No cambiar ON ahora**: Supabase requiere reiniciar DB al modificar. Usuario autorizó solo consultar y compartir estado; cambio requiere permiso independiente y auditoría de compatibilidad/continuidad. No SQL/dump/GPG/restores/deploy. [CP48](./docs/checkpoints/CHECKPOINT_BT_SEC07_SSL_ENFORCEMENT_OFF_UI_OBSERVED_20261120.md). Roles/owners/ACL siguen sin respaldo completo, piloto A REPASAR.

## BT-SEC07-SSL-ENFORCEMENT-READONLY-LIMIT-47 · GET no disponible en conector (20/11/2026)

Autorizado solamente observar SSL enforcement de proyecto. `list_projects` y `get_project` Supabase verificaron `biomotors-taller` ACTIVE_HEALTHY/Postgres17/sa-east-1. **Conector no expone GET /ssl-enforcement y get_project no contiene campo**; no hay base para afirmar ON ni OFF. Fuente oficial muestra Dashboard Database Settings → SSL Configuration → Enforce SSL on incoming connections, y GET Management API con autenticación. No se solicitó token, ni SQL de producción, ni cambio. Si propietario observa manualmente el switch SIN TOCAR, registrar su resultado como dato declarado por él. Ajuste al cambiarse reinicia PostgreSQL, requiere nueva aprobación. CP46 cliente TLS PASS, backend SSL NO, end-to-end NO certificado; upstream pendiente. [CP47](./docs/checkpoints/CHECKPOINT_BT_SEC07_SSL_ENFORCEMENT_READONLY_LIMIT_20261120.md).

## BT-SEC07-R3-CLIENT-TLS-V2-WINDOWS-PASS-46 · lectura TLS cliente completada (20/11/2026)

Propietario aportó salida Windows V2 real tras segundo intento único autorizado: `RO_V2_ZIP: VERIFIED`, `SOURCE_CONFIG: SAFE_STATIC_MATCH`, `REMOTE: CONNECTED_CLIENT_TLS_VERIFY_FULL`, `CLIENT_POOLER_TLS: CONFIRMED_BY_LIBPQ`, `TRANSACTION_READ_ONLY: ON`, `SERVER_MAJOR: 17`, `SERVER_IDENTITY: CONSISTENT_WITH_LOCAL_SOURCE_NOT_INDEPENDENTLY_ATTESTED`, `QUERY: STATIC_SELECT_ONLY`, `PRECHECK: PASS_SINGLE_READONLY_CONNECTION`, `RO_V2_WINDOWS: PASS_CLIENT_TLS_ONLY`. **Backend SQL informa `DB_BACKEND_SSL: REPORTED_NO`; `END_TO_END_TLS: NOT_CERTIFIED`**. No se exportaron roles ni usó GPG. Cerrar INC-44 del criterio V1, mantener hallazgo SSL upstream-46 pendiente, no inferir estado global de enforcement. Fuente oficial Supabase documenta que para pooler compartido enforcement cubre ambos tramos y cambiarlo reinicia DB. **Siguiente: solicitar permiso separado para leer solamente el estado actual de SSL enforcement**; ninguna modificación automática. No repetir tests/pg_restore, roles/ACL pendientes. [CP46](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CLIENT_TLS_V2_WINDOWS_PASS_BACKEND_SSL_PENDING_20261120.md).

## BT-SEC07-R3-READONLY-TLS-CLIENT-V2-AUTHORIZED-45 · segundo intento consentido (20/11/2026)

Usuario AUTORIZÓ **una sola segunda conexión read-only** para validar TLS PC→pooler desde `psql \\conninfo` del mismo proceso; no dump/migración/SSL enforcement ni cambios. ZIP `BT_SEC07_R3_READONLY_CONN_V2_20261120.zip` SHA `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b` comprobado nuevamente en contenedor; contiene script y README/test; fuente inspeccionada, sin secretos. Anteriores 35/35 tests offline PASS CP44, **Windows V2 PENDIENTE**. Si STOP no reintentar; salida solo `BT_SEC07_*`. Reportar backend SSL sí/no separado de cliente, siempre `END_TO_END_TLS: NOT_CERTIFIED`. [CP45](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_TLS_CLIENT_V2_AUTHORIZED_20261120.md).

## BT-SEC07-R3-READONLY-TLS-BACKEND-FALSE-FIX-PREP-44 · falso STOP V1 por `pg_stat_ssl` detrás de pooler (20/11/2026)

**Windows V1 real:** `RO_ZIP: VERIFIED`, `PG17_PSQL: PRESENT`, `SOURCE_CONFIG: SAFE_STATIC_MATCH`, `CA: PUBLIC_PEM_LOADABLE_NO_TLS_YET`, `SSL_POLICY: VERIFY_FULL_AND_READ_ONLY_ENFORCED`, `TARGET: ORIGINAL_SOURCE_POOLER_5432`, `PRECHECK_STOP: SESSION_TLS_NOT_CONFIRMED`, `ROLES_BACKUP: NOT_ATTEMPTED`, `RO_WINDOWS: STOP`. Auditoría fuente ZIP V1 SHA `ea7a7d53208b63481c8cb69462ed152ee4fb0c69b08af8528cac59947c5f7f35`: se aprobó psql RC 0, database/rol/PG17/transaction_read_only ON, pero `pg_stat_ssl.ssl=false` para backend de **pooler->DB** bloqueaba inválidamente verificación PC->pooler. **Causa de criterio V1 CONFIRMADA; TLS de cliente no probado con ese indicador, upstream SSL del backend NO observado.** V2 privada `BT_SEC07_R3_READONLY_CONN_V2_20261120.zip` SHA `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b`, 10542B, consulta `\\conninfo` en mismo psql, fuerza SSL cliente verify-full + gssencmode disable, rechaza ausencia TLS, reporta backend ssl por separado + `END_TO_END_TLS: NOT_CERTIFIED`. 35/35 QA sintético PASS y tras ZIP 35/35 PASS, comparación V1 STOP/V2 PASS con respuesta inventada. **No hay segundo acceso Windows autorizado aún**; usuario autorizó primera conexión y ya la ejecutó, pedir AUTORIZO nuevo antes de repetir. No dump/roles/GPG/restores ni configurar SSL enforcement sin otro permiso. [CP44](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_TLS_BACKEND_FALSE_FIX_PREP_20261120.md). R2 estructura PASS, histórico roles SQL 0, Drive fuera, piloto A REPASAR.

## BT-SEC07-R3-READONLY-CONNECTION-PREP-43 · autorización real de primera conexión solo lectura, paquete listo (20/11/2026)

Usuario respondió `autorizo` para **primera comprobación de conexión Supabase en modo lectura**, sin respaldo ni modificación. Se revisaron AGENTS/agent/roadmap, CP42/contrato R3, texto del exportador local original en Files y fuente CLI v3.0.0: `linked/ref` puede crear login-role temporal, se evita CLI usando `psql` local PG17. ZIP PRIVADO `BT_SEC07_R3_READONLY_CONN_20261120.zip` SHA256 `ea7a7d53208b63481c8cb69462ed152ee4fb0c69b08af8528cac59947c5f7f35`, 8903B, **24/24 tests OFFLINE PASS y 24/24 tras extracción**; **WINDOWS AÚN NO EJECUTADO**, no certificar conexión. GUI solicita escoger `bytetorque_respaldo_local.py` ORIGINAL solo para AST estático; acepta únicamente HOST/PORT/DB/PROJECT/USER conocidos de pooler sesión 5432. Detecta un único CA candidato público bajo BT-Secrets y lo carga con ssl. Pide password vía `getpass` **solo PC** y pasa `PGPASSWORD` efímero solo a hijo `psql` sin file ni argv; SSL verify-full y `BEGIN TRANSACTION READ ONLY` + SELECT constante de identidad/versión/pg_stat_ssl, suprime stderr y stdout SQL. Identidad solo consistente con fuente local, no corroborada externamente. **No `pg_dumpall`, backup, GPG, rol/DDL/migraciones.** Bloque PowerShell hash + ZIP + GUI en [CP43](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_CONNECTION_PREP_20261120.md). Después de PASS exigir autorización distinta para exportación real roles, uso GPG histórico o restore. Labs 18/14/15 y R2 cerrados; SQL roles antiguo 0 bytes, causa origen sin clasificar, piloto A REPASAR, Drive fuera.

## BT-SEC07-R3-CONN-OFFLINE-WINDOWS-PASS-42 · preflight local en Windows aprobado (20/11/2026)

**Evidencia real del propietario:** `CONN_ZIP: VERIFIED`; `PG17_CLIENTS: ALL_PRESENT` + `PG17_PSQL/PGDUMPALL/PGDUMP/PGRESTORE: PRESENT`; `NODE/NPX: FOUND`; `TLS_CERT_LIKE_FILES: ONE_UNVALIDATED_CANDIDATE`; `SYNTHETIC_DB_URL_NO_PASSWORD: PASS`; `PREFLIGHT: COMPLETE_LOCAL_METADATA_ONLY`; `CONN_WINDOWS: PASS_OFFLINE_ONLY`. Estados de seguridad explícitos: `SESSION_POOLER_5432: HISTORICAL_POLICY_ONLY_NOT_CHECKED`, `TLS_VERIFY_FULL: REQUIRED_FOR_FUTURE_NOT_TESTED`, `TEMP_PGPASS_STRATEGY: DESIGNED_NOT_CREATED`, `CLI_V3_REMOTE_DB_URL: SOURCE_REVIEWED_NOT_EXECUTED`, `SUPABASE_REMOTE: NOT_CONNECTED`, `GPG_HISTORICAL_KEYRING: NOT_ACCESSED`, `ROLES_BACKUP: NOT_ATTEMPTED`. **Cierra únicamente inventario local, no certifica TLS/credenciales/origen ni roles SQL.** No reinstalar PG/Node; no ejecutar Supabase ni GPG histórico, y no repetir labs 18/14/15/R2/metadata. Próximo bloque agrupar validación offline CA sintáctica, contrato TLS/host y estrategia PGPASS efímera, sin conexión ni secretos expuestos. Conexión real requiere consentimiento NUEVO. [Checkpoint 42](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_WINDOWS_PASS_20261120.md). Piloto A REPASAR, Drive excluido.

## BT-SEC07-R3-CONN-OFFLINE-PREP-41 · contrato de conexión local + requisitos offline (20/11/2026)

**AUTORIZACIÓN:** propietario respondió `autorizo` solo para **preparar/comprobar método de conexión local**, sin conectar Supabase ni generar nuevos respaldos. Leídos AGENTS/agent/roadmap, checkpoint 40, informe y fuente CLI v3.0.0. `--remote=postgresql://...` se clasifica `DbUrl` (sin capa API login-role del modo linked); `--remote=service=...` NO procede; `PGPASSFILE`/PGPASSWORD pueden resolver secreto cuando la URL no lo contiene, y TLS `verify-full` será obligatorio. NINGUNA credencial/host de origen se ha usado. ZIP privado de inventario metadata local `BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_20261120.zip` SHA `37ef628d973b65a999e5be4b516ccc28c34aa311ef7600396173b0ad90e87edc` (4973 B), **18 NUEVAS pruebas sintéticas PASS en asistente y tras extraer**, PC Windows PENDIENTE. Detecta cliente PG17 en carpeta estándar, Node/NPX (sin ejecutarlos), archivos candidatos CA de `BT-Secrets` (solo nombres reconocidos por extensión, sin leer contenido ni imprimir nombres), URL ficticia. Runner Windows en [Checkpoint 41](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_PREP_20261120.md). Evitar confundir presencia con conexión probada, no usar GPG histórico ni DB. R3 roles/ACL pendiente, piloto A REPASAR, no Drive.

## BT-SEC07-R3-RECIPIENT-V2-WINDOWS-PASS-40 · metadatos V2 del backup real PASS y clave histórica reconciliada (20/11/2026)

**Resultado real de Windows:** ZIP V2 SHA VERIFIED, respaldo principal seleccionado, `HEADER_ONLY_NO_DECRYPT`, `RECIPIENT_COUNT: 1`, `HIDDEN_COUNT: 0`, `PUBLIC_MATCH: ALL_VISIBLE_MATCH`, `SECRET_MATCH: NO_VISIBLE_MATCH` **en el GPG home predeterminado**, `RECOVERABILITY: NOT_PROVEN`, `COMPLETE_NO_DB_NO_DECRYPT_NO_WRITE`, `META_V2_WINDOWS: PASS_HEADER_CHECK_ONLY`. **INC-39 cerrado operativamente** (V1 fallaba ante longitudes parciales OpenPGP válidas, V2 sobre backup real PASS). AUDITORÍA HISTÓRICA CLAVE: `docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md` ya documenta un **GNUPGHOME aislado histórico** con `SECRET_KEY_RECORDS: FOUND`, `SECRET_RECIPIENT: MATCH` y pública coincidente; R2 `PARITY_GPG_PROCESS: OK` + restore PostgreSQL mismo snapshot aislado `SNAPSHOT_STRUCTURE_ONLY PASS`. Por ello **no afirmar perdida la llave privada**; cero secreta en default es esperable. No repetir localizadores GPG, labs 18/14/15, metadata V1/V2 o R2 restore. El actual inventario libpq PG* sin set no prueba pérdida de credenciales previas. Próximo: R3 roles reales/owners/ACL y método conexión sin crear login-role temporal, **requiere permiso independiente**; evitar usar GPG histórico/DB remota todavía. [Checkpoint 40 + traspaso](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_V2_WINDOWS_PASS_HISTORICAL_KEYRING_20261120.md). Drive fuera, piloto A REPASAR.

## BT-SEC07-R3-RECIPIENT-PARTIAL-FIX-PREP-39 · V1 STOP reconocido, V2 solo cabeceras preparado (20/11/2026)

Evidencia Windows real: `META_ZIP: VERIFIED`, `META_SELECTION: ACCEPTED_NO_PATH_PRINTED`, `RECIPIENT_STOP_CLASS: PARTIAL_PACKET_UNSUPPORTED`, `RECIPIENT_CHECK: STOP_NO_DB_NO_DECRYPT`, `META_WINDOWS: STOP`. **Causa en código v1 comprobada:** rechazaba todas las longitudes parciales, válidas en OpenPGP para encrypted data. **El backup no está certificado corrupto; sí se respetó cierre sin decrypt**. ZIP privado v2 `BT_SEC07_R3_RECIPIENT_METADATA_V2_20261120.zip` SHA `eed81875dfca9f70929983a82b3490c62ff15f170d2a89ea410967033eb82842` acepta únicamente primera cabecera cifrada parcial tag9/18/20 tras destinatario, sin tocar carga. 19/19 tests v2 PASS y prueba GPG 2.4.7 REAL clave efímera + 1.25MB datos inventados por pipe produjo paquete parcial, parser pasó; 19/19 tras extraer. **WINDOWS V2 PENDIENTE**. Usuario autorizado solo metadata; runner GUI+SHA en [Checkpoint 39](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_PARTIAL_PACKET_FIX_PREP_20261120.md), no repetir suites 18/14/15 ni V1, no DB ni decrypt. 1 pub/0 sec en home GPG, roles/ACL pendientes, piloto A REPASAR, Drive fuera.

## BT-SEC07-R3-RECIPIENT-META-PREP-38 · parser OpenPGP solo metadatos preparado (20/11/2026)

Con AUTORIZO expreso del usuario para **comparar metadatos de destinatario del ciphertext existente y GPG local, sin descifrar, tocar backups ni Supabase**, se preparó ZIP privado `BT_SEC07_R3_RECIPIENT_METADATA_20261120.zip` SHA256 `3095885292baeca30a1785723143d1e99785baf735b793fee7e03196d69cbc8c` (3995 bytes) con parser PKESK v3 header-only y lectura de ID de claves públicas/secretas en memoria, sin nombres/IDs/rutas visibles. 13/13 pruebas sintéticas nuevas PASS en asistente y tras extraer ZIP, integración independiente con GPG real efímero + ciphertext inventado PASS. **WINDOWS PENDIENTE; no se leyó backup real.** El usuario ya tiene 1 pública/0 privadas en home GPG seleccionado. Si coinciden IDs, **recuperación NO demostrada**. Siguiente: PowerShell único verifica SHA y abre selector local de un .gpg principal existente, imprime solo `BT_SEC07_*`. No repetir suites 18/14/15, no conectar DB/usar privada/descifrar sin otra autorización. [Checkpoint 38](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_METADATA_PREP_20261120.md).

## BT-SEC07-R3-GPG-INVENTORY-PASS-37 · GPG home presente, 1 pública, 0 privadas (20/11/2026)

Propietario reportó `BT_SEC07_PS_MAJOR: 5`, `BT_SEC07_GPG_HOME: PRESENT`, `BT_SEC07_GPG_PUBLIC_KEYS_COUNT: 1`, `BT_SEC07_GPG_SECRET_KEYS_COUNT: 0`, `BT_SEC07_GPG_DIAG: PASS_NO_DB_ACCESS_NO_SECRETS_PRINTED`. Inventario PowerShell/libpq/GPG autorizado y cerrado sin contacto Supabase/backup; 0 secret keys **en el home seleccionado** no prueba pérdida global ni equivalencia con destinatario de respaldo. INC-36 listado anterior **resuelto operativamente, raíz exacta desconocida**; INC-35 `$HOME` corregido. No cifrar roles reales con esa pública hasta verificar custodia recuperable de privada mediante autorización separada. Suites Windows 18/14/15 PASS, R2 snapshot estructura PASS, R3 roles/owners/grants PENDIENTES, Drive excluido y piloto A REPASAR. [Checkpoint 37, advertencias y traspaso](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_INVENTORY_PASS_ZERO_SECRET_20261120.md).

## BT-SEC07-GPG-LIST-UNCLASSIFIED-36 · GPG_HOME PRESENT pero listado abortó (20/11/2026)

Propietario informó `BT_SEC07_GPG_HOME_SOURCE: GPGCONF`, `BT_SEC07_GPG_HOME: PRESENT`, `BT_SEC07_GPG_INVENTORY: FAILED_NO_DB_ACCESS`. La corrección INC-35 de `$HOME` permitió ubicar home GPG; ahora el error ocurre en listado de llaves o PowerShell. **No hay conteos, exit codes ni mensaje de excepción: causa NO IDENTIFICADA; no afirmar corrupción de keyring**. Hipótesis: `ErrorActionPreference='Stop'` y stderr de GPG, o fallo real GPG/ACL. Instrumentación de un solo bloque acotado GPG, `ErrorActionPreference=Continue`, muestra PowerShell major, fase, clase de excepción, código de salida y conteos, pero NO secretos/huellas/rutas. **Pendiente resultado Windows**. Solo inventario local autorizado; no repetir inventario PG, suites 18/14/15, ni tocar DB/backup. [INC-36 checkpoint y prompt mudanza](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_LIST_INVENTORY_FAILED_DIAG_PREP_20261120.md).

## BT-SEC07-LOCAL-INV-HOME-RO-35 · bug propio PowerShell `$home`/ `$HOME` tras detectar GPG (20/11/2026)

**Salida Windows real:** PG variables de proceso `NOT_SET`, pgpass/pg_service/cert predeterminados y variables específicas `ABSENT`, `TLS_ENV_VERIFY_FULL: NO_OR_UNSET`; `GPG_COMMAND: FOUND`; `LOCAL_INVENTORY: FAILED_NO_DB_ACCESS` **sin** marcadores GPG_HOME/counts. Causa verificable en el bloque del asistente: `$home = $null` intenta sobrescribir variable automática PowerShell `$HOME` read-only, ya que nombres son case-insensitive; la excepción fue ocultada por catch. **No atribuir falla a GPG/DB/clave.** Se preparó un nuevo comando que verifica SOLO GPG con `$gpgHomePath`/gpgconf, imprime exclusivamente estados y conteos sin secretos; **Windows todavía pendiente**. No repetir PG/env, QA Windows 18/14/15, reinstalaciones ni backups. Autorización sigue sólo inventario local; remoto y GPG histórico operativo requieren consentimientos separados. [INC/checkpoint 35 y prompt](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_LOCAL_INVENTORY_HOME_COLLISION_INC_20261120.md). R3 roles/grants pendientes; Drive fuera; piloto A REPASAR.

## BT-SEC07-R3-LOCAL-INVENTORY-PREP-34 · autorización de inventario local GPG/libpq (20/11/2026)

El usuario respondió `autorizo` **sólo** a revisar en su PC la configuración de conexión PostgreSQL/libpq y claves GPG existentes sin mostrar secretos, generar respaldos ni conectarse a Supabase. El asistente NO tiene acceso directo al PC; se prepara un bloque PowerShell de estados presentes/ausentes y **conteos** de claves sin revelar rutas/UID/huellas/passwords. **PENDIENTE de ejecutar en Windows y traer salida**; ninguna inspección real de keyring/variables se ha hecho aquí. No conectar a API/DB, no cifrar/descifrar con keyring histórico y no repetir mocks Windows 18/18, GPG efímero 14/14 o combinado 15/15, todos PASS. Riesgo CLI v3.0.0: linked/ref sin password puede crear login role `read_only:false`; alternativa por URL sin contraseña con PGPASSFILE es sólo un candidato. R3 roles/owners/ACL pendiente; Google Drive excluido, piloto A REPASAR. [Checkpoint con script exacto y prompt de mudanza](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_LOCAL_CREDENTIAL_KEYRING_INVENTORY_PREP_20261120.md).

## BT-SEC07-R3-COMBINED-WINDOWS-PASS-33 · integración real GPG con productor sintético 15/15 Windows PASS (20/11/2026)

Propietario confirmó ZIP SHA-256 `e4fda9667879998aa5214d8bb6357b618b67e14e9bcf7ee484a706578526f44c` verificado; `Ran 15 tests in 10.588s ... OK`, `COMBINED_WINDOWS_QA: PASS`, `COMBINED_RESULT: PASS`, `KEYRING: EPHEMERAL_REMOVED`, `SUPABASE_REMOTE: NOT_CONNECTED`, `REAL_ROLES_BACKUP: NOT_ATTEMPTED`, selftest PASS. MOCK 18/18 y GPG efímero 14/14 ya PASS en PC: **NO repetir**. Nueva lectura fuente CLI v3.0.0 `pg_dumpall --no-role-passwords` filtra reservados y añade `RESET ALL;` (SQL no vacío puede no contener roles útiles); linked/ref sin contraseña puede crear login-role con `read_only:false`. Evaluar `--remote=<URL sin contraseña>` más libpq/PGPASSFILE como alternativa, todavía NO probada en producción. Próximo paso: candidato de adaptador CLI→GPG offline contra salida simulada; exportación GPG real/DB remota solo con consentimiento separado. [Checkpoint / traspaso](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_COMBINED_WINDOWS_PASS_AND_REAL_EXPORT_GATE_20261120.md) y [runbook](./docs/BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md); roles/owners/ACL, Auth/Storage/Edge y piloto A REPASAR; Drive fuera.

## BT-SEC07-R3-COMBINED-BRIDGE-PREP-32 · Lab integrado mock-producer + GPG verdadero, 15/15 asistente (20/11/2026)

Nuevo ZIP privado `BT_SEC07_R3_COMBINED_BRIDGE_20261120.zip`, SHA256 `e4fda9667879998aa5214d8bb6357b618b67e14e9bcf7ee484a706578526f44c`, tamaño 9.880 bytes: **15/15 pruebas integradas PASS** en entorno del asistente, 15/15 PASS tras extracción, selfcheck PASS; productor Python **simulado**, GPG real con clave efímera y SQL inventado. **Windows aún PENDIENTE**; no reabrir los labs antiguos MOCK 18/18 ni GPG 14/14, ambos PASS en PC. Verifica hash, extrae fuera de repo/backup y ejecuta solo `py -3 -m unittest -v test_bt_sec07_combined_bridge` y selfcheck. Sin acceso Supabase, CLI dump, credenciales, keyring original ni restore. Próximo después de PASS Windows: especificar wrapper CLI v3.0.0 stdout binario → GPG + fail-closed; el acceso remoto y GPG histórico requieren autorización específica. R3 roles/grants/ACL pendientes, Drive fuera, piloto A REPASAR. [Checkpoint de mudanza](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_COMBINED_BRIDGE_PREP_20261120.md).

## BT-SEC07-R3-GPG-WINDOWS-PASS-31 · laboratorio GPG efímero 14/14 PASS y nuevo gate de roles (20/11/2026)

El propietario confirmó `BT_SEC07_GPG_ZIP: VERIFIED`, `Ran 14 tests in 7.402s ... OK`, `GPG_WINDOWS_QA: PASS`, `GPG_REAL: PASS_EPHEMERAL_KEY`, `GPG_HOME: TEMPORARY_AND_REMOVED`, `REAL_ROLES_BACKUP: NOT_ATTEMPTED`, `GPG_SELFTEST: PASS`. **R3 GPG efímero Windows CERRADO: no repetir**. Se auditó solo lectura el código oficial de Supabase CLI **tag v3.0.0**: `--role-only` usa `pg_dumpall`, salida stdout binaria sin `--file`, `-f` crea/trunca SQL plano modo 0644 y reintentos con stdout pueden dejar fragmentos. En flujos ligados puede haber provisioning temporal de rol según autenticación; no demostrado para ByteTorque. Próximo: candidato privado de puente stdout→GPG con productor simulado y fallos cerrados; conexión real/clave real/restauración requieren autorizaciones separadas. Antiguo roles.gpg 0 bytes, R2 estructura PASS, R3 ACL abierta; piloto A REPASAR. [Checkpoint y prompt de mudanza](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_WINDOWS_PASS_ROLE_EXPORT_GATE_20261120.md).

## BT-SEC07-R3-WINDOWS-QA-PASS-30 · 18/18 en Windows, GPG efímero real 14/14 en asistente (20/11/2026)

El usuario ejecutó paquete R3 sintético y obtuvo `BT_SEC07_ZIP: VERIFIED` + `Ran 18 tests in 4.768s` + `OK` + `BT_SEC07_WINDOWS_QA: PASS`. No repetir esa prueba. Preparado ZIP **privado** `BT_SEC07_R3_GPG_EPHEMERAL_20261120.zip` SHA `051cbe04f6b7b900310bcab615b7b240ff8ff8b22abfe445b555e537ae4d078e`, 14/14 GPG real con **clave temporal exclusiva y SQL inventado**, prueba nuevamente tras extracción 14/14; **Windows aún NO ejecutado**. No usa GPG histórico, Supabase ni DB. Siguiente: comprobar SHA/extracción y correr solo laboratorio efímero Windows con permiso del propietario. Posteriormente diseñar exportación real con autorización específica y prueba de roles/owners/ACL en aislamiento. Old `roles.sql.gpg` SQL 0 bytes, R2 snapshot estructural PASS; piloto A REPASAR. [Checkpoint/mudanza](./docs/checkpoints/CHECKPOINT_BT_SEC07_R3_WINDOWS_PASS_GPG_EPHEMERAL_PREP_20261120.md).

## BT-SEC07-ROLES-CLI-FLAGS-PASS-29 · preflight Windows PASS + laboratorio sintético 18/18 (20/11/2026)

El propietario ejecutó el bloque `npx supabase@3.0.0 db dump --help`: `FILE=True`, `ROLE_ONLY=True`, `REMOTE=True`, `DATA_ONLY=True`, `COMPLETE_NO_DB_ACCESS`. **Cerrar solo preflight CLI**, sin repetición. Preparado ZIP privado `BT_SEC07_R3_SYNTHETIC_LAB_20261120.zip` SHA256 `48634f2c5118a2af2b6c4449f68d71f19c72942454b5bcb9ec38d875b04e627a`, con tests de flujo binario y fallos simulados: **18/18 PASS** en el entorno del asistente y tras descomprimir; **Windows aún no ejecutado**. Importante: cifrador `.mock` NO ES GPG real, no SQL de Supabase, no conexión remota ni garantía de roles. Siguiente: hash del ZIP y 18 pruebas Windows sin acceso DB, luego diseño aparte del productor/GPG real solo con aprobación nueva. Antiguo `roles.sql.gpg` descifra 0 bytes; R2 snapshot estructural PASS y roles/ACL + piloto pendientes. Drive fuera y repositorio observado público, sin cambios. [Checkpoint y traspaso](./docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_CLI_FLAGS_AND_SYNTHETIC_LAB_20261120.md).

## BT-SEC07-ROLES-OUTPUT-CONTRACT-PREP-28 · contrato de salida CLI v3 revisado (20/11/2026)

Verificadas en documentación oficial las opciones `--file`/`-f`, `--role-only`, `--remote` y `--data-only` de `supabase db dump`; **todavía NO verificadas en nueva salida Windows**. Próximo paso: preflight único de `db dump --help` mediante `npx supabase@3.0.0` fuera del repo, solo booleanos, cero DB/credenciales. No confundir con exportación: antiguo `roles.sql.gpg` descifra 0 bytes, snapshot cifrado R2 sí pasó paridad estructural pero propietarios/ACL reales no fueron restaurados; recuperación integral y piloto siguen pendientes. Después del preflight, diseñar y testear wrapper binario/salida no vacía/GPG antes de pedir autorización remota aparte. Drive excluido. GitHub reporta repositorio público; no cambiado. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_OUTPUT_CONTRACT_PREP_20261120.md).

## BT-SEC07-ROLES-CLI-V3-READY-27 · Supabase CLI 3.0.0 disponible con npx sin DB (20/11/2026)

Salida real Windows: `NODE_NPX: READY`, usuario `AUTORIZO`, `ROLES_CLI: AVAILABLE`, `VERSION: 3.0.0`, `ROLE_ONLY: True`, `REMOTE: True`, `DB_URL: False`, `PREFLIGHT: SUCCESS_NO_DB_ACCESS`. Ausencia del flag --db-url en ayuda es **normal en v3: deprecado/oculto**, `--remote` explícito lo sustituye; v3 apunta a local por defecto. No hay archivo roles SQL nuevo, conexión remota ni cambios al repositorio por esta ejecución. Evitar CLI global/Scoop; npx fijado a 3.0.0 en TEMP funciona. Siguiente bloque R3: contrato de ayuda/flags `--file`, definir exportación remota separada y comprobable con productor/GPG SQL no vacío, tests sintéticos de fallo y flujo binario sin PowerShell textual, antes de acceder a Supabase **con autorización específica**. Roles.sql.gpg viejo cero bytes NO recuperable; restore R2 omitió propietarios/ACL. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_CLI_V3_READY_20261120.md). Drive excluido, piloto A REPASAR.

## BT-SEC07-ROLES-CLI-PREFLIGHT-26 · CLI no localizada en PATH; ruta oficial Windows controlada (20/11/2026)

Evidencia Windows del propietario: `BT_SEC07_ROLES_CLI: NOT_INSTALLED`, `ROLES_PREFLIGHT: COMPLETE_NO_CHANGES`. Significa que `Get-Command` no halló `supabase` globalmente **en esa sesión**, no que exista daño en base/dump/GPG. Supabase ofrece Windows vía Scoop o Node.js >=20 + `npx`. Antes de instalar/descargar: detectar Node/npx, requerir `AUTORIZO` para ejecución con descarga npm, trabajar fuera del repo, versionar CLI v3 y consultar solo `--version`/`db dump --help` (flags `--role-only`, `--remote`); nunca ejecutar `db dump` ni acceso remoto en este preflight. CLI v3 usa local por defecto; no hacer `supabase link` ni `login` ahora. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_CLI_PREFLIGHT_20261120.md). R2 snapshot PASS estructural permanece; R3 roles/ACL sin comprobar, archivo roles SQL antiguo 0 bytes; Drive excluido y piloto A REPASAR.

## BT-SEC07-PARITY-STRUCTURE-PASS-25 · Paridad estructural real del snapshot actual PASS (20/11/2026)

**Propietario ejecutó en Windows** `BT_SEC07_PARITY_LAB_V2_20261120.zip` (40/40 tests PASS y `AUTORIZO`). `SQL_PREFLIGHT: PASSED_BEFORE_GPG_RESTORE`, `GPG_PROCESS/PG_RESTORE_PROCESS: OK`, 12 tablas públicas + 8 privadas, RLS 20/20, FORCE privadas 8/8, 21 políticas, 35 funciones, 4 extensiones instaladas, 0 índices inválidos y 0 constraints pendientes. `TABLES_ROW_COUNTED: 20`, 37 filas del snapshot (33 public + 4 private), 12 tablas con filas. Contenedor eliminado y hashes backup/manifiesto intactos, exit 0. **`CERTIFICATION: SNAPSHOT_STRUCTURE_ONLY`**. V1 `PARITY_QUERY_FAILED` por `physical_tables` ausente corregido y solución validada en PostgreSQL real antes de restore. `SOURCE_ROW_PARITY: NOT_VERIFIED`, `ORIGINAL_OWNERS_AND_ACL: NOT_VERIFIED` por `--no-owner --no-acl`; NO certificar usuarios reales, aislamiento A/B ni Auth/Storage/Edge, secreta, segundo backup. **Siguiente:** plan R3 roles SQL/privilegios con guía oficial Supabase, comprobar CLI v3 `--version`/`db dump --help`, no conectar a producción ni volcar nuevos SQL sin autorización explícita; nunca repetir `pg_dumpall` antiguo sin causa y sin corregir bytes 0. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_STRUCTURE_PASS_20261120.md). Drive excluido, piloto `A REPASAR`.

## BT-SEC07-PARITY-SQL-INC-24 · Defecto identificado en consulta de paridad, V2 con preflight antes de restore (20/11/2026)

El propietario ejecutó el paquete V1 (32/32 QA) y reportó **GPG/pg_restore OK**, container offline/cleanup OK, backup intacto, **`BT_SEC07_STOP: PARITY_QUERY_FAILED`** antes de mostrar métricas. Código original auditado y SHA verificado: `CATALOG_METRICS` solicitaba `physical_tables` pero `stat` NO la declaraba. **Causa confirmada por código**, no atribuir a GPG, imagen Docker ni pérdida de datos. Tests V1 simularon números y omitieron validación SQL. Nuevo paquete privado `BT_SEC07_PARITY_LAB_V2_20261120.zip` SHA `0d315b637730500ebfaf7f058c98cde3c1abfa28dc115c70a1e569608f26d667`: corregido `c.relkind` y `physical_tables`, 40/40 tests PASS, 40/40 -O PASS, integración sintética/fallo temprano PASS y ZIP limpio. Incluye **preflight SQL real en DB vacía local antes de descifrar/restaurar**, clasifica fallas por etapa, cleanup solo contenedor propio. No probado aún en Windows ni autorizado para repetir; requiere **nueva autorización explícita**. Preservar V1 y backup; no hacer nuevos dumps/Drive. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_SQL_INC_20261120.md). No certificar paridad ni seguridad integral y `BT-PILOT-QA-04 A REPASAR`.

## BT-SEC07-PARITY-PREP-23 · Prueba de paridad local preparada, sin conexión a producción (20/11/2026)

ZIP privado `BT_SEC07_PARITY_LAB_20261120.zip`, SHA256 `795b7d2f38b43bd817f4c63e11770a8f4f8c8ccf33c791afa1d9583847c31cf8`: **32/32 tests sintéticos PASS** y tras extracción PASS; no Docker real desde entorno de asistente. Importa el laboratorio que ya produjo `LAB_PG_RESTORE_PROCESS: OK` y 12 tablas públicas, validando previamente SHA `9a5ff6167552814ba84bd1ea31242a9b11eb77e58f5a5e4edd3c20f80be7cdb0`. **Solo ejecutar con nueva autorización AUTORIZO** en Windows, un único contenedor sin red, sin montajes ni puertos; comprueba conteos agregados por tabla en memoria y total público/privado, 12 públicas y >=8 privadas, RLS/FORCE/políticas, restricciones/índices/funciones/extensiones SQL, cleanup/hash. **No comparar origen Supabase ni revelar SQL/PII**, no certificar propietarios/ACL porque el restore base usa `--no-owner --no-acl`, ni Auth/Storage/Edge. Si hay error, detener sin repetir; documentar clase/causa/prueba en [checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_PREP_20261120.md). GPG/backup intactos; Google Drive excluido; piloto `BT-PILOT-QA-04 A REPASAR`.

## BT-SEC07-RESTORE-ISOLATED-PASS-22 · Restore lógico del ciphertext PostgreSQL actual exitoso en Docker Supabase (20/11/2026)

Propietario ejecutó ZIP `BT_SEC07_SUPABASE_ISOLATED_RESTORE_20261120.zip` en Windows, QA **25/25 PASS**, consentimiento `AUTORIZO`; `EXISTING_BACKUP: HASHES_VERIFIED_NO_CHANGES`, Supabase imagen `17.12.0.002` digest OK, `LAB_GPG_PROCESS: OK`, `LAB_PG_RESTORE_PROCESS: OK`, `LAB_ERROR_CLASS: NONE`, `LAB_STREAM: NONZERO`, `LAB_PUBLIC_TABLE_COUNT: 12`, `LAB_RESTORE: SCHEMA_LOADED_ISOLATED_SCOPE_ONLY`, `LAB_CONTAINER_CLEANUP: VERIFIED_REMOVED`, manifest sin cambios, exit 0. **Hecho:** carga lógica de snapshot actual completada en laboratorio efímero sin red/puertos. **Límite crítico del código:** `--no-owner --no-acl` + roles NOLOGIN placeholders; solo contó tablas públicas, no filas, paridad RLS, funciones, grants, roles, Auth/Storage/Edge. `FULL_PROJECT_RECOVERY: NOT_CERTIFIED` y manifiesto sigue NOT_VALIDATED. **Próximo paso:** planificar una sola repetición más potente únicamente para auditar paridad, sin exportaciones, sin Supabase/Drive y previa autorización concreta. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC07_RESTORE_ISOLATED_SUCCESS_20261120.md). Piloto aún `BT-PILOT-QA-04: A REPASAR`.

## BT-SEC07-SUPABASE-IMAGE-MATCH-21 · Catálogo Supabase PG17 completo; laboratorio de restore aislado candidato (20/11/2026)

**Evidencia Windows real:** imagen `supabase/postgres:17.12.0.002` descargada con autorización y digest `0b64586fb84124b9070525a6528616594a1aa84a75d84cd4c3d43acc8de3ba92`; comparador 15/15 OK, `ARCHIVE_EXTENSION_COUNT: 4`, `SUPABASE_PG17_ABSENT: 0`, `CIPHERTEXT_AND_MANIFEST: UNCHANGED`, exit 0. Un archivo de control no prueba extensión ejecutable ni recuperación. **Próximo candidato privado** ZIP `BT_SEC07_SUPABASE_ISOLATED_RESTORE_20261120.zip` SHA256 `3a50b7bf010b7c8a4362f06d099467a5bbdbbdd2cbb243e588ce1caf4ccd7012`, 25/25 QA offline PASS (sin Docker real en asistente): exige consentimiento para un ensayo **único** solo en Docker local sin red/volúmenes/puertos con imagen digest fijado, datos tmpfs, roles NOLOGIN temporales, base template0, GPG->pg_restore transacción única, stderr reducido a categorías, cleanup verificable y hashes sin modificar. Evitar nueva exportación remota/Drive. Resultados insuficientes para `FULL_PROJECT_RECOVERY` por Auth/Storage/Edge/roles SQL, y `BT-PILOT-QA-04 A REPASAR`. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC07_SUPABASE_IMAGE_MATCH_AND_LAB_PREP_20261120.md).

## BT-SEC07-EXTENSION-MISMATCH-20 · Inventario de 4 extensiones completo, 1 ausente en PostgreSQL estándar (20/11/2026)

**V2 ejecutado realmente en Windows:** `ARCHIVE_TOC: PARSED_NO_SQL_EXECUTION`, `ARCHIVE_EXTENSION_COUNT: 4`, `UNRECOGNIZED: 0`, `EXTENSIONS_ABSENT_LOCALLY: 1` (`NONPUBLIC_COUNT_ABSENT: 1` por allowlist, **no inferir carácter privado**), `BACKUP_AND_MANIFEST: UNCHANGED`, `DIAG_EXIT_CODE: 0`. GPG/readback del ciphertext comprobado, restauración completa **NO**. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC07_EXTENSION_MISMATCH_20261120.md). Solo preparado paquete de comparación metadatos `BT_SEC07_SUPABASE_IMAGE_COMPARE_20261120.zip` (SHA `0440ad7e1323d91a8f2f531ad595b04317ee1f1dcb743d01bbb36b449a53f540`, 15/15 QA sintética) contra `supabase/postgres:17.12.0.002`, imagen local opcional con pull autorizado solo por propietario; sin instalar extensiones/SQL, sin backups ni restore. **No confundir existencia .control con compatibilidad ni imprimir nombres no allowlisted**. Google Drive excluido. R2 recuperación y pilotos siguen bloqueados.

## BT-SEC07-ARCHIVE-TOC-V2-19 · TOC Windows falló; V2 offline exclusivamente Docker PG17 preparado (20/11/2026)

Inventario V1 sobre snapshot GPG actual: `EXISTING_SNAPSHOT: INTEGRITY_VERIFIED_NO_CHANGES`, `LOCAL_PG17: VERIFIED`, `STOP: ARCHIVE_TOC_NOT_READABLE`, exit 2. Docker iniciado manualmente y funcionando; causa exacta del error TOC **no determinada** porque V1 usa `pg_restore --list` **Windows**, descarta stderr y mezcla rc/pipe/bytes. V2 ZIP privado `BT_SEC07_EXTENSION_INVENTORY_V2_20261120.zip`, SHA `15d9def921e3ceb0f8721ca3a2b1f964c47916e2b8e898623ff8261822acbdc6`: usa `docker run --rm -i --network none --pull=never --read-only --cap-drop=ALL --security-opt=no-new-privileges --entrypoint pg_restore <PG17> --list` en la imagen local, no inicia base ni expone datos, captura errores solo para códigos fijos. 19/19 tests sintéticos y prueba aparte de pipe binario sintético PASS; **no ejecutado con snapshot real/Windows**. Ejecución focalizada de una sola acción solo bajo control del titular; preservar backup cifrado, no más export ni restore de DB hasta inventario. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC07_ARCHIVE_TOC_V2_20261120.md). **Drive fuera del roadmap; piloto A REPASAR**.

## BT-UX-PERSIST-01 · WEB/PWA LIVE verificado 20/11/2026

Con autorización expresa del titular se publicó `main` commit `7da13a3f` en el servicio Render **existente** `biomotors-taller-demo` (`srv-dbqe4quc6qcc73f275jg`, workspace `tea-daum20gjo6nc73dndfqg`), deploy `dep-dc09s9jncjis7387ghv0`, **LIVE** confirmado 20/11/2026 19:23:40 UTC. La revisión de código `badea20b` tenía 744/744 PASS, compilaciones pública/privada, [CI general](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44798553027) y [CI visual](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44798552931) SUCCESS. El anterior LIVE `bd9c8e5` se sustituyó. El despliegue se hizo por API `clearCache:false`; no hubo cambio de env/flags ni de Supabase, Auth alojado, SQL, RLS, Edge, Storage, correo, pagos, APK ni otro servicio. **Pendiente QA manual** foco/captura, navegación a 5 módulos, regreso a subpantallas/scroll/cursor, edición sin perder datos y Safari/iPhone físico. La revocación/offline debe seguir bloqueando privada. No declarar final de piloto Ignacio ni SEC-07. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_UX_PERSIST_01_20261120.md).

## BT-UX-PERSIST-01 — candidato de navegación continua (20/11/2026)

Cierre local: 744/744 pruebas PASS, builds público/privado PASS y UX Chromium
1366/390/768 PASS. Ajustes de autoridad/plan y destino explícito de otra OT
probados también con PLAN04 y CP05 sintéticos. Código `badea20`: CI general
44798553027 y visual Chromium/WebKit 44798552931 SUCCESS, al igual que FLOW/COT/REG.
Publicado en main con `[skip render]`; NO desplegado. Render conserva `bd9c8e5`.

Base `bfa7556`, main única. Revalidación coordinada preserva el contexto confirmado,
cinco vistas visitadas en memoria conservan formularios/scroll y contexto; una
invalidación real sigue retirando datos/repositorios. Sin cambios Render,
Supabase/flags/SQL/RLS, Android ni SEC-07. Despliegue pendiente de autorización.
Incidentes UX-INC-01…07 y UX-TEST-01, pruebas y límites en
[checkpoint UX](docs/checkpoints/CHECKPOINT_BT_UX_PERSIST_01_20261120.md).
No confundir HTTP sintético y CI con prueba física Safari/Edge o piloto real.

## BT-PILOT-QA-04C · RENDER LIVE del arreglo de pendientes (20/11/2026)

Autorización expresa del propietario tras QA: **[CI Web/PWA+Android #44774998665](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774998665) SUCCESS y [navegador #44774998785](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774998785) SUCCESS**, código `e617542`; solo docs posteriores. Despliegue manual en Render existente `biomotors-taller-demo` / `srv-dbqe4quc6qcc73f275jg` / workspace `tea-daum20gjo6nc73dndfqg`: `dep-dc086ugm7kps73d78ue0` sobre `bd9c8e5` **LIVE confirmado 20/11/2026 17:29:52 UTC**. El previo `f757daf2` quedó deactivated. No cambios de env, Supabase, SQL/RLS, Auth/Edge/Storage, correo, pagos ni APK. **No se validó físicamente** cambio atención→OK en QA1234 ni descarga PDF real: usuario debe revisar guardado, pendientes, recarga y prueba de histórico. No confundir LIVE con aprobación piloto Ignacio; SEC-07 sigue pendiente. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_PILOT_QA_04C_PENDIENTES_VIGENTES_20261120.md).

## BT-PILOT-QA-04C · OK actualiza pendientes multipunto (20/11/2026)

Bug reportado en QA1234: al reemplazar atención/cambio inmediato por OK, la lista histórica de pendientes seguía mostrándolo y la nota provisional antigua bloqueaba el PDF. Código `3c68daf`, arreglos de tests `e2a86e` y TS `e617542` en **`main`**; `effectivePendingFindings` proyecta solo el hallazgo multipunto vigente por taller/vehículo/categoría sin borrar diagnósticos ni inferir reparación; CP04/CP06 y bloqueo del PDF/cola usan ese estado. `not_checked` no limpia un problema, los «Frenos» genéricos independientes permanecen, y revisiones posteriores de atención reabren pendiente. [CI general #44774998665](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774998665) PASS Web/PWA y Android, 84 archivos tests PASS; [QA navegador #44774998785](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774998785) aún pendiente de resultado final al registrar. **No desplegado**, sin Supabase alojado, SQL/RLS/Storage/Auth/correos/Edge; Render LIVE anterior `f757daf2`. Validación de UI/descarga en orden real QA1234 tras una nueva autorización de deploy, y SEC-07/R05–R08 pendientes. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_PILOT_QA_04C_PENDIENTES_VIGENTES_20261120.md).

## BT-INS-PDF-01 · Render LIVE verificado 20/11/2026

El propietario autorizó el despliegue del PDF multipunto y confirmó **My Workspace** de Render. Servicio correcto `biomotors-taller-demo` (`srv-dbqe4quc6qcc73f275jg`) en workspace `tea-daum20gjo6nc73dndfqg`. Despliegue manual `dep-dc074fec6qcc73bafvag` de `main` commit `f757daf2` terminó **LIVE** 20/11/2026 16:16:23 UTC, sustituyendo el LIVE antiguo `d8d6ed99`. Permite "Vista previa PDF"/"Descargar borrador" de inspección multipunto dentro del detalle CP04; ambos se deshabilitan si hay guardados pendientes o notas provisionales. **No se cambiaron flags/env, Render service, Supabase, correo, Storage, SQL ni otros alojados.** Se publicó `main` completo, no solo un commit aislado; otros módulos siguen sujetos a sus gates. Código/CI previamente verificados [general](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455426) y [navegador sintético](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455300) SUCCESS. QA manual de PDF en dispositivo físico, revisión visual final, R05–R08, SEC-07 y piloto real pendientes. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_INS_PDF_01_20261120.md).

## BT-INS-PDF-01 · Informe multipunto PDF candidato (20/11/2026)

En `main` existe generación local PDF vectorial A4 desde hallazgos confirmados de la orden CP04, UI "Vista previa PDF" y "Descargar borrador", bloqueos por cola autosave y diagnóstico provisional, 34 componentes exactos e identidad de taller/vehículo/OT desde contexto autorizado; no envío, firma, emisión ni Storage. PDF creado con `pdf-lib` + fuente local DejaVu, con paginación para notas largas; renderer cargado mediante importación diferida solo en CP04 privado. Guardas de módulos actualizadas por **dos nombres exactos** bajo flag CP04, sin desactivar la frontera pública. Fallos CI comprobados y corregidos: TS2454 inicial (`44761078168`) y módulos CP04 no incluidos en whitelist (`44761522752`). CI de `bf131773` [general](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455426) **SUCCESS** (84/84 archivos; 6/6 PDF; TypeScript/Android/compilaciones privadas) / [navegador](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455300) **SUCCESS**: cinco tamaños, CP04, QA04B F01–F06, CP05, WebKit Linux y build R1 sintéticos; no declarar PASS prematuro. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_INS_PDF_01_20261120.md). Proyecto sin despliegue, sin backend alojado y sin envío real; SEC-07 y piloto Ignacio siguen BLOQUEADOS.

## BT-PILOT-QA-04B · Cierre QA sintético F01–F06 (20/11/2026)

Código candidato en `main`, 12 recorridos automatizados de Chromium (F01–F06 × 390/1366) con React CP03/CP04 y HTTP interceptado. [CI general #44757774410](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44757774410) **SUCCESS** (Web/PWA/Android), [QA visual #44757774392](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44757774392) **SUCCESS** y paso QA04B PASS. Incidentes QA04B-INC-01 (`Patente` ambiguo) y QA04B-INC-02 (`Resultado` no encontrado por locator) documentados en checkpoint; se corrigieron selectores de pruebas sin tocar lógica de aplicación. Commits `7a7f9808`, `4502b1a1`, `fb6ce866`, `df17b74c`. R05–R08, 14 pasos humanos, dispositivos físicos, Supabase alojado y SEC-07 **siguen pendientes**, piloto Ignacio no habilitado. [Checkpoint QA04B](./docs/checkpoints/CHECKPOINT_BT_PILOT_QA_04B_BROWSER_SYNTHETIC_20261120.md).

## BT-SEC-OPERATING-STANDARD-20NOV-01 · Seguridad profesional basada en fuentes y retiro de Google Drive (20/11/2026)

El propietario solicita investigar métodos y repositorios profesionales y decide que **Google Drive NO forma parte del roadmap futuro** de ByteTorque. NO autorizar nuevos workflows Drive ni OAuth, y no proponer Drive de nuevo. Conservar como historial sus fallos; `bt-encrypted-backup.yml`, `bt-provision-drive-folder.yml`, `bt-readonly-drive-diagnostic.yml` y `scripts/backup/cloud_backup.py` permanecen legado en repo pero **NO deben ejecutarse**. Su limpieza requiere cambio de código aislado, revisión CI y permiso. **Cifrado GPG se conserva**; se considera una copia externa en SSD/USB cifrado desconectado bajo decisión separada, no se configura otro proveedor. Investigación de PostgreSQL/Supabase, restic, pgBackRest, WAL-G, SOPS, Borg, CloudNativePG, OWASP y GitHub Actions documentada en [estándar](./docs/BT_SEGURIDAD_ESTANDAR_OPERATIVO_20261120.md) y [checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_ESTANDAR_Y_SIN_DRIVE_20261120.md). No confundir respaldos físicos WAL con acceso viable a Supabase administrado; plan de roles/schema/data oficial. **Prioridad inmediata única**: `BT_SEC07_EXTENSION_INVENTORY_20261119.zip` sobre el snapshot cifrado ya existente, sin nueva exportación. No hay restore certificado; `BT-PILOT-QA-04: A REPASAR`.

## BT-PILOT-QA-04A — Funcional, independiente de SEC-07 (20/11/2026)

**Contexto obligatorio:** [checkpoint QA04A](./docs/checkpoints/CHECKPOINT_BT_PILOT_QA_04A_CONFIRMACION_RECARGA_20261120.md) y [plan de preactivación funcional](./docs/BT_PREACTIVACION_FUNCIONAL_20261120.md). El chat de seguridad tiene asignado SEC-07 (snapshot actual cifrado, restore sin certificar por `EXTENSION_UNAVAILABLE`); **no tocar GPG/Drive/Docker/restauración, datos ni SQL de seguridad en trabajo funcional**.

**Trabajo QA04A realizado:** helper `src/official/confirmedWrite.ts`, pruebas sintéticas y mejoras CP03/CP04 que preservan confirmación e ID de clientes/vehículos/OT/inspecciones ante fallo posterior de lectura/listado, sin permitir reintentar por confusión. **Código `ee7651e8`** y [CI 44748658166](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44748658166) **PASS 721/721, 83 archivos, Web/PWA + Android**, [FLOW 44748658091](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44748658091) PASS. QA visual [44748658145](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44748658145) **SUCCESS**. Primer CI anterior falló por import no permitido `src/flow/confirmedWrite.ts`; se corrigió en `src/official/` sin modificar el verificador. **Render sigue `d8d6ed99` LIVE**, sin despliegue de estos candidatos, sin Supabase/Edge/Storage/Auth/planes/pagos/correos reales.

**Pendientes funcionales:** QA UI sintética de F01–F06, QA física PWA iPhone/Android, CP03/04 y CP05/06/COM/PLAN04B-C-D solo tras seguridad + aprobación particular; Ignacio piloto aún `BT-PILOT-QA-04: A REPASAR`.

---

## BT-SEC07-DOCKER-MANUAL-START-18 · Docker Desktop arrancado manualmente: aclaración retrospectiva (19/11/2026)

El usuario informó **después del cierre**: «Docker funcionó cuando abrí el programa». Se documenta como acción observada entre `DOCKER_ENGINE_NOT_READY` y `DOCKER_ENGINE: RUNNING` / `DOCKER_LINUX: OK`. **Corrección operativa:** abrir Docker Desktop manualmente y verificar disponibilidad del Engine. No confundir con imagen PG17 ausente, PostgreSQL de Windows desinstalado ni fallo permanente de WSL. Si reaparece, primero iniciar/comprobar Docker Desktop, sin reinstalar, resetear, hacer prune ni bajar imágenes a ciegas. No cambiar estado actual de snapshot: nuevo GPG creado, restore pendiente por `EXTENSION_UNAVAILABLE`. Primer paso 20/11: inventario offline de extensiones ya preparado, NO reexportar. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC07_CIERRE_JORNADA_20261119.md).

## BT-SEC07-CIERRE-19NOV-17 · Cierre documentado, 19/11/2026; retoma 20/11/2026

**HECHO:** el propietario reportó `NEW_ENCRYPTED_SNAPSHOT: OK_NEW_UNIQUE_DIRECTORY`, `POSTGRES_READONLY_TLS: OK`, metadatos roles cifrados. Diagnóstico offline sobre el MISMO archivo: `CIPHERTEXT_HASHES: OK`, `GPG_PROCESS: OK`, `DECRYPTED_STREAM: NONZERO`, `PG_RESTORE_PROCESS: FAILED`, `PG_RESTORE_ERROR_CLASS: EXTENSION_UNAVAILABLE`. **NO CERTIFICAR** recuperación, ni atribuir daño al respaldo. Inventario extensiones ZIP `BT_SEC07_EXTENSION_INVENTORY_20261119.zip` (SHA256 `7e3a0a2a16d5d92ec5a2155ff041ab63db5bf4e54aa6d635b834e76c280536f9`) **16/16 PASS solo en entorno asistente; ejecución Windows pendiente**. No repetir `pg_dump` ni restauraciones a ciegas. Mantener GPG histórico aislado, snapshot y manifest intactos; `BT-PILOT-QA-04: A REPASAR`. Ver [checkpoint de cierre](./docs/checkpoints/CHECKPOINT_BT_SEC07_CIERRE_JORNADA_20261119.md) y [reporte errores/soluciones](./docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md). **Mañana: un solo bloque de inventario offline**; ningún otro cambio de entorno antes. Docs [skip render], sin producción.

## BT-SEC07-EXTENSION-RESTORE-16 · Categoría PG restore extension unavailable; inventario offline preparado (19/11/2026)

Resultado real `GPG_PROCESS=OK`, `PG_RESTORE_PROCESS=FAILED`, `DECRYPTED_STREAM=NONZERO`, `PG_RESTORE_ERROR_CLASS=EXTENSION_UNAVAILABLE`; ciphertext/manifiesto inalterados. La etiqueta proviene de un *clasificador de stderr*, que reconoció patrón de extensión ausente; no identifica cuál o si es el único error del archivo. Supabase recomienda comprobar las extensiones de destino y utilizar una imagen compatible. No reexportar; **no instalar ni excluir extensiones a ciegas**. Paquete offline privado `BT_SEC07_EXTENSION_INVENTORY_20261119.zip` SHA256 `7e3a0a2a16d5d92ec5a2155ff041ab63db5bf4e54aa6d635b834e76c280536f9`; 16/16 pruebas locales PASS y GPG sintético/TOC simulado PASS. Solo lee índice del respaldo existente y extensiones .control del contenedor PostgreSQL 17 con `--network none`, sin base ejecutada, sin SQL ni salida privada. **Todavía no ejecutado en Windows**. Próximo: una acción agrupada: validar ZIP SHA, ejecutar 16 tests offline y hacer 1 inventario local. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). Restauración global/roles/Drive y `BT-PILOT-QA-04` pendientes.

## BT-SEC07-SNAPSHOT-CREATED-RESTORE-FAIL-15 · Backup actual cifrado creado, restore no certificado (19/11/2026)

El propietario devolvió `POSTGRES_READONLY_TLS: OK`, `ROLES_CATALOG: OK_METADATA_ONLY`, **`NEW_ENCRYPTED_SNAPSHOT: OK_NEW_UNIQUE_DIRECTORY`**, `RESTORE_FULL_FAILED_IN_ISOLATION`, roles SQL NOT_INCLUDED, FULL_PROJECT NOT_CERTIFIED, exit `3`; GNUPGHOME restaurado. **Existe carpeta de snapshot actual** con ciphertext GPG/manifiesto/hashes; conserva ese estado y no repitas `pg_dump`. Fuente v2 exacta revisada: `decrypt_to_command` envía stderr de GPG y `docker exec pg_restore` a DEVNULL y `isolated_restore` mezcla rc/bytes; no se conoce causa de fallo. Nueva herramienta privada **solo para un ensayo de restore del snapshot ya creado**: `BT_SEC07_RESTORE_DIAGNOSTICO_20261119.zip` SHA `e0c951ed5ecbc47c0b7c58f84db537b5c3f1d2788f024963bae746c741b511d7`, 19/19 tests offline PASS; exige hash del orquestador anterior, detecta exclusivamente manifest con estado fallido, SHA de GPG, anillo histórico, Docker local Linux; transmite descifrado por pipe a Docker sin red y clasifica stderr por etiquetas fijas sin publicarlo. **No implica que restore vaya a funcionar; el fallo puede depender de objetos administrados Supabase, versión, GPG o SQL, hoy no determinado.** No se hizo nueva conexión a Supabase para esta investigación ni se ejecutó el diagnóstico real Windows todavía. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). **Piloto A REPASAR**.

## BT-SEC07-DOCKER-ENGINE-RECOVERED-14 · Motor Docker operativo e imagen PG17 presente (19/11/2026)

El propietario completó un bloque local de preflight: `BT_SEC07_DOCKER_CONTEXT: LOCAL`, `BT_SEC07_DOCKER_ENGINE: RUNNING`, `BT_SEC07_DOCKER_LINUX: OK`, `BT_SEC07_PG17_IMAGE: PRESENT`, `BT_SEC07_DOCKER_DIAGNOSTIC: COMPLETE`. Esto **resuelve** el anterior estado transitorio `DOCKER_ENGINE_NOT_READY`. `PRESENT` solo representa `docker image inspect` en una de las etiquetas permitidas, **no todavía prueba que el contenedor PostgreSQL 17 arranque**. Siguiente paso agrupado: validar exacto `docker run --rm --network none --pull=never ... postgres --version`, hashes del v2 y origen Docker local antes de ejecutar una sola vez el orquestador v2 autorizado con `GNUPGHOME` histórico temporal, con restauración de variable siempre. No descargar imagen si ya es usable; no repetir 43 tests offline ni tocar v1. No hay nuevo backup/restore aún demostrado. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). **BT-PILOT-QA-04 A REPASAR**.

## BT-SEC07-DOCKER-ENGINE-13 · Bloqueado en arranque Docker local (19/11/2026)

PowerShell real: `BT_SEC07_PREFLIGHT: FILES_AND_GPG_OK` y `BT_SEC07_STOP: DOCKER_ENGINE_NOT_READY`; el comando verificó destino/context local, pero **no** recibió versión del daemon. No significa que falten imágenes ni que Docker esté desinstalado. No hubo `docker pull`, `pg_dump`, nueva copia, restore ni conexión Supabase. Próximo: un solo preflight seguro de Desktop/WSL y motor Linux que puede **iniciar Docker Desktop** si es necesario, sin reiniciar, borrar contenedores ni seguir a producción automáticamente. Fuente Docker Desktop CLI: https://docs.docker.com/desktop/features/desktop-cli/ . [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). **SEC-07 y piloto pendientes**.

## BT-SEC07-DOCKER-PG17-12 · Imagen PostgreSQL 17 para ensayo Docker (19/11/2026)

GPG histórico aislado seleccionado e identificador de destinatario confirmado en Windows, pero el bloque autorizado **no llegó a Supabase**: `BT_SEC07_STOP: DOCKER_PG17_IMAGE_NOT_FOUND_NO_AUTO_PULL`, `BLOQUE_EXIT_CODE: 2`, `GNUPGHOME` restaurado. En código `docker_image` exige `postgres:17`, `postgres:17-bookworm` o `postgres:17.12-bookworm` más prueba de versión 17, **sin diferenciar ausencia de imagen de Docker Engine inactivo**. No asumir causa más precisa. Próximo bloque único: validar Engine y etiquetas y, con Engine sano, pull explícito condicional de imagen oficial `postgres:17.12-bookworm` solo si es necesaria; verificar versión antes de una sola invocación v2 con el keyring histórico. No reinstalar PostgreSQL Windows ni cambiar producción. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). Backup nuevo y restore no creados; **BT-PILOT-QA-04: A REPASAR**.

## BT-SEC07-GPG-ISOLATED-MATCH-11 · Clave GPG reconciliada con almacén histórico (19/11/2026)

Windows offline informó `GPG_HOME_MODE: CUSTOM`, `SECRET_KEY_RECORDS: FOUND`, `PUBLIC_RECIPIENT: MATCH`, `SECRET_RECIPIENT: MATCH`, `V2_MATCHER: MATCH`, `DIAG_EXIT_CODE: 0`; `GNUPGHOME` previo restaurado. La **clave privada correspondiente existe en el anillo aislado histórico**, no en el predeterminado. Diagnóstico NO descifró respaldo ni probó passphrase. No es necesario paquete v3 ni repetir QA v2 43/43. El orquestador v2 ya auditado consulta GPG sin `--homedir` para identidad/descifrado; usar `GNUPGHOME` temporal desde PowerShell, verificar hashes ZIP/archivos y ejecutar una sola vez conforme al bloque previamente autorizado de nuevo snapshot + restore aislado. Próximo: registrar etiquetas `BT_SEC07_*` tras esa ejecución; no continuar a ciegas si falla. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). **BT-PILOT-QA-04: A REPASAR**.

## BT-SEC07-GPG-HISTORICAL-ISOLATED-10 · Pista histórica GPG recuperada (19/11/2026)

El checkpoint local de 19/11 ya confirma existencia de `%LOCALAPPDATA%\ByteTorque-GPG-Prueba\gnupg-aislado` (contenido privado sin comprobar). Diagnóstico reciente usó **DEFAULT**, donde no hay `sec`; no analizó el anillo aislado. Próximo bloque **offline focalizado**: reutilizar el diagnóstico GPG ya hash-validado en Windows solo contra ese directorio histórico, mediante `GNUPGHOME` temporal restaurado al finalizar, sin descifrar/importar/exportar claves ni conectar Supabase. Aún **no se ejecutó** esta nueva comprobación. No cambiar GPG predeterminado permanentemente ni afirmar recuperación. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). SEC-07 / piloto pendientes.

## BT-SEC07-GPG-CUSTODIA-09 · Evidencia clave privada ausente del anillo GPG predeterminado (19/11/2026)

Diagnóstico offline Windows: SHA OK, 14/14 pruebas, encabezado GPG antiguo con destinatario único; `--list-keys` coincide con la clave pública, pero `--list-secret-keys` obtuvo **0 registros** en el `GNUPGHOME` predeterminado. V2 falló por **ausencia de material privado en el anillo consultado**, no por un defecto de su parser. No implica pérdida global de clave: histórico SQL antiguo se había descifrado/restaurado en entorno distinto o estado previo. **No iniciar backup nuevo ni cambiar llaves**; siguiente bloque únicamente auditoría offline de custodia y localización autorizada sin imprimir IDs/huellas/rutas/correos, luego recuperar el plan de restauración. [Checkpoint SEC-07](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). El error original de pg_dumpall no se resolvió; producción intacta, **BT-PILOT-QA-04: A REPASAR**.

## BT-SEC-BACKUP-RECOVERY-ERR08-GPG · GPG offline antes de cualquier reintento (19/11/2026)

Windows v2 devolvió `QA_OFFLINE_OK`, `HISTORICAL_RECIPIENT_KEY_NOT_UNIQUELY_PRESENT`, exit `2`. Fuente v2: único destinatario de ciphertext antiguo pero 0 o múltiples huellas primarias reconocidas desde `gpg --list-secret-keys`; **no prueba pérdida de clave privada** ni otro fallo de PostgreSQL. Detenido antes de prompt/producción, sin backup nuevo. Se preparó script autónomo privado `BT_SEC07_GPG_DIAGNOSTICO_OFFLINE_20261119.py` (SHA256 `b6d1d14a30b6402aba5406974cfa049163dcb7098d7fb33e651fc9c6c95ec508`), 14/14 selftests y prueba GPG sintética real PASS; solo metadatos y etiquetas fijas, no decrypt ni claves privadas. Próximo: ejecutar UNA comprobación GPG local offline y discriminar ausencia en anillo vs parser v2; NO repetir exportación remota ni generar claves. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). **BT-PILOT-QA-04: A REPASAR**.

## BT-SEC-BACKUP-RECOVERY-ERR07-V2 · Corrección de prerrequisito tras primer intento Windows (19/11/2026)

El primer intento de respaldo nuevo autorizado se detuvo **antes de Supabase**: 35/35 QA Windows PASS; `BT_SEC07_STOP: HISTORICAL_MANIFEST_MISSING`, exit `2`. Nuestro programa v1 exigía indebidamente el manifiesto de un intento histórico incompleto; el exportador anterior solo lo escribía después de roles fallidos. **No hubo backup nuevo ni restauración.** V2 en ZIP privado `BT_SEC07_RESPALDO_ACTUAL_CORREGIDO_20261119.zip`, SHA256 `9ee61398d67cd7e811f211c70a449878009b36271fce61082479a09db7a6042d`, sustituye esa dependencia por identificación verificada de clave a partir de paquete OpenPGP antiguo + clave secreta local, sin descifrar ni imprimir material. Rechaza identidad múltiple/oculta/no coincidente; si manifiesto existe se coteja. **43/43 QA sintética PASS y 3 pruebas GPG reales con datos sintéticos PASS** en contenedor, todavía no Windows. Próximo: una sola ejecución de v2 en nueva carpeta mediante mismo permiso del propietario, sin ejecutar v1 otra vez; observar códigos antes de actuar. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). No producción cambiada, **BT-PILOT-QA-04 A REPASAR**.

## BT-SEC-BACKUP-RECOVERY-PREP-07 · Paquete de respaldo nuevo autorizado pero todavía NO ejecutado (19/11/2026)

Autorización explícita para exportar base **actual** cifrada en directorio nuevo y ensayar restauración local Docker sin red. Preparado ZIP privado `BT_SEC07_RESPALDO_ACTUAL_20261119.zip`, SHA256 `0fd76eaa482777a8b920dbdfe32ef3900024ae0ce4c654f88e8f431784610e5a`, 35/35 pruebas offline PASS (incluido ZIP extraído). No usar `pg_dumpall` otra vez; se respalda `pg_roles/pg_auth_members` solo como **metadatos cifrados**, no SQL de roles, y `pg_dump` de base a GPG. Intenta `pg_restore` en Docker network none con placeholders NOLOGIN para políticas; no certifica recuperación integral de Supabase. **NO se ha ejecutado en PC todavía ni creado snapshot actual**. No se subieron scripts a GitHub público. Próximo: ejecutar una sola instrucción PowerShell de ZIP + QA + backup/restore, interpretar códigos fijos, no repetir a ciegas. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). **BT-PILOT-QA-04: A REPASAR**.

## BT-SEC-07-WIN-QA-06 · Prueba Windows verificada (19/11/2026)

El usuario devolvió `INTEGRIDAD_ZIP: OK`, `Ran 20 tests in 0.881s`, `OK` y `PRUEBAS_EXIT_CODE: 0`. Así, el paquete candidato SEC-07 pasó **20/20 pruebas offline sintéticas en Windows real**, además de 20/20 en el contenedor. No valida todavía binarios GPG/PostgreSQL reales, permisos NTFS, exportación de roles, backup nuevo ni restore actual; paquete no activado, originales intactos según operación de prueba. La falla PowerShell `else` separado se solucionó con `& { ... }`, sin repetir pruebas de base. Próximo: plan único de roles + esquema + datos conforme a Supabase, cifrado seguro, posterior recuperación aislada; autorización separada antes de cualquier operación remota. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_07_LOCAL_CANDIDATE_20261119.md). **BT-PILOT-QA-04: A REPASAR**.

## BT-SEC-07-BLOQUE-CANDIDATO-05 · Candidatos y QA offline (19/11/2026)

Recibidos dos scripts originales sin credenciales embebidas aparentes, inspección AST completa. El original fija pooler de sesión Supabase `5432`; no cambiar. Se preparó ZIP descargable privado de conversación con candidatos `bytetorque_respaldo_local_SEC07_CANDIDATO.py`, `ByteTorque_Diagnostico_Roles_SEC07_CANDIDATO.py`, `test_BT_SEC07_offline.py` y README. **20/20 pruebas sintéticas PASS** sin Supabase/PostgreSQL/GPG reales, incluidos origen vacío, salida parcial, err producer/GPG, timeout, staging, hashes, preservar originales y stderr oculto. ZIP SHA256 `60b001e1a44be1cb9dbbecb0d64dd1ae46f0a8b569c58f092436ff7d6d152f35`; original programa local no se reemplazó. No ejecutar `backup` ni diagnóstico contra Supabase sin permiso: **causa del exit 1 con 75B stderr sigue NO DETERMINADA**. [Checkpoint SEC07 del bloque](./docs/checkpoints/CHECKPOINT_BT_SEC_07_LOCAL_CANDIDATE_20261119.md). Solo documentación en repo público, sin código local ni secretos. **BT-PILOT-QA-04: A REPASAR**.

## BT-SEC-07-BLOQUES-GRANDES-04 · Trabajo agrupado (19/11/2026)

El propietario pidió auditorías por bloques grandes, no preguntas/comandos unitarios reiterativos. La inspección local encontró una referencia a pooler en línea 23 y puerto 5432 en línea 24; **solo son literales, no prueba de conexión efectiva**. Modo sesión 5432 está documentado como opción válida por Supabase; no alterar endpoint sin evidencia. El exportador local revela dos problemas de validación (no verifica bytes en claro; puede conservar ciphertext inválido), mientras que **causa del exit 1 de pg_dumpall sigue NO DETERMINADA**. Próximo bloque: recibir/revisar ambos scripts .py **sin credenciales**, proponer parche candidato y pruebas sintéticas agrupadas; no volver a ejecutar dump ni alterar producción. [Checkpoint SEC-07](./docs/checkpoints/CHECKPOINT_BT_SEC_07_ROLES_DIAGNOSTICO_FOCALIZADO_20261119.md). Sin backups ni despliegue; **BT-PILOT-QA-04: A REPASAR**.

## BT-SEC-07-POOLER-CODIGO-03 · Inspección de endpoint (19/11/2026)

La inspección AST del propietario devolvió `ENDPOINT_EN_CODIGO: POOLER`, `INSPECCION_LOCAL_OK`. **Solo evidencia un literal de pooler en el código**: no confirma el host/puerto de conexión real ni la causa del fallo de roles. Pendiente clasificar de forma segura el puerto de `DB` sin imprimir la cadena; sesión 5432 y transacciones 6543 tienen usos diferentes. No repetir `pg_dumpall` ni alterar backups/secretos. [Checkpoint actualizado](./docs/checkpoints/CHECKPOINT_BT_SEC_07_ROLES_DIAGNOSTICO_FOCALIZADO_20261119.md). Sin cambios en producción.

## BT-SEC-07-LOCAL-DIAG-02 · Seguimiento de roles (19/11/2026)

En Windows se verificaron por ruta absoluta PostgreSQL 17.12 (cuatro utilitarios); `SEC-15` solucionado sin reinstalación ni PATH. Se localizó el exportador local y se creó candidato independiente del diagnóstico, sintaxis OK y clasificación sintética 8/8. En dos conexiones autorizadas, prueba TLS previa OK pero `pg_dumpall --roles-only --no-role-passwords` falló; último código `1`, stderr capturado `75 bytes`, sin patrones reconocidos. **No se conoce la causa ni se debe repetir la operación sin plan nuevo y autorización**. El stderr fue descartado y no permite análisis retrospectivo. Respaldos GPG antiguos intactos; rol GPG sigue inválido (0 bytes); recuperación integral actual pendiente. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_07_ROLES_DIAGNOSTICO_FOCALIZADO_20261119.md). Sin producción modificada; **BT-PILOT-QA-04: A REPASAR**.

## Auditoría integral de seguridad y errores — 19/11/2026

**Primero revisar:** [informe retrospectivo y bitácora SEC-01…SEC-17](./docs/BT_SEGURIDAD_AUDITORIA_RETROSPECTIVA_20261119.md) y [checkpoint BT-SEC-REVIEW-01](./docs/checkpoints/CHECKPOINT_BT_SEC_REVIEW_20261119.md). Regla permanente en `AGENTS.md`: **todo error nuevo debe registrar causa confirmada frente a hipótesis, solución, evidencia real, impacto, pendientes y condición de reintento**, sin repetir pruebas ciegas ni destruir originales. 

**Estado ya demostrado:** PostgreSQL 17 **sí fue instalado en Windows el 17/11** y el PATH de aquella sesión incluyó `C:\\Program Files\\PostgreSQL\\17\\bin`. No aparecer en PATH del PowerShell de hoy NO significa desinstalación. Docker 29.9.3 encontrado. `database.dump.gpg` 89.091 bytes descifrado y restauración real SQL aislada de siete tablas verificada; `roles.sql.gpg` 151 bytes descifra a **0 bytes**: **inválido**. Drive no tiene recibo de respaldo externo; la provisión `44094695940` **se ejecutó y falló**. Backup local **14:41 UTC** anterior a migraciones CP05, Creador y 04A: se necesita otro backup del estado **actual** y validación de recuperación, con consentimiento, sin sobrescribir el viejo.

**Supabase observado solo lectura:** 8 migraciones, 12 públicas RLS, 8 privadas RLS+FORCE; faltan validar avisos de contraseñas filtradas y controles internos de seis RPC. Render visual anterior LIVE; no habilitar candidatas de email/Storage. Siguiente instrucción PC: comprobar exclusivamente por ruta absoluta `C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dumpall.exe` y `psql.exe` con `--version`, NO instalar ni editar PATH global.

# ByteTorque — agent.md | Entrada obligatoria para todos los chats/agentes

## Protocolo permanente: ANTES de instruir y DESPUÉS de trabajar

**Para CADA solicitud de instrucciones o trabajo relacionada con ByteTorque**, todo chat (ChatGPT, Codex u otro agente) debe consultar la **versión vigente en `main`** de: **(1) `AGENTS.md`, (2) este `agent.md`, (3) `roadmap.md` y (4) el checkpoint relevante más reciente de `docs/checkpoints/`**. Leer el estado real del repo (HEAD) y las pruebas/activaciones comprobadas antes de prescribir comandos, prompts, pasos o modificaciones. No asumir que hay que repetir etapas porque no aparecen en el chat nuevo; comprobar continuidad. Si no se puede consultar estos documentos, avisar y no sugerir acciones sensibles basadas en suposiciones.

**Al terminar CUALQUIER trabajo** (función, corrección, prueba, documento, seguridad, operación autorizada o intento bloqueado), actualizar **`roadmap.md` y un checkpoint** con lo realizado y **lo que falta**; actualizar **este `agent.md`** con el enlace/estado del último checkpoint y **`AGENTS.md` si nace una regla permanente**. Registrar commit en `main` y comunicar commit, CI, publicación/flags, tareas pendientes y siguiente instrucción. Esto es obligatorio también al mudar de chat. Los cambios documentales por sí solos no autorizan Render/Supabase/Drive; usar `[skip render]` cuando proceda.

## Seguridad / respaldo — NO empezar de cero

**El 17/11/2026 ya se hizo el cifrado GPG local en Windows.** En `BT-Backups` se informaron `database.dump.gpg` (89.091 bytes) y `roles.sql.gpg` (151 bytes). El primero fue descifrado con éxito (`BASE_DESCIFRADO_OK`, `ARCHIVO_POSTGRES_OK`, `CATALOGO_OK`).

**SÍ se ejecutó una RESTAURACIÓN SQL en entorno Docker aislado y hubo verificación funcional positiva**: `BT_DATOS: RLS_ACTIVA=7 POLITICAS=16`, `BT_REGISTROS: TABLAS=7 FILAS=25`, `BT_PARIDAD: SIETE_TABLAS_COINCIDEN`. **No confundir alcance de la validación (siete tablas) con ausencia de restauración.** Esto NO demuestra todavía recuperación integral de todo Supabase/Auth/Storage/Edge/roles/secretos. El respaldo de roles de 151 bytes sigue sin validarse (`ROLES_ORIGEN_FALLA_NO_CLASIFICADA`). El flujo automático GitHub → Google Drive es **otro trabajo**: detenido por autorización OAuth `drive.file`, sin recibo completo de exportación/restauración externa.

**Próximo paso en PC:** reutilizar y comprobar el backup/keyring existente, resolver específicamente roles y cerrar la cobertura faltante. **No volver a generar claves, exportar, cifrar ni restaurar la misma parte ya verificada sin una razón concreta y documentada**; no asumir que la copia SQL por sí sola protege Storage ni configuración externa.

- **Última comprobación GPG recibida (19/11/2026):** `roles.sql.gpg` dio `ROLES_DESCIFRADO_EXIT=0`, `ROLES_LINEAS=0`, `ROLES_CARACTERES=0`. Indica salida de texto aparentemente vacía; **no confirma todavía cero bytes de plaintext** ni causa del fallo de exportación. Siguiente: medir bytes descifrados localmente sin guardar/mostrar SQL. [Evidencia](./docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md).

- **Último control local comprobado (19/11/2026):** [BT-SEC-LOCAL-INVENTORY-01](./docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md) — archivos `database.dump.gpg` (89.091 bytes), `roles.sql.gpg` (151 bytes) y directorio GPG presentes en el PC del propietario; descifrado del archivo de roles todavía **no ejecutado en este control**. Próximo paso: analizar roles sin mostrar SQL ni rehacer cifrado.

- **Diagnóstico DEFINITIVO 19/11/2026:** el mismo archivo original `roles.sql.gpg` (151 bytes) **se descifra exitosamente, pero a 0 bytes**: `ROLES_DESCIFRADO_EXIT=0`, `ROLES_BYTES_DESCIFRADOS=0`. **No es backup válido de roles**. Conservarlo intacto. El `pg_dumpall` histórico falló con `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` pese a `POSTGRES_TLS_OK`, causa no identificada. Próximo control: versiones locales de `pg_dumpall` y `psql`; después diagnóstico sanitizado solo del productor, no de toda la base. [Evidencia](./docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md).

- **Último diagnóstico de herramientas (19/11/2026):** en el PowerShell del propietario `pg_dumpall.exe` y `psql.exe` resultaron `NO ENCONTRADO EN PATH`. **NO inferir que están desinstalados.** Revisar existencia/rutas/versiones bajo `Program Files\\PostgreSQL\\*\\bin` o Docker; no instalar ni editar `PATH` por defecto. Luego diagnóstico seguro del productor de roles con el programa Python existente, sin volcar SQL ni sobrescribir GPG. [Evidencia](./docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md).

## Fuentes y continuidad

- **Fuente obligatoria de reglas:** [AGENTS.md](./AGENTS.md).
- **Estado vivo y pendientes:** [roadmap.md](./roadmap.md).
- **Checkpoint de seguridad y regla de continuidad más reciente:** [BT-SEC-AGENT-RESTORE-01](./docs/checkpoints/CHECKPOINT_BT_SEC_AGENT_RESTORE_20261119.md).
- **Último checkpoint de desarrollo funcional:** [BT-COM-01D](./docs/checkpoints/CHECKPOINT_BT_COM_01D_CIERRE_DOCUMENTAL_R2_20261118.md).
- **Antecedente del backup manual:** [BT-SEC-BACKUP-CONTINUIDAD](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_CONTINUIDAD_20261119.md).

No mantener reglas divergentes: ante conflictos verificar evidencia, corregir fuentes y conservar los checkpoints históricos. No compartir ni subir a GitHub, chats o capturas datos privados, GPG private key, contraseñas, tokens ni dumps.
