> **EVIDENCIA POSTERIOR CP48:** el propietario aportó captura del interruptor `Enforce SSL on incoming connections`, que aparece **OFF** (gris, perilla izquierda). **Observación visual del usuario, NO resultado GET del conector ni verificación API independiente.** CP47 era UNKNOWN porque no existía acción GET; ahora conocemos el estado visto en el panel, sin haber cambiado nada. **Activarlo requiere permiso independiente por reinicio de DB**. [CP48](CHECKPOINT_BT_SEC07_SSL_ENFORCEMENT_OFF_UI_OBSERVED_20261120.md).

# CHECKPOINT BT-SEC07-SSL-ENFORCEMENT-READONLY-LIMIT-47 — valor de SSL enforcement aún no comprobado

**Fecha:** 20/11/2026 (Chile). **Proyecto:** ByteTorque, Supabase `biomotors-taller`. **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller`, única rama `main`; **HEAD antes del checkpoint:** `231606c8dda8c27d97e50861203413caf30787ef`.

## 1. Autorización y límite
El propietario respondió `autorizo` a **consultar solo el estado actual del ajuste SSL enforcement**, sin activar/desactivar/reiniciar, y sin acceder a datos de clientes. No autorizó nuevas consultas SQL a PostgreSQL, creación de backups, modificación de roles/ACL, cambios SSL, GPG, ni despliegues.

## 2. Acciones realmente efectuadas
1. Se leyeron `AGENTS.md`, `agent.md`, `roadmap.md`, CP45, CP46, contrato R3 de exportación e informe de incidentes, y se verificó HEAD de `main`.
2. Con la **app Supabase conectada** se ejecutaron las acciones read-only `list_projects` y `get_project`. Coinciden en identificar el proyecto **`biomotors-taller`**, región **`sa-east-1`**, estado **`ACTIVE_HEALTHY`** y motor **PostgreSQL 17**. Por seguridad no se incluyeron ref, host, credenciales ni llaves en el repositorio.
3. Se inspeccionaron todas las acciones accesibles de la app Supabase. **No hay acción para consultar `/v1/projects/{ref}/ssl-enforcement`; `get_project` no informa el valor de SSL enforcement.** Resultado exacto del dato solicitado: **`UNKNOWN_NOT_OBSERVED`**. No extrapolar ON/OFF del estado ACTIVE_HEALTHY ni de la señal SQL backend.
4. La herramienta de búsqueda de documentación de Supabase y su [guía oficial de SSL enforcement](https://supabase.com/docs/guides/platform/ssl-enforcement) (actualizada 16/11/2026) confirman dos métodos de consulta: **Dashboard → Database Settings → SSL Configuration → «Enforce SSL on incoming connections»**, o **GET autenticado** del Management API `/v1/projects/{ref}/ssl-enforcement`. El conector actual no ofrece ese GET; no se proporcionó token personal para consultar la API directamente, por lo que **no se invocó ninguna API externa autenticada fuera del conector**. No pedir tokens/contraseñas en chat.
5. La fuente oficial aclara que en pooler compartido SSL enforcement gobierna **cliente → pooler** y **pooler → PostgreSQL**; **modificarlo implica reiniciar PostgreSQL**. No se modificó ningún ajuste. El changelog oficial se consultó como contexto público.

## 3. Evidencia anterior que NO cambia
CP46 registró Windows V2 `RO_V2_WINDOWS: PASS_CLIENT_TLS_ONLY`, `CLIENT_POOLER_TLS: CONFIRMED_BY_LIBPQ`, `TRANSACTION_READ_ONLY: ON`, `SERVER_MAJOR: 17`, `PRECHECK: PASS_SINGLE_READONLY_CONNECTION`; y **`DB_BACKEND_SSL: REPORTED_NO`, `END_TO_END_TLS: NOT_CERTIFIED`**. Esta última observación de una sesión **no demuestra cuál es el valor del ajuste de enforcement de todo el proyecto**, aunque justifica investigarlo. **INC-44** (diagnóstico V1 confundía backend con cliente) cerrado, **hallazgo SSL-UPSTREAM-OBSERVATION-46 abierto**. Las autorizaciones para los dos intentos psql ya se utilizaron, no repetir.

## 4. Cómo cerrar el dato sin comprometer secretos
Siguiente acción mínima: **el propietario observa manualmente el ajuste ON/OFF sin modificarlo** entrando a su Supabase Dashboard → `biomotors-taller` → **Database → Settings → SSL Configuration**. Solo compartir «activado», «desactivado» o «no aparece»; **no enviar PAT, project ref, URL ni capturas que revelen secretos**. Una consulta GET autenticada desde otro entorno requeriría una capacidad de acceso efectivamente disponible; no está habilitada en este chat. No simular éxito.

Si resulta OFF, **NO activarlo automáticamente**: evaluar clientes incompatibles, riesgo de reinicio y continuidad de Ignacio, con aprobación específica. Si resulta ON y el backend continúa reportando SSL NO, investigar sin atribuir causa automáticamente, con autorización nueva. No cerrar end-to-end TLS con solo el indicador ON del panel.

## 5. Protección y continuidad
**Cambios realizados:** solo documentación GitHub `main` con `[skip render]`; ningún dato privado de la BD se consultó, ninguna configuración Supabase se cambió, no se creó PAT/clave, no se ejecutó SQL, GPG, pg_dumpall, backup, Docker ni Render. No crear incidentes de producción por una limitación del conector.

R3 respaldo de roles reales/owners/ACL sigue pendiente; antiguo `roles.sql.gpg` descifra 0 SQL; causa del productor `ROLES_ORIGEN_FALLA_NO_CLASIFICADA`. R2 snapshot estructura PASS, no restauración integral, clave GPG histórica ya localizada. Piloto `BT-PILOT-QA-04 A REPASAR`. Drive fuera de alcance. No repetir labs 18/14/15, comparador V2 de metadata, restauración R2 o verificador TLS V2.

## 6. Traspaso
> Continuar ByteTorque SEC-07 solo en main. Leer AGENTS/agent/roadmap, checkpoint 46 y este checkpoint 47. Usuario autorizó consultar estado SSL enforcement exclusivamente read-only. App Supabase verificó proyecto biomotors-taller ACTIVE_HEALTHY PG17, pero no expone `ssl-enforcement` y `get_project` no incluye su valor: **UNKNOWN_NOT_OBSERVED**. Guía oficial indica Dashboard Database Settings SSL Configuration o GET Management API autenticado. No solicitar token por chat. Usuario puede mirar interruptor sin tocarlo y reportar ON/OFF. CP46 TLS cliente PASS, backend SSL REPORTED_NO, END_TO_END_TLS NOT_CERTIFIED. Nunca inferir valor ON/OFF de pg_stat_ssl. Cambiar enforcement reinicia DB y precisa permiso nuevo. Roles reales/ACL y cifrado integral pendientes, backup roles antiguo SQL vacío, piloto A REPASAR; no ejecutar SQL/backups ni pruebas repetidas. Registrar eventual observación manual con su naturaleza, sin afirmar auditoría independiente.
