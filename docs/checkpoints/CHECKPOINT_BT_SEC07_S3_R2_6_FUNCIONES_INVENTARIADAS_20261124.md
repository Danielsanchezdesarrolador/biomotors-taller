# ByteTorque — SEC07 S3-R2: 6 SECURITY DEFINER identificadas (inventario PASS, código versionado revisado)

**Evidencia:** archivo CSV del propietario `Supabase Snippet Untitled query.csv`, resultado de la consulta `S3-R2` aplicada en SQL Editor de `biomotors-taller`, sesión 23–24/11/2026. **Rama:** `main`; documentación solamente `[skip render]`.

## Evidencia factual del CSV (6 de 6)

| Firma reportada | USAGE de public por authenticated | ACL explícita | EXECUTE de anon |
| --- | --- | --- | --- |
| `public.bt_creator04_accounts(p_query text, p_limit integer)` | true | true | false |
| `public.bt_creator04_manage_account(p_user_id uuid, p_plan text, p_mode text, p_days integer, p_reason text, p_request_id uuid)` | true | true | false |
| `public.bt_creator_is_creator()` | true | true | false |
| `public.bt_creator_manage_subscription(p_workshop_id uuid, p_plan text, p_mode text, p_days integer, p_reason text, p_request_id uuid)` | true | true | false |
| `public.bt_creator_overview()` | true | true | false |
| `public.bt_plan04_my_status(p_workshop_id uuid)` | true | true | false |

Sin SQL ejecutado por el asistente, sin filas de clientes y sin modificación de producción. El CSV incluye firmas públicas de RPC y booleanos; no cuerpos de funciones.

## Revisión estática contra los artefactos presentes en main

- [`docs/sql/BT_CREATOR_01_PRIVATE_SUBSCRIPTIONS_CANDIDATE.sql`](../sql/BT_CREATOR_01_PRIVATE_SUBSCRIPTIONS_CANDIDATE.sql): contiene `bt_creator_is_creator`, `bt_creator_overview` y `bt_creator_manage_subscription` con las mismas firmas. La condición de creador propuesta consulta `bt_platform_private.creators` + `auth.uid()`, usuario Auth verificado y no bloqueado. La vista `overview` ejecuta esa comprobación; modificación de suscripciones exige además `auth.jwt()->>'aal' = 'aal2'`, valida entradas y registra eventos idempotentes.
- [`docs/sql/BT_PLAN_04A_PERSONAL_ENTITLEMENTS_CANDIDATE.sql`](../sql/BT_PLAN_04A_PERSONAL_ENTITLEMENTS_CANDIDATE.sql): contiene `bt_creator04_accounts`, `bt_creator04_manage_account` y `bt_plan04_my_status`. Listado de cuentas y gestión requieren creador; modificación requiere además MFA `aal2`. `my_status` requiere usuario confirmado y, si se pide un taller, membresía activa del usuario para ese taller.
- Ambos archivos usan `SECURITY DEFINER SET search_path = ''` y `REVOKE ... PUBLIC,anon` + `GRANT EXECUTE ... authenticated` para las seis firmas. El resultado del CSV es **compatible** con el diseño versionado.
- Los SQL están etiquetados `CANDIDATE`: **coincidencia de nombre/firma/flags NO prueba que el cuerpo PostgreSQL de producción sea idéntico a esos archivos**. No se ha hecho auditoría de `pg_get_functiondef` remoto ni ejecución negativa de RPC con roles de usuario.

## Dictamen limitado y bloqueo

- **S3-R2 INVENTARIO DE LAS SEIS RPC: PASS**; todas son funciones conocidas de administración del creador y estado de plan. Las seis tienen `anon_puede_ejecutar=false`, `esquema_accesible=true`, `acl_explicitamente_definida=true`. Esta evidencia **NO** demuestra autorización interna efectiva de las seis. No hay razón demostrada para revocar sus grants o alterar políticas por este inventario.
- **Función `SECURITY DEFINER` ≠ vulnerabilidad automática.** La defensa depende de código real, `auth.uid()`, rol/membresía y validación de inputs; las dos RPC con cambios de planes requieren MFA según los archivos candidatos. No simular llamadas mutantes de prueba en producción.
- **S3 global pendiente:** copia recuperable de roles PostgreSQL, owners, grants/revokes, default ACL, datos externos Auth/Storage/Edge/Render y verificación de consistencia de cuerpos/controles reales. R8/R9 están aprobados dentro de su alcance y no deben repetirse.

## Siguiente necesidad concreta (no ejecutar sin autorización específica)

Preparar una **exportación recuperable y cifrada de roles y privilegios reales** con preflight de solo lectura y origen inequívoco, usando una sola ejecución controlada, sin archivo SQL claro en Windows, sin contraseñas en línea de comandos y sin reexportar el backup v04. Distinguir roles globales del clúster (Supabase CLI v3 contrato previo) frente a owners, ACL, default privileges y funciones, que requieren estrategia de captura por separado. Probar recuperación del material obtenido en laboratorio, con cuentas de rol sin BYPASSRLS y una matriz mínima de acceso A/B. El acceso remoto/exportación implica una nueva operación de producción y precisa autorización concreta. Hasta entonces, no inventar un `S3 PASS`.

**Observación histórica:** evitar ejecutar `pg_dumpall` anterior que produjo archivo de 0 bytes; no repetir baterías de sintéticos ya cerradas. No cambiar `main`, deploy, membresías ni producción.
