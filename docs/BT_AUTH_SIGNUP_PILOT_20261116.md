# ByteTorque — registro piloto por correo, candidato (16/11/2026)

## Alcance
Registro de cuenta de Supabase Auth en la pantalla oficial `/#/acceso/registro`, con correo y contraseña, confirmación exigida y posterior login. **Sin asignación automática de taller ni rol**; toda autorización sigue exigiendo membresía RLS gestionada por un administrador autorizado. Los registros de clientes, CP03/CP04 y cuatro usuarios preexistentes se preservan.

El flujo usa el cliente de Auth R1 existente, la clave pública de proyecto y el SDK existente. No se solicita nombre, teléfono ni nombre de taller porque el onboarding comercial y las políticas legales todavía no están aprobados. Los campos de registro DEMO permanecen disponibles cuando el nuevo flag está OFF. No se modifica RLS/SQL/SMTP ni se activan invitaciones, correos de CP05 ni registro de nuevos talleres.

## Puertas previas a habilitar el servicio
1. En Supabase `suxcqqnmcjoezfxltoms`, Auth → Providers → Email: habilitar correo, **Confirm Email ON**, y verificar ajustes de **Allow new users to sign up**. No abrir el registro general de otros talleres ni relajar los controles RLS. Esta cuenta queda inicialmente sin membresía.
2. Auth → URL Configuration: Site URL `https://bytetorque.cl` cuando el dominio esté verificado con HTTPS (Render informó Verified y Certificate Issued el 16/11/2026); permitir exactamente la devolución `https://bytetorque.cl/#/auth/confirmacion`. Mantener la URL vieja de Render solo como respaldo de transición; evitar wildcards innecesarios.
3. Confirmar el transportista de correo antes de probar: el SMTP predeterminado de Supabase solo envía a correos de integrantes del equipo Supabase, con límites fuertes; para otros correos hace falta SMTP propio verificado, configurado **exclusivamente en Supabase**. Nunca publicar una contraseña SMTP en repositorio, frontend o chat.
4. Comprobar plantilla **Confirm sign up** con `{{ .ConfirmationURL }}` y que el usuario reciba efectivamente un enlace. Hacer el primer ensayo solo con una dirección controlada por el Director. No inferir entrega de un retorno API.
5. En Render Static existente (sin servicio adicional), habilitar `VITE_BT_AUTH_SIGNUP_ENABLED=true` solo tras comprobaciones 1–4 y autorización operacional. Reconstruir el mismo sitio desde main; el valor por defecto en código es **OFF**. `VITE_BT_AUTH_R1_ENABLED=true` debe seguir activo.
6. Registrar con email/contraseña propios → correo de confirmación → abrir enlace → volver a Iniciar sesión → verificar estado. El callback deliberadamente **no intercambia** el código PKCE ni conserva tokens de URL: tras confirmar en Supabase se entra con contraseña. El enlace de correo puede requerir la misma sesión/navegador en función de la plantilla/PKCE; comprobar físicamente. No afirmar verificación si no se ha autenticado de nuevo.
7. Si login indica «Sin taller autorizado», es esperado. La asignación de membresía al taller de pruebas correcto y rol del Director es **otro cambio alojado**, que debe revisar y autorizarse expresamente tras comprobar el usuario confirmado. No reemplazar las cuatro cuentas existentes. Nunca convertir una preferencia de rol de la UI en privilegio de base de datos.

## Seguridad y limitaciones
- El código ya utiliza el dominio `bytetorque.cl` para nuevos enlaces de confirmación; todavía se debe verificar Site URL, la plantilla y la entrega SMTP reales antes de abrir el piloto.
- El registro se habilita con un flag de presentación de Vite; **no es una lista de permitidos del servidor**. Si `Allow new users to sign up` se activa en Supabase, otros usuarios podrían crear cuentas sin obtener acceso a talleres. Para un piloto cerrado, preferir invitaciones administradas hasta aprobar la exposición pública.
- Si Confirm Email está OFF, `signUp` podría crear una cuenta autoconfirmada: el cliente elimina cualquier sesión inmediata y falla, pero no puede deshacer esa creación. Verificar la opción en dashboard ANTES de activar.
- SMTP no se configura por código. Sin servidor válido o correo autorizado, el envío fallará.
- El SDK recibe `emailRedirectTo` al destino aprobado; no se registra contraseña, token ni errores detallados de proveedor.
- El acceso Auth **no equivale** a acceso a datos: CP02/RLS siguen limitando registros por taller y rol.
- Esto no cierra CP04; quedan las pruebas de las 34 X, retorno, Safari físico y aprobación de Ignacio.
