# BT-COMMERCIAL-HARDENING-01-LIVE-01 — RENDER_DEPLOY_STARTED

27/11/2026 UTC. Titular autorizó desplegar frontend Hardening manteniendo las cuatro barreras GATE4 cerradas y Auto-Deploy OFF.

## Preflight
- Servicio biomotors-taller-demo, static site, main, repo oficial, build npm install --no-audit --no-fund && npm run build, publish dist, Auto-Deploy OFF. Último LIVE previo 7dc06a26c1a4821affb67366a0a05ba0b672a1b4.
- Comparación de árboles no truncados entre código aprobado por CI 5375a3ea0cbb62ceaf3ceca4ad61d756b63b08ae y HEAD 1e1217cdd735e9fe07b22fee56374e8454eaa580: 11 rutas, AGENTS.md, agent.md, roadmap.md, .github/workflows/bt-commercial-hardening-edge-manual.yml, seis checkpoints de instalación y un runbook. Sin diferencias de código productivo, lockfile o configuración de build. Conector Render no permite elegir SHA en trigger_deploy; se verificó equivalencia y HEAD inmediatamente antes de solicitar deploy de main.
- SQL read-only: cuatro ACL postgres-only, 12/12 denegaciones, huellas originales intactas, 16 objetos en 2 buckets privados, 5 confirmed, 0 reservas. Edge Ready CP05 v14, final archive v12, commercial v4 y onboarding v8, ACTIVE/JWT true y hashes coincidentes con checkpoint ready.

## Ejecución
- [Deploy dep-dc4s4d8u01pc73f6l710](https://dashboard.render.com/static/srv-dbqe4quc6qcc73f275jg/deploys/dep-dc4s4d8u01pc73f6l710) iniciado 17:47:33 UTC, trigger API, clearCache false, SHA 1e1217cdd735e9fe07b22fee56374e8454eaa580. Último estado observado build_in_progress; no declarar LIVE hasta verificar estado.
- No cambios variables de entorno, Auto-Deploy, SQL, Auth, Storage, datos, flags ni Edge. Conector no permite acreditar valores individuales de flags; verificar en dashboard antes de reapertura. Mantener correo/registro cliente/logo/pagos OFF, sin editores.
- Próximo: verificar LIVE exacto, navegación autenticada y estados documentales bloqueados, revisar riesgo residual y obtener autorización separada para GATE_OPEN. No certificar aceptación comercial ni convergencia global. No repetir CI, SEC07 o respaldo; no Codex.
