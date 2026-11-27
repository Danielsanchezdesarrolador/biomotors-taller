# BT-BASIC-MULTIPUNTO-DEMO-01 — PLANNED / ACCEPTANCE-07C OPEN

27/11/2026 UTC. Titular solicita que Básico muestre una pequeña demostración de inspección multipunto e invite a consultar los planes, sin habilitar el uso real.

## Hallazgo de aceptación a resolver primero

Titular informa descarga de borrador TEST12 bajo Básico y bloqueo al intentar editar multipunto. PDF aportado INS-TEST12-43bc26c2-borrador (3).pdf: 268853 bytes, SHA-256 18df411caaf860aba1f8b1902c090f10928466ff1be9e573081ccf3db7f41e5a. Consulta read-only de consumo confirma coincidencia exacta con multipunto Plus confirmado 27/11 14:16:07 UTC, no Full. Permanecen cuatro consumos confirmados (1 quote + 1 multipunto Full, 1 quote + 1 multipunto Plus); ninguno Básico ni nuevas reservas. No se capturó respuesta HTTP de la descarga reportada, por tanto no se certifica que la entrega fuera local ni que el servidor denegara esa solicitud. Cp04MultipuntoPdfPreview.tsx mantiene bytes en cached.current y Blob URL, con invalidación por order/findings/workshopName/disabled/blocked; Cp04OrdersView.tsx pasa disabled cuando context.inspectionEnabled===false. Posible estado desactualizado/caché local; no atribuir causa sin prueba. Los bytes legítimamente descargados antes no pueden revocarse de disco.

Mantener ACCEPTANCE-07C abierto: cerrar sesión, iniciar sesión nueva o ventana privada, comprobar plan Básico, intentar desde interfaz abrir/descargar borrador y editar; comparar contador y traza de red si hay entrega. Revisar refresh de autorización efectiva, invalidación de vistas/bytes/operaciones al cambiar plan/sesión, revalidación servidor antes de nuevas entregas y carreras si se reproduce. No relajar controles; si nueva entrega no autorizada, resolver antes de cierre comercial. No eliminar documentos históricos. No cambios productivos autorizados.

## Demostración futura

- Mostrar sección multipunto para Básico con muestra claramente identificada de datos ficticios, pocos componentes/estados y beneficio de 34 componentes, observaciones, informe PDF profesional. CTA “Conocer nuestros planes” / “Ver planes y beneficios” hacia comparativa; sin checkout.
- Demo separada de datos reales y de permisos/consumos. No editar ni guardar inspecciones reales, generar/descargar PDF real, archivar, enviar ni acceder a recursos ajenos. No reutilizar documento real ni caché premium como demostración. Conservar datos históricos autorizados según contrato vigente.
- Plus/Full mantienen experiencia real, límites y emisión futura autorizada. Validar Básico y transición de planes en PC/Android/PWA, navegación CTA, ausencia de cambios en BD/consumo, permisos y aislamiento.
- Coordinar con BT-COMMERCIAL-LIMIT-UX-01 y BT-MULTIPUNTO-FINAL-01 tras cierre de aceptación; antes de Ignacio. Prioridad previa: resolver hallazgo de descarga, no declararlo solucionado por la demo.

Solo documentación, Auto-Deploy OFF verificado; sin código, SQL, Edge, flags, Render ni Codex.

## Aclaración aprobada — bloqueo explicativo y retest (27/11/2026)

Titular confirma que al repetir prueba con sesión nueva aparece bloqueado multipunto en Básico, pero solo con candado. Retest visual PASS; no se confirma causa de primera descarga ni revocación en sesión abierta, mantener verificación pendiente antes de cierre. El candado nunca será única indicación: título y texto visible explican por qué está bloqueado, beneficio y CTA hacia planes cuando corresponda. Para función no incluida: “Tu plan actual no incluye la inspección multipunto. Con Plus o Full podrás evaluar 34 componentes, registrar observaciones y generar informes para tus clientes.” Para cuota agotada: “Alcanzaste el límite de tu plan” con recurso y próxima disponibilidad si verificable. Para demo: “Estás viendo una demostración. Para utilizar esta herramienta necesitas Plus o Full.” CTA “Ver planes y beneficios”, sin cobro. Distinguir permiso, servicio desactivado, sesión y red; accesibilidad y estado textual incluso con control deshabilitado. Validar PC/PWA/Android. Sin modificar seguridad, datos o cuotas. Implementación pendiente.
