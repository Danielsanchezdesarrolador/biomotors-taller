## Publicación Render de BT-COM-01 y CP05 correo — 23/11/2026

**Autorización del propietario recibida y ejecución confirmada.**
Servicio estático Render existente `srv-dbqe4quc6qcc73f275jg` (`bytetorque.cl`), Auto-Deploy OFF.
Deploy manual por API **`dep-dc288ot6e07s73b23qo0`** terminado **LIVE**
el 23/11/2026 18:22:50 UTC, código exacto **`871b4835c94b1cb738046d96f45b28db753d70cf`**.
Despliegue anterior `dep-dc26hok9v7es73ch95u0` (`e0fee642`) quedó `deactivated`.
La CI principal del código [45237203282](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45237203282)
**SUCCESS**, incluidas pruebas TypeScript/Vitest Web/PWA, Android y compilación candidata
BT-COM-01D con variables solo en CI. La CI visual [45237203385](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/45237203385)
estaba todavía ejecutándose al documentar; aprobación visual BT-COM-01 previa por propietario.

**Alcance:** se publicó el código BT-COM-01 ZIP y la interfaz candidata de
revisión de correo CP05; **no se cambiaron flags ni servicios de Supabase,
SQL, Storage, Edge ni proveedor de correos**. No se activó LIVE-02 ni el
correo real. Por ello BT-COM-01 no es aún utilizable por taller en Render:
requiere gate privado / S4 integral restaurado y aprobación independiente.
El piloto CP05 lo ejecutará el propietario con datos y destinatario de prueba;
CP06 viene después. Esta nota de cierre documental no cambia el código desplegado.

---

# ByteTorque — BT-COM-01 · Paquete documental local (23/11/2026)

**Fuente:** `main` `1efdceb5511c052e5db6deaec065933d5085c262`.
**Estado:** candidato autorizado para publicar en `main`, sin deploy ni SQL.
**Autorización:** el propietario autorizó expresamente publicar código y documentación y usar la CI existente; no autorizó Render, Supabase ni correos.

## Capacidad concreta

En CP06 > historial de una revisión emitida con las tres constancias LIVE-02:
**Descargar paquete ZIP (3 PDF)**. Conserva el original CP05 archivado,
verificado por Auth, taller, tamaño y SHA-256 en `documentClient.download`.
Las otras dos piezas son PDFs informativos derivados de `finalPackage` y
`finalPdf` existentes. Si falta documento, evidencia o sesión, no se genera
un ZIP incompleto ni se muestra como confirmación de entrega.

Se integró `src/entrega/closingZip.ts`, función determinista de ZIP/STORE con
CRC32, nombres limitados, tres entradas exactas y límites de tamaño; no requiere
dependencias nuevas. `src/historial/archiveDownload.ts` reutiliza comprobaciones
para obtener bytes sin descargarlos por separado; `ClosingReviewPanel` mantiene
el diseño R2, las casillas efímeras y correo OFF. `VehicleHistory` verifica
acceso al vehículo antes y después de preparar el conjunto.

## Validación y pendientes

- [x] Generación sintética de ZIP y lectura independiente con Python `zipfile`:
  exactamente 3 PDF, sin error CRC. No fue un PDF real CP05 alojado.
- [ ] Comprobar resultado final de TypeScript, Vitest y CI del nuevo commit.
- [ ] QA física Safari iPhone y descarga real CP05 con sesión válida.
- [ ] S4 integral respaldado y recuperado; SQL LIVE-02 y flags aún OFF.
- [ ] Envío único al cliente con consentimiento, proveedor y cola segura:
  **no incluido** en esta entrega; no fingir éxito de correos.

**CP05 está aprobada en QA de emisión y diseño, pero no terminada al 100 % para
Ignacio hasta descarga real, S4, correo y validación de taller.**

## Corrección de integración privada de CI — 23/11/2026

La primera CI del commit `0f4af648` aprobó TypeScript/Vitest/PWA/Android,
pero el build privado con `VITE_BT_COM_01D_PREVIEW_ENABLED=true` encontró
`closingZip.ts` no declarado en el límite de módulos de Vite. Se añadió
la autorización estrictamente condicionada a COM-01D + LIVE-02 + CP05
Documentos + CP06 y una regla explícita de exclusión para builds OFF.
No habilita producción, no despliega Render, no cambia Supabase ni correos.
El resultado de la nueva CI queda pendiente de verificación.
