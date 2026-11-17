# ByteTorque — AGENTS.md

**Versión documental:** BT-UI-02-R2-OFICIAL / 2026-11-11  
**Producto y marca comercial oficial:** **ByteTorque** (proyecto técnico `biomotors-taller`, independiente de BIOMOTORS Academia). BIOMOTORS es el taller piloto, no la marca visible del SaaS.  
**Identidad gráfica vigente:** BT-BRAND-01 aprobada por el Director el 14/11/2026; originales definitivos en `assets/brand/originals/`, contrato y hashes en `assets/brand/README.md` y `assets/brand/manifest.json`. Usar estos archivos, sin reinterpretar ni dibujar sustitutos.

**Estado:** Inicio **BT-UI-02-R2 aprobado visualmente como sistema premium OFICIAL** por el Director el 11/11/2026; Android Expo BT-UI-01 preservado; sin backend ni APK real. Próximo panel: Órdenes de trabajo BT-UI-03.


## Regla permanente — dominio web oficial (17/11/2026)

- **Dirección canónica definitiva elegida por el Director:** `https://bytetorque.cl` (raíz, sin `www`). Todos los nuevos enlaces dirigidos a clientes, manuales, textos de marca y futuras comunicaciones deben priorizar esta dirección; `www.bytetorque.cl` será alias con redirección a la raíz una vez configurado.
- `https://biomotors-taller-demo.onrender.com` es **solo la dirección técnica del mismo servicio** `srv-dbqe4quc6qcc73f275jg`, no el dominio comercial ni un segundo sitio. **No crear otro Render** para realizar el cambio; mantener `main`.
- **Historial real confirmado:** el 16/11/2026 se configuraron en NIC Chile los nameservers de Cloudflare `hugh.ns.cloudflare.com` y `margaret.ns.cloudflare.com`; CNAME `@` y `www` a `biomotors-taller-demo.onrender.com` en modo **DNS only**; Render mostró ambos dominios **Verified**, certificados HTTPS **Issued** y la aplicación cargó en `https://bytetorque.cl` (incluidas rutas de acceso y registro). Supabase Auth ya tenía **Site URL** `https://bytetorque.cl` y redirección de confirmación `https://bytetorque.cl/#/auth/confirmacion`. **No reconfigurar DNS/Custom Domains/Auth desde cero**. El 17/11/2026 el Director mostró `ERR_CONNECTION_CLOSED`: diagnosticar como **regresión de conectividad posterior a configuración previamente funcional**, no como puesta en marcha pendiente. La disponibilidad de hoy sigue sin verificarse; conservar acceso técnico de contingencia.
- **Diagnóstico de la regresión:** primero comparar acceso desde red Wi-Fi y datos móviles, consultar estado Custom Domains/certificados en Render y DNS Cloudflare, y contrastar con URL técnica; verificar configuración existente antes de cambiarla. Supabase Auth ya se configuró para el dominio el 16/11: **no cambiar Site URL, Redirect URLs ni flujos de correo sin un diagnóstico y autorización concretos**. Evitar cortes de sesión y enlaces rotos.
- El dominio debe mantenerse registrado y renovarse a tiempo: la decisión de usarlo indefinidamente no garantiza su disponibilidad si vence el registro o falla DNS.

## 1. Misión y fuentes de verdad

Crear ByteTorque, una aplicación de gestión para talleres mecánicos con enfoque **SaaS multiempresa (multitenant)**. El primer taller piloto será el de Ignacio; el producto debe servir posteriormente a múltiples talleres suscritos, con aislamiento estricto de datos. Conservar todos los requerimientos de la nota de voz del 11/11/2026: inspección multipunto, presupuesto formal, correos al cliente, fichas de clientes y vehículos, historial técnico y observaciones pendientes.

**Prioridades inamovibles:** **primero funcionamiento integral y piloto real aprobado por Ignacio** (decisión del Director, 15/11/2026); continuidad sin reconstrucciones innecesarias; seguridad y privacidad; facilidad de uso en iPhone y Android; costos iniciales contenidos; claridad para usuarios no técnicos. La arquitectura multitenant sigue desde el inicio para aislar datos, pero la incorporación de terceros, cobros, suscripciones y escalamiento (CP07–CP09) **no se implementarán hasta terminar y aprobar el piloto de Ignacio**. Priorizar los flujos persistentes CP03–CP06 después de cerrar solo las puertas de Auth necesarias. Consultar definición de terminado y bloqueos en `roadmap.md`.

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

## 3B. Entregas funcionales completas — decisión del Director (15/11/2026)

Para CP03–CP06 usar el [método de entregas del piloto](docs/BT_PILOTO_IGNACIO_METODO_ENTREGAS.md): **definir una función utilizables por Ignacio → integrar código existente → una ronda final de pruebas de función y seguridad → validar con autorización en backend real/iPhone → checkpoint y siguiente función**. Evitar subetapas de validación redundantes si no corrigen un fallo o desbloquean la operación. No sustituir pruebas reales por mocks ni saltarse RLS, seguridad o autorizaciones. **Sin permiso para migraciones, proveedores o datos personales, no desplegar** y no declarar capacidad completa.

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
- **Planes comerciales aprobados para diseño (11/11/2026):** Básico **gratis sin publicidad durante lanzamiento**; Plus **USD 5/mes por taller**; Full **USD 15/mes por taller**. Prueba Full **3 días (72 h) con método de pago**. El propietario puede **desactivar renovación automática desde Configuración**, incluso inmediatamente al activar; si el servidor/proveedor confirma antes del vencimiento, no se intenta cobrar y conserva Full hasta fin de prueba, luego Básico sin perder datos. Más detalles: docs/PLANES_COMERCIALES_BT_PLAN_01.md. Sin cobros reales todavía.
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
2. **APROBADO** el 11/11/2026: el Inicio **BT-UI-02-R2** define la identidad visual **OFICIAL** para los cinco paneles. Mantener `src/premium.css` y `src/styles.css` y reproducir idéntica calidad en las demás pantallas, sin modificar el Inicio aprobado. Contrato oficial en `docs/SISTEMA_VISUAL_OFICIAL_R2.md`.
3. **Android debe seguir siendo nativo** React Native + Expo. El cliente de `apps/android/` queda preservado temporalmente en BT-UI-01; su estética se actualizará **después** de consolidar flujos web y antes de crear APK. No usar WebView/PWA como atajo ni afirmar que compartir React DOM equivale a compartir interfaces nativas.
4. Diseñar contratos de datos, validaciones y lógica reutilizables en la medida de lo posible para evitar duplicar errores; para ambos clientes, un único Supabase con Auth y RLS multitenant. No habilitar datos personales, correos, pagos ni cuenta real sin seguridad y aprobación.
5. **No construir ni firmar APK ahora.** Al cierre del trabajo web, portar las pantallas aprobadas, verificar compilación nativa, generar APK firmado, probar en Android real y documentar resultados.
6. No confundir **código creado**, **GitHub CI PASS**, **Render LIVE**, **aprobación visual** ni **APK física probada**. Registrar evidencia individual para cada estado.

## Orden vinculante — Sistema visual OFICIAL R2

El Director aprobó expresamente BT-UI-02-R2. Todo diseño nuevo (incluido BT-UI-03 Órdenes de trabajo) debe basarse en `docs/SISTEMA_VISUAL_OFICIAL_R2.md` y no alterar ni sustituir la identidad ni el Inicio existente. No se permite introducir paletas, menús, topbars, estilos de tarjeta, tipografías o iconos discordantes. La identidad premium debe mantenerse en escritorio, Safari/iPhone PWA y finalmente Android nativo. La fidelidad visual debe comprobarse con capturas lado a lado. No confundir la aprobación visual del Inicio con autorización de backend real o APK.

## Requisito nuevo del Director — formulario de registro mediante enlace (11/11/2026)

Al abrir un enlace individual, el cliente completará sus datos personales **y también los de su vehículo** (marca, modelo, año, kilometraje; patente opcional) y el **motivo breve de la visita o el trabajo solicitado**. El envío definitivo deberá crear una solicitud pendiente de revisión vinculada al taller, no finalizar una OT automáticamente. Ignacio podrá convertirla en orden reutilizando los datos, sin transcribirlos. Enlaces seguros, datos mínimos, consentimientos, permisos/RLS y controles antiabuso obligatorios al implementar backend. Contrato: `docs/BT_REGISTRO_CLIENTE_VEHICULO_VISITA.md`.

**Separación de alcance:** mientras Codex implementa BT-UI-05 Informes y cotizaciones, registrar este requerimiento solo en documentación; **no alterar en paralelo formularios React, componentes R2, Supabase, Render ni Android**.

## Obligación BT-PLAN-01 — prueba Full y control de renovación

Básico gratis sin anuncios en lanzamiento; Plus USD 5/mes; Full USD 15/mes por taller. Trial Full 72 horas con método de pago, USD 0 inicial y consentimiento explícito al futuro cargo. Mostrar cancelación de renovación en Configuración desde primer minuto; cancelada a tiempo y confirmada en pasarela implica **cero intento de cobro**. Acceso Full hasta vencer y paso a Básico sin borrar historial. No almacenar tarjetas ni habilitar suscripciones sin aprobación, backend multitenant, idempotencia y prueba de no-cobro. Cuotas y publicidad posterior no aprobadas.

## Puerta BT-CP02-D — onboarding controlado (12/11/2026)

La función `bootstrap_workshop_owner` es SECURITY INVOKER y ejecutable únicamente por `service_role`. El endpoint Supabase Edge `bt-owner-onboarding` usa `verify_jwt=true`, comprueba el correo verificado por Auth y **permanece desactivado por defecto mediante `BYTETORQUE_ONBOARDING_ENABLED`**. No abrirlo ni conectar login público hasta aprobar pruebas A/B y límites de abuso. Checkpoint: `docs/checkpoints/CHECKPOINT_BT_CP02_D_20261112.md`.

## BT-PLAN-02 — Regla de plantillas de informe por plan (13/11/2026)

**Básico** usa exclusivamente **plantillas de informe oficiales predeterminadas**; no admite subir archivos propios. **Plus y Full** podrán subir y administrar **sus formatos propios de informes**, por taller, cuando la infraestructura real esté aprobada. Durante la prueba Full de 72 horas aplica el permiso temporal de Full; tras bajada a Básico, conservar consulta/exportación histórica y bloquear nuevas operaciones con formatos premium sin borrar archivos. Importar un PDF/Word/Excel **no lo hace editable o interactivo automáticamente**: requiere mapeo y validación explícita. Control en backend por suscripción, RLS y Storage privado por taller, no en estado React. Especificación: `docs/PLANES_COMERCIALES_BT_PLAN_01.md`. **BT-INS-01 de Codex no cambia por esta anotación**; no tocar UI, Supabase ni almacenamiento en paralelo.

## Regla permanente — evolución gradual de planes BT-PLAN-IDEAS-01 (13/11/2026)

El Director irá proponiendo nuevas funciones de **Básico, Plus y Full** a lo largo del desarrollo. Cada idea debe agregarse al **registro maestro `docs/REGISTRO_IDEAS_PLANES.md`**, con ID consecutivo `BT-IDEA-NNN`, fecha, descripción, plan, estado de aprobación, estado técnico y dependencia/coste si aplica. No borrar ni reemplazar decisiones históricas sin referencia de cambio. **Aprobada para diseño ≠ implementada o vendible**; propuestas no confirmadas van como **Por evaluar**. En la revisión final previa al lanzamiento recuperar y revisar todas las ideas registradas y obtener aprobación de matriz final del Director. La simple anotación NO autoriza ejecución de código, gastos, cobros, cambios de Supabase, publicidad posterior al lanzamiento ni intervención en BT-INS-01 mientras Codex trabaja.

## Instrucción vigente de transición — BT-OFICIAL-01 (14/11/2026)

El Director aprobó BT-QA-02 y solicitó iniciar la versión oficial ByteTorque, **sin nombres DEMO ni registros ficticios visibles en el sitio**. Leer `docs/BT_OFICIAL_01_TRANSICION_PRODUCTO.md` antes de modificar. Este es un **cambio de presentación/preparación** y no habilita aún clientes reales, identidades verificadas ni guardado permanente.

La UI pública debe iniciar vacía y sin cifras inventadas. Mantener los fixtures exclusivamente para tests aislados, sin activación pública ni inclusión en el bundle oficial. Sin backend aprobado, las acciones que aparenten ingresar/guardar información real deben quedar deshabilitadas con mensaje veraz, no solo perder la palabra «DEMO». Conservar cinco paneles R2, flujo A–E y lógica de revisiones/documentos para su reconexión posterior. Mantener `main`/Render existente hasta decisión separada. Pruebas BT-CP02-D y credenciales reservadas al otro chat; no tocar Supabase/Auth/RLS/onboarding/planes/correo/pagos en 01A. Ver roadmap y checkpoint QA-02.


## Decisión vinculante de cupos BT-PLAN-03 (14/11/2026)

El Director aprueba cupos de mecánicos **por taller**: **Básico hasta 2**, **Plus hasta 8**, **Full hasta 8**, con acceso a mecánicos gestionado desde `Configuración → Usuarios y permisos`. El administrador del taller puede invitar/desactivar únicamente **mecánicos de su taller**; no concederse ni conceder roles administrativos, modificar dueño, manejar cuentas de otros talleres o alterar planes. Propietario/administrador no ocupan cupos de mecánico; los límites de otros roles no están fijados. En la prueba Full vigente se aplica el cupo Full. Los cupos deberán validarse desde backend con conteo seguro y reservas para invitaciones pendientes, no por React. No habilitar invitaciones ni Auth real hasta BT-CP02-D aprobado en su chat reservado; BT-AUTH-01A solo UI sin efectos reales. Ver `docs/PLANES_COMERCIALES_BT_PLAN_01.md`, `docs/REGISTRO_IDEAS_PLANES.md`, `docs/BT_AUTH_01_LOGIN_ROLES_CORREO.md` y `docs/MATRIZ_ROLES_Y_PERMISOS.md`.


## Identidad gráfica definitiva — BT-BRAND-01 (14/11/2026)

El Director aprobó `bytetorque_icono_oficial_original.png` y `bytetorque_logo_horizontal_oficial_original.png`, conservados sin modificar en `assets/brand/originals/`. Esta aprobación sustituye las referencias anteriores a logos provisionales/pendientes; no equivale a registro legal de marca. **Nunca rediseñar, recolorear, deformar ni sustituir estos recursos por llaves, iniciales o dibujos procedurales.** Mantener los iconos funcionales de herramientas y navegación.

Usar `src/brand/BrandLogo.tsx`: horizontal original para superficies claras y `surface="dark"` con derivado de texto claro para fondos navy; sin tarjetas, fondos, padding, bordes ni sombras detrás del logo. Icono en espacios pequeños. La identidad comercial del taller y sus logos son independientes; los documentos llevan únicamente atribución discreta «Software ByteTorque», sin asignar BIOMOTORS a talleres nuevos. El generador Node publica derivados oficiales versionados y valida los hashes de todos los originales/derivados; nunca restaurar el generador provisional. Regeneración excepcional con `scripts/prepare-brand-assets.py`, sin sobrescribir originales, y nueva aprobación para cambiar el arte.

Preservar PWA `id`, `start_url`, `scope`, entrada R1 y seguridad. Maskable/adaptativo deben conservar el arte dentro de la zona segura, sin cortes. Los recursos Expo están preparados; no afirmar APK creada, app instalada ni paridad funcional Android. Sin cambios de Auth/RLS, backend, planes, datos o correos por integrar la marca. [Checkpoint BT-BRAND-01](docs/checkpoints/CHECKPOINT_BT_BRAND_01_20261114.md).


## BT-BRAND-02 — integración transparente (14/11/2026)

Por orden del Director, retirar el soporte blanco de BT-BRAND-01 en encabezados oscuros. Usar `BrandLogo surface="dark"` sobre navy, `surface="light"` para el original en superficies claras. No aplicar filtros CSS de inversión ni recolorear el símbolo. El derivado solo aclara los píxeles de texto «Byte» y «Gestión de Talleres»; el alfa y símbolo del PNG original se mantienen idénticos. Fuente y comprobaciones: `assets/brand/dark-variant.json`, `scripts/verify-dark-brand.py`. No modificar los originales, iconos PWA/favicon/adaptativos, identidad del taller ni A4 por este ajuste. Logo sin contenedores decorativos y sin desborde en tablet/móvil. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_BRAND_02_20261114.md). Pendiente aprobación visual del resultado por el Director; no habilita Auth/backend.


## BT-AUTH-01B-R1 — integración autorizada, activación apagada (14/11/2026)

La orden vigente [BT-AUTH-01B-R1](docs/BT_AUTH_01B_R1_ORDEN_IMPLEMENTACION.md), posterior al cierre A/B, autoriza exclusivamente login por contraseña, recuperación/validación de sesiones, logout y lecturas RLS de membresías/talleres con Supabase JS. Flag `VITE_BT_AUTH_R1_ENABLED` apagado por defecto; solo URL del proyecto `suxcqqnmcjoezfxltoms` y clave publishable. `getUser`, correo confirmado y membresía activa son obligatorios; no confiar en selector, metadata, URL ni permisos guardados. Owner/admin ven paneles vacíos; mechanic solo espacio técnico vacío; reception restringido. Rutas públicas de revisión explícitamente DEMO sin autoridad privada.

No modificar SQL/RLS, Edge, onboarding, registro, correo, invitaciones, pagos ni Android. No activar Auth al público ni iniciar R2 sin revisión del Director. Pruebas automatizadas R1 con mocks no sustituyen pruebas con cuentas reales. Configuración y pendientes: [guía Render](docs/BT_AUTH_01B_R1_CONFIGURACION_RENDER.md).
