# ByteTorque — ROADMAP OFICIAL

**Edición:** v1.8 — Identidad premium R2 OFICIAL + BT-UI-03 Órdenes  
**Fecha:** 2026-11-11  
**Checkpoint de continuidad:** BT-UI-02-R2-APROBACION-20261111  
**Proyecto distinto de:** BIOMOTORS Academia.

## Marca comercial y denominaciones — decisión 11/11/2026

- [x] **Marca oficial del producto SaaS:** **ByteTorque**.
- [x] Distinguir la marca **ByteTorque** de **BIOMOTORS**, primer taller piloto de Ignacio.
- [x] Mantener identificadores técnicos existentes `biomotors-taller` (repositorio, proyecto Supabase y Render), sin renombrar servicios hasta planificar migración.
- [x] Actualizar nombre visible en web/PWA (título, encabezados, manifest).
- [ ] Desarrollar identidad visual/logotipo definitivo **ByteTorque**, basada en los cinco mockups aprobados (sidebar azul marino, blanco, acento azul).
- [x] Crear estructura Android nativa React Native/Expo e Inicio BT-UI-01 (sin APK firmada).
- [ ] Adaptar el sistema visual premium definitivo al Android nativo tras aprobar la experiencia web.
- [ ] Verificar disponibilidad de dominio y eventuales derechos de marca antes del lanzamiento comercial.
- [ ] Revisar y aprobar nomenclatura de PDFs, plantillas, correos y formularios de registro público cuando se implementen.

**Las referencias históricas a los nombres anteriores en checkpoints se conservan para trazabilidad. La marca vigente es exclusivamente ByteTorque.**

## Visión

Crear el sistema más simple y confiable posible para registrar el trabajo diario de un taller mecánico, desde la inspección del vehículo hasta el presupuesto y el historial de reparaciones, y convertirlo en una **plataforma de suscripción mensual para otros talleres**.

### Organización de trabajo

- **Usuario:** líder de desarrollo y operación técnica.
- **Ignacio:** líder comercial y primer usuario piloto.
- Precio objetivo por validar: **US$5 por taller/mes**. No equivale aún a tarifa aprobada para cobro real ni define porcentajes de utilidad.

## Distribución OFICIAL — corregida el 11/11/2026

**Android será una aplicación nativa React Native + Expo + TypeScript, distribuida inicialmente mediante APK firmada e instalable directamente, como PUNTO FÉNIX. NO será PWA ni un sitio web en WebView.**

**Únicamente iPhone/iOS utilizará PWA**, accesible desde Safari y agregable a pantalla de inicio. Sin aplicación iOS nativa, Apple Developer, TestFlight ni App Store en esta etapa.

**La versión web de escritorio seguirá disponible por navegador** y utilizará el mismo frontend React + Vite que la PWA de iOS.

| Plataforma | Producto | Tecnología y entrega |
| --- | --- | --- |
| Android | APK nativa | React Native + Expo, archivo APK para instalación directa |
| iPhone/iOS | PWA Safari | React + TypeScript + Vite; Safari → Agregar a pantalla de inicio |
| Computador | Web | Mismo frontend web que la PWA iOS, mediante HTTPS |

### Arquitectura conjunta

- Conservar frontend web/iOS PWA existente en la raíz del repositorio y su demo en Render.
- Conservar la aplicación Android nativa ya creada en `apps/android/` dentro del mismo repositorio privado, trabajando solo sobre `main`.
- Utilizar un ÚNICO backend Supabase `biomotors-taller`, con Auth, tablas, Storage y RLS por `workshop_id`; misma información autorizada en ambos clientes.
- Los componentes React DOM NO se compartirán directamente con React Native; compartir tipos, validaciones y acceso a API cuando sea viable.
- Generar una APK real de prueba usando firma y perfil EAS `android.buildType: "apk"` o un método nativo equivalente; verificar en teléfono Android real.
- La PWA iOS debe probarse desde Safari en iPhone real; no dar por verificada la instalación solo por un manifiesto web.
- Google Play Store y desarrollo iOS nativo quedan para decisiones futuras, sin gastos ni publicaciones autorizados por ahora.
- Mantener sin activar clientes reales, pagos, correos externos o migraciones irreversibles hasta asegurar permisos y recibir autorización.

### Secuencia inmediata

1. Preservar la demo web/iOS publicada en Render.
2. Completar y aprobar cada pantalla primero en la web publicada en Render, compartida con Safari iPhone PWA.
3. Preparar un backend común Supabase seguro por taller, validando la experiencia web y los contratos de API.
4. Una vez aprobadas las funciones y el diseño web, adaptar y verificar el cliente Android nativo React Native/Expo existente.
5. Como última etapa antes del piloto Android, generar una APK firmada, instalarla y probarla en teléfono Android real.
## Requerimientos de Ignacio — conservados

| Código | Capacidad | Prioridad |
|---|---|---|
| BT-R01 | Ficha de revisión/inspección multipunto | P0 |
| BT-R02 | Presupuesto o cotización formal | P0 |
| BT-R03 | Enviar revisión y presupuesto al correo del cliente | P0 |
| BT-R04 | Ficha de cliente y vehículo | P0 |
| BT-R05 | Historial de mantenciones, reparaciones y diagnósticos | P0 |
| BT-R06 | Observaciones sobre fallas no reparadas | P0 |
| BT-R07 | Recuperación de antecedentes en futuras visitas | P0 |
| BT-R08 | Persistencia y respaldo sin depender de memoria o WhatsApp | P0 |
| BT-R09 | Interfaz simple y utilizable en iPhone | P0 |
| BT-R10 | Cuentas separadas y datos aislados por taller (SaaS) | P0 arquitectónico |
| BT-R11 | Alta y gestión de suscripción por taller | P1 comercial |
| BT-R12 | Métricas, seguimiento comercial y soporte | P1 comercial |

## Fases y criterios de aceptación

### BT-CP00 — Definición y planificación — DOCUMENTAL

- [x] Registrar la necesidad principal a partir del audio de Ignacio.
- [x] Definir aplicación independiente de BIOMOTORS Academia.
- [x] Confirmar Android APK nativa + iOS PWA Safari + web; la decisión anterior PWA para Android queda revocada (11/11/2026).
- [x] Registrar que existe un proyecto Supabase independiente denominado `biomotors-taller` según información del usuario (sin afirmar conexión funcional).
- [x] Incorporar meta SaaS multiempresa y roles comercial/técnico.
- [x] Fijar US$5/taller/mes como **precio de referencia, aún no validado**.
- [ ] Recibir o verificar las hojas originales de inspección multipunto y presupuesto para modelarlas exactamente.

### BT-CP01 — Repositorio, fundamentos y entorno — EN DESARROLLO

- [x] Crear y verificar el repositorio privado `Danielsanchezdesarrolador/biomotors-taller` (11/11/2026).
- [x] Instalar este kit documental, con checkpoint BT-CP01 (11/11/2026).
- [x] Incorporar React + TypeScript + Vite, pantalla principal adaptable, navegación y manifiesto web (interfaz demostrativa en `main`, 11/11/2026).
- [ ] Instalar y probar la PWA SOLO en Safari de iPhone; revisar iconos, navegación, tamaños y actualización.
- [x] Crear estructura Android React Native + Expo SDK 57 en `apps/android/`, con Inicio nativo y perfil APK EAS `preview` (11/11/2026). **Firma y APK real pendientes**.
- [ ] Generar primera APK firmada de prueba y verificarla en Android real.
- [ ] Verificar acceso web por URL en escritorio y compatibilidad mínima de navegadores.
- [x] Publicar la demo inicial por Render Static Site, independiente, HTTPS, sin datos reales: https://biomotors-taller-demo.onrender.com — primer deploy `live` confirmado 11/11/2026.
- [x] Generar iconos PNG y manifiesto WEB/iOS PWA, verificar build + Render `live` (deploy `dep-dbqe6ihsrm7s738dnptg`, CI `43106669748` PASS); esto NO constituye una APK Android.
- [ ] Probar PWA Safari con Ignacio en iPhone y APK nativa con un usuario Android; ambas pruebas físicas pendientes.
- [ ] Configurar variables de entorno con secretos exclusivamente fuera de Git.
- [ ] Conectar el proyecto Supabase independiente con la menor cantidad de permisos necesaria.
- [x] Incorporar estructura de pruebas y CI GitHub Actions; ejecuciones verificadas en GitHub el 11/11/2026.
- [x] Confirmar que TypeScript, 3 tests y build aprueban en GitHub Actions: run #43105084982 y run #43105329020, ambas PASS (11/11/2026).

**Salida:** repositorio accesible, aplicación base demostrable, variables seguras y build/test pasando.

### BT-UI-01 — Panel Inicio en web/iOS PWA y Android APK nativa — IMPLEMENTACIÓN DE INTERFAZ

**Referencia visual aprobada:** capturas de diseño escritorio + móviles entregadas por el usuario el 11/11/2026.

- [x] **Web / iOS PWA:** implementar Inicio en React + TypeScript con barra lateral azul marino, cabecera, saludo, 4 métricas, gráfico circular de estado, órdenes recientes, actividad y accesos rápidos.
- [x] **Web / móvil:** tarjetas 2×2, navegación inferior de 5 secciones, búsqueda de órdenes ficticias, filtrado por estados y avisos claros de modo demostración.
- [x] **Android Nativo:** crear UI React Native + Expo desde cero dentro de `apps/android/`, sin WebView; encabezado oscuro, 4 métricas, estados de órdenes, búsqueda, actividad, órdenes y accesos rápidos.
- [x] **Android:** menú y navegación inferior hacia las cinco secciones: Inicio, Órdenes de trabajo, Clientes y vehículos, Informes y cotizaciones, Configuración. Las otras cuatro mantienen pantallas informativas preparatorias.
- [x] Mantener el producto denominado **ByteTorque**, mostrando BIOMOTORS solo como eventual taller piloto, nunca como marca de SaaS.
- [x] Usar únicamente **datos ficticios DEMO** y funciones sin persistencia ni envío de correos.
- [x] Confirmar CI web (7 tests PASS, TypeScript y build PWA), Expo Android (TypeScript, compatibilidad de versiones, bundle Metro y configuración): GitHub Actions #43113368311 PASS (11/11/2026).
- [ ] Verificar visualmente web de escritorio, Safari iPhone y Android real.
- [ ] Generar **APK firmada instalable**, validar permisos/identificador y prueba real en dispositivo.
- [ ] Sustituir datos de muestra por agregados de Supabase cuando existan autenticación segura, tenant y RLS.

**Frontera:** Inicio implementado visualmente, no operación de taller habilitada; sin backend ni APK real en esta fase.

### BT-UI-02 — Inicio PREMIUM en Render, identidad visual OFICIAL — APROBADO

**Referencia:** nuevo mockup premium de ByteTorque compartido por el usuario el 11/11/2026. Esta etapa no convierte automáticamente el sitio en una app nativa.

- [x] Implementar en la web un rediseño del **Inicio** con sidebar azul marino por capas, búsqueda con atajo real Ctrl/Cmd+K, cabecera automotriz vectorial tenue, tarjetas KPI horizontales con detalles, gráfico de dona, listas, etiquetas de estados, actividad y accesos rápidos.
- [x] Mantener **datos ficticios DEMO**, cinco destinos y sin falsas confirmaciones de guardado, emails o cobros.
- [x] Implementar diseño candidato **reversible** en `src/premium.css`, importado después del CSS BT-UI-01 original.
- [x] Conservar cliente Android React Native + Expo BT-UI-01 sin reconstrucciones ni publicar APK en esta etapa.
- [x] Establecer flujo **WEB primero**: revisión en el mismo Render, luego ampliar los paneles web y al final portar la experiencia aprobada a React Native/Expo y compilar APK.
- [x] Confirmar CI del rediseño premium: GitHub Actions **#43115723650 SUCCESS** (web/iOS y Android code); Render deploy **`dep-dbqf4l2jnfac73bf3sb0` LIVE** sobre commit `39b00cfa`.
- [x] **Aprobación visual expresa del Director el 11/11/2026**: R2 queda como identidad premium oficial para los cinco paneles. La prueba física Safari iPhone continúa pendiente.
- [ ] Completar las otras cuatro pantallas con el estilo premium aprobado, considerando acceso público de registro de clientes, seguridad, accesibilidad y responsive.
- [ ] Adaptar las pantallas premium a Android **nativo**, generar APK firmado y realizar QA real (etapa final, aún no realizada).

**Regla:** ningún trabajo web implica que Android esté finalizado; usar `apps/android/` como proyecto nativo existente, con backend único Supabase y sin WebView.

### BT-CP02 — Identidad, talleres y aislamiento — AUDITORÍA DOCUMENTAL INICIADA

**Auditoría de solo lectura del 11/11/2026:** [Plan de arquitectura y seguridad](docs/BT_CP02_ARQUITECTURA_AUTH_RLS.md) · [Checkpoint de auditoría](docs/checkpoints/CHECKPOINT_BT_CP02_AUDITORIA_20261111.md).

- [x] Inspeccionar frontend web y diseño de configuración: actualmente datos DEMO, `supabase-js` no instalado, guardas locales que no representan seguridad real.
- [x] Revisar documentación Supabase vigente y diseñar esquema preliminar de `workshops`, membresías, roles, Auth, RLS y pruebas de acceso cruzado.
- [x] Resolver conexión con Supabase correcta: se confirmó el proyecto **`biomotors-taller`**, ID `suxcqqnmcjoezfxltoms`, `ACTIVE_HEALTHY` (São Paulo); sin tocar Punto Fénix.
- [x] **BT-CP02-B inventario de solo lectura completado**: 0 tablas propias en `public`; 0 usuarios Auth; 0 migraciones del proyecto; 0 buckets/archivos en Storage; 0 Edge Functions. Advisors de salud y rendimiento: sin alertas.
- [x] **Dos advertencias de seguridad del mismo origen**: función `public.rls_auto_enable()`, `SECURITY DEFINER` invocable por `anon` y `authenticated`; está asociada al event trigger `ensure_rls`. Revisión y corrección de privilegios pendiente **antes de migraciones**, sin ejecutar SQL de escritura en esta auditoría.
- [x] Confirmar commit visual de Órdenes `3258858` en la historia de `main` y en el archivo actual; Render está `LIVE` sobre commit documental descendiente sin revertir los dos archivos corregidos.
- [x] **BT-CP02-C borrador listo:** SQL candidato, tablas `workshops`, `profiles`, `workshop_memberships`, permisos mínimos, políticas RLS y revisión del helper `rls_auto_enable` (sin modificar Supabase).
- [x] Preparar controles de catálogo y matriz de 16 casos para verificar usuarios/talleres A/B y evitar autoelevación.
- [ ] **Aprobar explícitamente la candidata** [SQL](docs/sql/BT_CP02_C_SCHEMA_CANDIDATE.sql) y [checkpoint](docs/checkpoints/CHECKPOINT_BT_CP02_C_BORRADOR_20261111.md) antes de aplicar migraciones. No se ha probado aún en PostgreSQL.
- [x] **Autorización y aplicación efectiva de BT-CP02-C, 12/11/2026:** Supabase registró las migraciones `20261112144646_bt_cp02_c_core_tenants_rls` y `20261112145011_bt_cp02_c_backend_service_grants`; tres tablas creadas, cuatro políticas RLS, permisos mínimos; Security Advisor **0 avisos**.
- [x] **Verificación SQL posterior:** sin datos ni usuarios, `ensure_rls` activo, `rls_auto_enable()` no ejecutable por `anon`/`authenticated`, `service_role` con grants administrables, navegador sin permisos de escritura para talleres o membresías.
- [x] **BT-CP02-D — AISLAMIENTO A/B APROBADO (14/11/2026):** 25/25 pruebas con dos usuarios reales de Supabase Auth de ensayo, dos talleres sintéticos y JWT independientes PASS, según ejecución en PowerShell supervisada por el Director. Incluye lectura cruzada denegada, prohibición de autoelevación y desactivación efectiva de membresía. Ver [checkpoint de cierre](docs/checkpoints/CHECKPOINT_BT_CP02_D_AB_PASS_20261114.md).
- [x] **BT-CP02-D backend (12/11/2026):** migración `20261112150019_bt_cp02_d_atomic_owner_onboarding` aplicada; Edge Function `bt-owner-onboarding` desplegada con JWT obligatorio, **desactivada por defecto** y con permisos solo de backend. 0 avisos de seguridad.
- [x] Código y checkpoint versionados: [BT-CP02-D](docs/checkpoints/CHECKPOINT_BT_CP02_D_20261112.md).
- [x] **Prevalidación estructural: 22/22 PASS** en PostgreSQL (RLS, GRANT, permisos públicos y funciones de alta).
- [x] **Suite A/B preparada**: 25 verificaciones con dos usuarios de Supabase Auth, JWT independientes, talleres ficticios y limpieza al terminar, `scripts/security/bt-cp02-ab.mjs`, con control de ejecución explícito. Validación de sintaxis incluida en CI, **sin ejecutar operaciones remotas desde CI**.
- [ ] **Ejecutar suite A/B con credenciales protegidas en equipo del operador**, porque el conector no ofrece Auth Admin y el contenedor no tiene acceso de red. No crear usuarios Auth con SQL. Ver `docs/BT_CP02_D_AB_RUNBOOK.md`.
- [ ] Confirmar resultados auténticos, ausencia de fixtures remanentes y 0 hallazgos en asesor Security antes de abrir registro público.
- [ ] Completar Auth web/PWA, rate limiting, verificación de emails y controles antiabuso, antes de abrir el registro. No introducir clientes reales hasta superar aislamiento.
- [ ] Aprobar propuesta de esquema y matriz de permisos antes de migraciones.


- [ ] Autenticación y recuperación de cuenta.
- [ ] Crear un taller y asociarle usuario(s) mediante membresías.
- [ ] Esquema multiempresa con `workshop_id`, relaciones y RLS por taller.
- [ ] Pruebas de acceso cruzado (un taller no puede ver ni modificar registros de otro).
- [ ] Alta de segundo taller ficticio para validar independencia.

**Salida:** dos talleres de pruebas usan el mismo producto sin compartir información, incluso al consultar API/DB directamente.

### BT-CP03 — Gestión operativa de clientes y vehículos — PENDIENTE

- [ ] Clientes, vehículos y búsqueda rápida por patente/nombre.
- [ ] Identificación de retornos de vehículos y navegación por historial.
- [ ] Datos de contacto y validaciones útiles para Chile.
- [ ] Resguardos frente a duplicados, edición y errores humanos.

**Salida:** Ignacio puede registrar un cliente y reconocerlo cuando regresa con su vehículo.

### BT-CP04 — Inspección multipunto y observaciones — PENDIENTE

- [ ] Digitalizar la hoja real de revisión multipunto.
- [ ] Guardar fecha, técnico, resultados, problemas y recomendaciones.
- [ ] Marcar observaciones no reparadas, mantenerlas visibles y darles seguimiento.
- [ ] Guardar historial inalterado de inspecciones anteriores o versiones auditables.

**Salida:** inspección completa y observaciones recuperables un año después.

### BT-CP05 — Presupuestos, PDF y correo — PENDIENTE

- [ ] Digitalizar la hoja real de presupuesto, relacionándola con inspecciones y vehículos.
- [ ] Ítems, mano de obra, valores, totales, vigencia y estados.
- [ ] Generar PDF legible e identificable con datos del taller.
- [ ] Enviar revisión y cotización al cliente mediante correo transaccional autorizado.
- [ ] Registrar intentos, errores, fecha y estado de envío.

**Salida:** Ignacio genera documentos y los envía desde la aplicación con trazabilidad, sin confundir cotización con documento tributario.

### BT-CP06 — Historial confiable, respaldo y prueba piloto — PENDIENTE

- [ ] Historial cronológico unificado por vehículo.
- [ ] Exportación, restauración probada, permisos y políticas de conservación.
- [ ] Pruebas de estabilidad en iPhone PWA Safari, APK Android nativa y web escritorio.
- [ ] Uso real controlado en el taller de Ignacio, con autorización y garantías de datos.
- [ ] Corregir hallazgos del taller piloto antes de vender.

**Salida:** el taller piloto puede usar el sistema en tareas reales de forma segura y encontrar antecedentes históricos rápidamente.

### BT-CP07 — Validación comercial con talleres externos — PENDIENTE

- [ ] Ignacio recluta un grupo piloto reducido de talleres (referencia: 3–5, sujeto a disponibilidad).
- [ ] Onboarding independiente para cada taller, sin intervención manual sobre datos privados.
- [ ] Medir uso, disposición a pagar, volumen de correos y almacenamiento.
- [ ] Estimar costos unitarios reales: base de datos, hosting, envío de emails, soporte, impuestos y cobros.
- [ ] Acordar legalmente propiedad, responsabilidades, facturación y distribución de ingresos.

**Salida:** evidencia de interés comercial y costos antes de habilitar cobros reales.

### BT-CP08 — Suscripciones y comercialización — PENDIENTE

- [ ] Elegir pasarela y moneda/cobro local tras revisar comisiones y normativa.
- [x] **Decisión comercial BT-PLAN-01:** Básico gratis y sin publicidad en lanzamiento; Plus USD 5/mes; Full USD 15/mes por taller; prueba Full 3 días con método de pago y renovación desactivable para evitar cobros involuntarios.
- [ ] Validar impuestos, moneda real de cobro, pasarela, rentabilidad y límites por plan antes de habilitar pagos.
- [ ] Implementar alta, pago, renovación, cancelación y suspensión con seguridad e idempotencia.
- [ ] Asegurar que una suspensión comercial no borre datos de clientes ni historiales.
- [ ] Lanzamiento comercial progresivo y seguimiento de retención/incidencias.

**Salida:** cobranza recurrente funcional y auditable para talleres que acepten las condiciones.

### BT-CP09 — Escalamiento y mejoras — PENDIENTE

- [ ] Optimización de costos, rendimiento y soporte.
- [ ] Nuevas funciones priorizadas por demanda real, sin comprometer simplicidad.
- [ ] Planes adicionales solo si la economía unitaria lo justifica.
- [ ] Evaluación de expansión fuera de Chile, con requisitos de cada jurisdicción.

## Riesgos obligatorios

1. **Economía unitaria:** Plus USD 5 puede no cubrir correos, almacenamiento, comisiones e impuestos; validar costos, límites y condiciones.
2. **Aislamiento de datos:** un fallo de permisos entre talleres sería crítico.
3. **Formalización comercial:** sin acuerdo escrito podrían existir conflictos sobre código, marca o clientes.
4. **Adopción:** priorizar rapidez y facilidad en móviles; no saturar con campos.
5. **Continuidad:** probar recuperación y respaldo; no basarse únicamente en mensajes de WhatsApp.
6. **Plantillas de Ignacio:** no inventar contenido definitivo de hojas aún no recibidas o verificadas.

## Reglas de actualización del roadmap

- Cada checkpoint cambia estado solo con evidencia de implementación y pruebas; distinguir `documentado`, `en desarrollo`, `verificado` y `publicado`.
- No declarar tareas completadas por estar descritas en un plan.
- Mantener decisiones originales de Ignacio y cambios aprobados por el usuario.
- Registrar cambios relevantes en un nuevo checkpoint y conservar la historia.
### BT-UI-02-R2 — Fidelidad premium del Inicio

- [x] Calibrar proporciones, tipografía, sidebar, tarjetas, dona, listas y accesos contra el mockup del Director.
- [x] Integrar imagen automotriz original realista en WebP, con degradados y fecha dinámica de Chile.
- [x] Validar TypeScript, 11 tests, build PWA y navegador a 1650/1440/375/390/430 px; capturas antes/después.
- [x] Conservar Android nativo, CSS anterior y datos DEMO sin backend.
- [x] Confirmar R2 servido en el Render existente: hashes JS/CSS del build y SHA-256 de imagen coincidentes con commit `c139ec6`.
- [x] **Verificación externa posterior** con conectores GitHub y Render: CI de implementación `#43119179234` SUCCESS y documentación `#43119309468` SUCCESS; Render `dep-dbqfhbl9el5s73er8ucg` LIVE, commit `eb82d27`.
- [x] **Aprobación visual expresa del Director** el 11/11/2026: identidad R2 oficial. Las capturas locales de Codex continúan documentadas como evidencia técnica, no como prueba física iPhone.
- [ ] **Prueba física iPhone Safari/PWA**, y Android nativo/APK en la fase final.

Evidencia y limitaciones: [checkpoint BT-UI-02-R2](docs/checkpoints/CHECKPOINT_BT_UI_02_R2_20261111.md).

### BT-UI-02-R2-APROBACIÓN — Sistema visual oficial y homogeneidad de los cinco paneles

- [x] Director confirma **R2 como referencia premium definitiva** del Inicio (11/11/2026).
- [x] Registrar un estándar único en `docs/SISTEMA_VISUAL_OFICIAL_R2.md` con colores, componentes, comportamiento responsive y regla de no modificar Inicio aprobado.
- [x] Mantener las cinco secciones y metodología web Render primero, iPhone PWA, Android APK nativa al final.
- [x] Preparar brief maestro BT-UI-03 para **Órdenes de trabajo** en `docs/briefs/BT_UI_03_ORDENES_TRABAJO_DIRECCION_ARTE.md`.
- [ ] Diseñar e implementar lista, detalle y creación DEMO de Órdenes de trabajo con visual R2 homogéneo; requerirá aprobación específica antes de siguiente panel.
- [ ] Repetir esta homogeneización en Clientes y vehículos, Informes y cotizaciones y Configuración, sin alterar Inicio R2.
- [ ] Verificación física iPhone Safari/iOS PWA; APK Android nativa y prueba en dispositivo en fase final.

**Fuente de continuidad:** [checkpoint BT-UI-02-R2-APROBACIÓN](docs/checkpoints/CHECKPOINT_BT_UI_02_R2_APROBACION_20261111.md).

### BT-UI-03 — Detalle de orden premium implementado para revisión

- [x] Reutilizar listado y creación DEMO existentes; implementar detalle según mockup con shell R2 intacto.
- [x] Integrar ficha OT-1002, cliente/vehículo, diagnóstico, ocho inspecciones editables, ítems CLP/IVA, pendientes y progreso derivados de estado.
- [x] Acciones DEMO: continuar revisión, informe local, impresión, confirmación de finalización, agregar ítems y avisos de futuras fichas.
- [x] TypeScript, 18 tests, build PWA y navegador 1650/1440/768/390/375 px. Inicio R2 sin diferencias de píxeles a 1650 px.
- [ ] Aprobación visual del Director para OT; prueba Safari en iPhone físico y conexión segura con persistencia en etapa futura.

Evidencia: [checkpoint BT-UI-03](docs/checkpoints/CHECKPOINT_BT_UI_03_20261111.md). No avanzar al panel Clientes y vehículos.
- [x] Publicación del detalle BT-UI-03 comprobada en el Render existente: HTML y bundles coinciden con el build de `9e3b08b`, según Codex.
- [x] **Auditoría remota independiente posterior:** GitHub Actions `#43124464047` sobre `ab51152` **SUCCESS** (web/PWA: 18/18 tests PASS, TypeScript/build/PWA PASS; Android Expo: CI PASS, sin APK). Render deployment `dep-dbqg4m0ae00c738bff40` sobre `ab51152` **LIVE**.
- [ ] **Fidelidad visual independiente:** las capturas locales `/workspace/visual-ui03/detail-1650.png` y `detail-390.png` no están adjuntas ni accesibles desde el chat; el Director aún no aprueba visualmente BT-UI-03.

### BT-UI-04 — Clientes y vehículos, DEMO premium para revisión

- [x] Implementar tres columnas, hero R2, KPI ilustrativos, filtros y selección de cinco clientes sintéticos.
- [x] Ficha rápida/ampliada, vehículos asociados, historial y pendientes filtrados por vehículo; navegación con órdenes DEMO compartidas y retorno a la ficha.
- [x] Nuevo cliente temporal y flujo de registro por enlace estrictamente DEMO, con validaciones y privacidad; sin URL pública, RUT, correo ni persistencia real.
- [x] TypeScript, 24 tests unitarios, build/PWA e interacción en 1650/1440/768/390/375 px; Inicio y detalle OT-1002 sin diferencias de píxeles a 1650 px.
- [x] Guardar capturas de escritorio y móvil en el repositorio para revisión independiente.
- [ ] Aprobación visual del Director y prueba física Safari/iPhone; conexión segura con Supabase en una etapa posterior.

[Checkpoint BT-UI-04](docs/checkpoints/CHECKPOINT_BT_UI_04_20261111.md) · [Contrato de datos y registro DEMO](docs/BT_UI_04_DATOS_Y_REGISTRO_DEMO.md). No avanzar a Informes y cotizaciones.
- [x] Publicación BT-UI-04 verificada en el Render existente: HTML raíz y bundles JS/CSS coinciden byte a byte con el build de `9bf7d3b`. Actions remoto y estado administrativo LIVE no consultables desde este entorno.

- [x] **Auditoría independiente BT-UI-04 (ChatGPT, 11/11/2026):** GitHub Actions `#43130663129` sobre `1280e5e` **SUCCESS** (24/24 tests web PASS, 6 archivos, TypeScript/build/PWA PASS; Android Expo CI PASS, sin APK). Render `dep-dbqgs9psrm7s738hgih0` sobre `1280e5e` **LIVE**.
- [x] **Capturas realmente accesibles desde GitHub**: `docs/screenshots/BT_UI_04_1650.png` y `BT_UI_04_390.png`; revisión visual independiente favorable de estructura R2 en escritorio y móvil, sin desbordamiento horizontal visible. No equivale a aprobación del Director ni a prueba física Safari.
- [ ] Recibir visto bueno visual del Director para BT-UI-04 antes de diseñar o implementar BT-UI-05.

### BT-REQ-REG-VEH-01 — Registro mediante enlace: cliente + vehículo + motivo de visita — APROBADO PARA DISEÑO

**Decisión del Director (11/11/2026):** cuando el taller comparta el enlace individual de registro, **el cliente debe completar sus datos personales y también registrar el automóvil que llevará al taller y describir brevemente el motivo de la visita o los trabajos que solicita**.

- [x] Incorporar a la especificación del formulario público DEMO y de su futuro contrato seguro.
- [x] **Sección 1 — Datos personales**: nombre, email, teléfono, dirección y comuna, respetando política de minimización y privacidad; no solicitar RUT obligatorio.
- [x] **Sección 2 — Vehículo**: marca, **modelo**, **año**, **kilometraje actual** y patente opcional para identificación (si el taller lo necesita). La marca permite distinguir modelos con nombre similar.
- [x] **Sección 3 — Motivo de la visita**: campo breve de texto libre: «¿Qué problema tiene tu vehículo o qué trabajo quieres realizar?»; admitir solicitudes de mantención, diagnóstico o cambio de piezas. Limitar extensión (p. ej. 500 caracteres), sin exigir jerga mecánica.
- [x] Vista previa final para el cliente antes de enviar, indicando que el taller revisará los datos y no se está generando una orden formal automáticamente.
- [ ] En modo real, crear una **solicitud de ingreso pendiente de revisión**, asociada al **taller del enlace, cliente y vehículo**. Ignacio confirmará los antecedentes y podrá convertirla en OT reutilizando el motivo escrito, sin transcribirlo nuevamente.
- [ ] Si el cliente ya tiene vehículo registrado, permitir seleccionarlo o actualizar kilometraje mediante flujo autorizado, evitando duplicados; no basar autorización en una patente escrita.
- [ ] Aplicar reglas de validación, enlaces temporales de un solo uso, verificación de email, permisos por taller, protección antiabuso y RLS. No hacer pública la base ni registrar información sin consentimiento/aviso legal.
- [ ] Ajustar experiencia móvil para formulario corto de tres pasos, alineado con identidad premium R2.
- [ ] **No implementar durante BT-UI-05**: Codex trabaja en Informes y cotizaciones. Este requisito se desarrollará en una etapa específica del registro, luego de su aprobación y con autorización; Android nativo se adaptará al final.

**Definición formal:** [Especificación de registro de cliente, vehículo y visita](docs/BT_REGISTRO_CLIENTE_VEHICULO_VISITA.md).

### BT-UI-05 — Informes y cotizaciones, DEMO premium para revisión

- [x] Composición del mockup con R2 intacto: KPI ficticios, documentos, historial por vehículo, acciones, vista previa y envío DEMO.
- [x] Flujos de informe y cotización con selección de OT, datos compartidos, revisión en memoria, secciones editables, ítems y CLP/IVA reutilizando cálculos de OT.
- [x] Ampliación e impresión de documento HTML, estados históricos ficticios y confirmación/reintento solo simulados; sin correo real ni PDF adjunto inexistente.
- [x] TypeScript, 31 tests, build/PWA, navegador y regresiones en 1650/1440/768/390/375 px; Inicio, OT-1002 y Clientes sin diferencias de píxeles a 1650 px.
- [x] Capturas principales versionadas y contrato de documentos/envío futuro documentado.
- [ ] Aprobación visual del Director, Safari físico, PDF directo y backend seguro con correo transaccional en etapas futuras.

[Checkpoint BT-UI-05](docs/checkpoints/CHECKPOINT_BT_UI_05_20261111.md) · [Documentos y envío DEMO](docs/BT_UI_05_DOCUMENTOS_DEMO.md). No avanzar a Configuración.
- [x] Publicación de BT-UI-05 comprobada en el Render existente: HTML raíz y bundles JS/CSS coinciden byte a byte con el build de `60bc392`. Actions remoto y estado administrativo LIVE no consultables desde este entorno.

- [x] **Auditoría remota independiente BT-UI-05 (ChatGPT, 11/11/2026):** GitHub Actions [#43135258201](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43135258201) **SUCCESS** sobre `ed40c33`; Web/iOS PWA y Android Expo ambos PASS; log web confirma **31/31 tests PASS en 7 archivos**, compilación Vite y PWA assets PASS. Render `dep-dbqheiqjnfac73bhukbg`, commit `ed40c33`, estado **LIVE**.
- [x] Capturas `docs/screenshots/BT_UI_05_1650.png` y `BT_UI_05_390.png` **examinadas directamente desde GitHub**: identidad R2 preservada en el panel Informes; responsive sin desbordamiento horizontal aparente. Evaluación cualitativa favorable, sin reejecutar pixel-diff de pantallas anteriores.
- [ ] **Visto bueno visual explícito del Director para BT-UI-05**; no avanzar a Configuración antes de su autorización. Safari iPhone físico, PDF real y backend seguro siguen pendientes.

### BT-PLAN-01 — Básico, Plus, Full y prueba Full de 3 días — APROBADO PARA DISEÑO

- [x] Básico **gratis sin publicidad durante el lanzamiento**; publicidad posterior no autorizada automáticamente.
- [x] Plus **USD 5/mes** y Full **USD 15/mes** por taller.
- [x] Prueba Full **3 días / 72 horas con método de pago**, sin primer cobro durante trial; mostrar consentimiento explícito y fecha/hora exacta del primer posible cargo.
- [x] Propietario puede **desactivar renovación automática de inmediato** desde Configuración; cancelación confirmada antes del fin evita cobro al vencer, Full sigue hasta la expiración y luego Básico sin pérdida de datos.
- [x] Especificación oficial en docs/PLANES_COMERCIALES_BT_PLAN_01.md y checkpoint docs/checkpoints/CHECKPOINT_BT_PLAN_01_20261111.md.
- [ ] Concretar límites por plan, pasarela, tasas/IVA y cláusulas de contratación.
- [ ] Construir panel de suscripción, consentimiento, cancelación y backend de cobros seguro **solo tras nueva autorización**.

**Estado: decisión comercial, no hay pagos reales.**

### BT-UI-06 — Configuración premium DEMO y preparación multitenant

- [x] Quinta sección con nueve tarjetas, cuatro KPI ficticios, estado del sistema y acciones rápidas; identidad R2 preservada.
- [x] Formularios temporales de taller, marca/logo, usuarios y roles, plantillas reutilizadas de Informes, correo sin proveedor, registro completo DEMO, preferencias, seguridad y suscripción informativa.
- [x] Catálogo BT-PLAN-01 incorporado como información; sin prueba, renovación, cobros, correo o respaldos operativos.
- [x] Contrato multitenant y matriz de permisos futuros, sin migraciones ni RLS ejecutadas.
- [x] TypeScript, 40 tests, build/PWA, interacciones y regresiones en 1650/1440/768/390/375 px; capturas versionadas.
- [ ] Aprobación visual del Director y prueba física Safari/iPhone.
- [ ] Backend seguro, Auth/RLS, proveedor de correo, respaldos y facturación solo con autorización posterior.

[Checkpoint BT-UI-06](docs/checkpoints/CHECKPOINT_BT_UI_06_20261111.md) · [Arquitectura multitenant](docs/ARQUITECTURA_MULTITENANT_CONFIGURACION.md) · [Matriz de roles](docs/MATRIZ_ROLES_Y_PERMISOS.md).
- [x] Publicación BT-UI-06 comprobada en el Render existente: HTML y bundles JS/CSS coinciden byte a byte con el build de `7a040e0`. Actions remoto y estado administrativo LIVE sin acceso desde este entorno.
- [x] **Auditoría externa de ChatGPT 11/11/2026:** GitHub Actions `#43141082423` **SUCCESS** en `04f7bf4` (web 40/40 tests PASS en 8 archivos, TypeScript, build/PWA; job Android Expo PASS, sin APK). Render `dep-dbqi6a2vcj2c73evr1dg`, commit `04f7bf4`, estado administrativo **LIVE**.
- [x] Capturas `docs/screenshots/BT_UI_06_1650.png` y `BT_UI_06_390.png` abiertas y examinadas desde GitHub; continuidad premium R2 adecuada, nueve tarjetas y panel derecho en escritorio, apilado móvil sin scroll horizontal visible. Comparación **cualitativa**; no se realizó pixel-diff independiente.
- [ ] **Aprobación visual expresa del Director** para declarar BT-UI-06 oficialmente aceptada; después definir próxima fase segura sin activar pagos/servicios ni modificar pantallas sin autorización.

### BT-PLAN-02 — Plantillas de informes propias por plan — APROBADO PARA ROADMAP (13/11/2026)

- [x] **Básico gratuito:** crear informes solo con formatos predeterminados ByteTorque; **no puede subir nuevos informes/plantillas propias**.
- [x] **Plus USD 5/mes y Full USD 15/mes:** podrán subir, administrar y reutilizar archivos de formatos propios de informe, privados por taller.
- [x] Durante prueba **Full de 3 días**, la capacidad estará habilitada mientras el plan efectivo sea Full; al finalizar sin renovación se aplican límites del plan al que descienda, sin borrar documentos ni plantillas históricas.
- [ ] Diseñar `Configuración → Plantillas → Mis formatos` y selector de plantilla en «Nuevo informe», usando identidad premium R2; estimar tipos de archivo, cuotas y almacenamiento por taller.
- [ ] Implementar subida/visualización segura, versiones, aislamiento multitenant y control de acceso según suscripción validada; **no habilitar en DEMO actual ni tocar Supabase sin nueva autorización**.
- [ ] Permitir conversión **interactiva** del formato propio solo después de mapear, validar y aprobar sus campos; no prometer que un PDF/Word/Excel se convierte automáticamente.
- [ ] Probar downgrade a Básico conservando lectura/exportación de formatos propios existentes y documentos históricos, aunque ya no pueda usarlos para nuevos informes.

Contrato comercial: [BT-PLAN-01](docs/PLANES_COMERCIALES_BT_PLAN_01.md), § BT-PLAN-02. **Solo documentación: BT-INS-01 sigue en desarrollo por Codex, sin cambiar su alcance.**

### BT-PLAN-IDEAS-01 — Registro continuo de ideas de Básico, Plus y Full (13/11/2026)

**Decisión del Director:** se añadirán gradualmente nuevas funciones a los planes según surjan ideas. Todas deberán **guardarse con trazabilidad** para una revisión comercial integral antes del lanzamiento, sin olvidarlas ni implementarlas automáticamente.

- [x] Crear un [registro maestro evolutivo](docs/REGISTRO_IDEAS_PLANES.md) con identificadores `BT-IDEA-001` en adelante, fecha, plan, decisión, estado y referencias.
- [x] Cargar decisiones actuales: Básico gratuito sin anuncios en lanzamiento, Plus USD 5, Full USD 15, prueba Full 72 h cancelable, registro por enlace, envío de informes PDF y subida de formatos propios en Plus/Full.
- [x] Separar decisiones aprobadas de **propuestas por evaluar**, como límites de uso, métricas/roles avanzados y publicidad posterior al lanzamiento.
- [ ] Con cada idea futura, asignar nuevo ID y conservar historial (nunca borrar sin rastro); enlazar cambios de estado a checkpoint.
- [ ] **Revisión final obligatoria antes de lanzar los planes:** confirmar prestaciones realmente implementadas, límites, costes, rentabilidad, impuestos, condiciones comerciales y aprobación expresa del Director.
- [ ] No agregar funciones al código, activar pagos, alterar Supabase ni modificar el trabajo de Codex BT-INS-01 a partir de este registro sin autorización específica.

**Fuente viva:** [docs/REGISTRO_IDEAS_PLANES.md](docs/REGISTRO_IDEAS_PLANES.md).

### BT-INS-01 — Informe multipunto interactivo DEMO

- [x] Página interior de Informes con 34 componentes / cinco categorías; X única verde, amarilla o roja, limpieza y pendientes explícitos; teclado y controles móviles.
- [x] Datos compartidos OT/cliente/vehículo y branding del taller; adaptador conservador solo para nivel de aceite, sin alterar los ocho controles de la OT.
- [x] Observaciones, fotos temporales validadas, borradores en memoria y cierre DEMO explícito con pendientes, sin correo ni persistencia real.
- [x] Misma hoja en editor/vista previa, impresión A4 con colores y X; PDF de navegador verificado, descarga PDF directa pendiente.
- [x] TypeScript, 48 tests, build/PWA y cinco recorridos de navegador (nuevo y cuatro existentes), en 1650/1440/768/390/375 px; capturas versionadas.
- [ ] Aprobación visual/terminológica de Ignacio, Safari físico, PDF directo y persistencia segura posterior. Auth, onboarding cerrado, RLS, pagos y Android preservados.

[Checkpoint BT-INS-01](docs/checkpoints/CHECKPOINT_BT_INS_01_20261113.md).

- [x] BT-INS-01 publicado en el Render existente: HTML y bundles JS/CSS del build final `e59e899` verificados byte a byte. Cierre 34/34 sin pendientes también PASS; Actions remoto y estado administrativo LIVE sin consulta desde este entorno.


### BT-REG-02 — Registro DEMO de cliente, vehículo y motivo de visita (13/11/2026)

**Estado funcional:** integrado en main como simulación local; **no es un enlace público ni habilita solicitudes reales**. El registro manual BT-UI-04 permanece independiente.

- [x] Reutilizar Clientes y vehículos como punto de entrada; mantener los cinco paneles premium R2, menú y BT-INS-01.
- [x] Formulario de **tres pasos** para nombre, email, teléfono, dirección/comuna opcionales; marca, modelo, año, kilometraje y patente opcional; síntoma/trabajo solicitado hasta 500 caracteres.
- [x] Validar individualmente, mostrar errores accesibles, volver sin perder datos, editar desde el resumen y simular confirmación expresa sin envío.
- [x] Separar clientReportedReason del diagnóstico profesional. Sin orden creada ni cambio en modelos de OT.
- [x] Bandeja de **solicitudes ficticias pendientes de revisión**, dos ejemplos iniciales y nuevas solicitudes únicamente en memoria del panel; al recargar desaparecen las agregadas.
- [x] Explicar planes: Básico manual, Plus USD 5/mes y Full USD 15/mes con función futura, prueba Full de tres días solo cuando exista facturación real; **no hay permisos ni compras implementados**.
- [x] Pruebas unitarias de validación y modelo DEMO; TypeScript y build/PWA mediante CI.
- [x] Revisión de navegador Chromium a 1650/390 px: prueba E2E PASS, captura y revisión del formulario, resumen y bandeja. Artefacto visual del commit 91866d9, run 43508132240. No equivale a Safari físico.
- [ ] Verificar estado de despliegue y contenido efectivo en Render actual; aprobación visual del Director.
- [ ] Probar Safari físico del iPhone; futura adaptación React Native Android nativo sin WebView.
- [ ] **Fase real separada, NO autorizada:** tokens de invitación seguros, consentimientos definitivos, procesamiento backend protegido, cuota/rate limit, RLS multitenant y pruebas A/B con credenciales autorizadas; recepción persistente, correo verificado, deduplicación de vehículo, conversión a OT con confirmación del taller y gestión comercial desde servidor.

Referencias: [BT-REQ-REG-VEH-01](docs/BT_REGISTRO_CLIENTE_VEHICULO_VISITA.md), [BT-UI-04](docs/BT_UI_04_DATOS_Y_REGISTRO_DEMO.md), [BT-IDEA-005](docs/REGISTRO_IDEAS_PLANES.md), [checkpoint BT-REG-02](docs/checkpoints/CHECKPOINT_BT_REG_02_20261113.md). Implementación en src/clientes/RegistroVisitaDemo.tsx, validaciones en src/clientes/registroVisitaData.ts, recepción dentro de ClientesPanel.tsx.

**BT-REG-02 cierre de verificaciones (13/11/2026):** commit 91866d9, GitHub Actions principal 43508132071 SUCCESS (57/57 Vitest, TS/build/PWA, Android Expo); E2E/capturas 43508132240 SUCCESS (1650/390 px, sin escrituras ni persistencia). Pendientes solo revisión visual del Director, confirmación administrativa Render y Safari físico; backend real excluido.

### BT-COT-01 — Cotizaciones e informes de trabajo premium R2 DEMO

- [x] Editor interior integrado desde Nueva cotización, Nuevo informe y acciones del diálogo Generar informe de OT; flujos clásicos y multipunto preservados.
- [x] Ítems editables, confirmación de eliminación/plantilla, validaciones y protección de duplicados; CLP neto/IVA 19 %/total con el cálculo compartido de la OT.
- [x] Cotización propuesta separada de informe: solo trabajos marcados Realizado se imprimen y suman. Antecedente multipunto opcional de la misma OT, sin alterar controles ni pendientes.
- [x] Condiciones/comentarios, borrador temporal, estados y aprobación/finalización simuladas; cambios invalidan aprobaciones. Sin firma, correo ni aceptación legal reales.
- [x] Vista previa e impresión A4; PDF de navegador de una y dos páginas comprobado. Descarga directa pendiente; compartir exclusivamente local/simulado.
- [x] TypeScript, 66 tests, build/PWA, nuevo recorrido en 1650/1440/768/390/375 y regresiones anteriores PASS; capturas versionadas y CI de navegador añadido.
- [x] Confirmación remota de Actions: ejecución `43516223991` SUCCESS, 66/66 Vitest, build/PWA y verificaciones Android PASS. (Codex no pudo consultar Actions en su entorno; se verificó posteriormente con acceso GitHub). 
- [ ] Aprobación visual del Director y prueba Safari físico. Backend, envío/firma, PDF directo y plantillas privadas requieren fases posteriores.

[Checkpoint BT-COT-01](docs/checkpoints/CHECKPOINT_BT_COT_01_20261113.md).

- [x] BT-COT-01 publicado en el Render existente: HTML, JS y CSS del frontend `7c1683f` verificados byte a byte. Compatibilidad del navegador de CI ajustada en `25f1633`; Actions remoto pendiente de consulta autorizada (Forbidden desde este entorno).


### BT-FLOW-01 — Flujo de Trabajo Inteligente y expediente único por visita — NUEVA PRIORIDAD

**Decisión del Director (13/11/2026):** conservar íntegramente los cinco paneles R2 y simplificar el trabajo diario con un recorrido guiado y contextual que enlace **cliente/vehículo → recepción → OT → inspección multipunto → trabajos valorados → cotización → respuesta/aprobación → realización → informe final → entrega**. Los menús laterales continúan disponibles para consulta libre y navegación directa. El operador no debe copiar antecedentes entre pantallas ni buscar manualmente qué hacer a continuación.

**Estado actual:** BT-QA-02 aprobado por el Director; BT-OFICIAL-01A presenta la interfaz pública vacía. A–E sigue preservado en pruebas privadas; los datos reales requieren una etapa de backend aún no autorizada. Base técnica revisada: `e9e2001` (BT-COT-01). Ver [plan maestro BT-FLOW-01](docs/BT_FLOW_01_FLUJO_TRABAJO_INTELIGENTE.md).

- [x] Revisar el cierre BT-COT-01 y confirmar CI remoto: [GitHub Actions 43516223991](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43516223991) **SUCCESS**, 66/66 Vitest, TypeScript, Vite/PWA y Android Expo PASS. El frontend publicado fue verificado por Codex; aprobación visual y Safari físico pendientes.
- [x] Establecer plan documental y reglas de seguridad: único expediente por visita, próximos pasos, posibilidad de retorno y selección de cliente/vehículo existente, sin diagnóstico ni precio inferidos.
- [x] **BT-FLOW-01A — Arquitectura y UX:** mockups y contratos documentados en `88ea19e`, aprobados expresamente como referencia en la orden BT-FLOW-01B/C. Implementación homologada con R2; aprobación final de la nueva interfaz C pendiente del Director.
- [x] **BT-FLOW-01B — Recepción y expediente DEMO:** integrado en `645e2e3`, entidades compartidas en memoria, visitas recurrentes, solicitud confirmada y OT idempotente con vínculos por ID. TypeScript, 74 pruebas y build/PWA comprobados antes de C.
- [x] **BT-FLOW-01C — Inicio y Continuar trabajo:** integrado en `9c12f97`, recepción, expediente y retorno a recursos por ID. Validación final: 76 pruebas, TypeScript/build/PWA y recorridos responsive PASS; aprobación visual y Safari físico pendientes.
- [x] **BT-FLOW-01D — Multipunto, trabajos y cotización (DEMO implementada):** reutilizar BT-INS-01 y BT-COT-01; preparar documentos desde ítems expresamente definidos y valorizados por el mecánico, nunca por deducción del motivo. Respetar aprobación de versión, `performed`, revisiones y pendientes técnicos. Nada se envía ni se aprueba realmente en DEMO.
- [x] **BT-FLOW-01E — Entrega DEMO y QA:** estados de espera/repuestos, negativa, trabajo adicional, cancelación, revisión final y entrega con checklist; cierre vinculado a revisión vigente y trabajos realizados; pruebas unitarias, TypeScript/build/PWA y E2E en cinco tamaños ejecutadas sobre la implementación de E. Revisión visual integral del Director y Safari físico aún pendientes.
- [ ] **Solo fase futura autorizada:** backend seguro multitenant, RLS A/B, historial persistente, enlaces/correos, firma y facturación/planes. Mantener BT-CP02-D reservado a otro chat y sin cambios en Supabase/Auth, secretos, migraciones, pagos ni Android en esta etapa.

**Puerta de arranque:** completar la aprobación visual de BT-COT-01 y validar el diseño de BT-FLOW-01A antes de programar cambios en los módulos aprobados. No se crea sexta sección de navegación ni se modifica código por esta actualización de roadmap.

[Checkpoint de planificación BT-FLOW-01](docs/checkpoints/CHECKPOINT_BT_FLOW_01_PLAN_20261113.md).

**Evidencia BT-FLOW-01A:** revisión de main `c4ccd5f`, CI remoto previo SUCCESS; dos mockups conceptuales entregados en la conversación (no Render ni capturas de la app), especificación técnica y checkpoint en GitHub. No se modificaron archivos React, Supabase, seguridad, los cinco paneles o BT-COT-01. El avance es documental y requiere visto bueno.

[Checkpoint BT-FLOW-01A](docs/checkpoints/CHECKPOINT_BT_FLOW_01A_20261113.md).

### BT-FLOW-01B — Infraestructura DEMO comprobada (13/11/2026)

- [x] Entidades actuales compartidas en memoria; solicitudes estructuradas, nuevas OT e IDs estables disponibles al navegar y en selectores de documentos.
- [x] Expediente por visita, recurrencia de vehículo, recepción original, confirmación/idempotencia de OT y solicitud; vínculos verificados por ID, nunca por patente como autorización.
- [x] TypeScript, 74/74 Vitest, build/PWA PASS antes de iniciar la interfaz C. Motores de inspección y documentos preservados; D/E pendientes.

[Checkpoint BT-FLOW-01B](docs/checkpoints/CHECKPOINT_BT_FLOW_01B_20261113.md).

### BT-FLOW-01C — Inicio, recepción y navegación guiada DEMO (13/11/2026)

- [x] Referencias visuales 01A aprobadas expresamente para esta implementación; Inicio R2 con KPI conservados, Nuevo ingreso, Continuar trabajos y progreso contextual, sin sexto menú.
- [x] Recepción de cliente/vehículo existente o nuevo y solicitud BT-REG-02, confirmación de visita y OT idempotente; borradores independientes conservados al navegar.
- [x] Expediente de siete hitos / nueve estados internos y retorno desde módulos a los mismos IDs de OT, multipunto y documentos. Abrir módulos no completa etapas.
- [x] TypeScript, 76 pruebas Vitest, build/PWA; recorrido nuevo y seis regresiones en 1650/1440/768/390/375 PASS; BT-REG-02 a 1650/390 PASS y capturas versionadas.
- [x] CI remoto confirmado independientemente el 13/11/2026: [GitHub Actions 43525591408](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43525591408) SUCCESS (76/76 Vitest, TypeScript/build/PWA y Android Expo); workflows de BT-FLOW-01/BT-COT-01/BT-REG-02 también PASS en `9c12f97`.
- [x] **Aprobación visual BT-FLOW-01B/C:** el Director aprobó expresamente el 13/11/2026 y autorizó continuar con los tres refinamientos móviles propuestos.
- [ ] Safari físico pendiente. 01D/E siguen por implementar: propuesta/versión/respuesta, ejecución autorizada, excepciones y entrega.

[Checkpoint BT-FLOW-01C](docs/checkpoints/CHECKPOINT_BT_FLOW_01C_20261113.md).

- [x] Publicación BT-FLOW-01B/C comprobada en el Render existente: HTML, JS y CSS de `9c12f97` coinciden byte a byte con el build validado. Actions remoto sin confirmación (Forbidden); revisión del Director pendiente, sin iniciar 01D/E.

### BT-FLOW-01C-R1 — Refinamientos móviles aprobados (13/11/2026)

- [x] Inicio móvil: mostrar solo los primeros **4 trabajos** de forma inicial; «Ver todos los trabajos» expande la lista y «Mostrar menos» la contrae. Escritorio conserva todas las filas. Las búsquedas no deben esconder coincidencias.
- [x] Expediente móvil: mostrar referencia corta de visita, conservar identificador completo en el atributo title y los vínculos internos.
- [x] Hitos móviles: indicación textual de desplazamiento lateral, scroll-snap y márgenes de foco seguros; se preserva el padding safe-area global del menú inferior, sin tocar R2 global.
- [x] Nuevas aserciones E2E en scripts/verify-flow-ui.cjs. Commit funcional `07ae7f5`; [CI principal](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43528004145) SUCCESS (TypeScript/build/PWA/Android) y [E2E cinco tamaños](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43528004301) SUCCESS.
- [ ] Validación en Safari físico iPhone; el CI Chromium no sustituye prueba en dispositivo.

### BT-FLOW-01D — Coordinación de propuestas y cotizaciones por revisión

**Implementada exclusivamente en DEMO** sobre BT-FLOW-01B/C y C-R1, reutilizando los modelos y editores BT-COT-01 y el motor BT-INS-01. Pendiente revisión visual del Director. [Contrato BT-FLOW-01D](docs/BT_FLOW_01D_CONTRATO_IMPLEMENTACION.md).

- [x] Especificar máquina de estados y respuesta **por quoteId + revision**, con aceptación/rechazo/cambios DEMO, caducidad al editar y separación de aprobación simulada frente a aceptación real.
- [x] Implementar preparación de trabajos/repuestos expresamente definidos por el mecánico y cotización a partir de datos verificados, sin inferir precios ni diagnóstico.
- [x] Registrar respuesta DEMO a la revisión vigente y rechazar autorizaciones obsoletas, cruzadas o duplicadas; conservar evidencia temporal y avisos al usuario.
- [x] Precargar informe de trabajo con ítems de cotización vigente **performed: false**, solo tras confirmación humana; sin declarar trabajos realizados ni entrega.
- [x] Verificar rechazo, solicitud de cambios, nueva revisión, doble pulsación, otra visita/OT, IVA, impresión únicamente realizados y ruta manual clásica.
- [x] TypeScript, Vitest, build/PWA, E2E cinco tamaños, regresiones BT-FLOW-01/BT-COT-01/BT-INS-01/BT-REG-02, capturas y checkpoint 01D; revisión visual posterior del Director. Sin Supabase/Auth/RLS, BT-CP02-D, correos, pagos, firmas o Android nativo.

[Checkpoint de aprobación y refinamientos C-R1](docs/checkpoints/CHECKPOINT_BT_FLOW_01C_R1_20261113.md).


**Cierre técnico BT-FLOW-01D:** 91/91 Vitest y TypeScript/build/PWA PASS; propuesta explícita sobre documento canónico, respuesta por revisión, caducidad sin borrar historial y precarga confirmada/idempotente con todos los trabajos sin realizar. Nueva aceptación de otra revisión conserva los informes anteriores. E2E y regresiones en cinco tamaños; BT-REG-02 escritorio/móvil. Cero escrituras de red y cero uso de almacenamiento de datos persistente en los recorridos. [Checkpoint D](docs/checkpoints/CHECKPOINT_BT_FLOW_01D_20261113.md).

- [x] **CI remoto verificado posteriormente desde ChatGPT:** [Actions 43534790714](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43534790714) SUCCESS sobre `ea96945`: TypeScript, **91/91 Vitest (14 archivos)**, Vite/PWA y Android Expo; [BT-FLOW 43534467132](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43534467132) y [BT-COT-01 43534467458](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43534467458) también SUCCESS sobre el commit funcional.
- [ ] Revisión y aprobación visual del Director y prueba física Safari/iPhone. Las capturas de Chromium no equivalen a aprobación ni prueba de dispositivo real.
- [x] **BT-FLOW-01E implementada solo en DEMO**, tras autorización del Director: pausas y motivos, resolución con confirmación, cancelación, entrega condicionada, pendientes multipunto y trabajos no ejecutados explícitos, registro temporal auditable por ID y caducidad si cambian documentos. No hay entrega física, correo ni persistencia.

- [x] Publicación D comprobada en el Render existente: HTML/JS/CSS idénticos al build de `d7ae7c1`; recorrido completo publicado en 1650/390 PASS y capturas reales versionadas. Sin nuevo Render ni rama.


### BT-FLOW-01E — Cierre guiado de visita y excepciones (13/11/2026)

**Estado:** código integrado exclusivamente DEMO; revisión visual y funcional global de las etapas A–E solicitada **al final del desarrollo**, sin nuevas aprobaciones intermedias. [Contrato y decisiones de la etapa E](docs/BT_FLOW_01E_CIERRE_Y_ENTREGA_DEMO.md).

- [x] Pausar visita por repuestos, cliente que no autoriza, revisión técnica, vehículo pendiente, trabajo adicional u otro motivo. Exigir nota y confirmación; resolver con nota y segunda confirmación. Historial temporal de espera.
- [x] Cancelar visita DEMO con motivo y confirmación, sin borrar orden ni documentos, sin presentar cancelación como entrega.
- [x] Entrega con puertas verificables: misma OT, inspección finalizada, propuesta y cotización revisadas, aceptación DEMO vigente por versión, informe Finalizado DEMO con al menos un `performed:true`, ausencia de pausas y cancelación.
- [x] Checklist y dos confirmaciones; identificar repuestos/trabajos sin ejecutar, observaciones técnicas y componentes multipunto sin revisar; exigir explicación expresa al entregar.
- [x] Registro temporal de cierre referenciado por `visitId`, cotización/revisión, respuesta, informe/revisión, totales y fecha; cierre idempotente, y marcado desactualizado cuando cambian antecedentes. No se fabrican diagnósticos ni autorizaciones.
- [x] Diez nuevas pruebas de dominio E, TypeScript, build/PWA y regresiones anteriores: [CI web completo de 101 pruebas](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43537500957) SUCCESS en `b46e074`. [Recorrido E 5 tamaños](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43537784904) SUCCESS en `2cf78d6` antes del último refinamiento de pendientes multipunto.
- [x] **CI/E2E final de `73091cf` verificados:** [GitHub Actions 43538255482](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43538255482) SUCCESS con 101/101 Vitest, TypeScript/build/PWA/Android Expo; [flujo de navegador 43538255549](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43538255549) SUCCESS en 1650/1440/768/390/375, incluidos pausa, solución, entrega, cierre desactualizado y cancelación. Capturas del artefacto 14090382860 disponibles para revisión final.
- [ ] Revisar aplicación completa con el Director y realizar prueba física Safari iPhone; la barra inferior fija y el flujo de cierre deben verificarse en dispositivo.
- [ ] **Backend real, fuera de alcance:** persistencia multitenant, RLS A/B, consentimiento legal/firmas, correo transaccional, pagos, facturación, control de roles y paridad Android. Requieren autorización y auditoría separadas; mantener BT-CP02-D reservado a su chat.

[Checkpoint de cierre BT-FLOW-01E](docs/checkpoints/CHECKPOINT_BT_FLOW_01E_20261113.md).

### BT-QA-01 — Auditoría integral guiada del Director (inicio 13/11/2026)

**Estado: EN EJECUCIÓN; no es aprobación final del producto.** Se auditó la línea base de `main` `4b82f8e`: CI remoto [43538846463](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43538846463) SUCCESS, 101 pruebas funcionales de la entrega E previamente verificadas, [E2E cinco tamaños 43538255549](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43538255549) SUCCESS. Ningún commit de aplicación/modificación R2 autorizado por el inicio de auditoría.

- [x] Leer guía final A–E, checkpoint 01E, HEAD/CI actual y componentes de Inicio/recepción/expediente.
- [x] Abrir matriz de casos Q01–Q16 y hallazgos clasificados en [BT-QA-01](docs/qa/BT_QA_01_MATRIZ_20261113.md).
- [x] Detectar el primer hallazgo editorial verificable: el texto del Inicio `Flujo BT-FLOW-01D/E pendiente` sigue desactualizado (H001). No corregir hasta priorizar.
- [ ] Verificar que Render esté sirviendo la revisión E (no pudo confirmarse desde el acceso actual).
- [ ] Director: probar Inicio y registrar cliente/vehículo ficticio nuevo en navegador/teléfono. Continuar con OT y multipunto solo después del primer bloque.
- [ ] Director: completar pruebas de cotización, respuesta, ejecución, pausa y entrega; reportar fricciones UI y errores con capturas.
- [ ] Safari físico en iPhone: foco, teclado, safe-area, barra inferior, scroll horizontal de hitos; el Chromium CI no lo sustituye.
- [ ] Consolidar matriz de hallazgos priorizados; después preparar BT-QA-02 de corrección (sin alterar backend protegido ni BT-CP02-D).

**Regla:** no introducir clientes reales, envíos, pagos ni persistencia durante el QA. El Director revisa todo el proceso A–E, sin hacer cambios de pantallas durante la recopilación de evidencias.

**BT-QA-01 — Primera observación del Director (13/11/2026):** completó una recepción desde móvil y llegó al expediente sin dificultad; la captura muestra Recepción completada, OT aún sin crear, cinco menús y siete hitos. Q01/Q02 parcialmente verificados; Q04 (creación OT), Safari físico y comprobación de SHA Render siguen pendientes. **Reconfirmado alcance del registro del cliente por enlace individual:** invitación segura del taller → formulario del cliente → solicitud pendiente → revisión humana y conversión a OT; simulación BT-REG-02 ya disponible, función pública real diferida a backend seguro para Plus/Full/trial Full habilitado. Ver [matriz BT-QA-01](docs/qa/BT_QA_01_MATRIZ_20261113.md). No modificar interfaz ni activar envío de enlaces por este recordatorio.

**BT-QA-01 — Recorrido A–E del Director completado en Android (13/11/2026):** capturas verifican precarga de informe desde cotización aceptada DEMO, cuatro ítems inicialmente no realizados, impresión A4 con los cuatro trabajos finalmente ejecutados y entrega 7/7 completada. Camino principal satisfactorio; QA-01 sigue abierto por excepciones, revisión PDF hoja adicional, Safari físico y correcciones UX. **Nuevo requisito prioritario BT-COM-01:** al cerrar visita, preparar **un único correo consolidado** con cotización aprobada, informe técnico/realizado y constancia de entrega; solicitud previa de autorización de cotización debe poder hacerse por un canal seguro aparte antes de reparar. Diseño en [BT-COM-01](docs/BT_COM_01_CORREO_CONSOLIDADO_ENTREGA.md). Aún no implementado; no activar correo, Supabase ni pagos por esta actualización.

### BT-QA-02 — Correcciones de usabilidad verificadas con el Director

**Estado: APROBADA VISUALMENTE por el Director, 14/11/2026.** Base real comprobada antes de modificar: `main` en `1a4c6ff`. [Orden oficial BT-QA-02](docs/BT_QA_02_ORDEN_CODEX.md) · [Matriz de hallazgos BT-QA-01](docs/qa/BT_QA_01_MATRIZ_20261113.md).

- [x] **H004 P1:** primera vista de cotización **compacta en móvil**, con lista de ítems, cantidad, precio unitario, total, subtotal/IVA/total y acceso a edición completa; escritorio y modo informe intactos.
- [x] **H003 P2:** retirar «Cargar plantilla» del flujo guiado de propuesta, preservando plantillas del editor avanzado y añadir/editar/eliminar ítems.
- [x] **H005 P2:** colocar pausa y cancelación bajo «Opciones de visita», preservando estado visible, alertas, resolución y confirmaciones.
- [x] **H002 P2:** cambiar «Finalizar y enviar» en multipunto por «Finalizar inspección DEMO» sin enviar correo/PDF; actualizar modal e icono.
- [x] **H001/H006 P2–P3:** eliminar aviso desactualizado BT-FLOW-01D/E pendiente y sustituir estados técnicos visibles como `en_curso` por lenguaje natural.
- [x] **R005 P2:** investigar posible segunda página en blanco al imprimir A4 en Android; corregir estilos solo si se reproduce y no recortar contenido legítimo.
- [x] TypeScript, **103/103 Vitest**, build/PWA, regresiones A–E y cinco paneles, E2E 1650/1440/768/390/375, capturas antes/después y checkpoint. Actions remoto verificado posteriormente desde ChatGPT: [CI final 43547511794](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43547511794) SUCCESS sobre `9495e05` (103/103 Vitest, 16 archivos, build/PWA y Android Expo); [BT-FLOW-01 43546894985](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43546894985) y [BT-COT-01 43546894989](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43546894989) SUCCESS sobre implementación.
- [x] Director aprueba BT-QA-02 y autoriza BT-OFICIAL-01A (14/11/2026); backend y BT-COM-01 no autorizados.

**Fuera de alcance:** [BT-COM-01](docs/BT_COM_01_CORREO_CONSOLIDADO_ENTREGA.md) sigue reservado para posterior fase segura (correo consolidado y adjuntos PDF reales). No envíos, backend, Supabase/Auth/RLS, BT-CP02-D, pagos, firma ni Android nativo. No crear ramas ni otro Render.


**Resultado BT-QA-02:** H001–H006 corregidos; resumen móvil de 4/8/12 partidas y estado vacío, edición completa, revisión/aceptación e informe preservados, espera/cancelación agrupadas con confirmaciones y foco. R005 investigado: cuatro trabajos producen 1 página A4, contenido largo 2 páginas no vacías en Chromium y emulación Android a 390/375; estilos print intactos al no reproducirse el defecto. Quedan prueba en dispositivos físicos y aprobación visual. [Checkpoint QA-02](docs/checkpoints/CHECKPOINT_BT_QA_02_20261113.md).

- [x] BT-QA-02 publicada en el Render existente: frontend `2529494`, HTML/JS/CSS comparados byte a byte y recorrido completo publicado 1650/390 PASS. Sin nuevo servicio ni rama; sin BT-COM-01/backend.

### BT-OFICIAL-01 — Transición del frontend DEMO a ByteTorque oficial (aprobación 14/11/2026)

**Autorización del Director:** iniciar la preparación de la versión oficial y retirar de **las pantallas públicas** nombres, clientes, vehículos, OT, usuarios y estadísticas ficticias. **No** significa activar operaciones con datos reales sin persistencia y seguridad. [Especificación y puertas de lanzamiento](docs/BT_OFICIAL_01_TRANSICION_PRODUCTO.md).

- [x] Auditoría inicial de código: fixtures `demoWorkOrders`, `demoClients`, `demoVehicles`, métricas del Inicio fijas, configuración/miembros y talleres ficticios; `flowSession` de memoria temporal. La interfaz actual NO es todavía apta para operar con clientes reales.
- [x] **01A — Codex, frontend oficial limpio:** conservar R2/cinco paneles; quitar información de muestra de ejecución pública; estados vacíos útiles para todas las secciones; cero estadísticas inventadas.
- [x] Separar fixtures para pruebas automáticas no expuestos por URL/flag pública; preservar las 103 pruebas y el flujo E2E dentro de un harness controlado.
- [x] Eliminar `DEMO` como branding público sin ocultar limitaciones: mientras no exista backend autorizado, mostrar «Acceso seguro y guardado permanente en preparación» y bloquear entradas que pudieran confundirse con registros reales.
- [x] TypeScript, Vitest, build/PWA, cinco tamaños, regresiones, capturas antes/después y checkpoint `BT-OFICIAL-01A`; no publicar una apariencia de producción que permita perder datos reales.
- [x] Publicación controlada y verificación de HTML/JS/CSS/manifiesto en el Render existente. Revisión visual del Director pendiente. La URL `biomotors-taller-demo.onrender.com` no se considera dominio comercial oficial; su cambio requiere decisión separada.
- [x] **01B — puerta de validación Auth/RLS A/B superada (14/11/2026)** con 25/25 pruebas reales y limpieza comprobada.
- [ ] **01B — implementación pendiente:** conectar backend seguro, registros, historial y respaldos en entregas incrementales, sin datos reales antes de autorización.
- [ ] **01C:** correo consolidado BT-COM-01, solicitud previa de aprobación, enlace seguro de cliente, PDF versionado y piloto BIOMOTORS, tras puertas de seguridad.

**No autorizado en 01A:** Supabase/Auth/RLS/migraciones, BT-CP02-D, `bt-owner-onboarding`, claves, pagos, firma, correos reales ni Android nativo. No crear otras ramas, Render o estudios.


**Resultado BT-OFICIAL-01A:** interfaz pública sin registros precargados, cifras inventadas, perfil de muestra ni operaciones que reciban datos personales; cinco paneles R2 y estado honesto sin configuración. Fixtures extraídos e inyectados solo en Vitest/harness loopback. **111/111 pruebas**, TypeScript, build/PWA, grafo público limpio, cinco paneles en 1650/1440/768/390/375 y regresiones privadas A–E/REG/INS/COT/configuración PASS. Publicación y capturas reales: [checkpoint 01A](docs/checkpoints/CHECKPOINT_BT_OFICIAL_01A_20261114.md). [Inventario](docs/BT_OFICIAL_01A_INVENTARIO_20261114.md).

- [ ] Revisión visual del Director de 01A y pruebas físicas Safari/iPhone. No equivale a habilitar datos reales.
- [ ] 01B / BT-CP02-D siguen reservados; no se inició Auth/RLS, persistencia, correo, cobros ni piloto real.


**Auditoría independiente 14/11/2026:** [CI final 43553527817](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43553527817) y [UI pública 43553527881](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43553527881), ambos **SUCCESS** en `874b39a`. Revisión preliminar de Inicio/Clientes/Configuración móvil y escritorio sin hallazgos bloqueantes; aprobación del Director y Safari físico pendientes. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_OFICIAL_01A_20261114.md).

### BT-AUTH-01 — Acceso con correo verificado y dos entradas por rol (14/11/2026)

**Solicitud del Director:** antes de activar la base operativa, incorporar inicio de sesión con verificación de correo, accesos visuales **«Administrador del taller»** y **«Mecánico»**. El administrador gestiona las operaciones autorizadas del taller; el mecánico ve sus OT asignadas, multipunto, observaciones y trabajos técnicos, sin información financiera, gestión completa de clientes ni configuración administrativa. El rol **no lo elige** el usuario; lo verifica el servidor por membresía activa. [Contrato BT-AUTH-01](docs/BT_AUTH_01_LOGIN_ROLES_CORREO.md).

- [x] Revisar arquitectura Auth/RLS, matriz de roles, checkpoint CP02-D, runbook A/B y estado oficial BT-OFICIAL-01A; verificar documentación actual de Supabase.
- [x] Diseñar dos entradas R2 y credenciales compartidas, correo verificado, recuperación, estados pendientes/desactivados, invitación exclusiva del mecánico y matriz de permisos por acción.
- [x] **BT-AUTH-01A — implementación visual:** siete pantallas R2, dos entradas, revisión explícita sin sesión, cinco paneles vacíos y vista técnica de mecánico; cuenta ficticia solo en harness privado. **125/125 pruebas (111 preservadas + 14 nuevas)**, TypeScript/build/PWA y cinco tamaños. [Checkpoint y evidencia](docs/checkpoints/CHECKPOINT_BT_AUTH_01A_20261114.md).
- [x] Publicar BT-AUTH-01A en el Render existente: frontend `0fc21ad`, archivos comparados byte a byte y recorrido publicado de siete pantallas a 1650/390 PASS. Rutas hash `/#/acceso`, sin cambios de infraestructura ni Auth.
- [ ] Aprobar visualmente BT-AUTH-01A por el Director y probar Safari/iPhone y Android físicos; verificar CI remoto de esta entrega. No equivale a Auth real.
- [x] **Puerta BT-CP02-D completada en el chat reservado (14/11/2026):** 25/25 PASS, comprobación remota de limpieza (0 usuarios, talleres, perfiles, membresías y sesiones), RLS activo y asesor de seguridad con 0 alertas. No equivale a habilitar el registro público ni a permisos de módulos futuros.
- [ ] **BT-AUTH-01B:** tras A/B aprobado, habilitar Auth correo verificado, sesiones, recuperación, invitación/revocación de mecánicos, autorización RLS, permisos por OT y taller. No habilitar alta libre de administrador ni claves de servicio en cliente.
- [ ] **BT-AUTH-01C:** módulos operativos por rol, panel de mecánico simplificado y gestión de personal autorizada. Probar acceso cruzado entre talleres, OT no asignada, URL forzada, sesiones inválidas y Safari iPhone. Android React Native posteriormente.

**No autorizado todavía:** registro público real, habilitar `BYTETORQUE_ONBOARDING_ENABLED`, tocar Supabase/Auth/RLS, crear mecánicos reales, enviar correos, conectar datos personales ni activar pagos. Mantener BT-COM-01 separado: correos Auth de verificación del personal no son el correo consolidado al cliente.


### BT-PLAN-03 / BT-IDEA-013 — Cupos de mecánicos por plan (14/11/2026)

**Decisión comercial expresa del Director para `Configuración → Usuarios y permisos`:** el Administrador del taller puede invitar/desactivar mecánicos de su propio taller, con cuotas **Básico 2**, **Plus 8**, **Full 8** por taller. El propietario y los administradores no consumen cupos de mecánico; otros límites de cuentas no han sido fijados. En prueba Full autorizada se aplica temporalmente 8. [Contrato comercial](docs/PLANES_COMERCIALES_BT_PLAN_01.md) · [idea registrada BT-IDEA-013](docs/REGISTRO_IDEAS_PLANES.md) · [especificación Auth](docs/BT_AUTH_01_LOGIN_ROLES_CORREO.md).

- [x] Registrar cupos en BT-PLAN-03, matriz de roles y BT-AUTH-01 como **Aprobada para diseño**.
- [x] **BT-AUTH-01A, solo presentación:** Usuarios y permisos muestra listado vacío, invitaciones pendientes 0, plan Sin configurar y referencias Mecánicos 0/2, 0/8 y 0/8; Invitar mecánico deshabilitado. Ningún plan activo ni invitación real.
- [ ] Conectar contador al plan/membresías autorizados del servidor cuando se apruebe la fase real; las referencias visuales no aplican cupos ni conceden acceso.
- [ ] Backend debe comprobar cupos activos y reservas de invitación vigentes en operación atómica; impedir invitaciones excedentes y acceso a talleres ajenos, sin habilitar Auth ni RLS en la fase visual BT-AUTH-01A.
- [ ] Antes de activar cambios reales de plan, acordar tratamiento de exceso de mecánicos al bajar a Básico **sin borrar historias ni desactivar usuarios silenciosamente**.
- [ ] Pruebas del límite Básico 2→3 y Plus/Full 8→9, concurrencia, revocación de invitación, email confirmado y bloqueo de autoelevación. BT-CP02-D sigue en el otro chat.


**BT-AUTH-01A — Verificación CI remota posterior (14/11/2026):** [workflow 43603192218](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43603192218) **SUCCESS** para `45e5200` (125/125 Vitest en 18 archivos, PWA y Android Expo); [interfaz pública 43602975602](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43602975602) y regresiones asociadas SUCCESS. Capturas de acceso, registro, mecánico y Usuarios y permisos revisadas preliminarmente sin hallazgos bloqueantes; aprobación del Director y Safari/iPhone físicos pendientes. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_AUTH_01A_20261114.md).


### BT-AUTH-01A-R1 — Entrada inicial (14/11/2026)

- [x] Abrir `/` muestra acceso desde el primer render y reemplaza la URL por `/#/acceso`, compatible con Render Static Site y sin entrada extra de historial.
- [x] `Ver interfaz pública sin sesión` abre `/#/revision/publica`; revisión explícita de cinco paneles, recarga y regreso al acceso.
- [x] Preservar siete pantallas, Administrador/Mecánico, enlaces directos y harness privado; sin Auth ni permisos reales.
- [x] 135/135 pruebas (125 preservadas + 10 nuevas), TypeScript/build/PWA y recorridos de acceso/paneles en cinco tamaños. Inicio del manifiesto `/` y service worker verificados.
- [x] Publicación R1 en el Render existente: frontend `6ab5de0`, HTML/JS/CSS/recursos comparados byte a byte y entrada por raíz/recarga/historial/enlaces/previsualización verificados en Render 1650/390.
- [ ] Revisión del Director y apertura desde PWA instalada física: instalación automatizada no disponible en este Chromium (`kWebAppDisabled`). [Checkpoint R1](docs/checkpoints/CHECKPOINT_BT_AUTH_01A_20261114.md#bt-auth-01a-r1--entrada-inicial-y-previsualización-explícita-14112026).


### BT-BRAND-01 — Identidad gráfica definitiva (14/11/2026)

- [x] Director aprueba los dos PNG oficiales. Originales RGBA intactos, transparencia comprobada y hashes del ZIP versionados en `assets/brand/originals/` y catálogo de procedencia.
- [x] Reemplazar marca provisional de siete pantallas, cinco paneles/navegación y área técnica; horizontal con soporte claro y dimensiones responsive, iconos funcionales conservados.
- [x] Mantener identidad comercial del taller en cotizaciones, informe y multipunto; atribución discreta «Software ByteTorque», logo del taller configurable y BIOMOTORS sin asignación automática.
- [x] PWA/favicon/Apple Touch/maskable oficiales; generador Node por copia de derivados versionados con hashes. Alias SVG histórico contiene el PNG oficial, sin redibujarlo. Conservar `id`, `start_url`, scope y entrada R1; versión de URL/iconos y revisión SW, sin caché de datos.
- [x] Recursos Expo (icono, adaptativo, splash y header) preparados, TypeScript/configuración/bundle Android verificados; sin APK ni adaptación funcional.
- [x] 141/141 pruebas (135 preservadas + 6 de marca), TypeScript/build/PWA, acceso/paneles/marca en cinco tamaños, regresiones A–E/INS/COT/Informes y A4 sin páginas en blanco. [Checkpoint y capturas](docs/checkpoints/CHECKPOINT_BT_BRAND_01_20261114.md).
- [x] Publicar en el Render existente: frontend `9b87866`, HTML/JS/CSS/recursos y alias histórico comparados con el build; siete pantallas, cinco paneles y marca verificados en Render 1650/390.
- [ ] Revisión visual del Director y prueba física de iconos PWA/Safari/iPhone/Android. Algunos navegadores pueden requerir quitar y volver a añadir el acceso para actualizar el icono; no cambia la identidad de la aplicación.

No se inició Auth real, Supabase/RLS, backend, planes/pagos/correo ni adaptación funcional Android.


**BT-BRAND-01 — CI remoto verificado posteriormente (14/11/2026):** [workflow 43615950760](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43615950760) **SUCCESS** en `1430cea`, 141/141 Vitest (20 archivos), PWA/recursos de marca y Android Expo PASS sin APK. [Verificación de interfaz oficial 43615950713](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43615950713) SUCCESS. Capturas de login/iconos/A4 revisadas preliminarmente; aprobación del Director e instalación física pendientes. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_BRAND_01_20261114.md).


### BT-BRAND-02 — integración transparente en navy (14/11/2026)

- [x] Recuperar íntegro el trabajo local interrumpido; base/remoto `1b3978e`, sin descartar cambios ni reconstruir componentes.
- [x] Variante derivada de texto claro «Byte»/«Gestión de Talleres», símbolo y alfa intactos. Originales, iconos PWA/favicon/adaptativos y recursos anteriores protegidos por hashes.
- [x] `BrandLogo surface="dark" | "light"`; navy sin soporte blanco, padding, borde ni sombra. Acceso/navegación comparten variante oscura, original disponible sobre claro.
- [x] Corregir ancho de marca en tablet 768; validar menú/cierre, ocho entradas de acceso y sidebar en 1650/1440/768/390/375. Navegación y formularios R2 preservados.
- [x] 146/146 Vitest, TypeScript, build/PWA y generador/recursos protegidos PASS; seis PDFs A4 sin páginas en blanco. Encabezado nativo gráfico actualizado, iconos/configuración sin cambios; bundle Expo verificado sin APK.
- [x] Publicación en el Render existente: frontend `89c6355`, recursos comparados con el build y recorrido publicado 1650/390 PASS; capturas reales antes/después.
- [x] **Revisión visual del Director APROBADA el 14/11/2026** para BT-BRAND-02 (logo transparente sobre azul marino en acceso y menú). [Checkpoint y capturas](docs/checkpoints/CHECKPOINT_BT_BRAND_02_20261114.md).
- [ ] Prueba física pendiente de iconos instalados/PWA en Android y Safari iPhone; no equivale a aprobación técnica de autenticación.

No se inició BT-AUTH-01B, BT-CP02-D ni backend.


**BT-BRAND-02 — Auditoría de CI independiente (14/11/2026):** [general 43630722991](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43630722991) **SUCCESS** sobre `ee9fe83`, 146/146 Vitest/21 archivos, PWA y Expo; [UI pública 43630723011](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43630723011) SUCCESS. Visual preliminar login/sidebar/superficies oscuro/claro: cumple referencia sin placa blanca. **Pendiente investigar** fallo independiente de [BT-FLOW-01 43630084997](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43630084997) sobre `89c6355`, assert Escape de «Opciones de visita» (`scripts/verify-qa02-ui.cjs:220`); no reproducido en último HEAD. Aprobación visual Director y dispositivos físicos pendientes. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_BRAND_02_20261114.md).


**BT-BRAND-02 — Decisión final del Director (14/11/2026): APROBADO visualmente.** Identidad cerrada sin más cambios de marca solicitados. Queda pendiente repetir el caso Escape en «Opciones de visita» del workflow BT-FLOW-01, así como la comprobación física PWA; BT-CP02-D continúa reservado a su chat, y BT-AUTH-01B no está autorizado todavía.
