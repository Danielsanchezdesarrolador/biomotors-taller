import {describe,it,expect,vi} from 'vitest'
import {parseTeam,requestIdentity,workshopRpc} from './client'
import {AuthController,type AuthGateway} from '../auth/controller'
describe('PLAN04 scoped RPCs and reservations (mock SDK)',()=>{
 it('rejects wrong-tenant and malformed team data',()=>{
  const team={workshopId:'a',active:2,pending:0,capacity:8,overCapacity:false,members:[],invites:[]}
  expect(parseTeam(team,'a').active).toBe(2)
  for(const value of [{...team,workshopId:'b'},{...team,capacity:-1},{...team,members:[{id:'x',name:'Owner',status:'owner'}]}])expect(()=>parseTeam(value,'a')).toThrow()
 })
 it('reuses the same request after an uncertain response but separates changed payloads',()=>{
  const request=requestIdentity(),first=request.for('same')
  expect(request.for('same')).toBe(first);expect(request.for('changed')).not.toBe(first)
  request.clear();expect(request.for('same')).not.toBe(first)
 })
 it('discards an RPC response after logout instead of rendering stale private data',async()=>{
  let resolve!:(value:unknown)=>void
  const rpc=vi.fn(()=>new Promise(r=>{resolve=r}))
  const gateway={getDataClient:async()=>({rpc}),hasSession:async()=>true,getUser:async()=>({id:'person',confirmed:true}),memberships:async()=>[],workshops:async()=>[],signOut:async()=>{},signIn:async()=>{},subscribe:()=>()=>{}} as unknown as AuthGateway
  const controller=new AuthController(gateway);await controller.validate()
  const pending=workshopRpc(controller,'bt_plan04_team')
  for(let n=0;n<8;n++)await Promise.resolve()
  await controller.logout();resolve({data:{workshopId:'other'},error:null})
  await expect(pending).rejects.toThrow('REQUEST_FAILED')
 })
})
