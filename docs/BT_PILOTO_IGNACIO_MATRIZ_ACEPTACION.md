# ByteTorque — Matriz de aceptación del piloto de Ignacio

**Fecha de corte:** 16/11/2026. **Fuente de verdad:** evidencia de pruebas del Director, consulta SQL alojada y CI/checkpoints. CP03 fue comprobado en escritorio con datos ficticios; no se afirma QA físico iPhone ni aprobación de Ignacio. **Prioridad:** piloto completo antes de comercialización.

| Funcionalidad | Interfaz DEMO / preparación | Backend real en Supabase alojado | QA relevante | Aprobación Ignacio |
|---|---|---|---|---|
| Login y usuarios | Acceso R1 y roles presentes; visibilidad detrás de flag | Auth y membresías existentes; acceso operativo limitado | A/B R1 previos; Safari físico pendiente | Pendiente |
| Clientes | **Directorio privado operativo en web con Auth real** | **Ficha ficticia creada y persistente en Supabase alojado**; RLS FORCE activa | Director confirmó alta, logout/login, recuperación y edición; prueba iPhone pendiente | Pendiente |
| Vehículos | **Alta y edición reales en directorio privado CP03** | **`QA1234` persistente**; marca/modelo ficticios, año 2020, kilometraje almacenado 123456 | Director confirmó recuperación por patente tras nueva sesión; SQL alojado comprobó datos editados | Pendiente |
| Identificación de retornos | **Búsqueda real por patente y ficha vinculada** | Cliente y vehículo recuperados en Supabase alojado tras cerrar sesión | Flujo ficticio `QA1234` confirmado en escritorio; retorno meses después pendiente | Pendiente |
| Recepción | **Formulario privado CP04 publicado en Render**, vinculado a CP03 | SQL CP04 alojado, RLS FORCE activa; sin registros reales | Transacción de recepción ficticia con ROLLBACK exitosa; QA humano pendiente | Pendiente |
| Orden de trabajo | **Lista, alta, estados y cierre privados activados** | SQL CP04 real en `work_orders` sin datos iniciales | Lab A/B y prueba transaccional con cierre; crear + reingresar en navegador pendiente | Pendiente |
| Inspección multipunto | **Formulario de inspección CP04 activado** | SQL real en `inspection_findings`, RLS FORCE activa | Hallazgo ficticio «Requiere atención» comprobado en transacción revertida; QA físico pendiente | Pendiente |
| Diagnósticos/observaciones | **Historial de problemas pendientes y acción «resuelto» publicados** | SQL CP04 instalado; conserva nota original y fecha/resolución | RLS PostgreSQL 17, cierre histórico y prueba transaccional aprobados; flujo entre visitas desde UI pendiente | Pendiente |
| Reparaciones/seguimiento/entrega | Flujo DEMO | No conectado | Recorrido real pendiente | Pendiente |
| Cotización | CP05 candidato integrado a OT/vehículo; editor existente, neto/IVA y RPC | **SQL no aplicado; CP05 NO operativo** | 552 tests; PostgreSQL local A/B, concurrencia y recuperación entre conexiones; UI HTTP sintético | Pendiente |
| PDF | PDF A4 auténtico descargable de borrador CP05; logo oficial y Unicode | Emisión/archivo privados bloqueados; Storage no activado | Descarga Chromium, bytes válidos, A4, paginación y restauración con adaptador simulado; archivo alojado pendiente | Pendiente |
| Correos | Handler/adaptador transaccional con PDF privado, destinatario del snapshot, idempotencia y ledger candidato | **Desactivados**; sin Edge/proveedor/secretos nuevos | Acuse sintético, rechazo y estado ambiguo; ningún correo real | Pendiente |
| Historial por vehículo | CP06 candidato integrado en ficha; visitas/pendientes paginados y enlaces a OT/revisiones | Lee contratos CP03/CP04 existentes; CP06 OFF, sin nuevas tablas ni activación | 569 tests; HTTP sintético 45 visitas/25 pendientes, logout/login, revocación, 1440/390/375; alojado/físico pendientes | Pendiente |
| Respaldo y restauración | Exportador Cloud cifrado a Drive y restaurador offline candidatos; ensayo sintético adicional PASS | Exportaciones Auth/public y restauración aislada PostgreSQL 17 verificadas antes de CP03 | Sin automatización; copia externa redundante no confirmada | Pendiente |
| iPhone Safari/PWA | CP03 disponible en PWA privada publicada | Backend CP03 hospedado y Auth/RLS activos | **Safari físico de Ignacio pendiente**; WebKit Linux no lo reemplaza | Pendiente |
| Android nativo | React Native/Expo existente | Sin paridad de datos reales | Bundle Expo PASS, APK física pendiente | Pendiente |
| Piloto de Ignacio | No iniciado | Sin flujo extremo a extremo | Cierre y aprobación pendientes | **Pendiente** |

## Definición de aprobado

No cambiar estado de una capacidad a **Operativa** sin comprobar persistencia real, autorización Auth/RLS del taller, reinicio de sesión, errores y recuperación; registrar evidencia fechada y revisión del usuario. Nada de clientes reales o envío de correos antes de autorizaciones independientes. Una ejecución PostgreSQL aislada o Vitest mock nunca equivale a QA de producción.

**Orden obligatorio:** Auth mínimo seguro → CP03 → CP04 → CP05 → CP06 → aceptación Ignacio → CP07–CP09.

Evidencia de esta preparación: [informe único CP05](checkpoints/CHECKPOINT_BT_CP05_20261116.md). No se declara persistencia, emisión ni envío alojados.

Preparación final actual: [informe único](BT_PILOTO_PREPARACION_FINAL_20261116.md). Exportación real actualizada y Drive no verificados; no se levantó la condición de SQL CP05 ni se activaron servicios.
