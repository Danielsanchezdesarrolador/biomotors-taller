# BT-COMMERCIAL-HARDENING-01 — DELTA-01

Fecha: 27/11/2026, Chile. Estado: TARGETED_HARDENING_DELTA_REVIEW_PENDING.
Base exclusiva: `1b5a3cdb91ef6b7dead7c3ff3a8de00082f6e860`.
SHA del candidato completo y árbol: CANDIDATO.json de la entrega; SHA de transferencia: commit privado que contiene la carpeta. Se distinguen para evitar autorreferencia del commit.

## Diagnóstico y contrato comprobado

Se ejecutaron los cuerpos exactos y no modificados de diez funciones SQL oficiales: actor, seats, plan, week_start, authorize, assert_capability, status, reserve, finish y cached. Sus hashes constan en results.json. No se usa una respuesta HTTP ideal para sustituir la decisión SQL.

| Estado previo | Contrato real | Consumo y recuperación |
| --- | --- | --- |
| reserved vigente | reserve conserva UUID y sesión originales | No reata la sesión; finish/cached conservan guardas originales. |
| reserved vencida o failed sin confirmar | reserve vuelve a verificar permisos, plan, cupo y snapshot; recupera el mismo UUID con sesión actual | Cero consumo previo; una confirmación, reintentos idempotentes. No precisa nueva identidad comercial. |
| confirmed vigente, autoridad original válida | reserve reconoce confirmación y cached devuelve bytes canónicos | Un consumo; no renderiza otra copia ni rota UUID. |
| confirmed vencida o plan cambiado | reserve rechaza UUID con CONSUMPTION_REPLAY_EXPIRED | Consumo anterior permanece; no renueva autorización silenciosamente. Nueva operación requiere confirmación explícita y cupo actual. |
| confirmed vigente, sesión original revocada, nueva sesión del mismo usuario válida | cached rechaza CACHED_AUTHORITY_REVOKED aunque reserve acepte la identidad comercial | El delta revalida usuario y consulta status con la sesión actual antes de ofrecer HTTP 409 saneado y la UI de renovación existente. No entrega bytes ni crea consumo. |
| sesión actual revocada o membresía inactiva | actor/authorize/status rechazan | Sin bytes, render, consumo ni indicación de renovación autorizada. |

La renovación explícita de una operación confirmada es una NUEVA autorización, no recuperación gratuita del recibo anterior ni traslado de su sesión. El botón existente solo cambia metadata local tras confirmación; no llama al servidor automáticamente. La siguiente acción usa nuevo UUID y vuelve a someterse a cuotas/plan. En Full, un consumo anterior más una operación nueva expresamente solicitada producen dos consumos distintos; reintentar la nueva conserva uno. Bajo Básico el consumo anterior puede agotar la ventana y bloquear la nueva solicitud. No existe una promesa de renovación gratuita después de revocar la sesión original.

Una reserva no consumida y todavía vigente de una sesión anterior conserva su vínculo original: finish no puede confirmarla si aquella sesión está revocada. El delta permite la indicación explícita solo con autoridad actual válida. La reserva puede ocupar capacidad hasta vencer; tras vencer, el contrato SQL permite recuperar el MISMO UUID con la sesión actual y confirmar una vez. No se elimina la reserva ajena ni se relajan las guardas para liberar cupo.

## Solución puntual

`server/commercial/meteredDocument.ts`: ante las denegaciones precisas CACHED_AUTHORITY_REVOKED y MEMBERSHIP_REVOKED durante cached/finish, verificar otra vez identidad/confirmación de correo con getUser y ejecutar bt_commercial_status para el taller solicitado bajo la sesión actual. Únicamente una respuesta autorizada para ese taller convierte el fallo en CommercialOperationNotCurrent. Los tres handlers ya convierten esta clase en HTTP 409 DOCUMENT_OPERATION_NOT_CURRENT, reconocido por la UI existente.

La consulta status es de lectura: no se llama reserve para comprobar recuperación ni se renueva una reserva accidentalmente. Un error de status o usuario conserva denegación cerrada. Una revocación entre rechazo del caché y status también se deniega. Cada nueva acción repite las guardas SQL; la indicación de renovación no concede permisos futuros. No hay fallback a bytes locales ni al render descartado, ni modificación de UI, SQL, ACL, RLS, Storage, PDF o guards anteriores.

## Pruebas ejecutadas, una ronda focalizada

Ejecutor reproducible: `python3 scripts/security/verify-hardening-session-local.py`. Usa imagen PostgreSQL 17 ya instalada, contenedor propio con red deshabilitada y sin puertos publicados; siempre lo elimina. No instala dependencias ni consulta servicios productivos. Driver: tests/hardeningSessionLab.ts. Para el caso añadido de carrera usar BT_HARDENING_DELTA_FOCUS=cache-race y un directorio de evidencia distinto; no repetir los once ya aprobados.

Once casos principales PASS:

1. Reserva vencida no consumida recupera UUID y confirma una vez.
2. failed vencida no consumida recupera UUID y confirma una vez.
3. Dos flujos intercalados de recuperación del mismo UUID devuelven bytes canónicos y un consumo.
4. Confirmada vencida rechaza UUID y conserva confirmación/fecha sin render ni nuevo consumo.
5. Nuevo UUID no evita cupo Básico agotado por confirmación anterior.
6. Reingreso mismo usuario: reserve reconoce recibo y cached rechaza sesión original revocada.
7. Endpoint HTTP real traduce esa denegación a 409 y componente real ofrece botón de renovación; sin render, UUID nuevo ni consumo automático.
8. Renovación explícita cambia solo metadata; siguiente acción confirma UUID de sesión nueva una vez y reintentos recuperan bytes exactos sin otro render/consumo.
9. Sesión actual revocada deniega, sin bytes ni indicación de recuperación autorizada.
10. Membresía actual desactivada conserva fail-closed.
11. Reserva viva de sesión anterior mantiene guardas; solo tras vencer recupera el mismo UUID con sesión nueva y confirma una vez.

Un caso adicional PASS, ejecutado con filtro sin repetir los once: revocación SQL de la sesión actual entre rechazo de cached y reconsulta status conserva denegación; no ofrece renovación autorizada, no renderiza ni consume.

Total: **12 regresiones focalizadas PASS** con cuerpos SQL reales, adaptador SDK hacia PostgreSQL y HTTP/metered reales, metadata cliente y componente de renovación real renderizado en servidor. TypeScript PASS tras corregir un cast explícito del adaptador de prueba; el primer typecheck detectó TS2352 y no se contabiliza como PASS. Sintaxis Python y diff --check verificados. Empaquetado offline reproducible de los tres handlers: 43 archivos con hashes y fuentes coincidentes. No desplegados ni instalados.

Las **34 pruebas anteriores (20 unitarias/HTTP + 14 Chromium)** permanecen evidencia histórica intacta en BT-COMMERCIAL-HARDENING-01, commit privado `9c5751276f50c59cfbd2a7dba3c499331eef21df`. No se repitieron ni se contabilizan como ejecución del delta. No suites SQL históricas, WebKit, respaldos, auditorías ni escenarios visuales completos nuevos.

## Alcance de evidencia y límites

El laboratorio usa esquema sintético mínimo y bindings JWT de fixture; ejecuta las definiciones SQL reales sin modificarlas y conserva FORCE RLS de consumption y grants estrechos. No certifica firmas JWT alojadas, todo el esquema RLS productivo ni una auditoría multitenant completa. La concurrencia del caso 3 intercala dos flujos async con conexiones SQL separadas mediante llamadas síncronas; comprueba identidad/ledger del flujo, no constituye un stress test de transacciones simultáneas. Las comprobaciones históricas de concurrencia SQL no se repiten.

La UI de renovación se comprueba con el componente real SSR y metadata real, no con un navegador nuevo. Chromium histórico permanece histórico; WebKit y runtime Edge/CI oficial pendientes. No se promete revocar PDFs legítimamente descargados antes ni sus copias. Puede retenerse una reserva hasta su vencimiento. Una nueva autorización explícita puede consumir otro cupo y debe seguir pasando los permisos actuales.

## Archivos y transferencia

Cambio productivo único: server/commercial/meteredDocument.ts. Nuevos laboratorio/driver: scripts/security/verify-hardening-session-local.py y tests/hardeningSessionLab.ts. Documentación: AGENTS.md, agent.md, roadmap.md, checkpoint anterior aclarado y este checkpoint. Inventario exacto, diff binario incremental y reconstrucción de árbol en CANDIDATO.json y delta.patch.

DTK-ERR-056: carpeta privada BT-COMMERCIAL-HARDENING-01-DELTA-01, snapshots individuales, logs sanitizados, resultados SQL y hashes de funciones, dos PDFs sintéticos, paquetes offline actualizados y manifiesto SHA-256. Reconstrucción exacta desde base y verificación remota de bytes. Entregas anteriores intactas. No se requiere SQL candidato separado porque no se modifica SQL. Aplicación/reversión alojada: ninguna autorizada ni ejecutada; integración del cambio de código requiere revisión independiente, reversión por delta inverso si se autoriza posteriormente.

Sin push oficial, ramas nuevas, producción, Supabase alojado, Render, Edge desplegadas, migraciones, secretos, activación de logos/correo/pagos/registro ni servicios. Auto-Deploy no se activa; SEC07 cerrado. No aceptación comercial integral ni autorización de despliegue. No iniciar bloques B/C.
