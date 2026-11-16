# CP05 — entrega integrada preparada, NO OPERATIVA

Fecha: 16/11/2026. Base verificada `main`: `29d81f0` (no cambios concurrentes al iniciar ni en fetch final). Este es el informe único de la entrega; su commit se identifica con `git log -1 --format=%H -- docs/checkpoints/CHECKPOINT_BT_CP05_20261116.md`. No se inició CP06.

**CP05 no está operativo en Supabase alojado.** Se implementó el candidato completo permitido sin aplicar migraciones alojadas ni habilitar Storage, Edge, correos, secretos o rollout privado. El guardado real y la recuperación del piloto deben comprobarse tras autorización del Director; HTTP simulado y PostgreSQL local no sustituyen esa prueba.

## Comportamiento y conservación

Desde una OT CP04 se abre/recupera su única familia de cotización, o se consulta desde Informes y desde la ficha del vehículo CP03. Las relaciones pertenecen al mismo taller y provienen del servidor. El editor de partidas existente se reutiliza mediante extracción de componentes y cálculo puros: no se importan clientes, documentos ni sessionStorage DEMO en el módulo privado. No se crean precios/diagnósticos a partir de las 34 X ni se alteran sus autoguardados.

Ítems Repuesto/Insumo/Servicio/Mano de obra, cantidades positivas de hasta 10.000 con dos decimales, precio **neto entero CLP** entre 1 y 100.000.000, máximo 200 partidas, descripciones 1–160, condiciones/observaciones hasta 2.000 y vigencia 1–365 días. Línea redondeada a pesos por aritmética entera; IVA 19 % redondeado sobre el subtotal. El mismo motor del editor alimenta tabla y resumen, con total fijo visible. El 19 % sigue como supuesto pendiente de revisión tributaria, no factura.

La base asigna número por taller y versión; RPC atómicas controlan duplicados, reintentos y versión esperada. Solo hay éxito visible después de la respuesta persistida. Ante conflicto se conservan los cambios temporales para revisión explícita; la caché de pestaña (8 h) no autoriza ni sustituye guardado. Se elimina al logout/cambio de contexto; sesión/membresía inválida bloquea repositorio y limpia la vista. Las rutas y permisos de Auth existentes no se amplían: los roles SQL previstos no conceden nuevas entradas por elegir un rol visual.

`draft` admite edición; `issued` y snapshots son inmutables. Anular exige motivo y agrega auditoría; revisar abre nuevo borrador sin cambiar el documento previo. La reserva backend congela datos y partidas hasta completar/cancelar el archivo. No cambia estados de OT, no declara trabajos realizados ni aceptación contractual.

PDF auténtico A4, marca oficial ByteTorque separada del nombre real configurado del taller, cliente/vehículo/patente/OT, fecha, vigencia, partidas, neto/IVA/total, términos y aviso no tributario. Fuente DejaVu Sans sin modificar y licencia versionadas; se subconfigura al generar PDF, sin fuentes externas. Descarga de **borrador** habilitada en candidato; emisión archivada y descarga de revisión privada bloqueadas hasta aprobar infraestructura. No se presenta impresión HTML como PDF almacenado.

## Persistencia y seguridad candidatas

`docs/sql/BT_CP05_QUOTES_CANDIDATE.sql` es exclusivamente aditivo y **NO se ejecutó en Supabase alojado**. Tablas `quotes`, `quote_items`, `quote_revisions`, `quote_events`, `quote_delivery_events`, con taller, FKs compuestas, índices, RLS ENABLE/FORCE y SELECT por identidad/correo confirmado, taller y membresía activos. Escriben owner/admin/reception por RPC; mechanic solo lee. Sin INSERT/UPDATE/DELETE directos del cliente ni modificación de claves/fechas. Triggers impiden UPDATE/DELETE de snapshots y bitácoras incluso ante mutación administrativa ordinaria.

SECURITY DEFINER restringido al esquema privado con search_path fijo y grants explícitos: necesario para secuencia, operaciones atómicas y archivo/bitácoras que el cliente no puede falsificar. Wrappers públicos SECURITY INVOKER. Reserva/finalización/cancelación y ledger de entrega son exclusivamente backend confiable, no ejecutables por authenticated/anon. Los hashes SHA-256 ligan snapshot y ruta PDF por taller/cotización/revisión; no se sobreescribe el objeto y la restauración verifica bytes.

`server/cp05/` contiene puertos de emisión/archivo/restauración/proveedor y adaptadores Supabase inyectados, sin endpoints desplegados, construcción de SDK privilegiado, claves ni lookup de secretos. El llamador backend verifica usuario con Auth y consulta RLS antes de reservar; SQL vuelve a verificar actor/membresía. Política de archivo OFF bloquea antes de acceder a servicios. No se creó bucket/política Storage ni Edge. Si un render/upload falla, no se finaliza la revisión: se reintenta con la misma reserva o se cancela mediante RPC backend controlada.

Ledger append-only `queued/sent/failed`, destinatario del snapshot, intentos ordenados e identificador de proveedor. Solo un acuse confirmado permite `sent`; rechazo definitivo registra `failed`; acuse ambiguo sigue pendiente de conciliación, nunca se interpreta como éxito. Clave estable por revisión para el futuro proveedor idempotente. **No existe proveedor activado ni se envió correo**. Botones de emisión y correo muestran el bloqueo.

## Pruebas consolidadas

| Control | Resultado y límite |
|---|---|
| TypeScript raíz | PASS, incluye backend candidato y pruebas |
| Vitest | **552/552, 61 archivos**; preserva las 525 pruebas de la base, agrega 27 sobre importes/PDF/archivo/proveedor/permisos |
| Build Vite/PWA | PASS público, Auth+CP03+CP04 con CP05 OFF y candidato CP05 ON; exclusión de fixtures/secretos/backend del grafo público y marcas originales PASS |
| PostgreSQL 17 efímero | PASS, Docker `--network none`, sin puertos/credenciales alojadas. Creación/guardado de tres ítems, redondeo, idempotencia, conflicto, número concurrente, lectura en conexión nueva, A/B, mechanic sin RPC escritura, recepción, anon, correo no confirmado, membresía deshabilitada y taller suspendido |
| Historial SQL local | PASS: reserva/finalización idempotente con **recibo sintético**, snapshots/timestamps protegidos, anulación/revisión auditables, cliente editado y OT cerrada conservan historia, estados de entrega/errores/reintento sin reenvío tras sent |
| Archivo/PDF | PDF bytes reales, A4, Unicode, 200 partidas con paginación, bytes deterministas; adaptador de archivo probado con almacenamiento **simulado**, restaura mismos bytes y rechaza sobrescritura/hash distinto. No acredita Storage alojado |
| Navegador | Chromium Linux 1650/1440/768/390/375 PASS, tres partidas/total, controles bloqueados, sin overflow ni errores; 390 además recarga, logout/login y acceso desde vehículo. SDK real con HTTP interceptado; no cuentas reales |
| CP04 | Cinco tamaños PASS: métricas, borradores, refresh, foco/posición, diez X del recorrido y estados carga/error/vacío; unitarias preservan contrato de 34 X/autoguardado. Sin cambios al modelo ni SQL CP04 |
| Android nativo | TypeScript, export bundle Expo Android y verify-config/marca PASS; no cambios de fuente/nativo, sin APK. Expo consulta online de versiones bloqueada por proxy Forbidden; chequeo offline informa dependencias al día pero no equivale a catálogo remoto verificado |
| GitHub CI remoto | Workflows actualizados para build CP05 y lab SQL. API Actions devuelve **Forbidden**; no se declara PASS remoto |
| Dispositivos físicos | iPhone Safari/PWA y Android físicos no probados en esta entrega |

Reproducción: `npm run typecheck`, `npm test`, `npm run build`; flags `VITE_BT_AUTH_R1_ENABLED`, `VITE_BT_CP03_PRIVATE_ENABLED`, `VITE_BT_CP04_PRIVATE_ENABLED`, `VITE_BT_CP05_PRIVATE_ENABLED` solo para build/lab privados. `scripts/security/verify-cp05-local.sh` crea y elimina su contenedor aislado. `scripts/verify-cp05-browser.cjs` requiere harness loopback y HTTP sintético, nunca credenciales reales. Android usó caché Expo aislada en `/tmp`, sin alterar HOME ni instalar APK.

[Capturas de los cinco tamaños, resultados y PDF descargado](../screenshots/CP05_20261116/README.md). Todas las identidades capturadas son sintéticas, no clientes del piloto.

## Archivos y publicación

Núcleo: `src/cp05/`, `server/cp05/`, SQL/lab/workflow CP05; extracción pura `orderMoney.ts` y `workItemCore.ts`, adaptación mínima `WorkItemsEditor.tsx`. Entrada desde `App.tsx` y callbacks opcionales en paneles CP03/CP04; caché temporal limpiada por el mecanismo existente. Build/entorno/CI actualizados y licencia/fuente PDF agregadas. Auth, SQL/modelos CP03/CP04, multipunto/autoguardado y Android nativo preservados.

Render existente: `https://biomotors-taller-demo.onrender.com`, accesible HTTP 200 al verificar. No se modificaron sus variables, backend ni servicios. `VITE_BT_CP05_PRIVATE_ENABLED=false` por defecto; **no activar el flag por el mero hecho de compilar**. El push de código mantiene la presentación pública y los módulos CP03/CP04 autorizados; el estado de publicación se distingue de la activación CP05 y no certifica persistencia nueva. No se creó otro Render.

## Pendientes para operación autorizada

1. Revisar y autorizar por separado el SQL candidato con respaldo recuperable verificado; probar RLS/persistencia **en Supabase alojado**, recarga y nueva sesión con registros de prueba autorizados del taller.
2. Aprobar bucket privado/políticas, backend seguro y secretos fuera del frontend; validar emisión con archivo persistente, descarga/restauración verificadas y recuperación de reservas fallidas. Solo entonces habilitar el rollout privado correspondiente.
3. Contrastar formato, reglas de impuestos, numeración y datos comerciales con la hoja real de Ignacio. Probar el flujo imprescindible en su iPhone/Safari y en Android físico.
4. Correo exige autorización independiente de dominio/proveedor/backend, idempotencia, conciliación de acuses ambiguos y prueba real autorizada. Sigue OFF.
5. Consultar CI remoto cuando GitHub Actions sea accesible y confirmar la publicación servida; no sustituirla por resultados locales.

CP06 queda como próxima capacidad de historial/respaldo/piloto, **no iniciada**. No se solicita ni presupone autorización de infraestructura en esta entrega.
