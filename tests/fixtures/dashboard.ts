// Todos los datos de esta vista son ficticios. Prohibido tratarlos como datos reales.
export type OrderStatus = { key: 'diagnostico' | 'servicio' | 'repuestos' | 'entrega'; label: string; count: number; color: string }
export type DemoOrder = { id: string; vehicle: string; work: string; plate: string; status: OrderStatus }

export const orderStatuses: OrderStatus[] = [
  { key: 'diagnostico', label: 'En diagnóstico', count: 4, color: '#1688ff' },
  { key: 'servicio', label: 'En servicio', count: 6, color: '#ffc11d' },
  { key: 'repuestos', label: 'Por repuestos', count: 5, color: '#9852f3' },
  { key: 'entrega', label: 'Listas para entrega', count: 3, color: '#1cc75c' },
]

export const demoOrders: DemoOrder[] = [
  { id: 'OT-1001', vehicle: 'Toyota Corolla · 2020', work: 'Mantención de 10.000 km', plate: 'DEMO-01', status: orderStatuses[0] },
  { id: 'OT-1002', vehicle: 'Hyundai Tucson · 2021', work: 'Revisión de frenos', plate: 'DEMO-02', status: orderStatuses[1] },
  { id: 'OT-1003', vehicle: 'Chevrolet Tracker · 2022', work: 'Cambio de aceite', plate: 'DEMO-03', status: orderStatuses[2] },
  { id: 'OT-1004', vehicle: 'Mitsubishi L200 · 2019', work: 'Diagnóstico de motor', plate: 'DEMO-04', status: orderStatuses[3] },
]

export const demoActivities = [
  { id: 'demo-1', title: 'Orden de ejemplo creada', description: 'OT-1001 · Toyota Corolla', time: '11:42', type: 'work' },
  { id: 'demo-2', title: 'Informe de muestra', description: 'OT-1002 · Sin correo real', time: '11:18', type: 'document' },
  { id: 'demo-3', title: 'Revisión simulada finalizada', description: 'OT-1004 · Ejemplo', time: '10:55', type: 'success' },
] as const

export function getDashboardMetrics() {
  return { active: orderStatuses.reduce((total, status) => total + status.count, 0), vehicles: 14, reports: 6, estimates: 5 }
}

export function filterDemoOrders(query: string, statusKey = 'todas'): DemoOrder[] {
  const q = query.trim().toLocaleLowerCase('es-CL')
  return demoOrders.filter(order => (statusKey === 'todas' || order.status.key === statusKey) &&
    (!q || [order.id, order.vehicle, order.work, order.plate].some(value => value.toLocaleLowerCase('es-CL').includes(q))))
}
