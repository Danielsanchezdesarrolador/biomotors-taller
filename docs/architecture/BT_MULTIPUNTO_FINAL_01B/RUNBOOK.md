# Instalación futura y reversión — no ejecutadas

Todas las fases alojadas requieren revisión y autorización independiente. Este candidato no habilita producción ni modifica GATE4. Mantener SEC07 cerrado, Auto-Deploy OFF, correo/pagos/logos/registro público OFF, DevOps/Mobile/R3 diferidos.

1. **Preflight**: reconstruir candidato desde la base exacta más delta; verificar árbol CANDIDATO.json, MANIFEST, paquetes y registro de policy generado mediante `node scripts/multipunto-policy.mjs`. Contrastar versiones PostgreSQL17, dependencias lockfile, Deno/Edge y assets. Resolver WebKit/Deno en CI antes de instalación. Inventariar rutas V1 y V2 y sesiones antiguas. Guardar definiciones/ACL de las cuatro firmas GATE4 y huellas de reserve/finish/cached; cancelar si deriva la base. No intervenir sus cuatro barreras.
2. **Recuperación incremental**: aprobar inclusión del nuevo bucket, staging privado y bytea/generaciones en S5B. Preparar un conjunto incremental pertinente con inventario de la misma instantánea restaurada; no reutilizar un inventario vivo de otro momento. Validar restauración aislada y privacidad. La prueba sintética de esta entrega no sustituye aprobación/custodia productiva.
3. **FREEZE y drenaje**: reutilizar los paquetes deny-all previamente aprobados para las tres rutas CP05, archivo final y comercial; mantener nueva ruta OFF. Verificar HTTP autenticado real 503/0 bytes sin registrar credenciales, según ERR-063. Drenaje conservador al menos 400 s y límites efectivos del proveedor, revisión de invocaciones en vuelo y de clientes antiguos. La espera no demuestra propagación mundial. No modificar GATE4 para lograr el corte.
4. **SQL aditivo**: en ventana aprobada, aplicar una vez BT_MULTIPUNTO_FINAL_01B_CANDIDATE.sql. Transacción, error ante namespace existente y huellas V1 distintas. Revisar RLS/ACL/épocas/índices/cuerpos, que los cuatro GATE4 siguen exactamente iguales y control false/false/false. Aplicar después POLICY_CANDIDATE.sql; comprobar hashes y fuente. No editar migraciones históricas.
5. **Storage**: con gates OFF, aplicar STORAGE_CANDIDATE.sql solo si no existe bucket y se ha aprobado recuperación. Privado, application/pdf, 20 MB máximo. Verificar que la policy restrictiva deniega todos los accesos anon/authenticated incluso ante otra policy permisiva. Sin signed URLs, listados ni uploads desde cliente. Service role exclusivamente en Edge, nunca frontend/paquete. No automatizar borrado de huérfanos.
6. **Edge OFF**: generar dos paquetes con `node scripts/package-multipunto-final.mjs /tmp/<salida-nueva>` y contrastar manifiestos. Validar native Deno y compatibilidad actual del proveedor. Instalar solo bajo autorización; BT_MP_READ_ENABLED y BT_MP_WRITE_ENABLED false. Origin exacto HTTPS, publishable key por binding autorizado y service key por secret existente, sin imprimirlas. Verificar JWT=true. Paquete no instala ni despliega; no ejecuta SQL.
7. **HTTP/ACL**: probar sintéticamente sesión/membresía/tenant/Basic, GATE4, expiración, maxAdditionalUnits y recuperación por estado. Restablecer rutas V1 únicamente con versiones revisadas y JWT activo. Confirmar que V1 rechaza IDs V2 y sigue entregando borradores marcados. No entregar finales desde caches ni stages.
8. **Frontend controlado**: verificar build privado Auth/CP03/CP04 y flag V2 todavía OFF. El nuevo flag requiere CP04 privado; no es permiso. Despliegue futuro autorizado por separado. Corte de UI evita mostrar a la vez acciones V1/V2; no promueve metadatos viejos ni origina consumo por migración.
9. **Activación autorizada**: después de recuperación/CI/revisión, cambiar control desde conexión administrativa aprobada: read_enabled=true, write_enabled=false; revalidar HTTP. recovery_ready solo después del dictamen de recuperación. Habilitar write_enabled y Edge write=true únicamente por autorización explícita. Cambios de control incrementan época. Activar flag frontend V2 después del servidor, nunca antes. Registrar actor/justificación de instalación en el registro operativo autorizado, sin secretos.
10. **QA y recuperación**: Full/Plus una unidad por snapshot convertible; Básico metadata sin bytes; parcial/vacío; sesión/ABA; descarga histórica; tamaños/hashes; fallos/cruces de semana; diagnóstico de stages huérfanos; ZIP=3. El listado se limita al alcance nuevo, sin repetir SEC07/respaldos históricos. No declarar aceptación hasta revisión del titular.

## Reversión no destructiva

Cerrar write_enabled y BT_MP_WRITE_ENABLED, después read_enabled/BT_MP_READ_ENABLED si se requiere congelación total; las épocas invalidan intentos/visores al reconsultar. Mantener false recovery_ready ante incertidumbre. Desactivar flag frontend V2 y usar versión anterior aprobada de la interfaz. Los IDs V2 siguen rechazados por adaptadores V1. No retirar esas guardas mientras existan créditos V2. Mantener tablas, ledger, snapshots, originales, bytea de todas las generaciones, bucket y auditoría; NO DROP, TRUNCATE, borrar objetos o restaurar todo el ledger antiguo. Reapertura posterior requiere autorización y verificación de recuperación. No recrear originales ausentes mediante render nuevo.

## Reproducción local aislada

Usar cachés/dependencias disponibles; ningún comando siguiente apunta a infraestructura alojada:

```sh
export BT_MPF_LAB=bt-mpf-review
export BT_MPF_EVIDENCE=/tmp/bt-mpf-evidence
export BT_PLAN04BC_EVIDENCE_DIR=/tmp/bt-mpf-evidence
bash scripts/security/prepare-multipunto-final-lab.sh
python3 scripts/security/seed-multipunto-final-lab.py
docker exec -i "$BT_MPF_LAB" psql -X -v ON_ERROR_STOP=1 -U postgres -d bytetorque < docs/sql/BT_MULTIPUNTO_FINAL_01B_POLICY_CANDIDATE.sql
bash scripts/security/verify-multipunto-final-local.sh
python3 scripts/backup/test_multipunto_recovery.py
python3 scripts/verify-multipunto-pdf.py
```

La preparación usa exclusivamente fixtures oficiales y no ejecuta sus suites históricas. El contenedor usa network none y cinco identidades sintéticas. `BT_MPF_RESUME_FROM` y `BT_MPF_EXTRA_ONLY=writers|failures|cas` permiten diagnosticar un caso fallido con evidencia previa sin repetir casos aprobados; no deben usarse en la ronda consolidada/CI. La CI candidata ejecuta todo el alcance nuevo, Chromium/WebKit y Deno nativo, pero aún no se ha publicado oficialmente.
