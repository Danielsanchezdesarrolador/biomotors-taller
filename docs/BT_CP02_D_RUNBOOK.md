# BT-CP02-D — Flujo de alta y verificación del backend

**Servicio:** `bt-owner-onboarding` (Supabase Edge Function) · **desactivado por defecto**.

## Camino previsto
1. El usuario crea cuenta con **Supabase Auth oficial** y verifica email.
2. Tras iniciar sesión, envía `POST` con `Authorization: Bearer <JWT de usuario>`, clave publicable en header `apikey` y cuerpo JSON que contenga solo `workshop_name` y `display_name`.
3. La plataforma valida JWT; la Edge Function usa Auth `/auth/v1/user` para verificar identidad y email confirmado y toma el UID de esa respuesta, nunca del navegador.
4. El servidor llama `bootstrap_workshop_owner` con credencial de servicio protegida. PostgreSQL crea el taller y su membresía `owner` atómicamente.
5. El navegador consulta después sus membresías autorizadas a través de políticas RLS y habilita únicamente sus talleres.

## Controles
- `verify_jwt=true`, lista de orígenes permitidos, longitud de datos, email confirmado, token revalidado con Auth.
- `SECURITY INVOKER` con `EXECUTE` exclusivo `service_role`. El frontend jamás recibe dicha clave.
- El endpoint **rechaza todo alta** mientras `BYTETORQUE_ONBOARDING_ENABLED` no sea `true`.
- Concurrencia: una cuenta no crea talleres duplicados mediante solicitudes simultáneas.
- No aceptar `role`, `workshop_id` ni `user_id` del frontend.
- Revisar cuota/rate limit y políticas de registro antes del lanzamiento comercial.

## Aprobación pendiente
- Dos usuarios Auth reales de prueba, dos talleres, solicitudes REST/JWT diferenciadas y negativas A→B y B→A.
- Confirmar que la cancelación de membresía revoca accesos, que no hay cambios de rol propio y que el último propietario no puede perderse.
- No habilitar registro público hasta aprobación del Director y paso de esos controles.

**No usar INSERT directo en `auth.users` ni service_role para simular un usuario RLS.**
