import { demoClients, demoVehicles, vehicleForOrder } from '../clientes/clientesData'
import { receiveDirectory, type ReceptionInput } from '../clientes/directorySession'
import { sessionRequests } from '../clientes/intakeSession'
import { registerSessionOrder, sessionOrders } from '../ordenes/orderSession'
import type { WorkOrder } from '../ordenes/ordenesData'
import { sessionChanged } from '../session/sessionSignal'
import { createMultipunto } from '../informes/multipunto/multipuntoData'
import { readMultipunto, rememberMultipunto } from '../informes/multipunto/multipuntoSession'
import {
  businessState,
  beginProposal,
  prepareWorkFromQuote,
  authorizedWork,
  visitQuote,
  type QuoteRef
} from './flowBusiness'
import { readWorkDocument } from '../informes/trabajos/trabajosSession'
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
  const result = structuredClone(v)
  if (result.quoteId) {
    const quote = readWorkDocument(result.quoteId)
    if (quote && quote.orderId === result.orderId) result.quoteRevision = quote.revision
  }
  return result
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
    const doc = resource === 'quote' ? visitQuote(visit) : authorizedWork(visit)
    if (!doc)
      throw new Error(
        resource === 'quote'
          ? 'Define primero la propuesta de esta visita.'
          : 'Confirma primero la precarga desde una aceptación DEMO vigente.'
      )
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
export function beginCaseProposal(id: string) {
  const doc = beginProposal(readCase(id))
  updateCase(id, {
    quoteId: doc.id,
    quoteRevision: doc.revision,
    lastContext: { resource: 'order', resourceId: readCase(id).orderId!, stage: 'propuesta' }
  })
  return doc
}
export function prepareCaseWork(id: string, ref: QuoteRef, confirmed: boolean) {
  const doc = prepareWorkFromQuote(readCase(id), ref, confirmed)
  updateCase(id, {
    workReportId: doc.id,
    lastContext: { resource: 'work', resourceId: doc.id, stage: 'ejecucion' }
  })
  return doc
}
export function caseProgress(id: string) {
  const { visit, order } = caseContext(id)
  const inspection = visit.inspectionId ? readMultipunto(visit.inspectionId) : undefined,
    business = order ? businessState(visit) : undefined,
    quote = business?.quote,
    work = business?.work
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
    propuesta: !inspection?.finalized
      ? 'bloqueado'
      : business?.proposalValid
        ? 'completado'
        : quote
          ? 'en_curso'
          : 'pendiente',
    cotizacion: !business?.proposalValid
      ? 'bloqueado'
      : business.reviewValid
        ? 'completado'
        : quote
          ? 'en_curso'
          : 'pendiente',
    respuesta_cliente: !business?.reviewValid
      ? 'bloqueado'
      : business.response
        ? 'completado'
        : 'pendiente',
    ejecucion: !business?.authorized
      ? 'bloqueado'
      : work?.approval
        ? 'completado'
        : work
          ? 'en_curso'
          : 'pendiente',
    informe_final: work?.approval ? 'completado' : work ? 'en_curso' : 'bloqueado',
    entrega: 'bloqueado'
  }
  let stage: FlowStage = !order
    ? 'orden'
    : !inspection?.finalized
      ? 'inspeccion'
      : !business?.proposalValid
        ? 'propuesta'
        : !business.reviewValid
          ? 'cotizacion'
          : !business.response
            ? 'respuesta_cliente'
            : !business.authorized
              ? 'propuesta'
              : work?.approval
                ? 'informe_final'
                : 'ejecucion'
  if (visit.lastContext?.resource === 'inspection' && inspection && !inspection.finalized)
    stage = 'inspeccion'
  const actions: Record<FlowStage, string> = {
    recepcion: 'Revisar recepción',
    orden: 'Crear orden de trabajo',
    inspeccion: inspection ? 'Continuar inspección' : 'Iniciar inspección',
    propuesta: quote ? 'Revisar propuesta' : 'Definir trabajos',
    cotizacion: 'Revisar cotización',
    respuesta_cliente: 'Registrar respuesta DEMO',
    ejecucion: work ? 'Registrar trabajos realizados' : 'Preparar trabajo desde cotización',
    informe_final: 'Revisar informe final',
    entrega: 'Cierre guiado pendiente 01E'
  }
  return { stage, states, action: actions[stage], inspection, quote, work, business }
}

export function activeCaseId() {
  return selectedId
}
