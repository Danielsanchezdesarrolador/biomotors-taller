// BT-COM-01D · Real React R2 component in loopback-only harness.
// Zero Supabase, Storage, mail or provider access. No user records.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const out = process.env.OUTPUT_DIR || 'artifacts/bt-com-01d'
const widths = [360, 390, 430, 768, 1366, 1440, 1920]
;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch({
    executablePath: fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
    args: ['--no-sandbox']
  })
  const results = []
  try {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 960 } })
      const errors = [], remote = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('request', request => {
        if (!request.url().startsWith('http://127.0.0.1:5177/')) remote.push(request.url())
      })
      await page.goto('http://127.0.0.1:5177/com01d-review-qa', {
        waitUntil: 'networkidle'
      })
      const section = page.getByRole('region', { name: 'Revisión de cierre documental' })
      await section.waitFor()
      assert.equal(await section.count(), 1)
      const toggle = section.getByRole('button', { name: 'Revisar documentos y destinatario' })
      await toggle.click()
      assert.equal(await page.locator('.cp06-closing-file').count(), 3,
        'exactly three historical document cards')
      assert.equal(await page.locator('.cp06-closing-file button:disabled').count(), 3,
        'no historical PDF storage has been approved in lab')
      assert.equal(await section.getByRole('button', { name: /Registrar revisión/ }).isDisabled(), true)
      assert.equal(await section.getByRole('button', { name: /Enviar correo/ }).isDisabled(), true)
      assert.match(await section.innerText(), /No se ha comprobado que esta dirección siga vigente/)
      assert.match(await section.innerText(), /No equivale a un cobro/)
      const boxes = section.locator('.cp06-closing-review input[type=checkbox]')
      assert.equal(await boxes.count(), 3)
      assert.match(await section.innerText(), /Revisión local incompleta · NO guardada/)
      for (let i = 0; i < 3; i++) await boxes.nth(i).check()
      assert.match(await section.innerText(), /Lista local revisada · NO guardada/)
      assert.equal(await section.getByRole('button', { name: /Enviar correo/ }).isDisabled(), true)
      const metrics = await page.evaluate(() => ({
        docWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        files: [...document.querySelectorAll('.cp06-closing-file')].map(el => {
          const r = el.getBoundingClientRect()
          return { left: r.left, right: r.right, height: r.height }
        })
      }))
      assert.ok(metrics.docWidth <= width + 1,
        'horizontal document overflow at ' + width + ': ' + metrics.docWidth)
      assert.ok(metrics.files.every(r => r.left >= -1 && r.right <= width + 1),
        'document card escapes viewport at ' + width)
      assert.deepEqual(errors, [], 'runtime errors at '+width)
      assert.deepEqual(remote, [], 'external network request in isolated fixture')
      await page.screenshot({
        path: out + '/cierre-revision-' + width + '.png', fullPage: true
      })
      await page.reload({ waitUntil: 'networkidle' })
      await page.getByRole('button', { name: 'Revisar documentos y destinatario' }).click()
      assert.match(await section.innerText(), /Revisión local incompleta · NO guardada/,
        'local review must not persist across refresh')
      results.push({ width, cards: 3, disabledMail: true, locallyNotPersisted: true, overflow: false })
      await page.close()
    }
    const p = await browser.newPage({ viewport: { width: 390, height: 850 } })
    const errors = []
    p.on('pageerror', error => errors.push(error.message))
    await p.goto('http://127.0.0.1:5177/com01d-review-qa?scenario=missing', {
      waitUntil: 'networkidle'
    })
    await p.getByRole('button', { name: 'Revisar documentos y destinatario' }).click()
    assert.match(await p.locator('.cp06-closing-warning').innerText(), /faltan constancias/)
    assert.equal(await p.locator('.cp06-closing-file').count(), 0,
      'missing delivery MUST NOT make printable/returnable packets')
    assert.deepEqual(errors, [])
    await p.screenshot({ path: out+'/sin-constancia-390.png', fullPage: true })
    await p.close()
    fs.writeFileSync(out+'/results.json', JSON.stringify(results,null,2)+'\n')
    console.log('BT_COM_01D_R2_CLOSING_UI_SEVEN_SIZES_NO_MAIL_PASS')
  } finally {
    await browser.close()
  }
})().catch(error => { console.error(error); process.exitCode = 1 })
