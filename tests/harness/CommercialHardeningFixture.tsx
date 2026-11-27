/** Isolated harness only. Uses real CP04 repository/view; all HTTP is loopback synthetic. */
import {createRoot} from 'react-dom/client'
import {useEffect,useMemo,useState} from 'react'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../../src/auth/controller'
import {cp04Repository} from '../../src/ordenes/cp04Repository'
import {finalArchiveRepository} from '../../src/expedientes/repository'
import {FinalArchivePanel} from '../../src/expedientes/FinalArchivePanel'
import {Cp04MultipuntoPdfPreview} from '../../src/ordenes/Cp04MultipuntoPdfPreview'
import {setDocumentAuthority} from '../../src/auth/documentAccess'
import {documentOperation,DocumentOperationExpired} from '../../src/documents/operation'
import '../../src/styles.css'
const uid='00000000-0000-4000-8000-000000000002',wid='00000000-0000-4000-8000-000000000001',oid='00000000-0000-4000-8000-000000000007',vid='00000000-0000-4000-8000-000000000006'
type State={workshopId:string;role:Context['role'];plan:string;phase:string}
const client={rpc:async(name:string,args:unknown)=>fetch('/hardening/rpc',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,args})}).then(r=>r.json()),auth:{getUser:async()=>fetch('/hardening/identity').then(r=>r.json())},from:(table:string)=>{const filters:Record<string,unknown>={};const q={select:()=>q,eq:(k:string,v:unknown)=>{filters[k]=v;return q},maybeSingle:async()=>fetch('/hardening/row?'+new URLSearchParams({table,filters:JSON.stringify(filters)})).then(r=>r.json())};return q},functions:{invoke:async(name:string,args:{body:unknown})=>{const r=await fetch('/hardening/document',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({endpoint:name,...args.body as object})});return r.ok?{data:await r.blob(),error:null}:{data:null,error:{context:r}}}}} as unknown as SupabaseClient
function Fixture(){
 const [view,setView]=useState(0)
 const [state,setState]=useState<State>({workshopId:wid,role:'owner',plan:'full',phase:'authorized'})
 const context=useMemo<Context>(()=>({userId:uid,workshop:{id:state.workshopId,name:'Taller sintético',status:'active'},role:state.role}),[state.workshopId,state.role])
 const repository=useMemo(()=>cp04Repository(client,context),[context]);useEffect(()=>()=>repository.dispose(),[repository])
 const archive=useMemo(()=>finalArchiveRepository(client,context),[context]);useEffect(()=>()=>archive.dispose(),[archive])
 const order=useMemo(()=>({presentationHint:view,order:{id:oid,workshop_id:state.workshopId,vehicle_id:vid,complaint:'Revisión sintética',status:'inspecting' as const,intake_odometer:120000,opened_by:uid,opened_at:'2026-11-27T12:00:00Z',closed_at:null,updated_at:'2026-11-27T12:00:00Z'},vehicle:{id:vid,workshop_id:state.workshopId,customer_id:'00000000-0000-4000-8000-000000000005',plate:'QA1234',plate_key:'QA1234',make:'Sintético',model:'Prueba',odometer_km:120000}}),[state.workshopId,view])
 useEffect(()=>{Object.assign(window,{hardening:{remount:()=>setView(v=>v+1),refresh:async()=>{const next=await fetch('/hardening/status').then(r=>r.json());setDocumentAuthority(JSON.stringify(next));setState(next)},expire:()=>{for(const key of Object.keys(sessionStorage))if(key.startsWith('bt:commercial-multipunto:')){try{const record=documentOperation(key);const previous=Date.now;Date.now=()=>record.at+300001;return ()=>{Date.now=previous}}catch(e){if(!(e instanceof DocumentOperationExpired))throw e}}throw Error('No operation to expire')}}})},[])
 return <main data-view={view} data-authority={JSON.stringify(state)} style={{padding:24}}><h1>Documento sintético · {state.plan}</h1>{location.search.includes('archive')?<FinalArchivePanel repository={archive} onBack={()=>{}}/>:<Cp04MultipuntoPdfPreview key={view} documentScope={uid+':'+state.workshopId} workshopName="Taller sintético" order={order} findings={[]} outstanding={0} incomplete={false} disabled={state.phase!=='authorized'||state.plan==='basic'} loadIdentity={repository.pdfIdentity} loadDocument={repository.inspectionDocument}/>}</main>
}
createRoot(document.getElementById('root')!).render(<Fixture/> )
