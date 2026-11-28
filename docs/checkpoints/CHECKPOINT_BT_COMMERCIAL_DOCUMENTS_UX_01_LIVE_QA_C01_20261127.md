# BT-COMMERCIAL-DOCUMENTS-UX-01 — LIVE QA / C-01 PASS

Fecha: 27/11/2026, Chile (28/11 UTC).

Base oficial verificada: `e50fc3aed98af1ddd7bb582687323626ff2d81ad`. Fuente productiva: [GATE_OPEN_PASS](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_GATE_OPEN_20261127.md). [Runbook](../recovery/BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_RUNBOOK_20261127.md).

## C-01 — Recuperación de Mi taller: PASS (confirmación del titular)

El titular confirmó en la sesión anterior, reiterado en el prompt de continuidad del 27/11, que Mi taller recuperó correctamente sus datos tras la reapertura de GATE4. Evidencia declarada por titular; no constituye inspección independiente de su navegador ni una nueva prueba de SQL, RLS o documentos. Auto-Deploy OFF verificado directamente por consulta de solo lectura a Render en esta sesión. No se han ejecutado nuevas pruebas productivas ni modificaciones de infraestructura.

## C-02 — Nuevo visor PDF: PENDIENTE

En taller de pruebas, Órdenes de trabajo > TEST12 (KIA RIO 5) > Vista previa PDF. Comprobar ampliación, controles de zoom 50–200 %, cierre y permanencia en la misma orden. No descargar todavía. Distinguir autorización/consumo de apertura inicial de cambios de zoom; comprobar ausencia de consumo adicional por zoom con evidencia de solicitudes y reconciliación de ledger. Línea base registrada en reapertura: 9 consumos confirmados, 0 reservas/leases activos y 16 originales; no es una lectura nueva en esta sesión.

C_ACCEPTED_PASS sigue pendiente: ZIP Full, originales y SHA-256, idempotencia, BORRADOR multipunto nuevo, Plus/Básico con autorización separada, invalidación, restauración Full y postflight. Mantener flags diferidos OFF, sin repetir SEC07. BT-ORDERS-UX-01 únicamente tras aceptación C. Consolidar AGENTS.md, agent.md y roadmap.md al cierre de C conservando historial.

Alcance de este commit: solo registro documental, sin cambios de código, SQL, Edge, Storage, RLS, licencias, GATE4 o despliegues.
