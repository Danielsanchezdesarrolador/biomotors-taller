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
