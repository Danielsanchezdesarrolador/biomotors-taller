import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import type { Quote, Revision } from '../cp05/contracts'
import type { FlowEvidence } from '../historial/contracts'
import { prepareClosingPacket } from './finalPackage'
import { closingDocumentPdf } from './finalPdf'

const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0')
const wid=id(1),cid=id(2),vid=id(3),oid=id(4),qid=id(5),rid=id(6),uid=id(7)
const t='2026-11-18T13:00:00.123456Z'
const quote:Quote={
  id:qid,workshop_id:wid,order_id:oid,vehicle_id:vid,customer_id:cid,
  number:1,version:1,status:'issued',price_basis:'net',valid_days:30,
  terms:'',comments:'',issued_revision:1,issue_pending:false,void_reason:null,
  created_at:t,updated_at:t
}
const revision:Revision={
  workshop_id:wid,id:rid,quote_id:qid,revision:1,issued_at:t,issued_by:uid,
  payload_sha256:'a'.repeat(64),pdf_sha256:'b'.repeat(64),
  pdf_object_path:'private/r1.pdf',pdf_size:500,
  payload:{
    workshop:{id:wid,name:'Taller piloto QA'},
    customer:{id:cid,full_name:'Cliente sintético',email:null,mobile_e164:null},
    vehicle:{id:vid,plate:'QA1234',make:'Marca sintética',model:'Modelo prueba'},
    order:{id:oid,opened_at:t,complaint:'Revisar frenos',intake_odometer:12345},
    quote:{...quote,revision:1},
    items:[
      {workshop_id:wid,quote_id:qid,id:id(20),position:0,type:'Repuesto',
        description:'Pastilla de freno',quantity100:100,unit_price:100,line_net:100},
      {workshop_id:wid,quote_id:qid,id:id(21),position:1,type:'Mano de obra',
        description:'Cambio de pastillas pendiente',quantity100:100,unit_price:50,line_net:50}
    ],
    totals:{subtotal:150,tax:29,total:179},document_date:t,
    notice:'No es documento tributario'
  }
}
const approval={
  workshop_id:wid,id:id(30),order_id:oid,quote_id:qid,revision_id:rid,
  recorded_at:t,recorded_by:uid,method:'phone',
  note:'Aprobación comunicada por teléfono',evidence_status:'operator_attested' as const
}
const report={
  workshop_id:wid,id:id(31),order_id:oid,quote_id:qid,revision_id:rid,
  vehicle_id:vid,approval_id:approval.id,recorded_at:t,reviewed_by:uid,
  decisions:{[id(20)]:'performed',[id(21)]:'not_performed'},
  pending_note:'Cambio de pastillas pendiente de nueva visita.',
  quoted_net:150,quoted_tax:29,quoted_total:179,
  performed_net:100,performed_tax:19,performed_total:119,
  evidence_status:'operator_attested' as const
}
const delivery={
  workshop_id:wid,id:id(32),order_id:oid,quote_id:qid,revision_id:rid,
  vehicle_id:vid,report_id:report.id,recorded_at:t,recorded_by:uid,
  handover_method:'in_person',
  handover_note:'El operador declaró la entrega en taller de pruebas',
  checklist:{vehicleChecked:true,workChecked:true,
    documentsChecked:true,pendingExplained:true},
  evidence_status:'operator_attested' as const
}
const state=():FlowEvidence=>({
  status:'ready',approvals:[{...approval}],executions:[{...report}],
  deliveries:[{...delivery}]
})
describe('BT-COM-01 local document copies (not archived, sent or signed)',()=>{
  it('requires all three operator declarations, not merely a closed OT',()=>{
    const absent=state()
    absent.deliveries=[]
    expect(()=>prepareClosingPacket(quote,revision,absent))
      .toThrowError('unavailable')
    const unavailable=state()
    unavailable.status='unavailable'
    expect(()=>prepareClosingPacket(quote,revision,unavailable))
      .toThrowError('unavailable')
  })
  it('builds the triple packet from original immutable quote and reported amounts',()=>{
    const packet=prepareClosingPacket(quote,revision,state())
    expect(packet.state).toBe('prepared_locally_not_archived_or_emailed')
    expect(packet.quote.total).toBe(179)
    expect(packet.quote.fileName.startsWith('01_Cotizacion_')).toBe(true)
    expect(packet.report.fileName.startsWith('02_Informe_')).toBe(true)
    expect(packet.handover.fileName.startsWith('03_Entrega_')).toBe(true)
    expect(packet.report.declared.total).toBe(119)
    expect(packet.report.lines.map(x=>x.decision)).toEqual(['performed','not_performed'])
    expect(packet.report.pendingNote).toContain('pendiente')
    expect(packet.handover.checks).toHaveLength(4)
  })
  it('refuses spoofed amounts, switched tenant and missing checklist',()=>{
    const corrupt=state()
    corrupt.executions[0].performed_total=999
    expect(()=>prepareClosingPacket(quote,revision,corrupt))
      .toThrowError('unavailable')
    const crossed=state()
    crossed.deliveries[0].workshop_id=id(99)
    expect(()=>prepareClosingPacket(quote,revision,crossed))
      .toThrowError('denied')
    const missing=state()
    missing.deliveries[0].checklist.workChecked=false
    expect(()=>prepareClosingPacket(quote,revision,missing))
      .toThrowError('unavailable')
  })
  it('generates two A4 PDF copies with separate content and readable metadata',async()=>{
    const packet=prepareClosingPacket(quote,revision,state())
    const assets={
      font:new Uint8Array(readFileSync('public/cp05/DejaVuSans.ttf')),
      logo:new Uint8Array(readFileSync('assets/brand/generated/icon-192.png'))
    }
    for(const kind of ['report','handover'] as const){
      const bytes=await closingDocumentPdf(packet,kind,assets)
      expect(bytes.byteLength).toBeGreaterThan(2000)
      const pdf=await PDFDocument.load(bytes)
      expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1)
      expect(pdf.getTitle()).toContain(kind==='report'?'INFORME':'CONSTANCIA')
      const page=pdf.getPage(0).getSize()
      expect(page.width).toBeCloseTo(595.28,1)
      expect(page.height).toBeCloseTo(841.89,1)
    }
  })
  it('pages lengthy item descriptions without a single clipped fixed-width row',async()=>{
    const expanded={...revision,payload:{
      ...revision.payload,
      items:Array.from({length:120},(_,i)=>({
        ...revision.payload.items[0],id:id(100+i),position:i,
        description:'Descripción técnica de trabajo y revisión de componentes '.repeat(2),
        line_net:100
      })),
      totals:{subtotal:12000,tax:2280,total:14280}
    }}
    const ev=state()
    ev.executions[0]={
      ...ev.executions[0],
      decisions:Object.fromEntries(expanded.payload.items.map(x=>[x.id,'performed'])),
      pending_note:'',quoted_net:12000,quoted_tax:2280,quoted_total:14280,
      performed_net:12000,performed_tax:2280,performed_total:14280
    }
    const packet=prepareClosingPacket(quote,expanded,ev)
    const bytes=await closingDocumentPdf(packet,'report',{
      font:new Uint8Array(readFileSync('public/cp05/DejaVuSans.ttf')),
      logo:new Uint8Array(readFileSync('assets/brand/generated/icon-192.png'))
    })
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(2)
  })
})
