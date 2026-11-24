# ByteTorque — SEC07, decisión de cierre acotado al piloto

**Fecha:** 23/11/2026 (Chile). **Origen:** dictamen de Astra aportado por el propietario, contrastado con el HEAD `b5cece3a0795fe79d6c79448e54ecf2030674eab`. Rama única `main`. Documento de decisión, no evidencia de ejecución de un nuevo laboratorio.

## Decisión que sustituye las propuestas R4/R5

Conservar los PASS previos dentro de su alcance. S3-R4 `MISSING_ROLE` no identificó el rol ni el objeto. **S3-R5 queda descartado**: crear identidades placeholder no restablece membresías, atributos ni privilegios efectivos y no es requisito del piloto. No repetir inventarios, restores completos ni exportar roles a ciegas. No atribuir el fallo a un rol concreto sin evidencia.

## Tres entregas para aprobar SEC07 para piloto

| Entrega | Criterio |
|---|---|
| A. Permisos e aislamiento | Extraer y revisar contrato del v04 por objeto/firma (owners, ACL, grant options, permisos por columna, secuencias, EXECUTE/USAGE, defaults globales y de esquema, políticas/triggers propios en esquemas gestionados si se usan). Revisar referencias a roles antes de aplicar. Bootstrap oficial ya validado, offline; no datos reales restaurados de nuevo. Utilizar roles reales, sin placeholders ni grants de conveniencia. Fixtures sintéticos A/B: operaciones permitidas admin y mecánico, lectura y escritura cruzada denegadas con comprobación posterior, RPC sensible y dos mutaciones de planes protegidas por autorización y MFA. Si algún objeto propio depende de un rol ausente, resolver explícitamente la dependencia; no excluirlo silenciosamente. |
| B. Infraestructura activa | Ficha privada de Auth (Site URL, redirects, alta, proveedores/correo usados, acceso administrativo), Render (commit, rama, Node, build, dist, dominio/redirects), Edge activas necesarias (código, JWT, flags, nombres de variables y origen de reposición), acceso y recuperación de cuentas/DNS/secretos. Storage solo si se usan archivos persistentes en piloto: respaldar bytes además de metadata y verificar apertura; inventario histórico vacío no garantiza estado actual. Valores de secretos nunca en repo ni chat. |
| C. Validación y operación | Recorrido funcional autorizado una vez: login, cliente/vehículo, OT, cotización, recarga e historial. Verificar persistencia, roles y funciones habilitadas. Respaldos manuales cada dos días y antes de cambios de datos, ciphertext + manifiesto, última copia exitosa y manejo de fallo. |

## Fase previa de A (no ejecutada)

Extraer dentro de un laboratorio aislado, del mismo archive v04, el SQL de esquema con permisos/owners y metadatos de entradas TOC. Mantener SQL/dump claro dentro del laboratorio temporal y no imprimir SQL ni datos. El manifiesto candidato no equivale a contrato revisado ni permite aplicar por simple coincidencia de texto/prefijo. Revisar entradas concretas (incluidos defaults globales y candidatos de auth/storage) frente a código/documentos y dependencias de la aplicación. Luego integrar selección explícita y ensayo en ese laboratorio; no declarar PASS por conteos agregados.

## Riesgos y límites

Respaldo únicamente local según decisión del propietario: pérdida, robo o ransomware del equipo pueden afectar copia y custodia; no exigir USB/Drive. No es DR integral. La frecuencia de dos días implica pérdida potencial de alrededor de dos días si se cumple y la última copia es válida. El endurecimiento TLS enforcement queda fuera de esta aprobación acotada; conservar evidencia cliente verify-full y límites. No habilitar funciones con dependencias no recuperables. Cualquier acceso cruzado o mutación administrativa no autorizada bloquea piloto. No certificar equivalencia de cuerpos SQL productivos con archivos CANDIDATE por firma sola.

**Estado: SEC07 PENDIENTE DE APROBACIÓN PARA PILOTO.** Solo documentación, sin modificaciones de producción, deploy, migraciones ni nueva rama.
