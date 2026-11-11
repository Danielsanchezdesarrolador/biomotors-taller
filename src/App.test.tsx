import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('BT-UI-02 — Inicio premium (DEMOSTRACIÓN)', () => {
  const output = renderToStaticMarkup(<App />)

  it('mantiene los cinco paneles de navegación aprobados', () => {
    for (const name of ['Inicio', 'Órdenes de trabajo', 'Clientes y vehículos', 'Informes y cotizaciones', 'Configuración']) {
      expect(output).toContain(name)
    }
  })

  it('muestra el Inicio premium con sus tarjetas, gráfico y accesos', () => {
    for (const text of ['Byte', 'Torque', '¡Hola, equipo!', 'Órdenes activas', 'Vehículos en taller', 'Informes pendientes', 'Cotizaciones pendientes', 'Estado de órdenes', 'Órdenes recientes', 'Actividad reciente', 'Accesos rápidos']) {
      expect(output).toContain(text)
    }
    expect((output.match(/class="metric-card"/g) ?? []).length).toBe(4)
    expect((output.match(/class="order-row"/g) ?? []).length).toBe(4)
    expect(output).toContain('status-legend')
  })

  it('no presenta datos ficticios como operaciones reales', () => {
    expect(output).toContain('Entorno de demostración:')
    expect(output).toContain('las cifras y órdenes son ficticias')
    expect(output).toContain('No se registran clientes ni se envían correos.')
    expect(output).toContain('Taller de demostración')
  })

  it('muestra el atajo de búsqueda y la marca actual', () => {
    expect(output).toContain('shortcut-hint')
    expect(output).toContain('<kbd>Ctrl</kbd>')
    expect(output).toContain('ByteTorque')
    expect(output).not.toContain('TallerFlow')
  })
})
