# Validación focalizada ejecutada

Se conservan íntegros 01B, sus resultados y archivos. No se ejecutaron SEC07, respaldo real, suites SQL históricas completas ni suites ajenas. La preparación de PostgreSQL reutiliza fixtures oficiales y no sus assertions históricas.

| Área | Ejecución y resultado |
|---|---|
| RI-01 | SQL real: directo→borrador, una confirmación, expiración original, bytes limpios/marcados separados. UI real: escritorio 1440 y móvil 390 con SDK instalado y HTTP sintético. PASS. |
| RI-02 | Doble clic, UUID estable tras respuesta perdida/status incierto, consentimiento consumido, nueva revisión y expiración sin fallback 0→1. PASS Chromium. |
| RI-03 | HTTP retenido en prepare/status/refresh/resume/renew/read, orden nueva, autoridad, desmontaje/remontaje, busy de otro contexto, denegación antigua y limpieza defensiva de denegación actual. PASS Chromium/StrictMode. |
| RI-04 | WebKit ausente, Deno ausente y Playwright ausente en modo CI: exit 1 con causa verificada. Rechazo de filtros parciales en CI. PASS del contrato de fallo obligatorio; no PASS del navegador/runtime ausente. |
| RI-05 | SQL real: domingo→lunes sintético, diez consumos lunes, cambio de semana sintético durante lock observado, lease vencido con reloj real durante lock, un único t aunque la publicación cruce el límite, promoción que conserva confirmed_at, DST. PASS. |
| Escritor V1 | Reproducción PostgreSQL del defecto anterior y rechazo de la undécima confirmación multipunto con el guard nuevo. Reloj de semana explícitamente sintético. PASS. |
| Canonicalidad | Cinco solicitudes gratuitas y dos conexiones independientes devuelven el mismo job/bytes; jobs/artifacts/consumo constantes. PASS. |
| Proyección | Allowlist real SQL, mapper tipado, identidad de scope, nota astral de 2.000 caracteres y digest de fuente. PASS. |
| Reconciliación | NOT_PREPARED autorizado sin datos ajenos, resume inexistente 404, expiración efectiva sin escritura de job y taller ajeno denegado. Denegación entre info y prepare recuperable con consentimiento nuevo. PASS. |
| Histórico | Fixture explícito V1 con crédito expirado/sesión retirada; autorización actual, bytes exactos, sin rerender ni consumo adicional; acceso a reloj/counters privados denegado. PASS. |
| Límite técnico | 120 verificaciones permitidas; siguiente 429; recuperación después de ventana; consumo sin cambios. PASS. |
| PDF | pdftotext ejecutado sobre los dos PDFs generados: borrador marcado y definitivo limpio. PASS. |
| Compatibilidad UI | Tres viewports del ejecutor existente directamente afectado. PASS. |
| Paquetes | Dos salidas independientes, todos sus hashes coinciden; Node ESM/adaptador con entrada original, sin tráfico real. PASS de esta fase. Deno nativo BLOCKED_ENVIRONMENT. |
| Builds | TypeScript, build público/privado, guards de bundle/PWA/R2 y sintaxis de archivos afectados. PASS según logs. |

Núcleo PostgreSQL: diez casos registrados más una prueba histórica/privilegios, una del escritor V1 y una de status/reconciliación. Chromium: quince escenarios nuevos distintos (cinco de crédito/consentimiento/reconciliación y diez de cercas; los ocho iniciales de RI-03 se ampliaron tras detectar la invalidación antigua en repository), y tres regresiones existentes afectadas. Los JSON conservan alcance y fases; no se suman repeticiones como casos nuevos.

WebKit y Deno siguen pendientes de CI oficial. Las pruebas de clasificador que exigen su FAILURE al faltar **no** equivalen a ejecutarlos. El nuevo test Deno nativo está preparado y tiene sintaxis JavaScript comprobada, pero no se ejecutó nativamente en Codex. No se instalaron navegadores/runtimes ni se modificó red.

Fallos iniciales diagnosticados: definición SQL multilínea debía recuperarse como JSON para preservar el cuerpo; fixture React necesitaba una llave de cierre y URL absoluta para FunctionsClient; al podar campos se detectó y corrigió la vinculación H_source/H_snapshot. Se repitieron solo pruebas nuevas afectadas. La ronda SQL final usa el registro de policy actual y termina en PASS. No se cambió el entrypoint para corregir expectativas de test.
