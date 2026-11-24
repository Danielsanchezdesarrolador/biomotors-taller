## BT-EXP-01 — activación integral QA completada; recorrido humano pendiente (24/11/2026)

[Workflow WRITE 45510853216](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45510853216) SUCCESS en `09aa961f24c7aa2c435b486bbe4dddf8fd6c0b33`; log confirma bundle aprobado SHA256 idéntico, READ=true WRITE=true solicitados y deploy exclusivo bt-final-archive. Edge v4 ACTIVE verify_jwt=true. SQL read-only posterior: FLOW/REG ON y COM archive_read_enabled/archive_enabled true solo Taller ByteTorque de Pruebas; review/delivery false, cero objetos/manifiestos EXP. Lectura real PDF previamente confirmada por titular. Frontend ya LIVE en SHA 82c220111bad4e41f236041bf17983104155c250, no nuevo Render. **Próximo: recorrido QA ficticio completo, recepción → multipunto → emisión CP05 → declaración aprobación → ejecución → entrega → archivar → recuperar tres PDF tras nueva sesión.** Verificar aislamiento y persistencia, registrar aceptación antes de incorporar Ignacio. No repetir SEC07, SQL, CI ni activación; no correo externo ni datos reales; cero Codex. Job 138857883507: BT_EXP01_PREFLIGHT PASS, BT_EXP01_PACKAGE VERIFIED, SHA256 JS 2814d39bce8d66b30817c3b20a293e30eddcd7930c8db9553b210b71031f4bd2, BT_EXP01_FLAGS READ_TRUE_WRITE_TRUE_SET_REQUEST_SUCCEEDED, BT_EXP01_EDGE DEPLOY_COMMAND_SUCCEEDED. Edge v4 conserva hash de paquete alojado 9ad5e4f4226f9f5a6329a805f7d2653e7084f2631100749377696eb13aedc889 y ruta anterior según catálogo; no inferir causa, ni equivalencia entre hash JS y paquete. CP05 v7 y onboarding v8 conservan hashes, fechas y JWT, workflow no los redesplegó directamente. No lectura independiente de secretos ni verificación runtime WRITE hasta crear expediente. Frontend LIVE es evidencia previa, no redeploy ni consulta nueva a Render en esta etapa. QA completa y aislamiento JWT aún no aprobados. Sin operaciones de negocio realizadas por agente.

---

## BT-EXP-01 — lectura PDF real aprobada por titular, SQL escritura QA ON (24/11/2026)

El titular confirma «pude abrir el pdf correctamente» tras prueba de lectura alojada en frontend LIVE; evidencia humana de visualización, no se confirma descarga independiente ni QA A/B completa. Autorización integral vigente. Transacción protegida verificó taller QA y gates previos; actualizó exclusivamente archive_enabled=true para Taller ByteTorque de Pruebas c943ad51-6d90-447b-8aa7-68866f69a4bc. Resultado: qa_read_write_on=1, other_workshops_on=0, mail_or_review_on=0. Edge v3 todavía READ ON/WRITE OFF hasta ejecutar [workflow manual escritura QA](../../.github/workflows/bt-exp01-qa-write-manual.yml) con ACTIVAR_EXP01_ESCRITURA_QA. Derivado del workflow READ aprobado, exige mismo hash JS, JWT y recursos, cambia solo gates propios READ/WRITE a true; no modifica correo ni CP05. Frontend ya LIVE; no redeploy Render. **Siguiente: verificar workflow y Edge, luego recorrido QA ficticio integral y recuperación de los tres PDF.** No repetir aprobaciones ni usar datos reales de Ignacio. Cero Codex. Preflight: HEAD esperado, workflow READ blob d65fa80e38d2ac289455984db44d2abcddb932f0, Edge v3 ACTIVE JWT, FLOW/REG/COM una fila QA cada uno, cero manifiestos/objetos finales. SQL bloqueó las tres tablas rollout, exigió un solo taller autorizado, read=true write/review/delivery=false antes de UPDATE; afectó exactamente una fila. Sin cambios de registros de negocio. Nuevo workflow exige SHA256 JS 2814d39bce8d66b30817c3b20a293e30eddcd7930c8db9553b210b71031f4bd2. No se ha ejecutado aún; conector no admite workflow_dispatch. No certificar escritura real por activar gate; confirmar QA alojada posterior, persistencia, inmutabilidad y aislamiento. No repetir SEC07.

---

## BT-EXP-01 — QA lectura desplegada, LIVE-02/REG/CP06/EXP frontend LIVE (24/11/2026)

Autorización integral QA vigente. [Workflow READ 45499185022](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45499185022) SUCCESS, JS SHA256 idéntico al aprobado, Edge v3 ACTIVE verify_jwt=true, READ=true WRITE=false solicitados exitosamente. SQL solo taller QA: FLOW/REG/EXP lectura ON, archivo escritura/review/correo OFF, sin objetos/manifiestos nuevos. Render intento dep-dc30pmijnfac73aul010 rechazado por guarda CP06 ausente/OFF; se agregó únicamente dependencia VITE_BT_CP06_PRIVATE_ENABLED=true al merge autorizado sin quitar guardas, preservando COM preview/correo OFF. [Deploy corregido LIVE](https://dashboard.render.com/static/srv-dbqe4quc6qcc73f275jg/deploys/dep-dc30q1etlv9c73908s00) SHA `82c220111bad4e41f236041bf17983104155c250`, chunks FinalArchiveLoader, RecordsLoader, FlowLive02Panel y verificadores postbuild PASS. **Siguiente: propietario prueba en Clientes y vehículos → Expedientes anteriores · documentos originales → cotización existente → visualizar/descargar. Confirmar PDF real; luego habilitar escritura solo QA dentro de autorización ya otorgada, correo OFF.** UI flags globales, gates SQL por taller; otro taller puede ver entrada pero debe recibir denegación, aislamiento JWT aún por probar. No repetir SEC07 ni CI; cero Codex. Log workflow job 138817584618: BT_EXP01_PACKAGE VERIFIED, bundle SHA256 2814d39bce8d66b30817c3b20a293e30eddcd7930c8db9553b210b71031f4bd2, BT_EXP01_FLAGS READ_TRUE_WRITE_FALSE_SET_REQUEST_SUCCEEDED y BT_EXP01_EDGE DEPLOY_COMMAND_SUCCEEDED. Edge v3 hash paquete 9ad5e4f4226f9f5a6329a805f7d2653e7084f2631100749377696eb13aedc889 (no comparar con JS). Otras funciones conservan hashes/JWT y fecha de código aunque subió versión; sin redeploy directo. Sin lectura directa de secretos ni valores Render. Error exacto Vite: Final archive requires private directory, CP05 and CP06. Guardas previas demostraron CP03/CP05/CP04/Auth/CP05 docs true en ese build; se solicitó CP06 true, no reemplazar variables. Corrección LIVE 22:18:06Z con TypeScript/Vite y tres verificadores PASS; no modificar código ni base. Correo externo sigue fuera de alcance. No afirmar QA autenticada hasta prueba del titular.

---

## BT-EXP-01 — activación QA autorizada, SQL lectura ON y escritura OFF (24/11/2026)

Propietario autorizó integralmente LIVE-02/REG-01/EXP-01 gates SQL, Edge READ y WRITE en secuencia y frontend, exclusivamente Taller ByteTorque de Pruebas, correo OFF. Confirmado taller activo c943ad51-6d90-447b-8aa7-68866f69a4bc (2 managers elegibles, 3 OT, 1 revisión), taller B excluido. Transacción guardada insertó solo una fila por rollout FLOW, REG, COM; postflight independiente: FLOW/REG ON, archive_read_enabled true, archive_enabled/review_enabled/delivery_enabled false, 0 objetos/manifiestos EXP. **Siguiente: ejecutar workflow manual [lectura QA](../../.github/workflows/bt-exp01-qa-read-manual.yml) con ACTIVAR_EXP01_LECTURA_QA**, que exige el mismo hash JS aprobado, READ true WRITE false y redeploy solo bt-final-archive. Luego comprobar log y Edge JWT y habilitar frontend LIVE/REG/EXP (COM preview y correo OFF); validar lectura PDF existente con JWT real antes de escritura. Autorización integral ya otorgada; no volver a solicitarla para estas fases. No tocar otros talleres ni CP05. Cero Codex. La primera consulta multisentencia de preflight devolvió solo el último SELECT; consulta siguiente confirmó ambas identidades QA y B, sin error de datos. No se cambiaron registros de negocio. SQL transaccional con lock de las tres tablas y precondición rollout vacío; rollback ante discrepancia. Workflow derivado del original aprobado blob c2e0802257f6809c0ef6666e5344f7bcf33078d1, preserva empaquetador, recursos, verify_jwt y exige SHA256 JS exacto 2814d39bce8d66b30817c3b20a293e30eddcd7930c8db9553b210b71031f4bd2. La lectura alojada aún no se probó; Edge y Render no cambiados en esta etapa. COM review permanece OFF fuera del alcance. No declarar aislamiento real ni archivo completo hasta QA.

---

## BT-EXP-01 — frontend Render LIVE, módulos nuevos OFF solicitados (24/11/2026)

Autorización explícita de despliegue Render con módulos nuevos y correo OFF; confirmación posterior de My Workspace. Primer intento de actualizar variables rechazado por conector sin workspace seleccionado (sin modificación ni deploy); resuelto mediante confirmación del titular y workspaceId correspondiente. Actualización merge replace=false de VITE_BT_FLOW_LIVE_02_ENABLED, VITE_BT_RECORDS_PRIVATE_ENABLED, VITE_BT_FINAL_ARCHIVE_ENABLED, VITE_BT_COM_01D_PREVIEW_ENABLED y VITE_BT_CP05_EMAIL_ENABLED, todos false. No se reemplazó el conjunto de variables ni se solicitaron secretos. Conector no ofrece lectura independiente de valores efectivos; respuesta de actualización no permitió confirmar cada valor por separado. Render inició deploy al actualizar variables, por lo que NO se llamó trigger_deploy adicional.

Servicio biomotors-taller-demo, main, Auto-Deploy OFF comprobado durante build. Deploy [dep-dc30j63m8hqs73aivgag](https://dashboard.render.com/static/srv-dbqe4quc6qcc73f275jg/deploys/dep-dc30j63m8hqs73aivgag) confirmado LIVE para SHA `89ad25e3a6b81873b8ff3353aa44384c333a726d` a las 22:03:29Z. Checkout del SHA esperado, npm install, TypeScript/Vite PASS y postbuild PWA/identidad, exclusión de fixtures/grafo público, marca oscura PASS. Advertencia de tamaño de chunks >500 kB no bloqueante, Node 26.13.1 informado por Render conforme a engines >=22.12.0 (no se cambió runtime). El anterior SHA LIVE era a92e5c87bf351eeb55ea4754187cf4452cfe0ba8. No se relanzó CI, no se tocó Supabase, Edge ni datos, cero Codex. No se certifica QA navegador ni JWT real por build.

Siguiente: preparar activación gradual por taller QA autorizado, verificar flags necesarios con el titular si no hay lectura directa, autorizar cambios de gates SQL/Edge/frontend explícitamente; mantener correo externo OFF y no habilitar otros talleres. Prueba alojada ficticia de recorrido completo y aislamiento antes de Ignacio. No reinstalar migraciones, no repetir recuperación previa ni declarar DR integral.

---

## BT-EXP-01 — Edge alojada v1 ACTIVE, gates OFF (24/11/2026)

Propietario ejecutó manualmente y comunicó verde. Confirmación independiente: [workflow 45494935988](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45494935988), job 138802808113, y [CI general 45494618400](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45494618400), ambos SUCCESS para `c3accc6810624373edb397bd7914f0453f4aa66d`. Log real: BT_EXP01_PREFLIGHT: PASS; BT_EXP01_PACKAGE: VERIFIED; bundle SHA256 2814d39bce8d66b30817c3b20a293e30eddcd7930c8db9553b210b71031f4bd2; BT_EXP01_FLAGS: DISABLED_SET_REQUEST_SUCCEEDED; BT_EXP01_EDGE: DEPLOY_COMMAND_SUCCEEDED. Configuración explícita READ=false y WRITE=false antes del deploy; no lectura independiente de secretos ni prueba HTTP con JWT real aún. Supabase lista bt-final-archive v1 ACTIVE verify_jwt=true, entrypoint del run autorizado; ezbr_sha256 5f5cead32cce4bd460667e13f666448b3b5f74ad61b9ea2dfe74434922cd79ab (hash de paquete alojado, no comparar directamente con hash JS). CP05 y owner-onboarding aparecen v5/v6 frente a v4/v5 previas, con iguales hashes de paquete, fechas de actualización y JWT; workflow no ejecutó despliegues de esas funciones. No inferir causa del cambio de versión ni certificar runtime inalterado. No tocar esos servicios por esta observación.

SQL posterior read-only: 0 rollouts COM/FLOW/REG, 0 gates EXP o correo ON, 0 manifiestos y 0 objetos nuevos del bucket final. Render consultado: servicio biomotors-taller-demo, main, Auto-Deploy off, LIVE dep-dc2p4f3m8hqs7386htgg SHA a92e5c87bf351eeb55ea4754187cf4452cfe0ba8. No deploy frontend ni activación. Conector Render no ofrece lectura de variables; no afirmar inventario actual independiente. Siguiente autorización: despliegue manual del main validado (más cambios documentales), preservar flags vigentes de CP03/04/05/06, fijar módulos nuevos FLOW-LIVE-02/REG/EXP y COM preview OFF y correo frontend OFF, si se autoriza configuración; evitar despliegues duplicados. QA alojada controlada después, sin datos reales ni correo. Cero Codex. No repetir SEC07 ni SQL aprobado.

---

## BT-EXP-01 — despliegue Edge manual autorizado, pendiente de ejecución (24/11/2026)

El propietario autorizó publicar y desplegar únicamente bt-final-archive con JWT y READ/WRITE OFF. Se prepara [workflow manual](../../.github/workflows/bt-exp01-edge-manual.yml) sobre el empaquetador original, con Docker y CLI v2, verificación de manifest, hashes, recursos y configuración. Sin ejecución automática, sin Codex, sin modificación de CP05, SQL, Render, correo ni datos. El conector GitHub no permite iniciar workflow_dispatch; el titular debe ejecutarlo desde main con `DESPLEGAR_EXP01_APAGADO`. No declarar despliegue ni gates Edge configurados hasta verificar resultado alojado. SQL/bucket EXP-01 ya instalados OFF; no reinstalar. Después verificar versión/JWT y solicitar autorización independiente para deploy frontend OFF.

---

El nuevo workflow reutiliza el patrón de CP05 manual; limita el token existente al paso de despliegue, no imprime secretos ni cambia bindings CP05. El empaquetador y entrypoint conservan sus blobs aprobados. Se valida el paquete en runner antes de cualquier cambio alojado; la revisión estática no demuestra build o deploy. CI general sigue su filtro habitual para workflows nuevos. No repetir manualmente suites históricas.

---

## BT-EXP-01 — instalación SQL alojada y Storage, OFF (24/11/2026)

Autorización del propietario: «AUTORIZO BT-EXP-01 SQL, BUCKET Y POLÍTICA CON GATES OFF». Migración registrada: `20261124213926_bt_final_archive_private_off`. Fuente [SQL original](https://github.com/Danielsanchezdesarrolador/biomotors-taller/blob/8381fcf32a5ae816d28dfc542bda21ced1fd4ee4/docs/sql/BT_FINAL_ARCHIVE_CANDIDATE.sql), blob `3af03a87e413b2337920e5d0f183f36cd5f38315`. Aplicada una vez mediante migración transaccional con SET LOCAL lock_timeout 5s y statement_timeout 60s añadidos; sin alterar DDL ni contratos. Preflight confirmó HEAD y blob, tres migraciones prerrequisito, columnas necesarias, ausencia de instalación parcial y rollouts vacíos. Se mantuvo el respaldo S5B+Storage aprobado; no se repitió.

Postflight de catálogo: 3 columnas nuevas (archive_enabled y archive_read_enabled NOT NULL DEFAULT false; archive_manifest JSONB nullable), 5 funciones privadas definer y 4 wrappers invoker, search_path pg_catalog, 3 RPC de lectura/fuente authenticated y commit solo service_role, anon sin EXECUTE. 4/4 tablas COM con RLS+FORCE y sin grants directos a roles API, trigger de inmutabilidad activo y CHECK delivery_enabled IS FALSE conservado. Bucket bt-closing-documents privado, MIME application/pdf, límite 20.000.000 bytes, vacío; política bt_final_archive_backend_only RESTRICTIVE ALL TO anon,authenticated con USING y WITH CHECK excluyendo ese bucket. Bucket y política CP05 conservados. Conteos antes/después: clientes 3, vehículos 3, OT 3, cotizaciones 3, revisiones 1, objetos Storage 1, manifiestos 0. No se prueba igualdad íntegra de filas por conteos.

Gate OFF comprobado en transacción READ ONLY/ROLLBACK con identidad elegible existente de owner en claims SQL simulados, IDs ficticios y rol authenticated; 3/3 RPC catálogo/documento/fuente rechazadas SQLSTATE 55000. Commit como service_role con actor elegible también rechazado 55000. Marcador EXP_OFF_OWNER_SQL_CONTEXT_3_OF_3_AND_SERVICE_COMMIT_DENIED. No JWT real, no prueba HTTP/Storage efectiva, no creación ni activación. Asesor de seguridad: INFO RLS sin políticas en las cuatro tablas privadas COM, deliberadamente sin acceso directo; otros avisos del proyecto sobre funciones definer autenticadas y protección de contraseñas filtradas no se repararon ni se certifica auditoría integral. No abrir políticas permisivas por eliminar INFO.

Consulta previa de Edge: bt-cp05-documents v4 ACTIVE verify_jwt=true, bt-owner-onboarding v5 ACTIVE verify_jwt=true; bt-final-archive aún ausente. No se modificó Edge, Render, flags ni correo. LIVE Render permanece como referencia documental a92e5c87bf351eeb55ea4754187cf4452cfe0ba8, no verificado de nuevo en esta sesión. Cero Codex. Próximo: preparar paquete existente mediante scripts/package-final-archive.mjs y comprobar recursos/hash/config JWT; pedir autorización separada de Edge y configuración READ/WRITE OFF. Después deploy manual OFF y QA alojada ficticia por taller autorizado. No reinstalar migraciones ni repetir pruebas aprobadas. No declarar DR integral, paridad de permisos, recuperación alojada de Storage ni funcionamiento ON hasta evidencia correspondiente.

---

# BT-EXP-01 — archivo privado y recuperación del expediente final

24/11/2026, Chile. **Implementación y validación locales; sin push ni producción.**
Base `main`: `3a8dbe564658800aaffb2d0b68282069d79038e2`, también HEAD remoto
comprobado. El commit local contiene esta entrega y este checkpoint. BT-REG-01
sigue candidato verificado, no activado; SEC07/piloto y CP04 siguen cerrados,
selector CP05 aceptado. Auto-Deploy OFF. No nuevas ramas, servicios o entornos cloud.

## Resultado funcional y reutilización

Entrada **Expedientes anteriores · documentos originales** en el directorio CP03
privado, más acceso desde el historial CP06 de un vehículo. Roles owner/admin.
Búsqueda por cliente histórico, patente, vehículo o número; paginación de revisiones,
fechas e importes congelados, estado archivado/cancelado/anulado, vista previa PDF
y descarga de cada original. Incluye registros excluidos de los selectores operativos.
El directorio/historial se conservan montados; no sustituye borradores ni navegación R2.

- Cotización: bytes originales de la revisión CP05, no el borrador actual.
- Informe/constancia: primera generación desde evidencia inmutable LIVE-02,
  archivada y comprobada; después siempre se recuperan esos bytes originales.
- Se reutilizan `archiveClosingCandidate`, `closingDocumentPdf`, snapshots CP05,
  tablas COM-01C, y navegación CP03/CP06. No se reconstruye emisión ni el historial.
- El informe y constancia conservan su naturaleza de declaraciones del taller;
  archivar no los convierte en firma, factura, pago ni prueba física independiente.
- Una revisión antigua sin PDF final archivado muestra solo la cotización disponible.
  Ausente/corrupto/no autorizado nunca se sustituye por generación actual.
- En el modo nuevo, los callbacks heredados de generar copias/ZIP al consultar
  CP06 quedan deshabilitados: el acceso a originales utiliza el archivo persistido.
  No se altera el formato oficial CP04 ni el diseño de los documentos.

## Backend candidato y SQL

`docs/sql/BT_FINAL_ARCHIVE_CANDIDATE.sql`, transaccional y **no idempotente**.
Prerrequisitos: CP03, CP04, CP05, LIVE-02 y COM-01C existentes/candidatos autorizados.
No se aplicó al proyecto alojado. El laboratorio carga solo sus DDL previas, no
repite auditorías/aceptaciones anteriores.

Reutiliza `bt_com_private.closing_manifests` y sus FK/trigger inmutable; añade
`archive_manifest` nullable. No promueve manifiestos antiguos incompletos ni hace
backfill. Añade a `bt_com_private.rollout` `archive_enabled` y
`archive_read_enabled`, ambos false por defecto y sin habilitar talleres.

El bucket candidato `bt-closing-documents` es privado, PDF, máximo 20.000.000 bytes.
Política restrictiva `bt_final_archive_backend_only` deniega DML directo a
anon/authenticated incluso si existe otra política permisiva. No se modifica el
bucket CP05 ni se conceden permisos del ledger a los clientes.

RPC públicas invoker: `bt_final_archive_catalog`, `bt_final_archive_document`,
`bt_final_archive_source` para autenticados; `bt_final_archive_commit` solo para
service_role. Funciones privadas autorizan usuario confirmado, membresía activa,
taller activo, owner/admin y gate; los argumentos actor no permiten suplantación.
Commit revalida fuentes, identidad, versión, rutas canónicas, hashes/tamaños y
metadatos de Storage. Reutiliza UNIQUE por taller/revisión/entrega y request.
FK existentes impiden destruir las dependencias documentales con BT-REG-01.

`finalArchivePorts` es el adaptador SDK concreto: cliente JWT y cliente backend
separados, subida `upsert:false`, comprobación de lectura posterior, hash/tamaño,
revisión de permisos antes de entregar bytes. Los requests HTTP aceptan IDs/tipo,
no rutas de Storage, importes, nombres ni credenciales del navegador.
`finalArchiveHandler` limita cuerpo, origen/método y responde errores sanitizados,
no-store, PDF/nosniff. No registra peticiones, SQL, tokens ni filas.

El paquete Edge **bt-final-archive** se prepara offline con el empaquetador derivado
del oficial CP05, versiones npm fijadas, fuente/logo/licencia y hashes íntegros,
`verify_jwt=true`, recursos estáticos. No se registra en el config alojado ni se
despliega. El gate de lectura independiente permite conservar descarga al apagar
creación. Código de cliente/servidor descarta respuestas y bytes de contexto inválido.

Incidencias de integración resueltas:

- JSONB cambia el orden de claves: comparación canónica de todos los campos del
  manifiesto, conservando orden de arrays y rechazo de contenido diferente.
- Fecha de modificación PDF se fija al instante histórico, igual que creación:
  render inicial determinista para nombres por hash y escrituras concurrentes.
- Un lector que encuentra un objeto en curso puede fallar cerrado y reintentar;
  el reintento converge al único manifiesto sin sobrescribir ni regenerar el final.
- El doble Storage de pruebas se aísla por laboratorio para no reutilizar objetos
  de otra corrida; procesos de navegador asíncronos permiten atender el puente HTTP.
  Se corrigió también un UPDATE del fixture que alteraba otra cotización ficticia.
  No se cambió una guarda ni una aserción de negocio para ocultar esos fallos.

Storage y PostgreSQL no forman una transacción distribuida: un fallo antes del
commit puede dejar objetos privados sin referencia. No se borran automáticamente;
requieren conciliación autorizada. No se promete exactly-once de objetos físicos.
Los manifiestos visibles son únicos e inmutables; reintentos completados verifican
originales y no cargan fuentes ni generan/suben nuevos PDF.

## Respaldo y recuperación: bytes además de PostgreSQL

Se incorpora `scripts/backup/final_archive_storage.py` y el inventario SQL readonly
`final_archive_inventory.sql`. El workflow de respaldo vigente continúa siendo
PostgreSQL: **no ejecuta aún el sidecar de Storage** y no constituye por sí solo
respaldo suficiente de este expediente. No se modifica el código ni el alcance aprobado de SEC07; su guía de recuperación
recibe un anexo documental, sin repetir sus pruebas ni cambiar el workflow.

El inventario se obtiene del **mismo respaldo de DB elegido**, restaurado en el
laboratorio aprobado o bajo un corte consistente autorizado. Incluye todas sus
revisiones CP05 y referencias COM, no solo los documentos del expediente abierto.
El SQL soporta también un respaldo previo sin tabla COM: inventaría solo CP05.
Usar como `recovery_set_id` el SHA-256 del artefacto cifrado de DB en el registro de
custodia. No publicar inventarios ni comprobantes de clientes en el repositorio.

El sidecar:

1. Valida inventario/taller, rutas canónicas, unicidad, límite, sobre PDF y SHA-256.
2. Lee un objeto a la vez; envía el flujo de manifiesto/bytes directamente a GPG,
   sin ZIP/dump intermedio en claro. Solo importa una clave pública verificada en
   keyring efímero; la clave privada de descifrado permanece fuera del exportador.
3. Crea ciphertext exclusivo 0600, sin sobrescribir backups, más recibo con hashes,
   identificador de conjunto y conteo. Esos comprobantes no contienen fichas/credenciales.
4. La exportación real está bloqueada salvo autorización/configuración explícitas
   `BT_STORAGE_EXPORT_AUTHORIZED=true`, URL oficial fijada y credencial backend
   `BT_STORAGE_BACKUP_TOKEN`. No se aceptan redirects que puedan reenviar esa credencial.
   No se han configurado secretos ni se ha llamado este modo con datos alojados.
5. Restauración: primero verificar/descifrar el respaldo DB por SEC07 en aislamiento;
   derivar su inventario esperado, descifrar sidecar por pipe desde custodia del dueño
   y comparar exactamente inventario/conjunto antes de escribir objetos.
6. `verify_snapshot` admite restauración solo explícitamente aislada y con lectura
   de comprobación, sin sobrescribir; el CLI exige un directorio nuevo fuera del repo.
   Archivo incompleto, sobrante o hash distinto no produce recibo de éxito. Puede
   quedar un destino aislado parcial tras interrupción; nunca se promueve a producción.

El modo `verify --encrypted-file` ejecuta GPG solo en el PC del dueño mediante
pipe binario interno y comprueba también su salida final; evita el pipeline de
texto de PowerShell 5.1. No se exporta una clave privada ni se instala en el runner.
No usar `gpg | python` como transporte binario en PowerShell antiguo.

Ejemplo futuro, **no ejecutado contra producción**:

```sh
# En el entorno autorizado, inventario privado de la DB elegida; no imprimirlo en chat/logs.
psql -X -qAt -v ON_ERROR_STOP=1 -v workshop_id=UUID_TALLER -v recovery_set_id=SHA256_DB_CIFRADA \
  -f scripts/backup/final_archive_inventory.sql > /custodia-privada/inventory.json
# Credenciales solo por bindings seguros del runner; no por argv ni archivos del repo.
python scripts/backup/final_archive_storage.py export --inventory /custodia-privada/inventory.json \
  --public-key /publica/recipient.asc --recipient HUELLA_PUBLICA_APROBADA --output /salida-privada/storage.gpg
# Solo en PC del propietario; la clave privada no sale de su custodia.
python scripts/backup/final_archive_storage.py verify --encrypted-file /custodia-privada/storage.gpg \
  --inventory /custodia-privada/inventory.json --isolated-directory /nuevo-destino-aislado
```

Guardar únicamente sidecar cifrado y comprobante autorizado en el almacenamiento
privado ya aprobado, usando su adaptador/validación de destino; no cambiar OAuth,
carpeta ni subir nada en esta entrega. Debe reconciliarse el conjunto DB+objetos y
abrir sus PDF antes de declarar recuperación. Una subida real a Storage en desastre
requiere autorización, destino aislado y reconciliación de metadatos/bytes; este
ensayo local no certifica API Storage alojada ni DR integral de Auth/Edge/otros buckets.

## Validación consolidada y límites

- **21/21** pruebas focalizadas nuevas de metadatos, bytes, rutas, contexto, sesión,
  clasificación de errores, límites HTTP y gates. Sin suites históricas generales.
- Laboratorio PostgreSQL 17 `--network none`, roles/RPC reales y objetos en filesystem:
  comprobaciones de permiso, suplantación, taller ajeno, inmutabilidad, dependencias,
  dos escritores/reintento, corrupción/ausencia, revocación y nueva sesión.
- Navegador con componente/repositorio/handler reales a través de puente loopback:
  originales de revisión 1 conservan nombre/$179 pese a nombre actual/cambio de
  estado y revisión 2/$298; tres descargas con SHA, visor nativo, recarga, expediente
  nuevo, respuesta perdida después del commit y reintento con el mismo ID; denegación
  elimina datos/controles. Tres vehículos ficticios en dos talleres; no clientes reales.
- **10/10** pruebas Python: GPG real con claves efímeras de QA separadas, CLI de verificación/descifrado
  con transporte binario interno (ensayo Linux; Windows físico pendiente), exportador
  usando solo pública, rechazo de corrupción/conjunto/destino/privada y restauración
  aislada de **7 objetos PDF reales generados para el fixture**, byte a byte con hashes.
- Builds público OFF y privado ON PASS, typecheck y límites de bundle/fixtures.
  Empaquetado Edge offline con recursos/JWT PASS; no ejecución Edge en Supabase.
- Chromium 1366/768/390 sin desborde; capturas desktop/tablet/mobile y visor inspeccionadas.
  El render del visor es nativo del navegador; Safari/iPhone/Android físicos quedan
  para QA autorizada. Un sobre/hash PDF no es un análisis de malware.

Prerrequisitos locales: Node/paquetes ya instalados, PostgreSQL 17 en Docker,
Chromium, Python 3.11+ y GPG. No se instalaron herramientas ni dependencias nuevas.

Comandos de esta entrega:

```sh
npx vitest run src/expedientes/archive.test.ts
BT_FINAL_ARCHIVE_EVIDENCE_DIR=/tmp/bt-exp-evidence bash scripts/security/verify-final-archive-local.sh
node scripts/package-final-archive.mjs /tmp/paquete-nuevo-fuera-repo
```

Evidencia ficticia fuera del repo: `/workspace/work/final-archive/`, capturas
`desktop.png`, `tablet.png`, `mobile.png`, `preview-desktop.png`,
`archive-confirmed-mobile.png`; logs de validación fuera del repo. Los laboratorios
se retiran al cerrar; no se agrega `artifacts/` preexistente ni PDFs/claves/respaldos a Git.

## Activación futura: permisos concretos pendientes

1. Aprobación funcional/visual del propietario y permiso de publicación en main/CI.
2. Respaldo SEC07 actualizado/verificado, **incluidos los objetos privados existentes**;
   acordar sidecar/conjunto/custodia sin asumir que el dump contiene Storage.
3. Permiso específico para prerrequisitos SQL no instalados (LIVE-02/COM-01C), nuevo
   SQL/bucket/política. Inventariar estado para no repetir migraciones. Instalar
   LIVE-02 antes de las guardas opcionales BT-REG-01 o incorporarlas por el procedimiento
   aprobado antes de habilitar sus operaciones. BT-REG-01 no se activa por esta entrega.
4. Permiso para desplegar solo `bt-final-archive` con JWT y recursos verificados,
   `BT_FINAL_ARCHIVE_READ_ENABLED=false`, `BT_FINAL_ARCHIVE_WRITE_ENABLED=false`.
   Reutilizar bindings backend custodiados; nunca incluir service_role en VITE.
5. Despliegue frontend manual con `VITE_BT_FINAL_ARCHIVE_ENABLED=false`; después,
   autorización piloto para lectura por taller (`archive_read_enabled`) y Edge READ,
   luego compilación ON; habilitar WRITE/`archive_enabled` solo si se autoriza creación.
6. QA alojada ficticia: JWT real, Storage privado, A/B/roles, todas las revisiones,
   recuperación en otra sesión y del conjunto DB+Storage, y aceptación. Sin correo real.

Para contener: apagar creación (`archive_enabled`/Edge WRITE) conservando lectura
si corresponde; no borrar ledger/objetos ni usar nuevas fuentes para regenerar.
Conservar guardas BT-REG-01: no apagar sus protecciones como rollback improvisado.
No retirar columnas/esquema con datos históricos ni hacer restauración global ciega.

## Toolkit consultado y reutilización acotada

Repositorio privado `Danielsanchezdesarrolador/development-toolkit`, consultado
solo en lectura, corte `de464f789abd850d551328b45a147a6a8c81c277`:
`AGENTS.md`, `README.md`, `04-desarrollo/documentos-y-correo.md`,
`04-desarrollo/persistencia-y-conciliacion.md`, `03-respaldos/recuperacion-supabase-pg17.md`
y `08-testing/estrategia.md`. Se reutilizan patrones de bytes originales, hash/readback,
idempotencia, conciliación y evidencia por entorno; el código fuente de esos
patrones ya reside en ByteTorque. No se copian scripts históricos, secretos ni
contenido privado del toolkit al bundle, ni se modifica su repositorio.

## Archivos exactos de la entrega local

- `.env.example`
- `AGENTS.md`
- `agent.md`
- `docs/checkpoints/CHECKPOINT_BT_EXP_01_ARCHIVO_PRIVADO_20261124.md`
- `docs/recovery/BT_SEC07_S4B_R8_SOLUCION_Y_PREVENCION_20261123.md`
- `docs/sql/BT_FINAL_ARCHIVE_CANDIDATE.sql`
- `roadmap.md`
- `scripts/backup/final_archive_inventory.sql`
- `scripts/backup/final_archive_storage.py`
- `scripts/backup/test_final_archive_storage.py`
- `scripts/build-final-archive-lab.mjs`
- `scripts/package-final-archive.mjs`
- `scripts/security/verify-final-archive-local.sh`
- `scripts/verify-final-archive-browser.cjs`
- `scripts/verify-official-bundle.mjs`
- `server/com/closingArchiveCandidate.ts`
- `server/com/finalArchiveEntry.ts`
- `server/com/finalArchiveHandler.ts`
- `server/com/finalArchivePorts.ts`
- `server/cp05/archiveCandidate.ts`
- `src/clientes/Cp03PrivatePanel.tsx`
- `src/cp05/pdfEnvelope.ts`
- `src/entrega/finalPdf.ts`
- `src/expedientes/FinalArchiveLoader.tsx`
- `src/expedientes/FinalArchivePanel.tsx`
- `src/expedientes/archive.test.ts`
- `src/expedientes/contracts.ts`
- `src/expedientes/finalArchive.css`
- `src/expedientes/repository.ts`
- `src/historial/VehicleHistory.tsx`
- `tests/finalArchiveLab.ts`
- `tests/fixtures/finalArchive.ts`
- `tests/harness/FinalArchiveFixture.tsx`
- `tests/harness/main.tsx`
- `vite.config.ts`

## Publicación autorizada y aprobación visual — 24/11/2026

El propietario aprueba visualmente `d8101c90b408815629c1e78030d540f01f9741f6`
y autoriza publicación/CI exclusivamente. Publicado en main mediante integración
`7ebcdf4ddefe509da7c4143a101c03cfe644769f`, conservando íntegro el commit
`4bfd8246b74ac07bacf396980d3feb43d038b3f5` y sus reglas de cuota.
Se conciliaron únicamente inserciones documentales concurrentes en AGENTS.md,
agent.md y roadmap.md; ningún cambio funcional adicional ni prueba local repetida.

CI: consultas al conector GitHub para ese SHA devuelven `workflow_runs: []`
y `statuses: []`. **Sin ejecución registrada observable; no equivale a éxito.**
No se relanzó ninguna CI. El CLI local informa autenticación inválida y el
acceso HTTP directo a la API devuelve 403; no se cambian credenciales.
Pendiente confirmar aparición/ejecución de las CI correspondientes en GitHub.

Todos los nuevos interruptores permanecen OFF. BT-REG-01 y BT-EXP-01 pendientes
de activación productiva. Sin SQL, Storage, Edge, respaldos, correo ni Render.

## BT-EXP-01 — cierre de publicación y CI informada por el propietario (24/11/2026)

**Candidato publicado, validado localmente y CI SUCCESS según confirmación del propietario; NO operativo en producción.** Aprobación visual otorgada para `d8101c90b408815629c1e78030d540f01f9741f6`; integración funcional `7ebcdf4ddefe509da7c4143a101c03cfe644769f`; publicación documental previa `9b34c4d6357d2dce385be6c7e87b8d34268f8c02`. Captura de Actions del propietario mostró las cinco ejecuciones de ese SHA: Verificación ByteTorque #642 y BT-REG-02 #43 SUCCESS; BT-COT-01 #39, BT-FLOW-01 #62 y BT-OFICIAL-01A #362 en curso. El propietario confirmó posteriormente «TODO VERDE». Se registra la confirmación sin atribuir una consulta independiente de los resultados finales: el conector no enumera las ejecuciones push y no se dispone de sus IDs. No relanzar suites aprobadas por esta confirmación ni declarar CI específica del archivo que no figure en evidencia.

**Pendiente productivo:** BT-REG-01 y BT-EXP-01 siguen desactivados. Desde PC personal del propietario, respaldo SEC07 actualizado/verificado y cobertura de objetos privados de Storage mediante conjunto DB+sidecar conforme al checkpoint; revisar prerrequisitos LIVE-02/COM-01C y secuencia de BT-REG-01 antes de autorizar SQL/bucket/Edge por separado, despliegue OFF y posterior activación gradual con QA ficticia alojada y aceptación. No asumir que el respaldo de PostgreSQL cubre bytes de Storage. Validación sintética previa no certifica recuperación real ni iPhone físico. SEC07 y CP04 cerrados en su alcance; selector CP05 aprobado. Render conserva el último LIVE observado `a92e5c87bf351eeb55ea4754187cf4452cfe0ba8` y Auto-Deploy OFF. Sin autorización para SQL, Storage, Edge, flags, respaldos reales, correo, datos ni despliegue. Repo público temporal autorizado; trabajar solo en main. Mantener reglas de cuota y no iniciar una nueva entrega sin aprobación.



## Respaldo previo a integración: S5B recuperado, Storage pendiente — 24/11/2026

El titular ejecutó el acceso directo manual existente de S5B en su PC personal. Resultado comunicado BACKUP_AND_TOC_VALIDATED; SHA-256 y tamaño coinciden con los campos específicos del manifiesto. No se publica ruta de custodia, hash del dump ni datos privados. El nuevo archivo no es v04.

Incidentes de las instrucciones del asistente y prevención:
- PowerShell 5.1: foreach ($home in ...) chocó con $HOME de solo lectura, porque las variables no distinguen mayúsculas/minúsculas. Usar nombres no reservados.
- Exploración repetida de keyrings: mensaje de gpg-agent «socket file removed - retrying binding» en stderr convertido por PowerShell en NativeCommandError con ErrorActionPreference Stop. No prueba fallo criptográfico; evitar explorar almacenes por rutina. Seleccionar GNUPGHOME de custodia conocido y validado; no crear/importar claves.
- Adaptación innecesaria de R8: BT_LAB READY, BT_GPG PASS, RESTORE_OR_INVENTORY_NOT_COMPLETE sin código de pg_restore visible. Causa exacta no determinada: la adaptación no conservó diagnósticos de la fase fallida y fue limpiada. No atribuir daño al dump ni repetir esa adaptación.

**Solución efectiva comunicada por el titular:** localizar y leer el ejecutor LOCAL existente scripts/backup/sec07_s5b_restore_new.py (no disponible en main remoto al consultar). No es CLI: su función restore_new(cipher, manifest) delega a sec07_s4_local.main con source_binding S5B_NEW_ONLY y opciones --compatible --bootstrap-lab. Invocarla desde Python local con -I -B, ruta de imports explícita y el ciphertext/manifiesto de esa ejecución, sin modificar archivos fuente ni usar v04. El callback usa su contrato y validación originales. GNUPGHOME de custodia existente. Marcadores devueltos: archive_content_verified=true, docker_cleanup_verified=true, source_unchanged=true, security_parity_certified=false. **PASS de recuperación del contenido del respaldo nuevo; no paridad de owners/ACL ni DR integral.** No repetir restore por rutina; conservar ejecutores locales y recuperar su fuente sanitizada con permiso separado si se necesita. No asumir que la verificación actualiza automáticamente el manifiesto original.

Inventario agregado alojado consultado en transacción READ ONLY después del respaldo: un bucket privado CP05, un objeto, una revisión y cero referencias ausentes; COM todavía no existe. Esta lectura no demuestra identidad temporal con el dump; derivar inventario del archivo elegido antes de vincular y cifrar bytes de Storage. No se ha respaldado Storage aún. No migraciones, despliegues, flags ni correo; SEC07 mantiene su cierre inicial. Próximo paso exclusivo: completar sidecar y verificación, sin reconstruir restaurador ni repetir comprobaciones aprobadas.


## Storage: recuperación de bytes y recibo verificados — 24/11/2026

El titular ejecutó el asistente local de Storage para el único PDF CP05. Se verificó la fuente existente de BT-EXP-01 por blob fijado y se extrajo el inventario de la tabla quote_revisions del **mismo** dump S5B, mediante pg_restore sin servidor ni nueva restauración de la base. La exportación produjo el sidecar cifrado pero reportó FileNotFoundError en EXPORT y no creó el recibo. Se observó ruta de ciphertext de 247 caracteres; añadir .receipt.json alcanza 260 caracteres, hipótesis compatible con el límite tradicional Windows MAX_PATH, no causa forense confirmada. No reexportar ni solicitar de nuevo credenciales ante ciphertext existente.

Solución efectiva: verificador local reutiliza extractor y módulo fijados, coteja inventario exacto de DB, descifra sidecar en memoria, verifica bytes/hash/tamaño del PDF, integridad de ambos respaldos y escribe/lee recibo con nombre corto storage.receipt.json sin sobrescribir. Evidencia del titular: PINNED_SOURCE_OK, ONE_PDF_FROM_EXACT_DB_BACKUP, VERIFIED_ONE_PDF_BYTES_IN_MEMORY, RECEIPT VERIFIED, PDF_OPEN NOT_TESTED, RESULT PASS_BYTES_ONLY. **PostgreSQL recuperado y único PDF privado referenciado verificado a nivel de bytes**. Apertura visual aún pendiente; no afirmar restauración de Storage alojada ni DR integral. Conservar juntos ciphertexts y manifiestos/recibo en custodia privada, sin publicar hashes/rutas ni datos. Los dos asistentes locales no están publicados como herramientas universales; preservar originales sanitizados mediante autorización posterior. No se repitió exportación ni se modificó producción. No iniciar migraciones hasta cerrar apertura y obtener autorización específica.

## Respaldo previo a integración — PASS de alcance acordado (24/11/2026)

El propietario confirmó «PDF correcto» tras abrir localmente el original recuperado del sidecar cifrado. Con los resultados previos S5B (integridad, contenido restaurado, fuente intacta, limpieza) y Storage (inventario del mismo dump, único PDF CP05, bytes/hash y recibo verificados), se cierra el requisito de respaldo previo para el alcance documentado, sin declarar paridad completa de seguridad ni DR integral. No repetir el respaldo ni sus verificaciones por rutina; si cambian los datos antes de la migración, evaluar vigencia del conjunto. Custodia privada; no publicar datos, rutas ni secretos.

Próximo paso: inventario puntual de prerrequisitos alojados en solo lectura y propuesta exacta de migraciones/Edge/flags. Solicitar autorización específica antes de cada cambio productivo; no habilitar correo ni tocar datos reales. SEC07 conserva su cierre inicial; BT-REG-01 y BT-EXP-01 siguen candidatos pendientes de activación. Auto-Deploy OFF, main único. 


## Continuidad operativa y lecciones de la sesión 24/11/2026

Estado al traspaso: SQL FLOW-LIVE-02, REG-01 y COM-01C instalados y verificados OFF; EXP-01 candidato publicado/CI reportada SUCCESS, SQL/bucket/Edge todavía no instalados. Producción frontend conserva última versión LIVE CP05 selector, `a92e5c87bf351eeb55ea4754187cf4452cfe0ba8`. Próximo trabajo exclusivo: BT-EXP-01, revisión exacta de candidato y solicitud de autorización SQL/bucket/política. No activar ni desplegar por una orden de continuidad documental. No repetir los pasos ya realizados.

Registro consolidado, sin duplicar procedimientos históricos:
- GitHub Actions: CLI Codex sin autenticación válida/API 403; conector sin enumeración de runs push. Confirmar en Actions por captura/IDs del titular; 5/5 verdes reportados, no atribuir verificación independiente. Ver cierre de publicación de este checkpoint. No relanzar CI por falta de visibilidad.
- BT-REG-01: selector de QA .cp03-pilot duplicado en wrapper; clase externa renombrada a cp03-private-panel y dos selectores CSS ajustados, sin debilitar prueba. Ver guía BT_REG_01 y checkpoint REG-01.
- SEC07 históricos: BOM/flujo binario, extensiones, roles, bootstrap, espera, permisos y alcance de restauración documentados en guía R8 y checkpoint CLOSE_A; no repetir. Ver Development Toolkit, guía recuperación PG17.
- S5B actual: HOME reservado, stderr de GPG tratado como excepción y adaptación R8 sin diagnóstico. Solución verificada: callback local sec07_s5b_restore_new.restore_new(cipher,manifest), no CLI, con GNUPGHOME de custodia conocido. Ver registro anterior y DTK-ERR-054. No volver a explorar keyrings ni reconstruir restaurador; localizar ejecutor local antes de diseñar cambios. Los archivos locales S5B no están disponibles en main remoto.
- Storage: exportación produjo ciphertext pero falló el recibo; ruta larga Windows probable (247+13), no causa demostrada. Verificar ciphertext existente antes de reintentar, recuperar inventario del mismo dump, usar recibo corto, verificar bytes y apertura. PASS_BYTES_ONLY seguido de «PDF correcto» del titular; no volver a pedir token, descargar, restaurar DB ni sobrescribir. Ver registro anterior de este checkpoint. Los asistentes de Storage entregados al titular deben conservarse de forma privada; no se afirma que estén versionados en GitHub.
- EXP-01 laboratorio: orden de claves JSONB, fecha PDF determinista, reintentos de objetos en curso, Storage ficticio aislado, puente HTTP asíncrono, fixture UPDATE corregido: ver incidencias de integración de este checkpoint; no repetir ni relajar pruebas.
- Migraciones de hoy: FLOW `20261124213015`, REG `20261124213211`, COM `20261124213414` aplicadas exitosamente, sin reintentos. Los gates OFF fueron comprobados en SQL simulado, no JWT real. No hay aceptación funcional alojada ON ni de Ignacio.

Documentación previa conserva sus fechas y alcance histórico. Las secciones superiores vigentes prevalecen sobre estados antiguos. El titular está en su PC personal, usa Windows PowerShell 5.1, Python y Docker; no pedir claves/rutas privadas en el chat. Reutilizar pruebas y herramientas, no abrir otra auditoría. ChatGPT dirige y verifica con conectores; Codex exclusivamente ejecución local que lo requiera, una validación consolidada. Ante fallo, parar y recuperar evidencia/contrato antes de reintentar.
