# CHECKPOINT — BT-SEC07-RENDER-RUNTIME-READONLY-AUDIT-50

**Fecha:** 20/11/2026 (America/Santiago) · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama única:** `main` · **HEAD previo:** `fa5a0d8033187fcb95582ba390ea415648ad1d21`.

## 1. Autorización y alcance

El propietario respondió **«confirmo»** a utilizar el workspace Render **My Workspace** exclusivamente para **revisar servicios ByteTorque en modo lectura**, sin desplegar ni alterar entornos, servicios, SSL o secretos. Antes de consultar se releyeron `AGENTS.md`, `agent.md`, `roadmap.md`, checkpoint 49 e informe de incidentes; se verificó rama `main` y HEAD. Consultas: `list_services` con workspace confirmado, `get_service` y `list_deploys` solo para el servicio ByteTorque, y `list_postgres_instances` para el workspace. **No se llamó a `update_environment_variables`, `trigger_deploy`, logs, SQL, GitHub Actions ni Supabase de producción.** No se recuperaron ni mostraron valores de entorno o secretos. El conector Render de esta sesión **no ofrece lectura de variables de entorno**, por lo que su estado concreto no está auditado.

## 2. Resultados reales del workspace seleccionado

**My Workspace:** `list_services` devolvió **18 servicios** sin previews; **un único servicio** está vinculado al repositorio `Danielsanchezdesarrolador/biomotors-taller`: `biomotors-taller-demo`, ID no publicado. El resto pertenece a **otros proyectos** del usuario; no se investigaron sus entornos ni datos. `list_postgres_instances` devolvió **0 instancias PostgreSQL en ese workspace**. Esto **no significa** que ByteTorque no tenga base de datos: su base real está en Supabase, conforme a CP46/CP47.

**Metadatos del servicio ByteTorque, GET Render:**
- `name = biomotors-taller-demo`, `type = static_site`.
- `repo = Danielsanchezdesarrolador/biomotors-taller`, `branch = main`, `autoDeploy = yes`.
- `serviceDetails.buildCommand = npm install --no-audit --no-fund && npm run build`; `publishPath = dist`.
- `suspended = not_suspended`. `list_deploys` marcó el despliegue más reciente **`status=live`**, commit `7da13a3f7c1f9a396c777515ce911674a10bde33`, finalizó 2026-11-20 19:23:40 UTC. Un estado LIVE solo significa despliegue Render aceptado/publicado, **no prueba flujo de login ni RLS ni salud de la BD**.
- No se observó ni se modificó un servicio web backend de ByteTorque en Render. Un sitio estático `dist` no mantiene proceso Node/PG en runtime: los llamados de frontend se hacen desde navegador por HTTPS según `src/auth/supabaseGateway.ts`. La URL y clave publicable de Supabase pueden estar compiladas en bundle público; **no usar una key secreta/service-role en VITE_**.

## 3. Juicio de compatibilidad SSL y límites

| Superficie | Evidencia | Diagnóstico |
|---|---|---|
| Render del frontend ByteTorque | Servicio `static_site` y 0 Postgres Render en workspace confirmado | **Sin servidor PostgreSQL Render del proyecto ni conexión libpq del servicio estático en runtime**; bajo riesgo de incompatibilidad directa con SSL enforcement |
| Navegador/PWA | Auditoría de código CP49 `@supabase/supabase-js` y URL HTTPS | **Compatible en diseño** con la política de SSL para conexiones PostgreSQL, porque las APIs HTTPS de Supabase ya requieren SSL; no certifica flujos UI funcionales |
| Exportador Windows | CP46 `CLIENT_POOLER_TLS: CONFIRMED_BY_LIBPQ` | TLS `verify-full` cliente PASS para esa conexión, independientemente del estado del servidor |
| GitHub backups | CP49 scripts `verify-full`; workflows manuales | Código parece compatible; **no** hay prueba de ejecución exitosa ni recuperación completa roles/owners/ACL |
| Edge Functions desplegadas y otros consumidores | No inspeccionados en runtime en este bloque | **NO CERTIFICADOS**; pueden existir conexiones directas en otros entornos |
| Supabase SSL enforcement | Captura CP48 OFF; CP46 `DB_BACKEND_SSL: REPORTED_NO` | Falta endurecimiento del entorno, extremo a extremo NO certificado |

**Precisión:** `list_services` no demuestra que no exista un sistema externo no listado que acceda a Supabase; solo describe los servicios de este workspace Render. No afirmar compatibilidad universal, no afirmar que todas las claves publicables estén correctamente configuradas en Render: el conector no expone variables. Los servicios de otros proyectos se mantuvieron fuera de alcance.

## 4. Acciones pendientes, con autorización distinta

**A. Cerrar inventario:** verificar bajo permiso específico y sin revelar secretos los **nombres** o tipos de configuración pública del servicio, los despliegues efectivos de Edge Functions y clientes externos de DB (PC, otros jobs, integraciones). No ejecutar APIs SQL ni jobs por esta inspección.

**B. Prioridad R3 respaldos de roles:** el `roles.sql.gpg` histórico descifra 0 SQL y el exportador de roles/ACL/owners reales sigue pendiente, con causa raíz del productor no clasificada. La restauración R2 pasada es solo `SNAPSHOT_STRUCTURE_ONLY`. No comprometer protección de datos por cambiar TLS antes de fijar recuperación.

**C. Preparar mantenimiento SSL:** inventario confirmado de todos los clientes libpq, validación de CA/host/TLS, protección y restauración, criterio de ventana fuera de uso con aviso, monitor de fallos/retroceso. Según [documentación oficial Supabase SSL Enforcement](https://supabase.com/docs/guides/platform/ssl-enforcement), activar/desactivar enforcement puede reiniciar la base, afectando temporalmente llamadas API, Auth y funciones; reversión también conlleva reinicio. **No cambiar ON** sin autorización nueva explícita para el reinicio.

**D. Verificar luego del cambio:** salud de app PWA/Auth, clientes `verify-full` y tramo backend, consulta read-only autorizada para certificar que el nuevo ajuste se aplica; no asumir `end-to-end` por el mero ON visual.

## 5. Acciones realizadas / no realizadas

Realizadas: metadatos Render del workspace elegido y servicio ByteTorque, lectura de lista de despliegues y Postgres Render (vacía), lectura de código/docs GitHub, checkpoint y documentación `main` [skip render]. **No** se leyó/suministró ningún secreto Render, no se cambiaron env vars o despliegues; no conexiones a DB, no backups/GPG/roles, SSL enforcement sigue OFF, Docker/Drive fuera.

**Estado:** inventario Render **PASS** para topología y tipo de servicio; compatibilidad universal **PENDIENTE**. Hallazgo `BT-SEC07-SSL-UPSTREAM-OBSERVATION-46` abierto, piloto `BT-PILOT-QA-04 A REPASAR`.

## 6. Prompt de continuidad

> Continuar seguridad ByteTorque SEC-07 en main, leer AGENTS.md, agent.md, roadmap.md, CP50 `docs/checkpoints/CHECKPOINT_BT_SEC07_RENDER_RUNTIME_READONLY_AUDIT_20261120.md` e informe de errores; verificar HEAD. Usuario confirmó `My Workspace` Render para inspección READ ONLY. `list_services` 18, solo `biomotors-taller-demo` vinculado a repo de ByteTorque, `static_site` main, `autoDeploy=yes`, build Vite `npm install --no-audit --no-fund && npm run build`, publish `dist`, último despliegue LIVE; `list_postgres_instances` 0 en workspace. **No backend PostgreSQL de ByteTorque en Render**; web usa supabase-js HTTPS en navegador. No leer ni inventar env vars: conector no expone esa lectura. No certificar Edge Functions desplegadas, integraciones externas, clientes Android ni backups cloud. SSL enforcement OFF visual CP48, cliente PC→pooler TLS verify-full PASS CP46, backend SSL NO, extremo a extremo NO certificado. Primero roles/ACL reales y compatibilidad de restantes clientes, plan reinicio/rollback; después permiso nuevo para activar ON (Supabase reinicia DB). No ejecutar SSL/SQL/pg_dumpall/GPG/restore/deploy con permisos actuales. Todo checkpoint+agent+roadmap+incidentes en main [skip render], repo privado, no Drive.
