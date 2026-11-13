# BT-UI-05 — Documentos, cotizaciones y envíos DEMO

## Modelo y relaciones

Los documentos usan `workshopId`, `clientId`, `vehicleId` y `orderId`. Las identidades se recuperan del directorio DEMO de Clientes y de las órdenes existentes, sin inventar propietarios diferentes. `documentContext` valida la relación antes de renderizar o simular un envío. El taller es exclusivamente ficticio (`workshop-demo`); estas comprobaciones de cliente no sustituyen autorización de servidor ni RLS.

Estados documentales: Borrador / Pendiente / Enviado / Error. Se incluyen seis documentos de muestra (cinco recientes y cuatro eventos ficticios de envío). INF-2047 pertenece a Paula y su Chevrolet; COT-1083 a María y su Hyundai, de acuerdo con las fuentes compartidas y no con los nombres ilustrativos del mockup. Todos los destinatarios son sintéticos `@example.com`, sin verificación real.

El informe guarda una copia editable de diagnóstico, trabajo, recomendaciones, pendientes, inspección e ítems de su orden. La cotización reutiliza `calculateTotals` de BT-UI-03; no hay una segunda implementación del cálculo financiero. Permite altas, edición y eliminación de ítems, cantidades fraccionarias, precios CLP, IVA ilustrativo opcional y vigencia. El precio de 1,5 h × $24.900 y su IVA mantienen los resultados validados de OT. No se generan documentos tributarios.

## Memoria de sesión y documentos históricos

`orderSession.ts` conserva solo en memoria la revisión de cada OT abierta (inspección, ítems y referencia de orden). Se recupera al volver a la ficha o crear un documento. Esto amplía el comportamiento de UI-03: cerrar una ficha ya no elimina sus ítems antes de preparar el informe; **recargar sigue descartándolo todo**. Los avisos y la prueba de regresión se actualizaron para reflejarlo. No se modificó el aspecto de OT.

`reportSession.ts` retiene documentos preparados, selección y eventos DEMO al cambiar de panel, hasta recargar. Los borradores abiertos en un diálogo cancelado se descartan. Se usan copias independientes: corregir un informe no altera la OT. Los documentos históricos nacen de la revisión base, no de ediciones actuales; una edición de la OT no reescribe el historial ficticio.

No se utilizan localStorage, sessionStorage, IndexedDB, APIs de Supabase ni servicios de correo para estos datos. El estado de OT y la ficha de cliente continúan siendo demostrativos, sin una base persistente; esta memoria no constituye auditoría ni guardado real.

## Vista previa, impresión y PDF

La vista previa es **HTML**, denominada «Vista previa DEMO». Cambia según documento y tipo. Puede ampliarse, imprimirse y mostrar contenidos técnicos o tabla económica. Los estilos de impresión presentan solo la hoja seleccionada, con marca DEMO, sin la interfaz de la aplicación.

**No hay descarga directa de PDF implementada ni PDF adjunto**. El control «PDF pendiente» explica la limitación y permite abrir impresión. El navegador puede ofrecer Guardar como PDF; no se presume esa acción ni se inventa tamaño de archivo. La referencia visible se identifica como HTML, se puede quitar y restaurar, y no pretende ser un archivo adjunto. Un PDF generado por las herramientas de QA es evidencia de impresión, no una función de adjuntar/enviar dentro del producto.

## Simulación de envío

El diálogo identifica documento, cliente, vehículo y destinatario. Solo admite formatos sintéticos `@example.com`. Confirmar añade un evento **Simulación local**, con resultado exacto «Simulación completada. No se envió ningún correo real.». El documento queda **Pendiente**, nunca se marca como Enviado por una simulación, y las etapas PDF generado/Correo enviado permanecen no realizadas para documentos actuales. Un segundo intento de la misma simulación se bloquea para no duplicar eventos.

Los eventos iniciales Enviado/Error y sus etapas se etiquetan como históricos ficticios. El reintento de un Error solo ejecuta la misma simulación local. El registro no incluye identificadores de proveedores ni archivos inexistentes. `fileRef` es null. Por vehículo filtra exclusivamente las relaciones del automóvil elegido; el registro ampliado muestra origen, fecha, destinatario y resultado.

Los KPI 128 / 18 / 12 / 2 son estadísticas ilustrativas, no contadores de operaciones reales.

## Backend y correo — etapa futura, sin activar

1. Auth y membresía del taller; `workshop_id` y claves foráneas coherentes, RLS y pruebas de aislamiento para cada documento, archivo y evento.
2. Identidad del taller, cliente/vehículo/OT e inspección autorizadas; versionado de documentos y conservación de pendientes no reparados.
3. Correo del cliente verificado, revisión de antecedentes, confirmación del destinatario y consentimiento/información aplicables.
4. Generación de PDF definitivo en backend, almacenamiento privado y enlaces de acceso firmados con vencimiento; ningún secreto administrativo en frontend.
5. Proveedor transaccional autorizado, cola de envíos, idempotencia y claves de deduplicación, reintentos limitados, clasificación de errores y registro auditable del resultado.
6. Confirmación del destinatario antes de enviar; documento, OT, cliente, vehículo, taller, fecha de intento, referencia de archivo y resultado real en la bitácora. No marcar Enviado por emitir una solicitud: usar evidencia del proveedor y distinguir entrega, rechazo y rebote.

Nada de ello está activo en BT-UI-05. Configuración, Supabase, correo, pagos y Android quedan fuera de esta tarea.

## Regla de planes para informes personalizados — BT-PLAN-02 (13/11/2026)

**Básico** usa las plantillas predeterminadas ByteTorque. **Plus y Full** podrán subir/gestionar formatos propios de informes del taller, cuando exista backend de almacenamiento seguro y control por suscripción. Esta función **no está implementada** en BT-UI-05. La importación de archivos no equivale a conversión automática en formulario editable; adaptación interactiva requiere mapeo y aprobación posterior. La plantilla multipunto de Ignacio constituye una plantilla inicial compartida solo cuando su contenido y derechos de uso estén aprobados. No modificar el editor DEMO en paralelo con BT-INS-01.
