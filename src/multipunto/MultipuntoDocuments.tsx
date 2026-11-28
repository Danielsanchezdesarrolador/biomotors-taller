import {useEffect,useLayoutEffect,useRef,useState,useSyncExternalStore} from 'react'
import './multipuntoDocuments.css'
import {PdfViewer} from '../documents/PdfViewer'
import {documentEpoch,subscribeDocuments,documentURL,revokeDocumentURL} from '../auth/documentAccess'
import type {MultipuntoPort,MPInfo,MPJob,MPStatus} from './repository'
const explanations:Record<string,string>={MP_OPERATION_NOT_FOUND:'El servidor no tiene una preparación para ese intento. Confirma individualmente una nueva solicitud.',MP_CONSENT_REQUIRED:'Confirma individualmente la solicitud antes de continuar.',MP_READ_RATE_LIMIT:'Alcanzaste el límite técnico temporal de consultas. Intenta nuevamente en un minuto; no se ha consumido cuota comercial.',MP_PLAN_REQUIRED:'Las exportaciones multipunto requieren Plus o Full. El historial permanece disponible.',MP_QUOTA_EXHAUSTED:'Se agotaron las 10 solicitudes de esta semana comercial.',MP_ANTIABUSE_LIMIT:'Se alcanzó el límite de protección temporal. Full no tiene límite comercial.',MP_RENEW_REQUIRED:'La autorización dejó de estar vigente. Recupera el intento no consumido o confirma expresamente una nueva solicitud.',MP_SOURCE_CHANGED:'La inspección cambió. Consulta los datos actuales y confirma una nueva solicitud.',MP_SESSION_INVALID:'La sesión no es válida. Inicia sesión para revalidar el acceso.',MP_PERMISSION_DENIED:'No tienes permisos para esta acción.',MP_INTEGRITY_ERROR:'El original fue rechazado por integridad. No se regeneró ni se entregaron bytes.',MP_ORIGINAL_MISSING:'El original no está disponible. Requiere recuperación; no se regenerará.',MP_DISABLED:'El servicio documental no está habilitado.',MP_WRITE_DISABLED:'La emisión está deshabilitada.',MP_GATE_CLOSED:'El servicio está temporalmente bloqueado.',MP_CONFIRMED_OPERATION_NOT_RENEWABLE:'El intento ya consumido no puede renovarse. Confirma una nueva solicitud si necesitas otro documento.'}
type Attempt={id:string;kind:'draft'|'final';sourceHash:string;snapshotHash:string;maxAdditionalUnits:0|1;partialAck:boolean;creditId?:string}
type Chain=Readonly<{key:string;orderId:string;scope:string;epoch:number;port:MultipuntoPort}>
type Identity={documentId:string}|{jobId:string}
type Viewer={url:string;title:string;identity:Identity;context:Chain;focus:HTMLElement|null}
const complete=(state:unknown)=>state==='ISSUED'||state==='DRAFT_CONFIRMED'
const terminal=(state:string)=>['EXPIRED','DENIED','SOURCE_CHANGED','FAILED'].includes(state)
function storedAttempt(value:unknown):value is Attempt{
 const a=value as Attempt
 return !!a&&typeof a.id==='string'&&/^[a-f0-9-]{36}$/i.test(a.id)&&['draft','final'].includes(a.kind)&&/^[a-f0-9]{64}$/.test(a.sourceHash)&&/^[a-f0-9]{64}$/.test(a.snapshotHash)&&[0,1].includes(a.maxAdditionalUnits)&&typeof a.partialAck==='boolean'&&(a.creditId===undefined||/^[a-f0-9-]{36}$/i.test(a.creditId))
}
export function MultipuntoDocuments({port,orderId,scope,blocked}:{port:MultipuntoPort;orderId:string;scope:string;blocked:boolean}){
 const epoch=useSyncExternalStore(subscribeDocuments,documentEpoch,documentEpoch)
 const active=useRef<Chain|null>(null),owner=useRef<Chain|null>(null),url=useRef<{context:Chain;value:string}|null>(null)
 const infoRef=useRef<MPInfo|null>(null),attemptRef=useRef<Attempt|null>(null),consent=useRef<{context:Chain;snapshot:string}|null>(null)
 const [info,setInfo]=useState<MPInfo|null>(null),[job,setJob]=useState<MPJob|null>(null),[attempt,setAttempt]=useState<Attempt|null>(null),[ack,setAck]=useState(false),[paid,setPaid]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[viewer,setViewer]=useState<Viewer|null>(null)
 const current=(c:Chain)=>active.current===c&&documentEpoch()===c.epoch
 function assert(c:Chain){if(!current(c))throw Error('MP_CONTEXT_CHANGED')}
 function close(c:Chain){if(!current(c))return;if(url.current?.context===c){revokeDocumentURL(url.current.value);url.current=null}setViewer(null)}
 function save(c:Chain,a:Attempt|null){assert(c);attemptRef.current=a;setAttempt(a);try{if(a)sessionStorage.setItem(c.key,JSON.stringify(a));else sessionStorage.removeItem(c.key)}catch{/* Optional metadata, never authority. */}}
 function clearConsent(c:Chain){assert(c);consent.current=null;setPaid(false)}
 useLayoutEffect(()=>{
  const c:Chain=Object.freeze({key:'bt:mp-v2:'+scope+':'+orderId,orderId,scope,epoch,port});active.current=c;owner.current=null
  infoRef.current=null;attemptRef.current=null;consent.current=null;setInfo(null);setJob(null);setViewer(null);setBusy(false);setAck(false);setPaid(false);setError('')
  let saved:Attempt|null=null;try{const v=JSON.parse(sessionStorage.getItem(c.key)||'null');if(storedAttempt(v))saved=v}catch{/* Ignore malformed, non-authoritative metadata. */}
  attemptRef.current=saved;setAttempt(saved)
  return()=>{if(active.current===c)active.current=null;if(owner.current===c)owner.current=null;if(url.current?.context===c){revokeDocumentURL(url.current.value);url.current=null}}
 },[scope,orderId,epoch,port])
 async function refresh(c:Chain){
  assert(c);const next=await c.port.info(c.orderId,()=>current(c));assert(c)
  if(next.orderId!==c.orderId)throw Error('MP_RESOURCE_DENIED')
  if(infoRef.current&&infoRef.current.snapshotHash!==next.snapshotHash){clearConsent(c);setAck(false)}
  infoRef.current=next;setInfo(next);return next
 }
 useEffect(()=>{const c=active.current;if(!c)return;void refresh(c).catch(e=>{if(current(c))setError(e.message)})},[port,orderId,scope,epoch])
 useEffect(()=>{if(!viewer)return;const c=viewer.context,remaining='jobId'in viewer.identity&&job?.lease_until?Date.parse(job.lease_until)-Date.now():300000;const timer=setTimeout(()=>{if(current(c)){close(c);setError('El visor cerró por vencimiento o inactividad. Solicita autorización nuevamente; no se ha consumido otra solicitud.')}},Math.max(0,Math.min(300000,remaining)));return()=>clearTimeout(timer)},[viewer,job?.lease_until])
 async function run(action:(c:Chain)=>Promise<void>){
  const c=active.current;if(!c||!current(c)||owner.current)return
  owner.current=c;setBusy(true);setError('')
  try{await action(c)}catch(e){if(current(c)){close(c);setError(e instanceof Error?e.message:'MP_SERVICE_UNAVAILABLE')}}
  finally{if(owner.current===c){owner.current=null;if(current(c))setBusy(false)}}
 }
 function takeConsent(c:Chain,snapshot:string){assert(c);if(consent.current?.context!==c||consent.current.snapshot!==snapshot)throw Error('MP_CONSENT_REQUIRED');clearConsent(c)}
 async function finish(c:Chain,result:Record<string,unknown>,requestedId:string){
  assert(c)
  if(result.state==='IN_PROGRESS'){save(c,null);await refresh(c);assert(c);throw Error('Otro intento está en curso. No se reservó otro consumo. Consulta el historial antes de continuar.')}
  if(result.documentId){await refresh(c);assert(c);save(c,null);return}
  const id=typeof result.jobId==='string'?result.jobId:requestedId
  const status=await c.port.call<MPStatus>('status',{jobId:id},()=>current(c));assert(c)
  if(status.state==='NOT_PREPARED'){await refresh(c);assert(c);save(c,null);clearConsent(c);return}
  if(status.order_id!==c.orderId||status.id!==id)throw Error('MP_RESOURCE_DENIED')
  setJob(status)
  // Both direct final and draft recover authority only from a fresh server response.
  await refresh(c);assert(c)
  if(complete(status.state)||terminal(status.state)){save(c,null);clearConsent(c)}
 }
 async function prepare(c:Chain,kind:'draft'|'final'){
  assert(c);if(blocked)return
  let a=attemptRef.current
  if(a&&a.kind!==kind)throw Error('Recupera el intento pendiente antes de cambiar de acción.')
  if(!a){
   const displayed=infoRef.current;if(!displayed)return
   const next=await refresh(c);assert(c)
   if(next.snapshotHash!==displayed.snapshotHash)throw Error('MP_SOURCE_CHANGED')
   const credit=next.eligibleCredit
   // Expired/uncertain credit never falls through from zero to one unit.
   if(displayed.eligibleCredit&&!credit){clearConsent(c);throw Error('MP_RENEW_REQUIRED')}
   if(!credit)takeConsent(c,next.snapshotHash)
   a=Object.freeze({id:crypto.randomUUID(),kind,sourceHash:next.sourceHash,snapshotHash:next.snapshotHash,maxAdditionalUnits:credit?0:1,partialAck:ack,...(credit?{creditId:credit.id}:{})})
   save(c,a)
  }
  try{
   const result=await c.port.call<Record<string,unknown>>('prepare',{orderId:c.orderId,requestId:a.id,kind:a.kind,sourceHash:a.sourceHash,snapshotHash:a.snapshotHash,maxAdditionalUnits:a.maxAdditionalUnits,partialAck:a.partialAck,...(a.creditId?{creditId:a.creditId}:{})},()=>current(c));assert(c)
   await finish(c,result,a.id)
  }catch(e){
   if(current(c)&&e instanceof Error&&['MP_RENEW_REQUIRED','MP_SOURCE_CHANGED','MP_QUOTA_EXHAUSTED','MP_PARTIAL_CONFIRMATION_REQUIRED','MP_CONSENT_REQUIRED','MP_WORKER_FENCED','MP_OPERATION_NOT_FOUND'].includes(e.message)){const state=await c.port.call<MPStatus>('status',{jobId:a.id},()=>current(c));assert(c);await refresh(c);assert(c);if(state.state==='NOT_PREPARED'){save(c,null);clearConsent(c)}}
   throw e
  }
 }
 async function recover(c:Chain,renew=false){
  assert(c);const a=attemptRef.current;if(!a)return
  const status=await c.port.call<MPStatus>('status',{jobId:a.id},()=>current(c));assert(c)
  if(status.state==='NOT_PREPARED'){await refresh(c);assert(c);save(c,null);clearConsent(c);throw Error('MP_OPERATION_NOT_FOUND')}
  if(status.order_id!==c.orderId)throw Error('MP_RESOURCE_DENIED')
  if(complete(status.state)){await finish(c,{state:status.state,jobId:status.id},a.id);return}
  if(renew)takeConsent(c,infoRef.current?.snapshotHash??'')
  const result=await c.port.call<Record<string,unknown>>(renew?'renew':'resume',{jobId:a.id,...(renew?{maxAdditionalUnits:1}:{})},()=>current(c));assert(c);await finish(c,result,a.id)
 }
 async function independent(c:Chain){
  assert(c);const a=attemptRef.current
  if(a){const status=await c.port.call<MPStatus>('status',{jobId:a.id},()=>current(c));assert(c);if(status.state!=='NOT_PREPARED'&&status.order_id!==c.orderId)throw Error('MP_RESOURCE_DENIED');if(status.state!=='NOT_PREPARED'&&!complete(status.state)&&!terminal(status.state))throw Error('El estado del intento sigue pendiente. Recupéralo antes de iniciar otra solicitud.');await refresh(c);assert(c);save(c,null)}else await refresh(c)
  assert(c);close(c);setJob(null);clearConsent(c);setError('Nueva solicitud pendiente de confirmación individual. No se ha consumido cuota.')
 }
 async function show(c:Chain,identity:Identity,title:string,download=false){
  assert(c);const focus=document.activeElement as HTMLElement|null,bytes=await c.port.read(c.orderId,identity,()=>current(c));assert(c);close(c);const value=documentURL(bytes)
  if(download){const a=document.createElement('a');a.href=value;a.download='multipunto-'+('documentId'in identity?'definitivo':'borrador')+'.pdf';a.click();setTimeout(()=>revokeDocumentURL(value),1500)}else{url.current={context:c,value};setViewer({url:value,title,identity,context:c,focus})}
 }
 const credit=info?.eligibleCredit,count=info?.items?.filter(i=>i.state!=='unreviewed').length??0,unreviewed=34-count,premium=info&&info.plan!=='basic',pending=blocked||!!info?.sourceProblem
 const canPrepare=(kind:Attempt['kind'])=>attempt?attempt.kind===kind:!!credit||paid
 return <section className="cp04-pdf-controls mp-v2" aria-label="Documentos multipunto V2"><h3>Inspección multipunto · Documentos</h3>
 <p>El borrador lleva marca de agua. El informe definitivo se archiva por revisión y se entrega manualmente; no cambia el estado de la orden.</p>
 {info&&<><p>{count}/34 revisados · {unreviewed} sin revisar · {pending?'Guardado pendiente o fuente incompleta':'Datos confirmados en servidor'}</p><p>Revisión propuesta: R{info.nextRevision}. {info.orderStatus==='ready'||info.orderStatus==='closed'?'Inspección finalizada: la emisión no permite editar ni reabrir la orden.':''} Consumo previsto: {credit?'0 solicitudes si la conversión sigue vigente':'1 solicitud al confirmar correctamente'}. La autorización dura cinco minutos desde su reserva.</p>
 {!premium&&<p>Plan Básico: metadata histórica disponible. Exportaciones bloqueadas.</p>}
 {unreviewed>0&&<label><input type="checkbox" disabled={busy} checked={ack} onChange={e=>setAck(e.target.checked)}/>Confirmo emitir una inspección parcial con {unreviewed} componentes sin revisar.</label>}
 {(!credit||attempt)&&<label><input type="checkbox" disabled={busy} checked={paid} onChange={e=>{const c=active.current;if(!c||!current(c))return;consent.current=e.target.checked&&infoRef.current?{context:c,snapshot:infoRef.current.snapshotHash}:null;setPaid(e.target.checked)}}/>Autorizo como máximo una nueva solicitud. No se cobra por un error técnico.</label>}
 <div className="cp04-pdf-actions"><button type="button" disabled={busy||pending||!premium||!canPrepare('draft')} onClick={()=>void run(c=>prepare(c,'draft'))}>Preparar borrador V2</button><button type="button" disabled={busy||pending||!info.canIssue||count===0||(unreviewed>0&&!ack&&!attempt?.partialAck)||!canPrepare('final')} onClick={()=>void run(c=>prepare(c,'final'))}>Emitir informe definitivo</button></div>
 {job?.state==='DRAFT_CONFIRMED'&&<><button type="button" disabled={busy} onClick={()=>void run(c=>show(c,{jobId:job.id},'Borrador · No enviado'))}>Vista previa de borrador</button><button type="button" disabled={busy} onClick={()=>void run(c=>show(c,{jobId:job.id},'Borrador',true))}>Descargar borrador</button></>}
 <h4>Historial de informes multipunto</h4>{info.originals.length===0&&<p>Sin informes definitivos emitidos.</p>}{info.originals.map(d=><div key={d.id}><strong>Informe definitivo R{d.revision}</strong><button type="button" disabled={busy||!premium} onClick={()=>void run(c=>show(c,{documentId:d.id},'Informe definitivo R'+d.revision))}>Consultar informe definitivo R{d.revision}</button><button type="button" disabled={busy||!premium} onClick={()=>void run(c=>show(c,{documentId:d.id},'Original R'+d.revision,true))}>Descargar original R{d.revision}</button></div>)}</>}
 {attempt&&<div><p>Hay un intento pendiente. Recuperarlo conserva su identidad y consentimiento original; no inicia otra reserva.</p><button type="button" disabled={busy||pending} onClick={()=>void run(c=>recover(c))}>Recuperar intento</button><button type="button" disabled={busy||pending||!premium||!paid} onClick={()=>void run(c=>recover(c,true))}>Renovar explícitamente intento no consumido</button></div>}
 <button type="button" disabled={busy} onClick={()=>void run(async c=>{await refresh(c)})}>Consultar estado actual</button><button type="button" disabled={busy} onClick={()=>void run(independent)}>Preparar nueva solicitud independiente</button>
 {error&&<p role="alert">{explanations[error]??error}</p>}{busy&&<p role="status">Verificando en servidor…</p>}
 {viewer&&<PdfViewer url={viewer.url} title={viewer.title} authority={viewer.context.epoch} returnFocus={viewer.focus} onClose={()=>close(viewer.context)} onDownload={()=>run(c=>show(c,viewer.identity,viewer.title,true))}/>}
 </section>
}
