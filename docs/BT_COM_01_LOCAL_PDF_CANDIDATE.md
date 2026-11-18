# ByteTorque — BT-COM-01 · Paquete documental histórico candidato

**Fecha:** 18/11/2026  
**Alcance:** CP06 / BT-FLOW-LIVE-02, código en `main`; **no activado en Supabase/Render**.

## Resultado funcional candidato

Una revisión histórica CP05 emitida, acompañada de las tres declaraciones **persistidas** de BT-FLOW-LIVE-02, permite reconstruir tres piezas documentales en orden:

1. `01_Cotizacion_*.pdf`: **nombre previsto para el futuro paquete consolidado**. En CP06 actualmente se descarga por separado el archivo original de la revisión histórica CP05 como `COT-xxxxxx-Rn.pdf`, recuperable del almacenamiento privado con verificaciones de SHA-256; este bloque **no vuelve a emitir la cotización** ni altera revisión o importes.
2. `02_Informe_*.pdf`: copia A4 generada en el navegador desde la revisión congelada y el registro de ejecución `bt_flow_execution_reports`. Muestra partidas realizadas **según declaración del operador**, no realizadas, pendientes, importes neto/IVA/total históricos y valores solo declarados como realizados.
3. `03_Entrega_*.pdf`: copia A4 generada en el navegador desde la declaración `bt_flow_visit_deliveries`, con operador, momento, método, cuatro comprobaciones y observaciones; referenciada a la misma OT, revisión e informe.

**Importante:** Informe y constancia son **copias informativas locales**, no archivos PDF finales almacenados en el servidor, no firmas electrónicas, no documentos tributarios y no son prueba independiente de reparación, conformidad, recepción, correo enviado ni pago. Los archivos 02/03 se regeneran desde filas históricas de solo lectura en lugar de almacenarse.

## Contratos y defensas incorporados

- `src/historial/flowEvidence.ts` obtiene aprobaciones, ejecuciones y entregas **por revisión y por taller**, con consultas paginadas del CP06 existente y respetando su verificación de sesión/membresía. La lectura solo se ejecuta con `VITE_BT_FLOW_LIVE_02_ENABLED=true` y los demás requisitos privados.
- Ningún registro pertenece al historial si falla su identidad de taller, vehículo, OT, cotización o revisión. Se validan vínculos aprobación → ejecución → entrega; cantidades y decisiones de todas las partidas de la cotización histórica; totales calculados desde el snapshot; estado explícito `operator_attested`; método, fechas y checklist.
- Los registros ausentes no se completan artificialmente. Si falla la consulta LIVE-02, las visitas/inspecciones/CP05 siguen disponibles y se muestra estado «no verificable», **no «no hubo trabajos»**. Las denegaciones de identidad o taller bloquean la exposición.
- `src/entrega/finalPackage.ts` exige las **tres** declaraciones vinculadas para reconstruir el paquete. No infiere ejecución por estado `closed`, ni aprobación por enviar la cotización.
- `src/entrega/finalPdf.ts` genera copias A4 con saltos de página, marca visible del carácter declarativo, referencias a OT/revisión e identificador del registro y huella de la cotización.
- Antes y después de crear bytes PDF, la interfaz solicita una nueva comprobación de identidad, sesión, membresía y vehículo a CP06; si se pierde acceso, no descarga.
- Sin envío de correo, generación automática tras cierre, escritura a Storage, SQL nuevo, activación de flags o manipulación de datos auténticos.

## Reglas para la fase alojada y el correo único BT-COM-01

**Antes de habilitar el piloto:** respaldo íntegro y restauración comprobada, activación CP05 Storage/Edge autorizada, revisión SQL LIVE-02 y interruptor privado inicialmente OFF, prueba de RLS A/B alojada, Safari iPhone y Android físicos, revisión visual A4, y aprobación del Director.

**Correo consolidado posterior, separado por autorización:** producir y guardar versiones PDF finales en almacenamiento privado con hashes y referencias inmutables, validar receptor y plan, permitir revisión previa explícita del operador, asociar un solo paquete de revisión a un envío idempotente desde servidor, registrar estados reales del proveedor, y permitir reenvío auditado sin atribuir lectura o firma. Mantener el correo apagado hasta que esa fase esté implementada y aprobada.

**BT-PILOT-QA-04: A REPASAR.** La auditoría final de seguridad y adopción del taller de Ignacio continúan pendientes.
