import {useEffect,useRef,useState,useSyncExternalStore,useId} from 'react'
import {Maximize,Minimize,Minus,Plus,Download,X} from 'lucide-react'
import {documentEpoch,subscribeDocuments} from '../auth/documentAccess'
import './pdfViewer.css'
/** Displays only a current, caller-managed Blob URL. Zoom never fetches or changes PDF bytes. */
export function PdfViewer({url,title,authority,onClose,onDownload,className='',closeLabel='Cerrar vista previa',returnFocus,frameTitle=title}:{url:string;title:string;authority:number;onClose:()=>void;onDownload:()=>Promise<void>;className?:string;closeLabel?:string;returnFocus?:HTMLElement|null;frameTitle?:string}){
 const current=useSyncExternalStore(subscribeDocuments,documentEpoch,documentEpoch),dialog=useRef<HTMLDialogElement>(null),close=useRef(onClose),heading=useId()
 close.current=onClose
 const [zoom,setZoom]=useState(100),[expanded,setExpanded]=useState(false),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false),[busy,setBusy]=useState(false)
 const valid=current===authority&&url.startsWith('blob:')
 useEffect(()=>{if(!valid){close.current();return}const node=dialog.current;if(!node)return
  const previous=returnFocus??document.activeElement as HTMLElement|null
  if(typeof node.showModal==='function')node.showModal();else node.setAttribute('open','')
  node.querySelector<HTMLButtonElement>('[data-pdf-close]')?.focus()
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close.current()}if(e.key==='Tab'){const items=Array.from(node.querySelectorAll<HTMLElement>('button:not(:disabled),iframe'));const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}}
  node.addEventListener('keydown',key)
  return()=>{node.removeEventListener('keydown',key);const restore=()=>{if(previous?.isConnected&&!previous.closest('[hidden],[inert]'))previous.focus()};const full=document.fullscreenElement===node;node.close?.();if(full)void document.exitFullscreen().catch(()=>{}).finally(restore);else restore()}
 },[valid])
 if(!valid)return null
 async function enlarge(){if(document.fullscreenElement===dialog.current){await document.exitFullscreen();setExpanded(false);return}if(expanded){setExpanded(false);return}try{await dialog.current?.requestFullscreen();setExpanded(true)}catch{setExpanded(true)}}
 // A cleanup close event may arrive after StrictMode has reopened this same dialog.
 // Ignore only that stale event; a genuinely closed dialog still notifies its owner.
 return <dialog ref={dialog} className={'bt-pdf-viewer '+className+(expanded?' is-expanded':'')} aria-labelledby={heading} onCancel={e=>{e.preventDefault();onClose()}} onClose={e=>{if(!e.currentTarget.open)onClose()}}>
  <header><div><span>ByteTorque · Documento autorizado</span><h2 id={heading}>{title}</h2></div><button type="button" data-pdf-close onClick={onClose} aria-label={closeLabel}><X size={18}/>Cerrar vista previa</button></header>
  <nav aria-label="Controles del visor PDF"><button type="button" aria-label="Alejar PDF" disabled={zoom<=50} onClick={()=>setZoom(z=>Math.max(50,z-25))}><Minus size={17}/></button><output aria-label="Zoom PDF">{zoom}%</output><button type="button" aria-label="Acercar PDF" disabled={zoom>=200} onClick={()=>setZoom(z=>Math.min(200,z+25))}><Plus size={17}/></button><button type="button" onClick={()=>setZoom(100)}>Ajustar al ancho</button><button type="button" onClick={()=>void enlarge()}>{expanded?<Minimize size={17}/>:<Maximize size={17}/>}Ampliar visor</button><button type="button" disabled={busy} onClick={()=>{setBusy(true);void onDownload().catch(()=>setFailed(true)).finally(()=>setBusy(false))}}><Download size={17}/>{busy?'Verificando autorización…':'Descargar PDF autorizado'}</button></nav>
  {loading&&!failed&&<p role="status">Cargando documento…</p>}{failed&&<p role="alert">El navegador no pudo mostrar el PDF. Usa la descarga autorizada para abrirlo en tu lector.</p>}
  <div className="bt-pdf-canvas"><iframe title={frameTitle} src={url} style={{width:'100%',height:'100%',transform:'scale('+zoom/100+')',transformOrigin:'top left'}} referrerPolicy="no-referrer" onLoad={()=>setLoading(false)} onError={()=>{setLoading(false);setFailed(true)}}/></div>
  <footer><button type="button" onClick={()=>{setLoading(false);setFailed(true)}}>No veo el PDF</button> Si no ves el documento, usa «Descargar PDF autorizado». Se verificará tu acceso antes de descargar. El zoom no altera el PDF A4.</footer>
 </dialog>
}
