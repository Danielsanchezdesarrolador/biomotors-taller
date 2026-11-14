import { describe, it, expect } from 'vitest'
import { emptyVisitaDraft } from '../clientes/registroVisitaData'
import { confirmVisitOrder, openCaseResource, readCase, receiveVisit } from './flowSession'
import { finalizeDemo } from '../informes/multipunto/multipuntoData'
import { readMultipunto, rememberMultipunto } from '../informes/multipunto/multipuntoSession'
import {
  approveWorkDemo,
  editWorkDocument,
  putWorkItem,
  workTotals
} from '../informes/trabajos/trabajosData'
import { readWorkDocument, rememberWorkDocument } from '../informes/trabajos/trabajosSession'
import {
  authorizedDemo,
  authorizedWork,
  beginProposal,
  businessState,
  confirmProposal,
  currentResponse,
  markQuoteReviewed,
  prepareWorkFromQuote,
  proposalValid,
  quoteReviewed,
  recordClientResponse,
  responseHistory,
  transferHistory
} from './flowBusiness'
function fixture() {
  const v = receiveVisit(
    {
      date: '2026-11-13',
      draft: {
        ...emptyVisitaDraft,
        name: 'Cliente prueba D',
        email: crypto.randomUUID() + '@example.com',
        phone: '+56 9 0000 0088',
        brand: 'Toyota',
        model: 'Yaris',
        year: '2020',
        mileage: '50000',
        clientReportedReason: 'Motivo original sin diagnóstico.',
        consent: true
      }
    },
    crypto.randomUUID()
  )
  confirmVisitOrder(v.id)
  const route = openCaseResource(v.id, 'inspection'),
    inspection = readMultipunto(route.resourceId)!
  Object.assign(inspection, {
    fuel: 'Gasolina DEMO',
    start: '09:00',
    end: '10:30',
    technician: 'Operador DEMO'
  })
  rememberMultipunto(finalizeDemo(inspection, true))
  const base = readCase(v.id),
    q = beginProposal(base),
    visit = { ...base, quoteId: q.id }
  return { visit, q, inspectionId: route.resourceId }
}
function proposed() {
  const f = fixture()
  let q = editWorkDocument(f.q, {
    diagnosis: 'Diagnóstico escrito expresamente por el mecánico.',
    recommendations: 'Seguimiento técnico pendiente.'
  })
  q = putWorkItem(q, {
    id: crypto.randomUUID(),
    description: 'Reparación definida por operador',
    type: 'Mano de obra',
    quantity: 1.5,
    price: 24900,
    performed: false
  })
  rememberWorkDocument(q)
  confirmProposal(f.visit, { quoteId: q.id, revision: q.revision }, true)
  return { ...f, q }
}
function reviewed() {
  const f = proposed()
  markQuoteReviewed(f.visit, { quoteId: f.q.id, revision: f.q.revision }, true)
  expect(quoteReviewed(f.visit)).toBe(true)
  return f
}
function accepted() {
  const f = reviewed()
  recordClientResponse(
    f.visit,
    { quoteId: f.q.id, revision: f.q.revision },
    'aceptada_demo',
    'Aceptación solo de prueba',
    true
  )
  return f
}
const ref = (q: { id: string; revision: number }) => ({ quoteId: q.id, revision: q.revision })
describe('BT-FLOW-01D — exact quote revision and controlled work preparation', () => {
  it('does not infer diagnosis, parts or prices from inspection or customer reason', () => {
    const f = fixture()
    expect(f.q.diagnosis).toBe('')
    expect(f.q.items).toEqual([])
    expect(() => confirmProposal(f.visit, ref(f.q), true)).toThrow()
    expect(authorizedDemo(f.visit)).toBe(false)
  })
  it('requires a finalized inspection of the same order, not simply an opened draft', () => {
    const f = fixture(),
      mp = readMultipunto(f.inspectionId)!
    mp.finalized = false
    rememberMultipunto(mp)
    expect(() => beginProposal(f.visit)).toThrow('Finaliza')
    const other = fixture()
    expect(() => beginProposal({ ...f.visit, inspectionId: other.inspectionId })).toThrow('otra')
  })
  it('requires explicit valid proposal confirmation and records source metadata only', () => {
    const f = proposed()
    expect(proposalValid(f.visit)).toBe(true)
    expect(() => confirmProposal(f.visit, ref(f.q), false)).toThrow('Confirma')
    expect(businessState(f.visit).proposal?.itemSources[f.q.items[0].id]).toBe('Definición manual')
    expect(confirmProposal(f.visit, ref(f.q), true)).toEqual(businessState(f.visit).proposal)
  })
  it('does not treat existing document approval as a client response', () => {
    const f = proposed()
    rememberWorkDocument(approveWorkDemo(f.q, true))
    expect(currentResponse(f.visit)).toBeUndefined()
    expect(authorizedDemo(f.visit)).toBe(false)
    markQuoteReviewed(f.visit, ref(f.q), true)
    expect(readWorkDocument(f.q.id)?.status).toBe('Aprobado DEMO')
    expect(authorizedDemo(f.visit)).toBe(false)
  })
  it('rejects response before review, without acknowledgement or for a stale reference', () => {
    const f = proposed()
    expect(() => recordClientResponse(f.visit, ref(f.q), 'aceptada_demo', '', true)).toThrow(
      'Revisa'
    )
    markQuoteReviewed(f.visit, ref(f.q), true)
    expect(() => recordClientResponse(f.visit, ref(f.q), 'aceptada_demo', '', false)).toThrow(
      'Confirma'
    )
    expect(() =>
      recordClientResponse(f.visit, { quoteId: f.q.id, revision: 999 }, 'aceptada_demo', '', true)
    ).toThrow('cambió')
  })
  it('records an idempotent accepted response with exact identity, revision, actor and no real acceptance', () => {
    const f = accepted(),
      a = currentResponse(f.visit)!
    expect(a).toMatchObject({
      visitId: f.visit.id,
      quoteId: f.q.id,
      revision: f.q.revision,
      actor: 'Operador DEMO',
      simulated: true,
      decision: 'aceptada_demo'
    })
    expect(authorizedDemo(f.visit)).toBe(true)
    expect(
      recordClientResponse(f.visit, ref(f.q), 'aceptada_demo', 'Aceptación solo de prueba', true).id
    ).toBe(a.id)
    expect(responseHistory(f.visit)).toHaveLength(1)
  })
  it('invalidates acceptance for every new document revision including conditions, dates and prices', () => {
    for (const kind of ['terms', 'date', 'price'] as const) {
      const f = accepted()
      const patch =
        kind === 'terms'
          ? { terms: 'Condiciones nuevas DEMO' }
          : kind === 'date'
            ? { date: '2026-11-14' }
            : { items: f.q.items.map((i) => ({ ...i, price: i.price + 100 })) }
      rememberWorkDocument(editWorkDocument(readWorkDocument(f.q.id)!, patch))
      expect(authorizedDemo(f.visit)).toBe(false)
      expect(businessState(f.visit).responseStale).toBe(true)
      expect(responseHistory(f.visit)).toHaveLength(1)
      expect(() => prepareWorkFromQuote(f.visit, ref(readWorkDocument(f.q.id)!), true)).toThrow(
        'aceptación'
      )
    }
  })
  it('keeps rejection and change requests in history and stops execution', () => {
    for (const decision of ['rechazada_demo', 'cambios_demo'] as const) {
      const f = accepted()
      recordClientResponse(f.visit, ref(f.q), decision, 'Revisar propuesta', true)
      expect(currentResponse(f.visit)?.decision).toBe(decision)
      expect(authorizedDemo(f.visit)).toBe(false)
      expect(responseHistory(f.visit)).toHaveLength(2)
      expect(() => prepareWorkFromQuote(f.visit, ref(f.q), true)).toThrow('aceptación')
    }
  })
  it('rejects cross-order and cross-visit approvals even for related entities', () => {
    const a = accepted(),
      b = reviewed()
    expect(() => recordClientResponse(b.visit, ref(a.q), 'aceptada_demo', '', true)).toThrow(
      'cambió'
    )
    expect(authorizedDemo(b.visit)).toBe(false)
    expect(() => beginProposal({ ...b.visit, quoteId: a.q.id })).toThrow('otra')
    expect(() =>
      recordClientResponse({ ...a.visit, id: b.visit.id }, ref(a.q), 'aceptada_demo', '', true)
    ).toThrow('otra visita')
  })
  it('requires confirmed preload, resets performed, reuses the same work ID and keeps later performed edits', () => {
    const f = accepted()
    expect(() => prepareWorkFromQuote(f.visit, ref(f.q), false)).toThrow('Confirma')
    const a = prepareWorkFromQuote(f.visit, ref(f.q), true),
      b = prepareWorkFromQuote(f.visit, ref(f.q), true)
    expect(a.id).toBe(b.id)
    expect(a.items).toHaveLength(f.q.items.length)
    expect(a.items.every((i) => !i.performed)).toBe(true)
    expect(a.sourceQuote).toEqual({ visitId: f.visit.id, quoteId: f.q.id, revision: f.q.revision })
    expect(workTotals(a).total).toBe(0)
    const performed = editWorkDocument(a, {
      items: a.items.map((i) => ({ ...i, performed: true }))
    })
    rememberWorkDocument(performed)
    expect(prepareWorkFromQuote(f.visit, ref(f.q), true).items[0].performed).toBe(true)
    expect(workTotals(performed).total).toBe(workTotals(f.q).total)
    expect(transferHistory(f.visit)).toHaveLength(1)
  })
  it('preserves the previous work report when accepting a new quotation revision', () => {
    const f = accepted(),
      old = prepareWorkFromQuote(f.visit, ref(f.q), true)
    rememberWorkDocument(
      editWorkDocument(old, { items: old.items.map((i) => ({ ...i, performed: true })) })
    )
    const q = editWorkDocument(readWorkDocument(f.q.id)!, { terms: 'Nueva condición confirmada' })
    rememberWorkDocument(q)
    expect(authorizedWork(f.visit)).toBeUndefined()
    expect(proposalValid(f.visit)).toBe(true)
    markQuoteReviewed(f.visit, ref(q), true)
    recordClientResponse(f.visit, ref(q), 'aceptada_demo', 'Nueva revisión', true)
    const next = prepareWorkFromQuote(f.visit, ref(q), true)
    expect(next.id).not.toBe(old.id)
    expect(next.items.every((i) => !i.performed)).toBe(true)
    expect(readWorkDocument(old.id)?.items[0].performed).toBe(true)
    expect(responseHistory(f.visit)).toHaveLength(2)
    expect(transferHistory(f.visit)).toHaveLength(2)
  })
  it('detects edits to transferred economic items without overwriting performed history', () => {
    const f = accepted(),
      work = prepareWorkFromQuote(f.visit, ref(f.q), true)
    rememberWorkDocument(
      editWorkDocument(work, {
        items: work.items.map((i) => ({ ...i, price: i.price + 1, performed: true }))
      })
    )
    expect(authorizedWork(f.visit)).toBeUndefined()
    expect(() => prepareWorkFromQuote(f.visit, ref(f.q), true)).toThrow('no se sobrescribirán')
    expect(readWorkDocument(work.id)?.items[0].performed).toBe(true)
  })
  it('invalidates proposal after technical edits but not merely when changing commercial conditions', () => {
    const f = accepted()
    let q = editWorkDocument(readWorkDocument(f.q.id)!, { terms: 'Cambian condiciones' })
    rememberWorkDocument(q)
    expect(proposalValid(f.visit)).toBe(true)
    q = editWorkDocument(q, { diagnosis: 'Otro diagnóstico profesional' })
    rememberWorkDocument(q)
    expect(proposalValid(f.visit)).toBe(false)
    expect(() => markQuoteReviewed(f.visit, ref(q), true)).toThrow('propuesta')
    confirmProposal(f.visit, ref(q), true)
    expect(proposalValid(f.visit)).toBe(true)
  })
  it('invalidates authorization if the inspection is reopened, preserving its unreviewed results', () => {
    const f = accepted(),
      mp = readMultipunto(f.inspectionId)!
    mp.finalized = false
    rememberMultipunto(mp)
    expect(authorizedDemo(f.visit)).toBe(false)
    expect(mp.items.every((i) => i.state === 'unreviewed')).toBe(true)
  })
})
