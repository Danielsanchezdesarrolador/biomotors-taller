# ByteTorque · Checkpoint CP05 R3 A4 — 18/11/2026

**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` (visibilidad **public** temporal confirmada por el titular el 18/11/2026). **Rama única:** `main`. **Sitio:** `https://bytetorque.cl/`. **Servicio Render existente:** `srv-dbqe4quc6qcc73f275jg`.

## Inicio del día y evidencia
- Punto de partida: `5f5b5bb9aa1d82eae30de705b900e845df02b211`, checkpoint `docs/checkpoints/CHECKPOINT_BT_CP05_PDF_R3_TEMPLATES_20261117.md`.
- Se reconfirmó GitHub Actions anterior: `44171616745` Web/Android **SUCCESS**, `44171616949` visual **SUCCESS**, `44171617156` PostgreSQL aislado **SUCCESS**. Render anterior `dep-dbubn1jbc2fs73a4biug` **LIVE**.
- La imagen de cotización premium aprobada por el Director sigue siendo la referencia oficial, pero **no se cuenta aún con una descarga real del nuevo PDF R3** para comparación visual. El `COT-000001-borrador.pdf` de archivo previo corresponde al formato sencillo, no a esta revisión.

## Cambio realizado
**Commit de código:** `107b9fd3ff19b19a5eff9a0a3ae95a0f0777bf64`, `fix(cp05): keep common 3-item quote on A4 and preserve all contact fields`.

- `src/cp05/pdf.ts`: compactar suavemente los espacios verticales del encabezado, dos fichas de identidad, filas y resumen sin perder los campos dinámicos ni la composición A4 aprobada.
- Pie de taller: reservar dinámicamente el espacio para teléfono, correo y dirección. Si no cabe en la página actual, paginar en vez de omitir información con una instrucción `break`.
- `src/cp05/cp05.test.ts`: nueva prueba con las **3 partidas QA** por $52.900, $37.350 y $11, subtotal neto $90.261, IVA $17.150 y total $107.411; exige **1 página A4**; también prueba generación con tres datos de contacto. Se preserva la prueba de 200 partidas y el PDF oficial determinista.
- **GitHub Actions `44302886190`: SUCCESS** (Web/PWA + Android). **Render `dep-dbupfqe1egvs73b4l7h0`: LIVE**. Verificación visual general `44302886175` estaba aún ejecutándose al preparar este checkpoint; consultar la conclusión por ID antes de marcar PASS.
- Son datos QA **sintéticos**; no hubo modificaciones de Supabase, clientes/vehículos/cotizaciones almacenadas, talleres, membresías, cobros, correos ni emisión archivada.

## Estado de producto y restricciones
- **PDF oficial R3** disponible como generación de borrador con datos dinámicos y encabezado ByteTorque. NO implica emisión tributaria, firma ni aceptación real.
- **Plus y Full:** código candidato para papelería PDF privada A4 del propio taller en `src/workshops/pdfTemplate.ts` y SQL candidato `docs/sql/BT_CP05_PLUS_FULL_PDF_TEMPLATES_CANDIDATE.sql`. **NO INSTALADO**, flag `VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED` **OFF**. No habilitar sin autorización de migración, QA multitenant y respaldo integral.
- **BT-PLAN-04B/04C**: candidatos Codex pendientes de instalación/aceptación en backend alojado; no sustituir reglas actuales sin pruebas.
- **CP05 archivo privado y email**: bloqueados hasta autorización concreta. Backup integral/Auth/Storage aún sin restauración verificada. No usar datos reales del taller de Ignacio.
- Plan vigente: Básico personal gratis sin taller nuevo; Plus USD 5/mes 4 mecánicos; Full USD 15/mes 8; cada adicional USD 2/mes cobrado solo al titular.

## Siguiente tarea exacta
1. El Director abre `https://bytetorque.cl/#/acceso` con el taller QA, entra a **Informes y cotizaciones → COT-000001**, descarga **PDF de borrador** generado hoy y adjunta el archivo (o captura de todas las páginas). Confirmar A4, tipografía, márgenes y similitud con su imagen de referencia.
2. Si el PDF descargado es correcto, avanzar a CP05 almacenamiento/archivo privado candidato y CP06, sin instalar SQL ni habilitar correos hasta pasar la puerta de backup y autorización.
3. Al completar **cada** tarea, generar un nuevo checkpoint con commit, CI, estado de Render, qué migraciones/flags siguen OFF y siguiente paso para nuevo chat. Preservar `main`, la estética R2 y el logo.
