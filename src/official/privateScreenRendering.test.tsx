import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { OfficialWorkspaceView } from '../App'

describe('ByteTorque authenticated navigation continuity', () => {
  it('never reads saved navigation for a public, unauthenticated review', () => {
    const html = renderToStaticMarkup(<OfficialWorkspaceView review />)
    expect(html).toContain('¿Qué vamos a hacer hoy?')
  })
  it('restores Clientes after R1 revalidation with a new authorized workspace mount', () => {
    const originalWindow = globalThis.window
    const fakeStorage = {
      getItem: vi.fn(() => 'clientes'),
      setItem: vi.fn(),
      removeItem: vi.fn()
    }
    vi.stubGlobal('window', { localStorage: fakeStorage })
    try {
      const html = renderToStaticMarkup(<OfficialWorkspaceView session={{
        workshop: 'Taller sintético', role: 'Propietario', controls: null
      }} />)
      expect(html).toContain('Clientes y vehículos')
      expect(html).not.toContain('¿Qué vamos a hacer hoy?')
      expect(fakeStorage.getItem).toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
      if (originalWindow !== undefined) vi.stubGlobal('window', originalWindow)
    }
  })
})
