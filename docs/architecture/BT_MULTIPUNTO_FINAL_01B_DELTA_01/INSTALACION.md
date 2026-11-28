# Aplicación futura y reversión — únicamente candidato

La base oficial 7c877e7 sigue sin 01B instalado por esta tarea. El delta se aplica **sobre 01B**, no reemplaza su instalación ni aprueba sus fases. Mantener el runbook D01–D10 y aprobación independiente.

1. Reconstruir exactamente 01B (3431c39/e332060) y este delta, comprobar manifiestos/árbol/commit. Validar CI nativa, revisión y aprobación antes de tocar un destino alojado.
2. Reutilizar freeze/drenaje autorizado de las rutas documentales según 01B. Cerrar gates propios de lectura/escritura y recovery_ready; no intervenir GATE4. No usar una espera fija como prueba de propagación.
3. Si 01B aún no existe, instalar primero su núcleo, registro MP-V2-1 y Storage solo conforme a su procedimiento autorizado. Si ya existe, no reaplicar bootstrap, no recrear buckets y no reescribir originales/ledger.
4. Aplicar una vez `BT_MULTIPUNTO_FINAL_01B_DELTA_01_CANDIDATE.sql`. Su preflight exige ocho cuerpos de función 01B exactos, gates propios OFF y ausencia del delta. Cualquier deriva aborta la transacción. Añade funciones/counter privado y reemplaza cuerpos conservando ACL/propietarios. Las cuatro firmas GATE4 no cambian.
5. Insertar `BT_MULTIPUNTO_FINAL_01B_DELTA_01_POLICY_CANDIDATE.sql`: MP-V2-2, sin editar MP-V2-1 ni snapshots anteriores. Nueva proyección/hash incorpora H_source y hashes del renderer/proyector/assets. Verificar con `node scripts/multipunto-policy.mjs` y paquetes reproducibles. No sobrescribir el registro inmutable antiguo.
6. Instalar posteriormente el paquete Edge y frontend revisados solo por autorización independiente, inicialmente OFF. El entrypoint queda idéntico a 01B; el bundle y RPCs incorporan el delta. Paquete incluye base y delta separados: elegir los archivos según estado, nunca ejecutar ambos bootstrap sobre una instalación existente.
7. Sesiones/épocas de intentos en vuelo se invalidan conservadoramente durante el corte. No comprar otra solicitud ni promover una V1 automáticamente; reconciliar originales/histórico y pedir consentimiento individual si procede. No reabrir inspecciones ni alterar historial.
8. Verificar límites técnicos, bytes canónicos, crédito directo, reloj/cuota, isolation y nativos. Recuperación/custodia mantienen la condición de aprobación de 01B. No se añadieron bucket ni paths nuevos; S5B y ZIP=3 conservan su formato.
9. Activar solo tras dictamen y autorización. Registrar aprobación por el procedimiento operativo existente sin secretos. Auto-Deploy permanece OFF.

## Reversión conservadora

Cerrar gates propios/Edge, invalidar UI y congelar emisiones nuevas. Conservar ambos registros de policy, originales, snapshots, créditos, jobs, artifacts y auditoría. No DROP/TRUNCATE, borrar huérfanos ni restaurar un ledger viejo. Mantener guards V1/V2. No reapuntar automáticamente la UI nueva a las RPC antiguas; cualquier reversión de código necesita una revisión coordinada. El contador técnico es independiente de consumo y no requiere modificar cuotas históricas. No bajar a un renderer que no soporte el schema nuevo para intentar regenerar documentos.

## Reproducción aislada

Cached PostgreSQL17 y dependencias son suficientes para lo ejecutado localmente. `prepare-multipunto-final-lab.sh` prepara esquema original 01B y bucket **sintético** con gates OFF. Seed de cinco identidades sintéticas; insertar policy 01B, delta SQL y policy delta, en ese orden. Ejecutar `verify-multipunto-delta-local.sh`, que contiene solo el alcance nuevo, sin suites anteriores. Para diagnóstico local existen filtros temporal/ri03/credit/reconcile; CI los rechaza. Chromium usa harness loopback y `verify-multipunto-delta-browser.cjs`. Deno/WebKit ausentes se registran BLOCKED_ENVIRONMENT localmente; el mismo caso es FAILURE en CI.
