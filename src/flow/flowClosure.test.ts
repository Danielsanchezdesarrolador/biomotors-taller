import { describe, expect, it } from 'vitest'
import { emptyVisitaDraft } from '../clientes/registroVisitaData'
import { confirmVisitOrder, openCaseResource, readCase, receiveVisit } from './flowSession'
import { finalizeDemo } from '../informes/multipunto/multipuntoData'
import { readMultipunto, rememberMultipunto } from '../informes/multipunto/multipuntoSession'
import { approveWorkDemo, editWorkDocument, putWorkItem, workTotals } from '../informes/trabajos/trabajosData'
import { readWorkDocument, rememberWorkDocument } from '../informes/trabajos/trabajosSession'
import {
  beginProposal, confirmProposal, markQuoteReviewed,
  prepareWorkFromQuote, recordClientResponse
} from './flowBusiness'
import {
  activeHolds, cancelVisit, completeDelivery, deliveryRequirements, deliveryState,
  holdHistory, recordHold, resolveHold, type DeliveryChecklist
} from './flowClosure'

const checks: DeliveryChecklist = {
  vehicleChecked: true, workChecked: true, documentsChecked: true, pendingExplained: true
}
function fixture() {
  const key = crypto.randomUUID()
  const visit = receiveVisit({
    date: '2026-11-13',
    draft: {
      ...emptyVisitaDraft,
      name: 'Cliente ficticio cierre',
      email: key + '@example.com',
      phone: '+56 9 0000 0088',
      brand: 'Toyota', model: 'Yaris', year: '2020', mileage: '52000',
      clientReportedReason: 'Ruido al pasar por baches.',
      consent: true
    }
  }, key)
  confirmVisitOrder(visit.id)
  const route = openCaseResource(visit.id, 'inspection')
  const inspection = readMultipunto(route.resourceId)!
  Object.assign(inspection, {
    fuel: 'Gasolina DEMO', start: '09:00', end: '10:15',
    technician: 'Operador DEMO'
  })
  inspection.items = inspection.items.map(i=>({...i,state:'ok'}))
  rememberMultipunto(finalizeDemo(inspection, true))
  const q = beginProposal(readCase(visit.id))
  const linked = { ...readCase(visit.id), quoteId: q.id }
  let edited = editWorkDocument(q, {
    diagnosis: 'Diagnóstico profesional redactado por mecánico.'
  })
  edited = putWorkItem(edited, {
    id: crypto.randomUUID(), description: 'Trabajo confirmado de muestra',
    type: 'Mano de obra', quantity: 1, price: 50000, performed: false
  })
  edited = putWorkItem(edited, {
    id: crypto.randomUUID(), description: 'Revisión adicional pendiente DEMO',
    type: 'Servicio', quantity: 1, price: 10000, performed: false
  })
  rememberWorkDocument(edited)
  const ref = { quoteId: edited.id, revision: edited.revision }
  confirmProposal(linked, ref, true)
  markQuoteReviewed(linked, ref, true)
  recordClientResponse(linked, ref, 'aceptada_demo', 'Solo simulación', true)
  const work = prepareWorkFromQuote(linked, ref, true)
  return { visit: linked, quote: edited, work }
}
function completed() {
  const f = fixture()
  const work = editWorkDocument(f.work, {
    items: f.work.items.map(i => ({ ...i, performed: true }))
  })
  const final = approveWorkDemo(work, true)
  rememberWorkDocument(final)
  return { ...f, final }
}
describe('BT-FLOW-01E — entrega y excepciones solo en memoria', () => {
  it('no cierra sin informe final ni trabajos ejecutados expresamente', () => {
    const f = fixture()
    expect(deliveryRequirements(f.visit).eligible).toBe(false)
    expect(deliveryRequirements(f.visit).reasons.join(' ')).toMatch(/Finaliza expresamente/)
    expect(() => completeDelivery(f.visit, checks, '', 'Entrega DEMO confirmada.', true)).toThrow('No se puede entregar')
  })
  it('exige confirmación y checklist completo de cierre', () => {
    const f = completed()
    expect(deliveryRequirements(f.visit).eligible).toBe(true)
    expect(() => completeDelivery(f.visit, checks, '', 'Entrega DEMO confirmada.', false)).toThrow('cuatro')
    expect(() => completeDelivery(f.visit, {...checks, documentsChecked:false}, '', 'Entrega DEMO confirmada.', true)).toThrow('cuatro')
    const delivery = completeDelivery(f.visit, checks, '', 'Entrega DEMO confirmada.', true)
    expect(delivery.orderId).toBe(f.visit.orderId)
    expect(delivery.workReportId).toBe(f.final.id)
    expect(delivery.amount).toBe(workTotals(f.final).total)
    expect(deliveryState(f.visit).status).toBe('cerrada_demo')
  })
  it('cierre es idempotente y conserva revisión y respuesta original', () => {
    const f = completed()
    const first = completeDelivery(f.visit, checks, '', 'Entrega DEMO confirmada.', true)
    const second = completeDelivery(f.visit, checks, '', 'Entrega DEMO confirmada.', true)
    expect(first.date).toBe(second.date)
    expect(first.responseId).toBe(second.responseId)
    expect(first.quoteRevision).toBe(f.quote.revision)
    expect(first.simulated).toBe(true)
  })
  it('requiere explicar explícitamente las partidas no realizadas', () => {
    const f = completed()
    const work = readWorkDocument(f.final.id)!
    // La edición reabre el borrador; el operador debe finalizarlo otra vez.
    let update = editWorkDocument(work, { items:
      work.items.map((i, index) => ({ ...i, performed: index === 0 }))
    })
    update = approveWorkDemo(update, true)
    rememberWorkDocument(update)
    expect(deliveryRequirements(f.visit).pending).toHaveLength(1)
    expect(() => completeDelivery(f.visit, checks, '', 'Entrega DEMO confirmada.', true)).toThrow('Describe')
    const done = completeDelivery(f.visit, checks, 'Trabajo pendiente explicado al cliente de muestra.', 'Entrega DEMO confirmada.', true)
    expect(done.pendingCount).toBe(1)
    expect(done.pendingNote).toContain('Trabajo pendiente')
  })
  it('pausas de repuestos y vehículo pendiente bloquean entrega hasta solución explícita', () => {
    const f = completed()
    const a = recordHold(f.visit, 'repuestos', 'Repuestos de muestra faltantes.', true)
    const b = recordHold(f.visit, 'vehiculo_en_espera', 'Vehículo pendiente de revisar.', true)
    expect(activeHolds(f.visit)).toHaveLength(2)
    expect(deliveryState(f.visit).status).toBe('en_espera')
    expect(deliveryRequirements(f.visit).eligible).toBe(false)
    expect(() => completeDelivery(f.visit, checks, '', 'Entrega DEMO confirmada.', true)).toThrow('pausas')
    expect(() => resolveHold(f.visit, a.id, 'Repuestos de muestra recibidos.', false)).toThrow('Confirma')
    resolveHold(f.visit, a.id, 'Repuestos de muestra recibidos.', true)
    expect(deliveryRequirements(f.visit).eligible).toBe(false)
    resolveHold(f.visit, b.id, 'Revisión del vehículo completa.', true)
    expect(deliveryRequirements(f.visit).eligible).toBe(true)
    expect(holdHistory(f.visit)).toHaveLength(2)
    expect(holdHistory(f.visit).every(h => Boolean(h.resolvedAt))).toBe(true)
  })
  it('valida notas y nunca resuelve pausa de otra visita', () => {
    const f = completed()
    const other = completed()
    expect(() => recordHold(f.visit, 'repuestos', '', true)).toThrow('Describe')
    const pause = recordHold(f.visit, 'otro', 'Observación adicional registrada.', true)
    expect(() => resolveHold(other.visit, pause.id, 'Revisado en taller.', true)).toThrow('otra visita')
    expect(activeHolds(f.visit)).toHaveLength(1)
    resolveHold(f.visit, pause.id, 'Resuelto por operador DEMO.', true)
    expect(activeHolds(f.visit)).toHaveLength(0)
  })
  it('cliente que no autoriza y trabajo adicional se registran como bloqueos, no como ejecutados', () => {
    const f = completed()
    recordHold(f.visit, 'cliente_no_autoriza', 'Cliente ficticio no autoriza.', true)
    recordHold(f.visit, 'trabajo_adicional', 'Trabajo adicional por cotizar.', true)
    expect(deliveryRequirements(f.visit).eligible).toBe(false)
    expect(deliveryState(f.visit).openHolds).toHaveLength(2)
  })
  it('cancelación explícita bloquea cierre; no borra documentos ni historial', () => {
    const f = completed()
    expect(() => cancelVisit(f.visit, 'Cancelación DEMO expresamente solicitada.', false)).toThrow('Confirma')
    const first = cancelVisit(f.visit, 'Cancelación DEMO expresamente solicitada.', true)
    expect(cancelVisit(f.visit, 'Cancelación DEMO expresamente solicitada.', true)).toEqual(first)
    expect(deliveryState(f.visit).status).toBe('cancelada')
    expect(deliveryRequirements(f.visit).eligible).toBe(false)
    expect(() => completeDelivery(f.visit, checks, '', 'Entrega DEMO confirmada.', true)).toThrow('No se puede entregar')
    expect(readWorkDocument(f.final.id)).toBeDefined()
  })
  it('edición de cotización después del cierre deja constancia desactualizada y no finge entrega vigente', () => {
    const f = completed()
    const record = completeDelivery(f.visit, checks, '', 'Entrega DEMO confirmada.', true)
    const q = editWorkDocument(readWorkDocument(f.quote.id)!, { terms: 'Nueva condición modificada DEMO.' })
    rememberWorkDocument(q)
    expect(deliveryState(f.visit).status).toBe('cierre_desactualizado')
    expect(deliveryState(f.visit).delivery?.date).toBe(record.date)
    expect(() => completeDelivery(f.visit, checks, '', 'Entrega DEMO confirmada.', true)).toThrow('No se puede entregar')
  })
  it('no puede aplicar entrega a otra visita aunque compartan cliente y taller DEMO', () => {
    const f = completed()
    const other = fixture()
    expect(deliveryRequirements(other.visit).eligible).toBe(false)
    completeDelivery(f.visit, checks, '', 'Entrega DEMO confirmada.', true)
    expect(deliveryState(other.visit).status).toBe('en_curso')
    expect(() => completeDelivery(other.visit, checks, '', 'Entrega DEMO confirmada.', true)).toThrow('No se puede entregar')
  })
})
