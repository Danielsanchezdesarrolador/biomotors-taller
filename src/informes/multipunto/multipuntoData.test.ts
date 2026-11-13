import { describe, expect, it } from 'vitest'
import {
  adaptInspection,
  categories,
  counts,
  createMultipunto,
  exactLegacyMap,
  finalizeDemo,
  legacyResult,
  setResult,
  validatePhoto,
  validateReport
} from './multipuntoData'
import { documentContext } from '../documentosData'
import { initialInspection } from '../../ordenes/detalleData'
import { readOrderRevision, sessionOrders } from '../../ordenes/orderSession'
import { discardMultipunto, readMultipunto, rememberMultipunto } from './multipuntoSession'
describe('BT-INS-01', () => {
  it('defines stable independent catalogue: 34 items, five categories, unreviewed by default', () => {
    const items = adaptInspection({})
    expect(items).toHaveLength(34)
    expect(new Set(items.map((i) => i.id)).size).toBe(34)
    expect(categories).toHaveLength(5)
    expect(items.every((i) => i.state === 'unreviewed')).toBe(true)
  })
  it('changes green → yellow → red → clear with exactly one state; preserves other items and notes', () => {
    let r = createMultipunto('OT-1001')
    r.observations = 'Revisar pastillas'
    r.items[0].note = 'Nota individual'
    const untouched = structuredClone(r.items.slice(1))
    for (const state of ['ok', 'attention', 'immediate', 'unreviewed'] as const) {
      r = setResult(r, r.items[0].id, state)
      expect(r.items[0].state).toBe(state)
      expect(counts(r.items)[state]).toBe(state === 'unreviewed' ? 34 : 1)
      expect(r.items.slice(1)).toEqual(untouched)
      expect(r.observations).toBe('Revisar pastillas')
      expect(r.items[0].note).toBe('Nota individual')
    }
  })
  it('derives every counter and never counts unreviewed as OK', () => {
    let r = createMultipunto('OT-1001')
    r = setResult(r, 'pastillas', 'immediate')
    r = setResult(r, 'neblina', 'ok')
    r = setResult(r, 'bandejas', 'attention')
    expect(counts(r.items)).toEqual({
      total: 34,
      reviewed: 3,
      ok: 1,
      attention: 1,
      immediate: 1,
      unreviewed: 31
    })
  })
  it('adapts only exact oil level; broad legacy checks never imply individual approval or red', () => {
    expect(exactLegacyMap).toEqual({ 'aceite-motor': 'aceite' })
    const items = adaptInspection(initialInspection)
    expect(items.filter((i) => i.state !== 'unreviewed').map((i) => i.id)).toEqual(['aceite-motor'])
    expect(legacyResult('atencion')).toBe('attention')
    expect(legacyResult('no-revisado')).toBe('unreviewed')
    expect(items.some((i) => i.state === 'immediate')).toBe(false)
  })
  it('loads coherent order, customer, vehicle, visit, technician and branding; report edits do not mutate OT', () => {
    for (const order of sessionOrders()) {
      const before = readOrderRevision(order),
        r = createMultipunto(order.id),
        ctx = documentContext(r)
      expect(r.client).toBe(ctx.client.name)
      expect(r.plate).toBe(ctx.vehicle.plate)
      expect(r.mileage).toBe(order.mileage)
      expect(r.technician).toBe(order.technician)
      expect(r.visitDate).toMatch(/^2026-11-\d{2}$/)
      expect(r.fuel).toBe('')
      expect(r.workshop.name).toBe('Taller de demostración')
      setResult(r, 'aceite-motor', 'immediate')
      expect(readOrderRevision(order)).toEqual(before)
    }
  })
  it('validates missing technical details, time ordering and explicit pending closure', () => {
    const r = createMultipunto('OT-1002')
    expect(validateReport(r).length).toBeGreaterThan(0)
    expect(() => finalizeDemo(r, true)).toThrow()
    Object.assign(r, { fuel: 'Gasolina DEMO', start: '09:00', end: '08:00' })
    expect(validateReport(r).join(' ')).toContain('anterior')
    r.end = '10:30'
    expect(() => finalizeDemo(r, false)).toThrow('pendientes')
    const final = finalizeDemo(r, true)
    expect(final.finalized).toBe(true)
    expect(final.closedWithPending).toBe(true)
    expect(counts(final.items).unreviewed).toBe(33)
    expect(setResult(final, 'neblina', 'ok').finalized).toBe(false)
  })
  it('keeps independent page-memory copies, with deliberate discard', () => {
    const r = createMultipunto('OT-1001')
    rememberMultipunto(r)
    r.observations = 'changed outside'
    expect(readMultipunto(r.id)?.observations).toBe('')
    const copy = readMultipunto(r.id)!
    copy.items[0].state = 'ok'
    expect(readMultipunto(r.id)?.items[0].state).toBe('unreviewed')
    discardMultipunto(r.id)
    expect(readMultipunto(r.id)).toBeUndefined()
  })
  it('validates photo formats, size, count and rejects SVG or empty files', () => {
    expect(validatePhoto({ type: 'image/png', size: 100 }, 0)).toBe('')
    for (const type of ['image/svg+xml', 'text/html', 'application/pdf'])
      expect(validatePhoto({ type, size: 100 }, 0)).not.toBe('')
    for (const size of [0, 5 * 1024 * 1024 + 1])
      expect(validatePhoto({ type: 'image/jpeg', size }, 0)).not.toBe('')
    expect(validatePhoto({ type: 'image/webp', size: 100 }, 6)).not.toBe('')
  })
})
