# BT-COMMERCIAL-PLANS-01 — DELTA-01

27/11/2026, Chile. CANDIDATE_FOR_INDEPENDENT_REVIEW_CI_PENDING.
Base exclusiva: candidato f55b8f890c6648cad355d89d89a9fac0f5b5ac80, transferencia previa 5bed2b6102c09d1d8ed05e96d569a5aa03ede2d9; base oficial original e7146903d8456f2b7601290fc7528f3eebf554cb. La revisión de B es PASS parcial, no aceptación definitiva. Este delta atiende exclusivamente las dos observaciones.

## Diagnóstico confirmado

A: repository.bytes para quote tomaba cualquier error HTTP y llamaba documentFailure antes de clasificar HTTP404,409,503. El decoder comercial genérico podía interpretar códigos del cuerpo fuera de su contexto HTTP. El panel failed solo limpiaba datos ante ArchiveFailure denied; CommercialFailure session/permission no entraba allí. Por ello podía perder mensajes específicos y conservar selección/visor tras una denegación. No se modifica servidor, SQL, decisiones de cuota o licencias para resolver una regresión de cliente.

B: faltaba un workflow propio del contrato B 0/2/4, UI y rutas de error históricas. Los laboratorios/workflows anteriores son evidencia de contratos anteriores o pruebas parciales; no sustituían automáticamente esta cobertura. Los workflows históricos y sus aserciones se conservan byte a byte.

## Semántica corregida

| Respuesta a una descarga histórica | Tratamiento |
| --- | --- |
| 404 | ArchiveFailure missing, original no disponible; no regeneración. |
| 409 distinto de operación no vigente | ArchiveFailure integrity, documento rechazado; no promoción. |
| 503 | ArchiveFailure disabled, servicio deshabilitado; no promoción. |
| 401, incluso con cuerpo comercial contradictorio | Sesión inválida y limpieza defensiva. |
| 403 de permisos/sesión/desconocido | Denegación y limpieza defensiva. |
| 403 PLAN_CAPABILITY_REQUIRED en quote | Capacidad no incluida; mensaje comercial, sin bytes ni nueva autorización. |
| 429 COMMERCIAL_QUOTA_EXHAUSTED en quote | Cuota agotada; mensaje comercial, sin bytes ni nueva autorización. |
| 409 DOCUMENT_OPERATION_NOT_CURRENT en quote | DocumentOperationExpired; confirmación explícita existente. Cancelar no cambia identidad; confirmar solo prepara metadata, siguiente acción debe revalidar. |
| Otros fallos, incluso 500 con cuerpo de cuota | Error de consulta/servidor, sin promoción comercial. |

El código y el status deben concordar antes de promocionar un error como comercial. Un cuerpo DOCUMENT_OPERATION_NOT_CURRENT con otro status nunca habilita renovación. Report/handover mantienen clasificación histórica y no reciben promoción de quote. documentFailure compartido conserva tipos públicos y usa precedencia HTTP; afecta solamente la presentación de denegaciones, no su autorización.

## Limpieza y preservación de Hardening

isArchiveAccessDenied cubre ArchiveFailure denied y CommercialFailure session/permission. Toda falla cierra el visor actual; una denegación además vacía filas, selección, documentos, expiración y avisos; descarta la solicitud de archivo pendiente, invalida la generación y revoca todos los Blob URLs que creó este panel (incluidas URLs transitorias de descarga). El estado loading se libera en esa denegación para no quedar esperando una generación ya descartada. El desmontaje revoca las URLs propias remanentes. Los errores de integridad también descartan los bytes nuevos y cierran el visor anterior, manteniendo sus mensajes específicos.

No se borra metadata de identidad comercial ni se fabrica un nuevo UUID ante errores, sesión o reloj. La autorización caducada conserva el flujo explícito de Hardening; confirmar renovación no ejecuta HTTP automáticamente. SHA-256 y lectura del original, validaciones de taller/revisión, revalidación de identidad, fences y descarte de respuestas obsoletas permanecen. No fallback local, render alternativo, recreación de PDF o escrituras nuevas. Las copias legítimamente obtenidas previamente siguen fuera de una garantía de revocación universal.

## CI candidata

.github/workflows/bt-commercial-plans-focused.yml: solo main y workflow_dispatch, contents:read, sin secretos ni deploy. Job de servidor: npm ci, TypeScript, archivos unitarios/HTTP nuevos o afectados (incluye el repositorio histórico real), SQL aislado 17+1 sobre PostgreSQL17 con red none y fixtures existentes, dos paquetes independientes y verificador de siete contratos, Deno check nativo de ready/freeze. Job de navegador: matriz Chromium/WebKit sin continue-on-error, instalación aislada de Playwright 1.65.1 únicamente en CI, ocho escenarios de planes y quince de archivo, build privado y guarda de grafo. Artefactos con JSON/logs/capturas sintéticos.

La CI NO se ejecutó en GitHub ni se publicó en .github del repositorio oficial. El workflow se entrega como snapshot dentro de la carpeta privada. Tras integración autorizada, deberá ejecutarse en el SHA integrado. WebKit local BLOCKED_ENVIRONMENT por ejecutable ausente; sin intentos de descarga, instalación alternativa o cambio de red. Native Deno local no ejecutado, pendiente job oficial; Node ESM con shim no se declara runtime Edge.

Compatibilidad revisada: comandos, flags, rutas, puertos y fixtures existentes, Node22, Docker disponible en ubuntu-latest, NODE_PATH aislado y scripts compatibles con ambos motores. No modificación de migraciones candidatas/aplicadas, RLS, GATE4 ni aserciones históricas. Los laboratorios históricos conservan sus contratos 4/8 cuando preparan SQL histórico; el job nuevo aplica el candidato B incremental y comprueba 0/2/4. No relajar un histórico para obtener verde.

## Ejecución local efectiva

- 20 pruebas nuevas PASS del repositorio histórico real: clasificación HTTP, cuerpos contradictorios, guardas, identidad estable, original y SHA-256. No se limitan a lanzar excepciones en handlers.
- 15 escenarios Chromium PASS: 14 rutas completadas en primera ejecución y un caso adicional con filtro. Panel y repositorio reales, HTTP loopback sintético, visor abierto, nuevos intentos por handler DOM real, sin bytes alternativos. 404/409/503,401/403,plan/cuota,error técnico, cuerpo engañoso, renovación cancelar/confirmar, original corrupto, guard de identidad y respuesta tardía tras denegación. Incluye viewport móvil390 en sesión/plan/renovación. Quince capturas, no suite visual completa.
- El caso de carrera inicial no llegó a provocar una denegación porque el fixture intentaba registerSave durante busy; el guard correcto retornó false y el test esperó un alert inexistente. No se cambió ese guard. Se corrigió únicamente el harness para cambiar el filtro recibido del padre, iniciar una revalidación real de catálogo en vuelo, provocar denegación real de identidad y devolver luego una respuesta HTTP válida antigua. Resultado: ningún Blob/descarga/dato reaparece. Se repitió solo este caso, no los catorce PASS.
- TypeScript final PASS, build privado/grafo PASS, sintaxis de ejecutores y YAML/semántica del workflow PASS. Dos paquetes reproducibles, 43/43 hashes idénticos entre sí y a B; verificador de siete contratos PASS. No existe cambio binario que requiera una nueva versión Edge por este delta de cliente. Se entregan manifiestos/evidencia, sin duplicar assets idénticos.
- No se repiten localmente las 18 SQL, 58 unitarias/HTTP y ocho Chromium de B (84), ni las 34 de Hardening, auditorías, respaldos o SEC07. Esos resultados permanecen históricos; no se atribuyen al delta. La nueva CI los ejecutará focalizadamente cuando se autorice integrar, con los casos nuevos.

## Instalación, recuperación y pendientes

Solo entrega privada DTK-ERR-056: revisar diff incremental sobre f55b8f8, snapshots, hashes y reconstrucción exacta del árbol candidato. Integración oficial requiere autorización separada; no ejecutar migración SQL por este delta. La migración 0/2/4 de B se conserva como candidato anterior y no se aplica ni se revierte aquí. La reversión de este delta sería revertir su commit cliente/CI, sin borrar datos, recibos ni documentos; volvería a introducir el defecto de clasificación, por lo que requiere decisión técnica, no ejecución automática.

Pendientes: revisión independiente, CI oficial de ambos motores y Deno, integración/instalación/activación autorizadas si corresponden. Limitaciones: JWT sintético y viewport Chromium no son validación alojada ni Safari físico; GitHub Actions solo validado estáticamente en este entorno. Los nuevos 15 casos usan HTTP sintético y no certifican decisiones SQL: no se modificaron esas decisiones ni se repitió su laboratorio. No declarar aceptación comercial integral.

Fuentes consultadas: AGENTS.md/agent.md/roadmap.md y checkpoint B; contratos/Panel/Repository/documentAccess vigentes en f55b8f8; workflows focused de Hardening y Workshop Commercial; Development Toolkit DTK-ERR-056 (transferencia), DTK-ERR-029 (fixture y selector) y sus reglas previamente consultadas. Se documenta la causa específica, sin duplicar fichas del Toolkit ni modificar aquel repositorio.

Sin cambios productivos, push oficial, nuevas ramas, force push, GATE4, Supabase alojado, Render/Edge desplegados, Auto-Deploy, servicios, licencias/datos reales, SEC07 o bloque C. Entregas previas intactas. Dictamen: preparado como delta para revisión independiente, CI/WebKit/Deno pendientes; no autorización de despliegue.
