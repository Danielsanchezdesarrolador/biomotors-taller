# ByteTorque — BT-COM-01B · Revisión previa del destinatario y paquete triple (candidato OFF)

**Fecha:** 18/11/2026 · **Rama única:** `main` · **Estado:** contrato backend + pruebas sintéticas; NO endpoint, NO UI de envío, NO mails, NO SQL ni Render nuevos.

## Objetivo y decisión de producto

Preparar un futuro correo único de cierre con tres archivos históricos (cotización CP05 original, informe de ejecución declarada y constancia de entrega declarada), **exclusivamente después de revisión humana**. La solicitud/aceptación de la cotización anterior a los trabajos queda fuera de este correo de cierre; jamás se deduce autorización del cliente por enviar un archivo.

La revisión actual **no acredita recepción, firma, pago, conformidad o reparación**; solo significa que el operador revisó la dirección y las referencias documentales. No significa envío, entrega por proveedor ni lectura.

## Implementación exclusivamente candidata

`server/com/closingMailReviewCandidate.ts` (sin importación desde React ni Edge implementada) define dos funciones bloqueadas si `policy.approved !== true`:

- `prepareClosingMailReviewCandidate`: autentica actor confirmado; obliga a que el backend confiable compruebe taller/membresía activos, rol propietario/administrador/recepción, OT, revisión vigente, entrega registrada, los **tres PDF privados releídos y comprobados por SHA-256** y un destinatario tomado de los datos autenticados del servidor. Valida el manifiesto `BT-COM-01A`, orden, nombres, rutas privadas, hashes, tamaño y MIME. Produce **solo un objeto de vista previa**, con dirección, asunto, cuerpo `text/plain` y las tres huellas. No genera MIME, adjuntos, SMTP ni solicita al proveedor.
- `confirmClosingMailReviewCandidate`: exige que el operador confirme expresamente destinatario exacto, los tres PDF y naturaleza declarativa; **vuelve a autenticar, reconstruir y validar** lo anterior, compara huella de vista previa para rechazar revisiones, destinatario o documentos cambiados y revalida permiso antes de llamar al puerto `recordReview`. Este puerto es una **interfaz no conectada** para futura escritura transaccional e inmutable; el resultado solo puede tener `state: operator_reviewed_not_sent`.

**La huella SHA-256 de vista previa NO es token de acceso ni firma electrónica**; sirve para detectar una pantalla obsoleta cuando cambian los documentos o el destinatario. No se confía en nombres, emails o PDFs aportados desde el navegador. El texto evita inyección de encabezados por saltos de línea en nombres; el destinatario debe venir del servidor y el operador debe revisar su exactitud.

La idempotencia futura del puerto `recordReview` será por `(workshop_id,request_id)`, con lectura y comparación exacta en una transacción que rechace reintentos diferentes. La prueba de mocks **no demuestra** persistencia alojada ni exclusión de carreras en PostgreSQL real. Antes de cualquier envío futuro se requerirá nuevo chequeo de sesión, RLS, plan, consentimiento, vigencia del expediente y lectura/hash de PDFs privados.

## Pruebas sintéticas

`src/entrega/closingMailReviewCandidate.test.ts` cubre: OFF sin IO, 3 referencias correctas, aislamiento de taller/OT/revisión/entrega, UUID inválidos, roles/membresía, PDFs no comprobados, revisión obsoleta, destinatarios ausentes/malformados, paths y hashes, confirmaciones incompletas, confirmación idempotente, revocación entre consulta y registro, reutilización de token con email o PDF distintos, y texto de cabecera con saltos de línea.

No se usaron datos reales del taller de Ignacio ni servicios de correo. **GitHub Actions — código `dc8eb676`:** [verificación Web/PWA y Android Expo #44420380822](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44420380822) **SUCCESS**, 707/707 Vitest en 81 archivos. [QA de interfaz pública #44420380820](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44420380820) **SUCCESS** en revisión WebKit Linux y navegadores simulados (no dispositivos físicos). Los primeros commits detectaron errores de TypeScript y una aserción demasiado sensible a mayúsculas; ambos fueron corregidos.

## Dependencias reales bloqueadas

1. Respaldo integral de Supabase, Auth, Storage y permisos, más restauración verificada.
2. Activaciones autorizadas CP05 archivo/Edge y BT-FLOW-LIVE-02 SQL, políticas de taller y etapa documental BT-COM-01A; ninguna fue autorizada por esta etapa.
3. Diseño e instalación aprobados de tabla de revisión de correo RLS+FORCE, transacción idempotente, auditoría y retención; hay que definir consentimiento, canal de contacto y verificación de la dirección; **no se asigna aquí un plan comercial arbitrario**.
4. Solo tras lo anterior, una interfaz de revisión humana en CP06/entrega y un servicio de envío transaccional con deduplicación real, identificadores de proveedor, estados `pendiente/confirmado/fallido` basados en eventos y protección antispam. La política de correo seguirá **OFF** hasta autorización.
5. Pruebas A/B con actores y talleres reales controlados, Safari iPhone/Android, permisos revocados, documentos cambiados y proveedor ambiguo. `BT-PILOT-QA-04` permanece **A REPASAR** junto con seguridad final.

**Invariantes:** no cambios a SQL/Supabase/Render/Auth/RLS/plans/pagos ni envío de correos. Código y pruebas únicamente en `main`, commits `[skip render]`, sin nueva instalación y sin reconstruir CP03–CP06.
