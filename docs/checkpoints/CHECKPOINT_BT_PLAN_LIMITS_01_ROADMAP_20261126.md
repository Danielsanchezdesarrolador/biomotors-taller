# BT-PLAN-LIMITS-01 — decisión comercial y continuidad de piloto

Fecha: 26/11/2026 (Chile). Estado: requisitos aprobados para planificación; no implementados. Base oficial al registrar: 9fe4602a7337c0ca3b21c8db417f82f179832094.

## 26/11/2026 — BT-PLAN-LIMITS-01 y piloto completo con clientes reales (decisión del titular)

**Nuevo bloque obligatorio después de BT-PILOT-FIX-01, antes de incorporar BIOMOTORS.** Solo decisión documental; no implementación ni activación.

| Capacidad | Básico (gratis) | Plus (USD 5/mes) | Full (USD 15/mes) |
|---|---|---|---|
| Clientes | Máximo 5 | Sin límite comercial previsto | Sin límite comercial previsto |
| Creación/edición de borradores de cotización | Sí | Sí | Sí |
| Acceso al documento final de cotización | 1 cotización por 48 horas | 10 descargas semanales | Sin límite comercial |
| Inspección multipunto | Desactivada | Habilitada | Habilitada |
| Descargas PDF multipunto | 0 | 10 semanales | Sin límite comercial |
| Correos transaccionales del taller | 0 | 10 envíos semanales | Sin límite comercial |
| Registro de clientes por enlace | No | Sí | Sí |
| Mecánicos incluidos | 0 | 4 | 8 |

Básico: antes de conceder el primer acceso a un PDF final (vista previa limpia, descarga, impresión u otra vía), validar y consumir el cupo en servidor; no permitir visualizar documentos finales adicionales ni exponer sus bytes, enlaces directos o rutas alternativas. Cotizaciones adicionales siguen editables como borrador interno, con marca de agua grande, centrada, semitransparente, integrada en cualquier representación restringida: **BORRADOR — NO VÁLIDO COMO COTIZACIÓN**, con aviso DOCUMENTO NO EMITIDO. Mantener identidad R2; no entregar PDF limpio, impresión ni exportación de borrador que eluda la restricción. No prometer impedir capturas de información ya visible. Conservar los originales históricos y distinguir derechos de lectura histórica de acceso/exportación de documentos; definir reconsulta y reintentos del documento autorizado sin duplicar consumos. Flujo Básico debe permitir recepción/OT y cotización limitada sin exigir multipunto. Plus y Full sujetos a sus roles y límites efectivos, no a la licencia personal.

Criterios técnicos propuestos: ventana móvil de 48 h para Básico y semanas lunes 00:00 America/Santiago para Plus, tres contadores separados compartidos por taller, sin acumulación, operaciones exitosas/idempotentes, transacciones/concurrencia, estados pendientes/fallidos y auditoría; precisar semántica de descargas repetidas, cómputo de correo por envío comercial aceptado por proveedor y reintentos antes de implementar. No contar emails Auth del sistema como consumo comercial. Full sin cuotas comerciales de esas tres operaciones, manteniendo protección antiabuso. Aplicar a web/PWA/Android, servidor y Storage/Edge; evitar bypass por preview, generación local del PDF, impresión, URL o API. Conservar aislamiento, históricos y reglas de revocación. El helper piloto existente exige Full manual permanente; separar capacidades legítimas por plan en este bloque sin abrir autorización indiscriminada. Mantener SEC07 cerrado.

**Orden vigente antes de Ignacio:** (1) BT-PILOT-FIX-01, revisión/CI/SQL/deploy autorizados y aceptación focalizada; (2) BT-PLAN-LIMITS-01; (3) logos privados por taller y cobertura de respaldo; (4) BT-REG-02 REAL / BT-REQ-REG-VEH-01, registro autónomo de cliente/vehículo/motivo mediante enlace seguro y solicitud revisada por taller; (5) CP05 correo y BT-COM-01, activar Resend con remitente verificado, cotización, informe y constancia final, revisión de destinatario, consentimientos, historial y reintentos; (6) BT-MOBILE-02A–D, experiencia Android nativa e iPhone PWA y QA física; (7) incorporar Ignacio y dos mecánicos, validación de operación con clientes reales. No postergar registro por enlace ni correo/documentos al marketing. Pagos, prueba comercial, facturación y captación quedan fuera hasta cerrar el piloto. Reutilizar componentes y contratos existentes. No modificar producción ni iniciar bloques adicionales mientras la entrega activa esté pendiente de revisión y autorización.



---


## Recepción de BT-PILOT-FIX-01

Entrega candidata recibida: 49 archivos afectados, 88 entradas en MANIFEST.sha256 más el propio manifiesto. Base funcional 6691a8d4 y anotación 9fe4602 coinciden con la historia oficial (un commit exclusivamente documental). Codex reporta 22 comprobaciones servidor, 48 unitarias, Chromium 1440/390, TypeScript y builds PASS; WebKit BLOCKED_ENVIRONMENT. Estos son resultados reportados del candidato, no CI/producción ni verificación independiente completa de bytes. SQL/rollback y workflow focalizado consultados; el workflow es manual, no se ha disparado. Revisión técnica e integridad independiente pendientes de completar; no integrar ni instalar hasta superar la puerta de revisión y autorización correspondiente. Se conserva la entrega privada sin cambios ni evidencias publicadas. La nueva decisión comercial queda en commit documental separado y debe preservarse al integrar el delta, que se reconstruirá contra su base original.

Sin SQL, despliegues, licencias, correos, respaldos o cambios de infraestructura; Auto-Deploy OFF según documentación previa, no reconsultado en esta acción. SEC07 cerrado.

## Revisión independiente de recepción — Dirección Técnica

- GitHub confirma transferencia en main de revisión y carpeta nueva; árboles de todas las entregas previas intactos. 49/49 snapshots inventariados, sin extras, estados A/M coinciden con base y 49 rutas del diff. Árbol base reconstruido a partir de blobs Git: fc33cb1730a757bcedf2b1290acf8a32e9118374, coincide con commit funcional oficial. Árbol candidato reconstruido independientemente sustituyendo los 49 blobs y modos: 4d2ab82bcc1172f08b0b646432cd83b3a405708d, coincidencia exacta. No se publicó código candidato.
- SHA-256 independiente 8/8 de archivos críticos: identificación, transferencia, delta completo, validación JSON, workflow CI focalizado, checkpoint y dos SQL. El cotejo de las 88 entradas en una sola llamada excedió límite del conector; no se declara 88/88 independiente. Las 89 piezas (incluido manifiesto) verificadas por Codex son resultado reportado. Árbol exacto de las fuentes y hash del diff verificados; resto del manifiesto/evidencias y revisión exhaustiva pendientes.
- Revisión focalizada: guardas CP04 INSERT/UPDATE, bloqueo de hallazgos ready/closed/con entrega, follow-up administrativo, reactivación y recuperación de invitación; se confirmó que la RPC de entrega existente bloquea la fila OT FOR UPDATE. Revisión inicial de navegación, kilometraje, recuperación de cotización, PDF y guardado; no se ejecutaron tests propios. El helper heredado de revocación exige Full permanente manual para el piloto gestionado, no representa la matriz comercial definitiva. BT-PLAN-LIMITS-01 deberá sustituir esa restricción por capacidades precisas (incluido acceso Básico a OT/cotización limitada) antes de entrega a BIOMOTORS. No rebajar guarda actual ni mezclar nuevo alcance en el candidato de once incidencias. El generador multipunto actual produce bytes en navegador: cuotas futuras requieren cubrir el acceso/exportación y no confiar solo en botón. El rollback SQL candidato restaura brechas y no debe usarse rutinariamente. CI oficial Chromium/WebKit y aceptación productiva pendientes; nuevo workflow manual necesita ejecución expresa tras integración.
- Siguiente puerta: finalizar revisión de lo necesario, integrar candidato exacto con autorización separada preservando esta nueva decisión documental; ejecutar CI oficial. SQL y Render requieren sus autorizaciones correspondientes. Sin cambios de producción, sin nueva rama, sin nueva ejecución Codex ni repetición SEC07.
