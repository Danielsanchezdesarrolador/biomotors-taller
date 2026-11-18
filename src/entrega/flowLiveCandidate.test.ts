import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
import type { Quote, Revision, Snapshot } from '../cp05/contracts'
import { FlowLiveFailure, flowLiveCandidate } from './flowLiveCandidate'

const id = (n: number) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0')
const wid = id(1), uid = id(2), qid = id(3), revid = id(4), oid = id(5)
const vid = id(6), cid = id(7), rid = id(90)
const context: Context = {
  userId: uid, role: 'owner',
  workshop: { id: wid, name: 'QA A', status: 'active' }
}
const quote: Quote = {
  workshop_id: wid, id: qid, order_id: oid, vehicle_id: vid, customer_id: cid,
  number: 7, version: 3, status: 'issued', price_basis: 'net',
  valid_days: 10, terms: 'QA', comments: '', issued_revision: 1,
  issue_pending: false, void_reason: null,
  created_at: '2026-11-18T11:00:00Z', updated_at: '2026-11-18T12:00:00Z'
}
const snapshot: Snapshot = {
  quote: { ...quote, revision: 1 },
  workshop: { id: wid, name: 'QA A' },
  customer: { id: cid, full_name: 'Cliente Sintético', email: null, mobile_e164: null },
  vehicle: { id: vid, plate: 'QA1234', make: 'QA', model: 'Vehículo' },
  order: { id: oid, opened_at: '2026-11-18T11:00:00Z',
    complaint: 'Revisar frenos', intake_odometer: 1000 },
  items: [
    { id: id(10), workshop_id: wid, quote_id: qid,
      position: 0, type: 'Repuesto', description: 'Pastillas sintéticas',
      quantity100: 100, unit_price: 100, line_net: 100 },
    { id: id(11), workshop_id: wid, quote_id: qid,
      position: 1, type: 'Mano de obra', description: 'Servicio sintético',
      quantity100: 100, unit_price: 50, line_net: 50 }
  ],
  totals: { subtotal: 150, tax: 29, total: 179 },
  document_date: '2026-11-18T12:00:00Z', notice: 'No es documento tributario'
}
const revision: Revision = {
  workshop_id: wid, id: revid, quote_id: qid, revision: 1,
  payload: snapshot, issued_at: '2026-11-18T12:00:00Z',
  payload_sha256: 'a'.repeat(64), pdf_object_path: 'private-only',
  pdf_sha256: 'b'.repeat(64), pdf_size: 100, issued_by: uid
}
const note = 'Revisión autorizada declarada por el operador; no constituye firma'
const pendingNote = 'Servicio de mano de obra pendiente para otra visita'
const decisions = { [id(10)]: 'performed' as const, [id(11)]: 'not_performed' as const }
const input = { decisions, pendingExplanation: pendingNote, operatorReviewed: true }
const approval = {
  id: id(60), workshop_id: wid, order_id: oid, quote_id: qid,
  revision_id: revid, request_id: rid, recorded_by: uid,
  evidence_status: 'operator_attested', method: 'in_person'
}
const report = {
  id: id(70), workshop_id: wid, order_id: oid, vehicle_id: vid,
  quote_id: qid, revision_id: revid, approval_id: approval.id,
  request_id: rid, reviewed_by: uid, quoted_total: 179,
  performed_net: 100, performed_tax: 19, performed_total: 119,
  evidence_status: 'operator_attested'
}
const handover = {
  id: id(80), workshop_id: wid, order_id: oid, vehicle_id: vid,
  quote_id: qid, revision_id: revid, report_id: report.id,
  request_id: rid, recorded_by: uid, evidence_status: 'operator_attested',
  handover_method: 'in_person'
}
const checklist = {
  vehicleChecked: true, workChecked: true,
  documentsChecked: true, pendingExplained: true
}
function setup() {
  const getUser = vi.fn(async () => ({
    data: { user: { id: uid, email_confirmed_at: '2026-11-18T12:00:00Z' } },
    error: null
  }))
  const rpc = vi.fn(async (name: string) => ({
    data: name === 'bt_flow_record_quote_approval' ? approval :
      name === 'bt_flow_record_execution' ? report : handover,
    error: null as null | { code?: string }
  }))
  const client = { auth: { getUser }, rpc } as unknown as SupabaseClient
  return { client, getUser, rpc }
}
describe('BT-FLOW-LIVE-02 real-data transport candidate (OFF)', () => {
  it('disabled by default, makes zero network calls and cannot be used from inactive contexts', async () => {
    const f = setup()
    await expect(flowLiveCandidate(f.client, context)
      .approval(quote, revision, 'in_person', note, rid))
      .rejects.toMatchObject({ kind: 'disabled' })
    expect(f.getUser).not.toHaveBeenCalled()
    expect(f.rpc).not.toHaveBeenCalled()
    const wrong = flowLiveCandidate(f.client, { ...context, role: 'mechanic' },
      { explicitlyApproved: true })
    await expect(wrong.approval(quote, revision, 'in_person', note, rid))
      .rejects.toMatchObject({ kind: 'denied' })
    expect(f.rpc).not.toHaveBeenCalled()
  })
  it('uses only server RPCs and checks exact receipt IDs and computed totals', async () => {
    const f = setup()
    const port = flowLiveCandidate(f.client, context, { explicitlyApproved: true })
    expect(await port.approval(quote, revision, 'in_person', note, rid)).toEqual(approval)
    expect(await port.execution(quote, revision, input, rid)).toEqual(report)
    expect(await port.handover(report, checklist, 'in_person',
      'Vehículo entregado según declaración de prueba, sin firma', true, rid)).toEqual(handover)
    expect(f.rpc).toHaveBeenCalledTimes(3)
    expect(f.rpc).toHaveBeenNthCalledWith(1, 'bt_flow_record_quote_approval',
      expect.objectContaining({
        p_workshop_id: wid, p_quote_id: qid, p_revision_id: revid,
        p_request_id: rid
      }))
    expect(f.rpc).toHaveBeenNthCalledWith(2, 'bt_flow_record_execution',
      expect.objectContaining({
        p_decisions: decisions, p_operator_reviewed: true,
        p_pending_note: pendingNote, p_request_id: rid
      }))
    expect(f.rpc).toHaveBeenNthCalledWith(3, 'bt_flow_record_handover',
      expect.objectContaining({
        p_report_id: report.id, p_checklist: checklist,
        p_operator_confirmed: true
      }))
    port.dispose()
    await expect(port.approval(quote, revision, 'in_person', note, rid))
      .rejects.toMatchObject({ kind: 'denied' })
  })
  it('never sends incomplete or manually invented execution totals', async () => {
    const f = setup()
    const port = flowLiveCandidate(f.client, context, { explicitlyApproved: true })
    await expect(port.execution(quote, revision, {
      ...input, decisions: { [id(10)]: 'performed' }
    }, rid)).rejects.toMatchObject({ kind: 'invalid' })
    await expect(port.execution(quote, revision, {
      ...input, operatorReviewed: false
    }, rid)).rejects.toMatchObject({ kind: 'invalid' })
    await expect(port.execution({ ...quote, status: 'draft' }, revision, input, rid))
      .rejects.toThrow()
    expect(f.rpc).not.toHaveBeenCalled()
  })
  it('never sends an unconfirmed handover, incomplete checklist or cross-tenant report', async () => {
    const f = setup(), port = flowLiveCandidate(f.client, context, { explicitlyApproved: true })
    await expect(port.handover(report,
      { ...checklist, pendingExplained: false }, 'in_person', note, true, rid))
      .rejects.toMatchObject({ kind: 'invalid' })
    await expect(port.handover(report, checklist, 'in_person', note, false, rid))
      .rejects.toMatchObject({ kind: 'invalid' })
    await expect(port.handover({ ...report, workshop_id: id(99) },
      checklist, 'in_person', note, true, rid)).rejects.toMatchObject({ kind: 'invalid' })
    expect(f.rpc).not.toHaveBeenCalled()
  })
  it('refuses to acknowledge a receipt belonging to a different workshop or amount', async () => {
    const f = setup(), port = flowLiveCandidate(f.client, context, { explicitlyApproved: true })
    f.rpc.mockResolvedValueOnce({ data: { ...approval, workshop_id: id(99) }, error: null })
    await expect(port.approval(quote, revision, 'in_person', note, rid))
      .rejects.toMatchObject({ kind: 'unconfirmed' })
    f.rpc.mockResolvedValueOnce({ data: { ...report, performed_total: 179 }, error: null })
    await expect(port.execution(quote, revision, input, rid))
      .rejects.toMatchObject({ kind: 'unconfirmed' })
    f.rpc.mockResolvedValueOnce({ data: { ...handover, report_id: id(99) }, error: null })
    await expect(port.handover(report, checklist, 'in_person', note, true, rid))
      .rejects.toMatchObject({ kind: 'unconfirmed' })
  })
  it('denies session switching/revocation after RPC before reporting success', async () => {
    const f = setup(), port = flowLiveCandidate(f.client, context, { explicitlyApproved: true })
    f.getUser.mockResolvedValueOnce({
      data: { user: { id: uid, email_confirmed_at: '2026-11-18' } }, error: null
    }).mockResolvedValueOnce({
      data: { user: { id: id(99), email_confirmed_at: '2026-11-18' } }, error: null
    })
    await expect(port.approval(quote, revision, 'in_person', note, rid))
      .rejects.toMatchObject({ kind: 'denied' })
    expect(f.rpc).toHaveBeenCalledOnce()
  })
  it('maps SQL access/conflict to explicit local failures without claiming a write', async () => {
    const f = setup(), port = flowLiveCandidate(f.client, context, { explicitlyApproved: true })
    f.rpc.mockResolvedValueOnce({ data: null, error: { code: '42501' } })
    await expect(port.approval(quote, revision, 'in_person', note, rid))
      .rejects.toMatchObject({ kind: 'denied' })
    f.rpc.mockResolvedValueOnce({ data: null, error: { code: '23505' } })
    await expect(port.approval(quote, revision, 'in_person', note, rid))
      .rejects.toMatchObject({ kind: 'conflict' })
    f.rpc.mockResolvedValueOnce({ data: null, error: { code: '55000' } })
    await expect(port.execution(quote, revision, input, rid))
      .rejects.toMatchObject({ kind: 'conflict' })
  })
  it('keeps user identity as the session identity, not a client supplied actor', async () => {
    const f = setup(), port = flowLiveCandidate(f.client, context, { explicitlyApproved: true })
    f.rpc.mockResolvedValueOnce({ data: { ...approval, recorded_by: id(99) }, error: null })
    await expect(port.approval(quote, revision, 'in_person', note, rid))
      .rejects.toMatchObject({ kind: 'unconfirmed' })
    expect(JSON.stringify(f.rpc.mock.calls)).not.toContain('p_actor_id')
    expect(FlowLiveFailure).toBeDefined()
  })
})
