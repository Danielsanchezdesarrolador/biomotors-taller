# BT-AUTH-01B-R1 — Configuración pública y validación controlada

Fecha: 14/11/2026. Proyecto exclusivo: `biomotors-taller`, referencia `suxcqqnmcjoezfxltoms`.

## Estado entregado

La integración está implementada, pero **apagada por defecto**. Publicar el código no activa el login real. Sin flag/configuración válidos no se carga ni se ejecuta el SDK, no se consulta Supabase y el formulario queda inactivo. Las tres rutas `/#/revision/administrador`, `/#/revision/mecanico`, `/#/revision/publica` conservan su presentación DEMO de solo lectura.

No se han configurado credenciales, creado usuarios, enviado correos ni modificado Supabase. La prueba A/B anterior del Director no equivale a una prueba de extremo a extremo de esta integración.

## Variables del Render Static Site existente

| Variable pública de build | Valor / origen | Estado inicial |
| --- | --- | --- |
| `VITE_BT_AUTH_R1_ENABLED` | `false`; solo la cadena exacta `true` habilita la integración | Apagado |
| `VITE_SUPABASE_URL` | `https://suxcqqnmcjoezfxltoms.supabase.co` | Puede dejarse vacía mientras está apagado |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Únicamente la Publishable key del proyecto, con prefijo `sb_publishable_` | Vacía; sin clave versionada |

Todas las variables `VITE_` son públicas y quedan disponibles en el bundle. **Nunca introducir Secret key, `service_role`, JWT de usuario, contraseñas o secretos SMTP.** La configuración de build rechaza claves antiguas, claves secretas y nombres de variables públicas reservados a secretos, sin imprimir sus valores.

Después de la aprobación del Director:

1. En el **servicio Render actual**, abrir Environment y configurar las tres variables anteriores desde la configuración del proyecto autorizado. No crear otro servicio ni cambiar URLs de Supabase.
2. Mantener inicialmente el flag en `false`, reconstruir y verificar que `/` abre `/#/acceso`, los inputs están inactivos y las revisiones DEMO siguen disponibles.
3. Verificar en Supabase que el registro público continúa apagado. No habilitar onboarding, SMTP, recuperación ni invitaciones. Utilizar solo cuentas de prueba gestionadas por el Director, con correo confirmado y membresías autorizadas existentes.
4. Tras autorización expresa para la ventana controlada, establecer `VITE_BT_AUTH_R1_ENABLED=true` y reconstruir el mismo sitio. Vite sustituye las variables **durante el build**; cambiar Environment sin reconstrucción no cambia el frontend ya servido.
5. Ejecutar la lista de validación real siguiente y revisar evidencia antes de declarar el login disponible al público.
6. Para apagar la integración, fijar `false` y reconstruir. Esto bloquea la entrada del frontend; no representa revocación global de tokens ya emitidos.

No introducir la clave en mensajes, capturas, archivos o argumentos de consola. `.env.example` contiene solamente nombres y campos vacíos.

## Comportamiento y límites de R1

- `getSession` solo detecta una sesión candidata. `getUser` verifica la identidad en Auth; se exige `email_confirmed_at`. Después se consultan por RLS las membresías del usuario con `status=active` y los talleres activos correspondientes.
- `owner/admin`: identidad del taller verificada y cinco paneles vacíos; ninguna operación real de clientes, OT, documentos, usuarios o planes. `mechanic`: únicamente espacio técnico vacío. `reception`: acceso restringido pendiente de definición. El selector de entrada nunca concede roles.
- Varios talleres: selección explícita y nueva lectura de identidad/membresías. No se consume un taller desde URL o query. Una selección ya revocada se rechaza.
- Cada recuperación, evento de sesión, vuelta a foco, visibilidad y reconexión vuelve a comprobar autorización. Se retira el contexto privado antes de consultar; respuestas tardías después de logout/cambio de sesión no lo restauran.
- La sesión la persiste únicamente Supabase JS 2.119.0. No se guarda la contraseña ni un permiso/membresía local. La interfaz declara la persistencia de sesión del SDK; no promete un modo «Recordarme» distinto que no exista.
- `signOut({scope:'local'})` elimina primero la sesión de este dispositivo mediante el SDK y solicita revocación de su refresh token. Si falla la red, se mantiene bloqueado el contexto y se informa que no se confirmó el cierre en el servidor. No cierra todos los dispositivos ni promete revocar inmediatamente los access tokens ya emitidos.
- Peticiones limitadas a 12 segundos por intento; red no disponible bloquea el acceso. El SDK puede reintentar renovaciones. Sus callbacks de sesión no esperan llamadas SDK bajo el lock de Auth.
- `detectSessionInUrl=false`: registro, recuperación, verificación, magic links e invitaciones son pantallas de revisión, no ejecutan operaciones Auth. R1 no procesa tokens recibidos en enlaces.
- El service worker permanece sin handler de fetch ni caché de API, tokens o documentos. La prueba de PWA en Chromium no sustituye Safari/iPhone físico.
- RLS sigue siendo la autoridad del servidor; el estado React y el flag son controles de presentación, no nuevas políticas. No se añadieron permisos de datos operativos ni asignaciones de OT.

## Validación real pendiente del Director

Con cuentas controladas, nunca clientes reales: contraseña incorrecta; correo sin confirmar; ausencia y desactivación de membresía; owner/admin de A y B; consulta cruzada por UUID; mecánico intentando entrada administrativa; recepción restringida; dos talleres legítimos y revocación de una selección; refresh/recarga/multiventana; revocación de sesión y logout sin red; foco/reconexión; PWA instalada y Safari/iPhone físico. Verificar que no se ejecutaron escrituras operativas ni correos y que los permisos realmente los aplica RLS.

Las pruebas automatizadas nuevas utilizan stubs de SDK o respuestas HTTP interceptadas con identidades sintéticas. **No certifican Auth ni RLS reales.** No ejecutar el script A/B privilegiado ni crear cuentas durante build/CI. No comenzar R2, correo o backend operativo por completar esta lista.
