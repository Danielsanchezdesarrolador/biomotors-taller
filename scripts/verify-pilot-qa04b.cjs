const {navigateSection}=require('../tests/harness/navigation.cjs')
// BT-PILOT-QA-04B: browser integration with real CP03/CP04 UI and synthetic HTTP.
// All outbound Supabase URLs are intercepted by cp04BrowserFixture. No production connection.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { cp04Page, uuid, tenant, userId } = require('../tests/harness/cp04BrowserFixture.cjs')
const out = process.env.OUTPUT_DIR || 'artifacts/bt-pilot-qa04b'
const at = '2026-11-15T14:30:00Z'
const results = []
function writes(requests, table, method = 'POST') {
  return requests.filter((r) => r.path === '/rest/v1/' + table && r.method === method).length
}
async function assertNoPageErrors(errors) { assert.deepEqual(errors, []) }
async function openDirectory(p, width) {
  await navigateSection(p,'clientes')
  await p.locator('.cp03-pilot').waitFor()
  await p.getByRole('button', { name: 'Nuevo cliente' }).waitFor()
}
async function createCustomer(p, name) {
  await p.getByRole('button', { name: 'Nuevo cliente' }).click()
  await p.getByLabel('Nombre completo *').fill(name)
  await p.getByRole('checkbox', { name: /Confirmo que tengo autorización/ }).check()
  await p.getByRole('button', { name: 'Guardar ficha de cliente' }).click()
}
async function createOrder(p, plate, reason) {
  await p.getByLabel('Buscar patente registrada').fill(plate)
  await p.getByRole('button', { name: 'Buscar vehículo' }).click()
  await p.locator('.cp04-found').waitFor()
  await p.getByLabel('Motivo de ingreso *').fill(reason)
  await p.getByRole('button', { name: 'Guardar orden' }).click()
}
async function run(browser, id, width, task) {
  const ctx = await cp04Page(browser, width, { injectFault: id })
  const { p, state, requests, errors } = ctx
  try {
    await task(ctx)
    await assertNoPageErrors(errors)
    // A fixture cannot be accidentally mistaken for a production result.
    assert.ok(requests.every((req) => req.path.startsWith('/auth/v1/') || req.path.startsWith('/rest/v1/')))
    await p.screenshot({ path: out + '/' + id + '-' + width + '.png', fullPage: true })
    results.push({ id, width, status: 'PASS', scope: 'synthetic HTTP + browser, NOT Supabase hosted' })
    console.log('BT-PILOT-QA-04B', id, width, 'PASS')
  } finally { await p.close() }
}
;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch({
    executablePath: fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
    args: ['--no-sandbox']
  })
  try {
    for (const width of [390, 1366]) {
      await run(browser, 'F01', width, async ({ p, state, requests }) => {
        await openDirectory(p, width)
        await createCustomer(p, 'Cliente F01 Sintético')
        await p.getByText(/Ficha guardada en el servidor\. No pudimos actualizar todos los listados/).waitFor()
        assert.equal(state.customers.length, 1)
        assert.equal(writes(requests, 'customers'), 1)
        assert.equal(await p.locator('.cp03-editor').count(), 0, 'confirmed form must close')
        assert.match(await p.locator('[aria-label="Ficha seleccionada"]').innerText(), /Cliente F01 Sintético/)
        state.failVehiclesRead = false
        await p.getByLabel('Buscar por nombre, teléfono, correo o patente').fill('Cliente F01')
        await p.getByRole('button', { name: 'Buscar', exact: true }).click()
        await p.getByRole('button', { name: /Cliente F01 Sintético/ }).first().waitFor()
        assert.equal(writes(requests, 'customers'), 1, 'read retry must not create another customer')
      })
      await run(browser, 'F02', width, async ({ p, state, requests }) => {
        state.injectFault = null
        await openDirectory(p, width)
        await createCustomer(p, 'Cliente F02 Sintético')
        await p.getByText('Ficha confirmada por el servidor.').waitFor()
        state.injectFault = 'F02'
        await p.getByRole('button', { name: 'Agregar vehículo' }).click()
        await p.locator('.cp03-editor').getByLabel('Patente', { exact: true }).fill('QA-F02')
        await p.getByLabel('Marca *').fill('Kia')
        await p.getByLabel('Modelo *').fill('Rio')
        await p.getByRole('button', { name: 'Guardar ficha del vehículo' }).click()
        await p.getByText(/Vehículo guardado en el servidor\. No pudimos actualizar la lista/).waitFor()
        assert.equal(state.vehicles.filter((v) => v.plate === 'QA-F02').length, 1)
        assert.equal(writes(requests, 'vehicles'), 1)
        assert.equal(await p.locator('.cp03-editor').count(), 0)
        assert.match(await p.locator('.cp03-vehicle').innerText(), /QA-F02/)
      })
      await run(browser, 'F03', width, async ({ p, state, requests }) => {
        await createOrder(p, 'QA1234', 'Orden sintética guardada con recarga fallida')
        await p.getByText(/Orden guardada en el servidor\. La actualización de la pantalla está pendiente/).waitFor()
        assert.equal(state.orders.length, 6)
        const stored = state.orders[5].id
        assert.equal(writes(requests, 'work_orders'), 1)
        assert.equal(await p.getByLabel('Motivo de ingreso *').inputValue(), '')
        assert.equal(await p.getByText('Guardar orden', { exact: true }).count(), 1)
        state.failList = false
        state.failOrderDetail = false
        await p.getByRole('button', { name: 'Actualizar', exact: true }).click()
        await p.getByText('Recientes (6)').waitFor()
        assert.equal(state.orders[5].id, stored)
        assert.equal(writes(requests, 'work_orders'), 1, 'refresh must not re-POST OT')
      })
      await run(browser, 'F04', width, async ({ p, state, requests }) => {
        await p.locator('.cp04-order').first().click()
        await p.locator('.cp04-detail').waitFor()
        await p.locator('.cp04-additional-finding summary').click()
        const findingForm = p.locator('.cp04-detail form.cp04-form')
        assert.equal(await findingForm.count(), 1, 'editable finding form must be present')
        await findingForm.locator('select').nth(1).selectOption('attention')
        await findingForm.locator('textarea').fill('Revisión de freno sintética')
        await p.getByRole('button', { name: 'Guardar punto de inspección' }).click()
        await p.getByText(/Inspección guardada en el servidor\. La lista está pendiente/).waitFor()
        assert.equal(state.findings.length, 1)
        assert.equal(writes(requests, 'inspection_findings'), 1)
        assert.equal(await p.locator('[data-detail-tab=history] .cp04-finding').count(), 1)
        state.failFindingReads = false
        await p.locator('.cp04-order').first().click()
        await p.getByRole('tab',{name:'Historial de diagnósticos',exact:true}).click()
        await p.getByRole('tabpanel',{name:'Historial de diagnósticos',exact:true}).locator('.cp04-finding').first().waitFor()
        assert.equal(state.findings.length, 1)
        assert.equal(writes(requests, 'inspection_findings'), 1)
      })
      await run(browser, 'F05', width, async ({ p, state, requests }) => {
        state.findings.push({
          id: uuid(790), workshop_id: tenant, order_id: uuid(200), vehicle_id: uuid(100),
          recorded_by: userId, category: 'Frenos', result: 'attention',
          note: 'Freno de prueba pendiente', resolution: 'pending', resolved_at: null,
          created_at: at, updated_at: at
        })
        await p.locator('.cp04-order').first().click()
        await p.getByRole('tab',{name:'Observaciones pendientes',exact:true}).click()
        await p.locator('.cp04-pending').first().waitFor()
        await p.getByRole('button', { name: 'Marcar resuelto' }).click()
        await p.getByText(/Observación resuelta en el servidor\. La lista está pendiente/).waitFor()
        assert.equal(state.findings[0].resolution, 'resolved')
        assert.equal(await p.locator('.cp04-pending').count(), 0)
        assert.equal(writes(requests, 'inspection_findings', 'PATCH'), 1)
        state.failFindingReads = false
        await p.locator('.cp04-order').first().click()
        await p.getByRole('tab',{name:'Historial de diagnósticos',exact:true}).click()
        await p.getByRole('tabpanel',{name:'Historial de diagnósticos',exact:true}).locator('.cp04-finding').first().waitFor()
        assert.equal(await p.locator('.cp04-pending').count(), 0)
        assert.equal(writes(requests, 'inspection_findings', 'PATCH'), 1)
      })
      await run(browser, 'F06', width, async ({ p, state, requests }) => {
        await createOrder(p, 'QA1234', 'Intento de escritura rechazada sintética')
        await p.locator('.cp04-error[role="alert"]').waitFor()
        assert.equal(state.orders.length, 5)
        assert.equal(writes(requests, 'work_orders'), 1)
        assert.equal(await p.locator('.cp04-success').count(), 0, 'unconfirmed write must not signal success')
        assert.match(await p.getByLabel('Motivo de ingreso *').inputValue(), /escritura rechazada/)
      })
    }
    fs.writeFileSync(out + '/results.json', JSON.stringify({ status: 'PASS', tests: results,
      note: 'F01-F06 browser synthetic only; R05-R08 manual steps not executed' }, null, 2) + '\n')
  } finally { await browser.close() }
})().catch((e) => { console.error(e); process.exitCode = 1 })
