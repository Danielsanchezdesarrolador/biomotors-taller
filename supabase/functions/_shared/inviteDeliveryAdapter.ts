/**
 * ByteTorque R2-A6 — provider-neutral one-job preparation and dispatch.
 * NO provider instantiated, NO HTTP requests, NO SMTP credentials.
 * Only a future trusted server/worker may supply a send callback. Provider
 * MUST enforce idempotency on retries using stable outbox_id.
 * A request accepted by provider is NOT delivery to the recipient.
 */
import { openInviteEnvelope } from './encryptedInviteEnvelope.ts'
import { renderMechanicInviteEmail } from './mechanicInviteEmail.ts'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export type ClaimedInvitationEmail = Readonly<{
  outbox_id: string
  workshop_id: string
  recipient_email: string
  expires_at: string
  token_sha256_hex: string
  ciphertext_hex: string
  nonce_hex: string
}>
export type DeliveryRequest = Readonly<{
  to: string
  subject: string
  text: string
  html: string
  idempotencyKey: string
}>
export type DeliveryReceipt =
  | Readonly<{ accepted: true; providerMessageId: string }>
  | Readonly<{ accepted: false; retryable: boolean }>
export type DeliveryResult =
  | Readonly<{ state: 'accepted'; providerMessageId: string }>
  | Readonly<{ state: 'retry' | 'permanent-failure' }>
export type DeliveryProvider = (request: DeliveryRequest) => Promise<DeliveryReceipt>

/** Never log the returned object; it contains an invitation link/token. */
export async function prepareInviteDelivery(
  job: ClaimedInvitationEmail,
  key: Uint8Array,
  workshopName: string,
  nowIso: string
): Promise<DeliveryRequest> {
  if (!uuid.test(job.outbox_id) || !uuid.test(job.workshop_id))
    throw new Error('Unverified delivery job')
  const token = await openInviteEnvelope({
    ciphertext_hex: job.ciphertext_hex,
    nonce_hex: job.nonce_hex,
    token_sha256_hex: job.token_sha256_hex
  }, key, {
    workshopId: job.workshop_id,
    recipientEmail: job.recipient_email,
    expiresAt: job.expires_at,
    token_sha256_hex: job.token_sha256_hex
  }, nowIso)
  const letter = renderMechanicInviteEmail({
    workshopName, token: token.token, expiresAt: token.expiresAt, nowIso
  })
  return {
    to: token.recipientEmail,
    subject: letter.subject,
    text: letter.text,
    html: letter.html,
    idempotencyKey: 'bt-r2-invite:' + job.outbox_id.toLowerCase()
  }
}
/** Caller must acquire and release the DB lease. Never deploy this alone. */
export async function dispatchPreparedInvite(
  job: ClaimedInvitationEmail,
  key: Uint8Array,
  workshopName: string,
  nowIso: string,
  send: DeliveryProvider
): Promise<DeliveryResult> {
  try {
    const prepared = await prepareInviteDelivery(job,key,workshopName,nowIso)
    const result = await send(prepared)
    if (result.accepted &&
        result.providerMessageId.trim().length > 0 &&
        result.providerMessageId.length <= 200)
      return { state: 'accepted', providerMessageId: result.providerMessageId }
    if (result.accepted) return { state: 'retry' }
    return { state: result.retryable ? 'retry' : 'permanent-failure' }
  } catch {
    // No token, destination, credentials or upstream errors in results.
    return { state: 'retry' }
  }
}
