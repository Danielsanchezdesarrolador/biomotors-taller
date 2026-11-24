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
