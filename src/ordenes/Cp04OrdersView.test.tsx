import {describe,it,expect,vi} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {Cp04OrdersView,type Cp04Port} from './Cp04OrdersView'
import type {Context} from '../auth/controller'
const scope:Context={userId:'11111111-1111-4111-8111-111111111111',
role:'owner',workshop:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',name:'Synthetic',status:'active'}}
function api():Cp04Port{
 const no=vi.fn(async()=>null)
 return {
  recentOrders:vi.fn(async()=>[]),
  getOrder:no,findVehicleByPlate:no,
  findingsForOrder:vi.fn(async()=>[]),
  pendingForVehicle:vi.fn(async()=>[]),
  createOrder:vi.fn(async()=>{throw Error('not in SSR')}),
  createFinding:vi.fn(async()=>{throw Error('not in SSR')}),
  setStatus:vi.fn(async()=>{throw Error('not in SSR')}),
  markResolved:vi.fn(async()=>{throw Error('not in SSR')})
 }
}
describe('CP04 private operational UI',()=>{
 it('uses official premium structure with real repository, never DEMO fixtures',()=>{
   const repo=api()
   const html=renderToStaticMarkup(<Cp04OrdersView repository={repo} context={scope}/>)
   expect(html).toContain('Órdenes de trabajo')
   expect(html).toContain('Nueva recepción')
   expect(html).toContain('Buscar patente registrada')
   expect(html).toContain('Guardar orden en Supabase')
   expect(html).not.toContain('OT-1002')
   expect(repo.recentOrders).not.toHaveBeenCalled()
 })
 it('does not let mechanic create an order',()=>{
   const repo=api()
   const html=renderToStaticMarkup(<Cp04OrdersView repository={repo}
     context={{...scope,role:'mechanic'}}/>)
   expect(html).toContain('no puede crear órdenes')
   expect(html).not.toContain('Guardar orden en Supabase')
 })
})
