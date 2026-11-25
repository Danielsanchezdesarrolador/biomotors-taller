import { UUID } from '../clientes/cp03PilotContracts'
import type { Finding, WorkOrder, VehicleChoice } from '../ordenes/cp04Contracts'
import type { Quote, Revision, QuoteEvent } from '../cp05/contracts'
export class HistoryFailure extends Error {
  constructor(public kind: 'denied' | 'invalid' | 'unavailable') {
    super(kind)
  }
}
export type Cursor = { at: string; id: string }
export type Page<T> = { rows: T[]; next: Cursor | null }
/** Server-owned, append-only operator declarations; never client signatures. */
export type EvidenceApproval = {
  workshop_id: string; id: string; order_id: string; quote_id: string; revision_id: string
  evidence_status: 'operator_attested'; recorded_at: string; recorded_by: string
  method: string; note: string
}
export type EvidenceExecution = {
  workshop_id: string; id: string; order_id: string; vehicle_id: string; quote_id: string
  revision_id: string; approval_id: string; evidence_status: 'operator_attested'
  recorded_at: string; reviewed_by: string; decisions: Record<string, string>
  pending_note: string; quoted_net: number; quoted_tax: number; quoted_total: number
  performed_net: number; performed_tax: number; performed_total: number
}
export type EvidenceDelivery = {
  workshop_id: string; id: string; order_id: string; vehicle_id: string; quote_id: string
  revision_id: string; report_id: string; evidence_status: 'operator_attested'
  recorded_at: string; recorded_by: string; checklist: Record<string, boolean>
  handover_method: string; handover_note: string
}
export type EvidenceReceipt={workshop_id:string;id:string;order_id:string;vehicle_id:string;customer_id:string;quote_id:string;revision_id:string;received_at:string;odometer:number;complaint:string;recorded_by:string}
export type FlowEvidence = {
  receipts?:EvidenceReceipt[]
  status: 'off' | 'unavailable' | 'ready'
  approvals: EvidenceApproval[]
  executions: EvidenceExecution[]
  deliveries: EvidenceDelivery[]
}
export const emptyEvidence = (): FlowEvidence => ({
  status: 'off', approvals: [], executions: [], deliveries: []
})
export type QuoteHistory = {
  status: 'off' | 'unavailable' | 'ready'
  quotes: Quote[]
  revisions: Revision[]
  events: QuoteEvent[]
  evidence: FlowEvidence
}
export type Visit = { order: WorkOrder; findings: Finding[] }
export type VisitPage = Page<Visit> & { quotes: QuoteHistory }
export const pageSize = 20
export function historyId(value: string) {
  if (typeof value !== 'string' || !UUID.test(value)) throw new HistoryFailure('invalid')
  return value.toLowerCase()
}
/** Preserve PostgreSQL microseconds, including ties represented in different timezones. */
export function instant(value: string): bigint {
  const match =
    typeof value === 'string' &&
    value.match(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d{1,6}))?(?:Z|[+-]\d\d:\d\d)$/)
  if (!match || !Number.isFinite(Date.parse(value))) throw new HistoryFailure('unavailable')
  return BigInt(Date.parse(value)) * 1000n + BigInt((match[1] || '').padEnd(6, '0').slice(3) || '0')
}
export function compareCursor(a: Cursor, b: Cursor) {
  const delta = instant(a.at) - instant(b.at)
  return delta === 0n ? (a.id < b.id ? -1 : a.id > b.id ? 1 : 0) : delta < 0n ? -1 : 1
}
export function cursorFilter(cursor: Cursor, column: string) {
  historyId(cursor.id)
  instant(cursor.at)
  return `${column}.lt.${cursor.at},and(${column}.eq.${cursor.at},id.lt.${cursor.id})`
}
export function slicePage<T extends { id: string }>(
  rows: T[],
  column: (row: T) => string,
  after: Cursor | null,
  size = pageSize
): Page<T> {
  const sorted = [...rows].sort(
    (a, b) => -compareCursor({ at: column(a), id: a.id }, { at: column(b), id: b.id })
  )
  const ids = new Set<string>()
  for (const row of sorted) {
    historyId(row.id)
    instant(column(row))
    if (ids.has(row.id) || (after && compareCursor({ at: column(row), id: row.id }, after) >= 0))
      throw new HistoryFailure('unavailable')
    ids.add(row.id)
  }
  const selected = sorted.slice(0, size),
    last = selected.at(-1)
  return {
    rows: selected,
    next: sorted.length > size && last ? { at: column(last), id: last.id } : null
  }
}
export function resolutionLabel(f: Finding) {
  return f.result !== 'attention'
    ? 'No aplica'
    : f.resolution === 'pending'
      ? 'Pendiente'
      : f.resolution === 'resolved'
        ? 'Resolución registrada'
        : 'Resolución no registrada'
}
export function historyMessage(error: unknown) {
  return error instanceof HistoryFailure && error.kind === 'denied'
    ? 'Sesión o membresía no válida. Vuelve a verificar tu acceso.'
    : 'No pudimos consultar el historial. Comprueba la conexión y reintenta.'
}
export type Vehicle = VehicleChoice
