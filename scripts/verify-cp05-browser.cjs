// Actual React + SDK, synthetic HTTP only; local SQL persistence tested separately.
const { chromium } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('node:fs')
const { cp04Page, uuid, tenant, userId } = require('../tests/harness/cp04BrowserFixture.cjs')
;(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox']
  })
  const out = process.env.OUTPUT_DIR || 'artifacts/cp05'
  fs.mkdirSync(out, { recursive: true })
  const results = []
  try {
    for (const width of (process.env.CP05_WIDTHS||'360,390,430,768,1366,1440,1920').split(',').map(Number)) {
      const { p, state, requests, errors } = await cp04Page(browser, width)
      const quotes = [],
        items = [],
        commands = new Map(), revisions=[]
      let failQuoteRead=false,failQuoteList=false
      let serial = 900
      const filter = (rows, url) =>
        rows.filter((row) =>
          [...url.searchParams].every(
            ([k, v]) => !v.startsWith('eq.') || String(row[k]) === v.slice(3)
          )
        )
      await p.route('https://suxcqqnmcjoezfxltoms.supabase.co/rest/v1/**', async (route) => {
        const req = route.request(),
          url = new URL(req.url()),
          table = url.pathname.split('/').pop()
        const reply = (data) =>
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(
              req.headers().accept?.includes('vnd.pgrst.object')
                ? Array.isArray(data)
                  ? data[0] || null
                  : data
                : data
            )
          })
        if (url.pathname.includes('/rpc/bt_cp05_')) {
          requests.push({ path: url.pathname, method: req.method() })
          const d = req.postDataJSON()
          assert.equal(d.p_workshop_id, tenant)
          if (commands.has(d.p_request_id)) return reply(commands.get(d.p_request_id))
          let q
          if (table === 'bt_cp05_open_quote') {
            q = quotes.find((q) => q.order_id === d.p_order_id)
            if (!q) {
              const order = state.orders.find((o) => o.id === d.p_order_id)
              q = {
                workshop_id: tenant,
                id: uuid(++serial),
                order_id: order.id,
                vehicle_id: order.vehicle_id,
                customer_id: uuid(50),
                number: quotes.length + 1,
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
              quotes.push(q)
            }
          } else if (table === 'bt_cp05_save_quote') {
            q = quotes.find((q) => q.id === d.p_quote_id)
            assert.equal(d.p_expected_version, q.version)
            Object.assign(q, { ...d.p_data, items: undefined, version: q.version + 1 })
            if(width===390)failQuoteRead=true
            if(width===1366)failQuoteList=true
            items.splice(
              0,
              items.length,
              ...d.p_data.items.map((i, position) => ({
                ...i,
                position,
                workshop_id: tenant,
                quote_id: q.id,
                line_net: Math.floor((i.quantity100 * i.unit_price + 50) / 100)
              }))
            )
          } else throw Error('Unexpected RPC ' + table)
          const response = { id: q.id, version: q.version }
          commands.set(d.p_request_id, response)
          return reply(response)
        }
        if (
          [
            'quotes',
            'quote_items',
            'quote_revisions',
            'quote_events',
            'quote_delivery_events',
            'customers'
          ].includes(table)
        ) {
          if(table==='quotes'&&((failQuoteRead&&url.searchParams.has('id'))||(failQuoteList&&!url.searchParams.has('id')&&!url.searchParams.has('order_id')))){
            failQuoteRead=false;failQuoteList=false
            return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({code:'SYNTHETIC_READ_ERROR'})})
          }
          assert.equal(req.method(), 'GET')
          requests.push({ path: url.pathname, method: 'GET' })
          assert.equal(url.searchParams.get('workshop_id'), 'eq.' + tenant)
          return reply(
            filter(
              table === 'quotes'
                ? quotes
                : table === 'quote_items'
                  ? items
                  : table === 'quote_revisions' ? revisions
                  : table === 'customers'
                    ? [
                        {
                          id: uuid(50),
                          workshop_id: tenant,
                          full_name: 'Cliente sintético QA',
                          email: 'synthetic@invalid.test',
                          mobile_e164: null
                        }
                      ]
                    : [],
              url
            )
          )
        }
        return route.fallback()
      })
      await p.locator('.cp04-order').first().click()
      await p.getByRole('button', { name: 'Preparar / consultar cotización' }).click()
      await p.locator('.cp05-panel').waitFor()
      await p.getByRole('button', { name: 'Crear / recuperar borrador de la OT' }).click()
      await p.locator('.cp05-context').waitFor()
      for (const [description, type, quantity, price] of [
        ['Pastillas de freno', 'Repuesto', '1', '52900'],
        ['Revisión del sistema', 'Servicio', '1', '39900'],
        ['Mano de obra', 'Mano de obra', '1.5', '24900']
      ]) {
        await p.getByRole('button', { name: 'Agregar otro ítem' }).click()
        await p.getByLabel('Descripción del ítem').fill(description)
        await p.getByLabel('Tipo de ítem').selectOption(type)
        await p.getByLabel('Cantidad del ítem').fill(quantity)
        await p.getByLabel('Precio del ítem').fill(price)
        await p.getByRole('button', { name: 'Confirmar partida en el borrador' }).click()
      }
      await p
        .getByLabel('Condiciones', { exact: true })
        .fill('Validez de diez días. Repuestos sujetos a disponibilidad.')
      await p.getByRole('button', { name: 'Guardar borrador en Supabase' }).click()
      if(width===390){
        await p.getByRole('button',{name:'Recuperar operación confirmada',exact:true}).waitFor()
        assert.equal(commands.size,2,'Read failure must not replay the save')
        await p.getByRole('button',{name:'Recuperar operación confirmada',exact:true}).click()
        await p.getByText('Guardado confirmado y versión recuperada del servidor.',{exact:true}).waitFor()
        assert.equal(commands.size,2)
      } else await p.getByText('Borrador confirmado en Supabase.', { exact: true }).waitFor()
      if(width===1366)await p.getByText(/Operación confirmada. No se pudo actualizar el listado/).waitFor()
      assert.match(await p.getByLabel('Totales netos').innerText(), /154.879/)
      assert.equal(items.length, 3)
      assert.equal(quotes.length, 1)
      // CP05 mobile: no six-line oversized item cards, no browser-grey buttons,
      // and both actions remain inside each visible card at 375/390px.
      if (width <= 390) {
        const backStyle = await p.getByRole('button', { name: 'Volver al panel anterior' })
          .evaluate(el => ({
            bg: getComputedStyle(el).backgroundColor,
            color: getComputedStyle(el).color,
            radius: parseFloat(getComputedStyle(el).borderRadius)
          }))
        assert.notEqual(backStyle.bg, 'rgb(239, 239, 239)', 'native grey back button')
        assert.ok(backStyle.radius >= 8, 'back button uses premium rounded R2 style')
        const cards = p.locator('.cp05-panel .wt-items tbody tr')
        for (let i = 0; i < 3; i++) {
          const row = await cards.nth(i).boundingBox()
          const del = await cards.nth(i).getByRole('button', { name: /Eliminar ítem/ }).boundingBox()
          assert.ok(row && del, 'missing quote item or delete control')
          assert.ok(row.height < 205, 'oversized mobile quote card: ' + row.height)
          assert.ok(del.x >= row.x && del.x + del.width <= row.x + row.width + 1,
            'delete button spills outside quote card')
        }
        const floating = await p.getByLabel('Total siempre visible').boundingBox()
        assert.ok(floating && floating.height <= 55, 'floating total obscures quote cards')
      }
      // BT-UI-POLISH-01: action hierarchy must be visible and contained
      // without altering its original enabled/disabled behavior.
      const board = p.locator('.cp05-action-board')
      assert.equal(await board.count(), 1)
      assert.equal(await board.locator('.cp05-action-group-main > button').count(), 3)
      assert.equal(await board.locator('.cp05-action-group-main > button.cp04-primary').count(), 1)
      assert.equal(await board.locator('.cp05-action-group-advanced > button').count(), 2)
      const boardBounds = await board.boundingBox()
      for (const button of await board.locator('button').all()) {
        const bounds = await button.boundingBox()
        assert.ok(boardBounds && bounds && bounds.x >= boardBounds.x - 1 &&
          bounds.x + bounds.width <= boardBounds.x + boardBounds.width + 1,
          'quote action escapes board at ' + width)
      }
      assert.ok(await p.locator('.cp05-history-empty').count() >= 2,
        'compact history/dispatch empty states missing')
      assert.ok(
        await p.getByRole('button', { name: 'Emitir revisión archivada · pendiente' }).isDisabled()
      )
      assert.ok(await p.getByRole('button', { name: 'Enviar correo · desactivado' }).isDisabled())
      assert.ok(
        await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        'overflow ' + width
      )
      await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await p.screenshot({ path: `${out}/cotizacion-${width}.png`, fullPage: true })
      const pinned = await p.getByLabel('Total siempre visible').boundingBox()
      assert.ok(pinned.y >= 0 && pinned.y + pinned.height <= 950)
      if (width === 390) {
        await p.screenshot({ path: `${out}/cotizacion-390-viewport.png` })
        const download = p.waitForEvent('download')
        await p.getByRole('button', { name: 'Descargar PDF de borrador' }).click()
        const d = await download
        await d.saveAs(`${out}/cotizacion-browser.pdf`)
        assert.equal(
          fs.readFileSync(`${out}/cotizacion-browser.pdf`).subarray(0, 5).toString(),
          '%PDF-'
        )
      }
      await p.getByRole('button', { name: 'Recargar versión guardada' }).click()
      await p
        .getByRole('button', { name: 'Guardar borrador en Supabase' })
        .waitFor({ state: 'visible' })
      assert.equal(await p.locator('.wt-items tbody tr').count(), 3)
      if (width === 390) {
        await p.reload()
        await p.locator('.cp05-panel').waitFor()
        await p.getByRole('button', { name: /COT-000001 · R0/ }).click()
        await p.locator('.wt-items tbody tr').nth(2).waitFor()
        assert.equal(await p.locator('.wt-items tbody tr').count(), 3)
        await p.getByRole('button', { name: 'Cerrar sesión', exact: true }).first().click()
        await p.getByLabel('Correo electrónico', { exact: true }).fill('cp04-browser@invalid.test')
        await p.getByLabel('Contraseña', { exact: true }).fill('synthetic-password-only')
        await p.getByRole('button', { name: 'Ingresar', exact: true }).click()
        await p.locator('.bottom-nav button').nth(3).click()
        await p.getByRole('button', { name: /COT-000001 · R0/ }).click()
        await p.locator('.wt-items tbody tr').nth(2).waitFor()
        assert.equal(await p.locator('.wt-items tbody tr').count(), 3)
      }
      if (width === 390) {
        await p.locator('.bottom-nav button').nth(2).click()
        await p.locator('.cp03-result').first().click()
        await p.getByRole('heading', { name: 'Vehículos vinculados' }).waitFor()
        await p.locator('.cp03-result').filter({ hasText: 'QA1234' }).first().click()
        await p.getByRole('button', { name: 'Consultar cotizaciones del vehículo' }).click()
        await p.getByRole('heading', { name: 'Cotizaciones del vehículo' }).waitFor()
        await p.getByRole('button', { name: /COT-000001 · R0/ }).click()
        await p.locator('.wt-items tbody tr').nth(2).waitFor()
        // A new explicit OT target must clear the previous vehicle filter.
        await p.locator('.bottom-nav button').nth(1).click()
        await p.locator('.cp04-order').nth(1).click()
        await p.getByRole('button', {name:'Preparar / consultar cotización'}).click()
        await p.getByRole('heading',{name:'Documentos recientes',exact:true}).waitFor()
        await p.locator('.cp05-list select:enabled').waitFor()
        assert.equal(await p.locator('.cp05-list select').inputValue(),uuid(201))
      }
      if(width===1366||width===390){
        if(width===390){
          await p.getByRole('button',{name:/COT-000001 · R0/}).click()
          await p.locator('.cp05-conditions textarea').first().waitFor()
        }
        const q=quotes[0],frozenItems=structuredClone(items)
        revisions.push({workshop_id:tenant,id:uuid(980),quote_id:q.id,revision:1,
          payload:{workshop:{id:tenant,name:'Taller histórico QA'},customer:{id:uuid(50),full_name:'Cliente histórico congelado',email:null,mobile_e164:null},
            vehicle:state.vehicles[0],order:state.orders[0],quote:{...structuredClone(q),status:'issued',revision:1,terms:'Condiciones históricas inmutables'},
            items:frozenItems,totals:{subtotal:130150,tax:24729,total:154879},document_date:'2026-11-22T12:00:00Z',notice:'Histórico sintético'},
          payload_sha256:'b'.repeat(64),pdf_sha256:'a'.repeat(64),pdf_size:1000,pdf_object_path:'synthetic-not-stored',issued_at:'2026-11-22T12:00:00Z',issued_by:userId})
        await p.getByRole('button',{name:'Recargar versión guardada',exact:true}).click()
        await p.locator('.cp05-revision-detail summary').click()
        const detail=p.locator('.cp05-revision-detail')
        assert.match(await detail.innerText(),/Condiciones históricas inmutables/)
        assert.equal(await detail.locator('tbody tr').count(),3)
        assert.equal(await detail.locator('button:enabled').count(),0,'Historic snapshot is read-only')
        await p.screenshot({path:`${out}/historial-${width}.png`,fullPage:true})
        fs.writeFileSync(`${out}/historial-${width}.html`,await p.locator('.cp05-panel').innerHTML())
        console.log('HISTORY_QA_STATE',JSON.stringify({status:q.status,conditions:await p.locator('.cp05-conditions textarea').count(),alerts:await p.locator('[role=alert]').allTextContents()}))
        assert.equal(await p.locator('.cp05-conditions textarea').first().inputValue(),'Validez de diez días. Repuestos sujetos a disponibilidad.')
      }
      assert.equal(errors.length, 0, errors.join('\n'))
      assert.ok(!requests.some((r) => /storage|functions/i.test(r.path)||(r.method!=='GET'&&/deliver/i.test(r.path))))
      results.push({
        width,
        items: 3,
        net: 130150,
        tax: 24729,
        total: 154879,
        http: 'synthetic',
        overflow: false,
        pdf: width === 390,
        errors
      })
      await p.close()
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(`${out}/browser-results.json`, JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results))
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
