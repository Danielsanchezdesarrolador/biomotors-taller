const {navigateSection}=require('../tests/harness/navigation.cjs')
// Candidate UI only: all Supabase/Edge/provider responses are synthetic and intercepted.
const { chromium } = require('playwright'),
  { PDFDocument, StandardFonts } = require('pdf-lib'),
  crypto = require('node:crypto'),
  fs = require('node:fs'),
  assert = require('node:assert/strict')
const { cp04Page, uuid, tenant, userId } = require('../tests/harness/cp04BrowserFixture.cjs')
;(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox']
  })
  const out = 'artifacts/piloto-final'
  fs.mkdirSync(out, { recursive: true })
  try {
    const { p, state, errors } = await cp04Page(browser, 390),
      customer = {
        id: uuid(50),
        workshop_id: tenant,
        full_name: 'Cliente sintético piloto',
        email: 'qa@invalid.test',
        mobile_e164: null
      }
    let quote = null,
      items = [],
      revisions = [],
      deliveries = []
    const calls = []
    const reply = (route, data, type = 'application/json') =>
      route.fulfill({
        status: 200,
        contentType: type,
        body: type === 'application/json' ? JSON.stringify(data) : data
      })
    p.on('dialog', (dialog) => dialog.accept())
    await p.route('https://suxcqqnmcjoezfxltoms.supabase.co/rest/v1/**', async (route) => {
      const req = route.request(),
        url = new URL(req.url()),
        name = url.pathname.split('/').pop()
      if (name === 'bt_cp05_open_quote') {
        quote ||= {
          id: uuid(900),
          workshop_id: tenant,
          order_id: state.orders[0].id,
          vehicle_id: state.vehicles[0].id,
          customer_id: customer.id,
          number: 1,
          version: 1,
          status: 'draft',
          price_basis: 'net',
          valid_days: 10,
          terms: '',
          comments: '',
          issued_revision: 0,
          issue_pending: false,
          created_at: '2026-11-16T12:00:00Z',
          updated_at: '2026-11-16T12:00:00Z'
        }
        return reply(route, { id: quote.id, version: quote.version })
      }
      if (name === 'bt_cp05_save_quote') {
        const input = req.postDataJSON()
        assert.equal(input.p_workshop_id, tenant)
        assert.equal(input.p_expected_version, quote.version)
        items = input.p_data.items.map((i, position) => ({
          ...i,
          quote_id: quote.id,
          workshop_id: tenant,
          position,
          line_net: Math.floor((i.quantity100 * i.unit_price + 50) / 100)
        }))
        Object.assign(quote, { ...input.p_data, items: undefined, version: quote.version + 1 })
        return reply(route, { id: quote.id, version: quote.version })
      }
      if (
        [
          'quotes',
          'quote_items',
          'quote_revisions',
          'quote_events',
          'quote_delivery_events',
          'customers'
        ].includes(name)
      ) {
        assert.equal(req.method(), 'GET')
        assert.equal(url.searchParams.get('workshop_id'), 'eq.' + tenant)
        const rows =
          name === 'quotes'
            ? quote
              ? [quote]
              : []
            : name === 'quote_items'
              ? items
              : name === 'quote_revisions'
                ? revisions
                : name === 'quote_delivery_events'
                  ? deliveries
                  : name === 'customers'
                    ? [customer]
                    : []
        const selected = rows.filter((r) =>
          [...url.searchParams].every(([key, value]) =>
            value.startsWith('eq.') ? String(r[key]) === value.slice(3) : true
          )
        )
        return reply(
          route,
          req.headers().accept?.includes('vnd.pgrst.object') ? selected[0] || null : selected
        )
      }
      return route.fallback()
    })
    let issuedBytes
    await p.route(
      'https://suxcqqnmcjoezfxltoms.supabase.co/functions/v1/bt-cp05-documents',
      async (route) => {
        const input = route.request().postDataJSON()
        calls.push(input.action)
        assert.equal(input.workshopId, tenant)
        if (input.action === 'issue') {
          assert.equal(input.quoteId, quote.id)
          assert.equal(input.version, quote.version)
          const pdf = await PDFDocument.create()
          pdf
            .addPage([595.28, 841.89])
            .drawText('SYNTHETIC UI QUOTE R1', {
              x: 40,
              y: 790,
              size: 18,
              font: await pdf.embedFont(StandardFonts.Helvetica)
            })
          issuedBytes = Buffer.from(await pdf.save())
          const subtotal = items.reduce((total, i) => total + i.line_net, 0),
            tax = Math.floor((subtotal * 19 + 50) / 100)
          const revision = {
            id: uuid(901),
            workshop_id: tenant,
            quote_id: quote.id,
            revision: 1,
            payload: {
              quote: structuredClone(quote),
              customer: structuredClone(customer),
              vehicle: structuredClone(state.vehicles[0]),
              order: structuredClone(state.orders[0]),
              totals: { subtotal, tax, total: subtotal + tax }
            },
            payload_sha256: 'b'.repeat(64),
            pdf_sha256: crypto.createHash('sha256').update(issuedBytes).digest('hex'),
            pdf_size: issuedBytes.length,
            issued_at: '2026-11-16T12:10:00Z',
            issued_by: userId
          }
          revisions = [revision]
          Object.assign(quote, { version: quote.version + 1, status: 'issued', issued_revision: 1 })
          return reply(route, { revision })
        }
        if (input.action === 'download') {
          assert.equal(input.revisionId, revisions[0].id)
          return reply(route, issuedBytes, 'application/pdf')
        }
        assert.equal(input.action, 'send')
        assert.equal(input.revisionId, revisions[0].id)
        assert.equal(input.attempt, 1)
        assert.equal(input.recipient, undefined)
        deliveries = ['queued', 'sent'].map((status, n) => ({
          id: uuid(910 + n),
          workshop_id: tenant,
          revision_id: revisions[0].id,
          attempt: 1,
          status,
          recipient: customer.email,
          provider_id: status === 'sent' ? 'SYNTHETIC_ACK' : null,
          error_code: null,
          created_at: '2026-11-16T12:11:00Z'
        }))
        return reply(route, { delivery: 'sent' })
      }
    )
    await p.locator('.cp04-order').first().click()
    await p.getByRole('button', { name: 'Preparar / consultar cotización' }).click()
    await p.getByRole('button', { name: 'Crear cotización' }).click()
    await p.locator('.cp05-context').waitFor()
    for (const [description, type, price] of [
      ['Pastillas QA', 'Repuesto', 52900],
      ['Servicio QA', 'Servicio', 39900],
      ['Mano de obra QA', 'Mano de obra', 37350]
    ]) {
      await p.getByRole('button', { name: 'Agregar otro ítem' }).click()
      await p.getByLabel('Descripción del ítem').fill(description)
      await p.getByLabel('Tipo de ítem').selectOption(type)
      await p.getByLabel('Precio del ítem').fill(String(price))
      await p.getByRole('button', { name: 'Confirmar partida en el borrador' }).click()
    }
    await p.getByLabel('Condiciones', { exact: true }).fill('Validez diez días QA.')
    await p.getByRole('button', { name: 'Guardar borrador' }).click()
    await p.getByText('Guardado correctamente.', { exact: true }).waitFor()
    await p.getByRole('button', { name: 'Emitir revisión archivada', exact: true }).click()
    await p.getByText('Revisión emitida y archivo privado verificado.', { exact: true }).waitFor()
    const download = p.waitForEvent('download')
    await p.getByRole('button', { name: 'Descargar PDF emitido', exact: true }).click()
    await (await download).saveAs(out + '/ui-private-synthetic.pdf')
    assert.deepEqual(fs.readFileSync(out + '/ui-private-synthetic.pdf'), issuedBytes)
    await p.getByRole('button', { name: 'Enviar última revisión', exact: true }).click()
    await p
      .getByText('Envío aceptado por el proveedor; no acredita lectura ni entrega en la bandeja.', {
        exact: true
      })
      .waitFor()
    await p.locator('.cp05-history').screenshot({ path: out + '/documentos-390.png' })
    await navigateSection(p,'clientes')
    await p.locator('.cp03-result').first().click()
    await p.getByRole('heading', { name: 'Vehículos vinculados' }).waitFor()
    await p.locator('.cp03-result').filter({ hasText: 'QA1234' }).first().click()
    await p.getByRole('button', { name: 'Ver historial', exact: true }).click()
    await p.getByText(/Total histórico:.*154.879/).waitFor()
    await p.locator('.cp06-quotes').screenshot({ path: out + '/historial-cotizacion-390.png' })
    assert.deepEqual(calls, ['issue', 'download', 'send'])
    assert.deepEqual(errors, [])
    fs.writeFileSync(
      out + '/ui-results.json',
      JSON.stringify(
        {
          width: 390,
          source: 'HTTP synthetic, not hosted',
          operations: calls,
          historyQuote: true,
          total: 154879,
          errors
        },
        null,
        2
      )
    )
    console.log('Pilot document UI + CP06 quote link PASS (synthetic HTTP only)')
  } finally {
    await browser.close()
  }
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
