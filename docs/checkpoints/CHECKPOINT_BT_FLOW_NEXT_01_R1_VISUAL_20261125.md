# BT-FLOW-NEXT-01-R1-VISUAL — refinamiento R2 para revisión

Fecha 25/11/2026, Chile. Referencia R1 privada `186ab368af5326495f6e2804b8a1ad0a7a6e0182`. Base oficial `5e9b6195ddc7a5905d68c76a1553055daa2422f2`. La aprobación técnica independiente continúa pendiente.

## Implementación visual

Continuidad reutiliza los tokens existentes de premium.css, el hero-workshop.webp oficial, AppShell y los iconos lineales de lucide-react. Los cambios de producción se limitan a la presentación JSX de GuidedWorkspace y a reglas CSS del espacio de continuidad.

El encabezado adopta el tratamiento claro del taller usado en los módulos R2. Las tarjetas blancas usan borde y sombra oficiales. Presupuesto y revisión vigentes, hallazgos, partidas y cotejo humano tienen jerarquía propia. En escritorio, cotejo y ejecución se distribuyen en dos columnas. En móvil se leen secuencialmente.

Los checkboxes tienen 20 px y etiquetas táctiles de al menos 44 px. Las acciones secundarias usan superficies claras y bordes R2. La acción principal reutiliza azul/acento. El pie de acciones está en el flujo del documento y permite acceder al contenido completo. La navegación global usa el AppShell existente.

La ejecución conserva trabajos/repuestos, decisiones, totales, observaciones y confirmación obligatoria en orden de lectura. Se muestran las advertencias originales sobre borradores, declaración del operador y aprobación del cliente. Las acciones internas que R1 delegaba al pie conservan esa delegación.

## Biblioteca permanente

`docs/design/referencias-r2/README.md` contiene tokens, componentes y rutas de assets y referencias gráficas. AGENTS.md incorpora la regla permanente de consulta previa y visualización de la biblioteca R2.

Se observaron las siete capturas del propietario y se registra la procedencia sintética comunicada, sin certificar anonimización individual. Sus originales no están disponibles como archivos de imagen identificados en el workspace. El índice registra su procedencia en esta conversación. Las capturas de evidencia se generan sobre fixtures sintéticos y los assets aprobados existentes.

## Preservación funcional

La comparación AST de Workspace confirma que todas sus declaraciones anteriores al retorno JSX son idénticas a R1. Los contratos, repositorios, guardas y validaciones B01–B05 conservan sus bytes. El frame de AppShell añadido al harness se activa únicamente con el parámetro shell de la entrada de prueba. Los módulos de producto utilizados como referencia permanecen iguales.

La aprobación humana y el cotejo explícito conservan sus callbacks. La limitación de atomicidad de lecturas y escrituras documentada en R1 sigue bajo evaluación independiente. El refinamiento visual no cambia esa garantía.

## Validación final focalizada

- Chromium, 7 escenas a 1440, 390 y 375 px, 21 comprobaciones y 21 capturas.
- Escenas de avance, inspección, cotización, aprobación, ejecución, entrega y expediente.
- Verificación de ausencia de desplazamiento horizontal, tamaño de casillas y etiquetas, pie estático y acción principal accesible al desplazarse, foco/teclado para confirmaciones y bloqueo de ejecución sin cotejo.
- Dos archivos Vitest y seis pruebas focalizadas de continuidad y aislamiento por OT PASS.
- Builds público y privado con Agenda, TypeScript, PWA, grafo de módulos y marca PASS. La advertencia de tamaño del bundle privado persiste.
- Los archivos visuales y del runner conservaron sus hashes después de la validación final. La documentación y las copias de capturas se incorporaron a continuación.

## Comparación con referencias oficiales

La composición ahora comparte el encabezado claro con imagen, tarjetas blancas, bordes y sombras del Inicio, Agenda y CP04. Las acciones recuperan la identidad azul de CP05. El formulario de cotejo se organiza por contenido operativo y la casilla recupera la proporción de los controles de acceso R2. El pie deja de flotar sobre el formulario del recorrido.

Se reutilizan los recursos de marca desde sus rutas existentes. Las capturas nuevas muestran el AppShell real con identidad sintética de prueba para facilitar el cotejo con las referencias del propietario.

## Entrega y límites

Transferencia autorizada exclusivamente a `bytetorque-review/main/BT-FLOW-NEXT-01-R1-VISUAL/`. Incluye diff incremental sobre R1, archivos afectados, identificación, hashes, resultados y capturas. Las carpetas original y R1 se conservan.

La validación de Chromium corresponde a un laboratorio sintético. La aceptación artística del propietario, la revisión técnica independiente y la QA alojada siguen pendientes. Se conserva la limitación de atomicidad, el respaldo diferido y las restricciones productivas de R1.


> Nota de integración 26/11/2026: documento histórico. El dictamen, restricciones vigentes y aceptación pendiente constan en [checkpoint de integración](CHECKPOINT_BT_FLOW_NEXT_01_INTEGRACION_20261126.md). Las capturas y logs de revisión se conservan en el repositorio privado, no se publican con el código.
