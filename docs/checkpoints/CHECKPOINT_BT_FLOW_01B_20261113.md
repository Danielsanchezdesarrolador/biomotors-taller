# BT-FLOW-01B — Entidades compartidas y expediente por visita

13/11/2026 (America/Santiago). Base real comprobada `88ea19e`, solo main. Autorización expresa del Director en orden BT-FLOW-01B/C; los mockups quedan aprobados como referencia para C. Sin otros agentes activos en este chat y sin cambios locales ajenos salvo iconos PNG generados previamente.

## Incremento B comprobado

- Se reutilizan los modelos existentes de cliente, vehículo, solicitud, OT, revisión, multipunto y documento premium. Los directorios DEMO existentes actúan como fuente compartida; no se creó una segunda base de fichas ni otro modelo de documento.
- Nuevos clientes, solicitudes estructuradas BT-REG-02 y OT clásicas permanecen en memoria al cambiar de panel. La solicitud conserva contacto y marca/modelo/año además del resumen original; las dos solicitudes históricas sin estos campos no reciben contactos inventados y requieren completarlos durante revisión.
- OT nuevas con `clientId`, `vehicleId`, `visitId` cuando corresponde. Adaptador de ID explícito para fixtures antiguas; documentos y selectores resuelven esa relación, y el acceso de OT a cliente pasa un ID de vehículo, no una patente.
- `FlowCase` indexa entidades por ID y conserva la recepción original de cada visita (fecha, km, motivo), sin duplicar diagnósticos, precios ni trabajos. Un vehículo recurrente genera visitas y OT independientes.
- Recepción valida antes de publicar fichas, bloquea duplicados por correo/patente para revisión humana y rechaza cliente/vehículo incongruentes. No trata patente como prueba de identidad, propiedad o permiso.
- Creación de visita y conversión de solicitud idempotentes; la OT se crea solo tras confirmación explícita y una segunda pulsación reutiliza la OT. No infiere diagnóstico, repuestos, precios ni aprobación.
- Recursos por visita reutilizables por ID. Las memorias de multipunto y BT-COT-01 solo notifican cambios de su caché; motores de controles, cálculos, aprobación e impresión preservados.
- Señal compartida con suscripción React e invalidación solo si hay cambios reales, evitando bucles por efectos de guardado y re-renderizado.
- Historial de vehículos incluye las nuevas OT, conservando las visitas anteriores y su motivo/km. Navegar no completa etapas; cierre de visita y coordinación profunda 01D/E permanecen bloqueados.

## Pruebas

TypeScript PASS, **74/74 Vitest en 12 archivos** (66 anteriores + ocho de integridad/expedientes), build Vite y PWA PASS. Las ocho nuevas cubren alta con IDs, recepción sin OT automática, doble pulsación, consulta desde Informes, visitas recurrentes, rechazo de cruces, transacción fallida sin ficha parcial, solicitud/OT única, recursos reutilizados, estado verificable y selección persistente. TypeScript repetido tras la adaptación del acceso OT → cliente por ID.

La interfaz guiada y los recorridos visuales corresponden al siguiente incremento C; no se atribuye todavía PASS de navegador al asistente. Integración B validada antes de iniciar C, según orden del Director.

## Archivos principales

`src/session/sessionSignal.ts`, `useDemoSession.ts`; `src/clientes/directorySession.ts`, `intakeSession.ts`, `clientesData.ts`, `registroVisitaData.ts`, `ClientesPanel.tsx`, captura de errores de alta duplicada en `RegistroClienteDemo.tsx`; `src/ordenes/orderSession.ts`, `ordenesData.ts`, `OrdenesPanel.tsx`; adaptadores de `src/informes/documentosData.ts`, selectores de informes y notificación de cachés; `src/flow/flowSession.ts` y su prueba. Integración mínima de navegación por ID en App.

Solo memoria de página: recargar/cerrar descarta altas y borradores DEMO. Sin localStorage, sessionStorage, IndexedDB, servidor, correos o enlaces públicos. Supabase, Auth/RLS, onboarding, BT-CP02-D/A-B, pagos y Android intactos. Esto no implementa seguridad multitenant real.
