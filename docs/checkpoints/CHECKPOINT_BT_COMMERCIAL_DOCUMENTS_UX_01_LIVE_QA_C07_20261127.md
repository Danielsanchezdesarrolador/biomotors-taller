# BT-COMMERCIAL-DOCUMENTS-UX-01 — LIVE QA / C-07 PASS funcional

27/11/2026 Chile (28/11 UTC). [C-08](CHECKPOINT_BT_COMMERCIAL_DOCUMENTS_UX_01_LIVE_QA_C08_20261127.md).

Tras invalidación C-08, titular intentó descargar ZIP en Básico y reportó mensaje «Esta función está disponible en ByteTorque Plus y Full. Conoce los beneficios de nuestros planes». Lectura SQL directa 00:41:27.115998 UTC: basic active, 14 confirmados, 0 reservas, 1 lease previo aún vigente por tiempo, 0 nuevas operaciones desde C-08 00:39:44.481392 UTC, 16 objetos privados, 7 membresías. PASS funcional del bloqueo comercial reportado y ausencia de consumo nuevo; no captura independiente de respuesta HTTP ni prueba de ataque directo al endpoint. No se deduce eliminación de copias anteriores.

C-09 pendiente: autorización específica y restauración Full permanente por titular en panel Creador, verificar 4 cupos, conservación de documentos, 14 consumos, membresías y reservas, reconciliar expiración natural de leases previos. No declarar C_ACCEPTED_PASS antes de postflight. Solo documentación; no escritura directa de producción por Dirección Técnica. SEC07 no se repite.
