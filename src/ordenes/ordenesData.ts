// BT-UI-03: datos exclusivamente ficticios para la vista de Órdenes de trabajo.
// No contiene conexiones remotas, persistencia ni información de clientes reales.
export type WorkStatus = 'diagnostico' | 'servicio' | 'repuestos' | 'entrega' | 'finalizada'
export type InspectionState = 'correcto' | 'atencion' | 'no-revisado'
export type WorkOrder = {
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

export const demoWorkOrders: WorkOrder[] = [
  { id: 'OT-1001', client: 'Camila Muñoz Rojas · DEMO', vehicle: 'Toyota Corolla · 2020', plate: 'DEMO-01', service: 'Mantención de 10.000 km', date: '11-11-2026', mileage: 60000, status: 'diagnostico', technician: 'Técnico DEMO A', symptoms: 'Vibración leve al frenar.', diagnosis: 'Pendiente de confirmar desgaste de frenos.', recommendation: 'Revisar sistema de frenos y fluidos.', pending: ['Revisar desgaste de pastillas traseras en la próxima visita.', 'Revisar ruido en suspensión delantera.', 'Evaluar posible fuga de aceite del motor.'] },
  { id: 'OT-1002', client: 'María Torres · DEMO', vehicle: 'Hyundai Tucson · 2021', plate: 'DEMO-KZV-482', service: 'Revisión de frenos', date: '11 nov. 2026', mileage: 68430, status: 'servicio', technician: 'Carlos Méndez · DEMO', symptoms: 'El cliente reporta vibraciones en el volante al frenar, además de un ruido metálico leve en la parte delantera derecha. Solicita revisión general del sistema de frenos.', diagnosis: 'Se detecta desgaste avanzado en pastillas de freno delanteras (≈ 15%). Discos con leve alabeo.', recommendation: 'Se recomienda reemplazo de pastillas y rectificado de discos.', pending: ['Confirmar con el cliente el reemplazo de pastillas y rectificado de discos.', 'Esperar disponibilidad de repuestos.', 'Realizar prueba de ruta luego del servicio.'] },
  { id: 'OT-1003', client: 'Paula Fernández Ortega · DEMO', vehicle: 'Chevrolet Tracker · 2022', plate: 'DEMO-03', service: 'Cambio de aceite y filtros', date: '10-11-2026', mileage: 32400, status: 'repuestos', technician: 'Técnico DEMO A', symptoms: 'Mantención programada.', diagnosis: 'Revisión sin anomalías urgentes.', recommendation: 'Esperar filtro compatible.', pending: ['Filtro de habitáculo pendiente por disponibilidad.'] },
  { id: 'OT-1004', client: 'Javier Silva Torres · DEMO', vehicle: 'Mitsubishi L200 · 2019', plate: 'DEMO-04', service: 'Diagnóstico de motor', date: '10-11-2026', mileage: 86500, status: 'entrega', technician: 'Técnico DEMO C', symptoms: 'Testigo de motor encendido.', diagnosis: 'Falla intermitente de sensor.', recommendation: 'Entregar recomendaciones al cliente.', pending: ['Verificar sensor en control posterior.'] },
  { id: 'OT-1005', client: 'Camila Muñoz Rojas · DEMO', vehicle: 'Suzuki Swift · 2018', plate: 'DEMO-05', service: 'Mantención preventiva', date: '09-11-2026', mileage: 75400, status: 'servicio', technician: 'Técnico DEMO B', symptoms: 'Revisión anual.', diagnosis: 'Inspección en curso.', recommendation: 'Revisar suspensión delantera.', pending: ['Vigilar ruido leve en suspensión.'] },
  { id: 'OT-1006', client: 'Javier Silva Torres · DEMO', vehicle: 'Kia Rio 5 · 2020', plate: 'DEMO-06', service: 'Revisión de suspensión', date: '09-11-2026', mileage: 52200, status: 'diagnostico', technician: 'Técnico DEMO A', symptoms: 'Golpeteo al pasar por baches.', diagnosis: 'Diagnóstico de tren delantero en curso.', recommendation: 'Revisar bujes y amortiguadores.', pending: ['Revisar alineación al finalizar.'] },
  { id: 'OT-1007', client: 'Valentina Araya León · DEMO', vehicle: 'Nissan Navara · 2021', plate: 'DEMO-07', service: 'Revisión eléctrica', date: '08-11-2026', mileage: 63800, status: 'repuestos', technician: 'Técnico DEMO C', symptoms: 'Arranque intermitente.', diagnosis: 'Pendiente de reemplazo de batería de prueba.', recommendation: 'Evaluar sistema de carga.', pending: ['Comprobar carga del alternador.'] },
  { id: 'OT-1008', client: 'Valentina Araya León · DEMO', vehicle: 'Mazda CX-5 · 2022', plate: 'DEMO-08', service: 'Control de seguridad', date: '08-11-2026', mileage: 28600, status: 'entrega', technician: 'Técnico DEMO B', symptoms: 'Inspección preventiva.', diagnosis: 'Controles básicos realizados.', recommendation: 'Programar próxima mantención.', pending: [] },
]

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
