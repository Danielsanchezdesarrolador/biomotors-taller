# BT-UI-04 — Datos vinculados y registro demostrativo

## Alcance actual

Clientes y vehículos es una interfaz DEMO sin backend, Auth, tokens públicos, correo ni pagos. Los cinco clientes iniciales usan contactos sintéticos (`example.com`, teléfonos 9 0000...), direcciones de muestra, patentes DEMO y ningún RUT. Los KPI 1.284 / 1.679 / 86 / 42 son ilustrativos y se identifican como tales; no se deducen de las cinco fichas.

`src/ordenes/ordenesData.ts` conserva los antecedentes compartidos de órdenes, vehículos y pendientes. `src/clientes/clientesData.ts` agrupa explícitamente los ocho vehículos de esas órdenes en cinco clientes; el resto de las vistas deriva de esas relaciones. OT-1002 mantiene María Torres / Hyundai / KZV-482 y su diseño existente. El primer cliente, Camila, tiene Toyota y Suzuki para no asignarle por error el Hyundai de María. Se reemplazaron nombres genéricos de las demás órdenes por sus nombres ficticios compartidos, sin cambiar el diseño de órdenes. La creación de OT elimina clientes duplicados y permite elegir entre sus vehículos.

Relación DEMO: Cliente → Vehículo → Orden → Observación. Historial y observaciones filtran por vehículo; los pendientes también comprueban el cliente. Los hallazgos del primer vehículo se definen en su orden compartida, no en una segunda lista contradictoria. Una visita antigua sin orden navegable abre el antecedente y declara esa limitación.

La ficha ampliada enlaza órdenes y presenta contacto, vehículos, historial, pendientes y referencias de documentos. Desde Ver cliente/Ver vehículo en la orden se puede volver a la ficha correcta. Los documentos históricos son referencias de demostración, no PDFs emitidos ni envíos reales; `emailVerified` permanece falso y `deliveryStatus` indica no enviado.

## Formularios y límites de memoria

Nuevo cliente valida nombre, email, móvil chileno y confirmación de uso de datos ficticios. Dirección y comuna son opcionales. Se añade una ficha temporal sin vehículos ni historial; no se fabrica un vehículo o una OT. Al cambiar de módulo o recargar se pierde. Las fichas nuevas de este formulario todavía no se comparten con el estado de creación de órdenes; las asociaciones compartidas iniciales sí están conectadas.

Generar enlace abre una explicación y una vista de formulario público DEMO dentro de un diálogo. No se crea token, URL compartible, enlace de almacenamiento ni acción de WhatsApp/correo. La simulación indica expresamente que no hubo registro real, verificación de correo ni envío al taller. No utiliza fetch, almacenamiento persistente o APIs de Supabase. El formulario solo modifica estado React local.

## Contrato para una futura etapa de backend (no implementado)

- Claves estables y `workshop_id`/tenant en clientes, vehículos, órdenes, revisiones, observaciones, documentos y bitácora; relaciones y RLS comprobadas con pruebas de acceso cruzado. No inferir identidad por nombre, patente o posición en un array como mecanismo de seguridad.
- Invitación individual con token aleatorio criptográfico de alta entropía (p. ej. al menos 192 bits); almacenar su hash, expiración y límite de uso. Validación en servidor, consumo atómico y vínculo exclusivo con el taller emisor. No incluir claves administrativas ni permisos para enumerar talleres.
- Protección contra abuso: limitación de intentos, cuotas y controles para automatización. Minimización de datos, aviso de privacidad definitivo, finalidad, responsable, conservación y derechos conforme a la normativa chilena aplicable antes del uso real.
- El taller verifica antecedentes; verificar el email mediante un flujo seguro antes de entregar documentos privados. Un email escrito en un formulario no constituye email verificado.
- Enviar un informe requerirá documento generado en backend, permisos del taller, destinatario confirmado, proveedor de correo aprobado e idempotencia. Registrar documento, orden, cliente, destinatario, fecha, estado y resultado de entrega. Sin envíos automáticos solo por cerrar una revisión.
- Preservar los pendientes no reparados por orden y vehículo en futuras visitas; no borrarlos al finalizar una orden. Historial durable con fechas, kilometraje, técnico, reparaciones, ítems, presupuestos, informes y entregas.

Todo ello requiere una tarea posterior autorizada. BT-UI-04 no activa estos servicios ni avanza a Informes y cotizaciones.
