# CHECKPOINT — BT-SEC07-ROLES-OUTPUT-CONTRACT-PREP-28 | contrato de salida CLI v3: documentado, pendiente de comprobación Windows

**Fecha:** 20/11/2026. **Base inicial:** `89411f1d8f3d641037da9454a6eb7927adaf71ef`. **Rama única:** `main`. **Estado:** análisis documental y contrato de preflight preparado; **NO ejecutado** en Windows en esta etapa. **No es una exportación ni una certificación**.

## 1. Continuidad real comprobada

Se releen `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_ROLES_CLI_V3_READY_20261120.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_PARITY_STRUCTURE_PASS_20261120.md`, `docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_CONTINUIDAD_20261119.md`, `docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md` y la auditoría retrospectiva. GitHub confirmó HEAD `89411f1` al inicio de esta intervención y repositorio de visibilidad `public` (sin cambiarla). No se vuelve a abrir Drive: excluido expresamente del plan.

**Evidencia histórica de PC, NO nueva prueba:** `NODE_NPX: READY`, `supabase@3.0.0` disponible vía `npx`, `--role-only` y `--remote` en ayuda, `--db-url` ausente en ayuda porque está deprecado/oculto. Sin acceso a DB en ese paso. Ya hubo restore de snapshot GPG en Docker Supabase PG17 y paridad *estructural de snapshot*, con 20 tablas, 21 políticas, 35 funciones y 4 extensiones; usuarios/roles/owners/ACL NO se recuperaron por `--no-owner --no-acl`. `roles.sql.gpg` histórico descifra a 0 bytes: evidencia inválida de roles que debe conservarse intacta. El nuevo snapshot de base y manifiesto NO se modifican.

## 2. Contrato oficial de CLI v3, verificado documentalmente

- Referencia oficial: https://supabase.com/docs/reference/cli/supabase-db-dump — `supabase db dump` elige base **local por defecto**, `--remote[=<ref|branch|url>]` opta por remoto, `-f, --file <string>` guarda contenido, `--role-only` exporta roles de cluster, `--data-only` exporta datos.
- Migración oficial: https://supabase.com/docs/guides/local-development/cli/migrating-to-v3 — `--db-url` fue deprecado y ocultado de `--help` en CLI 3; **nunca usar su ausencia como error**.
- Guía de recuperación: https://supabase.com/docs/guides/self-hosting/restore-from-platform — roles, estructura y datos se exportan por separado. CLI omite esquemas administrados y la recuperación de Storage bytes/Edge/configuración requiere pasos independientes.
- La documentación indica que `db dump` utiliza `pg_dump` en contenedor y que puede excluir objetos de gestión Supabase; **no inferir** que una exportación SQL de roles reconstruye ACL/owners/grants completos o identidades de Auth.

## 3. Siguiente acción agrupada de bajo riesgo en Windows: ayuda solamente

Ejecutar por el propietario desde PowerShell, sin credenciales y fuera del checkout:

```powershell
& {
    Push-Location $env:TEMP
    try {
        $ayuda = & npx.cmd --yes supabase@3.0.0 db dump --help 2>$null | Out-String
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'BT_SEC07_ROLE_EXPORT_HELP: FAILED'
            return
        }
        foreach ($flag in @('file', 'role-only', 'remote', 'data-only')) {
            $nombre = $flag.ToUpperInvariant().Replace('-', '_')
            $presente = [regex]::IsMatch($ayuda, '(?<![\w-])--' + [regex]::Escape($flag) + '(?![\w-])')
            Write-Host ('BT_SEC07_CLI_FLAG_{0}: {1}' -f $nombre, $presente)
        }
        Write-Host 'BT_SEC07_ROLE_EXPORT_PREFLIGHT: COMPLETE_NO_DB_ACCESS'
    }
    finally { Pop-Location }
}
```

**Criterio de aceptación en PC:** `FILE=True`, `ROLE_ONLY=True`, `REMOTE=True`, `DATA_ONLY=True`, `COMPLETE_NO_DB_ACCESS`, sin `FAILED`. Si aparece `FAILED` o `False`, **detenerse**; diagnosticar versión/ayuda local antes de cualquier exportación. Ausencia de `--db-url` sigue siendo esperada. Se imprimen solo booleanos, sin volcar salida completa de ayuda ni datos sensibles. `npx` puede consultar npm/caché, pero **no se conecta a la base de datos** al pedir `--help`.

## 4. Siguiente fase técnica DESPUÉS del preflight, aún no aprobada

Preparar diseño y pruebas sintéticas locales de productor + cifrado de roles con:
1. Verificación de código de salida del productor; rechazo explícito de SQL vacío, solo comentarios, incompleto o truncado de acuerdo con un contrato de objetos esperados. No confiar en `GPG exit=0` para demostrar que el origen tenía datos.
2. Comprobación de salida binaria **sin pipe textual de Windows PowerShell 5**, y manejo de stderr saneado. Como `-f` puede escribir SQL legible, no imponerlo sobre disco persistente sin revisar almacenamiento temporal protegido, limpieza, retención y exposición residual en SSD.
3. Simular productor fallido, 0 bytes, cifrador fallido, interrupción, colisión de archivo, hash/readback y preservación de snapshot/manifiesto originales. No usar SQL real de usuarios ni secretos en tests.
4. Reconciliar qué roles puede realmente recuperar `--role-only`, diferencias con owners/ACL/default privileges y grants de esquema. Ensayar recuperación y revisión de permisos únicamente en contenedor aislado **con autorización independiente**.
5. **Solo con autorización nueva y específica:** conexión remota identificada unívocamente, exportación de roles real y cifrado local con nombre diferente, y luego pruebas de restauración. No ejecutar `supabase link/login/db push/db reset` ni modificar base alojada.
6. Mantener el secreto de contraseña o URL fuera de GitHub, chats y argumentos/logs expuestos; verificar método de custodia antes de construir el comando remoto.

## 5. Registro de incidentes, pruebas y efectos

**INC-ID histórico relacionado:** `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` (pg_dumpall anterior exit 1, stderr corto descartado); **CAUSA RAÍZ AÚN NO DETERMINADA**. Segundo defecto probado: `roles.sql.gpg` anterior descifra 0 bytes; GPG correcto no implica SQL correcto. La solución nueva no se marca aplicada hasta obtener SQL verificable, cifrado/readback y restore autorizado. El paso `--help` todavía no dio salida Windows en esta intervención, por lo que no se añade incidente ficticio.

**Acciones efectuadas por este chat:** lectura GitHub de documentación/estado y consulta solo lectura de documentación oficial; preparación documental de este checkpoint, portada roadmap, portada agent e informe de errores. **No**: PowerShell Windows, Node/npm local, Docker, GPG, Supabase alojado, credenciales, SQL real, backups, Restore, Storage, Auth, Render, migraciones, cambios de visibilidad o despliegue.

**Riesgos pendientes:** repo público según metadatos GitHub (no hay cambio realizado; confirmar visibilidad deseada antes de datos reales), falta de roles/ACL, paridad del origen, recuperación Auth/Storage/Edge y segunda copia cifrada fuera de PC (NO Google Drive). `BT-PILOT-QA-04: A REPASAR`.

## 6. Traspaso

**Próximo mensaje esperado:** cinco líneas `BT_SEC07_CLI_FLAG_...` + `BT_SEC07_ROLE_EXPORT_PREFLIGHT` del PowerShell del propietario. Solo tras revisar esos indicadores se prepara el siguiente paquete sintético y contrato seguro del productor. Cualquier fallo nuevo debe registrar texto sanitario exacto, causa probada vs hipótesis, cambio, pruebas reales y condición de reintento; no repetir el mismo fallo a ciegas.

**Publicación:** únicamente documentación `main`, mensaje de commit `[skip render]` previsto. No se ejecutó CI manual ni despliegue.
