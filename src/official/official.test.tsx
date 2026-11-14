import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import App from '../App'
import { OfficialPanel } from './OfficialPanels'
import { officialWorkspace } from './officialWorkspace'
import * as seeds from '../data/emptyTestRecords'
import type { Screen } from '../layout/AppShell'
describe('official public preparation', () => {
  it.each<Screen>(['inicio', 'ordenes', 'clientes', 'informes', 'configuracion'])(
    'renders %s without seeded records or data entry',
    (screen) => {
      const html = renderToStaticMarkup(<OfficialPanel screen={screen} onNavigate={() => {}} />)
      expect(html).not.toMatch(
        /DEMO|OT-100[1-8]|@example\.com|Camila|Torres|BIOMOTORS|Respaldo activo/
      )
      expect(html).not.toMatch(/<form|<textarea|<select|type="file"/)
      expect(html).toContain('dashboard-card')
      expect(html).toContain('disabled=""')
    }
  )
  it('does not inherit fixture injection used by workflow tests', () => {
    expect(Object.values(officialWorkspace).every((records) => records.length === 0)).toBe(true)
    expect(
      Object.values(seeds)
        .filter(Array.isArray)
        .every((records) => records.length === 0)
    ).toBe(true)
    expect(() => seeds.settingsFixture('any-workshop')).toThrow('no está configurado')
  })
  it('preserves the R2 shell and warns before any real information could be entered', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('side-nav')
    expect(html).toContain('bottom-nav')
    expect(html).toContain('Por ahora no ingreses datos de clientes ni vehículos reales.')
    expect(html).toContain('Sin sesión iniciada')
    expect(html.match(/<input[^>]+>/g)).toHaveLength(1)
    expect(html.match(/<input[^>]+>/g)![0]).toContain('disabled=""')
    expect(html).not.toMatch(/DEMO|Cuenta de prueba|Taller de demostración/)
  })
  it('keeps the public empty source immutable and without a writable repository', () => {
    expect(Object.isFrozen(officialWorkspace)).toBe(true)
    for (const records of Object.values(officialWorkspace))
      expect(Object.isFrozen(records)).toBe(true)
  })
})
