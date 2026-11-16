/** CP04 candidate contracts: no writes without separately approved hosted SQL. */
import { UUID, normalizedPlate } from '../clientes/cp03PilotContracts'
export type OrderStatus='received'|'inspecting'|'in_service'|'ready'|'closed'
export type FindingResult='ok'|'attention'|'not_checked'
export type FindingResolution='not_applicable'|'pending'|'resolved'
/** Diagnosis is historical; resolution is a separate lifecycle state. */
export function inspectionResolutionLabel(item:Pick<Finding,'result'|'resolution'>):string {
  if(item.result!=='attention')return ''
  if(item.resolution==='resolved')return 'Reparación resuelta'
  if(item.resolution==='pending')return 'Reparación pendiente'
  return 'Estado de resolución no disponible'
}
export type WorkOrder=Readonly<{
  workshop_id:string;id:string;vehicle_id:string;complaint:string;
  intake_odometer:number|null;status:OrderStatus;opened_by:string;
  opened_at:string;closed_at:string|null;updated_at:string
}>
export type Finding=Readonly<{
  workshop_id:string;id:string;order_id:string;vehicle_id:string;
  category:string;result:FindingResult;note:string|null;
  resolution:FindingResolution;resolved_at:string|null;
  recorded_by:string;created_at:string;updated_at:string
}>
export type VehicleChoice=Readonly<{
  workshop_id:string;id:string;customer_id:string;plate:string|null;
  plate_key:string|null;make:string;model:string;odometer_km:number|null
}>
export type OrderWithVehicle=Readonly<{order:WorkOrder;vehicle:VehicleChoice}>
export type NewOrder=Readonly<{vehicle_id:string;complaint:string;intake_odometer:number|null}>
export type NewFinding=Readonly<{
  order_id:string;vehicle_id:string;category:string;
  result:FindingResult;note:string|null
}>
export const workStatuses:readonly OrderStatus[]=['received','inspecting','in_service','ready','closed']
export const workStatusLabel:Record<OrderStatus,string>={
  received:'Recibido',inspecting:'En inspección',in_service:'En reparación',
  ready:'Listo para entregar',closed:'Cerrado'
}
export const inspectionCategories=[
  'Frenos','Suspensión','Dirección','Neumáticos','Motor','Fluidos','Luces',
  'Batería','Transmisión','Carrocería','Otros'
] as const
export class WorkOrderFailure extends Error {
  constructor(public readonly kind:'invalid'|'denied'|'duplicate'|'conflict'|'unavailable'){
    super(kind);this.name='WorkOrderFailure'
  }
}
const invalid=()=>new WorkOrderFailure('invalid')
export function validId(value:string):string {
  if(typeof value!=='string'||!UUID.test(value))throw invalid()
  return value.toLowerCase()
}
export function validOdometer(value:number|null):number|null {
  if(value===null)return null
  if(!Number.isInteger(value)||value<0||value>3000000)throw invalid()
  return value
}
export function orderInput(input:NewOrder) {
  const vehicle_id=validId(input.vehicle_id)
  if(typeof input.complaint!=='string'||input.complaint.trim().length<3||
     input.complaint.trim().length>2000)throw invalid()
  return {vehicle_id,complaint:input.complaint.trim(),
    intake_odometer:validOdometer(input.intake_odometer)}
}
export function findingInput(input:NewFinding) {
  const order_id=validId(input.order_id),vehicle_id=validId(input.vehicle_id)
  const category=input.category?.trim()
  if(typeof category!=='string'||category.length<2||category.length>80 ||
    !['ok','attention','not_checked'].includes(input.result))throw invalid()
  const note=typeof input.note==='string' ? input.note.trim():null
  if(note!==null&&note.length>2000)throw invalid()
  if(input.result==='attention'&&(!note||note.length<3))throw invalid()
  return {order_id,vehicle_id,category,result:input.result,note:note||null,
    resolution:input.result==='attention'?'pending' as const:'not_applicable' as const}
}
export function validPlateSearch(raw:string):string{
  if(typeof raw!=='string')throw invalid()
  const plate=normalizedPlate(raw)
  if(!/^[A-Z0-9]{5,8}$/.test(plate))throw invalid()
  return plate
}
export function workFailure(error:unknown):never {
  if(error instanceof WorkOrderFailure)throw error
  const code=(error as {code?:string}|null)?.code
  if(code==='23505')throw new WorkOrderFailure('duplicate')
  if(['23503','23514','22P02'].includes(code||''))throw new WorkOrderFailure('invalid')
  if(['42501','PGRST301'].includes(code||''))throw new WorkOrderFailure('denied')
  throw new WorkOrderFailure('unavailable')
}
export function workMessage(error:unknown):string {
  const kind=error instanceof WorkOrderFailure?error.kind:'unavailable'
  switch(kind){
    case 'invalid':return 'Revisa los datos ingresados; todavía no se guardaron los cambios.'
    case 'duplicate':return 'El vehículo ya tiene una orden abierta. Abre la existente antes de crear otra.'
    case 'conflict':return 'Otra persona actualizó el registro. Recarga la orden antes de cambiarla.'
    case 'denied':return 'Tu sesión o rol no permiten esta operación. Vuelve a verificar tu acceso.'
    default:return 'No pudimos completar la operación. Verifica tu conexión y vuelve a intentarlo.'
  }
}
