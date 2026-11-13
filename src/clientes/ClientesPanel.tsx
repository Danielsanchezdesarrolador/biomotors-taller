import { allCases } from '../flow/flowSession'
import { useDemoSession } from '../session/useDemoSession'
import { addSessionClient } from './directorySession'
import { addSessionRequest, sessionRequests } from './intakeSession'
import { useMemo, useRef, useState } from 'react'
import { ArrowRight, CalendarDays, CarFront, ChevronRight, ClipboardList, FileText, Filter, Link, Plus, Search, UsersRound } from 'lucide-react'
import { ClientBadge, ClientCard, ClienteDetail, ClienteQuickView, HistorialVehiculo, ObservacionesTecnicas, initials } from './ClientViews'
import { demoClients, demoVehicles, searchClients, vehiclesForClient, type ClientStatus, type DemoClient, type TechnicalObservation, type VehicleHistory } from './clientesData'
import { RegistroClienteDemo } from './RegistroClienteDemo'
import { RegistroVisitaDemo } from './RegistroVisitaDemo'
import { type SolicitudIngresoDemo } from './registroVisitaData'
import type { ReactNode } from 'react'
import './clientes.css'
type Dialog = {type:'new'}|{type:'link'}|{type:'client'}|{type:'observation';observation:TechnicalObservation}|{type:'history';history:VehicleHistory}
export function ClientesPanel({globalSearch,onOrder,initialVehicleId,onReviewRequest}:{onReviewRequest?:(id:string)=>void;globalSearch:string;onOrder:(id:string)=>void;initialVehicleId?:string}) {
 useDemoSession()
 const [query,setQuery]=useState(''),[filter,setFilter]=useState<ClientStatus|'Todos'>('Todos')
 const clients=[...demoClients],requests=sessionRequests()
 const [clientId,setClientId]=useState(demoVehicles.find(v=>v.id===initialVehicleId)?.clientId??demoClients[0].id),[vehicleId,setVehicleId]=useState(initialVehicleId??demoVehicles[0].id),[dialog,setDialog]=useState<Dialog|null>(null)
 const quickRef=useRef<HTMLElement>(null)
 const client=clients.find(c=>c.id===clientId)??clients[0],vehicles=vehiclesForClient(client.id)
 const vehicle=vehicles.find(v=>v.id===vehicleId)??vehicles[0]
 const filtered=useMemo(()=>searchClients(clients,[query,globalSearch],filter),[clients,query,globalSearch,filter])
 const date=new Intl.DateTimeFormat('es-CL',{day:'numeric',month:'long',year:'numeric',timeZone:'America/Santiago'}).format(new Date())
 const kpis=[{label:'Clientes registrados',value:'1.284',icon:UsersRound,tone:'blue'},{label:'Vehículos asociados',value:'1.679',icon:CarFront,tone:'violet'},{label:'Con visita reciente',value:'86',icon:CalendarDays,tone:'sky'},{label:'Observaciones pendientes',value:'42',icon:FileText,tone:'purple'}]
 function selectClient(c:DemoClient) {setClientId(c.id);setVehicleId(vehiclesForClient(c.id)[0]?.id??'');if(innerWidth<1100){quickRef.current?.scrollIntoView({behavior:'smooth',block:'start'});quickRef.current?.focus()}}
 const close=()=>setDialog(null)
 return <div className="cv-panel"><section className="welcome-area cv-hero"><div className="welcome-head"><div><h1>Clientes y vehículos <CarFront aria-hidden="true"/></h1><p>Gestiona fichas, vehículos asociados e historial técnico.</p></div><span className="date-pill"><CalendarDays size={18}/>{date}</span></div><div className="metric-grid">{kpis.map(({label,value,icon:Icon,tone})=><div className="metric-card" key={label}><span className={'metric-icon '+tone}><Icon/></span><span className="metric-content"><span className="metric-title">{label}</span><strong>{value}</strong></span></div>)}</div></section>
  <div className="cv-columns"><ClientCard title="Clientes (1.284)" icon={<UsersRound/>} className="cv-list"><div className="cv-list-actions"><button className="cv-primary" onClick={()=>setDialog({type:'new'})}><Plus/> Nuevo cliente</button><button className="cv-secondary" onClick={()=>setDialog({type:'link'})}><Link/> Generar enlace de registro</button></div><div className="cv-toolbar"><label className="cv-search"><Search/><span className="sr-only">Buscar cliente</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nombre, teléfono, correo o patente..."/></label><label className="cv-filter"><Filter/><span className="sr-only">Filtrar estado de cliente</span><select value={filter} onChange={e=>setFilter(e.target.value as ClientStatus|'Todos')}><option value="Todos">Filtros</option>{['Activo','Frecuente','Pendiente'].map(s=><option key={s}>{s}</option>)}</select></label></div>
   <table className="cv-table"><thead><tr><th>Cliente</th><th>Teléfono</th><th>Vehículos</th><th>Última visita</th><th>Estado</th><th><span className="sr-only">Seleccionar</span></th></tr></thead><tbody>{filtered.map((c,i)=><tr key={c.id} className={c.id===client.id?'selected':''}><td><button onClick={()=>selectClient(c)} aria-label={`Seleccionar ${c.name}`} className="cv-name"><span className={'cv-avatar tone-'+i%3}>{initials(c.name)}</span><span><strong>{c.name}</strong><small>Ficha ficticia · DEMO</small></span></button></td><td>{c.phone}</td><td>{vehiclesForClient(c.id).length}</td><td>{c.lastVisit}</td><td><ClientBadge status={c.status}/></td><td><button className="cv-row-action" aria-label={`Abrir ficha rápida de ${c.name}`} onClick={()=>selectClient(c)}><ChevronRight/></button></td></tr>)}</tbody></table>
   <div className="cv-client-mobile">{filtered.map(c=><button key={c.id} onClick={()=>selectClient(c)} aria-label={`Seleccionar ${c.name}`}><span className="cv-avatar">{initials(c.name)}</span><span><strong>{c.name}</strong><small>{c.phone} · {vehiclesForClient(c.id).length} vehículos</small></span><ClientBadge status={c.status}/><ChevronRight/></button>)}</div>
   {!filtered.length&&<div className="cv-empty" role="status"><Search/><p>No hay clientes de muestra que coincidan.</p><button className="cv-secondary" onClick={()=>{setQuery('');setFilter('Todos')}}>Limpiar filtros locales</button></div>}
  </ClientCard><section ref={quickRef} tabIndex={-1} className="cv-quick-wrap" aria-label="Ficha rápida seleccionada"><ClienteQuickView client={client} vehicleId={vehicle?.id??''} onVehicle={setVehicleId} onDetail={()=>setDialog({type:'client'})}/></section>{vehicle?<ObservacionesTecnicas clientId={client.id} vehicle={vehicle} onOpen={observation=>setDialog({type:'observation',observation})}/>:<ClientCard title="Observaciones técnicas (0)" icon={<FileText/>}><p className="cv-empty">Sin vehículos asociados en esta ficha temporal.</p></ClientCard>}</div>
  <SolicitudesIngresoDemo requests={requests} onReview={onReviewRequest}/>
  {vehicle&&<HistorialVehiculo clientId={client.id} vehicle={vehicle} onVehicle={setVehicleId} onOpen={history=>setDialog({type:'history',history})}/>}
  <p className="cv-sample-note">{clients.length} fichas de muestra · KPI ilustrativos DEMO; no representan el tamaño de este listado ni proceden de Supabase. Cambios temporales, sin guardado real.</p>
  {dialog&&<ClientDialog title={dialog.type==='new'?'Nuevo cliente · DEMO':dialog.type==='link'?'Registro mediante enlace · DEMO':dialog.type==='client'?'Ficha completa del cliente · DEMO':dialog.type==='observation'?'Observación técnica · DEMO':'Antecedente del vehículo · DEMO'} onClose={close}>
   {dialog.type==='new'?<RegistroClienteDemo onCreate={draft=>{addSessionClient(draft)}}/>:dialog.type==='link'?<RegistroVisitaDemo onComplete={draft=>{addSessionRequest(draft)}}/>:dialog.type==='client'?<ClienteDetail client={client} onOrder={onOrder}/>:dialog.type==='observation'?<><p>{dialog.observation.text}</p><p>Vehículo: {demoVehicles.find(v=>v.id===dialog.observation.vehicleId)?.plate}</p><p>Pendiente técnico vinculado a {dialog.observation.orderId}. No reparado ni eliminado en esta demo.</p><button className="cv-primary" onClick={()=>onOrder(dialog.observation.orderId)}>Ver orden asociada <ArrowRight/></button></>:<><h3>{dialog.history.work}</h3><p>{dialog.history.date} · {vehicle?.plate}</p><p>Kilometraje: {dialog.history.mileage.toLocaleString('es-CL')} km · {dialog.history.technician}</p><p>Repuestos: {dialog.history.parts.join(', ')||'Sin detalle en este ejemplo'}</p><p>Informe: {dialog.history.reportId??'No generado'} · Cotización: {dialog.history.estimateId??'No generada'}</p><p>Entrega de documentos: {dialog.history.deliveryStatus}. El envío futuro requerirá correo verificado, destinatario confirmado, PDF seguro y bitácora.</p>{dialog.history.orderId?<button className="cv-primary" onClick={()=>onOrder(dialog.history.orderId!)}>Ver orden {dialog.history.orderId} <ArrowRight/></button>:<p className="cv-privacy">Visita histórica de muestra, sin una ficha de orden navegable.</p>}</>}
  </ClientDialog>}
 </div>
}
function ClientDialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}) {return <dialog className="cv-dialog" ref={node=>{if(node&&!node.open)node.showModal()}} onCancel={onClose} onClose={onClose} aria-label={title}><header><h2>{title}</h2><button className="cv-close" aria-label="Cerrar diálogo" onClick={onClose}>×</button></header>{children}<button className="cv-secondary cv-dialog-cancel" onClick={onClose}>Cerrar / cancelar</button></dialog>}

function SolicitudesIngresoDemo({requests,onReview}:{requests:SolicitudIngresoDemo[];onReview?:(id:string)=>void}) {
 return <section className="dashboard-card cv-card cv-intake" aria-label="Solicitudes de ingreso DEMO">
  <div className="cv-intake-head"><h2><ClipboardList/> Solicitudes de ingreso ({requests.length})</h2><span>Solo solicitudes ficticias</span></div>
  <p className="cv-intake-lead">Antecedentes declarados por clientes de muestra, pendientes de revisión del taller. No son órdenes de trabajo.</p>
  <div className="cv-intake-grid">{requests.map(request=><article className="cv-intake-item" key={request.id}>
   <div className="cv-intake-item-top"><span className="cv-intake-date">{request.date} · DEMO</span><span className="cv-badge amber">{allCases().some(v=>v.intakeRequestId===request.id)?'Recepción vinculada · DEMO':request.status}</span></div>
   <h3>{request.name}</h3>
   <p><strong>Vehículo:</strong> {request.vehicle}{request.plate==='No indicada'?'':' · Patente: '+request.plate}</p>
   <p><strong>Kilometraje:</strong> {request.mileage.toLocaleString('es-CL')} km</p>
   <p className="cv-intake-reason"><strong>Motivo informado:</strong> {request.clientReportedReason}</p>
   <p className="cv-intake-note">Sin diagnóstico profesional. Antecedentes temporales de esta pestaña; la OT requiere confirmación humana.</p>
   {onReview&&<button className="cv-secondary" onClick={()=>onReview(request.id)}>{allCases().some(v=>v.intakeRequestId===request.id)?'Abrir expediente':'Revisar ingreso'} <ArrowRight/></button>}
  </article>)}</div>
 </section>
}
