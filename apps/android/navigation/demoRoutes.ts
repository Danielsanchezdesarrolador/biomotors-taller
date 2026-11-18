/** BT-PILOT-QA-02 · Deep links verificados en el laboratorio Android OFFLINE.
 * No es autorización productiva: el backend real debe validar identidad/RLS.
 */
import {
  DemoReadError,
  type DemoSession,
  type DemoQuote,
} from '../data/demoGateway.ts'

export type DemoSection = 'inicio' | 'ordenes' | 'clientes' | 'informes' | 'configuracion'
export type DemoRoute = Readonly<{section:DemoSection;focusedOrderId?:string}>
export type DemoRouteGateway = Readonly<{
  getOrder:(session:DemoSession|null,id:string)=>{id:string}
  listQuotes:(session:DemoSession|null)=>DemoQuote[]
}>

/** Navegar sin ID limpia siempre el foco anterior; ningún ID ajeno pasa silenciosamente. */
export function resolveDemoRoute(
  session:DemoSession|null,
  gateway:DemoRouteGateway,
  section:DemoSection,
  linkedOrderId?:string,
):DemoRoute {
  if(!session) throw new DemoReadError('SESSION_REQUIRED')
  if(linkedOrderId===undefined) return {section}
  if(!linkedOrderId.trim()) throw new DemoReadError('NOT_FOUND')
  if(section!=='ordenes' && section!=='informes') throw new DemoReadError('FORBIDDEN')
  const order=gateway.getOrder(session,linkedOrderId)
  if(section==='informes') {
    const related=gateway.listQuotes(session).some(q=>q.orderId===order.id)
    if(!related) throw new DemoReadError('NOT_FOUND')
  }
  return {section,focusedOrderId:order.id}
}
