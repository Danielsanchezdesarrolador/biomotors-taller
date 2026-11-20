# ByteTorque · CHECKPOINT BT-PILOT-QA-04C — observaciones vigentes del multipunto

**Fecha:** 20/11/2026 · **Rama:** `main` · **Estado:** CORRECCIÓN CANDIDATA, CI general PASS, sin publicación en Render ni migraciones.

## Problema observado

En captura del titular de la orden QA1234, sección «Inspección multipunto» y «Observaciones pendientes del vehículo», un ítem marcado primero «Requiere atención» o «Cambio inmediato» persistía como pendiente al volver a marcarlo «OK». La interfaz de PDF también informaba «Completa las observaciones técnicas provisionales» por notas viejas, pese a existir cambios posteriores. El usuario solicita que **deje de aparecer entre pendientes**, no autoriza eliminar historia técnica.

## Causa técnica comprobada

1. `cp04Repository.pendingForVehicle()` consultaba únicamente `resolution='pending'`, lo que excluye deliberadamente los nuevos OK de la lectura y deja visible el diagnóstico previo.
2. `Cp04OrdersView.multipuntoCommitted()` hacía `setPending()` por **ID de hallazgo**; cambiar la X crea un nuevo hallazgo con UUID distinto, por lo que un nuevo OK no quitaba la atención antigua.
3. `Cp04AutosaveQueue.hasIncompleteNotes`, el cierre de OT y `Cp04MultipuntoPdfPreview` evaluaban provisionales históricos sin considerar la X confirmada más reciente; el PDF podía quedar bloqueado indebidamente.

## Corrección implementada

- `src/ordenes/cp04Contracts.ts`: `effectivePendingFindings` calcula estado vigente por **categoría exacta** de multipunto, `workshop_id` y `vehicle_id`, ordenando por fecha/ID; solo OK o nueva atención definitivos pueden superar la observación anterior, nunca «Sin revisar». Atención nueva vuelve a figurar. Una atención explícitamente resuelta tampoco figura. **Frenos/otras categorías genéricas** mantienen sus pendientes históricos separados, pues distintos diagnósticos pueden ser asuntos independientes. No existe DELETE, actualización automática de `resolved_at`, ni falsa marca de reparación realizada.
- `src/ordenes/cp04Repository.ts`: reemplaza SELECT solo pendiente por lectura de hallazgos del vehículo autenticado y taller con paginación keyset `created_at/id` (200 por página; límite de seguridad de 100 iteraciones, falla explícitamente en vez de omitir datos). Guardas existentes de sesión, rol y RLS permanecen.
- `src/ordenes/Cp04OrdersView.tsx`: tras confirmación del nuevo resultado, recalcula pendientes del componente y mantiene ficha histórica. El bloqueo para cerrar usa solo provisional vigente.
- `src/ordenes/cp04Autosave.ts` y `Cp04MultipuntoPdfPreview.tsx`: los diagnósticos provisionales ya superados no bloquean ni PDF ni cierre; los cambios sin guardar y pendientes actuales **sí bloquean** hasta la confirmación.
- `src/historial/repository.ts`: la lectura de pendientes CP06 comparte exactamente el mismo criterio; el historial completo por visita se conserva sin alteraciones.
- Cuatro suites con regresiones para A→OK, urgente→OK (misma proyección), OK→A, «Sin revisar», etiquetas genéricas, aislamiento entre talleres/vehículos, persistencia histórica y desbloqueo PDF tras acuse, incluidas validaciones por repositorio CP04 e historial CP06.

## Incidentes y soluciones documentados

- **QA04C-INC-01 (20/11/2026):** el primer CI general [44774595284](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774595284) FAIL `TS1005 ';' expected` en `cp04Contracts.test.ts:33`, `cp04Autosave.test.ts:196` y `cp04Repository.test.ts:75`. **Causa comprobada:** empalme de dos llamadas `it()` en una misma línea al insertar las pruebas. Solución `e2a86e`: agregar separadores de línea. No fue fallo de aplicación ni base de datos.
- **QA04C-INC-02 (20/11/2026):** segunda corrida [44774844624](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774844624) FAIL `TS6133: findingCols is declared but its value is never read` en `src/historial/repository.ts:24`. **Causa comprobada:** proyección previa sin uso tras reutilizar la lectura paginada `allRows`. Solución `e617542`: retirar constante obsoleta; sin cambio funcional adicional.

## Pruebas y publicación

- Código `3c68daf89205a76fe76f377fdd226a608d821351`, corrección de tests `e2a86e6408921036217ff6beaf7eef36e6336053`, corrección TS `e617542127076aedf47da5c616ba3f6476fcafec`.
- [CI general #44774998665](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774998665): **SUCCESS** Web/PWA y Android; 84/84 archivos Vitest con pruebas de contratos (8), autosave (10), repositorio CP04 (6), historial (20), TypeScript y builds privados comprobados. [QA navegador #44774998785](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774998785) estaba en curso al redactar; verificar estado exacto antes de declarar la regresión de navegador PASS.
- **NO** se ejecutó nueva publicación en Render, migraciones SQL, modificaciones alojadas en Supabase, Auth/RLS/Storage/Edge, datos, backup, restauración, correos, cobros ni APK. Producción sigue en `dep-dc074fec6qcc73bafvag` commit `f757daf2` (PDF multipunto, sin esta corrección). No autorizar piloto real; SEC-07 permanece separado.

## Validación pendiente y siguiente acción

1. Comprobar conclusión del workflow visual [QA navegador #44774998785](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44774998785); diagnosticar cualquier fallo sin simular PASS.
2. Con nueva autorización expresa de despliegue funcional, publicar el HEAD candidato ya aprobado en CI, manteniendo flags y backend alojado sin cambios.
3. Usuario valida QA1234 con una X previamente pendiente que pasa a **OK**, espera confirmación de servidor; verifica que salga de «Observaciones pendientes» y que no bloquee PDF por nota antigua, pero que siga en histórico. Probar retorno/recarga y viceversa atención nueva, además de iPhone. Mientras haya otras notas técnicas provisionales realmente pendientes, el PDF debe continuar bloqueado por esas.
4. Seguir QA R05–R08, dispositivos físicos y SEC-07 bajo sus puertas existentes; eventualmente optimizar lectura actual por índice/vista servidor aprobada si la historia se vuelve extensa, sin cambiar semántica.
