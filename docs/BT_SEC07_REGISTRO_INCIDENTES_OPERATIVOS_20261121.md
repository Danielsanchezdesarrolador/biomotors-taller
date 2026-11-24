## SEC07-S4C-R9 — comprobación complementaria PASS limitada (23/11/2026)

**Evidencia Windows PowerShell 5.1 aportada por el propietario, posterior al R8:**
```text
BT_SEC07_S4C_R9: START
BT_SEC07_S4C_R9_LAB: READY
BT_SEC07_S4C_R9_RESTORE_EXIT: 0
BT_SEC07_S4C_R9_GPG: PASS
BT_SEC07_S4C_R9_STRUCTURE: PASS
BT_SEC07_S4C_R9_RLS: WORKSHOPS_AB_PASS_LAB_GRANT
BT_SEC07_S4C_R9_ACL: NOT_CERTIFIED_NO_ACL_RESTORE
BT_SEC07_S4C_R9_RESULT: CHECK_PASS_LIMITED
```

**Resultado:** segunda ejecución real del v04 cifrado en laboratorio local Supabase PostgreSQL 17 aislado, reutilizando la arquitectura R8 ya validada; descifrado GPG y `pg_restore` código 0. El script S4C-R9 de esta conversación ejecutó **dentro del mismo laboratorio restaurado, antes de destruir el contenedor**: existencia de 12 tablas de aplicación definidas en `public`, RLS habilitada para cada una, existencia de `auth.users`, al menos dos talleres en `public.workshops` y una membresía, presencia **global** de al menos una FK y un índice en `public`, y ausencia de relaciones huérfanas detectadas para vehicles→customers, work_orders→vehicles, inspection_findings→work_orders y memberships→auth.users/workshops. `STRUCTURE:PASS` **NO** certifica todas las FK/índices por tabla ni un cotejo de conteos/filas contra producción.

**Alcance exacto del PASS RLS:** en el laboratorio se otorgó explícitamente y solo para la prueba `GRANT USAGE ON SCHEMA public` y `GRANT SELECT` a `authenticated` sobre workshops y memberships, porque el restore se hizo con `--no-acl`. Se seleccionó una membresía activa de un usuario Auth con correo confirmado en taller A activo y otro taller B activo sin membresía activa para ese usuario. Con `SET LOCAL ROLE authenticated` y `request.jwt.claim.sub` temporal se verificó que la policy de `public.workshops` **permitió ver A e impidió ver B**. **No** certifica todas las tablas, operaciones de escritura, revocación, roles admin/mecánico, owners/ACL originales ni seguridad RLS funcional global. El laboratorio no requiere acceso a producción para esta comprobación.

**Estado actualizado:** S2-R11 estructural PASS; S4B-R8 restauración técnica PASS; S4C-R9 estructura y RLS lectura workshops A/B **CHECK_PASS_LIMITED**. **S4 integral permanece ABIERTA**: falta comparación de datos/filas esperados, controles completos de permisos, grants/owner, RLS de tablas restantes, matrices A/B en operaciones relevantes y cobertura S3 (Auth operativo, Storage binario, Edge, Render, secretos). No convertir `NOT_CERTIFIED_NO_ACL_RESTORE` en error de backup ni declararlo PASS. El laboratorio R9 fue efímero `--rm` y no persiste. Ningún cambio a Supabase/Render/producción. No reejecutar R8 ni R9 como verificación rutinaria; el siguiente trabajo debe concentrarse en la **brecha verificable** y consolidar lo faltante, sin añadir una sucesión de reintentos.

**Referencia:** [checkpoint S4C-R9](docs/checkpoints/CHECKPOINT_BT_SEC07_S4C_R9_VALIDACION_LIMITADA_PASS_20261123.md), [runbook R8](docs/recovery/BT_SEC07_S4B_R8_SOLUCION_Y_PREVENCION_20261123.md). Documentación sanitizada, solo rama `main`, `[skip render]`.

---

## SEC07 — Runbook permanente tras S4B-R8 PASS (23/11/2026)

**Solución y prevención documentadas:** [`docs/recovery/BT_SEC07_S4B_R8_SOLUCION_Y_PREVENCION_20261123.md`](docs/recovery/BT_SEC07_S4B_R8_SOLUCION_Y_PREVENCION_20261123.md). Describe toda la secuencia real desde claves/GPG y R2-R7, causa demostrada vs hipótesis, corrección operativa R8, guardas para PostgreSQL/Supabase/Docker/PowerShell y estado posterior. **R8 RESTORE_PASS**, no significa **S4 global PASS**; S4C con controles de datos y A/B pendiente. **No repetir R8 rutinariamente ni reexportar S2-R11.**

---

## SEC07-S4B-R8 — RESTORE_PASS real en laboratorio aislado (23/11/2026)

**Evidencia recibida del propietario desde Windows PowerShell 5.1:**
```text
BT_SEC07_S4B_R8: START
BT_SEC07_S4B_R8_LAB: READY
BT_SEC07_S4B_R8_RESTORE_EXIT: 0
BT_SEC07_S4B_R8_GPG: PASS
BT_SEC07_S4B_R8_CATALOG: CHECK_PASS
BT_SEC07_S4B_R8_RESTORE: PASS
BT_SEC07_S4B_R8_RESULT: RESTORE_PASS
```

**Resultado verificado por el procedimiento y reportado por el propietario:** se ejecutó en su PC el R8 de PowerShell 5.1, usando el archivo cifrado existente S2-R11 v04 (`*_nobom_v04.dump.gpg`), `GNUPGHOME` seleccionado, GnuPG y Docker local con imagen fijada `supabase/postgres:17.6.1.136`. El entrypoint/migraciones oficiales completaron el bootstrap y la comprobación de roles estándar antes de emitir `LAB:READY`. Se creó `bt_s4` desde `template0` y `pg_restore` terminó con exit code 0, con `--exit-on-error --single-transaction --no-owner --no-acl`. GPG terminó con exit code 0 y estado `DECRYPTION_OKAY`; el stream binario hacia Docker no registró error y Docker terminó exit 0. Consulta sintética del catálogo confirmó **al menos una tabla no perteneciente a los esquemas de sistema** en la base restaurada. **S4B RESTAURACIÓN TÉCNICA PASS; primera restauración completa del archive v04 confirmada en laboratorio.** Esta evidencia procede de etiquetas compartidas, no de inspección remota del PC.

**Corrección aplicada y aprendizaje R7→R8:** R7 quedó en `BOOTSTRAP_FAILED` sin log persistente; conflicto comprobado de diseño entre `docker run --read-only` y necesidad de escritura de clave temporal `pgsodium` en `/etc/postgresql-custom/pgsodium_root.key`, cuya causalidad histórica exacta no se pudo demostrar. R8 retiró **solo** `--read-only`, preservó entrypoint, migraciones, imagen fijada, `--network none --rm --pull=never --log-driver none`, ausencia de puertos/bind mounts y `tmpfs` para PGDATA, `/tmp` y socket. R8 pasó con esta configuración; es evidencia de solución operativa, no prueba forense de la única causa de R7. La capa escribible efímera puede producir huellas temporales en disco host; no afirmar cero huella ni seguridad ante pérdida del PC. No se conectó ni modificó producción durante este procedimiento.

**Alcance que NO certifica R8:** la consulta de catálogo solo comprobó existencia de tabla(s), NO cantidades de filas, integridad semántica/datos esperados, FK/índices, owners, ACL/GRANT, políticas RLS efectivas, funciones SECURITY DEFINER, aislamiento entre talleres A/B con roles no privilegiados, ni componentes Supabase fuera del dump (Auth operativo, archivos Storage, Edge Functions, configuración/secretos, Render). `--no-owner --no-acl` impide considerar restaurados los propietarios y privilegios originales. **S4 restauración técnica PASS; S4 recuperación integral/seguridad NO CERRADA; S3 servicios/permisos PENDIENTE.** S2-R11 sigue PASS y no se repite ni reexporta.

**Siguiente acción útil, una sola ronda consolidada:** definir y ejecutar validación focalizada de datos/estructura esperados y permisos/RLS negativos de talleres A/B, con evidencia sanitizada y sin filas ni secretos; distinguir cobertura externa S3. Mantener solo `main`, cambios documentales `[skip render]`, sin Codex, producción, Render, SQL remoto, ramas ni nuevas auditorías S2. Guardar este hito en checkpoint único `docs/checkpoints/CHECKPOINT_BT_SEC07_S4B_R8_RESTAURACION_TECNICA_PASS_20261123.md`.

---

## SEC07-S4B-R7 — BOOTSTRAP_FAILED; conflicto de escritura pgsodium en rootfs RO (23/11/2026)

**Evidencia aportada por propietario:**
```text
BT_SEC07_S4B_R7: START
BT_SEC07_S4B_R7_LAB: BOOTSTRAP_FAILED
```
**Confirmado:** R7 llegó a ejecutar una inicialización de laboratorio, pero **no emitió LAB:READY ni inició GPG ni pg_restore**. Los registros del contenedor quedaron en tmpfs y fueron eliminados por --rm; la causa exacta histórica no puede reconstruirse desde esos dos marcadores. S2-R11, GPG aislado, backup v04 y pruebas previas siguen sin necesidad de repetición.

**Defecto comprobado estáticamente del diseño R7 y causa probable de BOOTSTRAP_FAILED:** invocó `docker run --read-only` mientras el mecanismo de arranque oficial del tag `supabase/postgres:17.6.1.136` migra extensiones y utiliza `/usr/lib/postgresql/bin/pgsodium_getkey.sh`, que crea `/etc/postgresql-custom/pgsodium_root.key` si no existe. Ruta dentro del rootfs no montada como escritura temporal en R7. Docker Compose oficial utiliza `db-config:/etc/postgresql-custom` escribible; el script del tag se encuentra en `https://github.com/supabase/postgres/blob/17.6.1.136/ansible/files/pgsodium_getkey_urandom.sh.j2`; Compose `https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml`. **Este conflicto es real; su relación causal exacta con la salida Windows R7 permanece probable, no demostrada**, porque stderr fue ocultado.

**Corrección propuesta R8 (NO ejecutada en PC):** conservar la imagen Supabase PG17 fijada, entrypoint y migraciones propios, `--network none --log-driver none --rm -i --pull=never`, PGDATA `/var/lib/postgresql/data`, `/tmp` y socket `/var/run/postgresql` en tmpfs; **quitar solo `--read-only`** para que Supabase pueda escribir el archivo de clave aleatoria de laboratorio y conservar los archivos de configuración de imagen. Se evita montar tmpfs encima de `/etc/postgresql-custom` porque ocultaría configuraciones originales. La capa overlay temporal de Docker puede escribirse en el almacenamiento del PC con el archivo generado de la clave del LAB, y se elimina al destruir contenedor; **no afirmar ausencia absoluta de huella en disco**, aunque el respaldo en claro fluye por pipe y los datos de PG y logs permanecen en tmpfs. La clave efímera NO es la clave de Supabase producción. Clasificar error bootstrap mediante categorías fijas del log en tmpfs, sin mostrar SQL, rutas ni contraseñas, antes de cualquier GPG. Restaurar una sola vez v04 si boot READY en bt_s4 desde template0, evaluar GPG+exit restore; no alterar S2/R6 ni producción. Shell R8 se comprobó con `sh -n` y transporte FD3 usando bytes de prueba incluido NUL en laboratorio Linux **sin Docker real ni backup**. R8 no es PASS; STOP ante fallo.

**Estado:** S4 FULL RESTORE PENDIENTE. `--no-owner --no-acl` no certifica owners/ACL/RLS A/B. Auth, Storage, Edge, Render, secretos/S3 externos pendientes. Esta investigación y error quedan respaldados para evitar repetición; no Codex, no deploy.

---

## SEC07 S4B-R6 — informe Astra recibido; bootstrap oficial Supabase propuesto para R7 (23/11/2026)

**Investigación independiente entregada por el propietario:** informe "ByteTorque S4B-R6 — Dictamen para el chat principal" (revisión de PostgreSQL 17, imagen Supabase fijada, migrador y RLS). **Causa de R6 con alta confianza, no demostrada forénsicamente:** el script invocó `initdb` directamente, eludiendo las migraciones oficializadas que crean roles globales Supabase. R6 registró `LAB:READY`, `RESTORE_EXIT:1`, `MISSING_ROLE` pero nunca reveló el nombre. `authenticated` es candidato respaldado por políticas `CREATE POLICY ... TO authenticated` del código aplicado de ByteTorque, NO identidad del primer rol confirmada. `--no-owner --no-acl` no omite referencias a roles en políticas.

**Corrección de la investigación previa:** `docker/volumes/db/roles.sql` del Compose modifica contraseñas de roles ya existentes mediante ALTER USER; **no crea** el conjunto de roles. El mecanismo correcto de arranque del tag `supabase/postgres:17.6.1.136` es `docker-entrypoint.sh` (Dockerfile-17), el cual ejecuta los archivos de `/docker-entrypoint-initdb.d` incluyendo `migrate.sh` del tag: base inicial `postgres` bajo `supabase_admin`, creación de `anon/authenticated/service_role` e internos, ejecución de migraciones y fin de bootstrap. La restauración debe ir a una base **distinta y vacía** `bt_s4` creada desde `template0` para evitar conflictos con esquemas que ya crea Supabase en `postgres`.

**Investigación comprobada con fuentes fijadas:** `https://github.com/supabase/postgres/blob/17.6.1.136/Dockerfile-17`; `https://github.com/supabase/postgres/blob/17.6.1.136/migrations/db/migrate.sh`; `https://github.com/docker-library/postgres/blob/6edb0a8c4def40c371514b34aef9037ec82d9110/17/alpine3.23/docker-entrypoint.sh`; `https://www.postgresql.org/docs/17/app-pgrestore.html`. El entrypoint imprime `PostgreSQL init process complete; ready for start up.` **solo después** de procesar init scripts; R7 usa esa marca en log protegido tmpfs más consulta local que exige roles estándar y `authenticated` sin superuser/BYPASSRLS antes de iniciar GPG. Preservar config de imagen `/etc/postgresql-custom`: no montar tmpfs sobre ella.

**Propuesta única R7 (no ejecutada):** una ejecución PowerShell 5.1 local con imagen ya descargada, Docker `--rm -i --pull=never --network none --read-only --log-driver none`; `tmpfs` PGDATA, /tmp y socket /var/run/postgresql; contraseña efímera aleatoria solo de laboratorio, sin exponerla en chat; ejecutar entrypoint oficial dentro del contenedor, stdout/stderr de bootstrap exclusivamente a /tmp tmpfs; comprobar fin de migraciones y roles (sin mostrar nombres privados ni logs). Crear `bt_s4 TEMPLATE template0`, anunciar READY, enviar ciphertext v04 a GPG con `--homedir` S1A y su salida binaria por Docker stdin/FD3 a `pg_restore` sin `-` final, `--no-owner --no-acl --exit-on-error --single-transaction`; registrar exit code, clasificar fallo solo con constantes, comprobar catálogo sintético tras éxito, detener y limpiar contenedor. **No se ejecutó Docker en el PC del usuario; no afirmar R7 PASS**. En laboratorio Linux local se comprobó `sh -n` del script interno y un ensayo ficticio de FD3 con bytes NUL, no la restauración real ni la ejecución del entrypoint Supabase.

**Riesgos/pendientes:** los roles personalizados pueden seguir faltando; el bootstrap oficial puede requerir recursos/configuración adicional; si falla registrar primera clase sin nuevos ciclos de pruebas generales. El éxito con `--no-owner --no-acl` no verifica owners, GRANT, RLS A/B ni datos por taller, funciones SECURITY DEFINER, Auth operativo, binarios Storage, Edge/Render/config/secrets externos; estos quedan pendientes y requieren comprobación separada. **S4 PENDIENTE**. Todo sin producción, Render, ramas nuevas, Codex ni nuevos backups. Traspaso completo de R6 está en conversación, no pedir al propietario repetirlo. Regla permanente de errores/soluciones/documentación activa.

---

## SEC07 S4B-R6 — imagen Supabase PG17 READY; primera dependencia MISSING_ROLE (23/11/2026)

**Resultado real reportado desde Windows PowerShell 5.1 (no contiene datos sensibles):**
```text
BT_SEC07_S4B_R6_IMAGE: READY
BT_SEC07_S4B_R6_LAB: READY
BT_SEC07_S4B_R6_RESTORE_EXIT: 1
BT_SEC07_S4B_R6_FIRST_ERROR: MISSING_ROLE
BT_SEC07_S4B_R6_RESULT: RESTORE_NOT_COMPLETE
```
**Hechos:** la imagen local `supabase/postgres:17.6.1.136` quedó disponible, `initdb`/cluster temporal y `createdb` pasaron, `pg_restore` inició y salió con código 1. El clasificador encontró texto compatible con un rol no existente. **No sabemos qué rol ni en qué instrucción del archive**, ni debemos inventarlo o dar por lograda la restauración. No se toca producción ni se repite S2-R11 (GPG, SHA, PGDMP y TOC previamente PASS).

**Investigación focalizada y evidencia externa:** la imagen Supabase no equivale a ejecutar su despliegue oficial de inicialización: el `docker-compose.yml` oficial fija `supabase/postgres:17.6.1.136` e incorpora explícitamente `./volumes/db/roles.sql:/docker-entrypoint-initdb.d/init-scripts/99-roles.sql`. La documentación oficial CONFIG.md describe migraciones/roles semilla del entorno self-hosted. El script R6 usa `initdb` directo y **no aplica esos roles**, lo que explica razonablemente `MISSING_ROLE` aun teniendo la imagen con extensiones. Referencias: `https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml` y `https://github.com/supabase/supabase/blob/master/docker/CONFIG.md`, `https://supabase.com/docs/guides/database/postgres/roles`, `https://www.postgresql.org/docs/17/app-pgrestore.html`. Es **hipótesis fuerte**, no rol identificado. `--no-owner --no-acl` omite propietarios/privilegios pero no elimina referencias a roles dentro de políticas RLS, definiciones de objetos o SQL de funciones.

**Decisión del propietario:** solicitar de nuevo revisión independiente de Astra; **no emitir nuevas variantes R7 ni ejecuciones diagnósticas hasta recibirla**. Alcance Astra: decidir mecanismo reproducible mínimo de precarga de roles y configuraciones a partir de fuentes oficiales fijadas, dentro del contenedor aislado y con datos ficticios o ningún dato persistente; no crear roles indiscriminadamente ni conceder `SUPERUSER`/`BYPASSRLS` a roles de aplicación; determinar si hay forma de reconocer solo nombres de roles públicos estándar y mantener secretos/identificadores de usuario ocultos. Entregar **una sola solución consolidada**, no una cadena de pruebas, y sus criterios de PASS/STOP. R6 `MISSING_ROLE` no es evidencia de que falten roles en producción. **S4 RESTORE NO PASS; S3 servicios externos, ACL y RLS sin certificar.**

Continuar registro en los cuatro documentos obligatorios; un único checkpoint al cierre verificado. Solo `main`, docs-only `[skip render]`, sin deploy ni llamadas a producción.
---

## SEC07-S4B-R5 — RESTORE_EXIT 1, clasificación MISSING_EXTENSION (23/11/2026)

**Evidencia Windows del propietario:**
```text
BT_SEC07_S4B_R5: START
BT_SEC07_S4B_R5_LAB: READY
BT_SEC07_S4B_R5_RESTORE_EXIT: 1
BT_SEC07_S4B_R5_FIRST_ERROR: MISSING_EXTENSION
BT_SEC07_S4B_R5_RESULT: RESTORE_NOT_COMPLETE
```
**Hechos:** el laboratorio PG17 Alpine aislado inicializó y `pg_restore` se ejecutó pero terminó con código 1. El clasificador R5 encontró un patrón compatible con extensión ausente en el comienzo de stderr; **esto es categoría diagnóstica, no identifica el nombre exacto de la extensión ni demuestra la causa completa**. No existe registro del stderr crudo porque el contenedor se destruyó; no afirmar S4 PASS o daño del v04. S2-R11 GPG/SHA/TOC y GPG aislado PASS continúan; no repetir.

**Investigación posterior (fuentes oficiales):** Supabase guía `https://supabase.com/docs/guides/self-hosting/restore-from-platform` requiere habilitar extensiones de origen que falten. Registro oficial de versiones `https://github.com/supabase/supabase/blob/master/docker/versions.md` fija la imagen PG17 de autoalojamiento `supabase/postgres:17.6.1.136` desde 2026-06-17. La imagen de Supabase trae más extensiones y configuración que `postgres:17-alpine`; por tanto, se propone **cambiar solo la imagen de destino del laboratorio** en un siguiente intento de restauración consolidada, sin alterar backup ni producción. El Dockerfile PG17 actual de Supabase (`https://github.com/supabase/postgres/blob/develop/Dockerfile-17`) contiene `su-exec` mientras Docker Postgres oficial usa `gosu`; no asumir que una imagen es idéntica a la otra: elegir el ejecutor disponible en el contenedor. Fijar tag verificado y verificar su presencia/descarga sin conexiones de red **dentro** del laboratorio. La imagen fijada de Supabase puede diferir del servidor managed original en extensiones/versiones/roles; no garantizar que R6 pase.

**Propuesta operativa:** respetando la orden de evitar pruebas inconducentes, ofrecer una sola ejecución R6 con imagen Supabase PG17 fijada, PGDATA y /tmp en tmpfs, contenedor sin red/puertos ni bind mounts, GPG local streaming usando GNUPGHOME correcto, script shell transportado como Base64 por argumento y stdin por FD3, `pg_restore` **sin argumento '-'**, y salida de primer error sanitizada. No repetir GPG/PGDMP/TOC, no instalar extensiones aleatorias. Verificar códigos GPG + restore + Docker y un chequeo del catálogo si restaura. STOP ante cualquier falla nueva, sin reruns automáticos. El nombre de la extensión no es conocido y no debe inventarse.

**Límites:** `--no-owner --no-acl` no certifica propietarios/ACL/RLS/talleres A-B; el éxito de restauración PostgreSQL no implica recuperación integral de Auth/Storage/Edge/Render/secrets; tmpfs puede usar swap. S4 sigue PENDIENTE, no publicar datos/contraseñas ni modificar Supabase/Render.

---

## SEC07 S4B-R4 — dictamen técnico independiente Sol; R5 corregido y aún no ejecutado (2026-11-23)

**Fuente:** informe técnico externo entregado por el propietario, contrastado con documentación oficial PostgreSQL 17 (`https://www.postgresql.org/docs/17/app-pgrestore.html`) y su fuente en `REL_17_STABLE/src/bin/pg_dump/pg_restore.c`. El chat principal conserva el bloque R4 original completo (no hace falta pedírselo al usuario).
**Defectos comprobados por revisión estática del R4:**
1. R4 invocó `gosu postgres pg_restore ... --no-acl - <&3`; en PostgreSQL 17 el argumento posicional final `-` se interpreta como nombre de archivo, mientras que **omitir** el argumento de archivo activa lectura desde stdin. Probable causa del `RESTORE_TOOL_OR_STREAM_ERROR` de R4, **alta confianza pero no recuperado el stderr original**.
2. R4 buscaba solamente `grep -m1 -E 'ERROR:|FATAL:'`; no clasificaba `pg_restore: error:` en minúsculas. Etiqueta `RESTORE_TOOL_OR_STREAM_ERROR` es un fallo del clasificador y NO demuestra pérdida del respaldo ni dependencia Supabase.

**Corrección R5 consolidada (propuesta, no comprobada en Windows):** conservar imagen local `postgres:17-alpine`, aislamiento (`--network none --read-only --rm --tmpfs /var/lib/postgresql/data --tmpfs /tmp`), `gosu`, Base64 del script shell preservando líneas, FD3 binario, `GNUPGHOME` S1A explícito, GPG BaseStream y stderr concurrentes; **eliminar el último argumento `-`** en `pg_restore`, agregar `--single-transaction --no-password` manteniendo `--no-owner --no-acl`, registrar exit code y clasificar diagnósticos cliente/servidor en minúsculas sin imprimir SQL, nombres o rutas. Si `pg_restore` sale 0, consultar solo conteo de tablas de usuario a nivel catálogo (sin nombres ni filas), emitir `CATALOG:CHECK_PASS` al éxito de la consulta y destruir el contenedor; esto NO prueba conteos de filas ni RLS.

**Comprobaciones locales (no en PC usuario):** `/bin/sh -n` PASS sobre texto Linux extraído del R5 y prueba sintética POSIX de `exec 3<&0; printf BASE64 | base64 -d | /bin/sh` con bytes incluidos NUL, preservados en salida; revisión estática comprobó ausencia del `-` posicional y presencia de clasificación y marcadores R5. **No contamos con PowerShell 5.1 ni Docker del titular en este entorno:** la ejecución de R5 y restauración PostgreSQL siguen PENDIENTES; no inferir PASS de S4.
**Límites:** `--no-owner --no-acl` no valida owners/GRANT/ACL ni tenant A/B; futura comprobación con identidades sin BYPASSRLS, Auth/Storage/Edge/Render/secrets externos siguen S3 abiertos; tmpfs no excluye por sí solo swap físico. No repetir S2-R11 ni pruebas aisladas de GPG.

**Decisión operacional:** propietario pidió no realizar más pruebas sin sentido. Presentar una sola ejecución integral R5, después de la revisión del informe y su aprobación, con salida reducida a `BT_SEC07_S4B_R5_*` y STOP ante el primer fallo. No crear nueva rama, no push de aplicación, no desplegar Render ni conectar producción. El R5 completo para uso PC se entrega como archivo `ByteTorque_S4B_R5.ps1` en el chat principal, no se suben backups/secretos.

---

## SEC07 — S4B-R4 laboratorio READY, restore no completado: escalar revisión a Astra (23/11/2026)

**Evidencia nueva del propietario (Windows):** `BT_SEC07_S4B_R4: START`, `BT_SEC07_S4B_R4_LAB: READY`, `BT_SEC07_S4B_R4_FIRST_ERROR: RESTORE_TOOL_OR_STREAM_ERROR`, `BT_SEC07_S4B_R4_RESULT: RESTORE_NOT_COMPLETE`. El laboratorio PG17 aislado arrancó; **`pg_restore` falló, pero el script ocultó su diagnóstico real al buscar solo `ERROR:|FATAL:`**. La etiqueta no demuestra defecto de backup ni de Supabase, y puede deberse a mensajes `pg_restore: error:` en minúsculas o falla de stdin/FD3. GPG aislado PASS, S2-R11 PASS estructural; no volver a probar claves/TOC. R4 ya terminó y el log tmpfs no persiste.

**Decisión explícita del propietario:** `No mas pruebas si sentido, ocupemos astra para que lo solucione.` Suspender ejecuciones iterativas y pedir revisión de causa y UNA corrección consolidada a Astra; no pueden invocarse modelos externos automáticamente desde este chat. Traspaso técnico: `docs/recovery/BT_SEC07_S4B_R4_ASTRA_HANDOFF_20261123.md`. No afirmar S4 PASS; no tocar producción, Render, Supabase ni backup v04. El siguiente intento solo tras revisión técnica razonada y aprobación del propietario; documentación continuada en cuatro archivos.

---

## SEC07 S4B-R3 — DOCKER_START_FAILED por defecto en empaquetado del script (23/11/2026)

**Salida real informada por propietario:** `BT_SEC07_S4B_R3: START`, `BT_SEC07_S4B_R3_STOP: DOCKER_START_FAILED`. No hay marcador `LAB:READY`; **no se confirmó** que `initdb` se invocara ni que empezara `pg_restore`.

**Defecto determinado mediante revisión estática del script R3 entregado:** `$linux = ($linux -replace '[\r\n]+', ' ').Trim()` convirtió líneas de código shell en espacios aunque varias carecían de `;` al final. Ejemplo `set -u\ngrep -q ...` pasó a `set -u grep -q ...`; sentencias `if/case` también quedaron concatenadas inválidamente. Esto puede explicar que Docker no emitiera marcador; **sin stderr del intento no puede asegurarse que sea la única causa**. El script R3 no debe reejecutarse.

**Corrección R4 propuesta (pendiente en PC):** preservar script POSIX completo en UTF-8 usando Base64 en la línea de comandos del contenedor, sin sustituir saltos de línea; decodificar dentro con `base64 -d | /bin/sh`. Duplicar entrada binaria Docker a descriptor `3` con `exec 3<&0`, y pasar `<&3` a `pg_restore` para que el script y el dump utilicen streams diferentes sin escribir payload en disco. Se comprobó en laboratorio Linux local la sintaxis `sh -n` del texto corregido y la conservación de fd3 en una prueba ficticia; **NO se comprobó Docker/Windows ni restore de v04**. Corregir `su-exec` por `gosu`, presente en Dockerfile oficial postgres 17 alpine; iniciar PGDATA y /tmp en tmpfs, network none, read-only, sin puertos; no tocar Supabase ni S2. Clasificar fase de laboratorio antes de invocar GPG y primer `ERROR/FATAL` solo por categoría. No imprimir SQL, secretos ni logs completos.

**Estado:** GPG aislado `PASS`; S4 restauración `PENDIENTE`. Si R4 devuelve clase PostgreSQL real, atender esa causa y no sumar otro ciclo de diagnóstico genérico. Sin despliegue; documentar validación posterior como hecho separado, en un checkpoint final único.

---

## SEC07-S4B — causa raíz INIT_FAILED: `su-exec` ausente (23/11/2026)

**Evidencia Windows del propietario:** `BT_SEC07_S4B_INIT_DIAG: START`, `BT_SEC07_S4B_INIT_DIAG: INITDB_FAILED`, `<PATH>: su-exec: not found`, `BT_SEC07_S4B_INIT_DIAG: COMPLETED`.

**Causa demostrada para `INIT_FAILED`:** el script S4B-R2 intentaba ejecutar `su-exec postgres initdb` pero la imagen oficial `postgres:17-alpine` no dispone del ejecutable `su-exec`. Así, `initdb` **nunca se llegó a invocar**; no es fallo PostgreSQL del backup, de credenciales GPG, de Docker tmpfs ni de dependencias de Supabase. El Dockerfile oficial `docker-library/postgres/17/alpine3.23/Dockerfile` utiliza e instala `gosu` para bajar privilegios. Fuente: https://github.com/docker-library/postgres/blob/master/17/alpine3.23/Dockerfile

**Corrección localizada:** sustituir las **cuatro** invocaciones `su-exec postgres` por `gosu postgres` en el script de laboratorio (initdb, pg_ctl, createdb y pg_restore); preservar flags de Docker `--network none`, `--read-only`, `--tmpfs` PGDATA + /tmp, `--pull=never`, GNUPGHOME correcto, respaldo v04 inalterado y salida sanitizada. Se trata de una corrección basada en código fuente oficial y mensaje observado, **no de prueba de restauración completa**. No repetir diagnóstico initdb separado, GPG aislado ni comprobaciones S2; realizar la siguiente restauración S4B con este ajuste y clasificar primer ERROR real de `pg_restore` o siguiente falla.

**Estado:** CAUSA de `INIT_FAILED` identificada; **fix R3 propuesto, aplicación en PC y `pg_restore` pendientes**. Al recibir salida Windows documentar error real/solución verificada. Sin producción/Render/Edge ni Codex. Mantener un solo checkpoint final consolidado.

---

## SEC07-S4B-R2 — initdb bloqueado en laboratorio temporal (23/11/2026)

**Evidencia real comunicada desde PowerShell:** `BT_SEC07_S4B_R2: START`, `BT_SEC07_S4B_R2_LAB: INIT_FAILED`, `BT_SEC07_S4B_R2_RESULT: LAB_BLOCKED`. Este marcador proviene del fallo de `su-exec postgres initdb` en Docker `postgres:17-alpine` con datos y /tmp configurados en tmpfs, sin red. **No se llegó a crear el clúster PostgreSQL ni a ejecutar `pg_restore`; por tanto no es fallo de dependencias Supabase ni evidencia de corrupción v04.** GPG ya había dado PASS en prueba aislada con GNUPGHOME explícito.

**Causa específica:** aún desconocida; el script anterior redirigía stderr de `initdb` a `/tmp/bt_init.log` y solo devolvía `INIT_FAILED`. Al ser contenedor `--rm`, ese archivo efímero ya no existe. El fallo puede deberse a permisos/capacidad, opciones o entorno de initdb, pero estas son hipótesis, no conclusiones.

**Siguiente corrección diagnóstica mínima:** ejecutar solo `initdb` en un contenedor nuevo sin GPG ni respaldo, con las **mismas opciones Docker de R2**, y mostrar exclusivamente hasta 3 líneas de error/hint del initdb de clúster vacío, con rutas sanitizadas, o un marcador fijo; no hacer otra restauración hasta tener la causa. Posteriormente cambiar solo el requisito que falle y ejecutar una restauración completa, no series de pruebas repetidas. No revelar secretos/SQL/datos, no cambios Supabase/Render, no deploy, backup v04 y S2-R11 intactos. S4 sigue `NO PASS`.

Fuentes de referencia: PostgreSQL 17 `https://www.postgresql.org/docs/17/app-initdb.html`; Docker `https://docs.docker.com/engine/storage/tmpfs/`.

---

## SEC07 S4B — clave de v04 descifra correctamente; corregir diagnóstico Docker/GPG (23/11/2026)

**Resultado nuevo real en PowerShell 5.1:** `BT_SEC07_S4B_ISOLATED: START`, `BT_SEC07_S4B_ISOLATED: GPG_PASS`, `BT_SEC07_S4B_ISOLATED: COMPLETED`, utilizando explícitamente el `GNUPGHOME` de custodia S1A y pasando la salida binaria del respaldo v04 a `Stream.Null`, sin guardar plaintext. **GPG DESCIFRADO PASS para esta operación**, no equivale a restauración PG.

**Causa corregida parcial:** `NO_SECKEY` inicial provino de consultar un almacén GPG distinto del almacén S1A, inferencia apoyada por correspondencia de key-id en dos almacenes S1A, y la operación correcta con `GNUPGHOME` explícito. **Origen exacto del falso `GPG_DECRYPTION_FAILED` tras seleccionar almacén todavía no demostrado:** el script S4B comprobaba primero exit GPG aunque Docker/pg_restore puede cerrar el pipe en un error anterior y causar salida no-cero de GPG. No asumir aún que fallo sea de dependencias Supabase.

**Ajuste técnico autorizado por continuidad de S4:** reusar v04, `GNUPGHOME` actual, motor Docker Linux; **sustituir, no repetir sin corrección,** el script S4B por uno que capture y priorice marcadores `LAB` y `FIRST_ERROR` de Docker/pg_restore antes de culpar a GPG, drenando GPG stdout ante cierre de pipe, stderr concurrentes y señal GPG `DECRYPTION_OKAY` solo para confirmación de restauración completa. Laboratorio sin red, PGDATA y /tmp tmpfs. Emitir solo etiquetas sanitizadas. Si etapa devuelve fallo, no repetir a ciegas. No S2-R11, generación de respaldo ni cambios Supabase/Render. **S4 FULL RESTORE PENDIENTE** y S3 externas pendientes.

**Fuentes de referencia:** PostgreSQL 17 pg_restore (`https://www.postgresql.org/docs/17/app-pgrestore.html`), Docker tmpfs (`https://docs.docker.com/engine/storage/tmpfs/`), GnuPG status (`https://github.com/gpg/gnupg/blob/master/doc/DETAILS`). Documentación es análisis/preparación; la siguiente ejecución de restauración aún no ocurrió.

---

## SEC07 S4B — fallo reiterado tras seleccionar GNUPGHOME (23/11/2026)

**Reporte del propietario:** tras `BT_SEC07_S4B_GPG_HOME: SELECTED_FOR_SESSION` y repetir el bloque S4B, "me dijo lo mismo de nuevo". Se interpreta provisionalmente como reiteración del marcador anterior `GPG_DECRYPTION_FAILED`, pero el usuario **todavía no compartió el marcador literal del nuevo intento**. **No declarar** fallo permanente de clave, respaldo ni restauración por esa referencia ambigua. No reejecutar S4B completo.

**Defecto adicional identificado en el script anterior:** comprobar el exit code GPG antes que el resultado `pg_restore` puede enmascarar una terminación anticipada de Docker/restore y un pipe interrumpido como `GPG_DECRYPTION_FAILED`. Los dos keyrings que coinciden por ID no prueban desbloqueo. Error y su hipótesis siguen abiertos.

**Corrección diagnóstica pendiente de ejecución:** una única prueba aislada GPG explícitamente con `$env:GNUPGHOME` ya seleccionado, `--status-fd 2`, datos binarios descifrados a `System.IO.Stream.Null`, consumo concurrente stderr, sin Docker y sin escritura en archivos, que produzca solo códigos `DECRYPTION_OKAY`, `NO_SECKEY`, `BAD_PASSPHRASE` u otra categoría. Es diagnóstico de la falla **nuevo contexto GNUPGHOME**, no repetir S2-R11 completo. Si GPG da PASS, reparar clasificador/tubería del script restaurador en vez de investigar claves otra vez; si falla, resolver causa GPG según estado. No publicar secretos ni mensajes crudos. Sin cambios productivos; S4 pendiente.

---

## SEC07 S4B — correspondencia de claves v04 en dos almacenes (23/11/2026)

**Evidencia PowerShell 5.1 del propietario:** `BT_SEC07_S4B_MATCH: START`, `BT_SEC07_S4B_KEY_MATCH: MULTIPLE_MATCH`, `BT_SEC07_S4B_MATCH: COMPLETED`. El diagnóstico leyó únicamente metadatos públicos del paquete destinatario y registros de claves privadas/subclaves, no descifró el v04. Dado que se hallaron dos almacenes `GNUPGHOME` y ambos tenían registro `sec`, `MULTIPLE_MATCH` indica correspondencia de identificador de destinatario en **ambos**. Esto no prueba que las claves estén desbloqueables ni que el restore funcione.

**Causa probable reforzada, aún no comprobada:** los S4B previos invocaron GPG sin `--homedir` o `GNUPGHOME`, lo que hizo consultar el keyring predeterminado (`NO_SECKEY`); la custodia S1A sí tiene ambos keyrings pertinentes. **Próximo paso mínimo propuesto:** seleccionar el primero de los dos keyrings coincidentes configurando `GNUPGHOME` solo para la sesión PowerShell actual y ejecutar una vez el S4B ya preparado, sin modificar script ni backup. GnuPG documenta que `GNUPGHOME` establece el almacén cuando no se pasa `--homedir`. Si fallo, no repetir ciegamente: clasificar según marcadores y actualizar causa/solución verificada. No revelar rutas de custodia ni identificadores en salida; no producción, no deploy, no Codex. S2-R11 sigue PASS estructural, S4 pendiente.

---

## S4B — custodia GPG localizada: 2/2 almacenes con clave privada (23/11/2026)

**Evidencia Windows comunicada:** `BT_SEC07_S4B_KEYRING: START`, `BT_SEC07_S4B_KEYRINGS_FOUND: 2`, `BT_SEC07_S4B_KEYRINGS_WITH_SECRET: 2`, `BT_SEC07_S4B_NEXT: VERIFY_KEY_MATCH`, `BT_SEC07_S4B_KEYRING: COMPLETED`. **Hecho confirmado:** la custodia local S1A contiene dos almacenes `GNUPGHOME` que exponen registros `sec` de clave privada. **No confirmado:** que cualquiera corresponda a la subclave destinataria del ciphertext v04, que esté desbloqueable o que `pg_restore` funcione. Por tanto no crear ni importar claves ni repetir S2. Hipótesis reforzada (no demostrada) de que el script S4B consultó el almacén GPG predeterminado, distinto de los dos hallados.

**Acción mínima propuesta, todavía no ejecutada:** comparar solo metadatos `keyid` de los paquetes públicos destinatarios del v04 (`gpg --list-only --list-packets`, sin descifrar) con ID de las claves secretas/subclaves de cifrado en los dos almacenes (`gpg --with-colons --list-secret-keys --homedir`). Procesar datos únicamente en memoria, no mostrarlos ni guardar archivos. Reportar solo clase y recuento de coincidencia; si existen destinatarios ocultos/IDs cero o parser no reconoce formato, marcar `INCONCLUSIVE`, nunca inventar MATCH. Confirmación definitiva de descifrado/restore sigue separada.

**Estado:** S4 NO PASS; se espera resultado del cotejo. No modificar Supabase, Render, respaldos, claves ni S2; no usar Codex. Continuar documentación de error, causa y corrección verificada tras próximos marcadores.

---

## S4B — GPG NO_SECKEY y custodia S1A (23/11/2026)

**Evidencia nueva del PC:** `BT_SEC07_S4B_DIAG: START`, `BT_SEC07_S4B_GPG: SECRET_KEY_UNAVAILABLE`, `BT_SEC07_S4B_DIAG: COMPLETED`. El diagnóstico de GnuPG devolvió `NO_SECKEY` (clave secreta no disponible para el destinatario en el almacén consultado). **No demuestra** que la clave se haya perdido, que el respaldo v04 esté corrupto o que PostgreSQL haya fallado; no se llegó a restaurar.

**Revisión de evidencia ya documentada:** S1A registró `BT_SEC07_S1_IMPORTACION: PASS`, `BT_SEC07_S1_CANARY_RECUPERACION: PASS` y una custodia local `%LOCALAPPDATA%\\ByteTorque-Custodia-Criptografica-v1`, con almacén GPG aislado. Los procedimientos S4B anteriores invocaron `gpg.exe` sin `--homedir` ni `GNUPGHOME`, pudiendo usar el almacén predeterminado. Esta **discordancia de almacén es hipótesis probable, no causa todavía comprobada**.

**Corrección siguiente, acotada:** inspeccionar **solo metadatos locales de almacenes GPG existentes** bajo la custodia S1A (directorios `private-keys-v1.d` y registro `sec`), sin descifrar v04, crear llaves, importar secretos, copiar respaldos ni tocar producción. No imprimir rutas, identificadores ni huellas. Si se halla un almacén con clave privada, se debe confirmar después que la clave corresponde al destinatario del v04 y ejecutar el S4B usando explícitamente ese `--homedir`; si no aparece, revisar exportación privada protegida S1A con procedimiento autorizado. No repetir S2-R11; S4 permanece PENDIENTE. Registro de hecho, hipótesis, solución propuesta y verificación pendiente conforme a regla permanente.

---

## S4B — incidencia nueva de ejecución local (23/11/2026)

**Evidencia reportada por el propietario en PowerShell 5.1 (NO PASS):**
1. Primer intento: `BT_SEC07_S4B_INICIO: START` seguido de error Docker al acceder a `npipe:////./pipe/dockerDesktopLinuxEngine`: no existe la canalización / daemon Linux no disponible en esa ejecución. No se inició restauración; **no es fallo del backup**.
2. Intento posterior: `BT_SEC07_S4B_INICIO: START`, `BT_SEC07_S4B_STOP: GPG_DECRYPTION_FAILED`. La prueba original oculta el motivo detallado y **no demuestra corrupción de v04, falta de clave, contraseña incorrecta ni dependencia de Supabase**. No se obtuvo el primer error de `pg_restore`.
**Diagnóstico pendiente y solución propuesta no verificada:** no reejecutar el S4B completo; comprobar motor Linux Docker y aislar UNA operación GPG sobre el mismo v04, enviando salida binaria directamente a `Stream.Null`, clasificando solo `--status-fd 2`/exit code sin imprimir stderr, claves, rutas o datos. Si GPG funciona, revisar exclusivamente tubería/preparación de Docker; si no, resolver causa concreta de GPG. No repetir GPG/SHA/PGDMP/TOC estructurales S2-R11 de rutina ni generar otro respaldo. **S4 sigue PENDIENTE**.
**Regla de documentación:** conservar error y resultado exactos, separar hipótesis/solución/validación, y actualizar los mismos archivos con la causa comprobada cuando se obtenga. Solo documentación en `main`, `[skip render]`, sin deploy ni escritura Supabase.

---

## SEC07-S4B — Revisión independiente del método de restauración (23/11/2026)

- **Fuente y alcance:** investigación aportada por el propietario sobre PG17, Supabase, Docker y PowerShell 5.1. Es una revisión técnica para optimizar S4, **no evidencia de restauración ejecutada**.
- **Resultado anterior comprobado:** S2-R11 v04 GPG/SHA256/PGDMP/TOC PASS; S4A restauración detenida, clasificador demasiado amplio `SUPABASE_DEPENDENCY_OR_ROLE_MISSING`.
- **Defectos/riesgos identificados en el procedimiento anterior:** volumen `tmpfs` de PGDATA no garantizado explícitamente; entorno `postgres:17-alpine` no equivalente a Supabase; posible atasco si termina anticipadamente el consumidor stdin; no confundir códigos de salida GPG/Docker/Postgres; `--no-owner --no-acl` omite verificar propiedad y privilegios.
- **Corrección candidata entregada al propietario:** script S4B revisado (fecha 23/11), PGDATA y `/tmp` en `tmpfs`, Docker sin red/puertos/bind mounts, streams binarios PowerShell 5.1 y lectura concurrente de stderr, clasificación privada del primer `ERROR/FATAL`. Conserva v04 y no reexporta.
- **Hipótesis pendiente:** falta concretar primer error de la restauración antes de instalar/crear extensiones o roles; imagen compatible Supabase PG17 únicamente si el error lo demanda.
- **Validación real:** **PENDIENTE, sin marcadores S4B de Windows y sin `pg_restore` completo**. No declarar S4 PASS. Las verificaciones de S3 (Auth, Storage, Edge, Render, secretos y owners/ACL) siguen abiertas; tmpfs configurado no prueba por sí solo ausencia absoluta de trazas en el host.
- **Próxima acción única:** ejecutar una vez el procedimiento S4B ya revisado en PC personal, recibir solo `BT_SEC07_S4B_*`, corregir dependencia confirmada y hacer restauración integral consolidada. Registrar error, solución y resultado en estos cuatro documentos y un solo checkpoint final. Sin datos privados en logs/GitHub.
- **Regla establecida por el propietario:** registrar toda investigación, error y solución en `AGENTS.md`, `agent.md`, `roadmap.md` e incidentes SEC07, separando hipótesis, corrección y evidencia, sin duplicar auditorías.

---

## SEC07 S4H - continuidad y publicacion controlada (22/11/2026)

S4 integral PARCIAL. Respaldo manual PostgreSQL OPERATIVO; uso por el titular cada 2 dias, sin programacion automatica ni borrado. No reactivar S5C-R6 ni repetir pruebas de respaldo aprobadas.

Preparacion local S4H: guarda de autoridad para clientes pendientes tras logout/cambio de taller y CORS exacto para dominios canonicos. 24 casos nuevos PASS mediante adaptador Node sin red; Deno no disponible y runtime Edge pendiente. Esto no revoca access JWT copiados ni acredita cambios remotos. Mantener identidad confirmada, membresias activas, permisos y RLS.

Leer [procedimiento S4H](recovery/SEC07_S4H_INTEGRACION_SEGURA.md). Historicos inferiores conservados; sus instrucciones de automatizacion/exportacion no reactivan autorizaciones. Solo main, nunca push/deploy/migraciones automaticos. Render On Commit requiere pausa autorizada y verificada antes de publicar; skip render es defensa adicional. No publicar material privado ni copiar el ZIP completo.

---

## INC-S4-01 — Error SQL de dependencia al restaurar en PG17 Linux limpio [ABIERTO]
**Evidencia Windows S4A (21/11/2026):** `BACKUP S2_R11_VERIFIED`, `SHA256 PASS`, `DOCKER LOCAL_ENGINE`, `LAB ISOLATED_TMPFS_STARTED`, `ARCHIVE_HEADER PASS`, `GPG_INTEGRITY PASS`, `RESTORE_CLASS SUPABASE_DEPENDENCY_OR_ROLE_MISSING`, `STAGE RESTORE_RESULT`, `STOP ISOLATED_RESTORE_NOT_COMPLETE`.
**Lo que SÍ comprueba:** ciphertext v04 y manifest/hashes correctos, GPG íntegro, laboratorio iniciado, y comando de restauración SQL falló dentro de PostgreSQL17; archivo fuente no modificado según diseño. `--exit-on-error` detuvo en el primer fallo. La etiqueta broad no identifica cuál error.
**Lo que NO comprueba:** corrupción de respaldo, extensión específica, rol concreto, bug de PG17 ni backup restaurable. `--no-owner --no-acl` omite propietarios/permisos, y la lista artificial de roles creada en laboratorio no equivale a roles reales de Supabase. Requiere preparación más fiel del destino.
**Siguiente procedimiento:** S4B local aislar PRIMER ERROR pg_restore y clasificar en categorías sanitizadas (MISSING_ROLE/EXTENSION/FUNCTION/TYPE/RELATION/SCHEMA/PRIVILEGE/CONFLICT/OTHER), sin imprimir SQL, rutas, valores, nombres privados ni stdout textual. Sin red Docker, sin puertos ni mounts, solo /dev/shm; conserva fuente. Después crear reparación fundada y verificar. Supabase documentación sobre roles/extensiones y restauración: https://supabase.com/docs/guides/self-hosting/restore-from-platform y PostgreSQL17 pg_restore: https://www.postgresql.org/docs/17/app-pgrestore.html . [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S4A_RESTORE_DEPENDENCIA_PENDIENTE_20261121.md).

---

## INC-S2-02 / 03 — R11: solución verificada, cierre TOC cifrado (21/11/2026)
**Evidencia:** R11 `SOURCE V03_VERIFIED`, `SOURCE_HEADER BOM3_CONFIRMED`, `NEW_CIPHER CREATED`, `MAGIC PGDMP_OFFSET_ZERO`, `GPG_INTEGRITY PASS`, `LINUX_TOC PASS`, `SOURCE UNCHANGED`, `SHA256 PASS`, `MANIFEST CREATED`, `BACKUP ENCRYPTED_FINALIZED`, `FULL_RESTORE PENDING`, `RESULTADO PASS_BACKUP_AND_TOC`.
**Causa inmediata comprobada:** BOM UTF8 `EF BB BF` desplazaba `PGDMP` tres bytes y bloqueaba `pg_restore` (R8). **Solución comprobada:** flujo binario sin BOM compatible PS5.1 (temporal `Console.InputEncoding=UTF8Encoding(false)` anterior a `Process.Start`, luego restauración), eliminar sólo BOM conocido, cifrar nuevo artefacto v04, GPG integrity + Docker PG17 Linux TOC PASS, hash manifiesto. R9 contenía propiedad no disponible `StandardInputEncoding` verificada UNAVAILABLE en R10. NO afirmar que se haya aislado forensemente quién añadió el BOM original. **INC-S2-02 y corrección de compatibilidad INC-S2-03: RESUELTOS para índice/archivo nuevo v04.** S4 recuperación integral no comprobada y coberturas Supabase pendientes. [Checkpoint S2-R11](docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R11_BACKUP_CIFRADO_VALIDADO_20261121.md).

---

## INC-OPERACION-01 — Pegado accidental de líneas de resultados como comandos [RESUELTO EN INSTRUCCIONES, R11 PENDIENTE]
**21/11/2026:** el dueño pegó en `PS [ruta local privada omitida en copia para Git]` las etiquetas `BT_SEC07_S2_R10_INICIO: START`, `..._SOURCE`, `..._GPG_INTEGRITY`, `..._RESULTADO` en vez del script PowerShell R11. PowerShell contestó `CommandNotFoundException` porque son textos informativos, no cmdlets. No hay evidencia de escritura/DB/despliegue debido a estas etiquetas. **Solución comunicada:** cancelar entrada actual con Ctrl+C y ejecutar exclusivamente bloque fuente R11 que empieza `& {` y termina `}`; no pegar bloque de 'Resultado esperado'. R10 PASS mantiene validez y R11 no ha ejecutado según evidencia. **Prevención:** en instrucciones futuras separar y nombrar claramente 'copiar este código' versus 'resultados para compartir'; no pedir repetir pasos aprobados.

---

## INC-S2-02 / INC-S2-03 — R10 identifica y resuelve el bloqueo del TOC (21/11/2026)
**Marcadores de la prueba:** `R10_SOURCE V03_FOUND_UNIQUE`, `R9_PARTIAL ABSENT`, `DOTNET_PROPERTY UNAVAILABLE`, `STDIN UTF8_NO_BOM_AT_START`, `SOURCE_HEADER BOM3_PGDMP`, `GPG_INTEGRITY PASS`, `LINUX_TOC PASS`, `SOURCE_SHA256 UNCHANGED`, `PRODUCTION NOT_CONNECTED`, `FILES UNCHANGED`, `RESULTADO PASS_TOC_NO_NEW_FILE`.
**Causa inmediata CONFIRMADA:** prefijo `EF BB BF` antes de `PGDMP` rechaza formato custom en pg_restore; omitiendo exactamente el BOM en bytes y enviando flujo sin BOM a Docker Linux pg_restore --list, TOC fue válido. **INC-S2-03 confirmado**: propiedad `ProcessStartInfo.StandardInputEncoding` no disponible para Windows PS5.1/.NET Framework; R9 la utilizó incorrectamente. La mitigación `[Console]::InputEncoding=[Text.UTF8Encoding]::new($false)` antes de `Process.Start`, restablecida en finally, funcionó en R10. La causa raíz exacta del BOM original puede deberse a capa stdin/.NET y queda sin aislamiento forense total.
**Solución parcial VERIFICADA:** Lectura de contenido existente con BOM omitido y validación TOC bajo Linux Docker sin conexión a producción, sin escribir dump claro, sin cambios en los archivos cifrados. **Pendiente:** copia nueva cifrada v04 sin BOM verificando offset 0, GPG, TOC, SHA y manifiesto. En ese momento dar por resuelto artefacto de respaldo estructural; S4 restauración total y S3 componentes externos siguen abiertos. [Checkpoint R10](docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R10_LINUX_TOC_PASS_20261121.md).

---

## INC-S2-03 — R9 aborta al configurar stdin binario en Windows PowerShell 5.1 [ABIERTO, CAUSA PROBABLE DOCUMENTADA]
**Evidencia Windows:** `S2_R9_SOURCE V03_FOUND_UNIQUE`; `PRODUCTION NOT_CONNECTED`; `DOCKER LOCAL_ENGINE`; `KEY VERIFIED`; `STAGE CREATE_CLEAN_CIPHER`; `STOP LOCAL_ERROR_UNCLASSIFIED`; `RESULTADO STOP`; `EXISTING_FILES PRESERVED`.
**Causa probable basada en fuente independiente:** el script R9 introdujo `[Diagnostics.ProcessStartInfo].StandardInputEncoding`, miembro disponible en .NET moderno pero AUSENTE en .NET Framework, entorno Windows PowerShell 5.1. Referencia explícita: https://github.com/dotnet/msbuild/issues/15038 menciona falta de propiedad y origen BOM en stdin de .NET Framework; https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.processstartinfo.standardinputencoding lista implementación moderna. La salida anterior ocultó excepción, por tanto **no afirmar con certeza que ésta fuera la excepción local hasta confirmar en PC**. Error atribuible al script diseñado, no a los datos de ByteTorque.
**Prevención:** Nunca asumir API .NET moderno disponible en PowerShell 5.1. Antes de elegir propiedad revisar `GetProperties()` del tipo en entorno usuario. Mantener excepción sanitizada de tipo/fase sin mostrar rutas/clientes/secretos. Controlar BOM con codificación global de consola sin BOM temporalmente durante Process.Start, restaurando en finally; o mecanismo native pipe seguro.
**Siguiente:** sin DB ni nuevo pg_dump, verificar existencia eventual v04, evitar overwrite, validar TOC del v03 tras omitir BOM a través de Docker Linux con stream binario sin BOM; si PASS, construir v04 y verificar, manteniendo cifrado. 

---

## INC-S2-02 — R8: mismo BOM UTF-8 confirmado en ambos archivos [DIAGNÓSTICO CONFIRMADO / REPARACIÓN PENDIENTE]
**Marcadores Windows:** `BT_SEC07_S2_R8_ORIGINAL_GPG PASS`, `ORIGINAL_MAGIC_OFFSET 3`, `ORIGINAL_PREFIX_TYPE UTF8_BOM`, `ORIGINAL_SIZE BETWEEN_1KB_AND_1MB`; `DERIVED_GPG PASS`, `DERIVED_MAGIC_OFFSET 3`, `DERIVED_PREFIX_TYPE UTF8_BOM`, `DERIVED_SIZE BETWEEN_1KB_AND_1MB`; `PRODUCTION NOT_CONNECTED`, `FILES UNCHANGED`, `RESULTADO COMPARISON_COMPLETE`.
**Causa inmediata CONFIRMADA:** los dos archivos, incluso v03 cuyo R6 excluía el prefijo, contienen el BOM UTF8 `EF BB BF` justo antes del comienzo `PGDMP` del archivo custom, incompatible con la cabecera esperada por `pg_restore`. Explica el rechazo repetido, incluso antes de Docker. **Mecanismo a comprobar:** los scripts PowerShell 5.1 escribieron bytes por `Process.StandardInput.BaseStream`, pero `StandardInput` es `StreamWriter` y codificación predeterminada puede agregar BOM. [Microsoft Process.StandardInput](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.standardinput?view=netframework-4.8); [ProcessStartInfo.StandardInputEncoding](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.processstartinfo.standardinputencoding).
**Acción reparadora S2-R9 (PENDIENTE):** conservar original v02 y derivado v03, no nuevo pg_dump ni conexión DB, generar v04 desde v03 omitiendo exclusivamente UTF8 BOM ya identificado, con GPG stdin `StandardInputEncoding=[Text.UTF8Encoding]::new($false)`; comprobar primera posición PGDMP=0 al descifrar v04 e integridad GPG. Para eliminar posible efecto de stdin/seek Win32, verificar TOC con `pg_restore --list` dentro de contenedor PG17 Linux, sin red, sin volumen persistente, /dev/shm, igualmente stdin sin BOM. Si pasa, publicar ciphertext v04 con SHA256 y manifest `full_restore=NOT_ATTEMPTED`; si falla, preservar todos y documentar causa. S2 sólo estructural, aún sin restauración real, PC-only.

---

## INC-S2-02 — R7: magia inválida incluso en ciphertext derivado [ABIERTO]
**Evidencia Windows:** `S2_R7_CIPHERTEXT FOUND_UNIQUE`, `PRODUCTION NOT_CONNECTED`, `TOOLS READY`, `STAGE MAGIC_CHECK`, `STOP CLEAN_ARCHIVE_MAGIC_INVALID`, `FILES PRESERVED_IF_CREATED`.
**Hechos acreditados:** en R6 se omitieron 3 bytes antes de PGDMP en stdout de GPG original y se creó archivo cifrado derivado v03; R6 pasó descifrado/GPG pero no TOC. En R7 descifrar ese derivado no empieza con PGDMP. Docker fue lanzado pero terminó sin recibir dump validable; NO se ejecutó TOC Linux ni restauración real. No sabemos aún si hay prefijo que reaparece en cada ejecución GPG, si el texto cambia dentro del canal o si hay otro formato/corrupción.
**Decisión:** NO nuevo pg_dump, no regenerar claves, no editar/delete archivos cifrados, no repetir R7. Diagnóstico limitado LOCAL lectura sólo original y derivado: ubicación del primer PGDMP dentro de 96 bytes, clase de prefijo (BOM de UTF-8 u otro), longitud descifrada e integridad GPG; nada de bytes/SQL/rutas/secretos impresos. Solución confirmada sólo tras verificación independiente del archivo real. S2 continúa abierto.

---

## INC-S2-02 — R6: reparar prefijo de 3 bytes no resolvió TOC [ABIERTO]
**Evidencia Windows:** `S2_R6_PREFIX_BYTES: 3`, `MAGIC: PGDMP_FOUND`, `ORIGINAL_DECRYPT: PASS`, `NEW_ENCRYPTION: PASS`, `GPG_READBACK: PASS`, `TOC_ERROR_CLASS: OTHER`, `STAGE: VERIFY_NEW_ARCHIVE`, `STOP: PG_RESTORE_LIST_FAILED`, `FILES: PRESERVED`.
**Hechos:** derivación cifrada limpia generada, GPG la descifra completamente con integridad reportada. `pg_restore --list` sigue terminando no-cero aunque se retiró el prefijo original de 3 bytes. **El origen del prefijo y el resto del fallo son desconocidos**. Existe un informe histórico PostgreSQL Win32 sobre pipes no seekables, pero el parche fue marcado `Committed` en 2023, por lo que NO adjudicar este fallo al bug histórico sin evidencia: https://commitfest.postgresql.org/patch/4161/ .
**Acción mínima:** NO exportar/cifrar de nuevo, preservar original/derivado. Una lectura local del derivado para obtener únicamente tipo de error de `pg_restore` y GPG de forma sanitizada, comprobando que el binario Linux/Win32 pueda procesar PGDMP. Si estructura corrupta, planear backup nuevo con tubería binaria correctamente revisada y prueba restauración. Solución continúa PENDIENTE, no documentar cerrado.

---

## INC-S2-02 — R5 confirma firma PGDMP desplazada dentro del contenido descifrado [CORRECCIÓN PENDIENTE]
**Salida Windows:** `R5_ARCHIVO FOUND_UNIQUE`, `GPG_EXIT ZERO`, `CONTENT_TYPE PGDMP_WITH_PREFIX`, `PLAINTEXT_SIZE BETWEEN_1KB_AND_1MB`, `GPG_STATUS DECRYPTION_OKAY`, `GPG_INTEGRITY CONFIRMED`, `PRODUCTION NOT_CONNECTED`, `FILES UNCHANGED`, `RESULTADO CONTENT_CLASSIFIED`.
**Hecho confirmado:** el texto ASCII de los primeros 96 bytes contiene `PGDMP` pero no empieza con la firma en offset cero; los bytes cifrados se descifraron e integridad GPG pasó. Esto identifica la causa INMEDIATA del fallo de detección de formato de pg_restore (requiere PGDMP al comienzo). **La causa raíz del preámbulo es aún desconocida.** No deducir de ahí que el payload sea íntegramente restaurable.
**Plan reparación:** no contactar producción ni descargar nuevamente; crear derivado cifrado v03 mediante streaming desde GPG descifrado, descartando sólo los bytes antes del primer `PGDMP` hallado en los 96 iniciales; originales nunca sobrescritos. Confirmar descifrado completo GPG (exit/status), GPG cifrado nuevo exit0, y validación pg_restore TOC exit0 sobre derivado sin escribir plaintext al disco. Crear manifiesto SHA-256 sólo tras PASS y marcar `restore=NOT_ATTEMPTED`. Si falla, preservar archivos y registrar marcadores. No instalar herramientas nuevas. 
**Estado:** S2 pendiente de verificación; no se declara respuesta final hasta Windows PASS.

---

## INC-S2-02 — Actualización R4: la cabecera descifrada no comienza con PGDMP [ABIERTO]
**Salida Windows comunicada:** `S2_R4_PARTIAL FOUND_UNIQUE`, `PRODUCTION NOT_CONNECTED`, `ARCHIVE_MAGIC NOT_PGDMP`, `STOP ARCHIVE_MAGIC_INVALID`, `FILES PRESERVED`.
**Hecho:** los primeros cinco bytes leídos por la tubería GPG no fueron iguales a la firma PGDMP, o la lectura devolvió menos de cinco bytes (ambas situaciones se agrupaban en el mismo marcador). R3 GPG exit0 y pg_restore exit nonzero. Esta evidencia explica falta de TOC, no demuestra aún si decrypted es vacío, SQL, comprimido, contaminado o hay un problema de redirección.
**Próxima corrección mínima:** una sola inspección local de stdout descifrado del MISMO `.partial`, capturando hasta 96 bytes exclusivamente en memoria, drenando el resto sin almacenarlo, sin mostrar contenido, clasificando firma + longitud y validando status/exit de GPG. No conectarse a DB, no repetir pg_dump, no copiar claves ni escribir datos claros. Conclusión/solución sólo después de la evidencia. **Estado:** ABIERTO, S2 SIN CERTIFICAR.

---

## INC-S2-02 — Actualización R3: GPG EXIT ZERO, pg_restore EXIT NONZERO [ABIERTO]
**Evidencia Windows:** `BT_SEC07_S2_R3_PARTIAL: FOUND_UNIQUE`, `PRODUCTION: NOT_CONNECTED`, `TOOLS: AVAILABLE`, `GPG_EXIT: ZERO`, `TOC_EXIT: NONZERO`, `STAGE: CHECK_EXITS`, `STOP: PG_RESTORE_TOC_EXIT_FAILED`, `FILES: PRESERVED_NO_DELETION`.
**Interpretación:** el archivo cifrado existe y GPG lo descifró con exit0. Falló pg_restore --list. No hay prueba TOC válida, manifest ni restauración. El fallo por tubería cerrada fue hipótesis, no solución confirmada; el diseño R3 drenó GPG stdout aun si pg_restore salió, y de todos modos pg_restore devolvió código distinto de cero. La causa exacta permanece pendiente.
**Continuación segura:** una inspección local de la firma `PGDMP` (5 bytes leídos en memoria, nunca mostrados), estado criptográfico `DECRYPTION_OKAY`, y clasificación sanita de error de pg_restore con `--list`, sin tocar DB/archivos, sin imprimir mensajes sin filtrar ni datos. Registrar causa comprobada y FIX cuando sea posible; no reexportar a ciegas. [Manual PostgreSQL17](https://www.postgresql.org/docs/17/app-pgrestore.html) permite entrada estándar.

---

## INC-S2-02 — Archivo cifrado creado, verificación TOC falló [ABIERTO]
**Fecha:** 2026-11-21. Salida Windows reportada:
```text
BT_SEC07_S2_R2_TLS: CLIENT_VERIFY_FULL_PASS
BT_SEC07_S2_R2_DATABASE: POSTGRES17_VERIFIED
BT_SEC07_S2_R2_TRANSACTION: READ_ONLY_PASS
BT_SEC07_S2_R2_ENCRYPTED_DUMP: PASS
BT_SEC07_S2_R2_STAGE: ARCHIVE_TOC_READBACK
BT_SEC07_S2_R2_STOP: ARCHIVE_TOC_READBACK_FAILED
BT_SEC07_S2_R2_RESULTADO: STOP
BT_SEC07_S2_R2_PARTIAL: PRESERVED_IF_CREATED
```
**Interpretación demostrada:** Pg dump y cifrado emitieron exit0 y archivo cifrado `.partial` no vacío (>1 KiB), bajo condiciones TLS/DB/read-only verificadas para preflight. No se confirma descifrado de `.partial`, contenido TOC, integridad del dump completo ni posibilidad de restauración. No se creó manifiesto ni se conectó una base de restauración.
**Hipótesis — NO CAUSA CONFIRMADA:** el lector `pg_restore --list` podría cerrar su stdin tras leer TOC, antes de que GPG haya terminado de escribir el archivo completo; el `BaseStream.CopyTo` del script considera cualquier excepción de tubería falla. También podría fallar GPG, pg_restore o el formato, porque el antiguo STOP agrupó estas causas.
**Plan de corrección mínimo:** NO descargar, borrar ni crear nuevamente respaldo. Escoger únicamente `*.dump.gpg.partial` de S2-R2 sin colisiones, descifrar directamente desde ese archivo de forma local y canalizarlo a `pg_restore --list`, drenando por completo stdout de GPG aunque pg_restore termine y cierre entrada. Exigir GPG exit0, evidencia DECRYPTION_OKAY, pg_restore exit0, TOC reconocible; luego hash SHA256 y renombrar sin reemplazos, crear manifiesto `restore=NOT_ATTEMPTED`. Si falla reportar etapa y estado de cada proceso sin mostrar archivos, claves, rutas, nombres de tablas o stderr. 
**Estado:** solución NO VERIFICADA aún. La causa concreta se documentará tras resultado Windows. Sin modificar producción, S1/S0 intactos, política PC-only vigente.

---

# ByteTorque SEC-07 — Registro de incidentes operativos de seguridad

**Fecha de apertura:** 2026-11-21 · **Rama:** main. Archivo público: no registrar material secreto ni rutas/identificadores internos innecesarios.

## Política obligatoria de errores y correcciones
- Cada STOP debe asociarse a etapa, marcador BT_SEC07, impacto y acciones ejecutadas (incluidas las que NO se ejecutaron).
- Registrar **causa comprobada** separada de hipótesis: NO declarar una hipótesis como solución. Proponer corrección mínima, confirmar resultado Windows y anotarlo luego como verificado.
- Documentar en este registro y actualizar `AGENTS.md`, `agent.md` y `roadmap.md` **cuando se constate la solución**. Evitar checkpoints por cada comando; sí al cerrar hitos.
- No repetir scripts enteros tras STOP que pueda haber creado archivos parciales. No sobrescribir respaldos, llaves o exports. PowerShell completo INLINE.
- Evitar compartir contraseñas, datos personales, SQL claro, huellas privadas o rutas sensibles por chat/GitHub.

## INC-S2-01 — Preflight PostgreSQL S2 devuelve FAIL [ABIERTO]
**Evidencia local reportada:**
```text
BT_SEC07_S2_STAGE: TLS_READ_ONLY_CONNECT
BT_SEC07_S2_STOP: IDENTIDAD_O_SOLO_LECTURA_INCORRECTA
BT_SEC07_S2_RESULTADO: STOP
BT_SEC07_S2_PARTIAL_FILES: PRESERVED_IF_CREATED
```

**Alcance acreditado:** el cliente `psql` finalizó con exit 0 según la rama del script y devolvió un valor diferente de `PASS` esperado. El script combinaba tres condiciones en un único `CASE`: `current_database()='postgres'`, `default_transaction_read_only='on'`, `server_version_num` dentro de PG17; no imprimió el resultado desglosado. No se inició `pg_dump`, no se creó respaldo S2 y no se modificó producción. La discrepancia de nombre del certificado CA de Descargas no explica este STOP (se habría detenido antes o fallado la validación TLS).

**Hipótesis, NO causa demostrada:** el ajuste `PGOPTIONS='-c default_transaction_read_only=on'` puede no reflejar el valor de `default_transaction_read_only` esperado en el pooler de sesión. Tampoco se ha excluido diferencia en base o versión.

**Corrección propuesta (PENDIENTE WINDOWS):** evitar depender del estado `default_transaction_read_only` heredado o de `PGOPTIONS`; ejecutar `BEGIN TRANSACTION READ ONLY` explícito y comprobar `transaction_read_only=on`, nombre de BD y versión de forma separada. Si eso pasa, generar un nuevo backup PG17 cifrado por stream binario, con `pg_dump` y GPG, sin escribir claro ni tocar producción. Mantener TLS `verify-full`, fallo cerrado y sin credenciales en argv.

**Prueba de verificación pendiente:** marcadores `BT_SEC07_S2_*` sobre PC que confirmen identidades/lectura, GPG, cifrado, integridad y TOC. Solución se documentará como confirmada solo después del resultado real.

## INC-S1-01 — Variable automática de PowerShell [CORREGIDO]
En PowerShell 5.1 `$home` equivale a la variable automática protegida `$HOME`, por insensibilidad a mayúsculas. Causa comprobada del `SessionStateUnauthorizedAccessException`. Corrección: utilizar `$gpgHome` y conservar árbol S1 existente sin recrearlo. Verificación: posterior `PASS_PRIMARY_KEY` y `PASS_LOCAL_ONLY` en S1A.

## Riesgo residual deliberado
El propietario eliminó copias USB/exteriores y aceptó respaldo solo en su PC. No afirmar recuperación frente a pérdida/ransomware total del PC ni 3-2-1 cumplida. S2/S4 deben avanzar sin exigir USB.
