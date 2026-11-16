/**
 * CP04 candidate — work orders, multipoint inspection and carried-forward
 * issues. Only inject the same authenticated R1 Supabase client as CP03.
 * This module is NOT enabled on hosted Render until CP04 SQL is approved,
 * deployed and tested. JWT + RLS remain the real authorization boundary.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context,Role } from '../auth/controller'
import { UUID } from '../clientes/cp03PilotContracts'
import {
  WorkOrderFailure, workFailure, validId, validPlateSearch, orderInput,
  findingInput, workStatuses, type WorkOrder, type Finding, type NewOrder,
  type NewFinding, type OrderStatus, type VehicleChoice, type OrderWithVehicle
} from './cp04Contracts'

const orderCols='workshop_id,id,vehicle_id,complaint,intake_odometer,status,opened_by,opened_at,closed_at,updated_at'
const findingCols='workshop_id,id,order_id,vehicle_id,category,result,note,resolution,resolved_at,recorded_by,created_at,updated_at'
const vehicleCols='workshop_id,id,customer_id,plate,plate_key,make,model,odometer_km'
const staff:readonly Role[]=['owner','admin','reception']
const inspectionStaff:readonly Role[]=['owner','admin','reception','mechanic']
function check<T extends {workshop_id:string;id:string}>(row:unknown,workshopId:string):T{
  if(!row||typeof row!=='object'||Array.isArray(row)||
    (row as T).workshop_id!==workshopId ||
    typeof (row as T).id!=='string'||!UUID.test((row as T).id))
    throw new WorkOrderFailure('unavailable')
  return row as T
}
function many<T extends {workshop_id:string;id:string}>(rows:unknown,tenant:string):T[]{
  if(!Array.isArray(rows))throw new WorkOrderFailure('unavailable')
  return rows.map(v=>check<T>(v,tenant))
}
export function cp04Repository(client:SupabaseClient,context:Context){
  if(!UUID.test(context.userId)||!UUID.test(context.workshop.id))
    throw new WorkOrderFailure('denied')
  const tenant=context.workshop.id.toLowerCase()
  let invalidated=false,revision=0
  function dispose(){invalidated=true;revision++}
  async function guard(allowed:readonly Role[]|null=null):Promise<number>{
    if(invalidated)throw new WorkOrderFailure('denied')
    const version=revision
    try {
      const {data,error}=await client.auth.getUser()
      if(error||!data.user||!data.user.email_confirmed_at||
          data.user.id!==context.userId)throw new WorkOrderFailure('denied')
      const member=await client.from('workshop_memberships')
        .select('workshop_id,user_id,role,status')
        .eq('workshop_id',tenant).eq('user_id',context.userId)
        .eq('status','active').maybeSingle()
      if(member.error)workFailure(member.error)
      if(!member.data||member.data.user_id!==context.userId||
         member.data.workshop_id!==tenant||member.data.role!==context.role||
         (allowed && !allowed.includes(member.data.role as Role)))
        throw new WorkOrderFailure('denied')
      const workshop=await client.from('workshops').select('id,status')
        .eq('id',tenant).eq('status','active').maybeSingle()
      if(workshop.error)workFailure(workshop.error)
      if(!workshop.data||workshop.data.id!==tenant||workshop.data.status!=='active')
        throw new WorkOrderFailure('denied')
      if(invalidated||version!==revision)throw new WorkOrderFailure('denied')
      return version
    }catch(error){
      if(error instanceof WorkOrderFailure)throw error
      throw new WorkOrderFailure('unavailable')
    }
  }
  function valid(version:number){
    if(invalidated||version!==revision)throw new WorkOrderFailure('denied')
  }
  async function findVehicleByPlate(plate:string):Promise<VehicleChoice|null>{
    const key=validPlateSearch(plate),version=await guard()
    const result=await client.from('vehicles').select(vehicleCols)
      .eq('workshop_id',tenant).eq('plate_key',key)
      .is('archived_at',null).maybeSingle()
    if(result.error)workFailure(result.error)
    valid(version)
    return result.data?check<VehicleChoice>(result.data,tenant):null
  }
  async function getVehicle(id:string):Promise<VehicleChoice|null>{
    const key=validId(id),version=await guard()
    const result=await client.from('vehicles').select(vehicleCols)
      .eq('workshop_id',tenant).eq('id',key).maybeSingle()
    if(result.error)workFailure(result.error)
    valid(version)
    return result.data?check<VehicleChoice>(result.data,tenant):null
  }
  async function recentOrders():Promise<OrderWithVehicle[]>{
    const version=await guard()
    const orders=await client.from('work_orders').select(orderCols)
      .eq('workshop_id',tenant).order('opened_at',{ascending:false}).limit(40)
    if(orders.error)workFailure(orders.error)
    const list=many<WorkOrder>(orders.data,tenant)
    if(!list.length)return []
    const vehicles=await client.from('vehicles').select(vehicleCols)
      .eq('workshop_id',tenant).in('id',[...new Set(list.map(x=>x.vehicle_id))])
    if(vehicles.error)workFailure(vehicles.error)
    const byId=new Map(many<VehicleChoice>(vehicles.data,tenant).map(v=>[v.id,v]))
    valid(version)
    return list.map(order=>{
      const vehicle=byId.get(order.vehicle_id)
      if(!vehicle)throw new WorkOrderFailure('unavailable')
      return {order,vehicle}
    })
  }
  async function getOrder(id:string):Promise<OrderWithVehicle|null>{
    const key=validId(id),version=await guard()
    const result=await client.from('work_orders').select(orderCols)
      .eq('workshop_id',tenant).eq('id',key).maybeSingle()
    if(result.error)workFailure(result.error)
    if(!result.data){valid(version);return null}
    const order=check<WorkOrder>(result.data,tenant)
    const vehicleRes=await client.from('vehicles').select(vehicleCols)
      .eq('workshop_id',tenant).eq('id',order.vehicle_id).maybeSingle()
    if(vehicleRes.error)workFailure(vehicleRes.error)
    valid(version)
    if(!vehicleRes.data)throw new WorkOrderFailure('unavailable')
    return {order,vehicle:check<VehicleChoice>(vehicleRes.data,tenant)}
  }
  async function findingsForOrder(orderId:string):Promise<Finding[]>{
    const id=validId(orderId),version=await guard()
    const result=await client.from('inspection_findings').select(findingCols)
      .eq('workshop_id',tenant).eq('order_id',id)
      .order('created_at',{ascending:true}).limit(100)
    if(result.error)workFailure(result.error)
    valid(version)
    return many<Finding>(result.data,tenant)
  }
  async function pendingForVehicle(vehicleId:string):Promise<Finding[]>{
    const id=validId(vehicleId),version=await guard()
    const result=await client.from('inspection_findings').select(findingCols)
      .eq('workshop_id',tenant).eq('vehicle_id',id).eq('resolution','pending')
      .order('created_at',{ascending:false}).limit(100)
    if(result.error)workFailure(result.error)
    valid(version)
    return many<Finding>(result.data,tenant)
  }
  async function createOrder(data:NewOrder):Promise<WorkOrder>{
    const input=orderInput(data),version=await guard(staff)
    const vehicle=await client.from('vehicles').select('id,workshop_id')
      .eq('workshop_id',tenant).eq('id',input.vehicle_id)
      .is('archived_at',null).maybeSingle()
    if(vehicle.error)workFailure(vehicle.error)
    if(!vehicle.data||vehicle.data.workshop_id!==tenant)throw new WorkOrderFailure('invalid')
    valid(version)
    const result=await client.from('work_orders')
      .insert({workshop_id:tenant,...input}).select(orderCols).single()
    if(result.error)workFailure(result.error)
    valid(version)
    const order=check<WorkOrder>(result.data,tenant)
    if(order.vehicle_id!==input.vehicle_id)throw new WorkOrderFailure('unavailable')
    return order
  }
  async function setStatus(id:string,expectedUpdatedAt:string,status:OrderStatus):Promise<WorkOrder>{
    const key=validId(id)
    if(!workStatuses.includes(status)||!Number.isFinite(Date.parse(expectedUpdatedAt)))
      throw new WorkOrderFailure('invalid')
    const version=await guard(staff)
    const result=await client.from('work_orders').update({status})
      .eq('workshop_id',tenant).eq('id',key).eq('updated_at',expectedUpdatedAt)
      .neq('status','closed').select(orderCols).maybeSingle()
    if(result.error)workFailure(result.error)
    valid(version)
    if(!result.data)throw new WorkOrderFailure('conflict')
    return check<WorkOrder>(result.data,tenant)
  }
  async function createFinding(data:NewFinding):Promise<Finding>{
    const input=findingInput(data),version=await guard(inspectionStaff)
    const order=await client.from('work_orders').select('id,vehicle_id,status,workshop_id')
      .eq('workshop_id',tenant).eq('id',input.order_id).maybeSingle()
    if(order.error)workFailure(order.error)
    if(!order.data||order.data.workshop_id!==tenant||
       order.data.vehicle_id!==input.vehicle_id||order.data.status==='closed')
      throw new WorkOrderFailure('invalid')
    valid(version)
    const result=await client.from('inspection_findings')
      .insert({workshop_id:tenant,...input}).select(findingCols).single()
    if(result.error)workFailure(result.error)
    valid(version)
    const record=check<Finding>(result.data,tenant)
    if(record.order_id!==input.order_id||record.vehicle_id!==input.vehicle_id)
      throw new WorkOrderFailure('unavailable')
    return record
  }
  /** Edit a note on the same finding, not a duplicate 'pending' observation.
   * Optimistic timestamp prevents overwriting a colleague's edits.
   * Closed diagnoses remain immutable through the existing SQL trigger.
   */
  async function updateFindingNote(id:string,expectedUpdatedAt:string,note:string):Promise<Finding>{
    const key=validId(id)
    if(!Number.isFinite(Date.parse(expectedUpdatedAt))||
       typeof note!=='string'||note.trim().length>2000)
      throw new WorkOrderFailure('invalid')
    const version=await guard(inspectionStaff)
    const current=await client.from('inspection_findings')
      .select('id,order_id,workshop_id,result,resolution')
      .eq('workshop_id',tenant).eq('id',key).maybeSingle()
    if(current.error)workFailure(current.error)
    if(!current.data||current.data.workshop_id!==tenant||
       current.data.resolution==='resolved')
      throw new WorkOrderFailure('denied')
    const order=await client.from('work_orders')
      .select('id,status,workshop_id').eq('workshop_id',tenant)
      .eq('id',current.data.order_id).maybeSingle()
    if(order.error)workFailure(order.error)
    if(!order.data||order.data.workshop_id!==tenant||order.data.status==='closed')
      throw new WorkOrderFailure('denied')
    const text=note.trim()
    if(current.data.result==='attention'&&text.length<3)
      throw new WorkOrderFailure('invalid')
    valid(version)
    const result=await client.from('inspection_findings').update({note:text||null})
      .eq('workshop_id',tenant).eq('id',key).eq('updated_at',expectedUpdatedAt)
      .select(findingCols).maybeSingle()
    if(result.error)workFailure(result.error)
    valid(version)
    if(!result.data)throw new WorkOrderFailure('conflict')
    return check<Finding>(result.data,tenant)
  }
  async function markResolved(id:string,expectedUpdatedAt:string,resolved:boolean):Promise<Finding>{
    const key=validId(id)
    if(!Number.isFinite(Date.parse(expectedUpdatedAt)))throw new WorkOrderFailure('invalid')
    const version=await guard(inspectionStaff)
    const result=await client.from('inspection_findings')
      .update({resolution:resolved?'resolved':'pending'})
      .eq('workshop_id',tenant).eq('id',key).eq('updated_at',expectedUpdatedAt)
      .eq('result','attention').select(findingCols).maybeSingle()
    if(result.error)workFailure(result.error)
    valid(version)
    if(!result.data)throw new WorkOrderFailure('conflict')
    return check<Finding>(result.data,tenant)
  }
  return Object.freeze({findVehicleByPlate,getVehicle,recentOrders,getOrder,
    findingsForOrder,pendingForVehicle,createOrder,setStatus,createFinding,updateFindingNote,markResolved,dispose})
}
