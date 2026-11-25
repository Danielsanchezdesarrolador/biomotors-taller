import {useEffect,useRef,useState} from 'react'
import type {AuthController,Context} from '../auth/controller'
import type {SupabaseClient} from '@supabase/supabase-js'
import {cp03PilotRepository} from '../clientes/cp03PilotRepository'
import {Cp03PilotDirectoryView} from '../clientes/cp03PilotDirectoryView'
import {cp04Repository} from '../ordenes/cp04Repository'
import {currentFindings,type OrderWithVehicle,type Finding} from '../ordenes/cp04Contracts'
import {Cp04MultipuntoChecklist} from '../ordenes/Cp04MultipuntoChecklist'
import {provisionalFinding} from '../ordenes/cp04Autosave'
import {cp05Repository} from '../cp05/repository'
import {QuotePanel} from '../cp05/QuotePanel'
import type {Quote,Revision} from '../cp05/contracts'
import {flowLiveCandidate} from '../entrega/flowLiveCandidate'
import {FlowLive02Panel} from '../entrega/FlowLive02Panel'
import {finalArchiveRepository} from '../expedientes/repository'
import type {ArchiveRow} from '../expedientes/contracts'
import {FinalArchivePanel} from '../expedientes/FinalArchivePanel'
import {canOpen,confirmedStage,type Evidence} from './progress'
import './guided.css'
const stages=['Cliente y vehículo','Recepción','Inspección multipunto','Cotización','Aprobación del cliente','Ejecución de trabajos','Entrega del vehículo','Expediente final']
const empty:Evidence={order:false,inspection:false,issued:false,approval:false,execution:false,handover:false,archive:false}
function ports(client:SupabaseClient,context:Context){
 const directory=cp03PilotRepository(client,context),orders=cp04Repository(client,context),quotes=cp05Repository(client,context),archive=finalArchiveRepository(client,context)
 const live=flowLiveCandidate(client,context,{explicitlyApproved:true})
 return {directory,orders,quotes,archive,live,dispose(){directory.dispose();orders.dispose();quotes.dispose();archive.dispose();live.dispose()}}
}
type Ports=ReturnType<typeof ports>
export default function GuidedWorkspace({controller,onClose,start}:{controller:AuthController;onClose:()=>void;start?:{vehicleId?:string;orderId?:string}}){
 const [bound,setBound]=useState<{client:SupabaseClient;context:Context;p:Ports}|null>(null),[denied,setDenied]=useState(false)
 useEffect(()=>{let alive=true;let p:Ports|undefined;let boundScope=""
  const unsubscribe=controller.subscribe(()=>{const s=controller.getSnapshot();if(!['authorized','restricted'].includes(s.phase)||!s.context||!canOpen(s.context)||(boundScope!==""&&boundScope!==s.context.userId+":"+s.context.workshop.id)){setDenied(true);p?.dispose()}})
  void controller.directoryClient().then(client=>{const s=controller.getSnapshot();if(!alive)return;if(!client||!s.context||!canOpen(s.context))return setDenied(true);boundScope=s.context.userId+":"+s.context.workshop.id;p=ports(client,s.context);setBound({client,context:s.context,p})}).catch(()=>setDenied(true))
  return()=>{alive=false;unsubscribe();p?.dispose()}
 },[controller])
 return denied?<div role="alert">No está habilitado este recorrido para tu sesión o taller. <button onClick={onClose}>Cerrar</button></div>:bound?<Workspace {...bound} start={start} onClose={onClose}/>:<p role="status">Verificando acceso al recorrido…</p>
}
export function Workspace({client,context,p,onClose,start}:{client:SupabaseClient;context:Context;p:Ports;onClose:()=>void;start?:{vehicleId?:string;orderId?:string}}){
 const dialog=useRef<HTMLDialogElement>(null),lock=useRef(false),alive=useRef(true),uncertain=useRef(false)
 const [step,setStep]=useState(0),[vehicle,setVehicle]=useState(''),[order,setOrder]=useState<OrderWithVehicle|null>(null),[orders,setOrders]=useState<OrderWithVehicle[]>([])
 const [findings,setFindings]=useState<Finding[]>([]),[quote,setQuote]=useState<Quote|null>(null),[revision,setRevision]=useState<Revision|null>(null)
 const [evidence,setEvidence]=useState(empty),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[outstanding,setOutstanding]=useState(0),[incomplete,setIncomplete]=useState(false)
 const [archiveRow,setArchiveRow]=useState<ArchiveRow|undefined>()
 const [quotePending,setQuotePending]=useState(false)
 const [complaint,setComplaint]=useState(''),[km,setKm]=useState('')
 const safeClose=()=>{if(lock.current||outstanding||incomplete||quotePending){setError('Hay cambios pendientes. Confirma los guardados o conserva el borrador antes de salir.');return}if(window.confirm('¿Salir del recorrido? Solo los registros confirmados están guardados en el servidor. Los campos que no hayas guardado pueden descartarse.'))onClose()}
 useEffect(()=>{alive.current=true;const prior=document.activeElement as HTMLElement;dialog.current?.showModal();if(start?.orderId)void resume(start.orderId);else if(start?.vehicleId)void run(async()=>{const v=await p.directory.getVehicle(start.vehicleId!);if(!v||v.archived_at)throw Error('vehicle');const owner=await p.directory.getCustomer(v.customer_id);if(!owner||owner.archived_at)throw Error('customer');if(alive.current){setVehicle(v.id);setStep(1)}});void p.orders.recentOrders(true).then(rows=>{if(alive.current)setOrders(rows)}).catch(()=>{if(alive.current)setError('No se pudieron consultar trabajos pendientes.')});return()=>{alive.current=false;dialog.current?.close();prior?.focus()}},[p])
 async function run(action:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setError('');setNotice('');try{await action()}catch{if(alive.current)setError('No se confirmó la operación. Consulta los registros antes de reintentar. No se avanzó.')}finally{lock.current=false;if(alive.current)setBusy(false)}}
 async function read(id:string){
  const current=await p.orders.getOrder(id);if(!current)throw Error('missing')
  const rows=await p.orders.findingsForOrder(id),q=await p.quotes.forOrder(id)
  const bundle=q?await p.quotes.load(q.id):null
  const r=bundle?.revisions.find(x=>x.revision===q?.issued_revision)??null
  const history=q&&r&&q.status==='issued'?await p.live.history(q,r):null
  const docs=r&&history?.handover?await p.archive.documents(r.id):null
  const e:Evidence={order:true,inspection:rows.length>0&&!currentFindings(rows).some(provisionalFinding),issued:!!r&&q?.status==='issued'&&!q.issue_pending,approval:!!history?.approval,execution:!!history?.execution,handover:!!history?.handover,archive:!!docs?.complete}
  if(!alive.current)return e
  if(q&&r&&history?.handover)setArchiveRow({workshopId:context.workshop.id,revisionId:r.id,quoteId:q.id,orderId:id,customerId:q.customer_id,vehicleId:q.vehicle_id,revision:r.revision,number:q.number,issuedAt:r.issued_at,customerName:r.payload.customer.full_name,plate:r.payload.vehicle.plate,make:r.payload.vehicle.make,model:r.payload.vehicle.model,total:r.payload.totals.total,complete:!!docs?.complete,quoteStatus:q.status,customerArchived:false,vehicleArchived:false,orderCancelled:false,deliveryId:history.handover.id,canArchive:true})
  else setArchiveRow(undefined)
  setOrder(current);setVehicle(current.vehicle.id);setFindings(rows);setQuote(q);setRevision(r);setEvidence(e)
  return e
 }
 async function resume(id:string){await run(async()=>{const e=await read(id);if(alive.current)setStep(confirmedStage(e))})}
 async function next(exit=false){await run(async()=>{
  if(outstanding||incomplete||quotePending)throw Error('pending')
  if(step===0){if(!vehicle)throw Error('vehicle');const v=await p.directory.getVehicle(vehicle);if(!v||v.archived_at)throw Error('vehicle');const owner=await p.directory.getCustomer(v.customer_id);if(!owner||owner.archived_at)throw Error('customer');if(!alive.current)return;if(exit){onClose();return}setStep(1);setNotice('Ficha y vínculo confirmados en el servidor.');return}
  let id=order?.order.id
  if(step===1&&!id){
   const existing=(await p.orders.recentOrders(true)).filter(x=>x.vehicle.id===vehicle&&!['closed'].includes(x.order.status))
   if(existing.length){setOrders(existing);setError('Existe una orden abierta. Selecciona Continuar para evitar duplicarla.');return}
   if(uncertain.current)throw Error('uncertain')
   if(!complaint.trim()||(km!==''&&!/^\d+$/.test(km)))throw Error('input')
   uncertain.current=true
   const created=await p.orders.createOrder({vehicle_id:vehicle,complaint,intake_odometer:km===''?null:Number(km)})
   id=created.id;uncertain.current=false
  }
  if(!id)throw Error('order')
  const e=await read(id)
  if(exit){if(alive.current)onClose();return}
  if(step===2&&!exit&&!window.confirm('¿Continuar con la inspección registrada? Los componentes sin revisar conservarán ese estado; no se declararán revisados ni reparados.'))return
  const ok=[false,e.order,e.inspection,e.issued,e.approval,e.execution,e.handover,e.archive][step]
  if(!ok)throw Error('unconfirmed')
  if(!alive.current)return
  setNotice('Registro confirmado por el servidor.');if(exit){onClose();return}if(step<7)setStep(s=>s+1)
 })}
 return <dialog className="guided-dialog" ref={dialog} aria-labelledby="guided-title" onCancel={e=>{e.preventDefault();safeClose()}}>
  <header><div><strong id="guided-title">Recorrido de atención del vehículo</strong><p>{context.workshop.name} · Guardados confirmados por etapa</p></div><button aria-label="Cerrar recorrido" disabled={busy} onClick={safeClose}>×</button></header>
  <nav aria-label="Etapas del recorrido">{stages.map((s,i)=><span key={s} data-confirmed={evidence.order&&i<confirmedStage(evidence)||i===7&&evidence.archive} aria-current={i===step?'step':undefined}><b>{i+1}</b><small>{s}</small></span>)}</nav>
  <main key={step} className="guided-content"><p className="guided-help">Guarda los cambios con las acciones del formulario. El botón inferior verifica lo confirmado antes de avanzar.</p><h2>{step+1}. {stages[step]}</h2>
   {order&&<p>OT {order.order.id.slice(0,8)} · {order.vehicle.plate??'Sin patente'}</p>}
   {error&&<p role="alert" className="guided-error">{error}</p>}{notice&&<p role="status" className="guided-confirmed">{notice}</p>}
   {step===0&&<><details open><summary>Continuar trabajo confirmado</summary>{orders.map(x=><button key={x.order.id} disabled={busy} onClick={()=>void resume(x.order.id)}>{x.vehicle.plate??'Sin patente'} · {x.order.complaint} · Continuar</button>)}</details><Cp03PilotDirectoryView onPendingChange={setQuotePending} vehicleActionLabel="Usar este vehículo en el recorrido" repository={p.directory} role={context.role} workshopName={context.workshop.name} draftScope={{userId:context.userId,workshopId:context.workshop.id}} onVehicleQuotes={id=>{setVehicle(id);setNotice('Vehículo seleccionado; confirma el vínculo para continuar.')}}/>{vehicle&&<p>Vehículo seleccionado para este recorrido.</p>}</>}
   {step===1&&<section className="guided-reception"><label>Motivo de ingreso<textarea value={complaint} disabled={!!order||busy} onChange={e=>setComplaint(e.target.value)}/></label><label>Kilometraje<input inputMode="numeric" value={km} disabled={!!order||busy} onChange={e=>setKm(e.target.value)}/></label>{order&&<p>Recepción ya registrada. No se creará otra orden.</p>}{orders.filter(x=>x.vehicle.id===vehicle&&x.order.status!=='closed').map(x=><button key={x.order.id} onClick={()=>void resume(x.order.id)} disabled={busy}>Continuar OT {x.order.id.slice(0,8)}</button>)}</section>}
   {step===2&&order&&<Cp04MultipuntoChecklist findings={findings} repository={p.orders} scope={{userId:context.userId,workshopId:context.workshop.id,orderId:order.order.id,vehicleId:order.vehicle.id}} onSaved={f=>setFindings(rows=>[...rows.filter(x=>x.id!==f.id),f])} onQueueChange={(n,i)=>{setOutstanding(n);setIncomplete(i)}} onBack={()=>{if(!outstanding&&!incomplete)setStep(1)}} disabled={busy} readOnly={['ready','closed'].includes(order.order.status)} plate={order.vehicle.plate}/>}
   {step===3&&order&&<QuotePanel guided onPendingChange={setQuotePending} repository={p.quotes} context={context} privateClient={client} initialOrderId={order.order.id} onBack={()=>{if(!quotePending)setStep(2)}}/>}
   {(step===4||step===5||step===6)&&quote&&revision&&<>{step===6&&order&&order.order.status!=='ready'&&order.order.status!=='closed'&&<button disabled={busy} onClick={()=>void run(async()=>{if(!window.confirm('¿Marcar esta OT lista para entrega?'))return;await p.orders.setStatus(order.order.id,order.order.updated_at,'ready');await read(order.order.id)})}>Marcar OT lista para entregar</button>}<FlowLive02Panel onPendingChange={setQuotePending} key={revision.id+':'+step} client={client} context={context} quote={quote} revision={revision} stage={step as 4|5|6}/></>}
   {step===7&&revision&&<FinalArchivePanel fixedRow={archiveRow} onPendingChange={setQuotePending} repository={p.archive} vehicleId={vehicle} revisionId={revision.id} onBack={()=>setStep(6)}/>}
   {step===7&&evidence.archive&&<p className="guided-success" role="status">✓ Expediente definitivo confirmado. Originales disponibles con comprobación de integridad.</p>}
  </main>
  <footer><button disabled={busy||outstanding>0||incomplete||step===0} onClick={()=>{setNotice('');setError('');setStep(s=>s-1)}}>Volver</button><small>{busy?'Comprobando servidor…':outstanding?'Guardado pendiente':'Solo lo confirmado se conserva en el servidor'}</small><button disabled={busy||outstanding>0||incomplete||quotePending} onClick={()=>void next(true)}>Guardar y salir</button><button disabled={busy||outstanding>0||incomplete||quotePending} onClick={()=>void next()}>{step===7?'Verificar expediente':'Guardar y continuar'}</button></footer>
 </dialog>
}
