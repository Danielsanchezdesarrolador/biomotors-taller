# BT-PLAN-04BC-CI-FIX — checkpoint

26/11/2026, Chile. Base oficial: `6c52420b30121341c87db4323ad9cf2ae825febf`; integración funcional previa: `ecdfe58386165a39826249bb8a6b68f3965cdaa6`. Única rama `main`. Candidato local para revisión privada; no push oficial ni activación productiva.

## Causas y correcciones

**CI-FIX-01 — laboratorio PostgreSQL.** El ejecutor histórico instalaba CP05 y luego el branding actualizado, sin Agenda ni el contrato instalado de FLOW-FIX-01. Por tanto faltaba `bt_cp05_private.prepare_issue_before_agenda(uuid,uuid,bigint,uuid,uuid)` que el guard del candidato aprobado exige. Error reportado por Dirección Técnica en [run 45870868625](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45870868625).

Se adapta exclusivamente `scripts/security/verify-plan04-local.sh`: DDL de CP05/recovery → FLOW → COM → expedientes → archivo → Agenda; restauración de funciones/CHECKs desde el fixture oficial `tests/fixtures/flowFixInstalled.json`; aplicación de FLOW-FIX-01 antes de Creator/PLAN04 y branding. Es la preparación ya utilizada por PLAN04BC, sin ejecutar sus 51 comprobaciones. El guard aprobado de branding sigue verificando el cuerpo `4e72581761dadd9837be2465bf4dc555`. No se modifica ningún SQL aprobado ni se suprime el preflight. Las aserciones históricas de licencias, cupos, concurrencia, billing y branding permanecen idénticas.

**CI-FIX-02 — simulador Auth R1.** Auth consulta ahora la capacidad del taller mediante una RPC de lectura por POST. El simulador no la reconocía y su auditoría solo permitía POST de login/logout. Error reportado en [run 45870868616](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45870868616).

Se adapta exclusivamente `scripts/verify-auth-r1-ui.cjs`: intercepta la ruta exacta `/rest/v1/rpc/bt_plan04_operations_status`, exige POST sin query, JSON con la única clave `p_workshop_id`, taller sintético A o B únicamente cuando corresponde al escenario múltiple, y Bearer sintético con la identidad esperada. Un escenario sin correo confirmado, revocado o con membresía inactiva recibe denegación. Las respuestas válidas identifican el taller solicitado y mantienen ambas capacidades en false: estos escenarios prueban Auth R1, no una habilitación operativa. La auditoría de solicitudes incorpora solo ese POST exacto. Rutas desconocidas siguen fallando; no hay un fallback permisivo ni cambios al sistema Auth productivo.

## Resultados efectivos

- Laboratorio PostgreSQL 17 aislado, `--network none`: PASS. Marcadores `PLAN04_LOCAL_RLS_MFA_SYNC_INVITES_CONCURRENCY_PASS`, `PLAN04_LOCAL_BILLING_AND_BRANDING_PASS`, `PLAN04_LOCAL_CONCURRENT_SINGLE_LICENSE_CREATION_PASS`. Se ejecutaron todas las aserciones históricas de este laboratorio afectado.
- Ejecutor Auth R1: PASS en las DOS modalidades de `.github/workflows/bt-oficial-01.yml`, harness privado y bundle con solo Auth R1 habilitado. Cada modalidad registra 19 grupos de escenarios: cinco anchos (1650/1440/768/390/375), nueve negativos y cinco comprobaciones del build público OFF. Mantiene los controles de sesiones, membresías, aislamiento, revocación y tráfico interceptado. No es Auth/RLS alojado.
- Solo como prerrequisitos del ejecutor se prepararon los bundles locales público OFF y R1; no se lanzó `npm test`, `npm run build`, typecheck global ni otros ejecutores visuales.
- `bash -n` del shell modificado, `node --check` del CJS y `git diff --check`: PASS. Comparación por contenido de ambos fixtures SQL históricos y de todo `docs/sql`/`src` contra la base: sin cambios. El diff binario del paquete reconstruye exactamente el árbol del candidato mediante un índice Git temporal.

No se repitieron las 122 unitarias, las 51 SQL PLAN04BC, las 25 de revocación, auditorías ni respaldos. La CI oficial del SHA corregido aún no se ha ejecutado: estos son resultados locales de los dos ejecutores afectados, no una declaración de CI remota verde.

## Archivos y entrega

Archivos funcionales del delta: los dos scripts citados. Documentación: este checkpoint y notas nuevas en `AGENTS.md`, `agent.md`, `roadmap.md`. Ningún archivo de lógica comercial, Auth productivo, SQL aprobado, RLS, permisos, workflow, dependencia o configuración sensible modificado.

Entrega solo por DTK-ERR-056 a `bytetorque-review/main/BT-PLAN-04BC-CI-FIX/`. Incluye SHA fuente/árbol en `CANDIDATO.json`, diff incremental completo respecto de la base oficial, seis archivos afectados, logs/resultados efectivos y manifiesto SHA-256. El SHA de transferencia se distingue del candidato fuente. Árboles de entregas anteriores conservados.

Dirección Técnica comunica integración completada y respaldo integrado actualizado/restaurado con 13 PDF coincidentes con Supabase; se registra como confirmación de Dirección Técnica, sin repetir respaldo ni consulta alojada. SEC07 cerrado. No ejecutar migraciones, workflows de despliegue, Supabase, Render o Edge desde esta entrega. Logos, correo, pagos y cuentas reales siguen OFF. La autorización posterior de migraciones/despliegues está condicionada a la revisión e integración de esta corrección y a CI; no se ejerció aquí.

Documentación/contratos consultados: estado reciente de AGENTS/agent/roadmap, checkpoints PLAN04BC y revocación, preparación del laboratorio PLAN04BC, fixture instalado FLOW-FIX-01, SQL de dependencias y guard de branding, aserciones históricas PLAN04, simulador/Auth harness y llamadas de los dos workflows oficiales. Sin nueva fase funcional.
