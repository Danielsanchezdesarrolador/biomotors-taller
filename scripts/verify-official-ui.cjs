// Runs against the public build. No fixture injection, switches or operational forms.
const { chromium } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path')
;(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
    args: ['--no-sandbox']
  })
  const out = process.env.OUTPUT_DIR || 'artifacts/bt-oficial-01a'
  fs.mkdirSync(out, { recursive: true })
  const results = []
  try {
    for (const width of JSON.parse(process.env.OFFICIAL_WIDTHS || '[1650,1440,768,390,375]')) {
      const p = await browser.newPage({ viewport: { width, height: 941 } }),
        errors = [],
        writes = []
      await p.addInitScript(() => {
        window.__persistentWrites = []
        const set = Storage.prototype.setItem
        Storage.prototype.setItem = function (...args) {
          window.__persistentWrites.push('Storage')
          return set.apply(this, args)
        }
        const open = indexedDB.open.bind(indexedDB)
        indexedDB.open = (...args) => {
          window.__persistentWrites.push('IndexedDB')
          return open(...args)
        }
      })
      p.on('pageerror', (e) => errors.push(e.message))
      p.on('request', (r) => {
        if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url())
      })
      const base = process.env.BASE_URL || 'http://127.0.0.1:5173'
      await p.goto(base + '/#/revision/publica')
      const nav = () => p.locator(width > 760 ? '.side-nav button' : '.bottom-nav button')
      const labels = [
        'Inicio',
        'Órdenes de trabajo',
        'Clientes y vehículos',
        'Informes y cotizaciones',
        'Configuración'
      ]
      const expected = [
        'Todavía no hay trabajos por continuar',
        'Aún no hay órdenes de trabajo',
        'Todavía no hay clientes',
        'Sin informes disponibles',
        'Tu taller aún no está configurado'
      ]
      assert.equal(await nav().count(), 5)
      for (let i = 0; i < 5; i++) {
        await nav().nth(i).click()
        await p
          .getByRole('heading', {
            name: i === 0 ? '¿Qué vamos a hacer hoy?' : labels[i],
            exact: true
          })
          .waitFor()
        if (!process.env.CAPTURE_BEFORE) {
          const body = await p.locator('body').innerText()
          assert.doesNotMatch(
            body,
            /DEMO|demostración|OT-100[1-8]|@example\.com|Camila|Torres|BIOMOTORS|TallerFlow|Enviado hoy|12 respaldos|5 %/
          )
          assert.match(body, new RegExp(expected[i]))
          assert.match(body, /Por ahora no ingreses datos de clientes ni vehículos reales/)
          assert.equal(
            await p
              .locator('input:enabled,textarea:enabled,select:enabled,[contenteditable="true"]')
              .count(),
            0
          )
          assert.equal(await p.locator('form').count(), 0)
          for (const control of await p.locator('.official-panel button:disabled').all()) {
            assert.match(await control.getAttribute('title'), /acceso seguro/)
            assert.equal(await control.getAttribute('aria-describedby'), 'official-readiness')
            assert.ok((await control.boundingBox()).height >= 44)
          }
          assert.equal(
            await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
            false
          )
        }
        if ([1650, 390, 375].includes(width)) {
          await p.evaluate(() => scrollTo(0, 0))
          await p.screenshot({
            path: path.join(
              out,
              `BT_OFICIAL_01A_${process.env.CAPTURE_BEFORE ? 'ANTES_' : ''}${i + 1}_${width}.png`
            ),
            fullPage: true
          })
        }
      }
      if (!process.env.CAPTURE_BEFORE) {
        await p.getByRole('button', { name: 'Notificaciones', exact: true }).click()
        assert.match(await p.locator('.top-popover').innerText(), /acceso seguro/)
        await nav().nth(0).click()
        // Public URLs/flags cannot activate fixtures or a writable local workflow.
        for (const url of [
          '/?demo=1&test=1&harness=true',
          '/?mode=demo',
          '/tests/harness/',
          '/tests/fixtures/records.ts',
          '/@fs/workspace/biomotors-taller/tests/fixtures/records.ts'
        ]) {
          const text = await p.evaluate(async (url) => {
            const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
            return response.text()
          }, url)
          assert.doesNotMatch(text, /OT-1001|Camila Muñoz|export const orderFixtures|WorkflowApp/)
        }
        assert.deepEqual(await p.evaluate(() => window.__persistentWrites), [])
        await p.goto(base + '/?demo=1&test=1&harness=true#/revision/publica')
        assert.equal(await p.locator('input:enabled,textarea:enabled,select:enabled').count(), 0)
        assert.doesNotMatch(await p.locator('body').innerText(), /DEMO|demostración|OT-1001/)
        assert.deepEqual(await p.evaluate(() => window.__persistentWrites), [])
        await p.reload()
        assert.equal(await p.locator('.official-panel').count(), 1)
        assert.deepEqual(
          await p.evaluate(() => [localStorage.length, sessionStorage.length]),
          [0, 0]
        )
        assert.deepEqual(await p.evaluate(() => window.__persistentWrites), [])
        assert.deepEqual(writes, [])
        assert.deepEqual(errors, [])
      }
      results.push({ width, panels: 5, status: 'PASS', networkWrites: writes.length, errors })
      console.log('OFICIAL PASS', width)
      await p.close()
    }
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n')
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
