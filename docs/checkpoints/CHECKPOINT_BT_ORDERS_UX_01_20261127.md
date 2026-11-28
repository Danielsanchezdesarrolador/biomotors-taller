# CHECKPOINT BT-ORDERS-UX-01 — 27/11/2026

**Estado: CANDIDATE_READY_FOR_INDEPENDENT_REVIEW_WITH_ENV_PENDING.** No aceptación comercial/visual oficial ni despliegue. Base `7616d09ad4a2d4dbadc0dcfe35dbf5be095a09a6` comprobada contra main antes de trabajar. SHA/árbol candidato y transferencia: ver CANDIDATO.json y commit de la carpeta privada BT-ORDERS-UX-01; no se introduce una referencia circular al commit de este archivo.

[Informe completo](../BT_ORDERS_UX_01.md): diagnóstico, arquitectura,26 filas de matriz, medidas, contratos, errores/soluciones, riesgos e integración/reversión. Se leyeron AGENTS, agent, roadmap, R2, cierre C aceptado y checkpoints CP05/FLOW_UX/EXP01. DTK-ERR-015/029/056/062 reutilizados; no fichas duplicadas ni push toolkit.

## Candidato

Listado/detalle integrados; recepción única contextual conservando DOM/borrador; indicadores desplegables; acciones semánticas agrupadas, recorrido principal con condiciones anteriores; tabs con claves estables; un scroll de diagnóstico; cabecera sticky solo con espacio; multipunto34 con progreso/texto/cola veraces y44px táctiles. R2 preservado. Opt-in workspacePresentation limita la presentación nueva a Órdenes; guided y documento compartidos intactos.

Solo tres archivos de producto: src/ordenes/Cp04OrdersView.tsx, Cp04MultipuntoChecklist.tsx y ordersWorkspace.css. Scripts/fixtures/workflow/docs constan en inventario privado. AGENTS.md, agent.md y roadmap.md se actualizan sin borrar antecedentes. Sin nueva lógica de creación, permisos, transiciones, persistencia, estados, consumos o callbacks. El contrato de recepción mantiene un envelope temporal: cambiar usuario/taller lo limpia; no hay caché nueva.

## Validación efectiva

-30 unitarias únicas PASS:29 afectadas existentes y1 nueva de frontera; ejecuciones separadas, sin sumar repeticiones.
-10 escenarios Chromium nuevos PASS, incluido responsive en9 tamaños/orientación y reanudación/frontera guiada.
-5 regresiones C PASS:visor1366/390, StrictMode, ZIP Full y Plus móvil; UUID/hash/consumo y zoom sin HTTP.
-12 regresiones seleccionadas PASS:CP04 rediseño1366 y4estados error/vacío/loading/revocación; F03–F06 móvil390; CP05 compacto1366; persistencia1366; diagnóstico vigente1366 con2visitas.
-TypeScript, builds público/privado/fronteras y sintaxis/YAML PASS; build final posterior al opt-in.
-WebKit **BLOCKED_ENVIRONMENT**,0 descargas/alternativas/cambios de red. Workflow Chromium/WebKit preparado para CI oficial, no ejecutado en GitHub. QA física/PWA/lector de pantalla y aprobación visual del titular pendientes.

Logs originales de intentos, resultados finales y capturas sintéticas antes/después incluidos. No se confunden fixtures con RLS/JWT alojados. No laboratorio SQL, auditorías históricas, respaldos ni suites generales repetidas.

A1650 detalle1163→387px; acciones1272→514; pestañas1354→658. En1366×650 acciones479, pestañas623. Diagnóstico sin overflow interno; solo listado contextual puede desplazar. El alto total puede aumentar al eliminar el recorte interno: no se presenta como una reducción de toda la página.

## Fronteras e integridad

Comparar árboles/blobs protegidos con base: server, SQL/supabase, Auth, planes, contratos/repositorio/cola/borrador CP04, CP05/archivo, PDF/visor, App/guided/layout/Home, assets y dependencias. DTK-ERR-056: únicamente carpeta nueva privada en main, diff binario incremental, snapshots, inventario, manifest SHA-256, reconstrucción exacta de árbol y cotejo remoto de todos los bytes. Evidencia de transferencia separada del SHA del candidato. Entregas anteriores conservadas.

No push oficial ni force push, ramas adicionales, producción, Supabase/Render/Edge, SQL alojado, GATE4, secretos, servicios, correo/pagos/logo/registro, Auto-Deploy o SEC07. C_ACCEPTED_PASS, reglas B0/2/4 y documentos históricos se preservan. Riesgo residual MEDIO, revisión independiente y CI antes de cualquier integración autorizada. No iniciar bloques futuros.
