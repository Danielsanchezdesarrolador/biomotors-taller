// Run Vite on 5173. All entities and checks are DEMO, with no backend.
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
  const output = process.env.OUTPUT_DIR || 'artifacts/bt-flow-01',
    results = []
  fs.mkdirSync(output, { recursive: true })
  try {
    for (const width of JSON.parse(process.env.FLOW_WIDTHS || '[1650,1440,768,390,375]')) {
      const p = await browser.newPage({ viewport: { width, height: 941 } }),
        errors = [],
        writes = []
      p.on('pageerror', (e) => errors.push(e.message))
      p.on('request', (r) => {
        if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url())
      })
      const nav = () => p.locator(width > 760 ? '.side-nav button' : '.bottom-nav button'),
        back = () => p.getByRole('button', { name: 'Volver al expediente', exact: false }),
        noOverflow = async () =>
          assert.equal(
            await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
            false
          )
      const capture = async (name) => {
        if ([1650, 390].includes(width)) {
          await p.evaluate(() => scrollTo(0, 0))
          await p.evaluate(
            () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
          )
          await p.screenshot({
            path: path.join(output, `BT_FLOW_01_${name}_${width}.png`),
            fullPage: true
          })
        }
      }
      async function newReception(name, email) {
        await p.getByRole('button', { name: 'Nuevo ingreso de vehículo', exact: true }).click()
        await p.getByRole('button', { name: 'Registrar cliente nuevo DEMO', exact: true }).click()
        await p.getByLabel('Nombre completo DEMO', { exact: true }).fill(name)
        await p.getByLabel('Teléfono DEMO', { exact: true }).fill('+56 9 0000 0090')
        await p.getByLabel('Correo DEMO', { exact: true }).fill(email)
        await p.getByLabel('Marca DEMO', { exact: true }).fill('Toyota')
        await p.getByLabel('Modelo DEMO', { exact: true }).fill('Yaris')
        await p.getByLabel('Año', { exact: true }).fill('2020')
      }
      async function receptionStep2(reason, mileage = '50000') {
        await p.getByRole('button', { name: 'Continuar', exact: true }).click()
        await p.getByLabel('Kilometraje actual del ingreso', { exact: true }).fill(mileage)
        await p.getByLabel('Motivo declarado por el cliente', { exact: true }).fill(reason)
        await p.getByRole('checkbox', { name: /Confirmo que usaré solo datos ficticios/ }).check()
        await p.getByRole('button', { name: 'Continuar', exact: true }).click()
        await p.getByRole('button', { name: 'Confirmar recepción DEMO', exact: true }).click()
        await p.getByRole('heading', { name: 'Expediente de visita · DEMO', exact: true }).waitFor()
      }
      async function confirmOrder() {
        await p.getByRole('button', { name: 'Crear orden de trabajo', exact: true }).click()
        await p.getByRole('button', { name: 'Confirmar creación de OT DEMO', exact: true }).click()
        await p.getByRole('button', { name: 'Iniciar inspección', exact: true }).waitFor()
        return p.locator('.fl-case-summary>div').nth(4).locator('strong').innerText()
      }
      await p.goto(process.env.BASE_URL || 'http://localhost:5173')
      assert.equal(await p.locator('.fl-case-row').count(), 8)
      if (width <= 760) {
        assert.equal(await p.locator('.fl-case-row:visible').count(), 4)
        const expand = p.getByRole('button', { name: 'Ver todos los trabajos (8)', exact: true })
        assert.equal(await expand.getAttribute('aria-expanded'), 'false')
        await expand.click()
        assert.equal(await p.locator('.fl-case-row:visible').count(), 8)
        await p.getByRole('button', { name: 'Mostrar menos trabajos', exact: true }).click()
        assert.equal(await p.locator('.fl-case-row:visible').count(), 4)
      } else {
        assert.equal(await p.locator('.fl-case-row:visible').count(), 8)
      }
      await noOverflow()
      await capture('INICIO')
      const name = `Cliente flujo ${width} DEMO`,
        email = `flujo${width}@example.com`,
        reason = 'Motivo original de prueba: revisar vibración al frenar.'
      await newReception(name, email)
      await capture('INGRESO')
      await p.getByRole('button', { name: 'Guardar borrador y salir', exact: true }).click()
      if(width===1650){
        await nav().nth(2).click()
        await p.locator('.cv-intake-item').first().getByRole('button',{name:'Revisar ingreso',exact:true}).click()
        assert.equal(await p.getByLabel('Nombre completo DEMO').inputValue(),'Cliente demo A')
        await p.getByRole('button',{name:'Guardar borrador y salir',exact:true}).click()
      }
      await nav().nth(4).click()
      await nav().nth(0).click()
      await p.getByRole('button', { name: 'Nuevo ingreso de vehículo', exact: true }).click()
      assert.equal(await p.getByLabel('Nombre completo DEMO').inputValue(), name)
      await receptionStep2(reason)
      assert.match(await p.locator('.fl-case-summary').innerText(), /Sin crear/)
      const visit = await p.locator('.fl-heading p').innerText()
      assert.match(visit, /Ref\. [A-Z0-9-]{8} · Memoria temporal/)
      if (width <= 760) {
        await p.getByText('Desliza los hitos para ver las 7 etapas').waitFor()
        await p.locator('.fl-milestones button').last().scrollIntoViewIfNeeded()
        assert.equal(await nav().count(), 5)
      }
      const orderId = await confirmOrder()
      assert.match(orderId, /^OT-DEMO-/)
      await capture('EXPEDIENTE')
      await noOverflow()
      await p.getByRole('button', { name: 'Iniciar inspección', exact: true }).click()
      await p.locator('.mp-panel').waitFor()
      assert.match(await p.locator('.mp-summary').innerText(), new RegExp(name))
      assert.match(await p.locator('.mp-sheet').first().innerText(), new RegExp(orderId))
      const reportId = await p.locator('.mp-number strong').first().innerText()
      await p
        .locator('.mp-edit-sheet [data-item="neblina"]')
        .getByRole('radio', { name: /Requiere atención$/ })
        .check()
      await p.locator('#mp-observations').fill('Observación propia de esta visita DEMO.')
      await p.getByRole('button', { name: 'Guardar borrador', exact: true }).click()
      await nav().nth(4).click()
      await back().click()
      assert.match(await p.locator('.fl-case-summary').innerText(), new RegExp(orderId))
      await p.getByRole('button', { name: 'Continuar inspección', exact: true }).click()
      assert.equal(await p.locator('.mp-number strong').first().innerText(), reportId)
      assert.equal(
        await p
          .locator('.mp-edit-sheet [data-item="neblina"]')
          .getByRole('radio', { name: /Requiere atención$/ })
          .isChecked(),
        true
      )
      assert.equal(
        await p.locator('#mp-observations').inputValue(),
        'Observación propia de esta visita DEMO.'
      )
      await nav().nth(1).click()
      const ot = p.getByRole('button', { name: 'Abrir ' + orderId, exact: true })
      if (await ot.isVisible()) await ot.click()
      else await p.locator('.bt-ot-mobile-order').filter({ hasText: orderId }).click()
      assert.match(await p.locator('.od-summary').innerText(), new RegExp(name))
      await back().click()
      await p.locator('.fl-milestones button').nth(4).click()
      await p.getByRole('button', { name: 'Preparar cotización', exact: true }).click()
      await p.locator('.wt-panel').waitFor()
      assert.match(await p.locator('.wt-identity').innerText(), new RegExp(name))
      assert.match(await p.locator('.wt-identity').innerText(), new RegExp(orderId))
      assert.equal(await p.locator('.wt-items tbody tr').count(), 0)
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$0 CLP')
      const quoteId = await p.locator('.wt-metric').nth(1).locator('strong').innerText()
      await p.getByRole('button', { name: 'Agregar ítem', exact: true }).click()
      await p.getByLabel('Descripción del ítem').fill('Repuesto decidido por operador DEMO')
      await p.getByLabel('Cantidad del ítem').fill('2')
      await p.getByLabel('Precio del ítem').fill('10000')
      await p.getByRole('button', { name: 'Guardar ítem DEMO' }).click()
      await p
        .getByLabel('Comentarios técnicos', { exact: true })
        .fill('Sin trabajo automáticamente realizado.')
      await p.getByRole('button', { name: 'Guardar borrador', exact: true }).click()
      await nav().nth(2).click()
      await p.getByLabel('Buscar cliente', { exact: true }).fill(name)
      await p.getByRole('button', { name: 'Seleccionar ' + name, exact: true }).click()
      assert.match(await p.locator('.cv-vehicle').innerText(), /Toyota Yaris/)
      await back().click()
      await p.getByRole('button', { name: 'Continuar cotización', exact: true }).click()
      assert.equal(await p.locator('.wt-metric').nth(1).locator('strong').innerText(), quoteId)
      assert.equal(await p.locator('.wt-metric-total').innerText(), '$23.800 CLP')
      assert.equal(
        await p.getByLabel('Comentarios técnicos').inputValue(),
        'Sin trabajo automáticamente realizado.'
      )
      await back().click()
      await p.locator('.fl-milestones button').nth(6).click()
      assert.equal(
        await p
          .getByRole('button', { name: 'Cierre guiado pendiente 01E', exact: true })
          .isEnabled(),
        false
      )
      assert.match(await p.locator('.fl-stage-content').innerText(), /no se ha finalizado/)
      await p.getByRole('button', { name: 'Volver al Inicio guiado', exact: true }).click()
      // Recurrent vehicle: same explicit IDs, distinct visit, unchanged prior reception.
      await p.getByRole('button', { name: 'Nuevo ingreso de vehículo', exact: true }).click()
      await p.getByLabel('Buscar cliente del ingreso').fill(name)
      await p
        .getByLabel('Cliente registrado', { exact: true })
        .selectOption({ label: `${name} · ${email}` })
      const clientId = await p.getByLabel('Cliente registrado').inputValue(),
        vehicleId = await p.getByLabel('Vehículo del cliente').inputValue()
      assert.ok(clientId && vehicleId)
      await receptionStep2('Segunda visita: otro motivo declarado.', '51000')
      assert.notEqual(await p.locator('.fl-heading p').innerText(), visit)
      const order2 = await confirmOrder()
      assert.notEqual(order2, orderId)
      await nav().nth(2).click()
      await p.getByLabel('Buscar cliente', { exact: true }).fill(name)
      await p.getByRole('button', { name: 'Seleccionar ' + name, exact: true }).click()
      await p.getByRole('button', { name: 'Ver ficha completa', exact: false }).click()
      assert.match(await p.getByRole('dialog').innerText(), new RegExp(orderId))
      assert.match(await p.getByRole('dialog').innerText(), new RegExp(order2))
      await p.keyboard.press('Escape')
      // Structured request is reused, with a fresh human confirmation of its relationship.
      await p.getByRole('button', { name: 'Generar enlace de registro', exact: true }).click()
      await p.getByRole('button', { name: 'Abrir formulario público DEMO', exact: true }).click()
      const rn = `Solicitud flujo ${width} DEMO`
      await p.getByLabel(/^Nombre completo \*/).fill(rn)
      await p.getByLabel(/^Correo electrónico \*/).fill(`solflujo${width}@example.com`)
      await p.getByLabel(/^Teléfono \*/).fill('+56 9 0000 0088')
      await p.getByRole('dialog').getByRole('checkbox').check()
      await p.getByRole('dialog').getByRole('button', { name: 'Continuar', exact: true }).click()
      await p.getByLabel(/^Marca \*/).fill('Suzuki')
      await p.getByLabel(/^Modelo \*/).fill('Swift')
      await p.getByLabel(/^Año \*/).fill('2021')
      await p.getByLabel(/^Kilometraje actual \*/).fill('40000')
      await p.getByRole('dialog').getByRole('button', { name: 'Continuar', exact: true }).click()
      await p.locator('#btreg-reason').fill('Solicitud original para revisión preventiva.')
      await p.getByRole('button', { name: 'Revisar datos', exact: true }).click()
      await p.getByRole('button', { name: 'Finalizar simulación', exact: true }).click()
      await p.getByRole('button', { name: 'Cerrar / cancelar', exact: true }).click()
      const request = p.locator('.cv-intake-item').filter({ hasText: rn })
      await request.getByRole('button', { name: 'Revisar ingreso', exact: true }).click()
      assert.equal(await p.getByLabel('Correo DEMO').inputValue(), `solflujo${width}@example.com`)
      assert.equal(await p.getByLabel('Marca DEMO').inputValue(), 'Suzuki')
      await receptionStep2('Solicitud original para revisión preventiva.', '40000')
      const requestOrder = await confirmOrder()
      await nav().nth(2).click()
      const converted = p.locator('.cv-intake-item').filter({ hasText: rn })
      assert.match(await converted.innerText(), /Recepción vinculada/)
      await converted.getByRole('button', { name: 'Abrir expediente', exact: true }).click()
      assert.match(await p.locator('.fl-case-summary').innerText(), new RegExp(requestOrder))
      await noOverflow()
      assert.equal(await nav().count(), 5)
      assert.deepEqual(writes, [])
      assert.deepEqual(errors, [])
      assert.deepEqual(
        await p.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
        { local: 0, session: 0 }
      )
      await p.reload()
      assert.equal(await p.locator('.fl-case-row').count(), 8)
      await nav().nth(2).click()
      await p.getByLabel('Buscar cliente', { exact: true }).fill(name)
      assert.equal(
        await p.getByRole('button', { name: 'Seleccionar ' + name, exact: true }).count(),
        0
      )
      results.push({
        width,
        status: 'PASS',
        networkWrites: writes,
        pageErrors: errors,
        webStorage: false
      })
      console.log(
        `BT-FLOW-01B/C ${width}: PASS — reception, recurring visits, requests, IDs/OT, continuity, exact resources, five panels, no writes/storage`
      )
      await p.close()
    }
  } finally {
    fs.writeFileSync(
      path.join(output, 'BT_FLOW_01_RESULTADOS.json'),
      JSON.stringify(results, null, 2)
    )
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
