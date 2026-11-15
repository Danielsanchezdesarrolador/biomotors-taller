# ByteTorque — BT-AUTH-R2-A4 · Verificación de identidad y plantilla de correo (OFF)

**Fecha de continuidad:** 14/11/2026 (Chile).  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`; rama única `main`.  
**Alcance:** preparar el preflight Auth y la presentación del futuro email de invitación, **sin activar funciones, SQL, SMTP, invitaciones ni registro público**.

## Dependencias verificadas

- R1 aceptado por el Director; permiso temporal B ya retirado.
- R2-A3 aprobado sobre PostgreSQL 17 efímero, workflow [43663461102](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43663461102) con reservas y aceptaciones concurrentes PASS. Sin modificación de Supabase hospedado.
- Supabase Auth conserva las cuentas ficticias, el ingreso público en Render sigue OFF y las RPC de invitaciones siguen **solo como propuestas SQL**.
- Referencias técnicas actualizadas: [Supabase Auth](https://supabase.com/docs/guides/auth), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [changelog de Supabase](https://supabase.com/changelog.md); CLI v3 tiene cambios que deben revisarse antes de generar migraciones reales.

## Cambios de código

### 1. `supabase/functions/_shared/verifiedInviteActor.ts`

- Implementa `verifyInviteActor()` que usa **GET** a `/auth/v1/user` de Supabase Auth con JWT del encabezado `Authorization` y una clave pública (no `service_role`).
- El origen remoto se fija al proyecto autorizado `https://suxcqqnmcjoezfxltoms.supabase.co`, nunca se construye desde el cuerpo de una solicitud. Límite de 8 segundos, sin caché y sin redirecciones automáticas.
- Exige UUID válido, correo con formato válido, `email_confirmed_at` comprobable y cuenta no anónima. Ignora por completo `user_metadata` y roles autodeclarados.
- Diferencia 401 (sesión inválida), 403 (correo no confirmado/anónimo) y 503 (servicio/configuración no disponibles), sin incluir mensajes upstream, JWT, emails ni claves en errores.
- **Este preflight acredita identidad y correo, NO el rol administrativo**. Las candidatas SQL deberán verificar actor/membresía de su taller, plan y cupo en una transacción al completar el backend.

### 2. Endpoints R2-A4

`bt-mechanic-invites`, `bt-mechanic-accept` y `bt-mechanic-revoke` invocan ahora `verifyInviteActor` después de validar la estructura de la solicitud, pero **antes del rechazo incondicional 503**. 

- Banderas de funcionalidad siguen OFF; con flag OFF ni siquiera llaman a Auth.
- Incluso con flag TRUE, tras el preflight siguen respondiendo 503 sin invocar RPC, enviar emails o crear membresía. **No desplegados**.
- Nunca aceptan email confirmado, ID de actor, `role`, `plan` o `service_role` del navegador.

### 3. `supabase/functions/_shared/mechanicInviteEmail.ts`

- Plantilla `renderMechanicInviteEmail` de correo **solo para futura integración**, devuelve asunto/texto/HTML sin enviar nada.
- Incluye taller, rol mecánico, un único enlace con token de 256 bits en hash `/#/auth/aceptar-invitacion?token=...`, vencimiento máximo de 48 horas y aviso de ignorar el mensaje si no fue solicitado.
- Escapa HTML, rechaza caracteres de control en nombre de taller y valida plazo. No acepta destinos arbitrarios ni pone token en query HTTP.
- **Aviso:** la ruta de aceptación aún NO está publicada ni implementada en el frontend, así que no generar ni distribuir invitaciones con esta plantilla. El contenido (incluido el hash) es secreto y no debe aparecer en logs/analytics/referrer, copias o métricas.

### 4. Pruebas automatizadas

- `src/auth/verifiedInviteActor.test.ts`: verificación con HTTP simulado, correo confirmado/no confirmado, anónimos, respuestas 401/403/429/500, red caída, host malicioso, JWT mal formado y claims de rol falsos.
- `src/auth/mechanicInviteEmail.test.ts`: plantilla texto/HTML, escape, vencimiento, no permitir token inválido, y token limitado al hash de la URL.
- `src/auth/mechanicInviteSqlContracts.test.ts`: guardas estáticas de que los tres endpoints incluyen el preflight Auth y **no consultan claves de servicio**, manteniendo el rechazo final 503. Estas pruebas **NO** sustituyen una prueba E2E de Edge Function.
- Consultar GitHub Actions del commit final antes de declarar PASS de la suite integrada.

## Puertas que aún faltan antes de uso operativo

1. Probar handlers Edge completos con HTTP/Auth/RPC simulados y después en proyecto de ensayo aislado, con CORS, sesiones inválidas/revocadas, correo verificado, roles y permisos.
2. Diseñar control antiabuso real (límites por usuario/taller/IP, reservas pendientes, reintentos y borrado lógico). Evitar duplicar invitaciones cuando SMTP falla mediante outbox seguro o reconciliación transaccional; confirmar email enviado antes de anunciarlo como entregado.
3. Elegir proveedor SMTP/transaccional, remitente y dominio autorizados, configurar redirecciones exactas, política de privacidad y expiración. Envíos Auth para personal **distintos** del módulo de documentos a clientes BT-COM-01.
4. Desarrollar la página de aceptación de invitación (web/PWA Safari iPhone), gestionando el token efímero con cuidado (no Storage persistente, URL fragmento limpiado al consumir).
5. Aprobar las migraciones SQL para el proyecto real y desplegar Edge Functions solo después de pruebas RLS y write API. No cambiar `VITE_BT_AUTH_R1_ENABLED` de Render público sin decisión explícita.
6. Resolver advertencia de contraseñas filtradas desactivada antes de onboarding público.

**Resultado:** R2-A4 **en preparación verificada local/CI**, aún no operativo. La base de clientes y mecánicos está intacta. No crear roles ni talleres nuevos, ni ejecutar SQL de invitaciones contra Supabase hospedado.


## Verificación CI ejecutada (14/11/2026)

- **GitHub Actions general:** [workflow 43664201657](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43664201657) sobre `8b1c65a` — **SUCCESS** en Web/iOS PWA y Android Expo, **31 archivos / 280 pruebas Vitest PASS**, TypeScript y build oficiales PASS. Se trata del código R2-A4 con identidad, template, endpoints y tests; la suite fue ejecutada, no solo agregada.
- **Chequeo Deno Edge:** [workflow 43664289778](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43664289778) sobre `1f68806` — **SUCCESS**, `deno check` de los tres endpoints y sus imports locales; sin deploy/SMTP/RPC.
- El workflow Deno inicial `3a19cd6` tuvo una definición YAML inválida (un `run:` con dos puntos internos); fue reparado en `1f68806`. La siguiente ejecución pasó. No se atribuye ese error a código de autenticación.
- La comprobación general del HEAD final continúa siendo independiente: consultar su estado si hubo commits posteriores al chequeo citado. Ninguna prueba CI sustituye el E2E de Auth+SMTP y RLS en servicio hospedado antes del lanzamiento.
