import {afterEach, describe, expect, it, vi} from 'vitest'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../auth/controller'
import {cp03PilotRepository} from '../clientes/cp03PilotRepository'
import {cp04Repository} from '../ordenes/cp04Repository'
const wid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',uid='11111111-1111-4111-8111-111111111111'
const ctx:Context={userId:uid,role:'owner',workshop:{id:wid,name:'Synthetic',status:'active'}}
function fixture(){
 const operations:{table:string;method:string;args:unknown[]}[]=[]
 const client={auth:{getUser:async()=>({data:{user:{id:uid,email_confirmed_at:'2026-11-24'}},error:null})},from(table:string){
  const data=table==='workshop_memberships'?{workshop_id:wid,user_id:uid,role:'owner',status:'active'}:table==='workshops'?{id:wid,status:'active'}:null
  const chain:Record<string,unknown>={maybeSingle:async()=>({data,error:null}),then:(resolve:(r:unknown)=>unknown)=>Promise.resolve(resolve({data:[],error:null}))}
  for(const method of ['select','eq','is','in','order','limit','ilike'])chain[method]=(...args:unknown[])=>{operations.push({table,method,args});return chain}
  return chain
 }} as unknown as SupabaseClient
 return {client,operations}
}
afterEach(()=>vi.unstubAllEnvs())
describe('archived source exclusion without hiding historical visits',()=>{
 it('directory vehicle lookup requires an active parent, not only an active vehicle',async()=>{
  const {client,operations}=fixture();await cp03PilotRepository(client,ctx).getVehicle(wid)
  expect(operations).toContainEqual({table:'vehicles',method:'is',args:['customers.archived_at',null]})
  expect(operations.some(x=>x.method==='select'&&String(x.args[0]).includes('customers!inner'))).toBe(true)
 })
 it('intake plate lookup excludes children of archived customers',async()=>{
  const {client,operations}=fixture();await cp04Repository(client,ctx).findVehicleByPlate('AA1234')
  expect(operations).toContainEqual({table:'vehicles',method:'is',args:['customers.archived_at',null]})
 })
 it('quote order choices filter both archived ancestor levels at the server',async()=>{
  const {client,operations}=fixture();await cp04Repository(client,ctx).recentOrders(true)
  expect(operations).toContainEqual({table:'work_orders',method:'is',args:['vehicles.archived_at',null]})
  expect(operations).toContainEqual({table:'work_orders',method:'is',args:['vehicles.customers.archived_at',null]})
 })
 it('enabled rollout excludes cancelled orders in the operational selector',async()=>{
  vi.stubEnv('VITE_BT_RECORDS_PRIVATE_ENABLED','true');vi.resetModules()
  const {cp04Repository:enabledRepository}=await import('../ordenes/cp04Repository')
  const {client,operations}=fixture();await enabledRepository(client,ctx).recentOrders(true)
  expect(operations).toContainEqual({table:'work_orders',method:'is',args:['cancelled_at',null]})
 })
 it('historical order list retains archived visits and requires no uninstalled columns while OFF',async()=>{
  const {client,operations}=fixture();await cp04Repository(client,ctx).recentOrders()
  expect(operations.filter(x=>x.table==='work_orders').some(x=>x.method==='is')).toBe(false)
  expect(operations.some(x=>x.method==='select'&&String(x.args[0]).includes('cancelled_at'))).toBe(false)
 })
})
