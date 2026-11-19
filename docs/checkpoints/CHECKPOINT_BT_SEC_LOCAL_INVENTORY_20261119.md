# CHECKPOINT — BT-SEC-LOCAL-INVENTORY-01 · Verificación no invasiva del respaldo en PC
**Fecha:** 19/11/2026 · **Rama:** `main` · **Estado:** inventario comprobado con salida de PowerShell aportada por el propietario; diagnóstico del contenido de roles PENDIENTE.

## Evidencia aportada
- `Test-Path` confirmó que existe `$HOME\BT-Backups\bytetorque-local-20261117T144118Z-8c1f8a323a924d44a6b8e853e6faa756`.
- `database.dump.gpg`: **PRESENTE**, 89.091 bytes.
- `roles.sql.gpg`: **PRESENTE**, 151 bytes.
- Directorio aislado GPG `$env:LOCALAPPDATA\ByteTorque-GPG-Prueba\gnupg-aislado`: **EXISTE**.
- Solo son pruebas de existencia/tamaño. No se calcularon hashes ahora, no se descifró ningún archivo en esta comprobación, no se comprobó la clave privada de la carpeta GPG, ni se examinó el SQL de roles.

## Estado previo NO REINICIAR
El 17/11 ya se hizo cifrado/descifrado del dump y se ejecutó restauración SQL aislada con paridad de siete tablas: `BT_DATOS: RLS_ACTIVA=7 POLITICAS=16`, `BT_REGISTROS: TABLAS=7 FILAS=25`, `BT_PARIDAD: SIETE_TABLAS_COINCIDEN`. Es prueba funcional del SQL incluido en esas siete tablas; NO acredita totalidad de Auth, roles, Storage, Edge, secretos o configuraciones. Roles había terminado `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` y el ciphertext de 151 bytes no se puede declarar válido solo por existir. Backup automático Drive continúa bloqueado por OAuth `drive.file` como trabajo separado.

## Próximo paso concreto (lectura local)
Desde PowerShell, comprobar **solo** si `roles.sql.gpg` puede descifrarse y medir la cantidad de líneas/caracteres, SIN imprimir texto SQL, contraseña, claves privadas ni crear archivo plano. Si resulta vacío/error, investigar exclusivamente causa de `pg_dumpall --roles-only --no-role-passwords` y formato de roles antes de realizar nueva exportación de ese componente; no sobrescribir ciphertext original. No rehacer GPG ni restauración de siete tablas.

## Seguridad de esta etapa
Sin cambios en Supabase, Render, Auth, RLS, Storage, Drive, clientes o datos. No se disparó ningún backup ni migración ni ejecución remota. Commits documentales `[skip render]`. **BT-PILOT-QA-04: A REPASAR**.
