# ByteTorque — Checkpoint BT-AUTH-R2-A6-P4 · Creador seguro de invitaciones (candidato)

**Fecha:** 15/11/2026, Chile. **Repositorio:** `Danielsanchezdesarrolador/biomotors-taller` · **única rama:** `main`.

## Continuidad verificada

- Baseline P3: `f6ea931496014cd6519fc8a366f72e986aa3330a`, CI principal SUCCESS.
- Implementación P4: [`106a5e8`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/106a5e8e81c75b994155d66b910e2cc635c381a3).
- Corrección tras CI: [`99765bb`](https://github.com/Danielsanchezdesarrolador/biomotors-taller/commit/99765bbf11c863d7a38298ffe2e6083804e231d9). Fallo original: patrón de UUID sin el cuarto segmento; cinco pruebas positivas fallaron porque el candidato rechazaba incluso UUID válidos. Corregida la expresión y reejecutado el CI, sin modificar SQL ni hospedado.
- Este checkpoint es de **código de servidor candidato y simulaciones**, NO de funcionalidades productivas. No se crea función activa ni se abre registro.

## Implementación

1. `supabase/functions/_shared/invitationIssueCandidate.ts`: nuevo creador **solo backend, sin cliente de red/DB**. Recibe identidad `VerifiedInviteActor` previamente validada por Auth (deberá obtenerla un futuro endpoint seguro), petición limitada a `workshop_id/email` y dependencias de consulta de taller y RPC inyectadas.
2. Rechaza datos de rol, plan, actor, token, remitente o nombre del taller procedentes del navegador. Valida ID del actor, email confirmado/sanitizado y workshop activo del ID solicitado. El taller y el remitente deben proceder de fuentes confiables del backend; estos prechecks **NO sustituyen** comprobación SQL de rol, taller, cupo, rate limit ni permiso del actor.
3. Genera un token de 256 bits; define expiración 24 horas; crea sobre AES-256-GCM **V3** que contiene el HTTP JSON inmutable y el token encriptado. Reabre y comprueba el sobre en memoria **antes** de ejecutar la reserva atómica.
4. Prepara exactamente los siete parámetros que espera `public.bt_r2_reserve_and_queue_mechanic_invite`: `p_actor_user_id`, `p_workshop_id`, `p_email`, `p_token_sha256_hex`, `p_expires_at`, `p_ciphertext_hex`, `p_nonce_hex`. Llama a la RPC inyectada **una vez**, sin guardar token sin cifrar ni enviar correo. La RPC candidata existente maneja reserva + cola en **una transacción PostgreSQL**; ni el módulo ni la simulación están conectados a Supabase real.
5. El resultado expone únicamente `queued + invitationId` tras respuesta válida de DB; `denied` para fallos de preflight y `unknown` para errores o respuesta ambigua de RPC/DB. **No reintenta automáticamente** tras una caída que pueda ocurrir después del commit y antes de recibir respuesta. No incluye token, email, header Authorization, cipher ni detalles de excepciones en el resultado.
6. `src/auth/invitationIssueCandidate.test.ts`: diez pruebas nuevas con fixtures sintéticos, sin usuarios/correos reales: éxito y comprobación por descifrado, estructura exacta de RPC, inyección de privilegios rechazada, taller ajeno/suspendido, actor inválido, errores de cifrado/remitente/fecha, consulta DB fallida, fallo tras commit, respuesta SQL inesperada y límites de cupos. Se conservan pruebas previas.
7. `.github/workflows/bt-auth-r2-edge-check.yml`: `deno check` del nuevo módulo. `.github/workflows/bt-auth-r2-postgres-lab.yml` ya corre ante cambios en `_shared` y revalida SQL/lease.

## Verificación CI (ejecución real)

- [CI final web/PWA y Android #43672523385](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43672523385) — **SUCCESS**: TypeScript, 39 archivos y **365/365 Vitest PASS**, web/PWA build y checks de assets/identidad; TypeScript/Expo/Android bundle y config PASS, **no APK generado**.
- [PostgreSQL 17 aislado #43672523397](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43672523397) — **SUCCESS** con candidatos SQL, atomicidad, RLS, revocación, limpieza, `SKIP LOCKED`, concurrent claims, cupos y 23 h de idempotencia.
- [Deno Edge offline #43672523398](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43672523398) — **SUCCESS**, solo comprobación de tipos. NO desplegado.
- Fallo intermedio en `106a5e8` documentado: [CI #43672434552](https://github.com/Danielsanchezdesarrolador/biomotors-taller/actions/runs/43672434552) FAIL en las pruebas positivas por formato UUID. Corregido en `99765bb`. El primer intento PostgreSQL/Deno había sido SUCCESS.

## Estado hospedado (solo lectura)

- Supabase proyecto `suxcqqnmcjoezfxltoms`: **2 talleres, 4 usuarios Auth, 4 membresías, 0 tablas `bt_private`**. No se aplicó SQL real, ninguna cuenta o permiso se modificó.
- Edge Functions alojadas: únicamente `bt-owner-onboarding` preexistente, sin funciones de invitación desplegadas.
- Endpoints de invitar/aceptar/revocar y worker interno continúan sin operación productiva; no hubo HTTP Resend, correos, cambios visuales, secretos, pagos ni deploy manual. Los push a `main` pueden activar otras verificaciones/despliegues automáticos: su estado se controla separadamente.

## Siguiente puerta de seguridad

1. Terminar **control de autenticación máquina-a-máquina** antes del worker operativo. La documentación Supabase de octubre de 2026 describe `withSupabase` y `auth: 'secret'` para servidores; evaluar en entorno aislado, con `verify_jwt` coherente y secreto backend, no abrir endpoint de servicio solo por tener CORS/JWT de usuario. [Referencia](https://supabase.com/docs/guides/functions/auth).
2. **Aprobación específica del Director** antes de cuenta/dominio/API real Resend, gastos, despliegue, actualización de config, secret manager, migraciones hospedadas o envío E2E incluso de prueba.
3. Cuando sea autorizado, instalar candidatos mediante plan de migraciones y probar **realmente la integración DB-RPC** con Auth y RLS; ahora el creador está probado con RPC simulada y SQL ensayado por separado, no juntos.
4. Completar `R2-A6-6` aceptación segura con email Auth confirmado y token único, control por IP/actor, UI iPhone/Android, expiración, revocación y auditoría sin secretos. Continuar con la estrategia SaaS multiempresa y protección de datos.

**Estado:** P4 **completado como candidato offline probado**; activación de invitaciones y proveedor externo **pendientes**, sin autorización implícita.
