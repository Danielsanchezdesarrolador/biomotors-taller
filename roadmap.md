# BIOMOTORS TALLER — ROADMAP OFICIAL

**Edición:** v1.2 — distribución web/PWA multiplataforma y despliegue autorizado  
**Fecha:** 2026-11-11  
**Checkpoint de continuidad:** BT-CP01-PWA-RENDER-20261111  
**Proyecto distinto de:** BIOMOTORS Academia.

## Visión

Crear el sistema más simple y confiable posible para registrar el trabajo diario de un taller mecánico, desde la inspección del vehículo hasta el presupuesto y el historial de reparaciones, y convertirlo en una **plataforma de suscripción mensual para otros talleres**.

### Organización de trabajo

- **Usuario:** líder de desarrollo y operación técnica.
- **Ignacio:** líder comercial y primer usuario piloto.
- Precio objetivo por validar: **US$5 por taller/mes**. No equivale aún a tarifa aprobada para cobro real ni define porcentajes de utilidad.

## Canales de distribución oficiales — decisión del 11/11/2026

**Modalidad aprobada:** una única aplicación web progresiva (PWA), accesible por URL HTTPS y con instalación opcional en pantalla de inicio. La estrategia cubre tres experiencias a partir de la misma base React/TypeScript:

1. **iOS / iPhone (Safari):** abrir la URL desde Safari; usar «Compartir» → «Agregar a pantalla de inicio» (el texto del menú puede variar según iOS). Validar apertura autónoma, iconos, estados de actualización, formularios y uso con el equipo de Ignacio.
2. **Android (Chrome o navegador compatible):** abrir la URL; instalar la aplicación o usar «Agregar a pantalla principal» cuando esté disponible. Validar instalación, iconos, botones táctiles y navegación.
3. **Web de escritorio:** usar la URL sin instalación desde Chrome, Edge, Firefox y Safari compatibles; validar la adaptación responsive.

**Alcance:** esto **no implica** una publicación nativa en Apple App Store ni Google Play Store. Esas vías requerirían un proyecto de distribución separado y aprobación futura. Las capacidades offline, notificaciones, cámara y otras APIs deberán evaluarse por navegador antes de prometerse.

**Autorización de publicación:** el usuario autoriza el despliegue de una **demo pública sin datos reales** a través de Render Static Site (servicio separado de BIOMOTORS Academia). No habilitar aún registro real, base de datos, correos ni pagos. Probar personalmente el acceso por URL y la instalación en dispositivos antes de declararlo verificado.

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
- [x] Seleccionar enfoque PWA adaptable para iPhone y Android; React + TypeScript como base propuesta.
- [x] Registrar que existe un proyecto Supabase independiente denominado `biomotors-taller` según información del usuario (sin afirmar conexión funcional).
- [x] Incorporar meta SaaS multiempresa y roles comercial/técnico.
- [x] Fijar US$5/taller/mes como **precio de referencia, aún no validado**.
- [ ] Recibir o verificar las hojas originales de inspección multipunto y presupuesto para modelarlas exactamente.

### BT-CP01 — Repositorio, fundamentos y entorno — EN DESARROLLO

- [x] Crear y verificar el repositorio privado `Danielsanchezdesarrolador/biomotors-taller` (11/11/2026).
- [x] Instalar este kit documental, con checkpoint BT-CP01 (11/11/2026).
- [x] Incorporar React + TypeScript + Vite, pantalla principal adaptable, navegación y manifiesto web (interfaz demostrativa en `main`, 11/11/2026).
- [ ] Instalar y probar la PWA en Safari de un iPhone real y Chrome de Android; revisar iconos, navegación, tamaños y comportamiento de actualización.
- [ ] Verificar acceso web por URL en escritorio y compatibilidad mínima de navegadores.
- [ ] Publicar la demo inicial por Render Static Site en un servicio independiente, con HTTPS y sin datos reales (autorizado por el usuario).
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
- [ ] Pruebas de usabilidad y estabilidad en iPhone/Android/escritorio.
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