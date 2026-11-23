/** Future transactional worker ports. No provider SDK, URL, key or deployed function. */
import type { Revision } from '../../src/cp05/contracts'
import { matchesQuoteEmailReview } from '../../src/cp05/emailReview'
export interface DeliveryPorts {
  authorize(revisionId: string): Promise<Revision>
  queue(revisionId: string, attempt: number): Promise<void | 'already_sent'>
  send(input: { recipient: string; revision: Revision; idempotencyKey: string }): Promise<{
    confirmed: boolean
    providerId?: string
    definitiveFailure?: boolean
    errorCode?: string
  }>
  record(
    revisionId: string,
    attempt: number,
    status: 'sent' | 'failed',
    providerId: string | null,
    errorCode: string | null
  ): Promise<void>
}
export async function deliverQuoteCandidate(
  policy: { emailApproved: boolean },
  ports: DeliveryPorts,
  revisionId: string,
  attempt: number,
  reviewed: unknown
) {
  if (policy.emailApproved !== true) throw Error('EMAIL_DISABLED')
  if (!Number.isInteger(attempt) || attempt < 1) throw Error('INVALID_ATTEMPT')
  const revision = await ports.authorize(revisionId),
    recipient = revision.payload.customer.email
  if (revision.id !== revisionId) throw Error('INVALID_REVISION')
  // Operator attestation, not independently verified customer consent.
  if (!matchesQuoteEmailReview(revision, reviewed)) throw Error('MAIL_REVIEW_REQUIRED')
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient))
    throw Error('AUTHORIZED_RECIPIENT_REQUIRED')
  if ((await ports.queue(revisionId, attempt)) === 'already_sent') return 'already_sent' as const
  // One stable key per revision. Retries require provider idempotency/reconciliation;
  // never infer sent from an exception or an ambiguous acknowledgement.
  const result = await ports.send({
    recipient,
    revision,
    idempotencyKey: `cp05:${revision.workshop_id}:${revision.id}`
  })
  if (result.definitiveFailure && !result.confirmed) {
    await ports.record(
      revisionId,
      attempt,
      'failed',
      null,
      /^[A-Z0-9_]{1,80}$/.test(result.errorCode || '') ? result.errorCode! : 'PROVIDER_REJECTED'
    )
    return 'failed' as const
  }
  if (!result.confirmed || !result.providerId) throw Error('PROVIDER_ACK_UNKNOWN')
  await ports.record(revisionId, attempt, 'sent', result.providerId, null)
  return 'sent' as const
}
