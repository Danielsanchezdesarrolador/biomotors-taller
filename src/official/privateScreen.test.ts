import { describe, expect, it, vi } from 'vitest'
import { clearPrivateScreen, readPrivateScreen, rememberPrivateScreen } from './privateScreen'

function fixture() {
  const entries = new Map<string, string>()
  const store = {
    getItem: vi.fn((key: string) => entries.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { entries.set(key, value) }),
    removeItem: vi.fn((key: string) => { entries.delete(key) })
  }
  return {store, entries}
}

describe('ByteTorque private navigation continuity', () => {
  it('restores Clientes after changing tabs or remounting the authorized workspace', () => {
    const {store, entries} = fixture()
    expect(readPrivateScreen(store)).toBe('inicio')
    rememberPrivateScreen('clientes', store)
    expect(readPrivateScreen(store)).toBe('clientes')
    expect([...entries.values()]).toEqual(['clientes'])
    // The browser stores ONLY a screen identifier, not private Auth/customer data.
    expect(JSON.stringify([...entries])).not.toMatch(/user_id|workshop_id|token|customer_id/)
  })
  it('supports every approved panel, but ignores unknown or malicious stored values', () => {
    const {store, entries} = fixture()
    for (const screen of ['inicio','ordenes','clientes','informes','configuracion'] as const) {
      rememberPrivateScreen(screen,store)
      expect(readPrivateScreen(store)).toBe(screen)
    }
    rememberPrivateScreen('private-admin' as never, store)
    expect(readPrivateScreen(store)).toBe('configuracion')
    const savedKey = [...entries.keys()][0]
    entries.set(savedKey, '<script>alert("x")</script>')
    expect(readPrivateScreen(store)).toBe('inicio')
  })
  it('clears navigation after sign-out or workshop switch', () => {
    const {store} = fixture()
    rememberPrivateScreen('clientes',store)
    clearPrivateScreen(store)
    expect(readPrivateScreen(store)).toBe('inicio')
  })
  it('fails safely if browser storage is unavailable or throws', () => {
    expect(readPrivateScreen(null)).toBe('inicio')
    rememberPrivateScreen('clientes',null)
    clearPrivateScreen(null)
    const blocked = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
      removeItem: () => { throw new Error('blocked') }
    }
    expect(readPrivateScreen(blocked)).toBe('inicio')
    expect(() => rememberPrivateScreen('clientes',blocked)).not.toThrow()
    expect(() => clearPrivateScreen(blocked)).not.toThrow()
  })
})
