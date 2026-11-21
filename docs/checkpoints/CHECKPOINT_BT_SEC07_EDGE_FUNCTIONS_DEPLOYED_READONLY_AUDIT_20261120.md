# CHECKPOINT — BT-SEC07-EDGE-FUNCTIONS-DEPLOYED-READONLY-AUDIT-51

**Fecha:** 20/11/2026, Chile · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama autorizada:** `main` · **HEAD inicial:** `251993ca81ab0946ce9c9dc87ec59723ba28f902`.

## 1. Autorización exacta y metodología

El propietario respondió **«autorizo»** a una **auditoría exclusivamente de lectura de las Edge Functions desplegadas de ByteTorque**, expresamente sin ejecutar funciones, consultar datos de clientes ni modificar funciones/configuración. Se leyó skill de Supabase y la continuidad `AGENTS.md`, `agent.md`, `roadmap.md`, CP49, CP50 e informe histórico. Se verificó HEAD de `main`.

Se utilizaron **solo acciones read-only**:
- Supabase conectada `get_project` para corroborar el proyecto `biomotors-taller` (ACTIVE_HEALTHY, PG17), `list_edge_functions` y `get_edge_function` para la función efectivamente publicada;
- GitHub `fetch_file` del código `supabase/functions/*/index.ts`, `supabase/config.toml` y un módulo compartido;
- Supabase `search_docs` para contrastar APIs HTTPS vs clientes PostgreSQL directos;
- índice público de cambios `https://supabase.com/changelog.md` (20/11/2026); ninguna actualización reciente obliga a modificar estas funciones en este alcance. No se actualizó SDK ni CLI.

**No se ejecutó ninguna invocación HTTP a la Edge Function**, tampoco `execute_sql`, `query_logs`, llamadas a tablas/RPC, `deploy_edge_function`, cambios SSL enforcement ni acceso a secretos de runtime. Se observaron nombres de variables referenciadas en el código, **no valores**. No subir contenido privado de runtime o secretos a GitHub.

## 2. Inventario REAL de Edge Functions en el proyecto consultado

**`list_edge_functions` devolvió exactamente UNA función desplegada:**

| Slug | Estado | Versión | JWT | Fuente desplegada vs `main` |
|---|---|---|---|---|
| `bt-owner-onboarding` | **ACTIVE** | **2** | **`verify_jwt=true`** | **Coincidencia literal exacta** de `index.ts` de 5785 caracteres |

**Cuatro funciones presentes en el repositorio `main`, pero NO publicadas en el proyecto consultado:**
- `bt-mechanic-invites`
- `bt-mechanic-accept`
- `bt-mechanic-revoke`
- `bt-invite-worker`

El archivo `supabase/config.toml` incluye las cinco entradas con `verify_jwt = true` y comentarios documentando que las últimas cuatro son código candidato **sin desplegar**. Que no aparezcan en `list_edge_functions` no es por sí mismo un incidente ni prueba que debieran estar publicadas; **no desplegarlas ni probar invocaciones sin permiso nuevo**.

## 3. Inspección del código desplegado (no ejecución)

**La única función realmente activa** `bt-owner-onboarding` publica `index.ts` idéntico byte a byte a `main` según comparación literal de contenido (5785 caracteres). La función:
- Usa `fetch` para verificar identidad vía `SUPABASE_URL + /auth/v1/user`, y para ejecutar la RPC `bootstrap_workshop_owner` mediante `SUPABASE_URL + /rest/v1/rpc/bootstrap_workshop_owner`; **no se detectaron URL `postgresql://`, librerías `pg/postgres`, `Pool` ni cliente PostgreSQL directo**.
- Requiere `verify_jwt=true` en despliegue. Contiene verificación de usuario en Auth y lista explícita de orígenes CORS; el control de habilitación `BYTETORQUE_ONBOARDING_ENABLED` requiere `true` para operar. **No se consultó el valor efectivo de esa variable ni el comportamiento en ejecución**.
- Referencia `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` como variables de entorno. Emplea service-role para llamar a la RPC por HTTPS/REST y no debe trasladarse al frontend. **La auditoría no expuso ni verificó su valor**, tampoco asegura por sí sola la seguridad de la RPC o sus políticas internas.
- Un único archivo desplegado, sin imports a otros archivos locales, fue el contenido recuperado por la app. Por ello la comparación del archivo completo en Supabase vs GitHub es viable.

**Las cuatro funciones no desplegadas** tienen archivos `index.ts` en `main` que no muestran conexión directa PostgreSQL en una comprobación estática de sus entrypoints; sin embargo, no forman parte del runtime activo aquí. Se revisó que algunos importan módulos `_shared`; **no se certifican dependencias completas ni compatibilidad de una futura publicación**, ni deben probarse en producción.

**Interpretación SSL:** la función activa usa las APIs HTTPS administradas de Supabase, que el proveedor indica que exigen SSL para conexiones HTTP entrantes, separadamente del ajuste de conexiones PostgreSQL. Como no abre conexión libpq, **no se identifica incompatibilidad directa estática** con habilitar SSL enforcement. Eso no constituye prueba de ejecución post-cambio ni de cómo se comporta todo el tráfico interno entre API y PostgreSQL. La futura activación de enforcement sigue requiriendo revisión de clientes directos, respaldo y ventana de reinicio.

## 4. Riesgos y puertas de autorización

| Control | Estado |
|---|---|
| Conexión PostgreSQL directa desde Edge Function desplegada | **No observada** en su código |
| Estado y contenido de función activa | **Comprobados en el proyecto** |
| Comparación desplegada vs `main` | **EXACT MATCH** |
| `verify_jwt` en función activa | **TRUE** |
| Valor runtime de `BYTETORQUE_ONBOARDING_ENABLED` | **NO CONSULTADO / DESCONOCIDO** |
| Valor o política de secrets | **NO CONSULTADO** |
| Invocación real, autorización funcional, RLS y RPC | **NO PROBADOS** |
| Funciones candidatas no desplegadas | **NO ACTIVAS** |
| Estado SSL enforcement Supabase | **OFF visual CP48**, no cambiado |
| Cliente PC→pooler TLS | **PASS CP46**; upstream/backend `REPORTED_NO`, end-to-end NO certificado |
| Roles/owners/ACL respaldados y recuperación completa | **PENDIENTE** |

No recomendar un despliegue, cambio de feature flag, rotación de secretos o alteración de JWT basándose en esta auditoría. Antes de activar SSL obligatorio en Supabase (provoca reinicio de DB) se necesita:
1. confirmar otros consumidores de PostgreSQL directos (PC externo, automatizaciones de CI y terceros, no inventar);
2. cerrar plan R3 de exportación recuperable de roles/owners/ACL sin plaintext;
3. definir compatibilidad, mantenimiento, rollback autorizado y verificación posterior.
**Nuevo consentimiento específico** para cualquiera de las acciones remotas o mutaciones; lectura de metadatos actual no incluye ejecutar código.

## 5. Impacto y continuidad

**Efectos externos:** ninguno. No despliegue, tráfico a funciones, consulta a datos, SQL, GPG, dump/restore, cambios SSL, Render, secretos, permisos ni GitHub Actions. **Solo documentación** en `main` con `[skip render]`; repo permanece privado y misma rama.

**Pendiente principal SSL:** hallazgo `BT-SEC07-SSL-UPSTREAM-OBSERVATION-46` abierto hasta endurecimiento verificado. **Pendiente R3:** `roles.sql.gpg` antiguo descifró 0 SQL, causa `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` sigue sin determinar; R2 snapshot principal solo `SNAPSHOT_STRUCTURE_ONLY`, no recuperación integral. No repetir suites históricas 18/14/15, GPG metadata V2, PC TLS V2 o R2 restore. Piloto `BT-PILOT-QA-04 A REPASAR`; Drive excluido.

## 6. Prompt de continuidad

> Continuar ByteTorque SEC-07 desde `main`; leer AGENTS, agent, roadmap, CP51 e informe, verificar HEAD. Propietario autorizó exclusivamente auditoría de Edge Functions desplegadas, realizada en Supabase proyecto `biomotors-taller`: **una sola función activa** `bt-owner-onboarding` **v2** con `verify_jwt=true`, código index.ts **literalmente idéntico** a `main` (5785 caracteres); usa `fetch` hacia `/auth/v1/user` y `/rest/v1/rpc/bootstrap_workshop_owner` via `SUPABASE_URL`, no conexión PostgreSQL directa detectada. Contiene flag `BYTETORQUE_ONBOARDING_ENABLED` y variable de servicio, valores NO consultados. Otras cuatro funciones preparadas en `supabase/config.toml` y repo (mechanic invites/accept/revoke/worker) **NO DESPLEGADAS**; no activarlas. No se ejecutó función ni accedió a datos/secretos/logs. CP50 Render static_site sin backend PG, CP48 SSL enforcement OFF UI, CP46 PC→pooler TLS verify-full PASS/backend SSL REPORT_NO/end-to-end NOT_CERTIFIED. Compatibilidad de Edge Function activa favorable en código; **no** certificación end-to-end, roles/owner/ACL ni clientes externos. Siguiente priorizar inventario externo y R3 backup de roles con autorizaciones separadas antes de programar ON que reinicia BD. Docs main [skip render], sin deploy/DB writes.
