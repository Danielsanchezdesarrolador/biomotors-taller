const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto')
const out=process.env.BT_FINAL_ARCHIVE_EVIDENCE_DIR||'/tmp/bt-final-archive-evidence'
let browser
;(async()=>{browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']})
 const page=await browser.newPage({viewport:{width:1366,height:980},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto('http://127.0.0.1:47124/final-archive-qa')
 const rows=page.getByRole('region',{name:'Revisiones documentales',exact:true})
 const first=rows.getByRole('button').filter({hasText:'Cliente histórico ficticio'})
 await first.click()
 const docs=page.getByRole('region',{name:'Documentos del expediente',exact:true})
 await docs.getByRole('button',{name:'Descargar informe de trabajos',exact:true}).waitFor()
 assert.equal(await docs.getByRole('button',{name:/Descargar/}).count(),3)
 assert.ok((await first.textContent()).includes('Registro archivado'))
 assert.ok((await first.textContent()).includes('OT cancelada'))
 assert.ok((await first.textContent()).includes('Cotización anulada'))
 for(const name of ['cotización emitida','informe de trabajos','constancia de entrega']){
  const pending=page.waitForEvent('download');await docs.getByRole('button',{name:'Descargar '+name,exact:true}).click();const file=await pending
  const local=await file.path(),bytes=fs.readFileSync(local);assert.ok(bytes.subarray(0,5).toString()==='%PDF-')
  const digest=crypto.createHash('sha256').update(bytes).digest('hex');assert.ok(await docs.getByText(digest,{exact:true}).count()===1)
 }
 await docs.getByRole('button',{name:'Visualizar informe de trabajos',exact:true}).click()
 await page.getByRole('dialog').waitFor();assert.equal(await page.getByRole('dialog').locator('iframe').count(),1)
 await page.waitForTimeout(2500) // Allow Chromium's separate native PDF viewer to paint before visual evidence.
 await page.screenshot({path:out+'/preview-desktop.png',fullPage:true})
 await page.getByRole('button',{name:'Cerrar vista previa'}).click()
 for(const [name,width] of [['desktop',1366],['tablet',768],['mobile',390]]){
  await page.setViewportSize({width,height:920})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no overflow '+name)
  await page.screenshot({path:out+'/'+name+'.png',fullPage:true})
 }
 await page.reload();await first.click();await docs.getByRole('button',{name:'Descargar constancia de entrega',exact:true}).waitFor()
 assert.equal(await docs.getByRole('button',{name:'Archivar expediente definitivo',exact:true}).count(),0)
 // A revision without archived final PDFs remains quote-only; no regeneration control.
 await rows.getByRole('button').filter({hasText:'Cliente revisión dos ficticio'}).click()
 await docs.getByRole('button',{name:'Descargar cotización emitida',exact:true}).waitFor()
 assert.equal(await docs.getByRole('button',{name:/Descargar/}).count(),1)
 // Real creation via HTTP/SQL with a lost response, then the same idempotent request.
 await rows.getByRole('button').filter({hasText:'Tercer cliente ficticio'}).click()
 await docs.getByRole('button',{name:'Archivar expediente definitivo',exact:true}).waitFor()
 const archiveRequests=[]
 await page.route('http://127.0.0.1:47125/function',async route=>{
  if(route.request().method()!=='POST'){await route.continue();return}
  const body=route.request().postDataJSON()
  if(body.action==='archive'){
   archiveRequests.push(body.requestId)
   if(archiveRequests.length===1){const response=await route.fetch();await route.fulfill({response,status:500,json:{error:'UNAVAILABLE'}});return}
  }
  await route.continue()
 })
 page.once('dialog',d=>d.accept());await docs.getByRole('button',{name:'Archivar expediente definitivo',exact:true}).click()
 await page.getByRole('alert').waitFor()
 page.once('dialog',d=>d.accept());await docs.getByRole('button',{name:'Archivar expediente definitivo',exact:true}).click()
 await page.getByText('Archivo confirmado por el servidor. Consulta sus originales; no repitas la creación.',{exact:true}).waitFor()
 assert.equal(archiveRequests.length,2);assert.equal(archiveRequests[0],archiveRequests[1])
 await rows.getByRole('button').filter({hasText:'Tercer cliente ficticio'}).click()
 await docs.getByRole('button',{name:'Descargar constancia de entrega',exact:true}).waitFor()
 await page.screenshot({path:out+'/archive-confirmed-mobile.png',fullPage:true})
 await page.route('http://127.0.0.1:47125/rpc',async route=>{
  if(route.request().method()!=='POST'){await route.continue();return}
  const data=route.request().postDataJSON()
  if(data.name==='bt_final_archive_document'){await route.fulfill({headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:47124'},json:{data:null,error:{code:'42501'}}});return}
  await route.continue()
 })
 await rows.getByRole('button').filter({hasText:'Tercer cliente ficticio'}).click()
 await page.getByText('Tu sesión o tus permisos no permiten consultar este expediente.',{exact:true}).waitFor()
 assert.equal(await rows.getByRole('button').filter({hasText:'cliente ficticio'}).count(),0)
 assert.equal(await docs.getByRole('button',{name:/Descargar/}).count(),0)
 assert.deepEqual(errors,[]);console.log('BT_FINAL_ARCHIVE_BROWSER_PASS: originals, 3 SHA-verified downloads, preview, reload, archived/cancelled/voided, 1366/768/390')
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close()})
