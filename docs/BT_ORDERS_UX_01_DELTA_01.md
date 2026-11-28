# BT-ORDERS-UX-01-DELTA-01 — RI-01 y RI-02

27/11/2026 (America/Santiago). **Candidato incremental para revisión independiente; no aceptación oficial.** Base oficial de referencia7616d09ad4a2d4dbadc0dcfe35dbf5be095a09a6. Base exclusiva del delta:4535b99f672d8d415641524e48afb2abe61c757b, árbol3959413bbd2c14543f48d16c9755de2662e99730, entrega original1ff89e0002d7166d8c866da06d708e949aa13eba. SHA/árbol nuevos e inventario: CANDIDATO.json de la carpeta privada BT-ORDERS-UX-01-DELTA-01.

Se leyeron AGENTS.md, agent.md, roadmap.md y el checkpoint BT_ORDERS_UX_01; se conserva su diagnóstico y la evidencia previa. Revisión independiente favorable de arquitectura/alcance y20/20 blobs es antecedente comunicado por Dirección Técnica. No se convierte en aceptación oficial ni en una nueva ejecución de las pruebas originales.

## RI-01 — navegación de ejecutores

Los ejecutores de piloto todavía asumían recepción desplegada, botones documentales expuestos, retorno por «Volver a la orden» y listado móvil siempre visible. Se reutiliza ordersNavigation.cjs aprobado: openReception, openDocuments y selectOrder, que abren controles reales y esperan la OT autorizada lista, sin force clicks ni modificar CSS/producto para facilitar pruebas. El retorno usa la pestaña semántica Resumen y comprueba aria-selected.

verify-pilot-fix-browser.cjs conserva34 ítems, confirmación veraz de guardado, ausencia de menciones técnicas innecesarias, modo ready solo lectura, tamaño/cierre del visor, ninguna escritura al cerrarlo, recuperación CP05 sin RPC de mutación y una sola cotización. Se mantienen los dos tamaños1440/390.

verify-pilot-fix-mileage.cjs conserva rechazo de120.00 sin crear vehículo,120.000→120000 en vehículo/recepción, error de guardado sin falso éxito, aviso de copia temporal, reintento confirmado, nota completa y tamaño de campo, PDF centrado y cierre. Ahora espera el resultado confirmado de búsqueda de vehículo antes de editar el kilometraje de recepción: el autollenado asíncrono no puede competir con fill(). Se afirma el valor literal introducido y una sola escritura de vehículo/OT, con todos los hallazgos en su taller/OT correctos.

La aserción antigua #view=FitH ya no describía el visor compartido aprobado en C. Se sustituye por la misma propiedad observable: Blob autorizado, Zoom100%, transform scale1 y ancho del iframe igual al contenido útil real del canvas, descontando su padding. No se cambia PdfViewer ni PDF alguno; no se elimina la comprobación de ajuste ni se amplía su tolerancia de1px. Se elimina la espera fija del visor a favor de esperar su iframe.

## Otros ejecutores revisados directamente

- verify-cp05-order-selector.cjs: crear recepción desde el selector mantenido en memoria abre el panel contextual. Se conserva el nodo/borrador CP05, refresco exacto, estado de error, recuperación y descarte de respuesta antigua; se ejecuta el caso móvil390 afectado.
- verify-cp04-pdf.cjs: abre Documentos y usa el iframe/descarga autorizada del modal compartido existente, conservando bytes/hash idénticos, nombre INS-QA1234, cero escrituras y revocación de acceso/visor. La descarga se realiza mediante el botón autorizado dentro del modal, no haciendo clic al fondo inert. businessWrites es el clasificador exacto ya aprobado: consulta de capacidades vía POST y acción documental de lectura no son escrituras comerciales; RPC desconocida u otra mutación sigue contando como escritura. No se añade una excepción genérica a POST. Se ejecutan1366/390.
- verify-flow-next-r1-browser.cjs: el retorno móvil desde recorrido a otra OT utiliza selectOrder. Se cambia solo esa selección, sin tocar escenarios/aserciones del recorrido. El mecanismo de selección real se ejerce en los dos escenarios RI-01; **la suite R1 completa no se repite ni se declara PASS nuevo**.
- verify-cp04-current-diagnosis.cjs: la cobertura de campos llama al nuevo verificador compartido de RI-02. Las aserciones históricas de diagnóstico/persistencia/roles/documentos permanecen. **No se repite el recorrido completo de dos visitas**: la nueva comprobación se ejecuta directamente con datos sintéticos de la forma real.
- verify-cp05-browser, verify-pilot-documents y verify-flow-next-fix-id-browser se revisan: sus selecciones iniciales abren un listado todavía visible; el último opera en escritorio1440, sin ocultamiento contextual. No necesitan cambios por estas observaciones. verify-multipunto-ui pertenece a la DEMO; las rutas de Hardening/Documents usan sus propios fixtures de visor, sin la recepción/listado de Órdenes. No se modifican ni se repiten esas suites.

## RI-02 — cobertura de campos con scroll principal

Se retira header.height<650: no demuestra acceso a ningún control. El helper ordersCoverage.cjs se ejecuta tanto desde el punto histórico de verify-cp04-current-diagnosis como desde verify-orders-coverage.cjs, sin repetir su suite histórica.

El ejecutor dedicado confirma dos notas sintéticas en componentes0/33 mediante la cola existente y espera «Guardado». Luego conserva instantánea de hallazgos y contador de escrituras antes de comprobar geometría. Se usan filas inicial/intermedia/final y sus botones Limpiar, notas inicial/final, las cuatro pestañas, desplegable de diagnóstico adicional, categoría, resultado, nota y botón Guardar. Hay18 observaciones por tamaño y cinco puntos de hit-testing por control (centro y cuatro interiores):36 observaciones/180 puntos positivos en los dos tamaños exigidos. Se añade una comprobación390×950 del mismo helper porque lo consume el ejecutor histórico móvil; total54 observaciones/270 puntos positivos, sin repetir su recorrido histórico.

Cada observación lleva coordenadas/viewport/scrollY/rect de cabecera y resultado de document.elementFromPoint. Requiere el control completo dentro del viewport, impacto en el propio nodo o descendiente en todos los puntos, y ausencia de solape con la cabecera sticky. click(trial:true) añade la comprobación real de actionability sin ejecutar escrituras. Se utiliza scrollIntoView, scroll principal y rueda reales, sin alterar estilos para conseguir PASS. También se enfoca la nota y se navega con Tab al botón Guardar, verificando foco efectivo y hit-testing del control enfocado; no se modifica el texto.

En1440×1000 se comprueba position:sticky y que la cabecera alcanza realmente top0; en1366×650 se comprueba position:static, conforme al diseño aprobado para notebook bajo. Solo el listado contextual puede tener scroll independiente. Los hallazgos y el número de escrituras comerciales permanecen idénticos durante la comprobación, sin guardar el diagnóstico adicional.

**Control negativo:** tras las pruebas positivas se altera exclusivamente el DOM del navegador de laboratorio para situar una cabecera fija de600px sobre un control. La antigua condición <650 seguiría pasando, pero el nuevo hit-testing debe rechazar el control cubierto. Se detecta en los tres tamaños y se restauran los estilos originales en finally. No es un cambio de CSS/código del candidato ni se usa esa mutación para producir un PASS positivo.

## Pruebas efectivamente ejecutadas

| Ejecutor afectado | Tamaños/casos | Resultado |
|---|---|---|
|verify-pilot-fix-browser|1440/390, inspección/PDF/solo lectura/recuperación CP05|2 PASS|
|verify-pilot-fix-mileage|1440/390, km/guardado/notas/visor/escrituras únicas|2 PASS|
|verify-cp04-pdf|1366/390, exportación/identidad bytes/revocación|2 PASS|
|verify-cp05-order-selector|390, recepción desde módulo mantenido/recuperación/respuesta antigua|1 PASS|
|verify-orders-coverage|1440×1000 sticky,1366×650 static y consumidor móvil390×950; controles negativos incluidos|3 PASS|

**Total:10 registros Chromium focalizados PASS (9 exigidos y1 de compatibilidad del consumidor móvil).** Los controles negativos forman parte de esos tres casos, no se suman como escenarios independientes. Las iteraciones fallidas se conservan y no se suman a éxitos. Los resultados finales y capturas están en evidence; el script CP04 PDF histórico expresa sus éxitos mediante propiedades true, no un campo status, que el agregado identifica explícitamente.

Sintaxis de ocho CommonJS modificados/nuevos, compilación sintáctica Python y YAML/permisos/matriz CI PASS. No se ejecutan TypeScript/builds porque no hay cambios de producto/TS/configuración de build. No se repiten las30 unitarias,10 escenarios originales Chromium, suites documentales anteriores, laboratorio SQL, respaldos ni SEC07. La exportación CP04 se ejecuta por el acceso modal modificado, no como repetición rutinaria de C completo.

WebKit **BLOCKED_ENVIRONMENT**, ejecutable ausente,0 intentos de descarga, sin buscar alternativas ni cambiar red. Se añade workflow exclusivo RI con Chromium/WebKit y runner de los cinco ejecutores afectados; no ejecuta unitarias/SQL/builds/cuenta personal ni las suites originales. CP04 PDF y selector CP05 admiten el motor seleccionado, sin cambiar su predeterminado Chromium. El runner Python y workflow se validan por sintaxis; **no se ejecutan de nuevo localmente para repetir los diez casos ni se afirma CI remota PASS**. La validación oficial WebKit permanece pendiente.

## Errores encontrados y correcciones del delta

1. Navegación obsoleta tras cambio a recepción contextual/grupos/pestañas: usar helpers aprobados y controles semánticos reales; conservar aserciones de negocio.
2. Competencia de fill(km) con la búsqueda/autollenado de vehículo: esperar el resultado encontrado antes de introducir el valor y afirmar el literal. No se modificó el parser ni el callback productivo.
3. Fragmento PDF anterior al visor C: comprobar Zoom100%/scale1 y geometría útil, sin modificar el visor. La primera medición incluía el padding del canvas: se corrigió la fórmula según el CSS aprobado, sin debilitar el ajuste esperado.
4. Un selector exacto «Resultado» no coincidía con el nombre accesible real del select que incluye opciones: usar combobox con prefijo Resultado, acotado al formulario de diagnóstico. No se amplían timeouts ni se fuerzan clics.
5. Cobertura por altura insuficiente: geometría/hit-testing/teclado y control negativo la reemplazan; no fue necesario corregir la cabecera ni cambiar valores visuales R2.

## Integridad, reproducción y límites

Se trabaja en un clon aislado del commit4535, conservando la copia original. Los455 archivos comprobados de src/server/supabase/SQL/assets/public/apps y manifiestos/configuración siguen idénticos a la base del delta. Ninguna modificación de UI, negocio, seguridad comercial, Auth, SQL/RLS, Edge, Storage, GATE4, documentos, planes, dependencias o servicios. No se modifican workflows históricos; solo se añade uno focalizado para estas observaciones. Las aserciones de las rutas no intervenidas se conservan.

La entrega privada incremental contiene diff binario full-index, snapshots de archivos afectados, base/candidato/árbol, inventario/manifiesto SHA-256, logs/resultados/capturas, checkpoint y actualización de AGENTS/agent/roadmap. Para reproducir: reconstruir primero el árbol3959413 de la entrega original desde7616; verificarlo, aplicar delta.patch con --check y comprobar el nuevo árbol de CANDIDATO.json. No es necesario que el objeto del commit4535 esté publicado en el repositorio oficial. Ejecutar los cinco comandos documentados o el runner nuevo únicamente en laboratorio con herramientas instaladas y HTTP sintético. No aplicar el delta sobre7616 sin la entrega original.

DTK-ERR-056: carpeta nueva privada main/BT-ORDERS-UX-01-DELTA-01, commit/push normal solo revisión, cotejo remoto de todos los archivos y comparación de árboles de las entregas anteriores. SHA candidato ≠ SHA transferencia. No credenciales, .env, node_modules ni datos personales; los registros/capturas son sintéticos. Las fichas ERR-029/056/062 ya cubren estos problemas de selectores/fases de solicitudes/transferencia, por lo que no se crean duplicados ni se publica en el toolkit.

Riesgos/pendientes: WebKit/CI oficial, dispositivos físicos y lector de pantalla. Los hit-tests son prueba local de acceso en los dos viewports solicitados, no certificación WCAG integral ni de todos los tamaños/zoom/teclados del sistema. Los fixtures no sustituyen SQL/RLS/JWT alojados. No se certifica de nuevo todo R1 o las suites históricas no ejecutadas. La revisión funcional/visual original no se sustituye por estas pruebas automatizadas.

Integración futura solo tras revisión de Dirección Técnica y CI autorizada; si la base avanzó, reconciliar sin sobrescribir cambios ajenos. El delta modifica pruebas/documentación, no tiene activación ni rollback SQL/servicios. Reversión futura autorizada mediante revert del commit integrado o diff inverso revisado; no borrar datos ni documentos. No push oficial, nuevas ramas, producción, despliegues, infraestructura, activación de servicios o SEC07. No declarar aceptación oficial ni iniciar otros trabajos.
