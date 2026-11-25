import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Quote, QuoteItem, Revision, Snapshot } from '../cp05/contracts'
import { executionDraftPdf } from './executionPdf'
import { ExecutionFailure, executionPreview } from './executionPreview'
import { WorkExecutionDraft } from './WorkExecutionDraft'

const id = (n: number) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0')
const wid = id(1), qid = id(2), oid = id(3), vid = id(4), cid = id(5)
const quote: Quote = {
  workshop_id: wid, id: qid, order_id: oid, vehicle_id: vid, customer_id: cid,
  number: 7, version: 3, status: 'issued', price_basis: 'net',
  valid_days: 10, terms: 'QA solamente', comments: '', issued_revision: 1,
  issue_pending: false, void_reason: null, created_at: '2026-11-18T10:00:00Z',
  updated_at: '2026-11-18T10:30:00Z'
}
const items: QuoteItem[] = [
  { workshop_id: wid, quote_id: qid, id: id(10), position: 0,
    description: 'Pastillas de freno', type: 'Repuesto', quantity100: 100,
    unit_price: 100, line_net: 100 },
  { workshop_id: wid, quote_id: qid, id: id(11), position: 1,
    description: 'Inspección de suspensión', type: 'Mano de obra', quantity100: 100,
    unit_price: 50, line_net: 50 }
]
const snapshot = {
  quote: { ...quote, revision: 1 },
  workshop: { id: wid, name: 'Taller QA sintético' },
  customer: { id: cid, full_name: 'Cliente QA', email: 'synthetic@invalid.test', mobile_e164: null },
  vehicle: { id: vid, plate: 'QA1234', make: 'Vehículo', model: 'QA' },
  order: { id: oid, complaint: 'Revisar frenos', intake_odometer: 12000,
    opened_at: '2026-11-18T09:00:00Z' },
  items, totals: { subtotal: 150, tax: 29, total: 179 },
  document_date: '2026-11-18T10:20:00Z',
  notice: 'No es documento tributario.'
} satisfies Snapshot
const revision: Revision = {
  id: id(20), workshop_id: wid, quote_id: qid, revision: 1,
  payload: snapshot, payload_sha256: 'a'.repeat(64),
  pdf_object_path: '', pdf_sha256: 'b'.repeat(64), pdf_size: 0,
  issued_at: '2026-11-18T10:30:00Z', issued_by: id(30)
}
const input = {
  decisions: { [id(10)]: 'performed' as const, [id(11)]: 'not_performed' as const },
  pendingExplanation: 'Servicio de suspensión se realizará en una visita posterior.',
  operatorReviewed: true
}
const assets = {
  font: new Uint8Array(readFileSync('public/cp05/DejaVuSans.ttf')),
  logo: new Uint8Array(readFileSync('assets/brand/generated/icon-192.png'))
}

describe('CP03-CP04-CP05 -> informe de ejecución preliminar, SIN persistir ni entregar', () => {
  it('parte sin ninguna partida realizada y bloquea la exportación mientras falten marcas', () => {
    const report = executionPreview(revision, quote,
      { decisions: {}, pendingExplanation: '', operatorReviewed: false })
    expect(report.performed).toHaveLength(0)
    expect(report.unreviewed).toHaveLength(2)
    expect(report.executed.total).toBe(0)
    expect(report.readyForDraftPdf).toBe(false)
    expect(report.missing.length).toBeGreaterThanOrEqual(2)
    expect(report.notice).toContain('SIN GUARDAR')
    const html = renderToStaticMarkup(<WorkExecutionDraft revision={revision} quote={quote} />)
    expect(html).toContain('SIN GUARDAR')
    expect(html).toContain('Sin revisar')
    expect(html).toContain('disabled')
    expect(html).not.toContain('Entrega confirmada')
  })
  it('separa el presupuesto emitido del trabajo marcado por operador y no lo altera', () => {
    const before = JSON.stringify(revision)
    const report = executionPreview(revision, quote, input)
    expect(report.readyForDraftPdf).toBe(true)
    expect(report.performed.map(x => x.item.id)).toEqual([id(10)])
    expect(report.pending.map(x => x.item.id)).toEqual([id(11)])
    expect(report.quoted).toEqual({ subtotal: 150, tax: 29, total: 179 })
    expect(report.executed).toEqual({ subtotal: 100, tax: 19, total: 119 })
    expect(report.difference).toBe(60)
    expect(JSON.stringify(revision)).toBe(before)
  })
  it('sin trabajos realizados no inventa ejecución ni cobros', () => {
    const report = executionPreview(revision, quote, {
      decisions: { [id(10)]: 'not_performed', [id(11)]: 'not_performed' },
      pendingExplanation: 'La reparación no fue autorizada; sin trabajos ejecutados.',
      operatorReviewed: true
    })
    expect(report.readyForDraftPdf).toBe(true)
    expect(report.performed).toHaveLength(0)
    expect(report.executed).toEqual({ subtotal: 0, tax: 0, total: 0 })
  })
  it('obliga explicación de pendientes, revisar todas las partidas y confirmación humana', () => {
    expect(executionPreview(revision, quote,
      { ...input, pendingExplanation: '' }).readyForDraftPdf).toBe(false)
    expect(executionPreview(revision, quote,
      { ...input, operatorReviewed: false }).readyForDraftPdf).toBe(false)
    expect(executionPreview(revision, quote,
      { ...input, decisions: { [id(10)]: 'performed' } }).readyForDraftPdf).toBe(false)
    expect(() => executionPreview(revision, quote,
      { ...input, pendingExplanation: 'x'.repeat(2001) })).toThrow(ExecutionFailure)
  })
  it.each([
    ['taller', { ...revision, workshop_id: id(99) }],
    ['cotización', { ...revision, quote_id: id(99) }],
    ['vehículo', { ...revision, payload: { ...snapshot, vehicle: { ...snapshot.vehicle, id: id(99) } } }],
    ['orden', { ...revision, payload: { ...snapshot, order: { ...snapshot.order, id: id(99) } } }],
    ['cliente', { ...revision, payload: { ...snapshot, customer: { ...snapshot.customer, id: id(99) } } }],
    ['versión emitida', { ...revision, revision: 2 }],
    ['línea alterada', { ...revision, payload: { ...snapshot, items: [
      { ...items[0], line_net: 1000 }, items[1]
    ] } }]
  ])('rechaza datos cruzados o falsificados de %s antes del PDF', (_label, altered) => {
    expect(() => executionPreview(altered, quote, input)).toThrow()
  })
  it('deniega cotización en borrador, revision antigua y decisiones adicionales', () => {
    expect(() => executionPreview(revision, { ...quote, status: 'draft' }, input))
      .toThrow(ExecutionFailure)
    expect(() => executionPreview(revision, { ...quote, issued_revision: 2 }, input))
      .toThrow()
    expect(() => executionPreview(revision, quote, {
      ...input, decisions: { ...input.decisions, [id(99)]: 'performed' }
    })).toThrow()
  })
  it('crea PDF real A4 con logo y marca explícita BORRADOR, sin cambiar snapshot', async () => {
    const before = JSON.stringify(revision)
    const report = executionPreview(revision, quote, input)
    const bytes = await executionDraftPdf(report, assets)
    expect(Buffer.from(bytes).subarray(0, 5).toString()).toBe('%PDF-')
    const pdf = await PDFDocument.load(bytes)
    expect(pdf.getPageCount()).toBe(1)
    expect(pdf.getPage(0).getSize().width).toBeCloseTo(595.28)
    expect(pdf.getTitle()).toContain('BORRADOR INTERNO')
    expect(JSON.stringify(revision)).toBe(before)
    await expect(executionDraftPdf(
      executionPreview(revision, quote,
        { decisions: {}, pendingExplanation: '', operatorReviewed: false }), assets
    )).rejects.toThrow('EXECUTION_REVIEW_INCOMPLETE')
  })
  it('pagina 200 partidas sin truncamiento de la revisión técnica', async () => {
    const many = Array.from({ length: 200 }, (_, i) => ({
      ...items[0], id: id(i + 100),
      position: i,
      description: 'Repuesto revisión QA número ' + (i + 1)
    }))
    const long = {
      ...revision,
      payload: { ...snapshot, items: many, totals: { subtotal: 20000, tax: 3800, total: 23800 } }
    }
    const decisions = Object.fromEntries(many.map(i => [i.id, 'performed' as const]))
    const report = executionPreview(long, quote, {
      decisions, pendingExplanation: '', operatorReviewed: true
    })
    expect(report.rows).toHaveLength(200)
    expect(report.executed.total).toBe(23800)
    const pdf = await PDFDocument.load(await executionDraftPdf(report, assets))
    expect(pdf.getPageCount()).toBeGreaterThan(4)
  })
})

 it('accepts JSONB key order while rejecting changed amounts and extra fields', () => {
   const reordered = {...revision, payload:{...snapshot,totals:JSON.parse('{"tax":29,"total":179,"subtotal":150}')}}
   expect(executionPreview(reordered,quote,input).quoted.total).toBe(179)
   for(const totals of [{subtotal:150,tax:30,total:179},{subtotal:150,tax:29,total:180},{subtotal:150,tax:29,total:179,extra:0}])
     expect(()=>executionPreview({...reordered,payload:{...snapshot,totals}},quote,input)).toThrow()
 })
