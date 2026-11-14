import { clientFixtures, vehicleFixtures, historyFixtures, observationFixtures } from '#test-records'
import { sessionOrders } from '../ordenes/orderSession'
import { demoWorkOrders, type WorkOrder } from '../ordenes/ordenesData'
export type ClientStatus = 'Activo' | 'Frecuente' | 'Pendiente'
export type DemoClient = { id:string; name:string; phone:string; email:string; address:string; commune:string; status:ClientStatus; lastVisit:string; emailVerified:false }
export type DemoVehicle = { id:string; clientId:string; plate:string; description:string; mileage:number; status:ClientStatus }
export type VehicleHistory = { id:string; vehicleId:string; orderId?:string; date:string; work:string; status:string; mileage:number; technician:string; parts:string[]; reportId?:string; estimateId?:string; deliveryStatus:'No enviado · DEMO' }
export type TechnicalObservation = { id:string; clientId:string; vehicleId:string; orderId:string; text:string; status:'Pendiente' }
export const demoClients: DemoClient[] = structuredClone(clientFixtures)
export const demoVehicles: DemoVehicle[] = structuredClone(vehicleFixtures)
export function ordersForVehicle(vehicleId:string):WorkOrder[] {const vehicle=demoVehicles.find(v=>v.id===vehicleId);return vehicle?sessionOrders().filter(order=>order.vehicleId?order.vehicleId===vehicle.id:vehicle.id==='vehicle-'+order.id):[]}
export const demoHistory: VehicleHistory[] = structuredClone(historyFixtures)
export const demoObservations: TechnicalObservation[] = structuredClone(observationFixtures)
export const vehiclesForClient=(clientId:string)=>demoVehicles.filter(v=>v.clientId===clientId)
export const historyForVehicle=(vehicleId:string)=>[...demoHistory.filter(h=>h.vehicleId===vehicleId),...ordersForVehicle(vehicleId).filter(o=>!demoHistory.some(h=>h.orderId===o.id)).map(o=>({id:'visit-'+o.id,vehicleId,orderId:o.id,date:o.date,work:o.service,status:'Ingreso DEMO',mileage:o.mileage,technician:o.technician,parts:[],deliveryStatus:'No enviado · DEMO' as const}))]
export const observationsForVehicle=(clientId:string,vehicleId:string)=>[...demoObservations.filter(o=>o.clientId===clientId&&o.vehicleId===vehicleId),...ordersForVehicle(vehicleId).filter(o=>!demoWorkOrders.some(seed=>seed.id===o.id)).flatMap(o=>o.pending.map((text,i)=>({id:o.id+'-'+i,clientId,vehicleId,orderId:o.id,text,status:'Pendiente' as const}))) ]
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

// Stable-ID adapter for legacy fixtures; a plate is never an identity or authorization.
export function vehicleForOrder(order:WorkOrder){return demoVehicles.find(v=>v.id===(order.vehicleId??'vehicle-'+order.id)&&(!order.clientId||v.clientId===order.clientId))}
