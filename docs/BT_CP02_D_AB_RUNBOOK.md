# BT-CP02-D — Prueba auténtica de aislamiento A/B

**Estado:** script preparado; **no ejecutado todavía**. 22/22 controles estáticos SQL pasaron. Dos identidades Auth y talleres A/B aún no han sido creados.

## Script reproducible

`scripts/security/bt-cp02-ab.mjs` usa Node.js 22 y `fetch`, sin dependencias nuevas. Hace 25 pruebas con dos cuentas sintéticas, creadas mediante la **API oficial de Supabase Auth** con confirmación administrativa (no INSERT manual en `auth.users`). El JWT de cada cuenta se utiliza para todas las consultas de acceso. El rol de servicio solamente crea fixtures y los elimina en `finally`.

Las cuentas usan emails `@example.com` autoconfirmados; no se envían mensajes reales. No modifica UI, Auth pública, la Edge Function ni el esquema.

## Ejecución autorizada desde equipo confiable

El conector Supabase disponible **no tiene** creación de usuarios por Auth Admin; además, el contenedor de esta conversación no puede resolver dominios externos. Por ello no se han ejecutado las pruebas de JWT.

Para ejecución por operador en entorno seguro, definir variables de entorno (no guardarlas en GitHub ni enviarlas al chat):
- `SUPABASE_URL=https://suxcqqnmcjoezfxltoms.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` (clave pública de ByteTorque)
- `SUPABASE_SERVICE_ROLE_KEY` (clave administrativa, **nunca en frontend ni en archivos versionados**)
- `BT_CP02_AB_TEST=YES_CREATE_AND_DELETE_TEST_USERS`

Luego correr `node scripts/security/bt-cp02-ab.mjs`.

El script se niega a ejecutarse si el proyecto no coincide o no está presente la autorización explícita. Crea dos usuarios Auth y dos talleres ficticios, prueba accesos, borra usuarios con la API administrativa oficial y luego los talleres. Si hay caída/interrupción, verificar y limpiar cualquier fixture remanente antes de continuar.

## Criterios para declarar RLS A/B aprobado

Todos los controles deberán mostrar PASS; guardar solamente las líneas de resultados sin claves ni datos. Confirmar con consulta a Supabase que no quedan usuarios, perfiles, membresías ni talleres de prueba. Repetir el Security Advisor y comprobar cero hallazgos. Solo entonces evaluar habilitar registro y login bajo autorización.

**No habilitar `BYTETORQUE_ONBOARDING_ENABLED` aún.** Los cinco paneles de ByteTorque siguen en DEMO.

Nota: la suite no puede probar funcionalidades inexistentes (invitaciones de trabajadores, cancelación de suscripciones, documentos privados, tablas de clientes); se cubrirán en sus propias etapas.
