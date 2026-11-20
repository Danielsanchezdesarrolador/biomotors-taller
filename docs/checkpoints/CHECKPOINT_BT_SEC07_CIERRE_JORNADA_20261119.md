# CHECKPOINT DE CIERRE — ByteTorque SEC-07 · 19/11/2026
**Fecha de reanudación:** viernes 20/11/2026 · **ID:** BT-SEC07-CIERRE-19NOV-17
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama:** `main`
**Estado:** PAUSA VOLUNTARIA DEL PROPIETARIO; NO EJECUTAR MÁS PRUEBAS ESTA NOCHE.

## Lo que SÍ quedó conseguido
- Se creó un **nuevo backup cifrado PostgreSQL actual** en una carpeta **única** del PC del propietario: `BT_SEC07_NEW_ENCRYPTED_SNAPSHOT: OK_NEW_UNIQUE_DIRECTORY`.
- Verificada exportación solo lectura/TLS: `BT_SEC07_POSTGRES_READONLY_TLS: OK`.
- Metadatos de roles cifrados: `BT_SEC07_ROLES_CATALOG: OK_METADATA_ONLY` (**no son SQL de roles**).
- Verificación posterior del mismo ciphertext: `BT_SEC07_CIPHERTEXT_HASHES: OK`, GPG/clave histórica OK y flujo descifrado no vacío.
- Keyring histórico correcto: `%LOCALAPPDATA%\ByteTorque-GPG-Prueba\gnupg-aislado`; el anillo predeterminado carece de la clave privada. Usar `GNUPGHOME` temporal y restaurarlo siempre.
- Docker Desktop/Engine Linux operativo; imagen local PostgreSQL 17 verificada.
- Los archivos antiguos no se sobrescribieron y el manifiesto del snapshot nuevo quedó `UNCHANGED` tras el diagnóstico.

## Lo que NO quedó validado
- **Restore aislado completo FALLÓ**: `BT_SEC07_RESTORE: RESTORE_FULL_FAILED_IN_ISOLATION`.
- Evidencia nueva precisa: `BT_SEC07_GPG_PROCESS: OK`, `BT_SEC07_PG_RESTORE_PROCESS: FAILED`, `BT_SEC07_DECRYPTED_STREAM: NONZERO`, `BT_SEC07_PG_RESTORE_ERROR_CLASS: EXTENSION_UNAVAILABLE`, `DIAG_EXIT_CODE: 3`.
- No conocemos aún la extensión específica ni si surgirán otros fallos tras remediarla.
- `roles.sql.gpg` antiguo descifra a 0 bytes; aún no hay SQL de roles restaurable del proyecto. El histórico fallo `pg_dumpall` exit 1/stderr 75 bytes permanece SIN CAUSA RAÍZ.
- Auth externo, Storage object bytes, Edge Functions/secrets, segunda copia/Drive OAuth no completados.
- `BT-PILOT-QA-04: A REPASAR`. **No declarar recuperación total.**

## Primera tarea exacta de mañana
**Solo inventario local de extensiones del respaldo EXISTENTE.** El paquete ya fue preparado y enlazado en esta conversación, pero el propietario **todavía NO informó su ejecución**:

- Nombre: `BT_SEC07_EXTENSION_INVENTORY_20261119.zip`.
- SHA256: `7e3a0a2a16d5d92ec5a2155ff041ab63db5bf4e54aa6d635b834e76c280536f9`.
- Contenido: `BT_SEC07_Extension_Inventory_Offline.py`, `test_BT_SEC07_Extension_Inventory_Offline.py`, `LEEME_SEC07_EXTENSIONES.md`.
- QA asistente: 16/16 PASS; QA Windows: PENDIENTE.
- Ejecutar mediante el **bloque PowerShell ya entregado**: verificar ZIP, descomprimir en carpeta nueva, ejecutar pruebas offline, establecer `GNUPGHOME` histórico solo durante ejecución y restaurar valor en `finally`.
- Recoger únicamente `BT_SEC07_*` y `DIAG_EXIT_CODE`. **No ejecutar `pg_dump`, `pg_dumpall`, `pg_restore` completo ni conectar a Supabase hoy.**
- Tras inventario, planificar entorno PostgreSQL 17/Supabase compatible y restauración controlada del MISMO snapshot con permiso concreto, sin omitir objetos para falsificar PASS.

## Incidentes resueltos o acotados en esta jornada
1. PowerShell `else` separado: reemplazado por `& { ... }`.
2. Exportador original aceptaba GPG de SQL vacío/dir parcial: candidatos con validación y limpieza, 20/20 QA en Windows.
3. `HISTORICAL_MANIFEST_MISSING`: se dejó de exigir manifiesto histórico no generado.
4. `HISTORICAL_RECIPIENT_KEY_NOT_UNIQUELY_PRESENT`: GNUPGHOME predeterminado equivocado; keyring aislado histórico coincide.
5. Docker imagen supuestamente ausente: resultó bloqueo del daemon; motor Linux y PG17 revalidados.
6. Error de restauración genérico: diagnósticos separaron GPG OK de `pg_restore` FALLÓ y reconocieron `EXTENSION_UNAVAILABLE`.
7. Drive `drive.file`/carpeta: sigue bloqueado, independiente, **no reintentar** en este bloque.
8. Exportación roles `pg_dumpall`: sigue incierta; nunca atribuir sin evidencia.

## Prohibiciones y controles
No borrar/sobrescribir snapshot nuevo ni histórico, no modificar el manifiesto para marcarlo recuperado, no publicar .gpg/.pgpass/llaves, no repetir la exportación, no reconfigurar claves o roles, no tocar producción ni descargar/instalar extensiones a ciegas. Trabajo por **bloques grandes y un paso agrupado cada vez**. Solo `main`. Mantener `[skip render]` para cambios documentales.

## Archivos para continuidad
- **Informe completo:** [BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md](../BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md).
- **Checkpoint extenso del trabajo anterior:** [CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md](CHECKPOINT_BT_SEC_BACKUP_RECOVERY_PREP_20261119.md).
- **Repositorio:** [AGENTS.md](../../AGENTS.md), [agent.md](../../agent.md), [roadmap.md](../../roadmap.md).
- **Auditoría retrospectiva histórica:** [BT_SEGURIDAD_AUDITORIA_RETROSPECTIVA_20261119.md](../BT_SEGURIDAD_AUDITORIA_RETROSPECTIVA_20261119.md).

### Prompt para retomar en un nuevo chat el viernes 20/11
> Retoma ByteTorque exclusivamente en seguridad y respaldos, repositorio `Danielsanchezdesarrolador/biomotors-taller`, única rama `main`. Lee HEAD, `AGENTS.md`, `agent.md`, `roadmap.md`, `docs/checkpoints/CHECKPOINT_BT_SEC07_CIERRE_JORNADA_20261119.md` y `docs/BT_SEC07_INFORME_ERRORES_Y_SOLUCIONES_20261119.md`. El 19/11 se creó un NUEVO snapshot PostgreSQL cifrado y se verificaron hashes/GPG, pero restauración Docker falló con `PG_RESTORE_ERROR_CLASS: EXTENSION_UNAVAILABLE`. No hay recuperación completa ni roles SQL, piloto `BT-PILOT-QA-04: A REPASAR`. Próximo paso exclusivo: inventario offline de extensiones del MISMO respaldo con `BT_SEC07_EXTENSION_INVENTORY_20261119.zip` (SHA256 documentado; 16 pruebas asistente, Windows pendiente). No volver a ejecutar dumps ni conexiones remotas sin causa y autorización. Documenta resultados/incidentes y commits [skip render] en main; protege secretos y datos.

## BT-SEC07-DOCKER-MANUAL-START-18 · Aclaración posterior del propietario: solución concreta de Docker Desktop

El propietario añadió el mismo 19/11 después de recibir el checkpoint: **«Docker funcionó cuando abrí el programa, se me olvidó decirte eso»**. La secuencia real queda precisada así:

1. Primer intento: `BT_SEC07_STOP: DOCKER_ENGINE_NOT_READY` tras validaciones locales; no hubo backup en esa ejecución.
2. **Acción manual del propietario:** abrió la aplicación **Docker Desktop** en Windows.
3. Prueba posterior: `BT_SEC07_DOCKER_CONTEXT: LOCAL`, `DOCKER_ENGINE: RUNNING`, `DOCKER_LINUX: OK`, `PG17_IMAGE: PRESENT`. El ensayo posterior con PG17 se ejecutó, y se generó el snapshot cifrado nuevo.

**Solución operacional comprobada:** iniciar Docker Desktop manualmente y esperar a que Engine esté disponible. No se necesitaron reinstalaciones, cambios de PATH ni eliminación/recreación de imágenes. Que la aplicación estuviera cerrada o no iniciada **explica suficientemente el síntoma observado**, pero no prueba ningún diagnóstico profundo sobre WSL u otros servicios de Docker.

**Regla de continuidad:** si reaparece `DOCKER_ENGINE_NOT_READY`, comprobar primero que Docker Desktop esté iniciado y `docker version` responda; no saltar directamente a descargar la imagen, reiniciar WSL, reinstalar Docker ni eliminar volúmenes. Esta adenda **no cambia** el punto de reanudación: ZIP de inventario de extensiones ya entregado, Windows pendiente; no realizar nuevas exportaciones remotas. **BT-PILOT-QA-04: A REPASAR**.

## BT-SEC-OPERATING-STANDARD-20NOV-01 · Cambio de rumbo posterior al cierre: Google Drive fuera de roadmap activo (20/11/2026)

Por decisión expresa del propietario, **todas las referencias previas de este checkpoint a Drive/OAuth como pendiente quedan SUPERADAS**. Se conservan solo como historial forense de 19/11. No ejecutar su aprovisionamiento, scripts ni exportaciones; no modificar cifrado GPG ni respaldos históricos. La necesidad de copia independiente no depende de Google Drive; estudiar soporte físico cifrado offline u otro destino bajo autorización específica. Nuevo estándar y roadmap: [Documento técnico 20/11](../BT_SEGURIDAD_ESTANDAR_OPERATIVO_20261120.md) y [checkpoint 20/11](CHECKPOINT_BT_SEC_ESTANDAR_Y_SIN_DRIVE_20261120.md). Primera tarea técnica sin cambios: inventario offline de extensiones del backup nuevo, Windows pendiente.
