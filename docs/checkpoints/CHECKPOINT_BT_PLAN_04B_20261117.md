# BT-PLAN-04B — licencia personal, taller y sincronización

17/11/2026. Base `73e6160af017c562b051dc690560d771d4275f8b`. Orden maestra: issue #1.

Implementación SQL candidata en `docs/sql/BT_PLAN_04B_WORKSHOPS_CANDIDATE.sql`:
alta de taller transaccional y única por licencia Plus/Full vigente, propietario
derivado de Auth, reintentos idempotentes con comparación del payload, y perfil
comercial privado. No admite elegir taller/propietario arbitrarios ni autoafilia a QA.

Las concesiones personales de 04A y el panel clásico por taller sincronizan la
misma licencia vinculada y la suscripción operativa, en una transacción auditada.
La revocación/expiración conserva talleres, integrantes e historiales. Los cambios
manuales siguen exigiendo Creador privado y AAL2. Las RPC nuevas, estado personal y
consultas de Creador verifican también una sesión Auth vigente, no metadata editable.

Prueba ejecutada: PostgreSQL 17 local sin red, con JWT/sesiones sintéticos, sobre
CP02 + Creator + 04A reutilizados. Se verificaron Básico bloqueado, concesión sin
MFA denegada, taller único/reintentos, payload conflictivo, sincronización cuenta/
taller y ruta inversa del panel clásico, aislamiento y sesión revocada. La ronda
consolidada reproducible está en `scripts/security/verify-plan04-local.sh` (04C/D
continúan en commits siguientes). La base de datos alojada no se consultó ni cambió.

**Estado: código candidato probado localmente, no migración instalada.** Requiere
autorización específica para instalar este SQL, previa revisión del respaldo y
rollback. No se creó cuenta de Ignacio, Biomotors ni concesión personal real.
