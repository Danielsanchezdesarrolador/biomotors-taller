# CHECKPOINT · ByteTorque CP05 PDF R3 y plantillas propias

**Fecha:** 17/11/2026. **Rama única:** `main`. **Dominio:** `bytetorque.cl`. **Proyecto Supabase:** `biomotors-taller` (`suxcqqnmcjoezfxltoms`). **Servicio Render:** `srv-dbqe4quc6qcc73f275jg`.

## Decisión del Director

- La imagen aportada por el usuario es la **referencia visual oficial** del formato predeterminado PDF de cotización/informe ByteTorque.
- El PDF anterior descargado `COT-000001-borrador.pdf` es demasiado simple y debe reemplazarse por composición R3 A4 con diseño premium.
- **Plus y Full** permiten plantilla propia; Básico usa la oficial. Para esta primera versión, «propia» significa hoja base A4 privada con zonas libres para datos dinámicos, no un diseñador de campos arbitrarios.
- **Nueva regla permanente:** entregar un checkpoint reutilizable al concluir cada tarea, pensado para cambiar de chat sin perder continuidad.

## Implementación terminada en el código

1. `c44b2219323783657c4aa6ce172c1d4e8c9c016e`: nuevo render A4 vectorial `src/cp05/pdf.ts`, identidad ByteTorque, fichas, tabla, subtotales, IVA, total, observaciones, condiciones, firmas en blanco, pie de marca, cabeceras y numeración multipágina. Conserva datos dinámicos y marca «BORRADOR SIN EMITIR»; no activa emisión/archivo/correo.
2. `346f61486aec7f1b22018172f41f29e0d534168f`: validación de plantillas propias PDF A4 de 1 página, máximo 4 MiB, sanitización previa en navegador, tests y SQL privada candidata con autorización Plus/Full en servidor.
3. `e6b645d3d1b8372bc1a4c201f3a922acc22fca6b`: formulario condicional en Configuración para cargar/restaurar formato propio Plus/Full, soporte PDF de fondo vectorial, campo de plantilla en snapshot SQL candidato.
4. `087224669b5e9c3ba35f82bfe7533fac142236b2`: preview condicional con lectura autenticada, restricción por ruta/plan del taller, integración de servidor de emisión candidata y prueba adicional de composición de PDF A4.
5. Referencia detallada: `docs/BT_CP05_PDF_DEFAULT_AND_CUSTOM_TEMPLATES.md`.

## Estado real, importantísimo

- Última verificación general confirmada antes del código de plantillas: `44168822468` **SUCCESS** Web/PWA y Android para el PDF R3 básico. Los checks de los siguientes commits deben revisarse y anotarse por SHA antes de afirmarlos como PASS.
- Nuevo PDF oficial activado en código y publicado en Render; la primera prueba física de la descarga nueva todavía debe confirmarla el usuario.
- **El usuario no autorizó nuevas migraciones 04B/04C/plantillas**. Por ello `docs/sql/BT_CP05_PLUS_FULL_PDF_TEMPLATES_CANDIDATE.sql` y `docs/sql/BT_PLAN_04_CP05_BRANDING_CANDIDATE.sql` están **solo en GitHub, NO INSTALADAS** en Supabase alojado.
- Flag `VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED` **no activado**; el formulario y los endpoints privados no funcionan aún con cuentas reales. El usuario ya autorizó exclusivamente la instalación de 04A, realizada antes. No atribuir al usuario autorización implícita de 04B/04C/carga de PDF.
- Sin cobros, sin envíos, sin emisiones archivadas, sin modificación de las cotizaciones ya guardadas. No crear cuentas ni conceder Full a Ignacio.
- La imagen de muestra contiene detalles de contacto y un QR que no son datos comerciales verificados. El generador no debe reproducir teléfonos/correos/enlaces ficticios.
- Mantener el repositorio en la visibilidad autorizada temporalmente por el usuario; **no publicar secretos**, proteger datos reales y no reconstruir.

## Siguiente chat: qué hacer

1. Confirmar en Github CI el SHA actual. Si falla, corregir antes de nueva activación.
2. Pedir al usuario descargar PDF borrador de `COT-000001` desde su móvil/escritorio y revisar captura/archivo; comprobar visualmente tipografía, número, totales CLP y paginación.
3. Verificar con un caso largo que los renglones y columnas no se recorten; agregar pruebas visuales de PDF Render/Playwright según entorno.
4. Continuar con CP05 archivo privado y CP06 tras asegurar backup integral verificado. Antes de habilitar plantillas premium se necesita migración 04B y autorización expresa de las nuevas políticas SQL, aislamiento multitenant y flags.
5. Mantener regla de checkpoint después de **cada tarea**. Citar este archivo en mudanza.

**NO confundir candidato de código con función de producción habilitada.**
