# ByteTorque — CHECKPOINT BT-COM-01D · Cierre documental R2 Premium

**Fecha local de avance:** 18/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Única rama:** `main`.

**Checkpoint anterior:** `f3de3acc2710a792bb2d6adcc6fef32a7ce76c51` (BT-COM-01C).

**Último commit de código y CI validado:** `2c025addc5d88c42b9f2095eee88caf41cceb3dd`.

**Estado del bloque:** interfaz candidata preparada y probada, **NO activada ni publicada en Render**.

## 1. Resultado implementado

Se añadió una vista de cierre documental al historial CP06, sin reconstruir sus componentes ni alterar cálculos, contratos o estados ya existentes.

- `src/historial/ClosingReviewPanel.tsx`: bloque R2 expandible «Documentación de esta revisión». Presenta los tres documentos, sus nombres de archivo, total CLP cotizado frente a total CLP declarado como realizado, y constancia histórica declarada. Los datos se obtienen **solo del paquete validado** mediante `prepareClosingPacket` desde cotización emitida CP05 y tres registros históricos BT-FLOW-LIVE-02. Si falta una declaración o falla su coherencia, el componente **no inventa documentos**.
- Destinatario de la revisión antigua etiquetado **«dato histórico · NO VERIFICADO»**, sin atribuir validez actual, consentimiento ni autorización del cliente. Vista previa del asunto informativo, sin construir ni emitir un correo operativo.
- Tres casillas para revisión **exclusivamente local y efímera**. Se restablecen al cambiar revisión/contacto o recargar; no se guardan en SQL ni equivalen a confirmación en servidor.
- **Botones «Registrar revisión» y «Enviar correo» siempre disabled.** Los PDFs privados solo pueden descargarse por los callbacks existentes de CP05/CP06, con verificación de sesión/rol/rollout ya presente, si esos servicios han sido previamente autorizados. Las copias 02 y 03 siguen siendo informativas, no archivos originales.
- `src/historial/closingReview.css`: tarjetas blancas compactas, fondo gris azulado, jerarquía navy y azul, chips discretos y comportamiento táctil responsive.

## 2. Gate y alcance técnico

- Nuevo interruptor `VITE_BT_COM_01D_PREVIEW_ENABLED`: **OFF por defecto**, independiente de backend y sin modificar variables de Render.
- Para cargar dinámicamente el módulo exige simultáneamente `VITE_BT_FLOW_LIVE_02_ENABLED=true`, `VITE_BT_CP05_DOCUMENTS_ENABLED=true`, `VITE_BT_CP06_PRIVATE_ENABLED=true` y rol dueño/admin/recepción. No concede privilegios: los lectores del repositorio y las descargas siguen validando identidad/membresía/taller.
- `src/historial/VehicleHistory.tsx` reutiliza los datos y callbacks verificados, preservando paginación, historial, navegación, scroll, órdenes y cotizaciones. No se añaden consultas ni escrituras al proveedor de correo.
- `scripts/verify-official-bundle.mjs` rechaza incluir el componente en build público/OFF o activarlo sin las puertas privadas; `.github/workflows/ci.yml` compila un build ON solo con valores ficticios dentro del CI, sin desplegarlo.
- `tests/harness/ClosingReviewFixture.tsx`, `tests/harness/main.tsx`, `scripts/verify-com01d-browser.cjs`, `.github/workflows/bt-oficial-01.yml`: ruta sintética solo en localhost, pruebas visuales y capturas del componente real.

## 3. Verificaciones cerradas

- **[GitHub Actions general #44432369991](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44432369991): SUCCESS.** Commit `2c025add`, **717/717 Vitest (82/82 archivos)**, TypeScript, Web/PWA público y builds privados, Android Expo sin APK, PostgreSQL 17 aislado, exclusión de módulo en OFF y compilación ON solo en CI.
- **[GitHub Actions visual #44432370000](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44432370000): SUCCESS.** Marca `BT_COM_01D_R2_CLOSING_UI_SEVEN_SIZES_NO_MAIL_PASS`.
- Se revisaron **360, 390, 430, 768, 1366, 1440 y 1920 px**, sin scroll horizontal o filas salidas de pantalla. Se comprobó: tres PDF ordenados, botones de archivo y correo bloqueados cuando el backend no está habilitado, estado «NO guardado» de las tres casillas, ausencia de persistencia tras recarga, ausencia de solicitudes externas y fallo seguro al faltar constancia de entrega.
- Capturas de después: artefacto GitHub Actions **`BT-OFICIAL-01A-Estados-vacios-Capturas`** (ID `14486323719`), directorio `artifacts/bt-com-01d/`. Prueba WebKit Linux existente: **no sustituye Safari real en iPhone**.

## 4. Integridad y no-activación

**Sin cambios** a SQL/Supabase alojado, Auth/RLS, Storage, permisos, planes, cobros, Edge, email, proveedor de correo, archivos archivados, registros de Ignacio ni app Android nativa. **No se ejecutó deploy Render**; todos los commits incluyen `[skip render]` y la versión oficial sigue siendo la del pulido BT-UI-POLISH-01 `d8d6ed99`, publicada con autorización anterior.

La interfaz refleja la capacidad preparada, pero su revisión está **solo en memoria y no constituye un paso documental final operativo**. No se declara al cliente aprobado, pagado, firmado ni que haya recibido/abierto un correo.

## 5. Continuidad

**Siguiente hito prioritario:** respaldo integral y restauración comprobada del Supabase del piloto (incluidos datos, Auth y Storage); después autorización expresa e instalación escalonada de CP05/BT-FLOW-LIVE-02 y adaptadores COM-01A/B/C/01D en taller QA, manteniendo envío real OFF hasta probar consentimiento, dirección, proveedor y deduplicación. Se puede seguir desarrollando Android y UI sin activar backend, pero no confundir código candidato con operatividad de Ignacio.

**BT-PILOT-QA-04: A REPASAR** para auditoría de seguridad y pruebas físicas finales. No crear ramas paralelas; continuar desde `main` sin sobrescribir otro avance.
