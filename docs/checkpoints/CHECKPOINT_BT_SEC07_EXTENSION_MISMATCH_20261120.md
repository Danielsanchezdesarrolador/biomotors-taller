# CHECKPOINT — BT-SEC07-EXTENSION-MISMATCH-20 | 20/11/2026

**Rama:** `main` · **Estado:** primer diagnóstico confiable de inventario de extensiones completado por el propietario. Recuperación íntegra NO CERTIFICADA. **Google Drive excluido**.

## Evidencia exacta Windows (datos seguros)

```text
BT_SEC07_V2_PREFLIGHT: VERIFIED
Ran 19 tests in 0.089s
OK
BT_SEC07_V2_TESTS: OK
BT_SEC07_EXISTING_SNAPSHOT: INTEGRITY_VERIFIED_NO_CHANGES
BT_SEC07_LOCAL_PG17: VERIFIED
BT_SEC07_ARCHIVE_TOC: PARSED_NO_SQL_EXECUTION
BT_SEC07_ARCHIVE_EXTENSION_COUNT: 4
BT_SEC07_ARCHIVE_EXTENSION_UNRECOGNIZED_COUNT: 0
BT_SEC07_LOCAL_EXTENSION_CONTROL_COUNT: 45
BT_SEC07_EXTENSIONS_ABSENT_LOCALLY: 1
BT_SEC07_EXTENSIONS_PUBLIC_NAMES_ABSENT: NONE
BT_SEC07_EXTENSIONS_NONPUBLIC_COUNT_ABSENT: 1
BT_SEC07_EXTENSION_MISMATCH: DETECTED
BT_SEC07_BACKUP_AND_MANIFEST: UNCHANGED
BT_SEC07_FULL_RECOVERY: NOT_CERTIFIED
DIAG_EXIT_CODE: 0
BT_SEC07_GPG_CONFIGURATION: RESTORED
```

**Interpretación:** el ZIP V2 con SHA `15d9def921e3ceb0f8721ca3a2b1f964c47916e2b8e898623ff8261822acbdc6` fue ejecutado en Windows, sus 19/19 tests aprobaron, y **el TOC del snapshot cifrado actual fue leído en Docker PostgreSQL 17 SIN ejecutar SQL**. Se identificaron **cuatro extensiones en el respaldo**, todas parseadas correctamente; **una no tiene archivo .control** en la imagen PG17 genérica. El software no imprimió su nombre porque no figura en `PUBLIC_ALLOWLIST`; esa categoría NO significa necesariamente que sea propietaria, privada o maliciosa. Esta comparación de catálogos es consistente con la clase previa de error `EXTENSION_UNAVAILABLE` de pg_restore, pero **no demuestra que el único bloqueo sea ese** ni que un .control disponible equivalga a extensión funcional. `DIAG_EXIT_CODE=0` equivale al inventario completado, NO a restore aprobado.

**Estado del snapshot:** archivo GPG intacto, manifiesto intacto, GNUPGHOME restaurado, no hubo nuevas conexiones a Supabase, backup, restauración, ni cambios a Docker/producción. El `manifest.restoration_verified=false` sigue correcto. SQL roles y cobertura Auth/Storage/Edge pendientes.

## Comparación candidata con imagen Supabase Postgres oficial (PREPARADA, NO EJECUTADA)

- Referencias oficiales: https://hub.docker.com/r/supabase/postgres/tags (existe etiqueta `17.12.0.002`); https://supabase.com/docs/guides/self-hosting/restore-from-platform (requiere extensiones compatibles); https://supabase.com/docs/guides/self-hosting/custom-postgres-extensions (versiones/build de extensiones).
- **ZIP privado solo de conversación:** `BT_SEC07_SUPABASE_IMAGE_COMPARE_20261120.zip`, **5.085 bytes**, SHA256 `0440ad7e1323d91a8f2f531ad595b04317ee1f1dcb743d01bbb36b449a53f540`. Contiene `BT_SEC07_Compare_Supabase_Image_Offline.py`, `test_BT_SEC07_Compare_Supabase_Image_Offline.py` y LEEME. Código de comparación **15/15 pruebas sintéticas PASS**, ZIP testzip OK y 15/15 PASS tras extracción limpia. No probado contra backup real ni Docker del usuario.
- El script reutiliza V2 conocido en Windows `$HOME\BT-SEC07-EXTENSION-INVENTORY-V2\BT_SEC07_Extension_Inventory_Offline_V2.py` con SHA256 `c28be30c623468e1501fcec792b87e211f6f09e07acfffdb41574a7b94367625`. Revalida la integridad del mismo backup GPG y su TOC, comprueba Docker Linux/local, inspecciona contenedor local `supabase/postgres:17.12.0.002` sin iniciar servidor (`docker run --network none --pull=never --read-only --cap-drop=ALL --security-opt=no-new-privileges --entrypoint postgres --version`) y enumera .control mediante `pg_config --sharedir`. Compara solo conteos, sin imprimir nombres, SQL, contraseñas, paths ni PII. **Nunca descarga automáticamente**.
- Si la imagen no existe, el bloque PowerShell propuesto pide al propietario escribir literalmente AUTORIZO antes de `docker pull supabase/postgres:17.12.0.002`; **sólo descarga una imagen local desde Docker Hub**, con consumo de disco y red, sin acceso a Supabase, sin restauración, sin cifrar/descifrar en red. El usuario puede cancelar. No iniciar containers con sockets Docker o rutas host montadas.
- **Advertencia:** incluso si da `ALL_REQUIRED_CONTROL_FILES_PRESENT`, faltará verificar versión de extensión, capacidad de `CREATE EXTENSION`, migración SQL, grants/RLS, Auth/Storage, recuentos y paridad. No marcar recuperación certificada.

## Próxima puerta

1. Propietario descarga/inspecciona ZIP, verifica SHA, decide si autoriza pull de imagen candidata, ejecuta comparación una sola vez, y entrega únicamente `BT_SEC07_*` / `DIAG_EXIT_CODE`.
2. Si `SUPABASE_PG17_ABSENT=0`, diseñar un restore aislado del mismo archivo en ambiente compatible **con autorización distinta** y registro de fallas, sin omitir SQL/objetos para un falso PASS.
3. Si `SUPABASE_PG17_ABSENT>0` o catálogo ilegible, identificar extensión restante **localmente con consentimiento y custodia de nombre**, evaluar imagen/custom extension sin compartir TOC/SQL; no hacer pulls al azar ni reexportar.
4. Después, roles SQL y cobertura de plataforma, más copia externa no-Drive y pruebas A/B de tenants.

**Cierre actual:** inventario R1 completado; recuperación R2 abierta; `BT-PILOT-QA-04 A REPASAR`. Commit exclusivamente documental `[skip render]`, sin backend/Render/Docker/GPG/backup modificados.
