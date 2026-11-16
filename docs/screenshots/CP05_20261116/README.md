# Evidencia CP05 — 16/11/2026

Capturas reales de Chromium Linux a 1650/1440/768/390/375 px, aplicación React y SDK existentes. **Todas las respuestas Supabase de este recorrido son HTTP sintético interceptado**; no prueban cuentas ni persistencia alojada. Los nombres/IDs/contactos son fixtures controlados. El mensaje de guardado refleja el contrato HTTP probado, no una afirmación de producción.

- [Escritorio](cotizacion-1650.png), [1440](cotizacion-1440.png), [tablet](cotizacion-768.png), [móvil 390](cotizacion-390.png), [móvil 375](cotizacion-375.png).
- [Viewport móvil con total fijo](cotizacion-390-viewport.png).
- [PDF A4 descargado del navegador](cotizacion-browser.pdf): borrador sintético, bytes PDF auténticos, no emitido/archivado ni enviado.
- [Resultados](browser-results.json). Script reproducible: `scripts/verify-cp05-browser.cjs` con harness privado de loopback y flags Auth/CP03/CP04/CP05; **nunca contra un backend real**.

El recorrido comprueba tres partidas, neto $130.150, IVA $24.729 y total $154.879; guardado/recarga, nuevo login, consulta desde vehículo, controles de emisión/correo bloqueados, cero llamadas Storage/Functions, ausencia de desbordamiento y errores JS. SQL/RLS/persistencia PostgreSQL local tienen evidencia independiente en el informe único; Safari/iPhone y Android físico pendientes.
