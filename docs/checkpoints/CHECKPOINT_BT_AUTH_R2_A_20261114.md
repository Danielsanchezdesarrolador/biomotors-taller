# ByteTorque — BT-AUTH-R2-A · Invitaciones de mecánicos (preparación segura)

**Fecha:** 14/11/2026 (Chile)  
**Rama:** `main` de `Danielsanchezdesarrolador/biomotors-taller`  
**Estado:** código y candidato SQL versionados; **NO aplicado a Supabase, NO desplegado como Edge Function, NO utilizable por usuarios**.

## Punto de partida
R1 fue aprobado por el Director: doble rol Chrome, API RLS 12/12, iPhone físico, renovación aceptada y permiso temporal B eliminado. [Checkpoint R1](CHECKPOINT_BT_AUTH_01B_R1_CIERRE_CONTROLADO_20261114.md). Primer módulo R2 de cupos ya incorporado con pruebas puras.

## Trabajo realizado en R2-A
1. `docs/sql/BT_AUTH_R2_A_INVITATIONS_CANDIDATE.sql`: diseño concreto para revisión previa a migrar.
   - Esquema privado `bt_private` (no agregar a Data API) y tablas de **entitlements** por taller, invitaciones con hash SHA-256 del token, y auditoría sin tokens ni emails.
   - RLS habilitada, ninguna policy para navegador; `anon`/`authenticated` sin grants; funciones solo para `service_role` del backend.
   - RPC `public.bt_r2_reserve_mechanic_invite` con `SECURITY INVOKER` y `search_path` fijo; obtiene rol activo, taller activo y plan desde la DB; **nunca confía en plan, actor ni rol enviados por el frontend**.
   - Cuota por taller: Básico 2, Plus/Full 8. Cuenta mecánicos activos más invitaciones pendientes vigentes y usa `FOR UPDATE` sobre la fila del taller para serializar reservas concurrentes.
   - Caducidad máxima de 48 horas, estado revocable, token hash SHA-256 único y validaciones de correo. No implementa ni habilita entrega/aceptación todavía.
2. `supabase/functions/_shared/mechanicInviteRequest.ts`: contrato mínimo `{workshop_id,email}`, rechaza campos extra (`role`, `plan`, `actor_id`, etc.).
3. `src/auth/mechanicInviteRequest.test.ts`: pruebas de normalización, contratos inválidos, IDs y parámetros privilegiados.
4. `supabase/functions/bt-mechanic-invites/index.ts`: **endpoint preparado pero cerrado**; devuelve 503 con bandera apagada y **también devuelve 503 incluso si alguien enciende la bandera**: no puede crear una invitación hasta implementar entrega, aceptación y rate-limits. Permite revisar el contrato, sin credenciales de servicio ni mutaciones.
5. `supabase/config.toml`: `verify_jwt=true` declarado para este endpoint futuro; **editar config no equivale a deploy**.

## Lo que aún NO está implementado / no certificar
- La base de datos real todavía contiene únicamente `workshops`, `profiles` y `workshop_memberships` como tablas propias (la candidata SQL no se ejecutó).
- No hay entrega de enlaces de invitación, aceptación de token de un solo uso, comprobación de correo de mecánico ni membresía creada a partir de invitación.
- Aún falta protección de abuso, confirmación de plan comercial de origen confiable y prueba de descenso de planes.
- No hay pruebas reales de SQL, de escritura RLS, de concurrencia, ni del endpoint en Supabase. Las pruebas Vitest solo validan lógica/contratos.
- No activar registro público, onboarding, cuentas reales, emails, plan/pagos, API de invitaciones ni Auth en Render hasta aprobación y pruebas específicas.

## Siguiente puerta — R2-A2
1. Revisar la candidata SQL y convertirla en migración mediante Supabase CLI en entorno de ensayo, conservando una ruta de reversión probada y sin datos reales.
2. Probar conteos 2→3, 8→9, concurrencia de dos administradores, desactivación/revocación, acceso cruzado y denegación a anónimos/otros roles.
3. Implementar entrega transaccional con proveedor SMTP aprobado, enlace único de alta y aceptación segura con correo confirmado, consumo atómico y auditoría. Antes de activar, verificar manejo de tiempos de expiración, duplicados, tasa de envíos e idempotencia.
4. Conectar `Configuración → Usuarios y permisos` únicamente después de pasar esa puerta.

**Decisión de seguridad:** esta entrega es deliberadamente no operativa: preparar el código sin abrir privilegios ni almacenar datos reales. La aprobación R1 no acredita los futuros permisos de escritura.
