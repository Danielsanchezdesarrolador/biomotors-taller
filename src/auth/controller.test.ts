import { describe, it, expect, vi } from 'vitest'
import {
  AuthController,
  AuthFailure,
  type AuthGateway,
  type Membership,
  type Role
} from './controller'
import { authConfig } from './config'
function fixture(role: Role = 'owner') {
  let event: (event: string) => void = () => {}
  const gateway: AuthGateway = {
    hasSession: vi.fn(async () => true),
    getUser: vi.fn(async () => ({ id: 'user-a', confirmed: true })),
    signIn: vi.fn(async () => {}),
    signOut: vi.fn(async () => {}),
    memberships: vi.fn(async () => [
      { user_id: 'user-a', workshop_id: 'a', role, status: 'active' }
    ]),
    workshops: vi.fn(async () => [{ id: 'a', name: 'Taller autorizado A', status: 'active' }]),
    subscribe: vi.fn((callback) => {
      event = callback
      return () => {}
    })
  }
  return {
    gateway,
    controller: new AuthController(gateway),
    event: (value: string) => event(value)
  }
}
const flush = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve()
}
describe('BT-AUTH-01B-R1 controller · SDK stubs, no real Auth/RLS', () => {
  it('defaults OFF and rejects foreign projects, legacy/secret keys and truthy flags', () => {
    for (const enabled of [undefined, '', 'false', '1', 'TRUE'])
      expect(authConfig({ enabled }).enabled).toBe(false)
    const good = {
      enabled: 'true',
      url: 'https://suxcqqnmcjoezfxltoms.supabase.co',
      key: 'sb_publishable_test'
    }
    expect(authConfig(good).enabled).toBe(true)
    for (const key of ['', 'sb_secret_forbidden', 'eyJhbGci.fake', 'service_role'])
      expect(authConfig({ ...good, key }).enabled).toBe(false)
    expect(authConfig({ ...good, url: 'https://another.supabase.co' }).enabled).toBe(false)
    const c = new AuthController(null, 'Apagado')
    expect(c.getSnapshot()).toEqual({ phase: 'disabled', message: 'Apagado' })
    c.start()()
    void c.login('unused', 'unused')
    void c.logout()
    void c.validate()
    expect(c.getSnapshot().phase).toBe('disabled')
  })
  it.each<Role>(['owner', 'admin', 'mechanic', 'reception'])(
    'uses only server membership role %s',
    async (role) => {
      const { controller: c, gateway: g } = fixture(role)
      expect(c.getSnapshot().context).toBeUndefined()
      await c.validate()
      expect(g.getUser).toHaveBeenCalledOnce()
      expect(g.memberships).toHaveBeenCalledWith('user-a')
      expect(c.getSnapshot().phase).toBe(role === 'reception' ? 'restricted' : 'authorized')
      expect(c.getSnapshot().context?.role).toBe(role)
    }
  )
  it('no session stays anonymous without querying memberships', async () => {
    const { controller: c, gateway: g } = fixture()
    vi.mocked(g.hasSession).mockResolvedValue(false)
    await c.validate()
    expect(c.getSnapshot().phase).toBe('anonymous')
    expect(g.memberships).not.toHaveBeenCalled()
  })
  it('does not trust cached session without verified getUser', async () => {
    const { controller: c, gateway: g } = fixture()
    vi.mocked(g.getUser).mockResolvedValue(null)
    await c.validate()
    expect(c.getSnapshot().message).toContain('sesión venció')
    expect(g.memberships).not.toHaveBeenCalled()
  })
  it('unconfirmed email blocks all membership reads', async () => {
    const { controller: c, gateway: g } = fixture()
    vi.mocked(g.getUser).mockResolvedValue({ id: 'user-a', confirmed: false })
    await c.validate()
    expect(c.getSnapshot().phase).toBe('unconfirmed')
    expect(g.memberships).not.toHaveBeenCalled()
  })
  it.each<Membership[]>([
    [],
    [{ user_id: 'user-a', workshop_id: 'a', role: 'owner', status: 'disabled' }],
    [{ user_id: 'user-b', workshop_id: 'a', role: 'owner', status: 'active' }],
    [{ user_id: 'user-a', workshop_id: 'a', role: 'platform_admin', status: 'active' }]
  ])('denies missing, disabled, foreign or unknown-role memberships %#', async (...rows) => {
    const { controller: c, gateway: g } = fixture()
    // it.each spreads each row array as arguments.
    vi.mocked(g.memberships).mockResolvedValue(rows as Membership[])
    await c.validate()
    expect(c.getSnapshot().phase).toBe('no-membership')
    expect(c.getSnapshot().context).toBeUndefined()
  })
  it('rejects suspended or RLS-hidden workshop', async () => {
    const { controller: c, gateway: g } = fixture()
    vi.mocked(g.workshops).mockResolvedValue([{ id: 'a', name: 'A', status: 'suspended' }])
    await c.validate()
    expect(c.getSnapshot().phase).toBe('no-membership')
    vi.mocked(g.workshops).mockResolvedValue([])
    await c.validate()
    expect(c.getSnapshot().phase).toBe('no-membership')
  })
  it('revalidates explicit multi-workshop choice and refuses an arbitrary UUID', async () => {
    const { controller: c, gateway: g } = fixture()
    vi.mocked(g.memberships).mockResolvedValue([
      { user_id: 'user-a', workshop_id: 'a', role: 'admin', status: 'active' },
      { user_id: 'user-a', workshop_id: 'b', role: 'mechanic', status: 'active' }
    ])
    vi.mocked(g.workshops).mockResolvedValue([
      { id: 'a', name: 'A', status: 'active' },
      { id: 'b', name: 'B', status: 'active' }
    ])
    await c.validate()
    expect(c.getSnapshot().phase).toBe('choose')
    expect(c.getSnapshot().context).toBeUndefined()
    await c.choose('b')
    expect(c.getSnapshot().context?.role).toBe('mechanic')
    expect(g.getUser).toHaveBeenCalledTimes(2)
    await c.choose('foreign')
    expect(c.getSnapshot().phase).toBe('no-membership')
    await c.changeWorkshop()
    expect(c.getSnapshot().phase).toBe('choose')
  })
  it('clears context immediately on reconnect/focus validation and revocation', async () => {
    const { controller: c, gateway: g } = fixture()
    await c.validate()
    vi.mocked(g.memberships).mockResolvedValue([])
    const pending = c.validate()
    expect(c.getSnapshot().context).toBeUndefined()
    await pending
    expect(c.getSnapshot().phase).toBe('no-membership')
  })
  it('clears old user and workshop when identity changes', async () => {
    const { controller: c, gateway: g } = fixture()
    await c.validate()
    vi.mocked(g.getUser).mockResolvedValue({ id: 'user-b', confirmed: true })
    await c.validate()
    expect(c.getSnapshot().phase).toBe('no-membership')
    expect(c.getSnapshot().context).toBeUndefined()
  })
  it('discards a membership response arriving after logout', async () => {
    const { controller: c, gateway: g } = fixture()
    let resolve!: (value: Membership[]) => void
    vi.mocked(g.memberships).mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        })
    )
    const request = c.validate()
    await flush()
    await c.logout()
    resolve([{ user_id: 'user-a', workshop_id: 'a', role: 'owner', status: 'active' }])
    await request
    expect(c.getSnapshot().phase).toBe('anonymous')
    expect(c.getSnapshot().context).toBeUndefined()
    await c.validate()
    expect(c.getSnapshot().phase).toBe('anonymous')
  })
  it('keeps access blocked after failed server logout', async () => {
    const { controller: c, gateway: g } = fixture()
    await c.validate()
    vi.mocked(g.signOut).mockRejectedValue(new AuthFailure('offline'))
    await c.logout()
    expect(c.getSnapshot().phase).toBe('error')
    expect(c.getSnapshot().context).toBeUndefined()
    await c.validate()
    expect(c.getSnapshot().phase).toBe('error')
  })
  it('never exposes credential errors, passwords, tokens or emails in state', async () => {
    const { controller: c, gateway: g } = fixture()
    vi.mocked(g.signIn).mockRejectedValue(new Error('specific account secret'))
    await c.validate()
    await c.login('private-address', 'private-password')
    expect(c.getSnapshot().phase).toBe('anonymous')
    expect(JSON.stringify(c.getSnapshot())).not.toMatch(/private-|specific account|secret/)
  })
  it('signIn is followed by getUser and RLS reads, never by a chosen visual role', async () => {
    const { controller: c, gateway: g } = fixture('mechanic')
    await c.validate()
    await c.login(' address ', 'password')
    expect(g.signIn).toHaveBeenCalledWith('address', 'password')
    expect(c.getSnapshot().context?.role).toBe('mechanic')
    expect(g.getUser).toHaveBeenCalledTimes(2)
  })
  it('offline and expired failures clear authorization', async () => {
    const { controller: c, gateway: g } = fixture()
    await c.validate()
    vi.mocked(g.getUser).mockRejectedValue(new AuthFailure('offline'))
    await c.validate()
    expect(c.getSnapshot().phase).toBe('offline')
    expect(c.getSnapshot().context).toBeUndefined()
    vi.mocked(g.getUser).mockRejectedValue(new AuthFailure('expired'))
    await c.validate()
    expect(c.getSnapshot().phase).toBe('anonymous')
  })
  it('session events invalidate immediately and defer SDK work outside callback lock', async () => {
    vi.useFakeTimers()
    const { controller: c, gateway: g, event } = fixture()
    const stop = c.start()
    await flush()
    expect(c.getSnapshot().phase).toBe('authorized')
    const calls = vi.mocked(g.getUser).mock.calls.length
    event('TOKEN_REFRESHED')
    expect(c.getSnapshot().context).toBeUndefined()
    expect(g.getUser).toHaveBeenCalledTimes(calls)
    await vi.runAllTimersAsync()
    await flush()
    expect(c.getSnapshot().phase).toBe('authorized')
    event('SIGNED_OUT')
    expect(c.getSnapshot().phase).toBe('anonymous')
    expect(c.getSnapshot().context).toBeUndefined()
    stop()
    vi.useRealTimers()
  })
  it('ignores stale validation on teardown and supports StrictMode remount', async () => {
    const { controller: c } = fixture()
    c.start()()
    await flush()
    expect(c.getSnapshot().context).toBeUndefined()
    const stop = c.start()
    await flush()
    expect(c.getSnapshot().phase).toBe('authorized')
    stop()
  })
})
