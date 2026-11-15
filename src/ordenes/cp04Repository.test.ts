import { describe,expect,it,vi } from 'vitest'
import { cp04Repository } from './cp04Repository'
import { WorkOrderFailure } from './cp04Contracts'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const ctx:Context={userId:a,role:'owner',workshop:{id:b,name:'Synthetic B',status:'active'}}
type State={rows:Record<string,unknown>[],fail?:string}
function fake(role='owner'){
  const reads:Record<string,State>={
    workshop_memberships:{rows:[{user_id:a,workshop_id:b,status:'active',role}]},
    workshops:{rows:[{id:b,status:'active'}]},
    vehicles:{rows:[]},work_orders:{rows:[]},inspection_findings:{rows:[]}
  }
  const touched:string[]=[]
  function from(table:string){
    touched.push(table)
    const chain={
      select:()=>chain,eq:()=>chain,is:()=>chain,order:()=>chain,limit:()=>chain,
      in:()=>chain,neq:()=>chain,insert:()=>chain,update:()=>chain,
      maybeSingle:async()=>({data:reads[table]?.rows[0]??null,error:null}),
      single:async()=>({data:reads[table]?.rows[0]??null,error:null}),
      then:(fn:(v:{data:unknown[],error:null})=>unknown)=>Promise.resolve(fn({
        data:reads[table]?.rows??[],error:null}))
    }
    return chain
  }
  const client={auth:{getUser:vi.fn(async()=>({data:{user:{id:a,email_confirmed_at:'2026-01-01'}},error:null}))},from:vi.fn(from)}
  return {client:client as unknown as SupabaseClient,reads,touched}
}
describe('CP04 private data repository and lifecycle',()=>{
  it('refuses invalid tenant identity or any operation after dispose',async()=>{
    const {client}=fake()
    expect(()=>cp04Repository(client,{...ctx,userId:'non-uuid'})).toThrow(WorkOrderFailure)
    const r=cp04Repository(client,ctx)
    r.dispose()
    await expect(r.recentOrders()).rejects.toMatchObject({kind:'denied'})
  })
  it('confirms membership + workshop every time, not a visual role switch',async()=>{
    const {client,reads}=fake('mechanic')
    const r=cp04Repository(client,ctx)
    await expect(r.createOrder({vehicle_id:a,complaint:'Ruido',intake_odometer:null}))
      .rejects.toMatchObject({kind:'denied'})
    reads.workshop_memberships.rows[0]={user_id:a,workshop_id:b,status:'active',role:'owner'}
    await expect(r.recentOrders()).resolves.toEqual([])
    expect(client.auth.getUser).toHaveBeenCalledTimes(2)
    reads.workshops.rows[0]={id:b,status:'suspended'}
    await expect(r.recentOrders()).rejects.toMatchObject({kind:'denied'})
  })
  it('denies switched identity, no data reads after revoked membership',async()=>{
    const {client,reads}=fake()
    const r=cp04Repository(client,ctx)
    reads.workshop_memberships.rows=[]
    await expect(r.findingsForOrder(a)).rejects.toMatchObject({kind:'denied'})
    reads.workshop_memberships.rows=[{user_id:a,workshop_id:b,status:'active',role:'owner'}]
    vi.mocked(client.auth.getUser).mockResolvedValueOnce({data:{user:{id:b,email_confirmed_at:'x'}},error:null} as never)
    await expect(r.pendingForVehicle(a)).rejects.toMatchObject({kind:'denied'})
  })
  it('does not read other workshops if backend result is inconsistent',async()=>{
    const {client,reads}=fake()
    const r=cp04Repository(client,ctx)
    reads.work_orders.rows=[{
      id:a,workshop_id:a,vehicle_id:a,status:'received',complaint:'Synthetic',
      opened_by:a,opened_at:'2026-11-15',closed_at:null,updated_at:'2026-11-15',intake_odometer:null
    }]
    await expect(r.recentOrders()).rejects.toMatchObject({kind:'unavailable'})
  })
  it('normalizes plate and limits lookup to active vehicle and tenant',async()=>{
    const {client,touched}=fake()
    const r=cp04Repository(client,ctx)
    await expect(r.findVehicleByPlate('AA-1234')).resolves.toBeNull()
    expect(touched.slice(-1)).toEqual(['vehicles'])
    await expect(r.findVehicleByPlate('INVALID!!! TOO LONG')).rejects.toMatchObject({kind:'invalid'})
  })
})
