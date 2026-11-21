# CHECKPOINT 62 — BT-SEC07-R3-GPG-SIZES-PARTIAL-20261121

**Fecha:** 21/11/2026 (Chile) · **Rama exclusiva:** `main` · **HEAD previo:** `12ae9a761d87bca30cc7d55aa5c1a92a5b401290`.

## Evidencia Windows recibida
El propietario adjuntó dos capturas de la misma inspección de carpeta de respaldo `bytetorque-local-20261117T1441...` (archivos observados previamente `database.dump.gpg` y `roles.sql.gpg`, fecha 17/11/2026 11:42). **La primera captura** muestra un total de **dos archivos, cero carpetas, 87,1 KB = 89.242 bytes** de tamaño lógico y 88,0 KB = 90.112 bytes en disco. **La segunda captura**, de propiedades de un archivo OpenPGP `.gpg`, muestra **151 bytes** de tamaño lógico y **0 bytes** «Tamaño en disco». Su título/nombre no aparece en el recorte, por lo que NO puede atribuirse los 151 bytes con certeza ni a `roles.sql.gpg` ni a `database.dump.gpg`. Asumiendo que es uno de los dos archivos y que el total corresponde a esa misma carpeta, el otro tamaño sería **89.091 bytes por diferencia**; deducción aritmética condicionada, no medición individual.

## Interpretación restringida
- Confirmado: nombres de archivos terminados en `.gpg` observados en CP61, y falta visual de `manifest.json` para dicha carpeta. **SHA/manifest V3 no ejecutable sobre esta carpeta sin manifiesto**, sin fabricarlo.
- 151 bytes es inusualmente pequeño para un volcado SQL útil; compatible con payload mínimo/vacío, **no prueba** que ese archivo concreto tenga SQL descifrado de cero bytes ni que sea necesariamente el de roles.
- «Tamaño en disco: 0 bytes» **no equivale a tamaño lógico 0 bytes**, podría deberse a tratamiento NTFS/compresión/almacenamiento y no se infiere corrupción o ausencia física.
- No certificar cifrado real, hash, integridad de database dump, roles, ACL/owners, ni restaurabilidad por la extensión ni por los tamaños. El antiguo `roles.sql.gpg` histórico SQL0 fue reportado en checkpoints previos; es un antecedente, no análisis de estos ciphertexts.

## Próxima acción del titular, solo metadatos
Confirmar **qué nombre** corresponde exactamente al archivo de 151 bytes y el tamaño individual del otro en Propiedades del Explorador (sin mostrar rutas personales). Después buscar visualmente respaldos más recientes `bytetorque-local-...` que sí contengan `manifest.json`. No modificar, borrar ni crear manifest, no ejecutar GPG/decrypt/pg_restore/SQL, no volver a correr V3 sobre esta carpeta sin manifest. Para evaluar recuperación se requerirán autorizaciones nuevas específicas.

## Infraestructura y alcance
No se accedió a los backups reales, ni se ejecutó herramienta en Windows desde el asistente, ni se conectó a Supabase ni se cambió SSL, roles, Render o producción. Esta operación modifica **solo documentación GitHub en main** con `[skip render]`.
