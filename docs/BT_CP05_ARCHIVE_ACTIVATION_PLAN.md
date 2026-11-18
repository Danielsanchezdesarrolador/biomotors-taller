# ByteTorque — CP05: plan de activación del archivo privado

**Fecha:** 18/11/2026. **Estado:** candidato probado con almacenamiento simulado, NO instalado en el proyecto alojado. Este documento no autoriza una migración ni el envío de correos.

## Por qué es necesario
El PDF oficial de borrador R3 ya fue descargado y validado con los datos ficticios de QA1234, incluida la nueva partida Balatas. Eso NO significa que exista una revisión emitida. Una revisión emitida requiere **snapshot de datos inmutable + PDF inmutable + hash SHA-256 + bucket privado y reglas multitenant + confirmación del servidor**, antes de mostrar estado 'emitida'.

## Código existente y reforzado
- `server/cp05/issuanceCandidate.ts`: valida autenticación y versión, reserva una revisión, genera PDF desde snapshot congelado, archiva solo en privado y confirma metadatos antes de marcar emisión.
- `server/cp05/archiveCandidate.ts`: bucket fijo `cp05-quote-documents`, ruta UUID canónica `{taller}/quotes/{cotización}/rN/{sha256_snapshot}.pdf`, PDF válido de hasta 20 MB, solo creación sin sobrescritura (`upsert:false`), read-back con SHA-256. Si el archivo ya existe, acepta reintento únicamente si los bytes son idénticos; contenido diferente se rechaza. Restauración verifica además tamaño esperado cuando se proporciona.
- `server/cp05/supabasePortsCandidate.ts`: solo restaura una revisión autorizada por RLS para la cuenta y el taller elegidos; no acepta rutas de Storage elegidas por el navegador; compara ruta de revisión y checksum.
- `server/cp05/documentHandlerCandidate.ts`: requiere JWT confirmado y membresía activa; el rol mecánico puede descargar una revisión autorizada pero no emitir ni enviar; `Cache-Control: no-store`. El cliente no recibe la clave service_role.
- `docs/sql/BT_CP05_STORAGE_POLICY_CANDIDATE.sql`: exige bucket privado de PDF (máximo 20 MB) ya creado y RLS en `storage.objects`, luego añade política **RESTRICTIVE** para impedir SELECT/INSERT/UPDATE/DELETE directos por roles `anon` y `authenticated` en ese bucket. No afecta otros buckets.
- `src/cp05/archiveIntegrity.test.ts`: pruebas sintéticas de integridad, ausencia de sobreescritura, reintentos idempotentes, PDF inválido, archivo faltante/corrupto y bloqueo por flag.
- `docs/sql/BT_CP05_ARCHIVE_READINESS_READONLY.sql`: inspección **solo lectura** para distinguir ausencia de bucket/política frente a configuración compatible. Nunca imprime datos de cliente.

## Dependencias obligatorias antes de activar
1. **Respaldo integral verificable y restauración aislada:** base, usuarios/Auth, políticas/roles y Storage. El flujo GitHub de backup estaba limitado por la visibilidad pública temporal y la integración privada con Drive; no declarar completo el respaldo. Una prueba de PostgreSQL sintético NO sustituye la restauración del proyecto real.
2. **Autorización expresa del Director para Storage y SQL:** crear bucket `cp05-quote-documents` mediante el flujo oficial de Storage, privado, límite 20.000.000 bytes, MIME `application/pdf`, **sin sobrescritura, listados públicos ni URLs públicas**. Se debe comprobar que ninguna política previa abre ese bucket.
3. Con aprobación específica posterior, instalar la política candidata `BT_CP05_STORAGE_POLICY_CANDIDATE.sql` y verificar que roles `anon` y `authenticated` no puedan ni leer ni subir, aun cuando exista una política amplia previa. Service-role solo en backend confiable.
4. **QA con dos talleres y sesiones reales:** A no puede ver B, mecánico no puede emitir, cuenta sin membresía no lee, miembro revocado falla, reintento idéntico no duplica revisión, mismo nombre con otros bytes no sobrescribe, interrupción antes de finalizar deja pendiente y se reconcilia, edición posterior no cambia PDF emitido.
5. **Preparar/desplegar la función privada únicamente tras autorización:** `scripts/package-cp05-edge.mjs` ensambla un paquete offline, NO lo instala. El worker `bt-cp05-documents` requiere claves exclusivamente del servidor, origen permitido `https://bytetorque.cl`, `BT_CP05_ARCHIVE_ENABLED=true`, `BT_CP05_EMAIL_ENABLED=false`. Exigir pruebas de autorización y reconciliación antes de hacer accesible un botón de emisión. No activar el correo.
6. Activar `VITE_BT_CP05_DOCUMENTS_ENABLED=true` en el frontend **solo después** de aprobar todo lo anterior, comprobar la descarga del documento archivado en Android/iPhone y verificar el historial CP06.
7. Si alguna comprobación falla, **apagar el flag** y detener nuevas emisiones sin borrar los PDF o revisiones ya archivadas. No eliminar buckets ni registros como mecanismo de rollback.

## Estado alojado comprobado al iniciar esta tarea (18/11/2026)
2 talleres, 5 membresías, 1 cotización, 0 revisiones emitidas, 0 solicitudes de emisión pendientes y 0 buckets/políticas de archivo CP05. No se cambió esa configuración durante la implementación. La prueba del PDF de borrador aprobada por el Director es la del checkpoint `CHECKPOINT_BT_CP05_R3_DOCUMENTOS_REALES_QA_20261118.md`.

## Límites
- La inmutabilidad de PDFs debe acompañarse de políticas de retención de Storage y recuperación probada; `upsert:false` no protege por sí solo contra administradores de Storage ni garantiza durabilidad.
- Nunca generar enlaces públicos ni presentar borradores como emitidos; nunca enviar correos ni capturar pagos sin autorización.
- Mantener solamente `main`, conservar diseño R2 y las cotizaciones/usuarios existentes. Mientras el repositorio sea público temporalmente, no publicar secretos ni archivos privados.
