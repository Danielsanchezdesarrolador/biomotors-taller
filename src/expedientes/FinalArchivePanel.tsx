import {useEffect,useRef,useState,useId} from 'react'
import {Archive,ArrowLeft,Download,Eye,Search,RefreshCw} from 'lucide-react'
import {ArchiveFailure,archiveMessage,type ArchiveRow,type ArchiveDocumentSet,type ArchivedDocument,type DocumentKind} from './contracts'
import type {FinalArchivePort} from './repository'
import '../clientes/cp03PilotDirectory.css'
import './finalArchive.css'
const names={quote:'Cotización emitida',report:'Informe de trabajos',handover:'Constancia de entrega'}
export function FinalArchivePanel({repository,vehicleId,revisionId,fixedRow,orderId,onBack,onPendingChange,guided=false,registerSave}:{guided?:boolean;registerSave?:(save:((exit:boolean)=>Promise<boolean>)|null)=>void;repository:FinalArchivePort;vehicleId?:string;revisionId?:string;fixedRow?:ArchiveRow;orderId?:string;onPendingChange?:(pending:boolean)=>void;onBack:()=>void}){
 const label=(kind:DocumentKind)=>guided?({quote:'Cotización aprobada',report:'Informe de trabajos realizados',handover:'Constancia de entrega'})[kind]:names[kind]
 const [query,setQuery]=useState(''),[term,setTerm]=useState(''),[rows,setRows]=useState<ArchiveRow[]>([]),[page,setPage]=useState<{at:string;id:string}>()
 const [selected,setSelected]=useState<ArchiveRow|null>(null),[documents,setDocuments]=useState<ArchivedDocument[]>([])
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[refresh,setRefresh]=useState(0)
 const [preview,setPreview]=useState<{url:string;name:string}|null>(null)
 useEffect(()=>{onPendingChange?.(busy||loading);return()=>onPendingChange?.(false)},[busy,loading,onPendingChange])
 useEffect(()=>{if(guided&&!loading&&rows[0]&&!selected&&!busy)void open(rows[0])},[guided,loading,rows,selected,busy])
 useEffect(()=>{registerSave?.(async exit=>{if(loading||busy)return false;const row=selected??fixedRow;if(!row||!matches(row)){setError('No se pudo recuperar la revisión de esta visita.');return false}try{const saved=checked(row,await repository.documents(row.revisionId));if(exit||saved.complete)return true;if(!row.canArchive){setError('La entrega debe estar confirmada antes de archivar.');return false}return await archive(row)??false}catch(e){failed(e);return false}});return()=>registerSave?.(null)})
 function matches(row:ArchiveRow){return (!orderId||row.orderId===orderId)&&(!revisionId||row.revisionId===revisionId)&&(!vehicleId||row.vehicleId===vehicleId)&&(!guided||!!fixedRow&&row.orderId===fixedRow.orderId&&row.revisionId===fixedRow.revisionId&&row.workshopId===fixedRow.workshopId)}
 function checked(row:ArchiveRow,data:ArchiveDocumentSet){if(!matches(row)||data.workshopId!==row.workshopId||data.revisionId!==row.revisionId||data.quoteId!==row.quoteId||data.orderId!==row.orderId||data.vehicleId!==row.vehicleId||data.customerId!==row.customerId||data.revision!==row.revision)throw new ArchiveFailure('denied');return data}
 const request=useRef({revisionId:'',id:''}),generation=useRef(0),alive=useRef(true),lock=useRef(false),dialog=useRef<HTMLDialogElement>(null),heading=useId()
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;generation.current++}},[repository])
 useEffect(()=>{let cancelled=false;const seq=++generation.current;setLoading(true);setPreview(null);setRows([]);setSelected(null);setDocuments([]);setError('')
  void (fixedRow&&!matches(fixedRow)?Promise.reject(new ArchiveFailure('denied')):fixedRow?repository.documents(fixedRow.revisionId).then(d=>{checked(fixedRow,d);return [{...fixedRow,complete:d.complete,canArchive:!d.complete&&fixedRow.canArchive}]}):repository.list(term,vehicleId,page)).then(data=>{if(!cancelled&&alive.current&&seq===generation.current)setRows(revisionId?data.filter(r=>r.revisionId===revisionId):data)}).catch(e=>{if(!cancelled&&alive.current&&seq===generation.current)failed(e)}).finally(()=>{if(!cancelled&&alive.current&&seq===generation.current)setLoading(false)})
  return()=>{cancelled=true}
 },[repository,vehicleId,revisionId,fixedRow,orderId,guided,term,page,refresh])
 useEffect(()=>{if(preview)dialog.current?.showModal();else dialog.current?.close();return()=>{if(preview)URL.revokeObjectURL(preview.url)}},[preview])
 function failed(error:unknown){if(error instanceof ArchiveFailure&&error.kind==='denied'){setRows([]);setSelected(null);setDocuments([]);setPreview(null)}setError(archiveMessage(error))}
 async function open(row:ArchiveRow){if(lock.current)return;if(!matches(row)){failed(new ArchiveFailure('denied'));return}lock.current=true;setBusy(true);setError('');setDocuments([]);setSelected(row);const seq=++generation.current
  try{const data=checked(row,await repository.documents(row.revisionId));if(alive.current&&seq===generation.current){setDocuments(data.documents);setSelected({...row,complete:data.complete})}}
  catch(e){if(alive.current&&seq===generation.current)failed(e)}finally{lock.current=false;if(alive.current)setBusy(false)}
 }
 async function pdf(kind:DocumentKind,view:boolean){if(!selected||lock.current)return;if(!matches(selected)){failed(new ArchiveFailure('denied'));return}lock.current=true;setBusy(true);setError('');const seq=generation.current
  try{const result=await repository.bytes(selected.revisionId,kind);if(!alive.current||seq!==generation.current)return
   const url=URL.createObjectURL(new Blob([result.bytes.slice().buffer],{type:'application/pdf'}))
   if(view)setPreview({url,name:result.doc.fileName});else{const a=document.createElement('a');a.href=url;a.download=result.doc.fileName;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
  }catch(e){if(alive.current&&seq===generation.current)failed(e)}finally{lock.current=false;if(alive.current)setBusy(false)}
 }
 async function archive(row=selected){if(!row||lock.current||!row.canArchive)return;if(!matches(row)){failed(new ArchiveFailure('denied'));return}
  if(!window.confirm('¿Archivar el expediente desde sus registros definitivos? Se conservarán los documentos sin permitir sobrescrituras.'))return
  if(request.current.revisionId!==row.revisionId)request.current={revisionId:row.revisionId,id:crypto.randomUUID()}
  lock.current=true;setBusy(true);setError('');const seq=generation.current
  try{await repository.archive(row,request.current.id);if(!alive.current||seq!==generation.current)return
   const verified=checked(row,await repository.documents(row.revisionId));if(!verified.complete)throw new ArchiveFailure('integrity')
   setNotice('Archivo confirmado por el servidor. Consulta sus originales; no repitas la creación.');request.current={revisionId:'',id:''};setRefresh(n=>n+1);return true
  }catch(e){if(alive.current&&seq===generation.current)failed(e)}finally{lock.current=false;if(alive.current)setBusy(false)}
 }
 return <section className={"official-panel cp03-pilot final-archive"+(guided?" archive-guided":"")} data-loading={loading||busy} aria-label="Expedientes documentales">
  <header className="welcome-area"><div className="welcome-head"><div><span className="official-eyebrow">Archivo privado del taller</span><h1>Documentos originales</h1><p>Revisiones históricas, incluidos registros archivados, órdenes canceladas y cotizaciones anuladas.</p></div><button className="cp03-secondary" disabled={busy} onClick={onBack}><ArrowLeft size={18}/> Volver</button></div></header>
  <section className="dashboard-card final-archive-controls"><form onSubmit={e=>{e.preventDefault();setPage(undefined);setTerm(query);setRefresh(n=>n+1)}}><label>Buscar cliente, patente o cotización<input value={query} maxLength={80} onChange={e=>setQuery(e.target.value)} disabled={busy}/></label><button className="cp03-primary" disabled={busy}><Search size={17}/> Buscar</button></form><button className="cp03-secondary" disabled={busy} onClick={()=>setRefresh(n=>n+1)}><RefreshCw size={17}/> Actualizar</button></section>
  {notice&&<p role="status">{notice}</p>}{error&&<><p role="alert">{error}</p>{guided&&<button type="button" disabled={busy||loading} onClick={()=>setRefresh(n=>n+1)}>Volver a consultar originales</button>}</>}{loading&&<p role="status">Consultando revisiones autorizadas…</p>}
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
    {documents.map(doc=><article className="final-archive-document" key={doc.kind}><h3>{label(doc.kind)}</h3><span>{(doc.byteLength/1024).toFixed(1)} KB · PDF privado</span><details><summary>Comprobante SHA-256</summary><code>{doc.sha256}</code></details><div className="final-archive-actions"><button className="cp03-secondary" disabled={busy} aria-label={'Visualizar '+label(doc.kind).toLowerCase()} onClick={()=>void pdf(doc.kind,true)}><Eye size={17}/>{guided?'Visualizar':'Visualizar '+label(doc.kind).toLowerCase()}</button><button className="cp03-secondary" disabled={busy} aria-label={'Descargar '+label(doc.kind).toLowerCase()} onClick={()=>void pdf(doc.kind,false)}><Download size={17}/>{guided?'Descargar':'Descargar '+label(doc.kind).toLowerCase()}</button></div></article>)}
    {selected.canArchive&&!selected.complete&&<button className="cp03-primary" disabled={busy} onClick={()=>void archive()}><Archive size={17}/> Archivar expediente definitivo</button>}
   </>:<p>Selecciona una visita y revisión para consultar sus documentos.</p>}
  </section></div>
  <dialog ref={dialog} className="final-archive-preview" aria-labelledby={heading} onCancel={()=>setPreview(null)} onClose={()=>setPreview(null)}>{preview&&<><header><h2 id={heading}>{preview.name}</h2><button className="cp03-secondary" onClick={()=>setPreview(null)}>Cerrar vista previa</button></header><iframe title={'PDF original: '+preview.name} src={preview.url} referrerPolicy="no-referrer"/></>}</dialog>
 </section>
}
