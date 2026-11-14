import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { BrandLogo } from './BrandLogo'
import { AccessScreens } from '../access/AccessScreens'
import { OfficialWorkspaceView } from '../App'

describe('BT-BRAND-02 dark surface integration', () => {
  it('selects the contrast derivative for dark surfaces without adding another wordmark', () => {
    const html = renderToStaticMarkup(<BrandLogo surface="dark" />)
    expect(html).toContain('/brand/logo-horizontal-dark.webp')
    expect(html).toContain('bt-brand-surface-dark')
    expect(html).not.toContain('<svg')
  })
  it('preserves the original derivative on light surfaces', () => {
    const html = renderToStaticMarkup(<BrandLogo surface="light" />)
    expect(html).toContain('/brand/logo-horizontal.webp')
    expect(html).not.toContain('logo-horizontal-dark')
  })
  it.each(['administrador', 'mecanico'] as const)(
    'uses the dark variant in the %s access',
    (presentation) => {
      const html = renderToStaticMarkup(
        <AccessScreens page="login" presentation={presentation} onNavigate={() => {}} />
      )
      expect(html).toContain('/brand/logo-horizontal-dark.webp')
      expect(html).toContain('Vista de revisión — sin autenticación real')
    }
  )
  it('uses the dark wordmark in the shared sidebar while preserving the official small icon', () => {
    const html = renderToStaticMarkup(<OfficialWorkspaceView />)
    expect(html).toContain('/brand/logo-horizontal-dark.webp')
    expect(html).toContain('/brand/icon.webp')
  })
})
