# ByteTorque — CP03: puerta única de activación y QA del piloto

**Fecha de preparación:** 15/11/2026. **Responsable de aprobar:** Director del proyecto. **Prioridad:** que Ignacio pueda crear, encontrar y corregir clientes/vehículos con persistencia auténtica. **No es un checkpoint de capacidad concluida.**

## Estado posterior al respaldo y migración

**Migración instalada y verificada.** El 15/11/2026, después de restauración local comprobada de Auth y public (4 usuarios, 2 talleres, 4 perfiles, 4 membresías, 0 relaciones huérfanas, RLS activa), se instaló una sola migración autorizada en Supabase: `20261115205812_bt_cp03_customers_vehicles_tenant_rls`. `public.customers` y `public.vehicles` existen y tienen cero registros, RLS FORCE, seis políticas y FK por taller. El esquema y los registros CP02 se conservaron. Se creó y probó un 7-Zip de cinco archivos sin errores, pero **no se ha confirmado copia externa redundante**; mantenerlo cifrado y privado.

**Integración funcional en código, todavía sin activación:** Auth R1 y el directorio real comparten el mismo cliente Supabase JS; el panel se conecta solo tras sesión autorizada de owner/admin y está protegido por `VITE_BT_CP03_PRIVATE_ENABLED` (OFF de fábrica). La compilación pública sin flag excluye ese código. [CI web + Android + build privado](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43762126353): PASS, 485 pruebas. Ni Render ni las cuentas de usuarios fueron modificadas por este paso.

**Próximo permiso:** aprobar **solo** la activación privada del directorio para cuentas existentes del taller y una prueba con cliente/vehículo completamente ficticios en Supabase alojado; cerrar sesión, reingresar, buscar, editar y recargar; comprobar que la información persista. No se autoriza registro público, uso de datos reales de clientes, invitaciones, correos ni pagos. Aún falta QA físico y la conformidad de Ignacio para declarar CP03 completado.

## Estado anterior documentado (evidencia de preflight; ya superado)


- Supabase `biomotors-taller`, proyecto `suxcqqnmcjoezfxltoms`, está `ACTIVE_HEALTHY` en PostgreSQL 17.11. En `public` existen únicamente `workshops`, `profiles` y `workshop_memberships`, todas con RLS. **No existen aún `customers` ni `vehicles` alojadas**.
- En `main` hay SQL candidata, repositorio Supabase JS, panel React y binding de ciclo Auth, pero **la app oficial todavía no los utiliza**. Las invitaciones de R2, correos y cobros continúan bloqueados.
- Evidencia sintética: [PG17 RLS #43732118545](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43732118545) PASS con bloqueo de taller suspendido, duplicado y aislamiento; [Web + Android #43732118518](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43732118518) PASS con **483/483 Vitest**. No equivale a un registro persistente en Supabase.
- Advertencia read-only de Security Advisor: **Leaked Password Protection Disabled**. Revisar en [Seguridad de contraseñas de Supabase](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No se modificó Auth.

## Estado de la autorización A — preflight del 15/11/2026

**Autorización del Director recibida** para instalar **únicamente** SQL CP03 alojado, una vez verificados los resguardos. La autorización **no incluye** fichas personales, despliegue público, invitaciones, correo, secretos ni pagos.

**INSPECCIÓN PREVIA VERIFICADA (solo lectura; NO se aplicó DDL):**

| Comprobación | Estado |
|---|---|
| Proyecto | `biomotors-taller` — `suxcqqnmcjoezfxltoms` |
| Supabase / PostgreSQL | `ACTIVE_HEALTHY` / 17.11 |
| Plan de la organización | `free` |
| Tablas CP02 | `workshops`: 2 registros; `profiles`: 4; `workshop_memberships`: 4 |
| RLS CP02 | Habilitada en las tres tablas |
| Tablas `customers` / `vehicles` | Inexistentes (0) |
| Función `bt_cp03_touch_updated_at` | Inexistente |
| SQL CP03 candidato | Archivo en `main` validado en PostgreSQL 17 efímero [#43732118545](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43732118545) |
| Respaldo alojado recuperable | **No disponible/verificado** por las herramientas actuales |
| Migración alojada CP03 | **NO EJECUTADA** |

**Motivo de bloqueo:** la [documentación oficial de Supabase sobre respaldos](https://supabase.com/docs/guides/platform/backups) confirma que el plan Free no incluye respaldo automático y recomienda exportaciones manuales mediante CLI. Tampoco incluye recuperación point-in-time. Nuestro método aprobado exige detener la instalación si no se puede comprobar una vía suficiente de recuperación. Una transacción SQL aditiva reduce riesgo, pero **no se debe presentar como respaldo**.

### Alternativa sin contratar un plan de pago

El Director puede preparar un respaldo local protegido usando la [CLI oficial de Supabase](https://supabase.com/docs/reference/cli/introduction) y Docker, desde su propio equipo, sin compartir claves por chat. La CLI v3 exige especificar `--remote` para la base alojada; la ejecución sin esa bandera apunta al entorno local.

1. Instalar CLI y Docker Desktop siguiendo el manual oficial. Desde un directorio **fuera del repositorio** ejecutar `supabase login` y `supabase link --project-ref suxcqqnmcjoezfxltoms`, autenticándose interactivamente.
2. Verificar que el destino mostrado sea exactamente `suxcqqnmcjoezfxltoms`. No copiar contraseñas, conexión o datos del respaldo a GitHub, ChatGPT ni a carpetas públicas.
3. Ejecutar `supabase db dump --remote --schema public -f schema_pre_cp03.sql` y `supabase db dump --remote --schema public --data-only -f data_pre_cp03.sql`. Guardar ambos archivos en ubicación privada protegida. La CLI requiere Docker; comprobar versión, sintaxis con `supabase db dump --help` y el destino **antes** de exportar.
4. Verificar que ambos archivos existen y son legibles, que el segundo refleja las tres tablas CP02, y mantener copia cifrada fuera del equipo. El comando de la CLI excluye `auth` y otros esquemas administrados: este respaldo es **parcial**. No afirmar restauración total de Auth ni usarlo como sustituto de una restauración probada.
5. Acordar explícitamente la suficiencia de la recuperación para el cambio **estrictamente aditivo**. Si el Director requiere recuperación integral de Auth o PITR, utilizar una alternativa de respaldo integral antes de proceder. El asistente no debe ejecutar migración alojada hasta que la protección acordada exista o el Director autorice expresamente operar sin ella.

**Al desbloquear:** consultar HEAD `main`, comprobar esquema y plan, ejecutar una sola vez la migración CP03 con `apply_migration` y nombre identificable, validar en SQL alojado RLS/GRANT/FK, que las tablas sigan vacías y que CP02 conserve sus datos. Ante fallo, dejar UI inactiva y no borrar ni restaurar sin autorización adicional.

## Primera autorización específica requerida: estructura de CP03, sin datos personales

El Director puede aprobar solamente la aplicación revisada de `docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql` al proyecto indicado. Esta aprobación **no autoriza** abrir formularios para clientes auténticos, desplegar Edge, enviar correos o crear usuarios.

Antes de ejecutar: validar identidad del proyecto y compatibilidad CP02; revisar exactamente SQL/GRANT/policies/RLS; comprobar si el plan ofrece un respaldo y restauración verificables antes de asumir recuperación; documentar el estado anterior; definir desactivación no destructiva. Si no es posible respaldar/recuperar, detener la instalación y elevar decisión.

Tras la instalación, solo si está autorizada: verificar tablas, índices, FK compuesta cliente-vehículo, roles, `SELECT` y `INSERT/UPDATE` autorizados y acceso `DELETE` negado a `authenticated`; ensayar A/B con cuentas sintéticas y suspensión del taller. Ante cualquier error, dejar CP03 apagado; no borrar fichas/tablas automáticamente.

## Segunda autorización independiente: activar el uso piloto

Aprobar la misma sesión Auth ya verificada para la vista CP03; montar su binding solo al confirmar identidad, correo, membresía, taller y rol. Desmontar y eliminar fichas en memoria ante `checking`, pérdida de red, logout, cambio de taller o expiración. No introducir secretos de servicio ni segunda sesión independiente en PWA/Android.

**Antes de usar datos auténticos:** definir información al cliente, finalidad, responsabilidad de tratamiento, conservación, duplicación de fichas y procedimiento de corrección. La casilla de UI no acredita por sí sola consentimiento o base legítima. Revisar aviso de seguridad Auth y autorización de Ignacio.

## Prueba final única para cerrar CP03

Con fichas **sintéticas expresamente autorizadas** en el backend: crear cliente, agregar vehículo, buscar por patente con/sin guion, teléfono y nombre, editar contacto, regresar desde otra sesión y recuperar ambos IDs. Repetir en iPhone Safari/PWA y escritorio, verificar sesiones cambiadas, datos cruzados A/B denegados, rol mecánico solo lectura, conflicto de edición y RLS en taller suspendido. Comprobar errores de conexión sin ocultar una escritura posiblemente aceptada; nunca repetir automáticamente una creación que puede duplicarse. Registrar evidencia de respuestas reales y conformidad de Ignacio/Director; **solo entonces** marcar CP03 completado y producir checkpoint de capacidad.

**Autorización pendiente ahora:** el SQL ya se instaló bajo la autorización recibida; falta permiso para activar el panel privado y hacer un recorrido persistente con datos exclusivamente ficticios. Los datos personales reales siguen sin autorización. Se preserva `main`, PWA iOS/web y Android nativo separado. No avanzar comercialización CP07–CP09.
