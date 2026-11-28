const {openDocuments,openStatus}=require('../tests/harness/ordersNavigation.cjs')
// Focused CP04 regression. Reuses the real Auth/SDK shell and synthetic HTTP port.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const {PDFDocument}=require('pdf-lib')
const {cp04Page,uuid,tenant}=require('../tests/harness/cp04BrowserFixture.cjs')
;(async()=>{
 const browser=await chromium.launch({executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']})
 const out=process.env.OUTPUT_DIR||'/tmp/bt-cp04-current';fs.mkdirSync(out,{recursive:true})
 const results=[]
 try{for(const width of (process.env.CP04_WIDTHS||'390,768,1366').split(',').map(Number)){
  const f=await cp04Page(browser,width),{p,state,errors,requests}=f
  if(width<=760)await p.setViewportSize({width,height:820})
  const tab=name=>p.getByRole('tab',{name,exact:true})
  const panel=name=>p.getByRole('tabpanel',{name,exact:true})
  const row=id=>p.locator(`.mp-row[data-item="${id}"]`)
  const dock=p.locator('.cp04-workspace-toolbar')
    async function settled(){await p.waitForFunction(()=>{const text=document.querySelector('.cp04-count')?.textContent||'';return !/sin confirmar|error\(es\)/.test(text)});assert.equal(errors.length,0)}
  try{
   async function create(plate){
    await p.locator('.cp04-quick-actions').getByRole('button',{name:'Nueva recepción',exact:true}).click()
    await p.getByLabel('Buscar patente registrada').fill(plate)
    await p.getByRole('button',{name:'Buscar vehículo',exact:true}).click()
    await p.locator('.cp04-found').waitFor()
    await p.getByLabel('Motivo de ingreso *').fill('Inspección sintética CP04 '+plate)
    await p.getByRole('button',{name:'Guardar orden',exact:true}).click()
    await p.getByText('Orden de trabajo guardada en el servidor.',{exact:true}).waitFor()
    await dock.waitFor()
    return state.orders.at(-1)
   }
   for(let vehicleIndex=0;vehicleIndex<2;vehicleIndex++){
    const vehicle={...state.vehicles[0],id:uuid(1000+vehicleIndex),plate:'QX'+(9001+vehicleIndex),plate_key:'QX'+(9001+vehicleIndex)}
    state.vehicles.push(vehicle)
    const order=await create(vehicle.plate);console.log('CP04_VEHICLE_STARTED',width,vehicleIndex)
    const scoped=()=>state.findings.filter(f=>f.order_id===order.id)
    async function model(){return p.evaluate(async input=>{
     const {multipuntoPdfModel}=await import('/@fs/'+input.repo+'/src/ordenes/cp04InspectionPdf.ts')
     return multipuntoPdfModel(input.source)
    },{repo:process.cwd(),source:{workshopName:'Taller QA sintético',order:{order,vehicle},findings:scoped()}})}

    await tab('Inspección multipunto').click()
    const id='general/neblina',r=row(id)
    for(const [next,expected] of [['Requiere atención','attention'],['OK','ok'],['Cambio inmediato','immediate'],['OK','ok'],['Requiere atención','attention'],['clear','unreviewed']]){
     if(next==='clear')await r.getByRole('button',{name:'Limpiar Luces de neblina',exact:true}).click()
     else await r.getByRole('radio',{name:'Luces de neblina · '+next,exact:true}).check()
     if(expected==='attention'||expected==='immediate')await r.getByRole('textbox').fill('Observación sintética '+next)
     await settled();console.log('CP04_TRANSITION',width,vehicleIndex,expected)
     const snapshot=await model();assert.equal(snapshot.rows.find(x=>x.id===id).state,expected)
     if(expected==='ok')assert.equal(snapshot.rows.find(x=>x.id===id).note,'')
     const savedCount=scoped().length
     await tab('Resumen').click()
     const current=panel('Resumen').locator(`[data-current-item="${id}"]`)
     assert.equal(await current.count(),1)
     assert.match(await current.innerText(),new RegExp(expected==='ok'?'OK':expected==='attention'?'Requiere atención':expected==='immediate'?'Cambio inmediato':'Sin revisar'))
     if(expected==='ok'||expected==='unreviewed')assert.equal(await current.locator('p').count(),0)
     await tab('Inspección multipunto').click()
     assert.equal(scoped().length,savedCount,'Tabs do not write or duplicate diagnoses')
    }
    // Rapid independent marking, then navigate away before debounce finishes.
    for(const component of ['general/bajas','general/intermitentes','general/altas','general/freno-luces','general/reversa','general/posicion'])
     await row(component).getByRole('radio',{name:/ · OK$/}).check()
    await tab('Observaciones pendientes').click()
    await tab('Inspección multipunto').click();await settled()
    assert.equal(scoped().filter(x=>x.result==='ok').every(x=>x.note===null),true)
    assert.equal(scoped().filter(x=>x.result==='attention').every(x=>x.resolution==='pending'&&x.resolved_at===null),true)
    const original=JSON.stringify(scoped())
    await tab('Historial de diagnósticos').click()
    assert.equal(await panel('Historial de diagnósticos').locator('[data-finding-id]').count(),scoped().length)
    await p.reload();await dock.waitFor()
    await tab('Inspección multipunto').click()
    assert.equal(await r.getByRole('radio',{checked:true}).count(),0)
    assert.equal(await panel('Inspección multipunto').getByRole('radio',{checked:true}).count(),6)
    assert.equal(JSON.stringify(scoped()),original)
    console.log('CP04_RELOAD_CONFIRMED',width,vehicleIndex)
    const download=p.waitForEvent('download')
    await openDocuments(p);await dock.getByRole('button',{name:'Descargar borrador',exact:true}).click()
    const pdf=await download,bytes=fs.readFileSync(await pdf.path()),document=await PDFDocument.load(bytes)
    assert.equal(document.getPageCount(),1);assert.ok(Math.abs(document.getPage(0).getWidth()-595.28)<1)
    await pdf.saveAs(`${out}/multipunto-${width}-${vehicleIndex}.pdf`)
    // Close this synthetic visit; a new visit cannot inherit the X or erase pending history.
    p.once('dialog',d=>d.accept())
    await openStatus(p);await dock.getByRole('button',{name:'Cerrar y conservar historial',exact:true}).click()
    await p.getByText('Orden cerrada y conservada en el historial del vehículo.',{exact:true}).waitFor()
    const nextOrder=await create(vehicle.plate)
    assert.notEqual(nextOrder.id,order.id)
    await tab('Resumen').click()
    assert.match(await panel('Resumen').locator('[data-current-item="general/neblina"]').innerText(),/Sin revisar/)
    await tab('Observaciones pendientes').click()
    assert.equal(await panel('Observaciones pendientes').locator('.cp04-pending').count(),1)
    assert.match(await panel('Observaciones pendientes').innerText(),/Observación sintética Requiere atención/)
    assert.equal(JSON.stringify(scoped()),original)
    await tab('Inspección multipunto').click()
    assert.equal(await panel('Inspección multipunto').getByRole('radio',{checked:true}).count(),0)
   }
   // Typed technical text and current panel survive local navigation and reload.
   await row('general/bajas').getByRole('radio',{name:/Requiere atención/}).check()
   await row('general/bajas').getByRole('textbox').fill('Nota conservada entre pestañas')
   const text=await row('general/bajas').getByRole('textbox').elementHandle(),requestCount=requests.length
   await tab('Resumen').click();await tab('Inspección multipunto').click()
   assert.equal(await text.evaluate(el=>el.isConnected&&el.value==='Nota conservada entre pestañas'),true)
   await settled()
   assert.ok(requests.length>=requestCount)
   await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight))
   const content=p.locator('.cp04-workspace-content'),header=await dock.boundingBox(),body=await content.boundingBox()
   assert.equal(await panel('Inspección multipunto').evaluate(el=>getComputedStyle(el).overflowY),'visible','Inspection uses the main document scroll')
   assert.ok(header.height<650,'Contextual header leaves usable space')
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true)
   const cell=await row('general/bajas').locator('.mp-cell').first().boundingBox();assert.ok(cell.height>=44)
   await panel('Inspección multipunto').evaluate(el=>el.scrollTop=0)
   await p.screenshot({path:`${out}/inspeccion-${width}.png`})
   await tab('Resumen').click();await p.screenshot({path:`${out}/resumen-${width}.png`})
   await tab('Observaciones pendientes').click();await p.screenshot({path:`${out}/pendientes-${width}.png`})
   await tab('Historial de diagnósticos').click();await p.screenshot({path:`${out}/historial-${width}.png`})
   // Existing routing without workshop flags remains a restricted technical portal.
   // Repository mechanic inspection authority is verified separately in unit tests.
   state.role='mechanic';await p.reload()
   await p.getByRole('heading',{name:'Tu espacio de trabajo técnico',exact:true}).waitFor()
   assert.equal(await p.locator('.cp04-workspace-toolbar').count(),0)
   assert.equal(await p.getByRole('button',{name:'Guardar orden',exact:true}).count(),0)
   assert.equal(errors.length,0,JSON.stringify(errors))
   assert.ok(requests.every(r=>r.method!=='DELETE'))
   results.push({width,twoNewVehicles:true,transitions:true,historyRetained:true,persistedReload:true,newVisitPendingRetained:true,pdfA4OnePage:true,mobileTouch44:true,overflow:false,mechanic:true,status:'PASS'})
   fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log('CP04_CURRENT_PASS',width)
  }catch(e){await p.screenshot({path:`${out}/failure-${width}.png`,fullPage:true});console.log(await p.locator('[role=alert]').allTextContents());throw e}
  finally{await p.context().close()}
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
