# BT-COMMERCIAL-DOCUMENTS-UX-01 — C_ACCEPTED_PASS

27/11/2026 Chile (28/11 UTC). Aceptación funcional controlada por titular en su taller de pruebas; no certificación exhaustiva ni entrega a Ignacio. Base antes de cierre: 1f16f4a3aba9ac9e4d95abbc6b352b4c0b950660. [Reapertura GATE4](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_GATE_OPEN_20261127.md), [runbook](../recovery/BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_RUNBOOK_20261127.md), [contrato](../BT_COMMERCIAL_DOCUMENTS_UX_01.md).

## Aceptación funcional 9/9
- [C-01](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C01_20261127.md): Mi taller recuperado, confirmación titular.
- [C-02](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C02_20261127.md): visor ampliado, zoom 50–200 %, cierre/contexto; 7/7 titular; un consumo legítimo, no consumo adicional observado por zoom.
- [C-03](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C03_20261127.md): ZIP Full de exactamente tres PDF; SHA-256 3/3 confirmado por PowerShell local del titular frente a hashes consultados directamente en servidor; manifiesto interno, no cuarta entrada.
- [C-04](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C04_20261127.md): reintento ZIP vigente sin consumo adicional.
- [C-05](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C05_20261127.md): nuevo multipunto con BORRADOR reportado; sin inspección independiente de todas las páginas.
- [C-06](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C06_20261127.md): Plus activo 2 cupos reportados, ZIP descargado y un consumo quote Plus correcto; no recálculo de hashes de esta copia.
- [C-07](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C07_20261127.md): bloqueo ZIP Básico, mensaje comercial y cero nuevos consumos; no ensayo HTTP directo en producción.
- [C-08](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C08_20261127.md): visor abierto con Plus, downgrade autorizado a Básico, cierre automático reportado y captura conserva orden/historial; no revocación de copias descargadas.
- C-09: titular autorizó y confirmó restauración Full permanente y 4 cupos por panel Creador/MFA. Lecturas directas corroboran Full active, is_lifetime true, expires_at null, seats 4.

## Postflight de solo lectura
00:42:30.550701 UTC: PostgreSQL 17.11; Full permanente, 1 suscripción, 0 extras, 6 revisiones de cotización, 16 objetos privados, 14 confirmados, 0 reservas, 7 membresías. 00:42:53.29661 UTC: 2 invitaciones, 8 previous_functions. 00:43:05.583653 UTC: seats=4 y último lease hasta 00:43:18.87938 UTC. 00:43:22.70896 UTC: 14 confirmados, 0 reservas y 0 leases activos (expiración natural; sin eliminar consumos). Inventario por bucket: cp05-quote-documents privado 6; bt-closing-documents privado 10. Conteos no equivalen a auditoría individual de todos los bytes.

Ledger: 9 iniciales +5 legítimos =14. Multipunto Full 2, quote Full 1, quote Plus 1, multipunto Plus 1. Cero duplicados observados en reintento y cero consumo por intento ZIP Básico. No borrar consumos.

GATE4: cuatro RPC owner postgres y ACL exacta {postgres=X/postgres,authenticated=X/postgres}; 4/4 permisos, 8/8 denegaciones anon/service_role. MD5 pg_get_functiondef: bt_plan04_operations_status 107b734b0384f003f19f2b9cc84fec26; bt_final_archive_document 6e1e08dd8b37e6a6cee33bcc5be9b502; bt_final_archive_source c8e1d918c0e600b0e425826a54962ea1; bt_commercial_status 46efeb3a831bb286039093c72419eb66. Coinciden con reapertura. MD5 prosrc seats 8e431729bf340f1dda00e946a5b32ecb coincide; 0/2/4 intacto. Dos tablas bt_commercial_private RLS enabled/forced y SELECT authenticated false.

Edge ACTIVE JWT true, versiones y huellas plataforma coinciden con reapertura: CP05 v18 e4f29cf7717279386b56a4fc5855153479ebe7493e278fcfae24c6cc9b83ae76; final v16 2eee79c9436adbdd5b7088f9504ca59d0ade0a3b68c6bfbf6dd7c1fd67f84058; commercial v8 b6d045219d85f598434c53c4096d647f2f46be4782fe6b3e776e8a409a4f; onboarding v8 2496da78594bd46389a491052983847dbb143a5c6fb0aeec849bb3b0c89db3e2. Render LIVE dep-dc51hblg1s2s7387vou0 SHA d6022af308abacbcabe4db8eb0948ea4aeeabe4e, Auto-Deploy OFF; comparación GitHub hasta base de cierre: 11 commits, únicamente checkpoints. Funciones diferidas OFF según última confirmación del titular en reapertura; conector no permite lectura independiente individual de flags y no se repite su comprobación en este postflight. No se cambió configuración ni se desplegó en esta aceptación.

## Dictamen y límites
C_ACCEPTED_PASS: aceptación funcional 9/9 reportada, consistente con reconciliación y postflight directo. Evidencia humana y lecturas agregadas; no captura HTTP de cada operación, no auditoría de todos los documentos, no prueba física Android/iPhone, no certificación global, no DR integral ni agotamiento de cuota Plus en producción. Candidato/CI previos cubren negativos adicionales. No se realizó nuevo deploy, SQL de escritura, RLS, Storage, Edge o cambios directos de suscripciones por Dirección Técnica; cambios temporales de plan por titular autorizado vía panel Creador y restaurados. Mantener Auto-Deploy OFF y flags diferidos OFF. SEC07 cerrado.

Siguiente bloque BT-ORDERS-UX-01: preparar candidato focalizado R2 en bloque grande con Codex; no iniciar código ni producción sin orden específica. Preservar permisos, cuotas, estados, persistencia, documentos/visor/ZIP, multipunto y roadmap. BT-MULTIPUNTO-FINAL-01 y BT-MOBILE-02/R3 y DevOps conservan alcance y orden vigente.