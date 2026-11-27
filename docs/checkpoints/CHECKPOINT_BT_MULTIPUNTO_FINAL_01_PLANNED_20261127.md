# BT-MULTIPUNTO-FINAL-01 — PLANNED

27/11/2026 UTC. El titular aprueba incorporar al roadmap la emisión del informe multipunto definitivo, conservando el borrador. Este checkpoint registra requisitos, no una implementación ni una autorización de despliegue.

## Evidencia de partida

Durante aceptación comercial, Full fue visible con 1/8 mecánicos activos y consumos iniciales cero. El titular descargó el PDF multipunto de la OT de prueba TEST12 y aportó un PDF A4 con 34 componentes y leyenda Borrador no enviado. La consulta de solo lectura de la tabla privada de consumos confirmó una operación multipunto, estado confirmed, plan full, a las 12:37:09 UTC, 268853 bytes. La interfaz actual ofrece vista previa y Descargar borrador; ambas usan el servicio comercial y la identidad de operación compartida, no una descarga libre. No existe actualmente emisión multipunto definitiva independiente. Fuentes: src/ordenes/Cp04MultipuntoPdfPreview.tsx, src/ordenes/Cp04OrdersView.tsx, server/commercial/documentHandler.ts. Aceptación comercial general todavía pendiente; la sincronización visual del contador posterior no se acredita aquí.

## Alcance aprobado

- Conservar Vista previa PDF y Descargar borrador con identificación inequívoca como borrador, sin envío ni archivo definitivo.
- Agregar Emitir informe definitivo y acceso a su PDF profesional sin la leyenda de borrador, apto para entrega manual al cliente. Datos confirmados, 34 componentes y plantilla oficial A4; no presentar una inspección como certificación de reparaciones o seguridad de circulación.
- Archivar el definitivo en el expediente privado de la visita, con identidad comercial confirmada, fecha, revisión, trazabilidad e integridad de bytes/hash; conservar originales históricos sin sobrescribir. La vista previa del definitivo y descarga respetan autorización vigente.
- Básico no obtiene exportaciones multipunto; Plus conserva 10 por semana comercial; Full sin límite comercial, con antiabuso. Borrador y definitivo sujetos a autorización comercial de servidor. Requisito de producto: no duplicar consumo por convertir el mismo snapshot autorizado de borrador a definitivo. Diseñar y validar una transición explícita ligada a taller, actor autorizado, recurso y huella/revisión, sin bypass por cambio de plan, sesión, datos, concurrencia, caché o URL. Si cambian datos, nueva revisión y regla de consumo conforme al contrato aprobado; concretar ventana y semántica antes de implementar. No relajar reglas actuales ni habilitar acceso indefinido.
- Reutilizar pipeline de renderizado y archivo privado existente cuando sea compatible; extender RLS/Storage, recuperación integrada y auditoría según corresponda. No generar PDF limpio localmente ni exponer claves. Idempotencia de emisión y de reintentos, concurrencia, revocación, aislamiento entre talleres, fallo de archivo y recuperación verificables. No enviar correos hasta bloque independiente autorizado.
- Mejora visual asociada, sin impacto en reglas: mostrar en Full “1 utilizada · Sin límite comercial” o plural correcto, evitando “1 de sin límite comercial utilizadas”.

## Secuencia y aceptación

Primero cerrar BT-WORKSHOP-COMMERCIAL-01 (aceptación de Básico/Plus/Full, consumos, idempotencia, aislamiento y recuperación Full). Después BT-MULTIPUNTO-FINAL-01 antes de habilitar envío comercial de documentos por correo y antes del piloto Ignacio. Mantener bloques de logos privados, registro autónomo seguro, correo y móviles previstos; este requisito se inserta inmediatamente después de aceptación comercial, sin activar servicios pendientes. Preparar candidato y revisión independiente, pruebas focalizadas, aprobación de cambios de infraestructura y aceptación física. Sin iniciar desarrollo ni desplegar en esta intervención. Auto-Deploy OFF verificado. SEC07 cerrado para piloto inicial; extender recuperación solo a nuevos artefactos cuando se implementen.
