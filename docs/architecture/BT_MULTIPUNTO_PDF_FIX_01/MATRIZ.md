# Validación focalizada efectiva

28/11/2026. Solo contratos/documentos afectados; no ejecución de suites históricas, SEC07, dumps, respaldos o restauraciones. Laboratorio final `bt-mpf-pdf-fix-05`, PostgreSQL 17 en Docker network=none, fixtures sintéticos. CLI/Node ejecuta RPC reales en ese laboratorio; Auth/Storage de transporte sintéticos estrictos. Los primeros fixtures se corrigieron respetando las restricciones SQL; el log final contiene todos los casos finales.

| Alcance | Resultado y evidencia |
|---|---|
| Instalación incremental y invariantes | PASS. Políticas antiguas intactas, mismos cuerpos/ACL de siete RPC públicas y tres guardas privadas, GATE4 cuatro definiciones/ACL idénticas; mismo control/épocas. |
| Crédito antiguo Full y promoción | PASS. H_snapshot/política/crédito/bytes antiguos conservados, sin nuevo consumo ni expiración forzada. |
| Reserva antigua sin renderizar | PASS. Recupera versión fijada, mismo snapshot, bytes reproducidos por motor antiguo y una confirmación. |
| Snapshot nuevo | PASS. MP-V2-3, 34 IDs/nombres/grupos, cuatro estados exactos. |
| Crédito nuevo Full | PASS. Borrador marcado y final limpio, mismo snapshot/crédito, una unidad; llamadas concurrentes/reintentos no duplican el consumo ni los bytes. |
| PDF real reproducible | PASS. Mismo trabajo→mismos bytes, A4 en todas las páginas, metadatos de documento/operación/snapshot/fecha. |
| Referencia original | PASS. Primera página del borrador sintético idéntica píxel a píxel a la plantilla original sin modificar. Seis regiones estáticas idénticas al PDF adjunto del titular; sin publicar campos personales. |
| Observaciones extensas | PASS. Texto de hasta 2000 caracteres, token largo, categoría adicional de 80 caracteres, seguimientos; extracción completa, bloques que caben unidos, ningún desborde horizontal. |
| Denegaciones renderer | PASS. Scope/IDs de template/política/assets no coincidentes rechazados. |
| Rollback de versión | PASS. Capturas nuevas vuelven a MP-V2-2, mientras crédito MP-V2-3 vivo y originales conservan identidad/bytes/consumo. |
| Barrera de instalación | PASS. Sin confirmación externa explícita se rechaza sin cambiar función/control. La prueba no acredita una barrera alojada. |
| Plus | PASS. Inspección 34/34, draft/final compartiendo crédito, una unidad, mismo vencimiento. |
| Inspección vacía | PASS. 34 filas sin X, borrador explícito, final rechazado incluso con acuse parcial; no se inventan hallazgos. |
| HTTP y multitenant | PASS. clean/renderer/watermark desconocidos→400; lectura de taller ajeno denegada; cero consumos involuntarios. |
| Recuperación de versión (puro) | PASS, cuatro casos nuevos. El original rechaza dataset MP-V2-3; candidato acepta mezcla histórica y nueva, y rechaza H_source alterado/versión desconocida aun con hashes canónicos recalculados. Sin respaldo ni restauración. |
| Extracción/rasters | PASS. pdftotext bbox y pdftoppm 144 DPI, Pillow. X en celda exacta de los 34 componentes; verde/amarillo/rojo reales, sin X cuando no revisado; final sin BORRADOR; completo/parcial/vacío. Capturas y comparativa sintéticas. |
| Node | PASS. Node 24.22.3, bundle real con pdf-lib/fontkit reales fijados; mismos bytes que muestra, sin red. |
| Paquete Edge | PASS reproducibilidad de 14 archivos entre dos builds; hashes, imports fijados y adaptador Node de entrypoint OFF/READ ON-WRITE OFF, sin tráfico real. Esto NO equivale a Deno nativo. |
| TypeScript/builds/sintaxis | PASS. tsc --noEmit, build público y privado, verificaciones PWA/bundle/marca; sintaxis CJS/ESM/Python y YAML. |
| Deno nativo | BLOCKED_ENVIRONMENT: no ejecutable instalado. Preparados check, tests del entrypoint y dos tests nativos del renderer; no ejecución ni PASS nativo. |
| CI obligatorio | PASS prueba negativa local: CI=true + Deno ausente produce FAILURE/no cero. Workflow focalizado exige runtime y tests; CI remota pendiente, no despachada. |

Comandos reproducibles: preparar exclusivamente schema/fixtures con scripts/security/prepare-multipunto-final-lab.sh, seed y registros originales + delta 01B; `node scripts/verify-multipunto-pdf-fix.mjs` (10+4 casos); `python scripts/verify-multipunto-pdf-recovery-compat.py` (4 casos puros); `BT_MPF_PDF_FIX=true python scripts/verify-multipunto-pdf.py`; `node scripts/verify-multipunto-pdf-runtime.mjs`; dos `node scripts/package-multipunto-final.mjs /tmp/<salida-nueva>`; verify-multipunto-package con ambas salidas; npm run build. Todos con BT_MPF_LAB/BT_MPF_EVIDENCE apuntando al laboratorio aislado. La referencia privada es opcional en CI y se comparó explícitamente localmente usando BT_MP_APPROVED_REFERENCE; la plantilla sintética original se compara siempre.

Las muestras se regeneraron en un laboratorio limpio después del ajuste final de envoltura por palabras. No se repitieron suites históricas; las repeticiones de estos tests nuevos respondieron a correcciones de fixtures o código dentro del alcance. Los estados PASS se limitan a lo efectivamente ejecutado. Aceptación visual humana y ejecución nativa/CI pendientes.
