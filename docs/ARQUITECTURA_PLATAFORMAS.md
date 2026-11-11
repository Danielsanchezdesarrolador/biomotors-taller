# ByteTorque — Arquitectura de plataformas

**Producto comercial: ByteTorque.** Proyecto técnico `biomotors-taller`. **Decisión aprobada el 11/11/2026.** Reemplaza la estrategia previa de una PWA para Android e iOS.

## Android — APK NATIVA
React Native + Expo + TypeScript. Código Android en `apps/android/` del mismo repositorio (aún no creado). Distribución inicial mediante APK real firmado; no WebView ni PWA empaquetada, no Play Store por ahora. Configurar perfil EAS con `android.buildType: "apk"` y validar en Android físico. **No se ha generado una APK todavía**.

## iPhone/iOS — SOLO PWA
Frontend React + TypeScript + Vite existente en raíz, publicado en Render. Abrir en Safari y usar Compartir → Agregar a pantalla de inicio; no app nativa, no Apple Developer/TestFlight/App Store en esta etapa. **Instalación en iPhone real pendiente**.

## Web escritorio
Acceso al mismo frontend web que la PWA de iOS desde navegador HTTPS; no hay tercera aplicación independiente.

## Backend único
`Android Expo APK → Supabase biomotors-taller ← PWA iOS / web React Vite`.
Autenticación y datos comunes, aislados por `workshop_id` mediante RLS y membresías; los clientes de ambos sistemas nunca llevarán claves administrativas. PDFs, correo y pagos desde lógica segura de backend. No mezclar con BIOMOTORS Academia.

## Trabajo y validación
Preservar `main`, demo Render y checkpoints. ChatGPT realiza lo posible directamente, Codex solo para trabajo complejo/masivo, responsable técnico aprueba y prueba Android, Ignacio prueba Safari iPhone y lidera ventas. No afirmar Android terminado sin APK generada e instalada.

## Documentación oficial
- [Expo: generar APK para Android](https://docs.expo.dev/build-reference/apk/)
- [Apple: convertir sitio Safari en app de inicio](https://support.apple.com/es-lamr/guide/iphone/iphea86e5236/ios)
