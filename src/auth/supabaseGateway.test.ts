import { describe, it, expect, vi } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createGateway, supabaseGateway } from './supabaseGateway'
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }))
function fixture() {
  const query = { select: vi.fn(), eq: vi.fn(), in: vi.fn(), then: undefined }
  query.select.mockReturnValue(query)
  query.in.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  const unsubscribe = vi.fn()
  const client = {
    auth: {
      getSession: vi.fn(async () => ({
        data: { session: { access_token: 'test-only' } },
        error: null
      })),
      getUser: vi.fn(async () => ({
        data: {
          user: { id: 'a', email_confirmed_at: 'confirmed', user_metadata: { role: 'owner' } }
        },
        error: null
      })),
      signInWithPassword: vi.fn(async () => ({ error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe } } }))
    },
    from: vi.fn(() => query)
  }
  return {
    client,
    query,
    unsubscribe,
    gateway: supabaseGateway(client as unknown as SupabaseClient)
  }
}
describe('Official Supabase SDK adapter · mocked client only', () => {
  it('enables SDK-only session persistence, refresh and disables URL session consumption', () => {
    const { client } = fixture()
    vi.mocked(createClient).mockReturnValue(client as never)
    createGateway({
      enabled: true,
      url: 'https://suxcqqnmcjoezfxltoms.supabase.co',
      key: 'sb_publishable_mock'
    })
    expect(createClient).toHaveBeenCalledWith(
      'https://suxcqqnmcjoezfxltoms.supabase.co',
      'sb_publishable_mock',
      {
        global: { fetch: expect.any(Function) },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          flowType: 'pkce'
        }
      }
    )
  })
  it('uses password login, verified getUser and local-device logout; no metadata roles', async () => {
    const { gateway: g, client: c } = fixture()
    await g.signIn('test-address', 'test-password')
    expect(c.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test-address',
      password: 'test-password'
    })
    expect(await g.hasSession()).toBe(true)
    expect(await g.getUser()).toEqual({ id: 'a', confirmed: true })
    await g.signOut()
    expect(c.auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })
  it('uses read-only filtered queries for own active memberships and active workshop IDs', async () => {
    const { gateway: g, client: c, query: q } = fixture()
    q.eq.mockReturnValue({ data: [], error: null })
    q.eq.mockReturnValueOnce(q)
    await g.memberships('user-a')
    expect(c.from).toHaveBeenCalledWith('workshop_memberships')
    expect(q.select).toHaveBeenCalledWith('user_id,workshop_id,role,status')
    expect(q.eq.mock.calls).toEqual([
      ['user_id', 'user-a'],
      ['status', 'active']
    ])
    await g.workshops(['a'])
    expect(c.from).toHaveBeenCalledWith('workshops')
    expect(q.in).toHaveBeenCalledWith('id', ['a'])
    expect(q.select).toHaveBeenCalledWith('id,name,status')
  })
  it('maps errors without exposing raw auth or PostgREST messages', async () => {
    const { gateway: g, client: c } = fixture()
    for (const [error, kind] of [
      [{ code: 'email_not_confirmed' }, 'unconfirmed'],
      [{ name: 'AuthRetryableFetchError' }, 'offline'],
      [{ status: 401 }, 'expired'],
      [{ status: 500 }, 'permission']
    ] as const) {
      c.auth.signInWithPassword.mockResolvedValue({ error } as never)
      await expect(g.signIn('address', 'pass')).rejects.toMatchObject({ kind })
    }
  })
  it('unsubscribes the SDK listener', () => {
    const { gateway: g, unsubscribe } = fixture()
    g.subscribe(() => {})()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})
