import { orderFixtures } from '#test-records'
// BT-UI-03: datos exclusivamente ficticios para la vista de Órdenes de trabajo.
// No contiene conexiones remotas, persistencia ni información de clientes reales.
export type WorkStatus = 'diagnostico' | 'servicio' | 'repuestos' | 'entrega' | 'finalizada'
export type InspectionState = 'correcto' | 'atencion' | 'no-revisado'
export type WorkOrder = {
  clientId?: string
  vehicleId?: string
  visitId?: string
  id: string
  client: string
  vehicle: string
  plate: string
  service: string
  date: string
  mileage: number
  status: WorkStatus
  technician: string
  symptoms: string
  diagnosis: string
  recommendation: string
  pending: string[]
}

export const workStatusLabels: Record<WorkStatus, string> = {
  diagnostico: 'En diagnóstico',
  servicio: 'En servicio',
  repuestos: 'Por repuestos',
  entrega: 'Lista para entrega',
  finalizada: 'Finalizada',
}

export const workStatusSequence: WorkStatus[] = ['diagnostico', 'servicio', 'repuestos', 'entrega', 'finalizada']

export const demoWorkOrders: WorkOrder[] = structuredClone(orderFixtures)

export const inspectionCategories = [
  { key: 'motor', label: 'Motor' },
  { key: 'frenos', label: 'Sistema de frenos' },
  { key: 'suspension', label: 'Suspensión' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'neumaticos', label: 'Neumáticos' },
  { key: 'fluidos', label: 'Fluidos' },
  { key: 'electrico', label: 'Sistema eléctrico' },
] as const

export function searchWorkOrders(orders: WorkOrder[], query: string, status: WorkStatus | 'todas') {
  const term = query.trim().toLocaleLowerCase('es-CL')
  return orders.filter(order => {
    if (status !== 'todas' && order.status !== status) return false
    return !term || [order.id, order.client, order.vehicle, order.plate, order.service].some(value =>
      value.toLocaleLowerCase('es-CL').includes(term))
  })
}

export function nextWorkStatus(status: WorkStatus): WorkStatus {
  const index = workStatusSequence.indexOf(status)
  return workStatusSequence[Math.min(index + 1, workStatusSequence.length - 1)]
}
