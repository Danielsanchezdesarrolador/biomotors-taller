/** Isolated synthetic UI harness; never imported by the production graph. */
import {useEffect,useState} from 'react'
import {AppShell} from '../../src/layout/AppShell'
import {executionPreview} from '../../src/entrega/executionPreview'
import {Workspace} from '../../src/guided/GuidedWorkspace'
import {multipuntoTemplateItems,multipuntoFinding} from '../../src/ordenes/cp04Multipunto'
import {finalArchiveFixture} from '../fixtures/finalArchive'
import type {Context} from '../../src/auth/controller'
const wid='c943ad51-6d90-447b-8aa7-68866f69a4bc',id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0')
const customer={id:id(2),workshop_id:wid,full_name:'Cliente ficticio UX',archived_at:null,email:null,mobile_e164:null,notes:null,created_at:'2026-11-24',updated_at:'2026-11-24'}
const vehicle={id:id(3),workshop_id:wid,customer_id:customer.id,plate:'QA1234',make:'Vehículo',model:'Ficticio',model_year:2023,odometer_km:12000,archived_at:null,created_at:'2026-11-24',updated_at:'2026-11-24'}
let creates=0
const saved=new Map<string,typeof record>()
const secondVehicle={...vehicle,id:id(9),plate:"QA5678"}
const record={order:{id:id(4),workshop_id:wid,vehicle_id:vehicle.id,status:'received',cancelled_at:null,complaint:'Recepción ficticia',intake_odometer:12000,updated_at:'2026-11-24'},vehicle}
const context={userId:id(1),role:'owner',workshop:{id:wid,name:'Taller ficticio · entorno local',status:'active'}} as Context
const p={directory:{recentCustomers:async()=>[customer],search:async()=>({customers:[customer],vehicles:[vehicle]}),getCustomer:async()=>customer,getVehicle:async(id:string)=>id===secondVehicle.id?secondVehicle:vehicle,vehiclesForCustomer:async()=>[vehicle,secondVehicle]},orders:{recentOrders:async()=>[...saved.values()],getOrder:async(id:string)=>saved.get(id)??null,findingsForOrder:async()=>[],createOrder:async(input:{vehicle_id:string;complaint:string})=>{creates++;const v=input.vehicle_id===secondVehicle.id?secondVehicle:vehicle;const row={vehicle:v,order:{...record.order,id:id(10+creates),vehicle_id:v.id,complaint:input.complaint}};saved.set(row.order.id,row);return row.order}},quotes:{forOrder:async()=>null},live:{},archive:{}} as unknown as Parameters<typeof Workspace>[0]['p']
function BasicFixture(){const [open,setOpen]=useState(true),[start,setStart]=useState<{vehicleId?:string;orderId?:string}>({});return <><h1>Inicio · fixture sin Supabase</h1><button onClick={()=>{setStart({});setOpen(true)}}>Abrir recorrido</button><button onClick={()=>{setStart({vehicleId:secondVehicle.id});setOpen(true)}}>Abrir desde segundo vehículo</button><button onClick={()=>{setStart({orderId:[...saved.keys()][0]});setOpen(true)}}>Abrir desde OT</button><output data-testid="create-count">{creates}</output>{open&&<Workspace start={start} client={{} as never} context={context} p={p} onClose={()=>setOpen(false)}/>}</>}

function FixtureContent(){
 const scene=Number(new URLSearchParams(location.search).get('stage')??0)
 const [fixture,setFixture]=useState<Parameters<typeof Workspace>[0]|null>(null)
 useEffect(()=>{if(scene<3)return;void finalArchiveFixture().then(f=>{
 const snapshot=JSON.parse(JSON.stringify(f.snapshot).replaceAll('00000000-0000-4000-8000-000000000001',wid))
 const q={...snapshot.quote,status:scene===3?'draft':'issued'}
 const r=snapshot.revision
 const h={approval:scene>4?snapshot.evidence.approvals[0]:null,execution:scene>5?snapshot.evidence.executions[0]:null,handover:scene>6?snapshot.evidence.deliveries[0]:null}
 const diagnostics={writes:0,archives:0,transitions:[] as string[]};(window as unknown as {r1:typeof diagnostics}).r1=diagnostics
 const failure=new URLSearchParams(location.search).get('failure')
 const client={rpc:async(name:string,args:Record<string,unknown>)=>{if(name==='bt_flow_record_execution'){if(!['in_service','ready'].includes(row.order.status))return {error:{code:'55000',message:'BT_FLOW_ORDER_NOT_READY'},data:null};diagnostics.writes++;const preview=executionPreview(r,q,{decisions:args.p_decisions as never,pendingExplanation:String(args.p_pending_note),operatorReviewed:true});h.execution={...snapshot.evidence.executions[0],request_id:args.p_request_id,reviewed_by:context.userId,decisions:args.p_decisions,pending_note:args.p_pending_note,performed_net:preview.executed.subtotal,performed_tax:preview.executed.tax,performed_total:preview.executed.total};return {data:h.execution,error:null}}if(name==='bt_flow_record_handover'){if(row.order.status!=='ready')return {error:{code:'55000',message:'BT_FLOW_ORDER_NOT_READY'},data:null};diagnostics.writes++;h.handover={...snapshot.evidence.deliveries[0],request_id:args.p_request_id,recorded_by:context.userId,handover_method:args.p_handover_method,handover_note:args.p_handover_note};return {data:h.handover,error:null}}if(name!=='bt_flow_record_quote_approval')throw Error('Unexpected fixture write');diagnostics.writes++;if(failure==='denied')return {error:{code:'42501'},data:null};if(failure==='conflict')return {error:{code:'40001'},data:null};const result={...snapshot.evidence.approvals[0],request_id:args.p_request_id,recorded_by:context.userId,method:args.p_method,note:args.p_note};if(failure!=='unconfirmed')h.approval=result;if(failure==='lost')return {error:{code:'08006'},data:null};return {data:result,error:null}},auth:{getUser:async()=>({data:{user:{id:context.userId,email_confirmed_at:'2026-11-24'}},error:null})},from:(table:string)=>{const builder={select:()=>builder,eq:()=>builder,maybeSingle:async()=>({data:table==='bt_flow_quote_approvals'?h.approval:table==='bt_flow_execution_reports'?h.execution:h.handover,error:null})};return builder}}
 const row={...record,order:{...record.order,status:new URLSearchParams(location.search).get('status')??'ready'}}
 const documents={complete:scene===8,documents:['quote','report','handover'].map(kind=>({kind,fileName:'Documento-ficticio-'+kind+'.pdf',sha256:'a'.repeat(64),byteLength:123,bucket:kind==='quote'?'cp05-quote-documents':'bt-closing-documents',path:'fixture-only'}))}
 const archiveRow={workshopId:wid,revisionId:r.id,quoteId:q.id,orderId:q.order_id,customerId:q.customer_id,vehicleId:q.vehicle_id,revision:1,number:q.number,issuedAt:r.issued_at,customerName:'Cliente ficticio UX',plate:'QA1234',total:179,complete:documents.complete,canArchive:!documents.complete,deliveryId:snapshot.evidence.deliveries[0].id}
 const noted=multipuntoTemplateItems().slice(0,3).map((item,i)=>({...multipuntoFinding(item.id,'attention','Hallazgo ficticio que requiere atención.',q.order_id,q.vehicle_id),id:id(100+i),workshop_id:wid,recorded_by:context.userId,resolution:'pending',resolved_at:null,created_at:'2026-11-24T00:00:00Z',updated_at:'2026-11-24T00:00:00Z'}))
 let scopeRows=new URLSearchParams(location.search).has('notes')?noted:multipuntoTemplateItems().map((item,i)=>({...multipuntoFinding(item.id,'ok','',q.order_id,q.vehicle_id),id:id(200+i),workshop_id:wid,recorded_by:context.userId,resolution:'not_applicable',resolved_at:null,created_at:'2026-01-01T00:00:00Z',updated_at:'2026-01-01T00:00:00Z'}))
 const liveItems=structuredClone(r.payload.items)
 Object.assign(diagnostics,{
  changeNote(){scopeRows=scopeRows.map((row,i)=>i===0?{...row,note:'Observación técnica ampliada sin cambiar las partidas.'}:row)},
  resolve(){scopeRows=scopeRows.map(row=>({...row,resolution:'resolved',updated_at:'2030-01-01T00:00:00Z'}))},
  changeBudget(){liveItems[0].unit_price++;q.version++},
  cancelOrder(){(row.order as {cancelled_at:string|null}).cancelled_at='2026-11-25T00:00:00Z'}
 })
 const pp={...p,orders:{...p.orders,recentOrders:async()=>[row],getOrder:async()=>structuredClone(row),setStatus:async(_id:string,stamp:string,next:string)=>{if(stamp!==row.order.updated_at)throw Error('conflict');row.order.status=next;row.order.updated_at=String(Number.isFinite(Number(stamp))?Number(stamp)+1:1);diagnostics.transitions.push(next);return {...row.order}},findingsForOrder:async()=>structuredClone(scopeRows)},quotes:{...p.quotes,revise:async()=>{q.status='draft';q.version++;diagnostics.writes++;return {quote:{...q},source:{...r.payload,order:row.order},items:structuredClone(liveItems),revisions:[r],deliveries:[],events:[]}},list:async()=>[q], orders:async()=>[row],forOrder:async()=>({...q}),load:async()=>({quote:{...q},source:{...r.payload,order:row.order},items:structuredClone(liveItems),revisions:scene===3?[]:[r],deliveries:[],events:[]}),documents:{enabled:false,emailEnabled:false}},live:{history:async()=>h},archive:{...p.archive,documents:async()=>({...documents,documents:documents.complete?documents.documents:documents.documents.slice(0,1)}),list:async()=>[{...archiveRow,complete:documents.complete,canArchive:!documents.complete}],archive:async()=>{diagnostics.archives++;documents.complete=true}}} as unknown as Parameters<typeof Workspace>[0]['p']
 setFixture({client:client as never,context,p:pp,onClose:()=>{}})
 })},[scene])
 return scene<3?<BasicFixture/>:fixture?<Workspace {...fixture}/>:<p>Preparando datos ficticios…</p>
}

export default function GuidedFixture(){
 const content=<FixtureContent/>
 if(!new URLSearchParams(location.search).has('shell'))return content
 return <AppShell screen="ordenes" onNavigate={()=>{}} copy={{workshopTitle:'Taller sintético de revisión',workshopSubtitle:'Revisión visual local',workshopStatus:'Administrador',version:'ByteTorque · Gestión de talleres',accountTitle:'Operador de prueba',accountSubtitle:'Administrador',notifications:'Sin notificaciones de prueba'}}><div className="visual-fixture"><style>{'.visual-fixture>h1,.visual-fixture>button,.visual-fixture>output{display:none}'}</style>{content}</div></AppShell>
}
