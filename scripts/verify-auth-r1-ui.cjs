// Real SDK + intercepted synthetic HTTP on private loopback harness. NOT real Auth/RLS E2E.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const out = process.env.OUTPUT_DIR || 'artifacts/bt-auth-01b-r1'
const harness = process.env.AUTH_R1_BASE_URL || 'http://127.0.0.1:5177'
const publicUrl = process.env.PUBLIC_URL || 'http://127.0.0.1:5173'
const api = 'https://suxcqqnmcjoezfxltoms.supabase.co'
const userId = '00000000-0000-4000-8000-000000000001'
const a = '00000000-0000-4000-8000-000000000011'
const b = '00000000-0000-4000-8000-000000000012'
const jwt = () =>
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
  '.synthetic-signature'
const user = {
  id: userId,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'browser-stub@invalid.test',
  email_confirmed_at: '2026-11-14T00:00:00Z',
  created_at: '2026-11-14T00:00:00Z',
  user_metadata: { role: 'owner' }
}
async function stubPage(browser, width, options = {}) {
  const p = await browser.newPage({ viewport: { width, height: 941 } })
  const state = {
    role: 'owner',
    member: 'active',
    confirmed: true,
    multiple: false,
    invalid: false,
    outage: false,
    revoked: false,
    holdUser: false,
    ...options
  }
  const requests = [],
    errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  // Route intercepts all requests to Supabase before a single byte can reach it.
  await p.route(api + '/**', async (route) => {
    const req = route.request(),
      url = new URL(req.url())
    requests.push({ path: url.pathname + url.search, method: req.method() })
    if (state.outage) return route.abort('internetdisconnected')
    const reply = (body, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.pathname === '/auth/v1/token') {
      if (state.holdLogin)
        await new Promise((resolve) => {
          state.finishLogin = resolve
        })
      if (state.invalid)
        return reply({ code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400)
      return reply({
        access_token: jwt(),
        refresh_token: 'synthetic-refresh-token',
        token_type: 'bearer',
        expires_in: 3600,
        user: { ...user, email_confirmed_at: state.confirmed ? user.email_confirmed_at : null }
      })
    }
    if (url.pathname === '/auth/v1/user') {
      if (state.holdUser) await new Promise((r) => setTimeout(r, 150))
      return reply({
        ...user,
        email_confirmed_at: state.confirmed ? user.email_confirmed_at : null
      })
    }
    if (url.pathname === '/auth/v1/logout') return reply({})
    if (url.pathname === '/rest/v1/profiles') {
      assert.equal(req.method(), 'GET')
      assert.equal(url.searchParams.get('user_id'), 'eq.' + userId)
      return reply({ display_name: 'Operador QA' })
    }
    if (url.pathname === '/rest/v1/workshop_memberships') {
      assert.equal(req.method(), 'GET')
      assert.equal(url.searchParams.get('user_id'), 'eq.' + userId)
      assert.equal(url.searchParams.get('status'), 'eq.active')
      return reply(
        state.revoked
          ? []
          : [
              { user_id: userId, workshop_id: a, role: state.role, status: state.member },
              ...(state.multiple
                ? [{ user_id: userId, workshop_id: b, role: 'mechanic', status: 'active' }]
                : [])
            ]
      )
    }
    if (url.pathname === '/rest/v1/workshops')
      return reply([
        { id: a, name: 'Taller autorizado A · MOCK', status: 'active' },
        ...(state.multiple ? [{ id: b, name: 'Taller autorizado B · MOCK', status: 'active' }] : [])
      ])
    throw new Error('Unexpected endpoint: ' + url.pathname)
  })
  await p.goto(harness + '/#' + (process.env.AUTH_R1_ENTRY_PATH || '/auth-r1-qa'))
  await p.getByLabel('Correo electrónico', { exact: true }).waitFor()
  await p.waitForFunction(() => !document.querySelector('input[name=email]')?.disabled)
  return { p, state, requests, errors }
}
async function login(p) {
  await p.getByLabel('Correo electrónico', { exact: true }).fill('browser-stub@invalid.test')
  await p.getByLabel('Contraseña', { exact: true }).fill('synthetic-not-real-password')
  await p.getByRole('button', { name: 'Ingresar', exact: true }).click()
}
async function fits(p) {
  assert.ok(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    'No horizontal overflow'
  )
}
async function shot(p, name) {
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: true })
}
;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch({
    executablePath: fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
    args: ['--no-sandbox']
  })
  const results = []
  try {
    for (const width of [1650, 1440, 768, 390, 375]) {
      const { p, state, requests, errors } = await stubPage(browser, width)
      await fits(p)
      await shot(p, `login-enabled-mock-${width}`)
      await login(p)
      await p.locator('.dashboard-main').waitFor()
      assert.match(await p.locator('.account-trigger').innerText(), /Operador QA/)
      assert.match(
        await p.locator('.sidebar-workshop, .sidebar').innerText(),
        /Taller autorizado A/
      )
      await fits(p)
      await shot(p, `owner-mock-${width}`)
      const nav = p.locator(width > 760 ? '.side-nav button' : '.bottom-nav button')
      assert.equal(await nav.count(), 5)
      for (let panel = 0; panel < 5; panel++) {
        await nav.nth(panel).click()
        await p.locator('.official-panel').waitFor()
        assert.equal(
          await p
            .locator(
              '.official-panel input:enabled,.official-panel textarea:enabled,.official-panel select:enabled'
            )
            .count(),
          0
        )
        assert.doesNotMatch(
          await p.locator('body').innerText(),
          /OT-1001|Camila Muñoz|Vista de revisión — sin autenticación real/
        )
        await fits(p)
        if ([1650, 390].includes(width)) await shot(p, `owner-panel-${panel + 1}-mock-${width}`)
      }
      await p.reload()
      await p.locator('.dashboard-main').waitFor()
      // Invalid workshop IDs in URL do not select or authorize another workshop.
      await p.goto(harness + '/#/acceso?workshop_id=' + b)
      await p.locator('.dashboard-main').waitFor()
      assert.doesNotMatch(await p.locator('body').innerText(), /Taller autorizado B/)
      // DEMO remains read-only even with an authenticated SDK session.
      await p.goto(harness + '/#/revision/administrador')
      await p.getByText('DEMO · Sin autenticación ni permisos reales').waitFor()
      assert.doesNotMatch(
        await p.locator('body').innerText(),
        /Taller autorizado A|Sesión y membresía verificadas/
      )
      await p.goto(harness + '/#/acceso')
      await p.locator('.dashboard-main').waitFor()
      state.revoked = true
      await p.evaluate(() => window.dispatchEvent(new Event('focus')))
      await p.getByText('Cuenta personal verificada.', { exact: false }).waitFor()
      assert.equal(await p.locator('.dashboard-main').count(), 0)
      await shot(p, `revoked-mock-${width}`)
      await p.getByRole('button', { name: 'Cerrar sesión', exact: true }).click()
      await p.getByRole('button', { name: 'Ingresar', exact: true }).waitFor()
      assert.equal(
        await p.evaluate(
          () => Object.keys(localStorage).filter((k) => k.includes('auth-token')).length
        ),
        0
      )
      assert.equal(errors.length, 0, errors.join('\n'))
      assert.ok(
        requests.every(
          (r) =>
            r.method === 'GET' ||
            r.path.startsWith('/auth/v1/token') ||
            r.path.startsWith('/auth/v1/logout')
        )
      )
      results.push({
        width,
        sdkMock: 'PASS',
        tests:
          'login, RLS query shape, five empty panels, restore, URL denial, DEMO separation, revoke, logout'
      })
      await p.close()
    }
    for (const scenario of [
      'invalid',
      'no-member',
      'disabled',
      'unconfirmed',
      'mechanic',
      'reception',
      'multiple',
      'offline',
      'pending-navigation'
    ]) {
      const options =
        scenario === 'pending-navigation'
          ? { holdLogin: true }
          : scenario === 'invalid'
            ? { invalid: true }
            : scenario === 'disabled'
              ? { member: 'disabled' }
              : scenario === 'no-member'
                ? { revoked: true }
                : scenario === 'unconfirmed'
                  ? { confirmed: false }
                  : scenario === 'multiple'
                    ? { multiple: true }
                    : scenario === 'mechanic' || scenario === 'reception'
                      ? { role: scenario }
                      : {}
      const { p, state, errors } = await stubPage(browser, 390, options)
      await login(p)
      if (scenario === 'pending-navigation') {
        await p
          .getByRole('button', { name: 'Abrir vista de revisión de administrador', exact: true })
          .click()
        await p.getByText('DEMO · Sin autenticación ni permisos reales').waitFor()
        await p.getByRole('button', { name: 'Volver al acceso', exact: true }).click()
        await p.getByText('Verificando sesión y autorización…', { exact: true }).waitFor()
        assert.equal(typeof state.finishLogin, 'function')
        state.finishLogin()
        await p.getByText('Sesión y membresía verificadas', { exact: true }).waitFor()
        await p.locator('.dashboard-main').waitFor()
      } else if (scenario === 'invalid') {
        await p.getByText('No se pudo iniciar sesión.', { exact: false }).waitFor()
        assert.equal(await p.locator('input[name=password]').inputValue(), '')
      } else if (['no-member', 'disabled'].includes(scenario))
        await p.getByText('Cuenta personal verificada.', { exact: false }).waitFor()
      else if (scenario === 'unconfirmed')
        await p.getByText('Se requiere correo confirmado.', { exact: false }).waitFor()
      else if (scenario === 'mechanic') {
        await p.getByRole('heading', { name: 'Tu espacio de trabajo técnico' }).waitFor()
        assert.doesNotMatch(await p.locator('body').innerText(), /Configuración|Cotizaciones|IVA/)
      } else if (scenario === 'reception')
        await p.getByText('Acceso restringido.', { exact: false }).waitFor()
      else if (scenario === 'multiple') {
        await p.getByRole('button', { name: /Taller autorizado B/ }).click()
        await p.getByRole('heading', { name: 'Tu espacio de trabajo técnico' }).waitFor()
      } else if (scenario === 'offline') {
        await p.locator('.dashboard-main').waitFor()
        await p.context().setOffline(true)
        await p.getByText('Sin conexión.', { exact: false }).waitFor()
        assert.equal(await p.locator('.dashboard-main').count(), 0)
        await p.context().setOffline(false)
        await p.locator('.dashboard-main').waitFor()
        state.revoked = true
      }
      if (scenario !== 'offline') await fits(p)
      await shot(p, `negative-${scenario}-390`)
      if (!['mechanic', 'multiple', 'offline', 'pending-navigation'].includes(scenario))
        assert.equal(await p.locator('.dashboard-main').count(), 0)
      assert.equal(errors.length, 0, errors.join('\n'))
      results.push({ scenario, sdkMock: 'PASS' })
      await p.close()
    }
    // Default-off public build: zero external Auth/API traffic and no persistence.
    for (const width of [1650, 1440, 768, 390, 375]) {
      const p = await browser.newPage({ viewport: { width, height: 941 } }),
        external = []
      await p.route('**/*', (route) => {
        if (new URL(route.request().url()).origin !== new URL(publicUrl).origin) {
          external.push(route.request().url())
          return route.abort()
        }
        return route.continue()
      })
      await p.goto(publicUrl)
      await p.getByRole('heading', { name: 'Inicia sesión' }).waitFor()
      assert.ok(await p.getByLabel('Correo electrónico', { exact: true }).isDisabled())
      await shot(p, `public-off-${width}`)
      await fits(p)
      assert.equal(await p.evaluate(() => localStorage.length + sessionStorage.length), 0)
      assert.deepEqual(external, [])
      results.push({ width, publicFlagOff: 'PASS', externalRequests: 0, storage: 0 })
      await p.close()
    }
    fs.writeFileSync(
      `${out}/results.json`,
      JSON.stringify(
        { kind: 'SDK HTTP MOCKS — not real Auth/RLS E2E', realAuth: 'NOT EXECUTED', results },
        null,
        2
      )
    )
    console.log('R1 SDK mocked browser flows + default-off public build: PASS')
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
