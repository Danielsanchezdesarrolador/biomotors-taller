# CHECKPOINT — BT-SEC07-SSL-ENFORCEMENT-OFF-UI-OBSERVED-48 · Dashboard indica OFF, sin tocar configuración

**Fecha:** 20/11/2026, hora local Chile · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **rama única:** `main` · **HEAD inicial:** `399c736b6471744e590166a7ec05d77637a1ec2d`.

## 1. Evidencia directa entregada por el propietario

El usuario abrió el ajuste SSL en el panel oficial de Supabase a petición del checkpoint 47 y aportó **una captura de «SSL configuration»**. En ella aparece el interruptor **«Enforce SSL on incoming connections»** con el botón blanco **a la izquierda y fondo gris**, correspondiente visualmente a **OFF / desactivado**. Texto en pantalla: «Reject non-SSL connections to your database».

**Resultado:** `BT_SEC07_SSL_ENFORCEMENT_UI: OBSERVED_OFF` (**observación de la captura del propietario**, no valor leído por la Management API ni verificación programática independiente). El estado de esta captura corresponde al momento en que fue tomada y no es prueba de un valor permanente. No subir la captura privada ni inventar identificadores ni contenido que no aparece.

**Limitación anterior:** el conector Supabase `list_projects/get_project` había confirmado `biomotors-taller` ACTIVE_HEALTHY, pero no incluía el estado de enforcement; el GET de Management API no estaba disponible. La observación **manual del panel ahora da un resultado visual** sin afirmar que el conector devolvió el dato. No se conectó de nuevo a SQL.

## 2. Conciliación con las pruebas TLS de CP46

- `BT_SEC07_REMOTE: CONNECTED_CLIENT_TLS_VERIFY_FULL`, `BT_SEC07_CLIENT_POOLER_TLS: CONFIRMED_BY_LIBPQ`: **PASS** para la sesión concreta PC → pooler con CA y verificación hostname.
- `BT_SEC07_DB_BACKEND_SSL: REPORTED_NO`: PostgreSQL observó una sesión backend sin SSL (pooler → PostgreSQL en ese flujo). El interruptor OFF es **consistente** con que no se obligue a usar SSL, pero **no demuestra por sí solo que todos los flujos internos o clientes estén en texto plano ni determina el origen preciso**.
- `BT_SEC07_END_TO_END_TLS: NOT_CERTIFIED`: permanece igual. Verificar el cifrado del cliente con SSL `verify-full` NO equivale a exigir TLS a todos los clientes ni a certificar el otro tramo.
- Nueva claridad: el ajuste **no obliga a rechazar conexiones PostgreSQL sin SSL** en el estado mostrado. No confundir «no obligatorio» con «ningún cliente usa SSL».

**Fuentes oficiales:** [Postgres SSL Enforcement — Supabase](https://supabase.com/docs/guides/platform/ssl-enforcement) indica que la política se cambia en Dashboard → Database Settings → SSL Configuration y que la modificación provoca **reinicio de la base** (posible indisponibilidad temporal). Una actualización de este ajuste **NO ha sido autorizada**.

## 3. Clasificación de seguridad y autorización

**Hallazgo `BT-SEC07-SSL-UPSTREAM-OBSERVATION-46`: causa de falta de exigencia SSL A NIVEL CONFIGURACIÓN, OBSERVADA en UI — enforcement OFF**. No cerrar la validación del tramo pooler → PostgreSQL por ese hecho: todavía hay que revisar compatibilidad y ejecución del cambio. **Riesgo de configuración:** se admiten conexiones sin SSL para clientes Postgres; mantener TLS verify-full en clientes administrados y planificar endurecimiento.

**Acciones realizadas en este turno:** leer screenshot del propietario; leer `AGENTS.md`, `agent.md`, `roadmap.md`, CP46/47, informe de incidentes y contrato roles; registrar documentación en `main` [skip render]. **Nada más:** NO se modificó switch, no SSL enforcement PUT, no SQL, no `pg_dumpall`, no conexión remota nueva, no GPG histórico, no backups, no migraciones, no reinicio Render/Supabase, no cambios de repositorio funcional.

## 4. Plan propuesto antes de cualquier cambio que reinicie DB (NO EJECUTADO)

1. **Inventario de consumidores** de PostgreSQL/pooler: aplicación Render (API/servicios), scripts locales y automatizaciones de respaldo, herramientas administrativas, Edge Functions, integraciones y cualquier cliente externo. No dar por hecho que todos están conectados directamente a PostgreSQL.
2. **Compatibilidad TLS:** verificar que cada conexión relevante usa modo `verify-full` o al menos SSL obligatorio con CA/host cuando corresponda; evitar credenciales en comandos y repositorios. Analizar si cambio rompe clientes que usan `sslmode=disable/prefer`, sobre todo clientes antiguos. Hacer pruebas en entorno no productivo cuando sea viable; no usar producción para experimentos sin permiso.
3. **Protección de datos:** respetar política de backups y restauración verificable; roles/owners/ACL reales **aún no respaldados**. Esto es un requisito de continuidad crítico antes de iniciar piloto normal y antes de un cambio con reinicio.
4. **Operación:** documentar ventana acordada de reinicio, comprobaciones de salud de app, sesiones, PWA, aislamiento de talleres y estrategia de reversión; **no modificar la política ni lanzar smoke tests remotos sin aprobación**.
5. **Puerta de autorización:** presentar plan exacto y solicitar autorización **separada** para cambiar `Enforce SSL on incoming connections` a ON, advertir expresamente reinicio y downtime. El consentimiento para **consultar el estado** no autoriza cambiarlo.

## 5. Pendientes no relacionados con el resultado OFF

R3 roles reales, dueños/owners, memberships, ACL/grants y prueba de recuperación integral siguen pendientes; `roles.sql.gpg` histórico descifra **0 bytes de SQL**, incidencia productor `ROLES_ORIGEN_FALLA_NO_CLASIFICADA`. R2 restaura solo estructura con límites; GPG histórico aislado con secreta correspondiente ya documentada, no repetir pruebas. `BT-PILOT-QA-04 A REPASAR`. Drive excluido, `main` privado, no deploy.

## 6. Traspaso de continuidad

> ByteTorque SEC-07 en main: verificar HEAD, leer AGENTS.md/agent.md/roadmap.md y CP48. Propietario envió screenshot oficial SSL Configuration: interruptor **«Enforce SSL on incoming connections» OFF** (gris, indicador blanco a izquierda). Registrar `SSL_ENFORCEMENT_UI: OBSERVED_OFF`, **observado manualmente, NO API**. CP46 cliente TLS verify-full PASS; backend PostgreSQL `REPORTED_NO`; end-to-end TLS no certificado. OFF es consistente con no exigencia SSL, no prueba que todos los clientes sean plaintext. Supabase advierte que activar enforcement reinicia DB. **Usuario solo autorizó CONSULTAR; no activar ni modificar sin nueva aprobación**, no SQL/dumps/roles/GPG/backup/restore. Preparar auditoría de compatibilidad, continuidad, ventana y rollback; conservar hallazgo abierto hasta remediación verificada. R3 roles/owner/ACL pendientes y piloto A REPASAR.
