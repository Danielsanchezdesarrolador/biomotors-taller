import {useState} from 'react'
import {FileDown,History,Send} from 'lucide-react'
import {WorkItemsTable} from '../informes/trabajos/WorkItemsEditor'
import {currency} from '../informes/trabajos/workItemCore'
import type {Bundle,Revision} from './contracts'
/** Presentation of frozen snapshots only. No edits, regeneration, or direct Storage access. */
export function QuoteHistory({bundle,busy,archiveEnabled,onDownload}:{
 bundle:Bundle;busy:boolean;archiveEnabled:boolean;onDownload:(revision:Revision)=>void
}){
 const [selectedId,setSelectedId]=useState<string|null>(null)
 const selected=bundle.revisions.find(r=>r.id===selectedId)??bundle.revisions[0]
 return <section className="cp05-history" aria-label="Historial de cotización">
   <div className="cp05-section-heading"><div><h2>Revisiones y trazabilidad</h2><p>Documentos y contenido confirmado al emitir.</p></div><History size={21} aria-hidden="true"/></div>
   {!bundle.revisions.length?<div className="cp05-history-empty"><History size={19}/><p>No hay revisiones emitidas ni archivos privados confirmados.</p></div>:
   <div className="cp05-history-workspace">
     <nav className="cp05-revision-list" aria-label="Revisiones emitidas">
       {bundle.revisions.map(r=><button key={r.id} type="button" className="cp04-secondary"
         aria-pressed={r.id===selected?.id} onClick={()=>setSelectedId(r.id)}>
         <strong>Revisión {r.revision}</strong><span>{new Date(r.issued_at).toLocaleDateString('es-CL')}</span>
         <b>{currency(r.payload.totals.total)}</b>
       </button>)}
     </nav>
     {selected&&<article className="cp05-revision-detail cp05-readonly" aria-label={'Contenido de la revisión '+selected.revision}>
       <div className="cp05-section-heading"><div><h3>Revisión {selected.revision} · Inmutable</h3><p>{selected.payload.customer.full_name} · {selected.payload.vehicle.plate||'Sin patente'}</p></div>
         <button className="cp04-secondary" disabled={busy||!archiveEnabled} onClick={()=>onDownload(selected)}>
           <FileDown size={16}/>{archiveEnabled?'Descargar PDF de esta revisión':'Archivo privado · pendiente de acceso'}
         </button></div>
       <p className="cp05-historical-origin">{selected.payload.workshop.name} · OT {selected.payload.order.id}</p>
       <WorkItemsTable document={{mode:'quote',items:selected.payload.items.map(i=>({id:i.id,description:i.description,type:i.type,quantity:i.quantity100/100,price:i.unit_price,performed:false}))}}
         onEdit={()=>{}} onDelete={()=>{}} onPerformed={()=>{}} readOnly/>
       <dl className="cp05-historical-totals"><div><dt>Neto</dt><dd>{currency(selected.payload.totals.subtotal)}</dd></div><div><dt>IVA 19 %</dt><dd>{currency(selected.payload.totals.tax)}</dd></div><div><dt>Total histórico</dt><dd>{currency(selected.payload.totals.total)}</dd></div></dl>
       <div className="cp05-historical-conditions"><h4>Condiciones de esta revisión</h4><p>Vigencia: {selected.payload.quote.valid_days} días</p><p className="cp05-preserve-text">{selected.payload.quote.terms||'Sin condiciones registradas.'}</p><h4>Observaciones</h4><p className="cp05-preserve-text">{selected.payload.quote.comments||'Sin observaciones registradas.'}</p></div>
       <details className="cp05-integrity"><summary>Identificación e integridad del archivo</summary><p>{new Date(selected.issued_at).toLocaleString('es-CL')}</p><code>SHA-256: {selected.pdf_sha256}</code><p>Contenido congelado al emitir; no utiliza el borrador actual.</p></details>
     </article>}
   </div>}
   {!!bundle.events.length&&<details className="cp05-ledger"><summary>Movimientos de la cotización ({bundle.events.length})</summary>{bundle.events.map(e=><p key={e.id}>{e.kind==='voided'?'Anulación':'Nueva revisión'} R{e.revision} · {new Date(e.created_at).toLocaleString('es-CL')} · {e.reason}</p>)}</details>}
   <details className="cp05-ledger"><summary><Send size={15}/> Envíos y trazabilidad ({bundle.deliveries.length})</summary>
     {!bundle.deliveries.length?<p>Sin intentos de envío registrados. La disponibilidad del correo depende de autorización del servidor.</p>:bundle.deliveries.map(d=><p key={d.id}>Intento {d.attempt} · {d.status==='queued'?'En cola, no confirmado':d.status==='sent'?'Aceptado por el proveedor (no acredita recepción)':'Error confirmado'} · {new Date(d.created_at).toLocaleString('es-CL')}{d.error_code?' · '+d.error_code:''}</p>)}
   </details>
 </section>
}
