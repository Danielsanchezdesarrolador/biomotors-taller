import {parseKilometres} from '../clientes/kilometres'
import {useCallback,useEffect,useRef,useState} from 'react'
import {CarFront,CheckCircle2,ClipboardCheck,FileText,ListChecks,RefreshCw,ShieldCheck,Wrench,X} from 'lucide-react'
import {clp} from '../ordenes/orderMoney'
import type {AuthController,Context} from '../auth/controller'
import type {SupabaseClient} from '@supabase/supabase-js'
import {cp03PilotRepository} from '../clientes/cp03PilotRepository'
import {Cp03PilotDirectoryView} from '../clientes/cp03PilotDirectoryView'
import {cp04Repository} from '../ordenes/cp04Repository'
import {type OrderWithVehicle,type Finding} from '../ordenes/cp04Contracts'
import {Cp04MultipuntoPdfPreview} from '../ordenes/Cp04MultipuntoPdfPreview'
import {Cp04MultipuntoChecklist} from '../ordenes/Cp04MultipuntoChecklist'
import {inspectionEvidence,budgetMatches,scopeEvidence} from './continuity'
import {orderWorkspace} from '../cp05/orderWorkspace'
import {cp05Repository} from '../cp05/repository'
import {QuotePanel} from '../cp05/QuotePanel'
import type {Quote,Revision} from '../cp05/contracts'
import {flowLiveCandidate} from '../entrega/flowLiveCandidate'
import {FlowLive02Panel} from '../entrega/FlowLive02Panel'
import {finalArchiveRepository} from '../expedientes/repository'
import type {ArchiveRow} from '../expedientes/contracts'
import {FinalArchivePanel} from '../expedientes/FinalArchivePanel'
import {canOpen,confirmedStage,ensureOrderStage,type Evidence} from './progress'
import './guided.css'
const findingResults={ok:'Revisado',attention:'Requiere atención',not_checked:'Sin revisar'}
const findingResolutions={not_applicable:'Sin reparación pendiente',pending:'Resolución pendiente',resolved:'Resolución registrada'}
const actions=['Guardar y continuar a recepción','Confirmar e iniciar inspección','Finalizar inspección y preparar cotización','Emitir y continuar a aprobación','Confirmar e iniciar trabajos','Finalizar trabajos y preparar entrega','Confirmar entrega y abrir expediente','Confirmar expediente definitivo']
const stages=['Cliente y vehículo','Recepción','Inspección multipunto','Cotización','Aprobación del cliente','Ejecución de trabajos','Entrega del vehículo','Expediente final']
const empty:Evidence={order:false,inspection:false,issued:false,approval:false,execution:false,handover:false,archive:false}
function ports(client:SupabaseClient,context:Context){
 const directory=cp03PilotRepository(client,context),orders=cp04Repository(client,context),quotes=cp05Repository(client,context),archive=finalArchiveRepository(client,context)
 const live=flowLiveCandidate(client,context,{explicitlyApproved:true})
 return {directory,orders,quotes,archive,live,dispose(){directory.dispose();orders.dispose();quotes.dispose();archive.dispose();live.dispose()}}
}
type Ports=ReturnType<typeof ports>
export default function GuidedWorkspace({controller,onClose,start,onAgenda,isActive=true,onPendingChange,onVisitChange}:{controller:AuthController;onClose:()=>void;onAgenda?:()=>void;isActive?:boolean;onPendingChange?:(pending:boolean)=>void;onVisitChange?:(identity:{orderId:string;vehicleId:string})=>void;start?:{vehicleId?:string;orderId?:string}}){
 const [bound,setBound]=useState<{client:SupabaseClient;context:Context;p:Ports}|null>(null),[denied,setDenied]=useState(false)
 useEffect(()=>{let alive=true;let p:Ports|undefined;let boundScope=""
  const unsubscribe=controller.subscribe(()=>{const s=controller.getSnapshot();if(!['authorized','restricted'].includes(s.phase)||!s.context||!canOpen(s.context)||(boundScope!==""&&boundScope!==s.context.userId+":"+s.context.workshop.id)){setDenied(true);p?.dispose()}})
  void controller.directoryClient().then(client=>{const s=controller.getSnapshot();if(!alive)return;if(!client||!s.context||!canOpen(s.context))return setDenied(true);boundScope=s.context.userId+":"+s.context.workshop.id;p=ports(client,s.context);setBound({client,context:s.context,p})}).catch(()=>setDenied(true))
  return()=>{alive=false;unsubscribe();p?.dispose()}
 },[controller])
 return denied?<div role="alert">No está habilitado este recorrido para tu sesión o taller. <button onClick={onClose}>Cerrar</button></div>:bound?<Workspace {...bound} start={start} onClose={onClose} onAgenda={onAgenda} isActive={isActive} onPendingChange={onPendingChange} onVisitChange={onVisitChange}/>:<p role="status">Verificando acceso al recorrido…</p>
}
export function Workspace({client,context,p,onClose,start,onAgenda,isActive=true,onPendingChange,onVisitChange}:{client:SupabaseClient;context:Context;p:Ports;onClose:()=>void;onAgenda?:()=>void;isActive?:boolean;onPendingChange?:(pending:boolean)=>void;onVisitChange?:(identity:{orderId:string;vehicleId:string})=>void;start?:{vehicleId?:string;orderId?:string}}){
 const activeView=useRef(isActive)
 const epoch=useRef(0)
 const operationGeneration=useRef<number|null>(null)
 if(activeView.current!==isActive)epoch.current++
 activeView.current=isActive
 const [reviewedScope,setReviewedScope]=useState('')
 const [scopeKey,setScopeKey]=useState('')
 const [inspectionSummary,setInspectionSummary]=useState({recorded:false,reviewed:0,notChecked:0,resolved:0})
 const preflightRef=useRef<(id:string)=>Promise<void>>(async()=>{throw Error('stale')})
 const [quoteWorkspace,setQuoteWorkspace]=useState<{id:string;port:ReturnType<typeof orderWorkspace>}|null>(null)
 const saveAction=useRef<((exit:boolean)=>Promise<boolean>)|null>(null)
 const registerSave=useCallback((action:((exit:boolean)=>Promise<boolean>)|null)=>{saveAction.current=action},[])
 const dialog=useRef<HTMLElement>(null),lock=useRef(false),alive=useRef(true),uncertain=useRef(false)
 const [overview,setOverview]=useState(true)
 const [step,setStep]=useState(0),[vehicle,setVehicle]=useState(''),[order,setOrder]=useState<OrderWithVehicle|null>(null),[orders,setOrders]=useState<OrderWithVehicle[]>([])
 const vehicleSelection=useRef('')
 const selectVehicle=useCallback((id:string)=>{vehicleSelection.current=id;setVehicle(id)},[])
 const [findings,setFindings]=useState<Finding[]>([]),[quote,setQuote]=useState<Quote|null>(null),[revision,setRevision]=useState<Revision|null>(null)
 const [evidence,setEvidence]=useState(empty),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[outstanding,setOutstanding]=useState(0),[incomplete,setIncomplete]=useState(false)
 const [archiveRow,setArchiveRow]=useState<ArchiveRow|undefined>()
 const [quotePending,setQuotePending]=useState(false)
 const [customerName,setCustomerName]=useState('')
 useEffect(()=>{if(!order)return;const id=order.order.id;const port=orderWorkspace(p.quotes,id,()=>preflightRef.current(id));setQuoteWorkspace({id,port});return()=>port.dispose()},[p.quotes,order?.order.id])
 const [complaint,setComplaint]=useState(''),[km,setKm]=useState('')
 useEffect(()=>{onPendingChange?.(busy||outstanding>0||incomplete||quotePending||!order&&(!!complaint||!!km));return()=>onPendingChange?.(false)},[busy,outstanding,incomplete,quotePending,order,complaint,km,onPendingChange])
 const safeClose=()=>{if(lock.current){setError('Espera la confirmación del guardado.');return}onClose()}
 useEffect(()=>{alive.current=true;epoch.current++;const prior=document.activeElement as HTMLElement;if(start?.orderId)void resume(start.orderId);else if(start?.vehicleId)void run(async()=>{const v=await p.directory.getVehicle(start.vehicleId!);if(!v||v.archived_at)throw Error('vehicle');const owner=await p.directory.getCustomer(v.customer_id);if(!owner||owner.archived_at)throw Error('customer');if(alive.current){selectVehicle(v.id);setStep(1)}});void p.orders.recentOrders(true).then(rows=>{if(alive.current)setOrders(rows)}).catch(()=>{if(alive.current)setError('No se pudieron consultar trabajos pendientes.')});return()=>{alive.current=false;epoch.current++;lock.current=false;prior?.focus()}},[p])
 useEffect(()=>{const viewport=window.visualViewport;const resize=()=>dialog.current?.style.setProperty('--guided-viewport',`${viewport?.height??window.innerHeight}px`);resize();viewport?.addEventListener('resize',resize);return()=>viewport?.removeEventListener('resize',resize)},[])
 async function run(action:()=>Promise<void>){if(lock.current||!activeView.current)return;const generation=epoch.current;operationGeneration.current=generation;lock.current=true;setBusy(true);setError('');setNotice('');try{await action()}catch(e){if(alive.current&&generation===epoch.current){const kind=(e as {kind?:string})?.kind;const key=e instanceof Error?e.message:'';setError(({stale:'Cambió la atención o la revisión. Conserva los campos y actualiza antes de guardar.',scope:'Revisa el alcance técnico frente a las partidas de la revisión vigente antes de continuar.',budget:'El presupuesto vigente cambió. Crea y emite la revisión correspondiente y solicita su aprobación.',inspection:'Confirma la inspección parcial y sus pendientes antes de continuar.',planned:'Esta OT es una solicitud anticipada. Registra la recepción física desde Agenda antes de continuar.',vehicle:'Selecciona un vehículo y confirma su ficha.',customer:'El cliente no está disponible para una visita nueva.',input:'Completa el motivo y un kilometraje válido.',pending:'Espera los guardados y completa las observaciones técnicas.',unconfirmed:'La etapa aún no está confirmada. Completa sus campos y confirmaciones.',uncertain:'La creación anterior tiene respuesta incierta. Consulta las órdenes antes de volver a crear.'} as Record<string,string>)[key]||(kind==='order_not_ready'?'La OT está cerrada, cancelada o su estado no pudo confirmarse. Actualiza la visita.':kind==='denied'?'Tu sesión o rol no permite esta operación.':kind==='conflict'?'El registro cambió; actualiza la visita antes de continuar.':navigator.onLine===false?'Sin conexión. Conserva los cambios y consulta al reconectar.':'No se pudo confirmar el guardado. Consulta el registro antes de reintentar.'))}}finally{if(operationGeneration.current===generation){operationGeneration.current=null;lock.current=false;if(alive.current)setBusy(false)}}}
 async function fetchVisit(id:string){
  const generation=epoch.current
  const current=await p.orders.getOrder(id,true)
  if(!current||current.order.id!==id||current.order.workshop_id!==context.workshop.id||current.vehicle.workshop_id!==context.workshop.id||current.order.vehicle_id!==current.vehicle.id)throw Error('stale')
  const rows=await p.orders.findingsForOrder(id),q=await p.quotes.forOrder(id)
  const bundle=q?await p.quotes.load(q.id):null
  if(bundle&&(bundle.quote.id!==q?.id||bundle.quote.order_id!==id||bundle.source.order.id!==id||bundle.quote.workshop_id!==context.workshop.id||bundle.quote.vehicle_id!==current.vehicle.id))throw Error('stale')
  const r=bundle?.revisions.find(x=>x.revision===bundle.quote.issued_revision)??null
  const history=bundle&&r&&bundle.quote.status==='issued'?await p.live.history(bundle.quote,r):null
  const docs=r&&history?.handover?await p.archive.documents(r.id):null
  const scope={workshopId:context.workshop.id,vehicleId:current.vehicle.id,orderId:id}
  const summary=inspectionEvidence(rows,scope)
  const needsRevision=!!bundle&&!!r&&!budgetMatches(bundle,r)
  const e:Evidence={planned:current.order.intake_phase==='planned',order:current.order.intake_phase!=='planned',inspection:summary.recorded,issued:!!r&&bundle?.quote.status==='issued'&&!bundle.quote.issue_pending,needsRevision,approval:!needsRevision&&!!history?.approval,execution:!needsRevision&&!!history?.execution,handover:!needsRevision&&!!history?.handover,archive:!needsRevision&&!!docs?.complete}
  const key=bundle&&r?scopeEvidence(bundle,r,rows,scope):''
  const name=r?.payload.customer.full_name??(await p.directory.getCustomer(current.vehicle.customer_id))?.full_name??'Cliente vinculado'
  if(!alive.current||generation!==epoch.current||!activeView.current)throw Error('stale')
  return {current,rows,bundle,r,history,docs,e,key,name,summary}
 }
 function publish(visit:Awaited<ReturnType<typeof fetchVisit>>){
  const {current,rows,bundle,r,history,docs,e,key,name,summary}=visit
  const q=bundle?.quote
  if(q&&r&&history?.handover)setArchiveRow({workshopId:context.workshop.id,revisionId:r.id,quoteId:q.id,orderId:current.order.id,customerId:q.customer_id,vehicleId:q.vehicle_id,revision:r.revision,number:q.number,issuedAt:r.issued_at,customerName:r.payload.customer.full_name,plate:r.payload.vehicle.plate,make:r.payload.vehicle.make,model:r.payload.vehicle.model,total:r.payload.totals.total,complete:!!docs?.complete,quoteStatus:q.status,customerArchived:false,vehicleArchived:false,orderCancelled:!!current.order.cancelled_at,deliveryId:history.handover.id,canArchive:!current.order.cancelled_at})
  else setArchiveRow(undefined)
  onVisitChange?.({orderId:current.order.id,vehicleId:current.vehicle.id})
  setCustomerName(name);setComplaint(current.order.complaint);setKm(current.order.intake_odometer===null?'':String(current.order.intake_odometer??''));setOrder(current);selectVehicle(current.vehicle.id);setFindings(rows);setQuote(q??null);setRevision(r);setEvidence(e);setScopeKey(key);setInspectionSummary(summary)
 }
 async function read(id:string){const visit=await fetchVisit(id);publish(visit);return visit.e}
 async function preflight(id:string){
  if(!order||order.order.id!==id||outstanding||incomplete||!activeView.current)throw Error('stale')
  const fresh=await fetchVisit(id)
  if(fresh.current.order.cancelled_at||fresh.current.order.status==='closed'&&step!==7)throw Error('stale')
  if(fresh.current.order.intake_phase==='planned')throw Error('planned')
  if(step>=4){
   if(!quote||!revision||fresh.bundle?.quote.id!==quote.id||fresh.bundle.quote.version!==quote.version||fresh.r?.id!==revision.id)throw Error('stale')
   if(fresh.e.needsRevision||!fresh.e.issued)throw Error('budget')
   if(step<=6&&(!reviewedScope||reviewedScope!==fresh.key))throw Error('scope')
   if(step>=5&&!fresh.e.approval)throw Error('unconfirmed')
   if(step>=6&&!fresh.e.execution)throw Error('unconfirmed')
   if(step===7&&!fresh.e.handover)throw Error('unconfirmed')
  }
 }
 preflightRef.current=preflight
 async function requestScopeRevision(){await run(async()=>{
  if(!order||!quote||!revision)throw Error('stale')
  const generation=epoch.current
  const fresh=await fetchVisit(order.order.id)
  if(!fresh.bundle||fresh.bundle.quote.id!==quote.id||fresh.bundle.quote.version!==quote.version||fresh.r?.id!==revision.id||fresh.current.order.cancelled_at||fresh.current.order.status==='closed')throw Error('stale')
  const reason=window.prompt('Describe los trabajos adicionales o el cambio de alcance para crear una nueva revisión de cotización.')
  if(reason===null)return
  if(!reason.trim()){setError('Describe el cambio de alcance.');return}
  const changed=await p.quotes.revise(fresh.bundle.quote,reason.trim(),crypto.randomUUID())
  if(!activeView.current||generation!==epoch.current)throw Error('stale')
  const confirmed=await fetchVisit(order.order.id)
  if(changed.quote.order_id!==order.order.id||confirmed.bundle?.quote.id!==changed.quote.id||confirmed.bundle.quote.status!=='draft'||confirmed.bundle.quote.version!==changed.quote.version)throw Error('unconfirmed')
  publish(confirmed);setReviewedScope('');setStep(3)
 })}
 async function resume(id:string){
  if(outstanding||incomplete||quotePending||!order&&(!!complaint||!!km)){
   if(order?.order.id===id){setOverview(false);return}
   setError('Conserva o guarda los cambios de la atención activa antes de abrir otra.');return
  }
  await run(async()=>{const e=await read(id);if(alive.current){setReviewedScope('');setStep(confirmedStage(e));setOverview(true)}})
 }
 async function next(exit=false){await run(async()=>{
  const generation=epoch.current
  if(outstanding||incomplete)throw Error('pending')
  if(order?.order.intake_phase==='planned'&&step!==3&&step!==4&&!exit)throw Error('planned')
  if(order)await preflight(order.order.id)
  if(!activeView.current)return
  if(saveAction.current&&!(await saveAction.current(exit)))return
  if(!alive.current||!activeView.current||generation!==epoch.current)throw Error('stale')
  if(step===0){if(exit){onClose();return}const selectedVehicle=vehicleSelection.current;if(!selectedVehicle)throw Error('vehicle');const v=await p.directory.getVehicle(selectedVehicle);if(!v||v.archived_at)throw Error('vehicle');const owner=await p.directory.getCustomer(v.customer_id);if(!owner||owner.archived_at)throw Error('customer');if(!alive.current||!activeView.current||generation!==epoch.current)return;if(exit){onClose();return}setStep(1);setNotice('Ficha y vínculo confirmados en el servidor.');return}
  let id=order?.order.id
  if(step===1&&!id){
   const existing=(await p.orders.recentOrders(true)).filter(x=>x.vehicle.id===vehicle&&!['closed'].includes(x.order.status))
   if(existing.length){setOrders(existing);setError('Existe una orden abierta. Selecciona Continuar para evitar duplicarla.');return}
   if(uncertain.current)throw Error('uncertain')
   if(!complaint.trim())throw Error('input')
   const mileage=parseKilometres(km)
   uncertain.current=true
   const created=await p.orders.createOrder({vehicle_id:vehicle,complaint,intake_odometer:mileage})
   id=created.id;uncertain.current=false
  }
  if(!id)throw Error('order')
  const e=await read(id)
  if(e.planned&&step===1){setError('Recepción anticipada pendiente. Registra el ingreso físico desde Agenda.');return}
  if(e.needsRevision&&step===3)throw Error('budget')
  if(e.planned&&step===4&&e.approval&&!exit){onAgenda?.();return}
  if(exit){if(alive.current)onClose();return}
  if(step===2&&!window.confirm('¿Continuar con la inspección registrada y sus pendientes? Los componentes sin revisar conservarán su estado.'))return
  const ok=[false,e.order,e.inspection,e.issued,e.approval,e.execution,e.handover,e.archive][step]
  if(!ok&&step!==2)throw Error('unconfirmed')
  if(step===2)await ensureOrderStage(p.orders,{workshopId:context.workshop.id,orderId:id,vehicleId:vehicle},'inspecting')
  if(!alive.current||!activeView.current||generation!==epoch.current)return
  setNotice('Registro confirmado por el servidor.');if(exit){onClose();return}if(step<7)setStep(step===2&&!e.inspection?3:confirmedStage(e));else if(e.archive)setNotice('Atención finalizada. Consulta sus tres documentos originales.')
 })}
 const confirmed=[!!order,evidence.order,evidence.inspection,evidence.issued&&!evidence.needsRevision,evidence.approval,evidence.execution,evidence.handover,evidence.archive]
 return <section className="guided-dialog flow-next-workspace" ref={dialog} aria-labelledby="guided-title">
  <header className="guided-header"><div className="flow-next-title"><span className="flow-next-icon"><CarFront aria-hidden="true" size={25}/></span><div><strong id="guided-title">Continuidad de atención</strong><p>{context.workshop.name} · Paso {step+1} de 8 · {stages[step]}</p></div></div><button aria-label="Cerrar recorrido" disabled={busy} onClick={safeClose}><X aria-hidden="true" size={21}/></button></header>
  {!overview&&<button className="flow-next-control" disabled={busy||outstanding>0||incomplete||quotePending} onClick={()=>setOverview(true)}><ListChecks aria-hidden="true" size={17}/>Ver avance de atención</button>}
  {overview&&<main className="flow-next-overview">
   <h2>{order?order.vehicle.make+' '+order.vehicle.model:'Iniciar o continuar atención'}</h2>
   {error&&<p role="alert" className="guided-error">{error}</p>}
   {order?<><p>{customerName} · {order.vehicle.plate} · OT {order.order.id.slice(0,8)}</p><p>{order.order.complaint}</p>
    <p>Estado de OT · {({received:'Recibida',inspecting:'En inspección',in_service:'En reparación',ready:'Lista para entregar',closed:'Cerrada'})[order.order.status]}</p><strong>{confirmed.filter(Boolean).length} de 8 etapas confirmadas</strong>
    <p>Siguiente acción · {actions[confirmedStage(evidence)]}</p></>:<p>Selecciona una visita confirmada o registra cliente y vehículo para una atención nueva.</p>}
   {evidence.planned&&<p>Servicio anticipado · {evidence.approval?'Aprobación confirmada. Registra la recepción física desde Agenda.':'Conserva la reserva pendiente mientras se confirma la aprobación.'}</p>}
   {evidence.planned&&onAgenda&&<button onClick={onAgenda}>Abrir Agenda y registrar recepción</button>}
   <button className="flow-next-primary" disabled={busy} onClick={()=>{setStep(order?confirmedStage(evidence):0);setOverview(false)}}><Wrench aria-hidden="true" size={18}/>Continuar atención</button>
   <ul>{stages.map((label,index)=><li key={label}><span>{confirmed[index]?<CheckCircle2 aria-hidden="true" size={19}/>:<ClipboardCheck aria-hidden="true" size={19}/>}<span><strong>{label}</strong><small>{confirmed[index]?'Confirmada':'Pendiente'}</small></span></span><button disabled={busy||index>(order?confirmedStage(evidence):0)||!!evidence.planned&&![0,1,3,4].includes(index)} onClick={()=>{setStep(index);setOverview(false)}}>Abrir {label.toLowerCase()}</button></li>)}</ul>
   <h3>Trabajos del taller</h3>{orders.map(row=><button key={row.order.id} disabled={busy} onClick={()=>void resume(row.order.id)}>{row.vehicle.plate??'Sin patente'} · {row.order.complaint} · Continuar</button>)}
  </main>}
  <nav hidden={overview} aria-label="Etapas del recorrido">{stages.map((s,i)=><span key={s} data-confirmed={confirmed[i]} aria-current={i===step?'step':undefined}><b>{i!==step&&(confirmed[i])?'✓':i+1}</b><small>{s}</small></span>)}</nav>
  <main hidden={overview} key={(order?.order.id??'new')+':'+step} className={"guided-content guided-step-"+step}><h2>{step+1}. {stages[step]}</h2>
   {order&&<p>Visita · {order.vehicle.plate??'Sin patente'} · Estado: {({received:'Recibida',inspecting:'En inspección',in_service:'En servicio',ready:'Lista para entregar',closed:'Cerrada'})[order.order.status]}</p>}
   {error&&<p role="alert" className="guided-error">{error}</p>}
   <div className="guided-stage">
   {step===0&&order&&<section className="guided-reception"><h3>Cliente y vehículo de esta visita</h3><p>{customerName}</p><p>{order.vehicle.plate} · {order.vehicle.make} {order.vehicle.model}</p><p>La OT conserva su cliente y vehículo originales. Para otro ingreso, guarda y sal e inicia una visita nueva.</p></section>}
   {step===0&&!order&&<><details><summary>Continuar trabajo confirmado</summary>{orders.map(x=><button key={x.order.id} disabled={busy} onClick={()=>void resume(x.order.id)}>{x.vehicle.plate??'Sin patente'} · {x.order.complaint} · Continuar</button>)}</details><Cp03PilotDirectoryView onSelectedVehicle={selectVehicle} guided initialVehicleId={vehicle||undefined} registerSave={registerSave} onPendingChange={setQuotePending} vehicleActionLabel="Usar este vehículo en el recorrido" repository={p.directory} role={context.role} workshopName={context.workshop.name} draftScope={{userId:context.userId,workshopId:context.workshop.id}} onVehicleQuotes={id=>{selectVehicle(id);setNotice('Vehículo seleccionado; confirma el vínculo para continuar.')}}/>{vehicle&&<p>Vehículo seleccionado para este recorrido.</p>}</>}
   {step===1&&<section className="guided-reception"><label>Motivo de ingreso<textarea value={complaint} disabled={!!order||busy} onChange={e=>setComplaint(e.target.value)}/></label><label>Kilometraje<input aria-label="Kilometraje" inputMode="numeric" value={km} disabled={!!order||busy} onChange={e=>setKm(e.target.value)}/>{(()=>{try{parseKilometres(km);return null}catch(e){return <small role="alert">{(e as Error).message}</small>}})()}</label>{order&&<p>Recepción ya registrada. No se creará otra orden.</p>}{orders.filter(x=>x.vehicle.id===vehicle&&x.order.status!=='closed').map(x=><button key={x.order.id} onClick={()=>void resume(x.order.id)} disabled={busy}>Continuar OT {x.order.id.slice(0,8)}</button>)}</section>}
   {step===2&&order&&<p role="status">Inspección registrada · {inspectionSummary.reviewed} revisados · {inspectionSummary.notChecked} declarados sin revisar · {inspectionSummary.resolved} resueltos. Los restantes conservan su estado.</p>}
   {step===2&&order&&<Cp04MultipuntoChecklist findings={findings} repository={p.orders} scope={{userId:context.userId,workshopId:context.workshop.id,orderId:order.order.id,vehicleId:order.vehicle.id}} onSaved={f=>setFindings(rows=>[...rows.filter(x=>x.id!==f.id),f])} onQueueChange={(n,i)=>{setOutstanding(n);setIncomplete(i)}} onBack={()=>{if(!outstanding&&!incomplete)setStep(1)}} disabled={busy} readOnly={['ready','closed'].includes(order.order.status)} plate={order.vehicle.plate}/>}
   {step===2&&order&&<Cp04MultipuntoPdfPreview workshopName={context.workshop.name} order={order} findings={findings} outstanding={outstanding} incomplete={incomplete} disabled={busy||!isActive} loadIdentity={p.orders.pdfIdentity}/>}
   {step===3&&order&&quoteWorkspace?.id===order.order.id&&<QuotePanel orderLocked registerSave={registerSave} onPendingChange={setQuotePending} repository={quoteWorkspace.port} context={context} privateClient={client} initialOrderId={order.order.id} onBack={()=>{if(!quotePending)setStep(2)}}/>}
   {(step===4||step===5||step===6)&&quote&&revision&&<section className="flow-scope-card" aria-label="Cotejo del alcance técnico">
    <header className="flow-card-heading"><span className="flow-card-icon"><ShieldCheck aria-hidden="true" size={21}/></span><div><h3>Cotejo del alcance técnico</h3><p>Confirma que el trabajo corresponde al presupuesto vigente.</p></div></header>
    <section className="flow-budget" aria-label="Presupuesto y revisión vigentes">
     <div><FileText aria-hidden="true" size={19}/><span>Presupuesto vigente<strong>COT-{String(quote.number).padStart(6,'0')} · R{revision.revision}</strong></span></div>
     <strong>{clp(revision.payload.totals.total)}<small>IVA incluido</small></strong>
    </section>
    <div className="flow-scope-section"><h4><ClipboardCheck aria-hidden="true" size={18}/>Hallazgos y observaciones <span>{findings.length}</span></h4>
     <ul className="flow-findings">{findings.map(row=><li key={row.id}><div><strong>{row.category}</strong><span className={'flow-finding-state flow-finding-'+row.result}>{findingResults[row.result]}</span></div><p>{row.note??'Sin observación'}</p><small>{findingResolutions[row.resolution]}</small></li>)}</ul>
    </div>
    <div className="flow-scope-section"><h4><Wrench aria-hidden="true" size={18}/>Partidas presupuestadas</h4>
     <ul className="flow-budget-items">{revision.payload.items.map(item=><li key={item.id}><strong>{item.description}</strong><span>{item.quantity100/100} × {clp(item.unit_price)}</span></li>)}</ul>
    </div>
    <p className="flow-scope-guidance">Coteja los hallazgos y sus observaciones con las partidas de esta revisión. Una observación o una resolución puede conservar el presupuesto. Los trabajos adicionales requieren revisar las partidas y obtener aprobación de la nueva revisión.</p>
    <label className="flow-scope-confirm"><input type="checkbox" checked={!!scopeKey&&reviewedScope===scopeKey} onChange={event=>setReviewedScope(event.target.checked?scopeKey:'')}/><span>He cotejado el alcance técnico actual y confirmo que las partidas vigentes cubren los trabajos de esta acción.</span></label>
    <div className="flow-scope-actions"><button disabled={busy} onClick={()=>{if(quotePending&&!window.confirm('¿Actualizar los antecedentes? Si cambió la revisión, conserva antes el texto que estás preparando.'))return;void run(async()=>{if(!order)return;await read(order.order.id);setReviewedScope('')})}}><RefreshCw aria-hidden="true" size={17}/>Actualizar evidencia del alcance</button><button disabled={busy||quotePending} onClick={()=>void requestScopeRevision()}><FileText aria-hidden="true" size={17}/>Hay trabajos adicionales: revisar cotización</button></div>
   </section>}

   {(step===4||step===5||step===6)&&quote&&revision&&<><FlowLive02Panel beforeWrite={()=>preflight(order!.order.id)} beforeExecution={async()=>{if(!order)throw Error('order');await ensureOrderStage(p.orders,{workshopId:context.workshop.id,orderId:order.order.id,vehicleId:order.vehicle.id},'in_service');await preflight(order.order.id)}} beforeHandover={async()=>{if(!order)throw Error('order');if(!window.confirm('¿Confirmar OT lista para entregar y registrar la entrega declarada?'))return false;await ensureOrderStage(p.orders,{workshopId:context.workshop.id,orderId:order.order.id,vehicleId:order.vehicle.id},'ready');await preflight(order.order.id);return true}} registerSave={registerSave} onPendingChange={setQuotePending} key={revision.id+':'+step} client={client} context={context} quote={quote} revision={revision} stage={step as 4|5|6}/></>}
   {step===7&&evidence.archive&&<section className="dashboard-card" aria-label="Atención finalizada"><h2>Atención finalizada</h2><p>Expediente confirmado. Consulta y descarga los tres PDF originales de esta visita.</p><button className="flow-next-primary" onClick={onClose}>Volver al centro de operaciones</button></section>}
   {step===7&&revision&&<FinalArchivePanel guided orderId={order?.order.id} registerSave={registerSave} fixedRow={archiveRow} onPendingChange={setQuotePending} repository={p.archive} vehicleId={vehicle} revisionId={revision.id} onBack={()=>setStep(6)}/>}

   </div>
  </main>
  <footer hidden={overview||step===7&&evidence.archive}><button disabled={busy||outstanding>0||incomplete||quotePending||step===0} onClick={()=>{setNotice('');setError('');setStep(s=>s-1)}}>Volver</button><small role="status" className={notice||step===7&&evidence.archive?'guided-footer-confirmed':''}>{busy?'Guardando y comprobando servidor…':outstanding?'Espera a que termine el autoguardado.':incomplete?'Completa las observaciones técnicas pendientes.':step===7&&evidence.archive?'✓ Expediente definitivo confirmado. Originales disponibles con comprobación de integridad.':notice||'Guardar y continuar valida y confirma esta etapa.'}</small><button disabled={busy||outstanding>0||incomplete} onClick={()=>void next(true)}>Guardar y salir</button><button disabled={busy||outstanding>0||incomplete} onClick={()=>void next()}>{actions[step]}</button></footer>
 </section>
}
