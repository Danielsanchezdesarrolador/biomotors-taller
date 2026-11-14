import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from '../tests/harness/WorkflowApp'

describe('BT-FLOW-01C — Inicio premium guiado (DEMOSTRACIÓN)', () => {
  const output = renderToStaticMarkup(<App />)

  it('mantiene los cinco paneles de navegación aprobados', () => {
    for (const name of ['Inicio', 'Órdenes de trabajo', 'Clientes y vehículos', 'Informes y cotizaciones', 'Configuración']) {
      expect(output).toContain(name)
    }
  })

  it('muestra los KPI conservados, ingreso, expedientes y progreso verificable', () => {
    for (const text of ['Byte', 'Torque', '¿Qué vamos a hacer hoy?', 'Órdenes activas', 'Vehículos en taller', 'Informes pendientes', 'Cotizaciones pendientes', 'Nuevo ingreso de vehículo', 'Continuar trabajos', 'Expediente de visita', 'Iniciar inspección']) {
      expect(output).toContain(text)
    }
    expect((output.match(/class="metric-card"/g) ?? []).length).toBe(4)
    expect((output.match(/class="fl-case-row"/g) ?? []).length).toBe(8)
    expect(output).toContain('Navegar no completa hitos')
  })

  it('no presenta datos ficticios como operaciones reales', () => {
    expect(output).toContain('Entorno de demostración:')
    expect(output).toContain('datos ficticios solo en memoria de esta pestaña')
    expect(output).toContain('Recargar descarta los cambios nuevos. Sin guardado permanente ni correos.')
    expect(output).toContain('Taller de demostración')
  })

  it('muestra el atajo de búsqueda y la marca actual', () => {
    expect(output).toContain('shortcut-hint')
    expect(output).toContain('<kbd>Ctrl</kbd>')
    expect(output).toContain('ByteTorque')
    expect(output).not.toContain('TallerFlow')
  })
})
