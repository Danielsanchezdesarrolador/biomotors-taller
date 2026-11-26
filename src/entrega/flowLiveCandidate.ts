/**
 * BT-FLOW-LIVE-02 candidate transport. Never imported by the active CP05 UI.
 * Explicit rollout gate defaults OFF. Direct table writes are forbidden:
 * the private SQL RPCs derive actor, tenant and CLP totals on the server.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
import type { Quote, Revision } from '../cp05/contracts'
import { validId } from '../ordenes/cp04Contracts'
import { executionPreview, type ExecutionInput } from './executionPreview'

export type ApprovalMethod = 'in_person' | 'phone' | 'written' | 'other'
export type HandoverMethod = 'in_person' | 'authorized_pickup' | 'other'
export type HandoverChecklist = {
  vehicleChecked: boolean
  workChecked: boolean
  documentsChecked: boolean
  pendingExplained: boolean
}
export type ApprovalRecord = {
  id: string
  workshop_id: string
  order_id: string
  quote_id: string
  revision_id: string
  request_id: string
  recorded_by: string
  evidence_status: 'operator_attested'
  method: ApprovalMethod
  note: string
}
export type ExecutionRecord = {
  id: string
  workshop_id: string
  order_id: string
  vehicle_id: string
  quote_id: string
  revision_id: string
  approval_id: string
  request_id: string
  reviewed_by: string
  quoted_total: number
  performed_total: number
  performed_net: number
  performed_tax: number
  decisions: Record<string, 'performed' | 'not_performed'>
  pending_note: string
  evidence_status: 'operator_attested'
}
export type HandoverRecord = {
  id: string
  workshop_id: string
  order_id: string
  vehicle_id: string
  quote_id: string
  revision_id: string
  report_id: string
  request_id: string
  recorded_by: string
  evidence_status: 'operator_attested'
  handover_method: HandoverMethod
  handover_note: string
}
export class FlowLiveFailure extends Error {
  constructor(public readonly kind: 'disabled' | 'denied' | 'invalid' |
    'conflict' | 'unavailable' | 'unconfirmed' | 'order_not_ready') {
    super(kind)
  }
}
const reject = (kind: FlowLiveFailure['kind']): never => {
  throw new FlowLiveFailure(kind)
}
function textNote(value: string, min: number, max: number) {
  if (typeof value !== 'string' || value.trim().length < min ||
    value.trim().length > max) reject('invalid')
  return value.trim()
}
const staff = ['owner', 'admin', 'reception']
export function flowLiveCandidate(
  client: Pick<SupabaseClient, 'auth' | 'rpc' | 'from'>,
  context: Context,
  policy: { explicitlyApproved: boolean } = { explicitlyApproved: false }
) {
  const workshopId = validId(context.workshop.id)
  const userId = validId(context.userId)
  let disposed = false
  function active() {
    if (disposed) reject('denied')
    if (!policy.explicitlyApproved) reject('disabled')
    if (!staff.includes(context.role) || context.workshop.status !== 'active') reject('denied')
  }
  async function authorized() {
    active()
    const { data, error } = await client.auth.getUser()
    active()
    if (error || !data.user || data.user.id !== userId ||
      !data.user.email_confirmed_at) reject('denied')
  }
  async function request<T>(name: string, args: Record<string, unknown>): Promise<T> {
    await authorized()
    let response: { data: unknown; error: { code?: string; message?:string } | null }
    try {
      response = await client.rpc(name, args)
    } catch { return reject('unavailable') }
    await authorized()
    if (response.error) {
      if (['42501', 'PGRST301'].includes(response.error.code || '')) reject('denied')
      if(response.error.code==='55000'&&response.error.message?.includes('BT_FLOW_ORDER_NOT_READY'))reject('order_not_ready')
      if (['23505', '40001', '55000'].includes(response.error.code || '')) reject('conflict')
      if (['22023', '23514'].includes(response.error.code || '')) reject('invalid')
      reject('unavailable')
    }
    if (!response.data || typeof response.data !== 'object' ||
      Array.isArray(response.data)) reject('unconfirmed')
    return response.data as T
  }
  function checkResponse(
    response: { id: string; workshop_id: string; request_id: string;
      evidence_status: string },
    requestId: string
  ) {
    if (!response || !response.id || validId(response.id) !== response.id ||
      response.workshop_id !== workshopId || response.request_id !== requestId ||
      response.evidence_status !== 'operator_attested') reject('unconfirmed')
  }
  async function approval(
    quote: Quote,
    revision: Revision,
    method: ApprovalMethod,
    note: string,
    requestId: string
  ): Promise<ApprovalRecord> {
    active()
    const rid = validId(requestId)
    if (!(['in_person', 'phone', 'written', 'other'] as string[]).includes(method))
      reject('invalid')
    const review = executionPreview(revision, quote, {
      decisions: {}, pendingExplanation: '', operatorReviewed: false
    })
    if (review.revision.workshop_id !== workshopId) reject('denied')
    const record = await request<ApprovalRecord>('bt_flow_record_quote_approval', {
      p_workshop_id: workshopId, p_quote_id: quote.id,
      p_revision_id: revision.id, p_request_id: rid,
      p_method: method, p_note: textNote(note, 0, 1000)
    })
    checkResponse(record, rid)
    if (record.quote_id !== quote.id || record.revision_id !== revision.id ||
      record.order_id !== quote.order_id || record.recorded_by !== userId ||
      record.method !== method || record.note !== textNote(note, 0, 1000))
      reject('unconfirmed')
    return record
  }
  async function execution(
    quote: Quote,
    revision: Revision,
    input: ExecutionInput,
    requestId: string
  ): Promise<ExecutionRecord> {
    active()
    const rid = validId(requestId)
    const review = executionPreview(revision, quote, input)
    if (review.revision.workshop_id !== workshopId) reject('denied')
    if (!review.readyForDraftPdf) reject('invalid')
    const record = await request<ExecutionRecord>('bt_flow_record_execution', {
      p_workshop_id: workshopId, p_quote_id: quote.id,
      p_revision_id: revision.id, p_request_id: rid,
      p_decisions: input.decisions,
      p_pending_note: review.pendingExplanation,
      p_operator_reviewed: true
    })
    checkResponse(record, rid)
    if (record.order_id !== quote.order_id ||
      record.vehicle_id !== quote.vehicle_id || record.quote_id !== quote.id ||
      record.revision_id !== revision.id || record.reviewed_by !== userId ||
      record.quoted_total !== review.quoted.total ||
      record.performed_net !== review.executed.subtotal ||
      record.performed_tax !== review.executed.tax ||
      record.performed_total !== review.executed.total ||
      record.pending_note !== review.pendingExplanation ||
      !record.decisions || typeof record.decisions !== 'object' ||
      Array.isArray(record.decisions) ||
      Object.keys(record.decisions).length !== Object.keys(input.decisions).length ||
      Object.keys(input.decisions).some(id => record.decisions[id] !== input.decisions[id]))
      reject('unconfirmed')
    return record
  }
  async function handover(
    report: ExecutionRecord, checklist: HandoverChecklist,
    method: HandoverMethod, note: string,
    confirmed: boolean, requestId: string
  ): Promise<HandoverRecord> {
    active()
    const rid = validId(requestId)
    if (!report || report.workshop_id !== workshopId ||
      report.evidence_status !== 'operator_attested' ||
      !checklist || !Object.values(checklist).every(v => v === true) ||
      !confirmed ||
      !(['in_person','authorized_pickup','other'] as string[]).includes(method))
      reject('invalid')
    const record = await request<HandoverRecord>('bt_flow_record_handover', {
      p_workshop_id: workshopId, p_report_id: validId(report.id),
      p_request_id: rid, p_checklist: checklist,
      p_handover_method: method, p_handover_note: textNote(note,0,1000),
      p_operator_confirmed: true
    })
    checkResponse(record,rid)
    if (record.report_id !== report.id || record.order_id !== report.order_id ||
      record.vehicle_id !== report.vehicle_id ||
      record.quote_id !== report.quote_id || record.revision_id !== report.revision_id ||
      record.recorded_by !== userId || record.handover_method !== method ||
      record.handover_note !== textNote(note, 0, 1000))
      reject('unconfirmed')
    return record
  }
  /**
   * Read-only durable recovery, safe across login or browser restart once the
   * candidate SQL is explicitly installed and enabled. Rows remain subject to
   * the server's RLS; no client-side cached copy of workshop data is used.
   */
  async function history(quote: Quote, revision: Revision): Promise<{
    approval: ApprovalRecord | null
    execution: ExecutionRecord | null
    handover: HandoverRecord | null
  }> {
    await authorized()
    if (quote.workshop_id !== workshopId ||
      revision.workshop_id !== workshopId ||
      revision.quote_id !== quote.id ||
      revision.payload?.quote?.id !== quote.id ||
      revision.payload?.vehicle?.id !== quote.vehicle_id ||
      revision.payload?.order?.id !== quote.order_id) reject('denied')
    const [approvals, reports, deliveries] = await Promise.all([
      client.from('bt_flow_quote_approvals').select('*')
        .eq('workshop_id', workshopId).eq('quote_id', quote.id)
        .eq('revision_id', revision.id).maybeSingle(),
      client.from('bt_flow_execution_reports').select('*')
        .eq('workshop_id', workshopId).eq('quote_id', quote.id)
        .eq('revision_id', revision.id).maybeSingle(),
      client.from('bt_flow_visit_deliveries').select('*')
        .eq('workshop_id', workshopId).eq('quote_id', quote.id)
        .eq('revision_id', revision.id).maybeSingle()
    ])
    await authorized()
    for (const result of [approvals, reports, deliveries]) {
      if (result.error) {
        if (['42501','PGRST301'].includes(result.error.code || '')) reject('denied')
        reject('unavailable')
      }
    }
    const a = approvals.data as ApprovalRecord | null
    const e = reports.data as ExecutionRecord | null
    const d = deliveries.data as HandoverRecord | null
    for (const item of [a,e,d]) {
      if (!item) continue
      if (item.workshop_id !== workshopId || item.quote_id !== quote.id ||
          item.revision_id !== revision.id || item.order_id !== quote.order_id ||
          item.evidence_status !== 'operator_attested' ||
          !item.id || validId(item.id) !== item.id) reject('unconfirmed')
    }
    if (a && (!(['in_person', 'phone', 'written', 'other'] as string[]).includes(a.method) ||
        typeof a.note !== 'string' || a.note.length > 1000)) reject('unconfirmed')
    if (e && (!a || e.approval_id !== a.id ||
        e.vehicle_id !== quote.vehicle_id)) reject('unconfirmed')
    if (e) {
      try {
        const verified = executionPreview(revision, quote, {
          decisions: e.decisions, pendingExplanation: e.pending_note,
          operatorReviewed: true
        })
        if (!verified.readyForDraftPdf ||
            verified.quoted.total !== e.quoted_total ||
            verified.executed.subtotal !== e.performed_net ||
            verified.executed.tax !== e.performed_tax ||
            verified.executed.total !== e.performed_total)
          reject('unconfirmed')
      } catch { reject('unconfirmed') }
    }
    if (d && (!e || d.report_id !== e.id ||
        d.vehicle_id !== quote.vehicle_id ||
        typeof d.handover_note !== 'string' || d.handover_note.length > 1000)) reject('unconfirmed')
    return { approval: a, execution: e, handover: d }
  }
  return Object.freeze({
    approval, execution, handover, history,
    dispose: () => { disposed = true }
  })
}
