import {documentFence,documentEpoch,subscribeDocuments,documentURL,revokeDocumentURL} from '../auth/documentAccess'
import {documentOperation,assertDocumentOperation,DocumentOperationExpired} from '../documents/operation'
import {DocumentOperationNotice} from '../documents/DocumentOperationNotice'
import {useEffect,useLayoutEffect,useRef,useState,useSyncExternalStore} from 'react'
import {Download,Eye,FileText,X} from 'lucide-react'
import type {Finding,OrderWithVehicle,InspectionPdfIdentity} from './cp04Contracts'
import {hasCurrentProvisionalFindings} from './cp04Autosave'

/** Server-authorized preview with shared quota/retry identity; never issues or emails a document. */
export function Cp04MultipuntoPdfPreview({
 workshopName,order,findings,outstanding,incomplete,disabled,loadIdentity,loadDocument,documentScope
}:{
 documentScope:string;workshopName:string;order:OrderWithVehicle;findings:readonly Finding[]
 outstanding:number;incomplete:boolean;disabled:boolean
 loadIdentity?:(orderId:string)=>Promise<InspectionPdfIdentity>
 loadDocument?:(orderId:string,requestId:string)=>Promise<Uint8Array>
}){
 const authority=useSyncExternalStore(subscribeDocuments,documentEpoch,documentEpoch)
 const dialog=useRef<HTMLDialogElement>(null),generation=useRef(0),locked=useRef(false),currentURL=useRef<string|null>(null)
 const [url,setUrl]=useState<{value:string;authority:number;expiresAt:number;key:string}|null>(null)
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[display,setDisplay]=useState(false),[expired,setExpired]=useState<DocumentOperationExpired|null>(null)
 const blocked=outstanding>0||incomplete||hasCurrentProvisionalFindings(findings)
 const reason=outstanding>0?'Hay X que todavía no se han confirmado en el servidor.':incomplete||hasCurrentProvisionalFindings(findings)?'Completa las observaciones técnicas provisionales antes de preparar el documento.':''
 const snapshot=JSON.stringify([order,[...findings].sort((a,b)=>a.id.localeCompare(b.id)),workshopName])
 function closePreview(){if(currentURL.current)revokeDocumentURL(currentURL.current);currentURL.current=null;setUrl(null);setDisplay(false)}
 useLayoutEffect(()=>{generation.current++;locked.current=false;closePreview();setBusy(false);setError('');setExpired(null)
  return()=>{generation.current++;if(currentURL.current)revokeDocumentURL(currentURL.current);currentURL.current=null}
 },[snapshot,disabled,blocked,documentScope,authority])
 useEffect(()=>{if(display&&url&&url.authority===authority&&dialog.current&&!dialog.current.open)dialog.current.showModal()},[display,url,authority])
 useEffect(()=>{if(!url)return;const seq=generation.current;const timer=setTimeout(()=>{if(seq===generation.current){closePreview();setError('El visor se cerró por inactividad. Solicita de nuevo el documento para revalidar su autorización.')}},Math.max(0,url.expiresAt-Date.now()));return()=>clearTimeout(timer)},[url])
 async function generate(download:boolean){
  if(locked.current||disabled)return
  if(blocked){setError(reason);return}
  const current=generation.current,fence=documentFence(),valid=()=>current===generation.current&&fence.current()
  let operationKey=''
  locked.current=true;setBusy(true);setError('');setExpired(null)
  try{
   await loadIdentity?.(order.order.id)
   if(!valid())return
   if(!loadDocument)throw Error('OFFICIAL_DOCUMENT_SERVICE_REQUIRED')
   const key='bt:commercial-multipunto:'+documentScope+':'+order.order.id;operationKey=key;const operation=documentOperation(key)
   // Every action reaches the server, including preview -> download and repeated previews.
   const bytes=await loadDocument(order.order.id,operation.id)
   if(!valid())return
   assertDocumentOperation(key,operation.id)
   closePreview()
   const next=documentURL(bytes)
   if(download){const plate=(order.vehicle.plate||'sin-patente').replace(/[^a-z0-9-]/gi,'');const a=document.createElement('a');a.href=next;a.download='INS-'+plate+'-'+order.order.id.slice(0,8)+'-borrador.pdf';a.click();setTimeout(()=>revokeDocumentURL(next),1500)}
   else{currentURL.current=next;setUrl({value:next,authority,expiresAt:Date.now()+300000,key});setDisplay(true)}
  }catch(e){if(valid()){closePreview();if(e instanceof DocumentOperationExpired)setExpired(e.operationKey?e:new DocumentOperationExpired(operationKey,'invalidated'));else setError(e instanceof Error&&e.message==='MULTIPUNTO_PDF_FIELD_TOO_LONG'?'Un dato de identificación excede el espacio legible de una hoja A4. Revisa el expediente; no se creó un PDF incompleto.':'No se pudo autorizar el documento. Revisa el plan, la cuota disponible, tu sesión y los permisos del taller.')}}
  finally{if(current===generation.current){locked.current=false;setBusy(false)}}
 }
 return <section className="cp04-pdf-controls" aria-label="Informe PDF de inspección multipunto">
   <div className="cp04-pdf-intro">
     <FileText size={20} aria-hidden="true"/>
     <div><strong>Informe técnico multipunto · PDF</strong>
       <p>Resumen A4 de una página con 34 componentes y sus estados confirmados. Observaciones completas en el expediente. Solo borrador: no se envía ni se archiva.</p>
     </div>
   </div>
   <div className="cp04-pdf-actions">
     <button type="button" className="cp04-secondary" disabled={busy||disabled||blocked}
       onClick={()=>void generate(false)}><Eye size={16}/> {busy?'Preparando PDF…':'Vista previa PDF'}</button>
     <button type="button" className="cp04-secondary" disabled={busy||disabled||blocked}
       onClick={()=>void generate(true)}><Download size={16}/> Descargar borrador</button>
   </div>
   {blocked&&<p className="cp04-pdf-hint" role="status">{reason} El PDF solo se prepara con datos confirmados.</p>}
   {error&&<p className="cp04-error" role="alert">{error}</p>}
   <DocumentOperationNotice error={expired} onRestart={()=>{setExpired(null);setError('Nueva operación preparada. Solicita el documento para revalidar con el servidor.')}}/>
   {display&&url&&url.authority===authority&&<dialog ref={dialog} className="bt-inspection-dialog" aria-label="Vista previa del borrador · No enviado" onCancel={closePreview} onClick={e=>{if(e.target===e.currentTarget)closePreview()}}>
     <div className="cp04-pdf-preview-title">
       <strong>Vista previa del borrador · No enviado</strong>
       <button type="button" className="cp04-secondary" onClick={closePreview}
         aria-label="Cerrar vista previa PDF"><X size={16}/> Cerrar</button>
     </div>
     <iframe src={url.value+'#view=FitH'} title="Vista previa de la inspección multipunto en PDF" />
     <p>Si el dispositivo no muestra PDF integrados, selecciona «Descargar borrador» para abrirlo en tu lector.</p>
   </dialog>}
 </section>
}
