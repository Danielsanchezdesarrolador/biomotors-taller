# ByteTorque — SEC07 S4C-R9: restauración + estructura y RLS A/B de lectura, PASS LIMITADO

**Evidencia:** 23/11/2026 (salida del propietario en Windows PowerShell 5.1). **Rama única:** `main`. **Tipo:** documentación pública sanitizada, `[skip render]`. **Respaldo reutilizado:** S2-R11 v04. **No se escribió a producción.**

## Evidencia literal del propietario

```text
BT_SEC07_S4C_R9: START
BT_SEC07_S4C_R9_LAB: READY
BT_SEC07_S4C_R9_RESTORE_EXIT: 0
BT_SEC07_S4C_R9_GPG: PASS
BT_SEC07_S4C_R9_STRUCTURE: PASS
BT_SEC07_S4C_R9_RLS: WORKSHOPS_AB_PASS_LAB_GRANT
BT_SEC07_S4C_R9_ACL: NOT_CERTIFIED_NO_ACL_RESTORE
BT_SEC07_S4C_R9_RESULT: CHECK_PASS_LIMITED
```

## Qué se ejecutó realmente (según script íntegro S4C-R9 entregado en el chat)

1. Docker local `supabase/postgres:17.6.1.136`, arranque oficial, sin red, sin puertos ni bind mounts, PostgreSQL y logs en `tmpfs`, contenedor efímero `--rm`. Se empleó el mismo v04, `GNUPGHOME` correcto, GPG en streaming y `pg_restore` sobre `bt_s4` separado de base de bootstrap. `RESTORE_EXIT:0` y GPG `PASS`. No se creó un nuevo backup ni se conectó origen productivo.
2. Comprobación SQL de **12 tablas esenciales** (`workshops`, `profiles`, `workshop_memberships`, `customers`, `vehicles`, `work_orders`, `inspection_findings`, `quotes`, `quote_items`, `quote_revisions`, `quote_events`, `quote_delivery_events`) y `relrowsecurity=true` en cada una; `auth.users` existe.
3. Datos mínimos: `public.workshops` tiene al menos dos filas y `workshop_memberships` al menos una. Se corroboró existencia de **alguna** FK y **algún** índice en `public`; no una auditoría exhaustiva de objetos. Se revisaron cuatro relaciones contra filas huérfanas (vehículos→clientes, OT→vehículos, hallazgos→OT y membresías→usuarios Auth y talleres).
4. Para la **prueba limitada** de lectura con RLS, el laboratorio añadió temporalmente `GRANT USAGE` sobre `public` y `GRANT SELECT` sobre `workshops` y `workshop_memberships` al rol `authenticated`; `--no-acl` había omitido grants del respaldo. Seleccionó un usuario Auth confirmado y miembro activo del taller A, sin membresía activa en un taller B también activo. Aplicó `request.jwt.claim.sub` y `SET LOCAL ROLE authenticated` y evaluó existencia de A + ausencia de B en `public.workshops`. Resultado: `WORKSHOPS_AB_PASS_LAB_GRANT`.
5. Los marcadores finales proceden del script entregado y ejecutado por el propietario; no se inspeccionó el PC remotamente ni se extrajeron filas/identificadores privados. Contenedor efímero destruido al terminar.

## Dictamen de alcance, para no sobrecertificar

| Dimensión | Resultado |
| --- | --- |
| Respaldar y descifrar v04 | PASS previo S2-R11 + GPG S4C-R9 PASS |
| Restaurar el archive PostgreSQL en LAB | PASS con exit 0 (R8 y R9) |
| 12 tablas y RLS habilitada | PASS de existencia/bandera |
| Dos talleres y membresías mínimas | PASS de mínimos, sin valores ni comparación fuente |
| Algunas FK/índices y cuatro comprobaciones de huérfanos | PASS limitado |
| RLS lectura de `public.workshops` A visible / B oculto para usuario activo no miembro B | PASS con GRANT de laboratorio |
| Owners/ACL/GRANT originales | **NO CERTIFICADO** por `--no-owner --no-acl` |
| RLS CRUD otras tablas, matrices completas de rol, revocación | PENDIENTE |
| Conteos exactos/consistencia frente al origen | PENDIENTE |
| Auth operativa, archivos Storage, Edge, Render, secretos/configuración externos | PENDIENTE (S3) |
| Recuperación integral S4 | **NO CERRADA** |

## Siguiente acción concreta, sin pruebas repetitivas

La próxima etapa debe inventariar cobertura **fuera del dump** y privilegios originales (S3), determinar qué comparación con el origen está documentada y diseñar **una sola validación final** de diferencias de datos y permisos con pruebas negativas multiempresa, en vez de restaurar otra vez únicamente para repetir lo ya aprobado. La validación de RLS de talleres se conserva, no se repite de rutina. Cualquier eventual consulta a producción u operación de servicios requiere autorización específica. Un respaldo local solo en PC continúa aceptado con riesgo residual explícito; no exigir USB.

Se mantienen `main`, los cuatro documentos maestros, el runbook de incidencias y `[skip render]`. No se usó Codex, se publicó código de aplicación ni se hizo deploy por esta documentación.
