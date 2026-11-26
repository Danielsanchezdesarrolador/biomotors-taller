/**
 * Real-data CP05 -> technical execution review, OFFLINE DRAFT ONLY.
 * Source: immutable archived quote revision. Decisions: operator input only.
 * NEVER writes performed flags to CP05, confirms acceptance, or records delivery.
 */
import { validId } from '../ordenes/cp04Contracts'
import type { Quote, QuoteItem, Revision } from '../cp05/contracts'

export type ExecutionDecision = 'performed' | 'not_performed'
export type ExecutionInput = {
  decisions: Record<string, ExecutionDecision>
  pendingExplanation: string
  operatorReviewed: boolean
}
export type ExecutionRow = {
  item: QuoteItem
  decision: ExecutionDecision | 'unreviewed'
}
export type ExecutionPreview = {
  revision: Revision
  rows: ExecutionRow[]
  performed: ExecutionRow[]
  pending: ExecutionRow[]
  unreviewed: ExecutionRow[]
  quoted: { subtotal: number; tax: number; total: number }
  executed: { subtotal: number; tax: number; total: number }
  difference: number
  pendingExplanation: string
  readyForDraftPdf: boolean
  missing: string[]
  notice: string
}
export class ExecutionFailure extends Error {
  constructor(public readonly kind: 'identity' | 'invalid') {
    super(kind)
  }
}
const fail = (kind: ExecutionFailure['kind']): never => { throw new ExecutionFailure(kind) }
const safeNumber = (value: number) => Number.isSafeInteger(value) && value >= 0
const totals = (subtotal: number) => {
  if (!safeNumber(subtotal) || !safeNumber(subtotal * 19)) return fail('invalid')
  const tax = Math.floor((subtotal * 19 + 50) / 100)
  const total = subtotal + tax
  if (!safeNumber(total)) return fail('invalid')
  return { subtotal, tax, total }
}

/** Validate without ever mutating the server-owned revision or its item array. */
export function executionPreview(
  revision: Revision,
  quote: Quote,
  input: ExecutionInput
): ExecutionPreview {
  if (!revision || !quote || !input || typeof input !== 'object' ||
      !input.decisions || typeof input.decisions !== 'object' ||
      Array.isArray(input.decisions) || typeof input.pendingExplanation !== 'string' ||
      typeof input.operatorReviewed !== 'boolean') return fail('invalid')
  const p = revision.payload
  if (!p || !Array.isArray(p.items) || p.items.length > 200 ||
      revision.workshop_id !== quote.workshop_id ||
      revision.quote_id !== quote.id ||
      quote.status !== 'issued' || quote.issue_pending ||
      quote.issued_revision !== revision.revision ||
      validId(p.workshop?.id) !== validId(quote.workshop_id) ||
      validId(p.quote?.id) !== validId(quote.id) ||
      validId(p.quote?.workshop_id) !== validId(quote.workshop_id) ||
      validId(p.order?.id) !== validId(quote.order_id) ||
      validId(p.vehicle?.id) !== validId(quote.vehicle_id) ||
      validId(p.customer?.id) !== validId(quote.customer_id) ||
      p.quote.revision !== revision.revision ||
      !Number.isSafeInteger(p.quote.number) || p.quote.number < 1 ||
      !safeNumber(p.totals?.subtotal) || !safeNumber(p.totals?.tax) ||
      !safeNumber(p.totals?.total)) return fail('identity')
  const ids = new Set<string>()
  let quotedNet = 0
  const rows: ExecutionRow[] = p.items.map(item => {
    if (item.workshop_id !== quote.workshop_id || item.quote_id !== quote.id ||
        typeof item.description !== 'string' || !item.description.trim() ||
        !Number.isSafeInteger(item.quantity100) || item.quantity100 <= 0 ||
        !Number.isSafeInteger(item.unit_price) || item.unit_price < 0 ||
        !Number.isSafeInteger(item.quantity100 * item.unit_price) ||
        !safeNumber(item.line_net) ||
        item.line_net !== Math.floor((item.quantity100 * item.unit_price + 50) / 100)) return fail('identity')
    const id = validId(item.id)
    if (ids.has(id)) return fail('identity')
    ids.add(id)
    quotedNet += item.line_net
    if (!safeNumber(quotedNet)) return fail('invalid')
    const decision = input.decisions[id] ?? 'unreviewed'
    if (!['performed', 'not_performed', 'unreviewed'].includes(decision))
      return fail('invalid')
    return { item, decision }
  })
  if (Object.keys(input.decisions).some(id => !ids.has(id))) return fail('invalid')
  const expected = totals(quotedNet)
  if (Object.keys(p.totals).length !== 3 || expected.subtotal !== p.totals.subtotal ||
      expected.tax !== p.totals.tax || expected.total !== p.totals.total) return fail('identity')
  const performed = rows.filter(r => r.decision === 'performed')
  const pending = rows.filter(r => r.decision === 'not_performed')
  const unreviewed = rows.filter(r => r.decision === 'unreviewed')
  const executed = totals(performed.reduce((sum, r) => sum + r.item.line_net, 0))
  const explanation = input.pendingExplanation.trim()
  if (explanation.length > 2000) return fail('invalid')
  const missing: string[] = []
  if (!rows.length) missing.push('La cotización emitida no contiene partidas.')
  if (unreviewed.length) missing.push('Revisa todas las partidas: realizadas y no realizadas.')
  if ((pending.length || unreviewed.length) && explanation.length < 1)
    missing.push('Explica los trabajos pendientes o no realizados.')
  if (!input.operatorReviewed)
    missing.push('El operador debe confirmar la revisión de las partidas marcadas.')
  return {
    revision, rows, performed, pending, unreviewed,
    quoted: p.totals, executed, difference: p.totals.total - executed.total,
    pendingExplanation: explanation, missing,
    readyForDraftPdf: missing.length === 0,
    notice: 'BORRADOR INTERNO · SIN GUARDAR en Supabase. Las selecciones locales no acreditan trabajos ejecutados, autorización del cliente, entrega ni pago. No es documento tributario.'
  }
}
