// BT-LEGAL-01: public static documents; no credentials or hosted data access.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

;(async () => {
  const base = process.env.BASE_URL || 'http://127.0.0.1:5184'
  const out = process.env.OUTPUT_DIR || '/tmp/bt-legal-01'
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] })
  const results = []
  try {
    for (const width of [1440, 390, 375]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: false })
      for (const [route, title] of [['privacidad', 'Política de Privacidad'], ['terminos', 'Términos y Condiciones del Servicio']]) {
        const page = await context.newPage()
        const requests = [], failures = []
        page.on('request', r => requests.push({ url: r.url(), method: r.method(), type: r.resourceType() }))
        page.on('requestfailed', r => failures.push(r.url()))
        const response = await page.goto(`${base}/${route}`)
        assert.equal(response.status(), 200)
        await page.getByRole('heading', { name: title, level: 1, exact: true }).waitFor()
        assert.match(await page.locator('body').innerText(), /Borrador sujeto a revisión legal y aprobación del propietario/)
        assert.equal(await page.locator('script, form, input, iframe').count(), 0)
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://bytetorque.cl/${route}`)
        await page.keyboard.press('Tab')
        assert.equal(await page.locator(':focus').getAttribute('href'), '#contenido')
        await page.keyboard.press('Enter')
        for (const anchor of await page.locator('.legal-index a').all()) {
          const href = await anchor.getAttribute('href')
          assert.equal(await page.locator(href).count(), 1)
        }
        assert.equal(await page.locator('h1').count(), 1)
        assert.equal(await page.locator('main').count(), 1)
        assert.equal(await page.locator('img:not([alt])').count(), 0)
        assert.ok(await page.locator('.legal-header img').evaluate(img => img.complete && img.naturalWidth > 0))
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        const reload = await page.reload()
        assert.equal(reload.status(), 200)
        await page.getByRole('heading', { name: title, level: 1, exact: true }).waitFor()
        assert.ok(requests.every(r => r.method === 'GET' && new URL(r.url).origin === new URL(base).origin && r.type !== 'script'))
        assert.deepEqual(failures, [])
        if (width !== 375) await page.screenshot({ path: path.join(out, `${route}-${width}.png`), fullPage: true })
        await page.getByRole('link', { name: 'Volver al inicio', exact: true }).click()
        assert.equal(new URL(page.url()).pathname, '/')
        results.push({ route, width, direct: true, reload: true, noJavaScript: true, noAuthentication: true, noOverflow: true, skipLink: true })
        await page.close()
      }
      await context.close()
    }
    if (process.env.CHECK_ACCESS !== 'false') {
      const context = await browser.newContext({ viewport: { width: 390, height: 900 } })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      for (const route of ['/acceso', '/acceso/registro']) {
        await page.goto(`${base}/#${route}`)
        const navigation = page.getByRole('navigation', { name: 'Documentos legales públicos' })
        await navigation.waitFor()
        assert.equal(await navigation.getByRole('link').count(), 2)
        const [popup] = await Promise.all([
          page.waitForEvent('popup'),
          navigation.getByRole('link', { name: 'Política de Privacidad (se abre en otra pestaña)', exact: true }).click(),
        ])
        await popup.getByRole('heading', { name: 'Política de Privacidad', level: 1, exact: true }).waitFor()
        await popup.close()
        assert.equal(new URL(page.url()).hash, `#${route}`)
      }
      assert.deepEqual(errors, [])
      await context.close()
      results.push({ accessAndRegistrationLinks: true, originalFlowPreserved: true })
    }
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2))
    console.log('BT-LEGAL-01 PASS:', JSON.stringify(results))
  } finally {
    await browser.close()
  }
})().catch(error => { console.error(error); process.exitCode = 1 })
