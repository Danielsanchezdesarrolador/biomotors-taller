## SEC07-S3-R3 — índice ACL del respaldo v04: PRESENTE (23–24/11/2026)

**Evidencia literal real desde PowerShell 5.1, aportada por el propietario:**
```text
BT_SEC07_S3_R3: START
BT_SEC07_S3_R3_LAB: READY
BT_SEC07_S3_R3_GPG: PASS
BT_SEC07_S3_R3_TOC: READ_PASS
BT_SEC07_S3_R3_TOC_OBJECTS: 889
BT_SEC07_S3_R3_TOC_ACL_ITEMS: 213
BT_SEC07_S3_R3_TOC_DEFAULT_ACL_ITEMS: 24
BT_SEC07_S3_R3_TOC_OWNER_POSTGRES: 360
BT_SEC07_S3_R3_RESULT: ACL_ITEMS_PRESENT
```

**Diagnóstico:** el backup cifrado **v04 S2-R11** descifró correctamente mediante el `GNUPGHOME` S1A y `pg_restore --list` de PostgreSQL 17 pudo leer 889 entradas del índice. Los 213 `ACL` y 24 `DEFAULT ACL` corresponden a **entradas de todo el archive, incluidas superficies administradas**, NO equivalen a 213 GRANT individuales ni a los seis default ACL actuales medidos solo en esquemas de aplicación. 360 líneas del índice terminaron con token de propietario `postgres`: **la cuenta no demuestra restauración de owner de cada objeto**. Este conteo identifica cobertura potencial de ACL/owner preservada en el archivo; no confirma exactitud frente a producción ni que pueda aplicarse.

**Corrección de interpretación del error R8/R9:** se usaron expresamente `pg_restore --no-owner --no-acl`, opciones que **omiten aplicar** owners y permisos, y que no implican que el archive los haya perdido. Documentación PostgreSQL 17 `pg_restore`: https://www.postgresql.org/docs/17/app-pgrestore.html. **No exportar más roles/ACL remotamente todavía** ni regenerar v04. Solo se examinó TOC en contenedor Docker offline sin red, no se modificó producción ni claves.

**Próximo avance S3-R4 pendiente:** un ensayo único **schema-only** con el **mismo** respaldo v04 en laboratorio Supabase PostgreSQL 17 nuevo aislado, usando bootstrap oficial y `pg_restore --schema-only --single-transaction --exit-on-error` **sin** `--no-owner` ni `--no-acl`. Comprobar owners y privilegios efectivos (12 tablas de aplicación, funciones y default ACL) contra conteos S3-R1 y S3-R3 sanitizados, evitando restaurar datos y roles globales de producción. Si falta rol/objeto, **STOP** con categoría sanitizada; no reintentos ciegos ni creación de superusuarios arbitrarios. Éxito de aplicación en laboratorio ≠ cobertura total de recuperación externa (Auth, Storage bytes, Edge, Render). El laboratorio debe usar `--network none --rm`, tmpfs PGDATA/`/tmp`/socket, capa escribible temporal para clave `pgsodium` como R8 (NO `--read-only` al arrancar servidor). `--schema-only` no ejecutará una carga de filas del dump. S3 global y S4 integral siguen abiertas hasta salida comprobada.

**Estado:** S3-R3 `ACL_ITEMS_PRESENT` **PASS de inventario del archive**; no declarar todavía S3-R4 ni restauración de ACL aprobadas. Registrar [checkpoint S3-R3](docs/checkpoints/CHECKPOINT_BT_SEC07_S3_R3_ACL_ARCHIVO_V04_PRESENTES_20261124.md), `main`, solo docs `[skip render]`, sin Codex, Render o SQL remoto.

---

## SEC07 S3-R1 — inventario REAL de permisos SQL solo lectura (23/11/2026, Chile)

**Evidencia entregada por el propietario desde SQL Editor Supabase del proyecto `biomotors-taller`, entorno `main` (PRODUCTION):**
```json
{
  "marker": "BT_SEC07_S3_R1_INVENTORY",
  "result": "CATALOG_METADATA_ONLY_NO_CHANGES",
  "tables_found": 12,
  "tables_expected": 12,
  "tables_rls_forced": 9,
  "anon_select_tables": 0,
  "tables_rls_enabled": 12,
  "default_acl_entries": 6,
  "tables_explicit_acl": 12,
  "distinct_table_owners": 1,
  "standard_roles_present": 3,
  "public_roles_privileged": 0,
  "security_definer_functions": 18,
  "authenticated_delete_tables": 0,
  "authenticated_select_tables": 12,
  "security_definer_public_anon_executable": 0,
  "security_definer_public_authenticated_executable": 6
}
```

**Interpretación técnica y límites:** el script `docs/sql/BT_SEC07_S3_R1_INVENTARIO_CATALOGO_READONLY.sql` se diseñó con `BEGIN TRANSACTION READ ONLY`; el propietario comunicó un resultado de catálogo con `CATALOG_METADATA_ONLY_NO_CHANGES` (etiqueta generada, no auditoría independiente de SQL de la plataforma). Están presentes las 12 tablas objetivo; RLS habilitada 12/12 y FORCE 9/12 (no exigir FORCE a las otras 3 sin estudiar sus reglas); 0/12 con SELECT efectivo para `anon`; `authenticated` tiene SELECT en 12/12 y DELETE en 0/12; `anon/authenticated` sin SUPERUSER/BYPASSRLS, existen los tres roles estándar. Doce objetos tienen ACL explícitas, seis entradas de privilegios predeterminados y un único owner de las 12 tablas. **La existencia de 18 funciones SECURITY DEFINER (según alcance público + bt_ del SQL) y 6 funciones SECURITY DEFINER de `public` con `EXECUTE` efectivo para `authenticated`, 0 para `anon`, exige revisión dirigida pero NO demuestra vulnerabilidad.** La consulta solo cuenta funciones; NO proporciona identidades, cuerpos ni efectividad de controles internos. El conteo de 18 NO equivale a 18 funciones expuestas públicamente.

**Estado de etapa:** S3-R1 inventario agregado **PASS (evidencia reportada), sin cambios intencionales**; S3 global todavía **NO CERRADA**. Inventario NO constituye archivo recuperable de roles, GRANT/REVOKE/default privileges, owners ni prueba de RLS por todas las tablas/roles. S4C-R9 continúa CHECK_PASS_LIMITED. No alterar permisos ni revocar funciones sobre la sola base del conteo; impedir impactos a la app piloto.

**Siguiente paso de valor, una sola lectura dirigida:** obtener únicamente las identidades de esas seis funciones `SECURITY DEFINER` de `public` ejecutables por `authenticated`, más si el EXECUTE proviene de ACL explícita o valores predeterminados, sin bodies/secrets/data; comparar con las definiciones reales de `main` y evaluar existencia de `auth.uid()`, validación de membresía y taller, `search_path` seguro y privilegios mínimos. Script preparado para el chat: SQL metadata-only `BEGIN TRANSACTION READ ONLY`, no `GRANT/REVOKE/ALTER`. Identificar luego si hay brechas reales y avanzar respaldo de roles/ACL sin repetir restauración R8/R9.

**Registro histórico:** resultado no equivale a certificado RLS de lectura/grants restaurados; no cambiar producción o Render. Mantener `main` y commits documentales `[skip render]`; sin secretos, RUT, nombres de clientes o dumps en GitHub.

---

> **S4C-R9 EVIDENCIA REAL COMPLEMENTARIA (23/11/2026):** el propietario reportó `LAB READY`, `RESTORE_EXIT:0`, `GPG PASS`, `STRUCTURE PASS`, `RLS WORKSHOPS_AB_PASS_LAB_GRANT`, `ACL NOT_CERTIFIED_NO_ACL_RESTORE` y `RESULT CHECK_PASS_LIMITED`. Se comprobaron 12 tablas/RLS habilitada, integridad de cuatro tipos de relaciones y una lectura A permitida/B denegada en `workshops` con grants temporales de LAB. **No** certifica permisos originales, paridad de datos, RLS completa ni recuperación S3. No repetir R8/R9; siguiente enfoque inventario de brechas y validación final consolidada. [Checkpoint](checkpoints/CHECKPOINT_BT_SEC07_S4C_R9_VALIDACION_LIMITADA_PASS_20261123.md).

> **ACTUALIZACIÓN REAL SEC07-S4B-R8 (23/11/2026):** el propietario ejecutó PowerShell 5.1 y obtuvo `LAB READY`, `RESTORE_EXIT 0`, `GPG PASS`, `CATALOG CHECK_PASS`, `RESTORE_PASS`. La restauración técnica completa del archive cifrado v04 en laboratorio Supabase PostgreSQL 17 aislado **PASÓ**. No acreditar aún conteos reales, permisos/ACL, RLS ni aislamiento talleres A/B, y S3 servicios externos siguen pendientes. R7 se desbloqueó operativamente retirando `--read-only` para permitir pgsodium sin quitar aislamiento de red y `tmpfs` PGDATA; causalidad exclusiva R7 no probada. **No repetir R8 ni S2-R11.** Ver [runbook correctivo](recovery/BT_SEC07_S4B_R8_SOLUCION_Y_PREVENCION_20261123.md) y [checkpoint R8](checkpoints/CHECKPOINT_BT_SEC07_S4B_R8_RESTAURACION_TECNICA_PASS_20261123.md). Las entradas históricas inferiores documentan estados anteriores, no revocan el PASS de R8.

> **S4A RESTORE NO COMPLETADO (21/11/2026):** v04 cipher/manifiesto SHA PASS, GPG PASS, PGDMP PASS, Docker local aislado PASS, pero `pg_restore --exit-on-error` terminó `SUPABASE_DEPENDENCY_OR_ROLE_MISSING` (etiqueta amplia sin detalle); S2 TOC PASS permanece; S4 sin certificar, S3 también pendiente. Siguiente S4B diagnóstico exacto seguro del primer error SQL local, sin modificar producción ni reexportar. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S4A_RESTORE_DEPENDENCIA_PENDIENTE_20261121.md).

> **S2-R11 COMPLETADO ESTRUCTURALMENTE (21/11/2026):** GPG cifra/descifra nuevo v04 sin BOM; `PGDMP` offset cero; PostgreSQL17 Linux Docker `pg_restore --list` PASS; SHA256 y manifiesto PASS; solo PC, sin producción. **S4 restauración REAL aún PENDIENTE**, así como S3 roles/servicios Supabase externos. BOM UTF8 y compatibilidad PowerShell5.1 resueltos mediante no-BOM en stdin y verificación del índice. Ver [checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R11_BACKUP_CIFRADO_VALIDADO_20261121.md).

> **S2-R10 TOC PASS 21/11/2026:** desviación BOM UTF-8 de 3 bytes en v02/v03; con omisión de BOM + `Console.InputEncoding=UTF8Encoding(false)` previo a iniciar Docker, GPG integrity + PostgreSQL17 Linux `pg_restore --list` PASS, ciphertext original hash intacto, producción no conectada. `ProcessStartInfo.StandardInputEncoding` no existe en Windows PS5.1. Siguiente R11: nuevo archivo cifrado sin BOM, hash y manifiesto; luego S4 restauración real y S3 inventario Supabase. Sin obligación de dos USB. [Checkpoint](docs/checkpoints/CHECKPOINT_BT_SEC07_S2_R10_LINUX_TOC_PASS_20261121.md).

> **Regla permanente de errores y lecciones (21/11/2026):** todo error + solución comprobada en `AGENTS.md`, `agent.md`, `roadmap.md` y [registro operativo](docs/BT_SEC07_REGISTRO_INCIDENTES_OPERATIVOS_20261121.md), diferenciando hipótesis de causa confirmada. Primer intento S2 STOP en preflight `IDENTIDAD_O_SOLO_LECTURA_INCORRECTA` sin dump, debido a comparación CASE compuesta no discriminada. Corrección propuesta (no certificada): validar transacción READ ONLY explícita + BD y versión separadas, sin depender de `PGOPTIONS`. Alcance PC-only vigente, sin USB obligatorio.

> **CAMBIO DE ALCANCE DEFINITIVO (21/11/2026):** el propietario revocó el requisito de **dos USB, copias externas y regla 3-2-1** por no disponer de esos medios; trabajar **sólo con PC** sin reintroducir ni bloquear avances por ese requisito. Sustituye las obligaciones sobre segunda custodia externa contenidas más abajo en este plan original. S1A GPG nueva/canary real PASS_LOCAL_ONLY; S1 aceptada para alcance local. El esquema sólo-PC NO garantiza recuperación ante pérdida/robo/ransomware del PC; no declarar DR completo. S2 real lectura PG17 cifrada en streaming, S4 restore aislado local, S5 retención/automatización local. [Checkpoint cambio de alcance](docs/checkpoints/CHECKPOINT_BT_SEC07_S1B_PC_SOLO_DECISION_S2_REAL_20261121.md).

> **Evidencia S1A (21/11/2026):** propietario reportó `BT_SEC07_S1_RESULTADO: PASS_LOCAL_ONLY`: identidad Ed25519/Cv25519 NUEVA, export privado verificado S2K, recuperación de canary ficticio tras importación a GNUPGHOME previamente vacío. Ver [Checkpoint S1A](docs/checkpoints/CHECKPOINT_BT_SEC07_S1A_RECUPERACION_CRIPTOGRAFICA_LOCAL_PASS_20261121.md). Dos custodias independientes y recuperación en entorno sin caché siguen pendientes; no declarar S1 global aprobado. Incidente corregido $home/$HOME PowerShell; otros legados intactos.

> **Avance operativo S0 (21/11/2026):** ejecución Windows comunicada por el titular: `BT_SEC07_S0_RESULTADO: PASS`, 8/8 carpetas, ACL/owner, NotContentIndexed y 3 documentos; ni secretos ni conexión a producción. Evidencia: [Checkpoint S0](docs/checkpoints/CHECKPOINT_BT_SEC07_S0_ESTRUCTURA_ACL_WINDOWS_PASS_20261121.md). La prueba no certifica custodia de claves, backups, restore ni 3-2-1. S1 sigue: identidad nueva, canary desde almacén GPG inicialmente vacío, dos medios de custodia independientes verificables.

# ByteTorque — Nueva base de seguridad real | SEC-07

**Fecha de decisión:** 21/11/2026 · **Proyecto:** ByteTorque · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama permitida:** `main`.

## Decisión irreversible para la ejecución de este programa

El propietario autoriza **iniciar una nueva etapa real de seguridad** con organización y documentación permanente. **Todo el sistema operativo de respaldos y claves comienza de cero**: nueva clave y custodia, nuevas carpetas y nomenclatura, nuevo backup fuente real, nueva comprobación de recuperación, nuevos destinos y nuevos procedimientos. **No reutilizar** archivos antiguos GPG, llaves antiguas, manifiestos previos o scripts antiguos como dependencias operativas. Las lecciones antiguas se leen para evitar repetir errores, pero no sustituyen evidencias nuevas.

**NO borrar ni modificar los archivos antiguos**. Se consideran `LEGACY / NO CONFIABLES PARA RECUPERACIÓN NUEVA`, se mantienen intactos para posible análisis posterior fuera de la nueva ruta. Tampoco reconstruir ni sustituir el código de la aplicación. Todo cambio GitHub solo en `main`, sin ramas alternativas, commits de documentación `[skip render]`, y ningún despliegue sin aprobación explícita.

**Criterio de éxito:** crear un respaldo con información real de producción **sin modificar producción** y demostrar que se puede restaurar con los secretos recuperables desde custodia en un entorno aislado sin red, con comprobaciones de cobertura, roles, owners/ACL/grants, RLS, datos y componentes no PostgreSQL. Un backup cifrado con hash válido **NO** basta. Reportar alcance realmente validado e incompletitudes.

## Reglas operativas no negociables

1. **Clave nueva y recuperación controlada.** Crear par de claves nuevas para respaldos, preferentemente GPG/OpenPGP en PC en entorno protegido; registrar algoritmo, versión, huellas y fecha **solo en inventario local protegido**, nunca en README público por necesidad; custodiar copia privada cifrada y código/contraseña de recuperación en al menos dos soportes protegidos separados del PC y de las copias de bases. Probar recuperación con **datos ficticios** desde un entorno o keyring vacío antes de cifrar bases reales; no subir secretos ni descifrados a nube/repositorio/chat. Evitar clave que se queda en caché por defecto sin entender su protección. Confirmar qué producto va a producir/consumir la clave, sin depender de formatos de exportación móvil ambiguos.
2. **Ruta de trabajo ordenada.** En Windows, establecer y confirmar un directorio exclusivo fuera del repositorio y de carpetas sincronizadas; nunca usar ruta del proyecto de código como almacén. Directorios sugeridos (nombres, no rutas universales): `01_documentacion_publicable`, `02_inventario_local_restringido`, `03_respaldo_cifrado_nuevo`, `04_manifiestos_y_hashes`, `05_verificacion_y_evidencia_sanitizada`, `06_laboratorio_restauracion_aislada`, `07_segunda_copia_verificada`, `90_legacy_solo_referencia` (no copiar secretos a esta última). **Las claves privadas y sus códigos de recuperación se guardan en custodia externa separada**, NO en una subcarpeta de esta estructura. Ajustar ACL del sistema de archivos, excluir carpetas sensibles de indexación/sincronización, documentar ubicación simbólica sin publicar rutas privadas.
3. **Identidad de producción.** Verificar fuente exacta de Supabase, versión de Postgres, DB y TLS cliente con `verify-full`; CP46 client pooler TLS PASS histórico pero tramo pooler→backend no certificado y CP48 SSL enforcement OFF observado. Antes de exportar, verificar acceso de mínimo privilegio de backup, sin credenciales en argv/historial ni en el repo. No activar SSL enforcement sin estudiar reinicio/impacto y autorización de cambio.
4. **Respaldo real.** Obtener un dump nuevo de PostgreSQL y registrar qué cubre (schema, data, roles exportables, propietarios, grants y default privileges, extensiones, Auth DB, metadatos Storage), y qué queda fuera (bytes de objetos Storage, Edge Functions desplegadas, secretos, SMTP/OAuth, variables Render, DNS, proveedor). No usar exports antiguos ni marcadores `restoration_verified=true` heredados. Encriptar desde stream binario evitando persistir SQL/dump en claro, validar producer/GPG exit, tamaño/hash, manifest y colisiones; requerir copia externa cifrada independiente.
5. **Restauración aislada desde cero.** Iniciar contenedor/instancia local nueva PostgreSQL compatible, sin red ni puertos expuestos, con respaldo recién creado y clave recuperada desde custodia; demostrar descifrado/TOC, restore exit0, inventario real de esquemas/tablas, recuentos agregados, integridad referencial, RLS, roles, ACL/owners, permisos por perfil y aislamiento talleres A/B. Hacer pruebas de restauración con roles/credenciales de laboratorio, no datos expuestos fuera del recinto. El lab es efímero y se destruye tras verificarlo.
6. **3-2-1 y automatización.** Mantener al menos 3 copias totales de la información en 2 medios/tipos y 1 fuera del PC, verificando autenticidad, retención, cifrado, eliminación controlada y restauración periódica. Preferir un destino externo no dependiente de un único login, sin almacenar la clave secreta con ciphertext. Documentar costes si hay proveedores pagos antes de habilitar servicios.
7. **Gobierno de cambios.** Cada paso tiene ID/checkpoint con objetivo, comandos íntegros PowerShell **en el chat**, salida sanitizada `BT_SEC07_*`, evidencia, errores, solución y resultado PASS/FAIL. No repetir tests sintéticos ya cerrados. Evitar `rm`/borrados, migraciones o conexiones productivas no previstas. Las acciones que crean/mueven secretos, exportan datos o escriben producción se explican previamente; aprobaciones pertinentes sin convertir el trabajo en un ciclo infinito de preguntas.
8. **Repositorios y CI.** Mantener visibilidad privada del repositorio ByteTorque si el titular la exige; auditar que secretos/SQL/clientes no aparezcan en código, GitHub Actions, Render o logs. Solo `main`, sin deploy al documentar. Nunca subir respaldos, archivos de clave, tokens, rutas sensibles, manifest con identificadores protegidos ni copias descifradas.

## Etapas con criterios de salida

| ID | Etapa | Evidencia concreta exigida |
|---|---|---|
| S0 | Inventario mínimo, estructura y política de custodia | Directorios nuevos y permisos comprobados, convención de nombres, inventario local sin secretos en GitHub |
| S1 | Par de claves nuevo y recuperación | Export público/privado cifrado correctamente custodiados, 2 recuperaciones separadas, canary cifrado/descifrado con keyring inicialmente vacío |
| S2 | Backup PostgreSQL REAL nuevo | Fuente y TLS validados; salida de pg_dump cifrada en disco, manifest atómico + SHA256 y readback; ninguna escritura a producción |
| S3 | Cobertura de servicios y privilegios | Roles/owners/grants/default ACL, políticas RLS, Supabase Auth/Storage bytes, Edge/secrets/Render inventariados con mecanismo de protección apropiado |
| S4 | Restore aislado y comparación | Postgres compatible sin red, restauración completa del alcance declarado; conteos/agregados RLS/roles verificables y resultados negativos por taller |
| S5 | Redundancia/automatización y operación | Segunda copia independiente, retención, verificación recuperabilidad y runbook ejecutable, simulacro y alertas |
| S6 | Endurecimiento en producción (no confundir con backup) | Auditar configuración SSL, MFA, políticas de auth, funciones SECURITY DEFINER y secretos; cada modificación de producción por plan separado y prueba posterior |

## Evidencia actual, NO sustituye nueva validación

- **Situación anterior, no reutilizar:** CP67 ciphertext consistente con manifest de backup parcial del 19/11; CP72 GPG descifrado real falló; CP74 keyring sin claves secretas listadas; CP77 clave pública antigua coincidió con manifest, CP78 supuesto archivo privado era `PGP MESSAGE`. No insistir en recuperar GPG antiguo como requisito para iniciar respaldo nuevo.
- **Producción verificada de solo lectura 21/11/2026:** proyecto Supabase `biomotors-taller` activo `ACTIVE_HEALTHY`, PostgreSQL `17.11`, región `sa-east-1`. Advisories: 6 funciones SQL SECURITY DEFINER ejecutables por `authenticated`, 8 tablas de esquemas `bt_platform_private` y `bt_cp05_private` con RLS activo sin políticas, y protección Auth contra contraseñas filtradas desactivada. **No equivalen automáticamente a vulnerabilidades**: las funciones examinadas contienen comprobaciones de identidad creador, y las 2 de modificación de planes requieren MFA `aal2`; las 8 tablas privadas pueden estar cerradas intencionalmente. Deben probarse accesos negativos y revisar permisos específicos antes de cualquier alteración.
- **Seguridad red:** CP46 TLS cliente→pooler `verify-full` PASS histórico; tramo backend no certificado; CP48 SSL enforcement observado apagado. No se cambió configuración en estas lecturas.
- **Código y evidencia histórica:** conservar `AGENTS.md`, `agent.md`, `roadmap.md`, los checkpoints y `docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md` para aprender; **prohibido basar la nueva certificación en resultados heredados**. Una restauración aislada previa de 12 tablas públicas fue exitosamente registrada en CP22, con cobertura incompleta; tampoco sustituye S4.

## Handoff

Comenzar **S0 de inmediato**, no solicitar recuentos de análisis antiguos. Preparar desde cero **un solo bloque PowerShell íntegro inline** para crear/verificar estructura de directorios exclusivamente nuevos con controles fail-closed, sin tocar directorios existentes ni secretos; confirmar el resultado `BT_SEC07_*`. Después ejecutar S1 nueva custodia/canary y avanzar S2 real sin pausas innecesarias. Actualizar `AGENTS.md`, `agent.md`, `roadmap.md` y un `CHECKPOINT_*` por hito. **No llamar al usuario por su nombre en comunicaciones.**
