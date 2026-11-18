import { describe, expect, it, vi } from 'vitest'
import type { Quote, Revision } from '../cp05/contracts'
import type { FlowEvidence } from '../historial/contracts'
import { archiveClosingCandidate, CLOSING_ARCHIVE_BUCKET_CANDIDATE,
  type ClosingArchiveManifest, type ClosingArchivePorts,
  type VerifiedClosingSnapshot } from '../../server/com/closingArchiveCandidate'

const id=(n: number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0')
const wid=id(1), customerId=id(2), vehicleId=id(3), orderId=id(4),
  quoteId=id(5), revisionId=id(6), actorId=id(7), requestId=id(8),
  approvalId=id(30), reportId=id(31), deliveryId=id(32)
const stamp='2026-11-18T18:00:00.123456Z'
const pdf=(kind: string)=>
  new TextEncoder().encode('%PDF-1.7\nSynthetic local '+kind+' – no customer data\n%%EOF\n')
const sha=async (bytes: Uint8Array)=>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes.slice().buffer)))
    .map(x=>x.toString(16).padStart(2,'0')).join('')
const request={workshopId:wid,orderId,revisionId,deliveryId,requestId}
async function fixture(){
  const quotePdf=pdf('original issued quote'), reportPdf=pdf('work report'),
    handoverPdf=pdf('operator handover')
  const quoteHash=await sha(quotePdf)
  const quote:Quote={
    id:quoteId,workshop_id:wid,order_id:orderId,vehicle_id:vehicleId,
    customer_id:customerId,number:123,version:1,status:'issued',
    price_basis:'net',valid_days:30,terms:'QA',comments:'',
    issued_revision:1,issue_pending:false,void_reason:null,
    created_at:stamp,updated_at:stamp
  }
  const revision:Revision={
    workshop_id:wid,id:revisionId,quote_id:quoteId,revision:1,
    issued_at:stamp,issued_by:actorId,
    payload_sha256:'a'.repeat(64),pdf_sha256:quoteHash,
    pdf_object_path:wid+'/quotes/'+quoteId+'/r1/'+'a'.repeat(64)+'.pdf',
    pdf_size:quotePdf.length,
    payload:{
      workshop:{id:wid,name:'Taller QA sin clientes reales'},
      customer:{id:customerId,full_name:'Cliente sintético',email:null,mobile_e164:null},
      vehicle:{id:vehicleId,plate:'QA1234',make:'Auto',model:'Sintético'},
      order:{id:orderId,opened_at:stamp,complaint:'Frenos de prueba',intake_odometer:1234},
      quote:{...quote,revision:1},
      items:[
        {workshop_id:wid,quote_id:quoteId,id:id(20),position:0,type:'Servicio',
          description:'Diagnóstico QA',quantity100:100,unit_price:100,line_net:100},
        {workshop_id:wid,quote_id:quoteId,id:id(21),position:1,type:'Repuesto',
          description:'Repuesto QA pendiente',quantity100:100,unit_price:50,line_net:50}
      ],
      totals:{subtotal:150,tax:29,total:179},
      document_date:stamp,notice:'Documento no tributario'
    }
  }
  const evidence:FlowEvidence={
    status:'ready',
    approvals:[{
      workshop_id:wid,id:approvalId,order_id:orderId,
      quote_id:quoteId,revision_id:revisionId,evidence_status:'operator_attested',
      recorded_at:stamp,recorded_by:actorId,method:'phone',
      note:'Aprobación declarada por teléfono para la prueba'
    }],
    executions:[{
      workshop_id:wid,id:reportId,order_id:orderId,vehicle_id:vehicleId,
      quote_id:quoteId,revision_id:revisionId,approval_id:approvalId,
      evidence_status:'operator_attested',recorded_at:stamp,reviewed_by:actorId,
      decisions:{[id(20)]:'performed',[id(21)]:'not_performed'},
      pending_note:'Repuesto no efectuado. Declaración del taller.',
      quoted_net:150,quoted_tax:29,quoted_total:179,
      performed_net:100,performed_tax:19,performed_total:119
    }],
    deliveries:[{
      workshop_id:wid,id:deliveryId,order_id:orderId,vehicle_id:vehicleId,
      quote_id:quoteId,revision_id:revisionId,report_id:reportId,
      evidence_status:'operator_attested',recorded_at:stamp,recorded_by:actorId,
      checklist:{vehicleChecked:true,workChecked:true,
        documentsChecked:true,pendingExplained:true},
      handover_method:'in_person',
      handover_note:'Entrega declarada al operador en visita QA'
    }]
  }
  const snapshot:VerifiedClosingSnapshot={
    quote,revision,evidence,
    quoteArchive:{
      path:revision.pdf_object_path,sha256:quoteHash,byteLength:quotePdf.length
    },
    currentIssuedRevision:true,confirmedDelivery:true,workshopActive:true,
    actorRole:'owner'
  }
  const archived=new Map<string,Uint8Array>()
  const commits=new Map<string,ClosingArchiveManifest>()
  const state={
    confirmed:true,access:true,corruptReadBack:false,originalCorrupt:false,
    wrongRole:false,changedReport:false,renderInvalid:false
  }
  const authenticate=vi.fn(async()=>({id:actorId,confirmed:state.confirmed}))
  const load=vi.fn(async()=>({
    ...snapshot,actorRole:state.wrongRole?'mechanic' as const:snapshot.actorRole
  }))
  const originalPdf=vi.fn(async()=>state.originalCorrupt
    ?pdf('different original quote'):quotePdf)
  const render=vi.fn(async (_packet:unknown,kind:'report'|'handover')=>
    state.renderInvalid?new TextEncoder().encode('not a PDF'):
      kind==='report'&&state.changedReport?pdf('other work report'):
      kind==='report'?reportPdf:handoverPdf)
  const putIfAbsent=vi.fn(async(path:string,bytes:Uint8Array)=>{
    if(!archived.has(path))archived.set(path,bytes.slice())
  })
  const readBack=vi.fn(async(path:string)=>{
    const bytes=archived.get(path)
    if(!bytes)throw Error('ARCHIVE_UNAVAILABLE')
    return state.corruptReadBack?pdf('tampered receipt'):bytes.slice()
  })
  const recheck=vi.fn(async()=>state.access)
  const commit=vi.fn(async(_rid:string,manifest:ClosingArchiveManifest)=>{
    const key=manifest.workshopId+':'+manifest.revisionId+':'+manifest.deliveryId
    const previous=commits.get(key)
    if(previous)return previous
    commits.set(key,structuredClone(manifest))
    return manifest
  })
  const ports:ClosingArchivePorts={
    authenticate,load,originalPdf,render,putIfAbsent,readBack,recheck,commit
  }
  return {ports,commits,archived,state,snapshot,
    authenticate,load,originalPdf,render,putIfAbsent,readBack,recheck,commit}
}
describe('BT-COM-01A server closing manifest candidate; all IO synthetic',()=>{
  it('remains blocked with gate OFF and makes zero calls',async()=>{
    const f=await fixture()
    await expect(archiveClosingCandidate({approved:false},f.ports,request))
      .rejects.toThrow('CLOSING_ARCHIVE_DISABLED')
    expect(f.authenticate).not.toHaveBeenCalled()
    expect(f.putIfAbsent).not.toHaveBeenCalled()
    expect(f.commit).not.toHaveBeenCalled()
  })
  it('rejects malformed, other-tenant and other-revision identifiers',async()=>{
    const f=await fixture()
    await expect(archiveClosingCandidate({approved:true},f.ports,
      {...request,workshopId:'../outside'}))
      .rejects.toThrow('INVALID_CLOSING_REQUEST')
    expect(f.authenticate).not.toHaveBeenCalled()
    await expect(archiveClosingCandidate({approved:true},f.ports,
      {...request,workshopId:id(99)}))
      .rejects.toThrow('CLOSING_ARCHIVE_SOURCE_MISMATCH')
    await expect(archiveClosingCandidate({approved:true},f.ports,
      {...request,revisionId:id(99)}))
      .rejects.toThrow('CLOSING_ARCHIVE_SOURCE_MISMATCH')
    expect(f.originalPdf).not.toHaveBeenCalled()
  })
  it('denies absent confirmation, mechanic and revoked workshop before Storage',async()=>{
    const f=await fixture()
    f.state.confirmed=false
    await expect(archiveClosingCandidate({approved:true},f.ports,request))
      .rejects.toThrow('CLOSING_ARCHIVE_SESSION_REQUIRED')
    f.state.confirmed=true
    f.state.wrongRole=true
    await expect(archiveClosingCandidate({approved:true},f.ports,request))
      .rejects.toThrow('CLOSING_ARCHIVE_NOT_AUTHORIZED')
    f.state.wrongRole=false
    f.snapshot.workshopActive=false
    await expect(archiveClosingCandidate({approved:true},f.ports,request))
      .rejects.toThrow('CLOSING_ARCHIVE_NOT_AUTHORIZED')
    expect(f.putIfAbsent).not.toHaveBeenCalled()
  })
  it('produces ordered three-document manifest with the ORIGINAL frozen quote PDF',async()=>{
    const f=await fixture()
    const m=await archiveClosingCandidate({approved:true},f.ports,request)
    expect(m.state).toBe('prepared_not_sent')
    expect(m.version).toBe(1)
    expect(m.workshopId).toBe(wid)
    expect(m.sourceBundleId).toBe(revisionId+':'+reportId+':'+deliveryId)
    expect(m.documents.map(d=>d.kind)).toEqual(['quote','report','handover'])
    expect(m.documents.map(d=>d.bucket)).toEqual([
      'cp05-quote-documents',CLOSING_ARCHIVE_BUCKET_CANDIDATE,
      CLOSING_ARCHIVE_BUCKET_CANDIDATE
    ])
    expect(m.documents.map(d=>d.fileName.startsWith(
      d.kind==='quote'?'01_':d.kind==='report'?'02_':'03_'))).toEqual([true,true,true])
    expect(m.documents[0].path).toBe(f.snapshot.revision.pdf_object_path)
    expect(f.putIfAbsent).toHaveBeenCalledTimes(2)
    expect(f.originalPdf).toHaveBeenCalledTimes(1)
    expect(f.render).toHaveBeenCalledTimes(2)
    expect(f.recheck).toHaveBeenCalledOnce()
    expect(f.commit).toHaveBeenCalledOnce()
    expect(f.archived.size).toBe(2)
    expect(m.documents[1].path).toContain('/report/')
    expect(m.documents[2].path).toContain('/handover/')
    expect(JSON.stringify(m)).not.toContain('@invalid')
    expect(JSON.stringify(m)).not.toContain('password')
  })
  it('is idempotent across same revision / delivery without overwrite',async()=>{
    const f=await fixture()
    const a=await archiveClosingCandidate({approved:true},f.ports,request)
    const b=await archiveClosingCandidate({approved:true},f.ports,request)
    expect(a).toEqual(b)
    expect(f.archived.size).toBe(2)
    expect(f.commits.size).toBe(1)
    expect(f.putIfAbsent).toHaveBeenCalledTimes(4)
    expect(f.commit).toHaveBeenCalledTimes(2)
  })
  it('refuses changed bytes for same locked revision rather than silently replacing archive',async()=>{
    const f=await fixture()
    await archiveClosingCandidate({approved:true},f.ports,request)
    const [prior] = [...f.archived.values()].map(v=>v.slice())
    f.state.changedReport=true
    await expect(archiveClosingCandidate({approved:true},f.ports,request))
      .rejects.toThrow('CLOSING_ARCHIVE_COMMIT_MISMATCH')
    expect(f.commits.size).toBe(1)
    expect(f.archived.size).toBe(3)
    expect([...f.archived.values()][0]).toEqual(prior)
  })
  it('blocks corrupted original quote and corrupted private Storage readback',async()=>{
    const f=await fixture()
    f.state.originalCorrupt=true
    await expect(archiveClosingCandidate({approved:true},f.ports,request))
      .rejects.toThrow('CLOSING_ARCHIVE_INTEGRITY')
    expect(f.putIfAbsent).not.toHaveBeenCalled()
    f.state.originalCorrupt=false
    f.state.corruptReadBack=true
    await expect(archiveClosingCandidate({approved:true},f.ports,request))
      .rejects.toThrow('CLOSING_ARCHIVE_INTEGRITY')
    expect(f.commits.size).toBe(0)
  })
  it('refuses invalid report bytes and fabricated monetary decision from server row',async()=>{
    const f=await fixture()
    f.state.renderInvalid=true
    await expect(archiveClosingCandidate({approved:true},f.ports,request))
      .rejects.toThrow('INVALID_CLOSING_PDF')
    expect(f.putIfAbsent).not.toHaveBeenCalled()
    f.state.renderInvalid=false
    f.snapshot.evidence.executions[0].performed_total=999999
    await expect(archiveClosingCandidate({approved:true},f.ports,request))
      .rejects.toThrow('unavailable')
    expect(f.render).toHaveBeenCalledTimes(2)
    expect(f.commit).not.toHaveBeenCalled()
  })
  it('does not commit after a mid-flight revocation; never pretends email was sent',async()=>{
    const f=await fixture()
    f.state.access=false
    await expect(archiveClosingCandidate({approved:true},f.ports,request))
      .rejects.toThrow('CLOSING_ARCHIVE_REVOKED')
    expect(f.archived.size).toBe(2)
    expect(f.commit).not.toHaveBeenCalled()
    f.state.access=true
    const manifest=await archiveClosingCandidate({approved:true},f.ports,request)
    expect(manifest.state).toBe('prepared_not_sent')
    expect(f.commits.size).toBe(1)
  })
  it('blocks a stale revision and missing prior delivery without writing',async()=>{
    const f=await fixture()
    f.snapshot.currentIssuedRevision=false
    await expect(archiveClosingCandidate({approved:true},f.ports,request))
      .rejects.toThrow('CLOSING_ARCHIVE_NOT_AUTHORIZED')
    f.snapshot.currentIssuedRevision=true
    f.snapshot.confirmedDelivery=false
    await expect(archiveClosingCandidate({approved:true},f.ports,request))
      .rejects.toThrow('CLOSING_ARCHIVE_NOT_AUTHORIZED')
    expect(f.putIfAbsent).not.toHaveBeenCalled()
  })
})
