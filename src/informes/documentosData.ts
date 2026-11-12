import { demoClients, demoVehicles } from '../clientes/clientesData'
import { baseOrderRevision, readOrderRevision, sessionOrders, type OrderRevision } from '../ordenes/orderSession'
import { calculateTotals, type LineItem } from '../ordenes/detalleData'
export type DocumentKind='Informe'|'Cotización'
export type DocumentStatus='Borrador'|'Pendiente'|'Enviado'|'Error'
export type SectionKey='diagnosis'|'work'|'recommendations'|'pending'|'inspection'
export type DemoDocument={id:string;workshopId:'workshop-demo';orderId:string;clientId:string;vehicleId:string;kind:DocumentKind;status:DocumentStatus;date:string;validDays:number;taxApplicable:boolean;diagnosis:string;work:string;recommendations:string;pending:string;inspection:OrderRevision['inspection'];items:LineItem[];include:Record<SectionKey,boolean>;historical:boolean;finalized:boolean;simulationComplete:boolean}
export type DeliveryEvent={id:string;documentId:string;workshopId:'workshop-demo';orderId:string;clientId:string;vehicleId:string;recipient:string;date:string;status:DocumentStatus;origin:'Histórico ficticio'|'Simulación local';result:string;fileRef:null}
export function documentContext(doc:Pick<DemoDocument,'orderId'|'clientId'|'vehicleId'>) {
 const order=sessionOrders().find(o=>o.id===doc.orderId),client=demoClients.find(c=>c.id===doc.clientId),vehicle=demoVehicles.find(v=>v.id===doc.vehicleId)
 if(!order||!client||!vehicle||vehicle.clientId!==client.id||vehicle.plate!==order.plate||order.client.replace(/ · DEMO$/,'')!==client.name)throw new Error('Relación de documento inválida')
 return {order,client,vehicle}
}
export function createDocument(id:string,kind:DocumentKind,orderId:string,source:'session'|'baseline'='session'):DemoDocument {
 const order=sessionOrders().find(o=>o.id===orderId)
 if(!order)throw new Error('Orden inexistente')
 const vehicle=demoVehicles.find(v=>v.plate===order.plate),client=demoClients.find(c=>c.id===vehicle?.clientId)
 if(!vehicle||!client)throw new Error('La orden no tiene una ficha DEMO asociada')
 const revision=source==='session'?readOrderRevision(order):baseOrderRevision(order)
 const doc:DemoDocument={id,workshopId:'workshop-demo',kind,orderId,clientId:client.id,vehicleId:vehicle.id,status:'Borrador',date:new Date().toISOString(),validDays:15,taxApplicable:true,diagnosis:order.diagnosis,work:order.service,recommendations:order.recommendation,pending:order.pending.join('\n'),inspection:revision.inspection,items:revision.items,include:{diagnosis:true,work:true,recommendations:true,pending:true,inspection:true},historical:false,finalized:false,simulationComplete:false}
 documentContext(doc)
 return doc
}
export function initialDocuments():DemoDocument[] {
 return ([['INF-2048','Informe','OT-1001','Borrador','2026-11-11T17:26:00Z'],['COT-1083','Cotización','OT-1002','Pendiente','2026-11-11T16:48:00Z'],['INF-2047','Informe','OT-1003','Enviado','2026-11-11T15:31:00Z'],['COT-1082','Cotización','OT-1004','Enviado','2026-11-11T14:05:00Z'],['INF-2046','Informe','OT-1007','Error','2026-11-11T13:22:00Z'],['COT-1081','Cotización','OT-1002','Enviado','2026-11-10T19:47:00Z']] as const).map(([id,kind,orderId,status,date])=>({...createDocument(id,kind,orderId,'baseline'),status,date,historical:true,finalized:status==='Enviado'||status==='Error'}))
}
export function historicalEvents(docs:DemoDocument[]):DeliveryEvent[] {return docs.filter(d=>d.status==='Enviado'||d.status==='Error').map(d=>({id:'fixture-'+d.id,documentId:d.id,workshopId:d.workshopId,orderId:d.orderId,clientId:d.clientId,vehicleId:d.vehicleId,recipient:documentContext(d).client.email,date:d.date,status:d.status,origin:'Histórico ficticio',result:d.status==='Error'?'Fallo ficticio del proveedor de ejemplo; no hubo conexión.':'Evento ilustrativo; no se envió correo real.',fileRef:null}))}
export function filterDocuments(docs:DemoDocument[],query:string,status:DocumentStatus|'Todos',vehicleId='Todos') {
 const q=query.trim().toLocaleLowerCase('es-CL')
 return docs.filter(d=>{const {client,vehicle}=documentContext(d);return (status==='Todos'||d.status===status)&&(vehicleId==='Todos'||d.vehicleId===vehicleId)&&(!q||[d.id,d.kind,d.orderId,client.name,vehicle.plate,vehicle.description].some(v=>v.toLocaleLowerCase('es-CL').includes(q)))})
}
export function documentTotals(items:LineItem[],taxApplicable=true){const t=calculateTotals(items);return taxApplicable?t:{subtotal:t.subtotal,tax:0,total:t.subtotal}}
export function validateDemoRecipient(email:string){return /^[a-z0-9]+(?:[._+-][a-z0-9]+)*@example\.com$/i.test(email.trim())}
export function simulateDelivery(doc:DemoDocument,recipient:string):{document:DemoDocument;event:DeliveryEvent} {
 if(!validateDemoRecipient(recipient))throw new Error('Usa exclusivamente un correo sintético @example.com.')
 documentContext(doc)
 if(doc.simulationComplete)throw new Error('La simulación de este documento ya se completó. No se añadirá un intento duplicado.')
 return {document:{...doc,finalized:true,simulationComplete:true,status:'Pendiente'},event:{id:'local-'+doc.id,documentId:doc.id,workshopId:doc.workshopId,orderId:doc.orderId,clientId:doc.clientId,vehicleId:doc.vehicleId,recipient:recipient.trim(),date:new Date().toISOString(),status:'Pendiente',origin:'Simulación local',result:'Simulación completada. No se envió ningún correo real.',fileRef:null}}
}
export const formatDocDate=(value:string)=>new Intl.DateTimeFormat('es-CL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'America/Santiago'}).format(new Date(value))
