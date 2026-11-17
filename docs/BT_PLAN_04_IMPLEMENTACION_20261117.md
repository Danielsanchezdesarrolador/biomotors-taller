# BT-PLAN-04B/C/D — implementación y puerta de activación

17/11/2026 · Orden [issue #1](https://github.com/Danielsanchezdesarrolador/biomotors-taller/issues/1).
Base main `73e6160af017c562b051dc690560d771d4275f8b`. No reconstrucción ni ramas nuevas.

## Estado y evidencia por bloque

| Bloque | Implementación real en código | Evidencia ejecutada | Pendiente alojado |
|---|---|---|---|
| Cierre 04A | Inicio personal sin membresía, plan servidor, Creador independiente del rol de taller, descarte de respuestas antiguas | Vitest controlador/UI, RPC con identidades sintéticas y MFA AAL1/2 | QA con sesión TOTP real del propietario |
| 04B | RPC transaccional: una licencia → un taller propio, owner por Auth, perfil privado, sincronización auditada bidireccional de licencia y suscripción | PostgreSQL local: Basic denegado, reintento/payload, carrera de dos altas, conservación QA, aislamiento | Instalar SQL 04B con permiso específico |
| 04C | Lista de mecánicos, invitación/rotación/revocación/desactivación, aceptación por email confirmado, reservas y cupos Plus4/Full8 | PostgreSQL local: 2/8 sin pago personal, token reutilizado/rotado/expirado denegado, concurrencia última plaza, downgrade conserva equipo | SQL 04C y QA con correos/cuentas autorizadas |
| Identidad | Nombre/contactos/logo privado PNG/JPEG, máximo 2 MiB, reencodificado PNG hasta 1024 px; RLS de Storage y revisiones nuevas CP05 con marca capturada | Vitest PDF real A4 y logo sintético, política SQL simulada incluso con permiso previo amplio | Bucket/políticas y prueba Storage real autorizada |
| 04D | Handler servidor desacoplado, firma sobre bytes originales + timestamp, límite de cuerpo, ledger idempotente/ordenado, recibos, eventos y extras | HMAC sintético; SQL local verifica duplicados, monto, orden, cancelación/fallo, extras pagadas y protección del derecho manual | Elegir proveedor, contrato real de firma/versionado, conciliación y política comercial; todo apagado |
| CP04/05/06 | Se reutilizan directorio, OT/multipunto, cotizaciones e historial existentes; área del mecánico abre CP04 con su rol; nuevas revisiones capturan identidad comercial | Suite existente y builds combinados; no se reescriben operaciones ni revisiones históricas | Activación de documentos/correo y QA integral ya pendientes; no se autorizaron aquí |

La cuenta personal Básica dispone de información de plan, actualización de accesos y exploración pública. No se inventaron herramientas gratuitas de negocio ni se abrió un taller gratis. La compra pública y el trial con tarjeta no están habilitados.

## Archivos y contratos

- `src/auth/PersonalHome*`, `RealAccess`, controlador y panel Creador reutilizado.
- `src/workshops/*`: alta, gestión comercial/equipo, memoria de invitación, logo y área técnica.
- `docs/sql/BT_PLAN_04B_WORKSHOPS_CANDIDATE.sql`: actor con email confirmado y sesión Auth vigente; derechos personales → suscripción de taller, sin acceso global del Creador a clientes.
- `docs/sql/BT_PLAN_04C_MECHANICS_CANDIDATE.sql`: token aleatorio 256 bits, solo hash SHA-256 persistido, 48 h, un uso/correo, cupos activos + reservas y límite de emisión. El token en navegador dura hasta 5 minutos, se elimina al ocultar/salir/desconectar; se debe pedir uno nuevo si se pierde. No se envía email automático.
- `docs/sql/BT_PLAN_04B_BRANDING_STORAGE_CANDIDATE.sql`: bucket privado nuevo y guardas restrictivas, sin modificar otros buckets. Objetos inmutables; sin UPDATE/DELETE de usuarios. Versiones antiguas conservadas; limpieza/retención requiere procedimiento posterior autorizado.
- `docs/sql/BT_PLAN_04_CP05_BRANDING_CANDIDATE.sql`: extiende la reserva inmutable de nuevas emisiones; no altera PDFs archivados. Descarga del logo por SDK del usuario/RLS, ruta tenant fija y PNG/tamaño/dimensiones comprobados; falla cerrada si no puede verificarse.
- `server/billing/*` y `docs/sql/BT_PLAN_04D_BILLING_CANDIDATE.sql`: sin SDK de pagos, endpoint desplegado, secretos, tarjetas, email o llamadas de cobro. Adaptador HMAC es ejemplo de contrato normalizado, no integración terminada con una pasarela. Mapeo cliente/suscripción/persona solo de backend aprobado; `service_role` nunca en navegador. Doble cierre: handler apagado y control SQL `enabled=false`.

Plus 5 mecánicos = USD 7; Full 9 = USD 17 netos antes de impuestos/comisiones. Full manual permanente mantiene base USD 0; extras se pagan solo si se contratan. Dueño/admin no ocupan plazas. Máximo de extras sin definir ⇒ cualquier alta de extras bloqueada hasta configurar política autorizada. Cancelación/fallo no elimina el período pagado; expiración/reembolso de licencia comercial revoca acceso premium sin borrar datos. Una concesión manual vigente no se reemplaza con eventos de billing; extras pagadas pueden expirar sin perder la base manual.

No hay checkout, impuesto calculado, factura tributaria ni prueba Full 72h activa. Quedan por aprobar prorrateo, zona/ciclo, tratamiento de cancelaciones/reembolsos parciales, impuestos/comisiones y máximo absoluto. Conciliación requiere obtener y autenticar el estado real del proveedor en backend, nunca un estado enviado por la PWA.

## Reproducción segura

1. `npm run typecheck` y `npm test` (sin credenciales).
2. `npm run build`: grafo público oficial, identidad PWA/brand y exclusión de fixtures/módulos candidatos.
3. Build combinado con `VITE_BT_AUTH_R1_ENABLED`, `VITE_BT_CREATOR_PRIVATE_ENABLED`, `VITE_BT_PLAN04_PRIVATE_ENABLED`, `VITE_BT_PLAN04_WORKSHOPS_ENABLED`, `VITE_BT_CP03_PRIVATE_ENABLED`, `VITE_BT_CP04_PRIVATE_ENABLED`, `VITE_BT_CP05_PRIVATE_ENABLED`, `VITE_BT_CP06_PRIVATE_ENABLED` a `true`; URL del proyecto y clave ficticia `sb_publishable_build_only`. No publicar este build como activación.
4. `bash scripts/security/verify-plan04-local.sh`: imagen oficial PostgreSQL17 en contenedor local sin red; instala baseline CP02–05/Creator/04A y candidatos, usa fixtures sintéticos y destruye su contenedor al salir. No conecta Supabase. Storage es una simulación de tablas/políticas SQL, no prueba del servicio de objetos.
5. Sobre preview loopback del build combinado: `OUTPUT_DIR=/tmp/bt-plan04-ui node scripts/verify-plan04-ui.cjs` (Playwright disponible en entorno). Intercepta todo HTTP de Supabase; ningún byte llega al proyecto. Capturas 1440/390 para cuenta, configuración y mecánico, sin datos reales. No equivale a prueba física Safari/Android ni Auth real.

CI existente se amplía para el laboratorio SQL y build combinado, sin nuevo workflow ni secretos. No hay ESLint configurado en package.json. Los tests de respaldos existentes permanecen intactos.

## Secuencia que necesita autorización específica

1. Completar/verificar respaldo integral cifrado y restauración (Auth/roles/Storage además de datos). Este trabajo **no** ejecuta exportación ni restauración y no declara suficiente una copia parcial.
2. Autorizar explícitamente instalación aditiva en proyecto `suxcqqnmcjoezfxltoms`, revisando catálogo y compatibilidad de `auth.sessions`, pgcrypto, Storage/políticas existentes y SQL CP05 aplicado. Orden: 04B → 04C → branding Storage → branding CP05. 04D puede instalarse separadamente, manteniendo control apagado; no es necesario para Full manual del piloto.
3. Pruebas alojadas autorizadas con cuentas QA: sesión/revocación, MFA real, dos talleres, negativos RLS, capacidad/concurrencia, imagen privada y nuevo PDF/historial. No borrar/restablecer ni tocar QA previos para estas pruebas.
4. Solo tras ese permiso y QA, activar `VITE_BT_PLAN04_WORKSHOPS_ENABLED=true` junto a los flags Auth/04A/CP03 existentes en el **mismo** Render. Cambiar flags requiere despliegue coordinado; no se hizo aquí. Desactivar el nuevo gate revierte exposición UI, no elimina esquema/datos; no revertir con DROP.
5. Ignacio se registra personalmente y confirma correo. Después de autorización concreta, Creador con MFA busca y verifica UUID, concede Full permanente con motivo/request-id. Ignacio crea Biomotors; sus dos mecánicos se registran/confirman y aceptan sus invitaciones (2/8). No reutilizar QA A/B ni crear identidades en nombre de terceros.
6. Probar operación CP03/CP04/CP05/CP06 end-to-end en iPhone PWA y Android real. Autorizar separadamente archivado/envío único si siguen apagados; revisar recuperación antes de ingresar datos de clientes.

## Publicación y límites comprobados

El propietario autorizó expresamente mantener el repositorio público **temporalmente** tras comprobar la discrepancia de visibilidad. No se cambió la visibilidad ni se añadieron secretos/datos de usuarios. Commits en main con `[skip render]`, sin instalar SQL ni activar flags, SMTP o pagos. No se modifican DNS, OAuth ni scripts de respaldo.

Render existente leído: `srv-dbqe4quc6qcc73f275jg`, main, autoDeploy activo; último despliegue observado `dep-dbua0ru1egvs73fulchg` LIVE en `d83907f60e1d5067fa9acfdca491bc4f3d909d2f` (04A). El código candidato nuevo **no está activo** en producción. CI remoto, publicación de commits y resultados finales se registran en el checkpoint de cierre; una prueba local PASS no implica CI remoto PASS.
