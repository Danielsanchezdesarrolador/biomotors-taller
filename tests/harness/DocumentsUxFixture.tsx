import {createRoot} from 'react-dom/client'
import {StrictMode,useEffect,useMemo,useState} from 'react'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../../src/auth/controller'
import {FinalArchivePanel} from '../../src/expedientes/FinalArchivePanel'
import {finalArchiveRepository} from '../../src/expedientes/repository'
import {Cp04MultipuntoPdfPreview} from '../../src/ordenes/Cp04MultipuntoPdfPreview'
import {setDocumentAuthority} from '../../src/auth/documentAccess'
import '../../src/styles.css'
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0')
const client={auth:{getUser:()=>fetch('/documents-ux/identity').then(r=>r.json())},rpc:(name:string,args:unknown)=>fetch('/documents-ux/rpc',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,args})}).then(r=>r.json()),functions:{invoke:async(endpoint:string,args:{body:unknown})=>{const response=await fetch('/documents-ux/document',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({endpoint,...args.body as object})});return response.ok?{data:await response.blob(),error:null}:{data:null,error:{context:response}}}}} as unknown as SupabaseClient
function Fixture(){const [state,setState]=useState({plan:'full',workshopId:id(1),role:'owner',session:'valid'})
 const context=useMemo<Context>(()=>({userId:id(7),role:state.role as Context['role'],workshop:{id:state.workshopId,name:'Taller sintético',status:'active'}}),[state.workshopId,state.role])
 const repository=useMemo(()=>finalArchiveRepository(client,context),[context]);useEffect(()=>()=>repository.dispose(),[repository])
 useEffect(()=>{Object.assign(window,{documentsUx:{refresh:async()=>{const next=await fetch('/documents-ux/status').then(r=>r.json());setDocumentAuthority(JSON.stringify(next));setState(next)}}})},[])
 const order={order:{id:id(4),workshop_id:state.workshopId,vehicle_id:id(3),status:'ready' as const,complaint:'Inspección sintética',intake_odometer:120000,opened_by:id(7),opened_at:'2026-11-27T12:00:00Z',closed_at:null,updated_at:'2026-11-27T12:00:00Z'},vehicle:{id:id(3),workshop_id:state.workshopId,customer_id:id(2),plate:'QA1234',plate_key:'QA1234',make:'Sintético',model:'Prueba',odometer_km:120000}}
 return <main style={{padding:16}} data-authority={JSON.stringify(state)}><h1>ByteTorque · Documentos ficticios</h1>{location.search.includes('inspection')?<Cp04MultipuntoPdfPreview documentScope={id(7)+':'+state.workshopId} workshopName="Taller sintético" order={order} findings={[]} outstanding={0} incomplete={false} disabled={state.plan==='basic'||state.session!=='valid'} loadIdentity={async()=>({workshop_id:state.workshopId,order_id:id(4),vehicle_id:id(3),customer_id:id(2),ownerName:'Cliente ficticio',modelYear:2020})} loadDocument={async(orderId,requestId)=>{const r=await client.functions.invoke('bt-commercial-documents',{body:{action:'multipunto',workshopId:state.workshopId,orderId,requestId}});if(r.error)throw Error('DENIED');return new Uint8Array(await (r.data as Blob).arrayBuffer())}}/>:<FinalArchivePanel repository={repository} onBack={()=>{}}/>}</main>
}
// Keep historical fixtures unchanged; reproduce the real app's dev StrictMode lifecycle explicitly.
const fixture=<Fixture/>
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).has('strict-viewer')?<StrictMode>{fixture}</StrictMode>:fixture)
