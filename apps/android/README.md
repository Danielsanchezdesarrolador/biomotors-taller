# ByteTorque — Aplicación Android nativa

Cliente Android **React Native + Expo**, no WebView ni PWA. Comparte la futura base Supabase multitenant con la PWA Safari/web, pero tiene interfaz y navegación nativas.

## Estado BT-UI-01

- Inicio visual nativo con resumen, órdenes, estados, búsqueda de muestras, actividad, accesos rápidos y navegación.
- Datos fijos **100 % ficticios**. No guarda información, no envía correos, no implementa Supabase ni autenticación.
- App y documentación disponibles en `apps/android/`; **APK real, firma e instalación física aún no generadas ni verificadas**.
- Logo/icono nativos definitivos pendientes del Director de Arte.

## Ejecución local

Requiere Node.js 22.13+, npm y ambiente Expo configurado.

```sh
cd apps/android
npm install
npm run typecheck
npx expo start --android
```

Para comprobar el diseño en Expo Go o emulador, usar el proyecto Android desde este directorio, sin involucrar la academia.

## Futuro APK instalable

EAS permite generar APK mediante el perfil `preview` ya configurado en `eas.json`:

```sh
cd apps/android
npx eas-cli build --platform android --profile preview
```

Este comando **requiere** conexión a Expo, permisos, registro de credenciales de firma y aprobación humana cuando sea el momento. Todavía **no se ha ejecutado** ni existe un APK descargable. No publicar OTA, AAB ni Google Play sin autorización.

**Paquete temporal de demostración:** `cl.bytetorque.demo`; revisar identificador e icono antes de distribución comercial.

## Metodología BT-UI-02 (web primero)

La nueva propuesta premium del Inicio se desarrolla primero en la web Render y PWA iOS. Este cliente Android nativo **sigue momentáneamente con el diseño BT-UI-01** hasta que el usuario apruebe la versión web. Después se portarán pantallas y estilos a componentes React Native auténticos y recién al cierre se generará una APK firmada para pruebas físicas. Mantener `apps/android/` y no reemplazar por WebView o PWA.


## BT-BRAND-01 — recursos preparados (14/11/2026)

`assets/brand/` contiene icono PNG 1024, foreground adaptativo con padding seguro y logotipo horizontal PNG. `app.json` prepara icono, adaptiveIcon y splash reutilizando el mismo icono; el encabezado nativo usa el horizontal con soporte blanco y `resizeMode="contain"`. La única modificación nativa visible es la marca; el prototipo funcional previo se conserva y no se ha portado el flujo web ni implementado Auth.

`npm run verify-config` comprueba hashes/dimensiones y vínculos a los recursos definitivos de `../../assets/brand/manifest.json`. TypeScript, `expo config` y export del bundle Android se verifican sin generar APK. En el entorno restringido se usó `EXPO_HOME=/tmp/bt-brand-expo-state EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 CI=1` para la exportación; no se escriben credenciales ni configuración en el home del usuario. El export no equivale a APK firmada/instalada. Originales y reproducción: [assets de marca](../../assets/brand/README.md).
