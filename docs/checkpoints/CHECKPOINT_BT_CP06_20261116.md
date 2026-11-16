# CP06 — CANDIDATA EN CÓDIGO; NO OPERATIVA

16/11/2026. Base `main` verificada y actualizada por fast-forward a `9d8db4c`. Sin cambios concurrentes detectados en fetch final. Orden ejecutada: `docs/BT_CP06_ENTREGA_CODIGO_HISTORIAL_20261116.md`. Un cierre y un push de código para esta entrega, sin ramas nuevas. El SHA de este commit se obtiene con `git log -1 --format=%H -- docs/checkpoints/CHECKPOINT_BT_CP06_20261116.md` y se entrega en el informe final.

## Funcionalidad implementada

En la ficha CP03, «Ver historial» abre una vista integrada en Clientes y vehículos, sin sexto menú. Muestra vehículo verificado, visitas por recepción descendente, estado de OT, motivo original, kilometraje, fecha de cierre y hallazgos registrados dentro de cada visita. No infiere diagnósticos ni reparaciones de las X ni interpreta una OT cerrada como trabajo ejecutado.

Paginación real de 20 visitas con cursor `opened_at DESC, id DESC`, incluidos empates y microsegundos PostgreSQL; no reutiliza el límite de 40 órdenes recientes. Los hallazgos se consultan solo para las OTs de esa página con filtros de taller/vehículo y paginación interna de 200 para no truncar inspecciones numerosas. Los pendientes `attention + pending` tienen su propia consulta/paginación: siguen visibles desde visitas anteriores aunque la OT esté cerrada. Una resolución registrada permanece en la visita; sale de los pendientes vigentes.

«Abrir OT de origen» y «Abrir orden de trabajo» reutilizan CP04, incluso para una OT ausente de los 40 recientes mediante el nuevo parámetro opcional `initialOrderId`. Volver conserva la ficha CP03 seleccionada y permite consultar nuevamente desde el servidor. La consulta tras nueva sesión requiere seleccionar otra vez el vehículo autorizado; no depende de una copia del historial en sessionStorage. Abrir CP04 conserva las facultades de su editor existente, no añade escrituras al repositorio CP06.

CP05 se integra como lectura opcional de familias, snapshots emitidos y eventos, vinculados a las mismas OTs/vehículo. El estado actual del borrador/anulación no reemplaza el snapshot ni recalcula su total histórico. El enlace abre el panel CP05 existente y permite volver al historial. Con CP05 OFF no se consultan ni importan módulos de datos CP05 en el build CP06 aislado; si está ON pero no hay tablas, solo se advierte que las cotizaciones no están disponibles y continúan las visitas/inspecciones. No se habilita emisión, aceptación, factura ni correo.

Estados de carga, vacío, error/reintento, más visitas, más pendientes y actualización de consulta. Botones táctiles y tarjetas R2 reutilizados, conservando cinco menús. Las 34 X/autoguardado, modelo SQL CP04, Auth y código Android no se modificaron.

## Seguridad y activación

Repositorio CP06 estrictamente read-only: `vehicle`, `visits`, `pending`, `dispose`. Mismo SDK publicable autenticado del binding CP03. No se construye otra instancia ni se toman permisos de la elección visual de rol.

Verifica Auth/getUser y correo confirmado, identidad, membresía activa con rol coherente y taller activo antes de leer y antes de devolver resultados. Admite lectura para owner/admin/reception/mechanic, sin ampliar sus rutas Auth existentes. RLS del servidor conserva autoridad; siempre hay filtros de taller/vehículo, validación de relaciones y rechazo de filas cruzadas. AbortController/dispose y secuencias de vista impiden pintar respuestas de un contexto desmontado. Una denegación limpia resultados y solicita revalidación usando el método existente del controlador, sin modificar Auth.

`VITE_BT_CP06_PRIVATE_ENABLED=false` por defecto. El build privado exige Auth + CP03 + CP04; CP05 es opcional y sigue OFF. Se verifica exclusión del grafo cuando corresponde. No hay acceso desde revisión pública/DEMO.

**No se ejecutó SQL, migración, respaldo, cambio Auth/RLS, Storage, Edge, correo, secretos, cuentas o datos personales alojados.** No hay nueva tabla ni política que instalar para el historial CP03/CP04. No se tocó Render Environment ni se pidió despliegue manual. Un push a `main` puede publicar código inactivo mediante el automatismo ya existente; no constituye autorización ni activación CP06. Persistencia alojada y prueba de uso del historial no están certificadas.

## Ronda consolidada local

| Prueba | Resultado |
|---|---|
| TypeScript | PASS |
| Vitest | **569/569, 62 archivos**: conserva 552, añade 17 CP06 |
| Casos unitarios CP06 | 45 visitas en tres páginas sin duplicados, empates/microsegundos, OT cerrada, pendientes/resueltos, 225 hallazgos sin truncación, pendientes paginados, vacío, CP05 OFF y tablas ausentes, snapshots históricos, cuatro roles solo lectura, A/B, correo no confirmado, taller suspendido, identidad cambiada, membresía revocada durante consulta, dispose/abort y respuesta tardía |
| SDK/HTTP navegador | Chromium Linux **1440/390/375 PASS**; 45 visitas, 25 pendientes, fallo y reintento de página sin perder las anteriores; móvil además apertura de OT antigua, regreso a ficha, logout/login, vacío, error, retorno durante consulta demorada y revocación |
| Red de la prueba | **0 escrituras REST, 0 requests CP05**, todas las respuestas Supabase interceptadas; no cuentas ni RLS alojadas probadas |
| Builds/PWA | Público, privado con CP05/CP06 OFF, CP06 ON + CP05 OFF y CP05/CP06 ON PASS; controles de marca, grafo y exclusión de fixtures PASS. Tras revisión visual se corrigió el ámbito de estilos de botones y se recompiló el candidato aislado |
| Regresión crítica | 552 pruebas previas conservadas; cambios CP04 limitados a selección inicial opcional. Sin cambios de checklist, autosave, Auth, SQL ni Android |
| CI remoto | Consulta Actions bloqueada por proxy **Forbidden**; no se declara PASS. El build candidato existente se amplió a CP05/CP06 sin añadir jobs o ejecuciones manuales, manteniendo concurrencia/caché/rutas optimizadas |
| SQL/RLS | Ningún SQL nuevo; A/B y revocación de esta entrega son SDK/HTTP sintéticos. No equivalen a prueba RLS alojada |
| Safari/iPhone y Android físicos | No ejecutados; pendientes de puerta final |

Evidencia: [capturas y registros](../screenshots/CP06_20261116/README.md). Scripts: `npm run typecheck`, `npm test`, `npm run build`, `scripts/verify-cp06-browser.cjs`. Sin nuevas dependencias ni gasto de infraestructura. No se lanzaron workflows manuales ni rondas repetidas de Actions; iteraciones locales solo para implementación/correcciones y cierre.

## Archivos y pendientes

Nuevos `src/historial/contracts.ts`, `repository.ts`, `VehicleHistory.tsx`, `history.css`, `history.test.ts`; loader privado CP06. Adaptaciones puntuales en CP03, parámetro opcional CP04, flag/boundary de builds, CI existente, script navegador, roadmap y matriz. Se conserva `artifacts/` local previo fuera del commit.

Pendientes: revisión del Director e Ignacio; aprobación final agrupada de respaldo/activaciones y pruebas reales de persistencia/aislamiento con sesiones autorizadas; CP05 alojado sigue sin instalar; activar CP06 solo con autorización; consulta del CI por SHA cuando el acceso permita; QA físico iPhone/Safari y Android. No se iniciaron comercialización, pagos, nuevos servicios ni la paridad Android: esta última y la matriz del piloto siguen como próximo bloque autorizado por separado.
