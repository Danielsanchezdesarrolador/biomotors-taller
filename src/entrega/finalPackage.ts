/**
 * BT-COM-01 candidate: deterministic three-document closing packet.
 * Source is the immutable CP05 quote snapshot and three verified,
 * append-only BT-FLOW-LIVE-02 rows. Does not send, sign, archive or invoice.
 */
import type { Quote, Revision } from '../cp05/contracts'
import type { FlowEvidence } from '../historial/contracts'
import { HistoryFailure, historyId, instant } from '../historial/contracts'

type Amount = { net: number; tax: number; total: number }
export type FinalLine = {
  id: string; type: string; description: string; quantity100: number
  lineNet: number; decision: 'performed' | 'not_performed'
}
export type PreparedClosing = {
  state: 'prepared_locally_not_archived_or_emailed'
  bundleId: string
  workshop: { id: string; name: string }
  customer: { id: string; name: string }
  vehicle: { id: string; plate: string | null; description: string }
  order: { id: string; complaint: string; openedAt: string; odometer: number | null }
  quote: {
    id: string; number: number; revision: number; revisionId: string
    pdfSha256: string; payloadSha256: string; fileName: string; total: number
  }
  report: {
    id: string; recordedAt: string; operatorId: string; lines: FinalLine[]
    original: Amount; declared: Amount; pendingNote: string; fileName: string
  }
  handover: {
    id: string; recordedAt: string; operatorId: string; method: string
    note: string; checks: string[]; fileName: string
  }
}
const invalid = (): never => { throw new HistoryFailure('unavailable') }
const denied = (): never => { throw new HistoryFailure('denied') }
const money = (n: number) => Number.isSafeInteger(n) && n >= 0
const fileToken = (id: string) => historyId(id).replace(/-/g, '').slice(0, 12)
const checkNames = [
  ['vehicleChecked', 'Vehículo y receptor verificados por el operador'],
  ['workChecked', 'Trabajos y pendientes revisados con el receptor'],
  ['documentsChecked', 'Cotización e informe revisados'],
  ['pendingExplained', 'Pendientes y recomendaciones explicados']
] as const

/** Packet requires all THREE declared records. It never manufactures missing events. */
export function prepareClosingPacket(
  quote: Quote, revision: Revision, evidence: FlowEvidence
): PreparedClosing {
  if (evidence.status !== 'ready') invalid()
  const p=revision.payload
  if (!p || !quote || !Array.isArray(p.items) ||
      quote.workshop_id !== revision.workshop_id ||
      revision.quote_id !== quote.id ||
      p.quote?.id !== quote.id ||
      p.quote?.workshop_id !== quote.workshop_id ||
      p.quote?.revision !== revision.revision ||
      p.vehicle?.id !== quote.vehicle_id ||
      p.customer?.id !== quote.customer_id ||
      p.order?.id !== quote.order_id ||
      p.workshop?.id !== quote.workshop_id) denied()
  const approvals=evidence.approvals.filter(x => x.revision_id === revision.id)
  const reports=evidence.executions.filter(x => x.revision_id === revision.id)
  const deliveries=evidence.deliveries.filter(x => x.revision_id === revision.id)
  if (approvals.length!==1 || reports.length!==1 || deliveries.length!==1) invalid()
  const a=approvals[0], e=reports[0], d=deliveries[0]
  for (const row of [a,e,d]) {
    if (row.workshop_id!==quote.workshop_id || row.quote_id!==quote.id ||
        row.order_id!==quote.order_id || row.evidence_status!=='operator_attested')
      denied()
    historyId(row.id)
    instant(row.recorded_at)
  }
  if (e.vehicle_id!==quote.vehicle_id || d.vehicle_id!==quote.vehicle_id ||
      e.approval_id!==a.id || d.report_id!==e.id ||
      !e.decisions || typeof e.decisions!=='object' || Array.isArray(e.decisions))
    denied()
  const lines: FinalLine[]=p.items.map((item): FinalLine => {
    const decision=e.decisions[item.id]
    if (item.workshop_id!==quote.workshop_id || item.quote_id!==quote.id ||
        (decision!=='performed' && decision!=='not_performed') ||
        !money(item.line_net) || typeof item.description!=='string')
      invalid()
    return {
      id:item.id, type:item.type, description:item.description,
      quantity100:item.quantity100, lineNet:item.line_net,
      decision: decision === 'performed' ? 'performed' : 'not_performed'
    }
  })
  if (!lines.length || lines.length>200 ||
      Object.keys(e.decisions).length!==lines.length) invalid()
  const originalNet=lines.reduce((n,x)=>n+x.lineNet,0)
  const declaredNet=lines.filter(x=>x.decision==='performed')
    .reduce((n,x)=>n+x.lineNet,0)
  const tax=(n:number)=>Math.floor((n*19+50)/100)
  if (!money(originalNet) || !money(declaredNet) ||
      !money(originalNet*19) || !money(declaredNet*19) ||
      originalNet!==p.totals.subtotal || tax(originalNet)!==p.totals.tax ||
      p.totals.total!==originalNet+tax(originalNet) ||
      e.quoted_net!==originalNet || e.quoted_tax!==tax(originalNet) ||
      e.quoted_total!==p.totals.total || e.performed_net!==declaredNet ||
      e.performed_tax!==tax(declaredNet) ||
      e.performed_total!==declaredNet+tax(declaredNet)) invalid()
  if (typeof e.pending_note!=='string' ||
      (lines.some(x=>x.decision==='not_performed') && e.pending_note.trim().length<8))
    invalid()
  if (typeof d.handover_note!=='string' || d.handover_note.trim().length<12 ||
      !['in_person','authorized_pickup','other'].includes(d.handover_method) ||
      !checkNames.every(([key])=>d.checklist?.[key]===true)) invalid()
  if (!/^[a-f0-9]{64}$/i.test(revision.pdf_sha256) ||
      !/^[a-f0-9]{64}$/i.test(revision.payload_sha256)) invalid()
  let intake={complaint:p.order.complaint,openedAt:p.order.opened_at,odometer:p.order.intake_odometer}
  if(p.order.intake_phase==='planned'){
    const receipts=evidence.receipts?.filter(r=>r.revision_id===revision.id)||[]
    if(receipts.length!==1)invalid()
    const r=receipts[0]
    if(r.workshop_id!==quote.workshop_id||r.quote_id!==quote.id||r.order_id!==quote.order_id||r.vehicle_id!==quote.vehicle_id||r.customer_id!==quote.customer_id)denied()
    historyId(r.id);historyId(r.recorded_by);instant(r.received_at)
    if(!Number.isInteger(r.odometer)||r.odometer<0||r.odometer>3000000||typeof r.complaint!=='string'||r.complaint.trim().length<3||r.complaint.length>2000||Date.parse(r.received_at)>Date.parse(e.recorded_at))invalid()
    intake={complaint:r.complaint,openedAt:r.received_at,odometer:r.odometer}
  }
  const base='OT-'+fileToken(quote.order_id)+'_R'+revision.revision
  return {
    state:'prepared_locally_not_archived_or_emailed',
    bundleId: revision.id+':'+e.id+':'+d.id,
    workshop:{id:quote.workshop_id,name:p.workshop.name},
    customer:{id:quote.customer_id,name:p.customer.full_name},
    vehicle:{id:quote.vehicle_id,plate:p.vehicle.plate,
      description:p.vehicle.make+' '+p.vehicle.model},
    order:{id:quote.order_id,...intake},
    quote:{
      id:quote.id,number:p.quote.number,revision:revision.revision,
      revisionId:revision.id,pdfSha256:revision.pdf_sha256,
      payloadSha256:revision.payload_sha256,
      fileName:'01_Cotizacion_'+base+'.pdf',total:p.totals.total
    },
    report:{
      id:e.id,recordedAt:e.recorded_at,operatorId:e.reviewed_by,lines,
      original:{net:originalNet,tax:tax(originalNet),total:e.quoted_total},
      declared:{net:declaredNet,tax:tax(declaredNet),total:e.performed_total},
      pendingNote:e.pending_note,fileName:'02_Informe_'+base+'.pdf'
    },
    handover:{
      id:d.id,recordedAt:d.recorded_at,operatorId:d.recorded_by,
      method:d.handover_method,note:d.handover_note,
      checks:checkNames.map(([,label])=>label),
      fileName:'03_Entrega_'+base+'.pdf'
    }
  }
}
