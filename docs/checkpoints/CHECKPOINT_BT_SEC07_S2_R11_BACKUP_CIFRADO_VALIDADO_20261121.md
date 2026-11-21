# ByteTorque — SEC07 S2-R11: primer respaldo nuevo cifrado estructuralmente VALIDADO

**Fecha:** 2026-11-21. **Repo:** `Danielsanchezdesarrolador/biomotors-taller`. **Rama única:** `main`. **Cambio:** exclusivamente documentación, `[skip render]`.

## Evidencia aportada por dueño desde PowerShell 5.1

```text
BT_SEC07_S2_R11_INICIO: START
BT_SEC07_S2_R11_SOURCE: V03_VERIFIED
BT_SEC07_S2_R11_PRODUCTION: NOT_CONNECTED
BT_SEC07_S2_R11_DOCKER: LOCAL_ENGINE
BT_SEC07_S2_R11_KEY: VERIFIED
BT_SEC07_S2_R11_SOURCE_HEADER: BOM3_CONFIRMED
BT_SEC07_S2_R11_NEW_CIPHER: CREATED
BT_SEC07_S2_R11_MAGIC: PGDMP_OFFSET_ZERO
BT_SEC07_S2_R11_GPG_INTEGRITY: PASS
BT_SEC07_S2_R11_LINUX_TOC: PASS
BT_SEC07_S2_R11_SOURCE: UNCHANGED
BT_SEC07_S2_R11_SHA256: PASS
BT_SEC07_S2_R11_MANIFEST: CREATED
BT_SEC07_S2_R11_BACKUP: ENCRYPTED_FINALIZED
BT_SEC07_S2_R11_PRODUCTION: NOT_CONNECTED
BT_SEC07_S2_R11_FULL_RESTORE: PENDING
BT_SEC07_S2_R11_RESULTADO: PASS_BACKUP_AND_TOC
```

## Estado certificado y límites
- **S2 (copia de base en PC) PASS estructural:** nuevo archivo v04 `*_nobom_v04.dump.gpg` (ruta solo local Windows), manifest JSON sanitizado y SHA256. GPG cifra y descifra sin fallos, payload de archive custom comienza exactamente en `PGDMP` offset 0, TOC leído por PostgreSQL17 Linux Docker sin red. El archivo original v02 y derivado v03 se conservaron sin mutación. No se recontactó producción después de exportación inicial, ni se escribió deliberadamente dump claro en disco Windows. No publicar backup ni secretos.
- **S4 PENDIENTE:** TOC válido NO demuestra que los datos se puedan restaurar en una base PostgreSQL nueva. Se requiere restauración completa en contenedor temporal aislado de red, sin puertos ni volúmenes Docker persistentes, con `pg_restore --exit-on-error`, validación de objetos/tablas y datos. Diferenciar fallos debidos a servicios/extensiones/roles específicos Supabase de corrupción del archive. No extraer ni imprimir filas.
- **S3 PENDIENTE:** roles globales, ACL, Auth, Storage binario, configuraciones y Edge/Render no quedan certificados por un solo `pg_dump`.
- **PC-only:** titular revocó requisito de USB. No afirmar recuperación ante pérdida total, robo o ransomware del PC.
- **Producción:** fuente S2 conectada anteriormente con TLS `verify-full` y preflight de transacción de solo lectura; ninguna escritura intencional. S2-R11 offline.

## Incidentes y soluciones
- **INC-S2-01:** validación inicial psql fallaba por CASE de tres condiciones y `default_transaction_read_only`; se sustituyó por `BEGIN TRANSACTION READ ONLY` y comprobaciones separadas, PASS en S2-R2. La causa exacta de configuración PGOPTIONS antigua no se demostró, pero corrección sí fue validada.
- **INC-S2-02:** cabecera custom `PGDMP` desplazada por BOM UTF8 `EF BB BF` en v02 y v03, confirmada R8. Al omitir BOM y usar stdin sin BOM PostgreSQL17 Linux leyó TOC de v03 en R10. R11 creó nueva v04 cifrada que empieza en PGDMP offset0, GPG PASS, Linux TOC PASS, SHA+manifest PASS. **SOLUCIÓN VERIFICADA**. Para futuras capturas de datos, todo consumidor debe confirmar magic offset 0 antes de considerar válido un dump.
- **INC-S2-03:** R9 usó `ProcessStartInfo.StandardInputEncoding`, propiedad no disponible en .NET Framework PS5.1; `R10_DOTNET_PROPERTY UNAVAILABLE` lo demostró. Corrección compatible: fijar temporalmente `Console.InputEncoding = new UTF8Encoding(false)` ANTES de `Process.Start` cuando se abra stdin binario (y restaurar enseguida), más verificación PGDMP. S2-R10 y S2-R11 PASS. Origen forense del primer BOM no completamente aislado.
- **INC-OPERACION-01:** no pegar etiquetas de ejemplo `BT_SEC07_*` en PowerShell: únicamente bloques `& { ... }`. No repetir hitos cerrados.

## Siguiente: S4A restauración real en Docker PG17 aislado
1. Leer únicamente el artefacto v04 final y su manifiesto, validar hash, GPG y PGDMP. No crear respaldo adicional ni tocar producción.
2. Iniciar contenedor PostgreSQL 17 Alpine local, `--network none`, sin publicar puertos, sin mounts volúmenes, con datos temporales tmpfs /dev/shm; pasar el archivo descifrado al contenedor como bytes en stdin `UTF8 no BOM`.
3. Intentar `pg_restore` con `--exit-on-error --no-owner --no-acl` contra BD de prueba inicializada allí. No compartir datos del dump ni errores crudos que incluyan PII.
4. Registrar si restauración full completa o si faltan dependencias gestionadas de Supabase, sin confundirlo con corrupción. Si falla, clasificar y corregir aisladamente.
5. Registrar solución verificada en `AGENTS.md`, `agent.md`, `roadmap.md`, registro y checkpoint.

**Nunca introducir nuevos requisitos de dos USB ni usar material heredado.**
