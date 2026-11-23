/** Backend-only injected candidate. NOT imported by the PWA; no endpoint or credentials. */
import { quoteId } from '../../src/cp05/contracts'
import { isArchivedPdf } from './archiveCandidate'
import type { Snapshot, Revision, Quote } from '../../src/cp05/contracts'
export type Reservation = {
  request_id: string
  revision: number
  payload: Snapshot
  payload_sha256: string
  completed?: Revision
}
export type ArchiveReceipt = {
  path: string
  sha256: string
  size: number
  contentType: 'application/pdf'
}
export interface IssuePorts {
  verifyUser(): Promise<{ id: string; confirmed: boolean }>
  reserve(
    actorId: string,
    quoteId: string,
    version: number,
    requestId: string
  ): Promise<Reservation>
  render(snapshot: Snapshot): Promise<Uint8Array>
  archive(path: string, pdf: Uint8Array): Promise<ArchiveReceipt>
  finish(actorId: string, requestId: string, receipt: ArchiveReceipt): Promise<Revision>
}
export async function issueQuoteCandidate(
  policy: { archiveApproved: boolean },
  ports: IssuePorts,
  quote: Pick<Quote, 'id' | 'version'>,
  requestId: string
): Promise<Revision> {
  // This switch is a trusted server rollout policy, never a browser authorization.
  if (policy.archiveApproved !== true) throw Error('ARCHIVE_NOT_AUTHORIZED')
  quoteId(quote.id)
  quoteId(requestId)
  if (!Number.isSafeInteger(quote.version) || quote.version < 1)
    throw Error('INVALID_QUOTE_VERSION')
  const user = await ports.verifyUser()
  if (!user.confirmed) throw Error('UNVERIFIED_ACTOR')
  const frozen = await ports.reserve(user.id, quote.id, quote.version, requestId)
  quoteId(frozen.request_id)
  const snapshot = frozen.payload
  if (
    snapshot.quote.id !== quote.id ||
    snapshot.quote.version !== quote.version ||
    !Number.isSafeInteger(frozen.revision) || frozen.revision<1 ||
    !frozen.payload_sha256.match(/^[a-f0-9]{64}$/)
  )
    throw Error('INVALID_RESERVATION')
  const path = `${snapshot.quote.workshop_id}/quotes/${quote.id}/r${frozen.revision}/${frozen.payload_sha256}.pdf`
  if(frozen.completed){
    const r=frozen.completed
    if(r.workshop_id!==snapshot.quote.workshop_id||r.quote_id!==quote.id||r.revision!==frozen.revision||
      r.pdf_object_path!==path||r.payload_sha256!==frozen.payload_sha256||
      r.payload?.quote?.id!==quote.id||r.payload?.quote?.version!==quote.version||
      !/^[a-f0-9]{64}$/.test(r.pdf_sha256)||!Number.isSafeInteger(r.pdf_size)||r.pdf_size<12)
      throw Error('ISSUE_NOT_CONFIRMED')
    return r
  }
  const pdf = await ports.render(snapshot)
  if (!isArchivedPdf(pdf))
    throw Error('INVALID_PDF')
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', pdf.slice().buffer))]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
  const receipt = await ports.archive(path, pdf)
  if (
    receipt.path !== path ||
    receipt.sha256 !== hash ||
    receipt.size !== pdf.length ||
    receipt.contentType !== 'application/pdf'
  )
    throw Error('ARCHIVE_NOT_CONFIRMED')
  const issued = await ports.finish(user.id, frozen.request_id, receipt)
  if (
    issued.workshop_id !== snapshot.quote.workshop_id ||
    issued.quote_id !== quote.id ||
    issued.revision !== frozen.revision ||
    issued.pdf_size !== pdf.length ||
    issued.pdf_sha256 !== hash ||
    issued.pdf_object_path !== path ||
    issued.payload_sha256 !== frozen.payload_sha256 ||
    issued.payload?.quote?.id !== quote.id ||
    issued.payload?.quote?.version !== quote.version
  )
    throw Error('ISSUE_NOT_CONFIRMED')
  return issued
}
