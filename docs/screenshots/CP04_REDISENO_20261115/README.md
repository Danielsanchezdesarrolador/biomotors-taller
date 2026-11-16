# Órdenes de trabajo — rediseño oficial

**15/11/2026 · main · base 8caec8a.** Un único cierre de la integración visual; no se creó otra aplicación ni se reconstruyó CP04.

## Antes y después

Capturas reales de Chromium ejecutando la aplicación y su SDK oficial, con HTTP de Supabase **interceptado y datos sintéticos**. No son fotografías de un teléfono físico ni prueba de persistencia hospedada. Los registros de las imágenes no se publican en el bundle ni se guardaron en Supabase.

| Vista | Antes | Después |
| --- | --- | --- |
| Escritorio 1650 | [Antes](before-1650.png) | [Después](after-1650.png) |
| Móvil 390 | [Antes](before-390.png) | [Después](after-390.png) |

También: [1440](after-1440.png) · [tablet 768](after-768.png) · [móvil 375](after-375.png) · [carga](loading-390.png) · [vacío](empty-390.png) · [error](error-390.png).

## Cambio entregado

Encabezado compacto con el mismo recurso automotriz oficial; sesión verificada compacta exclusivamente en Órdenes privadas; barra informativa de autoguardado con ayuda accesible; cuatro indicadores reales sobre la consulta existente, 2×2 en móvil/tablet y una fila en escritorio. Se explicita el alcance de **hasta 40 órdenes recientes**, sin inventar un total histórico.

Nueva recepción desplaza y enfoca el formulario existente. Actualizar recarga la lista sin desmontar el multipunto, cerrar sesión ni borrar borradores. Cada tarjeta muestra patente, marca/modelo, motivo, estado, fecha/hora y kilometraje registrado, con icono genérico autorizado y apertura de su orden real. Los cinco estados CP04 se conservan. Carga con skeleton, vacío con recepción y error/reintento diferenciados; el fallo de consulta muestra indicadores no disponibles, nunca cero como resultado válido.

Preservados R1, selección de taller y RLS; CP03; alta por patente, confirmación, estados/cierre; plantilla original de 34 componentes, cola independiente por X, Guardando/Guardado/Error, notas, prioridad inmediata, diagnósticos y problemas pendientes. No se modificaron Auth, secretos, SQL, políticas, pagos, correos, invitaciones, Android ni los recursos oficiales.

Se corrigieron tres problemas encontrados durante la integración: el repositorio CP04 se recrea tras cleanup de StrictMode sin reutilizar una instancia invalidada; el detalle anterior queda inerte mientras se abre otra orden; la posición de lectura se conserva en el borrador temporal existente al revalidar sesión/foco. La posición no concede permisos y no recrea un borrador eliminado al cerrar sesión.

## Comprobaciones consolidadas

- TypeScript PASS.
- Vitest **525/525**, 59 archivos: 524 anteriores preservados + regresión de posición/texto y borrado seguro. Después de corregir incidencias se repitieron las suites afectadas y la comprobación final.
- Build web/PWA y build privado con flags CP03/CP04: PASS. Fronteras de módulos, ausencia de fixtures y hashes de marca/PWA: PASS.
- Navegador **1650/1440/768/390/375**: indicadores, cinco estados, recepción/foco, actualización sin pérdida de texto, diez X consecutivas y restauración de marcas/posición tras volver al foco: PASS. A 390, **34/34 X**, Guardando/Error/reintento, orden cerrada de solo lectura y creación de recepción interceptada: PASS. [Resultados](results.json).
- Carga, vacío, error/reintento sin ceros falsos y revocación de membresía: PASS con HTTP simulado. Es una regresión del cliente y su contrato; no una nueva certificación de RLS hospedado.
- Cinco paneles y siete pantallas de acceso/navegación existentes, en cinco anchos: PASS. Ninguna escritura en el Supabase alojado durante estas comprobaciones.
- GitHub Actions: workflow existente ampliado para repetir la regresión CP04; consulta de su API bloqueada por `Forbidden`, también fuera del sandbox. **No se declara CI remoto aprobado.** [Actions main](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions?query=branch%3Amain).

## Publicación y pendientes

Publicación autorizada en el único Render existente: https://biomotors-taller-demo.onrender.com. Verificación de versión servida pendiente del push; se actualizará este apartado con la evidencia. No se cambian Environment ni flags existentes.

Pendientes: revisión visual del Director; comprobación física Android/iPhone/Safari y persistencia real de las marcas mediante su sesión autorizada. No se atribuye esa evidencia a las pruebas HTTP simuladas ni se habilita el tratamiento de datos personales. Los registros CP03/CP04 hospedados no fueron modificados por esta intervención.
