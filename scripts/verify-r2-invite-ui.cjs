// BT-AUTH-R2-A5 — offline browser proof, synthetic tokens, no Supabase calls.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = process.env.BASE_URL || 'http://127.0.0.1:5173'
const out = process.env.OUTPUT_DIR || 'artifacts/bt-r2-a5'
const fakeToken = 'a'.repeat(64)

;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch({
    executablePath: fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
    args: ['--no-sandbox']
  })
  try {
    for (const width of [390, 375, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } })
      const errors = []
      const writes = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('request', (r) => { if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url()) })
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
      if (width === 390 || width === 1440) await page.screenshot({
        path: path.join(out, 'INVITACION_PREPARACION_' + width + '.png'), fullPage: true
      })
      // Subsequent hashchanges must also be scrubbed; no hidden retention.
      await page.evaluate((token) => {
        location.hash = '/auth/aceptar-invitacion?token=' + token
      }, fakeToken)
      await page.waitForFunction(() => location.hash === '#/auth/aceptar-invitacion')
      await page.getByRole('button', { name: 'Volver al acceso de mecánicos' }).click()
      await page.getByRole('heading', { name: 'Inicia sesión' }).waitFor()
      assert.equal(new URL(page.url()).hash, '#/acceso/mecanico')
      assert.deepEqual(errors, [])
      assert.deepEqual(writes, [])
      await page.close()
      console.log('BT-R2-A5 BROWSER PASS ' + width + 'px — URL scrubbed, no writes')
    }
  } finally {
    await browser.close()
  }
})().catch(e => { console.error(e); process.exitCode = 1 })
