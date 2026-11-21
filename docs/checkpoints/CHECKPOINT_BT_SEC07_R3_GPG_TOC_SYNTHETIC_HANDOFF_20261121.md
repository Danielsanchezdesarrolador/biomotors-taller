# CHECKPOINT 68 — BT-SEC07-R3-GPG-TOC-SYNTHETIC-HANDOFF

**Fecha:** 21/11/2026 Chile · **Repo:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama:** `main` · **HEAD inicial:** `8d73b0ae39c7ece77dac6380bbfbc541a937d9cb`.

## Autorización precisa
El propietario respondió **«AUTORIZO»** a preparar la siguiente etapa GPG/TOC **exclusivamente con archivos y respuestas sintéticas, sin tocar los respaldos reales**. Preguntó cuántas etapas faltan para empezar los respaldos reales. No hubo autorización para leer keyring histórico, descifrar `database.dump.gpg`, ejecutar GPG/pg_restore real, restaurar datos, conectar a Supabase ni iniciar nuevas exportaciones.

## Estado previo conservado
- CP67 Windows V4: hashes/tamaños de ciphertext de copia local 19/11 coinciden con `manifest.json`. Manifiesto **`PARTIAL_BACKUP_DECLARED`**; autentificación independiente, posibilidad de descifrado y restore **NO CERTIFICADOS**.
- CP55 ya preparó auditor de TOC **con 40 tests sintéticos** (no reiterado). Nuevo entregable de CP68 **no duplica su parser**: modela resultados de estado GPG y coordinación de señales GPG/TOC para fallar de manera cerrada.
- `roles.catalog.json.gpg` es inventario/metadatos, NO SQL recuperable de roles. Antiguo `roles.sql.gpg` dejó SQL original vacío en prueba anterior. Owners/ACL/grants siguen abiertos.

## Nuevo paquete SINTÉTICO entregado fuera de GitHub
- `BT_SEC07_R3_GPG_TOC_SYNTHETIC_GATE_20261121.zip`, **6475 bytes**, SHA256 `1c6dfc5111202d2c2f6d97c913a433acbf60ef1a4766dcd3a8d3fc3a59015adb`.
- Contiene `README.md`, `bt_sec07_gpg_toc_synthetic.py`, `test_bt_sec07_gpg_toc_synthetic.py` y `run_bt_sec07_synthetic_tests.py`.
- Librería pura en RAM: GPG status inventado `[GNUPG:]` sin claves ni textos sensibles; valida DECRYPTION_OKAY/END/BEGIN, estado de proceso y rechaza BADMDC, NO_SECKEY, DECRYPTION_FAILED, errores, códigos no cero, contradicciones y tokens desconocidos. Es **MODELO** y no valida criptografía ni lee logs reales.
- TOC **ficticio** usa centinela obligatorio `SYNTHETIC-TOC-ONLY 1` y clases sanitizadas `TABLE`, `TABLE DATA`, `ACL`, `DEFAULT ACL`, `POLICY`, `ROW SECURITY` etc.; no procesa TOC verdadero, SQL, identificadores ni rutas.
- `main()` no acepta argumentos y sólo imprime indicadores `BT_SEC07_*`; imports del módulo: `__future__`, `dataclasses`, `re`, `sys` (no `socket`, `subprocess`, `os`, `pathlib`, GPG, DB). No hay file I/O del módulo, conexión, escritura, restore ni claves.
- **59/59 pruebas sintéticas PASS** antes del ZIP y **59/59 PASS después de extracción aislada**. `ZipFile.testzip` PASS; prueba de humo `BT_SEC07_PREP_GATE: PASS_OFFLINE_ONLY`. El runner se puede ejecutar desde otro directorio.
- Incidentes de preparación **INC-68A**: fixture de borde TOC declaraba 32 `TABLE DATA` con solo 31 `TABLE`, rechazado como correspondía; fixture corregido a 32 TABLE/31 TABLE DATA. **INC-68B**: runner buscaba tests en directorio de trabajo, no en ruta del programa; corregido usando carpeta del script. 59/59 PASS tras correcciones, sin archivos reales abiertos.

## Límite esencial
El paquete **NO debe alimentarse con material real** de backups, GPG ni TOC. Que una traza inventada indique DECRYPTION_OKAY es sólo una prueba del diseño de filtros, no descifrado de ByteTorque. `pg_restore --list` enumera entradas del archivo y no certifica permisos aplicados, paridad de datos ni restauración. No se creó clave, no se instaló GPG ni se cambió DB. No se coloca el ZIP/ejecutable en GitHub, únicamente este checkpoint y notas.

## Estimación de hitos restantes y próximas autorizaciones
El respaldo **real parcial** ya existe y pasó consistencia local de manifest V4. Para operar copias reales nuevas y comprobables se proponen **tres hitos**: (1) bajo permiso independiente inspeccionar descifrado GPG real y TOC PG17 en aislamiento local, sin revelar plaintext; (2) bajo permiso distinto probar restauración en DB aislada y cobertura de roles, owners, ACL, RLS y componentes excluidos del `full_project_backup=false`; (3) generar y automatizar nuevas copias de producción con retención, destino separado y recuperabilidad comprobable. Son hitos de aceptación, **no número fijo de comandos/checkpoints**. SSL enforcement requiere plan/autorización propia (CP48).

## Reglas de continuidad
- **PowerShell siempre completo EN EL CHAT**, `.ps1` únicamente opcional (CP66).
- No repetir V4 ni tests antiguos sin motivo. Ninguna operación con material real se realizó con este permiso.
- Mantener únicamente `main`; docs `[skip render]`, no despliegues de app ni cambios en producción.