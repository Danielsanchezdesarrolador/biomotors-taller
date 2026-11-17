# BT-DRIVE-DIAG — Evidencia y diagnóstico de solo lectura (17/11/2026)

## Estado
- Acceso PostgreSQL verificado: GitHub Actions `44084850284`, dos `SELECT 1` OK.
- Exportación `44085704801` falló con `DRIVE_ACCESS_CHECK` apuntando al ID antiguo.
- Exportación `44087053869` falló **también** con `DRIVE_ACCESS_CHECK` apuntando al nuevo ID `1FPD-Bnfbf8m0vxnYCOtT0yald7mCi9pT`.
- La cuenta de Drive conectada al propietario muestra la carpeta nueva, privada; **eso no prueba** que la identidad o scope del OAuth guardado en GitHub pueda verla.
- No hay recibo de respaldo verificado, archivos cifrados confirmados ni recuperación aislada.

## Acción
Se añade un flujo manual de solo lectura que ejecuta **la misma comprobación `PrivateDrive` que usa el exportador**, con la configuración OAuth que ya está en `bytetorque-backup-export`. La única diferencia es una función opcional de reporte de etapa **con códigos fijos**. No llama `pg_dump`, PostgreSQL, `gpg`, cargas Drive ni creación de objetos. Nunca imprime respuestas del proveedor, tokens, identificadores de cuenta o configuración.

Etapas: `DRIVE_DESTINATION_VALIDATE`, `DRIVE_CONFIG_VALIDATE`, `DRIVE_ROOT_LIST`, `DRIVE_ROOT_STAT`, `DRIVE_ROOT_METADATA`, `DRIVE_ROOT_PERMISSIONS`. Una falla produce `DRIVE_READONLY_DIAG: <ETAPA>_FAILED`; verde requiere pasar todas. La ejecución es exclusivamente manual, restringida al propietario y `main`. Se usan solo lecturas de `rclone lsjson` y la API Drive. La última comprobación consulta permisos; no los modifica.

Una falla de lista puede significar token OAuth equivocado, carpeta no visible bajo scope `drive.file`, o rechazo de rclone; el código por sí solo no distingue entre esos motivos. **No** ampliar permisos, reemplazar el secreto ni cambiar el ID hasta obtener evidencia adicional.

## Después
Obtener una sola ejecución de BT-DRIVE-DIAG, leer el código fijo y resolver esa etapa concreta. Solo después volver a autorizar una exportación real y una recuperación aislada. Mantener `[skip render]` en este commit, solo `main`.
