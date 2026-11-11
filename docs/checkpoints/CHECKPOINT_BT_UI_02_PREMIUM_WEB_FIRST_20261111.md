# ByteTorque — CHECKPOINT BT-UI-02 — Inicio premium web-first

**Fecha:** 11/11/2026 · **Rama:** `main` · **Repo:** `Danielsanchezdesarrolador/biomotors-taller`

## Solicitud confirmada

El usuario proporcionó una imagen de diseño más premium para el Inicio y autorizó implementarlo. También decidió adoptar el trabajo **web primero en Render** hasta completar el proyecto, dejando la generación de la **APK Android nativa** para el final, mientras iPhone continúa como PWA Safari.

## Cambios de frontend

- `src/App.tsx`: cabeceras con iconografía, cuatro tarjetas de KPI alineadas horizontalmente, atajo funcional Ctrl/Cmd+K, gráfico de estado y listas DEMO existentes, aviso discreto de demostración. No inventar datos reales.
- `src/premium.css`: hoja de estilos **adicional** y reversible que aproxima la imagen aprobada como referencia con sidebar navy y ondas, topbar clara, hero suave, cards, donut, actividad y accesos.
- `public/hero-workshop.svg`: ilustración automotriz vectorial original para la cabecera, sin recurso de terceros.
- `src/main.tsx`: importación de premium.css después del CSS anterior para preservar la reversibilidad.
- `src/App.test.tsx`: pruebas SSR de navegación, 4 métricas, lista de órdenes, DEMO y marca ByteTorque.
- **Pendiente:** revisión visual y aceptación explícita del usuario para declarar el estilo oficial de los otros cuatro paneles.

## Estrategia de plataformas y estado

- **Web/PC y PWA iOS:** cambios en `main`, Render se actualiza automáticamente desde la misma rama.
- **Android:** `apps/android/` se preserva con interfaz BT-UI-01 (código React Native y Expo verificado anteriormente). No fue convertido en PWA ni se generó una APK.
- **Etapa final Android:** portar el diseño y funcionalidades aprobadas al proyecto nativo; generar APK firmada y probarla en dispositivo físico.
- **Backend:** Supabase multiempresa todavía no conectado a estas interfaces; no usar datos reales, correo ni pagos.
- **Infraestructura:** identificadores técnicos `biomotors-taller` y la URL de Render no cambian.
- **CI/Render:** rediseño premium validado en GitHub Actions y desplegado a Render; ver evidencia debajo. Aprobación visual de usuario pendiente.

## Próxima acción

Validar TypeScript/tests/build y deploy Render para el candidato premium; solicitar revisión visual del usuario y corregir diferencias. Después decidir si el estilo se replica en otros módulos; mantener trabajo web-first y Android nativo al final.

## Evidencias de implementación premium comprobadas

- Código fuente inicial: commit `5d54f634` y corrección de sintaxis `39b00cfa94e4bf60bef8117dbc0fda92b6f294e2` (sin cambios a backend).
- GitHub Actions: **run #43115723650 SUCCESS**, ambos jobs: `Web / iOS PWA` y `Android React Native / Expo`.
- Render servicio existente `biomotors-taller-demo`: **deploy `dep-dbqf4l2jnfac73bf3sb0` LIVE**, fuente commit `39b00cfa`.
- Android: el job CI se ejecutó correctamente sobre el proyecto BT-UI-01 existente, pero **no** se rediseñó visualmente ni se produjo APK. La adaptación premium nativa se hará en la etapa final según orden del usuario.
- Se mantiene sin aprobar la fidelidad visual por el usuario; es un candidato.
