# ByteTorque — SEC07 S4A: restauración de prueba NO completada

**Fecha:** 2026-11-21. **Rama:** main; solo documentación, sin Render/deploy. **Fuente:** respaldo nuevo cifrado S2-R11 v04 y manifest con SHA256.

## Evidencia Windows
```text
BT_SEC07_S4A_INICIO: START
BT_SEC07_S4A_BACKUP: S2_R11_VERIFIED
BT_SEC07_S4A_SHA256: PASS
BT_SEC07_S4A_DOCKER: LOCAL_ENGINE
BT_SEC07_S4A_LAB: ISOLATED_TMPFS_STARTED
BT_SEC07_S4A_ARCHIVE_HEADER: PASS
BT_SEC07_S4A_GPG_INTEGRITY: PASS
BT_SEC07_S4A_RESTORE_CLASS: SUPABASE_DEPENDENCY_OR_ROLE_MISSING
BT_SEC07_S4A_STAGE: RESTORE_RESULT
BT_SEC07_S4A_STOP: ISOLATED_RESTORE_NOT_COMPLETE
BT_SEC07_S4A_RESULTADO: STOP
```

## Evaluación
- **S2** no cambia: GPG + SHA256 + PGDMP + índice del backup confirmado.
- **S4**: el laboratorio PostgreSQL17 efímero se inició y se intentó `pg_restore --no-owner --no-acl --exit-on-error`, que falló en primera sentencia problemática. `grep` del script incluía errores de role, extension, function, type, relation, así que marcador no identifica qué dependencia exacta falta. No llamar al respaldo corrupto.
- Docker `--rm`, red `none`, read-only, tmpfs /dev/shm y sin montajes/puertos; la prueba no contactó producción. No se acredita restauración completa de datos, roles, RLS ni servicios.
- **Riesgo distinto**: Supabase tiene roles, extensiones y configuraciones no disponibles en PostgreSQL Alpine genérico. No auto-crear roles administrativos ni instalar dependencias arbitrariamente sin conocer el fallo preciso. Supabase documenta condiciones propias de restauración y perfiles de roles y extensiones.

## Continuación S4B
1. Seleccionar mismo v04 final y comprobar manifest SHA sin tocarlo.
2. Repetir una sola restauración de laboratorio con la misma configuración de S4A, pero clasificar de manera segura la primera línea `ERROR:` de `pg_restore`, **sin** mostrar nombres de objetos, SQL, usuarios, filas ni rutas. Distinguir missing extension vs role vs function/type/relation vs permisos vs conflicto vs otro. El primer fallo podrá cambiar al usar un perfil de destino mejor.
3. Mantener stdin sin BOM en Windows PowerShell5.1; NO usar StandardInputEncoding.
4. Tras hallar clase, decidir imagen de Supabase/Postgres compatible, bootstrap de extensiones/roles y repetir restauración real. Cerrar S4 solo con full restore PASS y controles de objetos y datos; S3 coberturas externas permanecerán abiertas.

**Decisión de dueño:** solo PC, sin discos USB. Copias cifradas existentes no se eliminan. [Incidente](../BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md).
