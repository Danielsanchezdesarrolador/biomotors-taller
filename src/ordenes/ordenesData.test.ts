import { describe, expect, it } from 'vitest'
import { demoWorkOrders, nextWorkStatus, searchWorkOrders, workStatusLabels } from './ordenesData'

describe('BT-UI-03 · órdenes de trabajo DEMO', () => {
  it('utiliza únicamente clientes y patentes ficticios', () => {
    expect(demoWorkOrders.length).toBeGreaterThan(4)
    expect(demoWorkOrders.every(o => o.client.includes('DEMO') && o.plate.startsWith('DEMO-'))).toBe(true)
  })
  it('busca por orden, cliente, vehículo y patente sin distinguir mayúsculas', () => {
    expect(searchWorkOrders(demoWorkOrders, 'ot-1001', 'todas')).toHaveLength(1)
    expect(searchWorkOrders(demoWorkOrders, 'maría torres', 'todas')[0]?.id).toBe('OT-1002')
    expect(searchWorkOrders(demoWorkOrders, 'tucson', 'todas')[0]?.id).toBe('OT-1002')
    expect(searchWorkOrders(demoWorkOrders, 'demo-03', 'todas')[0]?.id).toBe('OT-1003')
  })
  it('combina búsqueda con filtro de estado', () => {
    expect(searchWorkOrders(demoWorkOrders, '', 'diagnostico').every(o => o.status === 'diagnostico')).toBe(true)
    expect(searchWorkOrders(demoWorkOrders, 'Corolla', 'servicio')).toEqual([])
  })
  it('respeta los colores/estados oficiales y no reinicia órdenes finalizadas', () => {
    expect(workStatusLabels.diagnostico).toBe('En diagnóstico')
    expect(workStatusLabels.servicio).toBe('En servicio')
    expect(workStatusLabels.repuestos).toBe('Por repuestos')
    expect(workStatusLabels.entrega).toBe('Lista para entrega')
    expect(nextWorkStatus('diagnostico')).toBe('servicio')
    expect(nextWorkStatus('finalizada')).toBe('finalizada')
  })
})
