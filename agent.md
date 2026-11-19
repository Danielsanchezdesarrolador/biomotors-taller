# ByteTorque — agent.md (entrada de continuidad para agentes)

**OBLIGATORIO antes de cualquier tarea de seguridad o backup:** leer primero la sección
**«PRIORIDAD ABSOLUTA — NO REPETIR CIFRADO DE RESPALDO LOCAL (19/11/2026)»** en
[AGENTS.md](./AGENTS.md) y el estado prioritario de [roadmap.md](./roadmap.md).

**Importante: YA SE HIZO EL CIFRADO LOCAL, NO COMENZAR DE CERO.**
El 17/11/2026 en Windows el propietario reportó una copia GPG local en `BT-Backups`:
`database.dump.gpg` (89.091 bytes) y `roles.sql.gpg` (151 bytes).
El cifrado/descifrado del primero se comprobó con `BASE_DESCIFRADO_OK`;
se realizó una **restauración aislada parcial con paridad de siete tablas**
(`BT_PARIDAD: SIETE_TABLAS_COINCIDEN`). **No está verificada la recuperación integral**
ni el archivo de roles: quedó `ROLES_ORIGEN_FALLA_NO_CLASIFICADA`.

**Próximo paso sin trabajo duplicado:** conservar y verificar los archivos GPG y
la clave local ya existente; diagnosticar el respaldo de roles y completar
verificación de recuperación integral. **No repetir generación de claves ni cifrado,
ni tratar el respaldo manual como inexistente.** El workflow automatizado hacia
Google Drive es otro frente distinto y quedó bloqueado por OAuth `drive.file`;
sin exportación Drive ni restauración externa verificada.

**Reglas canónicas:** [AGENTS.md](./AGENTS.md).  
**Plan y progreso:** [roadmap.md](./roadmap.md).  
**Checkpoint de código más reciente:** [BT-COM-01D](./docs/checkpoints/CHECKPOINT_BT_COM_01D_CIERRE_DOCUMENTAL_R2_20261118.md).

Este archivo es un índice de compatibilidad, no una segunda fuente de políticas;
ante cualquier discrepancia manda AGENTS.md y la evidencia verificada en los
checkpoints. Nunca copiar contraseñas, claves privadas, dumps ni secretos a GitHub.
