// npm run dev on 5173. Playwright is supplied by the cloud test environment.
const { chromium } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('node:fs')
;(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox']
  })
  fs.mkdirSync('/tmp/bt-ins01-evidence', { recursive: true })
  try {
    for (const width of JSON.parse(process.env.INS_WIDTHS || '[1650,1440,768,390,375]')) {
      const page = await browser.newPage({ viewport: { width, height: 941 } }),
        errors = [],
        writes = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('request', (r) => {
        if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url())
      })
      await page.addInitScript(() => {
        window.__revoked = []
        const original = URL.revokeObjectURL
        URL.revokeObjectURL = (url) => {
          window.__revoked.push(url)
          original.call(URL, url)
        }
      })
      const nav = () => page.locator(width > 760 ? '.side-nav button' : '.bottom-nav button')
      const sheet = () => page.locator('.mp-document-column>.mp-sheet'),
        row = (id) => sheet().locator(`[data-item="${id}"]`)
      const choose = async (id, state) => {
        await row(id)
          .getByRole('radio', { name: new RegExp(state + '$') })
          .check()
      }
      const open = async () => {
        await nav().nth(3).click()
        await page.getByRole('button', { name: 'Nuevo informe', exact: false }).click()
        await page.getByRole('button', { name: 'Crear inspección multipunto', exact: true }).click()
        await sheet().waitFor()
      }
      await page.goto(process.env.BASE_URL || 'http://localhost:5173')
      await open()
      assert.equal(await sheet().locator('.mp-row').count(), 34)
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false
      )
      assert.match(await sheet().innerText(), /María Torres/)
      assert.match(await sheet().innerText(), /DEMO-KZV-482/)
      assert.match(await page.locator('.mp-count').innerText(), /1 de 34/)
      await page
        .locator('#mp-observations')
        .fill('Observación DEMO: comprobar pastillas y extintor.')
      for (const state of ['OK', 'Requiere atención', 'Cambio inmediato']) {
        await choose('pastillas', state)
        assert.equal(await row('pastillas').locator('input:checked').count(), 1)
        assert.equal(
          await row('pastillas')
            .locator('.mp-cell span')
            .allTextContents()
            .then((v) => v.join('')),
          'X'
        )
      }
      assert.equal(
        await row('pastillas')
          .getByRole('radio', { name: /Cambio inmediato$/ })
          .isChecked(),
        true
      )
      await row('pastillas')
        .getByRole('button', { name: 'Limpiar Pastillas de freno', exact: true })
        .click()
      assert.equal(await row('pastillas').locator('input:checked').count(), 0)
      await choose('pastillas', 'Cambio inmediato')
      await choose('liquido-frenos', 'Requiere atención')
      await choose('neblina', 'OK')
      // Native radio arrows move a single selection, including with keyboard only.
      await row('bocina').getByRole('radio', { name: /OK$/ }).focus()
      await page.keyboard.press('ArrowRight')
      assert.equal(
        await row('bocina')
          .getByRole('radio', { name: /Requiere atención$/ })
          .isChecked(),
        true
      )
      assert.equal(
        await page.locator('#mp-observations').inputValue(),
        'Observación DEMO: comprobar pastillas y extintor.'
      )
      await page.getByRole('link', { name: 'Estado de frenos', exact: true }).click()
      assert.equal(
        await row('pastillas')
          .getByRole('radio', { name: /Cambio inmediato$/ })
          .isChecked(),
        true
      )
      if (width <= 760) {
        const box = await row('pastillas').locator('.mp-cell').first().boundingBox()
        assert.ok(box.width >= 44 && box.height >= 44)
      }
      await page.getByRole('button', { name: 'Finalizar y enviar', exact: true }).click()
      assert.equal(
        await page
          .getByRole('button', { name: 'Confirmar finalización sin envío real' })
          .isEnabled(),
        false
      )
      assert.match(await page.getByRole('dialog').innerText(), /Faltan 29/)
      await page.keyboard.press('Escape')
      await page.getByLabel('Hora de inicio', { exact: true }).fill('09:00')
      await page.getByLabel('Hora de término', { exact: true }).fill('10:30')
      await page.getByLabel('Combustible', { exact: true }).fill('Gasolina · DEMO')
      await page
        .getByLabel('Elegir fotografía DEMO', { exact: true })
        .setInputFiles({
          name: 'no-permitido.svg',
          mimeType: 'image/svg+xml',
          buffer: Buffer.from('<svg/>')
        })
      assert.match(await page.getByRole('alert').innerText(), /JPG, PNG o WebP/)
      await page
        .getByLabel('Elegir fotografía DEMO', { exact: true })
        .setInputFiles({
          name: 'corrupta.png',
          mimeType: 'image/png',
          buffer: Buffer.from('not an image')
        })
      await page.getByText('La fotografía no se pudo abrir. Elige una imagen válida.').waitFor()
      const photo = fs.readFileSync('public/icon-192.png')
      await page
        .getByLabel('Elegir fotografía DEMO', { exact: true })
        .setInputFiles({ name: 'foto-de-prueba.png', mimeType: 'image/png', buffer: photo })
      await page.getByRole('button', { name: 'Ampliar foto-de-prueba.png' }).waitFor()
      await page
        .getByLabel('Componente de foto-de-prueba.png', { exact: true })
        .selectOption('pastillas')
      await page.getByRole('button', { name: 'Ampliar foto-de-prueba.png' }).click()
      await page.getByRole('dialog', { name: 'Fotografía foto-de-prueba.png' }).waitFor()
      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: 'Guardar borrador', exact: true }).click()
      assert.match(await page.getByRole('status').innerText(), /solo en memoria/)
      const id = await sheet().locator('.mp-number strong').innerText()
      await page.getByRole('button', { name: 'Volver a informes', exact: true }).click()
      await page.getByRole('button', { name: 'Nuevo informe', exact: false }).click()
      await page.getByRole('button', { name: new RegExp(id) }).click()
      await sheet().waitFor()
      assert.equal(
        await page.locator('#mp-observations').inputValue(),
        'Observación DEMO: comprobar pastillas y extintor.'
      )
      assert.equal(
        await row('pastillas')
          .getByRole('radio', { name: /Cambio inmediato$/ })
          .isChecked(),
        true
      )
      assert.equal(
        await page.getByLabel('Componente de foto-de-prueba.png').inputValue(),
        'pastillas'
      )
      await page.getByRole('button', { name: 'Quitar foto-de-prueba.png' }).click()
      assert.equal(
        await page.getByRole('button', { name: 'Ampliar foto-de-prueba.png' }).count(),
        0
      )
      assert.equal(await page.evaluate(() => window.__revoked.length), 2)
      await page.getByRole('button', { name: 'Vista previa PDF', exact: true }).click()
      const preview = page.getByRole('dialog').locator('.mp-sheet')
      assert.equal(await preview.locator('[data-item="pastillas"] .mp-immediate').innerText(), 'X')
      assert.equal(
        await preview
          .locator('[data-item="tambores"] .mp-cell')
          .allTextContents()
          .then((v) => v.join('')),
        ''
      )
      assert.match(await preview.innerText(), /Sin revisar/)
      await page.emulateMedia({ media: 'print' })
      assert.equal(
        await page.locator('.mp-print-only').evaluate((e) => getComputedStyle(e).display),
        'block'
      )
      assert.equal(
        await page.locator('.sidebar').evaluate((e) => getComputedStyle(e).display),
        'none'
      )
      assert.equal(
        await page.locator('.mp-print-only [data-item="pastillas"] .mp-immediate').innerText(),
        'X'
      )
      assert.equal(
        await page
          .locator('.mp-print-only [data-item="pastillas"] .mp-immediate')
          .evaluate((e) => getComputedStyle(e).backgroundColor),
        'rgb(250, 56, 56)'
      )
      if (width === 1650) {
        await page.pdf({
          path: '/tmp/bt-ins01-evidence/inspeccion-a4.pdf',
          preferCSSPageSize: true,
          printBackground: true
        })
        await page
          .locator('.mp-print-only')
          .screenshot({ path: '/tmp/bt-ins01-evidence/print.png' })
      }
      await page.emulateMedia({ media: 'screen' })
      await page.keyboard.press('Escape')
      await page.evaluate(() => scrollTo(0, 0))
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      )
      if ([1650, 390].includes(width)) {
        await page.screenshot({ path: `docs/screenshots/BT_INS_01_${width}.png`, fullPage: true })
        if (width === 390) {
          await row('pastillas').scrollIntoViewIfNeeded()
          await page.screenshot({ path: 'docs/screenshots/BT_INS_01_390_CONTROLES.png' })
        }
      }
      await page.getByRole('button', { name: 'Finalizar y enviar', exact: true }).click()
      await page.getByRole('checkbox', { name: /Acepto finalizar/ }).check()
      await page.getByRole('button', { name: 'Confirmar finalización sin envío real' }).click()
      assert.match(await page.getByRole('status').innerText(), /no se envió ningún correo/i)
      assert.match(await page.locator('.mp-summary').innerText(), /Finalizado DEMO/)
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false
      )
      await page.getByRole('button', { name: 'Reabrir edición DEMO' }).click()
      await sheet().getByRole('radio', { name: 'Pastillas de freno · OK', exact: true }).check()
      assert.match(await page.locator('.mp-summary').innerText(), /En edición/)
      if (width === 1650) {
        for (const radio of await sheet().getByRole('radio', { name: / · OK$/ }).all()) await radio.check()
        assert.match(await page.locator('.mp-count').innerText(), /34 de 34/)
        assert.match(await sheet().locator('.mp-sheet-footer').innerText(), /Inspección revisada/)
        await page.getByRole('button', { name: 'Finalizar y enviar', exact: true }).click()
        assert.equal(await page.getByRole('checkbox', { name: /Acepto finalizar/ }).count(), 0)
        await page.getByRole('button', { name: 'Confirmar finalización sin envío real' }).click()
        assert.match(await page.locator('.mp-summary').innerText(), /Finalizado DEMO/)
      }
      await page.getByRole('button', { name: 'Descartar informe temporal', exact: true }).click()
      await page.getByRole('button', { name: 'Confirmar descarte', exact: true }).click()
      await page.getByRole('heading', { name: 'Informes y cotizaciones', exact: true }).waitFor()
      // Entry from the actual OT, preserving its eight-item summary unchanged.
      await nav().nth(1).click()
      if (await page.getByRole('button', { name: 'Abrir OT-1002', exact: true }).isVisible())
        await page.getByRole('button', { name: 'Abrir OT-1002', exact: true }).click()
      else await page.locator('.bt-ot-mobile-order').filter({ hasText: 'OT-1002' }).click()
      assert.match(await page.locator('.od-inspection .od-count').innerText(), /6 de 8/)
      await page.getByRole('button', { name: 'Generar informe', exact: true }).click()
      await page.getByRole('button', { name: 'Crear inspección multipunto', exact: true }).click()
      await sheet().waitFor()
      assert.match(await sheet().innerText(), /OT-1002/)
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false
      )
      assert.deepEqual(writes, [])
      assert.deepEqual(errors, [])
      assert.deepEqual(
        await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
        { local: 0, session: 0 }
      )
      await page.reload()
      await nav().nth(3).click()
      await page.getByRole('button', { name: 'Nuevo informe', exact: false }).click()
      assert.equal(
        await page.getByText('Borradores multipunto · Solo en memoria hasta recargar').count(),
        0
      )
      console.log(
        `BT-INS-01 ${width}: PASS — selection, keyboard, counts, preview/print, photos, drafts, finalization, OT, no writes/storage`
      )
      await page.close()
    }
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
