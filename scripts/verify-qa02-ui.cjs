// QA02: a new reception through delivery, compact quotation and preserved canonical editors.
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
  const output = process.env.OUTPUT_DIR || 'artifacts/bt-qa02'
  fs.mkdirSync(output, { recursive: true })
  const results = []
  try {
    for (const width of JSON.parse(process.env.QA_WIDTHS || '[1650,1440,768,390,375]')) {
      const p = await browser.newPage({ viewport: { width, height: 941 } }),
        errors = [],
        writes = []
      await p.addInitScript(() => {
        window.__storageWrites = []
        const set = Storage.prototype.setItem
        Storage.prototype.setItem = function (...args) {
          window.__storageWrites.push('Storage.setItem')
          return set.apply(this, args)
        }
        const open = indexedDB.open.bind(indexedDB)
        indexedDB.open = (...args) => {
          window.__storageWrites.push('indexedDB.open')
          return open(...args)
        }
      })
      p.on('pageerror', (e) => errors.push(e.message))
      p.on('request', (r) => {
        if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url())
      })
      const button = (name) => p.getByRole('button', { name, exact: true }),
        nav = () => p.locator(width > 760 ? '.side-nav button' : '.bottom-nav button'),
        back = () => p.getByRole('button', { name: /Volver al expediente/ }).click(),
        step = (n) =>
          p
            .locator('.fl-milestones button')
            .nth(n - 1)
            .click()
      const noOverflow = async () =>
        assert.equal(
          await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false
        )
      const capture = async (name) => {
        await noOverflow()
        if ([1650, 390, 375].includes(width)) {
          await p.evaluate(() => scrollTo(0, 0))
          await p.screenshot({
            path: path.join(output, `BT_QA_02_${name}_${width}.png`),
            fullPage: true
          })
        }
      }
      const expand = async () => {
        if (width <= 760 && (await button('Ver detalle / Editar ítems').isVisible()))
          await button('Ver detalle / Editar ítems').click()
      }
      const collapse = async () => {
        if (width <= 760) await button('Ocultar detalle de edición').click()
      }
      const summary = p.locator('.wt-quote-summary')
      const add = async (i, guided = false) => {
        await button(guided ? 'Agregar otro ítem' : 'Agregar ítem').click()
        await p
          .getByLabel('Descripción del ítem')
          .fill(
            i === 4
              ? 'Partida 4 de prueba con descripción extensa para verificar ajuste natural del texto y lectura completa sin recortar repuestos ni valores en el teléfono.'
              : `Partida ficticia QA ${i}`
          )
        await p.getByLabel('Precio del ítem').fill(String(i * 1000))
        await button('Guardar ítem DEMO').click()
      }
      const confirmProposal = async () => {
        await button('Revisar y confirmar propuesta').click()
        await p
          .getByRole('checkbox', { name: /Confirmo que revisé expresamente el diagnóstico/ })
          .check()
        await button('Confirmar propuesta DEMO').click()
      }
      await p.goto(process.env.BASE_URL || 'http://localhost:5177')
      assert.equal(await nav().count(), 5)
      await button('Nuevo ingreso de vehículo').click()
      await button('Registrar cliente nuevo DEMO').click()
      await p.getByLabel('Nombre completo DEMO', { exact: true }).fill(`Cliente QA ${width} DEMO`)
      await p.getByLabel('Teléfono DEMO', { exact: true }).fill('+56 9 0000 0090')
      await p.getByLabel('Correo DEMO', { exact: true }).fill(`qa${width}@example.com`)
      await p.getByLabel('Marca DEMO', { exact: true }).fill('Toyota')
      await p.getByLabel('Modelo DEMO', { exact: true }).fill('Yaris')
      await p.getByLabel('Año', { exact: true }).fill('2020')
      await button('Continuar').click()
      await p.getByLabel('Kilometraje actual del ingreso', { exact: true }).fill('52000')
      await p
        .getByLabel('Motivo declarado por el cliente', { exact: true })
        .fill('Motivo ficticio: revisar ruido al pasar por baches.')
      await p.getByRole('checkbox', { name: /Confirmo que usaré solo datos ficticios/ }).check()
      await button('Continuar').click()
      await button('Confirmar recepción DEMO').click()
      await button('Crear orden de trabajo').click()
      await button('Confirmar creación de OT DEMO').click()
      await capture('OPCIONES')
      await button('Iniciar inspección').click()
      await capture('MULTIPUNTO')
      await p.getByLabel('Hora de inicio', { exact: true }).fill('09:00')
      await p.getByLabel('Hora de término', { exact: true }).fill('10:30')
      await p.getByLabel('Combustible', { exact: true }).fill('Gasolina DEMO')
      await p.getByRole('button', { name: 'Finalizar inspección DEMO', exact: true }).click()
      await p.getByRole('checkbox', { name: /Acepto finalizar/ }).check()
      await p.getByRole('button', { name: 'Confirmar finalización DEMO', exact: true }).click()
      await back()
      await step(4)
      await button('Definir trabajos').click()
      assert.equal(await button('Cargar plantilla').count(), 0)
      await p
        .getByLabel('Diagnóstico profesional del mecánico')
        .fill('Diagnóstico profesional ficticio: revisión mecánica expresa de suspensión.')
      for (let i = 1; i <= 4; i++) await add(i, true)
      await confirmProposal()
      await button('Revisar cotización').click()
      for (const count of [4, 8, 12]) {
        if (count > 4) {
          await expand()
          for (let i = count - 3; i <= count; i++) await add(i)
          await collapse()
        }
        if (width <= 760) {
          await summary.waitFor({ state: 'visible' })
          assert.equal(await summary.locator('.wt-compact-lines li').count(), count)
          assert.equal(await p.locator('.wt-editor-content').isVisible(), false)
          assert.equal(
            await button('Ver detalle / Editar ítems').getAttribute('aria-expanded'),
            'false'
          )
          assert.equal(
            await summary.locator('.wt-compact-totals dd').last().innerText(),
            count === 4 ? '$11.900 CLP' : count === 8 ? '$44.030 CLP' : '$94.010 CLP'
          )
          const height = await summary
            .locator('.wt-compact-lines')
            .evaluate((e) => e.getBoundingClientRect().height)
          assert.ok(height < count * 135, 'compact row height')
          await capture(`COTIZACION_${count}`)
        } else {
          assert.equal(await summary.isVisible(), false)
          assert.equal(await p.locator('.wt-items tbody tr').count(), count)
          await capture(`COTIZACION_${count}`)
        }
        if (count === 4) {
          await expand()
          await p.getByRole('button', { name: 'Editar ítem 1', exact: true }).click()
          await p.getByLabel('Cantidad del ítem').fill('2')
          await button('Guardar ítem DEMO').click()
          assert.equal(await p.locator('.wt-metric-total').innerText(), '$13.090 CLP')
          await collapse()
        }
      }
      await expand()
      assert.equal(await button('Cargar plantilla').isVisible(), true)
      await p
        .getByLabel('Condiciones comerciales', { exact: true })
        .fill('Condiciones DEMO de muestra; no hay cobros, envío ni autorización contractual.')
      await p
        .getByLabel('Comentarios técnicos', { exact: true })
        .fill('Revisión de muestra del taller para QA, sin datos reales.')
      const quoteId = await p.locator('.wt-metric').nth(1).locator('strong').innerText()
      await back()
      await step(4)
      await confirmProposal()
      await button('Confirmar revisión de cotización').click()
      await p.getByRole('checkbox', { name: /Confirmo que revisé expresamente partidas/ }).check()
      await button('Confirmar cotización revisada DEMO').click()
      await button('Registrar respuesta DEMO').click()
      await p.getByLabel('Resultado simulado', { exact: true }).selectOption('aceptada_demo')
      await p
        .getByRole('checkbox', { name: /Confirmo que registro una respuesta simulada/ })
        .check()
      await button('Confirmar respuesta simulada').click()
      if (process.env.QA_INCREMENT === 'A') {
        results.push({ width, compactCounts: [4, 8, 12], errors, writes })
        await p.close()
        continue
      }
      await button('Continuar a trabajos').click()
      await button('Preparar trabajo desde cotización').click()
      await p.getByRole('checkbox', { name: /Confirmo la precarga/ }).check()
      await button('Confirmar precarga DEMO').click()
      assert.equal(await p.getByRole('checkbox', { name: /^Realizado:/ }).count(), 12)
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$0 CLP')
      for (const c of (await p.getByRole('checkbox', { name: /^Realizado:/ }).all()).slice(0, 4))
        await c.check()
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$13.090 CLP')
      await button('Imprimir / Guardar como PDF').click()
      assert.equal(await p.locator('dialog .wt-paper table').first().locator('tbody tr').count(), 4)
      assert.doesNotMatch(await p.locator('dialog .wt-paper').innerText(), /Partida ficticia QA 5/)
      await p.pdf({
        format: 'A4',
        printBackground: true,
        path: path.join(output, `BT_QA_02_INFORME_4_${width}.pdf`)
      })
      await p.getByRole('dialog').getByRole('button', { name: 'Cerrar', exact: true }).click()
      await button('Finalizar DEMO').click()
      await p.getByRole('checkbox', { name: /Entiendo que es una simulación DEMO/ }).check()
      await button('Confirmar finalización DEMO').click()
      await back()
      await step(7)
      const options = button('Opciones de visita')
      assert.equal(await options.getAttribute('aria-expanded'), 'false')
      assert.equal(await button('Cancelar visita DEMO').isVisible(), false)
      await options.focus()
      await p.keyboard.press('Enter')
      assert.equal(await options.getAttribute('aria-expanded'), 'true')
      await p.keyboard.press('Escape')
      assert.equal(await options.getAttribute('aria-expanded'), 'false')
      await options.click()
      await button('Cancelar visita DEMO').click()
      assert.equal(await button('Confirmar cancelación DEMO').isDisabled(), true)
      await p.keyboard.press('Escape')
      assert.match(await p.locator('.fl-lifecycle').innerText(), /En curso/)
      await options.click()
      await button('Registrar espera DEMO').click()
      await p.getByLabel('Describe qué falta').fill('Repuestos ficticios pendientes de llegada.')
      await p.getByRole('checkbox', { name: /Confirmo expresamente esta decisión DEMO/ }).check()
      await button('Confirmar espera DEMO').click()
      await p.waitForFunction(() => document.activeElement?.textContent?.includes('Opciones de visita'))
      assert.equal(await options.getAttribute('aria-expanded'), 'false')
      assert.equal(await button('Resolver pausa').isVisible(), true)
      assert.equal(await button('Revisar y confirmar entrega DEMO').isDisabled(), true)
      await capture('PAUSA')
      await button('Resolver pausa').click()
      await p.getByLabel('¿Cómo se resolvió?').fill('Se recibieron los repuestos ficticios.')
      await p.getByRole('checkbox', { name: /Confirmo expresamente esta decisión DEMO/ }).check()
      await button('Confirmar solución DEMO').click()
      for (const c of await p.locator('.fl-delivery-checks input').all()) await c.check()
      await p
        .getByLabel('Explicación de pendientes')
        .fill('Se explicaron ocho trabajos no ejecutados y los controles no revisados.')
      await p
        .getByLabel('Observación final de entrega')
        .fill('Entrega ficticia revisada por operador QA DEMO.')
      await button('Revisar y confirmar entrega DEMO').click()
      await p.getByRole('checkbox', { name: /Confirmo expresamente el cierre ficticio/ }).check()
      await button('Finalizar entrega DEMO').click()
      assert.match(await p.locator('.fl-stage-content').innerText(), /Entrega DEMO completada/)
      await capture('ENTREGA')
      assert.doesNotMatch(
        await p.locator('.fl-pill').innerText(),
        /en_curso|completado|pendiente|bloqueado/
      )

      if (width === 390) {
        await step(5)
        await button('Revisar cotización').click()
        await expand()
        while (await p.locator('.wt-items tbody tr').count()) {
          await p
            .locator('.wt-items tbody tr')
            .first()
            .getByRole('button', { name: /Eliminar ítem/ })
            .click()
          await button('Confirmar eliminación').click()
        }
        await collapse()
        assert.match(await summary.innerText(), /Sin partidas/)
        assert.equal(await summary.locator('.wt-compact-totals dd').last().innerText(), '$0 CLP')
        await capture('COTIZACION_VACIA')
        await expand()
        await add(1)
        await collapse()
        assert.equal(await summary.locator('.wt-compact-lines li').count(), 1)
        assert.equal(
          await summary.locator('.wt-compact-totals dd').last().innerText(),
          '$1.190 CLP'
        )
        await back()
        assert.match(await p.locator('.fl-lifecycle').innerText(), /Cierre requiere revisión/)
      }
      for (let n = 1; n < 5; n++) {
        await nav().nth(n).click()
        await back()
      }
      assert.deepEqual(errors, [])
      assert.deepEqual(writes, [])
      assert.deepEqual(await p.evaluate(() => window.__storageWrites), [])
      assert.deepEqual(await p.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0])
      await noOverflow()
      await p.reload()
      assert.equal(await p.locator('.fl-case-row').count(), 8)
      results.push({
        width,
        quoteId,
        compactCounts: [4, 8, 12],
        delivery: true,
        networkWrites: 0,
        persistentWrites: 0,
        pageErrors: 0
      })
      console.log('QA02 PASS', width)
      await p.close()
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n')
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
