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
