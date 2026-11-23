import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import vm from 'node:vm'

// Built-in Node adapter: no Supabase, sockets, credentials or real users.
// This exercises handler logic, not the Deno runtime or deployed gateway.
const source = readFileSync(new URL('../../src/auth/controller.ts', import.meta.url), 'utf8')
const js = stripTypeScriptTypes(source, { mode: 'transform', sourceMap: false })
const { AuthController } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'))
function fixture(role = 'owner') {
  const gateway = {
    hasSession: async () => true, getUser: async () => ({ id: 'synthetic-user', confirmed: true }),
    signIn: async () => {}, signOut: async () => {}, subscribe: () => () => {},
    memberships: async () => [{ user_id: 'synthetic-user', workshop_id: 'a', role, status: 'active' }],
    workshops: async () => [{ id: 'a', name: 'Synthetic A', status: 'active' }],
    getDataClient: async () => ({ synthetic: true })
  }
  return { gateway, controller: new AuthController(gateway) }
}
function deferredClient(gateway) {
  let release
  gateway.getDataClient = () => new Promise(resolve => { release = resolve })
  return () => release({ synthetic: true })
}
for (const role of ['owner', 'admin', 'mechanic', 'reception']) {
  test(`directory preserves verified ${role} access`, async () => {
    const { controller } = fixture(role); await controller.validate()
    assert.deepEqual(await controller.directoryClient(), { synthetic: true })
  })
}
for (const action of ['logout', 'failed logout', 'same-user login', 'membership revoked', 'workshop changed']) {
  test(`directory discards pending client after ${action}`, async () => {
    const { controller, gateway } = fixture(); await controller.validate()
    const release = deferredClient(gateway), pending = controller.directoryClient()
    if (action === 'failed logout') gateway.signOut = async () => { throw Error('synthetic failure') }
    if (action.includes('logout') || action === 'same-user login') await controller.logout()
    if (action === 'same-user login') await controller.login('synthetic@invalid.test', 'synthetic')
    if (action === 'membership revoked') { gateway.memberships = async () => []; await controller.validate() }
    if (action === 'workshop changed') {
      gateway.memberships = async () => [{ user_id: 'synthetic-user', workshop_id: 'b', role: 'owner', status: 'active' }]
      gateway.workshops = async () => [{ id: 'b', name: 'Synthetic B', status: 'active' }]
      await controller.choose('b')
    }
    release(); assert.equal(await pending, null)
  })
}
test('directory keeps pending client after unchanged routine validation', async () => {
  const { controller, gateway } = fixture(); await controller.validate()
  const release = deferredClient(gateway), pending = controller.directoryClient()
  await controller.validate(); release(); assert.deepEqual(await pending, { synthetic: true })
})
test('directory rejects unavailable client without leaking exception', async () => {
  const { controller, gateway } = fixture(); await controller.validate()
  gateway.getDataClient = async () => { throw Error('synthetic private error') }
  assert.equal(await controller.directoryClient(), null)
})
test('directory denies unverified and missing membership state', async () => {
  const { controller, gateway } = fixture()
  assert.equal(await controller.directoryClient(), null)
  gateway.memberships = async () => []; await controller.validate()
  assert.equal(await controller.directoryClient(), null)
})
function edge(enabled = false, userStatus = 401) {
  let handler, requests = 0
  const code = readFileSync(new URL('../../supabase/functions/bt-owner-onboarding/index.ts', import.meta.url), 'utf8')
  const sandbox = { Request, Response, Set, JSON, Deno: {
    serve(fn) { handler = fn }, env: { get(name) {
      return ({ BYTETORQUE_ONBOARDING_ENABLED: enabled ? 'true' : 'false',
        SUPABASE_URL: 'https://synthetic.invalid', SUPABASE_ANON_KEY: 'synthetic-public', SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service' })[name]
    } }
  }, fetch: async () => { requests++; return new Response('{}', { status: userStatus }) } }
  vm.runInNewContext(stripTypeScriptTypes(code, { mode: 'strip' }), sandbox)
  return { request: (method, origin, headers = {}, body) => handler(new Request('https://synthetic.invalid', {
    method, headers: { ...(origin === null ? {} : { origin }), ...headers }, body
  })), requests: () => requests }
}
for (const origin of ['https://bytetorque.cl', 'https://www.bytetorque.cl', 'https://biomotors-taller-demo.onrender.com', 'http://localhost:5173']) {
  test(`CORS allows exact legitimate origin ${origin}`, async () => {
    const e = edge(), response = await e.request('OPTIONS', origin)
    assert.equal(response.status, 204); assert.equal(response.headers.get('access-control-allow-origin'), origin)
    assert.equal(response.headers.get('vary'), 'Origin'); assert.equal(e.requests(), 0)
  })
}
for (const origin of ['https://bytetorque.cl.evil.invalid', 'https://evil.invalid', 'http://bytetorque.cl', 'null']) {
  test(`CORS rejects untrusted origin ${origin}`, async () => {
    const e = edge(true), response = await e.request('OPTIONS', origin)
    assert.equal(response.status, 403); assert.equal(response.headers.get('access-control-allow-origin'), null)
    assert.equal(e.requests(), 0)
  })
}
test('canonical POST remains disabled by default', async () => {
  const e = edge(); assert.equal((await e.request('POST', 'https://bytetorque.cl')).status, 503)
  assert.equal(e.requests(), 0)
})
test('canonical POST with enabled flag still requires bearer', async () => {
  const e = edge(true); assert.equal((await e.request('POST', 'https://bytetorque.cl')).status, 401)
  assert.equal(e.requests(), 0)
})
test('canonical POST rejects Auth-denied synthetic bearer before privileged RPC', async () => {
  const e = edge(true), response = await e.request('POST', 'https://bytetorque.cl', {
    authorization: 'Bearer synthetic.invalid.token', 'content-type': 'application/json'
  }, JSON.stringify({ workshop_name: 'Synthetic workshop', display_name: 'Synthetic owner' }))
  assert.equal(response.status, 401); assert.equal(e.requests(), 1)
})
test('canonical GET remains method-restricted', async () => {
  const e = edge(true); assert.equal((await e.request('GET', 'https://bytetorque.cl')).status, 405)
  assert.equal(e.requests(), 0)
})
