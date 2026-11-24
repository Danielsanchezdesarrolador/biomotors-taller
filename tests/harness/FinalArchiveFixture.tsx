/** Test-only SDK bridge to real candidate SQL and local immutable object files. */
import {useEffect,useState} from 'react'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../../src/auth/controller'
import {finalArchiveRepository} from '../../src/expedientes/repository'
import {FinalArchivePanel} from '../../src/expedientes/FinalArchivePanel'
import '../../src/official/official.css'
const context={userId:'00000000-0000-4000-8000-000000000007',role:'owner',workshop:{id:'00000000-0000-4000-8000-000000000001',name:'Taller ficticio',status:'active'}} as Context
const client={auth:{getUser:async()=>({data:{user:{id:context.userId,email_confirmed_at:'2026-11-24'}},error:null})},
 rpc:async(name:string,args:unknown)=>(await fetch('http://127.0.0.1:47125/rpc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,args})})).json(),
 functions:{invoke:async(_name:string,{body}:{body:unknown})=>{const response=await fetch('http://127.0.0.1:47125/function',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  if(!response.ok)return {data:null,error:{context:response}}
  return {data:response.headers.get('content-type')?.includes('application/pdf')?await response.blob():await response.json(),error:null}
 }}} as unknown as SupabaseClient
export default function FinalArchiveFixture(){const [repository,setRepository]=useState<ReturnType<typeof finalArchiveRepository>|null>(null)
 useEffect(()=>{const r=finalArchiveRepository(client,context);setRepository(r);return()=>r.dispose()},[])
 return <main style={{padding:20}}>{repository&&<FinalArchivePanel repository={repository} onBack={()=>{}}/>}</main>
}
