# ByteTorque — BT-PILOT-QA-02 · Recorridos guiados de aceptación

**Fecha:** 18/11/2026 · **Estado: PLANIFICADO, SIN EJECUCIÓN FÍSICA NUEVA NI ACTIVACIÓN PRODUCTIVA** · Rama `main`.

> Este documento ordena pruebas; **NO registra aprobación de Ignacio, un APK probada ni pasos ejecutados en un servidor real**. Todos los resultados del registro CSV están SIN_EJECUTAR. Nunca colocar datos reales, credenciales, tokens, fotos de clientes o correos privados en evidencias públicas.

## Modo de trabajo

1. Identificar el recorrido y comprobar la columna de fase. DEMOSTRACIÓN: solo fixtures sintéticos/locales; DISPOSITIVO DEMO: prueba física pendiente; BLOQUEADO: NO iniciar hasta que TODAS las puertas estén abiertas con evidencia y aprobación expresa.
2. Usar el [registro en blanco](BT_PILOT_QA_02_REGISTRO_EN_BLANCO.csv) como plantilla local para documentar observado, fecha, responsable y ubicación privada de evidencia. **Nunca sobrescribir esta plantilla versionada con resultados que contengan información personal**.
3. Comparar esperado/observado por paso y asociar la referencia de [P01–P38](BT_PILOT_QA_01_MATRIZ_20261118.md). Prohibido declarar PASS por el solo hecho de que CI compile.
4. En sesiones reales autorizadas detenerse ante fuga entre talleres, confirmación falsa de guardado, perdida de OT/datos, PDF inválido, sesión revocada que aún acceda, o falla de restauración. Mantener correos/pagos/Storage OFF hasta permisos específicos.

## Índice de recorridos

| Recorrido | Plataforma | Rol | Fase | Casos | Pasos |
|---|---|---|---|---|---:|
| R01 · Administrador A: rutas nativas y detalle de OT | Android nativo Expo | administrador | **DEMOSTRACIÓN SIN RED** | P02, P04, P09, P17, P23, P29 | 4 |
| R02 · Mecánico A: permisos sintéticos y acceso denegado | Android nativo Expo | mecanico | **DEMOSTRACIÓN SIN RED** | P02, P03, P04, P09 | 3 |
| R03 · Taller B: aislamiento de muestras y cierre de sesión | Android nativo Expo | administrador | **DEMOSTRACIÓN SIN RED** | P03, P04, P23, P29 | 3 |
| R04 · Fallo de red y sesión vencida en Android | Android nativo Expo | administrador | **DEMOSTRACIÓN SIN RED** | P03, P28, P29 | 3 |
| R05 · Web DEMO: recepción, expediente y retorno | Escritorio / navegador web | administrador | **DEMOSTRACIÓN SIN RED** | P05, P06, P07, P08, P09, P14 | 4 |
| R06 · Web DEMO: multipunto y autosave de interfaz | Escritorio / navegador web | mecanico | **DEMOSTRACIÓN SIN RED** | P11, P12, P13, P14 | 3 |
| R07 · Web DEMO: revisión, respuesta, trabajo y entrega | Escritorio / navegador web | administrador | **DEMOSTRACIÓN SIN RED** | P15, P16, P17, P24, P25, P26, P27 | 4 |
| R08 · PDF R3: borrador y paginación web | Escritorio / navegador web | administrador | **DEMOSTRACIÓN SIN RED** | P17, P18, P19 | 3 |
| R09 · iPhone PWA: experiencia de navegación sin backend nuevo | iPhone Safari / PWA | administrador | **DISPOSITIVO DEMO PENDIENTE** | P07, P08, P09, P11, P12, P17, P18, P28, P34, P36 | 3 |
| R10 · Android físico: APK de laboratorio pendiente de autorización | Android nativo Expo | administrador | **DISPOSITIVO DEMO PENDIENTE** | P28, P29, P35, P36 | 3 |
| R11 · Web real candidato: cuenta/roles, aislamiento A/B | Escritorio / navegador web | administrador | **BLOQUEADO PARA OPERACIÓN REAL** | P01, P02, P03, P04, P29 | 3 |
| R12 · Datos reales candidatos: recepción, OT y autoguardado | Escritorio / navegador web | administrador | **BLOQUEADO PARA OPERACIÓN REAL** | P05, P06, P07, P08, P10, P11, P12, P13, P23 | 3 |
| R13 · Documentos: revisiones privadas y recuperación íntegra | Escritorio / navegador web | administrador | **BLOQUEADO PARA OPERACIÓN REAL** | P15, P16, P17, P20, P21, P22, P23, P24 | 3 |
| R14 · iPhone PWA: aceptación funcional real con sesiones autorizadas | iPhone Safari / PWA | administrador | **BLOQUEADO PARA OPERACIÓN REAL** | P01, P02, P03, P08, P11, P12, P17, P20, P21, P23, P24, P26, P28, P29, P34, P36 | 3 |
| R15 · Android futuro: paridad backend y uso del mecánico | Android nativo Expo | mecanico | **BLOQUEADO PARA OPERACIÓN REAL** | P02, P03, P04, P10, P11, P12, P23, P28, P29, P35, P36 | 3 |
| R16 · Creador: licencias y Full permanente de Ignacio | Escritorio / navegador web | creador | **BLOQUEADO PARA OPERACIÓN REAL** | P30, P31 | 2 |
| R17 · Privacidad del piloto: consentimiento y control de tratamiento | Escritorio / navegador web | administrador | **BLOQUEADO PARA OPERACIÓN REAL** | P05, P13, P22, P32 | 2 |
| R18 · Respaldo y recuperación íntegra sin tocar producción | Infraestructura aislada | administrador | **BLOQUEADO PARA OPERACIÓN REAL** | P33, P37, P38 | 3 |

## Procedimientos por escenario

### R01 — Administrador A: rutas nativas y detalle de OT

**Plataforma:** Android nativo Expo · **Rol:** administrador · **Taller:** demo-a · **Fase:** DEMOSTRACIÓN SIN RED.

**Casos:** P02, P04, P09, P17, P23, P29. **Puertas exigidas antes de ejecutar en su fase:** ninguna para el laboratorio sintético; puertas de producción de la matriz siguen cerradas.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Abrir laboratorio Android con Administrador Taller A; buscar OT-1002 y abrir ficha. | La OT y patente DEMO-02 corresponden a A; no aparece información de B. |
| 2 | Desde la OT navegar a cotización asociada y regresar a su OT. | COT-DEMO-001 corresponde a OT-1002; totales de ejemplo $107.411 CLP sin descarga ni emisión. |
| 3 | Abrir Clientes, ficha DEMO-01 e historial; tocar una visita. | Solo historial de DEMO-01; la visita regresa a OT-1001 sin arrastrar foco de OT-1002. |
| 4 | Cambiar sección desde el menú inferior y buscar otra OT. | No aparece como abierta la OT anterior al cambiar de pestaña. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R02 — Mecánico A: permisos sintéticos y acceso denegado

**Plataforma:** Android nativo Expo · **Rol:** mecanico · **Taller:** demo-a · **Fase:** DEMOSTRACIÓN SIN RED.

**Casos:** P02, P03, P04, P09. **Puertas exigidas antes de ejecutar en su fase:** ninguna para el laboratorio sintético; puertas de producción de la matriz siguen cerradas.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Entrar como Mecánico Taller A; abrir Órdenes y buscar OT-1002. | Solo OT asignadas 1001/1002; no aparecen OT-1003/1004 ni OT del Taller B. |
| 2 | Abrir Clientes, Informes y Configuración por sus pestañas. | No se expone contenido protegido; módulos informan restricción del perfil. |
| 3 | Intentar abrir la inspección real desde OT asignada. | Se informa que la escritura/inspección real sigue bloqueada. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R03 — Taller B: aislamiento de muestras y cierre de sesión

**Plataforma:** Android nativo Expo · **Rol:** administrador · **Taller:** demo-b · **Fase:** DEMOSTRACIÓN SIN RED.

**Casos:** P03, P04, P23, P29. **Puertas exigidas antes de ejecutar en su fase:** ninguna para el laboratorio sintético; puertas de producción de la matriz siguen cerradas.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Entrar con Administrador B y revisar Inicio/Órdenes/Clientes/Cotizaciones. | Solo figuran OT-B-9001, DEMO-B1 y COT-DEMO-B01. |
| 2 | Abrir Configuración y salir del laboratorio; volver a entrar como Administrador A. | No se conserva foco, búsqueda ni datos del Taller B; ahora aparecen solo datos A. |
| 3 | Abrir el historial del vehículo A y examinar sus visitas. | Las visitas visibles corresponden al vehículo/taller A de la nueva sesión. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R04 — Fallo de red y sesión vencida en Android

**Plataforma:** Android nativo Expo · **Rol:** administrador · **Taller:** demo-a · **Fase:** DEMOSTRACIÓN SIN RED.

**Casos:** P03, P28, P29. **Puertas exigidas antes de ejecutar en su fase:** ninguna para el laboratorio sintético; puertas de producción de la matriz siguen cerradas.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | En Configuración activar 'Simular sin conexión' y navegar a órdenes/clientes. | Se muestran errores de lectura; no se reutilizan datos protegidos de consultas anteriores. |
| 2 | Restablecer la conexión ficticia y volver a consultar. | Los datos A vuelven tras nueva lectura; ninguna escritura ni reintento duplicado. |
| 3 | Simular vencimiento de sesión y consultar un panel; salir y reingresar. | La sesión vencida impide lecturas; reingreso ficticio inicia un contexto nuevo. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R05 — Web DEMO: recepción, expediente y retorno

**Plataforma:** Escritorio / navegador web · **Rol:** administrador · **Taller:** demo-a · **Fase:** DEMOSTRACIÓN SIN RED.

**Casos:** P05, P06, P07, P08, P09, P14. **Puertas exigidas antes de ejecutar en su fase:** ninguna para el laboratorio sintético; puertas de producción de la matriz siguen cerradas.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | En entorno DEMO local crear cliente y vehículo ficticios; iniciar recepción. | Datos del cliente/vehículo, motivo y km corresponden a la visita; no duplicar al confirmar dos veces. |
| 2 | Navegar entre Inicio, Órdenes y expediente; regresar a la visita. | El mismo contexto y referencia se mantienen dentro de la sesión DEMO. |
| 3 | Simular una segunda visita de un vehículo ya existente. | El nuevo motivo/km no altera visitas anteriores ni genera otro cliente accidentalmente. |
| 4 | Recargar el DEMO temporal y observar el aviso de pérdida. | Nunca interpretar persistencia en memoria como guardado real. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R06 — Web DEMO: multipunto y autosave de interfaz

**Plataforma:** Escritorio / navegador web · **Rol:** mecanico · **Taller:** demo-a · **Fase:** DEMOSTRACIÓN SIN RED.

**Casos:** P11, P12, P13, P14. **Puertas exigidas antes de ejecutar en su fase:** ninguna para el laboratorio sintético; puertas de producción de la matriz siguen cerradas.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Abrir multipunto sintético y marcar 1, luego 2 y luego 10 componentes sin cambiar de pantalla. | Cada fila mantiene una sola X y el contador refleja lo observado. |
| 2 | Anotar observaciones, dejar un ítem sin revisar y volver al expediente. | No se transforma pendiente en OK ni inventa diagnóstico. Solo verificar persistencia DEMO declarada. |
| 3 | Adjuntar una foto ficticia permitida y probar un archivo rechazado. | Se aplica validación local y ninguna foto se sube a servicios productivos. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R07 — Web DEMO: revisión, respuesta, trabajo y entrega

**Plataforma:** Escritorio / navegador web · **Rol:** administrador · **Taller:** demo-a · **Fase:** DEMOSTRACIÓN SIN RED.

**Casos:** P15, P16, P17, P24, P25, P26, P27. **Puertas exigidas antes de ejecutar en su fase:** ninguna para el laboratorio sintético; puertas de producción de la matriz siguen cerradas.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Generar propuesta con partidas ficticias y comprobar subtotal, IVA 19% y total. | Los importes reproducen el mismo motor de cálculo de la cotización. |
| 2 | Rechazar y solicitar cambios en sendas revisiones de ejemplo. | No se habilita ejecución de trabajos con revisión rechazada u obsoleta. |
| 3 | Aceptar nueva revisión, precargar informe, marcar 1 trabajo realizado. | Informe arranca en 'no realizado'; solo suma la partida realizada. |
| 4 | Simular falta de repuesto, resolución y luego entrega y cancelación en escenarios separados. | Los estados bloquean cierres indebidos y no se envía correo real. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R08 — PDF R3: borrador y paginación web

**Plataforma:** Escritorio / navegador web · **Rol:** administrador · **Taller:** demo-a · **Fase:** DEMOSTRACIÓN SIN RED.

**Casos:** P17, P18, P19. **Puertas exigidas antes de ejecutar en su fase:** ninguna para el laboratorio sintético; puertas de producción de la matriz siguen cerradas.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Generar borrador PDF R3 solo con datos ficticios; agregar una partida. | Documento A4 muestra nueva línea y cálculo correcto. Debe indicar BORRADOR y no tributario. |
| 2 | Generar borrador extenso de varias páginas (sin enviar ni emitir). | Tabla, cabecera, página y resumen son legibles y no duplican avisos legales. |
| 3 | Conservar evidencia únicamente de datos ficticios sin nombre real de clientes. | No se confunde descarga de borrador con emisión archivada. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R09 — iPhone PWA: experiencia de navegación sin backend nuevo

**Plataforma:** iPhone Safari / PWA · **Rol:** administrador · **Taller:** demo-a · **Fase:** DISPOSITIVO DEMO PENDIENTE.

**Casos:** P07, P08, P09, P11, P12, P17, P18, P28, P34, P36. **Puertas exigidas antes de ejecutar en su fase:** ninguna para el laboratorio sintético; puertas de producción de la matriz siguen cerradas.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Instalar desde Safari y abrir la PWA de prueba sin credenciales nuevas. | Apertura/reapertura e identidad R2 sin desbordes; registrar modelo/iOS. |
| 2 | Con datos sintéticos navegar recepción, OT, multipunto y cotización. | Sin controles tapados por teclado ni pérdida inesperada durante navegación local. |
| 3 | Cambiar a otra app, volver y probar modo avión solamente en datos DEMO. | No marcar guardado productivo ni entrega real; anotar límites observados. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R10 — Android físico: APK de laboratorio pendiente de autorización

**Plataforma:** Android nativo Expo · **Rol:** administrador · **Taller:** demo-a · **Fase:** DISPOSITIVO DEMO PENDIENTE.

**Casos:** P28, P29, P35, P36. **Puertas exigidas antes de ejecutar en su fase:** G-DEVICE, G-RELEASE.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Tras autorización de compilación/firma, instalar APK interna DEMO en Android de prueba. | Versión, icono, instalación y apertura sin cierre inesperado. |
| 2 | Navegar cinco pestañas con teclado, volver atrás y alternar entre A/B ficticios. | No hay información cruzada, foco obsoleto o desborde visual. |
| 3 | Simular conexión perdida y vencimiento; restaurar sesión ficticia. | Los mensajes describen errores; no hay solicitudes productivas. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R11 — Web real candidato: cuenta/roles, aislamiento A/B

**Plataforma:** Escritorio / navegador web · **Rol:** administrador · **Taller:** A/B pruebas autorizadas · **Fase:** BLOQUEADO PARA OPERACIÓN REAL.

**Casos:** P01, P02, P03, P04, P29. **Puertas exigidas antes de ejecutar en su fase:** G-AUTH, G-BACKUP, G-PRIVACY, G-RLS.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Tras restauración aislada y permisos, crear/iniciar cuentas ficticias autorizadas A/B. | Usuario sin taller está bloqueado; MFA/sesión/rol corresponden al actor. |
| 2 | Intentar leer/escribir el ID de recurso de otro taller, con cada rol. | RLS rechaza lecturas y escrituras cruzadas con evidencia de servidor. |
| 3 | Revocar membresía y renovar/cerrar sesión. | No hay datos visibles ni permisos después de revocación; registrar resultados sin tokens. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R12 — Datos reales candidatos: recepción, OT y autoguardado

**Plataforma:** Escritorio / navegador web · **Rol:** administrador · **Taller:** Taller piloto de pruebas · **Fase:** BLOQUEADO PARA OPERACIÓN REAL.

**Casos:** P05, P06, P07, P08, P10, P11, P12, P13, P23. **Puertas exigidas antes de ejecutar en su fase:** G-BACKUP, G-DATA, G-DEVICE, G-PRIVACY, G-RLS.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Solo con respaldo y SQL autorizado, crear cliente y vehículo de prueba en taller asignado. | Persisten en nueva sesión sin duplicarse ni aparecer en otro taller. |
| 2 | Crear OT e inspeccionar 34 X consecutivas y notas sin tocar Guardar. | Autoguardado confirma solo tras persistencia real y se recupera tras F5/nueva sesión. |
| 3 | Abrir historial de otra visita y de otro taller. | Aislamiento y relación por vehículo/visita se mantienen; no se inventan trabajos. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R13 — Documentos: revisiones privadas y recuperación íntegra

**Plataforma:** Escritorio / navegador web · **Rol:** administrador · **Taller:** Taller piloto de pruebas · **Fase:** BLOQUEADO PARA OPERACIÓN REAL.

**Casos:** P15, P16, P17, P20, P21, P22, P23, P24. **Puertas exigidas antes de ejecutar en su fase:** G-BACKUP, G-DATA, G-DEVICE, G-DOCS, G-PRIVACY, G-RLS.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Tras Storage/RLS y servicio autorizados, emitir una revisión a partir de cotización de prueba. | Solo una revisión inmutable, PDF con SHA-256/tamaño comprobados. |
| 2 | Editar nueva revisión y descargar PDF histórico desde CP06. | R1 original conserva bytes; R2 es otro archivo; IDs ajenos y corrupción son rechazados. |
| 3 | Ensayar eventual correo con proveedor de prueba habilitado por permiso independiente. | Ningún estado 'enviado' sin acuse confirmado; no enviar a destinatario real no autorizado. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R14 — iPhone PWA: aceptación funcional real con sesiones autorizadas

**Plataforma:** iPhone Safari / PWA · **Rol:** administrador · **Taller:** Taller piloto de pruebas · **Fase:** BLOQUEADO PARA OPERACIÓN REAL.

**Casos:** P01, P02, P03, P08, P11, P12, P17, P20, P21, P23, P24, P26, P28, P29, P34, P36. **Puertas exigidas antes de ejecutar en su fase:** G-AUTH, G-BACKUP, G-DATA, G-DEVICE, G-DOCS, G-PRIVACY, G-RLS.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Iniciar sesión de prueba autorizada desde PWA Safari y ejecutar recepción→multipunto→cotización. | La sesión y autoguardado persisten sin fugas ni pérdida de datos al abrir WhatsApp. |
| 2 | Revisar PDF emitido, historial, trabajos realizados y entrega. | Documentos privados correctos, roles aplicados y flujo cerrado con confirmación. |
| 3 | Revocar sesión, dejar sin red y comprobar bloqueo/recuperación. | Sin registros de otra cuenta ni falsos avisos de éxito. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R15 — Android futuro: paridad backend y uso del mecánico

**Plataforma:** Android nativo Expo · **Rol:** mecanico · **Taller:** Taller piloto de pruebas · **Fase:** BLOQUEADO PARA OPERACIÓN REAL.

**Casos:** P02, P03, P04, P10, P11, P12, P23, P28, P29, P35, P36. **Puertas exigidas antes de ejecutar en su fase:** G-AUTH, G-BACKUP, G-DATA, G-DEVICE, G-DOCS, G-RELEASE, G-RLS.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Solo después de APK real integrada y autorizada, ingresar con mecánico limitado. | Una sesión segura corresponde al taller y tareas asignadas. |
| 2 | Completar multipunto y confirmar recuperación tras salida/reingreso. | Autoguardado real no mezcla talleres ni confirma operaciones fallidas. |
| 3 | Probar rutas ajenas, sesión vencida y red intermitente. | Acceso denegado y no se retienen datos ajenos en pantalla. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R16 — Creador: licencias y Full permanente de Ignacio

**Plataforma:** Escritorio / navegador web · **Rol:** creador · **Taller:** Taller Ignacio confirmado · **Fase:** BLOQUEADO PARA OPERACIÓN REAL.

**Casos:** P30, P31. **Puertas exigidas antes de ejecutar en su fase:** G-AUTH, G-BACKUP, G-PLAN, G-RLS.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Cuando Ignacio tenga cuenta verificada, asignar plan Full permanente a su taller específico. | Concesión auditada, sin cobro, sin otorgar propiedad del software ni acceso cruzado. |
| 2 | Comprobar cupos Plus 4, Full 8, plazas adicionales y revocación autorizada. | Cobro de adicionales al titular, nunca mecánico; pagos no se habilitan en esta prueba. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R17 — Privacidad del piloto: consentimiento y control de tratamiento

**Plataforma:** Escritorio / navegador web · **Rol:** administrador · **Taller:** Taller piloto de pruebas · **Fase:** BLOQUEADO PARA OPERACIÓN REAL.

**Casos:** P05, P13, P22, P32. **Puertas exigidas antes de ejecutar en su fase:** G-AUTH, G-DATA, G-DOCS, G-PRIVACY.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Revisar con responsable el aviso, minimización y política de retención antes de cualquier dato real. | Tratamiento y acceso documentados; no adjuntar datos personales en capturas públicas. |
| 2 | Comprobar permisos de fotos y destinatarios de correos. | No hay difusión sin base/autorización ni envío silencioso. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

### R18 — Respaldo y recuperación íntegra sin tocar producción

**Plataforma:** Infraestructura aislada · **Rol:** administrador · **Taller:** Entorno aislado aprobado · **Fase:** BLOQUEADO PARA OPERACIÓN REAL.

**Casos:** P33, P37, P38. **Puertas exigidas antes de ejecutar en su fase:** G-BACKUP, G-RELEASE.

| Paso | Acción verificable | Resultado esperado |
|---:|---|---|
| 1 | Desde PC personal y repositorio privado realizar respaldo cifrado integral con checksum y lectura posterior. | Incluye base, Auth, políticas/roles, Storage, configuración necesaria; artefacto íntegro. |
| 2 | Restaurar la copia en entorno aislado, verificar integridad y acceso A/B. | Nunca restauración destructiva en Supabase alojado. |
| 3 | Ensayar despliegue/migración y plan de rollback verificando commit y flags. | Sin datos perdidos, sin activar pagos, correos ni público accidentalmente. |

Resultado: **SIN EJECUTAR EN ESTA ETAPA**. El verificador solo asegura trazabilidad y formato de este plan.

## Criterio de salida para piloto de Ignacio

Se necesita respaldo integral recuperable, permisos backend reales, migraciones y RLS autorizadas, privacidad/consentimiento resueltos, casos P0 ejecutados por rol/taller, PDF archivado íntegro, prueba física Safari/Android y decisión expresa del titular e Ignacio sobre el uso del taller. Ninguna evidencia simulada satisface por sí sola esos requisitos.

## Verificación sin red

```sh
node scripts/qa/verify-pilot-matrix.mjs --check
node scripts/qa/verify-pilot-journeys.mjs --check
cd apps/android && npm run test:contracts
```

El CI verifica solo consistencia de recorridos y regresiones Android sintéticas; NO ejecuta una prueba manual ni instala APK.
