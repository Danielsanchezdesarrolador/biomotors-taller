# SEC07 S4H - preparacion local y puerta de publicacion

22/11/2026. S4 integral PARCIAL. Este documento no autoriza conexiones, push, deploy, cambios de configuracion o migraciones.

## Correcciones locales

- AuthController.directoryClient captura la autoridad verificada y vuelve a compararla despues de resolver el SDK. Descarta la referencia si hubo logout, nueva autenticacion, revocacion observada o cambio de taller/rol; errores del proveedor no divulgan excepciones. No impide el uso de referencias ya entregadas ni revoca JWT. Identidad, membresias y RLS siguen siendo obligatorias.
- Onboarding agrega https://bytetorque.cl y https://www.bytetorque.cl a CORS exacto, conservando Render tecnico y localhost. No wildcard, cambio de flag, verify_jwt o RPC. CORS es politica del navegador, no autorizacion.
- Empaquetador CP05 portable previamente probado: solo salida nueva bajo temporal nativo, sin despliegue ni instalaciones automaticas. Candidato CP05 no activado.

## Verificacion reproducible

Desde la raiz de este clon, con Node 24.22.1:

```sh
node --test --test-reporter=dot scripts/security/s4h-security.test.mjs
```

24 casos nuevos PASS: 12 del controlador y 12 de CORS/handler. Baseline previo: 12 PASS/12 FAIL. Datos exclusivamente sinteticos; fetch sustituido por stub sin sockets. Los FAIL estaban repartidos entre la referencia tardia/error de cliente y CORS canonico. No son 12 vulnerabilidades diferentes. No se repitieron suites SQL, HTTP historicas o backups.

Deno no disponible: falta `deno check supabase/functions/bt-owner-onboarding/index.ts` y validacion nativa focalizada antes de autorizar despliegue Edge. Node transpila/ejecuta logica, no acredita runtime Deno, gateway ni produccion. No se instalo Deno. La prueba no valida criptografia JWT ni usa claves reales.

## JWT y logout: alcances

GoTrue v2.197.0 GET /user acepto en laboratorio un JWT firmado con clave sintetica de audiencia/issuer incorrectos. No demuestra falsificacion de firma ni version/configuracion remota actual. Envoy mitiga localmente; desplegar una frontera equivalente requiere decision y permiso separados. No insertar un parser de claims sin firma como supuesto reemplazo de verificacion.

Logout local bloquea UI y respuestas obsoletas. El JWT copiado puede seguir valido hasta exp; TTL inventariado 3600s. Revocacion remota inmediata necesita validacion de session_id por backend/RLS en operaciones sensibles o una politica de expiracion aprobada, con pruebas nuevas especificas. No se cambia ninguna de esas politicas aqui. RLS por membresia y planes sigue siendo frontera de datos.

Fuentes oficiales: [signOut](https://supabase.com/docs/reference/javascript/auth-signout), [sesiones](https://supabase.com/docs/guides/auth/sessions). No se afirma que un ajuste frontend revoque bearer/URLs firmadas.

## Conjunto minimo

Dos archivos funcionales, prueba nueva, tres archivos del empaquetador portable, este procedimiento y cuatro entradas sanitizadas de continuidad. Sin cambios de workflows, lockfile, flags, SQL, GRANT, RLS o infraestructura. La historia privada y los ejecutores de backup permanecen locales; nunca copiar directorios completos ni usar git add -A.

## Puerta main sin despliegue

1. Releer origin/main antes de cualquier publicacion y revisar diferencias exactas; si avanza, conservar cambios remotos y repetir solamente la revision afectada. No force push, nuevas ramas ni git merge automatico.
2. El propietario debe autorizar por separado poner Render Auto-Deploy en Off. Verificar Off por lectura antes del push y dejarlo Off hasta autorizacion de despliegue. After CI Checks Pass NO bloquea despliegues.
3. Verificar metadatos de hooks/webhooks/Apps que puedan disparar deploys. El conector disponible no expone su inventario: pendiente, no prueba de ausencia. No revelar URLs de deploy hooks ni tokens. No publicar mientras quede un disparador productivo sin controlar.
4. Los 15 workflows del main fueron revisados por eventos y referencias a scripts. Diez tienen push; para este conjunto corresponden ci.yml y bt-oficial-01.yml. Sin secrets ni comandos directos de despliegue encontrados en sus rutas examinadas; no es ejecucion CI ni garantia de servicios externos. Cinco workflows historicos son solo manuales; no ejecutar backups/Drive/diagnosticos productivos.
5. Mantener [skip render] en el commit final como segunda barrera, no [skip ci]. No confiar en marcadores contra deploy manual/API/Actions. No modificar workflows para eludir seguridad.
6. Revisar diff/allowlist/privacidad y obtener permiso para el push concreto. Despues, verificar que no aparezca deploy y que LIVE no cambie. Nunca habilitar auto-deploy automaticamente.

[Comportamiento oficial de Render](https://render.com/docs/deploys).

## S4 que sigue abierto

Recuperacion completa del servicio Auth/SMTP/Edge con parametros privados recuperables sin exponerlos; perfil global ampliado en runtime; validacion nativa Edge y aceptacion/mitigacion de riesgos JWT/logout. Storage actual inventariado vacio: no falta descargar archivos actuales. Seis policies/helper son propuesta futura, no condicion para fabricar PASS. TLS cliente verify-full PASS; enlaces internos gestionados no certificados. Respaldo solo PC no cubre perdida total del equipo. Estas limitaciones no impiden desarrollo funcional local autorizado.
