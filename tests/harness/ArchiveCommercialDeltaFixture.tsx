/** Only isolated loopback tests: real repository and panel, HTTP errors instead of thrown handler exceptions. */
import {createRoot} from 'react-dom/client'
import {useEffect,useState} from 'react'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../../src/auth/controller'
import {finalArchiveRepository} from '../../src/expedientes/repository'
import {FinalArchivePanel} from '../../src/expedientes/FinalArchivePanel'
import '../../src/styles.css'
const context:Context={userId:'00000000-0000-4000-8000-000000000007',role:'owner',workshop:{id:'00000000-0000-4000-8000-000000000001',name:'Taller sintético',status:'active'}}
const client={auth:{getUser:async()=>fetch('/archive-delta/identity').then(r=>r.json())},rpc:async(name:string,args:unknown)=>fetch('/archive-delta/rpc',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,args})}).then(r=>r.json()),functions:{invoke:async(endpoint:string,args:{body:unknown})=>{const r=await fetch('/archive-delta/document',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({endpoint,...args.body as object})});return r.ok?{data:await r.blob(),error:null}:{data:null,error:{context:r}}}}} as unknown as SupabaseClient
const repository=finalArchiveRepository(client,context)
function Fixture(){
 const [filtered,setFiltered]=useState(false)
 // A parent filter change starts a real catalog revalidation while an earlier document is in flight.
 useEffect(()=>{Object.assign(window,{archiveDelta:{ready:()=>true,revalidate:()=>setFiltered(true)}})},[])
 return <main style={{padding:16}}><FinalArchivePanel repository={repository} vehicleId={filtered?'00000000-0000-4000-8000-000000000003':undefined} onBack={()=>{}}/></main>
}
createRoot(document.getElementById('root')!).render(<Fixture/> )
