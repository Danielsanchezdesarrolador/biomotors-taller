import type {SupabaseClient} from '@supabase/supabase-js'
import type {MPInfo,MPJob,MPStatus} from '../../server/multipunto/protocol'
import {documentFence,invalidateDocuments} from '../auth/documentAccess'
export type MultipuntoPort={call:<T>(action:string,args:Record<string,unknown>,current?:()=>boolean)=>Promise<T>;info:(orderId:string,current?:()=>boolean)=>Promise<MPInfo>;read:(orderId:string,identity:{documentId:string}|{jobId:string},current?:()=>boolean)=>Promise<Uint8Array>}
/** No PDF cache. Every new action goes through current JWT and server authority. */
export function multipuntoRepository(client:SupabaseClient,workshopId:string,valid:()=>void):MultipuntoPort{
 async function call<T>(action:string,args:Record<string,unknown>,current?:()=>boolean):Promise<T>{
  const fence=documentFence();const check=()=>{if(current&&!current())throw Error('MP_CONTEXT_CHANGED');valid();fence.assert()};check()
  const r=await client.functions.invoke('bt-multipunto-documents',{body:{...args,version:2,action,workshopId}})
  check()
  if(r.error){let code='MP_SERVICE_UNAVAILABLE';try{code=(await (r.error.context as Response).clone().json()).error??code}catch{ /* no bytes fallback */ }
   check();if(/SESSION|DENIED|PLAN_REQUIRED|GATE_CLOSED/.test(code))invalidateDocuments()
   throw new Error(code)
  }
  return r.data as T
 }
 return {call,info:(orderId,current)=>call('info',{orderId},current),read:async(orderId,identity,current)=>{const fence=documentFence();const r=await call<Blob>('read',{orderId,...identity},current);if(!(r instanceof Blob))throw Error('MP_INTEGRITY_ERROR');const bytes=new Uint8Array(await r.arrayBuffer());if(current&&!current())throw Error('MP_CONTEXT_CHANGED');valid();fence.assert();if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('MP_INTEGRITY_ERROR');return bytes}}
}
export type {MPInfo,MPJob,MPStatus}
