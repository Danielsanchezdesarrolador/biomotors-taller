# ByteTorque — BT-ANDROID-01 · Cinco pantallas R2 nativas (checkpoint)

**Fecha:** 18/11/2026. **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`, visibilidad pública temporal autorizada por el titular. **Rama única:** `main`. **Hosting web:** `bytetorque.cl` sobre el Render actual.

## Objetivo

Avanzar hacia un cliente Android realmente útil sin reconstruir ni mezclar los módulos web. El usuario decidió adelantar desarrollo de código/interfaz y dejar para su computador personal la fase de respaldos, recuperación y activación de seguridad. **Esto NO autoriza a usar información real sin protecciones ni a activar SQL/Storage/Auth/Edge/cobros.**

## Cambios publicados

1. **`45b626011bb12dd4e17231fed992d65b1791e0a1`**: creación de `apps/android/screens/NativeModules.tsx` con cuatro pantallas React Native independientes y R2 premium: Órdenes, Clientes y vehículos, Informes y cotizaciones, Configuración. Se reemplazaron los cuatro paneles de «Próximamente» del shell por estas vistas mediante `apps/android/App.tsx`.
2. **`fb5d725617346737d2e3c348a8e4d6dea599d7dd`**: ajuste para evitar banners DEMO duplicados, importación de tipos nativos de React, verificación adicional de límites del prototipo en `apps/android/scripts/verify-config.mjs` y documentación en `apps/android/README.md`.

## Contenido por pantalla

- **Inicio (preexistente):** conserva métricas, órdenes ficticias, estados y accesos; tocar una OT ahora abre el módulo nativo de Órdenes con el ID de ejemplo seleccionado.
- **Órdenes:** búsqueda y filtros, inspección visual del estado y ficha nativa con OT, patente, vehículo, cliente, kilometraje y motivo ficticios. Escritura/inspección reales bloqueadas.
- **Clientes y vehículos:** búsqueda y fichas de ejemplo con botón de historial real bloqueado hasta validar la sesión y permisos.
- **Informes y cotizaciones:** listado y detalle de documentos rotulados como ficticios, totales de presentación y botón de descarga archivada bloqueado; **no** descarga PDF ni simula aceptación.
- **Configuración:** ficha ficticia, reglas comerciales vigentes y secciones de permisos, plantillas y respaldos todavía pendientes. Básico personal gratuito; Plus USD 5 / 4 mecánicos; Full USD 15 / 8 mecánicos; adicional USD 2/mes pagado solo por el dueño.

Todo es **React Native nativo**, sin WebView; botones y pestañas con tamaños táctiles, colores R2 navy/azul y mensajes de modo DEMO en cada módulo. Se conserva `apps/android/` y su manifiesto/paquete actual.

## Evidencia comprobada

- GitHub Actions `44310171641` sobre `fb5d725`: **SUCCESS**, incluyendo TypeScript Android, compatibilidad de Expo, bundle Metro Android (NO APK firmada), `npm run verify-config`, TypeScript/Vitest/build Web/PWA y comprobaciones locales SQL de otros módulos. Ver [ejecución](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44310171641).
- El nuevo verificador comprueba nombres de las cuatro pantallas, presencia de datos ficticios y ausencia de llamadas `fetch()`, `createClient()`, `.from()` y WebView en el módulo. No sustituye una auditoría formal ni pruebas físicas.
- **Render no cambió** (commits con `[skip render]`). **Supabase no cambió:** sin migraciones, escrituras ni almacenamiento. No se generó APK, no se hizo distribución, no se ejecutaron pruebas en dispositivo real y no se integraron sesiones.
- No se han solicitado ni guardado claves de Supabase, clientes reales, credenciales ni copias de seguridad en el PC del trabajo.

## Definición de terminado / alcance real

**BT-ANDROID-01 interfaz y navegación DEMO: terminado en código y CI.** **Android operativo con datos reales: PENDIENTE.** No afirmar que hay paridad real Web/Android; hoy son cuatro vistas de preparación, no un CRUD multitenant.

## Ruta siguiente hasta el piloto de Ignacio

### Desarrollo que se puede adelantar remotamente
1. **BT-ANDROID-02 · Contratos y flujos nativos seguros candidatos:** preparar adaptadores y estados de lectura, navegación y errores de sesión para CP03/CP04/CP05/CP06, con datos sintéticos y test de aislamiento de talleres. No conectar Supabase real, no permitir escrituras, ni activar flags alojados hasta respaldo y autorización.
2. **BT-PILOT-QA · Matriz de aceptación:** reunir pruebas de ingreso, recepción, multipunto de 34 X, cotización PDF R3, historial y permisos para dueño/mecánico, en escritorio/iPhone/Android. Marcar pruebas simuladas frente a pruebas físicas con cuentas reales.
3. **BT-CP05/06 · Preparación final de documentos:** completar pruebas offline de archivo privado, revisiones y recuperación sin activar correos ni Storage real.
4. **BT-PLAN04/08 · Reglas de licencias y cobranza:** terminar código candidato y pruebas de Plus/Full/cupos de mecánicos/add-ons, mantener pagos OFF hasta contratación/pasarela/compliance.

### Puerta final en el computador personal
1. Repositorio privado antes de cualquier workflow de exportación sensible.
2. **Respaldo integral cifrado y verificable**, cubriendo base, Auth, políticas/roles, Storage y configuración necesaria; ensayo de **restauración aislada**. No ejecutar restauración destructiva en producción.
3. Revisión de migraciones candidatas 04B/04C, CP05 buckets/RLS, servicio Edge de archivo privado y plantillas Plus/Full; instalación autorizada por paso con QA multitenant A/B, reversibilidad y capturas de evidencia.
4. Sesiones y MFA reales, validación de propiedad/roles, PDF emitido/descargado íntegro, correo solo tras autorización, QA iPhone/Android, APK firmada y prueba real supervisada con Ignacio.
5. Luego CP07 con 3–5 talleres externos; CP08 pagos recurrentes; CP09 escalado. Nunca comercializar con el respaldo/aislamiento incompletos.

## Reglas permanentes de continuidad

- Siempre `main`; no reconstrucción, no ramas ni entornos nuevos sin permiso.
- Cada tarea terminada debe documentarse en `docs/checkpoints/` con commits, CI, estado alojado, migraciones instaladas/no instaladas, riesgos y siguiente etapa.
- El software, marca y código siguen siendo propiedad exclusiva del titular. Ignacio recibirá Full permanente cuando la cuenta esté creada, confirmada y la plataforma preparada.
- **La seguridad no es un paso opcional posterior al lanzamiento.** Se pueden construir piezas candidatas primero; ninguna escritura con clientes reales, emisión, respaldo productivo ni activación de pagos sin pruebas y autorización.
