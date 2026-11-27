// Actual private React/SDK; synthetic authoritative HTTP, no real accounts/services.
const {chromium,webkit}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict')
const {navigateSection}=require('../tests/harness/navigation.cjs')
const engine=process.env.BT_COMMERCIAL_BROWSER||'chromium';assert.ok(['chromium','webkit'].includes(engine))
const base=process.env.BT_COMMERCIAL_URL||'http://127.0.0.1:5241',out=process.env.OUTPUT_DIR||'/tmp/bt-commercial-evidence';fs.mkdirSync(out,{recursive:true})
const api='https://suxcqqnmcjoezfxltoms.supabase.co',id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),uid=id(2),wid=id(11)
const jwt=()=>Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:uid,role:'authenticated',aud:'authenticated',aal:'aal1',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.'+Buffer.from('synthetic-signature').toString('base64url')
;(async()=>{const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{}:{...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});const results=[]
const cases=process.env.BT_COMMERCIAL_AGENDA==='off'?[['09_nav_sin_agenda','full',1440,'commercial',true],['10_nav_movil_sin_agenda','plus',390,'plan',true]]:[['01_full_escritorio','full',1440,'commercial',true],['02_equipo_full_escritorio','full',1440,'team',true],['03_plus_escritorio','plus',1440,'plan',true],['04_basico_escritorio','basic',1440,'commercial',false],['05_full_movil','full',390,'commercial',true],['06_basico_movil','basic',390,'commercial',false],['07_basico_acceso_limitado','basic',1440,'commercial',true],['08_beneficios_full','full',1440,'plan',true]]
try{for(const [name,plan,width,tab,owned] of cases.filter(c=>!process.env.BT_COMMERCIAL_CASES||process.env.BT_COMMERCIAL_CASES.split(',').includes(c[0]))){
 const p=await browser.newPage({viewport:{width,height:1000},serviceWorkers:'block'}),errors=[],unexpected=[],mutations=[];p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept())
 const user={id:uid,aud:'authenticated',email:'owner@invalid.test',email_confirmed_at:'2026-11-26T00:00:00Z',user_metadata:{full_name:'Propietario sintético'},factors:[]}
 let profile={workshopId:wid,name:'Taller sintético',email:'workshop@invalid.test',phone:'',address:'Santiago · datos sintéticos',logoPath:null}
 const members=[{id:id(81),name:'Mecánico sintético A',email:'mechanic-a@invalid.test',status:'active'},{id:id(82),name:'Mecánico sintético B',email:'mechanic-b@invalid.test',status:'active'},{id:id(83),name:'Mecánico sintético C',email:'mechanic-c@invalid.test',status:'disabled'}]
 const capacity=plan==='full'?4:plan==='plus'?2:0
 const status=()=>({workshopId:wid,plan,periodStart:'2026-11-23T03:00:00Z',periodEnd:'2026-11-30T03:00:00Z',customers:2,customerLimit:plan==='basic'?5:null,ownedWorkshops:owned?1:0,inspectionEnabled:plan!=='basic',logoUploadEnabled:false,emailServiceEnabled:false,usage:Object.fromEntries(['quote','email','multipunto'].map((k,i)=>[k,{used:plan==='plus'?[4,3,2][i]:plan==='basic'&&k==='quote'?1:0,reserved:0,limit:plan==='full'?null:plan==='plus'?10:k==='quote'?1:0}]))})
 await p.route('**/*',async route=>{const req=route.request(),url=new URL(req.url()),path=url.pathname;if(url.origin===new URL(base).origin)return route.continue();if(url.origin!==api){unexpected.push(url.origin);return route.abort()}
 const args=req.postData()?req.postDataJSON():{},reply=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)})
 if(path==='/auth/v1/token')return reply({access_token:jwt(),refresh_token:'synthetic',token_type:'bearer',expires_in:3600,user});if(path==='/auth/v1/user')return reply(user);if(path==='/auth/v1/logout')return reply({})
 if(path==='/rest/v1/profiles')return reply({display_name:'Propietario sintético'})
 if(path==='/rest/v1/workshop_memberships')return reply(req.headers().accept?.includes('vnd.pgrst.object')?{user_id:uid,workshop_id:wid,role:owned?'owner':'admin',status:'active'}:[{user_id:uid,workshop_id:wid,role:owned?'owner':'admin',status:'active'}])
 if(path==='/rest/v1/workshops')return reply(req.headers().accept?.includes('vnd.pgrst.object')?{id:wid,name:profile.name,status:'active'}:[{id:wid,name:profile.name,status:'active'}])
 if(path.startsWith('/rest/v1/rpc/')){
  assert.equal(req.method(),'POST');const rpc=path.split('/').pop()
  if(rpc==='bt_creator_is_creator')return reply(false)
  if(rpc==='bt_plan04_my_status'){assert.ok(args.p_workshop_id===null||args.p_workshop_id===wid);return reply({scope:args.p_workshop_id?'workshop':'personal',workshopId:args.p_workshop_id,effectivePlan:plan,personalPlan:plan,isLifetime:plan==='full',expiresAt:null})}
  if(rpc==='bt_commercial_own_workshop'){assert.deepEqual(args,{});return reply({personalPlan:{scope:'personal',workshopId:null,effectivePlan:plan,personalPlan:plan,isLifetime:plan==='full',expiresAt:null},workshop:owned?{id:wid,name:profile.name,status:'active'}:null,bound:owned,blockedByOwnership:owned,canCreate:!owned&&plan!=='basic'})}
  if(rpc==='bt_plan04_pending_invitations')return reply([])
  if(['bt_plan04_operations_status','bt_commercial_status','bt_plan04_team','bt_plan04_profile'].includes(rpc)){assert.deepEqual(args,{p_workshop_id:wid});if(rpc==='bt_plan04_operations_status')return reply({workshopId:wid,operationsEnabled:true,documentsEnabled:true,inspectionEnabled:plan!=='basic'});if(rpc==='bt_commercial_status')return reply(status());if(rpc==='bt_plan04_profile')return reply(profile);return reply({workshopId:wid,active:members.filter(m=>m.status==='active').length,pending:0,capacity,overCapacity:members.filter(m=>m.status==='active').length>capacity,members,invites:[]})}
  if(rpc==='bt_plan04_update_profile'){assert.equal(args.p_workshop_id,wid);profile={...profile,name:args.p_name,email:args.p_email,phone:args.p_phone,address:args.p_address};mutations.push('profile');return reply({workshopId:wid})}
  if(rpc==='bt_plan04_manage_mechanic'){assert.equal(args.p_workshop_id,wid);assert.ok(['disable','reactivate'].includes(args.p_action));const m=members.find(m=>m.id===args.p_target_id);assert.ok(m);m.status=args.p_action==='disable'?'disabled':'active';mutations.push(args.p_action);return reply({id:m.id,action:args.p_action})}
  if(['bt_final_archive_catalog'].includes(rpc))return reply([])
 }
 if(req.method()==='GET'&&['customers','vehicles','work_orders','inspection_findings','quotes','quote_items','quote_revisions','quote_events','quote_delivery_events','bt_flow_quote_approvals','bt_flow_execution_reports','bt_flow_visit_deliveries','bt_agenda_receipts'].includes(path.split('/').pop())){assert.equal(url.searchParams.get('workshop_id'),'eq.'+wid);return reply([])}
 unexpected.push(path);return route.abort()
 })
 try{
 await p.goto(base+'/#/acceso');await p.getByLabel('Correo electrónico',{exact:true}).fill(user.email);await p.getByLabel('Contraseña',{exact:true}).fill('synthetic-password');await p.getByRole('button',{name:'Ingresar',exact:true}).click();await p.locator('.app-shell').waitFor()
 await navigateSection(p,'mitaller');await p.getByRole('heading',{name:'Mi taller',exact:true}).waitFor();await p.getByLabel('Nombre comercial',{exact:true}).waitFor();await p.waitForFunction(()=>!document.querySelector('.commercial-profile-form input')?.disabled)
 const tabs={commercial:'Información comercial',team:'Mi equipo',plan:'Plan y beneficios',documents:'Documentos e identidad'}
 await p.getByRole('tab',{name:tabs[tab],exact:true}).click();if(tab==='plan')await p.getByRole('heading',{name:'Plan y beneficios',exact:true}).waitFor()
 if(!owned){await p.getByRole('heading',{name:'Conoce los planes ByteTorque',exact:true}).first().waitFor();assert.equal(await p.getByRole('button',{name:/Elegir|Contratar/}).count(),0);assert.equal(mutations.length,0)}
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow')
 await p.screenshot({path:out+'/'+name+'.png',fullPage:true})
 if(name==='01_full_escritorio'||name==='05_full_movil'){
  await p.getByLabel('Nombre comercial',{exact:true}).fill('Borrador comercial conservado')
  await p.getByRole('tab',{name:'Mi equipo',exact:true}).click();await p.getByRole('button',{name:'Desactivar mecánico',exact:true}).first().click();await p.getByRole('button',{name:'Reactivar mecánico',exact:true}).first().waitFor()
  await p.getByRole('tab',{name:'Información comercial',exact:true}).click();assert.equal(await p.getByLabel('Nombre comercial',{exact:true}).inputValue(),'Borrador comercial conservado')
  await navigateSection(p,'configuracion');await p.getByRole('heading',{name:'Configuración',exact:true}).waitFor();assert.equal(await p.getByRole('heading',{name:'Mi equipo',exact:true}).count(),0)
  await p.goBack();await p.getByRole('heading',{name:'Mi taller',exact:true}).waitFor();assert.equal(await p.getByLabel('Nombre comercial',{exact:true}).inputValue(),'Borrador comercial conservado')
  await p.getByRole('button',{name:'Guardar cambios',exact:true}).click();await p.getByText('Guardado correctamente.',{exact:true}).waitFor();assert.equal(profile.name,'Borrador comercial conservado')
  await p.reload();await p.getByRole('heading',{name:'Mi taller',exact:true}).waitFor();await p.waitForFunction(()=>!document.querySelector('.commercial-profile-form input')?.disabled);assert.equal(await p.getByLabel('Nombre comercial',{exact:true}).inputValue(),profile.name)
 }
 if(owned){await p.locator('.account-trigger').click();await p.locator('.account-popover').getByRole('button',{name:'Mi cuenta personal',exact:true}).click();await p.getByRole('button',{name:'Entrar a mi taller',exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'Crear mi taller',exact:true}).count(),0)}
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);results.push({name,plan,width,status:'PASS',owned,mutations,serverCounters:true,agenda:process.env.BT_COMMERCIAL_AGENDA||'on'});console.log('COMMERCIAL_BROWSER_PASS',name)
 }catch(e){await p.screenshot({path:out+'/failure-'+name+'.png',fullPage:true});console.error('DIAGNOSTIC',JSON.stringify({name,errors,unexpected,text:(await p.locator('body').innerText()).slice(-3500)}));throw e}finally{await p.close()}
}fs.writeFileSync(out+'/commercial-browser-'+(process.env.BT_COMMERCIAL_AGENDA||'on')+'.json',JSON.stringify(results,null,2))}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1})
