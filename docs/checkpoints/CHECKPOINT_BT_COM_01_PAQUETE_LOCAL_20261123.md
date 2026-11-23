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
