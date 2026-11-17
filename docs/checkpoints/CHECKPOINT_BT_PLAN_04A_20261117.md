# Checkpoint ByteTorque — BT-PLAN-04A

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
