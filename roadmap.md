# BIOMOTORS TALLER — ROADMAP OFICIAL

**Edición:** v1.3 — Android APK nativa + iOS PWA Safari + web  
**Fecha:** 2026-11-11  
**Checkpoint de continuidad:** BT-CP01-PLATAFORMAS-20261111  
**Proyecto distinto de:** BIOMOTORS Academia.

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
- Crear aplicación Android nativa independiente en `apps/android/` DENTRO del mismo repositorio privado, trabajando solo sobre `main`.
- Utilizar un ÚNICO backend Supabase `biomotors-taller`, con Auth, tablas, Storage y RLS por `workshop_id`; misma información autorizada en ambos clientes.
- Los componentes React DOM NO se compartirán directamente con React Native; compartir tipos, validaciones y acceso a API cuando sea viable.
- Generar una APK real de prueba usando firma y perfil EAS `android.buildType: "apk"` o un método nativo equivalente; verificar en teléfono Android real.
- La PWA iOS debe probarse desde Safari en iPhone real; no dar por verificada la instalación solo por un manifiesto web.
- Google Play Store y desarrollo iOS nativo quedan para decisiones futuras, sin gastos ni publicaciones autorizados por ahora.
- Mantener sin activar clientes reales, pagos, correos externos o migraciones irreversibles hasta asegurar permisos y recibir autorización.

### Secuencia inmediata

1. Preservar la demo web/iOS publicada en Render.
2. Crear base Android nativa React Native + Expo dentro de `apps/android/`, con navegación de Inicio, Clientes, Vehículos, Revisiones y Presupuestos.
3. Definir build de APK y probarla en Android; probar PWA por separado en Safari iPhone.
4. Conectar ambos clientes a Supabase independiente, con aislamiento por taller y pruebas RLS.
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
- [ ] Crear proyecto React Native + Expo Android nativo en `apps/android/`, sin sustituir la web.
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

### BT-CP02 — Identidad, talleres y aislamiento — PENDIENTE

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
- [ ] Definir precio final y límites de plan; US$5 es hipótesis inicial.
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

1. **Precio subestimado:** con US$5, emails, almacenamiento, comisiones e impuestos podrían consumir el margen.
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