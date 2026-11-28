# BT-COMMERCIAL-DOCUMENTS-UX-01 — LIVE QA / C-06 PASS funcional

27/11/2026 Chile (28/11 UTC). [C-05](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C05_20261127.md).

Titular autorizó cambio temporal Full a Plus exclusivamente en taller de pruebas y lo realizó desde panel Creador. Lectura directa 00:34:25.101319 UTC confirmó Plus activo temporal hasta 28/12 00:33:22.306893 UTC (30 días en vez de un día sugerido), 6 cotizaciones, 16 objetos privados, 7 membresías, 12 consumos confirmados, cero reservas y extras; titular confirmó 2 cupos. No escritura directa por Dirección Técnica. Restaurar Full permanente al final.

Titular solicitó renovación explícita y luego confirmó descarga ZIP. Lectura 00:35:28.070073 UTC previa a descarga: 12 confirmados, 0 reservas/leases; lectura posterior 00:35:50.750955 UTC: 13 confirmados, 0 reservas, 1 lease. Única operación nueva quote, Plus, revisión objetivo correcta, reservada 00:35:38.30855 UTC y confirmada 00:35:38.473187 UTC; vence 00:40:38.30855 UTC. Sin duplicación. C-06 PASS funcional de descarga y reconciliación; titular no confirmó por separado los tres archivos de esta copia ni se recalcularon sus hashes (C-03 verificó los originales bajo Full). No afirmar agotamiento de cuota Plus en producción.

Siguiente: comprobar contenido ZIP Plus y preparar visor multipunto autorizado antes de cambio temporal a Básico con autorización específica del titular, para comprobar invalidación y bloqueo ZIP sin consumo. Restaurar Full permanente y postflight. C_ACCEPTED_PASS pendiente. Solo documentación; sin cambios directos de producción, licencias, SQL de escritura, Edge, RLS, Storage o despliegue por Dirección Técnica. No repetir SEC07.
