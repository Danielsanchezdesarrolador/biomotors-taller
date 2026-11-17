# ByteTorque — BT-PLAN-04 · Cuentas personales, talleres y mecánicos adicionales

Fecha: 17/11/2026. Fuente vigente de requisitos comerciales; sustituye BT-PLAN-03. **04A instalado; 04B/04C y preparación 04D implementados como candidatos sin instalar. Pagos reales apagados.** Ver [implementación y pendientes](BT_PLAN_04_IMPLEMENTACION_20261117.md).

## Tarifas y titularidad

| Plan | Base por taller/mes | Mecánicos incluidos | Adicional |
|---|---:|---:|---:|
| Básico personal | Gratis | Sin taller nuevo | No aplica |
| Plus | USD 5 | 4 | USD 2 por mecánico/mes |
| Full | USD 15 | 8 | USD 2 por mecánico/mes |
| Full permanente manual | USD 0 base, sin vencimiento | 8 | USD 2 por mecánico/mes si contrata extras |

No se cobra por cuenta ni por trabajador. El titular paga **una suscripción por taller** y cualquier plaza extra que contrate; el mecánico posee cuenta personal gratuita. Dueño/administrador no cuenta como mecánico. Plus con 5 mecánicos cuesta USD 7/mes; Full con 9 cuesta USD 17/mes (antes de impuestos y comisiones). El límite absoluto de adicionales, prorrateo, ciclo de pagos y condiciones tributarias aún no están definidos y no deben asumirse. Un Full permanente cubre el plan base con sus ocho plazas, sin añadir extras gratuitas por defecto.

## Flujo que debe existir

1. Persona natural (mecánico, independiente o dueño) se registra, confirma correo y entra con Básico personal; puede explorar las herramientas gratuitas realmente habilitadas. No puede crear taller nuevo ni acceder a talleres ajenos.
2. Puede contratar Plus/Full o recibirlo manualmente del Creador **antes** de crear un taller. El derecho se vincula a su UUID de Auth verificado, no a nombres, correos reutilizables o metadatos editables.
3. La cuenta mostrará en su cabecera el plan efectivo, estado y vencimiento según respuesta protegida del servidor. No mostrar «Full activo» por una variable local; ante error, mostrar plan no disponible.
4. Con Plus/Full válido, aparece «Crear mi taller». Alta transaccional crea taller, membresía de propietario y asociación segura con la licencia única del titular; impedir asignar IDs ajenos o crear múltiples talleres con una única licencia.
5. El propietario define nombre, logo, información comercial y documentos con atribución discreta «Powered by ByteTorque». Datos y archivos aislados por taller.
6. Invita mecánicos desde Configuración/Usuarios. El taller usa 4 plazas incluidas Plus u 8 Full; cuenta mecánicos activos **más reservas vigentes de invitación pendientes**, sin incluir administradores. Para superar el cupo incluido debe existir plaza adicional realmente contratada/verificada en backend. Los mecánicos no pagan, no acceden a otro taller ni pueden darse roles de admin.
7. En downgrade, vencimiento o revocación, nunca se borran historiales, clientes, vehículos, cotizaciones, cuentas ni sus datos. Impedir altas por encima del nuevo cupo y diseñar regularización explícita de plazas excedidas sin expulsiones silenciosas.

## Caso piloto Ignacio

- Ignacio crea cuenta verificada nueva, al principio Básico.
- El Creador busca su cuenta y otorga Full permanente con MFA/AAL2, motivo e historial auditado, sin cobrar.
- Ignacio ve Full activo y puede crear **su propio Biomotors**; no utilizar el taller QA «Taller ByteTorque de Pruebas» ni el Taller B.
- Ignacio añade a sus **2 mecánicos** (2/8 plazas); ellos usan cuentas personales gratuitas y permisos limitados. Ninguna plaza adicional se factura.

## Orden de construcción

**04A — Fundación personal:** nueva tabla privada aditiva de derechos por cuenta, sin sustituir ni sobrescribir `bt_platform_private.subscriptions(workshop_id)`; RPC protegidas para lectura del propio plan y búsqueda de cuentas verificadas solo desde Creador; concesiones por persona con idempotencia, MFA y auditoría. Integrar la etiqueta del plan real al encabezado. **No aplicar SQL en Supabase alojado sin autorización concreta.**

**04B — Taller propio:** alta transaccional segura, única por licencia, asociación a suscripción de taller y membresía de propietario, perfil/logo y documentos con marca + Powered by ByteTorque; nunca mezclar con QA existentes.

**04C — Trabajadores:** invitaciones verificadas y revocables, cupos Plus 4/Full 8, reservas y control de accesos en backend, QA de concurrencia y aislamiento. Ignacio invita sus dos mecánicos.

**04D — Comercialización:** integrar pagos confirmados, renovaciones, add-ons a USD 2/mecánico/mes, cancelaciones y webhooks idempotentes. Solo después de que CP05/CP06 y el piloto estén estabilizados y exista autorización expresa para cobros.

## Pruebas obligatorias

- Cuenta confirmada sin membresía: Básico personal, sin taller, sin exposición de datos.
- Full permanente concedido a cuenta antes del taller: no obtiene privilegios de Creador ni acceso a talleres QA.
- Alta Biomotors: solo propietario correcto y 2/8 mecánicos gratuitos. Identidad y vigencia verificadas en servidor.
- Plus 4/4 bloquea quinta invitación si no existe 1 extra confirmado; Plus 5/5 refleja USD 7/mes.
- Full 8/8 bloquea novena sin extra confirmado; Full 9/9 refleja USD 17/mes.
- Dos invitaciones concurrentes no consumen la misma plaza; cambios de plan/reintentos no duplican cargos ni concesiones.
- RLS niega acceso cruzado; mecánicos no pueden elevar permisos; suspensión/downgrade preserva datos históricos.
- El plan del encabezado cambia únicamente por eventos autorizados y verificados; no se finge aprobación de pagos.

**Estado actual:** plan por taller y panel del creador ya existen; no están aún construidos el derecho personal, la creación autónoma, el cobro de plazas extra o la cabecera dinámica. Código y migraciones deben conservar `main`, RLS y los datos CP03–CP05.

## Checkpoint de implementación 04A (17/11/2026)

**BT-PLAN-04A / 17-11-2026 — BASE DE CÓDIGO LISTA, SQL NO INSTALADO.** Candidato SQL aditivo `docs/sql/BT_PLAN_04A_PERSONAL_ENTITLEMENTS_CANDIDATE.sql` (derechos personales, auditoría, búsqueda creador con MFA, lectura de plan por identidad/miembro de taller); componentes protegidos `src/creator/PersonalAccounts.tsx`, `src/plans/planStatus.ts` y cabecera web/móvil, bajo `VITE_BT_PLAN04_PRIVATE_ENABLED=true`. El nuevo flag **no se activó**; panel antiguo sigue funcionando. GitHub CI verificación #44147631778 **SUCCESS (Web/iOS PWA y Android)**; Render despliegue `dep-dbu9o2ajnfac73bu0i0g` **LIVE**, commit `97e942f`. La base Supabase alojada mantiene 2 talleres, 0 suscripciones de taller; las nuevas tablas/RPC 04A se comprobaron AUSENTES. **No se hizo ninguna concesión a Ignacio ni se habilitaron pagos, talleres nuevos, envíos o datos reales.** Antes de activar 04A se requiere aprobación específica de instalar SQL aditivo en Supabase, validar permisos/RLS, plan Básico/no-membership, aislamiento y MFA en sesión real; recién después activar el flag privado. Respaldo integral sigue pendiente, no confiar datos reales al piloto todavía.

**Límite de esta entrega:** código compilado y desplegado con flag OFF; no equivale a la operación real de las nuevas RPC. El siguiente paso requiere aprobación del usuario para migración aditiva concreta y una ronda de pruebas de seguridad con sesiones reales, sin conceder Full a Ignacio hasta que exista su cuenta confirmada.
