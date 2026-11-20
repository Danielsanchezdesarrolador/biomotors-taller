# CHECKPOINT BT-INS-PDF-01 — Vista previa A4 de informe multipunto

**Fecha:** 20/11/2026. **Rama única:** `main`. **Estado:** CANDIDATO FUNCIONAL, CI definitivo pendiente de confirmar, no publicado. **Último HEAD de código observado al documentar:** `bf131773`.

## Objetivo y decisión

Preparar el **informe técnico multipunto para revisión visual y descarga local**, manteniendo separado el futuro envío de documentos. Desde la orden CP04 autenticada y su sesión R1 se permite abrir `Vista previa PDF` o `Descargar borrador`. El documento usa datos de OT, vehículo y nombre de taller ya cargados por el repositorio existente y los 34 hallazgos por visita confirmados, sin consultar nuevos endpoints ni almacenar el PDF.

## Código y alcance exactos

- `src/ordenes/cp04InspectionPdf.ts`: modelo puro que filtra por `workshop_id`, `order_id` y `vehicle_id`, retiene 34 ítems y últimos diagnósticos por elemento sin convertir pendientes en OK, distingue urgente por prefijo, resolución pendiente/resuelta y advertencia provisional. PDF vectorial A4 multipágina con fuente DejaVu existente y caracteres españoles. Título/estado: **BORRADOR NO ENVIADO**; sin firma, correo ni falsa evidencia de reparación.
- `src/ordenes/Cp04MultipuntoPdfPreview.tsx` y `Cp04OrdersView.tsx`: acciones visibles en detalle autenticado, vista previa de Blob URL con limpieza al cambiar de orden/hallazgos, descarga local. Deshabilita exportación si hay X en cola, error o detalle técnico provisional; no intenta re-POST. Móvil y escritorio: estilos en `cp04.css`.
- `src/ordenes/cp04InspectionPdf.test.ts`: seis ensayos del modelo, aislamiento A/B, prioridad, resolución, provisional y generación real de PDF A4 con nota larga.
- `vite.config.ts` y `scripts/verify-official-bundle.mjs`: añadir solo los dos módulos nuevos a whitelist de **CP04 privado** si `VITE_BT_CP04_PRIVATE_ENABLED=true`; mantener excluidos en el build público/OFF.

## Errores documentados y solución

1. **INS-PDF-INC-01 / TS2454:** ejecución [44761078168](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44761078168) falló TypeScript con "Variable 'page' is used before being assigned" en cuatro líneas. Causa comprobada: control-flow de función `newPage` no asegura inicialización a TS. Corrección `fea438ad`: crear la primera página explícitamente y reutilizarla en `newPage`; no crear página adicional vacía.
2. **INS-PDF-INC-02 / public boundary:** ejecución [44761522752](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44761522752) falló build PLAN04 por importar dos módulos nuevos CP04 fuera de whitelist. Causa comprobada: verificador niega cualquier nombre nuevo no explícitamente permitido. Correcciones `5383cc3d` / `438ab716`: whitelist precisa para ambos módulos únicamente con flag CP04, tanto en bundle como en verificación oficial, sin eliminar restricciones de roles/flags.
3. **INS-PDF-INC-03 / paginación potencial:** inspección del código detectó que una nota de hasta 2000 caracteres podía exceder una página. Correcciones `5b69c0fc` / `bf131773`: dividir las notas en varias páginas, reducir altura de filas y añadir prueba real de PDF largo. **Resultado de esa prueba a comprobar en CI.**

## Evidencia y límites

- Commits implementados: `abe82ea4` (generador/modelo), `cc5d610f` (vista previa UI), `fea438ad` (TS), `5383cc3d`/`438ab716` (frontera privada), `5b69c0fc` (paginar), `bf131773` (prueba PDF).
- Corrida final al documentar: [CI general 44762455426](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455426) y [QA visual 44762455300](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455300) **GENERAL SUCCESS verificado** (84/84 archivos de pruebas web, 6/6 pruebas del nuevo PDF, TypeScript y Android OK). **Visual pendiente** al registrar esta adenda..
- Existe muestra visual independiente de dos páginas A4 realizada localmente con datos **ficticios**, verificada por renderizado en imagen. Muestra editorial, **no es** el PDF generado y descargado de la aplicación ni evidencia de un usuario real.
- **No** se habilitó Render, Supabase alojado, SQL, RLS, Auth, Storage, Edge, correos, PDF emitidos/inmutables, firmas, aprobaciones, pagos, APK ni OTA. No se generaron datos reales, ni imágenes adjuntas, ni identificadores ficticios dentro del código de producción.
- Pendientes: CI final, verificación de descarga con navegador físico/web, confirmar terminología y layout con Ignacio, datos de cliente/técnico/contacto cuando exista fuente autorizada, definición de adjuntos privados y envío conjunto COM solo tras puerta de seguridad y aprobación de revisión/consentimiento. R05–R08 sin ejecutar. **SEC-07** restauración integral separada; **piloto real NO habilitado**.

## Siguiente paso

1. Confirmar status final de los dos workflows y, si fallan, diagnosticar logs antes de reintentar; nunca convertir FAIL en PASS.
2. Validar el PDF real descargado desde la UI con datos sintéticos en móvil/escritorio (sin conexión real) y corregir problemas visuales demostrados.
3. Obtener aprobación visual del formato antes de implementar archivo y correo; esas acciones requieren autorización específica y puertas independientes.

## Adenda de CI general verificado (20/11/2026)

Ejecución [44762455426](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455426) finalizó `completed/success`: Web/iOS PWA + Android/Expo; 84/84 archivos Vitest PASS, `src/ordenes/cp04InspectionPdf.test.ts` 6/6 PASS; verificación de público/privado y build CP04 privado PASS. No prueba el gesto real de pulsar «Vista previa PDF» en un navegador físico. [Pruebas visuales #44762455300](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44762455300) en ejecución al documentar. Sin despliegue ni operaciones alojadas.
