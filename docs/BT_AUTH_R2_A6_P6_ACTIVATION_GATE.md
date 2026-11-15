# ByteTorque — Puerta de activación R2-A6-P6, no autorizada

**Estado: preparación técnica**, **sin cuenta Resend/clave real configuradas**, sin despliegue de worker. Refleja la librería `@supabase/server@1.9.2` validada offline; ningún paso en este documento autoriza activar funciones.

## Control de acceso que sí se probó

- `withSupabase({ auth: 'secret:bytetorque-worker' })` pasa solo con `apikey` sintética del nombre exacto. Probado directamente con la librería oficial, sin red en CI. Las claves `default`, `billing`, `sb_publishable_` y `Authorization: Bearer <JWT>` fallaron.
- El candidato autenticado continúa **503** y no reclama SQL ni invoca Resend; los payloads y navegadores con Origin se bloquean adicionalmente. Esta política estructural no autentica por sí sola.
- `index.ts` todavía está cerrado 503 y `config.toml` conserva `verify_jwt=true`. Un check de CI impide cambios accidentales a ese contrato mientras no se revise explícitamente la puerta.

## Secuencia de aprobación futura

1. Autorizar formalmente prueba de autenticación interna y desplegar un **worker inactivo** solo tras revisión de costos y alcance. No implica aprobar envío de correo.
2. Crear en **Supabase Settings → API keys** una clave secreta con nombre `bytetorque-worker`, con administración y rotación backend. Este nombre es identificador de clave, **no un permiso SQL de alcance restringido**: una secret key puede conferir capacidades administrativas; preservar aislamiento por RPC, auditoría y no exponer el secreto. No usar `service_role` ni `sb_secret_` en frontend o Expo.
3. Crear wrapper de entrada operativo, basado en el candidato, con `auth:'secret:bytetorque-worker'`. Aplicar conjuntamente `verify_jwt=false` **exclusivamente a `bt-invite-worker`** en `supabase/config.toml`. No cambiar solo la configuración ni utilizar `auth:'none'` o `auth:'secret:*'`; publicar la función únicamente cuando la validación del SDK sea obligatoria.
4. Mantener kill switch y retorno 503 hasta pasar pruebas negativas en un entorno autorizado: sin `apikey`, key de otro nombre, key pública, JWT de usuario, body malicioso, Origin navegador, CORS, GET/OPTIONS, vencimiento/rotación de clave, errores Auth.
5. Antes de ejecutar una invitación, integrar RPCs reales bajo permisos service-only, máximo un claim por invocación, tenant en cada consulta y `leaseIsCurrent` inmediatamente antes de transporte; no permitir IDs de tenant/outbox del body.
6. Activación de SQL candidata y proveedor externo **por puertas separadas** con autorización, migración/rollback y E2E medido. Hacer revisión de seguridad de red, replay, revoke-vs-send, estado ambiguo ACK, reintentos a 23h, delivery/bounces y auditoría sin token ni body.
7. Solo después habilitar la aceptación R2-A6-6 contra Auth email confirmado, uso único de token y RLS, con pruebas iPhone Safari PWA y Android nativo. El correo externo inicial debe ir exclusivamente a buzón de prueba propio aprobado.

## Evidencia

- [Deno Edge / wrapper SDK real / 4 pruebas M2M #43713431842](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43713431842)
- [Vitest 381/381, web y Android #43713431820](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43713431820)
- [Checkpoint P6](checkpoints/CHECKPOINT_BT_AUTH_R2_A6_P6_20261115.md)

## Fuentes verificadas 15/11/2026

- [Supabase — Securing Edge Functions](https://supabase.com/docs/guides/functions/auth), documentación vigente de modos `auth: 'secret:<name>'`.
- [Supabase — Authorization headers](https://supabase.com/docs/guides/functions/auth-headers), diferencia entre `verify_jwt` plataforma y autorización SDK.
- [Supabase — Keys migration](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys), claves nominativas vs legadas.
- [Supabase CLI v3 breaking change](https://supabase.com/changelog/supabase-cli-v3), no se actualizó CLI ni modificó hospedado.

**Prohibiciones vigentes:** no entregar ni introducir clave en chat, GitHub, VITE, PWA o Expo. No registrar correos/clientes reales; no activar cron, SQL alojado, emails, pagos, registro público ni worker sin aprobación.
