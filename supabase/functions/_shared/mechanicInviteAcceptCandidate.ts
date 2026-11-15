/**
 * ByteTorque R2-A6-6 · server-side invitation acceptance coordinator, OFFLINE.
 * No network, Supabase client, Auth impersonation, endpoints or deployments.
 *
 * A FUTURE trusted handler MUST use verifyInviteActor(getUser) to obtain
 * VerifiedInviteActor from the user's valid session and confirmed email.
 * A backend-only service_role SQL RPC is the sole authority for tenant,
 * invitation status, expiration, seat quota, replay and membership writes.
 * Never expose the original token, its digest, JWT, actor, email or SQL errors.
 */
import {
  hashMechanicInviteToken, parseAcceptMechanicInviteRequest
} from './mechanicInviteToken.ts'
import type { VerifiedInviteActor } from './verifiedInviteActor.ts'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const email = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/

export type AcceptMechanicInviteArgs = Readonly<{
  p_verified_user_id: string
  p_verified_email: string
  p_token_sha256_hex: string
}>
export type AcceptMechanicInviteDeps = Readonly<{
  /** ONLY public.bt_r2_accept_mechanic_invite; server-only service role. */
  accept: (args: AcceptMechanicInviteArgs) => Promise<boolean>
}>
export type AcceptMechanicInviteOutcome =
  | Readonly<{ status: 'accepted' | 'denied' | 'unknown' }>

/**
 * Does not authorize a session or choose any role; relies on the caller
 * having verified current Supabase Auth user (not JWT/user_metadata alone).
 * DB false => generic denial; DB outage after commit => unknown, never retry.
 */
export async function acceptMechanicInviteCandidate(
  request: unknown,
  actor: VerifiedInviteActor | null,
  deps: AcceptMechanicInviteDeps
): Promise<AcceptMechanicInviteOutcome> {
  const input = parseAcceptMechanicInviteRequest(request)
  if (!input || !actor || typeof actor.userId !== 'string' ||
      !uuid.test(actor.userId) ||
      typeof actor.confirmedEmail !== 'string' ||
      actor.confirmedEmail !== actor.confirmedEmail.trim().toLowerCase() ||
      actor.confirmedEmail.length < 5 || actor.confirmedEmail.length > 254 ||
      !email.test(actor.confirmedEmail))
    return { status: 'denied' }

  let tokenDigest: string
  try {
    // Hash 32 original token bytes, not UTF-8 of 64 hex characters.
    tokenDigest = await hashMechanicInviteToken(input.token)
  } catch {
    return { status: 'denied' }
  }

  try {
    // Exactly one RPC, with identity from Auth and digest only; no token.
    const accepted = await deps.accept({
      p_verified_user_id: actor.userId,
      p_verified_email: actor.confirmedEmail,
      p_token_sha256_hex: tokenDigest
    })
    return { status: accepted === true ? 'accepted' :
      accepted === false ? 'denied' : 'unknown' }
  } catch {
    // PostgreSQL could have committed before the network acknowledgment.
    // No automatic retry and no exception diagnostics in the response.
    return { status: 'unknown' }
  }
}
