// Private browser fixture. Every Supabase request is intercepted; no real Auth/RLS/data writes.
const assert = require('node:assert/strict')
const api = 'https://suxcqqnmcjoezfxltoms.supabase.co'
const userId = '00000000-0000-4000-8000-000000000001',
  tenant = '00000000-0000-4000-8000-000000000011'
const uuid = (n) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0')
const user = {
  id: userId,
  aud: 'authenticated',
  email: 'cp04-browser@invalid.test',
  email_confirmed_at: '2026-11-15T10:00:00Z',
  created_at: '2026-11-15T10:00:00Z',
  user_metadata: {}
}
const token = () =>
  Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url') +
  '.' +
  Buffer.from(
    JSON.stringify({
      sub: userId,
      aud: 'authenticated',
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600
    })
  ).toString('base64url') +
  '.synthetic'
async function cp04Page(browser, width, options = {}) {
  const p = await browser.newPage({ viewport: { width, height: 950 }, reducedMotion: 'reduce' })
  const states = ['received', 'inspecting', 'in_service', 'ready', 'closed']
  const vehicles = states.map((_, i) => ({
    id: uuid(100 + i),
    workshop_id: tenant,
    customer_id: uuid(50),
    plate: 'QA' + (1234 + i),
    plate_key: 'QA' + (1234 + i),
    make: ['Toyota', 'Chevrolet', 'Hyundai', 'Suzuki', 'Kia'][i],
    model: ['RAV4', 'Onix', 'Tucson', 'Swift', 'Rio'][i],
    odometer_km: 78520 + i * 1000,
    archived_at: null
  }))
  const state = {
    role: 'owner',
    revoked: false,
    failList: false,
    slowList: false,
    failFindings: false,
    slowFindings: false,
    injectFault: null,
    failVehiclesRead: false,
    failOrderDetail: false,
    failFindingReads: false,
    customers: [],
    orders: states.map((status, i) => ({
      id: uuid(200 + i),
      workshop_id: tenant,
      vehicle_id: vehicles[i].id,
      complaint: [
        'Ruido en suspensión delantera',
        'Revisión de frenos',
        'Servicio de mantenimiento',
        'Revisión general',
        'Servicio finalizado'
      ][i],
      status,
      intake_odometer: i === 4 ? null : vehicles[i].odometer_km,
      opened_by: userId,
      opened_at: `2026-11-15T${14 - i}:30:00Z`,
      closed_at: status === 'closed' ? '2026-11-15T20:00:00Z' : null,
      updated_at: '2026-11-15T15:00:00Z'
    })),
    findings: [],
    vehicles,
    ...options
  }
  const requests = [],
    errors = []
  let serial = 500,
    tick = 0
  const timestamp = () => new Date(Date.UTC(2026, 10, 16, 1, 0, ++tick)).toISOString()
  p.on('pageerror', (e) => errors.push(e.message))
  await p.route(api + '/**', async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      method = request.method()
    requests.push({ path: url.pathname, method })
    const reply = (data, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    if (url.pathname === '/auth/v1/token')
      return reply({
        access_token: token(),
        refresh_token: 'cp04-synthetic-refresh',
        token_type: 'bearer',
        expires_in: 3600,
        user
      })
    if (url.pathname === '/auth/v1/user') return reply(user)
    if (url.pathname === '/auth/v1/logout') return reply({})
    if (url.pathname === '/rest/v1/profiles') {
      assert.equal(method, 'GET')
      assert.equal(url.searchParams.get('user_id'), 'eq.' + userId)
      return reply({ display_name: 'Operador QA' })
    }
    if (url.pathname === '/rest/v1/workshop_memberships')
      return reply(
        state.revoked
          ? []
          : [{ workshop_id: tenant, user_id: userId, role: state.role, status: 'active' }]
      )
    if (url.pathname === '/rest/v1/workshops')
      return reply([{ id: tenant, name: 'Taller QA · HTTP simulado', status: 'active' }])
    const table = url.pathname.split('/').pop()
    assert.ok(
      ['vehicles', 'work_orders', 'inspection_findings', 'customers'].includes(table),
      'Unexpected endpoint ' + table
    )
    assert.equal(
      url.searchParams.get('workshop_id') ||
        (method === 'POST' ? `eq.${request.postDataJSON().workshop_id}` : null),
      'eq.' + tenant
    )
    const fail = method === 'GET' && (
      (table === 'work_orders' && (url.searchParams.has('id') ? state.failOrderDetail : state.failList)) ||
      (table === 'vehicles' && state.failVehiclesRead) ||
      (table === 'inspection_findings' && state.failFindingReads)
    )
    if (fail) return reply({ code: 'NETWORK_QA', message: 'Synthetic unavailable' }, 503)
    if (method === 'POST' && table === 'work_orders' && state.injectFault === 'F06')
      return reply({ code: 'NETWORK_QA', message: 'Synthetic write rejected' }, 503)
    if (table === 'work_orders' && state.slowList) await new Promise((r) => setTimeout(r, 450))
    if (table === 'inspection_findings' && method !== 'GET') {
      if (state.slowFindings) await new Promise((r) => setTimeout(r, 350))
      if (state.failFindings)
        return reply({ code: 'NETWORK_QA', message: 'Synthetic save unavailable' }, 503)
    }
    const rows =
      table === 'vehicles'
        ? state.vehicles
        : table === 'work_orders'
          ? state.orders
          : table === 'inspection_findings'
            ? state.findings
            : state.customers
    function filtered() {
      return rows.filter((row) =>
        [...url.searchParams].every(([key, value]) => {
          if (['select', 'limit', 'order', 'offset'].includes(key)) return true
          if (value.startsWith('eq.')) return String(row[key]) === value.slice(3)
          if (value.startsWith('ilike.'))
            return String(row[key] || '').toLowerCase().includes(value.slice(6).replace(/%/g, '').toLowerCase())
          if (value.startsWith('neq.')) return String(row[key]) !== value.slice(4)
          if (value === 'is.null') return row[key] == null
          if (value.startsWith('in.('))
            return value.slice(4, -1).split(',').includes(String(row[key]))
          return true
        })
      )
    }
    let result = filtered()
    if (method === 'POST') {
      const input = request.postDataJSON(),
        now = timestamp()
      const row = {
        ...input,
        id: uuid(++serial),
        updated_at: now,
        created_at: now,
        archived_at: null,
        ...(table === 'vehicles' ? { plate_key: String(input.plate || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() } : {}),
        ...(table === 'work_orders'
          ? { opened_by: userId, opened_at: now, closed_at: null, status: 'received' }
          : { recorded_by: userId, created_at: now, resolved_at: null })
      }
      rows.push(row)
      result = [row]
      if (table === 'customers' && state.injectFault === 'F01') state.failVehiclesRead = true
      if (table === 'vehicles' && state.injectFault === 'F02') state.failVehiclesRead = true
      if (table === 'work_orders' && state.injectFault === 'F03') {
        state.failList = true
        state.failOrderDetail = true
      }
      if (table === 'inspection_findings' && state.injectFault === 'F04') state.failFindingReads = true
    } else if (method === 'PATCH') {
      const input = request.postDataJSON()
      for (const row of result) Object.assign(row, input, { updated_at: timestamp() })
      if (table === 'inspection_findings' && state.injectFault === 'F05') state.failFindingReads = true
    } else assert.equal(method, 'GET', 'No deletes allowed')
    const accept = request.headers().accept || ''
    // PostgREST .single() object header; maybeSingle() can also request JSON arrays.
    return reply(
      accept.includes('vnd.pgrst.object')
        ? result[0] || null
        : result.slice(0, Number(url.searchParams.get('limit') || 1000))
    )
  })
  await p.goto((process.env.CP04_BASE_URL || 'http://127.0.0.1:5179') + '/#/auth-r1-qa')
  await p.getByLabel('Correo electrónico', { exact: true }).fill('cp04-browser@invalid.test')
  await p.getByLabel('Contraseña', { exact: true }).fill('synthetic-password-only')
  await p.getByRole('button', { name: 'Ingresar', exact: true }).click()
  await p.locator('.dashboard-main').waitFor()
  await p
    .locator(width > 760 ? '.side-nav button' : '.bottom-nav button')
    .nth(1)
    .click()
  await p.locator('.cp04-private').waitFor()
  return { p, state, requests, errors }
}
module.exports = { cp04Page, uuid, tenant, userId }
