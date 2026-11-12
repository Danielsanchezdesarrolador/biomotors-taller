# ByteTorque — Configuración por taller y autorización futura

## Alcance de BT-UI-06

La aplicación muestra **un único taller ficticio**, `workshop-demo`, con contexto de propietario DEMO. Los perfiles, marca, usuarios, plantillas, correo, preferencias y suscripción se agrupan bajo `WorkshopSettings.workshopId`. No hay selector de otros talleres, API privada, autenticación, migraciones ni políticas RLS ejecutadas.

Las guardas de `settingsData.ts` evitan inconsistencias locales: rechazan contexto ajeno, miembro inactivo, cambios de titularidad/rol propio, suscripción por empleado y plantillas de otro taller. **Esto no demuestra aislamiento real entre empresas**: todo el frontend es manipulable y no reemplaza la validación del servidor. Las pruebas unitarias son de modelos y reglas DEMO; las pruebas API/DB descritas abajo quedan pendientes.

La memoria de `settingsSession.ts` se descarta al recargar. No se utiliza almacenamiento persistente ni se transmiten los datos de los formularios. Las preferencias no alteran las otras cuatro pantallas. Perfil y marca mantienen un único nombre comercial; la razón social es independiente. El logo se lee localmente, se limita a PNG/JPG/WebP de hasta 1 MB y se decodifica antes de presentarlo; no se sube. No se solicita contraseña, clave SMTP, token de cobro ni tarjeta.

## Contrato conceptual — sin crear tablas todavía

Los nombres se contrastarán con el esquema real antes de autorizar migraciones.

| Entidad | Identidad y relación | Datos previstos |
| --- | --- | --- |
| `workshops` | `id` interno único | Nombre comercial, datos mínimos, estado |
| `workshop_memberships` | `workshop_id` + usuario autenticado | Rol, permisos concedidos, estado, vigencia |
| `workshop_settings` | Taller propietario | Preferencias validadas y versión |
| `workshop_branding` | Taller propietario | Marca, pie comercial, referencia privada del logo |
| `workshop_document_templates` | Taller + plantilla + versión | Encabezado, secciones, formatos y pie |
| `workshop_email_settings` | Taller propietario | Identidad verificada, reply-to, firma y referencia segura al proveedor; nunca credenciales en clientes |
| `workshop_registration_invites` | Taller + invitación | Hash de token, alcance, expiración, usos, revocación |
| `workshop_subscriptions` | Suscripción independiente del taller | Plan/versionado, estado validado, período, trial, renovación y referencias tokenizadas del proveedor |
| `workshop_audit_events` | Taller + actor | Acción, recurso, fecha, resultado y correlación, con acceso restringido |

Relaciones adicionales con clientes, vehículos, órdenes, documentos e inspecciones usarán claves coherentes por taller, evitando que una referencia de otro tenant pueda insertarse aunque el UUID exista. El identificador de taller no se acepta como prueba de autorización.

## Reglas obligatorias del servidor y base de datos

1. Autenticar cada petición privada. Resolver el usuario desde una sesión validada, nunca desde campos `actorId`, `role` o `workshop_id` confiados al navegador.
2. Comprobar membresía activa y permiso de la operación dentro del taller activo. Una persona con varios talleres usará un contexto explícito autorizado; no se sumarán privilegios de talleres distintos.
3. Implementar RLS en todas las tablas privadas y operaciones, con comprobaciones de lectura y escritura. Impedir cambios de tenant en filas y referencias cruzadas. Las funciones privilegiadas requerirán revisión de alcance y auditoría.
4. Las invitaciones administrativas no permitirán escalar rol propio. Delegar administración de usuarios será una facultad explícita concedida por el propietario; no equivale a titularidad, seguridad global ni control de facturación.
5. Mantener al menos un propietario técnico válido mediante un proceso transaccional autorizado. Transferir titularidad será un flujo aparte, con confirmaciones y auditoría; no se deduce una cesión jurídica del software o negocio.
6. Desactivar una membresía revocará efectivamente su acceso y sesiones/capacidades asociadas. No bastará esconder opciones en React.
7. Documentos y logos privados usarán almacenamiento con políticas por taller y enlaces firmados limitados. No publicar respaldos, rutas o bitácoras de otro negocio.
8. Mantener secretos de correo/pagos exclusivamente en backend seguro. La identidad de envío se verificará antes de marcarla configurada. No pedir contraseñas de Gmail/SMTP en frontend.
9. La consola global de operadores de ByteTorque será separada, con autorización y auditoría propias; un administrador de taller no es un administrador del SaaS. Esta pantalla no incluye esa consola.

## Registro por enlace y solicitudes de ingreso

Se reutiliza el formulario de datos personales de Clientes. Configuración agrega una vista local de vehículo (marca, modelo, año, kilometraje y patente opcional), motivo y resumen editable. La confirmación es una **solicitud pendiente DEMO**, no una OT ni recepción de backend. La vista se pierde al cerrar; el formulario de Clientes anterior no cambia de comportamiento.

La implementación real seguirá [BT-REQ-REG-VEH-01](BT_REGISTRO_CLIENTE_VEHICULO_VISITA.md): token aleatorio de alta entropía con hash, expiración y usos limitados, revocación y consumo atómico validados en servidor, protección antiabuso, datos mínimos y aviso de privacidad. El enlace dará permiso de ingreso específico, nunca lectura indiscriminada de datos privados. Escribir una patente no demuestra identidad ni autoriza modificar un vehículo existente. El taller revisará la solicitud antes de convertirla en OT.

## Planes, prueba y renovación — diseño sin activar

Se conserva la decisión concurrente [BT-PLAN-01](PLANES_COMERCIALES_BT_PLAN_01.md): Básico gratuito sin publicidad en lanzamiento, Plus USD 5/mes y Full USD 15/mes por taller. Impuestos, moneda real de cobro, límites y condiciones finales siguen pendientes. No se promete uso ilimitado ni se aplica una cuota ficticia de almacenamiento.

`WorkshopSubscription` mantiene referencias de período, inicio/fin de prueba, renovación y cancelación **nulas/inactivas**; proveedor null, sin cobros. `fullTrialContract` describe 72 horas, USD 0 inicial, USD 15 posterior, consentimiento y pasarela necesarios, con `operational: false`. La ficha ofrece un control explicativo «Desactivar renovación automática · DEMO», sin marcar cancelación confirmada ni modificar una suscripción real.

En producción, activación, elegibilidad, fechas exactas, consentimiento, tokenización, cancelación y cobros se validarán en servidor/proveedor mediante operaciones idempotentes y webhooks autenticados. Una cancelación confirmada antes del fin debe impedir el intento del primer cargo; Full permanece hasta la expiración y luego pasa a Básico sin borrar historial. Se probarán cancelación inmediata, antes del límite, carreras, fallos de red, eventos duplicados y preservación de datos. Nunca se guardarán números de tarjeta/CVV en frontend ni Supabase.

La suscripción solo la administra el propietario autorizado en esta DEMO. Una futura delegación de facturación requerirá un permiso específico y auditado; administrar usuarios no lo concede automáticamente. Seguridad, integridad del historial y aislamiento pertenecen a todos los planes, no solo Full.

## Verificación backend pendiente — no ejecutada en BT-UI-06

- A lee/actualiza su configuración autorizado; A intenta leer o modificar B: denegado en API/DB.
- Usuario sin membresía activa intenta administrar taller: denegado.
- Mecánico/recepción intenta administrar suscripción o seguridad del taller: denegado.
- Administrador intenta elevarse, cambiar titularidad o concederse facultades: denegado.
- Invitación o solicitud pública manipulada cambia tenant/vehículo ajeno: rechazada.
- Archivo privado, documento, respaldo o auditoría de B solicitado por A: denegado.
- Desactivar cuenta/membresía revoca el acceso efectivo.
- Eliminación/cambio concurrente del último propietario no deja taller huérfano.
- Pagos/cancelaciones duplicados o fuera de orden no producen cargos indebidos; cancelar a tiempo impide intento de cobro.

No afirmar estas garantías de producción hasta implementar y ejecutar sus pruebas contra backend real.
