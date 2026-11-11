# ByteTorque — CHECKPOINT BT-UI-01: Inicio web/iOS PWA + Android nativa

**Fecha:** 11/11/2026  
**Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · `main`  
**Referencias:** mockup escritorio y mockup teléfonos aportados por el usuario el 11/11/2026.  
**Estado actualizado:** código de ambas interfaces en main, ambas verificaciones CI PASS y Render LIVE; APK real aún pendiente.

## Objetivo y decisiones

Implementar el **Panel Inicio** en la web compatible con PWA Safari de iPhone y en la **app Android nativa React Native/Expo**, sin reemplazar esta última por PWA/WebView. Mantener marca SaaS **ByteTorque**; BIOMOTORS es solo taller piloto.

## Web / iOS PWA

- Reemplazo visual completo de `src/App.tsx` y `src/styles.css` con diseño azul marino y blanco.
- Inicio con saludo neutral, fecha local, métricas de ejemplo, estado circular de OT, listado reciente de órdenes, actividad simulada y accesos rápidos.
- Navegación a los cinco paneles. Diseño responsive para Safari iPhone y web de escritorio.
- Búsqueda y filtros sobre un dataset sintético verificable; `src/demo/dashboard.ts` y pruebas en `src/demo/dashboard.test.ts`.
- No persistencia, credenciales, correos ni operaciones sobre clientes reales.
- **Evidencia web previa:** CI PASS del commit `28819a56` y Render LIVE del deploy `dep-dbqeobqvcj2c73erbo00`.

## Android nativa

- App React Native + Expo SDK 57 en `apps/android/`, con diseño nativo, componentes `View`, `ScrollView`, `Text`, `TouchableOpacity`, `TextInput` e iconos Expo; sin WebView.
- Inicio con 4 KPI, estados visuales, barras de progreso, listado de OT, actividad reciente, búsqueda y accesos rápidos.
- Cinco destinos con navegación propia y pantallas informativas para módulos futuros.
- Configuración Expo Android explícita; perfil `preview` en `eas.json` dispuesto para APK, pendiente firma, generación e instalación.
- Verificación TypeScript/estructura automática incorporada al workflow GitHub Actions.

## Límites críticos

1. Los datos son ficticios y se advierte DEMO. Ninguna acción representa guardado o envío real.
2. **No afirmar APK generada**; solo existe código y configuración `preview`.
3. **No afirmar experiencia móvil validada** hasta revisar físicamente Android e iPhone.
4. Supabase SaaS, seguridad RLS, plantillas e informes reales están pendientes.
5. Mantener ramas, repositorio, Render y Supabase originales; sin utilizar Codex ni migraciones.

## Próxima secuencia

- Verificar PASS de ambos jobs CI (web + Android).
- Comprobar nuevo despliegue `live` en Render.
- Revisar UI, corregir hallazgos y preparar entrega APK cuando se autorice conexión EAS.
- Obtener aprobación de Inicio antes de avanzar en paneles operativos y datos.

## Evidencia técnica de cierre BT-UI-01

- GitHub Actions run **#43113368311 SUCCESS**: jobs Web / iOS PWA y Android React Native / Expo.
- **Web/iOS PWA:** TypeScript PASS, 2 archivos de test PASS, **7 pruebas PASS**, build Vite PASS y verificación de PWA PASS.
- **Android nativa:** npm install PASS, TypeScript PASS, Expo install --check PASS, export bundle Android PASS (**601 módulos**), verificación de perfil APK PASS.
- **Render:** https://biomotors-taller-demo.onrender.com confirmó estado **live** sobre el commit 4a106710.
- **APK no generada:** bundle Expo y configuración EAS no equivalen a APK firmado ni prueba en dispositivo físico.
- **Revisión visual y prueba física:** pendientes de aprobación del usuario.
