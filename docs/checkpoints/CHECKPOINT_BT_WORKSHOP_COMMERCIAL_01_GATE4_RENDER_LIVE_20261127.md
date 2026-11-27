# BT-WORKSHOP-COMMERCIAL-01 — GATE4_RENDER_LIVE / REOPEN_BLOCKED

27/11/2026 UTC. Despliegue autorizado del frontend comercial con cuatro ACL cerradas. [Aceptación residual y preflight](CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_GATE4_RESIDUAL_ACCEPTED_20261127.md).

- Render servicio biomotors-taller-demo, [dep-dc4ljttg1s2s73etout0](https://dashboard.render.com/static/srv-dbqe4quc6qcc73f275jg/deploys/dep-dc4ljttg1s2s73etout0), SHA 7dc06a26c1a4821affb67366a0a05ba0b672a1b4. Inicio 10:22:47 UTC, fin 10:23:12 UTC, estado live confirmado por API.
- Logs: tsc --noEmit && vite build, compilación Vite 2.51 s, dist/assets/index-DPWoToRE.js, advertencia tamaño chunk no bloqueante, Your site is live.
- Postflight 10:23:52 UTC: 4/4 ACL postgres-only, 12/12 denegaciones a authenticated/anon/service_role, 16 objetos, 2 buckets privados, 0 consumos. Auto-Deploy OFF y rama main comprobados nuevamente.
- Cambios entre SHA desplegado y 48442bcb: exclusivamente AGENTS.md, agent.md, roadmap.md y checkpoint residual. No cambios de código después de CI aprobado.
- No se modificaron variables de entorno, SQL, Edge, Auth, Storage, flags ni datos. No Codex ni nuevas suites CI. No se verificó navegación autenticada, configuración efectiva individual de flags (conector no ofrece lectura), ni bytes del bundle servido por el dominio público. Render LIVE no equivale a aceptación comercial o GATE_OPEN autorizado.

Siguiente: verificar frontend efectivo y flags pertinentes (correo/registro/logo/pagos OFF), conservar barreras cerradas hasta autorización específica del titular; ejecutar únicamente GATE_OPEN de cuatro firmas, verificar permisos, realizar aceptación focalizada Básico/Plus/Full sin clientes reales. Ticket SU-571138 pendiente de respuesta técnica acreditada, riesgo residual aceptado sin certificar convergencia global.

Estado: GATE4_RESIDUAL_ACCEPTED / GATE4_RENDER_LIVE / REOPEN_BLOCKED.
