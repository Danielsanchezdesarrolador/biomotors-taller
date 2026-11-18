# ByteTorque — Checkpoint BT-PILOT-QA-02 · Recorridos por rol y dispositivo

**Fecha:** 18/11/2026 · **Rama única:** `main` · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`.

**Base de continuidad:** `ffeedc77e4f9c8d0ceb9714bbe8d0da4e76121f7` (BT-PILOT-QA-01).  
**Código final validado:** `f8fce76a1af4ad738b482423120db266d762b39b`.  
**GitHub Actions:** [44318146031](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44318146031) — **SUCCESS**, jobs **Web/iOS PWA** y **Android React Native / Expo**.

## Entrega completada

### 1. Recorridos de aceptación sin resultados inventados

- [`docs/qa/BT_PILOT_QA_02_RECORRIDOS.json`](../qa/BT_PILOT_QA_02_RECORRIDOS.json): **18 escenarios** con perfil, plataforma, taller ficticio, fase, puertas obligatorias, lista de casos P01–P38 y pasos esperados.
- [`docs/qa/BT_PILOT_QA_02_RECORRIDOS_20261118.md`](../qa/BT_PILOT_QA_02_RECORRIDOS_20261118.md): manual legible que explica cómo ejecutar cada escenario sin compartir información sensible.
- [`docs/qa/BT_PILOT_QA_02_REGISTRO_EN_BLANCO.csv`](../qa/BT_PILOT_QA_02_REGISTRO_EN_BLANCO.csv): **55 filas de pasos, todas SIN_EJECUTAR**, con campos vacíos para observado, fecha, ejecutor, incidencia y ruta local de evidencia. **No rellenar este documento versionado con datos de clientes ni tokens**.
- `scripts/qa/verify-pilot-journeys.mjs`: validación offline de los 18 recorridos, 55 pasos, cobertura de los **38 casos** (28 P0, 10 P1), correspondencia con la matriz y sus nueve puertas, requisitos de fases reales y coincidencia exacta de JSON/Markdown/CSV.
- El verificador se ejecuta en `.github/workflows/ci.yml` junto al verificador original `verify-pilot-matrix.mjs`.
- Se preservó la matriz original de BT-PILOT-QA-01; sus clasificaciones y puertas NO se promueven automáticamente a PASS.

### 2. Regresión funcional Android de solo lectura

- `apps/android/navigation/demoRoutes.ts` introduce un resolutor de destinos de prueba: la OT enlazada se consulta mediante el gateway sintético antes de abrir un detalle; para la pantalla Informes se comprueba que existe una cotización vinculada. Sin sesión, ID de otro taller, OT no asignada, sesión vencida, conexión simulada caída o permiso denegado => **no abre el deep link**.
- `apps/android/App.tsx` reutiliza el resolutor desde el shell R2, sin cambiar branding ni pestañas; al fallar descarta el foco e informa el bloqueo en vez de abrir un destino ambiguo. Las rutas normales entre pestañas descartan el ID de la orden anterior.
- `apps/android/scripts/test-demo-routes.mjs` incorpora **nueve pruebas adicionales** de navegación A/OT/cotización, historial, foco limpio, sesiones expiradas, mecánico restringido, cambio de taller, OT sin cotización, desconexión y recuperación.
- `apps/android/package.json` ejecuta estas nueve pruebas junto a las diez de `test-demo-gateway.mjs` mediante `npm run test:contracts`.
- `apps/android/tsconfig.json` habilita imports explícitos con extensión `.ts` para interoperar entre Node strip-types y el bundle Expo. No se añadió ningún SDK, plugin nativo o permiso.

### 3. Verificación CI y corrección de fallos

- Un job previo detectó que el import sin extensión no era resoluble desde Node. Se corrigió a `.ts`; TypeScript de Expo requirió activar `allowImportingTsExtensions`, y se validó de nuevo.
- **GitHub Actions 44318146031 / SHA `f8fce76`: SUCCESS** en Web/iOS PWA y Android.
- Android pasó TypeScript, compatibilidad Expo, bundle Metro Android (no APK), tests de contrato y verificador nativo; Web/PWA pasó validación de matrices, TypeScript, Vitest, build y las compilaciones candidatas locales de CI.
- Esta evidencia comprueba **código, consistencia documental y contratos sintéticos**, no instalación Android, sesión de Ignacio, escritura real ni prueba manual de los 55 pasos.

## Límites y servicios intactos

- **Supabase alojado:** NO se cambiaron Auth, RLS, datos, SQL, Edge, Storage, usuarios, roles ni migraciones.
- **Render/bytetorque.cl:** sin activación de flags ni despliegue nuevo solicitado; commits de código marcados `[skip render]`.
- **GitHub:** se conserva una única rama `main`, sin crear ramas adicionales. Repositorio permanece con la visibilidad previa; verificar paso a privado antes de exportaciones sensibles.
- **APK/OTA:** sin generar, firmar, instalar, distribuir ni subir a Play Store.
- **Pagos, correos y archivos reales:** siguen desactivados. Concesión Full permanente de Ignacio NO ejecutada.
- **Respaldo:** NO se ha realizado respaldo integral recuperable/restauración aislada en este bloque. No activar el piloto sin superar esa barrera.
- **Datos:** sin clientes ni vehículos reales, contraseñas, tokens, fotos ni claves.

## Próximo paso recomendado

**BT-PILOT-QA-03 · preparación offline de fallos P0 priorizados:** verificar y endurecer, sin activar infraestructura, los invariantes de borrador/continuidad CP03-CP04, estado de sesión y ausencia de confirmaciones falsas en guardado, manteniendo Android en modo solo lectura. El resultado debe ser un candidato de código con tests focalizados, no un falso PASS productivo.

**Puerta de PC personal:** antes de usar registros de Ignacio, repositorio privado si se usarán exportaciones sensibles, respaldo cifrado integral de base/Auth/roles/Storage y ensayo de restauración AISLADO, después aprobación paso a paso de migraciones 04B/04C, CP03/04, Storage/Edge y QA real multitenant. Completar posteriormente Safari iPhone/Android físico, integridad documental, políticas de privacidad y aprobación de Ignacio.

**Reglas de continuidad:** una sola rama `main`, no reconstruir, mantener el diseño R2 y la propiedad del software; checkpoint después de cada tarea con commit/CI/flags/estado de servicios y siguiente bloque. Nunca reemplazar ejecución física o validación de RLS real por test sintético.
