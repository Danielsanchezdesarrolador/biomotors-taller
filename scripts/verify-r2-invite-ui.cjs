// BT-AUTH-R2-A5 — offline browser proof, synthetic tokens, no Supabase calls.
const { chromium, webkit } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.BASE_URL || 'http://127.0.0.1:5173'
const out = process.env.OUTPUT_DIR || 'artifacts/bt-r2-a5'
const fakeToken = 'a'.repeat(64)
const browserKind = process.env.BT_INVITE_BROWSER || 'chromium'
if (!['chromium', 'webkit'].includes(browserKind))
  throw new Error('Unsupported BT_INVITE_BROWSER')
const browserType = browserKind === 'webkit' ? webkit : chromium

;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const browser = await browserType.launch(browserKind === 'chromium' ? {
    executablePath: fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
    args: ['--no-sandbox']
  } : {})
  try {
    for (const width of [390, 375, 768, 1440]) {
      // Chromium mobile viewport is a browser regression, NOT Safari hardware QA.
      const page = await browser.newPage({
        viewport: { width, height: 844 },
        isMobile: width <= 390,
        hasTouch: width <= 390,
        deviceScaleFactor: width <= 390 ? 3 : 1
      })
      const errors = []
      const writes = []
      const unsafeRequests = []
      await page.addInitScript(() => {
        window.__invitePersistentWrites = []
        const set = Storage.prototype.setItem
        Storage.prototype.setItem = function (...args) {
          window.__invitePersistentWrites.push('Storage')
          return set.apply(this, args)
        }
        const open = indexedDB.open.bind(indexedDB)
        indexedDB.open = (...args) => {
          window.__invitePersistentWrites.push('IndexedDB')
          return open(...args)
        }
      })
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('request', (r) => {
        if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.method())
        const url = new URL(r.url())
        if (url.searchParams.has('token') || /supabase\.(co|in)$|api\.resend\.com$/.test(url.hostname))
          unsafeRequests.push(url.hostname)
      })
      await page.goto(base + '/#/auth/aceptar-invitacion?token=' + fakeToken)
      await page.getByRole('heading', { name: 'Tu acceso como mecánico' }).waitFor()
      assert.equal(new URL(page.url()).hash, '#/auth/aceptar-invitacion')
      assert.equal(new URL(page.url()).search, '')
      assert.doesNotMatch(page.url(), /token=/)
      assert.doesNotMatch(await page.locator('body').innerText(), new RegExp(fakeToken))
      assert.equal(await page.getByText('No se ha creado ningún acceso.', { exact: false }).count(), 1)
      assert.equal(await page.getByRole('button', { name: 'Aceptar invitación' }).count(), 0)
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        'Horizontal overflow at ' + width)
      assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0])
      assert.deepEqual(await page.evaluate(() => window.__invitePersistentWrites), [])
      assert.deepEqual(unsafeRequests, [], 'Canonical hash link leaked into network query/Auth')
      if (width === 390 || width === 1440) await page.screenshot({
        path: path.join(out, 'INVITACION_PREPARACION_' + width + '.png'), fullPage: true
      })
      // Subsequent hashchanges must also be scrubbed; no hidden retention.
      await page.evaluate((token) => {
        location.hash = '/auth/aceptar-invitacion?token=' + token
      }, fakeToken)
      await page.waitForFunction(() => location.hash === '#/auth/aceptar-invitacion')
      // iOS PWA-like reload and BFCache-style browser history: the URL
      // remains clean after reload, back, and forward, never reusing the token.
      await page.reload()
      await page.getByRole('heading', { name: 'Tu acceso como mecánico' }).waitFor()
      assert.equal(new URL(page.url()).hash, '#/auth/aceptar-invitacion')
      await page.goBack()
      await page.getByRole('heading', { name: 'Tu acceso como mecánico' }).waitFor()
      assert.doesNotMatch(page.url(), /token=/)
      await page.goForward()
      await page.getByRole('heading', { name: 'Tu acceso como mecánico' }).waitFor()
      assert.doesNotMatch(page.url(), /token=/)
      await page.getByRole('button', { name: 'Volver al acceso de mecánicos' }).click()
      await page.getByRole('heading', { name: 'Inicia sesión' }).waitFor()
      assert.equal(new URL(page.url()).hash, '#/acceso/mecanico')
      await page.goBack()
      await page.getByRole('heading', { name: 'Tu acceso como mecánico' }).waitFor()
      assert.doesNotMatch(page.url(), /token=/)
      await page.goForward()
      await page.getByRole('heading', { name: 'Inicia sesión' }).waitFor()
      assert.equal(new URL(page.url()).hash, '#/acceso/mecanico')
      assert.deepEqual(await page.evaluate(() => window.__invitePersistentWrites), [])
      assert.deepEqual(unsafeRequests, [], 'Canonical link caused unexpected HTTP Auth/token request')
      assert.deepEqual(errors, [])
      assert.deepEqual(writes, [])
      // Loading with a token in the outer query IS unsafe for a real invite:
      // the hosting server receives it in the initial HTTP request. Test uses
      // only a synthetic value on loopback, verifying that the UI still strips
      // the query immediately and never offers acceptance.
      await page.goto(base + '/?token=' + fakeToken + '#/auth/aceptar-invitacion')
      await page.getByRole('heading', { name: 'Tu acceso como mecánico' }).waitFor()
      assert.equal(new URL(page.url()).search, '')
      assert.equal(new URL(page.url()).hash, '#/auth/aceptar-invitacion')
      assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0])
      assert.equal(await page.getByRole('button', { name: 'Aceptar invitación' }).count(), 0)
      assert.deepEqual(errors, [])
      assert.deepEqual(writes, [])
      await page.close()
      console.log('BT-R2-A10 ' + browserKind.toUpperCase() +
        ' BROWSER PASS ' + width + 'px — URL scrubbed, no writes')
    }
  } finally {
    await browser.close()
  }
})().catch(e => { console.error(e); process.exitCode = 1 })
