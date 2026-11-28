# BT-COMMERCIAL-DOCUMENTS-UX-01 — LIVE QA / C-02 PASS

27/11/2026 Chile (28/11 UTC). [C-01](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C01_20261127.md).

Titular confirma 7/7 comprobaciones visuales del visor en TEST12 KIA RIO 5: apertura ampliada, zoom hasta 200 % y 50 %, cierre y permanencia en la orden. No descargó PDF. Evidencia del titular, no inspección independiente del navegador.

Lectura SQL directa en `bt_commercial_private.consumption` a 00:13:43.870288 UTC y repetición 00:13:50.17335 UTC: 10 confirmados (base reapertura 9), 0 reservas activas, 1 lease vigente hasta 00:17:45.418855 UTC. Única operación desde postflight GATE4 de 00:09:05.821787 UTC: multipunto Full, reservada 00:12:45.418855 UTC, confirmada 00:12:46.266572 UTC. Sin consumos adicionales durante prueba de zoom; no se capturó cada solicitud HTTP ni se certifica ausencia de solicitudes no consumidas. Lease confirmado no es reserva pendiente. Reconciliar consumos legítimos al cierre; no borrar ni expirar manualmente.

C-02 PASS funcional y reconciliación de ledger. Siguiente C-03: ZIP Full de tres originales y manifiesto, validar integridad y luego idempotencia. C_ACCEPTED_PASS pendiente, sin alterar producción, licencias, GATE4, Edge, SQL, Storage o flags. SEC07 no se repite; BT-ORDERS-UX-01 espera aceptación C.
