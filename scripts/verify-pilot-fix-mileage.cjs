// Targeted mileage, truthful failed-save copy and viewport PDF evidence; synthetic HTTP only.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const {cp04Page,uuid,tenant,userId}=require('../tests/harness/cp04BrowserFixture.cjs')
assert.ok(['chromium','webkit'].includes(process.env.BT_PILOT_BROWSER||'chromium'),'Unsupported browser engine')
const out=process.env.OUTPUT_DIR||'/tmp/bt-pilot-fix-evidence'
;(async()=>{const b=await (process.env.BT_PILOT_BROWSER==='webkit'?webkit:chromium).launch(process.env.BT_PILOT_BROWSER==='webkit'?{}:{...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});const results=[]
try{for(const width of (process.env.PILOT_WIDTHS||'1440,390').split(',').map(Number)){
 const {p,state,errors}=await cp04Page(b,width);p.setDefaultTimeout(12000)
 state.customers.push({id:uuid(50),workshop_id:tenant,full_name:'Cliente sintético kilometraje',email:null,mobile_e164:null,notes:null,archived_at:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()})
 const nav=async index=>p.locator(width>760?'.side-nav button':'.bottom-nav button').nth(index).click()
 await nav(2);await p.getByRole('button',{name:/Cliente sintético kilometraje/}).click();await p.getByRole('button',{name:'Agregar vehículo',exact:true}).click()
 await p.getByLabel('Marca *',{exact:true}).fill('Synthetic');await p.getByLabel('Modelo *',{exact:true}).fill('Pilot');await p.getByLabel(/Patente/).last().fill('QA9900')
 const km=p.getByLabel('Kilometraje',{exact:true});await km.fill('120.00');await p.getByText(/Kilometraje inválido/).waitFor();assert.equal(await km.inputValue(),'120.00');assert.equal(state.vehicles.some(v=>v.plate==='QA9900'),false)
 await km.fill('120.000');await p.getByRole('button',{name:'Guardar ficha del vehículo',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('.cp03-editor'))
 assert.equal(state.vehicles.find(v=>v.plate==='QA9900').odometer_km,120000)
 await nav(1);await p.getByLabel('Buscar patente registrada',{exact:true}).fill('QA9900');await p.getByRole('button',{name:'Buscar vehículo',exact:true}).click()
 await p.getByLabel('Motivo de ingreso *').fill('Recepción sintética de kilometraje');await p.getByLabel('Kilometraje de recepción',{exact:true}).fill('120.000');await p.getByRole('button',{name:'Guardar orden',exact:true}).click()
 try{await p.waitForFunction(()=>document.querySelector('.cp04-order.selected'))}catch(e){await p.screenshot({path:out+'/mileage-diagnostic-'+width+'.png',fullPage:true});console.log('MILEAGE_DIAGNOSTIC',JSON.stringify({orders:state.orders,errors,text:await p.locator('.cp04-private').innerText()}));throw e}
 assert.equal(state.orders.find(o=>o.complaint==='Recepción sintética de kilometraje').intake_odometer,120000)
 await p.getByRole('button',{name:'Abrir inspección multipunto con X'}).click();state.failFindings=true
 await p.locator('.mp-row').first().getByRole('radio',{name:/ · OK$/}).check();await p.locator('.cp04-inline-status.is-error').first().waitFor()
 assert.match(await p.locator('.cp04-count').innerText(),/sin confirmar/);assert.ok(!/Guardado correctamente/.test(await p.locator('.cp04-count').innerText()));assert.match(await p.locator('.cp04-checklist').innerText(),/copia temporal/)
 await p.screenshot({path:out+'/save-failure-'+width+'.png',fullPage:true});state.failFindings=false;await p.getByRole('button',{name:'Reintentar guardados',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.cp04-count strong')?.textContent==='1/34')
 await p.locator('.mp-row').first().getByRole('radio',{name:/ · Requiere atención$/}).check()
 const note=p.getByRole('textbox',{name:/Observación técnica de/}).first();const detail='Detalle técnico sintético completo. '.repeat(18).trim();await note.fill(detail)
 for(let attempt=0;attempt<25&&!state.findings.some(f=>f.note===detail);attempt++)await p.waitForTimeout(200)
 assert.ok(state.findings.some(f=>f.note===detail));const field=await note.boundingBox();assert.ok(field.width>180&&field.height>=48&&field.height<=152)
 await p.screenshot({path:out+'/technical-detail-'+width+'.png',fullPage:true})
 await p.getByRole('button',{name:'Vista previa PDF',exact:true}).click();const dialog=p.getByRole('dialog');await dialog.waitFor();await p.waitForTimeout(1200)
 const box=await dialog.boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=950)
 assert.match(await dialog.locator('iframe').getAttribute('src'),/#view=FitH$/)
 await p.screenshot({path:out+'/pdf-viewport-'+width+'.png'});await p.keyboard.press('Escape');await dialog.waitFor({state:'detached'})
 assert.deepEqual(errors,[]);results.push({width,status:'PASS',vehicleOdometer:120000,intakeOdometer:120000,invalidRetained:true,failedSaveHasNoSuccess:true,localDraftWarningPreserved:true,confirmedRetry:true,compactTechnicalDetail:true,pdfCenteredWithinViewport:true,pdfFitWidthFragment:true});console.log('PILOT_MILEAGE_SAVE_PDF_PASS',width);await p.close()
}fs.writeFileSync(out+'/mileage-save-results.json',JSON.stringify(results,null,2))}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
