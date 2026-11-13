# BT-FLOW-01D — Contrato de implementación: propuesta, cotización y respuesta por versión

**Fecha:** 13/11/2026 · **Estado:** especificación para implementación DEMO tras BT-FLOW-01B/C.  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Rama:** `main`.  
**Predecesores:** BT-FLOW-01A aprobado; BT-FLOW-01B/C funcional; refinamientos móviles de BT-FLOW-01C mediante `07ae7f5` (verificar CI/HEAD antes de continuar).  
**Regla central:** no automatizar diagnósticos, precios, aceptación real ni trabajos realizados.

## Objetivo y límite

Completar el flujo lógico desde la inspección multipunto y la propuesta humana hasta la cotización, su respuesta explícita **ligada a una revisión exacta** y la habilitación controlada de ejecución. No iniciar cierre/entrega BT-FLOW-01E ni conexiones reales de backend, mensajes o firma.

## 1. Modelo de autoridad y procedencia

- Cliente, vehículo, visita, OT y multipunto se resuelven por **IDs**, vinculando mismo `workshopId`, `clientId`, `vehicleId` y `orderId`. Reutilizar `src/flow/flowSession.ts`, `directorySession`, `orderSession`, `multipuntoSession`, `trabajosSession`.
- El **motivo del cliente** se conserva en la recepción. El **diagnóstico profesional** lo introduce el mecánico, nunca se infiere del motivo ni de una X del multipunto.
- La **propuesta de trabajos** necesita al menos un ítem con descripción/tipo, cantidad, precio CLP válido y fuente documentada (OT confirmada/definición manual). No generar precios desde el multipunto, ni convertir observaciones en reparaciones sin decisión humana.
- La cotización BT-COT-01 `quote` mantiene `WorkDocument.id` y `revision`; usar ese documento como fuente de verdad de ítems, totales, condiciones, revisión y aprobación simulada. No crear otra lista completa de ítems ni otro cálculo de IVA.
- El trabajo BT-COT-01 `work` sigue con `performed: false` por defecto. Los ítems del informe se copian **solo por acción explícita** desde la cotización autorizada (con snapshot de versión y confirmación), sin marcar ninguno como realizado. Comprobar que no se duplican al repetir la acción.
- Los estados de opinión del cliente se almacenan localmente **con `quoteId`, `revision` y timestamp**, más nota breve. Ese registro no constituye identidad verificada, correo enviado, contrato ni firma.

## 2. Máquina de estados propuesta

| Evento | Prerrequisito | Resultado DEMO |
|---|---|---|
| `INSPECTION_REVIEWED` | BT-INS-01 finalizado para la misma OT | Habilita la definición de propuesta; hallazgos como referencias, no repuestos automáticos |
| `PROPOSAL_CONFIRMED` | Diagnóstico y partidas explícitas, válidas, revisadas por mecánico | Habilita crear/continuar cotización sin duplicar datos |
| `QUOTE_REVIEWED` | Cotización vigente validada y revisada | Estado «Pendiente de respuesta del cliente · DEMO» |
| `CLIENT_ACCEPTED_DEMO` | Coincidencia exacta `quoteId + revision`; operador confirma simulación, no recepción real | Estado «Aceptación simulada de esta revisión»; habilita trabajo guiado |
| `CLIENT_REJECTED_DEMO` | Cotización vigente de esa revisión | Detener ejecución guiada; ofrecer «Revisar propuesta» |
| `CLIENT_REQUESTED_CHANGES_DEMO` | Cotización vigente de esa revisión | Volver a propuesta/cotización; no reutilizar autorización anterior |
| `QUOTE_CHANGED` | Cualquier modificación de datos que incremente `revision` | Invalidar respuesta, aprobación y habilitación anterior; exigir nueva revisión/respuesta |
| `PREPARE_WORK` | Aceptación DEMO vigente de la cotización actual | Precargar documento `work` con ítems confirmados, todos `performed:false`, sin diagnósticos inventados |
| `MARK_PERFORMED` | Acción explícita del operador en BT-COT-01 modo `work` | Solo ítems marcados se suman e imprimen |
| `WORK_REPORT_FINALIZED` | Validaciones de BT-COT-01, con al menos un `performed:true` | Informe DEMO finalizado; NO implica entrega/cierre |
| `DELIVERY` | Fuera de alcance D | Bloqueado hasta BT-FLOW-01E |

**Corrección importante:** no confundir `approveWorkDemo()` (aprobación local/simulada del documento existente) con una respuesta auténtica del cliente. Si se reutiliza su mecanismo, mantener trazabilidad de quién activó la simulación, y no atribuir una aceptación real al cliente.

## 3. UX prevista (sin sexto panel)

- En el expediente, hito **Diagnóstico, trabajos y repuestos**: mostrar motivo original, estado de inspección, campos/referencia del diagnóstico técnico y CTA «Definir trabajos». Abrir la OT/editora existente; nunca completar el hito solo por verla.
- Hito **Cotización y respuesta**: mostrar ID/revisión vigente, neto + IVA 19 % + total calculados desde BT-COT-01, estado de revisión y decisión DEMO (Sin respuesta / Aceptada DEMO / Rechazada DEMO / Solicita cambios DEMO), fecha y nota. CTA contextual «Preparar cotización», «Revisar cotización» o «Registrar respuesta DEMO». La simulación exige confirmación humana y tiene avisos evidentes.
- Hito **Trabajo e informe**: bloquear habilitación guiada si no existe aceptación de la revisión vigente. Si está habilitada, CTA «Preparar trabajo desde cotización» con previsualización y confirmación; todos los ítems empiezan **No realizado**. Permitir abrir y revisar informe, sin marcar automáticamente nada.
- Mantener acceso libre a menús y editor clásico; los bloqueos protegen **el asistente guiado**, no rompen las rutas manuales existentes ni alteran una OT histórica.
- Si edición de cotización invalida aceptación, mostrar aviso específico «La cotización cambió y necesita nueva respuesta», no borrar la revisión histórica de manera silenciosa.
- Si el cliente rechaza, permitir revisar propuesta, no dar impresión de que se puede pasar a servicio autorizado.
- Estados mostrados con texto, íconos y accesibilidad; R2 escritorio y Safari iPhone; nada de acciones que aparenten envío real.

## 4. Modelo técnico recomendado (conceptual)

```ts
type ClientDecision = 'aceptada_demo'|'rechazada_demo'|'cambios_demo'
type QuoteResponse = {
  visitId: string; workshopId: 'workshop-demo';
  quoteId: string; revision: number;
  decision: ClientDecision;
  date: string; note?: string;
  simulated: true;
}
```

Persistir únicamente en memoria mediante un módulo de dominio cohesivo junto a `flowSession` o un adaptador; almacenar solo metadatos de respuesta, nunca clonar ítems. La vigencia se computa comparando la respuesta con `readWorkDocument(quoteId)?.revision` y el estado de revisión del documento. Garantizar idempotencia, vinculaciones válidas, ausencia de sobrescrituras cruzadas y anulación automática de acceso guiado ante diferencias.

**No duplicar motores:** reutilizar `workTotals`, `validateWorkDocument`, `editWorkDocument`, `reviewWorkDocument`, `approveWorkDemo` y sus reglas de modificación; si necesitas exponer nuevos eventos/hooks, hacerlo mínimamente y con regresiones.

## 5. Orden incremental sugerido para Codex

1. Auditar HEAD / `AGENTS.md` / `roadmap.md` / checkpoints B/C/COT/INS, confirmar que no hay agentes concurrentes; coordinar la pequeña mejora móvil ya integrada.
2. Añadir modelo puro de respuesta por revisión, reglas de transiciones y pruebas (sin tocar UI).
3. Vincular propuesta, cotización existente y respuesta en `FlowCasePanel`/adaptadores; no sobrescribir documentos premium.
4. Precarga **confirmada** de informe de trabajo desde cotización vigente con `performed:false`; impedir duplicaciones, escrituras silenciosas y ejecución sin revisión.
5. Actualizar estado del expediente y acciones; regresión completa con ruta clásica.
6. Verificar TypeScript, Vitest, Vite/PWA, E2E en 1650/1440/768/390/375, capturas reales, mensajes DEMO; confirmar cero escrituras de red/almacenamiento.
7. Commit(s) pequeños en `main`, mismo Render, checkpoint `BT-FLOW-01D`, roadmap y pendientes 01E. No confundir CI, publicación y aprobación visual.

## 6. Casos negativos obligatorios

- Cotización aprobada DEMO, luego cambia precio: ya **NO** queda autorización vigente.
- Cotización rechazada: no se habilita ejecutar por el asistente.
- Solicitar cambios: vuelve a cotización, conserva historial de respuesta por revisión, no borra trabajos anteriores.
- Cambio de OT o visita: respuesta de una no habilita otra, incluso si pertenecen al mismo cliente/vehículo.
- No existen repuestos valorizados: no se fabrica cotización válida.
- Doble pulsación «Preparar trabajo»: reutiliza el mismo documento; no duplica ítems.
- Iniciar informe de trabajo: `performed:false` para todas las partidas.
- Imprimir informe: solo realizados y totales correctos; no reporta entrega o cierre.
- No existen datos de red, firma, correo enviado, consentimiento contractual o persistencia fuera de RAM.

## 7. Restricciones y puerta de cierre

**Prohibido:** BT-CP02-D, pruebas A/B, Supabase, Auth/RLS, Edge onboarding, claves, pagos, suscripciones, envío real, firma electrónica, sistema de facturas, modificación profunda de BT-INS-01 o BT-COT-01, APK Android, nuevos Render/ramas. Solo `main`.

**BT-FLOW-01D termina** cuando recepción → OT → multipunto → propuesta explícita → cotización → respuesta por revisión → informe de trabajo se puede seguir sin volver a ingresar identidad, sin autorización falsa ni ejecución inferida. **No cerrar visita**: BT-FLOW-01E quedará pendiente para excepciones, entrega y QA final. Requiere revisión visual del Director.
