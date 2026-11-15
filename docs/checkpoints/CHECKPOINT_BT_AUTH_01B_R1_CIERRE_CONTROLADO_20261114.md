# ByteTorque — BT-AUTH-01B-R1 · Cierre controlado de fixture y estado de pruebas

**Fecha local de cierre:** 14/11/2026 (Chile).  
**Repositorios y entorno:** `Danielsanchezdesarrolador/biomotors-taller`, rama única `main`; Supabase `biomotors-taller` (`suxcqqnmcjoezfxltoms`).  
**Clasificación:** cierre operativo de la ronda acelerada R1; **no es autorización de lanzamiento público ni certificación completa de renovación automática en Chrome**.

## Evidencia aportada y verificada

1. **Doble rol y selector A/B:** el Director confirmó en el chat las cinco comprobaciones visuales en Chrome: inicio con cuenta de recepción, Administrador B, F5, cambio a Recepción A restringida y cierre de sesión.
2. **API Auth/RLS, 12/12 PASS:** el Director aportó captura de PowerShell con `RESULTADO: 12/12 PASS. Sin escrituras operativas.` Se verificaron identidad Auth, solo dos talleres/membresías propias, separación de perfiles y roles, `refreshSession()` forzado y RLS posterior. El script cerró su sesión local. **Este resultado ocurrió antes de retirar el permiso temporal; no reejecutar el script A/B después de este cierre**, pues el fixture ya no contiene dos roles.
3. **iPhone físico:** el Director confirmó las cinco verificaciones de la PWA instalada desde Safari: apertura sin barra convencional, identidad visual, navegación, adaptación de tamaños y reapertura. Prueba de experiencia DEMO; no prueba Auth real en Render.
4. **Renovación automática de Chrome:** **pendiente de confirmación**. La captura del navegador con filtro `refresh_token` no mostraba solicitudes nuevas. Logs de Supabase mostraron un `POST /auth/v1/token?grant_type=refresh_token` de navegador con estado HTTP 200 el 15/11/2026 00:25:14 UTC (14/11, 21:25 Chile), pero **no acreditan que la renovación fuera automática ni que fuera la sesión observada**. El script 12/12 prueba solo renovación explícita. El frontend usa `autoRefreshToken: true`; la configuración del código no sustituye prueba E2E.
5. **Cierre de sesión previo a la reversión:** el Director confirmó `sesion cerrada` en el chat. No se conserva evidencia separada del F5 posterior.

## Reversión exacta de membresía temporal — EJECUTADA Y VERIFICADA

Antes de ejecutar se consultó el registro y coincidieron **ID, usuario, taller B, rol admin y estado activo**.

Se ejecutó una sola eliminación exacta en `public.workshop_memberships` con los siguientes predicados, tal como quedó prevista en el runbook:

- ID de la membresía: `005d0348-fda0-4dc7-ba16-3b5708200e5b`
- Usuario ficticio de recepción: `f1b1ee14-7f89-4352-b7cd-263979a2f6f0`
- Taller B: `e7b4fc0c-6966-4039-b33c-84545119e36d`
- Rol `admin`, estado `active`.

`DELETE ... RETURNING` confirmó **una única fila eliminada**. Una nueva consulta confirmó que el ID ya no existe (0 filas), hay **4 membresías activas**, **2 talleres** y **4 usuarios Auth** (ningún usuario eliminado). La cuenta de recepción conserva **solo una membresía**.

Membresías restantes, todas activas:

| Taller | Tipo de cuenta ficticia | Rol |
| --- | --- | --- |
| A | Propietario A | `owner` |
| A | Mecánico A | `mechanic` |
| A | Recepción | `reception` |
| B | Propietario B | `owner` |

Se verificó `rowsecurity=true` en `public.workshops`, `public.workshop_memberships` y `public.profiles`. No hubo modificación de RLS, esquemas, Auth, credenciales, funciones ni datos operativos.

## Seguridad y límites del cierre

- Sin registro público, Auth real en Render, pagos, correo o escritura operativa. Mantener `VITE_BT_AUTH_R1_ENABLED=false` para la publicación hasta autorización expresa.
- El aviso del Security Advisor de Supabase sobre **protección contra contraseñas filtradas desactivada** queda pendiente de revisión antes del lanzamiento: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- La verificación de aislamiento A/B/12 PASS y PWA iPhone quedan aceptadas, sin extrapolarlas a escrituras de órdenes, clientes, informes, suscripciones o a Android.
- **No declarar la renovación automática en Chrome aprobada** ni el onboarding público listo. Próxima validación E2E de refresh normal, con sesión ficticia autorizada, sin restituir el rol temporal B salvo autorización explícita.
- Mantener las cuatro cuentas ficticias hasta una decisión separada de eliminar fixtures de R1; no eliminarlas como consecuencia de este checkpoint.
- Después de eliminar permisos, una sesión/token previamente emitido puede continuar vigente brevemente; la RLS y la revalidación de membresías gobiernan el acceso. El cierre local del Director se realizó antes de revertir.

## Próxima etapa sugerida

1. Realizar la observación de renovación automática con un propietario ficticio en Chrome, conservando registro Network y sin inspeccionar/compartir tokens. No reutilizar script 12/12 que presupone doble membresía.
2. Resolver advertencia de contraseñas filtradas en Supabase antes de abrir registro real.
3. Mantener foco en autorización y persistencia R2 solo después de una revisión de seguridad; no iniciar datos de clientes reales sin aprobación.

**Resultado administrativo:** permiso temporal B revertido sin alterar los cuatro permisos legítimos de prueba; ronda R1 cerrada en cuanto a fixture y limpieza, **con prueba de renovación automática pendiente**.
