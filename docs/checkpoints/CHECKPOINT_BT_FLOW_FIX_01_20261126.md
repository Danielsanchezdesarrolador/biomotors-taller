# BT-FLOW-FIX-01 — candidato local y revisión privada

26/11/2026 (Chile). Base LIVE: `f3f512f89b05fece5adb19bafbfc4bf2770e6153`. Rama main.
Autorización: implementación/validación local y transferencia privada a bytetorque-review/BT-FLOW-FIX-01 mediante DTK-ERR-056. Sin publicación oficial, deploy ni escrituras alojadas. Auto-Deploy y correo externo OFF; R2 pausado. SEC07 no reabierto.

## Entrega funcional

1. Inspección guiada reutiliza Cp04MultipuntoPdfPreview, cp04InspectionPdf y repository.pdfIdentity. A4 y 34 componentes originales, parcial con Sin revisar y bloqueo durante guardados pendientes. No cambia el generador ni los PDF históricos.
2. Textos operativos requeridos aceptan contenido recortado no vacío: motivo de ingreso/servicio, explicación de atención/cambio inmediato, revisión/anulación/cancelación y administración de registros, explicación de trabajos pendientes. Condiciones/comentarios, nota de aprobación, nota de entrega y observaciones ordinarias de Agenda admiten vacío. Se conservan máximos, identidad/búsqueda, importes, permisos, confirmaciones, métodos de aprobación, checklist y trazabilidad. No se inventan notas. Los lectores históricos aceptan tanto registros anteriores como nuevos textos breves.
3. Tras confirmar el expediente se conserva la atención abierta y se consultan sus tres originales privados. Pantalla Atención finalizada, acciones individuales Visualizar/Descargar y Volver al centro de operaciones. Se valida taller, cliente, vehículo, OT, cotización, revisión e integridad SHA-256. Una referencia fija incompatible se rechaza antes de leer/escribir. La consulta de OperationsCenter ya excluye expedientes confirmados; se conserva esa lógica. Los reintentos del archivo siguen siendo idempotentes, sin renderizar ni subir duplicados.

## Migración incremental candidata

`docs/sql/BT_FLOW_FIX_01_CANDIDATE.sql`: transacción con lock_timeout y precondiciones estrictas sobre las definiciones realmente instaladas consultadas exclusivamente en pg_proc/pg_constraint. Fixture de metadatos: `tests/fixtures/flowFixInstalled.json`; no contiene filas de clientes ni credenciales. Cualquier divergencia aborta antes de alterar funciones/CHECKs. No se ha aplicado en Supabase.

Ocho funciones privadas reemplazadas conservando firma, propietario, ACL, SECURITY DEFINER y search_path: bt_agenda_private.command; bt_cp05_private.prepare_issue_before_agenda, revise_quote, void_quote; bt_flow_live_private.approval, delivery, execution; bt_records_private.execute_record. El wrapper público de emisión y las autorizaciones existentes permanecen intactos.

Ocho CHECKs ajustados: bt_agenda_receipts_complaint_check, bt_flow_quote_approvals_note_check, bt_flow_visit_deliveries_handover_note_check, cp04_finding_resolution, quote_events_reason_check, quotes_void_reason_check, work_orders_cancel_reason_check y work_orders_complaint_check. No se crean tablas ni se cambian RLS, roles, buckets o grants. Las notas opcionales pierden solo su mínimo; los campos indispensables pasan a mínimo uno. Máximos conservados.

### Orden futuro de aplicación, sujeto a autorización independiente

1. Programar ventana piloto sin editores activos y verificar vigencia del respaldo/recuperación aprobados; esta entrega no realiza respaldos.
2. Empaquetar y desplegar las versiones compatibles de **bt-cp05-documents** y **bt-final-archive**, que comparten contratos/validadores modificados, antes de permitir datos cortos. Los paquetes locales se construyeron; no fueron desplegados. No cambiar flags ni activar correo.
3. Cotejar metadatos de producción y aplicar únicamente la migración incremental en una transacción. Si el guard detecta deriva, detenerse; no reutilizar a ciegas ni repetir migraciones antiguas.
4. Desplegar frontend compatible mediante autorización específica, forzar recarga de las sesiones piloto y comprobar con datos ficticios textos breves, PDF parcial y cierre de originales. Los clientes anteriores pueden rechazar datos breves nuevos: no mezclar sesiones antiguas durante la apertura.
5. Reanudar el piloto sin habilitar otros módulos, concurrencia de editores ni correo. No son necesarias variables, buckets o políticas nuevas.

### Reversión

`docs/sql/BT_FLOW_FIX_01_ROLLBACK_CANDIDATE.sql` restaura las ocho definiciones y los ocho CHECKs originales de forma atómica. Solo es utilizable si no existen datos incompatibles con los mínimos antiguos; en caso contrario falla y revierte toda la transacción. No rellenar, borrar ni alterar evidencia para forzarla. Mantener lectores/esquema compatibles y preparar una corrección autorizada si ya se guardaron textos breves. Revertir primero el frontend antiguo no es seguro con esos datos. No se modifican documentos históricos.

## Validación consolidada, exclusivamente local

- 6 pruebas unitarias nuevas: contratos requeridos/opcionales, máximos, lector histórico y modelo multipunto parcial/completo de 34 componentes.
- 21 comprobaciones PostgreSQL 17 en contenedor sin red/puertos: funciones y CHECKs instalados reproducidos, aplicación/reversión/deriva, OIDs/ACL/RLS conservados, textos breves y vacíos opcionales, confirmaciones/máximos/aislamiento, emisión y archivo de tres PDF ficticios, originales intactos e idempotencia sin regeneración/subida.
- 6 escenarios de navegador: multipunto parcial/completo A4 y mismos bytes en vista/descarga; bloqueo por guardado pendiente; cierre y tres originales a 1440 y 390 px; correspondencia OT/revisión y rechazo de fila incompatible. Sin conexiones alojadas. Capturas y PDF sintéticos en revisión privada.
- TypeScript y builds público/privado PASS. Empaquetadores oficiales CP05/final-archive PASS. Sin dependencias nuevas ni cambios del lockfile.
- Comandos: `npx vitest run src/guided/flowFix.test.ts`; `bash scripts/security/verify-flow-fix-local.sh`; `node scripts/verify-flow-fix-browser.cjs` con harness en loopback 47134 y Chromium local. Build privado con gates locales habilitados, sin archivos .env ni variables alojadas.

Las pruebas sintéticas no certifican aceptación visual humana ni QA productiva. La baja del catálogo activo conserva el filtro existente por manifiesto confirmado; no se ejecutaron suites anteriores ni QA alojada. Pendiente revisión privada, aprobación del candidato y autorizaciones específicas de SQL/Edge/frontend. Inventario exacto, diff binario, resultados y SHA-256 acompañan la transferencia privada.

## Integración oficial autorizada — 26/11/2026

Dirección Técnica revisó el candidato y el propietario autorizó exclusivamente la integración en main. Se incorporan 26 archivos no documentales idénticos por blob Git y cuatro documentos con notas de integración. Capturas, PDFs sintéticos, manifiesto y diff quedan privados. CI pendiente. Sin aplicación de SQL, deploy de Edge/frontend ni cambios en producción. Auto-Deploy OFF comprobado. Antes de activar: confirmar vigencia del respaldo, ausencia de editores y compatibilidad de Edge/SQL/frontend. La reversión candidata no detecta todos los datos incompatibles posibles (p. ej. condiciones vacías y notas de ejecución breves), por lo que queda prohibido ejecutarla automáticamente tras admitir datos nuevos; conservar lectores compatibles y corregir hacia adelante. Aceptación humana focalizada pendiente.
