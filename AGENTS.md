# ByteTorque — AGENTS.md

**Versión documental:** BT-UI-02-PREMIUM-WEB-FIRST / 2026-11-11  
**Producto y marca comercial oficial:** **ByteTorque** (proyecto técnico `biomotors-taller`, independiente de BIOMOTORS Academia). BIOMOTORS es el taller piloto, no la marca visible del SaaS.  
**Estado:** Inicio web/PWA con propuesta visual premium BT-UI-02 en `main`; Android Expo BT-UI-01 preservado; sin backend ni APK real; verificar CI/deploy por commit antes de declarar un cambio LIVE.

## 1. Misión y fuentes de verdad

Crear ByteTorque, una aplicación de gestión para talleres mecánicos con enfoque **SaaS multiempresa (multitenant)**. El primer taller piloto será el de Ignacio; el producto debe servir posteriormente a múltiples talleres suscritos, con aislamiento estricto de datos. Conservar todos los requerimientos de la nota de voz del 11/11/2026: inspección multipunto, presupuesto formal, correos al cliente, fichas de clientes y vehículos, historial técnico y observaciones pendientes.

**Prioridades inamovibles:** continuidad sin reconstrucciones innecesarias; seguridad y privacidad; facilidad de uso en iPhone y Android; costos iniciales contenidos; claridad para usuarios no técnicos.

## 2. Responsables acordados

- **Responsable técnico / desarrollo (usuario):** diseño del producto, implementación, código, GitHub, Supabase, despliegues, seguridad, pruebas, actualizaciones y mantenimiento técnico.
- **Responsable comercial (Ignacio):** usar el piloto como taller de referencia, contactar talleres, presentar el producto, captar clientes, recoger retroalimentación comercial y coordinar oportunidades de venta.
- **Decisiones conjuntas pendientes:** titularidad jurídica de software/marca, reparto de ingresos o utilidades, facturación, soporte al cliente, presupuesto de operación, política comercial y eventual estructura societaria. **No presumir porcentajes, cesiones ni asociaciones legales automáticas.**

## 3. Metodología de trabajo — usar la herramienta adecuada y ahorrar cuota

**Decisión confirmada por el responsable técnico el 11/11/2026.** Aplicable a todas las etapas:

1. **ChatGPT de este proyecto:** analizar, proponer, programar, actualizar archivos, verificar y documentar directamente siempre que tenga herramientas y permisos. Priorizar la ejecución real y evitar delegación innecesaria.
2. **ChatGPT en modo Alto:** usarlo cuando el trabajo exija razonamiento adicional o revisión profunda y el usuario así lo elija.
3. **Codex:** reservarlo para tareas grandes, refactorizaciones extensas, exploración de muchas rutas o problemas que no puedan resolverse fiablemente de forma directa; cada encargo debe estar acotado, con criterios de aceptación y referencia a checkpoint.
4. **Usuario:** intervenir exclusivamente en decisiones, revisión visual, permisos, configuraciones que requieran acceso personal y pruebas físicas (por ejemplo, iPhone de Ignacio).
5. **Cero trabajo repetido:** no rehacer lo que ya esté en main; leer el estado antes de cada cambio. No crear ramas paralelas, studios adicionales, ni gastos de cuota sin beneficio claro.
6. **Evidencias primero:** diferenciar archivos creados, build verificado, CI aprobado, web publicada y aplicación probada en dispositivo real; no confundir estas fases.
7. **Aprobar primero actividades sensibles:** sin cobros reales, correos externos, cambios irreversibles, secretos ni incorporación de datos personales hasta que el usuario lo autorice.

## 4. Reglas operativas del agente / Codex

1. Antes de modificar, leer `README.md`, `AGENTS.md`, `roadmap.md` y el último checkpoint.
2. No mezclar ni reutilizar tablas, proyectos, secretos o despliegues de **BIOMOTORS Academia**.
3. El backend previsto es el proyecto Supabase independiente `biomotors-taller`, cuya existencia se ha comunicado; verificar identidad/estado antes de conectarlo. Nunca colocar credenciales en repositorio ni mensajes.
4. Repositorio previsto: `Danielsanchezdesarrolador/biomotors-taller`. **Creado y verificado el 11/11/2026 durante BT-CP01.** Trabajar exclusivamente sobre `main`; no crear ramas, forks, otros sitios o entornos sin autorización.
5. Preferir incrementos pequeños, verificables, reversibles, con commits identificables, pruebas y reporte de cambios.
6. No activar cobros reales, envíos masivos de correo, migraciones destructivas ni datos de clientes reales sin autorización explícita y controles probados.
7. Toda tabla con datos de taller debe tener `workshop_id`/`tenant_id`, claves foráneas coherentes y **RLS comprobado con pruebas de acceso cruzado**. No depender de ocultar registros en frontend.
8. Claves administrativas o de servicio exclusivamente en backend seguro; jamás en la PWA, APK Android ni archivos públicos.
9. Preservar trazabilidad: qué pidió Ignacio, qué fue decidido, qué es hipótesis, qué está implementado y qué continúa pendiente.
10. **CORRECCIÓN DEFINITIVA 11/11/2026:** Android = APK NATIVA React Native + Expo + TypeScript, como Punto Fénix; NO PWA ni WebView. iPhone/iOS = SOLO PWA desde Safari agregada a pantalla de inicio; NO app nativa iOS, Apple Developer ni App Store. Web PC = acceso vía navegador al mismo frontend de iOS PWA.
11. **Autorizada** la demo web en Render solo para navegador/iOS PWA; Android se implementará como cliente NATIVO en `apps/android/` en este repo.
12. Backend único Supabase `biomotors-taller` compartido por PWA iOS/web y APK Android, aislado por taller (RLS). Nunca incluir `service_role` en clientes.
13. No decir APK lista hasta generar, firmar e instalar un APK auténtico en un dispositivo Android; iconos y manifiesto PWA no sirven como prueba de APK.

## 4. Alcance funcional mínimo del piloto

- Identificación del taller y usuario autenticado.
- Registro de clientes y vehículos, incluyendo placa/patente y datos pertinentes.
- **Hoja de inspección multipunto** editable, con resultado, fecha, responsable y observaciones técnicas.
- **Presupuestos/cotizaciones** vinculados a clientes, vehículos y revisiones, exportables a PDF; números, ítems, precios y estados.
- Envío transaccional al correo del cliente de los documentos de revisión y presupuesto con registro de fecha y resultado de entrega.
- Historial cronológico por vehículo: diagnósticos, servicios, trabajos realizados, ítems pendientes y presupuestos.
- Observaciones de problemas no reparados que permanezcan visibles en visitas posteriores.
- Respaldo, exportación y políticas de retención; no depender de conversaciones de WhatsApp.

La hoja multipunto y el formato del presupuesto **deben contrastarse con las plantillas reales facilitadas por Ignacio** antes de considerarse versiones definitivas.

## 5. Diseño multiempresa desde la primera migración

Entidades sugeridas: `workshops`, `profiles`, `workshop_memberships`, `customers`, `vehicles`, `inspections`, `inspection_items`, `estimates`, `estimate_items`, `service_records`, `vehicle_observations`, `email_deliveries`, `subscriptions` y `audit_events`.

- Los datos de cada taller tienen propietario lógico único (`workshop_id`) y permisos derivados de membresías activas.
- Un mismo cliente o vehículo puede existir en distintos talleres sin fusionar historiales ni exponer información ajena.
- Roles previstos por taller: propietario y colaborador; roles adicionales se introducen según necesidades verificadas.
- Gestión administrativa de la plataforma separada y auditada; evitar accesos indiscriminados a datos privados.
- Probar operaciones directas sobre API/DB: lectura, escritura, modificación, eliminación y exportación, tanto autorizadas como denegadas.

## 6. Modelo de negocio — decisión estratégica

- **Meta:** comercializar ByteTorque a otros talleres mediante pago recurrente.
- **Precio objetivo inicial:** **US$5 mensuales por taller**; hipótesis comercial sujeta a costos, impuestos, comisiones y pruebas de mercado. No implementar como tarifa productiva ni prometer funciones ilimitadas todavía.
- **Adquisición:** Ignacio lidera contacto, demostraciones y venta; el usuario lidera evolución del producto.
- **Etapas:** taller piloto -> otros talleres piloto -> validar cobro y soporte -> lanzar suscripción -> ampliar cartera.
- **Indicadores:** talleres activos, usuarios por taller, presupuestos generados, correos enviados, retención, gastos por taller, incidentes y tasa de conversión.

## 7. Seguridad, legalidad y experiencia

- Cumplimiento aplicable de privacidad, protección de datos personales, consentimiento/información y derechos de acceso/exportación; revisar normativa chilena vigente antes del lanzamiento.
- Definir responsable de tratamiento, políticas de conservación, respaldo/restauración, borrado y recuperación de cuentas.
- Presupuestos PDF no equivalen automáticamente a facturas o documentos tributarios electrónicos.
- Correos transaccionales con dominio verificado, autorización, límites de envío, manejo de errores y bitácora; sin hacer marketing no solicitado.
- Diseño móvil sencillo: botones grandes, formularios breves, estados claros, guardado fiable y accesibilidad.

## 8. Definición de terminado por funcionalidad

Cada entrega debe incluir: requerimiento, diseño de permisos, migración reversible si aplica, prueba unitaria/integración, prueba de RLS multitenant, prueba móvil Safari cuando corresponda, evidencia de ejecución, actualización de roadmap y checkpoint con riesgos/pedientes.

**Próxima etapa:** completar BT-CP01 verificando CI/build, publicación demo y conexión segura del proyecto Supabase independiente. La interfaz actual es demostrativa; no guarda información.
## Corrección de arquitectura oficial

La descripción anterior «PWA para Android e iOS» fue revocada por el usuario. Fuente vigente: `docs/ARQUITECTURA_PLATAFORMAS.md` y checkpoint BT-CP01-PLATAFORMAS. Conservar historia anterior, una rama `main` y el repositorio independiente de BIOMOTORS Academia.

## Identidad visual y nomenclatura — decisión 11/11/2026

- **Nombre visible de la aplicación:** `ByteTorque`, escrito exactamente así, sin espacio.
- **Marca de presentación:** ByteTorque. No usar «BIOMOTORS TALLER» en títulos, menús, onboarding, emails de la aplicación, iconos nombrados ni entregables nuevos.
- **Taller piloto:** BIOMOTORS, propiedad de Ignacio; mostrar BIOMOTORS solo como nombre del taller activo cuando corresponda, y no simular propietarios ni clientes reales.
- **Identificadores técnicos heredados:** conservar `biomotors-taller` en GitHub, Supabase y URL de Render, salvo autorización separada de migración, para evitar romper las integraciones.
- **Director de Arte:** adaptar los cinco paneles y el flujo de registro de clientes a ByteTorque; los mockups antiguos de BIOMOTORS TALLER son referentes de diseño, no marca final. Logo e iconos de marca quedan pendientes de aprobación.
- **Control comercial:** disponibilidad registral, dominios y posible marca registrada todavía no verificados; no afirmar exclusividad.

## BT-UI-01 — Inicio visual dual (aprobación 11/11/2026)

- Los dos clientes usan los mockups del usuario como referencia visual, con identidad visible **ByteTorque**, estética azul marino, blanco, azul intenso, indicadores y tarjetas.
- Web / iOS Safari PWA: frontend React/Vite en raíz; Android **nativa**: React Native + Expo en `apps/android/`.
- Cinco destinos: Inicio, Órdenes de trabajo, Clientes y vehículos, Informes y cotizaciones, Configuración. No añadir secciones extras al menú principal sin nueva decisión.
- Mostrar claramente modo DEMO cuando se utilicen datos inventados (cifras, vehículos, órdenes). Ningún botón de crear debe fingir persistencia, emisión o envío; navegar a módulo o advertir que está pendiente.
- Cada entrega de UI debe comprobar TypeScript y pruebas en CI, y verificar estado de Render; APK real solo cuando se haya generado/firmado y probado en dispositivo.
- Icono y logotipo definitivos aún pendientes del Director de Arte, no introducir símbolos o activos comerciales ajenos como logo final.

## Decisión BT-UI-02 — desarrollar y aprobar desde Render antes de APK Android

1. **Render web = plataforma principal de desarrollo y revisión**, trabajando solo en `main`, con despliegue automático de cambios aprobados a la demo de ByteTorque. Mantener **un solo sitio** y los mismos identificadores de infraestructura.
2. El diseño **premium del Inicio compartido por el usuario el 11/11/2026** es referencia candidata; se aplica primero a la web/PWA iOS, manteniendo una hoja de estilos separada `src/premium.css` y el CSS anterior, para facilitar reversión. Solo si se aprueba visualmente será base de los otros cuatro paneles.
3. **Android debe seguir siendo nativo** React Native + Expo. El cliente de `apps/android/` queda preservado temporalmente en BT-UI-01; su estética se actualizará **después** de consolidar flujos web y antes de crear APK. No usar WebView/PWA como atajo ni afirmar que compartir React DOM equivale a compartir interfaces nativas.
4. Diseñar contratos de datos, validaciones y lógica reutilizables en la medida de lo posible para evitar duplicar errores; para ambos clientes, un único Supabase con Auth y RLS multitenant. No habilitar datos personales, correos, pagos ni cuenta real sin seguridad y aprobación.
5. **No construir ni firmar APK ahora.** Al cierre del trabajo web, portar las pantallas aprobadas, verificar compilación nativa, generar APK firmado, probar en Android real y documentar resultados.
6. No confundir **código creado**, **GitHub CI PASS**, **Render LIVE**, **aprobación visual** ni **APK física probada**. Registrar evidencia individual para cada estado.
