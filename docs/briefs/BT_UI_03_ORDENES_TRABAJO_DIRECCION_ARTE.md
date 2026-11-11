# ByteTorque — Prompt maestro para Director de Arte

## BT-UI-03 — Panel «Órdenes de trabajo» con identidad premium R2 OFICIAL

**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`  
**Rama:** `main`  
**Web de revisión:** https://biomotors-taller-demo.onrender.com  
**Producto:** ByteTorque  
**Plataforma de esta etapa:** web escritorio + Safari/iPhone PWA  
**Android:** React Native/Expo nativa en `apps/android/` — conservarla; adaptar al final y no generar APK ahora.

### 1. Rol y objetivo

Asume la **Dirección de Arte Senior y el diseño UI/UX de ByteTorque**, con responsabilidad de implementar una interfaz comercial de alta fidelidad.

**El Director del proyecto aprobó explícitamente el Inicio BT-UI-02-R2 como IDENTIDAD VISUAL OFICIAL.** Tu siguiente tarea es desarrollar **Órdenes de trabajo** como continuación de la misma aplicación, no como un producto diferente.

Lee, antes de modificar archivos:

- `AGENTS.md`
- `roadmap.md`
- `docs/SISTEMA_VISUAL_OFICIAL_R2.md`
- `docs/checkpoints/CHECKPOINT_BT_UI_02_R2_20261111.md`
- `src/App.tsx`, `src/styles.css`, `src/premium.css`
- `docs/FLUJO_WEB_PRIMERO_APK_NATIVA.md`

Utiliza la versión R2 publicada en Render y sus capturas aprobadas como **referencia visual vinculante**, no como inspiración.

### 2. Reglas de continuidad visual — OBLIGATORIAS

**No cambiar absolutamente nada del diseño aprobado de Inicio:** no tocar su composición, hero, tarjetas, gráfico, botones, colores, iconos ni espaciados. Mantén igual la sidebar, topbar, avatar demo, buscador, menú móvil y marca ByteTorque cuando entres al panel Órdenes.

Extiende los patrones ya existentes: navy profundo, azul eléctrico, fondo hielo, tarjetas blancas con sombras ligeras, iconos de línea, títulos Inter, estados suaves y separaciones de R2.

No inventes un segundo sistema de diseño. Evita nuevos menús o variantes arbitrarias. Si necesitas componentes nuevos, crea patrones reutilizables consistentes con R2.

**El panel «Órdenes de trabajo» debe parecer diseñado por el mismo equipo, en el mismo día y para el mismo producto que el Inicio R2.**

### 3. Pantalla principal — listado de órdenes

Diseña y desarrolla una pantalla premium que muestre, sin sobrecargar:

- Encabezado «Órdenes de trabajo», subtítulo breve «Gestiona diagnósticos, reparaciones y seguimiento de vehículos», y botón principal **«Nueva orden»**.
- Indicadores compactos: órdenes activas, en diagnóstico, en servicio y listas para entrega. Mantén los mismos componentes visuales KPI de Inicio.
- Herramientas en una barra limpia: buscar por número OT, patente, vehículo o cliente; filtrar por estado; opción de restablecer filtros.
- Listado de órdenes con número OT, cliente ficticio, vehículo, patente de ejemplo, servicio, fecha y **badge de estado**. En escritorio, tabla o filas premium legibles; en móvil, tarjetas verticales cómodas para tocar.
- Cuatro estados consistentes con Inicio: **En diagnóstico** (azul), **En servicio** (ámbar), **Por repuestos** (violeta) y **Lista para entrega** (verde). Considerar «Finalizada» como estado posterior neutro/positivo sin alterar los cuatro colores.
- Acciones por orden: **Ver detalle**, **Continuar revisión** y, donde corresponda, **Preparar informe**. En la demo, navegar por vistas sin simular guardado real.

Utiliza información demostrativa claramente ficticia, coherente con los ejemplos ya usados en Inicio (OT-1001 a OT-1004) y sin exponer datos de clientes reales.

### 4. Pantalla de detalle de una orden

Diseñar una ficha operativa clara con:

1. **Cabecera:** OT, estado visible, vehículo y patente, fecha, cliente asociado y acción «Volver a órdenes».
2. **Resumen del servicio:** motivo de ingreso, síntoma señalado, diagnóstico preliminar, prioridad y técnico responsable ficticio o pendiente de asignar.
3. **Inspección multipunto:** bloques ordenados (motor, frenos, suspensión, dirección, fluidos, neumáticos y sistema eléctrico), con estados **Correcto / Requiere atención / No revisado** y espacio para notas. Son categorías de demostración hasta recibir la hoja original de Ignacio.
4. **Trabajos y repuestos:** descripción del trabajo, repuestos necesarios, cantidades y mano de obra; cualquier monto mostrado será ilustrativo y en CLP.
5. **Observaciones pendientes:** hallazgos no reparados que deben permanecer en el historial del vehículo para futuras visitas.
6. **Historial de estados:** cronología clara de diagnóstico → servicio → repuestos → entrega, con fechas simuladas y legibles.
7. **Acciones visibles:** «Editar revisión», «Preparar cotización», «Preparar informe» y «Cambiar estado» con lógica DEMO explícita.

Evita una pantalla interminable de formularios. Agrupa la información en tarjetas, pestañas o secciones plegables según corresponda y muéstrala progresivamente.

### 5. Flujo de «Nueva orden»

Diseña un flujo breve, accesible y orientado al mecánico:

- Paso 1: elegir cliente y vehículo registrados o acceder a la futura función de alta.
- Paso 2: motivo de ingreso, kilometraje, fecha y observaciones iniciales.
- Paso 3: revisión de datos y creación de la orden.

Incluye validaciones visibles, ayuda mínima, acciones «Anterior», «Continuar» y «Cancelar». **No afirmar que una orden fue guardada**: esta etapa es DEMO sin Supabase conectado. Si el flujo funciona con estado temporal local, advertir que se perderá al salir/recargar; no persistir datos personales.

### 6. Experiencia móvil iPhone PWA

Diseña la misma pantalla para Safari iPhone como parte de la misma marca:

- Mantener el encabezado y la navegación móvil aprobados en R2.
- Tarjetas de OT con datos esenciales, sin tablas horizontales diminutas.
- Filtros en controles táctiles legibles.
- Botón «Nueva orden» fácilmente accesible.
- Ficha de OT con secciones claras y botones grandes.
- Revisiones multipunto que puedan completarse con una mano, evitando textos extensos.
- Cero cortes, superposiciones ni scroll horizontal.

**No crear una aplicación iOS nativa.**

### 7. Estados, accesibilidad y seguridad

Diseñar y comprobar: sin órdenes, sin resultados, carga, error de lectura, validación incompleta, acción cancelada y confirmación DEMO. Usar contraste adecuado, teclado, etiquetas accesibles y objetivos táctiles amplios.

Las acciones de PDF, envío por correo, cambios definitivos de estado o guardado real quedan **preparadas visualmente**, no activadas de manera ficticia. No habilitar Auth, Supabase, RLS, email ni pagos sin aprobación posterior. El registro mediante enlace de clientes se abordará en el panel correspondiente.

### 8. Metodología de trabajo — WEB primero

**Etapa A — Diseño:** crea propuesta de escritorio y móvil de listado, detalle y nueva OT. Reutiliza los tokens oficiales R2. Explica cómo cada sección hereda componentes del Inicio.

**Etapa B — Integración en web:** implementa la sección Órdenes en el código React/Vite existente y con navegación funcional desde Inicio. Mantén R2 intacto. Usa componentes y archivos modulares; evita añadir una nueva capa global de CSS que contradiga `premium.css`.

**Etapa C — QA:** comprobar TypeScript, tests y build; abrir Render existente, capturar escritorio en 1650 y 1440 px y móvil en 390 y 375 px. Comparar **Inicio R2 y Órdenes** lado a lado: deben compartir estructura, espaciados, identidad y acabados. Revisar estados, filtros, navegación y ausencia de errores. Si no cuentas con navegador, declarar la revisión visual pendiente, no inventar resultados.

**Etapa D — Entrega:** registrar commit en `main`, actualizar roadmap/checkpoint BT-UI-03 con cambios verificables y ofrecer enlace de revisión en Render. **El Director aprueba Órdenes por separado**, sin reabrir la aprobación del Inicio.

### 9. Entregables exactos

1. Mockup de **Órdenes — escritorio y móvil**.
2. Mockup de **Detalle de orden — escritorio y móvil**.
3. Mockup de **Nueva orden — escritorio y móvil**.
4. Implementación web DEMO navegable si tienes acceso al repositorio.
5. Estados vacíos, filtros, badgets, controles y accesibilidad.
6. Evidencia de comparación visual con Inicio R2.
7. Informe de archivos cambiados, pruebas, Render y diferencias restantes.
8. Checkpoint `BT-UI-03` sin alterar historia anterior.

### 10. Criterios de aceptación

- Mismo acabado premium **exacto** que Inicio R2: paleta, sidebar, topbar, radii, botones, tipografía, espaciado y sombras.
- Inicio sigue funcionando y visualmente **idéntico** a su versión aprobada.
- Listado, detalle y nueva orden están conectados mediante navegación DEMO útil.
- Estados coherentes y filtros/acciones funcionales o explícitamente no disponibles.
- Ningún usuario confunde datos de demostración con información real.
- Responsive escritorio/iPhone sin desbordamientos.
- Compilación/pruebas PASS y publicación verificada, si se realiza integración.
- Android `apps/android/` y Supabase sin cambios.
- Entrega lista para aprobación visual del Director.

**INSTRUCCIÓN FINAL:** el objetivo no es crear otra pantalla bonita; es conseguir que el segundo panel parezca parte inseparable de ByteTorque R2. Respeta exactamente la identidad aprobada. Comienza por «Órdenes de trabajo».