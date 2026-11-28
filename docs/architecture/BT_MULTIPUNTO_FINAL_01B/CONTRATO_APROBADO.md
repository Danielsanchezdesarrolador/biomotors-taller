# D01–D10 aplicados y condiciones adicionales

Aprobación del titular suministrada en la instrucción 01B. No sustituye aprobación de instalación o aceptación independiente.

| Decisión | Contrato implementado |
|---|---|
| D01 | Ledger único. Conversión V2 mismo snapshot/actor/sesión/épocas, cinco minutos desde reserva. Emisión directa confirma una unidad junto al original. Lecturas y reintentos no amplían vigencia. |
| D02 | America/Santiago, lunes 00:00; DST por PostgreSQL. Primer confirmed_at se conserva en promoción, incluso al cruzar semana. Reserva activa ocupa plaza; cuota después de locks y reloj real. |
| D03 | No adopción de créditos de otro actor. Mecánico prepara borrador; owner/admin puede emitir directamente con consentimiento de una unidad nueva. Sesión/épocas vinculantes para conversión. |
| D04 | Históricos originales premium actual, sin cuota; Básico metadata. Nuevo JWT/sesión/semana/perfil no regenera ni vuelve a cobrar un original. |
| D05 | Solo owner/admin emiten. Al menos uno evaluado; parcial requiere acknowledgement. Los no revisados siguen no revisados. Emitir no edita ni reabre OT. |
| D06 | Definitivo servidor A4, 34 componentes, notas/anexos completos, sin BORRADOR. Borrador actual conserva renderer y marca. No parámetro clean en HTTP. |
| D07 | V1 permanece V1. Registro V2 exclusivo; tres RPC V1 rechazan crédito V2 mediante guard candidato aditivo con comprobación de fuente. Limpios fuera de draft cache. |
| D08 | Archivo privado, SHA/CAS/readback, originales inmutables de aplicación, huérfanos privados y S5B ampliado. Recuperación productiva pendiente de aprobación. |
| D09 | ZIP existente exactamente tres originales. Descarga multipunto independiente; ZIP V2 fuera de alcance. |
| D10 | Instalación futura separada y autorizada, gates propios OFF y reversión sin borrado. |

`maxAdditionalUnits` es precondición de consentimiento, nunca permiso. Una promoción fallida se detiene; una nueva solicitud o renovación no consumida necesita intervención expresa. Una operación confirmada vencida no se renueva conservando UUID. No hay consumo automático por errores, zoom, cerrar o abrir el visor.

Separación: H_source, H_snapshot, creditId, issueRequestId, documentId/revisión, H_pdf y autorización de lectura. El registro de plantilla fija hashes de código/plantilla/font/logos existentes; el empaquetador rechaza drift. Una futura plantilla requiere versión/migración nueva, no actualización silenciosa del registro inmutable.

Las cuatro firmas GATE4 conservan cuerpo y ACL: operations_status(uuid), final_archive_document(uuid,uuid), final_archive_source(uuid,uuid,uuid,uuid), commercial_status(uuid). Toda entrada nueva revisa EXECUTE efectivo de authenticated y JWT/sesión vigente; definer no sustituye al llamador. Las revocaciones negativas se ejecutaron exclusivamente en el laboratorio y restauraron ACL exactas.
