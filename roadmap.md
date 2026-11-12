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
- [ ] Preparar esquema SQL, funciones internas y pruebas RLS con dos talleres ficticios; aprobarlo antes de aplicar cualquier migración.
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
- [ ] **Sección 1 — Datos personales**: nombre, email, teléfono, dirección y comuna, respetando política de minimización y privacidad; no solicitar RUT obligatorio.
- [ ] **Sección 2 — Vehículo**: marca, **modelo**, **año**, **kilometraje actual** y patente opcional para identificación (si el taller lo necesita). La marca permite distinguir modelos con nombre similar.
- [ ] **Sección 3 — Motivo de la visita**: campo breve de texto libre: «¿Qué problema tiene tu vehículo o qué trabajo quieres realizar?»; admitir solicitudes de mantención, diagnóstico o cambio de piezas. Limitar extensión (p. ej. 500 caracteres), sin exigir jerga mecánica.
- [ ] Vista previa final para el cliente antes de enviar, indicando que el taller revisará los datos y no se está generando una orden formal automáticamente.
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
