import { describe, expect, it } from 'vitest'
import { demoVehicles } from '../clientes/clientesData'
import { calculateTotals, exampleItems } from '../ordenes/detalleData'
import { readOrderRevision, writeOrderRevision } from '../ordenes/orderSession'
import { demoWorkOrders } from '../ordenes/ordenesData'
import { createDocument, documentContext, documentTotals, filterDocuments, historicalEvents, initialDocuments, simulateDelivery, validateDemoRecipient } from './documentosData'
describe('BT-UI-05 documentos y cotizaciones',()=>{
 it('asocia documento, cliente, vehículo y orden sin mezclar propietarios',()=>{
  for(const doc of initialDocuments()){
   const c=documentContext(doc)
   expect(c.vehicle.clientId).toBe(c.client.id)
   expect(c.order.plate).toBe(c.vehicle.plate)
   expect(c.client.email.endsWith('@example.com')).toBe(true)
   expect(doc.workshopId).toBe('workshop-demo')
  }
  const doc=initialDocuments()[0]
  expect(()=>documentContext({...doc,clientId:'customer-2'})).toThrow('Relación')
  expect(()=>createDocument('invalid','Informe','missing')).toThrow('Orden')
 })
 it('distingue tipos y filtra estado, cliente, patente y vehículo',()=>{
  const docs=initialDocuments()
  expect(filterDocuments(docs,'','Enviado')).toHaveLength(3)
  expect(filterDocuments(docs,'COT','Todos').every(d=>d.kind==='Cotización')).toBe(true)
  const vehicle=demoVehicles.find(v=>v.id==='vehicle-OT-1002')!
  expect(filterDocuments(docs,'María','Todos',vehicle.id).map(d=>d.id)).toEqual(['COT-1083','COT-1081'])
  expect(filterDocuments(docs,vehicle.plate,'Todos').map(d=>d.orderId)).toEqual(['OT-1002','OT-1002'])
  expect(filterDocuments(docs,'','Todos','missing')).toEqual([])
 })
 it('reutiliza los cálculos financieros de OT con IVA opcional',()=>{
  expect(documentTotals(exampleItems)).toEqual(calculateTotals(exampleItems))
  expect(documentTotals(exampleItems)).toEqual({subtotal:130150,tax:24729,total:154879})
  expect(documentTotals(exampleItems,false)).toEqual({subtotal:130150,tax:0,total:130150})
  expect(documentTotals([...exampleItems,{id:'extra',description:'Extra',type:'Repuesto',quantity:2,price:1000}]).total).toBe(157259)
  expect(()=>documentTotals([{...exampleItems[0],quantity:-1}])).toThrow(RangeError)
 })
 it('mantiene eventos históricos ficticios separados de la sesión',()=>{
  const docs=initialDocuments(),events=historicalEvents(docs)
  expect(events).toHaveLength(4)
  for(const event of events){
   expect(event.origin).toBe('Histórico ficticio')
   expect(event.fileRef).toBeNull()
   expect(event.recipient).toBe(documentContext(docs.find(d=>d.id===event.documentId)!).client.email)
  }
  const created=createDocument('INF-DEMO-001','Informe','OT-1002')
  expect(created.historical).toBe(false)
  expect(created.finalized).toBe(false)
  expect(created.status).toBe('Borrador')
 })
 it('simula sin marcar un envío real y bloquea destinatarios no sintéticos y duplicados',()=>{
  const doc=createDocument('INF-DEMO-002','Informe','OT-1002')
  const result=simulateDelivery(doc,'persona@example.com')
  expect(result.document.status).toBe('Pendiente')
  expect(result.document.simulationComplete).toBe(true)
  expect(result.event.origin).toBe('Simulación local')
  expect(result.event.result).toBe('Simulación completada. No se envió ningún correo real.')
  expect(result.event.fileRef).toBeNull()
  expect(()=>simulateDelivery(result.document,'persona@example.com')).toThrow('duplicado')
  for(const email of ['','correo inválido','persona@gmail.com','a@example.com.evil']){
   expect(validateDemoRecipient(email)).toBe(false)
   expect(()=>simulateDelivery(doc,email)).toThrow('sintético')
  }
  expect(doc.status).toBe('Borrador')
 })
 it('no reescribe documentos históricos al editar una revisión actual',()=>{
  const order=demoWorkOrders.find(o=>o.id==='OT-1002')!,revision=readOrderRevision(order)
  revision.items=[{id:'latest',description:'Ítem de revisión actual',type:'Servicio',quantity:1,price:9000}]
  writeOrderRevision(revision)
  expect(createDocument('COT-DEMO-actual','Cotización',order.id).items[0].price).toBe(9000)
  const historical=initialDocuments().find(d=>d.id==='COT-1083')!
  expect(documentTotals(historical.items).total).toBe(154879)
 })
 it('recupera una revisión en memoria y crea una copia editable independiente',()=>{
  const order=demoWorkOrders.find(o=>o.id==='OT-1008')!
  const revision=readOrderRevision(order)
  revision.inspection.frenos='atencion'
  revision.items=[{id:'session',description:'Trabajo de sesión',type:'Servicio',quantity:1.5,price:1000}]
  writeOrderRevision(revision)
  const report=createDocument('INF-DEMO-003','Informe',order.id)
  expect(report.inspection.frenos).toBe('atencion')
  expect(report.items[0].quantity).toBe(1.5)
  report.items[0].price=999
  report.inspection.frenos='correcto'
  expect(readOrderRevision(order).items[0].price).toBe(1000)
  expect(readOrderRevision(order).inspection.frenos).toBe('atencion')
 })
})
