# Riesgos residuales y registro de soluciones

- Deno nativo y WebKit no están disponibles en este entorno. No se intentó instalación/descarga ni cambio de red. La compatibilidad Node con adaptador no certifica Edge. La CI candidata exige runtimes nativos; está pendiente de integración oficial.
- El laboratorio demuestra funciones PostgreSQL/ACL/RLS y recuperación aislada, pero no contacto con Auth/Storage alojados ni JWT firmados reales. No demuestra propagación de freeze global o QA PC/Android física.
- Archivo SQL y Storage no son una transacción distribuida. Una caída puede dejar objetos privados huérfanos; se conservan para diagnóstico/recuperación. No borrado automático, WORM físico ni revocación de PDFs legítimamente descargados.
- Crecimiento de bytea de staging, snapshots e historial requiere una política operativa futura de capacidad/retención aprobada. Este bloque no elimina datos ni añade arquitectura de limpieza.
- Contención puede agotar tiempo de una petición. La recuperación consulta el mismo UUID; nunca renueva o compra en silencio. Un cambio de fuente necesita nueva revisión/consentimiento. Las revisiones asignadas pueden contener huecos por intentos fallidos.
- Policy MP-V2-1 es inmutable y fijada al código/assets. Futuras versiones necesitan una decisión/migración explícita. El empaquetador rechaza divergencia del registro generado.
- El candidato no concede aceptación comercial integral ni instalación. Recovery_ready permanece OFF al instalar; no abrir hasta aprobar recuperación real dentro de alcance.

## Incidencias resueltas durante implementación

1. FK simple de OT incompatible con PK multitenant: sustitución por (workshop_id,order_id) y FK compuesta. Confirmado por instalación real, sin alterar SQL aprobado.
2. Expresión CASE de límite necesitaba paréntesis en PL/pgSQL: corregida en candidato y ejecutada en PostgreSQL17.
3. Recuperación con MPJob previo a commit podía llamar worker terminado: se consulta estado actual y se recupera confirmación, sin rerender ni recargo; también converge un worker concurrente cuando otro ya confirmó.
4. Actor genérico ocultaba causa de sesión revocada: se comprueba auth.uid/sesión/exp antes del actor existente. Sin modificar Auth productivo.
5. Gate de build rechazaba módulos nuevos: allowlist exacta de repository/MultipuntoDocuments condicionada a CP04 privado, preservando denegación pública y exclusión de renderers. Público y privado verificados.
6. Fixtures de pruebas se ajustaron al contrato real: estado disabled (no inactive), máximo de nota 2.000, una OT abierta por vehículo, booleanos psql t/f y buffer suficiente para bytes PDF. No se relajaron restricciones para conseguir verde.
7. La regresión histórica de Órdenes requería flags privados en su servidor sintético; se repitieron únicamente Full/Plus afectados con esa configuración de proceso, sin cambiar red o configuración productiva.

## Propuesta deduplicada para Development Toolkit

No se publicó ni modificó el Toolkit. Añadir estas observaciones a fichas existentes tras revisión:

- ERR-056: candidato/tree y commit de transporte son identidades distintas. Recibo remoto por archivo y raíces anteriores, con manifiesto sin autorreferencia.
- ERR-060/063: ampliar contratos comerciales exige guard V1/V2 y comprobar EXECUTE del rol original dentro de nuevas funciones definer; no asumir que un HTTP freeze o un owner SQL protege rutas nuevas.
- ERR-062: medir tráfico por fase y mantener exactas las acciones autorizadas de lectura. Zoom no es lectura ni cuota; nueva descarga sí revalida. Separar bloqueo de entorno de PASS.
- Lección SQL: en pruebas de concurrencia, observar pg_blocking_pids en conexiones independientes; un Promise.all o sleeps por sí solos no acreditan una espera de locks. Conservar canonicidad de bytes independientemente de metadata de render.
