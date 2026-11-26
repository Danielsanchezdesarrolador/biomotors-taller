import {it,expect,vi} from 'vitest'
import type {SupabaseClient} from '@supabase/supabase-js'
import {documentHandlerCandidate} from '../../server/cp05/documentHandlerCandidate'
const wid='00000000-0000-4000-8000-000000000001',uid='00000000-0000-4000-8000-000000000002'
function fixture(access:unknown,error:unknown=null,role='owner'){
 const query=(table:string)=>{const data=table==='workshops'?{id:wid,status:'active'}:{workshop_id:wid,user_id:uid,status:'active',role};const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data,error:null})};return q}
 const rpc=vi.fn(async()=>({data:access,error})),trusted=vi.fn(()=>({rpc:async()=>({error:{code:'42501'}})} as unknown as SupabaseClient))
 const user={auth:{getUser:async()=>({data:{user:{id:uid,email_confirmed_at:'confirmed'}},error:null})},from:query,rpc} as unknown as SupabaseClient
 const handler=documentHandlerCandidate({archiveApproved:true,emailApproved:false,allowedOrigin:'https://example.invalid',pilotWorkshopId:'',serverWorkshopAccess:true},{userClient:()=>user,trustedClient:trusted,assets:async()=>({font:new Uint8Array(),logo:new Uint8Array()}),provider:vi.fn()})
 const call=(action='cancel')=>handler(new Request('https://example.invalid/doc',{method:'POST',headers:{authorization:'Bearer synthetic','content-type':'application/json'},body:JSON.stringify({action,workshopId:wid,quoteId:uid,requestId:uid})}))
 return {call,rpc,trusted}
}
it.each([null,{workshopId:'another',operationsEnabled:true},{workshopId:wid,operationsEnabled:false}])('does not create trusted ports for missing, wrong or disabled workshop capability',async access=>{
 const f=fixture(access);expect((await f.call()).status).toBe(503);expect(f.trusted).not.toHaveBeenCalled()
})
it('a valid server grant admits a non-QA workshop to existing operation guards',async()=>{
 const f=fixture({workshopId:wid,operationsEnabled:true,documentsEnabled:true});expect((await f.call()).status).toBe(409);expect(f.trusted).toHaveBeenCalledOnce();expect(f.rpc).toHaveBeenCalledWith('bt_plan04_operations_status',{p_workshop_id:wid})
})
it('RPC failure cannot authorize document issuance',async()=>{
 const f=fixture({workshopId:wid,operationsEnabled:true},{code:'42501'});expect((await f.call()).status).toBe(503);expect(f.trusted).not.toHaveBeenCalled()
})
it('mechanic role cannot issue documents even when workshop is enrolled',async()=>{
 const f=fixture({workshopId:wid,operationsEnabled:true},null,'mechanic');expect((await f.call()).status).toBe(403);expect(f.trusted).not.toHaveBeenCalled()
})
it('server enrollment never turns on automatic mail',async()=>{
 const f=fixture({workshopId:wid,operationsEnabled:true});expect((await f.call('send')).status).toBe(503);expect(f.trusted).not.toHaveBeenCalled()
})
