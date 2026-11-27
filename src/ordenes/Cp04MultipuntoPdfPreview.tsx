import {useEffect,useRef,useState} from 'react'
import {Download,Eye,FileText,X} from 'lucide-react'
import type {Finding,OrderWithVehicle,InspectionPdfIdentity} from './cp04Contracts'
import {hasCurrentProvisionalFindings} from './cp04Autosave'

/** Server-authorized preview with shared quota/retry identity; never issues or emails a document. */
export function Cp04MultipuntoPdfPreview({
 workshopName,order,findings,outstanding,incomplete,disabled,loadIdentity,loadDocument
}:{
 workshopName:string;order:OrderWithVehicle;findings:readonly Finding[]
 outstanding:number;incomplete:boolean;disabled:boolean
 loadIdentity?:(orderId:string)=>Promise<InspectionPdfIdentity>
 loadDocument?:(orderId:string,requestId:string)=>Promise<Uint8Array>
}){
 const operation=useRef(crypto.randomUUID())
 const dialog=useRef<HTMLDialogElement>(null)
 const generation=useRef(0),cached=useRef<Uint8Array|null>(null)
 const [url,setUrl]=useState<string|null>(null)
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 const [display,setDisplay]=useState(false)
 useEffect(()=>{if(display&&url&&dialog.current&&!dialog.current.open)dialog.current.showModal()},[display,url])
 const blocked=outstanding>0||incomplete||hasCurrentProvisionalFindings(findings)
 const reason=outstanding>0
   ?'Hay X que todavía no se han confirmado en el servidor.'
   :incomplete||hasCurrentProvisionalFindings(findings)
     ?'Completa las observaciones técnicas provisionales antes de preparar el documento.'
     :''
 useEffect(()=>()=>{if(url)URL.revokeObjectURL(url)},[url])
 // An existing preview is a point-in-time local export; invalidate it if
 // server-confirmed findings or the selected order change.
 useEffect(()=>{generation.current++;operation.current=crypto.randomUUID();cached.current=null;setUrl(null);setDisplay(false);setError('');setBusy(false)
   return ()=>{generation.current++;cached.current=null}
 },[order,findings,workshopName,disabled,blocked])
 async function generate(download:boolean){
   if(busy||disabled)return
   if(blocked){setError(reason);return}
   const current=generation.current
   setBusy(true);setError('')
   try{
     const downloadMultipuntoPdf=(bytes:Uint8Array,name:string)=>{const u=URL.createObjectURL(new Blob([bytes.slice().buffer],{type:'application/pdf'}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000)}
     let bytes=cached.current
     if(!bytes){
       await loadIdentity?.(order.order.id)
       if(!loadDocument)throw Error('OFFICIAL_DOCUMENT_SERVICE_REQUIRED')
       if(current!==generation.current)return
       bytes=await loadDocument(order.order.id,operation.current)
       if(current!==generation.current)return
       cached.current=bytes
     }
     if(download){
       const plate=(order.vehicle.plate||'sin-patente').replace(/[^a-z0-9-]/gi,'')
       downloadMultipuntoPdf(bytes,'INS-'+plate+'-'+order.order.id.slice(0,8)+'-borrador.pdf')
     }else{
       const next=URL.createObjectURL(new Blob([bytes.slice().buffer],{type:'application/pdf'}))
       setUrl(next);setDisplay(true)
     }
   }catch(error){if(current===generation.current)setError(error instanceof Error&&error.message==='MULTIPUNTO_PDF_FIELD_TOO_LONG'
     ?'Un dato de identificación excede el espacio legible de una hoja A4. Revisa el expediente; no se creó un PDF incompleto.'
     :'No se pudo autorizar el documento. Revisa el plan, la cuota disponible, tu sesión y los permisos del taller.')}
   finally{if(current===generation.current)setBusy(false)}
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
   {display&&url&&<dialog ref={dialog} className="bt-inspection-dialog" aria-label="Vista previa del borrador · No enviado" onCancel={()=>setDisplay(false)} onClick={e=>{if(e.target===e.currentTarget)setDisplay(false)}}>
     <div className="cp04-pdf-preview-title">
       <strong>Vista previa del borrador · No enviado</strong>
       <button type="button" className="cp04-secondary" onClick={()=>setDisplay(false)}
         aria-label="Cerrar vista previa PDF"><X size={16}/> Cerrar</button>
     </div>
     <iframe src={url+'#view=FitH'} title="Vista previa de la inspección multipunto en PDF" />
     <p>Si el dispositivo no muestra PDF integrados, selecciona «Descargar borrador» para abrirlo en tu lector.</p>
   </dialog>}
 </section>
}
