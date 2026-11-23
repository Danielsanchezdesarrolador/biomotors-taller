# ByteTorque — Traspaso de S4B-R4 a revisión técnica Astra

**Fecha:** 2026-11-23. **Repo:** `Danielsanchezdesarrolador/biomotors-taller`; **rama autorizada:** `main`. **Alcance:** investigación y propuesta; NO ejecutar cambios ni publicar código.

## Evidencia cronológica real aportada por propietario (Windows PowerShell 5.1)

- S2-R11 respaldo cifrado `*_nobom_v04.dump.gpg`: GPG integridad, SHA-256, PGDMP offset 0 y TOC PostgreSQL 17 Linux **PASS estructural**; no repetir.
- S4A: `SUPABASE_DEPENDENCY_OR_ROLE_MISSING`, etiqueta amplia y no probatoria de dependencia.
- S4B inicial: Docker Engine pipe no disponible, posteriormente GPG `NO_SECKEY` usando keyring equivocado.
- Custodia S1A: dos almacenes de claves privadas; ambos coinciden por key-id con destinatario v04.
- `BT_SEC07_S4B_ISOLATED: GPG_PASS` usando `$env:GNUPGHOME` explícito, sin Docker y descifrando hacia Stream.Null. No reabrir investigación GPG sin evidencia nueva.
- S4B-R2: `INIT_FAILED`, causa comprobada `su-exec: not found`; cambiar `su-exec` a `gosu`.
- S4B-R3: `DOCKER_START_FAILED`; el script aplastó saltos de línea a espacios sin `;`, defecto estático comprobado.
- **S4B-R4 (último resultado):**
  ```text
  BT_SEC07_S4B_R4: START
  BT_SEC07_S4B_R4_LAB: READY
  BT_SEC07_S4B_R4_FIRST_ERROR: RESTORE_TOOL_OR_STREAM_ERROR
  BT_SEC07_S4B_R4_RESULT: RESTORE_NOT_COMPLETE
  ```
  El clúster temporal logró `initdb`, `pg_ctl`, `createdb` y emitió READY. `pg_restore` devolvió código distinto de cero y la búsqueda de `ERROR:|FATAL:` no encontró coincidencia. No hay evidencia de extensión/rol faltante; no afirmar restore PASS.

## Estructura esencial exacta de S4B-R4 entregada al propietario

- Image `postgres:17-alpine` **local** `--pull=never`, `--network none`, `--read-only`, `--tmpfs /var/lib/postgresql/data:rw,nosuid,size=1024m`, `--tmpfs /tmp:rw,nosuid,size=256m`; sin puertos ni bind mounts; `--rm -i`.
- Script POSIX `$linux` codificado Base64 en argumento Docker; comando de entrada:
  ```sh
  exec 3<&0; printf %s <BASE64_DEL_SCRIPT> | base64 -d | /bin/sh
  ```
  El texto script se decodifica en pipe; PG dump GPG se envía por stdin del proceso Docker, que el script redirige desde FD 3.
- En script Linux:
  ```sh
  set -u
  grep -q ' /var/lib/postgresql/data tmpfs ' /proc/mounts || exit 20
  grep -q ' /tmp tmpfs ' /proc/mounts || exit 21
  command -v gosu >/dev/null 2>&1 || exit 22
  chown postgres:postgres /var/lib/postgresql/data
  chmod 700 /var/lib/postgresql/data
  gosu postgres initdb -D /var/lib/postgresql/data --auth-local=trust --auth-host=reject >/tmp/init.log 2>&1
  gosu postgres pg_ctl -D /var/lib/postgresql/data -o '-c listen_addresses= -c unix_socket_directories=/tmp' -w start >/tmp/start.log 2>&1
  gosu postgres createdb -h /tmp -U postgres bt_s4 >/tmp/create.log 2>&1
  echo BT_SEC07_S4B_R4_LAB:READY
  if gosu postgres pg_restore -h /tmp -U postgres -d bt_s4 --exit-on-error --no-owner --no-acl - <&3 >/tmp/restore.out 2>/tmp/restore.err; then
      echo BT_SEC07_S4B_R4_RESTORE:PASS
      exit 0
  fi
  first=$(grep -m1 -E 'ERROR:|FATAL:' /tmp/restore.err || true)
  category=OTHER_OR_UNCLASSIFIED
  # case first clasificando extensión, rol, schema, function, type, relation, permisos, conflicto, shared library, config
  case $first in
      '') category=RESTORE_TOOL_OR_STREAM_ERROR ;;
  esac
  echo BT_SEC07_S4B_R4_FIRST_ERROR:$category
  exit 28
  ```
- PowerShell inicia Docker por `ProcessStartInfo`, lee un `ReadLineAsync()` esperando marcador `LAB:READY` antes de abrir GPG. Después GPG con:
  ```powershell
  $gi.Arguments = '--homedir "' + $env:GNUPGHOME + '" --status-fd 2 --decrypt "' + $picker.FileName + '"'
  $gp.StandardOutput.BaseStream.CopyTo($dp.StandardInput.BaseStream)
  ```
  Se lee stderr de Docker y GPG concurrentemente con `ReadToEndAsync`, no se imprime texto bruto; si pipe se cierra se drena GPG a `Stream.Null`. PowerShell prioriza `FIRST_ERROR` antes de evaluar si GPG terminó bien. Docker es destruido con `--rm` y los logs /tmp desaparecen.

## Hallazgo de revisión estática adicional (NO verificado en PC)

El clasificador `grep -m1 -E 'ERROR:|FATAL:' /tmp/restore.err` **no reconoce** por ejemplo `pg_restore: error: ...` en minúscula, mensaje habitual del propio cliente. Por lo tanto `RESTORE_TOOL_OR_STREAM_ERROR` es una etiqueta de fallo de clasificación, **NO una causa real**, y es incorrecto deducir corrupción, roles Supabase, ausencia de clave o falta de stdin.

Astra debe investigar especialmente:
1. `pg_restore` formato custom por stdin con opción final `-`; posibles fallos del propio cliente sin `ERROR:`; formato de mensajes de PostgreSQL 17.
2. Herencia y uso de FD 3 al introducir `/bin/sh` desde pipeline `base64 -d`; validez de `<&3` en subproceso `gosu`. ¿Puede perderse/cerrarse o consumir stdin equivocadamente?
3. Posible necesidad de `--single-transaction` y límites (solo para restauración definitiva compatible; no afirmar RLS/ACL PASS con `--no-owner --no-acl`).
4. Prioridad de códigos de proceso, transmisión binaria PowerShell 5.1 y secreto GPG; si se exige diagnóstico, **solo una ejecución final consolidada**, categoría sanitizada capturada sin SQL/nombres privados/rutas/filas.
5. Falta de equivalencia de la imagen genérica PG17 Alpine con Supabase. **No cambiar imagen hasta identificar fallo real**, salvo evidencia técnica.

## Instrucciones de resultado para Astra

**No ejecutar nada, no modificar GitHub/Render/Supabase, no pedir v04 ni secretos.** Revisar estáticamente el procedimiento, contrastar con documentación oficial actualizada y entregar: causa o hipótesis con confianza explícita, errores concretos del script, propuesta única de S4B-R5 completa y autocontenida compatible con PowerShell 5.1, prevalidación estática del shell/stream en la medida posible, salida sanitizada y criterios para STOP/PASS. No generar una quinta serie de pruebas, scripts de diagnóstico sueltos o subetapas artificiales. No prometer que un PG restore sin ACL ni services externos es S4 integral. El usuario compartirá el informe en el chat principal antes de cualquier nueva ejecución.

**Próximo paso:** revisión independiente por Astra; ejecución local suspendida. Registro principal `docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md`. Mantener rule global de registrar investigación/errores/soluciones verificados en `AGENTS.md`, `agent.md`, `roadmap.md` e incidentes. S4 PENDIENTE.
