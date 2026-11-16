import { describe, expect, it, vi } from 'vitest'
import { cp05Repository } from './repository'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
const a = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const b = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const ctx: Context = {
  userId: a,
  role: 'owner',
  workshop: { id: b, name: 'Synthetic B', status: 'active' }
}
type State = { rows: Record<string, unknown>[]; fail?: string }
function fake(role = 'owner') {
  const reads: Record<string, State> = {
    workshop_memberships: { rows: [{ user_id: a, workshop_id: b, status: 'active', role }] },
    workshops: { rows: [{ id: b, status: 'active' }] },
    vehicles: { rows: [] },
    work_orders: { rows: [] },
    inspection_findings: { rows: [] },
    quotes: { rows: [] }
  }
  const touched: string[] = []
  function from(table: string) {
    touched.push(table)
    const chain = {
      select: () => chain,
      eq: () => chain,
      is: () => chain,
      order: () => chain,
      limit: () => chain,
      in: () => chain,
      neq: () => chain,
      insert: () => chain,
      update: () => chain,
      maybeSingle: async () => ({ data: reads[table]?.rows[0] ?? null, error: null }),
      single: async () => ({ data: reads[table]?.rows[0] ?? null, error: null }),
      then: (fn: (v: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve(
          fn({
            data: reads[table]?.rows ?? [],
            error: null
          })
        )
    }
    return chain
  }
  const client = {
    rpc: vi.fn(async () => ({ data: null, error: null })),
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: a, email_confirmed_at: '2026-01-01' } },
        error: null
      }))
    },
    from: vi.fn(from)
  }
  return { client: client as unknown as SupabaseClient, reads, touched }
}
describe('CP05 authorized repository', () => {
  it('guards every query and rejects switched or revoked membership', async () => {
    const { client, reads } = fake()
    const r = cp05Repository(client, ctx)
    expect(await r.list()).toEqual([])
    reads.workshop_memberships.rows = []
    await expect(r.list()).rejects.toMatchObject({ kind: 'denied' })
    r.dispose()
    await expect(r.list()).rejects.toMatchObject({ kind: 'denied' })
  })
  it('mechanic may read but never invoke a write RPC', async () => {
    const { client } = fake('mechanic')
    const r = cp05Repository(client, { ...ctx, role: 'mechanic' })
    expect(await r.list()).toEqual([])
    await expect(r.open(a, a)).rejects.toMatchObject({ kind: 'denied' })
    expect(client.rpc).not.toHaveBeenCalled()
  })
  it('does not trust the UI role or cross-tenant rows', async () => {
    const { client, reads } = fake('mechanic')
    await expect(cp05Repository(client, ctx).open(a, a)).rejects.toMatchObject({ kind: 'denied' })
    reads.workshop_memberships.rows[0] = {
      user_id: a,
      workshop_id: b,
      status: 'active',
      role: 'owner'
    }
    reads.quotes.rows = [{ workshop_id: a, id: a }]
    await expect(cp05Repository(client, ctx).list()).rejects.toMatchObject({ kind: 'unavailable' })
  })
  it('expired verified user cannot even read quotations', async () => {
    const { client } = fake()
    vi.mocked(client.auth.getUser).mockResolvedValueOnce({
      data: { user: null },
      error: null
    } as never)
    await expect(cp05Repository(client, ctx).list()).rejects.toMatchObject({ kind: 'denied' })
  })
})
