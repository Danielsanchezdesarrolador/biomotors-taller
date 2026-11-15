# ByteTorque — Checkpoint BT-AUTH-R2-A6-P2

**Fecha:** 15/11/2026, Chile. **Repositorio:** Danielsanchezdesarrolador/biomotors-taller. **Única rama:** main.  
**Estado:** código candidato y pruebas cerradas; SIN proveedor operando, SIN migraciones reales, SIN correo externo.

## Baseline y commits

HEAD inicial f570af826a99a0c1cad3f6627123eea2ff4e3888, coincidente con el checkpoint de R2-A6-P. Implementación: 9b38027bb13ef67bb2b1e74e017c38db721bb860. Pruebas nuevas: 0a7e58c9ead2a0a64322368d2b456c6a052244a6. Corrección de tipos de prueba: 4a7fd96d6e0890fe72ec83a5f26b5ecdbce72fea. El commit documental de cierre queda como el HEAD sucesor.

## Cambios de código verificados

- encryptedInviteEnvelope.ts: sobre AES-256-GCM versión 2 con contenido congelado **antes de la reserva y encolado atómicos**: workshopId, expiración, destinatario, remitente, token, asunto, texto y HTML renderizados una sola vez. AAD vinculado al taller, SHA-256 del token, nonce aleatorio y máximo de 8192 bytes de ciphertext. El token no está en texto claro en el outbox.
- inviteDeliveryAdapter.ts: el modo inmutable descifra y verifica identidad/contexto en cada intento sin volver a renderizar; clave estable bt-r2-invite:<outbox UUID>. Se conservan helpers v1 legacy para pruebas anteriores; el trabajador nuevo solo acepta v2.
- invitationEmailWorker.ts: integra despacho inmutable, mantiene verificación de taller activo, coincidencia de identificador, lease, revocación, cancelación y expiración. Si falla ack tras aceptación, devuelve ack-unknown, sin volver a marcar fallo.
- resendInviteCandidate.ts: construye POST JSON usando remitente congelado y lo compara con la identidad del remitente autorizado en servidor; si difieren, el envío queda bloqueado. No sustituye el remitente en reintentos.
- resendInviteTransportCandidate.ts: solo contrato HTTP por dependencias inyectadas; SIN fetch, SDK, variables de entorno, SMTP, credenciales reales ni envío. Maneja 2xx, 409 concurrente/invalid-idempotent, 429, 5xx, errores de conexión, timeout y respuesta tardía sin interpretar un HTTP tardío como ack confirmado.
- immutableInviteResend.test.ts y pruebas previas actualizadas: validación de ciphertext sin texto claro, cuerpo JSON y clave idénticos entre intentos aunque cambie el nombre de taller, errores del proveedor, ACK ambiguo y reintento, revocación, V1 rechazado, alteración y acceso cruzado. Workflows Deno y PG activados por cambios del worker.

## Evidencia verificable

- [CI web/PWA y Android 43670726953](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43670726953): **SUCCESS**. TypeScript web, **37 archivos / 351 tests Vitest PASS**, build y verificadores PWA, TypeScript Android, Expo install --check, bundle de exportación Android y verify-config. **No se creó APK**.
- [PostgreSQL 17 43670726963](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43670726963): **SUCCESS**. SQL candidato ejecutado SOLO en contenedor efímero: RLS, cuotas y reserva+outbox atómicos, FK entre talleres, tokens, borrado del ciphertext, revocación y reintentos, protección de 23 h, dos workers SKIP LOCKED y aceptación de uso único bajo concurrencia.
- [Deno 43670504426](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43670504426): **SUCCESS**, comprobación de módulos compartidos y rutas de Edge cerradas sin deploy.
- Fallo documentado: en el commit intermedio 0a7e58c la prueba nueva falló TypeScript TS2322 por una firma de mock más restrictiva que DeliveryProvider. Corregido con 4a7fd96; la repetición de CI web/Android quedó SUCCESS. Sin alteración funcional del proveedor ni los SQL.
- PostgreSQL aislado y simulaciones HTTP **NO demuestran entrega real ni idempotencia E2E de Resend**. El código original y el CI anterior fueron preservados.

## Supabase hospedado: solo lectura

Reconsultado el proyecto suxcqqnmcjoezfxltoms: 2 talleres, 4 usuarios Auth, 4 membresías y 0 tablas del esquema bt_private. No se realizaron escrituras, cambios de permisos, aplicación de SQL candidato ni despliegue de funciones. Los endpoints públicos de invitación permanecen cerrados 503. Render público, identidad visual, PWA y Android no recibieron cambios de presentación.

## Controles pendientes y limitaciones explícitas

- Resend recuerda claves de idempotencia durante 24 h; el corte de reintento a 23 h desde el primer claim queda conservado. Un HTTP aceptado no prueba recepción, y una revocación concurrente no puede recuperar un correo ya enviado al proveedor.
- El test comprueba body JSON idéntico entre reintentos bajo la misma versión del builder. Antes de un uso real deberá versionarse o fijarse la serialización entre despliegues mientras haya mensajes pendientes, deteniendo el envío ante divergencias, nunca utilizando misma clave con otro cuerpo.
- El futuro creador operativo **debe obtener desde backend** el remitente permitido y nombre del taller, congelar antes del RPC de reserva+outbox y no confiar en datos aportados por el navegador. Aún no se ejecuta ninguna invitación operativa.
- Pendientes: secret manager, dominio y sender real verificados, autenticación máquina-a-máquina, rotación de claves, registros de entrega/rebotes, auditoría de seguridad, protección de contraseñas filtradas, pruebas E2E controladas y aceptación real R2-A6-6.

## Próximo paso según roadmap

**Puerta del Director:** aprobar cuenta/dominio remitente Resend, costes y límites, credenciales exclusivamente backend y un primer envío a correo de prueba propio **en entorno aislado**, tras revisar controles finales. Luego completar aceptación de invitación con Auth confirmado, token efímero y RLS. Sin autorización, mantener bloqueados correos reales, migraciones alojadas, worker, endpoints, registro público y pagos.

ByteTorque permanece independiente de BIOMOTORS Academia y preparado para SaaS multiempresa.
