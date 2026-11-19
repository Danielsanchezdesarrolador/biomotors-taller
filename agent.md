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

## Fuentes y continuidad

- **Fuente obligatoria de reglas:** [AGENTS.md](./AGENTS.md).
- **Estado vivo y pendientes:** [roadmap.md](./roadmap.md).
- **Checkpoint de seguridad y regla de continuidad más reciente:** [BT-SEC-AGENT-RESTORE-01](./docs/checkpoints/CHECKPOINT_BT_SEC_AGENT_RESTORE_20261119.md).
- **Último checkpoint de desarrollo funcional:** [BT-COM-01D](./docs/checkpoints/CHECKPOINT_BT_COM_01D_CIERRE_DOCUMENTAL_R2_20261118.md).
- **Antecedente del backup manual:** [BT-SEC-BACKUP-CONTINUIDAD](./docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_CONTINUIDAD_20261119.md).

No mantener reglas divergentes: ante conflictos verificar evidencia, corregir fuentes y conservar los checkpoints históricos. No compartir ni subir a GitHub, chats o capturas datos privados, GPG private key, contraseñas, tokens ni dumps.
