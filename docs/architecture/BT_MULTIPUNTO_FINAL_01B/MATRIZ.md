# Matriz MP-01–MP-30 — ejecuciones locales

No se sustituyen resultados de ejecución por inspección estática. Los JSON/logs del paquete conservan el alcance y las limitaciones. PostgreSQL17 está aislado con network none; Auth y Storage usan identidades/transportes sintéticos. Los cinco escritores adicionales acreditan espera observada mediante pg_blocking_pids en conexiones independientes.

| ID | Resultado local y evidencia |
|---|---|
| MP-01 | PASS: Básico metadata, prepare/read bloqueados; plan cambiado y restaurado solo en lab. |
| MP-02 | PASS: Plus décima confirmación, undécima rechazada; no capacidad paralela. La conversión está cubierta con ledger real MP-04. |
| MP-03 | PASS: Full antiabuso real a 500/hora; mensaje separado de cuota. |
| MP-04 | PASS: borrador, lecturas repetidas y emisión Full: una confirmación y mismo expires_at. Chromium comprueba promoción sin nuevo consumo. |
| MP-05 | PASS: emisión directa confirma una vez; document_bytes permanece NULL para limpio. |
| MP-06 | PASS: borrador auxiliar del definitivo comparte crédito vigente y sigue marcado. |
| MP-07 | PASS: lease/consentimiento/renovación no consumida/generación; crédito confirmado no renovable. Expiración mediante fixtures temporales SQL, sin esperar cinco minutos. |
| MP-08 | PASS focalizado: week_start real en DST de Santiago y confirmed_at conservado en promoción con fixture de semana previa. No se adelantó el reloj del host; el cruce se representa con timestamps SQL explícitos. |
| MP-09 | PASS: fuentes/perfil alterados invalidan promoción/publicación; policy/asset hashes se contrastan y render con asset alterado falla. |
| MP-10 | PASS: archivo preparado que supera lease no puede verificar/publicar. |
| MP-11 | PASS: plan Full→Básico→Full, epoch detecta ABA. |
| MP-12 | PASS: sesión revocada bloquea; sesión nueva recupera histórico exacto; intento sin consumo requiere renovación explícita, confirmado no se renueva. |
| MP-13 | PASS: membresía active→disabled→active invalida autoridad. Writer concurrente adicional. |
| MP-14 | PASS: taller ajeno, identidad reutilizada con kind distinto y maxAdditionalUnits=0 sin crédito rechazados. |
| MP-15 | PASS: HTTP estricto, campos/UUID/origen/versión; ACL cuatro firmas revocadas/restauradas en lab, SQL+HTTP; FunctionsClient instalado devuelve metadata y PDF real. No prueba JWT firmado alojado. |
| MP-16 | PASS: dos PDF con metadata diferente llegan a CAS; ambos reciben H_pdf/bytes del primer stage. cas-results añade ejecución por dos conexiones SQL independientes y publicación/descarga exacta del ganador. |
| MP-17 | PASS: crédito de mecánico no adoptable por owner; otra solicitud explícita cuesta una unidad nueva. Mecánico no emite. |
| MP-18 | PASS: worker de generación vieja cercado tras renovación; artifact anterior se conserva. |
| MP-19 | PASS: reservas paralelas reales convergen a un intento; cinco escritores independientes de hallazgo/licencia/membresía/perfil/resolución, con espera de locks observada. |
| MP-20 | PASS: render/asset inválido, upload/readback corrupto, publicación SQL rechazada por trigger de fallo lab y respuesta HTTP perdida después del commit; reintento con mismo UUID, una confirmación. |
| MP-21 | PASS: upload sin upsert, objeto existente, readback/hash/tamaño y corrupción bloquean antes de publicación/entrega. |
| MP-22 | PASS: original ausente/corrupto no se regenera; revocación durante lectura impide devolver bytes; recuperación Full conserva original. |
| MP-23 | PASS: extracción real con pdftotext, definitivo sin BORRADOR y borrador marcado. Renderer previo preservado. |
| MP-24 | PASS: A4 y más de una página; nota larga dentro del límite CP04 de 2.000 caracteres preservada completa; 34 nombres oficiales extraídos desde plantilla actual. |
| MP-25 | PASS: fuente vacía no emite, parcial sin ack no emite; ningún componente se transforma en OK. |
| MP-26 | PASS: ready/closed no se reabren al emitir, edición bloqueada por guard previo. |
| MP-27 | PASS Chromium: 1440×900, 1366×650 y 390×844, React StrictMode, visor/zoom/Escape, conservación de texto y bloqueo por cambio de plan. Regresión real de Órdenes Full/Plus por rutas V1 preservadas. WebKit BLOCKED_ENVIRONMENT (ejecutable ausente), pendiente CI. No QA física. |
| MP-28 | PASS focalizado: tres pruebas existentes de ZIP exacto/digests/rutas; originales de ZIP y renderer draft conservan blobs base. No cuarta entrada. |
| MP-29 | PASS: sidecar published/staged y pg_dump/psql restaurado en otra DB; comparación exacta de documentos/ledger/artifact bytes. Inventario V2 ejecutado y compatibilidad S5B V1. Ninguna custodia real. |
| MP-30 | PASS local: instalación SQL con gates OFF, bucket privado candidato en lab, paquetes independientes reproducibles, Node ESM/Deno adapter, TypeScript y builds público/privado. Native Deno BLOCKED_ENVIRONMENT; WebKit BLOCKED_ENVIRONMENT. CI nativa pendiente, no PASS de runtimes no disponibles. |

La ronda propia consolidada comprende 24 casos núcleo, 11 integraciones ampliadas y cuatro comprobaciones de compatibilidad V1/V2. Se agregaron dos fallos inyectados y un caso CAS con dos conexiones independientes, y se reforzaron los cinco casos de escritores midiendo bloqueo real, sin repetir suites históricas. El archivo extra-results corresponde a la ronda base; writer-results y failure-results documentan ampliaciones. Los builds guardan el límite público y solo permiten dos módulos V2 concretos cuando CP04 privado está activo; no permiten renderers de servidor en navegador.

S5B histórico directamente afectado: diez pruebas descubiertas, nueve ejecutadas PASS y una integración GPG marcada skip por el propio ejecutor. Ese skip no equivale a probar custodia. ZIP: tres seleccionadas PASS, once no seleccionadas. No se ejecutaron suites completas anteriores ni SEC07.
