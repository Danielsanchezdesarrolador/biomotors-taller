// CP04 UI export, synthetic HTTP only. No hosted credentials or data.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto')
const {cp04Page,uuid,tenant,userId}=require('../tests/harness/cp04BrowserFixture.cjs')
const out=process.env.OUTPUT_DIR||'artifacts/cp04-pdf-a4'
const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
;(async()=>{
 fs.mkdirSync(out,{recursive:true})
 const browser=await chromium.launch({executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']})
 const results=[]
 try{for(const width of [1366,390]){
   const {p,state,requests,errors}=await cp04Page(browser,width,{customers:[{workshop_id:tenant,id:uuid(50),full_name:'Cliente sintético PDF',email:null,mobile_e164:null}]})
   const items=await p.evaluate(async url=>(await import(url)).multipuntoTemplateItems(),'/@fs/'+process.cwd()+'/src/ordenes/cp04Multipunto.ts')
   state.vehicles[0].model_year=2023
   state.findings=items.map((item,i)=>({id:uuid(700+i),workshop_id:tenant,order_id:uuid(200),vehicle_id:uuid(100),
     category:'Multipunto · '+item.name,result:i%3===0?'ok':'attention',
     note:i%3===0?null:(i%3===1?'':'PRIORIDAD INMEDIATA: ')+'Observación sintética extensa '.repeat(50),
     resolution:i%3===0?'not_applicable':'pending',resolved_at:null,recorded_by:userId,
     created_at:'2026-11-22T15:00:00Z',updated_at:'2026-11-22T15:00:00Z'}))
   await p.locator('.cp04-order').first().click()
   const preview=p.getByRole('button',{name:'Vista previa PDF',exact:true})
   await preview.click()
   const iframe=p.locator('.cp04-pdf-preview iframe');await iframe.waitFor()
   const buffer=Buffer.from(await p.evaluate(async()=>{
     const r=await fetch(document.querySelector('.cp04-pdf-preview iframe').src)
     return Array.from(new Uint8Array(await r.arrayBuffer()))
   }))
   fs.writeFileSync(path.join(out,'multipunto-'+width+'.pdf'),buffer)
   const downloadPromise=p.waitForEvent('download')
   await p.getByRole('button',{name:'Descargar borrador',exact:true}).click()
   const download=await downloadPromise,downloaded=fs.readFileSync(await download.path())
   assert.equal(hash(downloaded),hash(buffer),'Preview and downloaded file must be byte-identical')
   assert.ok(download.suggestedFilename().startsWith('INS-QA1234-'))
   assert.equal(requests.filter(r=>r.method!=='GET'&&r.path.startsWith('/rest/')).length,0,'Export cannot write')
   assert.equal(errors.length,0,JSON.stringify(errors))
   fs.writeFileSync(path.join(out,'states.json'),JSON.stringify(items.map((item,i)=>({...item,state:['ok','attention','immediate'][i%3]})),null,2))
   // A real revocation must still block the workspace after generating a PDF.
   state.revoked=true
   await p.evaluate(()=>{window.dispatchEvent(new Event('focus'))})
   await p.getByText('Cuenta personal verificada.',{exact:false}).waitFor()
   assert.equal(await p.locator('.cp04-pdf-preview iframe').count(),0)
   results.push({width,previewDownloadIdentical:true,writes:0,revocationBlocked:true})
   await p.context().close()
 }}finally{await browser.close()}
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log('CP04_PDF_A4_BROWSER_PASS',JSON.stringify(results))
})().catch(e=>{console.error(e);process.exitCode=1})
