# CHECKPOINT — BT-SEC07-SUPABASE-IMAGE-MATCH-21 · Imagen Supabase PG17 compatible a nivel de catálogo, ensayo aislado preparado

**Fecha:** 20/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama:** `main`
**Estado:** COMPARACIÓN COMPLETADA REALMENTE POR EL PROPIETARIO; RESTAURACIÓN INTEGRAL NO CERTIFICADA. Google Drive EXCLUIDO.

## 1. Evidencia real reportada por el propietario (Windows y Docker Linux local)

```text
BT_SEC07_IMAGE: DOWNLOAD_REQUIRED
Usuario autorizó expresamente: AUTORIZO
Docker pull: supabase/postgres:17.12.0.002
Digest: sha256:0b64586fb84124b9070525a6528616594a1aa84a75d84cd4c3d43acc8de3ba92
BT_SEC07_IMAGE: LOCALLY_AVAILABLE
Ran 15 tests ... OK
BT_SEC07_COMPARE_TESTS: OK
BT_SEC07_EXISTING_CIPHERTEXT: HASH_VERIFIED_UNCHANGED
BT_SEC07_LOCAL_DOCKER_PG17: VERIFIED
BT_SEC07_SUPABASE_PG17_IMAGE: LOCALLY_VERIFIED
BT_SEC07_ARCHIVE_EXTENSION_COUNT: 4
BT_SEC07_LOCAL_STANDARD_PG17_ABSENT: 1
BT_SEC07_SUPABASE_PG17_CONTROL_COUNT: 78
BT_SEC07_SUPABASE_PG17_ABSENT: 0
BT_SEC07_SUPABASE_PG17_CATALOG_MATCH: ALL_REQUIRED_CONTROL_FILES_PRESENT
BT_SEC07_CIPHERTEXT_AND_MANIFEST: UNCHANGED
BT_SEC07_RECOVERY_CERTIFICATION: NOT_CERTIFIED
DIAG_EXIT_CODE: 0
BT_SEC07_GPG_CONFIGURATION: RESTORED
```

**Diagnóstico probado:** 4 extensiones en el TOC del respaldo; la imagen estándar `postgres:17` carece de archivo de control de 1, mientras que la imagen Supabase PG17 `17.12.0.002` descargada con autorización tiene archivos de control de las 4. El ZIP comparador `BT_SEC07_SUPABASE_IMAGE_COMPARE_20261120.zip` se ejecutó en Windows, pruebas 15/15 OK; manifest y ciphertext originales intactos. La existencia del archivo `.control` NO garantiza instalación funcional, compatibilidad de librerías, roles/grants, datos ni recuperación general. No se ejecutó SQL de restauración en esta comparación.

**Control:** GPG y SHA del snapshot funcionan; el `manifest.json` debe conservar `status=RESTORE_NOT_VALIDATED` y `restoration_verified=false`. `roles.catalog.json.gpg` solo incluye metadatos y NO `roles.sql` utilizable.

## 2. Fuentes públicas y límites

- [Documentación Supabase Restore from Platform](https://supabase.com/docs/guides/self-hosting/restore-from-platform): recomienda `supabase db dump` con filtros y roles/schema/data separados; **`pg_dump` crudo incluye objetos internos** y puede fallar al restaurarse aunque las extensiones estén presentes. Configuración Auth/Storage/Edge requiere otras tareas.
- [Supabase Postgres / Docker configuración](https://github.com/supabase/supabase/blob/master/docker/CONFIG.md): imagen self-host tiene funciones, roles y migraciones de inicialización; con contraseña y socket propios en Docker. Al restaurar dump crudo, las diferencias de objetos internos son posibles; NO declarar corrupción por un fallo de objeto duplicado.
- [Extensiones personalizadas de Supabase](https://supabase.com/docs/guides/self-hosting/custom-postgres-extensions): `.control` ≠ librería funcional, configuración de preload/privilegios.
- [PostgreSQL 17 pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html): `--exit-on-error` y `--single-transaction` exigen detener una restauración ante error sin presentar log SQL al chat.

## 3. Candidato privado de laboratorio ya preparado (NO ejecutado con datos reales)

Paquete **solo en conversación**, no en GitHub: `BT_SEC07_SUPABASE_ISOLATED_RESTORE_20261120.zip` **12.321 bytes**, SHA256 `3a50b7bf010b7c8a4362f06d099467a5bbdbbdd2cbb243e588ce1caf4ccd7012`. Archivos: `BT_SEC07_Supabase_Isolated_Restore.py`, `test_BT_SEC07_Supabase_Isolated_Restore.py`, `LEEME_SEC07_LAB.md`. Programa SHA256 `9a5ff6167552814ba84bd1ea31242a9b11eb77e58f5a5e4edd3c20f80be7cdb0`.

- **25/25 pruebas sintéticas** aprobadas en el entorno del asistente y tras extraer ZIP; integridad testzip OK; incluye pruebas de pipe binario real con bytes sintéticos y cierre anticipado en consumidor falso. **No se puede ejecutar Docker ni se dispone del backup real del propietario en el contenedor del asistente**.
- El programa exige consentimiento explícito `BT_SEC07_ALLOW_ISOLATED_RESTORE=AUTORIZO`, GNUPGHOME aislado histórico, hash del lector V2 validado y **la única** carpeta SEC07 vigente con manifest/hashes originales; Docker local Linux sin DOCKER_HOST/CONTEXT, imagen local Supabase PG17 digest fijado previamente descargado. **NUNCA hace pull**, dump remoto, `pg_dump` ni acceso Supabase.
- Si autoriza el propietario en PowerShell, inicia **un único contenedor aleatorio** `--network none --pull=never --log-driver=none`, sin puertos, sin montajes ni Docker socket, con datos PostgreSQL, socket y /tmp en tmpfs, límite de memoria/procesos. Elimina solo su contenedor en finally y verifica que no quede. El host puede conservar capas inmutables de la imagen ya descargada, no se borran.
- Usa contraseña ficticia aleatoria **solo dentro de la imagen efímera**; no toca credenciales de producción. Verifica salud de instancia y crea solo roles de prueba NOLOGIN ausentes a partir del catálogo GPG del propio backup, **no replica privilegios ni claves reales**; restaura el snapshot existente en **nueva BD local creada desde template0**, con `pg_restore --single-transaction --exit-on-error --no-owner --no-acl`.
- Clasifica stderr del proceso `pg_restore` solo en RAM y etiquetas fijas; no muestra SQL, PII, nombres de clientes, identidades, logs Docker ni stderr crudo. Verifica archivo/manifiesto sin modificación postlaboratorio.
- **Si arranque/restauración falla**, se debe conservar el error categorizado, NO repetir ensayo a ciegas. Un `OBJECT_ALREADY_EXISTS` es plausible con esquemas internos administrados de Supabase y no prueba cifrado corrupto. Esta herramienta usa una **base nueva** dentro del contenedor para reducir choques, pero no promete eliminarlos.
- **Si el restore termina OK**, solamente se comprueba que exista al menos una tabla pública; no paridad completa de datos, RLS/grants, roles ni Auth/Storage/Edge. `FULL_PROJECT_RECOVERY: NOT_CERTIFIED` siempre, y manifest sigue RESTORE_NOT_VALIDATED. El paso posterior sería auditoría de paridad y estrategia oficial CLI de tres archivos y la segunda copia externa no-Drive.

**Operación aún pendiente**: usuario verifica ZIP SHA y 25 pruebas sintéticas; autoriza expresamente una restauración local aislada `AUTORIZO` antes de ejecutar. No se modifica el ZIP/código histórico. El soporte real de la imagen Docker en PC no está demostrado hasta ejecutar el laboratorio.

## 4. Próxima acción en PC

1. No repetir `pg_dump`, `pg_dumpall` ni descargar otra imagen; ya tenemos ciphertext intacto y `supabase/postgres:17.12.0.002` en Docker.
2. Ejecutar paquete aislado **una sola vez y solo si se autoriza**, en nuevo directorio, validando SHA256 ZIP y 25 QA offline; no salir del contenedor ni tocar servicios.
3. Enviar solo etiquetas `BT_SEC07_*`, `DIAG_EXIT_CODE`; revisar resultado y avanzar al siguiente control de restauración o resolver el **nuevo error clasificado**.
4. Mantener `BT-PILOT-QA-04: A REPASAR` hasta recuperación operativa con alcance completo y seguridad A/B.

**Operación documental:** solo `agent.md`, `roadmap.md` y este nuevo checkpoint; sin cambios en código, workflows, Render, Supabase, manifiestos o claves; commit `[skip render]`.
