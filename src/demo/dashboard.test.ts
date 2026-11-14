import { describe, expect, it } from 'vitest'
import { demoOrders, filterDemoOrders, getDashboardMetrics, orderStatuses } from '../../tests/fixtures/dashboard'

describe('dashboard de demostración', () => {
  it('muestra métricas coherentes con los estados', () => {
    expect(getDashboardMetrics().active).toBe(18)
    expect(orderStatuses.reduce((n, status) => n + status.count, 0)).toBe(18)
  })
  it('filtra por patente y nombre de vehículo', () => {
    expect(filterDemoOrders('DEMO-02').map(o => o.id)).toEqual(['OT-1002'])
    expect(filterDemoOrders('toyota').length).toBe(1)
  })
  it('filtra por estado y combina filtros', () => {
    expect(filterDemoOrders('', 'servicio').map(o => o.id)).toEqual(['OT-1002'])
    expect(filterDemoOrders('Toyota', 'servicio')).toEqual([])
  })
  it('no expone datos reales ni envíos', () => {
    expect(demoOrders.every(o => o.plate.startsWith('DEMO-'))).toBe(true)
  })
})
