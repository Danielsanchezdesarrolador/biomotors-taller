// LIVE-FIX-01: real React/SDK, synthetic intercepted HTTP only.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const engine=process.env.BT_COMMERCIAL_BROWSER||'chromium'
assert.ok(['chromium','webkit'].includes(engine),'Unsupported browser engine')
const base=process.env.BT_COMMERCIAL_URL||'http://127.0.0.1:5241',out=process.env.OUTPUT_DIR||'/tmp/bt-commercial-evidence'
const api='https://suxcqqnmcjoezfxltoms.supabase.co',uid='00000000-0000-4000-8000-000000000002',old='00000000-0000-4000-8000-000000000011',own='00000000-0000-4000-8000-000000000012'
const jwt=()=>Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:uid,role:'authenticated',aud:'authenticated',aal:'aal2',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.'+Buffer.from('synthetic-test-signature').toString('base64url')
;(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{}:{...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});const results=[]
try{for(const [width,tier,mechanic,failedRead=false] of [[1440,'plus',false],[390,'full',false],[390,'basic',true],[1440,'full',false,true]]){
 const p=await browser.newPage({viewport:{width,height:940},serviceWorkers:'block'}),errors=[],unexpected=[],mutations=[]
 const user={id:uid,aud:'authenticated',email:'live-personal@invalid.test',email_confirmed_at:'2026-11-26T00:00:00Z',user_metadata:{full_name:'Operador sintético'},factors:[]}
 let ownReadFailed=failedRead;let personal=tier,lifetime=true,expiry=null,created=false,ownPlan='full',badPersonal=false
 const oldWorkshop={id:old,name:'Taller Básico existente · Sintético',status:'active'},oldSub={plan:'basic',state:'active'}
 const membership={user_id:uid,workshop_id:old,role:mechanic?'mechanic':'admin',status:'active'},members=[membership]
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
  if(path==='/rest/v1/rpc/bt_plan04_pending_invitations'){assert.deepEqual(args,{});return reply([])}
  if(path==='/rest/v1/rpc/bt_commercial_own_workshop'){assert.deepEqual(args,{});if(ownReadFailed)return reply({code:'SYNTHETIC_UNAVAILABLE'},503);return reply({personalPlan:{scope:'personal',workshopId:null,effectivePlan:personal,personalPlan:personal,isLifetime:lifetime,expiresAt:expiry},workshop:created?{id:own,name:'Mi taller Full sintético',status:'active'}:null,bound:created,blockedByOwnership:created,canCreate:!created&&personal!=='basic'})}
  if(path==='/rest/v1/rpc/bt_plan04_pending_invitations')return reply([])
  if(path==='/rest/v1/rpc/bt_creator_is_creator')return reply(true)
  if(path==='/rest/v1/rpc/bt_plan04_operations_status'){assert.ok([old,own].includes(args.p_workshop_id));return reply({workshopId:args.p_workshop_id,operationsEnabled:false,documentsEnabled:false})}
  if(path==='/rest/v1/rpc/bt_plan04_my_status'){
   const w=args.p_workshop_id;assert.ok(w===null||w===old||created&&w===own)
   if(w===null&&badPersonal)return reply({scope:'workshop',workshopId:old,effectivePlan:'full',personalPlan:'full',isLifetime:true,expiresAt:null})
   const plan=w===old?(mechanic?'full':'basic'):w===own?ownPlan:personal
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
  if(['/rest/v1/customers','/rest/v1/vehicles','/rest/v1/work_orders','/rest/v1/inspection_findings','/rest/v1/quotes','/rest/v1/quote_items','/rest/v1/quote_revisions','/rest/v1/bt_flow_quote_approvals','/rest/v1/bt_flow_execution_reports','/rest/v1/bt_flow_visit_deliveries','/rest/v1/bt_agenda_receipts'].includes(path)){assert.equal(req.method(),'GET');assert.ok([old,own].some(w=>url.searchParams.get('workshop_id')==='eq.'+w));return reply([])}
  unexpected.push(path);console.log('UNEXPECTED_SYNTHETIC_ENDPOINT',path);return route.abort()
 })
 await p.goto(base+'/#/acceso');await p.getByLabel('Correo electrónico',{exact:true}).fill(user.email);await p.getByLabel('Contraseña',{exact:true}).fill('synthetic-password');await p.getByRole('button',{name:'Ingresar',exact:true}).click()
 if(mechanic){await p.getByRole('heading',{name:'Tu espacio de trabajo técnico',exact:true}).waitFor();assert.equal(await p.locator('[data-screen="mitaller"]').count(),0);await p.locator('.auth-session-controls').getByRole('button',{name:'Mi cuenta personal',exact:true}).click();const home=p.locator('.personal-home:visible');await home.getByRole('heading',{name:'Mi cuenta ByteTorque',exact:true}).waitFor()
  await home.getByRole('heading',{name:'Conoce los planes ByteTorque',exact:true}).waitFor()
  for(const [name,seats,price] of [['Básico',0,'Gratis'],['Plus',2,'US$5'],['Full',4,'US$15']]){
   const card=home.getByRole('region',{name:'Plan '+name,exact:true});await card.waitFor();assert.equal(await card.count(),1)
   const content=await card.innerText();assert.ok(content.includes(price));assert.ok(content.includes(seats+' mecánicos incluidos · propietario fuera del cupo'))
  }
  assert.equal(await home.locator('.commercial-plan-grid > section').count(),3)
  assert.equal(await home.getByRole('button',{name:/^(Crear mi taller|Elegir.*|Contratar.*|Pagar.*)$/i}).count(),0)
  assert.equal(created,false);assert.deepEqual(mutations,[]);assert.equal(members.length,1);assert.equal(JSON.stringify([oldWorkshop,oldSub,membership]),before)
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}
 else{await p.locator('.app-shell').waitFor();await p.locator('.account-trigger').click();await p.locator('.account-popover').getByRole('button',{name:'Mi cuenta personal',exact:true}).click();if(failedRead){await p.getByRole('button',{name:'Reintentar consulta',exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'Crear mi taller',exact:true}).count(),0);assert.equal(created,false);ownReadFailed=false;await p.getByRole('button',{name:'Reintentar consulta',exact:true}).click()}await p.getByLabel('Nombre de mi taller',{exact:true}).fill('Mi taller Full sintético');await p.getByRole('button',{name:'Crear mi taller',exact:true}).click();await p.locator('.app-shell').waitFor();await p.waitForFunction(()=>document.querySelector('.workshop-info')?.textContent?.includes('Mi taller Full sintético'));assert.equal(members.length,2);assert.equal(JSON.stringify([oldWorkshop,oldSub,membership]),before);await p.locator('.account-trigger').click();await p.locator('.account-popover').getByRole('button',{name:'Mi cuenta personal',exact:true}).click();await p.getByRole('button',{name:'Entrar a mi taller',exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'Crear mi taller',exact:true}).count(),0)}
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);await p.screenshot({path:out+'/ownership-'+tier+'-'+(mechanic?'mechanic':failedRead?'retry':width)+'.png',fullPage:true});results.push({tier,width,mechanic,failedRead,status:'PASS',created,existingMembershipPreserved:true});console.log('COMMERCIAL_OWNERSHIP_PASS',tier,mechanic?'mechanic':failedRead?'retry':width);await p.close()
}fs.writeFileSync(out+'/ownership-results.json',JSON.stringify(results,null,2))}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1})
