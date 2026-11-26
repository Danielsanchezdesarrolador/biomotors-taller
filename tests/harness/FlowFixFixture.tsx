/** FIX-01/02/03 synthetic UI ports. No hosted client, credentials or persistence. */
import {useEffect,useState} from 'react'
import type {Context} from '../../src/auth/controller'
import {Workspace} from '../../src/guided/GuidedWorkspace'
import {FinalArchivePanel} from '../../src/expedientes/FinalArchivePanel'
import {finalArchiveFixture,id} from '../fixtures/finalArchive'
import {quotePdf} from '../../src/cp05/pdf'
import {closingDocumentPdf} from '../../src/entrega/finalPdf'
import {prepareClosingPacket} from '../../src/entrega/finalPackage'
import {verifyArchivedBytes,type ArchiveRow,type ArchiveDocumentSet} from '../../src/expedientes/contracts'
import {multipuntoFinding,multipuntoTemplateItems} from '../../src/ordenes/cp04Multipunto'
import type {Finding} from '../../src/ordenes/cp04Contracts'
import '../../src/official/official.css'
export default function FlowFixFixture(){const [props,setProps]=useState<Parameters<typeof Workspace>[0]|null>(null),[closed,setClosed]=useState(false)
 useEffect(()=>{let active=true;void (async()=>{
 const mode=new URLSearchParams(location.search).get('mode')||'inspection',complete=new URLSearchParams(location.search).get('complete')==='true'
 const s=(await finalArchiveFixture()).snapshot,q=s.quote,r=s.revision,wid=q.workshop_id
 s.evidence.approvals[0].note='';s.evidence.deliveries[0].handover_note='';s.evidence.executions[0].pending_note='No'
 const context={userId:id(7),role:'owner',workshop:{id:wid,name:'Taller sintético FIX',status:'active'}} as Context
 const asset=async(path:string)=>new Uint8Array(await (await fetch(path)).arrayBuffer())
 const assets={font:await asset('/cp05/DejaVuSans.ttf'),boldFont:await asset('/cp05/DejaVuSans-Bold.ttf'),logo:await asset('/icon-192.png'),wordmark:await asset('/cp05/wordmark.png')}
 const hash=async(b:Uint8Array)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b.slice().buffer))).map(x=>x.toString(16).padStart(2,'0')).join('')
 const originalQuote=await quotePdf(r.payload,assets);r.pdf_sha256=await hash(originalQuote);r.pdf_size=originalQuote.length
 const packet=prepareClosingPacket(q,r,s.evidence),bytes={quote:originalQuote,report:await closingDocumentPdf(packet,'report',assets),handover:await closingDocumentPdf(packet,'handover',assets)}
 const docs=await Promise.all((['quote','report','handover'] as const).map(async kind=>({kind,fileName:'FIX-'+kind+'.pdf',sha256:await hash(bytes[kind]),byteLength:bytes[kind].length,bucket:kind==='quote'?'cp05-quote-documents':'bt-closing-documents',path:kind==='quote'?r.pdf_object_path:wid+'/closings/'+q.order_id+'/'+r.id+'/'+s.evidence.deliveries[0].id+'/'+kind+'/'+await hash(bytes[kind])+'.pdf',contentType:'application/pdf' as const})))
 if(!active)return
 const stats={archives:0,reads:[] as {revision:string;kind:string}[],metadata:0,identityReads:[] as string[],closes:0,renders:3,ids:{order:q.order_id,revision:r.id},hashes:Object.fromEntries(docs.map(d=>[d.kind,d.sha256]))};(window as unknown as {flowFix:typeof stats}).flowFix=stats
 let archived=complete
 const archive={dispose(){},list:async()=>{throw Error('FIXED_ROW_REQUIRED')},documents:async(rid:string):Promise<ArchiveDocumentSet>=>{if(rid!==r.id)throw Error('WRONG_REVISION');stats.metadata++;return {workshopId:wid,orderId:q.order_id,vehicleId:q.vehicle_id,customerId:q.customer_id,quoteId:q.id,revisionId:r.id,revision:r.revision,issuedAt:r.issued_at,complete:archived,documents:archived?docs:docs.slice(0,1)}},archive:async(selected:ArchiveRow)=>{if(selected.orderId!==q.order_id||selected.revisionId!==r.id)throw Error('WRONG_VISIT');stats.archives++;archived=true;return {revisionId:r.id,confirmed:true as const}},bytes:async(rid:string,kind:keyof typeof bytes)=>{if(rid!==r.id||!archived)throw Error('WRONG_REVISION');const doc=docs.find(d=>d.kind===kind)!;stats.reads.push({revision:rid,kind});return {bytes:await verifyArchivedBytes(bytes[kind],doc),doc}}}
 const items=multipuntoTemplateItems(),scopeRows:Finding[]=(complete||mode!=='inspection'?items:items.slice(0,1)).map(item=>{const f=multipuntoFinding(item.id,complete||mode!=='inspection'?'ok':'attention',complete||mode!=='inspection'?'':'No',q.order_id,q.vehicle_id);return {...f,workshop_id:wid,id:crypto.randomUUID(),recorded_by:id(7),resolution:f.result==='attention'?'pending':'not_applicable',resolved_at:null,created_at:r.issued_at,updated_at:r.issued_at}})
 const current={order:{...r.payload.order,workshop_id:wid,vehicle_id:q.vehicle_id,status:mode==='inspection'?'inspecting':'ready',updated_at:r.issued_at,cancelled_at:null,intake_phase:'received'},vehicle:{...r.payload.vehicle,workshop_id:wid,customer_id:q.customer_id}}
 const p={directory:{recentCustomers:async()=>[],vehiclesForCustomer:async()=>[],search:async()=>({customers:[],vehicles:[]}),getVehicle:async()=>current.vehicle,getCustomer:async()=>({...r.payload.customer,workshop_id:wid,archived_at:null})},orders:{recentOrders:async()=>[current],getOrder:async(oid:string)=>oid===q.order_id?structuredClone(current):null,findingsForOrder:async()=>structuredClone(scopeRows),createFinding:()=>new Promise(()=>{}),pdfIdentity:async(oid:string)=>{stats.identityReads.push(oid);return ({workshop_id:wid,order_id:oid,vehicle_id:q.vehicle_id,customer_id:q.customer_id,ownerName:'Cliente sintético FIX',modelYear:2023})}},quotes:{forOrder:async()=>mode==='inspection'?null:q,load:async()=>({quote:q,source:{...r.payload,order:current.order},items:r.payload.items,revisions:[r],events:[],deliveries:[]})},live:{history:async()=>({approval:s.evidence.approvals[0],execution:s.evidence.executions[0],handover:s.evidence.deliveries[0]})},archive} as unknown as Parameters<typeof Workspace>[0]['p']
 if(active)setProps({context,client:{} as never,p,start:{orderId:q.order_id},onClose:()=>{stats.closes++;setClosed(true)}})
 })();return()=>{active=false}},[])
 if(closed)return <h1>Centro de operaciones · fixture</h1>
 if(!props)return <p>Preparando documentos sintéticos…</p>
 const mismatch=new URLSearchParams(location.search).get('mode')==='mismatch'
 if(mismatch){const qid=id(5),rid=id(6);const row={workshopId:id(1),orderId:id(999),vehicleId:id(3),customerId:id(2),quoteId:qid,revisionId:rid,revision:1} as ArchiveRow;return <FinalArchivePanel guided repository={props.p.archive} fixedRow={row} orderId={id(4)} revisionId={rid} vehicleId={id(3)} onBack={()=>{}}/>}
 return <><p>Laboratorio sintético FIX · sin acceso alojado</p><Workspace {...props}/></>
}
