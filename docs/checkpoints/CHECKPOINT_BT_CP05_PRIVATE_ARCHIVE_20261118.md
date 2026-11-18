# CHECKPOINT — ByteTorque CP05 · Archivo privado e inmutable (18/11/2026)

**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` (público temporal por decisión del titular); **rama única:** `main`. **Render:** servicio `srv-dbqe4quc6qcc73f275jg`. **Supabase:** proyecto `suxcqqnmcjoezfxltoms`.

## Trabajo completado hoy

**Meta:** preparar para CP05 el almacenamiento seguro de PDFs de revisiones emitidas **sin modificar la base alojada ni permitir emisiones reales todavía**. Reutilizar el flujo candidato de `issueQuoteCandidate`, snapshot inmutable, SHA-256, almacenamiento privado y verificación de RLS.

### Código implementado

1. Commit `a120f4f361f2e8e4a4785c91f100279d23c8ba04`: archivador servidor en `server/cp05/archiveCandidate.ts` endurecido. Valida ruta canónica de taller/cotización/revisión/hash, tipo y tamaño PDF máximo 20.000.000 bytes, `upsert:false`, byte count y SHA-256 de lectura posterior. Reintentos con contenido idéntico son idempotentes; bytes diferentes no se sobrescriben; restauración verifica hash y tamaño esperado. `server/cp05/issuanceCandidate.ts` valida el PDF antes de archivar y `server/cp05/supabasePortsCandidate.ts` pasa también el tamaño de la revisión para verificar su recuperación. Todo sigue **backend candidato OFF**.
2. Commit `537071fed6fbd4ce0142a82ddf378f052110eb27`: corrige reconocimiento literal del encabezado PDF.
3. Commit `d70fad08f89b30b789e87fd4671d49b87903c974`: actualiza expectativa de prueba antigua; archivos no PDF se rechazan como `INVALID_PDF` **antes** de intentar resolver un conflicto de Storage. Pruebas nuevas en `src/cp05/archiveIntegrity.test.ts` cubren archivos inválidos, rutas ajenas/malformadas, flag OFF, byte read-back, reintentos idénticos, conflictos, objetos inexistentes, corrupción y SHA/tamaño equivocados.
4. Commit `5140210459c9733a54484e69b9417cdf12ec8c87`: guía de activación `docs/BT_CP05_ARCHIVE_ACTIVATION_PLAN.md` y comprobación SQL **solo lectura** `docs/sql/BT_CP05_ARCHIVE_READINESS_READONLY.sql`. No se incorporaron secretos, PDFs ni datos privados al repo público.

### Verificaciones técnicas

- GitHub Actions `44306035391` sobre `d70fad08`: **SUCCESS**, Web/iOS PWA **SUCCESS**, Android Expo **SUCCESS**. Se validó TypeScript, Vitest y compilación según workflow. Tras endurecer el rechazo de PDF inválido, CI añadió un error esperado de test heredado que se corrigió antes de lograr esta ronda verde.
- GitHub Actions `44306035330` visual: **en curso** a la última consulta, NO marcar PASS sin verificar su conclusión.
- Consulta SQL de solo lectura ejecutada en el Supabase real usando el script del repo: `existing_workshops=2`, `archived_revisions=0`, `pending_issuance_requests=0`, `private_archive_bucket_count=0`, `private_bucket_contract_ok=false`, `backend_only_policy_count=0`, `storage_rls_enabled=true`, `archive_object_metadata_rows=0`.
- **No hubo ninguna escritura en Supabase.** Una cotización QA permanecía guardada según el inicio de tarea; no se emitió ninguna revisión ni se subió nada a Storage.
- Render continúa LIVE en el despliegue anterior `dep-dbupkl2vcj2c7393dt7g` (`858f76e`), porque los commits de archivo fueron **[skip render]**. No hay endpoint de archivo desplegado; no se cambió el sitio para clientes.

### Estado de autorización y dependencias

- **No crear bucket, ni instalar SQL, ni desplegar Edge Functions, ni activar email** sin consentimiento nuevo y concreto del Director. El script ya existente `docs/sql/BT_CP05_STORAGE_POLICY_CANDIDATE.sql` exige de forma expresa un bucket privado aprobado y todavía NO está instalado.
- El respaldo integral y recuperación aislada de Auth, datos, roles y Storage está pendiente. **No** trabajar con datos reales de Ignacio hasta demostrar restauración.
- `VITE_BT_CP05_DOCUMENTS_ENABLED` y `BT_CP05_ARCHIVE_ENABLED` se mantienen OFF / no activados; `VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED` OFF. 04B/04C y el bucket Plus/Full siguen con migraciones candidatas NO instaladas.
- La subida de plantillas PDF propias Plus/Full y los correos permanecen pendientes. El PDF predeterminado R3 ya fue validado en borrador por el titular en archivos A4 de 3 y 4 partidas.

## Siguiente paso exacto para retomar

1. Comprobar resultado de la verificación visual `44306035330` y la última cabecera `main`.
2. Priorizar **respaldo integral verificable y ensayo de restauración**; si el repo sigue público, respetar el bloqueo de exportación de secretos/backups configurado.
3. Una vez resuelto el respaldo y con **autorización expresa** de CP05 Storage, crear bucket privado con límites exactos, instalar `BT_CP05_STORAGE_POLICY_CANDIDATE.sql`, hacer pruebas RLS real anon/usuario A/usuario B/mecánico/revocación, confirmación de escritura/descarga e integridad.
4. Solo entonces autorizar despliegue controlado del servidor `bt-cp05-documents` con email OFF y activar el botón de emisión/archivo. Confirmar inmutabilidad al modificar después la cotización, recuperación desde CP06, Android/iPhone y reversión segura del flag. La revisión emitida no debe duplicarse ni alterarse.
5. Al cerrar cada tarea, generar un checkpoint con SHAs, pruebas, flags y migraciones reales.

**Definición precisa del avance:** código candidato reforzado y probado por CI; **archivo privado alojado NO implementado/activado**, por falta de bucket, respaldo y autorización.
