import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  documentHandlerCandidate,
  type DocumentPolicy
} from '../../server/cp05/documentHandlerCandidate'
import { resendProviderCandidate } from '../../server/cp05/resendProviderCandidate'
import type { Mail } from '../../server/cp05/mailPortsCandidate'
import { documentClient, documentOperation } from './documentClient'
const id = (n: number) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0')
const wid = id(1),
  uid = id(2),
  qid = id(3),
  rid = id(4),
  requestId = id(5),
  origin = 'https://bytetorque.cl'
const pdf = new TextEncoder().encode('%PDF-1.7\nSynthetic archived PDF bytes\n%%EOF')
const policy: DocumentPolicy = { archiveApproved: true, emailApproved: true, allowedOrigin: origin, pilotWorkshopId: wid }
function fixture() {
  const state = {
    role: 'owner',
    active: true,
    pending: false,
    downloadFails: false,
    revision: null as any,
    reserved: null as any,
    events: [] as any[],
    stored: new Map<string, Uint8Array>(),
    lastFinishRequest: '',
    quoteStatus: 'issued',
    latestRevision: 1,
    sendMode: 'success',
    customerEmail: 'qa@invalid.test'
  }
  const snapshot = {
    quote: { id: qid, workshop_id: wid, version: 1, number: 1, revision: 1 },
    workshop: { id: wid, name: 'Taller QA' },
    customer: { id: id(9), full_name: 'Cliente sintético', email: 'qa@invalid.test' },
    vehicle: { id: id(10), plate: 'QA1234' },
    order: { id: id(11) },
    items: [],
    totals: { subtotal: 100, tax: 19, total: 119 },
    document_date: '2026-11-16T12:00:00Z',
    notice: 'No tributario'
  }
  const data = (table: string) =>
    table === 'quotes'
      ? [
          {
            id: qid,
            workshop_id: wid,
            status: state.quoteStatus,
            issued_revision: state.latestRevision
          }
        ]
      : table === 'customers'
        ? [{ id: id(9), workshop_id: wid, email: state.customerEmail }]
        : table === 'workshop_memberships'
        ? state.active
          ? [{ workshop_id: wid, user_id: uid, status: 'active', role: state.role }]
          : []
        : table === 'workshops'
          ? [{ id: wid, status: 'active' }]
          : table === 'quote_revisions'
            ? state.revision
              ? [state.revision]
              : []
            : state.events
  const from = (table: string) => {
    const filters: Record<string, unknown> = {}
    const rows = () =>
      data(table).filter((row) =>
        Object.entries(filters).every(([key, value]) => row[key] === value)
      )
    const chain = {
      select: () => chain,
      eq: (key: string, value: unknown) => {
        filters[key] = value
        return chain
      },
      order: () => chain,
      limit: () => chain,
      maybeSingle: async () => ({ data: rows()[0] || null, error: null }),
      then: (resolve: any, reject: any) =>
        Promise.resolve({ data: rows(), error: null }).then(resolve, reject)
    }
    return chain
  }
  const consumption=new Map<string,any>()
  const rpc = vi.fn(async (name: string, args: any) => {
    if(name==='bt_commercial_finish'){
      const row=consumption.get(args.p_request_id)
      if(!row||row.actor_id!==args.p_actor_id||!state.active)return {data:null,error:Error('DENIED')}
      row.state=args.p_success?'confirmed':'failed';row.bytes=args.p_bytes
      return {data:{request_id:args.p_request_id,state:row.state},error:null}
    }
    if(name==='bt_commercial_cached'){
      const row=consumption.get(args.p_request_id)
      return row?.state==='confirmed'&&row.actor_id===args.p_actor_id?{data:row.bytes?.slice(2),error:null}:{data:null,error:Error('DENIED')}
    }
    if (name === 'bt_cp05_completed_issue')return {data:state.revision?{...state.reserved,completed:state.revision}:null,error:null}
    if (name === 'bt_cp05_issue_status')
      return {
        data: state.pending ? { request_id: state.reserved.request_id, expected_version: 1 } : null,
        error: null
      }
    if (name === 'bt_cp05_prepare_issue') {
      state.reserved ||= {
        request_id: args.p_request_id,
        payload: structuredClone(snapshot),
        revision: 1,
        payload_sha256: 'b'.repeat(64)
      }
      state.pending = !state.revision
      return { data: state.reserved, error: null }
    }
    if (name === 'bt_cp05_finish_issue') {
      state.lastFinishRequest = args.p_request_id
      state.pending = false
      state.revision ||= {
        id: rid,
        workshop_id: wid,
        quote_id: qid,
        revision: 1,
        payload: state.reserved.payload,
        payload_sha256: 'b'.repeat(64),
        pdf_object_path: args.p_path,
        pdf_sha256: args.p_pdf_sha256,
        pdf_size: args.p_pdf_size
      }
      return { data: state.revision, error: null }
    }
    if (name === 'bt_cp05_record_delivery') {
      state.events.push({
        workshop_id: wid,
        revision_id: rid,
        attempt: args.p_attempt,
        status: args.p_status,
        provider_id: args.p_provider_id,
        error_code: args.p_error_code
      })
      return { data: {}, error: null }
    }
    if (name === 'bt_cp05_cancel_issue') {
      state.pending = false
      return { data: null, error: null }
    }
    throw Error('Unexpected RPC ' + name)
  })
  const userClient = {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: uid, email_confirmed_at: '2026-11-16' } },
        error: null
      }))
    },
    from,
    rpc:vi.fn(async(name:string,args:any)=>{
      if(name!=='bt_commercial_reserve')throw Error('Unexpected caller RPC '+name)
      if(!state.active||args.p_workshop_id!==wid||args.p_resource_id!==rid||!['quote','email'].includes(args.p_capability))return {data:null,error:Error('DENIED')}
      const previous=consumption.get(args.p_request_id)
      const row=previous?.state==='confirmed'?previous:{request_id:args.p_request_id,workshop_id:wid,resource_id:rid,actor_id:uid,state:'reserved'}
      consumption.set(args.p_request_id,row);return {data:row,error:null}
    })
  } as unknown as SupabaseClient
  const trusted = {
    rpc,
    storage: {
      from: () => ({
        upload: async (path: string, bytes: Uint8Array) => {
          if (state.stored.has(path)) return { error: Error('exists') }
          state.stored.set(path, bytes)
          return { error: null }
        },
        download: async (path: string) => ({
          error: state.downloadFails ? Error('missing') : null,
          data: state.stored.has(path)
            ? new Blob([state.stored.get(path)!.slice().buffer], { type: 'application/pdf' })
            : null
        })
      })
    }
  } as unknown as SupabaseClient
  const send = vi.fn(async (_mail: Mail) =>
    state.sendMode === 'unknown'
      ? { confirmed: false }
      : state.sendMode === 'failed'
        ? { confirmed: false, definitiveFailure: true, errorCode: 'REJECTED' }
        : { confirmed: true, providerId: 'SYNTHETIC_ACK' }
  )
  const deps = {
    userClient: vi.fn(() => userClient),
    trustedClient: vi.fn(() => trusted),
    assets: vi.fn(async () => ({ font: pdf, logo: pdf })),
    provider: () => ({ send })
  }
  // Rendering is separately verified with the real font/brand in cp05.test.ts.
  // Replace the render port's assets would fail; HTTP issue below uses actual assets.
  return { state, snapshot, userClient, trusted, rpc, send, deps }
}
import { readFileSync } from 'node:fs'
const assets = {
  font: new Uint8Array(readFileSync('public/cp05/DejaVuSans.ttf')),
  logo: new Uint8Array(readFileSync('assets/brand/generated/icon-192.png'))
}
function setup() {
  const f = fixture()
  f.snapshot.quote = {
    ...f.snapshot.quote,
    valid_days: 10,
    terms: 'Condiciones QA',
    comments: ''
  } as any
  f.snapshot.order = { id: id(11), complaint: 'Revisión solicitada' } as any
  f.snapshot.vehicle = { id: id(10), plate: 'QA1234', make: 'QA', model: 'Sintético' } as any
  f.deps.assets.mockResolvedValue(assets)
  return f
}
const request = (action: string, args: Record<string, unknown> = {}) =>
  new Request(origin + '/documents', {
    method: 'POST',
    headers: { origin, authorization: 'Bearer synthetic-only', 'content-type': 'application/json' },
    body: JSON.stringify({
      action, workshopId: wid, quoteId: qid, version: 1, requestId,
      ...(action === 'send' ? { review: {
        reviewedRevisionId: rid, confirmedRecipient: 'qa@invalid.test',
        recipientChecked: true, documentChecked: true, contactAuthorized: true
      } } : {}),
      ...args
    })
  })
describe('Pilot document HTTP, private bytes and delivery integration (synthetic services)', () => {
  it('pilot gate denies missing or different workshop before opening privileged clients', async () => {
    const f = setup()
    const missing = documentHandlerCandidate({ ...policy, pilotWorkshopId: '' }, f.deps)
    const other = documentHandlerCandidate({ ...policy, pilotWorkshopId: id(100) }, f.deps)
    for (const handler of [missing, other]) {
      const response = await handler(request('issue'))
      expect(response.status).toBe(503)
      expect((await response.json()).error).toBe('SERVICE_DISABLED')
    }
    expect(f.deps.userClient).not.toHaveBeenCalled()
    expect(f.deps.trustedClient).not.toHaveBeenCalled()
    expect(f.deps.assets).not.toHaveBeenCalled()
  })
  it('OFF does not instantiate SDK, assets or provider', async () => {
    const f = setup(),
      handler = documentHandlerCandidate({ ...policy, archiveApproved: false }, f.deps)
    expect((await handler(request('issue'))).status).toBe(503)
    expect(f.deps.userClient).not.toHaveBeenCalled()
    expect(f.deps.trustedClient).not.toHaveBeenCalled()
    expect(f.deps.assets).not.toHaveBeenCalled()
  })
  it('rejects hostile Origin, oversized body, expired access and mechanic writes', async () => {
    const f = setup(),
      handler = documentHandlerCandidate(policy, f.deps)
    const wrong = request('issue')
    wrong.headers.set('origin', 'https://invalid.test')
    expect((await handler(wrong)).status).toBe(403)
    const large = request('issue', { extra: 'x'.repeat(20000) })
    expect((await handler(large)).status).toBe(400)
    f.state.active = false
    expect((await handler(request('issue'))).status).toBe(403)
    f.state.active = true
    f.state.role = 'mechanic'
    expect((await handler(request('issue'))).status).toBe(403)
    expect(f.deps.trustedClient).not.toHaveBeenCalled()
  })
  it('emits, reads back private PDF, downloads identical bytes and attaches them for provider ack', async () => {
    const f = setup(),
      handler = documentHandlerCandidate(policy, f.deps)
    const issued = await handler(request('issue'))
    expect(issued.status).toBe(200)
    const revision = (await issued.json()).revision
    expect(f.state.stored.size).toBe(1)
    const downloaded = await handler(request('download', { revisionId: rid }))
    expect(downloaded.headers.get('Content-Type')).toBe('application/pdf')
    const bytes = new Uint8Array(await downloaded.arrayBuffer())
    expect(bytes.length).toBe(revision.pdf_size)
    expect(bytes).toEqual(f.state.stored.get(revision.pdf_object_path))
    expect((await handler(request('send', { revisionId: rid, attempt: 1 }))).status).toBe(200)
    expect(f.send.mock.calls[0][0].pdf).toEqual(bytes)
    expect(f.send.mock.calls[0][0].customerName).toBe('Cliente sintético')
    expect(f.send.mock.calls[0][0].recipient).toBe('qa@invalid.test')
    expect(f.state.events.map((e) => e.status)).toEqual(['queued', 'sent'])
    expect((await handler(request('send', { revisionId: rid, attempt: 2 }))).status).toBe(200)
    expect(f.send).toHaveBeenCalledOnce()
  })
  it.each([
    ['revision number', (r: any) => ({ ...r, revision: r.revision + 1 })],
    ['PDF byte count', (r: any) => ({ ...r, pdf_size: r.pdf_size + 1 })],
    ['workshop identity', (r: any) => ({ ...r, workshop_id: id(91) })],
    ['frozen quote version', (r: any) => ({
      ...r, payload: { ...r.payload, quote: { ...r.payload.quote, version: 999 } }
    })]
  ])('does not report an issued revision if final server receipt changes %s', async (_name, alter) => {
    const f = setup()
    const original = f.rpc.getMockImplementation()!
    f.rpc.mockImplementation(async (name, args) => {
      const response = await original(name, args)
      return name === 'bt_cp05_finish_issue'
        ? { ...response, data: alter(response.data) }
        : response
    })
    const result = await documentHandlerCandidate(policy, f.deps)(request('issue'))
    expect(result.status).toBe(409)
    expect((await result.json()).error).toBe('OPERATION_NOT_CONFIRMED')
    expect(f.send).not.toHaveBeenCalled()
  })
  it('recovers a pending reservation with a new browser request ID, finalizing the original ID', async () => {
    const f = setup(),
      handler = documentHandlerCandidate(policy, f.deps)
    f.state.downloadFails = true
    expect((await handler(request('issue'))).status).toBe(409)
    expect(f.state.revision).toBeNull()
    expect(f.state.pending).toBe(true)
    f.state.downloadFails = false
    expect((await handler(request('issue', { requestId: id(99) }))).status).toBe(200)
    expect(f.state.lastFinishRequest).toBe(requestId)
    expect(f.state.stored.size).toBe(1)
  })
  it('recovers a completed issuance from original archived bytes without rendering again',async()=>{
    const f=setup(),handler=documentHandlerCandidate({...policy,emailApproved:false},f.deps)
    expect((await handler(request('issue'))).status).toBe(200)
    const original=structuredClone(f.state.revision),before=Buffer.from(await f.state.stored.values().next().value!)
    f.deps.assets.mockRejectedValueOnce(Error('Renderer upgraded or asset unavailable'))
    // No current assets are needed to confirm the completed revision.
    const response=await handler(request('issue'))
    expect(response.status).toBe(200)
    expect((await response.json()).revision).toEqual(original)
    expect(f.state.stored.size).toBe(1)
    expect(Buffer.from(f.state.stored.values().next().value!)).toEqual(before)
    f.state.downloadFails=true
    expect((await handler(request('issue'))).status).toBe(409)
    expect(f.send).not.toHaveBeenCalled()
  })
  it('refuses unreviewed or stale-contact sending without queue or provider', async () => {
    const f = setup(), handler = documentHandlerCandidate(policy, f.deps)
    await handler(request('issue'))
    for(const review of [
      null,
      { reviewedRevisionId: rid, confirmedRecipient: 'wrong@invalid.test', recipientChecked: true, documentChecked: true, contactAuthorized: true },
      { reviewedRevisionId: rid, confirmedRecipient: 'qa@invalid.test', recipientChecked: true, documentChecked: false, contactAuthorized: true }
    ]) expect((await handler(request('send',{revisionId:rid,attempt:1,review}))).status).toBe(409)
    expect(f.state.events).toHaveLength(0)
    expect(f.send).not.toHaveBeenCalled()
    f.state.customerEmail='changed@invalid.test'
    expect((await handler(request('send',{revisionId:rid,attempt:1}))).status).toBe(409)
    expect(f.state.events).toHaveLength(0)
    expect(f.send).not.toHaveBeenCalled()
  })
  it('does not report sent for missing attachment or ambiguous ack; blocks blind queued retry', async () => {
    const f = setup(),
      handler = documentHandlerCandidate(policy, f.deps)
    await handler(request('issue'))
    f.state.downloadFails = true
    expect((await handler(request('send', { revisionId: rid, attempt: 1 }))).status).toBe(409)
    expect(f.state.events).toHaveLength(0)
    expect(f.send).not.toHaveBeenCalled()
    f.state.downloadFails = false
    f.state.sendMode = 'unknown'
    expect((await handler(request('send', { revisionId: rid, attempt: 1 }))).status).toBe(409)
    expect(f.state.events.map((e) => e.status)).toEqual(['queued'])
    expect((await handler(request('send', { revisionId: rid, attempt: 2 }))).status).toBe(409)
    expect(f.send).toHaveBeenCalledOnce()
  })
  it('records definitive rejection before a controlled retry', async () => {
    const f = setup(),
      handler = documentHandlerCandidate(policy, f.deps)
    await handler(request('issue'))
    f.state.sendMode = 'failed'
    expect(
      (await (await handler(request('send', { revisionId: rid, attempt: 1 }))).json()).delivery
    ).toBe('failed')
    f.state.sendMode = 'success'
    await handler(request('send', { revisionId: rid, attempt: 2 }))
    expect(f.state.events.map((e) => e.status)).toEqual(['queued', 'failed', 'queued', 'sent'])
  })
})
describe('Unactivated provider and browser transport gates', () => {
  it('provider OFF never calls fetch', async () => {
    const network = vi.fn()
    await expect(
      resendProviderCandidate({ approved: false, from: '', apiKey: '' }, network).send({
        pdf
      } as Mail)
    ).rejects.toThrow('EMAIL_DISABLED')
    expect(network).not.toHaveBeenCalled()
  })
  it('provider requires concrete ID, sends a base64 PDF and stable idempotency header', async () => {
    const network = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) =>
      Response.json({ id: 'SYNTHETIC_ACK' })
    )
    const result = await resendProviderCandidate(
      { approved: true, from: 'qa@invalid.test', apiKey: 'synthetic-only' },
      network
    ).send({
      pdf,
      recipient: 'qa@invalid.test',
      subject: 'QA',
      text: 'Cliente QA',
      filename: 'qa.pdf',
      idempotencyKey: 'stable'
    } as Mail)
    expect(result).toEqual({ confirmed: true, providerId: 'SYNTHETIC_ACK' })
    const init = network.mock.calls[0][1] as RequestInit
    expect(JSON.parse(String(init.body)).attachments[0].content).toBe(
      Buffer.from(pdf).toString('base64')
    )
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe('stable')
  })
  it('frontend gates block before auth or function invocation and disposal invalidates access', async () => {
    const f = setup(),
      d = documentClient(
        f.userClient,
        { userId: uid, workshop: { id: wid, name: 'QA', status: 'active' }, role: 'owner' },
        { archive: false, email: false }
      )
    await expect(d.issue({ id: qid, version: 1 } as any, requestId)).rejects.toMatchObject({
      kind: 'blocked'
    })
    expect(f.userClient.auth.getUser).not.toHaveBeenCalled()
    d.dispose()
    await expect(d.issue({ id: qid, version: 1 } as any, requestId)).rejects.toMatchObject({
      kind: 'denied'
    })
  })
})
describe('Download integrity and provider acknowledgement boundaries', () => {
  it('browser transport accepts only identical archived bytes and rejects altered hash', async () => {
    const f = setup(),
      invoke = vi.fn(async (_name: string, _args?: unknown) => ({
        data: new Blob([pdf.slice().buffer], { type: 'application/pdf' }),
        error: null
      }))
    const client = Object.assign({}, f.userClient, {
      functions: { invoke }
    }) as unknown as SupabaseClient
    const documents = documentClient(
      client,
      { userId: uid, workshop: { id: wid, name: 'QA', status: 'active' }, role: 'mechanic' },
      { archive: true, email: false }
    )
    const hash = Buffer.from(await crypto.subtle.digest('SHA-256', pdf.slice().buffer)).toString(
      'hex'
    )
    const revision = { id: rid, workshop_id: wid, pdf_sha256: hash, pdf_size: pdf.length } as any
    expect(await documents.download(revision)).toEqual(pdf)
    await expect(
      documents.download({ ...revision, pdf_sha256: 'f'.repeat(64) })
    ).rejects.toMatchObject({ kind: 'unavailable' })
    expect(invoke.mock.calls[0][0]).toBe('bt-cp05-documents')
  })
  it('ambiguous response asks reconciliation, not a blind retry', async () => {
    const f = setup(),
      client = Object.assign({}, f.userClient, {
        functions: {
          invoke: vi.fn(async () => ({
            data: null,
            error: { context: Response.json({ error: 'DELIVERY_PENDING' }, { status: 409 }) }
          }))
        }
      }) as unknown as SupabaseClient
    const documents = documentClient(
      client,
      { userId: uid, workshop: { id: wid, name: 'QA', status: 'active' }, role: 'owner' },
      { archive: true, email: true }
    )
    await expect(documents.send({
      id: rid, workshop_id: wid, payload: { customer: { email: 'qa@invalid.test' } }
    } as any, 1, {
      reviewedRevisionId: rid, confirmedRecipient: 'qa@invalid.test',
      recipientChecked: true, documentChecked: true, contactAuthorized: true
    })).rejects.toMatchObject({
      kind: 'delivery_pending'
    })
  })
  it('missing provider ID and 5xx never claim success; 4xx can be recorded as rejection', async () => {
    const mail = {
      pdf,
      recipient: 'qa@invalid.test',
      subject: 'QA',
      text: 'QA',
      filename: 'qa.pdf',
      idempotencyKey: 'stable'
    } as Mail
    for (const status of [200, 500, 429]) {
      const provider = resendProviderCandidate(
        { approved: true, from: 'qa@invalid.test', apiKey: 'synthetic' },
        vi.fn(async () => Response.json({}, { status }))
      )
      expect(await provider.send(mail)).toEqual({ confirmed: false })
    }
    const rejected = resendProviderCandidate(
      { approved: true, from: 'qa@invalid.test', apiKey: 'synthetic' },
      vi.fn(async () => Response.json({}, { status: 400 }))
    )
    expect(await rejected.send(mail)).toMatchObject({ confirmed: false, definitiveFailure: true })
  })
})
describe('Last outbound authorization check', () => {
  it('revocation after queueing still prevents the provider call', async () => {
    const f = setup(),
      handler = documentHandlerCandidate(policy, f.deps)
    await handler(request('issue'))
    const original = f.rpc.getMockImplementation()!
    f.rpc.mockImplementation(async (name, args) => {
      const result = await original(name, args)
      if (name === 'bt_cp05_record_delivery' && args.p_status === 'queued') f.state.active = false
      return result
    })
    expect((await handler(request('send', { revisionId: rid, attempt: 1 }))).status).toBe(403)
    expect(f.send).not.toHaveBeenCalled()
    expect(f.state.events.map((e) => e.status)).toEqual(['queued'])
  })
})
describe('Revision-specific transactional sending', () => {
  it('refuses voided or superseded revisions without queueing or provider calls', async () => {
    const f = setup(),
      handler = documentHandlerCandidate(policy, f.deps)
    await handler(request('issue'))
    f.state.quoteStatus = 'voided'
    expect((await handler(request('send', { revisionId: rid, attempt: 1 }))).status).toBe(409)
    f.state.quoteStatus = 'issued'
    f.state.latestRevision = 2
    expect((await handler(request('send', { revisionId: rid, attempt: 1 }))).status).toBe(409)
    expect(f.state.events).toHaveLength(0)
    expect(f.send).not.toHaveBeenCalled()
  })
})
describe('Cancellation recovery metadata', () => {
  it('allows a new issuance ID after cancelling without depending on a stale cancelled request', async () => {
    const store = new Map<string, string>()
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => store.get(k) || null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k)
    })
    try {
      const f = setup(),
        context = {
          userId: uid,
          workshop: { id: wid, name: 'QA', status: 'active' },
          role: 'owner' as const
        },
        quote = { id: qid, version: 1 } as any
      const before = documentOperation(context, quote)
      const client = Object.assign({}, f.userClient, {
        functions: { invoke: vi.fn(async () => ({ data: { cancelled: true }, error: null })) }
      }) as unknown as SupabaseClient
      await documentClient(client, context, { archive: true, email: false }).cancel(quote, before)
      expect(documentOperation(context, quote)).not.toBe(before)
    } finally {
      vi.unstubAllGlobals()
    }
  })
  it('conserva el identificador de cancelación si el servidor no confirma', async () => {
    const store = new Map<string, string>()
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => store.get(k) || null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k)
    })
    try {
      const f = setup(),
        context = {
          userId: uid,
          workshop: { id: wid, name: 'QA', status: 'active' },
          role: 'owner' as const
        },
        quote = { id: qid, version: 1 } as any,
        before = documentOperation(context, quote),
        invoke = vi.fn(async () => ({
          data: null,
          error: { context: new Response(null, { status: 503 }) }
        })),
        client = Object.assign({}, f.userClient, { functions: { invoke } }) as unknown as SupabaseClient
      await expect(
        documentClient(client, context, { archive: true, email: false }).cancel(quote, before)
      ).rejects.toMatchObject({ kind: 'blocked' })
      expect(invoke).toHaveBeenCalledOnce()
      expect(documentOperation(context, quote)).toBe(before)
    } finally {
      vi.unstubAllGlobals()
    }
  })

})
