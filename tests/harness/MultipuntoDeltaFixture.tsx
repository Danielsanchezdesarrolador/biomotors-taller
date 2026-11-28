import {StrictMode,useEffect,useMemo,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {FunctionsClient} from '@supabase/functions-js'
import {MultipuntoDocuments} from '../../src/multipunto/MultipuntoDocuments'
import {multipuntoRepository} from '../../src/multipunto/repository'
import {invalidateDocuments,documentEpoch} from '../../src/auth/documentAccess'
import type {SupabaseClient} from '@supabase/supabase-js'
import '../../src/styles.css'
import '../../src/premium.css'
import '../../src/ordenes/cp04.css'
const wid='00000000-0000-4000-8000-000000000001',oid='00000000-0000-4000-8000-000000000002'
function App(){
 const [order,setOrder]=useState(oid),[scope,setScope]=useState('synthetic:owner'),[mounted,setMounted]=useState(true),[note,setNote]=useState('Borrador del formulario')
 const port=useMemo(()=>{const base=multipuntoRepository({functions:new FunctionsClient(location.origin+'/synthetic-mp',{headers:{authorization:'Bearer synthetic'}})} as unknown as SupabaseClient,wid,()=>{});const done=(action:string)=>{const w=window as Window&{multipuntoDeltaCompleted?:string[]};(w.multipuntoDeltaCompleted??=[]).push(action)};return {...base,call:async<T,>(action:string,args:Record<string,unknown>,current?:()=>boolean)=>{try{return await base.call<T>(action,args,current)}finally{done(action)}},info:async(id:string,current?:()=>boolean)=>{try{return await base.info(id,current)}finally{done('info')}},read:async(...args:Parameters<typeof base.read>)=>{try{return await base.read(...args)}finally{done('read')}}}},[])
 useEffect(()=>{const control={epoch:documentEpoch,order:setOrder,authority:()=>{invalidateDocuments();setScope(s=>s+':next')},mount:setMounted};(window as Window&{multipuntoDelta?:typeof control}).multipuntoDelta=control;return()=>{delete (window as Window&{multipuntoDelta?:typeof control}).multipuntoDelta}},[])
 return <main className="cp04-private" style={{padding:16,maxWidth:1100,margin:'auto'}}><h1>Multipunto · Regresión sintética</h1><p data-current-order>{order}</p><label>Notas locales<input value={note} onChange={e=>setNote(e.target.value)}/></label>{mounted&&<details open><summary>Documentos</summary><MultipuntoDocuments port={port} orderId={order} scope={scope} blocked={false}/></details>}</main>
}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>)
