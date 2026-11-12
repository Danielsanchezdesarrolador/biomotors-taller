# ByteTorque — BT-CP02 · Arquitectura Auth, talleres y RLS

**Fecha:** 11/11/2026  
**Estado:** propuesta técnica y auditoría de solo lectura; **NO hay autenticación ni RLS reales implementadas**.  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · `main`  
**Backend previsto:** Supabase independiente `biomotors-taller` (identificador por verificar).  
**Frontend:** React/Vite Web + Safari PWA; Android React Native/Expo conserva su proyecto separado dentro del repositorio.

## 1. Hallazgos verificados

- La raíz del proyecto **no tiene `@supabase/supabase-js` como dependencia** y los módulos operan con fixtures/local state.
- La Configuración utiliza un contexto DEMO `workshop-demo` / `owner-demo` y validaciones locales para evitar incoherencias. Esto **no constituye autorización segura**.
- No se observaron migraciones `supabase/` ni estructura de backend dentro del árbol de GitHub `main`.
- El conector Supabase disponible **no devuelve el proyecto de ByteTorque** en su inventario actual; sí aparece otro proyecto que **no debe modificarse**.
- Hasta que el proyecto correcto sea accesible, **no se pueden auditar tablas ni políticas reales**, ni certificar aislamiento, correo, documentos o respaldo.

## 2. Principios vinculantes

1. Todo taller es un **tenant** independiente identificado con UUID interno `workshop_id`.
2. Identidad de usuario ≠ pertenencia al taller: `auth.users.id` identifica a la persona; una tabla de membresía expresa **qué taller** y **con qué permisos** puede usar.
3. El frontend puede elegir un taller solo entre sus membresías activas; no confiar en un `workshop_id` procedente de URL, formulario, estado React o JWT modificable por el cliente.
4. El servidor y PostgreSQL/RLS deben comprobar permisos en cada operación. **`TO authenticated` sin comprobación de membresía es insuficiente**.
5. Todos los planes (Básico, Plus, Full) tendrán el mismo estándar de seguridad. La suscripción solo habilitará capacidades comerciales autorizadas.
6. Las credenciales administrativas, service role/secret API keys, correo y pagos jamás se publican en Vite/PWA ni en Android; los clientes usarán una **clave publicable** y sesiones limitadas.
7. Las políticas deben proteger lectura, inserción, modificación, eliminación y referencias cruzadas entre talleres; no basta con probar la navegación.

## 3. Modelo mínimo propuesto — revisar antes de migrar

| Tabla / recurso | Clave / relaciones | Uso |
|---|---|---|
| `auth.users` | Identidad Supabase gestionada por Auth | Credenciales, email verificado, sesiones |
| `profiles` | `user_id` único → `auth.users.id` | Nombre para mostrar y preferencia personal; sin privilegios |
| `workshops` | UUID `id`; nombre; estado; marca temporal | Unidad de negocio |
| `workshop_memberships` | `(workshop_id, user_id)` únicos, rol y estado | Fuente de autorización de usuarios por taller |
| `workshop_settings` | `workshop_id` único | Datos y preferencias del taller |
| `workshop_branding` | `workshop_id` único | Identidad y logotipo propio |
| `workshop_audit_events` | Evento, actor, tenant, fecha y resultado | Trazabilidad de cambios sensibles |
| `workshop_invitations` | Token hasheado, taller, rol, expiración, uso | Invitar empleados bajo rol permitido |
| `workshop_registration_invites` | Token hasheado, taller, vigencia, revocación | Registro público específico del cliente, **sin acceso a otros datos** |

**Siguientes CP:** `clients`, `vehicles`, `work_orders`, `inspections`, `observations`, `documents` y `subscriptions` se crearán cuando toque, con `workshop_id` explícito y FK compuestas para evitar asignar un cliente de un taller a una orden de otro. Proteger registros históricos, sin eliminarlos por vencimiento comercial.

**Perfiles de rol:** `owner`, `admin`, `mechanic`, `reception`. La tabla de membresías, no `user_metadata`, es fuente de verdad. El rol nunca será editable libremente desde el cliente.

## 4. Flujos de identidad y autorización

**Registro de propietario**
1. Crear identidad en Supabase Auth, verificando el email según política del proyecto.
2. Mediante operación transaccional **privilegiada y auditada**, crear `workshops` y una membresía `owner` sin permitir al cliente elegir arbitrary roles/owners.
3. Abrir la vista del taller solo después de comprobar membresía activa.
4. Proteger el último propietario y evitar transferencias de titularidad sin flujo dedicado.

**Ingreso de trabajador**
1. Propietario autenticado crea invitación específica para su taller, con rol permitido.
2. Invitación expira y puede revocarse; el email debe vincularse a usuario confirmado.
3. Al aceptar, el backend asocia una membresía al taller; no existe acceso a otros tenants.

**Acceso**
1. Login de correo/contraseña o método alternativo aprobado por Auth, con verificación y recuperación.
2. Consultar memberships activas y presentar selector solo si una persona pertenece legítimamente a más de un taller.
3. El contexto visual nunca reemplaza comprobación de DB/RLS por operación.
4. Configurar URL de regreso Auth en el Render actual y, **solo al registrar el dominio**, futura `bytetorque.cl`.
5. Desactivar membresía impedirá nuevas consultas; evaluar revocación efectiva de sesiones/token para acciones sensibles.

## 5. Diseño de seguridad RLS (CONCEPTUAL, sin SQL aplicado)

- `profiles`: lectura/edición del perfil del mismo `auth.uid()`; jamás usar perfil para conceder roles.
- `workshops`: lectura para membresías activas; modificaciones solo por owner/permiso comprobado en base de datos.
- `workshop_memberships`: lectura restringida a miembros autorizados según necesidad; cambios de roles e invitaciones mediante lógica administrativa verificada, no `UPDATE` arbitrario de un usuario sobre sí mismo.
- `workshop_settings` / `workshop_branding`: lectura del mismo taller bajo membresía activa; escritura solo por propietario o administrador con permiso explícito.
- Futuros datos operativos: para cada lectura/escritura, comprobar `row.workshop_id` asociado a membresía **activa** del usuario y validar el permiso de operación.
- Para mutaciones: RLS con `USING` y `WITH CHECK`; restringir columnas que jamás puede editar el cliente (por ejemplo `workshop_id`, dueño o rol propio).
- Políticas de membership pueden causar recursión cuando consultan su misma tabla: resolver con diseño revisado. Solo si es imprescindible, helper muy acotado en **esquema no expuesto**, con `search_path` fijo, privilegios mínimos, autorizaciones internas y auditoría; no agregar `SECURITY DEFINER` genérico en `public`.
- Storage de documentos y logos comerciales: buckets privados, rutas ligadas a `workshop_id`, policies `storage.objects` y enlaces firmados de corta duración cuando corresponda.
- Links públicos: token criptográfico de alta entropía, guardado en forma hasheada, expiración, límite de usos, antiabuso y validación en servidor. **No conceder SELECT público sobre clientes/vehículos/OT**.
- Las vistas SQL deben utilizar `security_invoker` si se exponen; las claves privilegiadas únicamente en backend.
- Revisar permisos `GRANT` además de RLS. Las políticas no sustituyen los privilegios de tabla ni corrigen referencias entre tenants.

## 6. Matriz de permisos propuesta para BT-CP02

| Operación | Propietario | Administrador | Mecánico | Recepción |
|---|---|---|---|---|
| Ver datos autorizados de su taller | Sí | Sí | Según alcance | Según alcance |
| Editar datos del taller | Sí | Si se delega | No | No |
| Invitar/desactivar trabajadores | Sí | Si se concede explícitamente | No | No |
| Alterar rol propio o apropiarse de otro taller | No libremente | No | No | No |
| Crear/editar OT, revisión | Sí | Sí según permisos | Trabajo técnico autorizado | Recepción autorizada |
| Administrar suscripción propia | Sí | Solo con delegación futura separada | No | No |
| Acceso a taller ajeno sin membresía | **Denegado** | **Denegado** | **Denegado** | **Denegado** |
| Consola global de ByteTorque | No por ser propietario de un taller | No | No | No |

**La matriz exacta por acción debe aprobarse antes de construir policies.** Guardas React son UX; la autorización debe existir en DB/API.

## 7. Tests imprescindibles con dos talleres ficticios (A/B)

1. Dueño A puede consultar y modificar exclusivamente configuración A.
2. Dueño A consulta o modifica B por UUID ajeno: **denegado**.
3. Mecánico A intenta administrar membresías o suscripción A: **denegado**.
4. Usuario anónimo accede a datos privados de A o B: **denegado**.
5. Persona con membresía real en A y B cambia de contexto: solo acceso separado según cada rol.
6. Membresía desactivada: pierde consultas/mutaciones futuras; comprobar revocación efectiva.
7. Intento `UPDATE workshop_id` A→B: **denegado**.
8. Intento de insertar `work_order` de A con `client_id` de B: **denegado** también por integridad referencial.
9. Intento de editar rol propio o desactivar último owner: **denegado**.
10. Intento de abrir documento/archivo privado de B desde A: **denegado**.
11. Registro mediante token público inválido, vencido, usado o de taller manipulado: **rechazado**.
12. Verificación de `anon`, `authenticated` y grants para cada tabla expuesta, con pruebas SQL reales, no mocks.

## 8. Secuencia de implementación y puertas de aprobación

**CP02-A — Auditoría (ahora):** inspeccionar GitHub, Supabase visible y documentos. **Terminada parcialmente**: GitHub auditado, Supabase ByteTorque sin acceso en conector.

**CP02-B — Inventario real del proyecto (pendiente):** al conectar el Supabase `biomotors-taller` correcto, leer proyecto, tablas, migraciones, Auth, políticas, buckets y asesores de seguridad, sin ejecutar SQL mutante.

**CP02-C — Esquema y RLS (requiere autorización):** preparar/ejecutar migraciones versionadas, crear policies y grants mínimos, dos talleres y usuarios exclusivamente ficticios, prueba de aislamiento. Mantener el proyecto de producción sin datos reales hasta aprobación.

**CP02-D — Integrar Auth web:** implementar login, recuperación, onboarding del taller y pantalla de membresías. Probar flujo y no mezclar usuario/tenant. No desplegar el frontend con operaciones reales antes de pasar la batería de seguridad.

**CP02-E — Android (más adelante):** compartir modelos/API/validaciones, mantener React Native nativa, generar APK al final según la decisión del Director.

## 9. Dependencia bloqueante

**La conexión Supabase disponible no expone `biomotors-taller`.** Es necesario conectar la cuenta/organización que contiene el proyecto o autorizarlo para este conector, y volver a ejecutar `list_projects`. No suponer el ID ni utilizar bases de datos de otros productos. Ninguna credencial se solicita en el chat.

## Referencias técnicas verificadas

- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Auth email/password: https://supabase.com/docs/guides/auth/passwords
- Storage Access Control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase CLI v3 breaking change (04/11/2026): https://supabase.com/changelog/supabase-cli-v3

**Este documento no certifica un backend existente ni la ejecución de políticas.**
