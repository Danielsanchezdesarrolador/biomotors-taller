# CHECKPOINT 63 — BT-SEC07-R3-WINDOWS-V3-LAUNCHER-DELIVERED

**Fecha:** 21/11/2026 Chile · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama:** `main` · **HEAD de inicio:** `8766757a78374666a7b4c666e71b32805d9e1b4f`.

## Estado al entregar herramientas
El propietario identificó una **carpeta diferente y más reciente** de respaldo con `database.dump.gpg`, `roles.catalog.json.gpg` y `manifest.json`, fechados 19/11/2026. Capturas indican ciphertext de base 118.105 bytes y catálogo cifrado 675 bytes; **extensión y presencia no certifican cifrado real, SHA ni restaurabilidad**. El catálogo de roles es metadato, **no export SQL restaurable**. El respaldo antiguo del 17/11 y sus riesgos se mantienen sin cambios.

Se entregaron **dos archivos descargables locales al usuario** (no se publicaron en GitHub):
- `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V3_20261121.zip`, 7334 bytes, SHA256 `07316406274f1b2662e5a5978fb039b6751ab35cd58acb6227b466667308b484`. SHA local y listado de ZIP comprobados nuevamente, extracción a TEMP y test runner: **`PASS_53_OF_53_SYNTHETIC`**, **`SIMULATED_NOT_CERTIFIED`**.
- `BT_SEC07_EJECUTAR_V3.ps1`, 2195 bytes, SHA256 `f10991a2600cb0ba6f1214ab3525a0c22e5b61af646700f3c8c7598179e6771c`; lanzador PowerShell comprueba SHA del ZIP, extrae a TEMP, ejecuta runner sintético y solo tras PASS abre selector local de `manifest.json`. Incluye `finally` para eliminar TEMP. El usuario puede inspeccionar `.ps1` en Bloc de notas y pegar su contenido en PowerShell. **Este lanzador no ha sido probado en Windows real**; no representar como certificado.

## Alcance y precauciones
No se ha recibido salida real de Windows V3 sobre el manifiesto nuevo. Script principal hace lectura de `manifest.json` elegido y de ciphertexts listados, cotejando identidad/tamaño/SHA; no usa GPG, network, SQL ni servicios remotos. Los tests crean y limpian fixtures ficticios en TEMP; leer archivos reales puede actualizar metadatos de último acceso. **No descifrar, restaurar, editar ni crear backup/manifest**. `PASS_LOCAL_CONSISTENCY_ONLY` es solo consistencia local con el manifiesto, no integridad independiente, restauración, roles/ACL, ownership ni TLS end-to-end.

## Próxima acción
El titular debe descargar ambos archivos en Descargas, abrir el `.ps1` para inspeccionar/copiar y ejecutar en PowerShell, elegir **`manifest.json` de la carpeta del 19/11** solo tras PASS de preflight. Enviar únicamente las líneas `BT_SEC07_*` sin rutas ni contenido. Ante STOP, no repetir sin analizar. Registrar un nuevo checkpoint según resultado real.

Esta actualización es solo documentación GitHub en `main` con `[skip render]`, sin deploy ni cambios en producción.
