# CHECKPOINT 58 — BT-SEC07-R3-CHAT-CONTINUITY-V2-WINDOWS-PENDING

**Fecha:** 20/11/2026 (Chile) · **Rama:** `main` · **HEAD revisado:** `1be3b7fbf51e24d5933e4b0636c5e071a911fe4a` (CP57).

## Propósito y alcance
Continuidad al cambiar de conversación. **Este checkpoint NO representa una nueva ejecución Windows ni una certificación del respaldo.** Se revisaron en GitHub `AGENTS.md`, `agent.md`, `roadmap.md` y [CP57](CHECKPOINT_BT_SEC07_R3_MANIFEST_WINDOWS_V2_REGRESSION_FIX_20261120.md). No se ejecutaron pruebas locales en el PC propietario, ni se accedió a archivos de respaldo, ni se consultó Supabase/DB, ni se desplegó código.

## Estado comprobado
- V1 de manifiesto: Windows real `48 tests`, 15 fallas, 5 errores, 2 omitidos, `BT_SEC07_MANIFEST_TESTS: STOP`; no se abrió selector. **V1 obsoleto**.
- V2 documentado: `BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V2_20261120.zip`; tamaño 10777 B; SHA-256 `950651ceed451e4156847e3af8b02cdb888f3856a479467e3905cb6ddcab92fe`; 53/53 tests sintéticos PASS antes y después de ZIP en entorno anterior. Las discrepancias de metadatos Windows se simularon, **no se certificaron en Windows real**.
- En esta conversación nueva no se dispone de copia local verificable del ZIP V2: la huella proviene del CP57, no de un archivo nuevamente inspeccionado. La verificación de hash se realizará **en el PC del propietario** antes de ejecutar.
- GitHub `get_repo` informó `visibility=public` para `Danielsanchezdesarrolador/biomotors-taller` en la revisión de traspaso. **No se modificó visibilidad**; contrastar con política deseada del propietario y tratar por separado.
- CP46 TLS PC→pooler `verify-full` confirmado; backend SSL `REPORTED_NO`, end-to-end `NOT_CERTIFIED`; CP48 SSL enforcement OFF observado visualmente. R3 roles/owners/ACL y restauración integral siguen pendientes. Roles SQL histórico vacío/inválido. No cambio SSL ni conexión remota nueva autorizada.

## Próxima operación autorizada y bloqueo
1. El propietario debe usar **solo** el ZIP V2 original entregado en el chat anterior y guardarlo como `Downloads\BT_SEC07_R3_MANIFEST_READONLY_WINDOWS_V2_20261120.zip`, **sin reutilizar V1**.
2. En PowerShell, ejecutar el bloque local del CP57 proporcionado previamente: comprobar presencia + SHA-256 exacto, extraer en TEMP, correr 53 pruebas sintéticas, **detenerse en cualquier `STOP`**; abrir selector de `manifest.json` **solo tras tests PASS**. Validación opcional del ciphertext por SHA/tamaño, sin GPG, descifrado, cambio de respaldo, SQL ni red.
3. El propietario enviará exclusivamente líneas `BT_SEC07_*`, sin rutas, respaldos, contraseñas, claves ni nombres de clientes. Una línea `PASS_LOCAL_CONSISTENCY_ONLY` valida solamente coincidencia interna manifiesto↔ciphertext: **no** autenticidad independiente, descifrado ni restore.
4. Con el resultado **real** de Windows, registrar el siguiente checkpoint con evidencia limitada y siguiente autorización. Si STOP, no reintentar ni producir ZIP nuevo antes de diagnosticar causa.

## Continuidad
`main` es la única rama autorizada. Esta revisión de traspaso solo agrega documentación con `[skip render]`; no cambia app, DB, permisos, backup, SSL, GPG ni Render. Continuar desde CP57/CP58 y respetar autorizaciones independientes para operaciones futuras.