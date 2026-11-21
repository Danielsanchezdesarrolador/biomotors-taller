# CHECKPOINT 67 — BT-SEC07-R3-MANIFEST-V4-WINDOWS-CIPHERTEXT-PASS

**Fecha:** 21/11/2026 (Chile) · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama exclusiva:** `main` · **HEAD previo:** `48f2850aad9f39c47795edd9fec2528a58af46ac`.

## 1. Evidencia del propietario — ejecución Windows V4 sobre backup local del 19/11

```text
BT_SEC07_PACKAGE_V4: VERIFIED
BT_SEC07_MANIFEST_TESTS: PASS_69_OF_69_SYNTHETIC
BT_SEC07_MANIFEST_WINDOWS_COMPATIBILITY: SIMULATED_NOT_CERTIFIED
BT_SEC07_MANIFEST_BACKUP_SELECTED: NO
BT_SEC07_MANIFEST_BACKUP_SELECTED: NO
BT_SEC07_MANIFEST_BACKUP_SELECTED: YES
BT_SEC07_MANIFEST_SCOPE: PARTIAL_BACKUP_DECLARED
BT_SEC07_MANIFEST_PROJECT: MATCHED_LOCAL_EXPORTER_REFERENCE
BT_SEC07_MANIFEST_BACKUP_ID: MATCHES_FOLDER
BT_SEC07_MANIFEST_CIPHERTEXT_SIZES: MATCH
BT_SEC07_MANIFEST_CIPHERTEXT_SHA256: MATCH_MANIFEST_ONLY
BT_SEC07_MANIFEST_INDEPENDENT_AUTHENTICITY: NOT_CERTIFIED
BT_SEC07_MANIFEST_FULL_RECOVERABILITY: NOT_CERTIFIED
BT_SEC07_MANIFEST_AUDIT: PASS_LOCAL_CIPHERTEXT_CONSISTENCY_ONLY
BT_SEC07_MANIFEST_WINDOWS_V4: PASS_CIPHERTEXT_ONLY_NOT_RESTORE
```

## 2. Resultado alcanzado
- **Verificador V4 autenticado por SHA del ZIP** según el lanzador en Windows; 69/69 pruebas sintéticas reportadas PASS. La etiqueta `SIMULATED_NOT_CERTIFIED` describe el control de compatibilidad Windows simulado en tests, no invalida la **ejecución efectiva del cotejo local** observada.
- Se confirmó que se seleccionó un manifiesto (`BACKUP_SELECTED: YES`) y que el `project_ref` es consistente con la referencia **local del exportador**, no con una atestación independiente del servidor.
- Se validó la coincidencia `backup_id` / nombre de carpeta, los tamaños y las huellas SHA-256 **de los archivos cifrados listados** frente a ese mismo manifiesto.
- El manifiesto declara `PARTIAL_BACKUP_DECLARED`, por lo que **NO es un respaldo integral del proyecto**; aun con coincidencia SHA no certifica autenticidad independiente, posibilidad de descifrado, contenido del dump PostgreSQL, integridad de tablas, RLS, owners/ACL/GRANTS/DEFAULT ACL ni restauración.
- `roles.catalog.json.gpg` es **inventario/metadatos**, no un dump SQL de roles. El histórico `roles.sql.gpg` SQL0 sigue sin rehabilitarse. La prueba de restauración aislada permanece pendiente.
- No se enviaron ni abrieron por el asistente manifest ni ciphertexts, contraseñas o material GPG. Sin acceso nuevo a Supabase, SQL, GPG, SSL, Render o aplicación. Respaldo local no modificado por el asistente.

## 3. Siguientes puertas, separadas y bajo autorización nueva
**Etapa A (opcional, sin descifrar):** contraste de huella del `manifest.json` contra una referencia independiente y preservada, si existe. El PASS actual sólo tiene confianza interna del mismo conjunto de ficheros.
**Etapa B (con consentimiento expreso y plan de manejo de secretos):** validación GPG/descifrado en aislamiento local, sin exponer claves ni SQL al chat. Después verificar formato TOC del dump mediante `pg_restore --list` en aislamiento, sin hacer restore ni conectar producción, con puerta de autorización propia.
**Etapa C (nuevo consentimiento independiente):** restauración controlada en base de pruebas aislada, comprobar roles/owners/ACL/grants y capacidad de recuperación sin afectar producción. Diseñar cobertura de los elementos que el manifiesto parcial excluye.
**Etapa D:** evaluar SSL enforcement: CP48 OFF visual, CP46 cliente→pooler TLS verify-full PASS/backend SSL REPORTED_NO, end-to-end NO certificado. No tocar SSL hasta pruebas de compatibilidad/continuidad y autorización de reinicio.

**Estado R3:** `LOCAL_CIPHERTEXT_CONSISTENCY_PASS / PARTIAL_DECLARED / RECOVERABILITY_NOT_CERTIFIED`. No afirmar seguridad total ni producción lista. No repetir V4 sin necesidad. El propietario exige siempre ejecutores PowerShell directamente y completos en chat (CP66).

## 4. Control del cambio
Checkpoint y encabezados de AGENTS.md, agent.md, roadmap.md actualizados exclusivamente en `main`; documentación `[skip render]`, sin despliegues ni cambios en software, base de datos, seguridad o archivos del usuario.