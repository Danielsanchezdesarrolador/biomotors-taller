# ByteTorque · Checkpoint BT-ANDROID-02 — Integración funcional OFFLINE

**Fecha:** 18/11/2026  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`  
**Rama única:** `main`  
**Base:** BT-ANDROID-01, commit `24b2702c4a87b2f5af52586a25305aba715eaa9f`  
**Último commit de código validado:** `8a97e0b7fd8ab3f7747d77d41a6a5d1badeb9a5f`  
**GitHub Actions:** [44314194949](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44314194949) — **SUCCESS, Android y Web/iOS PWA**.

## Resultado y alcance aprobado

Completada en código la preparación funcional del cliente **React Native + Expo** bajo R2, reutilizando `apps/android/`, sin WebView. El trabajo crea **solo adaptadores de lectura ficticia**: no conecta la APK a Supabase, no usa Auth real, no ejecuta operaciones de escritura, no guarda sesiones en disco ni accede a clientes o talleres reales.

### Acceso y navegación de laboratorio

- Se agregó una puerta explícita de **sesión simulada**: Administrador Taller ficticio A, Mecánico Taller ficticio A y Administrador Taller ficticio B. **No es login ni autorización segura de servidor**. La sesión vive en memoria, vence lógicamente y se borra al salir.
- El Inicio usa los datos del taller y rol de prueba, sin mostrar las antiguas métricas fijas de otro taller.
- Navegación: Inicio → OT → cotizaciones de esa OT → OT, y Clientes/vehículos → historial por vehículo → OT.
- Configuración permite simular desconexión, recuperación y vencimiento, conservando bloqueadas las acciones reales.
- El mecánico solo ve órdenes ficticias asignadas; los módulos de directorio, cotizaciones y administración responden con acceso denegado en el simulador.
- Se mantienen diseño R2, navegación de cinco secciones, identidades visuales y recursos existentes.

### Datos y contratos

Archivo `apps/android/data/demoGateway.ts`:
- Tipos y operaciones de consulta de OT, clientes, vehículos, historial de visitas, cotizaciones con partidas/total y configuración.
- Fixtures **completamente sintéticos** de dos talleres A/B, con ID y patente de ejemplo, sin credenciales ni tráfico de red.
- Filtro obligatorio por taller de prueba en listados y fichas; consultas directas a identificadores del otro taller o inexistentes responden `NOT_FOUND`.
- Respuestas tipadas para `SESSION_REQUIRED`, `SESSION_EXPIRED`, `FORBIDDEN`, `OFFLINE`, `SERVER_ERROR` y `NOT_FOUND`.
- Ninguna función crea, edita, elimina, firma, envía o descarga registros/documentos. Este filtrado local **no equivale a RLS ni a seguridad backend**.

Archivos intervenidos:
- `apps/android/App.tsx`: entrada de laboratorio, Inicio acotado y navegación vinculada.
- `apps/android/screens/NativeModules.tsx`: cuatro paneles R2 alimentados desde el adaptador, historial y detalles relacionados.
- `apps/android/data/demoGateway.ts`: contrato tipado + datos falsos.
- `apps/android/scripts/test-demo-gateway.mjs`: pruebas unitarias de contratos, roles, aislamiento A/B, referencias, expiración, errores y recuperación.
- `apps/android/scripts/verify-config.mjs`: verificación de límites sin WebView/fetch/SDK Supabase y nueva fuente de fixtures.
- `apps/android/package.json`: `npm run test:contracts`.
- `.github/workflows/ci.yml`: nuevo paso de pruebas de contratos Android.
- `apps/android/README.md`: guía de laboratorio y riesgos.

## Evidencia validada

**CI 44314194949 (commit de código `8a97e0b`): SUCCESS**
- Job Android: TypeScript, compatibilidad Expo, exportación del bundle Android **sin APK**, `verify-config`, y suite `test:contracts` **PASS**.
- Job Web/iOS PWA: TypeScript, pruebas web, build y validaciones offline heredadas **PASS**.
- La suite cubre invitados sin sesión, separación de talleres A/B, consultas directas ajenas, rol mecánico, historial, relaciones sintéticas, caducidad, fallos de red/servidor y recuperación.
- No se ha probado instalación física en Android, APK firmada, flujo real de autenticación, fotos ni resiliencia con datos productivos.

## Estado de servicios y protecciones

- **Render/web:** sin cambios de despliegue solicitados; los commits de código de esta etapa incluyen `[skip render]`.
- **Supabase:** sin nuevas migraciones SQL instaladas; sin tocar tablas/RLS, Auth, Storage, Edge, datos ni cuentas reales.
- **Credenciales:** ninguna solicitada ni copiada al proyecto Android.
- **Respaldos:** siguen pendientes el respaldo cifrado verificable, cobertura integral y ensayo de restauración aislada desde computador personal.
- **APK/OTA/cobros:** NO generados, NO distribuidos, NO activados.

## Próxima etapa recomendada: BT-PILOT-QA-01

Construir y revisar la **matriz integral de aceptación del piloto Ignacio** comparando web, PWA Safari y Android: inicio de sesión, rol administrador/mecánico, aislamiento A/B, recepción y reingreso, multipunto 34 elementos y autosave, cotización con revisión y totales, PDF R3/archivo privado, historial, accesibilidad, offline/reconexión, sesión vencida y límites de planes. Clasificar cada caso como `verificado en código/CI`, `simulado`, `pendiente en dispositivo` o `bloqueado por seguridad`. No inventar PASS para pruebas físicas o backend.

Luego preparar los adaptadores **reales candidatos** con validación multitenant de servidor y activarlos exclusivamente tras respaldo y restauración verificados, autorización expresa y pruebas de seguridad. No construir atajos con el adaptador DEMO.

## Reglas de continuidad

1. Trabajar exclusivamente en `main`; no reconstruir aplicaciones ni abrir nuevas ramas/entornos sin aprobación.
2. Preservar el diseño R2 y los módulos web actuales. Ignacio usará el piloto solo después de las barreras de seguridad.
3. No habilitar Auth, migraciones, Storage, Edge, emails, pagos, PDF real, OTA ni APK pública por este checkpoint.
4. Al cerrar cada siguiente tarea, documentar commit, CI, estado alojado, riesgos y paso siguiente en `docs/checkpoints/`.
5. Confirmar privacidad del repositorio antes de procesos sensibles de exportación o migración; no confundir simulación local con aislamiento productivo.
