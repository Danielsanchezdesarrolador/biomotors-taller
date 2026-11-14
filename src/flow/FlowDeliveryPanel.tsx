import { useId, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, ClipboardCheck, FileText, PauseCircle, XCircle, MoreHorizontal } from 'lucide-react'
import { readCase, type FlowCase } from './flowSession'
import { FlowDialog } from './FlowQuotePanels'
import { currency } from '../informes/trabajos/trabajosData'
import {
  cancelVisit, completeDelivery, deliveryRequirements, deliveryState,
  holdLabels, recordHold, resolveHold, type VisitHoldReason,
  type DeliveryChecklist
} from './flowClosure'

const date = (stamp:string) => new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Santiago'
}).format(new Date(stamp))
const defaults: DeliveryChecklist = {
  vehicleChecked:false, workChecked:false, documentsChecked:false, pendingExplained:false
}

export function FlowVisitActions({visit}:{visit:FlowCase}) {
  const state = deliveryState(visit)
  const [optionsOpen,setOptionsOpen] = useState(false)
  const optionsId = useId()
  const optionsTrigger = useRef<HTMLButtonElement>(null)
  const [mode,setMode] = useState<'pause'|'cancel'|'resolve'|null>(null)
  const [target,setTarget] = useState('')
  const [reason,setReason] = useState<VisitHoldReason>('repuestos')
  const [note,setNote] = useState('')
  const [accepted,setAccepted] = useState(false)
  const [error,setError] = useState('')
  const open = (kind:'pause'|'cancel'|'resolve', id='') => {
    setOptionsOpen(false);setMode(kind);setTarget(id);setNote('');setAccepted(false);setError('')
  }
  const submit = () => {
    try {
      const current = readCase(visit.id)
      if(mode==='pause')recordHold(current,reason,note,accepted)
      else if(mode==='resolve')resolveHold(current,target,note,accepted)
      else if(mode==='cancel')cancelVisit(current,note,accepted)
      setMode(null)
      requestAnimationFrame(()=>optionsTrigger.current?.focus())
    }catch(e){setError((e as Error).message)}
  }
  return <section className="fl-visit-actions dashboard-card" aria-label="Estado y excepciones de la visita" onKeyDown={e=>{
    if(e.key==='Escape' && optionsOpen){e.preventDefault();setOptionsOpen(false);optionsTrigger.current?.focus()}
  }}>
    <div className="fl-status-head">
      <strong>Estado de la visita</strong>
      <span className={'fl-lifecycle fl-life-'+state.status}>
        {state.status==='cerrada_demo'?'Entregada DEMO':
         state.status==='cancelada'?'Cancelada DEMO':
         state.status==='en_espera'?'En espera · DEMO':
         state.status==='cierre_desactualizado'?'Cierre requiere revisión':'En curso · DEMO'}
      </span>
    </div>
    {state.openHolds.length > 0 && <div className="fl-hold-list" role="status">
      {state.openHolds.map(hold=><div key={hold.id} className="fl-hold-row">
        <div><strong>{holdLabels[hold.reason]}</strong><small>{hold.note}</small></div>
        <button type="button" className="rp-secondary" onClick={()=>open('resolve',hold.id)}>Resolver pausa</button>
      </div>)}
    </div>}
    {state.status==='cancelada' ? <p className="fl-business-warning">
      Visita cancelada por el operador DEMO: {state.cancellation?.reason}. No se crea entrega ni se eliminan documentos anteriores.
    </p> : state.status==='cerrada_demo' ? <p className="fl-business-ok">
      Entrega DEMO registrada el {date(state.delivery!.date)}. Sin envío, firma ni respaldo permanente.
    </p> : state.status==='cierre_desactualizado' ? <p className="fl-business-warning">
      Se modificaron antecedentes tras una entrega simulada. El registro anterior permanece visible, pero ya no constituye un cierre vigente.
    </p> : <div className="fl-visit-options">
      <button ref={optionsTrigger} className="rp-secondary fl-options-toggle" type="button" aria-expanded={optionsOpen} aria-controls={optionsId} onClick={()=>setOptionsOpen(!optionsOpen)}><MoreHorizontal/> Opciones de visita</button>
      <div className="fl-visit-buttons" id={optionsId} hidden={!optionsOpen} role="group" aria-label="Opciones del expediente completo">
      <button type="button" className="rp-secondary" onClick={()=>open('pause')}><PauseCircle/> Registrar espera DEMO</button>
      <button type="button" className="rp-secondary" onClick={()=>open('cancel')}><XCircle/> Cancelar visita DEMO</button>
      </div>
    </div>}
    {state.holds.length>0 && <details className="fl-hold-history">
      <summary>Historial de pausas ({state.holds.length})</summary>
      {state.holds.map(h=><p key={h.id}><strong>{holdLabels[h.reason]}</strong> · {date(h.date)}
        <span>{h.resolvedAt?'Resuelta: '+h.resolution:'Pendiente de resolver'} · {h.note}</span>
      </p>)}
    </details>}
    {mode && <FlowDialog title={
        mode==='pause'?'Registrar espera de vehículo · DEMO':
        mode==='cancel'?'Cancelar la visita · DEMO':'Resolver una espera · DEMO'
      } onClose={()=>{setMode(null);requestAnimationFrame(()=>optionsTrigger.current?.focus())}}>
      <p>Esta operación solo modifica el expediente temporal de muestra, sin mensajes, pagos o acciones reales.</p>
      {mode==='pause' && <label>Causa de la espera
        <select aria-label="Causa de la espera" value={reason} onChange={e=>setReason(e.target.value as VisitHoldReason)}>
          {Object.entries(holdLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
      </label>}
      <label>{mode==='pause'?'Describe qué falta':mode==='resolve'?'¿Cómo se resolvió?':'Motivo de cancelación'}
        <textarea aria-label={mode==='pause'?'Describe qué falta':mode==='resolve'?'¿Cómo se resolvió?':'Motivo de cancelación'}
          value={note} maxLength={500} rows={3} onChange={e=>setNote(e.target.value)}/>
      </label>
      <small>{note.length} / 500</small>
      <label className="fl-business-consent"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/>
        Confirmo expresamente esta decisión DEMO, sin consecuencias legales ni modificación de datos reales.
      </label>
      {error && <p className="fl-error" role="alert">{error}</p>}
      <button type="button" className="rp-primary" disabled={!accepted||note.trim().length<8}
        onClick={submit}>{mode==='pause'?'Confirmar espera DEMO':mode==='resolve'?'Confirmar solución DEMO':'Confirmar cancelación DEMO'}</button>
    </FlowDialog>}
  </section>
}

export function FlowDeliveryPanel({
  visit,onInspection,onQuote,onWork
}:{
  visit:FlowCase
  onInspection:()=>void
  onQuote:()=>void
  onWork:()=>void
}) {
  const state=deliveryState(visit)
  const req=deliveryRequirements(visit)
  const [checklist,setChecklist]=useState<DeliveryChecklist>({...defaults})
  const [pending,setPending]=useState('')
  const [note,setNote]=useState('')
  const [confirmed,setConfirmed]=useState(false)
  const [error,setError]=useState('')
  const [showConfirm,setShowConfirm]=useState(false)
  const completed=state.status==='cerrada_demo'
  const frozen=state.status==='cancelada'||state.status==='cierre_desactualizado'
  const update=(key:keyof DeliveryChecklist,value:boolean)=>setChecklist(p=>({...p,[key]:value}))
  const submit=()=>{
    try {
      completeDelivery(readCase(visit.id),checklist,pending,note,confirmed)
      setShowConfirm(false)
      setError('')
    }catch(e){setError((e as Error).message)}
  }
  return <div className="fl-delivery">
    <p>Esta etapa cierra exclusivamente la visita ficticia. La entrega requiere revisión expresa y no representa pago, envío de documentos, firma ni conformidad legal del cliente.</p>
    {completed && state.delivery ? <div className="fl-business-ok" role="status">
      <h3><CheckCircle2/> Entrega DEMO completada</h3>
      <p>{date(state.delivery.date)} · {state.delivery.orderId}</p>
      <p>Informe {state.delivery.workReportId} · {state.delivery.performedCount} trabajos realizados · {currency(state.delivery.amount)}</p>
      <p>{state.delivery.pendingCount} trabajos no realizados, informados en el cierre.</p>
      {state.delivery.pendingNote&&<p><strong>Pendientes registrados:</strong> {state.delivery.pendingNote}</p>}
      <p>{state.delivery.finalNote}</p>
      <small>Registro temporal. Al recargar se perderá. No se creó comprobante de entrega real.</small>
    </div> : state.status==='cancelada' ? <div className="fl-business-warning" role="status">
      <XCircle/> La visita fue cancelada DEMO y no se puede marcar como entregada. Los documentos existentes siguen accesibles.
    </div> : state.status==='cierre_desactualizado' ? <div className="fl-business-warning">
      <AlertTriangle/> El cierre anterior ya no coincide con los documentos actuales. Conserva sus datos de referencia, pero no marques esta visita como entregada sin una revisión independiente.
    </div> : <>
      <div className="fl-delivery-overview">
        <div><small>Inspección</small><strong>{req.inspection?.finalized?'Finalizada DEMO':'Pendiente'}</strong></div>
        <div><small>Cotización</small><strong>{req.quote?req.quote.id+' · Rev. '+req.quote.revision:'Pendiente'}</strong></div>
        <div><small>Informe de trabajo</small><strong>{req.work?.id??'Pendiente'}</strong></div>
        <div><small>Trabajos realizados</small><strong>{req.performed.length}</strong></div>
        <div><small>Trabajos no realizados</small><strong>{req.pending.length}</strong></div>
        <div><small>Multipunto sin revisar</small><strong>{req.unreviewed.length}</strong></div>
        <div><small>Total informe</small><strong>{currency(req.amount)}</strong></div>
      </div>
      {req.unreviewed.length>0&&<p className="fl-notice"><strong>{req.unreviewed.length} controles multipunto sin revisar.</strong> No se consideran aprobados ni correctos; deben quedar expresamente señalados al entregar.</p>}
      {req.pending.length>0&&<div className="fl-notice">
        <strong>Trabajos sin ejecutar (no se cobran en el informe)</strong>
        <ul>{req.pending.map(i=><li key={i.id}>{i.description}</li>)}</ul>
      </div>}
      {req.technicalPending&&<p className="fl-notice"><strong>Observaciones del técnico:</strong> {req.technicalPending}</p>}
      {req.reasons.length>0 && <div className="fl-business-warning" role="status">
        <strong>Para habilitar la entrega falta:</strong>
        <ul>{req.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul>
      </div>}
      <div className="fl-business-actions">
        <button className="rp-secondary" onClick={onInspection}><ClipboardCheck/> Ver inspección</button>
        <button className="rp-secondary" onClick={onQuote}><FileText/> Ver cotización</button>
        <button className="rp-secondary" onClick={onWork}><FileText/> Ver informe de trabajo</button>
      </div>
      <h3><ClipboardCheck/> Confirmaciones para cerrar</h3>
      <div className="fl-delivery-checks">
        {([
          ['vehicleChecked','Revisé el vehículo y su estado antes de la entrega.'],
          ['workChecked','Verifiqué cuáles trabajos están realmente realizados.'],
          ['documentsChecked','Revisé la inspección, cotización y el informe final DEMO.'],
          ['pendingExplained','Revisé los pendientes y observaciones que deben comunicarse al cliente.']
        ] as [keyof DeliveryChecklist,string][]).map(([key,label])=><label key={key}>
          <input type="checkbox" checked={checklist[key]} onChange={e=>update(key,e.target.checked)}/>{label}
        </label>)}
      </div>
      {(req.pending.length>0||req.unreviewed.length>0||Boolean(req.technicalPending))&&<label className="fl-delivery-field">
        Cómo se informarán los trabajos u observaciones pendientes
        <textarea rows={3} maxLength={500} value={pending} onChange={e=>setPending(e.target.value)} aria-label="Explicación de pendientes"/>
        <small>{pending.length} / 500 · Texto obligatorio para pendientes</small>
      </label>}
      <label className="fl-delivery-field">Observación final de entrega DEMO
        <textarea rows={3} maxLength={500} value={note} onChange={e=>setNote(e.target.value)} aria-label="Observación final de entrega"/>
      </label>
      <button className="rp-primary" type="button" disabled={!req.eligible||frozen||!Object.values(checklist).every(Boolean)||note.trim().length<8||((req.pending.length>0||req.unreviewed.length>0||Boolean(req.technicalPending))&&pending.trim().length<8)}
        onClick={()=>{setError('');setConfirmed(false);setShowConfirm(true)}}>
        <CheckCircle2/> Revisar y confirmar entrega DEMO
      </button>
      {error&&<p role="alert" className="fl-error">{error}</p>}
      {showConfirm&&<FlowDialog title="Confirmación final de entrega · DEMO" onClose={()=>setShowConfirm(false)}>
        <p>Se registrará un cierre temporal para <strong>{visit.orderId}</strong>, con {req.performed.length} trabajos realizados y total de {currency(req.amount)}.</p>
        <p>Esta confirmación no notifica a ningún cliente ni garantiza entrega real.</p>
        <label className="fl-business-consent"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>
          Confirmo expresamente el cierre ficticio de esta visita; no hay firma ni envío real.
        </label>
        {error&&<p role="alert" className="fl-error">{error}</p>}
        <button type="button" className="rp-primary" disabled={!confirmed} onClick={submit}>Finalizar entrega DEMO</button>
      </FlowDialog>}
    </>}
    <p className="fl-help"><Clock3/> Historial de la visita limitado a esta pestaña; no hay respaldo de datos reales.</p>
  </div>
}
