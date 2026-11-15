// ByteTorque R2-A2 — Borrador de endpoint de aceptación.
// NO DESPLEGADO. Debe permanecer cerrado hasta activar el pipeline completo:
// verificación Auth getUser, email confirmado, limitación de intentos y RPC.
// Ningún endpoint debe recibir el correo, rol ni identidad del cliente.
import { parseAcceptMechanicInviteRequest } from '../_shared/mechanicInviteToken.ts'

const origins = new Set([
  'https://biomotors-taller-demo.onrender.com',
  'http://localhost:5173'
])
const json = (status: number, error: string, extra: Record<string, string>) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...extra
    }
  })
Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const headers: Record<string, string> = { vary: 'Origin' }
  if (origin && !origins.has(origin))
    return json(403, 'Origen no autorizado.', headers)
  if (origin) {
    headers['access-control-allow-origin'] = origin
    headers['access-control-allow-methods'] = 'POST, OPTIONS'
    headers['access-control-allow-headers'] = 'authorization, apikey, content-type, x-client-info'
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'POST') return json(405, 'Método no permitido.', headers)
  if (Deno.env.get('BYTETORQUE_MECHANIC_ACCEPT_ENABLED') !== 'true')
    return json(503, 'La aceptación de invitaciones aún está en preparación.', headers)
  if (!/^Bearer\s+\S+$/i.test(request.headers.get('authorization') || ''))
    return json(401, 'Inicia sesión para aceptar una invitación.', headers)
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json'))
    return json(415, 'Se requiere JSON.', headers)
  let input: unknown
  try {
    const raw = await request.text()
    if (raw.length > 256) return json(413, 'Solicitud demasiado extensa.', headers)
    input = JSON.parse(raw)
  } catch {
    return json(400, 'Solicitud inválida.', headers)
  }
  if (!parseAcceptMechanicInviteRequest(input))
    return json(422, 'Formato de invitación inválido.', headers)

  // BLOQUEO INCONDICIONAL, incluso con bandera true. La RPC candidata
  // no está aplicada. En la implementación futura: verificar JWT contra
  // Auth y correo confirmado, hashear token en servidor, limitar intentos
  // por identidad/IP y llamar a la RPC service_role (nunca desde navegador).
  // Prohibido imprimir token/JWT/email o retornarlos en mensajes de error.
  return json(503, 'El proceso de validación todavía no está habilitado.', headers)
})
