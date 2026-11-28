# BT-MULTIPUNTO-FINAL-01B-DELTA-01

28/11/2026 · America/Santiago · Candidato exclusivo de corrección para revisión independiente.

Base incremental **3431c396c8dac53d1552a2549f7525e095f036ec**, árbol **e332060d437d1ba5fe73ac04a36a6006c0f9b0c3**. Base oficial conservada **7c877e72a3b6636d8b4ae131b3c0c2b5e5c064ba**. Entrega anterior **2736ad257aee597aa4d009f6ff957cdc7fc6889c**, carpeta BT-MULTIPUNTO-FINAL-01B.

Se reconstruyó el árbol 01B desde su diff y la base oficial en un índice temporal; se comprobaron los 46 snapshots SHA-256 y su objeto commit. Se trabajó sobre ese HEAD exacto, no sobre una reconstrucción funcional parcial. CANDIDATO.json del paquete identifica el nuevo commit, árbol y huella; delta.patch es exclusivamente 01B→delta. No aceptación oficial ni autorización productiva.

## RI-01 — Crédito de emisión directa

La UI conservaba crédito únicamente al recibir DRAFT_CONFIRMED y ocultaba errores de status con catch→null. Ahora status/refresh se reconcilian sin ocultar incertidumbre. `bt_mp_info` devuelve eligibleCredit únicamente si actor, sesión, épocas, snapshot, plan y vigencia actuales coinciden con el crédito confirmado. Tanto emisión directa como borrador recuperan esa referencia del servidor. Cada nueva operación consulta info y cada prepare vuelve a autorizar en SQL. Metadata local no concede acceso, no contiene bytes ni tokens y no dispara escrituras al montar.

Una emisión directa y el borrador auxiliar del mismo snapshot confirman una sola unidad. Los dos tipos conservan bytes separados: definitivo limpio y borrador marcado. Si un crédito que se mostraba elegible vence, el intento de cero unidades se detiene; no pasa automáticamente a una unidad. Si status o refresh fallan se mantiene la identidad pendiente. El status autorizado distingue NOT_PREPARED sin revelar jobs ajenos y calcula expiración efectiva sin escribir el estado. Ante una denegación conocida ocurrida antes de reservar, la UI consulta ese status, limpia solo la identidad no preparada y exige otra confirmación individual; una respuesta incierta no compra otra solicitud. Iniciar otra operación exige reconciliar antes el estado, o resolver el intento mediante reintento/recuperación/renovación explícitos.

## RI-02 — Consentimiento por identidad

Se reemplaza el booleano reutilizable como precondición por un consentimiento asociado al contexto y snapshot mostrado. Se consume sincrónicamente al asignar el UUID y maxAdditionalUnits de una operación nueva; paid queda false. Solo el mismo intento congelado conserva su consentimiento para reintentos iniciados por el usuario. Renovar un intento no consumido exige otro consentimiento explícito; recuperar su resultado usa el mismo UUID. Doble clic se bloquea por propietario de operación, sin depender del próximo render de React. Cambiar revisión/fuente, contexto o completar reconciliación elimina consentimiento disponible. No se transforma una promoción gratuita en cobro ante una denegación.

## RI-03 — Cadena asíncrona y denegaciones antiguas

run captura una instancia de contexto inmutable que contiene puerto, scope, orden, key de almacenamiento y epoch. refresh, save, finish, prepare, resume/renew, independent y visor reciben esa misma instancia. Cada continuación comprueba identidad antes de mutar estado o sessionStorage. Cleanup invalida la instancia, aunque la siguiente use el mismo key. Finalmente solo el propietario actual puede cambiar busy.

Se confirmó además una consecuencia en repository: una denegación antigua podía invalidar globalmente documentos antes de que el componente descartara la respuesta. El puerto acepta una cerca opcional de contexto; la comprueba después del HTTP y después del parseo de errores, antes de una invalidación global. Una denegación del contexto vigente sigue invalidando datos/visores/Blob URLs defensivamente. Los guards de sesión/taller/rol, documentFence y validación de PDF no se retiran. No se modifica Órdenes, PdfViewer, estilos R2 ni formularios/autoguardado del padre.

## RI-04 — Runtimes obligatorios de CI

La ausencia local produce BLOCKED_ENVIRONMENT con razón y sin descarga. CI=true o GITHUB_ACTIONS=true convierte ausencia de WebKit/Deno en FAILURE/exit 1. Ausencia de Playwright también falla; los filtros diagnósticos parciales están prohibidos en CI. No hay continue-on-error para validaciones. El workflow conserva los ejecutores obligatorios anteriores y añade los del delta.

El test Deno nativo importa el bundle original y el SDK npm fijado. Intercepta Deno.serve para capturar el handler y fetch mediante una allowlist HTTP sintética, sin modificar el entrypoint ni contactar producción. Comprueba OFF→503/0 bytes; READ ON/WRITE OFF; rechazos de writes sin RPC comercial, sesión, permiso, origen y campos desconocidos. Deno check, test nativo y reproducibilidad son obligatorios en CI. Deno/WebKit no están instalados localmente: no se declara su PASS; la ejecución nativa sigue pendiente.

## RI-05 — Instante de decisión y escritores

`charge_check_at` recibe un instante privado. bt_mp_complete lo captura con clock_timestamp después de locks de negocio, job y crédito y de la última autorización. Ese mismo t valida cuota/lease y fija documento.confirmed_at y el primer ledger.confirmed_at. Una promoción confirmada mantiene su timestamp original. El RPC público no recibe reloj del cliente; la función privada no es ejecutable por authenticated.

Al revisar escritores se reprodujo otro defecto del mismo alcance: bt_commercial_finish V1 podía confirmar la undécima solicitud multipunto al cruzar semana. Se añade exclusivamente a sus nuevas confirmaciones multipunto la misma cuota/expiración con reloj posterior al lock compartido de taller. Las ramas quote/email, identidad V1, guard contra créditos V2 y ACL se conservan. No se reescribe ninguna fila histórica por instalar el candidato. Su preflight exige la huella exacta del cuerpo 01B.

Las pruebas de semana usan timestamps sintéticos y una copia de laboratorio de la función con una única expresión de reloj sustituida. Las esperas son conexiones independientes y se observan con pg_blocking_pids; el test de expiración usa el RPC de producto sin modificar y reloj real. No se afirma haber esperado hasta un domingo real ni cambiado el reloj del host. Controlador y escritor se coordinan con locks y eventos, sin sleeps arbitrarios.

## Complementos confirmados y corregidos

- **Canonicalidad y crecimiento**: antes un crédito elegible podía crear múltiples jobs/artifacts de borrador con fechas PDF diferentes. Ahora se devuelve su primer job DRAFT_CONFIRMED canónico, incluyendo jobId en la respuesta. Repeticiones y peticiones concurrentes con UUIDs distintos no generan nuevos jobs, artifacts o consumos. Se preservan las generaciones antiguas de intentos no consumidos para recuperación; no se introduce limpieza de huérfanos.
- **Proyección**: snapshots nuevos MP-SNAPSHOT-2/PG17 y policy MP-V2-2 contienen solo campos usados, estados/notas e identidades de scope. No copian email/teléfono del cliente, opened_by, metadatos internos del taller o paths de logo. H_source se incorpora como digest dentro de H_snapshot para que podar campos no permita reutilizar una identidad de fuente distinta. El mapper acepta snapshots históricos V1 pero solo proyecta campos tipados. Límites de nota se miden por puntos Unicode como PostgreSQL char_length, sin truncar astrales válidos.
- **Lectura histórica**: límite técnico privado de 120 verificaciones/minuto por actor/taller, normalmente hasta 60 acciones HTTP por la doble revalidación. Devuelve MP_READ_RATE_LIMIT/429, separado de cuota comercial. No modifica consumo ni crea un ledger paralelo. Una fila por actor/taller, sin acumular una fila por petición/sesión/minuto. El archivo original permanece recuperable al terminar la ventana.

## Preservado

D01–D10, ledger único, Plus10/semana Santiago, Full sin límite comercial con antiabuso, ZIP=3, aislamiento, RLS/ACL existentes, snapshots y originales inmutables, GATE4 cuerpo/ACL, renderer borrador y visor compartido, producción y todas las entregas previas. No se modifican migraciones originales aprobadas: el SQL es un archivo incremental separado. No bucket nuevo ni despliegue, SQL alojado, correo/pagos/logos/registro, Mobile, DevOps, Auto-Deploy o SEC07.

## Limitaciones y dictamen

Validación local ejecutada PASS según MATRIZ.md. WebKit y Deno nativo BLOCKED_ENVIRONMENT, CI oficial pendiente; el adaptador Node no los sustituye. Auth/Storage de transporte son sintéticos; SQL y Chromium sí se ejecutaron realmente. No QA física ni validación alojada. Una denegación vigente sigue cerrando el visor; no se promete retirar archivos ya descargados legítimamente. Retención de staging/generaciones, WORM físico y custodia productiva conservan los límites de 01B.

Candidato preparado para revisión independiente. INDEPENDENT_REVIEW_PENDING, OFFICIAL_CI_PENDING y PRODUCTION_NOT_AUTHORIZED. PRIVATE_TRANSFER_PASS se acredita únicamente mediante recibos remotos de la nueva carpeta. La aceptación y la instalación requieren autorización posterior del titular.
