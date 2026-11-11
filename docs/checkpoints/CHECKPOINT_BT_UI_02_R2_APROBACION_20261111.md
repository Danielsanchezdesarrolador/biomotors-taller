# ByteTorque — BT-UI-02-R2 — APROBACIÓN VISUAL OFICIAL

**Fecha:** 11 de noviembre de 2026  
**Decisión:** aprobación explícita del Director para convertir el diseño premium R2 del Inicio en el **sistema visual oficial** de ByteTorque.

## Fuente de la decisión

El Director confirmó en el chat que R2 «alcanzó la visualidad requerida» y ordenó hacerlo oficial, preservando una sola identidad visual consistente en todas las secciones. Adjuntó una captura de los elementos del menú de navegación. No se confunde esta aprobación con la prueba física iPhone.

## Compromisos vinculantes

- El Inicio BT-UI-02-R2 ya está aprobado: **no rediseñarlo** mientras se desarrollan los otros cuatro paneles.
- Los módulos restantes replicarán estructura visual, topbar/sidebar, paleta, tipografía, iconos, radios, sombras, espaciados y acabados del Inicio R2.
- Mantener **cinco paneles**, sin inventar menús nuevos ni variar el estilo entre pantallas.
- Contrato de diseño documentado en `docs/SISTEMA_VISUAL_OFICIAL_R2.md`; código R2 en `src/premium.css`, `src/App.tsx` y recurso `public/hero-workshop.webp`.
- Próxima etapa autorizada de diseño: **BT-UI-03 — Órdenes de trabajo**. Brief en `docs/briefs/BT_UI_03_ORDENES_TRABAJO_DIRECCION_ARTE.md`.
- Web Render primero, iPhone PWA Safari y Android React Native/Expo nativa al final; no generar APK ni usar WebView.
- Esta actualización es **documental**, sin cambiar código visual R2, Supabase, datos, correos o pagos.

## Evidencia técnica anterior

- R2 código: `c139ec6`. Documentación R2: `eb82d27`.
- GitHub Actions: runs `43119179234` y `43119309468`, SUCCESS.
- Render, verificado antes de esta aprobación: `dep-dbqfhbl9el5s73er8ucg`, LIVE.
- Todas las cifras/vehículos del Inicio siguen siendo DEMO.
- La prueba física Safari iPhone y una APK Android real permanecen pendientes.

## Criterio de aceptación para BT-UI-03

El Director debe poder cambiar de Inicio a Órdenes de trabajo sin percibir que cambió de software. Exigir capturas comparativas web/móvil, CI/build/Render, accesibilidad, datos ficticios y nueva aprobación del panel.
