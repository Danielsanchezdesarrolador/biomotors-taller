# CHECKPOINT — BT-AUTH-01A — 14/11/2026

## Resultado y alcance

**Siete pantallas R2 de acceso y dos vistas de revisión, sin autenticación real.** Se utiliza la alternativa de solo lectura autorizada por el Director para el sitio estático. La cuenta ficticia está exclusivamente en el harness privado; Render no pide ni valida una contraseña incrustada y no aparenta proteger datos. Se usan rutas `/#/…` porque el Render existente devuelve 404 para rutas de servidor sin reescritura SPA. Así los enlaces directos, recarga y atrás/adelante funcionan sin cambiar infraestructura. El harness privado conserva también sus rutas locales por pathname. La página inicial `/` conserva la interfaz oficial vacía BT-OFICIAL-01A.

Base comprobada antes de modificar: `5d068b55c4b304cbc675425417047d4881fe63d4`, `main` actualizado mediante fast-forward desde `874b39a`. Se leyeron AGENTS, README, roadmap, contrato BT-AUTH-01, matriz de roles, planes BT-PLAN-03 y último checkpoint BT-OFICIAL-01A. Las siete imágenes estaban disponibles y se examinaron. Remoto revalidado sin cambios concurrentes. Sin ramas, agentes paralelos ni servicios adicionales.

[Orden del Director](../BT_AUTH_01A_ORDEN_IMPLEMENTACION.md). No se modificaron Supabase, Auth/RLS, migraciones, `bt-owner-onboarding`, BT-CP02-D, pagos, suscripciones reales, correos ni Android nativo. **BT-AUTH-01B y BT-CP02-D no iniciados.**

## Mapeo de las siete referencias

| Imagen adjunta | Pantalla y ruta pública | Captura escritorio / móvil |
| --- | --- | --- |
| 1 | Verifica tu correo — `/#/auth/confirmacion` | [1650](../screenshots/BT_AUTH_01A/BT_AUTH_01A_VERIFICACION_1650.png) · [390](../screenshots/BT_AUTH_01A/BT_AUTH_01A_VERIFICACION_390.png) |
| 2 | Inicia sesión — `/#/acceso` | [1650](../screenshots/BT_AUTH_01A/BT_AUTH_01A_LOGIN_1650.png) · [390](../screenshots/BT_AUTH_01A/BT_AUTH_01A_LOGIN_390.png) · [375](../screenshots/BT_AUTH_01A/BT_AUTH_01A_LOGIN_375.png) |
| 3 | ¿Olvidaste tu contraseña? — `/#/auth/recuperacion` | [1650](../screenshots/BT_AUTH_01A/BT_AUTH_01A_RECUPERACION_1650.png) · [390](../screenshots/BT_AUTH_01A/BT_AUTH_01A_RECUPERACION_390.png) |
| 4 | Crea tu cuenta — `/#/acceso/registro` | [1650](../screenshots/BT_AUTH_01A/BT_AUTH_01A_REGISTRO_1650.png) · [390](../screenshots/BT_AUTH_01A/BT_AUTH_01A_REGISTRO_390.png) |
| 5 | Contraseña actualizada — `/#/auth/contrasena-actualizada` | [1650](../screenshots/BT_AUTH_01A/BT_AUTH_01A_CONTRASENA_ACTUALIZADA_1650.png) · [390](../screenshots/BT_AUTH_01A/BT_AUTH_01A_CONTRASENA_ACTUALIZADA_390.png) |
| 6 | Crear nueva contraseña — `/#/auth/nueva-contrasena` | [1650](../screenshots/BT_AUTH_01A/BT_AUTH_01A_NUEVA_CONTRASENA_1650.png) · [390](../screenshots/BT_AUTH_01A/BT_AUTH_01A_NUEVA_CONTRASENA_390.png) |
| 7 | Revisa tu correo — `/#/auth/revisa-correo` | [1650](../screenshots/BT_AUTH_01A/BT_AUTH_01A_REVISA_CORREO_1650.png) · [390](../screenshots/BT_AUTH_01A/BT_AUTH_01A_REVISA_CORREO_390.png) |

Se conservan composición de dos columnas, panel navy, marca ByteTorque, titular, beneficios, fotografía de taller/vehículo, curva de separación, tarjeta blanca redondeada, ondas suaves, jerarquía e iconografía y botones con degradado cyan/azul. Se reutiliza `public/hero-workshop.webp`, el asset R2 existente; no se fabrica otro vehículo ni se copia el correo personal de las imágenes. En celular, marca compacta superior y tarjeta fluida con desplazamiento vertical natural; campos de 16 px y controles táctiles de al menos 44 px.

Diferencias intencionales por seguridad: aviso permanente **«Vista de revisión — sin autenticación real»**, campos/operaciones públicas bloqueados, nombres y correos personales omitidos, términos sin aceptación simulada, contraseña sin fuerza inventada cuando está vacía. Los estados de correo indican que **no se ha enviado** nada; el estado de contraseña actualizada aclara que **no se ha cambiado ninguna contraseña**. No se promete una expiración de 15 minutos sin proveedor. Los enlaces «Previsualizar…» permiten revisar los estados sin fabricar eventos. Ambas entradas explican que el acceso real requerirá correo verificado y autorización/asignación del taller. No hay autorregistro libre de mecánicos: únicamente una explicación de invitación futura.

## Revisión desde Android o iPhone

1. Abrir **https://biomotors-taller-demo.onrender.com/#/acceso** en Chrome Android o Safari iPhone. Si se conserva una pestaña antigua, recargar.
2. Elegir **Administrador** o **Mecánico**. El selector cambia la presentación; no asigna un rol ni concede permisos.
3. Pulsar **Abrir vista de revisión de administrador** o **Abrir vista de revisión de mecánico** al pie de la tarjeta. **No ingresar correo ni contraseña**: los campos públicos están bloqueados.
4. Administrador abre `/#/revision/administrador`: navegar los cinco paneles vacíos. En Configuración → Usuarios y permisos, pulsar **Ver usuarios y permisos**. La invitación permanece deshabilitada.
5. Mecánico abre `/#/revision/mecanico`: solo órdenes asignadas, multipunto, observaciones, fotografías y trabajos; sin precios, cotizaciones, configuración ni datos ajenos. Todos los estados están vacíos y las acciones operativas bloqueadas.
6. Usar **Volver al acceso** para regresar. Recuperación, registro y sus enlaces de previsualización permiten recorrer los siete diseños.

No existe sesión autenticada ni protección de información privada en estas rutas; no hay información privada que consultar. No es una prueba de Auth/RLS ni una APK Android.

## Única cuenta ficticia de QA

- Correo: **`revision.admin@bytetorque.test`**.
- Contraseña ficticia, pública y sin valor de seguridad: **`VistaBT-2026!`**.
- Perfil de presentación: Administrador; `authenticated: false` siempre.
- Solo en computador controlado: ejecutar `npm run dev:harness -- --port 5177 --strictPort` y abrir **http://127.0.0.1:5177/acceso**. Ingresar esos datos para comprobar validaciones y navegación a los cinco paneles vacíos.
- No es un usuario Supabase. No genera token, cookie, sesión, correo, membresía, taller ni autorización. Elegir Mecánico con esta cuenta produce un mensaje de incompatibilidad, sin elevar ni cambiar el perfil. Una contraseña incorrecta muestra error.
- El fixture y su comparador viven en `tests/fixtures/authReviewAccount.ts` y `tests/harness/reviewAccountMatch.ts`; nunca en el grafo público. El harness permanece ligado a loopback, no debe publicarse ni exponerse a la red. El recorrido histórico con fixtures sigue disponible únicamente en `/` del harness.

## Administrador y mecánico

**Administrador:** `OfficialWorkspaceView` reutiliza íntegros AppShell y cinco paneles oficiales vacíos. No se añade un sexto destino al menú. Usuarios y permisos se abre en un diálogo accesible con Escape/cierre y retorno de foco: listado sin mecánicos, invitaciones pendientes 0, plan Sin configurar y referencias Básico **Mecánicos 0/2**, Plus y Full **Mecánicos 0/8**. Ningún plan se marca activo. Propietario/administradores no consumen cupos. Las invitaciones futuras reservan plazas y necesitarán validación atómica del servidor; esta UI no aplica cuotas ni invita personas. [Escritorio](../screenshots/BT_AUTH_01A/BT_AUTH_01A_USUARIOS_PERMISOS_1650.png) · [Móvil](../screenshots/BT_AUTH_01A/BT_AUTH_01A_USUARIOS_PERMISOS_390.png).

**Mecánico:** presentación técnica vacía, sin importar documentos financieros ni mostrar totales, precios o configuración. Los contratos `previewCapabilities()` devuelven todos los permisos en `false`. Son contratos de presentación, nunca un sustituto de membresías/RLS. Una URL directa o selector no puede habilitar operaciones públicas. [Escritorio](../screenshots/BT_AUTH_01A/BT_AUTH_01A_MECANICO_1650.png) · [Móvil](../screenshots/BT_AUTH_01A/BT_AUTH_01A_MECANICO_390.png).

## Archivos y aislamiento

- `src/access/AccessScreens.tsx`, `access.css`: siete pantallas compartidas, navegación, etiquetas, avisos y estados visuales; sin cliente Auth/API/almacenamiento.
- `src/access/accessContract.ts`, `ReviewBanner.tsx`, `TechnicianReview.tsx`, `UsersPreparation.tsx`: contratos sin privilegios, revisión inequívoca, vista técnica y cupos de referencia.
- `src/App.tsx`: rutas explícitas y reutilización de interfaz oficial; `/` preservado. `src/layout/AppShell.tsx`: enlace al acceso desde el menú de cuenta. `src/official/OfficialPanels.tsx`: apertura de Usuarios y permisos sin modificar el resto de tarjetas.
- `tests/harness/AuthReviewHarness.tsx`, `main.tsx`, `reviewAccountMatch.ts` y fixture único: solo QA local, conservando el flujo anterior.
- `src/access/access.test.tsx`: 14 pruebas adicionales. `scripts/verify-auth-ui.cjs`: siete pantallas, dos vistas, cuenta QA y cinco tamaños. `.github/workflows/bt-oficial-01.yml`: ejecución automática de UI oficial y acceso con harness loopback.
- `vite.config.ts`, `scripts/verify-official-bundle.mjs`: allowlist de módulos de acceso, exclusión de fixtures/harness y rechazo explícito de la cuenta QA en el payload público. [Grafo final](../qa/BT_AUTH_01A/public-modules.json).

## Validación

- **TypeScript PASS**, [resultado](../qa/BT_AUTH_01A/typecheck.txt).
- **Vitest 125/125 PASS**, 18 archivos: las **111 existentes** más 14 de acceso, [resultado](../qa/BT_AUTH_01A/vitest.txt).
- **Vite/build/PWA PASS**, guardia del bundle público PASS, [resultado](../qa/BT_AUTH_01A/build-pwa.txt).
- **Acceso completo 1650/1440/768/390/375 PASS:** siete pantallas, campos públicos bloqueados, mostrar/ocultar, regreso/navegación, mecánico sin autorregistro/finanzas, diálogo de cupos, query de rol sin privilegios, credencial incorrecta, entrada incompatible, credencial correcta sin sesión y criterios de contraseña del harness. **0 errores JS, 0 sesiones, 0 escrituras de red, 0 almacenamiento persistente**. Cookies/localStorage/sessionStorage vacíos e instrumentación de Storage/IndexedDB durante navegaciones. [JSON](../qa/BT_AUTH_01A/access-five-sizes.json).
- **Cinco paneles oficiales × cinco tamaños PASS**, estados vacíos y operaciones bloqueadas, [JSON](../qa/BT_AUTH_01A/official-five-sizes.json).

### Regresiones conservadas

| Regresión | Resultado |
| --- | --- |
| Órdenes, Clientes, Informes y Configuración | PASS en 1650/1440/768/390/375; sin escrituras de red/almacenamiento |
| BT-FLOW-01B/C | PASS en cinco tamaños; IDs, visitas recurrentes y retorno desde cinco paneles |
| BT-FLOW-01D/E | PASS en cinco tamaños; revisión/aceptación vigente, rechazo, cambios, caducidad, no aprobación cruzada, precarga idempotente, realizados, entrega/cancelación DEMO |
| BT-INS-01 | PASS en cinco tamaños; controles, fotos locales, borradores, finalizar, impresión y retorno a OT |
| BT-COT-01 | PASS en cinco tamaños; IVA, aprobación invalidada, edición, plantillas, impresión y exclusión de no realizados |
| BT-REG-02 | PASS 1650/390; tres pasos, solicitud local, revisión/corrección, sin almacenamiento ni red de escritura |
| BT-QA-02 | PASS en cinco tamaños; cotización compacta, espera/cancelación y recorrido completo |
| Impresión A4 | PDFs generados y analizados con pdfinfo/pdftotext en 1650/390/375: cuatro trabajos = 1 página; largo = 2 páginas con texto; cero páginas en blanco |

[Logs de regresión](../qa/BT_AUTH_01A/) · [Análisis de páginas A4](../qa/BT_AUTH_01A/a4-regression.json). BT-REG-02 utiliza un wrapper local para seleccionar `/usr/bin/chromium`, porque el ejecutable de Playwright descargado no está instalado; no se cambió el script ni el módulo de registro. Los snapshots anteriores de multipunto sobrescritos por su script fueron restaurados; las nuevas evidencias pertenecen solo a esta entrega.

## Commits y publicación

- `f8a4ff7`: siete pantallas, contratos, vistas, integración y 14 pruebas; sin backend.
- `480f3cd`: recorrido de navegador de acceso en cinco tamaños y CI con harness privado.
- `1832815`: avisos de correo verificado y fondo que cubre las pantallas más altas.
- `0fc21ad`: navegación hash para el Render estático, recarga y atrás/adelante; aislamiento de la revisión también en el harness.
- Documentación/evidencia: commit que incorpora este checkpoint y actualización del roadmap.

**Publicado automáticamente desde `main` en el Render existente.** Frontend final `0fc21ad`; sin otro servicio. HTML, JS, CSS, manifiesto, service worker y asset R2 comparados byte a byte con el dist aprobado (TLS validado): [hashes](../qa/BT_AUTH_01A/render-assets.json).

- JS: `index-D08LwzdS.js`.
- CSS: `index-CduF0wul.css`.
- URL directa para teléfono: **https://biomotors-taller-demo.onrender.com/#/acceso**. El hash evita depender de reglas de reescritura SPA del servidor.
- **Recorrido publicado 1650/390 PASS**, siete pantallas, recarga, atrás/adelante, cinco paneles vacíos y vista técnica, cupos deshabilitados, cero sesiones/escrituras/almacenamiento/errores. [JSON Render](../qa/BT_AUTH_01A/render-access.json). Las capturas 1650/390 enlazadas arriba provienen del Render publicado; 375 del mismo build local. El navegador remoto se ejecutó con tolerancia TLS únicamente por el proxy del entorno; la comparación HTTP de todos los assets validó TLS normalmente.
- **CI remoto:** la consulta de GitHub Actions mediante `gh run list` devuelve Forbidden en este entorno; no se afirma SUCCESS remoto. El workflow incluye acceso y paneles en cinco tamaños. Los resultados locales completos sí están verificados; revisión de Actions pendiente.


## Pendientes y punto de parada

- **Revisión visual del Director** de las siete pantallas y vistas de revisión. No se presume aprobada por haber pasado pruebas.
- Prueba física de Safari/iPhone y Chrome Android, instalación PWA, teclado real, accesibilidad con lector de pantalla. La prueba de altura reducida del harness comprueba que el botón puede desplazarse hasta quedar visible; no sustituye un teclado físico ni un motor Safari real.
- BT-CP02-D y sus pruebas A/B permanecen reservados. Posteriormente, y solo con autorización/puertas aprobadas: Auth, correo verificado, sesiones seguras, invitaciones, revocación, membresías, aislamiento RLS de talleres/OT asignadas y cuotas del servidor, redirecciones y mensajes del proveedor real.
- Antes de habilitar datos reales: persistencia autorizada, control de permisos por operación y datos, recuperación/expiración reales, términos y privacidad aprobados. Botones de creación/edición, correo y guardado siguen bloqueados.
- No iniciar **BT-AUTH-01B, BT-CP02-D, BT-COM-01 ni backend** al cerrar esta entrega.


## Verificación posterior de CI y capturas (ChatGPT, 14/11/2026)

- Se confirmó el último HEAD funcional/documental `45e52000cbeb427d3564e23bac7cc0b66f3ea228` sin solicitudes de integración abiertas.
- [GitHub Actions — Verificación ByteTorque 43603192218](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43603192218) **SUCCESS** sobre `45e5200`. Job Web/iOS PWA PASS: **18 archivos y 125/125 pruebas Vitest**, Vite y PWA PASS; job Android React Native/Expo sin generar APK SUCCESS.
- [Interfaz pública y exclusión de fixtures 43602975602](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43602975602), y regresiones BT-FLOW-01, BT-REG-02, BT-COT-01, verificaciones generales del commit `0fc21ad`: **SUCCESS**.
- Se examinaron las capturas en GitHub de `BT_AUTH_01A_LOGIN_390.png`, `BT_AUTH_01A_REGISTRO_390.png`, `BT_AUTH_01A_MECANICO_390.png`, `BT_AUTH_01A_USUARIOS_PERMISOS_390.png`. Identidad visual R2 consistente, navegación con dos roles visible, advertencia de no autenticación visible, mecánico sin información financiera y diálogo de cupos ilustrativos Básico 0/2, Plus 0/8, Full 0/8. Sin defecto bloqueante evidente en estas capturas; son evidencias Chromium y no equivalen a Safari físico ni aprobación del Director. Capturas `fullPage` del modal no permiten concluir que la barra inferior tape controles durante una interacción real.
- El usuario debe probar desde Android la ruta pública `/#/acceso`, **sin usar la credencial QA privada** del harness local, y revisar siete pantallas, los dos perfiles y Usuarios y permisos. La contraseña del harness no se emplea ni se distribuye como autenticación real.
- No se modificó código de acceso ni se inició BT-AUTH-01B, BT-CP02-D, correo o Supabase con esta verificación.
