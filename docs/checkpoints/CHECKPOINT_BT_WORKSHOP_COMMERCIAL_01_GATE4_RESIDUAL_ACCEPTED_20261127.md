# BT-WORKSHOP-COMMERCIAL-01 — GATE4_RESIDUAL_ACCEPTED / RENDER_DEPLOY_STARTED

27/11/2026 UTC. El titular autorizó expresamente aceptar el riesgo residual documentado y desplegar el frontend comercial en Render, manteniendo cerradas las cuatro barreras SQL hasta verificar el despliegue. No autoriza GATE_OPEN.

## Evidencia residual y límites

- Titular operó Storage URL Signing Keys en dashboard: capturas muestran nueva clave ES256 activa, antigua revocada, sin standby tras revocación (aprox. 02:55 UTC); no revertir ni rotar Auth. Evidencia visual aportada, no consulta independiente de estado de claves.
- Ticket SU-571138 recibido por soporte; plan Free, respuesta técnica no acreditada. Purga manual CDN no ejecutada; no contratar Pro ni alterar documentos. CacheControl max-age=3600 en los 16 objetos observado a 02:56 UTC. Más de siete horas tras revocación, superior a TTL configurado y drenaje de 400 s. No equivale a máximo garantizado de retención ni convergencia global. Se conservan los límites de evidencia previa (27 blobs históricos y logs agregados).
- 10:21 UTC: logs desde ready 02:39:26 UTC, 11 storage_logs y 24 edge_logs, cero coincidencias de rutas de firma/documentales; no filas function_edge_logs devueltas, sin garantía de cobertura. Versiones/hashes registrados CP05 v12, final v9, commercial v2, JWT true, onboarding v8 intacta; no recalcular hashes individuales alojados.
- PostgreSQL: 16 objetos en 2 buckets privados; 12/12 denegaciones, RLS habilitado y forzado en 2 tablas comerciales, tres políticas restrictivas Storage vigentes; 8 definiciones previas, 0 consumos. Preflight 10:22:37 UTC repite únicamente 4 ACL cerradas, 16 objetos, 0 consumos.
- Dirección Técnica estima riesgo residual bajo con la evidencia disponible, no certificación de revocación CDN global ni enrutamiento global. Titular acepta riesgo residual para continuar instalación, no autoriza reapertura.

## Render

Auto-Deploy OFF, rama main, SHA 7dc06a26c1a4821affb67366a0a05ba0b672a1b4; comparación previa contra CI 3c77ca83ee2d6db62e0ad2c66ccfa6aa61294c4c solo docs/SQL/workflow manual, sin cambios frontend. Servicio biomotors-taller-demo. Despliegue manual vía API iniciado 10:22:47 UTC: [dep-dc4ljttg1s2s73etout0](https://dashboard.render.com/static/srv-dbqe4quc6qcc73f275jg/deploys/dep-dc4ljttg1s2s73etout0), estado observado build_in_progress; todavía no declarar LIVE. Sin modificar variables de entorno; conector no ofrece lectura individual de flags de Render, verificar antes de GATE_OPEN. Mantener correo, registro, logo y pagos OFF. Sin cambios SQL, Edge, datos, claves ni Codex en esta intervención. Reapertura requiere confirmación de frontend publicado y autorización específica. No repetir CI/SEC07/respaldo por rutina.

Estado: GATE4_RESIDUAL_ACCEPTED / RENDER_DEPLOY_STARTED / REOPEN_BLOCKED.
