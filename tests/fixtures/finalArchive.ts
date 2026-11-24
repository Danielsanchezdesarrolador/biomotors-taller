import type {Quote,Revision} from '../../src/cp05/contracts'
import type {FlowEvidence} from '../../src/historial/contracts'
import type {VerifiedClosingSnapshot} from '../../server/com/closingArchiveCandidate'
export const id=(n: number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0')
const wid=id(1), customerId=id(2), vehicleId=id(3), orderId=id(4),
  quoteId=id(5), revisionId=id(6), actorId=id(7), requestId=id(8),
  approvalId=id(30), reportId=id(31), deliveryId=id(32)
const stamp='2026-11-18T18:00:00.123456Z'
const pdf=(kind: string)=>
  new TextEncoder().encode('%PDF-1.7\nSynthetic local '+kind+' – no customer data\n%%EOF\n')
const sha=async (bytes: Uint8Array)=>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes.slice().buffer)))
    .map(x=>x.toString(16).padStart(2,'0')).join('')
export const request={workshopId:wid,orderId,revisionId,deliveryId,requestId}
export async function finalArchiveFixture(){
  const quotePdf=pdf('original issued quote')
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
  return {snapshot,quoteBytes:quotePdf}
}
