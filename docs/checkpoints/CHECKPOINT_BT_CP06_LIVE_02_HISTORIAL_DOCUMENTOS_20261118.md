# ByteTorque — Checkpoint BT-CP06-LIVE-02 · Historial y copias documentales

**Fecha:** 18/11/2026 · **Rama única:** `main`  
**Punto de partida:** `270b9a30` (BT-FLOW-LIVE-02, migración candidata).  
**Último código:** `2a23d8db8ac48ae1fcbe1bc33155b9d180f6b415` (fix QA).  
**Último commit de documentación previo al checkpoint:** `aa2c05c9fac24b07c8d36ed7c1bb91530857da45`.

## Alcance incorporado al código

1. **CP06 / declaraciones históricas** — `src/historial/flowEvidence.ts` añade una lectura paginada, read-only, por taller y revisión de las tablas candidatas `bt_flow_quote_approvals`, `bt_flow_execution_reports`, `bt_flow_visit_deliveries`. Verifica enlazado de cotización→revisión→aprobación→ejecución→entrega; decisiones expresas para todas las partidas; importes recalculados desde snapshot; fechas, método y checklist. No inventa operaciones faltantes.
2. **Interfaz** — `VehicleHistory.tsx` conserva CP06 y presenta constancias declaradas dentro de cada revisión histórica cuando `VITE_BT_FLOW_LIVE_02_ENABLED=true`. Si falta backend, muestra aviso sin ocultar visitas/cotizaciones. La vista no equivale a firma ni prueba de reparación o entrega física.
3. **Documentos candidatos** — `src/entrega/finalPackage.ts` define paquete de cotización histórica CP05, informe y constancia; exige registros asociados y montos coherentes. `src/entrega/finalPdf.ts` genera dos copias informativas A4 desde los registros recuperados (informe y entrega), con paginación y advertencias. Antes/después del proceso de generación, CP06 revalida la sesión/membresía/vehículo. El PDF CP05 original se sigue descargando aparte desde su archivo privado; **NO existe todavía un ZIP/paquete consolidado ni versiones finales de informe/entrega archivadas en Storage**.
4. **Límites de compilación** — el módulo permanece fuera del bundle oficial OFF, con pruebas específicas para el flag LIVE-02 ON en `vite.config.ts`, `scripts/verify-official-bundle.mjs` y CI.
5. **Pruebas sintéticas** — `flowEvidence.test.ts` y `finalPackage.test.ts` cubren aislamiento, estados faltantes, cifras falsas, revisión histórica, páginas múltiples y contrato A4. Los primeros jobs detectaron errores de TypeScript y contaminación entre fixtures, corregidos en commits posteriores. **No afirmar PASS hasta que el último workflow termine satisfactoriamente.**

## CI en curso al registrar este checkpoint

- **Web/Android general:** [run 44346425837](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44346425837) — pendiente/en cola en la última consulta.
- **QA de interfaz:** [run 44346425772](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44346425772) — ejecutándose en la última consulta.

La validación antigua **673/673** pertenece exclusivamente al checkpoint BT-FLOW-LIVE-02, **no** acredita este nuevo bloque. El candidato actual contiene un conjunto ampliado de 684 tests y solo podrá declararse cerrado al confirmar ambos jobs exitosos. La revisión A4 en Safari/Android físicos también sigue pendiente.

## Puertas que permanecen cerradas

**Supabase alojado sin cambios:** migración candidata LIVE-02 no instalada, interruptor privado servidor sin habilitación, tablas nuevas no operativas. **Render sin cambios:** no se activó `VITE_BT_FLOW_LIVE_02_ENABLED`; sin despliegue/flags nuevos de esta fase ni mails. Sin escrituras de clientes, talleres, cotizaciones auténticas o permisos alojados. No se creó ninguna firma ni documento tributario.

**Siguiente paso:** comprobar últimos jobs CI; corregir cualquier fallo y solo entonces marcar cierre de código. Después preparar fase autorizada de archivo PDF final versionado y envío único por correo BT-COM-01 (OFF), además de respaldo integral/restauración, RLS alojada, pruebas Safari iPhone/Android físicos y aceptación de Ignacio.

**BT-PILOT-QA-04: A REPASAR**; auditoría final de seguridad pendiente por decisión del Director.
