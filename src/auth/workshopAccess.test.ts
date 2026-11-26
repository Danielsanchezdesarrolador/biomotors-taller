import {it,expect,vi} from 'vitest'
import type {SupabaseClient} from '@supabase/supabase-js'
import {AuthController,type AuthGateway} from './controller'
import {supabaseGateway} from './supabaseGateway'
import {canOpen} from '../guided/progress'
const wid='00000000-0000-4000-8000-000000000001'
function fixture(){
 let allowed=true
 const gateway:AuthGateway={hasSession:async()=>true,getUser:async()=>({id:'actor',confirmed:true}),signIn:async()=>{},signOut:async()=>{},subscribe:()=>()=>{},memberships:async()=>[{user_id:'actor',workshop_id:wid,role:'owner',status:'active'}],workshops:async()=>[{id:wid,name:'Synthetic',status:'active'}],workshopAccess:async()=>({operationsEnabled:allowed,documentsEnabled:allowed})}
 return {gateway,controller:new AuthController(gateway),revoke:()=>{allowed=false}}
}
it('binds a new non-QA workshop to server capability and invalidates authority after revocation',async()=>{
 const f=fixture();await f.controller.validate();const before=f.controller.getSnapshot();expect(canOpen(before.context!)).toBe(true)
 f.revoke();await f.controller.validate();const after=f.controller.getSnapshot();expect(canOpen(after.context!)).toBe(false);expect(after.authorityVersion).not.toBe(before.authorityVersion)
})
it('discards a late capability response after logout',async()=>{
 const f=fixture();let resolve!:(v:{operationsEnabled:boolean;documentsEnabled:boolean})=>void
 const pending=new Promise<{operationsEnabled:boolean;documentsEnabled:boolean}>(r=>resolve=r)
 const started=vi.fn(()=>pending);f.gateway.workshopAccess=started
 const check=f.controller.validate();await vi.waitFor(()=>expect(started).toHaveBeenCalled());await f.controller.logout()
 resolve({operationsEnabled:true,documentsEnabled:true});await check;expect(f.controller.getSnapshot().phase).toBe('anonymous');expect(f.controller.getSnapshot().context).toBeUndefined()
})
it('missing gateway capability grants no operations even for the old QA UUID',async()=>{
 const f=fixture();delete f.gateway.workshopAccess;await f.controller.validate();expect(canOpen(f.controller.getSnapshot().context!)).toBe(false)
})
it.each([
 {data:null,error:{code:'42501'}},
 {data:{workshopId:'another',operationsEnabled:true,documentsEnabled:true},error:null},
 {data:{workshopId:wid,operationsEnabled:'true',documentsEnabled:1},error:null}
])('RPC errors, scope mismatch and nonboolean flags fail closed',async response=>{
 const rpc=vi.fn(async()=>response),gateway=supabaseGateway({rpc} as unknown as SupabaseClient)
 expect(await gateway.workshopAccess!(wid)).toEqual({operationsEnabled:false,documentsEnabled:false});expect(rpc).toHaveBeenCalledWith('bt_plan04_operations_status',{p_workshop_id:wid})
})
it('gateway returns only capabilities for the requested server workshop',async()=>{
 const gateway=supabaseGateway({rpc:async()=>({data:{workshopId:wid,operationsEnabled:true,documentsEnabled:true},error:null})} as unknown as SupabaseClient)
 expect(await gateway.workshopAccess!(wid)).toEqual({operationsEnabled:true,documentsEnabled:true})
})
