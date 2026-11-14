import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { BrandLogo, SoftwareAttribution } from './BrandLogo'
import { createWorkDocument } from '../informes/trabajos/trabajosData'
import { WorkDocumentPreview } from '../informes/trabajos/WorkDocumentPreview'
import { createDocument } from '../informes/documentosData'
import { DocumentoPreview } from '../informes/DocumentoPreview'

describe('BT-BRAND-01 approved product identity', () => {
  it('uses the official horizontal image, with a light support and no SVG substitute', () => {
    const html = renderToStaticMarkup(<BrandLogo />)
    expect(html).toContain('bt-brand-horizontal')
    expect(html).toContain('/brand/logo-horizontal.webp')
    expect(html).toContain('alt="ByteTorque — Gestión de Talleres"')
    expect(html).not.toContain('<svg')
  })
  it('keeps the official icon decorative when its name is already provided by the control', () => {
    const html = renderToStaticMarkup(<BrandLogo variant="icon" decorative />)
    expect(html).toContain('/brand/icon.webp')
    expect(html).toContain('alt=""')
  })
  it('labels product attribution separately from the service provider', () => {
    expect(renderToStaticMarkup(<SoftwareAttribution />)).toContain('Software ByteTorque')
  })
  it.each(['quote', 'work'] as const)(
    'preserves a custom workshop logo and name in %s A4',
    (mode) => {
      const doc = createWorkDocument('OT-1002', mode)
      doc.workshop.name = 'Taller piloto de prueba'
      doc.workshop.logo = 'data:image/png;base64,WORKSHOP_ONLY'
      const html = renderToStaticMarkup(<WorkDocumentPreview document={doc} />)
      const header = html.split('<header>')[1].split('</header>')[0]
      expect(header).toContain('Taller piloto de prueba')
      expect(header).toContain('data:image/png;base64,WORKSHOP_ONLY')
      expect(header).not.toContain('/brand/')
      expect(html).toContain('Software ByteTorque')
    }
  )
  it('does not present ByteTorque as the service provider of a legacy document', () => {
    const document = createDocument('BRAND-QA', 'Informe', 'OT-1002')
    const html = renderToStaticMarkup(<DocumentoPreview document={document} />)
    expect(html.split('</header>')[0]).toContain('Taller de demostración')
    expect(html).not.toContain('<strong>Byte')
  })
})
