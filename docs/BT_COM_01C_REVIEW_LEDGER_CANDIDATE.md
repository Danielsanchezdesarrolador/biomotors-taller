# ByteTorque — BT-COM-01C · Registro transaccional y estados de correo (candidato OFF)

**Fecha:** 18/11/2026 · **Rama:** `main` · **Alcance:** diseño SQL privado y verificación local; **NO migración alojada, NO correo, NO Render**.

## Continuidad y propósito

Esta etapa extiende `BT-COM-01A` (manifiesto histórico de cotización CP05, informe y entrega) y `BT-COM-01B` (revisión humana del destinatario y documentos) con una base **preparada, no activada**, que registra exactamente qué operador revisó qué documentos históricos y permite representar eventos futuros del proveedor sin confundirlos con firma, pago, lectura o recepción física.

- `docs/sql/BT_COM_01C_REVIEW_LEDGER_CANDIDATE.sql`: candidato para PostgreSQL 17 aislado, **NO incluir en migraciones aplicadas**.
- `scripts/security/bt-com-01c-lab-assertions.sql` y `scripts/security/verify-flow-live-02-local.sh`: pruebas SQL sintéticas junto al laboratorio ya existente BT-FLOW-LIVE-02; el docker se ejecuta sin red.
- `server/com/closingDeliveryStateCandidate.ts`: proyección **pura, read-only**, sin API, puertos de correo, cambios SQL ni acceso público.
- `src/entrega/closingDeliveryStateCandidate.test.ts`: transición de estados simulados, rechazo de secuencias imposibles, tenant/revisión diferentes, identificadores falsos, respuesta incierta y rebote.

## Modelo privado diseñado

`bt_com_private` se crea en **laboratorio solamente**, con permisos denegados a `anon` y `authenticated`. El candidato contiene:

1. `rollout`: revisión desactivada por defecto por taller. `delivery_enabled` tiene una restricción que **impide ponerlo true en esta versión**; una etapa posterior requerirá migración separada y autorización explícita.
2. `closing_manifests`: snapshot privado e inmutable con referencias al taller, OT, cotización, revisión, aprobación declarada, ejecución declarada y entrega declarada; identidad y huellas de los tres PDF. El adaptador de archivo BT-COM-01A **todavía no está conectado** a esta tabla; los tests crean una fila sintética directamente como dueño del PostgreSQL efímero.
3. `mail_reviews`: historial privado de revisiones `operator_reviewed_not_sent`, con operador/recipient/huella de vista previa y huellas de los tres PDF; unicidad de `(workshop_id,request_id)`. No acepta UPDATE/DELETE. La función privada `bt_com_private.record_review` exige gate activo, backend `service_role`, rol propietario/admin/recepción confirmado en el mismo taller, revisión CP05 vigente, entrega asociada, destinatario idéntico al dato servidor del cliente, hashes/rutas/buckets coherentes y conflictos idempotentes rechazados. **No confirma que se mandó correo alguno.**
4. `mail_provider_events`: estructura reservada para eventos auditables futuros, pero **sin función de escritura, worker ni permisos de INSERT para la aplicación**. Estados diseñados:
   - `queued_not_sent`: futuro trabajo en cola, no enviado.
   - `provider_accepted`: proveedor confirmó recepción del envío, no implica llegada a bandeja ni lectura.
   - `provider_rejected`: rechazo confirmado del proveedor.
   - `ack_uncertain`: respuesta ambigua; bloqueo de reintento automático.
   - `bounced`: rebote informado por el proveedor.

Los registros históricos usan `ON DELETE RESTRICT`, claves compuestas por taller cuando corresponde, `RLS ENABLE+FORCE`, ausencia de permisos de escritura del navegador y triggers de inmutabilidad. No hay token SMTP, Resend, claves de Edge, envío, cola activada ni tabla pública que exponga datos personales.

**Limitación importante:** el fingerprint que COM-01B genera en código debe ser reconstruido y revalidado por un backend confiable; el candidato SQL solo comprueba su formato, referencias y documento histórico, no puede comprobar por sí solo que el operador vio la pantalla o que el correo fue entregado. De igual manera, el contrato de revisión `recordReview` de COM-01B y el SQL `record_review` **todavía no están conectados mediante un adaptador autorizado**. No deben presentarse como flujo operativo real.

## Verificaciones y activación futura

La prueba de laboratorio comprueba denegación del gate antes de habilitar un taller **sintético**, permisos cruzados A/B, usuario revocado, mecánico no autorizado, revisión anterior desactualizada, conservación tras abrir otra conexión, reintento idéntico y conflicto por misma solicitud con huella distinta; verifica que el ledger de eventos del proveedor permanece **vacío**. **GitHub Actions [Verificación ByteTorque #44424124792](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44424124792): SUCCESS** en commit `177e32af`: **717/717 pruebas Vitest, 82/82 archivos**, TypeScript y builds PWA pública/privada y Android Expo; el laboratorio PostgreSQL 17 pasó `BT_COM_01C_LOCAL_FRESH_CONNECTION_NO_MAIL_PASS` y `BT_FLOW_LIVE_02_LOCAL_FRESH_CONNECTION_PASS`. No se usaron datos alojados. [QA de interfaz #44424124729](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44424124729) pendiente al registrar el resultado técnico.

Para operar en los talleres reales faltan, **en orden seguro**: respaldo integral restaurable y verificado; revisión de migraciones y RLS reales; autorización expresa de CP05/BT-FLOW-LIVE-02 y manifiestos; ensayo del adaptador seguro con taller de prueba; consentimiento y verificación del canal del cliente; autorización de creación de cola y proveedor con idempotencia y reconciliación; y pruebas físicas iPhone/Android. No habilitar nunca correo automáticamente por cerrar una OT ni suponer conformidad del cliente.

**BT-PILOT-QA-04: A REPASAR**, junto con la revisión final de seguridad. Mantener `main`, estética R2 y Render productivo en su último despliegue visual aprobado, sin publicar estos módulos privados.
