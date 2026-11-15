# ByteTorque — CP03: puerta única de activación y QA del piloto

**Fecha de preparación:** 15/11/2026. **Responsable de aprobar:** Director del proyecto. **Prioridad:** que Ignacio pueda crear, encontrar y corregir clientes/vehículos con persistencia auténtica. **No es un checkpoint de capacidad concluida.**

## Estado verificado

- Supabase `biomotors-taller`, proyecto `suxcqqnmcjoezfxltoms`, está `ACTIVE_HEALTHY` en PostgreSQL 17.11. En `public` existen únicamente `workshops`, `profiles` y `workshop_memberships`, todas con RLS. **No existen aún `customers` ni `vehicles` alojadas**.
- En `main` hay SQL candidata, repositorio Supabase JS, panel React y binding de ciclo Auth, pero **la app oficial todavía no los utiliza**. Las invitaciones de R2, correos y cobros continúan bloqueados.
- Evidencia sintética: [PG17 RLS #43732118545](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43732118545) PASS con bloqueo de taller suspendido, duplicado y aislamiento; [Web + Android #43732118518](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43732118518) PASS con **483/483 Vitest**. No equivale a un registro persistente en Supabase.
- Advertencia read-only de Security Advisor: **Leaked Password Protection Disabled**. Revisar en [Seguridad de contraseñas de Supabase](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No se modificó Auth.

## Primera autorización específica requerida: estructura de CP03, sin datos personales

El Director puede aprobar solamente la aplicación revisada de `docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql` al proyecto indicado. Esta aprobación **no autoriza** abrir formularios para clientes auténticos, desplegar Edge, enviar correos o crear usuarios.

Antes de ejecutar: validar identidad del proyecto y compatibilidad CP02; revisar exactamente SQL/GRANT/policies/RLS; comprobar si el plan ofrece un respaldo y restauración verificables antes de asumir recuperación; documentar el estado anterior; definir desactivación no destructiva. Si no es posible respaldar/recuperar, detener la instalación y elevar decisión.

Tras la instalación, solo si está autorizada: verificar tablas, índices, FK compuesta cliente-vehículo, roles, `SELECT` y `INSERT/UPDATE` autorizados y acceso `DELETE` negado a `authenticated`; ensayar A/B con cuentas sintéticas y suspensión del taller. Ante cualquier error, dejar CP03 apagado; no borrar fichas/tablas automáticamente.

## Segunda autorización independiente: activar el uso piloto

Aprobar la misma sesión Auth ya verificada para la vista CP03; montar su binding solo al confirmar identidad, correo, membresía, taller y rol. Desmontar y eliminar fichas en memoria ante `checking`, pérdida de red, logout, cambio de taller o expiración. No introducir secretos de servicio ni segunda sesión independiente en PWA/Android.

**Antes de usar datos auténticos:** definir información al cliente, finalidad, responsabilidad de tratamiento, conservación, duplicación de fichas y procedimiento de corrección. La casilla de UI no acredita por sí sola consentimiento o base legítima. Revisar aviso de seguridad Auth y autorización de Ignacio.

## Prueba final única para cerrar CP03

Con fichas **sintéticas expresamente autorizadas** en el backend: crear cliente, agregar vehículo, buscar por patente con/sin guion, teléfono y nombre, editar contacto, regresar desde otra sesión y recuperar ambos IDs. Repetir en iPhone Safari/PWA y escritorio, verificar sesiones cambiadas, datos cruzados A/B denegados, rol mecánico solo lectura, conflicto de edición y RLS en taller suspendido. Comprobar errores de conexión sin ocultar una escritura posiblemente aceptada; nunca repetir automáticamente una creación que puede duplicarse. Registrar evidencia de respuestas reales y conformidad de Ignacio/Director; **solo entonces** marcar CP03 completado y producir checkpoint de capacidad.

**Autorización pendiente hoy:** sin permiso específico para SQL alojado ni datos reales. Se preserva `main`, PWA iOS/web y Android nativo separado. No avanzar comercialización CP07–CP09.
