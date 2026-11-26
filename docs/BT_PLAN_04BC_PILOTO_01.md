# BT-PLAN-04BC-PILOTO-01 — candidato consolidado

Fecha: 26/11/2026, Chile. Base oficial obligatoria: `6f63bbdea12dbfa73b24eec43c055bbbcddb50a3`. Desarrollo local en `main`; integración oficial y activación pendientes de Dirección Técnica.

## Resultado y reutilización

Se conserva el alta, la cuenta personal, el Panel Creador y el espacio técnico existentes. No se reconstruyeron WorkshopHome, PersonalHome ni MechanicWorkspace. Se reutiliza íntegro `BT_PLAN_04C_MECHANICS_CANDIDATE.sql`. Los candidatos 04B/04C aún requieren instalación autorizada; su presencia en Git no acredita instalación.

04B conserva una transacción para taller, perfil, membresía owner, vinculación de licencia, suscripción y auditoría. El titular procede exclusivamente de Auth confirmado con sesión vigente. La llave de solicitud enlaza actor, nombre y taller; el bloqueo por cuenta impide dos altas concurrentes con una sola licencia. Full permanente solo puede concederse desde el endpoint Creador con AAL2, cuenta destinataria confirmada y motivo. La concesión personal y el endpoint heredado sincronizan la suscripción del taller vinculado. Se corrigió además la reutilización de solicitudes del endpoint heredado para contrastar todos sus parámetros, mediante una columna incremental nullable en su auditoría. Solicitudes históricas sin esa identidad no se reinterpretan como nuevas concesiones.

04C ya implementa las ocho plazas Full, cuatro Plus, reserva de invitaciones pendientes, bloqueo por taller, tokens aleatorios conservados solo como hash, caducidad de 48 horas, rotación, revocación y desactivación. Se verificaron dos incorporaciones, aceptación con correo confirmado coincidente, permisos y concurrencia. El titular comparte el enlace manualmente; el token no se conserva en localStorage/sessionStorage ni en los resultados auditados. La cuenta personal del mecánico sigue Básico y no necesita pago. No se habilitaron extras de pago ni billing 04D.

## Autorización operativa

Se elimina la dependencia del UUID QA en `canOpen` y de `VITE_BT_CP05_PILOT_WORKSHOP_ID` en el cliente de documentos. La capacidad llega mediante el SDK compartido y el RPC `bt_plan04_operations_status`, que comprueba Auth confirmado, sesión viva, membresía y taller activos. Una respuesta ausente, errónea, no booleana, de otro taller o tardía no concede capacidad. Los cambios de capacidad invalidan la autoridad local. Se conservan los controles de borradores, identidad FIX-ID y guardas del recorrido.

El nuevo RPC proyecta los registros privados de rollout existentes; no introduce una segunda tabla de permisos. `configure_pilot` es una herramienta privada del propietario de la base, sin EXECUTE para PUBLIC, anon, authenticated ni service_role. Solo permite habilitar talleres activos cuyo titular tenga Full permanente manual, vinculado y sincronizado. No concede licencias ni se ejecuta durante la instalación. Coordina FLOW, Agenda y archivo en una transacción por taller con motivo explícito. Agenda conserva su kill switch independiente: apagar la agenda no bloquea la recepción física ya aprobada. Deshabilitar un taller aún no habilitado no concede lectura de archivo. Al deshabilitar escrituras conserva el acceso a originales históricos. Crear BIOMOTORS no activa estos registros automáticamente.

| Área | Control efectivo conservado / adaptación |
| --- | --- |
| Agenda | authorize de servidor, rollout por taller, timezone, revisión/aprobación vigente, fase planned/received y recibo inmutable. |
| CP03 | GRANT por columnas y RLS por taller; owner/admin/reception escriben, mechanic consulta. No cambios ni ampliación de roles. |
| CP04 | RLS, OT/vehículo del mismo taller y versiones; mecánico registra inspección, owner/admin gestionan estados. No cambios de permisos. |
| CP05 | Roles/membresía/RLS y snapshot de revisión. El Edge candidato consulta nuevamente el RPC con el cliente del usuario antes de crear puertos privilegiados. Kill switches globales, JWT y correo OFF conservados. |
| Aprobación | Rollout FLOW por taller, revisión actual y testimonio explícito; no se elimina el cotejo del recorrido. |
| Ejecución y entrega | Precondiciones SQL, OT/revisión/aprobación/estado y confirmaciones existentes. No se inventan hallazgos ni se altera la atomicidad. |
| Archivo | Guardas owner/admin y rollout de lectura/escritura de servidor; tres originales privados y hashes, sin regenerar históricos. |
| Administración de expedientes | Su rollout independiente no se activa por `configure_pilot`; no es necesario para completar una visita ordinaria. |

El frontend requiere también sus kill switches de compilación existentes. Estos flags permiten mostrar módulos; nunca conceden autorización de otro taller. Los permisos de directorio y de CP04 siguen siendo los contratos multitenant ya instalados, no una nueva restricción comercial por licencia.

## Perfil comercial y S5B

El perfil textual alimenta únicamente snapshots de nuevas emisiones. Se adapta el candidato de branding a `prepare_issue_before_agenda` de FLOW-FIX-01, con preflight de cuerpo instalado; se conserva el wrapper actual de Agenda. Se elimina del candidato antiguo el mínimo de condiciones que habría revertido el arreglo LIVE. Se conservan fuente, fase de recepción, idempotencia, revisión y hash. Cambiar el perfil después de reservar/emitir no modifica esa reserva ni sus originales.

No se aplica `BT_PLAN_04B_BRANDING_STORAGE_CANDIDATE.sql` ni se crea `bt-workshop-branding`. La carga de logo queda deshabilitada en Configuración. Tampoco se habilitan plantillas propias ni su bucket. El PDF oficial existente conserva los datos comerciales textuales y la atribución ByteTorque.

El checkpoint S5B describe inventario dinámico y recuperación de 11 PDF; el ejecutor integrado reside fuera del repositorio. Eso no confirma recuperación segura de PNG/JPEG de un nuevo bucket. Antes de autorizarlo, Seguridad debe confirmar que el inventario incluye bucket privado, todos sus objetos/versiones referenciadas y metadatos, que el manifest verifica bytes/MIME/tamaño/SHA, que las referencias `workshop_profiles.logo_path` se recuperan junto con la base y que la restauración conserva privacidad/RLS y separación de talleres. No se considera suficiente que el respaldo actual seleccione solo PDF o los dos buckets existentes. Hasta esa confirmación, no incluir el SQL de logo en la activación. No se repitieron respaldo, restauración ni auditorías SEC07.

## Validación consolidada y evidencia

- 122 pruebas unitarias pertinentes en 12 archivos PASS: Auth/capacidades y respuestas tardías, gateway, progreso/autoridad, documentos Edge, registro, cuenta personal, clientes RPC y entrega temporal de invitaciones.
- 51 comprobaciones PostgreSQL 17 PASS: creación/MFA/idempotencia/sincronización, dos mecánicos, ocho plazas, reserva/caducidad/rotación/revocación, aislamiento, circuito Agenda → recepción → inspección sintética → cotización emitida → aprobación → ejecución → entrega → archivo y recuperación por SHA; concurrencia de altas y de última plaza.
- Recorrido de navegador a 1440 y 390 px PASS con HTTP interceptado, seis capturas y ocho condiciones registradas por recorrido. Comprueba carga de logo bloqueada, enlaces sin persistencia y espacio del mecánico. No acredita QA en Supabase real.
- TypeScript, compilaciones pública y privada y paquete oficial Edge CP05/verificación offline PASS. Sin despliegue.

La base SQL es un contenedor PostgreSQL 17 con `--network none`; reutiliza DDL y metadatos registrados del estado instalado, no las suites históricas. Los PDF son reales, generados por los puertos vigentes; el servicio Storage es una simulación en memoria con metadatos SQL, no Supabase Storage real. Todo usuario/cliente/taller/inspección de prueba es sintético.

Incidencias del ejecutor, conservadas en los logs: el primer intento SQL especificaba IDs que los GRANT por columnas impiden al cliente; se corrigió el fixture para dejar que la base generase los IDs y la validación focalizada final pasó. El ejecutor de pantalla del 17/11 necesitó adaptar navegación de Agenda, un selector duplicado y las lecturas simuladas actuales; tres intentos fallidos quedaron registrados antes del PASS final. No se relajaron RLS ni las aserciones de error/red. El nuevo test Edge se ejecutó expresamente dentro de `src`, porque la configuración normal de Vitest excluye `server`. Los conteos anteriores corresponden a ejecuciones efectivas, no a suites omitidas ni a intentos fallidos. En la revisión final se añadió la regresión de independencia de Agenda y de deshabilitación sin concesión de lectura: la ejecución SQL final contiene 51 comprobaciones PASS, y se conserva también el resultado anterior de 48. Solo se repitió la validación SQL afectada por ese ajuste; no las unitarias ni el navegador ya aprobados. No se repitieron las suites históricas ni los 21 escenarios visuales.

## Orden de activación propuesto, NO ejecutado

1. Dirección Técnica revisa el paquete y autoriza integración oficial por separado. Verificar catálogo instalado: Creator/04A, FLOW-FIX-01 LIVE, Agenda y archivo, firmas/ACL/propietarios y ausencia de instalación parcial 04B/04C. Mantener Auto-Deploy y correo OFF; comprobar vigencia del respaldo integrado existente conforme al protocolo, sin generar otro por rutina.
2. En ventana aprobada, instalar `BT_PLAN_04B_WORKSHOPS_CANDIDATE.sql`, `BT_PLAN_04C_MECHANICS_CANDIDATE.sql`, `BT_PLAN_04BC_PILOT_CANDIDATE.sql` y `BT_PLAN_04_CP05_BRANDING_CANDIDATE.sql`, en ese orden. Son incrementales sobre el estado oficial, con transacción individual; no ejecutarlos ciegamente si el catálogo difiere. El último aborta ante deriva del cuerpo esperado. No instalar 04D ni Storage de branding/plantillas.
3. Autorizar por separado el Edge CP05 candidato empaquetado, preservando `verify_jwt=true`, secretos actuales y correo OFF. El nuevo modo consulta la autorización del servidor; falla cerrado sin el RPC instalado. Final Archive conserva su versión y contrato existentes.
4. Autorizar el frontend candidato. Deben estar disponibles `VITE_BT_AUTH_R1_ENABLED`, `VITE_BT_CREATOR_PRIVATE_ENABLED`, `VITE_BT_PLAN04_PRIVATE_ENABLED`, `VITE_BT_PLAN04_WORKSHOPS_ENABLED` y los gates existentes de CP03/04/05/06, documentos, FLOW-LIVE-02, Final Archive, registros y Agenda. `VITE_BT_AUTH_SIGNUP_ENABLED` requiere autorización de registro independiente. Los flags de correo, billing y plantillas propias continúan OFF. No cambiar configuración en esta entrega.
5. Ignacio se registra y confirma su propio correo mediante el mecanismo Auth existente. El Creador verifica UUID destinatario y MFA real y concede Full permanente con motivo e idempotencia. Ignacio crea BIOMOTORS y comparte dos invitaciones manuales; los mecánicos se registran/confirman por sí mismos y aceptan con el correo correspondiente. No crearles cuentas ni confirmar correos mediante atajos administrativos.
6. Tras autorización explícita del taller/UUID ya creado, el propietario de la base usa `bt_platform_private.configure_pilot` para ese taller concreto. No introducir UUID reales en la migración ni habilitar todos los talleres. Verificar capacidades, acceso A/B y recorrido humano del piloto antes de admitir datos reales. No confundir PASS sintético con aceptación alojada.
7. Ante suspensión, usar el control por taller para apagar escrituras FLOW/Agenda/archivo, conservar lectura de originales y deshabilitar el frontend si procede. No eliminar tablas, licencias, membresías, historial ni aplicar rollback destructivo con datos nuevos. Los flags ya existentes de correo permanecen OFF.

## Limitaciones y estado

Candidato local y privado; sin integración oficial, CI remota ni activación. No se consultaron ni modificaron Supabase, Render o sus secretos. No se crearon cuentas reales, licencias reales, correos, pagos o buckets; no se repitió S5B. MFA y confirmación Auth reales son prerequisitos todavía no certificados aquí. La disponibilidad del canal Auth de confirmación debe verificarse antes de abrir registro; no se habilita correo automático de invitaciones.

Los límites aceptados del piloto FLOW se conservan: un editor por OT; aprobación/cotejo obligatorios; visitas completamente vacías excluidas, sin inventar resultados; atomicidad hallazgo-partida no certificada. No se implementa una nueva arquitectura ni se modifica B01–B04. La personalización de logo/hoja base permanece diferida por recuperación; los PDF textuales nuevos sí están preparados. SEC07 cerrado, FLOW-UX-01-R2 pausado y Auto-Deploy OFF.

## Documentación y contratos consultados

AGENTS.md (estado reciente y regla de economía de cuota), agent.md, roadmap.md; checkpoints PLAN04B, PLAN04C e implementación consolidada del 17/11; FLOW-FIX-01 y S5B integrado del 26/11; candidatos SQL 04A/04B/04C, branding Storage/CP05 y los contratos CP03/04/05, FLOW, Agenda y archivo; `tests/fixtures/flowFixInstalled.json`; índice visual R2, sistema visual oficial, catálogo de marca y referencia visual móvil BT-BRAND-02; código y ejecutores pertinentes ya existentes. Procedimiento de transferencia: [DTK-ERR-056](https://github.com/Danielsanchezdesarrolador/development-toolkit/blob/main/05-errores-y-soluciones/DTK-ERR-056.md), consultado en lectura. Sin nueva auditoría histórica.
