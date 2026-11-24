# BT-REG-01 — preparación productiva y reversión

24/11/2026, Chile. El propietario aprueba la implementación y validación locales
y autoriza publicar el candidato en `main` y ejecutar las CI existentes.
**No autoriza aplicar SQL, desplegar ni activar interruptores.** Auto-Deploy OFF;
repositorio público temporal autorizado. No se solicita ni configura ningún secreto.

Candidato funcional: `bf0bf781b219505daec60c5cc288fc23c87a1896`.
Base remota comprobada antes de preparar la publicación:
`9e374991d371c9f7e5fc57a21dcb373471172ab0`.
La publicación incorpora ese commit intacto más esta documentación; no modifica
el código funcional aprobado ni crea ramas. La preparación no repite auditorías.

## Migración candidata

Archivo único: [`sql/BT_RECORDS_ADMINISTRATION_CANDIDATE.sql`](sql/BT_RECORDS_ADMINISTRATION_CANDIDATE.sql).
SHA-256 del contenido aprobado:
`f956656767d22a6e50ce2c9141e0f37b0912c9dd625090b22b489ec10ab407df`.
No se renombra, duplica ni marca como aplicado. Está delimitado por `BEGIN/COMMIT`
y **no es idempotente**: si ya existen sus objetos, detenerse y comprobar el estado;
no ejecutarlo parcialmente, omitir errores ni volver a ejecutar tras un commit exitoso.
Ante un error antes del commit, revertir la transacción completa (`ROLLBACK`).

Permite eliminar clientes/vehículos sin dependencias, archivar y restaurar los que
conservan historial, eliminar OT recibidas realmente vacías o cancelar OT con
actividad, eliminar borradores nunca emitidos sin referencias y anular cotizaciones
emitidas conservando sus revisiones/documentos. Siempre con propietario/admin,
confirmación, comprobación transaccional de dependencias y trazabilidad.
Las partidas propias del borrador son contenido mutable; no se borran si alguien
las referencia. Ninguna eliminación usa CASCADE.

## Objetos, permisos y políticas afectados

| Objeto | Cambio al instalar |
| --- | --- |
| `bt_records_private` | Esquema privado nuevo, no agregar a los esquemas expuestos de la Data API |
| `bt_records_private.rollout` | Una fila por taller, `enabled DEFAULT false`; instalación sin filas/habilitación |
| `bt_records_private.events` | Auditoría append-only: actor, recurso/ID, acción, solicitud, entrada/motivo, resultado y fecha; sin FK al registro eliminable |
| Índices privados | PK/únicos de ambas tablas y secuencia identity de eventos; índice `bt_records_resource_events` para consulta por recurso |
| `public.work_orders` | Columnas nullable `cancelled_at` y `cancel_reason`, check de longitud del motivo y constraint `bt_records_cancel_state`; no backfill de filas |
| `public.customers`, `public.vehicles` | Se reutiliza `archived_at`; se revoca únicamente `UPDATE(archived_at)` a `authenticated`, evitando archivo directo sin auditoría |
| `public.bt_cp04_order_guard()` | Se reemplaza la función invoker: permite agregar solo metadatos de cancelación a una OT ya cerrada, conservando el resto de sus campos; no permite reabrirla |
| Tablas CP03/CP04/CP05 | No se cambian sus políticas RLS existentes, sus FK, índices de negocio, estados permitidos, diagnósticos ni revisiones |
| Storage, Auth, Edge | Sin creación de bucket, objeto, usuario, función Edge, configuración de correo ni cambio de sus políticas |

Las dos tablas nuevas tienen **ENABLE y FORCE ROW LEVEL SECURITY**, sin políticas
de acceso directo: denegación por defecto. No se otorgan permisos directos sobre
tablas/secuencias a `PUBLIC`, `anon`, `authenticated` ni `service_role`.
Se concede USAGE del esquema privado a `authenticated` para las funciones internas
necesarias, no para exposición REST de tablas.

Funciones privadas nuevas (`search_path=pg_catalog`, SECURITY DEFINER):

- `authorize(uuid,boolean)`: identidad confirmada, membresía/taller activos,
  owner/admin para administración y habilitación explícita del taller.
- `dependencies(uuid,text,uuid)`: examina FK reales, también privadas y futuras;
  detecta referencias a partidas y bloquea cascadas indirectas.
- `inspect_record(uuid,text,uuid)`: acciones permitidas, dependencias y token vigente.
- `execute_record(uuid,text,uuid,text,text,uuid,text)`: acción atómica, bloqueo,
  versión optimista, idempotencia, autorización y auditoría.
- `list_records(uuid,text,boolean,text,uuid)`: búsqueda/paginación de activos y archivo.
- `audit_records(uuid,text,uuid)`: últimas 50 operaciones por recurso o registro,
  incluidos los eliminados; el backend conserva el historial completo.
- `source_guard()`: trigger que protege fuentes operativas cuando el taller está habilitado.
- `order_activity()` y `quote_activity()`: triggers de evidencia de actividad de OT.

Se revoca EXECUTE de todas ellas a los roles API y PUBLIC, concediéndolo a
`authenticated` solo para `list_records`, `inspect_record`, `execute_record` y
`audit_records`. Cada entrada vuelve a comprobar permisos en el servidor.
Las otras cinco funciones solo se usan internamente/triggers.

Wrappers públicos nuevos, **SECURITY INVOKER**, EXECUTE solo a `authenticated`:
`bt_records_list(uuid,text,boolean,text,uuid)`,
`bt_records_inspect(uuid,text,uuid)`,
`bt_records_execute(uuid,text,uuid,text,text,uuid,text)` y
`bt_records_audit(uuid,text,uuid)`. No hay RPC para habilitar talleres.
Se reutiliza `bt_cp05_private.void_quote` sin reemplazarlo y
`bt_cp05_private.immutable` para proteger el ledger nuevo.

Triggers nuevos obligatorios:

- `bt_records_events_immutable` en el ledger privado.
- `bt_records_vehicle_source`, `bt_records_order_source`,
  `bt_records_quote_source`, `bt_records_finding_source` en vehículos, OT,
  cotizaciones e inserciones de diagnósticos.
- `bt_records_order_activity` y `bt_records_quote_activity` para actividad de OT.

Si existen `bt_flow_quote_approvals`, `bt_flow_execution_reports` y
`bt_flow_visit_deliveries`, se añade `bt_records_source` BEFORE INSERT en cada una.
Si no existen, el SQL no las crea. Una instalación futura de esas tablas debe
incorporar la guarda antes de habilitar su operación. No se alteran sus historiales.

## Compatibilidad e impactos aun estando apagado

Los registros existentes mantienen sus IDs, relaciones, archivos, revisiones y
valores de negocio. Las columnas nuevas quedan NULL, compatibles con las filas
anteriores y el frontend actual, que no las pide cuando su flag está OFF.
No se migra información, reclasifican visitas ni resuelven hallazgos. Patentes
archivadas siguen reservadas por el índice existente; no se reciclan.

**La instalación no es un cambio sin efectos:**

- La revocación del archivo directo es inmediata y no depende del rollout. Una
  integración externa que actualice `archived_at` directamente dejaría de poder
  hacerlo; debe identificarse antes de aprobar la aplicación, sin ensayar con datos reales.
- Los triggers de actividad registran futuras modificaciones de OT y creación de
  cotizaciones incluso con rollout OFF. No reconstruyen el pasado ni cambian las fichas.
- La guarda CP04 reemplazada se instala inmediatamente. Sus columnas no reciben
  grants de UPDATE al navegador; cancelar exige la vía autorizada del candidato.
- Las guardas de fuentes/limitación de anulación heredada dependen del rollout por
  taller: al habilitarlo también afectan llamadas antiguas. Recepción mantiene la
  edición normal, pero no la administración ni anular/reactivar una cotización anulada.
- El DDL requiere bloqueos y validación de checks. Programar una ventana y límites
  de espera/ejecución de la sesión; si no se obtiene el bloqueo, abortar, sin forzar.

Estos puntos describen el SQL revisado, no una comprobación del catálogo productivo
actual. La inspección puntual de prerrequisitos/estado se hará solo al autorizar SQL;
no se ha accedido a datos alojados en esta preparación.

## Secuencia de incorporación, despliegue y activación

1. **Etapa actual autorizada:** publicar candidato/documentación en `main`, con
   `[skip render]`, avance rápido normal, y observar las CI existentes. No workflow
   nuevo, respaldo, SQL, dispatch manual de infraestructura ni deploy.
2. **Respaldo previo:** el propietario realiza un respaldo actualizado mediante
   SEC07 aprobado. Registrar su comprobante y verificación exigida por ese procedimiento;
   no asumir un respaldo hecho, una clave recuperable o S4 integral cumplida sin evidencia.
3. **Autorización específica de SQL:** comprobar en lectura CP03/CP04/CP05 y
   `bt_cp05_private`, guardas vigentes, ausencia de objetos BT-REG-01 parciales y
   compatibilidad de consumidores de `archived_at`. Resolver diferencias antes de aplicar.
4. **Aplicación futura:** ejecutar exactamente el SQL candidato completo, una vez,
   en transacción y con la ventana/límites aprobados. No insertar filas de rollout;
   revisar en lectura objetos/permisos y refrescar la caché de esquema de PostgREST
   por el procedimiento autorizado si fuera necesario. No exponer el esquema privado.
5. **Despliegue futuro, separado:** con CI satisfactoria y autorización de Render,
   desplegar manualmente el SHA publicado manteniendo
   `VITE_BT_RECORDS_PRIVATE_ENABLED=false` y rollout del taller OFF. Confirmar LIVE,
   SHA y Auto-Deploy OFF. Probar el funcionamiento ordinario solo con QA autorizada.
6. **Activación piloto, separada:** con permiso de activación y taller QA identificado,
   habilitar primero el rollout backend únicamente para ese taller. Luego compilar y
   desplegar con `VITE_BT_RECORDS_PRIVATE_ENABLED=true` y los gates privados existentes.
   El flag VITE es de compilación: editar una variable no cambia el bundle ya servido.
   Otros talleres sin rollout siguen denegados por el backend aunque vean la entrada.
7. **QA/expansión:** comprobar acciones con registros ficticios, dependencias,
   permisos y recuperación antes de autorizar uso real o más talleres. No tocar
   registros del propietario/cliente para demostrar una eliminación. No activar emails.

Ningún paso del 2 al 7 se ejecuta por la autorización de publicación actual.

## Reversión y contención

**Antes de COMMIT de la migración:** un error obliga a ROLLBACK completo; no continuar
con scripts sueltos ni conceder permisos para sortear errores. Antes de instalarla,
la reversión del candidato es simplemente mantener el código LIVE anterior y flags OFF.

**Después de instalar, antes de usar administración:** mantener flags de frontend
OFF y no habilitar rollout. Si se requiere retirar el DDL, obtener autorización
específica y comprobar primero que no hay operaciones ni valores de cancelación.
Incluso con rollout OFF puede haber eventos de actividad; no borrarlos para
simplificar el retiro. Dejar columnas/ledger conservados es una reversión lógica válida.

**Después de activar o registrar operaciones:** no borrar esquema, columnas,
eventos, revisiones ni restaurar ciegamente el respaldo. Para contener la función:

1. Bloquear nuevas RPC de administración revocando EXECUTE a `authenticated` de
   **ambas** `public.bt_records_execute(uuid,text,uuid,text,text,uuid,text)` y
   `bt_records_private.execute_record(uuid,text,uuid,text,text,uuid,text)`, bajo
   autorización de SQL de emergencia. Esperar/cotejar operaciones en curso antes
   de declarar la contención; una revocación no cancela una transacción ya iniciada.
2. Desactivar el flag VITE y reconstruir/desplegar solo si se autoriza; conservar
   esquema, auditoría y backend protector mientras se concilian los resultados.
3. **No apagar a ciegas `rollout.enabled` en talleres ya utilizados:** ese mismo
   flag apaga las guardas de fuentes. Mantenerlas habilitadas durante la contención
   anterior, evitando que clientes antiguos vuelvan a operar sobre fuentes archivadas
   o canceladas. El bloqueo de EXECUTE impide nuevas acciones de gestión sin perder
   esas guardas. No se cambia este comportamiento del código aprobado en esta etapa.
4. Archivos reversibles se recuperan por las RPC autorizadas, restaurando primero
   el cliente; cancelación/anulación no son reparación ni borrado. No reabrir OT
   ni reescribir revisiones como procedimiento de rollback. La recuperación de un
   borrado definitivo requiere SEC07, autorización específica y conciliación de
   datos posteriores; no implica restaurar toda producción sobre información nueva.

**Retiro físico excepcional:** únicamente si no se pierde evidencia/estado, autorizado
por separado y validado antes en local: retirar triggers BT-REG-01 de sus tablas
(incluidos los opcionales); restaurar `bt_cp04_order_guard()` exactamente desde
`docs/sql/applied/20261115222534_bt_cp04_orders_inspections_tenant_rls.sql`; retirar
wrappers y funciones nuevas en orden de dependencias, sin CASCADE; retirar constraint
`bt_records_cancel_state` y columnas solo si no contienen estado que preservar;
retirar ledger/esquema solo si no contienen evidencia que deba conservarse. Restituir
el antiguo `UPDATE(archived_at)` únicamente si se aprueba regresar a ese contrato
anterior, pues reabre la vía directa histórica para recepción. No hay down automático
ni script destructivo listo para ejecutarse sobre producción.

## CI y evidencia

La validación local aprobada queda en el checkpoint BT-REG-01: 22 pruebas nuevas,
43 comprobaciones PostgreSQL, concurrencia, navegador y ambos builds. No se repite.
La publicación ejecuta los workflows existentes que coinciden con los cambios:
CI general, BT-OFICIAL-01A, BT-COT-01, BT-FLOW-01 y BT-REG-02. Sus suites heredadas
corren por GitHub; esto no significa reabrir SEC07 ni auditorías anteriores.
Los laboratorios CP03/CP04/CP05/R2 con paths específicos no se despachan manualmente.
Workflows de backup, Drive, Edge y activación QA son manuales y no se ejecutan.
Las CI existentes no prueban automáticamente el nuevo laboratorio BT-REG-01;
su resultado aprobado es local. No se altera CI para ampliar este alcance.

Render consultado en lectura antes de publicar: `autoDeploy=no`,
`autoDeployTrigger=off`. El resultado de CI debe comunicarse por SHA publicado,
distinguiendo en curso, éxito y fallo; esta guía no presume éxito futuro.
