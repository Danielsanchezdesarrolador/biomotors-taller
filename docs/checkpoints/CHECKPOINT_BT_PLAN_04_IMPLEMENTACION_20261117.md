# ByteTorque — checkpoint consolidado issue #1

17/11/2026. Implementación progresiva de 04B/04C y preparación de 04D, sobre
main desde `73e6160af017c562b051dc690560d771d4275f8b`. Sin ramas ni nuevo Cloud,
Render o proyecto Supabase. Repositorio público temporal por autorización
expresa del propietario; no se cambió su visibilidad ni se añadieron secretos.

## Commits publicados

| Commit | Resultado |
|---|---|
| `8ec3237bac3baf81da38545aaae8961d423267c7` | 04B: alta única por licencia y sincronización auditada cuenta/taller |
| `8d7586a870748f2f04021109060fb273cb9e264a` | 04C: cuenta personal, taller, equipo, límites e integración técnica |
| `b5b30bb76dc1c4ae308a2700ca814f58f3128278` | Correcciones de navegación tras logout y edición durante carga inicial |
| `08e0d1a2ff62887329cdd317b9952bd47f3c3017` | 04D: ledger/firma apagados, branding privado, nuevas revisiones CP05 y pruebas |
| `e0b5b941a3720324514f52fc30866197e4816684` | Verificadores de navegador actualizados a PLAN04; excepción pública documentada |
| `a38ca1809ae3ca71b603a68fca254f4707350ed0` | Cambios de extras serializados con reservas de mecánicos |

Todos con `[skip render]`, push normal a origin/main, sin force. Este checkpoint
se publica en un commit solo documental posterior; el código validado es a38ca18.

## Resultados comprobados

- **621/621 tests Vitest, 71 archivos**, TypeScript, build público y build
  combinado 04A–04D/CP03–CP06: PASS. Marca original, exclusión de fixtures y PWA: PASS.
- PostgreSQL17 **local sin red**, JWT/sesiones sintéticos y tablas Storage
  simuladas: PASS en RLS/aislamiento, MFA, revocación, idempotencia, sincronización,
  2/8 sin pago individual, rotación/expiración/token reutilizado, downgrade,
  carrera por última plaza y por creación de taller, eventos/cupos/privacidad.
- Browser nuevo PLAN04 **HTTP mock** en 1440/390: PASS para Básico → Full →
  taller → perfil → invitación → logout → aceptación → CP04 mecánico. Token
  fuera de URL y Storage del navegador; sin desbordamiento horizontal.
- Regresiones existentes de acceso y CP04 **HTTP mock**: PASS en 1650,1440,768,
  390,375, incluidos reconexión, revocación, guardado/reintento y orden cerrada.
- [Verificación GitHub del último código, a38ca18](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44162550183):
  **SUCCESS Web/iOS PWA y Android**, incluido SQL local PLAN04 y build combinado.
  Android significa tipos/Expo/bundle/configuración; no APK firmada instalada.
- [CI visual, e0b5b94](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/44161863355):
  **SUCCESS** cinco paneles/acceso, CP04, WebKit Linux y build R1 con HTTP simulado.
  El frontend no cambió después de este commit. No equivale a Safari físico.
- El primer CI visual de 08e0d1a falló porque un verificador exigía los antiguos
  cupos Basic2/Plus8; corregido en e0b5b94 y comprobado de nuevo, sin relajar la
  comprobación de permisos ni cambiar la regla vigente.

Render conserva el servicio existente `srv-dbqe4quc6qcc73f275jg` y despliegue
`dep-dbua0ru1egvs73fulchg` **LIVE** en d83907f (04A). No hubo despliegue nuevo.
`VITE_BT_PLAN04_WORKSHOPS_ENABLED` sigue apagado; no se cambiaron variables Render.

## Operaciones no ejecutadas y siguiente autorización

No se instaló SQL alojado ni se cambiaron Auth/RLS/datos, DNS, Google OAuth,
respaldos o Storage reales. Sin cuenta ni concesión de Ignacio, Biomotors real,
SMTP, checkout o cobros. Sin exportación ni restauración. Los fixtures sintéticos
pertenecen exclusivamente al laboratorio local, cuyos contenedores se eliminaron.

**Pendiente real:** aprobación específica de migraciones aditivas 04B/04C,
Storage branding y extensión CP05, luego QA alojado aislado y activación del
nuevo gate. 04D puede esperar: no es requisito de Full manual del piloto y
permanece apagado incluso si se instala su candidato. No aplicar DROP como rollback.

Antes del piloto con clientes siguen siendo obligatorios respaldo integral con
recuperación comprobada, sesión/MFA real, aislamiento, iPhone PWA y Android físico.
Ignacio debe registrarse/confirmar por sí mismo; su Full permanente necesita
concesión autorizada del Creador después de verificar UUID, con motivo y AAL2.
Luego él crea Biomotors e incorpora sus dos mecánicos gratuitos (2/8).

La [matriz de implementación y secuencia exacta](../BT_PLAN_04_IMPLEMENTACION_20261117.md)
incluye archivos SQL, dependencias, flags, política de archivos privados,
contrato de billing, decisiones comerciales pendientes y reproducción de pruebas.
