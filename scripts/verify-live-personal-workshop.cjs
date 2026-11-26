// LIVE-FIX-01: real React/SDK, synthetic intercepted HTTP only.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const engine=process.env.BT_LIVE_PERSONAL_BROWSER||'chromium'
assert.ok(['chromium','webkit'].includes(engine),'Unsupported browser engine')
const base=process.env.LIVE_PERSONAL_URL||'http://127.0.0.1:5241',out=process.env.OUTPUT_DIR||'/tmp/bt-live-personal-evidence'
const api='https://suxcqqnmcjoezfxltoms.supabase.co',uid='00000000-0000-4000-8000-000000000002',old='00000000-0000-4000-8000-000000000011',own='00000000-0000-4000-8000-000000000012'
const jwt=()=>Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:uid,role:'authenticated',aud:'authenticated',aal:'aal2',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.'+Buffer.from('synthetic-test-signature').toString('base64url')
;(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{}:{...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});const results=[]
try{for(const width of [1440,390]){
 const p=await browser.newPage({viewport:{width,height:940},serviceWorkers:'block'}),errors=[],unexpected=[],mutations=[]
 const user={id:uid,aud:'authenticated',email:'live-personal@invalid.test',email_confirmed_at:'2026-11-26T00:00:00Z',user_metadata:{full_name:'Operador sintético'},factors:[]}
 let personal='full',lifetime=true,expiry=null,created=false,ownPlan='full',badPersonal=false
 const oldWorkshop={id:old,name:'Taller Básico existente · Sintético',status:'active'},oldSub={plan:'basic',state:'active'}
 const membership={user_id:uid,workshop_id:old,role:'admin',status:'active'},members=[membership]
 const before=JSON.stringify([oldWorkshop,oldSub,membership])
 p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept())
 await p.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());if(url.origin===new URL(base).origin)return route.continue()
  if(url.origin!==api){unexpected.push(url.origin);return route.abort()}
  const args=req.method()==='POST'?req.postDataJSON():{},path=url.pathname
  const reply=(v,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(v)})
  if(path==='/auth/v1/token')return reply({access_token:jwt(),refresh_token:'synthetic',token_type:'bearer',expires_in:3600,user})
  if(path==='/auth/v1/user')return reply(user)
  if(path==='/auth/v1/logout')return reply({})
  if(path==='/rest/v1/profiles')return reply({display_name:'Operador sintético'})
  if(path==='/rest/v1/workshop_memberships'){const w=url.searchParams.get('workshop_id');const rows=members.filter(m=>!w||w==='eq.'+m.workshop_id);return reply(req.headers().accept?.includes('vnd.pgrst.object')?rows[0]??null:rows)}
  if(path==='/rest/v1/workshops'){const all=[oldWorkshop,...created?[{id:own,name:'Mi taller Full sintético',status:'active'}]:[]];const w=url.searchParams.get('id');const rows=all.filter(v=>!w||w.startsWith('in.')||w==='eq.'+v.id);return reply(req.headers().accept?.includes('vnd.pgrst.object')?rows[0]??null:rows)}
  if(path.startsWith('/rest/v1/rpc/'))assert.equal(req.method(),'POST')
  if(path==='/rest/v1/rpc/bt_creator_is_creator')return reply(true)
  if(path==='/rest/v1/rpc/bt_plan04_operations_status'){assert.ok([old,own].includes(args.p_workshop_id));return reply({workshopId:args.p_workshop_id,operationsEnabled:false,documentsEnabled:false})}
  if(path==='/rest/v1/rpc/bt_plan04_my_status'){
   const w=args.p_workshop_id;assert.ok(w===null||w===old||created&&w===own)
   if(w===null&&badPersonal)return reply({scope:'workshop',workshopId:old,effectivePlan:'full',personalPlan:'full',isLifetime:true,expiresAt:null})
   const plan=w===old?'basic':w===own?ownPlan:personal
   return reply({scope:w?'workshop':'personal',workshopId:w,effectivePlan:plan,personalPlan:personal,isLifetime:plan!=='basic'&&lifetime,expiresAt:plan!=='basic'&&!lifetime?expiry:null})
  }
  if(path==='/rest/v1/rpc/bt_plan04_create_workshop'){
   assert.deepEqual(Object.keys(args).sort(),['p_name','p_request_id']);assert.equal(args.p_name,'Mi taller Full sintético')
   if(!['plus','full'].includes(personal)||created)return reply({code:'42501'},403)
   created=true;ownPlan=personal;members.push({user_id:uid,workshop_id:own,role:'owner',status:'active'});mutations.push('create');return reply({workshopId:own})
  }
  if(path==='/rest/v1/rpc/bt_creator04_accounts')return reply([{userId:uid,email:user.email,displayName:'Operador sintético',personalPlan:personal,isLifetime:lifetime,expiresAt:expiry,workshopCount:created?1:0}])
  if(path==='/rest/v1/rpc/bt_creator_overview')return reply({workshops:[{...oldWorkshop,ownerEmail:'owner@invalid.test',effectivePlan:'basic',plan:'basic',state:'active',isLifetime:false,expiresAt:null,mechanics:0},...created?[{id:own,name:'Mi taller Full sintético',ownerEmail:user.email,effectivePlan:ownPlan,plan:ownPlan,state:'active',isLifetime:lifetime,expiresAt:expiry,mechanics:0}]:[]],recentEvents:[],billingEnabled:false,manualPlanEnforcementEnabled:true})
  if(path==='/rest/v1/rpc/bt_creator04_manage_account'){
   assert.equal(args.p_user_id,uid);assert.ok(args.p_request_id);assert.ok(args.p_reason.length>=5)
   personal=args.p_mode==='revoke'||args.p_mode==='basic'?'basic':args.p_plan;lifetime=args.p_mode==='lifetime';expiry=personal==='basic'||lifetime?null:new Date(Date.now()+args.p_days*86400000+(args.p_mode==='extend_days'?86400000:0)).toISOString();ownPlan=personal;mutations.push(args.p_mode);return reply({user_id:uid,plan:personal,state:personal==='basic'?'revoked':'active',is_lifetime:lifetime,expires_at:expiry})
  }
  if(['/rest/v1/customers','/rest/v1/vehicles','/rest/v1/work_orders','/rest/v1/inspection_findings'].includes(path)){assert.equal(req.method(),'GET');assert.ok([old,own].some(w=>url.searchParams.get('workshop_id')==='eq.'+w));return reply([])}
  unexpected.push(path);console.log('UNEXPECTED_SYNTHETIC_ENDPOINT',path);return route.abort()
 })
 await p.goto(base+'/#/acceso');await p.getByLabel('Correo electrónico',{exact:true}).fill(user.email);await p.getByLabel('Contraseña',{exact:true}).fill('synthetic-password');await p.getByRole('button',{name:'Ingresar',exact:true}).click();await p.locator('.app-shell').waitFor()
 const menu=async()=>{const pop=p.locator('.account-popover');if(!await pop.isVisible())await p.locator('.account-trigger').click();return pop}
 const nav=async(index)=>p.locator(width>760?'.side-nav button':'.bottom-nav button').nth(index).click()
 await nav(2);await p.getByRole('button',{name:'Nuevo cliente',exact:true}).click();await p.getByLabel('Nombre completo *').fill('Borrador exclusivo del taller Básico')
 await p.getByLabel('Nombre completo *').evaluate(el=>window.originalDraft=el)
 let m=await menu();await m.getByRole('region',{name:'Licencia personal y plan del taller'}).waitFor();assert.equal(await m.locator('[data-plan=full] [data-plan-icon=crown]').count(),1);assert.equal(await m.locator('[data-plan=basic]').count(),1)
 await m.getByRole('button',{name:'Mi cuenta personal',exact:true}).click();await p.locator('.personal-home:visible').getByRole('heading',{name:'Mi cuenta ByteTorque'}).waitFor()
 let home=p.locator('.personal-home:visible');await home.getByLabel('Nombre de mi taller').waitFor();assert.equal(await home.locator('header [data-plan=full] [data-plan-icon=crown]').count(),1)
 assert.match(await home.locator('header [data-plan=full]').evaluate(el=>getComputedStyle(el).backgroundImage),/255, 241, 191/);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:out+'/personal-full-'+width+'.png',fullPage:true})
 await home.getByRole('button',{name:'Volver al taller actual'}).click();assert.equal(await p.getByLabel('Nombre completo *').inputValue(),'Borrador exclusivo del taller Básico');assert.equal(await p.evaluate(()=>window.originalDraft?.isConnected),true)
 m=await menu();await m.getByRole('button',{name:'Mi cuenta personal',exact:true}).click();home=p.locator('.personal-home:visible');await home.getByLabel('Nombre de mi taller').fill('Mi taller Full sintético');await home.getByRole('button',{name:'Crear mi taller',exact:true}).click()
 await p.locator('.workshop-info').getByText('Mi taller Full sintético',{exact:true}).waitFor();await p.locator('.account-popover').waitFor({state:'hidden'})
 m=await menu();await m.locator('[data-plan=full]').first().waitFor();assert.equal(await m.locator('[data-plan=full]').count(),2);assert.equal(await p.evaluate(()=>window.originalDraft?.isConnected),false);assert.equal(members.length,2);assert.equal(JSON.stringify([oldWorkshop,oldSub,membership]),before)
 await p.screenshot({path:out+'/own-full-'+width+'.png',fullPage:true})
 await m.getByRole('button',{name:'Cambiar taller',exact:true}).click();await p.getByRole('button',{name:/Taller Básico existente/}).click();await p.locator('.app-shell').waitFor();m=await menu();await m.locator('[data-plan=basic]').waitFor();assert.equal(await m.locator('[data-plan=full]').count(),1)
 await m.getByRole('button',{name:'Panel del creador',exact:true}).click();await p.getByRole('heading',{name:'Suscripciones y talleres'}).waitFor()
 const people=p.getByRole('region',{name:'Planes por persona'});await people.locator('.creator-account-choice').click()
 for(const [mode,plan] of [['lifetime','plus'],['grant_days','full'],['extend_days','full'],['revoke','full']]){
  await people.getByRole('combobox').nth(0).selectOption(mode);if(mode!=='revoke')await people.getByRole('combobox').nth(1).selectOption(plan)
  await people.getByLabel('Motivo de la operación').fill('Cambio sintético confirmado '+mode);await people.getByRole('button',{name:'Confirmar beneficio personal',exact:true}).click()
  await p.waitForFunction(()=>{const button=document.querySelector('.creator-section[aria-label="Planes por persona"] .creator-submit');return button&&!button.disabled})
  const effective=mode==='revoke'?'basic':plan;await people.locator('.creator-account-choice [data-plan='+effective+']').waitFor();assert.equal(await people.locator('.creator-selected-account [data-plan='+effective+']').count(),1)
  if(effective==='plus'){await p.locator('.creator-section table [data-plan=plus]').waitFor();assert.match(await people.locator('.creator-account-choice [data-plan=plus]').evaluate(el=>getComputedStyle(el).backgroundImage),/6, 100, 230/);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await people.locator('[data-plan-icon=plus]').count(),2);await p.screenshot({path:out+'/creator-plus-'+width+'.png',fullPage:true})}
 }
 await p.getByRole('button',{name:'Volver al taller',exact:true}).click();m=await menu();await m.locator('[data-plan=basic]').first().waitFor();assert.equal(await m.locator('[data-plan=full]').count(),0)
 // Independent browser/device changes have no local invalidation event: visible polling re-queries the server.
 personal='plus';lifetime=true;expiry=null;ownPlan='plus';await m.locator('[data-plan=plus]').waitFor({timeout:8000});await m.getByRole('button',{name:'Mi cuenta personal',exact:true}).click();home=p.locator('.personal-home:visible');await home.locator('header [data-plan=plus]').waitFor();await p.screenshot({path:out+'/personal-plus-'+width+'.png',fullPage:true})
 badPersonal=true;await home.locator('header [data-plan=unknown]').waitFor({timeout:8000});await home.getByText('La creación de taller requiere Plus o Full vigente.',{exact:false}).waitFor();assert.equal(await home.getByRole('button',{name:'Crear mi taller',exact:true}).count(),0)
 assert.equal(JSON.stringify([oldWorkshop,oldSub,membership]),before);assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[])
 results.push({engine,width,status:'PASS',oldBasicUnchanged:true,memberships:members.length,serverMutationKinds:mutations,fullCrown:true,plusBlue:true,draftPreservedOnPersonalNavigation:true,tenantSwitchDisposesOldDraft:true,creatorChangesRequeried:true,externalChangesAutomaticallyRequeried:true,wrongScopeFailsClosed:true})
 await p.close();console.log('LIVE_PERSONAL_WORKSHOP_BROWSER_PASS',engine,width)
}
fs.writeFileSync(out+'/browser-results.json',JSON.stringify(results,null,2)+'\n')
}catch(e){const page=browser.contexts()[0]?.pages()[0];if(page){await page.screenshot({path:out+'/failure.png',fullPage:true});console.log(await page.locator('body').innerText())}throw e}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1})
