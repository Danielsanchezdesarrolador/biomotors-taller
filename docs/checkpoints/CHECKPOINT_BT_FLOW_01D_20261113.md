# CHECKPOINT — BT-FLOW-01D — 13/11/2026

## Alcance y base

Implementación autorizada **exclusivamente DEMO**: inspección → propuesta profesional → cotización → respuesta por revisión → ejecución/informe. **BT-FLOW-01E no iniciada**; entrega y cierre continúan bloqueados.

Se consultó HEAD antes de modificar: `170a125ff2bebb154723b5b0981f34ca87ab9d5d`, sobre `main`. Se leyeron AGENTS, README, roadmap, contrato D y checkpoints B/C/C-R1/INS/COT. Sin agentes concurrentes ni cambios remotos durante la integración. Se conservaron los refinamientos C-R1 (`07ae7f5`): cuatro trabajos iniciales en móvil, expansión/búsqueda, referencia corta e indicación/desplazamiento de hitos.

## Comportamiento entregado

- La misma visita resuelve taller, cliente, vehículo, OT, inspección y documentos por ID. Se rechazan cruces de visita/OT, incluso con entidades relacionadas.
- Inspección finalizada requerida para confirmar propuesta. Motivo original separado del diagnóstico profesional editable; las observaciones multipunto no generan diagnóstico, partidas ni precios.
- Propuesta sobre el `WorkDocument` canónico de BT-COT-01. Se reutilizan `WorkItemsTable`, `WorkItemForm`, validaciones y cálculo `workTotals`/`calculateTotals`. Las partidas de OT, manuales o plantilla conservan procedencia. Sin segunda lista editable ni nuevo motor de IVA.
- Confirmaciones expresas de propuesta y revisión económica/condiciones. «Preparar cotización» reutiliza el mismo `quoteId`, sin duplicar documentos por pulsaciones repetidas.
- Aceptada, Rechazada y Solicita cambios DEMO: fecha, nota, operador sintético, IDs, `quoteId`, `revision` y evento de revisión. La aprobación local del documento no equivale a respuesta del cliente.
- Cualquier revisión nueva invalida la aceptación anterior. Cambiar antecedentes multipunto también obliga a reconfirmar propuesta, revisar cotización y registrar una nueva respuesta; reconfirmar no revive una aceptación antigua. Historial temporal conservado.
- Rechazo/cambios bloquean ejecución guiada y ofrecen revisar propuesta. Una aceptación vigente habilita previsualización y confirmación explícita de precarga. Todos los ítems nacen `performed:false`; repetición reutiliza el mismo informe e ítems.
- Otra revisión aceptada permite otro informe sin sobrescribir el anterior ni sus marcas Realizado. Si las partidas transferidas se alteran, la precarga no las sobrescribe ni duplica silenciosamente. Ruta clásica disponible para consulta/corrección.
- Solo se suman e imprimen trabajos expresamente realizados. Finalizar informe es DEMO y no entrega el vehículo. Retorno al expediente desde los cinco paneles conserva los documentos por ID.
- R2 preservado. Ajuste de totales y tabla anidada para tablet, acotado al expediente, sin desbordamiento horizontal.

## Archivos

Dominio y coordinación:

- `src/flow/flowBusiness.ts`, `src/flow/flowBusiness.test.ts`.
- `src/flow/flowSession.ts`, `src/flow/flowSession.test.ts`.
- `src/informes/trabajos/trabajosData.ts`: procedencia, referencia de precarga y revisión técnica de propuesta; cálculo y reglas de impresión preservados.

Interfaz y trazabilidad:

- `src/flow/FlowProposalPanel.tsx`, `src/flow/FlowQuotePanels.tsx`.
- `src/flow/FlowCasePanel.tsx`, `src/flow/flow.css`.
- `src/informes/trabajos/WorkDocumentPanel.tsx`, `WorkDocumentPreview.tsx`: referencia visible de cotización/revisión para documentos precargados.

Verificación y documentación:

- `scripts/verify-flow-d-ui.cjs`, `scripts/verify-flow-ui.cjs` y `.github/workflows/bt-flow-01.yml`.
- README, roadmap, este checkpoint y capturas/resultados `docs/screenshots/BT_FLOW_01D_*`.

No se modificaron Supabase, Auth/RLS, BT-CP02-D, onboarding, credenciales, planes/pagos, Android nativo ni el motor BT-INS-01. Sin persistencia de datos de usuario, correo, enlaces públicos, firma o aceptación legal.

## Validación ejecutada

| Comprobación | Resultado |
|---|---|
| `npm run typecheck` | PASS |
| `npm test` | PASS: 91/91, 14 archivos; 15 pruebas nuevas de dominio D |
| `npm run build`, verificación PWA | PASS |
| BT-FLOW-01D Chromium 1650/1440/768/390/375 px | PASS: propuesta, aprobación local separada, tres respuestas, caducidad por precio, revisión nueva y nueva aceptación, precarga, realizados, regreso por cinco paneles, otra OT y entrega bloqueada |
| BT-FLOW-01B/C mismos cinco tamaños | PASS: recepción, recurrencia, solicitudes, OT idempotente, mismos recursos, borradores, recarga y refinamientos móviles C-R1 |
| BT-INS-01 mismos cinco tamaños | PASS: controles/teclado, pendientes, fotos/borrador, finalización, impresión y referencias de OT |
| BT-COT-01 mismos cinco tamaños | PASS: partidas, CLP/IVA, condiciones, aprobación caducada, modo trabajo, impresión y ruta clásica |
| BT-REG-02 1650/390 px | PASS: tres pasos, solicitudes DEMO y recarga |
| Red y almacenamiento | Cero solicitudes distintas de GET/HEAD, cero `Storage.setItem`/`indexedDB.open`, localStorage/sessionStorage vacíos y cero errores de página en D |
| Impresión D | Vista previa con una partida realizada, total $62.951 CLP y exclusión de las otras dos; invocación de impresión y PDF A4 de Chromium comprobados |

Las pruebas unitarias incluyen condiciones/fecha/precio, respuestas obsoletas y cruzadas, falta de diagnóstico/partidas, confirmación obligatoria, doble precarga, rechazo/cambios, conservación de informes anteriores y edición de antecedentes técnicos. La ruta de informe mantiene el motor de cálculo existente: tres partidas cotizadas $154.879 CLP; precarga $0; una realizada $62.951 CLP.

Se revisaron capturas reales de escritorio y móvil. Los tres iconos PWA generados que ya estaban sin seguimiento quedaron excluidos de los commits. El desbordamiento inicial detectado en los totales a 768 px fue corregido y el recorrido completo posterior pasó en los cinco tamaños. Las pruebas se ejecutaron con Chromium, no en Safari físico.

Capturas versionadas de propuesta, aceptación/historial, autorización caducada e informe de trabajos a 1650 y 390 px. [Resultados de navegador](../screenshots/BT_FLOW_01D_RESULTADOS.json).

## Commits y publicación

- `56ad17c`: dominio de respuestas por revisión, precarga controlada y pruebas.
- `d7ae7c1`: integración de propuesta, respuesta y ejecución guiada, refinamiento de invalidación técnica, navegador/regresiones y CI de recorridos.
- Commit documental posterior: README/roadmap, capturas y este checkpoint (identificable mediante `git log` en main).

Publicación **verificada** en [Render existente](https://biomotors-taller-demo.onrender.com) para el frontend `d7ae7c1`: HTML, JavaScript y CSS coinciden byte a byte con `dist` del build aprobado.

- JS: `index-D-UWGS3V.js`, SHA-256 `909c6f8ae16d9821955dd6697000e7a595795b94168a365b4cbafd376498cd80`.
- CSS: `index-Bvutn9-h.css`, SHA-256 `72c960e62c22de696b748b32cf6438565f770cf1925d419bd120ec8e7ad5db6e`.
- Recorrido completo **sobre la URL publicada a 1650 y 390 px: PASS**, cero escrituras/almacenamiento/errores de página. Las capturas versionadas corresponden a Render; [resultados Render](../screenshots/BT_FLOW_01D_RESULTADOS_RENDER.json), además del resultado local en cinco tamaños.
- Chromium de este entorno no reconoce la CA del proxy de red (`ERR_CERT_AUTHORITY_INVALID`); para este recorrido remoto se configuró `ignoreHTTPSErrors` solo en el contexto de prueba, sin cambios en aplicación o despliegue. La comparación HTTP con `curl`/Python mantuvo validación TLS.

No se creó otro servicio ni otra rama. El commit documental posterior no cambia los bundles del frontend.

GitHub Actions remoto **no confirmado**: `gh run list` devolvió Forbidden en este entorno. El workflow incorpora el recorrido D; los resultados locales anteriores no se presentan como ejecución remota de Actions.

## Pendientes y punto de parada

Revisión visual del Director y prueba física Safari/iPhone. **Detenerse aquí; no comenzar BT-FLOW-01E.** Cierre/entrega, excepciones completas, backend multitenant, persistencia, identidad/consentimiento, correos, firma, enlaces y Android requieren nuevas etapas y autorización.


## Auditoría posterior de GitHub Actions y capturas (ChatGPT, 13/11/2026)

La respuesta `Forbidden` de Codex no impidió consultar el CI desde otra conexión. [Workflow final 43534790714](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43534790714) del commit `ea96945` **SUCCESS**: el job Web/iOS PWA registra **91/91 pruebas Vitest, 14 archivos, TypeScript, Vite build y PWA PASS**; el job Android React Native/Expo también SUCCESS (no se generó APK). Los workflows remotos específicos del commit funcional `d7ae7c1` para [BT-FLOW 43534467132](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43534467132) y [BT-COT 43534467458](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43534467458) terminaron SUCCESS.

Se visualizaron las capturas versionadas `BT_FLOW_01D_RESPUESTA_1650.png`, `BT_FLOW_01D_RESPUESTA_390.png`, `BT_FLOW_01D_PROPUESTA_390.png` y `BT_FLOW_01D_TRABAJOS_390.png`. Revisión preliminar: identidad R2 y navegación por cinco paneles conservadas, propuesta editable, respuesta DEMO por revisión y separación de trabajos realizados visible, tarjetas de totales con CLP coherentes. En móvil el expediente y el informe son pantallas largas pero desplazables; la barra inferior fija aparece a media altura en capturas `fullPage`, lo que por sí solo no prueba solapamiento interactivo, pendiente de comprobación Safari físico. No se encontraron motivos para solicitar modificaciones de código basados solamente en estas imágenes.

**Pendientes preservados:** aprobación visual/funcional del Director, Safari iPhone físico, BT-FLOW-01E y backend seguro independiente. No se modifica comportamiento de aplicación ni se ha autorizado iniciar 01E mediante esta auditoría.
