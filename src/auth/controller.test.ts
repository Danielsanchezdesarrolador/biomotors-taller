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
  let event: (event: string, observedUserId?:string) => void = () => {}
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
    event: (value: string, observedUserId?:string) => event(value,observedUserId)
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
  it('carries a display name without changing the server-authorized role', async () => {
    const { controller: c, gateway: g } = fixture('owner')
    vi.mocked(g.getUser).mockResolvedValue({
      id: 'user-a', confirmed: true, displayName: 'Paula González'
    })
    await c.validate()
    expect(c.getSnapshot().context?.displayName).toBe('Paula González')
    expect(c.getSnapshot().context?.role).toBe('owner')
    vi.mocked(g.memberships).mockResolvedValue([])
    await c.validate()
    expect(c.getSnapshot().phase).toBe('no-membership')
    expect(c.getSnapshot().identityName).toBe('Paula González')
    expect(c.getSnapshot().context).toBeUndefined()
  })
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
  it('keeps context during routine validation and clears it when revocation is confirmed', async () => {
    const { controller: c, gateway: g } = fixture()
    await c.validate()
    vi.mocked(g.memberships).mockResolvedValue([])
    const verified=c.getSnapshot()
    const pending = c.validate()
    expect(c.getSnapshot()).toBe(verified)
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
  it('can log in after sign-out and route remount, without restoring old access', async () => {
    const {controller:c,gateway:g}=fixture()
    const stop=c.start();await flush();await c.logout();stop()
    const stopAgain=c.start();await flush()
    expect(c.getSnapshot().phase).toBe('anonymous')
    expect(c.getSnapshot().context).toBeUndefined()
    await c.login('synthetic@invalid.test','synthetic')
    expect(g.signIn).toHaveBeenCalledOnce()
    expect(c.getSnapshot().phase).toBe('authorized')
    stopAgain()
  })
  it('finishes a pending sign-out after a route remount', async () => {
    const {controller:c,gateway:g}=fixture()
    const stop=c.start();await flush()
    let finish!:()=>void
    vi.mocked(g.signOut).mockImplementation(()=>new Promise<void>(resolve=>{finish=resolve}))
    const signingOut=c.logout();stop();const stopAgain=c.start()
    expect(c.getSnapshot().phase).toBe('signing-out')
    finish();await signingOut
    expect(c.getSnapshot().phase).toBe('anonymous')
    stopAgain()
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
  it('token refresh keeps context, verifies outside callback lock; sign-out clears immediately', async () => {
    vi.useFakeTimers()
    const { controller: c, gateway: g, event } = fixture()
    const stop = c.start()
    await flush()
    expect(c.getSnapshot().phase).toBe('authorized')
    const calls = vi.mocked(g.getUser).mock.calls.length
    const verified=c.getSnapshot()
    event('TOKEN_REFRESHED')
    expect(c.getSnapshot()).toBe(verified)
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
  it('does not replace the anonymous login during a routine check; login supersedes its stale result',async()=>{
    const {controller:c,gateway:g}=fixture();vi.mocked(g.hasSession).mockResolvedValue(false);await c.validate()
    const anonymous=c.getSnapshot();let release!:(value:boolean)=>void
    vi.mocked(g.hasSession).mockImplementationOnce(()=>new Promise(resolve=>{release=resolve}))
    const pending=c.validate();expect(c.getSnapshot()).toBe(anonymous)
    vi.mocked(g.hasSession).mockResolvedValue(true)
    await c.login('synthetic@invalid.test','synthetic-password')
    release(false);await pending
    expect(c.getSnapshot().phase).toBe('authorized')
  })
  it('coalesces concurrent routine reads, preserving snapshot and repository identity', async () => {
    const {controller:c,gateway:g}=fixture();await c.validate()
    const before=c.getSnapshot();let finish!:(rows:Membership[])=>void
    vi.mocked(g.memberships).mockImplementation(()=>new Promise(resolve=>{finish=resolve}))
    const a=c.validate(),b=c.validate();await flush()
    expect(g.memberships).toHaveBeenCalledTimes(2)
    expect(c.getSnapshot()).toBe(before)
    finish([{user_id:'user-a',workshop_id:'a',role:'owner',status:'active'}])
    await Promise.all([a,b]);expect(c.getSnapshot()).toBe(before)
  })
  it('coalesces focus/visibility and Auth bursts without leaking listeners after stop',async()=>{
    vi.useFakeTimers()
    try{const {controller:c,gateway:g,event}=fixture();const stop=c.start();await flush()
      c.requestRevalidation();c.requestRevalidation();event('TOKEN_REFRESHED','user-a')
      await vi.advanceTimersByTimeAsync(60);await flush();expect(g.getUser).toHaveBeenCalledTimes(2)
      c.requestRevalidation();stop();await vi.runAllTimersAsync();expect(g.getUser).toHaveBeenCalledTimes(2)
    }finally{vi.useRealTimers()}
  })
  it('invalidates a different SDK identity immediately, without trusting that hint to authorize',async()=>{
    const {controller:c,gateway:g,event}=fixture();const stop=c.start();await flush()
    event('SIGNED_IN','user-b');expect(c.getSnapshot().context).toBeUndefined()
    expect(c.getSnapshot().phase).toBe('checking');stop()
    expect(g.memberships).toHaveBeenCalledTimes(1)
  })
  it('offline invalidation defeats an already-running successful validation',async()=>{
    const {controller:c,gateway:g}=fixture();await c.validate();let finish!:(rows:Membership[])=>void
    vi.mocked(g.memberships).mockImplementation(()=>new Promise(resolve=>{finish=resolve}))
    const pending=c.validate();await flush();c.goOffline()
    expect(c.getSnapshot().phase).toBe('offline');expect(c.getSnapshot().context).toBeUndefined()
    finish([{user_id:'user-a',workshop_id:'a',role:'owner',status:'active'}]);await pending
    expect(c.getSnapshot().phase).toBe('offline')
  })
  it('revalidates after returning to access while password login is still pending', async () => {
    const { controller: c, gateway: g } = fixture()
    vi.mocked(g.hasSession).mockResolvedValue(false)
    const leave = c.start()
    await flush()
    let finish!: () => void
    vi.mocked(g.signIn).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        })
    )
    const pending = c.login('address', 'password')
    leave()
    const stop = c.start()
    await flush()
    expect(c.getSnapshot().context).toBeUndefined()
    vi.mocked(g.hasSession).mockResolvedValue(true)
    finish()
    await pending
    await flush()
    expect(c.getSnapshot().phase).toBe('authorized')
    expect(g.getUser).toHaveBeenCalledOnce()
    stop()
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
