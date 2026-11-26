# BT-FLOW-NEXT-01-R1 — corrección focalizada para revisión

Fecha 25/11/2026, Chile. Base oficial `5e9b6195ddc7a5905d68c76a1553055daa2422f2`. Original revisado en commit `3d9fd504eb1ce7a1724c42f460b1f212f0e4e80a` de bytetorque-review. El candidato R1 es el working tree local y sus archivos nuevos.

## Correcciones

B01. `orderWorkspace` limita lecturas, listas, creación, guardado, revisión, anulación y emisión a una única OT. Rechaza resultados tardíos tras disponer el contexto. QuotePanel usa `orderLocked`, mantiene la presentación completa, bloquea el selector y excluye el flujo interno de ejecución. Los componentes están identificados por OT y etapa.

B02. La evidencia de inspección se deriva de registros existentes con `ok`, `attention` y `not_checked`. El resumen distingue revisados, declarados sin revisar y reparaciones resueltas. Una inspección parcial puede continuar mediante confirmación explícita, sin completar ficticiamente las otras casillas. `not_applicable` conserva su uso exclusivo como resolución. Los registros históricos parciales dejan de depender de 34 revisiones técnicas.

B03. Se elimina la comparación de timestamps. Se cotejan identidad y partidas de la cotización vigente frente a su revisión inmutable. El operador debe revisar explícitamente los hallazgos y el presupuesto antes de acciones dependientes. La evidencia del cotejo incluye diagnósticos y notas, sin depender de created_at o updated_at. Resolver un hallazgo conserva el cotejo si el diagnóstico y la nota no cambian. Una nota nueva requiere recotejo y permite conservar el presupuesto. La acción de trabajos adicionales llama a la revisión CP05 existente, exige motivo, confirma el borrador y abre el editor. El backend exige la aprobación de la nueva revisión emitida.

B04. El flujo consulta OT, cotización, revisión, aprobación y antecedentes antes de invocar saveAction. El puerto de cotización y FlowLive02Panel repiten la validación antes de sus escrituras internas. Una OT cancelada, una revisión obsoleta o un alcance pendiente bloquean la escritura dependiente. La respuesta confirmada se consulta antes de actualizar progreso y navegar. Cambios de contexto invalidan respuestas tardías. Las guardas LIVE-02 del servidor se conservan.

B05. El menú global muestra la sección seleccionada y conserva el recorrido oculto y montado. Retomar atención activa recupera los mismos campos. Salir del recorrido devuelve al módulo sin destruir los borradores. Consultar otra OT es libre. Abrir otra atención con cambios pendientes exige conservarlos primero. Una respuesta pendiente al navegar libera el estado ocupado sin cambiar automáticamente de etapa.

La entrada anticipada de Agenda conserva sus contratos y callbacks existentes. `recentOrders` sigue excluyendo planificadas cuando Agenda está habilitada. La cotización anticipada sigue usando su editor existente y la recepción reutiliza la misma OT antes de abrir continuidad.

## Validación final

- 12 archivos Vitest, 80 pruebas focalizadas PASS. Cubren aislamiento entre dos OT, respuestas obsoletas, inspecciones parciales/históricas, presupuestos y observaciones, guardas LIVE-02, borradores, navegación y Agenda.
- Chromium, 1366 y 390 px. 16 comprobaciones de escenarios PASS, incluyendo AppShell real con SDK y HTTP sintético, retención de nodos de borrador y navegación durante consulta pendiente.
- Build público y build privado con Agenda, TypeScript, exclusión de fixtures, PWA y marca PASS según los logs finales incluidos. El build privado conserva la advertencia de tamaño de chunks.
- La prueba de navegador usa fixtures sintéticos y evita servicios alojados. La suite histórica completa de 832 pruebas se conserva como evidencia de la entrega anterior.

## Límites

El cotejo del alcance es una confirmación operativa en memoria, ligada a la evidencia recién consultada. Se solicita de nuevo después de una recarga o cuando cambian los hallazgos, notas o presupuesto. La aprobación del cliente sigue siendo un registro de servidor referido a la revisión emitida. El sistema no infiere automáticamente impacto económico de una observación.

El contrato actual no asocia cada hallazgo con una partida económica. El operador debe determinar esa asociación durante el cotejo. Las RPC existentes validan revisión, aprobación, importes y contexto. La lectura previa y la escritura son operaciones separadas, por lo que el cotejo local de hallazgos no es atómico frente a otra edición concurrente. Un control transaccional de esa asociación requeriría una propuesta de persistencia y guardas SQL con autorización específica. Esta entrega utiliza el cotejo operativo explícito y los contratos existentes.

Una inspección vacía puede continuar mediante confirmación local, pero el modelo carece de un registro persistido de finalización de inspección vacía. Al reabrirla seguirá pendiente. Los componentes sin revisar conservan ese estado. No hay nuevos resultados SQL ni migraciones.

La aceptación alojada con la OT QA existente y la revisión independiente del delta siguen pendientes. Las restricciones de correo OFF, Auto-Deploy OFF, R2 pausado y respaldo diferido se conservan.

## Evidencia

Los logs finales y la matriz B01–B05 están en la carpeta privada de revisión R1. Las capturas locales están en `docs/screenshots/bt-flow-next-01-r1/`, con cotización de OT fija, cotejo de alcance y borrador recuperado a 1366 y 390 px. Los manifiestos identifican el candidato final y el código validado.


> Nota de integración 26/11/2026: documento histórico. El dictamen, restricciones vigentes y aceptación pendiente constan en [checkpoint de integración](CHECKPOINT_BT_FLOW_NEXT_01_INTEGRACION_20261126.md). Las capturas y logs de revisión se conservan en el repositorio privado, no se publican con el código.
