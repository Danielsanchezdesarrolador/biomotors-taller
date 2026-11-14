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
    out = process.env.OUTPUT_DIR || 'artifacts/bt-brand-02/after'
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
      const logo = () => p.locator('.bt-brand-horizontal').filter({ visible: true }).first()
      const inspect = async () => {
        await logo()
          .locator('img')
          .evaluate((i) => i.decode())
        const properties = await logo().evaluate((e) => {
          const s = getComputedStyle(e),
            i = e.querySelector('img'),
            r = i.getBoundingClientRect()
          return {
            bg: s.backgroundColor,
            border: s.borderWidth,
            padding: s.padding,
            shadow: s.boxShadow,
            filter: getComputedStyle(i).filter,
            source: i.getAttribute('src'),
            ratio: r.width / r.height,
            natural: i.naturalWidth / i.naturalHeight
          }
        })
        assert.equal(properties.bg, 'rgba(0, 0, 0, 0)')
        assert.equal(properties.border, '0px')
        assert.equal(properties.padding, '0px')
        assert.equal(properties.shadow, 'none')
        assert.equal(properties.filter, 'none')
        assert.equal(properties.source, '/brand/logo-horizontal-dark.webp')
        assert.ok(Math.abs(properties.ratio - properties.natural) < 0.02)
        assert.equal(
          await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false
        )
      }
      for (const [name, route] of [
        ['ADMIN', '/acceso/administrador'],
        ['MECANICO', '/acceso/mecanico'],
        ['REGISTRO', '/acceso/registro'],
        ['VERIFICACION', '/auth/confirmacion'],
        ['RECUPERACION', '/auth/recuperacion'],
        ['REVISA_CORREO', '/auth/revisa-correo'],
        ['NUEVA_CONTRASENA', '/auth/nueva-contrasena'],
        ['ACTUALIZADA', '/auth/contrasena-actualizada']
      ]) {
        await p.goto(base + '/#' + route)
        await inspect()
        if ([1650, 390].includes(width))
          await p.screenshot({
            path: path.join(out, `BT_BRAND_02_${name}_${width}.png`),
            fullPage: true
          })
        assert.equal(await p.locator('input:enabled,textarea:enabled,select:enabled').count(), 0)
      }
      await p.goto(base + '/#/revision/publica')
      await p.locator('.official-panel').waitFor()
      if (width <= 760) {
        await p.getByRole('button', { name: 'Abrir menú', exact: true }).click()
        await p.waitForFunction(
          () => Math.abs(document.querySelector('.sidebar').getBoundingClientRect().left) < 0.5
        )
      }
      await inspect()
      const imageBox = await logo().boundingBox(),
        aside = await p.locator('.sidebar').boundingBox()
      assert.ok(imageBox.x >= aside.x && imageBox.x + imageBox.width <= aside.x + aside.width)
      if ([1650, 390].includes(width))
        await p.screenshot({ path: path.join(out, `BT_BRAND_02_SIDEBAR_${width}.png`) })
      if (width <= 760) {
        const close = await p.locator('.menu-close').boundingBox()
        assert.ok(close.x >= imageBox.x + imageBox.width - 1)
        assert.ok(Math.abs(close.y + close.height / 2 - (imageBox.y + imageBox.height / 2)) < 12)
        await p.locator('.menu-close').click()
        await p.getByRole('button', { name: 'Abrir menú', exact: true }).waitFor()
      }
      assert.deepEqual(errors, [])
      assert.deepEqual(writes, [])
      assert.deepEqual(await p.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0])
      results.push({
        width,
        darkWordmark: true,
        transparent: true,
        border: false,
        shadow: false,
        filter: false,
        overflow: false,
        errors,
        networkWrites: 0
      })
      console.log('BRAND-02 PASS', width)
      await p.close()
    }
    const p = await browser.newPage({ viewport: { width: 1100, height: 700 } })
    await p.setContent(
      `<html><head><style>body{margin:0;padding:40px;background:#eaf3ff;font:18px system-ui}section{padding:35px;margin:25px 0;border-radius:15px;background:white}section.dark{background:#061c39;color:white}img{display:block;width:600px;max-width:100%;height:auto;object-fit:contain}</style></head><body><section class="dark"><p>BT-BRAND-02 · Variante transparente sobre azul marino</p><img src="${base}/brand/logo-horizontal-dark.webp"></section><section><p>Original conservado · Superficie clara</p><img src="${base}/brand/logo-horizontal.webp"></section></body></html>`
    )
    await p.locator('img').evaluateAll((images) => Promise.all(images.map((i) => i.decode())))
    await p.screenshot({ path: path.join(out, 'BT_BRAND_02_SUPERFICIES.png'), fullPage: true })
    await p.close()
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n')
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
