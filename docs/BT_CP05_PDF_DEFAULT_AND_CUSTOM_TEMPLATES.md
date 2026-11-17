# ByteTorque · CP05 PDF R3: plantilla oficial y papelería propia Plus/Full

**Aprobado visualmente:** 17/11/2026. **Rama:** `main`. **Referencia autorizada:** imagen de cotización ByteTorque aportada por el Director. **PDF anterior:** borrador QA `COT-000001-borrador.pdf`, una página, presentación de texto simple. Esta política sustituye el estilo básico como elección predeterminada, pero no modifica revisiones históricas.

## 1. Formato predeterminado obligatorio

El documento A4 generado por `src/cp05/pdf.ts` usa ahora una **plantilla corporativa R3 dibujada dinámicamente**, con:

- Icono y denominación ByteTorque, encabezado azul marino/azul intenso, título, número, revisión, estado, fecha y vigencia
- Dos fichas de identificación (cliente y vehículo), OT y motivo
- Tabla formal con descripción, tipo, cantidad, precio unitario neto y total neto de cada partida
- Condiciones, observaciones, cuadro de subtotal/IVA 19 %/total
- Datos reales configurados del taller cuando existan, espacio vacío de conformidad sin afirmar firmas y pie «Powered by ByteTorque»
- Numeración de páginas y paginación real de hasta 200 ítems, sin convertir la referencia QA en un fondo fijo; mantener caracteres Unicode y redondeos del contrato CP05
- Marca expresa «BORRADOR SIN EMITIR» cuando aplique; el formato **no** convierte el borrador en revisión emitida, comprobante tributario ni aceptación.

**No copiar** teléfonos, correos, URLs de contacto ni códigos QR de la imagen que no estén confirmados/configurados; evitar datos ficticios de soporte en documentos reales. El QR/maquetación especial que se ve en la referencia no es funcional sin un destino confirmado y será una mejora específica posterior. El formato A4 debe permanecer legible en descargas de Android/iPhone y escritorio.

El logo privado de un taller autorizado puede agregarse por el canal ya preparado de identidad comercial; no reemplaza a la marca ByteTorque ni a los datos históricos archivados. Los PDF emitidos serán inmutables por revisión cuando el archivo privado sea autorizado.

## 2. Plantilla propia para Plus y Full

**Decisión comercial:** planes Plus y Full activos pueden subir una **plantilla PDF propia** del taller. Básico no puede cargarla, pero sigue viendo el formato oficial. No hay costo por archivo ni cargo por mecánico; los suplementos de plazas mecánicas son una regla comercial separada.

**Primera modalidad técnica implementada como candidata:** *papelería PDF A4 privada de una página*, como fondo estacionario. ByteTorque superpone todos los datos dinámicos y continúa calculando totales desde los registros; la hoja base debe dejar despejadas las zonas de cliente/vehículo/partidas/totales. Un PDF completo arbitrario no proporciona coordenadas ni campos rellenables de forma automática: mapeo de campos 100 % libre y diseñador visual se consideran una fase posterior y **no se declaran implementados**.

**Seguridad:** carga máximo 4 MiB `application/pdf`, cabecera `%PDF-`, una página A4 vertical, limpieza a documento nuevo quitando anotaciones/acciones de página, nombre aleatorio por taller, almacenamiento privado y sin URL pública. Solo el dueño o administrador del taller **con Plus/Full vigente verificado en servidor** puede seleccionar la plantilla. RLS/Storage impiden insertarla o descargarla desde otro taller, rol o cuenta sin plan. La configuración se guarda únicamente como ruta privada del taller. La selección oficial restaura el formato ByteTorque sin borrar PDF históricos. El backend debe verificar nuevamente plan y ruta exacta antes de emitir.

**Archivos de implementación:**
- `src/workshops/pdfTemplate.ts` y `src/workshops/pdfTemplate.test.ts`: sanitización, validación y acciones cliente
- `src/workshops/WorkshopSettings.tsx`: carga/restauración de hoja base en Configuración, bajo `VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED`
- `src/cp05/pdf.ts`: soporte de fondo PDF A4 opcional con contenido dinámico encima, además de plantilla R3 oficial
- `src/cp05/QuotePanel.tsx`: previsualización autenticada condicional de plantilla privada
- `server/cp05/supabasePortsCandidate.ts`: verificación por RPC autenticada, plan y ruta de taller antes de la emisión candidata
- `docs/sql/BT_CP05_PLUS_FULL_PDF_TEMPLATES_CANDIDATE.sql`: candidato aditivo para bucket privado, columna y funciones de autorización
- `docs/sql/BT_PLAN_04_CP05_BRANDING_CANDIDATE.sql`: incluir `templatePath` en snapshot inmutable de emisión; **solo** después de migración de plantillas.

**Estado al 17/11/2026:** lógica/frontend candidatos escritos; flag de plantillas **OFF**, bucket/RPC no instalados y ninguna carga autorizada en producción. No activar el flag ni instalar SQL sin aprobación específica del Director, respaldo íntegro, 04B instalado y QA de RLS/accesos cruzados. El backend de emisión/Storage y correos CP05 siguen desactivados.

## 3. Pruebas de aceptación necesarias

- PDF oficial con datos QA1234 conserva subtotal $90.261 CLP, IVA $17.150 y total $107.411; A4, Unicode, paginado y sin datos fijos de la imagen
- PDF de borrador muestra estado inequívoco; no envía ni archiva ni marca como aceptado
- 1, 3, 50 y 200 partidas sin texto recortado, tablas sobrepuestas o páginas perdidas; nombres largos, observaciones largas y caracteres españoles
- Un taller Plus/Full puede subir/sustituir/restaurar hoja A4 propia solo si la política/plan está activo; rechazo Básico, mecánico, cuenta ajena, taller distinto, archivo mayor que 4 MiB, PDF multipágina/archivo inválido
- Cuenta con plan vencido, downgrade, sesión cerrada, invitación revocada y rol no autorizado no pueden continuar subiendo; restauración del documento oficial disponible al dueño autorizado
- PDF emitido conserva el **snapshot** de plantilla y marca de su revisión: cambios posteriores no alteran archivos históricos
- Snapshot del taller A nunca permite descargar la plantilla B; todo envío exterior permanece OFF sin autorización
- QA real con navegador físico Android/iPhone y PDF descargado, aparte de pruebas automáticas con datos simulados.

## Orden y puertas siguientes

1. Validar visualmente PDF R3 realmente descargado por el Director de `QA1234`; iterar hasta lograr fidelidad suficiente a la imagen.
2. Completar backup integral verificable. Autorizar e instalar PLAN-04B/04C (aún candidatos) solo tras revisar su alcance.
3. Revisar/autorizar SQL `BT_CP05_PLUS_FULL_PDF_TEMPLATES_CANDIDATE.sql`, verificar RLS/bucket privado, luego `BT_PLAN_04_CP05_BRANDING_CANDIDATE.sql` en orden.
4. Habilitar `VITE_BT_PLAN04_WORKSHOPS_ENABLED` y posteriormente `VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED` solo con pruebas reales positivas/negativas y confirmación de despliegue.
5. Autorizar archivo privado CP05/CP06 y correo posterior por separado; no permitir datos reales ni envíos antes del cierre del piloto.

**Regla de continuidad:** después de cada tarea completada, crear checkpoint con commits, CI, migraciones aplicadas/no aplicadas, flags reales, pruebas y próximos pasos, en `docs/checkpoints/`, con enlace reutilizable al mudarse de chat.
