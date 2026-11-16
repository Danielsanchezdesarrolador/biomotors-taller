// CP06: actual React/SDK, strictly intercepted synthetic HTTP. No hosted data access.
const { chromium } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('node:fs')
const { cp04Page, uuid, tenant, userId } = require('../tests/harness/cp04BrowserFixture.cjs')
;(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox']
  })
  const out = process.env.OUTPUT_DIR || 'artifacts/cp06'
  fs.mkdirSync(out, { recursive: true })
  const results = []
  try {
    for (const width of [1440, 390, 375]) {
      const { p, state, requests, errors } = await cp04Page(browser, width)
      const vehicle = state.vehicles[0],
        at = '2026-11-16T12:00:00.000Z'
      state.orders = Array.from({ length: 45 }, (_, i) => ({
        id: uuid(1000 + i),
        workshop_id: tenant,
        vehicle_id: vehicle.id,
        complaint: `Motivo declarado en visita ${i + 1}`,
        intake_odometer: 78520 - i * 100,
        status: 'closed',
        opened_by: userId,
        opened_at: new Date(Date.parse(at) - Math.max(0, i - 1) * 86400000).toISOString(),
        closed_at: at,
        updated_at: at
      }))
      const old = state.orders[44]
      state.findings = Array.from({ length: 25 }, (_, i) => ({
        id: uuid(2000 + i),
        workshop_id: tenant,
        vehicle_id: vehicle.id,
        order_id: old.id,
        category: 'Frenos',
        result: 'attention',
        resolution: 'pending',
        note: `Pendiente de visita anterior ${i + 1}`,
        created_at: old.opened_at,
        updated_at: old.opened_at,
        resolved_at: null,
        recorded_by: userId
      }))
      state.findings.push({
        ...state.findings[0],
        id: uuid(2100),
        order_id: state.orders[0].id,
        resolution: 'resolved',
        resolved_at: at,
        note: 'Resolución registrada por el operador'
      })
      const customers = [
        {
          id: vehicle.customer_id,
          workshop_id: tenant,
          full_name: 'Cliente sintético CP06',
          email: null,
          mobile_e164: null,
          notes: null,
          archived_at: null,
          created_at: at,
          updated_at: at
        }
      ]
      let failVisits = false,
        slow = false
      await p.route('https://suxcqqnmcjoezfxltoms.supabase.co/rest/v1/**', async (route) => {
        const req = route.request(),
          url = new URL(req.url()),
          table = url.pathname.split('/').pop()
        assert.ok(
          !/quote|storage|functions/i.test(url.pathname),
          'CP05 OFF must never query quote tables'
        )
        if (!['work_orders', 'inspection_findings', 'customers'].includes(table))
          return route.fallback()
        requests.push({ path: url.pathname, method: req.method() })
        assert.equal(req.method(), 'GET')
        assert.equal(url.searchParams.get('workshop_id'), 'eq.' + tenant)
        if (table === 'work_orders' && url.searchParams.has('vehicle_id')) {
          if (slow) await new Promise((r) => setTimeout(r, 650))
          if (failVisits)
            return route.fulfill({
              status: 503,
              contentType: 'application/json',
              body: JSON.stringify({ code: 'SYNTHETIC_OFFLINE' })
            })
        }
        let rows = (
          table === 'customers'
            ? customers
            : table === 'work_orders'
              ? state.orders
              : state.findings
        ).filter((row) =>
          [...url.searchParams].every(([k, v]) =>
            v.startsWith('eq.')
              ? String(row[k]) === v.slice(3)
              : v.startsWith('in.(')
                ? v.slice(4, -1).split(',').includes(row[k])
                : true
          )
        )
        const orders = (url.searchParams.get('order') || '').split(',')
        const col = orders[0]?.split('.')[0]
        if (col)
          rows = [...rows].sort(
            (a, b) => String(b[col]).localeCompare(String(a[col])) || b.id.localeCompare(a.id)
          )
        const filter = url.searchParams.get('or')
        if (filter) {
          const at = filter.split('.lt.')[1].split(',')[0],
            id = filter.match(/,id\.lt\.([a-f0-9-]+)/)[1]
          rows = rows.filter((r) => r[col] < at || (r[col] === at && r.id < id))
        }
        rows = rows.slice(0, Number(url.searchParams.get('limit') || 1000))
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            req.headers().accept?.includes('vnd.pgrst.object') ? rows[0] || null : rows
          )
        })
      })
      const nav = () => p.locator(width > 760 ? '.side-nav button' : '.bottom-nav button')
      async function selectVehicle() {
        await nav().nth(2).click()
        await p.locator('.cp03-result').first().click()
        await p.getByRole('heading', { name: 'Vehículos vinculados' }).waitFor()
        await p.locator('.cp03-result').filter({ hasText: 'QA1234' }).first().click()
        await p.getByRole('button', { name: 'Ver historial', exact: true }).click()
        await p.locator('.cp06-visit').nth(19).waitFor()
      }
      await selectVehicle()
      assert.equal(await p.locator('.cp06-visit').count(), 20)
      assert.equal(await p.locator('.cp06-pending li').count(), 20)
      assert.match(await p.locator('.cp06-history').innerText(), /Resolución registrada/)
      assert.match(await p.locator('.cp06-history').innerText(), /El cierre no acredita/)
      await p.getByRole('button', { name: 'Mostrar más pendientes' }).click()
      await p.locator('.cp06-pending li').nth(24).waitFor()
      failVisits = true
      await p.getByRole('button', { name: 'Mostrar más visitas' }).click()
      await p.locator('.cp06-error').waitFor()
      assert.equal(await p.locator('.cp06-visit').count(), 20)
      failVisits = false
      await p.getByRole('button', { name: 'Reintentar consulta' }).click()
      await p.locator('.cp06-visit').nth(39).waitFor()
      await p.getByRole('button', { name: 'Mostrar más visitas' }).click()
      await p.locator('.cp06-visit').nth(44).waitFor()
      assert.equal(await p.getByRole('button', { name: 'Mostrar más visitas' }).count(), 0)
      assert.ok(
        await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        'overflow ' + width
      )
      await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await p.screenshot({ path: `${out}/historial-${width}.png`, fullPage: true })
      await p.locator('.cp06-visit').first().scrollIntoViewIfNeeded()
      await p.screenshot({ path: `${out}/cronologia-${width}.png` })
      if (width === 390) {
        await p.locator('.cp06-pending button').first().click()
        await p.locator('.cp04-detail').waitFor()
        assert.match(await p.locator('.cp04-detail').innerText(), /Motivo declarado en visita 45/)
        await p.getByRole('button', { name: 'Volver al historial del vehículo' }).click()
        await p.locator('.cp06-visit').nth(19).waitFor()
        await p.getByRole('button', { name: 'Volver a la ficha del vehículo' }).click()
        await p.getByRole('button', { name: 'Ver historial', exact: true }).waitFor()
        assert.match(await p.locator('.cp03-vehicle').innerText(), /QA1234/)
        await p.getByRole('button', { name: 'Cerrar sesión', exact: true }).first().click()
        assert.equal(await p.locator('.cp06-history').count(), 0)
        await p.getByLabel('Correo electrónico', { exact: true }).fill('cp04-browser@invalid.test')
        await p.getByLabel('Contraseña', { exact: true }).fill('synthetic-password-only')
        await p.getByRole('button', { name: 'Ingresar', exact: true }).click()
        await selectVehicle()
        assert.equal(await p.locator('.cp06-visit').count(), 20)
        state.orders = []
        state.findings = []
        await p.getByRole('button', { name: 'Actualizar historial' }).click()
        await p.locator('.cp06-empty').waitFor()
        await p.screenshot({ path: `${out}/vacio-390.png`, fullPage: true })
        failVisits = true
        await p.getByRole('button', { name: 'Actualizar historial' }).click()
        await p.locator('.cp06-error').waitFor()
        assert.equal(await p.locator('.cp06-visit').count(), 0)
        await p.screenshot({ path: `${out}/error-390.png`, fullPage: true })
        failVisits = false
        slow = true
        await p.getByRole('button', { name: 'Reintentar consulta' }).click()
        await p.getByRole('button', { name: 'Volver a la ficha del vehículo' }).click()
        await p.waitForTimeout(800)
        assert.equal(await p.locator('.cp06-history').count(), 0)
        slow = false
        await p.getByRole('button', { name: 'Ver historial', exact: true }).click()
        await p.locator('.cp06-empty').waitFor()
        state.revoked = true
        await p.getByRole('button', { name: 'Actualizar historial' }).click()
        await p.locator('.cp06-history').waitFor({ state: 'hidden' })
      }
      assert.equal(errors.length, 0, errors.join('\n'))
      assert.ok(!requests.some((r) => r.method !== 'GET' && r.path.startsWith('/rest/')))
      results.push({
        width,
        visits: 45,
        pending: 25,
        cp05Requests: 0,
        writes: 0,
        overflow: false,
        http: 'synthetic',
        errors
      })
      await p.close()
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results))
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
