# CHECKPOINT — BT-SEC-AGENT-RESTORE-01 · Gobernanza de agentes y restauración aislada SQL

**Fecha:** 19/11/2026.  
**Repositorio/única rama:** `Danielsanchezdesarrolador/biomotors-taller` / `main`.  
**Punto de partida:** `b684961c255a649948d69e0471e7d003d92e9ffc`.  
**Tipo de avance:** documentación y corrección de continuidad, **NO nuevas operaciones de backup, restore o infraestructura**.  
**Estado:** DOCUMENTADO; esta etapa no ejecuta restauraciones, exportaciones, despliegues ni cambios alojados. Commits `[skip render]`.

## Solicitudes del propietario y decisiones permanentes

1. **Antes de dar CUALQUIER instrucción sobre ByteTorque**, todos los chats/agentes (ChatGPT, Codex y colaboradores que consulten el repositorio) deberán leer el estado actual en `main`: **`AGENTS.md` → `agent.md` → `roadmap.md` → último checkpoint relevante en `docs/checkpoints/`**. Comprobar HEAD, pruebas, permisos, activaciones, bloqueos, autorizaciones y lo que ya se hizo. Si no hay acceso, comunicarlo; no reiniciar el trabajo basándose en suposiciones. Aplica también al redactar prompts o pasos en PowerShell.
2. **Después de finalizar CUALQUIER tarea real**, actualizar `roadmap.md`, crear/actualizar un checkpoint con **qué se hizo, qué falta, qué se comprobó y qué NO**, y actualizar `agent.md` con último checkpoint y enlace; las reglas permanentes van también en `AGENTS.md`. Informar en el chat el commit, evidencia, situación de publicación, pasos pendientes y siguiente acción. Si el trabajo se bloquea, documentar el bloqueo como tal. No usar aprobaciones de cambios documentales para desplegar ni ejecutar operaciones alojadas.
3. **No repetir trabajos ya completados**, especialmente cifrado GPG y recuperación SQL aislada. Confirmar evidencia histórica; no presentar la ausencia de prueba de componentes externos como si nunca se hubiera restaurado la base.

## Evidencia de restauración del 17/11/2026 — alcance exacto

El propietario recordó que hubo una restauración completa/funcional en un entorno aislado. Al recuperar contexto histórico de esa sesión y contrastarlo con los hitos documentados, queda establecido:

| Tema | Evidencia/estado |
|---|---|
| Claves y cifrado GPG | Ya realizados en Windows; NO recrear ni repetir sin causa documentada |
| `database.dump.gpg` | Archivo cifrado local reportado de 89.091 bytes; `BASE_DESCIFRADO_OK`, `ARCHIVO_POSTGRES_OK` y `CATALOGO_OK` |
| Restauración de base **SQL** en contenedor aislado | **SÍ SE EJECUTÓ Y FUE FUNCIONAL** en el alcance validado. Resultados: `BT_DATOS: RLS_ACTIVA=7 POLITICAS=16`, `BT_REGISTROS: TABLAS=7 FILAS=25`, `BT_PARIDAD: SIETE_TABLAS_COINCIDEN` |
| Qué significa «parcial» | **La cobertura de la prueba**, limitada a las siete tablas/indicadores; no significa que no se realizó restauración SQL |
| `roles.sql.gpg` | 151 bytes reportados; extracción de roles `ROLES_ORIGEN_FALLA_NO_CLASIFICADA`; no dar por válido ese respaldo de roles |
| Recuperación integral de plataforma Supabase | **NO ACREDITADA** para roles, todos los componentes de Auth, objetos de Storage, configuración/proveedores, Edge, secretos externos; requiere inventario/validación focalizados |
| Respaldo automático GitHub → Drive | Otra línea de trabajo; bloqueado por OAuth `drive.file`, sin recibo de exportación/recovery cloud verificado |

**No inventar una prueba de recuperación de Storage, roles o Auth que no aparece en las fuentes**. Tampoco borrar, reemplazar ni recrear por defecto el GPG local. Los mensajes de restauración de 7 tablas son evidencia histórica, no una nueva prueba realizada en esta tarea.

## Documentación editada

- **`AGENTS.md`**: regla superior obligatoria de prelectura y registro final, aclaración de recuperación SQL exitosa y separación de cobertura parcial.
- **`agent.md`**: índice obligatorio en cada chat, estado de respaldo/restauración y enlaces de continuidad.
- **`roadmap.md`**: aviso prioritario inicial con ambas reglas, la restauración SQL comprobada y los faltantes sin duplicar lo ya hecho.
- **`docs/checkpoints/CHECKPOINT_BT_SEC_BACKUP_CONTINUIDAD_20261119.md`**: corrección del término ambiguo «restauración parcial» y del siguiente paso, preservando la evidencia original.
- **Este checkpoint**: entrega, pruebas/documentación y lo pendiente.

Commits de edición previos a este checkpoint: `c4c7e7d8` (AGENTS), `9b1e0940` (agent), `6bd5a891` (roadmap), `ffe67a0e` (aclaración de checkpoint anterior).

## Próximo paso, sin rehacer

**Desde la PC del propietario:** solo localizar/verificar preservación de los GPG y el keyring ya existentes, constatar hash e integridad sin compartir secretos y **resolver el respaldo de roles** que quedó defectuoso. Luego verificar específicamente lo que falte para suficiencia de recuperación integral de Supabase; **no repetir la restauración SQL de siete tablas como primer paso**. El respaldo en Drive es independiente y requiere resolver autorización OAuth sin ampliar permisos arbitrariamente.

**Resguardos:** trabajar solo en `main`; sin cambios en Render, Supabase alojado, roles, Auth, Storage, claves, correos, planes, Drive o datos reales en este checkpoint. **BT-PILOT-QA-04: A REPASAR**; no activar CP05, FLOW-LIVE-02 ni módulos COM hasta cumplir los requisitos y autorizaciones vigentes.
