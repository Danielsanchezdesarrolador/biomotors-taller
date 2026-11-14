import { confirmProposal, markQuoteReviewed, recordClientResponse } from './flowBusiness'
import { editWorkDocument, putWorkItem } from '../informes/trabajos/trabajosData'
import { describe, it, expect } from 'vitest'
import { demoClients, demoVehicles, vehicleForOrder } from '../clientes/clientesData'
import { addSessionRequest, sessionRequests } from '../clientes/intakeSession'
import { validateReception } from '../clientes/directorySession'
import { emptyVisitaDraft } from '../clientes/registroVisitaData'
import {
  allCases,
  beginCaseProposal,
  prepareCaseWork,
  caseContext,
  caseProgress,
  confirmVisitOrder,
  openCaseResource,
  readCase,
  receiveVisit,
  selectCase,
  selectedCase
} from './flowSession'
import { createDocument, documentContext } from '../informes/documentosData'
import { readMultipunto, rememberMultipunto } from '../informes/multipunto/multipuntoSession'
import { readWorkDocument, rememberWorkDocument } from '../informes/trabajos/trabajosSession'
import { sessionOrders } from '../ordenes/orderSession'
const fresh = () => ({
  draft: {
    ...emptyVisitaDraft,
    name: 'Cliente de prueba DEMO',
    email: 'flow' + crypto.randomUUID() + '@example.com',
    phone: '+56 9 0000 0090',
    brand: 'Toyota',
    model: 'Yaris',
    year: '2020',
    plate: '',
    mileage: '50000',
    clientReportedReason: 'Ruido de muestra al frenar.',
    consent: true
  },
  date: '2026-11-13'
})
describe('BT-FLOW-01B — shared relationships and visit indexes', () => {
  it('indexes real seed orders without claiming inspection or quotation completion', () => {
    const visit = allCases().find((v) => v.orderId === 'OT-1001')!
    expect(caseProgress(visit.id).stage).toBe('inspeccion')
    expect(caseProgress(visit.id).states.inspeccion).toBe('pendiente')
    expect(caseContext(visit.id).vehicle.id).toBe('vehicle-OT-1001')
  })
  it('publishes client/vehicle once and creates no OT until explicit confirmation', () => {
    const input = fresh(),
      id = crypto.randomUUID(),
      before = sessionOrders().length,
      visit = receiveVisit(input, id)
    expect(visit.orderId).toBeUndefined()
    expect(sessionOrders()).toHaveLength(before)
    expect(receiveVisit(input, id).id).toBe(id)
    expect(demoClients.filter((c) => c.id === visit.clientId)).toHaveLength(1)
    expect(demoVehicles.filter((v) => v.id === visit.vehicleId)).toHaveLength(1)
    expect(() => receiveVisit({ ...input, date: '2026-11-14' }, id)).toThrow('otros datos')
    const a = confirmVisitOrder(id),
      b = confirmVisitOrder(id)
    expect(a.id).toBe(b.id)
    expect(sessionOrders()).toHaveLength(before + 1)
    expect(a.diagnosis).toBe('')
    expect(a.symptoms).toBe(input.draft.clientReportedReason)
  })
  it('shares new orders with classical document selectors/context using stable IDs', () => {
    const visit = receiveVisit(fresh(), crypto.randomUUID()),
      order = confirmVisitOrder(visit.id),
      doc = createDocument('new-demo', 'Cotización', order.id)
    expect(documentContext(doc).vehicle.id).toBe(visit.vehicleId)
    expect(doc.clientId).toBe(visit.clientId)
    expect(order.visitId).toBe(visit.id)
    expect(vehicleForOrder(order)?.id).toBe(visit.vehicleId)
  })
  it('allows recurring visits with same customer/vehicle and independent reasons, mileage and OT', () => {
    const client = demoClients[0],
      vehicle = demoVehicles.find((v) => v.clientId === client.id)!
    const a = receiveVisit(
        { ...fresh(), clientId: client.id, vehicleId: vehicle.id },
        crypto.randomUUID()
      ),
      b = receiveVisit(
        {
          ...fresh(),
          clientId: client.id,
          vehicleId: vehicle.id,
          draft: {
            ...fresh().draft,
            mileage: '51000',
            clientReportedReason: 'Otro motivo para otra visita.'
          }
        },
        crypto.randomUUID()
      )
    const old = confirmVisitOrder(a.id),
      next = confirmVisitOrder(b.id)
    expect(a.id).not.toBe(b.id)
    expect(old.id).not.toBe(next.id)
    expect(next.clientId).toBe(old.clientId)
    expect(old.mileage).toBe(50000)
    expect(next.mileage).toBe(51000)
    expect(readCase(a.id).reception.reason).not.toBe(readCase(b.id).reception.reason)
  })
  it('rejects mismatched customer/vehicle, duplicate plates and invalid entries atomically', () => {
    const a = demoClients[0],
      v = demoVehicles.find((v) => v.clientId !== a.id)!
    expect(validateReception({ ...fresh(), clientId: a.id, vehicleId: v.id }).join(' ')).toContain(
      'no pertenece'
    )
    const before = demoClients.length,
      input = fresh()
    input.draft.plate = demoVehicles[0].plate
    expect(() => receiveVisit(input, crypto.randomUUID())).toThrow()
    expect(demoClients).toHaveLength(before)
    expect(() => receiveVisit({ ...fresh(), date: '' }, crypto.randomUUID())).toThrow('fecha')
  })
  it('keeps full structured intake and converts a request into only one confirmed OT', () => {
    const input = fresh(),
      request = addSessionRequest(input.draft)
    expect(sessionRequests().find((r) => r.id === request.id)?.details?.email).toBe(
      input.draft.email
    )
    const visit = receiveVisit({ ...input, requestId: request.id }, crypto.randomUUID())
    const again = receiveVisit({ ...input, requestId: request.id }, crypto.randomUUID())
    expect(again.id).toBe(visit.id)
    expect(confirmVisitOrder(visit.id).id).toBe(confirmVisitOrder(again.id).id)
  })
  it('reopens the same multipoint and quote/work resources for the same visit', () => {
    const visit = receiveVisit(fresh(), crypto.randomUUID())
    confirmVisitOrder(visit.id)
    const a = openCaseResource(visit.id, 'inspection'),
      b = openCaseResource(visit.id, 'inspection')
    expect(a.resourceId).toBe(b.resourceId)
    expect(readMultipunto(a.resourceId)?.items.every((i) => i.state === 'unreviewed')).toBe(true)
    expect(() => openCaseResource(visit.id, 'quote')).toThrow('propuesta')
    const inspection = readMultipunto(a.resourceId)!
    inspection.finalized = true
    rememberMultipunto(inspection)
    let draft = beginCaseProposal(visit.id)
    expect(draft.items).toEqual([])
    draft = editWorkDocument(draft, { diagnosis: 'Diagnóstico manual DEMO' })
    draft = putWorkItem(draft, {
      id: 'item-' + visit.id,
      description: 'Trabajo manual DEMO',
      type: 'Servicio',
      quantity: 1,
      price: 1000,
      performed: false
    })
    rememberWorkDocument(draft)
    confirmProposal(readCase(visit.id), { quoteId: draft.id, revision: draft.revision }, true)
    const quote = openCaseResource(visit.id, 'quote')
    expect(readWorkDocument(quote.resourceId)?.orderId).toBe(a.orderId)
    expect(readWorkDocument(quote.resourceId)?.items).toHaveLength(1)
    expect(() => openCaseResource(visit.id, 'work')).toThrow('precarga')
    markQuoteReviewed(readCase(visit.id), { quoteId: draft.id, revision: draft.revision }, true)
    recordClientResponse(
      readCase(visit.id),
      { quoteId: draft.id, revision: draft.revision },
      'aceptada_demo',
      '',
      true
    )
    prepareCaseWork(visit.id, { quoteId: draft.id, revision: draft.revision }, true)
    const work = openCaseResource(visit.id, 'work')
    expect(readWorkDocument(work.resourceId)?.items.every((i) => !i.performed)).toBe(true)
  })
  it('preserves selected visit and derives only verifiable activity, with later stages blocked', () => {
    const visit = receiveVisit(fresh(), crypto.randomUUID())
    selectCase(visit.id)
    expect(selectedCase()?.id).toBe(visit.id)
    expect(caseProgress(visit.id).stage).toBe('orden')
    confirmVisitOrder(visit.id)
    const r = openCaseResource(visit.id, 'inspection'),
      inspection = readMultipunto(r.resourceId)!
    expect(caseProgress(visit.id).states.inspeccion).toBe('en_curso')
    inspection.saved = true
    rememberMultipunto(inspection)
    expect(caseProgress(visit.id).states.inspeccion).toBe('en_curso')
    inspection.finalized = true
    rememberMultipunto(inspection)
    expect(caseProgress(visit.id).stage).toBe('propuesta')
    expect(caseProgress(visit.id).states.entrega).toBe('bloqueado')
    expect(selectedCase()?.id).toBe(visit.id)
  })
})
