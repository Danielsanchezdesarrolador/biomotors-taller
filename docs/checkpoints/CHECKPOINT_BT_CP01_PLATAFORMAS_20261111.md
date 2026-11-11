# BIOMOTORS TALLER — Checkpoint BT-CP01-PLATAFORMAS

**Fecha:** 11/11/2026. **Rama:** `main`.

## Corrección explícita del responsable técnico
- Android: APP NATIVA React Native + Expo con archivo APK directamente instalable, como Punto Fénix.
- iPhone/iOS: SOLO PWA Safari que se agrega a pantalla de inicio; sin costos de app iOS nativa.
- Web PC: navegador, mismo frontend que PWA iOS.
- Ambos clientes comparten datos y autenticación Supabase, RLS por taller.
- Se revoca la idea anterior de PWA para Android. Mantener los checkpoints históricos sin reescribirlos.

## Estado verificado
- Repo privado y web React/Vite en `main`.
- Demo web de Render creada y con despliegues `live`: https://biomotors-taller-demo.onrender.com
- CI TypeScript, pruebas y build web verificadas.
- Android React Native y APK todavía no creados; app iOS PWA no verificada en iPhone físico.
- Supabase backend y permisos RLS pendientes. Sin cobros ni datos reales.

## Próximos pasos
1. Crear `apps/android/` con cliente React Native + Expo real, sin romper la web existente.
2. Preparar perfil de APK y pruebas en Android.
3. Probar PWA en Safari iPhone de Ignacio.
4. Implementar Supabase común y reglas multiempresa con pruebas cruzadas.
