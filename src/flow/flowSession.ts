import { demoClients, demoVehicles, vehicleForOrder } from '../clientes/clientesData'
import { receiveDirectory, type ReceptionInput } from '../clientes/directorySession'
import { sessionRequests } from '../clientes/intakeSession'
import { registerSessionOrder, sessionOrders } from '../ordenes/orderSession'
import type { WorkOrder } from '../ordenes/ordenesData'
import { sessionChanged } from '../session/sessionSignal'
import { createMultipunto } from '../informes/multipunto/multipuntoData'
import { readMultipunto, rememberMultipunto } from '../informes/multipunto/multipuntoSession'
import { createWorkDocument, type WorkMode } from '../informes/trabajos/trabajosData'
import { readWorkDocument, rememberWorkDocument } from '../informes/trabajos/trabajosSession'
export type FlowStage =
  | 'recepcion'
  | 'orden'
  | 'inspeccion'
  | 'propuesta'
  | 'cotizacion'
  | 'respuesta_cliente'
  | 'ejecucion'
  | 'informe_final'
  | 'entrega'
export type FlowResource = 'order' | 'inspection' | 'quote' | 'work'
export type FlowCase = {
  id: string
  workshopId: 'workshop-demo'
  clientId: string
  vehicleId: string
  intakeRequestId?: string
  orderId?: string
  inspectionId?: string
  quoteId?: string
  quoteRevision?: number
  workReportId?: string
  reception: { date: string; mileage: number; reason: string }
  status: 'en_curso' | 'borrador'
  lastContext?: { stage: FlowStage; resource: FlowResource; resourceId: string }
  updatedAt: string
  revision: number
}
export type StageState = 'pendiente' | 'en_curso' | 'completado' | 'bloqueado'
export const milestones = [
  { id: 'recepcion', label: 'Recepción del vehículo', detail: 'Cliente, vehículo y motivo' },
  { id: 'orden', label: 'Orden de trabajo', detail: 'Confirmación del operador' },
  { id: 'inspeccion', label: 'Inspección multipunto', detail: 'Revisión de 34 componentes' },
  {
    id: 'propuesta',
    label: 'Diagnóstico, trabajos y repuestos',
    detail: 'Definición humana de la propuesta'
  },
  { id: 'cotizacion', label: 'Cotización y respuesta', detail: 'Presupuesto y revisión DEMO' },
  { id: 'ejecucion', label: 'Ejecución e informe de trabajo', detail: 'Solo trabajos realizados' },
  { id: 'entrega', label: 'Entrega del vehículo', detail: 'Cierre guiado pendiente 01E' }
] as const
const cases = new Map<string, FlowCase>(),
  receptionKeys = new Map<string, string>()
let selectedId: string | undefined
export function allCases(): FlowCase[] {
  for (const order of sessionOrders()) {
    const vehicle = vehicleForOrder(order)
    if (!vehicle) continue
    const id = order.visitId ?? 'VIS-DEMO-' + order.id
    if (!cases.has(id))
      cases.set(id, {
        id,
        workshopId: 'workshop-demo',
        clientId: vehicle.clientId,
        vehicleId: vehicle.id,
        orderId: order.id,
        reception: { date: order.date, mileage: order.mileage, reason: order.symptoms },
        status: 'en_curso',
        updatedAt: '2026-11-11T00:00:00Z',
        revision: 0
      })
  }
  return [...cases.values()]
    .map((v) => structuredClone(v))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}
export function readCase(id: string) {
  allCases()
  const v = cases.get(id)
  if (!v) throw new Error('Expediente DEMO inexistente.')
  return structuredClone(v)
}
export function caseContext(id: string) {
  const visit = readCase(id),
    client = demoClients.find((c) => c.id === visit.clientId),
    vehicle = demoVehicles.find((v) => v.id === visit.vehicleId),
    order = sessionOrders().find((o) => o.id === visit.orderId)
  if (
    !client ||
    !vehicle ||
    vehicle.clientId !== client.id ||
    (order && vehicleForOrder(order)?.id !== vehicle.id)
  )
    throw new Error('Relación cliente–vehículo–visita–OT inconsistente.')
  return { visit, client, vehicle, order }
}
export function selectCase(id: string) {
  readCase(id)
  if (selectedId === id) return
  selectedId = id
  sessionChanged()
}
export function selectedCase() {
  return selectedId ? readCase(selectedId) : allCases()[0]
}
function updateCase(id: string, patch: Partial<FlowCase>) {
  const previous = readCase(id)
  cases.set(id, {
    ...previous,
    ...patch,
    revision: previous.revision + 1,
    updatedAt: new Date().toISOString()
  })
  sessionChanged()
  return readCase(id)
}
export function receiveVisit(input: ReceptionInput, key: string): FlowCase {
  const fingerprint = JSON.stringify(input)
  if (receptionKeys.has(key)) {
    if (receptionKeys.get(key) !== fingerprint)
      throw new Error(
        'Esta recepción ya fue confirmada con otros datos. Abre el expediente existente.'
      )
    return readCase(key)
  }
  if (input.requestId) {
    if (!sessionRequests().some((r) => r.id === input.requestId))
      throw new Error('Solicitud inexistente.')
    const previous = allCases().find((v) => v.intakeRequestId === input.requestId)
    if (previous) return previous
  }
  const { client, vehicle } = receiveDirectory(input)
  const visit: FlowCase = {
    id: key,
    workshopId: 'workshop-demo',
    clientId: client.id,
    vehicleId: vehicle.id,
    intakeRequestId: input.requestId,
    reception: {
      date: input.date,
      mileage: Number(input.draft.mileage),
      reason: input.draft.clientReportedReason.trim()
    },
    status: 'borrador',
    updatedAt: new Date().toISOString(),
    revision: 0
  }
  receptionKeys.set(key, fingerprint)
  cases.set(key, visit)
  selectedId = key
  sessionChanged()
  return structuredClone(visit)
}
export function confirmVisitOrder(id: string): WorkOrder {
  const { visit, client, vehicle, order } = caseContext(id)
  if (order) return order
  const created: WorkOrder = {
    id: 'OT-DEMO-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
    visitId: id,
    clientId: client.id,
    vehicleId: vehicle.id,
    client: client.name + ' · DEMO',
    vehicle: vehicle.description,
    plate: vehicle.plate,
    mileage: visit.reception.mileage,
    date: visit.reception.date,
    service: visit.reception.reason,
    symptoms: visit.reception.reason,
    diagnosis: '',
    recommendation: '',
    pending: [],
    technician: 'Sin asignar · DEMO',
    status: 'diagnostico'
  }
  // Assign the index first; a synchronous notification must never adopt a second visit.
  updateCase(id, { orderId: created.id, status: 'en_curso' })
  registerSessionOrder(created)
  return created
}
export function caseForOrder(orderId: string) {
  return allCases().find((v) => v.orderId === orderId)
}
export function openCaseResource(id: string, resource: FlowResource) {
  const { visit, order } = caseContext(id)
  if (!order) throw new Error('Confirma primero la creación de la OT.')
  let resourceId = order.id,
    stage: FlowStage = 'propuesta'
  if (resource === 'inspection') {
    const current = visit.inspectionId ? readMultipunto(visit.inspectionId) : undefined
    const report = current ?? createMultipunto(order.id)
    if (!current) rememberMultipunto(report)
    resourceId = report.id
    stage = 'inspeccion'
    updateCase(id, { inspectionId: resourceId })
  } else if (resource === 'quote' || resource === 'work') {
    const mode: WorkMode = resource === 'quote' ? 'quote' : 'work',
      previousId = resource === 'quote' ? visit.quoteId : visit.workReportId
    const previous = previousId ? readWorkDocument(previousId) : undefined
    const doc = previous ?? createWorkDocument(order.id, mode)
    if (!previous) rememberWorkDocument(doc)
    resourceId = doc.id
    stage = resource === 'quote' ? 'cotizacion' : 'ejecucion'
    updateCase(
      id,
      resource === 'quote'
        ? { quoteId: doc.id, quoteRevision: doc.revision }
        : { workReportId: doc.id }
    )
  }
  updateCase(id, { lastContext: { resource, resourceId, stage } })
  selectCase(id)
  return { resource, resourceId, orderId: order.id, visitId: id }
}
export function caseProgress(id: string) {
  const { visit, order } = caseContext(id)
  const inspection = visit.inspectionId ? readMultipunto(visit.inspectionId) : undefined,
    quote = visit.quoteId ? readWorkDocument(visit.quoteId) : undefined,
    work = visit.workReportId ? readWorkDocument(visit.workReportId) : undefined
  const states: Record<FlowStage, StageState> = {
    recepcion: 'completado',
    orden: order ? 'completado' : 'pendiente',
    inspeccion: !order
      ? 'bloqueado'
      : inspection?.finalized
        ? 'completado'
        : inspection
          ? 'en_curso'
          : 'pendiente',
    propuesta: order ? 'pendiente' : 'bloqueado',
    cotizacion: !order ? 'bloqueado' : quote ? 'en_curso' : 'pendiente',
    respuesta_cliente: quote ? 'pendiente' : 'bloqueado',
    ejecucion: !order ? 'bloqueado' : work ? 'en_curso' : 'pendiente',
    informe_final: work ? 'pendiente' : 'bloqueado',
    entrega: 'bloqueado'
  }
  // Further coordinated gates belong to 01D/E. Existing module approvals are shown,
  // never treated as blanket permission to execute or to deliver this visit.
  let stage: FlowStage = !order ? 'orden' : !inspection?.finalized ? 'inspeccion' : 'propuesta'
  const last = visit.lastContext
  if (last?.resource === 'inspection' && inspection && !inspection.finalized) stage = 'inspeccion'
  if (last?.resource === 'quote' && quote)
    stage = quote.approval ? 'respuesta_cliente' : 'cotizacion'
  if (last?.resource === 'work' && work) stage = work.approval ? 'informe_final' : 'ejecucion'
  if (last?.resource === 'order' && order) stage = 'propuesta'
  const actions: Record<FlowStage, string> = {
    recepcion: 'Revisar recepción',
    orden: 'Crear orden de trabajo',
    inspeccion: inspection ? 'Continuar inspección' : 'Iniciar inspección',
    propuesta: 'Definir trabajos',
    cotizacion: quote ? 'Continuar cotización' : 'Preparar cotización',
    respuesta_cliente: 'Revisar aprobación',
    ejecucion: work ? 'Registrar trabajos realizados' : 'Preparar informe de trabajo',
    informe_final: 'Revisar informe final',
    entrega: 'Cierre guiado pendiente 01E'
  }
  return { stage, states, action: actions[stage], inspection, quote, work }
}
