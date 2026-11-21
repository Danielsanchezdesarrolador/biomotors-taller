## INC-S2-02 / 03 — R11: solución verificada, cierre TOC cifrado (21/11/2026)
**Evidencia:** R11 `SOURCE V03_VERIFIED`, `SOURCE_HEADER BOM3_CONFIRMED`, `NEW_CIPHER CREATED`, `MAGIC PGDMP_OFFSET_ZERO`, `GPG_INTEGRITY PASS`, `LINUX_TOC PASS`, `SOURCE UNCHANGED`, `SHA256 PASS`, `MANIFEST CREATED`, `BACKUP ENCRYPTED_FINALIZED`, `FULL_RESTORE PENDING`, `RESULTADO PASS_BACKUP_AND_TOC`.
**Causa inmediata comprobada:** BOM UTF8 `EF BB BF` desplazaba `PGDMP` tres bytes y bloqueaba `pg_restore` (R8). **Solución comprobada:** flujo binario sin BOM compatible PS5.1 (temporal `Console.InputEncoding=UTF8Encoding(false)` anterior a `Process.Start`, luego restauración), eliminar sólo BOM conocido, cifrar nuevo artefacto v04, GPG integrity + Docker PG17 Linux TOC PASS, hash manifiesto. R9 contenía propiedad no disponible `StandardInputEncoding` verificada UNAVAILABLE en R10. NO afirmar que se haya aislado forensemente quién añadió el BOM original. **INC-S2-02 y corrección de compatibilidad INC-S2-03: RESUELTOS para índice/archivo nuevo v04.** S4 recuperación integral no comprobada y coberturas Supabase pendientes. [Checkpoint S2-R11](docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R11_BACKUP_CIFRADO_VALIDADO_20261121.md).

---

## INC-OPERACION-01 — Pegado accidental de líneas de resultados como comandos [RESUELTO EN INSTRUCCIONES, R11 PENDIENTE]
**21/11/2026:** el dueño pegó en `PS C:\\Users\\...` las etiquetas `BT_SEC07_S2_R10_INICIO: START`, `..._SOURCE`, `..._GPG_INTEGRITY`, `..._RESULTADO` en vez del script PowerShell R11. PowerShell contestó `CommandNotFoundException` porque son textos informativos, no cmdlets. No hay evidencia de escritura/DB/despliegue debido a estas etiquetas. **Solución comunicada:** cancelar entrada actual con Ctrl+C y ejecutar exclusivamente bloque fuente R11 que empieza `& {` y termina `}`; no pegar bloque de 'Resultado esperado'. R10 PASS mantiene validez y R11 no ha ejecutado según evidencia. **Prevención:** en instrucciones futuras separar y nombrar claramente 'copiar este código' versus 'resultados para compartir'; no pedir repetir pasos aprobados.

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
