/**
 * BT-COM-01D: isolated visual fixture only. Never imported by production.
 * Synthetic identifiers and recipient; no Supabase calls, file download or mail.
 */
import type { Quote, Revision } from '../../src/cp05/contracts'
import type { FlowEvidence } from '../../src/historial/contracts'
import { AppShell } from '../../src/layout/AppShell'
import { ClosingReviewPanel } from '../../src/historial/ClosingReviewPanel'
import '../../src/historial/history.css'

const id = (n: number) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0')
const wid = id(1), cid = id(2), vid = id(3), oid = id(4),
  qid = id(5), rid = id(6), uid = id(7)
const time = '2026-11-18T13:00:00.123456Z'
const quote: Quote = {
  id: qid, workshop_id: wid, order_id: oid, vehicle_id: vid,
  customer_id: cid, number: 1, version: 1, status: 'issued',
  price_basis: 'net', valid_days: 30, terms: '', comments: '',
  issued_revision: 1, issue_pending: false, void_reason: null,
  created_at: time, updated_at: time
}
const revision: Revision = {
  workshop_id: wid, id: rid, quote_id: qid, revision: 1,
  issued_at: time, issued_by: uid,
  payload_sha256: 'a'.repeat(64), pdf_sha256: 'b'.repeat(64),
  pdf_object_path: 'private-qa/revision.pdf', pdf_size: 500,
  payload: {
    workshop: { id: wid, name: 'Taller sintético ByteTorque' },
    customer: {
      id: cid, full_name: 'Cliente inventado de control',
      email: 'synthetic@invalid.test', mobile_e164: null
    },
    vehicle: { id: vid, plate: 'QA1234', make: 'Vehículo', model: 'de pruebas' },
    order: { id: oid, opened_at: time, complaint: 'Revisar frenos de prueba',
      intake_odometer: 12345 },
    quote: { ...quote, revision: 1 },
    items: [
      { workshop_id: wid, quote_id: qid, id: id(20), position: 0,
        type: 'Repuesto', description: 'Pastillas de freno sintéticas',
        quantity100: 100, unit_price: 100, line_net: 100 },
      { workshop_id: wid, quote_id: qid, id: id(21), position: 1,
        type: 'Mano de obra', description: 'Cambio de pastillas sintético pendiente',
        quantity100: 100, unit_price: 50, line_net: 50 }
    ],
    totals: { subtotal: 150, tax: 29, total: 179 },
    document_date: time, notice: 'Documento no tributario de QA'
  }
}
const approval = {
  workshop_id: wid, id: id(30), order_id: oid, quote_id: qid, revision_id: rid,
  recorded_at: time, recorded_by: uid, method: 'phone',
  note: 'Aprobación declarada solo en QA', evidence_status: 'operator_attested' as const
}
const report = {
  workshop_id: wid, id: id(31), order_id: oid, quote_id: qid,
  revision_id: rid, vehicle_id: vid, approval_id: approval.id,
  recorded_at: time, reviewed_by: uid, decisions: {
    [id(20)]: 'performed', [id(21)]: 'not_performed'
  }, pending_note: 'Cambio de pastillas pendiente de nueva visita.',
  quoted_net: 150, quoted_tax: 29, quoted_total: 179,
  performed_net: 100, performed_tax: 19, performed_total: 119,
  evidence_status: 'operator_attested' as const
}
const delivery = {
  workshop_id: wid, id: id(32), order_id: oid, quote_id: qid,
  revision_id: rid, vehicle_id: vid, report_id: report.id,
  recorded_at: time, recorded_by: uid,
  handover_method: 'in_person',
  handover_note: 'Entrega declarada en taller de pruebas sin firma',
  checklist: { vehicleChecked: true, workChecked: true,
    documentsChecked: true, pendingExplained: true },
  evidence_status: 'operator_attested' as const
}
const missing = typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('scenario') === 'missing'
const evidence: FlowEvidence = {
  status: 'ready', approvals: [approval], executions: [report],
  deliveries: missing ? [] : [delivery]
}
export function ClosingReviewFixture() {
  return (
    <AppShell
      screen="clientes"
      onNavigate={() => {}}
      search={{ value: '', onChange: () => {}, label: 'Buscar · QA sin datos alojados' }}
      copy={{
        workshopTitle: 'Taller sintético ByteTorque',
        workshopSubtitle: 'Control visual aislado',
        workshopStatus: 'Datos solo en memoria',
        version: 'BT-COM-01D · QA VISUAL',
        accountTitle: 'Operador sintético de laboratorio',
        accountSubtitle: 'Administrador (simulado)',
        notifications: 'QA sin acceso a servidores',
        avatarText: 'BT',
        notificationDot: false
      }}
    >
      <section className="cp03-pilot cp06-history" style={{ maxWidth: '1180px', margin: 'auto' }}>
        <header>
          <h1>Cierre documental · vista previa</h1>
          <p>Ensayo visual con datos inventados. Sin archivo privado, registro ni envío.</p>
        </header>
        <div className="dashboard-card cp06-visit">
          <h2>Cotización histórica COT-000001</h2>
          <p>Solo lectura · revisión emitida con datos sintéticos.</p>
          <ClosingReviewPanel
            quote={quote} revision={revision}
            evidence={evidence} downloading={false}
          />
        </div>
      </section>
    </AppShell>
  )
}
