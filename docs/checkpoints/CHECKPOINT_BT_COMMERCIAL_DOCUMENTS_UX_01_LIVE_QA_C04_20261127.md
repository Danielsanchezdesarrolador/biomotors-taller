# BT-COMMERCIAL-DOCUMENTS-UX-01 — LIVE QA / C-04 PASS

27/11/2026 Chile (28/11 UTC). [C-03](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C03_20261127.md).

Titular confirmó segunda descarga del mismo ZIP siguiendo instrucciones de reintento con sesión y autorización vigentes. Lectura SQL directa del ledger a 00:29:04.381144 UTC: 11 confirmados (igual a base C-03 de 00:28:22.384188 UTC), 0 reservas activas, 1 lease activo; una sola operación quote para revisión objetivo desde C-02 y cero operaciones nuevas desde base C-04. Lease original vence 00:31:03.701484 UTC. C-04 PASS por resultado funcional reportado y ausencia de duplicación observada en ledger; no captura HTTP independiente ni nueva verificación de bytes del segundo ZIP.

Siguiente C-05: generar un nuevo PDF borrador multipunto autorizado bajo Full y verificar marca diagonal BORRADOR en todas sus páginas, sin regenerar originales históricos; reconciliar consumo legítimo. Luego Plus/Básico con autorización específica, invalidación, restauración Full y postflight. C_ACCEPTED_PASS pendiente. Solo documentación; sin cambios productivos, SQL de escritura, licencias, Edge, Storage, GATE4 o despliegues. No repetir SEC07.
