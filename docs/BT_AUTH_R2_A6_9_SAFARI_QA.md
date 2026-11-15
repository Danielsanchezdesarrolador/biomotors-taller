# ByteTorque · BT-AUTH-R2-A6-9 · Guía de prueba Safari/iPhone (solo visual)

**Estado:** Preparada, **NO ejecutada en un iPhone físico**. La prueba automatizada equivalente se realizó únicamente en Chromium con emulación móvil. **No utilizar invitaciones verdaderas ni datos reales**. Fecha: 15/11/2026.

## Objetivo
Probar el comportamiento de la pantalla de invitación que **todavía NO acepta tokens** y su convivencia con Safari y la PWA instalada. La invitación real, Supabase y correo siguen inactivos.

## Requisitos de prueba
- iPhone con Safari y opcionalmente ByteTorque PWA agregado a inicio.
- URL pública de revisión del proyecto: https://biomotors-taller-demo.onrender.com/
- Solo enlace ficticio en fragmento: https://biomotors-taller-demo.onrender.com/#/auth/aceptar-invitacion?token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
- Este token no es válido ni puede aceptar nada; sirve exclusivamente para comprobar redacción de la URL.
- No usar URL con token en el query HTTP antes de #. Un GET con ?token=... puede dejar el secreto registrado por servidor, proxy y sistemas de diagnóstico.

## Pasos manuales sugeridos (sin datos personales)

1. **Safari, enlace sintético:** abrir el enlace ficticio y comprobar que la barra queda como /#/auth/aceptar-invitacion, sin token ni ?token=. La pantalla debe decir “Tu acceso como mecánico” y “Invitaciones aún no disponibles”. No debe aparecer un formulario activo, CTA de aceptación ni indicación de cuenta creada.
2. **Texto y accesibilidad:** comprobar bloque “Si usas iPhone”, tamaño legible y botón “Volver al acceso de mecánicos” visible sin scroll lateral ni elementos cortados en vertical y horizontal.
3. **Recarga y navegación:** recargar la pantalla; pulsar Volver al acceso de mecánicos; retroceder y avanzar con Safari. El token no debe reaparecer en ninguna dirección ni en la UI. No se crea una membresía, no aparece una sesión ficticia y no se da acceso técnico.
4. **Otro enlace en la misma pestaña:** desde la barra de direcciones, volver a abrir el enlace sintético. El token se limpia otra vez y la pantalla queda bloqueada.
5. **Pantalla de inicio / PWA:** abrir ByteTorque desde su icono, si está instalado, y repetir la lectura de la pantalla informativa sin suponer que Safari y PWA comparten la misma sesión. No instalar PWA ni introducir credenciales reales solo para esta prueba.
6. **Cambio de aplicación:** pasar de Safari a otra app y volver; cerrar pestaña y abrir ByteTorque de nuevo. Ningún acceso se debe activar. La gestión experimental de memoria no está conectada a la PWA actual, por lo que aquí solo se comprueba el bloqueo público, no el módulo candidato.
7. **Sin API real:** verificar visualmente que no se solicitan credenciales, pagos o aceptación. Las comprobaciones detalladas de almacenamiento y red ya se realizan en Chromium aislado por CI, no son verificables solo desde esta interfaz de Safari.

## Registro de evidencia

Registrar modelo y versión de iOS, fecha, Safari normal o PWA instalada, resultado PASS/FAIL por paso y capturas **sin datos privados ni tokens reales**. Si se observa un token o un formulario activo, detener la prueba y reportar como fallo. No suponer el resultado; este documento es una guía aún sin ejecución física.

## Límites del laboratorio automatizado

[CI de navegador Chromium #43723432536](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43723432536) validó viewport 375, 390, 768 y 1440, tacto emulado en móviles, URL hash limpia, reload, back, forward, ausencia de escrituras, ausencia de llamadas operacionales y pantalla bloqueada. **Chromium no prueba WebKit**, BFCache exacto de iOS, comportamiento real de “Agregar a inicio” ni interacción entre distintos contenedores de sesión.

## Requisitos antes de prueba de aceptación real

No avanzar a tokens auténticos hasta aprobar por separado migraciones SQL privadas y RLS, autenticación de servicio, despliegue Edge protegido, correo transaccional con dominio verificado y una prueba controlada a una dirección propia. Solo después habilitar manualmente el flujo y verificar en Safari real y Android.
