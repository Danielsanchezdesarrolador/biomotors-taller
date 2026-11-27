import {it,expect,vi} from 'vitest'
import type {SupabaseClient} from '@supabase/supabase-js'
import {CommercialFailure} from '../plans/commercialErrors'
import {CommercialOperationNotCurrent} from '../../server/commercial/meteredDocument'
import {commercialDocumentHandler} from '../../server/commercial/documentHandler'
import {finalArchiveHandler} from '../../server/com/finalArchiveHandler'
import {documentHandlerCandidate} from '../../server/cp05/documentHandlerCandidate'
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),wid=id(1),origin='https://synthetic.invalid'
// HTTP catch/serialization regression only: SQL seat/quota authority is tested separately in PostgreSQL.
it.each(['commercial','final','cp05'] as const)('%s serializes only safe known denial reasons and preserves explicit-renewal 409',async route=>{
 for(const [error,code,status] of [[new CommercialFailure('quota'),'COMMERCIAL_QUOTA_EXHAUSTED',429],[new CommercialFailure('plan'),'PLAN_CAPABILITY_REQUIRED',403],[new CommercialFailure('session'),'SESSION_INVALID',401],[new CommercialOperationNotCurrent(),'DOCUMENT_OPERATION_NOT_CURRENT',409]] as const){
  const user={auth:{getUser:async()=>{throw error}}} as unknown as SupabaseClient,assets=vi.fn(),provider=vi.fn(),trusted=vi.fn(()=>({} as SupabaseClient))
  const handler=route==='commercial'?commercialDocumentHandler({user:()=>user,trusted,assets},origin):route==='final'?finalArchiveHandler({read:true,write:false,origin},{userClient:()=>user,trustedClient:trusted,assets}):documentHandlerCandidate({archiveApproved:true,emailApproved:false,allowedOrigin:origin,pilotWorkshopId:wid},{userClient:()=>user,trustedClient:trusted,assets,provider})
  const response=await handler(new Request(origin,{method:'POST',headers:{origin,authorization:'Bearer synthetic','content-type':'application/json'},body:JSON.stringify(route==='commercial'?{action:'multipunto',workshopId:wid,orderId:id(2),requestId:id(3)}:route==='final'?{action:'download',workshopId:wid,revisionId:id(2),kind:'quote',requestId:id(3)}:{action:'download',workshopId:wid,revisionId:id(2),requestId:id(3)})}))
  expect(response.status).toBe(status);expect(await response.json()).toEqual({error:code});expect(response.headers.get('Cache-Control')).toBe('no-store');expect(assets).not.toHaveBeenCalled();expect(provider).not.toHaveBeenCalled()
 }
})
