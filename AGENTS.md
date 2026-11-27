## 27/11/2026 — BT-COMMERCIAL-HARDENING-01-DELTA-01 / REVISIÓN PENDIENTE

Base exclusiva 1b5a3cdb91ef6b7dead7c3ff3a8de00082f6e860. Contrato SQL real contrastado: reserva vencida no consumida recupera UUID; confirmada vencida rechaza y conserva consumo. Reingreso con UUID ligado a sesión revocada ofrece renovación explícita solo tras revalidación de usuario y lectura autorizada actual en servidor; sin bytes de fallback ni consumo automático. SQL sin cambios. 12 regresiones focalizadas con cuerpos SQL reales en PostgreSQL 17 aislado PASS; las 34 anteriores siguen históricas sin repetición. [Checkpoint y límites](docs/checkpoints/CHECKPOINT_BT_COMMERCIAL_HARDENING_01_DELTA_01_20261127.md). Entrega privada DTK-ERR-056; sin push oficial, producción, migraciones, instalación o activación. No aceptación integral ni autorización de despliegue.

---

## 27/11/2026 — BT-COMMERCIAL-HARDENING-01 / CANDIDATO PARA REVISIÓN

Base oficial d9977e046372bf98a1640f975ec1ce90c24c9309. Endurecimiento focalizado de acciones documentales: cada preview/descarga consulta servidor; UUID estable por actor/taller/recurso, snapshot verificado en servidor, sin caché de bytes ni rotación por reloj. Invalida visores/Blob URLs/respuestas pendientes por plan, sesión, rol y taller sin remontar formularios. Expiración/cambio de vigencia se informa mediante código HTTP saneado en los tres handlers; nueva operación solo con confirmación explícita, no automática. SQL, RLS, Storage, límites y PDF intactos. Informes preliminares/ZIP/historial conservan validación y cercas de contexto; sin bloques B/C.

20 casos unitarios/HTTP focalizados y 14 Chromium sintéticos PASS; TypeScript/builds/grafo, empaquetado y sintaxis PASS. Evidencia previa SQL reutilizada, sin repetir 44/8 ni suites históricas completas. [Checkpoint del candidato, pruebas y límites](docs/checkpoints/CHECKPOINT_BT_COMMERCIAL_HARDENING_01_20261127.md). TARGETED_HARDENING_REVIEW_PENDING: revisión independiente y CI/runtime oficial pendientes, no aceptación comercial integral ni autorización de despliegue. No se promete revocar bytes/copia legítima anterior; plan remoto se conoce por polling, nuevas acciones ya revalidan servidor.

Entrega exclusiva DTK-ERR-056 en bytetorque-review/main/BT-COMMERCIAL-HARDENING-01, anteriores intactas. Sin push oficial, Supabase/SQL alojado, Render, Edge, secretos, dependencias instaladas o nueva rama. Correo/pagos/logos/registro y Auto-Deploy no se activan; SEC07 cerrado. No iniciar otras funcionalidades.

---

## 27/11/2026 UTC — ACCEPTANCE-10/11 / TARGETED_HARDENING_PENDING

Downgrade en sesión abierta: titular reporta rechazo multipunto; read-only confirma Básico activo y 3 multipunto/2 quote/0 reservas. Full recuperado y verificado con mismos consumos. Límites y aislamiento: reutilizar 44 PASS laboratorio comercial y 8 PASS DELTA, CI focalizada 6/6 histórica; guardas actuales SQL/ACL/RLS/Storage revisadas en vivo, sin agotar cupos ni E2E entre talleres alojados. Hallazgo inicial de PDF Plus reutilizado bajo Básico no reproducido; Cp04MultipuntoPdfPreview usa caché local que evita consulta en acciones posteriores si contexto no se refresca. Pendiente endurecimiento focalizado antes de cierre/piloto: revalidación servidor en nuevas acciones UI con misma identidad/lease válida, invalidar caché/visor por cambio plan/sesión, prevenir carreras y conservar idempotencia. No prometer revocar bytes ya obtenidos. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_COMMERCIAL_ACCEPTANCE_10_11_20261127.md). Solo documentación, Auto-Deploy OFF; sin cambios productivos ni Codex.

---

## 27/11/2026 UTC — ACCEPTANCE-07D–09 / FULL_RECOVERY + MULTIPUNTO_IDEMPOTENCY PASS

Titular confirma 07D advertencia exceso de cupos sin eliminación/desactivación automática; 07E cotización histórica $17.850 consultable; 07F edición multipunto mecánico bloqueada en Básico. 08 recupera Full: 2 quote/2 multipunto/0 reservas y 1/8 mecánicos. 09 vista previa y descarga del mismo borrador TEST12 incrementan multipunto de 2 a 3 una sola vez; consulta read-only confirma 2 Full + 1 Plus multipunto (último 14:39:35 UTC), 1 Full + 1 Plus quote; todos confirmed. OT TEST12 status ready, no cerrada/cancelada, plan efectivo full activo vitalicio; código Cp04OrdersView bloquea edición ready/closed por diseño, independiente de emitir cotización. Titular reporta vista previa PDF pequeña, impresión normal. Planificar ampliación responsive/zoom y mensaje visible por estado de orden (no confundir con bloqueo comercial); preservar PDF A4 y protección ready/closed. No cambiar guardas. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_COMMERCIAL_ACCEPTANCE_08_09_20261127.md). Pendientes: autorización/caché en sesión abierta, límites efectivos, aislamiento y cierre. Auto-Deploy OFF, solo documentación.

---

## 27/11/2026 UTC — ACCEPTANCE-07C RETEST UI PASS / UX CORRECTION PLANNED

Titular confirma que tras repetir prueba con nueva sesión el multipunto aparece bloqueado en Básico; solo muestra icono de candado sin explicación. Retest visual PASS, hallazgo original de descarga en sesión anterior no reproducido en sesión nueva; causa y revocación durante sesión abierta siguen pendientes de verificación antes de cierre. Requisito aprobado: todo bloqueo comercial debe mostrar causa explícita (función no incluida, cuota agotada, o demo), beneficio y CTA Ver planes y beneficios cuando corresponda; no solo icono ni atribuir permisos/red a cuota. Para Básico multipunto: “Tu plan actual no incluye la inspección multipunto. Con Plus o Full podrás evaluar 34 componentes, registrar observaciones y generar informes para tus clientes.” Demo identificada y no operativa; accesibilidad de texto/teclado, sin checkout. Incorporado a BT-COMMERCIAL-LIMIT-UX-01 y BT-BASIC-MULTIPUNTO-DEMO-01. Continuar 07D mecánicos y 07E datos históricos. Solo documentación; no cambios productivos.

---

## 27/11/2026 UTC — BT-BASIC-MULTIPUNTO-DEMO-01 PLANNED / ACCEPTANCE-07C OPEN

Titular informa borrador descargado bajo Básico, edición bloqueada, solicita vista parcial de demostración con CTA a planes. SHA-256 del PDF coincide exactamente con descarga Plus previa, sin nuevos consumos ni reservas (4 confirmed); no traza HTTP del intento. Posible caché/estado anterior no confirmado. Mantener 07C abierto, repetir sesión nueva/privada y comprobar autorización, descarga y edición; corregir eventual entrega no autorizada antes de cierre. No confundir archivos previamente descargados con entrega nueva. Demo Básico con datos ficticios, pequeña muestra y CTA, sin PDF real, escritura, archivo, envío ni cuotas; coordinar con UX de límites y multipunto definitivo después de aceptación y antes de Ignacio. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_BASIC_MULTIPUNTO_DEMO_01_PLANNED_20261127.md). Solo documentación, Auto-Deploy OFF.

---

## 27/11/2026 UTC — BT-COMMERCIAL-LIMIT-UX-01 PLANNED

Titular solicita mensaje comercial al agotar cupos en lugar de falso error de guardado/conexión. Básico 2/1 cotizaciones, intento COT-000001 muestra mensaje genérico; consulta read-only conserva 2 quote y 2 multipunto confirmed (1 Full + 1 Plus cada uno), sin nuevo consumo/reserva. Sin traza HTTP individual, causa exacta no certificada. Planificar mensajes específicos y CTA Ver planes y beneficios para cotizaciones/multipunto/clientes/mecánicos/correos; preservar códigos de cuota frente a permisos/red/servicio y no exponer recursos ajenos, ofrecer espera solo si aplica. Sin checkout ni cambio de guardas. Coordinar después de aceptación vigente y antes de Ignacio con bloques de cupos/multipunto. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_COMMERCIAL_LIMIT_UX_01_PLANNED_20261127.md). Auto-Deploy OFF; solo documentación, no implementación.

---

## 27/11/2026 UTC — BT-PLAN-MECHANIC-LIMITS-01 PLANNED

Titular solicita cambio posterior de cupos de mecánicos incluidos: Básico 0 (sin cambio), Plus 4→2 y Full 8→4. Mantener propietario fuera de cupos y precios/otros beneficios vigentes. No cambiar contrato activo durante aceptación comercial 4/8. Implementar tras cierre de aceptación y antes del piloto Ignacio, coordinado con BT-MULTIPUNTO-FINAL-01. Alinear SQL/RPC/roles/invitaciones/reactivaciones/contadores y textos UI, probar límites y concurrencia; definir tratamiento de talleres excedidos sin borrado ni desactivación automática. Extras y pagos no se habilitan por este cambio. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_PLAN_MECHANIC_LIMITS_01_PLANNED_20261127.md). Además, titular solicita marca de agua diagonal BORRADOR en vista previa y PDF borrador multipunto; requisito explícito de [BT-MULTIPUNTO-FINAL-01](docs/checkpoints/CHECKPOINT_BT_MULTIPUNTO_FINAL_01_PLANNED_20261127.md), definitivo sin marca. Auto-Deploy OFF verificado, solo documentación, sin implementación, SQL/Edge/Render/flags ni Codex.

---

## 27/11/2026 UTC — BT-MULTIPUNTO-FINAL-01 PLANNED / COMMERCIAL_ACCEPTANCE_PENDING

Titular aprueba incorporar borrador y emisión multipunto definitiva al roadmap. Prioridad: después de cerrar aceptación comercial actual y antes del correo comercial/piloto Ignacio. Mantener vista previa y borrador; añadir emisión definitiva sin leyenda borrador, archivo privado e inmutable por visita/revisión, entrega manual al cliente y trazabilidad. Ambas modalidades bajo cuotas de servidor (Básico bloqueado, Plus 10/semana, Full sin límite comercial); requisito de no duplicar consumo al convertir el mismo snapshot autorizado, sujeto a diseño y validación de transición segura, vigencia, revocación, concurrencia y aislamiento; no relajar contrato vigente. Extender recuperación al nuevo archivo, conservar históricos, no activar correo. Anotar mejora de texto de consumo ilimitado. Evidencia actual: Full visible y PDF borrador TEST12 descargado, 1 consumo multipunto confirmed Full a 12:37:09 UTC (268853 bytes), falta confirmación visual del contador y resto de aceptación. [Checkpoint planificado](docs/checkpoints/CHECKPOINT_BT_MULTIPUNTO_FINAL_01_PLANNED_20261127.md). Solo documentación; Auto-Deploy OFF verificado, sin código, SQL, Edge, Render, flags ni Codex. Orden vigente se amplía con este bloque sin eliminar los demás pendientes.

---

## 27/11/2026 UTC — GATE4_OPEN_PASS / COMMERCIAL_ACCEPTANCE_PENDING

Titular autorizó GATE_OPEN exacto de cuatro RPC tras verificar navegación autenticada, Mi taller, Plan y beneficios y correo frontend false. Preflight 12:33:32 UTC: cuatro ACL cerradas, Render LIVE SHA 7dc06a26, main Auto-Deploy OFF, Edge 12/9/2 JWT true y onboarding v8 intacta. Ejecutado SQL blob e377cbe473804a4104eb54c23826fdec2d83743f sin cambios; postflight 12:33:45 UTC: 4 EXECUTE authenticated, 8 denegaciones anon/service_role, 12/12 PASS, cuerpos RPC idénticos por MD5, 16 objetos, 2 buckets privados, 0 consumos, 8 definiciones, RLS forzado y 3 políticas Storage restrictivas. No cambios flags/datos/Edge/Render/Auth/Storage ni Codex. Correo servidor no verificado independientemente; no activación adicional. Riesgo residual aceptado anteriormente, ticket SU-571138 pendiente sin garantía global. Siguiente: aceptación humana y focalizada Básico/Plus/Full, sin clientes reales. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_GATE4_OPEN_PASS_20261127.md).

---

## 27/11/2026 UTC — GATE4_RENDER_LIVE / REOPEN_BLOCKED

Render dep-dc4ljttg1s2s73etout0 LIVE 10:23:12 UTC, SHA 7dc06a26; tsc/Vite build PASS (2.51 s, advertencia chunk no bloqueante). Postflight 10:23:52 UTC: cuatro ACL cerradas, 12/12 denegaciones, 16 objetos, 2 buckets privados, 0 consumos. Auto-Deploy OFF y main confirmados. No modificar flags ni SQL/Edge/Storage/Auth, sin Codex ni repetir CI. Queda verificar configuración efectiva de flags y frontend en navegador; el conector no permite leer flags individuales y no se ha acreditado navegación autenticada. GATE_OPEN exige autorización específica, no ejecutar aún. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_GATE4_RENDER_LIVE_20261127.md).

---

## 27/11/2026 UTC — GATE4_RESIDUAL_ACCEPTED / RENDER_DEPLOY_STARTED / REOPEN_BLOCKED

Titular acepta riesgo residual documentado y autoriza exclusivamente frontend Render con cuatro ACL cerradas. Capturas acreditan nueva clave Storage ES256 activa y antigua revocada (~02:55 UTC), ticket SU-571138 recibido sin respuesta técnica acreditada; no purga CDN. 10:21 UTC: >7 h desde revocación, cacheControl 3600 s, 11 storage_logs/24 edge_logs desde ready sin coincidencias firma/documentales; no certificación global. Versiones/hashes registrados intactos, 12/12 denegaciones, 16 objetos privados, 0 consumos, 8 definiciones, RLS forzado y tres políticas Storage restrictivas. Preflight 10:22:37 UTC confirma 4 ACL cerradas. Auto-Deploy OFF, main 7dc06a26, frontend idéntico a CI aprobado. Render manual dep-dc4ljttg1s2s73etout0 iniciado 10:22:47 UTC; build_in_progress observado, no LIVE certificado. No cambios flags, SQL/Edge/datos ni Codex. Verificar resultado, configuración y solicitar autorización específica GATE_OPEN; no reabrir automáticamente. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_GATE4_RESIDUAL_ACCEPTED_20261127.md).

---

## 27/11/2026 UTC — GATE4_EDGE_READY_PASS / REOPEN_BLOCKED

Titular autorizó fase ready manteniendo cuatro barreras cerradas. Run #2 omitido (fase freeze seleccionada con confirmación ready; corregido en UI, no jobs ejecutados). [Run #3](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45929536855) SUCCESS, 43/43 hashes revisados y tres deploy ready confirmados en logs. Supabase verifica CP05 v12, final v9, comercial v2, JWT true; onboarding v8 intacta. Inventario alojado de fuentes/recursos 4/6/6 archivos coincide con rutas esperadas; no recalculados hashes individuales de archivos alojados. Postflight 02:40:36 UTC: SQL instalado, 12/12 denegaciones efectivas, 16 documentos, 2 buckets privados, 0 consumos. Sin reapertura, Render ni flags modificados en esta intervención. Pendiente: resolver incertidumbre residual de reapertura y coordinar despliegue frontend y autorización específica de GATE_OPEN. Mantener cuatro ACL cerradas y Auto-Deploy OFF. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_GATE4_EDGE_READY_PASS_20261127.md). Sin Codex ni repetir CI/HTTP/SEC07.

---

## 27/11/2026 UTC — GATE4_SQL_INSTALL_PASS / REOPEN_BLOCKED

Titular autorizó expresamente instalar SQL comercial transaccional con cuatro barreras cerradas, sin reapertura. Instalación exacta de [INSTALL_GATE4](docs/sql/BT_WORKSHOP_COMMERCIAL_01_INSTALL_GATE4.sql), blob eb39a2a16e1e2592747967644168cd132a3622e6, registrada como bt_workshop_commercial_01_install_gate4. Postflight independiente 02:35:21 UTC: esquema comercial presente; 12/12 denegaciones de cuatro RPC owner-only; dos tablas privadas con RLS habilitado y forzado, sin SELECT authenticated ni USAGE de esquema; 8 definiciones previas conservadas, 0 consumos, 16 documentos, 2 buckets privados. Reserva/own_workshop authenticated, finish/cache service_role; no confundir barrera documental con congelación total. Edge freeze v11/v8/v1 intacto, onboarding v8 intacto; no ready, Render, reapertura ni flags modificados. Próximo: autorización/ejecución coordinada ready manteniendo cuatro ACL cerradas; verificar antes de cualquier reapertura y resolver incertidumbre residual global/URLs históricas. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_GATE4_SQL_PASS_20261127.md). Sin Codex ni repetir CI/HTTP/SEC07.

---

## 27/11/2026 UTC — evidencia residual GATE4

9/9 denegaciones, 16 documentos, freeze intacto, cero transacciones antiguas. 23h30 de logs agregados sin coincidencias de rutas de firma y 27 blobs históricos documentales revisados sin mecanismos de firma detectados. No demuestra ausencia histórica absoluta ni convergencia global. Propuesta pendiente de decisión: instalar SQL/ready con cuatro ACL cerradas, separar reapertura y mantenerla bloqueada hasta resolver incertidumbre material; no ejecutar sin autorización específica. Ver [adenda GATE4](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_GATE4_PREP_20261127.md). Sin mutaciones productivas.

---

## 27/11/2026 UTC — BT-WORKSHOP-COMMERCIAL-01: GATE4_PREPARED / RELEASE_GATE_BLOCKED

Titular autorizó preparación de cuarta barrera. [INSTALL_GATE4](docs/sql/BT_WORKSHOP_COMMERCIAL_01_INSTALL_GATE4.sql) preserva candidato exacto y añade preflight de tres ACL/huellas y cierre transaccional de bt_commercial_status antes del único COMMIT; postflight cuatro ACL (12 denegaciones). [GATE_OPEN](docs/sql/BT_WORKSHOP_COMMERCIAL_01_GATE_OPEN.sql) ampliado a cuatro. Validación estática focalizada, no ejecutada en PostgreSQL. Workflow y paquetes aprobados intactos. No ejecutar CANDIDATE directamente. HTTP_FREEZE_PASS previo conservado; no repetir por rutina. Incertidumbre global/URLs históricas y revisión del alcance de otras RPC de negocio pendientes; la barrera documental no congela toda escritura (reserve authenticated no entrega bytes). No instalar SQL, ready, Render ni abrir hasta puertas correspondientes y autorización específica. [Checkpoint GATE4](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_GATE4_PREP_20261127.md). Sin Codex, nuevas CI o cambios productivos.

---

## 27/11/2026 UTC — BT-WORKSHOP-COMMERCIAL-01: HTTP_FREEZE_PASS / RELEASE_GATE_BLOCKED

Respaldo confirmado; cierre SQL 9/9 denegaciones y freeze 43/43 hashes PASS. Drenaje mínimo cumplido. Edge/Chrome DevTools descartados por editor vacío/CORS. Solución Astra Pro PowerShell 5.1 reutiliza sesión existente localmente, identidad validada por Auth y tres POST sin reintentos; titular obtuvo HTTP_FREEZE_PASS 3/3 (503, 0 bytes, cabeceras correctas, sa-east-1). Dirección Técnica confirmó tres invocaciones en ventana sin correlación individual, versiones freeze y 16 documentos conservados. No repetir sonda mientras barrera siga acreditada. Astra detectó cuarta RPC bt_commercial_status(uuid) que candidato concede a authenticated; confirmado en código. Pendiente autorización para cierre transaccional de cuarta RPC y reapertura coordinada, revisión de cobertura y resolución de incertidumbre global/URLs anteriores. SQL comercial no instalado; mantener freeze, Auto-Deploy OFF y flags correo/registro/logo/pagos OFF. Sin Codex, CI, respaldo ni SEC07 repetidos. [Checkpoint detallado](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_HTTP_FREEZE_PASS_20261127.md) · [DTK-ERR-063](https://github.com/Danielsanchezdesarrolador/development-toolkit/blob/b7901d92c4291f386378c0ca8a17de20569e4ea2/05-errores-y-soluciones/DTK-ERR-063.md). Solo documentación en esta intervención.

---

## BT-WORKSHOP-COMMERCIAL-01 — preparación de instalación (27/11/2026)

CI PASS conservado en `3c77ca83ee2d6db62e0ad2c66ccfa6aa61294c4c`. Inspección directa de fuentes de Edge LIVE: CP05 v10 obliga RPC authenticated bt_plan04_operations_status(uuid) antes de toda acción autorizada; final archive v7 obliga bt_final_archive_document(uuid,uuid) para lectura y bt_final_archive_source(uuid,uuid,uuid,uuid) para archivo. No createSignedUrl/createSignedUrls en los dos bundles actuales. Las tres ACL reales son {postgres=X/postgres,authenticated=X/postgres}; sin EXECUTE anon/service_role. Buckets privados backend-only ya bloquean acceso/firma directa de usuarios. Se prepara barrera temporal de tres RPC exactas, no revocación global. La barrera interrumpe también las pantallas operativas que consultan status; informar ventana de mantenimiento. No modifica datos, claves, Auth, roles globales, otros servicios ni RLS. Bloquea peticiones nuevas que llegan a estas RPC; no cancela respuestas en vuelo. Tras cierre confirmado, drenar al menos el límite documentado máximo del worker (400 s), revisar versiones y logs de tráfico de las antiguas rutas; no confundir silencio de logs con prueba global ni afirmar corte absoluto. Freeze de los tres endpoints y verificación independiente con sesión autenticada (503, sin bytes). Mantener barrera durante migración comercial y ready; confirmar contenido/recursos, versiones, verify_jwt y disponibilidad; abrir solo tras evidencia suficiente de cese de antiguas rutas privilegiadas. Si la evidencia no es suficiente, conservar puerta cerrada y resolver con proveedor; no restaurar funciones antiguas sin medición después de SQL.

Preparados (sin ejecutar):
- [workflow manual](.github/workflows/bt-workshop-commercial-edge-manual.yml) con fase freeze/ready y frase explícita de la puerta, checkout fijo de SHA aprobado, npm lock y 43 hashes del release manifest más 10 hashes de fuentes (entrega privada DELTA-01), CLI v2.stable con Docker y JWT de configuración. Sin triggers automáticos, secretos nuevos ni publicación de binarios. El input es atestación operativa, no una verificación independiente del estado SQL; Dirección Técnica verifica antes de indicar ejecución. Si cualquier hash difiere, detener, no relajar integridad.
- docs/sql/BT_WORKSHOP_COMMERCIAL_01_GATE_CLOSE.sql: preflight exacto de ACL/huellas y revocación temporal autenticada de tres RPC.
- docs/sql/BT_WORKSHOP_COMMERCIAL_01_GATE_OPEN.sql: preflight comercial instalado y ACL cerradas, restaura exclusivamente tres EXECUTE authenticated. No ejecutarlo antes de validar despliegue y drenaje. Ante fallo tras cierre, no dejar producción abierta parcialmente; decidir recuperación dirigida.
- Mantener correo/registro/logo/pagos OFF y Auto-Deploy OFF. Sin Codex ni repetir CI. Requiere confirmar respaldo integrado vigente: último snapshot aceptado 13 PDF; preflight posterior encontró 16. Ejecutar acceso directo S5B integrado existente una vez, conservar recibo privado, confirmar recuento y ventana sin editores. El conector no puede lanzar workflow_dispatch ni leer respaldo local; titular realizará disparos manuales cuando se le indique y confirmará respaldo. No compartir secretos/archivos de custodia.

Estado: RELEASE_PREPARED / BACKUP_CONFIRMATION_PENDING. No SQL, Edge, Render, flags ni datos productivos modificados. No certificar instalación ni aceptación humana. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_RELEASE_PREP_20261127.md).

---

## 27/11/2026 — BT-WORKSHOP-COMMERCIAL-01: CI oficial PASS; instalación alojada pendiente

HEAD evaluado `3c77ca83ee2d6db62e0ad2c66ccfa6aa61294c4c`. Confirmación del titular y comprobación directa de Actions: [general 45922510613](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45922510613) 2/2 SUCCESS; [interfaz oficial 45922510589](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45922510589) 3/3 SUCCESS (Chromium, WebKit, interfaz). Se conserva [comercial focalizada 45921388149](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45921388149) 6/6 SUCCESS sobre f6f8d5c; los commits posteriores solo modificaron tests/scripts de verificación y documentación, no fuentes productivas ni SQL. [Recepción DEMO 45921388138](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45921388138) SUCCESS. Regresión piloto, registro y cotizaciones DEMO aprobados en la misma integración. No repetir suites por rutina. DTK-ERR-062 ya ampliado por Business v1.2.1. El bloque de desarrollo/CI queda cerrado; FIX-01 aceptación humana no completa y COMMERCIAL no LIVE.

Preflight alojado de solo lectura: Render Auto-Deploy OFF; PostgreSQL 17.11; esquema bt_commercial_private ausente; 16 objetos en los dos buckets PDF, ambos privados; cero idle in transaction al consultar (no prueba de drenaje Edge). Políticas restrictivas existentes bt_cp05_backend_only y bt_final_archive_backend_only excluyen ambos buckets para anon/authenticated en ALL (USING y WITH CHECK): lectura/firma directa de esos roles ya bloqueada. No se modifican. Edge CP05 v10 y final archive v7 ACTIVAS con verify_jwt=true; owner onboarding v8 fuera del alcance; bt-commercial-documents aún ausente. SQL candidato blob `9b1f2f42ca9edbbe6928fd7157ec18bef8caedf4` no instalado.

Siguiente puerta: preservar el requisito de mantenimiento/drenaje del checkpoint DELTA-01. Las versiones antiguas usan service_role; ni RLS del navegador ni Auto-Deploy OFF las detienen. Los freeze candidatos 503 no son todavía una barrera instalada. Docs Supabase https://supabase.com/docs/guides/functions/limits (consultada: 150s Free / 400s paid por worker, no prueba de cese de enrutamiento global al ACTIVE; static_files requieren CLI con Docker, no API flag); https://supabase.com/docs/guides/storage/security/signing-keys (URL firmada preexistente puede conservar acceso, no afirmar revocación retrospectiva); https://supabase.com/changelog/supabase-cli-v3 (mantener v2.stable como los workflows ya usados). No se acreditó una barrera global verificable ni ausencia de URLs anteriores; no instalar SQL/desplegar parcialmente. Reutilizar mecanismo manual de CLI de bt-flow-fix-01-edge-manual.yml y bt-plan04bc-edge-manual.yml, con tres paquetes del delta, sin copiar secretos ni ejecutar workflows antiguos que apuntan a SHAs previos. No rotar claves, pausar proyecto, revocar permisos globales ni afectar owner-onboarding. Recuperación SEC07 sigue cerrada, no repetir auditorías. Pendiente confirmar vigencia del respaldo operativo para 16 objetos y método efectivo de corte de las rutas privilegiadas. No hay modificaciones Supabase, Edge, Render, datos ni flags.

[Checkpoint CI PASS](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_CI_PASS_20261127.md). Estado: CI_PASS / RELEASE_GATE_PENDING. Autorización del titular para activación coordinada condicionada a las puertas técnicas anteriores; no requerir nueva aprobación de los mismos tests.

---

## 26/11/2026 — BT-WORKSHOP-COMMERCIAL-01: corrección semántica de CI oficial

Base oficial `1b204870af02e61f16e24cc4c0cf718ed108aa76`. [Run 45921651229](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45921651229), job 140253531574: `verify-auth-r1-ui.cjs:166`, 4 !== 5. Causa confirmada al contrastar log con `AppShell.tsx`: navegación privada, Agenda OFF, tres accesos directos (Inicio, Órdenes, Clientes) y Más secciones; Informes y Configuración permanecen en menú lateral. Mi taller depende del flag comercial y sesión; no corresponde al harness Auth R1 sin esa activación. La aserción antigua contaba cinco botones e interpretaba índices como destinos.

Reutilización de `tests/harness/navigation.cjs` existente, sin cambiarlo: navegación por data-screen y Más cuando corresponde. R1 compara inventario exacto de destinos laterales y accesos inferiores, visita las cinco secciones autorizadas, comprueba sección activa/único panel visible y restaura Configuración tras recarga autenticada. Se mantienen todos los negativos Auth, fixtures, controles deshabilitados, overflow, cero operaciones de negocio y separación DEMO. También se sustituyen índices equivalentes en verificadores públicos oficial/auth/brand y consumidores privados CP06/FLOW-NEXT-R1; sus aserciones de negocio no cambian. Los ejecutores comercial, UX persistente, cuenta personal y CP04 ya reutilizan el helper; no se modifica su lógica ni se repiten manualmente. Otros recorridos históricos DEMO mantienen su contrato sin sesión; no se certifica toda la colección histórica por esta revisión. El antiguo verify-plan04-ui.cjs no pertenece al workflow fallido: su contrato previo a Mi taller y sus fixtures requieren una migración separada si se vuelve a usar; no se amplía esta incidencia.

Validación efectiva previa: sintaxis JS de los seis scripts corregidos PASS (compilación estática, sin navegador local). CI general [45921651136](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45921651136) SUCCESS; CI comercial [45921388149](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45921388149) 6/6 SUCCESS sobre SHA anterior según registro oficial, cuatro combinaciones Chromium/WebKit y Agenda ON/OFF. El cierre del nuevo SHA requiere Actions; no declarar SUCCESS anticipadamente. DTK-ERR-062: separar contrato visual, selección semántica y aserciones de negocio. Auto-Deploy OFF comprobado directamente antes de publicar. Sin cambios productivos, SQL, Edge, secretos, flags, workflows, dependencias, Codex, ramas o nuevas funcionalidades. Preservar barrera comercial y puertas de instalación documentadas.

---

## 26/11/2026 — BT-WORKSHOP-COMMERCIAL-01-DELTA-01: corrección privada focalizada

Base ba69a30eb62e2af6e7f01b62e11975b10e3978bb conservada. FIX-01: contrato HTTP de expediente final admite requestId UUID string únicamente en descargas quote, rechaza campos extra/tipos inválidos y preserva históricos. FIX-02: toda salida meteredDocument procede de bytes canónicos confirmados, también tras render concurrente; SQL finish/cache revisado, first-wins correcto y sin modificación. FIX-03: paquetes reproducibles CP05/final archive/commercial, JWT requerido, configuración conjunta y tres entradas freeze 503.

Validación específica: 30 casos unitarios/HTTP distintos (22 nuevos + 3 afectados + 5 guardas existentes), 8 comprobaciones reales PostgreSQL17 aislado y 7 de paquetes PASS; TypeScript/sintaxis/diff PASS. No repetir suites anteriores de 44/48; UI y WebKit no ejecutados. Runtime de paquetes probado con Node ESM/adaptador Deno y SDK sintético; no certifica Deno nativo/Edge. [Checkpoint y procedimiento de congelación/actualización](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_DELTA_01_20261126.md). Barrera de mantenimiento confiable y drenaje de todas las salidas antiguas/Storage obligatorios antes de instalar/abrir; despliegues secuenciales no son atómicos. No instalar nada en este bloque.

Solo delta DTK-ERR-056 en bytetorque-review/main/BT-WORKSHOP-COMMERCIAL-01-DELTA-01. Conservar entrega original y todas las anteriores. SHAs/hashes en metadatos de entrega. Sin push oficial, SQL alojado, Render, secretos, Edge desplegadas, nuevas dependencias o ramas; SEC07 cerrado y servicios OFF. Próxima puerta: revisión independiente y CI/runtime oficial, no nuevas funcionalidades.

---

## 26/11/2026 — BT-WORKSHOP-COMMERCIAL-01: candidato privado consolidado

Implementados BT-PILOT-FIX-02, ART-WORKSHOP, PLAN-LIMITS y PLAN-ENFORCEMENT sobre main `c3cb91db1d33edb98fbe62776f9fbabbcbc09307`. Mi taller separado de Configuración, cuatro pestañas y R2 según ocho referencias; cuenta personal consulta titularidad self-only, Plus/Full crea un único taller y Básico conserva vínculo previo. Gestión de equipo, sesión, navegación persistente y borradores por taller reutilizados. Nueva capacidad/ledger SQL incremental autoritativo; Básico completa circuito sin inventar inspección; cuotas tenant-scoped con locks, ventanas servidor, reintentos de bytes idénticos y watermark integrado. Generadores oficiales fuera del navegador, salidas CP05/archivo/multipunto medidas y lectura Storage directa restringida. Ningún bucket nuevo; logos, correo, registro público y pagos OFF.

Validación local sintética: 44 servidor PostgreSQL17 aislado; 48 unitarias afectadas; Chromium ocho estados, Agenda OFF dos, titularidad cuatro, CP05 dos viewports y continuidad PDF móvil. TypeScript/builds/grafo y paquete offline PASS. WebKit BLOCKED_ENVIRONMENT, cero descargas; workflow manual preparado, pendiente CI oficial. No equivale a LIVE ni aceptación humana. No suites históricas completas, respaldos o SEC07.

[Checkpoint completo, semántica de cuotas, instalación y reversión](docs/checkpoints/CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_20261126.md). Instalar solo tras revisión/CI/autorización: congelar egress antiguo primero, SQL transaccional, actualizar **todos** los handlers existentes además del nuevo adaptador, frontend compatible y QA antes de abrir. Nunca convivir con salidas service_role antiguas sin cuota. Rollback funcional cerrado conserva ledger/guardas y exige congelación real. No producción, push oficial, SQL alojado, Edge/Render/secretos ni Android. Solo delta privado DTK-ERR-056 en bytetorque-review/main/BT-WORKSHOP-COMMERCIAL-01; SHAs/inventario/hashes verificables en metadatos de entrega. Próxima puerta: revisión independiente; no iniciar otro trabajo.

---

## 26/11/2026 — BT-PILOT-FIX-02: Mi taller y Configuración separados; creación única

Decisión del titular tras QA humana del LIVE BT-PILOT-FIX-01. Taller piloto localizado y accesible; no declarar aceptación completa de FIX-01. Nuevo bloque correctivo obligatorio antes de BT-PLAN-LIMITS-01, una entrega consolidada, sin repetir suites no afectadas.

- Menú lateral privado owner/admin: añadir **Mi taller** antes de Configuración, con icono y ruta/identificador propio; mover identidad comercial, logo (mantener flag OFF hasta habilitación autorizada), usuarios/mecánicos/cupos/invitaciones y plan del taller a esa sección. Mantener funciones reales existentes, guardas y scope por usuario/taller. Experiencia R2 responsive; móvil accesible también desde Más. No mostrar administración a mecánicos. No añadir acceso privado a revisiones públicas.
- **Configuración** debe volver a ser una pantalla separada de ajustes reales: preferencias y ajustes generales de cuenta/sistema disponibles; opciones futuras (correo, plantillas, etc.) claramente pendientes si no están habilitadas. No montar ConfiguracionPanel DEMO ni fixtures, métricas o datos simulados en producción. Estilizar Volver al inicio y eliminar copias técnicas obsoletas visibles sin prometer capacidades no habilitadas. Preservar navegación persistente, fallback de rutas anteriores y validación de permisos.
- **Mi cuenta personal**: separar licencia personal de taller activo y taller propio vinculado. Si existe taller propio, mostrar tarjeta del taller autorizado y CTA Entrar a mi taller / Gestionar mi taller; permitir volver al taller actual y cambiar entre talleres autorizados sin crear otro. Crear mi taller únicamente si servidor confirma licencia personal Plus/Full vigente y sin vinculación ni taller propio incompatible. No inferir elegibilidad de plan ni de rol de membresía aislados; si lectura falla, bloquear creación y ofrecer revalidación. Mecánico invitado no paga licencia individual ni obtiene capacidad de creación por plan del taller. Conservar invitaciones pendientes y aceptación segura.
- Una cuenta/licencia personal Plus o Full puede crear y vincular como máximo un taller propio; pertenecer por invitación a otros talleres autorizados no equivale a poseerlos. Revocación/vencimiento conserva vínculo, historial y derechos Básico previamente aprobados para taller existente; no recrear, transferir, borrar ni duplicar taller al reactivar. No alterar entitlements heredados/legítimos ni imponer una migración destructiva sobre talleres antiguos. Plan Básico personal no habilita creación de un nuevo taller, conforme a regla vigente; cualquier ampliación comercial se decide en BT-PLAN-LIMITS-01.
- Diagnóstico verificado en código: App.tsx enruta configuracion directamente a PrivateWorkshopSettings, que reemplaza configuración; WorkshopSettings.tsx renderiza título Configuración con identidad/equipo/plan; WorkshopHome.tsx calcula eligible solo desde scope personal + plan plus/full, sin comprobar bound_workshop_id; planStatus.ts exige workshopId null para status personal. En producción se verificó de solo lectura que RPC bt_plan04_create_workshop contiene guarda License already bound y lock por cuenta; existe una licencia Full activa vinculada al taller piloto. No se intentó crear duplicados. Exposición visual del formulario no prueba creación duplicada. Aprovechar contrato server existente; si no devuelve vinculación/eligibilidad, proponer RPC self-only mínima o extensión compatible de contrato, fail-closed, sin exponer terceros ni saltar RLS/Auth. No confiar en localStorage.
- QA focalizada: propietario Full/Plus vinculado no ve formulario de creación y entra al mismo taller; Plus/Full sin vinculación puede crear uno con idempotencia/competencia bajo guardas servidor; Básico, plan vencido/revocado, consulta fallida no pueden crear; invitado ve sus talleres autorizados sin acceso administrativo indebido; Configuración y Mi taller separados con estado tras recarga, back/forward, escritorio y móvil; público sin fixtures privados. Verificar pruebas por rol y etiqueta semántica, no índices rígidos de menú, considerar Agenda ON/OFF. No repetir pruebas SEC07 ni modificar SQL/Render/Edge/flags de producción sin puerta técnica y autorización del nuevo delta.

[Checkpoint de requisitos y diagnóstico](docs/checkpoints/CHECKPOINT_BT_PILOT_FIX_02_WORKSHOP_NAV_20261126.md). Estado: documentado, pendiente implementación/validación. Sin cambios de fuentes de aplicación ni infraestructura en esta actualización.

---

## 26/11/2026 — BT-PILOT-FIX-01 LIVE técnico; aceptación humana pendiente

Con autorización vigente del titular y CI completa SUCCESS (SHA funcional validado f616bdc5043473fdff12bb1291a8abeddbdc5c95; HEAD posterior únicamente documental), aplicada migración Supabase `20261126230758_bt_pilot_fix_01_operational_guards_and_invites` a las 23:07 UTC. Archivo exacto [candidato aprobado](https://github.com/Danielsanchezdesarrolador/biomotors-taller/blob/3772dc5e1a1ae4458a2b5528fce4b2c9adf8a7dc/docs/sql/BT_PILOT_FIX_01_CANDIDATE.sql), blob `6f4a0c80127ae8ed1062d545791a1d508c8b0340`, transacción íntegra, sin DML de registros existentes. Preflight: huella manage_mechanic 143ce5bd72391746862711117ecf4cd3, dependencias presentes, RPC/triggers nuevos ausentes, cero transacciones idle y bloqueos de escritura concurrentes relevantes observados. Postflight: dos triggers activos en work_orders/inspection_findings, RLS presente en las tres tablas comprobadas, manage_mechanic nueva huella a847c7e52000f902aa8a9fc2104206e0, ambas RPC nuevas presentes. Anon sin EXECUTE; RPC para authenticated; trigger privado sin EXECUTE para anon/authenticated/service_role; search_path vacío y SECURITY DEFINER. Conteos antes/después idénticos: 3 talleres, 7 membresías, 6 clientes, 6 vehículos, 7 OT, 279 hallazgos, 5 entregas, 6 revisiones de cotización, 10 objetos PDF en los buckets consultados. Conteos no equivalen a comparar contenido byte a byte; no se modificaron filas de negocio deliberadamente.

Asesor de seguridad consultado: advertencia de SECURITY DEFINER ejecutable por authenticated en RPC de invitaciones/gestión, exposición intencional del contrato; verificación directa de actor() exige auth.uid(), session_id vigente, email confirmado y cuenta no bloqueada, manager() exige membresía owner/admin activa y taller activo; la aceptación cruza destinatario, estado/cupo y expiración. No se alteran permisos por una advertencia genérica. También informa 24 tablas con RLS sin políticas (INFO) y protección de contraseñas filtradas (WARN); no se reabre SEC07 ni se modifica Auth en este bloque. Revisar el aviso de contraseñas como mejora separada si procede, sin confundir con error de migración. [Advisory RPC](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

Render Auto-Deploy OFF y rama main verificados; despliegue manual API `dep-dc4bnqtg1s2s73du1fp0` del SHA `3772dc5e1a1ae4458a2b5528fce4b2c9adf8a7dc`, LIVE a 23:08:48 UTC 26/11/2026 (20:08:48 Chile). Anterior LIVE `dep-dc49tdp5efls73dfr6mg` SHA 9381d103f8b32c56e535b3085c8938843c0c79f1. Sin cambios de Edge, flags, variables, pagos o correo. No nueva ejecución Codex, sin repetir respaldos históricos. CI + instalación + LIVE técnico PASS, no equivale a pruebas físicas ni aceptación de usuarios.

**Siguiente puerta única: QA humana focalizada en taller de prueba del titular**, no clientes reales de Ignacio todavía. Comprobar restauración de taller/pantalla tras recarga, desactivar/reactivar mismo mecánico con cupos, inspección lista/entregada no editable por mecánico y revocación Full bloquea escritura premium (restaurar Full tras prueba), vista PDF modal, recuperación de borrador y textos de guardado; verificar kilometraje con puntos y navegación de configuración/invitación si corresponden. No repetir recorrido operativo íntegro. Si aparece defecto, registrar evidencia concreta y reparar focalizado. Tras aceptación documentada, iniciar BT-PLAN-LIMITS-01 con reglas Básico/Plus/Full ya aprobadas; no iniciar marketing ni incorporar Ignacio antes de completar registro, correo, documentos y móvil.

---

## 26/11/2026 — BT-PILOT-FIX-01-CI-FINAL: CERRADO / CI PASS

**Puerta CI aprobada**, no equivale a instalación SQL, LIVE ni aceptación humana. SHA validado `f616bdc5043473fdff12bb1291a8abeddbdc5c95`. [CI general 45907929476](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45907929476) 2/2 SUCCESS; [BT-OFICIAL-01A 45907929487](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45907929487) 3/3 SUCCESS; [CI focalizada 45905671364](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45905671364) 3/3 SUCCESS en SHA 376346186f895005bdf39dc026336236afa986cb, fuentes productivas y SQL sin cambios posteriores. Dirección Técnica verificó directamente jobs y log definitivo 140209063150.

**Causa raíz confirmada:** verificador UX persistente mezclaba la reapertura del PDF con la actualización legítima del selector de OT CP05 al entrar en Informes. El incremento 24→26 no correspondía a regeneración del documento. Traza instrumentada confirma GET /rest/v1/work_orders (filtro taller, vehículos/clientes activos, orden descendente, límite 40), seguido de GET /rest/v1/vehicles (mismo taller y solo IDs asociados). En Chromium y WebKit a 1366, 390 y 768 px (6/6 PASS) se registran exactamente esos dos GET durante navegación y lista vacía `BT_UX_PDF_REOPEN_READS ... []` durante retorno CP04/reapertura; SHA-256 PDF idéntico, cero escrituras y restantes aserciones de continuidad/revocación/aislamiento superadas.

**Lección reutilizable:** al cambiar UX inline a modal, actualizar todos los contratos de prueba dependientes; esperar estados asíncronos específicos, separar fases navegación/consulta/reapertura y registrar endpoint, método y filtros. No sustituir la validación por tolerancia numérica global, sleeps arbitrarios o eliminación de aserciones; comprobar el comportamiento real en ambos motores. Al corregir copia o ampliar RPC, actualizar pruebas antiguas y fixtures sintéticos explícitos, manteniendo rechazo de endpoints inesperados. Leer log completo del job fallido, concentrar cambios y aprovechar evidencias no afectadas. No repetir auditorías ni Codex si el problema está delimitado a verificadores.

Siguiente puerta: SQL candidato completo en ventana controlada, verificar preflight/ACL/objetos y conservación de datos, luego Render y QA humana focalizada, con autorización previa vigente. SEC07 permanece cerrado. BT-PLAN-LIMITS-01 sigue a continuación con registro por enlace, correos/documentos y móvil antes de incorporar Ignacio. Esta actualización es exclusivamente documental [skip render]; no se ejecutan SQL, despliegues ni cambios de permisos. Auto-Deploy OFF verificado previamente, no se certifica una nueva lectura en esta actualización.

---

## 26/11/2026 — BT-PILOT-FIX-01-CI-FINAL: precisión del verificador UX persistente

Run [45906714771](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45906714771), job 140205091580: SHA base `7707e775bac5ba2e217a98a17c6899f5305ee2bf`, bytes PDF iguales; contador global 26 frente a 24. La inspección identifica `QuotePanel.tsx:157–181` (isActive al visitar Informes), `repository.ts:245` (orders.recentOrders(true)) y `cp04Repository.ts:90–110` (GET /rest/v1/work_orders, luego GET /rest/v1/vehicles). Son lecturas intencionales del selector CP05, no una excepción global ni una regeneración PDF demostrada. Se conserva la revalidación de permisos y se verifica la hipótesis mediante traza HTTP sintética explícita en la CI siguiente.

Único cambio técnico: `scripts/verify-ux-persist.cjs` espera el selector CP05 listo, separa navegación de reapertura, exige exactamente ambos GET con filtros de taller, vigencia, límite y vehículos asociados; cero lecturas de negocio adicionales al volver a CP04 y reabrir, SHA-256 idéntico y cero escrituras. No se modifican app, fixtures compartidos, SQL, Auth/RLS, dependencias ni workflows. Sintaxis del candidato comprobada y 10/10 casos sintéticos del nuevo verificador (incluyendo rechazo de lecturas extras, taller/IDs/filtros incorrectos). No Playwright local: el entorno no dispone del árbol/dependencias y no resuelve GitHub; la confirmación de tráfico y el cierre oficial quedan sujetos a Actions del nuevo SHA.

Evidencia previa comprobada: [CI focalizada 45905671364](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45905671364) SUCCESS servidor y ambos motores; [CI general 45906714707](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45906714707) SUCCESS Web/iOS PWA y Android; LIVE-FIX-01 Chromium/WebKit SUCCESS en run 45906714771. Render Auto-Deploy OFF comprobado antes de publicación. No declarar CI-FINAL cerrado hasta evidencia verde del nuevo commit; SQL y Render corresponden a Dirección Técnica tras la puerta CI, preflight y recuperación vigente. Preservar BT-PLAN-LIMITS-01 y SEC07 cerrado; sin nueva ejecución Codex ni operaciones productivas.

---

## 26/11/2026 — BT-PILOT-FIX-01: integración autorizada, CI pendiente

El titular autorizó continuar revisión, integración, CI y posterior instalación/despliegue sujetos a puertas técnicas. Se transfirieron 49 archivos desde el delta privado y GitHub reconstruyó exactamente el árbol candidato 4d2ab82bcc1172f08b0b646432cd83b3a405708d, con base funcional 6691a8d4 y anotación 9fe4602. SHA-256 independiente de 8 archivos críticos PASS; manifiesto completo de evidencias no recalculado por límite de llamadas (Codex reportó PASS). Se verificó árbol completo de código, no se publican evidencias privadas. El único cambio técnico adicional respecto del candidato es activar CI focalizada automática al cambiar sus archivos propios; conservar workflow manual, mismo runner/aserciones y ambos motores. Las decisiones de BT-PLAN-LIMITS-01 y el checkpoint posterior se preservan. No declarar CI, SQL, LIVE ni aceptación humana aprobados hasta comprobarlos. Auto-Deploy OFF comprobado en Render antes de publicar. SQL primero tras CI, preflight y recuperación vigente; frontend después. Sin nueva ejecución Codex, no reabrir SEC07. [Checkpoint del candidato](docs/checkpoints/CHECKPOINT_BT_PILOT_FIX_01_20261126.md).

---

## 26/11/2026 — BT-PLAN-LIMITS-01 y piloto completo con clientes reales (decisión del titular)

**Nuevo bloque obligatorio después de BT-PILOT-FIX-01, antes de incorporar BIOMOTORS.** Solo decisión documental; no implementación ni activación.

| Capacidad | Básico (gratis) | Plus (USD 5/mes) | Full (USD 15/mes) |
|---|---|---|---|
| Clientes | Máximo 5 | Sin límite comercial previsto | Sin límite comercial previsto |
| Creación/edición de borradores de cotización | Sí | Sí | Sí |
| Acceso al documento final de cotización | 1 cotización por 48 horas | 10 descargas semanales | Sin límite comercial |
| Inspección multipunto | Desactivada | Habilitada | Habilitada |
| Descargas PDF multipunto | 0 | 10 semanales | Sin límite comercial |
| Correos transaccionales del taller | 0 | 10 envíos semanales | Sin límite comercial |
| Registro de clientes por enlace | No | Sí | Sí |
| Mecánicos incluidos | 0 | 4 | 8 |

Básico: antes de conceder el primer acceso a un PDF final (vista previa limpia, descarga, impresión u otra vía), validar y consumir el cupo en servidor; no permitir visualizar documentos finales adicionales ni exponer sus bytes, enlaces directos o rutas alternativas. Cotizaciones adicionales siguen editables como borrador interno, con marca de agua grande, centrada, semitransparente, integrada en cualquier representación restringida: **BORRADOR — NO VÁLIDO COMO COTIZACIÓN**, con aviso DOCUMENTO NO EMITIDO. Mantener identidad R2; no entregar PDF limpio, impresión ni exportación de borrador que eluda la restricción. No prometer impedir capturas de información ya visible. Conservar los originales históricos y distinguir derechos de lectura histórica de acceso/exportación de documentos; definir reconsulta y reintentos del documento autorizado sin duplicar consumos. Flujo Básico debe permitir recepción/OT y cotización limitada sin exigir multipunto. Plus y Full sujetos a sus roles y límites efectivos, no a la licencia personal.

Criterios técnicos propuestos: ventana móvil de 48 h para Básico y semanas lunes 00:00 America/Santiago para Plus, tres contadores separados compartidos por taller, sin acumulación, operaciones exitosas/idempotentes, transacciones/concurrencia, estados pendientes/fallidos y auditoría; precisar semántica de descargas repetidas, cómputo de correo por envío comercial aceptado por proveedor y reintentos antes de implementar. No contar emails Auth del sistema como consumo comercial. Full sin cuotas comerciales de esas tres operaciones, manteniendo protección antiabuso. Aplicar a web/PWA/Android, servidor y Storage/Edge; evitar bypass por preview, generación local del PDF, impresión, URL o API. Conservar aislamiento, históricos y reglas de revocación. El helper piloto existente exige Full manual permanente; separar capacidades legítimas por plan en este bloque sin abrir autorización indiscriminada. Mantener SEC07 cerrado.

**Orden vigente antes de Ignacio:** (1) BT-PILOT-FIX-01, revisión/CI/SQL/deploy autorizados y aceptación focalizada; (2) BT-PLAN-LIMITS-01; (3) logos privados por taller y cobertura de respaldo; (4) BT-REG-02 REAL / BT-REQ-REG-VEH-01, registro autónomo de cliente/vehículo/motivo mediante enlace seguro y solicitud revisada por taller; (5) CP05 correo y BT-COM-01, activar Resend con remitente verificado, cotización, informe y constancia final, revisión de destinatario, consentimientos, historial y reintentos; (6) BT-MOBILE-02A–D, experiencia Android nativa e iPhone PWA y QA física; (7) incorporar Ignacio y dos mecánicos, validación de operación con clientes reales. No postergar registro por enlace ni correo/documentos al marketing. Pagos, prueba comercial, facturación y captación quedan fuera hasta cerrar el piloto. Reutilizar componentes y contratos existentes. No modificar producción ni iniciar bloques adicionales mientras la entrega activa esté pendiente de revisión y autorización.

[Checkpoint de decisión y recepción](docs/checkpoints/CHECKPOINT_BT_PLAN_LIMITS_01_ROADMAP_20261126.md).

---

## 26/11/2026 — BT-PILOT-FIX-01, once correcciones candidatas

Delta consolidado privado: guardas de revocación CP04 y de inspecciones finalizadas; reactivación auditada con cupos; continuidad de taller/pantalla y de invitaciones confirmadas; retorno de Configuración; kilometraje chileno; cabecera/detalle compactos sin rediseñar multipunto; visor PDF modal; crear/recuperar cotización separados; lenguaje de guardado sin proveedor ni éxito falso. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_PILOT_FIX_01_20261126.md).

Base funcional `6691a8d4e4eb10e372e6d4233c8f43a2ea1c570e` más anotación obligatoria `9fe4602a7337c0ca3b21c8db417f82f179832094`. SQL incremental y reversión SOLO candidatos. Servidor aislado: 22 comprobaciones PASS. Unitarias focalizadas: 48 casos distintos PASS (11 iniciales y 40 de Auth, tres compartidos). Chromium 1440/390 focalizado PASS; TypeScript y builds/fronteras público/privado PASS. WebKit BLOCKED_ENVIRONMENT, pendiente CI oficial, sin intentos de descarga. Entrega exclusiva DTK-ERR-056; no push oficial, cambios alojados, migraciones, despliegues ni SEC07. BT-MOBILE-02 no iniciado. Integración y aplicación requieren revisión/autorización independiente de Dirección Técnica. Las anotaciones siguientes son historia.

---

## 26/11/2026 — BT-UX-SAVE-COPY-01: lenguaje de guardado para usuarios

Titular solicita eliminar en toda la interfaz las menciones técnicas repetitivas de guardado en Supabase. Incorporar como incidencia 11 del bloque consolidado BT-PILOT-FIX-01. En todas las pantallas y roles visibles (escritorio y web/PWA móvil), sustituir confirmaciones de persistencia como «Guardado en Supabase», «34/34 componentes guardados en Supabase» o similares por «Guardado correctamente», manteniendo el contador de componentes cuando corresponda. Los textos de sincronización/autoguardado deben ser claros, sin mencionar proveedores internos innecesariamente. No mostrar éxito si la escritura no fue confirmada: conservar estados reales de guardando, pendiente de sincronización, borrador local, fallo y reintento; conservar distinción entre guardado y revisado, avisos de seguridad, registros técnicos y trazabilidad interna. No alterar lógica de persistencia, backend, datos ni permisos por este cambio de lenguaje. Revisar textos visibles, no reemplazar globalmente identificadores Supabase ni documentación técnica. Aplicar el mismo estándar en BT-MOBILE-02 cuando se implemente. Criterio: confirmaciones consistentes y verificadas en desktop/móvil, sin falsa confirmación de guardado. Esta anotación es documental; no se implementa ni despliega ahora.

---

## 26/11/2026 — QA real: restitución Full confirmada; bloque consolidado siguiente

Titular confirma recuperación de Full y 8 cupos. Postflight Supabase de solo lectura confirma suscripción full/active/lifetime, operaciones, agenda y archivo habilitados, 1 mecánico activo, 1 OT y 1 entrega conservadas en taller piloto. Revocación parcial: cambio de plan y cupos PASS, brecha de escrituras CP04 pendiente; no declarar aceptación final. Siguiente: bloque BT-PILOT-FIX-01, entrega privada consolidada de las once incidencias del checkpoint (prioridad servidor para revocación, cierre de OT y reactivación; después ocho UX acotadas). Mantener reglas Básico/Plus/Full y aislamiento, probar con datos sintéticos, preservar registros e históricos, no instalar SQL ni desplegar sin autorización específica. Luego validar recuperación/denegación focalizada, logos y BT-MOBILE-02 antes de incorporación de Ignacio. No repetir SEC07 ni suites históricas por rutina.

---

## 26/11/2026 — QA real: cierre de recorrido y brecha de revocación CP04

Titular confirmó recorrido PC terminado, desactivación y reincorporación del mecánico por nueva invitación exitosas. Revocación Full observada: ambas licencias efectivas Básico, 1/0 cupos, nuevas reservas bloqueadas, membresía conservada. Supabase en solo lectura confirmó suscripción full/revoked, OT de prueba ready, entrega registrada y 1 mecánico activo. Mecánico reporta controles multipunto editables después de revocar; no se ha comprobado una escritura nueva persistida durante la revocación. Inspección de políticas/triggers productivos confirma que cp04_findings_insert/update y guardas existentes no comprueban licencia; INSERT exige orden no closed y guard de actualización solo protege determinados campos en closed. No declarar revocación completa PASS. No modificar datos históricos para comprobar.

**Prioridad antes de incorporar a Ignacio:** BT-PLAN-REVOCATION-CP04-01, guardas de escritura de inspección y revisión focalizada de otras operaciones premium CP03/CP04 directas; aplicar política comercial por plan y taller, conservar lecturas históricas autorizadas, no romper flujo Básico permitido ni talleres previos, no depender solo del frontend. BT-FLOW-CLOSE-01: ready/entrega registrada en solo lectura para mecánico, proteger servidor y cliente; eventual retorno a reparación autorizado/auditado solo cuando sea compatible con la entrega y expediente inmutable; no reabrir entregas históricas silenciosamente, conservar observaciones históricas y distinguir seguimiento posterior legítimo. BT-UX-MECHANIC-REACTIVATE-01: reactivar membresía desactivada directamente desde Configuración con confirmación, cupos/plan/roles y validación servidor, auditoría y conservación de identidad/historial; no duplicar cuenta ni exigir invitación nueva. Agrupar estas tres incidencias con siete UX anteriores, priorizar guardas de servidor y pruebas focalizadas antes de alta de Ignacio. Recuperar Full de prueba desde panel del creador y verificar estado, cupos y datos; no activar cambios SQL sin autorización. Sin nueva auditoría general SEC07.

---

## 26/11/2026 — QA real del taller piloto (en curso)

LIVE-FIX-01 integrado en `9381d103f8b32c56e535b3085c8938843c0c79f1`, CI 5/5 SUCCESS incluyendo nueva regresión Chromium/WebKit; Render dep-dc49raeq1p3s73dbmleg LIVE, luego titular habilitó VITE_BT_PLAN04_WORKSHOPS_ENABLED y confirmó interfaz activa. MFA, Full permanente, creación de taller propio, identidad comercial persistente, registro móvil y aceptación de mecánico (1/8 activos, 0 reservas) verificados en QA real. Activación individual de operaciones, agenda y archivo autorizada y verificada en Supabase 21:24 UTC, sin alterar los dos talleres previos. No implica aceptación completa.

Pendientes agrupados: BT-UX-SESSION-01 (restaurar taller/pantalla con revalidación servidor), BT-UX-NAV-01 (navegación Configuración), BT-UX-INVITE-01 (continuidad invitación tras confirmación de registro), **BT-UX-KM-01** (kilometraje chileno: 120.000 rechazado, 120000 aceptado por titular; normalizar separadores de miles sin reinterpretar decimales ni datos inválidos, mostrar validación explícita). BT-UX-INSPECTION-01 (maquetación del detalle técnico multipunto: textos de guardado/estado y textarea comprimidos o superpuestos; reorganizar filas compactas premium R2 con separación, alineación uniforme, textarea que crece según contenido con límite razonable, controles legibles en escritorio y móvil; evitar tarjetas altas por componente. Alcance rectificado por titular: revisualizar SOLO el bloque informativo superior señalado (resumen de inspección registrada, orden real, título/instrucciones, volver a orden, contador guardados y leyenda). NO rediseñar la grilla, familias, marcas X, colores, distribución ni lógica multipunto; conservar únicamente el ajuste compacto del detalle técnico previamente solicitado). BT-UX-PDF-PREVIEW-01 (visor del PDF de inspección: abrir modal amplio centrado en pantalla, responsivo, visualización legible, scroll y cierre; conservar documento original y flujo de borrador/no enviado). BT-UX-QUOTE-ACTIONS-01 (separar Crear cotización como CTA superior y Recuperar borrador de la OT debajo del selector; respetar contrato vigente de OT, borrador único e idempotencia, sin duplicar registros). QA real PC↔Android web: misma OT y 34 estados visibles desde mecánico; cambio de inspección desde Android confirmado visible en PC por titular, PASS bidireccional. Ocultar Nueva recepción al rol mecánico sin permiso en bloque móvil. Registrar y resolver juntos tras completar QA multiusuario; no repetir suites históricas, ni Codex por cada incidencia. [Checkpoint QA real](docs/checkpoints/CHECKPOINT_BT_PILOTO_QA_REAL_20261126.md). Las notas anteriores se conservan como histórico.

**Nuevo bloque prioritario BT-MOBILE-02:** Android nativo Expo + iPhone PWA, misma experiencia premium y funcional por rol, reutilizar backend y base existente, QA física en ambos antes de entrega móvil definitiva a Ignacio. Ver alcance completo en [roadmap.md](roadmap.md). No iniciar ni desplegar por esta anotación.

---

## 26/11/2026 — BT-PLAN-04BC-LIVE-FIX-01, candidato privado

Cuenta personal accesible desde el menú aun con membresías; licencia personal y plan efectivo del taller consultados por separado al servidor. Creación con RPC existente, cambio autorizado de taller y borradores aislados; Básico neutro, Plus azul y Full con corona dorada. Invalidación tras mutación confirmada del creador y reconsulta automática, sin conceder permisos desde la UI. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_PLAN_04BC_LIVE_FIX_01_20261126.md).

Base `dab762c0a9bb183a236599822f544485dbcfce31`. Regresión SQL aislada PASS, 9 unitarias focalizadas PASS, Chromium 1440/390 PASS, TypeScript y bundles público/privado con fronteras PASS. WebKit BLOCKED_ENVIRONMENT y CI oficial pendientes; no repetir suites históricas ni intentar descargas. Sin SQL productivo/migraciones, permisos/RLS, dependencias, respaldos ni SEC07. Solo delta privado DTK-ERR-056; sin push oficial, despliegue ni cambios en producción. Integración y aceptación alojada requieren revisión de Dirección Técnica. Las notas siguientes son históricas.

---

## 26/11/2026 — BT-PLAN-04BC LIVE; instalación técnica completada

CI oficial 5/5 SUCCESS en dc056b1620398e050c0d00f7d96abd88efec0684. [SQL instalado](docs/checkpoints/CHECKPOINT_BT_PLAN_04BC_SQL_INSTALADO_20261126.md): cinco migraciones registradas, 13 PDF conservados y guardas de licencia instaladas. Edge workflow [45884708021](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45884708021) SUCCESS, marcador BT_PLAN04BC_CP05_DEPLOY_SUCCEEDED, paquete reproducible y JWT true; CP05 v10 ACTIVE, Final Archive v7 y Owner Onboarding v8 sin cambios. Render dep-dc48l50u01pc73f6r5tg LIVE en 05bb77fddf236f5eea966d393dd3cef505a8f149 (solo documentación adicional sobre SHA CI aprobado), finalizado 19:38:22 UTC; Auto-Deploy OFF confirmado. [Checkpoint LIVE](docs/checkpoints/CHECKPOINT_BT_PLAN_04BC_LIVE_20261126.md).

Cierre de instalación técnica, no aceptación funcional alojada ni alta de Ignacio. Siguiente: QA humana focalizada con cuenta existente, MFA real del creador y alta/licencia/activación puntual de BIOMOTORS bajo autorización correspondiente. No conceder licencias ni habilitar cuentas reales automáticamente. Logos, correo externo y pagos permanecen fuera del alcance; SEC07 cerrado, sin nuevas ejecuciones Codex. Mantener históricos y no repetir suites por rutina.

---

## 26/11/2026 — BT-PLAN-04BC SQL instalado; Edge pendiente

CI oficial 5/5 SUCCESS en dc056b1620398e050c0d00f7d96abd88efec0684, incluido WebKit. Titular autorizó hasta Render, confirmó ventana sin editores y My Workspace; S5B restaurado, 13 PDF verificados, snapshot 19:27:31 UTC. Preflight sin cambios posteriores detectados en datos comerciales/Auth/Storage consultados; cuatro firmas previas coincidentes y Auto-Deploy OFF comprobado. Cinco migraciones aprobadas aplicadas en orden y verificadas en historial: 20261126192950 bt_plan04b_workshops, 20261126192959 bt_plan04c_mechanics, 20261126193003 bt_plan04bc_pilot, 20261126193008 bt_plan04_cp05_branding, 20261126193013 bt_plan04bc_revocation_delta.

Postflight: 5 tablas privadas con RLS/FORCE y sin SELECT anon/authenticated; RPC nuevas sin EXECUTE anon, tres auxiliares privados sin EXECUTE anon/authenticated/service_role. Guardas de licencia presentes, dos talleres/13 objetos conservados, cero licencias/invitaciones/altas y cero bucket branding. Advisor: sin ERROR, INFO de RLS privada sin políticas y WARN por RPC SECURITY DEFINER autenticadas intencionales y protección de contraseñas filtradas deshabilitada; no equivale a nueva auditoría integral. [Checkpoint SQL instalado](docs/checkpoints/CHECKPOINT_BT_PLAN_04BC_SQL_INSTALADO_20261126.md). Edge CP05 aún v9, Final Archive v7, JWT true según consulta previa. **Siguiente: titular ejecuta workflow manual [PLAN04BC Edge](.github/workflows/bt-plan04bc-edge-manual.yml) con DESPLEGAR_PLAN04BC_CP05; comprobar éxito y versión/JWT antes de Render.** Conector GitHub no dispone de dispatch. Autorización vigente; no repetir CI/SEC07 ni activar logos, pagos, correo, registro real o talleres reales.

---

## 26/11/2026 — BT-PLAN-04BC-CI-FIX-02, delta con WebKit pendiente

Simuladores CP04/CP05 y auditorías adaptados al POST de lectura de capacidades, con validación exacta de actor/taller y separación de escrituras comerciales. CP04, doce F01–F06, CP05, persistencia Chromium y Auth R1 final PASS local. Las dos ejecuciones WebKit quedan BLOCKED_ENVIRONMENT: navegador ausente y descarga oficial 403. Dirección Técnica dispone validar WebKit en CI oficial; no repetir descargas, buscar alternativas ni cambiar red. No declarar verde el workflow completo ni sustituir WebKit. [Checkpoint CI-FIX-02](docs/checkpoints/CHECKPOINT_BT_PLAN_04BC_CI_FIX_02_20261126.md).

Base `f549b0846bdd50bb16d223f5adb279e2fa9915c1`; entrega exclusiva por DTK-ERR-056 a revisión privada con WebKit BLOCKED_ENVIRONMENT, pendiente de CI oficial por instrucción de Dirección Técnica. Chromium completado; no repetir pruebas aprobadas. Sin lógica productiva, SQL, RLS, permisos, workflows ni dependencias modificados; laboratorio SQL aprobado no repetido, sin respaldos ni SEC07. No push oficial ni cambios alojados o de red. Logos, correo, pagos y cuentas reales OFF.

---

## 26/11/2026 — BT-PLAN-04BC-CI-FIX, candidato privado

Corrección exclusiva de preparación del laboratorio histórico PLAN04 (dependencias Agenda/FLOW-FIX-01) y simulador Auth R1 (RPC de capacidades por POST exacto con método, payload, actor y taller verificados). Laboratorio SQL afectado y ejecutor Auth en sus dos modalidades CI PASS local; sintaxis e integridad verificadas. Sin modificar lógica comercial, Auth productivo, SQL aprobado, RLS ni permisos. [Checkpoint CI-FIX](docs/checkpoints/CHECKPOINT_BT_PLAN_04BC_CI_FIX_20261126.md).

Base oficial `6c52420b30121341c87db4323ad9cf2ae825febf`; entrega solo por DTK-ERR-056 a revisión privada. No repetir 122 unitarias, 51 SQL, 25 de revocación ni visuales ajenos. CI remota corregida pendiente de integración por Dirección Técnica; no push oficial ni cambios alojados. Respaldo integrado con 13 PDF actualizado/restaurado y cotejado con Supabase según Dirección Técnica; no se reejecutó ni se reabrió SEC07. No activar migraciones/despliegues, logos, correo, pagos ni cuentas reales desde este bloque.

---

## 26/11/2026 — PLAN-04BC-PILOTO-01 y delta integrados

Autorización del titular para integración, SQL y despliegue coordinado, sujeto a las puertas técnicas. Candidato final 1396496df4f6acad591cc13ce83dc891a5610026, árbol f625fab344444916187f805a61ed784e4adf9b24 reconstruido exactamente; commit oficial ecdfe58386165a39826249bb8a6b68f3965cdaa6. 30 archivos, pruebas del candidato 122 unitarias/51 SQL y delta 25 focalizadas reportadas; no reejecutadas por Dirección Técnica. El delta conserva lectura histórica y bloquea escrituras premium tras revocación de Full para talleres gestionados. CI del commit integrado pendiente. No publicar evidencias privadas.

Preflight de solo lectura: cuerpos de tres autorizadores y preparación CP05 coinciden con guardas candidatas; 04B/C aún ausentes, dos talleres, cero licencias, cero MFA verificado, 13 PDF privados vs 11 del último respaldo reportado. Antes de SQL, confirmar respaldo integrado vigente (nuevos documentos), ventana sin editores y CI. Workflow manual CP05 preparado para el SHA fijo; no ejecutarlo hasta confirmar las cinco migraciones en orden. Final Archive permanece en v7. No activar logo, billing, correo externo, registro real ni talleres reales automáticamente. SEC07 no reabierto.

---

## 26/11/2026 — BT-PLAN-04BC, delta de revocación

Corrección focalizada sobre `5dff5465e46b2903ddabaef4505cefb1c6be0131`: licencia Full vigente y sincronizada comprobada en las escrituras del piloto desde servidor, además del rollout. Revocación con taller todavía habilitado bloquea Agenda/CP05/FLOW/archivo sin borrar históricos ni miembros y conserva lectura autorizada de originales. [Checkpoint del delta](docs/checkpoints/CHECKPOINT_BT_PLAN_04BC_REVOCACION_20261126.md). 25 comprobaciones focalizadas; sin repetir 122 unitarias, 51 SQL ni visuales completos.

Solo delta por DTK-ERR-056 a revisión privada, con migración incremental candidata posterior a las cuatro anteriores. No push oficial, SQL alojado ni cambios productivos. Identidad visual, contratos base CP03/CP04 y piloto legacy QA conservados. SEC07 cerrado, correo y Auto-Deploy OFF; logos/bucket y FLOW-UX-01-R2 siguen pausados. Esta nota corrige exclusivamente la relación licencia/autorización operativa de la entrega inicial.

---

## 26/11/2026 — BT-PLAN-04BC-PILOTO-01, candidato consolidado privado

Alta de taller/licencia Full permanente y equipo 04B/04C reutilizados; autorización operativa por taller desde servidor en lugar de UUID QA; perfil comercial textual para nuevas emisiones compatible con FLOW-FIX-01 y Agenda. Logo/bucket y plantillas propias OFF hasta confirmar recuperación segura en S5B. 122 unitarias pertinentes, 51 SQL aisladas, navegador 1440/390, TypeScript, builds y paquete Edge offline PASS. Incidencias de fixtures/selectores registradas, sin repetir suites históricas ni respaldos. [Checkpoint consolidado](docs/checkpoints/CHECKPOINT_BT_PLAN_04BC_PILOTO_01_20261126.md).

Base `6f63bbdea12dbfa73b24eec43c055bbbcddb50a3`, única rama local main; entrega solo por DTK-ERR-056 a revisión privada. Sin push oficial, cambios en Supabase/Render, SQL alojado, cuentas/licencias reales, pagos, correo o despliegues. Integración, MFA real, alta de Ignacio y activación puntual de BIOMOTORS requieren autorizaciones posteriores del orden documentado. SEC07 cerrado, FLOW-FIX-01 LIVE conservado, Auto-Deploy OFF y FLOW-UX-01-R2 pausado. Las entradas siguientes son historia.

---

## 26/11/2026 — BT-FLOW-FIX-01 LIVE y aceptación del propietario

Cierre autorizado. Edge CP05 v9 y Final Archive v7 ACTIVE, JWT conservado, workflow manual 45855550767 SUCCESS. Migración 20261126160911 bt_flow_fix_01_text_validation aplicada, preflight 16/16 y verificación 8/8 cuerpos y 8/8 CHECKs, fingerprint de seguridad sin cambios; 11 objetos privados presentes. Render dep-dc45jrd9el5s73a9pjf0 LIVE en 04d922c9961cbd4fee23572a81e2efe6ecd6e4de. El propietario aprobó la etapa y aportó captura del borrador multipunto visible; las otras dos mejoras no tienen comprobación humana individual aportada. Aceptación general registrada sin atribuir evidencia inexistente. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_FLOW_FIX_01_20261126.md). SEC07 permanece cerrado.

Siguiente: BT-PLAN-04B. El candidato SQL y frontend de alta de taller existen desde 17/11; no reconstruir. Revisar compatibilidad con catálogo actual, gates, licencias y acceso guiado multiempresa; 04A instalado, MFA real pendiente. 04C/branding y habilitación del taller piloto requieren pasos autorizados separados. No crear cuentas de terceros, conceder planes reales, activar gates ni migrar sin autorización específica. Pagos y correo externo OFF; Auto-Deploy OFF. Auditoría independiente en curso según titular; conservar alcance y distinguir hallazgos P0 de mejoras comerciales.

---

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

## Regla permanente de diseño — ByteTorque Premium R2

Todo agente que diseñe o modifique interfaces de ByteTorque debe consultar antes de implementar el sistema visual R2, el catálogo de assets y las referencias gráficas oficiales. El índice permanente está en [docs/design/referencias-r2/README.md](docs/design/referencias-r2/README.md). Debe visualizar los recursos pertinentes, reutilizar los tokens y componentes aprobados y respetar el alcance autorizado de cada pantalla.

## 25/11/2026 — BT-FLOW-NEXT-01-R1-VISUAL

Homologación visual del recorrido a Premium R2, con validación focalizada a 1440/390/375, seis pruebas de regresión y builds pertinentes. La biblioteca permanente y el [checkpoint visual](docs/checkpoints/CHECKPOINT_BT_FLOW_NEXT_01_R1_VISUAL_20261125.md) documentan referencias, evidencias y límites. La versión R1 y su aprobación técnica pendiente se conservan en el repositorio privado de revisión.

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

## Regla permanente del propietario — dirección técnica y economía de cuota (24/11/2026)

**Vigente para ChatGPT, Codex y cualquier agente.** El propietario informó un consumo de aproximadamente 60 % de su cuota en la entrega de archivo privado/recuperación del expediente final; no se dispone de desglose por operación. La prioridad es entregar funciones completas, seguras y utilizables, sin trabajo redundante.

1. **ChatGPT director:** investigar GitHub y documentación pertinente, diagnosticar, consultar selectivamente development-toolkit, definir arquitectura, archivos/símbolos afectados, criterios de aceptación y pruebas necesarias. Encargar a Codex únicamente lo que necesita ejecución local; asumir documentación, verificación de CI/despliegues y correcciones pequeñas cuando las herramientas y autorizaciones lo permitan.
2. **Codex ejecutor:** comprobar HEAD, estado local y restricciones vigentes; implementar el encargo delimitado, reutilizar código existente y ejecutar una sola validación consolidada proporcional al riesgo. Leer primero este bloque, estado reciente de los documentos obligatorios y checkpoint pertinente; buscar por nombre/símbolo/tema y ampliar únicamente cuando sea necesario. No cargar íntegramente el historial acumulado de AGENTS.md, agent.md, roadmap.md, todos los checkpoints o todo development-toolkit en cada tarea. Esta regla precisa y sustituye solo la exigencia previa de lectura exhaustiva por defecto, no las restricciones ni autorizaciones del proyecto. Leer las secciones adicionales relevantes si existe duda o conflicto.
3. **Traspaso técnico mínimo:** objetivo observable, SHA base, rutas y contratos existentes, cambios concretos, límites, pruebas de aceptación y estado esperado. No delegar de nuevo la misma investigación ni pedir al propietario repetir evidencias disponibles. Si el plan aún no es suficiente, comunicar el bloqueo concreto al director antes de explorar extensamente o ampliar alcance.
4. **Pruebas y fallos:** usar fixtures, suites y evidencias existentes; ejecutar regresiones pertinentes, compilación/tipos cuando correspondan y CI existente según filtros. No relanzar CI aprobada del mismo SHA ni repetir auditorías cerradas sin cambio relevante. Ante fallo, identificar causa, corregir y repetir solo lo afectado cuando sea suficiente; si el intento focalizado no resuelve o aparece una incertidumbre arquitectónica/de seguridad, detener la cadena de intentos y escalar con evidencia breve. No relajar pruebas ni omitir controles necesarios para ahorrar cuota.
5. **Modelos y esfuerzo:** preferencia del propietario por esfuerzo bajo para tareas sencillas y bien delimitadas, medio para integraciones; alto o modelo más capaz para seguridad, migraciones y problemas complejos cuando lo ameriten. No asumir que puede cambiarse el modelo desde el repositorio ni prometer un porcentaje de ahorro.
6. **Cierre breve y trazable:** un checkpoint consolidado por entrega, con SHA, archivos, pruebas/resultados, alcance, riesgos y próximo paso; enlazar en lugar de duplicar informes o logs. Registrar nuevos errores y soluciones reutilizables con su evidencia; consultar solo el índice y entradas pertinentes de development-toolkit, sin copiar secretos ni herramientas sin verificar compatibilidad. No generar microetapas ni dividir artificialmente una entrega por cuota.
7. **Límite de alcance:** no duplicar trabajo de otro agente ni sobrescribir sus cambios locales; sincronizar mediante fast-forward cuando sea posible, y reconciliar sin force-push si hay divergencia. No modificar código/infraestructura por una orden documental. Mantener main, Auto-Deploy OFF y repositorio público solo temporalmente según autorización vigente. Seguridad, RLS, integridad, respaldos, separación de entornos y autorizaciones productivas no se reducen.

**Aplicación inmediata:** el archivo privado/recuperación del expediente final fue aprobado por el propietario para implementación y validación local solamente. Su estado de ejecución y resultados se deben comprobar con Codex, no se presume completado. Acotar a los contratos CP05/CP06/BT-COM y dependencias de respaldo documental pertinentes. BT-REG-01 candidato verificado, sin SQL aplicado ni activación; SEC07 y CP04 cerrados en su alcance y selector CP05 aceptado. No autoriza push funcional, SQL, Storage/Edge alojados, respaldo nuevo, flags, envío real ni deploy.
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

## BT-COM-01 — paquete documental de 3 PDF (23/11/2026, candidato local)

El Director solicita desarrollar **una descarga conjunta** desde el cierre documental
CP06 existente. Reutilizar `prepareClosingPacket`, `documentClient.download`,
`archivedRevisionBytes`, `browserClosingDocumentPdf` y `ClosingReviewPanel`.
Solo permitir un ZIP local de tres PDF si existen cotización archivada íntegra y
los tres registros LIVE-02 de la misma revisión/taller. El PDF 01 es exactamente
el del archivo CP05 (SHA-256/tamaño verificados por el puerto privado), no
regenerado desde un borrador; los PDF 02/03 son copias informativas.

Sin proveedores nuevos, sin email real, sin activación de flags, sin SQL ni
Render. Código publicado en `main` por autorización expresa del propietario el 23/11/2026; CI pendiente de confirmar, no declarar PASS antes de comprobarla.
CP05: QA de emisión/rediseño aprobada, **NO cerrado 100% del piloto**:
restauración S4 integral, descarga física del archivo tras nueva sesión, correo
único autorizado y conformidad de Ignacio pendientes. Cualquier flujo de
aprobación/entrega representa declaración del operador, no firma verificable.

## BT-FLOW-LIVE-02 — continuidad funcional y autorización de publicación (23/11/2026)

El propietario **aprobó visualmente CP05** en bytetorque.cl y autorizó expresamente
**una publicación de código y documentación en la única rama `main`**, con
la CI existente, **sin desplegar Render ni modificar Supabase**.
Base verificada antes de integrar: `e0fee642f41516968023c52a14fc2583f2bb0636`; Render Auto-Deploy **OFF**.
No se activaron flags LIVE-02, migraciones, escrituras, correos ni datos reales.

Cambio focalizado: el panel LIVE-02 muestra al volver desde una sesión las
decisiones guardadas por partida, notas de aprobación/ejecución/entrega y totales;
el transporte comprueba concordancia de recibos y lectura RLS con el snapshot CP05.
`WorkExecutionDraft` diferencia borrador local de declaración persistible.
Un único commit `main` y una ejecución habitual de CI para validación, sin
repetir auditorías. **CI no certifica aceptación alojada ni piloto Ignacio.**

Bloqueo vigente: recuperación integral S4 pendiente desde el PC personal.
SQL candidato `docs/sql/BT_FLOW_LIVE_02_CANDIDATE.sql` sin aplicar, las tres
tablas BT-FLOW-LIVE-02 ausentes en Supabase; no instalar ni habilitar servidor,
Render o datos de clientes sin aprobación específica posterior.
CP05 QA emitido y rediseño visual aprobado **no** reemplazan S4.

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

## Continuidad consolidada - main publicado, despliegue pendiente (22/11/2026)

GitHub main verificado en efc87801caefe1e501805e46d5733f72507f43d0: el multipunto oficial YA ESTA IMPLEMENTADO y PUBLICADO en codigo.47/47 pruebas y A4 unica corresponden a la evidencia del entorno desarrollador y al checkpoint BT-INS-PDF-02; no se repitieron ni modificaron aqui. Despliegue efectivo de esta revision NO verificado; no confundir publicacion con disponibilidad productiva. Las notas inferiores que dicen sin push son historicas.

S4I integrado anteriormente en0bb0ea59d78d:11 archivos,CI general/oficial SUCCESS,sin deploy. Auth/CORS se conservan. S4 integral PARCIAL;respaldo manual operativo cada2dias;automatizacion R6 cancelada. Mantener Render OFF hasta autorizacion especifica; After CI Checks Pass es propuesta futura,no permiso para desplegar.

No reimplementar,investigar o probar el multipunto. Siguiente publicacion propuesta SOLO documental,tras revision y autorizacion de staging/commit/push;sin ramas nuevas,SQL,flags,Storage,Edge,correo o cambios productivos. Nunca copiar carpetas o documentos privados completos desde ZIP sobre main.

---

## BT-INS-PDF-02 — resumen multipunto oficial en una hoja A4 (22/11/2026)

Por orden del titular, el PDF CP04 es **exactamente una página A4 vertical** con los 34 componentes, tres casillas y X solo en el estado persistido; no evaluado queda sin X. Sustituye la paginación histórica de BT-INS-PDF-01: observaciones completas permanecen en expediente, PDF es resumen con aviso explícito. Reutilizar logos oficiales; no inventar técnico, combustible ni horarios si faltan. No tocar PDF CP05. Implementación local probada, sin push/deploy: [checkpoint](docs/checkpoints/CHECKPOINT_BT_INS_PDF_02_DISENO_OFICIAL_A4_20261122.md). No confundir candidato local con publicación ni habilitar correo por el texto de una referencia visual.

---

## SEC07 S4H - continuidad y publicacion controlada (22/11/2026)

S4 integral PARCIAL. Respaldo manual PostgreSQL OPERATIVO; uso por el titular cada 2 dias, sin programacion automatica ni borrado. No reactivar S5C-R6 ni repetir pruebas de respaldo aprobadas.

Preparacion local S4H: guarda de autoridad para clientes pendientes tras logout/cambio de taller y CORS exacto para dominios canonicos. 24 casos nuevos PASS mediante adaptador Node sin red; Deno no disponible y runtime Edge pendiente. Esto no revoca access JWT copiados ni acredita cambios remotos. Mantener identidad confirmada, membresias activas, permisos y RLS.

Leer [procedimiento S4H](docs/recovery/SEC07_S4H_INTEGRACION_SEGURA.md). Historicos inferiores conservados; sus instrucciones de automatizacion/exportacion no reactivan autorizaciones. Solo main, nunca push/deploy/migraciones automaticos. Render On Commit requiere pausa autorizada y verificada antes de publicar; skip render es defensa adicional. No publicar material privado ni copiar el ZIP completo.

---

## BT-SEC07 — S4A RESTAURACIÓN PARCIAL, PRIMER ERROR SQL CLASIFICADO GENÉRICAMENTE (21/11/2026)

Salida Windows S4A: `BACKUP S2_R11_VERIFIED`, `SHA256 PASS`, `DOCKER LOCAL_ENGINE`, `LAB ISOLATED_TMPFS_STARTED`, `ARCHIVE_HEADER PASS`, `GPG_INTEGRITY PASS`, `RESTORE_CLASS SUPABASE_DEPENDENCY_OR_ROLE_MISSING`, `STOP ISOLATED_RESTORE_NOT_COMPLETE`. La clase anterior fue asignada por un `grep` con múltiples patrones: role missing / extension missing / function/type/relation missing; **NO prueba cuál faltó**. El laboratorio fue efímero y no conservó stderr, por tanto la causa exacta NO es recuperable sin otra corrida restringida. **S2 sigue PASS estructural; S4 completo sigue abierto.** No repetir S2, no tocar Supabase, no cambiar cifrado, no asumir corrupción del archivo ni declarar restauración terminada. Próxima comprobación S4B: misma v04 verificada, laboratorio aislado PG17, mejorar clasificación del PRIMER error de `pg_restore` en shell usando regex **sin imprimir** SQL/objetos/datos, reportar sólo clase permitida y si hay extensiones o roles incompatibles. Si dependencia de Supabase, diseñar runtime Supabase PG17 y migrar roles/servicios por procedimiento oficial antes de intentar final. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S4A_RESTORE_DEPENDENCIA_PENDIENTE_20261121.md), [incidente](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). Main docs [skip render].

---

## BT-SEC07 — S2-R11 PASS_BACKUP_AND_TOC; S4 RESTAURACIÓN AISLADA SIGUIENTE (21/11/2026)

Windows reportó S2-R11 `NEW_CIPHER CREATED`, `MAGIC PGDMP_OFFSET_ZERO`, `GPG_INTEGRITY PASS`, `LINUX_TOC PASS`, `SOURCE UNCHANGED`, `SHA256 PASS`, `MANIFEST CREATED`, `BACKUP ENCRYPTED_FINALIZED`, `RESULTADO PASS_BACKUP_AND_TOC`. **S2 cierre ESTRUCTURAL** del primer archivo nuevo v04 cifrado y manifiesto, solo en PC; no implica restore real. Incidente BOM reparado y demostrado, no reexportar ni repetir v02/v03; secreto no subido. Próximo S4 restauración Docker PG17 aislada `--network none`, datos tmpfs, sin puertos/volúmenes persistentes, `pg_restore --no-owner --no-acl --exit-on-error`, resultados sanitizados. S3 otros componentes Supabase/roles pendiente. Ver [checkpoint R11](docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R11_BACKUP_CIFRADO_VALIDADO_20261121.md). Si STOP registrar causa/solución en AGENTS, agent, roadmap y registro. main docs [skip render].

---

## BT-SEC07 — LOGS NO SON COMANDOS POWERSHELL (21/11/2026)

El titular copió y ejecutó por accidente varias líneas de SALIDA `BT_SEC07_S2_R10_*: ...` como si fueran comandos PowerShell; Windows devolvió `CommandNotFoundException` para cada etiqueta. Solución: detener línea pendiente con Ctrl+C y copiar SÓLO el bloque de código completo que inicia `& {` y termina `}`; las líneas `BT_SEC07_*` son únicamente resultados para compartir en chat. No reejecutar R10. `R10 PASS_TOC_NO_NEW_FILE` conserva validez y R11 no ha sido ejecutado según esta salida. NO hay evidencia de cambio en la base ni archivos causada por ejecutar etiquetas. Mantener aviso breve inmediatamente antes de próximos bloques: **No pegar ejemplos de resultados en PowerShell.** Actualizado en [registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

---

## BT-SEC07 — S2-R10 PASÓ TOC POSTGRESQL LINUX CON BOM OMITIDO (21/11/2026)

Evidencia Windows `S2_R10_RESULTADO PASS_TOC_NO_NEW_FILE`, `SOURCE_HEADER BOM3_PGDMP`, `DOTNET_PROPERTY UNAVAILABLE`, `STDIN UTF8_NO_BOM_AT_START`, `GPG_INTEGRITY PASS`, `LINUX_TOC PASS`, `SOURCE_SHA256 UNCHANGED`, `PRODUCTION NOT_CONNECTED`, `FILES UNCHANGED`; R9 v04 partial AUSENTE. **Causa de fallo inmediato** pg_restore anterior: prefijo UTF8 BOM de 3 bytes. Remediación de paso de bytes VALIDADA para TOC mediante `Console.InputEncoding = new UTF8Encoding(false)` antes de arrancar Docker, restaurando luego, y omitiendo 3 bytes conocidos sin escribir dump claro. Propiedad `ProcessStartInfo.StandardInputEncoding` NO existe en este Windows PS5.1 — R9 inválido. No asumir atribución forense exclusiva a StandardInput sin aislarla. No reexportar DB; siguiente R11 crear nueva v04 cifrada sin BOM, comprobar header offset0 + GPG + Docker TOC + SHA y manifiesto. Hasta R11 PASS S2 no cerrado; S4 restauración total pendiente. [Checkpoint S2-R10](docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R10_LINUX_TOC_PASS_20261121.md). Todo FIX en AGENTS, agent, roadmap, incidents. main docs [skip render].

---

## BT-SEC07 — S2-R9 STOP POR ERROR LOCAL SIN CLASIFICAR; .NET FRAMEWORK NO STANDARDINPUTENCODING (21/11/2026)

Windows R9 `SOURCE V03_FOUND_UNIQUE`, `PRODUCTION NOT_CONNECTED`, `DOCKER LOCAL_ENGINE`, `KEY VERIFIED`, `STAGE CREATE_CLEAN_CIPHER`, `STOP LOCAL_ERROR_UNCLASSIFIED`, `EXISTING_FILES PRESERVED`. **Hecho nuevo documentado:** `ProcessStartInfo.StandardInputEncoding` que introdujo R9 pertenece .NET Core/.NET moderno y **NO existe en .NET Framework de PowerShell 5.1**: https://github.com/dotnet/msbuild/issues/15038 y https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.processstartinfo.standardinputencoding. **Causa muy probable del STOP** (requiere confirmación del mensaje de excepción o inspección propiedad en PC). No ejecutar R9, no sobrescribir si quedó v04 partial. Solución alternativa compatible .NET Framework: controlar BOM de stdin cambiando `[Console]::InputEncoding` a instancia `[Text.UTF8Encoding]::new($false)` ANTES de `Process.Start()`, restaurando en finally, o utilizar subprocess native binarios; no usar `StandardInputEncoding`. Diseñar primero validación de TOC sobre v03 con eliminación de BOM en flujo binario sin generar ciphertext, y solo después crear v04 limpio desde archivo preservado y validar; S2 sigue abierto. Registrar hallazgos en [incidentes](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

---

## BT-SEC07 — R8: CONFIRMADO BOM UTF8 (EF BB BF) EN ORIGINAL Y DERIVADO; AJUSTAR stdin SIN BOM (21/11/2026)

R8 Windows: dos ciphertexts GPG `ORIGINAL` v02 y `DERIVED` clean_v03 íntegros, ambos `MAGIC_OFFSET: 3`, ambos `PREFIX_TYPE: UTF8_BOM`, descifrados 1KB–1MB, no producción ni mutación. **Hallazgo confirmado:** un BOM UTF8 de 3 bytes está antes de PGDMP en original Y volvió a aparecer en v03, a pesar de omitirlo expresamente en R6. **Causa probable específica** que requiere validación con próxima ejecución: `.NET Process.StandardInput` es `StreamWriter`, codificación de stdin en Windows PowerShell 5.1 puede emitir BOM al acceder a `StandardInput.BaseStream` sin controlar `ProcessStartInfo.StandardInputEncoding`; reemplazar toda entrada binaria con `[Text.UTF8Encoding]::new($false)` ANTES de Start, y comparar primer byte esperado en nueva salida. No tratar pg_dump ni GPG como corruptos sin evidencia. No re-exportar DB; preservar v02/v03; crear derivado nuevo v04 sólo una vez, omitiendo BOM de v03, cifrando hacia proceso GPG stdin configurado SIN BOM. Validar v04 PGDMP offset0, GPG integrity, pg_restore toc en Docker Linux aislado por tmpfs/SHM con stdin SIN BOM y contenedor/red aislados. Sólo entonces promover + hash/manifest, aún sin full restore. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). 

---

## BT-SEC07 — S2-R7 STOP ANTES DE DOCKER / DOBLE CABECERA (21/11/2026)

R7 sobre `*_clean_v03.dump.gpg.partial`: `CIPHERTEXT FOUND_UNIQUE`, `PRODUCTION NOT_CONNECTED`, `TOOLS READY`, `STAGE MAGIC_CHECK`, `STOP CLEAN_ARCHIVE_MAGIC_INVALID`, `FILES PRESERVED_IF_CREATED`. No comprobación Linux `pg_restore`, ni publicación final. R5 original: `PGDMP_WITH_PREFIX`; R6 original: `PREFIX_BYTES 3`, `ORIGINAL_DECRYPT PASS`, `NEW_ENCRYPTION PASS`, `GPG_READBACK PASS`, pero `TOC_ERROR_CLASS OTHER`; R7 v03 decrypted empieza con bytes distintos de `PGDMP`. **No asumir que origen del prefijo sea pg_dump o Windows**: potencial prefijo al descifrar en stdout / canal binario requiere comparar posiciones y clases de prefijo en ambos ciphertexts. Próxima acción una sola comparación LOCAL SOLO LECTURA de magic offset en original v02 y derivado v03, identificación UTF8_BOM sin imprimir bytes, GPG estado y conteos; no Docker/reexport/dump ni nuevo ciphertext. Conservación PC-only, nunca usar secretos en GitHub. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). 

---

## BT-SEC07 — S2-R6: PREFIX 3, GPG DUAL PASS, PG_RESTORE STILL NONZERO (21/11/2026)

Windows reportó `PREFIX_BYTES 3`, `MAGIC PGDMP_FOUND`, `ORIGINAL_DECRYPT PASS`, `NEW_ENCRYPTION PASS`, `GPG_READBACK PASS`, `TOC_ERROR_CLASS OTHER`, `STOP PG_RESTORE_LIST_FAILED`, `FILES PRESERVED`, `PRODUCTION NOT_CONNECTED`. La nueva derivación cifrada `*_clean_v03.dump.gpg.partial` puede existir. **No hay respaldo certificado** ni restauración/TOC; NO repetir export PG ni volver a cifrar otro derivado. Cabecera desplazada por 3 bytes identificada, pero no basta para hacer pg_restore leer TOC. Hipótesis: posible problema de flujo Windows, archivo internamente alterado o argumento/lectura; falta diagnóstico técnico del mensaje stderr. Ejecutar UNA clasificación local segura del stderr desde v03, sin exportar, escribir claro ni imprimir datos/paths; verificar causa con marcadores. Documentar resultado en [registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). Nunca afirmar reparación PASS sin TOC exit0. main docs [skip render].

---

## BT-SEC07 — S2-R5 PGDMP_WITH_PREFIX, cifrado íntegro; reparar SIN NUEVO PG_DUMP (21/11/2026)

Windows reportó `R5_GPG_EXIT ZERO`, `CONTENT_TYPE PGDMP_WITH_PREFIX`, `PLAINTEXT_SIZE BETWEEN_1KB_AND_1MB`, `GPG_STATUS DECRYPTION_OKAY`, `GPG_INTEGRITY CONFIRMED`, `FILES UNCHANGED`, `PRODUCTION NOT_CONNECTED`. Evidencia: dentro de primeros 96 bytes del flujo descifrado hay `PGDMP`, pero NO en offset 0; causa directa de rechazo de cabecera por pg_restore. **Causa raíz de bytes añadidos aún desconocida**: no atribuir al pooler, pg_dump, GPG, PowerShell sin comprobación. No regenerar backup producción; conservar ciphertext `.partial` sin alteraciones. Próximo procedimiento local: streaming binario a nueva copia cifrada limpia, suprimir SOLO prefijo anterior al PRIMER PGDMP comprobado, y exigir verificación GPG y pg_restore TOC en nuevo archivo, hash SHA y manifiesto, sin exponer datos ni escribir plaintext a disco. Si falla, conservar ambos cifrados y dejar S2 abierto. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). 

---

## BT-SEC07 — S2-R4 FIRMA NO PGDMP: NO PROMOVER NI REEXPORTAR (21/11/2026)

Windows `BT_SEC07_S2_R4_ARCHIVE_MAGIC: NOT_PGDMP`, `STOP: ARCHIVE_MAGIC_INVALID`, `PRODUCTION: NOT_CONNECTED`, `FILES: PRESERVED`. Primera verificación directa de cabecera descifrada NO encontró `PGDMP`; R3 previamente `GPG_EXIT ZERO` pero `TOC_EXIT NONZERO`. Causa del contenido aún NO demostrada: puede ser salida descifrada vacía, otro formato o datos no previstos. **NO** declarar válido/corrupto definitivo, NO tocar `.partial`, NO repetir exportación ni modificar producción. Siguiente único procedimiento local para determinar LONGITUD descifrada, CATEGORÍA de encabezado (PGDMP/SQL/gzip/armor/empty/other) y estados GPG, sin mostrar bytes ni escribir claro. Si no PGDMP, volver a diseño del productor pg_dump vs GPG con evidencia, no más TOC reintentos. Registrar resultado en registro de incidentes y roadmap; única rama main, docs [skip render].

---

## BT-SEC07 — S2-R3 GPG EXIT0 / PG_RESTORE NONZERO: INSPECCIÓN BINARIA CONTROLADA (21/11/2026)

Windows S2-R3 informó `PARTIAL FOUND_UNIQUE`, `PRODUCTION NOT_CONNECTED`, `TOOLS AVAILABLE`, `GPG_EXIT ZERO`, `TOC_EXIT NONZERO` y STOP `PG_RESTORE_TOC_EXIT_FAILED`. No hay respaldo validado todavía, `.partial` intacto. La hipótesis previa 'cierre anticipado de pipe' NO fue certificada y probablemente insuficiente: pg_restore falla pese a drenaje. Siguiente: comprobar cabecera `PGDMP` y clasificar stderr de pg_restore sin exponer objetos, tablas, contenido, claves ni rutas; un solo procedimiento read-only local, sin DB ni export de nuevo. Documentar corrección sólo cuando pase. [Registro](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). No certificar restore/3-2-1.

---

## BT-SEC07 — S2 R2 DUMP CIFRADO PASS, TOC STOP: REANUDAR SIN NUEVO DUMP (21/11/2026)

Evidencia Windows S2-R2: `STRUCTURE PASS`, `TOOLS PG17_GPG_READY`, `GPG_KEY VERIFIED`, `TLS CLIENT_VERIFY_FULL_PASS`, `DATABASE POSTGRES17_VERIFIED`, `TRANSACTION READ_ONLY_PASS`, `ENCRYPTED_DUMP PASS`, luego `ARCHIVE_TOC_READBACK_FAILED` y `STOP`. Existe candidato `*.dump.gpg.partial` generado nuevo; **NO** declarado respaldo validado. No conectar de nuevo ni ejecutar pg_dump, no borrar/sobrescribir ese `.partial`. Sospecha sin comprobar: pg_restore --list sobre stdin termina temprano/cierra pipe, CopyTo marca error aunque TOC sea válido. Hacer UN readback local de archivo existente, drenando GPG stdout completamente incluso si pg_restore termina antes, comprobar exit ambos + TOC + status GPG, hash readback y promover a final/manifest sólo con PASS. Registrar causa confirmada posteriormente. Ver [registro operativo](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md). Solo docs [skip render], main.

---

## BT-SEC07 — REGISTRO OBLIGATORIO ERRORES / INC-S2-01 ABIERTO (21/11/2026)

Todo STOP debe registrar marcador, causa **comprobada**, hipótesis separada, solución concreta, evidencia de verificación y prevención en `docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md`; al confirmar solución actualizar además `AGENTS.md`, `agent.md` y `roadmap.md`. En S2 `IDENTIDAD_O_SOLO_LECTURA_INCORRECTA` ocurrió en preflight psql; no se inició pg_dump. CA renombrado no causó STOP. Motivo exacto **no confirmado**; el script mezcló BD, `default_transaction_read_only` y versión en CASE único con `PGOPTIONS`. Reemplazar prueba por transacción explícita `BEGIN READ ONLY`, observar `transaction_read_only` + BD + versión por separado. No repetir viejo script, no declarar FIX hasta PASS Windows. S0/S1A conservados. 

---

## BT-SEC07 — DECISIÓN POST S1A: RESPALDOS SÓLO EN PC; NO EXIGIR USB (21/11/2026)

El titular **revocó expresamente** requisito de dos USB/custodias externas: no dispone de USB y ordenó seguir sólo con PC. Esta instrucción vigente SUSTITUYE exigencia USB/3-2-1 de planes SEC07 anteriores; no bloquear S2 por ella ni preguntar de nuevo. S0 PASS, S1A GPG nuevo/canary recuperación PASS_LOCAL_ONLY; S1 aceptado para alcance local, **no** acreditado frente a robo/fallo total/cifrado malicioso PC. Realizar S2 nuevo pg_dump PG17 cifrado streaming TLS verify-full sólo lectura, jamás reutilizar archivos antiguos ni almacenar claro; S3 componentes externos, S4 restore local aislado, S5 automatización local, S6 hardening. No afirmar 3-2-1 o recuperación total certificada. [Checkpoint decisión](docs/checkpoints/CHECKPOINT_BT_SEC07_S1B_PC_SOLO_DECISION_S2_REAL_20261121.md). Solo main docs [skip render], no deploy.

---

## BT-SEC07 — S1A GPG LOCAL PASS, S1B CUSTODIA EXTERNA PENDIENTE (21/11/2026)

S1A Windows informó creación e inspección de clave primaria Ed25519 y subclave Curve25519, export secreto protegido iter+salt S2K, canary cifrado, importación a GNUPGHOME inicialmente vacío y descifrado idéntico: `BT_SEC07_S1_RESULTADO: PASS_LOCAL_ONLY`. Todavía no hay dos USB externos verificados ni cold recovery sin caché, no usar keyrings ni exportaciones antiguas, no tocar producción. Incidente script diagnosticado: `$home` intentaba modificar `$HOME` (PS case-insensitive), corregido a `$gpgHome`; incidente GPG timeout inicial quedó indeterminado y posteriormente generó correctamente. [Checkpoint S1A](docs/checkpoints/CHECKPOINT_BT_SEC07_S1A_RECUPERACION_CRIPTOGRAFICA_LOCAL_PASS_20261121.md). Seguimos S1B/S1C y luego S2; sólo main docs [skip render].

---

## BT-SEC07 — S0 WINDOWS PASS, S1 SIGUIENTE (21/11/2026)

Titular informó `BT_SEC07_S0_RESULTADO: PASS`, 8/8 directorios, ACL restringida, propietario, atributos de indexación y 3 documentos locales `PASS`; LEGACY NOT_TOUCHED, SECRETS NOT_CREATED, PRODUCTION NOT_CONNECTED. La validación proviene de su ejecución Windows, no de inspección remota. S0 cerrado como organización, no cifrado/restore/3-2-1. S1: generar NUEVA identidad GPG fuera del backup tree y probar descifrado de canary con GNUPGHOME inicialmente vacío; custodia de dos soportes independientes pendiente hasta verificación física. Nunca usar antiguas claves/backup. [Checkpoint S0](docs/checkpoints/CHECKPOINT_BT_SEC07_S0_ESTRUCTURA_ACL_WINDOWS_PASS_20261121.md). Repo metadata public observado: no subir secretos. Sólo main, docs `[skip render]`.

---

## REGLA SEC-07 — REINICIO INTEGRAL ORDENADO DE SEGURIDAD REAL CP79 (21/11/2026)

**Decisión final y prioritaria del propietario:** comenzar YA seguridad REAL de ByteTorque y **crear toda la nueva cadena de claves, carpetas, backups, restores, runbooks y custodia desde cero**, **sin reutilizar** claves OpenKeychain/PGP, copias/manifest antiguos o scripts heredados como infraestructura nueva. **Conservar los legados intactos**, no borrar ni sobrescribir ni recuperar la clave antigua como paso obligado. No reconstruir app, no cambiar producción inadvertidamente. Un buen resultado de SHA cifra NO significa recovery. Plan maestro [Nueva base SEC-07](docs/BT_SEC07_NUEVA_BASE_SEGURIDAD_REAL_20261121.md) y [CP79](docs/checkpoints/CHECKPOINT_BT_SEC07_REINICIO_SEGURIDAD_REAL_ORGANIZADO_20261121.md).

**Prioridad de ejecución:** S0 carpetas nuevas fuera repo/sync con ACL e inventario; S1 par clave NUEVO, custodia externa separada y recuperación test canary desde entorno vacío; S2 export REAL PG17 producción TLS verify-full cifrado stream, hashes/readback; S3 roles/owners/ACL/RLS/Auth/Storage/Edge/Render cubiertos/inventariados; S4 restore nueva copia aislado sin red con comparaciones y pruebas negativas A/B; S5 segunda copia 3-2-1, retención/automatización; S6 hardening prod con permiso separado. **Ejecutor PowerShell íntegro en el chat SIEMPRE CP66**, stop/fallo cerrado, marcadores sanitizados BT_SEC07_*, checkpoints reales al concluir cada hito, main única rama y docs [skip render]. **Seguridad aún NO certificada**.

**Lectura real producción 21/11:** Supabase ACTIVE_HEALTHY PG17.11; 6 RPC SECURITY DEFINER accesibles a authenticated, 8 tablas RLS privadas sin policies, Auth leaked-password protection OFF. Código RPC revisado presenta guardas creador y MFA aal2 para mutaciones de planes, pero requiere QA negativo; no corregir a ciegas. TLS cliente pooler verify-full previo PASS, SSL enforcement OFF observado, end-to-end no certificado. No DDL, dumps, restores ni cambios red por este checkpoint.

---

## REGLA SEC-07 — ARCHIVO SUPUESTAMENTE PRIVADO ES MENSAJE CIFRADO CP78 (21/11/2026)

Propietario ejecutó clasificador de encabezado (160 bytes): `PRIVATE_META_EXTENSION: OTHER_OR_HIDDEN_EXTENSION` y `PRIVATE_META_HEADER: ASCII_ENCRYPTED_MESSAGE`, GPG NOT_CALLED, IMPORT/DECRYPT NOT_ATTEMPTED. El archivo seleccionado comienza por armor `-----BEGIN PGP MESSAGE-----`, **NO** por `BEGIN PGP PRIVATE KEY BLOCK`; es un **mensaje OpenPGP cifrado en su superficie**, no export de clave privada reconocible directamente. Podría contener clave dentro pero no se sabe y **NO se autoriza descifrar por inferencia**. Extensión final real distinta de .pgp/.asc/.gpg. Clave pública .asc PRIMARY_MATCH (CP77), private disponible NO acreditada; CP72 GPG decrypt STOP, CP74 keyring NONE_LISTED. Próximo: localizar export real de clave secreta o contenedor original, sin renombrar/importar/descifrar y bajo consentimiento para nuevas exploraciones. PowerShell íntegro en chat CP66. [CP78](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_PRIVATE_FILE_IS_ARMORED_MESSAGE_NOT_KEY_20261121.md).

---

## REGLA SEC-07 — CLAVE PÚBLICA PRIMARY_MATCH; PRIVADA PGP PENDIENTE CP77 (21/11/2026)

CP76 Windows usuario: `.asc` público `PUBLIC_KEY_RECOGNIZED`, `PRIMARY_MATCH` contra `recipient_fingerprint` manifest, sin importar/descifrar. **No prueba** archivo secreto `.pgp` utilizable ni PKESK ciphertext real. CP75 mostró `STOP_KEY_FORMAT_OR_READ` sobre supuesto privado, que solo apareció al elegir «Todos los archivos» pese a filtro `*.pgp` permitido: posible extensión final no visible; no renombrar. Entregado **PowerShell COMPLETO EN CHAT** bajo permiso de metadatos CP75: selecciona solo supuesto archivo privado con filtro ALL, lee exclusivamente hasta **160 bytes** y determina extensión efectiva + encabezado OpenPGP candidato, NO GPG/import/decrypt. Esperar etiquetas `BT_SEC07_PRIVATE_META_*`, no compartir bytes ni archivos. [CP77](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_PUBLIC_ASC_PRIMARY_MATCH_PRIVATE_PGP_HEADER_PENDING_20261121.md).

---

## REGLA SEC-07 — ARCHIVO PRIVADO .PGP NO LEGIBLE, PÚBLICO .ASC ENCONTRADO CP76 (21/11/2026)

CP75 Windows resultó `STOP_KEY_FORMAT_OR_READ` al examinar archivo señalado como privado `.pgp`; propietario identificó también archivo público `.asc`. **Extensiones no certifican contenido** y STOP no prueba clave dañada: podría ser contenedor cifrado/otro formato o IO. Próximo paso mínimo autorizado CP75: comprobar **solo huella del .asc público** frente a `recipient_fingerprint` del manifest 19/11 con GPG `--show-keys`, sin importar, descifrar ni abrir `.pgp`; PowerShell completo en chat según CP66 y salida sanitizada. No repetir GPG real CP71, ni cambiar extensión/nombres. [CP76](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_KEY_FILE_FORMAT_STOP_PUBLIC_ASC_FOUND_20261121.md).

---

## REGLA SEC-07 — HUELLA ARCHIVO CLAVE PRIVADA, SOLO LECTURA CP75 (21/11/2026)

Usuario dijo tener localizada su clave privada original y AUTORIZÓ **solo verificar la huella sin importar/modificar/descifrar**. PowerShell entero entregado INLINE chat (CP66): selector manifest parcial 19/11 y archivo de clave, ejecuta GPG `--show-keys --with-colons --fingerprint --with-subkey-fingerprint` con `--no-options --no-autostart` y GNUPGHOME TEMP aislado, compara `recipient_fingerprint` con principales/subclaves sin imprimir UID, huellas, rutas ni material secreto. Distingue `SECRET_KEY_RECORDS_PRESENT`, `PRIMARY/SUBKEY_FINGERPRINT_MATCH`, `NO_MATCH` o STOP; no importa, descifra ni toca DB. Test con clave sintética GPG 2.4.7 en Linux PASS; **Windows real/clave usuario PENDIENTE**. No afirmar que matching garantiza desbloqueo ni ciphertext PKESK. Para importar/desbloquear/reanudar TOC exigir nuevos permisos. [CP75](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_PRIVATE_KEY_FILE_FINGERPRINT_READONLY_AUTHORIZED_20261121.md).

---

## REGLA SEC-07 — RESULTADO GPG KEYRING SIN SECRETAS CP74 (21/11/2026)

Propietario ejecutó CP73 PowerShell **metadatos**: manifest PARTIAL y recipient fingerprint DECLARED, GPG FOUND, `SECRET_KEYS: NONE_LISTED`, `RECIPIENT_MATCH: NO_EXACT_MATCH_IN_LIST`, sin decrypt ni passphrase. Clave privada **no listada en keyring GPG consultado**, explicaría CP72 STOP pero no prueba pérdida global ni corrupción. Antes de volver a descifrar: localizar **clave privada ORIGINAL** en otro GNUPGHOME/PC/USB/custodia, cotejar huella localmente, no publicar claves/secretos; no crear nueva para abrir viejo .gpg, no importar ni repetir decrypt sin permiso. CP67 hashes locales PASS pero backup parcial, restore pendiente. PowerShell SIEMPRE completo en chat. [CP74](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_METADATA_NO_SECRET_KEYS_LISTED_20261121.md).

---

## REGLA SEC-07 — DIAGNÓSTICO GPG SOLO METADATOS AUTORIZADO CP73 (21/11/2026)

Autorización expresa para revisar SOLO metadatos del keyring local tras CP72 `STOP_GPG_DECRYPTION_FAILED`; NO repetir GPG decrypt, importar/crear/exportar claves, SQL/restore/SSL ni tocar backup. Entregado PowerShell **íntegro en chat** (CP66) sin archivo/ZIP: selector `manifest.json` 19/11, `recipient_fingerprint` opcional contra registros `sec`/`ssb`+`fpr` de `gpg --list-secret-keys --with-colons --fingerprint --fingerprint`, stderr y nombres/fingerprints ocultos, sólo salida `BT_SEC07_GPG_DIAG_*`. No abre ciphertext .gpg ni pide contraseña. MATCH es solo huella listada, no clave desbloqueable; NO_MATCH o sin campo no prueba causa. Windows real **pendiente resultados**. [CP73](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_METADATA_DIAG_AUTHORIZED_20261121.md).

---

## REGLA SEC-07 — GPG REAL FALLÓ, NO REINTENTAR POR DOCKER CP72 (21/11/2026)

Resultado Windows del propietario en inspección única autorizada CP71: ZIP VERIFIED, manifest parcial y ciphertext SHA MATCH, GPG+pg_restore17 PRESENT, pero `BT_SEC07_REAL_TOC: STOP_GPG_DECRYPTION_FAILED`, Windows STOP. Dueño abrió Docker después: **Docker cerrado no explica directamente GPG Windows; no reintentar automáticamente**. Código ZIP inspeccionado: GPG invocado `--batch --no-tty --status-fd 2 --output - --decrypt`; STOP significa solamente salida GPG !=0, stderr/tokens sanitizados; razón desconocida (posible clave privada ausente/Pinentry/no desbloqueo/otros). `KEYRING WILL_BE_ACCESSED_LOCALLY` no verifica clave disponible. El exportador antiguo empleaba cifrado por clave pública con fingerprint, pero no presume igual exportador del backup 19/11. Siguiente paso bajo permiso separado: diagnóstico SOLO metadatos de claves/destinatario con marcadores sanitizados, antes de nuevo descifrado. No GPG decrypt, restore, SSL ni SQL repetidos. PowerShell siempre inline CP66. [CP72](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_REAL_TOC_STOP_GPG_DECRYPTION_FAILED_20261121.md).

---

## REGLA SEC-07 — AUTORIZADA INSPECCIÓN REAL GPG/TOC LOCAL CP71 (21/11/2026)

El propietario autorizó expresamente **UNA inspección LOCAL** GPG→`pg_restore --list` del backup cifrado del 19/11 con keyring histórico, sin DB, SQL restore ni Supabase. SHA ZIP inspector CP69/70 recalculada: `dd6e5b7851039eefbc5d01c3245899fa9f13e689f402b645829984bebbc24a58` (11554B); 37/37 pruebas sintéticas tras extraer aún PASS. Bloque **PowerShell completo entregado INLINE CHAT** (CP66), sin repetir tests; revalida manifest parcial V4, GPG descifra por pipes hacia TOC PostgreSQL17 sin guardar deliberadamente plaintext, suprime nombres privados. GPG agent/Pinentry/caché y swap posibles. `--batch` puede STOP si no permite desbloquear; no pedir contraseña en chat. **Salida Windows real PENDIENTE**, no afirmar certificado; ante STOP, investigar antes de repetir. [CP71](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_TOC_REAL_LOCAL_RUN_AUTHORIZED_20261121.md).

---

## REGLA SEC-07 — PREP GPG/TOC WINDOWS SINTÉTICO PASS CP70 (21/11/2026)

Evidencia PowerShell dueño: `BT_SEC07_TOC_PACKAGE: VERIFIED`, `REAL_TOC_TESTS: PASS_37_OF_37_SYNTHETIC`, `REAL_TOC_GPG/PG_RESTORE: NOT_CALLED_IN_TESTS`, `REAL_TOC_WINDOWS: NOT_CERTIFIED`, `TOC_WINDOWS: PASS_SYNTHETIC_ONLY`, `REAL_BACKUP: NOT_ACCESSED`, `GPG_KEYRING: NOT_ACCESSED`. Solo certifica tests ficticios en Windows, NO GPG/TOC real. CP67 copia 19/11 parcialmente declarada con hashes/sizes cotejados, no restaurabilidad. Próximo consentimiento específico para **GPG real + TOC solo lectura local, sin DB ni restore**, nunca heredar permiso de tests. PowerShell siempre completo en chat CP66. [CP70](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_TOC_PREP_V1_WINDOWS_SYNTHETIC_PASS_20261121.md).

---

## REGLA SEC-07 — INSPECTOR REAL GPG→TOC PREPARADO, SOLO SINTÉTICOS CP69 (21/11/2026)

Luego de CP68, el usuario pidió continuar. Se preparó paquete privado `BT_SEC07_R3_GPG_TOC_READER_PREP_V1_20261121.zip`, **11554 B**, SHA256 `dd6e5b7851039eefbc5d01c3245899fa9f13e689f402b645829984bebbc24a58`. **37/37 tests sintéticos PASS** antes/después ZIP, no GPG/PG reales. Diseño futuro revalida manifest V4, canaliza **binario** GPG stdout→`pg_restore --list -`, exige GPG exit0/GOODMDC o GOODAEAD y TOC reconocido, no guarda deliberadamente plaintext ni muestra nombres/SQL, pero acceso a keyring/agent GPG y paginación OS posibles. La única orden PowerShell entregada inline es de **preflight sintético**, sin leer backup ni llaves. **Permiso específico pendiente** para ejecutar en backup real. Restore/roles/ACL/SSL siguen pendientes. [CP69](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_REAL_GPG_TOC_READER_PREP_V1_20261121.md).

---

## REGLA SEC-07 — PREPARACIÓN GPG/TOC SINTÉTICA CP68 (21/11/2026)

El propietario autorizó SOLO preparar el modelo sintético GPG/TOC, sin tocar datos reales. CP67 sigue PASS interno ciphertext SHA/tamaño del respaldo **parcial**, no restore. CP55 auditor TOC sintético 40 PASS ya existente; CP68 añade simulador de estados GPG/TOC con **59/59 tests PASS antes/después ZIP**. Paquete privado `BT_SEC07_R3_GPG_TOC_SYNTHETIC_GATE_20261121.zip` 6475 bytes SHA256 `1c6dfc5111202d2c2f6d97c913a433acbf60ef1a4766dcd3a8d3fc3a59015adb`. No admite archivos/rutas/keys reales, no llama GPG/pg_restore/DB ni lee respaldos. Incidentes sintéticos INC-68A fixture TOC incongruente e INC-68B runner cwd corregidos. **Tres hitos** propuestos para respaldos nuevos verificables: GPG/TOC real aislado, restore aislado/roles ACL y cobertura integral, nueva exportación/automatización; autorización nueva por cada hito. PowerShell siempre inline chat. [CP68](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_TOC_SYNTHETIC_HANDOFF_20261121.md).

---

## REGLA SEC-07 — V4 WINDOWS PASS CIPHERTEXT, PARCIAL (CP67, 21/11/2026)

Resultado real de usuario V4: `PACKAGE_V4 VERIFIED`, `PASS_69_OF_69_SYNTHETIC`, `BACKUP_SELECTED:YES`, `SCOPE:PARTIAL_BACKUP_DECLARED`, `PROJECT:MATCHED_LOCAL_EXPORTER_REFERENCE`, `BACKUP_ID:MATCHES_FOLDER`, `CIPHERTEXT_SIZES:MATCH`, `CIPHERTEXT_SHA256:MATCH_MANIFEST_ONLY`, `MANIFEST_AUDIT:PASS_LOCAL_CIPHERTEXT_CONSISTENCY_ONLY`, `WINDOWS_V4:PASS_CIPHERTEXT_ONLY_NOT_RESTORE`. Integridad **interna ciphertext↔manifest** comprobada, no autenticidad independiente, descifrado ni restore. La marca `WINDOWS_COMPATIBILITY:SIMULATED_NOT_CERTIFIED` aplica a la simulación del test, no niega que el chequeo real haya corrido. Roles catálogo no son SQL roles; owners/ACL/grants y restauración aún PENDIENTES. No repetir V4 ni alterar archivos. Para GPG/TOC/restore/SSL se requieren nuevas autorizaciones. Mantener regla CP66: PowerShell SIEMPRE inline en chat. [CP67](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_V4_WINDOWS_CIPHERTEXT_PASS_20261121.md).

---

## REGLA PERMANENTE — POWERSHELL EN CHAT Y V4 LOCAL AUTORIZADA (CP66, 21/11/2026)

El titular exige TODOS los ejecutores PowerShell como bloques COMPLETOS EN EL CHAT, listos para copiar y pegar. Descarga .ps1 solo opcional y nunca sustituta. También autorizó ejecutar V4 en SU PC en solo lectura: ya recibió el bloque inline, con ZIP V4 SHA 9fea99fb10eab18e6ba2ee78b51ad78e54b82f407f8fe7d45d284bc237fbdd0f, prueba sintética 69 y selector del manifest 19/11. Aún sin resultado real Windows V4. No GPG/SQL/restore/SSL. [CP66](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_POWERSHELL_INLINE_RULE_V4_AUTHORIZED_20261121.md).

---

## REGLA SEC-07 — V4 PARCIAL PREPARADO OFFLINE CP65 (21/11/2026)

Autorización del propietario **solo PREPARAR** comprobador V4 para `full_project_backup=false` explícito, que verifique SHA/tamaños sin certificar integralidad. Nuevo ZIP `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V4_20261121.zip`, 8720 B, SHA `9fea99fb10eab18e6ba2ee78b51ad78e54b82f407f8fe7d45d284bc237fbdd0f`; lanzador `BT_SEC07_EJECUTAR_V4.ps1` 2361 B SHA `a69899bb3adb9c514d8eef0b9325ca3ed80bc53a0dd49db83933fe1c8148985e`. **69/69 pruebas sintéticas PASS antes y después ZIP, Windows V4 real PENDIENTE**; ausencia/tipo inválido de flag STOP. Un PASS solo `PASS_LOCAL_CIPHERTEXT_CONSISTENCY_ONLY` con `PARTIAL_BACKUP_DECLARED` cuando aplica, nunca recuperación íntegra. No tocar respaldo, manifest, GPG, SQL, SSL ni servicios. Pedir permiso NUEVO para ejecutar V4 sobre archivos reales. [CP65](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_PARTIAL_V4_OFFLINE_READY_20261121.md).

---

## REGLA SEC-07 — WINDOWS V3 STOP POR DECLARACIÓN INCOMPLETA (CP64, 21/11/2026)

Resultados reales del propietario: ZIP V3 VERIFIED, 53/53 tests sintéticos PASS en Windows, marcador `SIMULATED_NOT_CERTIFIED`, dos `BACKUP_SELECTED:NO`, `MANIFEST_AUDIT: STOP_INCOMPLETE_BACKUP_DECLARED` y `MANIFEST_WINDOWS_V3: STOP`. Código V3 revisado: lee y parsea `manifest.json`, verifica proyecto y backup_id, **exige `full_project_backup is True` antes de leer ciphertexts**. No hay SHA/tamaños comparados ni éxito de restore. `BACKUP_SELECTED:NO` se imprime antes del selector, no demuestra ausencia de selección. El STOP por declaración incompleta no prueba corrupción: nunca cambiar manifest a true para forzar PASS. Siguiente propuesta: nuevo comprobador offline que reporte PARTIAL_BACKUP_DECLARED y coteje SOLO tamaños/SHA sin certificar respaldo integral, con nuevo permiso de ejecución. No GPG/SQL/restore/SSL. [CP64](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_WINDOWS_V3_INCOMPLETE_DECLARATION_STOP_20261121.md).

---

## REGLA SEC-07 — HERRAMIENTAS V3 ENTREGADAS (CP63, 21/11/2026)

Propietario encontró respaldo más reciente **19/11** con `database.dump.gpg` (118.105 B), `roles.catalog.json.gpg` (675 B) y `manifest.json`; aún sin SHA ni restore certificado. Se entregaron ZIP V3 SHA `07316406274f1b2662e5a5978fb039b6751ab35cd58acb6227b466667308b484` (7334B) y ejecutor PowerShell V3 `BT_SEC07_EJECUTAR_V3.ps1` SHA `f10991a2600cb0ba6f1214ab3525a0c22e5b61af646700f3c8c7598179e6771c` (2195B), ambos **solo archivos de conversación, no código en GitHub**. Test ZIP 53/53 sintéticos Linux PASS, Windows real pendiente. Elegir manualmente manifest 19/11 tras preflight, compartir solo `BT_SEC07_*`. Roles catálogo ≠ SQL, recuperar roles/ACL pendiente. No GPG/SQL/restore/SSL. [CP63](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_WINDOWS_V3_LAUNCHER_DELIVERED_20261121.md).

---

## REGLA SEC-07 — TAMAÑOS PARCIALES GPG WINDOWS (CP62, 21/11/2026)

Nueva captura de carpeta con 2 ficheros / 0 carpetas: total **89.242 bytes** (87,1 KB); otra captura de un `.gpg` OpenPGP muestra **151 bytes** de tamaño lógico y «0 bytes en disco», **sin nombre visible en el recorte**. NO atribuir 151 bytes a roles ni database sin confirmar; otro archivo serían 89.091 bytes solo si corresponde a la misma carpeta. Tamaño 0 en disco ≠ contenido lógico cero. Sin `manifest.json` visible; V3 no puede certificar esta carpeta, sin generar manifest. Confirmar nombres/tamaños individuales por Propiedades, luego buscar respaldo más reciente; NO GPG/decrypt/SQL/restore/SSL. [CP62](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_SIZES_PARTIAL_20261121.md).

---

## REGLA SEC-07 — ARCHIVOS GPG VISIBLES, SIN MANIFEST (CP61, 21/11/2026)

Captura Windows confirma en carpeta de respaldo del 17/11 11:42 las entradas **`database.dump.gpg` y `roles.sql.gpg`** tras mostrar extensiones. No aparece `manifest.json` en la vista. Los **tamaños no se han observado** y la extensión no certifica cifrado ni restauración. Solicitar solo Tamaño en Propiedades de cada archivo; ningún descifrado, SQL, backup, cambio o creación de manifest. No suponer que el viejo error SQL0 implica estos archivos en particular. [CP61](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_EXTENSION_CONFIRMED_SIZES_PENDING_20261121.md).

---

## REGLA SEC-07 — CARPETA WINDOWS SIN MANIFEST VISIBLE (CP60, 21/11/2026)

El propietario mostró selector V3 con cero JSON visibles en carpeta `bytetorque-local-20261117T1441...`; en el Explorador solo aparecen `database.dump` y `roles.sql` (17/11 11:42), **no `manifest.json` visible**. La GUI solo ofrece filtros "Manifiesto JSON"/"JSON", no "Todos los archivos". Extensiones reales y tamaños **desconocidos**, pueden ocultarse `.gpg`. No afirmar backup corrupto ni completo ni que ya pasaron 53 tests en Windows. Paso siguiente **solo visual**: habilitar extensiones de archivo en Explorador, mostrar Tipo/Tamaño y observar si hay manifest en otro backup más reciente; no ejecutar/crear/modificar ni descifrar archivos ni repetir verificador. [CP60](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_NOT_VISIBLE_WINDOWS_20261121.md).

---

## REGLA SEC-07 — PAQUETE MANIFEST WINDOWS V3 GENERADO (CP59, 21/11/2026)

Tras CP58, V2 original no recuperable como bytes verificables; **V3 NUEVO, no renombrar como V2**: ZIP `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V3_20261121.zip`, 7334 bytes, SHA256 `07316406274f1b2662e5a5978fb039b6751ab35cd58acb6227b466667308b484`, 53/53 tests sintéticos Linux PASS antes/después ZIP; Windows real **PENDIENTE**. V3 lee solo manifest manual + `.gpg` whitelisted para cotejo SHA/tamaño; no descifrar, red, SQL, backup, GPG ni restaurar. Solo si SHA y tests PASS abrir selector; STOP sin reintento; compartir solo `BT_SEC07_*`. El antiguo V1 permanece obsoleto, roles/ACL y SSL pendientes. [CP59](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_WINDOWS_V3_PACKAGE_20261121.md).

---

## REGLA SEC-07 — TRASPASO DE CHAT CP58 (20/11/2026)

Se confirmó `main` en CP57 (`1be3b7f`) y la continuidad: V2 ZIP SHA `950651ceed451e4156847e3af8b02cdb888f3856a479467e3905cb6ddcab92fe` aún **sin ejecutar en Windows real**; V1 obsoleto, no selector, no backup abierto. Siguiente: propietario valida SHA ZIP V2 en Downloads, corre 53 tests sintéticos y, solo tras PASS, elige `manifest.json` para cotejo local de ciphertext sin descifrar. `STOP` implica detenerse. GitHub reportó repositorio `public` en este traspaso: **no se cambió visibilidad** y requiere decisión del propietario. Sin SQL/GPG/restore/SSL/deploy. [CP58](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CHAT_CONTINUITY_V2_WINDOWS_PENDING_20261120.md).

---

## REGLA SEC-07 — INC-57 WINDOWS PREFLIGHT FALSO STOP Y V2 CORREGIDA (CP57, 20/11/2026)

**Windows REAL del propietario:** V1 paquete SHA verificado, `48 tests`, `FAILED (failures=15, errors=5, skipped=2)`, `BT_SEC07_MANIFEST_TESTS: STOP`; **NO SE ABRIÓ SELECTOR**, no se leyó respaldo real ni se hizo GPG. Causa de criterio: V1 comparaba `Path.lstat` con `os.fstat` como si expusieran iguales inode/ctime en Windows y bloqueó archivos sintéticos válidos. **NO significa daño al backup**. ZIP V1 `BT_SEC07_R3_MANIFEST_READONLY_20261120.zip` OBSOLETO; **V2** `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V2_20261120.zip`, SHA256 `950651ceed451e4156847e3af8b02cdb888f3856a479467e3905cb6ddcab92fe`, 10777 B, 53/53 tests sintéticos PASS y 53/53 tras extracción, regresiones específicas Windows **simuladas**, Windows real V2 pendiente. V2 separa chequeo de descriptor Windows (tipo+tamaño) de snapshots de ruta pre/post (mtime/ctime/inode/dev/tamaño), sin bajar reglas del cotejo SHA. Nuevo runner de tests no imprime trazas de rutas. Seleccionar `manifest.json` manualmente **solo tras PASS**; no reintentos sin investigar STOP. Ningún GPG/DB/backup/restore autorizado. [CP57](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_WINDOWS_V2_REGRESSION_FIX_20261120.md).

---

## REGLA SEC-07 CP56 — VERIFICADOR SHA/MANIFIESTO LOCAL PREPARADO, SIN ABRIR BACKUPS REALES (20/11/2026)

Usuario autorizó PREPARAR comprobación local de solo lectura del respaldo cifrado y `manifest.json`; el asistente **NO abrió respaldo real**, ni leyó GPG, ni conectó Supabase. Código original `bytetorque_respaldo_local.py` de Library leído solo para confirmar esquema: `project_ref`, `backup_id`, `files=[{name,bytes,sha256}]`, `restoration_verified`, `full_project_backup`. ZIP privado `BT_SEC07_R3_MANIFEST_READONLY_20261120.zip`, **8751 bytes SHA256 `d052e3fdc05e8896bbf1f6b8c6bf48c27b2fffb5b7d51432f8077927278ac4a8`**, 48/48 NUEVAS pruebas offline PASS y 48/48 tras extraer ZIP. Script de PC selecciona `manifest.json` manualmente, valida referencia de proyecto y carpeta `backup_id`, lee SOLO .gpg listados en esa carpeta y SHA-256, sin subprocess/red/GPG/SQL/escrituras, sin imprimir nombres/rutas/huellas. `PASS_LOCAL_CONSISTENCY_ONLY` **NO** certifica autenticidad del manifiesto independiente, OpenPGP, roles SQL ni restore/owners/ACL. `roles.catalog.json.gpg` = metadatos; `roles.sql.gpg` viejo sigue inválido. Stop sin reintentar ni editar originales. Ejecución en Windows/backup real aún PENDIENTE. [CP56](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_MANIFEST_READONLY_PREP_20261120.md).

---

## REGLA SEC-07 R3: TOC AUDITOR OFFLINE PREPARADO, SIN LEER BACKUPS (20/11/2026, CP55)

El usuario AUTORIZÓ solo preparación de auditor TOC **OFFLINE con fixtures sintéticos**; no autorizó descifrar `database.dump.gpg`, usar GPG/keyring histórico, `pg_restore` real, conexión Supabase, restauración ni SSL. ZIP privado `BT_SEC07_R3_TOC_OFFLINE_AUDIT_20261120.zip`, SHA256 `fa0c7606fb80523d9de455719693947284c123de482e71d05ac89465ad859566`, 7074 B, `audit_synthetic_toc(bytes)` sin lectura de rutas, subprocesos, red ni GPG. **40/40 tests nuevos PASS, también tras extracción del ZIP** y smoke `PASS_OFFLINE_ONLY`. Incidentes offline 55A encabezado `Dump Version: 1.16-0` rechazado por regex y 55B fixture con comentario deshabilitado contado erróneamente: corregidos y suite íntegra PASS; sin efectos externos. `ACL`/`DEFAULT ACL` en TOC son **indicadores de entrada**, NO propietarios/grants/ACL restaurados; R2 `--no-owner --no-acl`, permisos NO CERTIFICADOS. CP54 catálogo 31 reservados/0 adicionales, roles.sql.gpg previo SQL0 INVÁLIDO; SSL OFF, end-to-end NOT_CERTIFIED. **Requiere permiso NUEVO para inspeccionar TOC del snapshot real y otro distinto para GPG histórico/restore**. [CP55](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_TOC_OFFLINE_AUDITOR_READY_20261120.md).

---

## REGLA SEC-07 R3: INVENTARIO ROLES RECONCILIADO, INC-53 CERRADO (20/11/2026, CP54)

Con autorización expresa para **UNA** segunda SELECT agregada correctiva en `pg_catalog.pg_roles`, Supabase proyecto ByteTorque devolvió **31 total, 31 reservados según CLI v3.0.0 y prefijo literal `pg_`, 0 candidatos personalizados, 0 falsos positivos del anterior `LIKE 'pg_%'`**. **INC-53 WILDCARD CERRADO**: se comprobó que en este origen no cambió los números, aunque el filtro previo era defectuoso. **No se retornaron nombres, claves, datos de clientes ni se hizo escritura.** La autorización de esta SELECT ya se consumió. **Cero roles propios NO certifica owners, ACL, grants, membresías ni recuperación de roles administrados**; viejo `roles.sql.gpg` SQL0 con productor exit1 permanece INVÁLIDO. Siguiente: evaluar inventario/TOC de snapshot cifrado existente y diseño respaldo ACL bajo consentimiento NUEVO, sin GPG histórico ni producción por inercia. SSL enforcement OFF visual CP48, TLS cliente PASS CP46/backend SSL NO, no end-to-end. [CP54](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_ROLE_CATALOG_CORRECTED_WINDOWSLESS_PASS_20261120.md).

---

## REGLA SEC-07 CP53: R3 INVENTARIO 31/31/0 PROVISIONAL, WILDCARD SQL
Se ejecutó una única SELECT agregada autorizada contra pg_catalog.pg_roles del proyecto biomotors-taller: total 31, clasificados reservados 31, candidatos 0 según filtro. INC-53: LIKE 'pg_%' usa _ como comodín y sobreexcluye nombres que empiezan pgX. No certificar cero roles personalizados; filtro correcto starts_with(rolname::text, 'pg_') requiere nueva consulta y nueva autorización. No se devolvieron nombres ni datos de clientes; ningún dump, GPG, SQL de escritura o cambio SSL. Owners/ACL siguen pendientes. [CP53](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_ROLE_CATALOG_AGGREGATE_PROVISIONAL_20261120.md).
## REGLA PERMANENTE — SEC-07 R3: ADAPTADOR CLI V3 OFFLINE PREPARADO; NO AUTORIZADO EXPORT REAL (20/11/2026, CP52)

Usuario autorizó **solo PREPARAR R3** para futura exportación cifrada de roles reales: **NO conectar a Supabase ni exportar/generar respaldo**. Revisados contrato R3 y fuente oficial `supabase/cli@v3.0.0`: `--role-only` usa `pg_dumpall --no-role-passwords` con filtro de roles reservados y emite `RESET ALL;`; **exit=0/bytes>0 no certifican roles útiles**, `--file` deja SQL claro y linked/ref sin contraseña puede crear login-role temporal. Se preparó ZIP PRIVADO `BT_SEC07_R3_CLI_V3_OFFLINE_ADAPTER_20261120.zip` SHA256 `a30de4ba1f619de2654da206e9804cb753fac386c7ad2ac3ef85b8e49cc51596`, 5513 bytes, **27/27 pruebas NUEVAS offline PASS y 27/27 tras ZIP**; código no importa network, subprocess ni GPG, **no puede conectarse a DB**, analiza fixtures inventadas y retorna solo categorías/contadores. **NO ES UN EXPORTADOR REAL NI PARSER SQL COMPLETO**, no usar con datos de origen. El viejo `roles.sql.gpg` de 0 bytes sigue inválido y error de productor sin causa; inventario de roles no reservados DESCONOCIDO, owners/ACL pendientes. CP46 TLS cliente PASS pero backend SSL NO, CP48 enforcement OFF; no afirmar end-to-end TLS. **Permiso independiente para SELECT agregado, export real, GPG histórico y restore; ningún cambio SSL**. No repetir suites anteriores 18/14/15 ni R2. [CP52](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CLI_V3_OFFLINE_ADAPTER_READY_20261120.md).

---

## REGLA SEC-07: EDGE FUNCTIONS REALMENTE DESPLEGADAS VS CÓDIGO CANDIDATO (20/11/2026, CP51)

Con permiso read-only expreso se consultó Supabase `biomotors-taller`: **exactamente UNA Edge Function activa `bt-owner-onboarding`, versión 2, `verify_jwt=true`; código desplegado `index.ts` 5785 caracteres idéntico literalmente a `main`**. Usa `fetch` hacia APIs HTTPS de Supabase (`/auth/v1/user` y `/rest/v1/rpc/bootstrap_workshop_owner`), sin driver PG directo observado. Usa flag runtime `BYTETORQUE_ONBOARDING_ENABLED` y nombre de variable service-role; **NO se examinaron valores secretos ni se invocó la función**. Cuatro funciones en repo/config (`bt-mechanic-invites`, `bt-mechanic-accept`, `bt-mechanic-revoke`, `bt-invite-worker`) están **SIN DESPLEGAR** en este proyecto; no inventar que están activas ni desplegarlas. Esto aporta compatibilidad estática para TLS obligatorio pero NO certifica actividad, seguridad RPC, valores runtime ni cifrado backend. SSL enforcement OFF UI CP48, PC→pooler TLS PASS CP46, backend SSL NO/end-to-end NO certificado. No activar SSL antes de compatibilidad completa, backups roles/owners/ACL y autorización específica por reinicio BD. [CP51](docs/checkpoints/CHECKPOINT_BT_SEC07_EDGE_FUNCTIONS_DEPLOYED_READONLY_AUDIT_20261120.md).

---

## REGLA SEC-07: RENDER ES SITIO ESTÁTICO, NO BACKEND POSTGRES; VERIFICAR EXTERNOS (20/11/2026, CP50)

Con permiso explícito del propietario para leer `My Workspace`, Render `list_services` encontró 18 servicios: solo **`biomotors-taller-demo`** vinculado a repo ByteTorque, tipo **`static_site`**, `main`, build `npm install --no-audit --no-fund && npm run build`, publish `dist`, autoDeploy sí; despliegue más reciente **LIVE**. `list_postgres_instances` devolvió **0** instancias PG del workspace. Por tanto **no hay servidor backend Node/PG ni PostgreSQL Render en la topología observada ByteTorque**, frontend usa `supabase-js` HTTPS del navegador. Sin embargo Render no expone por conector los valores/nombres de env variables y el uso efectivo de Edge Functions/clientes externos/Android NO se certificó. No afirmar compatibilidad completa de todos los consumidores ni iniciar otros servicios. SSL enforcement OFF por screenshot CP48, PC→pooler TLS verify-full PASS CP46, backend SSL NO, end-to-end NOT_CERTIFIED; no activar ON sin continuidad roles/ACL y permiso específico que reconoce reinicio DB. [CP50](docs/checkpoints/CHECKPOINT_BT_SEC07_RENDER_RUNTIME_READONLY_AUDIT_20261120.md).

---

## REGLA PERMANENTE — SEC-07: AUDITORÍA ESTÁTICA SSL NO CERTIFICA RUNTIME (20/11/2026; CP49)

Tras captura `SSL enforcement OFF` (CP48), se hizo auditoría ESTÁTICA sobre código actual `main`: `src/auth/supabaseGateway.ts` usa `@supabase/supabase-js` contra API HTTPS, Edge Function entrypoints revisadas usan `SUPABASE_URL/fetch`, adaptadores `rpc/storage` cliente Supabase; scripts de backup PG17 `scripts/backup/postgres_config.py`, `cloud_backup.py`, `postgres_preflight.py` exigen `verify-full`; GH `bt-encrypted-backup.yml` y `bt-readonly-pooler-diagnostic.yml` son **workflow_dispatch** manuales. **NO** afirmar compatibilidad comprobada de Render en ejecución, Edge Functions desplegadas, Android o integraciones externas; conector Render requiere `workspaceId` confirmado por usuario, no elegir por inferencia. No activar SSL enforcement sin plan de consumidores, respaldo/continuidad, ventana/rollback y consentimiento explícito por reinicio DB. El backup de roles/ACL sigue pendiente. [CP49](docs/checkpoints/CHECKPOINT_BT_SEC07_SSL_COMPATIBILITY_STATIC_AUDIT_20261120.md).

---

## REGLA SEC-07: SSL ENFORCEMENT OFF OBSERVADO VISUALMENTE, NO ACTIVAR SIN APROBACIÓN (20/11/2026, CP48)

Propietario compartió captura de **Supabase SSL configuration**: interruptor **Enforce SSL on incoming connections** visible **OFF** (gris, botón izquierda). **`BT_SEC07_SSL_ENFORCEMENT_UI: OBSERVED_OFF` — observación manual de imagen, NO lectura de Management API.** Esto significa que el proyecto no exige SSL para todas las conexiones Postgres; **no** significa que todos los clientes sean plaintext. CP46 había confirmado PC→pooler TLS `verify-full` PASS y `DB_BACKEND_SSL: REPORTED_NO` para una sesión, `END_TO_END_TLS: NOT_CERTIFIED`. Sin obligatoriedad SSL se explica posible ruta sin SSL; hallazgo upstream abierto hasta plan y verificación de cambios. **Cambiar el interruptor a ON provoca reinicio BD según Supabase** y no fue autorizado. No modificar; preparar inventario de clientes y compatibilidad TLS, pruebas no productivas, protección de backups roles/owner/ACL, ventana de operación/rollback y solicitar **consentimiento nuevo** para tocarlo. [Checkpoint 48](docs/checkpoints/CHECKPOINT_BT_SEC07_SSL_ENFORCEMENT_OFF_UI_OBSERVED_20261120.md).

---

## REGLA SEC-07: NO INVENTAR ESTADO SSL ENFORCEMENT (20/11/2026, CP47)

Usuario autorizó CONSULTA SOLO LECTURA del estado de SSL enforcement. App Supabase conectada `list_projects/get_project` confirmó `biomotors-taller` `ACTIVE_HEALTHY`, PostgreSQL17, pero **NO contiene el valor de SSL enforcement y no expone el GET Management API de ese ajuste**. **ESTADO ACTUAL: UNKNOWN_NOT_OBSERVED**. Documentación oficial: verlo en **Dashboard → Database Settings → SSL Configuration → Enforce SSL on incoming connections** (sin tocar) o GET autenticado `/v1/projects/{ref}/ssl-enforcement`; no pedir PAT por chat. Cambiar enforcement reinicia BD; requiere autorización explícita. CP46 TLS cliente a pooler PASS; backend `pg_stat_ssl=NO` y END_TO_END NOT_CERTIFIED, no inferir ON/OFF. No conexión SQL, roles, GPG, backup, modificación. [CP47](docs/checkpoints/CHECKPOINT_BT_SEC07_SSL_ENFORCEMENT_READONLY_LIMIT_20261120.md).

---

## REGLA PERMANENTE — SEC-07: TLS DEL CLIENTE PASS, BACKEND SSL REPORTADO NO, NO DECLARAR END-TO-END (20/11/2026; CP46)

**Evidencia Windows V2 real:** `BT_SEC07_RO_V2_ZIP: VERIFIED`, `BT_SEC07_REMOTE: CONNECTED_CLIENT_TLS_VERIFY_FULL`, `BT_SEC07_CLIENT_POOLER_TLS: CONFIRMED_BY_LIBPQ`, `BT_SEC07_TRANSACTION_READ_ONLY: ON`, `BT_SEC07_SERVER_MAJOR: 17`, `BT_SEC07_QUERY: STATIC_SELECT_ONLY`, `BT_SEC07_PRECHECK: PASS_SINGLE_READONLY_CONNECTION`, `BT_SEC07_RO_V2_WINDOWS: PASS_CLIENT_TLS_ONLY`. **Separadamente:** `BT_SEC07_DB_BACKEND_SSL: REPORTED_NO`, `BT_SEC07_END_TO_END_TLS: NOT_CERTIFIED`. No inventar cifrado del tramo pooler→Postgres ni afirmar que todo el proyecto carezca de SSL enforcement sin consultar su configuración. El estado del proyecto NO ha sido consultado. **INC-44 del criterio V1 CERRADO**, V2 no repetir. Hallazgo `SSL-UPSTREAM-OBSERVATION-46` abierto, siguiente puerta propuesta: confirmar configuración SSL enforcement **solo lectura con autorización nueva**; cambiarla provoca reinicio según documentación oficial de Supabase y requiere aprobación específica. No nuevos psql ni dump roles/GPG/restore con el permiso ya consumido. [Checkpoint 46](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CLIENT_TLS_V2_WINDOWS_PASS_BACKEND_SSL_PENDING_20261120.md).

---

## REGLA SEC-07: SEGUNDO ACCESO TLS V2 AUTORIZADO SOLO UNA VEZ (20/11/2026; CP45)

Tras INC-44, usuario respondió `autorizo` **solo a UN segundo intento** de conexión psql read-only con el ZIP V2 privado `BT_SEC07_R3_READONLY_CONN_V2_20261120.zip` SHA256 `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b`. Revalidada integridad SHA y fuente ZIP en el entorno asistente; **Windows V2 aún no ejecutado**. Verificación libpq `\\conninfo` mismo proceso, `PGSSLMODE=verify-full`, `PGGSSENCMODE=disable`, `BEGIN READ ONLY`, SELECT metadata; `pg_stat_ssl` backend reportar por separado, **END_TO_END_TLS NOT_CERTIFIED**. Credencial solo en PC, no conectar/exportar/volver a intentar ante STOP; no modificar Supabase/SSL enforcement. Nueva autorización para cualquier export de roles, GPG histórico o restablecimiento. [CP45](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_TLS_CLIENT_V2_AUTHORIZED_20261120.md).

---

## REGLA PERMANENTE — SEC-07: TLS DE CLIENTE NO SE DETERMINA CON `pg_stat_ssl` DE BACKEND POOLER (20/11/2026; INC-44)

**Windows real V1:** `RO_ZIP: VERIFIED`, script original SAFE_STATIC_MATCH, CA PUBLIC_PEM_LOADABLE, `SSL_POLICY: VERIFY_FULL_AND_READ_ONLY_ENFORCED`, destino pooler5432, contraseña local, `PRECHECK_STOP: SESSION_TLS_NOT_CONFIRMED`, `ROLES_BACKUP: NOT_ATTEMPTED`. Fuente ZIP exacta confirma que el SELECT PostgreSQL **se ejecutó**, psql exit 0, database/role congruentes, `transaction_read_only=on`, versión PG17; **`pg_stat_ssl` del backend fue NO**. **No concluir que el cliente no usó TLS**: pooler tiene dos tramos (PC->pooler, pooler->DB), y `pg_stat_ssl` refleja el último. **Tampoco declarar upstream TLS seguro**; revisar SSL enforcement de Supabase por separado antes de cambiar nada (activar podría reiniciar DB). INC-44 fallo del criterio V1 CONFIRMADO, NO fallo demostrado del backup/clave/password. ZIP V1 OBSOLETO. V2 privado `BT_SEC07_R3_READONLY_CONN_V2_20261120.zip` SHA256 `baa30182d30470c8ff31dc5d6a175c4ad357e832cc6279ec5c78cfc173a5534b`, 10542 B: `psql --command SQL --command \\conninfo` en UN proceso, TLS cliente `verify-full`, `PGGSSENCMODE=disable`, stderr/stdout ocultos, backend SSL reportado aparte, nunca `END_TO_END_TLS` certificado. **35/35 tests nuevos+regresión PASS offline y 35 tras ZIP**, Windows V2 NO ejecutado. **La primera conexión consentida ya ocurrió; solicitar NUEVA autorización expresa antes de un segundo acceso.** Prohibido roles dump, GPG histórico, restore, TLS enforcement cambios sin permiso propio. [Checkpoint 44](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_TLS_BACKEND_FALSE_FIX_PREP_20261120.md).

---

## REGLA PERMANENTE — SEC-07: PRIMER CONTACTO AL ORIGEN SIN INVOCAR EXPORTADOR (20/11/2026; CP43)

Usuario autorizó **una** conexión real de verificación estrictamente **read-only**, SIN generar backups ni modificar DB. Para evitar creación de roles temporales de la CLI v3.0.0 en modo linked/ref, usar cliente `psql` PG17 directo sobre el pooler de sesión previamente documentado, con CA público `verify-full` y contraseña solicitada ocultamente **solo en PC** (entorno efímero `PGPASSWORD` de proceso hijo, sin .pgpass ni argumentos secretos). El lector propuesto **nunca ejecuta** `bytetorque_respaldo_local.py`; solo `ast.parse` de constantes estáticas, bloquea otro host/puerto/db/user. SQL fijo `BEGIN TRANSACTION READ ONLY; SELECT` metadata, `PGOPTIONS=default_transaction_read_only=on` y controles de SSL/versión, sin impresión de resultados confidenciales. Se preparó ZIP privado `BT_SEC07_R3_READONLY_CONN_20261120.zip` SHA `ea7a7d53208b63481c8cb69462ed152ee4fb0c69b08af8528cac59947c5f7f35`, **24/24 tests offline PASS**; Windows REAL todavía **NO** ejecutado. **No confundir test local PASS con conexión real.** Ante STOP no imprimir stderr ni alterar rutas, passwords, roles o certificados. La autorización no permite `pg_dumpall`, GPG histórico, nuevas copias, restore ni DDL. [CP43](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_READONLY_CONNECTION_PREP_20261120.md).

---

## REGLA PERMANENTE — SEC-07: PREFLIGHT WINDOWS OFFLINE ≠ SERVIDOR/CERTIFICADO VALIDADO (20/11/2026, CP42)

Los indicadores Windows del propietario `PG17_CLIENTS: ALL_PRESENT`, `NODE/NPX: FOUND`, `SYNTHETIC_DB_URL_NO_PASSWORD: PASS` y `TLS_CERT_LIKE_FILES: ONE_UNVALIDATED_CANDIDATE` **solo cierran el inventario local**. No prueban la identidad del destino remoto, el uso efectivo de TLS `verify-full`, el contenido del archivo CA, permisos `PGPASSFILE`, ni capacidad de exportar roles. Conservar `SESSION_POOLER_5432: HISTORICAL_POLICY_ONLY_NOT_CHECKED`, `TLS_VERIFY_FULL: REQUIRED_FOR_FUTURE_NOT_TESTED`, `TEMP_PGPASS_STRATEGY: DESIGNED_NOT_CREATED`, `CLI_V3_REMOTE_DB_URL: SOURCE_REVIEWED_NOT_EXECUTED`, `SUPABASE_REMOTE: NOT_CONNECTED`, `ROLES_BACKUP: NOT_ATTEMPTED`. **No ejecutar conexión remota con la autorización actual, ni introducir credenciales/URL en chat**. Próximo grupo seguro: validación local offline del candidato CA y contrato de identidad del servidor/credenciales sin publicarlas; requiere permiso distinto al avanzar a remoto. [Checkpoint 42](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_WINDOWS_PASS_20261120.md).

---

## REGLA PERMANENTE — SEC-07: PREFLIGHT LOCAL DE CONEXIÓN Y DUMP REMOTO SIN CREAR LOGIN-ROLE (20/11/2026; BT-SEC07-R3-CONN-OFFLINE-PREP-41)

El usuario autorizó **exclusivamente preparación y comprobación LOCAL del método de conexión**: sin conectarse a Supabase, generar respaldos, descifrar ni exportar roles. Verificación fuente oficial Supabase CLI v3.0.0 confirma `--remote=<postgresql://...>` selecciona ruta `DbUrl` distinta del modo `linked/ref` que puede crear roles temporales sin contraseña. **URL sin password en argv**; secreto protegido por método efímero evaluado aparte, TLS `verify-full` con CA autorizado, stdout binario de roles a GPG solo tras autorización y validación; `--remote=service=...` no es valor admitido. No copiar host/ref/contraseña ni TLS paths en chat. Se preparó ZIP `BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_20261120.zip` SHA256 `37ef628d973b65a999e5be4b516ccc28c34aa311ef7600396173b0ad90e87edc` de **inspección de metadatos locales**: PG17 binarios en ruta estándar, Node/NPX, recuento de ficheros `.crt/.pem/.cer` en solo `BT-Secrets` (máximo un nivel, sin leer contenidos), y URL ficticia sin contraseña; ninguna red, archivo secreto ni backup. **18/18 pruebas nuevas PASS en asistente y tras extraer ZIP**, Windows pendiente. No repetir suites históricas 18/14/15 ni restauración R2, no crear config real hasta permiso nuevo. [Checkpoint 41](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_CONNECTION_OFFLINE_PREFLIGHT_PREP_20261120.md).

---

## REGLA PERMANENTE — SEC-07: DIFERENCIAR HOME GPG PREDETERMINADO DE HOME AISLADO HISTÓRICO (20/11/2026; BT-SEC07-R3-RECIPIENT-V2-WINDOWS-PASS-40)

**La V2 de metadatos OpenPGP funcionó sobre el respaldo real en Windows:** `RECIPIENT_COUNT: 1`, `PUBLIC_MATCH: ALL_VISIBLE_MATCH`, `SECRET_MATCH: NO_VISIBLE_MATCH` (en home predeterminado), `RECOVERABILITY: NOT_PROVEN`, `COMPLETE_NO_DB_NO_DECRYPT_NO_WRITE`, ZIP SHA VERIFIED y exit 0. **Ya hay evidencia previa verificada en SEC-07 sobre la custodia privada:** checkpoint `docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md` registra diagnóstico Windows `GPG_HOME_MODE: CUSTOM`, `SECRET_KEY_RECORDS: FOUND`, `SECRET_RECIPIENT: MATCH` en `GNUPGHOME` histórico AISLADO. R2 sobre respaldo actual posteriormente mostró `PARITY_GPG_PROCESS: OK` y restore exitoso `SNAPSHOT_STRUCTURE_ONLY`. **No declarar perdida la clave, ni repetir la búsqueda que ya terminó**, ni generar otra clave/reexportar DB por defecto. Metadata V2 no valida por sí sola descifrado, pero las pruebas anteriores documentadas sí acreditan recuperación estructural limitada; NO roles/ACL/Auth/Storage/Edge. INC-39 parser V1 longitudes parciales **CERRADO operativamente**. Próxima prioridad SEC-07 son roles reales/restauración permisos, con autorizaciones específicas nuevas para remoto y uso GPG. [Checkpoint 40](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_V2_WINDOWS_PASS_HISTORICAL_KEYRING_20261120.md).

---

## REGLA PERMANENTE — SEC-07: OPENPGP LONGITUDES PARCIALES Y LIMITACIONES DEL LAB (20/11/2026; BT-SEC07-R3-RECIPIENT-PARTIAL-FIX-PREP-39)

**Incidente real de lector, NO del backup:** usuario confirmó ZIP v1 SHA OK, archivo principal seleccionado, `RECIPIENT_STOP_CLASS: PARTIAL_PACKET_UNSUPPORTED` y `META_WINDOWS: STOP`. Fuente RFC9580 valida longitudes parciales en paquetes de datos cifrados; parser v1 carecía de ese caso y sus 13/13 tests no lo cubrían. **No afirmar corrupción o pérdida de keyring**. Se preparó ZIP privado `BT_SEC07_R3_RECIPIENT_METADATA_V2_20261120.zip` SHA256 `eed81875dfca9f70929983a82b3490c62ff15f170d2a89ea410967033eb82842`, añade solo soporte de **cabecera** de tag 9/18/20 con longitud parcial tras PKESK, fallando cerrado en PKESK parcial/sin destinatario/truncado; no recorre ni autentica cuerpo ni descifra. **19/19 pruebas y GPG streaming real efímero PASS en entorno asistente, Windows V2 aún PENDIENTE**. No copiar V1 ni reabrir 18/14/15 tests antiguos. Coincidencia Key ID 64bits **no es prueba de recuperabilidad**. [Checkpoint 39 + PS + traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_PARTIAL_PACKET_FIX_PREP_20261120.md).

---

## REGLA PERMANENTE — SEC-07: COMPARACIÓN PKESK METADATOS ≠ RECUPERACIÓN (20/11/2026; BT-SEC07-R3-RECIPIENT-META-PREP-38)

Propietario autorizó **solo comparar metadatos de destinatario de UN respaldo cifrado existente con llaves GPG locales**, sin descifrar ni modificar archivos, sin conexión a DB. Se preparó parser PRIVADO Python estándar para leer exclusivamente cabecera PKESK OpenPGP v3 (tag1) y comparar identificadores de 64 bits contra claves públicas/subclaves y privadas/subclaves listadas con GPG, **sin imprimir rutas/UID/key IDs/fingerprints/SQL**. No usar `gpg --list-packets` indiscriminadamente ni asumir que descifrar es parte de este permiso. **Coincidencia por Key ID no es prueba criptográfica de recuperación**, tampoco que esa pública corresponda al backup; si destinatario oculto u otro formato, resultado indeterminado/no soportado. En el GPG home actual se observaron 1 pública y 0 privadas: no concluir pérdida global. ZIP privado, solo chat/PC, nuevas pruebas parser 13/13 PASS más GPG efímero real PASS en asistente; **Windows aún PENDIENTE**. [Checkpoint 38 + comando + traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_METADATA_PREP_20261120.md).

---

## REGLA PERMANENTE — SEC-07: 0 CLAVES SECRETAS LISTADAS NO ES PÉRDIDA DEFINITIVA, NO CIFRAR A CIEGAS (20/11/2026; BT-SEC07-R3-GPG-INVENTORY-PASS-37)

En PowerShell 5 del propietario se ejecutaron **sin error** listados GPG del homedir resuelto con `gpgconf`: `GPG_HOME: PRESENT`, `PUBLIC_KEYS_COUNT: 1`, `SECRET_KEYS_COUNT: 0`, `GPG_DIAG: PASS_NO_DB_ACCESS_NO_SECRETS_PRINTED`. Acredita **solo el almacén seleccionado**, no todos los homedirs ni presencia del secreto histórico en otro equipo/medio. **No usar la clave pública para una nueva copia de datos reales sin acreditar un mecanismo de descifrado/recuperación accesible**; no inferir pérdida definitiva de clave. El anterior error de listado INC-36 quedó resuelto operativamente con nueva instrumentación, pero NO se demostró su causa exacta (hipótesis stderr/PowerShell 5.1). El incidente `$HOME` INC-35 está cerrado. Autorización de usuario se limitó a inventario local ya finalizado: nueva autorización para consultar metadatos del ciphertext histórico, usar claves reales, DB remota, dump o restore. [Checkpoint 37](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_INVENTORY_PASS_ZERO_SECRET_20261120.md).

---

## REGLA PERMANENTE — SEC-07: VARIABLES AUTOMÁTICAS POWERSHELL Y EVIDENCIA DE INVENTARIO (20/11/2026; BT-SEC07-LOCAL-INV-HOME-RO-35)

**INC real del script de inventario local:** el bloque anterior asignó `$home = $null`; PowerShell trata `$home` como la variable automática **`$HOME` de solo lectura** (identificadores insensibles a mayúsculas), por lo que la comprobación abortó inmediatamente después de `GPG_COMMAND: FOUND`, antes de listar claves. **No es error probado de GPG ni de Supabase.** No volver a ejecutar ni copiar el script de checkpoint 34; usar la corrección de [checkpoint 35](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_LOCAL_INVENTORY_HOME_COLLISION_INC_20261120.md) que usa `$gpgHomePath`, consulta opcional `gpgconf` y muestra solo estados/conteos. `PG* NOT_SET` y archivos defaults `ABSENT` solamente describen esa sesión/rutas, **NO** pérdida de credenciales ni incapacidad de recuperar snapshot. Ninguna exportación, descifrado, conexión DB o modificación de backup está autorizada. Mantener script con marcador de etapa y falla cerrada sin publicar excepciones, secretos, rutas o fingerprint.

---

## REGLA PERMANENTE — SEC-07: SALIDA `RESET ALL` NO CERTIFICA ROLES Y CUIDADO CON PROVISIÓN AUTOMÁTICA (20/11/2026; BT-SEC07-R3-COMBINED-WINDOWS-PASS-33)

Según **fuente oficial etiquetada Supabase CLI v3.0.0**, `db dump --role-only` ejecuta `pg_dumpall --roles-only --no-role-passwords`, filtra roles reservados y añade `RESET ALL;`: archivo SQL no vacío, exit 0 y GPG verificado **no son suficientes** para afirmar que se recuperaron roles propios del proyecto. Comparar con inventario agregado esperado y valorar por separado propietarios, GRANT/REVOKE/ACL y privilegios por defecto; recordar que las contraseñas de roles no se exportan. En ruta linked/project-ref sin contraseña, el resolvedor de credenciales puede llamar a `createLoginRole({read_only:false})` en la plataforma; no declarar exportación remota de solo lectura sin comprobar y aprobar el método de conexión. El camino `--remote=<db-url>` sin contraseña en argv con `PGPASSFILE` es **alternativa candidata, NO validada en ByteTorque**. Sin nueva autorización específica, NO usar keyring histórico, conectarse a Supabase, exportar ni restaurar. Mantener todas las suites Windows 18/14/15 PASS sin repetir. [Checkpoint 33](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_COMBINED_WINDOWS_PASS_AND_REAL_EXPORT_GATE_20261120.md) y [contrato R3](docs/BT_SEC07_R3_CONTRATO_EXPORTACION_REAL_ROLES_20261120.md).

---

## REGLA PERMANENTE — SEC-07: SALIDA BINARIA DE CLI V3 Y NO SQL LEGIBLE EN DISCO (20/11/2026; BT-SEC07-R3-GPG-WINDOWS-PASS-31)

El source **oficial etiquetado v3.0.0** (`apps/cli/src/commands/db/dump/dump.command.ts` / `dump.handler.ts`) muestra que `db dump --role-only` transmite SQL por stdout si no se usa `--file`; esa opción crea/trunca archivo SQL plano (modo 0644) y no debe proponerse para roles reales del proyecto sin plan explícito de custodia. **No usar redirección/pipeline textual de PowerShell** para cifrado. Preferir wrapper binario probado con exit y contenido válido del productor ANTES de validar el ciphertext final; un reintento por pooler puede dejar salida parcial en stdout. `--role-only` utiliza `pg_dumpall`: la CLI disponible **no demuestra** resuelto el fallo histórico de este productor. Antes de usar `--remote`, inspeccionar identidad del destino y método de credenciales: ciertos flujos enlazados pueden crear/alterar credenciales de un login role temporal según issue oficial (no se ha observado en ByteTorque). No exponer secrets por argv/logs/chat. GPG con clave temporal Windows 14/14 PASS NO prueba recuperación de roles reales. [Checkpoint y traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_WINDOWS_PASS_ROLE_EXPORT_GATE_20261120.md).

---

## SEC-07 — CIERRE VALIDADO DE QA WINDOWS Y SIGUIENTE LABORATORIO GPG EFÍMERO (20/11/2026; BT-SEC07-R3-WINDOWS-QA-PASS-30)

Propietario confirmó `BT_SEC07_ZIP: VERIFIED`, `Ran 18 tests in 4.768s`, `OK`, `BT_SEC07_WINDOWS_QA: PASS`. Se cierran **únicamente** tests sintéticos Windows del paquete R3 anterior. Preparado paquete GPG **real pero exclusivamente sintético y con GNUPGHOME/clave efímeros**, SHA256 `051cbe04f6b7b900310bcab615b7b240ff8ff8b22abfe445b555e537ae4d078e`: 14/14 QA en asistente y tras extraer; en Windows **PENDIENTE**, sin aprobación para usar keyring original ni conectar producción. Ver [checkpoint completo y prompt de traspaso](docs/checkpoints/CHECKPOINT_BT_SEC07_R3_WINDOWS_PASS_GPG_EPHEMERAL_PREP_20261120.md). Nunca confundir este laboratorio de GPG con roles/ACL recuperados. Google Drive fuera; `BT-PILOT-QA-04 A REPASAR`.

---

## REGLA PERMANENTE — SEC-07: CHECKPOINT TRANSFERIBLE EN CADA AVANCE (20/11/2026; BT-SEC07-ROLES-CLI-FLAGS-PASS-29)

Por instrucción explícita reiterada del propietario, **al finalizar cada bloque de trabajo, incluso una comprobación local recibida por chat**, dejar un checkpoint breve pero autosuficiente en `docs/checkpoints/` y actualizar la portada de `roadmap.md` y `agent.md` (y el informe de incidentes si hubo errores). Incluir HEAD/commit, resultado **real vs sintético**, autorizaciones, operaciones prohibidas/no realizadas, evidencia sanitizada, artefactos candidatos privados y hash, límites, error/solución si aplica, siguiente paso exacto y un párrafo listo para retomar en otro chat sin repetir pruebas. Los candidatos ZIP que contengan material no público se entregan solo al propietario, **no al repositorio público**. Esta regla refuerza las obligaciones ya existentes y NO autoriza exportaciones remotas, despliegues, GPG real ni uso de secretos. [Checkpoint SEC-07](docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_CLI_FLAGS_AND_SYNTHETIC_LAB_20261120.md). 

---

## REGLA PERMANENTE — SEC-07: PARIDAD ESTRUCTURAL DEL SNAPSHOT PASÓ; SIGUIENTE ROLES/PERMISOS (20/11/2026; BT-SEC07-PARITY-STRUCTURE-PASS-25)

El propietario ejecutó SEC07 Paridad V2 con 40/40 QA y autorización, y obtuvo `SQL_PREFLIGHT: PASSED_BEFORE_GPG_RESTORE`, GPG/pg_restore PASS, 20 tablas (12 public, 8 bt_*), 21 políticas RLS, 35 funciones, cuatro extensiones instaladas, conteos 33 filas públicas y 4 privadas del **snapshot** y limpieza/manifest intactos. **NO repetir RESTORE por rutina**: cierre R2 **solo estructura/alcance**, no paridad con origen actual. El incidente V1 por `physical_tables` mal definido quedó **validado como RESUELTO EN PC**; todas las nuevas consultas de catálogo deben ejecutar preflight SQL PostgreSQL real antes de descifrar/restaurar. **No confundir RLS instalada con aislamiento probado ni `--no-owner --no-acl` con recuperación de roles/grants.** Prioridad R3: diseñar exportación recuperable de roles y privilegios filtrados con método oficial Supabase, comprobación de `supabase --version` y `supabase db dump --help` (CLI v3 breaking 04/11/2026), test sintético de no vacío y cifrado streaming, y solo después exportación real autorizada por separado. No reutilizar `roles.sql.gpg` antiguo con cero bytes. Registro final: [checkpoint estructural](docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_STRUCTURE_PASS_20261120.md), [informe errores/soluciones](docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md). Backup/manifiesto y keyring permanecen inalterados, Google Drive fuera del roadmap. `BT-PILOT-QA-04: A REPASAR`.

---

## REGLA PERMANENTE — SEC-07: PREFLIGHT DE SQL REAL ANTES DE RESTORE DE AUDITORÍA (20/11/2026; BT-SEC07-PARITY-SQL-INC-24)

**Incidente real**: el respaldo actual completó `GPG_PROCESS=OK` y `PG_RESTORE_PROCESS=OK`, pero la herramienta de paridad V1 se detuvo en `PARITY_QUERY_FAILED` porque el primer SQL (`CATALOG_METRICS`) utilizaba `physical_tables` sin declarar ese alias. Las 32 pruebas anteriores reemplazaban la respuesta de SQL con mocks; **una suite sintética verde no certifica la consulta real**. Reparación preparada: declaración `c.relkind` y `physical_tables`, 40/40 QA sintética, y **preflight ejecutado en PostgreSQL 17 temporal ANTES de transmitir GPG/pg_restore**, con falla cerrada por etapa y limpieza verificable. No reiterar restores por errores de sintaxis/alias de consultas: **probar SQL de catálogo en un DB nuevo vacío primero**. Mantener los materiales V1 como evidencia sin reescribirlos. Operaciones en Docker del usuario requieren autorización nueva y confirmación de la imagen local fija, sin red, sin puertos ni escritura a Supabase; proteger GPG, snapshot y manifest. [Causa/pruebas/plan](docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_SQL_INC_20261120.md). Drive excluido; `BT-PILOT-QA-04 A REPASAR`.

---

## REGLA PERMANENTE — SEC-07: NO CONFUNDIR ÉXITO DE RESTORE CON PARIDAD, ROLES O AUTORIZACIÓN PILOTO (20/11/2026; BT-SEC07-PARITY-PREP-23)

Tras ejecutar `pg_restore` del ciphertext actual en Docker Supabase PG17 sin errores, **NO** declarar recuperación íntegra solo por `pg_restore=0` o 12 tablas públicas: faltan validación de filas, FK/índices, RLS/funciones y comparación contra origen. Los ensayos locales `--no-owner --no-acl` **NO prueban** roles, propietarios, grants o acceso de usuario real. Los scripts de paridad deben comprobar autoridad de lectura (SUPERUSER/BYPASSRLS), contar cada tabla con `ONLY` para evitar duplicación en herencia, publicar solo agregados sanitizados y no nombres ni contenidos, evitar conexión al origen y preservar el manifiesto `restoration_verified=false`. Toda nueva restauración aislada requiere autorización específica, un solo contenedor efímero, limpieza verificable y diagnóstico de error sin bucles. **Registro preventivo e instrucciones:** [checkpoint SEC-07 paridad](docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_PREP_20261120.md). El ZIP candidato no se publica en repo, solo se entrega al propietario en chat. Drive excluido. Piloto Ignacio sigue A REPASAR.

---

## REGLA PERMANENTE — DESTINO GOOGLE DRIVE RETIRADO POR DECISIÓN DEL PROPIETARIO (20/11/2026; BT-SEC-OPERATING-STANDARD-20NOV-01)

**Google Drive NO forma parte del roadmap activo de seguridad, cifrado ni respaldos de ByteTorque.** No sugerirlo, no corregir su OAuth ni ejecutar workflows manuales históricos de exportación/provisión/diagnóstico Drive. Conservar incidentes SEC-10…SEC-14 y documentos previos como **evidencia histórica**, expresamente superada por esta decisión; no borrar logs/checkpoints ni confundirlos con pendientes vigentes. Mantener los scripts/workflows legados sin ejecutar hasta una limpieza de código con revisión de dependencias, CI y autorización específica del titular. **No se retiró el cifrado GPG/OpenPGP ni la obligación de una copia independiente fuera del PC.** No activar destino externo alternativo sin autorización. Prácticas y roadmap vigentes en [estándar operativo de seguridad](docs/BT_SEGURIDAD_ESTANDAR_OPERATIVO_20261120.md) y [checkpoint de decisión](docs/checkpoints/CHECKPOINT_BT_SEC_ESTANDAR_Y_SIN_DRIVE_20261120.md). El primer bloque de recuperación sigue siendo inventariar extensiones offline del respaldo cifrado ya creado, sin exportar otra vez. **BT-PILOT-QA-04 A REPASAR**.

---

## REGLA PERMANENTE — EXTENSIONES DE SUPABASE EN RESTORE AISLADO (19/11/2026)

Ante `pg_restore` fallido con categoría de stderr `EXTENSION_UNAVAILABLE` en contenedor PostgreSQL **vanilla**, tratarlo como **incompatibilidad del entorno de recuperación** hasta corroborar la extensión concreta, NO como corrupción del respaldo cifrado ni fallo del GPG cuando este último terminó con éxito. No instalar extensiones en producción, omitirlas con `--use-list` sin comprender dependencias ni forzar un `pg_restore` aparente PASS. Primero analizar **offline** el índice `pg_restore --list` del snapshot cifrado validado y las extensiones disponibles en la imagen local; emitir metadatos saneados, nunca SQL de clientes. Si faltan extensiones, evaluar Supabase PostgreSQL 17 compatible y su versión exacta antes de un nuevo restore aislado; conservar snapshot original, evitar otra exportación remota y advertir que verificar .control NO prueba carga de extensión ni compatibilidad de Auth/Storage/roles. Guía Supabase: https://supabase.com/docs/guides/self-hosting/restore-from-platform ; pg_restore: https://www.postgresql.org/docs/17/app-pgrestore.html . [Checkpoint SEC-07](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md).

---

## REGLA PERMANENTE — RECONCILIACIÓN DE DESTINATARIO GPG ANTES DE NUEVOS BACKUPS (19/11/2026)

Un error `HISTORICAL_RECIPIENT_KEY_NOT_UNIQUELY_PRESENT` **solo acredita que el identificador público del destinatario no se vinculó de manera única con una huella primaria en el listado privado GPG consultado**. NO significa por sí solo pérdida de la clave, fallo de Supabase, o corrupción del ciphertext histórico. Antes de cualquier nueva exportación, comprobar de manera **offline y sin revelar huellas, IDs, correos o material de clave** el encabezado OpenPGP, claves públicas y privadas en el anillo activo, y si el parser del candidato reconoce subclaves. Si falta la clave privada en el anillo activo, no generarla, importarla, buscarla en otros perfiles ni alterar GNUPGHOME sin consentimiento y un plan de custodia; la clave anterior no debe ser reemplazada automáticamente. No usar `--decrypt`, `--export-secret-keys`, logs crudos ni `pg_dumpall` para depurar esta asociación. Detenerse si la correspondencia es ambigua. Documentar comprobación local y condición de reintento en [checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md).

---

## REGLA PERMANENTE — RESPALDOS HISTÓRICOS PARCIALES Y PRERREQUISITOS (19/11/2026)

Si una exportación anterior falló antes de finalizar roles/manifiesto, **NO exigir un `manifest.json` histórico como condición de un nuevo respaldo**, ni dar por inexistente el ciphertext anterior. Inspeccionar qué etapa escribe cada artefacto: en el exportador local original el manifiesto se escribe **después de** exportar roles, que fallaron. Todo reemplazo de esa dependencia debe validar *sin revelar ni descifrar datos* la identidad criptográfica de la clave/cifrado que el propietario ya conserva, con bloqueo si hay ambigüedad o incongruencia; nunca seleccionar una clave arbitrariamente, generar otra automáticamente o sobrescribir el respaldo antiguo. Los ZIP candidatos deben probar también el estado real de respaldos parciales **sin manifiesto** antes de instruir una ejecución remota. Este incidente se documenta en [checkpoint SEC-07 backup](docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md). El alcance de restauración y los secretos de la plataforma siguen sujetos a autorización separada.

---

## REGLA DE TRABAJO — DIAGNÓSTICOS COMPLETOS Y BLOQUES GRANDES (19/11/2026)

En el chat exclusivo de seguridad, por decisión expresa del propietario, agrupar la revisión en **bloques cerrados**: consultar primero documentación y evidencia histórica; investigar causas y alternativas oficiales; inspeccionar código completo disponible; proponer/realizar correcciones solo en copias candidatas y probar casos sintéticos sin red; solicitar al propietario **una sola acción agrupada** cuando sea indispensable acceder a su PC. Ante errores, hacer diagnóstico razonado y documentar causas comprobadas frente a hipótesis **antes de volver a ejecutar**; no serializar una docena de inspecciones triviales ni repetir probes que perdieron su evidencia. Mantener consentimiento explícito para nuevas conexiones/exportaciones, modificaciones de producción, migraciones, backups, restauraciones y cambios de secretos. Nunca subir código local con credenciales, .env, .pgpass, keyring ni copias GPG a un repositorio o chat. El cambio metodológico NO rebaja las puertas de seguridad.

---

## REGLA PERMANENTE — BITÁCORA DE ERRORES, CAUSAS Y SOLUCIONES (19/11/2026)

**ANTES de diagnosticar o intentar de nuevo un fallo de ByteTorque**, leer [auditoría histórica y libro SEC-01…SEC-17](docs/BT_SEGURIDAD_AUDITORIA_RETROSPECTIVA_20261119.md), el `roadmap.md`, `agent.md` y último checkpoint. **Nunca concluir "herramienta desinstalada" de "NO ENCONTRADO EN PATH", ni "backup inexistente" de "backup cloud bloqueado", ni "restauración pendiente" de ausencia de prueba total cuando existe una restauración SQL parcial validada.** PostgreSQL 17 **ya fue instalado** en Windows el 17/11/2026 y se habilitó entonces `C:\Program Files\PostgreSQL\17\bin` en el `PATH` de aquella sesión; en una sesión nueva se debe comprobar primero la ruta absoluta. Docker 29.9.3 está presente según el propietario.

**AL ENCONTRAR CADA ERROR Y AL CERRAR CADA TAREA** dejar en `roadmap.md`, `agent.md` y checkpoint correspondiente un registro con: `INC-ID`, fecha, componente, error textual sanitizado, commit/versión/ejecución exacta, **causa comprobada vs hipótesis**, solución aplicada (o pendiente), prueba de resultado auténtica (y qué NO prueba), archivos/servicios afectados, riesgo, autorizaciones, próximo paso y condición concreta para reintentar. **No suprimir ni reinterpretar logs anteriores; anexar correcciones fechadas**. Si el estado es incierto, indicar `CAUSA NO DETERMINADA` y prohibir reintentos destructivos o duplicados hasta reconciliar.

**Hallazgo crítico verificado:** el cifrado GPG SQL antiguo **sí se creó** y su restauración aislada de siete tablas **sí funcionó**, pero el archivo `roles.sql.gpg` contiene **exactamente 0 bytes descifrados** y no sirve de copia de roles. Además, ese backup tiene fecha **17/11 14:41 UTC**, anterior a migraciones alojadas CP05 (15:48), Creador (17:07) y PLAN-04A (18:41). **No protege todo el estado actual de la plataforma**; requerirá respaldo nuevo *con nombre diferente* y recuperación validada de ese nuevo snapshot, **solo con aprobación específica**. No repetir el test viejo como si no se hubiera realizado.

**Drive:** no hay exportación/restauración cloud verificada. Aunque el checkpoint inicial de provisión decía «no ejecutado», **sí se ejecutó posteriormente** el workflow [44094695940](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44094695940) y falló `DRIVE_FOLDER_INACCESSIBLE`. No volver a disparar `mkdir` ni cambiar OAuth/destino antes de reconciliar ese intento. El respaldo de GitHub es manual y tiene confirmación extraordinaria cuando el repo está público; esto **no** equivale a backups automáticos activos.

**Aplicar también a Codex/Work/Astra:** solo atribuir a un agente una operación efectivamente verificable y no prometer trabajo en segundo plano. No copiar contraseñas, tokens, SQL restaurado, respaldos privados ni claves al repositorio ni a chats. El registro de incidentes es adicional —no reemplaza— las reglas de leer `AGENTS.md`/`agent.md`/`roadmap.md`/checkpoint antes de trabajar y documentar al finalizar.

---

## ACTUALIZACIÓN DE SEGURIDAD — ROLES GPG CONFIRMADOS VACÍOS (19/11/2026)

**Resultado verificado en el PC del propietario:** descifrado GPG binario de `roles.sql.gpg` (ciphertext de 151 bytes) con `ROLES_DESCIFRADO_EXIT: 0` y `ROLES_BYTES_DESCIFRADOS: 0`. El archivo **descifra, pero su contenido es exactamente 0 bytes**, así que **NO es un respaldo válido de roles**. Preservarlo como evidencia, sin sobrescribirlo. El anterior diagnóstico TLS fue `POSTGRES_TLS_OK`, seguido de `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` al ejecutar `pg_dumpall --roles-only --no-role-passwords`; **la causa de ese error NO está identificada**. Primero comprobar las versiones de `pg_dumpall` y `psql` sin conectar, luego depurar exclusivamente ese productor con códigos de diagnóstico seguros. No recrear clave GPG ni respaldar/restaurar nuevamente la base SQL ya comprobada. Para nueva copia cifrada de roles, exigir autorización específica y nombre nuevo, sin alterar los originales. Ver [checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md).

---

## REGLA OBLIGATORIA PARA TODOS LOS CHATS Y AGENTES DE BYTETORQUE — LEER ANTES, DOCUMENTAR DESPUÉS (19/11/2026)

**Aplica a CUALQUIER chat, agente, ChatGPT, Codex o colaborador que dé instrucciones o ejecute tareas sobre este repositorio, incluidas preguntas de continuidad, comandos de PowerShell, prompts para otros agentes, QA, seguridad, diseño, despliegues y migraciones.** Es una regla de proyecto, no una afirmación sobre comportamientos de otros chats que no accedan a estos archivos.

**ANTES de dar una instrucción accionable o modificar algo:**
1. Leer desde la rama `main` ACTUAL, por este orden: `AGENTS.md` (este archivo), `agent.md`, `roadmap.md` (incluir las prioridades iniciales y el bloque pertinente) y **último checkpoint relevante** de `docs/checkpoints/`. Para seguridad/respaldos, leer también el checkpoint `CHECKPOINT_BT_SEC_BACKUP_CONTINUIDAD_20261119.md` y los antecedentes asociados.
2. Confirmar HEAD de `main`, estado ejecutado frente a candidato, evidencia de pruebas, flags, despliegue real y las tareas pendientes. Consultar contexto anterior cuando se trate de pasos que el propietario recuerda haber hecho. **No suponer ausencia de trabajo porque falte un archivo en la conversación actual** ni pedir repetir una tarea ya realizada.
3. Comparar lo solicitado con lo realizado y dar **el próximo paso exacto pendiente**, conservando trabajo previo y sin reconstrucciones ni operaciones sensibles no autorizadas. Si no se puede leer la documentación o hay conflicto entre fuentes, **informarlo y pedir evidencia** antes de indicar acciones que puedan duplicar, sobrescribir o alterar datos. No inventar resultados de ejecuciones.

**AL FINALIZAR CUALQUIER TRABAJO DEL PROYECTO (código, documentación, QA, seguridad, diseño, scripts, migraciones preparadas, operaciones autorizadas):**
1. **Actualizar `roadmap.md`** con fecha, etapa, estado real (diseñado/candidato/probado/publicado/operativo), tareas terminadas, bloqueos y próxima tarea prioritaria. No cambiar un pendiente por «hecho» sin evidencia.
2. **Crear o actualizar un checkpoint específico en `docs/checkpoints/`**: objetivo, punto de partida/commit, archivos modificados, decisiones/autorizaciones, comandos/acciones realmente ejecutados, resultados y enlaces de pruebas, límites de la validación, efectos en Render/Supabase/Storage/Drive, flags, riesgos, **lo que FALTA** y próxima instrucción para otro chat. Si el intento quedó bloqueado, registrarlo como **BLOQUEADO** y qué acción lo desbloquea; no declarar éxito.
3. **Actualizar `agent.md`** con enlace al último checkpoint y estado de continuidad en pocas líneas; si aparece una regla permanente nueva, actualizar también `AGENTS.md`. Registrar un commit en `main` (normalmente `[skip render]` si solo cambian documentos/candidatos sin publicación autorizada).
4. **La respuesta final al propietario** debe decir qué se hizo, qué no se hizo, commit, pruebas verificadas, si hubo publicación o cambios alojados, pendientes y próximo paso. No finalizar una tarea dejando un reporte solo en el chat o únicamente en un fichero local. No crear checkpoints nuevos para una mera consulta sin trabajo realizado.

**Jerarquía:** instrucciones y consentimiento explícito más recientes del propietario > evidencia verificable del estado real > reglas vigentes en `AGENTS.md` > referencias de `agent.md`/`roadmap.md` > checkpoints históricos. No resolver contradicciones silenciosamente: explicar la diferencia y corregir las tres fuentes. Proteger `main`, secretos y datos del taller. Estas reglas no autorizan ejecutar un despliegue, exportación, restauración ni escritura alojada por sí mismas.

---

## PRIORIDAD ABSOLUTA — NO REPETIR CIFRADO DE RESPALDO LOCAL (19/11/2026)

**Antes de sugerir crear claves GPG, exportar de nuevo toda la base o comenzar desde cero, LEER esta sección, `roadmap.md` y los checkpoints de respaldo.** El propietario confirmó y el historial de trabajo del 17/11/2026 dejó evidencia de que **YA se generó y descifró un respaldo cifrado local en Windows**. No confundir el estado del respaldo manual del PC con el workflow automático de GitHub/Google Drive, que quedó bloqueado por autorización OAuth de la carpeta.

**Hechos históricos del procedimiento local (evidencia conversacional del propietario; los archivos privados no se guardan en GitHub):**
- Se configuró GPG/OpenPGP con material de clave pública y clave privada bajo custodia local. Se informó `CIFRADO Y DESCIFRADO OK`, seguido de `BASE_DESCIFRADO_OK`, `ARCHIVO_POSTGRES_OK` y `CATALOGO_OK`. **No pedir generar claves nuevas ni repetir cifrado sin identificar antes el estado de la copia existente.**
- Copia cifrada en `BT-Backups/bytetorque-local-20261117T144118Z-8c1f8a323a924d44a6b8e853e6faa756/` (ruta base local por confirmar, no suponer letra de unidad); archivos reportados `database.dump.gpg` (**89.091 bytes**) y `roles.sql.gpg` (**151 bytes**). Tamaños reportados NO sustituyen SHA-256, lectura íntegra ni manifiesto.
- **Se ejecutó correctamente una restauración de la base SQL en un entorno Docker aislado**; su comprobación funcional/documentada cubrió siete tablas: reportes `BT_DATOS: RLS_ACTIVA=7 POLITICAS=16`, `BT_REGISTROS: TABLAS=7 FILAS=25`, `BT_PARIDAD: SIETE_TABLAS_COINCIDEN`. Esto acredita las comprobaciones específicas indicadas, **no** una recuperación integral de todo Supabase ni todos los roles/extensiones/objetos Storage.
- **Problema sin cerrar:** `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` en diagnóstico separado; el archivo `roles.sql.gpg` de 151 bytes **NO se declara respaldo de roles correcto/recuperable** sin inspección y prueba. No interpretar el fallo anterior de salida `NUL` como corrupción de `database.dump.gpg`: posteriormente `BASE_DESCIFRADO_OK` y `CATALOGO_OK` se observaron.

**Siguiente paso correcto en el PC:** localizar y conservar sin sobrescribir la carpeta cifrada existente, verificar nombres, tamaño e integridad SHA-256 de los ciphertext y que el keyring/clave privada aún pueda descifrar; **después** diagnosticar/exportar roles de manera controlada y completar recuperación integral aislada con una copia identificada. La última prueba de siete tablas **no reemplaza** la verificación del proyecto completo (Auth, roles, políticas, Storage bytes/configuraciones/Edge/secretos externos). No instalar migraciones productivas CP05/LIVE-02 ni activar módulos/comunicaciones hasta superar las puertas restantes y obtener autorizaciones explícitas.

**Flujo aparte y todavía PENDIENTE:** exportación cifrada automática a Drive `BT-BACKUP-GHA` no tiene recibo exitoso ni restore externo demostrado: OAuth `drive.file` no podía acceder a carpeta existente. La preparación de carpeta alternativa `BT-DRIVE-PROVISION` fue código OFF, sin ejecución autorizada; no afirmar que hubo subida real a Drive. No ampliar OAuth, cambiar secretos, regenerar claves o disparar workflows de respaldo por deducción.

**Protocolo de próximos agentes/chats:** informar primero "el cifrado local ya se hizo; la restauración SQL aislada se ejecutó correctamente y se verificó la paridad de siete tablas; faltan roles y cobertura integral de Supabase". No recomendar repetir instalación ni preparar cifrado como si fuera cero. Separar claramente **(A) copia local cifrada**, **(B) ensayo de recuperación parcial**, **(C) respaldo automático Drive bloqueado** y **(D) restauración integral pendiente**. Evitar publicar hashes sensibles de archivos, contraseñas, claves privadas, dumps, emails de propietarios o capturas de secretos. Esta decisión **prevalece** sobre textos antiguos que digan genéricamente "no existe respaldo": esos textos se refieren a ausencia de *respaldo integral recuperable y verificado* o a falta de exportación cloud, no a inexistencia de la copia local.

---
## Decisión permanente CP05 · PDF R3 + checkpoints (17/11/2026)

- PDF oficial predeterminado: el diseño visual ByteTorque de la captura aportada por el Director, con encabezado, cotización/revisión/fecha/vigencia, cliente/vehículo, tabla, costos, condiciones, observaciones, marca y espacio de conformidad. Usar datos reales de snapshot, jamás datos de QA incrustados ni teléfonos/QR ficticios. PDF de borrador no es revisión emitida ni aceptación.
- Plus y Full vigentes: pueden seleccionar **papelería PDF propia A4 privada** de una página, con espacio reservado para campos dinámicos. Básico usa la oficial. El control de acceso se valida en SQL/Storage, no por frontend; `VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED` apagado mientras su migración siga sin instalar. No autorizar por accidente a mecánicos de otros talleres.
- **Cada tarea terminada debe dejar un checkpoint en `docs/checkpoints/`** con commit, pruebas comprobadas, despliegue/flags, migraciones aplicadas o candidatas y próximo paso para mudanza de chat. Ver `docs/BT_CP05_PDF_DEFAULT_AND_CUSTOM_TEMPLATES.md`.

# ByteTorque — AGENTS.md

**Versión documental:** BT-UI-02-R2-OFICIAL / 2026-11-11  
**Producto y marca comercial oficial:** **ByteTorque** (proyecto técnico `biomotors-taller`, independiente de BIOMOTORS Academia). BIOMOTORS es el taller piloto, no la marca visible del SaaS.  
**Identidad gráfica vigente:** BT-BRAND-01 aprobada por el Director el 14/11/2026; originales definitivos en `assets/brand/originals/`, contrato y hashes en `assets/brand/README.md` y `assets/brand/manifest.json`. Usar estos archivos, sin reinterpretar ni dibujar sustitutos.

**Estado:** Inicio **BT-UI-02-R2 aprobado visualmente como sistema premium OFICIAL** por el Director el 11/11/2026; Android Expo BT-UI-01 preservado; sin backend ni APK real. Próximo panel: Órdenes de trabajo BT-UI-03.


## Excepción temporal de visibilidad — autorización expresa 17/11/2026

Al comprobar GitHub `visibility: public` y acceso anónimo, el propietario autorizó
expresamente que `Danielsanchezdesarrolador/biomotors-taller` permanezca **público
temporalmente** y continuar commits/push a main. No cambiar la visibilidad ni
bloquear otra vez solo por esta condición mientras siga vigente su autorización.
El propietario decidirá cuándo volverlo privado. Nunca publicar contraseñas,
claves privadas, tokens, credenciales o datos sensibles de usuarios/clientes.
Las demás restricciones de Supabase, migraciones, cobros y usuarios reales siguen.

## Regla permanente — dominio web oficial (17/11/2026)

- **Dirección canónica definitiva elegida por el Director:** `https://bytetorque.cl` (raíz, sin `www`). Todos los nuevos enlaces dirigidos a clientes, manuales, textos de marca y futuras comunicaciones deben priorizar esta dirección; `www.bytetorque.cl` será alias con redirección a la raíz una vez configurado.
- `https://biomotors-taller-demo.onrender.com` es **solo la dirección técnica del mismo servicio** `srv-dbqe4quc6qcc73f275jg`, no el dominio comercial ni un segundo sitio. **No crear otro Render** para realizar el cambio; mantener `main`.
- **Historial real confirmado:** el 16/11/2026 se configuraron en NIC Chile los nameservers de Cloudflare `hugh.ns.cloudflare.com` y `margaret.ns.cloudflare.com`; CNAME `@` y `www` a `biomotors-taller-demo.onrender.com` en modo **DNS only**; Render mostró ambos dominios **Verified**, certificados HTTPS **Issued** y la aplicación cargó en `https://bytetorque.cl` (incluidas rutas de acceso y registro). Supabase Auth ya tenía **Site URL** `https://bytetorque.cl` y redirección de confirmación `https://bytetorque.cl/#/auth/confirmacion`. **No reconfigurar DNS/Custom Domains/Auth desde cero**. El 17/11/2026 el Director mostró `ERR_CONNECTION_CLOSED`: diagnosticar como **regresión de conectividad posterior a configuración previamente funcional**, no como puesta en marcha pendiente. La disponibilidad de hoy sigue sin verificarse; conservar acceso técnico de contingencia.
- **Diagnóstico de la regresión:** primero comparar acceso desde red Wi-Fi y datos móviles, consultar estado Custom Domains/certificados en Render y DNS Cloudflare, y contrastar con URL técnica; verificar configuración existente antes de cambiarla. Supabase Auth ya se configuró para el dominio el 16/11: **no cambiar Site URL, Redirect URLs ni flujos de correo sin un diagnóstico y autorización concretos**. Evitar cortes de sesión y enlaces rotos.
- El dominio debe mantenerse registrado y renovarse a tiempo: la decisión de usarlo indefinidamente no garantiza su disponibilidad si vence el registro o falla DNS.

## Regla permanente — BT-PLAN-04 personas, talleres y extras (17/11/2026)

**BT-PLAN-04 · decisión vigente 17/11/2026:** Cualquier persona confirmada empieza con **Básico personal gratuito, sin creación de taller nuevo**. Puede recibir/comprar Plus o Full **antes** de registrar su propio taller. **Plus USD 5/mes incluye 4 mecánicos; Full USD 15/mes incluye 8; cada mecánico adicional cuesta USD 2/mes al titular del plan**, nunca al trabajador. Propietarios/administradores no ocupan cupos. Ignacio recibirá Full permanente sin cobro, creará Biomotors e invitará a sus 2 mecánicos (2/8). Esta decisión **reemplaza los cupos BT-PLAN-03 (Básico 2, Plus 8, Full 8)**; preserva talleres QA existentes, datos e historiales. 04A está instalado; 04B/04C y la preparación de 04D están implementados como código/SQL candidato probado localmente, todavía sin instalar ni activar. Los cobros reales permanecen desactivados. Ver `docs/BT_PLAN_04_IMPLEMENTACION_20261117.md`. Ver `docs/BT_PLAN_04_CUENTAS_TALLERES_Y_EXTRAS.md`.

- El panel Creador debe buscar y conceder Plus/Full a personas verificadas por UUID con MFA/AAL2 y auditoría, antes de que creen su taller. El encabezado debe reflejar únicamente el plan realmente validado en servidor de la cuenta/taller seleccionado. Sin autoasignación de creador, sin talleres ajenos, ni pagos activos. El mecánico invitado conserva una cuenta personal gratuita pero usa las funciones autorizadas del plan del taller.

## Regla permanente — cuenta Creador y suscripciones (17/11/2026)

- **Plataforma de dos niveles:** cuentas corrientes con correo verificado administrarán exclusivamente su taller y mecánicos; la cuenta **Creador**, exclusiva del titular del software, tiene panel propio para conceder, extender o revocar suscripciones sin ser dueño de talleres ajenos.
- **Planes vigentes:** Básico personal gratis sin taller nuevo; Plus USD 5/mes con 4 mecánicos incluidos; Full USD 15/mes con 8 mecánicos incluidos; cada mecánico adicional USD 2/mes pagados por titular, nunca trabajador. El Creador concede derechos personales Plus/Full con MFA y auditoría; la compra/trial y su aplicación automática están pendientes.
- **Ignacio:** después de registrar/verificar su cuenta, el Creador le concederá **Full permanente sin cobro** antes de que cree su **propio taller Biomotors**. No confundir con talleres QA A/B; Ignacio no recibe permisos globales, código ni acceso a otros talleres.
- **Seguridad del Creador:** permiso privado en bt_platform_private.creators, asociado al UUID de Auth y jamás a user_metadata o selector visual. RPC bt_creator_is_creator, bt_creator_overview y bt_creator_manage_subscription validan el acceso en servidor. Toda modificación manual requiere JWT aal2 (TOTP MFA), idempotencia y auditoría. No exponer historiales/clientes ajenos al panel global.
- **Estado BT-CREATOR-01:** esquema privado aditivo instalado y rol del Director vinculado; su cuenta es además admin SOLO en Taller ByteTorque de Pruebas. Panel de React src/creator/CreatorConsole.tsx bajo VITE_BT_CREATOR_PRIVATE_ENABLED=true. Sin pagos reales. La sincronización con límites/beneficios, el alta autónoma y la gestión de mecánicos tienen candidatos 04B/04C sin instalar. El flag `VITE_BT_PLAN04_WORKSHOPS_ENABLED` permanece apagado hasta autorización SQL, pruebas alojadas y respaldo recuperable. Ver docs/BT_CREATOR_01_ESTADO_Y_PLAN.md.
- **Prioridades:** la infraestructura del Creador se prepara ahora por nueva instrucción, pero CP05/CP06 y el piloto de Ignacio siguen antes de activar pagos, suscripciones públicas o comercialización.

## 1. Misión y fuentes de verdad

Crear ByteTorque, una aplicación de gestión para talleres mecánicos con enfoque **SaaS multiempresa (multitenant)**. El primer taller piloto será el de Ignacio; el producto debe servir posteriormente a múltiples talleres suscritos, con aislamiento estricto de datos. Conservar todos los requerimientos de la nota de voz del 11/11/2026: inspección multipunto, presupuesto formal, correos al cliente, fichas de clientes y vehículos, historial técnico y observaciones pendientes.

**Prioridades inamovibles:** **primero funcionamiento integral y piloto real aprobado por Ignacio** (decisión del Director, 15/11/2026); continuidad sin reconstrucciones innecesarias; seguridad y privacidad; facilidad de uso en iPhone y Android; costos iniciales contenidos; claridad para usuarios no técnicos. La arquitectura multitenant sigue desde el inicio para aislar datos, pero la incorporación de terceros, cobros, suscripciones y escalamiento (CP07–CP09) **no se implementarán hasta terminar y aprobar el piloto de Ignacio**. Priorizar los flujos persistentes CP03–CP06 después de cerrar solo las puertas de Auth necesarias. Consultar definición de terminado y bloqueos en `roadmap.md`.

## 2. Responsables acordados

- **Responsable técnico / desarrollo (usuario):** diseño del producto, implementación, código, GitHub, Supabase, despliegues, seguridad, pruebas, actualizaciones y mantenimiento técnico.
- **Responsable comercial (Ignacio):** usar el piloto como taller de referencia, contactar talleres, presentar el producto, captar clientes, recoger retroalimentación comercial y coordinar oportunidades de venta.
- **Decisiones conjuntas pendientes:** titularidad jurídica de software/marca, reparto de ingresos o utilidades, facturación, soporte al cliente, presupuesto de operación, política comercial y eventual estructura societaria. **No presumir porcentajes, cesiones ni asociaciones legales automáticas.**

## 3. Metodología de trabajo — usar la herramienta adecuada y ahorrar cuota

**Decisión confirmada por el responsable técnico el 11/11/2026.** Aplicable a todas las etapas:

1. **ChatGPT de este proyecto:** analizar, proponer, programar, actualizar archivos, verificar y documentar directamente siempre que tenga herramientas y permisos. Priorizar la ejecución real y evitar delegación innecesaria.
2. **ChatGPT en modo Alto:** usarlo cuando el trabajo exija razonamiento adicional o revisión profunda y el usuario así lo elija.
3. **Codex:** reservarlo para tareas grandes, refactorizaciones extensas, exploración de muchas rutas o problemas que no puedan resolverse fiablemente de forma directa; cada encargo debe estar acotado, con criterios de aceptación y referencia a checkpoint.
4. **Usuario:** intervenir exclusivamente en decisiones, revisión visual, permisos, configuraciones que requieran acceso personal y pruebas físicas (por ejemplo, iPhone de Ignacio).
5. **Cero trabajo repetido:** no rehacer lo que ya esté en main; leer el estado antes de cada cambio. No crear ramas paralelas, studios adicionales, ni gastos de cuota sin beneficio claro.
6. **Evidencias primero:** diferenciar archivos creados, build verificado, CI aprobado, web publicada y aplicación probada en dispositivo real; no confundir estas fases.
7. **Aprobar primero actividades sensibles:** sin cobros reales, correos externos, cambios irreversibles, secretos ni incorporación de datos personales hasta que el usuario lo autorice.

## 3B. Entregas funcionales completas — decisión del Director (15/11/2026)

Para CP03–CP06 usar el [método de entregas del piloto](docs/BT_PILOTO_IGNACIO_METODO_ENTREGAS.md): **definir una función utilizables por Ignacio → integrar código existente → una ronda final de pruebas de función y seguridad → validar con autorización en backend real/iPhone → checkpoint y siguiente función**. Evitar subetapas de validación redundantes si no corrigen un fallo o desbloquean la operación. No sustituir pruebas reales por mocks ni saltarse RLS, seguridad o autorizaciones. **Sin permiso para migraciones, proveedores o datos personales, no desplegar** y no declarar capacidad completa.

## 4. Reglas operativas del agente / Codex

1. Antes de modificar, leer `README.md`, `AGENTS.md`, `roadmap.md` y el último checkpoint.
2. No mezclar ni reutilizar tablas, proyectos, secretos o despliegues de **BIOMOTORS Academia**.
3. El backend previsto es el proyecto Supabase independiente `biomotors-taller`, cuya existencia se ha comunicado; verificar identidad/estado antes de conectarlo. Nunca colocar credenciales en repositorio ni mensajes.
4. Repositorio previsto: `Danielsanchezdesarrolador/biomotors-taller`. **Creado y verificado el 11/11/2026 durante BT-CP01.** Trabajar exclusivamente sobre `main`; no crear ramas, forks, otros sitios o entornos sin autorización.
5. Preferir incrementos pequeños, verificables, reversibles, con commits identificables, pruebas y reporte de cambios.
6. No activar cobros reales, envíos masivos de correo, migraciones destructivas ni datos de clientes reales sin autorización explícita y controles probados.
7. Toda tabla con datos de taller debe tener `workshop_id`/`tenant_id`, claves foráneas coherentes y **RLS comprobado con pruebas de acceso cruzado**. No depender de ocultar registros en frontend.
8. Claves administrativas o de servicio exclusivamente en backend seguro; jamás en la PWA, APK Android ni archivos públicos.
9. Preservar trazabilidad: qué pidió Ignacio, qué fue decidido, qué es hipótesis, qué está implementado y qué continúa pendiente.
10. **CORRECCIÓN DEFINITIVA 11/11/2026:** Android = APK NATIVA React Native + Expo + TypeScript, como Punto Fénix; NO PWA ni WebView. iPhone/iOS = SOLO PWA desde Safari agregada a pantalla de inicio; NO app nativa iOS, Apple Developer ni App Store. Web PC = acceso vía navegador al mismo frontend de iOS PWA.
11. **Autorizada** la demo web en Render solo para navegador/iOS PWA; Android se implementará como cliente NATIVO en `apps/android/` en este repo.
12. Backend único Supabase `biomotors-taller` compartido por PWA iOS/web y APK Android, aislado por taller (RLS). Nunca incluir `service_role` en clientes.
13. No decir APK lista hasta generar, firmar e instalar un APK auténtico en un dispositivo Android; iconos y manifiesto PWA no sirven como prueba de APK.

## 4. Alcance funcional mínimo del piloto

- Identificación del taller y usuario autenticado.
- Registro de clientes y vehículos, incluyendo placa/patente y datos pertinentes.
- **Hoja de inspección multipunto** editable, con resultado, fecha, responsable y observaciones técnicas.
- **Presupuestos/cotizaciones** vinculados a clientes, vehículos y revisiones, exportables a PDF; números, ítems, precios y estados.
- Envío transaccional al correo del cliente de los documentos de revisión y presupuesto con registro de fecha y resultado de entrega.
- Historial cronológico por vehículo: diagnósticos, servicios, trabajos realizados, ítems pendientes y presupuestos.
- Observaciones de problemas no reparados que permanezcan visibles en visitas posteriores.
- Respaldo, exportación y políticas de retención; no depender de conversaciones de WhatsApp.

La hoja multipunto y el formato del presupuesto **deben contrastarse con las plantillas reales facilitadas por Ignacio** antes de considerarse versiones definitivas.

## 5. Diseño multiempresa desde la primera migración

Entidades sugeridas: `workshops`, `profiles`, `workshop_memberships`, `customers`, `vehicles`, `inspections`, `inspection_items`, `estimates`, `estimate_items`, `service_records`, `vehicle_observations`, `email_deliveries`, `subscriptions` y `audit_events`.

- Los datos de cada taller tienen propietario lógico único (`workshop_id`) y permisos derivados de membresías activas.
- Un mismo cliente o vehículo puede existir en distintos talleres sin fusionar historiales ni exponer información ajena.
- Roles previstos por taller: propietario y colaborador; roles adicionales se introducen según necesidades verificadas.
- Gestión administrativa de la plataforma separada y auditada; evitar accesos indiscriminados a datos privados.
- Probar operaciones directas sobre API/DB: lectura, escritura, modificación, eliminación y exportación, tanto autorizadas como denegadas.

## 6. Modelo de negocio — decisión estratégica

- **Meta:** comercializar ByteTorque a otros talleres mediante pago recurrente.
- **Planes comerciales aprobados para diseño (11/11/2026):** Básico **gratis sin publicidad durante lanzamiento**; Plus **USD 5/mes por taller**; Full **USD 15/mes por taller**. Prueba Full **3 días (72 h) con método de pago**. El propietario puede **desactivar renovación automática desde Configuración**, incluso inmediatamente al activar; si el servidor/proveedor confirma antes del vencimiento, no se intenta cobrar y conserva Full hasta fin de prueba, luego Básico sin perder datos. Más detalles: docs/PLANES_COMERCIALES_BT_PLAN_01.md. Sin cobros reales todavía.
- **Adquisición:** Ignacio lidera contacto, demostraciones y venta; el usuario lidera evolución del producto.
- **Etapas:** taller piloto -> otros talleres piloto -> validar cobro y soporte -> lanzar suscripción -> ampliar cartera.
- **Indicadores:** talleres activos, usuarios por taller, presupuestos generados, correos enviados, retención, gastos por taller, incidentes y tasa de conversión.

## 7. Seguridad, legalidad y experiencia

- Cumplimiento aplicable de privacidad, protección de datos personales, consentimiento/información y derechos de acceso/exportación; revisar normativa chilena vigente antes del lanzamiento.
- Definir responsable de tratamiento, políticas de conservación, respaldo/restauración, borrado y recuperación de cuentas.
- Presupuestos PDF no equivalen automáticamente a facturas o documentos tributarios electrónicos.
- Correos transaccionales con dominio verificado, autorización, límites de envío, manejo de errores y bitácora; sin hacer marketing no solicitado.
- Diseño móvil sencillo: botones grandes, formularios breves, estados claros, guardado fiable y accesibilidad.

## 8. Definición de terminado por funcionalidad

Cada entrega debe incluir: requerimiento, diseño de permisos, migración reversible si aplica, prueba unitaria/integración, prueba de RLS multitenant, prueba móvil Safari cuando corresponda, evidencia de ejecución, actualización de roadmap y checkpoint con riesgos/pedientes.

**Próxima etapa:** completar BT-CP01 verificando CI/build, publicación demo y conexión segura del proyecto Supabase independiente. La interfaz actual es demostrativa; no guarda información.
## Corrección de arquitectura oficial

La descripción anterior «PWA para Android e iOS» fue revocada por el usuario. Fuente vigente: `docs/ARQUITECTURA_PLATAFORMAS.md` y checkpoint BT-CP01-PLATAFORMAS. Conservar historia anterior, una rama `main` y el repositorio independiente de BIOMOTORS Academia.

## Identidad visual y nomenclatura — decisión 11/11/2026

- **Nombre visible de la aplicación:** `ByteTorque`, escrito exactamente así, sin espacio.
- **Marca de presentación:** ByteTorque. No usar «BIOMOTORS TALLER» en títulos, menús, onboarding, emails de la aplicación, iconos nombrados ni entregables nuevos.
- **Taller piloto:** BIOMOTORS, propiedad de Ignacio; mostrar BIOMOTORS solo como nombre del taller activo cuando corresponda, y no simular propietarios ni clientes reales.
- **Identificadores técnicos heredados:** conservar `biomotors-taller` en GitHub, Supabase y URL de Render, salvo autorización separada de migración, para evitar romper las integraciones.
- **Director de Arte:** adaptar los cinco paneles y el flujo de registro de clientes a ByteTorque; los mockups antiguos de BIOMOTORS TALLER son referentes de diseño, no marca final. Logo e iconos de marca quedan pendientes de aprobación.
- **Control comercial:** disponibilidad registral, dominios y posible marca registrada todavía no verificados; no afirmar exclusividad.

## BT-UI-01 — Inicio visual dual (aprobación 11/11/2026)

- Los dos clientes usan los mockups del usuario como referencia visual, con identidad visible **ByteTorque**, estética azul marino, blanco, azul intenso, indicadores y tarjetas.
- Web / iOS Safari PWA: frontend React/Vite en raíz; Android **nativa**: React Native + Expo en `apps/android/`.
- Cinco destinos: Inicio, Órdenes de trabajo, Clientes y vehículos, Informes y cotizaciones, Configuración. No añadir secciones extras al menú principal sin nueva decisión.
- Mostrar claramente modo DEMO cuando se utilicen datos inventados (cifras, vehículos, órdenes). Ningún botón de crear debe fingir persistencia, emisión o envío; navegar a módulo o advertir que está pendiente.
- Cada entrega de UI debe comprobar TypeScript y pruebas en CI, y verificar estado de Render; APK real solo cuando se haya generado/firmado y probado en dispositivo.
- Icono y logotipo definitivos aún pendientes del Director de Arte, no introducir símbolos o activos comerciales ajenos como logo final.

## Decisión BT-UI-02 — desarrollar y aprobar desde Render antes de APK Android

1. **Render web = plataforma principal de desarrollo y revisión**, trabajando solo en `main`, con despliegue automático de cambios aprobados a la demo de ByteTorque. Mantener **un solo sitio** y los mismos identificadores de infraestructura.
2. **APROBADO** el 11/11/2026: el Inicio **BT-UI-02-R2** define la identidad visual **OFICIAL** para los cinco paneles. Mantener `src/premium.css` y `src/styles.css` y reproducir idéntica calidad en las demás pantallas, sin modificar el Inicio aprobado. Contrato oficial en `docs/SISTEMA_VISUAL_OFICIAL_R2.md`.
3. **Android debe seguir siendo nativo** React Native + Expo. El cliente de `apps/android/` queda preservado temporalmente en BT-UI-01; su estética se actualizará **después** de consolidar flujos web y antes de crear APK. No usar WebView/PWA como atajo ni afirmar que compartir React DOM equivale a compartir interfaces nativas.
4. Diseñar contratos de datos, validaciones y lógica reutilizables en la medida de lo posible para evitar duplicar errores; para ambos clientes, un único Supabase con Auth y RLS multitenant. No habilitar datos personales, correos, pagos ni cuenta real sin seguridad y aprobación.
5. **No construir ni firmar APK ahora.** Al cierre del trabajo web, portar las pantallas aprobadas, verificar compilación nativa, generar APK firmado, probar en Android real y documentar resultados.
6. No confundir **código creado**, **GitHub CI PASS**, **Render LIVE**, **aprobación visual** ni **APK física probada**. Registrar evidencia individual para cada estado.

## Orden vinculante — Sistema visual OFICIAL R2

El Director aprobó expresamente BT-UI-02-R2. Todo diseño nuevo (incluido BT-UI-03 Órdenes de trabajo) debe basarse en `docs/SISTEMA_VISUAL_OFICIAL_R2.md` y no alterar ni sustituir la identidad ni el Inicio existente. No se permite introducir paletas, menús, topbars, estilos de tarjeta, tipografías o iconos discordantes. La identidad premium debe mantenerse en escritorio, Safari/iPhone PWA y finalmente Android nativo. La fidelidad visual debe comprobarse con capturas lado a lado. No confundir la aprobación visual del Inicio con autorización de backend real o APK.

## Requisito nuevo del Director — formulario de registro mediante enlace (11/11/2026)

Al abrir un enlace individual, el cliente completará sus datos personales **y también los de su vehículo** (marca, modelo, año, kilometraje; patente opcional) y el **motivo breve de la visita o el trabajo solicitado**. El envío definitivo deberá crear una solicitud pendiente de revisión vinculada al taller, no finalizar una OT automáticamente. Ignacio podrá convertirla en orden reutilizando los datos, sin transcribirlos. Enlaces seguros, datos mínimos, consentimientos, permisos/RLS y controles antiabuso obligatorios al implementar backend. Contrato: `docs/BT_REGISTRO_CLIENTE_VEHICULO_VISITA.md`.

**Separación de alcance:** mientras Codex implementa BT-UI-05 Informes y cotizaciones, registrar este requerimiento solo en documentación; **no alterar en paralelo formularios React, componentes R2, Supabase, Render ni Android**.

## Obligación BT-PLAN-01 — prueba Full y control de renovación

Básico gratis sin anuncios en lanzamiento; Plus USD 5/mes; Full USD 15/mes por taller. Trial Full 72 horas con método de pago, USD 0 inicial y consentimiento explícito al futuro cargo. Mostrar cancelación de renovación en Configuración desde primer minuto; cancelada a tiempo y confirmada en pasarela implica **cero intento de cobro**. Acceso Full hasta vencer y paso a Básico sin borrar historial. No almacenar tarjetas ni habilitar suscripciones sin aprobación, backend multitenant, idempotencia y prueba de no-cobro. Cuotas y publicidad posterior no aprobadas.

## Puerta BT-CP02-D — onboarding controlado (12/11/2026)

La función `bootstrap_workshop_owner` es SECURITY INVOKER y ejecutable únicamente por `service_role`. El endpoint Supabase Edge `bt-owner-onboarding` usa `verify_jwt=true`, comprueba el correo verificado por Auth y **permanece desactivado por defecto mediante `BYTETORQUE_ONBOARDING_ENABLED`**. No abrirlo ni conectar login público hasta aprobar pruebas A/B y límites de abuso. Checkpoint: `docs/checkpoints/CHECKPOINT_BT_CP02_D_20261112.md`.

## BT-PLAN-02 — Regla de plantillas de informe por plan (13/11/2026)

**Básico** usa exclusivamente **plantillas de informe oficiales predeterminadas**; no admite subir archivos propios. **Plus y Full** podrán subir y administrar **sus formatos propios de informes**, por taller, cuando la infraestructura real esté aprobada. Durante la prueba Full de 72 horas aplica el permiso temporal de Full; tras bajada a Básico, conservar consulta/exportación histórica y bloquear nuevas operaciones con formatos premium sin borrar archivos. Importar un PDF/Word/Excel **no lo hace editable o interactivo automáticamente**: requiere mapeo y validación explícita. Control en backend por suscripción, RLS y Storage privado por taller, no en estado React. Especificación: `docs/PLANES_COMERCIALES_BT_PLAN_01.md`. **BT-INS-01 de Codex no cambia por esta anotación**; no tocar UI, Supabase ni almacenamiento en paralelo.

## Regla permanente — evolución gradual de planes BT-PLAN-IDEAS-01 (13/11/2026)

El Director irá proponiendo nuevas funciones de **Básico, Plus y Full** a lo largo del desarrollo. Cada idea debe agregarse al **registro maestro `docs/REGISTRO_IDEAS_PLANES.md`**, con ID consecutivo `BT-IDEA-NNN`, fecha, descripción, plan, estado de aprobación, estado técnico y dependencia/coste si aplica. No borrar ni reemplazar decisiones históricas sin referencia de cambio. **Aprobada para diseño ≠ implementada o vendible**; propuestas no confirmadas van como **Por evaluar**. En la revisión final previa al lanzamiento recuperar y revisar todas las ideas registradas y obtener aprobación de matriz final del Director. La simple anotación NO autoriza ejecución de código, gastos, cobros, cambios de Supabase, publicidad posterior al lanzamiento ni intervención en BT-INS-01 mientras Codex trabaja.

## Instrucción vigente de transición — BT-OFICIAL-01 (14/11/2026)

El Director aprobó BT-QA-02 y solicitó iniciar la versión oficial ByteTorque, **sin nombres DEMO ni registros ficticios visibles en el sitio**. Leer `docs/BT_OFICIAL_01_TRANSICION_PRODUCTO.md` antes de modificar. Este es un **cambio de presentación/preparación** y no habilita aún clientes reales, identidades verificadas ni guardado permanente.

La UI pública debe iniciar vacía y sin cifras inventadas. Mantener los fixtures exclusivamente para tests aislados, sin activación pública ni inclusión en el bundle oficial. Sin backend aprobado, las acciones que aparenten ingresar/guardar información real deben quedar deshabilitadas con mensaje veraz, no solo perder la palabra «DEMO». Conservar cinco paneles R2, flujo A–E y lógica de revisiones/documentos para su reconexión posterior. Mantener `main`/Render existente hasta decisión separada. Pruebas BT-CP02-D y credenciales reservadas al otro chat; no tocar Supabase/Auth/RLS/onboarding/planes/correo/pagos en 01A. Ver roadmap y checkpoint QA-02.


## Decisión vinculante de cupos BT-PLAN-03 (14/11/2026)

**Regla histórica sustituida por BT-PLAN-04 (17/11/2026)**: previamente se aprobaron **Básico hasta 2**, **Plus hasta 8**, **Full hasta 8**, con acceso a mecánicos gestionado desde `Configuración → Usuarios y permisos`. El administrador del taller puede invitar/desactivar únicamente **mecánicos de su taller**; no concederse ni conceder roles administrativos, modificar dueño, manejar cuentas de otros talleres o alterar planes. Propietario/administrador no ocupan cupos de mecánico; los límites de otros roles no están fijados. En la prueba Full vigente se aplica el cupo Full. Los cupos deberán validarse desde backend con conteo seguro y reservas para invitaciones pendientes, no por React. No habilitar invitaciones ni Auth real hasta BT-CP02-D aprobado en su chat reservado; BT-AUTH-01A solo UI sin efectos reales. Ver `docs/PLANES_COMERCIALES_BT_PLAN_01.md`, `docs/REGISTRO_IDEAS_PLANES.md`, `docs/BT_AUTH_01_LOGIN_ROLES_CORREO.md` y `docs/MATRIZ_ROLES_Y_PERMISOS.md`.


## Identidad gráfica definitiva — BT-BRAND-01 (14/11/2026)

El Director aprobó `bytetorque_icono_oficial_original.png` y `bytetorque_logo_horizontal_oficial_original.png`, conservados sin modificar en `assets/brand/originals/`. Esta aprobación sustituye las referencias anteriores a logos provisionales/pendientes; no equivale a registro legal de marca. **Nunca rediseñar, recolorear, deformar ni sustituir estos recursos por llaves, iniciales o dibujos procedurales.** Mantener los iconos funcionales de herramientas y navegación.

Usar `src/brand/BrandLogo.tsx`: horizontal original para superficies claras y `surface="dark"` con derivado de texto claro para fondos navy; sin tarjetas, fondos, padding, bordes ni sombras detrás del logo. Icono en espacios pequeños. La identidad comercial del taller y sus logos son independientes; los documentos llevan únicamente atribución discreta «Software ByteTorque», sin asignar BIOMOTORS a talleres nuevos. El generador Node publica derivados oficiales versionados y valida los hashes de todos los originales/derivados; nunca restaurar el generador provisional. Regeneración excepcional con `scripts/prepare-brand-assets.py`, sin sobrescribir originales, y nueva aprobación para cambiar el arte.

Preservar PWA `id`, `start_url`, `scope`, entrada R1 y seguridad. Maskable/adaptativo deben conservar el arte dentro de la zona segura, sin cortes. Los recursos Expo están preparados; no afirmar APK creada, app instalada ni paridad funcional Android. Sin cambios de Auth/RLS, backend, planes, datos o correos por integrar la marca. [Checkpoint BT-BRAND-01](docs/checkpoints/CHECKPOINT_BT_BRAND_01_20261114.md).


## BT-BRAND-02 — integración transparente (14/11/2026)

Por orden del Director, retirar el soporte blanco de BT-BRAND-01 en encabezados oscuros. Usar `BrandLogo surface="dark"` sobre navy, `surface="light"` para el original en superficies claras. No aplicar filtros CSS de inversión ni recolorear el símbolo. El derivado solo aclara los píxeles de texto «Byte» y «Gestión de Talleres»; el alfa y símbolo del PNG original se mantienen idénticos. Fuente y comprobaciones: `assets/brand/dark-variant.json`, `scripts/verify-dark-brand.py`. No modificar los originales, iconos PWA/favicon/adaptativos, identidad del taller ni A4 por este ajuste. Logo sin contenedores decorativos y sin desborde en tablet/móvil. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_BRAND_02_20261114.md). Pendiente aprobación visual del resultado por el Director; no habilita Auth/backend.


## BT-AUTH-01B-R1 — integración autorizada, activación apagada (14/11/2026)

La orden vigente [BT-AUTH-01B-R1](docs/BT_AUTH_01B_R1_ORDEN_IMPLEMENTACION.md), posterior al cierre A/B, autoriza exclusivamente login por contraseña, recuperación/validación de sesiones, logout y lecturas RLS de membresías/talleres con Supabase JS. Flag `VITE_BT_AUTH_R1_ENABLED` apagado por defecto; solo URL del proyecto `suxcqqnmcjoezfxltoms` y clave publishable. `getUser`, correo confirmado y membresía activa son obligatorios; no confiar en selector, metadata, URL ni permisos guardados. Owner/admin ven paneles vacíos; mechanic solo espacio técnico vacío; reception restringido. Rutas públicas de revisión explícitamente DEMO sin autoridad privada.

No modificar SQL/RLS, Edge, onboarding, registro, correo, invitaciones, pagos ni Android. No activar Auth al público ni iniciar R2 sin revisión del Director. Pruebas automatizadas R1 con mocks no sustituyen pruebas con cuentas reales. Configuración y pendientes: [guía Render](docs/BT_AUTH_01B_R1_CONFIGURACION_RENDER.md).
