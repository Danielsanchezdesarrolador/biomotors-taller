## BT-FLOW-LIVE-02 — SQL alojado instalado, rollout OFF (24/11/2026)

El propietario autorizó expresamente esta instalación SQL después de conocer el cierre del respaldo S5B + PDF de Storage en su alcance acordado. No equivale a autorización de activación ni a certificación S4 integral, segunda copia independiente, paridad completa de permisos o DR de todos los servicios. Conservar los requisitos de seguridad y recuperación pendientes para uso real; no presentar el plan histórico integral como cumplido.

Migración registrada en Supabase: `20261124213015_bt_flow_live_02_operator_attestations_off`. Fuente: [SQL candidato](https://github.com/Danielsanchezdesarrolador/biomotors-taller/blob/cb77f4b30a6d793e902863994334196d81a52455/docs/sql/BT_FLOW_LIVE_02_CANDIDATE.sql), blob `6464dc3d10117f304f35d86e1bd18e4661b6c001`. Aplicación exitosa una sola vez, en transacción; solo se agregaron límites locales de sesión lock_timeout 5s y statement_timeout 60s, sin alterar el DDL ni los contratos. Preflight de catálogo confirmó ausencia de instalación parcial, CP03/04/05, claves compuestas, columnas, roles y lector CP05 requeridos, así como migraciones CP05 de archivo privado y recuperación ya registradas. No reaplicarlas.

Postflight read-only: tres historiales nuevos vacíos, RLS y FORCE 3/3, trigger inmutable y política de lectura 3/3, SELECT autenticado y sin DML directo, anon sin acceso; wrappers invoker con EXECUTE autenticado y sin EXECUTE anon/service_role. Rollout privado vacío, 0 talleres habilitados, RLS+FORCE, sin acceso API directo. Prueba SQL en transacción READ ONLY y rollback, contexto de claims simulado de owner elegible y rol authenticated, IDs de recursos ficticios: las 3 RPC denegaron 42501 BT_FLOW_ACCESS_DENIED; marcador FLOW_OFF_OWNER_SQL_CONTEXT_3_OF_3_DENIED. Esto no certifica JWT real, recorrido alojado ON ni QA física. No se registraron filas reales o de prueba.

**Estado vigente:** LIVE-02 instalado pero NO activo. Sin cambios Render/Edge/Storage/flags/correo, sin deploy; mantener main y Auto-Deploy OFF. BT-REG-01 sigue pendiente; sus guardas opcionales pueden ahora instalarse sobre las tres tablas LIVE-02, previa revisión y autorización específica. Después COM-01C y BT-EXP-01, respetando dependencias y rollout OFF. No ejecutar otro respaldo ni pruebas aprobadas por rutina; evaluar vigencia si hay cambios de datos y mantener la pauta SEC07. No habilitar talleres ni enviar correos sin nueva autorización y QA controlada.

---

## Adenda de código y continuidad — 23/11/2026

Rediseño CP05 **aprobado visualmente por propietario**, emisión QA previa aprobada.
El propietario autorizó una sola publicación en `main` de la mejora LIVE-02
(código+documentación y CI), excluyendo SQL alojado, Render, flags y correos.

Se corrigió el vacío localizado de presentación: al recuperar evidencias RLS,
CP05 pasa a mostrar las decisiones por partida, notas y totales registrados
de esa revisión emitida, y evita llamar «sin guardar» a la ruta de registro.
Se fortaleció la validación de recibos RPC y datos recuperados frente al
snapshot CP05; se agregaron regresiones focalizadas de decisiones alteradas.
No se modifica el SQL candidato ni se afirma firma/entrega independiente.

Base de trabajo: `e0fee642f41516968023c52a14fc2583f2bb0636`. La CI y el SHA de publicación deben confirmarse
en GitHub; **no declarar este nuevo commit aprobado en QA** sólo por publicar.
Las tres tablas LIVE-02 siguen ausentes de Supabase. S4 integral pendiente;
sin despliegue LIVE-02, sin escritura alojada y sin uso con clientes reales.

---

# ByteTorque — Checkpoint BT-FLOW-LIVE-02 · Persistencia de ejecución y constancia de entrega

**Fecha:** 18/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama única:** `main`.

**Checkpoint de partida:** `29f11a7f929929df561b5da08f1d99ff11b9f817` (BT-FLOW-LIVE-01, informe técnico preliminar).  
**Último commit de código/SQL validado:** `85a8c7ae447f6a53a027019a634832e6d6c365cd`.  
**GitHub Actions:** [Verificación ByteTorque 44341022910](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44341022910) — **SUCCESS** Web/iOS PWA y Android Expo.

## Resultado entregado

**CÓDIGO CANDIDATO PREPARADO, NO ACTIVADO EN SUPABASE NI RENDER.** Se conserva el recorrido existente CP03–CP06 y BT-FLOW-LIVE-01, sin reconstruir pantallas. Se prepara un registro durable, por taller y por revisión exacta:

1. **`public.bt_flow_quote_approvals`** — el empleado del taller registra que comprobó la autorización de una revisión CP05 específica e indica el medio y nota; **declaración de operador, no firma ni prueba verificada del cliente**.
2. **`public.bt_flow_execution_reports`** — todas las partidas de la cotización histórica se marcan expresamente `performed` / `not_performed` y se guarda explicación de pendientes. El servidor verifica la revisión inmutable, autorización previa y estado de OT; recalcula los montos netos, IVA 19 % y total desde las partidas congeladas, sin aceptar importes provistos por el cliente web. No se inventan reparaciones por inspección o por marcar la OT como cerrada.
3. **`public.bt_flow_visit_deliveries`** — constancia de entrega **declarada** por responsable del taller: exige reporte previo de ejecución, OT `ready`, cuatro comprobaciones explícitas, método y nota, sin afirmar firma digital, pago, lectura de email o entrega física corroborada independientemente.

Las tres tablas son **append-only** (triggers impiden UPDATE/DELETE), tienen clave compuesta con `workshop_id` y FKs con CP04/CP05; restringen registros duplicados por solicitud/visita/revisión.

## Seguridad de operación incorporada al candidato (sin auditoría general)

- **`docs/sql/BT_FLOW_LIVE_02_CANDIDATE.sql`**: RLS + FORCE, únicamente SELECT para usuarios autenticados autorizados del taller a través de la política CP05; no hay GRANT INSERT/UPDATE/DELETE de tablas públicas para el navegador. Escrituras invocan RPCs `bt_flow_record_quote_approval`, `bt_flow_record_execution`, `bt_flow_record_handover`: wrappers SECURITY INVOKER hacia funciones SECURITY DEFINER en un esquema no expuesto `bt_flow_live_private`, con identidad `auth.uid()`, membresía activa, taller activo, correo confirmado y rol propietario/administrador/recepción.
- **Puerta de servidor adicional:** `bt_flow_live_private.rollout` empieza sin talleres habilitados. **Cualquier escritura queda denegada incluso con una cuenta propietaria válida y aunque se instale la migración** hasta la aprobación explícita de una fila privada para un taller. Operadores no pueden consultar ni alterar esta tabla; el laboratorio comprueba denegación antes de habilitar una fila **exclusivamente sintética y efímera**. La ruta administrativa de activación se documentó y no se ejecutó sobre datos alojados.
- **Bandera de interfaz independiente:** `VITE_BT_FLOW_LIVE_02_ENABLED` ausente/`false` en producción. Su build ON exige Auth R1, CP05 privado y documentos CP05 habilitados. Los módulos `FlowLive02Panel` y `flowLiveCandidate` se excluyen del bundle público normal; CI valida ambos tipos de compilación.
- Operaciones idempotentes por `request_id`, misma revisión, nota, checklist y marca de ejecución. Un reintento incompatible no crea duplicación. Respuesta fuera de identidad, taller, importes o sesión falla cerrada. La UI elimina resultados tardíos tras cambio de cuenta/taller/revisión.
- Las pruebas focalizadas incluyen rol mecánico lectura sin escritura, taller B sin acceso a registros A, revocación, reintentos, autorización/revisión no vigentes, rechazos de importes y conexión posterior.

## Integración UI y archivos

- `src/entrega/flowLiveCandidate.ts`: cliente RPC inactivo por defecto, sin escrituras directas, con consulta `history()` de registros ya guardados bajo RLS; revalida sesión antes/después y resultados declarados por servidor.
- `src/entrega/FlowLive02Panel.tsx`: tres pasos explícitos y secuenciales, comprobación de estado en servidor antes de renderizar formularios y recuperación tras volver a abrir sesión. Cancelación de resultados obsoletos, bloqueo de operación concurrente, mensajes de confirmación únicamente tras respuesta válida. No envía emails.
- `src/cp05/FlowLive02Loader.tsx` y `src/cp05/QuotePanel.tsx`: carga dinámica sólo cuando el flag nuevo esté expresamente ON y exista CP05 privado con una revisión realmente emitida; de lo contrario el usuario conserva el informe técnico preliminar de `WorkExecutionDraft` sin cambios.
- `src/entrega/WorkExecutionDraft.tsx`: la revisión de partidas se reutiliza con callback de guardado **solo cuando se proporciona explícitamente el puerto privado**. PDF de BT-FLOW-LIVE-01 sigue siendo **BORRADOR INTERNO**.
- `src/entrega/execution.css`: estilos R2 responsive para aprobación, trabajo, checklist y entrega.
- `vite.config.ts`, `scripts/verify-official-bundle.mjs`, `.github/workflows/ci.yml`: protección de bundle y validación específica.
- `docs/BT_FLOW_LIVE_02_ACTIVATION_PLAN.md`: secuencia de respaldo/restauración, CP05 Storage+Edge, migración, interruptor backend, activación privada Render y pruebas físicas.

## Evidencia verificable

- [CI 44341022910](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44341022910) sobre commit `85a8c7ae` — **SUCCESS**. Ambos jobs Web/iOS PWA y Android React Native/Expo concluyeron aprobados.
- **Vitest Web 673/673**, **77/77 archivos**. `src/entrega/flowLiveCandidate.test.ts`: **10/10** (denegación por defecto, identidad, totales, sesión tardía, listado histórico, acceso cruzado, sin falsas confirmaciones). `src/entrega/executionPreview.test.tsx`: 14/14 heredadas.
- **PostgreSQL 17 aislado sin red**, precarga CP02/CP03/CP04/CP05 y SQL candidato, A/B, roles, aprobaciones, importes, idempotencia, histórico append-only, revocación, versión antigua bloqueada y guardado recuperable desde segunda conexión: `BT_FLOW_LIVE_02_LOCAL_FRESH_CONNECTION_PASS`. Se comprobó denegación por defecto en el interruptor privado del servidor.
- TypeScript Web/PWA, build público OFF, build privado CP03/04/05/06 y build privado LIVE-02 ON **sólo en CI**, validación de bundle/fixtures, Android Expo bundling/config/contratos: PASS. **No APK física ni prueba de iPhone Safari para esta función.**
- Durante la implementación hubo errores de prueba/código aislados (firma RPC, TypeScript de fixtures, terminador SQL `$$` en test). Se corrigieron y se reejecutó CI; **sólo el resultado final SUCCESS cuenta como aceptación del candidato**.
- No se realizó auditoría de seguridad alojada integral; está aplazada por decisión del usuario.

## No se ha activado ni cambiado

**No SQL ejecutado en Supabase alojado**: no existen allí las tres tablas nuevas ni el interruptor LIVE-02. No se crearon ni alteraron registros auténticos de taller, vehículos, clientes, cotizaciones, Auth, RLS hospedado ni roles.  
**No Render**: no se activó `VITE_BT_FLOW_LIVE_02_ENABLED` ni nuevos flags, sin deploy real, sin mails ni cambios DNS. CP05 Storage/Edge/emisión archivada y correo siguen OFF, lo que impide el uso verdadero de este flujo de emisión/ejecución/entrega.  
**No** aceptación digital verificable, fotografía de entrega, factura, pago, correo consolidado ni paquete PDF final certificado. El código prepara registros de declaraciones del operador, pero **no constituye evidencia independiente de firma o entrega**.

## Próximo bloque funcional

**Integración CP06-LIVE-02:** mostrar en el historial del vehículo (read-only, paginado, sin mezclar talleres ni revisiones) las declaraciones de aprobación, ejecución y entrega cuando el backend sea autorizado, sin sugerir que las marcas de ejecución o el estado `closed` acrediten reparaciones por sí solos. Preparar PDF final del informe y constancia con snapshots inmutables y definición de paquete documental triple de BT-COM-01, manteniendo correos externos bloqueados. En paralelo mantener el sistema listo para futura prueba física.

**Puertas reales pendientes:** desde PC personal crear y restaurar respaldo integral cifrado; autorizar y comprobar CP05 Storage/Edge; luego autorizar instalación aditiva SQL LIVE-02 y verificar interruptor server OFF; habilitar sólo taller QA de prueba con nueva aprobación; validar Safari iPhone/Android, permisos RLS hospedados, migraciones, PDF/cliente; finalmente adopción de Ignacio. **BT-PILOT-QA-04: A REPASAR** junto a la prueba de seguridad al final. Sólo `main`, diseño R2 y un checkpoint por cierre.
