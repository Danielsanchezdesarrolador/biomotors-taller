/**
 * CP06 / BT-FLOW-LIVE-02 — read-only historical evidence from immutable SQL rows.
 * This module is loaded only in an explicitly enabled private build.
 * The CP06 repository supplies its RLS-bound, paginated, abortable SELECT reader.
 * No UPDATE, INSERT, DELETE, RPC, email or state transition is performed here.
 */
import type { Quote, Revision } from '../cp05/contracts'
import { HistoryFailure, historyId, instant, type FlowEvidence } from './contracts'

type Row = { workshop_id: string; id: string }
type Loader = <T extends Row>(
  table: string, ids: string[], column: string, foreign?: string, vehicleId?: string
) => Promise<T[]>

const methods = ['in_person', 'phone', 'written', 'other']
const handoverMethods = ['in_person', 'authorized_pickup', 'other']
const safeMoney = (n: unknown): n is number =>
  typeof n === 'number' && Number.isSafeInteger(n) && n >= 0

function invalid(): never { throw new HistoryFailure('unavailable') }
function denied(): never { throw new HistoryFailure('denied') }
function amount(net: number) {
  if (!safeMoney(net) || !safeMoney(net * 19)) invalid()
  const tax = Math.floor((net * 19 + 50) / 100)
  if (!safeMoney(net + tax)) invalid()
  return { net, tax, total: net + tax }
}
function requireId(value: string) {
  try { return historyId(value) } catch { return denied() }
}
function verifyActor(row: { recorded_by?: string; reviewed_by?: string }) {
  requireId((row.recorded_by || row.reviewed_by) as string)
}

/** Validates ALL rows before returning any of them to the UI. */
export async function readFlowEvidence(
  workshopId: string,
  vehicleId: string,
  quotes: Quote[],
  revisions: Revision[],
  load: Loader
): Promise<FlowEvidence> {
  const wid = requireId(workshopId), vid = requireId(vehicleId)
  if (!revisions.length)
    return { status: 'ready', approvals: [], executions: [], deliveries: [] }
  const quoteById = new Map(quotes.map(q => [q.id, q]))
  const revById = new Map(revisions.map(r => [r.id, r]))
  const ids = revisions.map(r => requireId(r.id))
  if (new Set(ids).size !== ids.length) denied()
  for (const r of revisions) {
    const q = quoteById.get(r.quote_id), p = r.payload
    if (!q || q.workshop_id !== wid || q.vehicle_id !== vid ||
        r.workshop_id !== wid || p?.quote?.id !== q.id ||
        p?.quote?.workshop_id !== wid || p?.order?.id !== q.order_id ||
        p?.vehicle?.id !== vid || p?.customer?.id !== q.customer_id ||
        p?.quote?.revision !== r.revision || !Array.isArray(p.items))
      denied()
  }
  const [approvals, executions, deliveries] = await Promise.all([
    load<FlowEvidence['approvals'][number]>(
      'bt_flow_quote_approvals', ids, 'recorded_at', 'revision_id'
    ),
    load<FlowEvidence['executions'][number]>(
      'bt_flow_execution_reports', ids, 'recorded_at', 'revision_id', vid
    ),
    load<FlowEvidence['deliveries'][number]>(
      'bt_flow_visit_deliveries', ids, 'recorded_at', 'revision_id', vid
    )
  ])
  const approvalMap = new Map<string, FlowEvidence['approvals'][number]>()
  const executionMap = new Map<string, FlowEvidence['executions'][number]>()
  const seen = new Set<string>()
  function verifyBase(row: Row & {
    order_id: string; quote_id: string; revision_id: string
    evidence_status: string; recorded_at: string
  }, kind: string) {
    const q = quoteById.get(row.quote_id), r = revById.get(row.revision_id)
    if (row.workshop_id !== wid || !q || !r || r.quote_id !== q.id ||
        q.vehicle_id !== vid || row.order_id !== q.order_id ||
        row.evidence_status !== 'operator_attested') denied()
    requireId(row.id)
    requireId(row.revision_id)
    requireId(row.quote_id)
    requireId(row.order_id)
    instant(row.recorded_at)
    const key = kind + ':' + row.revision_id
    if (seen.has(key)) invalid()
    seen.add(key)
    return r
  }
  for (const a of approvals) {
    verifyBase(a, 'approval')
    verifyActor(a)
    if (!methods.includes(a.method) || typeof a.note !== 'string' ||
        a.note.length > 1000) invalid()
    approvalMap.set(a.id, a)
  }
  for (const e of executions) {
    const r = verifyBase(e, 'execution')
    verifyActor(e)
    if (requireId(e.vehicle_id) !== vid) denied()
    if (!approvalMap.has(e.approval_id)) denied()
    const a = approvalMap.get(e.approval_id)!
    if (a.quote_id !== e.quote_id || a.revision_id !== e.revision_id ||
        a.order_id !== e.order_id) denied()
    if (!e.decisions || typeof e.decisions !== 'object' ||
        Array.isArray(e.decisions) || typeof e.pending_note !== 'string' ||
        e.pending_note.length > 2000) invalid()
    const items = r.payload.items
    if (!items.length || items.length > 200 ||
        Object.keys(e.decisions).length !== items.length) invalid()
    const itemIds = new Set<string>()
    let totalNet = 0, performedNet = 0, pending = false
    for (const item of items) {
      const id = requireId(item.id)
      if (itemIds.has(id) || item.workshop_id !== wid ||
          item.quote_id !== r.quote_id || !safeMoney(item.line_net) ||
          !Number.isSafeInteger(item.quantity100) || item.quantity100 <= 0 ||
          !safeMoney(item.unit_price) ||
          !safeMoney(item.quantity100 * item.unit_price) ||
          item.line_net !== Math.floor((item.quantity100 * item.unit_price + 50) / 100))
        invalid()
      itemIds.add(id)
      const value = e.decisions[id]
      if (value !== 'performed' && value !== 'not_performed') invalid()
      totalNet += item.line_net
      if (value === 'performed') performedNet += item.line_net
      else pending = true
    }
    if (Object.keys(e.decisions).some(k => !itemIds.has(k))) invalid()
    const quoted = amount(totalNet), performed = amount(performedNet)
    if (pending && e.pending_note.trim().length < 1) invalid()
    if (!safeMoney(e.quoted_net) || !safeMoney(e.quoted_tax) ||
        !safeMoney(e.quoted_total) || !safeMoney(e.performed_net) ||
        !safeMoney(e.performed_tax) || !safeMoney(e.performed_total) ||
        r.payload.totals.subtotal !== quoted.net ||
        r.payload.totals.tax !== quoted.tax ||
        r.payload.totals.total !== quoted.total ||
        quoted.net !== e.quoted_net || quoted.tax !== e.quoted_tax ||
        quoted.total !== e.quoted_total ||
        performed.net !== e.performed_net || performed.tax !== e.performed_tax ||
        performed.total !== e.performed_total) invalid()
    executionMap.set(e.id, e)
  }
  for (const d of deliveries) {
    verifyBase(d, 'handover')
    verifyActor(d)
    if (requireId(d.vehicle_id) !== vid) denied()
    const e = executionMap.get(d.report_id)
    if (!e || e.quote_id !== d.quote_id || e.revision_id !== d.revision_id ||
        e.order_id !== d.order_id) denied()
    if (!handoverMethods.includes(d.handover_method) ||
        typeof d.handover_note !== 'string' ||
        d.handover_note.length > 1000 ||
        !d.checklist ||
        !['vehicleChecked','workChecked','documentsChecked','pendingExplained']
          .every(k => d.checklist[k] === true)) invalid()
  }
  const planned=revisions.filter(r=>r.payload.order.intake_phase==='planned').map(r=>r.id)
  const receipts=planned.length?await load<NonNullable<FlowEvidence['receipts']>[number]>('bt_agenda_receipts',planned,'received_at','revision_id',vid):[]
  const received=new Set<string>()
  for(const receipt of receipts){
    const r=revById.get(receipt.revision_id),q=r&&quoteById.get(r.quote_id)
    if(!q||receipt.workshop_id!==wid||receipt.order_id!==q.order_id||receipt.quote_id!==q.id||receipt.vehicle_id!==vid||receipt.customer_id!==q.customer_id||received.has(receipt.order_id))denied()
    requireId(receipt.id);requireId(receipt.recorded_by);instant(receipt.received_at)
    if(!Number.isInteger(receipt.odometer)||receipt.odometer<0||receipt.odometer>3000000||typeof receipt.complaint!=='string'||receipt.complaint.trim().length<1||receipt.complaint.length>2000)invalid()
    received.add(receipt.order_id)
  }
  return { status: 'ready', approvals, executions, deliveries, receipts }
}
