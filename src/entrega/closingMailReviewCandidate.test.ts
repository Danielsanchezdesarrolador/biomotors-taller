import { describe, expect, it, vi } from 'vitest'
import type { ClosingArchiveManifest } from '../../server/com/closingArchiveCandidate'
import {
  prepareClosingMailReviewCandidate, confirmClosingMailReviewCandidate,
  type MailReviewCandidatePorts, type ClosingMailRead, type ImmutableMailReview
} from '../../server/com/closingMailReviewCandidate'

const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0')
const wid=id(1),orderId=id(2),quoteId=id(3),revisionId=id(4),
  reportId=id(5),deliveryId=id(6), approvalId=id(7), actorId=id(8),requestId=id(9)
const testRequest={workshopId:wid,orderId,revisionId,deliveryId}
const H=(n:string)=>n.repeat(64)
const mail='cliente.qa@invalid.test'
const manifest:ClosingArchiveManifest={
  version:1,state:'prepared_not_sent',workshopId:wid,orderId,
  quoteId,revisionId,revisionNumber:2,approvalId,reportId,deliveryId,
  sourceBundleId:[revisionId,reportId,deliveryId].join(':'),
  sourcePayloadSha256:H('a'),actorId,
  documents:[
    {
      kind:'quote',fileName:'01_Cotizacion_OTQA_R2.pdf',
      bucket:'cp05-quote-documents',
      path:`${wid}/quotes/${quoteId}/r2/${H('a')}.pdf`,
      sha256:H('b'),byteLength:1234,contentType:'application/pdf'
    },
    {
      kind:'report',fileName:'02_Informe_OTQA_R2.pdf',
      bucket:'bt-closing-documents',
      path:`${wid}/closings/${orderId}/${revisionId}/${deliveryId}/report/${H('c')}.pdf`,
      sha256:H('c'),byteLength:2234,contentType:'application/pdf'
    },
    {
      kind:'handover',fileName:'03_Entrega_OTQA_R2.pdf',
      bucket:'bt-closing-documents',
      path:`${wid}/closings/${orderId}/${revisionId}/${deliveryId}/handover/${H('d')}.pdf`,
      sha256:H('d'),byteLength:3234,contentType:'application/pdf'
    }
  ]
}
function fixture(){
  const state={
    confirmed:true,validAccess:true,documentsVerified:true,
    role:'admin' as ClosingMailRead['memberRole'],
    recipient:mail,revisionCurrent:true,deliveryRecorded:true,
    workshopActive:true,memberActive:true,
    manifest:structuredClone(manifest)
  }
  const records=new Map<string,ImmutableMailReview>()
  const authenticate=vi.fn(async()=>({id:actorId,confirmed:state.confirmed}))
  const load=vi.fn(async()=>({
    manifest:state.manifest,
    recipientFromServer:state.recipient,
    customerName:'Cliente de QA',
    workshopName:'Taller de pruebas R2',
    vehicleDescription:'Auto QA1234',
    memberRole:state.role,
    memberActive:state.memberActive,
    workshopActive:state.workshopActive,
    deliveryRecorded:state.deliveryRecorded,
    revisionCurrent:state.revisionCurrent,
    documentsVerified:state.documentsVerified
  } satisfies ClosingMailRead))
  const recheck=vi.fn(async()=>state.validAccess)
  const recordReview=vi.fn(async(review:ImmutableMailReview)=>{
    const key=review.workshopId+':'+review.requestId
    if(records.has(key))return records.get(key)!
    records.set(key,structuredClone(review))
    return review
  })
  const ports:MailReviewCandidatePorts={
    authenticate,load,recheck,recordReview
  }
  return {state,records,ports,authenticate,load,recheck,recordReview}
}
async function confirmation(f:ReturnType<typeof fixture>){
  const p=await prepareClosingMailReviewCandidate({approved:true},f.ports,testRequest)
  return {
    ...testRequest,requestId,reviewFingerprint:p.reviewFingerprint,
    typedRecipient:p.recipient,
    recipientChecked:true as const,documentsChecked:true as const,
    declarationAcknowledged:true as const
  }
}
describe('BT-COM-01B: offline recipient and triple-PDF operator review (NEVER send)',()=>{
  it('gate OFF blocks preview and confirmation without authentication or writes',async()=>{
    const f=fixture()
    await expect(prepareClosingMailReviewCandidate({approved:false},f.ports,testRequest))
      .rejects.toThrow('MAIL_REVIEW_DISABLED')
    await expect(confirmClosingMailReviewCandidate({approved:false},f.ports,
      {} as never)).rejects.toThrow('MAIL_REVIEW_DISABLED')
    expect(f.authenticate).not.toHaveBeenCalled()
    expect(f.load).not.toHaveBeenCalled()
    expect(f.recordReview).not.toHaveBeenCalled()
  })
  it('previews exact 3 historical PDF references in order, recipient and text/plain disclaimers',async()=>{
    const f=fixture()
    const p=await prepareClosingMailReviewCandidate({approved:true},f.ports,testRequest)
    expect(p.state).toBe('preview_only_not_sent')
    expect(p.recipient).toBe(mail)
    expect(p.documents.map(d=>d.kind)).toEqual(['quote','report','handover'])
    expect(p.documents.map(d=>d.sha256)).toEqual([H('b'),H('c'),H('d')])
    expect(p.reviewFingerprint).toMatch(/^[a-f0-9]{64}$/)
    expect(p.subject).toContain('Taller de pruebas R2')
    expect(p.bodyText).toContain('No acredita firma')
    expect(p.warning).toContain('No se ha enviado ningún correo')
    expect(p.bodyText).toContain('firma')
    expect(p.bodyText).not.toMatch(/pago confirmado|correo enviado/)
    expect(f.recheck).not.toHaveBeenCalled()
    expect(f.recordReview).not.toHaveBeenCalled()
  })
  it('rejects other workshop/order/revision/delivery even if session is valid',async()=>{
    for(const field of ['workshopId','orderId','revisionId','deliveryId'] as const){
      const f=fixture()
      await expect(prepareClosingMailReviewCandidate({approved:true},f.ports,
        {...testRequest,[field]:id(99)})).rejects.toThrow('REVIEW_DOCUMENTS_INVALID')
      expect(f.recordReview).not.toHaveBeenCalled()
    }
  })
  it('rejects invalid UUID before access to private ports',async()=>{
    const f=fixture()
    await expect(prepareClosingMailReviewCandidate({approved:true},f.ports,
      {...testRequest,deliveryId:'../../other-tenant'}))
      .rejects.toThrow('INVALID_REVIEW_REQUEST')
    expect(f.authenticate).not.toHaveBeenCalled()
  })
  it('denies mechanic, revoked membership, inactive workshop and unconfirmed user',async()=>{
    const f=fixture()
    f.state.role='mechanic'
    await expect(prepareClosingMailReviewCandidate({approved:true},f.ports,testRequest))
      .rejects.toThrow('REVIEW_ACCESS_DENIED')
    f.state.role='admin'
    f.state.memberActive=false
    await expect(prepareClosingMailReviewCandidate({approved:true},f.ports,testRequest))
      .rejects.toThrow('REVIEW_ACCESS_DENIED')
    f.state.memberActive=true
    f.state.workshopActive=false
    await expect(prepareClosingMailReviewCandidate({approved:true},f.ports,testRequest))
      .rejects.toThrow('REVIEW_ACCESS_DENIED')
    f.state.workshopActive=true
    f.state.confirmed=false
    await expect(prepareClosingMailReviewCandidate({approved:true},f.ports,testRequest))
      .rejects.toThrow('REVIEW_SESSION_REQUIRED')
  })
  it('requires server-verified attachments, current revision and recorded delivery',async()=>{
    const f=fixture()
    for(const name of ['documentsVerified','revisionCurrent','deliveryRecorded'] as const){
      f.state[name]=false
      await expect(prepareClosingMailReviewCandidate({approved:true},f.ports,testRequest))
        .rejects.toThrow('REVIEW_ACCESS_DENIED')
      f.state[name]=true
    }
  })
  it('rejects absent, changed or header-injection recipient',async()=>{
    const f=fixture()
    for(const value of ['', 'qa@invalid.test\nBcc: stolen@invalid.test',
      'not-email', 'bad..name@invalid.test', ' space@invalid.test',
      'name@-invalid.test']){
      f.state.recipient=value
      await expect(prepareClosingMailReviewCandidate({approved:true},f.ports,testRequest))
        .rejects.toThrow('REVIEW_RECIPIENT_UNAVAILABLE')
    }
    expect(f.recordReview).not.toHaveBeenCalled()
  })
  it('rejects invalid private bucket, path, document hash or unexpected order',async()=>{
    const f=fixture()
    const cases:(()=>void)[]=[
      ()=>{f.state.manifest.documents[1].bucket='public'},
      ()=>{f.state.manifest.documents[1].path='other-workshop/report.pdf'},
      ()=>{f.state.manifest.documents[0].sha256='fake'},
      ()=>{f.state.manifest.documents[0].kind='handover'},
      ()=>{f.state.manifest.sourcePayloadSha256='bad'}
    ]
    for(const alter of cases){
      f.state.manifest=structuredClone(manifest)
      alter()
      await expect(prepareClosingMailReviewCandidate({approved:true},f.ports,testRequest))
        .rejects.toThrow('REVIEW_DOCUMENTS_INVALID')
    }
  })
  it('prevents confirmation without explicit recipient/docs/disclaimer acknowledgements',async()=>{
    const f=fixture(), c=await confirmation(f)
    for(const field of ['recipientChecked','documentsChecked','declarationAcknowledged'] as const){
      await expect(confirmClosingMailReviewCandidate({approved:true},f.ports,
        {...c,[field]:false} as never))
        .rejects.toThrow('REVIEW_CONFIRMATION_REQUIRED')
    }
    expect(f.recordReview).not.toHaveBeenCalled()
  })
  it('manual confirmation persists ONLY reviewed_not_sent, idempotently',async()=>{
    const f=fixture(), c=await confirmation(f)
    const a=await confirmClosingMailReviewCandidate({approved:true},f.ports,c)
    const b=await confirmClosingMailReviewCandidate({approved:true},f.ports,c)
    expect(a).toEqual(b)
    expect(a.state).toBe('operator_reviewed_not_sent')
    expect(a.recipient).toBe(mail)
    expect(a.documentHashes).toEqual([H('b'),H('c'),H('d')])
    expect(a.reviewerId).toBe(actorId)
    expect(f.records.size).toBe(1)
    expect(f.recheck).toHaveBeenCalledTimes(2)
    expect(f.recordReview).toHaveBeenCalledTimes(2)
    expect(Object.keys(a).join(' ')).not.toMatch(/provider|sentAt|payment|signed/)
  })
  it('disallows changed recipient, changed PDF, replayed token and missing recheck',async()=>{
    const f=fixture(),c=await confirmation(f)
    f.state.recipient='otro@invalid.test'
    await expect(confirmClosingMailReviewCandidate({approved:true},f.ports,c))
      .rejects.toThrow('REVIEW_STALE_OR_RECIPIENT_CHANGED')
    f.state.recipient=mail
    f.state.manifest.documents[1].sha256=H('e')
    f.state.manifest.documents[1].path=
      `${wid}/closings/${orderId}/${revisionId}/${deliveryId}/report/${H('e')}.pdf`
    await expect(confirmClosingMailReviewCandidate({approved:true},f.ports,c))
      .rejects.toThrow('REVIEW_STALE_OR_RECIPIENT_CHANGED')
    f.state.manifest=structuredClone(manifest)
    await expect(confirmClosingMailReviewCandidate({approved:true},f.ports,
      {...c,typedRecipient:'different@invalid.test'}))
      .rejects.toThrow('REVIEW_STALE_OR_RECIPIENT_CHANGED')
    f.state.validAccess=false
    await expect(confirmClosingMailReviewCandidate({approved:true},f.ports,c))
      .rejects.toThrow('REVIEW_ACCESS_REVOKED')
    expect(f.recordReview).not.toHaveBeenCalled()
  })
  it('same idempotency key cannot change recipient or document fingerprint',async()=>{
    const f=fixture(),c=await confirmation(f)
    await confirmClosingMailReviewCandidate({approved:true},f.ports,c)
    f.state.recipient='nueva@invalid.test'
    const newPreview=await prepareClosingMailReviewCandidate({approved:true},f.ports,testRequest)
    await expect(confirmClosingMailReviewCandidate({approved:true},f.ports,
      {...c,typedRecipient:newPreview.recipient,reviewFingerprint:newPreview.reviewFingerprint}))
      .rejects.toThrow('REVIEW_IDEMPOTENCY_CONFLICT')
    expect(f.records.size).toBe(1)
  })
  it('does not permit line-break injections into mail subject/body',async()=>{
    const f=fixture()
    f.load.mockResolvedValue({
      ...(await f.load()),
      workshopName:'Taller QA\r\nBcc: attacker@invalid.test',
      customerName:'Cliente\nInjected',
      vehicleDescription:'Auto\nFake',
    })
    const p=await prepareClosingMailReviewCandidate({approved:true},f.ports,testRequest)
    expect(p.subject).not.toContain('\n')
    expect(p.subject).not.toContain('\r')
    expect(p.bodyText).toContain('Taller QA Bcc: attacker@invalid.test')
    expect(f.recordReview).not.toHaveBeenCalled()
  })
})
