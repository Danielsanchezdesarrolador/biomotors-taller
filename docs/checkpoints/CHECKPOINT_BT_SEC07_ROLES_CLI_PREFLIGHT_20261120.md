# CHECKPOINT — BT-SEC07-ROLES-CLI-PREFLIGHT-26: comando Supabase CLI no encontrado en PATH Windows
**Fecha:** 20/11/2026 · **Rama:** `main` · **Naturaleza:** prerrequisito de herramientas, NO error de backup o restauración.

## Evidencia exacta del propietario

```text
BT_SEC07_ROLES_CLI: NOT_INSTALLED
BT_SEC07_ROLES_PREFLIGHT: COMPLETE_NO_CHANGES
```

El comando `Get-Command supabase.cmd,supabase.exe,supabase` de PowerShell no encontró el ejecutable global de CLI. **Solo prueba que no está disponible con esos nombres en el PATH de esa sesión**, no que falte necesariamente en todos los directorios ni que exista falla PostgreSQL/Supabase/GPG. No hubo salida de `supabase --version` ni `db dump --help` y no se realizó ningún cambio remoto/local, instalación ni exportación.

## Documentación oficial verificada

1. [Instalación CLI](https://supabase.com/docs/guides/local-development/cli/getting-started): soporte Windows con [Scoop](https://scoop.sh/) (`scoop bucket add supabase https://github.com/supabase/scoop-bucket.git`, `scoop install supabase`); alternativamente Node.js **20+** con `npx supabase --help`, sin instalación global.
2. [CLI v3 breaking changes](https://supabase.com/changelog/supabase-cli-v3): desde 04/11/2026 CLI v3 apunta al entorno local por defecto; requiere `--remote` explícito para seleccionar el origen alojado en comandos posteriores. No ejecutar ningún comando de exportación sin una autorización diferente y preflight de conectividad/seguridad.
3. [CLI db dump](https://supabase.com/docs/reference/cli/supabase-db-dump): contiene `--role-only`, `--remote` y `--db-url` (puede haber matices v3); filtros de objetos administrados. [Restauración de proyecto Platform a self-hosted](https://supabase.com/docs/guides/self-hosting/restore-from-platform): exportar roles, schema y data por separado; **roles.sql.gpg antiguo descifra 0 bytes**, no se debe reutilizar.
4. El uso de `npx` puede descargar y almacenar en caché el paquete npm. **No realizarlo automáticamente ni modificar el proyecto**; ante autorización explícita, usar carpeta temporal fuera del repo, pin de versión publicada de CLI, y limitarse a `--version` y `db dump --help`. Nunca ejecutar `db dump`, `db reset`, `db push`, `supabase link`, `login` ni conexión en este bloque.
5. Si Node.js/npx no están disponibles o Node es menor a 20, detenerse con etiqueta segura y evaluar instalación local controlada por Scoop, o alternativa ya disponible, **sin descargar Scoop/Node a ciegas**.

## Errores evitados y prevención

- No confundir ausencia de comando CLI con `pg_dumpall`/roles/gpg defectuoso. El snapshot estructural R2 **está aprobado en su alcance**: 20 tablas, 37 filas, RLS 20/20 en lab, `pg_restore` OK; origen y permisos reales siguen pendientes.
- No repetir `pg_dump` ni el ZIP de restauración; no instalar PostgreSQL ni Docker de nuevo.
- No asumir que código CLI v2 y v3 usa la misma semántica remota. Verificar versión/ayuda del ejecutable realmente usado antes de diseñar un productor de roles.
- Guardar solo códigos y versión, **no imprimir conexión, claves, identificadores de proyecto, SQL ni credenciales**.
- No tocar Google Drive, que está excluido.

## Próxima operación mínima

Ejecutar preflight local de disponibilidad de Node.js >= 20 y npx; si están presentes, ofrecer consentimiento concreto para ejecutar `npx --yes supabase@3.0.0 --version` y `npx --yes supabase@3.0.0 db dump --help` **solo desde una carpeta temporal ajena al repositorio**. Conservar como salida solo la versión y los flags presentes, sin comandos que contacten Supabase. Si no existen Node/npx, tratar Scoop como alternativa con autorización separada.

**Status R3:** `CLI_NO_PATH` conocido, ruta documentada, ejecutable/versión aún por confirmar. **Sin mutaciones y sin certificación completa**, piloto Ignacio `A REPASAR`.

## BT-SEC07-ROLES-CLI-V3-READY-27 · Prerrequisito CLI cerrado mediante npx, no instalación global

El propietario ejecutó `npx --yes supabase@3.0.0` desde TEMP con permiso y confirmó `ROLE_ONLY=True`, `REMOTE=True`, `VERSION=3.0.0`, `DB_URL=False`, `SUCCESS_NO_DB_ACCESS`. Confirmación oficial: `--db-url` se oculta por obsoleto en v3, se reemplaza por `--remote`; no afirmar que está roto por ausencia en --help. [Nuevo checkpoint](CHECKPOINT_BT_SEC07_ROLES_CLI_V3_READY_20261120.md). Solo ayuda/version, sin dump ni credenciales, ningún cambio remoto. El archivo de roles SQL antiguo de 0 bytes sigue requiriendo solución.
