# ByteTorque — Auditoría y optimización segura de GitHub Actions

**Fecha:** 16/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama exclusiva:** `main` · **Base auditada:** `ac8152653658cbd2dac9684f0c30e980e2ac8431`.

## 1. Consumo comprobado

El Director informó que la cuenta alcanzó **1.801 de 2.000 minutos gratuitos**, con **199 minutos remanentes** y presupuesto de gasto de US$0. **Este dato corresponde a la notificación recibida; no se leyó directamente la facturación de la cuenta ni se atribuyen todos los minutos exclusivamente al repositorio.**

La API de GitHub Actions sí permitió auditar los **655 runs** existentes en este repositorio entre **2026-11-11 21:40 UTC y 2026-11-16 11:13 UTC**. Todos tienen evento `push`; ninguno quedó con conclusión `cancelled`. Son **duraciones de workflow por reloj**, NO minutos facturados: los trabajos paralelos pueden sumar consumo independiente.

| Workflow | Runs | Success | Failure | Duración media por run (m) | Disparadores anteriores |
|---|---:|---:|---:|---:|---|
| `ci.yml` | 368 | 315 | 53 | 1,02 | push main, PR (sin filtro) |
| `bt-oficial-01.yml` | 140 | 109 | 31 | 3,65 | push por cambios amplios `src/assets/tests/scripts/public/lockfiles`, manual |
| `bt-flow-01.yml` | 32 | 19 | 13 | 4,22 | push por flujos, clientes, vista, tests, manual |
| `bt-auth-r2-postgres-lab.yml` | 37 | 29 | 8 | 0,71 | push por SQL/worker R2, manual |
| `bt-auth-r2-edge-check.yml` | 25 | 22 | 3 | 0,36 | push por Edge, manual |
| `bt-reg-02.yml` | 23 | 23 | 0 | 1,05 | push por registro/vista/tests, manual |
| `bt-cot-01.yml` | 18 | 18 | 0 | 1,99 | push por editor/vista/tests, manual |
| `bt-cp03-postgres-lab.yml` | 6 | 2 | 4 | 0,48 | push por SQL CP03, manual |
| `bt-cp04-postgres-lab.yml` | 5 | 2 | 3 | 0,49 | push por SQL CP04, manual |
| `bt-cp05-postgres-lab.yml` | 1 | 0 | 1 | 0,38 | push por SQL CP05, manual |

Medición: `run_started_at` → `updated_at` de las 655 ejecuciones, no duración redondeada de factura. Ejemplo comprobado en el CI más reciente: trabajo Web 11:13:11–11:14:28 UTC y Android 11:13:10–11:14:11 UTC, **en paralelo**; para medir consumo no corresponde sumarlo como una única ejecución de 1,3 minutos. El trabajo de interfaz pública más reciente consumió aproximadamente 5,43 minutos de ejecución de su único job.

**Mayor oportunidad:** 508/655 runs fueron `ci.yml` y `bt-oficial-01.yml`. Los dos repiten TypeScript, Vitest y build; en CI además se construyen PWA pública, CP03, CP04 y CP05 con flags distintos. No se han eliminado estas pruebas: las variantes y la regresión visual pueden ser obligatorias para la seguridad funcional.

## 2. Cambios implementados sin reducir comprobaciones de código

1. `ci.yml`: `paths-ignore` **solo para pushes exclusivamente de archivos `**/*.md`, `docs/checkpoints/**`, `docs/screenshots/**` y `docs/qa/**`**. Cualquier cambio a `docs/sql/**/*.sql`, `src/**`, `scripts/**`, `supabase/**`, dependencias o workflows sigue disparando CI. Los eventos `pull_request` siguen sin filtro. No se cambian branch protection ni Render.
2. En `ci.yml`, `bt-oficial-01.yml`, `bt-flow-01.yml`, `bt-cot-01.yml` y `bt-reg-02.yml`: concurrencia por **workflow + ref** en `push`. Solo se cancela un push ya superado por otro push que dispara **ese mismo workflow**. PR y ejecuciones manuales usan grupos únicos por `run_id`, sin cancelación automática entre ellos. No hay pasos de despliegue en estos jobs.
3. En los cinco workflows: caché oficial de paquetes npm con `actions/setup-node@v4`, indexada por `package-lock.json`. **No** se cachea `node_modules`, no se cachean secretos ni se cambian versiones. En `ci.yml` se cachea solamente el trabajo Web: Android no dispone de `apps/android/package-lock.json` y no se inventa uno.
4. No se modifican `npm install`, tests, pasos de seguridad, rutas SQL, Android nativo, RLS, Auth, Supabase, flags de activación, secretos, presupuesto, publicaciones ni protecciones de rama. Los cinco workflows SQL/Deno mantienen sus filtros previos.

**Archivos modificados:** `.github/workflows/ci.yml`, `.github/workflows/bt-oficial-01.yml`, `.github/workflows/bt-flow-01.yml`, `.github/workflows/bt-cot-01.yml`, `.github/workflows/bt-reg-02.yml`, y este informe. Se conservan los 10 workflows.

## 3. Resultados, cobertura y validación pendiente

Antes de este cambio, [CI principal run 43855788916](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43855788916) terminó SUCCESS. Se pudo acceder a los jobs remotos, a diferencia del bloqueo `Forbidden` informado anteriormente por Codex.

Hay **fallos remotos previos** que no debemos esconder:
- [CP05 PostgreSQL run 43855316735](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43855316735): `psql` termina con `FATAL: terminating connection due to administrator command` en el contenedor aislado. El resultado local informado por Codex no sustituye ese fallo remoto. Requiere investigar ciclo de vida/arranque del contenedor y revalidar CP05 cuando convenga.
- [FLOW run 43855316769](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43855316769): `locator.waitFor` excedió 30 s esperando `.fl-options-toggle[aria-expanded="true"]` en `scripts/verify-qa02-ui.cjs:218`; partes anteriores del flujo fueron PASS. Requiere diagnóstico dirigido, no repetir toda la auditoría.

Validación de esta optimización: lectura y comparación exacta de YAML, sin alterar los comandos de tests ni despliegues. **Al publicar, verificar que GitHub reconozca los workflows y consultar las primeras ejecuciones con nuevas reglas**. No afirmar un ahorro medido después del cambio hasta observar varios runs.

## 4. Ahorro potencial (estimaciones, no facturación)

- **Por push exclusivamente documental:** CI principal ahora no se inicia. En un run reciente sumó aproximadamente **2,30 minutos de tiempo de jobs** (Web ~1,28; Android ~1,02); los minutos facturados pueden diferir por redondeo y por otros consumos. Un escenario de 10 pushes solo documentales evitaría aproximadamente **23 minutos de tiempo de jobs** bajo esas duraciones; no son minutos ya ahorrados.
- **Cancelación de runs obsoletos:** oportunidad clara en secuencias rápidas de commits, pero el historial anterior tiene 0 cancelaciones y no permite calcular ahorro real hasta observar supersesiones; cada run cancelado evita parte de la duración restante.
- **Caché npm:** el beneficio varía por cache-hit, lockfile y ancho de banda. No se asigna porcentaje especulativo. Medir tiempos del paso `Instalar dependencias` antes/después.
- **Trabajos repetidos:** retirar TypeScript/Vitest/build duplicados de `bt-oficial-01.yml`, condicionar Android o agrupar builds CP03/CP04/CP05 puede ahorrar más, pero **podría reducir la cobertura actual**. Propuesta retenida para aprobación independiente del Director, no implementada.

## 5. Riesgos y protección

- Un push de código siempre activa CI; SQL crítico en `docs/sql` **no** está entre las rutas ignoradas. Cambios mixtos código+documentación tampoco se ignoran.
- En una sucesión de pushes, un run antiguo puede aparecer cancelado: la validación relevante será la del nuevo HEAD. Las pruebas manuales/PR permanecen aisladas por `run_id`.
- Caché npm es solo almacén de paquetes, no artefactos de compilación ni credenciales. Se conserva lockfile versionado.
- La aplicación desplegada en Render tiene flujo de publicación independiente; no se modificó ningún despliegue, workflow de deploy, token ni presupuesto.
- Para reducir más ejecuciones por cambios de frontend, primero aprobar qué check es requerido y dónde se verificará sin duplicación; no suprimir controles Auth/RLS ni laboratorios SQL por ahorrar minutos.

## 6. Trabajo local aconsejado

Codex ejecuta TypeScript, pruebas `vitest` del módulo modificado, build web y ensayos visuales pertinentes **antes de un push único**. Para CP05, Docker/PostgreSQL local y verificación PDF; para cambios críticos de Auth/RLS, mantener validación aislada y CI aplicable. Evitar múltiples commits de ajustes cosméticos en `main` mientras queda poco saldo. El objetivo es un solo cierre validado por entrega.

## 7. Continuidad

Se conserva CP05 preparado, **no operativo** (`ac81526`). No se activa SQL alojado, Storage, Edge ni correo. Siguiente bloque real: respaldo recuperable actualizado, aprobación explícita de SQL CP05 y persistencia alojada con cliente sintético; luego emisión/archivo bajo autorización separada. No iniciar CP06 antes de validar CP05.