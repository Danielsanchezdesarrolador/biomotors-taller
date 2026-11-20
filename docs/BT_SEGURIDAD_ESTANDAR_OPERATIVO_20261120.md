# BYTETORQUE — ESTÁNDAR OPERATIVO DE SEGURIDAD, CIFRADO Y RECUPERACIÓN
**Fecha de investigación:** 20/11/2026 · **ID:** BT-SEC-OPERATING-STANDARD-20NOV-01
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama:** `main`
**Estado:** investigación de fuentes verificadas y plan adoptado a nivel documental, **NO ejecución ni certificación** de controles pendientes. Sin datos personales, claves ni SQL de clientes.

## 0. Decisión de producto del titular — Google Drive RETIRADO

**El propietario decide que Google Drive no es un destino deseado para respaldos de ByteTorque.** Desde este checkpoint:
- **RETIRAR de toda planificación activa** subir backups GPG a Google Drive, resolver OAuth `drive.file`, autorizar carpetas, o aprovisionar un nuevo destino Drive. No consumir más tiempo ni costos intentando este flujo.
- **Conservar como referencia histórica** incidentes SEC-10 a SEC-14, artefactos y checkpoints que expliquen errores antiguos; no reescribirlos como éxitos ni borrarlos como si no hubieran existido.
- Quedan **scripts y workflows manuales legados** en `scripts/backup/` y `.github/workflows/`: `bt-encrypted-backup.yml`, `bt-provision-drive-folder.yml` y `bt-readonly-drive-diagnostic.yml`. **NO ejecutarlos.** Su retiro/desactivación del código se preparará como limpieza separada, con revisión de dependencias y aprobación del propietario; no se borran automáticamente en este commit documental.
- **El cifrado NO se elimina.** Mantener GPG/OpenPGP en backups existentes. No seleccionar un servicio externo alternativo por cuenta propia. La protección fuera del PC sigue siendo una **necesidad de recuperación**, pero se evaluará una copia cifrada en soporte físico separado o un destino no Google solo con aprobación concreta.

## 1. Investigación comparada — qué hacen proyectos profesionales verificables

| Referencia pública estudiada | Método sustentado | Adopción específica para ByteTorque | No hacer / limitación |
|---|---|---|---|
| [PostgreSQL 17: Backup & Restore](https://www.postgresql.org/docs/17/backup.html) y [PITR](https://www.postgresql.org/docs/17/continuous-archiving.html) | Distinguir dumps lógicos, copia física y archivado WAL/PITR | Usar dumps lógicos verificables en Supabase administrado; establecer RPO/RTO y pruebas de restore | No suponer acceso al WAL ni a los archivos físicos de un servicio gestionado |
| [Supabase: Restore Platform → Self-Hosted](https://supabase.com/docs/guides/self-hosting/restore-from-platform) | Procedimiento específico de `roles.sql`, `schema.sql`, `data.sql` usando `supabase db dump` con filtros de esquemas/roles administrados; preinstalar extensiones; separar servicios externos | Tomarlo como **referencia principal para futuro respaldo recuperable**, comparar cobertura con dump cifrado actual y preparar exportador nuevo **solo tras autorización** | El `pg_dump -Fc` bruto existente puede contener objetos internos incompatibles con PostgreSQL genérico; no equiparar un restore fallido con ciphertext corrupto |
| [Supabase: Database Backups](https://supabase.com/docs/guides/platform/backups) | Backups gestionados de pago, límites de Storage, distinción diario / PITR | No contar con copias diarias gestionadas en plan Free; definir respaldo independiente y comprobar cobertura de Storage bytes | No asumir que una copia de PostgreSQL incluye blobs Storage o credenciales de todos los roles |
| [Supabase Postgres GitHub](https://github.com/supabase/postgres) | Distribución PostgreSQL y extensiones construidas/fijadas por versión mayor, incluido PG17 | Investigar imagen PG17 compatible con las extensiones **efectivamente requeridas**; laboratorio Docker aislado sin red ni puertos | No usar `postgres:17` vanilla como equivalente universal; no instalar extensiones a ciegas en producción |
| [restic GitHub](https://github.com/restic/restic) y [design](https://github.com/restic/restic/blob/master/doc/design.rst) | Integridad, autenticación, snapshots, repositorios, comprobaciones y restauración verificable | Exigir inventario, manifiesto, retención y pruebas periódicas de restauración; considerar restic solo para **copias de ficheros ya cifrados** si posteriormente aporta valor | No migrar hoy de GPG ni superponer cifrados sin plan de claves; restic no sustituye el dump compatible de Supabase |
| [pgBackRest GitHub](https://github.com/pgbackrest/pgbackrest) | Backups/restore PostgreSQL, repositorios separados, retención, paralelización | Adoptar runbooks, selección de repositorio, pruebas de recuperación e inventario por componente | Backup físico pgBackRest puede exigir acceso privilegiado al servidor, no asumir disponible en Supabase administrado |
| [WAL-G GitHub](https://github.com/wal-g/wal-g) y [backup verification](https://github.com/postgresql-tools/wal-g/blob/main/docs/BACKUP-RECOVERY.md) | Verificación, archiving y recuperación de bases | Adoptar controles separados de preparación, verificación, integridad y recuperación | No activar WAL archiving desde el cliente de un PostgreSQL gestionado |
| [BorgBackup GitHub](https://github.com/borgbackup/borg) | Backup de ficheros con cifrado autenticado, compresión/deduplicación | Referencia de custodia y verificación para archivos de backup | No sustituir esquema/roles Auth por copiar solamente archivos de código |
| [SOPS GitHub](https://github.com/getsops/sops), [OWASP Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html) | Separación de secretos y código, gestión del ciclo de vida, recuperación de claves | Mantener GPG aislado y custodia de **clave privada recuperable** separada del dump; no guardar secretos en GitHub | No inventar criptografía propia ni regenerar claves antiguas por errores de GNUPGHOME |
| [OWASP Multi-Tenant Security](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html) | Validar aislamiento en todos los niveles, pruebas negativas y BYPASSRLS | Validar A/B cruzado de cada ruta: cliente, vehículo, OT, documentos, Storage, RPC y Super Creador | Tener RLS habilitada no demuestra ausencia de bypasses o fallos de aplicación |
| [GitHub Actions Secure Use](https://docs.github.com/en/actions/reference/security/secure-use) | Mínimo permiso, protección secretos, dependencias fijadas por SHA/lockfile | Auditoría de workflows, permisos `GITHUB_TOKEN`, `CODEOWNERS`/escaneo y dependencias; controlar repo público | No activar workflow que exporta datos reales solo porque exista CI verde |
| [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html), [ENISA backup guidance](https://www.enisa.europa.eu/sites/default/files/2025-06/ENISA_Technical_implementation_guidance_on_cybersecurity_risk_management_measures_version_1.0.pdf) | Separación clave/datos, cifrado estándar, copia offline, integridad y ensayos de recuperación | Reducir riesgo ante ransomware y pérdida del PC con duplicación física separada y pruebas de recuperación | Un hash local sin respaldo protegido contra alteración o una sola copia conectada no acredita resiliencia |

**Criterio metodológico:** estos proyectos y guías muestran prácticas abiertas y públicas. No se ha investigado ni demostrado el stack privado de una empresa específica ni se certifica el proyecto por imitar herramientas. La adaptación es proporcional a recursos y al carácter **administrado** de Supabase.

## 2. Arquitectura mínima propuesta — sin Google Drive

### A. Exportación y contenido recuperable
1. **Inventario de componentes**: PostgreSQL esquemas/tablas/datos, RLS, funciones/grants/roles que exporta el acceso disponible; Auth (`auth.users` en alcance oficial), configuración Auth/OAuth/SMTP/JWT **por procedimiento separado**, Storage metadatos vs bytes, Edge Functions/configuración y secretos por inventario sin publicarlos, configuración de Render/GitHub reproducible.
2. **Exportación correcta**: contrastar nuestro `pg_dump -Fc` actual con método recomendado `supabase db dump` separados roles/schema/data, con filtros de Supabase; versiones explícitas de CLI/PostgreSQL/imagen/extension. **No ejecutar otra exportación hasta aprobar diseño y prueba sintética**.
3. **Cierre atómico**: comprobar productores exit=0, bytes descifrables no cero, PGDMP/TOC o formato esperado, cifrado sin SQL plano escrito, hashes SHA256 de ciphertext, manifiesto con ID inmutable, timestamp UTC, versión, estado y alcance, publicado al terminar; estados parciales nunca cuentan como backup sano.
4. **Separación de responsabilidades**: quien ejecuta export no debe disponer de autorización para modificar producción. El restore se ejecuta en un laboratorio con contenedor aislado, cero puertos y cero conexión a Supabase.

### B. Claves y cifrado
1. **Conservar OpenPGP/GPG existente**, no rehacer criptografía ni perder capacidad de descifrar respaldos anteriores. El archivo cifrado y su clave privada no deben custodiarse únicamente en el mismo PC.
2. Verificar destinatario y subclave de cifrado con el GNUPGHOME **histórico aislado** ya localizado; no usar anillo predeterminado por accidente; restaurar ambiente después de cada ejecución.
3. Antes de automatizar, diseñar custodia y recuperación **autorizada** de la clave privada/contraseña, fuera de GitHub, chats, logs, Render y ubicaciones públicas. No exportar clave privada ni compartir huellas sensibles por defecto. Ensayar acceso a la clave mediante un control autorizado con datos sintéticos.
4. SHA256 de archivo sirve para detectar modificación accidental respecto a un manifiesto de confianza, **no demuestra autoría ni protege frente a atacante que altere simultáneamente backup y manifest**; considerar firma/recibo autenticado guardado separadamente.

### C. Copias independientes y retención
1. **Estado presente:** una copia cifrada nueva en PC. Es un avance, pero no satisface por sí solo redundancia, disponibilidad tras pérdida del PC o recuperación integral.
2. **Opción preferida para piloto, pendiente aprobación**: segundo soporte externo SSD/USB cifrado, copia verificada y **desconectada** después del uso, guardada en una ubicación física independiente. El medio se entrega nunca sin cifrar, y la clave/contraseña se custodia separadamente.
3. No usar Drive. Ningún otro proveedor online se configura implícitamente. La regla orientadora **3-2-1** se registra como objetivo de resiliencia, **NO estado cumplido**.
4. **Política inicial a decidir (no activada)**: respaldo diario; 7 copias diarias + 4 semanales + 3 mensuales, condicionado a espacio, confidencialidad y derecho de eliminación/retención; copia externa desconectada con cadencia definida por el propietario; prueba de recuperación al activar piloto, tras migraciones críticas y periódicamente. Evitar `prune`/eliminación automática hasta tener al menos una restauración certificada y copia independiente.
5. **Objetivos orientativos por validar**, no garantías: RPO máximo 24 h solo si existe respaldo diario confirmado; RTO objetivo 4 h solo después de cronometrar un simulacro satisfactorio. Registrar el tiempo **real** de las pruebas.

### D. Seguridad del SaaS y CI
1. Definir amenaza y criticidad: acceso entre talleres (P0), propietario/creador, filtración de credenciales, pérdida del PC, fuga de PDF/Storage, rollback defectuoso, cambio migración, secuestro de cuenta.
2. **Matriz real de control**: tests A/B por fila y endpoint para clientes/vehículos/OT/PDF/cotizaciones, mecánico vs admin vs creador, acceso revocado, `SECURITY DEFINER`, ausencia de `service_role` en frontend, administración de plan y expiraciones. Incluir casos negativos con resultados registrados. RLS+FORCE como defensa en profundidad, no sustituto de validación server.
3. Depurar privilegios y secretos de GitHub Actions (escaneos de secretos/dependencias, permisos mínimos, pin a SHA, CI que falla correctamente); revisar repo actualmente público sin asumir filtración ni alterar visibilidad sin orden del propietario. Proteger `main` con controles compatibles con la rama única autorizada.
4. Registrar cada incidente con: id, fecha, causa probada vs hipótesis, evidencia sanitizada, solución, prueba de cierre y estado; distinguir `PREPARADO`, `PROBADO EN SINTÉTICO`, `PROBADO CON DATOS AISLADOS` y `CERTIFICADO PARA PILOTO`.

## 3. Roadmap de seguridad actualizado — prioridades y condiciones de salida

| Etapa | Prioridad | Acciones acotadas | Prueba exigida para cerrar |
|---|---|---|---|
| **BT-SEC-R1 — Identificar extensiones** | P0 / ahora | Ejecutar inventario offline ya entregado `BT_SEC07_EXTENSION_INVENTORY_20261119.zip` sobre **EL MISMO** backup nuevo cifrado, sin exportación remota. | Nombre/clase de extensiones faltantes y relación con contenedor, hashes originales inalterados. |
| **BT-SEC-R2 — Recuperar snapshot actual** | P0 | Elegir entorno PG17 Supabase-compatible para laboratorio aislado, versión controlada; único ensayo de recuperación del backup existente, sin suprimir objetos para esconder errores. | Restore completa en laboratorio y paridad conteos/esquemas/RLS/funciones/grants en alcance + reporte de limitaciones. |
| **BT-SEC-R3 — Método oficial Supabase** | P0 | Validar viabilidad de CLI roles+schema+data filtrados, cobertura Auth/Storage/Edge, proteger credenciales y clave de recuperación. | Nueva exportación SOLO si necesaria y autorizada; pruebas reales de restauración/verificación de roles y datos sin PII en logs. |
| **BT-SEC-R4 — Tenancy/Auth/privilegios** | P0 antes piloto | Matriz A/B, roles mecánico/admin/creador, `SECURITY DEFINER`, protección de contraseñas filtradas y sesiones, rutas/Storage PDF privados. | Pruebas negativas reales por rol y tenant sin acceder a terceros; vulnerabilidades críticas cerradas. |
| **BT-SEC-R5 — Segunda copia y recuperación de claves** | P1 antes piloto con datos críticos | Elegir soporte no-Drive (físico externo desconectado recomendado), custodiar clave privada/recuperación y replicar copia cifrada verificada. | Readback de copia independiente y recuperación real, evidencias de acceso al material de recuperación, sin exposición. |
| **BT-SEC-R6 — Operación recurrente** | P1 / después | Cadencia y retención aprobadas, alertas de fallo, backups programados, recibos, ensayos periódicos, restauración después de migración. | Ejecuciones registradas y simulacros exitosos; no dar por hecho RPO/RTO hasta medir. |
| **BT-SEC-R7 — Higiene GitHub y legado** | P1-P2 | Revisar historial y escaneo de secretos; auditar workflows, pinning, tokens y dependencias. Inventariar y **retirar ordenadamente** código/workflows Google Drive legados como deuda técnica, sin ejecutarlos ni alterar backup existente. | Tests locales/CI, sin cambiar secretos ni borrar accidentalmente herramientas necesarias; aprobación separada para desactivar/eliminar workflows. |

### Estado inicial de cada puerta (20/11)
- `R1` **PREPARADO, PENDIENTE WINDOWS** (ZIP probado sintéticamente 16/16 en asistente).
- `R2` **BLOQUEADO** (GPG/bytes correctos, `pg_restore` falla por `EXTENSION_UNAVAILABLE`).
- `R3` **PENDIENTE** (`roles.sql.gpg` antiguo 0 bytes; metadata de roles actual NO equivale a DDL).
- `R4` **PARCIAL** (RLS existente, auditorías negativas completas no cerradas).
- `R5` **PENDIENTE** (una copia PC no cumple redundancia y copia fuera de PC no se aprobó).
- `R6` **NO IMPLEMENTADO / REQUIERE APROBACIÓN**.
- `R7` **PENDIENTE** (repo actualmente `public` según metadatos GitHub; workflows Drive manuales todavía presentes).

## 4. Próximo paso exacto

**NO empezar desde cero ni ejecutar más dumps.** Ejecutar el inventario offline de extensiones que ya está preparado, con su SHA256 indicado en [checkpoint de cierre de 19/11](checkpoints/CHECKPOINT_BT_SEC07_CIERRE_JORNADA_20261119.md); analizar salida sanitizada; elegir una imagen de ensayo compatible **después** de conocer extensión requerida y antes de cualquier nuevo restore. Mantener piloto `BT-PILOT-QA-04: A REPASAR` hasta evidencias de recuperación y permiso de activación.

## 5. Referencias y alcance

Fuentes públicas: PostgreSQL docs, Supabase docs y repos `supabase/postgres`, `restic/restic`, `pgbackrest/pgbackrest`, `wal-g/wal-g`, `borgbackup/borg`, `getsops/sops`, `cloudnative-pg/cloudnative-pg`; OWASP, ENISA, GitHub Actions. Las decisiones sobre RPO/RTO, cadencia, retención, SSD y prioridad son **propuestas adaptadas a ByteTorque**, no compromisos existentes ni prácticas demostradas de empresas específicas.

**Regla de certificación:** `backup cifrado creado` ≠ `backup recuperable` ≠ `recuperación integral` ≠ `seguridad total`.
