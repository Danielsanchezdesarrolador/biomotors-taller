/** Future authenticated document endpoint. Public switches never grant server permission. */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
import { QuoteFailure, quoteId, type Quote, type Revision } from './contracts'
import { matchesQuoteEmailReview, type QuoteEmailReview } from './emailReview'
const key = 'bt:cp05:document-operation:v1'
export function documentOperation(context: Context, quote: Quote) {
  const scope = [context.userId, context.workshop.id, quote.id, quote.version].join(':')
  try {
    const data = JSON.parse(sessionStorage.getItem(key) || 'null')
    if (data?.scope === scope && Date.now() - data.at < 8 * 3600000 && Date.now() >= data.at)
      return quoteId(data.id)
  } catch {
    /* best effort */
  }
  const id = crypto.randomUUID()
  try {
    sessionStorage.setItem(key, JSON.stringify({ scope, id, at: Date.now() }))
  } catch {
    /* memory ID held by UI while mounted */
  }
  return id
}
export function clearDocumentOperation() {
  try {
    sessionStorage.removeItem(key)
  } catch {
    /* metadata is not authorization */
  }
}
export function documentClient(
  client: SupabaseClient,
  context: Context,
  flags: { archive: boolean; email: boolean }
) {
  let disposed = false
  const alive = () => {
    if (disposed) throw new QuoteFailure('denied')
  }
  async function call(action: string, args: Record<string, unknown>, email = false) {
    alive()
    if (!flags.archive || (email && !flags.email)) throw new QuoteFailure('blocked')
    const user = await client.auth.getUser()
    alive()
    if (user.error || user.data.user?.id !== context.userId || !user.data.user.email_confirmed_at)
      throw new QuoteFailure('denied')
    const r = await client.functions.invoke('bt-cp05-documents', {
      body: { action, workshopId: context.workshop.id, ...args }
    })
    alive()
    if (r.error) {
      const response = (r.error as { context?: Response }).context
      if (response instanceof Response) {
        const body = await response
          .clone()
          .json()
          .catch(() => null)
        if (body?.error === 'DOCUMENT_NOT_CURRENT') throw new QuoteFailure('conflict')
        if (['PROVIDER_ACK_UNKNOWN', 'DELIVERY_PENDING'].includes(body?.error))
          throw new QuoteFailure('delivery_pending')
      }
      const status = (r.error as { context?: { status?: number } }).context?.status
      throw new QuoteFailure(
        status === 503 ? 'blocked' : status === 401 || status === 403 ? 'denied' : 'unavailable'
      )
    }
    if (!r.data) throw new QuoteFailure('unavailable')
    return r.data
  }
  return {
    enabled: flags.archive,
    emailEnabled: flags.archive && flags.email,
    async issue(quote: Quote, requestId: string): Promise<Revision> {
      const data = await call('issue', {
        quoteId: quoteId(quote.id),
        version: quote.version,
        requestId: quoteId(requestId)
      })
      const r = data.revision as Revision
      if (
        r?.workshop_id !== context.workshop.id ||
        r.quote_id !== quote.id || r.payload?.quote?.id!==quote.id ||
        r.payload.quote.workshop_id!==context.workshop.id || r.payload.quote.version!==quote.version ||
        !Number.isInteger(r.revision) ||
        r.revision < 1
      )
        throw new QuoteFailure('denied')
      return r
    },
    async download(revision: Revision): Promise<Uint8Array> {
      if (revision.workshop_id !== context.workshop.id) throw new QuoteFailure('denied')
      const data = await call('download', { revisionId: quoteId(revision.id),requestId: commercialDocumentRequest(context,revision.id) })
      if (!(data instanceof Blob)) throw new QuoteFailure('unavailable')
      const bytes = new Uint8Array(await data.arrayBuffer())
      alive()
      if (
        new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-' ||
        bytes.length !== revision.pdf_size
      )
        throw new QuoteFailure('unavailable')
      const hash = Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', bytes.slice().buffer))
      )
        .map((n) => n.toString(16).padStart(2, '0'))
        .join('')
      alive()
      if (hash !== revision.pdf_sha256) throw new QuoteFailure('unavailable')
      return bytes
    },
    async send(revision: Revision, attempt: number, review: QuoteEmailReview) {
      if (revision.workshop_id !== context.workshop.id) throw new QuoteFailure('denied')
      if (!matchesQuoteEmailReview(revision, review)) throw new QuoteFailure('invalid')
      const data = await call('send', { revisionId: quoteId(revision.id), attempt, review }, true)
      if (!['sent', 'already_sent', 'failed'].includes(data.delivery))
        throw new QuoteFailure('unavailable')
      return data.delivery as 'sent' | 'already_sent' | 'failed'
    },
    async cancel(quote: Quote, requestId: string) {
      alive()
      const data = await call('cancel', {
        quoteId: quoteId(quote.id),
        requestId: quoteId(requestId)
      })
      if (data.cancelled !== true) throw new QuoteFailure('unavailable')
      // Keep the same request ID after a timeout or ambiguous response so a
      // retry reconciles the original cancellation instead of starting a new one.
      clearDocumentOperation()
    },
    dispose() {
      disposed = true
    }
  }
}

export function commercialDocumentRequest(context:Context,resource:string):string {
 const key='bt:commercial-document:'+context.userId+':'+context.workshop.id+':'+resource
 try{const previous=JSON.parse(sessionStorage.getItem(key)||'null');if(previous&&Date.now()>=previous.at&&Date.now()-previous.at<240000)return quoteId(previous.id)}catch{/* Hint is never authority. */}
 const id=crypto.randomUUID();try{sessionStorage.setItem(key,JSON.stringify({id,at:Date.now()}))}catch{/* Retry remains in caller memory where possible. */}return id
}
