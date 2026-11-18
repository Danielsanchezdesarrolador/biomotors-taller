# CHECKPOINT · ByteTorque CP05 — PDF R3 validado con archivos del Director

**Fecha:** 18/11/2026 · **Rama:** `main` · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` (visibilidad `public` temporal autorizada por el titular) · **Sitio:** `https://bytetorque.cl/#/acceso`.

## Resultado principal — aprobado por el Director

El Director confirmó desde su sesión que la descarga del nuevo PDF R3 funciona y que una nueva partida agregada en la cotización aparece en el archivo generado. Entregó dos PDF descargados en la conversación, ambos del borrador `COT-000001` del taller **Taller ByteTorque de Pruebas**, vehículo QA `QA1234`.

**Archivo 1: `COT-000001-borrador (1).pdf`** — A4 vertical, una página. Tres partidas: repuesto QA $52.900; mano de obra QA $37.350; insumo QA $11. Subtotal neto $90.261, IVA 19 % $17.150, total $107.411 CLP.

**Archivo 2: `COT-000001-borrador (2).pdf`** — A4 vertical, una página. Las mismas tres partidas más **Balatas** (repuesto, cantidad 1, precio neto $50.000). Subtotal neto $140.261, IVA 19 % $26.650, total $166.911 CLP.

**Comparación verificada:** 3 → 4 partidas; subtotal +$50.000, IVA +$9.500 y total +$59.500. El PDF mantiene la cabecera ByteTorque R3, fichas cliente/vehículo, tabla de partidas, condición/observación, resumen de costos y espacio de firma vacío. Continúa marcado `BORRADOR SIN EMITIR`. **No** equivale a emisión real, aceptación, envío de correo, archivo de revisión ni aprobación de los datos reales.

Los dos PDF muestran la frase `No es documento tributario` duplicada en la advertencia inferior. Se detectó mediante su lectura/renderización y se corrigió en código. **Los archivos adjuntos representan el estado ANTES de esa última corrección**; no afirmar que fueron regenerados con el nuevo texto.

## Cambios realizados

- Commit anterior del 18/11/2026 `107b9fd3ff19b19a5eff9a0a3ae95a0f0777bf64`: ajuste del PDF R3 para 3 partidas QA en A4 y reserva de espacio para todos los datos de contacto; GitHub CI `44302886190` `SUCCESS` y Render `dep-dbupfqe1egvs73b4l7h0` `LIVE`.
- **Commit nuevo `858f76ef2e8238d0691e34488d97dc8e29c9c218`:** en `src/cp05/pdf.ts` se incorporó `pdfLegalNotice()` para evitar repetir `No es documento tributario` si el `snapshot.notice` ya lo incluye. En `src/cp05/cp05.test.ts` se añadió una prueba dedicada con el texto de borrador QA y texto personalizado sin la advertencia.
- Render del commit `858f76e`: `dep-dbupkl2vcj2c7393dt7g` **LIVE**; CI `44304533505` **SUCCESS** (verificación general Web/PWA y Android); CI `44304533600` (visual) seguía en ejecución en la última consulta. No declarar PASS visual hasta obtener conclusión.
- No hubo modificaciones a Supabase, su esquema, clientes/vehículos/OT, suscripciones, membresías, secretos, archivos privados o datos reales. Los cambios fueron de formato y pruebas del generador.

## Estado de puertas de seguridad

- **CP05 descarga PDF oficial R3:** funciona en la prueba manual QA aportada por el Director (2 archivos A4, cálculos comprobados). El nuevo texto sin duplicación requiere regenerar la descarga para validación física final.
- **Plantilla PDF privada Plus/Full:** solo código candidato (`docs/sql/BT_CP05_PLUS_FULL_PDF_TEMPLATES_CANDIDATE.sql`); migración y Storage privados **NO instalados** y flag `VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED` **OFF**.
- **BT-PLAN-04B/04C:** SQL pendiente de aprobación/integración con Supabase alojado y controles RLS reales. La factura/plan de talleres continúa sin pago real.
- **CP05 emisión/revisión archivada y correo externo:** **OFF**, sin autorización de activación. Respaldo integral de Auth/Storage y restauración aún por validar antes de introducir datos reales de Ignacio.
- **Reglas comerciales:** Básico personal gratis, Plus USD 5 incluye 4 mecánicos, Full USD 15 incluye 8; adicionales USD 2 por mecánico al mes pagados únicamente por el titular. Ignacio eventualmente Full permanente sin cobro por decisión del creador.

## Próximos pasos recomendados

1. Confirmar el estado de CI `44304533505`, `44304533600` y Render `dep-dbupkl2vcj2c7393dt7g`. Revalidar el PDF corregido una vez actualizado el navegador si se desea comprobar visualmente el texto.
2. **CP05 siguiente fase:** planificar archivo privado inmutable de revisiones PDF y entrega posterior, usando SQL candidato y pruebas RLS/aislamiento con dos talleres. **No instalar ni activar sin autorización explícita y revisión de respaldo**.
3. Retomar cierre de respaldo/restauración integral y migraciones 04B/04C de Codex, manteniendo entornos y `main` únicos sin reconstrucción.
4. Entregar un checkpoint tras cada cambio funcional, siempre con commit, evidencias, flags, migraciones y estado REAL de aceptación.

**No confundir validación manual del PDF borrador con revisión emitida o con correo enviado.**
