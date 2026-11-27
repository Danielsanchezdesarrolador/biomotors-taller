# BT-COMMERCIAL-HARDENING-01-LIVE-01 — VERIFY_PASS / GATE4_CLOSE_PASS

27/11/2026. Titular autorizó cierre transaccional de las cuatro barreras y confirmó respaldo manual integrado exitoso de 16 PDF y ByteTorque cerrado/ventana sin editores. Primer intento semanal LOCAL_DOCKER_COMMAND_FAILED, candidato preservado, sin reintento automático; titular identificó Docker Desktop cerrado y reportó éxito al abrirlo y ejecutar manualmente. Causa inferida del reporte, no inspección del comando fallido. Prevención: Docker Desktop/Engine running y docker info --format '{{.ServerVersion}}' antes del acceso directo. No eliminar candidato. No auditoría independiente del manifiesto, recibos, restauración o bytes locales; aceptación operacional del reporte, no garantía DR. No reabrir SEC07.

## VERIFY
- [Run 46039133778](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/46039133778), job 140642065365 SUCCESS, workflow_dispatch, HEAD 5bd9acc9cf0ad0d0a4c8fe1464df6aeec9fbafc8. Logs confirman checkout 5375a3ea0cbb62ceaf3ceca4ad61d756b63b08ae, 43/43 exact reviewed hashes PASS (incluye guarda previa de 10 fuentes), manifest artifact 15218083840. Setup Supabase CLI y deploy skipped. No descarga independiente del ZIP; comparación del manifiesto y hashes hecha por runner.

## Cierre autorizado
- Preflight read-only: HEAD 5bd9acc9cf0ad0d0a4c8fe1464df6aeec9fbafc8; Auto-Deploy OFF. 4 ACL abiertas y MD5 intactos; 16 objetos en 2 buckets privados (6 cp05-quote-documents, 10 bt-closing-documents), ledger 5 confirmed y 0 reservas activas; 8 definiciones previas, 2 tablas RLS enabled/forced y authenticated sin SELECT, 3 políticas Storage restrictivas.
- Se ejecutó exclusivamente bloque SQL de cierre exacto del [runbook](../recovery/BT_COMMERCIAL_HARDENING_01_LIVE_RUNBOOK_20261127.md), blob 4d20f5c3b71c6ce5e38f93ad525e0472ceb6d957, única transacción BEGIN/COMMIT, guardas de rol, esquema, huellas, ACL y reservas. Resultado conector [] sin error.
- Postflight read-only independiente: 4 ACL {postgres=X/postgres}; authenticated, anon, service_role sin EXECUTE, 12/12 denegaciones. MD5 pg_get_functiondef por firma:
  - bt_plan04_operations_status(uuid): 107b734b0384f003f19f2b9cc84fec26
  - bt_final_archive_document(uuid,uuid): 6e1e08dd8b37e6a6cee33bcc5be9b502
  - bt_final_archive_source(uuid,uuid,uuid,uuid): c8e1d918c0e600b0e425826a54962ea1
  - bt_commercial_status(uuid): 46efeb3a831bb286039093c72419eb66
- 16 objetos, 2 buckets privados, 5 confirmados, 0 reservas activas, 8 definiciones previas, RLS y políticas intactos en inventario agregado; no recalculados hashes por objeto alojado. Edge ACTIVE/JWT true CP05 v12, final v9, commercial v2, onboarding v8, hashes previos coincidentes. Auto-Deploy OFF. No despliegue ni cambios de datos, cuerpos de funciones, planes, flags, Auth, Storage o RLS. Solo ACL de cuatro RPC y documentación; no Codex ni repetición CI.

## Siguiente puerta
GATE4 cerrado; esto no acredita freeze HTTP ni congela toda escritura de negocio. Mantener ventana sin editores; autorización específica freeze antes de workflow bt-commercial-hardening-edge-manual.yml, main, fase freeze, HARDENING_FREEZE_GATE_VERIFIED. Revalidar 12/12 denegaciones e inventario antes del despacho; verificar tres funciones y HTTP autenticado 503/0 bytes/cabeceras, drenaje mínimo 400 s y riesgo residual. No ejecutar ready/Render/reopen automáticamente. No declarar aceptación comercial. No publicar secretos ni rutas locales. Bloques B/C pendientes.
