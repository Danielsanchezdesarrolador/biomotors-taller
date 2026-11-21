# CHECKPOINT — BT-SEC07-R3-GPG-INVENTORY-PASS-37 · 1 clave pública / 0 claves privadas detectadas

**Fecha:** 20/11/2026 (America/Santiago) · **Repo:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main` · **HEAD previo al checkpoint:** `c7aa1d0f85f3a1b5f5cf0f38e25e45f106635cc6`. **Tipo:** evidencia de inventario local ejecutado por propietario, actualización exclusivamente documental. **No acceso al PC desde el asistente, DB remota, claves reales operativas, ni respaldos**.

## 1. Resultado real del diagnóstico GPG (PC Windows)

El usuario ejecutó el bloque sanitizado del checkpoint [INC-36](CHECKPOINT_BT_SEC07_R3_GPG_LIST_INVENTORY_FAILED_DIAG_PREP_20261120.md) y aportó:
```text
BT_SEC07_PS_MAJOR: 5
BT_SEC07_GPG_HOME: PRESENT
BT_SEC07_GPG_PUBLIC_KEYS_COUNT: 1
BT_SEC07_GPG_SECRET_KEYS_COUNT: 0
BT_SEC07_GPG_DIAG: PASS_NO_DB_ACCESS_NO_SECRETS_PRINTED
```

**Conclusión limitada:** el PowerShell 5 local resolvió con `gpgconf` el homedir GPG, los listados públicos/secretos terminaron con exit 0 y la lectura de metadatos encontró **una entrada `pub:` y ninguna `sec:` en ese almacén**. Este resultado no confirma que la pública sea destinataria del respaldo existente, ni que la privada correspondiente se haya perdido; no revisa otros homedirs, hardware tokens, máquinas o formas de cifrado. No se exportó clave ni cifró/descifró dato alguno.

## 2. Incidentes y clasificación

- `BT-SEC07-LOCAL-INV-HOME-RO-35`: script anterior intentó asignar `$home` (PowerShell `$HOME`, variable automática read-only), causa confirmada por inspección del propio código y corregida en el siguiente bloque. **CERRADO por progreso de fases**.
- `BT-SEC07-GPG-LIST-UNCLASSIFIED-36`: inventario anterior con `ErrorActionPreference=Stop` y captura de excepción opaca devolvió `GPG_INVENTORY: FAILED_NO_DB_ACCESS` después de ubicar home. En el nuevo diagnóstico con `ErrorActionPreference=Continue` y fases, los dos listados culminaron **PASS**. **Resuelto operativamente, causa raíz exacta del fallo anterior NO PROBADA**: es plausible el tratamiento de stderr nativo en Windows PowerShell 5.1, pero no se obtuvo la excepción anterior. Evitar afirmar que un almacenamiento de claves defectuoso se reparó o que los metadatos estaban corruptos.
- `ROLES_ORIGEN_FALLA_NO_CLASIFICADA`: histórico y **todavía abierto**; `roles.sql.gpg` antiguo descifraba cero bytes SQL. El nuevo conteo GPG no resuelve la exportación de roles.
- **Nuevo incidente de PC hoy:** ninguno en esta ejecución, diagnóstico PASS.

**Regla:** no clasificar `GPG_SECRET_KEYS_COUNT: 0` como pérdida definitiva de una clave ni como defecto de Supabase. Permite cifrado **si** la clave pública actual es el destinatario correcto, pero la restauración requiere disponer de capacidad de descifrar con la clave privada correspondiente o método permitido. Un ciphertext antiguo de respaldo estructural se descifró en pruebas anteriores; **no hay evidencia suficiente para determinar qué GNUPGHOME/identidad/método usó ese éxito histórico**, y no debe inferirse a partir del inventario actual.

## 3. Lo observado y lo que NO

| Componente | Estado |
|---|---|
| `gpg.exe` disponible | PASS anterior |
| `gpgconf` resolvió GPG home existente | PASS |
| `--list-keys` en GPG home seleccionado | Exit 0; 1 clave pública |
| `--list-secret-keys` en GPG home seleccionado | Exit 0; 0 claves privadas |
| Suite MOCK 18/18 Windows | PASS, cerrado |
| Suite GPG real efímero 14/14 Windows | PASS, cerrado |
| Integración sintética GPG 15/15 Windows | PASS, cerrado |
| Supabase CLI 3.0.0 flags | PASS, cerrado |
| Respaldo PostgreSQL existente | SNAPSHOT_STRUCTURE_ONLY PASS en R2, **no repetir restauración por rutina** |
| SQL roles reales recuperable, owners, ACL, grants | PENDIENTE |
| `BT-PILOT-QA-04` | A REPASAR |

Inventario PG de la misma sesión anterior informó `PGHOST/PGPASSFILE/... NOT_SET` y rutas por defecto `ABSENT`; no demuestra pérdida de credenciales ni incapacidad de conectar bajo otro método. No imprimir ni subir variables sensibles, key IDs, fingerprints, SQL, hostname de DB, rutas de clave ni PGPASS.

## 4. Próxima frontera segura y autorizaciones separadas

La autorización actual era **solo inventario local de metadatos**. Este objetivo está cumplido y cerrado. **No activar la exportación cifrada real basándose exclusivamente en la existencia de la clave pública.** Hay que establecer un procedimiento de restauración independiente antes de confiar nuevos datos a un receptor sin clave privada local acreditada.

Recomendación siguiente, sujeta a nueva autorización explícita: **solo lectura LOCAL de metadatos de destinatario del ciphertext existente** (`gpg --list-packets` correctamente limitado/sanitizado, sin descifrar, sin publicar keyid/huella, sin alterar archivo) y comparación LOCAL en memoria con los metadatos de clave pública y secret keys en home elegido; verificar si el histórico tiene un receptor que sea resoluble. Diseñar un diagnóstico que *nunca imprima* ruta/hash identificable ni tokens, y que no declare recuperabilidad al observar un receptor, ya que debe haber capacidad efectiva de descifrar. Alternativamente revisar sin secretos cómo se invocó el exportador histórico para determinar qué home usó, sin acceder a las copias. **No ejecutar ninguna de estas operaciones sin el consentimiento del titular**.

Seguirán requiriendo autorización **separada**: operaciones criptográficas con el keyring histórico; acceso remoto a Supabase; exportación real de roles; restauración en Docker; almacenamiento externo fuera del PC. Google Drive permanece excluido. Sin deploy/Actions/prod, solo commit documental `[skip render]`.

## 5. Traspaso inmediato para nuevo chat

> Continúa ByteTorque SEC-07 desde `main`. Lee `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_R3_GPG_INVENTORY_PASS_ZERO_SECRET_20261120.md` y `docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md`. Verifica HEAD actual. Windows PowerShell 5, `GPG_HOME: PRESENT`, `PUBLIC_KEYS_COUNT: 1`, `SECRET_KEYS_COUNT: 0`, `GPG_DIAG: PASS`. INC-35 (`$HOME`) cerrado; INC-36 listado previo resuelto operativamente pero causa del error anterior NO determinada. **No afirmar clave privada perdida definitivamente**. Labs Windows 18/14/15 PASS, no repetir. R2 snapshot restaurado/paridad estructural PASS, roles.sql.gpg antiguo SQL 0 bytes; roles/owners/ACL pendiente, piloto A REPASAR. Autorización de usuario **solo inventario local ya concluido**; antes de usar GPG real original, analizar metadata de backup existente, contactar Supabase, exportar roles o restaurar pedir nuevos permisos explícitos y separados. Siguiente recomendar corroborar custodio/capacidad de descifrado del destinatario antes de usar la clave pública para cifrar datos críticos, con diagnóstico local sanitizado si AUTORIZO. Drive excluido, dejar checkpoint/commit en cada avance.
