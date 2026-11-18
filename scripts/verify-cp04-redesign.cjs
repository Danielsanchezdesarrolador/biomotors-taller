// Actual CP04 + official SDK; all Supabase HTTP is synthetic and intercepted.
const { chromium } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('node:fs')
const { cp04Page, uuid, tenant } = require('../tests/harness/cp04BrowserFixture.cjs')
;(async () => {
  const browser = await chromium.launch({
    executablePath: fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
    args: ['--no-sandbox']
  })
  const out = process.env.OUTPUT_DIR || 'artifacts/cp04-redesign',
    before = process.env.CP04_CAPTURE_BEFORE === 'true'
  fs.mkdirSync(out, { recursive: true })
  const results = []
  try {
    for (const width of before ? [1650, 390] : [360, 390, 430, 768, 1366, 1440, 1920]) {
      const { p, state, requests, errors } = await cp04Page(browser, width)
      await p.locator('.cp04-order').first().waitFor()
      await p.screenshot({
        path: `${out}/${before ? 'before' : 'after'}-${width}.png`,
        fullPage: true
      })
      if (!before) {
        assert.ok(
          await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          'horizontal overflow'
        )
        const metrics = p.locator('.cp04-metric strong')
        assert.deepEqual(await metrics.allTextContents(), ['4', '1', '1', '1'])
        assert.match(await p.locator('#cp04-metrics-scope').innerText(), /Hasta 40 registros/)
        assert.equal(await p.locator('.cp04-session').count(), 1)
        assert.deepEqual(await p.locator('.cp04-order .cp04-status').allTextContents(), [
          'Recibido',
          'En inspección',
          'En reparación',
          'Listo para entregar',
          'Cerrado'
        ])
        assert.equal(
          await p
            .locator('.cp04-metrics')
            .evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(' ').length),
          width <= 1050 ? 2 : 4
        )
        await p
          .locator('.cp04-quick-actions')
          .getByRole('button', { name: 'Nueva recepción', exact: true })
          .click()
        assert.equal(
          await p
            .getByLabel('Buscar patente registrada')
            .evaluate((e) => e === document.activeElement),
          true
        )
        await p
          .getByLabel('Motivo de ingreso *')
          .fill('Borrador que debe conservarse al actualizar')
        await p.getByRole('button', { name: 'Actualizar', exact: true }).click()
        await p.locator('.cp04-order').first().waitFor()
        assert.equal(
          await p.getByLabel('Motivo de ingreso *').inputValue(),
          'Borrador que debe conservarse al actualizar'
        )
        await p.locator('.cp04-order').first().click()
        await p.getByRole('button', { name: 'Abrir inspección multipunto con X' }).click()
        assert.equal(await p.locator('.mp-row').count(), 34)
        // Ten consecutive independent marks; SDK POSTs are intercepted, never real writes.
        for (const row of (await p.locator('.mp-row').all()).slice(0, 10))
          await row.getByRole('radio', { name: / · OK$/ }).check()
        await p.waitForFunction(
          () => document.querySelector('.cp04-count strong')?.textContent === '10/34'
        )
        assert.equal(state.findings.length, 10)
        await p.getByRole('button', { name: 'Actualizar', exact: true }).click()
        await p.locator('.cp04-order').first().waitFor()
        assert.equal(await p.getByRole('radio', { checked: true }).count(), 10)
        // Simulate returning from another app: real R1 focus revalidation remounts CP04.
        await p.locator('.mp-row').nth(15).scrollIntoViewIfNeeded()
        await p.waitForFunction(
          () =>
            JSON.parse(sessionStorage.getItem('bt:cp04:temporary-draft:v1') || '{}').draft
              ?.scrollY === window.scrollY
        )
        const position = await p.evaluate(() => window.scrollY)
        await p.evaluate(() => window.dispatchEvent(new Event('focus')))
        await p.waitForFunction(
          () => document.querySelector('.cp04-count strong')?.textContent === '10/34'
        )
        assert.equal(await p.getByRole('radio', { checked: true }).count(), 10)
        await p.waitForFunction((y) => Math.abs(window.scrollY - y) <= 5, position)
        if (width === 390) {
          state.slowFindings = true
          let row = p.locator('.mp-row').nth(10)
          await row.getByRole('radio', { name: / · OK$/ }).check()
          await row.getByText('Guardando…', { exact: true }).waitFor()
          await p.waitForFunction(
            () => document.querySelector('.cp04-count strong')?.textContent === '11/34'
          )
          state.slowFindings = false
          state.failFindings = true
          row = p.locator('.mp-row').nth(11)
          await row.getByRole('radio', { name: / · OK$/ }).check()
          await row.getByText('Error al guardar', { exact: true }).waitFor()
          state.failFindings = false
          await row.getByRole('button', { name: 'Reintentar esta X', exact: true }).click()
          await p.waitForFunction(
            () => document.querySelector('.cp04-count strong')?.textContent === '12/34'
          )
          for (const next of (await p.locator('.mp-row').all()).slice(12))
            await next.getByRole('radio', { name: / · OK$/ }).check()
          await p.waitForFunction(
            () => document.querySelector('.cp04-count strong')?.textContent === '34/34'
          )
          assert.equal(state.findings.length, 34)
          await p.getByRole('button', { name: 'Volver a la orden', exact: true }).click()
          await p.locator('.cp04-order').nth(4).click()
          await p.locator('.cp04-detail h2').filter({ hasText: 'QA1238' }).waitFor()
          await p.getByRole('button', { name: 'Abrir inspección multipunto con X' }).click()
          assert.equal(await p.getByRole('radio').count(), 0, 'closed order is read-only')
          assert.equal(await p.locator('.cp04-detail .cp04-actions').count(), 0)
          // Confirm a real reception action using ONLY intercepted synthetic data.
          state.vehicles.push({
            ...state.vehicles[0],
            id: uuid(999),
            plate: 'QA9999',
            plate_key: 'QA9999'
          })
          await p
            .locator('.cp04-quick-actions')
            .getByRole('button', { name: 'Nueva recepción', exact: true })
            .click()
          await p.getByLabel('Buscar patente registrada').fill('QA9999')
          await p.getByRole('button', { name: 'Buscar vehículo', exact: true }).click()
          await p.locator('.cp04-found').waitFor()
          await p.getByLabel('Motivo de ingreso *').fill('Recepción sintética de comprobación')
          await p.getByRole('button', { name: 'Guardar orden en Supabase', exact: true }).click()
          await p.getByText('Orden de trabajo guardada en el servidor.', { exact: true }).waitFor()
          assert.equal(state.orders.length, 6)
          assert.equal(state.orders[5].vehicle_id, uuid(999))
        }
        assert.equal(errors.length, 0, errors.join('\n'))
        assert.ok(
          requests.every(
            (r) =>
              r.method === 'GET' ||
              r.path.startsWith('/auth/v1/') ||
              r.path === '/rest/v1/inspection_findings' ||
              r.path === '/rest/v1/work_orders'
          )
        )
        results.push({
          width,
          status: 'PASS',
          marks: width === 390 ? 34 : 10,
          savingErrorRetryAndClosedOrder: width === 390,
          backend: 'HTTP mocked — no real Auth/RLS/persistence proof'
        })
      }
      await p.close()
    }
    // Focused BT-UI-POLISH-01 snapshots: selected OT with historical findings
    // and a pending observation from an older closed visit, HTTP-only fixture.
    if (!before) {
      for (const width of [390, 1440]) {
        const { p, state, errors } = await cp04Page(browser, width)
        const at = '2026-11-15T14:30:00Z'
        const base = {
          workshop_id: tenant, vehicle_id: uuid(100),
          recorded_by: uuid(1), created_at: at, updated_at: at
        }
        state.findings.push(
          { ...base, id: uuid(710), order_id: uuid(200), category: 'Frenos',
            result: 'attention', note: 'Sistema revisado y reparación registrada.',
            resolution: 'resolved', resolved_at: '2026-11-15T16:00:00Z' },
          { ...base, id: uuid(711), order_id: uuid(200), category: 'Luces',
            result: 'not_checked', note: '', resolution: 'not_applicable',
            resolved_at: null },
          { ...base, id: uuid(712), order_id: uuid(999), category: 'Luces de neblina',
            result: 'attention', note: 'Pendiente de revisar foco izquierdo.',
            resolution: 'pending', resolved_at: null }
        )
        await p.locator('.cp04-order').first().click()
        await p.locator('.cp04-finding').first().waitFor()
        await p.locator('.cp04-pending').first().waitFor()
        assert.equal(await p.locator('.cp04-finding').count(), 2)
        assert.equal(await p.locator('.cp04-pending').count(), 1,
          'closed prior visit must remain visible as pending')
        const size = await p.locator('.cp04-finding').first().boundingBox()
        assert.ok(size && size.height < 150, 'oversized inspection row')
        const action = await p.getByRole('button', { name: 'Marcar resuelto' }).boundingBox()
        assert.ok(action && action.width >= 135 && action.height >= 43,
          'resolve button must stay usable')
        if (width > 820) assert.ok(action.width < 200, 'oversized desktop resolve button')
        assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          'inspection/pending detail overflow: ' + width)
        assert.deepEqual(errors, [])
        await p.screenshot({
          path: `${out}/detalle-inspeccion-pendientes-${width}.png`,
          fullPage: true
        })
        await p.close()
      }
    }
    if (!before)
      for (const scenario of ['error', 'empty', 'loading', 'revoked']) {
        const { p, state, errors } = await cp04Page(
          browser,
          390,
          scenario === 'error'
            ? { failList: true }
            : scenario === 'empty'
              ? { orders: [] }
              : scenario === 'loading'
                ? { slowList: true }
                : {}
        )
        if (scenario === 'error') {
          await p.getByRole('heading', { name: 'No se pudieron cargar las órdenes' }).waitFor()
          assert.deepEqual(await p.locator('.cp04-metric strong').allTextContents(), [
            '—',
            '—',
            '—',
            '—'
          ])
          assert.equal(await p.locator('.cp04-empty').count(), 0)
          await p.screenshot({ path: `${out}/error-390.png`, fullPage: true })
          state.failList = false
          await p.getByRole('button', { name: 'Reintentar', exact: true }).click()
          await p.locator('.cp04-order').first().waitFor()
        } else if (scenario === 'empty') {
          await p.getByRole('heading', { name: 'Todavía no hay órdenes en tu taller' }).waitFor()
          assert.deepEqual(await p.locator('.cp04-metric strong').allTextContents(), [
            '0',
            '0',
            '0',
            '0'
          ])
          await p.screenshot({ path: `${out}/empty-390.png`, fullPage: true })
        } else if (scenario === 'loading') {
          await p.locator('.cp04-order-skeleton').waitFor()
          assert.equal(await p.locator('.cp04-metric strong').first().innerText(), 'Cargando')
          await p.screenshot({ path: `${out}/loading-390.png`, fullPage: true })
          await p.locator('.cp04-order').first().waitFor()
        } else {
          await p.locator('.cp04-order').first().waitFor()
          state.revoked = true
          await p.evaluate(() => window.dispatchEvent(new Event('focus')))
          await p.getByText('Cuenta personal verificada.', { exact: false }).waitFor()
          assert.equal(await p.locator('.cp04-private').count(), 0)
        }
        assert.equal(errors.length, 0, errors.join('\n'))
        results.push({ scenario, status: 'PASS', backend: 'HTTP mocked' })
        await p.close()
      }
    fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2) + '\n')
    console.log(
      before
        ? 'CP04 before captures complete'
        : 'CP04 redesign: five viewports, drafts, refresh, ten X and focus restore PASS'
    )
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
