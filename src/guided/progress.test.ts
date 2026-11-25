import {describe,it,expect} from 'vitest'
import {confirmedStage,canOpen,type Evidence} from './progress'
describe('server projection and pilot access',()=>{
 it('resumes each stage from confirmed records only',()=>{
  const e:Evidence={order:false,inspection:false,issued:false,approval:false,execution:false,handover:false,archive:false}
  expect(confirmedStage(e)).toBe(1)
  for(const [key,stage] of [['order',2],['inspection',3],['issued',4],['approval',5],['execution',6],['handover',7],['archive',7]] as const){e[key]=true;expect(confirmedStage(e)).toBe(stage)}
 })
 it('does not infer earlier steps from later flags',()=>{expect(confirmedStage({order:true,inspection:false,issued:true,approval:true,execution:true,handover:true,archive:true})).toBe(2)})
 it('limits access to approved active pilot and administrative roles',()=>{
 const workshop={id:'c943ad51-6d90-447b-8aa7-68866f69a4bc',status:'active'}
 expect(canOpen({role:'owner',workshop})).toBe(true)
 expect(canOpen({role:'admin',workshop})).toBe(true)
 for(const role of ['mechanic','reception'])expect(canOpen({role,workshop})).toBe(false)
 expect(canOpen({role:'owner',workshop:{...workshop,id:'other'}})).toBe(false)
 expect(canOpen({role:'owner',workshop:{...workshop,status:'inactive'}})).toBe(false)
 })
})

import {ensureOrderStage} from './progress'
import type {cp04Repository} from '../ordenes/cp04Repository'
function statusPort(status:string,mode='ok'){
 let version=0
 const row={order:{id:'o',vehicle_id:'v',workshop_id:'w',status,cancelled_at:null as string|null,updated_at:'0'},vehicle:{id:'v',workshop_id:'w'}}
 const writes:string[]=[]
 const port={getOrder:async()=>structuredClone(row),setStatus:async(_id:string,stamp:string,next:string)=>{if(stamp!==String(version))throw Error('stale');if(mode==='denied'||mode==='conflict')throw Error(mode);writes.push(next);row.order.status=next;row.order.updated_at=String(++version);if(mode==='lost')throw Error('lost');return row.order}} as unknown as Pick<ReturnType<typeof cp04Repository>,'getOrder'|'setStatus'>
 return{row,port,writes}
}
const scope={workshopId:'w',orderId:'o',vehicleId:'v'}
describe('guided explicit OT state transitions',()=>{
 it('uses fresh versions and legal sequence from received, then skips repeated transitions',async()=>{const f=statusPort('received');await ensureOrderStage(f.port,scope,'in_service');expect(f.writes).toEqual(['inspecting','in_service']);await ensureOrderStage(f.port,scope,'in_service');expect(f.writes).toHaveLength(2)})
 it('moves inspecting to in_service and to ready without regression',async()=>{const f=statusPort('inspecting');await ensureOrderStage(f.port,scope,'in_service');await ensureOrderStage(f.port,scope,'ready');await ensureOrderStage(f.port,scope,'inspecting');expect(f.writes).toEqual(['in_service','ready'])})
 it('reconciles a committed write with lost response without writing twice',async()=>{const f=statusPort('received','lost');await ensureOrderStage(f.port,scope,'in_service');expect(f.writes).toEqual(['inspecting','in_service'])})
 it('blocks closed, cancelled, unknown lifecycle and crossed identity before writing',async()=>{for(const kind of ['closed','cancelled','missing','crossed']){const f=statusPort(kind==='closed'?'closed':'inspecting');if(kind==='cancelled')f.row.order.cancelled_at='date';if(kind==='missing')delete (f.row.order as {cancelled_at?:string|null}).cancelled_at;if(kind==='crossed')f.row.vehicle.id='other';await expect(ensureOrderStage(f.port,scope,'in_service')).rejects.toThrow();expect(f.writes).toEqual([])}})
 it('does not retry a denied or unresolved conflicting transition',async()=>{for(const mode of ['denied','conflict']){const f=statusPort('inspecting',mode);await expect(ensureOrderStage(f.port,scope,'in_service')).rejects.toThrow(mode);expect(f.writes).toEqual([])}})
})
