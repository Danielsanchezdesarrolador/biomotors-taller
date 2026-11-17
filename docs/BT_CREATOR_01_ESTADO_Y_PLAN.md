# ByteTorque — BT-CREATOR-01 / Creador y suscripciones

Fecha: 17-11-2026. Rama única: main. Dominio oficial: https://bytetorque.cl.

> **Enmienda vinculante BT-PLAN-04 (17/11/2026):** **BT-PLAN-04 · decisión vigente 17/11/2026:** Cualquier persona confirmada empieza con **Básico personal gratuito, sin creación de taller nuevo**. Puede recibir/comprar Plus o Full **antes** de registrar su propio taller. **Plus USD 5/mes incluye 4 mecánicos; Full USD 15/mes incluye 8; cada mecánico adicional cuesta USD 2/mes al titular del plan**, nunca al trabajador. Propietarios/administradores no ocupan cupos. Ignacio recibirá Full permanente sin cobro, creará Biomotors e invitará a sus 2 mecánicos (2/8). Esta decisión **reemplaza los cupos BT-PLAN-03 (Básico 2, Plus 8, Full 8)**; preserva talleres QA existentes, datos e historiales. No están implementados todavía derechos personales, alta autónoma, cobros de extras o límites aplicados en backend. Ver `docs/BT_PLAN_04_CUENTAS_TALLERES_Y_EXTRAS.md`. La implementación actual mantiene suscripciones asociadas a talleres y NO concede aún planes a cuentas personales.

## Decisiones del Director

- Creador global: la cuenta personal confirmada del titular del software, distinguida del rol propietario/administrador de cualquier taller. Solo el titular puede modificar las concesiones manuales de suscripción.
- Usuarios comunes: se registran, verifican su correo y posteriormente podrán crear/contratar su propio taller; sin membresía no pueden acceder a datos de un taller. El pago de Plus/Full se hará mediante flujo autorizado y automático **en una etapa posterior**.
- Básico personal gratuito sin creación de taller nuevo; Plus USD 5/mes con 4 mecánicos incluidos; Full USD 15/mes con 8 mecánicos incluidos; extras USD 2/mes/mecánico pagados al titular. La prueba Full de 3 días y la facturación de extras aún no están integradas.
- Creador: panel separado de clientes/talleres. Permite conceder Plus/Full por días, extender vencimientos, conceder permanente (vitalicio), restablecer Básico, revocar beneficios; cada cambio tiene motivo, autor, fecha y registro de auditoría. No expone órdenes, diagnósticos, cotizaciones ni datos personales de clientes de talleres.
- Ignacio: cuando confirme su nueva cuenta, el Creador le concederá **Full permanente sin cobro a su identidad personal**; **después** Ignacio creará Biomotors como propietario e invitará a sus dos mecánicos (2/8 incluidos). No vincularlo a los talleres QA ni transmitir rol Creador.
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
3. Implementar cuenta personal Básico → derecho Plus/Full confirmado → alta autónoma transaccional de taller propio/membresía owner → asociación única de licencia/cuotas, sin elegir taller ajeno; pagos y trial solo tras integración y pruebas.
4. Implementar pasarela de pagos autorizada, webhooks verificados con idempotencia, caducidad automática y suscripción, renovación/estado de cobro, reembolsos y cancelación. No existen pagos reales ni SMTP transaccional para facturación en este avance.
5. No conceder aún Full a Ignacio hasta que exista la vinculación segura de beneficios personales. Cuando confirme su cuenta, concederle Full permanente primero y permitirle crear Biomotors después; mantener separados los talleres de pruebas.
6. El respaldo cifrado recuperado sigue siendo **una sola copia local**. Director anunció compra futura de USB/disco para segunda copia. Falta respaldo integral de roles, auth y componentes externos. Registrar riesgo, no repetir proceso de backup por rutina.
