const {navigateSection}=require('../tests/harness/navigation.cjs')
// BT-UX-PERSIST-01: real React/SDK with synthetic HTTP only, never hosted data.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const {cp04Page,uuid,tenant,userId,businessWrites}=require('../tests/harness/cp04BrowserFixture.cjs')
const out=process.env.OUTPUT_DIR||'artifacts/bt-ux-persist'
const api='https://suxcqqnmcjoezfxltoms.supabase.co'
const delay=ms=>new Promise(r=>setTimeout(r,ms))
const dataReadRecords=requests=>requests.filter(r=>r.method==='GET'&&!['/rest/v1/profiles','/rest/v1/workshop_memberships','/rest/v1/workshops'].includes(r.path)&&!r.path.startsWith('/auth/'))
const dataReads=requests=>dataReadRecords(requests).length
// CP05 intentionally refreshes only its order selector on entry. Match the
// two tenant-scoped operational queries, not a table-wide or timing exemption.
function assertCp05OrderRefresh(reads,vehicleIds){
 assert.deepEqual(reads.map(r=>r.path),['/rest/v1/work_orders','/rest/v1/vehicles'],'CP05 entry reads exactly the order options and their vehicles')
 assert.deepEqual(reads[0].query,{
  select:'workshop_id,id,vehicle_id,complaint,intake_odometer,status,opened_by,opened_at,closed_at,updated_at,vehicles!inner(archived_at,customers!inner(archived_at))',
  workshop_id:'eq.'+tenant,'vehicles.archived_at':'is.null','vehicles.customers.archived_at':'is.null',order:'opened_at.desc',limit:'40'
 },'CP05 order refresh retains tenant scope, active-record filters and the bounded recent list')
 const {id,...vehicleQuery}=reads[1].query
 assert.deepEqual(vehicleQuery,{select:'workshop_id,id,customer_id,plate,plate_key,make,model,odometer_km',workshop_id:'eq.'+tenant},'CP05 vehicle lookup remains tenant-scoped')
 assert.match(id||'',/^in\.\([0-9a-f-]+(?:,[0-9a-f-]+)*\)$/)
 assert.deepEqual(id.slice(4,-1).split(',').sort(),[...new Set(vehicleIds)].sort(),'Only vehicles referenced by the expected synthetic orders are read')
}
// Identity lookup is now required for every document action; no blanket GET exemption.
function assertPdfIdentityReads(reads,order,vehicle){
 const q=(select,id)=>({select,workshop_id:'eq.'+tenant,id:'eq.'+id})
 assert.deepEqual(reads,[
  {method:'GET',path:'/rest/v1/work_orders',query:q('workshop_id,id,vehicle_id,complaint,intake_odometer,status,opened_by,opened_at,closed_at,updated_at',order.id)},
  {method:'GET',path:'/rest/v1/vehicles',query:q('workshop_id,id,customer_id,plate,plate_key,make,model,odometer_km',vehicle.id)},
  {method:'GET',path:'/rest/v1/customers',query:q('workshop_id,id,full_name',vehicle.customer_id)},
  {method:'GET',path:'/rest/v1/vehicles',query:q('workshop_id,id,customer_id,model_year',vehicle.id)}
 ],'Exactly the four tenant/resource-scoped identity reads for one authorized document action')
}
const active=p=>p.locator('[data-workspace-section]:not([hidden])')
async function stable(p,value){
 assert.equal(await p.evaluate(()=>window.__uxInput.isConnected),true,'Original form node remains mounted')
 assert.equal(await p.evaluate(()=>window.__uxInput.value),value)
 assert.equal(await p.evaluate(()=>window.__uxLoginFlashes),0)
 assert.equal(await p.evaluate(()=>document.querySelector('.app-shell')===window.__uxShell),true)
}
;(async()=>{
 const engine=process.env.BT_UX_BROWSER||'chromium';assert.ok(['chromium','webkit'].includes(engine))
 fs.mkdirSync(out,{recursive:true});const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{}:{executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']})
 const results=[]
 try{for(const width of (process.env.BT_UX_WIDTHS||'1366,390,768').split(',').map(Number)){
  let context
  try {context=await cp04Page(browser,width,{customers:[{id:uuid(50),workshop_id:tenant,full_name:'Cliente sintético UX',email:null,mobile_e164:null,archived_at:null}]})} catch(error){const page=browser.contexts()[0]?.pages()[0];if(page){await page.screenshot({path:out+'/startup-failure.png'});console.log(await page.locator('[role=status],[role=alert]').allTextContents())}throw error}
  const {p,state,requests,errors,documentCalls,documentOperations}=context
  p.setDefaultTimeout(15000)
  // A separate trace preserves query shape for this assertion without changing
  // the shared fixture's request-log contract or relaxing its route guards.
  const httpTrace=[]
  p.on('request',req=>{
   const url=new URL(req.url())
   if(url.origin===api)httpTrace.push({path:url.pathname,method:req.method(),query:Object.fromEntries(url.searchParams)})
  })
  const nav=screen=>navigateSection(p,screen)
  const waitQuoteOrders=()=>active(p).locator('.cp05-panel select[aria-busy="false"]:enabled').waitFor()
  const waitRead=path=>p.waitForResponse(response=>{
   const url=new URL(response.url())
   return url.origin===api&&url.pathname===path&&response.request().method()==='GET'
  })
  // CP05/06 read-only fixture, scoped to the same synthetic tenant.
  await p.route(api+'/rest/v1/**',async route=>{
   const req=route.request(),url=new URL(req.url()),table=url.pathname.split('/').pop()
   if(!['quotes','quote_items','quote_revisions','quote_events','quote_delivery_events','closing_review_events'].includes(table))return route.fallback()
   assert.equal(req.method(),'GET');assert.equal(url.searchParams.get('workshop_id'),'eq.'+tenant)
   requests.push({path:url.pathname,method:req.method()});return route.fulfill({contentType:'application/json',body:'[]'})
  })
  await p.getByLabel('Buscar patente registrada').fill('QA1234');await p.getByRole('button',{name:'Buscar vehículo',exact:true}).click();await p.locator('.cp04-found').waitFor()
  const value='Recepción sin enviar: conservar texto y cursor'
  await p.getByLabel('Motivo de ingreso *').fill(value)
  await p.evaluate(()=>{
   window.__uxInput=document.querySelector('textarea');window.__uxShell=document.querySelector('.app-shell');window.__uxLoginFlashes=0;window.__uxDocument=crypto.randomUUID()
   window.__uxObserver=new MutationObserver(records=>{for(const r of records)for(const node of r.addedNodes)if(node.nodeType===1&&(node.matches('.access-card-login')||node.querySelector('.access-card-login')))window.__uxLoginFlashes++})
   window.__uxObserver.observe(document.body,{childList:true,subtree:true})
   window.__uxInput.focus({preventScroll:true});window.__uxInput.setSelectionRange(8,8);window.scrollTo(0,500)
  })
  const doc=await p.evaluate(()=>window.__uxDocument),position=await p.evaluate(()=>scrollY),reads=dataReads(requests)
  let hold=true,release;const gate=new Promise(r=>{release=r});let authReads=0
  await p.route(api+'/auth/v1/user',async route=>{authReads++;if(hold)await gate;return route.fallback()})
  await p.evaluate(()=>{
   window.dispatchEvent(new Event('blur'));Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'))
   Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('focus'))
  })
  for(let i=0;i<300&&authReads===0;i++)await delay(10)
  assert.equal(authReads,1,'One coordinated request for a focus/visibility burst')
  await stable(p,value);assert.equal(await p.evaluate(()=>document.activeElement===window.__uxInput&&window.__uxInput.selectionStart===8),true)
  await p.screenshot({path:out+'/background-check-'+width+'.png'})
  hold=false;release();await p.evaluate(()=>window.btUxQa.verify());await stable(p,value)
  assert.equal(dataReads(requests),reads,'Revalidation does not reload business records')
  assert.equal(await p.evaluate(()=>scrollY),position)
  await p.evaluate(()=>window.btUxQa.refresh());await delay(100);await p.evaluate(()=>window.btUxQa.verify());await stable(p,value)
  await nav('clientes');await p.getByRole('button',{name:'Nuevo cliente',exact:true}).click()
  await p.getByLabel('Nombre completo *').fill('Borrador de cliente sin guardar')
  await nav('inicio');await nav('configuracion');await p.goBack();await p.goBack()
  assert.equal(await active(p).getAttribute('data-workspace-section'),'clientes')
  assert.equal(await p.getByLabel('Nombre completo *').inputValue(),'Borrador de cliente sin guardar')
  const beforeReturn=dataReads(requests);await nav('ordenes');await stable(p,value)
  assert.equal(dataReads(requests),beforeReturn,'Return to a mounted module reuses its view')
  assert.ok(Math.abs(await p.evaluate(()=>scrollY)-position)<=2,JSON.stringify({width,expected:position,actual:await p.evaluate(()=>scrollY)}))
  await p.locator('.cp04-order').first().click();await p.getByRole('button',{name:'Abrir inspección multipunto con X'}).click()
  const row=p.locator('.mp-row').first();state.failFindings=true
  await row.getByRole('radio',{name:/ · OK$/}).check();await row.getByText('Error al guardar',{exact:true}).waitFor()
  const attempts=businessWrites(requests).length
  await nav('informes');await active(p).locator('.cp05-panel').waitFor();await waitQuoteOrders()
  await nav('ordenes');await row.getByText('Error al guardar',{exact:true}).waitFor()
  assert.equal(await row.getByRole('radio',{name:/ · OK$/}).isChecked(),true)
  await p.evaluate(()=>window.btUxQa.verify());assert.equal(businessWrites(requests).length,attempts)
  state.failFindings=false;await row.getByRole('button',{name:'Reintentar esta X',exact:true}).click();await row.getByText('Guardado',{exact:true}).waitFor();assert.equal(state.findings.length,1)
  // The approved PDF preview now uses a modal: background navigation is intentionally blocked until it closes.
  const pdfWrites=businessWrites(requests).length
  const modal=p.getByRole('dialog',{name:'Vista previa del borrador · No enviado'})
  const frame=modal.getByTitle('Vista previa de la inspección multipunto en PDF')
  const openPdf=async()=>{
   await p.getByRole('button',{name:'Vista previa PDF',exact:true}).click()
   await modal.waitFor();await frame.waitFor()
   const src=await frame.getAttribute('src');assert.ok(src?.startsWith('blob:'))
   const digest=await p.evaluate(async url=>{
    const response=await fetch(url.split('#')[0]);if(!response.ok)throw Error('PDF unavailable')
    const bytes=await response.arrayBuffer()
    if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('Not a PDF')
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)))
   },src)
   await modal.getByRole('button',{name:'Cerrar vista previa PDF'}).click()
   await modal.waitFor({state:'detached'})
   return digest
  }
  const order=state.orders[0],vehicle=state.vehicles.find(v=>v.id===order.vehicle_id)
  assert.ok(vehicle)
  const documentStart=httpTrace.length,firstReads=dataReads(requests),callStart=documentCalls.length,ledgerStart=documentOperations.size
  const originalPdf=await openPdf()
  const assertAction=(start,readStart,index,status,replay)=>{
   const phase=httpTrace.slice(start)
   assertPdfIdentityReads(dataReadRecords(phase),order,vehicle)
   assert.equal(dataReads(requests),readStart+4)
   assert.deepEqual(phase.filter(r=>r.path.startsWith('/functions/')).map(r=>[r.method,r.path]),[['POST','/functions/v1/bt-commercial-documents']])
   assert.equal(documentCalls.length,index+1)
   const call=documentCalls[index]
   assert.deepEqual(call,{action:'multipunto',workshopId:tenant,orderId:order.id,requestId:documentCalls[callStart].requestId,status,replay})
   assert.equal(documentOperations.size,ledgerStart+1)
   assert.equal(documentOperations.get(call.requestId)?.confirmed,true)
  }
  assertAction(documentStart,firstReads,callStart,200,false)
  const pdfReads=dataReads(requests),navStart=requests.length,traceStart=httpTrace.length
  // Wait for both specific CP05 responses and its ready selector before leaving:
  // do not cancel the intentional refresh or attribute late reads to the PDF.
  const [orderResponse,vehicleResponse]=await Promise.all([
   waitRead('/rest/v1/work_orders'),waitRead('/rest/v1/vehicles'),nav('informes')
  ])
  assert.ok(orderResponse.ok()&&vehicleResponse.ok(),'CP05 selector refresh succeeded')
  await waitQuoteOrders()
  const navReads=dataReadRecords(httpTrace.slice(traceStart))
  console.log('BT_UX_PDF_NAVIGATION_READS',engine,width,JSON.stringify(navReads))
  assertCp05OrderRefresh(navReads,state.orders.map(o=>o.vehicle_id))
  assert.deepEqual(dataReadRecords(requests.slice(navStart)).map(r=>r.path),navReads.map(r=>r.path),'Fixture and browser trace agree on the exact two navigation reads')
  assert.equal(dataReads(requests),pdfReads+2,'No other business reads while visiting CP05')
  const returnStart=httpTrace.length
  await nav('ordenes')
  assert.deepEqual(dataReadRecords(httpTrace.slice(returnStart)),[],'Returning to mounted CP04 does not reload business records')
  assert.equal(documentCalls.length,callStart+1,'Navigation alone does not request a document')
  const reopenStart=httpTrace.length,reopenReadStart=dataReads(requests)
  assert.deepEqual(await openPdf(),originalPdf,'Same server-authorized canonical PDF bytes for the same operation UUID')
  assertAction(reopenStart,reopenReadStart,callStart+1,200,true)
  console.log('BT_UX_PDF_REOPEN_READS',engine,width,JSON.stringify(dataReadRecords(httpTrace.slice(reopenStart))))
  // A denial before the client sees a plan change cannot reuse locally delivered bytes.
  state.documentPlan='basic'
  const denialStart=httpTrace.length,denialReads=dataReads(requests)
  await p.getByRole('button',{name:'Vista previa PDF',exact:true}).click()
  await p.getByText('No se pudo autorizar el documento. Revisa el plan, la cuota disponible, tu sesión y los permisos del taller.',{exact:true}).waitFor()
  assert.equal(await modal.count(),0)
  assertAction(denialStart,denialReads,callStart+2,403,false)
  state.documentPlan='full'
  assert.equal(businessWrites(requests).length,pdfWrites,'No unintended business writes or issue; one confirmed synthetic document operation')
  console.log('BT_UX_PDF_REAUTH_PASS',engine,width,'two authorized actions, one confirmed UUID, one denied action, equal canonical hashes')
  // CP03 selection and CP06 subview stay mounted while visiting another module.
  await nav('clientes');await p.getByRole('button',{name:'Cerrar formulario',exact:true}).click()
  await p.getByRole('button',{name:/Cliente sintético UX/}).first().click()
  await p.locator('.cp03-result').filter({hasText:'QA1234'}).click();await p.getByRole('button',{name:'Ver historial',exact:true}).click()
  await p.locator('.cp06-history').waitFor();await p.evaluate(()=>{window.__uxHistory=document.querySelector('.cp06-history')})
  await nav('inicio');await nav('clientes');assert.equal(await p.evaluate(()=>window.__uxHistory?.isConnected),true)
  assert.equal(await p.evaluate(()=>window.__uxDocument),doc,'No document reload')
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
  await p.screenshot({path:out+'/history-'+width+'.png',fullPage:true})
  // Offline is a hard boundary; reauthorization is mandatory before restoring scoped drafts.
  await p.context().setOffline(true);await p.getByText('Sin conexión.',{exact:false}).waitFor();assert.equal(await p.locator('.workspace-views').count(),0)
  await p.context().setOffline(false);await p.locator('.app-shell').waitFor()
  state.revoked=true;await p.evaluate(()=>window.btUxQa.verify());assert.equal(await p.locator('.workspace-views').count(),0)
  assert.equal(await p.evaluate(()=>window.__uxInput.isConnected),false)
  state.revoked=false;await p.evaluate(()=>window.btUxQa.verify());await p.locator('.app-shell').waitFor()
  state.role='mechanic';await p.evaluate(()=>window.btUxQa.verify())
  assert.equal(await p.locator('.workspace-views').count(),0)
  await p.getByRole('heading',{name:'Tu espacio de trabajo técnico'}).waitFor()
  state.role='owner';await p.evaluate(()=>window.btUxQa.verify());await p.locator('.app-shell').waitFor()
  await p.route(api+'/auth/v1/user',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({id:uuid(999),aud:'authenticated',email:'another-synthetic@invalid.test',email_confirmed_at:'2026-11-20T00:00:00Z',user_metadata:{}})}))
  await p.route(api+'/rest/v1/profiles**',route=>route.fulfill({contentType:'application/json',body:'null'}))
  await p.evaluate(()=>window.btUxQa.verify());assert.equal(await p.locator('.workspace-views').count(),0)
  assert.equal(await p.evaluate(()=>window.__uxInput.isConnected),false)
  assert.deepEqual(errors,[])
  results.push({engine,width,status:'PASS',scope:'HTTP mocks, not hosted Auth/RLS or physical Safari',cases:['same DOM/cursor/scroll','screenshot/focus/visibility burst','token refresh','no business reload','five modules/back/forward','unsent CP03/04 forms','pending X no duplicate write','PDF: CP05 entry exactly two scoped reads; CP04 return none; each document action four scoped identity reads and one POST, same UUID/canonical SHA-256, one synthetic confirmation, server denial without fallback, no unintended writes','CP06 subview','offline recovery','revoked membership','role change','different verified user denied old memberships']})
  await p.close();console.log('BT_UX_PERSIST_PASS',engine,width)
 }
 fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2))
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
