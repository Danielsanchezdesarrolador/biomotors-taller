# ByteTorque — BT-PLAN-01 — Planes comerciales aprobados

**Decisión del Director: 11 de noviembre de 2026.**
**Estado:** política comercial y requisitos de diseño aprobados; sin facturación ni trial operativo.
**Precios por taller y por mes**, no por cada trabajador.

> **ACTUALIZACIÓN VINCULANTE BT-PLAN-04 · 17/11/2026.** **BT-PLAN-04 · decisión vigente 17/11/2026:** Cualquier persona confirmada empieza con **Básico personal gratuito, sin creación de taller nuevo**. Puede recibir/comprar Plus o Full **antes** de registrar su propio taller. **Plus USD 5/mes incluye 4 mecánicos; Full USD 15/mes incluye 8; cada mecánico adicional cuesta USD 2/mes al titular del plan**, nunca al trabajador. Propietarios/administradores no ocupan cupos. Ignacio recibirá Full permanente sin cobro, creará Biomotors e invitará a sus 2 mecánicos (2/8). Esta decisión **reemplaza los cupos BT-PLAN-03 (Básico 2, Plus 8, Full 8)**; preserva talleres QA existentes, datos e historiales. No están implementados todavía derechos personales, alta autónoma, cobros de extras o límites aplicados en backend. Ver `docs/BT_PLAN_04_CUENTAS_TALLERES_Y_EXTRAS.md`. Los apartados históricos con cifras distintas quedan expresamente superados. Los mecánicos no pagan individualmente. El pago de adicionales no funciona aún.

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
- **Básico es cuenta personal sin taller nuevo** (BT-PLAN-04). El uso gratuito debe incluir funciones reales por definir, sin fingir guardado de taller. Nunca borrar datos históricos por descenso de plan.

**Plus — USD 5/mes:**
- Básico completo.
- Enlaces seguros de registro: datos del cliente, marca, modelo, año, kilometraje y motivo de visita; solicitud pendiente de revisión por taller.
- Envío automatizado de informes PDF a clientes con dirección confirmada y seguimiento del estado del envío, al contar con backend seguro.
- Personalización de documentos y **4 mecánicos incluidos por taller** (BT-PLAN-04), más plazas confirmadas de USD 2/mes c/u pagadas por el titular; otras cuotas aún por definir.

**Full — USD 15/mes:**
- Plus completo.
- Roles avanzados, reportes y métricas detalladas, recordatorios de mantenciones, automatizaciones y controles superiores sujetos a implementación. No presentar funciones futuras como ya disponibles.
- **8 mecánicos incluidos por taller** (BT-PLAN-04), más plazas confirmadas de USD 2/mes c/u pagadas por el titular. Capacidades superiores adicionales aún pendientes de definición.
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

- **Cupos vigentes BT-PLAN-04**: Básico personal sin taller nuevo; Plus 4 incluidos; Full 8 incluidos; adicionales USD 2/mes por mecánico cobrados al titular. Ratificar reglas de reducción de cupos, límite absoluto de extras, prorrateo e impuestos.
- Definir IVA/impuestos, conversión CLP, pasarela elegible, términos, política de reembolsos y costos de operación.
- Diseñar posteriormente el panel «Plan y suscripción» con fecha exacta del primer cobro, estado y botón de desactivar renovación.
- Implementar posteriormente suscripción real solo con autorización específica del Director.

**Alcance presente:** documentación únicamente; no se modifica interfaz, Render, Android, Supabase ni se activa pago alguno.

## BT-PLAN-02 — Plantillas propias de informes según plan (decisión aprobada 13/11/2026)

**Regla comercial confirmada por el Director:** cada taller podrá trabajar con las plantillas predeterminadas incluidas en ByteTorque. **Solo talleres con Plus (USD 5/mes) o Full (USD 15/mes)** podrán subir y administrar sus **propios archivos/formatos de informes**. Básico (gratis, sin publicidad en el lanzamiento) utilizará exclusivamente las plantillas oficiales de ByteTorque.

| Capacidad | Básico | Plus | Full |
|---|---|---|---|
| Crear informes con plantillas predeterminadas | Sí | Sí | Sí |
| Usar plantilla multipunto predeterminada de Ignacio, si está incorporada al catálogo | Sí | Sí | Sí |
| Subir formatos propios de informes del taller | **No** | **Sí** | **Sí** |
| Guardar, elegir y reutilizar plantillas propias | No para nuevas operaciones | Sí | Sí |
| Adaptación interactiva del archivo subido | No | Tras validación/conversión | Tras validación/conversión |
| Descargar/imprimir informes según funciones disponibles | Sí | Sí | Sí |
| Envío automático al correo con PDF | No | Sí, cuando exista backend | Sí, cuando exista backend |

**Interpretación del alcance:** «subir un archivo» no garantiza que cualquier PDF, Word, Excel o imagen se convierta automáticamente en un formulario interactivo. La primera versión deberá permitir subir, identificar, visualizar y seleccionar formatos propios autorizados, y luego **adaptarlos a plantillas editables/interactivas únicamente mediante un proceso explícito de mapeo, validación y vista previa aprobada por el taller**. La compatibilidad de tipos se definirá durante la implementación (candidatos: PDF y documentos ofimáticos sin macros; el soporte real puede variar). No afirmar que un archivo importado sea editable si todavía es solo un archivo adjunto o una referencia.

**Ubicación propuesta:** `Configuración → Plantillas de documentos → Mis formatos de informe`; al crear un informe, selector «Plantilla predeterminada» / «Plantilla de mi taller». El formato multipunto de Ignacio será el punto de partida para BIOMOTORS; el SaaS no impondrá la identidad visual de un taller sobre otro.

**Permisos y almacenamiento:** el privilegio pertenece al **taller y su plan validado en backend**, no solo a un botón React. Los archivos deben almacenarse en área privada por `workshop_id`, sujetos a RLS/reglas de Storage, propietario o administradores autorizados, validación de contenido/tamaño y tipo real, rechazo de macros/código activo, saneamiento y límites antiabuso. Cada plantilla requiere versión e identificación, no mezclar contenido entre talleres. **Cuotas de espacio/cantidad de formatos pendientes de decisión.**

**Cambio o vencimiento de plan:** al bajar a Básico, no eliminar silenciosamente formatos propios ni información histórica. El taller podrá consultar/exportar sus archivos existentes por medios autorizados, pero **crear, importar, editar o escoger plantillas premium para nuevos documentos quedará bloqueado** mientras esté en Básico. Los informes históricos ya emitidos mantendrán su versión de plantilla para consulta. En **prueba Full de 72 horas** la función estará disponible temporalmente, sujeta a controles de seguridad y elegibilidad; una vez expirada aplica el plan efectivo.

**Estado de implementación:** **requisito aprobado y documentado, NO implementado**. No se ha habilitado subida real, conversión, storage ni políticas. Codex trabaja en la digitalización interactiva BT-INS-01: **no modificar código ni alcance de Codex en paralelo** sin nueva indicación.


## BT-PLAN-03 — Cupos históricos del 14/11/2026 (SUSTITUIDOS por BT-PLAN-04)

> **Histórico, no usar para implementar.** La matriz antigua de Básico 2 / Plus 8 / Full 8 queda sustituida por BT-PLAN-04. Los detalles sobre seguridad de invitaciones, roles y preservación de historiales siguen vigentes.

**Decisión expresa del Director:** en `Configuración → Usuarios y permisos`, el administrador del taller podrá incorporar mecánicos hasta el cupo de su plan. El cupo se refiere a **mecánicos**, no al total combinado de usuarios. **No incluir al propietario ni al administrador de taller dentro de estos cupos.** Las cuotas de propietarios/administradores adicionales siguen sujetas a diseño específico y nunca se pueden crear mediante el botón de mecánicos.

| Plan | Precio de catálogo | Mecánicos máximos por taller |
|---|---:|---:|
| Básico | Gratis | **2** |
| Plus | USD 5/mes | **8** |
| Full | USD 15/mes | **8** |
| Prueba Full de 72 horas | Según términos de prueba Full autorizada | **8 mientras el plan efectivo sea Full** |

**Experiencia propuesta:** contador `Mecánicos 0/2` o `Mecánicos 0/8`, listado de nombre/correo/estado, acciones `Invitar mecánico`, `Reenviar invitación` y `Desactivar acceso`, sujetas a permisos. Al alcanzar el máximo mostrar «Alcanzaste el límite de mecánicos de tu plan»; el plan Básico podrá sugerir Plus/Full, sin activar pagos desde React. El mecánico invitado necesita confirmar correo para acceder. El administrador **puede invitar/desactivar exclusivamente miembros con rol mechanic del mismo taller**, pero no dar roles `admin`/`owner`, modificar su propio rol ni gestionar planes/titularidad por esa facultad. El propietario conserva la facultad de delegación sensible.

**Control transaccional en servidor:** el plan efectivo y la pertenencia se verifican en backend, no mediante estado React o metadatos editables. Para impedir crear más invitaciones que cupos, contabilizar mecánicos activos **y reservas vigentes de invitaciones pendientes** sin duplicar la misma identidad; asignación/aceptación y cambios de rol deben validar el cupo atómicamente, con límites antiabuso. Una invitación revocada o caducada libera su reserva. La condición de email verificado es independiente del cupo y obligatoria para usar el acceso.

**Pendiente por política de cambios de plan:** definir qué sucede con el acceso operativo de los mecánicos que excedan 2 cuando Full/Plus pase a Básico, sin borrar cuentas, registros, inspecciones ni atribuciones históricas; **no desactivar personas ni eliminar datos silenciosamente**. Mientras la política definitiva no esté ratificada, presentar advertencia de ajuste de cupos y bloquear nuevas invitaciones; no afirmar que esa transición ya está implementada.

**Estado técnico:** regla comercial documentada. **Sin** Auth real, invitaciones verdaderas, control de cupos de servidor, facturación ni migraciones aplicadas. Requiere BT-CP02-D aprobado y posterior fase BT-AUTH-01B/C.
