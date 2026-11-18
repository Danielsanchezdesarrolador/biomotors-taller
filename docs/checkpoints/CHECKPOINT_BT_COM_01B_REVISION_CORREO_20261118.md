# ByteTorque — CHECKPOINT BT-COM-01B · Revisión de correo consolidado candidato

**Fecha:** 18 de noviembre de 2026  
**Repositorio / única rama:** `Danielsanchezdesarrolador/biomotors-taller` — `main`  
**Punto de partida:** `aa7331825189f371eda422c3eba257af46c7f34f` (COM-01A + Render visual LIVE)  
**Commit final del código probado:** `dc8eb67651004251f580f0be56d4d7785459628f`  
**Documento de alcance:** `docs/BT_COM_01B_MAIL_REVIEW_CANDIDATE.md`  
**Estado:** candidato de backend y pruebas **TERMINADOS**, no conectado, no operativo, no desplegado. No habilitar envíos.

## Alcance implementado

Se incorporó **`server/com/closingMailReviewCandidate.ts`**, módulo confiable candidato, sin importaciones en frontend público y sin conexión a Edge ni proveedor de correo:

- **Vista previa no enviada**: carga autenticación confirmada, membresía y taller activos, rol propietario/admin/recepción, revisión y entrega vigentes, manifiesto inmutable de los tres PDF del cierre y confirmación de integridad/lectura privada declarada por el puerto del backend. El destinatario procede del servidor, nunca de una dirección arbitraria suministrada por navegador.
- **Tres archivos exactos**: validación de orden `quote/report/handover`, buckets privados previstos, rutas canónicas, tamaño, MIME y SHA-256. El PDF CP05 histórico no se altera. La vista previa incluye asunto, contenido de texto plano, destinatario y advertencia de que no se ha enviado ningún correo.
- **Huella de vista previa** SHA-256 sobre identidad de taller/OT/revisión/entrega, email y los tres documentos. No es firma ni credencial. Identifica cambios entre revisión visual y confirmación.
- **Confirmación humana**: exige marcar revisión del correo, tres documentos y naturaleza declarativa, coincidir exactamente con el destinatario original, reconstruir estado desde servidor y revalidar acceso antes de guardar.
- **Estado inequívoco**: `operator_reviewed_not_sent`. El puerto `recordReview` es contrato de persistencia idempotente **no conectado**; futura SQL deberá garantizar UNIQUE `(workshop_id, request_id)`, transacción y lectura/contraste de registro, sin edición ni envío.
- **Ningún método para enviar**: no hay endpoint, proveedor, MIME de correo, cola, claves, mailer, SMTP ni cambio de correo de CP05. La vista previa no implica entrega física acreditada, conformidad verificada del cliente, firma ni pago.

## Evidencia de validación

- **GitHub Actions [Verificación ByteTorque #44420380822](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44420380822)** — `SUCCESS` sobre commit `dc8eb676`: **707/707 pruebas Vitest, 81/81 archivos**; TypeScript y build Web/PWA público y privado, aislamiento del bundle, PostgreSQL 17 aislado y compilación Android Expo (**sin APK**).
- **GitHub Actions [Interfaz pública #44420380820](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44420380820)** — `SUCCESS` sobre el mismo commit. Comprueba regresión visual de pantallas existentes con datos simulados; WebKit Linux no equivale a Safari físico.
- **Nuevo archivo** `src/entrega/closingMailReviewCandidate.test.ts`: **13 casos** de gate OFF, revisión triple, permisos por identidad/taller/OT/revisión, destinatarios malformados, URLs/rutas falsas, cambios de hash, confirmaciones explícitas, idempotencia, revocación y texto plano sin inyección de encabezados.
- Los primeros jobs fallaron por estrechamiento TypeScript de correo `null`, import sin uso y un test de mayúsculas; se corrigió todo y **únicamente los workflows finales SUCCESS constituyen la evidencia válida**.

## Producción, restricciones y siguiente paso

**Render permanece solo con el pulido visual BT-UI-POLISH-01**: el código BT-COM-01B no fue desplegado, commits `[skip render]`. **Supabase alojado SIN cambios**: no instalar SQL/Storage/Edge ni crear permisos/destinatarios/consentimientos. No se usaron clientes auténticos ni se emitió/mandó un solo correo.

La construcción del cuerpo de correo con partidas/montos y observaciones desde un `PreparedClosing` revalidado, la pantalla R2 de previsualización, la tabla SQL de auditoría idempotente, verificación del consentimiento/contacto, cuotas/planes del servidor y el proveedor transaccional **siguen pendientes**. Los contratos candidatos sirven para preparar estos pasos, no para autorizar su instalación.

**Próxima etapa segura (si se continúa):** diseñar `BT-COM-01C` en código/SQL candidato aislado para registro transaccional y estados de envío, manteniendo correo OFF; o priorizar respaldo integral restaurable antes de aprobar la activación CP05 Storage/Edge + LIVE-02 y las pruebas físicas para Ignacio.

**BT-PILOT-QA-04: A REPASAR.** Sin nueva auditoría general, sin modificaciones de plan, MFA, roles reales, facturación ni rama adicional.
