# BT-FLOW-NEXT-01-R1-FIX-ID — identidad de navegación

Fecha 25/11/2026, Chile. Referencia privada `88a2c7f4b66100a47d65ccf4d7d090aeaa454bc8`, carpeta BT-FLOW-NEXT-01-R1-VISUAL. Huella obligatoria verificada `59e5a2c0325b34a5d15b676b1ca10a84dac3df9373ee18b2e3404a5a0fbc761d`, 58/58 archivos coincidentes antes de corregir. Base oficial `5e9b6195ddc7a5905d68c76a1553055daa2422f2`.

## Defecto y corrección

La clave de instancia dependía de serializar guidedStart, que conservaba la entrada inicial aunque resume cambiara internamente de OT. Se separan la entrada de apertura, la identidad efectiva de la visita y la generación de instancia de React.

Workspace comunica orderId y vehicleId a través de onVisitChange después de obtener y validar el registro del servidor. App conserva esa identidad efectiva en una referencia. Solicitar la misma OT confirmada muestra la instancia existente y sus campos. Retomar atención activa mantiene su comportamiento de visibilidad, sin cambiar la instancia.

Solicitar otra OT limpia o iniciar un nuevo ingreso permitido incrementa la generación de instancia y entrega una nueva entrada al componente. Las entradas vacías o de vehículo representan un ingreso independiente. Si hay cambios pendientes, se muestra la atención activa y se conserva la protección existente. Una entrada nueva no crea una OT por sí sola.

Las notificaciones de identidad y cambios pendientes solo afectan al contexto si pertenecen a la generación montada vigente. Se conservan las guardas de lectura y descarte de respuestas tardías. La selección interna de otra OT conserva la instancia padre y actualiza su identidad efectiva. resume impide sustituir el contexto si hay observaciones, autoguardados, formularios o recepción sin guardar. Retomar el mismo id pendiente conserva su formulario.

Los únicos cambios de producción están en App.tsx y GuidedWorkspace.tsx. No se cambian estilos, contratos, puertos, validadores ni persistencia SQL. El guardado de la cotización sigue limitado a la OT por el puerto aceptado B01. El cotejo de alcance y las validaciones de escritura B02–B04 conservan su implementación.

## Validación focalizada final

El runner verify-flow-next-fix-id-browser.cjs usa AppShell, React y SDK reales con HTTP sintético, dos OT del mismo taller y fallos controlados de escritura.

1. A → selección interna B → cerrar → solicitud externa A. Recupera A y se comprueba que esta secuencia es de solo lectura. El cambio interno conserva el nodo raíz; abrir A desde B limpia crea el contexto necesario.
2. Entrada vacía → seleccionar B → cerrar → nuevo ingreso. Recupera una entrada vacía independiente. Cerrar una entrada vacía limpia e iniciarla de nuevo crea otra instancia. El número de órdenes permanece igual.
3. Un borrador técnico de A se conserva al cerrar/retomar y al solicitar explícitamente A. Se comparan identidad del nodo de workspace, identidad del input y texto. Solicitar B mientras ese borrador está pendiente conserva A.
4. Los intentos de escritura y los hallazgos confirmados pertenecen solo a A. Se verifica el order_id incluso en intentos rechazados por el servidor sintético.
5. Una respuesta de lectura de B retenida hasta después de navegar fuera del recorrido no puede sustituir la identidad A confirmada. La instancia deja de estar ocupada al terminar.

TypeScript PASS. Dos archivos Vitest, cinco pruebas focalizadas de renderizado/navegación y aislamiento del puerto CP05 PASS. Builds público y privado con Agenda, PWA, grafo y marca PASS. Los logs finales se transfieren con el candidato. No se repiten las suites completas ni los escenarios visuales de la entrega anterior.

## Preservación y límites

Las tres carpetas anteriores de revisión se conservan íntegramente. Los archivos visuales R2 y los contratos aceptados B01–B04 conservan sus bytes. El único ajuste adyacente es la guarda de selección interna necesaria para proteger el borrador al cambiar de identidad.

La identidad de navegación y la generación de React son locales a la instancia. La OT persistida continúa siendo la autoridad. Una recarga completa conserva los mecanismos de recuperación y reanudación preexistentes. La limitación de atomicidad de alcance sigue bajo evaluación y esta corrección no modifica esa garantía.

Las pruebas son sintéticas y no equivalen a QA alojada. Se mantienen las restricciones de correo OFF, Auto-Deploy OFF, R2 pausado y respaldo diferido. La transferencia se autoriza exclusivamente a bytetorque-review/main/BT-FLOW-NEXT-01-R1-FIX-ID/.


> Nota de integración 26/11/2026: documento histórico. El dictamen, restricciones vigentes y aceptación pendiente constan en [checkpoint de integración](CHECKPOINT_BT_FLOW_NEXT_01_INTEGRACION_20261126.md). Las capturas y logs de revisión se conservan en el repositorio privado, no se publican con el código.
