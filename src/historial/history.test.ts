import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context, Role } from '../auth/controller'
import { historyRepository } from './repository'
import { compareCursor, instant, resolutionLabel, slicePage } from './contracts'
const uuid = (n: number) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0')
const wid = uuid(1),
  uid = uuid(2),
  vid = uuid(3),
  oid = uuid(10)
const context: Context = {
  userId: uid,
  role: 'owner',
  workshop: { id: wid, name: 'Synthetic', status: 'active' }
}
const order = (n: number) => ({
  id: uuid(n),
  workshop_id: wid,
  vehicle_id: vid,
  complaint: 'Motivo del cliente',
  intake_odometer: 12000,
  status: 'closed',
  opened_at: '2026-11-16T12:00:00.123456Z',
  closed_at: '2026-11-16T13:00:00Z',
  updated_at: '2026-11-16T13:00:00Z',
  opened_by: uid
})
const finding = (n: number, resolution = 'pending') => ({
  id: uuid(n),
  workshop_id: wid,
  vehicle_id: vid,
  order_id: oid,
  category: 'Frenos',
  result: 'attention',
  note: 'Observación registrada',
  resolution,
  resolved_at: resolution === 'resolved' ? '2026-11-16T13:00:00Z' : null,
  recorded_by: uid,
  created_at: '2026-11-16T12:30:00Z',
  updated_at: '2026-11-16T12:30:00Z'
})
type Row = Record<string, any>
type Call = {
  table: string
  eq: Record<string, unknown>
  inside: Record<string, string[]>
  orders: string[]
  limit: number
  or?: string
  signal?: AbortSignal
}
function fake(role: Role = 'owner') {
  const rows: Record<string, Row[]> = {
    workshop_memberships: [{ workshop_id: wid, user_id: uid, role, status: 'active' }],
    workshops: [{ id: wid, status: 'active' }],
    vehicles: [
      {
        id: vid,
        workshop_id: wid,
        customer_id: uuid(4),
        plate: 'QA1234',
        make: 'Synthetic',
        model: 'QA',
        odometer_km: 100
      }
    ],
    work_orders: [order(10)],
    inspection_findings: [finding(20), finding(21, 'resolved')],
    quotes: [],
    quote_revisions: [],
    quote_events: []
  }
  const calls: Call[] = [],
    fail: Record<string, string> = {},
    corrupt: Record<string, Row[] | undefined> = {}
  let pause: ((c: Call) => Promise<void>) | undefined
  const getUser = vi.fn(async () => ({
    data: { user: { id: uid, email_confirmed_at: '2026-11-16' } },
    error: null as unknown
  }))
  function from(table: string) {
    const call: Call = { table, eq: {}, inside: {}, orders: [], limit: 1000 }
    calls.push(call)
    async function execute(single = false) {
      await pause?.(call)
      if (fail[table]) return { data: null, error: { code: fail[table] } }
      let data =
        corrupt[table] ||
        rows[table].filter(
          (r) =>
            Object.entries(call.eq).every(([k, v]) => r[k] === v) &&
            Object.entries(call.inside).every(([k, v]) => v.includes(r[k]))
        )
      if (call.orders.length) {
        const col = call.orders[0]
        data = [...data].sort(
          (a, b) => -compareCursor({ at: a[col], id: a.id }, { at: b[col], id: b.id })
        )
      }
      if (call.or) {
        const at = call.or.split('.lt.')[1].split(',')[0],
          id = call.or.match(/,id\.lt\.([a-f0-9-]+)/)![1],
          col = call.orders[0]
        data = data.filter((r) => compareCursor({ at: r[col], id: r.id }, { at, id }) < 0)
      }
      data = data.slice(0, call.limit)
      return { data: single ? data[0] || null : data, error: null }
    }
    const query = {
      select: () => query,
      eq: (k: string, v: unknown) => {
        call.eq[k] = v
        return query
      },
      in: (k: string, v: string[]) => {
        call.inside[k] = v
        return query
      },
      order: (k: string) => {
        call.orders.push(k)
        return query
      },
      limit: (n: number) => {
        call.limit = n
        return query
      },
      or: (s: string) => {
        call.or = s
        return query
      },
      abortSignal: (s: AbortSignal) => {
        call.signal = s
        return query
      },
      maybeSingle: () => execute(true),
      then: (resolve: (value: unknown) => unknown, reject: (e: unknown) => unknown) =>
        execute().then(resolve, reject)
    }
    return query
  }
  const client = { auth: { getUser }, from, rpc: vi.fn() } as unknown as SupabaseClient
  return {
    client,
    rows,
    calls,
    fail,
    corrupt,
    getUser,
    setPause: (fn: typeof pause) => {
      pause = fn
    },
    repo: () => historyRepository(client, { ...context, role }, { cp05Enabled: false })
  }
}
describe('CP06 chronology and existing history semantics', () => {
  it('sorts timestamp ties by ID, preserves PostgreSQL microseconds and cursor', () => {
    const a = { id: uuid(10), at: '2026-11-16T12:00:00.123455Z' },
      b = { id: uuid(11), at: '2026-11-16T12:00:00.123456Z' },
      c = { id: uuid(12), at: b.at }
    const p = slicePage([a, b, c], (x) => x.at, null, 2)
    expect(p.rows).toEqual([c, b])
    expect(p.next).toEqual({ id: b.id, at: b.at })
    expect(instant('2026-11-16T09:00:00.123456-03:00')).toBe(instant(b.at))
    expect(() => slicePage([c], (x) => x.at, p.next)).toThrow()
  })
  it('closed orders preserve pending and resolved findings without claiming work performed', async () => {
    const f = fake(),
      r = f.repo()
    const page = await r.visits(vid),
      issues = await r.pending(vid)
    expect(page.rows[0].order.status).toBe('closed')
    expect(page.rows[0].findings).toHaveLength(2)
    expect(issues.rows.map((f) => f.id)).toEqual([uuid(20)])
    expect(resolutionLabel(page.rows[0].findings[0])).toBe('Resolución registrada')
    expect(page.quotes.status).toBe('off')
    expect(f.calls.some((c) => c.table.startsWith('quote'))).toBe(false)
    expect(f.client.rpc).not.toHaveBeenCalled()
  })
  it('loads more than 40 visits with stable, disjoint server keyset pages', async () => {
    const f = fake()
    f.rows.work_orders = Array.from({ length: 45 }, (_, i) => order(i + 10))
    const r = f.repo()
    const a = await r.visits(vid),
      b = await r.visits(vid, a.next),
      c = await r.visits(vid, b.next)
    const all = [...a.rows, ...b.rows, ...c.rows]
    expect(all).toHaveLength(45)
    expect(new Set(all.map((v) => v.order.id)).size).toBe(45)
    expect(c.next).toBeNull()
    expect(all[0].order.id).toBe(uuid(54))
    for (const call of f.calls.filter((c) => c.table === 'work_orders')) {
      expect(call.eq).toMatchObject({ workshop_id: wid, vehicle_id: vid })
      expect(call.orders).toEqual(['opened_at', 'id'])
      expect(call.limit).toBe(21)
    }
    expect(
      f.calls
        .filter((c) => c.table === 'inspection_findings')
        .every((c) => c.eq.vehicle_id === vid && c.inside.order_id.length <= 20)
    ).toBe(true)
  })
  it('does not silently truncate more than 200 findings per visit', async () => {
    const f = fake()
    f.rows.inspection_findings = Array.from({ length: 225 }, (_, i) => finding(100 + i))
    const p = await f.repo().visits(vid)
    expect(p.rows[0].findings).toHaveLength(225)
    expect(f.calls.filter((c) => c.table === 'inspection_findings')).toHaveLength(2)
  })
  it('removes multipoint issues superseded by a later OK from pending but not history',async()=>{
    const f=fake()
    const previous={...finding(45),category:'Multipunto · Luces bajas',
      result:'attention',resolution:'pending',note:'Fallo',
      created_at:'2026-11-16T12:00:00.000001Z'}
    const ok={...previous,id:uuid(46),result:'ok',resolution:'not_applicable',
      note:null,created_at:'2026-11-16T12:01:00.000001Z'}
    f.rows.inspection_findings=[previous,ok,finding(47)]
    const r=f.repo()
    expect((await r.pending(vid)).rows.map(row=>row.id)).toEqual([uuid(47)])
    expect((await r.visits(vid)).rows[0].findings).toHaveLength(3)
  })
  it('pending issues are independently paginated across old visits', async () => {
    const f = fake()
    f.rows.inspection_findings = Array.from({ length: 25 }, (_, i) => finding(i + 100))
    const r = f.repo(),
      a = await r.pending(vid),
      b = await r.pending(vid, a.next)
    expect(a.rows).toHaveLength(20)
    expect(b.rows).toHaveLength(5)
    expect(b.next).toBeNull()
  })
  it('empty vehicle histories and missing CP05 tables do not invent documents', async () => {
    const f = fake()
    f.rows.work_orders = []
    expect((await f.repo().visits(vid)).rows).toEqual([])
    f.rows.work_orders = [order(10)]
    f.fail.quotes = 'PGRST205'
    const p = await historyRepository(f.client, context, { cp05Enabled: true }).visits(vid)
    expect(p.rows).toHaveLength(1)
    expect(p.quotes.status).toBe('unavailable')
    expect(p.quotes.revisions).toEqual([])
  })
  it('does not drop historical quotes when more than 20 records belong to loaded visits', async () => {
    // The deployed CP05 schema currently permits one quote per OT. This
    // defensive pagination test also covers future amendments/imports.
    const f = fake()
    f.rows.quotes = Array.from({ length: 45 }, (_, index) => ({
      id: uuid(300 + index),
      workshop_id: wid,
      vehicle_id: vid,
      customer_id: uuid(4),
      order_id: oid,
      number: index + 1,
      status: 'draft',
      created_at: '2026-11-16T12:10:00.123456Z'
    }))
    const page = await historyRepository(f.client, context, { cp05Enabled: true }).visits(vid)
    expect(page.quotes.status).toBe('ready')
    expect(page.quotes.quotes).toHaveLength(45)
    expect(new Set(page.quotes.quotes.map((quote) => quote.id)).size).toBe(45)
    expect(f.calls.filter((c) => c.table === 'quotes')).toHaveLength(1)
    const query = f.calls.find((c) => c.table === 'quotes')!
    expect(query.eq).toMatchObject({ workshop_id: wid, vehicle_id: vid })
    expect(query.inside.order_id).toEqual([oid])
    expect(query.orders).toEqual(['created_at', 'id'])
    expect(query.limit).toBe(201)
  })
  it('pages large quote histories without losing equal-timestamp records', async () => {
    const f = fake()
    f.rows.quotes = Array.from({ length: 225 }, (_, index) => ({
      id: uuid(500 + index),
      workshop_id: wid,
      vehicle_id: vid,
      customer_id: uuid(4),
      order_id: oid,
      number: index + 1,
      status: 'issued',
      created_at: '2026-11-16T12:10:00.123456Z'
    }))
    const page = await historyRepository(f.client, context, { cp05Enabled: true }).visits(vid)
    expect(page.quotes.status).toBe('ready')
    expect(page.quotes.quotes).toHaveLength(225)
    const quoteCalls = f.calls.filter((c) => c.table === 'quotes')
    expect(quoteCalls).toHaveLength(2)
    expect(quoteCalls[1].or).toContain('id.lt.')
  })
  it('retains immutable quote snapshots apart from the current draft and audit', async () => {
    const f = fake(),
      qid = uuid(40)
    f.rows.quotes = [
      {
        id: qid,
        workshop_id: wid,
        vehicle_id: vid,
        customer_id: uuid(4),
        order_id: oid,
        status: 'draft',
        created_at: '2026-11-16T12:10:00Z'
      }
    ]
    f.rows.quote_revisions = [
      {
        id: uuid(41),
        workshop_id: wid,
        quote_id: qid,
        revision: 1,
        issued_at: '2026-11-16T12:40:00Z',
        payload: {
          quote: { id: qid, workshop_id: wid },
          vehicle: { id: vid },
          order: { id: oid },
          customer: { id: uuid(4), full_name: 'Original QA' },
          totals: { total: 11900 }
        }
      }
    ]
    f.rows.quote_events = [
      {
        id: uuid(42),
        workshop_id: wid,
        quote_id: qid,
        kind: 'revised',
        created_at: '2026-11-16T12:50:00Z'
      }
    ]
    const page = await historyRepository(f.client, context, { cp05Enabled: true }).visits(vid)
    expect(page.quotes.status).toBe('ready')
    expect(page.quotes.quotes[0].status).toBe('draft')
    expect(page.quotes.revisions[0].payload.totals.total).toBe(11900)
    expect(page.quotes.events).toHaveLength(1)
  })
})
describe('CP06 session, tenant isolation and read-only SDK', () => {
  it.each<Role>(['owner', 'admin', 'reception', 'mechanic'])(
    'permits %s to read without a write method',
    async (role) => {
      const f = fake(role),
        r = f.repo()
      expect((await r.vehicle(vid)).id).toBe(vid)
      expect((await r.visits(vid)).rows).toHaveLength(1)
      expect(Object.keys(r).sort()).toEqual(['dispose', 'pending', 'vehicle', 'visits'])
      expect(f.client.rpc).not.toHaveBeenCalled()
    }
  )
  it('revoked membership and identity switch fail closed', async () => {
    const f = fake(),
      r = f.repo()
    await r.visits(vid)
    f.rows.workshop_memberships[0].status = 'disabled'
    await expect(r.visits(vid)).rejects.toMatchObject({ kind: 'denied' })
    f.rows.workshop_memberships[0].status = 'active'
    await expect(r.visits(vid)).rejects.toMatchObject({ kind: 'denied' })
    f.getUser.mockResolvedValue({
      data: { user: { id: uuid(99), email_confirmed_at: 'x' } },
      error: null
    })
    await expect(f.repo().visits(vid)).rejects.toMatchObject({ kind: 'denied' })
  })
  it('denies unconfirmed email and suspended workshop', async () => {
    const f = fake()
    f.getUser.mockResolvedValue({
      data: { user: { id: uid, email_confirmed_at: '' } },
      error: null
    })
    await expect(f.repo().visits(vid)).rejects.toMatchObject({ kind: 'denied' })
    const g = fake()
    g.rows.workshops[0].status = 'suspended'
    await expect(g.repo().visits(vid)).rejects.toMatchObject({ kind: 'denied' })
  })
  it('queries tenant A only and rejects a corrupt backend row from B', async () => {
    const f = fake()
    f.rows.work_orders.push({ ...order(99), workshop_id: uuid(99) })
    expect((await f.repo().visits(vid)).rows).toHaveLength(1)
    f.corrupt.work_orders = [{ ...order(99), workshop_id: uuid(99) }]
    await expect(f.repo().visits(vid)).rejects.toMatchObject({ kind: 'denied' })
  })
  it('rejects another vehicle or findings from another order', async () => {
    const f = fake()
    f.corrupt.work_orders = [{ ...order(99), vehicle_id: uuid(99) }]
    await expect(f.repo().visits(vid)).rejects.toMatchObject({ kind: 'denied' })
    const g = fake()
    g.corrupt.inspection_findings = [{ ...finding(99), order_id: uuid(99) }]
    await expect(g.repo().visits(vid)).rejects.toMatchObject({ kind: 'denied' })
  })
  it('disposal aborts requests and late results cannot escape the old context', async () => {
    const f = fake(),
      r = f.repo()
    let release: () => void = () => {},
      started: () => void = () => {}
    const begun = new Promise<void>((done) => {
      started = done
    })
    f.setPause(async (call) => {
      if (call.table === 'work_orders') {
        started()
        await new Promise<void>((done) => {
          release = done
        })
      }
    })
    const result = r.visits(vid)
    await begun
    r.dispose()
    release()
    await expect(result).rejects.toMatchObject({ kind: 'denied' })
    expect(f.calls.filter((c) => c.table === 'work_orders')[0].signal?.aborted).toBe(true)
  })
  it('checks membership again before exposing completed query results', async () => {
    const f = fake()
    f.setPause(async (call) => {
      if (call.table === 'inspection_findings') f.rows.workshop_memberships[0].status = 'disabled'
    })
    await expect(f.repo().visits(vid)).rejects.toMatchObject({ kind: 'denied' })
  })
})
