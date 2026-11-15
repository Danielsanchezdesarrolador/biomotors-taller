# ByteTorque — BT-AUTH-R2-A5 · Vista de invitación segura y límites de frecuencia

**Fecha:** 14/11/2026 (Chile).  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · rama única `main`.  
**Estado:** pantalla de preparación y laboratorio SQL; **NINGUNA invitación ni aceptación operativa habilitada**.

## Continuidad y premisas

- R1 aprobado por el Director; los cuatro usuarios y cuatro permisos de prueba deben permanecer.
- R2-A4 CI aprobado (280/280 pruebas, Deno typecheck). SMTP, migraciones R2 y endpoints de invitaciones continúan sin deploy.
- Enlace previsto: `/#/auth/aceptar-invitacion?token=<token>`, con token de 256 bits generado en backend, pero **NO enviar enlaces ni habilitar esta ruta como alta de usuario real hasta integrar aceptación**.

## Implementación R2-A5

### Pantalla de invitación iPhone / web — sin alta

1. `src/auth/InviteAcceptancePreview.tsx` y `src/auth/inviteAcceptance.css`: pantalla móvil premium con logo, tres pasos explicados y aviso de que el acceso aún no está habilitado. Botón que vuelve al login de mecánicos; no contiene formulario, alta, envío de credenciales o acciones operativas.
2. `src/auth/inviteLinkRouting.ts`: reconoce enlaces de invitación y **elimina el fragmento y la query** antes de renderizar la vista. **No almacena el token** ni en React state, localStorage, sessionStorage, caché ni logs; por estar inoperativo, actualmente descarta por completo el token.
3. `src/main.tsx`: ejecuta limpieza antes de `createRoot` para impedir que el token permanezca en la URL durante el montaje.
4. `src/App.tsx`: además sanea links al navegar o cambiar el hash en una pestaña ya abierta y sirve la vista de invitación bloqueada.
5. `src/auth/inviteLinkRouting.test.tsx`: pruebas de fragmentos, parámetros de URL, rutas ajenas, limpieza sin retención, contenido de vista sin token y sin acción de aceptación.
6. `scripts/verify-r2-invite-ui.cjs`: prueba Chromium en 375, 390, 768 y 1440 píxeles: URL limpia, no desborde, sin POST/PUT/PATCH, sin almacenamiento persistente, hashchange saneado, acceso de salida; captura móvil y escritorio.
7. `.github/workflows/bt-oficial-01.yml`: ejecuta la prueba de navegación visual y conserva artefactos de screenshots.

**Aviso:** el link de ejemplo solo debe usarse con tokens completamente ficticios durante QA. La aceptación real requerirá otro diseño aprobado para manipular el token efímeramente en memoria, limpiar URL inmediatamente y probar Safari real; esta pantalla explícitamente NO puede aceptar tokens.

### Throttling durable en propuesta SQL privada — NO aplicada al proyecto

1. `docs/sql/BT_AUTH_R2_A5_RATE_LIMIT_CANDIDATE.sql`: tabla privada `bt_private.mechanic_invite_attempts`, RLS y grants únicamente para `service_role`, sin IP, correos ni token. RPC `bt_r2_take_mechanic_invite_rate_slot` `SECURITY INVOKER` solamente accesible por backend. Contadores transaccionales con `ON CONFLICT`, agrupados por actor/taller/ventana.
2. Límites candidatos de laboratorio: **invitar 5/hora por actor y taller**, **aceptar 10 intentos/15 minutos por actor global**, **revocar 10/hora por actor y taller**. Nadie desde navegador decide ni altera esos límites.
3. `scripts/security/bt-r2-lab-rate-assertions.sql`: permisos negados anon/authenticated, RLS, límites 5+1 y 10+1, separación de actores/talleres, entradas inválidas y rollback transaccional.
4. `scripts/security/bt-r2-lab-rate-concurrency.sh`: dos sesiones compiten por la quinta plaza disponible en la ventana: uno permitido, sexto rechazado. Incorporado al laboratorio `bt-auth-r2-postgres-lab.yml`.
5. Primer candidato SQL rechazó `pg_catalog.extract(epoch FROM ...)` por sintaxis. Se corrigió a `EXTRACT(epoch FROM ...)` y el workflow completo [43664903467](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43664903467) terminó SUCCESS. La prueba simultánea añadida después debe quedar aprobada solo si el nuevo workflow reporta SUCCESS.

**Límites de protección no implementados:** el throttling SQL aún NO se conecta a los endpoints y no bloquea producción. Antes de habilitar, se requieren límites por IP/dispositivo/WAF, antispam por destinatario (hash o presupuesto de envíos), reintentos, outbox de mensajes, expiración, política de retención (p.ej. borrar buckets después de 7 días), proveedor de email autorizado y validación Auth de cada solicitud.

## Evidencia CI y límites de certificación

- Vitest de saneamiento de enlace y pantalla de revisión: [workflow 43664695428](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43664695428) SUCCESS.
- PostgreSQL 17 + SQL de throttling tras corregir EXTRACT: [workflow 43664903467](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43664903467) SUCCESS.
- CI navegador y prueba simultánea: verificar el workflow del HEAD actual y añadir resultados finales cuando correspondan, no suponerlos aprobados.

## Cierre del perímetro

- No alterados `public.workshops`, `public.profiles`, `public.workshop_memberships`, ni 4 cuentas de Auth.
- Sin configuración de SMTP, emails, pagos, alta pública ni datos reales.
- Los tres endpoints de invitar, aceptar y revocar siguen bloqueados con 503 aun al activar su bandera. La pantalla de aceptación no confiere privilegios.
- Mantener `VITE_BT_AUTH_R1_ENABLED=false` en Render.
- Aviso preexistente de Supabase: protección contra contraseñas filtradas desactivada antes del lanzamiento.

## Próxima fase: R2-A6

1. Certificar visualmente con screenshots que la ruta de invitación no tiene desbordes y elimina token en Chromium; luego QA Safari físico, sin usar tokens reales.
2. Revisar/autorizar diseño de API real con Auth, cuota y rate limit transaccionales, y **outbox de email** para no reservar invitaciones inutilizables ante falla SMTP.
3. Integrar un proveedor de correo transaccional aprobado y ruta de aceptación con token en memoria (no persistente), con configuración y pruebas antiabuso. 
4. Solo después solicitar autorización explícita para migrar tablas y desplegar funciones a Supabase hospedado.
