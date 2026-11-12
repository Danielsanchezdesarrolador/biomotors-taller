# ByteTorque — Matriz de roles de taller

Diseño para backend futuro. BT-UI-06 solo representa roles ficticios y algunas guardas locales; no activa permisos de servidor.

| Operación | Propietario | Administrador de taller | Mecánico / Operario | Recepción |
| --- | --- | --- | --- | --- |
| Perfil, marca, preferencias y plantillas del taller | Sí | Según autorización | No | No |
| Clientes, vehículos y solicitudes | Sí | Según permisos | Consulta autorizada | Registro/gestión autorizada |
| Órdenes, diagnóstico e inspección | Sí | Según permisos | Trabajo técnico autorizado | Gestión operativa autorizada, sin atribuirse diagnóstico |
| Invitar/desactivar usuarios y editar roles | Sí, con protección de titularidad | Solo con concesión expresa; sin elevarse ni conceder facultades administrativas | No | No |
| Cambiar propietario o rol propio | Proceso autorizado aparte; no editable aquí | No | No | No |
| Seguridad administrativa, copias y auditoría | Acceso autorizado del taller | Solo si se concede permiso específico | No | No |
| Plan, pagos y cancelación de suscripción | Solo su taller, validado en servidor | No por el mero rol; delegación futura separada si se aprueba | No | No |
| Usuarios/datos de otro taller | Solo con membresía independiente y contexto autorizado | Igual regla | Igual regla | Igual regla |
| Operación global del SaaS ByteTorque | No por ser propietario de un taller | No | No | No |

## Reglas de la DEMO implementada

- Contexto fijo `workshop-demo` / propietario ficticio. No se permite elegir un ID arbitrario ni se cargan empresas ajenas.
- Cada usuario y plantilla incluye taller; las funciones locales comprueban contexto y membresía activa antes de modificar.
- El propietario ficticio no se desactiva ni cambia de rol desde esta interfaz. No se puede invitar un propietario o elevar el rol propio.
- Un administrador necesita `canManageUsers` concedido por propietario; ese atributo no permite modificar otros administradores, delegarse ni administrar suscripción.
- Invitaciones con contactos example.com quedan Pendientes en memoria. No se envía correo ni se concede acceso real.
- La suscripción no está incluida en la operación de actualizar configuración; el catálogo y los controles son informativos. Ningún botón activa cobros, trial o cancelación reales.

Estas comprobaciones protegen la coherencia de la demostración. No resisten manipulación del frontend ni equivalen a autenticación, RLS, políticas de almacenamiento o revocación real de sesiones. Todo permiso definitivo se comprobará por operación en servidor y base de datos.
