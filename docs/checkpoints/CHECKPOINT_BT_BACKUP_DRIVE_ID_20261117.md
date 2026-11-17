# ByteTorque — Corrección de carpeta de destino Drive (17/11/2026)

## Antecedente confirmado
- Última exportación manual: GitHub Actions `44085704801`, fallo seguro `BACKUP_NOT_COMPLETE: DRIVE_ACCESS_CHECK`; por tanto **no hay respaldo verificado**.
- El ID previamente fijado `1JRAJr08EP9Ql04a7VniBcS4f4rZkNVEd` devolvió 404 al propietario y a la conexión de Drive consultada.
- En la conexión Drive se identificó `Respaldos ByteTorque`, ID `1FPD-Bnfbf8m0vxnYCOtT0yald7mCi9pT`; la carpeta figura privada, con un único permiso individual de propietario, sin archivos en su interior. El propietario confirmó que puede abrirla en su navegador.
- La identidad del OAuth `BT_BACKUP_DRIVE_CONFIG_CONTENT` no es inspeccionable por GitHub y no se ha validado todavía frente a la carpeta nueva.

## Cambio exclusivamente de código y documentación
- Se reemplaza el ID fijado en `scripts/backup/drive_destination.py`. Exportación y restauración consumen esa constante común, sin duplicar destinos.
- Se agrega un test offline que verifica el ID nuevo y que el ID antiguo se rechaza antes de invocar rclone.
- Se actualiza `docs/BT_BACKUP_GHA_02.md` como procedimiento vigente. Se preservan los checkpoints anteriores como evidencia histórica.
- **No** se modifican secretos, configuración OAuth, TLS `verify-full`, GPG, permisos de carpeta, datos de Supabase ni los controles del workflow. **No** se ejecuta exportación o restauración real con este cambio.
- Mantener `main` y `[skip render]`. Ejecutar pruebas automáticas sin secretos tras publicar; las pruebas offline no prueban acceso real con el OAuth de GitHub.

## Próxima validación acotada
Después del CI, una única exportación cifrada manual autorizada con doble confirmación comprobará acceso de `rclone` y API a la carpeta aprobada; falla cerrado si el OAuth no reconoce el destino. Solo un recibo con `encrypted_external_readback_verified=true` demuestra verificación de ciphertext en Drive; no implica todavía restauración. Recuperación aislada posterior con autorización separada, nunca sobre Supabase.
