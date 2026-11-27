// Real historical repository + panel + hash verification; loopback synthetic HTTP only.
const {chromium,webkit}=require('playwright'),{PDFDocument}=require('pdf-lib'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto')
const base=process.env.BT_ARCHIVE_DELTA_URL||'http://127.0.0.1:5252',out=process.env.OUTPUT_DIR||'/tmp/bt-plans-archive-delta',engine=process.env.BT_COMMERCIAL_BROWSER||'chromium'
assert.ok(['chromium','webkit'].includes(engine));fs.mkdirSync(out,{recursive:true})
const selected=process.env.BT_ARCHIVE_DELTA_CASES?.split(','),run=name=>!selected||selected.includes(name)
const id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),wid=id(1),rid=id(6),uid=id(7)
;(async()=>{const pdf=await PDFDocument.create();pdf.addPage().drawText('SYNTHETIC IMMUTABLE ORIGINAL');const bytes=Buffer.from(await pdf.save()),hash=crypto.createHash('sha256').update(bytes).digest('hex')
 const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{}:{...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']}),results=[]
 async function fixture(width=1366){
  const page=await browser.newPage({viewport:{width,height:900},serviceWorkers:'block'}),requests=[],downloads=[],errors=[],unexpected=[]
  const state={status:200,code:'',authorized:true,corrupt:false,hold:false,release:null,arrived:null};page.setDefaultTimeout(12000)
  page.on('pageerror',e=>errors.push(e.message));page.on('download',d=>downloads.push(d))
  await page.addInitScript(()=>{window.archiveURLs={created:[],revoked:[]};const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);URL.createObjectURL=b=>{const url=create(b);window.archiveURLs.created.push(url);return url};URL.revokeObjectURL=url=>{window.archiveURLs.revoked.push(url);return revoke(url)}})
  const row={workshopId:wid,revisionId:rid,quoteId:id(5),orderId:id(4),vehicleId:id(3),customerId:id(2),revision:1,number:1,issuedAt:'2026-11-27T12:00:00Z',customerName:'Cliente sintético protegido',plate:'QA1234',total:1000,complete:false,canArchive:false,customerArchived:false,vehicleArchived:false,orderCancelled:false,deliveryId:null,quoteStatus:'issued'}
  const doc={kind:'quote',fileName:'original.pdf',bucket:'cp05-quote-documents',path:wid+'/quotes/'+id(5)+'/r1/'+'a'.repeat(64)+'.pdf',sha256:hash,byteLength:bytes.length,contentType:'application/pdf'}
  await page.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());if(url.protocol==='chrome:'&&url.hostname==='resources'||url.protocol==='chrome-extension:'&&url.hostname==='mhjfbmdgcfjbbpaeojofohoefgiehjai')return route.continue()
   if(url.origin!==new URL(base).origin){unexpected.push(url.href);return route.abort()}
   if(!url.pathname.startsWith('/archive-delta/'))return route.continue()
   const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)})
   if(url.pathname==='/archive-delta/identity'){assert.equal(req.method(),'GET');return reply({error:null,data:{user:state.authorized?{id:uid,email_confirmed_at:'confirmed'}:null}})}
   if(url.pathname==='/archive-delta/rpc'){assert.equal(req.method(),'POST');const {name,args}=req.postDataJSON();assert.equal(args.p_workshop_id,wid);assert.ok(['bt_final_archive_catalog','bt_final_archive_document'].includes(name));if(name==='bt_final_archive_document')assert.equal(args.p_revision_id,rid);return reply({error:null,data:name==='bt_final_archive_catalog'?[row]:{...row,documents:[doc]}})}
   if(url.pathname==='/archive-delta/document'){
    assert.equal(req.method(),'POST');const args=req.postDataJSON();assert.deepEqual(Object.keys(args).sort(),['action','endpoint','kind','requestId','revisionId','workshopId']);assert.equal(args.endpoint,'bt-final-archive');assert.equal(args.action,'download');assert.equal(args.kind,'quote');assert.equal(args.workshopId,wid);assert.equal(args.revisionId,rid);assert.match(args.requestId,/^[a-f0-9-]{36}$/);requests.push(args)
    if(state.hold){state.arrived?.();await new Promise(resolve=>{state.release=resolve})}
    if(state.status!==200)return reply({error:state.code},state.status)
    const body=Buffer.from(bytes);if(state.corrupt)body[30]^=1;return route.fulfill({status:200,contentType:'application/pdf',body})
   }
   unexpected.push(url.pathname);return route.abort()
  })
  await page.goto(base+'/archive-commercial-delta.html');await page.waitForFunction(()=>window.archiveDelta?.ready())
  await page.locator('.final-archive-row').click();await page.getByRole('button',{name:'Visualizar cotización emitida',exact:true}).click();await page.locator('.final-archive-preview iframe').waitFor()
  const originalURL=await page.locator('iframe').getAttribute('src');assert.equal(requests.length,1)
  const attempt=()=>page.evaluate(()=>document.querySelector('button[aria-label="Descargar cotización emitida"]').click()) // Real DOM handler while existing viewer remains open.
  return {page,state,requests,downloads,errors,unexpected,originalURL,attempt}
 }
 async function closed(f){await f.page.waitForFunction(()=>!document.querySelector('iframe'));assert.ok((await f.page.evaluate(()=>window.archiveURLs.revoked)).includes(f.originalURL));assert.equal(f.downloads.length,0)}
 async function done(f,name){assert.deepEqual(f.errors,[]);assert.deepEqual(f.unexpected,[]);await f.page.screenshot({path:out+'/'+name+'.png',fullPage:true});results.push({name,status:'PASS',calls:f.requests.length,downloads:f.downloads.length,realRepositoryAndPanel:true});console.log('ARCHIVE_DELTA_PASS',name);await f.page.close()}
 try{
  const cases=[['missing',404,'NOT_FOUND','El original no está disponible',false],['integrity',409,'INTEGRITY','El documento no coincide',false],['disabled',503,'DISABLED','El archivo documental no está habilitado',false],['session',401,'SESSION_INVALID','Tu sesión ya no es válida',true],['permission',403,'PERMISSION_DENIED','Tu sesión o tus permisos',true],['unknown-permission',403,'UNKNOWN','Tu sesión o tus permisos',true],['plan',403,'PLAN_CAPABILITY_REQUIRED','Esta función está disponible',false],['quota',429,'COMMERCIAL_QUOTA_EXHAUSTED','Has utilizado las solicitudes',false],['technical-body',500,'COMMERCIAL_QUOTA_EXHAUSTED','No se pudo confirmar la consulta',false],['session-body',401,'PLAN_CAPABILITY_REQUIRED','Tu sesión ya no es válida',true],['renewal-spoof',403,'DOCUMENT_OPERATION_NOT_CURRENT','Tu sesión o tus permisos',true]]
  for(const [name,status,code,message,denied] of cases){if(!run(name))continue;const f=await fixture(['session','plan'].includes(name)?390:1366);f.state.status=status;f.state.code=code;await f.attempt();await f.page.getByRole('alert').filter({hasText:message}).waitFor();await closed(f)
   assert.equal(f.requests.length,2);assert.equal(f.requests[1].requestId,f.requests[0].requestId);assert.equal(await f.page.getByRole('button',{name:'Iniciar nueva operación documental'}).count(),0)
   if(denied){assert.equal(await f.page.locator('.final-archive-row').count(),0);assert.equal(await f.page.locator('.final-archive-document').count(),0);assert.equal((await f.page.locator('body').innerText()).includes('Cliente sintético protegido'),false);assert.equal(await f.page.locator('.final-archive[data-loading="false"]').count(),1)}else assert.equal(await f.page.locator('.final-archive-row').count(),1)
   const help=await f.page.getByRole('button',{name:'Ver planes y beneficios',exact:true}).count();assert.equal(help,['plan','quota'].includes(name)?1:0)
   await done(f,name)
  }
  if(run('explicit-renewal')){const f=await fixture(390);f.state.status=409;f.state.code='DOCUMENT_OPERATION_NOT_CURRENT';await f.attempt();const renewal=f.page.getByRole('button',{name:'Iniciar nueva operación documental'});await renewal.waitFor();await closed(f);assert.equal(f.requests.length,2)
   f.page.once('dialog',d=>d.dismiss());await renewal.click();assert.equal(f.requests.length,2);await renewal.waitFor()
   f.page.once('dialog',d=>d.accept());await renewal.click();assert.equal(f.requests.length,2);f.state.status=200;const download=f.page.waitForEvent('download');await f.page.getByRole('button',{name:'Descargar cotización emitida',exact:true}).click();await download;assert.notEqual(f.requests[2].requestId,f.requests[0].requestId);assert.equal(f.requests[1].requestId,f.requests[0].requestId);await done(f,'explicit-renewal')}
  if(run('corrupt-original-hash')){const f=await fixture();f.state.corrupt=true;await f.attempt();await f.page.getByRole('alert').filter({hasText:'El documento no coincide'}).waitFor();await closed(f);assert.equal(await f.page.getByRole('button',{name:'Ver planes y beneficios'}).count(),0);await done(f,'corrupt-original-hash')}
  if(run('identity-guard-denial')){const f=await fixture();f.state.authorized=false;await f.attempt();await f.page.getByRole('alert').waitFor();await closed(f);assert.equal(f.requests.length,1);assert.equal(await f.page.locator('.final-archive-row').count(),0);await done(f,'identity-guard-denial')}
  if(run('authorization-denial-discards-stale-response')){const f=await fixture();f.state.hold=true;const arrived=new Promise(resolve=>{f.state.arrived=resolve});await f.attempt();await arrived;f.state.authorized=false;await f.page.evaluate(()=>window.archiveDelta.revalidate());await f.page.getByRole('alert').waitFor();await closed(f);f.state.authorized=true;f.state.hold=false;f.state.release();await f.page.waitForFunction(()=>document.querySelector('.final-archive').dataset.loading==='false');await f.page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.equal(f.downloads.length,0);assert.equal(await f.page.locator('.final-archive-row').count(),0);assert.equal((await f.page.evaluate(()=>window.archiveURLs.created)).length,1);await done(f,'authorization-denial-discards-stale-response')}
  fs.writeFileSync(out+'/archive-delta-'+engine+'.json',JSON.stringify({status:'PASS',engine,count:results.length,cases:results,scope:'Real historical repository, panel, hashes and Blob lifecycle; synthetic loopback HTTP; no production or quota consumption'},null,2)+'\n')
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
