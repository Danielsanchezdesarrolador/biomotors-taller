# ByteTorque — BT-FLOW-01A — Arquitectura y propuesta UX del recorrido guiado

**Fecha:** 13/11/2026 · **Estado:** propuesta visual/técnica para aprobación del Director; **no implementada**.  
**Proyecto:** ByteTorque 1.0 · **Rama:** main · **Base auditada:** `c4ccd5fab71439dff8bc9c2a9da9e1fd568d15c1`.  
**Referencia:** `docs/BT_FLOW_01_FLUJO_TRABAJO_INTELIGENTE.md`; preserva `docs/SISTEMA_VISUAL_OFICIAL_R2.md`, BT-REG-02, BT-INS-01 y BT-COT-01.

## 1. Decisión de producto: un expediente por visita, cinco paneles inalterados

- La pantalla de Inicio **mantiene sus componentes R2 aprobados**. Solo después de la validación visual se podrá agregar una sección central «¿Qué vamos a hacer hoy?» con **Nuevo ingreso de vehículo** y **Continuar trabajos**; sin reconstruir la vista completa, desplazar KPI de forma arbitraria o alterar su identidad.
- El usuario puede recorrer una **guía contextual** con un solo expediente abierto, mientras los **cinco destinos** del sidebar/bottom-nav (Inicio, Órdenes de trabajo, Clientes y vehículos, Informes y cotizaciones, Configuración) siempre permanecen accesibles.
- En escritorio: Inicio con tarjeta de «Nuevo ingreso» + lista de expedientes en curso y una **tarjeta lateral de próxima acción**. En el expediente interior: barra superior de identidad de cliente, vehículo, OT y estado; progresión vertical u horizontal compacta; contenido principal del paso, CTA único y una acción secundaria para retroceder.
- En iPhone Safari PWA: CTA de ingreso primero; lista en tarjetas con vehículo, OT, estado y **Continuar**; progreso compacto en el expediente, un paso visible a la vez, CTA táctil ≥44px; bottom-nav de los mismos cinco destinos. No copiar una tabla estrecha de escritorio.
- **Mockups conceptuales:** en la conversación de diseño se entregaron dos imágenes ilustrativas de Inicio escritorio+iPhone y de recepción/expediente interior. No son capturas de Render ni están integradas al repositorio; logos, patentes, cifras, contactos y etapas dibujadas son demostrativas y requieren homologación con los componentes R2 reales. Nunca usar información de contacto real vista en material de referencia como fixture de desarrollo.

### Especificación del bloque de Inicio

1. «Nuevo ingreso de vehículo» → abre expediente nuevo en Recepción, preguntando **«¿Cliente nuevo o ya registrado?»**; búsqueda por nombre/teléfono dentro del taller solo en backend futuro, con acceso autorizado.
2. «Continuar trabajos» → filas/tarjetas de expedientes efectivamente conocidos por el store temporal, ordenados por última actividad y mostrando **siguiente acción**, no porcentajes ficticios. Se puede abrir el expediente correcto por `visitId`.
3. «Ver todas las órdenes» → conserva la navegación actual al panel de OT.
4. «Última actividad» → resume eventos de esa visita en memoria (p. ej., inspección guardada), **sin afirmar guardado permanente**.
5. «Pendientes de validación» → avisos de cotización por revisar, autorización no obtenida, repuestos pendientes o controles sin revisar; no cambiar automáticamente estados de orden.

## 2. Mapa de interacción por paso

| Etapa interna | Título visible | Entrada/edición | Resultado confirmado | Siguiente acción habilitada |
|---|---|---|---|---|
| `recepcion` | Cliente y vehículo | Cliente existente o nuevo DEMO; solicitud BT-REG-02; vehículo asociado o nuevo | Identidad de ficha y propiedad lógica del vínculo verificadas en DEMO; fecha/km/motivo inicial | Revisar orden |
| `orden` | Orden de trabajo | Resumen de ingreso, motivo original, km y responsable | OT DEMO creada **una sola vez** tras confirmación | Iniciar multipunto |
| `inspeccion` | Inspección multipunto | BT-INS-01, 34 controles y notas | Revisión registrada con pendientes explícitos; no asumir que sin revisar está correcto | Definir trabajos |
| `propuesta` | Trabajos y repuestos | Diagnóstico del técnico, ítems, cantidades y precios | Revisión humana de necesidad y precios; origen de cada propuesta | Preparar cotización |
| `cotizacion` | Cotización | BT-COT-01 modo quote, IVA 19 %, condiciones | Documento de revisión concreta preparado; aprobación no implícita | Solicitar respuesta |
| `respuesta_cliente` | Respuesta del cliente | Aprobar DEMO / Rechazar DEMO / Solicitar cambios | Estado registrado para **esa versión** de la cotización, sin valor legal | Ejecutar trabajos autorizados, volver a propuesta o pausar |
| `ejecucion` | Trabajo realizado | BT-COT-01 modo work, marcar explícitamente `performed` | Solo se consideran realizados los ítems marcados por operador DEMO | Preparar informe final |
| `informe_final` | Informe final | Resultado, pendientes técnicos e impresión A4 | Informe DEMO revisado y cerrado; no se considera enviado | Revisar entrega |
| `entrega` | Entrega del vehículo | Checklist de cierre y documentos | Visita finalizada DEMO con historial de la sesión; sin correo, firma o pago | Regresar a Inicio |

La interfaz puede **agrupar etapas visualmente en siete hitos** para no abrumar: (1) Recepción (incluye motivo), (2) OT, (3) Inspección, (4) Propuesta, (5) Cotización y respuesta, (6) Trabajo e informe, (7) Entrega. Los **nueve estados internos** se conservan para distinguir propuesta económica, aceptación, ejecución y evidencias.

### Acciones y casos que no son lineales

- Cliente vuelve con el mismo vehículo: **nueva visita**, no sobrescribir historial ni crear ficha duplicada.
- Solicitud BT-REG-02: revisar antecedentes con una sola acción y exigir confirmación antes de crear la OT; datos incompletos se solicitan, no se inventan.
- Cotización rechazada o modificada: vuelve a Propuesta/Cotización; versión anterior deja de autorizar trabajos.
- Espera de repuestos: pausa visible, sin marcar como completado; acceso a otras OT mediante sidebar.
- Un vehículo puede tener varias cotizaciones/revisiones de una visita. La aprobación se liga a un `quoteId` y `revision`, nunca al vehículo de forma genérica.
- Inspección con ítems sin revisar: puede continuar solo con advertencia y política de cierre explícita; jamás convertir «Sin revisar» a «Correcto».
- Trabajo adicional: requiere actualizar propuesta/cotización y nuevo proceso de aprobación si corresponde. Sin crear automáticamente ítems o valores.
- Cambio de panel: conserva contexto de `visitId` y `lastResourceId`, pero no modifica etapas por navegar.
- Cancelación: distinguir «cancelar acción» de «cancelar visita»; pedir confirmación si hay datos de la sesión.

## 3. Matriz de estados y puertas funcionales

- Estados de cada etapa: `pendiente`, `en_curso`, `completado`, `bloqueado`; alternativa `omitido_justificado` solo si una regla autorizada lo permite y queda trazada. Mostrar motivo del bloqueo y la acción requerida.
- El estado global de la visita: `borrador`, `en_curso`, `en_espera`, `cancelada`, `cerrada_demo`.
- Nunca calcular completitud únicamente con el índice de página; derivarla de **evidencia de cada entidad** (cliente/vehículo confirmados, OT creada, informe guardado, documento revisado, etc.).
- `Continuar` selecciona la primera etapa pendiente con requisito cumplido y vuelve al recurso original; si hay un bloqueo permite «Resolver pendiente» o «Volver», no salta al siguiente.
- **Regla de oro:** completar una inspección no genera automáticamente un diagnóstico; añadir un ítem no constituye una cotización aprobada; una cotización aprobada no significa trabajo realizado; una impresión no acredita envío.

## 4. Modelo de datos conceptual

```text
Taller DEMO
└── Cliente (clientId)
    └── Vehículo (vehicleId)
        ├── Visita previa 1 (visitId)
        └── Visita actual (visitId) 
            ├── Solicitud de ingreso (intakeRequestId?)
            ├── Orden (orderId?)
            ├── Inspección multipunto (inspectionId?)
            ├── Propuesta y partidas (revisión)
            ├── Cotización/es (quoteId, revision)
            ├── Aprobación DEMO (quoteId + revision)
            ├── Informe trabajo (workReportId?)
            └── Entrega/observaciones pendientes
```

```ts
type FlowCase = {
  id: string;                       // visitId único por visita
  workshopId: 'workshop-demo';       // NO autorización real de tenant
  clientId?: string;
  vehicleId?: string;
  intakeRequestId?: string;
  orderId?: string;
  inspectionId?: string;
  quoteId?: string;
  quoteRevision?: number;
  workReportId?: string;
  currentStage: FlowStage;
  stageStates: Record<FlowStage, 'pendiente'|'en_curso'|'completado'|'bloqueado'>;
  status: 'borrador'|'en_curso'|'en_espera'|'cancelada'|'cerrada_demo';
  lastContext?: {panel: 'inicio'|'ordenes'|'clientes'|'informes'|'configuracion'; resourceId?: string};
  revision: number;
  updatedAt: string;
};
```

Los tipos aquí son **especificación**, no archivos TypeScript creados. El store DEMO (una única memoria temporal montada sobre el App shell) actuará como **registro de índices, vínculos y estado de flujo**, sin clonar diagnósticos/ítems dentro del expediente. Los datos de clientes, vehículos, órdenes, inspecciones y documentos seguirán siendo de sus respectivos modelos, accedidos mediante adaptadores por IDs estables. El futuro servidor validará autoría y tenant con Auth/RLS; `workshop-demo` nunca acredita permisos.

**Persistencia DEMO:** memoria de la pestaña únicamente. Navegar entre paneles no elimina el expediente; **recargar sí lo elimina** (avisar de forma inequívoca). No `localStorage`, `sessionStorage`, IndexedDB, backend, emails ni claves de servicio. El historial real multi-año no se promete antes de la etapa de backend seguro.

## 5. Auditoría de brechas en main, verificadas en código

| Ruta o contrato | Estado actual | Riesgo real a resolver |
|---|---|---|
| `src/App.tsx` | Navegación por cinco pantallas que desmonta paneles. Ya permite OT → Multipunto / Cotización / Trabajo | No conserva un `visitId` ni una «siguiente acción» central |
| `src/clientes/ClientesPanel.tsx` | `clients` y `requests` con `useState` internos | Solicitud/cliente nuevo desaparece del listado al salir; no pasa a la OT |
| `src/clientes/registroVisitaData.ts` | `crearSolicitudDemo` reduce registro a nombre, vehículo como texto, km, patente, motivo y fecha | Contacto y marca/modelo/año estructurados no quedan disponibles para confirmar sin volver a preguntar; ampliación de tipo con datos sintéticos requerida |
| `src/clientes/clientesData.ts` | Clientes/vehículos/historial de muestra derivados de OT estáticas | Clientes nuevos no aparecen en selectores, búsquedas ni historial |
| `src/ordenes/OrdenesPanel.tsx` | Nuevas OT en `useState` interno; selección de clientes a partir de fixtures existentes | OT creada puede desaparecer al salir y no aparecer en reportes |
| `src/ordenes/orderSession.ts` | `sessionOrders` deriva de fixtures + `revisions` escritas por OrdenDetalle | La creación de nuevas OT no equivale automáticamente a un registro compartido del resto de módulos |
| `src/informes/documentosData.ts` | `documentContext` comprueba OT/cliente/vehículo en fixtures estáticas; `createDocument` exige vínculos | No se puede emitir flujo DEMO nuevo hasta disponer de registros nuevos vinculados |
| `src/informes/multipunto/multipuntoSession.ts` | Guarda informes temporales independientes por ID | Reutilizar su ID y estado, sin inferir que 34/34 fueron revisados |
| `src/informes/trabajos/trabajosSession.ts` + `trabajosData.ts` | Borradores temporales y cálculo reutilizable; `performed` distingue propuesto/ejecutado | No clonar cotizaciones ni cambiar la política de aprobación por revisión |
| `src/informes/reportSession.ts` | Documentos clásicos y eventos simulados en memoria | Coordinar sin introducir un segundo historial incompatible |

**Orden técnico obligatorio tras aprobación:** primero resolver una fuente de consulta compartida de clientes/vehículos/visitas/OT y relaciones; después conectar el asistente y sus entradas al multipunto y BT-COT-01. Un "Continuar" visual sin esos vínculos es un falso avance.

## 6. Reglas visuales R2 y accesibilidad

- Conservación exacta del sidebar navy, cinco destinos, topbar, navegación móvil y estilos globales. El flujo es una capa **dentro** de los módulos, no un segundo shell.
- Fondo `#f0f6ff`; cards blancas borde `--bt-border`; azul de acción `--bt-blue`; texto `--bt-text` y secundario `--bt-muted`. Iconos Lucide. No introducir imágenes de otras marcas ni fotografías de clientes reales.
- 1650/1440 escritorio, 768 tablet, 390/375 móvil; sin scroll horizontal. Priorizar botón de acción visible y textos de 12–16 px legibles, campos móviles ≥16 px para Safari y objetivos táctiles ≥44 px.
- Barra del progreso legible por lectores de pantalla; indicar estado mediante **texto + icono**, no solo color; gestión de foco, volver y corrección sin perder datos del paso.
- Mensajes de error accionables: «Falta revisar el kilometraje» o «La cotización cambió y necesita nueva aprobación», no «Error desconocido».
- Progreso derivado de las evidencias del expediente; prohibido inventar porcentajes y cantidades de expedientes como si fueran información real de taller.

## 7. Pruebas y aprobación de la fase 01A

**Realizado en este checkpoint:** inventario de relaciones, especificación de estados, reglas de navegación y diseño conceptual en dos láminas (en conversación). No se ha implementado UI ni modificado React.

**Para aprobar visualmente:** el Director revisará los mockups como dirección visual; el resultado definitivo deberá homologarse con R2 y datos sintéticos, mantener cinco menús y la aprobación independiente de cotización, y confirmar que el flujo no obliga a iniciar siempre por «Nuevo cliente».

**BT-FLOW-01B podrá comenzar solo mediante una nueva instrucción expresa del Director:** antes de escribir código, reconsultar `main`, CI y cambios paralelos; implementar incrementos pequeños y probados. Se prohíbe tocar BT-CP02-D, Supabase, Auth/RLS, claves, onboarding, pagos, suscripciones, envíos reales, firma, inspección multipunto de Ignacio o Android nativo.

## 8. Pendientes

- Aprobación visual y funcional del Director; corrección de microtextos y distribución de Inicio/Expediente si hace falta.
- Diseño final de acceso desde una solicitud recibida y de acciones ante rechazo, repuestos pendientes y trabajo adicional.
- Implementación 01B–01E, pruebas físicas Safari/iPhone, y fases de backend con permisos y persistencia cuando exista autorización independiente.
