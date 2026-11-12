import { demoWorkOrders, type InspectionState, type WorkOrder } from './ordenesData'
import { exampleItems, initialInspection, inspectionItems, type LineItem } from './detalleData'
export type OrderRevision = { order:WorkOrder; inspection:Record<string,InspectionState>; items:LineItem[] }
// Page-memory only. Nothing is stored in localStorage, IndexedDB or a server.
const revisions=new Map<string,OrderRevision>()
const clone=(revision:OrderRevision):OrderRevision=>({order:{...revision.order,pending:[...revision.order.pending]},inspection:{...revision.inspection},items:revision.items.map(i=>({...i}))})
export function baseOrderRevision(order:WorkOrder):OrderRevision {return clone({order,inspection:order.id==='OT-1002'?initialInspection:Object.fromEntries(inspectionItems.map(([key])=>[key,'no-revisado'])),items:order.id==='OT-1002'?exampleItems:[]})}
export function readOrderRevision(order:WorkOrder):OrderRevision {
 const saved=revisions.get(order.id)
 return clone(saved??baseOrderRevision(order))
}
export function writeOrderRevision(revision:OrderRevision) { revisions.set(revision.order.id,clone(revision)) }
export function sessionOrders():WorkOrder[] {return [...new Map([...demoWorkOrders,...[...revisions.values()].map(r=>r.order)].map(o=>[o.id,o])).values()]}
