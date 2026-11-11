# ByteTorque — Flujo de trabajo WEB primero y APK Android nativa al final

**Decisión:** 11 de noviembre de 2026 · Repositorio GitHub `Danielsanchezdesarrolador/biomotors-taller` · Rama única `main`.

## Objetivo

Usar **https://biomotors-taller-demo.onrender.com** como entorno único de revisión de interfaz y experiencia mientras construimos ByteTorque, igual que el usuario hace en sus otros proyectos. Al terminar de validar diseño y funcionalidad, generar e instalar una **APK Android verdaderamente nativa**, conservando iPhone como PWA Safari.

## Cómo se trabajará

1. **Web y PWA iOS — prioridad inmediata.** React/Vite en la raíz del repositorio, despliegue automático sobre el mismo Render. Cada cambio se verifica mediante CI y el usuario lo revisa en web; el estilo premium BT-UI-02-R2 fue **aprobado como identidad visual oficial** por el Director el 11/11/2026.
2. **Módulos completos.** Avanzar por las cinco pantallas acordadas: Inicio, Órdenes de trabajo, Clientes y vehículos, Informes y cotizaciones, Configuración. No activar operaciones reales con datos personales mientras falten Auth, RLS, validaciones y seguridad.
3. **Una sola base de datos.** Supabase `biomotors-taller`, Auth + RLS por `workshop_id` y controles de permisos testeados. Definir APIs, tipos y validaciones reutilizables por web y móvil.
4. **Android nativo — fase posterior.** Proyecto React Native + Expo **ya creado** en `apps/android/` y respaldado. No tocarlo por cada ajuste cosmético de web; después de consolidar diseño y flujos, adaptar su UI con componentes nativos (no React DOM, ni PWA, ni WebView). Validar feature parity y regresiones.
5. **APK final.** Compilar con EAS profile `preview` con `android.buildType:"apk"` (o build nativo equivalente), firmar, descargar e instalar en Android real, probar flujos y seguridad. No afirmar APK disponible sin evidencia verificable.
6. **iOS.** Safari y «Agregar a pantalla de inicio» siguen siendo la experiencia iPhone; Apple Developer y app nativa iOS no forman parte de esta fase.

## Decisión del Director sobre el diseño

El mockup premium recibido el 11/11/2026 y la implementación R2 **aprobada** establecen el **patrón oficial obligatorio**: sidebar navy con ondas y selección azul, topbar claro y buscador, hero automotriz suave, cuatro métricas, donut de estados, órdenes recientes, actividad y CTA de accesos rápidos. El CSS candidato se aloja en `src/premium.css` sin eliminar `src/styles.css`. **Aplicarlo de manera homogénea a los otros cuatro paneles sin modificar Inicio R2**, según `docs/SISTEMA_VISUAL_OFICIAL_R2.md`.

## Restricciones

- Un solo repositorio privado, rama `main`, mismo Render; sin nuevos studios ni ramas paralelas.
- Marca **ByteTorque** para producto. BIOMOTORS permanece como piloto de Ignacio; identificadores técnicos actuales no se renombran.
- Datos DEMO señalizados, sin guardar datos reales, sin emails ni pagos reales en BT-UI-02.
- ChatGPT implementa lo que pueda directamente; Codex solo cuando se justifique por tareas complejas.
- Distinguir **CI PASS** / **Render LIVE** / **diseño aprobado** / **APK firmada e instalada**; no equivalen entre sí.
