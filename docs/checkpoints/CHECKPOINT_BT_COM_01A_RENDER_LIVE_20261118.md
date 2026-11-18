# ByteTorque — Checkpoint BT-COM-01A + Render LIVE · 18/11/2026

**Rama única:** `main`  
**Despliegue anterior aprobado:** `d8d6ed99e19b10108e7078e4455a67a141899132` (BT-UI-POLISH-01).  
**Último commit de código candidato:** `8edef23e3252400a1513eb2fca8b75df3976f469`.  
**Roadmap:** `8f17736e955edee02ee12027467a9c3e865847a9`.  
**Estado:** pulido visual LIVE; siguiente bloque documental **código candidato aprobado en CI, NO ACTIVADO**.

## A. Despliegue Render autorizado y verificado

- Servicio **existente**: `biomotors-taller-demo` / `srv-dbqe4quc6qcc73f275jg` y rama `main`. No se creó otro Render.
- **Deploy:** `dep-dbv2lhk9v7es738g7bug` con trigger API; Render respondió `status: live` y commit `d8d6ed99`. URL canónica: https://bytetorque.cl; URL técnica existente https://biomotors-taller-demo.onrender.com.
- Los cambios publicados son únicamente los del checkpoint BT-UI-POLISH-01 más el código incluido en ese commit. **No se activó** `VITE_BT_FLOW_LIVE_02_ENABLED`, emisión CP05, correos, Storage ni suscripciones adicionales; no se ajustaron variables.
- Verificación humana de la nueva distribución visual en web/iPhone aún pendiente; LIVE confirma servidor, no prueba visual en pantalla física.
- Los siguientes commits BT-COM-01A utilizan `[skip render]`, sin desplegar el nuevo candidato ni cambiar lo visible al público.

## B. BT-COM-01A — paquete de archivo triple sin envío

Se incorpora `server/com/closingArchiveCandidate.ts`:

1. A partir de una sesión confirmada y un estado de servidor autorizado, recupera la **revisión CP05 exacta emitida**, evidencia de autorización declarada, informe de trabajos declarados y entrega declarada.
2. Reconstruye el paquete usando `prepareClosingPacket` a partir de **cotización, revisión y filas históricas originales**. No acepta montos, nombres, rutas ni PDFs suministrados por el navegador.
3. Comprueba el PDF CP05 **original** desde almacenamiento privado: identificadores de taller/cotización/revisión, ruta canonical vinculada al hash congelado, SHA-256, tamaño y PDF estructural mínimo; no regenera ni modifica esa cotización.
4. Genera por puertos de backend PDF informativo de informe y constancia, verifica SHA-256, límites y confirmación de lectura del objeto; crea rutas privadas deterministas `{taller}/closings/{OT}/{revision}/{entrega}/{report|handover}/{digest}.pdf`.
5. Prepara un **manifiesto inmutable de tres documentos** con orden 01, 02 y 03, referencia al archivo CP05 existente y dos objetos de Storage privado futuro. Estado único `prepared_not_sent`: **nunca se informa correo enviado, firma, conformidad, reparación acreditada ni pago**.
6. Revalida acceso/rol/taller/revisión/entrega antes de confirmar. El puerto de registro futuro exige transacción SQL con unicidad por taller+revisión+entrega; reintento idéntico no sobrescribe, distinto contenido se rechaza.
7. Si falla luego de guardar un objeto, no realiza borrado automático; quedan objetos privados reconciliables y un manifiesto sin confirmar. La implementación futura debe establecer reconciliación y retención.

**NO existe integración real de estos puertos:** el código carece de endpoint servido, bucket instalado, manifiesto SQL instalado o correo externo. No fue añadido al frontend ni a Render. Documento de implementación y límites: `docs/BT_COM_01A_ARCHIVE_CANDIDATE.md`.

## C. Evidencia automatizada

- [GitHub Actions — Verificación ByteTorque #44415765085](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44415765085): **SUCCESS** en `8edef23e`.
- Web: **80/80 archivos, 694/694 Vitest** (10 pruebas nuevas de archivo documental), TypeScript y builds públicos/privados, validaciones de identidad, bundle PWA, PostgreSQL 17 aislado y regresiones de flujos anteriores.
- Android Expo: **SUCCESS** bundle/TypeScript, sin APK física ni cambios de app nativa.
- `src/entrega/closingArchiveCandidate.test.ts`: flag OFF sin IO, identidad y taller inválidos, rol mecánico y usuario sin confirmar, exportación triple en orden, hashes de cotización fuente, reintento idempotente, conflicto de bytes, corrupción de documento, importes falsificados, revisión no vigente, entrega ausente y revocación entre upload y commit.
- Todas las consultas y escrituras de esta etapa se ejecutaron sobre **mocks sintéticos** en CI, no contra Supabase alojado.

## D. Puertas cerradas y roadmap

**Supabase:** sin nueva migración, sin Storage, sin Edge ni modificación de Auth/RLS/usuarios/planes. **Render:** solo despliegue visual autorizado; código documental nuevo OFF y no desplegado. **Correo:** no se prepara ni envía ningún correo real. **Planes/pagos:** inalterados.

**Próximos pasos seguros en código:** BT-COM-01B — preparación de revisión del destinatario y estado idempotente del futuro correo consolidado, explícitamente OFF y sin enviar; o continuar CP05 Storage/Edge **solo tras respaldo recuperable y autorización específica**. Antes de piloto auténtico de Ignacio siguen faltando respaldo integral, instalación aprobada de CP05/LIVE-02, RLS real A/B, recuperación de PDFs, pruebas físicas iPhone/Android y consentimiento/documentación.

**BT-PILOT-QA-04: A REPASAR.** No anticipar la auditoría general de seguridad ni declarar producción lista para datos reales.

**Regla de continuidad:** una sola rama `main`, R2 premium preservado, sin sobrescribir desarrollos de otros chats y sin activar servicios externos por inferencia.
