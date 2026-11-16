/** Backend-only injected candidate. NOT imported by the PWA; no endpoint or credentials. */
import type { Snapshot, Revision, Quote } from '../../src/cp05/contracts'
export type Reservation = {
  request_id: string
  revision: number
  payload: Snapshot
  payload_sha256: string
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
  const user = await ports.verifyUser()
  if (!user.confirmed) throw Error('UNVERIFIED_ACTOR')
  const frozen = await ports.reserve(user.id, quote.id, quote.version, requestId)
  const snapshot = frozen.payload
  if (
    snapshot.quote.id !== quote.id ||
    snapshot.quote.version !== quote.version ||
    !Number.isSafeInteger(frozen.revision) ||
    !frozen.payload_sha256.match(/^[a-f0-9]{64}$/)
  )
    throw Error('INVALID_RESERVATION')
  const path = `${snapshot.quote.workshop_id}/quotes/${quote.id}/r${frozen.revision}/${frozen.payload_sha256}.pdf`
  const pdf = await ports.render(snapshot)
  if (new TextDecoder().decode(pdf.slice(0, 5)) !== '%PDF-' || pdf.length > 20000000)
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
  const issued = await ports.finish(user.id, requestId, receipt)
  if (
    issued.pdf_sha256 !== hash ||
    issued.pdf_object_path !== path ||
    issued.payload_sha256 !== frozen.payload_sha256
  )
    throw Error('ISSUE_NOT_CONFIRMED')
  return issued
}
