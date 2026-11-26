# BT-PLAN-04BC-CI-FIX-02

26/11/2026, Chile. Base oficial `f549b0846bdd50bb16d223f5adb279e2fa9915c1`. Única rama main. Delta local de simuladores/aserciones para revisión privada, sin cambios productivos.

**Estado: Chromium completado; WebKit `BLOCKED_ENVIRONMENT`, pendiente de CI oficial por instrucción de Dirección Técnica.** No declarar PASS del workflow completo. Corrección y recorridos disponibles terminados; no intentar nuevas descargas, instalaciones alternativas ni cambios de red.

## Causa y solución consolidada

El contrato Auth añade `bt_plan04_operations_status` como consulta de capacidades mediante POST. El fixture compartido CP04 solo admitía tablas de negocio tras Auth; rechazaba esa RPC. Los consumidores también confundían el nuevo POST con una escritura o con una petición comercial adicional. Fallo reportado en [run 45878153701](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45878153701).

- `tests/harness/cp04BrowserFixture.cjs`: ruta RPC exacta antes del dispatcher de tablas. Exige POST sin query, única clave `p_workshop_id`, taller del fixture y Bearer sintético de la identidad prevista. Devuelve 403 ante revocación. Capacidades OFF por defecto; solo opciones explícitas del fixture permiten activarlas. Desconocidos siguen fallando. Exporta clasificación exacta de esta lectura y contador de mutaciones comerciales; otras RPC y métodos distintos de GET siguen contándose como escrituras.
- `tests/harness/cp05BrowserFixture.cjs`: delega expresamente esa RPC al validador compartido, sin doble registro ni ampliación del dispatcher CP05. La opción documental QA ya existente queda vinculada a la capacidad sintética explícita; no activa documentos en el workflow normal, que los mantiene OFF.
- `scripts/verify-cp04-redesign.cjs`: la auditoría permite únicamente ese POST de lectura adicional; mantiene sus restantes restricciones y aserciones de guardado/aislamiento.
- `scripts/verify-cp05-browser.cjs`: las comprobaciones de pestañas e historial excluyen únicamente la consulta exacta de capacidades. Conservan todas las peticiones restantes y los controles de ausencia de escrituras/refetch, reconciliación y revisiones inmutables.
- `scripts/verify-ux-persist.cjs`: el control de no duplicar escrituras durante revalidación cuenta mutaciones comerciales, no consultas de capacidades. También cuenta PATCH y otros métodos no GET, en vez de limitarse al POST. Las comprobaciones de lecturas de negocio, DOM/cursor/scroll, borradores, sesión, rol y aislamiento se conservan.
- `scripts/verify-pilot-qa04b.cjs`: revisado y ejecutado sin modificar; sus contadores ya delimitaban tabla y método. Los doce casos F01–F06 conservan el control de no repetir POST/PATCH al recuperar lecturas.

No se modifica lógica productiva, SQL aprobado, RLS, permisos, workflows ni dependencias. El simulador Auth R1 anterior y el laboratorio SQL aprobado permanecen intactos.

## Validación efectiva del resto del workflow

Se prepararon bundles locales público OFF, CP04, CP05 y R1 y harness UX exclusivamente como prerrequisitos. Se usaron los mismos flags relevantes que `.github/workflows/bt-oficial-01.yml`, HTTP interceptado y datos sintéticos.

| Ejecutor | Resultado local |
| --- | --- |
| CP04 redesign | PASS, siete tamaños y estados negativos; aserciones y capturas de inspección preservadas. |
| Pilot QA04B | PASS, F01–F06 en 390 y 1366; doce casos, sin duplicar escrituras. |
| CP05 browser | PASS, siete tamaños, documentos OFF, borradores/PDF e historial inmutable. |
| UX persist Chromium | PASS, 1366/390/768, sesión/DOM/borradores/PDF/historial y límites de autoridad. |
| Último paso Auth R1 del workflow | PASS, 19 grupos, incluido público OFF y ausencia de tráfico externo en sus escenarios. |
| UX persist WebKit | `BLOCKED_ENVIRONMENT` al arrancar: ejecutable `webkit-2388/pw_run.sh` ausente. No se ejecutaron escenarios. |
| R2 WebKit posterior | `BLOCKED_ENVIRONMENT` al arrancar por el mismo ejecutable ausente. No se ejecutaron escenarios. |

Se intentaron expresamente ambos ejecutores WebKit; no se sustituyó el motor ni se eliminaron escenarios para obtener verde. La descarga oficial mediante Playwright falló con `403 Domain forbidden`. El estado observado del entorno confirma red restringida/enforced y ausencia de los hosts `cdn.playwright.dev` y `playwright.download.prss.microsoft.com` en su allowlist. Tras registrar el bloqueo, Dirección Técnica instruyó completar Chromium y dejar WebKit pendiente de CI oficial, sin modificar políticas, buscar instalaciones alternativas ni intentar nuevas descargas. Se acata esa instrucción: no se modificó red, proxy o TLS, no se eludió la política y no se repitieron intentos. Los logs se conservan; los escenarios WebKit y su motor siguen en el workflow sin supresiones. No equivale a Safari físico.

Sintaxis de los cinco CJS modificados y del ejecutor QA04B revisado, whitespace y comparación de árboles productivos contra la base: PASS. El paquete documenta reconstrucción exacta del árbol por el diff y hashes. No se repitieron laboratorio SQL, 122 unitarias, 51 SQL, 25 de revocación, respaldos ni SEC07. No se relanzó CI oficial.

## Entrega

Solo el delta mediante DTK-ERR-056 a `bytetorque-review/main/BT-PLAN-04BC-CI-FIX-02/`, con nueve archivos afectados (cinco de prueba y cuatro documentales), diff binario, SHA/árbol de candidato en `CANDIDATO.json`, evidencias y SHA-256. WebKit con estado explícito `BLOCKED_ENVIRONMENT`, pendiente de CI oficial según autorización; no se declara aprobación integral remota. Entregas anteriores intactas. Sin push oficial ni cambios en Supabase, Render, Edge o producción. No activar logos, correo, pagos, cuentas ni migraciones.

Documentación consultada: AGENTS/agent/roadmap recientes, checkpoint CI-FIX anterior, workflow de interfaz pública, seis ejecutores/fixtures indicados y consumidores del fixture compartido. Para el bloqueo de red se consultó la guía cloud-environment-runtime y el estado vigente del entorno. Siguiente paso: revisión e integración por Dirección Técnica y validación WebKit en GitHub Actions; no intentar resolver restricciones del entorno local.
