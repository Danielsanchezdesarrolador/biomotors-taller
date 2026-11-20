/** Read-only CP06. Same authenticated SDK; no writes, SQL, persistence or DEMO fixtures. */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
import { effectivePendingFindings,type Finding,type WorkOrder } from '../ordenes/cp04Contracts'
import type { Quote, Revision, QuoteEvent } from '../cp05/contracts'
import {
  HistoryFailure,
  historyId,
  instant,
  cursorFilter,
  compareCursor,
  slicePage,
  pageSize,
  type Cursor,
  type Vehicle,
  type VisitPage,
  type QuoteHistory,
  type FlowEvidence,
  emptyEvidence,
  type Page
} from './contracts'
const orderCols =
  'workshop_id,id,vehicle_id,complaint,intake_odometer,status,opened_by,opened_at,closed_at,updated_at'
type Row = { workshop_id: string; id: string }
export function historyRepository(
  client: SupabaseClient,
  context: Context,
  options: { cp05Enabled: boolean }
) {
  const wid = historyId(context.workshop.id),
    uid = historyId(context.userId),
    abort = new AbortController()
  let disposed = false
  function alive() {
    if (disposed) throw new HistoryFailure('denied')
  }
  function dispose() {
    disposed = true
    abort.abort()
  }
  function check(error: unknown) {
    alive()
    if (error) {
      const code = (error as { code?: string }).code
      if (['42501', 'PGRST301'].includes(code || '')) {
        dispose()
        throw new HistoryFailure('denied')
      }
      throw new HistoryFailure('unavailable')
    }
  }
  async function guard() {
    alive()
    const auth = await client.auth.getUser()
    alive()
    if (auth.error || auth.data.user?.id !== uid || !auth.data.user.email_confirmed_at) {
      dispose()
      throw new HistoryFailure('denied')
    }
    const member = await client
      .from('workshop_memberships')
      .select('workshop_id,user_id,status,role')
      .eq('workshop_id', wid)
      .eq('user_id', uid)
      .eq('status', 'active')
      .abortSignal(abort.signal)
      .maybeSingle()
    check(member.error)
    const m = member.data
    if (
      !m ||
      m.workshop_id !== wid ||
      m.user_id !== uid ||
      m.status !== 'active' ||
      m.role !== context.role ||
      !['owner', 'admin', 'reception', 'mechanic'].includes(m.role)
    ) {
      dispose()
      throw new HistoryFailure('denied')
    }
    const workshop = await client
      .from('workshops')
      .select('id,status')
      .eq('id', wid)
      .eq('status', 'active')
      .abortSignal(abort.signal)
      .maybeSingle()
    check(workshop.error)
    if (!workshop.data || workshop.data.id !== wid || workshop.data.status !== 'active') {
      dispose()
      throw new HistoryFailure('denied')
    }
  }
  function row<T extends Row>(value: unknown): T {
    alive()
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      (value as Row).workshop_id !== wid
    ) {
      dispose()
      throw new HistoryFailure('denied')
    }
    historyId((value as Row).id)
    return value as T
  }
  function many<T extends Row>(data: unknown): T[] {
    if (!Array.isArray(data)) throw new HistoryFailure('unavailable')
    return data.map((x) => row<T>(x))
  }
  function finding(value: unknown, vid: string): Finding {
    const f = row<Finding>(value)
    if (f.vehicle_id !== vid) {
      dispose()
      throw new HistoryFailure('denied')
    }
    historyId(f.order_id)
    instant(f.created_at)
    if (
      !['ok', 'attention', 'not_checked'].includes(f.result) ||
      !['pending', 'resolved', 'not_applicable'].includes(f.resolution) ||
      typeof f.category !== 'string' ||
      (f.note !== null && typeof f.note !== 'string')
    )
      throw new HistoryFailure('unavailable')
    return f
  }
  async function vehicle(id: string): Promise<Vehicle> {
    const vid = historyId(id)
    await guard()
    const r = await client
      .from('vehicles')
      .select('workshop_id,id,customer_id,plate,plate_key,make,model,odometer_km')
      .eq('workshop_id', wid)
      .eq('id', vid)
      .abortSignal(abort.signal)
      .maybeSingle()
    check(r.error)
    if (!r.data) throw new HistoryFailure('denied')
    const v = row<Vehicle>(r.data)
    if (v.id !== vid) {
      dispose()
      throw new HistoryFailure('denied')
    }
    await guard()
    return v
  }
  async function allRows<T extends Row>(
    table: string,
    ids: string[],
    column: string,
    foreign = 'quote_id',
    vehicleId?: string
  ): Promise<T[]> {
    const result: T[] = []
    let after: Cursor | null = null
    do {
      alive()
      let q = client
        .from(table)
        .select('*')
        .eq('workshop_id', wid)
        .in(foreign, ids)
        .order(column, { ascending: false })
        .order('id', { ascending: false })
        .limit(201)
      if (vehicleId) q = q.eq('vehicle_id', vehicleId)
      if (after) q = q.or(cursorFilter(after, column))
      const r = await q.abortSignal(abort.signal)
      check(r.error)
      const page: Page<T> = slicePage(
        many<T>(r.data),
        (x) => (x as unknown as Record<string, string>)[column],
        after,
        200
      )
      result.push(...page.rows)
      after = page.next
    } while (after)
    return result
  }
  async function quoteHistory(vid: string, orders: WorkOrder[]): Promise<QuoteHistory> {
    const empty = { quotes: [], revisions: [], events: [], evidence: emptyEvidence() }
    if (!options.cp05Enabled) return { status: 'off', ...empty }
    if (!orders.length) return { status: 'ready', ...empty }
    try {
      // One 20-visit page can have many distinct quotes. A fixed limit here
      // silently hid older documents, even while CP06 showed "loaded" visits.
      // Reuse the same keyset pagination as inspection findings/revisions.
      const quotes = await allRows<Quote>(
        'quotes',
        orders.map((o) => o.id),
        'created_at',
        'order_id',
        vid
      )
      for (const quote of quotes)
        if (quote.vehicle_id !== vid || !orders.some((o) => o.id === quote.order_id)) {
          dispose()
          throw new HistoryFailure('denied')
        }
      if (quotes.some((q) => !['draft', 'issued', 'voided'].includes(q.status)))
        throw new HistoryFailure('unavailable')
      if (!quotes.length) return { status: 'ready', ...empty }
      const [revisions, events] = await Promise.all([
        allRows<Revision>(
          'quote_revisions',
          quotes.map((q) => q.id),
          'issued_at'
        ),
        allRows<QuoteEvent>(
          'quote_events',
          quotes.map((q) => q.id),
          'created_at'
        )
      ])
      for (const r of revisions) {
        const quote = quotes.find((q) => q.id === r.quote_id)
        if (
          !quote ||
          r.payload?.quote.id !== quote.id ||
          r.payload.quote.workshop_id !== wid ||
          r.payload.vehicle.id !== vid ||
          r.payload.order.id !== quote.order_id ||
          r.payload.customer.id !== quote.customer_id
        ) {
          dispose()
          throw new HistoryFailure('denied')
        }
        if (
          !Number.isSafeInteger(r.payload.totals.total) ||
          r.payload.totals.total < 0 ||
          !Number.isInteger(r.revision) ||
          r.revision < 1
        )
          throw new HistoryFailure('unavailable')
      }
      if (
        events.some(
          (e) => !quotes.some((q) => q.id === e.quote_id) || !['revised', 'voided'].includes(e.kind)
        )
      )
        throw new HistoryFailure('denied')
      let evidence: FlowEvidence = emptyEvidence()
      // Statically eliminated from the OFF build. CP06 remains usable when
      // the separately authorized SQL has not been installed.
      if (import.meta.env.VITE_BT_FLOW_LIVE_02_ENABLED === 'true') {
        try {
          const { readFlowEvidence } = await import('./flowEvidence')
          evidence = await readFlowEvidence(wid, vid, quotes, revisions, allRows)
        } catch (error) {
          alive()
          if (error instanceof HistoryFailure && error.kind === 'denied') {
            dispose()
            throw error
          }
          evidence = { ...emptyEvidence(), status: 'unavailable' }
        }
      }
      return { status: 'ready', quotes, revisions, events, evidence }
    } catch (error) {
      alive()
      if (error instanceof HistoryFailure && error.kind === 'denied') throw error
      return { status: 'unavailable', ...empty }
    }
  }
  async function visits(id: string, after: Cursor | null = null): Promise<VisitPage> {
    const vid = historyId(id)
    await guard()
    let query = client
      .from('work_orders')
      .select(orderCols)
      .eq('workshop_id', wid)
      .eq('vehicle_id', vid)
      .order('opened_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(pageSize + 1)
    if (after) query = query.or(cursorFilter(after, 'opened_at'))
    const r = await query.abortSignal(abort.signal)
    check(r.error)
    const orders = many<WorkOrder>(r.data)
    for (const o of orders) {
      if (o.vehicle_id !== vid) {
        dispose()
        throw new HistoryFailure('denied')
      }
      if (
        !['received', 'inspecting', 'in_service', 'ready', 'closed'].includes(o.status) ||
        typeof o.complaint !== 'string' ||
        (o.intake_odometer !== null &&
          (!Number.isInteger(o.intake_odometer) || o.intake_odometer < 0))
      )
        throw new HistoryFailure('unavailable')
    }
    const page = slicePage(orders, (o) => o.opened_at, after)
    const findings = page.rows.length
      ? await allRows<Finding>(
          'inspection_findings',
          page.rows.map((o) => o.id),
          'created_at',
          'order_id',
          vid
        )
      : []
    for (const raw of findings) {
      const f = finding(raw, vid)
      if (!page.rows.some((o) => o.id === f.order_id)) {
        dispose()
        throw new HistoryFailure('denied')
      }
    }
    const quotes = await quoteHistory(vid, page.rows)
    await guard()
    return {
      rows: page.rows.map((order) => ({
        order,
        findings: findings.filter((f) => f.order_id === order.id)
      })),
      next: page.next,
      quotes
    }
  }
  async function pending(id: string, after: Cursor | null = null) {
    const vid = historyId(id)
    if(after){historyId(after.id);instant(after.at)}
    await guard()
    // Preserve historical diagnoses; derive current pending using later OKs.
    const all = await allRows<Finding>(
      'inspection_findings', [vid], 'created_at', 'vehicle_id', vid
    )
    const current = effectivePendingFindings(all.map(row=>finding(row,vid)))
    const filtered = after ? current.filter(row=>
      compareCursor({at:row.created_at,id:row.id},after)<0) : current
    const page = slicePage(filtered,(f)=>f.created_at,after)
    await guard()
    return page
  }
  return { vehicle, visits, pending, dispose }
}
export type HistoryPort = ReturnType<typeof historyRepository>
