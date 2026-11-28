# BT-MULTIPUNTO-PDF-FIX-01

28/11/2026 · America/Santiago. Base oficial exacta `eed6dee7d7ce9cf5bddcb03025500b646b2961f5`. V2 LIVE, un consumo y GATE4 intacto reportados por el titular; no nueva inspección ni intervención productiva. Aceptación funcional completa abierta. Candidato y árbol exactos en CANDIDATO.json de la entrega privada, sin hashes autorreferentes en las fuentes.

## Diagnóstico

El renderer BT-MP-FINAL-1 utilizaba dos implementaciones: resumen CP04 aprobado para draft y una lista lineal diferente para final. Además, su adaptador convertía immediate a attention sin conservar el prefijo de prioridad, por lo que podía dibujar amarillo en lugar de rojo. No se modifica un original emitido para corregir ese resultado.

El PDF adjunto `multipunto-borrador (1).pdf` constituye la referencia visual. Su SHA-256 y comparación están en reference.json/pdf-visual-results.json. Se recibió ese adjunto; el PDF definitivo mencionado no quedó adjunto al espacio de trabajo. La implementación lineal se diagnosticó directamente en el código oficial y se ejercitó con un original histórico sintético. El archivo de referencia del titular no se publica, ni sus datos personales: las muestras y capturas transferidas son sintéticas.

## Solución y reutilización

`pdfLayout.ts` extrae las instrucciones de dibujo de la plantilla original: posiciones A4, tipografía, logos, degradados, tarjetas, grupos, leyenda, celdas y X. Un único núcleo sirve para draft/final de BT-MP-FINAL-2. En la primera página el final elimina solamente la marca/texto exclusivo de borrador y muestra «Informe definitivo emitido»; no hay diseño nuevo. El draft conserva la marca en todas sus páginas. No se altera src/ordenes/cp04InspectionPdf.ts, cp04Multipunto.ts ni el template original. La duplicación del motor antiguo se conserva deliberadamente como implementación versionada, no como segunda plantilla activa para trabajos nuevos.

El nuevo renderer proyecta directamente los cuatro estados autorizados del snapshot; no pasa por el adaptador lossy Finding. Valida los 34 IDs, nombres, categorías y orden contra la fuente oficial, scope de la OT, tipo de trabajo, assets y snapshot. Solo SQL/trabajo confiable determina draft/final; el endpoint rechaza clean/watermark/renderer desconocidos. No se incorpora ningún parámetro de limpieza del navegador.

Las observaciones y seguimientos completos se incluyen en anexos A4 coherentes; cada bloque permanece unido siempre que quepa. Se envuelve por palabras y solo se divide un token demasiado largo. Encabezados adicionales de hasta 80 caracteres también se envuelven. Se conservan todos los caracteres y observaciones, sin elipsis ni límites visuales que eliminen datos. Anexos identifican inspección parcial/completa, revisión, fecha, documento, operación, H_snapshot, historial y política. Metadatos PDF fijados al trabajo, no al reloj de renderizado; reintentos producen bytes reproducibles.

## Versionado explícito

- MP-V2-1/MP-V2-2 y sus filas, hashes, snapshots y originales no se reescriben.
- rendererV1.ts es una copia byte a byte del renderer oficial anterior. El generador histórico apunta ahora a esa fuente: sigue generando exactamente el registro MP-V2-2 existente.
- Registro nuevo MP-V2-3, renderer BT-MP-FINAL-2, canonical MP-SNAPSHOT-2/PG17. Fija por SHA-256 motor, núcleo visual, template, proyector, assets y fuente original aprobada. El empaquetador exige coincidencia exacta de ambos registros generados.
- Dos funciones privadas capture se adaptan mediante SQL incremental separado: proyección existente para MP-V2-3 y selección de versión. No se modifica prepare/complete/read/worker/info/renew, ledger, cuota, permisos, RLS, Storage ni GATE4. El verificador puro de recuperación admite explícitamente MP-V2-3 como schema 2 y conserva la vinculación H_source; son dos predicados versionados, cuyo diff separado se incluye en proposals/RECOVERY_POLICY_3.patch.
- Un crédito confirmado o reserva recuperable vigentes del mismo actor/sesión/autoridad/fuente conserva su política y H_snapshot. Los controles comerciales originales vuelven a validar todo. Una captura nueva sin esa operación vigente usa MP-V2-3. Al vencer/cambiar fuente no se transfiere autoridad ni se cobra automáticamente.
- Los trabajos fijados a políticas anteriores continúan con su motor anterior si necesitan renderizarse; por tanto una recuperación/promotion antigua puede mantener temporalmente el diseño lineal. Es compatibilidad intencional y visible, no aceptación del diseño antiguo ni actualización silenciosa de su política. No se fuerza expiración ni nuevo consumo para migrarlos.
- Los originales archivados, incluido R2 real, siempre se recuperan por sus bytes/hash originales; no pasan por ningún renderer nuevo y no se regeneran. La muestra historical-original.pdf es exclusivamente sintética.

## Instalación y autorización

La primera propuesta de preflight exigía gates SQL OFF. El laboratorio mostró que cambiar control incrementa moduleEpoch y revoca los créditos, lo que incumpliría continuidad. Se sustituyó antes de entregar por barrera HTTP externa verificada + bloqueo transaccional de control **sin UPDATE de gates ni épocas**. La confirmación SQL del operador no implementa por sí sola esa barrera. No se debilita la autorización del producto. Ver INSTALACION.md; no se ha instalado ni desplegado nada.

## Validación y límites

Matriz y logs contienen resultados efectivos; las pruebas de PostgreSQL, HTTP, renderers, extracción/rasterización PDF, Node, builds y empaquetado se ejecutaron localmente con datos sintéticos. Storage/Auth de transporte son simulados estrictamente; las reglas SQL y los PDF sí son reales. Deno nativo no está instalado: BLOCKED_ENVIRONMENT, no PASS. La paridad exacta de bytes Node/Deno e Intl permanece pendiente de su ejecución nativa; no se certifica por el adaptador Node. Se añade workflow focalizado que exige Deno nativo y falla si falta; no se ejecuta ni despacha CI remota desde esta entrega. No nuevas dependencias locales ni intentos de descarga de navegadores/runtime.

No auditoría SEC07, respaldo, recuperación real, QA en dispositivo ni despliegue. No se modifican cuotas/créditos ni permisos comerciales. Ninguna promesa de borrar archivos descargados legítimamente. No original histórico sobrescrito. Auto-Deploy no se activa. Aceptación visual y autorización de integración/instalación corresponden al titular/Dirección Técnica.

## Errores observados y soluciones

1. Adaptador immediate→attention confirmado: mapeo directo nuevo, matriz de X verificada por geometría y color.
2. Gates OFF invalidaban la época: barrera externa con control bloqueado pero sin modificar, prueba de crédito/reserva anterior y rollback.
3. Fixtures iniciales infringían una sola OT abierta por vehículo y la relación result/resolution/resolved_at. Se corrigieron los datos sintéticos a esos contratos; no se relajó SQL.
4. El helper SQL devuelve JSON únicamente si se selecciona to_jsonb: se corrigieron consultas de los tests, no el servicio.
5. Tipos/sintaxis iniciales del nuevo test y tipo Assets duplicado se corrigieron antes de la validación final. Una recreación del contenedor --rm encontró la retirada asíncrona del nombre; los laboratorios finales usaron nombres nuevos aislados, sin tocar servicios ajenos.
6. El envoltorio por caracteres podía cortar palabras; el núcleo final envuelve por palabras con fallback para un token extenso y títulos de 80 caracteres, verificado sin truncamiento ni desborde.

7. La allowlist de recuperación rechazaba MP-V2-3: se amplían únicamente dos predicados y se comprueban cuatro casos en memoria sobre datos SQL sintéticos. La versión desconocida y el H_source inválido siguen rechazándose. No se ejecutan scripts de respaldo/restauración ni sus suites históricas. Los pins del ejecutor privado requieren conciliación coordinada antes de instalar.

Candidato preparado para revisión independiente; NATIVE_DENO_PENDING, OFFICIAL_CI_PENDING y OWNER_VISUAL_ACCEPTANCE_PENDING. No aceptación comercial integral ni autorización de producción.
