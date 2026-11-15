# ByteTorque — CHECKPOINT BT-CP03-P3 · UI real candidata, todavía no operativa

**Fecha:** 15 de noviembre de 2026, Chile. **Rama exclusiva:** `main`. **Base:** `ad94376dd133e762944ed85b9a83cd20978b5b4e` (CP03-P2).
**Prioridad:** operación completa del taller de Ignacio; comercialización CP07–CP09 aplazada.

## Implementación que ya existe en GitHub

1. `src/clientes/cp03PilotDirectoryView.tsx`: componente React independiente y NO montado en `App`, `RealAccess`, `OfficialPanel` ni sitio Render. Recibe un `PilotDirectoryPort` inyectado y un rol del contexto autorizado. No tiene cliente Supabase global, token, clave de servicio, storage ni seeds DEMO.
2. `src/clientes/cp03PilotDirectory.css`: reutiliza tarjetas, colores y tipografía aprobados — sidebar navy, fondos claros y azul — con responsive para móvil sin reemplazar los cinco paneles oficiales.
3. `src/clientes/cp03PilotRepository.ts`: `recentCustomers()` realiza consulta limitada a 25 clientes no archivados del taller después de validar identidad, membresía y workshop activos. Reutiliza operaciones P2 de búsqueda, lectura por ID, crear/editar cliente/vehículo y carga de vehículos asociados.
4. UI preparada: buscar nombre/correo/móvil/patente; resultados por cliente y vehículo; navegación a ficha por identificador estable; alta/edición de cliente; alta/edición de vehículo asociado; validación de números, teléfono y campos; estado vacío, guardado en progreso, error claro y comprobación básica de correo ya existente antes de crear cliente sin fusionar automáticamente.
5. `scripts/verify-official-bundle.mjs` añade `cp03PilotDirectoryView` a la exclusión de código candidato del bundle público (junto a los módulos de sesión/invitaciones y repositorio CP03).

## Evidencia y controles

- [CI funcional #43730500005](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43730500005): **SUCCESS**, Web/iOS PWA y Android Expo, **46 archivos y 465/465 Vitest**, TypeScript, build PWA y exclusión de candidatos. No se generó una APK.
- `src/clientes/cp03PilotDirectoryView.test.tsx` valida contratos de renderizado por rol y ausencia de solicitudes en SSR; `cp03PilotRepository.test.ts` extiende la consulta de fichas recientes a filtros de tenant/archivado y limitación. **No son pruebas de funcionamiento con navegador iPhone, Supabase alojado ni datos reales.**
- Pruebas SQL PostgreSQL 17 de CP03-P1 [#43727156893](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43727156893) siguen siendo evidencia previa de RLS, FK y patentes, no un E2E de la UI P3.
- El responsable del futuro montaje autenticado deberá llamar a `repository.dispose()` al cerrar sesión, perder permisos o cambiar de taller; la vista P3 cancela respuestas tardías de la pantalla, pero no sustituye este control de sesión.
- La comprobación previa de correo duplicado es **orientativa, no una restricción única atómica**. Compartir correo puede ser legítimo; definir con Ignacio política de duplicados de clientes antes de operar. Una casilla de autorización en el formulario **no registra consentimiento jurídicamente**; sigue pendiente integrar avisos, propósito, retención y trazabilidad.
- El sitio oficial conserva estados vacíos, sin formulario activo y sin cliente/vehículo reales. No hubo SQL alojado, cambios de Auth/Edge/secretos, correos reales, cobros o alta de información personal.

## Bloqueadores reales y siguiente acción

- Autorizar por separado el despliegue de `docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql` en Supabase `suxcqqnmcjoezfxltoms`, con revisión de seguridad, política de restauración y test RLS A/B hospedado.
- Autorizar y validar el acceso real del taller piloto, privacidad y permisos de captura; ensayar la PWA en Safari físico. Las invitaciones de R2-A6-10 permanecen 503 y no autorizadas.
- Conectar el componente P3 a `AuthController` y el repositorio P2, crear/editar una ficha sintética autorizada en entorno hospedado, salir, volver a entrar y recuperar por patente/ID. Solo después habilitar datos de Ignacio de acuerdo con la aprobación correspondiente.
- No avanzar CP07–CP09 ni afirmar que el taller ya puede operar.

La matriz oficial está en [BT_PILOTO_IGNACIO_MATRIZ_ACEPTACION.md](../BT_PILOTO_IGNACIO_MATRIZ_ACEPTACION.md). El cierre documental de este checkpoint requiere que la ejecución GitHub Actions del commit de documentación termine en SUCCESS.
