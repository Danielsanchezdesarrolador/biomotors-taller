import { UUID } from '../clientes/cp03PilotContracts'
import { calculateTotals } from '../ordenes/orderMoney'
import { validateItem, type WorkItem } from '../informes/trabajos/workItemCore'
export type Quote = {
  workshop_id: string
  id: string
  order_id: string
  vehicle_id: string
  customer_id: string
  number: number
  version: number
  status: 'draft' | 'issued' | 'voided'
  price_basis: 'net'
  valid_days: number
  terms: string
  comments: string
  issued_revision: number
  issue_pending: boolean
  void_reason: string | null
  created_at: string
  updated_at: string
}
export type QuoteItem = {
  workshop_id: string
  quote_id: string
  id: string
  position: number
  description: string
  type: WorkItem['type']
  quantity100: number
  unit_price: number
  line_net: number
}
export type Source = {
  workshop: { id: string; name: string; logoPath?: string | null; contactEmail?: string | null; phone?: string | null; address?: string | null }
  customer: { id: string; full_name: string; email: string | null; mobile_e164: string | null }
  vehicle: {
    id: string
    plate: string | null
    make: string
    model: string
    model_year?: number | null
  }
  order: { id: string; complaint: string; opened_at: string; intake_odometer: number | null }
}
export type Snapshot = Source & {
  quote: Quote & { revision: number }
  items: QuoteItem[]
  totals: ReturnType<typeof calculateTotals>
  document_date: string
  notice: string
}
export type Revision = {
  workshop_id: string
  id: string
  quote_id: string
  revision: number
  payload: Snapshot
  payload_sha256: string
  pdf_object_path: string
  pdf_sha256: string
  pdf_size: number
  issued_at: string
  issued_by: string
}
export type Delivery = {
  workshop_id: string
  id: string
  revision_id: string
  attempt: number
  status: 'queued' | 'sent' | 'failed'
  recipient: string
  provider_id: string | null
  error_code: string | null
  created_at: string
}
export type QuoteEvent = {
  workshop_id: string
  id: string
  quote_id: string
  revision: number
  kind: 'revised' | 'voided'
  reason: string
  actor_id: string
  created_at: string
}
export type Bundle = {
  quote: Quote
  items: QuoteItem[]
  source: Source
  revisions: Revision[]
  deliveries: Delivery[]
  events: QuoteEvent[]
}
export type Draft = {
  price_basis: 'net'
  valid_days: number
  terms: string
  comments: string
  items: WorkItem[]
}
export class QuoteFailure extends Error {
  constructor(
    public kind: 'denied' | 'invalid' | 'conflict' | 'unavailable' | 'blocked' | 'delivery_pending'
  ) {
    super(kind)
  }
}
export const quoteId = (value: string) => {
  if (!UUID.test(value)) throw new QuoteFailure('invalid')
  return value.toLowerCase()
}
export function validateQuoteItem(item: WorkItem): string {
  const base = validateItem(item)
  if (base) return base
  if (!UUID.test(item.id)) return 'Identificador de partida inválido.'
  if (item.price <= 0) return 'Precio neto entero mayor que cero.'
  if (Math.abs(item.quantity * 100 - Math.round(item.quantity * 100)) > 1e-7)
    return 'Cantidad con hasta dos decimales.'
  return ''
}
export function draftPayload(draft: Draft) {
  if (
    draft.price_basis !== 'net' ||
    !Number.isInteger(draft.valid_days) ||
    draft.valid_days < 1 ||
    draft.valid_days > 365 ||
    typeof draft.terms !== 'string' ||
    draft.terms.length > 2000 ||
    typeof draft.comments !== 'string' ||
    draft.comments.length > 2000 ||
    !Array.isArray(draft.items) ||
    draft.items.length > 200
  )
    throw new QuoteFailure('invalid')
  const seen = new Set<string>(),
    ids = new Set<string>()
  const items = draft.items.map((i) => {
    if (validateQuoteItem(i)) throw new QuoteFailure('invalid')
    const name = i.type + '|' + i.description.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-CL')
    if (ids.has(i.id) || seen.has(name)) throw new QuoteFailure('invalid')
    ids.add(i.id)
    seen.add(name)
    return {
      id: i.id,
      description: i.description.trim(),
      type: i.type,
      quantity100: Math.round(i.quantity * 100),
      unit_price: i.price
    }
  })
  calculateTotals(draft.items)
  return {
    price_basis: 'net' as const,
    valid_days: draft.valid_days,
    terms: draft.terms,
    comments: draft.comments,
    items
  }
}
export function draftFrom(bundle: Bundle): Draft {
  return {
    price_basis: 'net',
    valid_days: bundle.quote.valid_days,
    terms: bundle.quote.terms,
    comments: bundle.quote.comments,
    items: bundle.items.map((i) => ({
      id: i.id,
      description: i.description,
      type: i.type,
      quantity: i.quantity100 / 100,
      price: i.unit_price,
      performed: false
    }))
  }
}
export const quoteNumber = (q: Pick<Quote, 'number'>) => 'COT-' + String(q.number).padStart(6, '0')
export function previewSnapshot(bundle: Bundle, draft: Draft): Snapshot {
  const p = draftPayload(draft)
  return {
    ...bundle.source,
    quote: { ...bundle.quote, ...p, revision: bundle.quote.issued_revision + 1 },
    items: p.items.map((i, position) => ({
      ...i,
      position,
      quote_id: bundle.quote.id,
      workshop_id: bundle.quote.workshop_id,
      line_net: Math.floor((i.quantity100 * i.unit_price + 50) / 100)
    })),
    totals: calculateTotals(draft.items),
    document_date: bundle.quote.updated_at,
    notice: 'Borrador sin emitir ni archivar. No es documento tributario ni aceptación del cliente.'
  }
}
export function quoteMessage(error: unknown) {
  const kind = error instanceof QuoteFailure ? error.kind : 'unavailable'
  if (kind === 'delivery_pending')
    return 'El envío está pendiente de conciliación con el proveedor. No lo repitas hasta verificar el resultado.'
  return kind === 'conflict'
    ? 'Otra persona cambió la cotización. Conserva tus cambios y recarga antes de guardar.'
    : kind === 'denied'
      ? 'Acceso no autorizado o sesión vencida. Verifica tu membresía.'
      : kind === 'invalid'
        ? 'Revisa las partidas, precios netos, cantidades y condiciones.'
        : kind === 'blocked'
          ? 'Emisión y archivo privados pendientes de autorización. No se emitió ni envió el documento.'
          : 'No se confirmó el guardado. Verifica la conexión y reintenta la misma operación.'
}
