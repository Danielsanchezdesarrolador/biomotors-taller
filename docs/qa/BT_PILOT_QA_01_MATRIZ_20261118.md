# ByteTorque — BT-PILOT-QA-01 · Matriz integral del piloto Ignacio

**Fecha:** 18/11/2026 · **Rama:** `main` · **Estado:** auditoría preparada, **PILOTO NO APROBADO**.

> **Lectura obligatoria:** C no significa que el flujo funcione con datos reales; S usa escenarios sintéticos; F es una prueba física parcial anterior y no valida la integración de hoy. Toda puerta G- permanece bloqueada hasta evidencia nueva y aprobación expresa. La matriz sirve para seguir el progreso, no para autorizar un despliegue.

## Convenciones

| Código | Significado |
|---|---|
| **C** | codigo_ci: evidencia técnica en código/CI; NO equivale a prueba productiva |
| **S** | simulado: fixture o HTTP/SQL local; NO equivale a backend alojado |
| **F** | fisico_parcial: comprobación manual del Director solo en el alcance descrito |
| **D** | pendiente_dispositivo: requiere sesión/prueba física de plataforma |
| **B** | bloqueado_seguridad: requiere puerta de seguridad y autorización |
| **N** | no_aplica: plataforma fuera del alcance del caso |

## Resumen por plataforma

| Plataforma | Conteo por clasificación |
|---|---|
| Web/escritorio | C: 15 · S: 13 · F: 1 · D: 0 · B: 7 · N: 2 |
| iPhone Safari/PWA | C: 0 · S: 0 · F: 1 · D: 19 · B: 17 · N: 1 |
| Android nativo | C: 6 · S: 3 · F: 0 · D: 2 · B: 26 · N: 1 |

## Matriz de aceptación

| ID | Área | Prio. | Criterio comprobable | Web | iPhone PWA | Android | Puertas |
|---|---|---|---|:---:|:---:|:---:|---|
| P01 | Acceso personal | P0 | Cuenta nueva confirma correo e inicia sesión sin activar taller automáticamente; usuario sin taller no ve operaciones. | S | B | B | G-AUTH |
| P02 | Roles | P0 | Dueño/admin ve operaciones permitidas; mecánico solo su ámbito; recepción no puede ejecutar tareas reservadas. | S | B | C | G-ROLES, G-RLS |
| P03 | Sesión y revocación | P0 | Logout, token caducado, revocación y cuenta sin taller borran los datos visibles y bloquean acciones; reingreso válido. | S | B | C | G-AUTH, G-RLS |
| P04 | Aislamiento A/B | P0 | No hay lecturas, escritura, búsqueda ni descarga cruzada usando ID conocido/consulta directa entre talleres. | S | B | S | G-RLS |
| P05 | Registro de cliente | P0 | Validar identidad del cliente con información mínima, consentimiento y alta sin crear duplicados accidentales. | S | B | B | G-DATA, G-PRIVACY |
| P06 | Vehículo recurrente | P0 | Cliente existente agrega/retoma vehículo y nueva visita conservando kilometraje, motivo y fechas por expediente. | C | B | B | G-DATA |
| P07 | Nueva recepción | P0 | Cliente, vehículo, motivo y km producen una OT única al confirmar; doble pulsación no duplica. | C | D | B | G-DATA |
| P08 | Borrador/retorno | P0 | Ir a WhatsApp, pestaña o menú y volver conserva el borrador; refrescar/reabrir recupera solo lo persistido autorizadamente. | S | D | B | G-DATA, G-DEVICE |
| P09 | Búsqueda de OT | P1 | Filtros y búsqueda localizan una OT por ID, patente y vehículo; ficha coincide con recepción. | C | D | C | G-DEVICE |
| P10 | Nueva OT real | P0 | Crear una OT con datos autorizados persiste en una nueva sesión y conserva propietario/taller correctos. | B | B | B | G-DATA, G-RLS, G-BACKUP |
| P11 | Multipunto 34 filas | P0 | 34 ítems independientes con exactamente una X (OK/atención/inmediato) o sin revisar, sin convertir pendiente en OK. | C | D | B | G-DEVICE |
| P12 | Autoguardado multipunto | P0 | Marcar 1, 2 o 10 ítems seguidos sin tocar Guardar; no pierde marcas/observaciones ni guarda otro expediente. | S | D | B | G-DATA, G-DEVICE |
| P13 | Informe y fotos | P1 | Notas por ítem y fotos autorizadas quedan asociadas a su visita; archivos erróneos no se aceptan. | C | D | B | G-DATA, G-PRIVACY |
| P14 | Diagnóstico vs motivo | P0 | Conserva motivo original separado del diagnóstico técnico; no inventa conclusiones ni trabajos. | C | D | B | G-DATA |
| P15 | Propuesta y aceptación | P0 | Cotización solo progresa tras confirmación y aceptación de revisión vigente; rechazo/cambios impiden ejecutar. | C | D | B | G-DATA |
| P16 | Revisión obsoleta | P0 | Modificar partidas, condiciones o inspección invalida aceptación previa y exige respuesta de nueva revisión. | C | D | B | G-DATA |
| P17 | Partidas CLP e IVA | P0 | Calcula cantidad × precio neto, subtotal, IVA 19 %, total y límite de partidas sin errores de redondeo. | C | D | S | G-DEVICE |
| P18 | PDF R3 borrador | P1 | Descarga A4 legible con partida nueva, datos del taller y aviso de borrador; PDF no representa emisión. | F | D | B | G-DEVICE |
| P19 | PDF A4 extenso | P1 | Formato R3 legible con muchas partidas, salto de páginas correcto, totales y advertencias sin repetición. | C | D | B | G-DEVICE |
| P20 | Archivo privado inmutable | P0 | Emisión autorizada genera una revisión una vez, guarda bytes privados con tamaño/SHA-256, no sobrescribe otro hash. | S | B | B | G-DOCS, G-BACKUP, G-RLS |
| P21 | Descarga PDF histórico | P0 | Desde vehículo y revisión R1/R2 obtiene PDF ORIGINAL; rechaza taller/vehículo ajenos y corrupción. | S | B | B | G-DOCS, G-RLS |
| P22 | Correo único de entrega | P1 | Envía al destinatario autorizado un solo correo con informe/cotización/entrega; errores no se declaran enviados. | B | B | B | G-DOCS, G-PRIVACY |
| P23 | Historial por vehículo | P0 | Lista visitas por fecha con motivo/OT/hallazgos, sin asignar reparaciones inexistentes ni mezclar talleres. | S | B | C | G-DATA, G-RLS |
| P24 | Trabajos realizados | P0 | Informe final parte con 'no realizado'; total y PDF incluyen SOLO trabajo marcado realizado. | C | D | B | G-DATA |
| P25 | Pausas y pendientes | P1 | Falta de repuesto o hallazgo pendiente impide cierre hasta resolución explícita y trazable. | C | D | B | G-DATA |
| P26 | Entrega y cierre | P0 | Entrega requiere inspección, aprobación vigente, trabajos y confirmación; cierre idempotente y sin envío no autorizado. | C | D | B | G-DATA, G-PRIVACY |
| P27 | Cancelación | P1 | Cancelar exige motivo, no borra historial ni permite entrega posterior de OT cancelada. | C | D | B | G-DATA |
| P28 | Sin conexión y reintento | P0 | Sin red no expone registros de otro taller ni confirma guardados; reconectar no duplica operaciones. | S | D | C | G-DEVICE, G-RLS |
| P29 | Cambio de taller/sesión | P0 | Al cambiar taller o usuario se vacía estado en pantalla y no aparece información cacheada de la sesión anterior. | S | D | C | G-AUTH, G-RLS |
| P30 | Planes y cupos | P1 | Básico personal; Plus 4 mecánicos, Full 8; adicionales USD 2 facturados solo al propietario. | S | B | S | G-PLAN |
| P31 | Concesión Ignacio | P0 | Cuenta de Ignacio confirmada; creador asigna Full permanente al taller correcto con auditoría y posible revocación. | B | B | B | G-PLAN, G-AUTH, G-BACKUP |
| P32 | Privacidad y consentimiento | P0 | Aviso/propósito/retención verificables antes de datos reales; acceso y tratamiento limitados a responsables autorizados. | B | B | B | G-PRIVACY |
| P33 | Respaldo/restauración | P0 | Respaldo cifrado integral Auth+BD+RLS+Storage y restauración AISLADA con comprobación antes de piloto. | B | B | B | G-BACKUP |
| P34 | PWA Safari iPhone | P1 | Instalar desde Safari, abrir/reabrir, navegar cinco pantallas sin recortes; flujos reales pendientes. | N | F | N | G-DEVICE |
| P35 | Android APK física | P0 | Generar APK interna firmada autorizada, instalar y probar flujo con táctil, teclado, navegación, cierres y reconexión. | N | N | D | G-DEVICE, G-RELEASE |
| P36 | Tamaño y accesibilidad | P1 | Sin desborde a 375/390/768/1440; controles táctiles, foco, navegación y lectores comprobables. | C | D | D | G-DEVICE |
| P37 | Migración reversible | P0 | Revisar diff y dependencias 04B/04C+CP03/04/05, plan de reversión y pruebas aisladas; activar solo con autorización. | B | B | B | G-RELEASE, G-BACKUP |
| P38 | Despliegue y rollback | P0 | Validar mismo commit web/nativo, versión, flags OFF, incidentes y reversión antes de acceso productivo. | B | B | B | G-RELEASE |

## Evidencia trazable por caso

### P01 · Acceso personal

- Criterio: Cuenta nueva confirma correo e inicia sesión sin activar taller automáticamente; usuario sin taller no ve operaciones.
- Clasificación: **Web S · PWA B · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md`](../../docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_10_20261115.md`](../../docs/checkpoints/CHECKPOINT_BT_AUTH_R2_A6_10_20261115.md)

### P02 · Roles

- Criterio: Dueño/admin ve operaciones permitidas; mecánico solo su ámbito; recepción no puede ejecutar tareas reservadas.
- Clasificación: **Web S · PWA B · Android C**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md`](../../docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md)
- Evidencia histórica/código: [`apps/android/scripts/test-demo-gateway.mjs`](../../apps/android/scripts/test-demo-gateway.mjs)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md)

### P03 · Sesión y revocación

- Criterio: Logout, token caducado, revocación y cuenta sin taller borran los datos visibles y bloquean acciones; reingreso válido.
- Clasificación: **Web S · PWA B · Android C**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md`](../../docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md)
- Evidencia histórica/código: [`apps/android/scripts/test-demo-gateway.mjs`](../../apps/android/scripts/test-demo-gateway.mjs)

### P04 · Aislamiento A/B

- Criterio: No hay lecturas, escritura, búsqueda ni descarga cruzada usando ID conocido/consulta directa entre talleres.
- Clasificación: **Web S · PWA B · Android S**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md`](../../docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md)
- Evidencia histórica/código: [`scripts/security/verify-plan04-local.sh`](../../scripts/security/verify-plan04-local.sh)
- Evidencia histórica/código: [`apps/android/scripts/test-demo-gateway.mjs`](../../apps/android/scripts/test-demo-gateway.mjs)

### P05 · Registro de cliente

- Criterio: Validar identidad del cliente con información mínima, consentimiento y alta sin crear duplicados accidentales.
- Clasificación: **Web S · PWA B · Android B**.
- Evidencia histórica/código: [`src/clientes/cp03PilotRepository.test.ts`](../../src/clientes/cp03PilotRepository.test.ts)
- Evidencia histórica/código: [`src/flow/receptionDraft.test.ts`](../../src/flow/receptionDraft.test.ts)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_LEGAL_01_20261116.md`](../../docs/checkpoints/CHECKPOINT_BT_LEGAL_01_20261116.md)

### P06 · Vehículo recurrente

- Criterio: Cliente existente agrega/retoma vehículo y nueva visita conservando kilometraje, motivo y fechas por expediente.
- Clasificación: **Web C · PWA B · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)
- Evidencia histórica/código: [`src/flow/receptionDraft.test.ts`](../../src/flow/receptionDraft.test.ts)
- Evidencia histórica/código: [`src/clientes/cp03PilotRepository.test.ts`](../../src/clientes/cp03PilotRepository.test.ts)

### P07 · Nueva recepción

- Criterio: Cliente, vehículo, motivo y km producen una OT única al confirmar; doble pulsación no duplica.
- Clasificación: **Web C · PWA D · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)
- Evidencia histórica/código: [`src/flow/flowBusiness.test.ts`](../../src/flow/flowBusiness.test.ts)
- Evidencia histórica/código: [`src/clientes/cp03PilotRepository.test.ts`](../../src/clientes/cp03PilotRepository.test.ts)

### P08 · Borrador/retorno

- Criterio: Ir a WhatsApp, pestaña o menú y volver conserva el borrador; refrescar/reabrir recupera solo lo persistido autorizadamente.
- Clasificación: **Web S · PWA D · Android B**.
- Evidencia histórica/código: [`src/flow/receptionDraft.test.ts`](../../src/flow/receptionDraft.test.ts)
- Evidencia histórica/código: [`src/ordenes/cp04Autosave.test.ts`](../../src/ordenes/cp04Autosave.test.ts)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)

### P09 · Búsqueda de OT

- Criterio: Filtros y búsqueda localizan una OT por ID, patente y vehículo; ficha coincide con recepción.
- Clasificación: **Web C · PWA D · Android C**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)
- Evidencia histórica/código: [`apps/android/scripts/test-demo-gateway.mjs`](../../apps/android/scripts/test-demo-gateway.mjs)

### P10 · Nueva OT real

- Criterio: Crear una OT con datos autorizados persiste en una nueva sesión y conserva propietario/taller correctos.
- Clasificación: **Web B · PWA B · Android B**.
- Evidencia histórica/código: [`src/ordenes/cp04Autosave.test.ts`](../../src/ordenes/cp04Autosave.test.ts)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_BACKUP_DRIVE_AUDIT_20261117.md`](../../docs/checkpoints/CHECKPOINT_BT_BACKUP_DRIVE_AUDIT_20261117.md)

### P11 · Multipunto 34 filas

- Criterio: 34 ítems independientes con exactamente una X (OK/atención/inmediato) o sin revisar, sin convertir pendiente en OK.
- Clasificación: **Web C · PWA D · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_INS_01_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_INS_01_20261113.md)
- Evidencia histórica/código: [`src/ordenes/Cp04MultipuntoChecklist.test.tsx`](../../src/ordenes/Cp04MultipuntoChecklist.test.tsx)

### P12 · Autoguardado multipunto

- Criterio: Marcar 1, 2 o 10 ítems seguidos sin tocar Guardar; no pierde marcas/observaciones ni guarda otro expediente.
- Clasificación: **Web S · PWA D · Android B**.
- Evidencia histórica/código: [`src/ordenes/cp04Autosave.test.ts`](../../src/ordenes/cp04Autosave.test.ts)
- Evidencia histórica/código: [`src/ordenes/Cp04MultipuntoChecklist.test.tsx`](../../src/ordenes/Cp04MultipuntoChecklist.test.tsx)

### P13 · Informe y fotos

- Criterio: Notas por ítem y fotos autorizadas quedan asociadas a su visita; archivos erróneos no se aceptan.
- Clasificación: **Web C · PWA D · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_INS_01_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_INS_01_20261113.md)
- Evidencia histórica/código: [`src/ordenes/Cp04MultipuntoChecklist.test.tsx`](../../src/ordenes/Cp04MultipuntoChecklist.test.tsx)

### P14 · Diagnóstico vs motivo

- Criterio: Conserva motivo original separado del diagnóstico técnico; no inventa conclusiones ni trabajos.
- Clasificación: **Web C · PWA D · Android B**.
- Evidencia histórica/código: [`src/flow/flowBusiness.test.ts`](../../src/flow/flowBusiness.test.ts)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_INS_01_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_INS_01_20261113.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)

### P15 · Propuesta y aceptación

- Criterio: Cotización solo progresa tras confirmación y aceptación de revisión vigente; rechazo/cambios impiden ejecutar.
- Clasificación: **Web C · PWA D · Android B**.
- Evidencia histórica/código: [`src/flow/flowBusiness.test.ts`](../../src/flow/flowBusiness.test.ts)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)

### P16 · Revisión obsoleta

- Criterio: Modificar partidas, condiciones o inspección invalida aceptación previa y exige respuesta de nueva revisión.
- Clasificación: **Web C · PWA D · Android B**.
- Evidencia histórica/código: [`src/flow/flowBusiness.test.ts`](../../src/flow/flowBusiness.test.ts)
- Evidencia histórica/código: [`src/cp05/cp05.test.ts`](../../src/cp05/cp05.test.ts)

### P17 · Partidas CLP e IVA

- Criterio: Calcula cantidad × precio neto, subtotal, IVA 19 %, total y límite de partidas sin errores de redondeo.
- Clasificación: **Web C · PWA D · Android S**.
- Evidencia histórica/código: [`src/cp05/cp05.test.ts`](../../src/cp05/cp05.test.ts)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_CP05_R3_DOCUMENTOS_REALES_QA_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_CP05_R3_DOCUMENTOS_REALES_QA_20261118.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md)

### P18 · PDF R3 borrador

- Criterio: Descarga A4 legible con partida nueva, datos del taller y aviso de borrador; PDF no representa emisión.
- Clasificación: **Web F · PWA D · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_CP05_R3_DOCUMENTOS_REALES_QA_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_CP05_R3_DOCUMENTOS_REALES_QA_20261118.md)
- Evidencia histórica/código: [`src/cp05/pdf.ts`](../../src/cp05/pdf.ts)

### P19 · PDF A4 extenso

- Criterio: Formato R3 legible con muchas partidas, salto de páginas correcto, totales y advertencias sin repetición.
- Clasificación: **Web C · PWA D · Android B**.
- Evidencia histórica/código: [`src/cp05/cp05.test.ts`](../../src/cp05/cp05.test.ts)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_CP05_R3_DOCUMENTOS_REALES_QA_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_CP05_R3_DOCUMENTOS_REALES_QA_20261118.md)

### P20 · Archivo privado inmutable

- Criterio: Emisión autorizada genera una revisión una vez, guarda bytes privados con tamaño/SHA-256, no sobrescribe otro hash.
- Clasificación: **Web S · PWA B · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_CP05_PRIVATE_ARCHIVE_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_CP05_PRIVATE_ARCHIVE_20261118.md)
- Evidencia histórica/código: [`src/cp05/archiveIntegrity.test.ts`](../../src/cp05/archiveIntegrity.test.ts)

### P21 · Descarga PDF histórico

- Criterio: Desde vehículo y revisión R1/R2 obtiene PDF ORIGINAL; rechaza taller/vehículo ajenos y corrupción.
- Clasificación: **Web S · PWA B · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_CP06_PDF_HISTORICO_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_CP06_PDF_HISTORICO_20261118.md)
- Evidencia histórica/código: [`src/historial/archiveDownload.test.ts`](../../src/historial/archiveDownload.test.ts)

### P22 · Correo único de entrega

- Criterio: Envía al destinatario autorizado un solo correo con informe/cotización/entrega; errores no se declaran enviados.
- Clasificación: **Web B · PWA B · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_CP05_PRIVATE_ARCHIVE_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_CP05_PRIVATE_ARCHIVE_20261118.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)

### P23 · Historial por vehículo

- Criterio: Lista visitas por fecha con motivo/OT/hallazgos, sin asignar reparaciones inexistentes ni mezclar talleres.
- Clasificación: **Web S · PWA B · Android C**.
- Evidencia histórica/código: [`src/historial/history.test.ts`](../../src/historial/history.test.ts)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_CP06_20261116.md`](../../docs/checkpoints/CHECKPOINT_BT_CP06_20261116.md)
- Evidencia histórica/código: [`apps/android/scripts/test-demo-gateway.mjs`](../../apps/android/scripts/test-demo-gateway.mjs)

### P24 · Trabajos realizados

- Criterio: Informe final parte con 'no realizado'; total y PDF incluyen SOLO trabajo marcado realizado.
- Clasificación: **Web C · PWA D · Android B**.
- Evidencia histórica/código: [`src/flow/flowBusiness.test.ts`](../../src/flow/flowBusiness.test.ts)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)

### P25 · Pausas y pendientes

- Criterio: Falta de repuesto o hallazgo pendiente impide cierre hasta resolución explícita y trazable.
- Clasificación: **Web C · PWA D · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)
- Evidencia histórica/código: [`src/flow/flowBusiness.test.ts`](../../src/flow/flowBusiness.test.ts)

### P26 · Entrega y cierre

- Criterio: Entrega requiere inspección, aprobación vigente, trabajos y confirmación; cierre idempotente y sin envío no autorizado.
- Clasificación: **Web C · PWA D · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)
- Evidencia histórica/código: [`src/flow/flowBusiness.test.ts`](../../src/flow/flowBusiness.test.ts)

### P27 · Cancelación

- Criterio: Cancelar exige motivo, no borra historial ni permite entrega posterior de OT cancelada.
- Clasificación: **Web C · PWA D · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)
- Evidencia histórica/código: [`src/flow/flowBusiness.test.ts`](../../src/flow/flowBusiness.test.ts)

### P28 · Sin conexión y reintento

- Criterio: Sin red no expone registros de otro taller ni confirma guardados; reconectar no duplica operaciones.
- Clasificación: **Web S · PWA D · Android C**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md`](../../docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md)
- Evidencia histórica/código: [`apps/android/scripts/test-demo-gateway.mjs`](../../apps/android/scripts/test-demo-gateway.mjs)
- Evidencia histórica/código: [`src/ordenes/cp04Autosave.test.ts`](../../src/ordenes/cp04Autosave.test.ts)

### P29 · Cambio de taller/sesión

- Criterio: Al cambiar taller o usuario se vacía estado en pantalla y no aparece información cacheada de la sesión anterior.
- Clasificación: **Web S · PWA D · Android C**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md`](../../docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md)
- Evidencia histórica/código: [`apps/android/scripts/test-demo-gateway.mjs`](../../apps/android/scripts/test-demo-gateway.mjs)
- Evidencia histórica/código: [`src/clientes/cp03PilotRepository.test.ts`](../../src/clientes/cp03PilotRepository.test.ts)

### P30 · Planes y cupos

- Criterio: Básico personal; Plus 4 mecánicos, Full 8; adicionales USD 2 facturados solo al propietario.
- Clasificación: **Web S · PWA B · Android S**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_PLAN_04_IMPLEMENTACION_20261117.md`](../../docs/checkpoints/CHECKPOINT_BT_PLAN_04_IMPLEMENTACION_20261117.md)
- Evidencia histórica/código: [`scripts/security/verify-plan04-local.sh`](../../scripts/security/verify-plan04-local.sh)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md)

### P31 · Concesión Ignacio

- Criterio: Cuenta de Ignacio confirmada; creador asigna Full permanente al taller correcto con auditoría y posible revocación.
- Clasificación: **Web B · PWA B · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_PLAN_04_IMPLEMENTACION_20261117.md`](../../docs/checkpoints/CHECKPOINT_BT_PLAN_04_IMPLEMENTACION_20261117.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_BACKUP_DRIVE_AUDIT_20261117.md`](../../docs/checkpoints/CHECKPOINT_BT_BACKUP_DRIVE_AUDIT_20261117.md)

### P32 · Privacidad y consentimiento

- Criterio: Aviso/propósito/retención verificables antes de datos reales; acceso y tratamiento limitados a responsables autorizados.
- Clasificación: **Web B · PWA B · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_LEGAL_01_20261116.md`](../../docs/checkpoints/CHECKPOINT_BT_LEGAL_01_20261116.md)
- Evidencia histórica/código: [`src/clientes/cp03PilotRepository.test.ts`](../../src/clientes/cp03PilotRepository.test.ts)

### P33 · Respaldo/restauración

- Criterio: Respaldo cifrado integral Auth+BD+RLS+Storage y restauración AISLADA con comprobación antes de piloto.
- Clasificación: **Web B · PWA B · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_BACKUP_DRIVE_AUDIT_20261117.md`](../../docs/checkpoints/CHECKPOINT_BT_BACKUP_DRIVE_AUDIT_20261117.md)

### P34 · PWA Safari iPhone

- Criterio: Instalar desde Safari, abrir/reabrir, navegar cinco pantallas sin recortes; flujos reales pendientes.
- Clasificación: **Web N · PWA F · Android N**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md`](../../docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_UI_02_R2_20261111.md`](../../docs/checkpoints/CHECKPOINT_BT_UI_02_R2_20261111.md)

### P35 · Android APK física

- Criterio: Generar APK interna firmada autorizada, instalar y probar flujo con táctil, teclado, navegación, cierres y reconexión.
- Clasificación: **Web N · PWA N · Android D**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md)
- Evidencia histórica/código: [`apps/android/README.md`](../../apps/android/README.md)

### P36 · Tamaño y accesibilidad

- Criterio: Sin desborde a 375/390/768/1440; controles táctiles, foco, navegación y lectores comprobables.
- Clasificación: **Web C · PWA D · Android D**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_INS_01_20261113.md`](../../docs/checkpoints/CHECKPOINT_BT_INS_01_20261113.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md)

### P37 · Migración reversible

- Criterio: Revisar diff y dependencias 04B/04C+CP03/04/05, plan de reversión y pruebas aisladas; activar solo con autorización.
- Clasificación: **Web B · PWA B · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_PLAN_04_IMPLEMENTACION_20261117.md`](../../docs/checkpoints/CHECKPOINT_BT_PLAN_04_IMPLEMENTACION_20261117.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_CP05_PRIVATE_ARCHIVE_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_CP05_PRIVATE_ARCHIVE_20261118.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_BACKUP_DRIVE_AUDIT_20261117.md`](../../docs/checkpoints/CHECKPOINT_BT_BACKUP_DRIVE_AUDIT_20261117.md)

### P38 · Despliegue y rollback

- Criterio: Validar mismo commit web/nativo, versión, flags OFF, incidentes y reversión antes de acceso productivo.
- Clasificación: **Web B · PWA B · Android B**.
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md`](../../docs/checkpoints/CHECKPOINT_BT_ANDROID_02_INTEGRACION_OFFLINE_20261118.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_PLAN_04_IMPLEMENTACION_20261117.md`](../../docs/checkpoints/CHECKPOINT_BT_PLAN_04_IMPLEMENTACION_20261117.md)
- Evidencia histórica/código: [`docs/checkpoints/CHECKPOINT_BT_BACKUP_DRIVE_AUDIT_20261117.md`](../../docs/checkpoints/CHECKPOINT_BT_BACKUP_DRIVE_AUDIT_20261117.md)

## Puertas de habilitación — todas cerradas

| Puerta | Requisito de aprobación | Estado |
|---|---|---|
| G-BACKUP | Respaldo cifrado integral verificable, lectura de artefacto y restauración aislada | **BLOQUEADA** |
| G-AUTH | Identidad, confirmación de correo, sesión/MFA y revocación reales | **BLOQUEADA** |
| G-RLS | Aislamiento real multitenant para lectura, escritura, historial y descarga | **BLOQUEADA** |
| G-DATA | Migraciones CP03/CP04 + guardado real autorizado + continuidad de expediente | **BLOQUEADA** |
| G-DOCS | Storage privado, PDF emitido/recuperado, hash, permisos y proveedor de correo autorizado aparte | **BLOQUEADA** |
| G-PRIVACY | Propósito, minimización, consentimiento/avisos y retención aprobados | **BLOQUEADA** |
| G-PLAN | Licencias/cupos y concesión Full Ignacio efectivas y auditadas; cobros OFF | **BLOQUEADA** |
| G-DEVICE | QA física en Safari iPhone y Android con roles y recorridos, antes del uso con datos reales | **BLOQUEADA** |
| G-RELEASE | Repositorio privado para procesos sensibles, migraciones/despliegue reversibles y autorización final | **BLOQUEADA** |

## Protocolo de ejecución del piloto

1. Confirmar con Ignacio nomenclatura, flujos y criterios; usar datos totalmente ficticios durante QA previa. Ningún dato personal de clientes reales antes de privacidad, copias y restauración.
2. **Antes de escribir en Supabase alojado:** repo privado para exportaciones sensibles, respaldo cifrado integral con hash/readback, ensayo de restauración en entorno aislado. Revisar SQL/Storage/Edge/flags y obtener autorización expresa por instalación.
3. Verificar con cuentas autorizadas A/B los accesos, escritura y lectura de OT, historial, PDF, revocación de roles y rol mecánico; probar ausencia de fugas incluso por ID ajeno. Nunca restituir una membresía temporal antigua sin autorización.
4. Con el backend protegido, realizar escenario completo de recepción → OT → 34 X/autoguardado → propuesta/revisión → respuesta → trabajos realizados → PDF R3/archivo privado → historial → entrega. Repetir en escritorio, Safari iPhone y Android APK interna **firmada con permiso**.
5. Registrar por cada ejecución: fecha, versión/commit, plataforma/modelo/OS, perfil y taller ficticio, pasos, esperado, resultado observado, evidencia sin datos sensibles, incidencia, responsable y nuevo estado. **No sobrescribir C/S/F con PASS real** sin prueba correspondiente.
6. En caso de falla de aislamiento, pérdida de datos, corrupción, descarga ajena, sesión inválida o restauración, detener inmediatamente el piloto; no probar con clientes verdaderos hasta subsanar y revalidar.

## Comandos de auditoría sin red

```sh
node scripts/qa/verify-pilot-matrix.mjs --check
cd apps/android
npm run test:contracts
```

Las pruebas de contrato Android son sintéticas; la verificación de matriz solo valida **consistencia, trazabilidad y clasificación**, no ejecuta escenarios físicos o productivos.

## Servicios deliberadamente intactos

Ninguna migración SQL, cambio RLS alojado, cuenta de Ignacio, Storage, Edge, correo, cobro, OTA ni APK real fue activada por esta auditoría. El sitio Render/flag público no fue modificado. La preparación documental no sustituye un respaldo funcional.
