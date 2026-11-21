# CHECKPOINT — BT-SEC07-R3-RECIPIENT-V2-WINDOWS-PASS-40 · Destinatario confirmado y custodia GPG histórica reconciliada

**Fecha:** 20/11/2026 (America/Santiago). **Repo:** `Danielsanchezdesarrolador/biomotors-taller`. **Rama autorizada:** `main`. **HEAD leído antes del checkpoint:** `727a36c348221653ffb8cd6596e02cad8fea02f8`. **Tipo:** evidencia aportada por el propietario en Windows, auditoría SOLO LECTURA de documentación histórica y actualización de documentos GitHub `[skip render]`. **Sin lectura remota, descifrado de respaldo o mutación de datos realizada por el asistente.**

## 1. Evidencia real recibida de Windows, paquete V2

El usuario descargó `BT_SEC07_R3_RECIPIENT_METADATA_V2_20261120.zip` (SHA256 esperado `eed81875dfca9f70929983a82b3490c62ff15f170d2a89ea410967033eb82842`) y seleccionó el **respaldo principal cifrado** de ByteTorque. Compartió exclusivamente:
```text
BT_SEC07_META_V2_ZIP: VERIFIED
BT_SEC07_META_V2_SELECTION: ACCEPTED_NO_PATH_PRINTED
BT_SEC07_RECIPIENT_MODE: HEADER_ONLY_NO_DECRYPT
BT_SEC07_RECIPIENT_COUNT: 1
BT_SEC07_RECIPIENT_HIDDEN_COUNT: 0
BT_SEC07_RECIPIENT_PUBLIC_MATCH: ALL_VISIBLE_MATCH
BT_SEC07_RECIPIENT_SECRET_MATCH: NO_VISIBLE_MATCH
BT_SEC07_RECOVERABILITY: NOT_PROVEN
BT_SEC07_RECIPIENT_CHECK: COMPLETE_NO_DB_NO_DECRYPT_NO_WRITE
BT_SEC07_META_V2_WINDOWS: PASS_HEADER_CHECK_ONLY
```

**Conclusión limitada de esta ejecución:** ZIP SHA PASS, lectura metadatos OpenPGP del archivo seleccionado PASS y **un destinatario visible** coincide por Key ID 64-bit con una clave pública del **anillo GPG activo predeterminado**. Ninguna clave secreta del mismo anillo coincidió (en línea con inventario previo: pública 1/secreta 0). La herramienta NO descifró, autentificó ni verificó integridad criptográfica del cuerpo; `RECOVERABILITY: NOT_PROVEN` es correcto. `NO_WRITE` describe diseño/resultado reportado del lector, no verificación independiente nueva de hash del archivo.

**INC-39 (parser V1 `PARTIAL_PACKET_UNSUPPORTED`): CERRADO OPERATIVAMENTE** por resultado V2 PASS en Windows sobre el respaldo real; V1 rechazaba longitudes parciales OpenPGP válidas. No repetir V1 ni V2 por rutina. No declarar backup corrupto ni crear backup nuevo por el fallo antiguo.

## 2. Hallazgo de reconciliación histórica CRÍTICO: el anillo secreto correcto ya se documentó

Se reabrieron documentos del repositorio antes de elegir próximo paso:
- [Checkpoint de recuperación del 19/11](CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md), apartado `BT-SEC07-GPG-ISOLATED-MATCH-11`: el propietario ejecutó **anteriormente** metadatos en un **GNUPGHOME histórico aislado**, no el predeterminado; salida `GPG_HOME_MODE: CUSTOM`, `SECRET_KEY_RECORDS: FOUND`, `SECRET_RECIPIENT: MATCH`, `PUBLIC_RECIPIENT: MATCH` y `V2_MATCHER: MATCH`. Se protegieron IDs/huellas y se restauró `GNUPGHOME` al finalizar.
- [Checkpoint cierre jornada 19/11](CHECKPOINT_BT_SEC07_CIERRE_JORNADA_20261119.md) identifica el almacén GPG aislado utilizado en pruebas de respaldo y describe descifrado de stream con GPG exit 0.
- [Checkpoint R2 paridad estructura PASS, 20/11](CHECKPOINT_BT_SEC07_PARITY_STRUCTURE_PASS_20261120.md): `PARITY_GPG_PROCESS: OK` y `PARITY_PG_RESTORE_PROCESS: OK`, 20 tablas (12 públicas, 8 privadas), 21 políticas RLS y 37 registros de snapshot en laboratorio offline, estado explícito `SNAPSHOT_STRUCTURE_ONLY`. Registro relacionado a **respaldo actual** y proceso autorizado anteriormente.

**Interpretación correcta:** `SECRET_MATCH: NO_VISIBLE_MATCH` del V2 es exclusivamente sobre el **anillo predeterminado elegido por el lector**, NO todo el PC. **La documentación histórica sí acredita clave secreta coincidente en un almacén GPG aislado y descifrado/restauración del respaldo actual en ensayos previos**. No hace falta reinstalar GPG, generar otra llave, volver a escanear perfiles ni repetir restauración para diagnosticar esta discrepancia. Tampoco es válido declarar «perdida la clave privada». La prueba de metadata V2 por sí sola NO reproduce el descifrado; se combina con evidencia histórica y no amplía el estado R2.

## 3. Cierre de incidentes, protección y límites

| Punto | Estado real |
|---|---|
| INC-35 variable PowerShell `$HOME` | CERRADO por corrección |
| INC-36 listado GPG previo | Resuelto operativamente; causa exacta histórica NO PROBADA |
| INC-39 parser V1 longitudes parciales | **CERRADO OPERATIVAMENTE, V2 Windows PASS** |
| Público destinatario respaldo principal en home predeterminado | **1/1 MATCH** por Key ID 64-bit |
| Secreta en home predeterminado | **0 MATCH**; es esperable y no prueba pérdida |
| Secreta en home histórico aislado | **MATCH reportado previamente en Windows** |
| GPG y restore mismo snapshot (ensayo histórico R2) | **PASS en alcance SNAPSHOT_STRUCTURE_ONLY** |
| R3 roles reales restaurables, owners y ACL/grants/default privileges | **PENDIENTE** |
| Incidente `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` | **ABIERTO: causa original no determinada**; `roles.sql.gpg` antiguo contiene SQL 0 bytes |
| Piloto | `BT-PILOT-QA-04: A REPASAR` |

Sin verificación nueva de autenticidad/integridad ciphertext, propiedad completa de clave, custodia fuera de PC o restauración íntegra de usuarios/Auth/Storage/Edge. El inventario libpq de la sesión actual vio `PG* NOT_SET` y rutas `ABSENT`, no demuestra inexistencia de configuraciones históricas temporales. No abrir ni modificar backup, manifest, GPG histórico, Supabase, Docker, Render, Google Drive (excluido) ni GitHub visibilidad.

## 4. Siguiente etapa — no multiplicar laboratorios sobre un hito cerrado

**Se considera suficiente la evidencia histórica para reconciliar por qué no aparece secreta en el anillo actual.** No repetir tests 18/14/15, V1/V2 de metadata ni R2 restore por rutina.

**Prioridad pendiente SEC-07:** roles PostgreSQL reales + privilegios/propietarios/ACL. La documentación de Supabase CLI v3.0.0 ya demostró que `--role-only` utiliza `pg_dumpall --no-role-passwords`, filtra reservados y puede emitir `RESET ALL;` sin roles útiles. La ruta linked/ref sin contraseña puede crear rol temporal `read_only:false`; **no ejecutar esa ruta contra producción**. Diseñar modo explícito de URL sin password en argumentos y secret/configuración libpq protegidos; la configuración real NO fue comprobada en este turno. Un plan de preflight local no revela credenciales ni conecta todavía. Exportación real de roles, conexión Supabase, uso criptográfico de la clave histórica y restore requieren **AUTORIZACIÓN NUEVA explícita por alcance**. No afirmar que el permiso de lectura de metadatos cubre esas operaciones.

**Próximo intercambio:** confirmar si propietario autoriza preparar/comprobar el método de conexión Supabase en el PC sin conectar todavía, o si desea autorización específica para la exportación real. No pedir materiales secretos en chat ni redistribuir keyring. Mantener el snapshot original intacto.

## 5. Prompt para traspaso

> Continuar ByteTorque SEC-07 desde `main`; leer `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_RECIPIENT_V2_WINDOWS_PASS_HISTORICAL_KEYRING_20261120.md`, `docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md` y el informe incidentes. Última salida Windows del propietario: `META_V2_ZIP: VERIFIED`, `RECIPIENT_COUNT: 1`, `HIDDEN_COUNT: 0`, `PUBLIC_MATCH: ALL_VISIBLE_MATCH`, `SECRET_MATCH: NO_VISIBLE_MATCH`, `RECOVERABILITY: NOT_PROVEN`, `COMPLETE_NO_DB_NO_DECRYPT_NO_WRITE`, `META_V2_WINDOWS: PASS_HEADER_CHECK_ONLY`. **V2 funciona sobre el backup real.** Incidente V1 longitudes parciales CERRADO. Hallazgo histórico crítico: el **GNUPGHOME aislado** ya tuvo `SECRET_KEY_RECORDS: FOUND`, `SECRET_RECIPIENT: MATCH` y el R2 actual `PARITY_GPG_PROCESS: OK`; el anillo predeterminado consultado ahora carece de secreta, ¡no confundirlo con pérdida de la clave! No volver a investigar localización ni repetir 18/14/15 labs, metadata V1/V2 o restore R2. R2 `SNAPSHOT_STRUCTURE_ONLY` no asegura roles/ACL/owner/Auth/Storage/Edge. `roles.sql.gpg` histórico 0 SQL, fallo productor pg_dumpall raíz desconocida. **Siguiente: R3 exportación roles reales planificada**, requiere consentimiento independiente para preparar configuración, acceso Supabase, GPG histórico y restore, evitando CLI remote/ref que crea login-role temporal. No Drive, producción sin cambios, piloto A REPASAR. Cada avance al cierre: checkpoint + agent/roadmap + incidentes en main [skip render].
