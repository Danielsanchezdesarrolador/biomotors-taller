/**
 * ByteTorque BT-AUTH-R2-A6-P4 — invitation creator candidate, server ONLY.
 * NEVER imported by frontend, NEVER deployed, NO database client, HTTP,
 * SMTP, provider secrets, logging, scheduler or user-selectable privileges.
 *
 * Only a future protected server handler may inject:
 *   (1) a verified Auth actor, (2) a trusted workshop DB lookup,
 *   (3) an authenticated service-only atomic reserve+queue SQL RPC.
 * The SQL RPC, not this preflight, MUST authorize membership, roles, quotas,
 * rate limits, workshop state and atomically enqueue the encrypted envelope.
 */
import { parseMechanicInviteRequest } from './mechanicInviteRequest.ts'
import { createMechanicInviteToken } from './mechanicInviteToken.ts'
import { sealImmutableInviteEnvelope, openImmutableInviteEnvelope } from './encryptedInviteEnvelope.ts'
import type { VerifiedInviteActor } from './verifiedInviteActor.ts'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const email = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/
const ONE_DAY = 24 * 60 * 60 * 1000

export type CandidateWorkshop = Readonly<{
  id: string
  name: string
  status: 'active' | 'suspended'
}>

/** Exact arguments of public.bt_r2_reserve_and_queue_mechanic_invite candidate. */
export type ReserveAndQueueArgs = Readonly<{
  p_actor_user_id: string
  p_workshop_id: string
  p_email: string
  p_token_sha256_hex: string
  p_expires_at: string
  p_ciphertext_hex: string
  p_nonce_hex: string
}>

export type InvitationIssueDependencies = Readonly<{
  getWorkshop: (workshopId: string) => Promise<CandidateWorkshop | null>
  reserveAndQueue: (args: ReserveAndQueueArgs) => Promise<string>
  encryptionKey: Uint8Array
  authorizedSender: string
  nowIso: () => string
}>
export type InvitationIssueOutcome =
  | Readonly<{ status: 'queued'; invitationId: string }>
  | Readonly<{ status: 'denied' | 'unknown' }>

/**
 * Returns only an invitation id on confirmed DB reservation.
 * Never returns the raw token, email, JWT, ciphertext, error messages or URL.
 * A DB timeout is ambiguous: 'unknown' must NOT trigger an automatic retry.
 */
export async function issueMechanicInvitationCandidate(
  rawRequest: unknown,
  verifiedActor: VerifiedInviteActor,
  deps: InvitationIssueDependencies
): Promise<InvitationIssueOutcome> {
  // The actor MUST be obtained using server-side Auth; never from request JSON.
  const input = parseMechanicInviteRequest(rawRequest)
  if (!input || !verifiedActor ||
      typeof verifiedActor.userId !== 'string' ||
      !uuid.test(verifiedActor.userId) ||
      verifiedActor.userId !== verifiedActor.userId.toLowerCase() ||
      typeof verifiedActor.confirmedEmail !== 'string' ||
      verifiedActor.confirmedEmail.length > 254 ||
      verifiedActor.confirmedEmail !== verifiedActor.confirmedEmail.trim().toLowerCase() ||
      !email.test(verifiedActor.confirmedEmail))
    return { status: 'denied' }

  let workshop: CandidateWorkshop | null
  try {
    workshop = await deps.getWorkshop(input.workshop_id)
  } catch {
    return { status: 'unknown' }
  }
  // The SQL RPC still revalidates actor membership and workshop/plan under lock.
  if (!workshop || workshop.id !== input.workshop_id ||
      workshop.status !== 'active' ||
      typeof workshop.name !== 'string' || workshop.name.length < 2)
    return { status: 'denied' }

  let args: ReserveAndQueueArgs
  try {
    const nowIso = deps.nowIso()
    const now = Date.parse(nowIso)
    if (!Number.isFinite(now) || !Number.isSafeInteger(now))
      return { status: 'denied' }
    const expiresAt = new Date(now + ONE_DAY).toISOString()
    const { token, token_sha256_hex } = await createMechanicInviteToken()
    // The browser never receives token/sender/workshopName/expiry as inputs.
    const sealed = await sealImmutableInviteEnvelope({
      workshopId: input.workshop_id,
      workshopName: workshop.name,
      fromEmail: deps.authorizedSender,
      recipientEmail: input.email,
      expiresAt, token
    }, deps.encryptionKey, nowIso)
    if (sealed.token_sha256_hex !== token_sha256_hex)
      return { status: 'denied' }

    // Same pre-queue authenticated integrity test that the future worker uses:
    // reject mismatches *before* atomically reserving a mechanic seat.
    const frozen = await openImmutableInviteEnvelope(sealed, deps.encryptionKey, {
      workshopId: input.workshop_id,
      recipientEmail: input.email,
      expiresAt,
      token_sha256_hex
    }, nowIso)
    if (frozen.to !== input.email || frozen.from !== deps.authorizedSender)
      return { status: 'denied' }

    args = {
      p_actor_user_id: verifiedActor.userId,
      p_workshop_id: input.workshop_id,
      p_email: input.email,
      p_token_sha256_hex: token_sha256_hex,
      p_expires_at: expiresAt,
      p_ciphertext_hex: sealed.ciphertext_hex,
      p_nonce_hex: sealed.nonce_hex
    }
  } catch {
    // Includes invalid sender, encryption, envelope, expiry and key material.
    return { status: 'denied' }
  }

  try {
    // Exactly ONE RPC per request. SQL candidate rolls back reservation when
    // outbox enqueue, nonce uniqueness, rate limit or quota validation fails.
    const id = await deps.reserveAndQueue(args)
    return typeof id === 'string' && uuid.test(id)
      ? { status: 'queued', invitationId: id.toLowerCase() }
      : { status: 'unknown' }
  } catch {
    // DB may have committed before the connection dropped; never retry here.
    return { status: 'unknown' }
  }
}
