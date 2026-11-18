/**
 * BT-COM-01A: server-only, undeloyed immutable closing archive candidate.
 *
 * The source quote PDF is the original CP05 archived revision. The report and
 * handover are informative operator-declared copies. Never call from React:
 * caller-supplied amounts, filenames, object paths and provider credentials are
 * not accepted. No email, SQL, bucket creation, deployment or public URL here.
 *
 * A future trusted adapter MUST implement atomic/unique manifest commits,
 * actor/membership checks, private Storage and revocation rechecks.
 */
import { prepareClosingPacket, type PreparedClosing } from '../../src/entrega/finalPackage'
import type { Quote, Revision } from '../../src/cp05/contracts'
import type { FlowEvidence } from '../../src/historial/contracts'
import { CP05_MAX_PDF_BYTES, isArchivePath, isArchivedPdf } from '../cp05/archiveCandidate'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const SHA = /^[0-9a-f]{64}$/
export const CLOSING_ARCHIVE_BUCKET_CANDIDATE = 'bt-closing-documents'
export const CLOSING_ARCHIVE_STATUS = 'prepared_not_sent' as const

export type ClosingArchiveRequest = {
  workshopId: string
  orderId: string
  revisionId: string
  deliveryId: string
  requestId: string
}
export type ArchivePdf = {
  kind: 'quote' | 'report' | 'handover'
  fileName: string
  bucket: string
  path: string
  sha256: string
  byteLength: number
  contentType: 'application/pdf'
}
export type ClosingArchiveManifest = {
  version: 1
  state: typeof CLOSING_ARCHIVE_STATUS
  workshopId: string
  orderId: string
  quoteId: string
  revisionId: string
  revisionNumber: number
  approvalId: string
  reportId: string
  deliveryId: string
  sourceBundleId: string
  sourcePayloadSha256: string
  actorId: string
  documents: [ArchivePdf, ArchivePdf, ArchivePdf]
}
export type VerifiedClosingSnapshot = {
  quote: Quote
  revision: Revision
  evidence: FlowEvidence
  quoteArchive: { path: string; sha256: string; byteLength: number }
  /** Derived only from the authenticated trusted database, NEVER browser state. */
  currentIssuedRevision: boolean
  confirmedDelivery: boolean
  workshopActive: boolean
  actorRole: 'owner' | 'admin' | 'reception' | 'mechanic'
}
export interface ClosingArchivePorts {
  authenticate(): Promise<{ id: string; confirmed: boolean }>
  load(request: ClosingArchiveRequest, actorId: string): Promise<VerifiedClosingSnapshot>
  originalPdf(path: string): Promise<Uint8Array>
  render(packet: PreparedClosing, kind: 'report' | 'handover'): Promise<Uint8Array>
  /** Write only, upsert:false. A same-key retry must never overwrite. */
  putIfAbsent(path: string, bytes: Uint8Array): Promise<void>
  /** Read-back from the same private bucket, even on an existing-object retry. */
  readBack(path: string): Promise<Uint8Array>
  /** Recheck session, tenant, revision and delivery before committing. */
  recheck(request: ClosingArchiveRequest, actorId: string): Promise<boolean>
  /**
   * MUST be transactional with UNIQUE(workshopId,revisionId,deliveryId).
   * On idempotent retries return the same manifest, never mutate prior rows.
   */
  commit(
    requestId: string,
    manifest: ClosingArchiveManifest
  ): Promise<ClosingArchiveManifest>
}
const validId = (id: string) => typeof id === 'string' && UUID.test(id)
const validDigest = (s: string) => typeof s === 'string' && SHA.test(s)
const validName = (s: string) =>
  typeof s === 'string' && /^[0-9A-Za-z_-]{1,115}\.pdf$/.test(s)
const deny = (reason: string): never => { throw Error(reason) }
const hashPdf = async (bytes: Uint8Array) => {
  if (!isArchivedPdf(bytes) || bytes.byteLength > CP05_MAX_PDF_BYTES)
    deny('INVALID_CLOSING_PDF')
  return Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', bytes.slice().buffer))
  ).map(x => x.toString(16).padStart(2, '0')).join('')
}
const checkReceipt = (bytes: Uint8Array, length: number, hash: string) => {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength !== length ||
      !isArchivedPdf(bytes)) deny('CLOSING_ARCHIVE_INTEGRITY')
  return hashPdf(bytes).then(digest => {
    if (digest !== hash) deny('CLOSING_ARCHIVE_INTEGRITY')
  })
}
function verifySnapshot(
  request: ClosingArchiveRequest, snapshot: VerifiedClosingSnapshot, p: PreparedClosing
) {
  if (!snapshot || snapshot.currentIssuedRevision !== true ||
      snapshot.confirmedDelivery !== true || snapshot.workshopActive !== true ||
      !['owner', 'admin', 'reception'].includes(snapshot.actorRole))
    deny('CLOSING_ARCHIVE_NOT_AUTHORIZED')
  if (p.state !== 'prepared_locally_not_archived_or_emailed' ||
      p.workshop.id !== request.workshopId ||
      p.order.id !== request.orderId ||
      p.quote.revisionId !== request.revisionId ||
      p.handover.id !== request.deliveryId ||
      p.bundleId !== [request.revisionId, p.report.id, request.deliveryId].join(':') ||
      !validId(p.quote.id) || !validId(p.report.id) ||
      snapshot.evidence.approvals.filter(a => a.revision_id === request.revisionId).length !== 1 ||
      !validId(snapshot.evidence.approvals.find(a => a.revision_id === request.revisionId)!.id) ||
      !Number.isSafeInteger(p.quote.revision) || p.quote.revision < 1 ||
      !validDigest(p.quote.pdfSha256) || !validDigest(p.quote.payloadSha256) ||
      !validName(p.quote.fileName) || !validName(p.report.fileName) ||
      !validName(p.handover.fileName) ||
      !snapshot.quoteArchive ||
      !isArchivePath(snapshot.quoteArchive.path) ||
      snapshot.quoteArchive.path !== request.workshopId+'/quotes/'+p.quote.id+'/r'+p.quote.revision+'/'+p.quote.payloadSha256+'.pdf' ||
      !validDigest(snapshot.quoteArchive.sha256) ||
      snapshot.quoteArchive.sha256 !== p.quote.pdfSha256 ||
      snapshot.quoteArchive.path !== snapshot.revision.pdf_object_path ||
      snapshot.quoteArchive.byteLength !== snapshot.revision.pdf_size ||
      !Number.isSafeInteger(snapshot.quoteArchive.byteLength) ||
      snapshot.quoteArchive.byteLength < 12 ||
      snapshot.quoteArchive.byteLength > CP05_MAX_PDF_BYTES)
    deny('CLOSING_ARCHIVE_SOURCE_MISMATCH')
}
function documentPath(
  request: ClosingArchiveRequest, kind: 'report' | 'handover', digest: string
): string {
  return [request.workshopId, 'closings', request.orderId,
    request.revisionId, request.deliveryId, kind, digest + '.pdf'].join('/')
}
/**
 * No publication until the owner explicitly authorizes private Storage,
 * SQL manifests, trusted function + isolated recovery. The approved flag
 * must be derived from a server-only rollout gate, never VITE_*.
 */
export async function archiveClosingCandidate(
  policy: { approved: boolean },
  ports: ClosingArchivePorts,
  request: ClosingArchiveRequest
): Promise<ClosingArchiveManifest> {
  if (policy.approved !== true) deny('CLOSING_ARCHIVE_DISABLED')
  if (!request || ![request.workshopId, request.orderId, request.revisionId,
      request.deliveryId, request.requestId].every(validId))
    deny('INVALID_CLOSING_REQUEST')
  const user = await ports.authenticate()
  if (!user || !validId(user.id) || user.confirmed !== true)
    deny('CLOSING_ARCHIVE_SESSION_REQUIRED')
  const snapshot = await ports.load(request, user.id)
  // Always reconstruct and validate from immutable server rows, never accept
  // precomputed monetary fields or document identities from HTTP input.
  const packet = prepareClosingPacket(snapshot.quote, snapshot.revision, snapshot.evidence)
  verifySnapshot(request, snapshot, packet)

  // Never regenerate the quoted/approved PDF from current editable state.
  const quoteBytes = await ports.originalPdf(snapshot.quoteArchive.path)
  await checkReceipt(
    quoteBytes, snapshot.quoteArchive.byteLength, snapshot.quoteArchive.sha256
  )
  const quote: ArchivePdf = {
    kind: 'quote', fileName: packet.quote.fileName,
    bucket: 'cp05-quote-documents', path: snapshot.quoteArchive.path,
    sha256: snapshot.quoteArchive.sha256,
    byteLength: snapshot.quoteArchive.byteLength, contentType: 'application/pdf'
  }
  const reportBytes = await ports.render(packet, 'report')
  const handoverBytes = await ports.render(packet, 'handover')
  const reportHash = await hashPdf(reportBytes)
  const handoverHash = await hashPdf(handoverBytes)
  const report: ArchivePdf = {
    kind: 'report', fileName: packet.report.fileName,
    bucket: CLOSING_ARCHIVE_BUCKET_CANDIDATE,
    path: documentPath(request, 'report', reportHash),
    sha256: reportHash, byteLength: reportBytes.byteLength,
    contentType: 'application/pdf'
  }
  const handover: ArchivePdf = {
    kind: 'handover', fileName: packet.handover.fileName,
    bucket: CLOSING_ARCHIVE_BUCKET_CANDIDATE,
    path: documentPath(request, 'handover', handoverHash),
    sha256: handoverHash, byteLength: handoverBytes.byteLength,
    contentType: 'application/pdf'
  }
  for (const [doc, bytes] of [[report, reportBytes], [handover, handoverBytes]] as const) {
    await ports.putIfAbsent(doc.path, bytes)
    await checkReceipt(await ports.readBack(doc.path), doc.byteLength, doc.sha256)
  }
  // Object puts and SQL commit are NOT an atomic transaction. A failure leaves
  // private unreferenced objects for a controlled reconciliation, NEVER delete
  // or overwrite previously archived bytes as an automatic rollback.
  if (!(await ports.recheck(request, user.id))) deny('CLOSING_ARCHIVE_REVOKED')
  const manifest: ClosingArchiveManifest = {
    version: 1, state: CLOSING_ARCHIVE_STATUS,
    workshopId: request.workshopId, orderId: request.orderId,
    quoteId: packet.quote.id, revisionId: request.revisionId,
    revisionNumber: packet.quote.revision,
    approvalId: snapshot.evidence.approvals.find(a => a.revision_id === request.revisionId)!.id,
    reportId: packet.report.id, deliveryId: request.deliveryId,
    sourceBundleId: packet.bundleId,
    sourcePayloadSha256: packet.quote.payloadSha256,
    actorId: user.id, documents: [quote, report, handover]
  }
  const stored = await ports.commit(request.requestId, manifest)
  // Fail closed if a racing different payload is returned for this revision.
  if (JSON.stringify(stored) !== JSON.stringify(manifest))
    deny('CLOSING_ARCHIVE_COMMIT_MISMATCH')
  return stored
}
