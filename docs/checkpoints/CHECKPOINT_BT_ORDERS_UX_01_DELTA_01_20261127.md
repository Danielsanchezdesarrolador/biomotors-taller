# CHECKPOINT BT-ORDERS-UX-01-DELTA-01 — 27/11/2026

**Estado: PREPARADO_PARA_REVISION_INDEPENDIENTE; WEBKIT_PENDIENTE_ENTORNO. No aceptación oficial.**

Base oficial de referencia7616d09ad4a2d4dbadc0dcfe35dbf5be095a09a6. Base exclusiva del delta4535b99f672d8d415641524e48afb2abe61c757b / árbol3959413bbd2c14543f48d16c9755de2662e99730. Entrega original1ff89e0002d7166d8c866da06d708e949aa13eba, preservada. Identificación del nuevo candidato/árbol y transferencia en CANDIDATO.json de la carpeta privada nueva BT-ORDERS-UX-01-DELTA-01; sin autorreferencia circular al SHA del checkpoint.

[Informe](../BT_ORDERS_UX_01_DELTA_01.md): continuidad leída, diagnóstico, soluciones, inventario, ejecuciones efectivas, límites y reproducción. AGENTS.md, agent.md y roadmap.md actualizados sin eliminar antecedentes.

RI-01: adaptar dos ejecutores piloto a recepción contextual, Documentos, Resumen y Cambiar de orden usando helpers aprobados. Preservar km120.000→120000/rechazo decimal, confirmación de guardado, notas, persistencia, solo lectura, bytes PDF/visor y ausencia de duplicación. Esperar búsqueda/autollenado antes de editar km. Verificador PDF al contrato C:100%/scale1 y ancho útil del canvas, no fragmento obsoleto. Otros afectados:selector CP05, exportación CP04, selección móvil de retorno R1. No nueva lógica productiva ni exenciones genéricas de POST.

RI-02: reemplazar el límite de altura histórico por helper real de geometría, hit-testing y foco.18 controles×5puntos por viewport;1440×1000 sticky real/top0 y1366×650 static.36 observaciones/180 puntos positivos exigidos y18/90 adicionales en390×950 por el consumidor móvil, tres controles negativos detectados con cabecera artificial600px que habría pasado el criterio antiguo; estilos restaurados. Scroll principal, notas/controles/pestañas accesibles, cero escrituras durante comprobación y hallazgos intactos.

Validación:10 registros Chromium focalizados PASS (piloto2, km2, exportación2, selector1, geometría3). Sintaxis8CJS/Python/YAML PASS. No repetir30 unitarias,10 escenarios originales Chromium, C completo, SQL, respaldos o SEC07. Current-diagnosis y R1 completos NOT_RUN; se ejercen nuevo helper geométrico y selección móvil comunes sin repetir sus recorridos históricos. Intentos fallidos y correcciones documentados, no sumados como éxitos.

WebKit BLOCKED_ENVIRONMENT,0 descargas/alternativas/red. Workflow nuevo exclusivo RI con Chromium/WebKit y cinco ejecutores, CI remota no ejecutada. QA física/lector de pantalla pendiente, sin certificación WCAG integral ni de servidor alojado.

455 archivos protegidos idénticos a4535. Producto/visual R2, src, backend, Auth, RLS/SQL, GATE4, Edge, documentos/visor, planes, dependencias, configuración e infraestructura intactos. Delta de pruebas/CI/documentación únicamente. DTK-ERR-056 privado:diff incremental/snapshots/manifiesto, árbol exacto desde4535, cotejo remoto completo y entregas anteriores intactas. Sin push oficial, force push, ramas adicionales, producción, despliegues ni activación de servicios. Revisión independiente y CI antes de cualquier integración futura autorizada.
