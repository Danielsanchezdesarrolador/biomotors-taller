BYTETORQUE 1.0 — BT-AUTH-01A

Implementación visual del acceso de Administradores y Mecánicos

Repositorio: "Danielsanchezdesarrolador/biomotors-taller"
Rama única autorizada: "main"
Render: https://biomotors-taller-demo.onrender.com

1. MISIÓN

El Director autoriza implementar BT-AUTH-01A utilizando las 7 imágenes de referencia adjuntas.

Estas imágenes constituyen la referencia visual principal y deben reproducirse con la mayor fidelidad posible, manteniendo una experiencia premium en escritorio y celular.

Antes de comenzar:

- Consultar el HEAD actual de "main".
- Leer "AGENTS.md", "README.md" y "roadmap.md".
- Leer "docs/BT_AUTH_01_LOGIN_ROLES_CORREO.md".
- Leer "docs/MATRIZ_ROLES_Y_PERMISOS.md".
- Leer "docs/PLANES_COMERCIALES_BT_PLAN_01.md".
- Leer el último checkpoint de BT-OFICIAL-01A.
- Examinar las siete imágenes y establecer qué pantalla representa cada una.
- Comprobar que no existan cambios concurrentes.

No reconstruir el proyecto ni crear ramas adicionales.

2. IMPLEMENTAR LOS SIETE MOCKUPS

Utilizar las imágenes adjuntas como referencia oficial.

Respetar:

- Distribución y estructura.
- Colores institucionales ByteTorque R2.
- Tipografías y jerarquías.
- Botones e iconografía.
- Espaciados y proporciones.
- Formularios, tarjetas y estados.
- Adaptación de escritorio a móvil.

No sustituir los mockups por diseños genéricos ni crear pantallas diferentes sin justificación.

Si alguna imagen no está disponible, informar cuál falta antes de implementar esa pantalla.

3. INICIO DE SESIÓN

Implementar dos entradas claramente diferenciadas:

Administrador del taller

- Correo electrónico.
- Contraseña.
- Mostrar/ocultar contraseña.
- Recuperar contraseña.
- Información sobre verificación de correo.
- Navegación hacia la interfaz administrativa autorizada.

Mecánico

- Correo electrónico.
- Contraseña.
- Mostrar/ocultar contraseña.
- Recuperar contraseña.
- Información sobre verificación de correo.
- Diseño orientado a sus funciones técnicas.

El rol no debe depender del botón elegido. En la fase real deberá comprobarse desde el servidor.

No permitir autorregistro libre de mecánicos ni creación automática de administradores.

4. CUENTA FICTICIA PARA EL DIRECTOR

Requisito obligatorio de esta etapa.

Preparar exactamente una cuenta ficticia de revisión para que el Director pueda comprobar visualmente el nuevo acceso.

Cuenta propuesta:

- Correo: "revision.admin@bytetorque.test"
- Perfil de previsualización: Administrador.
- Contraseña: credencial exclusivamente de prueba que Codex deberá comunicar al finalizar.

Condiciones de seguridad:

Esta cuenta NO será un usuario real de Supabase.

No tendrá autorización real, acceso a clientes, datos privados, correos, documentos persistentes ni operaciones administrativas.

El acceso simulado debe estar claramente identificado como «Vista de revisión — sin autenticación real».

No introducir credenciales secretas reales ni presentar una contraseña incrustada en React como mecanismo de protección.

La cuenta debe permitir probar visualmente el formulario, los estados y la navegación hacia los cinco paneles oficiales vacíos.

Si el Render estático no permite un acceso de prueba sin aparentar seguridad real, implementar una vista de revisión explícita y de solo lectura accesible desde el sitio, y mantener la cuenta ficticia en el harness privado de QA. Explicar claramente esta limitación al Director.

No habilitar creación de clientes, órdenes, cotizaciones ni guardado permanente.

Al finalizar, proporcionar:

1. Correo de revisión.
2. Mecanismo de ingreso y contraseña ficticia, si corresponde.
3. URL exacta para ingresar desde el teléfono.
4. Indicación inequívoca de que es una simulación y no una sesión autenticada.

5. ACCESO DEL ADMINISTRADOR

El administrador tendrá una interfaz con los cinco paneles oficiales ByteTorque:

1. Inicio.
2. Órdenes de trabajo.
3. Clientes y vehículos.
4. Informes y cotizaciones.
5. Configuración.

En Configuración → Usuarios y permisos preparar visualmente:

- Listado de mecánicos.
- Estado de las invitaciones.
- Contador de cupos.
- Acción «Invitar mecánico».
- Información del plan del taller.

Cupos comerciales aprobados:

Plan| Mecánicos máximos
Básico| 2
Plus| 8
Full| 8

El propietario y los administradores no consumen cupos de mecánico.

Los administradores podrán invitar mecánicos de su propio taller cuando exista autorización real de servidor. No podrán crear otros administradores mediante esta función.

En BT-AUTH-01A, estos controles deben ser únicamente de presentación o estar deshabilitados, sin envío de invitaciones ni creación de usuarios reales.

6. ACCESO DEL MECÁNICO

Preparar una experiencia simplificada que priorice:

- Mis órdenes asignadas.
- Inspección multipunto.
- Observaciones técnicas.
- Fotografías de inspección.
- Registro de trabajos realizados.

El mecánico no debe tener accesos funcionales a:

- Cotizaciones y precios.
- Facturación.
- Suscripciones.
- Gestión de administradores.
- Configuración general del taller.
- Información de otros talleres.
- Órdenes que no le hayan sido asignadas.

En esta etapa solo se prepararán las vistas y los contratos de permisos.

No simular autorizaciones reales mediante variables React. El acceso efectivo se implementará con Supabase Auth, membresías y RLS en una fase posterior.

7. PROTECCIÓN DEL PROYECTO EXISTENTE

Preservar completamente:

- ByteTorque R2.
- Los cinco paneles oficiales.
- BT-OFICIAL-01A.
- BT-REG-02.
- BT-INS-01.
- BT-COT-01.
- BT-FLOW-01A–E.
- BT-QA-02.
- Las 111 pruebas existentes.
- El harness privado de datos ficticios.

No modificar Supabase, Auth/RLS, migraciones, "bt-owner-onboarding", BT-CP02-D, pagos, suscripciones reales, correos ni Android nativo.

No crear ramas, otro Render ni otro repositorio.

8. EXPERIENCIA MÓVIL

Priorizar Safari iPhone y Android.

Verificar:

- Formularios cómodos para escribir.
- Teclado que no oculte botones.
- Campos de contraseña accesibles.
- Controles táctiles de mínimo 44 px.
- Mensajes de error claros.
- Botón para volver.
- Recuperación de acceso preparada visualmente.
- Diseño responsive sin desplazamiento horizontal.

Mantener una identidad visual profesional, sin regresar al antiguo diseño DEMO.

9. PRUEBAS

Ejecutar:

- TypeScript.
- Vitest, conservando las 111 pruebas anteriores.
- Nuevas pruebas del acceso visual.
- Build/PWA.
- Regresiones de los cinco paneles.
- Validaciones en 1650, 1440, 768, 390 y 375 px.

Comprobar especialmente que:

- La cuenta QA no crea una sesión real.
- Elegir Administrador no concede privilegios.
- La vista de mecánico no muestra información financiera.
- No se envían correos.
- No se escriben datos en Supabase.
- No existe almacenamiento persistente de clientes.
- Las operaciones oficiales continúan bloqueadas.

10. PUBLICACIÓN Y CHECKPOINT

Implementar en incrementos controlados sobre "main".

Publicar los cambios comprobados en el Render existente, sin activar funciones reales de autenticación.

Generar capturas de las siete pantallas implementadas en escritorio y móvil.

Actualizar "roadmap.md" y crear:

"docs/checkpoints/CHECKPOINT_BT_AUTH_01A_20261114.md"

Entregar:

- Commits finales.
- Capturas.
- Resultados de las pruebas.
- Estado de Render.
- Cuenta ficticia o acceso de revisión disponible.
- Instrucciones exactas para que el Director lo pruebe desde Android.
- Pendientes de integración real con Supabase.

INSTRUCCIÓN FINAL

Implementa BT-AUTH-01A respetando fielmente los siete mockups adjuntos y preparando una cuenta ficticia de revisión sin permisos reales.

No comenzar BT-AUTH-01B ni BT-CP02-D.

Al finalizar, detenerte para revisión visual del Director.