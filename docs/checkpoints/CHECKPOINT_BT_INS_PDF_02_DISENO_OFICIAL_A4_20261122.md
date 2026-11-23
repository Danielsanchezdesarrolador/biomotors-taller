# BT-INS-PDF-02 — diseño oficial multipunto, una hoja A4

22/11/2026 (America/Santiago). **Implementado y probado localmente, sin push ni despliegue.**
Base actualizada por fast-forward: `0bb0ea59d78d1619471ce514c1521631f8abe06c`,
única rama `main`. Se conservaron SEC07 S4H y el trabajo previo, incluidos
`artifacts/` preexistentes no versionados. El commit local de este cierre contiene
este documento, las fuentes y pruebas indicadas abajo; no hay CI remoto nuevo.

## Alcance y autorización

Orden del titular: sustituir únicamente el formato documental CP04 por la imagen
aportada, **exactamente una página A4 vertical**, datos dinámicos, 34 componentes,
tres colores y estados guardados. No reconstruir inspección ni tocar CP05.
Solo trabajo local; push, deploy y operaciones productivas NO autorizados.

El PDF multipágina BT-INS-PDF-01 se conserva en el historial como antecedente;
la decisión actual lo sustituye por un **resumen visual de una hoja**. Las notas
íntegras continúan en el expediente y el modelo; no se envían a otra página ni
se borran. El pie y la interfaz lo explican expresamente.

## Implementación y archivos

- `src/ordenes/cp04InspectionPdf.ts`: página fija 595.28 × 841.89 pt; banner navy,
  logo oficial claro/oscuro, título, identificación, vehículo, leyenda, tres
  grupos de dos columnas, frenos/neumáticos alineados y pie institucional.
  Texto vectorial seleccionable, fuente DejaVu incrustada, bordes redondeados,
  degradados y geometría azul. No captura de pantalla ni imagen externa.
- Logos PNG oficiales ya existentes en `apps/android/assets/brand/` se reutilizan
  sin modificarlos ni cambiar código Android. Son los derivados de marca
  transparentes existentes; no hay rediseño, filtro ni recurso comercial nuevo.
- `cp04Contracts.ts` y `cp04Repository.ts`: lectura mínima `pdfIdentity` bajo
  guardas existentes getUser/membresía/taller, RLS y filtros explícitos. Lee
  cliente asociado y año, valida IDs, ámbito y vigencia del repositorio. No
  cambios a SQL, políticas ni roles; no acceso real durante esta tarea.
- `Cp04OrdersView.tsx`: conecta esa lectura al control existente de PDF.
- `Cp04MultipuntoPdfPreview.tsx`: vista previa/descarga del **mismo Uint8Array**
  mientras el snapshot siga vigente. Invalida bytes/URL al cambiar contexto,
  hallazgos o bloqueos y descarta generación asíncrona obsoleta. Mantiene los
  bloqueos por cola autosave, error y observación provisional. No archiva,
  emite, firma ni envía correo.
- Pruebas: `cp04InspectionPdf.test.ts`, `cp04Repository.test.ts`,
  `Cp04OrdersView.test.tsx`; scripts nuevos `verify-cp04-pdf.cjs` y
  `verify-cp04-pdf-layout.py`. Actualización de AGENTS/agent/roadmap/checkpoint.

Los IDs y categorías de los 34 ítems se mantienen: solo cambia la etiqueta
impresa de algunos nombres, con equivalencia explícita por ID. La prioridad
inmediata sigue siendo attention + prefijo existente; no se interpreta un
pendiente resuelto como diagnóstico OK. Sin evaluar/not_checked = tres
casillas sin X. El PDF no certifica reparaciones ni seguridad de circulación.

## Datos reales disponibles y límites

- Propietario: nombre del **cliente asociado al vehículo**, leído de customers;
  no constituye verificación jurídica de propiedad. Año: vehicles.model_year.
- Marca/modelo/patente: vehículo de la OT autorizada. Kilometraje: lectura de
  ingreso de la OT, sin sustituirla por un kilometraje posterior del vehículo.
- Fecha de visita: opened_at de la OT en America/Santiago.
- **Técnico asignado, combustible y horas propias de inicio/término de inspección
  no existen en el contrato persistido actual: muestran «—».** No se usan
  opened_by, recorded_by, usuario conectado ni closed_at como sustitutos.
  Incorporar esos campos en el futuro requiere otra tarea/autorización.
- Los datos de identificación se ajustan de tamaño con límites legibles. Si
  una cadena extraordinariamente larga no cabe, se bloquea la generación con
  error seguro y visible; no se trunca, no se imprime fuera del papel ni se
  añade una segunda página. Está probado ese rechazo.
- Sin fotografía de automóvil externa: banner y detalles geométricos propios,
  con los recursos oficiales existentes. El texto falso de «envío automático»
  de la referencia se sustituye por «Borrador no enviado».
- Validación Chromium Linux en 1366/390, no Safari/iPhone físico ni una sesión
  real productiva. Renderizado y extracción PDF con Poppler; no PDF/A ni PDF
  etiquetado para lectores de pantalla. El texto sí es seleccionable.

## Verificación consolidada

1. **47 pruebas pertinentes PASS, 9 archivos**: modelo PDF, IDs/ámbito, prioridad,
   una hoja con todas las notas largas, inspección sin evaluar, rechazo de dato
   excesivo, repositorio, contratos, guardas, checklist, autosave y borradores.
2. **TypeScript PASS; build público y CP04 privado PASS**, incluidos verificadores
   de marca/PWA/grafo público. Sin cambiar env ni flags alojados; los valores
   utilizados solo afectaron procesos locales de pruebas.
3. `verify-cp04-pdf.cjs`: **1366 y 390 PASS**, SDK real con HTTP interceptado.
   PDF generado por botón existente; vista previa y descarga **byte-idénticas**,
   cero escrituras REST; revocación retira el PDF/workspace.
4. Poppler `pdfinfo`: **Pages 1; A4 595.28 × 841.89 pt; rotación 0**.
   `verify-cp04-pdf-layout.py` compara 34 rótulos y coordenadas exactas de cada X
   contra el estado esperado; comprueba títulos, pie y texto dentro del papel.
   PASS en ambos PDFs UI, muestra completa y muestra sin evaluar (cero X).
5. `verify-cp04-redesign.cjs` existente: **11 resultados PASS**, siete tamaños
   (360/390/430/768/1366/1440/1920), detalle y estados; autoguardado, error/reintento,
   retorno, borrador, actualización y revocación. Todos sintéticos.
6. Inspección visual del PDF rasterizado: títulos, columnas y pie visibles;
   nombre largo ajustado dentro de su celda. No se ha obtenido aún aprobación
   visual del propietario. Sintaxis JS, comprobador Python y diff check PASS.

No se repitió la suite general de aplicación ni auditorías históricas de seguridad.

### Reproducción local

```sh
BT_MULTIPUNTO_PDF_OUTPUT=/tmp/bt-pdf npm test -- src/ordenes/cp04InspectionPdf.test.ts
VITE_BT_AUTH_R1_ENABLED=true VITE_BT_CP03_PRIVATE_ENABLED=true VITE_BT_CP04_PRIVATE_ENABLED=true npm run dev:harness -- --port 5210 --strictPort
# En otra terminal, mientras funciona el harness:
CP04_BASE_URL=http://127.0.0.1:5210 OUTPUT_DIR=/tmp/bt-pdf/browser node scripts/verify-cp04-pdf.cjs
python3 scripts/verify-cp04-pdf-layout.py /tmp/bt-pdf/browser/multipunto-390.pdf /tmp/bt-pdf/browser/states.json
```

Evidencia de esta sesión: `/workspace/work/multipunto-a4/`, PDF real UI en
`browser/multipunto-390.pdf` y `browser/multipunto-1366.pdf`, muestras de modelo
`multipunto-sintetico.pdf`/`sin-evaluar.pdf`, JSON esperados, preview.png y
`tests-final.txt`. Logs complementarios `/tmp/bt-pdf-*.txt`. Son datos ficticios;
no contienen información de clientes ni credenciales. Las evidencias de workspace
son temporales; las pruebas versionadas permiten regenerarlas.

## Incidentes y resolución (prototipo local sobre 0bb0ea5)

- **PDF02-INC-01:** primer render local con HelveticaBold sin incrustar mostró
  espaciado anómalo y advertencias de Fontconfig. Causa: dependencia de fuente
  de sustitución del renderizador. Corregido: toda la tipografía usa la misma
  DejaVu incrustada, resaltado por trazo, sin duplicar texto ni usar fuentes del
  sistema del lector. Nuevo render y extracción seleccionable PASS.
- **PDF02-INC-02:** nombre ficticio largo invadía la zona del icono del técnico.
  Causa comprobada: ancho de ajuste 205 pt excedía la celda de propietario.
  Corregido a 168 pt y mínimo explícito; revisión visual y prueba de rechazo
  de exceso PASS. No se ocultan caracteres con puntos suspensivos.
- **PDF02-INC-03:** comprobador inicial falló `general/reversa`. El PDF estaba
  correcto; el test usaba 273.64 pt de avance de columna, correspondiente a
  tarjetas inferiores, en vez de 263.64 pt de la tabla ancha. Corregido solo el
  comprobador, manteniendo verificación de cada X/rótulo. Ambos UI PDFs PASS.
- **PDF02-INC-04:** TypeScript inicial: propiedad pdfIdentity ausente en mock SSR
  y categories sin usar tras sustituir la paginación. Se añadió el mock sin
  ejecución SSR y se retiró el import sobrante. TypeScript/builds finales PASS.
- Documentación Supabase por HTTP bloqueada CONNECT403; documentación oficial
  de filtros consultada mediante search_docs. No se cambió versión del SDK ni
  se probaron consultas contra el proyecto alojado.

## Estado final y siguiente paso

Código/commit **solo locales**, sin push, ramas adicionales, deploy, CI nuevo,
cambios de Supabase/Auth/RLS/SQL/datos, infraestructura, secretos, respaldos,
correos, pagos, Storage/Edge ni CP05. SEC07 S4H y sus pendientes se conservaron.
La adenda UX anterior documenta LIVE histórico 7da13a3; no se consultó ni alteró
Render en esta tarea y no se infiere estado alojado actual a partir del checkout.

Próximo: propietario revisa muestra sintética y aprueba visualmente el formato.
Publicación y despliegue requieren autorización expresa separada y el procedimiento
vigente de pausa/verificación de autoDeploy; `[skip render]` es defensa adicional,
no autorización. Si hay una observación visual, corregir solo el formato y repetir
las verificaciones afectadas, sin volver a auditar respaldos ni producción.
