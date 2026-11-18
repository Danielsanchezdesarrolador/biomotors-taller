import { describe, expect, it, vi } from 'vitest'
import type { Quote, Revision } from '../cp05/contracts'
import type { EvidenceApproval, EvidenceExecution, EvidenceDelivery } from './contracts'
import { readFlowEvidence } from './flowEvidence'
const id = (n: number) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0')
const wid=id(1), vid=id(2), oid=id(3), qid=id(4), rid=id(5), uid=id(6), cid=id(7)
const t='2026-11-18T12:00:00.123456Z'
const quote: Quote = {
  id: qid, workshop_id: wid, order_id: oid, vehicle_id: vid, customer_id: cid,
  number: 10, version: 2, status: 'issued', price_basis: 'net',
  valid_days: 10, terms: '', comments: '', issued_revision: 1,
  issue_pending: false, void_reason: null, created_at: t, updated_at: t
}
const revision: Revision = {
  workshop_id: wid, id: rid, quote_id: qid, revision: 1, issued_at: t,
  payload_sha256: 'a'.repeat(64), pdf_object_path: 'private', pdf_sha256: 'b'.repeat(64),
  pdf_size: 12, issued_by: uid, payload: {
    workshop: { id: wid, name: 'Taller sintético' },
    customer: { id: cid, full_name: 'QA', email: null, mobile_e164: null },
    vehicle: { id: vid, plate: 'QA1234', make: 'QA', model: 'Auto' },
    order: { id: oid, complaint: 'QA', opened_at: t, intake_odometer: 1000 },
    quote: { ...quote, revision: 1 },
    items: [
      { workshop_id: wid, quote_id: qid, id: id(10), position: 0, description: 'Trabajo',
        type: 'Mano de obra', quantity100: 100, unit_price: 100, line_net: 100 },
      { workshop_id: wid, quote_id: qid, id: id(11), position: 1, description: 'Repuesto',
        type: 'Repuesto', quantity100: 100, unit_price: 50, line_net: 50 }
    ],
    totals: { subtotal: 150, tax: 29, total: 179 },
    document_date: t, notice: 'No tributario'
  }
}
const approval: EvidenceApproval = {
  workshop_id: wid, id: id(20), order_id: oid, quote_id: qid, revision_id: rid,
  evidence_status: 'operator_attested', recorded_at: t, recorded_by: uid,
  method: 'phone', note: 'Conformidad anotada por teléfono, declaración QA'
}
const execution: EvidenceExecution = {
  workshop_id: wid, id: id(21), order_id: oid, vehicle_id: vid,
  quote_id: qid, revision_id: rid, approval_id: approval.id,
  evidence_status: 'operator_attested', recorded_at: t, reviewed_by: uid,
  decisions: { [id(10)]: 'performed', [id(11)]: 'not_performed' },
  pending_note: 'Repuesto no ejecutado en la visita',
  quoted_net: 150, quoted_tax: 29, quoted_total: 179,
  performed_net: 100, performed_tax: 19, performed_total: 119
}
const delivery: EvidenceDelivery = {
  workshop_id: wid, id: id(22), order_id: oid, vehicle_id: vid,
  quote_id: qid, revision_id: rid, report_id: execution.id,
  evidence_status: 'operator_attested', recorded_at: t, recorded_by: uid,
  checklist: { vehicleChecked: true, workChecked: true,
    documentsChecked: true, pendingExplained: true },
  handover_method: 'in_person', handover_note: 'Retiro declarado en el taller por responsable QA'
}
function setup() {
  const rows: Record<string, Array<{ workshop_id: string; id: string }>> = {
    bt_flow_quote_approvals: [approval],
    bt_flow_execution_reports: [execution],
    bt_flow_visit_deliveries: [delivery]
  }
  const load=vi.fn(async (table: string, ids: string[], _column: string,
    _foreign?: string, _vehicle?: string) => rows[table].filter(x =>
      ids.includes((x as unknown as { revision_id: string }).revision_id)))
  return { rows, load, run: () => readFlowEvidence(wid, vid, [quote], [revision], load) }
}
describe('CP06 LIVE-02 immutable evidence reader (build gated)', () => {
  it('does not query absent revisions', async () => {
    const s=setup()
    expect(await readFlowEvidence(wid,vid,[quote],[],s.load)).toEqual({
      status: 'ready', approvals: [], executions: [], deliveries: []
    })
    expect(s.load).not.toHaveBeenCalled()
  })
  it('shows all three declarations together without inferring payment or signature', async () => {
    const s=setup(), result=await s.run()
    expect(result.status).toBe('ready')
    expect(result.approvals).toEqual([approval])
    expect(result.executions).toEqual([execution])
    expect(result.deliveries).toEqual([delivery])
    expect(s.load).toHaveBeenCalledTimes(3)
    expect(s.load.mock.calls.every(call => call[1].length === 1 &&
      call[1][0] === rid)).toBe(true)
  })
  it('refuses cross-tenant, cross-vehicle and other revision rows', async () => {
    const a=setup()
    a.rows.bt_flow_quote_approvals=[{ ...approval, workshop_id: id(99) }]
    await expect(a.run()).rejects.toMatchObject({ kind:'denied' })
    const b=setup()
    b.rows.bt_flow_execution_reports=[{ ...execution, vehicle_id: id(99) }]
    await expect(b.run()).rejects.toMatchObject({ kind:'denied' })
    const c=setup()
    c.rows.bt_flow_visit_deliveries=[{ ...delivery, revision_id: id(99) }]
    await expect(c.run()).rejects.toMatchObject({ kind:'denied' })
  })
  it('rejects fabricated amounts, incomplete work flags or missing approval', async () => {
    const a=setup()
    a.rows.bt_flow_execution_reports=[{ ...execution, performed_total: 1000 }]
    await expect(a.run()).rejects.toMatchObject({ kind:'unavailable' })
    const b=setup()
    b.rows.bt_flow_execution_reports=[{ ...execution, decisions: { [id(10)]: 'performed' } }]
    await expect(b.run()).rejects.toMatchObject({ kind:'unavailable' })
    const c=setup()
    c.rows.bt_flow_quote_approvals=[]
    await expect(c.run()).rejects.toMatchObject({ kind:'denied' })
  })
  it('refuses forged delivery linkage and incomplete checklist', async () => {
    const a=setup()
    a.rows.bt_flow_visit_deliveries=[{ ...delivery, report_id: id(95) }]
    await expect(a.run()).rejects.toMatchObject({ kind:'denied' })
    const b=setup()
    b.rows.bt_flow_visit_deliveries=[{ ...delivery,
      checklist: { ...delivery.checklist, pendingExplained: false } }]
    await expect(b.run()).rejects.toMatchObject({ kind:'unavailable' })
  })
  it('keeps old declaration attached to immutable revision when quote changes', async () => {
    const s=setup()
    const old={ ...quote, status: 'voided' as const, issued_revision: 2 }
    const result=await readFlowEvidence(wid,vid,[old],[revision],s.load)
    expect(result.executions[0].performed_total).toBe(119)
  })
})
