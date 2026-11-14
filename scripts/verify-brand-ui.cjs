// Approved artwork in public screens, navigation and private printable workshop documents.
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
  const base = process.env.BASE_URL || 'http://127.0.0.1:5173',
    harness = 'http://127.0.0.1:5177'
  const out = process.env.OUTPUT_DIR || 'artifacts/bt-brand-01'
  fs.mkdirSync(out, { recursive: true })
  const results = []
  try {
    for (const width of JSON.parse(process.env.BRAND_WIDTHS || '[1650,1440,768,390,375]')) {
      const p = await browser.newPage({ viewport: { width, height: 941 } }),
        errors = [],
        writes = []
      p.on('pageerror', (e) => errors.push(e.message))
      p.on('request', (r) => {
        if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url())
      })
      const ready = async (locator) => {
        await locator.waitFor()
        await locator.evaluate((i) => i.decode())
        assert.ok(await locator.evaluate((i) => i.complete && i.naturalWidth > 0))
        assert.equal(await locator.evaluate((i) => getComputedStyle(i).objectFit), 'contain')
      }
      for (const route of [
        '/acceso',
        '/acceso/registro',
        '/auth/confirmacion',
        '/auth/recuperacion',
        '/auth/revisa-correo',
        '/auth/nueva-contrasena',
        '/auth/contrasena-actualizada'
      ]) {
        await p.goto(base + '/#' + route)
        const logo = p.locator('.access-brand .bt-brand-horizontal>img')
        await ready(logo)
        assert.equal(await logo.getAttribute('src'), '/brand/logo-horizontal.webp')
        assert.equal(await p.locator('.access-brand svg,.access-brand-mark').count(), 0)
        assert.equal(
          await logo.locator('..').evaluate((e) => getComputedStyle(e).backgroundColor),
          'rgb(255, 255, 255)'
        )
        if (route === '/acceso' && [1650, 390].includes(width))
          await p.screenshot({
            path: path.join(out, 'BT_BRAND_01_LOGIN_' + width + '.png'),
            fullPage: true
          })
      }
      await p.goto(base + '/#/revision/publica')
      const nav = () => p.locator(width > 760 ? '.side-nav button' : '.bottom-nav button')
      for (let i = 0; i < 5; i++) {
        await nav().nth(i).click()
        await ready(p.locator(width > 760 ? '.brand .bt-brand img' : '.shell-mobile-brand img'))
        assert.equal(await p.locator('.brand svg,.brand-mark,.brand-name').count(), 0)
        assert.equal(await p.locator('input:enabled,textarea:enabled,select:enabled').count(), 0)
        assert.equal(
          await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false
        )
        if (i === 0 && [1650, 390].includes(width))
          await p.screenshot({
            path: path.join(out, 'BT_BRAND_01_INICIO_' + width + '.png'),
            fullPage: true
          })
      }
      if (width <= 760) {
        await p.getByRole('button', { name: 'Abrir menú', exact: true }).click()
        const logo = p.locator('.brand .bt-brand')
        await ready(logo.locator('img'))
        const [box, aside] = await Promise.all([
          logo.boundingBox(),
          p.locator('.sidebar').boundingBox()
        ])
        assert.ok(box.x >= aside.x && box.x + box.width <= aside.x + aside.width)
        if (width === 390)
          await p.screenshot({ path: path.join(out, 'BT_BRAND_01_NAVEGACION_390.png') })
        await p.locator('.menu-close').click()
      }
      await p.goto(base + '/#/revision/mecanico')
      await ready(p.locator('header .bt-brand img'))
      if (!process.env.SKIP_HARNESS && [1650, 390].includes(width)) {
        for (const mode of ['Cotización', 'informe']) {
          await p.goto(harness)
          const n = p.locator(width > 760 ? '.side-nav button' : '.bottom-nav button')
          await n.nth(3).click()
          await p
            .getByRole('button', {
              name: mode === 'Cotización' ? 'Nueva cotización' : 'Nuevo informe',
              exact: false
            })
            .click()
          await p
            .getByLabel(
              mode === 'Cotización' ? 'Orden para cotización' : 'Orden para informe de trabajo',
              { exact: true }
            )
            .selectOption('OT-1002')
          await p
            .getByRole('button', {
              name: mode === 'Cotización' ? 'Crear cotización premium' : 'Crear informe de trabajo',
              exact: true
            })
            .click()
          if (mode === 'informe')
            await p
              .getByRole('checkbox', { name: /^Realizado:/ })
              .first()
              .check()
          await p.getByRole('button', { name: 'Imprimir / Guardar como PDF', exact: true }).click()
          const paper = p.locator('dialog .wt-paper')
          assert.match(await paper.locator('header').innerText(), /Taller de demostración/)
          assert.equal(await paper.locator('header .bt-brand').count(), 0)
          assert.match(await paper.locator('footer').innerText(), /Software ByteTorque/)
          await ready(paper.locator('.bt-software img'))
          if (mode === 'informe')
            assert.equal(await paper.locator('table').first().locator('tbody tr').count(), 1)
          await p.pdf({
            format: 'A4',
            printBackground: true,
            path: path.join(
              out,
              `BT_BRAND_01_DOCUMENTO_${mode === 'informe' ? 'INFORME' : 'COTIZACION'}_${width}.pdf`
            )
          })
        }
      }
      assert.deepEqual(errors, [])
      assert.deepEqual(writes, [])
      assert.deepEqual(await p.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0])
      results.push({
        width,
        screens: 7,
        panels: 5,
        officialArtwork: true,
        workshopIdentityPreserved: true,
        documentsChecked: !process.env.SKIP_HARNESS && [1650, 390].includes(width) ? 2 : 0,
        networkWrites: 0,
        errors
      })
      console.log('BRAND PASS', width)
      await p.close()
    }
    const gallery = await browser.newPage({ viewport: { width: 1440, height: 941 } })
    const files = [
      'favicon-32.png',
      'favicon-48.png',
      'icon-192.png',
      'icon-512.png',
      'apple-touch-icon.png',
      'icon-maskable-512.png'
    ]
    await gallery.setContent(
      `<html><head><style>body{font:16px system-ui;background:#eef4fc;color:#10203f;padding:28px}section{display:flex;align-items:center;gap:24px;padding:25px;margin:18px 0;border-radius:18px;background:white}.dark{background:#061c39;color:white}figure{margin:0;display:grid;justify-items:center;gap:12px;font-size:12px}img{object-fit:contain;width:120px;height:120px}.mask{clip-path:circle(50%)}.favicon{width:48px;height:48px}</style></head><body><h1>ByteTorque · Recursos oficiales BT-BRAND-01</h1><p>PNG originales derivados · Fondos claros/oscuros · Vista circular del icono maskable</p>${['', 'dark'].map((theme) => `<section class="${theme}">${files.map((file) => `<figure><img alt="${file}" class="${file.includes('maskable') ? 'mask' : file.includes('favicon') ? 'favicon' : ''}" src="${base + '/' + file}?v=bt-brand-01"><figcaption>${file}</figcaption></figure>`).join('')}</section>`).join('')}</body></html>`
    )
    await gallery.locator('img').evaluateAll((imgs) => Promise.all(imgs.map((i) => i.decode())))
    await gallery.screenshot({ path: path.join(out, 'BT_BRAND_01_ICONOS.png'), fullPage: true })
    await gallery.close()
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n')
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
