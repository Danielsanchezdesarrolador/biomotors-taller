# CHECKPOINT — BT-SEC07-ARCHIVE-TOC-V2-19: TOC no legible con pg_restore de Windows (20/11/2026)

**Rama única:** main · **sistema afectado:** diagnóstico offline de extensiones, **NO** el backup/producción · **estado:** causa exacta aún no identificada; V2 preparado sin ejecución real Windows.

## Salida real recibida del propietario

```text
BT_SEC07_DOCKER: READY
BT_SEC07_EXISTING_SNAPSHOT: INTEGRITY_VERIFIED_NO_CHANGES
BT_SEC07_LOCAL_PG17: VERIFIED
BT_SEC07_STOP: ARCHIVE_TOC_NOT_READABLE
DIAG_EXIT_CODE: 2
BT_SEC07_GPG_CONFIGURATION: RESTORED
```

Antes, el inventario V1 informó `BT_SEC07_PACKAGE: VERIFIED`, `Ran 16 tests ... OK`, `BT_SEC07_TESTS: OK`, `BT_SEC07_EXISTING_SNAPSHOT: INTEGRITY_VERIFIED_NO_CHANGES` y `DOCKER_LINUX_NOT_READY`; propietario precisó que no había abierto Docker Desktop. Después de abrirlo, Docker Linux pasó. **La causa Docker se resolvió al arrancar la aplicación; no reinstalar ni descargar imágenes.**

**Interpretación a partir del código EXACTO del ZIP V1 SHA256 `7e3a0a2a16d5d92ec5a2155ff041ab63db5bf4e54aa6d635b834e76c280536f9`:** `inventory_archive` invoca `pg_restore --list` **en Windows** sin archivo, con stdin binario de GPG; su stderr se envía a `DEVNULL`. `ARCHIVE_TOC_NOT_READABLE` significa que GPG no devolvió error (pasó el control previo), pero `pg_restore` terminó distinto de 0, el pipe tuvo error residual o el flujo contabilizó menos de seis bytes. **No diferencia** esas opciones, ni demuestra corrupción del backup. El anterior diagnóstico independiente del mismo ciphertext confirmó `GPG_PROCESS: OK`, `DECRYPTED_STREAM: NONZERO` y que `pg_restore` Linux empezó la restauración y falló más adelante por extensión `EXTENSION_UNAVAILABLE`. Eso apunta primero al lector/pipe o a diferencias de entorno, **hipótesis, no causa demostrada**.

## Corrección candidata V2 auditada antes de ejecución

- ZIP privado de la conversación: `BT_SEC07_EXTENSION_INVENTORY_V2_20261120.zip`, **8.857 bytes**, SHA256 `15d9def921e3ceb0f8721ca3a2b1f964c47916e2b8e898623ff8261822acbdc6`. Contiene `BT_SEC07_Extension_Inventory_Offline_V2.py`, `test_BT_SEC07_Extension_Inventory_V2.py` y `LEEME_SEC07_EXTENSIONES_V2.md`.
- Cambio sustancial: se sustituye **solo** lector `pg_restore --list` ejecutado por Python en Windows por `docker run --rm -i --network none --pull=never --read-only --cap-drop=ALL --security-opt=no-new-privileges --entrypoint pg_restore <imagen-pg17-local> --list`. Pasa bytes GPG por un pipe binario directo a Docker Linux sin base de datos, sin puerto, sin volumen, sin conexión a Supabase, sin descarga/instalación y sin escribir dump SQL claro a disco.
- Todo el control de manifest, nombre único de snapshot, tamaños y hashes SHA256, GNUPGHOME histórico, Docker context local/Linux, TOC parsing, análisis de archivos .control y sólo nombres de extensiones públicamente allowlisted se conserva.
- La nueva ruta clasifica fallas separadas: GPG, encabezado `PGDMP` sintético, versión de archivo no soportada en PG17, archivo/formato no reconocido, lectura incompleta, ejecución Docker o error no clasificado. El stderr real se mantiene limitado a 32 KiB **solo en memoria**, jamás se imprime ni se guarda.
- QA asistente: **19/19 tests sintéticos PASS**; adicionalmente **una prueba integrada sintética real de pipes/subprocess** simula GPG enviando >300 KiB PGDMP a falso Docker que finaliza tras TOC, PASS; sintaxis Python PASS; ZIP `testzip` OK; hashes reproducidos. **Ninguna prueba con el respaldo del propietario ni Docker real en el entorno del asistente**.
- Fuente oficial PostgreSQL 17: https://www.postgresql.org/docs/17/app-pgrestore.html permite `pg_restore --list` sin ejecutar SQL, entrada stdin si no hay filename. El error de Windows podría tener otras causas; no atribuirlo sin salida V2.

## Próxima ejecución autorizable por propietario — una sola acción

Descargar ZIP V2 nuevo en Downloads, verificar SHA256, descomprimir a **nueva** carpeta `$HOME\BT-SEC07-EXTENSION-INVENTORY-V2` (no tocar V1); ejecutar `python -B -m unittest -q test_BT_SEC07_Extension_Inventory_V2.py` (19/19), después ejecutar V2 una sola vez con variable de proceso GNUPGHOME histórico (restituir en finally). Enviar únicamente etiquetas `BT_SEC07_*` y `DIAG_EXIT_CODE`; **no** archivos, SQL, secretos, nombres privados, stderr crudo o huellas. Si reaparece stop, detenerse y analizar código de categoría antes de reintentar.

**Estado y restricciones:** copia PostgreSQL actual cifrada creada + hashes comprobados; restauración completa **NO CERTIFICADA** (`BT-PILOT-QA-04: A REPASAR`); roles SQL incompletos; Drive retirado del roadmap activo. No reexportar `pg_dump`, no ejecutar `pg_restore` en base, no cambiar producción, no activar Drive, no modificar manifests o borrar historiales. Documentación `[skip render]`, sin deploy.
