# ByteTorque 1.0 — BT-AUTH-01: Acceso seguro y perfiles Administrador / Mecánico

**Fecha:** 14/11/2026 · **Estado:** diseño y orden de implementación aprobados para preparación; autenticación real, verificación de correo y permisos de servidor **NO implementados ni habilitados** en este documento.  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`; única rama `main`.  
**Base inspeccionada:** `037c4a910c23425fea79832cc1edaa2b8484362b`.  
**Frontend publicado:** BT-OFICIAL-01A: cinco paneles R2 vacíos y operaciones deshabilitadas; no hay login real.  
**Dependencia bloqueante para producción:** BT-CP02-D real de dos talleres A/B, reservado expresamente a otro chat. **No ejecutar esa prueba aquí.**

## 1. Solicitud del Director

Diseñar un inicio de sesión con verificación de correo y dos accesos visibles: **Administrador del taller** y **Mecánico**. El administrador debe gestionar el taller y el mecánico trabajar en el multipunto y funciones técnicas restringidas. El primer taller será BIOMOTORS; ByteTorque debe seguir siendo SaaS multitenant y no transferir privilegios entre talleres.

**Regla central:** las dos opciones son rutas de experiencia de usuario, no roles autodeclarados. En ambos casos Supabase Auth valida la identidad, el correo verificado y la membresía `public.workshop_memberships` activa. El servidor/RLS determina finalmente el rol real para ese taller; jamás el botón elegido, `localStorage`, `user_metadata` o un valor editable en React.

## 2. Diseño R2: portada y rutas

**Portada de acceso:** marca ByteTorque con paleta R2, encabezado «Bienvenido a ByteTorque», subtítulo claro, dos tarjetas grandes táctiles:
- «Ingresar como administrador» — «Gestiona las operaciones de tu taller».
- «Ingresar como mecánico» — «Revisa órdenes asignadas e inspecciones».

Después de seleccionar se abre el mismo componente de credenciales (correo electrónico + contraseña), con título contextual y opción «Cambiar tipo de acceso». Ofrecer «Olvidé mi contraseña», aviso de correo no verificado, reenvío de verificación de forma limitada y «Volver». No mostrar enlaces de registro libre de mecánicos. Acceso/alta de propietario es flujo protegido aparte.

**Rutas propuestas** (ajustar al router real sin crear dependencia innecesaria): `/acceso`, `/acceso/administrador`, `/acceso/mecanico`, `/auth/confirmacion`, `/auth/recuperacion`. Mantener lectura/navegación de interfaz oficial durante desarrollo; no reemplazar la web por un login que funcione como falsa puerta sin backend.

**Flujos de estado:** sin sesión → identidad y correo por confirmar → consulta membresía activa → selección de taller solo si tiene varias membresías → shell del rol autorizado. Estados de error: credenciales inválidas (genérico), correo no confirmado, invitación pendiente/vencida, membresía desactivada, falta de permisos, demasiados intentos, red no disponible, sesión expirada. Accesibilidad teclado/foco, controles >=44px, mensajes `aria-live`, respuesta sin divulgar si una cuenta existe.

## 3. Alta del administrador y correo

1. El propietario crea cuenta únicamente a través del alta segura autorizada después de BT-CP02-D; **no** mediante «Registrarme como administrador» libre.
2. Supabase Auth gestiona correo y contraseña, verificación por email, recuperación y sesiones. Solo abrir panel después de correo confirmado y membresía `owner` o `admin` activa en su taller.
3. `bt-owner-onboarding` **ya está desplegada pero apagada** por `BYTETORQUE_ONBOARDING_ENABLED`. No encender aquí. Su flujo requiere JWT confirmado, comprobación de email y operación controlada `bootstrap_workshop_owner`; no aceptar `user_id/role/workshop_id` del navegador.
4. Ajustar Site URL/redirect allowlist, plantilla de confirmación y reset cuando se apruebe la integración. El correo transaccional de Auth para **verificar al personal** es distinto del BT-COM-01 que enviará documentos a clientes. Probar enlaces Safari PWA y más adelante Android nativo.
5. Exigir aprobación de la prueba A/B y configuración de remitente/rate limits antes de usar correos reales.

## 4. Alta y acceso de mecánicos

1. Propietario o administrador **con permiso de gestionar equipo** invita desde Configuración → Usuarios, indicando correo y rol **mecánico** para su taller.
2. El enlace de invitación es único, aleatorio, temporal, revocable y de uso limitado; la verificación de correo prueba que controla ese buzón, **no** que tenga acceso a otros talleres.
3. El mecánico completa la invitación y confirma correo; al acceder, el servidor comprueba membresía activa `mechanic` en el taller correspondiente. No hay autoregistro de mecánico con acceso a datos.
4. Si el mecánico elige visualmente «Administrador», se deniega con mensaje adecuado; no se concede rol ni se muestran datos administrativos.
5. El propietario puede revocar/desactivar membresía; sesiones y tokens existentes requieren estrategia de revocación para operaciones sensibles. No basta con ocultar un botón.

**Nota:** en la base aplicada ya existen `workshops`, `profiles`, `workshop_memberships` con roles `owner|admin|mechanic|reception`; **todavía NO** existe el flujo completo de invitaciones/assignments. Diseñarlo, validar migraciones por separado y no afirmar que está listo.

## 5. Permisos propuestos (sujetos a decisión de producto)

| Operación | Propietario | Administrador taller | Mecánico |
|---|---|---|---|
| Ver clientes, vehículos y OT de su taller | Todo | Todo autorizado | Solo datos mínimos de OT asignadas |
| Crear/gestionar fichas, recepción y OT | Sí | Sí | No |
| Consultar OT y modificar estado técnico asignado | Sí | Sí | Sí, solo propias |
| Completar/editar multipunto asignado | Sí | Sí | Sí |
| Agregar observaciones/fotos de diagnóstico asignado | Sí | Sí | Sí |
| Marcar trabajos efectivamente realizados en OT asignada | Sí | Sí | Sí, con trazabilidad |
| Precios, partidas económicas, IVA, cotizaciones, respuestas y envío | Sí | Sí según facultad administrativa concedida | No |
| Cierre/entrega documental de visita | Sí | Sí según facultad administrativa | No |
| Taller: identidad, branding y preferencias | Sí | Según delegación | No |
| Invitar/desactivar mecánicos | Sí | Solo delegación de gestión de usuarios | No |
| Suscripción, titularidad, transferencia/último owner | Titular, proceso seguro | No por mero rol | No |
| Otro taller o consola SaaS global | Nunca por defecto | Nunca por defecto | Nunca por defecto |

**Propuesta de pantalla de mecánico:** «Mis órdenes» (solo asignadas y mínimas) → «Inspección multipunto» → «Observaciones y fotografías» → «Trabajos realizados» → «Guardar/Finalizar según habilitación». Sin cotizaciones, importes, configuración general, base completa de clientes, otros mecánicos o facturación. La asignación de OT es otra fuente de autorización de servidor: rol `mechanic` sin asignación no permite leer todas las OT del taller.

**Propietario ≠ administrador de la plataforma:** incluso el propietario tiene control completo solo dentro de su taller. Mantener protecciones ya acordadas de titularidad, suscripciones y facultad de dar roles administrativos.

## 6. Arquitectura y seguridad necesarias

- Supabase Auth: autenticación y correos verificados, URLs de retorno controladas, recuperación segura de contraseña, logout, errores genéricos, rate limiting, protección antiautomatización.
- La fuente autoritativa de rol es `workshop_memberships` respaldada por RLS y reglas de negocio, nunca `user_metadata` editable. Permisos adicionales en tablas/servidor. JWT `app_metadata` puede usarse solo con manejo de caducidad/refresco, no como sustituto de una membresía activa.
- RLS en cada tabla privada y Storage (incluidas lecturas, inserciones, ediciones y referencias cruzadas), asignación de mecánico a OT y segregación por `workshop_id`; consultar también grants SQL. Evitar `TO authenticated` sin predicado de usuario/taller; `UPDATE` con `USING/WITH CHECK`.
- Toda consulta API, archivo y documento verifica rol real y taller; probar manipulación de URL, token, taller, rol local, endpoints, inspección, fotografías y documentos. No exponer secrets ni service_role.
- El lado visual puede ocultar secciones según permisos, pero no constituye seguridad. Si no hay sesión válida o backend operativo, acceso operativo bloqueado y aviso de preparación honesto.

## 7. Secuencia de implementación recomendada

**BT-AUTH-01A — Pantallas y contratos sin backend:** Codex crea componente de acceso R2 con dos entradas, credenciales, estados vacíos, recuperar/confirmar correo y contratos de rol puros/testeables; no conectar Auth, no realizar correos, no dar acceso ficticio a los cinco paneles, no publicar una falsa pantalla de login funcional. Se puede conservar la interfaz pública de preparación y previsualizar el componente por tests/harness interno. Desplegar solo con copy explícito «Acceso en preparación», y tras aprobación visual.

**Puerta obligatoria externa:** en el chat reservado BT-CP02-D ejecutar los 25 tests A/B con usuarios reales de prueba, consultar Security Advisor, verificar limpieza de fixtures, aprobación expresa. No hay forma segura de saltarla por haber diseñado el login.

**BT-AUTH-01B — Autenticación real:** con la puerta aprobada, configurar Supabase Auth verificación/recuperación, redirects/emails y sesión; primero propietario/administrador, después invitación/revocación de mecánicos, después RLS sobre datos técnicos y OT asignadas. Mantener deshabilitadas las acciones sin backend persistente. Nunca autoproclamar usuario owner al registrar.

**BT-AUTH-01C — Perfiles operativos:** entregar paneles completos del taller (sujeto a datos reales), menú reducido para mecánicos y acciones asignadas; pruebas reales de permisos y traspasos, Safari físico y futura paridad React Native Android. Conectar luego persistencia de clientes/OT/inspección; no antes.

## 8. Pruebas obligatorias

- Admin inicia con correo verificado y membresía activa del taller; acceso completo solo dentro de sus permisos reales.
- Mecánico invitado/confirmado: solo OT asignadas, multipunto, observaciones y registro técnico.
- Mecánico elige entrada Administrador o fuerza URL de cotizaciones: **denegado por backend**.
- Usuario sin membresía, desactivado, correo no verificado, invitación vencida/ajena: **denegado**.
- A mecánico A se le asigna OT de A; intenta OT de B u otra de A no asignada: **denegado**.
- Owner no puede perder el último propietario, y admin no puede elevarse/transferir titularidad.
- Logout, sesión expirada, reset, confirmación de correo y enlaces abiertos en Safari correctamente; no redirigir a otra app/dominio inesperado.
- Resistencia a fuerza bruta, correos duplicados/reintentos, proveedor fallido, verificación inválida, doble invitación, revocación.
- Regresión de los cinco paneles R2, 111 pruebas actuales, build/PWA y cinco tamaños. En modo público sin backend no permitir datos reales ni escribir/mostrar un rol inventado.

## 9. Referencias e invariantes

- `docs/BT_CP02_ARQUITECTURA_AUTH_RLS.md`, `docs/MATRIZ_ROLES_Y_PERMISOS.md`, `docs/BT_CP02_D_AB_RUNBOOK.md`, `docs/checkpoints/CHECKPOINT_BT_CP02_D_20261112.md`, `docs/BT_OFICIAL_01_TRANSICION_PRODUCTO.md`, `docs/checkpoints/CHECKPOINT_BT_OFICIAL_01A_20261114.md`, `AGENTS.md`, `roadmap.md`.
- Consultar docs oficiales y changelog antes de modificar Supabase. Confirmación de email Supabase: https://supabase.com/docs/guides/auth/passwords; redirecciones: https://supabase.com/docs/guides/auth/redirect-urls; alternativa por código/OTP: https://supabase.com/docs/guides/auth/auth-email-passwordless.
- Mantener `main` solamente y Render existente; no activar `bt-owner-onboarding`, Supabase/migraciones/Auth/RLS, secretos, correos, planes, pagos ni BT-COM-01 en 01A.
- Registrar en checkpoint si lo realizado es **diseño, UI, Auth real, permiso RLS, prueba A/B, despliegue y uso físico**, sin confundir fases.

**Decisión pendiente para el Director:** confirmar si el administrador delegado también podrá gestionar usuarios y cerrar entregas, o si esas facultades se reservan al propietario. Hasta entonces aplicar principio de mínimo privilegio; nunca asumir facultades sensibles por nombre del rol.
