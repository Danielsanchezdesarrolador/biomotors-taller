/** BT-ANDROID-02: contrato de lectura OFFLINE. No es Auth ni autorización de servidor.
 * Exclusivamente fixtures sintéticos; NUNCA usar este módulo para decidir permisos reales.
 */
export type DemoWorkshopId = 'demo-a' | 'demo-b'
export type DemoRole = 'administrador' | 'mecanico'
export type DemoFailureMode = 'none' | 'offline' | 'server-error'
export type DemoErrorCode = 'SESSION_REQUIRED' | 'SESSION_EXPIRED' | 'FORBIDDEN' | 'OFFLINE' | 'SERVER_ERROR' | 'NOT_FOUND'
export type DemoOrderState = 'diagnostico' | 'servicio' | 'repuestos' | 'entrega'
export type DemoSession = Readonly<{
  workshopId: DemoWorkshopId
  role: DemoRole
  actorId: string
  expiresAt: number
}>
export type DemoOrder = Readonly<{
  id: string; workshopId: DemoWorkshopId; customerId: string; vehicleId: string
  client: string; vehicle: string; plate: string; service: string
  state: DemoOrderState; odometer: string; assignedTo: 'administrador' | 'mecanico'
}>
export type DemoCustomer = Readonly<{id: string; workshopId: DemoWorkshopId; name: string}>
export type DemoVehicle = Readonly<{
  id: string; workshopId: DemoWorkshopId; customerId: string
  label: string; plate: string; odometer: string
}>
export type DemoQuoteLine = Readonly<{label: string; amountClp: number}>
export type DemoQuote = Readonly<{
  id: string; workshopId: DemoWorkshopId; orderId: string
  title: string; client: string; vehicle: string; status: string
  lines: readonly DemoQuoteLine[]; totalClp: number
}>
export type DemoVisit = Readonly<{
  id: string; workshopId: DemoWorkshopId; vehicleId: string
  orderId: string; date: string; summary: string; quoteId?: string
}>
export type DemoWorkshop = Readonly<{id: DemoWorkshopId; name: string; plan: string}>
export class DemoReadError extends Error {
  constructor(public readonly code: DemoErrorCode) {
    super(code)
    this.name = 'DemoReadError'
  }
}
export function demoErrorText(error: unknown): string {
  const code = error instanceof DemoReadError ? error.code : 'SERVER_ERROR'
  const messages: Record<DemoErrorCode, string> = {
    SESSION_REQUIRED: 'Selecciona una sesión ficticia para consultar este módulo.',
    SESSION_EXPIRED: 'La sesión de prueba venció. Cierra la sesión e ingresa nuevamente.',
    FORBIDDEN: 'Este rol de demostración no tiene acceso a esta sección.',
    OFFLINE: 'Sin conexión simulada. Los datos no están disponibles; reintenta al restablecerla.',
    SERVER_ERROR: 'Error de lectura simulado. Vuelve a intentar después de restablecer el servicio.',
    NOT_FOUND: 'Este registro no pertenece al taller seleccionado o no existe.',
  }
  return messages[code]
}
export function openDemoSession(
  workshopId: DemoWorkshopId, role: DemoRole, now: number = Date.now(),
): DemoSession {
  return {
    workshopId, role, actorId: `actor-${workshopId}-${role}`,
    expiresAt: now + 30 * 60 * 1000,
  }
}

// Los ID/placas/nombres son deliberadamente imposibles de confundir con datos productivos.
const workshops: readonly DemoWorkshop[] = [
  {id: 'demo-a', name: 'Taller ficticio A', plan: 'Full de simulación'},
  {id: 'demo-b', name: 'Taller ficticio B', plan: 'Plus de simulación'},
]
const customers: readonly DemoCustomer[] = [
  {id:'CLI-A-1',workshopId:'demo-a',name:'Cliente ficticio A1'},
  {id:'CLI-A-2',workshopId:'demo-a',name:'Cliente ficticio A2'},
  {id:'CLI-A-3',workshopId:'demo-a',name:'Cliente ficticio A3'},
  {id:'CLI-A-4',workshopId:'demo-a',name:'Cliente ficticio A4'},
  {id:'CLI-B-1',workshopId:'demo-b',name:'Cliente ficticio B1'},
]
const vehicles: readonly DemoVehicle[] = [
  {id:'VEH-A-1',workshopId:'demo-a',customerId:'CLI-A-1',label:'Toyota Corolla · 2020',plate:'DEMO-01',odometer:'68.420 km'},
  {id:'VEH-A-2',workshopId:'demo-a',customerId:'CLI-A-2',label:'Hyundai Tucson · 2021',plate:'DEMO-02',odometer:'91.850 km'},
  {id:'VEH-A-3',workshopId:'demo-a',customerId:'CLI-A-3',label:'Chevrolet Tracker · 2022',plate:'DEMO-03',odometer:'42.700 km'},
  {id:'VEH-A-4',workshopId:'demo-a',customerId:'CLI-A-4',label:'Mitsubishi L200 · 2019',plate:'DEMO-04',odometer:'125.310 km'},
  {id:'VEH-B-1',workshopId:'demo-b',customerId:'CLI-B-1',label:'Vehículo ficticio B · 2024',plate:'DEMO-B1',odometer:'5.000 km'},
]
const orders: readonly DemoOrder[] = [
  {id:'OT-1001',workshopId:'demo-a',customerId:'CLI-A-1',vehicleId:'VEH-A-1',client:'Cliente ficticio A1',vehicle:'Toyota Corolla · 2020',plate:'DEMO-01',service:'Mantención de 10.000 km',state:'diagnostico',odometer:'68.420 km',assignedTo:'mecanico'},
  {id:'OT-1002',workshopId:'demo-a',customerId:'CLI-A-2',vehicleId:'VEH-A-2',client:'Cliente ficticio A2',vehicle:'Hyundai Tucson · 2021',plate:'DEMO-02',service:'Revisión de frenos',state:'servicio',odometer:'91.850 km',assignedTo:'mecanico'},
  {id:'OT-1003',workshopId:'demo-a',customerId:'CLI-A-3',vehicleId:'VEH-A-3',client:'Cliente ficticio A3',vehicle:'Chevrolet Tracker · 2022',plate:'DEMO-03',service:'Cambio de aceite',state:'repuestos',odometer:'42.700 km',assignedTo:'administrador'},
  {id:'OT-1004',workshopId:'demo-a',customerId:'CLI-A-4',vehicleId:'VEH-A-4',client:'Cliente ficticio A4',vehicle:'Mitsubishi L200 · 2019',plate:'DEMO-04',service:'Diagnóstico de motor',state:'entrega',odometer:'125.310 km',assignedTo:'administrador'},
  {id:'OT-B-9001',workshopId:'demo-b',customerId:'CLI-B-1',vehicleId:'VEH-B-1',client:'Cliente ficticio B1',vehicle:'Vehículo ficticio B · 2024',plate:'DEMO-B1',service:'Inspección de muestra B',state:'diagnostico',odometer:'5.000 km',assignedTo:'mecanico'},
]
const quotes: readonly DemoQuote[] = [
  {id:'COT-DEMO-001',workshopId:'demo-a',orderId:'OT-1002',title:'Revisión de frenos',client:'Cliente ficticio A2',vehicle:'Hyundai Tucson',status:'Borrador de demostración',lines:[{label:'Repuestos ficticios',amountClp:69000},{label:'Mano de obra ficticia',amountClp:38411}],totalClp:107411},
  {id:'COT-DEMO-002',workshopId:'demo-a',orderId:'OT-1001',title:'Mantención preventiva',client:'Cliente ficticio A1',vehicle:'Toyota Corolla',status:'Borrador de demostración',lines:[{label:'Insumos ficticios',amountClp:39900},{label:'Mano de obra ficticia',amountClp:45000}],totalClp:84900},
  {id:'COT-DEMO-B01',workshopId:'demo-b',orderId:'OT-B-9001',title:'Inspección B',client:'Cliente ficticio B1',vehicle:'Vehículo ficticio B',status:'Borrador de demostración',lines:[{label:'Evaluación ficticia',amountClp:12000}],totalClp:12000},
]
const visits: readonly DemoVisit[] = [
  {id:'VIS-A-1',workshopId:'demo-a',vehicleId:'VEH-A-1',orderId:'OT-1001',date:'2026-10-05',summary:'Visita ficticia: revisión preventiva',quoteId:'COT-DEMO-002'},
  {id:'VIS-A-2',workshopId:'demo-a',vehicleId:'VEH-A-1',orderId:'OT-1001',date:'2026-11-10',summary:'Visita ficticia: inspección de ejemplo'},
  {id:'VIS-A-3',workshopId:'demo-a',vehicleId:'VEH-A-2',orderId:'OT-1002',date:'2026-11-11',summary:'Visita ficticia: revisión de frenos',quoteId:'COT-DEMO-001'},
  {id:'VIS-A-4',workshopId:'demo-a',vehicleId:'VEH-A-3',orderId:'OT-1003',date:'2026-11-12',summary:'Visita ficticia: lubricación'},
  {id:'VIS-A-5',workshopId:'demo-a',vehicleId:'VEH-A-4',orderId:'OT-1004',date:'2026-11-13',summary:'Visita ficticia: diagnóstico'},
  {id:'VIS-B-1',workshopId:'demo-b',vehicleId:'VEH-B-1',orderId:'OT-B-9001',date:'2026-11-14',summary:'Visita ficticia exclusiva del taller B',quoteId:'COT-DEMO-B01'},
]

/** Inyección de reloj/fallo para verificar el contrato de errores sin red. */
export function createDemoGateway(mode: DemoFailureMode = 'none', now: () => number = Date.now) {
  function permit(session: DemoSession | null, resource: 'orders' | 'directory' | 'quotes' | 'settings') {
    if (!session) throw new DemoReadError('SESSION_REQUIRED')
    if (session.expiresAt <= now()) throw new DemoReadError('SESSION_EXPIRED')
    if (mode === 'offline') throw new DemoReadError('OFFLINE')
    if (mode === 'server-error') throw new DemoReadError('SERVER_ERROR')
    if (resource !== 'orders' && session.role !== 'administrador') throw new DemoReadError('FORBIDDEN')
    if (!workshops.some(w => w.id === session.workshopId)) throw new DemoReadError('FORBIDDEN')
    return session
  }
  const listOrders = (session: DemoSession | null): DemoOrder[] => {
    const actor = permit(session, 'orders')
    return orders.filter(o => o.workshopId === actor.workshopId &&
      (actor.role === 'administrador' || o.assignedTo === 'mecanico')).map(o => ({...o}))
  }
  const getOrder = (session: DemoSession | null, id: string): DemoOrder => {
    const item = listOrders(session).find(o => o.id === id)
    if (!item) throw new DemoReadError('NOT_FOUND')
    return item
  }
  const listCustomers = (session: DemoSession | null): DemoCustomer[] => {
    const actor = permit(session, 'directory')
    return customers.filter(c => c.workshopId === actor.workshopId).map(c => ({...c}))
  }
  const listVehicles = (session: DemoSession | null): DemoVehicle[] => {
    const actor = permit(session, 'directory')
    return vehicles.filter(v => v.workshopId === actor.workshopId).map(v => ({...v}))
  }
  const listHistory = (session: DemoSession | null, vehicleId: string): DemoVisit[] => {
    const actor = permit(session, 'directory')
    if (!vehicles.some(v => v.id === vehicleId && v.workshopId === actor.workshopId))
      throw new DemoReadError('NOT_FOUND')
    return visits.filter(v => v.vehicleId === vehicleId && v.workshopId === actor.workshopId).map(v => ({...v}))
  }
  const listQuotes = (session: DemoSession | null): DemoQuote[] => {
    const actor = permit(session, 'quotes')
    return quotes.filter(q => q.workshopId === actor.workshopId).map(q => ({...q,lines:q.lines.map(l=>({...l}))}))
  }
  const getQuote = (session: DemoSession | null, id: string): DemoQuote => {
    const item = listQuotes(session).find(q => q.id === id)
    if (!item) throw new DemoReadError('NOT_FOUND')
    return item
  }
  const getWorkshop = (session: DemoSession | null): DemoWorkshop => {
    const actor = permit(session, 'settings')
    const item = workshops.find(w => w.id === actor.workshopId)
    if (!item) throw new DemoReadError('NOT_FOUND')
    return {...item}
  }
  return {listOrders,getOrder,listCustomers,listVehicles,listHistory,listQuotes,getQuote,getWorkshop}
}
