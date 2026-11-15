/**
 * ByteTorque R2-A6-P — Resend HTTP *request builder and reply classifier*.
 * NO fetch, NO SDK, NO side effects, NO provider account, NO email sent.
 *
 * Provider reference: https://resend.com/docs/dashboard/emails/idempotency-keys
 * Provider remembers a key for ONLY 24 hours. Database enforces a shorter
 * 23-hour recovery window from the very first claim, not from invitation time.
 * A future sender MUST keep the frozen wireBody unchanged for
 * every retry, and use the same stable key from the outbox ID.
 */
import type { DeliveryReceipt, ImmutableDeliveryRequest } from './inviteDeliveryAdapter.ts'
import { wireMatchesResendInviteV1 } from './resendInviteWireV1.ts'

const email = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const idempotency = /^bt-r2-invite:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
const control = /[\r\n\x00-\x1f\x7f]/
const endpoint = 'https://api.resend.com/emails'

export type ResendRequest = Readonly<{
  url: typeof endpoint
  method: 'POST'
  headers: Readonly<{
    Authorization: string
    'Content-Type': 'application/json'
    'Idempotency-Key': string
  }>
  body: string
}>

/** ONLY a trusted worker can use the returned request; never log it. */
export function buildResendInviteRequest(
  request: ImmutableDeliveryRequest,
  config: { apiKey: string; fromEmail: string }
): ResendRequest {
  const key = request.idempotencyKey.toLowerCase()
  const match = idempotency.exec(key)
  if (!match || !uuid.test(match[1]) ||
      request.idempotencyKey !== key ||
      typeof config.apiKey !== 'string' ||
      !/^re_[A-Za-z0-9_\-]{10,256}$/.test(config.apiKey) ||
      typeof config.fromEmail !== 'string' ||
      !email.test(config.fromEmail) || control.test(config.fromEmail) ||
      request.from !== config.fromEmail ||
      !email.test(request.from) || control.test(request.from) ||
      !email.test(request.to) || control.test(request.to) ||
      !request.subject || control.test(request.subject) ||
      request.subject.length > 250 ||
      request.text.length < 1 || request.text.length > 15_000 ||
      request.html.length < 1 || request.html.length > 60_000 ||
      !wireMatchesResendInviteV1(request, request.wireBody))
    throw new TypeError('Invalid Resend invitation request')

  // Explicitly one recipient; do not allow client-injected CC/BCC, attachments,
  // reply_to, metadata or arbitrary URLs. Avoid recording the token in tags.
  return {
    url: endpoint,
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + config.apiKey,
      'Content-Type': 'application/json',
      'Idempotency-Key': key
    },
    body: request.wireBody
  }
}

export function classifyResendReply(httpStatus: number, response: unknown): DeliveryReceipt {
  const body = response && typeof response === 'object' && !Array.isArray(response)
    ? response as Record<string, unknown> : {}
  // A 2xx HTTP response only means the provider accepted the request.
  if (httpStatus >= 200 && httpStatus < 300)
    return typeof body.id === 'string' && uuid.test(body.id)
      ? { accepted: true, providerMessageId: body.id.toLowerCase() }
      : { accepted: false, retryable: true }

  const code = typeof body.name === 'string' ? body.name :
    typeof body.code === 'string' ? body.code : ''
  if (httpStatus === 409) {
    if (code === 'invalid_idempotent_request')
      return { accepted: false, retryable: false } // Same key, different body!
    if (code === 'concurrent_idempotent_requests')
      return { accepted: false, retryable: true }
    return { accepted: false, retryable: true } // Unknown 409: conservative.
  }
  if (httpStatus === 429 || httpStatus === 408 ||
      httpStatus >= 500 || httpStatus === 0)
    return { accepted: false, retryable: true }
  if (httpStatus >= 400 && httpStatus < 500)
    return { accepted: false, retryable: false }

  // Unknown outcome must not be misreported as delivery.
  return { accepted: false, retryable: true }
}
