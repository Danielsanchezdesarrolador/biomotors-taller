import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Play, Printer, Check, FileText, ClipboardCheck, UserRound, CarFront, CalendarDays, Gauge, Wrench, ContactRound, Phone, Mail, MessageSquare, Layers, Plus, TriangleAlert, ClipboardList, BarChart3, Droplet, CircleDot, Battery, Flashlight, Cable, Disc3 } from 'lucide-react'
import type { ReactNode } from 'react'
import { workStatusLabels, workStatusSequence, type WorkOrder, type WorkStatus, type InspectionState } from './ordenesData'
import { calculateTotals, clp, completedInspections, inspectionItems, inspectionLabels, type LineItem } from './detalleData'
import { readOrderRevision, writeOrderRevision } from './orderSession'
import './detalle.css'
function Card({title,icon,children,className=''}:{title:string;icon:ReactNode;children:ReactNode;className?:string}) {
  return <section className={'dashboard-card od-card '+className}><h2>{icon}{title}</h2>{children}</section>
}
function Inspection({states,onChange,sectionRef}:{states:Record<string,InspectionState>;onChange:(key:string,value:InspectionState)=>void;sectionRef:React.RefObject<HTMLDivElement|null>}) {
  const icons=[Droplet,Disc3,CircleDot,Battery,Wrench,Flashlight,Droplet,Cable]
  return <div ref={sectionRef} tabIndex={-1} className="od-inspection"><Card title="Inspección multipunto" icon={<ClipboardCheck/>}>
    <span className="od-count" aria-live="polite">{completedInspections(states)} de 8 ítems</span>
    {inspectionItems.map(([key,label],i)=>{const Icon=icons[i];return <label key={key} className="od-inspection-row"><Icon/><span>{label}</span><select aria-label={label} className={'od-state '+states[key]} value={states[key]} onChange={e=>onChange(key,e.target.value as InspectionState)}>{Object.entries(inspectionLabels).map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>})}
  </Card></div>
}
function Parts({items,onAdd}:{items:LineItem[];onAdd:()=>void}) {
  const totals=calculateTotals(items)
  return <Card title="Repuestos y mano de obra" icon={<Layers/>} className="od-parts"><button className="od-add" onClick={onAdd}><Plus size={16}/> Agregar ítem</button>
    <table><thead><tr><th>Ítem</th><th>Tipo</th><th>Cantidad</th><th>P. unitario</th><th>Subtotal</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><Wrench/>{item.description}</td><td><span className={'od-type '+(item.type==='Servicio'?'service':item.type==='Repuesto'?'part':'labor')}>{item.type}</span></td><td>{item.quantity.toLocaleString('es-CL')}{item.type==='Mano de obra'?' h':''}</td><td>{clp(item.price)}</td><td><strong>{clp(Math.round(item.quantity*item.price))}</strong></td></tr>)}</tbody></table>
    <dl className="od-totals"><div><dt>Subtotal</dt><dd>{clp(totals.subtotal)}</dd></div><div><dt>IVA ilustrativo (19%)</dt><dd>{clp(totals.tax)}</dd></div><div className="od-grand"><dt>Total de la orden</dt><dd data-testid="order-total">{clp(totals.total)}</dd></div></dl>
  </Card>
}
function Progress({status}:{status:WorkStatus}) {
  const steps=workStatusSequence.slice(0,4),current=workStatusSequence.indexOf(status)
  return <Card title="Historial / progreso de la orden" icon={<BarChart3/>} className="od-progress"><span className="od-count">{status==='finalizada'?'Finalizada · DEMO':'En curso · DEMO'}</span><ol>{steps.map((step,i)=><li key={step} className={i<current?'done':i===current?'current':''}><span>{i<current?<Check/>:i===current?<Wrench/>:<ClipboardCheck/>}</span><strong>{workStatusLabels[step]}</strong><small>{i===current?'Estado actual':i<current?'Completada · DEMO':'—'}</small></li>)}</ol></Card>
}
export function OrdenDetalle({order,onBack,onNotify,onStatus,onClient,onMultipunto}:{onMultipunto?:(orderId:string)=>void;onClient?:()=>void;order:WorkOrder;onBack:()=>void;onNotify:(message:string)=>void;onStatus:(status:WorkStatus)=>void}) {
  const [states,setStates]=useState<Record<string,InspectionState>>(()=>readOrderRevision(order).inspection)
  const [items,setItems]=useState<LineItem[]>(()=>readOrderRevision(order).items)
  useEffect(()=>writeOrderRevision({order,inspection:states,items}),[order,states,items])
  const [modal,setModal]=useState<'item'|'report'|'finish'|null>(null)
  const inspectionRef=useRef<HTMLDivElement>(null)
  const reference=order.id==='OT-1002'
  function review() { inspectionRef.current?.scrollIntoView({behavior:'smooth',block:'center'});inspectionRef.current?.focus();onNotify('Continúa la inspección DEMO. Los cambios son temporales y se perderán al recargar la página.') }
  const displayClient=reference?'María Torres':order.client
  const displayPlate=reference?'KZV-482':order.plate
  const summary=[{label:'Cliente',value:displayClient,Icon:UserRound},{label:'Vehículo',value:order.vehicle,Icon:CarFront},{label:'Patente',value:displayPlate,Icon:ContactRound},{label:'Fecha de ingreso',value:order.date,Icon:CalendarDays},{label:'Kilometraje',value:order.mileage.toLocaleString('es-CL')+' km',Icon:Gauge},{label:'Técnico',value:reference?'Carlos Méndez':order.technician,Icon:UserRound}]
  return <div className="od-detail">
    <header className="od-header"><button className="bt-ot-back" aria-label="Volver al listado de órdenes" onClick={onBack}><ArrowLeft/></button><div className="od-heading"><h1>Orden de trabajo</h1><p>Ficha técnica y seguimiento del servicio</p></div><div className="od-actions"><button className="bt-ot-primary" onClick={review}><Play/> Continuar orden</button><button className="bt-ot-secondary" onClick={()=>setModal('report')}><FileText/> Generar informe</button><button className="bt-ot-secondary" onClick={()=>window.print()}><Printer/> Imprimir</button><button className="od-finish" onClick={()=>setModal('finish')} disabled={order.status==='finalizada'}><Check/> Finalizar</button></div></header>
    <section className="dashboard-card od-summary" aria-label="Resumen de la orden"><div className="od-number"><ClipboardCheck/><div><strong>{order.id}</strong><span>Orden de trabajo</span></div></div>{summary.map(({label,value,Icon})=><div className="od-summary-field" key={label}><Icon/><div><span>{label}</span><strong>{value}</strong></div></div>)}<select aria-label="Estado de orden DEMO" className={'order-status od-status-select status-'+order.status} value={order.status} onChange={e=>{if(e.target.value==='finalizada'){setModal('finish');return}onStatus(e.target.value as WorkStatus);onNotify('Cambio de estado solo en memoria DEMO, sin guardado real.')}}>{workStatusSequence.map(status=><option key={status} value={status}>{workStatusLabels[status]}</option>)}</select></section>
    <div className="od-upper">
      <Card title="Cliente y vehículo" icon={<UserRound/>} className="od-customer"><div className="od-person"><UserRound/><div><small>Cliente</small><strong>{displayClient}</strong><span><Phone/> +56 9 0000 0000</span><span><Mail/> cliente.demo@example.com</span></div><button onClick={()=>onClient ? onClient() : onNotify('Ficha de cliente DEMO: este módulo estará disponible próximamente.')} >Ver cliente <ArrowRight/></button></div><div className="od-person"><CarFront/><div><small>Vehículo</small><strong>{order.vehicle}</strong><span>{reference?'SUV · 2.0L Gasolina':'Vehículo de demostración'}</span><span><ContactRound/>{displayPlate} <Gauge/>{order.mileage.toLocaleString('es-CL')} km</span></div><button onClick={()=>onClient ? onClient() : onNotify('Ficha de vehículo DEMO: historial permanente pendiente de conexión segura.')} >Ver vehículo <ArrowRight/></button></div></Card>
      <Card title="Diagnóstico / descripción del trabajo" icon={<Wrench/>} className="od-diagnosis"><div><FileText/><section><h3>Descripción del problema</h3><p>{order.symptoms}</p></section></div><div><MessageSquare/><section><h3>Notas del técnico</h3><p>{order.diagnosis} {order.recommendation}</p></section></div></Card>
      <Inspection states={states} sectionRef={inspectionRef} onChange={(key,value)=>setStates(previous=>({...previous,[key]:value}))}/>
    </div>
    <div className="od-lower"><Parts items={items} onAdd={()=>setModal('item')}/><div className="od-right"><Card title="Observaciones técnicas pendientes" icon={<ClipboardList/>} className="od-pending"><div><TriangleAlert/><ul>{order.pending.length?order.pending.map(text=><li key={text}>{text}</li>):<li>Sin observaciones pendientes en este ejemplo.</li>}</ul></div></Card><Progress status={order.status}/></div></div>
    <p className="od-demo">Ficha DEMO · Valores ilustrativos, no es una factura tributaria. Todos los antecedentes son ficticios. Sin guardado real; cambios de esta ficha solo en memoria.</p>
    <p className="od-footnote">Observaciones vinculadas a {order.id} · {order.plate}. Su conservación en el historial permanente requiere el futuro backend seguro.</p>
    {modal && <DetailDialog title={modal==='item'?'Agregar ítem DEMO':modal==='report'?'Vista previa de informe DEMO':'Finalizar orden DEMO'} onClose={()=>setModal(null)}>
      {modal==='item'?<ItemForm onAdd={item=>{setItems(previous=>[...previous,item]);setModal(null)}}/>:modal==='report'?<>{onMultipunto&&<button className="bt-ot-primary" onClick={()=>onMultipunto(order.id)}>Crear inspección multipunto</button>}<p>Vista ilustrativa · Sin envío de correos ni documento tributario.</p><h3>{order.id} · {order.vehicle}</h3><p>{order.service}</p><p>{order.diagnosis}</p><p>Inspección: {completedInspections(states)} de 8 ítems revisados</p><ul>{order.pending.map(text=><li key={text}>{text}</li>)}</ul><strong>Total ilustrativo: {clp(calculateTotals(items).total)}</strong><button className="bt-ot-secondary" onClick={()=>{setModal(null);setTimeout(()=>window.print(),0)}}><Printer/> Imprimir ficha DEMO</button></>:<><p>Solo cambiará el estado en esta sesión de demostración. No se guardará una finalización real ni se borrarán las observaciones pendientes.</p><button className="od-finish" onClick={()=>{onStatus('finalizada');setModal(null);onNotify('Orden finalizada únicamente en memoria DEMO. No se guardó en Supabase.')}}>Confirmar finalización DEMO</button></>}
    </DetailDialog>}
  </div>
}
function DetailDialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}) {
  const ref=useRef<HTMLDialogElement>(null)
  return <dialog ref={node=>{ref.current=node;if(node&&!node.open)node.showModal()}} onClose={onClose} onCancel={onClose} aria-label={title} className="od-dialog"><h2>{title}</h2>{children}<button className="bt-ot-secondary" onClick={onClose}>Cerrar / cancelar</button></dialog>
}
function ItemForm({onAdd}:{onAdd:(item:LineItem)=>void}) {
  return <form onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget);onAdd({id:crypto.randomUUID(),description:String(data.get('description')).trim(),type:data.get('type') as LineItem['type'],quantity:Number(data.get('quantity')),price:Number(data.get('price'))})}}><p>Ítem temporal. Solo en memoria hasta recargar la página. No ingreses datos personales.</p><label>Descripción<input name="description" required maxLength={120} pattern=".*\S.*"/></label><label>Tipo<select name="type"><option>Repuesto</option><option>Servicio</option><option>Mano de obra</option></select></label><label>Cantidad<input name="quantity" type="number" min="0.01" max="10000" step="0.01" defaultValue="1" required/></label><label>Precio unitario (CLP)<input name="price" type="number" min="0" max="100000000" step="1" required/></label><button className="bt-ot-primary">Agregar a la DEMO</button></form>
}
