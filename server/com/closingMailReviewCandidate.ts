/**
 * BT-COM-01B — TRUSTED-SERVER CANDIDATE ONLY, UNDEPLOYED.
 * Operator review for ONE consolidated closing email. There is deliberately
 * NO transport/provider, SMTP, queue, customer signature, or send function.
 *
 * All data must be reread through authenticated, tenant-scoped ports; a token
 * is a stale-preview fingerprint, NEVER an authorization credential.
 */
import type { ClosingArchiveManifest, ArchivePdf } from './closingArchiveCandidate'
import { CLOSING_ARCHIVE_BUCKET_CANDIDATE } from './closingArchiveCandidate'
import { CP05_MAX_PDF_BYTES, isArchivePath } from '../cp05/archiveCandidate'

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const SHA=/^[a-f0-9]{64}$/
const REASON='No acredita firma, conformidad del cliente, pago ni entrega física verificada.'
const EXPECTED_KINDS=['quote','report','handover'] as const

export type ClosingMailReviewRequest = {
  workshopId: string
  orderId: string
  revisionId: string
  deliveryId: string
}
export type ClosingMailRead = {
  manifest: ClosingArchiveManifest
  recipientFromServer: string | null
  customerName: string
  workshopName: string
  vehicleDescription: string
  memberRole: 'owner'|'admin'|'reception'|'mechanic'
  memberActive: boolean
  workshopActive: boolean
  deliveryRecorded: boolean
  revisionCurrent: boolean
  /** Trusted backend has read and SHA-256 verified ALL three private PDFs. */
  documentsVerified: boolean
}
export type MailReviewPreview = {
  state: 'preview_only_not_sent'
  workshopId: string
  orderId: string
  revisionId: string
  deliveryId: string
  recipient: string
  subject: string
  bodyText: string
  warning: string
  documents: [Pick<ArchivePdf, 'kind'|'fileName'|'sha256'|'byteLength'>,
    Pick<ArchivePdf, 'kind'|'fileName'|'sha256'|'byteLength'>,
    Pick<ArchivePdf, 'kind'|'fileName'|'sha256'|'byteLength'>]
  reviewFingerprint: string
}
export type MailReviewConfirmation = ClosingMailReviewRequest & {
  requestId: string
  reviewFingerprint: string
  typedRecipient: string
  recipientChecked: true
  documentsChecked: true
  declarationAcknowledged: true
}
export type ImmutableMailReview = {
  version: 1
  state: 'operator_reviewed_not_sent'
  requestId: string
  workshopId: string
  orderId: string
  revisionId: string
  deliveryId: string
  reviewerId: string
  recipient: string
  reviewFingerprint: string
  documentHashes: [string,string,string]
}
export interface MailReviewCandidatePorts {
  authenticate(): Promise<{ id: string; confirmed: boolean }>
  load(
    request: ClosingMailReviewRequest,
    reviewerId: string
  ): Promise<ClosingMailRead>
  recheck(
    request: ClosingMailReviewRequest, reviewerId: string,
    expectedFingerprint: string
  ): Promise<boolean>
  /**
   * Future adapter MUST atomically enforce idempotency on
   * (workshop_id, request_id), preserving an immutable historical row.
   * No send/queue operation may be performed by this method.
   */
  recordReview(review: ImmutableMailReview): Promise<ImmutableMailReview>
}
const deny=(s:string):never=>{throw Error(s)}
const validRequest=(request: ClosingMailReviewRequest)=>
  !!request && [request.workshopId,request.orderId,
    request.revisionId,request.deliveryId].every(x=>typeof x==='string' && UUID.test(x))
const cleanLabel=(input:string,max=110)=>{
  if(typeof input!=='string'||!input.trim())deny('INVALID_MAIL_LABEL')
  // Content is text/plain. Collapse newlines/control characters and avoid
  // misleading forged headings or email headers.
  return input.replace(/[\x00-\x1f\x7f\u2028\u2029]/g,' ')
    .replace(/\s+/g,' ').trim().slice(0,max)
}
const recipient=(raw:string|null)=>{
  if(!raw || typeof raw!=='string'||raw.length>254||raw.trim()!==raw)
    deny('REVIEW_RECIPIENT_UNAVAILABLE')
  if(!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(raw) ||
      raw.split('@')[0].length>64 || raw.includes('..') ||
      raw.split('@')[1].split('.').some(label=>label.startsWith('-')||label.endsWith('-')))
    deny('REVIEW_RECIPIENT_UNAVAILABLE')
  return raw
}
const namesMatch=(d:ArchivePdf)=>typeof d.fileName==='string' &&
  /^[0-9A-Za-z_-]{1,115}\.pdf$/.test(d.fileName)
function validateManifest(m:ClosingArchiveManifest, request:ClosingMailReviewRequest) {
  if (!m || m.version!==1||m.state!=='prepared_not_sent' ||
      m.workshopId!==request.workshopId ||
      m.orderId!==request.orderId ||
      m.revisionId!==request.revisionId ||
      m.deliveryId!==request.deliveryId ||
      !UUID.test(m.quoteId)||!UUID.test(m.reportId)||
      !UUID.test(m.approvalId)||!UUID.test(m.actorId)||
      !SHA.test(m.sourcePayloadSha256)||
      !Number.isSafeInteger(m.revisionNumber)||m.revisionNumber<1||
      m.sourceBundleId!==[m.revisionId,m.reportId,m.deliveryId].join(':')||
      !Array.isArray(m.documents)||m.documents.length!==3)
    deny('REVIEW_DOCUMENTS_INVALID')
  for (const [i,d] of m.documents.entries()){
    if (!d||d.kind!==EXPECTED_KINDS[i]||!namesMatch(d)||
        !SHA.test(d.sha256)||!Number.isSafeInteger(d.byteLength)||
        d.byteLength<12||d.byteLength>CP05_MAX_PDF_BYTES||
        d.contentType!=='application/pdf')deny('REVIEW_DOCUMENTS_INVALID')
    if (i===0) {
      if (d.bucket!=='cp05-quote-documents'||!isArchivePath(d.path)||
          d.path!==m.workshopId+'/quotes/'+m.quoteId+'/r'+
            m.revisionNumber+'/'+m.sourcePayloadSha256+'.pdf')
        deny('REVIEW_DOCUMENTS_INVALID')
    } else {
      const expected=[m.workshopId,'closings',m.orderId,m.revisionId,
        m.deliveryId,d.kind,d.sha256+'.pdf'].join('/')
      if (d.bucket!==CLOSING_ARCHIVE_BUCKET_CANDIDATE||
          d.path!==expected)deny('REVIEW_DOCUMENTS_INVALID')
    }
  }
}
async function fingerprint(m:ClosingArchiveManifest, mail:string) {
  // A deterministic content fingerprint. Not a signature or secret.
  const payload=JSON.stringify([
    'BT-COM-01B-v1',m.workshopId,m.orderId,m.revisionId,m.deliveryId,
    m.sourcePayloadSha256,mail,
    m.documents.map(d=>[d.kind,d.bucket,d.path,d.sha256,d.byteLength])
  ])
  return Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256',
      new TextEncoder().encode(payload)))
  ).map(byte=>byte.toString(16).padStart(2,'0')).join('')
}
async function build(
  ports: MailReviewCandidatePorts, request: ClosingMailReviewRequest
) {
  if(!validRequest(request))deny('INVALID_REVIEW_REQUEST')
  const actor=await ports.authenticate()
  if(!actor||!UUID.test(actor.id)||actor.confirmed!==true)
    deny('REVIEW_SESSION_REQUIRED')
  const data=await ports.load(request,actor.id)
  if(!data||!data.memberActive||!data.workshopActive||
      !data.deliveryRecorded||!data.revisionCurrent||
      !data.documentsVerified||
      !['owner','admin','reception'].includes(data.memberRole))
    deny('REVIEW_ACCESS_DENIED')
  validateManifest(data.manifest,request)
  const mail=recipient(data.recipientFromServer)
  const label=cleanLabel(data.workshopName)
  const customer=cleanLabel(data.customerName)
  const vehicle=cleanLabel(data.vehicleDescription)
  const key=await fingerprint(data.manifest,mail)
  const documents=data.manifest.documents.map(d=>({
    kind:d.kind,fileName:d.fileName,sha256:d.sha256,byteLength:d.byteLength
  })) as MailReviewPreview['documents']
  const preview:MailReviewPreview={
    state:'preview_only_not_sent',...request,recipient:mail,
    subject:label+' — Documentos de servicio y entrega · OT '+request.orderId,
    bodyText:[
      'Estimado/a '+customer+':',
      '',
      'Compartimos para revisión la documentación del servicio del vehículo '+vehicle+'.',
      'Orden de trabajo: '+request.orderId,
      'Cotización histórica: revisión '+data.manifest.revisionNumber+'.',
      'Documentos: 01 cotización emitida, 02 informe de trabajos declarados, 03 constancia de entrega declarada.',
      'La información sobre trabajos realizados y pendientes corresponde a declaraciones del taller.',
      REASON,
      '',
      'Saludos,',
      label
    ].join('\n'),
    warning:'Vista previa para revisión del operador. No se ha enviado ningún correo. '+REASON,
    documents,reviewFingerprint:key
  }
  return {actorId:actor.id,preview}
}
/**
 * No provider, no SQL and no email. Preview is generated only from a private,
 * already verified closing manifest and a recipient read from the server.
 */
export async function prepareClosingMailReviewCandidate(
  policy:{approved:boolean},ports:MailReviewCandidatePorts,
  request:ClosingMailReviewRequest
):Promise<MailReviewPreview>{
  if(policy.approved!==true)deny('MAIL_REVIEW_DISABLED')
  return (await build(ports,request)).preview
}
/**
 * Records only an OPERATOR REVIEW, never mail delivery. Future SQL adapter is
 * responsible for immutable/idempotent persistence; no adapter is installed.
 */
export async function confirmClosingMailReviewCandidate(
  policy:{approved:boolean},ports:MailReviewCandidatePorts,
  input:MailReviewConfirmation
):Promise<ImmutableMailReview>{
  if(policy.approved!==true)deny('MAIL_REVIEW_DISABLED')
  if(!input||!UUID.test(input.requestId||'')||
      !SHA.test(input.reviewFingerprint||'')||
      input.recipientChecked!==true||
      input.documentsChecked!==true||
      input.declarationAcknowledged!==true)
    deny('REVIEW_CONFIRMATION_REQUIRED')
  const request:ClosingMailReviewRequest={
    workshopId:input.workshopId,orderId:input.orderId,
    revisionId:input.revisionId,deliveryId:input.deliveryId
  }
  const {actorId,preview}=await build(ports,request)
  if(preview.reviewFingerprint!==input.reviewFingerprint||
      preview.recipient!==input.typedRecipient)
    deny('REVIEW_STALE_OR_RECIPIENT_CHANGED')
  if(!(await ports.recheck(request,actorId,preview.reviewFingerprint)))
    deny('REVIEW_ACCESS_REVOKED')
  const review:ImmutableMailReview={
    version:1,state:'operator_reviewed_not_sent',
    requestId:input.requestId,...request,reviewerId:actorId,
    recipient:preview.recipient,reviewFingerprint:preview.reviewFingerprint,
    documentHashes:preview.documents.map(d=>d.sha256) as [string,string,string]
  }
  const saved=await ports.recordReview(review)
  if(JSON.stringify(saved)!==JSON.stringify(review))
    deny('REVIEW_IDEMPOTENCY_CONFLICT')
  return review
}
