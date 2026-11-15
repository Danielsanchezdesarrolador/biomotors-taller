# ByteTorque — Checkpoint BT-CP03-P2 · Repositorio de clientes y vehículos no público

**Fecha:** 15/11/2026 (Chile). **Rama:** `main`. **Prioridad:** taller operativo de Ignacio antes de CP07–CP09. Punto de partida: CP03-P1 [`303570492fe8f9f603db9c65842f31626de9ffa1`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/303570492fe8f9f603db9c65842f31626de9ffa1).

## Qué se implementó

- `src/clientes/cp03PilotContracts.ts` define entidades `customers`/`vehicles` compatibles con SQL candidato CP03-P1; normalización del móvil chileno, correo, patente, límites de nombre/modelo, UUID, kilometraje y año. No se reutilizan registros DEMO ni se obliga a capturar RUT.
- `src/clientes/cp03PilotRepository.ts` utiliza el API tipado de `@supabase/supabase-js`, **solo cuando se inyecte un cliente autorizado en el futuro**. `search(term)` distingue nombre, correo, teléfono y patente normalizada. `getCustomer(id)`, `getVehicle(id)` recuperan fichas estables; `vehiclesForCustomer(id)` las enlaza. `createCustomer`, `createVehicle`, `updateCustomer`, `updateVehicle` están implementados como llamadas PostgREST candidatas.
- El contexto `Context` corresponde al `AuthController` R1, pero el repositorio reconsulta `getUser` real, correo confirmado, membresía activa con rol coincidente y taller activo en cada operación; no usa metadata del navegador para autorizar. Mecánico lee; owner/admin/recepción pueden solicitar mutaciones, cuyo permiso definitivo depende de RLS en PostgreSQL.
- Cada consulta filtra por `workshop_id`; las escrituras no aceptan `created_by`, rol, plan ni tenant arbitrario desde formularios. Para actualizar exige `id` y `updated_at` esperado; 0 filas equivale a **conflicto** (no éxito). Mapea errores PostgreSQL a estados genéricos sin exponer correos/SQL/secretos.
- `dispose()` invalida la instancia candidata al cambiar o cerrar contexto. **La integración futura deberá asegurar que el ciclo de vida de sesión invoque `dispose()`**; actualmente no está montada ni existe botón operativo de guardado.
- `scripts/verify-official-bundle.mjs` comprueba que `cp03PilotRepository` y `cp03PilotContracts` estén excluidos del paquete web/PWA oficial. No se cambiaron las cinco pantallas R2, los archivos de arte o Android nativo.

## Evidencia real y límites

- [GitHub Actions CI principal #43728820248](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43728820248): web TypeScript, Vitest **460/460 PASS** (45 archivos), build PWA y Android Expo (sin APK). El CI de cierre documental debe comprobarse por separado.
- Los tests de `cp03PilotRepository.test.ts` usan un **SDK Supabase simulado**, no datos reales ni la API alojada; sí comprueban las cadenas de filtros, operaciones y denegaciones previstas. El laboratorio PostgreSQL 17 con RLS real pertenece a [CP03-P1 #43727156893](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43727156893), **no reejecutado como E2E del repositorio P2**.
- Se realizó una consulta **solo lectura** de inventario Supabase `suxcqqnmcjoezfxltoms`: existen únicamente `public.workshops`, `public.profiles` y `public.workshop_memberships`. `public.customers` y `public.vehicles` **NO existen aún** en el entorno alojado.
- Regresiones iniciales corregidas: firma TypeScript de `from()` en test, y mock `maybeSingle()` que devolvía colección en lugar de una fila. No afirmar PASS de esos commits previos fallidos.
- **No hubo migración alojada, pruebas con clientes reales, clave secreta, envío de correo, cambio de Render intencional, registro público ni conexión del repositorio CP03 al frontend.** La demo pública sigue sin permitir guardado real.

## Puertas siguientes

1. **Permiso A (separado):** revisar/aprobar instalación de `docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql` en Supabase `suxcqqnmcjoezfxltoms`, con comprobación de estructura existente, respaldos, SQL reversible y auditoría posterior RLS A/B. No ejecutar sin autorización específica.
2. **Permiso B (separado):** configurar experiencia de usuarios y consentimiento de datos reales para taller piloto, roles confirmados y navegador/Safari seguro. Probar Auth R1 con usuario del taller autorizado. Sin carga de información personal antes de aprobar privacidad y autorización.
3. Solo después integrar los componentes visuales aprobados de Clientes y vehículos al repositorio y ensayar crear → cerrar sesión → volver → buscar ficha por ID/patente, además de edición simultánea y acceso cruzado negativo. No confundir `typecheck` con operatividad de Ignacio.
4. Cuando CP03 funcione, continuar CP04 órdenes/inspección, CP05 PDF/correo y CP06 historial/respaldo; CP07–CP09 siguen aplazados.

La matriz de aceptación del piloto se mantiene en [docs/BT_PILOTO_IGNACIO_MATRIZ_ACEPTACION.md](../BT_PILOTO_IGNACIO_MATRIZ_ACEPTACION.md).
