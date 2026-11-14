# BT-CP02-D — Prueba auténtica de aislamiento A/B

**Estado:** script preparado; **no ejecutado todavía**. 22/22 controles estáticos SQL pasaron. Dos identidades Auth y talleres A/B aún no han sido creados.

## Script reproducible

`scripts/security/bt-cp02-ab.mjs` usa Node.js 22 y `fetch`, sin dependencias nuevas. Hace 25 pruebas con dos cuentas sintéticas, creadas mediante la **API oficial de Supabase Auth** con confirmación administrativa (no INSERT manual en `auth.users`). El JWT de cada cuenta se utiliza para todas las consultas de acceso. La clave secreta del backend solamente crea fixtures y los elimina en `finally`. Las claves `sb_secret_...` se envían exclusivamente por el encabezado `apikey`, nunca como JWT `Authorization: Bearer`.

Las cuentas usan emails `@example.com` autoconfirmados; no se envían mensajes reales. No modifica UI, Auth pública, la Edge Function ni el esquema.

## Ejecución autorizada desde equipo confiable

El conector Supabase disponible **no tiene** creación de usuarios por Auth Admin; además, el contenedor de esta conversación no puede resolver dominios externos. Por ello no se han ejecutado las pruebas de JWT.

Para ejecución por operador en entorno seguro, definir variables de entorno (no guardarlas en GitHub ni enviarlas al chat):
- `SUPABASE_URL=https://suxcqqnmcjoezfxltoms.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` (clave pública de ByteTorque)
- `SUPABASE_SECRET_KEY` (`sb_secret_...`, clave administrativa moderna, **nunca en frontend ni en archivos versionados**). Alternativa temporal compatible: `SUPABASE_SERVICE_ROLE_KEY` heredada.
- `BT_CP02_AB_TEST=YES_CREATE_AND_DELETE_TEST_USERS`

Luego correr `node scripts/security/bt-cp02-ab.mjs`.

El script se niega a ejecutarse si el proyecto no coincide o no está presente la autorización explícita. Crea dos usuarios Auth y dos talleres ficticios, prueba accesos, borra usuarios con la API administrativa oficial y luego los talleres. Si hay caída/interrupción, verificar y limpiar cualquier fixture remanente antes de continuar.

## Criterios para declarar RLS A/B aprobado

Todos los controles deberán mostrar PASS; guardar solamente las líneas de resultados sin claves ni datos. Confirmar con consulta a Supabase que no quedan usuarios, perfiles, membresías ni talleres de prueba. Repetir el Security Advisor y comprobar cero hallazgos. Solo entonces evaluar habilitar registro y login bajo autorización.

**No habilitar `BYTETORQUE_ONBOARDING_ENABLED` aún.** Los cinco paneles de ByteTorque siguen en DEMO.

Nota: la suite no puede probar funcionalidades inexistentes (invitaciones de trabajadores, cancelación de suscripciones, documentos privados, tablas de clientes); se cubrirán en sus propias etapas.

## Compatibilidad de claves actualizada — 14/11/2026

Supabase presenta **Publishable Keys** y **Secret Keys**. Utilizar `SUPABASE_PUBLISHABLE_KEY=sb_publishable_...` y `SUPABASE_SECRET_KEY=sb_secret_...` exclusivamente como variables de entorno de la sesión local de PowerShell. El script ya soporta esa combinación; también mantiene compatibilidad transitoria con la clave `service_role` JWT heredada si existe. Nunca pegar valores de las claves en chat, capturas, archivos del proyecto, comandos literales o terminal grabada. La clave moderna debe ir en el encabezado `apikey`, no como Bearer JWT.

Antes de ejecutar, validar que solo existan fixtures de prueba y confirmar el control de ejecución `BT_CP02_AB_TEST`. Ejecutar una sola vez, sin compartir sus secretos. El acceso a Auth Admin debe realizarse desde una máquina de confianza.

## Resultado de ejecución real — 14/11/2026 (Chile)

El Director ejecutó desde PowerShell en su PC `scripts/security/bt-cp02-ab.mjs` utilizando dos cuentas **ficticias** creadas mediante Supabase Auth Admin y tokens JWT de cada usuario. La captura suministrada en la conversación muestra **PASS 1 a PASS 25** y el mensaje `RESULTADO: 25 pruebas A/B PASS`, seguido de la solicitud de limpieza.

La auditoría independiente posterior mediante Supabase confirmó **0 registros** en `auth.users`, `auth.sessions`, `public.workshops`, `public.profiles` y `public.workshop_memberships`; RLS habilitado en las tres tablas y Security Advisor con **0 hallazgos**. No se copiaron ni almacenaron claves, tokens o información personal en este repositorio.

**Pruebas del núcleo A/B cerradas.** La función Edge de onboarding público continúa sujeta a autorización y controles específicos (email, antiabuso, cupos, invitaciones, sesiones y recuperación). Las nuevas tablas operativas y Storage necesitarán políticas y pruebas multitenant propias; no derivar seguridad de su creación solo por este resultado.

Ver `docs/checkpoints/CHECKPOINT_BT_CP02_D_AB_PASS_20261114.md`.
