# ByteTorque — BT-AUTH-R2-A2 · Aceptación y revocación de invitaciones (preparación)

**Fecha local:** 14/11/2026, Chile.  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`, rama única `main`.  
**Estado:** candidatos SQL y contratos/estándares versionados; **NO migrados, NO desplegados, NO habilitados al público**.

## 1. Continuidad

- BT-AUTH-R1 cerrado y aceptado por el Director; no repetir pruebas ya validadas.
- BT-AUTH-R2-A preparó: política de cuotas 2/8/8 y contrato para solicitar invitación, candidato SQL, Edge Function cerrada con 503.
- CI del último checkpoint de R2-A (`aa64e82`) confirmado **SUCCESS** antes de iniciar este bloque.
- Supabase revisado en lectura: `workshops`, `profiles` y `workshop_memberships` siguen siendo las únicas tres tablas de aplicación; hay 2 talleres y 4 membresías de ensayo, sin nueva invitación ni cambio de roles.

## 2. Cambios implementados en R2-A2

1. `src/auth/mechanicInvitationPolicy.ts` y tests: alinear nombres de estado `active|disabled` con el esquema aplicado de Supabase (antes la regla pura mencionaba `inactive`).
2. `supabase/functions/_shared/mechanicInviteToken.ts`: tokens de invitación con `crypto.getRandomValues` (32 bytes, 256 bits), representados en hex; digest SHA-256 sobre **bytes originales** con WebCrypto; validador de solicitud de aceptación con **solo token**, sin aceptar `email`, `role`, `plan` ni `actor_id` manipulables.
3. `src/auth/mechanicInviteToken.test.ts`: unicidad práctica de muestras aleatorias, formato, comparación SHA-256 con Node crypto, rechazo de tokens y de parámetros extra. No contiene credenciales ni tokens reales.
4. `docs/sql/BT_AUTH_R2_A2_ACCEPT_REVOKE_CANDIDATE.sql`: dos RPC **SECURITY INVOKER** restringidas a `service_role` para revocar y aceptar invitaciones:
   - Bloqueo de fila `public.workshops FOR UPDATE` para serializar acciones de un taller;
   - Revocación únicamente por `owner/admin` activo de su propio taller;
   - Aceptación: SHA-256 de token original, invitación `pending` y no vencida, coincidencia con correo confirmado recibido desde el **backend confiable**, taller activo, sin membresía previa de esa identidad, cupos vigentes y escritura `mechanic` exclusivamente; aceptación única y auditada;
   - Ante reducción de plan, no otorgar una plaza por encima del cupo vigente; jamás cambiar roles de miembros preexistentes;
   - Sin SELECT público de tablas privadas, ni acceso a datos de otros talleres.
5. `supabase/functions/bt-mechanic-accept/index.ts`: endpoint de aceptación preparado que **siempre responde 503 al alcanzar el paso operativo**, incluso si alguien cambia su flag. Sin efectos operativos; no consulta Auth ni base todavía. `supabase/config.toml`: `verify_jwt=true` declarado, **no equivale a deploy**.
6. `supabase/functions/_shared/mechanicInviteRequest.ts` y sus tests: validación estricta del contrato de revocación (únicamente `workshop_id` e `invitation_id`), sin rol, actor, email o plan editables.
7. `src/auth/mechanicInviteSqlContracts.test.ts`: pruebas estáticas sobre los SQL, las restricciones de los endpoints, acceso por rol y flags. **No son pruebas de PostgreSQL en ejecución ni pruebas de seguridad de RLS reales**.

## 3. Separación obligatoria de responsabilidades

El **navegador** solo suministra token al aceptar, o ID taller/invitación al revocar. Nunca el email confirmado, rol, ID del actor ni plan. El **servidor** deberá:

1. Validar un JWT de usuario contra Supabase Auth con `getUser()`, exigir `email_confirmed_at` y no anónimo;
2. Usar identidad y correo devueltos por Auth; nunca confiar en los enviados por la web;
3. Aplicar limitación de intentos, defensas contra enumeración, reenvíos, duplicación, entrega fallida y correos caducados;
4. Calcular SHA-256 del token en backend y usar RPC privada de `service_role`, guardando secreto de servicio solo en backend;
5. Crear membresía una vez, devolver respuesta genérica y sin secretos.

**Observación de privilegios:** la revisión directa de grants no mostró SELECT de `auth.users` para `service_role`, por lo que la propuesta no presupone ese SELECT; la comprobación de correo corresponde al servidor contra Auth. En ningún caso debe aceptarse `p_verified_email` del cuerpo del navegador.

## 4. Validaciones y puertas pendientes

- **No se ha aplicado SQL**, generado ninguna migración sobre el proyecto existente ni desplegado Edge Function. Los candidatos deben revisarse y probarse primero en un entorno aislado.
- Pruebas reales de PostgreSQL: 2→3 Básico, 8→9 Plus/Full, reservas simultáneas, dos aceptaciones concurrentes, reserva frente a aceptación, decremento del plan, caducidad/revocación y su auditoría; rechazadas las lecturas/escrituras anónimas y el acceso cruzado A/B.
- Para garantizar concurrencia, **todas** las operaciones futuras que alteren cupos, membresías o invitaciones deben respetar el mismo bloqueo por taller. Este invariante aún no puede certificarse porque esas operaciones futuras no existen.
- Proveedor SMTP, autenticación/confirmación del correo, entrega con enlace seguro de un solo uso, protección de abusos, estrategia de reintentos y experiencia móvil iPhone no implementados todavía.
- No habilitar `BYTETORQUE_MECHANIC_INVITES_ENABLED`, `BYTETORQUE_MECHANIC_ACCEPT_ENABLED`, el Auth real en Render, el onboarding ni el registro público. No usar datos reales ni cobrar.

## 5. Próxima etapa R2-A3

Preparar un **laboratorio aislado** para probar las candidatas SQL con transacciones y roles reales, sin modificar los dos talleres existentes. Tras los tests y revisión de privilegios/escapes, convertir la candidata a migración adecuada a la versión actual de Supabase CLI. Luego integrar verificación Auth y correo real de invitación en un único flujo, con aprobación explícita para habilitarlo.

**Criterio de cierre actual:** preparación R2-A2 documentada con código y tests; esperar CI para confirmar suite final. Esto **no convierte las invitaciones en una función operativa**.
