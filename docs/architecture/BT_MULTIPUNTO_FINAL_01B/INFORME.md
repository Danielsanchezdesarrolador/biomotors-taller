# BT-MULTIPUNTO-FINAL-01B — Candidato para revisión independiente

28/11/2026 · Base `7c877e72a3b6636d8b4ae131b3c0c2b5e5c064ba`, árbol `66e180780a0c2ca1af65ab35b8a26c29f44525f1`.
Arquitectura aprobada: [01A, transferencia d6ac2559](https://github.com/Danielsanchezdesarrolador/bytetorque-review/tree/d6ac2559b6f2f5b78cec5c6271c2f10b182c3be2/BT-MULTIPUNTO-FINAL-01A); candidato documental `307677653324bfde7a2ac7a955df61c94366ae1d`. Autorización: instrucción 01B y aceptación expresa D01–D10 con condiciones adicionales del titular. No se infiere una autorización productiva.

## Diagnóstico y solución

El multipunto anterior entrega exclusivamente un resumen marcado mediante V1. No existía un original definitivo de inspección; el expediente ZIP mantiene tres originales distintos. Reutilizar directamente la caché V1 para un PDF limpio habría confundido crédito, autorización temporal y original histórico.

La implementación introduce un endpoint separado `bt-multipunto-documents` versión 2, siete RPC públicas con privilegios mínimos y tablas privadas RLS enabled/forced. `control` instala lectura/escritura/recuperación OFF. No crea el bucket ni habilita servicios al instalar el núcleo. El bucket privado tiene candidato separado. La emisión final no se genera en navegador; un servicio confiable recibe únicamente snapshots SQL autorizados, verifica assets, genera el A4 y publica solo tras archivo verificado.

Se conserva el único ledger `bt_commercial_private.consumption`. Las tablas propias enlazan ese ledger y no cuentan cuotas paralelas. Básico recibe metadata autorizada, nunca bytes multipunto. Plus conserva diez solicitudes por semana Santiago; Full conserva 500/hora de antiabuso, sin límite comercial. Reservas activas ocupan capacidad; solo confirmaciones consumen. La cuota se revalida con reloj real después de locks. Los cambios de plan/membresía/rollout/taller incrementan épocas, incluyendo ABA.

La compatibilidad V1/V2 requiere un endurecimiento aditivo de tres RPC antiguas: reserve, finish y cached rechazan IDs registrados como créditos V2. Se comprueba MD5 de los cuerpos instalados antes de añadir únicamente esa barrera; CREATE OR REPLACE conserva propietarios/ACL. Los IDs V1 siguen por el contrato existente. No se modifica ninguna definición o ACL GATE4. Los originales limpios nunca entran en `document_bytes`; borradores V2 mantienen el renderer marcado aprobado.

## Identidades y consistencia

- H_source: hash UTF-8 del jsonb PostgreSQL 17 de orden, vehículo, cliente, taller, perfil e historial ordenado por fecha/UUID.
- H_snapshot: hash de la representación jsonb textual versionada; contiene 34 componentes, notas completas, observaciones adicionales, digest del historial y registro inmutable de plantilla/assets. El endpoint no acepta snapshots ni hashes PDF suministrados por el navegador.
- creditId: UUID del ledger único. issueRequestId: UUID distinto e idempotente del intento. documentId y revisión: asignados por SQL. H_pdf: digest de los bytes canónicos ganadores, no identidad de una renderización local.
- La conversión exige actor/sesión/épocas/H exactos, crédito confirmado V2 todavía vigente, sin adopción ajena. Nunca transforma automáticamente `maxAdditionalUnits=0` en uno.
- Renovar explícitamente un intento no consumido conserva su UUID/crédito y aumenta generación. Una confirmación vencida no se renueva: necesita otra solicitud consentida. Cerrar/reabrir sesión no concede permiso sobre la autoridad anterior; sí permite históricos con autorización premium actual.

El lock de taller se comparte con licencias. Se protegen suscripción, membresías, taller, épocas, control, orden y fuentes relacionadas. La captura y publicación vuelven a verificar fuentes/autoridad. Se ejecutaron escritores independientes de hallazgos, licencia, membresía, perfil y resolución; no se confunde una simulación HTTP con esa cobertura SQL.

## Emisión, fallos y recuperación

PREPARED → RENDERING → STAGED → ARCHIVE_VERIFIED → ISSUED. Los borradores terminan DRAFT_CONFIRMED. Expiración, cambio de fuente y autoridad producen EXPIRED, SOURCE_CHANGED y DENIED. Un fallo técnico recuperable conserva estado y reserva; no publica ni confirma consumo. Las generaciones cercan workers vencidos.

Stage CAS conserva los primeros bytes y devuelve ese ganador a los demás renders. Upload usa `upsert:false`, seguido por lectura y verificación de tamaño/SHA. Publicación SQL y primera confirmación comercial son una transacción. Ningún byte limpio se entrega desde staging. Un reintento tras respuesta incierta consulta estado, converge al original publicado y no genera otra cuota. Si Storage falla o devuelve bytes distintos no hay publicación. Los huérfanos permanecen privados; no se eliminan automáticamente.

Cada vista/descarga revalida SQL, comprueba tamaño/hash y vuelve a autorizar después del I/O. No hay fallback local ni regeneración histórica. No se promete revocar archivos legítimamente descargados. No existe atomicidad distribuida ni WORM físico: un operador privilegiado puede alterar infraestructura; el digest detecta alteraciones y S5B permite recuperación.

## UX y alcance preservado

Dentro de Documentos, el flag `VITE_BT_MULTIPUNTO_V2_ENABLED` selecciona el panel nuevo. Por defecto OFF; la ruta V1 y su marca permanecen. Presenta evaluación parcial, persistencia, revisión propuesta por SQL, consentimiento máximo 0/1, emisión directa owner/admin, recuperación explícita e historial separado. Reutiliza PdfViewer (50–200%, Escape, foco), las cercas documentales y revoca Blob URLs al cambiar autoridad. Los metadatos de intentos en sessionStorage no contienen tokens ni bytes y nunca conceden permiso. El visor cierra por vencimiento/inactividad.

La emisión no modifica estado de OT ni reabre inspecciones. El formulario/selección/autoguardado del padre no se remonta. R2 y las 34 familias/componentes no se rediseñan. El borrador sigue marcado; el definitivo incluye los 34 estados, parcialidad, trazabilidad y notas completas en páginas A4. Full presenta singular/plural correcto: «1 utilizada · Sin límite comercial».

## Recuperación S5B

Inventario aditivo versión 2 y validación estricta de bucket/ruta/taller/orden/revisión/documento/hash. V1 sigue aceptado. Originales publicados entran siempre; objetos staged conocidos por Storage entran como staging. El dump contiene también bytea privado de todas las generaciones, incluso stages aún sin objeto. Se restauraron bytes de ambas clases a un almacén sintético vacío y tablas/ledger/artifacts mediante pg_dump/psql en otra base aislada. No se abrió custodia real ni se repitió un respaldo histórico. El ZIP conserva exactamente tres originales; multipunto se entrega por separado.

## Resultados y límites

Consultar MATRIZ.md, evidencia ejecutada y RUNBOOK.md. PostgreSQL 17 real; Auth/Storage de transporte sintético; SDK FunctionsClient instalado; Chromium real. No se certifican JWT alojados, Storage alojado, restauración de un respaldo real ni dispositivos físicos.

IMPLEMENTATION_COMPLETE describe el candidato. LOCAL_VALIDATION_PASS se limita a comprobaciones ejecutadas y listadas. BLOCKED_ENVIRONMENT: WebKit ausente y Deno ausente; su CI oficial queda pendiente. INDEPENDENT_REVIEW_PENDING, OFFICIAL_CI_PENDING y PRODUCTION_NOT_AUTHORIZED. PRIVATE_TRANSFER_PASS solo queda acreditado por los recibos remotos del paquete, no por este documento previo.
