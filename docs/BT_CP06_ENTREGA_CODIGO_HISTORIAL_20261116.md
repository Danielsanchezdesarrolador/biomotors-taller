# ByteTorque · CP06 — Entrega de código del historial confiable de vehículos

**Autoridad:** decisión del Director del 16/11/2026: terminar código y pruebas aisladas antes de agrupar respaldos/activaciones al final. **Estado:** orden para implementar, NO funcionalidad terminada ni autorización de deploy alojado. **Rama:** `main` única del repositorio privado `Danielsanchezdesarrolador/biomotors-taller`. **HEAD inicial:** consultar `main` al empezar; referencia `e995c8b01339fb137967be17e74f04920d3477d2`.

## Resultado esperado para Ignacio

En la ficha de un vehículo del taller autorizado, Ignacio pulsa **«Ver historial»** y ve las visitas anteriores ordenadas por fecha: recepción/OT, estado, kilometraje de ingreso, observaciones y diagnóstico de inspección, problemas pendientes incluso en visitas siguientes, y cotizaciones históricas emitidas si CP05 realmente está disponible. Puede abrir la OT y la cotización correspondiente con el sistema existente, volver a la ficha del vehículo y repetir la consulta después de cerrar/reabrir sesión sin depender de sessionStorage. Prioridad móvil Safari/iPhone, conservando el diseño R2 blanco/navy/azul.

**No presentar una OT cerrada como reparación ejecutada; no afirmar «reparado» salvo cuando exista evidencia de resolución registrada. No crear precios o diagnósticos a partir de una X multipunto. No inventar factura, aceptación o correo enviado.**

## Reutilización estricta: NO reconstruir

- `src/clientes/Cp03PrivatePanel.tsx`, `cp03PilotAccessBinding.ts`, `cp03PilotRepository.ts`, `cp03PilotDirectoryView.tsx` y contrato `cp03PilotContracts.ts`: acceso a la ficha seleccionada bajo Auth R1; botón de cotizaciones existente.
- `src/ordenes/cp04Repository.ts`, `cp04Contracts.ts`, `Cp04OrdersView.tsx`: `work_orders`, `inspection_findings`, estados, notas y pendientes con RLS existente. No modificar la migración CP04 ni el autoguardado de las 34 X.
- `src/cp05/contracts.ts`, `repository.ts`, `Cp05PrivatePanel.tsx`: cotizaciones, eventos y revisiones candidatas; **CP05 SQL NO instalado**. No hacer requests a tablas CP05 mientras `VITE_BT_CP05_PRIVATE_ENABLED` esté OFF, ni usar fixtures DEMO como datos reales.
- `src/App.tsx` y `AppShell`: mantener cinco secciones del menú, no crear un sexto destino.
- `docs/checkpoints/CHECKPOINT_BT_CP05_20261116.md`, `roadmap.md`, `AGENTS.md`, `docs/BT_PILOTO_IGNACIO_METODO_ENTREGAS.md`: conservar reglas y trazabilidad.

## Implementación integral requerida

1. **Lectura y consulta segura:** crear contrato/repositorio CP06 read-only con cliente Supabase publicable **ya autenticado**, proporcionado por `AuthController.directoryClient()` / binding de sesión, contexto `workshop_id` y `userId` existentes. Revalidar identidad, correo confirmado, membresía activa y taller activo como CP03/CP04; las policies RLS son autoridad final. Fail closed ante acceso cruzado, Auth caducada, revocación, cambio de usuario o taller; cancelar/stale response no debe pintar información antigua.
2. **Historial completo y paginado:** filtrar `work_orders` por `workshop_id` y `vehicle_id` con orden estable `opened_at DESC, id DESC` y paginación real, no `recentOrdersLimit=40` para historial. Cargar los `inspection_findings` solamente para OTs retornadas, también restringidos por `workshop_id` y `vehicle_id`. Mostrar resolución pendiente, resuelta o no registrada según el dato real, nunca reinterpretar el hecho. Incluir fecha/hora, estado OT, motivo, km y observaciones vinculadas. No generar tablas nuevas si no son necesarias.
3. **Pendientes visibles:** sección separada de fallas con `result='attention'` y `resolution='pending'`, enlazada a visita original, no borrar ni ocultar pendientes por cerrar o crear nuevas OTs. Evitar dobles entradas al unificar cronología; distinguir evento de visita y hallazgo dentro de esa visita. Un problema `resolved` debe quedar visible en el historial de la visita, no en la lista vigente de pendientes.
4. **Cotizaciones CP05 opcionales:** el modelo puede combinar `quotes`, `quote_revisions` y `quote_events` usando IDs de vehículo/OT y snapshots históricos solo cuando el módulo esté autorizado, su SQL alojado exista y el flag sea verdadero. Si OFF o sin tablas, la consulta al historial CP03/CP04 debe funcionar sin pedirlas ni mostrar estados falsamente «emitidos». Borradores separados de revisiones emitidas; revisar/anular NO reemplaza el snapshot de revisión.
5. **Interfaz sin duplicaciones:** añadir «Ver historial» a ficha de vehículo CP03 y vista responsive integrada, con botón Volver, carga, error, vacío, «Mostrar más», cronología de visitas, señalización de pendientes, acceso a OT/cotizaciones si es posible con rutas existentes. Sin acceso no autorizado desde la demo pública; feature flag privado `VITE_BT_CP06_PRIVATE_ENABLED=false` por defecto para no activar código candidato en Render antes de la puerta final. No mostrar datos ficticios en la vista privada.
6. **Pruebas eficaces:** casos unitarios para orden/empate de timestamps, varias visitas, OTs cerradas, hallazgos pendientes/resueltos, revocación de membresía, separación taller A/B, SQL no disponible CP05 y páginas adicionales; pruebas integración con SDK mock/HTTP simulado y logout; TypeScript, Vitest, build/PWA y al menos móvil 390/375 y escritorio 1440 donde cambie UI. Verificar roles `owner/admin/reception/mechanic` respetando solo lectura. No lanzar continuamente toda CI ni tests visuales no afectados durante la programación.
7. **Código y evidencia:** trabajar solo sobre `main`, sin ramas paralelas ni nuevos sitios. Un cierre consolidado con commit(s) precisos, pruebas efectivamente ejecutadas, screenshots sintéticos si procede, diferencias entre test local, CI, Render y dispositivo físico, y actualización mínima de checkpoint/roadmap. No registrar tareas como PASS sin resultados.

## Prohibiciones y puerta final

**No ejecutar** migraciones SQL nuevas, DDL, SQL editor alojado, cambios de Auth/RLS, datos reales, nuevas cuentas, Storage/Edge, correos ni secretos. No alterar pagos, presupuestos GitHub ni rama. El permiso CP05 dado anteriormente estuvo **condicionado a un respaldo actualizado recuperable**; el Director decidió **aplazar todo eso a la etapa final**. No interpretar la presente orden como un permiso de activar CP05 o CP06.

Para el cierre del proyecto agrupar una única preparación de respaldo verificable y una secuencia de migraciones y pruebas de recuperación controladas, con checkpoints de rollback. Nunca intentar una restauración destructiva sobre el proyecto alojado sin autorización específica.

## Criterios de aceptación del código

- `Ver historial` en la ficha correcta con datos CP03/CP04 persistidos y cero requests a CP05 si está OFF.
- Consultas paginadas y deterministas; el retorno de una consulta obsoleta no filtra datos al cambiar de contexto.
- Historial de OTs, hallazgos y pendientes comprensible para Ignacio; no se afirma reparación o correo sin evidencia.
- Sin variación de CP03/CP04, 34 X/autoguardado, roles, diseño R2, ni funcionalidades DEMO públicas.
- CI/TypeScript/tests pertinentes sin fallos al cerrar entrega; usuarios/dispositivos alojados siguen pendientes.
- Entrega rotulada **CANDIDATA EN CÓDIGO; NO OPERATIVA** hasta validar la puerta final.

**Siguiente tras esta entrega:** preparar paridad Android nativa de las vistas web aprobadas y consolidar la matriz del piloto; CP07–CP09 comercialización continúan fuera de alcance.