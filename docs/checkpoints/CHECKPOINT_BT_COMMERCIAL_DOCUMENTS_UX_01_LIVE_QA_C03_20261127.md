# BT-COMMERCIAL-DOCUMENTS-UX-01 — LIVE QA / C-03 PASS

27/11/2026 Chile (28/11 UTC). [C-02](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C02_20261127.md). [Contrato técnico](../BT_COMMERCIAL_DOCUMENTS_UX_01.md).

Titular presentó captura de ZIP descargado bajo Full con exactamente tres PDF: cotización, informe de ejecución y constancia de entrega. El manifiesto es interno/autorizado, no una cuarta entrada ZIP; se corrige la expectativa del prompt de continuidad. Consulta directa de solo lectura al manifiesto de cierre y revisión de cotización recuperó los tres SHA-256 registrados. Titular ejecutó PowerShell 5.1 sobre ZIP local y reportó BT_ZIP_ENTRIES: 3, CONSTANCIA_ENTREGA PASS, COTIZACION PASS, INFORME_EJECUCION PASS, BT_ZIP_HASHES: 3/3, BT_ZIP_INTEGRITY: PASS. Evidencia reportada por titular y hashes consultados directamente; no descarga independiente del ZIP por revisor ni apertura visual de cada PDF.

Ledger: base C-02 10 confirmados; C-03 11 confirmados, cero reservas activas, un lease confirmado. Único consumo nuevo capability quote, Full, correspondiente a revisión descargada; reservado 00:26:03.701484 UTC, confirmado 00:26:03.902132 UTC, vence 00:31:03.701484 UTC. Lectura 00:28:22.384188 UTC conserva 11/0/1. No borrar consumos.

C-03 PASS funcional e integridad 3/3. C-04 pendiente: reintento del mismo ZIP con mismo UUID/sesión y lease vigente, confirmar ausencia de consumo nuevo; si vence, no renovar silenciosamente. C_ACCEPTED_PASS pendiente de pruebas restantes. Solo documentación; sin modificaciones de producción, permisos, licencias, Edge, SQL, Storage o deploy. SEC07 no se repite.
