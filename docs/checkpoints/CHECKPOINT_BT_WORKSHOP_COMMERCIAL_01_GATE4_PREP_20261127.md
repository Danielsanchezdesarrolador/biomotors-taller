# BT-WORKSHOP-COMMERCIAL-01 — preparación de instalación GATE4

27/11/2026 UTC. Titular autorizó expresamente incorporar la cuarta barrera, actualizar checkpoints y preparar instalación coordinada, manteniendo controles pendientes. Esta autorización NO ejecuta SQL, ready, Render ni reapertura.

## Artefactos
- Original [CANDIDATE](../sql/BT_WORKSHOP_COMMERCIAL_01_CANDIDATE.sql) conserva blob 9b1f2f42ca9edbbe6928fd7157ec18bef8caedf4, sin cambios.
- [INSTALL_GATE4](../sql/BT_WORKSHOP_COMMERCIAL_01_INSTALL_GATE4.sql): variante derivada del candidato exacto; añade únicamente preflight tras BEGIN (postgres, esquema/estado comercial ausentes, tres ACL cerradas y huellas de los cuerpos originales) y cierre de bt_commercial_status(uuid) más postflight de cuatro ACL antes del único COMMIT. Conserva íntegro el postflight interno del candidato. Si falla cualquier guarda, aborta transacción. No ejecutar CANDIDATE directamente ni revocar la cuarta en una transacción posterior.
- [GATE_OPEN actualizado](../sql/BT_WORKSHOP_COMMERCIAL_01_GATE_OPEN.sql): requiere instalación comercial y cuatro ACL cerradas, concede EXECUTE exclusivamente a authenticated en las cuatro RPC y verifica sus permisos efectivos. El GATE_CLOSE de tres RPC ya ejecutado se conserva histórico sin cambios.
- Workflow manual de Edge y SHA de paquetes aprobados intactos. READY_SQL_GATE_VERIFIED solo tras instalación GATE4 y 12/12 denegaciones verificadas; no disparar en este momento.

## Cobertura revisada
CP05 documentHandlerCandidate usa bt_plan04_operations_status; finalArchivePorts exige bt_final_archive_document para lectura y bt_final_archive_source para archivo/recheck; commercial/documentHandler usa bt_commercial_status antes de draft/multipunto. La cuarta no existe antes de migrar y se cierra dentro de la transacción. meteredDocument usa reserva authenticated y finish/cache service_role. La reserva directa sigue siendo una RPC de negocio del candidato (puede escribir reservas, no entregar bytes por sí sola); esta barrera documental de cuatro no es una congelación global de escrituras. Mantener ventana sin editores y revisar cobertura/ACL del resto de rutas antes de autorización de instalación; no cambiar contratos ajenos sin decisión explícita. No asumir que la barrera invalida URLs antiguas.

## Validación y límites
Comprobación estática focalizada: quitar los dos bloques añadidos reconstruye exactamente el texto original leído; único BEGIN/COMMIT, cierre antes del COMMIT, cuatro firmas en preflight/postflight de reapertura y GRANT limitado a authenticated. El primer intento de generación fue rechazado antes de publicar por sustitución JS de delimitadores SQL; se corrigió usando callbacks literales y comparación exacta. No ejecutado en PostgreSQL ni validado runtime; no repetir CI de código intacto. El SQL debe pasar comprobaciones de ejecución y ACL cuando se autorice; no certificar instalación por revisión estática. El resultado HTTP_FREEZE_PASS previo (3/3, 503, cero bytes) y drenaje mínimo se conservan si la barrera permanece acreditada.

## Secuencia pendiente (no ejecutar automáticamente)
1. Resolver incertidumbre residual material sobre convergencia global y URLs firmadas históricas; evidencia de código/logs no constituye garantía global. Si insuficiente, mantener freeze y consultar proveedor. Revisar alcance de rutas de negocio expuestas durante mantenimiento; no abrir sin decisión.
2. Confirmar vigencia de respaldo/ventana sin editores, estado real de tres RPC, freeze, 16 PDF o reconciliar diferencias; autorización específica de instalación.
3. Ejecutar INSTALL_GATE4 como una única transacción; verificar cuatro RPC 12/12 denegaciones, esquema, RLS, permisos de reserva/finish/cache y documentos intactos. Ante fallo, no instalar ready ni reabrir.
4. Workflow manual ready, main, READY_SQL_GATE_VERIFIED; verificar los tres paquetes, versiones, recursos, JWT y que cuatro ACL sigan cerradas.
5. Desplegar frontend compatible en Render con Auto-Deploy OFF; verificar versión y configuración; mantener flags correo/registro/logo/pagos OFF. Reapertura GATE_OPEN solo con evidencia suficiente de cese antiguo y autorización operativa; no usar apertura de tres firmas histórica.
6. Verificar las cuatro ACL restauradas, aislamiento, funcionamiento piloto y Básico/Plus/Full con aceptación humana; no confundir instalación con aceptación.

Estado: GATE4_PREPARED / HTTP_FREEZE_PASS / RELEASE_GATE_BLOCKED. Sin SQL alojado, cambios Edge/Render, Auth, Storage, datos, flags, Codex ni nuevas CI. [HTTP freeze checkpoint](CHECKPOINT_BT_WORKSHOP_COMMERCIAL_01_HTTP_FREEZE_PASS_20261127.md) y DTK-ERR-063 se conservan.
