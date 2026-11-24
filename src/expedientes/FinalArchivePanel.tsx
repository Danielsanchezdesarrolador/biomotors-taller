import {useEffect,useRef,useState,useId} from 'react'
import {Archive,ArrowLeft,Download,Eye,Search,RefreshCw} from 'lucide-react'
import {ArchiveFailure,archiveMessage,type ArchiveRow,type ArchivedDocument,type DocumentKind} from './contracts'
import type {FinalArchivePort} from './repository'
import '../clientes/cp03PilotDirectory.css'
import './finalArchive.css'
const names={quote:'Cotización emitida',report:'Informe de trabajos',handover:'Constancia de entrega'}
export function FinalArchivePanel({repository,vehicleId,onBack}:{repository:FinalArchivePort;vehicleId?:string;onBack:()=>void}){
 const [query,setQuery]=useState(''),[term,setTerm]=useState(''),[rows,setRows]=useState<ArchiveRow[]>([]),[page,setPage]=useState<{at:string;id:string}>()
 const [selected,setSelected]=useState<ArchiveRow|null>(null),[documents,setDocuments]=useState<ArchivedDocument[]>([])
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[refresh,setRefresh]=useState(0)
 const [preview,setPreview]=useState<{url:string;name:string}|null>(null)
 const request=useRef({revisionId:'',id:''}),generation=useRef(0),alive=useRef(true),lock=useRef(false),dialog=useRef<HTMLDialogElement>(null),heading=useId()
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;generation.current++}},[repository])
 useEffect(()=>{let cancelled=false;const seq=++generation.current;setLoading(true);setRows([]);setSelected(null);setDocuments([]);setError('')
  void repository.list(term,vehicleId,page).then(data=>{if(!cancelled&&alive.current&&seq===generation.current)setRows(data)}).catch(e=>{if(!cancelled&&alive.current&&seq===generation.current)failed(e)}).finally(()=>{if(!cancelled&&alive.current&&seq===generation.current)setLoading(false)})
  return()=>{cancelled=true}
 },[repository,vehicleId,term,page,refresh])
 useEffect(()=>{if(preview)dialog.current?.showModal();else dialog.current?.close();return()=>{if(preview)URL.revokeObjectURL(preview.url)}},[preview])
 function failed(error:unknown){if(error instanceof ArchiveFailure&&error.kind==='denied'){setRows([]);setSelected(null);setDocuments([]);setPreview(null)}setError(archiveMessage(error))}
 async function open(row:ArchiveRow){if(lock.current)return;lock.current=true;setBusy(true);setError('');setDocuments([]);setSelected(row);const seq=++generation.current
  try{const data=await repository.documents(row.revisionId);if(alive.current&&seq===generation.current){setDocuments(data.documents);setSelected({...row,complete:data.complete})}}
  catch(e){if(alive.current&&seq===generation.current)failed(e)}finally{lock.current=false;if(alive.current)setBusy(false)}
 }
 async function pdf(kind:DocumentKind,view:boolean){if(!selected||lock.current)return;lock.current=true;setBusy(true);setError('');const seq=generation.current
  try{const result=await repository.bytes(selected.revisionId,kind);if(!alive.current||seq!==generation.current)return
   const url=URL.createObjectURL(new Blob([result.bytes.slice().buffer],{type:'application/pdf'}))
   if(view)setPreview({url,name:result.doc.fileName});else{const a=document.createElement('a');a.href=url;a.download=result.doc.fileName;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
  }catch(e){if(alive.current&&seq===generation.current)failed(e)}finally{lock.current=false;if(alive.current)setBusy(false)}
 }
 async function archive(){if(!selected||lock.current||!selected.canArchive)return
  if(!window.confirm('¿Archivar el expediente desde sus registros definitivos? Se conservarán los documentos sin permitir sobrescrituras.'))return
  if(request.current.revisionId!==selected.revisionId)request.current={revisionId:selected.revisionId,id:crypto.randomUUID()}
  lock.current=true;setBusy(true);setError('');const seq=generation.current
  try{await repository.archive(selected,request.current.id);if(!alive.current||seq!==generation.current)return
   setNotice('Archivo confirmado por el servidor. Consulta sus originales; no repitas la creación.');request.current={revisionId:'',id:''};setRefresh(n=>n+1)
  }catch(e){if(alive.current&&seq===generation.current)failed(e)}finally{lock.current=false;if(alive.current)setBusy(false)}
 }
 return <section className="official-panel cp03-pilot final-archive" aria-label="Expedientes documentales">
  <header className="welcome-area"><div className="welcome-head"><div><span className="official-eyebrow">Archivo privado del taller</span><h1>Documentos originales</h1><p>Revisiones históricas, incluidos registros archivados, órdenes canceladas y cotizaciones anuladas.</p></div><button className="cp03-secondary" disabled={busy} onClick={onBack}><ArrowLeft size={18}/> Volver</button></div></header>
  <section className="dashboard-card final-archive-controls"><form onSubmit={e=>{e.preventDefault();setPage(undefined);setTerm(query);setRefresh(n=>n+1)}}><label>Buscar cliente, patente o cotización<input value={query} maxLength={80} onChange={e=>setQuery(e.target.value)} disabled={busy}/></label><button className="cp03-primary" disabled={busy}><Search size={17}/> Buscar</button></form><button className="cp03-secondary" disabled={busy} onClick={()=>setRefresh(n=>n+1)}><RefreshCw size={17}/> Actualizar</button></section>
  {notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error}</p>}{loading&&<p role="status">Consultando revisiones autorizadas…</p>}
  <div className="final-archive-layout"><section className="dashboard-card" aria-label="Revisiones documentales">
   {!loading&&!rows.length&&!error&&<p>No hay documentos emitidos para esta consulta.</p>}
   {rows.slice(0,30).map(row=><button key={row.revisionId} className={'final-archive-row'+(selected?.revisionId===row.revisionId?' selected':'')} disabled={busy} onClick={()=>void open(row)}>
    <strong>{row.customerName} · {row.plate??'Sin patente'}</strong><span>Cotización {row.number} · Revisión {row.revision}</span><span>{new Date(row.issuedAt).toLocaleString('es-CL')} · {row.total.toLocaleString('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0})}</span>
    <small>{row.complete?'Expediente archivado':'Cotización original disponible'}{row.customerArchived||row.vehicleArchived?' · Registro archivado':''}{row.orderCancelled?' · OT cancelada':''}{row.quoteStatus==='voided'?' · Cotización anulada':''}</small>
   </button>)}
   <div className="final-archive-actions">{page&&<button className="cp03-secondary" disabled={busy} onClick={()=>setPage(undefined)}>Primera página</button>}{rows.length>30&&<button className="cp03-secondary" disabled={busy} onClick={()=>{const row=rows[29];setPage({at:row.issuedAt,id:row.revisionId})}}>Revisiones anteriores</button>}</div>
  </section><section className="dashboard-card final-archive-detail" aria-label="Documentos del expediente">
   {selected?<><h2>Cotización {selected.number} · Revisión {selected.revision}</h2><p>{selected.customerName} · {selected.plate??'Sin patente'}</p><p>Contenido e importes de la revisión original. La anulación o archivo no modifica sus documentos.</p>
    {!selected.complete&&<p>El informe y la constancia no tienen un original archivado disponible. No se regeneran al consultarlos.</p>}
    {documents.map(doc=><article className="final-archive-document" key={doc.kind}><h3>{names[doc.kind]}</h3><span>{(doc.byteLength/1024).toFixed(1)} KB · PDF privado</span><details><summary>Comprobante SHA-256</summary><code>{doc.sha256}</code></details><div className="final-archive-actions"><button className="cp03-secondary" disabled={busy} onClick={()=>void pdf(doc.kind,true)}><Eye size={17}/> Visualizar {names[doc.kind].toLowerCase()}</button><button className="cp03-secondary" disabled={busy} onClick={()=>void pdf(doc.kind,false)}><Download size={17}/> Descargar {names[doc.kind].toLowerCase()}</button></div></article>)}
    {selected.canArchive&&!selected.complete&&<button className="cp03-primary" disabled={busy} onClick={()=>void archive()}><Archive size={17}/> Archivar expediente definitivo</button>}
   </>:<p>Selecciona una visita y revisión para consultar sus documentos.</p>}
  </section></div>
  <dialog ref={dialog} className="final-archive-preview" aria-labelledby={heading} onCancel={()=>setPreview(null)} onClose={()=>setPreview(null)}>{preview&&<><header><h2 id={heading}>{preview.name}</h2><button className="cp03-secondary" onClick={()=>setPreview(null)}>Cerrar vista previa</button></header><iframe title={'PDF original: '+preview.name} src={preview.url} referrerPolicy="no-referrer"/></>}</dialog>
 </section>
}
