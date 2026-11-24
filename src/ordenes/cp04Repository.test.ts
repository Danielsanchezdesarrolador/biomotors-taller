import { describe,expect,it,vi } from 'vitest'
import { cp04Repository } from './cp04Repository'
import { WorkOrderFailure,type Finding } from './cp04Contracts'
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
  it('reads only persisted PDF identification in the guarded workshop',async()=>{
    const {client,reads}=fake()
    reads.work_orders.rows=[{id:a,workshop_id:b,vehicle_id:a}]
    reads.vehicles.rows=[{id:a,workshop_id:b,customer_id:a,model_year:2023}]
    reads.customers={rows:[{id:a,workshop_id:b,full_name:'Cliente sintético'}]}
    const r=cp04Repository(client,ctx)
    await expect(r.pdfIdentity(a)).resolves.toEqual({workshop_id:b,order_id:a,vehicle_id:a,customer_id:a,ownerName:'Cliente sintético',modelYear:2023})
    reads.customers.rows=[{id:a,workshop_id:a,full_name:'Otro taller'}]
    await expect(r.pdfIdentity(a)).rejects.toMatchObject({kind:'unavailable'})
    reads.customers.rows=[{id:b,workshop_id:b,full_name:'Otro cliente'}]
    await expect(r.pdfIdentity(a)).rejects.toMatchObject({kind:'unavailable'})
    reads.workshop_memberships.rows=[]
    await expect(r.pdfIdentity(a)).rejects.toMatchObject({kind:'denied'})
  })
  it('hides older multipoint pending after OK, retains broad pending issue',async()=>{
    const {client,reads}=fake()
    const earlier:Finding={workshop_id:b,id:a,order_id:a,vehicle_id:a,
      category:'Multipunto · Luces bajas',result:'attention',note:'Problema',
      resolution:'pending',resolved_at:null,recorded_by:a,
      created_at:'2026-11-20T12:00:00Z',updated_at:'2026-11-20T12:00:00Z'}
    reads.inspection_findings.rows=[
      earlier,
      {...earlier,id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',result:'ok',
        note:null,resolution:'not_applicable',created_at:'2026-11-20T12:01:00Z'},
      {...earlier,id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',category:'Frenos'}
    ]
    const result=await cp04Repository(client,ctx).pendingForVehicle(a)
    expect(result.map(row=>row.category)).toEqual(['Frenos'])
    expect(reads.inspection_findings.rows).toHaveLength(3)
  })
})

describe('CP04 complete visit history',()=>{
 it('paginates beyond 200 diagnoses so a later correction cannot disappear after reload',async()=>{
   const {client}=fake()
   const rows:Finding[]=Array.from({length:251},(_,i)=>({
    workshop_id:b,id:`12345678-1234-4234-8234-${String(i+1).padStart(12,'0')}`,
    order_id:a,vehicle_id:a,category:'Multipunto · Extintor',result:i===250?'ok':'attention',
    note:i===250?null:'Antecedente',resolution:i===250?'not_applicable':'pending',resolved_at:null,
    recorded_by:a,created_at:new Date(1795500000000+i*1000).toISOString(),updated_at:new Date(1795500000000+i*1000).toISOString()
   }))
   const original=vi.mocked(client.from).getMockImplementation()!,cursors:string[]=[],filters:string[][]=[]
   let page=0
   vi.mocked(client.from).mockImplementation(((table:string)=>{
     if(table!=='inspection_findings')return original(table)
     const chain={select:()=>chain,eq:(key:string,value:string)=>{filters.push([key,value]);return chain},order:()=>chain,limit:()=>chain,
       or:(value:string)=>{cursors.push(value);return chain},
       then:(fn:(value:unknown)=>unknown)=>Promise.resolve(fn({data:[...rows].reverse().slice(page++*200,(page-1)*200+201),error:null}))}
     return chain
   }) as typeof client.from)
   const history=await cp04Repository(client,ctx).findingsForOrder(a)
   expect(history).toHaveLength(251)
   expect(history.at(-1)?.result).toBe('ok')
   expect(cursors).toHaveLength(1)
   expect(cursors[0]).toContain('created_at.lt.')
   expect(filters).toContainEqual(['workshop_id',b]);expect(filters).toContainEqual(['order_id',a])
 })
 it('rejects an unrelated order returned by the backend despite the scoped query',async()=>{
   const {client,reads}=fake()
   reads.inspection_findings.rows=[{workshop_id:b,id:a,order_id:b,vehicle_id:a}]
   await expect(cp04Repository(client,ctx).findingsForOrder(a)).rejects.toMatchObject({kind:'unavailable'})
 })
})

describe('CP04 mechanic authority remains unchanged',()=>{
 it('allows a verified mechanic to inspect an open order, never create or change its state',async()=>{
  const {client,reads}=fake('mechanic'),r=cp04Repository(client,{...ctx,role:'mechanic'})
  reads.work_orders.rows=[{id:a,workshop_id:b,vehicle_id:a,status:'inspecting'}]
  reads.inspection_findings.rows=[{id:a,workshop_id:b,order_id:a,vehicle_id:a,result:'ok',note:null}]
  await expect(r.createFinding({order_id:a,vehicle_id:a,category:'Multipunto · Extintor',result:'ok',note:null})).resolves.toMatchObject({id:a,result:'ok'})
  await expect(r.createOrder({vehicle_id:a,complaint:'Inspección sintética',intake_odometer:null})).rejects.toMatchObject({kind:'denied'})
  await expect(r.setStatus(a,'2026-11-24T10:00:00Z','closed')).rejects.toMatchObject({kind:'denied'})
  reads.work_orders.rows[0].status='closed'
  await expect(r.createFinding({order_id:a,vehicle_id:a,category:'Multipunto · Extintor',result:'ok',note:null})).rejects.toMatchObject({kind:'invalid'})
 })
})
