// ByteTorque R2-A — Endpoint scaffold. NOT DEPLOYED, NOT OPERATIONAL.
// Deliberately refuses every invite: SQL candidate/acceptance/email delivery
// have not been approved or installed. Never accept client-supplied actor,
// plan, target role or token. When later implementing, verify user with Auth,
// then perform the quota/membership check ATOMICALLY in the database.
import { parseMechanicInviteRequest } from '../_shared/mechanicInviteRequest.ts'
import { verifyInviteActor } from '../_shared/verifiedInviteActor.ts'

const origins = new Set([
  'https://biomotors-taller-demo.onrender.com',
  'http://localhost:5173'
])
function response(status: number, error: string, headers: HeadersInit = {}) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers }
  })
}
Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const headers: Record<string, string> = { vary: 'Origin' }
  if (origin && !origins.has(origin)) {
    return response(403, 'Origen no autorizado.', headers)
  }
  if (origin) {
    headers['access-control-allow-origin'] = origin
    headers['access-control-allow-methods'] = 'POST, OPTIONS'
    headers['access-control-allow-headers'] = 'authorization, apikey, content-type, x-client-info'
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'POST') return response(405, 'Método no permitido.', headers)
  // Kill switch is independent of a mere code deployment.
  if (Deno.env.get('BYTETORQUE_MECHANIC_INVITES_ENABLED') !== 'true') {
    return response(503, 'Las invitaciones todavía no están habilitadas.', headers)
  }
  if (!/^Bearer\s+\S+$/i.test(request.headers.get('authorization') || '')) {
    return response(401, 'Debes iniciar sesión.', headers)
  }
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return response(415, 'Se requiere JSON.', headers)
  }
  let payload: unknown
  try {
    const raw = await request.text()
    if (raw.length > 1024) return response(413, 'Solicitud demasiado extensa.', headers)
    payload = JSON.parse(raw)
  } catch {
    return response(400, 'Solicitud inválida.', headers)
  }
  if (!parseMechanicInviteRequest(payload))
    return response(422, 'Datos de invitación inválidos.', headers)

  // Authenticate against live Supabase Auth, never trust submitted user/role.
  // This preflight is not the SQL membership/plan authorization boundary.
  const identity = await verifyInviteActor(request.headers.get('authorization'), {
    baseUrl: Deno.env.get('SUPABASE_URL'),
    publicKey: Deno.env.get('SUPABASE_ANON_KEY')
  })
  if (!identity.ok) return response(identity.status, identity.message, headers)

  // FAIL CLOSED even if someone flips the flag: do not reserve unusable tokens
  // before a one-time acceptance flow, verified email delivery, rate limits
  // and isolated SQL/API security tests have been implemented and approved.
  return response(503, 'La entrega y aceptación seguras aún están en preparación.', headers)
})
