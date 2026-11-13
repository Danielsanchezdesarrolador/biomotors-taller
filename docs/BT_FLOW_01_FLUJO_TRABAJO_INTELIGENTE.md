# ByteTorque — BT-FLOW-01 — Plan maestro: Flujo de Trabajo Inteligente

**Fecha:** 13/11/2026 (America/Santiago)  
**Estado:** planificación funcional y técnica para aprobación/diseño; **NO implementado**.  
**Fuente:** decisión del Director: conservar los cinco menús premium R2, pero guiar automáticamente el trabajo de ingreso → diagnóstico → multipunto → trabajos → cotización → autorización → ejecución → informe → entrega.  
**Base revisada:** main commit `e9e20013d36ad0f78a26686721b61c39690b7128` (BT-COT-01); integración posterior únicamente después de coordinar cambios y aprobación visual.  
**Rama / sitio:** solo `main`, Render existente. Backend Supabase/BT-CP02-D reservado y sin intervención.

## 1. Resultado esperado

El profesional abre Inicio y encuentra una acción principal: **«Nuevo ingreso de vehículo»** y una sección **«Continuar trabajos»**. La aplicación lo lleva paso a paso sin pedirle reingresar la información que ya declaró el cliente o que el propio mecánico confirmó. La barra lateral oficial mantiene exactamente cinco destinos: Inicio, Órdenes de trabajo, Clientes y vehículos, Informes y cotizaciones, Configuración. Los menús permanecen útiles para búsqueda libre, historial y correcciones; NO se crea un sexto panel.

El centro del flujo es un **expediente de atención por visita / OT**, no una pantalla de formulario adicional sin relaciones. Un cliente puede tener varios vehículos y un vehículo varias visitas a lo largo de los años. Un expediente nunca se identifica solo por patente o por nombre.

## 2. Flujo visible (requisitos de experiencia)

| Etapa | Acción principal | Datos reutilizados | Condición para avanzar |
|---|---|---|---|
| 0. Inicio | Nuevo ingreso / Continuar | Sesiones DEMO disponibles | Selección explícita de visita o creación nueva |
| 1. Recepción | Buscar cliente existente, registrar uno DEMO o revisar solicitud BT-REG-02 | Contacto, vehículo, km, motivo original | Confirmar identidad, vehículo, vínculo y motivo; no asumir que patente identifica dueño |
| 2. Orden de trabajo | Revisar y crear OT DEMO | Cliente, vehículo, km, fecha, motivo | Confirmación humana; no crear OT automáticamente al recibir solicitud |
| 3. Inspección multipunto | Abrir BT-INS-01 de la OT | Contexto OT → cliente/vehículo | Guardar borrador/resultado DEMO; sin marcar controles «Sin revisar» como «Correcto» |
| 4. Diagnóstico y propuesta | Registrar hallazgos, trabajos, ítems y precios | Motivo del cliente separado de observaciones técnicas | Mecánico define explícitamente mano de obra, repuestos, cantidad y precio; sin diagnóstico o precio inferido |
| 5. Cotización | Preparar en BT-COT-01 a partir de ítems validados | OT, datos de contacto, piezas/trabajos, referencia al multipunto de la misma OT | Revisión de subtotal, IVA 19 %, total y condiciones; no enviar sin autorización |
| 6. Respuesta del cliente | Registrar aceptación/rechazo/solicitud de cambios en DEMO | Versión exacta de la cotización | Solo aceptación confirmada de esa versión permite trabajos sujetos a autorización; en DEMO no tiene validez legal |
| 7. Ejecución | Registrar únicamente trabajos efectuados | Ítems autorizados o decisión del taller, orden y revisiones | El estado «Realizado» debe marcarse expresamente; cambios de presupuesto requieren nueva revisión/aprobación |
| 8. Informe final | Preparar informe de trabajo con BT-COT-01 y pendientes | Solo ítems realizados, horas/datos reales futuros, observaciones de revisión | No confundir cotizado con ejecutado; pendiente técnico conservado |
| 9. Entrega / cierre | Revisar documentos, pendientes, estado y cerrar visita | OT, cliente, vehículo, registros y documentos | Comprobación final explícita; en DEMO sin envío ni persistencia; historial durable solo en fase backend |

**El proceso no debe ser rígido:** se puede volver, corregir, detener por repuestos, registrar cambio solicitado por cliente, revisar otra vez o cancelar una visita. Mostrar bloqueos y motivos claros. No permitir saltarse validaciones críticas ni convertir etapas no terminadas en «completadas» por navegar.

## 3. Pantalla guía (Inicio R2, sin rediseñar lo aprobado)

- Bloque principal «¿Qué vamos a hacer hoy?» con CTA «Nuevo ingreso de vehículo».
- Bandeja «Continuar trabajos» con OT/vehículo, etapa real, próxima acción y advertencia de pendientes. No inventar porcentajes de avance ni utilizar KPI globales ficticios como fuente.
- Acceso contextual «Volver al expediente» desde los cinco menús. Al consultar un documento o una inspección, mantener la referencia a la misma OT.
- Un indicador de pasos discreto, adaptable a móvil Safari: paso actual, realizados, pendientes, bloqueados y próximos. Botones «Volver» / «Continuar trabajo» / «Guardar borrador DEMO».
- No reabrir siempre el mismo formulario: al retomar, enfocar la última actividad verificable y ofrecer cambiar de etapa. No ocultar funciones avanzadas de los menús.
- Instrucciones sencillas para profesionales sin formación informática, sin pantallas sobrecargadas ni textos técnicos innecesarios.
- Mantener cinco destinos, sidebar/topbar/bottom-nav y tipografía/tokens R2 oficiales; ningún diseño paralelo.

## 4. Contrato de datos propuesto (primero DEMO, futuro servidor aparte)

Establecer un contrato adaptador que reutilice los IDs de entidades existentes y tenga un identificador estable **por visita**. Ejemplo conceptual, NO un tipo ya integrado:

```ts
type FlowStage =
  | 'recepcion' | 'orden' | 'inspeccion' | 'propuesta' | 'cotizacion'
  | 'respuesta_cliente' | 'ejecucion' | 'informe_final' | 'entrega'
type FlowCase = {
  id: string                       // ID de expediente/visita
  workshopId: string               // Solo workshop-demo en DEMO
  clientId?: string
  vehicleId?: string
  intakeRequestId?: string
  orderId?: string
  inspectionId?: string
  quoteId?: string
  workReportId?: string
  stage: FlowStage
  stageState: Partial<Record<FlowStage,'pendiente'|'en_curso'|'completado'|'bloqueado'>>
  lastContext?: { panel: 'inicio'|'ordenes'|'clientes'|'informes'|'configuracion'; resourceId?: string }
  revision: number
}
```

**IDs y consistencia:** nunca utilizar una patente, nombre, correo, índice de array o estado visual como permiso de acceso. Mantener `clientReportedReason` separado del diagnóstico y la ejecución. Si se actualiza vehículo o kilometraje, respetar el historial previo (no reescribir visitas antiguas). No crear relaciones duplicadas por tener varios borradores.

**Limitaciones concretas encontradas en main:**
- `ClientesPanel.tsx` guarda solicitudes BT-REG-02 en estado React local: desaparecen al desmontar el panel; **no** son aún recuperables desde Inicio ni desde una OT.
- `OrdenesPanel.tsx` mantiene las OT nuevas en un array local; `orderSession.ts` y `sessionOrders()` comparten fixtures/revisiones, pero no garantizan que toda OT creada en el panel figure en Informes.
- `trabajosSession.ts`, `reportSession.ts`, `multipuntoSession` y `orderSession.ts` ya tienen mecanismos de memoria temporal; **reutilizarlos/normalizarlos cuidadosamente**, sin clonar otro registro incompatible.
- `createWorkDocument` y `documentContext` requieren vinculación válida con OT/cliente/vehículo en las fixtures actuales. Para la demostración de ingresos nuevos se debe resolver esa integración sin inventar clientes o patentes autorizados.
- `App.tsx` ya navega desde OT a multipunto y cotización/informe premium; reutilizar estos entrypoints, extender navegación a expediente y evitar bifurcaciones.
- BT-COT-01 distingue `quote` propuesto y `work` efectivamente realizado; no romper `performed:false`, estados ni invalidación de aprobación al editar.

La primera tarea técnica debe ser un inventario de relaciones/identidades y de vida útil de borradores. **El almacenamiento DEMO continuará exclusivamente en memoria de página**; al recargar se perderá y se avisará. No introducir localStorage, IndexedDB, cuentas ni datos reales con la excusa de retomar trabajos. El aviso «Continuar» significa durante la misma sesión abierta.

## 5. Autopreparación controlada (no automatizar decisiones de riesgo)

- **Automático permitido en DEMO:** copiar antecedentes ya confirmados, navegar al siguiente paso, proponer el documento correcto, enlazar inspección por IDs coincidentes, sumar ítems validados, calcular CLP e IVA, mostrar faltantes, conservar estado de avance local, ofrecer vista previa e impresión del navegador.
- **Acción humana obligatoria:** verificar asociación cliente/vehículo; crear la OT; determinar diagnóstico; marcar qué controles fueron revisados; decidir reparación y precio; revisar cotización; registrar aprobación; marcar trabajo realmente ejecutado; revisar informe final; ordenar envío y cerrar visita.
- **Nunca automatizar:** envío por correo/WhatsApp real, emisión legal de documentos, aprobación contractual, firma, facturación, permisos de plan, cambio de propietario o autorización de acceso a un vehículo.
- El informe multipunto no crea automáticamente un diagnóstico ni una cotización: puede aportar hallazgos y pendientes como **referencia**, pero la propuesta económica requiere ítems revisados y valorizados por el mecánico.

## 6. Roadmap incremental — NO ejecutar sin nueva orden

### BT-FLOW-01A — Contratos y UX del recorrido
- [x] Auditar clientes, vehículos, solicitudes, OT, multipunto, cotización, informe, sesiones y dependencia entre componentes en HEAD `c4ccd5f`. Inventario en `docs/BT_FLOW_01A_DISENO_ARQUITECTURA.md`.
- [x] Diseñar conceptualmente el expediente único, vínculos por ID, etapas/transiciones y validaciones; distinguir solicitud, visita, OT, documento, realización y aprobación. Aún NO implementado.
- [ ] Revisar y aprobar visualmente los mockups conceptuales de Inicio y Expediente (escritorio y móvil) creados en conversación, homologarlos al R2 real y obtener visto bueno del Director antes de alterar Inicio. La propuesta visual está preparada, la aprobación sigue pendiente.
- [x] Identificar brechas de vida útil de estado local y duplicación de entidades; tabla de orígenes de datos y reutilización documentada en `docs/BT_FLOW_01A_DISENO_ARQUITECTURA.md`.

### BT-FLOW-01B — Estado de expediente y recepción DEMO
- [ ] Crear/adaptar un **único estado en memoria**, con ID estable, adaptadores a modelos actuales y pruebas de propiedad/vínculo.
- [ ] Implementar selección/alta de cliente y vehículo ficticios; soportar cliente que vuelve y vehículo con múltiples visitas.
- [ ] Revisar una solicitud BT-REG-02 y convertirla en una OT **solo tras confirmación**, sin colisionar con el alta manual ni volver a capturar campos.
- [ ] Enlazar OT DEMO nueva con paneles de órdenes, inspecciones e informes; resolver la actual discontinuidad entre estados locales.

### BT-FLOW-01C — Inicio guiado y navegación
- [ ] Integrar «Nuevo ingreso» y «Continuar trabajos» en Inicio R2 sin alterar los KPI y tarjetas aprobados más allá de la sección autorizada.
- [ ] Definir breadcrumb/indicador contextual y «Siguiente acción» en OT, inspección, informes y cotizaciones.
- [ ] Permitir navegar por sidebar libremente y retomar exactamente el expediente correcto al volver, sin reiniciar la visita.

### BT-FLOW-01D — Continuidad multipunto → cotización → trabajo
- [ ] Vincular BT-INS-01 a su OT/cliente/vehículo sin reescribir inspecciones.
- [ ] Preparar cotización BT-COT-01 con ítems y precios **expresamente confirmados**; revisar IVA 19 % y revisión/estado.
- [ ] Solicitar aprobación DEMO de una revisión concreta; ante cambios, invalidar la aprobación anterior y volver a revisión.
- [ ] Generar informe de trabajo solo con ítems marcados realizados; conservar observaciones pendientes y permitir ciclos de corrección.

### BT-FLOW-01E — Cierre, excepciones y QA integral
- [ ] Gestionar cliente no autoriza, vehículo pendiente, falta de repuestos, presupuesto rechazado, trabajo adicional, devolución/revisión, cancelación y cierre con pendientes señalizados.
- [ ] Resumen de entrega DEMO: expediente, historial de visita temporal, cotización, resultado de inspección e informe, sin afirmar respaldo real ni envío.
- [ ] Pruebas unitarias de transiciones y relaciones, TypeScript/Vitest/build/PWA, E2E de ingreso completo y retorno por sidebar, 1650/1440/768/390/375, regresiones de los cinco paneles, BT-INS-01/BT-COT-01/BT-REG-02.
- [ ] Comprobar cero operaciones reales de red, correos, persistencia, pagos o privilegios; capturas escritorio/móvil y checkpoint formal.
- [ ] Aprobación visual y prueba Safari físico; solo después considerar paridad React Native Android.

## 7. Fase posterior con backend real (NO autorizada)

Tras BT-CP02-D y autorización independiente: persistencia multitenant por `workshop_id`, roles/RLS verificados con usuarios A/B, idempotencia de creación de OT y generación de documentos, transiciones auditadas de estado, vencimiento y bloqueo de invitaciones, verificación de email/destinatario, consentimientos, protección frente a acceso cruzado, cola de envíos con confirmación del proveedor, firma/aceptación conforme a requisitos legales y control de plan/suscripción únicamente en servidor.

**No intervenir migraciones, Auth, Edge `bt-owner-onboarding`, claves administrativas, pagos ni pruebas A/B desde BT-FLOW-01.** Restricciones de Básico/Plus/Full existentes siguen vigentes, sin nuevas prestaciones comerciales aprobadas a partir de este plan.

## 8. Puertas de inicio y definición de terminado

1. BT-COT-01: la implementación, pruebas y publicación técnica están verificadas; **aprobación visual del Director aún pendiente**. No alterar su editor hasta coordinar esta revisión.
2. Para comenzar fase 01A de diseño: confirmar la propuesta visual/funcional; no se requiere modificar componentes.
3. Para programar 01B–01E: nueva orden expresa, revalidar HEAD y ausencia de Codex concurrente. Commits pequeños y sin ramas nuevas.
4. Cierre final: recorrido de entrada a entrega ejecutado en DEMO sin duplicación de datos, roles/sincronización claramente limitados, regresiones PASS, capturas y revisión Director. No confundir página-memory con respaldo ni simulación con autorización.

**Referencias:** `docs/checkpoints/CHECKPOINT_BT_COT_01_20261113.md`, `docs/checkpoints/CHECKPOINT_BT_REG_02_20261113.md`, `docs/checkpoints/CHECKPOINT_BT_INS_01_20261113.md`, `docs/SISTEMA_VISUAL_OFICIAL_R2.md`, `docs/BT_REGISTRO_CLIENTE_VEHICULO_VISITA.md`, `roadmap.md`.

**Actualización BT-FLOW-01A (13/11/2026):** especificación detallada y dos conceptos visuales preparados para revisión. El diseño sigue SIN APROBACIÓN del Director y no se modificó código. [Diseño UX y contratos](BT_FLOW_01A_DISENO_ARQUITECTURA.md) · [Checkpoint de planificación 01A](checkpoints/CHECKPOINT_BT_FLOW_01A_20261113.md).
