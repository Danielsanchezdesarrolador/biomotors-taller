import type { SupabaseClient } from '@supabase/supabase-js'
import { documentClient } from './documentClient'
import type { Context } from '../auth/controller'
import { cp04Repository } from '../ordenes/cp04Repository'
import {
  QuoteFailure,
  QuoteReadPending,
  quoteId,
  draftPayload,
  type Quote,
  type QuoteItem,
  type Bundle,
  type Draft,
  type Revision,
  type Delivery,
  type QuoteEvent,
  type Source
} from './contracts'
export function cp05Repository(client: SupabaseClient, context: Context) {
  const wid = quoteId(context.workshop.id),
    uid = quoteId(context.userId),
    orders = cp04Repository(client, context),
    // The browser UI is only enabled for the configured QA workshop.
    // Real authorization remains enforced by Edge + membership/RLS.
    pilotDocumentsEnabled =
      import.meta.env.VITE_BT_CP05_DOCUMENTS_ENABLED === 'true' &&
      import.meta.env.VITE_BT_CP05_PILOT_WORKSHOP_ID === wid,
    documents = documentClient(client, context, {
      archive: pilotDocumentsEnabled,
      email: pilotDocumentsEnabled && import.meta.env.VITE_BT_CP05_EMAIL_ENABLED === 'true'
    })
  let generation = 0,
    stopped = false
  function check(error: unknown) {
    if (!error) return
    const code = (error as { code?: string }).code
    throw new QuoteFailure(
      code === '40001'
        ? 'conflict'
        : ['42501', 'PGRST301'].includes(code || '')
          ? 'denied'
          : ['22023', '23514', '22P02', '23502', '23505'].includes(code || '')
            ? 'invalid'
            : 'unavailable'
    )
  }
  async function guard(write = false) {
    if (stopped) throw new QuoteFailure('denied')
    const epoch = generation
    const { data, error } = await client.auth.getUser()
    check(error)
    if (!data.user || data.user.id !== uid || !data.user.email_confirmed_at)
      throw new QuoteFailure('denied')
    const m = await client
      .from('workshop_memberships')
      .select('workshop_id,user_id,role,status')
      .eq('workshop_id', wid)
      .eq('user_id', uid)
      .eq('status', 'active')
      .maybeSingle()
    check(m.error)
    if (
      !m.data ||
      m.data.user_id !== uid ||
      m.data.workshop_id !== wid ||
      m.data.status !== 'active' ||
      m.data.role !== context.role ||
      (write && !['owner', 'admin', 'reception'].includes(m.data.role))
    )
      throw new QuoteFailure('denied')
    const w = await client
      .from('workshops')
      .select('id,name,status')
      .eq('id', wid)
      .eq('status', 'active')
      .maybeSingle()
    check(w.error)
    if (!w.data || w.data.id !== wid || w.data.status !== 'active') throw new QuoteFailure('denied')
    valid(epoch)
    return { epoch, workshop: { id: wid, name: w.data.name as string } }
  }
  function valid(epoch: number) {
    if (stopped || epoch !== generation) throw new QuoteFailure('denied')
  }
  function row<T extends { workshop_id: string }>(value: unknown): T {
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      (value as T).workshop_id !== wid
    )
      throw new QuoteFailure('unavailable')
    return value as T
  }
  async function list(vehicleId?: string) {
    const { epoch } = await guard()
    let query = client.from('quotes').select('*').eq('workshop_id', wid)
    if (vehicleId) query = query.eq('vehicle_id', quoteId(vehicleId))
    const r = await query.order('updated_at', { ascending: false }).limit(50)
    check(r.error)
    valid(epoch)
    return (r.data || []).map((x) => row<Quote>(x))
  }
  async function forOrder(orderId: string) {
    const { epoch } = await guard()
    const r = await client
      .from('quotes')
      .select('*')
      .eq('workshop_id', wid)
      .eq('order_id', quoteId(orderId))
      .maybeSingle()
    check(r.error)
    valid(epoch)
    return r.data ? row<Quote>(r.data) : null
  }
  async function load(id: string): Promise<Bundle> {
    const { epoch, workshop } = await guard(),
      qid = quoteId(id)
    const r = await client
      .from('quotes')
      .select('*')
      .eq('workshop_id', wid)
      .eq('id', qid)
      .maybeSingle()
    check(r.error)
    if (!r.data) throw new QuoteFailure('denied')
    const quote = row<Quote>(r.data)
    if (quote.id !== qid) throw new QuoteFailure('denied')
    const [source, items, revisions, events] = await Promise.all([
      orders.getOrder(quote.order_id).catch(error=>{throw new QuoteFailure(error?.kind==='denied'?'denied':'unavailable')}),
      client
        .from('quote_items')
        .select('*')
        .eq('workshop_id', wid)
        .eq('quote_id', qid)
        .order('position'),
      client
        .from('quote_revisions')
        .select('*')
        .eq('workshop_id', wid)
        .eq('quote_id', qid)
        .order('revision', { ascending: false }),
      client
        .from('quote_events')
        .select('*')
        .eq('workshop_id', wid)
        .eq('quote_id', qid)
        .order('created_at', { ascending: false })
    ])
    check(items.error)
    check(revisions.error)
    check(events.error)
    if (
      !source || source.order.id!==quote.order_id ||
      source.vehicle.id !== quote.vehicle_id ||
      source.vehicle.customer_id !== quote.customer_id
    )
      throw new QuoteFailure('denied')
    const c = await client
      .from('customers')
      .select('id,workshop_id,full_name,email,mobile_e164')
      .eq('workshop_id', wid)
      .eq('id', quote.customer_id)
      .maybeSingle()
    check(c.error)
    if (!c.data || c.data.id !== quote.customer_id) throw new QuoteFailure('denied')
    row(c.data)
    const archived = (revisions.data || []).map((x) => row<Revision>(x))
    let deliveries: Delivery[] = []
    if (archived.length) {
      const d = await client
        .from('quote_delivery_events')
        .select('*')
        .eq('workshop_id', wid)
        .in(
          'revision_id',
          archived.map((x) => x.id)
        )
        .order('created_at', { ascending: false })
      check(d.error)
      deliveries = (d.data || []).map((x) => row<Delivery>(x))
    }
    valid(epoch)
    const rows = (items.data || []).map((x) => row<QuoteItem>(x))
    if (
      rows.some((x) => x.quote_id !== qid) ||
      (events.data || []).some(x=>row<QuoteEvent>(x).quote_id!==qid) ||
      archived.some(
        (x) =>
          x.quote_id !== qid || x.payload.quote.id !== qid || x.payload.quote.workshop_id !== wid ||
          x.payload.workshop.id!==wid || x.payload.quote.revision!==x.revision ||
          x.payload.customer.id!==quote.customer_id || x.payload.vehicle.id!==quote.vehicle_id || x.payload.order.id!==quote.order_id
      )
    )
      throw new QuoteFailure('denied')
    if (deliveries.some((d) => !archived.some((r) => r.id === d.revision_id)))
      throw new QuoteFailure('denied')
    return {
      quote,
      items: rows,
      source: {
        workshop,
        customer: c.data,
        vehicle: source.vehicle,
        order: source.order
      } as Source,
      revisions: archived,
      deliveries,
      events: (events.data || []).map((x) => row<QuoteEvent>(x))
    }
  }
  async function command(
    name: string,
    args: Record<string, unknown>,
    requestId: string,
    write = true
  ) {
    const { epoch } = await guard(write)
    const r = await client.rpc(name, {
      p_workshop_id: wid,
      p_request_id: quoteId(requestId),
      ...args
    })
    check(r.error)
    valid(epoch)
    if (!r.data || typeof r.data.id !== 'string' || !Number.isSafeInteger(r.data.version))
      throw new QuoteFailure('unavailable')
    quoteId(r.data.id)
    try {
      const b = await load(r.data.id)
      valid(epoch)
      if (b.quote.version < r.data.version) throw new QuoteFailure('unavailable')
      // A subsequent authorized edit may already have advanced the version.
      return b
    } catch(error) {
      valid(epoch)
      if(error instanceof QuoteFailure && error.kind==='denied')throw error
      throw new QuoteReadPending(r.data.id,r.data.version)
    }
  }
  return {
    documents,
    list,
    forOrder,
    load,
    orders: () => orders.recentOrders(true),
    open: (orderId: string, requestId: string) =>
      command('bt_cp05_open_quote', { p_order_id: quoteId(orderId) }, requestId),
    save: (quote: Quote, draft: Draft, requestId: string) =>
      command(
        'bt_cp05_save_quote',
        {
          p_quote_id: quoteId(quote.id),
          p_expected_version: quote.version,
          p_data: draftPayload(draft)
        },
        requestId
      ),
    revise: (q: Quote, reason: string, rid: string) =>
      command(
        'bt_cp05_revise_quote',
        { p_quote_id: quoteId(q.id), p_expected_version: q.version, p_reason: reason },
        rid
      ),
    void: (q: Quote, reason: string, rid: string) =>
      command(
        'bt_cp05_void_quote',
        { p_quote_id: quoteId(q.id), p_expected_version: q.version, p_reason: reason },
        rid
      ),
    dispose() {
      stopped = true
      generation++
      orders.dispose()
      documents.dispose()
    }
  }
}
export type Cp05Port = ReturnType<typeof cp05Repository>
