# ByteTorque — BT-COM-01A · Archivo documental de cierre, candidato privado

**Fecha:** 18/11/2026 · **Estado:** CÓDIGO CANDIDATO, SIN INSTALAR NI HABILITAR.  
**Objetivo:** avanzar tras CP06-LIVE-02 hacia el archivo histórico de tres PDF sin enviar correos, sin fabricar evidencias y sin arriesgar el taller de Ignacio.

## Qué incluye este incremento

`server/com/closingArchiveCandidate.ts` es una función **exclusivamente para backend confiable**, sin enlace desde React, sin endpoint publicado y sin configuración de servidor nueva. Preparará un **manifiesto de tres documentos** vinculado a una sola OT, taller, revisión emitida CP05 y constancia de entrega histórica:

| Archivo | Origen | Almacenamiento previsto |
| --- | --- | --- |
| `01_Cotizacion_*.pdf` | **Exactamente los bytes de la revisión CP05 emitida y congelada**; no regenerar el PDF a partir del borrador actual | Reutilizar referencia privada del bucket `cp05-quote-documents` con verificación SHA-256 y tamaño |
| `02_Informe_*.pdf` | PDF informativo generado a partir de cotización histórica + ejecución declarada y validada | Bucket **futuro y no creado** `bt-closing-documents`, con ruta por taller/OT/revisión/entrega/tipo/SHA-256 |
| `03_Entrega_*.pdf` | PDF informativo de entrega **declarada por el operador**, con checklist histórico | El mismo bucket privado futuro, ruta separada e inmutable |

El manifiesto `version:1`, `state:prepared_not_sent` registra la referencia fuente, taller/OT/revisión, ID de aprobación declarada, informe/entrega, ID del actor, nombre privado de objeto, SHA-256, tamaño, MIME, fuente congelada de CP05 y orden de los tres archivos. **No registra éxito de envío, lectura, firma, pago, conformidad del cliente ni reparación demostrada.**

## Validaciones del código

- Gate `approved` proveniente **exclusivamente del servidor**: si está OFF, no se consulta Auth, ni datos, ni Storage.
- Solo ID UUID canónicos, identidad confirmada, rol autorizado de propietario/administrador/recepción, taller activo, entrega declarada existente y **revisión emitida actual**.
- La fuente se **reconstruye** desde las filas históricas CP05/BT-FLOW-LIVE-02 por `prepareClosingPacket`; no acepta totales, nombres de archivo, rutas, actor ni PDFs enviados por navegador.
- La cotización se lee en privado y debe coincidir por ruta canónica, digest, tamaño e identidad con la revisión SQL CP05.
- Los otros dos PDF requieren encabezado/cierre válidos, longitud máxima acotada, SHA-256 calculado por servidor, upload `upsert:false` vía puerto confiable y lectura posterior de los bytes desde Storage.
- Antes de confirmar el manifiesto se revalidan sesión, taller, revisión y entrega. Si la membresía fue revocada, **no** se confirma el archivo.
- El puerto de confirmación debe usar transacción SQL y unicidad por `(workshop_id, revision_id, delivery_id)`: nunca sobrescribir registros de cierre. Reintento idéntico puede devolver lo anterior; contenido diferente debe rechazarse.
- Storage y SQL **no son una sola transacción**: fallos intermedios pueden dejar objetos privados sin referencia. Nunca borrar un objeto válido ni sobrescribirlo como rollback automático; exigir reconciliación auditada y política de retención.
- Aislamiento estricto A/B, rol mecánico sin escritura, credenciales solo en backend y denegación de acceso al bucket para `anon`/`authenticated`, incluso ante políticas amplias existentes.

## Evidencia de laboratorio

`src/entrega/closingArchiveCandidate.test.ts` prueba mediante puertos totalmente sintéticos: flag OFF, IDs forjados, talleres/revisiones cruzadas, usuario sin confirmar, rol mecánico, taller revocado, cotización privada original, hashes y orden de documentos, nombres/rutas, reintento sin sobrescritura, conflicto de bytes, corrupción, montos ficticios, falta de entrega y revocación justo antes de confirmar.

La prueba de contrato **no equivale** a validación SQL alojada ni a correo real. Cuando CI cierre, agregar aquí su ejecución definitiva y recuento; no usar resultados de checkpoints anteriores como evidencia de BT-COM-01A.

## Activaciones expresamente pendientes

1. Respaldo integral del proyecto Supabase (datos, Auth, permisos, Storage y configuración) con restauración reproducible.
2. Autorización separada para habilitar el archivo CP05 (bucket, políticas y función privada), y después SQL/rollout LIVE-02 limitado al taller QA.
3. Diseño, autorización, instalación y prueba transaccional de una tabla histórica de manifiestos append-only en Supabase con RLS+FORCE y FK compuestas; implementación del `ClosingArchivePorts` contra Supabase/Storage **solo entonces**.
4. Crear bucket privado `bt-closing-documents` **solo con permiso explícito posterior**, restringir MIME/bytes, no exponer URL pública ni otorgar escrituras directas a navegador; probar recuperación y revocación.
5. Verificar en dos sesiones reales A/B y Safari iPhone/Android, incluyendo contenidos A4, integridad de las 3 copias, pérdida de conexión y reintentos conflictivos.
6. Correo consolidado BT-COM-01 independiente: validación humana del destinatario, previsualización, consentimiento, plan y rol, envío **desde servidor** con idempotencia/cola, estados reales del proveedor, nunca enviar por terminar OT. No hay proveedor, destinatario, envío, botón operativo ni email en este incremento.

## Invariantes preservadas

**No se cambió** Supabase alojado, SQL, Auth, RLS, backend Edge, Storage, cobros, Render variables, correo, permisos ni registros auténticos. No se creó bucket y el candidato no es importado por el bundle público/PWA. La marca R2, CP03–CP06 y Android permanecen intactos. El despliegue del pulido visual `d8d6ed99` se realizó **antes de esta etapa** y no implica activar este archivo privado.

**BT-PILOT-QA-04: A REPASAR**, junto con la auditoría final de seguridad y la puesta en marcha de Ignacio. 
