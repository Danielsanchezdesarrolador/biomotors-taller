# ByteTorque — Checkpoint BT-UI-POLISH-01 · Premium responsive WEB + móvil

**Fecha:** 18/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama única:** `main`.

**Punto de partida:** `f544c1c5f58f7fd6da6321f2a2fc8f92ac4767fd` (BT-CP06-LIVE-02). La etapa funcional previa ya contaba con ambos workflows **SUCCESS** en commit `2a23d8db`; esta etapa **NO** reconstruyó CP04, CP05 ni CP06.

**Último commit de código/pruebas de este bloque:** `84cc258516a2ab93ba2f4c08d63bc7ed1ed6ccf0`.  
**Actualización del roadmap al cierre:** `fd8dda2ff59c9ee7a881b9e4a2965406ebf74cfd`.

## Resultado visual — R2 premium aprobado en código y CI

### 1. Cotización (CP05)

- `src/cp05/QuotePanel.tsx`, `src/cp05/cp05.css`: los botones existentes se distribuyen en un tablero compacto por prioridad, con **Guardar borrador en Supabase** como acción principal, **Recargar** y **Descargar PDF de borrador** como secundarias, y una zona separada para **Emisión y comunicaciones**. Todos conservan los mismos controladores, condiciones `disabled` y textos dinámicos; no se habilitó emisión/correo.
- Las secciones «Revisiones y trazabilidad» y «Envíos» presentan estados vacíos compactos con iconos, y entradas históricas alineadas. Los totales permanecen coherentes en el flujo y el chip flotante conserva su visualización.
- Responsivo: tres acciones equilibradas en escritorio amplio, agrupación de dos columnas intermedias y **una columna vertical en móvil**, objetivos táctiles de al menos 44 px.

### 2. Perfil y suscripciones

- `src/layout/AppShell.tsx`, `src/premium.css`: nuevo agrupamiento de **avatar, nombre, rol y chip**. Cabecera de altura adaptable en escritorio/tablet; el nombre largo se ajusta en más de una línea, sin salirse verticalmente. En móvil se conserva el indicador compacto y no se duplica el plan en escritorio.
- Básico: gris neutro. Plus: azul con **corona**. Full: dorado con **diamante**.
- **Los estados provienen exclusivamente de `copy.accountPlan.effectivePlan`**, derivado del contrato `PlanStatus`, sin cambios de suscripciones, permisos, acceso, Auth o perfil almacenado. La simulación de planes/nombre largo solo existe en el **harness de prueba local**.

### 3. Inspección multipunto y observaciones pendientes (CP04)

- `src/ordenes/Cp04OrdersView.tsx`, `src/ordenes/cp04.css`: registros de inspección convertidos a filas compactas con componente, diagnóstico discreto, resolución, nota y fecha. Las pendientes usan descripción/fecha y botón **Marcar resuelto** de tamaño proporcionado en escritorio (táctil en móvil).
- Se mantienen exactamente las condiciones de habilitación, callback `resolve(item)`, estado de la OT, consulta de pendientes de visitas anteriores y todos los resultados/observaciones originales. La hoja multipunto de 34 X y el autoguardado no fueron modificados.
- Dos columnas equilibradas en escritorio; una columna en móvil/tablet de 820 px o menos.

## Evidencia focalizada (sin auditoría general nueva)

- [CI general — Verificación ByteTorque #44394545056](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44394545056): **SUCCESS** sobre `84cc2585`; **684/684 Vitest**, **79/79 archivos**, TypeScript, web/PWA build público y privados, verificaciones del bundle, PostgreSQL 17 aislado, y Android Expo TypeScript/export/contratos (**NO APK física**). No se modificó código Android nativo.
- [CI UI — BT-OFICIAL-01A #44394544962](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44394544962): **SUCCESS** sobre `84cc2585`. Incluye `scripts/verify-ui-polish.cjs` (identidad y plan con nombre largo en Basic para 360/390/430/768/1366/1440/1920 px; Plus y Full en 390 y 1366), `scripts/verify-cp04-redesign.cjs` (7 anchuras y capturas adicionales de inspección/pendientes con registros HTTP sintéticos desde orden anterior) y `scripts/verify-cp05-browser.cjs` (7 anchuras, jerarquía de acciones, estados vacíos, ausencia de desbordamientos, PDF local y condiciones bloqueadas).
- **Capturas después:** artefacto GitHub Actions **`BT-OFICIAL-01A-Estados-vacios-Capturas`**, ID `14470090339`, ~82 MB, visible desde la ejecución UI anterior. Incluye archivos bajo `artifacts/bt-ui-polish/`, `artifacts/cp04-redesign/` y `artifacts/cp05-mobile/`. **Referencias antes:** las tres capturas aportadas por el Director al solicitar BT-UI-POLISH-01; no se fabricaron capturas «antes» programáticas ni se afirma inspección visual física.
- Sin desbordamientos horizontales en las comprobaciones de navegador simulado de las 7 anchuras. Las verificaciones WebKit de CI son **Linux, no Safari iPhone físico**.

## Alcance excluido e invariantes

- **Solo presentación:** JSX/CSS y harness/scripts de verificación; no se alteraron solicitudes/contratos RPC, cálculo de CLP, condiciones de autorización, registros, permisos, base de datos, Supabase Auth/RLS, SQL, Edge, Storage, correo, facturación, planes ni scripts de migración.
- **Render NO publicado**: todos los commits de implementación usan `[skip render]`; no se cambió configuración ni se solicitó despliegue. Cualquier vista visual publicada requiere autorización futura.
- **CP06/BT-FLOW-LIVE-02 permanece candidato OFF** en backend, sin instalar migración LIVE-02 ni activar el flag. CP05 correo/archivo pendiente mantiene sus puertas anteriores. No se modificó Android Expo salvo el efecto de tests no nativos.
- No se usaron datos auténticos de Ignacio; pruebas HTTP en navegador son sintéticas e interceptadas.
- **BT-PILOT-QA-04: A REPASAR.** Auditoría de seguridad, respaldo completo y restauración, permisos alojados y pruebas Safari/Android físicos pendientes y separadas por autorización.

**Resultado:** código de pulido visual cerrado, CI y QA focalizado aprobados, listo para revisión del Director en la interfaz una vez que se autorice una publicación posterior. Próxima etapa funcional: continuar el roadmap sin reconstruir ni interrumpir las integraciones existentes.
