// ByteTorque R2-A2 — Endpoint de revocación, NO DESPLEGADO.
// Código de preparación: no escribe en Supabase aunque se active el flag.
import { parseRevokeMechanicInviteRequest } from '../_shared/mechanicInviteRequest.ts'
const allowedOrigins = new Set([
  'https://biomotors-taller-demo.onrender.com',
  'http://localhost:5173'
])
function fail(status: number, reason: string, headers: Record<string, string>) {
  return new Response(JSON.stringify({ error: reason }), {
    status,
    headers: { ...headers, 'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
  })
}
Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  const headers: Record<string, string> = { vary: 'Origin' }
  if (origin && !allowedOrigins.has(origin))
    return fail(403, 'Origen no autorizado.', headers)
  if (origin) {
    headers['access-control-allow-origin'] = origin
    headers['access-control-allow-methods'] = 'POST, OPTIONS'
    headers['access-control-allow-headers'] = 'authorization, apikey, content-type, x-client-info'
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'POST') return fail(405, 'Método no permitido.', headers)
  if (Deno.env.get('BYTETORQUE_MECHANIC_REVOKE_ENABLED') !== 'true')
    return fail(503, 'La revocación de invitaciones está en preparación.', headers)
  if (!/^Bearer\s+\S+$/i.test(request.headers.get('authorization') || ''))
    return fail(401, 'Inicia sesión para continuar.', headers)
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json'))
    return fail(415, 'Se requiere JSON.', headers)
  let payload: unknown
  try {
    const body = await request.text()
    if (body.length > 256) return fail(413, 'Solicitud demasiado extensa.', headers)
    payload = JSON.parse(body)
  } catch {
    return fail(400, 'Solicitud inválida.', headers)
  }
  if (!parseRevokeMechanicInviteRequest(payload))
    return fail(422, 'Datos de revocación inválidos.', headers)

  // FAIL-CLOSED even when flag=true. Futuro backend: verificar Auth getUser
  // y rol owner/admin activo del mismo taller; usar RPC con service_role
  // exclusivamente después de los tests RLS/concurrencia y aprobación.
  return fail(503, 'El proceso de revocación todavía no está habilitado.', headers)
})
