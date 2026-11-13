# CHECKPOINT — BT-FLOW-01-PLAN — ByteTorque 1.0

**Fecha:** 13/11/2026 (America/Santiago)  
**Tipo de entrega:** PLANIFICACIÓN Y ROADMAP SOLAMENTE. No se ha creado ninguna funcionalidad BT-FLOW-01 ni modificado componentes.  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`, única rama `main`.  
**Base verificada:** `e9e20013d36ad0f78a26686721b61c39690b7128`, última publicación de BT-COT-01.

## Información comprobada

- BT-COT-01 fue integrado en main, con editor de cotizaciones/informes de trabajo, ítems e IVA, comentarios/condiciones, aprobación exclusivamente DEMO y modalidad trabajo donde solo se imprimen/suman los ítems marcados realizados.
- El checkpoint oficial de Codex es `docs/checkpoints/CHECKPOINT_BT_COT_01_20261113.md`; conserva la evidencia de publicación efectiva de HTML/JS/CSS en el Render ya existente. No se confirmó el estado administrativo LIVE desde esta sesión.
- **Nueva verificación externa del CI remoto:** [Actions 43516223991](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43516223991) SUCCESS sobre `e9e2001`. El job Web / iOS PWA reporta **66/66 Vitest en 11 archivos**, build Vite y PWA PASS. Android Expo: job SUCCESS, sin equivaler a APK física.
- [Actions 43516124374](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43516124374) SUCCESS para recorrido de navegador del commit `25f1633`. El último `e9e2001` solo agregó documentación/evidencia, sin cambios al frontend de ese commit.
- Aprobación visual final del Director y prueba Safari físico siguen pendientes. PDF directo, firma y envío siguen sin backend real.

## Nueva decisión del Director

La navegación por los cinco paneles actuales debe permanecer. Sin embargo, al abrir ByteTorque un técnico debe poder pulsar **«Nuevo ingreso»** y recorrer toda la visita, retomando cada tarea sin copiar información entre pantallas: cliente y vehículo, OT, inspección multipunto, definición de trabajos, cotización, aceptación/ajustes, trabajos efectivamente realizados, informe final y entrega.

Esta funcionalidad se llama **BT-FLOW-01 — Flujo de Trabajo Inteligente**.

**Estado:** el objetivo y la dirección funcional están establecidos; interfaz, arquitectura detallada y desarrollo siguen pendientes de revisión/aprobación. No se agregó un menú lateral ni un formulario nuevo.

## Plan actualizado en esta entrega

- `docs/BT_FLOW_01_FLUJO_TRABAJO_INTELIGENTE.md` — plan maestro: flujo detallado, estados, contrato conceptual de expediente, limitaciones actuales, seguridad, regla de no inferir diagnósticos/costos, cinco fases BT-FLOW-01A a 01E y criterios de aceptación.
- `roadmap.md` — BT-COT-01 CI remoto corregido con evidencia y nueva prioridad BT-FLOW-01 con hitos y dependencias.
- Este checkpoint documental preserva la continuidad.

## Riesgos arquitectónicos concretos descubiertos

1. **Recepción**: `ClientesPanel.tsx` mantiene solicitudes BT-REG-02 en estado React interno; cambiar de módulo descarta las nuevas solicitudes y el menú Inicio no puede retomarlas como expediente.
2. **Órdenes**: `OrdenesPanel.tsx` crea órdenes en estado local, pero `orderSession.ts` construye `sessionOrders()` desde las fixtures y revisiones de detalle: una OT nueva no pasa automáticamente a los selectores de informes.
3. **Documentos**: BT-COT-01 usa `createWorkDocument`/`documentContext` con IDs válidos de OT, cliente y vehículo. Para ingreso nuevo, un adaptador central es necesario antes de habilitar navegación completa y generación DEMO sin duplicados.
4. **Borradores**: `trabajosSession`, `reportSession`, `multipuntoSession` y `orderSession` tienen memorias parciales distintas. BT-FLOW-01 deberá coordinar los IDs y el estado de cada visita, no reemplazar indiscriminadamente estos módulos.
5. **Integridad técnica**: el informe multipunto conserva ítems sin revisar; la cotización no equivale a trabajo realizado; la aprobación DEMO de una revisión concreta caduca al editar. Estos contratos son innegociables.

## Próximas etapas y responsabilidades

- **BT-FLOW-01A:** especificación de expediente/estados y mockups R2, revisión del Director. Sin backend.
- **BT-FLOW-01B:** estado compartido en memoria y recepción reutilizable, sin información personal real.
- **BT-FLOW-01C:** botón Nuevo ingreso y Continuar trabajo en Inicio, navegación contextual entre los cinco menús.
- **BT-FLOW-01D:** integrar inspección → propuesta valorizada → cotización → aprobación DEMO → trabajos realizados → informe, con validaciones humanas.
- **BT-FLOW-01E:** cierre de visita, excepciones, QA visual/funcional, capturas y nuevo checkpoint.

**Sin intervención en** BT-CP02-D, credenciales, Supabase, Auth/RLS, onboarding Edge, pagos, envíos reales, firma, APK ni los componentes R2. No se deben realizar pruebas A/B desde este plan.

## Instrucción de continuidad

1. Leer este checkpoint, `docs/BT_FLOW_01_FLUJO_TRABAJO_INTELIGENTE.md`, `roadmap.md`, `AGENTS.md`, el checkpoint BT-COT-01 y el de BT-REG-02.
2. Verificar HEAD nuevo de `main`, CI y trabajos concurrentes de Codex; nunca asumir que `e9e2001` sigue siendo HEAD.
3. Obtener revisión visual del Director de BT-COT-01 y del diseño conceptual 01A. **No implementar BT-FLOW-01B a 01E automáticamente** solo porque figuren en el roadmap.
4. Preservar cinco paneles R2, multipunto de Ignacio, cotizaciones e informes y registro existentes. Reusar herramientas de ChatGPT para cambios puntuales y Codex solamente si la implementación multidocumento lo requiere.
5. Todo progreso posterior debe separar UI DEMO, pruebas, publicación, aprobación humana y backend real.

**Criterio principal:** Ignacio inicia una visita y ByteTorque lo guía hasta la entrega; puede salir a cualquier panel y volver exactamente al expediente de esa visita sin volver a ingresar datos. En DEMO «retomar» dura solo mientras la página siga abierta, sin prometer guardado tras recargar.
