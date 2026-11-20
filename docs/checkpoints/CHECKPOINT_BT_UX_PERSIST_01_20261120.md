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
  renderer, test o umbral de PDF. Una pasada aislada posterior obtuvo 739/739 PASS; tras las cinco regresiones
  nuevas, el cierre completo obtuvo 744/744 PASS, sin ampliar ese umbral.
- **UX-INC-06:** la lectura de plan podía cancelarse por el epoch de una
  verificación rutinaria concurrente, o quedar asociada al montaje previo al
  aceptar una invitación. Se separa `authorityVersion` de los epochs de petición:
  solo una autorización nueva cambia esa generación. El cliente de lectura sigue
  comprobando getUser y ámbito; sesión expirada/otra identidad cierran acceso.
  Una lectura antigua se rechaza incluso tras salir y volver a entrar como el
  mismo usuario. Actualizar plan y volver del Creador invalidan sus metadatos
  expresamente. Cinco regresiones añadidas; 58 pruebas focalizadas PASS. El
  recorrido PLAN04 real/HTTP mock PASS en 1440/390 exige alta disponible en
  menos de 5 s tras actualizar; no se apoya en el polling de 30 s.
- **UX-INC-07:** conservar el módulo retenía el filtro de vehículo al abrir
  explícitamente una OT diferente. El nuevo destino OT limpia únicamente ese
  filtro; cambiar de módulo sin nuevo destino conserva el contexto. CP05 suma
  regresión vehículo A → otra OT y verifica su UUID seleccionado y lista sin
  filtro obsoleto. 7 tamaños PASS, incluido PDF. El primer locator de ese test
  esperaba nombre accesible exacto de un select con opciones anidadas; se ajustó
  al select del panel y se espera habilitación, manteniendo el UUID exacto.
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

- Vitest final: **744/744 PASS, 84 archivos (incluye ajuste final de autoridad)**, 31.72 s; no se aumentó
  el límite de tiempo de PDF. Controlador/binding CP03 y metadatos: 58 pruebas focalizadas PASS tras el ajuste final.
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

Logs reproducibles en `/workspace/work/ux-persist/`. El cierre local del ajuste final incluye las 744 pruebas, ambas compilaciones y
UX Chromium 1366/390/768 PASS. CI del código anterior `a0ee685` fue SUCCESS
en general (44793504072) y visual Chromium/WebKit (44793504028); no se atribuye
a ese CI la validación del ajuste final todavía pendiente de publicación.
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
(`srv-dbqe4quc6qcc73f275jg`, My Workspace autorizado previamente). CI remoto y estado final se documentan en el cierre remoto al final de este checkpoint.
El mismo recorrido UX pasó también con WebKit Linux en CI, usando el
binario que ese workflow ya instala. No se instaló un navegador nuevo en Cloud
(WebKit local ausente) ni se lo presenta como prueba física de Safari/iPhone.

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

## Cierre remoto del ajuste final (20/11/2026)

Código publicado exclusivamente en main: `badea20b49142e0092e73ef905a4b141549dfcaf`
(`[skip render]`). Incluye generaciones de autoridad, actualización expresa del
plan y limpieza de filtro al abrir otra OT, además de sus regresiones.

- [CI general 44798553027](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44798553027):
  Web/iOS PWA **SUCCESS**, Android/Expo **SUCCESS** (sin generar APK).
- [CI visual 44798552931](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44798552931):
  **SUCCESS**, incluyendo UX persistente Chromium y WebKit Linux en 1366/390/768.
- Recorridos remotos FLOW 44798553143, COT 44798553114 y REG 44798553573:
  **SUCCESS**. Todos corresponden a `badea20`.
- Render consultado después del push: último deploy continúa
  `dep-dc086ugm7kps73d78ue0`, LIVE `bd9c8e5`; no hubo deploy nuevo.
- No se ejecutaron operaciones alojadas Supabase ni cambios de infraestructura.
  Publicación en GitHub no equivale a despliegue en bytetorque.cl.


## Adenda · Despliegue autorizado LIVE — 20/11/2026

**Autorización específica:** el titular aprobó («autorizo») el despliegue de BT-UX-PERSIST-01 en `https://bytetorque.cl`, manteniendo Supabase y flags sin cambios. No se autorizó habilitar funciones, pagos, emails ni trabajar con clientes reales.

**Preflight de ejecución:** HEAD `7da13a3f7c1f9a396c777515ce911674a10bde33`, que incluye el código `badea20b49142e0092e73ef905a4b141549dfcaf` y únicamente un commit documental de cierre adicional; [GitHub CI general #44798553027](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44798553027) y [GitHub visual #44798552931](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44798552931) terminaron `completed/success` para `badea20b`. Comparación con LIVE anterior `bd9c8e5`: 7 commits, archivos de auth, navegación, pruebas, screenshots, workflows y documentación de UX; sin otros módulos ajenos encontrados en el delta. Se verificó servicio existente en Render: workspace `tea-daum20gjo6nc73dndfqg` (My Workspace), servicio `srv-dbqe4quc6qcc73f275jg` (biomotors-taller-demo), branch `main` y origen del mismo repositorio.

**Acción real:** una llamada `trigger_deploy` Render del mismo servicio, `clearCache:false`, sin crear servicio ni cambiar variables. Despliegue `dep-dc09s9jncjis7387ghv0`, commit `7da13a3f7c1f9a396c777515ce911674a10bde33`, `createdAt=2026-11-20T19:23:18.462491Z`, `finishedAt=2026-11-20T19:23:40.380081Z`, `status=live` confirmado por `get_deploy`. Previo LIVE `dep-dc086ugm7kps73d78ue0` apuntaba a `bd9c8e5`. Dirección comercial: `https://bytetorque.cl`; [servicio Render](https://dashboard.render.com/static/srv-dbqe4quc6qcc73f275jg).

**Límites:** se desplegó el paquete completo de `main` en frontend/PWA. No se ejecutaron modificaciones de Supabase alojado, migraciones SQL, RLS/Auth, Edge, Storage, correo, pagos, variables/flags, otros servicios, Android nativo, OTA ni APK. No se introdujeron escrituras deliberadas a datos por el agente. La certificación del build en Render no es QA manual real ni ensayo de seguridad integral; SEC-07, R05–R08 y la autorización del piloto Ignacio permanecen pendientes.

**Comprobación por propietario (QA con datos ficticios y sesión propia):** (1) abrir una OT y formulario con texto no enviado; (2) cambiar de ventana, hacer captura y regresar sin pantalla de acceso ni pérdida de cursor/scroll; (3) navegar Inicio → Clientes/vehículos → Órdenes → Cotizaciones → Configuración y volver a los contextos originales; (4) probar botón atrás/adelante; (5) verificar que desconexión/revocación sí oculte datos; (6) repetir desde Safari iPhone/PWA física. No prometer conservación de estado completo ante cierre forzado, nueva carga de documento o descarte de pestaña por el sistema operativo. No guardar capturas con datos privados en GitHub. Reportar cualquier fallo reproducible con módulo, pasos, navegador y estado de guardado.
