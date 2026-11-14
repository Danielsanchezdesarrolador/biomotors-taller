# ByteTorque — Guion de revisión integral del Director (BT-FLOW-01 A–E)

**Estado:** guía para revisión *después* de terminar BT-FLOW-01E, conforme a instrucción del Director. No constituye aprobación visual ni prueba Safari física.  
**Entorno:** https://biomotors-taller-demo.onrender.com · Web/PWA Safari iPhone · **solo DEMO**.  
**Advertencia:** utilizar exclusivamente contactos inventados (correos @example.com) y no registrar datos reales del taller. Los datos de esta sesión se pierden al recargar.

## Camino principal desde cero

1. **Inicio:** confirmar cinco menús R2, bloque «Nuevo ingreso de vehículo», expedientes activos y botón Continuar. En móvil cuatro tarjetas visibles y botón Ver todos.
2. **Recepción:** registrar un cliente y un vehículo ficticios, kilometraje y motivo simple; comprobar que las correcciones se conservan al retroceder. Repetir una visita con el mismo vehículo y otro kilometraje para asegurar expedientes diferentes.
3. **OT:** confirmar creación solo una vez. Revisar que cliente, vehículo, motivo y km estén copiados sin transcribir; no se crea una segunda OT al reingresar.
4. **Multipunto:** abrir BT-INS-01, comprobar 34 componentes, observaciones y estados sin revisar; finalizar solo cuando corresponda. No convertir controles no revisados en OK.
5. **Propuesta profesional:** escribir diagnóstico distinto del motivo del cliente, definir repuestos e ítems, mano de obra, cantidades y precios con criterio del mecánico; la aplicación no debe decidirlos sola.
6. **Cotización:** revisar subtotal, IVA 19 %, total, fecha y condiciones. Confirmar que el documento tiene IDs/versión y se puede imprimir A4.
7. **Respuesta:** registrar «Aceptada DEMO», «Rechazada DEMO» o «Solicita cambios DEMO». Verificar que rechazo/cambios bloqueen ejecución guiada. Editar precio para observar la caducidad de la respuesta anterior.
8. **Informe:** desde aceptación vigente, precargar con confirmación explícita y todo sin realizar. Marcar solamente algunos ítems como realizados. Verificar que el total y la impresión incluyen exclusivamente los marcados.
9. **Pausa:** registrar espera por repuestos ficticios con nota. Intentar cierre y comprobar bloqueo. Resolver con una nota y confirmación.
10. **Entrega:** revisar inspección, ítems realizados, no realizados y controles no revisados; describir los pendientes. Marcar cuatro comprobaciones; confirmar en diálogo y verificar «Entrega DEMO completada».
11. **Continuidad:** abrir otros paneles y volver al mismo expediente sin pérdida de IDs; verificar que no reabre otro vehículo. Recargar y comprobar que las altas DEMO y su entrega temporal desaparecen como se advierte.

## Caminos excepcionales

- Cliente que no autoriza: registrar respuesta «Rechazada DEMO» y/o espera correspondiente; ejecución guiada y entrega deben bloquearse.
- Cliente solicita cambios: editar cotización, revisar nueva versión, registrar nueva respuesta; la aceptación anterior queda histórica pero no vigente.
- Trabajo adicional: generar una nueva propuesta/cotización con confirmación; nunca se marca ejecutado automáticamente.
- Falta de repuestos/vehículo pendiente: pausa en historial, resolver con explicación explícita; no cerrar con pausas activas.
- Cancelación: confirmación explícita, sin borrar documentos y sin entrega.
- Revisión posterior a entrega: debe abrirse otra visita al mismo vehículo; no alterar un cierre como si siguiera vigente. Si se edita un documento antiguo en esta DEMO, la constancia de cierre anterior se marca desactualizada.

## Comprobaciones de experiencia

- Escritorio 1650/1440, tablet 768, iPhone Safari físico y móvil 390/375.
- Botones accesibles, foco de teclado, lectura de textos largos, scroll de hitos, menú fijo que no tape CTA ni campos al abrir teclado iPhone.
- Los estados bloqueados explican **qué falta** en lenguaje sencillo.
- Ninguna interacción debería abrir un enlace público real, enviar correo, guardar datos personales, firmar, cobrar, tocar Supabase o afirmar respaldo.
- Comparar el resultado con mockups aprobados y revisar las capturas/versiones en el checkpoint.
- La aprobación del Director debe quedar como una decisión separada del CI, de Render y de la prueba física Safari.

## Puerta posterior de producto real

Antes de poner ByteTorque en manos de clientes reales se requieren: BT-CP02-D con aislamiento multitenant probado, datos persistentes y respaldos, roles y auditoría, política de privacidad/consentimiento, envío de presupuestos, PDFs descargables, control de firma/aceptación, control de planes desde servidor y pruebas Android nativas. Ninguna de esas actividades queda implícitamente autorizada por haber terminado la DEMO A–E.
