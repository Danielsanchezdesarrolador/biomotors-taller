// Real React/StrictMode + SDK; hosted HTTP intercepted by the existing strict fixture.
const { chromium, webkit } = require('playwright'), assert = require('node:assert/strict'), fs = require('node:fs'), crypto = require('node:crypto');
const { cp04Page, uuid, tenant, businessWrites } = require('../tests/harness/cp04BrowserFixture.cjs');
const { navigateSection } = require('../tests/harness/navigation.cjs');
const out = process.env.OUTPUT_DIR || '/tmp/bt-orders-browser', base = process.env.CP04_BASE_URL || 'http://127.0.0.1:5183', engine = process.env.BT_ORDERS_BROWSER || 'chromium';
const selected = process.env.BT_ORDERS_CASES?.split(','), run = name => !selected || selected.includes(name), results = [];
const availableCases=['responsive','intake','inspection','pdf-full','pdf-plus','session','load-recovery','global-navigation','roles-scope-callbacks','guided-resume'];
if(selected) assert.ok(selected.length>0&&selected.every(name=>availableCases.includes(name)),'Unknown focused scenario; refusing an empty or silently skipped validation');
fs.mkdirSync(out, { recursive: true });
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
async function saveResult(name, ids, evidence = {}) { results.push({ name, status: 'PASS', matrix: ids, ...evidence }); fs.writeFileSync(out + '/results.json', JSON.stringify({ engine, status: 'RUNNING', cases: results }, null, 2)); console.log('ORDERS_PASS', name); }
async function choose(f, index = 0) { const p = f.p; p.setDefaultTimeout(12000); if (p.viewportSize().width <= 1050 && await p.locator('.cp04-detail').count() && !await p.locator('.cp04-order-list').isVisible())
    await p.getByRole('button', { name: 'Cambiar de orden', exact: true }).click(); await p.locator('.cp04-order').nth(index).click(); await p.locator('.cp04-detail[aria-busy="false"]').waitFor(); }
const tab = (p, name) => p.getByRole('tab', { name, exact: true });
async function documents(p) { const group = p.locator('.cp04-action-group').filter({ has: p.locator('summary').filter({ hasText: /^Documentos\s*$/ }) }); if (!await group.getAttribute('open').then(v => v !== null))
    await group.locator('summary').click(); }
// Wait for the exact locator to be focused, not an arbitrary animation delay.
async function receptionFocus(p, target) {
    await target.and(p.locator(':focus')).waitFor({ state: 'visible', timeout: 3000 });
    assert.ok(await target.evaluate(e => e === document.activeElement));
}
async function receptionOpened(p) {
    await p.locator('.cp04-reception').waitFor({ state: 'visible', timeout: 3000 });
    await receptionFocus(p, p.getByLabel('Buscar patente registrada'));
}
async function receptionClosed(p, trigger) {
    await p.locator('.cp04-reception').waitFor({ state: 'hidden', timeout: 3000 });
    assert.ok(await p.locator('.cp04-reception').isHidden());
    await receptionFocus(p, trigger);
}
async function clean(f) { assert.deepEqual(f.errors, []); assert.ok(await f.p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow'); await f.p.close(); }
;
(async () => {
    assert.ok(['chromium', 'webkit'].includes(engine));
    const b = await (engine === 'webkit' ? webkit : chromium).launch(engine === 'chromium' ? { executablePath: fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined, args: ['--no-sandbox'] } : {});
    try {
        if (run('responsive')) {
            const metrics = [];
            for (const [width, height, label] of [[1650, 950, '1650'], [1440, 950, '1440'], [1366, 950, '1366'], [1024, 950, '1024'], [768, 950, '768'], [390, 950, '390'], [375, 950, '375'], [1366, 650, '1366-short'], [844, 390, 'mobile-landscape']]) {
                const f = await cp04Page(b, width, { operationsEnabled: true, documentsEnabled: true }), { p } = f;
                p.setDefaultTimeout(12000);
                await p.setViewportSize({ width, height });
                await p.locator('.cp04-order').first().waitFor();
                await p.screenshot({ path: out + '/orders-' + label + '.png', fullPage: true });
                await choose(f);
                await p.evaluate(() => scrollTo(0, 0));
                const m = await p.evaluate(() => { const y = s => Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY); return { height: innerHeight, detailY: y('.cp04-detail'), primaryY: y('.cp04-main-actions button'), tabsY: y('.cp04-detail-tabs'), scrollHeight: document.documentElement.scrollHeight, scrollContainers: [...document.querySelectorAll('.cp04-private *')].filter(e => getComputedStyle(e).overflowY === 'auto' && e.scrollHeight > e.clientHeight).map(e => e.className) }; });
                metrics.push({ width, label, ...m });
                assert.ok(m.scrollContainers.every(c => c === 'cp04-orders'), JSON.stringify(m));
                assert.ok(m.detailY < 750, 'Detail starts close to workspace top');
                if (width >= 1366) {
                    assert.ok(m.primaryY < height, 'Primary action visible without scrolling');
                    assert.ok(m.tabsY < height, 'Multipoint entry visible without scrolling');
                }
                await p.screenshot({ path: out + '/selected-' + label + '.png', fullPage: true });
                await tab(p, 'Inspección multipunto').click();
                assert.equal(await p.locator('.mp-row').count(), 34);
                await p.screenshot({ path: out + '/multipunto-' + label + '.png', fullPage: true });
                assert.ok(await p.locator('.cp04-tab-content').first().evaluate(e => getComputedStyle(e).overflowY === 'visible'));
                assert.ok(await p.locator('.mp-cell').first().evaluate(e => { const r = e.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }));
                if (width === 390 || width === 1650) {
                    await tab(p, 'Historial de diagnósticos').click();
                    await p.screenshot({ path: out + '/history-' + label + '.png', fullPage: true });
                    await p.locator('.cp04-quick-actions').getByRole('button', { name: 'Nueva recepción', exact: true }).click();
                    await p.screenshot({ path: out + '/intake-' + label + '.png', fullPage: true });
                    await p.getByRole('button', { name: 'Cerrar recepción y conservar borrador' }).click();
                    await choose(f, 4);
                    await tab(p, 'Inspección multipunto').click();
                    await p.screenshot({ path: out + '/readonly-' + label + '.png', fullPage: true });
                    assert.equal(await p.getByRole('radio').count(), 0);
                }
                await clean(f);
            }
            fs.writeFileSync(out + '/geometry.json', JSON.stringify(metrics, null, 2));
            await saveResult('responsive', ['ORD-20', 'ORD-21', 'ORD-22'], { viewports: metrics.map(x => x.label) });
        }
        if (run('intake')) {
            const f = await cp04Page(b, 1366, { operationsEnabled: true }), { p, state, requests } = f;
            await p.locator('.cp04-order').first().waitFor();
            const trigger = p.locator('.cp04-quick-actions').getByRole('button', { name: 'Nueva recepción', exact: true });
            await trigger.click();
            await receptionOpened(p);
            const value = 'Borrador sintético conservado';
            await p.getByLabel('Buscar patente registrada').fill('QA1234');
            await p.getByRole('button', { name: 'Buscar vehículo', exact: true }).click();
            await p.locator('.cp04-found').waitFor();
            await p.getByLabel('Motivo de ingreso *').fill(value);
            await p.getByLabel('Kilometraje de recepción').fill('120.000');
            await p.evaluate(() => window.ordersForm = document.querySelector('.cp04-reception textarea'));
            await p.getByRole('button', { name: 'Cerrar recepción y conservar borrador' }).click();
            await receptionClosed(p, trigger);
            assert.ok(await p.locator('.cp04-reception').isHidden());
            assert.equal(businessWrites(requests).length, 0);
            await trigger.press('Enter');
            await receptionOpened(p);
            assert.equal(await p.getByLabel('Motivo de ingreso *').inputValue(), value);
            assert.ok(await p.evaluate(() => window.ordersForm === document.querySelector('.cp04-reception textarea')));
            // Calling the same action while open must refocus the plate.
            await p.getByLabel('Motivo de ingreso *').focus();
            await trigger.click();
            await receptionOpened(p);
            await p.keyboard.press('Escape');
            await receptionClosed(p, trigger);
            assert.ok(await p.locator('.cp04-reception').isHidden());
            assert.ok(await p.locator('.cp04-quick-actions button').first().evaluate(e => e === document.activeElement));
            assert.equal(businessWrites(requests).length, 0);
            await trigger.click();
            await receptionOpened(p);
            assert.equal(await p.getByLabel('Buscar patente registrada').inputValue(), 'QA1234');
            assert.equal(await p.getByLabel('Motivo de ingreso *').inputValue(), value);
            assert.equal(await p.getByLabel('Kilometraje de recepción').inputValue(), '120.000');
            assert.ok(await p.evaluate(() => window.ordersForm === document.querySelector('.cp04-reception textarea')));
            assert.equal(businessWrites(requests).length, 0);
            const count = state.orders.length;
            await p.getByRole('button', { name: 'Guardar orden', exact: true }).click();
            await p.getByText('Orden de trabajo guardada en el servidor.', { exact: true }).waitFor();
            await p.locator('.cp04-detail[aria-busy="false"]').waitFor();
            assert.equal(state.orders.length, count + 1);
            assert.equal(state.orders.at(-1).intake_odometer, 120000);
            const created = state.orders.at(-1).id;
            await p.reload();
            await p.locator('.cp04-detail[aria-busy="false"]').waitFor();
            assert.match(await p.locator('.cp04-detail-head').innerText(), /Borrador sintético conservado/);
            assert.equal(JSON.parse(await p.evaluate(() => sessionStorage.getItem('bt:cp04:temporary-draft:v1'))).draft.selectedOrderId, created);
            await clean(f);
            // The empty-state trigger is a distinct real button, not the toolbar button.
            const empty = await cp04Page(b, 390, { operationsEnabled: true, orders: [] });
            const ep = empty.p;
            const emptyTrigger = ep.locator('.cp04-empty').getByRole('button', { name: 'Nueva recepción', exact: true });
            const primaryTrigger = ep.locator('.cp04-quick-actions').getByRole('button', { name: 'Nueva recepción', exact: true });
            await emptyTrigger.waitFor({ state: 'visible' });
            await emptyTrigger.click();
            await receptionOpened(ep);
            await ep.getByLabel('Motivo de ingreso *').fill('Borrador estado vacío');
            await ep.evaluate(() => window.ordersForm = document.querySelector('.cp04-reception textarea'));
            await ep.getByRole('button', { name: 'Cerrar recepción y conservar borrador' }).click();
            await receptionClosed(ep, emptyTrigger);
            await emptyTrigger.press('Enter');
            await receptionOpened(ep);
            await ep.keyboard.press('Escape');
            await receptionClosed(ep, emptyTrigger);
            await emptyTrigger.click();
            await receptionOpened(ep);
            await primaryTrigger.click();
            await receptionOpened(ep);
            await ep.keyboard.press('Escape');
            await receptionClosed(ep, primaryTrigger);
            await emptyTrigger.click();
            await receptionOpened(ep);
            assert.equal(await ep.getByLabel('Motivo de ingreso *').inputValue(), 'Borrador estado vacío');
            assert.ok(await ep.evaluate(() => window.ordersForm === document.querySelector('.cp04-reception textarea')));
            assert.equal(businessWrites(empty.requests).length, 0);
            assert.equal(empty.state.orders.length, 0);
            await clean(empty);
            await saveResult('intake', ['ORD-02', 'ORD-03', 'ORD-04', 'ORD-23'], { receptionFocus: ['toolbar-click','button-close','keyboard-reopen','already-open','escape','empty-trigger','latest-trigger','same-node','zero-writes'] });
        }
        if (run('inspection')) {
            const f = await cp04Page(b, 1650, { operationsEnabled: true }), { p, state, requests } = f;
            await choose(f);
            await tab(p, 'Resumen').focus();
            await p.keyboard.press('ArrowRight');
            assert.equal(await tab(p, 'Inspección multipunto').getAttribute('aria-selected'), 'true');
            await p.keyboard.press('End');
            assert.equal(await tab(p, 'Historial de diagnósticos').getAttribute('aria-selected'), 'true');
            await p.keyboard.press('Home');
            assert.equal(await tab(p, 'Resumen').getAttribute('aria-selected'), 'true');
            await tab(p, 'Inspección multipunto').click();
            assert.equal(await p.locator('.mp-row').count(), 34);
            const first = p.locator('.mp-row').first();
            await p.evaluate(() => window.ordersRadio = document.querySelector('.mp-row input'));
            state.failFindings = true;
            await first.getByRole('radio', { name: / · Requiere atención$/ }).check();
            await first.getByText('Error al guardar', { exact: true }).waitFor();
            await first.getByRole('textbox').fill('Observación sintética de suspensión');
            await first.getByText('Error al guardar', { exact: true }).waitFor();
            const writes = businessWrites(requests).length;
            await tab(p, 'Historial de diagnósticos').click();
            await tab(p, 'Observaciones pendientes').click();
            await tab(p, 'Inspección multipunto').click();
            assert.ok(await p.evaluate(() => window.ordersRadio === document.querySelector('.mp-row input')));
            assert.equal(await first.getByRole('textbox').inputValue(), 'Observación sintética de suspensión');
            assert.equal(businessWrites(requests).length, writes);
            state.failFindings = false;
            await first.getByRole('button', { name: 'Reintentar esta X', exact: true }).click();
            await first.getByText('Guardado', { exact: true }).waitFor();
            assert.equal(state.findings.length, 1);
            assert.equal(state.findings[0].order_id, state.orders[0].id);
            assert.equal(state.findings[0].workshop_id, tenant);
            await p.locator('.mp-row').nth(1).getByRole('radio', { name: / · OK$/ }).check();
            await p.locator('.mp-row').nth(1).getByText('Guardado', { exact: true }).waitFor();
            assert.equal(state.findings.length, 2);
            await tab(p, 'Historial de diagnósticos').click();
            assert.equal(await p.locator('[data-detail-tab="history"] .cp04-finding').count(), 2);
            await choose(f, 1);
            assert.match(await p.locator('.cp04-detail-head').innerText(), /QA1235/);
            await tab(p, 'Inspección multipunto').click();
            assert.equal(await p.getByRole('radio', { checked: true }).count(), 0);
            await choose(f, 0);
            await tab(p, 'Inspección multipunto').click();
            assert.equal(await p.getByRole('radio', { checked: true }).count(), 2);
            for (const index of [3, 4]) {
                await choose(f, index);
                await tab(p, 'Inspección multipunto').click();
                assert.equal(await p.getByRole('radio').count(), 0);
                assert.equal(await p.locator('.mp-row').count(), 34);
            }
            await clean(f);
            await saveResult('inspection', ['ORD-01', 'ORD-05', 'ORD-07', 'ORD-08', 'ORD-09', 'ORD-10', 'ORD-11', 'ORD-21', 'ORD-24']);
        }
        for (const plan of ['full', 'plus'])
            if (run('pdf-' + plan)) {
                const f = await cp04Page(b, plan === 'full' ? 1366 : 390, { operationsEnabled: true, documentsEnabled: true, documentPlan: plan }), { p, state, documentCalls, documentOperations } = f;
                await choose(f);
                await documents(p);
                const trigger = p.getByRole('button', { name: 'Vista previa PDF', exact: true });
                await trigger.click();
                const dialog = p.locator('.bt-pdf-viewer');
                await dialog.locator('iframe').waitFor();
                const calls = documentCalls.length, src = await dialog.locator('iframe').getAttribute('src');
                const expected = Buffer.from(await p.evaluate(async (url) => Array.from(new Uint8Array(await (await fetch(url)).arrayBuffer())), src));
                const zoom = dialog.getByRole('button', { name: 'Acercar' });
                await zoom.click();
                await zoom.click();
                assert.equal(documentCalls.length, calls);
                assert.equal(documentOperations.size, 1);
                await p.screenshot({ path: out + '/pdf-' + plan + '.png' });
                await p.keyboard.press('Escape');
                await dialog.waitFor({ state: 'detached' });
                await p.waitForFunction(() => document.activeElement.textContent.includes('Vista previa PDF'));
                const download = p.waitForEvent('download');
                await p.getByRole('button', { name: 'Descargar borrador', exact: true }).click();
                const d = await download, bytes = fs.readFileSync(await d.path());
                assert.equal(hash(bytes), hash(expected));
                assert.equal(documentOperations.size, 1);
                assert.ok(documentCalls.every(c => c.requestId === documentCalls[0].requestId));
                await trigger.click();
                await dialog.locator('iframe').waitFor();
                assert.match(await p.locator('.cp04-detail-head').innerText(), /QA1234/);
                state.operationsEnabled = false;
                state.documentsEnabled = false;
                state.documentPlan = 'basic';
                state.inspectionEnabled = false;
                await p.evaluate(() => window.btUxQa.verify());
                await p.locator('.bt-pdf-viewer').waitFor({ state: 'detached' });
                await p.locator('.commercial-promotion').waitFor();
                await documents(p);
                assert.ok(await p.getByRole('button', { name: 'Vista previa PDF', exact: true }).isDisabled());
                await p.screenshot({ path: out + '/basic-' + plan + '.png', fullPage: true });
                await clean(f);
                await saveResult('pdf-' + plan, ['ORD-13', 'ORD-14', 'ORD-16', 'ORD-17', 'ORD-23', 'ORD-24'], { consumptions: 1, downloadSHA256: hash(bytes) });
            }
        if (run('session')) {
            const f = await cp04Page(b, 1366, { operationsEnabled: true, documentsEnabled: true }), { p, state } = f;
            await choose(f);
            await documents(p);
            await p.getByRole('button', { name: 'Vista previa PDF', exact: true }).click();
            await p.locator('.bt-pdf-viewer iframe').waitFor();
            state.revoked = true;
            await p.evaluate(() => window.btUxQa.verify());
            await p.locator('.bt-pdf-viewer').waitFor({ state: 'detached' });
            assert.equal(await p.locator('.cp04-detail').count(), 0);
            await clean(f);
            await saveResult('session', ['ORD-17']);
        }
        if (run('load-recovery')) {
            const f = await cp04Page(b, 1366, { failList: true }), { p, state, requests } = f;
            await p.getByRole('heading', { name: 'No se pudieron cargar las órdenes' }).waitFor();
            state.failList = false;
            await p.getByRole('button', { name: 'Reintentar', exact: true }).click();
            await p.locator('.cp04-order').first().waitFor();
            state.orders.length = 0;
            await p.getByRole('button', { name: 'Actualizar', exact: true }).click();
            await p.getByRole('heading', { name: 'Todavía no hay órdenes en tu taller' }).waitFor();
            assert.equal(businessWrites(requests).length, 0);
            await clean(f);
            await saveResult('load-recovery', ['ORD-25']);
        }
        if (run('global-navigation')) {
            const f = await cp04Page(b, 1366, { operationsEnabled: true }), { p, requests } = f;
            await choose(f);
            await p.locator('.cp04-quick-actions').getByRole('button', { name: 'Nueva recepción', exact: true }).click();
            await p.getByLabel('Motivo de ingreso *').fill('Borrador preservado al navegar');
            await p.evaluate(() => window.ordersForm = document.querySelector('.cp04-reception textarea'));
            const original = await p.locator('.cp04-detail-head').innerText();
            await navigateSection(p, 'inicio');
            await p.locator('[data-workspace-section="inicio"]:not([hidden])').waitFor();
            await navigateSection(p, 'ordenes');
            assert.equal(await p.getByLabel('Motivo de ingreso *').inputValue(), 'Borrador preservado al navegar');
            assert.ok(await p.evaluate(() => window.ordersForm === document.querySelector('.cp04-reception textarea')));
            assert.equal(await p.locator('.cp04-detail-head').innerText(), original);
            assert.equal(businessWrites(requests).length, 0);
            await clean(f);
            await saveResult('global-navigation', ['ORD-04', 'ORD-26']);
        }
        if (run('roles-scope-callbacks')) {
            const p = await b.newPage({ viewport: { width: 1366, height: 900 } }), errors = [], external = [];
            p.on('pageerror', e => errors.push(e.message));
            await p.route('**/*', route => { if (new URL(route.request().url()).origin === new URL(base).origin)
                return route.continue(); external.push(route.request().url()); return route.abort(); });
            await p.goto(base + '/orders-ux.html');
            await p.locator('.cp04-order').first().click();
            await p.locator('.cp04-detail[aria-busy="false"]').waitFor();
            await p.getByRole('button', { name: 'Continuar recorrido guiado', exact: true }).click();
            await p.getByRole('button', { name: 'Preparar / consultar cotización', exact: true }).click();
            assert.deepEqual(await p.evaluate(() => window.ordersUxQa.probes), [{ kind: 'guided', workshop: uuid(11), order: uuid(201) }, { kind: 'quote', workshop: uuid(11), order: uuid(201) }]);
            assert.match(await p.locator('.cp04-main-actions .cp04-primary').innerText(), /^Continuar recorrido guiado$/);
            await p.locator('.cp04-quick-actions').getByRole('button', { name: 'Nueva recepción', exact: true }).click();
            await p.getByLabel('Motivo de ingreso *').fill('Borrador solo taller A');
            await p.evaluate(() => window.ordersUxQa.setWid('00000000-0000-4000-8000-000000000012'));
            await p.locator('.cp04-order').first().waitFor();
            await p.locator('.cp04-quick-actions').getByRole('button', { name: 'Nueva recepción', exact: true }).click();
            assert.equal(await p.getByLabel('Motivo de ingreso *').inputValue(), '');
            await p.evaluate(() => window.ordersUxQa.setWid('00000000-0000-4000-8000-000000000011'));
            await p.locator('.cp04-order').first().waitFor();
            await p.locator('.cp04-quick-actions').getByRole('button', { name: 'Nueva recepción', exact: true }).click();
            assert.equal(await p.getByLabel('Motivo de ingreso *').inputValue(), '', 'Existing single-scope draft is cleared on workshop change, never shared or restored across tenants');
            for (const role of ['admin', 'reception', 'mechanic']) {
                await p.evaluate(r => window.ordersUxQa.setRole(r), role);
                await p.locator('.cp04-order').first().click();
                await p.locator('.cp04-detail[aria-busy="false"]').waitFor();
                await tab(p, 'Inspección multipunto').click();
                assert.equal(await p.getByRole('radio').count(), 102);
                assert.equal(await p.locator('.cp04-quick-actions button').first().isDisabled(), role === 'mechanic');
            }
            await p.evaluate(() => window.ordersUxQa.setEnabled(false));
            await p.locator('.cp04-order').first().click();
            await p.locator('.cp04-detail[aria-busy="false"]').waitFor();
            await tab(p, 'Inspección multipunto').click();
            assert.equal(await p.getByRole('radio').count(), 0);
            assert.deepEqual(errors, []);
            assert.deepEqual(external, []);
            await p.screenshot({ path: out + '/guided-primary-roles.png', fullPage: true });
            await p.close();
            await saveResult('roles-scope-callbacks', ['ORD-06', 'ORD-12', 'ORD-18', 'ORD-19'], { scope: 'Real component callbacks/role presentation; no hosted authorization claims' });
        }
        if (run('guided-resume')) {
            const f=await cp04Page(b,1366,{operationsEnabled:true});
            await choose(f);
            await tab(f.p,'Inspección multipunto').click();
            assert.equal(await f.p.locator('.cp04-inspection-progress progress').getAttribute('max'),'34');
            assert.match(await f.p.locator('.cp04-inspection-progress').innerText(),/0\/34 componentes revisados/);
            await clean(f);
            const p=await b.newPage({viewport:{width:390,height:900}}),errors=[];
            p.setDefaultTimeout(12000);
            p.on('pageerror',error=>errors.push(error.message));
            await p.goto(base+'/guided-qa?stage=3');
            await p.locator('.guided-dialog').waitFor();
            await p.getByRole('button',{name:/QA1234.*Continuar$/}).click();
            await p.getByRole('button',{name:'Continuar atención',exact:true}).click();
            await p.getByRole('heading',{name:/^4\. /}).waitFor();
            await p.getByRole('button',{name:'Ver avance de atención',exact:true}).click();
            await p.getByRole('button',{name:'Abrir inspección multipunto',exact:true}).click();
            await p.getByRole('heading',{name:'3. Inspección multipunto',exact:true}).waitFor();
            assert.equal(await p.locator('.cp04-inspection-progress').count(),0,'Orders-only presentation does not enter guided layout');
            await p.getByRole('button',{name:'Ver avance de atención',exact:true}).click();
            await p.getByRole('button',{name:'Continuar atención',exact:true}).click();
            await p.getByRole('heading',{name:/^4\. /}).waitFor();
            assert.equal(await p.evaluate(()=>window.r1.writes),0);
            assert.deepEqual(errors,[]);
            await p.screenshot({path:out+'/guided-resume-390.png'});
            await p.close();
            await saveResult('guided-resume',['ORD-06'],{scope:'Existing current guided fixture resumes the same confirmed visit; no writes, no Orders-only progress in guided layout'});
        }
        fs.writeFileSync(out + '/results.json', JSON.stringify({ engine, status: 'PASS', cases: results, scope: 'Synthetic isolated browser, not production/physical-device certification' }, null, 2));
    }
    finally {
        await b.close();
    }
})().catch(e => { fs.writeFileSync(out + '/failure.txt', e.stack + '\n'); console.error(e); process.exitCode = 1; });
