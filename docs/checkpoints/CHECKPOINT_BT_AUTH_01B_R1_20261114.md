# CHECKPOINT BT-AUTH-01B-R1 — Login y sesiones con activación apagada

**Fecha:** 14/11/2026 · **Rama:** `main` · **Base verificada:** `aa3a64d21de14dbf63fc0ac601940445b3cde35d`.

**Estado:** implementación y verificaciones locales completas; Auth público permanece apagado. Pendiente validación del Director con cuentas controladas, aprobación de activación y comprobación física Safari/PWA. **No iniciado R2**.

## Fuentes y alcance

Se leyeron AGENTS, README, roadmap, la orden BT-AUTH-01B-R1, el contrato BT-AUTH-01 y el checkpoint BT-CP02-D A/B. Se actualizó `main` y se comprobó que remoto no avanzó durante la implementación. La única carpeta local previa sin seguimiento era `artifacts/`; no se descartó. No se crearon ramas, cuentas, talleres ni servicios.

El PASS A/B 25/25 del Director y su limpieza son antecedentes documentados; **no se repitieron ni equivalen a E2E de esta integración**. No se accedió a claves privilegiadas ni a la consola Supabase.

## Implementado

- Supabase JS **2.119.0**, dependencia fijada y lockfile. Configuración exclusiva del proyecto `suxcqqnmcjoezfxltoms` con URL y **publishable key**. Flag `VITE_BT_AUTH_R1_ENABLED` apagado por defecto.
- Login `signInWithPassword`; `getSession` como candidato, `getUser` como verificación; correo confirmado obligatorio. SELECT por RLS de membresías propias activas y talleres activos. Ni selector, metadata, URL ni caché de permisos conceden acceso.
- Restauración, cambios de sesión y renovación; revalidación al volver al foco/visibilidad/reconexión. Contexto retirado antes de consultas; generaciones descartan respuestas tardías tras logout/cambio/teardown. Callback Auth difiere las consultas fuera del lock del SDK.
- Sin membresía o membresía deshabilitada: «Sin taller autorizado». Roles desconocidos, usuarios ajenos y talleres suspendidos/ocultos se rechazan. Varias membresías legítimas requieren selección explícita y nueva lectura. Ningún UUID de URL define el taller.
- Owner/admin: identidad del taller y cinco paneles existentes vacíos. Mechanic: solo espacio técnico sin OT/datos; elegir Administrador no concede acceso administrativo. Reception: restringido, pendiente definición.
- Logout local: contexto retirado inmediatamente; SDK elimina sesión local y solicita revocación de refresh token. Aviso si la red impide confirmar cierre en servidor; no se promete revocación inmediata de JWT emitidos ni logout global.
- Estados de carga, credenciales genéricas inválidas, correo sin confirmar, sesión vencida, revocación y red interrumpida. Fetch acotado a 12 s por intento, compatible con Safari sin `AbortSignal.any`. Autocompletado apropiado, disabled durante carga y mensajes accesibles. Contraseña retirada del formulario al enviar, nunca persistida ni registrada.
- Carga diferida del SDK: se detectó y eliminó incluso la escritura temporal que su importación producía al sondear Storage. Con flag apagado no se ejecuta el SDK y las regresiones comprueban cero escrituras/almacenamiento.
- Rutas de revisión explícitamente **DEMO**, read-only y separadas del contexto autenticado, incluso si el navegador conserva una sesión SDK. Siete pantallas y entradas de Administrador/Mecánico preservadas. Registro, recuperación, verificación por enlace, OTP, magic links, correo e invitaciones siguen inactivos; `detectSessionInUrl=false`.
- Build bloquea claves secretas, claves legacy y nombres públicos reservados a secretos, sin imprimir valores. PWA/service worker sin cambios: no cachea API, tokens ni datos privados.

No se alteraron SQL, migraciones, RLS, Supabase Auth/configuración, Edge/onboarding, planes, pagos, Android, fuentes de marca ni el motor/documento multipunto de Ignacio. No se conectó persistencia operativa.

## Archivos

| Área | Archivos principales |
| --- | --- |
| Auth | `src/auth/{config,controller,supabaseGateway,lazyGateway,fetchWithTimeout}.ts`, `RealAccess.tsx`, `auth.css` |
| Integración R2 | `src/App.tsx`, `src/access/{AccessScreens,ReviewBanner,TechnicianReview}.tsx`, `src/layout/AppShell.tsx` |
| Dependencias/configuración | `package.json`, `package-lock.json`, `.env.example`, `vite.config.ts`, `scripts/verify-official-bundle.mjs` |
| Pruebas | Cuatro archivos `src/auth/*.test.*`; `scripts/verify-auth-r1-{ui.cjs,env.mjs}`; harness privado; workflow público existente |
| Regresiones | `scripts/verify-official-ui.cjs` admite el rótulo DEMO exigido por R1 pero conserva exclusión de fixtures; `verify-qa02-ui.cjs` espera transición React antes de comprobar Enter/Escape |
| Documentación | README, AGENTS, roadmap, [guía Render](../BT_AUTH_01B_R1_CONFIGURACION_RENDER.md), este checkpoint y [capturas/resultados](../screenshots/BT_AUTH_01B_R1/README.md) |

## Evidencia ejecutada localmente

| Comprobación | Resultado y alcance |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | **186/186 PASS, 25 archivos**; 146 anteriores intactas +40 nuevas. SDK/stubs, no cuentas reales |
| `npm run build` | PASS Vite/PWA, fronteras de módulos públicos, exclusión de fixtures, hashes/transparencia y recursos de marca protegidos |
| `verify-auth-r1-env.mjs` | 4/4 builds negativos rechazados, valores sintéticos no impresos |
| `verify-auth-r1-ui.cjs` | PASS SDK oficial + HTTP interceptado, 1650/1440/768/390/375: login, cinco paneles vacíos, recarga, URL ajena, DEMO separado, revocación y logout |
| Build **local** con flag `true` | PASS sobre `/tmp/bt-auth-enabled-dist`, clave sintética y servidor loopback 5178; mismos recorridos y negativas. No se publicó ni se contactó Supabase |
| Negativas de navegador | Credenciales inválidas, ausencia/desactivación de membresía, correo sin confirmar, mecánico, recepción, varios talleres, pérdida/reconexión de red y salir/volver durante login pendiente: PASS con respuestas simuladas |
| `verify-auth-ui.cjs` | PASS siete pantallas, navegación inicial/back/forward/refresh/PWA en Chromium y revisión, cinco anchos; cero escrituras de red/Storage/cookies |
| `verify-official-ui.cjs` | PASS cinco paneles y cinco anchos, sin registros ficticios, escrituras ni persistencia |
| `verify-brand-ui.cjs`, `verify-brand-02-ui.cjs` | PASS cinco anchos, logo R2/transparencia sin cambios |
| `verify-flow-ui.cjs`, `verify-flow-d-ui.cjs` | PASS B/C/D en cinco anchos, IDs/continuidad, aceptación por revisión, pendientes/realizados y ausencia de escrituras/persistencia |
| `verify-qa02-ui.cjs` | PASS flujo de cotización a entrega, cinco anchos. Se reprodujo la carrera Enter/Escape ya anotada en BRAND-02; se sincronizó exclusivamente el test conservando ambas aserciones |
| `verify-cotizaciones-ui.cjs` | PASS cinco anchos; cálculos, revisión, invalidación, documentos y exclusión de no realizados preservados |
| `verify-registro-ui.cjs` | PASS 1650/390, sin red de escritura/Storage. Se usó Chromium instalado mediante wrapper de lanzamiento; no se modificó registro |
| `verify-qa02-print.cjs` + `analyze-qa02-pdfs.py` | PASS seis PDFs A4, 1650/390/375: informe corto 1 página, largo 2; **0 páginas en blanco** |
| Auth/RLS real nuevo | **NO EJECUTADO**. No hay cuentas/claves configuradas para esta sesión |
| Dispositivos físicos | Safari/iPhone/PWA instalada real **pendiente**. Emulación Chromium no certifica Safari físico |
| CI remoto | Workflow ampliado para repetir mocks/guardas y subir capturas. Consulta `gh run list` denegada (`Forbidden`); **no se declara CI remoto PASS** |

Se reprodujo además una carga indefinida al salir/volver durante un login pendiente; se añadió regresión unitaria y HTTP mock, y se resolvió mediante una nueva validación del servidor al remonte, sin restaurar la respuesta descartada.

No se cuentan las primeras ejecuciones interrumpidas por HMR como PASS: los recorridos se repitieron sobre código estable. No se modificaron módulos de negocio para superar pruebas.

## Commits

- `9df5111` — integración R1, sesiones/roles/membresías y pruebas unitarias, flag apagado.
- `45d9fa4` — navegador con SDK/HTTP simulado, entorno negativo, rutas y sincronización de test QA.
- `cc8163f` — build local activado aislado, cinco paneles y ejecución reproducible en workflow existente.
- `07ec9af` — checkpoint inicial, capturas/resultados, roadmap y guía de configuración.
- `9d09404` — clasificación explícita de sesión ausente/refresh revocado como sesión vencida; 185 pruebas y build repetidos PASS.
- `0cc0f8f` — primera confirmación de publicación con Auth apagado.
- `d8ec46c` — regreso al acceso durante login pendiente: nueva validación tras remonte, 186 pruebas y recorridos SDK HTTP mock PASS.
- El commit final de evidencia publicada se entrega al Director; no cambia el frontend.

## Render

**PUBLICADO y verificado** en https://biomotors-taller-demo.onrender.com, código `d8ec46c`, con **Auth apagado**. No se configuraron claves ni se cambió Environment del servicio; la ausencia del nuevo flag conserva el valor OFF.

- HTTPS: `index.html`, `index-D96w8na3.js`, `index-CS2vKy7X.css`, `supabaseGateway-CmEdwRDk.js`, manifest y service worker **idénticos byte por byte** al build final. [Hashes y fecha de comprobación](../screenshots/BT_AUTH_01B_R1/render-assets.json).
- Navegador publicado 1650/1440/768/390/375: raíz muestra login, formulario inactivo y aviso preciso de flag apagado; sin desborde, **cero tráfico externo y cero escrituras/almacenamiento**. [Resultado](../screenshots/BT_AUTH_01B_R1/render-runtime.json).
- Siete pantallas, revisión, navegación inicial/back/forward/refresh/PWA en Chromium, cinco anchos sobre Render: PASS con `verify-auth-ui.cjs`. [Reporte](../screenshots/BT_AUTH_01B_R1/render-access-results.json).
- Capturas reales del sitio publicado: [escritorio](../screenshots/BT_AUTH_01B_R1/render-login-1650.png) · [móvil](../screenshots/BT_AUTH_01B_R1/render-login-390.png). Las imágenes de integración activada están separadas y rotuladas `mock`; no se publicó el flag activado.
- El navegador de pruebas toleró el certificado del proxy de este entorno; la comparación HTTPS independiente de archivos se hizo con validación TLS estándar. No se cambió seguridad del frontend ni del servicio.

El commit documental final no modifica estos assets. No se declara CI remoto aprobado: Actions devolvió `Forbidden`. No se declara acceso Auth/RLS real aprobado: continúa pendiente del Director.

## Revisión pendiente

Validar con cuentas controladas del Director identidad/membresía real, dos talleres aislados, cambio/desactivación/revocación, renovación de tokens, multiventana, logout sin red y dispositivos físicos. Aprobar explícitamente antes de cambiar el flag en Render. Variables y pasos en la [guía de configuración](../BT_AUTH_01B_R1_CONFIGURACION_RENDER.md). Operaciones de negocio, invitaciones, correo, recuperación y R2 siguen fuera de alcance.

## Anexo: validación R1 con Supabase real (14/11/2026)

**Fuente:** pruebas manuales efectuadas por el Director con Chrome y PowerShell en su PC durante el chat, 14/11/2026. Esta evidencia complementa y no sustituye las pruebas de Codex con mocks registradas anteriormente. El sitio Render permanece con `VITE_BT_AUTH_R1_ENABLED` apagado; las pruebas reales fueron sobre el `localhost:5173` del Director con clave exclusivamente publishable.

### Pruebas de interfaz real reportadas por el Director

1. Login de propietario con cuenta de prueba y membresía de taller: **PASS**; se muestra nombre de taller y rol owner.
2. Sesión conservada tras F5: **PASS**.
3. Logout y recarga sin restauración automática del panel: **PASS**.
4. Contraseña errónea rechazada: **PASS**.
5. Cuenta confirmada sin membresía denegada: **PASS**.
6. Revocación del estado de membresía `active → disabled` bloquea el panel tras F5: **PASS**.
7. Restauración `disabled → active` devuelve el acceso al propietario: **PASS**.
8. Dos propietarios activos en Chrome normal/incógnito visualizan cada uno su taller: **PASS**.

Las operaciones administrativas de vinculación, desactivación y restauración se hicieron para las cuentas ficticias, no para clientes reales. Las pruebas descritas por el Director no certifican Safari físico ni la invalidación inmediata de todos los JWT en todos los dispositivos.

### Prueba API RLS directa con dos usuarios reales

`scripts/security/bt-auth-r1-rls-readonly.mjs`:

- Primera ejecución: **PASS 1–14**, incluyendo identidad confirmada de ambos propietarios, lectura exclusiva de talleres, rechazo cruzado por UUID, aislamiento de membresías y perfiles.
- Primera comprobación anónima: `FAIL — Consulta fallida: workshops (HTTP ?)` **por expectativa demasiado estricta del script**, no se adjudicó PASS; la auditoría SQL mostró ausencia de `GRANT SELECT` a `anon` y política `workshops_read_member` restringida a `authenticated` con membresía activa.
- Corrección del script `a2f7a3a`: acepta solo respuesta vacía válida o rechazo HTTP **401/403**, no errores arbitrarios. `--anon-only` ejecuta una prueba separada **sin contraseñas**.
- Segunda ejecución mostrada por el Director en PowerShell: `PASS 1 — Anonimo rechazado por API (HTTP 401)`; `RESULTADO: prueba anonima independiente PASS; no se usaron contrasenas.`
- **Resultado consolidado: 14 pruebas autenticadas PASS + 1 prueba anónima independiente PASS = 15 comprobaciones validadas en dos ejecuciones.** No declarar que la corrida original fue 15/15 PASS.

### Verificación administrativa posterior

- Supabase consultado en modo lectura: **2 usuarios de prueba, 2 talleres, 2 perfiles, 2 membresías**; ambos talleres `active` y ambos propietarios con membresía `owner / active`.
- Security Advisor muestra una **advertencia**: protección de contraseñas filtradas desactivada (característica a evaluar antes de producción); no afirmar cero advertencias.
- Scripts y documentación actualizados en `main`, sin nuevos cambios a esquema, SQL, políticas RLS, Auth, Render ni Android.
- GitHub Actions: CI del commit `a2f7a3a` incluye un workflow completado con SUCCESS y otro que seguía en curso durante la consulta; no asumir que todos estaban finalizados.

### Puertas todavía pendientes

- Validar sesiones simultáneas/multiventana en mismo perfil, revalidación con pérdida y recuperación de conectividad, vencimiento/renovación de token y cierre en escenarios de red interrumpida.
- Validar visualización y restricciones reales de roles `mechanic`, `admin` y `reception`, y selección de múltiples talleres bajo una misma identidad, con fixtures estrictamente controlados.
- Safari/iPhone físico y PWA instalada. Correo transaccional SMTP propio aún no configurado; correos de verificación/recuperación reales no comprobados.
- No habilitar registro público, onboarding, persistencia operativa, planes/pagos ni correo externo todavía. **No activar Auth en Render sin aprobación expresa del Director.**
- Mantener los dos talleres ficticios para completar pruebas; definir y verificar limpieza al cerrar todo R1.

### Anexo: recuperación de conectividad y renovación explícita real (14/11/2026)

**Evidencia:** usuario ejecutó las pruebas en Chrome y PowerShell y proporcionó resultados en la conversación.

- **Pérdida de conexión:** tras forzar estado Offline en Chrome, ByteTorque bloqueó el acceso privado — **PASS reportado por el Director**.
- **Reconexión sin F5:** restauró No throttling y ByteTorque volvió a verificar y permitir acceso del propietario — **PASS reportado**.
- **Recarga Ctrl+Shift+R:** recuperó la sesión y taller correctamente — **PASS de persistencia**, **no** equivale a renovación de JWT.
- **Prueba aislada `scripts/security/bt-auth-r1-refresh-check.mjs`: 9/9 PASS mostrados en captura de PowerShell.** El script inició sesión con el propietario ficticio A, llamó `auth.refreshSession()`, verificó token de acceso nuevo y rotación del refresh token, identidad idéntica, actualización de sesión SDK mediante `getSession`, identidad remota con `getUser` y lecturas RLS del taller y membresía autorizados. Finalmente cerró su sesión aislada. No imprimió tokens ni contraseñas.
- **CI GitHub del commit `1286f0b`:** dos ejecuciones consultadas con estado `completed / success`. No se cambió frontend, Auth config, SQL, Render, RLS, Android ni cuentas durante esta entrega documental.
- **Alcance:** esta es una renovación **explícita y forzada en un cliente de prueba**, no evidencia de renovación automática durante caducidad en Chrome, PWA ni Safari físico. Tampoco certifica logout sin conexión ni revocación inmediata de JWT ya expedidos.

**Puertas abiertas para cerrar R1:** renovación automática real en navegador, prueba de logout sin red, roles `admin/mechanic/reception` con membresías controladas, Safari/iPhone/PWA físico, limpieza de usuarios/talleres de prueba y decisión explícita del Director sobre habilitar Auth en Render. Registro público, onboarding y SMTP todavía OFF.

### Prueba de cierre de sesión con conexión interrumpida — evidencia del Director (14/11/2026)

- Chrome DevTools tenía `Network > Offline`. Tras pulsar `Cerrar sesión`, la interfaz retiró el panel privado y mostró el formulario de inicio de sesión. **PASS del bloqueo visual/local** según captura aportada.
- Network registró petición `logout?scope=local` fallida por desconexión. La pantalla comunicó «Sesión cerrada». **No se ha demostrado revocación remota ni terminación de todos los JWT**: distinguir cierre local del servidor. Según `src/auth/supabaseGateway.ts`, la llamada es `auth.signOut({ scope: 'local' })`, y `src/auth/controller.ts` retira el contexto antes de pedir el cierre.
- Con Offline, parte del recurso de marca/logo no cargó correctamente (síntoma visual secundario, probablemente recurso no disponible); revisar cache/offline PWA más adelante sin cambiar identidad visual.
- **Prueba pendiente inmediatamente posterior:** volver a `No throttling`, recargar pestaña del Taller A y confirmar que permanece en login sin restauración de panel, sin ingresar credenciales. Solo si eso pasa, considerar validado cierre local persistente tras reconexión.
