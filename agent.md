## BT-SEC-07-POOLER-CODIGO-03 · Inspección de endpoint (19/11/2026)

La inspección AST del propietario devolvió `ENDPOINT_EN_CODIGO: POOLER`, `INSPECCION_LOCAL_OK`. **Solo evidencia un literal de pooler en el código**: no confirma el host/puerto de conexión real ni la causa del fallo de roles. Pendiente clasificar de forma segura el puerto de `DB` sin imprimir la cadena; sesión 5432 y transacciones 6543 tienen usos diferentes. No repetir `pg_dumpall` ni alterar backups/secretos. [Checkpoint actualizado](./docs/checkpoints/CHECKPOINT_BT_SEC_07_ROLES_DIAGNOSTICO_FOCALIZADO_20261119.md). Sin cambios en producción.

## BT-SEC-07-LOCAL-DIAG-02 · Seguimiento de roles (19/11/2026)

En Windows se verificaron por ruta absoluta PostgreSQL 17.12 (cuatro utilitarios); `SEC-15` solucionado sin reinstalación ni PATH. Se localizó el exportador local y se creó candidato independiente del diagnóstico, sintaxis OK y clasificación sintética 8/8. En dos conexiones autorizadas, prueba TLS previa OK pero `pg_dumpall --roles-only --no-role-passwords` falló; último código `1`, stderr capturado `75 bytes`, sin patrones reconocidos. **No se conoce la causa ni se debe repetir la operación sin plan nuevo y autorización**. El stderr fue descartado y no permite análisis retrospectivo. Respaldos GPG antiguos intactos; rol GPG sigue inválido (0 bytes); recuperación integral actual pendiente. [Checkpoint](./docs/checkpoints/CHECKPOINT_BT_SEC_07_ROLES_DIAGNOSTICO_FOCALIZADO_20261119.md). Sin producción modificada; **BT-PILOT-QA-04: A REPASAR**.

## Auditoría integral de seguridad y errores — 19/11/2026

**Primero revisar:** [informe retrospectivo y bitácora SEC-01…SEC-17](./docs/BT_SEGURIDAD_AUDITORIA_RETROSPECTIVA_20261119.md) y [checkpoint BT-SEC-REVIEW-01](./docs/checkpoints/CHECKPOINT_BT_SEC_REVIEW_20261119.md). Regla permanente en `AGENTS.md`: **todo error nuevo debe registrar causa confirmada frente a hipótesis, solución, evidencia real, impacto, pendientes y condición de reintento**, sin repetir pruebas ciegas ni destruir originales. 

**Estado ya demostrado:** PostgreSQL 17 **sí fue instalado en Windows el 17/11** y el PATH de aquella sesión incluyó `C:\\Program Files\\PostgreSQL\\17\\bin`. No aparecer en PATH del PowerShell de hoy NO significa desinstalación. Docker 29.9.3 encontrado. `database.dump.gpg` 89.091 bytes descifrado y restauración real SQL aislada de siete tablas verificada; `roles.sql.gpg` 151 bytes descifra a **0 bytes**: **inválido**. Drive no tiene recibo de respaldo externo; la provisión `44094695940` **se ejecutó y falló**. Backup local **14:41 UTC** anterior a migraciones CP05, Creador y 04A: se necesita otro backup del estado **actual** y validación de recuperación, con consentimiento, sin sobrescribir el viejo.

**Supabase observado solo lectura:** 8 migraciones, 12 públicas RLS, 8 privadas RLS+FORCE; faltan validar avisos de contraseñas filtradas y controles internos de seis RPC. Render visual anterior LIVE; no habilitar candidatas de email/Storage. Siguiente instrucción PC: comprobar exclusivamente por ruta absoluta `C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dumpall.exe` y `psql.exe` con `--version`, NO instalar ni editar PATH global.

# ByteTorque — agent.md | Entrada obligatoria para todos los chats/agentes

## Protocolo permanente: ANTES de instruir y DESPUÉS de trabajar

**Para CADA solicitud de instrucciones o trabajo relacionada con ByteTorque**, todo chat (ChatGPT, Codex u otro agente) debe consultar la **versión vigente en `main`** de: **(1) `AGENTS.md`, (2) este `agent.md`, (3) `roadmap.md` y (4) el checkpoint relevante más reciente de `docs/checkpoints/`**. Leer el estado real del repo (HEAD) y las pruebas/activaciones comprobadas antes de prescribir comandos, prompts, pasos o modificaciones. No asumir que hay que repetir etapas porque no aparecen en el chat nuevo; comprobar continuidad. Si no se puede consultar estos documentos, avisar y no sugerir acciones sensibles basadas en suposiciones.

**Al terminar CUALQUIER trabajo** (función, corrección, prueba, documento, seguridad, operación autorizada o intento bloqueado), actualizar **`roadmap.md` y un checkpoint** con lo realizado y **lo que falta**; actualizar **este `agent.md`** con el enlace/estado del último checkpoint y **`AGENTS.md` si nace una regla permanente**. Registrar commit en `main` y comunicar commit, CI, publicación/flags, tareas pendientes y siguiente instrucción. Esto es obligatorio también al mudar de chat. Los cambios documentales por sí solos no autorizan Render/Supabase/Drive; usar `[skip render]` cuando proceda.

## Seguridad / respaldo — NO empezar de cero

**El 17/11/2026 ya se hizo el cifrado GPG local en Windows.** En `BT-Backups` se informaron `database.dump.gpg` (89.091 bytes) y `roles.sql.gpg` (151 bytes). El primero fue descifrado con éxito (`BASE_DESCIFRADO_OK`, `ARCHIVO_POSTGRES_OK`, `CATALOGO_OK`).

**SÍ se ejecutó una RESTAURACIÓN SQL en entorno Docker aislado y hubo verificación funcional positiva**: `BT_DATOS: RLS_ACTIVA=7 POLITICAS=16`, `BT_REGISTROS: TABLAS=7 FILAS=25`, `BT_PARIDAD: SIETE_TABLAS_COINCIDEN`. **No confundir alcance de la validación (siete tablas) con ausencia de restauración.** Esto NO demuestra todavía recuperación integral de todo Supabase/Auth/Storage/Edge/roles/secretos. El respaldo de roles de 151 bytes sigue sin validarse (`ROLES_ORIGEN_FALLA_NO_CLASIFICADA`). El flujo automático GitHub → Google Drive es **otro trabajo**: detenido por autorización OAuth `drive.file`, sin recibo completo de exportación/restauración externa.

**Próximo paso en PC:** reutilizar y comprobar el backup/keyring existente, resolver específicamente roles y cerrar la cobertura faltante. **No volver a generar claves, exportar, cifrar ni restaurar la misma parte ya verificada sin una razón concreta y documentada**; no asumir que la copia SQL por sí sola protege Storage ni configuración externa.

- **Última comprobación GPG recibida (19/11/2026):** `roles.sql.gpg` dio `ROLES_DESCIFRADO_EXIT=0`, `ROLES_LINEAS=0`, `ROLES_CARACTERES=0`. Indica salida de texto aparentemente vacía; **no confirma todavía cero bytes de plaintext** ni causa del fallo de exportación. Siguiente: medir bytes descifrados localmente sin guardar/mostrar SQL. [Evidencia](./docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md).

- **Último control local comprobado (19/11/2026):** [BT-SEC-LOCAL-INVENTORY-01](./docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md) — archivos `database.dump.gpg` (89.091 bytes), `roles.sql.gpg` (151 bytes) y directorio GPG presentes en el PC del propietario; descifrado del archivo de roles todavía **no ejecutado en este control**. Próximo paso: analizar roles sin mostrar SQL ni rehacer cifrado.

- **Diagnóstico DEFINITIVO 19/11/2026:** el mismo archivo original `roles.sql.gpg` (151 bytes) **se descifra exitosamente, pero a 0 bytes**: `ROLES_DESCIFRADO_EXIT=0`, `ROLES_BYTES_DESCIFRADOS=0`. **No es backup válido de roles**. Conservarlo intacto. El `pg_dumpall` histórico falló con `ROLES_ORIGEN_FALLA_NO_CLASIFICADA` pese a `POSTGRES_TLS_OK`, causa no identificada. Próximo control: versiones locales de `pg_dumpall` y `psql`; después diagnóstico sanitizado solo del productor, no de toda la base. [Evidencia](./docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md).

- **Último diagnóstico de herramientas (19/11/2026):** en el PowerShell del propietario `pg_dumpall.exe` y `psql.exe` resultaron `NO ENCONTRADO EN PATH`. **NO inferir que están desinstalados.** Revisar existencia/rutas/versiones bajo `Program Files\\PostgreSQL\\*\\bin` o Docker; no instalar ni editar `PATH` por defecto. Luego diagnóstico seguro del productor de roles con el programa Python existente, sin volcar SQL ni sobrescribir GPG. [Evidencia](./docs/checkpoints/CHECKPOINT_BT_SEC_LOCAL_INVENTORY_20261119.md).

## Fuentes y continuidad

- **Fuente obligatoria de reglas:** [AGENTS.md](./AGENTS.md).
- **Estado vivo y pendientes:** [roadmap.md](./roadmap.md).
- **Checkpoint de seguridad y regla de continuidad más reciente:** [BT-SEC-AGENT-RESTORE-01](./docs/checkpoints/CHECKPOINT_BT_SEC_AGENT_RESTORE_20261119.md).
- **Último checkpoint de desarrollo funcional:** [BT-COM-01D](./docs/checkpoints/CHECKPOINT_BT_COM_01D_CIERRE_DOCUMENTAL_R2_20261118.md).
- **Antecedente del backup manual:** [BT-SEC-BACKUP-CONTINUIDAD](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_CONTINUIDAD_20261119.md).

No mantener reglas divergentes: ante conflictos verificar evidencia, corregir fuentes y conservar los checkpoints históricos. No compartir ni subir a GitHub, chats o capturas datos privados, GPG private key, contraseñas, tokens ni dumps.
