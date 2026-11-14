// BT-FLOW-01E: estados locales de pausa, cancelación y entrega. Sin backend, correos ni firma.
// Referencias/decisiones explícitas del operador; no inferir trabajos ejecutados.
import type { FlowCase } from './flowSession'
import { businessState, visitInspection } from './flowBusiness'
import { workTotals } from '../informes/trabajos/trabajosData'
import { sessionChanged } from '../session/sessionSignal'

export type VisitHoldReason =
  | 'repuestos'
  | 'cliente_no_autoriza'
  | 'trabajo_adicional'
  | 'revision_pendiente'
  | 'vehiculo_en_espera'
  | 'otro'
export const holdLabels: Record<VisitHoldReason, string> = {
  repuestos: 'Esperando repuestos',
  cliente_no_autoriza: 'Cliente no autoriza',
  trabajo_adicional: 'Trabajo adicional por revisar',
  revision_pendiente: 'Revisión técnica pendiente',
  vehiculo_en_espera: 'Vehículo en espera',
  otro: 'Otra causa'
}
export type VisitHold = {
  id: string
  visitId: string
  orderId: string
  reason: VisitHoldReason
  note: string
  date: string
  resolvedAt?: string
  resolution?: string
  actor: 'Operador DEMO'
}
export type VisitCancellation = {
  visitId: string
  orderId?: string
  date: string
  reason: string
  actor: 'Operador DEMO'
  simulated: true
}
export type DeliveryChecklist = {
  vehicleChecked: boolean
  workChecked: boolean
  documentsChecked: boolean
  pendingExplained: boolean
}
export type DeliveryRecord = {
  visitId: string
  workshopId: 'workshop-demo'
  clientId: string
  vehicleId: string
  orderId: string
  inspectionId: string
  quoteId: string
  quoteRevision: number
  responseId: string
  workReportId: string
  workRevision: number
  performedCount: number
  pendingCount: number
  unreviewedCount: number
  amount: number
  pendingNote: string
  finalNote: string
  checklist: DeliveryChecklist
  date: string
  actor: 'Operador DEMO'
  simulated: true
}
const holds = new Map<string, VisitHold[]>()
const cancellations = new Map<string, VisitCancellation>()
const deliveries = new Map<string, DeliveryRecord>()
const clean = (value: string, max = 500) => {
  const v = value.trim()
  if (v.length < 8 || v.length > max) throw new Error('Describe el motivo con 8 a ' + max + ' caracteres.')
  return v
}
function assertCase(visit: FlowCase) {
  if (visit.workshopId !== 'workshop-demo' || !visit.clientId || !visit.vehicleId)
    throw new Error('Expediente de taller DEMO inválido.')
}
export function holdHistory(visit: FlowCase): VisitHold[] {
  assertCase(visit)
  return structuredClone(holds.get(visit.id) ?? [])
}
export function activeHolds(visit: FlowCase) {
  return holdHistory(visit).filter(h => !h.resolvedAt)
}
export function cancellationRecord(visit: FlowCase) {
  assertCase(visit)
  const item = cancellations.get(visit.id)
  return item ? structuredClone(item) : undefined
}
function rawDelivery(visit: FlowCase) {
  assertCase(visit)
  const item = deliveries.get(visit.id)
  return item ? structuredClone(item) : undefined
}
export function deliveryRequirements(visit: FlowCase) {
  assertCase(visit)
  const reasons: string[] = []
  const business = visit.orderId ? businessState(visit) : undefined
  const inspection = visit.orderId ? visitInspection(visit) : undefined
  const quote = business?.quote
  const work = business?.work
  const response = business?.response
  if (!visit.orderId) reasons.push('Confirma primero la orden de trabajo.')
  if (!inspection?.finalized) reasons.push('Finaliza la inspección multipunto.')
  if (!business?.proposalValid) reasons.push('Confirma la propuesta técnica vigente.')
  if (!business?.reviewValid) reasons.push('Revisa la cotización vigente.')
  if (!business?.authorized || !response) reasons.push('Registra una aceptación DEMO vigente por revisión.')
  if (!work) reasons.push('Prepara el informe desde la cotización aceptada DEMO.')
  else if (!work.approval || work.status !== 'Finalizado DEMO' || work.approval.revision !== work.revision)
    reasons.push('Finaliza expresamente el informe de los trabajos realizados.')
  const performed = work?.items.filter(i => i.performed) ?? []
  const notPerformed = work?.items.filter(i => !i.performed) ?? []
  const unreviewed = inspection?.items.filter(i => i.state === 'unreviewed') ?? []
  if (work && !performed.length) reasons.push('Marca al menos un trabajo realizado en el informe.')
  if (activeHolds(visit).length) reasons.push('Resuelve todas las pausas antes de cerrar la visita.')
  if (cancellationRecord(visit)) reasons.push('La visita está cancelada; no se puede entregar.')
  return {
    eligible: reasons.length === 0,
    reasons,
    inspection,
    quote,
    response,
    work,
    performed,
    pending: notPerformed,
    unreviewed,
    technicalPending: quote?.recommendations.trim() || '',
    amount: work ? workTotals(work).total : 0
  }
}
function deliveryStillCurrent(visit: FlowCase, record: DeliveryRecord) {
  const req = deliveryRequirements(visit)
  return req.eligible && req.quote?.id === record.quoteId &&
    req.quote.revision === record.quoteRevision &&
    req.response?.id === record.responseId &&
    req.inspection?.id === record.inspectionId &&
    req.work?.id === record.workReportId &&
    req.work.revision === record.workRevision &&
    req.performed.length === record.performedCount &&
    req.pending.length === record.pendingCount &&
    req.unreviewed.length === record.unreviewedCount &&
    req.amount === record.amount
}
export function deliveryState(visit: FlowCase) {
  assertCase(visit)
  const cancellation = cancellationRecord(visit)
  const record = rawDelivery(visit)
  const current = record ? deliveryStillCurrent(visit, record) : false
  return {
    status: cancellation ? 'cancelada' as const :
      record && current ? 'cerrada_demo' as const :
      activeHolds(visit).length ? 'en_espera' as const :
      record ? 'cierre_desactualizado' as const : 'en_curso' as const,
    delivery: record, current, cancellation, holds: holdHistory(visit),
    openHolds: activeHolds(visit)
  }
}
export function recordHold(visit: FlowCase, reason: VisitHoldReason, note: string, confirmed: boolean) {
  assertCase(visit)
  if (!confirmed) throw new Error('Confirma expresamente la pausa DEMO.')
  if (!visit.orderId) throw new Error('Confirma primero la OT.')
  if (!Object.hasOwn(holdLabels, reason)) throw new Error('Causa de espera inválida.')
  if (cancellationRecord(visit) || rawDelivery(visit))
    throw new Error('No puedes pausar una visita cancelada o entregada.')
  const n = clean(note)
  const current = activeHolds(visit).find(h => h.reason === reason && h.note === n)
  if (current) return current
  const item: VisitHold = {
    id: 'hold-demo-' + crypto.randomUUID(), visitId: visit.id, orderId: visit.orderId,
    reason, note: n, date: new Date().toISOString(), actor: 'Operador DEMO'
  }
  holds.set(visit.id, [item, ...(holds.get(visit.id) ?? [])])
  sessionChanged()
  return structuredClone(item)
}
export function resolveHold(visit: FlowCase, holdId: string, resolution: string, confirmed: boolean) {
  assertCase(visit)
  if (!confirmed) throw new Error('Confirma que el impedimento fue revisado por el operador DEMO.')
  const note = clean(resolution)
  const list = holds.get(visit.id) ?? []
  const found = list.find(h => h.id === holdId)
  if (!found) throw new Error('Pausa de otra visita o inexistente.')
  if (found.resolvedAt) return structuredClone(found)
  if (cancellationRecord(visit)) throw new Error('No puedes reanudar una visita cancelada.')
  found.resolvedAt = new Date().toISOString()
  found.resolution = note
  sessionChanged()
  return structuredClone(found)
}
export function cancelVisit(visit: FlowCase, reason: string, confirmed: boolean) {
  assertCase(visit)
  if (!confirmed) throw new Error('Confirma expresamente la cancelación DEMO.')
  const note = clean(reason)
  if (rawDelivery(visit)) throw new Error('La visita ya tiene un registro de entrega: no la canceles.')
  const previous = cancellationRecord(visit)
  if (previous) return previous
  const record: VisitCancellation = {
    visitId: visit.id, orderId: visit.orderId, reason: note,
    date: new Date().toISOString(), actor: 'Operador DEMO', simulated: true
  }
  cancellations.set(visit.id, record)
  sessionChanged()
  return structuredClone(record)
}
export function completeDelivery(
  visit: FlowCase,
  checklist: DeliveryChecklist,
  pendingNote: string,
  finalNote: string,
  confirmed: boolean
) {
  assertCase(visit)
  if (!confirmed || !Object.values(checklist).every(Boolean))
    throw new Error('Revisa las cuatro confirmaciones y acepta explícitamente el cierre DEMO.')
  const req = deliveryRequirements(visit)
  if (!req.eligible || !req.inspection || !req.quote || !req.response || !req.work)
    throw new Error('No se puede entregar: ' + req.reasons.join(' '))
  const final = clean(finalNote)
  const pending = req.pending.length || req.unreviewed.length || req.technicalPending
    ? clean(pendingNote)
    : pendingNote.trim().slice(0, 500)
  const previous = rawDelivery(visit)
  if (previous) {
    if (deliveryStillCurrent(visit, previous)) return previous
    throw new Error('El cierre anterior ya no coincide: revisa la visita antes de generar otro.')
  }
  const record: DeliveryRecord = {
    visitId: visit.id, workshopId: visit.workshopId, clientId: visit.clientId,
    vehicleId: visit.vehicleId, orderId: visit.orderId!,
    inspectionId: req.inspection.id, quoteId: req.quote.id, quoteRevision: req.quote.revision,
    responseId: req.response.id, workReportId: req.work.id, workRevision: req.work.revision,
    performedCount: req.performed.length, pendingCount: req.pending.length,
    unreviewedCount: req.unreviewed.length,
    amount: req.amount, pendingNote: pending, finalNote: final,
    checklist: { ...checklist }, date: new Date().toISOString(),
    actor: 'Operador DEMO', simulated: true
  }
  deliveries.set(visit.id, record)
  sessionChanged()
  return structuredClone(record)
}
