/** BT-PILOT-QA-02: navegación sintética Android. No renderiza UI ni conecta red. */
import test from 'node:test'
import assert from 'node:assert/strict'
import { createDemoGateway, openDemoSession, DemoReadError } from '../data/demoGateway.ts'
import { resolveDemoRoute } from '../navigation/demoRoutes.ts'

const now=Date.UTC(2026,10,18,14)
const a=openDemoSession('demo-a','administrador',now)
const b=openDemoSession('demo-b','administrador',now)
const mechanic=openDemoSession('demo-a','mecanico',now)
const gateway=createDemoGateway('none',()=>now+1000)
function denied(fn,code) {
  assert.throws(fn,error=>error instanceof DemoReadError&&error.code===code)
}
test('inicio A → OT de A → cotización A → OT; ID y foco correctos',()=>{
  const order=resolveDemoRoute(a,gateway,'ordenes','OT-1002')
  assert.deepEqual(order,{section:'ordenes',focusedOrderId:'OT-1002'})
  const quote=resolveDemoRoute(a,gateway,'informes',order.focusedOrderId)
  assert.deepEqual(quote,{section:'informes',focusedOrderId:'OT-1002'})
  assert.equal(gateway.listQuotes(a).find(q=>q.orderId===quote.focusedOrderId)?.id,'COT-DEMO-001')
  assert.deepEqual(resolveDemoRoute(a,gateway,'ordenes',quote.focusedOrderId),order)
})
test('visita A → historial del vehículo A → OT; no fuga de B',()=>{
  const history=gateway.listHistory(a,'VEH-A-1')
  assert.equal(history.length,2)
  assert.ok(history.every(v=>v.vehicleId==='VEH-A-1'))
  for(const visit of history) assert.equal(resolveDemoRoute(a,gateway,'ordenes',visit.orderId).focusedOrderId,'OT-1001')
  denied(()=>resolveDemoRoute(a,gateway,'ordenes','OT-B-9001'),'NOT_FOUND')
  denied(()=>resolveDemoRoute(a,gateway,'informes','OT-B-9001'),'NOT_FOUND')
  denied(()=>gateway.listHistory(b,'VEH-A-1'),'NOT_FOUND')
})
test('cambio de pantalla normal elimina selección anterior: no regresa un ID oculto',()=>{
  const selected=resolveDemoRoute(a,gateway,'ordenes','OT-1002')
  assert.equal(selected.focusedOrderId,'OT-1002')
  for(const tab of ['inicio','clientes','ordenes','informes','configuracion']) {
    assert.deepEqual(resolveDemoRoute(a,gateway,tab),{section:tab})
  }
})
test('sin sesión o con sesión vencida no se abre ficha mediante enlace',()=>{
  denied(()=>resolveDemoRoute(null,gateway,'ordenes','OT-1001'),'SESSION_REQUIRED')
  denied(()=>resolveDemoRoute({...a,expiresAt:now-1},gateway,'ordenes','OT-1001'),'SESSION_EXPIRED')
  denied(()=>resolveDemoRoute({...a,expiresAt:now-1},gateway,'informes','OT-1002'),'SESSION_EXPIRED')
})
test('rol mecánico no puede abrir cotizaciones aunque la OT esté asignada',()=>{
  assert.equal(resolveDemoRoute(mechanic,gateway,'ordenes','OT-1002').focusedOrderId,'OT-1002')
  denied(()=>resolveDemoRoute(mechanic,gateway,'informes','OT-1002'),'FORBIDDEN')
  denied(()=>resolveDemoRoute(mechanic,gateway,'ordenes','OT-1004'),'NOT_FOUND')
})
test('taller B no reutiliza foco de A, ni siquiera al entrar desde informes',()=>{
  denied(()=>resolveDemoRoute(b,gateway,'ordenes','OT-1002'),'NOT_FOUND')
  denied(()=>resolveDemoRoute(b,gateway,'informes','OT-1002'),'NOT_FOUND')
  assert.equal(resolveDemoRoute(b,gateway,'ordenes','OT-B-9001').focusedOrderId,'OT-B-9001')
  assert.equal(resolveDemoRoute(b,gateway,'informes','OT-B-9001').focusedOrderId,'OT-B-9001')
})
test('OT sin cotización no abre detalle inventado ni reutiliza el anterior',()=>{
  denied(()=>resolveDemoRoute(a,gateway,'informes','OT-1003'),'NOT_FOUND')
  denied(()=>resolveDemoRoute(a,gateway,'ordenes','   '),'NOT_FOUND')
  denied(()=>resolveDemoRoute(a,gateway,'clientes','OT-1001'),'FORBIDDEN')
})
test('sin conexión/error de servicio niega deep link; recuperación exige consulta nueva',()=>{
  for(const mode of ['offline','server-error']) {
    const failing=createDemoGateway(mode,()=>now)
    denied(()=>resolveDemoRoute(a,failing,'ordenes','OT-1002'),mode==='offline'?'OFFLINE':'SERVER_ERROR')
  }
  const fresh=createDemoGateway('none',()=>now)
  assert.equal(resolveDemoRoute(a,fresh,'ordenes','OT-1002').focusedOrderId,'OT-1002')
})
test('entrada por tabs en modo offline solo cambia pantalla; la consulta posterior sigue cerrada',()=>{
  const offline=createDemoGateway('offline',()=>now)
  assert.deepEqual(resolveDemoRoute(a,offline,'clientes'),{section:'clientes'})
  denied(()=>offline.listCustomers(a),'OFFLINE')
})
