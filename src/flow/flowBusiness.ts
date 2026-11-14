// Domain for 01D. Only metadata lives here. Items, prices and totals belong to BT-COT-01.
import type { FlowCase } from './flowSession'
import { documentContext } from '../informes/documentosData'
import { readMultipunto } from '../informes/multipunto/multipuntoSession'
import {
  createWorkDocument,
  reviewWorkDocument,
  validateWorkDocument,
  type WorkDocument
} from '../informes/trabajos/trabajosData'
import { readWorkDocument, rememberWorkDocument } from '../informes/trabajos/trabajosSession'
import { sessionChanged } from '../session/sessionSignal'
export type QuoteRef = { quoteId: string; revision: number }
export type ClientDecision = 'aceptada_demo' | 'rechazada_demo' | 'cambios_demo'
export const decisionLabels: Record<ClientDecision, string> = {
  aceptada_demo: 'Aceptada DEMO',
  rechazada_demo: 'Rechazada DEMO',
  cambios_demo: 'Solicita cambios DEMO'
}
export type QuoteResponse = QuoteRef & {
  id: string
  visitId: string
  workshopId: 'workshop-demo'
  orderId: string
  clientId: string
  vehicleId: string
  decision: ClientDecision
  date: string
  note: string
  simulated: true
  actor: 'Operador DEMO'
}
type ProposalConfirmation = {
  visitId: string
  quoteId: string
  proposalRevision: number
  inspectionId: string
  inspectionContent: string
  date: string
  actor: 'Operador DEMO'
  itemSources: Record<string, string>
}
type QuoteReview = QuoteRef & { visitId: string; date: string; actor: 'Operador DEMO' }
export type WorkTransfer = QuoteRef & {
  visitId: string
  workReportId: string
  date: string
  actor: 'Operador DEMO'
}
const proposals = new Map<string, ProposalConfirmation>(),
  reviews = new Map<string, QuoteReview>(),
  responses: QuoteResponse[] = [],
  transfers: WorkTransfer[] = []
export function assertVisit(visit: FlowCase) {
  if (visit.workshopId !== 'workshop-demo' || !visit.orderId)
    throw new Error('La visita necesita una OT confirmada del taller DEMO.')
  const ctx = documentContext({
    orderId: visit.orderId,
    clientId: visit.clientId,
    vehicleId: visit.vehicleId
  })
  if (ctx.order.visitId && ctx.order.visitId !== visit.id)
    throw new Error('La OT pertenece a otra visita.')
  return ctx
}
export function visitInspection(visit: FlowCase) {
  assertVisit(visit)
  const r = visit.inspectionId ? readMultipunto(visit.inspectionId) : undefined
  if (
    r &&
    (r.workshopId !== visit.workshopId ||
      r.orderId !== visit.orderId ||
      r.clientId !== visit.clientId ||
      r.vehicleId !== visit.vehicleId)
  )
    throw new Error('Inspección de otra visita u OT.')
  return r
}
export function visitQuote(visit: FlowCase) {
  assertVisit(visit)
  const q = visit.quoteId ? readWorkDocument(visit.quoteId) : undefined
  if (
    q &&
    (q.mode !== 'quote' ||
      q.workshopId !== visit.workshopId ||
      q.orderId !== visit.orderId ||
      q.clientId !== visit.clientId ||
      q.vehicleId !== visit.vehicleId)
  )
    throw new Error('Cotización de otra visita u OT.')
  return q
}
function inspectionContent(visit: FlowCase) {
  const r = visitInspection(visit)
  return r
    ? JSON.stringify({
        id: r.id,
        items: r.items,
        observations: r.observations,
        date: r.date,
        technician: r.technician,
        start: r.start,
        end: r.end,
        fuel: r.fuel
      })
    : ''
}
function requireInspection(visit: FlowCase) {
  if (!visitInspection(visit)?.finalized)
    throw new Error(
      'Finaliza la inspección de esta OT antes de confirmar la propuesta. Los pendientes siguen sin revisar.'
    )
}
function requireQuote(visit: FlowCase, ref?: QuoteRef) {
  const q = visitQuote(visit)
  if (!q) throw new Error('Define primero una propuesta para esta visita.')
  if (ref && (q.id !== ref.quoteId || q.revision !== ref.revision))
    throw new Error('La cotización cambió: revisa el documento y su revisión vigente.')
  return q
}
export function beginProposal(visit: FlowCase) {
  requireInspection(visit)
  const q = visitQuote(visit) ?? createWorkDocument(visit.orderId!, 'quote')
  rememberWorkDocument(q)
  return q
}
export function proposalValid(visit: FlowCase) {
  const q = visitQuote(visit),
    p = proposals.get(visit.id),
    r = visitInspection(visit)
  return (
    !!q &&
    !!p &&
    !!r?.finalized &&
    p.quoteId === q.id &&
    p.proposalRevision === (q.proposalRevision ?? 0) &&
    p.inspectionId === r.id &&
    p.inspectionContent === inspectionContent(visit) &&
    q.diagnosis.trim().length > 0 &&
    validateWorkDocument(q).length === 0
  )
}
export function confirmProposal(visit: FlowCase, ref: QuoteRef, confirmed: boolean) {
  if (!confirmed)
    throw new Error(
      'Confirma que el diagnóstico, las partidas y los precios fueron revisados por el operador DEMO.'
    )
  requireInspection(visit)
  const q = requireQuote(visit, ref),
    errors = validateWorkDocument(q)
  if (!q.diagnosis.trim())
    errors.unshift('Escribe el diagnóstico profesional, separado del motivo del cliente.')
  if (errors.length) throw new Error(errors.join(' '))
  if (proposalValid(visit)) return structuredClone(proposals.get(visit.id)!)
  const p: ProposalConfirmation = {
    visitId: visit.id,
    quoteId: q.id,
    proposalRevision: q.proposalRevision ?? 0,
    inspectionId: visit.inspectionId!,
    inspectionContent: inspectionContent(visit),
    date: new Date().toISOString(),
    actor: 'Operador DEMO',
    itemSources: Object.fromEntries(
      q.items.map((i) => [i.id, i.origin ?? 'Definición manual revisada'])
    )
  }
  proposals.set(visit.id, p)
  sessionChanged()
  return structuredClone(p)
}
export function quoteReviewed(visit: FlowCase) {
  const q = visitQuote(visit),
    r = reviews.get(visit.id)
  return (
    !!q &&
    !!r &&
    proposalValid(visit) &&
    r.quoteId === q.id &&
    r.revision === q.revision &&
    q.status !== 'Borrador'
  )
}
export function markQuoteReviewed(visit: FlowCase, ref: QuoteRef, confirmed: boolean) {
  if (!confirmed)
    throw new Error('Confirma la revisión de ítems, condiciones y totales de esta revisión.')
  const q = requireQuote(visit, ref)
  if (!proposalValid(visit)) throw new Error('Confirma primero la propuesta vigente del mecánico.')
  const reviewed = reviewWorkDocument(q)
  if (!quoteReviewed(visit)) {
    rememberWorkDocument(q.approval ? { ...q, saved: true } : reviewed)
    reviews.set(visit.id, {
      visitId: visit.id,
      quoteId: q.id,
      revision: q.revision,
      date: new Date().toISOString(),
      actor: 'Operador DEMO'
    })
    sessionChanged()
  }
  return requireQuote(visit)
}
export function responseHistory(visit: FlowCase) {
  assertVisit(visit)
  return structuredClone(responses.filter((r) => r.visitId === visit.id))
}
export function currentResponse(visit: FlowCase) {
  const q = visitQuote(visit)
  if (!q || !quoteReviewed(visit)) return undefined
  return responseHistory(visit).find((r) => r.quoteId === q.id && r.revision === q.revision)
}
export function authorizedDemo(visit: FlowCase) {
  return currentResponse(visit)?.decision === 'aceptada_demo'
}
export function recordClientResponse(
  visit: FlowCase,
  ref: QuoteRef,
  decision: ClientDecision,
  note: string,
  confirmed: boolean
) {
  if (!confirmed)
    throw new Error(
      'Confirma que registras una respuesta simulada, sin recepción real ni consentimiento legal.'
    )
  if (!Object.hasOwn(decisionLabels, decision)) throw new Error('Respuesta DEMO inválida.')
  if (note.length > 500) throw new Error('Nota de hasta 500 caracteres.')
  const q = requireQuote(visit, ref)
  if (!quoteReviewed(visit))
    throw new Error('Revisa primero la cotización vigente antes de registrar su respuesta.')
  const last = currentResponse(visit)
  if (last?.decision === decision && last.note === note.trim()) return last
  const r: QuoteResponse = {
    id: 'response-demo-' + crypto.randomUUID(),
    visitId: visit.id,
    workshopId: 'workshop-demo',
    orderId: q.orderId,
    clientId: q.clientId,
    vehicleId: q.vehicleId,
    quoteId: q.id,
    revision: q.revision,
    decision,
    note: note.trim(),
    date: new Date().toISOString(),
    simulated: true,
    actor: 'Operador DEMO'
  }
  responses.unshift(r)
  sessionChanged()
  return structuredClone(r)
}
function sameItems(work: WorkDocument, quote: WorkDocument) {
  const fields = (d: WorkDocument) =>
    d.items.map((i) => ({
      description: i.description,
      type: i.type,
      quantity: i.quantity,
      price: i.price
    }))
  return JSON.stringify(fields(work)) === JSON.stringify(fields(quote))
}
export function transferHistory(visit: FlowCase) {
  assertVisit(visit)
  return structuredClone(transfers.filter((t) => t.visitId === visit.id))
}
export function authorizedWork(visit: FlowCase) {
  const q = visitQuote(visit)
  if (!q || !authorizedDemo(visit)) return undefined
  const transfer = transfers.find(
      (t) => t.visitId === visit.id && t.quoteId === q.id && t.revision === q.revision
    ),
    work = transfer ? readWorkDocument(transfer.workReportId) : undefined
  if (
    !work ||
    work.mode !== 'work' ||
    work.workshopId !== visit.workshopId ||
    work.orderId !== visit.orderId ||
    work.clientId !== visit.clientId ||
    work.vehicleId !== visit.vehicleId ||
    work.sourceQuote?.visitId !== visit.id ||
    work.sourceQuote.quoteId !== q.id ||
    work.sourceQuote.revision !== q.revision ||
    !sameItems(work, q)
  )
    return undefined
  return work
}
export function prepareWorkFromQuote(visit: FlowCase, ref: QuoteRef, confirmed: boolean) {
  const q = requireQuote(visit, ref)
  if (!confirmed)
    throw new Error('Confirma expresamente la precarga del informe desde esta cotización.')
  if (!authorizedDemo(visit))
    throw new Error('No hay una aceptación DEMO vigente para esta revisión.')
  const previous = transfers.find(
    (t) => t.visitId === visit.id && t.quoteId === q.id && t.revision === q.revision
  )
  if (previous) {
    const work = authorizedWork(visit)
    if (work) return work
    throw new Error(
      'El informe precargado se modificó o descartó. Revisa las partidas o prepara una nueva revisión de cotización; no se sobrescribirán trabajos anteriores.'
    )
  }
  const base = createWorkDocument(q.orderId, 'work'),
    work: WorkDocument = {
      ...base,
      diagnosis: q.diagnosis,
      recommendations: q.recommendations,
      terms: q.terms,
      validDays: q.validDays,
      inspection: structuredClone(q.inspection),
      comments: '',
      sourceQuote: { visitId: visit.id, quoteId: q.id, revision: q.revision },
      items: q.items.map((i) => ({
        ...structuredClone(i),
        id: crypto.randomUUID(),
        origin: 'Cotización aceptada DEMO',
        performed: false
      }))
    }
  rememberWorkDocument(work)
  transfers.unshift({
    visitId: visit.id,
    quoteId: q.id,
    revision: q.revision,
    workReportId: work.id,
    date: new Date().toISOString(),
    actor: 'Operador DEMO'
  })
  sessionChanged()
  return work
}
export function businessState(visit: FlowCase) {
  const quote = visitQuote(visit),
    proposal = proposals.get(visit.id),
    review = reviews.get(visit.id),
    history = responseHistory(visit),
    response = currentResponse(visit),
    lastResponse = history[0],
    work = authorizedWork(visit)
  return {
    quote,
    proposal: proposal ? structuredClone(proposal) : undefined,
    proposalValid: proposalValid(visit),
    review: review ? structuredClone(review) : undefined,
    reviewValid: quoteReviewed(visit),
    response,
    lastResponse,
    history,
    authorized: authorizedDemo(visit),
    responseStale:
      !!lastResponse &&
      (!quote ||
        lastResponse.quoteId !== quote.id ||
        lastResponse.revision !== quote.revision ||
        !quoteReviewed(visit)),
    work,
    transfers: transferHistory(visit)
  }
}
