# Checkpoint ByteTorque — BT-PLAN-04A

> **ACTUALIZACIÓN 17/11/2026 · BT-PLAN-04A INSTALADO Y ACTIVADO:** el Director autorizó la migración aditiva al proyecto Supabase `biomotors-taller`. Versión de migración registrada `20261117184100`, nombre `bt_plan04a_personal_entitlements_creator_mfa`. La instalación finalizó `success:true`. Se comprobaron 2 tablas privadas con RLS + FORCE sin permisos directos de `anon`/`authenticated`, 3 RPC con `anon` denegado, `search_path` vacío y comprobaciones internas de membresía, Creador y MFA/AAL2. Pruebas SQL de lectura con JWT simulado: cuenta válida ve Básico personal/taller propio, otro taller denegado, no-Creador no puede listar/modificar planes, Creador con AAL1 no puede conceder; llamadas sin sesión confirmada rechazan con 42501. Los registros persistentes se mantienen: 2 talleres, 5 membresías, 5 usuarios, 1 Creador, **cero derechos personales y cero eventos**; no hubo concesiones ni pagos. `VITE_BT_PLAN04_PRIVATE_ENABLED=true` activado en Render en el servicio existente mediante merge de variables, despliegue `dep-dbua0ru1egvs73fulchg` **LIVE** sobre `d83907f`. La prueba UI real desde navegador del Director y MFA real **sigue pendiente**. 04B (creación de taller), 04C (invitación/cupos), cobros por extras y 04D siguen sin implementar. Advertencias Supabase: funciones SECURITY DEFINER visibles a `authenticated` de forma intencional y protegidas dentro de RPC, tablas privadas sin políticas por denegación explícita; detección de contraseñas filtradas continúa desactivada (previo, sin cambiar). No utilizar datos reales sin completar respaldos.


Fecha: 17/11/2026 · rama única main · repositorio privado.

## Entrega implementada

- Migración **candidata** SQL (no instalada): tablas privadas account_entitlements y account_entitlement_events con RLS FORCE, tres RPC: bt_plan04_my_status, bt_creator04_accounts y bt_creator04_manage_account. La búsqueda es Creador-only; cambios exigen AAL2, son idempotentes y auditables.
- Frontend: encabezado con estado de plan validado por servidor, soporte cuenta Básico sin taller, nuevo panel «Personas y suscripciones» con búsqueda por nombre/correo, selección de persona confirmada y concesión de Plus/Full por días o vitalicia con MFA. Todo condicionado a VITE_BT_PLAN04_PRIVATE_ENABLED=true (actualmente apagado).
- Preserva el módulo anterior para la administración de talleres y evita exposición de funciones personales en interfaz hasta instalar SQL. Protecciones de módulos públicos/privados actualizadas para permitir únicamente el parser de plan sin secretos.
- Política Plus 4 / Full 8 mecánicos y extras USD 2/mes permanece **solo documental**, sin cobro ni enforcement todavía. No implementados 04B (taller propio) ni 04C (mecánicos).

## Verificaciones disponibles

- Commit del código y puertas de seguridad: 97e942f96cab89f417994c0e943d8132c71ff121.
- Render (sitio técnico existente): dep-dbu9o2ajnfac73bu0i0g = LIVE; no se crearon servicios.
- GitHub Actions Verificación ByteTorque #44147631778 = SUCCESS; Web / iOS PWA y Android completados exitosamente. Esta evidencia NO prueba las nuevas RPC alojadas porque siguen sin instalar.
- Consulta de solo lectura a Supabase biomotors-taller: no existen todavía tabla account_entitlements ni RPC bt_plan04_my_status; 2 talleres actuales preservados y 0 suscripciones de talleres.
- Ningún registro de clientes, vehículo, historial, taller o membresía modificado; no hay planes personales concedidos, pagos ni SMS/correos reales.

## Puerta siguiente (requiere autorización específica)

1. Revisar candidato SQL 04A, sus grants y prueba de restauración/rollback; resolver riesgo conocido de respaldo integral incompleto antes de datos reales.
2. Con permiso específico instalar la migración aditiva SOLO en el proyecto biomotors-taller, verificar RLS y denegación de anon/no-Creador, además de idempotencia/MFA.
3. Después, habilitar VITE_BT_PLAN04_PRIVATE_ENABLED=true en el Render actual y validar con sesión real: cuenta sin taller, listado Creador, conceder/revocar solo una identidad sintética y comprobar que plan mostrado es correcto. No conceder a Ignacio sin registro/verificación.
4. Continuar 04B/04C por fases y CP05/CP06 del piloto, sin habilitar facturación externa.
