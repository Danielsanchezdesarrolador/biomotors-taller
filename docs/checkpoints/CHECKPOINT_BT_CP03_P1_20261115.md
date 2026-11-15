# ByteTorque — CHECKPOINT BT-CP03-P1 · Clientes/vehículos, PostgreSQL aislado

**Fecha:** 15/11/2026 (Chile). **Producto:** ByteTorque. **Rama:** exclusivamente `main`.
**Prioridad vinculante:** completar primero el piloto operativo del taller de Ignacio; las fases comerciales CP07–CP09 quedan pospuestas. R2-A6-10 se conserva cerrado en `84f0d23902ccc23f51e1b1f3ee7c6b5a0a694fe9`. La validación Safari física sigue pendiente.

## Entrega real de código, SIN instalar en Supabase alojado

- `docs/sql/BT_CP03_P1_CUSTOMERS_VEHICLES_CANDIDATE.sql`: tablas `customers` y `vehicles`; claves compuestas `(workshop_id,id)`; FK `vehicles(workshop_id,customer_id)` que impide asociar vehículos a clientes de otro taller. Sin datos reales.
- Patente opcional con `plate_key` generado mediante normalización y restricción única por taller; se permite la misma patente en distintos talleres sin mezclar información.
- Fichas mínimas: nombre, email opcional en minúscula, móvil `+569xxxxxxxx` opcional, observaciones breves, marca/modelo, año, odómetro, sello de autor y fechas, archivado no destructivo.
- RLS de lectura exclusivo para membresías activas; owner/admin/recepción pueden insertar y editar campos acotados con taller activo; mecánico solo lee; `anon` sin permisos; no se concede DELETE. Las columnas de identidad de taller, ID, autor y timestamps no son editables desde el cliente. El backend `service_role` conserva una vía privilegiada exclusivamente del lado servidor.
- Trigger de `updated_at` ejecutado por PostgreSQL. No se implementó una API operativa, UI de guardado, migración alojada, correo ni cliente Android persistente.

## Laboratorio PostgreSQL 17 con identidades sintéticas

- `scripts/security/bt-cp03-lab-bootstrap.sql` crea roles/Auth falsos en PostgreSQL efímero, sin credenciales ni red hacia Supabase alojado.
- `scripts/security/bt-cp03-lab-assertions.sql` prueba acceso A/B, membresías, Roles Mecánico/Recepción, inhibición de escritura cruzada, FK compuesta, duplicado de patente con y sin guion, validaciones de móvil y denegación tras desactivar una membresía.
- `.github/workflows/bt-cp03-postgres-lab.yml`: CI dedicado con servicio `postgres:17`, aplica el esquema CP02 ya documentado y este candidato **únicamente al contenedor**. No es migración de producción.
- **Evidencia definitiva:** [GitHub Actions CP03 #43727156893](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43727156893) **SUCCESS**, mensaje `PASS: CP03 customer/vehicle RLS, cross-FK, plate dedup, roles and disabled membership`.
- [CI web/Android #43727156848](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43727156848) **SUCCESS**: TypeScript, Vitest, PWA y bundle Android nativo, sin APK. [CI de interfaz #43727156842](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43727156842) registra regresiones generales de UI, sin habilitar el nuevo esquema.
- Trazabilidad: el primer laboratorio detectó denegación de Recepción por UUID de fixture escrito distinto a la identidad simulada; se corrigió sin relajar RLS. Otro intento detectó cita de dólar incorrecta dentro de la prueba de móvil; se corrigió y se reejecutó. No se declararon PASS esos intentos. **El resultado vigente es SUCCESS.**

## Seguridad y activación: permisos NO otorgados

- No ejecutar el SQL en `suxcqqnmcjoezfxltoms` ni conectar formularios reales sin autorización expresa, revisión de seguridad de RLS/grants, plan de rollback y pruebas A/B contra API real.
- No se transfirieron registros del harness DEMO al producto oficial.
- No hubo llamadas de lectura/escritura a Supabase alojado en esta entrega, ni secretos, Edge, correo Resend, pagos ni migraciones hospedadas.
- El conjunto de campos del piloto y el manejo de duplicados *de personas* requieren decisión de producto; la deduplicación de vehículos por patente sí se prueba con SQL.
- El piloto no está funcionando aún: faltan API autenticada, conexión UI, búsqueda, persistencia real, CP04 inspecciones/OT, CP05 documentos/correo, CP06 historial/backup, pruebas físicas y aprobación final de Ignacio.

## Siguiente tarea concreta

**CP03 — completar el adaptador autenticado y el flujo de fichas/búsqueda**, conservando la UI premium aprobada, mientras se solicita autorización separada para aplicar el SQL candidato. Antes de escribir datos personales, revisar consentimientos, roles, límite de datos y accesos. Mantener `main`, sin PWA Android ni nuevos entornos.

**Nota de cierre documental:** esta actualización de checkpoint/roadmap se publicará en otro commit; comprobar CI del commit definitivo antes de afirmar cierre integral.
