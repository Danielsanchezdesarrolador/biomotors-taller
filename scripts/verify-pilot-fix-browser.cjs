const {selectOrder,openDocuments}=require('../tests/harness/ordersNavigation.cjs')
// Only affected inspection/PDF and quote actions; real components, intercepted synthetic HTTP.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const {cp04Page}=require('../tests/harness/cp04BrowserFixture.cjs'),{cp05Page}=require('../tests/harness/cp05BrowserFixture.cjs')
assert.ok(['chromium','webkit'].includes(process.env.BT_PILOT_BROWSER||'chromium'),'Unsupported browser engine')
const out=process.env.OUTPUT_DIR||'/tmp/bt-pilot-fix-evidence'
;(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await (process.env.BT_PILOT_BROWSER==='webkit'?webkit:chromium).launch(process.env.BT_PILOT_BROWSER==='webkit'?{}:{...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});const results=[]
try{for(const width of [1440,390]){
 const {p,state,requests,errors}=await cp04Page(browser,width)
 p.setDefaultTimeout(12000)
 await selectOrder(p,p.locator('.cp04-order').first());await p.getByRole('button',{name:'Abrir inspección multipunto con X'}).click()
 assert.equal(await p.locator('.mp-row').count(),34)
 assert.ok(!/Supabase/.test(await p.locator('.cp04-checklist').innerText()))
 assert.match(await p.locator('.cp04-count').innerText(),/Sin componentes guardados/)
 const row=p.locator('.mp-row').first();await row.getByRole('radio',{name:/ · OK$/}).check()
 await p.waitForFunction(()=>document.querySelector('.cp04-count strong')?.textContent==='1/34')
 assert.match(await p.locator('.cp04-count').innerText(),/Guardado correctamente/)
 await p.screenshot({path:out+'/inspection-'+width+'.png',fullPage:true})
 await openDocuments(p);await p.getByRole('button',{name:'Vista previa PDF',exact:true}).click()
 const modal=p.getByRole('dialog',{name:'Vista previa del borrador · No enviado'});await modal.waitFor()
 const size=await modal.boundingBox();assert.ok(size.width>width*.8&&size.height>700)
 const before=requests.filter(r=>r.method!=='GET').length
 await p.screenshot({path:out+'/pdf-preview-'+width+'.png',fullPage:true})
 await modal.getByRole('button',{name:'Cerrar vista previa PDF'}).click();await modal.waitFor({state:'detached'})
 assert.equal(requests.filter(r=>r.method!=='GET').length,before,'Closing preview must not write or issue')
 await p.getByRole('tab',{name:'Resumen',exact:true}).click();assert.equal(await p.getByRole('tab',{name:'Resumen',exact:true}).getAttribute('aria-selected'),'true')
 // Finalized inspection is readonly even before a handover exists.
 await selectOrder(p,p.locator('.cp04-order').nth(3));await p.getByRole('button',{name:'Abrir inspección multipunto con X'}).click()
 assert.equal(await p.getByRole('radio',{disabled:false}).count(),0)
 assert.deepEqual(errors,[]);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.close()
 const q=await cp05Page(browser,width)
 await selectOrder(q.p,q.p.locator('.cp04-order').first());await q.p.getByRole('button',{name:'Preparar / consultar cotización'}).click()
 const create=q.p.getByRole('button',{name:'Crear cotización',exact:true}),recover=q.p.getByRole('button',{name:'Recuperar borrador de la OT',exact:true})
 const mutations=()=>q.requests.filter(r=>r.path.includes('/rpc/bt_cp05_')).length
 const beforeRecovery=mutations();await recover.click();await q.p.getByText('No hay un borrador de esta OT. Usa Crear cotización para iniciar uno.',{exact:true}).waitFor();assert.equal(mutations(),beforeRecovery)
 await create.click();await q.p.locator('.cp05-workspace-toolbar').waitFor();assert.equal(q.quotes.length,1)
 // Recovering the same OT never invokes the mutation RPC or duplicates a quote.
 if(await q.p.locator('.cp05-source-toggle').isVisible())await q.p.locator('.cp05-source-toggle').click()
 const afterCreation=mutations();await recover.click();await q.p.waitForFunction(()=>!document.querySelector('.cp05-list button.cp04-primary')?.disabled)
 assert.equal(mutations(),afterCreation);assert.equal(q.quotes.length,1)
 await q.p.screenshot({path:out+'/quote-actions-'+width+'.png',fullPage:true});assert.deepEqual(q.errors,[]);await q.p.close()
 results.push({width,inspectionGridPreserved:34,saveConfirmation:'PASS',readyReadOnly:'PASS',pdfModal:'PASS',previewNoWrites:'PASS',quoteRecoveryReadOnly:'PASS',quoteCount:1,status:'PASS'});console.log('PILOT_INSPECTION_QUOTE_PASS',width)
}fs.writeFileSync(out+'/inspection-quote-results.json',JSON.stringify(results,null,2))}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1})
