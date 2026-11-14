import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { WorkQuoteSummary } from './WorkQuoteSummary'
import { createWorkDocument } from './trabajosData'

describe('guided quotation summary', () => {
  it('renders every existing item, fractional quantities and canonical CLP totals without editing the quotation', () => {
    const doc = createWorkDocument('OT-1002', 'quote')
    doc.items = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      description: `Partida de prueba ${i + 1}`,
      type: 'Insumo',
      quantity: 1.5,
      price: 1001,
      performed: false
    }))
    const before = structuredClone(doc)
    const html = renderToStaticMarkup(
      <WorkQuoteSummary document={doc} expanded={false} editorId="advanced" onToggle={() => {}} />
    )
    expect(html.match(/class="wt-compact-description"/g)).toHaveLength(12)
    expect(html).toContain('1,5')
    expect(html).toContain('$1.502 CLP')
    expect(html).toContain('$18.024 CLP')
    expect(html).toContain('$3.425 CLP')
    expect(html).toContain('$21.449 CLP')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-controls="advanced"')
    expect(doc).toEqual(before)
  })
  it('offers an explicit route to add items when empty without fabricating prices or performed controls', () => {
    const doc = { ...createWorkDocument('OT-1002', 'quote'), items: [] }
    const html = renderToStaticMarkup(
      <WorkQuoteSummary document={doc} expanded={true} editorId="advanced" onToggle={() => {}} />
    )
    expect(html).toContain('Sin partidas.')
    expect(html).toContain('$0 CLP')
    expect(html).toContain('Ocultar detalle de edición')
    expect(html).toContain('aria-expanded="true"')
    expect(html).not.toContain('type="checkbox"')
  })
})
