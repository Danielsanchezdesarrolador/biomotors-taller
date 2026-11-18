# ByteTorque — Checkpoint CP05: cierre de código, emisión privada preparada

**Fecha:** 18/11/2026 · **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **Única rama:** `main`.  
**Base:** `3ebd3ac8c0b8425ef09af578bbfdb1122f83c7b9` (checkpoint BT-PILOT-QA-03).  
**Último commit de código de esta entrega:** `ac03cfa3339b249fdde0b6315e2ceb9c0bb91263`.  
**CI comprobada:** [GitHub Actions 44326581500](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44326581500) — **SUCCESS** Web/iOS PWA y Android nativo Expo.

## Decisión de producto registrada

El Director reorienta el desarrollo de ByteTorque a **terminar CP05 y luego continuar el roadmap funcional original**. **BT-PILOT-QA-04 queda «A REPASAR»** para la etapa final de seguridad/piloto; no abrir nuevas rondas generales QA antes de avanzar el código. Las pruebas focalizadas de cada implementación siguen siendo necesarias. Esto **no** autoriza uso de clientes reales, ni altera precondiciones de respaldo antes de nuevas activaciones alojadas.

## Funcionalidad CP05 existente, verificada o candidata

| Componente | Estado verificado |
|---|---|
| Cotización editable con repuestos, insumos, mano de obra y servicios, neto/IVA CLP | Código y tests ya existentes; editor privado conectado |
| Alta de borrador CP05, edición, numeración y persistencia en Supabase | **Alojado**, ya probado con cotización ficticia QA1234; no extrapolar a cliente auténtico |
| PDF A4 marca ByteTorque R3, borrador descargable | **Implementado**; dos PDF de QA descargados/verificados manualmente por el Director. Corrección posterior de aviso duplicado en código |
| Revisiones inmutables/snapshot, archivado PDF, checksum, read-back y descarga histórica | **Código candidato preparado**, sin bucket/función final activados |
| Worker `bt-cp05-documents` y contratos de emisión, descarga, cancelación, correo | **Candidato compilado offline**; no desplegado ni provisto de secretos |
| Correo transaccional de cotización con adjunto y acuse del proveedor | **Código candidato OFF**, sin envío real |
| Correo único de cierre cotización+informe+constancia de entrega | Requisito **BT-COM-01** pendiente, no confundir con correo de cotización |

## Cambios de esta entrega

1. `roadmap.md`: decisión expresa **«BT-PILOT-QA-04: A REPASAR»** y estado CP05 actualizado; se preservó el historial de fases y checkpoints.
2. `scripts/verify-cp05-edge-package.mjs`: verifica offline que el paquete del worker contiene el entrypoint, archivo `config.toml` con `verify_jwt=true`, recursos PDF/logo cuyas huellas SHA-256 coinciden con las originales, licencia y contratos de emisión/archivo/descarga/correo. **No usa red, secretos ni despliega.**
3. `.github/workflows/ci.yml`: construye con `node scripts/package-cp05-edge.mjs /tmp/bytetorque-cp05-edge-ci` y verifica el paquete. El proceso crea artefactos efímeros de CI; NO registra una Supabase Edge Function alojada.
4. `server/cp05/issuanceCandidate.ts`: después de archivar, se valida el recibo final contra taller, cotización, revisión, tamaño del PDF, SHA-256, ruta y versión de snapshot; si hay inconsistencia se rechaza la confirmación, aunque el objeto privado haya sido archivado.
5. `src/cp05/pilotDocuments.test.ts`: cuatro regresiones nuevas con respuestas sintéticas alteradas (revisión, tamaño, taller, versión de la cotización congelada); no se anuncia emisión incorrecta.

## Resultado CI y alcance

- [CI 44326581500](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44326581500): **SUCCESS** para ambos jobs Web/PWA y Android React Native/Expo.
- Web Vitest: **647/647 pruebas, 75/75 archivos aprobados**; el grupo de documentos CP05: **20/20**. TypeScript/build PWA/compilaciones candidatas CP03–CP06 PASS. Empaquetado Edge/offline PASS.
- Android: TypeScript, bundle Expo y contratos simulados PASS; **no APK instalada ni conexión a Supabase Android**.
- Las pruebas HTTP, Storage, hashes y provider de CP05 usan dobles sintéticos, no son prueba de un sistema alojado ni prueba física.
- El programa de seguridad integral y **BT-PILOT-QA-04 se mantiene «A REPASAR»** al final, como solicitó el Director.

## Infraestructura sin modificar

- **No** se aplicó SQL alojado nuevo, no se creó bucket ni política Storage, no se desplegó Edge Function, no se configuró proveedor de email, no se enviaron correos ni se activaron cobros. La instalación privada CP05 de cotizaciones **anterior** y los registros de ensayo existentes permanecen intactos.
- **No** se habilitaron `VITE_BT_CP05_DOCUMENTS_ENABLED`, `VITE_BT_CP05_EMAIL_ENABLED`, `BT_CP05_ARCHIVE_ENABLED` ni `BT_CP05_EMAIL_ENABLED` en servidor.
- No se cambió Render/bytetorque.cl ni se inició un nuevo despliegue intencional; commits de código marcados `[skip render]`.
- Sin cambios de autenticación, RLS, usuarios, talleres, cuentas de Ignacio, pagos, fotos o datos reales.
- El respaldo integral/restauración de Auth/Storage/políticas y una segunda copia recuperable no se dan por completados.

## Qué falta para que CP05 esté 100 % operativo

1. Desde el equipo personal del responsable: respaldo integral cifrado, restauración en entorno aislado y autorización específica para el bucket/SQL Storage y la Edge Function.
2. Instalar por pasos solo los componentes aprobados y ejecutar el flujo real de ensayo A/B: `OT CP04 → cotización CP05 → guardar → emitir revisión → archivo privado → PDF histórico recuperado`; comprobar bytes SHA, reintentos sin duplicación, mecánico/revocación y dispositivos físicos.
3. La habilitación de correo transaccional requiere autorización y pruebas con proveedor; el correo consolidado de cierre tiene alcance independiente BT-COM-01 y necesita informe/entrega reales.
4. Después realizar la aceptación práctica de Ignacio y las pruebas finales de seguridad BT-PILOT-QA-04. **Hasta entonces no presentar emisión archivada ni correo como funciones activas.**

## Próximo paso funcional

**Continuar CP06 e integración de punta a punta** (historial cronológico por vehículo y enlaces a OT, cotizaciones/revisiones/PDF). Mantenerlo como código candidato mientras los servicios de emisión/archivo sigan OFF. No construir un segundo sitio, no cambiar la identidad premium R2 y no reiniciar el proyecto. Un checkpoint por cierre sustantivo.
