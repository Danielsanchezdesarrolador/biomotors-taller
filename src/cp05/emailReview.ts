/** CP05 operator review is not independently verified customer consent. */
import type { Revision } from './contracts'
export type QuoteEmailReview = {
  reviewedRevisionId: string
  confirmedRecipient: string
  recipientChecked: true
  documentChecked: true
  contactAuthorized: true
}
export function matchesQuoteEmailReview(
  revision: Pick<Revision, 'id' | 'payload'>, review: unknown
): review is QuoteEmailReview {
  if(!review || typeof review !== 'object' || Array.isArray(review)) return false
  const r = review as Partial<QuoteEmailReview>
  const recipient = revision?.payload?.customer?.email
  return typeof recipient === 'string' && recipient.length > 3 &&
    recipient.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) &&
    r.reviewedRevisionId === revision.id && r.confirmedRecipient === recipient &&
    r.recipientChecked === true && r.documentChecked === true &&
    r.contactAuthorized === true
}
