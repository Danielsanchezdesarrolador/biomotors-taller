// Start Vite on 5173. Playwright is supplied by the test environment.
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
  const output = process.env.OUTPUT_DIR || 'artifacts/bt-cot-01'
  fs.mkdirSync(output, { recursive: true })
  const results = []
  try {
    for (const width of JSON.parse(process.env.COT_WIDTHS || '[1650,1440,768,390,375]')) {
      const p = await browser.newPage({ viewport: { width, height: 941 } }),
        errors = [],
        writes = []
      p.on('pageerror', (e) => errors.push(e.message))
      p.on('request', (r) => {
        if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url())
      })
      const nav = () => p.locator(width > 760 ? '.side-nav button' : '.bottom-nav button'),
        dialog = () => p.getByRole('dialog'),
        rows = () => p.locator('.wt-items tbody tr'),
        paper = () => dialog().locator('.wt-paper')
      const noOverflow = async () =>
        assert.equal(
          await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false
        )
      const open = async (mode = 'quote', order = 'OT-1002') => {
        await nav().nth(3).click()
        await p
          .getByRole('button', {
            name: mode === 'quote' ? 'Nueva cotización' : 'Nuevo informe',
            exact: false
          })
          .click()
        await p
          .getByLabel(
            mode === 'quote' ? 'Orden para cotización' : 'Orden para informe de trabajo',
            { exact: true }
          )
          .selectOption(order)
        await p
          .getByRole('button', {
            name: mode === 'quote' ? 'Crear cotización premium' : 'Crear informe de trabajo',
            exact: true
          })
          .click()
        await p.locator('.wt-panel').waitFor()
      }
      const add = async (description, quantity = '1', price = '100') => {
        await p.getByRole('button', { name: 'Agregar ítem', exact: true }).click()
        await p.getByLabel('Descripción del ítem', { exact: true }).fill(description)
        await p.getByLabel('Cantidad del ítem', { exact: true }).fill(quantity)
        await p.getByLabel('Precio del ítem', { exact: true }).fill(price)
        await p.getByRole('button', { name: 'Guardar ítem DEMO', exact: true }).click()
      }
      await p.goto(process.env.BASE_URL || 'http://localhost:5173')
      await open()
      await noOverflow()
      assert.equal(await rows().count(), 3)
      assert.match(await p.locator('.wt-identity').innerText(), /María Torres/)
      assert.match(await p.locator('.wt-identity').innerText(), /DEMO-KZV-482/)
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$154.879 CLP')
      await p.getByRole('button', { name: 'Agregar ítem', exact: true }).click()
      await p.getByLabel('Descripción del ítem').fill('Insumo de prueba')
      await p.getByLabel('Tipo de ítem').selectOption('Insumo')
      await p.getByLabel('Cantidad del ítem').fill('0')
      await p.getByRole('button', { name: 'Guardar ítem DEMO' }).click()
      assert.match(await p.getByRole('alert').innerText(), /Cantidad/)
      await p.getByLabel('Cantidad del ítem').fill('2')
      await p.getByLabel('Precio del ítem').fill('-1')
      await p.getByRole('button', { name: 'Guardar ítem DEMO' }).click()
      assert.match(await p.getByRole('alert').innerText(), /Precio/)
      await p.getByLabel('Precio del ítem').fill('1000')
      await p.getByRole('button', { name: 'Guardar ítem DEMO' }).click()
      assert.equal(await rows().count(), 4)
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$157.259 CLP')
      await p.getByRole('button', { name: 'Editar ítem 4', exact: true }).click()
      await p.getByLabel('Cantidad del ítem').fill('3')
      await p.getByRole('button', { name: 'Guardar ítem DEMO' }).click()
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$158.449 CLP')
      await p.getByRole('button', { name: 'Agregar ítem', exact: true }).click()
      await p.getByLabel('Descripción del ítem').fill(' INSUMO  DE PRUEBA ')
      await p.getByLabel('Tipo de ítem').selectOption('Insumo')
      await p.getByRole('button', { name: 'Guardar ítem DEMO' }).click()
      assert.match(await p.getByRole('alert').innerText(), /duplicación/)
      await p.keyboard.press('Escape')
      assert.equal(await rows().count(), 4)
      await p.getByRole('button', { name: 'Eliminar ítem 4', exact: true }).click()
      await p.keyboard.press('Escape')
      assert.equal(await rows().count(), 4)
      await p.getByRole('button', { name: 'Eliminar ítem 4', exact: true }).click()
      await p.getByRole('button', { name: 'Confirmar eliminación', exact: true }).click()
      assert.equal(await rows().count(), 3)
      await p.getByLabel('Vigencia (días)', { exact: true }).fill('12')
      await p
        .getByLabel('Condiciones comerciales', { exact: true })
        .fill(
          'Condiciones de prueba DEMO. Repuestos sujetos a disponibilidad. Garantía por acordar.'
        )
      await p
        .getByLabel('Comentarios técnicos', { exact: true })
        .fill('Comentario DEMO: trabajo propuesto, no ejecutado.')
      assert.match(await p.locator('.wt-character-count').innerText(), /49 \/ 500/)
      await p.getByRole('button', { name: 'Marcar pendiente de revisión', exact: true }).click()
      assert.match(await p.locator('.wt-metric').first().innerText(), /Pendiente de revisión/)
      await p.getByRole('button', { name: 'Aprobar DEMO', exact: true }).click()
      assert.equal(
        await p
          .getByRole('button', { name: 'Confirmar aprobación simulada', exact: true })
          .isEnabled(),
        false
      )
      await p.getByRole('checkbox', { name: /Entiendo que es una simulación DEMO/ }).check()
      await p.getByRole('button', { name: 'Confirmar aprobación simulada', exact: true }).click()
      assert.match(await p.locator('.wt-approval-state').first().innerText(), /Aprobación simulada/)
      await p.getByRole('button', { name: 'Imprimir / Guardar como PDF', exact: true }).click()
      assert.match(await paper().innerText(), /Aprobación simulada/)
      assert.match(await paper().innerText(), /\$154.879 CLP/)
      assert.match(await paper().innerText(), /Comentario DEMO/)
      await p.evaluate(() => {
        window.__printed = false
        window.print = () => (window.__printed = true)
      })
      await p
        .getByRole('button', { name: 'Imprimir documento / Guardar como PDF', exact: true })
        .click()
      assert.equal(await p.evaluate(() => window.__printed), true)
      await p.emulateMedia({ media: 'print' })
      assert.equal(await p.locator('.sidebar').evaluate((e) => getComputedStyle(e).display), 'none')
      assert.equal(
        await p.locator('.wt-print-only').evaluate((e) => getComputedStyle(e).display),
        'block'
      )
      assert.equal(
        await p
          .locator('.wt-print-only tr')
          .first()
          .evaluate((e) => getComputedStyle(e).breakInside),
        'avoid'
      )
      assert.equal(
        await p.locator('.wt-print-only thead').evaluate((e) => getComputedStyle(e).display),
        'table-header-group'
      )
      if (width === 1650) {
        await p.pdf({
          path: path.join(output, 'BT_COT_01_A4.pdf'),
          preferCSSPageSize: true,
          printBackground: true
        })
      }
      await p.emulateMedia({ media: 'screen' })
      await p.keyboard.press('Escape')
      await p.getByLabel('Comentarios técnicos').fill('Comentario editado DEMO.')
      assert.match(
        await p.locator('.wt-approval-state').first().innerText(),
        /Sin aprobación simulada/
      )
      assert.match(await p.getByRole('status').innerText(), /invalidada/)
      const id = await p.locator('.wt-metric').nth(1).locator('strong').innerText()
      await p.getByRole('button', { name: 'Guardar borrador', exact: true }).click()
      assert.match(await p.getByRole('status').innerText(), /solo en memoria/)
      await p.getByRole('button', { name: 'Volver a informes y cotizaciones', exact: true }).click()
      await p.getByRole('button', { name: 'Nueva cotización', exact: false }).click()
      await p.getByRole('button', { name: new RegExp(id) }).click()
      assert.equal(
        await p.getByLabel('Comentarios técnicos').inputValue(),
        'Comentario editado DEMO.'
      )
      assert.equal(await p.getByLabel('Vigencia (días)').inputValue(), '12')
      await p.context().grantPermissions(['clipboard-read', 'clipboard-write'])
      await p.getByRole('button', { name: 'Compartir', exact: true }).click()
      await p.getByRole('button', { name: 'Copiar resumen DEMO local', exact: true }).click()
      assert.match(await p.getByRole('status').innerText(), /Resumen DEMO copiado/)
      assert.match(await p.evaluate(() => navigator.clipboard.readText()), new RegExp(id))
      await p.getByRole('button', { name: 'Compartir', exact: true }).click()
      assert.match(await dialog().innerText(), /Sin enlace público/)
      assert.doesNotMatch(await p.locator('.wt-local-summary').innerText(), /@/)
      await p.getByRole('button', { name: 'Simular preparación sin enviar', exact: true }).click()
      assert.match(await p.getByRole('status').innerText(), /No se envió ningún correo/)
      await p.getByRole('button', { name: 'Cargar plantilla', exact: true }).click()
      await p.keyboard.press('Escape')
      assert.equal(await rows().count(), 3)
      await p.getByRole('button', { name: 'Cargar plantilla', exact: true }).click()
      await p.getByLabel('Plantilla DEMO', { exact: true }).selectOption('maintenance')
      await p.getByRole('button', { name: 'Confirmar reemplazo de ítems', exact: true }).click()
      assert.match(await rows().nth(1).innerText(), /Insumo/)
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$97.461 CLP')
      await p.getByRole('button', { name: 'Cargar plantilla', exact: true }).click()
      await p.getByLabel('Plantilla DEMO', { exact: true }).selectOption('brakes')
      await p.getByRole('button', { name: 'Confirmar reemplazo de ítems', exact: true }).click()
      if ([1650, 390].includes(width)) {
        await p.evaluate(() => scrollTo(0, 0))
        await p.evaluate(
          () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        )
        await p.screenshot({ path: path.join(output, `BT_COT_01_${width}.png`), fullPage: true })
        if (width === 390)
          await p.screenshot({ path: path.join(output, 'BT_COT_01_390_CABECERA.png') })
      }
      // A long document must paginate without hiding its last item or table headings.
      if (width === 1650) {
        for (let i = 1; i <= 32; i++) await add(`Trabajo de prueba para impresión ${i}`)
        await p.emulateMedia({ media: 'print' })
        const pdf = await p.pdf({
          path: path.join(output, 'BT_COT_01_MULTIPAGINA.pdf'),
          preferCSSPageSize: true,
          printBackground: true
        })
        assert.ok((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length >= 2)
        await p.emulateMedia({ media: 'screen' })
      }
      await p.getByRole('button', { name: 'Volver a informes y cotizaciones', exact: true }).click()
      await open('work')
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$0 CLP')
      assert.equal(await p.getByRole('checkbox', { name: /^Realizado:/ }).count(), 3)
      await p.getByRole('button', { name: 'Finalizar DEMO', exact: true }).click()
      assert.equal(
        await p
          .getByRole('button', { name: 'Confirmar finalización DEMO', exact: true })
          .isEnabled(),
        false
      )
      assert.match(await dialog().innerText(), /Marca expresamente/)
      await p.keyboard.press('Escape')
      await p
        .getByRole('checkbox', { name: 'Realizado: Pastillas de freno delanteras', exact: true })
        .check()
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$62.951 CLP')
      await noOverflow()
      await p.getByRole('button', { name: 'Imprimir / Guardar como PDF', exact: true }).click()
      assert.equal(await paper().locator('tbody tr').count(), 1)
      assert.match(await paper().innerText(), /Pastillas de freno delanteras/)
      assert.doesNotMatch(await paper().innerText(), /Rectificado de discos \(par\)/)
      assert.match(await paper().innerText(), /\$62.951 CLP/)
      await p.keyboard.press('Escape')
      if ([1650, 390].includes(width)) {
        await p.evaluate(() => scrollTo(0, 0))
        await p.screenshot({
          path: path.join(output, `BT_COT_01_TRABAJO_${width}.png`),
          fullPage: true
        })
      }
      await p.getByRole('button', { name: 'Finalizar DEMO', exact: true }).click()
      await p.getByRole('checkbox', { name: /Entiendo que es una simulación DEMO/ }).check()
      await p.getByRole('button', { name: 'Confirmar finalización DEMO', exact: true }).click()
      assert.match(
        await p.locator('.wt-approval-state').first().innerText(),
        /Finalización simulada/
      )
      await p.getByRole('button', { name: 'Descartar borrador temporal', exact: true }).click()
      await p.getByRole('button', { name: 'Confirmar descarte', exact: true }).click()
      await open('quote', 'OT-1003')
      assert.match(await p.locator('.wt-identity').innerText(), /Paula Fernández Ortega/)
      assert.match(await p.locator('.wt-identity').innerText(), /DEMO-03/)
      assert.equal(await rows().count(), 0)
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$0 CLP')
      await p.getByRole('button', { name: 'Aprobar DEMO', exact: true }).click()
      assert.match(await dialog().innerText(), /Agrega al menos/)
      await p.keyboard.press('Escape')
      // OT routes retain the existing multipoint choice.
      await nav().nth(1).click()
      const ot = p.getByRole('button', { name: 'Abrir OT-1002', exact: true })
      if (await ot.isVisible()) await ot.click()
      else await p.locator('.bt-ot-mobile-order').filter({ hasText: 'OT-1002' }).click()
      await p.getByRole('button', { name: 'Generar informe', exact: true }).click()
      assert.equal(
        await p.getByRole('button', { name: 'Crear inspección multipunto', exact: true }).count(),
        1
      )
      await p.getByRole('button', { name: 'Nuevo informe de trabajo', exact: true }).click()
      await p.locator('.wt-panel').waitFor()
      assert.match(await p.locator('.wt-identity').innerText(), /OT-1002/)
      await noOverflow()
      assert.deepEqual(errors, [])
      assert.deepEqual(writes, [])
      assert.deepEqual(
        await p.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
        { local: 0, session: 0 }
      )
      await p.reload()
      await nav().nth(3).click()
      await p.getByRole('button', { name: 'Nueva cotización', exact: false }).click()
      assert.equal(await p.getByRole('button', { name: new RegExp(id) }).count(), 0)
      results.push({
        width,
        status: 'PASS',
        pageErrors: errors,
        networkWrites: writes,
        webStorage: false
      })
      console.log(
        `BT-COT-01 ${width}: PASS — items/validation, totals, OT, terms/comments, modes, approval invalidation, draft, template, print, local share, zero writes/storage`
      )
      await p.close()
    }
  } finally {
    fs.writeFileSync(
      path.join(output, 'BT_COT_01_RESULTADOS.json'),
      JSON.stringify(results, null, 2)
    )
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
