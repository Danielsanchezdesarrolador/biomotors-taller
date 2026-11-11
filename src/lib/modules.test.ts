import { describe, expect, it } from 'vitest'
import { formatCount, getEmptyStateMessage, moduleNames } from './modules'

describe('módulos iniciales', () => {
  it('contiene los cuatro módulos acordados para la base del taller', () => {
    expect(moduleNames).toEqual(['Clientes', 'Vehículos', 'Revisiones', 'Presupuestos'])
  })
  it('explica el estado vacío sin inventar datos', () => {
    expect(getEmptyStateMessage(0)).toBe('Sin registros todavía')
    expect(getEmptyStateMessage(1)).toBe('1 registro disponible')
    expect(getEmptyStateMessage(3)).toBe('3 registros disponibles')
  })
  it('formatea cantidades para Chile y rechaza valores inválidos', () => {
    expect(formatCount(1234)).toBe('1.234')
    expect(() => formatCount(-1)).toThrow(RangeError)
    expect(() => formatCount(1.5)).toThrow(RangeError)
  })
})
