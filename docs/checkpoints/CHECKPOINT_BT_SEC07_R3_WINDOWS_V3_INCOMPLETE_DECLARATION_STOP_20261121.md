# CHECKPOINT 64 — BT-SEC07-R3-WINDOWS-V3-INCOMPLETE-DECLARATION-STOP

**Fecha:** 21/11/2026 (Chile) · **Rama:** `main` · **HEAD inicial:** `42f1cd399c602e87477957a46a1351f0b874fa54`.

## Evidencia reportada por propietario — V3 ejecutado en Windows

```text
BT_SEC07_PACKAGE_V3: VERIFIED
BT_SEC07_MANIFEST_TESTS: PASS_53_OF_53_SYNTHETIC
BT_SEC07_MANIFEST_WINDOWS_COMPATIBILITY: SIMULATED_NOT_CERTIFIED
BT_SEC07_MANIFEST_BACKUP_SELECTED: NO
BT_SEC07_MANIFEST_BACKUP_SELECTED: NO
BT_SEC07_MANIFEST_AUDIT: STOP_INCOMPLETE_BACKUP_DECLARED
BT_SEC07_MANIFEST_WINDOWS_V3: STOP
```

**Interpretación exacta:** el paquete V3 pasó la comprobación de hash y la batería de 53 tests sintéticos en el PC Windows del propietario. En el código fuente del ZIP V3 efectivamente entregado (SHA256 `07316406274f1b2662e5a5978fb039b6751ab35cd58acb6227b466667308b484`), `validate_manifest_data` valida en orden `project_ref`, `backup_id` y después exige `data.get('full_project_backup') is True`; si no, genera `STOP_INCOMPLETE_BACKUP_DECLARED`. Como el `audit()` lee y parsea `manifest.json` antes de esta validación, el STOP es compatible con un manifiesto elegido/parseado; **NO se completó validación de tamaños ni SHA de los dos ciphertexts**. No hubo GPG, SQL, restore ni red. Los mensajes `BACKUP_SELECTED: NO` se emiten al inicio del programa y por los tests; **NO demuestran que no se eligió el manifiesto**.

Este `STOP` no identifica corrupción del ciphertext ni una falla nueva del sistema Windows. **La bandera no informa respaldo integral y no debe cambiarse a true manualmente para ganar un PASS.** El exportador local original histórico declaraba intencionalmente `full_project_backup: false` porque su alcance excluía partes del proyecto (Auth config, Storage object bytes, Edge Functions desplegadas y secretos, etc.). No se leyeron los contenidos del `manifest.json` real ni backups reales desde el asistente: no afirmar su valor exacto ni su provenance sin esos bytes. No se conoce si backup del 19/11 incluye la base útil recuperable, ACL/owners o SQL de roles. `roles.catalog.json.gpg` es catálogo, no SQL roles.

## Próxima puerta propuesta (NO ejecutada)
Diseñar un verificador offline **separado de consistencia de ciphertext con manifiesto** que pueda reconocer `full_project_backup=false`/no true y reportar explícitamente `PARTIAL_BACKUP_DECLARED`, manteniendo STOP para afirmaciones de integralidad pero **permitiendo sólo comprobar tamaños y SHA de los archivos listados**, sin reinterpretar falsamente la integridad global. Mantener restricciones de path, whitelist, no seguir enlaces, cambios de metadatos, proyecto, backup_id, JSON y tamaño/hash. Exigir pruebas sintéticas + validación real Windows, sin descifrado ni SQL. Solicitar autorización explícita nueva antes de ejecutar V4 sobre respaldo real; no modificar manifiesto para adaptar V3.

## Pendientes SEC-07
R3 roles/owners/ACL/GRANTS/DEFAULT ACL, prueba de restore aislado, SSL enforcement OFF visual CP48 y backend TLS no certificado CP46, piloto pendiente. Todo esto queda abierto. No despliegue ni modificación de backup, DB, GPG, SSL ni producción en este checkpoint. Solo documentación GitHub `main` [skip render].