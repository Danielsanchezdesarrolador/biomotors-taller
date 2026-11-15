/**
 * ByteTorque R2-A6-P6: post-auth service request policy, OFFLINE candidate.
 *
 * IMPORTANT: This module DOES NOT authenticate keys. It is only invoked AFTER
 * the official @supabase/server withSupabase({ auth: 'secret:bytetorque-worker' })
 * successfully authenticates a *named* service key from the apikey header.
 * Do not expose this policy as a standalone endpoint or use auth: 'none'.
 *
 * The currently deployed/not-deployed entrypoint index.ts is UNCHANGED:
 * verify_jwt=true and unconditional 503. No DB, Resend, logging, cron.
 */
export const WORKER_NAMED_AUTH = 'secret:bytetorque-worker' as const

const headers = Object.freeze({
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff'
})

function reply(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status, headers
  })
}

/**
 * An authenticated service call has no body/tenant/actor/target to inject.
 * Never rely on Origin or header checks for authentication. No CORS allowance.
 * Do not consume potentially large request bodies.
 */
export function rejectInvalidMachineWorkerRequest(req: Request): Response | null {
  if (req.method !== 'POST')
    return reply(405, 'Método no permitido.')
  if (req.headers.has('origin') || req.headers.has('authorization'))
    return reply(403, 'Solicitud de servicio no permitida.')
  // Content-length cannot be trusted alone. Disallow ANY body stream as well.
  if (req.body !== null ||
      (req.headers.has('content-length') &&
       req.headers.get('content-length') !== '0'))
    return reply(413, 'El trabajador no acepta contenido.')
  return null
}

/** Always OFF, including calls authenticated with the real named service key. */
export function dormantAuthenticatedWorkerCandidate(req: Request): Response {
  const denied = rejectInvalidMachineWorkerRequest(req)
  if (denied) return denied
  return reply(503, 'El trabajador de invitaciones todavía no está habilitado.')
}
