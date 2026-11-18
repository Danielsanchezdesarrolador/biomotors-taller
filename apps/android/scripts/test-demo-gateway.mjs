/** BT-ANDROID-02: pruebas unitarias offline, sin credenciales ni red. Node 22.13+ */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  openDemoSession, createDemoGateway, DemoReadError,
} from '../data/demoGateway.ts'

const NOW = Date.UTC(2026,10,18,13)
const a = openDemoSession('demo-a','administrador',NOW)
const b = openDemoSession('demo-b','administrador',NOW)
const mechanic = openDemoSession('demo-a','mecanico',NOW)
const gateway = createDemoGateway('none',()=>NOW+1000)

function code(fn, expected) {
  assert.throws(fn,err=>err instanceof DemoReadError && err.code===expected)
}
test('sin sesión: las 5 lecturas fallan cerradas',()=>{
  code(()=>gateway.listOrders(null),'SESSION_REQUIRED')
  code(()=>gateway.listCustomers(null),'SESSION_REQUIRED')
  code(()=>gateway.listVehicles(null),'SESSION_REQUIRED')
  code(()=>gateway.listQuotes(null),'SESSION_REQUIRED')
  code(()=>gateway.getWorkshop(null),'SESSION_REQUIRED')
})
test('aislamiento A/B en órdenes, clientes, vehículos, cotizaciones y taller',()=>{
  for (const [session,other] of [[a,b],[b,a]]) {
    const id=session.workshopId
    for (const resource of ['listOrders','listCustomers','listVehicles','listQuotes']) {
      const result=gateway[resource](session)
      assert.ok(result.length>0)
      assert.ok(result.every(row=>row.workshopId===id))
      const otherIds=new Set(gateway[resource](other).map(row=>row.id))
      assert.ok(result.every(row=>!otherIds.has(row.id)))
    }
    assert.equal(gateway.getWorkshop(session).id,id)
  }
})
test('acceso directo a ficha ajena o inexistente falla cerrado',()=>{
  code(()=>gateway.getOrder(a,'OT-B-9001'),'NOT_FOUND')
  code(()=>gateway.getOrder(b,'OT-1001'),'NOT_FOUND')
  code(()=>gateway.getQuote(a,'COT-DEMO-B01'),'NOT_FOUND')
  code(()=>gateway.getQuote(b,'COT-DEMO-001'),'NOT_FOUND')
  code(()=>gateway.listHistory(a,'VEH-B-1'),'NOT_FOUND')
  code(()=>gateway.listHistory(b,'VEH-A-1'),'NOT_FOUND')
  code(()=>gateway.getQuote(a,'COT-NO-EXISTE'),'NOT_FOUND')
})
test('mecánico solo ve OT asignadas; directorio, historial, informes y configuración bloqueados',()=>{
  assert.deepEqual(gateway.listOrders(mechanic).map(o=>o.id),['OT-1001','OT-1002'])
  code(()=>gateway.getOrder(mechanic,'OT-1003'),'NOT_FOUND')
  code(()=>gateway.listCustomers(mechanic),'FORBIDDEN')
  code(()=>gateway.listVehicles(mechanic),'FORBIDDEN')
  code(()=>gateway.listHistory(mechanic,'VEH-A-1'),'FORBIDDEN')
  code(()=>gateway.listQuotes(mechanic),'FORBIDDEN')
  code(()=>gateway.getQuote(mechanic,'COT-DEMO-001'),'FORBIDDEN')
  code(()=>gateway.getWorkshop(mechanic),'FORBIDDEN')
})
test('historial filtrado por vehículo y taller, sin visitas cruzadas',()=>{
  const history=gateway.listHistory(a,'VEH-A-1')
  assert.equal(history.length,2)
  assert.ok(history.every(v=>v.vehicleId==='VEH-A-1'&&v.workshopId==='demo-a'))
  assert.deepEqual(gateway.listHistory(b,'VEH-B-1').map(v=>v.id),['VIS-B-1'])
})
test('coherencia entre FK ficticias de clientes, vehículos, OT, cotizaciones e historial',()=>{
  for(const session of [a,b]){
    const customerIds=new Set(gateway.listCustomers(session).map(c=>c.id))
    const vehicleIds=new Set(gateway.listVehicles(session).map(v=>v.id))
    const orderIds=new Set(gateway.listOrders(session).map(o=>o.id))
    gateway.listVehicles(session).forEach(v=>assert.ok(customerIds.has(v.customerId)))
    gateway.listOrders(session).forEach(o=>{
      assert.ok(customerIds.has(o.customerId));assert.ok(vehicleIds.has(o.vehicleId))
      gateway.listHistory(session,o.vehicleId).forEach(v=>assert.ok(orderIds.has(v.orderId)))
    })
    gateway.listQuotes(session).forEach(q=>{
      assert.ok(orderIds.has(q.orderId))
      assert.equal(q.totalClp,q.lines.reduce((sum,l)=>sum+l.amountClp,0))
    })
  }
})
test('sesión vencida: cero lecturas, incluso con ID correcto',()=>{
  const expired={...a,expiresAt:NOW-1}
  code(()=>gateway.listOrders(expired),'SESSION_EXPIRED')
  code(()=>gateway.getOrder(expired,'OT-1001'),'SESSION_EXPIRED')
  code(()=>gateway.listQuotes(expired),'SESSION_EXPIRED')
})
test('fallo de conexión y error interno simulados, sin datos filtrados',()=>{
  code(()=>createDemoGateway('offline',()=>NOW).listOrders(a),'OFFLINE')
  code(()=>createDemoGateway('offline',()=>NOW).listHistory(a,'VEH-A-1'),'OFFLINE')
  code(()=>createDemoGateway('server-error',()=>NOW).listCustomers(a),'SERVER_ERROR')
})
test('reintento tras restablecer modo: consulta desde nueva instancia',()=>{
  const down=createDemoGateway('offline',()=>NOW)
  code(()=>down.listOrders(a),'OFFLINE')
  assert.equal(createDemoGateway('none',()=>NOW).listOrders(a).length,4)
})
test('lecturas no mutan fixtures entre consultas',()=>{
  const first=gateway.listOrders(a)
  first[0].client='Alterado solo en copia local'
  assert.notEqual(gateway.listOrders(a)[0].client,first[0].client)
  const q=gateway.listQuotes(a)
  q[0].lines[0].amountClp=-1
  assert.equal(gateway.listQuotes(a)[0].lines[0].amountClp,69000)
})
