# BT-PLAN-04BC-PILOTO-01 — delta de revocación

26/11/2026, Chile. Base del delta: candidato local `5dff5465e46b2903ddabaef4505cefb1c6be0131`, transferido en `c5d1eb4080bf65974814eefe0dce2535995911da`. Base oficial original: `6f63bbdea12dbfa73b24eec43c055bbbcddb50a3`. Única rama: main. Sin integración oficial ni activación alojada.

## Causa y corrección

El candidato inicial comprobaba Full permanente al habilitar el taller. Después, los rollouts seguían autorizando operaciones aunque el Creador revocase la licencia. La sincronización de suscripción y el cupo cero no bastaban para proteger los otros RPC.

El nuevo SQL incremental `BT_PLAN_04BC_REVOCATION_DELTA_CANDIDATE.sql` añade una comprobación privada de la licencia efectiva del piloto gestionado por PLAN04: titular owner activo, beneficio Full permanente manual vigente y suscripción Full sincronizada. Un beneficio revocado, ausente o desincronizado falla cerrado. La identidad de creación del taller permite reconocerlo aunque falte el beneficio; no basta con quitar la fila de licencia para evitar la comprobación. Los talleres legacy/QA sin alta ni vinculación PLAN04 conservan su contrato anterior; no se impone una nueva licencia al piloto QA ya aprobado.

La comprobación se incorpora a los autorizadores existentes de escrituras CP05, FLOW y archivo. Agenda ya llama al autorizador CP05. Abarca los RPC directos de Agenda, mutaciones/emisión CP05, aprobación, ejecución, entrega y archivo, incluyendo finalizaciones por service_role. No depende de que el navegador se haya revalidado. También corrige `operationsEnabled` en la proyección de capacidades. Se conservan OID, ACL, propietario, SECURITY DEFINER/INVOKER y search_path de las cuatro funciones reemplazadas; el preflight aborta ante deriva de sus cuerpos.

Los registros de rollout NO se desactivan por revocación. No se borran ni desactivan miembros automáticamente, ni se alteran clientes, vehículos, OT, hallazgos, revisiones, manifiestos u objetos. `documentsEnabled` y las rutas de lectura histórica conservan las autorizaciones previas de identidad, membresía, rol y taller. No se abre lectura a otros usuarios. CP03/CP04 conservan sus contratos base de CRUD/RLS; el delta protege las operaciones del piloto premium citadas, sin reconstruir módulos ni cambiar la identidad visual.

## Regresión focalizada

Ejecutor nuevo `verify-plan04bc-revocation-local.sh` y `plan04bcRevocationLab.ts`; PostgreSQL 17 con `--network none`, identidades sintéticas y Storage en memoria con metadatos SQL. Reutiliza exclusivamente DDL y puertos existentes; no invoca las 51 aserciones anteriores.

La prueba crea un taller Full habilitado, dos mecánicos y un expediente histórico con tres PDF reales como fixture. Reproduce primero el defecto original y aplica el delta. Comprueba denegación de escrituras por RPC de usuario y service_role con los cuatro flags aún ON, lectura exacta SHA-256 de los tres originales y conservación de los registros históricos. Además restituye Full y, con el delta YA instalado y el taller todavía habilitado, vuelve a revocar por el endpoint Creador: las operaciones se bloquean sin llamar antes a desactivación, los originales siguen legibles y ningún registro histórico cambia. Comprueba también restauración de autorización por concesión válida, desincronización, ausencia de licencia y rechazo de lectores ajenos.

Resultado final: 25 comprobaciones focalizadas PASS. Se conserva el resultado inicial de 22 y la ejecución final ampliada; no se suman sus conteos. TypeScript se limita al nuevo ejecutor y sus dependencias; sintaxis del shell y diff verificados. No se repitieron las 122 unitarias, las 51 SQL ni las validaciones visuales o builds completos. Los SHA y el árbol del candidato resultante se consignan en `CANDIDATO.json` del delta; `MANIFEST.sha256` cubre sus archivos.

## Entrega y activación

Solo el delta y sus evidencias por DTK-ERR-056 a `bytetorque-review/main/BT-PLAN-04BC-PILOTO-01-DELTA-REVOCACION/`, conservando todos los archivos/árboles anteriores. Diff binario incremental respecto de `5dff546...`, no se retransmite el candidato completo anterior.

Si Dirección Técnica lo aprueba, añadir esta migración DESPUÉS de las cuatro propuestas en la entrega original. No volver a ejecutarlas sobre un catálogo donde ya existan. El preflight del delta exige las definiciones del candidato original. No se aplicó SQL alojado, ni se tocaron Supabase, Render, secretos, cuentas o licencias reales. No hubo push oficial, ramas nuevas, despliegue, correo, pagos, respaldo o auditoría histórica. SEC07 cerrado; logos/buckets siguen OFF. La comprobación corresponde a las llamadas SQL posteriores a la revocación; no introduce cancelación retroactiva de transacciones ya iniciadas ni una nueva arquitectura de atomicidad.
