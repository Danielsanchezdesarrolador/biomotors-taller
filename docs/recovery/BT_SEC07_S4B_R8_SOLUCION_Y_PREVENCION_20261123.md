# ByteTorque — SEC-07 S4B-R8: solución comprobada, trayectoria de incidentes y prevención

**Fecha de recuperación:** 23/11/2026 (evidencia aportada por titular desde PowerShell 5.1). **Rama permitida:** `main`. **Naturaleza:** guía pública sanitizada: no contiene claves, rutas Windows privadas, datos de clientes ni SQL del dump. **Estado:** restauración PostgreSQL del archive v04 = **PASS**; recuperación funcional integral S4 = **PENDIENTE**.

## 1. Punto de partida que NO debe repetirse

- S0: estructura de resguardos, ACL Windows y carpetas = PASS local.
- S1A: nuevas claves GPG, exportación protegida y recuperación de canary = PASS local.
- S2-R11: respaldo `*_nobom_v04.dump.gpg`, `PGDMP` offset 0, GPG, SHA-256/manifiesto e índice TOC PostgreSQL 17 = PASS estructural. El v04 **no estaba dañado** según estas pruebas, y R8 después demostró que podía restaurarse.
- Continuidad de recuperación: **usar ese mismo v04 y el `GNUPGHOME` S1A validado**; no reexportar, regenerar claves ni repetir pruebas cerradas. Nunca poner respaldo, manifiesto sensible, clave privada o contraseñas en GitHub/chat.

## 2. Secuencia real de fallos y correcciones

| Hito | Evidencia/obstáculo | Solución o aprendizaje, distinguiendo certeza |
|---|---|---|
| S4B inicial: `NO_SECKEY` / falso `GPG_DECRYPTION_FAILED` | Almacén GPG consultado sin la clave y diagnóstico que podía confundir un pipe cerrado con fallo GPG | Localizar almacenes S1A por metadatos, seleccionar `GNUPGHOME` y usar `gpg --homedir` explícito. Se confirmó descifrado del v04 por prueba GPG aislada; no usar un keyring predeterminado no verificado. Priorizar errores de Docker/`pg_restore` frente a atribuirlos a GPG. |
| R2: `INIT_FAILED` | Se observó `su-exec: not found` al usar `postgres:17-alpine`; `initdb` nunca corrió | El ejecutor de esa imagen era `gosu`. **Causa demostrada** de ese fallo. Mejor aún, para Supabase no usar `initdb` manual si se necesitan migraciones/roles de la imagen. |
| R3: `DOCKER_START_FAILED` | Script shell compactado al sustituir saltos de línea por espacios, rompiendo sintaxis `if/case` | Conservar las líneas POSIX, transportarlas como UTF-8 Base64 y ejecutar con `base64 -d | /bin/sh`. Defecto estático demostrado; stderr de la ejecución no se conservó, así que no asegurar causalidad exclusiva. |
| R4: `RESTORE_TOOL_OR_STREAM_ERROR` | `pg_restore` recibió `-` posicional final y clasificador ignoraba `pg_restore: error:` minúsculo | **No pasar `-` como archivo**; omitir archivo para leer stdin. Clasificar stderr de herramienta y PostgreSQL, no solo `ERROR:` en mayúsculas. Corrección de diseño revisada; error histórico exacto no recuperado. |
| R5: `MISSING_EXTENSION` | `postgres:17-alpine` podía carecer de extensiones utilizadas por Supabase | Usar imagen compatible fijada `supabase/postgres:17.6.1.136`, no instalar extensiones improvisadas. La categoría indica primer patrón detectado, no nombre exacto de extensión. |
| R6: `MISSING_ROLE` | Imagen Supabase iniciada mediante `initdb` directo, omitiendo bootstrap de migraciones y roles estándar | Usar `docker-entrypoint.sh` y su inicialización oficial; comprobar `anon`, `authenticated` y `service_role`; restaurar en BD nueva `bt_s4` creada desde `template0`. Causa altamente probable; rol faltante en R6 no fue identificado. No crear cuentas superusuarias de aplicación arbitrariamente. |
| R7: `BOOTSTRAP_FAILED` | `--read-only` chocaba con el requisito de generar `/etc/postgresql-custom/pgsodium_root.key` | R8 retiró **solo** `--read-only`, sin montar `tmpfs` encima de `/etc/postgresql-custom`; mantuvo `tmpfs` PGDATA/`/tmp`/socket, laboratorio sin red y sin puertos. **R8 PASS confirma la solución operativa**, no causa forense única de R7: los logs efímeros de R7 se perdieron. |
| R8: **`RESTORE_PASS`** | `LAB READY`, `RESTORE_EXIT 0`, `GPG PASS`, `CATALOG CHECK_PASS` | Bootstrap oficial; flujo GPG binario→Docker stdin/FD3→`pg_restore` sin archivo posicional, `--exit-on-error --single-transaction --no-owner --no-acl`; catálogo no vacío y contenedor sale 0. **Restauración técnica acreditada.** |

## 3. Procedimiento de referencia verificado (arquitectura del R8, sin secretos)

1. Abrir Docker Desktop y **usar Windows PowerShell 5.1** donde el `GNUPGHOME` S1A correcto ya está seleccionado. Confirmar que `docker.exe`, `gpg.exe` e imagen `supabase/postgres:17.6.1.136` están disponibles. El ejecutor real R8 se entregó **inline en el chat del 23/11**, no se publica aquí porque contiene lógica de manipulación de respaldo real y la guía no pretende autorizar una reejecución.
2. Seleccionar el cifrado v04 correcto `*_nobom_v04.dump.gpg`, no v02/v03 ni copia histórica. Reutilizar manifest y hash ya validados; **no regenerar el backup**.
3. Contenedor `docker run --rm -i --pull=never --log-driver none --network none`, sin `-p` ni montajes de directorios. Usar `--tmpfs` para `/var/lib/postgresql/data` (PGDATA), `/tmp` y `/var/run/postgresql`; **no imponer `--read-only` al rootfs de esta imagen en este diseño** porque bloquea escritura de bootstrap de pgsodium. La capa de Docker puede dejar huellas transitorias en disco host; no prometer ausencia total.
4. Arrancar con el **`docker-entrypoint.sh` propio de Supabase**, no `initdb` directo, esperar marca de init scripts completados y corroborar roles estándar sin `BYPASSRLS` para `authenticated`. Solo entonces emitir `LAB:READY`. Crear BD `bt_s4` desde `template0`, distinta de `postgres` del bootstrap.
5. Descifrar con GPG `--homedir` explícito y pasar bytes con `BaseStream.CopyTo` a la entrada estándar de Docker, utilizando FD3 para separar stdin del ejecutor shell; no volcar SQL/PGDMP plano al disco del PC. `pg_restore` sin `-` final, con `--exit-on-error --single-transaction --no-owner --no-acl`. Consumir stdout/stderr de procesos y comprobar sus códigos.
6. Confirmar juntos `RESTORE_EXIT:0`, GPG `DECRYPTION_OKAY` + exit 0, Docker exit 0, ausencia de error de pipe y consulta de catálogo con al menos una tabla fuera de esquemas sistema. Etiquetar `RESTORE_PASS` **solo si todos concurren**; un TOC válido, `LAB:READY` o catálogo positivo aislados NO son PASS.
7. Con `--rm` el laboratorio es desechable y desaparece: registrar únicamente resultados sanitizados, nunca logs con SQL/nombres privados ni valores. La clave `pgsodium` generada es temporal del laboratorio, no la clave productiva de Supabase.

**Evidencia literal comunicada por titular:**
```text
BT_SEC07_S4B_R8: START
BT_SEC07_S4B_R8_LAB: READY
BT_SEC07_S4B_R8_RESTORE_EXIT: 0
BT_SEC07_S4B_R8_GPG: PASS
BT_SEC07_S4B_R8_CATALOG: CHECK_PASS
BT_SEC07_S4B_R8_RESTORE: PASS
BT_SEC07_S4B_R8_RESULT: RESTORE_PASS
```

## 4. Prevención: reglas obligatorias para nuevos trabajos

- **No cambiar un motor PostgreSQL genérico por uno Supabase sin revisar el entrypoint, extensiones, roles, config y rutas escribibles.** Fijar tag y documentar cualquier modificación. Evitar copiar instrucciones de imagen distinta (`gosu`/`su-exec`).
- **No modificar bytes binarios** con transformaciones de texto, BOM, codificación automática ni redirecciones PowerShell de strings; pasar `BaseStream` y preservar saltos de línea shell con Base64. Usar solo propiedades existentes en .NET Framework / PS5.1.
- **Diferenciar fallos por fase**: preparación/arranque laboratorio, descifrado, transporte, `pg_restore`, consulta catálogo. Reportar primera clase sanitizada y detener ante STOP; no inventar causas ni reintentar sin cambio fundamentado.
- No imprimir rutas privadas, IDs de destinatario, stdout SQL, datos, logs sin censura, contraseñas. No exponer red ni volumen persistente del laboratorio, no escribir producción; los checks en ambiente aislado son separados de auditorías en remoto.
- **No confundir restauración técnica con recuperación íntegra**: R8 usó `--no-owner --no-acl` y solo verificó una o más tablas, **no** roles/privilegios efectivos, filas esperadas, FK/índices, RLS ni aislamiento entre talleres A/B. Auth operativa, Storage binario, Edge, secretos y Render tampoco quedan recuperados por este dump.
- No repetir R5/R6/R7/R8 por rutina. Como `--rm` ya destruyó el laboratorio, **una futura comprobación profunda exigirá reconstruir una sola vez el laboratorio con los controles anexados durante esa ejecución**. No ejecutar otra restauración aislada que solo repita R8. La siguiente etapa debe cerrar en un mismo ciclo estructura, datos y aislamiento A/B o registrar exactamente los bloques no certificables.
- La decisión de respaldos solo en PC continúa vigente. No imponer dispositivos USB, pero tampoco decir que la copia protege frente a robo, daño total o ransomware simultáneo del PC.
- Repo `main` exclusivamente, sin Codex innecesario ni nuevos deploys/SQL alojado por documentar. `[skip render]` en cada commit documental; un solo checkpoint al cerrar validación siguiente.

## 5. Estado y próximo criterio de salida

**Hito ya cerrado:** S4B-R8 **PASS de restauración técnica** del backup v04. **No ejecutar nuevamente R8.**

**Próximo paso S4C (PENDIENTE, NO EJECUTADO):** un procedimiento de laboratorio que restaure **una sola vez** el v04 y, antes de destruir el contenedor, verifique con evidencias sanitizadas los conteos/agregados esperados, cobertura de estructura/índices/FK, políticas RLS, permisos efectivos y pruebas negativas multiempresa A/B usando identidades no privilegiadas y contexto realista de la aplicación; no inferir éxito A/B únicamente de `pg_roles` ni de `--no-owner --no-acl`. Separar lo no recuperable por `pg_dump` (S3). No utilizar ni revelar identidades reales de clientes. Aprobación S4 global solo después de criterios verificables, sin repetir baterías cerradas.

**Referencias internas:** [Checkpoint R8](../checkpoints/CHECKPOINT_BT_SEC07_S4B_R8_RESTAURACION_TECNICA_PASS_20261123.md), [Checkpoint S2-R11](../checkpoints/CHECKPOINT_BT_SEC07_S2_R11_BACKUP_CIFRADO_VALIDADO_20261121.md), [Registro de incidentes](../BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).

## Anexo: S4C-R9 posterior a R8 — resultado limitado (23/11/2026)

El propietario ejecutó S4C-R9 con el mismo v04 en un laboratorio nuevo y obtuvo `LAB READY`, `RESTORE_EXIT 0`, `GPG PASS`, `STRUCTURE PASS`, `RLS WORKSHOPS_AB_PASS_LAB_GRANT`, `ACL NOT_CERTIFIED_NO_ACL_RESTORE`, `RESULT CHECK_PASS_LIMITED`. No hubo conexión ni cambios a producción. La prueba confirmó presencia de 12 tablas, banderas RLS, mínimas relaciones y lectura A permitida/B denegada en `public.workshops` con grants *temporales* introducidos en laboratorio. No extrapolar a las ACL reales ni otras tablas/operaciones. Por ser `--rm`, el lab fue destruido. **No repetir S4C-R9 como rutina.** La recuperación integral S4 y coberturas S3 continúan abiertas. [Checkpoint S4C](../checkpoints/CHECKPOINT_BT_SEC07_S4C_R9_VALIDACION_LIMITADA_PASS_20261123.md).
