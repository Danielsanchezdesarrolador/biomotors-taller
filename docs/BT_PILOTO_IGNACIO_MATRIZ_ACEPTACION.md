# ByteTorque — Matriz de aceptación del piloto de Ignacio

**Fecha de corte:** 15/11/2026. **Fuente de verdad:** evidencia en CI/checkpoints; no se afirma uso real sin QA y aprobación de Ignacio. **Prioridad:** piloto completo antes de comercialización. Todas las pruebas DEMO se realizan con datos sintéticos.

| Funcionalidad | Interfaz DEMO / preparación | Backend real en Supabase alojado | QA relevante | Aprobación Ignacio |
|---|---|---|---|---|
| Login y usuarios | Acceso R1 y roles presentes; visibilidad detrás de flag | Auth y membresías existentes; acceso operativo limitado | A/B R1 previos; Safari físico pendiente | Pendiente |
| Clientes | Formulario DEMO; panel P3 candidato aislado (no visible en web oficial) | **CP03 SQL candidato, aún no aplicado**; repositorio P2 no conectado | Mock P2/P3 + PG17 RLS P1 PASS; E2E real pendiente | Pendiente |
| Vehículos | Registro DEMO; alta/edición P3 candidatos aislados | **CP03 SQL candidato, aún no aplicado**; repositorio P2 no conectado | Duplicados/tenant PG17 + UI P3 pruebas estáticas PASS; E2E real pendiente | Pendiente |
| Identificación de retornos | Enlaces DEMO y búsqueda | Búsqueda por patente, ficha reciente y recuperación por ID P2/P3 preparadas, aisladas | Mock P2/P3 PASS, sin datos persistentes reales | Pendiente |
| Recepción | Flujo DEMO | No conectado | Demo QA, producción pendiente | Pendiente |
| Orden de trabajo | Flujo DEMO | No conectado | Demo QA, producción pendiente | Pendiente |
| Inspección multipunto | Flujo DEMO | No conectado | Demo QA; hoja real por contrastar | Pendiente |
| Diagnósticos/observaciones | Flujo DEMO | No conectado | Persistencia histórica pendiente | Pendiente |
| Reparaciones/seguimiento/entrega | Flujo DEMO | No conectado | Recorrido real pendiente | Pendiente |
| Cotización | Flujo DEMO | No conectado | Datos de precios reales pendientes | Pendiente |
| PDF | Impresión preliminar DEMO | Sin emisión archivada ni vinculación real | Diseño A4 previo; producción pendiente | Pendiente |
| Correos | Simulado | Resend no activado; sin correos reales | HTTP mock, sin pruebas proveedor real | Pendiente |
| Historial por vehículo | DEMO | No persistente | Recuperación después de meses pendiente | Pendiente |
| Respaldo y restauración | No operativos | Pendiente | Restauración real pendiente | Pendiente |
| iPhone Safari/PWA | Preparación web | Auth parcial; operaciones CP03–CP06 inactivas | WebKit Linux PASS, Safari real pendiente | Pendiente |
| Android nativo | React Native/Expo existente | Sin paridad de datos reales | Bundle Expo PASS, APK física pendiente | Pendiente |
| Piloto de Ignacio | No iniciado | Sin flujo extremo a extremo | Cierre y aprobación pendientes | **Pendiente** |

## Definición de aprobado

No cambiar estado de una capacidad a **Operativa** sin comprobar persistencia real, autorización Auth/RLS del taller, reinicio de sesión, errores y recuperación; registrar evidencia fechada y revisión del usuario. Nada de clientes reales o envío de correos antes de autorizaciones independientes. Una ejecución PostgreSQL aislada o Vitest mock nunca equivale a QA de producción.

**Orden obligatorio:** Auth mínimo seguro → CP03 → CP04 → CP05 → CP06 → aceptación Ignacio → CP07–CP09.
