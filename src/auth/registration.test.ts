import { describe, expect, it, vi } from 'vitest'
import { AuthController, type AuthGateway } from './controller'

function gateway(): AuthGateway {
  return {
    hasSession: vi.fn(async () => false),
    getUser: vi.fn(async () => null),
    signIn: vi.fn(async () => {}),
    register: vi.fn(async () => {}),
    signOut: vi.fn(async () => {}),
    memberships: vi.fn(async () => []),
    workshops: vi.fn(async () => []),
    subscribe: vi.fn(() => () => {})
  }
}
describe('Registro piloto — sin apertura de roles ni datos privados', () => {
  it('prepares confirmation without giving a user a workshop membership', async () => {
    const g = gateway()
    const c = new AuthController(g)
    await c.register('  PERSONA@EXAMPLE.COM ', 'Only-for-test1!')
    expect(g.register).toHaveBeenCalledWith('persona@example.com', 'Only-for-test1!')
    expect(c.getSnapshot().phase).toBe('registration-sent')
    expect(c.getSnapshot().context).toBeUndefined()
    expect(g.memberships).not.toHaveBeenCalled()
    expect(g.workshops).not.toHaveBeenCalled()
    expect(g.signIn).not.toHaveBeenCalled()
  })
  it('fails closed on email provider errors without exposing credentials', async () => {
    const g = gateway()
    vi.mocked(g.register!).mockRejectedValue(new Error('provider secret in detail'))
    const c = new AuthController(g)
    await c.register('x@example.com', 'secret-example')
    expect(c.getSnapshot().phase).toBe('error')
    expect(c.getSnapshot().message).not.toContain('provider secret')
    expect(c.getSnapshot().context).toBeUndefined()
  })
  it('cannot register when the integration is disabled', async () => {
    const c = new AuthController(null, 'Deshabilitado')
    await c.register('x@example.com', 'pass')
    expect(c.getSnapshot().phase).toBe('disabled')
  })
})
