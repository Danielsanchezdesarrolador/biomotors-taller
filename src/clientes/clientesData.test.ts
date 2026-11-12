import { describe, expect, it } from 'vitest'
import { demoClients, demoVehicles, demoHistory, demoObservations, historyForVehicle, observationsForVehicle, ordersForVehicle, searchClients, validateRegistration, vehiclesForClient } from './clientesData'
import { demoWorkOrders } from '../ordenes/ordenesData'
describe('BT-UI-04 — búsqueda y asociaciones DEMO',()=>{
 it('filtra nombre sin acentos, teléfono normalizado, correo y patente',()=>{
  expect(searchClients(demoClients,'camila munoz','Todos').map(c=>c.id)).toEqual(['customer-1'])
  expect(searchClients(demoClients,'56900000001','Todos').map(c=>c.id)).toEqual(['customer-1'])
  expect(searchClients(demoClients,'cliente2@example.com','Todos').map(c=>c.id)).toEqual(['customer-2'])
  expect(searchClients(demoClients,'kzv-482','Todos').map(c=>c.id)).toEqual(['customer-2'])
  expect(searchClients(demoClients,['camila','cliente1@example.com'],'Todos').map(c=>c.id)).toEqual(['customer-1'])
  expect(searchClients(demoClients,'nada coincide','Todos')).toEqual([])
  expect(searchClients(demoClients,'camila','Pendiente')).toEqual([])
 })
 it('cada vehículo tiene un propietario válido y una identidad coherente con órdenes',()=>{
  expect(demoClients).toHaveLength(5)
  expect(new Set(demoVehicles.map(v=>v.id)).size).toBe(demoVehicles.length)
  for(const v of demoVehicles){
   const client=demoClients.find(c=>c.id===v.clientId)!
   expect(client).toBeDefined()
   expect(ordersForVehicle(v.id)).not.toHaveLength(0)
   for(const order of ordersForVehicle(v.id)){
    expect(order.vehicle).toBe(v.description)
    expect(order.mileage).toBe(v.mileage)
    expect(order.client.replace(/ · DEMO$/,'')).toBe(client.name)
   }
  }
 })
 it('no mezcla historial ni pendientes al cambiar de vehículo o cliente',()=>{
  const first=vehiclesForClient('customer-1'),second=vehiclesForClient('customer-2')
  expect(first).toHaveLength(2)
  expect(historyForVehicle(first[0].id).every(h=>h.vehicleId===first[0].id)).toBe(true)
  expect(historyForVehicle(first[1].id).every(h=>h.vehicleId!==first[0].id)).toBe(true)
  expect(observationsForVehicle('customer-1',second[0].id)).toEqual([])
  expect(observationsForVehicle('customer-1',first[0].id)).toHaveLength(3)
  for(const o of demoObservations)expect(ordersForVehicle(o.vehicleId).some(order=>order.id===o.orderId)).toBe(true)
  for(const h of demoHistory)if(h.orderId)expect(demoWorkOrders.some(o=>o.id===h.orderId&&o.plate===demoVehicles.find(v=>v.id===h.vehicleId)?.plate)).toBe(true)
  expect(vehiclesForClient('unknown')).toEqual([])
  expect(historyForVehicle('unknown')).toEqual([])
 })
 it('solo contiene contactos sintéticos sin identificador documental',()=>{
  expect(demoClients.every(c=>c.email.endsWith('@example.com')&&c.phone.startsWith('+56 9 0000'))).toBe(true)
  expect(demoClients.every(c=>!('rut' in c))).toBe(true)
 })
})
describe('Validación del formulario local',()=>{
 const valid={name:'Persona de muestra',email:'persona@example.com',phone:'+56 9 0000 0000',address:'',commune:'',consent:true}
 it('acepta móvil chileno y dirección/comuna opcionales',()=>{
  for(const phone of ['+56 9 0000 0000','900000000','56900000000','+56 (9) 0000-0000']) expect(validateRegistration({...valid,phone})).toEqual({})
 })
 it('rechaza campos obligatorios, formato y falta de confirmación',()=>{
  expect(Object.keys(validateRegistration({...valid,name:' ',email:'sin-correo',phone:'123',consent:false})).sort()).toEqual(['consent','email','name','phone'])
  for(const phone of ['+1 999 000 0000','+56 2 0000 0000','90000000','9000000000'])expect(validateRegistration({...valid,phone}).phone).toBeDefined()
 })
})
