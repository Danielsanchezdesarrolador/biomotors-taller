import {StrictMode,useMemo,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {MultipuntoDocuments} from '../../src/multipunto/MultipuntoDocuments'
import {multipuntoRepository} from '../../src/multipunto/repository'
import {invalidateDocuments} from '../../src/auth/documentAccess'
import type {SupabaseClient} from '@supabase/supabase-js'
import '../../src/styles.css'
import '../../src/premium.css'
import '../../src/ordenes/cp04.css'
import '../../src/ordenes/ordersWorkspace.css'
const wid='00000000-0000-4000-8000-000000000001',oid='00000000-0000-4000-8000-000000000002'
function App(){const [note,setNote]=useState('Borrador técnico conservado'),[epoch,setEpoch]=useState(0)
const port=useMemo(()=>multipuntoRepository({functions:{invoke:async(_name:string,{body}:{body:unknown})=>{const response=await fetch('/synthetic-mp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!response.ok)return {data:null,error:{context:response}};return {data:response.headers.get('content-type')==='application/pdf'?await response.blob():await response.json(),error:null}}}} as unknown as SupabaseClient,wid,()=>{}),[])
return <main className="cp04-private" style={{padding:16,maxWidth:1100,margin:'auto'}}><h1>Órdenes · Fixture sintético</h1><label>Notas locales<input value={note} onChange={e=>setNote(e.target.value)}/></label><button onClick={()=>{invalidateDocuments();setEpoch(epoch+1)}}>Cambiar autoridad</button><details open><summary>Documentos</summary><MultipuntoDocuments port={port} orderId={oid} scope={'synthetic:'+epoch} blocked={false}/></details></main>}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>)
