# ByteTorque — BT-AUTH-R2-A3 · Laboratorio PostgreSQL 17 aislado

**Fecha de registro:** 14/11/2026 (hora Chile).  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama:** `main`.  
**Alcance:** ejecutar las dos candidatas SQL de R2-A/R2-A2 sobre un motor PostgreSQL real en un contenedor efímero de GitHub Actions, **NO sobre Supabase hospedado**.

## Preparación y herramientas

- `.github/workflows/bt-auth-r2-postgres-lab.yml`: workflow independiente de solo pruebas; `postgres:17` como servicio local del runner, con disparo por cambios al SQL o a sus pruebas y `workflow_dispatch`.
- `scripts/security/bt-r2-lab-bootstrap.sql`: genera SOLO en el contenedor identidades sintéticas, talleres A/B, roles `anon`, `authenticated`, `service_role BYPASSRLS`, tablas mínimas compatibles con las dependencias de las propuestas.
- Aplica **los SQL originales versionados**, sin transformarlos ni crear tablas en Supabase: `docs/sql/BT_AUTH_R2_A_INVITATIONS_CANDIDATE.sql` y `docs/sql/BT_AUTH_R2_A2_ACCEPT_REVOKE_CANDIDATE.sql`.
- `scripts/security/bt-r2-lab-assertions.sql`: escenarios transaccionales con `ROLLBACK`. Verificación de revocación de grants, RLS privada, denegaciones, cupos y aceptación única.
- `scripts/security/bt-r2-lab-concurrency.sh`: dos transacciones simultáneas bajo bloqueo `FOR UPDATE` compiten por la última plaza Básica: exactamente una reserva se confirma.
- `scripts/security/bt-r2-lab-accept-concurrency.sh`: dos transacciones aceptan simultáneamente el mismo token. Solo una puede crear membresía y consumir la invitación.

## Pruebas y evidencias

**Primera ejecución real:** [GitHub Actions #43663351089](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43663351089), commit `0b3dd9a`, trabajo `Aislamiento, cuotas, revocación y concurrencia` con todos los pasos en **SUCCESS**.

Verificó en PostgreSQL 17:

- Grants y permisos RLS: `anon`/`authenticated` sin permiso sobre el esquema privado ni RPC de invitaciones.
- Solo propietario/admin activo del taller objetivo reserva o revoca; otro taller, mecánico y recepción no obtienen permisos.
- Plan Básico 2 mecánicos, Plus/Full 8, invitaciones vigentes contabilizadas y rechazo del noveno/tercero.
- Tokens incorrectos, email distinto, tokens usados y revocados son rechazados; aceptación correcta inserta un mecánico y bitácora.
- Revocación de un tercero sin facultad se rechaza y la misma invitación no se revoca dos veces.
- Token caducado rechazado; descenso de Full a Básico no otorga plazas por encima del cupo ni elimina historial existente.
- Dos reservas concurrentes para el último cupo: una confirmada y la segunda rechazada por cuota.

**Segunda ejecución real:** [GitHub Actions #43663461102](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43663461102), commit `980f5cd`, **SUCCESS** (todos los pasos). Log del job muestra explícitamente `PASS: concurrent acceptance consumes single-use token exactly once`. La primera aceptación creó una sola membresía; la segunda, simultánea y bloqueada por el mismo taller, fue rechazada. El mensaje SQL `Mechanic seat limit reached` que aparece en logs corresponde al rechazo **esperado** de la segunda reserva en la prueba de concurrencia, no a un fallo del workflow.

No son pruebas del servicio Auth, SMTP, Data API hospedada ni de operaciones reales de taller, y no sustituyen la revisión de las RPC antes de desplegarlas.

## Verificación de la base de datos real (solo lectura)

En Supabase `biomotors-taller` se confirmó después de las pruebas: **2 talleres, 4 membresías, 4 cuentas Auth**, **0 tablas `bt_private`**. Ninguna candidata SQL se aplicó allí. Siguen intactos los permisos y el cierre de R1.

**Aviso de seguridad preexistente:** protección contra contraseñas filtradas desactivada. Pendiente antes de activar registro o incorporación pública; no se modificó la configuración.

## Puertas R2-A4

1. Resultados del laboratorio actualizado revisados: dos workflows PostgreSQL aislados SUCCESS, incluida aceptación concurrente de un solo uso.
2. Completar el backend real que valide `getUser`, correo confirmado, antifraude, reintentos y entrega segura; no aceptar identidad, rol, plan ni email verificado desde el navegador.
3. Antes de instalar migraciones en Supabase, revisar los contratos y planes operativos, obtener autorización de aplicación y ensayar rollback en un entorno adecuado.
4. Mantener los tres endpoints de invitaciones/aceptación/revocación en modo **503 fail-closed**, sin deploy, SMTP ni cuentas nuevas, hasta esa aprobación.

**Estado:** BT-AUTH-R2-A3 **APROBADO como laboratorio aislado** (reserva y aceptación concurrentes PASS). Integración hospedada aún **NO habilitada**.
