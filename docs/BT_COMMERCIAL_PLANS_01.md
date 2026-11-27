# BT-COMMERCIAL-PLANS-01 — Contrato comercial y entrega candidata

27/11/2026, Chile. Base oficial verificada e7146903d8456f2b7601290fc7528f3eebf554cb. **Candidato para revisión independiente; no aplicado en producción.** Este contrato sustituye las referencias de presentación y candidatos 4/8 cuando se autorice su integración y migración. Los checkpoints históricos conservan sus resultados y el contrato que estaba instalado entonces.

| Característica | Básico | Plus | Full |
| --- | --- | --- | --- |
| USD/mes | Gratis | 5 | 15 |
| Mecánicos incluidos | 0 | 2 | 4 |
| Clientes, archivados incluidos | 5 | Sin límite comercial | Sin límite comercial |
| Taller propio por cuenta | 1 | 1 | 1 |
| Cotizaciones | 1/48 horas móviles | 10/semana | Sin límite comercial |
| Inspección multipunto | Bloqueada | Habilitada | Habilitada |
| Descargas multipunto | 0 | 10/semana | Sin límite comercial |
| Correos comerciales | 0 | 10/semana | Sin límite comercial |

Propietario y administrador fuera del contador de mecánicos; invitaciones pendientes vigentes reservan plazas. Extras existentes confirmados por servidor conservan su vigencia y condiciones; referencia USD 2/mes por plaza, sin contratación habilitada. Auth no consume correo comercial. Semana comercial: lunes 00:00 America/Santiago. Full conserva antiabuso y no promete capacidad técnica infinita. La elegibilidad de creación y vinculación se conserva en servidor; las tarjetas no conceden talleres ni licencias. Una cuenta Básico con taller existente no obtiene otro taller por ver esta tabla.

## Autoridades y cambios

La autoridad incluida está en bt_platform_private.seats(uuid), consultada por team, manage_mechanic (invite/rotate/reactivate), accept_mechanic y consumidores de capacidad. Los tres caminos mutables existentes usan el mismo advisory lock por taller. El único cambio SQL reemplaza esa función STABLE SECURITY DEFINER: 0/4/8→0/2/4, extras/vigencia intactos. No nuevos grants, triggers, tablas ni cambios en autorización operativa/documental, GATE4 o migraciones históricas.

Presentación/precio compartidos en src/plans/commercialContract.ts, sin autoridad de seguridad. Se reutilizan PlanBadge, componentes de taller, consulta de plan, refresco por polling/foco y metadata. Plan y beneficios muestra las tres tarjetas siempre, plan actual destacado y disponibilidad explícita sin checkout. Mi equipo conserva datos y explica exceso/cupos reservados; permite desactivar voluntariamente o revocar invitaciones. No elimina ni desactiva por downgrade; no añade privilegios a una membresía retenida.

Los errores conocidos de plan, cuota, cupo, sesión y solo lectura tienen mensajes distintos. Un error desconocido de seguridad o técnico no se transforma en promoción. Metered reconoce errores SQL precisos; los tres handlers serializan códigos seguros. Se conserva HTTP409 DOCUMENT_OPERATION_NOT_CURRENT y la confirmación de nueva operación. No se rotan UUID por reloj ni se añaden bytes de fallback.

La demostración Básico recibe cero datos de negocio y ningún puerto/repositorio. Estado ilustrativo fijo y ficticio, solo lectura, sin PDF, guardado ni cuota; permite ver planes y volver a la sección previa. Visible en Mi taller y recorrido/órdenes donde aplica. No cambia el PDF ni la grilla real. Web adaptable, no Android nativo ni bloque C.

## Instalación y recuperación — solo procedimiento propuesto

Ningún paso alojado se ejecutó. Revisión independiente y autorización específica del titular obligatorias antes de integrar, instalar SQL o desplegar. No activar flags/servicios ni tocar GATE4 para este trabajo.

1. Verificar base/candidato/árbol, manifiesto y diff. Confirmar estado real y compatibilidad de las funciones existentes. Revisar exceso de plazas en team con acceso autorizado; no exportar listas personales ni desactivar automáticamente.
2. Preparar una ventana coordinada sin nuevas modificaciones de equipo en tránsito. No ejecutar respaldos históricos de nuevo. Utilizar el mecanismo vigente de recuperación, sin datos privados en GitHub. Los contadores pre/postflight pueden abortar ante cambios concurrentes legítimos: no relajar la guarda ni reintentar ciegamente.
3. Tras autorización, aplicar docs/sql/BT_COMMERCIAL_PLANS_01_CANDIDATE.sql como propietario de las funciones. Su transacción valida dependencias, huella exacta del cuerpo previo, SECURITY DEFINER/STABLE/search_path, privacidad de EXECUTE y conserva owner/ACL y cantidades de miembros/invitaciones. Si hay drift/instalación parcial, aborta. No encadenar la migración histórica 04C ni reemplazar producción por los fixtures.
4. Comprobar mediante team/status autorizados: 0/2/4 más extras válidos, pending y exceso, vigencia, rechazo de nuevas reservas/aceptaciones/reactivaciones sin plaza. No conceder licencias reales para probar. Confirmar históricos y miembros intactos. La transacción solo cambia un cuerpo de función, no datos.
5. Integración/build frontend y paquetes de los tres handlers deben coordinarse después de la revisión. Los paquetes offline incluyen códigos sanitizados para mensajes; clientes anteriores continuarán bloqueando por status genérico. No cambian las decisiones de cuota, caché ni bytes. Reutilizar el procedimiento documental aprobado para cualquier freeze/drenaje/ready futuro: este bloque NO ejecuta ese procedimiento ni autoriza GATE4, deploy o activación.
6. Recuperación SQL autorizada: BT_COMMERCIAL_PLANS_01_ROLLBACK.sql valida exactamente el cuerpo nuevo y restaura solo 0/4/8, conservando owner/ACL y datos. No restaura ni altera planes, sesiones, licencias, documentos o miembros. Una reversión aislada deja UI 0/2/4 frente a autoridad 0/4/8: revertir también la presentación/código del delta de forma coordinada si se decide volver al contrato anterior. Conservar recibos y UUID; no borrar consumos ni regenerar PDFs.

La candidata y su recuperación se comprobaron en PostgreSQL17 aislado, incluida reversión y reaplicación. No son una migración productiva ejecutada ni una autorización de despliegue.

## Riesgos y límites

WebKit no instalado: BLOCKED_ENVIRONMENT; CI oficial pendiente, sin descarga ni cambios de red. Chromium 1440/390 es simulación de viewport, no certificación de Safari físico/PWA instalada ni Android nativo. SQL usa fixtures completos existentes y Auth/JWT sintéticos; no prueba firmas ni infraestructura alojada. Frontend intercepta todo tráfico externo con respuestas sintéticas estrictas; ninguna cuenta real se usa.

Equipos/invitaciones sobre el nuevo límite se conservan y pueden quedar bloqueados hasta regularización voluntaria. Aceptación y rotación antiguas vuelven a verificar capacidad. El polling/foco existente refleja cambios remotos sin recarga; una sesión desconectada no conoce inmediatamente cambios remotos, pero nuevas escrituras/documentos siempre consultan servidor. Copias legítimas ya descargadas no se revocan.

## Fuentes y errores de validación

AGENTS.md, agent.md, roadmap.md; checkpoints LIVE_01_QA y LIVE_01_GATE_OPEN del 27/11; PLAN04BC-PILOTO-01; SQL 04B/04C, PILOT_FIX, WORKSHOP_COMMERCIAL y Hardening vigentes de la base. Development Toolkit main a1bf07b3b5255764480bdf283a5ba5804f5c9018: AGENTS.md, INDEX.md, guía entrega-controlada, DTK-ERR-056, DTK-ERR-018 y DTK-ERR-029. No se modifica ese repositorio ni se duplica una ficha por un fixture obsoleto.

Errores observados y corregidos: el checkout anterior divergía del oficial (dos commits locales y trece oficiales): ff-only abortó sin cambios; se conservó intacto y se clonó main aparte. Aserción heredada aún esperaba 0/8 tras actualizar cupos: se alineó a 0/2 y 0/4 y se repitió solo ese caso. Fixture SQL esperaba cinco miembros, pero creó cuatro: se corrigió la expectativa. Fixture intentaba licencia lifetime con expires_at anterior: el CHECK legítimo lo rechazó; se corrigió la fixture, no el CHECK. Build detectó dos módulos nuevos fuera de allowlist: se admitieron exactamente los dos módulos puros de contrato/mensajes; no una carpeta ni clientes privados. TypeScript detectó referencia kind fuera de la acción download en un reemplazo de errores: se retiró de archive, manteniendo su contrato. Logs iniciales se conservan identificados; no son PASS ni se suman como casos adicionales.
