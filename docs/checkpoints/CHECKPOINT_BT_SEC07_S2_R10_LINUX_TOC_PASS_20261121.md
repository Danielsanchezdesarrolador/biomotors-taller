# ByteTorque — SEC07: S2-R10 PostgreSQL 17 Linux TOC verificado (21/11/2026)

**Rama:** `main` · **Registro:** solo documentación, sin despliegue · **Estado S2:** verificación TOC de ciphertext v03 con prefijo omitido PASS; archivo final limpio y restauración integral **PENDIENTES**.

## Evidencia reportada desde Windows PowerShell 5.1
```text
BT_SEC07_S2_R10_INICIO: START
BT_SEC07_S2_R10_SOURCE: V03_FOUND_UNIQUE
BT_SEC07_S2_R10_R9_PARTIAL: ABSENT
BT_SEC07_S2_R10_DOTNET_PROPERTY: UNAVAILABLE
BT_SEC07_S2_R10_STDIN: UTF8_NO_BOM_AT_START
BT_SEC07_S2_R10_SOURCE_HEADER: BOM3_PGDMP
BT_SEC07_S2_R10_GPG_INTEGRITY: PASS
BT_SEC07_S2_R10_LINUX_TOC: PASS
BT_SEC07_S2_R10_SOURCE_SHA256: UNCHANGED
BT_SEC07_S2_R10_PRODUCTION: NOT_CONNECTED
BT_SEC07_S2_R10_FILES: UNCHANGED
BT_SEC07_S2_R10_RESULTADO: PASS_TOC_NO_NEW_FILE
```

## Conclusiones con nivel de confianza
- **Confirmado:** GPG descifró el ciphertext nuevo v03 con integridad y su payload empieza por BOM UTF8 (3 bytes) + `PGDMP`; la entrega que omite exactamente ese BOM es aceptada por `pg_restore --list` dentro de contenedor aislado PostgreSQL 17 Linux con archivo temporal en `/dev/shm`.
- **Confirmado:** `ProcessStartInfo.StandardInputEncoding` no existe en .NET Framework del Windows PowerShell 5.1 de usuario; R9 fue incompatible. La implementación correctiva que establece `Console.InputEncoding` a `UTF8Encoding(false)` *antes* de iniciar Docker y luego restaura el valor pasó R10. La causa exacta de qué llamada insertó el BOM original no se aisló completamente; no afirmar prueba forense completa.
- **Confirmado:** S2-R10 no crea copia v04, no muta v02/v03, no toca Supabase ni hace restore integral. SHA-256 del v03 sin cambios.
- **Aún pendiente:** generar copia v04 nueva cifrada sin BOM usando entrada binaria compatible PS5.1, verificar GPG y cabecera `PGDMP` offset 0 y `pg_restore --list` en Docker Linux; promover con SHA/manifiesto sólo tras PASS. Luego restauración real aislada S4 y revisión de roles/Auth/Storage/Edge/Render S3. No certificar cobertura de datos sólo por TOC.

## Lección permanente / prevención
Verificar plataforma PowerShell/.NET antes de emplear API. Nunca usar `ProcessStartInfo.StandardInputEncoding` en Windows PowerShell 5.1. Para los procesos de escritura stdin binaria que utilicen `Process.StandardInput.BaseStream` con .NET Framework, establecer codificación de consola sin BOM **antes de iniciar** el proceso, restaurándola inmediatamente; validación posterior obligatoria de los primeros 5 bytes del dump y de su TOC. Mantener originales cifrados, no sobrescribir ni reciclar material antiguo. Ningún dump SQL sin cifrar debe escribirse deliberadamente a disco. Todo STOP/documentación de solución en `AGENTS.md`, `agent.md`, `roadmap.md` y registro de incidentes.

**Alcance por decisión expresa:** custodia y respaldos sólo en PC; sin exigencia USB, advertencia permanente sobre pérdida física/compromiso del PC.
