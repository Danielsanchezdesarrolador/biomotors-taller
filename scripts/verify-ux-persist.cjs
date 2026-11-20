// BT-UX-PERSIST-01: real React/SDK with synthetic HTTP only, never hosted data.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const {cp04Page,uuid,tenant,userId}=require('../tests/harness/cp04BrowserFixture.cjs')
const out=process.env.OUTPUT_DIR||'artifacts/bt-ux-persist'
const api='https://suxcqqnmcjoezfxltoms.supabase.co'
const delay=ms=>new Promise(r=>setTimeout(r,ms))
const dataReads=requests=>requests.filter(r=>r.method==='GET'&&!['/rest/v1/profiles','/rest/v1/workshop_memberships','/rest/v1/workshops'].includes(r.path)&&!r.path.startsWith('/auth/')).length
const active=p=>p.locator('[data-workspace-section]:not([hidden])')
async function stable(p,value){
 assert.equal(await p.evaluate(()=>window.__uxInput.isConnected),true,'Original form node remains mounted')
 assert.equal(await p.evaluate(()=>window.__uxInput.value),value)
 assert.equal(await p.evaluate(()=>window.__uxLoginFlashes),0)
 assert.equal(await p.evaluate(()=>document.querySelector('.app-shell')===window.__uxShell),true)
}
;(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,args:['--no-sandbox']})
 const results=[]
 try{for(const width of [1366,390,768]){
  let context
  try {context=await cp04Page(browser,width,{customers:[{id:uuid(50),workshop_id:tenant,full_name:'Cliente sintético UX',email:null,mobile_e164:null,archived_at:null}]})} catch(error){const page=browser.contexts()[0]?.pages()[0];if(page){await page.screenshot({path:out+'/startup-failure.png'});console.log(await page.locator('[role=status],[role=alert]').allTextContents())}throw error}
  const {p,state,requests,errors}=context
  p.setDefaultTimeout(15000)
  const nav=index=>p.locator(width>760?'.side-nav button':'.bottom-nav button').nth(index).click()
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
  await nav(2);await p.getByRole('button',{name:'Nuevo cliente',exact:true}).click()
  await p.getByLabel('Nombre completo *').fill('Borrador de cliente sin guardar')
  await nav(0);await nav(4);await p.goBack();await p.goBack()
  assert.equal(await active(p).getAttribute('data-workspace-section'),'clientes')
  assert.equal(await p.getByLabel('Nombre completo *').inputValue(),'Borrador de cliente sin guardar')
  const beforeReturn=dataReads(requests);await nav(1);await stable(p,value)
  assert.equal(dataReads(requests),beforeReturn,'Return to a mounted module reuses its view')
  assert.ok(Math.abs(await p.evaluate(()=>scrollY)-position)<=2,JSON.stringify({width,expected:position,actual:await p.evaluate(()=>scrollY)}))
  await p.locator('.cp04-order').first().click();await p.getByRole('button',{name:'Abrir inspección multipunto con X'}).click()
  const row=p.locator('.mp-row').first();state.failFindings=true
  await row.getByRole('radio',{name:/ · OK$/}).check();await row.getByText('Error al guardar',{exact:true}).waitFor()
  const attempts=requests.filter(r=>r.method==='POST').length
  await nav(3);await active(p).locator('.cp05-panel').waitFor()
  await nav(1);await row.getByText('Error al guardar',{exact:true}).waitFor()
  assert.equal(await row.getByRole('radio',{name:/ · OK$/}).isChecked(),true)
  await p.evaluate(()=>window.btUxQa.verify());assert.equal(requests.filter(r=>r.method==='POST').length,attempts)
  state.failFindings=false;await row.getByRole('button',{name:'Reintentar esta X',exact:true}).click();await row.getByText('Guardado',{exact:true}).waitFor();assert.equal(state.findings.length,1)
  await p.getByRole('button',{name:'Vista previa PDF',exact:true}).click()
  await p.locator('.cp04-pdf-preview iframe').waitFor()
  await p.evaluate(()=>{window.__uxPdf=document.querySelector('.cp04-pdf-preview iframe')})
  await nav(3);await nav(1)
  assert.equal(await p.evaluate(()=>window.__uxPdf===document.querySelector('.cp04-pdf-preview iframe')&&window.__uxPdf.isConnected),true)
  // CP03 selection and CP06 subview stay mounted while visiting another module.
  await nav(2);await p.getByRole('button',{name:'Cerrar formulario',exact:true}).click()
  await p.getByRole('button',{name:/Cliente sintético UX/}).first().click()
  await p.locator('.cp03-result').filter({hasText:'QA1234'}).click();await p.getByRole('button',{name:'Ver historial',exact:true}).click()
  await p.locator('.cp06-history').waitFor();await p.evaluate(()=>{window.__uxHistory=document.querySelector('.cp06-history')})
  await nav(0);await nav(2);assert.equal(await p.evaluate(()=>window.__uxHistory?.isConnected),true)
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
  results.push({width,status:'PASS',scope:'HTTP mocks, not hosted Auth/RLS or physical Safari',cases:['same DOM/cursor/scroll','screenshot/focus/visibility burst','token refresh','no business reload','five modules/back/forward','unsent CP03/04 forms','pending X no duplicate write','PDF iframe retained','CP06 subview','offline recovery','revoked membership','role change','different verified user denied old memberships']})
  await p.close();console.log('BT_UX_PERSIST_PASS',width)
 }
 fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2))
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
