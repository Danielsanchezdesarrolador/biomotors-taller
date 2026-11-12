# ByteTorque — BT-PLAN-01 — Planes comerciales aprobados

**Decisión del Director: 11 de noviembre de 2026.**
**Estado:** política comercial y requisitos de diseño aprobados; sin facturación ni trial operativo.
**Precios por taller y por mes**, no por cada trabajador.

## 1. Tarifas decididas

| Plan | Precio mensual | Publicidad en lanzamiento |
|---|---:|---|
| Básico | **Gratis** | **Sin publicidad** |
| Plus | **USD 5** | Sin anuncios como objetivo de diseño, sujeto a ratificación comercial |
| Full | **USD 15** | Sin anuncios como objetivo de diseño, sujeto a ratificación comercial |

El Director aprobó que Básico NO mostrará publicidad durante el lanzamiento. La política posterior al lanzamiento **no está decidida** y no cambiará automáticamente. Los valores USD 5 y USD 15 son precios de catálogo aprobados para diseño, pendientes de determinar moneda de cobro en Chile, impuestos aplicables, comisiones, límites y condiciones finales.

## 2. Prueba Full de tres días con método de pago

**Reglas decididas:**
1. Para activar la prueba Full, el propietario agrega un método de pago válido a través de un proveedor seguro.
2. Full estará disponible **3 días completos (72 horas)** desde la activación confirmada en servidor, sin cobrar la suscripción durante ese período.
3. Antes de aceptar, mostrar sin ambigüedades **USD 0 hoy**, fecha y hora exactas de fin, y **USD 15/mes al término si la renovación permanece activa**. El consentimiento a cobros posteriores debe ser afirmativo y verificable.
4. En Configuración → Plan y suscripción debe figurar desde el primer momento **«Desactivar renovación automática»**, sin hablar con soporte.
5. Si el dueño desactiva renovación antes del fin de la prueba, el servidor y el proveedor deben registrar y confirmar la cancelación **sin intentar efectuar el primer cargo al expirar**.
6. Aunque desactive renovación, conserva Full **hasta cumplir los 3 días**. Después pasa a Básico gratuito conservando clientes, vehículos, órdenes y su historial. Si tenía un Plus pagado antes, su eventual restitución deberá especificarse al contratar; no realizar cargos implícitos.
7. Si no la desactiva y consintió la suscripción, se podrá iniciar el primer cobro de USD 15/mes tras el vencimiento (nunca durante la prueba).
8. El propietario podrá ver estado, vencimiento, renovación activada/desactivada y confirmación de su solicitud; no mostrar «Cancelado» hasta confirmación real del servidor/pasarela.
9. Recomendar confirmación o comprobante de la desactivación y avisos previos por un canal de contacto autorizado, sin depender de estos avisos para evitar cargos.
10. Una prueba por taller elegible, con medidas razonables contra abuso y sin compartir datos entre talleres.

**Garantía a verificar antes de comercializar:** el proveedor de pagos debe admitir periodos trial, tokenización y cancelación anticipada; contemplar reintentos/webhooks y carreras al momento del vencimiento. Una cancelación exitosa previa al vencimiento debe impedir efectivamente el intento de cobro. Validar normas de consumidores, impuestos y condiciones antes de activar.

## 3. Funciones diferenciadas — propuestas sujetas a definición de cuotas

**Básico:**
- Alta manual de clientes, vehículos y órdenes; inspecciones multipunto, cotizaciones, observaciones e historial.
- Impresión/descarga de documentos cuando la función PDF exista realmente; NO envío automatizado de PDF por correo.
- NO generación de enlaces de registro del cliente: el taller captura sus antecedentes manualmente.
- Gratis sin publicidad durante el lanzamiento.
- Límites de usuarios, nuevas OT, almacenamiento y cuotas sin aprobar aún. Nunca bloquear acceso al historial propio ni su exportación por descenso de plan.

**Plus — USD 5/mes:**
- Básico completo.
- Enlaces seguros de registro: datos del cliente, marca, modelo, año, kilometraje y motivo de visita; solicitud pendiente de revisión por taller.
- Envío automatizado de informes PDF a clientes con dirección confirmada y seguimiento del estado del envío, al contar con backend seguro.
- Personalización de documentos y múltiples usuarios, sujeto a límites aún no fijados.

**Full — USD 15/mes:**
- Plus completo.
- Roles avanzados, reportes y métricas detalladas, recordatorios de mantenciones, automatizaciones y controles superiores sujetos a implementación. No presentar funciones futuras como ya disponibles.
- Capacidad y cupos superiores aún pendientes de decisión.
- Prueba Full de 3 días conforme a sección 2.

**Innegociable para TODOS:** protección de datos, autorización por taller, RLS, acceso a su propia información, integridad de historial y posibilidad de exportar. Seguridad no es un beneficio exclusivo de Full.

## 4. Contrato técnico futuro (no implementar ahora)

- Catálogo versionado de planes, precios, beneficios y cupos.
- Suscripción por taller: plan, trialStartsAt, trialEndsAt, autoRenew, canceledAt, periodEnd, estado validado, cliente/suscripción tokenizados de la pasarela y auditoría.
- Permisos: solo dueño o responsable delegado del taller puede consultar y modificar la facturación del taller autorizado. Acceso cruzado rechazado en API/DB.
- El método de pago lo procesa y conserva el proveedor; **nunca números de tarjeta/CVV en frontend, logs o Supabase**.
- Activación, cancelación y cobros mediante backend, webhooks verificados e idempotencia, sin confiar en señales del navegador.
- Al cancelar antes del plazo: no realizar cargo, mantener acceso Full hasta expiración, luego Básico sin destruir datos.
- Pruebas obligatorias: cancelar inmediatamente, 12/24/47/71 horas, al borde del vencimiento, desconexión de red, webhooks tardíos/duplicados, intentos de doble cobro, denegación de acceso cruzado y preservación de datos.
- No prometer cancelación confirmada cuando el proveedor no haya devuelto éxito.

## 5. Trabajo pendiente

- Ratificar límites de usuarios/OT/correos/enlaces y el alcance exacto de Plus/Full.
- Definir IVA/impuestos, conversión CLP, pasarela elegible, términos, política de reembolsos y costos de operación.
- Diseñar posteriormente el panel «Plan y suscripción» con fecha exacta del primer cobro, estado y botón de desactivar renovación.
- Implementar posteriormente suscripción real solo con autorización específica del Director.

**Alcance presente:** documentación únicamente; no se modifica interfaz, Render, Android, Supabase ni se activa pago alguno.
