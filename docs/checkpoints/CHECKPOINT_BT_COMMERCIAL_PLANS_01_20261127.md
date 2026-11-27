# BT-COMMERCIAL-PLANS-01 — Bloque B

27/11/2026, Chile. Estado: CANDIDATE_READY_FOR_INDEPENDENT_REVIEW. No integración oficial ni activación productiva.

Base oficial consultada directamente por git ls-remote y clonada: e7146903d8456f2b7601290fc7528f3eebf554cb. Rama main únicamente. La copia anterior /workspace/biomotors-taller y candidato 1a58bcfa se conservaron; ff-only detectó divergencia y abortó sin modificación. Trabajo de B en copia separada /workspace/biomotors-commercial-plans/main. SHA completo, árbol, inventario y huellas en CANDIDATO.json de la entrega privada. El SHA de transferencia identifica el commit que contiene esa carpeta, distinto del candidato local.

## Entrega implementada

B01: única autoridad SQL seats 0/2/4, conserva extras/vigencia. Invitación, reservas, aceptación y reactivación reutilizan funciones/locks existentes. Sin eliminación/desactivación automática ni nuevas atribuciones premium; exceso visible y regularización voluntaria. Migración incremental con pre/postflight exacto de huella, dependencias, security-definer/search_path, privacidad y owner/ACL, cantidades de miembros/invitaciones; reversión guardada y probada. SQL históricos inalterados.

B02/B05: contrato compartido para presentación y preparación de precios; Plus 2 y Full 4, referencia USD 5/15 y extras USD 2, compra OFF. Tres tarjetas siempre visibles, plan actual por respuesta servidor, Básico neutro, Plus azul y Full corona dorada R2. Se elimina texto ilimitado impropio. Panel Creador usa PlanBadge existente sin cupos hardcodeados; Mi taller/equipo leen capacity de servidor. Fixtures/assertions con límites antiguos se actualizan, sin declarar reejecución de sus suites históricas.

B03: mensajes por capacidad, cuota, plazas, sesión, permisos, conexión/servidor y orden read-only. Error técnico/seguridad desconocido no se promueve como upgrade. Clasificación exacta de error SQL y código HTTP saneado en CP05, final archive y commercial documents. Se conserva 409 de Hardening y renovación explícita; nunca fallback de bytes ni nueva identidad automática. Mensajes de cliente/quota/multipunto/archivo y CTAs informativos reutilizan comparación compartida. Guardas y contratos siguen en servidor.

B04: promoción y demostración multipunto estáticas con datos ficticios, sin repositorio, datos de clientes, PDF, escritura o consumo. Navegación a información Plan y beneficios y regreso sin desmontar formularios. Presencia en Mi taller y órdenes/recorrido donde corresponde. No se rediseña grilla real ni se adelanta bloque C.

[Contrato y procedimiento completo, fuentes consultadas, diagnóstico, instalación, reversión y riesgos](../BT_COMMERCIAL_PLANS_01.md).

## Validación efectiva

- **18 comprobaciones SQL nuevas PASS**: 17 casos principales y uno adicional filtrado de aislamiento entre dos talleres creados mediante SQL real con Full válido. PostgreSQL17, esquema completo de fixtures existentes, contenedor propio network none, sin puertos ni servicios externos. 0/2/4, propietario excluido, pending/aceptación/rotación/reactivación, exceso sin pérdida, desactivación voluntaria, vigencia/extras, cliente sin autoridad sobre suscripción, dos transacciones concurrentes por última plaza (exactamente una logra reserva), downgrade/capacidades y rollback/reaplicación. Las definiciones comerciales/autorizadoras reales se reutilizan; no respuestas ideales sustituyendo SQL.
- **58 casos unitarios/HTTP distintos PASS**: selección inicial de cuatro archivos dio 50 PASS y una aserción de cupos heredada fallida; ese único caso corregido volvió a ejecutarse con filtro y PASS. Tres casos client/RPC, uno adicional del cliente inválido y tres casos HTTP de serialización completan 58. Los tres HTTP cubren cuatro variantes cada uno: plan, cuota, sesión y renovación 409. No se suman fallos iniciales ni skips como PASS. No suites completas 122/51/25 ni las 34 de Hardening.
- **8 escenarios Chromium PASS**: seis combinaciones planes Básico/Plus/Full × 1440/390, más equipo Plus móvil y Básico excedido escritorio ejecutados con filtro aparte. Comparación permanente, precios/cupos, plan actual, Full→Plus→Full por refresco de foco normal sin reload, demo ficticia con regreso/planes, cero escrituras comerciales involuntarias, controles disabled con cupo y alerta de exceso; sin overflow, errores JS ni endpoints inesperados. Ocho capturas generales y dos de demo. HTTP sintético estricto, no datos reales ni E2E alojado.
- TypeScript final `tsc --noEmit` PASS. Build privado final y verificador de grafo PASS; build público y verificador de grafo/fixtures/PWA PASS. Allowlist añade solo los dos archivos puros de contrato y mensajes, no directorios ni clientes privados. Sintaxis CJS/Bash/Python y diff --check PASS. Paquetes offline de tres handlers PASS: 43/43 hashes más manifest y source hashes; no instalados/desplegados.
- **WebKit BLOCKED_ENVIRONMENT**: executablePath verificado ausente en instalación disponible. Sin intento de descarga, alternativas ni cambio de red. Se mantiene soporte del ejecutor para WebKit; pendiente CI oficial. No PASS WebKit ni prueba Safari/iPhone físico/Android nativo.

Comandos reproducibles: scripts/security/verify-commercial-plans-local.sh (principal); BT_COMMERCIAL_PLANS_FOCUS=isolation con otro BT_PLAN04BC_EVIDENCE_DIR (solo caso añadido); scripts/verify-commercial-plans-ui.py con NODE_PATH de Playwright ya instalado; filtro BT_COMMERCIAL_CASES para casos extra; vitest sobre commercialPlans, mechanicInvitationPolicy, billing y access, filtro único de access y archivos client/commercialPlansHttp; typecheck, vite build y verificadores existentes. Los logs de entrega indican exactamente las ejecuciones, no una instrucción para repetir suites históricas.

## Errores registrados y corregidos

Expectativa de miembros del fixture SQL 5→4; violación correcta de CHECK lifetime+expires_at corregida en fixture; aserción visual histórica 0/8→0/2/4; dos módulos puros omitidos en allowlist; TypeScript detectó variable kind de download extendida por error a archive, corregida conservando contrato de archive. Se consultó Development Toolkit (DTK-ERR-018/029 para fixtures/selectores, 056 para transferencia) antes de cerrar soluciones; detalles y causas en informe. Fallos iniciales se conservan como diagnóstico, no se ocultan ni se declaran pruebas exitosas. La ronda SQL final repite preparación por los fallos del nuevo fixture, no auditorías históricas; el aislamiento adicional usa filtro sin repetir 17 PASS.

## Límites y riesgos residuales

SQL local no certifica JWT criptográfico ni infraestructura/RLS alojada exhaustiva. Chromium interceptado no equivale a validación productiva ni navegador físico. Suites históricas no repetidas mantienen sus resultados anteriores, no se atribuyen al nuevo candidato. Actualización visual usa polling/foco existente: depende de conectividad; operaciones nuevas siguen revalidando en servidor. Una reserva en tránsito del contrato anterior exige ventana coordinada al instalar; si preflight detecta drift o cambios concurrentes abortar, sin relajar guardas. Equipos excedidos conservan miembros y reservas, pero bloquean altas hasta regularización. El Básico mantiene el máximo de un taller existente, sin modificar la elegibilidad de creación/vinculación aprobada. Las tarjetas no conceden acceso ni licencias.

## Restricciones y continuidad

No se ejecutaron SQL/migraciones alojadas, cambios en Supabase/Render/Edge/Storage/Auth, GATE4, licencias/cuentas/talleres/clientes reales, correo/pagos/logo/autorregistro, respaldos, SEC07, Auto-Deploy ni push oficial. Estado alojado citado en checkpoints previos es continuidad documental, no una nueva consulta productiva. No bloque C, ZIP, watermark, visor/zoom ni Android nativo. B no autoriza activación.

DTK-ERR-056: exclusivamente bytetorque-review/main/BT-COMMERCIAL-PLANS-01, archivo por archivo, diff binario incremental, snapshots, hashes, SQL candidato/reversión, documentación, logs sanitizados, capturas y paquetes offline. Verificar árbol reconstruido desde base, manifiesto y bytes remotos, privacidad/escritura efectiva, raíces previas intactas. Próximo paso: revisión independiente, CI/WebKit y autorizaciones específicas de integración/instalación/despliegue posteriores. No iniciar C ni producción.

## Revisión independiente y DELTA-01 — 27/11/2026

La revisión posterior determina PASS parcial y detecta que la clasificación comercial de errores de quote histórica podía ocultar404/409/503 y evitar limpieza de autoridad por el tipo CommercialFailure. La afirmación previa de Hardening preservado se limita a las pruebas entonces ejecutadas; no equivale a cobertura de estas rutas. El [checkpoint DELTA-01](CHECKPOINT_BT_COMMERCIAL_PLANS_01_DELTA_01_20261127.md) registra corrección y pruebas nuevas reales, más workflow CI focalizado pendiente de ejecución oficial. Las84 comprobaciones anteriores permanecen históricas, sin repetirse ni convertirse en una aceptación integral.
