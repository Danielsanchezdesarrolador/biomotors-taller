# BT-CP02-D — Alta segura de propietario y taller

**Fecha:** 12/11/2026 · **Proyecto:** Supabase `biomotors-taller` (`suxcqqnmcjoezfxltoms`).  
**Estado:** backend inicial aplicado; **registro de talleres cerrado por defecto**, sin Auth real conectado ni pruebas A/B completadas.

## Evidencia de cambios reales
- Migración Supabase `20261112150019_bt_cp02_d_atomic_owner_onboarding`: crea función `public.bootstrap_workshop_owner(uuid,text,text)`.
- La función es **SECURITY INVOKER** con `search_path` fijo. Verifica longitud de nombres (2–120); serializa reintentos con bloqueo asesor; crea taller, perfil y membresía propietaria **en una transacción**. Si existe un taller del que la cuenta ya es propietaria, devuelve el ID existente.
- Derechos SQL verificados: `anon` EXECUTE = false, `authenticated` = false, `service_role` = true.
- Edge Function `bt-owner-onboarding`, versión **1**, estado `ACTIVE`, `verify_jwt=true`, publicada en Supabase; verifica el JWT usando Auth y exige email confirmado.
- **Feature flag de seguridad:** si `BYTETORQUE_ONBOARDING_ENABLED` no es `true`, la función responde 503. No se ha habilitado la inscripción pública ni se ha conectado formulario alguno.
- Reutiliza los secretos provistos dentro de Supabase Edge, sin enviarlos al cliente; CORS limitado al Render existente y localhost.
- Supabase Security Advisor posterior: **0 alertas**. Las tres tablas `public` permanecen vacías y hay 0 usuarios Auth.

## Pruebas realizadas
- SQL ejecutado por migración, función presente, permisos efectivos consultados, Security Advisor sin alertas.
- Edge Function despliegue realizado y metadatos `ACTIVE` y `verify_jwt=true` confirmados; código fuente leído de Supabase.
- **No se ejecutó todavía prueba con dos usuarios Auth independientes** ni flujo de llamada real con correo verificado. No afirmar que el aislamiento A/B está probado.

## Pendientes bloqueantes
1. Crear dos usuarios de prueba mediante **API oficial Auth** (no insertar usuarios manualmente en `auth.users`).
2. Probar dos talleres A/B, token JWT real, lectura cruzada denegada, escritura/roles ajenos denegados; seguir `docs/BT_CP02_C_MATRIZ_PRUEBAS.md`.
3. Completar controles antiabuso, configuración de correo y redirects, test Safari iPhone.
4. Autorizar después el encendido del feature flag y la integración del login web.
5. No usar clientes ni trabajadores reales antes de aprobar la batería de seguridad.

## Invariantes
Los cinco paneles premium R2, Render y Android nativo **no fueron modificados**. No se activaron suscripciones, cobros, correos ni almacenamiento privado.

Fuentes: `docs/sql/applied/20261112150019_bt_cp02_d_atomic_owner_onboarding.sql`, `supabase/functions/bt-owner-onboarding/index.ts`, `docs/BT_CP02_D_RUNBOOK.md`.
