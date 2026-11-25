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

## BT-EXP-01 — archivo recuperable del expediente final, candidato local

**Implementación y validación locales autorizadas y completadas; sin push/activación.** Resultado
para Ignacio: desde el historial de la visita, recuperar el PDF original emitido
de la cotización y las copias archivadas del informe de trabajos y constancia de
entrega, individualmente o como paquete; conservar revisión, vínculos e integridad
tras cambiar de sección o abrir una sesión nueva. No presentar una regeneración
actual como si fuera el documento originalmente archivado.

Situación comprobada por lectura focalizada del código y checkpoints, sin auditoría
ni acceso productivo:

| Prioridad del propietario | Base existente reutilizable | Pendiente real |
| --- | --- | --- |
| Emisión de cotizaciones | CP05, `documentClient`, motor/paquete Edge y revisión inmutable; QA histórica aprobada | Autorización/QA de alcance alojado; no reconstruir emisión |
| Descarga de PDF | `src/historial/archiveDownload.ts`, documentos CP05 y validación de integridad | Confirmar recuperación con la infraestructura autorizada; no afirmar uso productivo nuevo |
| Archivo y recuperación documental | `server/com/closingArchiveCandidate.ts` y contratos `ClosingArchivePorts` | Falta adaptador concreto de persistencia; los usos actuales del motor son contratos/tests |
| Ejecución de trabajos | `FlowLive02Panel`, cliente RPC y SQL LIVE-02 candidatos | Activación de infraestructura separada; no rehacer formularios/importes |
| Historial cliente/vehículo | CP06: `repository.ts`, `VehicleHistory.tsx`, evidencia por visita | Integrar lectura del archivo final en ese historial existente |
| Informe/entrega final | `executionPdf`, `finalPdf`, `ClosingReviewPanel` y ZIP local de tres PDF | Archivo duradero y recuperación de esos bytes, no solo descarga/generación local |
| Envío autorizado | Revisión de correo CP05 y candidatos COM de revisión/estado | Proveedor, permisos y autorización independientes; mantener envío externo OFF |

Entrega local propuesta, coherente y completa:

1. Conectar el motor de cierre existente con un adaptador backend candidato que
   derive taller, revisión, ejecución y entrega desde persistencia autorizada,
   sin aceptar rutas/importes del navegador. Reutilizar motor y esquemas candidatos;
   preparar únicamente lo que falte, sin aplicar SQL/Storage/Edge alojados.
2. Archivar/recuperar originales de los tres documentos con manifiesto inmutable,
   SHA-256, lectura de comprobación, idempotencia y protección de dependencias.
3. Integrar el expediente recuperable en el historial CP06/R2 existente, con errores
   y reintentos claros, sin regenerar un PDF histórico para sustituir su original.
4. Validación consolidada local con datos ficticios: otra sesión, revisión anterior,
   permiso revocado, aislamiento por taller, interrupción/reintento y archivo incompleto.
   Sin repetir SEC07, CP04, selector CP05 ni reconstruir módulos ya aprobados.

No incluye envío real, pagos, respaldos, credenciales, cambios productivos ni
activar LIVE-02/CP06. Su infraestructura y aceptación requerirían autorizaciones
posteriores. Emisión/descarga/ejecución que ya existen se reutilizan como dependencias;
no se anuncian como nuevas implementaciones ni como activadas en producción.
La aprobación posterior del propietario autoriza esta implementación local.
Quedan pendientes revisión/aceptación de la entrega, push/CI, respaldo actualizado,
SQL/buckets/Edge y activación bajo permisos específicos; no se presume producción.

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

## Administración de registros — implementación local BT-REG-01

**Candidata publicada y corregida en `9484ed79`, CI correspondiente SUCCESS. NO activada en producción.**
Al cerrar la publicación/despliegue del selector CP05, la próxima entrega tratará
clientes, vehículos, órdenes y borradores de cotizaciones.

Criterios de la próxima especificación:

- Mostrar las dependencias y el impacto antes de confirmar cada acción.
- Diferenciar archivo reversible, recuperación y eliminación controlada; definir
  la política de eliminación definitiva antes de implementarla, sin borrado automático.
- Preservar vínculos cliente → vehículo → OT → cotización y sus identificadores;
  impedir registros huérfanos o cascadas que destruyan historiales.
- Conservar diagnósticos, revisiones emitidas y documentos históricos; distinguir
  un borrador eliminable de una revisión inmutable o un documento ya archivado.
- Recuperar registros y relaciones de forma consistente en los selectores y vistas,
  manteniendo aislamiento por taller y permisos de los roles autorizados.
- Validar las acciones y su recuperación con datos ficticios antes de cualquier
  activación productiva. No ejecutar cambios de datos, SQL o migraciones por este registro.

La orden BT-REG-01 autoriza la implementación local descrita en el checkpoint.
Implementación y validaciones locales aprobadas; publicación y CI cerradas.
Quedan pendientes respaldo actualizado/verificado desde el PC personal, permiso
de SQL alojado, deploy OFF, activación y QA/aceptación productivas. CP04 y SEC07 continúan cerrados; Auto-Deploy OFF
y repositorio público temporal según decisión del titular.

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

## CP05 correo — corrección TS focalizada (23/11/2026)

Primer CI del commit `47f57860`: fallo TS2554 en tres llamadas de prueba
`src/cp05/cp05.test.ts` al nuevo argumento obligatorio de revisión previa.
Se corrigieron únicamente fixtures sintéticas con revisión exacta y se agregó
caso de rechazo por revisión ausente. No se altera el permiso de servidor,
no se activa correo ni Supabase; verificar CI del nuevo commit antes del Render.

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

## BT-COM-01 — descarga conjunta del cierre (23/11/2026)

- [x] BT-FLOW-LIVE-02 `1efdceb` CI principal y visual: **SUCCESS**; no desplegado.
- [x] CP05: emisión QA y revisión visual aprobadas por el propietario.
- [x] Diseño y código candidato: ZIP local de exactamente tres PDF, usando
  01 CP05 archivado y SHA-256 verificado, 02 informe declarado y 03 constancia
  declarada; bloqueado sin las tres evidencias y flags privados existentes.
- [x] Prueba puntual del contenedor ZIP (lectura externa y CRC) en entorno local.
- [x] Propietario autoriza publicación del candidato en `main` y CI existente.
- [ ] Verificar el resultado final de la CI integrada de BT-COM-01.
- [ ] Desplegar manualmente sólo después de S4 y habilitar LIVE-02/CP06.
- [ ] Completar S4 integral, recuperación documental después de nueva sesión,
  correo único transaccional autorizado y validación de Ignacio para dar por
  cerrado CP05/BT-COM-01 en el piloto.

No se activan correos ni proveedores. **El ZIP es descarga local, no comprobante
tributario, firma digital ni constancia física verificada.**

## BT-FLOW-LIVE-02 — publicación de código autorizada (23/11/2026)

- [x] Revisión visual CP05 **aprobada por propietario**; despliegue
  `dep-dc26hok9v7es73ch95u0` LIVE (base `e0fee642f41516968023c52a14fc2583f2bb0636`).
- [x] Código funcional candidato previo LIVE-02 reutilizado; mejora focal:
  lectura visible de partidas/no realizadas y notas recuperadas desde servidor,
  validación de recibos de escritura, lectura del snapshot y rótulos claros.
- [x] Autorización específica para **un commit de código/docs en `main`**;
  CI principal de GitHub debe verificar TypeScript, pruebas y compilación privada
  LIVE-02 sin desplegar.
- [ ] Resultado de CI de este nuevo commit por comprobar tras publicación.
- [ ] S4 integral (respaldo cifrado/restauración aislada) sigue pendiente;
  requiere PC personal, no se presume aprobado.
- [ ] Bajo autorización separada tras S4, aplicar SQL LIVE-02 aditivo con gate
  privado apagado; luego habilitar sólo taller QA, publicar flag LIVE-02 de Render
  manualmente, confirmar aprobación → partidas → OT lista → entrega declarada →
  logout/login → consulta CP06 con datos ficticios.
- [ ] Prueba de Ignacio con datos reales y correos externos sólo en etapas
  posteriores, no incluidos en esta entrega.

**Sin cambios Supabase/Render, auto-deploy OFF, correo OFF.**
La aprobación/entrega del cliente aquí son sólo declaraciones del operador;
no firma digital, factura ni evidencia independiente de reparación.

---

## CP05 — Corrección focalizada de CI visual (23/11/2026)

Incidente CP05-CI-VISUAL: la CI de interfaz pública del commit `420f28f` falló en el paso CP05 móvil al intentar importar `src/cp05/pdf.ts` mediante una URL de desarrollo Vite `/@fs/` desde `vite preview` (bundle estático). La solución sustituye **solo el PDF simulado del backend en `tests/harness/cp05BrowserFixture.cjs`** por bytes PDF válidos generados con `pdf-lib` del proyecto, con hash/tamaño y descarga idéntica en los mismos recorridos. El PDF de borrador continúa usando el renderizador ByteTorque real; sin alterar componentes productivos, Edge, datos, permisos ni PDF oficial. No se atribuye éxito hasta ver las CI del nuevo commit y su despliegue Render autorizado.

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

## CP05 — interfaz solo QA preparada para Render (23/11/2026)

Activación manual Edge CP05 QA confirmada en GitHub (workflow SUCCESS), función `bt-cp05-documents` ACTIVE v4 con JWT; correos OFF. El frontend ahora exige simultáneamente `VITE_BT_CP05_DOCUMENTS_ENABLED=true` y `VITE_BT_CP05_PILOT_WORKSHOP_ID` igual al taller autenticado antes de mostrar la emisión archivada; `VITE_BT_CP05_EMAIL_ENABLED=false`. Backend conserva su propia validación estricta del taller y RLS. Cambio limitado a interfaz, prueba enfocada y variables Render; no reactivar emails ni expandir el piloto; S4 integral pendiente. Un deploy del frontend no equivale a la primera emisión real validada.

---

## CP05 — Activación de prueba QA preparada (23/11/2026)

Edge `bt-cp05-documents` v1 activa con JWT obligatorio; tablas CP05, política de Storage restrictiva y RPC de recuperación alojados. Emisión y correos OFF. Se incorpora guardia obligatoria de servidor por UUID de taller piloto, que falla cerrado sin configuración válida, con un test enfocado; y un workflow de activación manual de un solo taller con despliegue de código guardado primero en modo OFF. Su creación/publicación NO ejecuta la activación ni modifica Supabase o Render. El workflow CP05 manual apagado existente permite regresar a OFF. S4 integral pendiente: no emitir documentos de clientes reales ni confundir QA alojada con recuperación certificada. No se repiten migraciones.

---

> **CP05 · 22/11/2026 — ENTREGA LOCAL CONSOLIDADA, SIN PUBLICAR:** reutilizados OT/cliente/vehículo, borradores SQL, partidas/IVA, PDF R3, snapshots y archivo candidatos. Completadas conciliación sin repetir RPC tras guardado confirmado, recuperación de emisiones completadas con archivo original íntegro y consulta histórica detallada. 66 pruebas CP05, PostgreSQL aislado (persistencia/concurrencia/permisos/recuperación), paquete Edge, builds público/privado y navegador/historial 390/1366 PASS. Incidentes FUNC-01/02 y TEST-01…04 documentados, sin repetir multipunto ni S4I. S4 integral y autorización específica siguen bloqueando SQL/Storage/Edge/emisión reales; correo OFF, sin push/deploy. [Checkpoint único y lista exacta](docs/checkpoints/CHECKPOINT_BT_CP05_ENTREGA_FUNCIONAL_20261122.md).

## Continuidad consolidada - main publicado, despliegue pendiente (22/11/2026)

GitHub main verificado en efc87801caefe1e501805e46d5733f72507f43d0: el multipunto oficial YA ESTA IMPLEMENTADO y PUBLICADO en codigo.47/47 pruebas y A4 unica corresponden a la evidencia del entorno desarrollador y al checkpoint BT-INS-PDF-02; no se repitieron ni modificaron aqui. Despliegue efectivo de esta revision NO verificado; no confundir publicacion con disponibilidad productiva. Las notas inferiores que dicen sin push son historicas.

S4I integrado anteriormente en0bb0ea59d78d:11 archivos,CI general/oficial SUCCESS,sin deploy. Auth/CORS se conservan. S4 integral PARCIAL;respaldo manual operativo cada2dias;automatizacion R6 cancelada. Mantener Render OFF hasta autorizacion especifica; After CI Checks Pass es propuesta futura,no permiso para desplegar.

No reimplementar,investigar o probar el multipunto. Siguiente publicacion propuesta SOLO documental,tras revision y autorizacion de staging/commit/push;sin ramas nuevas,SQL,flags,Storage,Edge,correo o cambios productivos. Nunca copiar carpetas o documentos privados completos desde ZIP sobre main.

---

> **BT-INS-PDF-02 · 22/11/2026 — IMPLEMENTADO/PROBADO LOCAL, NO PUBLICADO:** nuevo resumen multipunto exactamente 1 A4 vertical, 34 componentes/estados reales, diseño de referencia con logos oficiales. Notas completas en expediente; campos ausentes «—», no inventados. 47 pruebas pertinentes, TypeScript, builds público/CP04, preview=descarga en 1366/390 y geometría PDF PASS; regresión autosave CP04 11 resultados PASS. Incidentes PDF02-INC-01…04 (fuente, celda, comprobador, mock TS) resueltos y documentados. Base main `0bb0ea5`; sin ramas nuevas, push/deploy ni cambios alojados. Pendiente aprobación visual del propietario y autorización expresa de publicación; SEC07 S4H separado. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_INS_PDF_02_DISENO_OFICIAL_A4_20261122.md).

## SEC07 S4H - continuidad y publicacion controlada (22/11/2026)

S4 integral PARCIAL. Respaldo manual PostgreSQL OPERATIVO; uso por el titular cada 2 dias, sin programacion automatica ni borrado. No reactivar S5C-R6 ni repetir pruebas de respaldo aprobadas.

Preparacion local S4H: guarda de autoridad para clientes pendientes tras logout/cambio de taller y CORS exacto para dominios canonicos. 24 casos nuevos PASS mediante adaptador Node sin red; Deno no disponible y runtime Edge pendiente. Esto no revoca access JWT copiados ni acredita cambios remotos. Mantener identidad confirmada, membresias activas, permisos y RLS.

Leer [procedimiento S4H](docs/recovery/SEC07_S4H_INTEGRACION_SEGURA.md). Historicos inferiores conservados; sus instrucciones de automatizacion/exportacion no reactivan autorizaciones. Solo main, nunca push/deploy/migraciones automaticos. Render On Commit requiere pausa autorizada y verificada antes de publicar; skip render es defensa adicional. No publicar material privado ni copiar el ZIP completo.

---

> **BT-SEC07-S4A-RESTORE-DEPENDENCY-OPEN (21/11/2026):** v04 S2-R11, SHA PASS, Docker local aislado, PGDMP + GPG integrity PASS; pg_restore a BD temporal se detuvo `RESTORE_CLASS SUPABASE_DEPENDENCY_OR_ROLE_MISSING` / `ISOLATED_RESTORE_NOT_COMPLETE`. Es clasificación de regex amplísima (rol/extensión/función/tipo/relación); no significa comprobación específica. **S2 ESTRUCTURAL PASS, S4 RESTORE FULL PENDING**. Próximo S4B un único reintento local de restauración con clasificación segura de PRIMER error, sin mostrar stderr/SQL/objetos, después adaptar laboratorio Supabase17 según dependencia confirmada. No borrar v04 ni manifiesto, no tocar prod. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S4A_RESTORE_DEPENDENCIA_PENDIENTE_20261121.md).

> **BT-SEC07-S2-R11-PASS_BACKUP_AND_TOC (21/11/2026):** archivo cifrado nuevo v04 `PGDMP_OFFSET_ZERO`, `GPG_INTEGRITY PASS`, Docker Linux PG17 `TOC PASS`, SHA256 PASS, manifest CREATED, `ENCRYPTED_FINALIZED`, `SOURCE UNCHANGED`, sin producción. **S2 PASS estructural en PC**; respaldo aún NO probado restaurable. Causa inmediata BOM UTF8 de 3 bytes (R8) y solución no-BOM en PS5.1 comprobada R10/R11; `ProcessStartInfo.StandardInputEncoding` no existe .NET Framework. S4 siguiente: restauración real completa, local y aislada sin red/puertos/volúmenes persistentes, diagnóstico sanitario de dependencias Supabase. S3 roles/Storage/Auth/Edge/Render también pendiente, sin exigir USB ni afirmar recuperación pérdida PC. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R11_BACKUP_CIFRADO_VALIDADO_20261121.md), [incidentes](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

> **BT-SEC07-INC-USO-LOGS-POWERSHELL-20261121:** el usuario pegó etiquetas de salida `BT_SEC07_S2_R10_*` en PowerShell; `CommandNotFoundException` no modifica por sí mismo respaldo ni base. R10 mantiene `PASS_TOC_NO_NEW_FILE`; R11 NO demostrado ejecutado. Solución explicada: Ctrl+C y ejecutar sólo el código R11 entre `& {` y `}`; logs esperados son ejemplos para comparar, **NO comandos**. Prevención: avisos explícitos junto a cada bloque. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). S2-R11 crear v04 sin BOM y validar sigue pendiente.

> **BT-SEC07-S2-R10-WIN-TOC-PASS-BOM-FIX (21/11/2026):** `DOTNET_PROPERTY UNAVAILABLE` + `STDIN UTF8_NO_BOM_AT_START` + `SOURCE_HEADER BOM3_PGDMP` + `GPG_INTEGRITY PASS` + `LINUX_TOC PASS` + `SOURCE_SHA256 UNCHANGED` + `PASS_TOC_NO_NEW_FILE`. La anomalía BOM de 3 bytes fue el bloqueo inmediato; con entrada sin BOM + omisión en memoria PostgreSQL17 Linux lee TOC del v03. Causa exacta de inserción inicial no aislada, R9 API incompatible PS5.1 confirmada. No existe v04 partial R9, archivos unchanged, producción desconectada. **SIGUIENTE R11:** emitir ciphertext nuevo v04 limpio sin BOM, probar header+GPG+Linux TOC+hash/manifest; luego S4 restauración real aislada. No cerrar S2 ni afirmar restore full antes de R11/S4. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R10_LINUX_TOC_PASS_20261121.md), [incidentes](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

> **BT-SEC07-S2-R9-LOCAL-ERROR-IN-STANDARDINPUTENCODING (21/11/2026):** R9 STOP `CREATE_CLEAN_CIPHER / LOCAL_ERROR_UNCLASSIFIED`, sin conectar prod, v03 preservado. Documentación Microsoft y issue .NET Framework confirman que `ProcessStartInfo.StandardInputEncoding` NO existe en PS5.1; guion R9 inválido para ese entorno; causa del STOP muy probable, pendiente de marcador PC. Corregir sin reexportar: usar `Console.InputEncoding UTF8Encoding(false)` alrededor de `Process.Start` y luego restablecer encoding, no propiedad inexistente. Primero validar TOC Linux de v03 descartando BOM en memoria y sin crear otro ciphertext; posteriormente v04 limpio con comprobación real. Respetar PC-only y respaldos previos; [registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

> **BT-SEC07-S2-R8-BOM-ORIGIN-ISOLATED (21/11/2026):** ORIGINAL v02 y DERIVED v03 `GPG PASS`, `MAGIC_OFFSET 3`, `PREFIX_TYPE UTF8_BOM`, 1KB–1MB, producción NO CONNECTED, files UNCHANGED. BOM reaparece tras R6 eliminarlo: explica todos los fallos MAGIC/Toc anteriores; probable causa fuente `StreamWriter StandardInput` con BOM por defecto .NET PS5.1, pendiente confirmación por corrección. Próximo R9: crear v04 cifrado por pipe configurando `StandardInputEncoding=UTF8Encoding(false)` en GPG y Docker; comprobar PGDMP offset0, GPG integrity, TOC PG17 aislado /dev/shm, hash + manifiesto. No reexportar DB ni usar claves antiguas. Solo certificación estructural si PASS; restauración integral S4 todavía pendiente. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

> **BT-SEC07-S2-R7-ABORT-MAGIC-CHECK-20261121:** `CLEAN_ARCHIVE_MAGIC_INVALID` en la copia derivada v03 ANTES de validar con Docker, producción no conectada, archivos intactos. No afirmar que Linux pg_restore falló, porque nunca recibió archivo. Original R5/R6 cabecera PGDMP en offset 3. Derivado NO empieza PGDMP. S2 abierto, no reexportar ni corregir a ciegas. Única siguiente comprobación: offsets de firma PGDMP y clase de 3 bytes iniciales (UTF8_BOM/other) en original+derivado, íntegramente en memoria, sin salida de datos ni nuevas escrituras. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). 

> **BT-SEC07-S2-R6-FAILED-TOC-AFTER-PREFIX-3 (21/11/2026):** Windows `PREFIX_BYTES 3`, `PGDMP_FOUND`, `ORIGINAL_DECRYPT PASS`, `NEW_ENCRYPTION PASS`, `GPG_READBACK PASS`; `PG_RESTORE_LIST_FAILED` clase OTHER. Dos archivos cifrados candidatos preservados; ninguno validado. Eliminación de prefijo 3 bytes NO resolvió TOC. Ya no repetir pipeline reparación/reexport; capturar clasificación técnica del stderr real de pg_restore desde `clean_v03`, sin exponer datos ni archivos descifrados en disco; si estructural no recuperable, rediseñar captación pg_dump. Ver [incidente](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). No reintroducir USB; PC-only. Main docs [skip render].

> **BT-SEC07-S2-R5-PGDMP-WITH-PREFIX (21/11/2026):** `GPG_EXIT ZERO`, `GPG_STATUS DECRYPTION_OKAY`, `GPG_INTEGRITY CONFIRMED`, `CONTENT_TYPE PGDMP_WITH_PREFIX`, `BETWEEN_1KB_AND_1MB`, sin conexión producción y archivo intacto. Hallazgo: prefijo antes de firma PGDMP explica rechazo header de pg_restore, pero su ORIGEN sigue no confirmado. S2 no certificada. Siguiente: construir desde `.partial` una nueva copia CIFRADA con bytes anteriores a PGDMP retirados por STREAM, preservar original, exigir GPG + pg_restore TOC + hash, manifest; no ejecutar pg_dump de nuevo. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). Solución solo cerrada si PASS.

> **BT-SEC07-S2-R4-NOT-PGDMP (21/11/2026):** `ARCHIVE_MAGIC NOT_PGDMP` desde GPG del `.partial`; preservado, sin contacto producción. Descartar promoción/manifiesto, TOC FAIL explicado por cabecera no compatible (no se sabe si plaintext es vacío, SQL u otro). Falta causa del contenido, no inferir corrupción o subsanar con comandos repetidos. Próximo: diagnóstico read-only local UNA VEZ de longitud descifrada, clase de firma y estado GPG, sin imprimir datos; después decidir corrección del pipeline. [INC-S2-02](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). S0 y S1A PASS, S2 aún NO VALIDADO.

> **BT-SEC07-S2R3-TOC-EXIT-NONZERO (21/11/2026):** R3 verificó `.partial FOUND_UNIQUE`, `GPG_EXIT ZERO` pero `TOC_EXIT NONZERO` → `PG_RESTORE_TOC_EXIT_FAILED`; ninguna restauración ni promoción/manifiesto. Hipótesis 'pipe cierra temprano' NO confirmada. Próximo diagnóstico ÚNICO local: firma `PGDMP` de plaintext en memoria y clase segura de stderr, sin repetir pg_dump ni cambiar producción. Manual PG17 admite stdin por defecto; no señalar stdin sin pruebas. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). Solución actual pendiente.

> **BT-SEC07-S2-R2-CIPHER-PASS-TOC-STOP (21/11/2026):** ejecución Windows `CLIENT_VERIFY_FULL_PASS`, `POSTGRES17_VERIFIED`, `READ_ONLY_PASS`, `ENCRYPTED_DUMP PASS`; DETENIDO en `ARCHIVE_TOC_READBACK_FAILED`, sin evidencia TOC ni manifiesto. El archivo `.dump.gpg.partial` debe conservarse. Hipótesis: pg_restore --list sale temprano y cierra stdin causando IOException con GPG stdout. NO inferir corrupción; siguiente: continuar sin DB ni pg_dump con lectura completa GPG, TOC validado y SHA, luego publicar archivo+manifest. [Registro abierto](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). Docs [skip render], main, no deploy.

> **BT-SEC07-INC-S2-01-PREFLIGHT-READ_ONLY-STOP (21/11/2026):** primer S2: `TLS_READ_ONLY_CONNECT` + `IDENTIDAD_O_SOLO_LECTURA_INCORRECTA`; psql terminó exit0 pero condición compuesta de BD/default_transaction_read_only/versión devolvió no PASS; no hay dump S2 ni modificación prod. Certificado nombre descargas no es causa. Hipótesis PGOPTIONS no propagado por pooler (NO comprobada). Próximo bloque debe usar `BEGIN TRANSACTION READ ONLY`, confirmar `transaction_read_only`, db, versión separadamente y solo entonces `pg_dump` por stream GPG nuevo. Registrar corrección comprobada en `AGENTS.md`, `agent.md`, `roadmap.md` y [registro de incidentes](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md) cuando pase. No nuevos diagnósticos repetitivos, no exigir USB; S0/S1A PASS.

> **BT-SEC07-PC-ONLY-ACCEPTED-S2-NEXT (21/11/2026):** dueño no tiene dos USB y **eliminó ese requisito** expresamente; no requerir 2 copias externas/3-2-1 para progresar. S0 PASS; S1A generó clave nueva, secret export protegido e import/descifrado canary PASS_LOCAL_ONLY, S1 cerrado sólo para alcance PC. S2: pg_dump PG17 real cifrado por stream TLS verify-full y read-only. S3 componentes/roles, S4 restore aislado, S5 automatización local y retención sin pretensión de DR contra pérdida PC, S6 hardening. Riesgo residual pérdida del PC aceptado, documentado en [checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S1B_PC_SOLO_DECISION_S2_REAL_20261121.md). Main docs [skip render].

> **BT-SEC07-S1A-LOCAL-PASS-S1B-EXTERNO-PENDIENTE (21/11/2026):** Windows confirmó clave nueva Ed25519/Cv25519, export privado S2K, canary cifrado, import a GNUPGHOME vacío, decrypt comparado = `PASS_LOCAL_ONLY`. Dos soportes externos físicos, prueba fría y frase de paso independiente pendientes; S1 global no cerrado. Incidentes iniciales: directorio existente y timeout GPG; bug PS `$home`/ `$HOME` corregido; finalmente PASS. [Checkpoint S1A](docs/checkpoints/CHECKPOINT_BT_SEC07_S1A_RECUPERACION_CRIPTOGRAFICA_LOCAL_PASS_20261121.md). Avanzar S1B, luego S2 real sin usar respaldos/llaves antiguas; docs [skip render] main.

> **BT-SEC07-S0-WINDOWS-PASS-S1-ACTIVO (21/11/2026):** titular ejecutó único PowerShell S0 y compartió PASS: 8/8 carpetas nuevas, ACL y propietario restringidos, NotContentIndexed, tres documentos; legacy intacto, secretos no creados, producción no conectada. Evidencia [Checkpoint S0](docs/checkpoints/CHECKPOINT_BT_SEC07_S0_ESTRUCTURA_ACL_WINDOWS_PASS_20261121.md). Siguiente S1 generación de nueva identidad GPG separada, canary con keyring vacío y dos custodias externas probadas. S1/S2/S3/S4/S5/S6 aún no certificados. GitHub reporta repo public: nunca subir secretos/DB. Solo docs `[skip render]`, main sin despliegue.

> **BT-SEC07-NUEVA-BASE-SEGURIDAD-REAL-ORDENADA-CP79 (21/11/2026):** titular ordenó **NUEVA generación desde cero** para claves/custodia/carpetas/backups/restauración/automatización; no usar respaldos, claves, manifest o scripts antiguos como dependencia, **no borrar legados** ni reiniciar código de la app. [Plan maestro](docs/BT_SEC07_NUEVA_BASE_SEGURIDAD_REAL_20261121.md) y [CP79](docs/checkpoints/CHECKPOINT_BT_SEC07_REINICIO_SEGURIDAD_REAL_ORGANIZADO_20261121.md). S0 estructura y ACL; S1 nueva llave GPG, custodia externa y canary recovery; S2 NUEVO pg_dump producción TLS verify-full cifrado; S3 roles/owners/ACL/RLS/Auth/Storage/Edge/Render; S4 restore aislado sin red desde copia nueva, datos/controles A-B; S5 3-2-1 + automatización y retención; S6 hardening prod por permisos separados. Auditoría conectada solo lectura: Supabase ACTIVE_HEALTHY PG17.11, 6 RPC definer con controles code revisados, 8 RLS no-policy privadas, Auth leaked password disabled; no cambios productivos. **No ejecutar repetición de diagnósticos CP55-78**, ni declarar respaldo seguro antes de S4/S5. PowerShell completo INLINE SIEMPRE CP66, solo main docs [skip render].

> **BT-SEC07-R3-PRIVATE-FILE-ARMORED-MESSAGE-NOT-KEY-78 (21/11/2026):** resultado usuario `PRIVATE_META_EXTENSION OTHER_OR_HIDDEN_EXTENSION`, `HEADER ASCII_ENCRYPTED_MESSAGE`; los primeros 160B son `BEGIN PGP MESSAGE`, no export directo de clave privada. No GPG/import/decrypt, no modificar backup. Coincidencia de pública .asc con manifest CP77 PASS; la clave privada sigue sin ubicarse/verificarse. Próximo: localizar export auténtico de clave privada o identificar contenedor cifrado con nueva autorización. CP67 cipher hashes match parcial, CP72 decrypt STOP, restore NO. PowerShell siempre íntegro en chat CP66. [CP78](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_PRIVATE_FILE_IS_ARMORED_MESSAGE_NOT_KEY_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-PUBLIC-ASC-PRIMARY-MATCH-PRIVATE-PGP-HEADER-PENDING-77 (21/11/2026):** propietario reportó `PUBCHECK PRIMARY_MATCH` entre `.asc` pública y manifest, sin GPG import/decrypt. Archivo `.pgp` señalado como privado produjo STOP CP75 y requirió «Todos los archivos» pese a filtro *.pgp: investigar extensión/encabezado real. PowerShell **inline** lee máximo 160 bytes de archivo seleccionado, muestra solo clases de extensión/paquete, no contenido ni secretos. Esperar `BT_SEC07_PRIVATE_META_*`; no repetir descifrado/restore. CP67 hash consistencia backup parcial PASS; CP72 GPG decrypt STOP. [CP77](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_PUBLIC_ASC_PRIMARY_MATCH_PRIVATE_PGP_HEADER_PENDING_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-KEY-FILE-FORMAT-STOP-PUBLIC-ASC-FOUND-76 (21/11/2026):** CP75 Windows STOP_KEY_FORMAT_OR_READ con clave denominada privada `.pgp`, usuario encontró pública `.asc`; las extensiones por sí solas no resuelven tipo real. Siguiente seguro: comprobación fingerprint **pública .asc** con manifest del 19/11 sin importación/descifrado ni lectura del `.pgp`, sólo PowerShell inline; según resultado diferenciar correspondencia manifest vs archivo secreto. NO repetir inspector real GPG/TOC ni Docker. [CP76](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_KEY_FILE_FORMAT_STOP_PUBLIC_ASC_FOUND_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-PRIVATE-KEY-FILE-FINGERPRINT-READONLY-AUTHORIZED-75 (21/11/2026):** dueño localizó archivo de clave privada original y autorizó cotejar su huella **sin importarla ni descifrar backup**. PowerShell 100% inline usa GPG `--show-keys` en GNUPGHOME TEMP aislado, compara principal/subkey `fpr` con `recipient_fingerprint` manifest 19/11 sin exponer metadatos, ni claves, ni contraseñas. `sec/ssb` son registros, no prueba de clave desbloqueable. Linux prueba sintética GPG PASS; **Windows y archivo real sin resultados todavía**. Requiere consentimiento nuevo para importar a almacén aislado o descifrar/TOC. No DB/SSL/restore. [CP75](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_PRIVATE_KEY_FILE_FINGERPRINT_READONLY_AUTHORIZED_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-GPG-METADATA-NO-SECRET-KEYS-LISTED-74 (21/11/2026):** propietario ejecutó diagnóstico local metadatos: `MANIFEST RECOGNIZED`, `RECIPIENT DECLARED`, `GPG FOUND`, `SECRET_KEYS NONE_LISTED`, `RECIPIENT_MATCH NO_EXACT_MATCH_IN_LIST`, **sin descifrado ni contraseña**. Keyring Windows consultado no tiene secreto listado, hipótesis principal para CP72 STOP; no demostrar pérdida total/corrupción. Próximo: localizar y contrastar fingerprint de clave privada original en otro perfil/PC/almacén offline; importar/descifrar requieren consentimiento nuevo, jamás crear clave nueva para recuperar antiguo dump. CP67 SHA manifesto parcial PASS, TOC/restore NO. [CP74](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_METADATA_NO_SECRET_KEYS_LISTED_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-GPG-METADATA-DIAG-AUTHORIZED-73 (21/11/2026):** usuario autorizó SOLO metadatos de manifest/GPG keyring, no segundo descifrado. Bloque PowerShell 100% inline lee `manifest.json`, valida proyecto e inventario, busca huella destinataria declarada contra claves privadas listadas con `gpg --list-secret-keys` **sin imprimir nombres/fingerprints**. No abre .gpg, no pide contraseña ni llama pg_restore/Docker/Supabase. MATCH o NO_MATCH no diagnostican por sí solos Pinentry/clave realmente usable. Resultado Windows pendiente. CP67 ciphertext SHA PASS parcial; CP71 decrypt STOP/TOC real aún pendiente. [CP73](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_METADATA_DIAG_AUTHORIZED_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-REAL-TOC-STOP-GPG-DECRYPTION-FAILED-72 (21/11/2026):** primer intento real GPG/TOC CP71: package VERIFIED, manifest parcial SHA MATCH, GPG y pg_restore17 PRESENT, **GPG return code no cero => STOP_GPG_DECRYPTION_FAILED**. stderr y estado exacto ocultos por diseño; no certificar TOC ni afirmar corrupción. Docker se abrió después, irrelevante en pipeline nativo. Investigar **por qué GPG no descifra**: disponibilidad de clave privada destinataria, agente/Pinentry y método de cifrado, sin exponer material ni reintentar sin nuevo permiso. El viejo exporter usa clave pública, nuevo backup 19/11 podría usar otro. CP67 consistencia local sigue PASS. Restore aislado, roles/ACL/RLS, backups nuevos, SSL pendientes. Regla PowerShell inline CP66. [CP72](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_REAL_TOC_STOP_GPG_DECRYPTION_FAILED_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-GPG-TOC-REAL-LOCAL-RUN-AUTHORIZED-71 (21/11/2026):** autorización expresa dueño para **UNA lectura local** de backup 19/11 + GPG keyring + `pg_restore --list -`, sin restaurar ni conectarse a DB. ZIP CP69 SHA `dd6e5b7851039eefbc5d01c3245899fa9f13e689f402b645829984bebbc24a58` revalidada y 37/37 sintéticos; ejecutor PowerShell completo INLINE CHAT, no repetir fixtures. **Resultado GPG real y TOC PENDIENTE**. Próximos hitos separados: restauración DB aislada con roles/ACL/RLS y luego nuevos backups/automatización; SSL aparte. [CP71](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_TOC_REAL_LOCAL_RUN_AUTHORIZED_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-GPG-TOC-PREP-V1-WINDOWS-SYNTHETIC-PASS-70 (21/11/2026):** ZIP verificado en PC Windows, 37/37 sintéticos PASS; GPG, pg_restore reales, backup real y keyring **NOT_ACCESSED/NOT_CALLED**, `REAL_TOC_WINDOWS: NOT_CERTIFIED`. Siguiente con permiso nuevo específico: inspector GPG→TOC real read-only local (manifest parcial 19/11, keyring), sin SQL DB ni restore. Luego restore aislado/owners/ACL/RLS/roles y nuevos respaldos/automatización, permisos separados. No repetir tests CP55/68/69. PowerShell siempre inline CP66. [CP70](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_TOC_PREP_V1_WINDOWS_SYNTHETIC_PASS_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-REAL-GPG-TOC-READER-PREP-V1-69 (21/11/2026):** preparación Hito1 sin leer backup real: ZIP privado `BT_SEC07_R3_GPG_TOC_READER_PREP_V1_20261121.zip` 11554B SHA `dd6e5b7851039eefbc5d01c3245899fa9f13e689f402b645829984bebbc24a58`, 37/37 sintéticos PASS pre/post ZIP. PowerShell inline solo para test en Windows sin GPG/pg_restore reales. GPG→TOC real requiere nueva autorización de uso local del keyring histórico y ciphertext del 19/11, y herramienta aún sin Windows real test. No repetir V4/CP55/68. Restore aislado, roles/owners/ACL/RLS, backup completo/automatización y SSL siguen pendientes. [CP69](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_REAL_GPG_TOC_READER_PREP_V1_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-GPG-TOC-SYNTHETIC-HANDOFF-68 (21/11/2026):** propietario autorizó PREPARAR solo material ficticio GPG/TOC. CP68 ZIP `BT_SEC07_R3_GPG_TOC_SYNTHETIC_GATE_20261121.zip` SHA `1c6dfc5111202d2c2f6d97c913a433acbf60ef1a4766dcd3a8d3fc3a59015adb`, 6475B, **59/59 tests PASS antes y después ZIP**; modelo de respuestas, sin GPG real, pg_restore, SQL, keyring o backup real. CP55 auditor TOC ya tiene 40 sintéticos; no repetir. Paso siguiente exige permiso independiente para descifrado/TOC real aislado; posterior restore aislado + roles/ACL/owners/RLS y luego creación/automatización de nuevos respaldos. CP67 backup real parcial SHA manifest consistente ≠ restaurabilidad. SSL independiente pendiente. PowerShell siempre inline según CP66. [CP68](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_TOC_SYNTHETIC_HANDOFF_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-MANIFEST-V4-WINDOWS-CIPHERTEXT-PASS-67 (21/11/2026):** Usuario reportó ZIP V4 VERIFIED, 69/69 sintéticos PASS Windows, manifest elegido, `PARTIAL_BACKUP_DECLARED`, proyecto/backup_id MATCH, ciphertext sizes MATCH y hashes SHA256 MATCH_MANIFEST_ONLY, `PASS_LOCAL_CIPHERTEXT_CONSISTENCY_ONLY`. **Consistencia local del respaldo cifrado PASS**, **autenticidad externa/descifrado/restore NO CERTIFICADOS**. Roles catalog sólo metadatos; owners/ACL/grants/SQL roles, recuperación integral y SSL upstream aún pendientes. Siguientes puertas separadas y con autorizaciones nuevas: referencia de hash independiente, inspección GPG/TOC aislada, restore aislado/roles ACL, compatibilidad SSL. PowerShell completo en chat (CP66); no repetir V4 ni cambiar respaldos. [CP67](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_V4_WINDOWS_CIPHERTEXT_PASS_20261121.md). Docs `[skip render]`.

> **BT-SEC07-POWERSHELL-INLINE-RULE-V4-AUTHORIZED-66 (21/11/2026):** REGLA permanente: bloques ejecutores PowerShell completos siempre en el chat, .ps1 opcional. Propietario autorizó V4 local read-only para manifest/ciphertext del 19/11, recibió bloque directo con hash ZIP exacta y preflight 69 tests; aún SIN resultados de Windows real. No GPG/SQL/restore/SSL. [CP66](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_POWERSHELL_INLINE_RULE_V4_AUTHORIZED_20261121.md). Docs [skip render].

> **BT-SEC07-R3-MANIFEST-PARTIAL-V4-OFFLINE-READY-65 (21/11/2026):** autorización SOLO para preparar V4 de consistencia parcial. ZIP `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V4_20261121.zip` SHA `9fea99fb10eab18e6ba2ee78b51ad78e54b82f407f8fe7d45d284bc237fbdd0f` 8720B + PowerShell `BT_SEC07_EJECUTAR_V4.ps1` SHA `a69899bb3adb9c514d8eef0b9325ca3ed80bc53a0dd49db83933fe1c8148985e` 2361B. `full_project_backup=false` ahora permite SOLO SHA/tamaño local y reporte `PARTIAL_BACKUP_DECLARED`; campo ausente/no bool STOP. 69/69 tests sintéticos Linux PASS antes/después ZIP; **Windows real V4/no backup real accesado, pendientes consentimiento separado**. No se certifica restauración ni roles, owners/ACL o SSL end-to-end. [CP65](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_PARTIAL_V4_OFFLINE_READY_20261121.md). Solo docs `[skip render]`.

> **BT-SEC07-R3-WINDOWS-V3-INCOMPLETE-DECLARATION-STOP-64 (21/11/2026):** Windows real V3 ZIP VERIFIED, 53/53 tests sintéticos PASS, STOP_INCOMPLETE_BACKUP_DECLARED, STOP; se revisó código exacto ZIP: bloqueo en `full_project_backup is True` antes de tamaños/SHA; **no fallo de hash ni prueba de corrupción**, tampoco restore. Marcador `BACKUP_SELECTED:NO` se emite antes del selector. No alterar manifest a true. Siguiente propuesta sujeto a autorización separada: verificar consistencia limitada de ciphertext y hashes aunque manifest declare parcial, informándolo como tal; mantener inventario owners/ACL/roles/TLS/restore pendiente. No GPG/SQL/SSL/deploy. [CP64](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_WINDOWS_V3_INCOMPLETE_DECLARATION_STOP_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-WINDOWS-V3-LAUNCHER-DELIVERED-63 (21/11/2026):** carpeta más reciente del 19/11 contiene `manifest.json`, `database.dump.gpg` (118.105B), `roles.catalog.json.gpg` (675B). Descargables privados ZIP V3 SHA `07316406274f1b2662e5a5978fb039b6751ab35cd58acb6227b466667308b484` y ejecutor `BT_SEC07_EJECUTAR_V3.ps1` SHA `f10991a2600cb0ba6f1214ab3525a0c22e5b61af646700f3c8c7598179e6771c` entregados; ZIP 53/53 offline PASS otra vez, Windows y backup real **pendientes**. Próximo: dueño ejecuta PowerShell y envía solo `BT_SEC07_*`, sin reintentar ante STOP. Roles catálogo no reemplaza SQL, ACL/owner/restore pendientes. [CP63](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_WINDOWS_V3_LAUNCHER_DELIVERED_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-GPG-SIZES-PARTIAL-62 (21/11/2026):** carpeta Windows de backup del 17/11: **2 archivos, 89.242 bytes total**; captura de un archivo OpenPGP de **151 bytes**, pero nombre no visible (no adjudicar a roles sin confirmar). En Propiedades también «0 bytes en disco», no equivalente a 0 contenido lógico. Sin `manifest.json` en vista, integridad/restore no certificados. Próximo: confirmar tamaño individual/nombre de ambos ficheros en Propiedades y buscar visualmente backup posterior con manifest. No GPG/SQL/restore/SSL ni repetir V3 a ciegas. [CP62](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_SIZES_PARTIAL_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-GPG-EXTENSIONS-CONFIRMED-SIZES-PENDING-61 (21/11/2026):** nueva captura Windows confirma los dos nombres completos `database.dump.gpg` y `roles.sql.gpg`, fecha 17/11 11:42, sin `manifest.json` visible. Extensión GPG ≠ prueba de cifrado ni restore; tamaños no observados. Próximo paso: leer solo Tamaño en Propiedades y reportar cifras, buscar después copia más nueva con manifest. No GPG/SQL/backup/SSL/despliegue. [CP61](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_EXTENSION_CONFIRMED_SIZES_PENDING_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-MANIFEST-NOT-VISIBLE-WINDOWS-60 (21/11/2026):** propietario abrió selector V3 en carpeta `bytetorque-local-20261117T1441...`, cero JSON visibles; filtro solo "Manifiesto JSON"/"JSON". Explorador muestra `database.dump` y `roles.sql` modificados 17/11 11:42, sin `manifest.json` visible. Extensiones finales pueden estar ocultas; no conocer tamaño/hashes ni afirmar corrupción. Siguiente: activar extensiones de archivo y vista Detalles para Tipo/Tamaño, comprobar visualmente si existen respaldos posteriores, sin GPG/SQL/restore/manifest nuevo. No repetir ejecución V3 a ciegas, Windows QA no certificada. [CP60](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_NOT_VISIBLE_WINDOWS_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-MANIFEST-WINDOWS-V3-PACKAGE-59 (21/11/2026):** ante ausencia de ZIP V2 original verificable, entregado ZIP V3 nuevo `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V3_20261121.zip`, SHA `07316406274f1b2662e5a5978fb039b6751ab35cd58acb6227b466667308b484`, 7334B; 53/53 tests sintéticos Linux PASS y 53/53 extraído; **Windows real V3 aún no probado**. Próxima puerta: SHA exacto y 53 tests en PC; después, manifest elegido manualmente y solo lectura de `.gpg`, sin GPG/SQL/cambios. STOP sin repetir; evidencia sólo `BT_SEC07_*`. R3 owners/ACL, SSL upstream, restore integral pendientes. [CP59](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_WINDOWS_V3_PACKAGE_20261121.md). Docs `[skip render]`.

> **BT-SEC07-R3-CHAT-CONTINUITY-V2-WINDOWS-PENDING-58 (20/11/2026):** Cambio de chat con `main` CP57/HEAD `1be3b7f` corroborado. V1 Windows tuvo STOP, **no selector/backup leído**; V2 ZIP `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V2_20261120.zip` SHA `950651ceed451e4156847e3af8b02cdb888f3856a479467e3905cb6ddcab92fe`, 53/53 tests sintéticos anteriores, **Windows real V2 pendiente**. Ejecutar V2 local con hash y tests preflight, luego manifest read-only si PASS, STOP sin reintento; solo marcadores `BT_SEC07_*`. Repositorio reportado `public` por GitHub, sin cambiar configuración; revisar política con propietario. Sin GPG/SQL/restore/SSL/deploy. [CP58](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CHAT_CONTINUITY_V2_WINDOWS_PENDING_20261120.md). Docs `[skip render]`.

> **BT-SEC07-R3-MANIFEST-WINDOWS-V2-REGRESSION-FIX-57 (20/11/2026):** El propietario ejecutó ZIP V1 con SHA correcto, preflight Linux-48 no pasó en Windows: **15 failures, 5 errors, 2 skipped; TESTS STOP; NO SELECTOR, NO BACKUP REAL ABIERTO**. INC-57: comparación cruzada de `Path.lstat` y `os.fstat` de Windows sobre inode/ctime demasiado estricta, falso STOP por herramienta. V1 obsoleto. ZIP privado **V2** `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V2_20261120.zip`, SHA256 `950651ceed451e4156847e3af8b02cdb888f3856a479467e3905cb6ddcab92fe`, 10777B, **53/53 tests PASS antes/después ZIP**, regresiones Windows simuladas, runner solo etiquetas sanitizadas; Windows V2 aún NO probado. Usuario puede verificar paquete nuevo en Downloads, test sintético y SOLO después selección manual read-only del manifest reciente, sin GPG ni conexión Supabase. STOP sin reintentar. R3 owners/ACL/GRANT, recuperación integral y SSL upstream siguen pendientes; piloto A REPASAR, Drive excluido. [CP57](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_WINDOWS_V2_REGRESSION_FIX_20261120.md). Docs `[skip render]`.

> **BT-SEC07-R3-MANIFEST-READONLY-PREP-56 (20/11/2026).** Usuario autorizó PREPARAR comprobador local read-only de identidad/hash/manifest para respaldo cifrado existente, sin abrir archivos reales en el asistente. Inspeccionado exportador original Library: manifest `project_ref`, `backup_id`, `files=[{name,bytes,sha256}]`. ZIP privado `BT_SEC07_R3_MANIFEST_READONLY_20261120.zip`, 8751B SHA256 `d052e3fdc05e8896bbf1f6b8c6bf48c27b2fffb5b7d51432f8077927278ac4a8`, **48/48 tests sintéticos PASS antes/después de ZIP**. Herramienta permite elegir manualmente manifest.json en PC, comparar project-ref/backup_id/carpeta y tamaños+SHA256 de .gpg listados, sin GPG/decrypt/SQL/red/subprocess/escritura. Éxito SOLO consistencia, no autenticidad independiente ni restore; `roles.catalog.json.gpg` no son roles SQL, antiguo roles.sql.gpg inválido. **Windows/backup real aún PENDIENTE**, STOP sin modificar originales. Siguiente recibir solo marcadores BT_SEC07_*, posteriormente autorización específica para GPG histórico+TOC real y QA ACL/owners; R2 solo estructura, SSL enforcement OFF/end-to-end pendiente, piloto A REPASAR, Drive excluido. [CP56](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_READONLY_PREP_20261120.md). Solo docs main [skip render].

> **BT-SEC07-R3-TOC-OFFLINE-AUDITOR-READY-55 (20/11/2026).** Usuario autorizó SOLO preparar auditor TOC con fixtures falsos, sin abrir/descifrar copia real, sin llave GPG ni Supabase. ZIP privado `BT_SEC07_R3_TOC_OFFLINE_AUDIT_20261120.zip`, SHA256 `fa0c7606fb80523d9de455719693947284c123de482e71d05ac89465ad859566`, 7074 B; Python puro `audit_synthetic_toc` no usa archivos/red/subprocess/GPG; **40/40 nuevos tests PASS antes y después de ZIP**, smoke `PASS_OFFLINE_ONLY`. INC-lab-55A encabezado `1.16-0` y 55B fixture comentario deshabilitado corregidos; **sin errores de producción**. Diferenciar entradas `ACL`/`DEFAULT ACL` de la aplicación efectiva de owners/GRANT; TOC real **NO REVISADO**, propietarios/ACL, RLS y recuperación integral siguen PENDIENTES. CP54 31 roles gestionados/0 propios, error roles.sql.gpg antiguo inválido; CP48 SSL enforcement OFF. Siguiente puerta **nueva autorización** para hash/manifiesto del backup real y acceso separado GPG histórico+lectura TOC, luego restauración aislada en etapa distinta; prohibido reusar consentimiento preparación como permiso de descifrado. Piloto A REPASAR, Drive fuera. [CP55](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_TOC_OFFLINE_AUDITOR_READY_20261120.md). Solo docs `main` [skip render].

> **BT-SEC07-R3-ROLE-CATALOG-CORRECTED-PASS-54 (20/11/2026).** Segunda SELECT agregada autorizada y ejecutada sobre pg_catalog.pg_roles: **31 roles visibles, 31 reservados, 0 candidatos personalizados y 0 falsos positivos** del filtro anterior. Validado con `starts_with(rolname::text,'pg_')` y lista oficial Supabase CLI v3.0.0; **INC-53 wildcard LIKE 'pg_%' CERRADO**. No se devolvieron nombres/secretos/clientes ni se ejecutó SQL mutante/exportación. Bajo criterio actual, no inventar roles personalizados y no insistir en un dump no vacío; **roles.sql.gpg histórico SQL 0 y productor exit1 siguen sin valor restaurable**. Siguiente prioridad **owners/ACL/GRANT/default privileges, membresías, TOC del snapshot actual** y QA de recuperación, todo bajo nuevas autorizaciones independientes. R2 estructura PASS pero `--no-owner --no-acl` sin paridad de permisos; piloto A REPASAR. SSL enforcement OFF UI, TLS PC→pooler PASS/backend SSL NO, no activar antes de plan y autorización. [CP54](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_ROLE_CATALOG_CORRECTED_WINDOWSLESS_PASS_20261120.md). Solo docs `main` [skip render].

> BT-SEC07-R3-ROLE-CATALOG-AGGREGATE-PROVISIONAL-53 (20/11/2026): Una SELECT agregada autorizada pg_catalog.pg_roles, 31 total/31 clasificados reservados/0 candidatos, sin nombres ni cambios. INC-53 LIKE 'pg_%' usa wildcard _ y sobreexcluye pgX. Cero personalizados NO CERTIFICADO. Siguiente: solicitar aprobación nueva para UNA SELECT corregida con starts_with(rolname::text, 'pg_') y conteo falsos positivos. Roles SQL histórico vacío con productor fallido sigue inválido; owners, permisos, ACL y recuperación integral PENDIENTES. Ningún dump/llaves/SSL cambios. [CP53](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_ROLE_CATALOG_AGGREGATE_PROVISIONAL_20261120.md).
> **BT-SEC07-R3-CLI-V3-OFFLINE-ADAPTER-READY-52 (20/11/2026).** Usuario AUTORIZÓ únicamente **preparar**, sin export real ni conexión Supabase. Contrato R3 revalidado contra fuente exacta Supabase CLI 3.0.0 y PG17: salida `--role-only` filtra roles reservados, omite passwords y agrega `RESET ALL;`; SQL no vacío/exit0 no prueba backup real. Adaptador offline PRIVADO ZIP `BT_SEC07_R3_CLI_V3_OFFLINE_ADAPTER_20261120.zip` SHA256 `a30de4ba1f619de2654da206e9804cb753fac386c7ad2ac3ef85b8e49cc51596`, **5513 B**, 27/27 tests NUEVOS PASS y 27/27 tras extraer; sin subprocess, red, GPG ni acceso archivos reales, solo bytes ficticios, no es wrapper remoto ni SQL parser/restore. El incidente productor `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` sigue ABIERTO (`roles.sql.gpg` SQL 0). **Próxima puerta**: consentimiento separado para UN SELECT agregado de roles no reservados sin nombres ni SQL, reconciliar owners/ACL en fuente/TOC con permiso, y posteriormente wrapper remoto privado con CLI DbUrl sin password argv, TLS verify-full, cifrado GPG y restore autorizado. CP46 TLS cliente PASS pero backend NO, CP48 SSL enforcement OFF; no certificar extremo a extremo ni cambiar ajuste. No repetir labs 18/14/15/R2 ni crear otra DB copy. [CP52](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CLI_V3_OFFLINE_ADAPTER_READY_20261120.md). Piloto A REPASAR, Drive excluido; docs main [skip render].

> **BT-SEC07-EDGE-FUNCTIONS-DEPLOYED-READONLY-AUDIT-51 (20/11/2026).** Supabase `biomotors-taller` auditable sin cambios: solo **`bt-owner-onboarding` ACTIVE v2 `verify_jwt=true`** desplegada, código `index.ts` exactamente igual a `main` (5785 caracteres). Usa `SUPABASE_URL`/fetch Auth `/auth/v1/user` y REST RPC `bootstrap_workshop_owner`, **NO libpq/conexión PG directa observada**, favorable para SSL obligatorio. Bandera `BYTETORQUE_ONBOARDING_ENABLED` y service-role env presentes en fuente, **sin leer valores**. Otras funciones `bt-mechanic-invites`, `bt-mechanic-accept`, `bt-mechanic-revoke`, `bt-invite-worker` existen solo en repo/config, **NO desplegadas**; no publicar. No se invocó función ni se consultó DB/logs/clientes. CP50 Render static_site sin backend PG; CP48 SSL enforcement OFF UI, CP46 client TLS PASS/backend SSL NO, end-to-end pendiente. Prioridad ahora: inventario clientes externos y respaldo real recuperable roles/owners/ACL, plan de ventana y nuevo consentimiento para activar ON (reinicio de DB). Piloto A REPASAR, Drive excluido. [Checkpoint 51](docs/checkpoints/CHECKPOINT_BT_SEC07_EDGE_FUNCTIONS_DEPLOYED_READONLY_AUDIT_20261120.md), `main` docs [skip render].

> **BT-SEC07-RENDER-RUNTIME-READONLY-AUDIT-50 · RENDER CONFIRMADO SOLO STATIC SITE (20/11/2026).** Usuario confirmó `My Workspace`; `list_services` mostró 18 servicios, solo ByteTorque `biomotors-taller-demo` (repo `biomotors-taller`, branch `main`, `static_site`, `autoDeploy=yes`, build npm/install/npm run build, publicación `dist`, latest deploy LIVE); `list_postgres_instances` **0** DB Render. Arquitectura Render NO aloja backend PG de ByteTorque, frontend usa supabase-js HTTPS. Conector no permite lectura de env vars: no afirmar configuración efectiva. Quedan Edge Functions desplegadas, clientes DB externos/Android, backups R3 roles/owner/ACL, continuidad y prueba de recuperación. CP46 TLS PC→pooler verify-full PASS, backend SQL SSL NO; CP48 SSL enforcement OFF screenshot; activar reinicia base y **NO está autorizado**. Próximo ordenar pendientes antes de ON: revisar demás clientes y roles export, preparar ventana/rollback, solicitar permiso expreso. No SQL/GPG/dump/deploy ni cambio SSL en CP50. [Checkpoint 50](docs/checkpoints/CHECKPOINT_BT_SEC07_RENDER_RUNTIME_READONLY_AUDIT_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-SSL-COMPATIBILITY-STATIC-AUDIT-49 · REVISIÓN DE CÓDIGO PARA ENDURECER SSL (20/11/2026).** Se inventariaron rutas de conexión en `main`: web/PWA `@supabase/supabase-js` vía HTTPS, Edge Functions entrypoints Supabase URL/fetch, server adapters rpc/storage, sin PG directo visto; backups locales/GitHub PG17 usan `sslmode=verify-full` y CA en código; workflows backup y pooler diagnóstico manuales `workflow_dispatch`. **Compatibilidad de diseño FAVORABLE, runtime NO CERTIFICADO**: falta confirmar Render (requiere workspace concreto seleccionado por dueño), Edge Functions en despliegue, externos/Android; no inventar clientes ni afirmar que todos están seguros. SSL enforcement OFF UI CP48 y backend SSL REPORTED_NO en una sesión CP46; activar exige reinicio DB con riesgo de indisponibilidad. **Plan por bloques**: A inventario runtime externo en solo lectura; B continuidad y roles/ACL backups (antiguo roles.sql.gpg SQL0); C compatibilidad y ventana/rollback; D autorización NUEVA para ON y verificación read-only post cambio. Ninguna conexión/SQL/export/GPG/Render/ON/deploy ejecutada en esta auditoría. [CP49](docs/checkpoints/CHECKPOINT_BT_SEC07_SSL_COMPATIBILITY_STATIC_AUDIT_20261120.md). Piloto A REPASAR, Drive excluido; solo docs `[skip render]`.

> **BT-SEC07-SSL-ENFORCEMENT-OFF-UI-OBSERVED-48 (20/11/2026).** Screenshot oficial del propietario muestra **Enforce SSL on incoming connections OFF** (knob izquierda, gris). `BT_SEC07_SSL_ENFORCEMENT_UI: OBSERVED_OFF` **evidencia visual**, no respuesta de Supabase API. CP47 UNKNOWN por limitación del conector queda actualizado a observación manual OFF; CP46 PC→pooler TLS verify-full PASS, pooler→PostgreSQL `DB_BACKEND_SSL: REPORTED_NO`, end-to-end NOT_CERTIFIED. OFF admite conexiones a Postgres sin exigir SSL, **NO** implica que todas estén sin cifrar. Riesgo por falta de enforcement, pendiente de plan remediación: inventariar consumidores DB, comprobar modos TLS/certificados, continuidad/pilotaje/roles y backups, ventana de reinicio, plan de rollback. Según docs Supabase, activar enforcement **reinicia DB y puede interrumpir servicio**. **NO ACTIVAR** sin autorización nueva explícita, usuario solo permitió inspección. R3 roles/owner/ACL pendientes, piloto A REPASAR; no conexión SQL ni cambios Supabase ni despliegue. [CP48](docs/checkpoints/CHECKPOINT_BT_SEC07_SSL_ENFORCEMENT_OFF_UI_OBSERVED_20261120.md). Docs `[skip render]`.

> **BT-SEC07-SSL-ENFORCEMENT-READONLY-LIMIT-47 (20/11/2026):** Usuario autorizó mirar únicamente estado SSL enforcement. App Supabase `list_projects/get_project` confirmó `biomotors-taller` ACTIVE_HEALTHY, Postgres17, pero no devuelve ese ajuste y carece de acción GET específica. **ESTADO REAL UNKNOWN / NOT_OBSERVED; no inferir ON/OFF de `pg_stat_ssl=NO`.** Documentación oficial ubica interruptor en Dashboard → Database Settings → SSL Configuration → Enforce SSL on incoming connections; siguiente paso dueño observa sin cambiarlo, reporta solo ON/OFF. GET Management API autenticado documentado, no disponible por conector; no pedir PAT. Modificar ajuste reinicia BD y requiere autorización distinta. CP46 TLS cliente PASS, backend SSL REPORTED_NO, end-to-end no certificado, hallazgo SSL upstream abierto. No SQL, roles, GPG ni backup; piloto A REPASAR, Drive excluido. [CP47](docs/checkpoints/CHECKPOINT_BT_SEC07_SSL_ENFORCEMENT_READONLY_LIMIT_20261120.md). Docs `[skip render]`.

> **BT-SEC07-R3-CLIENT-TLS-V2-WINDOWS-PASS-46 (20/11/2026) — TLS PC→POOLER CONFIRMADO, SSL BACKEND NO, END-TO-END PENDIENTE.** Usuario reportó V2: `RO_V2_ZIP: VERIFIED`, `REMOTE: CONNECTED_CLIENT_TLS_VERIFY_FULL`, `CLIENT_POOLER_TLS: CONFIRMED_BY_LIBPQ`, `TRANSACTION_READ_ONLY: ON`, `SERVER_MAJOR: 17`, `QUERY: STATIC_SELECT_ONLY`, `PRECHECK: PASS_SINGLE_READONLY_CONNECTION`, `RO_V2_WINDOWS: PASS_CLIENT_TLS_ONLY`. `DB_BACKEND_SSL: REPORTED_NO`, `END_TO_END_TLS: NOT_CERTIFIED`; **no declarar cifrado interno**. INC-44 del lector V1 CERRADO, hallazgo SSL-UPSTREAM-46 ABIERTO hasta conocer política de proyecto **sin modificarla**. Fuente Supabase oficial: SSL enforcement para pooler compartido aplica ambos tramos; modificar configuración puede reiniciar base, así que **requiere aprobación explícita y evaluación de impacto**. Permiso de segundo intento agotado, no repetir psql ni ejecutar export/roles/ACL sin nueva autorización. Siguiente: inspección solo lectura de estado SSL enforcement (dashboard o API oficial) bajo consentimiento independiente. R2 estructura snapshot PASS, GPG histórica identificada, roles.sql.gpg histórico SQL0; roles reales/owner/ACL pendientes, piloto A REPASAR, Drive excluido. [CP46](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CLIENT_TLS_V2_WINDOWS_PASS_BACKEND_SSL_PENDING_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-R3-READONLY-TLS-CLIENT-V2-AUTHORIZED-45 (20/11/2026):** Usuario respondió `autorizo` a **UN único segundo intento** de psql solo lectura tras INC-44 (V1 usaba `pg_stat_ssl` del tramo pooler→DB). ZIP V2 `BT_SEC07_R3_READONLY_CONN_V2_20261120.zip` SHA `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b` verificado/interno inspeccionado nuevamente; 35/35 tests sintéticos PASS en CP44, **WINDOWS V2 PENDIENTE**. Ejecutar bloque PowerShell SHA+ZIP desde TEMP, elegir original `bytetorque_respaldo_local.py` sin ejecutarlo, password solo local; psql una conexión, SQL read-only + `\\conninfo`, GSS disabled, SSL verify-full. Reportar CLIENT_POOLER_TLS y backend SSL por separado; **END_TO_END_TLS no certificado**, no cambios SSL enforcement. Solo `BT_SEC07_*`, STOP sin repetir. No roles backup/GPG/restore; exigir permisos independientes. R2 estructura PASS, roles/owner/ACL pendientes. [CP45](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_TLS_CLIENT_V2_AUTHORIZED_20261120.md).

> **BT-SEC07-R3-READONLY-TLS-BACKEND-FALSE-FIX-PREP-44 · V1 REMOTO SÍ CONECTÓ, STOP POR CONFUNDIR TLS DEL BACKEND CON CLIENTE (20/11/2026).** Evidencia Windows: ZIP SHA OK, script original AST OK, CA PEM cargable, SSL verify-full policy, pooler 5432, `PRECHECK_STOP: SESSION_TLS_NOT_CONFIRMED`, roles backup NOT_ATTEMPTED. Inspección exacta V1: psql exit0, SELECT ejecutado, database/user OK, `transaction_read_only=on`, PG17 OK; `pg_stat_ssl.ssl=false` en **backend de pooler** disparó STOP; **no acredita fallo TLS del cliente** y muestra que upstream no reportó SSL (investigar estado SSL enforcement Supabase separadamente, no activar sin permiso: reinicia BD). **INC-44 causa raíz del falso STOP CONFIRMADA**. ZIP V2 privado `BT_SEC07_R3_READONLY_CONN_V2_20261120.zip` SHA `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b`, 10542B, `psql \\conninfo` mismo proceso valida TLS cliente, `PGGSSENCMODE=disable`, GPG/base/SQL de escritura nunca usados; informe `DB_BACKEND_SSL: REPORTED_NO/YES` separado y `END_TO_END_TLS: NOT_CERTIFIED`. 35/35 QA offline PASS, 35/35 ZIP extraído PASS; V1 STOP/V2 PASS comparativa sintética. **WINDOWS V2 NO EJECUTADO Y SEGUNDA CONEXIÓN REQUIERE AUTORIZO NUEVO**, porque primera sesión autorizada ya ocurrió. Nada de export roles (antiguo SQL vacío), alters/ACL, backup, GPG o SSL-enforcement changes; R2 estructura PASS, piloto A REPASAR, Drive excluido. [CP44](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_TLS_BACKEND_FALSE_FIX_PREP_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-R3-READONLY-CONNECTION-PREP-43 · PRIMERA CONEXIÓN A SUPABASE SOLO LECTURA AUTORIZADA, PENDIENTE WINDOWS (20/11/2026).** Usuario AUTORIZÓ comprobación única sin dump ni cambios a DB. Auditoría de script original (texto Library) confirmó pooler sesión 5432 y configuración PG `verify-full`, transacciones read-only; instrumento **no ejecuta original**: extrae 5 constantes seguras mediante AST, exige CA PEM público local (uno en BT-Secrets), pide password en PC oculto y lo inyecta solo a hijo `psql` vía entorno temporal, **no .pgpass, no password en argv ni chat**. `psql` en cliente PG17, `PGSSLMODE=verify-full`, `PGOPTIONS=default_transaction_read_only=on`, SQL `BEGIN TRANSACTION READ ONLY; SELECT` fijo de db/rol/version/TLS; stderr suprimido, salida SQL no mostrada. Evita Supabase CLI linked/ref con login-role temporal. ZIP privado `BT_SEC07_R3_READONLY_CONN_20261120.zip` SHA256 `ea7a7d53208b63481c8cb69462ed152ee4fb0c69b08af8528cac59947c5f7f35`, 8903B, **24/24 pruebas sintéticas PASS y 24 PASS tras extraer**. **Conexión Windows aún NO ejecutada**; script consulta solo metadata, no datos cliente; identidad consistente con script local no verificación independiente. Siguiente usuario descarga ZIP, verifica hash, selecciona original `bytetorque_respaldo_local.py`, ingresa password localmente, comparte solo `BT_SEC07_*`. Si STOP, no repetir a ciegas. NO exportación roles/GPG/restores sin autorización nueva; labs Windows 18/14/15 y R2 PASS sin repetir. Roles SQL histórico 0, owner/ACL pendientes, piloto A REPASAR; Drive excluido. [Checkpoint 43](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_CONNECTION_PREP_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-R3-CONN-OFFLINE-WINDOWS-PASS-42 · CLIENTES LOCALES Y PLAN DB-URL CONFIRMADOS OFFLINE (20/11/2026).** Propietario Windows reportó `CONN_ZIP: VERIFIED`, PG17 `psql/pg_dumpall/pg_dump/pg_restore` **PRESENT**, Node/NPX FOUND, **1 archivo parecido a CA pero NO VALIDADO**, URL ficticia sin password PASS, `PREFLIGHT: COMPLETE_LOCAL_METADATA_ONLY`, `CONN_WINDOWS: PASS_OFFLINE_ONLY`. `SESSION_POOLER_5432` solo política histórica NO chequeada, `TLS_VERIFY_FULL` todavía NOT_TESTED, `TEMP_PGPASS_STRATEGY` DISEÑADA NO CREADA, `CLI_V3_REMOTE_DB_URL` revisada en source NO ejecutada, `SUPABASE_REMOTE: NOT_CONNECTED`, `GPG_HISTORICAL_KEYRING: NOT_ACCESSED`, `ROLES_BACKUP: NOT_ATTEMPTED`. **Solo infraestructura local PASS, NO declarar preparación remota terminada**. Próximo bloque offline: certificar formato del CA candidato sin divulgar contenido, definir destino/hostname correcto y secretos/ACL de `PGPASSFILE` efímero, sin conexión bajo permiso actual. Aprobación nueva requerida para preflight de TLS/identidad con remoto y exportación real roles/GPG. No repetir labs 18/14/15, R2 restore ni reubicar keyring GPG (histórico aislado identificado). Roles SQL real/owners/ACL PENDIENTES, piloto A REPASAR; Drive excluido. [Checkpoint 42](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_WINDOWS_PASS_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-R3-CONN-OFFLINE-PREP-41 · AUTORIZADO Y PREPARADO PREFLIGHT LOCAL, SIN RED NI RESPALDOS (20/11/2026).** Se auditó source oficial Supabase CLI v3.0.0: `--remote=postgresql://...` usa selector DbUrl sin capa de login-role temporal linked/ref; contraseña debe estar fuera de argumentos, TLS verify-full + CA local autorizado y destino explícito. `--remote=service=...` no vale. Se preparó ZIP PRIVADO `BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_20261120.zip` SHA256 `37ef628d973b65a999e5be4b516ccc28c34aa311ef7600396173b0ad90e87edc`, 4973 B: solo metadata de clientes PG17 en Program Files, presencia Node/NPX, recuento sin nombres de `.crt/.cer/.pem` en `BT-Secrets` limitado a un nivel, URL PostgreSQL completamente ficticia sin contraseña. **18 tests NUEVOS sintéticos PASS en asistente y 18 PASS tras extraer**; WINDOWS TODAVÍA PENDIENTE; nunca se lanzó DB/CLI/GPG, ni se creó `.pgpass` real, SQL o backup. Permiso usuario = preparación y comprobación local, NO origen Supabase ni exportación/restauración. Próximo: ZIP SHA + runner offline Windows, devolver solo `BT_SEC07_*`, documentar. No repetir suites previas 18/14/15 ni R2. GPG histórico aislado ya tenía privada coincidente y snapshot estructura PASS; roles reales/owners/ACL PENDIENTES; piloto A REPASAR; Drive excluido. [Checkpoint 41](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_PREP_20261120.md). Docs `[skip render]`.

> **BT-SEC07-R3-RECIPIENT-V2-WINDOWS-PASS-40 · COMPROBACIÓN METADATOS BACKUP REAL PASS + CUSTODIA HISTÓRICA RECONCILIADA (20/11/2026).** Windows V2 hash ZIP VERIFIED, `RECIPIENT_COUNT: 1`, `HIDDEN_COUNT: 0`, `PUBLIC_MATCH: ALL_VISIBLE_MATCH` por Key ID 64-bit en homedir por defecto; `SECRET_MATCH: NO_VISIBLE_MATCH` solo EN ESE homedir, `RECOVERABILITY: NOT_PROVEN`, `CHECK: COMPLETE_NO_DB_NO_DECRYPT_NO_WRITE`, `META_V2_WINDOWS: PASS_HEADER_CHECK_ONLY`. INC-39 V1 longitudes parciales **CERRADO**. **ATENCIÓN: documento histórico de SEC-07 ya registra `GNUPGHOME` aislado distinto del predeterminado, con `SECRET_KEY_RECORDS: FOUND` y `SECRET_RECIPIENT: MATCH` en Windows; R2 también reportó `PARITY_GPG_PROCESS: OK` y `PG_RESTORE_PROCESS: OK` del snapshot principal actual en Docker aislado.** ¡NO confundir secreto 0 del GPG predeterminado con pérdida definitiva de llave! No repetir labs 18/14/15, metadata V2 ni R2 restore. Evidencia combinada apoya recuperación ESTRUCTURAL R2, no roles/owners/ACL/Auth/Storage/Edge completos; `roles.sql.gpg` SQL 0 bytes, productor pg_dumpall causa desconocida. **Siguiente R3**: diseñar conexión sin side-effects (modo URL/password protegido, evitar linked/ref sin password que puede crear login-role `read_only:false`) y exportar roles reales solamente con autorización específica; no conectar Supabase ni usar GPG histórico aún. Google Drive excluido, piloto A REPASAR. [Checkpoint transferible 40](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_V2_WINDOWS_PASS_HISTORICAL_KEYRING_20261120.md). Docs `[skip render]`.

> **BT-SEC07-R3-RECIPIENT-PARTIAL-FIX-PREP-39 · V1 METADATA STOP POR LONGITUD PARCIAL VÁLIDA; V2 PREPARADO (20/11/2026).** Windows usuario: `META_ZIP: VERIFIED`, `META_SELECTION: ACCEPTED_NO_PATH_PRINTED`, `RECIPIENT_STOP_CLASS: PARTIAL_PACKET_UNSUPPORTED`, `META_WINDOWS: STOP` en respaldo principal. Causa del STOP **confirmada en parser V1**: rechazaba formato Partial Body Length del estándar RFC9580 sin distinguir tag; NO prueba corrupción. ZIP privado V2 `BT_SEC07_R3_RECIPIENT_METADATA_V2_20261120.zip` SHA `eed81875dfca9f70929983a82b3490c62ff15f170d2a89ea410967033eb82842`, soporta solo cabecera de cifrado parcial tag 9/18/20 tras PKESK, resto inaccesible y sin decrypt. 19/19 tests PASS, GPG real efímero 1.25MB streaming/partial PASS, 19/19 ZIP extraído PASS (asistente). **WINDOWS V2 PENDIENTE**; ejecutar un único PS hash + elegir mismo backup .gpg, enviar solo `BT_SEC07_*`. Si match ID con clave pública no es recuperación, GPG home Windows 1 pública y 0 secretas. No repetir V1 ni suites 18/14/15, R2 snapshot estructura PASS, roles reales/ACL/owners pendientes, piloto A REPASAR, Google Drive excluido. [Checkpoint 39 + script](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_PARTIAL_PACKET_FIX_PREP_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-R3-RECIPIENT-META-PREP-38 · COMPARACIÓN LOCAL DE DESTINATARIO OPENPGP AUTORIZADA Y PREPARADA (20/11/2026).** Usuario autorizó unicamente verificar **metadatos** del respaldo cifrado actual contra llaves GPG sin descifrar, tocar backups, ni Supabase. ZIP privado `BT_SEC07_R3_RECIPIENT_METADATA_20261120.zip` SHA256 `3095885292baeca30a1785723143d1e99785baf735b793fee7e03196d69cbc8c`, script Python estándar que inspecciona solamente cabeceras PKESK v3 de un ciphertext seleccionado localmente, compara Key IDs (solo en memoria, jamás mostrar), sin operaciones GPG de cifrado/descifrado, DB ni red. 13/13 pruebas nuevas PASS en asistente y tras extracción, prueba con GPG efímero real + archivo falso PASS. **Windows PENDIENTE, archivo real NO examinado**. Siguiente: usuario ejecuta preflight SHA y selector GPG, envía solo `BT_SEC07_*`; ante formato distinto devolver STOP/INDETERMINATE sin atribuir corrupción. 1 pública/0 secretas en home seleccionado del PC; coincidencia 64-bit no certifica recuperación ni ausencia global de privada. No repetir suites anteriores 18/14/15; R2 estructura PASS, roles/owners/ACL PENDIENTES, Drive excluido, piloto A REPASAR. [Checkpoint + comando + traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_METADATA_PREP_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-R3-GPG-INVENTORY-PASS-37 · CLAVES GPG INVENTARIADAS SIN ERRORES (20/11/2026).** Usuario ejecutó PowerShell 5: `GPG_HOME: PRESENT`, `GPG_PUBLIC_KEYS_COUNT: 1`, `GPG_SECRET_KEYS_COUNT: 0`, `GPG_DIAG: PASS_NO_DB_ACCESS_NO_SECRETS_PRINTED`. INC-36 listing previo ya no ocurre; **resuelto operativamente, causa de excepción anterior no identificada**, no afirmar keyring corrupto ni pérdida definitiva de secreta. Una pública no acredita restauración si no está disponible la privada correspondiente en algún custodio/almacén. **No cifrar roles reales ni iniciar nuevo respaldo con esa pública hasta verificar recuperabilidad**, bajo autorización distinta. Inventario local autorizado CERRADO. Próximo opcional con AUTORIZO nuevo: comparación OFFLINE sanitaria de destinatario ciphertext antiguo vs pública, sin descifrar/tocar backup; no hacer conexión Supabase/CLI dump/restores. Suites Windows 18/14/15 PASS, R2 snapshot estructural PASS, viejo `roles.sql.gpg` SQL 0 bytes; R3 owners/ACL/roles real PENDIENTES, Google Drive excluido, piloto A REPASAR. [Checkpoint completo + prompt traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_INVENTORY_PASS_ZERO_SECRET_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-GPG-LIST-UNCLASSIFIED-36 · HOME GPG EXISTE; ENUMERACIÓN ABORTÓ SIN CAUSA DETERMINADA (20/11/2026).** Resultado Windows del usuario: `GPG_HOME_SOURCE: GPGCONF`, `GPG_HOME: PRESENT`, `GPG_INVENTORY: FAILED_NO_DB_ACCESS`; corrige anterior bug `$HOME` pero falla dentro del listado o del manejo de stderr, **no hay prueba de daño de claves**. INC-36 abierto por catch demasiado genérico bajo `ErrorActionPreference Stop`; causa raíz de GPG **DESCONOCIDA**. Preparado solo un diagnóstico local que imprime PS major, fase/código de salida o clase de error y conteos sanitizados, ningún mensaje/crendencial/UID. **Windows aún no ejecutado**. Próximo: usuario trae marcadores `BT_SEC07_*`; documentar y corregir según causa. No repetir inventario PG ni suites 18/14/15 PASS, no hacer dump, usar GPG para cifrar/descifrar ni conectar Supabase sin nueva autorización. R2 snapshot estructura PASS, R3 roles/ACL pendientes, piloto A REPASAR, Drive excluido. [Checkpoint 36 completo](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_LIST_INVENTORY_FAILED_DIAG_PREP_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-LOCAL-INV-HOME-RO-35 · INCIDENTE DE SCRIPT, NO DE BASE/GPG (20/11/2026).** Primer inventario autorizado reportó `PG*` de esta sesión `NOT_SET` y rutas por defecto `ABSENT`, `GPG_COMMAND: FOUND`, inmediatamente después `LOCAL_INVENTORY: FAILED_NO_DB_ACCESS`. **Causa comprobada por código PowerShell:** variable `$home = $null` del asistente colisiona con automática read-only `$HOME`; catch ocultó mensaje. No implica pérdida de credenciales/keyring ni DB inaccesible. Corregido el diseño con `$gpgHomePath` y resolución `gpgconf`; se documenta nuevo bloque SOLO GPG, sin repetir inventario PG. **Aún NO ejecutado en Windows**; próximo recibir `BT_SEC07_GPG_*` sin imprimir nombres/rutas/huellas. Permiso vigente solo inspección local, NO acceso Supabase, dump, uso criptográfico GPG original ni restore. Suites 18/14/15 PASS, R2 estructura PASS, roles/owners/ACL PENDIENTES, Drive excluido, piloto A REPASAR. [INC, script corregido y traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_LOCAL_INVENTORY_HOME_COLLISION_INC_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-R3-LOCAL-INVENTORY-PREP-34 · PROPIETARIO AUTORIZÓ SÓLO REVISIÓN LOCAL DE LIBPQ Y KEYRING GPG (20/11/2026).** Tras SEC-07 18/18 MOCK Windows, 14/14 GPG efímero Windows y 15/15 integración Windows, todos PASS y cerrados, el propietario respondió `autorizo` a inspeccionar **sin publicar secretos, cifrar/descifrar ni conectar a Supabase** su configuración local PostgreSQL/libpq y listado GPG. Preparado preflight PowerShell que imprime sólo estados de variables, existencia de archivos PGPASSFILE/pg_service.conf/cert y cantidades de claves, no rutas ni contenidos; **aún NO ejecutado en Windows**. Siguiente: recibir salida sanitaria `BT_SEC07_*`, documentar resultados y escoger el camino no mutante de conexión/identidad GPG. NO exportar roles, usar GPG real original, crear login-role, ejecutar Docker/restores ni reexportar DB sin autorizaciones nuevas. Antiguo roles SQL 0 bytes, R2 estructura PASS; roles/grants/owners, Auth/Storage, segunda copia externa no-Drive y piloto A REPASAR. [Checkpoint completo + script + traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_LOCAL_CREDENTIAL_KEYRING_INVENTORY_PREP_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-R3-COMBINED-WINDOWS-PASS-33 · PUENTE SINTÉTICO + GPG REAL 15/15 PASS EN WINDOWS (20/11/2026).** Propietario confirmó `COMBINED_ZIP: VERIFIED`, `Ran 15 tests in 10.588s ... OK`, `COMBINED_WINDOWS_QA: PASS`, `COMBINED_RESULT: PASS`, `KEYRING: EPHEMERAL_REMOVED`, `SUPABASE_REMOTE: NOT_CONNECTED`, `REAL_ROLES_BACKUP: NOT_ATTEMPTED` y selftest PASS. Las tres suites MOCK 18/18, GPG efímero REAL 14/14, integrado 15/15 están cerradas en Windows, no repetir por rutina. Código fuente exacto CLI v3.0.0: `--role-only` usa `pg_dumpall --no-role-passwords`, filtra reservados y emite `RESET ALL;`; **salida no vacía NO demuestra roles útiles**; `--remote=<ref>` sin contraseña puede crear rol temporal `read_only:false`. Contrato propuesto: destino DB-URL sin password en argv con libpq/PGPASSFILE, stdout binario→GPG, fallo cerrado, inventario roles y comparador ACL separados, pendiente de QA/autorizaciones. Próximo: diseñar y probar offline adaptador de CLI v3 con productor simulado, sin usar claves/origen reales. **Roles/owners/ACL siguen PENDIENTES; piloto A REPASAR.** No Drive ni cambios a producción. [Checkpoint autosuficiente](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_COMBINED_WINDOWS_PASS_AND_REAL_EXPORT_GATE_20261120.md) · [Runbook R3](docs/BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md). Solo documentación `[skip render]`.

> **BT-SEC07-R3-COMBINED-BRIDGE-PREP-32 · PRODUCTOR SINTÉTICO + GPG REAL INTEGRADOS: 15/15 PASS ASISTENTE (20/11/2026).** En ZIP privado `BT_SEC07_R3_COMBINED_BRIDGE_20261120.zip` SHA256 `e4fda9667879998aa5214d8bb6357b618b67e14e9bcf7ee484a706578526f44c` (9.880 B) se combinan productor binario Python inventado con cifrado GPG real bajo clave/GNUPGHOME temporal, SHA/readback, corte ante vacío/parcial/errores y no overwrites. 15 nuevas pruebas PASS, también tras extraer ZIP; selfcheck PASS. **NO ejecutado en Windows todavía**, no conectar Supabase ni manipular keyring original. Próxima única acción: Windows hash del ZIP + `py -3 -m unittest -v test_bt_sec07_combined_bridge` y selfcheck. Laboratorios previos MOCK 18/18 y GPG 14/14 Windows ya PASS: no repetir. Tras PASS local, diseñar wrapper auténtico CLI v3.0.0 stdout → GPG con protección de credenciales y autorización remota separada. `roles.sql.gpg` histórico SQL 0 bytes, R3 owners/ACL PENDIENTE; R2 snapshot estructural PASS, piloto A REPASAR; Google Drive fuera. [Checkpoint completo y prompt de continuidad](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_COMBINED_BRIDGE_PREP_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-R3-GPG-WINDOWS-PASS-31 · GPG REAL EFÍMERO EN WINDOWS 14/14 PASS (20/11/2026).** El propietario verificó SHA ZIP `051cbe04f6b7b900310bcab615b7b240ff8ff8b22abfe445b555e537ae4d078e`, `Ran 14 tests ... OK`, `BT_SEC07_GPG_WINDOWS_QA: PASS`, `BT_SEC07_GPG_REAL: PASS_EPHEMERAL_KEY`, `BT_SEC07_GPG_HOME: TEMPORARY_AND_REMOVED`, `BT_SEC07_REAL_ROLES_BACKUP: NOT_ATTEMPTED` y `BT_SEC07_GPG_SELFTEST: PASS`. **No repetir mock 18/18 ni GPG 14/14.** Revisión SOLO LECTURA del source exacto CLI v3.0.0: `db dump --role-only` invoca `pg_dumpall`, stdout transmite bytes binarios, `--file` crea/trunca SQL claro con modo 0644 y pooler-fallback sobre stdout puede dejar fragmentos; posible provisioning login-role según modo de conexión (NO observado en ByteTorque). **Próximo:** preparar/validar puente binario CLI stdout→GPG con productor simulado, sin plaintext persistente; después solicitar autorización específica para lectura remota y uso de GPG original, con elección segura del destino y credenciales. Roles/owners/grants siguen PENDIENTES, viejo roles.sql.gpg SQL 0 bytes preservado; piloto A REPASAR; Drive excluido, sin cambios de producción. [Checkpoint de traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_WINDOWS_PASS_ROLE_EXPORT_GATE_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-R3-WINDOWS-QA-PASS-30 · PRUEBAS SINTÉTICAS DE ROLES 18/18 PASS EN WINDOWS; GPG REAL CON CLAVE EFÍMERA 14/14 PASS EN ASISTENTE (20/11/2026).** Propietario verificó hash ZIP y ejecutó `18 tests ... OK`, `BT_SEC07_WINDOWS_QA: PASS`: fase de transporte cifrador MOCK aprobada en PC y no se repite. Nuevo ZIP privado `BT_SEC07_R3_GPG_EPHEMERAL_20261120.zip` SHA `051cbe04f6b7b900310bcab615b7b240ff8ff8b22abfe445b555e537ae4d078e`, GPG ejecutado **realmente** con GNUPGHOME aislado y clave desechable, texto SQL estrictamente ficticio, hash/readback e incidentes simulados: 14/14 PASS en asistente, 14/14 tras extraer, selfcheck PASS; **aún no ejecutado en Windows** y no usa claves históricas. Siguiente: verificación del ZIP y QA GPG efímero Windows con autorización, luego diseñar productor `--role-only` y cifrado usando llave real con autorización separada. **Ningún dump remoto ni owners/grants reales restaurados**; R2 paridad del snapshot PASS; roles/ACL pendientes, `BT-PILOT-QA-04 A REPASAR`. No Drive, no cambios Supabase/Render/GPG original, repositorio observado público sin cambiar. [Checkpoint + prompt traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_WINDOWS_PASS_GPG_EPHEMERAL_PREP_20261120.md). Documentación únicamente `[skip render]`.

> **BT-SEC07-ROLES-CLI-FLAGS-PASS-29 · PREFLIGHT CLI V3 PASS EN WINDOWS; LABORATORIO DE ROLES SINTÉTICO 18/18 PASS EN ASISTENTE (20/11/2026).** El propietario aportó salida `FILE=True`, `ROLE_ONLY=True`, `REMOTE=True`, `DATA_ONLY=True`, `COMPLETE_NO_DB_ACCESS` con `npx supabase@3.0.0 db dump --help`; **compatibilidad CLI confirmada, NO repetir**. Se preparó ZIP **privado, no publicado en repo** `BT_SEC07_R3_SYNTHETIC_LAB_20261120.zip` SHA256 `48634f2c5118a2af2b6c4449f68d71f19c72942454b5bcb9ec38d875b04e627a`: tests binarios de productor/error/salida nula/cipher simulado/hash/readback/colisión, 18/18 PASS en asistente y nuevamente tras extracción, sin conexión, DB ni GPG real. **Próxima tarea:** usuario verifica SHA y ejecuta 18 tests Windows en carpeta nueva fuera de backup/repo; NO exportar roles, restaurar, invocar GPG real o conectar Supabase sin autorización específica nueva. `roles.sql.gpg` antiguo SQL 0 bytes, R2 paridad estructural aprobado; R3 roles/owners/ACL **PENDIENTES**, recuperación total/piloto `A REPASAR`. Drive excluido, repo público observado pero no modificado. [Checkpoint + traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_CLI_FLAGS_AND_SYNTHETIC_LAB_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-ROLES-OUTPUT-CONTRACT-PREP-28 · CONTRATO CLI V3 DOCUMENTADO; PREFLIGHT WINDOWS PENDIENTE (20/11/2026).** Tras leer AGENTS/agent/roadmap, checkpoints R2 y R3 e informe de incidentes, se contrastó `supabase db dump` contra documentación oficial v3: existen `--file` (`-f`), `--role-only`, `--remote` y `--data-only`; v3 selecciona local por defecto y `--db-url` está deprecado/oculto. **Verificación documental, NO nueva ejecución en Windows.** Se prepara un único bloque de ayuda `npx supabase@3.0.0 db dump --help` sin acceso DB, para recoger booleanos de flags. Tras resultados reales, diseñar wrapper binario probado con salida no vacía, GPG/hash/readback y fallos simulados, sin SQL legible innecesario. Exportar remotamente solo con aprobación adicional, destino inequívoco, y luego evaluar grants/owners en aislamiento. Snapshot cifrado/paridad R2 preservados; viejo roles.sql.gpg 0 bytes, R3 PENDIENTE, piloto A REPASAR; Google Drive excluido. **Metadatos GitHub muestran repositorio PUBLIC (no se modificó);** revisar visibilidad antes de datos reales. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_OUTPUT_CONTRACT_PREP_20261120.md). Solo docs `[skip render]`.

> **BT-SEC07-ROLES-CLI-V3-READY-27 · NODE/NPX + SUPABASE CLI v3.0.0 PREPARADOS Y CONFIRMADOS EN WINDOWS (20/11/2026).** El propietario autorizó solo ejecución npm temporal de `npx supabase@3.0.0` fuera del repo: `NODE_NPX: READY`, `ROLES_CLI: AVAILABLE`, `ROLES_VERSION: 3.0.0`, **`ROLE_ONLY: True`, `REMOTE: True`, `DB_URL: False`**, `PREFLIGHT: SUCCESS_NO_DB_ACCESS`. `--db-url` **no aparece en --help porque v3 la oculta por deprecación, no implica incompatible**; camino correcto es `--remote` explícito (CLI v3 local por defecto). **No hubo acceso a Supabase ni exportación**. El bloqueo de CLI global está RESUELTO mediante npx, sin Scoop. Siguiente R3: diseñar productor de roles SQL no vacío y cifrado comprobable, testear error/pipe binario en local (no usar PowerShell 5 pipeline textual ni `pg_dumpall` histórico 0 bytes), comprobar flag `--file` y seleccionar destino solo con autorización remota posterior; verificar grants/owners con ruta aislada, sin asumir que `--no-acl` preservó privilegios. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_CLI_V3_READY_20261120.md). R2 paridad snapshot PASS, R3 ACL/roles PENDIENTE; Drive fuera, piloto A REPASAR.

> **BT-SEC07-ROLES-CLI-PREFLIGHT-26 · PREFLIGHT DE ROLES: CLI SUPABASE NO LOCALIZADA EN PATH DE WINDOWS (20/11/2026).** Resultado del propietario `BT_SEC07_ROLES_CLI: NOT_INSTALLED`, `ROLES_PREFLIGHT: COMPLETE_NO_CHANGES`: **solo ausencia de comando global**, no error de cifrado/restauración; no se ejecutó `db dump` ni se instaló nada. Documentación oficial permite CLI Windows por Scoop o Node >=20 y npx; ver CLI v3 breaking 04/11/2026: remoto requiere selección explícita. Próximo paso único verificar disponibilidad de Node/npx; si hay, ofrecer descarga/ejecución temporal CLI v3.0.0 con permiso expreso solo para `--version` y `db dump --help` fuera del repositorio. No exportar roles ni conectar Supabase hasta autorización separada, no generar otro backup/repetir restore. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_CLI_PREFLIGHT_20261120.md). **R2 estructura PASS; R3 roles/ACL pendiente; Google Drive excluido, piloto A REPASAR.**

> **BT-SEC07-PARITY-STRUCTURE-PASS-25 · PARIDAD ESTRUCTURAL DEL SNAPSHOT CIFRADO APROBADA EN WINDOWS DOCKER (20/11/2026).** Propietario ejecutó paquete SEC07 Paridad **V2** SHA `0d315b637730500ebfaf7f058c98cde3c1abfa28dc115c70a1e569608f26d667`: 40/40 QA local PASS, `PARITY_SQL_PREFLIGHT: PASSED_BEFORE_GPG_RESTORE`, GPG OK, `PG_RESTORE_PROCESS: OK`, error NONE, `REPLAY_COMPLETE_IN_ISOLATION`, imagen PG17 Supabase fijada sin descarga y laboratorio sin red/puertos. **Conteo estructural: 12 tablas públicas + 8 privadas, RLS en las 20, FORCE 8/8 privadas, 21 políticas, 35 funciones, 4/4 extensiones instaladas, 0 índices inválidos, 0 restricciones no validadas; 20 tablas contabilizadas y 37 filas del snapshot (33 públicas + 4 privadas), 12 tablas no vacías.** Limpieza verificada, GPG/manifest sin cambios, exit 0. **V1 `PARITY_QUERY_FAILED` RESUELTO EN PC** mediante definir `physical_tables` y preflight SQL real; sus 32 tests mock no cubrían alias. `CERTIFICATION: SNAPSHOT_STRUCTURE_ONLY` **NO** origen actual, propietarios/ACL (restaurado `--no-owner --no-acl`), roles reales/Auth/Storage/Edge ni seguridad A/B. **R2 estructura: PASS; R3 roles/permisos: SIGUIENTE** con inspección offline + docs `supabase db dump` (CLI v3 cambió comportamiento; comprobar version/--help); no lanzar `pg_dumpall` antiguo vacío ni nueva exportación sin autorización. Sin Drive, sin cambio en manifiesto. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_STRUCTURE_PASS_20261120.md). `BT-PILOT-QA-04 A REPASAR`.

> **BT-SEC07-PARITY-SQL-INC-24 · RESTORE PARIDAD V1 PASÓ, PRIMER SQL DE AUDITORÍA FALLÓ POR ALIAS AUSENTE (20/11/2026).** Evidencia PC: 32/32 pruebas V1 OK, Docker PG17 Supabase sin red, GPG OK, `PG_RESTORE_PROCESS: OK`, `RESTORE_ERROR_CLASS: NONE`, `REPLAY_COMPLETE_IN_ISOLATION`, contenedor `VERIFIED_REMOVED`, snapshot/manifiesto `UNCHANGED_AFTER_LAB`, **`STOP: PARITY_QUERY_FAILED` exit 2**. Análisis del ZIP original SHA verificado: `CATALOG_METRICS` refería `physical_tables` en `concat_ws` pero no definía esa columna en `stat` (primer SQL tras restore); tests previos mockeaban resultados y omitían verificación de SQL. Corrección preparada **sin ejecutar con backup real**: V2 privado `BT_SEC07_PARITY_LAB_V2_20261120.zip` SHA256 `0d315b637730500ebfaf7f058c98cde3c1abfa28dc115c70a1e569608f26d667`, 40/40 tests PASS y -O PASS; añade `c.relkind`, contador físico, contrato de 13 alias y, decisivamente, **preflight PostgreSQL local real de queries ANTES de GPG/pg_restore**; limpieza/errores clasificados. Un nuevo ensayo aislado únicamente con consentimiento independiente, sin `pg_dump`, sin conectar a producción, sin Google Drive. [Checkpoint e incidencia con prevención](docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_SQL_INC_20261120.md). R2 paridad sigue PENDIENTE, R3 roles/Auth/Storage, R4 A/B, R5 segunda copia NO Drive pendientes. **Piloto A REPASAR**.

> **BT-SEC07-PARITY-PREP-23 · PARIDAD DEL RESTORE ACTUAL PREPARADA SIN SEGUNDO ENSAYO REAL TODAVÍA (20/11/2026).** Tras `LAB_PG_RESTORE_PROCESS: OK` en laboratorio Supabase PG17 se identificó cobertura incompleta: solo 12 tablas públicas contadas, sin validación real de registros, RLS, restricciones/índices ni propietarios/ACL por `--no-owner --no-acl`. Se creó paquete privado `BT_SEC07_PARITY_LAB_20261120.zip` SHA256 `795b7d2f38b43bd817f4c63e11770a8f4f8c8ccf33c791afa1d9583847c31cf8` (**32/32 QA sintética y zip extraído PASS, aún NO ejecutado en PC**). Reutiliza script anterior con SHA fijo y mismo backup GPG; una sola restauración local aislada con nueva autorización, verifica 12 tablas públicas y >=8 privadas, RLS/FORCE, políticas, restricciones, índices, funciones, extensiones instaladas y conteos agregados con autoridad BYPASSRLS, sin leer/mostrar datos y sin conectar a Supabase. **NO se comparará con producción; NO se certificarán GRANT/owner ni Auth/Storage/Edge**; archivos GPG/manifiesto permanecen intactos. [Checkpoint y matriz de incidentes](docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_PREP_20261120.md). El error anterior `DOCKER_LINUX_NOT_READY` fue aplicación cerrada, `ARCHIVE_TOC_NOT_READABLE` fue lector Windows V1, `EXTENSION_UNAVAILABLE` fue imagen PostgreSQL genérica; no repetir esas rutas. Drive EXCLUIDO. **Piloto aún A REPASAR**.

> **BT-SEC07-RESTORE-ISOLATED-PASS-22 · PRIMER RESTORE REAL DEL BACKUP ACTUAL EN SUPABASE PG17 DOCKER: PASS AISLADO, NO CERTIFICACIÓN INTEGRAL (20/11/2026).** Ejecutado por propietario con `AUTORIZO`: paquete 25/25 QA PASS, hash ciphertext/manifiesto OK, imagen `supabase/postgres:17.12.0.002` digest fijado OK, 4 controles de extensiones disponibles, contenedor Docker sin red/puertos + PG listo + roles NOLOGIN temporales + base `template0` efímera; **`LAB_GPG_PROCESS: OK`, `LAB_PG_RESTORE_PROCESS: OK`, `LAB_ERROR_CLASS: NONE`, `LAB_STREAM: NONZERO`, `LAB_PUBLIC_TABLE_COUNT: 12`, `LAB_RESTORE: SCHEMA_LOADED_ISOLATED_SCOPE_ONLY`**, contenedor `VERIFIED_REMOVED`, manifest/ciphertext `UNCHANGED_VERIFIED_POST_RESTORE`, exit 0. Es **hito real de recuperabilidad de archivo en entorno compatible**, pero `FULL_PROJECT_RECOVERY: NOT_CERTIFIED`: NO se compararon filas, todos esquemas/RLS, grants/owners (`--no-owner --no-acl`), roles reales, Auth externo, Storage bytes, Edge, Render, clave de contingencia ni copia externa. **No reexportar** ni repetir el laboratorio sin nuevo objetivo/control y autorización: próximo bloque R2 paridad estructural y de datos del snapshot en **un solo ensayo combinado** con script candidato probado sintéticamente; después R3 roles y R4 seguridad multitenant. Drive fuera del roadmap. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_RESTORE_ISOLATED_SUCCESS_20261120.md). `BT-PILOT-QA-04: A REPASAR`.

> **BT-SEC07-SUPABASE-IMAGE-MATCH-21 · IMAGEN OFICIAL SUPABASE PG17 COINCIDE CON LAS 4 EXTENSIONES DEL BACKUP (20/11/2026).** El propietario descargó con `AUTORIZO` `supabase/postgres:17.12.0.002`, digest `sha256:0b64586fb84124b9070525a6528616594a1aa84a75d84cd4c3d43acc8de3ba92`, y completó 15/15 pruebas del comparador en Windows. Evidencia: `EXISTING_CIPHERTEXT: HASH_VERIFIED_UNCHANGED`, `ARCHIVE_EXTENSION_COUNT: 4`, `LOCAL_STANDARD_PG17_ABSENT: 1`, `SUPABASE_PG17_CONTROL_COUNT: 78`, **`SUPABASE_PG17_ABSENT: 0`**, `CATALOG_MATCH: ALL_REQUIRED_CONTROL_FILES_PRESENT`, `CIPHERTEXT_AND_MANIFEST: UNCHANGED`, exit 0. **Compatibilidad de archivos .control, NO prueba de carga, SQL ni recuperación.** Siguiente paquete LOCAL candidato `BT_SEC07_SUPABASE_ISOLATED_RESTORE_20261120.zip` SHA256 `3a50b7bf010b7c8a4362f06d099467a5bbdbbdd2cbb243e588ce1caf4ccd7012`, 25/25 pruebas sintéticas PASS y retransmisión binaria sintética PASS; contenedor efímero PG17 Supabase en tmpfs, sin red/volúmenes/puertos ni logs Docker, restore del **mismo respaldo** mediante pipe GPG, clasificador de fallos y eliminación comprobada, con autorización expresa local. **No ejecutado contra Docker real**; el ensayo no certificará proyecto completo aunque pase. Supabase advierte que dumps crudos contienen objetos internos; no falsear PASS omitiendo objetos. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_SUPABASE_IMAGE_MATCH_AND_LAB_PREP_20261120.md). **Google Drive excluido, piloto A REPASAR, no hacer nuevos dumps**.

> **BT-SEC07-EXTENSION-MISMATCH-20 · INVENTARIO V2 APROBADO CON BACKUP REAL Y EXTENSIÓN FALTANTE IDENTIFICADA POR CONTEO (20/11/2026).** Evidencia Windows: `V2_PREFLIGHT: VERIFIED`, 19/19 QA PASS, `EXISTING_SNAPSHOT: INTEGRITY_VERIFIED_NO_CHANGES`, `LOCAL_PG17: VERIFIED`, `ARCHIVE_TOC: PARSED_NO_SQL_EXECUTION`, `ARCHIVE_EXTENSION_COUNT: 4`, `UNRECOGNIZED: 0`, `LOCAL_EXTENSION_CONTROL_COUNT: 45`, **`EXTENSIONS_ABSENT_LOCALLY: 1`**, nombre oculto por allowlist (`PUBLIC_NAMES_ABSENT: NONE`, `NONPUBLIC_COUNT_ABSENT: 1`); `EXTENSION_MISMATCH: DETECTED`, manifiesto/ciphertext intactos, exit 0. **R1 CERRADO COMO INVENTARIO**, NO restauración ni cifrado "probado completo". Próximo preflight sin restauración: comparar en modo offline con `supabase/postgres:17.12.0.002` oficial después de descarga local **solo autorizada expresamente**. ZIP privado `BT_SEC07_SUPABASE_IMAGE_COMPARE_20261120.zip` SHA256 `0440ad7e1323d91a8f2f531ad595b04317ee1f1dcb743d01bbb36b449a53f540`; 15/15 QA sintética PASS, aún NO usado en Windows. No mostrar extensión no-allowlisted ni SQL, no montar backups en contenedores. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_EXTENSION_MISMATCH_20261120.md). **R2 restore pendiente y BT-PILOT-QA-04 A REPASAR; Drive fuera del plan**.

> **BT-SEC07-ARCHIVE-TOC-V2-19 · INVENTARIO TOC V1 BLOQUEADO, DIAGNÓSTICO V2 PREPARADO (20/11/2026).** Tras abrir Docker Desktop, el propietario ejecutó el inventario sobre **el respaldo ya cifrado**: `BT_SEC07_DOCKER: READY`, `EXISTING_SNAPSHOT: INTEGRITY_VERIFIED_NO_CHANGES`, `LOCAL_PG17: VERIFIED`, **`STOP: ARCHIVE_TOC_NOT_READABLE`**, exit 2, GPG env restaurado. Fuente V1 original SHA verificado muestra que `inventory_archive` usa `pg_restore --list` de Windows mediante pipe GPG, descarta stderr y mezcla posibles causas; esta etiqueta **NO prueba corrupción**. V2 candidato privado `BT_SEC07_EXTENSION_INVENTORY_V2_20261120.zip` SHA256 `15d9def921e3ceb0f8721ca3a2b1f964c47916e2b8e898623ff8261822acbdc6`, **19/19 pruebas sintéticas PASS** y test adicional de pipes PASS, cambia a `pg_restore --list` dentro de Docker PG17 Linux de solo lectura, sin servidor/red, sin nueva exportación, sin cambiar copia/manifiesto ni GPG. **Windows aún pendiente**; ejecutar una sola vez tras hash ZIP, enviar etiquetas y clasificar fallo sin stdout/stderr crudo. [Checkpoint V2](docs/checkpoints/CHECKPOINT_BT_SEC07_ARCHIVE_TOC_V2_20261120.md). Google Drive no forma parte del plan. Restauración `EXTENSION_UNAVAILABLE` sigue sin reparar y `BT-PILOT-QA-04: A REPASAR`.

> **BT-UX-PERSIST-01 · NAVEGACIÓN PERSISTENTE PUBLICADA EN RENDER LIVE (20/11/2026, 19:23:40 UTC).** Autorización expresa del titular «autorizo» para desplegar la revisión ya validada en `https://bytetorque.cl`. Preflight: `main=7da13a3f7c1f9a396c777515ce911674a10bde33` y [CI general](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44798553027) + [CI visual](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44798552931) **SUCCESS** sobre código `badea20b49142e0092e73ef905a4b141549dfcaf` (744/744 Vitest, build web público/privado, Chromium/WebKit). Comparación contra el previo deploy `bd9c8e5`: siete commits posteriores, seis de implementación/test/QA UX y uno documental; sin otras nuevas funciones ajenas detectadas. Se ejecutó `trigger_deploy` de Render con `clearCache:false` en **el mismo servicio** `biomotors-taller-demo` (`srv-dbqe4quc6qcc73f275jg`, workspace `tea-daum20gjo6nc73dndfqg`); deployment **`dep-dc09s9jncjis7387ghv0` `LIVE` confirmado** para HEAD `7da13a3f`, sustituyendo `dep-dc086ugm7kps73d78ue0`. No se modificaron Supabase, SQL/RLS/Auth alojado, variables/flags de Render, correo, Storage, Edge, pagos, otros sitios ni APK. **Pendiente** QA humana en Edge y Safari/iPhone: cambiar ventana/foco, captura, navegar cinco módulos y volver a formulario/scroll/cursor/OT, revocación y desconexión con datos ficticios. LIVE y CI sintética no constituyen aprobación operativa de Ignacio ni cierran SEC-07. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_UX_PERSIST_01_20261120.md).

> **BT-UX-PERSIST-01 · cierre local 20/11/2026:** 744/744 tests, builds público/privado y navegación Chromium 1366/390/768 PASS. UX-INC-06 corrige generaciones de autoridad/actualización manual de plan sin cancelar lecturas legítimas; UX-INC-07 limpia filtro de vehículo al elegir otra OT. PLAN04 y CP05 con HTTP simulado PASS; ningún acceso real. Código final `badea20` publicado en main con `[skip render]`. CI general [44798553027](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44798553027), visual Chromium/WebKit [44798552931](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44798552931) y FLOW/COT/REG SUCCESS; Render sigue LIVE `bd9c8e5`, despliegue sin autorización. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_UX_PERSIST_01_20261120.md).

> **BT-UX-PERSIST-01 · 20/11/2026 — CANDIDATO EN MAIN, SIN DESPLIEGUE:** revalidación rutinaria sin retirar el workspace; coordinación foco/visibilidad/token y descarte de resultados obsoletos; navegación por cinco módulos visitados conservados en memoria del ámbito autorizado, scroll/cursor/historia y borradores previos. Invalidación por desconexión, revocación, rol, usuario o taller permanece cerrada. Se preservan QA04A–C y R2, sin mutaciones alojadas/flags ni trabajo SEC-07. Incidentes de formulario anónimo, anclaje móvil, fixtures y timeout PDF registrados con su evidencia en [checkpoint UX](docs/checkpoints/CHECKPOINT_BT_UX_PERSIST_01_20261120.md). Validación física y despliegue requieren autorización posterior; no usar esta mejora para habilitar piloto con clientes reales.

> **BT-PILOT-QA-04C · PENDIENTES MULTIPUNTO CORREGIDOS Y PUBLICADOS — RENDER LIVE 20/11/2026.** Autorización expresa del titular para publicar tras CI: GitHub [CI general](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774998665) `completed/success` y [QA navegador](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774998785) `completed/success` para código `e617542`; el HEAD posterior `bd9c8e5` solo modificó documentación. Servicio Render existente `biomotors-taller-demo` (`srv-dbqe4quc6qcc73f275jg`) en **My Workspace**, despliegue manual único `dep-dc086ugm7kps73d78ue0`, commit `bd9c8e5a23634fbb1062c077ec01da11d19e89a4`, `LIVE` confirmado 2026-11-20 17:29:52 UTC, sustituyó al deploy `dep-dc074fec6qcc73bafvag` (ahora deactivated). **Efecto:** el último resultado confirmado por componente multipunto determina si existe pendiente; OK nuevo oculta atención antigua en CP04 y CP06 sin borrar el diagnóstico, sin inventar reparación; notas provisionales superadas ya no bloquean PDF. No se tocaron variables/flags, SQL, RLS, Auth, Supabase, Storage, Edge, correo, pagos, datos ni APK. **PENDIENTE**: prueba manual del operador en la orden QA1234, con acuse de guardado, recarga, histórico y vista previa PDF; pruebas sintéticas no prueban sesión física/producción. SEC-07/piloto Ignacio bloqueados. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_PILOT_QA_04C_PENDIENTES_VIGENTES_20261120.md).

> **BT-PILOT-QA-04C · OBSERVACIONES MULTIPUNTO VIGENTES (20/11/2026) — CÓDIGO CORREGIDO, CI GENERAL PASS, SIN DESPLIEGUE.** Incidente observado en QA1234: una X `requiere atención/cambio inmediato` seguida de `OK` generaba un nuevo hallazgo sin quitar de «Observaciones pendientes» el diagnóstico anterior, y el PDF seguía bloqueado por notas provisionales antiguas. **Causa confirmada:** `pendingForVehicle` solo leía `resolution=pending`; `multipuntoCommitted` eliminaba por UUID y no por componente; bloqueo PDF/autoguardado examinaba todo el historial. **Solución candidata en `main`:** helper `effectivePendingFindings` calcula la última revisión definitiva por categoría multipunto exacta + vehículo + taller, ignora `sin revisar` al decidir superación, preserva fallos genéricos independientes; CP04 y CP06 consultan la cronología autorizada completa por páginas; tras OK confirmado se oculta solo el pendiente obsoleto, manteniendo 100% de sus registros históricos. PDF/cola no consideran como incompleta una observación previa ya reemplazada por OK. **No se actualiza ningún estado a «reparado»**, no hay borrados, SQL ni llamadas adicionales de escritura. Código `3c68daf`, test sintaxis `e2a86e`, limpieza TS `e617542`. [CI general #44774998665](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774998665) **Web/PWA y Android SUCCESS**, tests unitarios del bloque y compilaciones privadas aprobadas. [QA navegador #44774998785](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774998785) en curso al registrar; **NO CONFUNDIR** con prueba real en la orden del usuario. Actualización y despliegue de esta corrección **NO autorizados/NO ejecutados**; último Render LIVE sigue `f757daf2`. Subsisten SEC-07, R05–R08 y QA físico. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_PILOT_QA_04C_PENDIENTES_VIGENTES_20261120.md).

> **BT-INS-PDF-01 · DESPLIEGUE AUTORIZADO LIVE (20/11/2026) — informe A4 multipunto.** El titular autorizó publicar la vista previa y descarga de borrador en `https://bytetorque.cl` y confirmó el workspace Render **My Workspace**. Se verificó que corresponde al servicio existente `biomotors-taller-demo` (`srv-dbqe4quc6qcc73f275jg`, workspace `tea-daum20gjo6nc73dndfqg`, rama `main`). Previo LIVE: `d8d6ed99` (18/11). Manual Render API trigger autorizado, sin limpieza caché ni cambios de código o variables; deployment `dep-dc074fec6qcc73bafvag` sobre `f757daf2db132782e0822af317447938133d8dd5` **LIVE** confirmado por Render, finalizado 20/11/2026 16:16:23 UTC. El módulo entrega botones **Vista previa PDF** y **Descargar borrador** debajo del acceso a inspección multipunto, solo en CP04 privado y con sesión válida; bloqueado si hay X sin confirmar o notas provisionales sin completar. **Limitación:** Render desplegó el `main` completo (133 commits desde el previo), incluyendo otros candidatos protegidos por flags existentes; no hay despliegue selectivo solo del PDF y NO se examinaron valores secretos/variables activas. No se habilitó ningún servicio alojado nuevo, no se alteraron env, Supabase, RLS, SQL, Storage, Auth, Edge, correo ni pagos. CI del código [44762455426](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455426) y visual [44762455300](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455300) PASS antes de la publicación; **prueba física de apertura/descarga desde navegador real PENDIENTE**, así como envío conjunto COM y seguridad SEC-07. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_INS_PDF_01_20261120.md). **No habilita piloto Ignacio con datos reales.**

> **BT-INS-PDF-01 · INFORME MULTIPUNTO A4 — CANDIDATO 20/11/2026, SIN DESPLIEGUE.** Se añadió generación PDF vectorial real solo en navegador a partir de los 34 ítems y hallazgos **confirmados** de la orden CP04 autenticada, botón "Vista previa PDF", descarga local de borrador, guardas por X aún no confirmadas/diagnósticos provisionales, marca **BORRADOR NO ENVIADO**, resumen OK/atención/inmediato/sin revisar, notas de prioridad/resolución y paginación A4. Código en `src/ordenes/cp04InspectionPdf.ts`, `Cp04MultipuntoPdfPreview.tsx`, UI CP04 y CSS; prueba modelo/PDF A4 en `cp04InspectionPdf.test.ts`. Commits `abe82ea4`, `cc5d610f`, `fea438ad`, `5383cc3d`, `438ab716`, `5b69c0fc`, `bf131773`. **CI general [44762455426](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455426) SUCCESS** (TypeScript web, pruebas 84/84 archivos incluyendo PDF 6/6, Web/PWA, Android, CP04/PLAN04/CP05/CP06 y exclusión público/privado). **QA visual completo #44762455300 SUCCESS**: cinco tamaños, CP04, QA04B F01–F06, CP05 móvil, WebKit Linux y build R1 con HTTP falso. Evidencia: [workflow](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455300). **CI adicional:** [web/Android](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455426) y [navegador](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455300). CI anterior FALLÓ por TS2454 en variable de página (`44761078168`; corregido) y límite de bundles privados (`44761522752`; whitelist estricta solo con CP04 activado). No borrar gates. No correo, emisión, archivo Storage, fotos, firmas, datos sintéticos fijos, cliente/técnico inferido, flags, Render ni cambios Supabase; la muestra PDF local de diseño NO equivale a QA del navegador/producción. Sigue SEC-07 y R05–R08 pendiente; Ignacio no habilitado. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_INS_PDF_01_20261120.md).

> **BT-PILOT-QA-04B · F01–F06 CERRADO EN NAVEGADOR SINTÉTICO (20/11/2026) — QA 12/12 PASS, CI GENERAL PASS, SIN DESPLIEGUE.** Se añadió HTTP falso aislado para cliente, vehículo, OT, hallazgo, resolución y error de escritura; se comprobó en React CP03/CP04 en 390/1366 px. Commits de test `7a7f9808`, `4502b1a1`, `fb6ce866`, `df17b74c`. [CI general 44757774410](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44757774410) **SUCCESS** Web/PWA Android; [QA visual 44757774392](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44757774392) **SUCCESS**, paso QA04B específico PASS con F01–F06 x2. Incidentología: [44755442664](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44755442664) FALLÓ F02 por selector ambiguo `Patente` (QA04B-INC-01); [44756351689](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44756351689) FALLÓ F04 por selector `Resultado` (QA04B-INC-02), ambos corregidos en fixture/test SIN alteración funcional ni ruptura de gates. **La aprobación es solo sintética**, no persistencia alojada, piloto Ignacio ni R05–R08 (14 pasos aún SIN_EJECUTAR). Sin Render/Supabase/SEC-07. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_PILOT_QA_04B_BROWSER_SYNTHETIC_20261120.md). **BT-PILOT-QA-04: A REPASAR** por puertas reales pendientes.

> **BT-SEC-OPERATING-STANDARD-20NOV-01 · DECISIÓN DEL TITULAR / NUEVO ESTÁNDAR PROFESIONAL (20/11/2026).** **Google Drive queda EXCLUIDO de TODO roadmap ACTIVO de cifrado y backups ByteTorque**: NO resolver OAuth `drive.file`, crear carpetas, subir copias ni usar automatizaciones de Drive. Historial SEC-10…SEC-14 se conserva solo para auditoría (no tareas vigentes). Workflows/manual scripts Drive siguen en el repositorio como LEGADO INACTIVO a evaluar para limpieza **sin ejecutarlos ni eliminarlos ahora**. **No eliminar el cifrado GPG existente ni la necesidad de una copia independiente fuera del PC**: se recomendará un soporte externo SSD/USB cifrado y desconectado, o alternativa no Google solo tras aprobación. Investigación de prácticas reales: PostgreSQL, Supabase, restic, pgBackRest, WAL-G, SOPS, Supabase Postgres, OWASP y GitHub Actions. Prioridad P0: inventario offline de extensiones del snapshot ACTUAL existente → laboratorio Supabase PG17 compatible → paridad de restore → roles/servicios externos → aislamiento A/B; posteriores: redundancia no-Drive, operación recurrente y revisión GitHub. **NO repetir exportación ni tocar producción por esta decisión.** [Estándar operativo de seguridad](docs/BT_SEGURIDAD_ESTANDAR_OPERATIVO_20261120.md) · [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_ESTANDAR_Y_SIN_DRIVE_20261120.md). `BT-PILOT-QA-04: A REPASAR`.

> **BT-PILOT-QA-04A · CONFIRMACIÓN DE ESCRITURA ≠ RECARGA POSTERIOR (20/11/2026) — CÓDIGO CANDIDATO/CI PASS, RENDER OFF.** Mientras el chat de seguridad continúa SEC-07 (`EXTENSION_UNAVAILABLE` en restore aislado del NUEVO snapshot cifrado, inventario offline pendiente), el bloque funcional preparó un helper puro `src/official/confirmedWrite.ts` y correcciones en **CP03 clientes/vehículos** y **CP04 órdenes, hallazgos y resolución**. Una escritura con acuse de servidor conserva ID y formulario confirmado aunque falle la lectura de listado/detalle; se muestra un mensaje de recarga pendiente y **no se pide registrar de nuevo**, evitando reintentos humanos que duplicarían registros. No hay auto-reintentos, SQL, RLS, Auth, Storage, Edge, correo, pagos ni datos reales. **Código SHA `ee7651e8`; CI [44748658166](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44748658166) SUCCESS**, **721/721 tests, 83 archivos**, Web/PWA Android, builds OFF/privados y grafo público válido. [BT-FLOW-01 44748658091](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44748658091) SUCCESS. **Incidencia corregida QA04-INC-01:** CI anterior [44748046098](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44748046098) FAIL correctamente al importar helper desde `src/flow/` no permitido; trasladado a `src/official/` sin relajar restricciones. [QA visual 44748658145](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44748658145) **SUCCESS** verificado. **No se desplegó:** Render sigue `d8d6ed99` LIVE. [Plan de preactivación funcional](docs/BT_PREACTIVACION_FUNCIONAL_20261120.md) · [Checkpoint](docs/checkpoints/CHECKPOINT_BT_PILOT_QA_04A_CONFIRMACION_RECARGA_20261120.md). **Próximo funcional:** QA sintética F01–F06 de fallo de recarga sin reenviar escrituras y recorridos R05–R08; posteriores pruebas reales y activaciones únicamente tras SEC-07 + autorización. **BT-PILOT-QA-04: A REPASAR**.

> **BT-SEC07-DOCKER-MANUAL-START-18 · PRECISIÓN DEL PROPIETARIO SOBRE DOCKER (19/11/2026).** Tras el error previo `BT_SEC07_STOP: DOCKER_ENGINE_NOT_READY`, el propietario **abrió manualmente Docker Desktop**, y **Docker funcionó después**. Esto identifica la acción operativa efectiva que permitió `BT_SEC07_DOCKER_ENGINE: RUNNING`, `BT_SEC07_DOCKER_LINUX: OK` y luego la creación del nuevo snapshot cifrado. **Solución aplicada:** abrir/iniciar Docker Desktop y comprobar el daemon; **no fue necesario reinstalar PostgreSQL ni Docker, borrar contenedores, hacer pull de imagen ni modificar GPG/Supabase** para resolver esa etapa. No se puede concluir una causa subyacente más específica de WSL/servicios a partir de esa evidencia. Al retomar, si reaparece el síntoma, **comprobar si Docker Desktop está abierto y Engine listo antes de diagnosticar imágenes**. [Checkpoint cierre](docs/checkpoints/CHECKPOINT_BT_SEC07_CIERRE_JORNADA_20261119.md) · [Informe](docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md). **Pendiente verdadero:** `EXTENSION_UNAVAILABLE` en restore aislado; inventario offline el 20/11. **BT-PILOT-QA-04 A REPASAR**.

> **BT-SEC07-CIERRE-19NOV-17 · CIERRE DE JORNADA 19/11/2026 — RETOMAR VIERNES 20/11.** Se confirmó **nuevo respaldo PostgreSQL actual cifrado** (`BT_SEC07_NEW_ENCRYPTED_SNAPSHOT: OK_NEW_UNIQUE_DIRECTORY`, hashes GPG OK, conexión solo lectura/TLS), **pero restauración del MISMO snapshot falla**: GPG OK y bytes >0, `PG_RESTORE_PROCESS: FAILED`, clase `EXTENSION_UNAVAILABLE` en PostgreSQL 17 Docker estándar. No se sabe aún qué extensión ni se certifica recuperación. `roles.sql.gpg` antiguo sigue vacío y no hay SQL restaurable de roles. **PRIMER BLOQUE MAÑANA:** inventario **offline** preparado `BT_SEC07_EXTENSION_INVENTORY_20261119.zip` (SHA256 `7e3a0a2a16d5d92ec5a2155ff041ab63db5bf4e54aa6d635b834e76c280536f9`, 16/16 tests en asistente, ejecución Windows PENDIENTE), sin nueva exportación ni conexión. **CONSERVAR** backup nuevo/antiguo; no alterar manifiesto ni usar extensiones arbitrarias. [Checkpoint cierre](docs/checkpoints/CHECKPOINT_BT_SEC07_CIERRE_JORNADA_20261119.md) · [Informe completo](docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md). **BT-PILOT-QA-04: A REPASAR.**

> **BT-SEC07-EXTENSION-RESTORE-16 · FALLO DE RESTAURACIÓN AISLADA CLASIFICADO COMO EXTENSIÓN NO DISPONIBLE (19/11/2026).** El propietario ejecutó diagnóstico offline sobre **el MISMO respaldo cifrado nuevo** (sin modificarlo ni consultar Supabase): `SNAPSHOT: ONE_MATCHING_FAILED_RESTORE`, `CIPHERTEXT_HASHES: OK`, `RECIPIENT: MATCHED_HISTORICAL_CIPHERTEXT`, `DOCKER_PG17: LOCAL_LINUX_IMAGE_VERIFIED`, `RESTORE: RESTORE_FULL_FAILED_IN_ISOLATION`, `GPG_PROCESS: OK`, `PG_RESTORE_PROCESS: FAILED`, `DECRYPTED_STREAM: NONZERO`, **`PG_RESTORE_ERROR_CLASS: EXTENSION_UNAVAILABLE`**, `BACKUP_MANIFEST: UNCHANGED`, `FINAL: RECOVERY_NOT_CERTIFIED`, `DIAG_EXIT_CODE: 3`. **Causa inmediata acotada:** el stderr de `pg_restore` correspondió a la categoría de extensión no disponible en la imagen PostgreSQL 17 estándar. No se conoce aún el nombre exacto de esa extensión ni si luego hay otros errores; NO afirmar que el backup sea restaurable completo. Nunca repetir `pg_dump` por esto ni modificar copia existente. La guía oficial Supabase indica compatibilidad de extensiones como requisito en restauración (https://supabase.com/docs/guides/self-hosting/restore-from-platform). Se preparó ZIP **privado de conversación** `BT_SEC07_EXTENSION_INVENTORY_20261119.zip`, **7.677 bytes**, SHA256 `7e3a0a2a16d5d92ec5a2155ff041ab63db5bf4e54aa6d635b834e76c280536f9`, 3 archivos, **16/16 pruebas offline PASS** tras extracción y prueba real GPG sintética/lector TOC simulado PASS. Inventario sin Supabase ni restore: descifra únicamente por pipe hacia `pg_restore --list`, compara nombres con controles .control de la misma imagen PG17 Docker sin red y entrega solo categorías/cantidad/nombres públicos permitidos; resultado de Windows todavía PENDIENTE, no asume extensión concreta. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). **BT-PILOT-QA-04 A REPASAR**.

> **BT-SEC07-SNAPSHOT-CREATED-RESTORE-FAIL-15 · NUEVO SNAPSHOT CIFRADO DEL ESTADO ACTUAL CREADO; RESTORE DOCKER FALLÓ (19/11/2026).** Evidencia real en Windows, bajo autorización explícita de copia cifrada + restore aislado: `BT_SEC07_PREFLIGHT: READY`, `RECIPIENT: MATCHED_HISTORICAL_CIPHERTEXT`, `LOCAL_PREFLIGHT: OK`, `POSTGRES_READONLY_TLS: OK`, `ROLES_CATALOG: OK_METADATA_ONLY`, **`NEW_ENCRYPTED_SNAPSHOT: OK_NEW_UNIQUE_DIRECTORY`**, **`RESTORE: RESTORE_FULL_FAILED_IN_ISOLATION`**, `BACKUP_ROLES_SQL: NOT_INCLUDED`, `FULL_PROJECT_RECOVERY: NOT_CERTIFIED`, `BLOQUE_EXIT_CODE: 3`, `GPG_CONFIGURATION: RESTORED`. **Primer respaldo nuevo tras migraciones EXISTE** en carpeta única local, cifrado GPG con hashes, manifiesto y metadatos de roles; **NO declare recuperabilidad**, el restore PostgreSQL 17 Docker sin red falló y el detalle se descartó por `stderr=DEVNULL` en `decrypt_to_command`. Error original de pg_dumpall roles sigue independiente y sin resolver. **NO volver a ejecutar pg_dump ni crear otra copia solo por este fallo.** Inspeccionada exactamente la fuente v2 (original SHA `0cd6fb1c77ad1d07deb28a72fe4e877c70c4ec424cd93c7ef326e23155a93001`): `isolated_restore` colapsa GPG exit, Docker `pg_restore` exit y bytes<=5 en una sola etiqueta, impidiendo atribuir causa. Preparado **nuevo diagnóstico exclusivamente local sobre el MISMO snapshot ya creado**, sin Supabase, con verificación de SHA de manifiesto + ciphertext, selección única por estado, mismo Docker PG17 network none/tmpfs, una sola repetición focalizada de restore con clasificación segura de stderr en memoria (no se imprime, no se escribe SQL). ZIP privado de chat `BT_SEC07_RESTORE_DIAGNOSTICO_20261119.zip` 9.013 bytes SHA256 `e0c951ed5ecbc47c0b7c58f84db537b5c3f1d2788f024963bae746c741b511d7`; **19/19 pruebas sintéticas PASS dos veces** y `zipfile.testzip OK` en entorno asistente, no probado aún Windows/PG real. No subir scripts ni backup a GitHub público, no manipular manifest existente ni guardar stdout/stderr crudo. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). **BT-PILOT-QA-04 A REPASAR**.

> **BT-SEC07-DOCKER-ENGINE-RECOVERED-14 · DOCKER ENGINE RECUPERADO Y IMAGEN PG17 LOCAL IDENTIFICADA (19/11/2026).** Evidencia Windows del propietario: `BT_SEC07_DOCKER_CONTEXT: LOCAL`, `BT_SEC07_DOCKER_ENGINE: RUNNING`, `BT_SEC07_DOCKER_LINUX: OK`, `BT_SEC07_PG17_IMAGE: PRESENT`, `BT_SEC07_DOCKER_DIAGNOSTIC: COMPLETE`. La causa histórica `DOCKER_ENGINE_NOT_READY` **ya no bloquea** esta sesión; no se ha probado aún la ejecución/version de contenedor imagen y se exige comprobarla con `--rm --network none --pull=never` antes del backup. Todo sigue dentro de la autorización previa: hash v2, Docker local, imagen PG17 real, GNUPGHOME aislado temporal, **una sola exportación cifrada nueva** de PostgreSQL solo lectura + test restore aislado. Prohibido `docker pull` redundante, repetir 43 QA y `pg_dumpall`; preservar respaldos originales. Resultado de este preflight NO constituye backup; SEC-07 original y recuperación integral siguen abiertos, **BT-PILOT-QA-04 A REPASAR**. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md).

> **BT-SEC07-DOCKER-ENGINE-13 · DOCKER ENGINE NO OPERATIVO, DETENCIÓN ANTES DE PULL/BACKUP (19/11/2026).** Evidencia Windows del propietario: `BT_SEC07_PREFLIGHT: FILES_AND_GPG_OK`, `BT_SEC07_STOP: DOCKER_ENGINE_NOT_READY`. Script PowerShell anterior validó hashes y GPG histórico, y comprobó context Docker local antes de consultar `docker version --format '{{.Server.Version}}'` (sin éxito). **Causa inmediata confirmada:** cliente Docker no consiguió consultar versión de Docker Engine en ese momento. **Causa de fondo NO DETERMINADA** (Docker Desktop detenido, inicializándose, WSL/virtualización/daemon, permisos). El código se detuvo **antes del pull de imagen, contraseña PostgreSQL, conexión, exportación o restauración**; no hay respaldo del estado actual. No reinstalar PostgreSQL, no asumir que imagen es ausente, no hacer reinicios destructivos, `wsl --unregister`, `docker system prune` ni `docker desktop reset`. Documentación oficial: https://docs.docker.com/desktop/features/desktop-cli/ permite `docker desktop start` y `status`; https://docs.docker.com/desktop/setup/install/windows-install/ señala que Docker Desktop puede no arrancar automáticamente; https://docs.docker.com/desktop/troubleshoot-and-support/troubleshoot/topics para fallos WSL. **Próximo:** un bloque PowerShell acotado que valida Docker local, inicia solo Docker Desktop si no está operativo y si está instalado, comprueba Engine y tipo Linux con espera finita, comprueba imágenes PG17 ya presentes (sin pull, backup ni secretos), emite **solo etiquetas**. No ejecutar export hasta Engine validado. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). **SEC-07 / BT-PILOT-QA-04 A REPASAR**.

> **BT-SEC07-DOCKER-PG17-12 · BLOQUEO EN IMAGEN DOCKER PG17 ANTES DE CUALQUIER BACKUP NUEVO (19/11/2026).** Windows PowerShell devolvió `BT_SEC07_PREFLIGHT: HASHES_OK`, `HISTORICAL_KEYRING_SELECTED`, `BT_SEC07_RECIPIENT: MATCHED_HISTORICAL_CIPHERTEXT`, `BT_SEC07_STOP: DOCKER_PG17_IMAGE_NOT_FOUND_NO_AUTO_PULL`, `BLOQUE_EXIT_CODE: 2`, `BT_SEC07_GPG_CONFIGURATION: RESTORED`. **Evidencia:** correspondencia GPG ahora superada; el orquestador v2 interrumpió dentro de `docker_image` antes de contraseña, PostgreSQL, exportación, creación de carpeta nueva o Docker restore. Código v2 prueba solo las etiquetas `postgres:17`, `postgres:17-bookworm` y `postgres:17.12-bookworm` con `docker image inspect` y `docker run --rm --network none ... postgres --version`, y muestra la **misma etiqueta** si imagen no existe, Docker Engine no está listo o versión/arranque del test falla: **NO atribuir automáticamente a imagen faltante hasta distinguir daemon**. La etiqueta oficial `postgres:17.12-bookworm` figura en Docker Hub: https://hub.docker.com/_/postgres . **Próxima acción agrupada:** validar hashes v2 (sin repetir 43 tests), Docker Engine y tres etiquetas, y si faltan imágenes usables con Engine activo descargar explícitamente **solo** `postgres:17.12-bookworm` desde la imagen oficial, verificar `postgres --version` sin red y continuar **una única vez** el backup cifrado+restore aislado ya autorizado en el PC; restaurar siempre `GNUPGHOME`. Sin permisos de Docker/desconectado, detenerse **sin pull ni export** y reportar etiqueta fija. No tocar GPG ni Docker ajeno, no volver a ejecutar sin analizar. **Ningún snapshot actual ni restauración nueva demostrados; SEC-07 productor pg_dumpall desconocido; piloto A REPASAR**. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md).

> **BT-SEC07-GPG-ISOLATED-MATCH-11 · CLAVE PRIVADA HISTÓRICA LOCALIZADA Y VERIFICADA POR METADATOS (19/11/2026), RESPALDO ACTUAL TODAVÍA NO CREADO.** El propietario ejecutó la herramienta offline GPG SHA-verificada con `GNUPGHOME` temporal apuntando a `%LOCALAPPDATA%\ByteTorque-GPG-Prueba\gnupg-aislado` (directorio histórico conocido): `ALMACEN_HISTORICO: ENCONTRADO`, `DIAGNOSTICO: INTEGRIDAD_OK`, `SELFTEST: 14_OF_14_OK`, `GPG_HOME_MODE: CUSTOM`, `SECRET_KEY_RECORDS: FOUND`, `PUBLIC_RECIPIENT: MATCH`, `SECRET_RECIPIENT: MATCH`, `V2_MATCHER: MATCH`, `FINAL: KEY_IDENTIFIED_RECHECK_V2_RUNTIME`, `DIAG_EXIT_CODE: 0`, `CONFIGURACION_GPG_ORIGINAL: RESTAURADA`. **Conclusión comprobada:** el anillo aislado identifica una clave privada correspondiente al ciphertext histórico, mientras que el anillo predeterminado carece de entradas privadas; esta discrepancia explica el prerrequisito fallido de v2. No prueba desbloqueo de passphrase ni descifrado actual. **Siguiente acción bajo autorización ya otorgada para nuevo backup + restore:** usar el **mismo paquete v2 previamente probado 43/43**, con hashes SHA256 de ZIP, orquestador y módulo principal verificados, y asignar `GNUPGHOME` únicamente durante ejecución de `python -B bt_sec07_backup_restore.py` con `try/finally` para restaurarlo después. No reinstalar GPG, no importar/exportar ni rotar claves, no volver a ejecutar diagnóstico de roles/ZIP v1, no sobrescribir respaldo antiguo. El flujo v2 cifra snapshot nuevo con directorio/ID único y ensaya restore Docker offline; **sus límites de roles SQL, Supabase managed y datos externos siguen vigentes**. Sin nuevas conexiones GPG/SQL, backup o restore realizadas al documentar este éxito. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). **BT-PILOT-QA-04: A REPASAR**.

> **BT-SEC07-GPG-HISTORICAL-ISOLATED-10 · LOCALIZADO UN ALMACÉN GPG AISLADO HISTÓRICO DOCUMENTADO (19/11/2026) — COMPROBACIÓN PENDIENTE.** Lectura del checkpoint `docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md` demuestra que el 19/11 se validó **existencia** del directorio `$env:LOCALAPPDATA\ByteTorque-GPG-Prueba\gnupg-aislado`; expresamente NO se verificó si contenía privada. Este dato permite conciliar diagnóstico actual `GNUPGHOME: DEFAULT`, `SECRET_KEY_RECORDS: NONE`, `PUBLIC_RECIPIENT: MATCH`: **el diagnóstico previo NO inspeccionó el almacén aislado histórico**. No asegurar que ese almacén contenga la clave. **Siguiente paso acotado, offline, sin nueva exportación ni descifrado:** reutilizar `BT_SEC07_GPG_DIAGNOSTICO_OFFLINE_20261119.py` verificado, configurar `GNUPGHOME` *solo temporalmente para ese proceso* apuntando a esa ruta exacta preexistente, devolver únicamente etiquetas del diagnóstico y restablecer valor original; abortar si no existe el directorio. No escanear perfiles/discos ni importar claves. [Checkpoint actualizado](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). Ningún servicio ni backup alterado; **BT-PILOT-QA-04: A REPASAR**.

> **BT-SEC07-GPG-CUSTODIA-09 · CAUSA INMEDIATA GPG IDENTIFICADA EN WINDOWS (19/11/2026) — RESPALDO NUEVO BLOQUEADO ANTES DE SUPABASE.** Resultado propietario de `BT_SEC07_GPG_DIAGNOSTICO_OFFLINE_20261119.py`: `DIAG_INTEGRIDAD_OK`, `BT_SEC07_SELFTEST: 14_OF_14_OK`, `GPG_HOME_MODE: DEFAULT`, `HISTORICAL_FILE: FOUND`, `PACKET_VISIBLE_RECIPIENTS: ONE`, `SECRET_LIST_COMMAND: OK`, `PUBLIC_LIST_COMMAND: OK`, **`SECRET_KEY_RECORDS: NONE`**, `PUBLIC_RECIPIENT: MATCH`, `SECRET_RECIPIENT: NOT_FOUND`, `V2_MATCHER: NOT_FOUND`, `FINAL: NO_SECRET_MATCH_IN_ACTIVE_KEYRING_PUBLIC_ONLY`, `DIAG_EXIT_CODE: 2`. **Hallazgo demostrado:** anillo GPG predeterminado del usuario contiene clave pública concordante pero **ninguna entrada privada**; por ello v2 no puede comprobar recuperación de ciphertext histórico. **No demostrar pérdida definitiva**, el privado pudo custodiarse en otro GNUPGHOME o exportación externa. Como en historial el SQL antiguo sí se descifró y restauró, conciliar dónde y cómo se hizo aquella operación antes de generar nuevas claves. **Acción bloqueada:** no ejecutar v1/v2, ni intentar un respaldo cifrado que no pueda descifrarse; no crear/importar/exportar claves ni buscar en otros perfiles sin consentimiento específico. **Próximo bloque:** auditoría de custodia GPG acotada, solo metadatos sanitizados de los almacenes/respaldos **autorizados**; localizar clave privada existente, cotejar destinatario sin divulgar datos y definir prueba de recuperación aislada. SEC-07 de `pg_dumpall` permanece sin causa; **BT-PILOT-QA-04: A REPASAR**. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). La comprobación offline no consultó Supabase ni modificó respaldo.

> **BT-SEC-BACKUP-RECOVERY-ERR08-GPG · CANDIDATO V2 SE DETUVO EN IDENTIDAD GPG, SIN CONTACTO CON SUPABASE (19/11/2026).** El propietario informó `QA_OFFLINE_OK`, `INICIANDO_RESPALDO_AUTORIZADO_V2`, `BT_SEC07_STOP: HISTORICAL_RECIPIENT_KEY_NOT_UNIQUELY_PRESENT`, `BLOQUE_EXIT_CODE: 2`. **Causa inmediata confirmada en fuente del orquestador v2**: `old_fingerprint` encontró exactamente un ID destinatario público en `database.dump.gpg`, ejecutó listado de claves privadas GPG y el parser no obtuvo **exactamente una huella primaria** asociada; no se conoce si es ausencia de clave del anillo consultado, ubicación alternativa, un parser deficiente u otra condición local. La parada ocurre antes de pedir password, iniciar Docker, `check_db`, crear nueva copia, descifrar/restaurar o conectarse a Supabase; **nuevo respaldo sigue sin existir**. Se preparó herramienta privada de diagnóstico GPG **sin conexión** `BT_SEC07_GPG_DIAGNOSTICO_OFFLINE_20261119.py`, SHA256 `b6d1d14a30b6402aba5406974cfa049163dcb7098d7fb33e651fc9c6c95ec508`, 14/14 pruebas internas PASS y prueba con GPG real/clave+artefacto sintéticos PASS. Solo lee encabezado histórico y listado de claves, muestra etiquetas fijas, nunca huellas/SQL/secretos. **Próxima operación: un único diagnóstico offline en Windows con verificación SHA, no repetir v2 ni backup hasta resolver discrepancia y comprobar custodias.** [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). SEC-07 original `pg_dumpall` sigue causa no determinada; `BT-PILOT-QA-04: A REPASAR`.

> **BT-SEC-BACKUP-RECOVERY-ERR07-V2 · BLOQUE DE RESPALDO AUTORIZADO DETENIDO EN PRERREQUISITO LOCAL; V2 REPARADO (19/11/2026).** Resultado Windows de paquete v1: `ZIP_INTEGRIDAD_OK`; `Ran 35 tests in 1.042s, OK`; `QA_OFFLINE_OK`; `INICIANDO_RESPALDO_AUTORIZADO`; `BT_SEC07_STOP: HISTORICAL_MANIFEST_MISSING`; `BLOQUE_EXIT_CODE: 2`. **Causa confirmada en código v1:** el orquestador exigía `manifest.json` en carpeta fija de backup histórico, pero exportador original solo escribe ese manifiesto tras éxito de roles, operación que falló (151 bytes ciphertext, 0 bytes descifrados). **Fallo de diseño de nuestro candidato, NO culpa de PowerShell/Supabase/clave**. El programa se detuvo antes de solicitar contraseña o conectar a Supabase, antes de crear nuevo backup/restauración; no tocó GPG antiguo ni producción. **Corrección v2:** obtiene el key ID destinatario del encabezado OpenPGP de `database.dump.gpg` histórico usando directorio GPG temporal sin clave privada y empareja su subclave con la huella primaria de una clave privada **existente** en el GPG local; si hay manifiesto, contrasta proyecto y huella; si no, continúa solo cuando hay un único match. No descifra backup histórico, no crea/rota claves, ni revela clave/SQL. Bloquea identidad desconocida/ambigua y hashes/archivo ausentes. Nuevo ZIP privado `BT_SEC07_RESPALDO_ACTUAL_CORREGIDO_20261119.zip` 25.466 bytes, SHA256 `9ee61398d67cd7e811f211c70a449878009b36271fce61082479a09db7a6042d`. **43/43 tests offline PASS** desde ZIP extraído; **3 verificaciones reales con clave/ciphertext GPG totalmente sintéticos PASS** en entorno de pruebas del asistente, sin Supabase. Pendiente: validar v2 en Windows y, bajo autorización previa del propietario al bloque, intentar una única ejecución de respaldo actual cifrado y restore aislado; no ejecutar v1 de nuevo, no sobreescribir directorios. [Checkpoint detallado](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). **SEC-07 abierto, BT-PILOT-QA-04 A REPASAR**.

> **BT-SEC-BACKUP-RECOVERY-PREP-07 · NUEVO RESPALDO ACTUAL + ENSAYO DOCKER AISLADO (19/11/2026) — PAQUETE PREPARADO, EJECUCIÓN EN PC PENDIENTE.** Propietario autorizó expresamente un **nuevo** respaldo PostgreSQL cifrado y posterior restauración aislada, sin escrituras a Supabase, sin sobrescribir copias previas y sin usar Drive. Se auditó el ZIP SEC-07 anterior y el código local original; se preparó paquete **privado en esta conversación**, `BT_SEC07_RESPALDO_ACTUAL_20261119.zip` (22.810 B, SHA-256 `0fd76eaa482777a8b920dbdfe32ef3900024ae0ce4c654f88e8f431784610e5a`), **NO incorporado al repositorio público**. Incluye orquestador Python de un solo bloque, candidatos, instrucciones y 35 pruebas: **35/35 PASS offline**, repetido desde ZIP extraído. En ejecución futura, comprueba huella destinatario en manifiesto histórico y existencia de GPG privado, CA única, Docker imagen PG17 instalada, y conecta con TLS `verify-full`, sesión pooler 5432 y `default_transaction_read_only=on`. Evita una tercera ejecución ciega de `pg_dumpall` (SEC-07); en su lugar cifra metadatos de roles `SELECT pg_roles/pg_auth_members` **que NO reemplazan roles SQL ni passwords**, y exporta con `pg_dump -Fc` mediante pipe a GPG con validación de bytes `PGDMP`, códigos de proceso, SHA y directorio único; ensaya restauración `pg_restore` en Docker local `--network none` sin puertos, PostgreSQL 17 en tmpfs, transmitiendo SQL solo por pipes y creando roles NOLOGIN de laboratorio. Si roles metadata fallan, los datos se respaldan si exportación válida; si restore falla, conservar archivo nuevo y marcar **no recuperado**, sin afirmar éxito. **Límites:** no se probó con Supabase, Docker/GPG real del PC, extensiones propietarias ni servicios (Storage bytes, Edge, Auth config). No hay roles SQL, ni cobertura de proyecto integral. **Ningún backup nuevo existe aún demostrado**; scripts originales/GPG viejos no cambiados. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). Próximo: ejecutar **una sola vez** el ZIP en Windows mediante instrucción autocontenida `& { ... }`, compartir solo etiquetas `BT_SEC07_*` y exit code; no reintentar sin clasificar. **SEC-07 abierto, BT-PILOT-QA-04 A REPASAR.**

> **BT-SEC-07-WIN-QA-06 · WINDOWS OFFLINE QA REAL APROBADA (19/11/2026).** El propietario descargó `BT_SEC07_BLOQUE_20261119.zip` al PC Windows, verificó SHA-256 con `INTEGRIDAD_ZIP: OK` (esperado `60b001e1a44be1cb9dbbecb0d64dd1ae46f0a8b569c58f092436ff7d6d152f35`), extrajo a carpeta independiente `$HOME\BT-SEC07-QA-VERIFICADO` y ejecutó `python -B -m unittest -q test_BT_SEC07_offline.py`: `Ran 20 tests in 0.881s / OK / PRUEBAS_EXIT_CODE: 0`. **VALIDADO: 20/20 en Windows, sin red, productores/cifrado simulados.** Incidencia de interfaz `else : no se reconoce` al pegar un `if` y `else` en ejecuciones separadas fue corregida con script autocontenido `& { ... }`; no afecta PostgreSQL ni es causa de SEC-07. El paquete **no está activado** y no reemplaza programas originales; no se ha probado con GPG/Postgres reales ni se ha hecho backup/restauración del estado actual. La exportación anterior de roles permanece inválida (0 bytes descifrados) y causa de exit 1 con stderr 75B no identificada. Próximo bloque: escoger estrategia de respaldos según [documentación oficial Supabase CLI](https://supabase.com/docs/guides/self-hosting/restore-from-platform) (rol/estructura/datos; CLI aplica filtros Supabase) y desarrollar plan con pruebas de recuperación aislada y controles de privacidad; *antes de exportar o conectarse de nuevo*, autorización expresa. [Checkpoint actualizado](docs/checkpoints/CHECKPOINT_BT_SEC_07_LOCAL_CANDIDATE_20261119.md). **BT-PILOT-QA-04: A REPASAR**.

> **BT-SEC-07-BLOQUE-CANDIDATO-05 · CORRECCIÓN DE CANDIDATOS LOCALES + TESTS OFFLINE (19/11/2026): PREPARADO, NO ACTIVADO.** Se recibieron y revisaron los **dos scripts originales** del PC del propietario: `bytetorque_respaldo_local.py` (13.955 B, SHA256 `6218b147ccf01bc271d12cbd6a950ed8cafeb1f0381338c3b822eba4c`) y `ByteTorque_Diagnostico_Roles.py` (4.465 B, SHA256 `9f81e3430de2fcf8f0b8ab38563ade89ee9b2ee61495dbd733fc03a3db62f11c`). Código inspeccionado confirma `HOST=aws-0-sa-east-1.pooler.supabase.com`, `PORT=5432` (pooler de sesión) y no una `DB` con URI; resultado de inspección previa era coherente. Correcciones en **copia descargable independiente, NO en repo**: conteo de bytes SQL por pipe en memoria; rechazo de origen vacío (previene ciphertext válido con SQL vacío); magic `PGDMP` en archive de base; limpieza de salida inválida, cancelación de procesos y timeout; directorios temporales únicos con promoción solo tras hash/manifiesto; segunda copia por staging; diagnóstico cuenta stdout sin emitir SQL y categoriza stderr con etiquetas fijas. **20/20 pruebas unitarias sintéticas en entorno local PASS** (GPG/pg_dump simulados, sin red) y AST de 3 .py OK. ZIP `BT_SEC07_BLOQUE_20261119.zip` (14.466 B, SHA256 `60b001e1a44be1cb9dbbecb0d64dd1ae46f0a8b569c58f092436ff7d6d152f35`), compartido solo en conversación, **no versionado en GitHub público**. Originales intactos en el runtime; no se efectuó ninguna conexión, exportación real, restauración, despliegue, ni operación de Drive. **SEC-07 aún abierto:** último `pg_dumpall` fue exit 1/stderr 75B no clasificado; ninguna prueba determina su causa; el histórico `roles.sql.gpg` sigue descifrando 0 bytes, respaldo SQL antiguo previo a migraciones. Validar candidato en Windows offline como siguiente bloque; después pedir autorización concreta para conexión/diagnóstico con nueva hipótesis o considerar `supabase db dump --role-only` oficial antes de nuevo respaldo con identificador único y restauración aislada. [Checkpoint del bloque](docs/checkpoints/CHECKPOINT_BT_SEC_07_LOCAL_CANDIDATE_20261119.md). **BT-PILOT-QA-04: A REPASAR.**

> **BT-SEC-07-BLOQUES-GRANDES-04 · DIAGNÓSTICO CONSOLIDADO Y NUEVO MÉTODO DE TRABAJO (19/11/2026).** Petición del propietario: dejar de realizar pasos microscópicos y organizar bloques completos de investigación + corrección candidata + pruebas sintéticas + checkpoint. Última inspección estática **local**: `POOLER_REFERENCIA_LINEA: 23`, `PUERTO_REFERENCIA: 5432 LINEA: 24`, `INSPECCION_COMPLETADA`. Confirma dos referencias en el código; **no confirma la cadena final de conexión**. Supabase documenta que `pooler.supabase.com:5432` corresponde a **pooler de sesión**, alternativa válida para clientes IPv4. PostgreSQL 17 admite `pg_dumpall --roles-only --no-role-passwords` y Supabase recomienda considerar su CLI `supabase db dump --role-only` al migrar/restaurar, con filtros de roles reservados; **ninguno de esos hechos determina la causa** del `pg_dumpall` local con exit 1 y stderr 75 B descartados. La brecha de respaldo sigue: `roles.sql.gpg` 151 B/0 B plaintext, y dump previo a CP05/Creador/PLAN04A. Se comprobó en inspección previa que el exportador local carece de validación de longitud del flujo original y puede conservar archivo inválido al fallar. **Bloque siguiente:** revisar los DOS archivos Python originales completos, verificando previamente que no contengan secretos, diseñar parche en copia aislada y pruebas simuladas de stdout vacío, fallos de productor/GPG, timeout, limpieza y sin filtración; evaluar ruta CLI de roles sin ejecutar conexiones ni crear dumps. Solicitar **una sola** entrega conjunta de los scripts o reporte local sanitizado; **no** hacer tercera prueba de roles en vivo sin nueva justificación/autorización. Guía: [SEC-07](docs/checkpoints/CHECKPOINT_BT_SEC_07_ROLES_DIAGNOSTICO_FOCALIZADO_20261119.md). **Estado: INVESTIGACIÓN Y DOCUMENTACIÓN; PILOTO A REPASAR.**

> **BT-SEC-07-POOLER-CODIGO-03 · REFERENCIA DE POOLER EN CÓDIGO LOCAL (19/11/2026) — NO EQUIVALE A CONEXIÓN EFECTIVA.** Inspección AST local del propietario en `bytetorque_respaldo_local.py`: `ENDPOINT_EN_CODIGO: POOLER` y `INSPECCION_LOCAL_OK`. Esto confirma que hay un literal que contiene referencia a host pooler de Supabase, pero todavía NO establece puerto, endpoint efectivo ni causa raíz de `pg_dumpall` (exit 1, stderr 75 B, patrón desconocido). Según guías oficiales de Supabase, pooler de sesión 5432 se admite para volcado/restauración; transacciones 6543 no debe asumirse apto para este flujo. **Siguiente:** inspección estática y saneada únicamente de la asignación `DB` (clasificar puerto SIN mostrar URI/host/usuario/contraseña); no repetir contacto remoto sin diagnóstico justificado y consentimiento. No hubo nuevos respaldos, consultas PostgreSQL ni cambios alojados. [Checkpoint SEC-07](docs/checkpoints/CHECKPOINT_BT_SEC_07_ROLES_DIAGNOSTICO_FOCALIZADO_20261119.md). **BT-PILOT-QA-04: A REPASAR.**

> **BT-SEC-07-LOCAL-DIAG-02 · DIAGNÓSTICO DE ROLES SIN CAUSA DETERMINADA (19/11/2026) — BLOQUEADO SIN REPETICIÓN.** En el PC del propietario PostgreSQL 17.12 (pg_dumpall, psql, pg_dump, pg_restore) fue comprobado mediante rutas absolutas; `SEC-15` resuelto para disponibilidad de binarios, sin editar PATH. Se localizó `bytetorque_respaldo_local.py` y el diagnóstico existente; una copia local `ByteTorque_Diagnostico_Roles_SEC07_CANDIDATO.py` quedó verificada por SHA-256, ampliada y con sintaxis PASS; clasificador inicial 8/8 casos sintéticos. Dos ejecuciones *autorizadas* de diagnóstico de solo lectura (sin guardar SQL ni stderr): primera `POSTGRES_TLS_OK`/falla no clasificada; segunda `POSTGRES_TLS_OK`; `SEC07_EXIT_CODE=1`; `SEC07_STDERR_BYTES=75`; `SEC07_INDICIOS=SIN_INDICIOS_CONOCIDOS`; `ROLES_FALLO_NO_CLASIFICADO`. **La causa del fallo de pg_dumpall SIGUE NO DETERMINADA**. TLS previo OK no prueba la exportación; 75 bytes de stderr fueron descartados, sin texto recuperable. Hallazgos locales: el exportador cifra stdout sin verificar longitud original y puede conservar ciphertext parcial/inválido tras falla. `roles.sql.gpg` original (151 B, 0 B descifrados) preservado; dump SQL histórico y restauración de 7 tablas NO repetidos. Una tentativa PowerShell de `elseif/else` en líneas separadas falló con `CommandNotFoundException`; se verificó que aún no existía copia y luego se creó de manera independiente (HASH OK), sin sobrescribir. **NO hacer tercera exportación a ciegas**; revisar evidencia sin reconectar, diseñar captura sanitizada no reversible y evaluar ruta oficial alternativa/documentación antes de solicitar nueva autorización. No hubo cambios en Supabase/Render/Drive, ni backups nuevos. [Checkpoint SEC-07](docs/checkpoints/CHECKPOINT_BT_SEC_07_ROLES_DIAGNOSTICO_FOCALIZADO_20261119.md). **BT-PILOT-QA-04: A REPASAR.**

> **BT-SEC-REVIEW-01 · AUDITORÍA HISTÓRICA DE SEGURIDAD, WORK/ASTRA, ERRORES Y SOLUCIONES (19/11/2026) — INFORME COMPLETADO, RECUPERACIÓN TOTAL AÚN PENDIENTE.** Revisión de `main`, checkpoints, **13 workflows manuales**, scripts locales accesibles, hechos reportados por el propietario y metadatos **solo lectura** de Supabase/Render. **Hallazgos:** PostgreSQL **17 ya instalado** en PC (17/11); en PowerShell nuevo `pg_dumpall/psql` no están en PATH pero esto **no implica desinstalación**; restauración SQL en Docker `network none` **sí ejecutada** y 7 tablas/25 filas/16 políticas verificadas; `database.dump.gpg` 89.091 bytes; `roles.sql.gpg` 151 bytes descifra con éxito a **0 bytes** y es inválido. **CRÍTICO:** respaldo local 17/11 **14:41 UTC precede** migraciones Supabase CP05 15:48, Creador 17:07 y PLAN-04A 18:41, por lo que **no recupera el estado SQL actual**. **GitHub Drive:** diagnóstico libpq [44084850284](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44084850284) **SUCCESS**, pero exportaciones cloud sin readback y posterior provisión [44094695940](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44094695940) **FAILURE DRIVE_FOLDER_INACCESSIBLE** (sí se ejecutó; el checkpoint previo quedó desactualizado). **Supabase actual:** `ACTIVE_HEALTHY`, 8 migraciones, 12/12 tablas públicas RLS, 8/8 privadas RLS+FORCE sin SELECT directo anon/auth, Storage 0 buckets y Edge owner-onboarding activa. **Avisos:** leaked-password-protection OFF, 6 RPC SECURITY DEFINER revisables (pueden ser intencionales), y 8 tablas privadas sin policies (denegación prevista). **Repo PUBLIC temporal**, Render `d8d6ed99` LIVE. **Ningún secreto, backup, SQL alojado, Render ni OAuth alterado en esta auditoría.** [Informe exhaustivo y registro SEC-01…SEC-17](docs/BT_SEGURIDAD_AUDITORIA_RETROSPECTIVA_20261119.md). **Regla nueva:** toda falla futura registra error, causa demostrada/hipótesis, corrección, prueba, pendiente y condición de reintento antes de otro intento; [AGENTS.md](AGENTS.md). **Próximo:** verificar ruta histórica `C:\\Program Files\\PostgreSQL\\17\\bin` por ruta absoluta, revisar productor local de roles, luego (solo con autorización) respaldo **NUEVO** del estado actual y recuperación aislada; Drive por separado sin reintentos ciegos. Checkpoint [BT-SEC-REVIEW-01](docs/checkpoints/CHECKPOINT_BT_SEC_REVIEW_20261119.md). **BT-PILOT-QA-04: A REPASAR**.

> **BT-SEC-ROLES-PGTOOLS-04 · POSTGRESQL NO RESUELTO EN PATH (19/11/2026).** El propietario consultó `Get-Command`: `pg_dumpall.exe: NO ENCONTRADO EN PATH`, `psql.exe: NO ENCONTRADO EN PATH`. **Esto NO demuestra desinstalación ni versión ausente**; no reinstalar ni cambiar PATH. Próxima acción no invasiva: consultar carpetas habituales `Program Files\\PostgreSQL\\*\\bin` por rutas absolutas, además del estado Docker, antes de profundizar en el programa Python de diagnóstico `bytetorque_respaldo_local.py`. El `roles.sql.gpg` existente **sí se descifra, pero a exactamente 0 bytes**, y no sirve como copia de roles: conservar original; no repetir respaldo ni restauración de la base. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md). Sin cambios alojados; **BT-PILOT-QA-04: A REPASAR**.

> **BT-SEC-ROLES-GPG-03 · RESPALDO DE ROLES DESCIFRABLE PERO VACÍO (19/11/2026) — CONFIRMADO A NIVEL BINARIO.** PowerShell comprobó sobre el `roles.sql.gpg` ORIGINAL de 151 bytes: `ROLES_DESCIFRADO_EXIT: 0` y `ROLES_BYTES_DESCIFRADOS: 0`. **No sirve como backup de roles.** Preservarlo sin sobrescribir. El diagnóstico anterior del productor dio `POSTGRES_TLS_OK` y `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` para `pg_dumpall --roles-only --no-role-passwords`; causa aún desconocida. **Siguiente:** inspección no invasiva de versiones de `pg_dumpall` y `psql`, después diagnóstico focalizado con salida sanitizada, y solo tras autorización nueva exportación de roles a otro ciphertext. No repetir cifrado del dump ni restauración SQL de siete tablas ya efectuada. [Checkpoint actualizado](docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md). Sin Supabase alojado/Render/Drive modificados; **BT-PILOT-QA-04: A REPASAR**.

> **BT-SEC-ROLES-GPG-02 · DESCIFRADO OK, SALIDA DE ROLES SIN TEXTO (19/11/2026).** Nueva prueba PowerShell del propietario sobre el `roles.sql.gpg` original de 151 bytes, usando GPG local y medición sin mostrar el SQL: `ROLES_DESCIFRADO_EXIT: 0`, `ROLES_LINEAS: 0`, `ROLES_CARACTERES: 0`. GPG terminó normalmente, pero la salida **parece vacía**; aún falta **contar bytes descifrados** para confirmarlo. La causa original de `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` no está probada; podría haberse cifrado stdin vacío. **Siguiente:** conteo binario local sin materializar texto ni tocar el backup; solo después diagnóstico del productor de roles, sin repetir copia GPG de base ni restauración SQL de siete tablas. [Checkpoint con evidencia](docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md). Sin operaciones alojadas, Render ni Drive. **BT-PILOT-QA-04: A REPASAR**.

> **BT-SEC-LOCAL-INVENTORY-01 · RESPALDO CIFRADO EXISTENTE CONFIRMADO EN PC (19/11/2026).** El propietario ejecutó comprobación PowerShell **solo lectura**: en `$HOME/BT-Backups/bytetorque-local-20261117T144118Z-8c1f8a323a924d44a6b8e853e6faa756/`, ambos archivos originales están **PRESENTES**: `database.dump.gpg` 89.091 bytes y `roles.sql.gpg` 151 bytes; también **EXISTE** el directorio GPG aislado bajo `LOCALAPPDATA/ByteTorque-GPG-Prueba/gnupg-aislado`. Esta lectura NO verifica hash, contenido de roles ni clave privada, y no repite la restauración SQL previa (7 tablas coincidentes). **Siguiente:** verificar sin divulgar contenido que `roles.sql.gpg` se descifra y contiene SQL; si falla o está vacío, diagnosticar extracción de roles focalizadamente, sin recrear claves ni sobrescribir respaldos. Sin cambios en Supabase/Drive/Render. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md). **BT-PILOT-QA-04: A REPASAR**.

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
