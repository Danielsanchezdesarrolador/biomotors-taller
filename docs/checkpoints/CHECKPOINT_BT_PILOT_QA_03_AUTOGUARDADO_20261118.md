# ByteTorque — BT-PILOT-QA-03 · Continuidad y autoguardado CP04

**Fecha:** 18/11/2026 · **Rama única:** `main` · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`.

**Base:** BT-PILOT-QA-02, checkpoint commit `7f59575a70a33c877128f10ed2a2355a6e993d8a`.  
**Código comprobado:** `2dac798870b8ba95ae8372191773ec1d6d55758d`.  
**CI general:** [44319523573](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44319523573) — **SUCCESS** Web/iOS PWA y Android React Native/Expo.

## Propósito

Atender riesgos críticos del piloto de Ignacio **sin conectar servicios productivos**: interrupciones del autoguardado multipunto, respuestas atrasadas de escrituras después de un desmontaje de sesión, borradores que no se pueden recuperar por restricciones del navegador y mensajes de estado equivocados. Mantener el motor CP04 ya existente, su diseño R2, sus 34 componentes y controles de autorización del servidor como única fuente de verdad.

## Cambios

- `src/ordenes/cp04Autosave.ts`:
  - Se incorpora **generación/lifetime de ejecución**: `start` y `stop` invalidan respuestas anteriores. Una operación antigua no puede disparar `onSaved` ni marcar una X como confirmada después de finalizar su generación.
  - Durante una conciliación remota interrumpida, antes de crear o actualizar una observación, la cola **comprueba nuevamente** que sigue activa y pertenece a la misma generación. No inicia nuevas mutaciones al volver de una lectura después de `stop`.
  - `stop` transforma escrituras en vuelo a **queued**, marca los ID como **uncertain** para reconciliar el estado remoto antes de reintentarlos y **emite la fotografía actualizada**: no deja la vista en el estado incorrecto `saving`.
  - El proceso de recuperación reconcilia las observaciones del servidor antes de reenviar un intento ambiguo para evitar duplicar una escritura que ya se había confirmado de forma remota. No hay garantía de entrega exactly-once sin contrato/idempotencia del servidor.
  - El método `hasTemporaryRecovery` indica si la copia de sesión temporal pudo guardarse realmente. Un `sessionStorage` nulo/bloqueado/con error **no** se presenta como respaldo recuperable.
- `src/ordenes/Cp04MultipuntoChecklist.tsx`: nuevo aviso visible para cambios sin confirmar y **sin copia temporal disponible**; se distingue ese estado de un error de escritura con copia temporal posible. No se afirma éxito antes del acuse de servidor.
- `src/ordenes/cp04Autosave.test.ts`: **tres casos de regresión nuevos** para `sessionStorage` bloqueado, sesión que termina mientras el servidor procesa reconciliación, y escritura que devuelve una respuesta atrasada tras `stop/start` sin duplicar ni declarar éxito de la generación anterior. También se comprobó que un stop transforma correctamente el estado presentado en `queued`.

No se modificaron `src/flow/receptionDraft.ts`, `src/clientes/cp03PilotDirectoryView.tsx`, los contratos de SQL CP03/04, el catálogo de multipunto ni el formato de PDF. Sus pruebas existentes permanecen en la batería de regresión; **ninguna función nueva de guardado de recepción a servidor se activó**.

## Pruebas y estado real

- GitHub Actions [44319523573](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44319523573) **SUCCESS** en ambos jobs:
  - `npm test`: **643/643** pruebas, 75 archivos PASS, incluidas **9/9** del nuevo grupo `cp04Autosave.test.ts`.
  - TypeScript, build PWA, matrices BT-PILOT-QA-01/02, verificadores de marca y exclusión pública, contratos PostgreSQL locales PLAN04 y builds CP03–CP06 candidatos: PASS.
  - Android: TypeScript, export del bundle Expo (no APK), pruebas sintéticas de rutas/contratos y verificador de configuración: PASS.
- Hubo una primera ejecución con una expectativa incorrecta en una prueba (`saving` versus `queued`). Se corrigió además el `snapshot` de la cola para representar el estado real y el test fue actualizado. **No presentar la ejecución fallida previa como aprobada**.
- Las pruebas de red, lectura, error, recuperación y sesión usan dobles controlados y datos sintéticos. **No** prueban una restauración productiva, una escritura real ni el comportamiento de sesiones de Ignacio en dispositivos físicos.
- La verificación visual separada `BT-OFICIAL-01A` para el mismo SHA no estaba confirmada al cerrar esta descripción; consultar la ejecución por separado, sin declarar PASS mientras siga en curso.

## Estado de alojamiento / protección

- **Supabase alojado:** no se modificaron Auth, tablas, registros, migraciones, RLS, Storage, Edge, usuarios, permisos ni backups.
- **Render/bytetorque.cl:** sin activación de flags ni despliegue solicitado; commits funcionales con `[skip render]`.
- **Android:** sin cambios en APK/OTA, permisos nativos o cuentas; no se generó una APK firmada ni se instaló en dispositivo.
- **Documentos y suscripciones:** email, archivo privado CP05, pagos y concesión de plan Ignacio siguen pendientes de sus respectivas aprobaciones.
- **Respaldo:** sin backup integral ni restauración aislada comprobados en esta fase. Repositorio debe ponerse privado antes de exportaciones sensibles.
- **Privacidad:** no se consultaron ni manipularon datos personales reales de clientes. La advertencia de borrador no es una garantía de durabilidad y no reemplaza el respaldo del servidor.

## Siguiente bloque recomendado

**BT-PILOT-QA-04 — Integridad transaccional de recepción/OT y errores posteriores al guardado (offline):** revisar con pruebas de fallos sintéticos la distinción entre *mutación confirmada por servidor* y *error de recarga de ficha/listado*, manteniendo el ID de una OT ya creada y sin promover reintentos capaces de duplicarla. Continuar auditando el vínculo recepción/cliente/vehículo/OT y el paso CP03→CP04 antes de activaciones reales.

**Puerta obligatoria en PC personal:** privatizar repositorio antes de secretos/exportación, respaldo cifrado completo (BD, Auth, RLS y Storage) con verificación y **restauración aislada**; después autorización expresa y por etapa para SQL/Storage/Edge/roles y pruebas reales multitenant A/B. El piloto Ignacio permanece **NO APROBADO**; faltan QA físico Safari/Android, operación real de documentos y control de privacidad.

**Reglas:** solo `main`, no reconstrucción ni cambios de planes/pagos, preservar diseño R2 y documentos; checkpoint tras cada tarea con SHA, CI y estado real de los servicios.
