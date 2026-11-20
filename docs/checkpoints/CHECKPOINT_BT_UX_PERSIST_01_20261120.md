# ByteTorque — BT-UX-PERSIST-01

20/11/2026. Base verificada de main/origin/main:
`bfa7556936bf88caaf659d2f7588cb27e85bb1c0`. Única rama main. Se conservaron
QA04A–QA04C y el trabajo concurrente, incluidos artifacts preexistentes sin track.

## Diagnóstico y solución

**UX-INC-01:** `focus`, `visibilitychange`, `online` y eventos Auth invocaban
validación que sustituía authorized por checking. RealAccess retiraba el
workspace; CP03 eliminaba el binding y CP04/CP05 reconstruían repositorios y
listados. La selección general guardada no conservaba la instancia ni los
formularios. Cambiar de sección también desmontaba el módulo anterior.
**Causa comprobada en código:** transición de Auth y render condicional, no
una llamada a location.reload. El service worker no contiene recarga forzada,
caché de API o controllerchange→reload y queda intacto. No se atribuye toda
recarga física posible a React: el navegador/OS sí puede descartar la pestaña.

- Auth mantiene el último contexto confirmado mientras verifica de nuevo con
  getUser, correo confirmado, membresías activas y taller activo. No elimina
  ninguna de esas consultas ni las guardas/RLS de operaciones privadas.
- Coordina señales durante 60 ms y comparte una validación en curso. Conserva
  identidad de snapshot/contexto cuando no cambian, sin destruir bindings.
- Logout, offline y señal de identidad distinta invalidan el epoch y el acceso;
  resultados antiguos no pueden reautorizar. La identidad observada del SDK
  solo permite invalidar, nunca conceder permisos. Cambio explícito de taller,
  rol o usuario destruye la vista anterior; no se reutiliza su memoria.
- Plan y permiso de Creador están ligados a la identidad/contexto verificados;
  el polling de plan no borra el valor antes de una respuesta. El workspace
  puede ocultarse mientras el Creador trabaja y reaparecer sin perder formularios.
- Cinco secciones visitadas como máximo en memoria React por ámbito autorizado,
  con hidden/inert y exclusión visual de inactivas. No se montan por anticipado.
  Se conservan selecciones, subpantallas, X/cola, PDF, paneles y formularios del
  componente. No se añade caché persistente de respuestas ni credenciales.
- Historia SPA conserva únicamente un identificador efímero y la sección;
  IDs privados, datos y autoridad no se guardan en URL/history. Se conserva
  el hint de sección existente y se restablece scroll/cursor por vista.
- CP04 sigue utilizando sus borradores/autoguardado. Una vista oculta no toma
  el scroll de otro módulo ni desplaza la página al terminar su carga inicial.
  No se agregan escrituras ni reintentos automáticos.

## Incidentes comprobados durante pruebas

- **UX-INC-02:** el primer test nuevo esperaba `.history-panel`; la clase real
  es `.cp06-history`. Otro override de profiles no cubría query strings del
  usuario sintético alternativo. Se corrigieron selectores/rutas del fixture,
  manteniendo las aserciones de invalidación y sin acceso real a Supabase.
- **UX-INC-03:** regreso móvil a Órdenes incumplía la posición conservada.
  Desactivar overflow-anchor en el contenedor de vistas y controlar
  scrollRestoration de history corrige el caso; la aserción conserva tolerancia
  de 2 px y pasa en 1366/390/768. No se alteró la paleta o composición R2.
- **UX-INC-04:** arranque intermitente, reproducido también con bundle estático:
  phase anonymous, cero solicitudes de login y cero page errors. Una comprobación
  tardía podía sustituir anonymous por checking durante la pulsación de Ingresar.
  Regresión unitaria falló antes del arreglo. Anonymous también conserva su
  formulario durante revalidación; un login explícito invalida la comprobación
  anterior. QA04B F01–F06 pasa después en ambos tamaños.
- **UX-INC-05:** una pasada de Vitest ejecutada junto a varios Chromium agotó
  5000 ms en el test existente de PDF (5142 ms), con 738 PASS. No se modificaron
  renderer, test o umbral de PDF. La suite final se ejecuta sin carga de navegador
  paralela; resultado real registrado en la sección de pruebas.
- **UX-TEST-01:** el lector histórico CP06 que exige CP05 OFF se invocó inicialmente
  con todos los gates locales de prueba ON. Se repitió con CP05 false, conservando
  su aserción de cero consultas CP05. No se cambiaron flags/env de Render ni .env.

## Archivos de implementación y pruebas

- `src/auth/controller.ts`, `supabaseGateway.ts`, `RealAccess.tsx`: coordinación,
  invalidaciones, ámbito privado y render estable.
- `src/App.tsx`, `src/layout/AppShell.tsx`,
  `src/official/useWorkspaceNavigation.ts`, `src/official/official.css`:
  navegación SPA, vistas conservadas y restauración por módulo.
- `src/ordenes/Cp04OrdersView.tsx`: scroll/borrador de la vista correspondiente.
- Tests del controlador y binding CP03; `scripts/verify-ux-persist.cjs`;
  harness real de SDK con comandos solo de pruebas y diagnósticos saneados.
  Esos comandos no existen en el bundle público.
- Verificador R1 selecciona el panel visible, pues ahora puede haber otros
  montados y ocultos; las comprobaciones de revocación/ausencia privada siguen.
- CI visual existente incluye el nuevo recorrido sintético, sin nuevo servicio,
  secretos ni pasos de despliegue. Se actualizan roadmap, agent y este checkpoint.

## Commits del código

- `af3fa19f7c6009bd3d3f80173cbae4979e36ada5`: sesión/coordinación, ámbito y guardas de UI.
- `b7e3e3c6b1ebff5ff3d657a2804d7c38d542a087`: navegación, scroll y pruebas de continuidad.
- Documentación/evidencia en commit posterior sobre main, también `[skip render]`.

## Pruebas y evidencia

- Vitest final aislado: **739/739 PASS, 84 archivos**, 30.47 s; no se aumentó
  el límite de tiempo de PDF. Controlador/binding CP03: 47 pruebas PASS.
- TypeScript + build público + build combinado Auth/Creador/PLAN04/CP03–06: PASS;
  grafo oficial, PWA e identidad de marca: PASS.
- Nuevo recorrido UX con SDK/HTTP simulado: **3/3 tamaños PASS** (1366,390,768):
  foco/visibilidad/captura, petición coordinada única, identidad DOM/cursor/scroll,
  cero recargas de datos de negocio al revalidar, navegación/historia SPA,
  formularios CP03/04, X pendiente sin duplicación, PDF y CP06 conservados,
  offline/reconexión, revocación, rol y usuario distintos.
- QA04B F01–F06 × 390/1366: **12/12 PASS**, preservando escrituras confirmadas
  ante fallos posteriores de lectura y evitando duplicados.
- CP04 redesign: **11 resultados PASS** (5 tamaños y estados/errores), incluidos
  multipunto, guardado/reintento y contexto. CP05: **7 tamaños PASS**
  (360,390,430,768,1366,1440,1920), tres partidas/importes/PDF y contexto.
- CP06 con CP05 OFF: **3 tamaños PASS** (1440,390,375), 45 visitas/25 pendientes,
  cero consultas CP05, cero escrituras. R1: **19 resultados PASS** (5 tamaños
  privados + 9 escenarios negativos + 5 tamaños públicos OFF), sin acceso real.
- YAML/JavaScript y diff check: PASS. No hay ESLint configurado.

Logs reproducibles en `/workspace/work/ux-persist/`. Estos resultados son locales;
CI remoto del nuevo código sigue pendiente de publicación/verificación.
Capturas/JSON sintéticos: `docs/screenshots/BT_UX_PERSIST_01_20261120/`.

## Límites y comportamiento seguro

- Se conserva el estado mientras continúa la misma autorización y el documento
  sigue vivo. Offline/revocación/expiración/cambio de ámbito retiran el contenido;
  después se exige reautorización. Solo se recuperan borradores existentes que
  coincidan con usuario/taller, sin prometer recuperar cada subpantalla tras fallo.
- No se garantiza continuidad completa tras recarga, cierre forzado, descarte
  por iOS/OS o nueva versión cargada manualmente. Los estados recuperables son
  únicamente los mecanismos CP03/CP04/CP05 ya existentes, con sus TTL y guardas.
  Zoom/página internos de un lector PDF nativo dependen del navegador.
- No se introdujo polling de datos de negocio ni realtime; cambios externos de
  registros requieren actualización explícita o una operación confirmada. El
  polling de plan previo permanece. La revocación se detecta en validaciones,
  señales SDK y controles de servidor; no se promete aviso realtime instantáneo.
- StrictMode permanece. Changelog Supabase bloqueado por proxy CONNECT403;
  documentación oficial consultada por MCP ratifica getUser del servidor y
  que un JWT local no basta para confirmar una sesión vigente.

## Infraestructura, publicación y validación del propietario

No se modificaron Render, variables/flags alojados, Supabase Auth/RLS/SQL,
roles, datos reales, Edge, Storage, correos, pagos, Android, service worker ni
respaldos. Google Drive retirado continúa retirado. SEC-07 no se ejecutó ni se
reclasificó. No se crearon cuentas/concesiones ni se habilitó el piloto Ignacio.

Todos los commits incluyen `[skip render]`; los resultados locales se presentan
antes de publicar código. Despliegue Render automático/manual sigue **NO AUTORIZADO**.
Render leído sin mutación: `dep-dc086ugm7kps73d78ue0` LIVE en `bd9c8e5`
(`srv-dbqe4quc6qcc73f275jg`, My Workspace autorizado previamente). CI remoto y
estado de publicación se registran después de verificar sus resultados.

Tras autorización específica de despliegue en el Render existente, conservando
flags y sin migraciones:
1. Abrir https://bytetorque.cl en la cuenta QA autorizada, sin compartir claves.
2. Abrir una OT autorizada y un formulario que no tenga envío automático. Escribir
   un borrador sin pulsar guardar; ubicar cursor y scroll. Cambiar de ventana,
   tomar captura y volver; repetir ocultar/mostrar y navegar por las cinco secciones.
3. Abrir PDF e historial disponibles y volver a la misma OT. Comprobar contexto,
   scroll y formularios, además de atrás/adelante y ausencia de cargas repetidas.
4. En multipunto, cualquier X implica autoguardado: probar cambios únicamente
   si hay autorización de escritura QA adicional; no usar datos de clientes reales.
5. Probar desconexión/reconexión con la cuenta QA. Las pruebas de revocación,
   usuario/taller distinto y MFA físico requieren los accesos y permisos de QA
   correspondientes; no alterar roles alojados para esta validación sin permiso.
6. Verificar en Safari/iPhone PWA, Chrome y Edge físicos. Registrar versión y
   resultados auténticos. Guardar/confirmar operaciones antes de recargar o cerrar;
   si un acuse es incierto, reconciliar por identidad sin reenviar la escritura.
