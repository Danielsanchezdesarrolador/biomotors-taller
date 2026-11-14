# ByteTorque — BT-AUTH-01B-R1 · Orden de integración real: login y sesiones

**Fecha:** 14/11/2026 · **Estado:** orden aprobada para implementación con Codex; **código aún NO implementado por esta orden**.  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única** `main` · **Render actual:** https://biomotors-taller-demo.onrender.com.  
**Supabase exclusivo:** `biomotors-taller` (`suxcqqnmcjoezfxltoms`).

## 1. Fundamento comprobado al iniciar

- BT-CP02-D cerrado: 25/25 pruebas A/B PASS con JWT diferentes, limpieza comprobada; 0 usuarios, talleres y membresías al cierre. Security Advisor 0 avisos. Esto solo cubre las tablas iniciales; no autoriza datos reales.
- Configuración de Auth efectuada en el panel por el Director: `Site URL` y `Redirect URL` al Render existente; Email Provider y Confirm Email activados; mínima de contraseña 10; **Allow new users to sign up desactivado**. SMTP propio sin configurar; límite visible de emails Auth 2/h. Verificar de nuevo antes de pruebas de envío, no asumir correo funcional con clientes externos.
- `src/access/AccessScreens.tsx`: las pantallas premium están hechas, inputs desactivados salvo en revisión de QA, y solo hay `onReviewSubmit`; no realiza Auth. `src/App.tsx`: rutas por hash, revisión pública de administrador y mecánico sin datos privados. `src/access/accessContract.ts`: rutas oficiales y reglas de presentación. `package.json`: aún no incluye `@supabase/supabase-js`.
- Supabase contiene `workshops`, `profiles`, `workshop_memberships` con RLS. La función `bootstrap_workshop_owner` es invocable solo por servicio privilegiado. Edge `bt-owner-onboarding` desplegada pero **apagada** por `BYTETORQUE_ONBOARDING_ENABLED`; no tocar.

## 2. Alcance estricto R1

Implementar **login con correo y contraseña, lectura/validación de sesión, logout, lectura RLS de membresía activa y selección de taller**. **No crear cuentas**, no habilitar registro público, no enviar correos, no implementar recuperación de contraseña aún ni invitaciones, roles administrativos, permisos de escritura o tablas nuevas. Incluir controles y estados claros para estos flujos pendientes.

- Incorporar cliente oficial `@supabase/supabase-js` para frontend web, usando **solo** `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. En `.env.example` poner nombres/placeholder sin credenciales; no commitear secretos. Nunca cargar `sb_secret_`, `service_role`, ni contraseñas.
- Aplicar **flag de habilitación de R1** (p. ej. `VITE_BT_AUTH_R1_ENABLED`) **apagado por defecto**. En ausencia de configuración, conservar revisión pública, formulario real inactivo y mensaje preciso. La publicación en Render **no** enciende Auth hasta revisión y configuración explícita. No usar flag cliente para autorizar consultas: la autoridad sigue siendo Auth+RLS.
- Login `signInWithPassword`, validación de usuario con `getUser` y cambios de sesión mediante `onAuthStateChange`; manejar refresco, recarga y logout. Tras autenticación no basta comprobar que hay JWT: exigir correo confirmado y una fila `workshop_memberships` con `status = active` y `user_id` del usuario, consultada bajo RLS. Leer taller autorizado de `workshops`. Si existen dos talleres legítimos, solicitar selección explícita, sin permitir forzar UUID desde URL/query.
- Los roles comerciales reales son `owner | admin | mechanic | reception` en DB. El selector visual «Administrador/Mecánico» **no define permisos**; en R1, `owner/admin` podrán navegar al espacio oficial pero **sin operaciones de negocio reales**; `mechanic` únicamente a vista técnica sin datos privados ni OT hasta que exista asignación RLS; `reception` queda pendiente de definición con acceso restringido. Cualquier usuario sin membresía activa verá mensaje «Sin taller autorizado», no panel privado.
- Preservar `/#/revision/administrador`, `/#/revision/mecanico` y `/#/revision/publica` como **revisiones explícitamente DEMO** de solo lectura. No mostrar panel «autenticado» cuando se accede por estas rutas; no confundir banners. `/#/acceso/registro` no autoriza registro ni `signUp`; en recuperación, sin SMTP ni aprobación posterior, continuar honesto y no enviar correos.
- Manejar red no disponible, credenciales inválidas sin enumerar cuentas, correo sin confirmar, sesión vencida, acceso revocado, permisos insuficientes y carga inicial sin flash de contenido privado.
- UI responsive (375/390/768/1440/1650) y accesible: espera/disabled durante solicitud, estados `aria-live`, teclado/foco, input autocompletado apropiado y visibilidad de contraseña sin modificar datos sensibles. No incluir tokens ni emails personales en logs.
- Conservar diseño premium R2, logo original BT-BRAND, cinco paneles, inspección BT-INS-01, Android nativo, Supabase SQL/RLS y suscripciones intactos.

## 3. Seguridad y aislamiento

1. Nada de funciones `service_role` en navegador, repositorio, Render Static ni pruebas de CI.
2. No depender de `localStorage`, `user_metadata`, rol elegido visualmente, parámetro URL ni estado React como autorización. Supabase Auth/RLS determinan lo visible.
3. La persistencia de sesión de Supabase puede estar en almacenamiento local de navegador bajo su SDK, pero nunca guardar ahí credenciales, permisos «autorizados» o secretos; validar membresía en cada recuperación/reconexión antes de mostrar zona privada.
4. Tras cerrar sesión, no dejar datos privados en estado o caché. Reevaluar permiso de membresía al volver a foco/cambiar sesión/refrescar; en fases futuras, permisos de datos técnicos tendrán sus propias policies.
5. Atención a PWA y service worker: no almacenar en caché respuestas de autenticación, tokens, URLs de recuperación ni APIs Supabase.
6. Mantener prueba A/B previa intacta, con sus scripts; no crear usuarios de prueba durante el build público.

## 4. Pruebas y puertas de aceptación

- Una visita sin sesión abre login, no panel oficial privado.
- Sin variables/flag Auth, el comportamiento de revisión actual permanece funcional, con mensajes que no afirman acceso real.
- Credenciales erróneas no habilitan panel y muestran error genérico; la UI no enumera cuentas.
- Identidad válida **sin membresía** no accede a taller.
- Identidad con membresía **disabled** no accede a taller.
- Identidad `owner/admin` con membresía activa ve solo la identidad de su taller; sin guardar datos operativos y sin privilegios inventados.
- Usuario `mechanic` no accede a panel de administrador por seleccionar «Administrador».
- Cambio de taller exige pertenencia activa; un UUID ajeno se rechaza por RLS.
- Logout, recarga, refresh, sesión vencida y red interrumpida manejados sin flash ni contenido privado residual.
- Rutas públicas de revisión permanecen solo-lectura con banners correctos.
- Registro, invitaciones, correo externo, PDF real, pagos, backend y APK Android no se activan.
- Test unitarios con SDK mock/stubs y sin llamadas de red reales; pruebas de navegación y seguridad negativas; `npm run typecheck`, `npm test`, `npm run build`; capturas en los cinco anchos, CI y revisión de Render si se publica. **No declarar E2E real PASS** sin cuentas de prueba administradas por el Director.

## 5. Entregable Codex

1. Código implementado sobre `main`, sin ramas paralelas, con commits trazables.
2. Documentación de variables públicas y flag inicial desactivado; pasos exactos para configurar las variables en Render posteriormente, sin solicitar clave secreta al Director.
3. Evidencia de pruebas y capturas web/móvil; comprobar ausencia de diferencias no autorizadas en R2.
4. Actualización `roadmap.md`, `AGENTS.md` si es necesaria, y **checkpoint `docs/checkpoints/CHECKPOINT_BT_AUTH_01B_R1_20261114.md`**.
5. Reportar qué se verificó con mocks vs. sesiones reales, qué no se pudo probar, SHA del commit y estado de despliegue. No afirmar acceso real hasta pruebas físicas/funcionales y autorización del Director.

**Nota:** si los requisitos R1 no son viables sin ejecutar cambios en Supabase/Edge/Auth o registrar usuarios reales, detener solo ese subpaso y dejar el resto implementado y documentado para aprobación. No ampliar alcance automáticamente.
