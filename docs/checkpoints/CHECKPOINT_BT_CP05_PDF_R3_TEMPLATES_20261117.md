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

## Cierre técnico y validaciones posteriores (17/11/2026)

- Se corrigió un error de sustitución en las rutas de vista previa/emisión de plantillas privadas en `b6a04303745f1f2e098b8fd856da14e853d24d60`; el reemplazo se reconstruyó desde el último fuente sano y se verificó TypeScript.
- Se corrigió la composición PDF de papelería A4 en blanco (sin objeto `/Contents`) en `1532aefc4528986e50bb272e2c492e2a26232e69`. El generador vuelve a validar una página A4 en el propio render y crea un trazado invisible cuando haga falta. No toca el documento oficial si no se seleccionó plantilla propia.
- **GitHub Verificación ByteTorque `44171119007`: SUCCESS**, trabajo Web/iOS PWA y Android, TypeScript, Vitest, build y candidatos de compilación según workflow. Vitest mantiene los casos de PDF Unicode/A4, paginación 200 partidas, hash/determinismo y nuevo PDF A4 como fondo.
- **Render `dep-dbublmdg1s2s73cfros0`: LIVE**, asociado al commit `1532aefc`. Estas actualizaciones no activan el feature flag premium.
- Verificación visual adicional GitHub `44171119094`: en ejecución en el último chequeo; no declarar PASS hasta consultar su resultado.
- **Pendiente de QA:** el Director debe descargar otra vez `COT-000001-borrador.pdf` desde ByteTorque y confirmar visualmente el nuevo diseño R3. El PDF anterior adjunto no es el nuevo archivo.
- **No instalado:** `docs/sql/BT_CP05_PLUS_FULL_PDF_TEMPLATES_CANDIDATE.sql`; **flag OFF** `VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED`. Plus/Full solo tiene el código preparado, no subida operativa. No se han emitido, enviado ni cobrado documentos.

## Seguimiento de regresión visual y de seguridad

- La ejecución visual `44171119094` falló **antes de validar el diseño**, por una prueba de sobre de invitaciones que ocasionalmente alteraba un byte aleatorio sin modificar su valor. No fue un error de PDF ni un envío externo.
- Corrección acotada a la prueba, no al código de autenticación real: `0daf5bb06d472076a5ffd1178f35957cd9a37c50` selecciona un prefijo distinto del original. Conserva la misma expectativa de rechazo ante corrupción.
- Nueva ronda de workflows: `44171616745` Web/PWA y Android, `44171616949` interfaz/visual y `44171617156` PostgreSQL aislado. PostgreSQL aislado confirmó SUCCESS; Android SUCCESS. Los demás estaban ejecutándose en la última consulta. Consultar resultados de este SHA al iniciar el siguiente chat antes de afirmar PASS completo.
- El último código activo en `main` es el commit `0daf5bb` (posterior a `1532aefc` y solo prueba de autenticación), sin alterar datos, roles ni facturación.

## Siguiente chat: qué hacer

1. Confirmar en Github CI el SHA actual. Si falla, corregir antes de nueva activación.
2. Pedir al usuario descargar PDF borrador de `COT-000001` desde su móvil/escritorio y revisar captura/archivo; comprobar visualmente tipografía, número, totales CLP y paginación.
3. Verificar con un caso largo que los renglones y columnas no se recorten; agregar pruebas visuales de PDF Render/Playwright según entorno.
4. Continuar con CP05 archivo privado y CP06 tras asegurar backup integral verificado. Antes de habilitar plantillas premium se necesita migración 04B y autorización expresa de las nuevas políticas SQL, aislamiento multitenant y flags.
5. Mantener regla de checkpoint después de **cada tarea**. Citar este archivo en mudanza.

**NO confundir candidato de código con función de producción habilitada.**
