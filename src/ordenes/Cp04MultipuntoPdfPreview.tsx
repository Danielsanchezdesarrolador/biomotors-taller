import {useEffect,useRef,useState} from 'react'
import {Download,Eye,FileText,X} from 'lucide-react'
import type {Finding,OrderWithVehicle,InspectionPdfIdentity} from './cp04Contracts'
import {hasCurrentProvisionalFindings} from './cp04Autosave'

/** CP04 document preview only. It never sends, stores, or marks a PDF as issued. */
export function Cp04MultipuntoPdfPreview({
 workshopName,order,findings,outstanding,incomplete,disabled,loadIdentity
}:{
 workshopName:string;order:OrderWithVehicle;findings:readonly Finding[]
 outstanding:number;incomplete:boolean;disabled:boolean
 loadIdentity?:(orderId:string)=>Promise<InspectionPdfIdentity>
}){
 const generation=useRef(0),cached=useRef<Uint8Array|null>(null)
 const [url,setUrl]=useState<string|null>(null)
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 const [display,setDisplay]=useState(false)
 const blocked=outstanding>0||incomplete||hasCurrentProvisionalFindings(findings)
 const reason=outstanding>0
   ?'Hay X que todavía no se han confirmado en el servidor.'
   :incomplete||hasCurrentProvisionalFindings(findings)
     ?'Completa las observaciones técnicas provisionales antes de preparar el documento.'
     :''
 useEffect(()=>()=>{if(url)URL.revokeObjectURL(url)},[url])
 // An existing preview is a point-in-time local export; invalidate it if
 // server-confirmed findings or the selected order change.
 useEffect(()=>{generation.current++;cached.current=null;setUrl(null);setDisplay(false);setError('');setBusy(false)
   return ()=>{generation.current++;cached.current=null}
 },[order,findings,workshopName,disabled,blocked])
 async function generate(download:boolean){
   if(busy||disabled)return
   if(blocked){setError(reason);return}
   const current=generation.current
   setBusy(true);setError('')
   try{
     const {browserMultipuntoPdf,downloadMultipuntoPdf}=await import('./cp04InspectionPdf')
     let bytes=cached.current
     if(!bytes){
       const identity=await loadIdentity?.(order.order.id)
       if(current!==generation.current)return
       bytes=await browserMultipuntoPdf({workshopName,order,findings,identity})
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
     :'No fue posible crear el PDF local. Comprueba tu conexión y vuelve a verificar tu acceso.')}
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
   {display&&url&&<div className="cp04-pdf-preview">
     <div className="cp04-pdf-preview-title">
       <strong>Vista previa del borrador · No enviado</strong>
       <button type="button" className="cp04-secondary" onClick={()=>setDisplay(false)}
         aria-label="Cerrar vista previa PDF"><X size={16}/> Cerrar</button>
     </div>
     <iframe src={url} title="Vista previa de la inspección multipunto en PDF" />
     <p>Si el dispositivo no muestra PDF integrados, selecciona «Descargar borrador» para abrirlo en tu lector.</p>
   </div>}
 </section>
}
