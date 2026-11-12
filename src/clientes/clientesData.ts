import { demoWorkOrders, type WorkOrder } from '../ordenes/ordenesData'
export type ClientStatus = 'Activo' | 'Frecuente' | 'Pendiente'
export type DemoClient = { id:string; name:string; phone:string; email:string; address:string; commune:string; status:ClientStatus; lastVisit:string; emailVerified:false }
export type DemoVehicle = { id:string; clientId:string; plate:string; description:string; mileage:number; status:ClientStatus }
export type VehicleHistory = { id:string; vehicleId:string; orderId?:string; date:string; work:string; status:string; mileage:number; technician:string; parts:string[]; reportId?:string; estimateId?:string; deliveryStatus:'No enviado · DEMO' }
export type TechnicalObservation = { id:string; clientId:string; vehicleId:string; orderId:string; text:string; status:'Pendiente' }
// Ownership mapping is explicit; identities/vehicle details come from the orders fixtures.
const groups = [ ['OT-1001','OT-1005'], ['OT-1002'], ['OT-1003'], ['OT-1004','OT-1006'], ['OT-1007','OT-1008'] ]
const status:ClientStatus[]=['Activo','Frecuente','Activo','Pendiente','Frecuente']
export const demoClients:DemoClient[]=groups.map((ids,i)=>({id:`customer-${i+1}`,emailVerified:false,name:demoWorkOrders.find(o=>o.id===ids[0])!.client.replace(/ · DEMO$/,''),phone:`+56 9 0000 000${i+1}`,email:`cliente${i+1}@example.com`,address:`Calle de Muestra ${100+i} · dirección ficticia`,commune:'Comuna DEMO',status:status[i],lastVisit:demoWorkOrders.find(o=>o.id===ids[0])!.date}))
export const demoVehicles:DemoVehicle[]=groups.flatMap((ids,i)=>ids.map(id=>{const o=demoWorkOrders.find(order=>order.id===id)!;return{id:'vehicle-'+id,clientId:`customer-${i+1}`,plate:o.plate,description:o.vehicle,mileage:o.mileage,status:status[i]}}))
export function ordersForVehicle(vehicleId:string):WorkOrder[] {const vehicle=demoVehicles.find(v=>v.id===vehicleId);return vehicle?demoWorkOrders.filter(order=>order.plate===vehicle.plate):[]}
export const demoHistory:VehicleHistory[]=demoVehicles.flatMap(v=>{
 const order=ordersForVehicle(v.id)[0]
 return [
  {id:`visit-${v.id}-1`,vehicleId:v.id,orderId:order.id,date:order.date,work:order.service,status:order.status==='entrega'?'Completado':order.status==='servicio'?'En servicio':order.status==='diagnostico'?'En diagnóstico':'Pendiente',mileage:order.mileage,technician:order.technician,parts:[],reportId:'report-demo-'+order.id,estimateId:'estimate-demo-'+order.id,deliveryStatus:'No enviado · DEMO' as const},
  ...['Mantención de 60.000 km (aceite, filtros y revisión general)','Cambio de pastillas de freno (delanteras)','Alineación y balanceo'].map((work,index)=>({id:`visit-${v.id}-${index+2}`,vehicleId:v.id,date:['12 ago 2026','03 may 2026','15 feb 2026'][index],work,status:'Completado',mileage:Math.max(0,v.mileage-(index+1)*5000),technician:'Técnico de muestra',parts:index===1?['Pastillas de freno DEMO']:[],deliveryStatus:'No enviado · DEMO' as const})),
 ]
})
export const demoObservations:TechnicalObservation[]=demoVehicles.flatMap(v=>ordersForVehicle(v.id).flatMap(o=>o.pending.map((text,i)=>({id:`observation-${o.id}-${i}`,clientId:v.clientId,vehicleId:v.id,orderId:o.id,text,status:'Pendiente' as const}))))
export const vehiclesForClient=(clientId:string)=>demoVehicles.filter(v=>v.clientId===clientId)
export const historyForVehicle=(vehicleId:string)=>demoHistory.filter(h=>h.vehicleId===vehicleId)
export const observationsForVehicle=(clientId:string,vehicleId:string)=>demoObservations.filter(o=>o.clientId===clientId&&o.vehicleId===vehicleId)
export function searchClients(clients:DemoClient[],query:string|string[],filter:ClientStatus|'Todos') {
 const normalize=(s:string)=>s.toLocaleLowerCase('es-CL').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9@]/g,'')
 const terms=(Array.isArray(query)?query:[query]).map(normalize).filter(Boolean)
 return clients.filter(c=>(filter==='Todos'||c.status===filter)&&terms.every(term=>[c.name,c.phone,c.email,...vehiclesForClient(c.id).map(v=>v.plate)].some(value=>normalize(value).includes(term))))
}
export type RegistrationDraft = { name:string; email:string; phone:string; address:string; commune:string; consent:boolean }
export function validateRegistration(draft:RegistrationDraft) {
 const errors:Partial<Record<keyof RegistrationDraft,string>>={}
 if(draft.name.trim().length<3)errors.name='Ingresa un nombre de muestra de al menos 3 caracteres.'
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))errors.email='Ingresa un correo con formato válido.'
 if(!/^(?:\+?56)?9\d{8}$/.test(draft.phone.replace(/[\s()-]/g,'')))errors.phone='Usa un teléfono móvil chileno: +56 9 seguido de 8 dígitos.'
 if(!draft.consent)errors.consent='Confirma que usarás exclusivamente datos ficticios.'
 return errors
}
