/**
 * ByteTorque BT-AUTH-R2-A4 — trusted Auth preflight for mechanic invitations.
 * No role is inferred here: SQL validates membership and workshop separately.
 * No service key, RPC, emails or mutable side effects in this module.
 * The hosted Auth endpoint is pinned: the caller cannot supply a URL.
 */
export type VerifiedInviteActor = Readonly<{ userId: string; confirmedEmail: string }>
export type VerifyInviteActorResult =
  | Readonly<{ ok: true; actor: VerifiedInviteActor }>
  | Readonly<{ ok: false; status: 401 | 403 | 503; message: string }>

export const INVITE_AUTH_ORIGIN = 'https://suxcqqnmcjoezfxltoms.supabase.co'
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const bearer = /^Bearer ([A-Za-z0-9._~-]{8,8192})$/
const unauthorized = { ok: false, status: 401, message: 'Sesión inválida o vencida.' } as const
const unconfirmed = { ok: false, status: 403, message: 'Se requiere una cuenta con correo confirmado.' } as const
const unavailable = { ok: false, status: 503, message: 'No se pudo verificar la sesión.' } as const

export async function verifyInviteActor(
  authorization: string | null,
  config: { baseUrl?: string | null; publicKey?: string | null },
  requestFetch: typeof fetch = fetch
): Promise<VerifyInviteActorResult> {
  // Do not take URLs, identity or API keys from the request payload.
  if (config.baseUrl?.replace(/\/$/, '') !== INVITE_AUTH_ORIGIN ||
      !config.publicKey?.trim()) return unavailable
  if (!authorization || !bearer.test(authorization)) return unauthorized
  try {
    const result = await requestFetch(INVITE_AUTH_ORIGIN + '/auth/v1/user', {
      method: 'GET',
      headers: {
        apikey: config.publicKey,
        authorization,
        accept: 'application/json'
      },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
      redirect: 'error'
    })
    if (result.status === 401 || result.status === 403 || result.status === 404)
      return unauthorized
    if (!result.ok) return unavailable
    const raw: unknown = await result.json()
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return unauthorized
    const user = raw as Record<string, unknown>
    if (typeof user.id !== 'string' || !uuid.test(user.id)) return unauthorized
    if (user.is_anonymous === true) return unconfirmed
    if (typeof user.email !== 'string') return unconfirmed
    const confirmedEmail = user.email.trim().toLowerCase()
    if (confirmedEmail.length > 254 || !email.test(confirmedEmail)) return unconfirmed
    if (typeof user.email_confirmed_at !== 'string' ||
        !Number.isFinite(Date.parse(user.email_confirmed_at)))
      return unconfirmed
    // Never inspect raw_user_meta_data, user_metadata, selected role or plan.
    return { ok: true, actor: { userId: user.id.toLowerCase(), confirmedEmail } }
  } catch {
    // No token, headers or PII in logs or HTTP errors, including timeouts.
    return unavailable
  }
}
