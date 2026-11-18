# ByteTorque — Checkpoint BT-COM-01C · Ledger privado de revisión y eventos (sin correo)

**Fecha:** 18 de noviembre de 2026  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Única rama:** `main`  
**Base aprobada:** `eaa4e00ae74e8dae6c563d819e9dc052f249687a` (BT-COM-01B, 707 tests).  
**Último commit de código/SQL/laboratorio probado:** `177e32afcbd3e62d55bf50ae1318d1df47898d87`.  
**Estado:** CANDIDATO TERMINADO Y VALIDADO EN LABORATORIO; NO INSTALADO NI OPERATIVO EN SUPABASE/RENDER.

## Implementación entregada

- `docs/sql/BT_COM_01C_REVIEW_LEDGER_CANDIDATE.sql`: nuevo esquema **privado** `bt_com_private`, aislado de API pública y con `RLS ENABLE + FORCE`. Incluye `rollout` (revisión apagada por defecto, gate de entrega bloqueado por restricción), `closing_manifests` (tres PDFs históricos), `mail_reviews` (únicamente `operator_reviewed_not_sent`) y `mail_provider_events` (**tabla estructural sin derechos de escritura ni función de proveedor**).
- `bt_com_private.record_review` es una **función candidata no conectada** con EXECUTE solo para `service_role`. Opera en una transacción PostgreSQL, comprueba la habilitación privada del taller, identidad de operador confirmada, membresía activa y rol dueño/admin/recepción, revisión CP05 vigente, entrega y reporte vinculados, destinatario exacto desde el cliente del taller y hashes/archivos del manifiesto; usa unicidad por `(workshop_id,request_id)` e idempotencia sin sobrescribir una revisión previa. El fingerprint proviene de COM-01B y tiene que ser recalculado desde fuentes servidor por el adaptador futuro; **no es firma ni autenticación por sí solo**.
- `server/com/closingDeliveryStateCandidate.ts`: proyección read-only de estados futuros `operator_reviewed_not_sent`, `queued_not_sent`, `provider_accepted`, `provider_rejected`, `ack_uncertain` y `bounced`. Rechaza historiales cruzados o incoherentes, bloquea reintentos automáticos ante ack incierto y jamás atribuye entrega, lectura, conformidad, firma o pago.
- `src/entrega/closingDeliveryStateCandidate.test.ts`: pruebas sintéticas de estados/no falsas confirmaciones/aislamiento.
- `scripts/security/bt-com-01c-lab-assertions.sql` + extensión de `scripts/security/verify-flow-live-02-local.sh`: pruebas reales en **PostgreSQL 17 Docker sin red**, utilizando usuarios/OT/cliente/revisiones/handover totalmente sintéticos. Se comprueba bloqueo inicial, lectura privada, acceso A/B, rol mecánico, revisiones obsoletas, direcciones y hashes, idempotencia, prohibición de UPDATE/DELETE y restauración desde una conexión separada **sin crear eventos de correo**.
- `docs/BT_COM_01C_REVIEW_LEDGER_CANDIDATE.md` y `roadmap.md` actualizados. No hubo modificaciones de componentes R2 ni frontend de producción.

## Resultados

- **[GitHub Actions #44424124792 — Verificación ByteTorque](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44424124792): SUCCESS**, commit `177e32af`. Web/iOS PWA y Android Expo **PASS**, **717/717 Vitest en 82 archivos**, TypeScript, PWA pública/privada y PostgreSQL 17 aislado.
- Laboratorio: `BT_FLOW_LIVE_02_LOCAL_FRESH_CONNECTION_PASS` y `BT_COM_01C_LOCAL_FRESH_CONNECTION_NO_MAIL_PASS`.
- **[GitHub Actions #44424124729 — QA de interfaz existente](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44424124729):** en curso al documentar. Es regresión de UI existente; no hay interfaz de correo activada en esta etapa.
- Las pruebas negativas iniciales identificaron un error de continuación de Bash y una aserción sobre UPDATE de tabla vacía (el trigger por fila no se ejecuta sin filas); se corrigieron. Únicamente el workflow final SUCCESS se considera aprobación del candidato.

## Puertas que permanecen cerradas

**Render:** la versión live sigue en commit visual `d8d6ed99`; no se publicó SQL ni módulo COM-01C. **Supabase:** no se ejecutaron migraciones, ni se crearon tablas/buckets nuevos, funciones Edge, destinatarios, correos ni credenciales. **Correo:** no existe envío, cola operativa, proveedor ni confirmación de entrega; `mail_provider_events` quedó vacío en laboratorio. **Datos reales:** no se utilizó información del taller de Ignacio. **Seguridad:** no se adelantó la auditoría general.

## Próximo paso

El piloto necesita como condición previa un **respaldo integral recuperable con restauración comprobada** y autorizaciones explícitas de CP05/BT-FLOW-LIVE-02, manifiesto COM-01A, COM-01B/01C y privado Storage/Edge. Solo después podrá implementarse el adaptador transaccional y la UX de revisión y correo real con consentimiento y permisos de plan verificables, bajo rollout por taller y pruebas físicas Safari/Android. No habilitar `delivery_enabled` por instalar este candidato.

**BT-PILOT-QA-04 sigue «A REPASAR»** y el sistema no se declara listo para operación real por este checkpoint.
