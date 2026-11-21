# CHECKPOINT — BT-SEC07-ROLES-CLI-V3-READY-27 | Supabase CLI 3.0.0 ejecutada mediante npx, solo ayuda local

**Fecha:** 20/11/2026 · **Repositorio:** Danielsanchezdesarrolador/biomotors-taller · **Rama:** main · **Ámbito:** preparación R3 de roles y privilegios, sin conexión a Supabase ni operaciones de exportación.

## Salida exacta del propietario en PowerShell

```text
BT_SEC07_NODE_NPX: READY
Usuario escribió AUTORIZO para descargar y consultar temporalmente Supabase CLI v3.0.0.
BT_SEC07_ROLES_CLI: AVAILABLE
BT_SEC07_ROLES_VERSION: 3.0.0
BT_SEC07_ROLES_ROLE_ONLY: True
BT_SEC07_ROLES_REMOTE: True
BT_SEC07_ROLES_DB_URL: False
BT_SEC07_ROLES_PREFLIGHT: SUCCESS_NO_DB_ACCESS
```

**Interpretación:** Node y npx se encontraron, el paquete npm **fijado** `supabase@3.0.0` pudo ejecutar `--version` y `db dump --help` desde `$env:TEMP` fuera del checkout. `--role-only` y `--remote` figuran en la ayuda. El indicador `DB_URL: False` **NO** prueba ausencia funcional de `--db-url`: en v3 esa opción es obsoleta y oculta del texto de ayuda, y el reemplazo recomendado es `--remote=<postgres-url>` o `--remote=<project-ref>`. Una CLI no localizada globalmente en PATH fue resuelta sin Scoop ni instalación global; `npx` puede dejar caché npm local.

**NO ocurrió:** ningún `supabase db dump`, `link`, `login`, acceso a credenciales, exportación, mutación DB/Supabase/Render, descarga de datos o cambio de respaldo/manifiesto. No se ha aprobado roles SQL recuperable ni se demostró privilegio SQL remoto.

## Verificación externa oficial — fuentes al 20/11/2026

- https://supabase.com/changelog/supabase-cli-v3 (04/11/2026): CLI v3 local por defecto para `db dump`, a menos que se indique `--remote`.
- https://supabase.com/docs/guides/local-development/cli/migrating-to-v3 : `--db-url`/ `--linked` obsoletos y ocultos de `--help`, sustituir por `--remote`, con valor unido por signo `=`. Ejemplo de `db dump` remoto debe especificar el destino intencionalmente; jamás asumir proyecto ligado desde TEMP.
- https://supabase.com/docs/reference/cli/supabase-db-dump : `--role-only` para roles; exportación normal aplica filtros Supabase y omite internos; `--file` se verificará mediante la ayuda de la versión exacta, no asumir que exportar a stdout o tuberías PowerShell conserva bytes.
- https://supabase.com/docs/guides/self-hosting/restore-from-platform : separar roles, schema y data; documentos externos Auth/Storage/Edge requieren procedimientos aparte.

## Seguridad y prevención de fallos repetidos

1. **No repetir la instalación.** Reutilizar `npx --yes supabase@3.0.0` sin fijar `latest`, desde directorio fuera del repositorio, hasta aprobar cambio de versión.
2. **No repetir `pg_dumpall --roles-only` histórico:** el `roles.sql.gpg` viejo se descifró en **0 bytes**. Ni GPG exit 0 ni archivo cifrado presente bastan para validar roles. Validar siempre retorno de CLI/pg_dump, bytes SQL **>0**, contenido estructural esperado, retorno GPG, SHA del ciphertext y descifrado de comprobación en ambiente protegido; rechazar productos vacíos en lugar de cifrar vacío.
3. **No diseñar la exportación remota todavía como un comando directo a archivo**: primero preparar wrapper/procedimiento con tests sintéticos de SQL vacío, error del productor, error GPG, truncamiento, salida/limpieza y manejo seguro de claves. El formato PowerShell 5 puede transformar bytes al usar tuberías de procesos nativos; usar un puente binario validado o fichero temporal controlado con borrado responsable (considerar limitaciones SSD), sin hacer afirmaciones de borrado seguro.
4. **No imprimir ni pegar** URL de conexión con contraseña, service role, PAT, fingerprints, catálogo real, nombres de usuarios/roles privados o SQL de grants. Para una operación remota será necesario consentimiento separado y elección inequívoca de proyecto/credenciales, preferir origen de sólo lectura cuando técnicamente viable. Inspeccionar flags `--remote`, `--role-only`, `--file` de la versión usada, y el comportamiento de selección antes de iniciar la exportación.
5. **No confundir** una exportación de roles filtrados con recuperación completa: faltarán propietarios, ACL/GRANT y pruebas negativas de RLS multitenant, más configuración Auth/Storage/Edge; la prueba anterior `--no-owner --no-acl` no los incluyó.
6. **No usar Google Drive**; workflows históricos permanecen legados inactivos.

## Próximo bloque propuesto R3 — aún no autorizado remotamente

Preparar una **validación local de contrato de salida `db dump --help` v3** y diseño de wrapper binario con tests sintéticos (sin conexión ni datos reales). Luego, SOLO previa autorización explícita, lectura remota/ exportación `--role-only --remote=<destino>`, comprobación GPG y restauración de roles/grants aislada con controles por alcance. No ejecutar `supabase link`, `db push`, `db reset` ni consultas de producción en el paso local.

**Estado general:** R1 inventario y R2 paridad estructural del snapshot: PASS. R3 roles reales: PENDIENTE. R4 seguridad A/B, R5 copia independiente, externos: PENDIENTE. `BT-PILOT-QA-04: A REPASAR`. Solo documentación `[skip render]`, sin modificacion a plataforma o copia cifrada.
