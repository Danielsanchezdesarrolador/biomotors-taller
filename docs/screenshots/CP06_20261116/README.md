# CP06 · evidencia de código candidato, 16/11/2026

Capturas reales de **Chromium Linux con HTTP Supabase sintético interceptado**. No prueban persistencia alojada, Safari físico ni datos reales de Ignacio. Ninguna solicitud REST de escritura ni consulta a tablas CP05 (flag OFF).

| Tamaño | Entrada y pendientes | Cronología |
|---|---|---|
| 1440 | [Historial](historial-1440.png) | [Visitas](cronologia-1440.png) |
| 390 | [Historial](historial-390.png) | [Visitas](cronologia-390.png) |
| 375 | [Historial](historial-375.png) | [Visitas](cronologia-375.png) |

[Vacío](vacio-390.png) · [Error](error-390.png) · [Resultados](results.json).

45 visitas, 25 pendientes de una OT antigua, tres páginas de visitas, paginación independiente de pendientes, resolución registrada, cierre sin afirmar reparación. En móvil: OT original fuera de las 40 recientes, regreso a historial/ficha, logout/login y consulta nueva, respuesta demorada descartada al volver y revocación de membresía que desmonta la vista.

Reproducción: harness de loopback con Auth/CP03/CP04/CP06 true y CP05 false; `CP04_BASE_URL=http://127.0.0.1:5186 node scripts/verify-cp06-browser.cjs`. No ejecutar contra datos/credenciales alojados. El script intercepta todos los endpoints Supabase con fixtures controlados.

[Vitest](vitest.txt) · [TypeScript](typescript.txt) · [Build CP06 con CP05 OFF](build-cp06-cp05-off.txt) · [Build combinado](build-combined.txt). Capturas revisadas visualmente; botones reutilizan las clases R2 existentes.
