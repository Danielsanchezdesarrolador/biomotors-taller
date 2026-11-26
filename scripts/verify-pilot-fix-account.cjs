// LIVE-FIX-01: real React/SDK, synthetic intercepted HTTP only.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs')
const engine=process.env.BT_PILOT_BROWSER||'chromium'
assert.ok(['chromium','webkit'].includes(engine),'Unsupported browser engine')
const base=process.env.PILOT_ACCOUNT_URL||'http://127.0.0.1:5241',out=process.env.OUTPUT_DIR||'/tmp/bt-pilot-fix-evidence'
const api='https://suxcqqnmcjoezfxltoms.supabase.co',uid='00000000-0000-4000-8000-000000000002',old='00000000-0000-4000-8000-000000000011',own='00000000-0000-4000-8000-000000000012'
const jwt=()=>Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:uid,role:'authenticated',aud:'authenticated',aal:'aal2',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.'+Buffer.from('synthetic-test-signature').toString('base64url')
;(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{}:{...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});const results=[]
try{for(const width of [1440,390]){
 const p=await browser.newPage({viewport:{width,height:940},serviceWorkers:'block'}),errors=[],unexpected=[],mutations=[]
 const user={id:uid,aud:'authenticated',email:'live-personal@invalid.test',email_confirmed_at:'2026-11-26T00:00:00Z',user_metadata:{full_name:'Operador sintético'},factors:[]}
 let personal='full',lifetime=true,expiry=null,created=true,ownPlan='full',badPersonal=false
 const oldWorkshop={id:old,name:'Taller piloto Full · Sintético',status:'active'},oldSub={plan:'basic',state:'active'}
 const membership={user_id:uid,workshop_id:old,role:'admin',status:'active'},members=[membership,{user_id:uid,workshop_id:own,role:'owner',status:'active'}]
 const incoming='00000000-0000-4000-8000-000000000013';const mechanicId='00000000-0000-4000-8000-000000000088',invitationId='00000000-0000-4000-8000-000000000089'
 let activeMechanic=false,capacity=8,accepted=false;const teamMutations=[]
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
  if(path==='/rest/v1/workshops'){const all=[...(accepted?[{id:incoming,name:'Invitación sintética confirmada',status:'active'}]:[]),oldWorkshop,...created?[{id:own,name:'Mi taller Full sintético',status:'active'}]:[]];const w=url.searchParams.get('id');const rows=all.filter(v=>!w||w.startsWith('in.')||w==='eq.'+v.id);return reply(req.headers().accept?.includes('vnd.pgrst.object')?rows[0]??null:rows)}
  if(path.startsWith('/rest/v1/rpc/'))assert.equal(req.method(),'POST')
  if(path==='/rest/v1/rpc/bt_plan04_accept_pending'){assert.deepEqual(args,{p_invitation_id:invitationId});accepted=true;members.push({user_id:uid,workshop_id:incoming,role:'mechanic',status:'active'});return reply({workshopId:incoming})}
  if(path==='/rest/v1/rpc/bt_plan04_pending_invitations'){assert.deepEqual(args,{});return reply(accepted?[]:[{id:invitationId,workshopName:'Invitación sintética confirmada'}])}
  if(path==='/rest/v1/rpc/bt_plan04_team'){assert.equal(args.p_workshop_id,old);return reply({workshopId:old,active:activeMechanic?1:0,pending:0,capacity,overCapacity:activeMechanic&&capacity===0,members:[{id:mechanicId,name:'Mecánico sintético',status:activeMechanic?'active':'disabled'}],invites:[]})}
  if(path==='/rest/v1/rpc/bt_plan04_profile'){assert.equal(args.p_workshop_id,old);return reply({workshopId:old,name:'Taller sintético',email:'workshop@invalid.test',phone:'',address:'',logoPath:null})}
  if(path==='/rest/v1/rpc/bt_plan04_manage_mechanic'){assert.equal(args.p_workshop_id,old);assert.equal(args.p_target_id,mechanicId);assert.equal(args.p_email,null);assert.match(args.p_request_id,/^[0-9a-f-]{36}$/);assert.ok(['reactivate','disable'].includes(args.p_action));activeMechanic=args.p_action==='reactivate';teamMutations.push(args.p_action);return reply({id:mechanicId,action:args.p_action})}
  if(path==='/rest/v1/rpc/bt_creator_is_creator')return reply(true)
  if(path==='/rest/v1/rpc/bt_plan04_operations_status'){assert.ok([old,own,incoming].includes(args.p_workshop_id));return reply({workshopId:args.p_workshop_id,operationsEnabled:false,documentsEnabled:false})}
  if(path==='/rest/v1/rpc/bt_plan04_my_status'){
   const w=args.p_workshop_id;assert.ok(w===null||w===old||created&&w===own||accepted&&w===incoming)
   if(w===null&&badPersonal)return reply({scope:'workshop',workshopId:old,effectivePlan:'full',personalPlan:'full',isLifetime:true,expiresAt:null})
   const plan=w===old?'full':w===own?ownPlan:personal
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
  if(['/rest/v1/customers','/rest/v1/vehicles','/rest/v1/work_orders','/rest/v1/inspection_findings'].includes(path)){assert.equal(req.method(),'GET');assert.ok([old,own,incoming].some(w=>url.searchParams.get('workshop_id')==='eq.'+w));return reply([])}
  unexpected.push(path);console.log('UNEXPECTED_SYNTHETIC_ENDPOINT',path);return route.abort()
 })
 await p.goto(base+'/#/acceso');await p.getByLabel('Correo electrónico',{exact:true}).fill(user.email);await p.getByLabel('Contraseña',{exact:true}).fill('synthetic-password');await p.getByRole('button',{name:'Ingresar',exact:true}).click()
 await p.getByRole('button',{name:/Taller piloto Full/}).click();await p.locator('.app-shell').waitFor()
 const menu=async()=>{const pop=p.locator('.account-popover');if(!await pop.isVisible())await p.locator('.account-trigger').click();return pop}
 const nav=async(index)=>p.locator(width>760?'.side-nav button':'.bottom-nav button').nth(index).click()
 await nav(4);await p.getByRole('heading',{name:'Usuarios y permisos',exact:true}).waitFor()
 await p.getByRole('button',{name:'Reactivar mecánico',exact:true}).click();await p.getByRole('button',{name:'Desactivar mecánico',exact:true}).waitFor();assert.deepEqual(teamMutations,['reactivate'])
 await p.screenshot({path:out+'/settings-reactivated-'+width+'.png',fullPage:true})
 await p.reload();await p.getByRole('heading',{name:'Usuarios y permisos',exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:/Taller piloto Full/}).count(),0);await p.getByRole('button',{name:'Desactivar mecánico',exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'Desactivar mecánico',exact:true}).count(),1)
 await p.getByRole('button',{name:'Desactivar mecánico',exact:true}).click();await p.getByRole('button',{name:'Reactivar mecánico',exact:true}).waitFor()
 capacity=0;await p.reload();await p.getByRole('button',{name:'Reactivar mecánico',exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'Reactivar mecánico',exact:true}).isDisabled(),true)
 await p.getByRole('button',{name:'Volver al inicio',exact:true}).click();await p.locator('.official-panel').first().waitFor()
 let m=await menu();await m.getByRole('button',{name:'Mi cuenta personal',exact:true}).click();await p.getByRole('heading',{name:'Invitaciones a talleres',exact:true}).waitFor();await p.getByText('Invitación sintética confirmada',{exact:true}).waitFor()
 const storage=await p.evaluate(()=>JSON.stringify([Object.entries(localStorage),Object.entries(sessionStorage)]));assert.ok(!storage.includes('token=')&&!storage.includes(invitationId),'Pending continuity stores no invitation credential')
 await p.screenshot({path:out+'/pending-invitation-'+width+'.png',fullPage:true})
 await p.reload();await p.locator('.app-shell').waitFor();m=await menu();await m.getByRole('button',{name:'Mi cuenta personal',exact:true}).click();await p.getByRole('button',{name:'Aceptar invitación pendiente',exact:true}).click();await p.getByRole('heading',{name:'Tu espacio de trabajo técnico',exact:true}).waitFor();assert.equal(members.length,3);assert.equal(members.filter(x=>[old,own].includes(x.workshop_id)).length,2)
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[])
 results.push({width,status:'PASS',workshopAndScreenAfterReload:'server-revalidated',settingsReturn:'PASS',reactivation:'same member, confirmed RPC, capacity-aware',invitationContinuity:'confirmed server lookup; no browser token',existingMembershipsRetained:2,acceptedAfterReload:true});console.log('PILOT_ACCOUNT_CONTINUITY_PASS',width);await p.close()
}fs.writeFileSync(out+'/account-results.json',JSON.stringify(results,null,2))}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1})
