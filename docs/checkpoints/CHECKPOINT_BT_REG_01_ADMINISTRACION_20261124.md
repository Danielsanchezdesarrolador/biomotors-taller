# BT-REG-01 — administración segura de registros

## Nota posterior de gobernanza — economía de cuota (24/11/2026)

El propietario informó un consumo aproximado de 60 % de cuota en el encargo siguiente (archivo privado/recuperación del expediente final). Se aprueba la nueva regla permanente de [AGENTS.md](../../AGENTS.md): ChatGPT dirige e investiga, Codex implementa y valida de forma focalizada; consultas selectivas, reutilización, una validación consolidada pertinente, escalamiento de bloqueos y documentación breve. No se reduce seguridad ni se amplían autorizaciones. Esta anotación no modifica el PASS histórico de BT-REG-01, su SQL candidato, su guía de activación ni el estado productivo. La entrega documental siguiente tiene autorización local, sin resultados afirmados aquí.

## Cierre de publicación confirmado — 24/11/2026

Orden de continuidad recibida tras el límite de uso de Codex. `main` remoto y
local comprobados en `9484ed797fb7d6d95d54ff7c288e70bfdc8252a7`; no se repite
la implementación ni ninguna suite ya aprobada.

| Workflow correspondiente al SHA corregido | Run | Resultado |
| --- | --- | --- |
| Verificación ByteTorque | [45416339689](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45416339689) | SUCCESS |
| BT-OFICIAL-01A | [45416339355](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45416339355) | SUCCESS |
| BT-FLOW-01 | [45416339541](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45416339541) | SUCCESS |
| BT-REG-02 | [45416339491](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45416339491) | SUCCESS |

**BT-COT-01 no tuvo una ejecución en `9484ed79`**, por sus filtros. Su ejecución
[45415057212](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45415057212)
fue SUCCESS en `18730572a1cc58d27cf3dd34ad8d1599577cb320`. No se relanza ni
se atribuye a otro SHA. El fallo oficial de ese SHA anterior se conserva como
incidente histórico: raíz `.cp03-pilot` duplicada, corregida en wrapper/estilos,
sin relajar la prueba. El workflow oficial del SHA corregido ya terminó SUCCESS.

SQL candidato conserva SHA-256
`f956656767d22a6e50ce2c9141e0f37b0912c9dd625090b22b489ec10ab407df`.
No se ha aplicado. No se ejecutan backups, deploys, flags, cambios de permisos,
variables ni datos alojados. Render consultado en lectura: Auto-Deploy OFF,
`updatedAt=2026-11-24T13:34:11.471317Z`, sin cambios desde el deploy conocido.
El SHA LIVE previamente confirmado sigue siendo `a92e5c87bf351eeb55ea4754187cf4452cfe0ba8`;
no se confunde un commit publicado en GitHub con uno desplegado.

**Candidato preparado; activación aplazada** hasta que el propietario disponga
de su PC personal y genere/verifique el respaldo SEC07 aprobado. Luego se requiere
permiso específico de SQL, deploy inicialmente OFF, activación controlada, QA ficticia
y aceptación. No se reabre SEC07 ni se desactivan guardas como rollback improvisado.

Se actualizan AGENTS.md, agent.md, roadmap y este checkpoint; la guía recibe este
resultado. Un commit únicamente documental no modifica el candidato funcional
ni activa workflows cuyos filtros excluyen Markdown. No se inventa CI para ese commit.
La propuesta siguiente —archivo recuperable del expediente final— queda en roadmap,
sin implementación. Se reutilizarán los módulos ya existentes solo si el propietario
la aprueba. No se crea otro checkpoint ni etapa de desarrollo.


## Corrección puntual tras CI de publicación

El workflow oficial detectó una raíz `.cp03-pilot` duplicada en el contenedor de
administración. Se renombra solo el wrapper y se conserva el estilo con dos
selectores CSS; no cambia lógica, SQL, permisos, flags ni datos. Apertura/raíz única
verificadas con HTTP ficticio a 390/1366. Se añade a los archivos de preparación
`src/clientes/cp03PilotDirectory.css`; el código original permanece en su commit.
Resultados y runs por SHA en la guía productiva y el informe de publicación.

## Aprobación local y autorización de publicación — 24/11/2026

El propietario aprueba la implementación y las validaciones, autoriza publicación
solo del candidato y documentación en `main` y CI existentes. Sin SQL alojado,
despliegue ni activación. La mención «sin push» inferior describe la entrega local
original, preservada en `bf0bf781b219505daec60c5cc288fc23c87a1896`.
El propietario realizará el respaldo SEC07 actualizado antes de autorizar SQL.
Guía productiva: [migración, permisos, compatibilidad y reversión](../BT_REG_01_PREPARACION_PRODUCTIVA_20261124.md).
La lista de 34 archivos inferior corresponde al commit funcional original; esta
preparación solo añade la guía y actualiza AGENTS.md, agent.md, roadmap.md y este checkpoint.


24/11/2026, Chile. **Entrega local en `main`. Sin push, deploy ni cambios alojados.**
Base: `9e374991d371c9f7e5fc57a21dcb373471172ab0`. El commit local de entrega
contiene este checkpoint; consultar `git log -1 --format=%H -- <este archivo>`.
Repositorio público temporal por autorización vigente. Auto-Deploy sigue OFF;
no se consulta ni modifica Render, Supabase, secretos, Storage, Edge ni datos reales.

## Aceptación anterior

El propietario acepta funcionalmente el selector CP05 en producción, versión
`a92e5c87bf351eeb55ea4754187cf4452cfe0ba8`. Se registra en AGENTS.md,
agent.md, roadmap.md y el checkpoint CP05 existente. CP04 y SEC07 siguen cerrados.
No se repitieron sus auditorías ni sus suites aprobadas.

## Comportamiento implementado

La entrada **Administrar registros** del directorio privado abre una vista R2
con tipo de registro, búsqueda, paginación, acciones por ficha, confirmación modal,
archivados/anulados y registro de operaciones. Solo propietario y administrador.
El directorio permanece montado y conserva formularios ajenos a la operación.
Al regresar se vuelve a consultar disponibilidad; los paneles conservados de OT y
cotizaciones reciben invalidación en la misma sesión, sin reconstruir módulos.

| Recurso | Sin dependencias/actividad | Con historial/dependencias | Recuperación |
| --- | --- | --- | --- |
| Cliente | Eliminación definitiva confirmada | Archivo conservando vínculos | Restaurar cliente |
| Vehículo | Eliminación definitiva confirmada | Archivo conservando vínculos | Restaurar; primero su cliente si está archivado |
| OT | Eliminar solo recibida, nunca modificada y sin referencias | Cancelar conservando diagnósticos, cotizaciones y antecedentes | No se reabre una OT cancelada |
| Cotización | Eliminar borrador nunca emitido, sin referencias externas | Emitida: anulación mediante motor CP05 existente | No se elimina ni sobrescribe una revisión/PDF |

Las partidas editables pertenecientes a un borrador nunca emitido se eliminan
explícitamente junto con él, tras informar su número. Una dependencia sobre una
partida bloquea también la eliminación. No hay `DELETE CASCADE` en la implementación.
Un borrador revisado con emisiones previas, eventos o solicitudes de emisión no
es eliminable. Las emisiones en curso bloquean las acciones sobre su cliente,
vehículo, OT y cotización hasta terminar/cancelar por su flujo existente.

Archivo de un cliente excluye sus vehículos de los selectores operativos sin
cambiar sus archivos individuales. Restaurar un cliente no restaura por error un
vehículo archivado expresamente. Las patentes permanecen reservadas por el índice
existente: no se reciclan ni duplican al archivar/restaurar.

Cancelar una OT usa su estado cerrado existente y metadatos de cancelación. Se
amplía únicamente la guarda de una fila ya cerrada para permitir esos metadatos;
sus demás datos y `closed_at` originales permanecen inmutables. No se resuelven
hallazgos ni se declara una reparación. Una OT con una cotización borrada conserva
la evidencia de actividad y no vuelve a considerarse vacía.

## Backend y aislamiento

- Se reutilizan `archived_at` de CP03, las relaciones por taller y la anulación
  transaccional CP05. No se cambian tablas de diagnósticos ni formatos PDF.
- SQL candidato: `docs/sql/BT_RECORDS_ADMINISTRATION_CANDIDATE.sql`. No se agrega
  a `applied/` ni se ejecuta contra Supabase alojado.
- Dos tablas privadas justificadas: interruptor por taller y auditoría append-only.
  Sin nueva tabla de negocio ni historial paralelo de clientes o vehículos.
- Wrappers públicos `SECURITY INVOKER`; funciones privadas con `search_path` fijo,
  identidad `auth.uid()`, email confirmado, taller activo y membresía activa
  owner/admin. No se acepta actor, taller alternativo ni privilegio del navegador.
- Revalidación antes de cada acción y reintento. Anónimo, recepción, mecánico,
  membresía revocada y taller ajeno quedan denegados en el servidor.
- Se revoca la actualización directa de `archived_at` a `authenticated` para evitar
  omitir autorización/auditoría. Los campos de edición ordinaria se conservan.
- Bloqueos transaccionales del registro y del taller, versión optimista e ID de
  solicitud idempotente. Una confirmación vuelve a comprobar todas las dependencias.
- Se inspeccionan las FK reales del catálogo, incluidos esquemas privados, módulos
  opcionales y futuras FK con CASCADE; una dependencia desconocida bloquea borrar.
  Los bloqueos/FK impiden insertar un hijo mientras se elimina su padre.
- Guardas de fuentes impiden nuevas operaciones sobre padres archivados u OT
  canceladas, incluidos los módulos operativos ya instalados. Una futura tabla
  operativa debe incorporar esa guarda además de sus FK antes de habilitarla.
- Se conserva la lectura histórica de clientes/vehículos/OT y cotizaciones. Los
  filtros se aplican a directorio activo, recepción y opciones operativas CP05.
- Auditoría sin FK hacia el registro eliminado: conserva ID, actor, fecha, motivo,
  solicitud y resultado. No copia la ficha ni datos del cliente. La interfaz permite
  ver las últimas 50 operaciones, incluidas eliminaciones; el backend retiene todas.
- Errores privados de entrada se convierten en mensajes fijos y códigos SQLSTATE;
  el SDK nunca muestra ni registra detalles SQL/JWT/filas. El motivo advierte no
  introducir datos sensibles. No se agregan loggers ni claves de servicio.
- Ante respuesta incierta, el modal conserva la misma solicitud y bloquea cambiar
  motivo/cerrar hasta conciliar por reintento idempotente. Una lectura posterior
  fallida no convierte una escritura confirmada en un supuesto fallo de escritura.

## Interruptores y permisos todavía pendientes

`VITE_BT_RECORDS_PRIVATE_ENABLED=false` por defecto. El build privado requiere el
directorio autenticado; el build OFF excluye íntegramente `src/records/`.
El backend exige además una fila habilitada por taller en
`bt_records_private.rollout`; no existe RPC ni permiso de usuario para habilitarla.
Instalar el SQL no inserta ni habilita ningún taller. Ambos controles se prueban
con valores ficticios exclusivamente en el laboratorio desechable.

Antes de usar con Ignacio se requieren, en orden: aprobación del propietario de
esta entrega; condiciones de seguridad y recuperación integral S4 vigentes;
autorización específica para publicar y aplicar el SQL candidato; QA alojada con
registros ficticios y autorización del taller/interruptor; autorización del build
privado y despliegue manual manteniendo Auto-Deploy OFF. Nada de ello se ejecuta
por esta entrega. No se solicita ningún secreto en el chat.

## Validación consolidada

Pruebas exclusivamente nuevas, offline y con datos ficticios. PostgreSQL 17 real,
contenedor `--network none`, sin mapeo de puertos ni credenciales alojadas. El puente
HTTP de pruebas escucha solo en loopback y ejecuta las RPC candidatas de ese
contenedor; el navegador usa el repositorio y componente de producción.
No se simula éxito de escritura en una lista en memoria.

Comando reproducible (imagen `postgres:17`, dependencias y Chromium preinstalados):

```sh
BT_RECORDS_EVIDENCE_DIR=/tmp/bt-records-evidence bash scripts/security/verify-records-local.sh
npx vitest run src/records/repository.test.ts src/records/selectorIntegration.test.ts
```

El script crea y elimina únicamente su laboratorio y servidores locales. Carga las
migraciones anteriores como prerrequisitos de esquema, sin repetir sus auditorías.
No crea usuarios alojados ni PDF/objetos Storage reales. La revisión emitida del
fixture contiene solo un path sintético, nunca un archivo de cliente.

Resultados:

- **22/22** pruebas focalizadas del repositorio, mensajes seguros, sesión/disposal,
  recibos, reintento, auditoría y filtros operativos. Dos archivos nuevos; no suites
  CP04/CP05 generales ni SEC07.
- **43/43** comprobaciones PostgreSQL: 31 de ciclo de vida/permisos/dependencias y
  12 de revisiones, documentos, anulación, emisiones pendientes y seguridad.
  Incluye FK CASCADE desconocida y dependencias sobre partidas de un borrador.
- Dos conexiones simultáneas con la misma solicitud: una eliminación, un evento,
  ambas respuestas coherentes (**PASS**).
- Navegador con UI/repositorio reales y SQL candidato: dos vehículos ficticios,
  confirmación obligatoria, cancelación del modal sin cambios, respuesta perdida
  después de commit y reintento de la misma solicitud, archivo/restauración,
  borrado de borrador, anulación, recarga y consulta del registro ya eliminado
  (**PASS**). Persistencia e integridad comprobadas desde otra conexión SQL.
- Chromium **1366/768/390 px**, sin desbordamiento horizontal; foco contenido en
  el modal, Escape y devolución de foco (**PASS**). No se afirma QA en dispositivos
  físicos ni otros navegadores.
- `npm run build` público **PASS**, con typecheck y límites de bundle/fixtures.
  Build privado con R1, CP03, CP04, CP05 y registros habilitados solo para compilar
  **PASS**; sin clave ni conexión Supabase. El interruptor productivo no se cambia.
- `git diff --check` **PASS**. Sin publicación ni CI alojada en esta etapa.

Evidencia local en `/workspace/work/records/`: `unit.log`, `consolidated.log`,
`postgres-core.log`, `postgres-history.log`, `postgres-browser-persistence.log`,
`build-public.log`, `build-private.log`, y capturas `desktop.png`, `tablet.png`,
`mobile.png`, `mobile-confirmation.png`, `archived-desktop.png`. Son evidencia
sintética del workspace, no se agregan al repositorio ni se toca `artifacts/`.

## Lista exacta de archivos de la entrega

Configuración, integración y documentación:

- `.env.example`
- `AGENTS.md`
- `agent.md`
- `roadmap.md`
- `vite.config.ts`
- `scripts/verify-official-bundle.mjs`
- `docs/checkpoints/CHECKPOINT_BT_CP05_ENTREGA_FUNCIONAL_20261122.md`
- `docs/checkpoints/CHECKPOINT_BT_REG_01_ADMINISTRACION_20261124.md`
- `docs/sql/BT_RECORDS_ADMINISTRATION_CANDIDATE.sql`
- `src/clientes/Cp03PrivatePanel.tsx`
- `src/clientes/cp03PilotDirectoryView.tsx`
- `src/clientes/cp03PilotRepository.ts`
- `src/ordenes/Cp04OrdersView.tsx`
- `src/ordenes/cp04Contracts.ts`
- `src/ordenes/cp04Repository.ts`
- `src/cp05/QuotePanel.tsx`
- `src/cp05/repository.ts`
- `src/official/recordChanges.ts`

Implementación nueva reutilizable:

- `src/records/contracts.ts`
- `src/records/repository.ts`
- `src/records/RecordsAdministration.tsx`
- `src/records/RecordsLoader.tsx`
- `src/records/records.css`

Validación focalizada y laboratorio:

- `src/records/repository.test.ts`
- `src/records/selectorIntegration.test.ts`
- `tests/harness/RecordsFixture.tsx`
- `tests/harness/main.tsx`
- `scripts/security/bt-records-assertions.sql`
- `scripts/security/bt-records-history-assertions.sql`
- `scripts/security/bt-records-browser-fixtures.sql`
- `scripts/security/bt-records-concurrency.sh`
- `scripts/security/records-lab-bridge.mjs`
- `scripts/security/verify-records-local.sh`
- `scripts/verify-records-browser.cjs`

No se modifican CP04 multipunto/checklist/autoguardado/PDF, CP06, respaldos,
migraciones aplicadas, autenticación, políticas existentes de lectura ni flujos
OAuth. La integración OT se limita a invalidación, rótulo Cancelada y filtros
operativos, con SQL candidato para la guarda de cancelación descrita arriba.
