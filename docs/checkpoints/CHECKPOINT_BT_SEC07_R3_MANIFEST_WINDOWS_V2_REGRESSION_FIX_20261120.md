# CHECKPOINT 57 — BT-SEC07-R3-MANIFEST-WINDOWS-V2-REGRESSION-FIX

**Fecha:** 20/11/2026 Chile (ejecución Windows del titular que se reportó en la madrugada local) · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama exclusiva:** `main` · **HEAD inicial:** `e564c7a3227590611f2f9c76fcefa685c3be47cc`.

## 1. Evidencia real Windows V1 del propietario (INC-57)

El propietario ejecutó el bloque de PowerShell de CP56 y compartió archivo de salida del test completo. Resultado:
```text
BT_SEC07_PACKAGE: VERIFIED
Ran 48 tests in 0.570s
FAILED (failures=15, errors=5, skipped=2)
BT_SEC07_MANIFEST_TESTS: STOP
```
El titular confirmó explícitamente **«no se abrió ningun selector»**. El lanzador de CP56 **se detuvo en la puerta de test y retornó**, antes de llamar `bt_sec07_manifest_readonly.py` para selección de `manifest.json`. Las rutas TEMP de la traza indican únicamente tests sintéticos; ninguna evidencia de inspección del backup real. **Ningún respaldo real fue abierto ni modificado; ninguna conexión a Supabase ni GPG ocurrió**.

Los errores `MANIFEST_NOT_REGULAR_OR_UNSTABLE` surgen en `open_read_only_regular` al comparar `Path.lstat()` con `os.fstat()` mediante `unchanged`. En Windows, valores de `st_ino`, `st_ctime_ns` y/o otras propiedades pueden variar entre ambas interfaces aun cuando el archivo es el mismo; la comparación POSIX estricta se utilizaba incorrectamente entre fuentes diferentes. Los 15 tests negativos devolvieron error anterior de archivo no regular en lugar del `STOP_*` esperado. **INC-57: FALSO STOP DE PREFLIGHT WINDOWS DEBIDO A CRUCE DE METADATOS**, no corrupción del backup; diferencia exacta de atributos de OS no instrumentada en el Windows del propietario, no afirmar cuál campo específico difirió.

## 2. Corrección V2 en herramienta PRIVADA, sin usar backup real

Nuevo ZIP **`BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V2_20261120.zip`**, **10777 bytes**, SHA-256 `950651ceed451e4156847e3af8b02cdb888f3856a479467e3905cb6ddcab92fe`, creado, reextraído y verificado en laboratorio del asistente. **V1 `BT_SEC07_R3_MANIFEST_READONLY_20261120.zip` SHA256 `d052e3fdc05e8896bbf1f6b8c6bf48c27b2fffb5b7d51432f8077927278ac4a8` OBSOLETO: no repetir.** El nuevo ZIP contiene `README.md`, `bt_sec07_manifest_readonly.py`, `test_bt_sec07_manifest_readonly.py`, `run_bt_sec07_manifest_offline_tests.py`.

Cambio dirigido:
- `unchanged` compara snapshots **del mismo origen**, incluidos tamaño, mtime, ctime, inode y device: se mantiene para `Path.lstat()` antes/después del acceso y para descriptores POSIX homogéneos.
- Nueva función `fd_consistent(path_stat, fd_stat, platform)`: en Windows exige **tipo de descriptor regular y tamaño exacto** sin imponer igualdad de inode/ctime del `fd` frente al path; se verifica **por separado** la consistencia completa del path antes/después de lectura, y se calcula SHA-256 real del ciphertext para detectar modificación. En POSIX mantiene comparación estricta.
- Se conservan los controles anteriores contra `symlink`, traversal, sustitución observada de path, diferencias de tamaño/hash, cambios durante lectura, JSON inválido/duplicados, archivos no permitidos, carpeta/backup id, project ref, `full_project_backup=true`, ausencia de backup principal y ausencia de credenciales.
- El nuevo **lanzador de pruebas sintéticas** usa `unittest.TestResult` y emite solo `BT_SEC07_*`, NO tracebacks ni rutas Windows si falla. El PowerShell de uso posterior debe detenerse si la prueba sintética no pasa, **antes de abrir selector**; no reintento automático.

## 3. Tests reales en entorno del asistente y límite

- **53/53** tests sintéticos PASS en Linux antes del ZIP.
- **53/53** tras extraer el ZIP a carpeta aislada. ZIP `testzip()` PASS y SHA256 verificada.
- Cuatro pruebas unitarias adicionales validaron discrepancia de inode/ctime/fstat Windows simuladas, rechazo de tamaño incorrecto, rechazo de descriptor no regular y detección de metadatos modificados. Quinta prueba integral simuló fstat Windows con inode/ctime diferentes en lectura de manifest y ciphertexts sintéticos y pasó.
- AST/comprobación de imports bloquea `socket`, `subprocess`, `ctypes`, HTTP, GPG, escritura desde programa principal. CLI rechaza argumentos inesperados.
- **No hay ejecución real V2 en Windows todavía**. No declarar compatibilidad Windows certificada ni `PASS_LOCAL_CONSISTENCY_ONLY` del respaldo real antes de recibir marcadores del propietario.

**Salida esperada preflight:**
```text
BT_SEC07_PACKAGE_V2: VERIFIED
BT_SEC07_MANIFEST_TESTS: PASS_53_OF_53_SYNTHETIC
BT_SEC07_MANIFEST_WINDOWS_COMPATIBILITY: SIMULATED_NOT_CERTIFIED
BT_SEC07_MANIFEST_BACKUP_SELECTED: NO
```
Después de esas líneas únicamente, el script intentará selector. Si el usuario elige respaldos reales, `PASS_LOCAL_CONSISTENCY_ONLY` certifica **solo coincidencia de hashes/tamaños con manifiesto de la misma carpeta**; ni autenticidad externa ni restauración probada.

## 4. Autorizaciones, estado y siguientes pasos

El usuario había autorizado comprobación **LOCAL SOLO LECTURA** de hash y manifest; V1 se detuvo antes de escoger backup. V2 fue entregado para reintento manual con esa misma finalidad, sin ampliar alcance. Requiere que el dueño descargue ZIP nuevo y **elija voluntariamente** `manifest.json` del backup nuevo solo si se abre selector después del test; no solicitar copia de archivos, tokens o rutas del usuario. Si V2 falla, detener y recibir solo `BT_SEC07_*`. No hacer backup, descifrado, TOC real, restore, roles, SQL, TLS ni otros servicios.

**R3 todavía pendiente**: owners, ACL/grants, permisos de funciones, `DEFAULT ACL`, recuperación roles de plataforma, restauración aislada integral; CP54 confirmó 31 roles de sistema/0 adicionales, viejo `roles.sql.gpg` productor falló y SQL vacío. CP48 SSL enforcement OFF UI, CP46 TLS PC→pooler PASS/backend SSL NO, end-to-end no certificado. Piloto `BT-PILOT-QA-04 A REPASAR`; Drive excluido.

**Traspaso:** «Continúa seguridad ByteTorque solo main desde CP57, leer AGENTS/agent/roadmap e informe. Usuario compartió log V1 PowerShell: ZIP VERIFIED, 48 tests 15 fails+5 errors, skip2, `MANIFEST_TESTS: STOP`, no selector. No acceso a backup real. INC-57 comparación inválida `Path.lstat` vs `os.fstat` de Windows en `unchanged`. Corregido en ZIP privado V2 `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V2_20261120.zip` SHA `950651ceed451e4156847e3af8b02cdb888f3856a479467e3905cb6ddcab92fe`, 10777 B; 53/53 tests offline PASS dos veces y regresiones Windows simuladas, **aún no Windows real**. V1 obsoleto; solo V2 con hash exacto, tests sintéticos => selector opcional de manifest reciente y read-only SHA. No GPG, SQL, backup, restore, SSL, Drive. Registrar salida final del propietario sin exponer archivos o paths. R3 owners/ACL sigue pendiente».
