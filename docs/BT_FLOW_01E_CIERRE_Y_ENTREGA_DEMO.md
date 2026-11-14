# ByteTorque — BT-FLOW-01E: excepciones y cierre guiado de visita

**Fecha:** 13/11/2026 (Chile) · **Estado:** implementado en DEMO, sujeto a validaciones finales y revisión integral del Director.  
**Código:** `src/flow/flowClosure.ts`, `FlowDeliveryPanel.tsx`; integrados en `flowSession.ts`, `FlowCasePanel.tsx`, `FlowHome.tsx` y `flow.css`.  
**Alcance:** memoria temporal de una pestaña; sin Supabase, correo, firma, pagos, facturas, entrega física ni identidad verificada.

## 1. Recorrido resultante

Inicio → cliente/vehículo → recepción → OT → inspección multipunto → propuesta profesional → cotización → respuesta simulada a una revisión concreta → informe con ítems realizados → **Revisión de entrega → cierre DEMO**.

Conservar siempre los cinco paneles R2, la vinculación `visitId/orderId/quoteId/workReportId` y los límites de los módulos BT-REG-02, BT-INS-01 y BT-COT-01. Nada se considera realizado, aprobado, enviado o entregado por visitar una pantalla.

## 2. Excepciones y pausas

Desde el expediente se puede registrar una pausa DEMO con descripción explícita y causa:
- Esperando repuestos.
- Cliente no autoriza.
- Trabajo adicional por revisar.
- Revisión técnica pendiente.
- Vehículo en espera.
- Otra causa.

Registrar la pausa requiere confirmación humana. Resolverla requiere nota de resolución y una segunda confirmación; se conserva el historial de pausas en memoria. Cualquier pausa activa bloquea el cierre, pero no impide consultar los documentos. Los casos de rechazo o cambio de cotización ya se controlan por BT-FLOW-01D: no hay aceptación vigente y el cierre está bloqueado. **La causa de pausa no crea por sí misma nuevas partidas, diagnósticos o autorizaciones**.

Se puede cancelar una visita ficticia con motivo y confirmación explícita. La cancelación no borra inspecciones, cotizaciones ni informes anteriores; impide entregar la visita y no equivale a anular registros fiscales/legales. Una visita cancelada o cerrada no debe editarse indirectamente a través del asistente como si estuviera activa. Para una devolución real o nueva reparación se debe iniciar **otra visita vinculada al mismo vehículo**, con historial independiente. La modificación de un registro histórico tras el cierre vuelve **desactualizada** su constancia DEMO en vez de afirmar que sigue vigente.

## 3. Requisitos de cierre

Para habilitar «Revisar y confirmar entrega DEMO» deben existir:

1. OT confirmada y vinculada a cliente/vehículo/visita.
2. Inspección multipunto de la OT **finalizada**.
3. Propuesta profesional confirmada con diagnóstico, ítems y precios definidos por operador.
4. Cotización de la misma visita revisada, con respuesta DEMO **aceptada y vigente para `quoteId + revision`**.
5. Informe de trabajo precargado desde esa aceptación, **Finalizado DEMO** por el operador, con aprobación de revisión válida y al menos un ítem `performed:true`.
6. Cero pausas activas y visita no cancelada.
7. Cuatro verificaciones manuales: vehículo, trabajos ejecutados, documentos y pendientes.
8. Observación final (8–500 caracteres) y, si hay trabajos no realizados o recomendaciones técnicas, una explicación de pendientes (8–500 caracteres).
9. Confirmación final expresa adicional en diálogo.

El sistema muestra por qué está bloqueada una entrega y facilita consultar inspección, cotización e informe. No oculta trabajos no realizados; los excluye del importe del informe y los enumera como pendientes en la revisión final.

## 4. Datos y trazabilidad

El cierre DEMO conserva solo **metadatos de referencia**: taller DEMO, IDs de visita, cliente, vehículo, OT, inspección, cotización y revisión, respuesta vigente, informe y revisión, conteo de ítems realizados/pendientes, total calculado por BT-COT-01, fecha, checklist, pendientes, nota del operador y marca `simulated:true`.

No duplica todos los ítems de los documentos ni crea una tabla de usuarios. Es **idempotente**: si el mismo expediente se confirma dos veces sin cambios, devuelve el mismo registro. Si se altera la cotización, respuesta, informe u otro requisito después del cierre, se muestra «Cierre requiere revisión», preservando la evidencia histórica temporal pero sin avalar la entrega. Se prohíbe borrar silenciosamente un cierre anterior o crear un cierre nuevo incompatible.

La cancelación y las pausas también permanecen únicamente en estado de módulo JavaScript de la pestaña: **recargar o cerrar descarta el registro de demostración**. No `localStorage`, `sessionStorage`, IndexedDB ni tablas Supabase.

## 5. UX y seguridad

- Diseño visual R2, sin sexto panel.
- Inicio distingue «En espera», «Cancelada DEMO» y «Entregada DEMO»; los expedientes cerrados quedan consultables como ejemplos mientras la pestaña esté abierta.
- En el expediente se ven estados, historial de excepciones y una revisión de entrega con checklist. Móvil Safari PWA: disposición en tarjetas, campos de 16 px, botones de 44–50 px, `safe-area` del menú inferior heredada.
- No enviar mensajes reales, firmar documentos, contactar al cliente, generar comprobantes tributarios o cobrar.
- Los datos DEMO nunca constituyen evidencia de la entrega física ni consentimiento legal.
- BT-CP02-D, A/B, Auth/RLS, onboarding, pagos, infraestructura y Android nativo fuera de alcance.

## 6. QA y criterios de aceptación

- Unitarias: cierre requiere autorización y trabajo final; trabajo pendiente exige explicación; validación de checklist, observación y doble confirmación; pausas/repuestos/resolución; cancelación; rechazos; cambio posterior a cotización e informes; referencias cruzadas por visita; no duplicación.
- E2E Chromium: flujo de ingreso/OT/inspección/propuesta/respuesta/informe/entrega, pausa-resolución, caducidad al editar después de cerrar, cancelación de otra OT; regresiones BT-FLOW-01B/C, BT-FLOW-01D, BT-INS-01, BT-COT-01 y BT-REG-02. Tamaños 1650/1440/768/390/375 px.
- Compilación TypeScript/Vite, PWA, 0 escrituras reales de red, 0 almacenamiento web, navegación por cinco menús y pruebas Android Expo existentes sin alterar el proyecto nativo.
- Capturas Chromium de entrega a 1650 y 390 px; comprobar visualmente que controles y menú inferior no se superponen. **Safari físico continúa pendiente**, distinto de Chromium.
- Entrega final: commits solo en `main`, checkpoint `BT-FLOW-01E`, roadmap y resultado comprobable de Actions/Render. En todo momento distinguir código implementado, CI aprobado, publicación efectiva y revisión del Director.

## 7. Fuera de alcance / fase posterior

El registro durable de visitas, el control de quién autorizó, estados transaccionales y auditados, notificaciones reales, entrega física, servicios multitenant, RLS A/B, invitaciones seguras, firma y pagos pertenecen a un proyecto de backend con aprobación propia. **BT-FLOW-01E no activa ni autoriza ese backend**.

La revisión integral del Director del flujo A–E se realizará después de terminar E, conforme a su instrucción expresa. Antes de cualquier uso por el taller real deben verificarse en dispositivo, seguridad, privacidad y datos.
