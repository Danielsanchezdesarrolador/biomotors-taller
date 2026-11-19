# ByteTorque — BT-COM-01D · Revisión documental R2 Premium en historial CP06 (CANDIDATO OFF)

**Fecha:** 18/11/2026 · **Rama:** `main`.  
**Estado:** interfaz y pruebas preparadas; ningún servicio de correo/archivo nuevo está conectado. No se ha desplegado a Render.

## Experiencia diseñada

En una revisión histórica CP05 del vehículo, el administrador, dueño o recepción podrán ver un bloque expandible **«Documentación de esta revisión»** cuando las activaciones privadas correspondientes se autoricen en una etapa posterior. Mantiene las tarjetas R2: gris claro, superficies blancas, bordes delicados, acentos azul marino y botones uniformes. Su ubicación reutiliza el historial y sus callbacks de descarga originales; no reconstruye órdenes, cotizaciones, historial ni datos.

Al expandirlo, el operador puede consultar, exclusivamente desde registros ya cargados y verificados:

1. **Cotización histórica 01:** número de revisión, total CLP, nombre del PDF congelado, vínculo a la recuperación original existente **solo si CP05 Storage privado ya está habilitado**.
2. **Informe 02:** total CLP marcado como ejecutado, cantidad de partidas pendientes, nombre del PDF; descarga de copia local informativa únicamente si el flujo histórico y sus controles existentes permiten generarla.
3. **Constancia 03:** fecha y nombre de PDF de entrega declarada; descarga de copia local informativa bajo las mismas condiciones, sin afirmar firma ni entrega física verificada.
4. **Destinatario histórico de referencia:** extraído de la revisión emitida, marcado **NO VERIFICADO**. Puede ser distinto del contacto actual; la etapa de envío real deberá consultar la dirección en el backend y solicitar la conformidad/consentimiento correspondiente.
5. **Vista previa informativa del asunto y tres comprobaciones locales** (destinatario, tres documentos, naturaleza declarativa). Estas marcas son **estado temporal en React**, se reinician al cambiar la revisión/contacto o recargar y **NO persisten en Supabase ni acreditan que se envió algo**.
6. Los botones «Registrar revisión» y «Enviar correo» se muestran **deshabilitados**. No hay envío, cola, proveedor ni nueva escritura. Si faltan registros consistentes de aprobación/ejecución/entrega, no se fabrica paquete y se muestra un estado bloqueado.

El packet se reconstruye con `prepareClosingPacket` desde la revisión CP05 inmutable y declaraciones BT-FLOW-LIVE-02 ya filtradas por taller, OT y revisión por el repositorio CP06. El botón real de descarga de un PDF heredado vuelve a comprobar la sesión por los callbacks preexistentes. Los PDF 02/03 son copias **generadas localmente**, no originales archivados.

## Puertas técnicas e invariantes

**Nuevo flag:** `VITE_BT_COM_01D_PREVIEW_ENABLED` = **OFF por defecto**. El bloque se importa dinámicamente únicamente si además están habilitados:
- `VITE_BT_FLOW_LIVE_02_ENABLED=true`;
- `VITE_BT_CP05_DOCUMENTS_ENABLED=true`;
- `VITE_BT_CP06_PRIVATE_ENABLED=true`;
- rol del usuario propietario, administrador o recepción.

El flag es solo **presentación**, no autorización de backend. El repositorio sigue aplicando Auth/RLS y controles por servidor, y el futuro envío requerirá otras autorizaciones específicas. `scripts/verify-official-bundle.mjs` comprueba que el componente no aparece en bundles OFF y que un build ON tenga las dependencias privadas activas. **No cambiar variables Render** por completar esta etapa.

**Archivos nuevos:**
- `src/historial/ClosingReviewPanel.tsx` y `src/historial/closingReview.css`;
- `tests/harness/ClosingReviewFixture.tsx` (datos enteramente inventados, solo localhost);
- `scripts/verify-com01d-browser.cjs` (siete tamaños, ausencia de documentos, no correos ni red externa).

**Archivos modificados:** `src/historial/VehicleHistory.tsx` (importación/rol/gate y reuso de callbacks), `scripts/verify-official-bundle.mjs`, `.github/workflows/ci.yml`, `tests/harness/main.tsx`, `.github/workflows/bt-oficial-01.yml`.

## QA focalizada y límites de comprobación

- Compilación TypeScript y Web/PWA, tests existentes, Android Expo (sin APK). Build privado de la vista de cierre exclusivamente en CI con interruptor sintético ON.
- Capturas Chromium de la **interfaz real del componente** con fixture inventada en 360, 390, 430, 768, 1366, 1440 y 1920 px; no debe existir overflow horizontal, corte de PDF, envío habilitado, descargas sin Storage, pérdida de estado bloqueado ni persistencia de checkboxes entre recargas.
- Caso negativo con constancia ausente: no se debe mostrar un PDF final ni acciones de envío.
- Los artefactos de screenshots se conservan bajo `artifacts/bt-com-01d/` en la ejecución de UI. **No equivalen a prueba física Safari iPhone/Android.** Registrar los números concretos de ejecución CI y sus resultados solo después de SUCCESS.

**Pendientes para uso real:** backup/restore verificado; autorización de migraciones/Edge/Storage del circuito CP05, LIVE-02, COM-01A/B/C; adaptador backend autenticado de revisión; RLS, dirección y consentimiento; proveedor y auditoría real de envío; pruebas móviles físicas y revisión final `BT-PILOT-QA-04: A REPASAR`.

**Producción se preserva** en el último Render LIVE autorizado `d8d6ed99`. Todas las ediciones de esta etapa llevan `[skip render]`; no habilitar ni afirmar envío.
