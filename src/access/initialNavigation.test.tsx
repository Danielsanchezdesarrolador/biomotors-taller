import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import App from '../App'
import { accessPaths, publicEntryPath } from './accessContract'

describe('BT-AUTH-01A-R1 public entry', () => {
  it('renders access immediately, without a dashboard flash before the redirect', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('Inicia sesión')
    expect(html).toContain('Vista de revisión — sin autenticación real')
    expect(html).not.toContain('side-nav')
    expect(html).not.toContain('official-panel')
  })
  it.each(['', '#/'])('opens login for a root bookmark or PWA entry (%s)', (hash) => {
    expect(publicEntryPath({ pathname: '/', hash })).toBe(accessPaths.login)
  })
  it.each([
    accessPaths.register,
    accessPaths.recover,
    accessPaths.verify,
    accessPaths.mechanic,
    accessPaths.administratorReview,
    accessPaths.mechanicReview,
    accessPaths.publicPreview
  ])('preserves the explicit deep link %s', (path) => {
    expect(publicEntryPath({ pathname: '/', hash: '#' + path })).toBe(path)
  })
})
