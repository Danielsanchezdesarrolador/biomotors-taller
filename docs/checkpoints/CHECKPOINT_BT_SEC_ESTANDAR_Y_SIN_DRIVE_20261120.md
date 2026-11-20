# CHECKPOINT — BYTETORQUE ESTÁNDAR DE SEGURIDAD Y DECISIÓN SIN DRIVE
**Fecha:** 20/11/2026 · **ID:** BT-SEC-OPERATING-STANDARD-20NOV-01 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama:** `main`
**Alcance ejecutado:** investigación web oficial/GitHub + inspección de repo y documentos + planificación documental. **NO** ejecutada ninguna exportación, restauración, GPG, Docker, conexión Supabase ni workflow Drive.

## Decisión explícita del propietario
Retirar **Google Drive de los destinos y objetivos vigentes** de cifrado/respaldo del proyecto. No continuar OAuth `drive.file` ni subir archivos; las referencias SEC-10/14 se preservan solo como historial. **La necesidad de un respaldo independiente permanece**, sin proveedor elegido. Drive no se reemplaza automáticamente por otro servicio.

## Fuentes consultadas y conclusiones
- Supabase [restore-from-platform](https://supabase.com/docs/guides/self-hosting/restore-from-platform): `supabase db dump` filtra internals, exportación por roles/schema/data, necesita extensiones compatibles; Auth providers, Storage object bytes y Edge externos requieren acciones separadas.
- Supabase [database backups](https://supabase.com/docs/guides/platform/backups): no asumir backup gestionado diario de plan Free, Storage no incluido.
- PostgreSQL 17: [backup](https://www.postgresql.org/docs/17/backup.html), [PITR](https://www.postgresql.org/docs/17/continuous-archiving.html).
- GitHub reales: [restic](https://github.com/restic/restic), [pgBackRest](https://github.com/pgbackrest/pgbackrest), [WAL-G](https://github.com/wal-g/wal-g), [Supabase Postgres](https://github.com/supabase/postgres), [SOPS](https://github.com/getsops/sops), [CloudNativePG](https://github.com/cloudnative-pg/cloudnative-pg), [Borg](https://github.com/borgbackup/borg); OWASP [Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html) y [Multi-Tenant Security](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html).
- Las herramientas de backup **físico** requieren capacidad del servidor que no se asume en Supabase administrado; por ello se adoptan sus patrones de verificación y retención, no su instalación automática.
- Repositorio propio inspeccionado: `.github/workflows/bt-encrypted-backup.yml`, `bt-provision-drive-folder.yml` y `bt-readonly-drive-diagnostic.yml` siguen presentes y tienen `workflow_dispatch` manual; `scripts/backup/cloud_backup.py` permanece dependiente de Drive. Están **FUERA DE USO / LEGADO**, sin borrar código, workflows ni secretos en este checkpoint. `ci.yml` aún ejecuta tests de esos scripts, conservar hasta depurar dependencias.
- Metadatos API GitHub reportaron `private=false` en la consulta de 20/11, requiere revisar exposición/historial y decidir visibilidad con el titular; **no afirmar filtración**.

## Estado de trabajo y ruta de reanudación
**Hechos verificados por propietario ayer:** nuevo backup PostgreSQL actual cifrado, SHA GPG OK, GPG proceso OK, bytes no cero, falla de `pg_restore` en Docker 17 con clase `EXTENSION_UNAVAILABLE`; roles SQL ausentes, metadatos roles solamente. `BT-PILOT-QA-04: A REPASAR`.

1. **Siguiente acción exacta:** usar `BT_SEC07_EXTENSION_INVENTORY_20261119.zip` ya entregado; SHA256 `7e3a0a2a16d5d92ec5a2155ff041ab63db5bf4e54aa6d635b834e76c280536f9`; 16/16 QA asistente, ejecución Windows todavía pendiente. Solo compara TOC snapshot con controles de extensiones; sin nuevo dump ni restore.
2. Elegir imagen de laboratorio compatible, sin red, sólo tras inventario; ensayar recuperación del MISMO snapshot.
3. Preparar estrategia CLI Supabase para roles/schema/data con autorización expresa y cobertura de Auth, Storage object bytes, Edge y secretos.
4. Auditoría A/B por roles, creador y documentación PDF; cumplir criterios.
5. Segunda copia cifrada **fuera del PC, no Drive**, con destino propuesto/aceptado por propietario; custodia de claves por separado.
6. Política recurrente con recibos, retención y restauraciones periódicas **solo después de certificar**; mantenimiento de workflows legados con revisión/permiso.

**Artefacto principal:** [Estándar operativo investigado](../BT_SEGURIDAD_ESTANDAR_OPERATIVO_20261120.md).

## Control de cambios
Solo documentos `AGENTS.md`, `agent.md`, `roadmap.md`, informe nuevo y este checkpoint, más adendas históricas acotadas. Sin deploy Render, sin cambios a SQL/RLS/Auth, sin conexión Supabase, sin GitHub Actions, sin exportaciones a Drive, sin cambios a repositorio visibilidad y sin gasto aprobado.
