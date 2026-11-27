# BT-WORKSHOP-COMMERCIAL-01 — GATE4 Edge ready PASS

Fecha: 27/11/2026 UTC. Autorización del titular: instalar tres Edge Functions en fase ready, mantener cuatro barreras cerradas; NO autoriza reapertura. Preflight 02:36:35 UTC: esquema comercial instalado, 12/12 denegaciones, 16 documentos, 0 consumos; workflow blob 3ff7c458cfbaff1a885514a848f8d81e4f9b80a2; SHA de fuentes aprobado 3c77ca83ee2d6db62e0ad2c66ccfa6aa61294c4c.

## Incidencia y solución
[Run #2](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45929376276) completed/skipped; job release omitido. La captura del titular mostraba fase freeze con confirmación READY_SQL_GATE_VERIFIED; corregir únicamente a ready y ejecutar nueva corrida main. No modificar workflow ni relajar la condición de seguridad. No despliegue en intento omitido.

## Ejecución y verificación
[Run #3](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45929536855), job 140278703991 SUCCESS, 02:38:39–02:39:31 UTC, HEAD cd68ee6907956d45941d3f20d355c7c3db68e514. Log efectivo a 02:38:59 UTC: 43/43 exact reviewed hashes PASS. Deploy ready CP05 02:39:19, final archive 02:39:22, commercial 02:39:26; fase terminada 02:39:27. Supabase list/get confirma ACTIVE, rutas ready del mismo run, verify_jwt true:

- bt-cp05-documents v12 (antes v11), bundle registrado 8193e06ac61a4163f3e39b5add6c9a8f477140e060eb0cb97ba1040a26d69380, index.js + 3 recursos.
- bt-final-archive v9 (antes v8), bundle 59baf8fb478a9800f101ad496e63f1b2ae1bcd4e5574cb62534ad76e38247dc0, index.js + 5 recursos.
- bt-commercial-documents v2 (antes v1), bundle 72eb6c489c2627b638b6f5698dfda44556d0ed74cf65e41cdeb9aca78e55caa0, index.js + 5 recursos.
- bt-owner-onboarding v8 sin modificación; bundle 2496da78594bd46389a491052983847dbb143a5c6fb0aeec849bb3b0c89db3e2.

Los 43 hashes se verificaron antes del deploy en GitHub; los hashes ezbr corresponden al bundle registrado por el proveedor, no son hashes individuales de cada recurso. Se contrastaron rutas de archivos alojados, no bytes/hashes individuales del paquete descargado ni de los PDF. Postflight independiente 02:40:36 UTC: esquema instalado, 4 ACL postgres-only (12/12 denegaciones authenticated/anon/service_role), 16 documentos por inventario, 2 buckets privados, 0 consumos. Sin pruebas de negocio, Render, GATE_OPEN ni activación de flags en esta intervención.

## Continuidad
GATE4_SQL_INSTALL_PASS / GATE4_EDGE_READY_PASS / REOPEN_BLOCKED. Mantener cuatro ACL cerradas. No certificar convergencia global ni ausencia histórica de URL firmadas; conservar evidencia residual anterior y resolver antes de abrir. Drenaje conservador de 400 s después del último ready y comprobaciones de proveedor, sin asumir que el plazo garantiza convergencia; verificar estado real y compatibilidad de frontend antes de autorización específica de reapertura. No repetir CI/HTTP freeze/respaldo/SEC07 por rutina. Correo, registro, logo y pagos OFF. Reserva authenticated sigue siendo RPC de negocio, no hay congelación global de escrituras. [SQL PASS](CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_GATE4_SQL_PASS_20261127.md), [GATE4 y residual](CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_GATE4_PREP_20261127.md).
