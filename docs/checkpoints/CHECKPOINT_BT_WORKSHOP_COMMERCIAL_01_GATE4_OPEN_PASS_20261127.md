# BT-WORKSHOP-COMMERCIAL-01 — GATE4_OPEN_PASS / COMMERCIAL_ACCEPTANCE_PENDING

27/11/2026 UTC. El titular autorizó expresamente ejecutar GATE_OPEN de las cuatro RPC y verificar permisos posteriores, preservando restricciones y sin habilitar servicios adicionales.

## Preflight

- Titular confirmó navegación autenticada, Inicio, Mi taller, Plan y beneficios; estado bloqueado sin cifras estimadas durante mantenimiento. Capturas de inventario de variables Render y confirmación expresa VITE_BT_CP05_EMAIL_ENABLED=false; VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED ausente y guardas del frontend requieren true. Registro Auth de cuentas no equivale a autorregistro público de clientes. No se modificaron flags; no se verificó independientemente el valor de correo del servidor.
- HEAD 8e7a16635fbc65101accee797b25e2cc97b65447, Render dep-dc4ljttg1s2s73etout0 LIVE SHA 7dc06a26, main y Auto-Deploy OFF. Edge CP05 v12, final archive v9, commercial v2, onboarding v8, ACTIVE y verify_jwt=true, hashes registrados coincidentes con checkpoint anterior.
- 12:33:32 UTC: cuatro ACL postgres-only; authenticated, anon, service_role sin EXECUTE; 16 objetos, 2 buckets privados, 0 consumos.
- Se conserva aceptación explícita del riesgo residual (clave antigua revocada, sin garantía global de caché/convergencia); ticket SU-571138 sin respuesta técnica acreditada.

## Ejecución y postflight

Se ejecutó sin alterar el contenido exacto de [GATE_OPEN](../sql/BT_WORKSHOP_COMMERCIAL_01_GATE_OPEN.sql), blob e377cbe473804a4104eb54c23826fdec2d83743f, transacción BEGIN/COMMIT con preflight y postflight incorporados; Supabase devolvió [] sin error.

Consulta independiente 12:33:45 UTC confirma ACL {postgres=X/postgres,authenticated=X/postgres} en las cuatro RPC: bt_plan04_operations_status(uuid), bt_final_archive_document(uuid,uuid), bt_final_archive_source(uuid,uuid,uuid,uuid), bt_commercial_status(uuid). 4 permisos authenticated y 8 denegaciones anon/service_role = 12/12 expectativas. Huellas MD5 de pg_get_functiondef idénticas antes/después: 107b734b0384f003f19f2b9cc84fec26, 6e1e08dd8b37e6a6cee33bcc5be9b502, c8e1d918c0e600b0e425826a54962ea1, 46efeb3a831bb286039093c72419eb66 respectivamente.

16 objetos, 2 buckets privados, 0 consumos, 8 definiciones anteriores. RLS habilitado y forzado en previous_functions y consumption, authenticated sin SELECT. Tres políticas restrictivas Storage vigentes (bt_commercial_quote_egress, bt_cp05_backend_only, bt_final_archive_backend_only). No se cambiaron cuerpos RPC, datos, planes, flags, Edge, Auth, Storage ni Render. No Codex ni nuevas suites.

## Siguiente

GATE4_OPEN_PASS; instalación y reapertura técnica completadas, aceptación comercial pendiente. Validar sesión de titular, Mi taller y Full/cupos/consumos reales; después pruebas focalizadas Básico, Plus y Full, idempotencia y aislamiento según contrato, sin clientes reales de Ignacio. No afirmar pruebas funcionales ni aislamiento end-to-end ya realizados. Mantener correo, registro público de clientes, logo y pagos fuera del alcance. No activar servicios nuevos. No repetir CI/SEC07/respaldo por rutina.
