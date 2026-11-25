/** Progress is a projection of confirmed records, never a stored step number. */
export type Evidence = {order:boolean;inspection:boolean;issued:boolean;approval:boolean;execution:boolean;handover:boolean;archive:boolean}
export function confirmedStage(e:Evidence):number {
 if(!e.order)return 1
 if(!e.inspection)return 2
 if(!e.issued)return 3
 if(!e.approval)return 4
 if(!e.execution)return 5
 if(!e.handover)return 6
 return 7
}
export function canOpen(context:{role:string;workshop:{id:string;status?:string}}){
 // Existing approved pilot scope only. Global build gates never authorize another tenant.
 return context.workshop.status==='active'&&['owner','admin'].includes(context.role)&&context.workshop.id==='c943ad51-6d90-447b-8aa7-68866f69a4bc'
}

/** Future adapter contract only: no public registration or automatic writes.
 * An authorized admin must first reconcile and persist existing directory IDs.
 * A future server-owned review record must verify workshop, actor and mapping;
 * a client-supplied reviewed flag is never sufficient. */
export type ReviewedExternalIntake = Readonly<{
 source:'admin-reviewed-external-request'; requestId:string; reviewId:string;
 workshopId:string; customerId:string; vehicleId:string
}>

import type {cp04Repository} from '../ordenes/cp04Repository'
export class OrderStageFailure extends Error {
 readonly kind='order_not_ready'
 constructor(){super('La OT está cerrada, cancelada o su estado no pudo confirmarse. Actualiza la visita antes de continuar.')}
}
/** Explicit saves only; each mutation uses a fresh optimistic version and readback. */
export async function ensureOrderStage(port:Pick<ReturnType<typeof cp04Repository>,'getOrder'|'setStatus'>,scope:{workshopId:string;orderId:string;vehicleId:string},target:'inspecting'|'in_service'|'ready'){
 const rank={received:0,inspecting:1,in_service:2,ready:3}
 const read=async()=>{const row=await port.getOrder(scope.orderId,true)
  if(!row||row.order.id!==scope.orderId||row.order.workshop_id!==scope.workshopId||row.vehicle.workshop_id!==scope.workshopId||row.vehicle.id!==scope.vehicleId||row.order.vehicle_id!==scope.vehicleId||row.order.cancelled_at!==null||row.order.status==='closed'||!(row.order.status in rank))throw new OrderStageFailure()
  return row
 }
 let row=await read()
 while(rank[row.order.status as keyof typeof rank]<rank[target]){
  const next=(['inspecting','in_service','ready'] as const)[rank[row.order.status as keyof typeof rank]]
  try{await port.setStatus(row.order.id,row.order.updated_at,next)}
  catch(error){const checked=await read();if(rank[checked.order.status as keyof typeof rank]<rank[next])throw error;row=checked;continue}
  row=await read();if(rank[row.order.status as keyof typeof rank]<rank[next])throw new OrderStageFailure()
 }
 return row
}
