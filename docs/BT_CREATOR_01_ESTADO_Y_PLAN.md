# ByteTorque — BT-CREATOR-01 / Creador y suscripciones

Fecha: 17-11-2026. Rama única: main. Dominio oficial: https://bytetorque.cl.

## Decisiones del Director

- Creador global: la cuenta personal confirmada del titular del software, distinguida del rol propietario/administrador de cualquier taller. Solo el titular puede modificar las concesiones manuales de suscripción.
- Usuarios comunes: se registran, verifican su correo y posteriormente podrán crear/contratar su propio taller; sin membresía no pueden acceder a datos de un taller. El pago de Plus/Full se hará mediante flujo autorizado y automático **en una etapa posterior**.
- Básico: gratuito sin publicidad durante lanzamiento, hasta 2 mecánicos. Plus: USD 5 por mes y hasta 8 mecánicos. Full: USD 15 por mes, hasta 8 mecánicos. Trial Full de 3 días con método de pago y posibilidad de cancelar renovación, **aún no integrado**.
- Creador: panel separado de clientes/talleres. Permite conceder Plus/Full por días, extender vencimientos, conceder permanente (vitalicio), restablecer Básico, revocar beneficios; cada cambio tiene motivo, autor, fecha y registro de auditoría. No expone órdenes, diagnósticos, cotizaciones ni datos personales de clientes de talleres.
- Ignacio: cuando su cuenta esté confirmada, se creará/vinculará a su taller real Biomotors como propietario y se concederá Full permanente **sin cobro**. No confundirlo con el taller QA «Taller ByteTorque de Pruebas». Los permisos del creador nunca se transmiten a Ignacio.
- Pagos reales: deberán generar eventos verificados de activación, renovación, cobro fallido y vencimiento. El creador podrá registrar excepciones/manuales; la facturación no podrá atribuirse a un registro manual de cortesía.

## Estado técnico realizado

- Supabase \`suxcqqnmcjoezfxltoms\`: migración \`bt_creator_01_private_subscriptions_mfa\` aditiva instalada. Esquema privado \`bt_platform_private\`: \`creators\`, \`subscriptions\`, \`subscription_events\`, todos con RLS FORCE sin políticas directas y sin USAGE para \`authenticated\` ni \`anon\`.
- Tres RPC protegidos: \`bt_creator_is_creator()\`, \`bt_creator_overview()\`, \`bt_creator_manage_subscription(...)\`. Solo usuarios autenticados pueden llamarlos; las funciones comprueban la identidad global privada en servidor. El cambio de planes EXIGE \`aal2\` en JWT (TOTP MFA). \`anon\` no dispone de permisos.
- La identidad global se vinculó con un procedimiento SQL privado **por coincidencia exacta de cuenta verificada**, no por user_metadata ni por número de rol enviado por el frontend. No incrustar correo ni UUID de creador en frontend, repositorio, SQL público o tests.
- Cuenta del Director: además vinculada como \`admin\` al taller QA \`Taller ByteTorque de Pruebas\`, único entorno con la cotización ficticia \`QA1234\`. Ninguna membresía añadida al Taller B.
- UI \`src/creator/CreatorConsole.tsx\`, visible solo si el cliente R1 está autenticado, la comprobación \`bt_creator_is_creator\` devuelve true y \`VITE_BT_CREATOR_PRIVATE_ENABLED=true\`; el botón «Panel del creador» aparece dentro de la aplicación de taller. Creación de factor TOTP/validación AAL2 desde ese panel, no pedir contraseña ni código por chat.
- 0 concesiones iniciales y 0 cambios de auditoría; se conservaron los registros CP03-CP05. No se envió ningún correo de facturación, se hizo ningún cobro ni se asignó Full a Ignacio todavía.

## Limitaciones y próximos pasos obligatorios

1. Verificar CI y Render \`live\` para el build privado, y realizar QA real desde la cuenta del Director: abrir Panel del creador, consultar ambos talleres, configurar/verificar MFA, hacer un cambio solo en el taller sintético y comprobar auditoría. No declarar QA real aprobado antes.
2. **Las concesiones manuales aún no activan por sí solas restricciones/cuotas de los módulos comerciales**: falta conectar la lectura efectiva del plan a los servicios de Backend/RLS, conservar datos en downgrade y aplicar cupos en invitaciones/operaciones; no vender planes hasta completar esa integración.
3. Implementar onboarding seguro de taller: alta por usuario confirmado, taller propio, membresía owner, plan Básico inicial, cuotas y protección antisuplantación, sin posibilidad de seleccionar ID ajeno; pagos y trial con tarjeta solo tras integración y pruebas.
4. Implementar pasarela de pagos autorizada, webhooks verificados con idempotencia, caducidad automática y suscripción, renovación/estado de cobro, reembolsos y cancelación. No existen pagos reales ni SMTP transaccional para facturación en este avance.
5. No hacer concesión a Ignacio hasta que su cuenta confirmada y taller Biomotors estén correctamente asociados; mantenerlo al margen de los dos talleres de pruebas.
6. El respaldo cifrado recuperado sigue siendo **una sola copia local**. Director anunció compra futura de USB/disco para segunda copia. Falta respaldo integral de roles, auth y componentes externos. Registrar riesgo, no repetir proceso de backup por rutina.
