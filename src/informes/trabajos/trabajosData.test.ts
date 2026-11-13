import { describe, it, expect } from 'vitest'
import { documentContext } from '../documentosData'
import { exampleItems } from '../../ordenes/detalleData'
import { readOrderRevision, sessionOrders } from '../../ordenes/orderSession'
import { createMultipunto } from '../multipunto/multipuntoData'
import {
  readMultipunto,
  rememberMultipunto,
  discardMultipunto
} from '../multipunto/multipuntoSession'
import {
  approveWorkDemo,
  attachInspection,
  createWorkDocument,
  currency,
  editWorkDocument,
  includedItems,
  loadWorkTemplate,
  localWorkSummary,
  putWorkItem,
  reviewWorkDocument,
  validateItem,
  workTotals,
  type WorkItem
} from './trabajosData'
import { readWorkDocument, rememberWorkDocument, discardWorkDocument } from './trabajosSession'
describe('BT-COT-01', () => {
  it('loads only coherent fictitious relationships, dates and workshop identity', () => {
    for (const order of sessionOrders()) {
      const d = createWorkDocument(order.id, 'quote'),
        c = documentContext(d)
      expect(c.vehicle.plate).toBe(order.plate)
      expect(c.client.name).toBe(order.client.replace(/ · DEMO$/, ''))
      expect(d.workshop.name).toBe('Taller de demostración')
      expect(d.items.every((i) => !i.performed)).toBe(true)
      expect(d.id).toMatch(/^COT-DEMO-/)
      expect(d.comments).toBe('')
    }
  })
  it('reuses net line rounding and 19% IVA, including fractional labour and supplies', () => {
    const d = createWorkDocument('OT-1002', 'quote')
    expect(workTotals(d)).toEqual({ subtotal: 130150, tax: 24729, total: 154879 })
    d.items = [
      {
        id: 'fraction',
        description: 'Fracción',
        type: 'Insumo',
        quantity: 1.5,
        price: 3,
        performed: false
      }
    ]
    expect(workTotals(d)).toEqual({ subtotal: 5, tax: 1, total: 6 })
    expect(currency(1619000)).toBe('$1.619.000 CLP')
  })
  it('rejects nonfinite/zero quantity, negative or fractional prices and unsupported types', () => {
    const item: WorkItem = { ...exampleItems[0], performed: false }
    for (const quantity of [0, -1, NaN, Infinity, 10001])
      expect(validateItem({ ...item, quantity })).not.toBe('')
    for (const price of [-1, NaN, Infinity, 1.5, 100000001])
      expect(validateItem({ ...item, price })).not.toBe('')
    expect(validateItem({ ...item, quantity: 0.5, price: 0 })).toBe('')
    expect(validateItem({ ...item, description: ' ' })).not.toBe('')
    expect(() =>
      workTotals({ ...createWorkDocument('OT-1002', 'quote'), items: [{ ...item, price: NaN }] })
    ).toThrow()
  })
  it('adds, edits, removes and recalculates without mutating OT; blocks accidental duplicate rows', () => {
    const original = readOrderRevision(sessionOrders().find((o) => o.id === 'OT-1002')!)
    let d = createWorkDocument('OT-1002', 'quote')
    const item: WorkItem = {
      id: 'new',
      description: 'Insumo de prueba',
      type: 'Insumo',
      quantity: 2,
      price: 100,
      performed: false
    }
    d = putWorkItem(d, item)
    expect(workTotals(d).subtotal).toBe(130350)
    d = putWorkItem(d, { ...item, quantity: 3 })
    expect(d.items).toHaveLength(4)
    expect(workTotals(d).subtotal).toBe(130450)
    expect(() =>
      putWorkItem(d, { ...item, id: 'duplicate', description: ' INSUMO  DE PRUEBA ' })
    ).toThrow('duplicación')
    d = editWorkDocument(d, { items: d.items.filter((i) => i.id !== 'new') })
    expect(workTotals(d).total).toBe(154879)
    expect(readOrderRevision(original.order)).toEqual(original)
  })
  it('work report excludes every unconfirmed item and never infers performed work', () => {
    let d = createWorkDocument('OT-1002', 'work')
    expect(d.id).toMatch(/^ITR-DEMO-/)
    expect(includedItems(d)).toEqual([])
    expect(workTotals(d).total).toBe(0)
    expect(() => reviewWorkDocument(d)).toThrow('realizado')
    d = editWorkDocument(d, {
      items: d.items.map((i, index) => ({ ...i, performed: index === 0 }))
    })
    expect(workTotals(d)).toEqual({ subtotal: 52900, tax: 10051, total: 62951 })
    expect(includedItems(d)).toHaveLength(1)
    expect(d.diagnosis).not.toBe('')
    expect(d.comments).toBe('')
  })
  it('separates approval and finalization, requires acknowledgement and invalidates approvals after edits', () => {
    let d = createWorkDocument('OT-1002', 'quote')
    expect(() => approveWorkDemo(d, false)).toThrow('simulación')
    d = approveWorkDemo(d, true)
    expect(d.status).toBe('Aprobado DEMO')
    expect(d.approval?.total).toBe(workTotals(d).total)
    expect(() => approveWorkDemo(d, true)).toThrow('registrada')
    const edited = editWorkDocument(d, { comments: 'Nueva observación' })
    expect(edited.approval).toBeNull()
    expect(edited.status).toBe('Borrador')
    expect(edited.revision).toBe(d.revision + 1)
    let work = createWorkDocument('OT-1002', 'work')
    work = editWorkDocument(work, { items: work.items.map((i) => ({ ...i, performed: true })) })
    expect(approveWorkDemo(work, true).status).toBe('Finalizado DEMO')
    expect(() => reviewWorkDocument({ ...edited, date: '', validDays: 0 })).toThrow()
  })
  it('templates require selection, reset performed flags, maintain type and do not modify the source', () => {
    const d = createWorkDocument('OT-1002', 'work'),
      result = loadWorkTemplate(d, 'maintenance')
    expect(result.items.every((i) => !i.performed)).toBe(true)
    expect(result.items.some((i) => i.type === 'Insumo')).toBe(true)
    expect(workTotals(result).total).toBe(0)
    expect(d.items.map((i) => i.id)).not.toEqual(result.items.map((i) => i.id))
    expect(() => loadWorkTemplate(d, 'missing')).toThrow()
  })
  it('references only the same multipoint OT and preserves unreviewed states and original inspection', () => {
    const mp = createMultipunto('OT-1002')
    rememberMultipunto(mp)
    const before = readMultipunto(mp.id),
      doc = attachInspection(createWorkDocument('OT-1002', 'quote'), mp.id)
    expect(doc.inspection?.items.filter((i) => i.state === 'unreviewed')).toHaveLength(33)
    expect(readMultipunto(mp.id)).toEqual(before)
    expect(() => attachInspection(createWorkDocument('OT-1001', 'quote'), mp.id)).toThrow(
      'pertenece'
    )
    doc.inspection!.items[0].state = 'immediate'
    expect(readMultipunto(mp.id)).toEqual(before)
    discardMultipunto(mp.id)
  })
  it('keeps independent page-memory drafts and shares a truthful contact-free local summary', () => {
    const doc = createWorkDocument('OT-1002', 'quote')
    rememberWorkDocument(doc)
    doc.comments = 'mutation'
    expect(readWorkDocument(doc.id)?.comments).toBe('')
    const copy = readWorkDocument(doc.id)!
    copy.items[0].price = 0
    expect(readWorkDocument(doc.id)?.items[0].price).toBe(52900)
    const text = localWorkSummary(doc)
    expect(text).toContain('Sin envío')
    expect(text).not.toContain('@')
    expect(text).not.toContain('María')
    discardWorkDocument(doc.id)
    expect(readWorkDocument(doc.id)).toBeUndefined()
  })
})
