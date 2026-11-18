# ByteTorque — Checkpoint CP06 · Historial integrado y continuidad de navegación

**Fecha:** 18/11/2026. **Rama única:** `main`. **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`.

**Punto de partida:** `ad27f0c98dd19b82e058c518b31f2b7c2b38d13f` (CP05 código candidato cerrado).  
**Código final probado:** `1502b24e34b53f49edc4febe8c4427a140ee09a4`.  
**GitHub Actions:** [44329359449](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44329359449) — **SUCCESS** (Web/iOS PWA, Android React Native/Expo).  
**Estado CP06:** **código candidato integrado y verificado**, NO declarado operativo en el taller real; no se activan flags nuevos.

## Cambios específicos

1. **`src/historial/repository.ts`: cotizaciones sin truncamiento arbitrario.** La búsqueda CP05 por visitas deja de usar `limit(20)` sin seguimiento y reutiliza `allRows()` con keyset `created_at DESC, id DESC`, `order_id IN (visitas)`, `workshop_id` y `vehicle_id` comprobados. Obtiene cotizaciones dentro del alcance completo de las visitas cargadas y luego sus revisiones/eventos históricos. La restricción SQL actual de CP05 ya impone **única cotización por OT**; este control previene truncamiento en futuras extensiones/importaciones. No altera RLS ni consulta CP05 cuando el flag está OFF. En fallo de SQL opcional se conserva el historial CP03/CP04 y se marca cotización no disponible.
2. **`src/historial/VehicleHistory.tsx`: continuidad de navegación.** Abrir una OT CP04 o cotización CP05 ya no desmonta `HistoryView`; queda oculta mientras se consulta el documento. Al pulsar «Volver al historial» se conserva el listado de páginas ya cargadas y se restaura el desplazamiento de la pantalla con doble frame. El documento continúa sujeto a la misma identidad/rol/taller y al flag CP05. No se almacena historial de cliente en el navegador ni se crean páginas públicas.
3. **`src/historial/history.test.ts`: cobertura de consultas históricas.** Se actualizó el fixture de cotización sintética con `created_at` realista y se añadieron dos regresiones: más de 20 cotizaciones y 225 cotizaciones con timestamps idénticos para probar paginación keyset y ausencia de omisión. Son pruebas de robustez del lector, **no** afirmación de que el SQL actual permita 225 cotizaciones por una OT.
4. **`roadmap.md`:** CP06 conserva su historial anterior, pero marca claramente el estado vigente de código, pruebas y pendientes. **BT-PILOT-QA-04 sigue «A REPASAR» al final**, como pidió el titular.

## Capacidades CP06 que ya existían y no se reconstruyeron

- **«Ver historial»** en la ficha de vehículo CP03 mediante binding verificado Auth R1.
- Cronología de órdenes CP04 con motivo, fecha, kilometraje, estatus, X/observaciones y resolución sin afirmar falsamente reparación por el simple cierre.
- **«Problemas pendientes»** visibles aunque la OT se haya cerrado; acceso a la orden de origen.
- Paginación de visitas y hallazgos independiente de la lista de últimas 40 OT.
- Cotizaciones CP05 con revisiones/snapshots históricos y eventos cuando CP05 esté autorizado; sin datos DEMO en vistas privadas.
- **Descarga candidata** del PDF inmutable de una revisión CP05 histórica: valida taller, vehículo, cotización y revisión antes de usar el cliente de documentos. El cliente verifica bytes y SHA-256, el backend exige permisos de taller y archivo privado. **Botón OFF** hasta activar expresamente CP05 Storage/Edge.
- Roles y tenencia revalidados en el repositorio read-only; resultados de otra sesión/cuenta no se conservan como autorizados.

## Validación verificable

- [GitHub Actions 44329359449](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44329359449) sobre `1502b24e`: **SUCCESS** jobs Web/iOS PWA y Android.
- Vitest Web **649/649**, 75 archivos; historial `history.test.ts` **19/19** (dos pruebas nuevas). Archivo histórico CP06 y CP05 mantienen sus pruebas anteriores.
- TypeScript/build Web/PWA, comprobación del paquete CP05 Edge offline y compilaciones de candidato privado, Expo Android (sin APK) pasaron en CI.
- Una corrida anterior (`71dc44b`) falló porque el fixture histórico no incluía el campo `created_at` ahora utilizado para el paginado. Se corrigió el fixture y la ejecución final completa aprobó. El fallo anterior no se considera aprobación.
- La preservación de scroll se ha **compilado**, pero falta validar la navegación y posición visual en Safari iPhone físico; no se presenta como prueba visual real.
- Las pruebas de lectura, pertenencia y paginación son SDK/HTTP de ensayo y CI, no prueba de RLS alojado con los dispositivos de Ignacio.

## Fronteras preservadas

- **Supabase alojado:** sin migraciones ni cambios de tablas, permisos, Auth, talleres, clientes, órdenes, cotizaciones, Storage, Edge, RLS o datos.
- **Render/bytetorque.cl:** sin nuevos flags ni despliegue de producción solicitado; commits de código incluyen `[skip render]`.
- **CP05 emisión PDF archivado y correo:** siguen OFF, sin bucket/Edge/clave de proveedor activados. Cotizaciones de prueba ya existentes se conservan.
- **Android:** sigue con pantallas nativas de datos ficticios y contratos candidatos; no se generó APK ni se conectaron clientes reales.
- **Respaldo y seguridad:** restauración integral actualizada (BD, Auth, roles/Storage), privacidad y pruebas de seguridad finales pendientes; no usar aún datos personales reales de clientes de Ignacio.
- Sin pagos, Full permanente de Ignacio, email a clientes, cambio de rol ni cambio de visibilidad del repositorio.

## Próxima prioridad funcional

**Cerrar el flujo de extremo a extremo CP03 → CP04 → CP05 → CP06** y el cierre documental (informe técnico/entrega, diferencia entre cotizado y ejecutado, sin falsos envíos), aprovechando código existente. Preparar lo que falte como código/contratos con pruebas concentradas y sin activar servicios productivos. Luego, en el PC personal, respaldo integral recuperable y restauración aislada; con autorización específica, activar Storage/Edge CP05 y validar documentos alojados/RLS A-B/dispositivos físicos. **BT-PILOT-QA-04: A REPASAR junto a seguridad final.** No reiniciar ni inventar nuevos paneles; solo `main`, R2 aprobado y checkpoint por entrega sustantiva.
