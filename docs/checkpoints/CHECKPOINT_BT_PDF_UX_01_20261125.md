# BT-PDF-UX-01 — rediseño local de documentos

25/11/2026 Chile. Base main `1a5eec5` (continuidad y QA humana documentadas).
Candidato local; aprobación visual del nuevo PDF pendiente. NO PUSH/DEPLOY/SQL.

## Implementación

Generador compartido `closingDocumentPdf` adaptado para informe y constancia A4:
logo oficial oscuro íntegro (misma huella que el asset autorizado), cabecera marina,
secciones azul claro con iconos, tabla con estados diferenciados, importes alineados,
subtotal/IVA/total destacado y pie corporativo. Texto seleccionable, sin imagen
estática del mockup. No se cambia la cotización ni se añade multipunto al paquete.

Referencia OT abreviada de su identificador (ocho caracteres iniciales y cuatro
finales), rotulada referencia, no correlativo oficial ni número de cotización.
Sin UUID completos, hashes, CP05, IDs de operadores/paquetes, ni estados ingleses
visibles. No hay nombre de responsable verificado en PreparedClosing: se indica
neutralmente personal del taller registrado, sin inventar identidad/cargo.
Modalidades en español, cálculos existentes preservados; no realizados excluidos
del total ejecutado. Cantidades conservan hasta dos decimales.

El respaldo documental indica procedencia de registros digitales, no que exista
un archivo confirmado: el generador también se usa antes del commit de archivo.
Se conservan avisos de declaración del taller, ausencia de firma, pago y valor tributario.

## Integración e integridad

El adaptador real `server/com/finalArchivePorts.ts` sigue invocando este mismo
generador. Asset horizontal añadido al paquete offline y a Entry con SHA-256
pinneado; recursos estáticos y verify_jwt del empaquetador conservados. Browser
y Edge candidato reciben el mismo wordmark. No se despliega ninguna función.
Los manifiestos completos existentes siguen recuperando bytes originales sin
render/upload; no se cambian claves, hashes históricos, contratos ni upsert:false.
La información técnica sigue en PreparedClosing y manifiestos, solo se omite visualmente.

## Validación consolidada

- Generación real con fixture existente: informe y entrega breves de una página.
  Caso mixto: cotizado $179, realizado $119; partida no realizada $50 no se suma.
- Extremos sintéticos: 70 partidas con descripciones largas, observaciones extensas
  y montos del fixture recalculados coherentemente: informe 12 páginas, entrega 5.
  Sin truncar las 70 descripciones; A4 y texto seleccionable comprobados.
- Verificación pdftotext: límites de página, ausencia de identificadores técnicos y
  ocupación mínima del cuerpo en cada página extensa. Se corrigió un tail casi vacío
  reservando/distribuyendo las últimas líneas de observación con el bloque final.
  Retest PASS; ajuste también conserva los breves en una página.
- 15/15 tests focalizados de finalPackage/closingArchiveCandidate PASS, incluyendo
  inmutabilidad, originales, integridad e idempotencia del candidato. No equivalen
  a consultar o restaurar originales productivos en esta tarea.
- TypeScript y builds privado/público PASS, exclusión de fixtures/privados PASS.
  Paquete Edge offline generado con hashes de recursos y JWT PASS; runtime alojado
  no evaluado. No se repiten SEC07, backups ni auditorías generales.
- Inspección visual de ambos documentos rasterizados, con logo, importes y leyendas.

Comandos: bundle rolldown de `tests/pdfPremiumLab.ts` fuera del repositorio y Node;
`python3 scripts/verify-premium-pdf.py`; Vitest de los dos módulos citados;
`node scripts/package-final-archive.mjs /tmp/directorio-nuevo-fuera-repo`.
Evidencia y PDF ficticios: `/workspace/work/pdf-premium/`. Solo muestras para revisión.

## Pendientes

Aprobación visual del propietario, posterior autorización de publicación/CI y
paquete Edge desplegable con nueva huella aprobada por procedimiento existente.
No basta desplegar frontend para cambiar los documentos realmente archivados.
Falta QA alojada con documentos FUTUROS; nunca regenerar los originales históricos.
No se acredita firma, entrega física, aceptación ni pago. R2 sigue PAUSADO.
NO cambios Supabase, Storage, Render, Edge productivas, variables, correo ni datos reales.

## Archivos exactos

- `AGENTS.md`
- `agent.md`
- `docs/checkpoints/CHECKPOINT_BT_PDF_UX_01_20261125.md`
- `public/cp05/wordmark.png`
- `roadmap.md`
- `scripts/package-final-archive.mjs`
- `scripts/verify-premium-pdf.py`
- `server/com/finalArchiveEntry.ts`
- `server/com/finalArchivePorts.ts`
- `src/entrega/finalPdf.ts`
- `tests/pdfPremiumLab.ts`

## Revisión vectorial tras rechazo visual (25/11/2026 Chile)

El director rechaza la apariencia de las muestras de `b6504ce`; no se registra
aprobación visual. Se corrigen las once diferencias indicadas, sin reconstruir
los contratos ni tocar originales históricos:

- Franjas de cabecera e inferior trazadas con curvas Bézier/SVG, sin escalones.
- Iconos específicos vectoriales (taller, cliente, vehículo, patente, documento,
  calendario, kilometraje, herramientas, entrega, monedas, lista y alcance), sin
  caracteres Unicode usados como iconos. Tarjetas y badges con bordes redondeados.
- Datos generales como mockup: taller/cliente/vehículo/patente a izquierda y OT,
  cotización, ingreso, kilometraje y motivo a derecha; iconos, etiquetas y valores
  en negrita real. OT se abrevia a los ocho caracteres finales del UUID, rotulada
  referencia, no correlativo oficial; el identificador completo sigue en backend.
- DejaVu Sans Bold embebida (archivo de la familia instalada, bajo la licencia
  DejaVu ya incluida), para evitar sustitución de fuente estándar del visor.
  Asset y SHA-256 añadidos al paquete Edge candidato y al navegador; nada desplegado.
- Jerarquía de títulos, «Detalle de trabajos», etiquetas realizadas/no realizadas
  redondeadas con check/indicador vectorial y total azul intenso con panel celeste,
  acento lateral, esquinas redondeadas y valores alineados en negrita.
- Mejor distribución A4 y separación entre tarjetas. Motivo extenso continúa a
  ancho completo en lugar de trasladar una fila enorme dejando vacía la primera
  página. Cálculos, fechas, nombres neutrales, trazabilidad e integridad conservados.

Validación solo de diseño: generación real de los dos PDF breves en una página
y casos extensos; extracción de texto, límites y ocupación de páginas mediante
`verify-premium-pdf.py`; 2 tests PDF seleccionados PASS (otros 3 omitidos),
TypeScript PASS y empaquetado Edge offline con recursos verificados PASS.
No se repiten backups, SEC07, auditorías ni pruebas generales de aplicación.
Inspección visual de ambos rasterizados. Los datos siguen dinámicos/seleccionables;
no se incrustan mockups como fondo. PDF y PNG de revisión en
`/workspace/work/pdf-premium/`, fuera de Git.

Solo candidato LOCAL, pendiente de nueva aprobación visual. NO PUSH/DEPLOY/SQL
ni cambios de infraestructura. PDFs históricos y hashes existentes intactos.

## BT-PDF-UX-01-R1 — aprobación visual y publicación autorizada (25/11/2026 Chile)

El propietario aprueba visualmente `cc3d0be758ceab3293523c8a9a78ee86e36e7aad`
y autoriza publicar en main el diseño íntegro existente y permitir CI. Se levanta
únicamente el NO PUSH de esta entrega; sin código adicional ni repetición de pruebas
locales aprobadas. Originales históricos intactos y R2 PAUSADO. Auto-Deploy OFF.
NO DEPLOY, NO SQL, NO desplegar Edge Functions ni modificar Supabase, Storage,
Render, variables o datos alojados. La activación alojada requiere otra autorización.

---

Base remota verificada: `1a5eec5eb4b01d8e7d37c9b1562cc3f18f8365d3`.
Publicación por avance rápido, conservando los commits existentes del diseño.
