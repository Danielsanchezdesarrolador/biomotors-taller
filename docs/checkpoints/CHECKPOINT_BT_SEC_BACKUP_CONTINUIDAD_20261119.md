# CHECKPOINT — BT-SEC-BACKUP-CONTINUIDAD · 19/11/2026

**Objetivo solicitado:** corregir la continuidad del roadmap y de las instrucciones para agentes para impedir que próximos chats ordenen volver a cifrar o crear claves cuando el Director ya lo hizo.

**Rama:** exclusivamente `main`; **tipo de cambio:** documentación, **[skip render]**. No operaciones SQL, GPG, Docker, Drive, credenciales ni Render.

## Corrección de hechos históricos

El 17/11/2026 el propietario trabajó desde Windows en un respaldo local cifrado GPG. El relato y comprobaciones textuales de esa sesión consignan:

| Componente | Estado correcto |
|---|---|
| Claves GPG/OpenPGP | Se prepararon; no regenerarlas sin inspeccionar el keyring existente |
| `BT-Backups/bytetorque-local-20261117T144118Z-8c1f8a323a924d44a6b8e853e6faa756/` | Carpeta local reportada; comprobar ubicación exacta en PC sin divulgar material privado |
| `database.dump.gpg` | Existente, tamaño reportado 89.091 bytes; descifrado comprobado (`BASE_DESCIFRADO_OK`, `ARCHIVO_POSTGRES_OK`, `CATALOGO_OK`) |
| `roles.sql.gpg` | Existente, 151 bytes; **NO** dar por completo/correcto el respaldo de roles |
| Restauración local aislada | **La restauración de la base SQL se ejecutó y funcionó en el entorno aislado**; las **verificaciones documentadas abarcaron siete tablas**: `BT_DATOS: RLS_ACTIVA=7 POLITICAS=16`; `BT_REGISTROS: TABLAS=7 FILAS=25`; `BT_PARIDAD: SIETE_TABLAS_COINCIDEN`. Que la cobertura validada sea parcial **no significa que no se restauró la base SQL**. |
| Diagnóstico de roles | `ROLES_ORIGEN_FALLA_NO_CLASIFICADA`, pendiente de resolver |
| Recuperación integral de todo Supabase | **NO certificada** por la comprobación parcial de siete tablas |
| GitHub Actions → Google Drive | **Frente separado**, bloqueado en autorización OAuth `drive.file`. No existe recibo externo de backup/restauración completos |

La evidencia conversacional indicada no sustituye a un manifiesto criptográfico almacenado ni demuestra la cobertura de todos los objetos, Auth, roles y configuraciones del Supabase alojado. No confundir el fallo anterior de salida Windows `NUL` con corrupción del GPG: posteriormente se informó el descifrado correcto.

## Archivos corregidos

- `AGENTS.md`: regla **prioritaria y obligatoria**, antes de cualquier procedimiento de seguridad, con hitos ya realizados, límites de evidencia, pendientes y prohibición de repetir cifrado por defecto.
- `agent.md`: portada explícita con estado de GPG, descifrado, recuperación parcial, roles pendiente y enlaces al documento rector; actualizado el checkpoint de código a BT-COM-01D.
- `roadmap.md`: nota destacada **al inicio** diferenciando claramente backup GPG local, restauración parcial, problemas de roles y flujo Drive bloqueado.

## Próxima tarea correcta

Con el usuario en su PC:
1. Localizar y preservar `database.dump.gpg`, `roles.sql.gpg` y keyring/clave privada existente sin recrearlos ni sobrescribirlos.
2. Revisar inventario no sensible de nombres/tamaños y hashes SHA-256, verificar acceso local al descifrado existente **sin compartir claves/contraseñas ni volcar datos al chat**.
3. Diagnosticar específicamente exportación de roles; no asumir que `roles.sql.gpg` es recuperable.
4. **Reutilizar la restauración SQL aislada ya ejecutada** y su comprobación de siete tablas; completar **únicamente lo que no quedó acreditado**: recuperación de roles, Auth, RLS/FK adicionales, Storage y configuración. Un nuevo ensayo solo si surge una brecha concreta y se documenta su motivo; Drive automático es otra fase distinta, con autorizaciones separadas.

No activar migraciones/CP05/LIVE-02/correos ni declarar piloto listo solo por esta corrección documental. **BT-PILOT-QA-04: A REPASAR**.

**Referencias de progreso:** `docs/checkpoints/CHECKPOINT_BT_BACKUP_AUDIT_20261117.md`, `docs/checkpoints/CHECKPOINT_BT_DRIVE_OAUTH_PROVISION_20261117.md`, `docs/BT_BACKUP_GHA_02.md`. Esas fuentes describen el workflow cloud no ejecutado con éxito; no niegan el respaldo local del PC.


## Aclaración de continuidad incorporada el 19/11/2026

El propietario recordó expresamente que **también se había hecho la restauración en entorno aislado**. Se revisó el contexto histórico de la sesión del 17/11: la restauración **SQL** se completó y se informó como correcta; los contadores y la paridad de siete tablas se verificaron. La palabra anterior «parcial» se refería a la **cobertura de comprobación frente al proyecto Supabase integral** y era ambigua. Esta aclaración no crea una validación nueva ni declara recuperables los roles, el contenido de Storage o las configuraciones externas.

**Regla nueva:** a partir de ahora cada chat debe leer los archivos de continuidad antes de instruir, y al concluir una tarea actualizar `roadmap.md`, checkpoint y `agent.md`. Detalles en [AGENTS.md](../../AGENTS.md) y [CHECKPOINT_BT_SEC_AGENT_RESTORE_20261119.md](CHECKPOINT_BT_SEC_AGENT_RESTORE_20261119.md).
