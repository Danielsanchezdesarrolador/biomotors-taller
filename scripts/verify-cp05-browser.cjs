// CP05 affected UI only. Real React/SDK; all hosted requests are intercepted.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const {cp05Page}=require('../tests/harness/cp05BrowserFixture.cjs')
;(async()=>{
 const browser=await chromium.launch({executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']})
 const out=process.env.OUTPUT_DIR||'artifacts/cp05';fs.mkdirSync(out,{recursive:true})
 const qa=process.env.CP05_QA_DOCUMENTS==='true',results=[]
 try{for(const width of (process.env.CP05_WIDTHS||'360,390,430,768,1366,1440,1920').split(',').map(Number)){
  const f=await cp05Page(browser,width),{p,quotes,requests,errors,commands}=f
  if(width<=760)await p.setViewportSize({width,height:780})
  try{
   const tab=name=>p.getByRole('tab',{name,exact:true})
   const panel=name=>p.getByRole('tabpanel',{name,exact:true})
   const dock=p.locator('.cp05-workspace-toolbar')
   await p.locator('.cp04-order').first().click()
   await p.getByRole('button',{name:'Preparar / consultar cotización'}).click()
   await p.getByRole('button',{name:'Crear / recuperar borrador de la OT'}).click()
   await dock.waitFor()
   for(const [description,type,quantity,price] of [['Repuesto','Repuesto','1','52900'],['Mano de obra','Mano de obra','1.5','24900'],['Insumo','Insumo','1.05','10']]){
     await panel('Trabajos y repuestos').getByRole('button',{name:'Agregar otro ítem'}).click()
     await p.getByLabel('Descripción del ítem').fill(description)
     await p.getByLabel('Tipo de ítem').selectOption(type)
     await p.getByLabel('Cantidad del ítem').fill(quantity)
     await p.getByLabel('Precio del ítem').fill(price)
     await p.getByRole('button',{name:'Confirmar partida en el borrador'}).click()
   }
   // Incomplete item form remains the same DOM node across tabs.
   await panel('Trabajos y repuestos').getByRole('button',{name:'Agregar otro ítem'}).click()
   await p.getByLabel('Descripción del ítem').fill('Edición sin confirmar')
   const node=await p.getByLabel('Descripción del ítem').elementHandle()
   const reads=requests.length
   await tab('Condiciones').click()
   await panel('Condiciones').getByLabel('Condiciones',{exact:true}).fill('Condiciones del borrador vigente')
   await tab('Historial').click();await tab('Trabajos y repuestos').click()
   assert.equal(await node.evaluate(el=>el.isConnected&&el.value==='Edición sin confirmar'),true)
   assert.equal(requests.length,reads,'Tabs must not refetch, write, or reload the document')
   await p.getByRole('button',{name:'Cancelar edición de partida'}).click()
   await tab('Trabajos y repuestos').focus();await p.keyboard.press('ArrowRight')
   assert.equal(await tab('Condiciones').getAttribute('aria-selected'),'true')
   assert.equal(await tab('Condiciones').evaluate(el=>document.activeElement===el),true)
   assert.equal(await panel('Condiciones').locator('textarea').first().inputValue(),'Condiciones del borrador vigente')
   await dock.getByRole('button',{name:'Guardar borrador en Supabase'}).click()
   if(width===390){
     await p.getByRole('button',{name:'Recuperar operación confirmada'}).click()
     await p.getByText('Guardado confirmado y versión recuperada del servidor.',{exact:true}).waitFor()
   }else await p.getByText('Borrador confirmado en Supabase.',{exact:true}).waitFor()
   assert.equal(commands.size,2,'No duplicate save RPC during reconciliation')
   if(width===1366)await p.getByText(/Operación confirmada. No se pudo actualizar el listado/).waitFor()
   assert.match(await p.getByLabel('Total siempre visible').innerText(),/107.411/)
   await tab('Trabajos y repuestos').click()
   assert.equal(await panel('Trabajos y repuestos').locator('tbody tr').count(),3)
   const draftDownload=p.waitForEvent('download');await dock.getByRole('button',{name:'Descargar PDF de borrador'}).click()
   const draft=await draftDownload;await draft.saveAs(`${out}/borrador-${width}.pdf`)
   assert.equal(fs.readFileSync(`${out}/borrador-${width}.pdf`).subarray(0,5).toString(),'%PDF-')
   const issue=dock.getByRole('button',{name:'Emitir revisión archivada',exact:true})
   if(qa){
     await issue.waitFor();assert.equal(await issue.isEnabled(),true)
     p.once('dialog',d=>d.accept());await issue.click()
     await p.getByText('Revisión emitida y archivo privado verificado.',{exact:true}).waitFor()
   }else{
     assert.equal(await dock.getByRole('button',{name:'Emitir revisión archivada · pendiente'}).isDisabled(),true)
     await f.makeRevision() // Simulate an already-issued, persisted server snapshot.
     await dock.getByRole('button',{name:'Recargar versión guardada'}).click()
     await p.getByText('Emitida e inmutable',{exact:true}).waitFor()
   }
   assert.match(await dock.innerText(),/Emitida/)
   assert.match(await dock.innerText(),/R1/)
   if(width<=760)await p.getByRole('button',{name:'Cambiar cotización u OT'}).click()
   await p.getByRole('button',{name:'COT-000001 · R1 · Emitida',exact:true}).waitFor()
   assert.equal(await p.getByRole('button',{name:'COT-000001 · R0 · Borrador',exact:true}).count(),0)
   if(width<=760)await p.getByRole('button',{name:'Cambiar cotización u OT'}).click()
   assert.equal(await panel('Trabajos y repuestos').getByRole('button',{name:/Editar ítem|Eliminar ítem|Agregar otro ítem/}).count(),0)
   const topPdf=dock.getByRole('button',{name:'Descargar PDF emitido',exact:true})
   assert.equal(await topPdf.isVisible(),true)
   assert.equal(await topPdf.isEnabled(),qa)
   if(qa){
     const pending=p.waitForEvent('download');await topPdf.click();const downloaded=await pending
     assert.deepEqual(fs.readFileSync(await downloaded.path()),f.archived.get(f.revisions[0].id))
   }
   await dock.getByRole('button',{name:'Ver historial',exact:true}).click()
   const history=panel('Historial'),detail=history.getByRole('article',{name:'Contenido de la revisión 1'})
   await detail.waitFor();assert.equal(await detail.locator('tbody tr').count(),3)
   assert.match(await detail.innerText(),/Cliente histórico congelado/)
   assert.equal(await detail.getByRole('button',{name:/Editar ítem|Eliminar ítem|Agregar otro ítem/}).count(),0)
   const count=requests.length
   await tab('Condiciones').click();await tab('Historial').click()
   assert.equal(requests.length,count,'Selecting frozen history is local presentation')
   assert.equal(await history.getByRole('button',{name:'Enviar correo · desactivado'}).isVisible(),false)
   await history.locator('.cp05-email-controls summary').click()
   assert.equal(await history.getByRole('button',{name:'Enviar correo · desactivado'}).isDisabled(),true)
   // Internal scroll leaves the essential toolbar in place, without a floating pill.
   const before=await dock.boundingBox()
   await history.evaluate(el=>{el.scrollTop=el.scrollHeight})
   const after=await dock.boundingBox();assert.ok(Math.abs(before.y-after.y)<2)
   assert.equal(await p.locator('.cp05-floating-total').count(),0)
   assert.equal(await dock.evaluate(el=>getComputedStyle(el).position),'sticky')
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true)
   // Scrolling the outer page must not put the source switch or content under the dock.
   await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight))
   const dockBottom=await dock.evaluate(el=>el.getBoundingClientRect().bottom)
   assert.ok(await p.locator('.cp05-layout').evaluate((el,bottom)=>el.getBoundingClientRect().top>=bottom-1,dockBottom),'Workspace stays below sticky actions')
   if(width<=760){
     const source=p.getByRole('button',{name:'Cambiar cotización u OT'})
     assert.ok(await source.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}),'Mobile source switch is not covered')
   }
   await history.evaluate(el=>el.scrollTop=0)
   await p.screenshot({path:`${out}/viewport-${width}.png`})
   await p.screenshot({path:`${out}/historial-${width}.png`,fullPage:true})
   if(qa){
     const frozen=JSON.stringify(f.revisions[0].payload)
     await dock.getByRole('button',{name:'Abrir nueva revisión',exact:true}).click()
     const conditions=panel('Condiciones')
     await conditions.getByLabel('Motivo de nueva revisión o anulación').fill('Ajuste comercial sintético')
     await conditions.getByRole('button',{name:'Abrir nuevo borrador',exact:true}).click()
     await p.getByText('Nuevo borrador abierto; la revisión emitida permanece intacta.',{exact:true}).waitFor()
     assert.equal(quotes[0].status,'draft');assert.equal(JSON.stringify(f.revisions[0].payload),frozen)
     await tab('Condiciones').click()
     await panel('Condiciones').locator('textarea').first().fill('Cambios sin enviar conservados')
     await tab('Historial').click();await tab('Condiciones').click()
     assert.equal(await panel('Condiciones').locator('textarea').first().inputValue(),'Cambios sin enviar conservados')
     // Multiple frozen revisions: select the older one without reads or changing its payload.
     await f.makeRevision();p.once('dialog',d=>d.accept())
     await dock.getByRole('button',{name:'Recargar versión guardada'}).click()
     await dock.getByRole('button',{name:'Ver historial',exact:true}).click()
     const beforeSelection=requests.length
     await history.getByRole('button',{name:/Revisión 2/}).click()
     await history.getByRole('article',{name:'Contenido de la revisión 2'}).waitFor()
     await history.getByRole('button',{name:/Revisión 1/}).click()
     await history.getByRole('article',{name:'Contenido de la revisión 1'}).waitFor()
     assert.equal(requests.length,beforeSelection)
     assert.equal(JSON.stringify(f.revisions.find(r=>r.revision===1).payload),frozen)
   }
   await p.screenshot({path:`${out}/cotizacion-${width}.png`,fullPage:true})
   assert.equal(errors.length,0,JSON.stringify(errors))
   assert.ok(!requests.some(r=>r.action==='send'))
   if(!qa)assert.ok(!requests.some(r=>r.path.startsWith('/functions/')))
   results.push({width,qaDocuments:qa,tabsPreserveDraft:true,confirmedStatusConsistent:true,topPdfVisible:true,immutableHistory:true,emailDisabled:true,overflow:false,errors})
   fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify(results,null,2))
   console.log('CP05_COMPACT_PASS',width,qa?'QA_DOCUMENTS':'DOCUMENTS_OFF')
  }catch(e){await p.screenshot({path:`${out}/failure-${width}.png`,fullPage:true});console.log(await p.locator('[role=alert]').allTextContents());throw e}
  finally{await p.context().close()}
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
