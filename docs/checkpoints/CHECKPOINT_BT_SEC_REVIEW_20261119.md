# CHECKPOINT — BT-SEC-REVIEW-01 · Auditoría total de seguridad previa, Work/Astra y bitácora de incidentes

**Fecha:** 19/11/2026. **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **única rama:** `main`.
**Punto de partida:** `66fdc4811af1eda0b249bcc0e6de388c4acf6f3a`.
**Tipo de tarea:** auditoría histórica exhaustiva, conciliación de hechos con estado en vivo SOLO LECTURA, y **documentación**, NO mitigaciones productivas ni operaciones de respaldo.
**Resultado:** REGISTRO Y DIAGNÓSTICO COMPLETADOS. **No** significa seguridad integral certificada ni backup actual recuperable.

## 1. Material examinado (no inferir lo no visto)
- Reglas vigentes `AGENTS.md`, `agent.md`, `roadmap.md`, checkpoint BT-SEC-LOCAL-INVENTORY y checkpoints relacionados con BT-BACKUP, BT-DRIVE, BT-AUTH y BT-PLAN04.
- Código actual del exportador GitHub/GPG/Drive, YAML de workflows, scripts de clasificación TLS y provisión Drive.
- Historial de **13 ejecuciones manuales** de GitHub Actions: estados y códigos seguros en jobs. Especialmente [PostgreSQL 44084850284](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44084850284) SUCCESS; [Drive 44090498121](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44090498121), [44092168517](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44092168517), [44094695940](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44094695940) FAIL; los intentos de exportación 44074691722, 44085704801, 44087053869 FAIL. **No hay recibo cloud positivo**.
- Evidencia de la sesión Windows recuperada de conversaciones previas: instalación PostgreSQL 17, `C:\Program Files\PostgreSQL\17\bin` agregado al PATH de aquella sesión, GPG/Python/Docker, respaldo cifrado, error `NUL.part`, restauración aislada y paridad de 7 tablas. Incluye trabajo histórico de Work y Astra, sin afirmar exportación/restauración por esos agentes.
- Scripts de biblioteca: `ByteTorque_Diagnostico_Roles.py` y `ByteTorque_Restauracion_Aislada.py` (la rutina exacta de `bytetorque_respaldo_local.py` NO está presente para revisión línea por línea).
- Datos **de metadatos** obtenidos ahora de Supabase `suxcqqnmcjoezfxltoms` (listado de migraciones, tablas/RLS/grants resumidos, asesor de seguridad, buckets y Edge); estado `LIVE` obtenido de Render. **Ninguna lectura de filas de clientes, tokens, contraseñas o claves**.

## 2. Hechos importantes corroborados
1. PostgreSQL 17 **SE INSTALÓ** previamente en el PC, junto con Python/GPG y Docker. En nueva sesión PowerShell `pg_dumpall/psql` no están en PATH; no reinstalar por eso. Docker 29.9.3 reportado ahora.
2. `database.dump.gpg` (89.091 B) se cifró/descifró y se restauró SQL en Docker aislado; `BT_DATOS: RLS_ACTIVA=7 POLITICAS=16`, `BT_REGISTROS: TABLAS=7 FILAS=25`, `BT_PARIDAD: SIETE_TABLAS_COINCIDEN`. **No repetir esa prueba antigua sin causa**, aunque se requerirá un backup del estado actual.
3. `roles.sql.gpg` (151 B) descifra correctamente pero el contenido tiene **exactamente cero bytes** (GPG exit 0). Es inválido; causa precisa del fallo de su productor Windows **NO determinada**; fallo anterior `ENCRYPTED_EXPORT_FAILED` y `ROLES_ORIGEN_FALLA_NO_CLASIFICADA`. Conservar.
4. **Brecha de antigüedad:** nombre del backup del 17/11 14:41 UTC, anterior a migraciones actuales CP05 (15:48), Creador (17:07) y PLAN04A (18:41), verificadas en lista de migraciones Supabase. Una recuperación del dump anterior no puede recuperar ese estado posterior.
5. GitHub Work/Astra ayudaron con diagnósticos `libpq`, pgpass, errores Drive/OAuth y candidato de carpeta; verificaciones sintéticas 52/63/65/64. La conexión PostgreSQL del workflow está verificada con TLS y SELECT 1 en 44084850284. **No se produjo copia cloud con readback válido.**
6. **Corrección de evidencia histórica:** el checkpoint BT-DRIVE-OAUTH-PROVISION se escribió antes de que se ejecutara `BT-DRIVE-PROVISION`. Run **44094695940 SÍ ocurrió y falló** `DRIVE_FOLDER_INACCESSIBLE`. No repetir ni adoptar carpeta sin reconciliarla.
7. Supabase actual: ACTIVE_HEALTHY, PostgreSQL 17.11, **8 migraciones**, **12/12 tablas public RLS** (9 FORCE), **8 privadas RLS+FORCE sin SELECT directo para anon/authenticated**, **0 buckets**, solo `bt-owner-onboarding` Edge activa con JWT; **6 warnings sobre RPC SECURITY DEFINER**, **8 INFO de private RLS sin policies**, **1 WARN de protección de contraseñas filtradas desactivada**. Las tablas privadas sin policies reflejan diseño de acceso cerrado, no deben abrirse para silenciar lints. Las RPC pueden ser intencionales; requieren revisión de guardas en vez de revocación improvisada.
8. GitHub `PUBLIC` por autorización anterior temporal; workflow de exportación actual, manual, **tiene doble confirmación especial para repo público**. Render continúa LIVE `d8d6ed99`; no se desplegaron candidatos COM ni se crearon buckets CP05.

## 3. Archivos/documentos modificados
- **NUEVO:** `docs/BT_SEGURIDAD_AUDITORIA_RETROSPECTIVA_20261119.md` — 17 incidentes `SEC-01` a `SEC-17` con error → causa comprobada vs hipótesis → corrección → evidencia → estado, inventario de controles activos, límites y prioridades.
- `docs/checkpoints/CHECKPOINT_BT_DRIVE_OAUTH_PROVISION_20261117.md`: actualización **anexada sin borrar historia** con el run 44094695940 real y bloqueo vigente.
- `docs/BT_BACKUP_GHA_02.md`: aviso de estado actualizado al workflow actual (doble confirmación en repo público) y a la copia local inválida de roles / anterior a migraciones.
- `AGENTS.md`: **regla permanente de bitácora de errores** (registrar INC-ID, causa confirmada/hipótesis, solución y prueba/pendiente/condición de reintento), más advertencia contra instalaciones duplicadas y cambios irreversibles de Drive/GPG.
- `roadmap.md`: se antepone estado consolidado SEC-REVIEW-01, error/solución y próximo paso seguro.
- `agent.md`: entrada actualizada con informe, 17 incidentes, instalación PostgreSQL previa y prioridad de snapshot nuevo.
- Este checkpoint documenta qué se hizo y lo pendiente.

## 4. Lo que NO se hizo y riesgos
**NO:** nuevas exportaciones, cifrado o restauración; instalación PostgreSQL, cambio de PATH/usuarios, cambio de visibilidad de GitHub, ejecución de workflow, modificación de secretos, OAuth, Drive, Supabase SQL/RLS/Auth/Storage/Edge, correo, pagos ni despliegues Render. No se hizo escaneo completo del historial Git en busca de secretos ni pentest contra API; no afirmar ausencia de vulnerabilidades. No se ha probado recuperación del estado actual ni de todos los servicios externos.

## 5. Próximo paso exacto en el PC
Sin instalar ni editar entorno global: comprobar por ruta absoluta las herramientas ya instaladas:
```powershell
$bin = Join-Path $env:ProgramFiles 'PostgreSQL\17\bin'
foreach ($exe in @('pg_dumpall.exe', 'psql.exe', 'pg_dump.exe', 'pg_restore.exe')) {
    $ruta = Join-Path $bin $exe
    if (Test-Path -LiteralPath $ruta -PathType Leaf) {
        Write-Host "${exe}: ENCONTRADO"
        & $ruta --version
    } else {
        Write-Host "${exe}: NO EN ESA RUTA"
    }
}
```
Reportar solo nombres/versiones, sin contraseñas. Si están, revisar **solo** `bytetorque_respaldo_local.py` (no confundir con `scripts/backup/cloud_backup.py` del repo) para encontrar causa de `pg_dumpall` sin imprimir roles; si no están, inspeccionar ubicación existente antes de reinstalar. **Solo con autorización posterior:** crear ciphertext NUEVO de roles y un nuevo backup SQL del estado actual, luego restaurarlo en Docker aislado y comprobar cobertura completa razonable; Drive por separado.

**Mantener BT-PILOT-QA-04: A REPASAR.** Ninguna validación documental concede aprobación para empezar con datos auténticos de Ignacio.
