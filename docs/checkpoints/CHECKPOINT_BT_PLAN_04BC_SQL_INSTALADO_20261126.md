# BT-PLAN-04BC — instalación SQL autorizada

26/11/2026. CI oficial 5/5 SUCCESS en `dc056b1620398e050c0d00f7d96abd88efec0684`: [general](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45881094554), [interfaz/WebKit](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45881094473). Autorización del titular hasta despliegue Render. Ventanas cerradas confirmadas. S5B restauración PostgreSQL/Storage 13 PDF PASS comunicado por titular, apertura visual no certificada; snapshot 19:27:31 UTC. No cambios posteriores detectados en tablas comerciales, Auth y Storage consultados; no transacciones idle abiertas. Cuatro huellas de funciones existentes coincidentes. Render servicio oficial en My Workspace, Auto-Deploy no.

## Migraciones aplicadas y registradas

| Versión | Nombre |
|---|---|
| 20261126192950 | bt_plan04b_workshops |
| 20261126192959 | bt_plan04c_mechanics |
| 20261126193003 | bt_plan04bc_pilot |
| 20261126193008 | bt_plan04_cp05_branding |
| 20261126193013 | bt_plan04bc_revocation_delta |

Aplicación secuencial del contenido exacto de los cinco SQL candidatos aprobados, blobs cotejados, respuestas success true e historial consultado.

## Postflight

- Cinco tablas nuevas privadas con RLS y FORCE; sin SELECT de anon ni authenticated.
- Siete RPC públicas nuevas autorizadas a authenticated, sin EXECUTE anon; tres auxiliares privados sin EXECUTE anon/authenticated/service_role.
- Guardas de licencia presentes en autorizadores de CP05/FLOW/archivo y RPC de capacidades. Huella de preparación textual actualizada.
- Dos talleres, cero licencias, cero altas e invitaciones nuevas, 13 objetos conservados, cero bucket branding. Un rollout preexistente habilitado por área (FLOW/Agenda/archivo); no se invocó configure_pilot.
- Security Advisor sin ERROR reportados; INFO por 24 tablas privadas sin políticas (incluye las cinco nuevas, acceso directo denegado); WARN por 13 RPC SECURITY DEFINER expuestas a authenticated intencionalmente y protección de contraseñas filtradas deshabilitada. No modificar políticas para silenciar avisos ni considerar esto auditoría independiente de todos los contratos.

## Pendiente

Edge CP05 v9 y Final Archive v7, JWT true verificados antes de SQL. Ejecutar workflow manual [PLAN04BC](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/workflows/bt-plan04bc-edge-manual.yml) en main con `DESPLEGAR_PLAN04BC_CP05`. No hay dispatch en el conector GitHub. Comprobar resultado y Edge CP05 versión/JWT antes de desplegar frontend aprobado en Render. No activar registro real, cuentas, licencias, logos, correo o pagos. SEC07 cerrado; sin nuevos minutos Codex. No certificar QA alojada ni recuperación integral por el postflight.
