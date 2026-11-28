import {useEffect,useLayoutEffect,useRef,useState,useSyncExternalStore} from 'react'
import './multipuntoDocuments.css'
import {PdfViewer} from '../documents/PdfViewer'
import {documentEpoch,subscribeDocuments,documentURL,revokeDocumentURL} from '../auth/documentAccess'
import type {MultipuntoPort,MPInfo,MPJob} from './repository'
const explanations:Record<string,string>={MP_PLAN_REQUIRED:'Las exportaciones multipunto requieren Plus o Full. El historial permanece disponible.',MP_QUOTA_EXHAUSTED:'Se agotaron las 10 solicitudes de esta semana comercial.',MP_ANTIABUSE_LIMIT:'Se alcanzó el límite de protección temporal. Full no tiene límite comercial.',MP_RENEW_REQUIRED:'La autorización dejó de estar vigente. Recupera el intento no consumido o confirma expresamente una nueva solicitud.',MP_SOURCE_CHANGED:'La inspección cambió. Consulta los datos actuales y confirma una nueva solicitud.',MP_SESSION_INVALID:'La sesión no es válida. Inicia sesión para revalidar el acceso.',MP_PERMISSION_DENIED:'No tienes permisos para esta acción.',MP_INTEGRITY_ERROR:'El original fue rechazado por integridad. No se regeneró ni se entregaron bytes.',MP_ORIGINAL_MISSING:'El original no está disponible. Requiere recuperación; no se regenerará.',MP_DISABLED:'El servicio documental no está habilitado.',MP_WRITE_DISABLED:'La emisión está deshabilitada.',MP_GATE_CLOSED:'El servicio está temporalmente bloqueado.',MP_CONFIRMED_OPERATION_NOT_RENEWABLE:'El intento ya consumido no puede renovarse. Confirma una nueva solicitud si necesitas otro documento.'}
type Attempt={id:string;kind:'draft'|'final';sourceHash:string;snapshotHash:string;maxAdditionalUnits:0|1;partialAck:boolean;creditId?:string}
export function MultipuntoDocuments({port,orderId,scope,blocked}:{port:MultipuntoPort;orderId:string;scope:string;blocked:boolean}){
 const epoch=useSyncExternalStore(subscribeDocuments,documentEpoch,documentEpoch),seq=useRef(0),lock=useRef(false),urlRef=useRef<string|null>(null),focus=useRef<HTMLElement|null>(null)
 const [info,setInfo]=useState<MPInfo|null>(null),[job,setJob]=useState<MPJob|null>(null),[credit,setCredit]=useState<string>(),[attempt,setAttempt]=useState<Attempt|null>(null),[ack,setAck]=useState(false),[paid,setPaid]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[viewer,setViewer]=useState<{url:string;title:string;identity:{documentId:string}|{jobId:string};epoch:number}|null>(null)
 const key='bt:mp-v2:'+scope+':'+orderId
 function close(){if(urlRef.current)revokeDocumentURL(urlRef.current);urlRef.current=null;setViewer(null)}
 useLayoutEffect(()=>{seq.current++;close();lock.current=false;setBusy(false);setInfo(null);setJob(null);setCredit(undefined);setPaid(false);setAck(false);setError('');try{setAttempt(JSON.parse(sessionStorage.getItem(key)||'null'))}catch{setAttempt(null)}return()=>{seq.current++;if(urlRef.current)revokeDocumentURL(urlRef.current)}},[key,epoch])
 useEffect(()=>{const n=seq.current;void port.info(orderId).then(x=>{if(seq.current===n)setInfo(x)}).catch(e=>{if(seq.current===n)setError(e.message)})},[port,orderId,epoch])
 useEffect(()=>{if(!viewer)return;const remaining='jobId'in viewer.identity&&job?.lease_until?Date.parse(job.lease_until)-Date.now():300000;const timer=setTimeout(()=>{close();setError('El visor cerró por vencimiento o inactividad. Vuelve a solicitar autorización; no se ha consumido otra solicitud.')},Math.max(0,Math.min(300000,remaining)));return()=>clearTimeout(timer)},[viewer,job?.lease_until])
 async function run(action:()=>Promise<void>){if(lock.current)return;const n=seq.current;lock.current=true;setBusy(true);setError('');try{await action()}catch(e){if(n===seq.current){close();setError(e instanceof Error?e.message:'MP_SERVICE_UNAVAILABLE')}}finally{if(n===seq.current){lock.current=false;setBusy(false)}}}
 async function refresh(){const n=seq.current;const x=await port.info(orderId);if(n===seq.current)setInfo(x)}
 function save(a:Attempt|null){setAttempt(a);try{if(a)sessionStorage.setItem(key,JSON.stringify(a));else sessionStorage.removeItem(key)}catch{/* metadata is optional; never permission */}}
 async function finish(result:Record<string,unknown>,id:string){
  if(result.state==='IN_PROGRESS')throw Error('Otro intento está en curso. Consulta el historial o recupera tu intento; no se reservó otro consumo.')
  const n=seq.current,current=await port.call<MPJob>('status',{jobId:id}).catch(()=>null);if(n!==seq.current)return
  if(current){setJob(current);if(result.state==='DRAFT_CONFIRMED')setCredit(current.credit_id)}
  await refresh()
 }
 async function prepare(kind:'draft'|'final'){
  if(!info||blocked)return
  const n=seq.current;let a=attempt
  if(!a){a={id:crypto.randomUUID(),kind,sourceHash:info.sourceHash,snapshotHash:info.snapshotHash,maxAdditionalUnits:credit?0:1,partialAck:ack,...(credit?{creditId:credit}:{})};save(a)}
  if(a.kind!==kind)throw Error('Recupera el intento pendiente o confirma una nueva solicitud antes de cambiar de acción.')
  const result=await port.call<Record<string,unknown>>('prepare',{orderId,requestId:a.id,kind:a.kind,sourceHash:a.sourceHash,snapshotHash:a.snapshotHash,maxAdditionalUnits:a.maxAdditionalUnits,partialAck:a.partialAck,...(a.creditId?{creditId:a.creditId}:{})})
  if(n!==seq.current)return
  if(result.documentId){save(null);await refresh();return}
  await finish(result,a.id)
  if(n===seq.current&&['ISSUED','DRAFT_CONFIRMED'].includes(String(result.state)))save(null)
 }
 async function show(identity:{documentId:string}|{jobId:string},title:string,download=false){
  const n=seq.current;focus.current=document.activeElement as HTMLElement|null
  const bytes=await port.read(orderId,identity);if(n!==seq.current)return;close();const url=documentURL(bytes)
  if(download){const a=document.createElement('a');a.href=url;a.download='multipunto-'+('documentId'in identity?'definitivo':'borrador')+'.pdf';a.click();setTimeout(()=>revokeDocumentURL(url),1500)}else{urlRef.current=url;setViewer({url,title,identity,epoch})}
 }
 const count=info?.items?.filter(i=>i.state!=='unreviewed').length??0,unreviewed=34-count,premium=info&&info.plan!=='basic',pending=blocked||!!info?.sourceProblem
 return <section className="cp04-pdf-controls mp-v2" aria-label="Documentos multipunto V2"><h3>Inspección multipunto · Documentos</h3>
 <p>El borrador lleva marca de agua. El informe definitivo se archiva por revisión y se entrega manualmente; no cambia el estado de la orden.</p>
 {info&&<><p>{count}/34 revisados · {unreviewed} sin revisar · {pending?'Guardado pendiente o fuente incompleta':'Datos confirmados en servidor'}</p><p>Revisión propuesta: R{info.nextRevision}. {info.orderStatus==='ready'||info.orderStatus==='closed'?'Inspección finalizada: la emisión no permite editar ni reabrir la orden.':''} Consumo previsto: {credit?'0 solicitudes si la conversión sigue vigente':'1 solicitud al confirmar correctamente'}. La autorización dura cinco minutos desde su reserva.</p>
 {!premium&&<p>Plan Básico: metadata histórica disponible. Exportaciones bloqueadas.</p>}
 {unreviewed>0&&<label><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/>Confirmo emitir una inspección parcial con {unreviewed} componentes sin revisar.</label>}
 {!credit&&<label><input type="checkbox" checked={paid} onChange={e=>setPaid(e.target.checked)}/>Autorizo como máximo una nueva solicitud. No se cobra por un error técnico.</label>}
 <div className="cp04-pdf-actions"><button type="button" disabled={busy||pending||!premium||(!credit&&!paid)} onClick={()=>void run(()=>prepare('draft'))}>Preparar borrador V2</button><button type="button" disabled={busy||pending||!info.canIssue||count===0||(unreviewed>0&&!ack)||(!credit&&!paid)} onClick={()=>void run(()=>prepare('final'))}>Emitir informe definitivo</button></div>
 {job?.state==='DRAFT_CONFIRMED'&&<><button type="button" disabled={busy} onClick={()=>void run(()=>show({jobId:job.id},'Borrador · No enviado'))}>Vista previa de borrador</button><button type="button" disabled={busy} onClick={()=>void run(()=>show({jobId:job.id},'Borrador',true))}>Descargar borrador</button></>}
 <h4>Historial de informes multipunto</h4>{info.originals.length===0&&<p>Sin informes definitivos emitidos.</p>}{info.originals.map(d=><div key={d.id}><strong>Informe definitivo R{d.revision}</strong><button type="button" disabled={busy||!premium} onClick={()=>void run(()=>show({documentId:d.id},'Informe definitivo R'+d.revision))}>Consultar informe definitivo R{d.revision}</button><button type="button" disabled={busy||!premium} onClick={()=>void run(()=>show({documentId:d.id},'Original R'+d.revision,true))}>Descargar original R{d.revision}</button></div>)}</>}
 {attempt&&<div><p>Hay un intento pendiente. Recuperarlo conserva su identidad; no genera otra reserva automáticamente.</p><button type="button" disabled={busy||pending} onClick={()=>void run(async()=>{const r=await port.call<Record<string,unknown>>('resume',{jobId:attempt.id});await finish(r,attempt.id);if(['ISSUED','DRAFT_CONFIRMED'].includes(String(r.state)))save(null)})}>Recuperar intento</button><button type="button" disabled={busy||pending||!paid} onClick={()=>void run(async()=>{const r=await port.call<Record<string,unknown>>('renew',{jobId:attempt.id,maxAdditionalUnits:1});await finish(r,attempt.id);if(['ISSUED','DRAFT_CONFIRMED'].includes(String(r.state)))save(null)})}>Renovar explícitamente intento no consumido</button></div>}
 <button type="button" disabled={busy} onClick={()=>void run(refresh)}>Consultar estado actual</button><button type="button" disabled={busy} onClick={()=>{close();save(null);setCredit(undefined);setPaid(false);setError('Nueva solicitud pendiente de tu confirmación. No se ha consumido cuota.')}}>Preparar nueva solicitud independiente</button>
 {error&&<p role="alert">{explanations[error]??error}</p>}{busy&&<p role="status">Verificando en servidor…</p>}
 {viewer&&<PdfViewer url={viewer.url} title={viewer.title} authority={viewer.epoch} returnFocus={focus.current} onClose={close} onDownload={()=>run(()=>show(viewer.identity,viewer.title,true))}/>}
 </section>
}
