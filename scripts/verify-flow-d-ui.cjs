// BT-FLOW-01D: real browser interactions with canonical DEMO documents only.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
;(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
    args: ['--no-sandbox']
  })
  const output = process.env.OUTPUT_DIR || 'artifacts/bt-flow-01d'
  fs.mkdirSync(output, { recursive: true })
  const results = []
  try {
    for (const width of JSON.parse(process.env.FLOW_WIDTHS || '[1650,1440,768,390,375]')) {
      const p = await browser.newPage({ viewport: { width, height: 941 } })
      await p.addInitScript(() => {
        window.__persistentWrites = []
        const setItem = Storage.prototype.setItem
        Storage.prototype.setItem = function (...args) {
          window.__persistentWrites.push('Storage.setItem')
          return setItem.apply(this, args)
        }
        const open = indexedDB.open.bind(indexedDB)
        indexedDB.open = (...args) => {
          window.__persistentWrites.push('indexedDB.open')
          return open(...args)
        }
      })
      const errors = [],
        writes = []
      p.on('pageerror', (e) => errors.push(e.message))
      p.on('request', (r) => {
        if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url())
      })
      const button = (name) => p.getByRole('button', { name, exact: true })
      const step = async (n) =>
        p
          .locator('.fl-milestones button')
          .nth(n - 1)
          .click()
      const back = async () => p.getByRole('button', { name: /Volver al expediente/ }).click()
      const nav = () => p.locator(width > 760 ? '.side-nav button' : '.bottom-nav button')
      const overflow = async () => {
        if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)) {
          await p.screenshot({ path: path.join(output, `overflow-${width}.png`), fullPage: true })
          console.log(
            await p.evaluate(() =>
              [...document.querySelectorAll('body *')]
                .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
                .slice(-15)
                .map((e) => ({
                  tag: e.tagName,
                  cls: e.className,
                  text: e.textContent.slice(0, 80),
                  right: e.getBoundingClientRect().right
                }))
            )
          )
          assert.fail('Horizontal overflow at ' + width)
        }
      }
      const capture = async (name) => {
        await overflow()
        if ([1650, 390].includes(width)) {
          await p.evaluate(() => scrollTo(0, 0))
          await p.screenshot({
            path: path.join(output, `BT_FLOW_01D_${name}_${width}.png`),
            fullPage: true
          })
        }
      }
      const confirmProposal = async () => {
        await button('Revisar y confirmar propuesta').click()
        assert.equal(await button('Confirmar propuesta DEMO').isDisabled(), true)
        await p
          .getByRole('checkbox', { name: /Confirmo que revisé expresamente el diagnóstico/ })
          .check()
        await button('Confirmar propuesta DEMO').click()
      }
      const reviewQuote = async () => {
        await button('Confirmar revisión de cotización').click()
        assert.equal(await button('Confirmar cotización revisada DEMO').isDisabled(), true)
        await p.getByRole('checkbox', { name: /Confirmo que revisé expresamente partidas/ }).check()
        await button('Confirmar cotización revisada DEMO').click()
      }
      const respond = async (decision, note, first = false) => {
        await button(first ? 'Registrar respuesta DEMO' : 'Registrar otra respuesta DEMO').click()
        assert.equal(await button('Confirmar respuesta simulada').isDisabled(), true)
        await p.getByLabel('Resultado simulado', { exact: true }).selectOption(decision)
        await p.getByLabel('Nota de la respuesta DEMO', { exact: true }).fill(note)
        await p
          .getByRole('checkbox', { name: /Confirmo que registro una respuesta simulada/ })
          .check()
        await button('Confirmar respuesta simulada').click()
      }
      const preload = async () => {
        await button('Preparar trabajo desde cotización').click()
        assert.equal(await button('Confirmar precarga DEMO').isDisabled(), true)
        assert.equal(await p.locator('dialog .fl-preload-list li').count(), 3)
        await p.getByRole('checkbox', { name: /Confirmo la precarga/ }).check()
        await button('Confirmar precarga DEMO').click()
        await p.locator('.wt-panel').waitFor()
      }
      await p.goto(process.env.BASE_URL || 'http://localhost:5173')
      await button('Continuar OT-1002').click()
      await button('Iniciar inspección').click()
      await p.getByLabel('Hora de inicio', { exact: true }).fill('09:00')
      await p.getByLabel('Hora de término', { exact: true }).fill('10:30')
      await p.getByLabel('Combustible', { exact: true }).fill('Gasolina DEMO')
      await button('Finalizar y enviar').click()
      await p.getByRole('checkbox', { name: /Acepto finalizar/ }).check()
      await button('Confirmar finalización sin envío real').click()
      await back()
      await step(4)
      await button('Definir trabajos').click()
      assert.equal(await p.locator('.wt-items tbody tr').count(), 3)
      await p
        .getByLabel('Diagnóstico profesional del mecánico', { exact: true })
        .fill(
          'Diagnóstico profesional confirmado: desgaste de frenos delanteros. Separado del motivo declarado.'
        )
      await p
        .getByLabel('Observaciones y trabajos pendientes', { exact: true })
        .fill('Comprobar prueba de ruta al terminar. No se marca realizada automáticamente.')
      await capture('PROPUESTA')
      await confirmProposal()
      await button('Preparar cotización').click()
      const quoteId = await p.locator('.wt-metric').nth(1).locator('strong').innerText()
      assert.equal(await p.locator('.wt-items tbody tr').count(), 3)
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$154.879 CLP')
      // Local document approval must never stand in for the separate client DEMO response.
      await button('Aprobar DEMO').click()
      await p.getByRole('checkbox', { name: /Entiendo que es una simulación DEMO/ }).check()
      await button('Confirmar aprobación simulada').click()
      await back()
      await step(6)
      assert.equal(await button('Preparar trabajo desde cotización').count(), 0)
      await step(5)
      await reviewQuote()
      await respond('rechazada_demo', 'Rechazo de prueba', true)
      await step(6)
      assert.equal(await button('Preparar trabajo desde cotización').count(), 0)
      await step(5)
      assert.match(await p.locator('.fl-response-history').innerText(), /Rechazada DEMO/)
      await respond('cambios_demo', 'Solicita corregir antecedentes')
      await step(6)
      assert.equal(await button('Preparar trabajo desde cotización').count(), 0)
      await step(5)
      await respond('aceptada_demo', 'Aceptación simulada revisada')
      assert.equal(await p.locator('.fl-response-history article').count(), 3)
      await capture('RESPUESTA')
      await button('Continuar a trabajos').click()
      await preload()
      const oldWorkId = await p.locator('.wt-metric').nth(1).locator('strong').innerText()
      assert.equal(await p.getByRole('checkbox', { name: /^Realizado:/ }).count(), 3)
      assert.equal(
        await p
          .getByRole('checkbox', { name: /^Realizado:/ })
          .evaluateAll((ns) => ns.every((n) => !n.checked)),
        true
      )
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$0 CLP')
      assert.match(await p.locator('.wt-panel').innerText(), new RegExp(quoteId))
      await p
        .getByRole('checkbox', { name: /^Realizado:/ })
        .first()
        .check()
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$62.951 CLP')
      await button('Imprimir / Guardar como PDF').click()
      assert.equal(await p.locator('dialog .wt-paper table').first().locator('tbody tr').count(), 1)
      assert.match(await p.locator('dialog .wt-paper').innerText(), /Pastillas/)
      assert.doesNotMatch(await p.locator('dialog .wt-paper').innerText(), /Rectificado de discos/)
      if (width === 1650) {
        await p.evaluate(() => {
          window.__prints = 0
          window.print = () => window.__prints++
        })
        await button('Imprimir documento / Guardar como PDF').click()
        assert.equal(await p.evaluate(() => window.__prints), 1)
        const pdf = await p.pdf({
          format: 'A4',
          printBackground: true,
          path: path.join(output, 'BT_FLOW_01D_REALIZADOS.pdf')
        })
        assert.equal(pdf.subarray(0, 4).toString(), '%PDF')
      }
      await p.locator('dialog').getByRole('button', { name: 'Cerrar', exact: true }).click()
      await capture('TRABAJOS')
      await button('Finalizar DEMO').click()
      await p.getByRole('checkbox', { name: /Entiendo que es una simulación DEMO/ }).check()
      await button('Confirmar finalización DEMO').click()
      await back()
      await step(6)
      await button('Revisar informe final').click()
      assert.equal(await p.locator('.wt-metric').nth(1).locator('strong').innerText(), oldWorkId)
      assert.equal(
        await p
          .getByRole('checkbox', { name: /^Realizado:/ })
          .first()
          .isChecked(),
        true
      )
      await back()
      await step(5)
      await button('Revisar cotización').click()
      await p
        .locator('.wt-items tbody tr')
        .first()
        .getByRole('button', { name: /Editar/ })
        .click()
      await p.getByLabel('Precio del ítem').fill('53000')
      await button('Guardar ítem DEMO').click()
      await back()
      assert.match(await p.getByRole('status').innerText(), /necesita nueva respuesta/)
      await capture('CADUCADA')
      await step(6)
      assert.equal(await button('Preparar trabajo desde cotización').count(), 0)
      assert.equal(await button('Revisar informe final').count(), 0)
      await step(4)
      await confirmProposal()
      await reviewQuote()
      assert.equal(await button('Registrar respuesta DEMO').count(), 1)
      await respond('aceptada_demo', 'Nueva revisión aceptada DEMO', true)
      assert.equal(await p.locator('.fl-response-history article').count(), 4)
      await button('Continuar a trabajos').click()
      await preload()
      const newWorkId = await p.locator('.wt-metric').nth(1).locator('strong').innerText()
      assert.notEqual(newWorkId, oldWorkId)
      assert.equal(
        await p
          .getByRole('checkbox', { name: /^Realizado:/ })
          .evaluateAll((ns) => ns.every((n) => !n.checked)),
        true
      )
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$0 CLP')
      await back()
      await step(7)
      assert.match(await p.locator('.fl-stage-content').innerText(), /01E/)
      await nav().nth(0).click()
      await button('Continuar OT-1001').click()
      await step(6)
      assert.equal(await button('Preparar trabajo desde cotización').count(), 0)
      for (let n = 0; n < 5; n++) {
        await nav().nth(n).click()
        if (n !== 0) await back()
      }
      await overflow()
      assert.deepEqual(
        await p.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
        { local: 0, session: 0 }
      )
      assert.deepEqual(await p.evaluate(() => window.__persistentWrites), [])
      assert.deepEqual(errors, [])
      assert.deepEqual(writes, [])
      results.push({
        width,
        status: 'PASS',
        quoteId,
        oldWorkId,
        newWorkId,
        networkWrites: writes.length,
        persistentStorage: 0,
        pageErrors: errors.length
      })
      console.log('PASS', width)
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
