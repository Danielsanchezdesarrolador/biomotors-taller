# CP05 — entrega funcional coherente de cotizaciones (22/11/2026)

**Estado:** código local en `main`, sin push, despliegue ni cambios productivos.
**Base:** `f6937a1d4e03d14f9d66036ac56b2b78c1a4ee43`, comprobada y actualizada por
fast-forward. Se preservaron el PDF multipunto, S4I y `artifacts/` no versionados.
Este es el único checkpoint nuevo de esta entrega. El commit local de cierre
contiene este documento y los archivos enumerados; no existe CI nuevo remoto.

## Autorización y alcance

El titular pidió completar CP05 reutilizando `src/cp05/`, `server/cp05/` y SQL
existente. Autoriza preparación y validación local; **S4 integral pendiente impide
activar emisión, SQL, Storage y Edge alojados**. Correo permanece OFF. Sin ramas
nuevas, push/deploy, suscripciones/pagos, datos reales ni trabajo sobre CP04.

## Qué ya existía y qué se completó

| Capacidad | Base existente reutilizada | Aporte de esta entrega |
| --- | --- | --- |
| OT/cliente/vehículo | Repositorio autorizado y relación derivada de registros CP03/CP04 | Comprueba también OT exacta, revisión/taller/cliente/vehículo del snapshot y pertenencia de eventos |
| Borradores | RPC open/save, numeración por taller, UUID idempotente, versión optimista; SQL CP05 aplicado históricamente 17/11 | Una escritura confirmada no vuelve a presentarse como fallida si se rompe la lectura posterior; conciliación mediante GET, sin segundo RPC |
| Recuperación | Borrador en PostgreSQL + cambios locales por pestaña/usuario/taller, TTL 8h, limpieza al cerrar sesión | Conserva indicio de versión confirmada en la misma estructura temporal; distingue cambios locales de cambios ya guardados al recuperar |
| Partidas/IVA | Repuestos/insumos/servicios/mano de obra; cantidades ×100, precios netos enteros CLP, redondeo por línea e IVA 19 % | Se preserva algoritmo y validación cliente/SQL, con pruebas de concordancia; no se inventa otra base tributaria |
| Emisión | Reserva de snapshot, archivo privado, lectura de comprobación/hash, confirmación SQL, historial inmutable | Recuperación explícita de una emisión ya completada, por actor/cotización/versión, verificando sus bytes originales; no vuelve a renderizar ni sobrescribir |
| PDF | Plantilla oficial R3 vectorial y logo ByteTorque, borrador claro, render determinista | Sin rediseño; recursos cargados solo cuando hay que renderizar, por lo que un PDF ya emitido se recupera aunque el renderizador/recursos actuales fallen |
| Archivo/historial | Backend candidato de Storage privado append-only, SHA-256, descarga autorizada, snapshots/revisiones/eventos | Vista de contenido congelado: partidas, importes, condiciones, observaciones y vigencia de cada revisión, sin ediciones habilitadas |
| Escritorio/móvil | Diseño R2 y editor existentes | Casos nuevos de fallo tras guardar, conciliación y consulta de historial probados en Chromium 390/1366 |
| Correo | Código candidato y gates existentes | No activado, proveedor real no contactado; tests heredados utilizan únicamente dobles sintéticos |

No se reconstruyeron cotizaciones ni se alteró CP04, el cálculo compartido de
importes, las migraciones ya aplicadas o los documentos de inspección.

## Persistencia: qué se puede afirmar

- La creación/edición/recuperación de borradores **ya tenía persistencia Supabase**
  en SQL CP05 y una prueba alojada histórica con QA1234, según los checkpoints
  previos. No se repitió esa operación ni se consultaron datos reales hoy.
- Esta entrega demuestra persistencia **en PostgreSQL 17 local real**, con nueva
  conexión después del guardado, concurrencia de numeración, RPC idempotentes,
  snapshots inmutables y permisos. No depende de sessionStorage para el guardado.
- El recorrido React/SDK utiliza **HTTP sintético**, incluido logout/login. Los
  cambios temporales de pestaña son solo recuperación auxiliar, nunca autoridad
  ni una confirmación de guardado en servidor.
- PDF de borrador es descargable localmente. Emisión/archivo/descarga histórica
  alojados **NO se declaran operativos**: faltan S4, bucket/políticas, función,
  nuevo SQL de recuperación y autorizaciones. Los tests de Storage usan memoria
  sintética; el laboratorio SQL utiliza recibos sintéticos explícitos.

## Implementación de conciliación

`QuoteReadPending` contiene solo ID y versión devueltos por un RPC confirmado.
Si falla la lectura, el editor conserva sus datos y pausa escritura/emisión;
«Recuperar operación confirmada» ejecuta una lectura autorizada. El indicio de
versión no concede acceso. Pérdida de membresía, sesión o repositorio descartado
permanece `denied` y retira contenido; nunca se degrada a permiso temporal.

Cuando el bundle ya se recuperó y solo falla el listado, la UI conserva el bundle
confirmado y diferencia el error de listado del guardado. La idempotencia existente
sigue protegiendo respuestas RPC ambiguas: no se generan IDs nuevos por un simple
reintento. En producción una respuesta RPC perdida aún exige conciliación, no
asumir éxito ni afirmar que nunca se podrá perder una respuesta.

## SQL y Edge preparados, no instalados

`docs/sql/BT_CP05_COMPLETED_ISSUE_RECOVERY_CANDIDATE.sql` es aditivo sobre CP05:
función privada de lectura, wrapper público SECURITY INVOKER y ejecución
exclusiva `service_role`; usa el autorizador existente con actor confirmado y
membresía de escritura. Clave de consulta: taller/cotización/versión/actor.
Índice único parcial para solicitudes completadas; no reescribe historia ni
modifica estados/recibos. Si hay datos previos incompatibles, no forzar el índice.

El backend verifica primero visibilidad de la cotización bajo RLS, consulta una
emisión completada, recupera el PDF por ruta canónica y valida SHA/tamaño antes
de responder. Si no existe, conserva el flujo previo de reserva/render/archivo/
finalización. El SQL de recuperación debe aprobarse/instalarse **antes** del nuevo
backend; si falta, este falla cerrado. No hay compatibilidad silenciosa que omita
esta comprobación. Reservas pendientes con bytes en conflicto siguen bloqueadas;
no se adoptan ni sobrescriben archivos desconocidos.

Se ensambló y verificó el paquete offline en
`/tmp/bytetorque-cp05-functional-candidate`: JWT obligatorio, recursos/versiones
fijados y licencia. Es artefacto revisable, no un despliegue; runtime Deno alojado
no certificado. Se conservan las políticas Storage candidatas y los gates OFF.

## Verificación consolidada y evidencia

- **66/66 pruebas CP05 PASS, 6 archivos**. Incluyen los nuevos casos de lectura
  fallida tras RPC, retirada de autorización, recuperación de emisión completada
  sin renderizador, archivo ausente/corrupto, limpieza/ámbito de borradores y las
  pruebas pertinentes existentes de IVA, PDF, inmutabilidad, mecánico y permisos.
- PostgreSQL local aislado sin red: `CP05_LOCAL_RLS_HISTORY_PASS`,
  `CP05_ANON_EMAIL_WORKSHOP_RECEPTION_PASS`,
  `CP05_COMPLETED_ORIGINAL_SNAPSHOT_RECOVERY_PASS`,
  `CP05_FRESH_CONNECTION_PERSISTENCE_PASS`, `CP05_CONCURRENT_NUMBERS_PASS`.
  Bootstrap CP03/CP04 solo como dependencia de esquema; no pruebas multipunto.
- TypeScript y builds público/CP05 privado con documentos candidatos: **PASS**,
  incluidos grafo público, exclusión de fixtures e identidad PWA/marca. Flags
  solo para procesos locales, correo false; no .env/flags alojados modificados.
- Paquete Edge offline y verificador: **PASS**, sin red ni despliegue.
- Navegador: 390 completó conciliación sin otro RPC, PDF real, recarga, logout/
  login y recuperación del borrador. 1366 comprueba listado fallido después de
  guardar y consulta histórica inmutable. **390 y 1366 PASS**, sin overflow ni errores JS; ambos consultan el historial
  congelado sin alterar condiciones actuales. Se repitieron solo casos afectados
  después de corregir fixtures, no la batería consolidada completa.
- No se repitió la suite general, auditorías S4I ni las 47 pruebas multipunto.

Evidencia sintética: `/workspace/work/cp05-functional/` (`unit.txt`, `postgres.txt`,
`edge.txt`, `build-public.txt`, `build-private.txt`, logs de navegador y capturas).
PDF de borrador creado desde React: `browser-mobile-history-final/cotizacion-browser.pdf`.
Artefactos temporales, sin clientes reales, secretos ni información de producción.

## Incidentes comprobados y soluciones

- **CP05-FUNC-01 (código base):** lectura después de RPC o listado fallido impedían
  instalar el resultado confirmado y mostraban «No se confirmó el guardado».
  Causa comprobada en repository.command/QuotePanel.action. Solución:
  `QuoteReadPending`, indicio de versión, pausa de edición, GET de conciliación;
  instalar el bundle antes de actualizar listado. Tests unitarios y móvil PASS.
- **CP05-FUNC-02 (código base):** reintentar una emisión completada volvía a
  renderizar. Aunque PDF es determinista para iguales recursos, un recurso/
  renderizador cambiado podía fallar o entrar en conflicto con el archivo
  original. Solución SQL/Edge aditiva de recuperación completada y assets lazy;
  test conserva bytes, rechaza archivo faltante y no contacta proveedor. PASS.
- **CP05-TEST-01:** primer recorrido nuevo agotó 30 s esperando conciliación.
  Fixture emitía un único HTTP 503 y el SDK lo reintentó hasta recibir 200.
  Causa confirmada en postgrest-js: RETRYABLE_STATUS_CODES=[520,503]. Cambiado
  solo el fallo sintético a HTTP 400 con código no clasificado; no cambian
  reintentos productivos ni umbrales. Caso 390 pasó sin RPC adicional.
- **CP05-TEST-02:** aserción inicial del historial esperaba cero botones; el
  WorkItemsTable reutilizado muestra siete botones deshabilitados para tres
  partidas. Se comprueba cero botones habilitados, manteniendo readOnly y
  permisos servidor. No se modifica el componente compartido ni CP04.
- **CP05-TEST-03:** typecheck inicial detectó tipos demasiado estrechos de errores
  y del mock RPC en nuevas pruebas. Se corrigió el doble sintético, no la SDK;
  TypeScript y compilaciones consolidadas posteriores PASS.
- **CP05-TEST-04:** el selector exacto global de «Condiciones» no resolvió tras
  recuperar el textarea con contenido. DOM capturado: status draft, dos textareas,
  sin alertas y condiciones vigentes intactas. Se selecciona el textarea del
  fieldset CP05 y se conserva la comparación exacta del valor. Escritorio y móvil
  PASS, con captura del historial, sin modificar el control compartido.

## Archivos exactos de esta entrega

1. `src/cp05/contracts.ts`
2. `src/cp05/repository.ts`
3. `src/cp05/repository.test.ts`
4. `src/cp05/temporaryDraft.ts`
5. `src/cp05/temporaryDraft.test.ts` (nuevo)
6. `src/cp05/QuotePanel.tsx`
7. `src/cp05/cp05.css`
8. `src/cp05/documentClient.ts`
9. `src/cp05/pilotDocuments.test.ts`
10. `server/cp05/issuanceCandidate.ts`
11. `server/cp05/supabasePortsCandidate.ts`
12. `server/cp05/documentHandlerCandidate.ts`
13. `docs/sql/BT_CP05_COMPLETED_ISSUE_RECOVERY_CANDIDATE.sql` (nuevo)
14. `scripts/security/verify-cp05-local.sh`
15. `scripts/security/bt-cp05-completed-assertions.sql` (nuevo)
16. `scripts/verify-cp05-browser.cjs`
17. `docs/BT_CP05_ENTREGA_FUNCIONAL.md`
18. `docs/checkpoints/CHECKPOINT_BT_CP05_ENTREGA_FUNCIONAL_20261122.md` (único checkpoint nuevo)
19. `agent.md`
20. `roadmap.md`

## Puertas siguientes y autorización necesaria

1. Revisar/autorizar la publicación del commit local en main; sin push ni deploy
   en esta entrega. Mantener Render OFF, sin cambiar su configuración.
2. **Completar S4 integral y obtener autorización específica** para instalar
   únicamente el nuevo SQL CP05 de recuperación y los prerrequisitos que realmente
   falten. No reaplicar la migración CP05 histórica ni migraciones PLAN04 por
   deducción; no tocar Auth/RLS alojados fuera del cambio aprobado.
3. Autorizar bucket privado `cp05-quote-documents`, MIME PDF, 20 MB, políticas
   backend-only candidatas; revisar acceso público/directo antes de habilitar.
4. Autorizar despliegue/configuración de `bt-cp05-documents` y secretos solo en
   backend. Archive true únicamente tras validaciones; **email false**, sin
   requerir credenciales de correo para emitir/descargar. No pedir valores al chat.
5. Autorizar actualización del frontend y gate de documentos después de verificar
   backend. QA alojada controlada A/B, mecánico/revocación, guardado/relogin,
   emisión/reintento, descarga íntegra e historia tras cambiar el borrador;
   Safari/iPhone físico y aceptación operativa de Ignacio pendientes.

No se modificaron Supabase, SQL/Storage/Edge alojados, Render, secretos, datos,
Auth, políticas, correo, pagos, CP04 ni CP06. No cuentas/concesiones para Ignacio,
respaldo, exportación ni restauración realizados. No se certifica piloto con
clientes reales ni recuperación integral por aprobar un laboratorio CP05.
