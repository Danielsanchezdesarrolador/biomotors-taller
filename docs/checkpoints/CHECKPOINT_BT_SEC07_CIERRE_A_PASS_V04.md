# ByteTorque SEC07 — Bloque A aprobado sobre v04

**Estado: BLOCK_A_PASS_V04.** Evidencia de ejecución en Windows PowerShell 5.1 comunicada por el propietario mediante el informe del chat auxiliar. Se registra el resultado aportado, no una nueva ejecución independiente del asistente. Aprobación del bloque A sobre v04 dentro del alcance del piloto; SEC07 permanece pendiente de B y C.

## Marcadores sanitizados

```text
BT_SEC07_CLOSE_A_RUNNER: ATTACHED_R8
BT_SEC07_CLOSE_A_BOOTSTRAP: READY
BT_SEC07_CLOSE_A_GPG: PASS
BT_SEC07_CLOSE_A_CONTRACT: MATCH
BT_SEC07_CLOSE_A_QA: PASS
BT_SEC07_CLOSE_A_CLEANUP: PASS
BT_SEC07_CLOSE_A_STATUS: BLOCK_A_PASS_V04
BT_SEC07_CLOSE_A_PRODUCTION: NOT_TOUCHED
```

## Cobertura según informe de ejecución

- Mismo v04, 281 entradas revisadas de public, bt_cp05_private y bt_platform_private más dependencias necesarias de Auth; propietarios y permisos originales aplicados. 20 tablas, 35 funciones de propietario postgres, 21 políticas RLS, 6 entradas DEFAULT ACL. Manifiesto contrastado antes de restaurar.
- Administradores A/B: cada uno pudo crear cliente, vehículo y OT, actualizar OT y abrir/consultar cotización en su taller. Lecturas y escrituras cruzadas de A sobre B bloqueadas; datos de B permanecieron intactos.
- Mecánico: pudo registrar y leer hallazgo propio; no modificar OT como administrador, abrir cotización ni leer OT del otro taller.
- Dos RPC mutantes de planes: administrador sin condición de creador rechazado incluso AAL2, creador AAL1 rechazado, creador AAL2 autorizado con eventos esperados; denegaciones sin eventos.
- Fixtures sintéticos dentro de transacción revertida, sin nuevas filas reales, roles ficticios ni grants de conveniencia. Limpieza PASS, producción no tocada.

## Errores, soluciones y límites del diagnóstico

| Incidente | Solución | Límite |
|---|---|---|
| S3-R4 MISSING_ROLE al restaurar ACL/owners de todo el archive | S3-R5 descartado; restaurar selección exacta de aplicación y dependencias Auth con roles reales del bootstrap | Rol y objeto exactos no identificados |
| Primer CLOSE_A: bootstrap PASS, luego NOT_APPROVED sin marcador | Eliminar ALTER ROLE redundante, crear base desde template0 por separado y añadir marcadores por etapa | Fallo exacto no confirmado; set -e y redirecciones podían ocultar diagnóstico |
| Ejecutor desacoplado: BOOTSTRAP_WAIT timeout | Volver al runner adjunto R8: espera interna de inicialización y SELECT 1 por socket local; abrir v04 solo tras READY | La consulta externa no dio estado útil; causa interna específica no confirmada |

## Procedimiento exitoso descrito por el propietario

Imagen fijada supabase/postgres:17.6.1.136, ATTACHED_R8, contenedor único sin red ni puertos publicados, PGDATA/temporales/socket en tmpfs, capa escribible temporal para bootstrap oficial, flujo binario GPG, comprobación de manifiesto y pg_restore --schema-only --use-list, conservando propietarios y ACL de aplicación. Dependencias Auth seleccionadas del archive; roles reales; datos sintéticos, rollback y limpieza. No repetir restauraciones aprobadas. El informe incluye marcadores y descripción del ejecutor, **no su código completo**: conservar la versión exitosa local y anexar su texto sanitizado cuando se aporte; no afirmar que ya se archivó ese script exacto.

## Alcance

PASS sobre v04, no prueba de paridad de roles globales de Supabase ni equivalencia entre 35 funciones del snapshot y 37 del inventario posterior de producción. MFA acredita guardas SQL con contexto sintético, no desafío MFA real ni login del servicio Auth. S0/S1 local/S2-R11/R8/R9/S3-R1/R2/R3 y extracción conservados; S3-R5 descartado.

## Continuidad

Solo faltan B (ficha privada de recuperación de infraestructura activa, Auth/Render y accesos/reposición de secretos, dominio/DNS, Edge y Storage si los usa el piloto) y C (recorrido funcional autorizado Ignacio: login, cliente/vehículo, OT, cotización, recarga/historial y persistencia). Respaldos cifrados manuales cada dos días y antes de cambios que afecten datos, manifiesto y control de último éxito. Riesgo PC-only documentado; no imponer USB/Drive/automatización ni reabrir TLS enforcement para esta aprobación acotada. SEC07 pendiente de aprobación del piloto hasta evidencia B y C. Sin cambios de producción ni despliegue por esta documentación.

Antecedentes: [extracción v04](CHECKPOINT_BT_SEC07_CIERRE_A_CONTRATO_V04_EXTRAIDO_20261124.md), [dictamen Astra](../recovery/BT_SEC07_CIERRE_PILOTO_DICTAMEN_ASTRA_20261123.md), [solución R8](../recovery/BT_SEC07_S4B_R8_SOLUCION_Y_PREVENCION_20261123.md).
