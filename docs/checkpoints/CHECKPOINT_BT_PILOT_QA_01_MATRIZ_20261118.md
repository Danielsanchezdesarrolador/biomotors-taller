# ByteTorque — Checkpoint BT-PILOT-QA-01 · Matriz de aceptación del piloto

**Fecha:** 18/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama única:** `main`.

**Base:** `439105bc3794ac04f2a388a7527b7605d951c2bc` (checkpoint BT-ANDROID-02).  
**Último commit de código validado:** `7b37ab908bf89e71ab96c2d3a43b05c1c24a5fdf`.  
**CI general validado:** [GitHub Actions #44315925304](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44315925304) — **SUCCESS**, jobs Web/iOS PWA y Android, incluye `node scripts/qa/verify-pilot-matrix.mjs --check`.

## Entrega concreta

1. [Matriz de 38 casos](../qa/BT_PILOT_QA_01_MATRIZ_20261118.md): criterios verificables, prioridad, estado por plataforma (web, iPhone Safari PWA, Android nativo), puertas de seguridad, evidencias de código/checkpoint y protocolo de ejecución controlada.
2. [Manifiesto JSON](../qa/BT_PILOT_QA_01_CASES.json): fuente estructurada de la matriz para futuras rondas; **28 casos P0** y **10 P1**.
3. `scripts/qa/verify-pilot-matrix.mjs`: comprobación offline de tipos de estado, IDs, rutas locales de evidencia, pertenencia a 9 puertas cerradas, clasificación por plataforma y concordancia exacta Markdown/JSON. No consulta red ni servicios externos, no declara PASS operativo.
4. `.github/workflows/ci.yml`: paso de validación offline de matriz insertado en job Web/iOS PWA. Resto de CI, tests y tareas Android preservados.
5. Se mantuvo la matriz heredada BT-QA-01 (13/11) sin sobrescribir; esta entrega es el registro transversal nuevo.

## Resumen de estados de la matriz

| Plataforma | C: código/CI | S: simulado | F: físico parcial previo | D: dispositivo pendiente | B: seguridad bloqueada | N: N/A |
|---|---:|---:|---:|---:|---:|---:|
| Web/escritorio | 15 | 13 | 1 | 0 | 7 | 2 |
| iPhone Safari/PWA | 0 | 0 | 1 | 19 | 17 | 1 |
| Android nativo | 6 | 3 | 0 | 2 | 26 | 1 |

**Interpretación:** C prueba código en CI, S significa fixture/HTTP/SQL simulado y F es evidencia manual parcial anterior, limitada al caso descrito. No existe certificación de uso productivo por plataforma. La experiencia de instalación PWA en iPhone tiene evidencia previa; no supone que los flujos reales estén operativos. El PDF R3 borrador web fue descargado y cotejado por el Director, pero no hay revisión emitida ni archivo privado activo.

### Puertas obligatorias, todas BLOQUEADAS

- `G-BACKUP`: respaldo cifrado integral y restauración aislada con verificación.
- `G-AUTH`: identidad, sesiones, MFA, revocación y acceso real autorizados.
- `G-RLS`: separación de talleres, propietarios y roles para lecturas/escrituras/descargas alojadas.
- `G-DATA`: CP03/CP04 instalados y continuidad/autoguardado real comprobados.
- `G-DOCS`: archivo privado, inmutabilidad/SHA, descarga histórica y proveedor correo por autorización independiente.
- `G-PRIVACY`: tratamiento/retención/consentimiento legítimos para información real.
- `G-PLAN`: suscripciones/cupos/superrol y Full vitalicio Ignacio, con auditoría.
- `G-DEVICE`: pruebas físicas completas iPhone Safari y Android APK interna firmada.
- `G-RELEASE`: migraciones y rollback controlados, repo privado para exportaciones sensibles y autorización final.

## Alcance real y límites

- **Sin nuevas migraciones** y sin modificar Supabase alojado, tablas, usuarios, RLS, Edge, Storage ni sesiones.
- **Sin actualizar Render/bytetorque.cl**: commits con `[skip render]`; se verificó CI de código/documentación, no un nuevo despliegue.
- **Sin datos reales de Ignacio**, claves, copia de respaldo en el equipo de trabajo, OAuth Drive, restauración, correos o pagos.
- **Sin compilar APK firmada ni instalar Android**; el job exportó bundle React Native y verificó contratos offline, no un dispositivo.
- La matriz no sustituye las pruebas reales de usuario, infraestructura ni recuperación. Nunca interpretar 38 casos enumerados como 38 pruebas aprobadas.

## Próximo bloque recomendado — BT-PILOT-QA-02 (preparación de recorridos ejecutables)

1. Preparar una hoja de ejecución guiada por rol y dispositivo con espacios de evidencia/capturas y criterios de rechazo claros, alimentada por IDs P01–P38, sin inventar resultados ni almacenar datos privados.
2. Completar pruebas de integración y regresión **offline** que todavía faltan para escenarios de sesión, ruta de navegación y estado visual; sin activar servicios.
3. Cuando el titular acceda desde su **PC personal**, pasar primero por respaldo integral/restauración y repo privado. Luego autorizar por etapas SQL/Storage/Auth protegidos y ejecutar los P0 con dos cuentas/talleres de prueba reales autorizados.
4. Aprobar los recorridos con Ignacio después de la aceptación física iPhone/Android y del aislamiento backend. Recién entonces evaluar puesta en marcha y comercialización.

**Reglas:** solo `main`, conservar R2 y el código existente; documentar cada cierre con SHA, CI, estado alojado, flags/migraciones y siguiente etapa; no confundir paridad visual Android con paridad funcional.
