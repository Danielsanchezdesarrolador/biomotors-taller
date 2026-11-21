# CHECKPOINT — BT-SEC07-SSL-COMPATIBILITY-STATIC-AUDIT-49

**Fecha:** 20/11/2026, America/Santiago. **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`. **Rama exclusiva:** `main`. **HEAD revisado antes del cambio:** `158db045133382dd2b2e4441dacee8cc8818d2cb`. **Alcance:** auditoría ESTÁTICA de compatibilidad con SSL obligatorio y plan de cambio; **NO activa SSL enforcement, NO conecta otra vez a PostgreSQL, NO exporta roles, no despliega, no ejecuta pruebas contra producción**.

## 1. Evidencia y alcance observado

Se leyeron `AGENTS.md`, `agent.md`, `roadmap.md`, CP48 e informe consolidado; se revisó árbol completo de **1096 elementos** del repo y se recuperaron contenidos de archivos orientados a conectividad de frontend, Edge Functions, scripts de respaldo, diagnósticos y GitHub Actions. Se revalidó documentación oficial de [Postgres SSL Enforcement de Supabase](https://supabase.com/docs/guides/platform/ssl-enforcement) vía buscador conectado: la política de SSL se aplica a conexiones PostgreSQL/pooler; APIs HTTP (Auth/PostgREST/Storage) ya fuerzan HTTPS; cambiar el ajuste causa **reinicio de DB**, con posible indisponibilidad.

**Evidencia anterior CP48:** captura del propietario con `Enforce SSL on incoming connections` en **OFF**, no una respuesta API. **CP46:** conexión PC→pooler SSL `verify-full` comprobada con `\\conninfo`; `DB_BACKEND_SSL: REPORTED_NO` para sesión detrás de pooler; `END_TO_END_TLS: NOT_CERTIFIED`. No se debe inferir que todos los clientes actuales vayan sin TLS.

## 2. Inventario estático de consumidores y diagnóstico

| Superficie | Código fuente revisado | Hallazgo | Estado de preparación |
|---|---|---|---|
| Frontend/PWA | `package.json` (dep `@supabase/supabase-js`), `src/auth/config.ts`, `src/auth/supabaseGateway.ts`, `.env.example` | Utiliza cliente `supabase-js` apuntando a URL `https://...supabase.co`; Auth y APIs, no controlador PostgreSQL directo en rutas revisadas | **Compatible en diseño** con requisito SSL de conexión directa; validación de runtime/Render aún pendiente |
| Edge Functions incluidas en repo | `supabase/functions/bt-owner-onboarding/index.ts`, `bt-mechanic-invites/index.ts`, `bt-mechanic-accept/index.ts`, `bt-mechanic-revoke/index.ts`, `bt-invite-worker/index.ts` | Entradas revisadas usan `SUPABASE_URL`, `fetch` y librerías compartidas; **no se observó controlador Postgres directo** en esos entrypoints | **Sin incompatibilidad estática visible**, cobertura de imports y despliegue efectivo NO certificada |
| Adaptadores backend | `server/billing/supabaseLedger.ts`, `server/cp05/supabasePortsCandidate.ts` | `rpc` y `storage` sobre un cliente Supabase inyectado; no conectores `pg` en esos archivos | Candidatos/uso efectivo requiere verificación; no asegurar que se ejecuten |
| Respaldo local Windows | Exportador original documentado CP43/CP46 (solo historial, no ejecutado ahora) | Usa cliente PostgreSQL 17 y TLS `verify-full` con CA, comprobación de cliente PC→pooler **PASS** CP46. Roles export sigue INC-ROLES | **TLS cliente demostrado**, respaldo roles/ACL no demostrado |
| Infra scripts de backup GH | `scripts/backup/postgres_config.py`, `cloud_backup.py`, `postgres_preflight.py` | Pooler de sesión 5432 y `sslmode=verify-full`; configuración válida por diseño. `cloud_backup.py` utiliza `pg_dump` y `pg_dumpall`, y GPG posterior | **Requisito TLS escrito en código**, no constituye prueba actual de ejecución de workflow ni éxito de roles |
| GitHub Actions | `.github/workflows/bt-encrypted-backup.yml`, `bt-readonly-pooler-diagnostic.yml` | Ambos tienen **`workflow_dispatch` manual** y controles de alcance, no `schedule` activo en estos dos YAML. Historial de Drive/cifrado bloqueado | No iniciar manualmente ni reutilizar para probar SSL sin permiso |
| Supabase PostgreSQL gestionado / pooler | Captura CP48 + SSL monitor CP46 | Enforcement **OFF** en UI; cliente PC→pooler usó TLS; backend `pg_stat_ssl` reportó NO | **Hallazgo abierto**: política permisiva, no solución ni prueba de upstream |
| Render y otros integradores externos | No pudo verificarse runtime mediante conector Render: solicita `workspaceId` seleccionado por usuario; no elegir workspace por inferencia | No se inspeccionaron configuraciones efectivas ni posibles agentes externos o jobs no contenidos en repo | **PENDIENTE — NO certificar** |
| Android nativo/futuras integraciones | No se hizo inspección de APK instalada, ni prueba de app Android efectiva | Riesgo potencial de endpoints custom no documentados | PENDIENTE si está operativo |

**Conclusión:** arquitectura examinada tiene **bajo riesgo visible de incompatibilidad TLS** en frontend/edge por acceso API HTTPS y en scripts por `verify-full`. **No certifica el runtime ni la seguridad de TODOS los consumidores.** No confundir `sslmode=prefer` con TLS obligatorio; revisar integraciones desconocidas y no exponer secretos.

## 3. Priorización y plan de cambio NO ejecutado

**Bloque A — Inventario en solo lectura, sin modificar:** identificar mediante la cuenta correcta de Render el tipo de servicio/entornos (no solicitar valores secretos) y, con permiso, revisar solo nombres de variables y su uso sin capturar passwords. Contrastar clientes externos: scripts PC, jobs GH, Edge Functions desplegadas, integraciones. En Render el proveedor exige **que el usuario confirme el workspace concreto** si hay más de uno: no seleccionar solo. Para cada conexión directa a Postgres confirmar TLS requerido y CA válida con hostname. Las APIs HTTPS no necesitan cambiar a `pg`.

**Bloque B — Continuidad previa al reinicio:** inventariar backup principal existente y manifest; R2 restauración estructural PASS pero roles/owners/ACL sin garantía (viejo `roles.sql.gpg` SQL cero). No iniciar cambio que requiera restauración sin plan; solucionar R3 roles de forma independiente con permiso concreto. Registrar salud del servicio, login y navegación operativa (sin escribir datos de taller real). Si aún no hay usuarios reales, no asumir cero impacto: Supabase Auth/API puede verse interrumpida con reinicio.

**Bloque C — Preflight de compatibilidad:** revisar políticas SSL/CA de cada cliente PostgreSQL directo; probar sin modificar producción en staging/laboratorio si existe. No inventar staging ni cambiar proyecto. Configurar hora de mantenimiento fuera de uso; estrategia de comunicación y rollback (volver a OFF también podría reiniciar: no ejecutar automáticamente; requerirá aprobación específica). Si falta compatibilidad en cliente, corregirlo y comprobarlo primero.

**Bloque D — Cambio futuro tras autorización específica:** presentar lista exacta de servicios afectados, pruebas y criterios de rollback; obtener aprobación explícita para activar `Enforce SSL on incoming connections` ON, con advertencia de reinicio/posible downtime. Solo entonces efectuar el cambio y verificar primero salud del proyecto y API, y después cliente `verify-full` y backend SSL mediante pruebas autorizadas y no destructivas. No deducir que upstream SSL es `true` tras cambiar sin nueva medición. Si se daña un cliente, pausar y analizar antes de rollback con autorización.

## 4. No hechos / seguridad

- No se modificó el interruptor OFF ni ningún componente Supabase/Render/GitHub Actions.
- No hubo SQL, `psql`, `pg_dump`, `pg_dumpall`, backup, GPG, exportación de roles, migración o despliegue.
- No se recuperaron secretos ni se incluyeron sus valores en documentos.
- Se evitó asumir workspace de Render a falta de selección por el usuario.
- GitHub solo documentos `main`, commit `[skip render]`.
- Estado piloto `BT-PILOT-QA-04 A REPASAR`; Drive excluido; R3 roles/ACL sigue pendiente.
- Hallazgo `BT-SEC07-SSL-UPSTREAM-OBSERVATION-46` **ABIERTO** hasta política ON y validación post-cambio, o hasta decisión formal de riesgo.

## 5. Traspaso

> ByteTorque SEC-07, branch única main, leer AGENTS/agent/roadmap y CP49. Dueño preguntó «cómo avanzamos» tras ver SSL enforcement OFF en screenshot. Se completó **AUDITORÍA ESTÁTICA** del repo: frontend PWA `supabase-js` vía HTTPS, Edge Function entrypoints revisados vía Supabase URLs/fetch, adaptadores server `rpc/storage`, no evidencia de acceso Postgres directo en esos archivos; backups PG17 y GitHub scripts tienen TLS verify-full en código; dos workflows de backup/diagnóstico solo manuales. **NO** certificar Render runtime ni terceros/Android, faltan inventario y credenciales TLS (sin exponer), Render app requiere workspaceId elegido por usuario. CP46 client TLS PASS, backend ssl REPORTED_NO, end-to-end NOT_CERTIFIED; CP48 policy OFF UI, cambiarla reinicia BD. Plan: A inventario Render/external; B continuidad y respaldo roles (SQL histórico 0); C compatibilidad/staging y mantenimiento; D solo permiso nuevo activa ON + pruebas read-only controladas. No SQL, deploy, GitHub Actions, nuevos backups ni cambios TLS. `BT-PILOT-QA-04 A REPASAR`, Drive fuera. Documentar próximos hallazgos en main, no repetir labs antiguos.
