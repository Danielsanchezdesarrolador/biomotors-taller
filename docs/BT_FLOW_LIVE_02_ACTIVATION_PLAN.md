## Adenda de publicación de código — 23/11/2026

El propietario aprobó el diseño CP05 y autorizó integrar exclusivamente los
ajustes de código/documentación LIVE-02 en `main` y validarlos con CI.
El recorrido candidato ya existe y no debe reconstruirse; la mejora muestra
decisiones/notas del servidor al volver a CP05 y valida recibos/historial.
Se mantienen **desactivados** SQL LIVE-02, gate servidor, flags de Render
y correo. No se ejecutará instalación alojada antes del respaldo/restauración
integral S4 y autorización específica. No confundir CI con aceptación LIVE.

---

# ByteTorque — BT-FLOW-LIVE-02 · Activación controlada (NO autoriza ejecutar)

**Fecha:** 18/11/2026 · **Rama:** `main` · **Estado:** esquema, UI y cliente candidatos probados offline; no instalados en producción.

## Objetivo funcional

Guardar y volver a consultar desde cualquier sesión autenticada la **declaración del personal del taller** sobre (a) la revisión de cotización autorizada por el cliente según el operador, (b) los trabajos seleccionados como realizados/no realizados y sus importes recalculados en PostgreSQL, y (c) la constancia de entrega declarada. Los tres registros llevan `workshop_id` y referencia a la misma OT, cotización/revisión y vehículo. Son **append-only**, no se sobrescriben ni suponen firma/autorización digital verificada, trabajo independiente acreditado, factura o pago.

## Artefactos preparados

- **Interruptor privado independiente de Render:** `bt_flow_live_private.rollout` arranca sin talleres habilitados; aun con SQL instalado y JWT de propietario válido, las tres RPC de escritura devuelven denegación hasta que un administrador de base apruebe expresamente **un único taller**. Ningún usuario/app tiene SELECT, INSERT ni UPDATE directo sobre esta tabla. Su aprobación y activación también están pendientes.
- `docs/sql/BT_FLOW_LIVE_02_CANDIDATE.sql`: tablas públicas RLS+FORCE, solo SELECT para usuarios autenticados del taller; sin INSERT/UPDATE/DELETE para navegador. Escritura únicamente mediante RPCs invoker públicas → implementación SECURITY DEFINER en esquema privado, con `auth.uid()` verificado y membresía/rol/taller activo. El importe ejecutado se calcula del snapshot de `quote_revisions`; jamás se acepta el total del navegador.
- `src/entrega/flowLiveCandidate.ts`: cliente privado con denegación por defecto, verificación de sesión antes/después, identificadores server-bound, métodos de escritura idempotentes y recuperación read-only vía RLS. **No se importa al bundle público ni al CP05 normal mientras la bandera está OFF**.
- `src/entrega/FlowLive02Panel.tsx` + `src/cp05/FlowLive02Loader.tsx`: interfaz en tres pasos, integrada con la última revisión emitida CP05; conserva el editor de trabajos existente. Muestra explícitamente declaración del operador y advierte que no equivale a firma.
- `src/entrega/WorkExecutionDraft.tsx`: botón de persistencia solo cuando existe callback del módulo privado; el borrador PDF R3/R2 anterior continúa como antes cuando está OFF.
- `scripts/security/verify-flow-live-02-local.sh` y `scripts/security/bt-flow-live-02-lab-assertions.sql`: PostgreSQL 17 en contenedor Docker **sin red**, CP02–CP05 montados en laboratorio, dos talleres, acceso revocado, mecánico denegado a escritura, integridad de revisión, reintentos/duplicados, cálculo CLP y relectura durable desde conexión separada.
- `src/entrega/flowLiveCandidate.test.ts`: pruebas Vitest de transporte sin llamadas con flag OFF, roles, recibos exactos, sesión cambiada, secuencias, lectura read-only y bloqueos de entregas huérfanas.
- `vite.config.ts` y `scripts/verify-official-bundle.mjs`: deniegan compilación del módulo real si faltan CP05 privado + documentos + Auth R1; y rechazan su presencia en builds normales. El CI prueba build separado con `VITE_BT_FLOW_LIVE_02_ENABLED=true`, **solo en CI efímero**, nunca en Render.

## Orden para activar (cada acción requiere autorización expresa)

1. Desde el PC personal, validar respaldo integral cifrado de Supabase (public, auth, permisos/roles/Storage) más segunda copia recuperable; efectuar restauración aislada y documentar tiempo/resultado. El backup local parcial que ya existía NO libera este control.
2. Completar **CP05**: bucket privado, SQL/Storage RLS verificable A/B, worker Edge con JWT y emisión PDF archivada; activar flags de CP05 sólo tras aprobación y prueba. Asegurarse de que una revisión real emitida y descargable sobreviva nueva sesión.
3. Verificar en staging/lab la migración candidata `BT_FLOW_LIVE_02_CANDIDATE.sql`, ejecutar advisors de Supabase, validar roles owner/admin/reception/mechanic, actor confirmado, cross-tenant, error de token, no actualización de histórico y FK. **No ejecutar sobre proyecto real todavía**.
4. Con aprobación específica, instalar sólo la migración aditiva en `biomotors-taller`, registrar versión de migración y comprobar permisos/lecturas en Supabase alojado. **Con la nueva tabla privada `bt_flow_live_private.rollout` vacía, comprobar que cualquier RPC de escritura devuelve 42501 incluso a un propietario; no habilitar todavía ninguna fila.** No habilitar el botón público ni usar datos reales todavía.
5. **Puerta de servidor independiente:** únicamente tras nueva autorización del titular y pruebas del taller QA, habilitar para ese taller específico la fila privada `bt_flow_live_private.rollout.enabled=true`, mediante SQL administrativo auditado. Otros talleres deben seguir OFF. Revocar `enabled` bloquea nuevas escrituras sin borrar el historial.
6. Con registro de ensayo de datos ficticios, activar `VITE_BT_FLOW_LIVE_02_ENABLED=true` en el servicio Render autorizado y validar: aprobación declarada de revisión emitida → OT en servicio/lista → ejecución con todas las partidas → reingreso y carga de datos guardados → OT lista → constancia por operador → consulta histórica. Verificar cuenta no miembro, mecánico y otro taller. Conflictos/no conexión no deben mostrar confirmación falsa.
7. Completar aceptación UX móvil Safari iPhone/Android, accesibilidad, contenidos PDF, normas de retención y privacidad. Validar que el texto de declaración del operador nunca se presente como una firma del cliente. Sólo entonces preparar constancia PDF emitida y paquete documental/email **BT-COM-01**, con tres archivos y aprobación aparte.
8. Al final, revisar **BT-PILOT-QA-04: A REPASAR** y la prueba de seguridad integral antes de incorporar los datos verdaderos del taller de Ignacio.

## Flags de despliegue

- **Default:** `VITE_BT_FLOW_LIVE_02_ENABLED` ausente / `false`.
- **Dependencias:** `VITE_BT_AUTH_R1_ENABLED=true`, `VITE_BT_CP03_PRIVATE_ENABLED=true`, `VITE_BT_CP04_PRIVATE_ENABLED=true`, `VITE_BT_CP05_PRIVATE_ENABLED=true`, `VITE_BT_CP05_DOCUMENTS_ENABLED=true`; el backend CP05 y la migración Live02 deben estar realmente instalados y aprobados.
- **Sin proveedores**: `VITE_BT_CP05_EMAIL_ENABLED` y correo consolidado se mantienen sin activar. Un permiso de plan, App Store, APK o la presencia del botón NO sustituye las verificaciones del servidor.
- **Nunca** insertar tokens secretos, service_role, credenciales, correos reales, claves de cifrado o información de los clientes en el repositorio.

## Limitaciones explícitas

- La aprobación actual es **declaración del operador** con método y nota, no prueba remota de aprobación ni firma verificable. Si se requiere firma digital/aceptación de enlace seguro, diseñar e integrar evidencia independiente antes de usar la declaración como autorización formal.
- La constancia guarda **declaración de entrega**, no firma ni prueba fotográfica; no cierra automáticamente la OT, no envía correos, no registra pagos, no acredita prestaciones tributarias.
- El historial CP06 conserva órdenes/diagnósticos, y el esquema Live02 deja índices para enlazar constancias por vehículo; **la presentación de estos tres registros dentro de CP06 queda pendiente de integración posterior**, una vez que su lectura alojada esté aprobada y probada.
- Los PDF actuales del informe técnico siguen marcados **BORRADOR INTERNO**. No presentarlos como versión final emitida hasta crear flujo de renderizado/archivo privado con revisiones inmutables y permisos de entrega.
